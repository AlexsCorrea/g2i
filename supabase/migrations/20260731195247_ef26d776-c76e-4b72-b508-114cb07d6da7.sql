CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER POLICY user_roles_admin_insert ON public.user_roles
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY user_roles_admin_update ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY user_roles_admin_delete ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);