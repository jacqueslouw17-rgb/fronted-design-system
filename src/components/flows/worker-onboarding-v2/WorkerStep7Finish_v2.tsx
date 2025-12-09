/**
 * Flow 3 – Candidate Onboarding v2
 * Step 6: Finish
 * 
 * DETACHED CLONE of v1 - changes here do NOT affect v1
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { motion } from "framer-motion";

interface Step7Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

const WorkerStep7Finish_v2 = ({ formData, onComplete, isProcessing: externalProcessing }: Step7Props) => {
  const navigate = useNavigate();

  const handleFinish = useCallback(() => {
    onComplete("finish");
    // Navigate to dashboard - stays within v2 context
    navigate('/flows/candidate-dashboard', { state: { fromOnboarding: true } });
  }, [navigate, onComplete]);

  const completedItems = [
    { label: "Personal information", icon: CheckCircle2, done: !!formData.fullName },
    { label: "Compliance documents", icon: CheckCircle2, done: !!formData.taxNumber },
    { label: "Payroll details", icon: CheckCircle2, done: !!formData.bankAccount },
    { label: "Work setup", icon: CheckCircle2, done: !!formData.startDate },
    { label: "Profile ready", icon: CheckCircle2, done: true }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 relative">
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">You're All Set! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Your onboarding is complete
          </p>
        </div>

        {/* What we configured */}
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
          <Label className="text-sm font-medium">What We've Completed</Label>
          <div className="grid grid-cols-2 gap-2">
            {completedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card border border-border/30 hover:border-primary/20 transition-colors"
                >
                  <Icon className={cn(
                    "h-3 w-3 flex-shrink-0",
                    item.done ? "text-green-600" : "text-muted-foreground"
                  )} />
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full" 
            disabled={externalProcessing}
            onClick={handleFinish}
          >
            {externalProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                Finish & Launch
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Your dashboard is ready to view
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkerStep7Finish_v2;