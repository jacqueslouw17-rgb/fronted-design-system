/**
 * Flow 4.1 — Employee Dashboard v6
 * Hero card with Last payout and Next payout tiles
 */

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, ChevronRight } from "lucide-react";

interface F41v6_PayoutHeroCardProps {
  onViewDetails?: () => void;
  currency?: string;
}

export const F41v6_PayoutHeroCard = ({ 
  onViewDetails,
  currency = "PHP"
}: F41v6_PayoutHeroCardProps) => {
  const currencySymbol = currency === "PHP" ? "₱" : "$";
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Payout Tile - with light purple tint */}
          <div className="bg-primary/[0.06] rounded-xl p-5 border border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-primary/80">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Last payout</span>
              </div>
              <button 
                onClick={onViewDetails}
                className="flex items-center gap-1 text-sm text-primary/70 hover:text-primary transition-colors"
              >
                View details
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold text-foreground tracking-tight">
                Dec 15, 2025
              </h2>
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-medium text-foreground">{currencySymbol}42,166.67</span> net
              </p>
            </div>
          </div>

          {/* Next Payout Tile */}
          <div className="bg-background rounded-xl p-5 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Next payout</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold text-foreground tracking-tight">
                Jan 15, 2025
              </h2>
              <p className="text-sm text-muted-foreground">
                Please submit adjustments before Jan 10.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
