/**
 * Role Editor Drawer (right-side)
 * RBAC - Flow 1 v4
 */

import { useEffect, useMemo, useState } from "react";
import { Info, Save, Shield } from "lucide-react";
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

const PERMISSION_LABELS: Record<PermissionLevel, { label: string; description: string }> = {
  none: { label: "None", description: "No access" },
  view: { label: "View", description: "Can view data" },
  manage: { label: "Manage", description: "Can create and edit" },
  approve: { label: "Approve", description: "Can approve actions" },
  admin: { label: "Admin", description: "Full access" },
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
              : "Start with least privilege, then enable what’s needed."}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                  {permissionSummary}
                </p>
              </div>

              <TooltipProvider>
                <div className="space-y-3">
                  {modules.map((module) => {
                    const current = formData.permissions[module.key] || "none";
                    const available = getAvailableLevels(module);

                    return (
                      <div
                        key={module.id}
                        className="rounded-lg border border-border/40 bg-muted/20 p-4"
                      >
                        <div className="mb-3">
                          <p className="text-sm font-medium text-foreground">{module.name}</p>
                          {module.description && (
                            <p className="text-xs text-muted-foreground">{module.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {available.map((level) => {
                            const isActive = current === level;
                            const meta = PERMISSION_LABELS[level];

                            return (
                              <Tooltip key={level}>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={isActive ? "default" : "outline"}
                                    className={
                                      level === "none" && isActive
                                        ? "h-7 text-xs bg-muted text-muted-foreground hover:bg-muted"
                                        : "h-7 text-xs"
                                    }
                                    onClick={() =>
                                      setFormData((p) => ({
                                        ...p,
                                        permissions: {
                                          ...p.permissions,
                                          [module.key]: level,
                                        },
                                      }))
                                    }
                                  >
                                    {meta.label}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{meta.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>

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
