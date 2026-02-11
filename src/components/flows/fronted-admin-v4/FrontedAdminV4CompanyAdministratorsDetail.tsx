/**
 * Company Administrators Detail Screen
 * For Flow 1 v4 - Fronted Admin Dashboard v4 Profile Settings
 * Lists company administrators with add/remove functionality
 * Detached copy from v3 - no shared logic
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus, Trash2, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface V4CompanyAdmin {
  id: string;
  companyName: string;
  adminEmail: string;
  status: "active" | "pending" | "inactive";
  inviteSentDate: string;
  lastLoginDate?: string;
}

interface FrontedAdminV4CompanyAdministratorsDetailProps {
  onCancel: () => void;
}

const V4_MOCK_COMPANY_ADMINS: V4CompanyAdmin[] = [
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
    id: "3",
    companyName: "CloudScale Solutions",
    adminEmail: "admin@cloudscale.com",
    status: "active",
    inviteSentDate: "2024-01-10",
    lastLoginDate: "2024-01-19",
  },
];

const FrontedAdminV4CompanyAdministratorsDetail = ({ onCancel }: FrontedAdminV4CompanyAdministratorsDetailProps) => {
  const [companyAdmins, setCompanyAdmins] = useState<V4CompanyAdmin[]>(V4_MOCK_COMPANY_ADMINS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    companyName: "",
    adminEmail: "",
  });

  const handleResendPassword = async (adminId: string, companyName: string) => {
    setResendingId(adminId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResendingId(null);
    toast.success(`Password reset email sent to ${companyName} admin`);
  };

  const handleAddAdmin = () => {
    if (!newAdmin.companyName || !newAdmin.adminEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    const admin: V4CompanyAdmin = {
      id: Date.now().toString(),
      companyName: newAdmin.companyName,
      adminEmail: newAdmin.adminEmail,
      status: "pending",
      inviteSentDate: new Date().toISOString().split('T')[0],
    };

    setCompanyAdmins(prev => [...prev, admin]);
    setNewAdmin({ companyName: "", adminEmail: "" });
    setShowAddForm(false);
    toast.success(`Invitation sent to ${newAdmin.adminEmail}`);
  };

  const getStatusConfig = (status: V4CompanyAdmin["status"]) => {
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="bg-card/40 border border-border/40 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">End-client Administrators</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage End-client admin users who can access this workspace
            </p>
          </div>
          <Button variant="outline" onClick={onCancel} size="sm" className="shrink-0">
            Back
          </Button>
        </div>

        {/* Admin List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {companyAdmins.map((admin) => {
              const statusConfig = getStatusConfig(admin.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-card/60 border border-border/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{admin.companyName}</h4>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {admin.adminEmail}
                      </div>
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default FrontedAdminV4CompanyAdministratorsDetail;
