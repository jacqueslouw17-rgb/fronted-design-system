/**
 * Flow 4.2 — Contractor Dashboard v6
 * Hero card with Last invoice and Next invoice tiles
 */

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, ChevronRight } from "lucide-react";

interface F42v6_InvoiceHeroCardProps {
  onViewDetails?: () => void;
  currency?: string;
}

export const F42v6_InvoiceHeroCard = ({ 
  onViewDetails,
  currency = "USD"
}: F42v6_InvoiceHeroCardProps) => {
  const currencySymbol = currency === "USD" ? "$" : "₱";
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Invoice Tile - with light purple tint */}
          <div className="bg-primary/[0.06] rounded-xl p-4 sm:p-5 border border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-primary/80">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Last invoice</span>
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
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                Dec 15, 2025
              </h2>
              <p className="text-sm text-muted-foreground">
                Amount: <span className="font-medium text-foreground">{currencySymbol}5,250.00</span> net
              </p>
            </div>
          </div>

          {/* Next Invoice Tile */}
          <div className="bg-background rounded-xl p-4 sm:p-5 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Next invoice</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
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
