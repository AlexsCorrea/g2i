
-- ========== Tipos GLOBAIS de senha ==========
CREATE TABLE IF NOT EXISTS public.totem_ticket_types_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  label text NOT NULL,
  prefix text NOT NULL DEFAULT 'N',
  color text DEFAULT '#1e5a8a',
  default_display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- código normalizado e único (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_totem_ticket_types_global_code
  ON public.totem_ticket_types_global (lower(code));

ALTER TABLE public.totem_ticket_types_global ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ttg_select_all" ON public.totem_ticket_types_global;
DROP POLICY IF EXISTS "ttg_insert_auth" ON public.totem_ticket_types_global;
DROP POLICY IF EXISTS "ttg_update_auth" ON public.totem_ticket_types_global;
DROP POLICY IF EXISTS "ttg_delete_auth" ON public.totem_ticket_types_global;
CREATE POLICY "ttg_select_all" ON public.totem_ticket_types_global FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ttg_insert_auth" ON public.totem_ticket_types_global FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ttg_update_auth" ON public.totem_ticket_types_global FOR UPDATE TO authenticated USING (true);
CREATE POLICY "ttg_delete_auth" ON public.totem_ticket_types_global FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS totem_ttg_updated ON public.totem_ticket_types_global;
CREATE TRIGGER totem_ttg_updated BEFORE UPDATE ON public.totem_ticket_types_global
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== Vínculo unidade × tipo global ==========
CREATE TABLE IF NOT EXISTS public.totem_unit_ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.totem_units(id) ON DELETE CASCADE,
  ticket_type_global_id uuid NOT NULL REFERENCES public.totem_ticket_types_global(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  color_override text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id, ticket_type_global_id)
);
CREATE INDEX IF NOT EXISTS idx_tutt_unit ON public.totem_unit_ticket_types(unit_id);

ALTER TABLE public.totem_unit_ticket_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tutt_select_all" ON public.totem_unit_ticket_types;
DROP POLICY IF EXISTS "tutt_insert_auth" ON public.totem_unit_ticket_types;
DROP POLICY IF EXISTS "tutt_update_auth" ON public.totem_unit_ticket_types;
DROP POLICY IF EXISTS "tutt_delete_auth" ON public.totem_unit_ticket_types;
CREATE POLICY "tutt_select_all" ON public.totem_unit_ticket_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tutt_insert_auth" ON public.totem_unit_ticket_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tutt_update_auth" ON public.totem_unit_ticket_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "tutt_delete_auth" ON public.totem_unit_ticket_types FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS totem_tutt_updated ON public.totem_unit_ticket_types;
CREATE TRIGGER totem_tutt_updated BEFORE UPDATE ON public.totem_unit_ticket_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== Prioridades por vínculo ==========
CREATE TABLE IF NOT EXISTS public.totem_unit_ticket_type_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_ticket_type_id uuid NOT NULL REFERENCES public.totem_unit_ticket_types(id) ON DELETE CASCADE,
  priority_code text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_ticket_type_id, priority_code)
);

ALTER TABLE public.totem_unit_ticket_type_priorities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tuttp_select_all" ON public.totem_unit_ticket_type_priorities;
DROP POLICY IF EXISTS "tuttp_insert_auth" ON public.totem_unit_ticket_type_priorities;
DROP POLICY IF EXISTS "tuttp_update_auth" ON public.totem_unit_ticket_type_priorities;
DROP POLICY IF EXISTS "tuttp_delete_auth" ON public.totem_unit_ticket_type_priorities;
CREATE POLICY "tuttp_select_all" ON public.totem_unit_ticket_type_priorities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tuttp_insert_auth" ON public.totem_unit_ticket_type_priorities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tuttp_update_auth" ON public.totem_unit_ticket_type_priorities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "tuttp_delete_auth" ON public.totem_unit_ticket_type_priorities FOR DELETE TO authenticated USING (true);

-- ========== Migração de dados (segura, sem perda) ==========
-- 1) Consolidar tipos globais a partir dos códigos existentes
INSERT INTO public.totem_ticket_types_global (code, label, prefix, color, default_display_order, active)
SELECT
  lower(t.code) AS code,
  (array_agg(t.label ORDER BY t.updated_at DESC))[1] AS label,
  (array_agg(t.prefix ORDER BY t.updated_at DESC))[1] AS prefix,
  (array_agg(t.color  ORDER BY t.updated_at DESC))[1] AS color,
  COALESCE(min(t.display_order), 0) AS default_display_order,
  bool_or(t.active) AS active
FROM public.totem_ticket_types t
GROUP BY lower(t.code)
ON CONFLICT ((lower(code))) DO NOTHING;

-- 2) Criar vínculos por unidade
INSERT INTO public.totem_unit_ticket_types (unit_id, ticket_type_global_id, enabled, display_order, color_override)
SELECT
  t.unit_id,
  g.id,
  t.active,
  t.display_order,
  CASE WHEN t.color IS DISTINCT FROM g.color THEN t.color ELSE NULL END
FROM public.totem_ticket_types t
JOIN public.totem_ticket_types_global g ON g.code = lower(t.code)
ON CONFLICT (unit_id, ticket_type_global_id) DO NOTHING;

-- 3) Copiar prioridades atuais para o vínculo
INSERT INTO public.totem_unit_ticket_type_priorities (unit_ticket_type_id, priority_code, enabled)
SELECT
  utt.id,
  ttp.priority_code,
  ttp.enabled
FROM public.totem_ticket_type_priorities ttp
JOIN public.totem_ticket_types t ON t.id = ttp.ticket_type_id
JOIN public.totem_ticket_types_global g ON g.code = lower(t.code)
JOIN public.totem_unit_ticket_types utt
  ON utt.unit_id = t.unit_id AND utt.ticket_type_global_id = g.id
ON CONFLICT (unit_ticket_type_id, priority_code) DO NOTHING;
