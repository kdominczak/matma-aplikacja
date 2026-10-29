-- Zwrot wiadomości AI, gdy odpowiedź nie powstała z naszej winy (błąd Groq, brak połączenia, zły klucz serwera).
-- consume_ai_quota() zużywa wiadomość przed zapytaniem do Groq (inaczej równoległe zapytania przekroczyłyby limit),
-- więc przy błędzie funkcja serwerowa `ai` oddaje ją tutaj.
--
-- Woła wyłącznie serwer kluczem service_role – uczeń nie może zwracać sobie wiadomości.
-- Dzień według czasu polskiego jak w consume_ai_quota(); licznik nie spada poniżej zera.

create or replace function public.refund_ai_quota(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Warsaw')::date;
  v_used integer;
begin
  update public.ai_usage
     set messages = messages - 1
   where user_id = p_user and day = v_today and messages > 0
  returning messages into v_used;
  return coalesce(v_used, 0);
end;
$$;

revoke all on function public.refund_ai_quota(uuid) from public, anon, authenticated;
grant execute on function public.refund_ai_quota(uuid) to service_role;
