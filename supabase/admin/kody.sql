-- Kody podarunkowe i z przedsprzedaży (Supabase → SQL Editor). Migracja 20261110120000_gift_codes.
-- Jawne kody widać TYLKO raz – w wyniku create_gift_codes(). Pobierz wynik jako CSV od razu:
-- w bazie zostaje sam skrót, kodu nie da się potem odczytać.

-- 1) Nowa partia: create_gift_codes(ile, dni Premium, kampania, użycia na kod = 1, ważny do = bez końca)

-- przedsprzedaż: 200 kodów jednorazowych po 30 dni, do końca matur
select public.create_gift_codes(200, 30, 'przedsprzedaz-2027', 1, '2027-05-31 23:59 Europe/Warsaw') as kod;

-- jeden kod dla klasy: 14 dni dla maksymalnie 35 uczniów
-- select public.create_gift_codes(1, 14, 'klasa-3b-lo5', 35, '2026-12-31 23:59 Europe/Warsaw') as kod;

-- 2) Raport kampanii: ile kodów, ile użyć
select campaign,
       days,
       count(*) as kody,
       sum(max_uses) as mozliwe_uzycia,
       sum(uses) as wykorzystane,
       min(valid_until) as wazne_do
from public.gift_codes
group by campaign, days
order by min(created_at) desc;

-- 3) Wyłączenie kampanii (np. wyciek listy kodów): skrócenie ważności do teraz
-- update public.gift_codes set valid_until = now() where campaign = 'przedsprzedaz-2027';

-- 4) Sprawdzenie pojedynczego kodu zgłoszonego przez ucznia (wpisz kod tak, jak go podał)
-- select campaign, days, uses, max_uses, valid_until from public.gift_codes where code_hash = public.gift_code_hash('ABCD-EFGH-JKLM');
