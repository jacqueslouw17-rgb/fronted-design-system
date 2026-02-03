/**
 * CA4_KurtVisualizer - Interactive frequency pulsing visualizer for Kurt
 * Matches the v3 AudioWaveVisualizer design - blue gradient waves with hover interaction
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCA4Agent } from '@/components/flows/company-admin-v4/CA4_AgentContext';

export const CA4_KurtVisualizer: React.FC = () => {
  const { isOpen, toggleOpen } = useCA4Agent();
  const [isHovered, setIsHovered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Show hint after hovering for 600ms
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered) {
      timer = setTimeout(() => setShowHint(true), 600);
    } else {
      setShowHint(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);
  
  // Wave configuration - 5 bars matching v3 AudioWaveVisualizer
  const waves = [
    { delay: 0, restingHeight: 16, glowIntensity: 0.3 },
    { delay: 0.15, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 0.3, restingHeight: 32, glowIntensity: 0.7 },
    { delay: 0.45, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 0.6, restingHeight: 16, glowIntensity: 0.3 },
  ];

  return (
    <div className="relative flex flex-col items-center">
      {/* Clickable visualizer container */}
      <motion.button
        onClick={() => {
          // Only open the panel, never close it from here (use X button in panel to close)
          if (!isOpen) {
            toggleOpen();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-64 h-32 flex items-center justify-center gap-2 cursor-pointer !border-none !bg-transparent !outline-none focus:!outline-none focus-visible:!outline-none !ring-0 focus:!ring-0 focus-visible:!ring-0 hover:!bg-transparent active:!bg-transparent !shadow-none focus:!shadow-none [&]:!border-0 [&]:!outline-0"
        whileTap={{ scale: 0.98 }}
        aria-label="Ask Kurt - Open AI assistant"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Enhanced breathing glow effect - matches v3 */}
        <motion.div
          animate={{
            opacity: isHovered 
              ? [0.7, 0.9, 1, 0.9, 0.7]
              : [0.4, 0.5, 0.4],
            scale: isHovered 
              ? [1.05, 1.15, 1.2, 1.15, 1.05] 
              : [1, 1.08, 1.15, 1.08, 1],
          }}
          transition={{
            duration: isHovered ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 blur-3xl pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, #3B82F6 0%, #60A5FA 40%, #93C5FD 70%, transparent 100%)',
          }}
        />
        
        {/* Animated wave lines - matching v3 blue gradient */}
        {waves.map((wave, index) => (
          <motion.div
            key={index}
            className="w-1 rounded-full transition-shadow duration-300 motion-reduce:animate-none"
            style={{
              background: `linear-gradient(to bottom, #3B82F6, #60A5FA, #93C5FD)`,
              boxShadow: `0 0 ${10 + (isHovered ? 6 : 0)}px rgba(59, 130, 246, ${wave.glowIntensity + (isHovered ? 0.15 : 0)})`,
              willChange: 'height, opacity',
            }}
            animate={{
              height: isHovered
                ? [wave.restingHeight * 0.9, wave.restingHeight * 1.15, wave.restingHeight * 1.3, wave.restingHeight * 1.15, wave.restingHeight * 0.9]
                : [wave.restingHeight * 0.85, wave.restingHeight, wave.restingHeight * 1.1, wave.restingHeight, wave.restingHeight * 0.85],
              opacity: isHovered
                ? [0.75, 0.9, 1, 0.9, 0.75]
                : [0.7, 0.85, 1, 0.85, 0.7],
            }}
            transition={{
              duration: isHovered ? 1.5 : 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: wave.delay,
            }}
          />
        ))}

        {/* Custom premium hint - fades in on hover */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div 
                className="px-3 py-1.5 rounded-full overflow-hidden text-[11px] font-medium tracking-wide text-white/90 whitespace-nowrap backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(96, 165, 250, 0.25) 100%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)',
                }}
              >
                tap to chat
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
