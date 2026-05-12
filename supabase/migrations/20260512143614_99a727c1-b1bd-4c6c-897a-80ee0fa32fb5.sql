
CREATE TABLE public.totem_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  observations text,
  logo_url text,
  primary_color text DEFAULT '#1e5a8a',
  secondary_color text DEFAULT '#0f3460',
  background_image_url text,
  privacy_mode text NOT NULL DEFAULT 'senha_iniciais',
  social_name_policy text NOT NULL DEFAULT 'iniciais_social',
  call_display_seconds integer NOT NULL DEFAULT 15,
  show_clock boolean NOT NULL DEFAULT true,
  show_history boolean NOT NULL DEFAULT true,
  ads_enabled boolean NOT NULL DEFAULT false,
  ads_interval_seconds integer NOT NULL DEFAULT 10,
  ads_idle_seconds integer NOT NULL DEFAULT 20,
  locution_enabled boolean NOT NULL DEFAULT true,
  locution_speak_priority boolean NOT NULL DEFAULT true,
  locution_speak_location boolean NOT NULL DEFAULT false,
  sound_enabled boolean NOT NULL DEFAULT true,
  voice_rate numeric NOT NULL DEFAULT 0.85,
  voice_pitch numeric NOT NULL DEFAULT 1.0,
  voice_volume numeric NOT NULL DEFAULT 1.0,
  voice_name text,
  pre_call_sound text NOT NULL DEFAULT 'triple_tone',
  totem_retirar_senha boolean NOT NULL DEFAULT true,
  totem_checkin boolean NOT NULL DEFAULT true,
  totem_timeout_seconds integer NOT NULL DEFAULT 60,
  result_countdown_seconds integer NOT NULL DEFAULT 30,
  print_enabled boolean NOT NULL DEFAULT false,
  print_auto boolean NOT NULL DEFAULT false,
  print_copies integer NOT NULL DEFAULT 1,
  print_paper_width text NOT NULL DEFAULT '80mm',
  print_show_logo boolean NOT NULL DEFAULT true,
  print_show_qr boolean NOT NULL DEFAULT true,
  print_header_text text NOT NULL DEFAULT 'Aguarde sua chamada no painel',
  print_footer_text text NOT NULL DEFAULT 'Apresente esta senha quando solicitado',
  print_template text NOT NULL DEFAULT 'standard',
  print_font_size text NOT NULL DEFAULT 'large',
  print_margin_top integer NOT NULL DEFAULT 2,
  print_margin_bottom integer NOT NULL DEFAULT 2,
  print_margin_left integer NOT NULL DEFAULT 2,
  print_margin_right integer NOT NULL DEFAULT 2,
  print_block_spacing integer NOT NULL DEFAULT 6,
  print_cut_extra_height integer NOT NULL DEFAULT 10,
  print_auto_cut boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.totem_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "totem_units_select_all" ON public.totem_units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "totem_units_insert_auth" ON public.totem_units FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "totem_units_update_auth" ON public.totem_units FOR UPDATE TO authenticated USING (true);
