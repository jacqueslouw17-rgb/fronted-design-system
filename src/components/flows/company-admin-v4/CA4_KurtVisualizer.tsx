/**
 * CA4_KurtVisualizer - Interactive frequency pulsing visualizer for Kurt
 * Hover reveals "Ask Kurt" tooltip, click opens chat panel
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCA4Agent } from './CA4_AgentContext';

export const CA4_KurtVisualizer: React.FC = () => {
  const { isOpen, toggleOpen } = useCA4Agent();
  const [isHovered, setIsHovered] = useState(false);
  
  // Wave configuration - 5 bars with different heights and delays
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
        onClick={toggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-48 h-24 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-2xl"
        whileTap={{ scale: 0.98 }}
        style={{ contain: 'layout' }}
        aria-label="Ask Kurt - Open AI assistant"
      >
        {/* Breathing glow effect */}
        <motion.div
          animate={{
            opacity: isHovered ? [0.5, 0.8, 1, 0.8, 0.5] : [0.4, 0.6, 0.8, 0.6, 0.4],
            scale: isHovered ? [1.1, 1.25, 1.35, 1.25, 1.1] : [1, 1.1, 1.2, 1.1, 1],
          }}
          transition={{
            duration: isHovered ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 blur-3xl pointer-events-none rounded-full"
          style={{ 
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.2) 50%, transparent 100%)',
          }}
        />

        {/* Hover ripple effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                scale: [0.8, 1.5, 1.8],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 blur-2xl pointer-events-none"
              style={{ 
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.3) 50%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Wave bars */}
        {waves.map((wave, index) => (
          <motion.div
            key={index}
            className="w-1 rounded-full"
            style={{
              background: `linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.5))`,
              boxShadow: `0 0 ${8 + (isHovered ? 8 : 0)}px hsl(var(--primary) / ${wave.glowIntensity + (isHovered ? 0.2 : 0)})`,
              willChange: 'height, opacity',
            }}
            animate={{
              height: isHovered
                ? [wave.restingHeight * 1.1, wave.restingHeight * 1.5, wave.restingHeight * 1.8, wave.restingHeight * 1.5, wave.restingHeight * 1.1]
                : [wave.restingHeight * 0.85, wave.restingHeight, wave.restingHeight * 1.15, wave.restingHeight, wave.restingHeight * 0.85],
              opacity: isHovered
                ? [0.8, 0.95, 1, 0.95, 0.8]
                : [0.6, 0.8, 0.9, 0.8, 0.6],
            }}
            transition={{
              duration: isHovered ? 1.2 : 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: wave.delay,
            }}
          />
        ))}
      </motion.button>

      {/* "Ask Kurt" tooltip that appears on hover */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-sm font-medium text-primary">
              Ask Kurt
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
