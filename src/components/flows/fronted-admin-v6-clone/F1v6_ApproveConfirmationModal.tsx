import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface F1v4_ApproveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  companyName: string;
  employeeCount: number;
  contractorCount: number;
  totalAmount: string;
  warningCount?: number;
  isCustomBatch?: boolean;
  adjustmentCount?: number;
}

export const F1v4_ApproveConfirmationModal: React.FC<F1v4_ApproveConfirmationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isCustomBatch = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-lg font-semibold">
            {isCustomBatch ? "Lock this off-cycle batch?" : "Ready to lock and pay out?"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {isCustomBatch
              ? "Once locked, no further edits can be made. You'll process the payment outside of Fronted."
              : "Once locked, no further edits can be made. You'll process the payment outside of Fronted."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Go back
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Lock & approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default F1v4_ApproveConfirmationModal;
