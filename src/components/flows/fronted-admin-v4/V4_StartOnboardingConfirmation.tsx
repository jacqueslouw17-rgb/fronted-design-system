import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface V4_Contractor {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  salary: string;
  employmentType?: "contractor" | "employee";
}

interface V4_StartOnboardingConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: V4_Contractor | null;
  onConfirm: () => void;
}

export const V4_StartOnboardingConfirmation: React.FC<V4_StartOnboardingConfirmationProps> = ({
  open,
  onOpenChange,
  contractor,
  onConfirm,
}) => {
  if (!contractor) return null;

  const firstName = contractor.name.split(' ')[0];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md" onOverlayClick={() => onOpenChange(false)}>
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary"
          >
            <CheckCircle2 className="h-8 w-8 text-white" />
          </motion.div>
          <AlertDialogTitle className="text-center text-xl">
            Ready to start {firstName}'s onboarding?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-base">
              I'll send a magic link to <span className="font-semibold text-foreground">{firstName}</span> to complete their onboarding checklist.
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 border border-border p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Candidate:</span>
                <span className="font-medium text-foreground flex items-center gap-2">
                  {contractor.countryFlag} {contractor.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium text-foreground">{contractor.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Country:</span>
                <span className="font-medium text-foreground">{contractor.country}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
              <Sparkles className="h-4 w-4" />
              They'll receive an email with their personalized onboarding link
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Not Yet
          </Button>
          <Button 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-gradient-primary"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Yes, Start Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};