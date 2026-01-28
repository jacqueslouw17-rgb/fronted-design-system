/**
 * Flow 4.2 — Contractor Dashboard v3
 * Confirm Invoice Dialog
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
import { useF42v3_DashboardStore } from '@/stores/F42v3_DashboardStore';

interface F42v3_ConfirmInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F42v3_ConfirmInvoiceDialog = ({ open, onOpenChange, periodLabel }: F42v3_ConfirmInvoiceDialogProps) => {
  const { confirmInvoice } = useF42v3_DashboardStore();

  const handleConfirm = () => {
    confirmInvoice();
    toast.success("Invoice confirmed. You're all set.");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm upcoming invoice</AlertDialogTitle>
          <AlertDialogDescription>
            You're confirming your invoice for {periodLabel}. You can still request adjustments until the window closes.
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
