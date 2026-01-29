/**
 * F1v4_HistoricalTrackingView - Read-only tracking view for historical payroll periods
 * 
 * Matches CA3_TrackingView historical view pattern
 */

import React from "react";
import { CheckCircle2, Download, FileText, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface HistoricalWorker {
  id: string;
  name: string;
  country: string;
  type: "employee" | "contractor";
  amount: number;
  currency: string;
  status: "paid" | "posted";
  providerRef: string;
}

interface F1v4_HistoricalTrackingViewProps {
  workers: HistoricalWorker[];
  paidDate: string;
}

// Mock historical workers data
const HISTORICAL_WORKERS: HistoricalWorker[] = [
  { id: "1", name: "Marcus Chen", country: "Singapore", type: "contractor", amount: 12000, currency: "SGD", status: "paid", providerRef: "PAY-2025-112234" },
  { id: "2", name: "Sofia Rodriguez", country: "Spain", type: "contractor", amount: 6500, currency: "EUR", status: "paid", providerRef: "PAY-2025-112235" },
  { id: "3", name: "Maria Santos", country: "Philippines", type: "employee", amount: 280000, currency: "PHP", status: "paid", providerRef: "PAY-2025-112236" },
  { id: "4", name: "Alex Hansen", country: "Norway", type: "employee", amount: 65000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112237" },
  { id: "5", name: "Emma Wilson", country: "Norway", type: "contractor", amount: 72000, currency: "NOK", status: "paid", providerRef: "PAY-2025-112238" },
  { id: "6", name: "Jonas Schmidt", country: "Germany", type: "employee", amount: 5800, currency: "EUR", status: "posted", providerRef: "PAY-2025-112239" },
];

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬", Spain: "🇪🇸", Philippines: "🇵🇭", Norway: "🇳🇴",
  Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷"
};

export const F1v4_HistoricalTrackingView: React.FC<F1v4_HistoricalTrackingViewProps> = ({
  workers = HISTORICAL_WORKERS,
  paidDate,
}) => {
  const paidCount = workers.filter(w => w.status === "paid" || w.status === "posted").length;
  const employees = workers.filter(w => w.type === "employee");
  const contractors = workers.filter(w => w.type === "contractor");

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: "€", NOK: "kr", PHP: "₱", USD: "$", SGD: "S$" };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleExportCSV = () => toast.success("CSV exported");
  const handleDownloadAuditPDF = () => toast.success("Audit PDF downloaded");

  return (
    <Card className="border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Progress Hero */}
      <div className="px-6 pt-6 pb-5 border-b border-border/40">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <span className="px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green-text text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Paid
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground tabular-nums">{paidCount}</span>
              <span className="text-lg text-muted-foreground">of {workers.length}</span>
              <span className="text-sm text-muted-foreground">payments paid</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paid on {paidDate}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadAuditPDF} className="h-8 text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Worker List */}
      <CardContent className="p-4">
        <div className="max-h-[380px] overflow-y-auto space-y-1">
          {workers.map((worker) => {
            const TypeIcon = worker.type === "employee" ? Users : Briefcase;

            return (
              <div 
                key={worker.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-muted/30 border border-border/20"
              >
                {/* Avatar */}
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-medium">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Country */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                    <TypeIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[11px] text-muted-foreground">· {countryFlags[worker.country] || ""} {worker.country}</span>
                  </div>
                </div>

                {/* Amount */}
                <p className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
                  {formatCurrency(worker.amount, worker.currency)}
                </p>

                {/* Status Pill */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0",
                  "bg-accent-green/10 text-accent-green-text"
                )}>
                  <CheckCircle2 className="h-3 w-3" />
                  Paid
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default F1v4_HistoricalTrackingView;
