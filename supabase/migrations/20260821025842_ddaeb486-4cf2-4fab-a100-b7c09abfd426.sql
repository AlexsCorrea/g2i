
DELETE FROM public.queue_tickets WHERE created_at::date = current_date AND source in ('totem','recepcao','portal');

INSERT INTO public.queue_tickets (patient_id, ticket_number, ticket_type, priority, priority_code, queue_name, sector, status, source, unit_id, device_id, created_at, called_at, called_to, attended_at, recall_count)
SELECT p.patient_id, p.num, p.tp, p.pr, p.pc, 'recepcao', 'recepcao', p.st, p.src,
 '2fa3090e-abe6-4bd5-85e7-def649d97169'::uuid, 'a8d2b86a-dea1-4a45-85d4-c1ffcfd4964d'::uuid,
 now() - (p.mins || ' minutes')::interval,
 p.called, p.guiche, p.att, p.rc
FROM (VALUES
 (NULL::uuid,'C001','consulta',0,'normal','concluida','totem',95, now()-interval '80 min','Guichê 01', now()-interval '78 min',0),
 ('f5e658fa-208b-41bb-a117-47c1e903d94f'::uuid,'P8001','consulta',4,'preferencial_80','concluida','totem',90, now()-interval '75 min','Guichê 02', now()-interval '74 min',0),
 (NULL,'E001','exames',0,'normal','concluida','totem',85, now()-interval '70 min','Guichê 03', now()-interval '69 min',1),
 ('ba240a11-0d1e-4f76-9106-b962aa2ff616','P6001','retorno',3,'preferencial_60','em_atendimento','totem',60, now()-interval '20 min','Guichê 01', now()-interval '18 min',0),
 (NULL,'C002','consulta',0,'normal','em_atendimento','totem',55, now()-interval '15 min','Guichê 02', now()-interval '13 min',0),
 ('7e4ee960-41ae-400f-8da7-b87a5fb7e740','PR001','consulta',2,'preferencial','chamada','totem',42, now()-interval '2 min','Guichê 03', NULL,1),
 (NULL,'F001','financeiro',0,'normal','chamada','totem',40, now()-interval '1 min','Guichê 04', NULL,2),
 ('0d936a49-a551-4f60-8fb7-b491e3a43f28','P8002','consulta',4,'preferencial_80','aguardando','totem',38, NULL,NULL,NULL,0),
 (NULL,'P6002','exames',3,'preferencial_60','aguardando','totem',34, NULL,NULL,NULL,0),
 ('c01a634d-d2a7-4244-8449-2a9a27ee7c19','PR002','retorno',2,'preferencial','aguardando','totem',31, NULL,NULL,NULL,0),
 (NULL,'PR003','consulta',2,'preferencial','aguardando','recepcao',28, NULL,NULL,NULL,0),
 ('a2cfc064-afa4-4c15-82e0-bae43856f721','C003','consulta',0,'normal','aguardando','totem',26, NULL,NULL,NULL,0),
 (NULL,'C004','consulta',0,'normal','aguardando','totem',24, NULL,NULL,NULL,0),
 ('5fb1cfe1-b103-4f44-a939-895816880181','E002','exames',0,'normal','aguardando','totem',21, NULL,NULL,NULL,0),
 (NULL,'E003','exames',0,'normal','aguardando','portal',18, NULL,NULL,NULL,0),
 ('87f4e0c1-c9a8-456c-9097-b1e979608607','R001','retorno',0,'normal','aguardando','totem',16, NULL,NULL,NULL,0),
 (NULL,'R002','retorno',0,'normal','aguardando','totem',13, NULL,NULL,NULL,0),
 ('090961db-6d50-4e2e-97cb-22e14cce65fa','F002','financeiro',0,'normal','aguardando','totem',11, NULL,NULL,NULL,0),
 (NULL,'C005','consulta',0,'normal','aguardando','totem',9, NULL,NULL,NULL,0),
 ('9980e1c8-31b6-4457-88b9-5c06b5dfadfb','P8003','consulta',4,'preferencial_80','aguardando','totem',7, NULL,NULL,NULL,0),
 (NULL,'C006','consulta',0,'normal','aguardando','totem',5, NULL,NULL,NULL,0),
 ('966e7951-a26d-45ba-a8f2-5495d5114c40','E004','exames',0,'normal','aguardando','totem',3, NULL,NULL,NULL,0),
 (NULL,'F003','financeiro',0,'normal','aguardando','totem',2, NULL,NULL,NULL,0),
 (NULL,'C007','consulta',0,'normal','ausente','totem',50, now()-interval '30 min','Guichê 01', NULL,3)
) AS p(patient_id, num, tp, pr, pc, st, src, mins, called, guiche, att, rc);
