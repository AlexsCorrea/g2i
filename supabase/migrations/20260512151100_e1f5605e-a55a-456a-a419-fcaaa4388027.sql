-- 1. observations on totem_units
ALTER TABLE public.totem_units ADD COLUMN IF NOT EXISTS observations text;

-- 2. institution_settings (singleton)
CREATE TABLE IF NOT EXISTS public.institution_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'OftalmoCenter',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inst_select_all" ON public.institution_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "inst_insert_auth" ON public.institution_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "inst_update_auth" ON public.institution_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_inst_updated BEFORE UPDATE ON public.institution_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.institution_settings (name) SELECT 'OftalmoCenter' WHERE NOT EXISTS (SELECT 1 FROM public.institution_settings);

-- 3. queue_tickets.priority_code
ALTER TABLE public.queue_tickets ADD COLUMN IF NOT EXISTS priority_code text NOT NULL DEFAULT 'normal';

-- 4. amarração tipo<->prioridade
CREATE TABLE IF NOT EXISTS public.totem_ticket_type_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_type_id uuid NOT NULL REFERENCES public.totem_ticket_types(id) ON DELETE CASCADE,
  priority_code text NOT NULL CHECK (priority_code IN ('normal','preferencial','preferencial_60','preferencial_80')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_type_id, priority_code)
);
CREATE INDEX IF NOT EXISTS idx_ttp_type ON public.totem_ticket_type_priorities(ticket_type_id);
ALTER TABLE public.totem_ticket_type_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ttp_select_all" ON public.totem_ticket_type_priorities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ttp_insert_auth" ON public.totem_ticket_type_priorities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ttp_update_auth" ON public.totem_ticket_type_priorities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ttp_delete_auth" ON public.totem_ticket_type_priorities FOR DELETE TO authenticated USING (true);

-- 5. limpar tipos que viraram prioridade e reseed por unidade
DELETE FROM public.totem_ticket_types WHERE code IN ('preferencial','idoso60','idoso80');

-- Ambulatório (já tem 'consulta')
INSERT INTO public.totem_ticket_types (unit_id, code, label, prefix, priority, color, display_order, active)
SELECT '2fa3090e-abe6-4bd5-85e7-def649d97169', 'retorno', 'Retorno', 'R', 0, '#0ea5e9', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.totem_ticket_types WHERE unit_id='2fa3090e-abe6-4bd5-85e7-def649d97169' AND code='retorno');
INSERT INTO public.totem_ticket_types (unit_id, code, label, prefix, priority, color, display_order, active)
SELECT '2fa3090e-abe6-4bd5-85e7-def649d97169', 'exames', 'Exames', 'E', 0, '#8b5cf6', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.totem_ticket_types WHERE unit_id='2fa3090e-abe6-4bd5-85e7-def649d97169' AND code='exames');
INSERT INTO public.totem_ticket_types (unit_id, code, label, prefix, priority, color, display_order, active)
SELECT '2fa3090e-abe6-4bd5-85e7-def649d97169', 'financeiro', 'Financeiro', 'F', 0, '#16a34a', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.totem_ticket_types WHERE unit_id='2fa3090e-abe6-4bd5-85e7-def649d97169' AND code='financeiro');

-- Pronto-Socorro: triagem/urgencia já existem; adicionar consulta
INSERT INTO public.totem_ticket_types (unit_id, code, label, prefix, priority, color, display_order, active)
SELECT '993c91d0-7a11-4bc6-a971-8dd49156f5b3', 'consulta', 'Consulta', 'C', 0, '#1e5a8a', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.totem_ticket_types WHERE unit_id='993c91d0-7a11-4bc6-a971-8dd49156f5b3' AND code='consulta');

-- Seed de prioridades para todos os tipos atuais
-- Regras: financeiro = normal+preferencial; acompanhante = só normal; demais = todas as 4
INSERT INTO public.totem_ticket_type_priorities (ticket_type_id, priority_code, enabled)
SELECT t.id, p.code, true
FROM public.totem_ticket_types t
CROSS JOIN (VALUES ('normal'), ('preferencial'), ('preferencial_60'), ('preferencial_80')) AS p(code)
WHERE t.code NOT IN ('financeiro','acompanhante')
ON CONFLICT DO NOTHING;

INSERT INTO public.totem_ticket_type_priorities (ticket_type_id, priority_code, enabled)
SELECT t.id, p.code, true
FROM public.totem_ticket_types t
CROSS JOIN (VALUES ('normal'), ('preferencial')) AS p(code)
WHERE t.code = 'financeiro'
ON CONFLICT DO NOTHING;

INSERT INTO public.totem_ticket_type_priorities (ticket_type_id, priority_code, enabled)
SELECT t.id, 'normal', true
FROM public.totem_ticket_types t
WHERE t.code = 'acompanhante'
ON CONFLICT DO NOTHING;

-- Backfill priority_code em queue_tickets antigos
UPDATE public.queue_tickets SET priority_code = CASE
  WHEN ticket_type='preferencial_80' THEN 'preferencial_80'
  WHEN ticket_type='preferencial_60' THEN 'preferencial_60'
  WHEN ticket_type='preferencial' THEN 'preferencial'
  ELSE 'normal' END
WHERE priority_code IS NULL OR priority_code = 'normal';