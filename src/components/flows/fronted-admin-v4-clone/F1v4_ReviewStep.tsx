/**
 * F1v4_ReviewStep - Review payroll totals and workers
 * 
 * Dense, glass-container layout matching Flow 6 v3 patterns
 */

import React, { useState } from "react";
import { 
  Users, 
  Briefcase, 
  DollarSign,
  Receipt,
  Building2,
  TrendingUp,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer, WorkerData } from "./F1v4_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v4_PayslipPreviewModal";

interface F1v4_ReviewStepProps {
  company: CompanyPayrollData;
  onContinue: () => void;
}

const MOCK_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0 },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0 },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "auto-generated", netPay: 280000, issues: 0 },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "missing-submission", netPay: 65000, issues: 1, missingData: [{ field: "Timesheet", reason: "Not submitted for this period", fix: "Send reminder" }] },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0 },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "needs-attention", netPay: 72000, issues: 2, missingData: [{ field: "Bank details", reason: "Account verification pending", fix: "Request verification" }] },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0 },
];

const statusConfig: Record<WorkerData["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  "auto-generated": { label: "Auto", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "missing-submission": { label: "Missing", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "needs-attention": { label: "Attention", className: "bg-destructive/10 text-destructive border-destructive/20" },
  blocking: { label: "Blocking", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹"
};

export const F1v4_ReviewStep: React.FC<F1v4_ReviewStepProps> = ({
  company,
  onContinue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [workers] = useState<WorkerData[]>(MOCK_WORKERS);
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
  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (worker: WorkerData) => {
    const idx = workers.findIndex(w => w.id === worker.id);
    setSelectedWorkerIndex(idx >= 0 ? idx : 0);
    setDrawerOpen(true);
  };

  const handlePayslipPreview = (worker: WorkerData) => {
    setPayslipWorker(worker);
    setPayslipModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card with KPIs */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="py-5 px-5">
          {/* KPI Grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Gross Pay</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$124.9K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Salaries + Contractor fees</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Adjustments</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$8.2K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Bonuses, overtime & expenses</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Fronted Fees</span>
              </div>
              <p className="text-xl font-semibold text-foreground">$3.7K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Transaction + Service</p>
            </div>

            <div className="bg-primary/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Total Cost</span>
              </div>
              <p className="text-xl font-semibold text-foreground">${(company.totalCost / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Pay + All Fees</p>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground py-2.5 border-t border-border/30">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Employees: <strong className="text-foreground">{employees.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Contractors: <strong className="text-foreground">{contractors.length}</strong>
            </span>
            <span className="text-border">·</span>
            <span>Currencies: <strong className="text-foreground">{company.currencyCount}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Worker List */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Workers</h3>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-7 text-xs bg-background/50" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3">
          <Tabs defaultValue="all">
            <TabsList className="h-7 bg-muted/30 p-0.5 mb-3">
              <TabsTrigger value="all" className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background">All ({workers.length})</TabsTrigger>
              <TabsTrigger value="employees" className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background">Employees ({employees.length})</TabsTrigger>
              <TabsTrigger value="contractors" className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background">Contractors ({contractors.length})</TabsTrigger>
            </TabsList>

            {["all", "employees", "contractors"].map((tabValue) => {
              const tabWorkers = tabValue === "all" ? filteredWorkers : tabValue === "employees" ? employees.filter(w => filteredWorkers.includes(w)) : contractors.filter(w => filteredWorkers.includes(w));

              return (
                <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-1.5">
                  {tabWorkers.map((worker) => {
                    const config = statusConfig[worker.status];
                    const TypeIcon = worker.type === "employee" ? Users : Briefcase;

                    return (
                      <div key={worker.id} className="px-3 py-2.5 rounded-lg bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewDetails(worker)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 flex-1">
                            <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">{getInitials(worker.name)}</AvatarFallback></Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-foreground">{worker.name}</p>
                                <TypeIcon className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <p className="text-[11px] text-muted-foreground">{countryFlags[worker.country] || ""} {worker.country} · {worker.currency}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-medium", config.className)}>{config.label}</Badge>
                            {worker.issues > 0 && <span className="text-[10px] text-destructive font-medium">{worker.issues}</span>}
                            <p className="text-sm font-medium text-foreground min-w-[90px] text-right tabular-nums">{formatCurrency(worker.netPay, worker.currency)}</p>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
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
      </Card>

      {/* Continue Action */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Deadline: <span className="font-medium text-foreground">Jan 25</span> — 5 days left</p>
        <Button onClick={onContinue} size="sm" className="gap-1.5">Continue to Exceptions<ChevronRight className="h-3.5 w-3.5" /></Button>
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

export default F1v4_ReviewStep;
