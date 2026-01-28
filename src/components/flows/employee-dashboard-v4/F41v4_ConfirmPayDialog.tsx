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
