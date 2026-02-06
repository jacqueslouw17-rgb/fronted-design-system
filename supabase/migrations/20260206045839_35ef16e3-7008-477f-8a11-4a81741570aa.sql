-- =============================================
-- RBAC System for Flow 1 v4 - Fronted Admin Dashboard
-- =============================================

-- 1. Create enum for permission levels
CREATE TYPE public.permission_level AS ENUM ('none', 'view', 'manage', 'approve', 'admin');

-- 2. Create roles table (system + custom roles)
CREATE TABLE public.rbac_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    privilege_level INTEGER NOT NULL DEFAULT 0, -- Higher = more privileged (for escalation prevention)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID, -- For multi-tenant support
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create modules table (represents product areas)
CREATE TABLE public.rbac_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE, -- e.g., 'hiring_onboarding', 'contracts', 'payroll'
    name TEXT NOT NULL,
    description TEXT,
    available_permissions TEXT[] NOT NULL DEFAULT ARRAY['view', 'manage'], -- Which permission levels apply
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create role permissions table (junction)
CREATE TABLE public.rbac_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.rbac_roles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.rbac_modules(id) ON DELETE CASCADE,
    permission_level permission_level NOT NULL DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(role_id, module_id)
);

-- 5. Create team members table (user assignments)
CREATE TABLE public.rbac_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL, -- For pending invites
    name TEXT,
    role_id UUID NOT NULL REFERENCES public.rbac_roles(id) ON DELETE RESTRICT,
    organization_id UUID, -- For multi-tenant
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    activated_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE public.rbac_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_team_members ENABLE ROW LEVEL SECURITY;

-- 7. Create helper function to check RBAC permission
CREATE OR REPLACE FUNCTION public.has_rbac_permission(
    _user_id UUID,
    _module_key TEXT,
    _required_level permission_level
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM rbac_team_members tm
        JOIN rbac_roles r ON r.id = tm.role_id
        JOIN rbac_role_permissions rp ON rp.role_id = r.id
        JOIN rbac_modules m ON m.id = rp.module_id
        WHERE tm.user_id = _user_id
          AND tm.status = 'active'
          AND m.key = _module_key
          AND rp.permission_level::text = _required_level::text
    )
$$;

-- 8. Create function to check if user can manage roles
CREATE OR REPLACE FUNCTION public.can_manage_rbac(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM rbac_team_members tm
        JOIN rbac_roles r ON r.id = tm.role_id
        JOIN rbac_role_permissions rp ON rp.role_id = r.id
        JOIN rbac_modules m ON m.id = rp.module_id
        WHERE tm.user_id = _user_id
          AND tm.status = 'active'
          AND m.key = 'user_management'
          AND rp.permission_level = 'admin'
    )
$$;

-- 9. RLS Policies for rbac_roles
CREATE POLICY "Authenticated users can view roles"
ON public.rbac_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only RBAC admins can insert roles"
ON public.rbac_roles FOR INSERT
TO authenticated
WITH CHECK (
    is_system_role = false AND public.can_manage_rbac(auth.uid())
);

CREATE POLICY "Only RBAC admins can update non-system roles"
ON public.rbac_roles FOR UPDATE
TO authenticated
USING (is_system_role = false AND public.can_manage_rbac(auth.uid()));

CREATE POLICY "Only RBAC admins can delete non-system roles"
ON public.rbac_roles FOR DELETE
TO authenticated
USING (is_system_role = false AND public.can_manage_rbac(auth.uid()));

-- 10. RLS Policies for rbac_modules
CREATE POLICY "Authenticated users can view modules"
ON public.rbac_modules FOR SELECT
TO authenticated
USING (true);

-- 11. RLS Policies for rbac_role_permissions
CREATE POLICY "Authenticated users can view role permissions"
ON public.rbac_role_permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only RBAC admins can manage role permissions"
ON public.rbac_role_permissions FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_rbac(auth.uid()));

CREATE POLICY "Only RBAC admins can update role permissions"
ON public.rbac_role_permissions FOR UPDATE
TO authenticated
USING (public.can_manage_rbac(auth.uid()));

CREATE POLICY "Only RBAC admins can delete role permissions"
ON public.rbac_role_permissions FOR DELETE
TO authenticated
USING (public.can_manage_rbac(auth.uid()));

-- 12. RLS Policies for rbac_team_members
CREATE POLICY "Authenticated users can view team members"
ON public.rbac_team_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "RBAC admins can insert team members"
ON public.rbac_team_members FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_rbac(auth.uid()));

