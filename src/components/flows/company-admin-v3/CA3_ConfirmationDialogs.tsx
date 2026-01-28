/**
 * Flow 6 — Company Admin Dashboard v3
 * Confirmation Dialogs for Approve/Reject Actions
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

interface CA3_ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  adjustmentType: string;
  amount?: string;
}

export const CA3_ApproveDialog = ({
  open,
  onOpenChange,
  onConfirm,
  adjustmentType,
  amount,
}: CA3_ApproveDialogProps) => {
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
          <AlertDialogTitle>Approve this adjustment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will approve the {adjustmentType.toLowerCase()}{amount ? ` of ${amount}` : ''} and include it in the worker's pay for this cycle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Approve adjustment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface CA3_RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  adjustmentType: string;
}

export const CA3_RejectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  adjustmentType,
}: CA3_RejectDialogProps) => {
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
          <AlertDialogTitle>Reject this adjustment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reject the {adjustmentType.toLowerCase()} request. The worker will be notified with your rejection reason and can resubmit if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reject adjustment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
