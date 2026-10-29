-- Premium, dzienny limit AI i kody poleceń.
-- Zasada jak przy record_answers(): o Premium i limitach decyduje serwer. Klient tylko czyta swój stan
-- (account_status) i woła funkcje – nie ma prawa zapisu do żadnej z tych tabel.
--
-- Premium = premium_until w przyszłości. Każde nadanie (polecenie, a później zakup przez webhook RevenueCat)
-- przedłuża od max(teraz, premium_until), więc dni się sumują.
--
-- Kody poleceń: polecony (konto młodsze niż 7 dni, raz w życiu konta) dostaje 2 dni od razu.
-- Polecający dostaje 2 dni za każde polecenie, ale najwyżej 5 razy w sezonie maturalnym (od 1 września)
-- i 2 razy dziennie – anonimowe konto zakłada się jednym kliknięciem, więc bez limitów jedna osoba
-- „poleciłaby” sama siebie dowolnie wiele razy. Limit ogranicza nadużycie do 10 dni na osobę.

-- ── Premium ──

create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  premium_until timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.premium_grants (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('referral', 'referred', 'purchase', 'admin')),
  days integer not null check (days between 1 and 400),
  granted_at timestamptz not null default now()
);

create index premium_grants_user_idx on public.premium_grants (user_id, granted_at desc);

-- ── Dzienny licznik AI (dzień według czasu polskiego) ──

create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  messages integer not null default 0 check (messages >= 0),
  primary key (user_id, day)
);

-- ── Kody poleceń ──

create table public.referral_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  created_at timestamptz not null default now()
);

create table public.referrals (
  referee_id uuid primary key references auth.users (id) on delete cascade,
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referrer_rewarded boolean not null,
  created_at timestamptz not null default now(),
  check (referee_id <> referrer_id)
);

create index referrals_referrer_idx on public.referrals (referrer_id, created_at desc);

-- ── Uprawnienia: wszystko tylko przez funkcje ──

alter table public.entitlements enable row level security;
alter table public.premium_grants enable row level security;
alter table public.ai_usage enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

revoke all on public.entitlements, public.premium_grants, public.ai_usage, public.referral_codes, public.referrals
  from anon, authenticated;

-- ── Stałe (w jednym miejscu – aplikacja pokazuje te same liczby z account_status) ──

create or replace function public.ai_free_daily_limit() returns integer language sql immutable as $$ select 5 $$;
-- Premium też ma pułap techniczny: chroni budżet przed skryptem, nie przeszkadza uczniowi
create or replace function public.ai_premium_daily_limit() returns integer language sql immutable as $$ select 200 $$;

-- ── Nadanie Premium (wewnętrzne – bez uprawnień dla klienta) ──

