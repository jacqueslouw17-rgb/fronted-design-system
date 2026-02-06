/**
 * Roles & Permissions Section - Standalone page for managing roles
 * Flow 1 v4 - Fronted Admin Dashboard
 */

import { useState } from "react";
import { ArrowLeft, Plus, Shield, MoreHorizontal, Copy, Pencil, Trash2, Lock, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { useRBAC } from "@/hooks/useRBAC";
import { RoleEditorModal } from "./RoleEditorModal";
import type { RoleWithPermissions } from "@/types/rbac";

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
    duplicateRole,
    getMemberCountForRole,
    getPermissionSummary,
  } = useRBAC();

  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
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

  const systemRoles = roles.filter(r => r.is_system_role);
  const customRoles = roles.filter(r => !r.is_system_role);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const RoleCard = ({ role }: { role: RoleWithPermissions }) => {
    const memberCount = getMemberCountForRole(role.id);
    const canDelete = !role.is_system_role && memberCount === 0;

    return (
      <Card className="p-4 bg-card border-border/40 hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Role Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{role.name}</span>
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
                  <DropdownMenuItem onClick={() => handleEditRole(role)}>
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
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h2 className="text-lg font-semibold text-foreground">Roles & Permissions</h2>
            <p className="text-sm text-muted-foreground">
              {roles.length} role{roles.length !== 1 ? "s" : ""} configured
            </p>
          </div>
        </div>
      </div>

      {/* Translucent Container Card */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/40">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-foreground">Roles & Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Define access levels for your team
            </p>
          </div>
          {canManageRoles && (
            <Button onClick={handleCreateRole} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          )}
        </div>

        {/* System Roles */}
        {systemRoles.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              System Roles
            </p>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {systemRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <RoleCard role={role} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Custom Roles */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Custom Roles
          </p>
          {customRoles.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {customRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <RoleCard role={role} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Plus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-base font-medium text-foreground mb-1">No custom roles yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a custom role tailored to your team's needs.
              </p>
              {canManageRoles && (
                <Button onClick={handleCreateRole} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={onBack}
        className="w-full sm:w-auto"
        size="lg"
      >
        Back to Settings
      </Button>

      {/* Role Editor Modal */}
      <RoleEditorModal
        open={showRoleEditor}
        onOpenChange={setShowRoleEditor}
        modules={modules}
        role={editingRole}
        onSave={handleSaveRole}
        getPermissionSummary={getPermissionSummary}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
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
          <DialogHeader>
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
