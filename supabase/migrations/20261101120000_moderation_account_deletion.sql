-- Moderacja nicków i usuwanie konta z poziomu aplikacji (wymóg Google Play i RODO).
-- Uruchom po 20261031120000_account_backup_exams.sql.

-- ── Filtr nicków ──
-- Lista i normalizacja są zgodne z src/lib/moderation.ts (pilnuje tego tests/moderation.test.ts).
-- Aplikacja sprawdza nick od razu, ale decyduje serwer – filtra nie da się obejść zapytaniem z pominięciem aplikacji.

create or replace function public.normalize_nick(p_nick text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    regexp_replace(translate(lower(p_nick), 'ąćęłńóśźż013457', 'acelnoszzoieast'), '[^a-z]', '', 'g'),
    '(.)\1+', '\1', 'g'
  );
$$;

create or replace function public.nick_allowed(p_nick text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select not exists (
    select 1
    from unnest(array[
      'kurw', 'kurew', 'chuj', 'huj', 'pierd', 'jeb', 'pizd', 'cipa', 'cipk', 'cipo', 'kutas', 'fiut',
      'dupa', 'dupek', 'dupc', 'dziwk', 'szmat', 'ruchac', 'rucham', 'ruchan', 'cwel', 'ciota', 'pedal',
      'pedzio', 'debil', 'kretyn', 'seks', 'porn', 'gwalt',
      'fuck', 'shit', 'bitch', 'cunt', 'dick', 'penis', 'pusy', 'niga', 'niger', 'whore', 'slut',
      'hitler',
      'admin', 'moderator'
    ]) as root
    -- wyjątki: zwykłe słowa zawierające rdzeń (prin-cipa-l, muni-cipa-l, parti-cipa-te)
    where strpos(regexp_replace(public.normalize_nick(p_nick), 'ncipa|icipa', '', 'g'), root) > 0
  );
$$;

create or replace function public.check_nick()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not public.nick_allowed(new.nick) then
    raise exception 'Niedozwolony nick' using errcode = 'MA004';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_check_nick on public.profiles;
create trigger profiles_check_nick
  before insert or update of nick on public.profiles
  for each row execute function public.check_nick();

-- Istniejące niedozwolone nicki zmieniamy na neutralne „Uczen-xxxxxx” (uczeń może potem wybrać nowy).
update public.profiles
set nick = 'Uczen-' || substr(replace(id::text, '-', ''), 1, 6),
    updated_at = now()
where not public.nick_allowed(nick);

-- ── Usunięcie konta ──
-- Kasuje użytkownika w auth.users; wszystkie dane ucznia (profil, odpowiedzi, pomyłki, kopia postępu,
-- próby arkuszy) usuwają się kaskadowo. Zdjęcie profilowe aplikacja usuwa wcześniej przez Storage API
-- (Supabase nie pozwala kasować plików bezpośrednio z tabel storage).

create or replace function public.delete_my_account()
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
  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
