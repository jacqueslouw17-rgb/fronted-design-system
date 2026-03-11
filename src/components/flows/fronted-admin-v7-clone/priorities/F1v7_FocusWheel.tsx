/**
 * Focus Wheel — 3D perspective carousel
 * The center card is the NOW. Everything else dissolves.
 */
import React, { useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { PriorityItem } from "./F1v7_PriorityData";

interface Props {
  items: PriorityItem[];
  activeIndex: number;
  direction: number;
  onSelect: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const F1v7_FocusWheel: React.FC<Props> = ({
  items,
  activeIndex,
  direction,
  onSelect,
  onNext,
  onPrev,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePan = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 40) {
      if (info.offset.y < 0) onNext();
      else onPrev();
    }
  };

  // Show slots: -2, -1, 0 (active), +1, +2
  const slots = [-2, -1, 0, 1, 2];

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Navigation arrows */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        <button
          onClick={onPrev}
          disabled={activeIndex === 0}
          className="p-2 rounded-2xl transition-all duration-300 disabled:opacity-0"
          style={{
            background: "hsl(0 0% 100% / 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(0 0% 100% / 0.4)",
          }}
        >
          <ArrowUp className="h-3.5 w-3.5" style={{ color: "hsl(210 8% 40%)" }} />
        </button>
        <button
          onClick={onNext}
          disabled={activeIndex === items.length - 1}
          className="p-2 rounded-2xl transition-all duration-300 disabled:opacity-0"
          style={{
            background: "hsl(0 0% 100% / 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(0 0% 100% / 0.4)",
          }}
        >
          <ArrowDown className="h-3.5 w-3.5" style={{ color: "hsl(210 8% 40%)" }} />
        </button>
      </div>

      {/* The wheel container */}
      <motion.div
        ref={containerRef}
        onPanEnd={handlePan}
        className="relative flex flex-col items-center"
        style={{
          transformStyle: "preserve-3d",
          minHeight: "280px",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {slots.map((slot) => {
            const idx = activeIndex + slot;
            if (idx < 0 || idx >= items.length) return null;
            const item = items[idx];
            const isActive = slot === 0;
            const Icon = item.icon;

            // Position & transforms
            const yOffset = slot * 68;
            const scale = isActive ? 1 : slot === -1 || slot === 1 ? 0.82 : 0.68;
            const opacity = isActive ? 1 : slot === -1 || slot === 1 ? 0.45 : 0.15;
            const rotateX = slot * -8;
            const blur = isActive ? 0 : Math.abs(slot) * 4;
            const zIndex = 10 - Math.abs(slot);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{
                  y: direction > 0 ? 120 : -120,
                  scale: 0.7,
                  opacity: 0,
                  rotateX: direction > 0 ? -15 : 15,
                }}
                animate={{
                  y: yOffset,
                  scale,
                  opacity,
                  rotateX,
                  filter: `blur(${blur}px)`,
                }}
                exit={{
                  y: direction > 0 ? -120 : 120,
                  scale: 0.7,
                  opacity: 0,
                  rotateX: direction > 0 ? 15 : -15,
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute left-0 right-0 cursor-pointer"
                style={{
                  zIndex,
                  transformOrigin: "center center",
                }}
                onClick={() => !isActive && onSelect(idx)}
              >
                <div
                  className={`mx-auto relative overflow-hidden transition-shadow duration-500 ${
                    isActive ? "max-w-full" : "max-w-[92%]"
                  }`}
                  style={{
                    background: isActive
                      ? `linear-gradient(160deg, hsl(0 0% 100% / 0.72), hsl(0 0% 100% / 0.45))`
                      : `linear-gradient(160deg, hsl(0 0% 100% / 0.35), hsl(0 0% 100% / 0.15))`,
                    backdropFilter: isActive ? "blur(60px) saturate(1.8)" : "blur(30px) saturate(1.2)",
                    borderRadius: isActive ? "28px" : "22px",
                    border: `1px solid ${isActive ? item.accentColor + "20" : "hsl(0 0% 100% / 0.3)"}`,
                    boxShadow: isActive
                      ? `0 20px 60px -15px hsl(0 0% 0% / 0.08), 0 0 0 1px hsl(0 0% 100% / 0.4) inset, 0 0 80px -20px ${item.accentColor}08`
                      : "none",
                    padding: isActive ? "28px 32px" : "14px 24px",
                  }}
                >
                  {/* Prismatic top edge — active only */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent 5%, ${item.accentColor}50 25%, hsl(260 60% 70% / 0.3) 50%, ${item.accentColor}30 75%, transparent 95%)`,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="flex items-start gap-4">
                    {/* Icon orb */}
                    <div
                      className="shrink-0 flex items-center justify-center transition-all duration-500"
                      style={{
                        width: isActive ? 52 : 36,
                        height: isActive ? 52 : 36,
                        borderRadius: isActive ? "18px" : "12px",
                        background: `${item.accentColor}${isActive ? "0C" : "06"}`,
                        border: `1px solid ${item.accentColor}${isActive ? "15" : "08"}`,
                      }}
                    >
                      <Icon
                        style={{
                          color: item.accentColor,
                          width: isActive ? 22 : 16,
                          height: isActive ? 22 : 16,
                          opacity: isActive ? 0.9 : 0.5,
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Count + label */}
                      <div className="flex items-baseline gap-3">
                        <motion.span
                          className="font-extralight leading-none tracking-[-0.04em] tabular-nums"
                          style={{
                            color: item.accentColor,
                            fontSize: isActive ? "44px" : "24px",
                            opacity: isActive ? 1 : 0.6,
                          }}
                        >
                          {item.count}
                        </motion.span>
                        <span
                          className="font-medium tracking-[-0.01em]"
                          style={{
                            color: isActive ? "hsl(210 8% 12%)" : "hsl(210 8% 40%)",
                            fontSize: isActive ? "15px" : "12px",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Tagline — active only */}
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="text-[12px] leading-relaxed mt-2"
                          style={{ color: "hsl(210 8% 42%)" }}
                        >
                          {item.tagline}
                        </motion.p>
                      )}
                    </div>

                    {/* Severity badge — active only */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: `${item.accentColor}0A`,
                          border: `1px solid ${item.accentColor}12`,
                        }}
                      >
                        <motion.div
                          animate={
                            item.severity === "critical"
                              ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }
                              : {}
                          }
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: item.accentColor }}
                        />
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.12em]"
                          style={{ color: item.accentColor }}
                        >
                          {item.severity}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
