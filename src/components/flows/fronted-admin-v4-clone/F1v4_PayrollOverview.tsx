/**
 * F1v4_PayrollOverview - Bird's-eye multi-company payroll triage cockpit
 * 
 * Shows all companies at a glance with status, blocking issues, and quick actions
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Building2, 
  Users, 
  Briefcase, 
  Globe, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompanyPayrollData } from "./F1v4_PayrollTab";

type FilterType = "all" | "blocked" | "needs-review" | "ready" | "approved" | "reconcile";

interface F1v4_PayrollOverviewProps {
  companies: CompanyPayrollData[];
  onSelectCompany: (companyId: string) => void;
}

const statusConfig: Record<CompanyPayrollData["status"], { 
  label: string; 
  className: string; 
  icon: React.ElementType;
  ctaLabel: string;
}> = {
  blocked: { 
    label: "Blocked", 
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertCircle,
    ctaLabel: "Resolve exceptions"
  },
  "needs-review": { 
    label: "Needs Review", 
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
    ctaLabel: "Review payroll"
  },
  ready: { 
    label: "Ready", 
    className: "bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20",
    icon: CheckCircle2,
    ctaLabel: "Approve numbers"
  },
  approved: { 
    label: "Approved", 
    className: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle2,
    ctaLabel: "Reconcile status"
  },
  reconcile: { 
    label: "In Reconcile", 
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Clock,
    ctaLabel: "View status"
  },
};

const filterTabs: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "blocked", label: "Blocked" },
  { id: "needs-review", label: "Needs Review" },
  { id: "ready", label: "Ready" },
  { id: "approved", label: "Approved" },
  { id: "reconcile", label: "Reconcile" },
];

// Country flag mapping
const countryFlags: Record<string, string> = {
  SG: "🇸🇬", ES: "🇪🇸", PH: "🇵🇭", US: "🇺🇸", UK: "🇬🇧", 
  DE: "🇩🇪", FR: "🇫🇷", NL: "🇳🇱", BE: "🇧🇪", NO: "🇳🇴", 
  SE: "🇸🇪", JP: "🇯🇵", AU: "🇦🇺", NZ: "🇳🇿", PT: "🇵🇹",
  IT: "🇮🇹", CA: "🇨🇦", MX: "🇲🇽", BR: "🇧🇷", IN: "🇮🇳"
};

export const F1v4_PayrollOverview: React.FC<F1v4_PayrollOverviewProps> = ({
  companies,
  onSelectCompany,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || company.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Count companies by status for filter badges
  const statusCounts = companies.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto p-8 pb-32 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Payroll Overview</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve payroll runs across all companies
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground mb-1">Total Companies</p>
          <p className="text-2xl font-semibold text-foreground">{companies.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <p className="text-xs text-destructive/70 mb-1">Blocked</p>
          <p className="text-2xl font-semibold text-destructive">{statusCounts.blocked || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-600/70 mb-1">Needs Review</p>
          <p className="text-2xl font-semibold text-amber-600">{statusCounts["needs-review"] || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-accent-green-outline/20 bg-accent-green-fill/5">
          <p className="text-xs text-accent-green-text/70 mb-1">Ready to Approve</p>
          <p className="text-2xl font-semibold text-accent-green-text">{statusCounts.ready || 0}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/50"
          />
        </div>
        
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeFilter === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.id !== "all" && statusCounts[tab.id] ? (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({statusCounts[tab.id]})
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-3">
        {filteredCompanies.map((company, index) => {
          const config = statusConfig[company.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative rounded-xl border bg-card/50 backdrop-blur-sm",
                "hover:bg-card/80 hover:shadow-md transition-all duration-200",
                company.status === "blocked" 
                  ? "border-destructive/30" 
                  : "border-border/40"
              )}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  {/* Left: Company Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Company Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>

                    {/* Company Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {company.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[9px] px-1.5 py-0 h-4 font-medium", config.className)}
                        >
                          {config.label}
                        </Badge>
                        {company.blockingExceptions > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {company.blockingExceptions} blocking
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{company.payPeriod}</p>
                    </div>
                  </div>

                  {/* Center: Metadata Chips */}
                  <div className="flex items-center gap-5 px-6">
                    {/* Countries */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1">
                        {company.countries.slice(0, 3).map(code => (
                          <span key={code} className="text-sm">{countryFlags[code] || code}</span>
                        ))}
                        {company.countries.length > 3 && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            +{company.countries.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Workers */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.employeeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {company.contractorCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {company.currencyCount}
                      </span>
                    </div>

                    {/* Total Cost */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(company.totalCost)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">total cost</p>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <Button
                    variant={company.status === "blocked" ? "destructive" : "default"}
                    size="sm"
                    onClick={() => onSelectCompany(company.id)}
                    className="gap-1.5 ml-4"
                  >
                    {config.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Last Activity */}
                {company.lastActivity && (
                  <p className="text-[10px] text-muted-foreground/60 mt-3 pl-14">
                    Last activity: {company.lastActivity}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No companies match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default F1v4_PayrollOverview;
