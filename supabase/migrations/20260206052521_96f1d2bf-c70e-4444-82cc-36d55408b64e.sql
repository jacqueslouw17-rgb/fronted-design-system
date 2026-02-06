-- RBAC bootstrap: ensure the first authenticated user can administer RBAC safely
-- Creates a SECURITY DEFINER function that assigns the first user the system Owner role.

CREATE OR REPLACE FUNCTION public.rbac_bootstrap_owner()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _email text;
  _owner_role_id uuid;
  _member_id uuid;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RETURN NULL;
  END IF;

  -- Only bootstrap if there are no team members yet
  IF EXISTS (SELECT 1 FROM public.rbac_team_members LIMIT 1) THEN
    RETURN NULL;
  END IF;

  _email := NULLIF(current_setting('request.jwt.claim.email', true), '');
  IF _email IS NULL THEN
    -- Fallback: should rarely happen, but keeps NOT NULL happy
    _email := concat('user+', _uid::text, '@unknown.local');
  END IF;

  SELECT id
  INTO _owner_role_id
  FROM public.rbac_roles
  WHERE is_system_role = true
    AND privilege_level = 100
  LIMIT 1;

  IF _owner_role_id IS NULL THEN
    RAISE EXCEPTION 'Owner role not found';
  END IF;

  INSERT INTO public.rbac_team_members (
    email,
    name,
    role_id,
    status,
    invited_at,
    invited_by,
    activated_at,
    user_id
  )
  VALUES (
    _email,
    NULL,
    _owner_role_id,
    'active',
    now(),
    _uid,
    now(),
    _uid
  )
  RETURNING id INTO _member_id;

  RETURN _member_id;
END;
$$;

REVOKE ALL ON FUNCTION public.rbac_bootstrap_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rbac_bootstrap_owner() TO authenticated;
