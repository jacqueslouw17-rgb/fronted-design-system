/**
 * Focus Wheel — card stack carousel
 * Active card in center, adjacent cards peek behind with subtle depth.
 */
import React, { useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
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
    if (Math.abs(info.offset.y) > 35) {
      if (info.offset.y < 0) onNext();
      else onPrev();
    }
  };

  const slots = [-2, -1, 0, 1, 2];

  return (
    <div className="relative">
      {/* Side nav arrows */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
        <button
          onClick={onPrev}
          disabled={activeIndex === 0}
          className="p-1.5 rounded-xl transition-all duration-300 disabled:opacity-0 hover:scale-110"
          style={{
            background: "hsl(0 0% 100% / 0.5)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(0 0% 100% / 0.3)",
          }}
        >
          <ChevronUp className="h-3 w-3" style={{ color: "hsl(210 8% 35%)" }} />
        </button>
        <button
          onClick={onNext}
          disabled={activeIndex === items.length - 1}
          className="p-1.5 rounded-xl transition-all duration-300 disabled:opacity-0 hover:scale-110"
          style={{
            background: "hsl(0 0% 100% / 0.5)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(0 0% 100% / 0.3)",
          }}
        >
          <ChevronDown className="h-3 w-3" style={{ color: "hsl(210 8% 35%)" }} />
        </button>
      </div>

      {/* Stack container */}
      <motion.div
        ref={containerRef}
        onPanEnd={handlePan}
        className="relative mx-auto"
        style={{ height: "130px", maxWidth: "680px" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {slots.map((slot) => {
            const idx = activeIndex + slot;
            if (idx < 0 || idx >= items.length) return null;
            const item = items[idx];
            const isActive = slot === 0;
            const Icon = item.icon;
            const absSlot = Math.abs(slot);

            // Card stack: active on top, others peek behind with narrower width + offset
            const yOffset = slot * 8; // very tight vertical peek
            const widthShrink = isActive ? 0 : absSlot === 1 ? 24 : 48; // px narrower on each side
            const scale = 1; // no scaling, use width narrowing instead
            const opacity = isActive ? 1 : absSlot === 1 ? 0.55 : 0.2;
            const zIndex = 10 - absSlot;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{
                  y: direction > 0 ? 80 : -80,
                  opacity: 0,
                }}
                animate={{
                  y: yOffset,
                  opacity,
                }}
                exit={{
                  y: direction > 0 ? -80 : 80,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute cursor-pointer"
                style={{
                  zIndex,
                  left: widthShrink,
                  right: widthShrink,
                  top: isActive ? 12 : absSlot === 1 ? 4 : 0,
                }}
                onClick={() => !isActive && onSelect(idx)}
              >
                <div
                  className="relative overflow-hidden transition-all duration-500"
                  style={{
                    background: isActive
                      ? "linear-gradient(160deg, hsl(0 0% 100% / 0.85), hsl(0 0% 100% / 0.6))"
                      : "linear-gradient(160deg, hsl(0 0% 100% / 0.35), hsl(0 0% 100% / 0.15))",
                    backdropFilter: isActive ? "blur(60px) saturate(2)" : "blur(20px) saturate(1.1)",
                    borderRadius: isActive ? "20px" : "16px",
                    border: `1px solid ${isActive ? item.accentColor + "20" : "hsl(0 0% 100% / 0.2)"}`,
                    boxShadow: isActive
                      ? `0 12px 40px -10px hsl(0 0% 0% / 0.08), 0 0 0 1px hsl(0 0% 100% / 0.5) inset`
                      : `0 2px 12px -4px hsl(0 0% 0% / 0.04)`,
                    padding: isActive ? "18px 24px" : "10px 20px",
                  }}
                >
                  {/* Prismatic top edge */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent 3%, ${item.accentColor}50 20%, hsl(260 60% 70% / 0.3) 50%, ${item.accentColor}35 80%, transparent 97%)`,
                        transformOrigin: "left center",
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="flex items-center gap-4">
                    <div
                      className="shrink-0 flex items-center justify-center transition-all duration-500"
                      style={{
                        width: isActive ? 42 : 28,
                        height: isActive ? 42 : 28,
                        borderRadius: isActive ? "12px" : "8px",
                        background: `${item.accentColor}${isActive ? "0C" : "06"}`,
                        border: `1px solid ${item.accentColor}${isActive ? "18" : "0A"}`,
                      }}
                    >
                      <Icon
                        style={{
                          color: item.accentColor,
                          width: isActive ? 18 : 12,
                          height: isActive ? 18 : 12,
                          opacity: isActive ? 0.9 : 0.5,
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span
                          className="font-extralight leading-none tracking-[-0.04em] tabular-nums transition-all duration-500"
                          style={{
                            color: item.accentColor,
                            fontSize: isActive ? "32px" : "18px",
                            opacity: isActive ? 1 : 0.6,
                          }}
                        >
                          {item.count}
                        </span>
                        <span
                          className="font-medium tracking-[-0.01em] transition-all duration-500"
                          style={{
                            color: isActive ? "hsl(210 8% 12%)" : "hsl(210 8% 50%)",
                            fontSize: isActive ? "14px" : "11px",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>

                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="text-[12px] leading-relaxed mt-0.5"
                          style={{ color: "hsl(210 8% 42%)" }}
                        >
                          {item.tagline}
                        </motion.p>
                      )}
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.12, duration: 0.35 }}
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
