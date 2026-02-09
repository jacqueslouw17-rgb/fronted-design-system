import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean; // New prop to force open state dynamically
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  totalCount?: number;
  className?: string;
  subtitle?: React.ReactNode;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  forceOpen,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  totalCount,
  className,
}: CollapsibleSectionProps & { subtitle?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Respond to forceOpen changes
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);
  
  const displayTotal = totalCount ?? (pendingCount + approvedCount + rejectedCount);
  const hasPending = pendingCount > 0;
  
  return (
    <section className={cn("", className)}>
      {/* Header - minimal, tight */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 -mx-2 px-2 rounded group cursor-pointer transition-colors",
          "hover:bg-muted/70"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.12 }}
        >
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        </motion.div>
        <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          {title}
        </span>
        
        {/* Inline counts */}
        {hasPending && (
          <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 ml-0.5">
            {pendingCount}
          </span>
        )}
        {!isOpen && !hasPending && displayTotal > 0 && (
          <span className="text-[10px] text-muted-foreground/50 ml-0.5">
            {displayTotal}
          </span>
        )}
      </button>
      
      {/* Optional subtitle (e.g., pay change note) */}
      {subtitle && (
        <div className="ml-4 mt-0.5 mb-0.5">
          {subtitle}
        </div>
      )}
      
      {/* Content - indented to align with header text */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-y-hidden overflow-x-visible"
          >
            <div className="pl-4 pr-3 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollapsibleSection;
