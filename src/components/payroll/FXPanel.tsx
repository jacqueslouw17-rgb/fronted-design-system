import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Lock, RefreshCw, AlertCircle } from "lucide-react";
import type { FXSnapshot } from "@/types/payroll";

interface FXPanelProps {
  snapshot?: FXSnapshot;
  onRecalculate?: () => void;
  onLockRate?: () => void;
  onSwitchProvider?: () => void;
}

export const FXPanel: React.FC<FXPanelProps> = ({
  snapshot,
  onRecalculate,
  onLockRate,
  onSwitchProvider,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!snapshot?.lockedAt || !snapshot?.lockTtlSec) {
      setTimeRemaining(null);
      return;
    }

    const lockedTime = new Date(snapshot.lockedAt).getTime();
    const expiryTime = lockedTime + snapshot.lockTtlSec * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [snapshot?.lockedAt, snapshot?.lockTtlSec]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!snapshot) {
    return (
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <p>No FX snapshot available. Click Recalculate to generate rates.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              FX Rate Snapshot
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Provider: <Badge variant="outline">{snapshot.provider}</Badge>
            </p>
          </div>
          {snapshot.lockedAt && timeRemaining !== null && (
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Rate Locked</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs text-muted-foreground">remaining</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-sm font-medium text-muted-foreground">Base Currency</span>
            <span className="text-sm font-semibold text-foreground">{snapshot.baseCcy}</span>
          </div>

          {snapshot.quotes.map((quote) => (
            <div key={quote.ccy} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-foreground">{quote.ccy}</span>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{quote.rate.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Fee: ${quote.fee}</p>
              </div>
            </div>
          ))}

          {snapshot.varianceBps !== undefined && (
            <div className="flex items-center justify-between py-2 pt-4 border-t border-border/30">
              <span className="text-sm font-medium text-muted-foreground">Variance (bps)</span>
              <span className={`text-sm font-semibold ${snapshot.varianceBps > 0 ? "text-red-600" : "text-green-600"}`}>
                {snapshot.varianceBps > 0 ? "+" : ""}{snapshot.varianceBps}
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        {onRecalculate && (
          <Button onClick={onRecalculate} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
        )}
        {onLockRate && !snapshot.lockedAt && (
          <Button onClick={onLockRate} className="flex-1">
            <Lock className="h-4 w-4 mr-2" />
            Lock Rate (15 min)
          </Button>
        )}
        {onSwitchProvider && (
          <Button onClick={onSwitchProvider} variant="secondary" className="flex-1">
            Switch Provider
          </Button>
        )}
      </div>
    </div>
  );
};
