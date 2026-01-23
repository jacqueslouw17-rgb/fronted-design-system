import React from "react";
import { CheckCircle2, Clock, Download, FileText, Users, Briefcase, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type WorkerPaymentStatus = "paid" | "posted" | "processing" | "failed" | "queued" | "sent";

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
  onExportCSV: () => void;
  onDownloadAuditPDF: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export const CA3_TrackingView: React.FC<CA3_TrackingViewProps> = ({
  workers,
  onExportCSV,
  onDownloadAuditPDF,
  onBack,
  onClose,
}) => {
  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  
  const completedCount = workers.filter(w => w.status === "paid" || w.status === "posted").length;
  const attentionCount = workers.filter(w => w.status === "failed").length;
  const processingCount = workers.filter(w => w.status === "processing" || w.status === "queued" || w.status === "sent").length;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status: WorkerPaymentStatus) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle2, color: "text-accent-green-text", label: "Completed" };
      case "posted":
        return { icon: CheckCircle2, color: "text-accent-green-text", label: "Completed" };
      case "processing":
        return { icon: Clock, color: "text-amber-600", label: "Processing" };
      case "queued":
        return { icon: Clock, color: "text-muted-foreground", label: "In progress" };
      case "sent":
        return { icon: Clock, color: "text-blue-600", label: "Sent to Fronted" };
      case "failed":
        return { icon: AlertTriangle, color: "text-amber-600", label: "Needs attention" };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const renderWorkerRow = (worker: TrackingWorker) => {
    const statusConfig = getStatusConfig(worker.status);
    const StatusIcon = statusConfig.icon;
    const needsAttention = worker.status === "failed";
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

    return (
      <div 
        key={worker.id}
        className={cn(
          "p-4 rounded-lg border bg-card",
          needsAttention ? "border-amber-500/30" : "border-border"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
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
            <p className="text-sm font-medium text-foreground min-w-[90px] text-right tabular-nums">
              {formatCurrency(worker.amount, worker.currency)}
            </p>

            <div className={cn("flex items-center gap-1.5 text-xs min-w-[110px]", statusConfig.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Error message inline within the card - no clickable actions for V1 */}
        {needsAttention && worker.errorMessage && (
          <div className="mt-3 pt-3 border-t border-amber-500/10 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              {worker.errorMessage}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-base font-medium text-foreground">Payment Status</h3>
            <div className="flex items-center gap-3 ml-3">
              <div className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-green-text" />
                <span className="font-medium">{completedCount}</span>
                <span className="text-muted-foreground">completed</span>
              </div>
              {processingCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium">{processingCount}</span>
                  <span className="text-muted-foreground">in progress</span>
                </div>
              )}
              {attentionCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-medium">{attentionCount}</span>
                  <span className="text-muted-foreground">needs attention</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onExportCSV} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownloadAuditPDF} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Audit
            </Button>
            {onClose && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onClose}
                className="h-9 text-xs"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Attention notice - subtle, calm banner */}
        {attentionCount > 0 && (
          <div className="flex items-start gap-3 py-3 px-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">{attentionCount} payment{attentionCount > 1 ? "s" : ""} need{attentionCount === 1 ? "s" : ""} attention</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fronted flagged an issue. Review details and contact support if needed.</p>
            </div>
          </div>
        )}

        {/* Tabbed View - read only, no clickable affordances */}
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
            {attentionCount > 0 && (
              <TabsTrigger value="attention" className="text-xs h-7 px-3 data-[state=active]:bg-background text-amber-600">
                Needs attention ({attentionCount})
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

          <TabsContent value="attention" className="mt-0 space-y-2 max-h-[450px] overflow-y-auto">
            {workers.filter(w => w.status === "failed").map(renderWorkerRow)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CA3_TrackingView;
