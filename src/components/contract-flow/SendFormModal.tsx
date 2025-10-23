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
import { Mail } from "lucide-react";
import type { OnboardingCandidate } from "@/hooks/useCandidateOnboarding";

interface SendFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: OnboardingCandidate | null;
  onConfirm: () => void;
}

export const SendFormModal: React.FC<SendFormModalProps> = ({
  open,
  onOpenChange,
  candidate,
  onConfirm,
}) => {
  if (!candidate) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <Mail className="h-8 w-8 text-primary" />
          </motion.div>
          <AlertDialogTitle className="text-center">
            Send secure onboarding form to {candidate.name}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p>They'll receive an email to complete missing information.</p>
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground mb-1">Form will be sent to:</p>
              <p className="text-xs text-muted-foreground">{candidate.email}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Mail className="mr-2 h-4 w-4" />
            Send Form
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
