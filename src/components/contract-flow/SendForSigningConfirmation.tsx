import React from "react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FileSignature, Sparkles } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface SendForSigningConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onConfirm: () => void;
  onReview?: () => void;
}

export const SendForSigningConfirmation: React.FC<SendForSigningConfirmationProps> = ({
  open,
  onOpenChange,
  candidate,
  onConfirm,
  onReview,
}) => {
  if (!candidate) return null;

  const firstName = candidate.name.split(' ')[0];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary"
          >
            <FileSignature className="h-8 w-8 text-white" />
          </motion.div>
          <AlertDialogTitle className="text-center text-xl">
            Just double-checking — ready to send this one off?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-base">
              Are you sure you're ready to send this contract to <span className="font-semibold text-foreground">{firstName}</span>?
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 border border-border p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Candidate:</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  {candidate.flag} {candidate.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium text-foreground">{candidate.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salary:</span>
                <span className="font-medium text-foreground">{candidate.salary}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
              <Sparkles className="h-4 w-4" />
              Once sent, it'll go directly to their inbox for signing
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
          {onReview && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onReview();
              }}
              className="w-full sm:w-auto"
            >
              Review First
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-gradient-primary"
          >
            <FileSignature className="mr-2 h-4 w-4" />
            Yes, Send Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
