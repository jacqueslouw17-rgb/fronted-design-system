// Flow 6 v2 - Company Admin Dashboard - Review Step (Step 1)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, ChevronLeft, Users, Briefcase, FileText, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceWorker, CA_CurrencyTotal } from "./CA_InPlaceTypes";

interface CA_ReviewStepProps {
  workers: CA_InPlaceWorker[];
  currencyTotals: CA_CurrencyTotal[];
  onWorkerClick: (workerId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const CA_ReviewStep: React.FC<CA_ReviewStepProps> = ({
  workers,
  currencyTotals,
  onWorkerClick,
  onContinue,
  onBack
}) => {
  const currencies = currencyTotals.map(ct => ct.currency);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0] || "USD");

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const workersInCurrency = workers.filter(w => w.currency === selectedCurrency);
  const employees = workersInCurrency.filter(w => w.type === "employee");
  const contractors = workersInCurrency.filter(w => w.type === "contractor");

  const currentTotal = currencyTotals.find(ct => ct.currency === selectedCurrency);

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="outline" className="text-[10px] bg-accent-green-fill text-accent-green-text border-accent-green-outline/30">Ready</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case "exception":
        return <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-500/30">Exception</Badge>;
      default:
        return null;
    }
  };

  const WorkerTable = ({ workerList, type }: { workerList: CA_InPlaceWorker[]; type: "employee" | "contractor" }) => (
    <Card className="border border-border/40 bg-card/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {type === "employee" ? (
            <Briefcase className="h-4 w-4 text-blue-500" />
          ) : (
            <Users className="h-4 w-4 text-purple-500" />
          )}
          <h4 className="text-sm font-semibold">
            {type === "employee" ? "Employees (Payroll)" : "Contractors (Invoices)"}
          </h4>
          <Badge variant="secondary" className="text-xs">{workerList.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Worker</TableHead>
              <TableHead className="text-xs">Country</TableHead>
              <TableHead className="text-xs text-right">Base</TableHead>
              <TableHead className="text-xs text-center">Adjustments</TableHead>
              <TableHead className="text-xs text-right">Net Pay</TableHead>
              <TableHead className="text-xs text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workerList.map((worker) => (
              <TableRow 
                key={worker.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onWorkerClick(worker.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{worker.name}</span>
                    {worker.isManualMode && (
                      <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-500/30">manual</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{worker.countryFlag} {worker.country}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-mono">{formatCurrency(worker.base, worker.currency)}</span>
                </TableCell>
                <TableCell className="text-center">
                  {worker.adjustments.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      {worker.adjustments.map((adj) => (
                        <Badge 
                          key={adj.id} 
                          variant="outline" 
                          className={cn(
                            "text-[9px] px-1.5",
                            adj.amount >= 0 ? "text-green-600 border-green-500/30" : "text-amber-600 border-amber-500/30"
                          )}
                        >
                          {adj.label}
                          {adj.hasReceipt && <Receipt className="h-2.5 w-2.5 ml-0.5 inline" />}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-semibold">{formatCurrency(worker.netPay, worker.currency)}</span>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(worker.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Currency Tabs */}
      <Tabs value={selectedCurrency} onValueChange={setSelectedCurrency}>
        <TabsList className="bg-muted/50">
          {currencies.map((currency) => (
            <TabsTrigger key={currency} value={currency} className="text-sm">
              {currency}
            </TabsTrigger>
          ))}
        </TabsList>

        {currencies.map((currency) => (
          <TabsContent key={currency} value={currency} className="space-y-4 mt-4">
            {/* Employees Table */}
            {employees.length > 0 && (
              <WorkerTable workerList={employees} type="employee" />
            )}

            {/* Contractors Table */}
            {contractors.length > 0 && (
              <WorkerTable workerList={contractors} type="contractor" />
            )}

            {/* Totals Bar */}
            {currentTotal && (
              <Card className="border border-primary/20 bg-primary/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">EOR Subtotal:</span>
                        <span className="ml-2 font-semibold">{formatCurrency(currentTotal.employeeTotal, currency)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">COR Subtotal:</span>
                        <span className="ml-2 font-semibold">{formatCurrency(currentTotal.contractorTotal, currency)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adjustments:</span>
                        <span className={cn(
                          "ml-2 font-semibold",
                          currentTotal.adjustmentsTotal >= 0 ? "text-green-600" : "text-amber-600"
                        )}>
                          {currentTotal.adjustmentsTotal >= 0 ? "+" : ""}{formatCurrency(currentTotal.adjustmentsTotal, currency)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-sm">Grand Total:</span>
                      <span className="ml-2 text-lg font-bold text-primary">{formatCurrency(currentTotal.netToPay, currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Overview
        </Button>
        <Button onClick={onContinue}>
          Continue to Exceptions
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
