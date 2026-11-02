-- AI, ocena zdjęć i kody poleceń tylko dla kont z e-mailem albo Google (nie anonimowych).
--
-- Konto anonimowe da się założyć samym publicznym kluczem aplikacji, więc skrypt mógł tworzyć kolejne konta
-- i na każdym brać darmowe wiadomości do AI albo 2 dni Premium z cudzego kodu polecenia (koszt: nasz klucz Groq).
-- Od tej migracji consume_ai_quota, consume_grading_quota, my_referral_code i redeem_referral odmawiają kontom
-- anonimowym błędem MA030 (funkcja `ai` zamienia go na 403 `account_required`, aplikacja pokazuje logowanie).
-- Ranking (jedyne inne zastosowanie kont anonimowych) zniknął z aplikacji; po wydaniu wersji bez niego wyłącz
-- w Supabase: Authentication → Sign In / Providers → „Allow anonymous sign-ins”.
--
-- Treść funkcji jak w poprzednich migracjach (20261107120000 – consume_ai_quota, 20261108120000 –
-- consume_grading_quota, 20261102120000 – kody poleceń) + jedno sprawdzenie konta. Plik jest idempotentny.

create or replace function public.require_full_account(p_user uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from auth.users u where u.id = p_user and not coalesce(u.is_anonymous, true)) then
    raise exception 'Ta funkcja wymaga konta z e-mailem albo Google' using errcode = 'MA030';
  end if;
end;
$$;

revoke all on function public.require_full_account(uuid) from public, anon, authenticated;

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
  perform public.require_full_account(v_uid);
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

revoke all on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;

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
  perform public.require_full_account(v_uid);
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
  perform public.require_full_account(v_uid);
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
  perform public.require_full_account(v_uid);

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
