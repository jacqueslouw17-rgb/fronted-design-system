import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Download, ExternalLink } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  status?: 'success' | 'warning' | 'neutral';
  trend?: string;
  index: number;
}

const MetricTile = ({ icon: Icon, label, value, status = 'neutral', trend, index }: MetricTileProps) => {
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
      className="relative"
    >
      <Card className="hover:shadow-lg transition-all h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">
              {trend}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hover Micro-Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 flex gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg z-10"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={() => console.log('Ask Genie about', label)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={() => console.log('Export', label)}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={() => console.log('View details', label)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MetricTile;
