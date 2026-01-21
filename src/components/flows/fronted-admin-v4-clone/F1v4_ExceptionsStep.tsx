/**
 * F1v4_ExceptionsStep - Prioritized exception queue
 * 
 * Clean cards showing blocking issues with contextual fix drawers
 */

import React, { useState } from "react";
import { 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Clock,
  Wrench,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { 
  F1v4_ExceptionFixDrawer, 
  Exception, 
  ExceptionCategory,
  ExceptionStatus 
} from "./F1v4_ExceptionFixDrawer";

interface F1v4_ExceptionsStepProps {
  company: CompanyPayrollData;
  exceptionsCount: number;
  onResolve: () => void;
  onContinue: () => void;
}

const MOCK_EXCEPTIONS: Exception[] = [
  {
    id: "exc-1",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    type: "blocking",
    title: "Missing bank details",
    description: "Cannot process payment without verified bank account",
    suggestedFix: "Request bank details from worker or add manually if available",
    category: "bank",
    status: "active",
  },
  {
    id: "exc-2",
    workerId: "6",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    type: "blocking",
    title: "Timesheet not submitted",
    description: "October 2026 timesheet required for contractor payment",
    suggestedFix: "Send reminder to worker to submit timesheet",
    category: "submission",
    status: "active",
  },
  {
    id: "exc-3",
    workerId: "3",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    type: "warning",
    title: "Compliance document expiring",
    description: "Right to Work document expires in 14 days",
    suggestedFix: "Request updated compliance documents",
    category: "compliance",
    status: "active",
  },
  {
    id: "exc-4",
    workerId: "1",
    workerName: "Marcus Chen",
    workerCountry: "Singapore",
    type: "warning",
    title: "Manual override applied",
    description: "Bonus amount manually adjusted for this cycle only",
    suggestedFix: "Review and confirm manual adjustment",
    category: "data",
    status: "active",
  },
];

const categoryIcons: Record<ExceptionCategory, React.ElementType> = {
  bank: CreditCard,
  submission: FileText,
  compliance: Clock,
  data: Wrench,
};

const countryFlags: Record<string, string> = {
  Norway: "🇳🇴",
  Philippines: "🇵🇭",
  Singapore: "🇸🇬",
  Spain: "🇪🇸",
  Portugal: "🇵🇹",
  Germany: "🇩🇪",
  France: "🇫🇷",
};

const statusLabels: Record<ExceptionStatus, string> = {
  active: "",
  pending: "Pending",
  requested: "Requested",
  snoozed: "Snoozed",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export const F1v4_ExceptionsStep: React.FC<F1v4_ExceptionsStepProps> = ({
  company,
  exceptionsCount,
  onResolve,
  onContinue,
}) => {
  const [exceptions, setExceptions] = useState<Exception[]>(MOCK_EXCEPTIONS);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedException = exceptions.find((e) => e.id === selectedExceptionId) || null;

  // Filter logic
  const visibleExceptions = exceptions.filter(
    (e) => e.status !== "resolved" && e.status !== "snoozed"
  );
  const blockingExceptions = visibleExceptions.filter(
    (e) => e.type === "blocking" && e.status !== "pending"
  );
  const pendingBlockingExceptions = visibleExceptions.filter(
    (e) => e.type === "blocking" && e.status === "pending"
  );
  const warningExceptions = visibleExceptions.filter((e) => e.type === "warning");
  const resolvedThisSession = exceptions.filter(
    (e) => e.status === "resolved" || e.status === "acknowledged" || e.status === "snoozed"
  );

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleOpenFix = (exceptionId: string) => {
    setSelectedExceptionId(exceptionId);
    setDrawerOpen(true);
  };

  const handleStatusChange = (exceptionId: string, newStatus: ExceptionStatus) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, status: newStatus } : e))
    );
    
    // Notify parent if resolved
    if (newStatus === "resolved") {
      onResolve();
    }
  };

  const handleSnooze = (exceptionId: string) => {
    handleStatusChange(exceptionId, "snoozed");
  };

  // Can continue if no active blocking exceptions (pending is still blocking)
  const canContinue = blockingExceptions.length === 0 && pendingBlockingExceptions.length === 0;

  const getStatusBadge = (status: ExceptionStatus, isBlocking: boolean) => {
    if (status === "active") return null;

    const statusConfig: Record<ExceptionStatus, { bg: string; text: string; border: string }> = {
      active: { bg: "", text: "", border: "" },
      pending: { 
        bg: "bg-amber-500/10", 
        text: "text-amber-600", 
        border: "border-amber-500/20" 
      },
      requested: { 
        bg: "bg-blue-500/10", 
        text: "text-blue-600", 
        border: "border-blue-500/20" 
      },
      snoozed: { 
        bg: "bg-muted", 
        text: "text-muted-foreground", 
        border: "border-border" 
      },
      acknowledged: { 
        bg: "bg-accent-green-fill/30", 
        text: "text-accent-green-text", 
        border: "border-accent-green-outline/30" 
      },
      resolved: { 
        bg: "bg-accent-green-fill/30", 
        text: "text-accent-green-text", 
        border: "border-accent-green-outline/30" 
      },
    };

    const config = statusConfig[status];
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-[9px] px-1.5 py-0 h-4 font-medium",
          config.bg, config.text, config.border
        )}
      >
        {statusLabels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      {visibleExceptions.length === 0 ? (
        <div className="flex items-center gap-3 p-5 rounded-xl border border-accent-green-outline/30 bg-accent-green-fill/5">
          <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
          <div>
            <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
            <p className="text-xs text-muted-foreground">You're ready to approve payroll numbers</p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border",
            blockingExceptions.length > 0 || pendingBlockingExceptions.length > 0
              ? "border-destructive/30 bg-destructive/5"
              : "border-amber-500/30 bg-amber-500/5"
          )}
        >
          <div className="flex items-center gap-3">
            {blockingExceptions.length > 0 || pendingBlockingExceptions.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {blockingExceptions.length > 0
                  ? `${blockingExceptions.length} blocking exception${blockingExceptions.length > 1 ? "s" : ""} require attention`
                  : pendingBlockingExceptions.length > 0
                  ? `${pendingBlockingExceptions.length} blocking exception${pendingBlockingExceptions.length > 1 ? "s" : ""} pending resolution`
                  : `${warningExceptions.length} warning${warningExceptions.length > 1 ? "s" : ""} to review`}
              </p>
              <p className="text-xs text-muted-foreground">
                {blockingExceptions.length > 0
                  ? "Resolve blocking issues to continue with approval"
                  : pendingBlockingExceptions.length > 0
                  ? "Waiting on worker response before you can proceed"
                  : "Review warnings before approving"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exception Cards */}
      <div className="space-y-3">
        {visibleExceptions.map((exception) => {
          const CategoryIcon = categoryIcons[exception.category];
          const isBlocking = exception.type === "blocking";
          const isPending = exception.status === "pending";
          const isRequested = exception.status === "requested";
          const isAcknowledged = exception.status === "acknowledged";

          return (
            <div
              key={exception.id}
              className={cn(
                "p-4 rounded-xl border bg-card/50 backdrop-blur-sm transition-all",
                isBlocking && !isPending && "border-destructive/30",
                isBlocking && isPending && "border-amber-500/30 opacity-80",
                !isBlocking && !isAcknowledged && "border-amber-500/20",
                isAcknowledged && "border-accent-green-outline/20 opacity-70"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Worker Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getInitials(exception.workerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {exception.workerName}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{countryFlags[exception.workerCountry] || ""}</span>
                      {exception.workerCountry}
                    </p>
                  </div>
                </div>

                {/* Exception Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <CategoryIcon
                      className={cn(
                        "h-4 w-4",
                        isBlocking && !isPending && "text-destructive",
                        isBlocking && isPending && "text-amber-600",
                        !isBlocking && !isAcknowledged && "text-amber-600",
                        isAcknowledged && "text-accent-green-text"
                      )}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {exception.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4 font-medium",
                        isBlocking && !isPending
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : isBlocking && isPending
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}
                    >
                      {isBlocking ? "Blocking" : "Warning"}
                    </Badge>
                    {getStatusBadge(exception.status, isBlocking)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {exception.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {exception.status === "active" && (
                    <>
                      <Button
                        variant={isBlocking ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleOpenFix(exception.id)}
                        className="text-xs"
                      >
                        Fix
                      </Button>
                      {!isBlocking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSnooze(exception.id)}
                          className="text-xs text-muted-foreground"
                        >
                          Snooze
                        </Button>
                      )}
                    </>
                  )}
                  {(isPending || isRequested) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Waiting</span>
                    </div>
                  )}
                  {isAcknowledged && (
                    <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          {resolvedThisSession.length} exception
          {resolvedThisSession.length !== 1 ? "s" : ""} resolved this session
        </p>
        <Button
          onClick={onContinue}
          size="sm"
          className="gap-1.5"
          disabled={!canContinue}
        >
          Continue to Approve
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Fix Drawer */}
      <F1v4_ExceptionFixDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        exception={selectedException}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default F1v4_ExceptionsStep;
