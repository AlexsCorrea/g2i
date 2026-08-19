-- Cirurgias do dia para o mapa cirúrgico (retry com timestamp)
WITH pats AS (SELECT id, row_number() OVER (ORDER BY created_at) rn FROM patients LIMIT 10),
     surg AS (SELECT id, row_number() OVER (ORDER BY created_at) rn, count(*) OVER () total FROM profiles)
INSERT INTO surgical_procedures (
  patient_id, surgeon_id, procedure_type, description, scheduled_date, start_time, end_time,
  anesthesia_type, status, room, insurance, surgery_character, needs_icu, priority
)
SELECT
  p.id,
  s.id,
  (ARRAY['Facectomia com LIO','Pterígio','Vitrectomia','Transplante de córnea','Estrabismo'])[p.rn % 5 + 1],
  'Cirurgia gerada para testes funcionais',
  current_date,
  (current_date::timestamp + interval '7 hours 30 minutes' + make_interval(mins => ((p.rn - 1) * 60)::int)),
  (current_date::timestamp + interval '8 hours 30 minutes' + make_interval(mins => ((p.rn - 1) * 60)::int)),
  (ARRAY['local','geral','sedacao'])[p.rn % 3 + 1],
  (ARRAY['agendada','confirmada','em_andamento','realizada'])[p.rn % 4 + 1],
  'Sala ' || (p.rn % 3 + 1),
  (ARRAY['SUS','Unimed','Particular'])[p.rn % 3 + 1],
  'eletiva',
  (p.rn % 6) = 0,
  'normal'
FROM pats p
JOIN surg s ON s.rn = (p.rn % (SELECT total FROM surg LIMIT 1)) + 1
WHERE p.rn <= 6;