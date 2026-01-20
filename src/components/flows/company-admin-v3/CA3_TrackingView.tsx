import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, RefreshCw, Download, FileText, Users, Briefcase, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type WorkerPaymentStatus = "paid" | "posted" | "processing" | "failed" | "queued";

export interface TrackingWorker {
  id: string;
  name: string;
  country: string;
  type: "employee" | "contractor";
  amount: number;
  currency: string;
  status: WorkerPaymentStatus;
  errorMessage?: string;
  fixInstructions?: string;
  canRetry?: boolean;
}

interface CA3_TrackingViewProps {
  workers: TrackingWorker[];
  onViewIssue: (worker: TrackingWorker) => void;
  onRetry: (worker: TrackingWorker) => void;
  onExportCSV: () => void;
  onDownloadAuditPDF: () => void;
}

export const CA3_TrackingView: React.FC<CA3_TrackingViewProps> = ({
  workers,
  onRetry,
  onExportCSV,
  onDownloadAuditPDF,
}) => {
  const [expandedFailed, setExpandedFailed] = useState<string[]>([]);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  
  const paidCount = workers.filter(w => w.status === "paid" || w.status === "posted").length;
  const failedCount = workers.filter(w => w.status === "failed").length;
  const processingCount = workers.filter(w => w.status === "processing" || w.status === "queued").length;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status: WorkerPaymentStatus) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle2, color: "text-accent-green-text", label: "Paid" };
      case "posted":
        return { icon: CheckCircle2, color: "text-blue-600", label: "Posted" };
      case "processing":
        return { icon: Clock, color: "text-amber-600", label: "Processing" };
      case "queued":
        return { icon: Clock, color: "text-muted-foreground", label: "Queued" };
      case "failed":
        return { icon: XCircle, color: "text-red-600", label: "Failed" };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const toggleFailedExpand = (id: string) => {
    setExpandedFailed(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderWorkerRow = (worker: TrackingWorker) => {
    const statusConfig = getStatusConfig(worker.status);
    const StatusIcon = statusConfig.icon;
    const isExpanded = expandedFailed.includes(worker.id);
    const isFailed = worker.status === "failed";
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

    return (
      <div key={worker.id}>
        <div 
          className={cn(
            "flex items-center gap-4 p-3.5 rounded-lg transition-all duration-150 group",
            isFailed 
              ? "cursor-pointer hover:bg-muted/10" 
              : "hover:bg-muted/5"
          )}
          onClick={() => isFailed && toggleFailedExpand(worker.id)}
        >
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="text-[10px] font-medium bg-muted/30">
              {getInitials(worker.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-foreground">{worker.name}</p>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TypeIcon className="h-3 w-3" />
                {worker.type === "employee" ? "EE" : "C"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{worker.country}</p>
          </div>

          <div className="text-right flex-shrink-0 min-w-[90px]">
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(worker.amount, worker.currency)}
            </p>
          </div>

          <div className={cn("flex items-center gap-1 text-[10px] flex-shrink-0 min-w-[70px]", statusConfig.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </div>
          
          {isFailed && (
            <div className="text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors flex-shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>

        {/* Expanded error details */}
        {isFailed && isExpanded && (
          <div className="ml-14 mb-2 p-3 rounded-lg bg-muted/5 border border-border/5 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {worker.errorMessage || "Payment failed"}
                </p>
                {worker.fixInstructions && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {worker.fixInstructions}
                  </p>
                )}
              </div>
            </div>
            {worker.canRetry && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-[11px] gap-1 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(worker);
                  toast.info(`Retrying payment for ${worker.name}`);
                }}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
            <span className="font-medium">{paidCount}</span>
            <span className="text-muted-foreground">completed</span>
          </div>
          {processingCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{processingCount}</span>
              <span className="text-muted-foreground">processing</span>
            </div>
          )}
          {failedCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium">{failedCount}</span>
              <span className="text-muted-foreground">failed</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onExportCSV} className="h-7 text-[11px] gap-1 text-muted-foreground">
            <Download className="h-3 w-3" />
            CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownloadAuditPDF} className="h-7 text-[11px] gap-1 text-muted-foreground">
            <FileText className="h-3 w-3" />
            Audit
          </Button>
        </div>
      </div>

      {/* Failed alert - subtle */}
      {failedCount > 0 && (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-500/5 text-sm">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-foreground">{failedCount} need attention</span>
          <span className="text-muted-foreground">— click to expand</span>
        </div>
      )}

      {/* Tabbed View - minimal */}
      <Tabs defaultValue="all">
        <TabsList className="h-8 bg-transparent p-0 gap-1">
          <TabsTrigger value="all" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-muted/20">
            All ({workers.length})
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-muted/20 gap-1">
            <Users className="h-3 w-3" />
            Employees ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="contractors" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-muted/20 gap-1">
            <Briefcase className="h-3 w-3" />
            Contractors ({contractors.length})
          </TabsTrigger>
          {failedCount > 0 && (
            <TabsTrigger value="failed" className="text-[11px] h-7 px-3 rounded-md data-[state=active]:bg-muted/20 text-red-600">
              Failed ({failedCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-3 space-y-0.5 max-h-[400px] overflow-y-auto">
          {workers.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="employees" className="mt-3 space-y-0.5 max-h-[400px] overflow-y-auto">
          {employees.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="contractors" className="mt-3 space-y-0.5 max-h-[400px] overflow-y-auto">
          {contractors.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="failed" className="mt-3 space-y-0.5 max-h-[400px] overflow-y-auto">
          {workers.filter(w => w.status === "failed").map(renderWorkerRow)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CA3_TrackingView;
