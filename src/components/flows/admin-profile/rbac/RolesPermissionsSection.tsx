/**
 * Roles & Permissions Section - Standalone page for managing roles
 * Flow 1 v4 - Fronted Admin Dashboard
 * Dense table-style layout consistent with payroll patterns
 */

import { useState } from "react";
import { Plus, MoreHorizontal, Copy, Pencil, Trash2, Lock, Users, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useRBACContext } from "@/contexts/RBACContext";
import { RoleEditorDrawer } from "./RoleEditorDrawer";
import { cn } from "@/lib/utils";
import type { RoleWithPermissions } from "@/types/rbac";

interface RolesPermissionsSectionProps {
  onBack: () => void;
}

export function RolesPermissionsSection({ onBack }: RolesPermissionsSectionProps) {
  const {
    modules,
    roles,
    deletedRoleTemplates,
    loading,
    canManageRoles,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    getMemberCountForRole,
    getPermissionSummary,
  } = useRBACContext();

  // Combine active roles and deleted role templates for the editor dropdown
  const allRoleTemplates = [...roles, ...deletedRoleTemplates];

  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
  const [roleWithMembers, setRoleWithMembers] = useState<{ role: RoleWithPermissions; count: number } | null>(null);
  const [roleToDuplicate, setRoleToDuplicate] = useState<RoleWithPermissions | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleEditor(true);
  };

  const handleEditRole = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setShowRoleEditor(true);
  };

  const handleSaveRole = async (roleId: string | null, data: any): Promise<boolean> => {
    if (roleId) {
      return await updateRole(roleId, data);
    } else {
      return await createRole(data);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    setProcessing(true);
    await deleteRole(roleToDelete.id);
    setRoleToDelete(null);
    setProcessing(false);
  };

  const handleDuplicate = async () => {
    if (!roleToDuplicate || !duplicateName.trim()) return;
    setProcessing(true);
    await duplicateRole(roleToDuplicate.id, duplicateName.trim());
    setRoleToDuplicate(null);
    setDuplicateName("");
    setProcessing(false);
  };

  const systemRoles = roles.filter((r) => r.is_system_role);
  const customRoles = roles.filter((r) => !r.is_system_role);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const RoleRow = ({ role, isFirst, isLast }: { role: RoleWithPermissions; isFirst?: boolean; isLast?: boolean }) => {
    const memberCount = getMemberCountForRole(role.id);

    const handleDeleteClick = () => {
      if (memberCount > 0) {
        setRoleWithMembers({ role, count: memberCount });
      } else {
        setRoleToDelete(role);
      }
    };

    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
          isFirst && "rounded-t-xl",
          isLast && "rounded-b-xl"
        )}
      >
        {/* Role Info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate block">{role.name}</span>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {role.description || getPermissionSummary(role.permissions)}
            </p>
          </div>
        </div>

        {/* Member count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span>{memberCount}</span>
        </div>

        {/* Actions */}
        {canManageRoles && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-popover border border-border shadow-md">
              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRoleToDuplicate(role);
                  setDuplicateName(`${role.name} (Copy)`);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Roles & Permissions</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {roles.length} role{roles.length !== 1 ? "s" : ""} configured
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={onBack} size="sm">
              Back
            </Button>
            {canManageRoles && (
              <Button onClick={handleCreateRole} className="gap-1.5" size="sm">
                <Plus className="h-4 w-4" />
                Create Role
              </Button>
            )}
          </div>
        </div>

        {/* All roles in unified table */}
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden divide-y divide-border/30">
          <AnimatePresence mode="popLayout">
            {roles.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.15 }}
              >
                <RoleRow
                  role={role}
                  isFirst={idx === 0}
                  isLast={idx === roles.length - 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {roles.length === 0 && (
            <div className="py-10 text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground mb-0.5">No roles configured</p>
              <p className="text-xs text-muted-foreground">
                Create your first role to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Role Editor Drawer */}
      <RoleEditorDrawer
        open={showRoleEditor}
        onOpenChange={setShowRoleEditor}
        modules={modules}
        role={editingRole}
        existingRoles={roles}
        allRoleTemplates={allRoleTemplates}
        onSave={handleSaveRole}
        getPermissionSummary={getPermissionSummary}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="pr-8">
            <button
              onClick={() => setRoleToDelete(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{roleToDelete?.name}" role? This action cannot be
              undone.
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

      {/* Cannot Delete Warning */}
      <AlertDialog open={!!roleWithMembers} onOpenChange={() => setRoleWithMembers(null)}>
        <AlertDialogContent>
          <AlertDialogHeader className="pr-8">
            <button
              onClick={() => setRoleWithMembers(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <AlertDialogTitle>Cannot delete role</AlertDialogTitle>
            <AlertDialogDescription>
              The "{roleWithMembers?.role.name}" role is assigned to {roleWithMembers?.count} member{roleWithMembers?.count !== 1 ? "s" : ""}. 
              Reassign them to a different role before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Got it</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!roleToDuplicate} onOpenChange={() => setRoleToDuplicate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pr-8">
            <button
              onClick={() => setRoleToDuplicate(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors z-10"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <DialogTitle>Duplicate Role</DialogTitle>
            <DialogDescription>
              Create a copy of "{roleToDuplicate?.name}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="duplicateName" className="text-sm">
              New Role Name
            </Label>
            <Input
              id="duplicateName"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              className="mt-2"
              placeholder="Enter role name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleToDuplicate(null)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={processing || !duplicateName.trim()}>
              <Copy className="h-4 w-4 mr-1.5" />
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
