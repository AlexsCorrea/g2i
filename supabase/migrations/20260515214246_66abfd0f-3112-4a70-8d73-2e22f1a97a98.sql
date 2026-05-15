-- TV Panels: physical TV/panel devices, independent of units
CREATE TABLE public.tv_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  ads_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  locution_enabled BOOLEAN NOT NULL DEFAULT true,
  show_history BOOLEAN NOT NULL DEFAULT true,
  show_clock BOOLEAN NOT NULL DEFAULT true,
  primary_color TEXT,
  secondary_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tv_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TV panels readable by everyone"
  ON public.tv_panels FOR SELECT
  USING (true);

CREATE POLICY "TV panels manageable by authenticated"
  ON public.tv_panels FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER update_tv_panels_updated_at
  BEFORE UPDATE ON public.tv_panels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Future structure: link a queue ticket call to specific TV panels.
-- NOT used yet (current TV continues to show all calls).
CREATE TABLE public.queue_ticket_tv_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  tv_panel_id UUID NOT NULL REFERENCES public.tv_panels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, tv_panel_id)
);

CREATE INDEX idx_qttv_ticket ON public.queue_ticket_tv_targets(ticket_id);
CREATE INDEX idx_qttv_panel ON public.queue_ticket_tv_targets(tv_panel_id);

ALTER TABLE public.queue_ticket_tv_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TV targets readable by everyone"
  ON public.queue_ticket_tv_targets FOR SELECT
  USING (true);

CREATE POLICY "TV targets manageable by authenticated"
  ON public.queue_ticket_tv_targets FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);