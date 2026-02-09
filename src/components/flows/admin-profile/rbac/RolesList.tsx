/**
 * Roles List Component
 * RBAC - Flow 1 v4
 */

import { useState } from "react";
import { Shield, MoreHorizontal, Plus, Copy, Pencil, Trash2, Lock, Users, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import type { RoleWithPermissions, PermissionMatrix } from "@/types/rbac";

interface RolesListProps {
  roles: RoleWithPermissions[];
  canManageRoles: boolean;
  getMemberCountForRole: (roleId: string) => number;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
  onCreateRole: () => void;
  onEditRole: (role: RoleWithPermissions) => void;
  onDuplicateRole: (roleId: string, newName: string) => Promise<boolean>;
  onDeleteRole: (roleId: string) => Promise<boolean>;
}

export function RolesList({
  roles,
  canManageRoles,
  getMemberCountForRole,
  getPermissionSummary,
  onCreateRole,
  onEditRole,
  onDuplicateRole,
  onDeleteRole,
}: RolesListProps) {
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
  const [roleToDuplicate, setRoleToDuplicate] = useState<RoleWithPermissions | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleDelete = async () => {
    if (!roleToDelete) return;
    setProcessing(true);
    await onDeleteRole(roleToDelete.id);
    setRoleToDelete(null);
    setProcessing(false);
  };

  const handleDuplicate = async () => {
    if (!roleToDuplicate || !duplicateName.trim()) return;
    setProcessing(true);
    await onDuplicateRole(roleToDuplicate.id, duplicateName.trim());
    setRoleToDuplicate(null);
    setDuplicateName("");
    setProcessing(false);
  };

  const systemRoles = roles.filter(r => r.is_system_role);
  const customRoles = roles.filter(r => !r.is_system_role);

  const RoleCard = ({ role }: { role: RoleWithPermissions }) => {
    const memberCount = getMemberCountForRole(role.id);
    const canDelete = !role.is_system_role && memberCount === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="bg-card/30 border border-border/40 rounded-lg p-4 hover:bg-card/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Role Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{role.name}</span>
              {role.is_system_role && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="h-2.5 w-2.5" />
                  System
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {role.description || getPermissionSummary(role.permissions)}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Actions */}
          {canManageRoles && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!role.is_system_role && (
                  <DropdownMenuItem onClick={() => onEditRole(role)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => {
                    setRoleToDuplicate(role);
                    setDuplicateName(`${role.name} (Copy)`);
                  }}
                >
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
                        <span className="ml-auto text-xs opacity-60">
                          ({memberCount} assigned)
                        </span>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Roles & Permissions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {roles.length} role{roles.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        {canManageRoles && (
          <Button size="sm" onClick={onCreateRole} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        )}
      </div>

      {/* System Roles */}
      {systemRoles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            System Roles
          </p>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {systemRoles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Custom Roles */}
      {customRoles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Custom Roles
          </p>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {customRoles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {customRoles.length === 0 && canManageRoles && (
        <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border/50">
          <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No custom roles yet</p>
          <Button variant="link" size="sm" onClick={onCreateRole} className="mt-1">
            Create your first custom role
          </Button>
        </div>
      )}

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