create or replace function public.grant_premium(p_user uuid, p_days integer, p_source text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_until timestamptz;
begin
  insert into public.premium_grants (user_id, source, days) values (p_user, p_source, p_days);
  insert into public.entitlements (user_id, premium_until)
  values (p_user, now() + make_interval(days => p_days))
  on conflict (user_id) do update
    set premium_until = greatest(public.entitlements.premium_until, now()) + make_interval(days => p_days),
        updated_at = now()
  returning premium_until into v_until;
  return v_until;
end;
$$;

revoke all on function public.grant_premium(uuid, integer, text) from public, anon, authenticated;

-- ── Stan konta dla aplikacji ──

create or replace function public.account_status()
returns table (premium_until timestamptz, ai_used integer, ai_limit integer, referral_code text, referral_count integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  select e.premium_until into premium_until from public.entitlements e where e.user_id = v_uid;
  select coalesce((select u.messages from public.ai_usage u where u.user_id = v_uid and u.day = v_today), 0) into ai_used;
  ai_limit := case when premium_until > now() then public.ai_premium_daily_limit() else public.ai_free_daily_limit() end;
  select c.code into referral_code from public.referral_codes c where c.user_id = v_uid;
  select count(*) into referral_count from public.referrals r where r.referrer_id = v_uid;
  return next;
end;
$$;

revoke all on function public.account_status() from public, anon;
grant execute on function public.account_status() to authenticated;

-- ── Zużycie jednej wiadomości AI (woła funkcja serwerowa `ai` z tokenem ucznia) ──

create or replace function public.consume_ai_quota()
returns table (allowed boolean, remaining integer, premium boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_limit integer;
  v_used integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  premium := exists (select 1 from public.entitlements e where e.user_id = v_uid and e.premium_until > now());
  v_limit := case when premium then public.ai_premium_daily_limit() else public.ai_free_daily_limit() end;

  -- atomowo: wiersz dnia blokuje się na czas zwiększenia, dwa równoległe zapytania nie przekroczą limitu
  insert into public.ai_usage (user_id, day, messages) values (v_uid, v_today, 0)
  on conflict (user_id, day) do nothing;
  select u.messages into v_used from public.ai_usage u where u.user_id = v_uid and u.day = v_today for update;

  if v_used >= v_limit then
    allowed := false;
    remaining := 0;
    return next;
    return;
  end if;
  update public.ai_usage set messages = messages + 1 where user_id = v_uid and day = v_today;
  allowed := true;
  remaining := v_limit - v_used - 1;
  return next;
end;
$$;

revoke all on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;

-- ── Własny kod polecenia (tworzony przy pierwszym wywołaniu) ──

create or replace function public.my_referral_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- bez 0/O i 1/I – łatwe do przepisania
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  select c.code into v_code from public.referral_codes c where c.user_id = v_uid;
  if v_code is not null then
    return v_code;
  end if;
  loop
    select string_agg(substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::integer, 1), '')
      into v_code from generate_series(1, 6);
    begin
      insert into public.referral_codes (user_id, code) values (v_uid, v_code);
      return v_code;
    exception when unique_violation then
      -- kolizja kodu (albo równoległe wywołanie tego samego ucznia) – sprawdź jeszcze raz
      select c.code into v_code from public.referral_codes c where c.user_id = v_uid;
      if v_code is not null then
        return v_code;
      end if;
    end;
  end loop;
end;
$$;

revoke all on function public.my_referral_code() from public, anon;
grant execute on function public.my_referral_code() to authenticated;

-- ── Wpisanie kodu znajomego ──
-- Błędy (kod w aplikacji tłumaczy je na polski): MA010 brak kodu, MA011 własny kod, MA012 kod już wpisany,
-- MA013 konto starsze niż 7 dni.

create or replace function public.redeem_referral(p_code text)
returns table (premium_until timestamptz, days integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_referrer uuid;
  v_created timestamptz;
  v_season_start date;
  v_season_rewards integer;
  v_today_rewards integer;
  v_reward boolean;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;

  select c.user_id into v_referrer from public.referral_codes c where c.code = v_code;
  if v_referrer is null then
    raise exception 'Nie ma takiego kodu' using errcode = 'MA010';
  end if;
  if v_referrer = v_uid then
    raise exception 'To Twój własny kod' using errcode = 'MA011';
  end if;
  if exists (select 1 from public.referrals r where r.referee_id = v_uid) then
    raise exception 'Kod polecenia już wpisany' using errcode = 'MA012';
  end if;
  select u.created_at into v_created from auth.users u where u.id = v_uid;
  if v_created is null or v_created < now() - interval '7 days' then
    raise exception 'Kod działa w pierwszym tygodniu konta' using errcode = 'MA013';
  end if;

  -- sezon maturalny od 1 września (czas polski)
  v_season_start := make_date(
    extract(year from (now() at time zone 'Europe/Warsaw'))::integer
      - case when extract(month from (now() at time zone 'Europe/Warsaw')) < 9 then 1 else 0 end,
    9, 1);
  select count(*) into v_season_rewards from public.referrals r
    where r.referrer_id = v_referrer and r.referrer_rewarded
      and r.created_at >= v_season_start::timestamp at time zone 'Europe/Warsaw';
  select count(*) into v_today_rewards from public.referrals r
    where r.referrer_id = v_referrer and r.referrer_rewarded
      and r.created_at >= (now() at time zone 'Europe/Warsaw')::date::timestamp at time zone 'Europe/Warsaw';
  v_reward := v_season_rewards < 5 and v_today_rewards < 2;

  insert into public.referrals (referee_id, referrer_id, referrer_rewarded) values (v_uid, v_referrer, v_reward);
  if v_reward then
    perform public.grant_premium(v_referrer, 2, 'referral');
  end if;
  days := 2;
  premium_until := public.grant_premium(v_uid, 2, 'referred');
  return next;
end;
$$;

revoke all on function public.redeem_referral(text) from public, anon;
grant execute on function public.redeem_referral(text) to authenticated;
