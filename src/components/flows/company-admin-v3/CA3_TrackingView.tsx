import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle, Download, FileText, Users, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
}

interface CA3_TrackingViewProps {
  workers: TrackingWorker[];
  onViewIssue: (worker: TrackingWorker) => void;
  onExportCSV: () => void;
  onDownloadAuditPDF: () => void;
}

export const CA3_TrackingView: React.FC<CA3_TrackingViewProps> = ({
  workers,
  onViewIssue,
  onExportCSV,
  onDownloadAuditPDF,
}) => {
  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  
  const successCount = workers.filter(w => w.status === "paid" || w.status === "posted").length;
  const failedCount = workers.filter(w => w.status === "failed").length;
  const processingCount = workers.filter(w => w.status === "processing" || w.status === "queued").length;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusConfig = (status: WorkerPaymentStatus) => {
    switch (status) {
      case "paid":
        return { icon: CheckCircle2, color: "text-accent-green-text", bg: "bg-accent-green-fill/10", label: "Paid" };
      case "posted":
        return { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10", label: "Posted" };
      case "processing":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", label: "Processing" };
      case "queued":
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/30", label: "Queued" };
      case "failed":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", label: "Failed" };
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$" };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const renderWorkerRow = (worker: TrackingWorker) => {
    const statusConfig = getStatusConfig(worker.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div 
        key={worker.id}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg border transition-colors",
          worker.status === "failed" ? "border-red-500/30 bg-red-500/5" : "border-border/30 bg-muted/10 hover:bg-muted/20"
        )}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs font-medium bg-muted">
            {getInitials(worker.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
          <p className="text-xs text-muted-foreground">{worker.country}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(worker.amount, worker.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs gap-1", statusConfig.bg, statusConfig.color, "border-transparent")}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          
          {worker.status === "failed" && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10"
              onClick={() => onViewIssue(worker)}
            >
              View issue
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Processing Status</h3>
          <p className="text-sm text-muted-foreground">Fronted is executing payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-2">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onDownloadAuditPDF} className="gap-2">
            <FileText className="h-3.5 w-3.5" />
            Audit PDF
          </Button>
        </div>
      </div>

      {/* Summary Counts */}
      <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/20 border border-border/30">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
          <span className="text-sm">
            <strong className="font-semibold text-foreground">{successCount}</strong>{" "}
            <span className="text-muted-foreground">completed</span>
          </span>
        </div>
        {processingCount > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-sm">
              <strong className="font-semibold text-foreground">{processingCount}</strong>{" "}
              <span className="text-muted-foreground">processing</span>
            </span>
          </div>
        )}
        {failedCount > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm">
              <strong className="font-semibold text-foreground">{failedCount}</strong>{" "}
              <span className="text-muted-foreground">failed</span>
            </span>
          </div>
        )}
      </div>

      {/* Tabbed View */}
      <Card className="border-border/20 bg-card/30">
        <CardContent className="p-4">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="text-xs">
                All ({workers.length})
              </TabsTrigger>
              <TabsTrigger value="employees" className="text-xs gap-1.5">
                <Users className="h-3 w-3" />
                Employees ({employees.length})
              </TabsTrigger>
              <TabsTrigger value="contractors" className="text-xs gap-1.5">
                <Briefcase className="h-3 w-3" />
                Contractors ({contractors.length})
              </TabsTrigger>
              {failedCount > 0 && (
                <TabsTrigger value="failed" className="text-xs text-red-600">
                  Failed ({failedCount})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
              {workers.map(renderWorkerRow)}
            </TabsContent>

            <TabsContent value="employees" className="space-y-2 max-h-96 overflow-y-auto">
              {employees.map(renderWorkerRow)}
            </TabsContent>

            <TabsContent value="contractors" className="space-y-2 max-h-96 overflow-y-auto">
              {contractors.map(renderWorkerRow)}
            </TabsContent>

            <TabsContent value="failed" className="space-y-2 max-h-96 overflow-y-auto">
              {workers.filter(w => w.status === "failed").map(renderWorkerRow)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CA3_TrackingView;
