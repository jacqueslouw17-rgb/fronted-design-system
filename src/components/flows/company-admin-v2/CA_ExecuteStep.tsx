// Flow 6 v2 - Company Admin Dashboard - Execute Step (Step 3)

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Check, FileEdit, DollarSign, Users, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CA_CurrencyTotal, CA_InPlaceBatchStatus } from "./CA_InPlaceTypes";

interface CA_ExecuteStepProps {
  currencyTotals: CA_CurrencyTotal[];
  employeeCount: number;
  contractorCount: number;
  payoutDate: string;
  feeEstimate: number;
  primaryCurrency: string;
  onApprove: () => void;
  onRequestChanges: (reason: string) => void;
  onBack: () => void;
  batchStatus: CA_InPlaceBatchStatus;
}

export const CA_ExecuteStep: React.FC<CA_ExecuteStepProps> = ({
  currencyTotals,
  employeeCount,
  contractorCount,
  payoutDate,
  feeEstimate,
  primaryCurrency,
  onApprove,
  onRequestChanges,
  onBack,
  batchStatus
}) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesReason, setChangesReason] = useState("");

  const totalNetToPay = currencyTotals.reduce((sum, ct) => sum + ct.netToPay, 0);
  const totalEmployerCost = currencyTotals.reduce((sum, ct) => sum + ct.employerCost, 0);

  const handleApproveConfirm = () => {
    setConfirmModalOpen(false);
    onApprove();
  };

  const handleRequestChangesSubmit = () => {
    if (changesReason.trim()) {
      onRequestChanges(changesReason);
      setChangesModalOpen(false);
      setChangesReason("");
    }
  };

  const isApproved = batchStatus === "client_approved" || batchStatus === "auto_approved";

  return (
    <div className="space-y-6">
      {/* Approved Banner */}
      {isApproved && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent-green-fill border border-accent-green-outline/30">
          <CheckCircle2 className="h-5 w-5 text-accent-green-text flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Batch Approved
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fronted will execute payments on {payoutDate}.
            </p>
          </div>
        </div>
      )}

      {/* Review FX Table (Read-only) */}
      <Card className="border border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Review FX & Totals</h4>
            <Badge variant="outline" className="text-xs">Read-only</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Currency</TableHead>
                <TableHead className="text-xs">Countries</TableHead>
                <TableHead className="text-xs text-center">Employees</TableHead>
                <TableHead className="text-xs text-center">Contractors</TableHead>
                <TableHead className="text-xs text-right">Employer Cost</TableHead>
                <TableHead className="text-xs text-right">Net to Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencyTotals.map((ct) => (
                <TableRow key={ct.currency}>
                  <TableCell className="font-mono font-medium">{ct.currency}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ct.countries.join(", ")}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-3 w-3 text-blue-500" />
                      <span className="text-sm">{ct.employees}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-3 w-3 text-purple-500" />
                      <span className="text-sm">{ct.contractors}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {ct.currency} {ct.employerCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {ct.currency} {ct.netToPay.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Final Summary Card */}
      <Card className="border border-primary/20 bg-primary/[0.02]">
        <CardHeader className="pb-3">
          <h4 className="text-sm font-semibold text-foreground">Final Summary</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Workers</p>
              </div>
              <p className="text-lg font-bold text-foreground">{employeeCount + contractorCount}</p>
              <p className="text-xs text-muted-foreground">{employeeCount} EOR · {contractorCount} COR</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Employer Costs</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                {primaryCurrency} {totalEmployerCost.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
              </div>
              <p className="text-lg font-bold text-foreground">
                {primaryCurrency} {feeEstimate.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 bg-card/30">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Payout Date</p>
              </div>
              <p className="text-lg font-bold text-foreground">{payoutDate}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground">Total Payroll Cost</p>
              <p className="text-2xl font-bold text-primary">
                {primaryCurrency} {(totalNetToPay + totalEmployerCost + feeEstimate).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous: Exceptions
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setChangesModalOpen(true)}
            disabled={isApproved}
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Request changes
          </Button>
          <Button 
            onClick={() => setConfirmModalOpen(true)}
            disabled={isApproved}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve batch
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment Batch</DialogTitle>
            <DialogDescription>
              You are about to approve this payment batch. Fronted will execute payments on {payoutDate}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Workers</span>
                <span className="font-medium">{employeeCount + contractorCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Payroll Cost</span>
                <span className="font-semibold text-primary">
                  {primaryCurrency} {(totalNetToPay + totalEmployerCost + feeEstimate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveConfirm}>
              Approve Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Modal */}
      <Dialog open={changesModalOpen} onOpenChange={setChangesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes you need. Your request will be sent to the Fronted team.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please describe the changes needed..."
              value={changesReason}
              onChange={(e) => setChangesReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangesModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestChangesSubmit} disabled={!changesReason.trim()}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
