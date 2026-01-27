/**
 * Flow 4.2 — Contractor Dashboard v5
 * Confirm Invoice Dialog - matches F41v5 pattern
 * 
 * INDEPENDENT: Changes here do NOT affect other flows.
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
import { useF42v5_DashboardStore } from '@/stores/F42v5_DashboardStore';

interface F42v5_ConfirmInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F42v5_ConfirmInvoiceDialog = ({ open, onOpenChange, periodLabel }: F42v5_ConfirmInvoiceDialogProps) => {
  const { submitInvoice } = useF42v5_DashboardStore();

  const handleConfirm = () => {
    submitInvoice();
    toast.success("Submitted successfully. Your invoice is under review.");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="sm:max-w-md"
        onOverlayClick={() => onOpenChange(false)}
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <AlertDialogHeader>
          <AlertDialogTitle>Confirm upcoming invoice</AlertDialogTitle>
          <AlertDialogDescription>
            You're confirming your invoice for {periodLabel}. You can still request adjustments until the submission window closes.
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
