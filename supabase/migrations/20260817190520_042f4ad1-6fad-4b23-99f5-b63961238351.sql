
-- ============ DEMO SEED (apresentação) ============
DO $$
DECLARE
  prof uuid;
  prof2 uuid;
  ag uuid;
BEGIN
  SELECT id INTO prof FROM public.profiles ORDER BY created_at LIMIT 1;
  SELECT id INTO prof2 FROM public.profiles ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO ag FROM public.schedule_agendas WHERE status IS DISTINCT FROM 'inativo' ORDER BY created_at LIMIT 1;

  ---------------------------------------------------------------- LEITOS
  IF (SELECT count(*) FROM public.beds) = 0 THEN
    INSERT INTO public.beds (bed_number, room, unit, sector, bed_type, status)
    SELECT 'L'||lpad(i::text,2,'0'),
           'Q'||lpad(((i-1)/2+1)::text,2,'0'),
           'Unidade Central',
           CASE WHEN i<=6 THEN 'UTI' WHEN i<=16 THEN 'Internação Clínica' ELSE 'Internação Cirúrgica' END,
           CASE WHEN i<=6 THEN 'uti' ELSE 'enfermaria' END,
           'livre'
    FROM generate_series(1,24) i;
  END IF;

  ---------------------------------------------------------------- INTERNAÇÕES
  WITH alvo AS (
    SELECT p.id, row_number() OVER (ORDER BY p.created_at) rn
    FROM public.patients p WHERE p.status <> 'internado' LIMIT 12
  )
  UPDATE public.patients p
     SET status='internado',
         room='Q'||lpad(((a.rn-1)/2+1)::text,2,'0'),
         bed='L'||lpad(a.rn::text,2,'0'),
         admission_date = now() - (a.rn || ' days')::interval
  FROM alvo a WHERE p.id=a.id;

  UPDATE public.beds b
     SET status='ocupado', patient_id=p.id, expected_discharge = now() + ((random()*5+1)::int || ' days')::interval
  FROM public.patients p
  WHERE p.status='internado' AND p.bed = b.bed_number AND b.patient_id IS NULL;

  ---------------------------------------------------------------- AGENDA DE HOJE
  DELETE FROM public.appointments WHERE scheduled_at::date = current_date AND title LIKE '%[DEMO]%';

  INSERT INTO public.appointments
    (patient_id, professional_id, agenda_id, title, description, appointment_type, scheduled_at,
     duration_minutes, status, location, room, specialty, insurance, priority, is_return, is_fit_in)
  SELECT p.id, CASE WHEN rn % 2 = 0 THEN prof ELSE prof2 END, ag,
         (ARRAY['Consulta oftalmológica [DEMO]','Retorno pós-operatório [DEMO]','Avaliação clínica [DEMO]',
                'Mapeamento de retina [DEMO]','Consulta pediátrica [DEMO]','Revisão de exames [DEMO]'])[1+(rn%6)],
         'Agendamento demonstrativo para apresentação',
         (ARRAY['consulta','retorno','exame','procedimento','consulta','consulta'])[1+(rn%6)],
         (current_date + time '07:30') + ((rn-1) * interval '25 minutes'),
         (ARRAY[20,30,30,15,40,25])[1+(rn%6)],
         CASE
           WHEN (current_date + time '07:30') + ((rn-1) * interval '25 minutes') < now() - interval '40 minutes'
             THEN (ARRAY['concluido','concluido','concluido','nao_compareceu'])[1+(rn%4)]
           WHEN (current_date + time '07:30') + ((rn-1) * interval '25 minutes') < now()
             THEN (ARRAY['em_andamento','chegou'])[1+(rn%2)]
           ELSE (ARRAY['agendado','confirmado','confirmado'])[1+(rn%3)]
         END,
         (ARRAY['Consultório 1','Consultório 2','Sala de Exames','Consultório 3'])[1+(rn%4)],
         (ARRAY['C1','C2','SE','C3'])[1+(rn%4)],
         (ARRAY['Oftalmologia','Clínica Médica','Pediatria','Oftalmologia'])[1+(rn%4)],
         (ARRAY['SUS','Unimed','Particular','Bradesco Saúde','Amil'])[1+(rn%5)],
         CASE WHEN rn%9=0 THEN 'alta' ELSE 'normal' END,
         rn%5=0, rn%11=0
  FROM (SELECT id, row_number() OVER (ORDER BY random()) rn FROM public.patients LIMIT 26) p;

  ---------------------------------------------------------------- CENTRO CIRÚRGICO (hoje)
  IF (SELECT count(*) FROM public.surgical_procedures WHERE scheduled_date::date = current_date) = 0 THEN
    INSERT INTO public.surgical_procedures
      (patient_id, surgeon_id, procedure_type, description, scheduled_date, start_time, end_time,
       anesthesia_type, anesthetist_name, team_members, status, room, insurance, surgery_character,
       needs_icu, surgical_risk, priority, is_inpatient, accommodation)
    SELECT p.id, prof,
           (ARRAY['Facectomia com LIO','Vitrectomia posterior','Pterígio','Colecistectomia videolaparoscópica','Herniorrafia inguinal'])[rn],
           'Procedimento demonstrativo para apresentação',
           current_date + time '08:00' + ((rn-1)*interval '90 minutes'),
           current_date + time '08:00' + ((rn-1)*interval '90 minutes'),
           current_date + time '09:15' + ((rn-1)*interval '90 minutes'),
           (ARRAY['Local com sedação','Geral','Local','Geral','Raquianestesia'])[rn],
           (ARRAY['Dr. Paulo Menezes','Dra. Renata Lopes','Dr. Paulo Menezes','Dra. Renata Lopes','Dr. Paulo Menezes'])[rn],
           'Instrumentador, Circulante, Técnico de anestesia',
           (ARRAY['concluido','em_andamento','agendado','agendado','agendado'])[rn],
           'Sala '||(1+((rn-1)%3)),
           (ARRAY['Unimed','SUS','Particular','SUS','Bradesco Saúde'])[rn],
           (ARRAY['eletiva','eletiva','eletiva','urgencia','eletiva'])[rn],
           rn IN (2,4), (ARRAY['baixo','moderado','baixo','alto','moderado'])[rn],
           CASE WHEN rn=4 THEN 'alta' ELSE 'normal' END,
           rn IN (4,5), (ARRAY['Ambulatorial','Apartamento','Ambulatorial','Enfermaria','Apartamento'])[rn]
    FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients LIMIT 5) p;
  END IF;

  ---------------------------------------------------------------- FILA / SENHAS DE HOJE
  IF (SELECT count(*) FROM public.queue_tickets WHERE created_at::date = current_date) = 0 THEN
    INSERT INTO public.queue_tickets
      (patient_id, ticket_number, ticket_type, priority, priority_code, queue_name, sector, status, source,
       called_at, called_to, attended_at, completed_at, recall_count, created_at)
    SELECT CASE WHEN rn%3=0 THEN p.id ELSE NULL END,
           (CASE WHEN rn%4=0 THEN 'PR' ELSE 'AT' END)||lpad(rn::text,3,'0'),
           CASE WHEN rn%4=0 THEN 'preferencial' ELSE 'normal' END,
           CASE WHEN rn%4=0 THEN 1 ELSE 3 END,
           CASE WHEN rn%4=0 THEN 'P' ELSE 'N' END,
           'Recepção Geral','Ambulatório',
           CASE WHEN rn<=10 THEN 'concluido' WHEN rn<=13 THEN 'em_atendimento' WHEN rn=14 THEN 'ausente' ELSE 'aguardando' END,
           CASE WHEN rn%2=0 THEN 'totem' ELSE 'recepcao' END,
           CASE WHEN rn<=13 THEN now() - ((20-rn)||' minutes')::interval END,
           CASE WHEN rn<=13 THEN 'Guichê '||(1+(rn%3)) END,
           CASE WHEN rn<=13 THEN now() - ((19-rn)||' minutes')::interval END,
           CASE WHEN rn<=10 THEN now() - ((10-rn)||' minutes')::interval END,
           CASE WHEN rn=14 THEN 3 ELSE 0 END,
           now() - ((40-rn)||' minutes')::interval
    FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients LIMIT 18) p;
  END IF;

  ---------------------------------------------------------------- EXAMES / PRESCRIÇÕES / VITAIS / EVOLUÇÕES
  INSERT INTO public.exam_requests (patient_id, requested_by, exam_type, exam_category, priority, status, observations, created_at)
  SELECT p.id, prof,
         (ARRAY['Hemograma completo','Glicemia de jejum','Raio-X de tórax','Tomografia de crânio','OCT de mácula','Ultrassom abdominal'])[1+(rn%6)],
         (ARRAY['laboratorio','laboratorio','imagem','imagem','imagem','imagem'])[1+(rn%6)],
         CASE WHEN rn%7=0 THEN 'urgente' ELSE 'rotina' END,
         (ARRAY['solicitado','solicitado','coletado','resultado_disponivel'])[1+(rn%4)],
         'Solicitação demonstrativa',
         now() - ((rn)||' hours')::interval
  FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients LIMIT 22) p;

  INSERT INTO public.medications (patient_id, prescribed_by, name, dosage, frequency, route, start_date, status, instructions)
  SELECT p.id, prof,
         (ARRAY['Dipirona','Amoxicilina','Omeprazol','Losartana','Colírio Moxifloxacino','Prednisolona'])[1+(rn%6)],
         (ARRAY['500 mg','875 mg','20 mg','50 mg','1 gota','20 mg'])[1+(rn%6)],
         (ARRAY['6/6h','8/8h','1x ao dia','1x ao dia','4x ao dia','12/12h'])[1+(rn%6)],
         (ARRAY['oral','oral','oral','oral','ocular','oral'])[1+(rn%6)],
         current_date - (rn%4), 'ativo'::medication_status, 'Prescrição demonstrativa'
  FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients WHERE status='internado' LIMIT 12) p;

  INSERT INTO public.vital_signs (patient_id, recorded_by, temperature, heart_rate, respiratory_rate,
    blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, pain_level, glucose, recorded_at)
  SELECT p.id, prof,
         36.0 + (random()*2)::numeric(3,1), 60+(random()*45)::int, 12+(random()*10)::int,
         100+(random()*50)::int, 60+(random()*30)::int, 90+(random()*10)::int,
         (random()*6)::int, 70+(random()*90)::int,
         now() - ((s.h)||' hours')::interval
  FROM (SELECT id FROM public.patients WHERE status='internado' LIMIT 12) p
  CROSS JOIN generate_series(1,6) s(h);

  INSERT INTO public.evolution_notes (patient_id, professional_id, note_type, content, subjective, objective, assessment, plan, created_at)
  SELECT p.id, prof, 'medica',
         'Evolução demonstrativa gerada para apresentação do sistema.',
         'Paciente refere melhora das queixas iniciais, sem novas intercorrências.',
         'Bom estado geral, corado, hidratado, eupneico. Sinais vitais estáveis.',
         'Evolução clínica favorável, resposta adequada ao tratamento instituído.',
         'Manter conduta atual, reavaliar em 24h e seguir com exames pendentes.',
         now() - ((rn)||' hours')::interval
  FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients WHERE status='internado' LIMIT 12) p;

  ---------------------------------------------------------------- ESTOQUE
  IF (SELECT count(*) FROM public.stock_items) = 0 THEN
    INSERT INTO public.stock_items (stock_type, name, code, category, unit_measure, current_balance, min_balance, batch, expiry_date, location, status)
    VALUES
      ('farmacia','Dipirona 500mg comprimido','MED-001','Analgésico','cx',420,150,'LT2411', current_date+240,'Farmácia Central','ativo'),
      ('farmacia','Amoxicilina 875mg','MED-002','Antibiótico','cx',88,120,'LT2418', current_date+180,'Farmácia Central','ativo'),
      ('farmacia','Omeprazol 20mg','MED-003','Gastro','cx',260,100,'LT2402', current_date+300,'Farmácia Central','ativo'),
      ('farmacia','Soro Fisiológico 0,9% 500ml','MED-004','Soluções','un',640,300,'LT2431', current_date+420,'Almoxarifado','ativo'),
      ('farmacia','Colírio Moxifloxacino','MED-005','Oftálmico','fr',35,40,'LT2409', current_date+90,'Farmácia Central','ativo'),
      ('farmacia','Midazolam 5mg/ml','MED-006','Controlado','amp',54,60,'LT2405', current_date+150,'Farmácia Controlados','ativo'),
      ('almoxarifado','Luva de procedimento M','ALM-001','EPI','cx',180,100,'LT2440', current_date+540,'Almoxarifado','ativo'),
      ('almoxarifado','Máscara cirúrgica tripla','ALM-002','EPI','cx',95,120,'LT2441', current_date+500,'Almoxarifado','ativo'),
      ('almoxarifado','Seringa 10ml','ALM-003','Descartáveis','pct',310,150,'LT2442', current_date+600,'Almoxarifado','ativo'),
      ('almoxarifado','Gaze estéril 7,5x7,5','ALM-004','Curativos','pct',72,90,'LT2443', current_date+380,'Almoxarifado','ativo'),
      ('almoxarifado','Álcool 70% 1L','ALM-005','Higienização','un',140,80,'LT2444', current_date+270,'Almoxarifado','ativo'),
      ('almoxarifado','Lente intraocular dobrável','ALM-006','OPME','un',22,15,'LT2445', current_date+720,'CME','ativo');

    INSERT INTO public.stock_movements (stock_item_id, movement_type, quantity, batch, origin, destination, notes, moved_at)
    SELECT i.id,
           CASE WHEN g%3=0 THEN 'entrada' ELSE 'saida' END,
           (5+random()*30)::int, i.batch,
           CASE WHEN g%3=0 THEN 'Fornecedor' ELSE 'Farmácia Central' END,
           CASE WHEN g%3=0 THEN 'Almoxarifado' ELSE (ARRAY['UTI','Centro Cirúrgico','Ambulatório','Internação'])[1+(g%4)] END,
           'Movimentação demonstrativa', now() - ((g)||' days')::interval
    FROM public.stock_items i CROSS JOIN generate_series(1,4) g;
  END IF;

  ---------------------------------------------------------------- FINANCEIRO / FATURAMENTO (mês atual)
  INSERT INTO public.accounts_receivable (patient_id, source, amount, due_date, received_at, status, document_number, installment_number, installment_total, notes)
  SELECT p.id,
         (ARRAY['Consulta particular','Convênio Unimed','Convênio SUS','Procedimento cirúrgico','Exames de imagem'])[1+(rn%5)],
         (180 + random()*4200)::numeric(10,2),
         date_trunc('month', current_date)::date + ((rn*2)%27),
         CASE WHEN rn%3=0 THEN date_trunc('month', current_date)::date + ((rn*2)%27) END,
         CASE WHEN rn%3=0 THEN 'recebido' WHEN rn%7=0 THEN 'vencido' ELSE 'aberto' END,
         'REC-'||to_char(current_date,'YYYYMM')||'-'||lpad(rn::text,3,'0'), 1, 1, 'Lançamento demonstrativo'
  FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients LIMIT 30) p;

  INSERT INTO public.accounts_payable (supplier, category, cost_center, amount, due_date, paid_at, status, payment_method, document_number, installment_number, installment_total, notes)
  SELECT (ARRAY['Distribuidora MedFarma','Energia Elétrica','Locação de Equipamentos','Serviços de Limpeza','Manutenção Predial','Fornecedor OPME'])[1+(g%6)],
         (ARRAY['Medicamentos','Utilidades','Equipamentos','Serviços','Manutenção','OPME'])[1+(g%6)],
         (ARRAY['Farmácia','Administrativo','Centro Cirúrgico','Administrativo','Infraestrutura','Centro Cirúrgico'])[1+(g%6)],
         (900 + random()*28000)::numeric(10,2),
         date_trunc('month', current_date)::date + ((g*3)%27),
         CASE WHEN g%2=0 THEN date_trunc('month', current_date)::date + ((g*3)%27) END,
         CASE WHEN g%2=0 THEN 'pago' WHEN g%5=0 THEN 'vencido' ELSE 'aberto' END,
         (ARRAY['boleto','pix','transferencia','boleto'])[1+(g%4)],
         'PAG-'||to_char(current_date,'YYYYMM')||'-'||lpad(g::text,3,'0'), 1, 1, 'Lançamento demonstrativo'
  FROM generate_series(1,24) g;

  INSERT INTO public.billing_accounts (patient_id, insurance_name, competence, amount, status, inconsistencies, notes, created_at)
  SELECT p.id,
         (ARRAY['SUS','Unimed','Bradesco Saúde','Amil','Particular'])[1+(rn%5)],
         to_char(current_date,'YYYY-MM'),
         (250 + random()*5200)::numeric(10,2),
         (ARRAY['aberto','em_analise','faturado','faturado','glosado'])[1+(rn%5)],
         CASE WHEN rn%5=4 THEN 'Divergência de código de procedimento' END,
         'Conta demonstrativa', now() - ((rn)||' hours')::interval
  FROM (SELECT id, row_number() OVER (ORDER BY random())::int rn FROM public.patients LIMIT 28) p;

END $$;