CREATE POLICY "RBAC admins can update team members"
ON public.rbac_team_members FOR UPDATE
TO authenticated
USING (public.can_manage_rbac(auth.uid()));

CREATE POLICY "RBAC admins can delete team members"
ON public.rbac_team_members FOR DELETE
TO authenticated
USING (public.can_manage_rbac(auth.uid()));

-- 13. Insert default modules
INSERT INTO public.rbac_modules (key, name, description, available_permissions, display_order) VALUES
('hiring_onboarding', 'Hiring & Onboarding Pipeline', 'View pipeline, move candidates, trigger actions', ARRAY['view', 'manage'], 1),
('candidate_profiles', 'Candidate & Worker Profiles', 'View candidate/worker details and onboarding summaries', ARRAY['view', 'manage'], 2),
('contracts', 'Contracts', 'View, create, edit, send, and approve contracts', ARRAY['view', 'manage', 'approve'], 3),
('payroll', 'Payroll', 'View payroll cycles, manage submissions/exceptions, approve payroll', ARRAY['view', 'manage', 'approve'], 4),
('company_settings', 'Company Settings', 'Company profile, payroll config, compliance settings', ARRAY['view', 'manage'], 5),
('support_requests', 'Support & Requests', 'View and create support requests', ARRAY['view', 'manage'], 6),
('user_management', 'User Management (RBAC)', 'Invite/remove users, manage roles & permissions', ARRAY['admin'], 7);

-- 14. Insert default system roles
INSERT INTO public.rbac_roles (name, description, is_system_role, privilege_level) VALUES
('Owner', 'Super Admin with full access to everything including User Management & Roles', true, 100),
('Admin', 'Full operational access to pipeline, contracts, payroll. Can invite users.', true, 80),
('Payroll Specialist', 'Payroll view, manage, exceptions, and tracking. No contracts or user management.', true, 40),
('Contract Specialist', 'Contracts view, create/edit, send. No payroll approval or user management.', true, 40),
('Onboarding Coordinator', 'Hiring/Onboarding pipeline view and manage. Candidate profiles view only.', true, 20),
('Viewer', 'Read-only access across selected modules.', true, 10);

-- 15. Set up permissions for default roles
-- Owner (ID retrieved dynamically)
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id, 
    CASE 
        WHEN m.key = 'user_management' THEN 'admin'::permission_level
        WHEN 'approve' = ANY(m.available_permissions) THEN 'approve'::permission_level
        ELSE 'manage'::permission_level
    END
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Owner';

-- Admin
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id,
    CASE 
        WHEN m.key = 'user_management' THEN 'none'::permission_level
        WHEN 'approve' = ANY(m.available_permissions) THEN 'approve'::permission_level
        ELSE 'manage'::permission_level
    END
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Admin';

-- Payroll Specialist
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id,
    CASE 
        WHEN m.key = 'payroll' THEN 'manage'::permission_level
        WHEN m.key IN ('hiring_onboarding', 'candidate_profiles') THEN 'view'::permission_level
        ELSE 'none'::permission_level
    END
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Payroll Specialist';

-- Contract Specialist
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id,
    CASE 
        WHEN m.key = 'contracts' THEN 'manage'::permission_level
        WHEN m.key IN ('hiring_onboarding', 'candidate_profiles') THEN 'view'::permission_level
        ELSE 'none'::permission_level
    END
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Contract Specialist';

-- Onboarding Coordinator
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id,
    CASE 
        WHEN m.key = 'hiring_onboarding' THEN 'manage'::permission_level
        WHEN m.key = 'candidate_profiles' THEN 'view'::permission_level
        ELSE 'none'::permission_level
    END
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Onboarding Coordinator';

-- Viewer
INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id, 'view'::permission_level
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Viewer' AND m.key != 'user_management';

INSERT INTO public.rbac_role_permissions (role_id, module_id, permission_level)
SELECT r.id, m.id, 'none'::permission_level
FROM public.rbac_roles r
CROSS JOIN public.rbac_modules m
WHERE r.name = 'Viewer' AND m.key = 'user_management';

-- 16. Create trigger for updated_at
CREATE TRIGGER update_rbac_roles_updated_at
    BEFORE UPDATE ON public.rbac_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rbac_role_permissions_updated_at
    BEFORE UPDATE ON public.rbac_role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rbac_team_members_updated_at
    BEFORE UPDATE ON public.rbac_team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();