/**
 * F1v4_ExceptionsStep - Worker status exception queue
 * 
 * Focuses on worker status/termination issues that need verification
 * before payroll can proceed. Adjustments are handled in Review step.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  UserX,
  Calendar,
  User,
  Send,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_ExceptionFixDrawer } from "./F1v4_ExceptionFixDrawer";

export type ExceptionCategory = "end_date_passed" | "ending_soon" | "status_mismatch";
export type ExceptionStatus = "active" | "skipped" | "overridden" | "resolved";

export interface WorkerException {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  category: ExceptionCategory;
  status: ExceptionStatus;
  endDate?: string;
  currentStatus?: string;
  description: string;
}

interface F1v4_ExceptionsStepProps {
  company: CompanyPayrollData;
  exceptionsCount: number;
  onResolve: () => void;
  onContinue: () => void;
  hideHeader?: boolean;
}

const MOCK_EXCEPTIONS: WorkerException[] = [
  {
    id: "exc-1",
    workerId: "4",
    workerName: "Alex Hansen",
    workerCountry: "Norway",
    category: "end_date_passed",
    status: "active",
    endDate: "Nov 12, 2025",
    description: "End date (Nov 12, 2025) has passed but worker is still active in payroll.",
  },
  {
    id: "exc-2",
    workerId: "6",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    category: "ending_soon",
    status: "active",
    endDate: "Nov 12, 2025",
    description: "Employee ending this month — verify prorated pay. Last working day: Nov 12, 2025.",
  },
  {
    id: "exc-3",
    workerId: "3",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    category: "status_mismatch",
    status: "active",
    currentStatus: "Terminated",
    description: "This worker is not marked as Active (current status: Terminated). Review if they should be included in this pay run.",
  },
];

const categoryIcons: Record<ExceptionCategory, React.ElementType> = {
  end_date_passed: Calendar,
  ending_soon: Clock,
  status_mismatch: UserX,
};

const categoryLabels: Record<ExceptionCategory, string> = {
  end_date_passed: "End date passed",
  ending_soon: "Ending soon",
  status_mismatch: "Status mismatch",
};

const countryFlags: Record<string, string> = {
  Norway: "🇳🇴", Philippines: "🇵🇭", Singapore: "🇸🇬", Spain: "🇪🇸",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷",
};

export const F1v4_ExceptionsStep: React.FC<F1v4_ExceptionsStepProps> = ({
  company,
  exceptionsCount,
  onResolve,
  onContinue,
  hideHeader = false,
}) => {
  const [exceptions, setExceptions] = useState<WorkerException[]>(MOCK_EXCEPTIONS);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  const activeExceptions = exceptions.filter(e => e.status === "active");
  const skippedExceptions = exceptions.filter(e => e.status === "skipped");
  const resolvedCount = exceptions.filter(e => e.status === "overridden" || e.status === "resolved").length;

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSkip = (exceptionId: string, workerName: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "skipped" as ExceptionStatus } : e
    ));
    toast({
      description: (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Skipped for {workerName}</span>
        </div>
      ),
    });
    onResolve();
  };

  const handleOverride = (exceptionId: string, workerName: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "overridden" as ExceptionStatus } : e
    ));
    toast({
      description: (
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <span>Override confirmed for {workerName} — notification sent to company</span>
        </div>
      ),
    });
    onResolve();
  };

  const handleUndo = (exceptionId: string, workerName: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "active" as ExceptionStatus } : e
    ));
    toast({
      description: (
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <span>Restored {workerName} to active exceptions</span>
        </div>
      ),
    });
  };

  const canContinue = activeExceptions.length === 0;

  // Render exception card
  const renderExceptionCard = (exception: WorkerException, isSkipped: boolean = false) => {
    const CategoryIcon = categoryIcons[exception.category];

    return (
      <motion.div
        key={exception.id}
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.3 } }}
        className={cn(
          "rounded-lg border transition-colors",
          isSkipped 
            ? "border-border/30 bg-muted/20 opacity-75"
            : "border-amber-500/30 bg-amber-500/5"
        )}
      >
        <div className="p-4">
          {/* Header with worker info */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                {getInitials(exception.workerName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground">{exception.workerName}</p>
                <Badge variant="outline" className={cn(
                  "text-[9px] px-1.5 py-0 h-4 font-medium",
                  isSkipped
                    ? "bg-muted/50 text-muted-foreground border-border/40"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  <CategoryIcon className="h-2.5 w-2.5 mr-1" />
                  {categoryLabels[exception.category]}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {countryFlags[exception.workerCountry]} {exception.workerCountry}
              </p>
            </div>
          </div>

          {/* Exception message */}
          <div className={cn(
            "p-3 rounded-md text-sm mb-4",
            isSkipped ? "bg-muted/30" : "bg-amber-100/50 dark:bg-amber-900/20"
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn(
                "h-4 w-4 mt-0.5 flex-shrink-0",
                isSkipped ? "text-muted-foreground" : "text-amber-600"
              )} />
              <p className={cn(
                isSkipped ? "text-muted-foreground" : "text-foreground"
              )}>
                {exception.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isSkipped ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUndo(exception.id, exception.workerName)}
                className="h-8 text-xs gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSkip(exception.id, exception.workerName)}
                  className="h-8 text-xs"
                >
                  Skip now
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOverride(exception.id, exception.workerName)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Override & Continue
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Exception list content
  const renderExceptionsList = () => (
    <div className="space-y-4">
      {/* Active exceptions */}
      {activeExceptions.length === 0 && skippedExceptions.length === 0 ? (
        <div className="py-6 flex flex-col items-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-accent-green-text" />
          <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
          <p className="text-xs text-muted-foreground">Ready to approve payroll</p>
        </div>
      ) : (
        <>
          {activeExceptions.length > 0 && (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeExceptions.map((exception) => renderExceptionCard(exception, false))}
              </AnimatePresence>
            </div>
          )}

          {activeExceptions.length === 0 && skippedExceptions.length > 0 && (
            <div className="py-4 flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-6 w-6 text-accent-green-text" />
              <p className="text-sm font-medium text-foreground">No blocking exceptions</p>
              <p className="text-xs text-muted-foreground">
                {skippedExceptions.length} skipped — you can review them below
              </p>
            </div>
          )}

          {/* Skipped exceptions collapsible */}
          {skippedExceptions.length > 0 && (
            <Collapsible open={showSkipped} onOpenChange={setShowSkipped}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {skippedExceptions.length} skipped exception{skippedExceptions.length !== 1 ? 's' : ''}
                  </span>
                  {showSkipped ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-3">
                <AnimatePresence mode="popLayout">
                  {skippedExceptions.map((exception) => renderExceptionCard(exception, true))}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );

  // When hideHeader is true, just render the content without card wrapper
  if (hideHeader) {
    return renderExceptionsList();
  }

  return (
    <div className="space-y-5">
      {/* Exception List Card with Header */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-foreground">Exceptions</h3>
              {activeExceptions.length > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {activeExceptions.length} to review
                </Badge>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={onContinue} size="sm" disabled={!canContinue}>
                    Continue to Approve
                  </Button>
                </span>
              </TooltipTrigger>
              {!canContinue && (
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="text-xs">Review or skip all exceptions before continuing</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="py-4 px-4">
          {renderExceptionsList()}
        </CardContent>
      </Card>
    </div>
  );
};

export default F1v4_ExceptionsStep;
