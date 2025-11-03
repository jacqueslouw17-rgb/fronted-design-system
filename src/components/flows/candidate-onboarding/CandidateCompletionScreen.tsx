import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface CandidateCompletionScreenProps {
  candidateName?: string;
}

const CandidateCompletionScreen = ({ candidateName }: CandidateCompletionScreenProps) => {

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
            <h2 className="text-2xl font-bold text-foreground">Form submitted successfully! 🎉</h2>
            <p className="text-muted-foreground">
              Thank you for completing the data collection form. Your information has been received.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateCompletionScreen;
