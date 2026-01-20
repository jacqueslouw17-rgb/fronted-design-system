/**
 * F1v4_ExceptionsStep - Prioritized exception queue
 * 
 * Clean cards showing blocking issues with clear fix actions
 */

import React, { useState } from "react";
import { 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  User,
  CreditCard,
  FileText,
  Clock,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";

interface F1v4_ExceptionsStepProps {
  company: CompanyPayrollData;
  exceptionsCount: number;
  onResolve: () => void;
  onContinue: () => void;
}

interface Exception {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  type: "blocking" | "warning";
  title: string;
  description: string;
  suggestedFix: string;
  category: "bank" | "submission" | "compliance" | "data";
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
    suggestedFix: "Request bank details from worker or contact Fronted support",
    category: "bank"
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
    category: "submission"
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
    category: "compliance"
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
    category: "data"
  },
];

const categoryIcons: Record<Exception["category"], React.ElementType> = {
  bank: CreditCard,
  submission: FileText,
  compliance: Clock,
  data: Wrench
};

const countryFlags: Record<string, string> = {
  Norway: "🇳🇴", Philippines: "🇵🇭", Singapore: "🇸🇬", Spain: "🇪🇸",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷"
};

export const F1v4_ExceptionsStep: React.FC<F1v4_ExceptionsStepProps> = ({
  company,
  exceptionsCount,
  onResolve,
  onContinue,
}) => {
  const [exceptions, setExceptions] = useState<Exception[]>(MOCK_EXCEPTIONS);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const activeExceptions = exceptions.filter(e => !resolvedIds.has(e.id));
  const blockingExceptions = activeExceptions.filter(e => e.type === "blocking");
  const warningExceptions = activeExceptions.filter(e => e.type === "warning");

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleFix = (exceptionId: string) => {
    setResolvedIds(prev => new Set([...prev, exceptionId]));
    onResolve();
  };

  const handleSnooze = (exceptionId: string) => {
    setResolvedIds(prev => new Set([...prev, exceptionId]));
  };

  const canContinue = blockingExceptions.length === 0;

  return (
    <div className="space-y-6">
      {/* Summary Banner */}
      {activeExceptions.length === 0 ? (
        <div className="flex items-center gap-3 p-5 rounded-xl border border-accent-green-outline/30 bg-accent-green-fill/5">
          <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
          <div>
            <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
            <p className="text-xs text-muted-foreground">You're ready to approve payroll numbers</p>
          </div>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          blockingExceptions.length > 0 
            ? "border-destructive/30 bg-destructive/5"
            : "border-amber-500/30 bg-amber-500/5"
        )}>
          <div className="flex items-center gap-3">
            {blockingExceptions.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {blockingExceptions.length > 0 
                  ? `${blockingExceptions.length} blocking exception${blockingExceptions.length > 1 ? "s" : ""} require attention`
                  : `${warningExceptions.length} warning${warningExceptions.length > 1 ? "s" : ""} to review`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {blockingExceptions.length > 0 
                  ? "Resolve blocking issues to continue with approval"
                  : "Review warnings before approving"
                }
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Calculated from country rules. Use overrides only for special cases.
          </p>
        </div>
      )}

      {/* Exception Cards */}
      <div className="space-y-3">
        {activeExceptions.map((exception) => {
          const CategoryIcon = categoryIcons[exception.category];
          const isBlocking = exception.type === "blocking";

          return (
            <div 
              key={exception.id}
              className={cn(
                "p-4 rounded-xl border bg-card/50 backdrop-blur-sm",
                isBlocking ? "border-destructive/30" : "border-amber-500/20"
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
                    <p className="text-sm font-medium text-foreground">{exception.workerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{countryFlags[exception.workerCountry] || ""}</span>
                      {exception.workerCountry}
                    </p>
                  </div>
                </div>

                {/* Exception Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon className={cn(
                      "h-4 w-4",
                      isBlocking ? "text-destructive" : "text-amber-600"
                    )} />
                    <p className="text-sm font-medium text-foreground">{exception.title}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4 font-medium",
                        isBlocking 
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}
                    >
                      {isBlocking ? "Blocking" : "Warning"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{exception.description}</p>
                  <p className="text-xs text-foreground/80">
                    <span className="text-muted-foreground">Suggested fix:</span> {exception.suggestedFix}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant={isBlocking ? "default" : "outline"}
                    size="sm" 
                    onClick={() => handleFix(exception.id)}
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          {resolvedIds.size} exception{resolvedIds.size !== 1 ? "s" : ""} resolved this session
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
    </div>
  );
};

export default F1v4_ExceptionsStep;
