/**
 * Focus Wheel — stacked card carousel with visible glass depth
 * Active card on top. Cards behind peek their edges above & below.
 * Clicking the active card advances to the next priority.
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

      {/* Stack container — enough height for peek cards */}
      <motion.div
        ref={containerRef}
        onPanEnd={handlePan}
        className="relative mx-auto"
        style={{ height: "150px", maxWidth: "680px" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {slots.map((slot) => {
            const idx = activeIndex + slot;
            if (idx < 0 || idx >= items.length) return null;
            const item = items[idx];
            const isActive = slot === 0;
            const Icon = item.icon;
            const absSlot = Math.abs(slot);

            // Active card sits at y=20. Behind cards peek above/below.
            // slot -1 peeks its bottom edge above → y = 6
            // slot -2 peeks even higher → y = -2
            // slot +1 peeks its top edge below → y = 104
            // slot +2 peeks even lower → y = 112
            let yPos: number;
            if (isActive) {
              yPos = 20;
            } else if (slot < 0) {
              yPos = absSlot === 1 ? 6 : -2;
            } else {
              yPos = absSlot === 1 ? 104 : 112;
            }

            const widthShrink = isActive ? 0 : absSlot === 1 ? 16 : 32;
            const opacity = isActive ? 1 : absSlot === 1 ? 0.65 : 0.3;
            const zIndex = 10 - absSlot;
            const cardHeight = isActive ? "auto" : absSlot === 1 ? "40px" : "28px";

            return (
              <motion.div
                key={item.id}
                layout
                initial={{
                  y: direction > 0 ? 120 : -60,
                  opacity: 0,
                }}
                animate={{
                  y: yPos,
                  opacity,
                }}
                exit={{
                  y: direction > 0 ? -60 : 120,
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
                }}
                onClick={() => {
                  if (isActive) {
                    // Clicking active card → go to next
                    onNext();
                  } else {
                    onSelect(idx);
                  }
                }}
              >
                <div
                  className="relative overflow-hidden transition-all duration-500"
                  style={{
                    height: cardHeight,
                    background: isActive
                      ? "linear-gradient(160deg, hsl(0 0% 100% / 0.88), hsl(0 0% 100% / 0.65))"
                      : `linear-gradient(160deg, hsl(0 0% 100% / ${absSlot === 1 ? 0.5 : 0.3}), hsl(0 0% 100% / ${absSlot === 1 ? 0.3 : 0.15}))`,
                    backdropFilter: isActive
                      ? "blur(60px) saturate(2)"
                      : `blur(${absSlot === 1 ? 30 : 15}px) saturate(1.2)`,
                    borderRadius: isActive ? "20px" : `${16 - absSlot * 2}px`,
                    border: isActive
                      ? `1px solid ${item.accentColor}20`
                      : `1px solid hsl(0 0% 100% / ${absSlot === 1 ? 0.35 : 0.2})`,
                    boxShadow: isActive
                      ? `0 3px 10px -6px hsl(0 0% 0% / 0.02), inset 0 1px 0 hsl(0 0% 100% / 0.6)`
                      : `0 ${absSlot === 1 ? 1 : 0}px ${absSlot === 1 ? 3 : 1}px hsl(0 0% 0% / 0.01)`,
                    padding: isActive ? "18px 24px" : undefined,
                  }}
                >
                  {/* Glass reflection line on non-active cards */}
                  {!isActive && (
                    <div
                      className="absolute left-[8%] right-[8%]"
                      style={{
                        top: slot < 0 ? undefined : "0px",
                        bottom: slot < 0 ? undefined : undefined,
                        height: "1px",
                        ...(slot < 0 ? { bottom: "0px" } : { top: "0px" }),
                        background: `linear-gradient(90deg, transparent, hsl(0 0% 100% / ${absSlot === 1 ? 0.6 : 0.3}), transparent)`,
                      }}
                    />
                  )}

                  {/* Prismatic top edge — active card only */}
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

                  {/* Content — only rendered for active card */}
                  {isActive && (
                    <div className="flex items-center gap-4">
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "12px",
                          background: `${item.accentColor}0C`,
                          border: `1px solid ${item.accentColor}18`,
                        }}
                      >
                        <Icon
                          style={{
                            color: item.accentColor,
                            width: 18,
                            height: 18,
                            opacity: 0.9,
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span
                            className="font-extralight leading-none tracking-[-0.04em] tabular-nums"
                            style={{
                              color: item.accentColor,
                              fontSize: "32px",
                            }}
                          >
                            {item.count}
                          </span>
                          <span
                            className="font-medium tracking-[-0.01em]"
                            style={{
                              color: "hsl(210 8% 12%)",
                              fontSize: "14px",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>

                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="text-[12px] leading-relaxed mt-0.5"
                          style={{ color: "hsl(210 8% 42%)" }}
                        >
                          {item.tagline}
                        </motion.p>
                      </div>

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
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
