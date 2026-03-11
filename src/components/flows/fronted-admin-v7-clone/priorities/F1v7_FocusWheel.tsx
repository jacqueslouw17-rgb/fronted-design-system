/**
 * Focus Wheel — stacked card carousel with living glass depth
 * Iridescent edges, ambient glow orbs, breathing severity indicators,
 * morphing gradients, and floating background blobs.
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

/* Severity → morphing gradient palette */
const severityGradients: Record<string, { bg: string; glow: string; blob1: string; blob2: string }> = {
  critical: {
    bg: "linear-gradient(160deg, hsl(0 0% 100% / 0.88), hsl(0 72% 95% / 0.4), hsl(0 0% 100% / 0.65))",
    glow: "hsl(0 72% 51% / 0.08)",
    blob1: "hsl(0 72% 60% / 0.06)",
    blob2: "hsl(340 70% 65% / 0.05)",
  },
  warning: {
    bg: "linear-gradient(160deg, hsl(0 0% 100% / 0.88), hsl(38 92% 95% / 0.35), hsl(0 0% 100% / 0.65))",
    glow: "hsl(38 92% 50% / 0.06)",
    blob1: "hsl(38 92% 60% / 0.06)",
    blob2: "hsl(25 90% 55% / 0.04)",
  },
  info: {
    bg: "linear-gradient(160deg, hsl(0 0% 100% / 0.88), hsl(172 28% 90% / 0.3), hsl(0 0% 100% / 0.65))",
    glow: "hsl(172 28% 42% / 0.05)",
    blob1: "hsl(172 40% 55% / 0.05)",
    blob2: "hsl(200 50% 60% / 0.04)",
  },
};

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
      {/* Counter + nav arrows */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 z-30">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "hsl(210 8% 30%)" }}>
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-[10px]" style={{ color: "hsl(210 8% 65%)" }}>/</span>
          <span className="text-[10px] tabular-nums" style={{ color: "hsl(210 8% 65%)" }}>
            {String(items.length).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          {activeIndex > 0 && (
            <button
              onClick={onPrev}
              className="p-1.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: "hsl(0 0% 100% / 0.5)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsl(0 0% 100% / 0.3)",
              }}
            >
              <ChevronUp className="h-3 w-3" style={{ color: "hsl(210 8% 35%)" }} />
            </button>
          )}
          {activeIndex < items.length - 1 && (
            <button
              onClick={onNext}
              className="p-1.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{
                background: "hsl(0 0% 100% / 0.5)",
                backdropFilter: "blur(20px)",
                border: "1px solid hsl(0 0% 100% / 0.3)",
              }}
            >
              <ChevronDown className="h-3 w-3" style={{ color: "hsl(210 8% 35%)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Stack container */}
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
            const sev = severityGradients[item.severity] || severityGradients.info;

            let yPos: number;
            if (isActive) {
              yPos = 35;
            } else if (slot < 0) {
              yPos = absSlot === 1 ? 21 : 13;
            } else {
              yPos = absSlot === 1 ? 101 : 109;
            }

            const widthShrink = isActive ? 0 : absSlot === 1 ? 16 : 32;
            const opacity = isActive ? 1 : absSlot === 1 ? 0.65 : 0.3;
            const zIndex = 10 - absSlot;
            const cardHeight = isActive ? "auto" : absSlot === 1 ? "40px" : "28px";

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ y: direction > 0 ? 120 : -60, opacity: 0 }}
                animate={{ y: yPos, opacity }}
                exit={{ y: direction > 0 ? -60 : 120, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute cursor-pointer group"
                style={{ zIndex, left: widthShrink, right: widthShrink }}
                onClick={() => (isActive ? onNext() : onSelect(idx))}
              >
                <div
                  className="relative overflow-hidden transition-all duration-500"
                  style={{
                    height: cardHeight,
                    background: isActive
                      ? sev.bg
                      : `linear-gradient(160deg, hsl(0 0% 100% / ${absSlot === 1 ? 0.5 : 0.3}), hsl(0 0% 100% / ${absSlot === 1 ? 0.3 : 0.15}))`,
                    backdropFilter: isActive
                      ? "blur(60px) saturate(2)"
                      : `blur(${absSlot === 1 ? 30 : 15}px) saturate(1.2)`,
                    borderRadius: isActive ? "20px" : `${16 - absSlot * 2}px`,
                    border: isActive
                      ? `1px solid ${item.accentColor}20`
                      : `1px solid hsl(0 0% 100% / ${absSlot === 1 ? 0.35 : 0.2})`,
                    boxShadow: isActive
                      ? `inset 0 1px 0 hsl(0 0% 100% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.3)`
                      : "none",
                    padding: isActive ? "18px 24px" : undefined,
                  }}
                >
                  {/* ═══ LIVING UI LAYERS — active card only ═══ */}
                  {isActive && (
                    <>
                      {/* Floating blob 1 — drifts slowly top-right */}
                      <motion.div
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          width: 120,
                          height: 120,
                          top: -30,
                          right: -20,
                          background: `radial-gradient(circle, ${sev.blob1}, transparent 70%)`,
                          filter: "blur(30px)",
                        }}
                        animate={{
                          x: [0, 15, -5, 0],
                          y: [0, -8, 5, 0],
                          scale: [1, 1.15, 0.95, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Floating blob 2 — drifts bottom-left */}
                      <motion.div
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          width: 100,
                          height: 100,
                          bottom: -25,
                          left: 40,
                          background: `radial-gradient(circle, ${sev.blob2}, transparent 70%)`,
                          filter: "blur(25px)",
                        }}
                        animate={{
                          x: [0, -10, 8, 0],
                          y: [0, 6, -4, 0],
                          scale: [1, 0.9, 1.1, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* Ambient glow orb — appears on hover */}
                      <div
                        className="absolute inset-0 pointer-events-none rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                          background: `radial-gradient(ellipse at 60% 50%, ${sev.glow}, transparent 60%)`,
                        }}
                      />

                      {/* Prismatic top edge — iridescent rainbow refraction */}
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent 2%, ${item.accentColor}40 15%, hsl(280 70% 70% / 0.35) 35%, hsl(190 80% 65% / 0.3) 50%, hsl(340 70% 65% / 0.25) 65%, ${item.accentColor}30 85%, transparent 98%)`,
                          transformOrigin: "left center",
                        }}
                      />

                      {/* Prismatic bottom edge — subtle mirror */}
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 0.5, scaleX: 1 }}
                        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-0 left-[5%] right-[5%] h-[1px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${item.accentColor}20, hsl(260 60% 70% / 0.15), ${item.accentColor}15, transparent)`,
                          transformOrigin: "right center",
                        }}
                      />

                      {/* Left edge iridescent accent */}
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 0.6, scaleY: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-[10%] bottom-[10%] w-[1.5px]"
                        style={{
                          background: `linear-gradient(180deg, transparent, ${item.accentColor}30, hsl(260 60% 70% / 0.2), transparent)`,
                          transformOrigin: "center top",
                        }}
                      />
                    </>
                  )}

                  {/* Glass reflection line on non-active cards */}
                  {!isActive && (
                    <div
                      className="absolute left-[8%] right-[8%]"
                      style={{
                        height: "1px",
                        ...(slot < 0 ? { bottom: "0px" } : { top: "0px" }),
                        background: `linear-gradient(90deg, transparent, hsl(0 0% 100% / ${absSlot === 1 ? 0.6 : 0.3}), transparent)`,
                      }}
                    />
                  )}

                  {/* ═══ CONTENT — active card ═══ */}
                  {isActive && (
                    <div className="relative z-10 flex items-center gap-4">

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span
                            className="font-extralight leading-none tracking-[-0.04em] tabular-nums"
                            style={{ color: item.accentColor, fontSize: "32px" }}
                          >
                            {item.count}
                          </span>
                          <span
                            className="font-medium tracking-[-0.01em]"
                            style={{ color: "hsl(210 8% 12%)", fontSize: "14px" }}
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

                      {/* Severity badge with breathing pulse */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.12, duration: 0.35 }}
                        className="shrink-0 relative flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: `${item.accentColor}0A`,
                          border: `1px solid ${item.accentColor}12`,
                        }}
                      >
                        {/* Breathing glow behind badge */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ background: `${item.accentColor}06` }}
                          animate={
                            item.severity === "critical"
                              ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }
                              : { scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }
                          }
                          transition={{
                            duration: item.severity === "critical" ? 1.8 : 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.div
                          animate={
                            item.severity === "critical"
                              ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }
                              : {}
                          }
                          transition={{ duration: 2, repeat: Infinity }}
                          className="relative h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: item.accentColor }}
                        />
                        <span
                          className="relative text-[9px] font-bold uppercase tracking-[0.12em]"
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
