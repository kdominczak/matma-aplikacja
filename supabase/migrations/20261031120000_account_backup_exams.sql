-- Konto z e-mailem, kopia postępu w chmurze i historia arkuszy.
--
-- Logowanie: e-mail + 6-cyfrowy kod (OTP). Anonimowe konto (ranking) dostaje e-mail przez
-- auth.updateUser – zostaje to samo id, więc historia odpowiedzi, pudełko i ranking się nie zmieniają.
-- Konfiguracja w panelu Supabase (nie da się jej ustawić migracją):
--   1. Authentication → Sign In / Providers: włączone „Email” i „Allow anonymous sign-ins”.
--   2. Authentication → Emails → szablony „Magic Link” i „Change Email Address”: wstaw kod {{ .Token }}
--      (aplikacja nie obsługuje linków – w Capacitorze i static exporcie nie ma przekierowań).
--   3. Authentication → Emails → SMTP: własny serwer SMTP (wbudowany wysyła tylko kilka maili na godzinę).
--
-- Obie tabele są prywatne: uczeń widzi i zmienia tylko swoje wiersze. Nic tu nie wpływa na ranking.

-- ── Kopia postępu z urządzenia (testy, gwiazdki, odznaki, seria, pudełko, statystyki) ──

create table public.user_progress (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 524288),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
revoke all on public.user_progress from anon, authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;

create policy "Uczeń czyta własną kopię postępu" on public.user_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Uczeń zapisuje własną kopię postępu" on public.user_progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Uczeń aktualizuje własną kopię postępu" on public.user_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Uczeń usuwa własną kopię postępu" on public.user_progress
  for delete to authenticated using (user_id = (select auth.uid()));

-- ── Próby arkuszy (symulacja matury) – prywatna historia i statystyki, poza rankingiem ──
-- id nadaje aplikacja (crypto.randomUUID) – ponowne wysłanie tej samej próby niczego nie dubluje.
-- answers: wyniki zadań [{"taskId": "…", "number": 1, "kind": "closed", "status": "correct", "points": 1, "maxPoints": 1, "given": "B"}, …]

create table public.exam_attempts (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exam_id text not null check (exam_id ~ '^[a-z0-9-]{2,40}$'),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_sec integer not null check (duration_sec between 0 and 86400),
  points smallint not null check (points >= 0),
  max_points smallint not null check (max_points > 0 and points <= max_points),
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) <= 100 and pg_column_size(answers) < 65536),
  created_at timestamptz not null default now(),
  check (finished_at >= started_at)
);

create index exam_attempts_user_finished on public.exam_attempts (user_id, finished_at desc);

alter table public.exam_attempts enable row level security;
revoke all on public.exam_attempts from anon, authenticated;
-- bez update: zakończona próba się nie zmienia
grant select, insert, delete on public.exam_attempts to authenticated;

create policy "Uczeń widzi własne próby arkuszy" on public.exam_attempts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Uczeń zapisuje własne próby arkuszy" on public.exam_attempts
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Uczeń usuwa własne próby arkuszy" on public.exam_attempts
  for delete to authenticated using (user_id = (select auth.uid()));

-- Limit historii na konto (chroni bazę przed zalaniem wierszami): najstarsze ponad 200 są usuwane.
create or replace function public.trim_exam_attempts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.exam_attempts
  where user_id = new.user_id
    and id in (
      select id from public.exam_attempts
      where user_id = new.user_id
      order by finished_at desc
      offset 200
    );
  return null;
end;
$$;

revoke execute on function public.trim_exam_attempts() from public, anon, authenticated;

create trigger exam_attempts_trim
  after insert on public.exam_attempts
  for each row execute function public.trim_exam_attempts();
