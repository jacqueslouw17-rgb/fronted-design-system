import { useState } from "react";
import { ArrowLeft, Mail, Key, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import frontedLogo from "@/assets/fronted-logo.png";
import StandardInput from "@/components/shared/StandardInput";

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
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdmin[]>(MOCK_COMPANY_ADMINS);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
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

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Password changed successfully");
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const getStatusConfig = (status: CompanyAdmin["status"]) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          variant: "default" as const,
          icon: CheckCircle,
          className: "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline/30",
        };
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-accent-yellow-fill/20 text-accent-yellow-text border-accent-yellow-outline/30",
        };
      case "inactive":
        return {
          label: "Inactive",
          variant: "destructive" as const,
          icon: AlertCircle,
          className: "bg-destructive/20 text-destructive border-destructive/30",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="h-14 sm:h-16 border-b bg-card flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/flows/contract-flow-multi-company")}
            className="hover:bg-transparent flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <img 
            src={frontedLogo}
            alt="Fronted"
            className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/flows/contract-flow-multi-company")}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage company admin access and your account security
          </p>
        </div>

        {/* Company Admins Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Company Administrators
            </CardTitle>
            <CardDescription>
              View status and manage access for all company admins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyAdmins.map((admin, index) => {
              const statusConfig = getStatusConfig(admin.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{admin.companyName}</h3>
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
                      className="ml-4"
                    >
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      {resendingId === admin.id ? "Sending..." : "Resend Password"}
                    </Button>
                  </div>
                  {index < companyAdmins.length - 1 && <Separator className="my-4" />}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Fronted Admin Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Your Account Security
            </CardTitle>
            <CardDescription>
              Change your Fronted admin password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordChange ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                className="w-full sm:w-auto"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <StandardInput
                  id="current-password"
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
                  placeholder="Enter current password"
                />
                <StandardInput
                  id="new-password"
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
                  placeholder="Enter new password"
                  helpText="Must be at least 8 characters"
                />
                <StandardInput
                  id="confirm-password"
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
                  placeholder="Confirm new password"
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FrontedAdminProfileSettings;
