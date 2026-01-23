import React, { useState } from "react";
import { Send, Users, Briefcase, CheckCircle2, Globe, Clock, Download, FileText, XCircle, AlertTriangle, ShieldCheck, ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
}

interface CA3_SubmitStepProps {
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount?: number;
  isSubmitted?: boolean;
  onRequestSubmit: () => void; // Opens confirmation modal
  // Track data for post-submit state
  trackingWorkers?: TrackingWorker[];
  onExportCSV?: () => void;
  onDownloadAuditPDF?: () => void;
  // Navigation
  onBack?: () => void;
  onClose?: () => void;
}

export const CA3_SubmitStep: React.FC<CA3_SubmitStepProps> = ({
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount = 3,
  isSubmitted = false,
  onRequestSubmit,
  trackingWorkers = [],
  onExportCSV = () => {},
  onDownloadAuditPDF = () => {},
  onBack,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshingFx, setIsRefreshingFx] = useState(false);

  const handleRefreshFx = () => {
    setIsRefreshingFx(true);
    setTimeout(() => setIsRefreshingFx(false), 1200);
  };

  // Track view calculations
  const employees = trackingWorkers.filter(w => w.type === "employee");
  const contractors = trackingWorkers.filter(w => w.type === "contractor");
  const completedCount = trackingWorkers.filter(w => w.status === "paid" || w.status === "posted").length;
  const failedCount = trackingWorkers.filter(w => w.status === "failed").length;
  const processingCount = trackingWorkers.filter(w => w.status === "processing" || w.status === "queued" || w.status === "sent").length;

  const filteredWorkers = trackingWorkers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    const isFailed = worker.status === "failed";
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

    return (
      <div 
        key={worker.id}
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-card border border-border/30",
          isFailed && "border-amber-500/30 bg-amber-500/5"
        )}
      >
        {/* Avatar */}
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
            {getInitials(worker.name)}
          </AvatarFallback>
        </Avatar>

        {/* Name & Country */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
            <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground">· {worker.country}</span>
          </div>
          {isFailed && worker.errorMessage && (
            <p className="text-[10px] text-amber-600 truncate leading-tight">{worker.errorMessage}</p>
          )}
        </div>

        {/* Amount */}
        <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
          {formatCurrency(worker.amount, worker.currency)}
        </p>

        {/* Status */}
        <div className={cn("flex items-center gap-1 text-[11px] min-w-[80px]", statusConfig.color)}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </div>
      </div>
    );
  };

  // Determine current step in the timeline (1=submit, 2=review, 3=processing, 4=complete)
  let currentTimelineStep = 1;
  if (isSubmitted) {
    if (processingCount > 0) {
      currentTimelineStep = 3;
    } else {
      currentTimelineStep = 4;
    }
  }

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.02] to-secondary/[0.02] border-b border-border/40 py-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {!isSubmitted && onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground -ml-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-base font-medium text-foreground">
              {isSubmitted ? "Payment Status" : "Submit Batch"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
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
      <CardContent className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Batch Overview OR Track List */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border/40 bg-background/50 overflow-hidden">
              {!isSubmitted ? (
              /* Batch Overview - Pre-submit */
              <>
                <div className="p-5 space-y-5">
                  {/* Pre-flight validation message */}
                  <div className="flex items-center gap-2.5 py-3 px-4 rounded-lg bg-accent-green-fill/5 border border-accent-green-outline/20">
                    <ShieldCheck className="h-4 w-4 text-accent-green-text flex-shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">Pre-flight validation complete</p>
                      <p className="text-xs text-muted-foreground">Fronted will run final compliance + payment checks after you submit.</p>
                    </div>
                  </div>

                  {/* Total payout - Hero with breakdown */}
                  <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-primary/70">Estimated total payout</p>
                      <button 
                        onClick={handleRefreshFx}
                        disabled={isRefreshingFx}
                        className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-2.5 w-2.5", isRefreshingFx && "animate-spin")} />
                        {isRefreshingFx ? "Refreshing..." : "Refresh FX"}
                      </button>
                    </div>
                    <p className="text-3xl font-semibold text-primary tracking-tight">{totalCost}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Based on current rates · EUR 1.08 · PHP 0.018 · NOK 0.089
                    </p>
                    
                    {/* Elegant receipt-style breakdown */}
                    <div className="mt-4 pt-3 border-t border-primary/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Gross pay</span>
                        <span className="text-foreground tabular-nums">$124,800</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Fronted fees</span>
                        <span className="text-foreground tabular-nums">$3,792</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-primary/10">
                        <span className="text-primary/80 font-medium">Net payout</span>
                        <span className="text-primary font-medium tabular-nums">$128,592</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Breakdown tiles */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Employees</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">{employeeCount}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Contractors</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">{contractorCount}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border/60 bg-card/80">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Currencies</span>
                      </div>
                      <p className="text-xl font-semibold text-foreground">{currencyCount}</p>
                    </div>
                  </div>

                  {/* CTA - Single primary action */}
                  <div className="pt-2">
                    <Button onClick={onRequestSubmit} size="lg" className="h-11 px-6 gap-2">
                      <Send className="h-4 w-4" />
                      Submit to Fronted
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Track List - Post-submit */
              <>
                <div className="border-b border-border/40 py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">Payment Status</h3>
                      <div className="flex items-center gap-3">
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
                        {failedCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-medium">{failedCount}</span>
                            <span className="text-muted-foreground">needs attention</span>
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
                </div>

                <div className="p-5 space-y-4">
                  {/* Failed notice - subtle, calm banner */}
                  {failedCount > 0 && (
                    <div className="flex items-start gap-3 py-3 px-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{failedCount} payment{failedCount > 1 ? "s" : ""} need{failedCount === 1 ? "s" : ""} attention</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Fronted flagged an issue. Review details and contact support if needed.</p>
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <Input
                    placeholder="Search by name or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm bg-background/50"
                  />

                  {/* Tabbed View - read-only */}
                  <Tabs defaultValue="all">
                    <TabsList className="h-9 bg-muted/30 p-1 mb-4">
                      <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                        All ({filteredWorkers.length})
                      </TabsTrigger>
                      <TabsTrigger value="employees" className="text-xs h-7 px-3 data-[state=active]:bg-background gap-1.5">
                        <Users className="h-3 w-3" />
                        Employees ({employees.filter(w => filteredWorkers.includes(w)).length})
                      </TabsTrigger>
                      <TabsTrigger value="contractors" className="text-xs h-7 px-3 data-[state=active]:bg-background gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        Contractors ({contractors.filter(w => filteredWorkers.includes(w)).length})
                      </TabsTrigger>
                      {failedCount > 0 && (
                        <TabsTrigger value="attention" className="text-xs h-7 px-3 data-[state=active]:bg-background text-amber-600">
                          Needs attention ({failedCount})
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="all" className="mt-0 space-y-1 max-h-[400px] overflow-y-auto">
                      {filteredWorkers.map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="employees" className="mt-0 space-y-1 max-h-[400px] overflow-y-auto">
                      {employees.filter(w => filteredWorkers.includes(w)).map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="contractors" className="mt-0 space-y-1 max-h-[400px] overflow-y-auto">
                      {contractors.filter(w => filteredWorkers.includes(w)).map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="attention" className="mt-0 space-y-1 max-h-[400px] overflow-y-auto">
                      {filteredWorkers.filter(w => w.status === "failed").map(renderWorkerRow)}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel: What happens next - Always visible */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="border-b border-border/40 py-4 px-5">
              <h3 className="text-sm font-medium text-foreground">What happens next</h3>
            </div>
            
            <div className="p-5">
              {/* Vertical timeline - 4 steps with updated copy */}
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                
                {/* Step 1: Submit batch */}
                <div className="relative pb-6">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentTimelineStep >= 1 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentTimelineStep >= 1 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentTimelineStep === 1 ? "text-foreground" : "text-muted-foreground"
                  )}>Submit batch</p>
                  <p className="text-xs text-muted-foreground">Send payroll to Fronted for processing.</p>
                </div>
                
                {/* Step 2: Fronted review */}
                <div className="relative pb-6">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentTimelineStep >= 2 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentTimelineStep >= 2 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentTimelineStep === 2 ? "text-foreground" : "text-muted-foreground"
                  )}>Fronted review</p>
                  <p className="text-xs text-muted-foreground">Fronted runs final checks and confirms payment.</p>
                </div>
                
                {/* Step 3: Processing */}
                <div className="relative pb-6">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentTimelineStep >= 3 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentTimelineStep >= 3 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentTimelineStep === 3 ? "text-foreground" : "text-muted-foreground"
                  )}>Processing</p>
                  <p className="text-xs text-muted-foreground">Payments are being processed externally.</p>
                </div>
                
                {/* Step 4: Complete */}
                <div className="relative">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentTimelineStep >= 4 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentTimelineStep >= 4 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentTimelineStep === 4 ? "text-foreground" : "text-muted-foreground"
                  )}>Complete</p>
                  <p className="text-xs text-muted-foreground">All payments are complete (or flagged if action needed).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CA3_SubmitStep;
