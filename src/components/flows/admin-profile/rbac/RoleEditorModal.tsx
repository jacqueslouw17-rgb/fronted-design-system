/**
 * Role Editor Modal - Create/Edit Role with Permissions Matrix
 * RBAC - Flow 1 v4
 */

import { useState, useEffect } from "react";
import { Shield, Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RBACModule, RoleWithPermissions, RoleFormData, PermissionLevel, PermissionMatrix } from "@/types/rbac";

interface RoleEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: RBACModule[];
  role?: RoleWithPermissions | null; // null = create mode
  onSave: (roleId: string | null, data: RoleFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
}

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  none: { label: "None", description: "No access to this module" },
  view: { label: "View", description: "Can view data but not make changes" },
  manage: { label: "Manage", description: "Can create, edit, and manage data" },
  approve: { label: "Approve", description: "Can approve high-risk actions" },
  admin: { label: "Admin", description: "Full administrative access" },
};

export function RoleEditorModal({
  open,
  onOpenChange,
  modules,
  role,
  onSave,
  getPermissionSummary,
}: RoleEditorModalProps) {
  const isEditMode = !!role;
  
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: {},
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: { ...role.permissions },
      });
    } else {
      // Default: all permissions to 'none' (least privilege)
      const defaultPerms: PermissionMatrix = {};
      modules.forEach(m => {
        defaultPerms[m.key] = "none";
      });
      setFormData({
        name: "",
        description: "",
        permissions: defaultPerms,
      });
    }
    setErrors({});
  }, [role, modules, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Role name must be 50 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    const success = await onSave(role?.id || null, formData);
    setSaving(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", permissions: {} });
    setErrors({});
    onOpenChange(false);
  };

  const handlePermissionChange = (moduleKey: string, level: PermissionLevel) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: level,
      },
    }));
  };

  const getAvailableLevels = (module: RBACModule): PermissionLevel[] => {
    const levels: PermissionLevel[] = ["none"];
    module.available_permissions.forEach(p => {
      if (p === "view" || p === "manage" || p === "approve" || p === "admin") {
        levels.push(p as PermissionLevel);
      }
    });
    return levels;
  };

  const permissionSummary = getPermissionSummary(formData.permissions);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEditMode ? `Edit Role: ${role.name}` : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the role name, description, and permissions."
              : "Define a new role with specific permissions for each module."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName" className="text-sm">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="roleName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g., Regional Manager"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleDescription" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="roleDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this role can do..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {permissionSummary}
                </p>
              </div>

              <div className="space-y-3">
                {modules.map((module) => {
                  const currentLevel = formData.permissions[module.key] || "none";
                  const availableLevels = getAvailableLevels(module);

                  return (
                    <div
                      key={module.id}
                      className="bg-muted/30 border border-border/40 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{module.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableLevels.map((level) => {
                          const isActive = currentLevel === level;
                          const levelInfo = PERMISSION_LABELS[level];

                          return (
                            <TooltipProvider key={level}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={isActive ? "default" : "outline"}
                                    className={`h-7 text-xs ${
                                      level === "none" && isActive
                                        ? "bg-muted text-muted-foreground"
                                        : ""
                                    }`}
                                    onClick={() => handlePermissionChange(module.key, level)}
                                  >
                                    {levelInfo.label}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{levelInfo.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Least privilege default:</strong> New roles start with no permissions. 
                Enable only what's needed for this role's responsibilities.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-1.5">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditMode ? "Save Changes" : "Create Role"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
