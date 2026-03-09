/**
 * F1v7 List View — Condensed single-line rows grouped by status
 * ISOLATED: Only used in Flow 1 v7 (Future)
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Eye, ChevronRight, Send, FileEdit, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  companyColor?: string;
  checklistProgress?: number;
  workerStatus?: string;
  needsDocumentVerification?: boolean;
  documentsVerified?: boolean;
}

interface ListViewProps {
  contractors: Contractor[];
  onWorkerClick?: (contractor: Contractor) => void;
  selectedIds?: Set<string>;
  onSelectContractor?: (id: string, checked: boolean) => void;
  onBulkAction?: (status: string) => void;
}

const statusOrder = [
  "offer-accepted",
  "data-pending",
  "drafting",
  "awaiting-signature",
  "trigger-onboarding",
  "onboarding-pending",
  "CERTIFIED",
];

const statusLabels: Record<string, string> = {
  "offer-accepted": "Offer Accepted",
  "data-pending": "Collect Details",
  "drafting": "Prepare Contract",
  "awaiting-signature": "Waiting for Signature",
  "trigger-onboarding": "Onboard Candidate",
  "onboarding-pending": "Track Progress",
  "CERTIFIED": "Done",
};

const statusColors: Record<string, string> = {
  "offer-accepted": "bg-muted/60 text-muted-foreground",
  "data-pending": "bg-amber-100/60 text-amber-800 border-amber-200/40",
  "drafting": "bg-teal-100/60 text-teal-800 border-teal-200/40",
  "awaiting-signature": "bg-sky-100/60 text-sky-800 border-sky-200/40",
  "trigger-onboarding": "bg-indigo-100/60 text-indigo-800 border-indigo-200/40",
  "onboarding-pending": "bg-violet-100/60 text-violet-800 border-violet-200/40",
  "CERTIFIED": "bg-emerald-100/60 text-emerald-800 border-emerald-200/40",
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

const bulkActionConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  "offer-accepted": { label: "Send Forms", icon: <Send className="h-3 w-3 mr-1" /> },
  "drafting": { label: "Draft Contracts", icon: <FileEdit className="h-3 w-3 mr-1" /> },
  "trigger-onboarding": { label: "Start All", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
};

export const F1v7_ListView: React.FC<ListViewProps> = ({
  contractors,
  onWorkerClick,
  selectedIds = new Set(),
  onSelectContractor,
  onBulkAction,
}) => {
  const grouped = statusOrder.map(status => ({
    status,
    label: statusLabels[status] || status,
    items: contractors.filter(c => {
      if (status === "CERTIFIED") {
        return c.status === "CERTIFIED" || ["PAYROLL_PENDING", "IN_BATCH", "EXECUTING", "PAID", "ON_HOLD"].includes(c.status);
      }
      return c.status === status;
    }),
  })).filter(g => g.items.length > 0);

  const isSelectable = (status: string) => SELECTABLE_STATUSES.includes(status);

  const getSelectedCountForStatus = (status: string, items: Contractor[]) =>
    items.filter(c => selectedIds.has(c.id)).length;

  const areAllSelected = (items: Contractor[]) =>
    items.length > 0 && items.every(c => selectedIds.has(c.id));

  const handleSelectAll = (items: Contractor[], checked: boolean) => {
    items.forEach(c => onSelectContractor?.(c.id, checked));
  };

  return (
    <div className="space-y-1">
      {grouped.map((group, groupIdx) => {
        const selectable = isSelectable(group.status);
        const selectedCount = getSelectedCountForStatus(group.status, group.items);
        const allSelected = areAllSelected(group.items);
        const bulkCfg = bulkActionConfig[group.status];

        return (
          <Collapsible key={group.status} defaultOpen>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIdx * 0.05 }}
              className="v7-list-group-header"
            >
              <CollapsibleTrigger className="group flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
              </CollapsibleTrigger>
              {/* Select-all checkbox — outside CollapsibleTrigger to avoid button-in-button */}
              {selectable && onSelectContractor && group.items.length > 0 && (
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(group.items, checked as boolean)}
                  className="h-3.5 w-3.5 ml-1"
                />
              )}
              <span className="v7-list-count-badge">{group.items.length}</span>
              {/* Selected count + bulk action */}
              {selectable && selectedCount > 0 && bulkCfg && (
                <Button
                  size="sm"
                  className="h-5 text-[10px] px-2 ml-1"
                  onClick={() => onBulkAction?.(group.status)}
                >
                  {bulkCfg.icon}
                  {bulkCfg.label} ({selectedCount})
                </Button>
              )}
              <div className="h-px flex-1 bg-border/30 ml-2" />
            </motion.div>
            <CollapsibleContent>
              <div className="v7-list-rows">
                <AnimatePresence>
                  {group.items.map((contractor, idx) => (
                    <motion.div
                      key={contractor.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className={cn(
                        "v7-list-row",
                        contractor.workerStatus && contractor.workerStatus !== "active" && "opacity-60"
                      )}
                      onClick={() => onWorkerClick?.(contractor)}
                    >
                      {/* Checkbox — visible on hover for selectable statuses */}
                      {selectable && onSelectContractor ? (
                        <div className={cn(
                          "shrink-0 transition-all duration-150",
                          selectedIds.has(contractor.id)
                            ? "w-5 opacity-100"
                            : "w-0 opacity-0 group-hover/row:w-5 group-hover/row:opacity-100"
                        )}>
                          <Checkbox
                            checked={selectedIds.has(contractor.id)}
                            onCheckedChange={(checked) =>
                              onSelectContractor(contractor.id, checked as boolean)
                            }
                            className="h-3.5 w-3.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : null}

                      {/* Name + Flag */}
                      <div className="flex items-center gap-2 min-w-[160px] flex-1">
                        <span className="text-sm leading-none">{contractor.countryFlag}</span>
                        <span className="text-[13px] font-medium text-foreground truncate">
                          {contractor.name}
                        </span>
                      </div>

                      {/* Company chip */}
                      {contractor.companyName && (
                        <span className={cn(
                          "v7-company-chip shrink-0",
                          getCompanyChipVariant(contractor.companyId || contractor.companyName),
                        )}>
                          {contractor.companyName}
                        </span>
                      )}

                      {/* Role */}
                      <span className="text-[11px] text-muted-foreground truncate hidden md:block min-w-[100px] max-w-[160px]">
                        {contractor.role}
                      </span>

                      {/* Salary */}
                      <span className="text-[11px] font-medium text-foreground tabular-nums shrink-0 hidden sm:block min-w-[80px] text-right">
                        {contractor.salary}
                      </span>

                      {/* Type */}
                      <span className="text-[10px] text-muted-foreground shrink-0 hidden lg:block min-w-[65px]">
                        {contractor.employmentType === "contractor" ? "COR" : "EOR"}
                      </span>

                      {/* Progress or Status */}
                      <div className="shrink-0 min-w-[90px] flex items-center justify-end">
                        {contractor.status === "onboarding-pending" && typeof contractor.checklistProgress === "number" ? (
                          <div className="flex items-center gap-2 w-[90px]">
                            <Progress value={contractor.checklistProgress} className="h-1.5 flex-1" />
                            <span className="text-[10px] tabular-nums text-muted-foreground w-[28px] text-right">
                              {contractor.checklistProgress}%
                            </span>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] px-2 py-0 h-[18px] font-medium border",
                              statusColors[contractor.status] || "bg-muted text-muted-foreground"
                            )}
                          >
                            {contractor.workerStatus === "contract-ended" ? "Ended"
                              : contractor.workerStatus === "resigned" ? "Resigned"
                              : contractor.workerStatus === "terminated" ? "Terminated"
                              : contractor.needsDocumentVerification && !contractor.documentsVerified ? "Inactive"
                              : statusLabels[contractor.status]?.split(" ")[0] || contractor.status}
                          </Badge>
                        )}
                      </div>

                      {/* Action hint */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWorkerClick?.(contractor);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
