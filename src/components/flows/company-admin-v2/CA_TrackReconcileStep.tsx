// Flow 6 v2 - Company Admin Dashboard - Track & Reconcile Step (Step 4)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, Download, FileText, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_InPlaceWorker, CA_CurrencyTotal } from "./CA_InPlaceTypes";

interface CA_TrackReconcileStepProps {
  workers: CA_InPlaceWorker[];
  currencyTotals: CA_CurrencyTotal[];
  batchStatus: "draft" | "in_review" | "client_approved" | "auto_approved" | "requires_changes";
  payoutDate: string;
  onWorkerClick: (workerId: string) => void;
  onBack: () => void;
  onMarkComplete: () => void;
  onExportReconciliation: () => void;
}

export const CA_TrackReconcileStep: React.FC<CA_TrackReconcileStepProps> = ({
  workers,
  currencyTotals,
  batchStatus,
  payoutDate,
  onWorkerClick,
  onBack,
  onMarkComplete,
  onExportReconciliation
}) => {
  const [selectedSection, setSelectedSection] = useState<"employees" | "contractors">("employees");

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  const isApproved = batchStatus === "client_approved" || batchStatus === "auto_approved";

  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Calculate totals
  const totalEmployees = currencyTotals.reduce((sum, ct) => sum + ct.employeeTotal, 0);
  const totalContractors = currencyTotals.reduce((sum, ct) => sum + ct.contractorTotal, 0);

  const getPaymentStatus = () => {
    if (!isApproved) return { label: "Pending Approval", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
    return { label: "Posted", color: "text-green-600 bg-green-500/10 border-green-500/30" };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employees Summary */}
        <Card className="border border-border/40 bg-card/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold">Employees</h4>
              </div>
              <Badge variant="outline" className={cn("text-xs", paymentStatus.color)}>
                {paymentStatus.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workers</span>
              <span className="text-sm font-medium">{employees.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-lg font-bold text-foreground">
                ${totalEmployees.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contractors Summary */}
        <Card className="border border-border/40 bg-card/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-semibold">Contractors</h4>
              </div>
              <Badge variant="outline" className={cn("text-xs", paymentStatus.color)}>
                {paymentStatus.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Workers</span>
              <span className="text-sm font-medium">{contractors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <span className="text-lg font-bold text-foreground">
                ${totalContractors.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Reconciliation Table */}
      <Card className="border border-border/40 bg-card/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Reconciliation by Currency</h4>
            <Button variant="ghost" size="sm" className="h-8" onClick={onExportReconciliation}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Currency</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-center">Sent</TableHead>
                <TableHead className="text-xs text-center">Cleared</TableHead>
                <TableHead className="text-xs text-right">Variance</TableHead>
                <TableHead className="text-xs text-center"># Workers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencyTotals.map((ct) => (
                <TableRow key={ct.currency} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {ct.currency}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ct.countries.join(", ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold">
                      {formatCurrency(ct.netToPay, ct.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {isApproved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isApproved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-medium text-green-600">0</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {ct.employees + ct.contractors}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section Toggle and Detail Tables */}
      <Card className="border border-border/40 bg-card/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={selectedSection === "employees" ? "default" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setSelectedSection("employees")}
            >
              <Briefcase className="h-3.5 w-3.5 mr-1.5" />
              Employees ({employees.length})
            </Button>
            <Button
              variant={selectedSection === "contractors" ? "default" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setSelectedSection("contractors")}
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Contractors ({contractors.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Worker</TableHead>
                <TableHead className="text-xs">Country</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedSection === "employees" ? employees : contractors).map((worker) => (
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{worker.countryFlag} {worker.country}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold">
                      {formatCurrency(worker.netPay, worker.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {isApproved ? (
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                        Sent
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isApproved ? (
                      <span className="text-xs text-muted-foreground font-mono">
                        REF-{worker.id.toUpperCase()}-2025
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Execute
        </Button>
        {isApproved && (
          <Button onClick={onMarkComplete}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
};
