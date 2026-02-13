/**
 * Flow 6 — Company Admin Dashboard v3
 * Confirmation Dialogs for Approve/Reject Actions
 * 
 * 2-Step Review Flow:
 * - Individual approve/reject are now reversible (no confirmation needed)
 * - "Mark as Ready" is the finalizing action that requires confirmation
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
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

// Legacy dialog - kept for backwards compatibility but no longer used for individual items
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

// Legacy dialog - kept for backwards compatibility
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

// Bulk Approve Dialog - still used for bulk actions
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
            This will mark all {pendingCount} pending item{pendingCount !== 1 ? 's' : ''} as approved. You can still undo individual items before finalizing.
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
            This will mark all {pendingCount} pending item{pendingCount !== 1 ? 's' : ''} as rejected. You can still undo individual items before finalizing.
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

// NEW: Mark as Ready Dialog - The finalizing action
interface CA3_MarkAsReadyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  workerName: string;
  approvedCount: number;
  rejectedCount: number;
}

export const CA3_MarkAsReadyDialog = ({
  open,
  onOpenChange,
  onConfirm,
  workerName,
  approvedCount,
  rejectedCount,
}: CA3_MarkAsReadyDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const totalItems = approvedCount + rejectedCount;

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
          <AlertDialogTitle>Finalize review for {workerName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>This will lock all reviewed items for this worker. This action cannot be undone.</p>
              
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-accent-green-text" />
                  <span className="text-foreground font-medium">{approvedCount} item{approvedCount !== 1 ? 's' : ''} approved</span>
                </div>
                {rejectedCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-foreground font-medium">{rejectedCount} item{rejectedCount !== 1 ? 's' : ''} rejected</span>
                  </div>
                )}
              </div>
              
              {rejectedCount > 0 && (
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-md p-2.5 border border-amber-200 dark:border-amber-500/20">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Rejected items will be sent back to the worker for resubmission.</span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Mark as Ready
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Exclude Worker Confirmation Dialog
interface CA3_ExcludeWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  workerName: string;
  endReason?: string;
}

export const CA3_ExcludeWorkerDialog = ({
  open,
  onOpenChange,
  onConfirm,
  workerName,
  endReason,
}: CA3_ExcludeWorkerDialogProps) => {
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
          <AlertDialogTitle>Exclude {workerName}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {workerName} will be removed from this payroll run and deferred to the next cycle.
              </p>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5 border border-border/30">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <span>No payment will be processed for this worker in the current period.</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Exclude from this run
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
