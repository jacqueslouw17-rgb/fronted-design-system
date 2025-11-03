import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PayrollChecklistItem } from "@/hooks/usePayrollSync";

interface PayrollChecklistItemProps {
  item: PayrollChecklistItem;
  index: number;
}

export const PayrollChecklistItemComponent: React.FC<PayrollChecklistItemProps> = ({
  item,
  index,
}) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-accent-green-text" />;
      case 'waiting':
        return <Clock className="h-5 w-5 text-accent-yellow-text" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-accent-blue-text animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'complete':
        return 'border-accent-green-outline/30 bg-accent-green-fill/10';
      case 'waiting':
        return 'border-accent-yellow-outline/30 bg-accent-yellow-fill/10';
      case 'pending':
        return 'border-accent-blue-outline/30 bg-accent-blue-fill/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-all",
        getStatusColor()
      )}
    >
      <div className="mt-0.5">{getStatusIcon()}</div>
      <div className="flex-1">
        <p className={cn(
          "font-medium text-sm",
          item.status === 'complete' && "line-through text-muted-foreground"
        )}>
          {item.label}
        </p>
        {item.kurtMessage && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-muted-foreground mt-1"
          >
            {item.kurtMessage}
          </motion.p>
        )}
        {item.timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(item.timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};
