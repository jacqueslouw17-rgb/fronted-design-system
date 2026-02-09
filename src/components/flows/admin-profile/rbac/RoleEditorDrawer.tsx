/**
 * Role Editor Drawer (right-side)
 * RBAC - Flow 1 v4
 * Compact single-row-per-module layout for faster decision-making
 */

import { useEffect, useMemo, useState, useRef } from "react";
import { Save, Shield, Search, Plus, ChevronDown, User } from "lucide-react";
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
  existingRoles?: RoleWithPermissions[];
  initialData?: RoleFormData;
  onSave: (roleId: string | null, data: RoleFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
}

const LEVEL_CONFIG: Record<PermissionLevel, { label: string; shortLabel: string; tooltip: string }> = {
  none: { label: "None", shortLabel: "—", tooltip: "No access to this module" },
  view: { label: "View", shortLabel: "View", tooltip: "Read-only — can see data but not change anything" },
  manage: { label: "Manage", shortLabel: "Manage", tooltip: "Day-to-day ops — create, edit, move items" },
  approve: { label: "Approve", shortLabel: "Approve", tooltip: "Sign-off authority — approve payroll, finalize contracts" },
  admin: { label: "Admin", shortLabel: "Admin", tooltip: "Full control — includes role & user management" },
};

export function RoleEditorDrawer({
  open,
  onOpenChange,
  modules,
  role,
  existingRoles = [],
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
  const [initialFormData, setInitialFormData] = useState<RoleFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Search state for create mode
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleWithPermissions | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter existing roles based on search
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return existingRoles;
    const query = searchQuery.toLowerCase();
    return existingRoles.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.description?.toLowerCase().includes(query)
    );
  }, [existingRoles, searchQuery]);

  // Check if name matches any existing role (excluding current role in edit mode)
  const isDuplicateName = useMemo(() => {
    if (!formData.name.trim()) return false;
    const nameToCheck = formData.name.toLowerCase();
    return existingRoles.some(r => 
      r.name.toLowerCase() === nameToCheck && 
      r.id !== role?.id // Exclude current role being edited
    );
  }, [existingRoles, formData.name, role?.id]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting a template role
  const handleSelectTemplate = (templateRole: RoleWithPermissions) => {
    // In edit mode, selecting an existing role = error (duplicate)
    if (isEditMode) {
      setFormData(prev => ({
        ...prev,
        name: templateRole.name,
      }));
      setErrors({ name: "This role name already exists. Please choose a different name." });
    } else {
      // In create mode, use as template with "(Copy)" suffix
      setSelectedTemplate(templateRole);
      setFormData(prev => ({
        ...prev,
        name: `${templateRole.name} (Copy)`,
        description: templateRole.description || "",
        permissions: { ...templateRole.permissions },
      }));
    }
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Handle creating new from scratch
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData(prev => ({
      ...prev,
      name: searchQuery,
      permissions: { ...defaultPerms },
    }));
    setShowDropdown(false);
    setIsManualEntry(true);
  };

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSaving(false);
      setInitialFormData(null);
      setSearchQuery("");
      setSelectedTemplate(null);
      setShowDropdown(false);
      setIsManualEntry(false);
      return;
    }

    if (role) {
      const data = {
        name: role.name,
        description: role.description || "",
        permissions: { ...role.permissions },
      };
      setFormData(data);
      setInitialFormData(data);
      setSearchQuery(role.name);
      setIsManualEntry(false); // Keep dropdown mode, role name will show in trigger
      setErrors({});
      return;
    }

    if (initialData) {
      const data = {
        name: initialData.name,
        description: initialData.description,
        permissions: { ...defaultPerms, ...initialData.permissions },
      };
      setFormData(data);
      setInitialFormData(data);
      setSearchQuery(initialData.name);
      setErrors({});
      return;
    }

    const data = { name: "", description: "", permissions: defaultPerms };
    setFormData(data);
    setInitialFormData(data);
    setSearchQuery("");
    setErrors({});
  }, [role, initialData, defaultPerms, open]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!initialFormData) return false;
    if (formData.name !== initialFormData.name) return true;
    if (formData.description !== initialFormData.description) return true;
    
    const permKeys = new Set([
      ...Object.keys(formData.permissions),
      ...Object.keys(initialFormData.permissions),
    ]);
    for (const key of permKeys) {
      if (formData.permissions[key] !== initialFormData.permissions[key]) return true;
    }
    return false;
  }, [formData, initialFormData]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = "Role name is required";
    else if (formData.name.length > 50) next.name = "Role name must be 50 characters or less";
    else if (isDuplicateName) next.name = "This role name already exists. Please choose a different name.";
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
              {/* Role Name - Select with search pattern */}
              <div className="space-y-2">
                <Label htmlFor="role-name" className="text-sm">Role name</Label>
                {isManualEntry ? (
                  /* Direct input mode - only after clicking "Add New Role" */
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
                ) : (
                  /* Dropdown selector mode */
                  <div className="relative">
                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className={cn(
                        "w-full h-10 px-3 flex items-center justify-between rounded-md border text-sm transition-colors",
                        showDropdown 
                          ? "bg-foreground text-background border-foreground" 
                          : "bg-background border-input hover:bg-muted/50",
                        errors.name && "border-destructive"
                      )}
                    >
                      <span
                        className={cn(
                          showDropdown
                            ? "text-background"
                            : formData.name
                              ? "text-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {formData.name || "Select role..."}
                      </span>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        showDropdown && "rotate-180"
                      )} />
                    </button>
                    
                    {/* Dropdown panel */}
                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                      >
                        {/* Search input */}
                        <div className="p-2 border-b border-border/50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              ref={inputRef}
                              value={searchQuery}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSearchQuery(value);
                                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                              }}
                              placeholder="Search roles..."
                              className="h-9 pl-9 bg-background"
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        {/* Results */}
                        <div className="max-h-[240px] overflow-y-auto">
                          {/* Existing roles list */}
                          {filteredRoles.length > 0 ? (
                            <div className="py-1">
                              {filteredRoles.map((r) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => handleSelectTemplate(r)}
                                  className="w-full px-3 py-2.5 text-left hover:bg-muted/50 flex flex-col gap-0.5 transition-colors"
                                >
                                  <span className="text-sm font-medium truncate">{r.name}</span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {r.description || getPermissionSummary(r.permissions)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : searchQuery.trim() ? (
                            /* Empty state with create option */
                            <div className="py-6 px-4 text-center space-y-3">
                              <p className="text-sm text-muted-foreground">No role found.</p>
                              <button
                                type="button"
                                onClick={handleCreateNew}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
                              >
                                <User className="h-4 w-4" />
                                Add New Role
                              </button>
                            </div>
                          ) : (
                            /* Initial empty state */
                            <div className="py-6 px-4 text-center">
                              <p className="text-sm text-muted-foreground">
                                Search or create a new role
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedTemplate && !isEditMode && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Based on "{selectedTemplate.name}" permissions
                  </p>
                )}
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

              <TooltipProvider delayDuration={100}>
                <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden divide-y divide-border/30">
                  {modules.length === 0 ? (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">Loading modules…</p>
                    </div>
                  ) : (
                    modules.map((module, idx) => {
                      const current = formData.permissions[module.key] || "none";
                      const available = getAvailableLevels(module);
                      const isFirst = idx === 0;
                      const isLast = idx === modules.length - 1;

                      return (
                        <div
                          key={module.id}
                          className={cn(
                            "flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                            isFirst && "rounded-t-xl",
                            isLast && "rounded-b-xl"
                          )}
                        >
                          {/* Module name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/90 truncate">{module.name}</p>
                          </div>

                          {/* Level pills - softer styling */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {available.map((level) => {
                              const isActive = current === level;
                              const config = LEVEL_CONFIG[level];

                              return (
                                <Tooltip key={level} delayDuration={0}>
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
                                        "px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150",
                                        isActive
                                          ? "bg-foreground/10 text-foreground border border-foreground/20 shadow-sm"
                                          : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/50"
                                      )}
                                    >
                                      {config.shortLabel}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={4} className="z-[100] bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-md shadow-md border border-border">
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
              <Button 
                onClick={handleSubmit} 
                disabled={saving || (isEditMode && !hasChanges)} 
                className="gap-1.5"
              >
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
