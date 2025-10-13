import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { toast } from "@/hooks/use-toast";

type NotificationType = "sla" | "genie" | "system" | "compliance";
type Priority = "low" | "medium" | "high" | "critical";
type Status = "unread" | "active" | "breach" | "resolved";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  status: Status;
  timestamp: Date;
  timeLeft?: string;
  genieHint?: string;
  quickAction?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationCenterPattern = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "sla" as const,
      title: "Payroll Run Delayed",
      message: "Payroll run delayed due to FX quote refresh.",
      priority: "high" as const,
      status: "unread" as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      timeLeft: "4h left",
      genieHint: "I can rerun the job when quotes stabilize. Approve?",
      quickAction: {
        label: "Approve Rerun",
        onClick: () => toast({ title: "Payroll rerun approved" }),
      },
    },
    {
      id: "2",
      type: "compliance" as const,
      title: "Insurance Certificate Expiring",
      message: "Insurance certificate expires soon (3 days). Compliance breach if not updated by Oct 12.",
      priority: "critical" as const,
      status: "breach" as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      timeLeft: "3 days",
      quickAction: {
        label: "Upload Document",
        onClick: () => toast({ title: "Upload dialog opened" }),
      },
    },
    {
      id: "3",
      type: "genie" as const,
      title: "Duplicate Contractors Detected",
      message: "Genie detected 2 duplicate contractors in Norway module.",
      priority: "medium" as const,
      status: "active" as const,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      genieHint: "I found matching names and tax IDs. Should I merge them?",
      quickAction: {
        label: "Review Duplicates",
        onClick: () => toast({ title: "Opening contractor review" }),
      },
    },
    {
      id: "4",
      type: "system" as const,
      title: "Bank Holiday Detected",
      message: "Bank holiday detected — delay risk in Norway payroll processing.",
      priority: "medium" as const,
      status: "unread" as const,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      timeLeft: "48h",
      genieHint: "Would you like me to reschedule the run to the next business day?",
    },
    {
      id: "5",
      type: "genie" as const,
      title: "Contract Verification Complete",
      message: "Genie verified 9 new contracts successfully.",
      priority: "low" as const,
      status: "resolved" as const,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "6",
      type: "sla" as const,
      title: "Support Ticket Unresolved",
      message: "Payroll ticket unresolved for 48h (SLA breach).",
      priority: "critical" as const,
      status: "breach" as const,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      timeLeft: "Overdue",
      quickAction: {
        label: "Escalate Now",
        onClick: () => toast({ title: "Ticket escalated" }),
      },
    },
    {
      id: "7",
      type: "compliance" as const,
      title: "Tax Document Verification",
      message: "Tax declaration pending — awaiting payroll submission file from CFO.",
      priority: "medium" as const,
      status: "active" as const,
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      timeLeft: "24h",
      genieHint: "I can send a reminder to the CFO if needed.",
    },
    {
      id: "8",
      type: "genie" as const,
      title: "Inconsistent FX Rate Detected",
      message: "Genie flagged inconsistent FX rate for USD to NOK conversion.",
      priority: "high" as const,
      status: "unread" as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      genieHint: "The rate differs from the central bank by 2.3%. Should I update?",
      quickAction: {
        label: "Review Rate",
        onClick: () => toast({ title: "FX rate comparison opened" }),
      },
    },
  ]);

  const handleDismiss = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "resolved" as const } : n))
    );
    toast({ title: "Notification dismissed" });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "resolved" as const }))
    );
    toast({ title: "All notifications marked as read" });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>
        
        {/* Header */}
        <div>
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Notification Center + SLA Alerts</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Centralized system alerts, SLA timers, and Genie notifications with clear accountability
          </p>
        </div>

        {/* Demo Section */}
        <div className="border rounded-lg p-8 bg-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Interactive Demo</h2>
              <p className="text-muted-foreground mb-6">
                Click the bell icon below to see the notification center in action.
              </p>
            </div>

            {/* Demo Notification Center */}
            <div className="flex items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Click the bell icon to open notifications
                </p>
                <NotificationCenter
                  notifications={notifications}
                  onDismiss={handleDismiss}
                  onMarkAllRead={handleMarkAllRead}
                />
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Smart Filtering:</strong> Organize by type (All, SLA, Genie, System)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Priority Indicators:</strong> Color-coded severity (Low, Medium, High, Critical)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>SLA Timers:</strong> Live countdown badges for time-sensitive alerts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Genie Integration:</strong> AI-powered suggestions and next-step recommendations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Quick Actions:</strong> Inline buttons for immediate response (Approve, Escalate, Review)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Status States:</strong> Unread, Active, Breach Risk, Resolved with visual distinction
                  </span>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Example Notifications</h3>
              <div className="grid gap-3 text-sm">
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">⚠️ Payroll Run Delayed</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    "Payroll run delayed due to FX quote refresh — 4h left to resolve."
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">📄 Insurance Certificate Expiring</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    "Insurance certificate expires soon (3 days). Compliance breach if not updated by Oct 12."
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="font-medium">🤖 Duplicate Contractors Detected</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    "Genie detected 2 duplicate contractors in Norway module."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterPattern;
