import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCA4Agent } from './CA4_AgentContext';

export const CA4_AskKurtButton: React.FC = () => {
  const { isOpen, toggleOpen } = useCA4Agent();

  if (isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center"
    >
      <Button
        onClick={toggleOpen}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
      >
        <Sparkles className="h-4 w-4" />
        Ask Kurt
      </Button>
    </motion.div>
  );
};
