/**
 * Roles & Permissions Section - Manage roles (drawer-based)
 * Flow 1 v4 - Fronted Admin Dashboard
 */

import { useState } from "react";
import { Copy, Loader2, Lock, MoreHorizontal, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useRBAC } from "@/hooks/useRBAC";
import type { RoleFormData, RoleWithPermissions } from "@/types/rbac";
import { RoleEditorDrawer } from "./RoleEditorDrawer";

interface RolesPermissionsSectionProps {
  onBack: () => void;
}

export function RolesPermissionsSection({ onBack }: RolesPermissionsSectionProps) {
  const {
    modules,
    roles,
    loading,
    canManageRoles,
    createRole,
    updateRole,
    deleteRole,
    getMemberCountForRole,
    getPermissionSummary,
  } = useRBAC();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [initialData, setInitialData] = useState<RoleFormData | undefined>(undefined);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
  const [processing, setProcessing] = useState(false);

  const systemRoles = roles.filter((r) => r.is_system_role);
  const customRoles = roles.filter((r) => !r.is_system_role);

  const openCreate = () => {
    setEditingRole(null);
    setInitialData(undefined);
    setEditorOpen(true);
  };

  const openEdit = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setInitialData(undefined);
    setEditorOpen(true);
  };

  const openDuplicate = (role: RoleWithPermissions) => {
    setEditingRole(null);
    setInitialData({
      name: `${role.name} (Copy)`,
      description: `Copy of ${role.name}`,
      permissions: { ...role.permissions },
    });
    setEditorOpen(true);
  };

  const handleSaveRole = async (roleId: string | null, data: RoleFormData): Promise<boolean> => {
    if (roleId) return await updateRole(roleId, data);
    return await createRole(data);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    setProcessing(true);
    await deleteRole(roleToDelete.id);
    setRoleToDelete(null);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const RoleRow = ({ role }: { role: RoleWithPermissions }) => {
    const memberCount = getMemberCountForRole(role.id);
    const canDelete = !role.is_system_role && memberCount === 0;

    return (
      <div className="bg-card/60 border border-border/30 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground truncate">{role.name}</span>
              {role.is_system_role && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="h-2.5 w-2.5" />
                  System
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="line-clamp-1">
                {role.description || getPermissionSummary(role.permissions)}
              </span>
              <span className="shrink-0 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {memberCount}
              </span>
            </div>
          </div>

          {canManageRoles && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!role.is_system_role && (
                  <DropdownMenuItem onClick={() => openEdit(role)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit role
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openDuplicate(role)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {!role.is_system_role && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setRoleToDelete(role)}
                      disabled={!canDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                      {memberCount > 0 && (
                        <span className="ml-auto text-xs opacity-60">({memberCount} assigned)</span>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-card/40 border border-border/40 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Roles & permissions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {roles.length} role{roles.length !== 1 ? "s" : ""} configured
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={onBack} size="sm">
              Back
            </Button>
            {canManageRoles && (
              <Button onClick={openCreate} className="gap-1.5" size="sm">
                <Plus className="h-4 w-4" />
                Create role
              </Button>
            )}
          </div>
        </div>

        {systemRoles.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              System roles
            </p>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {systemRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                  >
                    <RoleRow role={role} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Custom roles
          </p>

          {customRoles.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {customRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -60 }}
                  >
                    <RoleRow role={role} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-10 text-center">
              <Plus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-base font-medium text-foreground mb-1">No custom roles yet</p>
              <p className="text-sm text-muted-foreground">
                Create a role tailored to your team’s responsibilities.
              </p>
            </div>
          )}
        </div>
      </div>

      <RoleEditorDrawer
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            setEditingRole(null);
            setInitialData(undefined);
          }
        }}
        modules={modules}
        role={editingRole}
        initialData={initialData}
        onSave={handleSaveRole}
        getPermissionSummary={getPermissionSummary}
      />

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete “{roleToDelete?.name}”? This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
