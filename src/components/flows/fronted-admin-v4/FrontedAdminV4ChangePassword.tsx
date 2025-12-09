/**
 * Change Password Component
 * For Flow 1 v4 - Fronted Admin Dashboard v4 Profile Settings
 * Detached copy - no shared logic with other flows
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FrontedAdminV4ChangePasswordProps {
  onCancel: () => void;
}

const FrontedAdminV4ChangePassword = ({ onCancel }: FrontedAdminV4ChangePasswordProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onCancel();
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-card/40 border border-border/40 rounded-lg p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="v4-current-password" className="text-sm font-medium">
            Current Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="v4-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
            disabled={isLoading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="v4-new-password" className="text-sm font-medium">
            New Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="v4-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            disabled={isLoading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters long
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="v4-confirm-password" className="text-sm font-medium">
            Confirm New Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="v4-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            disabled={isLoading}
            className="h-11"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FrontedAdminV4ChangePassword;
