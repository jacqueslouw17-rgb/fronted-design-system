import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, HelpCircle, MessageCircle, ExternalLink } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  status?: 'success' | 'warning' | 'neutral';
  index: number;
}

const MetricTile = ({ icon: Icon, label, value, status = 'neutral', index }: MetricTileProps) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'neutral':
        return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <Card className="p-4 relative hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg bg-primary/10 ${getStatusColor()}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Explain
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask Genie
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      See details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricTile;
