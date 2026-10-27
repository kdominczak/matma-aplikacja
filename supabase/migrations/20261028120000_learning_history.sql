-- Historia odpowiedzi i „Pudełko porażek” dla uczniów w rankingu (synchronizacja między urządzeniami).
-- Wymaga migracji 20261027120000_ranking.sql (tabela profiles). Po tej migracji uruchom też
-- supabase/seed/question_keys.sql (generowany: `npm run db:keys`) – bez kluczy odpowiedzi serwer nie zapisze odpowiedzi.
--
-- Zasada bezpieczeństwa: klient wysyła tylko WYBRANĄ literę. O tym, czy odpowiedź jest poprawna,
-- decyduje serwer na podstawie tabeli question_keys – nie da się „zgłosić” poprawnej odpowiedzi bez jej wybrania.

-- ── Klucze odpowiedzi (z danych aplikacji) ──

create table public.question_keys (
  question_id text primary key check (question_id ~ '^[a-z0-9-]{2,40}$'),
  topic_id text not null check (topic_id ~ '^[a-z0-9-]{2,60}$'),
  difficulty text not null check (difficulty in ('podstawowy', 'sredni', 'zaawansowany')),
  correct text not null check (correct in ('A', 'B', 'C', 'D'))
);

-- ── Historia odpowiedzi ──

create table public.answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null references public.question_keys (question_id) on delete cascade,
  topic_id text not null,
  difficulty text not null,
  chosen text not null check (chosen in ('A', 'B', 'C', 'D')),
  correct boolean not null,
  source text not null check (source in ('test', 'daily', 'training', 'placement')),
  created_at timestamptz not null default now()
);

create index answers_user_time_idx on public.answers (user_id, created_at desc);
create index answers_user_topic_idx on public.answers (user_id, topic_id, difficulty);

-- ── Pudełko porażek: aktualne pomyłki (poprawna odpowiedź usuwa wpis) ──

create table public.mistakes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null references public.question_keys (question_id) on delete cascade,
  chosen text not null check (chosen in ('A', 'B', 'C', 'D')),
  wrong_count integer not null default 1 check (wrong_count between 1 and 1000),
  last_wrong date not null,
  primary key (user_id, question_id)
);

-- ── Uprawnienia: odczyt tylko własnych danych, zapis wyłącznie przez funkcje poniżej ──

alter table public.question_keys enable row level security;
alter table public.answers enable row level security;
alter table public.mistakes enable row level security;

revoke all on public.question_keys from anon, authenticated; -- klucze widzą tylko funkcje
revoke all on public.answers from anon, authenticated;
revoke all on public.mistakes from anon, authenticated;
grant select on public.answers to authenticated;
grant select on public.mistakes to authenticated;

create policy "Uczeń widzi własne odpowiedzi" on public.answers
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Uczeń widzi własne pomyłki" on public.mistakes
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── Zapis odpowiedzi z ukończonej sesji ──
-- p_answers: [{"q": "pot-p1", "c": "B"}, ...] – maks. 30 na wywołanie, w kolejności udzielania.
-- Pytania spoza question_keys (np. wygenerowane przez AI) są pomijane.

