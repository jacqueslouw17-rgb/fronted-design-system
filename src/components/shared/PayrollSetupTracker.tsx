import { useState, useEffect } from "react";
import { CheckCircle2, Clock, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface TrackerStep {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "pending";
  delay?: number;
}

interface PayrollSetupTrackerProps {
  onComplete?: () => void;
}

const PayrollSetupTracker = ({ onComplete }: PayrollSetupTrackerProps) => {
  const [steps, setSteps] = useState<TrackerStep[]>([
    { id: "1", label: "Payroll details received", status: "pending" },
    { id: "2", label: "Verification in progress", status: "pending" },
    { id: "3", label: "Configuration complete", status: "pending" },
  ]);

  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // Step 1: Details received
    const timer1 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === "1" ? { ...s, status: "completed" as const } : s));
      setProgress(33);
      setCurrentMessage("Payroll details received ✓");
    }, 800);

    // Step 2: Verification
    const timer2 = setTimeout(() => {
      setSteps(prev => prev.map(s => 
        s.id === "2" ? { ...s, status: "in-progress" as const } : s
      ));
      setProgress(50);
      setCurrentMessage("Verifying information...");
    }, 2000);

    const timer3 = setTimeout(() => {
      setSteps(prev => prev.map(s => 
        s.id === "2" ? { ...s, status: "completed" as const } : s
      ));
      setProgress(66);
      setCurrentMessage("Verification complete ✓");
    }, 3500);

    // Step 3: Complete
    const timer4 = setTimeout(() => {
      setSteps(prev => prev.map(s => 
        s.id === "3" ? { ...s, status: "in-progress" as const } : s
      ));
      setProgress(85);
      setCurrentMessage("Finalizing configuration...");
    }, 4500);

    const timer5 = setTimeout(() => {
      setSteps(prev => prev.map(s => 
        s.id === "3" ? { ...s, status: "completed" as const } : s
      ));
      setProgress(100);
      setCurrentMessage("All set! 🎉");
      onComplete?.();
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  const getStepIcon = (status: TrackerStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      case "pending":
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Payroll Setup Tracker
          {progress === 100 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <PartyPopper className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          We're setting up your payroll system
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex-shrink-0">
              {getStepIcon(step.status)}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                step.status === "completed" 
                  ? "text-foreground font-medium" 
                  : step.status === "in-progress"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}>
                {step.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-center text-muted-foreground"
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-center text-muted-foreground">
          We'll notify you as soon as your first payroll cycle is ready for review.
        </p>
      </div>
    </Card>
  );
};

export default PayrollSetupTracker;
