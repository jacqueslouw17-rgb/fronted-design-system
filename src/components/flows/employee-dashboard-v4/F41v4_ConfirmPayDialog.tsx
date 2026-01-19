/**
 * Flow 4.1 — Employee Dashboard v4
 * Confirm Pay Dialog
 * INDEPENDENT from v3 - changes here do not affect other flows.
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
import { toast } from 'sonner';
import { useF41v4_DashboardStore } from '@/stores/F41v4_DashboardStore';

interface F41v4_ConfirmPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F41v4_ConfirmPayDialog = ({ open, onOpenChange, periodLabel }: F41v4_ConfirmPayDialogProps) => {
  const { confirmPay } = useF41v4_DashboardStore();

  const handleConfirm = () => {
    confirmPay();
    toast.success("Submitted for payroll. Your company will review.");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit for payroll</AlertDialogTitle>
          <AlertDialogDescription>
            You're submitting your details for {periodLabel}. Your company will review before payroll is finalised. You can still request adjustments until the submission window closes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
