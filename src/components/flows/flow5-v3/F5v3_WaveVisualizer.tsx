/**
 * Flow 5 v3 — Teal Wave Visualizer (Future Theme)
 * 
 * Matches the v7 Future glassmorphism teal palette (hsl 172 28% 42%).
 * DO NOT modify AudioWaveVisualizer or any other flow's visualizer.
 */

import { motion } from "framer-motion";
import { useState } from "react";

interface F5v3WaveVisualizerProps {
  isActive?: boolean;
}

const F5v3_WaveVisualizer = ({ isActive = false }: F5v3WaveVisualizerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const waves = [
    { delay: 0, restingHeight: 14, glowIntensity: 0.25 },
    { delay: 0.25, restingHeight: 22, glowIntensity: 0.4 },
    { delay: 0.5, restingHeight: 28, glowIntensity: 0.55 },
    { delay: 0.75, restingHeight: 22, glowIntensity: 0.4 },
    { delay: 1.0, restingHeight: 14, glowIntensity: 0.25 },
  ];

  // Teal palette matching v7 Future theme
  const tealBase = "hsl(172 28% 42%)";
  const tealLight = "hsl(172 32% 56%)";
  const tealGlow = "hsl(172 38% 68%)";
  const tealMuted = "hsl(172 22% 78%)";

  return (
    <div
      className="relative w-48 h-24 flex items-center justify-center gap-2 group transition-all duration-300"
      style={{ contain: "layout" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Breathing glow — teal */}
      <motion.div
        animate={{
          opacity: isActive
            ? [0.3, 0.5, 0.3]
            : [0.35, 0.5, 0.65, 0.5, 0.35],
          scale: isActive
            ? [1, 1.2, 1]
            : isHovered
            ? [1.05, 1.15, 1.25, 1.15, 1.05]
            : [1, 1.08, 1.16, 1.08, 1],
        }}
        transition={{
          duration: isActive ? 1.2 : isHovered ? 2.5 : 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${tealBase} 0%, ${tealLight} 30%, ${tealGlow} 55%, ${tealMuted} 75%, transparent 100%)`,
          opacity: 0.4,
        }}
      />

      {/* Hover ripple — teal */}
      {isHovered && !isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.3, 1.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${tealBase} 0%, ${tealLight} 40%, ${tealGlow} 70%, transparent 100%)`,
          }}
        />
      )}

      {/* Wave bars — teal gradient */}
      {waves.map((wave, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full motion-reduce:animate-none"
          style={{
            background: `linear-gradient(to bottom, ${tealBase}, ${tealLight}, ${tealGlow}, ${tealMuted})`,
            boxShadow: isActive
              ? `0 0 16px hsl(172 28% 42% / ${wave.glowIntensity})`
              : `0 0 ${10 + (isHovered ? 6 : 0)}px hsl(172 28% 42% / ${wave.glowIntensity + (isHovered ? 0.1 : 0)}), 0 0 ${5 + (isHovered ? 3 : 0)}px hsl(172 32% 56% / ${wave.glowIntensity * 0.5})`,
            willChange: "height, opacity",
          }}
          animate={{
            height: isActive
              ? [
                  wave.restingHeight * 1.5,
                  wave.restingHeight * 2.5,
                  wave.restingHeight * 1.8,
                  wave.restingHeight * 2.5,
                  wave.restingHeight * 1.5,
                ]
              : isHovered
              ? [
                  wave.restingHeight * 0.85,
                  wave.restingHeight * 1.1,
                  wave.restingHeight * 1.25,
                  wave.restingHeight * 1.1,
                  wave.restingHeight * 0.85,
                ]
              : [
                  wave.restingHeight * 0.8,
                  wave.restingHeight * 0.95,
                  wave.restingHeight * 1.1,
                  wave.restingHeight * 0.95,
                  wave.restingHeight * 0.8,
                ],
            opacity: isActive
              ? [0.8, 1, 0.8]
              : isHovered
              ? [0.6, 0.8, 0.95, 0.8, 0.6]
              : [0.5, 0.65, 0.8, 0.65, 0.5],
          }}
          transition={{
            duration: isActive ? 1.2 : isHovered ? 2.5 : 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: wave.delay,
          }}
        />
      ))}
    </div>
  );
};

export default F5v3_WaveVisualizer;
