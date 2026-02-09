/**
 * RBAC Hook - Role-Based Access Control
 * Flow 1 v4 - Fronted Admin Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  RBACModule,
  RBACRole,
  RBACRolePermission,
  RBACTeamMember,
  RoleWithPermissions,
  PermissionLevel,
  RoleFormData,
  InviteFormData,
  PermissionMatrix
} from '@/types/rbac';

interface UseRBACReturn {
  // Data
  modules: RBACModule[];
  roles: RoleWithPermissions[];
  deletedRoleTemplates: RoleWithPermissions[]; // Roles deleted but kept as templates
  teamMembers: RBACTeamMember[];
  currentUserRole: RoleWithPermissions | null;
  
  // Loading states
  loading: boolean;
  rolesLoading: boolean;
  membersLoading: boolean;
  
  // Permissions
  canManageRoles: boolean;
  canInviteUsers: boolean;
  
  // Role actions
  createRole: (data: RoleFormData) => Promise<boolean>;
  updateRole: (roleId: string, data: RoleFormData) => Promise<boolean>;
  deleteRole: (roleId: string) => Promise<boolean>;
  duplicateRole: (roleId: string, newName: string) => Promise<boolean>;
  
  // Team member actions
  inviteMember: (data: InviteFormData) => Promise<boolean>;
  updateMemberRole: (memberId: string, roleId: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  resendInvite: (memberId: string) => Promise<boolean>;
  
  // Helpers
  getRoleById: (roleId: string) => RoleWithPermissions | undefined;
  getMemberCountForRole: (roleId: string) => number;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
  
  // Refresh
  refresh: () => Promise<void>;
}

// Demo mode: bypass authentication checks for Flow 1 v4 demo
const DEMO_MODE = true;
const DEMO_USER_ID = 'demo-admin-user';

export function useRBAC(): UseRBACReturn {
  const [modules, setModules] = useState<RBACModule[]>([]);
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [deletedRoleTemplates, setDeletedRoleTemplates] = useState<RoleWithPermissions[]>([]);
  const [teamMembers, setTeamMembers] = useState<RBACTeamMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<RoleWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(DEMO_MODE ? DEMO_USER_ID : null);

  // Load modules
  const loadModules = useCallback(async () => {
    const { data, error } = await supabase
      .from('rbac_modules')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error loading modules:', error);
      return [];
    }
    return data as RBACModule[];
  }, []);

  // Load roles with permissions
  const loadRoles = useCallback(async (moduleList: RBACModule[]) => {
    setRolesLoading(true);
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('rbac_roles')
      .select('*')
      .order('privilege_level', { ascending: false });
    
    if (rolesError) {
      console.error('Error loading roles:', rolesError);
      setRolesLoading(false);
      return [];
    }

    const { data: permissionsData, error: permError } = await supabase
      .from('rbac_role_permissions')
      .select('*');
    
    if (permError) {
      console.error('Error loading permissions:', permError);
      setRolesLoading(false);
      return [];
    }

    // Create module key lookup
    const moduleKeyById = new Map(moduleList.map(m => [m.id, m.key]));

    // Build roles with permissions
    const rolesWithPerms: RoleWithPermissions[] = (rolesData as RBACRole[]).map(role => {
      const rolePerms = (permissionsData as RBACRolePermission[]).filter(p => p.role_id === role.id);
      const permissions: PermissionMatrix = {};
      
      rolePerms.forEach(p => {
        const moduleKey = moduleKeyById.get(p.module_id);
        if (moduleKey) {
          permissions[moduleKey] = p.permission_level;
        }
      });

      return { ...role, permissions };
    });

    setRolesLoading(false);
    return rolesWithPerms;
  }, []);

  // Load team members
  const loadTeamMembers = useCallback(async (rolesList: RoleWithPermissions[]) => {
    setMembersLoading(true);
    
    const { data, error } = await supabase
      .from('rbac_team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading team members:', error);
      setMembersLoading(false);
      return [];
    }

    // Attach role data
    const membersWithRoles: RBACTeamMember[] = (data as RBACTeamMember[]).map(member => ({
      ...member,
      role: rolesList.find(r => r.id === member.role_id)
    }));

    setMembersLoading(false);
    return membersWithRoles;
  }, []);

  // Get current user's role
  const loadCurrentUserRole = useCallback(async (userId: string, membersList: RBACTeamMember[], rolesList: RoleWithPermissions[]) => {
    const currentMember = membersList.find(m => m.user_id === userId && m.status === 'active');
    if (currentMember) {
      return rolesList.find(r => r.id === currentMember.role_id) || null;
    }
    return null;
  }, []);

  // Main data load
  const loadAllData = useCallback(async () => {
    setLoading(true);

    // Demo mode: provide fully-functional UI data without requiring auth/RLS.
    // This keeps role creation + permission picking usable on the demo profile-settings screen.
    if (DEMO_MODE) {
      const now = new Date().toISOString();

      const demoModules: RBACModule[] = [
        {
          id: "demo-module-hiring_onboarding",
          key: "hiring_onboarding",
          name: "Hiring & Onboarding Pipeline",
          description: "View pipeline, move candidates, trigger actions",
          available_permissions: ["view", "manage"],
          display_order: 1,
          created_at: now,
        },
        {
          id: "demo-module-candidate_profiles",
          key: "candidate_profiles",
          name: "Candidate & Worker Profiles",
          description: "View worker details and onboarding summaries",
          available_permissions: ["view", "manage"],
          display_order: 2,
          created_at: now,
        },
        {
          id: "demo-module-contracts",
          key: "contracts",
          name: "Contracts",
          description: "Draft, edit, send, and approve contracts",
          available_permissions: ["view", "manage", "approve"],
          display_order: 3,
          created_at: now,
        },
        {
          id: "demo-module-payroll",
          key: "payroll",
          name: "Payroll",
          description: "Manage submissions/exceptions and approve payroll",
          available_permissions: ["view", "manage", "approve"],
          display_order: 4,
          created_at: now,
        },
        {
          id: "demo-module-company_settings",
          key: "company_settings",
          name: "Company Settings",
          description: "Edit company profile details and configuration",
          available_permissions: ["view", "manage"],
          display_order: 5,
          created_at: now,
        },
        {
          id: "demo-module-support_requests",
          key: "support_requests",
          name: "Support & Requests",
          description: "View and create support requests",
          available_permissions: ["view", "manage"],
          display_order: 6,
          created_at: now,
        },
        {
          id: "demo-module-user_management",
          key: "user_management",
          name: "User Management",
          description: "Invite users and manage roles & access",
          available_permissions: ["view", "manage", "admin"],
          display_order: 7,
          created_at: now,
        },
      ];

      const demoRoles: RoleWithPermissions[] = [
        {
          id: "demo-role-owner",
          name: "Owner",
          description: "Super admin",
          is_system_role: true,
          privilege_level: 100,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "manage",
            candidate_profiles: "manage",
            contracts: "approve",
            payroll: "approve",
            company_settings: "manage",
            support_requests: "manage",
            user_management: "admin",
          },
        },
        {
          id: "demo-role-admin",
          name: "Admin",
          description: "Ops admin",
          is_system_role: true,
          privilege_level: 80,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "manage",
            candidate_profiles: "manage",
            contracts: "approve",
            payroll: "approve",
            company_settings: "manage",
            support_requests: "manage",
            user_management: "manage",
          },
        },
        {
          id: "demo-role-payroll",
          name: "Payroll Specialist",
          description: "Payroll operations",
          is_system_role: true,
          privilege_level: 40,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "view",
            candidate_profiles: "view",
            contracts: "none",
            payroll: "manage",
            company_settings: "none",
            support_requests: "none",
            user_management: "none",
          },
        },
        {
          id: "demo-role-contracts",
          name: "Contract Specialist",
          description: "Contracts operations",
          is_system_role: true,
          privilege_level: 40,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "view",
            candidate_profiles: "view",
            contracts: "manage",
            payroll: "none",
            company_settings: "none",
            support_requests: "none",
            user_management: "none",
          },
        },
        {
          id: "demo-role-onboarding",
          name: "Onboarding Coordinator",
          description: "Pipeline + profiles",
          is_system_role: true,
          privilege_level: 20,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "manage",
            candidate_profiles: "view",
            contracts: "none",
            payroll: "none",
            company_settings: "none",
            support_requests: "none",
            user_management: "none",
          },
        },
        {
          id: "demo-role-viewer",
          name: "Viewer",
          description: "Read-only",
          is_system_role: true,
          privilege_level: 10,
          created_by: null,
          organization_id: null,
          created_at: now,
          updated_at: now,
          permissions: {
            hiring_onboarding: "view",
            candidate_profiles: "view",
            contracts: "view",
            payroll: "view",
            company_settings: "view",
            support_requests: "view",
            user_management: "none",
          },
        },
      ];

      const demoMembers: RBACTeamMember[] = [
        {
          id: "demo-member-1",
          user_id: DEMO_USER_ID,
          email: "demo@fronted.local",
          name: "Demo Admin",
          role_id: "demo-role-owner",
          organization_id: null,
          status: "active",
          invited_by: null,
          invited_at: now,
          activated_at: now,
          last_active_at: now,
          created_at: now,
          updated_at: now,
          role: demoRoles[0],
        },
      ];

      setCurrentUserId(DEMO_USER_ID);
      setModules(demoModules);
      setRoles(demoRoles);
      setTeamMembers(demoMembers);
      setCurrentUserRole(demoRoles[0]);
      setRolesLoading(false);
      setMembersLoading(false);
      setLoading(false);
      return;
    }

    let userId: string | null = null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    userId = session?.user?.id || null;

    setCurrentUserId(userId);

    // Bootstrap: if this is the first user ever, ensure they become the Owner
    // so RBAC insert/update policies (server-side) will allow role/member management.
    if (userId) {
      try {
        await supabase.rpc('rbac_bootstrap_owner');
      } catch (e) {
        // Non-fatal: UI will still load; actions may be blocked by policies.
        console.warn('rbac_bootstrap_owner failed', e);
      }
    }

    const moduleList = await loadModules();
    setModules(moduleList);

    const rolesList = await loadRoles(moduleList);
    setRoles(rolesList);

    const membersList = await loadTeamMembers(rolesList);
    setTeamMembers(membersList);

    if (userId) {
      const userRole = await loadCurrentUserRole(userId, membersList, rolesList);
      setCurrentUserRole(userRole);
    }

    setLoading(false);
  }, [loadModules, loadRoles, loadTeamMembers, loadCurrentUserRole]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Computed permissions
  // Demo mode OR bootstrap mode: grant full access
  const isBootstrapMode = teamMembers.length === 0;
  const canManageRoles = DEMO_MODE || isBootstrapMode || 
    currentUserRole?.permissions?.user_management === 'admin' || 
    (currentUserRole?.privilege_level || 0) >= 100;
  
  const canInviteUsers = DEMO_MODE || isBootstrapMode || canManageRoles || 
    (currentUserRole?.privilege_level || 0) >= 80;

  // Role actions
  const createRole = async (data: RoleFormData): Promise<boolean> => {
    try {
      if (!DEMO_MODE && !currentUserId) {
        toast.error('Please sign in to manage roles');
        return false;
      }

      if (!DEMO_MODE && !currentUserRole) {
        toast.error('Your access is still loading—try again in a second');
        return false;
      }

      // Demo mode: create role locally without hitting the database (RLS would block)
      if (DEMO_MODE) {
        const newRole: RoleWithPermissions = {
          id: `demo-${Date.now()}`,
          name: data.name,
          description: data.description,
          is_system_role: false,
          privilege_level: 30,
          created_by: null,
          organization_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          permissions: data.permissions,
        };
        setRoles(prev => [...prev, newRole]);
        toast.success(`Role "${data.name}" created successfully`);
        return true;
      }

      // Get current user's privilege level for escalation check
      const userPrivilege = currentUserRole?.privilege_level || 0;

      // Insert role
      const { data: newRole, error: roleError } = await supabase
        .from('rbac_roles')
        .insert({
          name: data.name,
          description: data.description,
          is_system_role: false,
          privilege_level: Math.max(1, Math.min(userPrivilege - 1, 50)),
          created_by: currentUserId,
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Insert permissions
      const permissionInserts = Object.entries(data.permissions)
        .map(([moduleKey, level]) => {
          const module = modules.find(m => m.key === moduleKey);
          if (!module) return null;
          return {
            role_id: newRole.id,
            module_id: module.id,
            permission_level: level,
          };
        })
        .filter(Boolean);

      if (permissionInserts.length > 0) {
        const { error: permError } = await supabase
          .from('rbac_role_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;
      }

      toast.success(`Role "${data.name}" created successfully`);
      await loadAllData();
      return true;
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error(error?.message || 'Failed to create role');
      return false;
    }
  };

  const updateRole = async (roleId: string, data: RoleFormData): Promise<boolean> => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      // Demo mode: update locally without hitting the database
      if (DEMO_MODE) {
        setRoles(prev => prev.map(r => 
          r.id === roleId 
            ? { ...r, name: data.name, description: data.description, permissions: data.permissions, updated_at: new Date().toISOString() }
            : r
        ));
        toast.success(`Role "${data.name}" updated successfully`);
        return true;
      }

      // Update role
      const { error: roleError } = await supabase
        .from('rbac_roles')
        .update({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId);

      if (roleError) throw roleError;

      // Update permissions - delete all and re-insert
      await supabase
        .from('rbac_role_permissions')
        .delete()
        .eq('role_id', roleId);

      const permissionInserts = Object.entries(data.permissions).map(([moduleKey, level]) => {
        const module = modules.find(m => m.key === moduleKey);
        if (!module) return null;
        return {
          role_id: roleId,
          module_id: module.id,
          permission_level: level
        };
      }).filter(Boolean);

      if (permissionInserts.length > 0) {
        const { error: permError } = await supabase
          .from('rbac_role_permissions')
          .insert(permissionInserts);
        
        if (permError) throw permError;
      }

      toast.success(`Role "${data.name}" updated successfully`);
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
      return false;
    }
  };

  const deleteRole = async (roleId: string): Promise<boolean> => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      // Check if role is assigned to any members
      const assignedCount = getMemberCountForRole(roleId);
      if (assignedCount > 0) {
        toast.error(`Cannot delete role. ${assignedCount} member(s) are assigned to this role.`);
        return false;
      }

      // Demo mode: delete locally without hitting the database
      // Keep the role as a template for future use
      if (DEMO_MODE) {
        setDeletedRoleTemplates(prev => [...prev, role]);
        setRoles(prev => prev.filter(r => r.id !== roleId));
        toast.success(`Role "${role.name}" deleted successfully`);
        return true;
      }

      const { error } = await supabase
        .from('rbac_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success(`Role "${role.name}" deleted successfully`);
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
      return false;
    }
  };

  const duplicateRole = async (roleId: string, newName: string): Promise<boolean> => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      return await createRole({
        name: newName,
        description: `Copy of ${role.name}`,
        permissions: role.permissions
      });
    } catch (error) {
      console.error('Error duplicating role:', error);
      toast.error('Failed to duplicate role');
      return false;
    }
  };

  // Team member actions
  const inviteMember = async (data: InviteFormData): Promise<boolean> => {
    try {
      // Check escalation prevention (skip in demo mode)
      const targetRole = roles.find(r => r.id === data.role_id);
      if (!targetRole) throw new Error('Role not found');
      
      if (!DEMO_MODE) {
        const userPrivilege = currentUserRole?.privilege_level || 0;
        if (targetRole.privilege_level > userPrivilege) {
          toast.error('Cannot assign a role with higher privileges than your own');
          return false;
        }
      }

      // Check if email already exists
      const existing = teamMembers.find(m => m.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        toast.error('A team member with this email already exists');
        return false;
      }

      // Demo mode: add member locally without hitting the database
      if (DEMO_MODE) {
        const now = new Date().toISOString();
        const newMember: RBACTeamMember = {
          id: `demo-member-${Date.now()}`,
          user_id: null,
          email: data.email,
          name: data.name || null,
          role_id: data.role_id,
          organization_id: null,
          status: 'pending',
          invited_by: null,
          invited_at: now,
          activated_at: null,
          last_active_at: null,
          created_at: now,
          updated_at: now,
          role: targetRole,
        };
        setTeamMembers(prev => [newMember, ...prev]);
        toast.success(`Invitation sent to ${data.email}`);
        return true;
      }

      const { error } = await supabase
        .from('rbac_team_members')
        .insert({
          email: data.email,
          name: data.name || null,
          role_id: data.role_id,
          status: 'pending',
          invited_by: currentUserId
        });

      if (error) throw error;

      toast.success(`Invitation sent to ${data.email}`);
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, roleId: string): Promise<boolean> => {
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      const targetRole = roles.find(r => r.id === roleId);
      if (!targetRole) throw new Error('Role not found');

      // Escalation check (skip in demo mode)
      if (!DEMO_MODE) {
        const userPrivilege = currentUserRole?.privilege_level || 0;
        if (targetRole.privilege_level > userPrivilege) {
          toast.error('Cannot assign a role with higher privileges than your own');
          return false;
        }
      }

      const { error } = await supabase
        .from('rbac_team_members')
        .update({ role_id: roleId, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`Role updated for ${member.name || member.email}`);
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update role');
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      // Prevent removing self
      if (member.user_id === currentUserId) {
        toast.error('You cannot remove yourself');
        return false;
      }

      const { error } = await supabase
        .from('rbac_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`${member.name || member.email} removed from team`);
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
      return false;
    }
  };

  const resendInvite = async (memberId: string): Promise<boolean> => {
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      // Update invited_at to now (simulates resend)
      const { error } = await supabase
        .from('rbac_team_members')
        .update({ invited_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      toast.success(`Invitation resent to ${member.email}`);
      return true;
    } catch (error) {
      console.error('Error resending invite:', error);
      toast.error('Failed to resend invitation');
      return false;
    }
  };

  // Helpers
  const getRoleById = (roleId: string) => roles.find(r => r.id === roleId);

  const getMemberCountForRole = (roleId: string) => 
    teamMembers.filter(m => m.role_id === roleId).length;

  const getPermissionSummary = (permissions: PermissionMatrix): string => {
    const parts: string[] = [];
    
    const manageable = Object.entries(permissions)
      .filter(([_, level]) => level === 'manage' || level === 'approve' || level === 'admin')
      .map(([key]) => {
        const mod = modules.find(m => m.key === key);
        return mod?.name.split(' ')[0] || key;
      });
    
    const viewOnly = Object.entries(permissions)
      .filter(([_, level]) => level === 'view')
      .map(([key]) => {
        const mod = modules.find(m => m.key === key);
        return mod?.name.split(' ')[0] || key;
      });

    if (manageable.length > 0) {
      parts.push(`Can manage ${manageable.slice(0, 3).join(', ')}${manageable.length > 3 ? '...' : ''}`);
    }
    if (viewOnly.length > 0) {
      parts.push(`view ${viewOnly.slice(0, 2).join(', ')}${viewOnly.length > 2 ? '...' : ''}`);
    }

    return parts.join(', ') || 'No permissions';
  };

  return {
    modules,
    roles,
    deletedRoleTemplates,
    teamMembers,
    currentUserRole,
    loading,
    rolesLoading,
    membersLoading,
    canManageRoles,
    canInviteUsers,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvite,
    getRoleById,
    getMemberCountForRole,
    getPermissionSummary,
    refresh: loadAllData
  };
}
