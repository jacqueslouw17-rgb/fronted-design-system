/**
 * F1v4_TrackStep - Track & Reconcile with worker drawer integration
 * 
 * Clean binary states for v1 with detailed worker view
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
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer, WorkerData } from "./F1v4_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v4_PayslipPreviewModal";

interface F1v4_TrackStepProps {
  company: CompanyPayrollData;
}

// Mock workers with payment status for tracking
const MOCK_TRACKED_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001234", receiptUrl: "#" },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001235", receiptUrl: "#" },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001236", receiptUrl: "#" },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "ready", netPay: 65000, issues: 0, paymentStatus: "in-transit", providerRef: "PAY-2026-001237" },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0, paymentStatus: "not-paid" },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "ready", netPay: 72000, issues: 0, paymentStatus: "paid", providerRef: "PAY-2026-001238", receiptUrl: "#" },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0, paymentStatus: "posted", providerRef: "PAY-2026-001239" },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
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

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  const paidCount = workers.filter(w => w.paymentStatus === "paid").length;
  const notPaidCount = workers.filter(w => w.paymentStatus === "not-paid").length;
  const inTransitCount = workers.filter(w => w.paymentStatus === "in-transit").length;
  const postedCount = workers.filter(w => w.paymentStatus === "posted").length;

  const employeesTotal = employees.reduce((sum, w) => sum + w.netPay, 0);
  const contractorsTotal = contractors.reduce((sum, w) => sum + w.netPay, 0);

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

  const handleExportCSV = () => {
    toast.success("CSV exported");
  };

  const handleDownloadAuditPDF = () => {
    toast.success("Audit PDF downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Approved Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-accent-green-outline/30 bg-accent-green-fill/5">
        <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Payroll approved and locked</p>
          <p className="text-xs text-muted-foreground">Track payment status and reconcile below</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadAuditPDF} className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Audit PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Employees Summary */}
        <div className="p-5 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Employees</h3>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 ml-auto">
              {employees.length} workers
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-foreground mb-2">
            ${(employeesTotal / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-accent-green-text">
              <CheckCircle2 className="h-3 w-3" />
              {employees.filter(e => e.paymentStatus === "paid" || e.paymentStatus === "posted").length} paid
            </span>
            {employees.filter(e => e.paymentStatus === "not-paid").length > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" />
                {employees.filter(e => e.paymentStatus === "not-paid").length} not paid
              </span>
            )}
          </div>
        </div>

        {/* Contractors Summary */}
        <div className="p-5 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Contractors</h3>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 ml-auto">
              {contractors.length} workers
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-foreground mb-2">
            ${(contractorsTotal / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-accent-green-text">
              <CheckCircle2 className="h-3 w-3" />
              {contractors.filter(c => c.paymentStatus === "paid").length} paid
            </span>
            {contractors.filter(c => c.paymentStatus === "not-paid").length > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" />
                {contractors.filter(c => c.paymentStatus === "not-paid").length} not paid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Worker List */}
      <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-foreground">Payment Status</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-accent-green-text">
                  <CheckCircle2 className="h-3 w-3" />
                  {paidCount + postedCount} paid
                </span>
                {inTransitCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3 w-3" />
                    {inTransitCount} in transit
                  </span>
                )}
                {notPaidCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-3 w-3" />
                    {notPaidCount} not paid
                  </span>
                )}
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs bg-background/50"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="p-4">
          <TabsList className="h-8 bg-muted/30 p-0.5 mb-4">
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
            {notPaidCount > 0 && (
              <TabsTrigger value="not-paid" className="text-xs h-7 px-3 data-[state=active]:bg-background text-destructive">
                Not paid ({notPaidCount})
              </TabsTrigger>
            )}
          </TabsList>

          {["all", "employees", "contractors", "not-paid"].map((tabValue) => {
            let tabWorkers = filteredWorkers;
            if (tabValue === "employees") tabWorkers = employees.filter(w => filteredWorkers.includes(w));
            if (tabValue === "contractors") tabWorkers = contractors.filter(w => filteredWorkers.includes(w));
            if (tabValue === "not-paid") tabWorkers = filteredWorkers.filter(w => w.paymentStatus === "not-paid");

            return (
              <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-2">
                {tabWorkers.map((worker) => {
                  const config = statusConfig[worker.paymentStatus || "not-paid"];
                  const StatusIcon = config.icon;
                  const TypeIcon = worker.type === "employee" ? Users : Briefcase;

                  return (
                    <div 
                      key={worker.id}
                      className={cn(
                        "p-3.5 rounded-lg border bg-card/80 hover:bg-muted/30 transition-colors cursor-pointer",
                        worker.paymentStatus === "not-paid" ? "border-destructive/30" : "border-border/60"
                      )}
                      onClick={() => handleViewDetails(worker)}
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
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{countryFlags[worker.country] || ""}</span>
                              {worker.country}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          <p className="text-sm font-medium text-foreground min-w-[100px] text-right tabular-nums">
                            {formatCurrency(worker.netPay, worker.currency)}
                          </p>

                          <div className={cn("flex items-center gap-1.5 text-xs min-w-[90px]", config.className)}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </div>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-muted-foreground gap-1"
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(worker); }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

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
