import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";

const ChangePassword = () => {
  const navigate = useNavigate();
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
      navigate("/flows/contract-flow-multi-company");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content with AgentLayout */}
      <div className="flex-1">
        <AgentLayout context="Change Password">
          <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            </div>

            {/* Minimal header - positioned over gradient */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4">
              <img
                src={frontedLogo}
                alt="Fronted"
                className="h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/flows/contract-flow-multi-company")}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/flows/contract-flow-multi-company")}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="container max-w-2xl mx-auto px-4 py-8 relative z-10">
              {/* Agent Header with frequency animation */}
              <AgentHeader
                title="Change Password"
                subtitle="Update your account password to keep your account secure."
                showPulse={true}
                isActive={isLoading}
                showInput={false}
              />

              {/* Password Form */}
              <div className="mt-8 space-y-6 max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-card/40 border border-border/40 rounded-lg p-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium">
                      Current Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="current-password"
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
                    <Label htmlFor="new-password" className="text-sm font-medium">
                      New Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="new-password"
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
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
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
                      onClick={() => navigate("/flows/contract-flow-multi-company")}
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
            </div>
          </div>
        </AgentLayout>
      </div>
    </div>
  );
};

export default ChangePassword;
