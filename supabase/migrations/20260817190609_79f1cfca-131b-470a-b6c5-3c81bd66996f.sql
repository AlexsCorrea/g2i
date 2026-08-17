WITH ord AS (
  SELECT id, row_number() OVER (ORDER BY scheduled_at) rn
  FROM public.appointments
  WHERE scheduled_at::date = current_date AND title LIKE '%[DEMO]%'
), novo AS (
  SELECT id, rn, date_trunc('minute', now()) - interval '2 hours 30 minutes' + ((rn-1) * interval '20 minutes') AS ts FROM ord
)
UPDATE public.appointments a
SET scheduled_at = n.ts,
    status = CASE
      WHEN n.ts < now() - interval '25 minutes' THEN (ARRAY['concluido','concluido','concluido','nao_compareceu'])[1+(n.rn%4)]
      WHEN n.ts <= now() THEN (ARRAY['em_andamento','chegou'])[1+(n.rn%2)]
      ELSE (ARRAY['agendado','confirmado','confirmado'])[1+(n.rn%3)]
    END
FROM novo n WHERE a.id = n.id;