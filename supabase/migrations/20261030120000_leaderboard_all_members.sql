-- Ranking pokazuje wszystkich uczestników, także z zerem rozwiązanych (wcześniej każdy widział tylko siebie,
-- dopóki ktoś nie rozwiązał pierwszego zadania). Kolejność: rozwiązane, seria, nick.
-- Uruchom po 20261029120000_solved_ranking_avatars.sql.

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
      row_number() over (order by sc.solved desc, sc.streak desc, sc.is_me desc, sc.nick) as position,
      sc.*
    from scores sc
  )
  select r.rank, r.id, r.nick, r.avatar_version, r.solved, r.streak, r.is_me
  from ranked r
  where r.position <= least(greatest(p_limit, 1), 100) or r.is_me
  order by r.position;
$$;
