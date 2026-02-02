/**
 * CA4_KurtVisualizer - Interactive frequency pulsing visualizer for Kurt
 * Matches the v3 AudioWaveVisualizer design - blue gradient waves with hover interaction
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCA4Agent } from './CA4_AgentContext';

export const CA4_KurtVisualizer: React.FC = () => {
  const { isOpen, toggleOpen } = useCA4Agent();
  const [isHovered, setIsHovered] = useState(false);
  
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
        onClick={toggleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-64 h-32 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-2xl group transition-all duration-300"
        whileTap={{ scale: 0.98 }}
        style={{ contain: 'layout' }}
        aria-label="Ask Kurt - Open AI assistant"
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

        {/* Interactive hover ripple */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.4, 1.6],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 blur-2xl pointer-events-none"
              style={{ 
                background: 'radial-gradient(circle, #60A5FA 0%, #93C5FD 50%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

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
      </motion.button>

      {/* "Ask Kurt" tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-sm font-medium text-primary/80">
              Ask Kurt
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
