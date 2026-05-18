/**
 * F1v4_HistoricalTrackingView - Read-only tracking view for historical payroll periods
 * 
 * Workers are clickable to open detail drawer with payslip/invoice download.
 * Includes All/Employees/Contractors filter tabs and search.
 */

import React, { useState, useMemo } from "react";
import { convertToEUR } from "@/components/flows/shared/CurrencyToggle";
import { CheckCircle2, Download, Users, Briefcase, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { F1v4_WorkerDetailDrawer } from "./F1v7_WorkerDetailDrawer";
import type { WorkerData } from "./F1v7_WorkerDetailDrawer";
import { F1v4_PayslipPreviewModal } from "./F1v7_PayslipPreviewModal";

export interface HistoricalWorker {
  id: string;
  name: string;
  country: string;
  type: "employee" | "contractor";
  amount: number;
  currency: string;
  status: "paid" | "posted";
  providerRef: string;
  companyName?: string;
}

interface F1v4_HistoricalTrackingViewProps {
  workers: HistoricalWorker[];
  paidDate: string;
}

// Mock historical workers data
const HISTORICAL_WORKERS: HistoricalWorker[] = [
  { id: "1", name: "Marcus Chen", country: "Singapore", type: "contractor", amount: 12000, currency: "SGD", status: "paid", providerRef: "PAY-2025-112234", companyName: "Acme Corp" },
  { id: "2", name: "Sofia Rodriguez", country: "Spain", type: "contractor", amount: 6500, currency: "EUR", status: "paid", providerRef: "PAY-2025-112235", companyName: "Acme Corp" },
  { id: "3", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid", providerRef: "PAY-2025-112236", companyName: "Globex Inc" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112237", companyName: "Globex Inc" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112238", companyName: "Waystar Royco" },
  { id: "6", name: "David Martinez", country: "Portugal", type: "contractor", amount: 4200, currency: "EUR", status: "paid", providerRef: "PAY-2025-112139", companyName: "Initech Ltd" },
  { id: "7", name: "Jonas Schmidt", country: "Germany", type: "employee", amount: 5800, currency: "EUR", status: "paid", providerRef: "PAY-2025-112239", companyName: "Initech Ltd" },
];

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", USA: "🇺🇸",
  "United States": "🇺🇸", UK: "🇬🇧", "United Kingdom": "🇬🇧",
  Italy: "🇮🇹", Japan: "🇯🇵", India: "🇮🇳", Ireland: "🇮🇪",
  Netherlands: "🇳🇱", Sweden: "🇸🇪", Denmark: "🇩🇰", Brazil: "🇧🇷",
  Mexico: "🇲🇽", Egypt: "🇪🇬", Greece: "🇬🇷",
  SG: "🇸🇬", ES: "🇪🇸", PH: "🇵🇭", NO: "🇳🇴", PT: "🇵🇹", DE: "🇩🇪",
  FR: "🇫🇷", US: "🇺🇸", GB: "🇬🇧", IT: "🇮🇹", JP: "🇯🇵", IN: "🇮🇳",
  IE: "🇮🇪", NL: "🇳🇱", SE: "🇸🇪", DK: "🇩🇰", BR: "🇧🇷", MX: "🇲🇽",
  EG: "🇪🇬", GR: "🇬🇷",
};

/** Convert HistoricalWorker → WorkerData so the drawer can render it */
const toWorkerData = (hw: HistoricalWorker): WorkerData => ({
  id: hw.id,
  name: hw.name,
  country: hw.country,
  type: hw.type,
  currency: hw.currency,
  status: "ready",
  netPay: hw.amount,
  issues: 0,
  paymentStatus: "paid",
  providerRef: hw.providerRef,
});

type FilterTab = "all" | "employees" | "contractors";

export const F1v4_HistoricalTrackingView: React.FC<F1v4_HistoricalTrackingViewProps> = ({
  workers = HISTORICAL_WORKERS,
  paidDate,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState(0);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [payslipWorker, setPayslipWorker] = useState<WorkerData | null>(null);

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");

  const filteredWorkers = useMemo(() => {
    let filtered = workers;
    if (activeTab === "employees") filtered = employees;
    if (activeTab === "contractors") filtered = contractors;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.country.toLowerCase().includes(q) ||
        (w.companyName || "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [workers, activeTab, searchQuery, employees, contractors]);

  const drawerWorkers: WorkerData[] = filteredWorkers.map(toWorkerData);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleExportCSV = () => toast.success("CSV exported");

  const handleViewDetails = (index: number) => {
    setSelectedWorkerIndex(index);
    setDrawerOpen(true);
  };

  const handlePayslipPreview = (worker: WorkerData) => {
    setPayslipWorker(worker);
    setPayslipModalOpen(true);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: workers.length },
    { key: "employees", label: "Employees", count: employees.length },
    { key: "contractors", label: "Contractors", count: contractors.length },
  ];

  return (
    <>
      <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-4 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-7 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs + Search */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Worker List */}
        <CardContent className="p-4">
          <div className="max-h-[380px] overflow-y-auto space-y-1">
            {filteredWorkers.map((worker, index) => {
              const TypeIcon = worker.type === "employee" ? Users : Briefcase;

              return (
                <div 
                  key={worker.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-muted/30 border border-border/20 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewDetails(index)}
                >
                  {/* Avatar */}
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name + Country (two-line layout matching TrackStep) */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                      <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {worker.companyName && (
                        <span className="inline-flex items-center h-4 px-1.5 rounded text-[9px] font-medium bg-muted text-muted-foreground border border-border/40 shrink-0 truncate max-w-[100px]">
                          {worker.companyName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground leading-tight">{countryFlags[worker.country] || ""} {worker.country}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
                    {worker.currency !== "EUR" ? `≈ ${formatCurrency(Math.round(convertToEUR(worker.amount, worker.currency)), "EUR")}` : formatCurrency(worker.amount, "EUR")}
                  </p>

                  {/* Status Pill */}
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0",
                    "bg-accent-green/10 text-accent-green-text"
                  )}>
                    <CheckCircle2 className="h-3 w-3" />
                    Paid
                  </div>
                </div>
              );
            })}
            {filteredWorkers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No workers found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <F1v4_WorkerDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        worker={drawerWorkers[selectedWorkerIndex] || null}
        workers={drawerWorkers}
        currentIndex={selectedWorkerIndex}
        onNavigate={setSelectedWorkerIndex}
        onPayslipPreview={handlePayslipPreview}
        isTrackStep={true}
        isViewOnly={true}
      />

      <F1v4_PayslipPreviewModal
        open={payslipModalOpen}
        onOpenChange={setPayslipModalOpen}
        worker={payslipWorker}
      />
    </>
  );
};

export default F1v4_HistoricalTrackingView;
