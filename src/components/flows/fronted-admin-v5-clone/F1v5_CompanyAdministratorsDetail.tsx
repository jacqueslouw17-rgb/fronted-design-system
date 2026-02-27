/**
 * End-client Administrators Detail — Flow 1 v5
 * Clean v7-style: no header card wrapping, centered back button
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface V5CompanyAdmin {
  id: string;
  companyName: string;
  adminEmail: string;
  status: "active" | "pending" | "inactive";
  inviteSentDate: string;
  lastLoginDate?: string;
}

interface Props {
  onBack: () => void;
}

const MOCK_ADMINS: V5CompanyAdmin[] = [
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

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle,
    className: "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline/30",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-accent-yellow-fill/20 text-accent-yellow-text border-accent-yellow-outline/30",
  },
  inactive: {
    label: "Inactive",
    icon: AlertCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function F1v5_CompanyAdministratorsDetail({ onBack }: Props) {
  const [admins] = useState<V5CompanyAdmin[]>(MOCK_ADMINS);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendPassword = async (adminId: string, companyName: string) => {
    setResendingId(adminId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResendingId(null);
    toast.success(`Password reset email sent to ${companyName} admin`);
  };

  return (
    <div>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {admins.map((admin) => {
            const config = STATUS_CONFIG[admin.status];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={admin.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="rounded-xl border border-border/30 bg-card/20 px-4 py-3.5 hover:bg-card/40 transition-colors"
              >
                {/* Top row: company name + badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {admin.companyName}
                    </span>
                    <Badge className={`shrink-0 ${config.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendPassword(admin.id, admin.companyName)}
                    disabled={resendingId === admin.id}
                    className="shrink-0 text-xs hidden sm:inline-flex"
                  >
                    {resendingId === admin.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Resend Invite"
                    )}
                  </Button>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{admin.adminEmail}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    · Invited {new Date(admin.inviteSentDate).toLocaleDateString()}
                  </span>
                  {admin.lastLoginDate && (
                    <span className="text-xs text-muted-foreground">
                      · Last login {new Date(admin.lastLoginDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Mobile action button */}
                <div className="sm:hidden mt-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendPassword(admin.id, admin.companyName)}
                    disabled={resendingId === admin.id}
                    className="w-full text-xs h-8"
                  >
                    {resendingId === admin.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Resend Invite"
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          Back
        </Button>
      </div>
    </div>
  );
}
