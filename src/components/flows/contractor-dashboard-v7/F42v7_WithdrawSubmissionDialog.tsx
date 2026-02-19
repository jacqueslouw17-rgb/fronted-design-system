/**
 * Flow 4.2 — Contractor Dashboard v5
 * Withdraw Submission Dialog - matches F41v5 pattern
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

interface WithdrawSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const F42v6_WithdrawSubmissionDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: WithdrawSubmissionDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
    toast.success('Submission withdrawn. You can make changes and resubmit.');
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
          <AlertDialogTitle>Withdraw submission?</AlertDialogTitle>
          <AlertDialogDescription>
            This will withdraw your invoice submission and return it to draft status. You'll be able to make changes and resubmit before the cut-off date.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Withdraw submission
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
