-- Uczciwszy ranking.
--
-- Klucze odpowiedzi są w aplikacji (zadania działają offline), więc skrypt może wysyłać same poprawne litery.
-- Nie da się tego w pełni zablokować bez trzymania zadań na serwerze – ograniczamy więc, ile da się „nabić”:
--   1. Każde zadanie liczy się do rankingu raz dziennie (dzień wg czasu polskiego). Wcześniej to samo zadanie
--      rozwiązywane w kółko dawało punkt za każdym razem.
--   2. Najwyżej ranking_daily_cap() = 150 punktów dziennie. Plan na dziś to ok. 15–25 zadań, nawet bardzo
--      pracowity dzień to kilkadziesiąt – uczciwy uczeń nie dobija do limitu, skrypt ma twardy sufit.
-- Limit tempa w record_answers celowo NIE powstał: kolejka offline wysyła po powrocie internetu dziesiątki
-- odpowiedzi naraz (bez czasu z urządzenia), więc limit tempa gubiłby prawdziwą naukę.
-- Statystyki działów, Pudełko porażek i seria liczą się jak dotąd ze wszystkich odpowiedzi.
--
-- Plik jest idempotentny (CREATE OR REPLACE, sygnatury bez zmian – uprawnienia zostają).

create or replace function public.ranking_daily_cap() returns integer language sql immutable as $$ select 150 $$;

create index if not exists answers_correct_time_idx on public.answers (created_at) where correct;

create or replace function public.leaderboard(p_period text default 'week', p_limit integer default 50)
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
  -- punkty dnia: różne poprawnie rozwiązane zadania tego dnia, najwyżej ranking_daily_cap()
  daily as (
    select a.user_id, (a.created_at at time zone 'Europe/Warsaw')::date as day, count(distinct a.question_id) as n
    from public.answers a
    cross join bounds b
    where a.correct and (p_period = 'all' or a.created_at >= b.week_start)
    group by a.user_id, (a.created_at at time zone 'Europe/Warsaw')::date
  ),
  solved as (
    select d.user_id, sum(least(d.n, public.ranking_daily_cap()))::bigint as solved
    from daily d
    group by d.user_id
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
      row_number() over (order by sc.solved desc, sc.streak desc, sc.is_me desc, sc.nick) as position,
      sc.*
    from scores sc
  )
  select r.rank, r.id, r.nick, r.avatar_version, r.solved, r.streak, r.is_me
  from ranked r
  where r.position <= least(greatest(p_limit, 1), 100) or r.is_me
  order by r.position;
$$;
