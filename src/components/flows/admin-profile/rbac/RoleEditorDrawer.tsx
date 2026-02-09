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

const LEVEL_LABEL: Record<PermissionLevel, string> = {
  none: "None",
  view: "View",
  manage: "Manage",
  approve: "Approve",
  admin: "Admin",
};

// Module-specific descriptions for each permission level
const MODULE_LEVEL_DESCRIPTIONS: Record<string, Partial<Record<PermissionLevel, string>>> = {
  hiring_onboarding: {
    none: "No access",
    view: "View pipeline",
    manage: "Move candidates, trigger actions",
  },
  candidate_profiles: {
    none: "No access",
    view: "View profiles + onboarding summary",
    manage: "Manage profiles",
  },
  contracts: {
    none: "No access",
    view: "View contracts",
    manage: "Create/edit/send contracts",
    approve: "Approve/finalize contracts",
  },
  payroll: {
    none: "No access",
    view: "View payroll cycles + status",
    manage: "Manage submissions + exceptions",
    approve: "Approve payroll",
  },
  company_settings: {
    none: "No access",
    view: "View settings",
    manage: "Edit company profile details",
  },
  support_requests: {
    none: "No access",
    view: "View requests",
    manage: "Create/manage requests",
  },
  user_management: {
    none: "No access",
    view: "View team members",
    manage: "Invite/remove users, assign roles",
    admin: "Create/edit roles, manage access",
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

  const enabledModulesCount = Object.values(formData.permissions).filter((l) => l !== "none").length;

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
              : "Name the role, then choose permissions per module."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-5 space-y-6">
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
                  placeholder="e.g., Payroll Specialist"
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

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground truncate max-w-[260px]">
                  {enabledModulesCount === 0 ? permissionSummary : `${enabledModulesCount} modules enabled`}
                </p>
              </div>

              <div className="space-y-3">
                {modules.length === 0 ? (
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Loading modules…</p>
                  </div>
                ) : (
                  modules.map((module) => {
                    const current = formData.permissions[module.key] || "none";
                    const available = getAvailableLevels(module);
                    const descriptions = MODULE_LEVEL_DESCRIPTIONS[module.key] || {};

                    return (
                      <div
                        key={module.id}
                        className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border/30">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{module.name}</p>
                              {module.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{module.description}</p>
                              )}
                            </div>

                            {current !== "none" && (
                              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                                {LEVEL_LABEL[current]}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {available.map((level) => {
                            const isActive = current === level;
                            const label = LEVEL_LABEL[level];
                            const desc = descriptions[level] || "";

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
                                  "relative flex flex-col items-start p-3 rounded-md border text-left transition-colors",
                                  isActive
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border/40 bg-background hover:bg-muted/40"
                                )}
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <span
                                    className={cn(
                                      "text-xs font-medium",
                                      isActive ? "text-primary" : "text-foreground"
                                    )}
                                  >
                                    {label}
                                  </span>
                                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                                </div>
                                <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                                  {desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border/40 bg-primary/5 p-3">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Least privilege:</strong> keep permissions
                  tight and expand only when needed.
                </p>
              </div>
            </div>

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
