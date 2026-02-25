/**
 * Roles & Permissions Section — Flow 1 v5
 * Clean v7-style: flat rows, no header card, centered back button
 */

import { useState } from "react";
import { Plus, MoreHorizontal, Copy, Pencil, Trash2, Users, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useRBACContext } from "@/contexts/RBACContext";
import { RoleEditorDrawer } from "@/components/flows/admin-profile/rbac/RoleEditorDrawer";
import type { RoleWithPermissions } from "@/types/rbac";

interface Props {
  onBack: () => void;
}

export function F1v5_RolesPermissionsSection({ onBack }: Props) {
  const {
    modules, roles, deletedRoleTemplates, loading,
    canManageRoles, createRole, updateRole, deleteRole, duplicateRole,
    getMemberCountForRole, getPermissionSummary,
  } = useRBACContext();

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

  const handleDuplicate = async () => {
    if (!roleToDuplicate || !duplicateName.trim()) return;
    setProcessing(true);
    await duplicateRole(roleToDuplicate.id, duplicateName.trim());
    setRoleToDuplicate(null);
    setDuplicateName("");
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Create button row */}
      {canManageRoles && (
        <div className="flex justify-end mb-3">
          <Button onClick={handleCreateRole} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Create Role
          </Button>
        </div>
      )}

      {/* Role rows */}
      <div className="rounded-xl border border-border/30 bg-card/20 overflow-hidden divide-y divide-border/20">
        <AnimatePresence mode="popLayout">
          {roles.map((role) => {
            const memberCount = getMemberCountForRole(role.id);

            const handleDeleteClick = () => {
              if (memberCount > 0) {
                setRoleWithMembers({ role, count: memberCount });
              } else {
                setRoleToDelete(role);
              }
            };

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-card/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{role.name}</span>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {role.description || getPermissionSummary(role.permissions)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Users className="h-3.5 w-3.5" />
                  <span>{memberCount}</span>
                </div>

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
                      <DropdownMenuSeparator />
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
              </motion.div>
            );
          })}
        </AnimatePresence>

        {roles.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-foreground mb-0.5">No roles configured</p>
            <p className="text-xs text-muted-foreground">Create your first role to get started.</p>
          </div>
        )}
      </div>

      {/* Centered back button */}
      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          Back
        </Button>
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
        <AlertDialogContent onOverlayClick={() => setRoleToDelete(null)}>
          <AlertDialogHeader className="pr-8">
            <button
              onClick={() => setRoleToDelete(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{roleToDelete?.name}" role? This action cannot be undone.
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
        <AlertDialogContent onOverlayClick={() => setRoleWithMembers(null)}>
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
            <Label htmlFor="v5-duplicateName" className="text-sm">
              New Role Name
            </Label>
            <Input
              id="v5-duplicateName"
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
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
