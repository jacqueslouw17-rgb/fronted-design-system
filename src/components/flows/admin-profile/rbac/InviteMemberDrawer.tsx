/**
 * Invite Team Member Drawer (right-side)
 * RBAC - Flow 1 v4
 */

import { useEffect, useMemo, useState } from "react";
import { Mail, Send, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { InviteFormData, PermissionMatrix, RoleWithPermissions } from "@/types/rbac";

interface InviteMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleWithPermissions[];
  currentUserPrivilege: number;
  onInvite: (data: InviteFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: PermissionMatrix) => string;
  onNavigateToRoles?: () => void;
}

export function InviteMemberDrawer({
  open,
  onOpenChange,
  roles,
  currentUserPrivilege,
  onInvite,
  getPermissionSummary,
  onNavigateToRoles,
}: InviteMemberDrawerProps) {
  const assignableRoles = useMemo(
    () => roles.filter((r) => r.privilege_level <= currentUserPrivilege),
    [roles, currentUserPrivilege],
  );

  const [formData, setFormData] = useState<InviteFormData>({
    name: "",
    email: "",
    role_id: "",
  });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRole = assignableRoles.find((r) => r.id === formData.role_id);

  useEffect(() => {
    if (!open) {
      setFormData({ name: "", email: "", role_id: "" });
      setErrors({});
      setSending(false);
    }
  }, [open]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Enter a valid email";
    }

    if (!formData.role_id) {
      next.role_id = "Select a role";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSending(true);
    const success = await onInvite(formData);
    setSending(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/40">
          <SheetTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Invite team member
          </SheetTitle>
          <SheetDescription>
            Add someone to your workspace and assign a role.
          </SheetDescription>
        </SheetHeader>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-sm flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Name
            </Label>
            <Input
              id="invite-name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Smith"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((p) => ({ ...p, email: e.target.value }));
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="jane@company.com"
              className={`h-11 ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Role
            </Label>
            {assignableRoles.length === 0 ? (
              <div className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  No roles available yet. Create a role first to invite team members.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onNavigateToRoles?.();
                  }}
                  className="gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Go to Roles & Permissions
                </Button>
              </div>
            ) : (
              <>
                <Select
                  value={formData.role_id}
                  onValueChange={(value) => {
                    setFormData((p) => ({ ...p, role_id: value }));
                    if (errors.role_id) setErrors((p) => ({ ...p, role_id: "" }));
                  }}
                >
                  <SelectTrigger className={`h-11 ${errors.role_id ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{role.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && <p className="text-xs text-destructive">{errors.role_id}</p>}
              </>
            )}
          </div>

          {selectedRole && (
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">{selectedRole.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedRole.description || getPermissionSummary(selectedRole.permissions)}
              </p>
            </div>
          )}

          {/* Action buttons inline after fields */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={sending || !formData.email.trim() || !formData.role_id} 
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
