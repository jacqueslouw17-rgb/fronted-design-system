import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentState } from '@/hooks/useAgentState';

interface FloatingKurtButtonProps {
  className?: string;
}

export const FloatingKurtButton: React.FC<FloatingKurtButtonProps> = ({ className = '' }) => {
  const { open, setOpen } = useAgentState();

  return (
    <>
      {/* Show button only on mobile/tablet when panel is closed */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed bottom-4 right-4 z-50 lg:hidden ${className}`}
          >
            <Button
              size="icon"
              onClick={() => setOpen(true)}
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all touch-manipulation"
              aria-label="Open Kurt Assistant"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button for mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-20 right-4 z-50 lg:hidden"
          >
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all touch-manipulation"
              aria-label="Close Kurt Assistant"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingKurtButton;
