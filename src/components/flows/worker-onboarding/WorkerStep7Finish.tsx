import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

interface Step7Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep7Finish = ({ formData, onComplete, isProcessing: externalProcessing }: Step7Props) => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleFinish = useCallback(async () => {
    onComplete("finish");
    setIsTransitioning(true);
    
    setTimeout(() => {
      navigate('/flows/candidate-dashboard');
    }, 1200);
  }, [navigate, onComplete]);

  const completedItems = [
    { label: "Personal information verified", icon: CheckCircle2, done: true },
    { label: "Compliance documents uploaded", icon: CheckCircle2, done: true },
    { label: "Payroll details configured", icon: CheckCircle2, done: true },
    { label: "Work setup completed", icon: CheckCircle2, done: true },
    { label: "Onboarding checklist reviewed", icon: CheckCircle2, done: true }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 relative">
      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <motion.div
            key="transitioning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            <div className="flex flex-col items-center space-y-6">
              <AudioWaveVisualizer isActive={true} />
              <motion.div 
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold">Setting up your dashboard...</h3>
                <p className="text-muted-foreground">This will just take a moment</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">All Set! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                You're ready to go! HR will guide you through your first day.
              </p>
            </div>

            <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
              <Label className="text-sm font-medium">What We've Completed</Label>
              <div className="space-y-2">
                {completedItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs p-2 rounded-lg bg-card border border-border/30"
                    >
                      <Icon className="h-3 w-3 flex-shrink-0 text-green-600" />
                      <span className="text-foreground">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-3">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 <strong>What's next?</strong> Check your email for your first day schedule. 
                Your manager will reach out shortly to welcome you to the team!
              </p>
            </div>

            <Button 
              size="lg" 
              className="w-full mt-3" 
              disabled={externalProcessing}
              onClick={handleFinish}
            >
              {externalProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Go to My Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkerStep7Finish;
