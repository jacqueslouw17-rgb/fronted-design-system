/**
 * F1v4_TrackStep - Track & Reconcile with payment status
 * 
 * Dense glass-container layout matching Flow 6 v3 patterns
 */

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle,
  Download, 
  FileText,
  Users,
  Briefcase,
  Search,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer, WorkerData } from "./F1v4_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v4_PayslipPreviewModal";

interface F1v4_TrackStepProps {
  company: CompanyPayrollData;
}

const MOCK_TRACKED_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001234" },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001235" },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001236" },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "in-transit", providerRef: "PAY-2026-001237" },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0, paymentStatus: "not-paid" },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001238" },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "posted", providerRef: "PAY-2026-001239" },
];

const paymentStatusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  paid: { label: "Paid", icon: CheckCircle2, className: "text-accent-green-text" },
  "not-paid": { label: "Not paid", icon: XCircle, className: "text-destructive" },
  "in-transit": { label: "In transit", icon: Clock, className: "text-amber-600" },
  posted: { label: "Posted", icon: CheckCircle2, className: "text-blue-600" },
};

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷"
};

export const F1v4_TrackStep: React.FC<F1v4_TrackStepProps> = ({
  company,
}) => {
  const [workers, setWorkers] = useState<WorkerData[]>(MOCK_TRACKED_WORKERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payslipWorker, setPayslipWorker] = useState<WorkerData | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  const paidCount = workers.filter(w => w.paymentStatus === "paid" || w.paymentStatus === "posted").length;
  const notPaidCount = workers.filter(w => w.paymentStatus === "not-paid").length;
  const inTransitCount = workers.filter(w => w.paymentStatus === "in-transit").length;

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAsPaid = (workerId: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, paymentStatus: "paid" as const, providerRef: `PAY-2026-${Date.now().toString().slice(-6)}` } : w
    ));
    toast.success("Marked as paid");
  };

  const handleRetryPayout = (workerId: string) => {
    setWorkers(prev => prev.map(w => 
      w.id === workerId ? { ...w, paymentStatus: "in-transit" as const } : w
    ));
    toast.success("Payout retry initiated");
  };

  const handleViewDetails = (worker: WorkerData) => {
    const idx = workers.findIndex(w => w.id === worker.id);
    setSelectedWorkerIndex(idx >= 0 ? idx : 0);
    setDrawerOpen(true);
  };

  const handlePayslipPreview = (worker: WorkerData) => {
    setPayslipWorker(worker);
    setPayslipModalOpen(true);
  };

  const handleExportCSV = () => toast.success("CSV exported");
  const handleDownloadAuditPDF = () => toast.success("Audit PDF downloaded");

  const progressPercent = (paidCount / workers.length) * 100;

  return (
    <div className="space-y-5">
      {/* Approved Banner with Progress */}
      <Card className="border-accent-green-outline/30 bg-accent-green-fill/5">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
              <p className="text-sm font-medium text-foreground">Payroll approved and locked</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs h-7">
                <Download className="h-3 w-3" />CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadAuditPDF} className="gap-1.5 text-xs h-7">
                <FileText className="h-3 w-3" />Audit
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{paidCount} of {workers.length} payments completed</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-accent-green-text">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {paidCount} paid
        </span>
        {inTransitCount > 0 && (
          <span className="flex items-center gap-1.5 text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            {inTransitCount} in transit
          </span>
        )}
        {notPaidCount > 0 && (
          <span className="flex items-center gap-1.5 text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            {notPaidCount} not paid
          </span>
        )}
      </div>

      {/* Worker List Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-foreground">Payment Status</h3>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-8 h-8 text-xs bg-background/50 border-border/30" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-5 pt-4 pb-3 border-b border-border/30">
              <TabsList className="h-8 bg-muted/30 p-0.5">
                <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  All ({workers.length})
                </TabsTrigger>
                <TabsTrigger value="employees" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  Employees ({employees.length})
                </TabsTrigger>
                <TabsTrigger value="contractors" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  Contractors ({contractors.length})
                </TabsTrigger>
                {notPaidCount > 0 && (
                  <TabsTrigger value="not-paid" className="text-xs h-7 px-3 data-[state=active]:bg-background text-destructive">
                    Not paid ({notPaidCount})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-1.5">
              {["all", "employees", "contractors", "not-paid"].map((tabValue) => {
                let tabWorkers = filteredWorkers;
                if (tabValue === "employees") tabWorkers = employees.filter(w => filteredWorkers.includes(w));
                if (tabValue === "contractors") tabWorkers = contractors.filter(w => filteredWorkers.includes(w));
                if (tabValue === "not-paid") tabWorkers = filteredWorkers.filter(w => w.paymentStatus === "not-paid");

                return (
                  <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-1.5">
                    {tabWorkers.map((worker) => {
                      const config = paymentStatusConfig[worker.paymentStatus || "not-paid"];
                      const StatusIcon = config.icon;
                      const TypeIcon = worker.type === "employee" ? Users : Briefcase;

                      return (
                        <div 
                          key={worker.id}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30",
                            worker.paymentStatus === "not-paid" ? "border-destructive/30 bg-destructive/5" : "border-border/30 bg-card"
                          )}
                          onClick={() => handleViewDetails(worker)}
                        >
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                              {getInitials(worker.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground truncate">
                                {worker.name}
                              </span>
                              <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            </div>
                            <span className="text-[11px] text-muted-foreground leading-tight">
                              {countryFlags[worker.country] || ""} {worker.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <p className="text-sm font-semibold text-foreground tabular-nums min-w-[90px] text-right">
                              {formatCurrency(worker.netPay, worker.currency)}
                            </p>
                            <div className={cn("flex items-center gap-1 text-xs min-w-[70px]", config.className)}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Worker Detail Drawer */}
      <F1v4_WorkerDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        worker={workers[selectedWorkerIndex] || null}
        workers={workers}
        currentIndex={selectedWorkerIndex}
        onNavigate={setSelectedWorkerIndex}
        onPayslipPreview={handlePayslipPreview}
        isTrackStep={true}
        onMarkAsPaid={handleMarkAsPaid}
        onRetryPayout={handleRetryPayout}
      />

      {/* Payslip Preview Modal */}
      <F1v4_PayslipPreviewModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        worker={payslipWorker}
      />
    </div>
  );
};

export default F1v4_TrackStep;
