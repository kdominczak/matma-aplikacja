-- Kopia postępu bez wyścigu dwóch urządzeń.
--
-- Wcześniej aplikacja sprawdzała updated_at kopii, a potem osobnym zapytaniem robiła upsert – drugie urządzenie
-- mogło zapisać pomiędzy, a jego zmiany przepadały (nadpisane bez scalenia). Do tego updated_at ustawiał zegar
-- telefonu, więc porównania zależały od tego, czy ktoś ma dobrze ustawioną godzinę.
--
-- Teraz zapis idzie wyłącznie przez save_progress(): porównanie i zapis to jedna instrukcja na zablokowanym
-- wierszu (optimistic concurrency). Gdy kopia zmieniła się od ostatniego odczytu, funkcja zgłasza MA020 –
-- aplikacja pobiera ją, scala (progress-merge.ts) i próbuje ponownie. updated_at nadaje serwer.
-- Uczeń nie ma już bezpośredniego prawa INSERT/UPDATE na user_progress (czyta i usuwa jak dotąd).
--
-- Plik jest idempotentny.

create or replace function public.save_progress(p_data jsonb, p_expected timestamptz, p_force boolean default false)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_current timestamptz;
  v_next timestamptz;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika' using errcode = '28000';
  end if;

  select p.updated_at into v_current from public.user_progress p where p.user_id = v_uid for update;

  if found then
    -- p_expected = null znaczy „myślę, że kopii jeszcze nie ma” – a jest, więc też konflikt
    if not p_force and v_current is distinct from p_expected then
      raise exception 'Kopia postępu zmieniła się na innym urządzeniu' using errcode = 'MA020';
    end if;
    -- zawsze rośnie, nawet przy dwóch zapisach w tej samej mikrosekundzie
    v_next := greatest(clock_timestamp(), v_current + interval '1 microsecond');
    update public.user_progress set data = p_data, updated_at = v_next where user_id = v_uid;
  else
    if not p_force and p_expected is not null then
      -- aplikacja widziała kopię, której już nie ma (np. usunięta na innym urządzeniu) – niech pobierze stan od nowa
      raise exception 'Kopia postępu zmieniła się na innym urządzeniu' using errcode = 'MA020';
    end if;
    v_next := clock_timestamp();
    -- równoległy pierwszy zapis z dwóch urządzeń: drugi INSERT trafi na klucz główny (23505) – aplikacja ponowi
    insert into public.user_progress (user_id, data, updated_at) values (v_uid, p_data, v_next);
  end if;
  return v_next;
end;
$$;

revoke all on function public.save_progress(jsonb, timestamptz, boolean) from public, anon;
grant execute on function public.save_progress(jsonb, timestamptz, boolean) to authenticated;

-- zapis tylko przez funkcję (odczyt i usuwanie bez zmian)
revoke insert, update on public.user_progress from authenticated;
drop policy if exists "Uczeń zapisuje własną kopię postępu" on public.user_progress;
drop policy if exists "Uczeń aktualizuje własną kopię postępu" on public.user_progress;
