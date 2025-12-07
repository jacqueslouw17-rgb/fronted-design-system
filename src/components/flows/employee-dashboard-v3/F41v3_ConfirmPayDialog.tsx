/**
 * Flow 4.1 — Employee Dashboard v3
 * Confirm Pay Dialog
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
import { useF41v3_DashboardStore } from '@/stores/F41v3_DashboardStore';

interface F41v3_ConfirmPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F41v3_ConfirmPayDialog = ({ open, onOpenChange, periodLabel }: F41v3_ConfirmPayDialogProps) => {
  const { confirmPay } = useF41v3_DashboardStore();

  const handleConfirm = () => {
    confirmPay();
    toast.success("Pay confirmed. You're all set.");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm upcoming pay</AlertDialogTitle>
          <AlertDialogDescription>
            You're confirming the base calculation for {periodLabel}. You can still request adjustments until the window closes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
