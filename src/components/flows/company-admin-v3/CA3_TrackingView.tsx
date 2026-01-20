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
        return { icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green-fill/10 border-accent-green-outline/20", label: "Paid" };
      case "posted":
        return { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20", label: "Posted" };
      case "processing":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", label: "Processing" };
      case "queued":
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/30 border-border/20", label: "Queued" };
      case "failed":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10 border-red-500/20", label: "Failed" };
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

    return (
      <div key={worker.id}>
        <div 
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-150",
            isFailed 
              ? "border-l-[3px] border-l-red-500 border-r border-t border-b border-border/10 bg-red-500/[0.03] cursor-pointer hover:bg-red-500/[0.06]" 
              : "border-border/10 bg-muted/5 hover:bg-muted/15"
          )}
          onClick={() => isFailed && toggleFailedExpand(worker.id)}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-[10px] font-medium bg-muted/50">
              {getInitials(worker.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                {worker.type === "employee" ? "EE" : "C"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{worker.country}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(worker.amount, worker.currency)}
            </p>
          </div>

          <Badge 
            variant="outline" 
            className={cn("text-[10px] gap-1 border flex-shrink-0", statusConfig.bg, statusConfig.color)}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          
          {isFailed && (
            <div className="text-muted-foreground flex-shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>

        {/* Expanded error details for failed */}
        {isFailed && isExpanded && (
          <div className="mt-1 ml-11 p-3 rounded-lg bg-red-500/[0.03] border border-red-500/10 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {worker.errorMessage || "Payment failed"}
                </p>
                {worker.fixInstructions && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {worker.fixInstructions}
                  </p>
                )}
              </div>
            </div>
            {worker.canRetry && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Processing Status</h3>
          <p className="text-xs text-muted-foreground">Fronted is executing payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV} className="h-7 text-xs gap-1.5">
            <Download className="h-3 w-3" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadAuditPDF} className="h-7 text-xs gap-1.5">
            <FileText className="h-3 w-3" />
            Audit PDF
          </Button>
        </div>
      </div>

      {/* Summary Counts - Compact chips */}
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/10 border border-border/10">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
          <span className="text-xs">
            <span className="font-semibold">{paidCount}</span> completed
          </span>
        </div>
        {processingCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs">
              <span className="font-semibold">{processingCount}</span> processing
            </span>
          </div>
        )}
        {failedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs">
              <span className="font-semibold">{failedCount}</span> failed
            </span>
          </div>
        )}
      </div>

      {/* Subtle action banner for failures */}
      {failedCount > 0 && (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg border-l-[3px] border-l-red-500 bg-red-500/[0.03] border border-border/10">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-foreground">
            Action required: {failedCount} worker{failedCount !== 1 ? 's' : ''} failed. Click to expand and review.
          </p>
        </div>
      )}

      {/* Tabbed View */}
      <Tabs defaultValue="all">
        <TabsList className="h-8 bg-muted/20">
          <TabsTrigger value="all" className="text-[11px] h-6 px-3">
            All ({workers.length})
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-[11px] h-6 px-3 gap-1">
            <Users className="h-3 w-3" />
            EE ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="contractors" className="text-[11px] h-6 px-3 gap-1">
            <Briefcase className="h-3 w-3" />
            C ({contractors.length})
          </TabsTrigger>
          {failedCount > 0 && (
            <TabsTrigger value="failed" className="text-[11px] h-6 px-3 text-red-600">
              Failed ({failedCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {workers.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="employees" className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {employees.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="contractors" className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {contractors.map(renderWorkerRow)}
        </TabsContent>

        <TabsContent value="failed" className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {workers.filter(w => w.status === "failed").map(renderWorkerRow)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CA3_TrackingView;
