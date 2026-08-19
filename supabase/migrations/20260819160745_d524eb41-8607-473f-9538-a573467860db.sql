-- Agendamentos ao vivo para o restante do dia (fila do profissional)
WITH pats AS (SELECT id, row_number() OVER (ORDER BY updated_at DESC) rn FROM patients LIMIT 12),
     profs AS (SELECT id, specialty, row_number() OVER (ORDER BY created_at) rn, count(*) OVER () total FROM profiles),
     ags AS (SELECT id, row_number() OVER (ORDER BY name) rn, count(*) OVER () total FROM schedule_agendas)
INSERT INTO appointments (
  patient_id, professional_id, agenda_id, title, description, appointment_type,
  scheduled_at, duration_minutes, status, location, room, specialty, insurance,
  origin_channel, priority, is_return, is_new_patient, is_fit_in
)
SELECT
  p.id, pr.id, ag.id,
  (ARRAY['Consulta oftalmológica','Retorno clínico','Exame de campo visual','Avaliação pré-operatória'])[p.rn % 4 + 1],
  'Agendamento ao vivo para testes funcionais',
  (ARRAY['consulta','retorno','exame','procedimento'])[p.rn % 4 + 1],
  date_trunc('hour', now()) + make_interval(mins => ((p.rn - 4) * 20)::int),
  20,
  CASE
    WHEN p.rn <= 2 THEN 'chegou'
    WHEN p.rn = 3 THEN 'em_andamento'
    WHEN p.rn <= 5 THEN 'em_espera'
    ELSE (ARRAY['confirmado','agendado'])[p.rn % 2 + 1]
  END,
  'Unidade Central',
  'Consultório ' || (p.rn % 4 + 1),
  COALESCE(pr.specialty, 'Oftalmologia'),
  (ARRAY['SUS','Unimed','Particular'])[p.rn % 3 + 1],
  'recepcao',
  (ARRAY['normal','alta'])[p.rn % 2 + 1],
  (p.rn % 4) = 1, (p.rn % 5) = 0, (p.rn % 6) = 0
FROM pats p
JOIN profs pr ON pr.rn = (p.rn % (SELECT total FROM profs LIMIT 1)) + 1
JOIN ags ag ON ag.rn = (p.rn % (SELECT total FROM ags LIMIT 1)) + 1;