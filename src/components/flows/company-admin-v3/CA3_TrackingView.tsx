import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, RefreshCw, Download, FileText, Users, Briefcase, ChevronDown, ChevronUp, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
            "flex items-center justify-between p-4 rounded-lg border border-border bg-card transition-colors group",
            isFailed 
              ? "cursor-pointer hover:bg-muted/30" 
              : "hover:bg-muted/30"
          )}
          onClick={() => isFailed && toggleFailedExpand(worker.id)}
        >
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">{worker.name}</p>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {worker.type === "employee" ? "Employee" : "Contractor"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{worker.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
            <p className="text-sm font-medium text-foreground min-w-[90px] text-right">
              {formatCurrency(worker.amount, worker.currency)}
            </p>

            <div className={cn("flex items-center gap-1.5 text-xs min-w-[80px]", statusConfig.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </div>
            
            {isFailed && (
              <div className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
            {!isFailed && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            )}
          </div>
        </div>

        {/* Expanded error details */}
        {isFailed && isExpanded && (
          <div className="ml-14 mt-2 mb-3 p-4 rounded-lg border border-border bg-card space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
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
                className="h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(worker);
                  toast.info(`Retrying payment for ${worker.name}`);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Payment
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-medium text-foreground">Payment Status</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                <span className="font-medium">{paidCount}</span>
                <span className="text-muted-foreground">completed</span>
              </div>
              {processingCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-medium">{processingCount}</span>
                  <span className="text-muted-foreground">processing</span>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-medium">{failedCount}</span>
                  <span className="text-muted-foreground">failed</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={onExportCSV} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadAuditPDF} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Audit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Failed alert - subtle */}
        {failedCount > 0 && (
          <div className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span className="text-foreground">{failedCount} payment{failedCount > 1 ? "s" : ""} need attention</span>
            <span className="text-muted-foreground">— click to expand</span>
          </div>
        )}

        {/* Tabbed View */}
        <Tabs defaultValue="all">
          <TabsList className="h-9 bg-muted/30 p-1 mb-4">
            <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">
              All ({workers.length})
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-xs h-7 px-3 data-[state=active]:bg-background gap-1.5">
              <Users className="h-3 w-3" />
              Employees ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="contractors" className="text-xs h-7 px-3 data-[state=active]:bg-background gap-1.5">
              <Briefcase className="h-3 w-3" />
              Contractors ({contractors.length})
            </TabsTrigger>
            {failedCount > 0 && (
              <TabsTrigger value="failed" className="text-xs h-7 px-3 data-[state=active]:bg-background text-red-600">
                Failed ({failedCount})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="mt-0 space-y-2 max-h-[450px] overflow-y-auto">
            {workers.map(renderWorkerRow)}
          </TabsContent>

          <TabsContent value="employees" className="mt-0 space-y-2 max-h-[450px] overflow-y-auto">
            {employees.map(renderWorkerRow)}
          </TabsContent>

          <TabsContent value="contractors" className="mt-0 space-y-2 max-h-[450px] overflow-y-auto">
            {contractors.map(renderWorkerRow)}
          </TabsContent>

          <TabsContent value="failed" className="mt-0 space-y-2 max-h-[450px] overflow-y-auto">
            {workers.filter(w => w.status === "failed").map(renderWorkerRow)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CA3_TrackingView;