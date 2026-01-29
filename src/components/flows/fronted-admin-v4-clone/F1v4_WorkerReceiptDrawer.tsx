/**
 * F1v4_WorkerReceiptDrawer - Reuses Flow 6 v3 drawer patterns exactly
 * 
 * Structure:
 * - Header: Avatar, name, "Add" pill, inline metadata
 * - Net pay hero with "View receipt →" link
 * - Collapsible sections (Earnings, Deductions, Adjustments)
 * - Receipt overlay slides in from right
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Download,
  Plus,
  X,
} from "lucide-react";
import { CollapsibleSection } from "@/components/flows/company-admin-v3/CA3_CollapsibleSection";

export interface WorkerData {
  id: string;
  name: string;
  type: "employee" | "contractor";
  country: string;
  currency: string;
  status: "ready" | "pending" | "flagged";
  netPay: number;
  grossPay?: number;
  baseSalary?: number;
  issues?: number;
}

interface AdminAddedAdjustment {
  id: string;
  type: "expense" | "bonus" | "overtime" | "deduction";
  description: string;
  amount: number;
}

interface F1v4_WorkerReceiptDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: WorkerData | null;
  workers: WorkerData[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Italy: "🇮🇹"
};

// Static breakdown row - matches Flow 6 v3 pattern
const BreakdownRow = ({ 
  label, 
  amount, 
  currency, 
  isPositive = true,
  isTotal = false,
}: { 
  label: string;
  amount: number;
  currency: string;
  isPositive?: boolean;
  isTotal?: boolean;
}) => {
  const formatAmount = (amt: number, curr: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[curr] || curr}${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-2",
      isTotal && "pt-3 mt-1 border-t border-dashed border-border/50"
    )}>
      <span className={cn(
        "truncate",
        isTotal ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"
      )}>
        {label}
      </span>
      <span className={cn(
        "whitespace-nowrap tabular-nums text-right font-mono shrink-0 ml-4",
        isTotal ? "text-sm font-semibold text-foreground" : "text-sm",
        isPositive ? "text-foreground" : "text-muted-foreground"
      )}>
        {isPositive ? '' : '−'}{formatAmount(amount, currency)}
      </span>
    </div>
  );
};

export const F1v4_WorkerReceiptDrawer: React.FC<F1v4_WorkerReceiptDrawerProps> = ({
  open,
  onOpenChange,
  worker,
  workers,
  currentIndex,
  onNavigate,
}) => {
  const [showReceiptView, setShowReceiptView] = useState(false);
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [adminAdjustments, setAdminAdjustments] = useState<AdminAddedAdjustment[]>([]);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  
  // New adjustment form state
  const [adjType, setAdjType] = useState<"expense" | "bonus" | "overtime" | "deduction">("expense");
  const [adjDescription, setAdjDescription] = useState("");
  const [adjAmount, setAdjAmount] = useState("");

  // Reset state when worker changes
  useEffect(() => {
    setShowReceiptView(false);
    setIsAddingAdjustment(false);
    setNewlyAddedId(null);
  }, [worker?.id]);

  // Clear highlight after delay
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  if (!worker) return null;

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Mock data for breakdown
  const grossPay = worker.grossPay || worker.netPay * 1.25;
  const baseSalary = worker.baseSalary || worker.netPay * 1.2;
  const deductions = worker.type === "employee" ? grossPay * 0.15 : 0;
  const fees = worker.type === "contractor" ? worker.netPay * 0.03 : 0;

  // Calculate admin adjustments total
  const adminAdditionsTotal = adminAdjustments
    .filter(a => a.type !== 'deduction')
    .reduce((sum, a) => sum + a.amount, 0);
  const adminDeductionsTotal = adminAdjustments
    .filter(a => a.type === 'deduction')
    .reduce((sum, a) => sum + a.amount, 0);

  const baseNet = worker.netPay;
  const adjustedNet = baseNet + adminAdditionsTotal - adminDeductionsTotal;
  const hasAdminAdjustments = adminAdjustments.length > 0;

  const handleAddAdjustment = () => {
    if (!adjDescription || !adjAmount) {
      toast.error("Please fill all fields");
      return;
    }
    const amount = parseFloat(adjAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    const newId = Date.now().toString();
    setAdminAdjustments(prev => [...prev, {
      id: newId,
      type: adjType,
      description: adjDescription,
      amount,
    }]);
    setNewlyAddedId(newId);
    setAdjDescription("");
    setAdjAmount("");
    setIsAddingAdjustment(false);
    toast.success("Adjustment added");
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdminAdjustments(prev => prev.filter(a => a.id !== id));
    toast.success("Adjustment removed");
  };

  // Mock earnings data
  const earnings = [
    { label: "Base Salary", amount: baseSalary },
    ...(worker.type === "contractor" ? [{ label: "Contract Fee", amount: grossPay - baseSalary }] : []),
  ];

  const deductionItems = worker.type === "employee" 
    ? [
        { label: "Income Tax", amount: deductions * 0.6 },
        { label: "Social Security", amount: deductions * 0.3 },
        { label: "Other Deductions", amount: deductions * 0.1 },
      ]
    : [{ label: "Fronted Fees", amount: fees }];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = deductionItems.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] overflow-y-auto p-0"
        hideClose={isAddingAdjustment}
      >
        {/* Add Adjustment Takeover */}
        {isAddingAdjustment ? (
          <div className="flex flex-col h-full">
            <div className="px-5 pt-5 pb-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddingAdjustment(false)}
                  className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">Add Adjustment</h2>
                  <p className="text-xs text-muted-foreground">
                    For {worker.name} · {worker.currency}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 px-5 py-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
                <Select value={adjType} onValueChange={(v) => setAdjType(v as typeof adjType)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense Reimbursement</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="overtime">Overtime</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
                <Input
                  value={adjDescription}
                  onChange={(e) => setAdjDescription(e.target.value)}
                  placeholder="e.g., Q4 Performance Bonus"
                  className="h-10"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Amount ({worker.currency})</label>
                <Input
                  type="number"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="border-t border-border/30 px-5 py-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingAdjustment(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAdjustment}
                  className="flex-1"
                >
                  Add Adjustment
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header - Matches Flow 6 v3 pattern */}
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/20">
              <SheetDescription className="sr-only">Pay breakdown details</SheetDescription>
              
              {/* Worker row - name + inline actions */}
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-sm font-semibold text-foreground leading-tight">
                      {worker.name}
                    </SheetTitle>
                    {/* Add pill button */}
                    <button
                      onClick={() => setIsAddingAdjustment(true)}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50 rounded-full hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Add</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {countryFlags[worker.country] || ""} {worker.country} · Jan 1 – Jan 31
                  </p>
                </div>
              </div>
              
              {/* Net pay hero */}
              <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                      {worker.type === "employee" ? "Estimated net" : "Invoice total"}
                    </p>
                    <button 
                      onClick={() => setShowReceiptView(true)}
                      className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors mt-0.5"
                    >
                      View receipt →
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                      {formatCurrency(adjustedNet, worker.currency)}
                    </p>
                    {hasAdminAdjustments && (
                      <p className="text-[10px] text-muted-foreground/60 tabular-nums">
                        was {formatCurrency(baseNet, worker.currency)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Content with collapsible sections - Flow 6 v3 pattern */}
            <div className="px-5 py-4 space-y-0.5">
              
              {/* EARNINGS Section */}
              <CollapsibleSection
                title="Earnings"
                defaultOpen={false}
                approvedCount={earnings.length + adminAdjustments.filter(a => a.type !== 'deduction').length}
              >
                {earnings.map((item, idx) => (
                  <BreakdownRow
                    key={idx}
                    label={item.label}
                    amount={item.amount}
                    currency={worker.currency}
                    isPositive
                  />
                ))}
                
                {/* Admin-added earnings */}
                {adminAdjustments
                  .filter(a => a.type !== 'deduction')
                  .map((adj) => (
                    <motion.div 
                      key={adj.id} 
                      initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={cn(
                        "rounded transition-all duration-500 group",
                        newlyAddedId === adj.id 
                          ? "bg-primary/5 ring-1 ring-primary/20" 
                          : "-mx-3 px-3 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm text-foreground">{adj.description}</span>
                          <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm tabular-nums font-mono text-foreground text-right transition-all group-hover:mr-1">
                            +{formatCurrency(adj.amount, worker.currency)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAdjustment(adj.id); }}
                            className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150"
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                
                <BreakdownRow
                  label="Total earnings"
                  amount={totalEarnings + adminAdditionsTotal}
                  currency={worker.currency}
                  isPositive
                  isTotal
                />
              </CollapsibleSection>

              {/* DEDUCTIONS Section */}
              <CollapsibleSection
                title="Deductions"
                defaultOpen={false}
                approvedCount={deductionItems.length + adminAdjustments.filter(a => a.type === 'deduction').length}
              >
                {deductionItems.map((item, idx) => (
                  <BreakdownRow
                    key={idx}
                    label={item.label}
                    amount={item.amount}
                    currency={worker.currency}
                    isPositive={false}
                  />
                ))}
                
                {/* Admin-added deductions */}
                {adminAdjustments
                  .filter(a => a.type === 'deduction')
                  .map((adj) => (
                    <motion.div 
                      key={adj.id} 
                      initial={newlyAddedId === adj.id ? { opacity: 0, y: -8, scale: 0.98 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className={cn(
                        "rounded transition-all duration-500 group",
                        newlyAddedId === adj.id 
                          ? "bg-primary/5 ring-1 ring-primary/20" 
                          : "-mx-3 px-3 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm text-foreground">{adj.description}</span>
                          <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm tabular-nums font-mono text-muted-foreground text-right transition-all group-hover:mr-1">
                            −{formatCurrency(adj.amount, worker.currency)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAdjustment(adj.id); }}
                            className="w-0 overflow-hidden opacity-0 group-hover:w-5 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all duration-150"
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                
                <BreakdownRow
                  label="Total deductions"
                  amount={totalDeductions + adminDeductionsTotal}
                  currency={worker.currency}
                  isPositive={false}
                  isTotal
                />
              </CollapsibleSection>
            </div>
            
            {/* Receipt Overlay View - Slides in from right */}
            <AnimatePresence>
              {showReceiptView && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute inset-0 bg-background z-50 flex flex-col"
                >
                  {/* Receipt Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowReceiptView(false)}
                        className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-foreground">
                          {worker.type === "employee" ? "Payslip" : "Invoice"} Preview
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          January 2026
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Receipt Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Worker info card */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(worker.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {countryFlags[worker.country] || ""} {worker.country} · {worker.type === "employee" ? "Employee" : "Contractor"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Earnings Section */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Earnings</h3>
                      <div className="space-y-1.5">
                        {earnings.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="tabular-nums font-mono">{formatCurrency(item.amount, worker.currency)}</span>
                          </div>
                        ))}
                        {/* Admin-added earnings */}
                        {adminAdjustments
                          .filter(a => a.type !== 'deduction')
                          .map((adj) => (
                            <div key={adj.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{adj.description}</span>
                              <span className="tabular-nums font-mono text-accent-green-text">+{formatCurrency(adj.amount, worker.currency)}</span>
                            </div>
                          ))}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-border/50">
                          <span>Total Earnings</span>
                          <span className="tabular-nums font-mono">{formatCurrency(totalEarnings + adminAdditionsTotal, worker.currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deductions Section */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deductions</h3>
                      <div className="space-y-1.5">
                        {deductionItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="tabular-nums font-mono text-muted-foreground">−{formatCurrency(item.amount, worker.currency)}</span>
                          </div>
                        ))}
                        {/* Admin-added deductions */}
                        {adminAdjustments
                          .filter(a => a.type === 'deduction')
                          .map((adj) => (
                            <div key={adj.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{adj.description}</span>
                              <span className="tabular-nums font-mono text-muted-foreground">−{formatCurrency(adj.amount, worker.currency)}</span>
                            </div>
                          ))}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-border/50">
                          <span>Total Deductions</span>
                          <span className="tabular-nums font-mono text-muted-foreground">−{formatCurrency(totalDeductions + adminDeductionsTotal, worker.currency)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Net Pay */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {worker.type === "employee" ? "Net Pay" : "Invoice Total"}
                        </span>
                        <span className="text-xl font-bold tabular-nums font-mono text-foreground">
                          {formatCurrency(adjustedNet, worker.currency)}
                        </span>
                      </div>
                      {hasAdminAdjustments && (
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          Base: {formatCurrency(baseNet, worker.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Receipt Footer */}
                  <div className="border-t border-border/40 bg-gradient-to-b from-muted/20 to-muted/40 px-5 py-4">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        toast.success("Receipt downloaded");
                        setShowReceiptView(false);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download {worker.type === "employee" ? "Payslip" : "Invoice"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_WorkerReceiptDrawer;
