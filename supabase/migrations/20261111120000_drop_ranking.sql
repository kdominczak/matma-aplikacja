-- Sprzątanie po rankingu (usunięty z aplikacji 2.11.2026 – commit ec3f009). Aplikacja od tamtej wersji nie woła
-- żadnej z tych funkcji ani tabel: postęp i Pudełko porażek idą wyłącznie przez kopię postępu (user_progress,
-- save_progress), a opanowanie działów liczy się na urządzeniu.
--
-- Znika: profile i nicki (z moderacją), odpowiedzi do rankingu (answers), serwerowe Pudełko porażek (mistakes),
-- klucze odpowiedzi (question_keys – seed i `npm run db:keys` też znikają) oraz zdjęcia w Storage (reguły dostępu
-- i pusty bucket `avatars` – na produkcji 3.11.2026 bez plików; aplikacja ich już nie wysyła).
--
-- Usunięcie konta (delete_my_account) dalej kasuje wszystko kaskadą od auth.users – tabele, które zostają
-- (user_progress, exam_attempts, entitlements, ai_usage, referrals, gift_*, funnel_events…), mają on delete cascade.
-- Plik można uruchomić ponownie (if exists).

-- ── Funkcje (wszystkie warianty argumentów – leaderboard zmieniał sygnaturę) ──
do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'leaderboard', 'record_activity', 'record_answers', 'import_mistakes', 'my_topic_stats', 'reset_learning_data',
        'my_ranking_summary', 'ranking_daily_cap', 'check_nick', 'nick_allowed', 'normalize_nick'
      )
  loop
    execute format('drop function %s cascade', f);
  end loop;
end;
$$;

-- ── Tabele (z nimi: indeksy, reguły RLS i trigger moderacji nicków) ──
drop table if exists public.answers cascade;
drop table if exists public.mistakes cascade;
drop table if exists public.question_keys cascade;
drop table if exists public.profiles cascade;
drop table if exists public.xp_events cascade; -- usunięta już w 20261029120000, tu na wszelki wypadek

-- ── Storage: reguły dostępu do zdjęć z rankingu ──
drop policy if exists "Avatary: własne zdjęcie (odczyt do nadpisania)" on storage.objects;
drop policy if exists "Avatary: własne zdjęcie (dodanie)" on storage.objects;
drop policy if exists "Avatary: własne zdjęcie (zmiana)" on storage.objects;
drop policy if exists "Avatary: własne zdjęcie (usunięcie)" on storage.objects;

-- Bucket tylko pusty. Supabase może blokować usuwanie z tabel storage w SQL – wtedy zostaje (bez reguł nikt do niego
-- nic nie zapisze) i można go usunąć w panelu: Storage → avatars → Delete bucket.
do $$
begin
  delete from storage.buckets b where b.id = 'avatars' and not exists (select 1 from storage.objects o where o.bucket_id = b.id);
exception when others then
  raise notice 'Bucket avatars zostaje (%): usuń go w panelu Storage', sqlerrm;
end;
$$;
