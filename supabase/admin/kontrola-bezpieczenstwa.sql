-- Kontrola bezpieczeństwa bazy PRODUKCYJNEJ (Supabase → SQL Editor). Te same warunki pilnuje tests/db/security.test.ts
-- na migracjach – ten skrypt łapie to, czego test nie widzi: zmiany wyklikane w panelu i niewdrożone migracje.
-- Uruchamiaj po każdej migracji i przed wydaniem. Zapytania 1–2 muszą zwrócić 0 wierszy, 3–5 – dokładnie listy z testu.

-- 1) Tabele bez RLS (oczekiwane: brak wierszy)
select c.relname as tabela_bez_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;

-- 2) Funkcje SECURITY DEFINER bez search_path (oczekiwane: brak wierszy)
select p.proname as funkcja_bez_search_path
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%');

-- 3) Funkcje dla niezalogowanych (oczekiwane 8: ai_free_daily_limit, ai_grading_daily_limit, ai_premium_daily_limit,
--    check_nick, leaderboard, nick_allowed, normalize_nick, ranking_daily_cap)
select p.proname as anon_moze_wywolac
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')
order by 1;

-- 4) Funkcje z prawami właściciela dla ucznia (oczekiwane 14 – lista w tests/db/security.test.ts)
select p.proname as uczen_wywola_definer
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef and has_function_privilege('authenticated', p.oid, 'execute')
order by 1;

-- 5) Bezpośredni dostęp do tabel (oczekiwane: anon – profiles SELECT; authenticated – answers SELECT,
--    exam_attempts DELETE/INSERT/SELECT, mistakes SELECT, profiles DELETE/SELECT, user_progress DELETE/SELECT)
select grantee, table_name, string_agg(privilege_type, ',' order by privilege_type) as uprawnienia
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by grantee, table_name
order by grantee, table_name;

-- 6) Polityki RLS (przejrzyj: każda z `auth.uid()` w warunku, poza „Profile są publiczne”)
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 7) Storage: bucket avatars publiczny do odczytu, limit rozmiaru i tylko obrazy
select id, public, file_size_limit, allowed_mime_types from storage.buckets;

-- 8) Czy najnowsze migracje są wdrożone (oczekiwane: wszystko true; przy nowej migracji dopisz jej obiekt)
select to_regclass('public.gift_codes') is not null as kody_podarunkowe,
       to_regprocedure('public.consume_grading_quota(text)') is not null as ocena_zdjec,
       to_regclass('public.funnel_events') is not null as lejek;
