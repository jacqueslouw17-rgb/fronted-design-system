/**
 * Flow 4.2 — Contractor Dashboard v4
 * Confirm Invoice Dialog
 * ISOLATED: Changes here do NOT affect v3 or any other flow.
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
import { useF42v4_DashboardStore } from '@/stores/F42v4_DashboardStore';

interface F42v4_ConfirmInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F42v4_ConfirmInvoiceDialog = ({ open, onOpenChange, periodLabel }: F42v4_ConfirmInvoiceDialogProps) => {
  const { confirmInvoice } = useF42v4_DashboardStore();

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
