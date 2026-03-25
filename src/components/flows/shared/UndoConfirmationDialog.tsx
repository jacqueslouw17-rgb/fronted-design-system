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
} from "@/components/ui/alert-dialog";
import { X, Undo2 } from "lucide-react";

interface UndoConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** "single" = undo one item, "all" = undo all items for a worker */
  scope: "single" | "all";
  /** Label of the item being undone (used for single scope) */
  itemLabel?: string;
  /** Worker name (used for "all" scope) */
  workerName?: string;
}

export const UndoConfirmationDialog: React.FC<UndoConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  scope,
  itemLabel,
  workerName,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="sm:max-w-[400px]"
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
          <AlertDialogTitle>
            {scope === "all" ? "Undo all decisions?" : "Undo this decision?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {scope === "all"
              ? `This will reopen all adjustments for ${workerName || "this worker"} and move them back to pending review.`
              : `This will reopen ${itemLabel ? `"${itemLabel}"` : "this item"} and set it back to pending review.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="gap-1.5"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {scope === "all" ? "Undo all" : "Undo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
