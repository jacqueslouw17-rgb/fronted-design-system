/**
 * RBAC User Management Section
 * Combines Team Members + Roles & Permissions with tabs
 * Flow 1 v4 - Fronted Admin Dashboard
 */

import { useState } from "react";
import { ArrowLeft, Users, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/hooks/useRBAC";
import { TeamMembersList } from "./TeamMembersList";
import { RolesList } from "./RolesList";
import { InviteMemberModal } from "./InviteMemberModal";
import { RoleEditorDrawer } from "./RoleEditorDrawer";
import type { RoleWithPermissions, RoleFormData } from "@/types/rbac";

interface RBACUserManagementProps {
  onBack: () => void;
}

export function RBACUserManagement({ onBack }: RBACUserManagementProps) {
  const {
    modules,
    roles,
    teamMembers,
    currentUserRole,
    loading,
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
    getMemberCountForRole,
    getPermissionSummary,
  } = useRBAC();

  const [activeTab, setActiveTab] = useState<"members" | "roles">("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);

  const currentUserPrivilege = currentUserRole?.privilege_level || 0;

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleEditor(true);
  };

  const handleEditRole = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setShowRoleEditor(true);
  };

  const handleSaveRole = async (roleId: string | null, data: RoleFormData): Promise<boolean> => {
    if (roleId) {
      return await updateRole(roleId, data);
    } else {
      return await createRole(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members and their access permissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "members" | "roles")}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="members" className="gap-1.5 flex-1 sm:flex-none">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 flex-1 sm:flex-none">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <TeamMembersList
            members={teamMembers}
            roles={roles}
            canManageRoles={canManageRoles}
            canInviteUsers={canInviteUsers}
            currentUserPrivilege={currentUserPrivilege}
            onInvite={() => setShowInviteModal(true)}
            onUpdateRole={updateMemberRole}
            onRemove={removeMember}
            onResendInvite={resendInvite}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesList
            roles={roles}
            canManageRoles={canManageRoles}
            getMemberCountForRole={getMemberCountForRole}
            getPermissionSummary={getPermissionSummary}
            onCreateRole={handleCreateRole}
            onEditRole={handleEditRole}
            onDuplicateRole={duplicateRole}
            onDeleteRole={deleteRole}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        roles={roles}
        currentUserPrivilege={currentUserPrivilege}
        onInvite={inviteMember}
        getPermissionSummary={getPermissionSummary}
      />

      <RoleEditorDrawer
        open={showRoleEditor}
        onOpenChange={setShowRoleEditor}
        modules={modules}
        role={editingRole}
        existingRoles={roles}
        onSave={handleSaveRole}
        getPermissionSummary={getPermissionSummary}
      />
    </div>
  );
}
