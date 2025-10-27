import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface WorkerCompletionScreenProps {
  workerName?: string;
}

const WorkerCompletionScreen = ({ workerName = "there" }: WorkerCompletionScreenProps) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#3B82F6']
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    
    toast("Welcome aboard!", {
      description: "Your dashboard is ready. Check your email for next steps.",
      duration: 3000,
    });

    setTimeout(() => {
      navigate('/flows');
    }, 800);
  };

  return (
    <AnimatePresence mode="wait">
      {!isClosing ? (
        <motion.div
          key="completion"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4"
        >
          <div className="max-w-md w-full text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold">Onboarding Complete! 🎉</h1>
              <p className="text-lg text-muted-foreground">
                Welcome to the team, {workerName}!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card/50 border border-border rounded-lg p-6 space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                Your onboarding is complete. HR will guide you through your first day, and you can access your dashboard anytime.
              </p>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Check your email for:
                </p>
                <ul className="text-xs text-muted-foreground text-left mt-2 space-y-1">
                  <li>• First day schedule</li>
                  <li>• Team introduction</li>
                  <li>• Equipment tracking (if applicable)</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => navigate("/flows/candidate-dashboard")}
                size="lg"
                className="w-full"
              >
                Go to Your Dashboard
              </Button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default WorkerCompletionScreen;
