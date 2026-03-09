/**
 * F1v7 Table View — Sortable flat table of all workers across statuses
 * ISOLATED: Only used in Flow 1 v7 (Future)
 */
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Send, FileEdit, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  status: string;
  employmentType?: "contractor" | "employee";
  companyId?: string;
  companyName?: string;
  checklistProgress?: number;
  workerStatus?: string;
  needsDocumentVerification?: boolean;
  documentsVerified?: boolean;
}

interface TableViewProps {
  contractors: Contractor[];
  onWorkerClick?: (contractor: Contractor) => void;
  selectedIds?: Set<string>;
  onSelectContractor?: (id: string, checked: boolean) => void;
  onBulkAction?: (status: string) => void;
}

type SortKey = "name" | "status" | "country" | "role" | "salary" | "company" | "type";
type SortDir = "asc" | "desc";

const statusLabels: Record<string, string> = {
  "offer-accepted": "Offer Accepted",
  "data-pending": "Collect Details",
  "drafting": "Prepare Contract",
  "awaiting-signature": "Awaiting Signature",
  "trigger-onboarding": "Onboard",
  "onboarding-pending": "In Progress",
  "CERTIFIED": "Done",
  "PAYROLL_PENDING": "Payroll Pending",
  "IN_BATCH": "In Batch",
  "EXECUTING": "Executing",
  "PAID": "Paid",
  "ON_HOLD": "On Hold",
};

const statusDotColors: Record<string, string> = {
  "offer-accepted": "bg-gray-400",
  "data-pending": "bg-amber-400",
  "drafting": "bg-teal-400",
  "awaiting-signature": "bg-sky-400",
  "trigger-onboarding": "bg-indigo-400",
  "onboarding-pending": "bg-violet-400",
  "CERTIFIED": "bg-emerald-400",
  "PAYROLL_PENDING": "bg-gray-400",
  "IN_BATCH": "bg-teal-400",
  "EXECUTING": "bg-sky-400",
  "PAID": "bg-emerald-500",
  "ON_HOLD": "bg-red-400",
};

/** Statuses that support checkbox selection */
const SELECTABLE_STATUSES = ["offer-accepted", "drafting", "trigger-onboarding"];

const COMPANY_CHIP_VARIANTS = [
  "v7-company-chip--a",
  "v7-company-chip--b",
  "v7-company-chip--c",
  "v7-company-chip--d",
  "v7-company-chip--e",
] as const;

const getCompanyChipVariant = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COMPANY_CHIP_VARIANTS[hash % COMPANY_CHIP_VARIANTS.length];
};

const tableColumns: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "Worker", className: "min-w-[160px] flex-[2]" },
  { key: "company", label: "Client", className: "min-w-[90px] flex-1 hidden md:flex" },
  { key: "status", label: "Status", className: "min-w-[110px] flex-1" },
  { key: "role", label: "Role", className: "min-w-[100px] flex-1 hidden lg:flex" },
  { key: "salary", label: "Salary", className: "min-w-[90px] flex-1 text-right" },
  { key: "country", label: "Country", className: "min-w-[80px] flex-1 hidden sm:flex" },
  { key: "type", label: "Type", className: "min-w-[50px] flex-[0.5] hidden xl:flex" },
];

const bulkActionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  "offer-accepted": { label: "Send Forms", icon: <Send className="h-3 w-3 mr-1" /> },
  "drafting": { label: "Draft Contracts", icon: <FileEdit className="h-3 w-3 mr-1" /> },
  "trigger-onboarding": { label: "Start All", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
};

