/**
 * F1v7_KurtVisualizer — Ambient frequency visualizer to open Kurt
 * Teal glassmorphism-themed, fixed bottom-right when Kurt panel is closed.
 * Hover to reveal hint, click to open Kurt.
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface F1v7_KurtVisualizerProps {
  onOpen: () => void;
  isKurtOpen: boolean;
}

export const F1v7_KurtVisualizer: React.FC<F1v7_KurtVisualizerProps> = ({ onOpen, isKurtOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isHovered) {
      timer = setTimeout(() => setShowHint(true), 500);
    } else {
      setShowHint(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered]);

  // 5 wave bars — teal palette matching v7 glassmorphism
  const waves = [
    { delay: 0, restHeight: 14, glow: 0.25 },
    { delay: 0.12, restHeight: 22, glow: 0.4 },
    { delay: 0.24, restHeight: 30, glow: 0.6 },
    { delay: 0.36, restHeight: 22, glow: 0.4 },
    { delay: 0.48, restHeight: 14, glow: 0.25 },
  ];

  if (isKurtOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-center"
    >
      {/* Hint label */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 pointer-events-none"
          >
            <div
              className="px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide whitespace-nowrap"
              style={{
                color: "hsl(172 28% 92%)",
                background: "linear-gradient(135deg, hsl(172 28% 42% / 0.35), hsl(172 40% 50% / 0.2))",
                backdropFilter: "blur(16px) saturate(1.4)",
                boxShadow: "0 0 24px hsl(172 28% 42% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
                border: "1px solid hsl(172 28% 60% / 0.15)",
              }}
            >
              Tap to chat
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualizer button */}
      <motion.button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.94 }}
        className="relative w-16 h-16 flex items-center justify-center gap-[3px] cursor-pointer rounded-full"
        style={{
          background: "linear-gradient(135deg, hsl(172 28% 42% / 0.08), hsl(172 40% 50% / 0.04), hsl(0 0% 100% / 0.4))",
          backdropFilter: "blur(24px) saturate(1.5)",
          border: "1px solid hsl(172 28% 60% / 0.12)",
          boxShadow: "0 4px 24px hsl(172 28% 42% / 0.1), 0 1px 3px hsl(0 0% 0% / 0.04), inset 0 1px 0 hsl(0 0% 100% / 0.5)",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Open Kurt AI assistant"
      >
        {/* Breathing ambient glow */}
        <motion.div
          animate={{
            opacity: isHovered ? [0.5, 0.8, 0.5] : [0.2, 0.35, 0.2],
            scale: isHovered ? [1, 1.3, 1] : [1, 1.15, 1],
          }}
          transition={{ duration: isHovered ? 1.8 : 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(172 28% 42%), hsl(172 40% 55% / 0.6), transparent)",
          }}
        />

        {/* Iridescent ring on hover */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "conic-gradient(from 0deg, hsl(172 28% 42% / 0.15), hsl(200 50% 55% / 0.1), hsl(260 40% 60% / 0.08), hsl(172 28% 42% / 0.15))",
            border: "1px solid hsl(172 28% 60% / 0.2)",
            borderRadius: "9999px",
          }}
        />

        {/* Wave bars */}
        {waves.map((wave, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full relative z-10"
            style={{
              background: "linear-gradient(to top, hsl(172 28% 42%), hsl(172 40% 55%), hsl(172 50% 70%))",
              boxShadow: `0 0 ${8 + (isHovered ? 4 : 0)}px hsl(172 28% 42% / ${wave.glow + (isHovered ? 0.15 : 0)})`,
            }}
            animate={{
              height: isHovered
                ? [wave.restHeight * 0.8, wave.restHeight * 1.2, wave.restHeight * 1.4, wave.restHeight * 1.2, wave.restHeight * 0.8]
                : [wave.restHeight * 0.7, wave.restHeight, wave.restHeight * 1.1, wave.restHeight, wave.restHeight * 0.7],
              opacity: isHovered ? [0.7, 0.95, 1, 0.95, 0.7] : [0.5, 0.7, 0.85, 0.7, 0.5],
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
    </motion.div>
  );
};
