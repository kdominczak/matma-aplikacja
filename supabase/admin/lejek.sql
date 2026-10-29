-- Lejek Premium dzień po dniu (Supabase → SQL Editor). Liczby = różne konta.
-- Kroki z funnel_events (migracja 20261107120000), zakupy z purchase_events, polecenia z referrals.
-- Zmień liczbę dni w pierwszej linii CTE.

with days as (
  select generate_series((now() at time zone 'Europe/Warsaw')::date - 29, (now() at time zone 'Europe/Warsaw')::date, interval '1 day')::date as day
),
steps as (
  select day, event, count(*) as users from public.funnel_events group by day, event
),
purchases as (
  -- pierwszy zakup konta (webhook INITIAL_PURCHASE/NON_RENEWING_PURCHASE albo synchronizacja z aplikacji z aktywnym zakupem)
  select (min(received_at) at time zone 'Europe/Warsaw')::date as day, user_id
  from public.purchase_events
  where purchase_until > received_at
  group by user_id
),
referred as (
  select (created_at at time zone 'Europe/Warsaw')::date as day, count(*) as users from public.referrals group by 1
)
select
  d.day,
  coalesce((select users from steps s where s.day = d.day and s.event = 'ai_limit'), 0)     as limit_ai,
  coalesce((select users from steps s where s.day = d.day and s.event = 'premium_view'), 0) as ekran_premium,
  coalesce((select users from steps s where s.day = d.day and s.event = 'email_gate'), 0)   as wymog_emaila,
  coalesce((select users from steps s where s.day = d.day and s.event = 'buy_start'), 0)    as klik_kup,
  (select count(*) from purchases p where p.day = d.day)                                     as pierwsze_zakupy,
  coalesce((select users from referred r where r.day = d.day), 0)                            as polecenia
from days d
order by d.day desc;

-- Konwersja w całym okresie (konta, które doszły do kroku / konta z wyczerpanym limitem):
-- select event, count(distinct user_id) from public.funnel_events where day >= current_date - 29 group by event;
