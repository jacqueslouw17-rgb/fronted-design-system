import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FileText } from "lucide-react";
import type { PayrollPayee } from "@/types/payroll";

interface PayeeTableProps {
  payees: PayrollPayee[];
  onEdit?: (payeeId: string) => void;
  onRemove?: (payeeId: string) => void;
  onViewLedger?: (payeeId: string) => void;
}

const getStatusBadge = (status: PayrollPayee["status"]) => {
  const variants: Record<PayrollPayee["status"], { variant: any; label: string }> = {
    NotReady: { variant: "secondary", label: "Not Ready" },
    Ready: { variant: "default", label: "Ready" },
    AwaitingApproval: { variant: "outline", label: "Awaiting Approval" },
    Executing: { variant: "default", label: "Executing" },
    Paid: { variant: "default", label: "Paid" },
    Failed: { variant: "destructive", label: "Failed" },
  };
  return variants[status];
};

export const PayeeTable: React.FC<PayeeTableProps> = ({ payees, onEdit, onRemove, onViewLedger }) => {
  return (
    <div className="border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-muted/80 backdrop-blur-sm z-10">Worker</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Employer Cost</TableHead>
            <TableHead className="text-right">Adjustments</TableHead>
            <TableHead className="text-right">FX Rate</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payees.map((payee) => {
            const adjustmentsTotal = payee.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
            const statusInfo = getStatusBadge(payee.status);

            return (
              <TableRow key={payee.workerId}>
                <TableCell className="sticky left-0 bg-card/90 backdrop-blur-sm z-10 font-medium">
                  {payee.name}
                </TableCell>
                <TableCell>{payee.countryCode}</TableCell>
                <TableCell>{payee.currency}</TableCell>
                <TableCell className="text-right">{payee.gross.toLocaleString()}</TableCell>
                <TableCell className="text-right">{payee.employerCosts.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {adjustmentsTotal > 0 ? (
                    <span className="text-green-600">+{adjustmentsTotal.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {payee.proposedFxRate ? payee.proposedFxRate.toFixed(2) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {payee.fxFee ? `$${payee.fxFee}` : "—"}
                </TableCell>
                <TableCell>
                  {payee.eta ? new Date(payee.eta).toLocaleDateString() : "TBD"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(payee.workerId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onRemove && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(payee.workerId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onViewLedger && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewLedger(payee.workerId)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
