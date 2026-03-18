/**
 * Flow 2 v3 — Wave Visualizer (Future Theme)
 * 
 * Uses the v7 Future teal/green palette (HSL 172°) to match
 * the glassmorphism theme. Scoped to Flow 2 v3 only.
 */

import { motion } from "framer-motion";
import { useState } from "react";

interface F2v3WaveVisualizerProps {
  isActive?: boolean;
  isListening?: boolean;
  isDetectingVoice?: boolean;
}

// Teal/green palette matching v7 glass theme (--primary: 172 28% 42%)
const TEAL_DARK = '#3D7A73';    // hsl(172, 33%, 36%)
const TEAL_MID = '#4D8982';     // hsl(172, 28%, 42%)
const TEAL_LIGHT = '#6BA8A0';   // hsl(172, 24%, 54%)
const TEAL_PALE = '#8CC4BC';    // hsl(172, 26%, 66%)

const F2v3_WaveVisualizer = ({ isActive = false, isListening = false, isDetectingVoice = false }: F2v3WaveVisualizerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isFullyActive = (isActive && !isListening) || (isListening && isDetectingVoice);
  const isIdleBreathing = !isFullyActive && !isListening;

  const waves = [
    { delay: 0, restingHeight: 16, glowIntensity: 0.3 },
    { delay: 0.25, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 0.5, restingHeight: 32, glowIntensity: 0.7 },
    { delay: 0.75, restingHeight: 24, glowIntensity: 0.5 },
    { delay: 1.0, restingHeight: 16, glowIntensity: 0.3 },
  ];

  return (
    <div
      className="relative w-64 h-32 flex items-center justify-center gap-2 group transition-all duration-300"
      style={{ contain: "layout" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          opacity: isIdleBreathing ? [0.5, 0.7, 0.85, 0.7, 0.5] : isFullyActive ? [0.3, 0.6, 0.3] : [0.4, 0.5, 0.4],
          scale: isIdleBreathing ? (isHovered ? [1.05, 1.15, 1.25, 1.15, 1.05] : [1, 1.1, 1.2, 1.1, 1]) : isFullyActive ? [1, 1.2, 1] : [1, 1.05, 1],
        }}
        transition={{ duration: isIdleBreathing ? (isHovered ? 2.5 : 5) : isFullyActive ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 blur-3xl pointer-events-none"
        style={{
          background: isIdleBreathing
            ? `radial-gradient(circle, ${TEAL_MID} 0%, ${TEAL_LIGHT} 30%, ${TEAL_PALE} 55%, ${TEAL_PALE}88 75%, transparent 100%)`
            : 'radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)',
        }}
      />
      {isHovered && isIdleBreathing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.4, 1.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 blur-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${TEAL_DARK} 0%, ${TEAL_LIGHT} 40%, ${TEAL_PALE} 70%, transparent 100%)` }}
        />
      )}
      {waves.map((wave, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full transition-shadow duration-300 motion-reduce:animate-none"
          style={{
            background: `linear-gradient(to bottom, ${TEAL_DARK}, ${TEAL_MID}, ${TEAL_LIGHT}, ${TEAL_PALE})`,
            boxShadow: isIdleBreathing
              ? `0 0 ${12 + (isHovered ? 8 : 0)}px rgba(61, 122, 115, ${wave.glowIntensity + (isHovered ? 0.15 : 0)}), 0 0 ${6 + (isHovered ? 4 : 0)}px rgba(77, 137, 130, ${wave.glowIntensity * 0.6})`
              : isFullyActive ? `0 0 20px hsl(var(--primary) / ${wave.glowIntensity})` : 'none',
            willChange: "height, opacity",
          }}
          animate={{
            height: isIdleBreathing
              ? (isHovered ? [wave.restingHeight * 0.85, wave.restingHeight * 1.1, wave.restingHeight * 1.25, wave.restingHeight * 1.1, wave.restingHeight * 0.85] : [wave.restingHeight * 0.8, wave.restingHeight * 0.95, wave.restingHeight * 1.1, wave.restingHeight * 0.95, wave.restingHeight * 0.8])
              : isFullyActive ? [wave.restingHeight * 1.5, wave.restingHeight * 2.5, wave.restingHeight * 1.8, wave.restingHeight * 2.5, wave.restingHeight * 1.5]
              : isListening ? [8, 12, 8] : [wave.restingHeight * 0.8, wave.restingHeight, wave.restingHeight * 0.8],
            opacity: isIdleBreathing ? (isHovered ? [0.7, 0.85, 1, 0.85, 0.7] : [0.6, 0.75, 0.9, 0.75, 0.6]) : [0.8, 1, 0.8],
          }}
          transition={{
            duration: isIdleBreathing ? (isHovered ? 2.5 : 5) : isFullyActive ? 1.2 : isListening ? 2 : 3,
            repeat: Infinity, ease: "easeInOut", delay: wave.delay,
          }}
        />
      ))}
    </div>
  );
};

export default F2v3_WaveVisualizer;
