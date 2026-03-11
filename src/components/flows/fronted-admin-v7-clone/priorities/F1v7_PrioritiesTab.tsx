/**
 * Priorities Tab — The Focus Wheel
 * Not a dashboard. A single-focus action surface.
 * One priority at a time. The rest dissolve.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { F1v7_FocusWheel } from "./F1v7_FocusWheel";
import { F1v7_FocusDetail } from "./F1v7_FocusDetail";
import { PRIORITY_STREAM, type PriorityItem } from "./F1v7_PriorityData";

export const F1v7_PrioritiesTab: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const activePriority = PRIORITY_STREAM[activeIndex];

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(PRIORITY_STREAM.length - 1, idx));
    setDirection(clamped > activeIndex ? 1 : -1);
    setActiveIndex(clamped);
  }, [activeIndex]);

  const goNext = useCallback(() => {
    if (activeIndex < PRIORITY_STREAM.length - 1) {
      setDirection(1);
      setActiveIndex(prev => prev + 1);
    }
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      setDirection(-1);
      setActiveIndex(prev => prev - 1);
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-[85vh] flex flex-col"
    >
      {/* Ambient background — reacts to current priority severity */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePriority.severity}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            {/* Central radial glow */}
            <div
              className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
              style={{
                background: `radial-gradient(ellipse, ${activePriority.accentColor}06, transparent 65%)`,
                filter: "blur(80px)",
              }}
            />
            {/* Horizon line — architectural reference */}
            <div
              className="absolute top-[38%] left-0 right-0 h-px opacity-[0.06]"
              style={{
                background: `linear-gradient(90deg, transparent 5%, ${activePriority.accentColor}40 30%, ${activePriority.accentColor}60 50%, ${activePriority.accentColor}40 70%, transparent 95%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Top: Status bar ─── */}
      <div className="flex items-center justify-between px-1 mb-8">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: activePriority.accentColor }}
          />
          <span
            className="text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "hsl(210 8% 45%)" }}
          >
            {PRIORITY_STREAM.length} priorities requiring action
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "hsl(210 8% 30%)" }}>
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-[10px]" style={{ color: "hsl(210 8% 65%)" }}>/</span>
          <span className="text-[10px] tabular-nums" style={{ color: "hsl(210 8% 65%)" }}>
            {String(PRIORITY_STREAM.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ─── The Wheel ─── */}
      <F1v7_FocusWheel
        items={PRIORITY_STREAM}
        activeIndex={activeIndex}
        direction={direction}
        onSelect={goTo}
        onNext={goNext}
        onPrev={goPrev}
      />

      {/* ─── Progress dots ─── */}
      <div className="flex items-center justify-center gap-2 my-6">
        {PRIORITY_STREAM.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => goTo(idx)}
            className="relative group p-1"
          >
            <motion.div
              animate={{
                width: idx === activeIndex ? 28 : 6,
                backgroundColor: idx === activeIndex ? item.accentColor : "hsl(210, 8%, 82%)",
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-[5px] rounded-full"
            />
            {idx === activeIndex && (
              <motion.div
                layoutId="dot-glow"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${item.accentColor}25, transparent 70%)`,
                  filter: "blur(4px)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── Below: Contextual detail for focused priority ─── */}
      <F1v7_FocusDetail
        priority={activePriority}
        direction={direction}
      />
    </motion.div>
  );
};
