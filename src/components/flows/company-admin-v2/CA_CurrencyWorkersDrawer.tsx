// Flow 6 v2 - Company Admin Dashboard - Currency Workers Drawer (Local to this flow only)

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, Briefcase, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_WorkerPreviewRow } from "./CA_PayrollTypes";

interface CA_CurrencyWorkersDrawerProps {
  open: boolean;
  onClose: () => void;
  currency: string;
  employees: CA_WorkerPreviewRow[];
  contractors: CA_WorkerPreviewRow[];
  onViewPayrollPreview: (workerId: string) => void;
  onViewInvoicePreview: (workerId: string) => void;
}

export const CA_CurrencyWorkersDrawer: React.FC<CA_CurrencyWorkersDrawerProps> = ({
  open,
  onClose,
  currency,
  employees,
  contractors,
  onViewPayrollPreview,
  onViewInvoicePreview
}) => {
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const formatCurrency = (amount: number, ccy: string) => {
    return `${ccy} ${amount.toLocaleString()}`;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/30">
          <SheetTitle className="text-lg font-semibold">
            {currency} – Workers in this batch
          </SheetTitle>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="text-xs gap-1.5">
              <Users className="h-3 w-3" />
              {employees.length} Employees
            </Badge>
            <Badge variant="outline" className="text-xs gap-1.5">
              <Briefcase className="h-3 w-3" />
              {contractors.length} Contractors
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {/* Employees Section */}
            {employees.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-foreground">Employees</h4>
                </div>
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div 
                      key={emp.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.countryFlag} {emp.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(emp.netPay, emp.currency)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Net pay</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => onViewPayrollPreview(emp.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View payroll preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employees.length > 0 && contractors.length > 0 && (
              <Separator />
            )}

            {/* Contractors Section */}
            {contractors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-foreground">Contractors</h4>
                </div>
                <div className="space-y-2">
                  {contractors.map((con) => (
                    <div 
                      key={con.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-500/10 text-purple-600 text-xs">
                            {getInitials(con.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{con.name}</p>
                          <p className="text-xs text-muted-foreground">{con.countryFlag} {con.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(con.netPay, con.currency)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Invoice total</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => onViewInvoicePreview(con.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View invoice preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employees.length === 0 && contractors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">No workers found for this currency</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