CREATE POLICY "totem_units_delete_auth" ON public.totem_units FOR DELETE TO authenticated USING (true);
CREATE TRIGGER totem_units_updated BEFORE UPDATE ON public.totem_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.totem_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.totem_units(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  device_identifier text,
  active boolean NOT NULL DEFAULT true,
  observations text,
  overrides jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_totem_devices_unit ON public.totem_devices(unit_id);
ALTER TABLE public.totem_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "totem_devices_select_all" ON public.totem_devices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "totem_devices_insert_auth" ON public.totem_devices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "totem_devices_update_auth" ON public.totem_devices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "totem_devices_delete_auth" ON public.totem_devices FOR DELETE TO authenticated USING (true);
CREATE TRIGGER totem_devices_updated BEFORE UPDATE ON public.totem_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.totem_ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.totem_units(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  prefix text NOT NULL DEFAULT 'N',
  priority integer NOT NULL DEFAULT 0,
  color text DEFAULT '#1e5a8a',
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id, code)
);
CREATE INDEX idx_totem_ticket_types_unit ON public.totem_ticket_types(unit_id);
ALTER TABLE public.totem_ticket_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "totem_tt_select_all" ON public.totem_ticket_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "totem_tt_insert_auth" ON public.totem_ticket_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "totem_tt_update_auth" ON public.totem_ticket_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "totem_tt_delete_auth" ON public.totem_ticket_types FOR DELETE TO authenticated USING (true);
CREATE TRIGGER totem_tt_updated BEFORE UPDATE ON public.totem_ticket_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.queue_tickets
  ADD COLUMN IF NOT EXISTS device_id uuid REFERENCES public.totem_devices(id),
  ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.totem_units(id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_device ON public.queue_tickets(device_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_unit ON public.queue_tickets(unit_id);

DO $$
DECLARE
  v_amb uuid;
  v_ps  uuid;
  v_cc  uuid;
BEGIN
  -- Migrate existing unit_config row into a default Ambulatório unit
  INSERT INTO public.totem_units (
    name, active, logo_url, primary_color, secondary_color, background_image_url,
    privacy_mode, social_name_policy, call_display_seconds, ads_enabled, ads_interval_seconds,
    locution_enabled, locution_speak_priority, locution_speak_location, sound_enabled,
    show_clock, show_history, ads_idle_seconds, totem_retirar_senha, totem_checkin,
    totem_timeout_seconds, voice_rate, voice_pitch, voice_volume, pre_call_sound,
    print_enabled, print_auto, print_copies, print_paper_width, print_show_logo,
    print_show_qr, print_header_text, print_footer_text, print_template, print_font_size,
    print_margin_top, print_margin_bottom, print_margin_left, print_margin_right,
    print_block_spacing, print_cut_extra_height, print_auto_cut, result_countdown_seconds
  )
  SELECT
    'Ambulatório', true, logo_url, primary_color, secondary_color, background_image_url,
    privacy_mode, social_name_policy, call_display_seconds, ads_enabled, ads_interval_seconds,
    locution_enabled, locution_speak_priority, locution_speak_location, sound_enabled,
    show_clock, show_history, ads_idle_seconds, totem_retirar_senha, totem_checkin,
    totem_timeout_seconds, voice_rate, voice_pitch, voice_volume, pre_call_sound,
    print_enabled, print_auto, print_copies, print_paper_width, print_show_logo,
    print_show_qr, print_header_text, print_footer_text, print_template, print_font_size,
    print_margin_top, print_margin_bottom, print_margin_left, print_margin_right,
    print_block_spacing, print_cut_extra_height, print_auto_cut, result_countdown_seconds
  FROM public.unit_config
  ORDER BY created_at LIMIT 1
  RETURNING id INTO v_amb;

  IF v_amb IS NULL THEN
    INSERT INTO public.totem_units (name) VALUES ('Ambulatório') RETURNING id INTO v_amb;
  END IF;

  INSERT INTO public.totem_units (name, primary_color, secondary_color, observations)
  VALUES ('Pronto-Socorro', '#b91c1c', '#7f1d1d', 'Atendimento de urgência e emergência')
  RETURNING id INTO v_ps;

  INSERT INTO public.totem_units (name, primary_color, secondary_color, observations)
  VALUES ('Centro Cirúrgico', '#047857', '#064e3b', 'Recepção do centro cirúrgico')
  RETURNING id INTO v_cc;

  INSERT INTO public.totem_devices (unit_id, name, location, device_identifier) VALUES
    (v_amb, 'Totem Ambulatório 1', 'Recepção principal - entrada', 'AMB-01'),
    (v_amb, 'Totem Ambulatório 2', 'Recepção principal - lateral', 'AMB-02'),
    (v_ps,  'Totem PS Recepção',   'Pronto-Socorro - entrada',     'PS-REC-01'),
    (v_ps,  'Totem PS Triagem',    'Pronto-Socorro - triagem',     'PS-TRI-01'),
    (v_cc,  'Totem CC',            'Centro Cirúrgico - hall',      'CC-01');

  INSERT INTO public.totem_ticket_types (unit_id, code, label, prefix, priority, color, display_order) VALUES
    (v_amb, 'consulta',     'Consulta',          'C',  0, '#1e5a8a', 1),
    (v_amb, 'retorno',      'Retorno',           'R',  0, '#0891b2', 2),
    (v_amb, 'preferencial', 'Preferencial',      'P',  1, '#d97706', 3),
    (v_amb, 'idoso60',      '60+',               'E',  2, '#b45309', 4),
    (v_amb, 'idoso80',      '80+',               'E',  3, '#92400e', 5),
    (v_ps,  'triagem',      'Triagem',           'T',  0, '#1e40af', 1),
    (v_ps,  'urgencia',     'Urgência',          'U',  3, '#b91c1c', 2),
    (v_ps,  'preferencial', 'Preferencial',      'P',  1, '#d97706', 3),
    (v_ps,  'idoso60',      '60+',               'E',  2, '#b45309', 4),
    (v_ps,  'idoso80',      '80+',               'E',  3, '#92400e', 5),
    (v_cc,  'admissao',     'Admissão Cirúrgica','A',  1, '#047857', 1),
    (v_cc,  'pos_op',       'Pós-operatório',    'O',  1, '#0d9488', 2),
    (v_cc,  'acompanhante', 'Acompanhante',      'X',  0, '#6b7280', 3);
END $$;
