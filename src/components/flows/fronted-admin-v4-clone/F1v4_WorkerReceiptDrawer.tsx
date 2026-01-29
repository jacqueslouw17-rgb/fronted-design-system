/**
 * F1v4_WorkerReceiptDrawer - Reuses Flow 6 v3 drawer patterns exactly
 * 
 * Structure:
 * - Header: Avatar, name, "Add" pill, inline metadata
 * - Net pay hero with "View receipt →" link
 * - Collapsible sections (Earnings, Deductions, Adjustments)
 * - Receipt overlay slides in from right
 * - Uses CA3_AdminAddAdjustment for the add adjustment flow
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CollapsibleSection } from "@/components/flows/company-admin-v3/CA3_CollapsibleSection";
import { CA3_AdminAddAdjustment, AdminAddedAdjustment } from "@/components/flows/company-admin-v3/CA3_AdminAddAdjustment";

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
  const [newlyAddedSection, setNewlyAddedSection] = useState<'earnings' | 'overtime' | 'leave' | null>(null);

  // Reset state when worker changes
  useEffect(() => {
    setShowReceiptView(false);
    setIsAddingAdjustment(false);
    setNewlyAddedId(null);
    setNewlyAddedSection(null);
  }, [worker?.id]);

  // Clear highlight after delay
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => {
        setNewlyAddedId(null);
        setNewlyAddedSection(null);
      }, 2000);
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

  // Calculate admin adjustments by type
  const expenseAdjustments = adminAdjustments.filter(a => a.type === 'expense');
  const overtimeAdjustments = adminAdjustments.filter(a => a.type === 'overtime');
  const unpaidLeaveAdjustments = adminAdjustments.filter(a => a.type === 'unpaid_leave');

  const adminAdditionsTotal = expenseAdjustments.reduce((sum, a) => sum + (a.amount || 0), 0) +
    overtimeAdjustments.reduce((sum, a) => sum + (a.amount || 0), 0);
  const adminDeductionsTotal = unpaidLeaveAdjustments.reduce((sum, a) => sum + (a.amount || 0), 0);

  const baseNet = worker.netPay;
  const adjustedNet = baseNet + adminAdditionsTotal - adminDeductionsTotal;
  const hasAdminAdjustments = adminAdjustments.length > 0;

  // Handle adding adjustment (from CA3_AdminAddAdjustment)
  const handleAddAdjustment = (adjustment: AdminAddedAdjustment) => {
    setAdminAdjustments(prev => [...prev, adjustment]);
    setNewlyAddedId(adjustment.id);
    
    // Set which section to auto-expand
    const section = adjustment.type === 'expense' ? 'earnings' : adjustment.type === 'overtime' ? 'overtime' : 'leave';
    setNewlyAddedSection(section);
    setIsAddingAdjustment(false);
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdminAdjustments(prev => prev.filter(a => a.id !== id));
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

  // Mock hourly/daily rates for adjustment calculations
  const hourlyRate = baseSalary / 160; // ~160 working hours per month
  const dailyRate = baseSalary / 22; // ~22 working days per month

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < workers.length - 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] overflow-hidden p-0 flex flex-col"
        hideClose={isAddingAdjustment || showReceiptView}
      >
        <AnimatePresence mode="wait">
          {/* Add Adjustment Takeover - Uses CA3_AdminAddAdjustment exactly */}
          {isAddingAdjustment ? (
            <motion.div
              key="add-adjustment"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 bg-background z-10 flex flex-col"
            >
              <CA3_AdminAddAdjustment
                workerType={worker.type}
                workerName={worker.name}
                currency={worker.currency}
                dailyRate={dailyRate}
                hourlyRate={hourlyRate}
                isOpen={isAddingAdjustment}
                onOpenChange={setIsAddingAdjustment}
                onAddAdjustment={handleAddAdjustment}
              />
            </motion.div>
          ) : showReceiptView ? (
            /* Receipt View Overlay */
            <motion.div
              key="receipt-view"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 bg-background z-10 flex flex-col"
            >
              {/* Receipt Header */}
              <div className="px-5 pt-5 pb-4 border-b border-border/30 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowReceiptView(false)}
                    className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-foreground truncate">
                      {worker.type === "employee" ? "Payslip Preview" : "Invoice Preview"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {worker.name} · January 2026
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Worker Info Card */}
                <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {countryFlags[worker.country]} {worker.country} · {worker.type === "employee" ? "Employee" : "Contractor"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Earnings</h3>
                  <div className="space-y-0">
                    {earnings.map((item, idx) => (
                      <BreakdownRow
                        key={idx}
                        label={item.label}
                        amount={item.amount}
                        currency={worker.currency}
                        isPositive
                      />
                    ))}
                    {expenseAdjustments.map(adj => (
                      <BreakdownRow
                        key={adj.id}
                        label={adj.description || "Expense"}
                        amount={adj.amount || 0}
                        currency={worker.currency}
                        isPositive
                      />
                    ))}
                    {overtimeAdjustments.map(adj => (
                      <BreakdownRow
                        key={adj.id}
                        label={adj.description || "Overtime"}
                        amount={adj.amount || 0}
                        currency={worker.currency}
                        isPositive
                      />
                    ))}
                    <BreakdownRow
                      label="Total earnings"
                      amount={totalEarnings + adminAdditionsTotal}
                      currency={worker.currency}
                      isPositive
                      isTotal
                    />
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Deductions</h3>
                  <div className="space-y-0">
                    {deductionItems.map((item, idx) => (
                      <BreakdownRow
                        key={idx}
                        label={item.label}
                        amount={item.amount}
                        currency={worker.currency}
                        isPositive={false}
                      />
                    ))}
                    {unpaidLeaveAdjustments.map(adj => (
                      <BreakdownRow
                        key={adj.id}
                        label={adj.description || "Unpaid Leave"}
                        amount={adj.amount || 0}
                        currency={worker.currency}
                        isPositive={false}
                      />
                    ))}
                    <BreakdownRow
                      label="Total deductions"
                      amount={totalDeductions + adminDeductionsTotal}
                      currency={worker.currency}
                      isPositive={false}
                      isTotal
                    />
                  </div>
                </div>

                {/* Net Pay */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {worker.type === "employee" ? "Net Pay" : "Invoice Total"}
                    </span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {formatCurrency(adjustedNet, worker.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="border-t border-border/30 px-5 py-4 shrink-0">
                <Button className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download {worker.type === "employee" ? "Payslip" : "Invoice"}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Main Drawer Content */
            <motion.div
              key="main-content"
              initial={{ opacity: 1 }}
              className="flex flex-col h-full"
            >
              {/* Header - Matches Flow 6 v3 pattern exactly */}
              <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/20 shrink-0">
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
                      {/* Add pill button - Flow 6 v3 pattern */}
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
                
                {/* Net pay hero - Flow 6 v3 pattern */}
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
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">
                
                {/* EARNINGS Section */}
                <CollapsibleSection
                  title="Earnings"
                  defaultOpen={newlyAddedSection === 'earnings'}
                  approvedCount={earnings.length + expenseAdjustments.length}
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
                  
                  {/* Admin-added expense adjustments */}
                  {expenseAdjustments.map((adj) => (
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
                            +{formatCurrency(adj.amount || 0, worker.currency)}
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
                    amount={totalEarnings + expenseAdjustments.reduce((sum, a) => sum + (a.amount || 0), 0)}
                    currency={worker.currency}
                    isPositive
                    isTotal
                  />
                </CollapsibleSection>

                {/* OVERTIME Section (if any) */}
                {(overtimeAdjustments.length > 0 || newlyAddedSection === 'overtime') && (
                  <CollapsibleSection
                    title={worker.type === "contractor" ? "Additional Hours" : "Overtime"}
                    defaultOpen={newlyAddedSection === 'overtime'}
                    approvedCount={overtimeAdjustments.length}
                  >
                    {overtimeAdjustments.map((adj) => (
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
                              +{formatCurrency(adj.amount || 0, worker.currency)}
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
                      label={worker.type === "contractor" ? "Total additional" : "Total overtime"}
                      amount={overtimeAdjustments.reduce((sum, a) => sum + (a.amount || 0), 0)}
                      currency={worker.currency}
                      isPositive
                      isTotal
                    />
                  </CollapsibleSection>
                )}

                {/* DEDUCTIONS Section */}
                <CollapsibleSection
                  title="Deductions"
                  defaultOpen={newlyAddedSection === 'leave'}
                  approvedCount={deductionItems.length + unpaidLeaveAdjustments.length}
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
                  
                  {/* Admin-added unpaid leave */}
                  {unpaidLeaveAdjustments.map((adj) => (
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
                          <span className="text-sm text-muted-foreground">{adj.description}</span>
                          <span className="text-[10px] text-muted-foreground/70">Added by admin</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm tabular-nums font-mono text-muted-foreground text-right transition-all group-hover:mr-1">
                            −{formatCurrency(adj.amount || 0, worker.currency)}
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

              {/* Footer with navigation - Flow 6 v3 pattern */}
              <div className="border-t border-border/30 px-5 py-3 shrink-0">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={() => onNavigate(currentIndex - 1)}
                    className="gap-1 text-xs h-8"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {currentIndex + 1} of {workers.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasNext}
                    onClick={() => onNavigate(currentIndex + 1)}
                    className="gap-1 text-xs h-8"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default F1v4_WorkerReceiptDrawer;
