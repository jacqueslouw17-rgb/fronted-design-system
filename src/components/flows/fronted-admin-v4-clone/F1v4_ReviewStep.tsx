/**
 * F1v4_ReviewStep - Review payroll totals and workers
 * 
 * Shows KPI cards, FX summary, and worker list without horizontal scroll
 */

import React, { useState } from "react";
import { 
  Users, 
  Briefcase, 
  Globe, 
  ChevronRight,
  Search,
  Eye,
  Download,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";
import { toast } from "sonner";

interface F1v4_ReviewStepProps {
  company: CompanyPayrollData;
  onContinue: () => void;
}

interface Worker {
  id: string;
  name: string;
  type: "employee" | "contractor";
  country: string;
  currency: string;
  status: "ready" | "auto-generated" | "missing-submission" | "needs-attention";
  netPay: number;
  issues: number;
}

const MOCK_WORKERS: Worker[] = [
  { id: "1", name: "Marcus Chen", type: "contractor", country: "Singapore", currency: "SGD", status: "ready", netPay: 12000, issues: 0 },
  { id: "2", name: "Sofia Rodriguez", type: "contractor", country: "Spain", currency: "EUR", status: "ready", netPay: 6500, issues: 0 },
  { id: "3", name: "Maria Santos", type: "employee", country: "Philippines", currency: "PHP", status: "auto-generated", netPay: 280000, issues: 0 },
  { id: "4", name: "Alex Hansen", type: "employee", country: "Norway", currency: "NOK", status: "missing-submission", netPay: 65000, issues: 1 },
  { id: "5", name: "David Martinez", type: "contractor", country: "Portugal", currency: "EUR", status: "ready", netPay: 4200, issues: 0 },
  { id: "6", name: "Emma Wilson", type: "contractor", country: "Norway", currency: "NOK", status: "needs-attention", netPay: 72000, issues: 2 },
  { id: "7", name: "Jonas Schmidt", type: "employee", country: "Germany", currency: "EUR", status: "ready", netPay: 5800, issues: 0 },
];

const statusConfig: Record<Worker["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20" },
  "auto-generated": { label: "Auto-generated", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  "missing-submission": { label: "Missing submission", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  "needs-attention": { label: "Needs attention", className: "bg-destructive/10 text-destructive border-destructive/20" },
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
  const [workers] = useState<Worker[]>(MOCK_WORKERS);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const formatTotalCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviewPayslips = () => {
    toast.success("Draft payslip pack downloaded");
  };

  const handleExportCSV = () => {
    toast.success("Payroll data exported");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <p className="text-[11px] text-muted-foreground mb-1">Gross Pay</p>
          <p className="text-xl font-semibold text-foreground">$124.8K</p>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <p className="text-[11px] text-muted-foreground mb-1">Net Pay</p>
          <p className="text-xl font-semibold text-foreground">$98.5K</p>
        </div>
        <div className="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <p className="text-[11px] text-muted-foreground mb-1">Fronted Fees (Est.)</p>
          <p className="text-xl font-semibold text-foreground">$3.7K</p>
        </div>
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
          <p className="text-[11px] text-primary/70 mb-1">Total Cost</p>
          <p className="text-xl font-semibold text-primary">{formatTotalCurrency(company.totalCost)}</p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{employees.length}</span> employees
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{contractors.length}</span> contractors
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{company.currencyCount}</span> currencies
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviewPayslips} className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" />
            Preview Payslips
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Worker Table */}
      <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Workers</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name or country..."
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
          </TabsList>

          {["all", "employees", "contractors"].map((tabValue) => {
            const tabWorkers = tabValue === "all" 
              ? filteredWorkers 
              : tabValue === "employees" 
                ? employees.filter(w => filteredWorkers.includes(w))
                : contractors.filter(w => filteredWorkers.includes(w));

            return (
              <TabsContent key={tabValue} value={tabValue} className="mt-0 space-y-2">
                {tabWorkers.map((worker) => {
                  const config = statusConfig[worker.status];
                  const TypeIcon = worker.type === "employee" ? Users : Briefcase;

                  return (
                    <div 
                      key={worker.id}
                      className="p-3.5 rounded-lg border border-border/60 bg-card/80 hover:bg-muted/30 transition-colors cursor-pointer"
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
                              <span className="text-muted-foreground/40">•</span>
                              {worker.currency}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-medium", config.className)}>
                            {config.label}
                          </Badge>

                          {worker.issues > 0 && (
                            <span className="text-[10px] text-destructive font-medium">
                              {worker.issues} issue{worker.issues > 1 ? "s" : ""}
                            </span>
                          )}

                          <p className="text-sm font-medium text-foreground min-w-[100px] text-right tabular-nums">
                            {formatCurrency(worker.netPay, worker.currency)}
                          </p>

                          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                            View details
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

      {/* Continue Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Submit before <span className="font-medium text-foreground">Jan 25, 2026</span> — 5 days remaining
        </p>
        <Button onClick={onContinue} size="sm" className="gap-1.5">
          Continue to Exceptions
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default F1v4_ReviewStep;
