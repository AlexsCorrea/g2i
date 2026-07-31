-- 1) Private helper schema (not exposed through the Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _user_id
  );
$$;

REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- 2) Backfill user_roles from existing profiles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id,
  CASE p.role::text
    WHEN 'admin' THEN 'admin'::public.app_role
    WHEN 'medico' THEN 'medico'::public.app_role
    WHEN 'enfermeiro' THEN 'enfermeiro'::public.app_role
    WHEN 'farmaceutico' THEN 'farmacia'::public.app_role
    WHEN 'tecnico_enfermagem' THEN 'tecnico'::public.app_role
    ELSE 'usuario'::public.app_role
  END
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

-- 3) Lock down helper/trigger functions from anonymous execution
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 4) Replace every blanket "any authenticated user" policy with a staff check
DO $do$
DECLARE
  r RECORD;
  sql text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles = ARRAY['authenticated']::name[]
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    sql := format('ALTER POLICY %I ON public.%I', r.policyname, r.tablename);
    IF r.qual = 'true' THEN
      sql := sql || ' USING (private.is_staff(auth.uid()))';
    END IF;
    IF r.with_check = 'true' THEN
      sql := sql || ' WITH CHECK (private.is_staff(auth.uid()))';
    END IF;
    EXECUTE sql;
  END LOOP;
END
$do$;

-- 5) Remove anonymous access to clinical / queue data
DROP POLICY IF EXISTS "Anon pode confirmar checkin" ON public.appointments;
DROP POLICY IF EXISTS "Anon pode buscar agendamentos para checkin" ON public.appointments;
DROP POLICY IF EXISTS "Anon pode buscar pacientes para checkin" ON public.patients;
DROP POLICY IF EXISTS "Anon pode atualizar cadastro no portal" ON public.patients;
DROP POLICY IF EXISTS "Anon pode ver tickets" ON public.queue_tickets;

DROP POLICY IF EXISTS "Tickets podem ser atualizados" ON public.queue_tickets;
CREATE POLICY "Equipe pode atualizar tickets"
ON public.queue_tickets FOR UPDATE TO authenticated
USING (private.is_staff(auth.uid()))
WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Qualquer um pode criar ticket" ON public.queue_tickets;
CREATE POLICY "Equipe pode criar ticket"
ON public.queue_tickets FOR INSERT TO authenticated
WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Counters acessíveis" ON public.queue_counters;
CREATE POLICY "Equipe gerencia contadores"
ON public.queue_counters FOR ALL TO authenticated
USING (private.is_staff(auth.uid()))
WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Sistema pode criar histórico" ON public.queue_history;
CREATE POLICY "Equipe registra histórico"
ON public.queue_history FOR INSERT TO authenticated
WITH CHECK (private.is_staff(auth.uid()));

REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.queue_tickets FROM anon;
REVOKE ALL ON public.queue_counters FROM anon;
REVOKE ALL ON public.queue_history FROM anon;

-- 6) Storage: private bucket for clinical exam files
DROP POLICY IF EXISTS "Staff can view exam files" ON storage.objects;
CREATE POLICY "Staff can view exam files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam-files' AND private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can upload exam files" ON storage.objects;
CREATE POLICY "Staff can upload exam files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exam-files' AND private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update exam files" ON storage.objects;
CREATE POLICY "Staff can update exam files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'exam-files' AND private.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'exam-files' AND private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete exam files" ON storage.objects;
CREATE POLICY "Staff can delete exam files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exam-files' AND private.is_staff(auth.uid()));

-- 7) Branding bucket: public URLs keep working, but anonymous listing is removed
DROP POLICY IF EXISTS "Public can view exam files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view exam files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload exam files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exam files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete exam files" ON storage.objects;

CREATE POLICY "Staff can read branding assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'exam-gallery' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff can upload branding assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exam-gallery' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff can update branding assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'exam-gallery' AND private.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'exam-gallery' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff can delete branding assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'exam-gallery' AND private.is_staff(auth.uid()));