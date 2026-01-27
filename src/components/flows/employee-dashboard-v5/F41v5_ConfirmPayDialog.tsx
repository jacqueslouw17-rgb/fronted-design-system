/**
 * Flow 4.1 — Employee Dashboard v5
 * Confirm Pay Dialog - Review & Submit flow
 * INDEPENDENT from v4 and all other flows.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useF41v5_DashboardStore } from '@/stores/F41v5_DashboardStore';

interface F41v5_ConfirmPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F41v5_ConfirmPayDialog = ({ open, onOpenChange, periodLabel }: F41v5_ConfirmPayDialogProps) => {
  const { submitForReview, payrollStatus } = useF41v5_DashboardStore();

  const isResubmit = payrollStatus === 'returned';

  const handleConfirm = () => {
    submitForReview();
    toast.success(
      isResubmit 
        ? "Resubmitted successfully. Your payroll is now under review."
        : "Submitted successfully. Your payroll is now under review."
    );
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOverlayClick={() => onOpenChange(false)}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isResubmit ? 'Resubmit for review?' : 'Submit for review?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            You're confirming your details for {periodLabel} are correct. 
            Your company will review and approve before payroll is processed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {isResubmit ? 'Resubmit' : 'Submit'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
