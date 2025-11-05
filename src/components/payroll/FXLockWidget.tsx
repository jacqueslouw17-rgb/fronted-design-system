import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Clock, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FXLockWidgetProps {
  rates: Record<string, number>;
  locked: boolean;
  onLock: () => void;
}

export const FXLockWidget: React.FC<FXLockWidgetProps> = ({ rates, locked, onLock }) => {
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    if (locked && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [locked, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          FX Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(rates).map(([currency, rate]) => (
          <div key={currency} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <div className="font-medium text-sm">USD/{currency}</div>
              <div className="text-xs text-muted-foreground">Mid-market rate</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-base sm:text-lg">{rate.toFixed(4)}</div>
              <div className="text-xs text-green-600">+0.02% today</div>
            </div>
          </div>
        ))}

        {locked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Rate Locked</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Rates guaranteed for 15 minutes
            </p>
          </motion.div>
        ) : (
          <Button onClick={onLock} className="w-full" size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Lock FX Now
          </Button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-help p-2 rounded hover:bg-muted/30">
                <Info className="h-3 w-3" />
                <span>Transfer fee: $20 per batch · Zero FX markup</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                This includes $20 transfer fee per batch, zero markup on FX.
                Rates refreshed every 60 seconds.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
