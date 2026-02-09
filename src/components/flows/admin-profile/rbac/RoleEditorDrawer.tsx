/**
 * Role Editor Drawer (right-side)
 * RBAC - Flow 1 v4
 * Compact single-row-per-module layout for faster decision-making
 */

import { useEffect, useMemo, useState } from "react";
import { Save, Shield } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  role?: RoleWithPermissions | null;
  initialData?: RoleFormData;
  onSave: (roleId: string | null, data: RoleFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
}

const LEVEL_CONFIG: Record<PermissionLevel, { label: string; shortLabel: string; tooltip: string }> = {
  none: { label: "None", shortLabel: "—", tooltip: "No access" },
  view: { label: "View", shortLabel: "View", tooltip: "Read-only access" },
  manage: { label: "Manage", shortLabel: "Manage", tooltip: "Create, edit, and manage" },
  approve: { label: "Approve", shortLabel: "Approve", tooltip: "Approve high-impact actions" },
  admin: { label: "Admin", shortLabel: "Admin", tooltip: "Full control including RBAC" },
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

  const enabledCount = Object.values(formData.permissions).filter((l) => l !== "none").length;

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const ok = await onSave(role?.id || null, formData);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/40">
          <SheetTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {isEditMode ? "Edit role" : "Create role"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode ? "Update name and permissions." : "Name the role, then set access per module."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-5 space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name" className="text-sm">Role name</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder="e.g., Payroll Specialist"
                  className={`h-10 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-desc" className="text-sm">Description</Label>
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

            {/* Permissions - Compact Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground">
                  {enabledCount === 0 ? "No permissions" : `${enabledCount} module${enabledCount !== 1 ? "s" : ""} enabled`}
                </p>
              </div>

              <TooltipProvider delayDuration={200}>
                <div className="rounded-lg border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                  {modules.length === 0 ? (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">Loading modules…</p>
                    </div>
                  ) : (
                    modules.map((module) => {
                      const current = formData.permissions[module.key] || "none";
                      const available = getAvailableLevels(module);

                      return (
                        <div key={module.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          {/* Module name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{module.name}</p>
                          </div>

                          {/* Level pills */}
                          <div className="flex items-center gap-1 shrink-0">
                            {available.map((level) => {
                              const isActive = current === level;
                              const config = LEVEL_CONFIG[level];

                              return (
                                <Tooltip key={level}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData((p) => ({
                                          ...p,
                                          permissions: { ...p.permissions, [module.key]: level },
                                        }))
                                      }
                                      className={cn(
                                        "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                                        isActive
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      )}
                                    >
                                      {config.shortLabel}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    {config.tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TooltipProvider>

            </div>

            {/* Actions */}
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
