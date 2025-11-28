/**
 * Step 4: Ready to Launch
 * Part of Flow 5 — Company Admin Onboarding v1
 * 
 * Final summary showing only Company details and Hiring locations
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

const Step4FinishAdminOnboarding = ({ formData, onComplete, isProcessing: externalProcessing }: Step4Props) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleFinish = useCallback(async () => {
    // Show button loading immediately
    setIsButtonLoading(true);
    
    // Complete the step first
    onComplete("finish_dashboard_transition");
    
    // Small delay before showing transition screen
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Start transition
    setIsTransitioning(true);
    
    // Just close the transition after a moment
    setTimeout(() => {
      setIsTransitioning(false);
      setIsButtonLoading(false);
    }, 1500);
  }, [onComplete]);

  const completedItems = [
    { label: "Company details", icon: CheckCircle2, done: true, skipped: false },
    { label: "Hiring locations", icon: CheckCircle2, done: true, skipped: false }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 relative">
      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <motion.div
            key="transitioning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          >
            <motion.div 
              className="flex flex-col items-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            >
              <AudioWaveVisualizer isActive={true} />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Setting up your workspace...</h3>
                <p className="text-muted-foreground">This will just take a moment</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Ready to Launch
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Review what we've set up and continue to your dashboard.
              </p>
            </div>

            {/* What we configured */}
            <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium">What We've Configured</Label>
              <div className="flex flex-col gap-2">
                {completedItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex items-center justify-between text-sm p-3 rounded-lg border transition-all",
                      item.done 
                        ? "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30" 
                        : "bg-muted/30 border-border/30"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        item.done ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "font-medium",
                        item.done ? "text-green-900 dark:text-green-100" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                    {item.skipped && (
                      <Badge variant="outline" className="text-xs bg-background border-muted-foreground/20 text-muted-foreground">
                        Skipped
                      </Badge>
                    )}
                    {item.done && (
                      <Badge variant="outline" className="text-xs bg-green-100/50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300">
                        Complete
                      </Badge>
                    )}
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
                disabled={externalProcessing || isButtonLoading || isTransitioning}
                onClick={handleFinish}
              >
                {(externalProcessing || isButtonLoading) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step4FinishAdminOnboarding;
