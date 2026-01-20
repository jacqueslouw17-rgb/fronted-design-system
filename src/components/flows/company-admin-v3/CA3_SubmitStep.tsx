import React, { useState } from "react";
import { Send, Users, Briefcase, CheckCircle2, Globe, Clock, ArrowRight, Download, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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

interface CA3_SubmitStepProps {
  totalCost: string;
  employeeCount: number;
  contractorCount: number;
  currencyCount?: number;
  warningCount?: number;
  onSubmit: () => void;
  // Track data for post-submit state
  trackingWorkers?: TrackingWorker[];
  onExportCSV?: () => void;
  onDownloadAuditPDF?: () => void;
}

export const CA3_SubmitStep: React.FC<CA3_SubmitStepProps> = ({
  totalCost,
  employeeCount,
  contractorCount,
  currencyCount = 3,
  onSubmit,
  trackingWorkers = [],
  onExportCSV = () => {},
  onDownloadAuditPDF = () => {},
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit();
  };

  // Track view calculations
  const employees = trackingWorkers.filter(w => w.type === "employee");
  const contractors = trackingWorkers.filter(w => w.type === "contractor");
  const paidCount = trackingWorkers.filter(w => w.status === "paid" || w.status === "posted").length;
  const failedCount = trackingWorkers.filter(w => w.status === "failed").length;
  const processingCount = trackingWorkers.filter(w => w.status === "processing" || w.status === "queued").length;

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

  const renderWorkerRow = (worker: TrackingWorker) => {
    const statusConfig = getStatusConfig(worker.status);
    const StatusIcon = statusConfig.icon;
    const isFailed = worker.status === "failed";
    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

    return (
      <div 
        key={worker.id}
        className={cn(
          "p-3.5 rounded-lg border bg-card/80 hover:bg-muted/30 transition-colors",
          isFailed ? "border-amber-500/20" : "border-border/60"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
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

            <div className={cn("flex items-center gap-1.5 text-xs min-w-[90px]", statusConfig.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </div>
          </div>
        </div>

        {isFailed && worker.errorMessage && (
          <div className="mt-3 pt-3 border-t border-amber-500/10 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{worker.errorMessage}</p>
          </div>
        )}
      </div>
    );
  };

  // Determine current step in the timeline
  const currentStep = isSubmitted ? (processingCount > 0 ? 2 : 3) : 1;

  return (
    <div className="min-h-[calc(100vh-280px)] relative">
      {/* Background gradient - extends full height */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none rounded-xl" />
      
      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Batch Overview OR Track List */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            {!isSubmitted ? (
              /* Batch Overview - Pre-submit */
              <>
                <div className="border-b border-border/40 py-4 px-5">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                    <h3 className="text-sm font-medium text-foreground">Batch Overview</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Ready to submit for processing</p>
                </div>
                
                <div className="p-5 space-y-5">
                  {/* Total payout - Hero */}
                  <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <p className="text-xs text-primary/70 mb-1">Total payout</p>
                    <p className="text-3xl font-semibold text-primary tracking-tight">{totalCost}</p>
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

                  {/* CTA */}
                  <div className="pt-2">
                    <Button onClick={handleSubmit} size="lg" className="h-11 px-6 gap-2">
                      <Send className="h-4 w-4" />
                      Submit to Fronted
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Typically 2–3 business days</p>
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
                </div>

                <div className="p-5 space-y-4">
                  {/* Failed notice - subtle */}
                  {failedCount > 0 && (
                    <div className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500/5 border border-amber-500/10 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <span className="text-foreground">{failedCount} payment{failedCount > 1 ? "s" : ""} need attention from Fronted support</span>
                    </div>
                  )}

                  {/* Search */}
                  <Input
                    placeholder="Search by name or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm bg-background/50"
                  />

                  {/* Tabbed View */}
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
                        <TabsTrigger value="failed" className="text-xs h-7 px-3 data-[state=active]:bg-background text-red-600">
                          Failed ({failedCount})
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <TabsContent value="all" className="mt-0 space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredWorkers.map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="employees" className="mt-0 space-y-2 max-h-[400px] overflow-y-auto">
                      {employees.filter(w => filteredWorkers.includes(w)).map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="contractors" className="mt-0 space-y-2 max-h-[400px] overflow-y-auto">
                      {contractors.filter(w => filteredWorkers.includes(w)).map(renderWorkerRow)}
                    </TabsContent>

                    <TabsContent value="failed" className="mt-0 space-y-2 max-h-[400px] overflow-y-auto">
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
          <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm h-full">
            <div className="border-b border-border/40 py-4 px-5">
              <h3 className="text-sm font-medium text-foreground">What happens next</h3>
            </div>
            
            <div className="p-5">
              {/* Vertical timeline */}
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                
                {/* Step 1: Submit batch */}
                <div className="relative pb-6">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentStep >= 1 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentStep >= 1 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep === 1 ? "text-foreground" : "text-muted-foreground"
                  )}>Submit batch</p>
                  <p className="text-xs text-muted-foreground">Send this payroll batch to Fronted for processing</p>
                </div>
                
                {/* Step 2: Fronted approval */}
                <div className="relative pb-6">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentStep >= 2 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentStep >= 2 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep === 2 ? "text-foreground" : "text-muted-foreground"
                  )}>Fronted approval</p>
                  <p className="text-xs text-muted-foreground">Fronted reviews and confirms the payout details</p>
                </div>
                
                {/* Step 3: Payments processed */}
                <div className="relative">
                  <div className={cn(
                    "absolute left-[-24px] w-4 h-4 rounded-full flex items-center justify-center",
                    currentStep >= 3 
                      ? "bg-accent-green-fill/20 border-2 border-accent-green-text" 
                      : "bg-muted border-2 border-muted-foreground/30"
                  )}>
                    {currentStep >= 3 && <div className="w-1.5 h-1.5 rounded-full bg-accent-green-text" />}
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep === 3 ? "text-foreground" : "text-muted-foreground"
                  )}>Payments processed</p>
                  <p className="text-xs text-muted-foreground">Payments are processed and status updates appear in Track</p>
                </div>
              </div>

              {/* Processing time note */}
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Typically 2–3 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CA3_SubmitStep;