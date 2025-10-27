import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentState } from '@/hooks/useAgentState';
import { KurtAgentPanel } from './KurtAgentPanel';

interface AgentLayoutProps {
  children: React.ReactNode;
  context?: string;
}

export const AgentLayout: React.FC<AgentLayoutProps> = ({ children, context }) => {
  const { open, setContext } = useAgentState();

  useEffect(() => {
    if (context) {
      setContext(context);
    }
  }, [context, setContext]);

  return (
    <div className="flex w-full min-h-[calc(100vh-120px)] h-auto">
      {/* Main Content Area - Animated Width */}
      <motion.div
        animate={{
          width: open ? '70%' : '100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="min-h-full"
      >
        {children}
      </motion.div>

      {/* Agent Panel - 30% Width */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            exit={{ width: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="min-h-full"
          >
            <KurtAgentPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
