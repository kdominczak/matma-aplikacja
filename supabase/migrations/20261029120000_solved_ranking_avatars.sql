-- Ranking bez XP: liczy się liczba POPRAWNIE rozwiązanych zadań – policzona przez serwer z historii odpowiedzi
-- (record_answers sam ocenia każdą odpowiedź), więc nie da się jej „zgłosić” z aplikacji. Do tego zdjęcia profilowe.
-- Wymaga migracji 20261027120000_ranking.sql i 20261028120000_learning_history.sql (+ seed question_keys.sql).

-- ── Koniec XP: zapis przez record_activity() i dziennik xp_events nie są już używane ──

drop function if exists public.record_activity(integer);
drop table if exists public.xp_events;
alter table public.profiles drop column if exists xp;

-- ── Zdjęcie profilowe: plik avatars/<id>.jpg w Storage, wersja w profilu (odświeża podgląd po zmianie) ──

alter table public.profiles
  add column if not exists avatar_version integer check (avatar_version > 0);

grant update (nick, avatar_version) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 262144, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uczeń może wgrać, nadpisać i usunąć wyłącznie plik o nazwie swojego id. Odczyt jest publiczny (ranking).
create policy "Avatary: własne zdjęcie (odczyt do nadpisania)" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatary: własne zdjęcie (dodanie)" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatary: własne zdjęcie (zmiana)" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg')
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatary: własne zdjęcie (usunięcie)" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');

-- ── record_answers: to samo co wcześniej + seria dni (dzień z zapisanymi odpowiedziami = dzień nauki) ──

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

  -- Limity: jedna paczka na 3 s, maks. 600 odpowiedzi dziennie
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

  -- Seria: dziś już liczone → bez zmian; wczoraj → +1; dawniej → od nowa. Zmiana profilu odświeża ranking na żywo.
  if recorded > 0 then
    update public.profiles p
    set streak = s.streak,
        best_streak = greatest(p.best_streak, s.streak),
        last_active = v_today,
        updated_at = now()
    from (
      select case
        when last_active = v_today then streak
        when last_active = v_today - 1 then streak + 1
        else 1
      end as streak
      from public.profiles where id = v_uid
    ) s
    where p.id = v_uid;
  end if;

  return next;
end;
$$;

-- ── Ranking: poprawnie rozwiązane zadania (tydzień od poniedziałku w czasie polskim albo cały czas) ──
-- Pytający zawsze jest w wynikach – także z zerem, żeby widział swoje miejsce.

drop function if exists public.leaderboard(text, integer);

create function public.leaderboard(p_period text default 'week', p_limit integer default 50)
returns table (rank bigint, user_id uuid, nick text, avatar_version integer, solved bigint, streak integer, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select
      date_trunc('week', now() at time zone 'Europe/Warsaw') at time zone 'Europe/Warsaw' as week_start,
      (now() at time zone 'Europe/Warsaw')::date as today
  ),
  solved as (
    select a.user_id, count(*)::bigint as solved
    from public.answers a
    cross join bounds b
    where a.correct and (p_period = 'all' or a.created_at >= b.week_start)
    group by a.user_id
  ),
  scores as (
    select
      p.id,
      p.nick,
      p.avatar_version,
      coalesce(s.solved, 0) as solved,
      -- seria przerwana (brak nauki wczoraj i dziś) pokazuje się jako 0
      case when p.last_active >= b.today - 1 then p.streak else 0 end as streak,
      coalesce(p.id = auth.uid(), false) as is_me
    from public.profiles p
    cross join bounds b
    left join solved s on s.user_id = p.id
  ),
  ranked as (
    select
      rank() over (order by sc.solved desc) as rank,
      row_number() over (order by sc.solved desc, sc.is_me desc, sc.nick) as position,
      sc.*
    from scores sc
    where sc.solved > 0 or sc.is_me
  )
  select r.rank, r.id, r.nick, r.avatar_version, r.solved, r.streak, r.is_me
  from ranked r
  where r.position <= least(greatest(p_limit, 1), 100) or r.is_me
  order by r.position;
$$;

-- Skrót do „Twojego profilu” w rankingu: rozwiązane i miejsce w tym tygodniu oraz łącznie
create or replace function public.my_ranking_summary()
returns table (solved_week bigint, rank_week bigint, solved_all bigint, rank_all bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select w.solved, w.rank, a.solved, a.rank
  from (select l.solved, l.rank from public.leaderboard('week', 1) l where l.is_me) w
  cross join (select l.solved, l.rank from public.leaderboard('all', 1) l where l.is_me) a;
$$;

grant execute on function public.leaderboard(text, integer) to anon, authenticated;
revoke execute on function public.my_ranking_summary() from public, anon;
grant execute on function public.my_ranking_summary() to authenticated;
