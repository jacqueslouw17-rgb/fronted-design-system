import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  totalCount?: number;
  className?: string;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  totalCount,
  className,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const displayTotal = totalCount ?? (pendingCount + approvedCount + rejectedCount);
  const hasPending = pendingCount > 0;
  const hasRejected = rejectedCount > 0;
  
  return (
    <section className={cn("", className)}>
      {/* Header - clickable, ultra-compact */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between py-1.5 group cursor-pointer rounded transition-colors",
          "hover:bg-muted/40"
        )}
      >
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground/70" />
          </motion.div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          
          {/* Count badges - inline, minimal */}
          {hasPending && (
            <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
              · {pendingCount}
            </span>
          )}
          {hasRejected && (
            <span className="text-[10px] font-medium text-destructive">
              · {rejectedCount} rejected
            </span>
          )}
        </div>
        
        {/* Collapsed summary */}
        {!isOpen && (
          <div className="flex items-center gap-2">
            {hasPending ? (
              <Badge 
                variant="outline" 
                className="text-[9px] px-1.5 py-0 h-3.5 font-medium bg-orange-100/80 text-orange-700 border-orange-300/60 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
              >
                {pendingCount} pending
              </Badge>
            ) : approvedCount > 0 ? (
              <span className="text-[10px] text-muted-foreground/60">
                {approvedCount} item{approvedCount !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
        )}
      </button>
      
      {/* Content - animated, tight */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollapsibleSection;