create or replace function public.record_answers(p_source text, p_answers jsonb)
returns table (recorded integer, beaten integer, skipped integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_day_start timestamptz := v_today::timestamp at time zone 'Europe/Warsaw';
  v_total integer;
  v_last timestamptz;
  v_daily integer;
  v_removed integer;
  r record;
begin
  recorded := 0;
  beaten := 0;
  skipped := 0;

  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  if p_source is null or p_source not in ('test', 'daily', 'training', 'placement') then
    raise exception 'Nieznane źródło odpowiedzi' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception 'Odpowiedzi muszą być tablicą' using errcode = '22023';
  end if;
  v_total := jsonb_array_length(p_answers);
  if v_total = 0 or v_total > 30 then
    raise exception 'Od 1 do 30 odpowiedzi na raz' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'Najpierw dołącz do rankingu' using errcode = 'MA003';
  end if;

  -- Limity jak w rankingu: jedna paczka na 3 s, maks. 600 odpowiedzi dziennie
  select max(created_at) into v_last from public.answers where user_id = v_uid;
  if v_last > now() - interval '3 seconds' then
    raise exception 'Zbyt częste zapisy' using errcode = 'MA001';
  end if;
  select count(*) into v_daily from public.answers where user_id = v_uid and created_at >= v_day_start;
  if v_daily + v_total > 600 then
    raise exception 'Dzienny limit odpowiedzi' using errcode = 'MA002';
  end if;

  for r in
    select
      a.value ->> 'q' as question_id,
      upper(a.value ->> 'c') as chosen,
      k.topic_id,
      k.difficulty,
      k.correct as key
    from jsonb_array_elements(p_answers) with ordinality as a (value, ord)
    left join public.question_keys k on k.question_id = a.value ->> 'q'
    order by a.ord
  loop
    if r.key is null or r.chosen is null or r.chosen not in ('A', 'B', 'C', 'D') then
      skipped := skipped + 1;
      continue;
    end if;

    insert into public.answers (user_id, question_id, topic_id, difficulty, chosen, correct, source)
    values (v_uid, r.question_id, r.topic_id, r.difficulty, r.chosen, r.chosen = r.key, p_source);
    recorded := recorded + 1;

    if r.chosen = r.key then
      delete from public.mistakes where user_id = v_uid and question_id = r.question_id;
      get diagnostics v_removed = row_count;
      beaten := beaten + v_removed;
    else
      insert into public.mistakes (user_id, question_id, chosen, wrong_count, last_wrong)
      values (v_uid, r.question_id, r.chosen, 1, v_today)
      on conflict (user_id, question_id) do update
        set chosen = excluded.chosen,
            wrong_count = least(public.mistakes.wrong_count + 1, 1000),
            last_wrong = excluded.last_wrong;
    end if;
  end loop;

  return next;
end;
$$;

-- ── Jednorazowe przeniesienie lokalnego Pudełka porażek (pierwsza synchronizacja na koncie) ──
-- p_mistakes: [{"q": "pot-p1", "c": "B", "n": 2, "d": "2026-10-20"}, ...] – maks. 300.

create or replace function public.import_mistakes(p_mistakes jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  if jsonb_typeof(p_mistakes) is distinct from 'array' or jsonb_array_length(p_mistakes) > 300 then
    raise exception 'Od 0 do 300 pomyłek na raz' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'Najpierw dołącz do rankingu' using errcode = 'MA003';
  end if;

  with input as (
    select
      m.value ->> 'q' as question_id,
      upper(m.value ->> 'c') as chosen,
      -- liczba pomyłek i data przycięte do sensownych wartości
      least(greatest(coalesce((m.value ->> 'n')::integer, 1), 1), 1000) as wrong_count,
      least(greatest(coalesce((m.value ->> 'd')::date, v_today), v_today - 730), v_today) as last_wrong
    from jsonb_array_elements(p_mistakes) as m (value)
    -- format sprawdzamy przed rzutowaniem (1–9 cyfr mieści się w integer), wartości przycina least/greatest wyżej
    where (m.value ->> 'n') ~ '^[0-9]{1,9}$' and (m.value ->> 'd') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  ),
  merged as (
    insert into public.mistakes (user_id, question_id, chosen, wrong_count, last_wrong)
    select distinct on (i.question_id) v_uid, i.question_id, i.chosen, i.wrong_count, i.last_wrong
    from input i
    join public.question_keys k on k.question_id = i.question_id
    where i.chosen in ('A', 'B', 'C', 'D')
    order by i.question_id, i.last_wrong desc
    on conflict (user_id, question_id) do update
      set wrong_count = greatest(public.mistakes.wrong_count, excluded.wrong_count),
          chosen = case when excluded.last_wrong >= public.mistakes.last_wrong then excluded.chosen else public.mistakes.chosen end,
          last_wrong = greatest(public.mistakes.last_wrong, excluded.last_wrong)
    returning 1
  )
  select count(*) into v_count from merged;
  return v_count;
end;
$$;

-- ── Skuteczność per dział i poziom (np. do doboru zadań na nowym urządzeniu) ──

create or replace function public.my_topic_stats()
returns table (topic_id text, difficulty text, answered bigint, correct bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select a.topic_id, a.difficulty, count(*), count(*) filter (where a.correct)
  from public.answers a
  where a.user_id = auth.uid()
  group by a.topic_id, a.difficulty;
$$;

-- ── Reset postępów z poziomu aplikacji: kasuje historię i pomyłki (profil w rankingu zostaje) ──

create or replace function public.reset_learning_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  delete from public.answers where user_id = auth.uid();
  delete from public.mistakes where user_id = auth.uid();
end;
$$;

revoke execute on function public.record_answers(text, jsonb) from public, anon;
revoke execute on function public.import_mistakes(jsonb) from public, anon;
revoke execute on function public.my_topic_stats() from public, anon;
revoke execute on function public.reset_learning_data() from public, anon;
grant execute on function public.record_answers(text, jsonb) to authenticated;
grant execute on function public.import_mistakes(jsonb) to authenticated;
grant execute on function public.my_topic_stats() to authenticated;
grant execute on function public.reset_learning_data() to authenticated;
