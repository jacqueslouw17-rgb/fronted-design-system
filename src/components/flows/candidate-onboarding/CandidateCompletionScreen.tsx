import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "@/hooks/use-toast";
import KurtAvatar from "@/components/KurtAvatar";

interface CandidateCompletionScreenProps {
  candidateName?: string;
}

const CandidateCompletionScreen = ({ candidateName }: CandidateCompletionScreenProps) => {
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

  const handleClose = () => {
    setIsClosing(true);
    
    setTimeout(() => {
      // Show Genie toast
      toast({
        description: (
          <div className="flex items-center gap-2">
            <KurtAvatar size="sm" />
            <span>I'll notify you once your contract is ready for review!</span>
          </div>
        ),
        duration: 3000,
      });

      // Close tab or redirect after toast appears
      setTimeout(() => {
        // Try to close the tab/window (works if opened by script)
        window.close();
        
        // Fallback: redirect to a thank you page or login
        setTimeout(() => {
          window.location.href = '/auth';
        }, 500);
      }, 500);
    }, 300);
  };

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
                <h2 className="text-2xl font-bold text-foreground">All Set!</h2>
                <p className="text-muted-foreground">
                  Thanks! We're preparing your contract. You'll receive an email shortly with next steps.
                </p>
              </div>

              {/* Close Button */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CandidateCompletionScreen;
