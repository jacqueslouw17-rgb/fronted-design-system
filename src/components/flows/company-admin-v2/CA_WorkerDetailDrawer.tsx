// Flow 6 v2 - Company Admin Dashboard - Worker Detail Drawer

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, Briefcase, Users, ChevronDown, Lock, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceWorker } from "./CA_InPlaceTypes";

interface CA_WorkerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: CA_InPlaceWorker | null;
}

export const CA_WorkerDetailDrawer: React.FC<CA_WorkerDetailDrawerProps> = ({
  open,
  onOpenChange,
  worker
}) => {
  const [earningsOpen, setEarningsOpen] = React.useState(true);
  const [deductionsOpen, setDeductionsOpen] = React.useState(true);
  const [employerOpen, setEmployerOpen] = React.useState(false);

  if (!worker) return null;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Mock line items for demonstration
  const mockEarnings: { id: string; name: string; amount: number; isLocked?: boolean; hasReceipt?: boolean }[] = [
    { id: "1", name: "Base Salary", amount: worker.base, isLocked: true },
    ...worker.adjustments.filter(a => a.amount > 0).map(a => ({
      id: a.id,
      name: a.label,
      amount: a.amount,
      hasReceipt: a.hasReceipt,
      isLocked: false
    }))
  ];

  const mockDeductions = worker.type === "employee" ? [
    { id: "d1", name: "SSS Contribution", amount: worker.deductions * 0.3, isLocked: true },
    { id: "d2", name: "PhilHealth", amount: worker.deductions * 0.2, isLocked: true },
    { id: "d3", name: "Pag-IBIG", amount: worker.deductions * 0.1, isLocked: true },
    { id: "d4", name: "Withholding Tax", amount: worker.deductions * 0.4, isLocked: true }
  ] : [];

  const mockEmployerCosts = worker.type === "employee" && worker.employerCost ? [
    { id: "e1", name: "SSS (Employer)", amount: worker.employerCost * 0.4, isLocked: true },
    { id: "e2", name: "PhilHealth (Employer)", amount: worker.employerCost * 0.3, isLocked: true },
    { id: "e3", name: "Pag-IBIG (Employer)", amount: worker.employerCost * 0.3, isLocked: true }
  ] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">Worker Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Worker Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{worker.name}</p>
                {worker.isManualMode && (
                  <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-500/30">manual</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{worker.countryFlag} {worker.country}</span>
                <span>·</span>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  worker.type === "employee" 
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                )}>
                  {worker.type === "employee" ? (
                    <><Briefcase className="h-3 w-3 mr-1" />Employee</>
                  ) : (
                    <><Users className="h-3 w-3 mr-1" />Contractor</>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Earnings Section */}
          <Collapsible open={earningsOpen} onOpenChange={setEarningsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                <span className="text-sm font-semibold">Earnings</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", earningsOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {mockEarnings.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-sm">{item.name}</span>
                    {item.hasReceipt && <Receipt className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +{formatCurrency(item.amount, worker.currency)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 px-3 border-t border-border/40">
                <span className="text-sm font-medium">Total Earnings</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(worker.base + worker.adjustments.filter(a => a.amount > 0).reduce((sum, a) => sum + a.amount, 0), worker.currency)}
                </span>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Deductions Section (Employees only) */}
          {worker.type === "employee" && mockDeductions.length > 0 && (
            <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                  <span className="text-sm font-semibold">Deductions</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", deductionsOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {mockDeductions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(item.amount, worker.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 px-3 border-t border-border/40">
                  <span className="text-sm font-medium">Total Deductions</span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(worker.deductions, worker.currency)}
                  </span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Employer Contributions (Employees only) */}
          {worker.type === "employee" && mockEmployerCosts.length > 0 && (
            <Collapsible open={employerOpen} onOpenChange={setEmployerOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent">
                  <span className="text-sm font-semibold">Employer Contributions</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", employerOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {mockEmployerCosts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      {item.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(item.amount, worker.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 px-3 border-t border-border/40">
                  <span className="text-sm font-medium">Total Employer Cost</span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(worker.employerCost || 0, worker.currency)}
                  </span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Separator />

          {/* Net Pay Summary */}
          <Card className="border border-primary/20 bg-primary/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Net Pay</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(worker.netPay, worker.currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
