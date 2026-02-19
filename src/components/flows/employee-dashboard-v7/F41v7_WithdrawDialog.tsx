/**
 * Flow 4.1 — Employee Dashboard v7
 * Withdraw Request Confirmation Dialog
 * INDEPENDENT from v6 and all other flows.
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

interface F41v7_WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  requestType: 'adjustment' | 'leave';
}

export const F41v7_WithdrawDialog = ({
  open,
  onOpenChange,
  onConfirm,
  requestType,
}: F41v7_WithdrawDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="sm:max-w-md"
        onOverlayClick={() => onOpenChange(false)}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw this request?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove your pending {requestType === 'leave' ? 'leave request' : 'pay adjustment'} from this pay cycle. If you still need a change, you can submit a new request before confirmation closes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Withdraw request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
