/**
 * F1v4_ExceptionsStep - Prioritized exception queue
 * 
 * Dense glass-container layout matching Flow 6 v3 patterns
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Clock,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
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
  Norway: "🇳🇴", Philippines: "🇵🇭", Singapore: "🇸🇬", Spain: "🇪🇸",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷",
};

interface PendingProgress {
  exceptionId: string;
  progress: number;
  workerName: string;
}

interface TimerRefs {
  timeout: NodeJS.Timeout;
  interval: NodeJS.Timeout;
}

export const F1v4_ExceptionsStep: React.FC<F1v4_ExceptionsStepProps> = ({
  company,
  exceptionsCount,
  onResolve,
  onContinue,
}) => {
  const [exceptions, setExceptions] = useState<Exception[]>(MOCK_EXCEPTIONS);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<PendingProgress[]>([]);
  const timersRef = useRef<Map<string, TimerRefs>>(new Map());

  const selectedException = exceptions.find((e) => e.id === selectedExceptionId) || null;

  useEffect(() => {
    const pendingBlockers = exceptions.filter(
      (e) => e.type === "blocking" && e.status === "pending"
    );

    pendingBlockers.forEach((exception) => {
      if (!timersRef.current.has(exception.id)) {
        setPendingProgress((prev) => {
          if (prev.find((p) => p.exceptionId === exception.id)) return prev;
          return [...prev, { exceptionId: exception.id, progress: 0, workerName: exception.workerName }];
        });

        const progressInterval = setInterval(() => {
          setPendingProgress((prev) =>
            prev.map((p) =>
              p.exceptionId === exception.id
                ? { ...p, progress: Math.min(p.progress + 2.5, 100) }
                : p
            )
          );
        }, 100);

        const exceptionId = exception.id;
        const workerName = exception.workerName;

        const timeout = setTimeout(() => {
          const refs = timersRef.current.get(exceptionId);
          if (refs) clearInterval(refs.interval);
          
          setExceptions((prev) =>
            prev.map((e) =>
              e.id === exceptionId ? { ...e, status: "resolved" as ExceptionStatus } : e
            )
          );

          setPendingProgress((prev) =>
            prev.filter((p) => p.exceptionId !== exceptionId)
          );

          toast({
            description: (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                <span>{workerName} responded — resolved</span>
              </div>
            ),
          });

          onResolve();
          timersRef.current.delete(exceptionId);
        }, 4000);

        timersRef.current.set(exception.id, { timeout, interval: progressInterval });
      }
    });
  }, [exceptions, onResolve]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((refs) => {
        clearTimeout(refs.timeout);
        clearInterval(refs.interval);
      });
      timersRef.current.clear();
    };
  }, []);

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

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleOpenFix = (exceptionId: string) => {
    setSelectedExceptionId(exceptionId);
    setDrawerOpen(true);
  };

  const handleStatusChange = (exceptionId: string, newStatus: ExceptionStatus) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === exceptionId ? { ...e, status: newStatus } : e))
    );
    if (newStatus === "resolved") onResolve();
  };

  const canContinue = blockingExceptions.length === 0 && pendingBlockingExceptions.length === 0;

  const getProgress = (exceptionId: string): number => {
    return pendingProgress.find((p) => p.exceptionId === exceptionId)?.progress || 0;
  };

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      {visibleExceptions.length === 0 ? (
        <Card className="border-accent-green-outline/30 bg-accent-green-fill/5">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
            <div>
              <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
              <p className="text-xs text-muted-foreground">Ready to approve payroll</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn(
          "border-border/40",
          blockingExceptions.length > 0 || pendingBlockingExceptions.length > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-amber-500/30 bg-amber-500/5"
        )}>
          <CardContent className="py-4 px-5 flex items-center gap-3">
            {blockingExceptions.length > 0 || pendingBlockingExceptions.length > 0 ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {blockingExceptions.length > 0
                  ? `${blockingExceptions.length} blocking exception${blockingExceptions.length > 1 ? "s" : ""}`
                  : pendingBlockingExceptions.length > 0
                  ? `${pendingBlockingExceptions.length} pending resolution`
                  : `${warningExceptions.length} warning${warningExceptions.length > 1 ? "s" : ""}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {blockingExceptions.length > 0
                  ? "Resolve to continue"
                  : pendingBlockingExceptions.length > 0
                  ? "Waiting on response"
                  : "Review before approving"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exception List */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="py-3 px-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {visibleExceptions.map((exception) => {
              const CategoryIcon = categoryIcons[exception.category];
              const isBlocking = exception.type === "blocking";
              const isPending = exception.status === "pending";
              const progress = getProgress(exception.id);

              return (
                <motion.div
                  key={exception.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.3 } }}
                  className={cn(
                    "px-3 py-2.5 rounded-lg border transition-all cursor-pointer hover:bg-muted/30",
                    isBlocking && !isPending && "border-destructive/30 bg-destructive/5",
                    isBlocking && isPending && "border-accent-green-outline/30 bg-accent-green-fill/5",
                    !isBlocking && "border-amber-500/20 bg-amber-500/5"
                  )}
                  onClick={() => handleOpenFix(exception.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                        {getInitials(exception.workerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CategoryIcon className={cn(
                          "h-3.5 w-3.5",
                          isBlocking && !isPending && "text-destructive",
                          isBlocking && isPending && "text-accent-green-text",
                          !isBlocking && "text-amber-600"
                        )} />
                        <p className="text-sm font-medium text-foreground">{exception.title}</p>
                        <Badge variant="outline" className={cn(
                          "text-[9px] px-1.5 py-0 h-4 font-medium",
                          isBlocking
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}>
                          {isBlocking ? "Blocking" : "Warning"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {countryFlags[exception.workerCountry]} {exception.workerName}
                        {!isPending && ` · ${exception.description}`}
                      </p>
                      {isPending && isBlocking && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-1 bg-muted" />
                          <p className="text-[10px] text-muted-foreground mt-1">Awaiting response...</p>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visibleExceptions.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No exceptions to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Action */}
      <div className="flex items-center justify-end">
        <Button onClick={onContinue} size="sm" disabled={!canContinue} className="gap-1.5">
          Continue to Approve
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Exception Fix Drawer */}
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
