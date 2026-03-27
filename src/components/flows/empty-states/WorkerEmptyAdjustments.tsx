/**
 * Shared – Worker Empty State: Adjustments Tab
 * 
 * Shown when a worker has no adjustments yet but can start adding them.
 * Used by both Flow 4.1 (Employee) and Flow 4.2 (Contractor).
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WorkerEmptyAdjustmentsProps {
  onRequestAdjustment?: () => void;
}

export const WorkerEmptyAdjustments = ({ onRequestAdjustment }: WorkerEmptyAdjustmentsProps) => {
  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col items-center text-center py-12 px-6">
          {/* Minimal icon cluster */}
          <div className="relative mb-5">
            <div className="w-12 h-12 rounded-xl bg-primary/[0.06] border border-primary/15 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary/50" />
            </div>
          </div>
          
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            No adjustments yet
          </h3>
          <p className="text-sm text-muted-foreground/70 mb-6 max-w-[260px] leading-relaxed">
            Log expenses, overtime, or time off to include them in your next pay cycle.
          </p>
          
          <Button 
            onClick={onRequestAdjustment}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Request adjustment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
