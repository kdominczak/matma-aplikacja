-- Ocena zadań otwartych ze zdjęcia (Premium): przepisanie kartki przez model z obrazami + ocena według schematu.
--
-- Osobny dzienny licznik, niezależny od wiadomości do korepetytora: arkusz to kilka zadań, a każde = 2 zapytania
-- (przepisanie, ocena). Liczymy osobno przepisania i oceny – inaczej funkcja byłaby darmowym OCR-em bez limitu.
-- Tylko Premium (premium_until_of); bez Premium consume_grading_quota odmawia (aplikacja pokazuje ekran Premium).
-- Funkcja serwerowa `ai` sama ustawia prompt i model dla tych zapytań, więc licznik oceny nie posłuży do czatu.
--
-- Plik jest idempotentny.

alter table public.ai_usage
  add column if not exists gradings integer not null default 0 check (gradings >= 0),
  add column if not exists transcriptions integer not null default 0 check (transcriptions >= 0);

-- ok. 15 zadań dziennie (zapas na ponowne zdjęcie); zmieniaj razem z GRADING_DAILY_LIMIT w src/lib/premium.ts
create or replace function public.ai_grading_daily_limit() returns integer language sql immutable as $$ select 30 $$;

create or replace function public.consume_grading_quota(p_kind text)
returns table (allowed boolean, remaining integer, premium boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_used integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  if p_kind is null or p_kind not in ('grade', 'transcribe') then
    raise exception 'Nieznany rodzaj zapytania' using errcode = '22023';
  end if;
  premium := coalesce(public.premium_until_of(v_uid) > now(), false);
  if not premium then
    allowed := false;
    remaining := 0;
    return next;
    return;
  end if;

  insert into public.ai_usage (user_id, day, messages) values (v_uid, v_today, 0)
  on conflict (user_id, day) do nothing;
  select case when p_kind = 'grade' then u.gradings else u.transcriptions end into v_used
  from public.ai_usage u where u.user_id = v_uid and u.day = v_today for update;

  if v_used >= public.ai_grading_daily_limit() then
    allowed := false;
    remaining := 0;
    return next;
    return;
  end if;
  if p_kind = 'grade' then
    update public.ai_usage set gradings = gradings + 1 where user_id = v_uid and day = v_today;
  else
    update public.ai_usage set transcriptions = transcriptions + 1 where user_id = v_uid and day = v_today;
  end if;
  allowed := true;
  remaining := public.ai_grading_daily_limit() - v_used - 1;
  return next;
end;
$$;

revoke all on function public.consume_grading_quota(text) from public, anon;
grant execute on function public.consume_grading_quota(text) to authenticated;

-- zwrot po błędzie Groq (jak refund_ai_quota) – tylko serwer
create or replace function public.refund_grading_quota(p_user uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
begin
  if p_kind = 'grade' then
    update public.ai_usage set gradings = gradings - 1 where user_id = p_user and day = v_today and gradings > 0;
  elsif p_kind = 'transcribe' then
    update public.ai_usage set transcriptions = transcriptions - 1 where user_id = p_user and day = v_today and transcriptions > 0;
  end if;
end;
$$;

revoke all on function public.refund_grading_quota(uuid, text) from public, anon, authenticated;
grant execute on function public.refund_grading_quota(uuid, text) to service_role;

-- account_status z licznikiem ocen (nowe kolumny w wyniku = drop + create; starsze aplikacje ignorują nowe pola)
drop function if exists public.account_status();
create function public.account_status()
returns table (
  premium_until timestamptz,
  ai_used integer,
  ai_limit integer,
  referral_code text,
  referral_count integer,
  grading_used integer,
  grading_limit integer
)
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
  select coalesce(u.messages, 0), coalesce(u.gradings, 0) into ai_used, grading_used
  from (select 1) one left join public.ai_usage u on u.user_id = v_uid and u.day = v_today;
  ai_limit := case when premium_until > now() then public.ai_premium_daily_limit() else public.ai_free_daily_limit() end;
  grading_limit := case when premium_until > now() then public.ai_grading_daily_limit() else 0 end;
  select c.code into referral_code from public.referral_codes c where c.user_id = v_uid;
  select count(*) into referral_count from public.referrals r where r.referrer_id = v_uid;
  return next;
end;
$$;

revoke all on function public.account_status() from public, anon;
grant execute on function public.account_status() to authenticated;
