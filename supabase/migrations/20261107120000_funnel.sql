-- Lejek Premium: ile kont dziennie przechodzi kolejne kroki (raport: supabase/admin/lejek.sql).
--
-- Zapisujemy tylko „konto X zrobiło krok Y w dniu Z” – bez treści, bez urządzenia, raz na konto, krok i dzień.
-- Kroki:
--   ai_limit      – wyczerpany dzienny limit AI (zapisuje serwer w consume_ai_quota, nie da się pominąć),
--   premium_view  – otwarty ekran Premium,
--   email_gate    – próba zakupu bez e-maila (pokazany formularz logowania),
--   buy_start     – dotknięty „Kup” (otwarte okno Google Play).
-- Zakupy i polecenia raport bierze z purchase_events i referrals. Aplikacja zgłasza kroki tylko z istniejącym
-- kontem (nie zakłada kont dla statystyk). Wpisy starsze niż 180 dni są usuwane.
--
-- Plik jest idempotentny.

create table if not exists public.funnel_events (
  day date not null,
  event text not null check (event in ('ai_limit', 'premium_view', 'email_gate', 'buy_start')),
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (day, event, user_id)
);

create index if not exists funnel_events_user_idx on public.funnel_events (user_id);
alter table public.funnel_events enable row level security;
revoke all on public.funnel_events from anon, authenticated;

-- Wewnętrzne: zapis kroku (bez uprawnień dla klienta).
create or replace function public.funnel_note(p_user uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
begin
  insert into public.funnel_events (day, event, user_id) values (v_today, p_event, p_user)
  on conflict do nothing;
  -- sprzątanie po drodze (rzadko – klucz zaczyna się od dnia, więc usuwanie zakresu jest tanie)
  if random() < 0.01 then
    delete from public.funnel_events where day < v_today - 180;
  end if;
end;
$$;

revoke all on function public.funnel_note(uuid, text) from public, anon, authenticated;

-- Kroki zgłaszane przez aplikację (ai_limit tylko serwer).
create or replace function public.track_funnel(p_event text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  if p_event is null or p_event not in ('premium_view', 'email_gate', 'buy_start') then
    raise exception 'Nieznany krok lejka' using errcode = '22023';
  end if;
  perform public.funnel_note(v_uid, p_event);
end;
$$;

revoke all on function public.track_funnel(text) from public, anon;
grant execute on function public.track_funnel(text) to authenticated;

-- consume_ai_quota jak w 20261104120000 + zapis kroku ai_limit przy odmowie
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
    perform public.funnel_note(v_uid, 'ai_limit');
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
