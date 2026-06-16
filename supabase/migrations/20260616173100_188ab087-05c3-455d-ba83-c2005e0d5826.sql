
-- 1. Expand lab_equipment with full benchtop interfacing fields
ALTER TABLE public.lab_equipment
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS equipment_type TEXT,
  ADD COLUMN IF NOT EXISTS analytes TEXT[],
  ADD COLUMN IF NOT EXISTS current_situation TEXT,
  ADD COLUMN IF NOT EXISTS current_system TEXT,
  ADD COLUMN IF NOT EXISTS serial_port TEXT,
  ADD COLUMN IF NOT EXISTS baud_rate INTEGER,
  ADD COLUMN IF NOT EXISTS data_bits INTEGER,
  ADD COLUMN IF NOT EXISTS stop_bits INTEGER,
  ADD COLUMN IF NOT EXISTS parity TEXT,
  ADD COLUMN IF NOT EXISTS handshake TEXT,
  ADD COLUMN IF NOT EXISTS file_directory TEXT,
  ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'unidirecional',
  ADD COLUMN IF NOT EXISTS homolog_status TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS last_communication_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'offline';

-- 2. Local agents / bridges
CREATE TABLE IF NOT EXISTS public.lab_equipment_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  equipment_id UUID REFERENCES public.lab_equipment(id) ON DELETE SET NULL,
  agent_version TEXT,
  host_machine TEXT,
  os_info TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_equipment_agents TO authenticated;
GRANT ALL ON public.lab_equipment_agents TO service_role;
ALTER TABLE public.lab_equipment_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents read auth" ON public.lab_equipment_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "agents insert auth" ON public.lab_equipment_agents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "agents update auth" ON public.lab_equipment_agents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "agents delete auth" ON public.lab_equipment_agents FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_lab_equipment_agents_updated BEFORE UPDATE ON public.lab_equipment_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Raw messages received from equipment
CREATE TABLE IF NOT EXISTS public.lab_equipment_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES public.lab_equipment(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.lab_equipment_agents(id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'in',
  protocol TEXT,
  raw_payload TEXT NOT NULL,
  parsed_payload JSONB,
  sample_barcode TEXT,
  status TEXT NOT NULL DEFAULT 'recebido',
  parse_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  reprocessed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_equipment_messages TO authenticated;
GRANT ALL ON public.lab_equipment_messages TO service_role;
ALTER TABLE public.lab_equipment_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msgs read auth" ON public.lab_equipment_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "msgs insert auth" ON public.lab_equipment_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "msgs update auth" ON public.lab_equipment_messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "msgs delete auth" ON public.lab_equipment_messages FOR DELETE TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_equip_msgs_equipment ON public.lab_equipment_messages(equipment_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_equip_msgs_status ON public.lab_equipment_messages(status);
CREATE INDEX IF NOT EXISTS idx_equip_msgs_barcode ON public.lab_equipment_messages(sample_barcode);

-- 4. Analyte mapping per equipment (equipment-code -> internal exam/component)
CREATE TABLE IF NOT EXISTS public.lab_equipment_analyte_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.lab_equipment(id) ON DELETE CASCADE,
  equipment_code TEXT NOT NULL,
  analyte_name TEXT NOT NULL,
  exam_id UUID REFERENCES public.lab_exams(id) ON DELETE SET NULL,
  component_id UUID REFERENCES public.lab_exam_components(id) ON DELETE SET NULL,
  unit TEXT,
  decimal_places INTEGER,
  multiplier NUMERIC DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (equipment_id, equipment_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_equipment_analyte_map TO authenticated;
GRANT ALL ON public.lab_equipment_analyte_map TO service_role;
ALTER TABLE public.lab_equipment_analyte_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amap read auth" ON public.lab_equipment_analyte_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "amap insert auth" ON public.lab_equipment_analyte_map FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "amap update auth" ON public.lab_equipment_analyte_map FOR UPDATE TO authenticated USING (true);
CREATE POLICY "amap delete auth" ON public.lab_equipment_analyte_map FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_lab_equipment_analyte_map_updated BEFORE UPDATE ON public.lab_equipment_analyte_map FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
