/**
 * F1v4_ExceptionsStep - Worker status exception queue
 * 
 * Compact rows for worker status/termination issues
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle,
  CheckCircle2,
  UserX,
  Calendar,
  Clock,
  Send,
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

export type ExceptionCategory = "end_date_passed" | "ending_soon" | "status_mismatch";
export type ExceptionStatus = "active" | "skipped" | "overridden";

export interface WorkerException {
  id: string;
  workerId: string;
  workerName: string;
  workerCountry: string;
  category: ExceptionCategory;
  status: ExceptionStatus;
  shortDescription: string;
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
    shortDescription: "End date Nov 12 passed — still in payroll",
  },
  {
    id: "exc-2",
    workerId: "6",
    workerName: "Emma Wilson",
    workerCountry: "Norway",
    category: "ending_soon",
    status: "active",
    shortDescription: "Ending Nov 12 — verify prorated pay",
  },
  {
    id: "exc-3",
    workerId: "3",
    workerName: "Maria Santos",
    workerCountry: "Philippines",
    category: "status_mismatch",
    status: "active",
    shortDescription: "Status: Terminated — verify inclusion",
  },
];

const categoryIcons: Record<ExceptionCategory, React.ElementType> = {
  end_date_passed: Calendar,
  ending_soon: Clock,
  status_mismatch: UserX,
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
  const [showSkipped, setShowSkipped] = useState(false);

  const activeExceptions = exceptions.filter(e => e.status === "active");
  const skippedExceptions = exceptions.filter(e => e.status === "skipped");

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSkip = (exceptionId: string, workerName: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "skipped" as ExceptionStatus } : e
    ));
    toast({ description: `Skipped for ${workerName}` });
    onResolve();
  };

  const handleOverride = (exceptionId: string, workerName: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "overridden" as ExceptionStatus } : e
    ));
    toast({ description: `Override confirmed — notification sent to company` });
    onResolve();
  };

  const handleUndo = (exceptionId: string) => {
    setExceptions(prev => prev.map(e => 
      e.id === exceptionId ? { ...e, status: "active" as ExceptionStatus } : e
    ));
  };

  const canContinue = activeExceptions.length === 0;

  // Compact exception row
  const renderExceptionRow = (exception: WorkerException, isSkipped: boolean = false) => {
    const CategoryIcon = categoryIcons[exception.category];

    return (
      <motion.div
        key={exception.id}
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
          isSkipped 
            ? "bg-muted/20 border-border/30 opacity-60"
            : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
        )}
      >
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
            {getInitials(exception.workerName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {exception.workerName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {countryFlags[exception.workerCountry]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CategoryIcon className="h-3 w-3 text-amber-600" />
            <span className="truncate">{exception.shortDescription}</span>
          </div>
        </div>

        {isSkipped ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUndo(exception.id)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Undo
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSkip(exception.id, exception.workerName)}
              className="h-7 px-2 text-xs"
            >
              Skip
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOverride(exception.id, exception.workerName)}
              className="h-7 px-2 text-xs gap-1"
            >
              <Send className="h-3 w-3" />
              Override
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  const renderContent = () => (
    <div className="space-y-2">
      {activeExceptions.length === 0 && skippedExceptions.length === 0 ? (
        <div className="py-6 flex flex-col items-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-accent-green-text" />
          <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
          <p className="text-xs text-muted-foreground">Ready to approve payroll</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {activeExceptions.map(exc => renderExceptionRow(exc, false))}
          </AnimatePresence>

          {activeExceptions.length === 0 && skippedExceptions.length > 0 && (
            <div className="py-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-accent-green-text mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">No blocking exceptions</p>
            </div>
          )}

          {skippedExceptions.length > 0 && (
            <Collapsible open={showSkipped} onOpenChange={setShowSkipped}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/30 transition-colors text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {skippedExceptions.length} skipped
                  </span>
                  {showSkipped ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1.5 pt-1">
                <AnimatePresence mode="popLayout">
                  {skippedExceptions.map(exc => renderExceptionRow(exc, true))}
                </AnimatePresence>
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );

  if (hideHeader) {
    return renderContent();
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="py-4 px-5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-foreground">Exceptions</h3>
            {activeExceptions.length > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
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
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default F1v4_ExceptionsStep;
