-- Ranking maturzystów: profile (nick, XP, seria) + dziennik zdobytego XP (do rankingu tygodniowego).
-- Uruchom w Supabase: SQL Editor → wklej całość → Run (albo `supabase db push`).
-- Wymaga włączenia logowania anonimowego: Authentication → Sign In / Providers → „Allow anonymous sign-ins”.

-- ── Tabele ──

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nick text not null
    constraint nick_format check (nick ~ '^[A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż_.-]{3,20}$'),
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_active date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nick unikalny bez względu na wielkość liter („Kasia” = „kasia”)
create unique index profiles_nick_unique on public.profiles (lower(nick));
create index profiles_xp_idx on public.profiles (xp desc);

create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  xp integer not null check (xp between 1 and 500),
  created_at timestamptz not null default now()
);

create index xp_events_user_time_idx on public.xp_events (user_id, created_at desc);
create index xp_events_time_idx on public.xp_events (created_at);

-- ── Uprawnienia: klucz anon jest publiczny (jest w aplikacji), więc bezpieczeństwo trzyma RLS ──

alter table public.profiles enable row level security;
alter table public.xp_events enable row level security;

-- Supabase domyślnie daje rolom pełne prawa do tabel – zawężamy je do minimum.
revoke all on public.profiles from anon, authenticated;
revoke all on public.xp_events from anon, authenticated;

-- Profil widzą wszyscy (to ranking), ale zawiera tylko nick, XP i serię.
grant select on public.profiles to anon, authenticated;
-- Przy tworzeniu i edycji uczeń ustawia wyłącznie nick – XP i serię zmienia tylko record_activity().
grant insert (id, nick) on public.profiles to authenticated;
grant update (nick) on public.profiles to authenticated;
grant delete on public.profiles to authenticated;

create policy "Profile są publiczne" on public.profiles
  for select to anon, authenticated using (true);

create policy "Uczeń tworzy własny profil" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy "Uczeń zmienia własny nick" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Uczeń może usunąć się z rankingu" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

-- xp_events: brak polityk = brak bezpośredniego dostępu; zapis i odczyt tylko przez funkcje poniżej.

-- ── Zapis aktywności (jedyna droga do zmiany XP i serii) ──

create or replace function public.record_activity(p_xp integer)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_day_start timestamptz := v_today::timestamp at time zone 'Europe/Warsaw';
  v_profile public.profiles;
  v_last_event timestamptz;
  v_today_xp integer;
  v_streak integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;
  if p_xp is null or p_xp < 1 or p_xp > 500 then
    raise exception 'Nieprawidłowa liczba XP' using errcode = '22023';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'Najpierw dołącz do rankingu' using errcode = 'MA003';
  end if;

  -- Proste zabezpieczenia przed nabijaniem punktów (aplikacja i tak wysyła XP raz na ukończoną sesję)
  select max(created_at) into v_last_event from public.xp_events where user_id = v_uid;
  if v_last_event > now() - interval '5 seconds' then
    raise exception 'Zbyt częste zapisy' using errcode = 'MA001';
  end if;

  select coalesce(sum(xp), 0) into v_today_xp
  from public.xp_events where user_id = v_uid and created_at >= v_day_start;
  if v_today_xp + p_xp > 3000 then
    raise exception 'Dzienny limit XP w rankingu' using errcode = 'MA002';
  end if;

  -- Seria: dziś już liczone → bez zmian; wczoraj → +1; dawniej → od nowa
  v_streak := case
    when v_profile.last_active = v_today then v_profile.streak
    when v_profile.last_active = v_today - 1 then v_profile.streak + 1
    else 1
  end;

  insert into public.xp_events (user_id, xp) values (v_uid, p_xp);

  update public.profiles
  set xp = xp + p_xp,
      streak = v_streak,
      best_streak = greatest(best_streak, v_streak),
      last_active = v_today,
      updated_at = now()
  where id = v_uid
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke execute on function public.record_activity(integer) from public, anon;
grant execute on function public.record_activity(integer) to authenticated;

-- ── Ranking: tydzień (od poniedziałku, czas polski) albo cały czas; top N + wiersz pytającego ──

create or replace function public.leaderboard(p_period text default 'week', p_limit integer default 50)
returns table (rank bigint, user_id uuid, nick text, xp bigint, streak integer, is_me boolean)
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
  weekly as (
    select e.user_id, sum(e.xp)::bigint as xp
    from public.xp_events e
    cross join bounds b
    where e.created_at >= b.week_start
    group by e.user_id
  ),
  scores as (
    select
      p.id,
      p.nick,
      case when p_period = 'all' then p.xp::bigint else coalesce(w.xp, 0) end as xp,
      -- seria przerwana (brak nauki wczoraj i dziś) pokazuje się jako 0
      case when p.last_active >= b.today - 1 then p.streak else 0 end as streak
    from public.profiles p
    cross join bounds b
    left join weekly w on w.user_id = p.id
  ),
  ranked as (
    select
      rank() over (order by s.xp desc) as rank,
      row_number() over (order by s.xp desc, s.nick) as position,
      s.id,
      s.nick,
      s.xp,
      s.streak,
      coalesce(s.id = auth.uid(), false) as is_me
    from scores s
    where s.xp > 0
  )
  select r.rank, r.id, r.nick, r.xp, r.streak, r.is_me
  from ranked r
  where r.position <= least(greatest(p_limit, 1), 100) or r.is_me
  order by r.position;
$$;

grant execute on function public.leaderboard(text, integer) to anon, authenticated;

-- ── Ranking na żywo: zmiany profili trafiają do Supabase Realtime ──

alter publication supabase_realtime add table public.profiles;
