/**
 * Role Editor Drawer (right-side)
 * RBAC - Flow 1 v4
 */

import { useEffect, useMemo, useState } from "react";
import { Check, Info, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  PermissionLevel,
  PermissionMatrix,
  RBACModule,
  RoleFormData,
  RoleWithPermissions,
} from "@/types/rbac";

interface RoleEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: RBACModule[];
  role?: RoleWithPermissions | null; // null = create
  initialData?: RoleFormData; // used for "Duplicate" -> create with prefill
  onSave: (roleId: string | null, data: RoleFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
}

// Permission level metadata with descriptions of what each level enables
const PERMISSION_LEVELS: Record<PermissionLevel, { label: string; color: string }> = {
  none: { label: "None", color: "bg-muted text-muted-foreground" },
  view: { label: "View", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  manage: { label: "Manage", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  approve: { label: "Approve", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  admin: { label: "Admin", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
};

// Module-specific descriptions for each permission level
const MODULE_LEVEL_DESCRIPTIONS: Record<string, Record<PermissionLevel, string>> = {
  hiring_onboarding: {
    none: "No access to pipeline",
    view: "View pipeline and candidate stages",
    manage: "Move candidates, trigger actions",
    approve: "Approve candidates",
    admin: "Full pipeline control",
  },
  candidate_profiles: {
    none: "No access to profiles",
    view: "View profiles and onboarding summaries",
    manage: "Edit profile details",
    approve: "Approve profile changes",
    admin: "Full profile control",
  },
  contracts: {
    none: "No access to contracts",
    view: "View contracts",
    manage: "Create, edit, and send contracts",
    approve: "Approve and finalize contracts",
    admin: "Full contract control",
  },
  payroll: {
    none: "No access to payroll",
    view: "View payroll cycles and status",
    manage: "Manage submissions and exceptions",
    approve: "Approve payroll runs",
    admin: "Full payroll control",
  },
  company_settings: {
    none: "No access to settings",
    view: "View company settings",
    manage: "Edit company profile and config",
    approve: "Approve setting changes",
    admin: "Full settings control",
  },
  support_requests: {
    none: "No access to support",
    view: "View support requests",
    manage: "Create and manage requests",
    approve: "Approve requests",
    admin: "Full support control",
  },
  user_management: {
    none: "No access to user management",
    view: "View team members",
    manage: "Invite users, assign roles",
    approve: "Approve user changes",
    admin: "Full RBAC control (create roles, manage all users)",
  },
};

export function RoleEditorDrawer({
  open,
  onOpenChange,
  modules,
  role,
  initialData,
  onSave,
  getPermissionSummary,
}: RoleEditorDrawerProps) {
  const isEditMode = !!role;

  const defaultPerms = useMemo(() => {
    const next: PermissionMatrix = {};
    modules.forEach((m) => {
      next[m.key] = "none";
    });
    return next;
  }, [modules]);

  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
    permissions: {},
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSaving(false);
      return;
    }

    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: { ...role.permissions },
      });
      setErrors({});
      return;
    }

    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        permissions: { ...defaultPerms, ...initialData.permissions },
      });
      setErrors({});
      return;
    }

    setFormData({ name: "", description: "", permissions: defaultPerms });
    setErrors({});
  }, [role, initialData, defaultPerms, open]);

  const validate = () => {
    const next: Record<string, string> = {};

    if (!formData.name.trim()) next.name = "Role name is required";
    if (formData.name.length > 50) next.name = "Role name must be 50 characters or less";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const getAvailableLevels = (module: RBACModule): PermissionLevel[] => {
    const levels: PermissionLevel[] = ["none"];
    module.available_permissions.forEach((p) => {
      if (p === "view" || p === "manage" || p === "approve" || p === "admin") {
        levels.push(p as PermissionLevel);
      }
    });
    return levels;
  };

  const permissionSummary = getPermissionSummary(formData.permissions);
  
  // Count how many modules have permissions set (not "none")
  const activePermCount = Object.values(formData.permissions).filter(l => l !== "none").length;

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    const ok = await onSave(role?.id || null, formData);
    setSaving(false);

    if (ok) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/40">
          <SheetTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {isEditMode ? `Edit role` : "Create role"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update name and permissions."
              : "Define role name and select permissions for each module."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-5 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name" className="text-sm">
                  Role name
                </Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="e.g., Regional Manager"
                  className={`h-11 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-desc" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="role-desc"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what this role is for…"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground">
                  {activePermCount === 0 ? "No permissions" : `${activePermCount} module${activePermCount !== 1 ? "s" : ""} enabled`}
                </p>
              </div>

              {/* Module Permission Cards */}
              <div className="space-y-3">
                {modules.map((module) => {
                  const current = formData.permissions[module.key] || "none";
                  const available = getAvailableLevels(module);
                  const levelMeta = PERMISSION_LEVELS[current];
                  const descriptions = MODULE_LEVEL_DESCRIPTIONS[module.key] || {};

                  return (
                    <div
                      key={module.id}
                      className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden"
                    >
                      {/* Module Header */}
                      <div className="px-4 py-3 border-b border-border/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{module.name}</p>
                            {module.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                            )}
                          </div>
                          {current !== "none" && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full border",
                              levelMeta.color
                            )}>
                              {levelMeta.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Permission Level Options */}
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {available.map((level) => {
                          const isActive = current === level;
                          const meta = PERMISSION_LEVELS[level];
                          const description = descriptions[level] || "";

                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  permissions: {
                                    ...p.permissions,
                                    [module.key]: level,
                                  },
                                }))
                              }
                              className={cn(
                                "relative flex flex-col items-start p-3 rounded-md border text-left transition-all",
                                isActive
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                  : "border-border/40 bg-background hover:bg-muted/40 hover:border-border"
                              )}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className={cn(
                                  "text-xs font-medium",
                                  isActive ? "text-primary" : "text-foreground"
                                )}>
                                  {meta.label}
                                </span>
                                {isActive && (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                                {description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Least Privilege Note */}
              <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-primary/5 p-3">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Least privilege:</strong> keep permissions
                  tight and expand only when needed.
                </p>
              </div>
            </div>

            {/* Action buttons inline after fields */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving} className="gap-1.5">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : isEditMode ? "Save changes" : "Create role"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
