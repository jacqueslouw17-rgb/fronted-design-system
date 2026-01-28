import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  showPendingFilter?: boolean;
  isPendingOnly?: boolean;
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
      {/* Header - clickable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {title}
          </h3>
          
          {/* Count badges */}
          <div className="flex items-center gap-1.5">
            {hasPending && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 font-medium bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
              >
                {pendingCount} pending
              </Badge>
            )}
            {hasRejected && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 font-medium bg-destructive/10 text-destructive border-destructive/30"
              >
                {rejectedCount} rejected
              </Badge>
            )}
            {!hasPending && !hasRejected && approvedCount > 0 && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 h-4 font-medium bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/30"
              >
                {approvedCount} approved
              </Badge>
            )}
          </div>
        </div>
        
        {/* Total count on the right when collapsed */}
        {!isOpen && displayTotal > 0 && (
          <span className="text-xs text-muted-foreground">
            {displayTotal} item{displayTotal !== 1 ? 's' : ''}
          </span>
        )}
      </button>
      
      {/* Content - animated */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollapsibleSection;
