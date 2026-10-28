-- Usunięcie konta na prośbę mailową (strona /usun-konto). Uruchamia administrator w Supabase → SQL Editor.
-- Nie jest migracją – nie wklejaj całości naraz. Kroki po kolei:
--
-- 1. Znajdź konto po ID z maila (Ustawienia → „ID konta”), po nicku albo po e-mailu.
--    Sprawdź, czy nick/e-mail zgadza się z tym, co napisał uczeń – usuwamy tylko jednoznacznie wskazane konto.

select u.id, u.email, u.is_anonymous, u.created_at, p.nick, p.avatar_version
from auth.users u
left join public.profiles p on p.id = u.id
where u.id::text = 'WKLEJ-ID-KONTA'          -- albo:
   or lower(p.nick) = lower('WKLEJ-NICK')     -- albo:
   or lower(u.email) = lower('WKLEJ-EMAIL');

-- 2. Jeśli konto ma zdjęcie (avatar_version nie jest puste): Storage → bucket „avatars” → usuń plik <id>.jpg.
--    (Supabase nie pozwala kasować plików Storage zwykłym SQL-em.)
--
-- 3. Usuń konto. Profil, odpowiedzi, pomyłki, kopia postępu i próby arkuszy znikają kaskadowo.

delete from auth.users where id = 'WKLEJ-ID-KONTA';

-- 4. Sprawdź, że nic nie zostało (oczekiwane: same zera), i odpisz uczniowi z potwierdzeniem.

select
  (select count(*) from auth.users where id = 'WKLEJ-ID-KONTA') as konto,
  (select count(*) from public.profiles where id = 'WKLEJ-ID-KONTA') as profil,
  (select count(*) from public.answers where user_id = 'WKLEJ-ID-KONTA') as odpowiedzi,
  (select count(*) from public.user_progress where user_id = 'WKLEJ-ID-KONTA') as kopia_postepu,
  (select count(*) from public.exam_attempts where user_id = 'WKLEJ-ID-KONTA') as arkusze;
