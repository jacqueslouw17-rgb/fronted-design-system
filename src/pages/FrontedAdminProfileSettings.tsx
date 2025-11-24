import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Mail, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { motion } from "framer-motion";

interface CompanyAdmin {
  id: string;
  companyName: string;
  adminEmail: string;
  status: "active" | "pending" | "inactive";
  inviteSentDate: string;
  lastLoginDate?: string;
}

// Mock data - in real app, this would come from the database
const MOCK_COMPANY_ADMINS: CompanyAdmin[] = [
  {
    id: "1",
    companyName: "TechCorp Global",
    adminEmail: "admin@techcorp.com",
    status: "active",
    inviteSentDate: "2024-01-15",
    lastLoginDate: "2024-01-20",
  },
  {
    id: "2",
    companyName: "InnovateLabs Inc.",
    adminEmail: "admin@innovatelabs.com",
    status: "pending",
    inviteSentDate: "2024-01-18",
  },
  {
    id: "5",
    companyName: "CloudScale Solutions",
    adminEmail: "admin@cloudscale.com",
    status: "active",
    inviteSentDate: "2024-01-10",
    lastLoginDate: "2024-01-19",
  },
  {
    id: "3",
    companyName: "Startup Ventures",
    adminEmail: "admin@startupventures.com",
    status: "pending",
    inviteSentDate: "2024-01-20",
  },
];

const FrontedAdminProfileSettings = () => {
  const navigate = useNavigate();
  const [companyAdmins] = useState<CompanyAdmin[]>(MOCK_COMPANY_ADMINS);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleResendPassword = async (adminId: string, companyName: string) => {
    setResendingId(adminId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setResendingId(null);
    toast.success(`Password reset email sent to ${companyName} admin`);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Password changed successfully");
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsLoading(false);
  };

  const getStatusConfig = (status: CompanyAdmin["status"]) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          icon: CheckCircle,
          className: "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline/30",
        };
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          className: "bg-accent-yellow-fill/20 text-accent-yellow-text border-accent-yellow-outline/30",
        };
      case "inactive":
        return {
          label: "Inactive",
          icon: AlertCircle,
          className: "bg-destructive/20 text-destructive border-destructive/30",
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content with AgentLayout */}
      <div className="flex-1">
        <AgentLayout context="Profile Settings">
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
            <div className="container max-w-4xl mx-auto px-4 py-8 relative z-10">
              {/* Agent Header */}
              <AgentHeader
                title="Profile Settings"
                subtitle="Manage company admin access and your account security"
                showPulse={true}
                isActive={false}
                showInput={false}
              />

              {/* Company Admins Section */}
              <div className="mt-8 space-y-4">
                <div className="bg-card/40 border border-border/40 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Company Administrators</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    View status and manage access for all company admins
                  </p>

                  <div className="space-y-4">
                    {companyAdmins.map((admin, index) => {
                      const statusConfig = getStatusConfig(admin.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={admin.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start justify-between p-4 rounded-lg bg-card/60 border border-border/30">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-foreground">{admin.companyName}</h4>
                                <Badge className={statusConfig.className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{admin.adminEmail}</p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Invited: {new Date(admin.inviteSentDate).toLocaleDateString()}</span>
                                {admin.lastLoginDate && (
                                  <span>Last login: {new Date(admin.lastLoginDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendPassword(admin.id, admin.companyName)}
                              disabled={resendingId === admin.id}
                              className="ml-4 flex-shrink-0"
                            >
                              {resendingId === admin.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="h-3.5 w-3.5 mr-2" />
                                  Resend Password
                                </>
                              )}
                            </Button>
                          </div>
                          {index < companyAdmins.length - 1 && (
                            <Separator className="my-4 bg-border/20" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-card/40 border border-border/40 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Your Account Security</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Change your Fronted admin password
                  </p>

                  {!showPasswordChange ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordChange(true)}
                      size="lg"
                    >
                      Change Password
                    </Button>
                  ) : (
                    <motion.form
                      onSubmit={handleChangePassword}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="current-password-settings" className="text-sm font-medium">
                          Current Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="current-password-settings"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                          required
                          disabled={isLoading}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password-settings" className="text-sm font-medium">
                          New Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="new-password-settings"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
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
                        <Label htmlFor="confirm-password-settings" className="text-sm font-medium">
                          Confirm New Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="confirm-password-settings"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                          onClick={() => {
                            setShowPasswordChange(false);
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
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
                    </motion.form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AgentLayout>
      </div>
    </div>
  );
};

export default FrontedAdminProfileSettings;
