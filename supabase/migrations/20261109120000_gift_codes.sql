-- Kody podarunkowe i z przedsprzedaży: X dni Premium za wpisanie kodu.
-- Zasada jak przy poleceniach: wszystko liczy serwer, klient tylko woła redeem_gift_code().
--
-- Kod: 12 znaków z alfabetu bez mylących znaków (jak kody poleceń: bez 0/O/1/I), pokazywany jako XXXX-XXXX-XXXX.
-- W bazie leży tylko skrót SHA-256 – wyciek tabeli nie ujawnia działających kodów. Jawne kody zwraca raz
-- create_gift_codes() (tylko service_role / SQL Editor) – trzeba je wtedy zapisać (CSV dla sklepu, szkoły).
--
-- Każda partia ma własne `days` i `max_uses`: 1 = kod jednorazowy (zakup), np. 30 = jeden kod dla klasy.
-- Jedno konto wykorzystuje dany kod raz. Zgadywanie: 32^12 ≈ 10^18 kombinacji, a dodatkowo najwyżej
-- 10 nieudanych prób na godzinę na konto.
--
-- Błędy zwracane w kolumnie `error` (nie wyjątkiem – nieudana próba musi zostać zapisana do limitu prób):
-- MA021 nie ma takiego kodu, MA022 kod wygasł, MA023 kod już wpisany na tym koncie, MA024 za dużo prób,
-- MA025 kod wykorzystany (wszystkie użycia). Migrację można powtórzyć (if not exists, create or replace).

alter table public.premium_grants drop constraint if exists premium_grants_source_check;
alter table public.premium_grants
  add constraint premium_grants_source_check check (source in ('referral', 'referred', 'purchase', 'admin', 'gift'));

create table if not exists public.gift_codes (
  code_hash text primary key check (code_hash ~ '^[0-9a-f]{64}$'),
  campaign text not null check (length(campaign) between 1 and 80),
  days integer not null check (days between 1 and 400),
  max_uses integer not null default 1 check (max_uses between 1 and 10000),
  uses integer not null default 0 check (uses >= 0),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  check (uses <= max_uses)
);

create table if not exists public.gift_redemptions (
  code_hash text not null references public.gift_codes (code_hash) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code_hash, user_id)
);

create index if not exists gift_redemptions_user_idx on public.gift_redemptions (user_id);

-- nieudane próby (limit zgadywania); starsze niż godzina usuwa sama funkcja
create table if not exists public.gift_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);

create index if not exists gift_attempts_user_idx on public.gift_attempts (user_id, at);

alter table public.gift_codes enable row level security;
alter table public.gift_redemptions enable row level security;
alter table public.gift_attempts enable row level security;

revoke all on public.gift_codes, public.gift_redemptions, public.gift_attempts from anon, authenticated;

-- ── Skrót kodu (ta sama normalizacja co w aplikacji: wielkie litery, bez spacji i myślników) ──

create or replace function public.gift_code_hash(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex')
$$;

revoke all on function public.gift_code_hash(text) from public, anon, authenticated;

-- ── Wpisanie kodu ──

create or replace function public.redeem_gift_code(p_code text)
returns table (premium_until timestamptz, days integer, error text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_hash text;
  v_gift public.gift_codes%rowtype;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;

  delete from public.gift_attempts a where a.user_id = v_uid and a.at < now() - interval '1 hour';
  if (select count(*) from public.gift_attempts a where a.user_id = v_uid) >= 10 then
    error := 'MA024';
    return next;
    return;
  end if;

  v_hash := public.gift_code_hash(v_code);
  -- for update: dwa urządzenia naraz nie wykorzystają ostatniego użycia dwa razy
  select * into v_gift from public.gift_codes g where g.code_hash = v_hash for update;
  if v_code !~ '^[A-HJ-NP-Z2-9]{12}$' or v_gift.code_hash is null then
    insert into public.gift_attempts (user_id) values (v_uid);
    error := 'MA021';
    return next;
    return;
  end if;
  if v_gift.valid_until is not null and v_gift.valid_until < now() then
    error := 'MA022';
    return next;
    return;
  end if;
  if exists (select 1 from public.gift_redemptions r where r.code_hash = v_hash and r.user_id = v_uid) then
    error := 'MA023';
    return next;
    return;
  end if;
  if v_gift.uses >= v_gift.max_uses then
    error := 'MA025';
    return next;
    return;
  end if;

  insert into public.gift_redemptions (code_hash, user_id) values (v_hash, v_uid);
  update public.gift_codes g set uses = g.uses + 1 where g.code_hash = v_hash;
  days := v_gift.days;
  premium_until := public.grant_premium(v_uid, v_gift.days, 'gift');
  return next;
end;
$$;

revoke all on function public.redeem_gift_code(text) from public, anon;
grant execute on function public.redeem_gift_code(text) to authenticated;

-- ── Tworzenie partii kodów (tylko service_role / SQL Editor) ──
-- Losowość z gen_random_uuid() (kryptograficzna): 13 w pełni losowych bajtów UUID (bez bajtów wersji i wariantu),
-- bajt % 32 – 256 dzieli się przez 32, więc bez przekłamania rozkładu.

create or replace function public.create_gift_codes(
  p_count integer,
  p_days integer,
  p_campaign text,
  p_max_uses integer default 1,
  p_valid_until timestamptz default null
)
returns setof text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
  v_made integer := 0;
  v_positions constant integer[] := array[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14];
  i integer;
begin
  if p_count not between 1 and 5000 then
    raise exception 'Liczba kodów: 1–5000';
  end if;
  while v_made < p_count loop
    v_bytes := uuid_send(gen_random_uuid());
    v_code := '';
    foreach i in array v_positions loop
      v_code := v_code || substr(v_alphabet, get_byte(v_bytes, i) % 32 + 1, 1);
    end loop;
    begin
      insert into public.gift_codes (code_hash, campaign, days, max_uses, valid_until)
      values (public.gift_code_hash(v_code), p_campaign, p_days, p_max_uses, p_valid_until);
    exception when unique_violation then
      continue; -- praktycznie niemożliwe, ale wtedy po prostu losujemy jeszcze raz
    end;
    v_made := v_made + 1;
    return next substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4);
  end loop;
end;
$$;

revoke all on function public.create_gift_codes(integer, integer, text, integer, timestamptz) from public, anon, authenticated;
grant execute on function public.create_gift_codes(integer, integer, text, integer, timestamptz) to service_role;
