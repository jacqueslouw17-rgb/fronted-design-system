import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExecutionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  cohort: "all" | "employees" | "contractors";
  employeeCount: number;
  contractorCount: number;
  employeeTotal: number;
  contractorTotal: number;
  currency: string;
}

export const ExecutionConfirmationDialog: React.FC<ExecutionConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  cohort,
  employeeCount,
  contractorCount,
  employeeTotal,
  contractorTotal,
  currency,
}) => {
  const showEmployees = cohort === "all" || cohort === "employees";
  const showContractors = cohort === "all" || cohort === "contractors";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Payroll Execution</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              You are about to execute payroll for:
            </div>
            
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
              {showEmployees && (
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">
                    Employees: {employeeCount} workers – Total: {employeeTotal.toLocaleString()} {currency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Employees will be posted to the payroll system.
                  </div>
                </div>
              )}
              
              {showContractors && (
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">
                    Contractors: {contractorCount} workers – Total: {contractorTotal.toLocaleString()} {currency}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Contractors will be sent for payment via the payout system.
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm">
              Do you want to proceed with this execution?
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Execute now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
