-- Seed de agendamentos para testes funcionais (hoje + próximos 5 dias)
WITH pats AS (
  SELECT id, row_number() OVER (ORDER BY created_at) rn FROM patients LIMIT 40
),
profs AS (
  SELECT id, specialty, row_number() OVER (ORDER BY created_at) rn, count(*) OVER () total FROM profiles
),
ags AS (
  SELECT id, row_number() OVER (ORDER BY name) rn, count(*) OVER () total FROM schedule_agendas
),
slots AS (
  SELECT d AS dayoff, s AS slot FROM generate_series(0, 5) d CROSS JOIN generate_series(0, 15) s
),
base AS (
  SELECT
    sl.dayoff, sl.slot,
    (current_date + sl.dayoff)::timestamp + make_interval(hours => 8, mins => (sl.slot * 30)::int) AS sched,
    p.id AS patient_id, pr.id AS professional_id, pr.specialty, ag.id AS agenda_id
  FROM slots sl
  JOIN pats p ON p.rn = ((sl.dayoff * 16 + sl.slot) % 40) + 1
  JOIN profs pr ON pr.rn = ((sl.dayoff * 5 + sl.slot) % (SELECT total FROM profs LIMIT 1)) + 1
  JOIN ags ag ON ag.rn = ((sl.dayoff * 3 + sl.slot) % (SELECT total FROM ags LIMIT 1)) + 1
)
INSERT INTO appointments (
  patient_id, professional_id, agenda_id, title, description, appointment_type,
  scheduled_at, duration_minutes, status, location, room, specialty, insurance,
  origin_channel, priority, is_return, is_new_patient, is_fit_in
)
SELECT
  b.patient_id, b.professional_id, b.agenda_id,
  CASE (b.slot % 5)
    WHEN 0 THEN 'Consulta oftalmológica'
    WHEN 1 THEN 'Retorno clínico'
    WHEN 2 THEN 'Avaliação pré-operatória'
    WHEN 3 THEN 'Exame de mapeamento de retina'
    ELSE 'Consulta de rotina' END,
  'Agendamento gerado para testes funcionais',
  CASE (b.slot % 5)
    WHEN 0 THEN 'consulta' WHEN 1 THEN 'retorno' WHEN 2 THEN 'procedimento'
    WHEN 3 THEN 'exame' ELSE 'consulta' END,
  b.sched, 30,
  CASE
    WHEN b.dayoff > 0 THEN (ARRAY['agendado','confirmado','agendado'])[(b.slot % 3) + 1]
    WHEN b.sched < now() - interval '45 minutes' THEN (ARRAY['concluido','concluido','nao_compareceu','concluido'])[(b.slot % 4) + 1]
    WHEN b.sched <= now() + interval '30 minutes' THEN (ARRAY['em_andamento','chegou','em_espera'])[(b.slot % 3) + 1]
    ELSE (ARRAY['confirmado','agendado'])[(b.slot % 2) + 1]
  END,
  'Unidade Central',
  'Consultório ' || ((b.slot % 6) + 1),
  COALESCE(b.specialty, 'Clínica Geral'),
  (ARRAY['SUS','Unimed','Bradesco Saúde','Particular','Amil'])[(b.slot % 5) + 1],
  (ARRAY['recepcao','telefone','portal','whatsapp'])[(b.slot % 4) + 1],
  (ARRAY['normal','normal','alta'])[(b.slot % 3) + 1],
  (b.slot % 5) = 1, (b.slot % 7) = 0, (b.slot % 11) = 0
FROM base b;