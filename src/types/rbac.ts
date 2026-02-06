/**
 * RBAC (Role-Based Access Control) Types
 * Flow 1 v4 - Fronted Admin Dashboard
 */

export type PermissionLevel = 'none' | 'view' | 'manage' | 'approve' | 'admin';

export interface RBACModule {
  id: string;
  key: string;
  name: string;
  description: string | null;
  available_permissions: string[];
  display_order: number;
  created_at: string;
}

export interface RBACRole {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  privilege_level: number;
  created_by: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RBACRolePermission {
  id: string;
  role_id: string;
  module_id: string;
  permission_level: PermissionLevel;
  created_at: string;
  updated_at: string;
}

export interface RBACTeamMember {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role_id: string;
  organization_id: string | null;
  status: 'pending' | 'active' | 'inactive';
  invited_by: string | null;
  invited_at: string;
  activated_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  role?: RBACRole;
}

export interface RoleWithPermissions extends RBACRole {
  permissions: Record<string, PermissionLevel>; // module_key -> permission_level
}

export interface ModulePermissionConfig {
  module: RBACModule;
  permission: PermissionLevel;
}

// Permission matrix for role editing
export type PermissionMatrix = Record<string, PermissionLevel>; // module_key -> level

// Form data for creating/editing roles
export interface RoleFormData {
  name: string;
  description: string;
  permissions: PermissionMatrix;
}

// Form data for inviting team members
export interface InviteFormData {
  name: string;
  email: string;
  role_id: string;
}
