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
    <div className="flex w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex-col lg:flex-row overflow-hidden">
      {/* Main Content Area - Animated Width on desktop, full width on mobile */}
      <motion.div
        animate={{
          width: open && window.innerWidth >= 1024 ? '70%' : '100%',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="h-full w-full lg:w-auto overflow-y-auto"
      >
        {children}
      </motion.div>

      {/* Agent Panel - Desktop: 30% sidebar, Mobile: Full overlay drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Desktop: Side panel */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: window.innerWidth >= 1024 ? '30%' : 0 }}
              exit={{ width: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="h-full hidden lg:block overflow-hidden"
            >
              <KurtAgentPanel />
            </motion.div>

            {/* Mobile/Tablet: Full overlay */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 top-14 sm:top-16 z-40 bg-background lg:hidden overflow-hidden"
            >
              <KurtAgentPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