export const F1v7_TableView: React.FC<TableViewProps> = ({
  contractors,
  onWorkerClick,
  selectedIds = new Set(),
  onSelectContractor,
  onBulkAction,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...contractors];
    const statusOrder = ["offer-accepted", "data-pending", "drafting", "awaiting-signature", "trigger-onboarding", "onboarding-pending", "CERTIFIED", "PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID", "ON_HOLD"];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "status": cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status); break;
        case "country": cmp = a.country.localeCompare(b.country); break;
        case "role": cmp = a.role.localeCompare(b.role); break;
        case "salary": {
          const aNum = parseFloat(a.salary.replace(/[^0-9.]/g, "")) || 0;
          const bNum = parseFloat(b.salary.replace(/[^0-9.]/g, "")) || 0;
          cmp = aNum - bNum;
          break;
        }
        case "company": cmp = (a.companyName || "").localeCompare(b.companyName || ""); break;
        case "type": cmp = (a.employmentType || "").localeCompare(b.employmentType || ""); break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [contractors, sortKey, sortDir]);

  const isSelectable = (status: string) => SELECTABLE_STATUSES.includes(status);

  // Compute bulk action info for the floating bar
  const selectedByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    contractors.forEach(c => {
      if (selectedIds.has(c.id) && isSelectable(c.status)) {
        map[c.status] = (map[c.status] || 0) + 1;
      }
    });
    return map;
  }, [contractors, selectedIds]);

  const totalSelected = Object.values(selectedByStatus).reduce((a, b) => a + b, 0);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="v7-table-container relative"
    >
       {/* Header */}
       <div className="v7-table-header">
         {tableColumns.map(col => (
          <button
            key={col.key}
            className={cn("v7-table-header-cell", col.className)}
            onClick={() => handleSort(col.key)}
          >
            <span>{col.label}</span>
            <SortIcon col={col.key} />
          </button>
        ))}
        <div className="w-8 shrink-0" />
      </div>

      {/* Rows */}
      <div className="v7-table-body">
        {sorted.map((contractor, idx) => {
          const selectable = isSelectable(contractor.status);
          const isSelected = selectedIds.has(contractor.id);

          return (
            <motion.div
              key={contractor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.015 }}
              className={cn(
                "v7-table-row group/trow",
                contractor.workerStatus && contractor.workerStatus !== "active" && "opacity-60"
              )}
              onClick={() => onWorkerClick?.(contractor)}
            >
              {/* Worker — checkbox slides in on hover for selectable rows */}
              <div className={cn("flex items-center gap-2", tableColumns[0].className)}>
                {selectable && onSelectContractor ? (
                  <div className={cn(
                    "shrink-0 flex items-center justify-center overflow-hidden transition-all duration-200 ease-out",
                    isSelected
                      ? "w-5 opacity-100"
                      : "w-0 opacity-0 group-hover/trow:w-5 group-hover/trow:opacity-100"
                  )}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        onSelectContractor(contractor.id, checked as boolean)
                      }
                      className="h-3.5 w-3.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : null}
                <span className="text-sm leading-none">{contractor.countryFlag}</span>
                <span className="text-[13px] font-medium text-foreground truncate">
                  {contractor.name}
                </span>
              </div>

              {/* Client */}
              <div className={cn("flex items-center", tableColumns[1].className)}>
                {contractor.companyName ? (
                  <span className={cn(
                    "v7-company-chip",
                    getCompanyChipVariant(contractor.companyId || contractor.companyName),
                  )}>
                    {contractor.companyName}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">—</span>
                )}
              </div>

              {/* Status */}
              <div className={cn("flex items-center gap-1.5", tableColumns[2].className)}>
                <div className={cn("h-2 w-2 rounded-full shrink-0", statusDotColors[contractor.status] || "bg-gray-400")} />
                <span className="text-[11px] text-foreground truncate">
                  {contractor.workerStatus === "contract-ended" ? "Ended"
                    : contractor.workerStatus === "resigned" ? "Resigned"
                    : contractor.workerStatus === "terminated" ? "Terminated"
                    : contractor.needsDocumentVerification && !contractor.documentsVerified ? "Inactive"
                    : statusLabels[contractor.status] || contractor.status}
                </span>
                {contractor.status === "onboarding-pending" && typeof contractor.checklistProgress === "number" && (
                  <div className="flex items-center gap-1 ml-1">
                    <Progress value={contractor.checklistProgress} className="h-1 w-10" />
                    <span className="text-[9px] tabular-nums text-muted-foreground">{contractor.checklistProgress}%</span>
                  </div>
                )}
              </div>

              {/* Role */}
              <div className={cn("flex items-center", tableColumns[3].className)}>
                <span className="text-[11px] text-muted-foreground truncate">{contractor.role}</span>
              </div>

              {/* Salary */}
              <div className={cn("flex items-center justify-end", tableColumns[4].className)}>
                <span className="text-[11px] font-medium text-foreground tabular-nums">{contractor.salary}</span>
              </div>

              {/* Country */}
              <div className={cn("flex items-center", tableColumns[5].className)}>
                <span className="text-[11px] text-muted-foreground">{contractor.country}</span>
              </div>

              {/* Type */}
              <div className={cn("flex items-center", tableColumns[6].className)}>
                <span className="text-[10px] text-muted-foreground">
                  {contractor.employmentType === "contractor" ? "COR" : "EOR"}
                </span>
              </div>

              {/* Action */}
              <div className="w-8 shrink-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/trow:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWorkerClick?.(contractor);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="v7-table-footer">
        <span className="text-[11px] text-muted-foreground">
          {contractors.length} worker{contractors.length !== 1 ? "s" : ""} total
        </span>
        {/* Floating bulk action bar */}
        {totalSelected > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{totalSelected} selected</span>
            {Object.entries(selectedByStatus).map(([status, count]) => {
              const cfg = bulkActionLabels[status];
              if (!cfg) return null;
              return (
                <Button
                  key={status}
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBulkAction?.(status);
                  }}
                >
                  {cfg.icon}
                  {cfg.label} ({count})
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
