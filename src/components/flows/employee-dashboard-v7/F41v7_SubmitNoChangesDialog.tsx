/**
 * Flow 4.1 — Employee Dashboard v7
 * Submit No Changes Dialog
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
import { useF41v7_DashboardStore } from '@/stores/F41v7_DashboardStore';

interface F41v7_SubmitNoChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodLabel: string;
}

export const F41v7_SubmitNoChangesDialog = ({ 
  open, 
  onOpenChange, 
  periodLabel 
}: F41v7_SubmitNoChangesDialogProps) => {
  const { submitNoChanges } = useF41v7_DashboardStore();

  const handleSubmit = () => {
    submitNoChanges();
    toast.success("Submitted successfully. Your payroll is now under review.");
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
          <AlertDialogTitle>Submit with no changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You're confirming no leave, expenses, or adjustments for {periodLabel}. Your standard pay will be processed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
