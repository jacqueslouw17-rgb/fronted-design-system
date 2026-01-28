/**
 * Flow 6 — Company Admin Dashboard v3
 * Confirmation Dialogs for Approve/Reject Actions
 */

import React from "react";
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

// Bulk Approve Dialog
interface CA3_BulkApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pendingCount: number;
}

export const CA3_BulkApproveDialog = ({
  open,
  onOpenChange,
  onConfirm,
  pendingCount,
}: CA3_BulkApproveDialogProps) => {
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
          <AlertDialogTitle>Approve all pending items?</AlertDialogTitle>
          <AlertDialogDescription>
            This will approve all {pendingCount} pending adjustment{pendingCount !== 1 ? 's' : ''} and leave request{pendingCount !== 1 ? 's' : ''} for this worker. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Approve all ({pendingCount})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Bulk Reject Dialog - requires reason input
interface CA3_BulkRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  pendingCount: number;
}

export const CA3_BulkRejectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  pendingCount,
}: CA3_BulkRejectDialogProps) => {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    onOpenChange(false);
    setReason("");
  };

  // Reset reason when dialog closes
  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

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
          <AlertDialogTitle>Reject all pending items?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reject all {pendingCount} pending adjustment{pendingCount !== 1 ? 's' : ''} and leave request{pendingCount !== 1 ? 's' : ''} for this worker. The worker will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-2">
          <label htmlFor="bulk-reject-reason" className="text-sm font-medium text-foreground mb-1.5 block">
            Reason for rejection
          </label>
          <textarea
            id="bulk-reject-reason"
            placeholder="Enter a reason that will apply to all rejected items..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[80px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Reject all ({pendingCount})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
