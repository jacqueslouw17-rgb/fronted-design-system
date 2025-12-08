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

interface SkipConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerCount: number;
  onConfirm: () => void;
}

export const CA_SkipConfirmationModal: React.FC<SkipConfirmationModalProps> = ({
  open,
  onOpenChange,
  workerCount,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Skip workers for this batch?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Skip {workerCount} worker{workerCount !== 1 ? "s" : ""} for this payroll batch? 
            They will not be included in payouts but remain active in their profiles.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-9 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Skip {workerCount} worker{workerCount !== 1 ? "s" : ""}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface ResetConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerCount: number;
  onConfirm: () => void;
}

export const CA_ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  open,
  onOpenChange,
  workerCount,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Reset payroll overrides for {workerCount} worker{workerCount !== 1 ? "s" : ""}? 
            This will revert this cycle to their default payroll settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-9"
          >
            Reset {workerCount} worker{workerCount !== 1 ? "s" : ""}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
