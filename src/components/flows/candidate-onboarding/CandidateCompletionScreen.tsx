import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CandidateCompletionScreenProps {
  candidateName?: string;
}

const CandidateCompletionScreen = ({ candidateName }: CandidateCompletionScreenProps) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    // Auto-transition to dashboard after 2 seconds
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        navigate('/candidate-dashboard');
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isClosing ? (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full"
          >
            <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6 shadow-lg">
              {/* Green Check Icon */}
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">You're all set 🎉</h2>
                <p className="text-muted-foreground">
                  Thanks for completing onboarding. We're finalizing your workspace.
                </p>
              </div>

              {/* Dashboard preview skeleton */}
              <div className="space-y-3 pt-2">
                <div className="h-12 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded animate-pulse" />
                <div className="h-8 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 rounded animate-pulse" />
                <div className="h-8 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30 rounded animate-pulse" />
              </div>
              
              <p className="text-xs text-center text-muted-foreground pt-2">
                Loading your dashboard...
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CandidateCompletionScreen;
