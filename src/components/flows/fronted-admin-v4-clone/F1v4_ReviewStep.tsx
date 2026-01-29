/**
 * F1v4_ReviewStep - Review payroll totals and workers
 * 
 * Dense, glass-container layout matching Flow 6 v3 patterns
 * Simplified statuses for Fronted Admin (company admin already caught issues)
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
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { F1v4_WorkerReceiptDrawer, WorkerData } from "./F1v4_WorkerReceiptDrawer";
import { F1v4_PeriodDropdown, PayrollPeriod } from "./F1v4_PeriodDropdown";

interface F1v4_ReviewStepProps {
  company: CompanyPayrollData;
  onContinue: () => void;
}

// Simplified mock workers - most are ready since company admin resolved issues
const MOCK_WORKERS: WorkerData[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000 },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500 },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "ready", netPay: 280000 },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "pending", netPay: 65000 },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200 },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "flagged", netPay: 72000 },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800 },
];

const MOCK_PERIODS: PayrollPeriod[] = [
  { id: "current", label: "January 2026", status: "current" },
  { id: "dec-2025", label: "December 2025", status: "paid" },
  { id: "nov-2025", label: "November 2025", status: "paid" },
];

// Simplified status config for Fronted Admin
const statusConfig: Record<WorkerData["status"], { label: string; icon: React.ElementType; className: string }> = {
  ready: { label: "Ready", icon: CheckCircle2, className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  pending: { label: "Pending", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  flagged: { label: "Flagged", icon: Clock, className: "bg-destructive/10 text-destructive border-destructive/20" },
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
  const [selectedPeriodId, setSelectedPeriodId] = useState("current");

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");
  const readyWorkers = workers.filter(w => w.status === "ready");
  const pendingWorkers = workers.filter(w => w.status !== "ready");
  
  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (worker: WorkerData) => {
    const idx = workers.findIndex(w => w.id === worker.id);
    setSelectedWorkerIndex(idx >= 0 ? idx : 0);
    setDrawerOpen(true);
  };

  const isViewingPrevious = selectedPeriodId !== "current";

  return (
    <div className="space-y-5">
      {/* Summary Card with Period Header and KPIs */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="py-4 px-5 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <F1v4_PeriodDropdown 
                periods={MOCK_PERIODS}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={setSelectedPeriodId}
              />
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                <Clock className="h-3 w-3 mr-1" />
                In review
              </Badge>
            </div>
            {!isViewingPrevious && (
              <Button onClick={onContinue} size="sm">
                Continue to Exceptions
              </Button>
            )}
          </div>
        </CardHeader>
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
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
              <TabsList className="h-8 bg-muted/30 p-0.5">
                <TabsTrigger value="all" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  All ({workers.length})
                </TabsTrigger>
                <TabsTrigger value="ready" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  Ready ({readyWorkers.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs h-7 px-3 data-[state=active]:bg-background">
                  Pending ({pendingWorkers.length})
                </TabsTrigger>
              </TabsList>
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-8 h-8 text-xs bg-background/50 border-border/30" 
                />
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4 space-y-1.5">
              {["all", "ready", "pending"].map((tabValue) => {
                const tabWorkers = tabValue === "all" 
                  ? filteredWorkers 
                  : tabValue === "ready" 
                    ? readyWorkers.filter(w => filteredWorkers.includes(w)) 
                    : pendingWorkers.filter(w => filteredWorkers.includes(w));

                return (
                  <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-1.5">
                    {tabWorkers.map((worker) => {
                      const config = statusConfig[worker.status];
                      const StatusIcon = config.icon;
                      const TypeIcon = worker.type === "employee" ? Users : Briefcase;

                      return (
                        <div 
                          key={worker.id} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleViewDetails(worker)}
                        >
                          {/* Avatar */}
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                              {getInitials(worker.name)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Worker Info */}
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

                          {/* Right side: Amount + Status */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <p className="text-sm font-semibold text-foreground tabular-nums">
                              {formatCurrency(worker.netPay, worker.currency)}
                            </p>
                            <div className={cn("flex items-center gap-1 text-xs", config.className.includes("text-") ? config.className.split(" ").find(c => c.startsWith("text-")) : "")}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{config.label}</span>
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

      {/* Worker Receipt Drawer - Reuses Flow 6 v3 patterns */}
      <F1v4_WorkerReceiptDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        worker={workers[selectedWorkerIndex] || null}
        workers={workers}
        currentIndex={selectedWorkerIndex}
        onNavigate={setSelectedWorkerIndex}
      />
    </div>
  );
};

export default F1v4_ReviewStep;
