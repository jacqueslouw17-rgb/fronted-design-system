/**
 * Flow 4.1 — Employee Dashboard v4
 * Withdraw Request Confirmation Dialog
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

interface F41v4_WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  requestType: 'adjustment' | 'leave';
}

export const F41v4_WithdrawDialog = ({
  open,
  onOpenChange,
  onConfirm,
  requestType,
}: F41v4_WithdrawDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw this request?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will remove your pending {requestType === 'leave' ? 'leave request' : 'pay adjustment'} from this pay cycle.
              </p>
              <p className="text-xs text-muted-foreground">
                If you still need a change, you can submit a new request before confirmation closes.
              </p>
            </div>
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
