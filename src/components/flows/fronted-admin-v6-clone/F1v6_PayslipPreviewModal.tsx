/**
 * F1v4_PayslipPreviewModal - Premium payslip preview modal
 * 
 * Shows worker payslip with summary totals, line items, and download option
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Download, ChevronDown, Building2, User } from "lucide-react";
import { toast } from "sonner";
import type { WorkerData } from "./F1v5_WorkerDetailDrawer";

interface F1v4_PayslipPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerData | null;
}

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹"
};

export const F1v4_PayslipPreviewModal: React.FC<F1v4_PayslipPreviewModalProps> = ({
  open,
  onOpenChange,
  worker,
}) => {
  const [employerOpen, setEmployerOpen] = React.useState(false);
  const [workerInfoOpen, setWorkerInfoOpen] = React.useState(false);

  if (!worker) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  // Mock payslip data
  const grossPay = worker.grossPay || worker.netPay * 1.25;
  const baseSalary = worker.baseSalary || worker.netPay * 1.2;
  
  const earnings = [
    { label: "Base Salary", amount: baseSalary },
    { label: "Housing Allowance", amount: grossPay * 0.1 },
    { label: "Transport Allowance", amount: grossPay * 0.05 },
  ];

  const deductions = worker.type === "employee" ? [
    { label: "Income Tax", amount: grossPay * 0.15 },
    { label: "Social Security", amount: grossPay * 0.05 },
    { label: "Health Insurance", amount: grossPay * 0.03 },
  ] : [];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  const handleDownload = () => {
    toast.success("Payslip PDF downloaded");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border/40 bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mb-2 bg-primary/10 text-primary border-primary/20">
                Payslip
              </Badge>
              <DialogTitle className="text-lg font-semibold text-foreground">
                January 2026
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pay period: Jan 1 - Jan 31, 2026
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Worker Info */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/50">
            <div>
              <p className="text-sm font-medium text-foreground">{worker.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span>{countryFlags[worker.country] || ""}</span>
                {worker.country}
                <span className="text-muted-foreground/40">•</span>
                {worker.type === "employee" ? "Employee" : "Contractor"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {formatCurrency(netPay, worker.currency)}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Net Pay</p>
            </div>
          </div>

          {/* Summary Totals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/40 bg-card/30 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Gross</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(totalEarnings, worker.currency)}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Deductions</p>
              <p className="text-sm font-semibold tabular-nums text-destructive">-{formatCurrency(totalDeductions, worker.currency)}</p>
            </div>
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center">
              <p className="text-[10px] text-primary/70 mb-0.5">Net Pay</p>
              <p className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(netPay, worker.currency)}</p>
            </div>
          </div>

          {/* Line Items - Earnings */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Earnings
            </h4>
            <div className="rounded-xl border border-border/40 bg-card/50 divide-y divide-border/40">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium tabular-nums">{formatCurrency(item.amount, worker.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2.5 bg-muted/20">
                <span className="text-sm font-medium">Total Earnings</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(totalEarnings, worker.currency)}</span>
              </div>
            </div>
          </div>

          {/* Line Items - Deductions */}
          {deductions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Deductions
              </h4>
              <div className="rounded-xl border border-border/40 bg-card/50 divide-y divide-border/40">
                {deductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium tabular-nums text-destructive">-{formatCurrency(item.amount, worker.currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-2.5 bg-muted/20">
                  <span className="text-sm font-medium">Total Deductions</span>
                  <span className="text-sm font-semibold tabular-nums text-destructive">-{formatCurrency(totalDeductions, worker.currency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Sections */}
          <div className="space-y-2">
            {/* Employer Info */}
            <Collapsible open={employerOpen} onOpenChange={setEmployerOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border border-border/40 bg-card/30 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Employer Information</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  employerOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 text-xs text-muted-foreground space-y-1 mt-1">
                <p><span className="font-medium text-foreground">Company:</span> Acme Global Inc.</p>
                <p><span className="font-medium text-foreground">Address:</span> 123 Business Park, London, UK</p>
                <p><span className="font-medium text-foreground">Tax ID:</span> GB123456789</p>
              </CollapsibleContent>
            </Collapsible>

            {/* Worker Info */}
            <Collapsible open={workerInfoOpen} onOpenChange={setWorkerInfoOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border border-border/40 bg-card/30 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Worker Information</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  workerInfoOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 text-xs text-muted-foreground space-y-1 mt-1">
                <p><span className="font-medium text-foreground">Name:</span> {worker.name}</p>
                <p><span className="font-medium text-foreground">ID:</span> EMP-{worker.id.padStart(4, "0")}</p>
                <p><span className="font-medium text-foreground">Department:</span> Engineering</p>
                <p><span className="font-medium text-foreground">Bank:</span> ****4521</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Generated on Jan 20, 2026 • Ref: PS-2026-01-{worker.id}
          </p>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default F1v4_PayslipPreviewModal;
