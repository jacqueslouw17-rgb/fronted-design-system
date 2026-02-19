/**
 * Flow 4.1 — Employee Dashboard v7
 * Withdraw Submission Confirmation Dialog
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
import { toast } from 'sonner';

interface F41v7_WithdrawSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const F41v7_WithdrawSubmissionDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: F41v7_WithdrawSubmissionDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
    toast.success('Submission withdrawn. You can now make changes.');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOverlayClick={() => onOpenChange(false)}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw your submission?</AlertDialogTitle>
          <AlertDialogDescription>
            This will return your pay details to draft status so you can make changes. You'll need to re-submit once you've made your changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Withdraw submission
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
