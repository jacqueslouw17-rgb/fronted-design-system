/**
 * Invite Team Member Modal
 * RBAC - Flow 1 v4
 */

import { useState } from "react";
import { Mail, User, Shield, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoleWithPermissions, InviteFormData } from "@/types/rbac";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleWithPermissions[];
  currentUserPrivilege: number;
  onInvite: (data: InviteFormData) => Promise<boolean>;
  getPermissionSummary: (permissions: Record<string, string>) => string;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  roles,
  currentUserPrivilege,
  onInvite,
  getPermissionSummary,
}: InviteMemberModalProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    name: "",
    email: "",
    role_id: "",
  });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter roles user can assign
  const assignableRoles = roles.filter(r => r.privilege_level <= currentUserPrivilege);

  const selectedRole = assignableRoles.find(r => r.id === formData.role_id);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.role_id) {
      newErrors.role_id = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSending(true);
    const success = await onInvite(formData);
    setSending(false);

    if (success) {
      setFormData({ name: "", email: "", role_id: "" });
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", role_id: "" });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your Fronted workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="name"
              placeholder="Jane Smith"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="text-sm"
            />
          </div>

          {/* Email (Required) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@company.com"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
              }}
              className={`text-sm ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Role (Required) */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role_id}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, role_id: value }));
                if (errors.role_id) setErrors(prev => ({ ...prev, role_id: "" }));
              }}
            >
              <SelectTrigger className={`text-sm ${errors.role_id ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{role.name}</span>
                      {role.is_system_role && (
                        <span className="text-xs text-muted-foreground">(System)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && (
              <p className="text-xs text-destructive">{errors.role_id}</p>
            )}
          </div>

          {/* Role Preview */}
          {selectedRole && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">
                {selectedRole.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedRole.description || getPermissionSummary(selectedRole.permissions as Record<string, string>)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={sending} className="gap-1.5">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
