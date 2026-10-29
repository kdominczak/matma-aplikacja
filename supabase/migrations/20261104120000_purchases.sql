-- Zakupy Premium (RevenueCat → funkcja serwerowa `revenuecat` → set_purchase_premium).
--
-- Dwa źródła Premium w entitlements, bo działają inaczej:
--   premium_until  – dni z poleceń/admina: sumują się (grant_premium), nikt ich nie odbiera,
--   purchase_until – data końca z ostatniego zakupu wg sklepu: NADPISYWANA przy każdym zdarzeniu
--                    (odnowienie przesuwa ją dalej, zwrot/wygaśnięcie cofa), nigdy nie dodawana.
-- Premium działa do greatest(premium_until, purchase_until) – greatest() pomija null.
--
-- Funkcja `revenuecat` po każdym webhooku pyta API RevenueCat o aktualny stan klienta i zapisuje wynik,
-- więc kolejność i duplikaty zdarzeń nie mają znaczenia. Woła tylko serwer kluczem service_role.
--
-- Plik jest idempotentny (IF NOT EXISTS, CREATE OR REPLACE) – ponowne uruchomienie w SQL Editorze niczego nie psuje.

alter table public.entitlements
  alter column premium_until drop not null,
  add column if not exists purchase_until timestamptz,
  add column if not exists purchase_product text;

-- dziennik zdarzeń zakupowych (do wyjaśniania reklamacji; uczeń go nie widzi)
create table if not exists public.purchase_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  product text,
  purchase_until timestamptz,
  received_at timestamptz not null default now()
);

create index if not exists purchase_events_user_idx on public.purchase_events (user_id, received_at desc);
alter table public.purchase_events enable row level security;
revoke all on public.purchase_events from anon, authenticated;

-- Koniec Premium z obu źródeł (null = nigdy nie miał).
create or replace function public.premium_until_of(p_user uuid)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(e.premium_until, e.purchase_until) from public.entitlements e where e.user_id = p_user
$$;

revoke all on function public.premium_until_of(uuid) from public, anon, authenticated;

-- Stan zakupu wg sklepu. p_until null albo w przeszłości = brak aktywnego zakupu (zwrot, wygaśnięcie).
create or replace function public.set_purchase_premium(p_user uuid, p_until timestamptz, p_product text, p_event text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.entitlements (user_id, premium_until, purchase_until, purchase_product)
  values (p_user, null, p_until, p_product)
  on conflict (user_id) do update
    set purchase_until = excluded.purchase_until,
        purchase_product = excluded.purchase_product,
        updated_at = now();
  insert into public.purchase_events (user_id, event_type, product, purchase_until) values (p_user, p_event, p_product, p_until);
  return public.premium_until_of(p_user);
end;
$$;

revoke all on function public.set_purchase_premium(uuid, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.set_purchase_premium(uuid, timestamptz, text, text) to service_role;

-- account_status i consume_ai_quota liczą Premium z obu źródeł (sygnatury bez zmian).
-- drop przed create: przy powtórce migracji po 20261108 (account_status ma tam więcej kolumn) samo
-- CREATE OR REPLACE by się wywróciło; nowsza migracja i tak odtworzy pełną wersję.

drop function if exists public.account_status();
create function public.account_status()
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
  premium_until := public.premium_until_of(v_uid);
  select coalesce((select u.messages from public.ai_usage u where u.user_id = v_uid and u.day = v_today), 0) into ai_used;
  ai_limit := case when premium_until > now() then public.ai_premium_daily_limit() else public.ai_free_daily_limit() end;
  select c.code into referral_code from public.referral_codes c where c.user_id = v_uid;
  select count(*) into referral_count from public.referrals r where r.referrer_id = v_uid;
  return next;
end;
$$;

revoke all on function public.account_status() from public, anon;
grant execute on function public.account_status() to authenticated;

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
  premium := coalesce(public.premium_until_of(v_uid) > now(), false);
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
