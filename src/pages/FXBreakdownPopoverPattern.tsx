import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Info } from "lucide-react";
import FXBreakdownPopover from "@/components/FXBreakdownPopover";

const FXBreakdownPopoverPattern = () => {
  // Example data for different states
  const defaultFXData = {
    timestamp: "FX rate as of Oct 8, 2025 – 14:32 UTC",
    spotRate: {
      from: "USD",
      to: "NOK",
      rate: 11.04,
      tooltip: "Live mid-market rate sourced from Wise API.",
    },
    spread: {
      percentage: 0.25,
      tooltip: "Provider markup applied to mid-market rate.",
    },
    bankFee: {
      amount: 6.5,
      currency: "$",
      tooltip: "International transfer fee charged by intermediary bank.",
    },
    totalRate: {
      rate: 11.012,
      tooltip: "Actual effective rate including all fees and spreads.",
    },
    conversion: {
      fromAmount: 5000,
      fromCurrency: "$",
      toAmount: 55060,
      toCurrency: "NOK",
    },
    genieHint:
      "FX volatility detected in last 24h (+1.2%) — consider rate lock.",
  };

  const lockedFXData = {
    timestamp: "Locked at Oct 8, 2025 – 10:15 UTC",
    spotRate: {
      from: "USD",
      to: "EUR",
      rate: 0.92,
      tooltip: "Rate confirmed at approval time.",
    },
    spread: {
      percentage: 0.2,
      tooltip: "Locked spread applied at time of approval.",
    },
    bankFee: {
      amount: 5.0,
      currency: "$",
      tooltip: "Fixed transfer fee.",
    },
    totalRate: {
      rate: 0.918,
      tooltip: "Locked rate - will not change.",
    },
    conversion: {
      fromAmount: 3000,
      fromCurrency: "$",
      toAmount: 2754,
      toCurrency: "EUR",
    },
    status: "locked" as const,
    genieHint: "Rate locked. No further changes will affect this conversion.",
  };

  const pendingFXData = {
    timestamp: "Quote requested Oct 8, 2025 – 15:00 UTC",
    spotRate: {
      from: "USD",
      to: "GBP",
      rate: 0.78,
      tooltip: "Preliminary rate - awaiting final confirmation.",
    },
    spread: {
      percentage: 0.3,
      tooltip: "Estimated spread - may change.",
    },
    bankFee: {
      amount: 7.0,
      currency: "$",
      tooltip: "Estimated transfer fee.",
    },
    totalRate: {
      rate: 0.777,
      tooltip: "Pending final rate confirmation from provider.",
    },
    conversion: {
      fromAmount: 4000,
      fromCurrency: "$",
      toAmount: 3108,
      toCurrency: "GBP",
    },
    status: "pending" as const,
    genieHint: "Awaiting final rate quote. Expected within 2 hours.",
  };

  const errorFXData = {
    timestamp: "Rate unavailable – Oct 8, 2025 – 16:30 UTC",
    spotRate: {
      from: "USD",
      to: "JPY",
      rate: 0,
      tooltip: "Unable to fetch current rate.",
    },
    spread: {
      percentage: 0,
      tooltip: "Rate service temporarily unavailable.",
    },
    bankFee: {
      amount: 0,
      currency: "$",
      tooltip: "Fee calculation pending rate availability.",
    },
    totalRate: {
      rate: 0,
      tooltip: "Rate unavailable - please retry.",
    },
    conversion: {
      fromAmount: 2000,
      fromCurrency: "$",
      toAmount: 0,
      toCurrency: "JPY",
    },
    status: "error" as const,
    genieHint: "Rate service unavailable. Retrying automatically...",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>

        {/* Header */}
        <header className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-2xl font-bold text-foreground">
            FX Breakdown Popover
          </h1>
          <p className="text-muted-foreground mt-1">
            Transparent currency conversion details with spot rates, spreads, fees, and AI insights
          </p>
        </header>

        {/* Purpose Card */}
        <Card>
          <CardHeader>
            <CardTitle>Purpose</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Allow users to see exactly how their currency conversion and
              payout amount are calculated, including spot rate, spread,
              intermediary/bank fees, and payer responsibility. It supports both
              Admins and Contractors in understanding every cent of a
              transaction — before approval.
            </p>
            <p className="font-medium italic mt-4">
              "Trust comes from clarity, not complexity."
            </p>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default State */}
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Payroll Batch #1042</h3>
                  <p className="text-sm text-muted-foreground">
                    Pending approval
                  </p>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Conversion: $5,000 → 55,060 NOK</span>
                <FXBreakdownPopover data={defaultFXData}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    View Details
                  </Button>
                </FXBreakdownPopover>
              </div>
            </div>

            {/* Locked State */}
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Payroll Batch #1041</h3>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
                <Badge variant="secondary">Locked</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Conversion: $3,000 → 2,754 EUR</span>
                <FXBreakdownPopover data={lockedFXData}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    View Details
                  </Button>
                </FXBreakdownPopover>
              </div>
            </div>

            {/* Pending State */}
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Payroll Batch #1043</h3>
                  <p className="text-sm text-muted-foreground">
                    Awaiting quote
                  </p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Conversion: $4,000 → ~3,108 GBP</span>
                <FXBreakdownPopover data={pendingFXData}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    View Details
                  </Button>
                </FXBreakdownPopover>
              </div>
            </div>

            {/* Error State */}
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Payroll Batch #1044</h3>
                  <p className="text-sm text-muted-foreground">Rate error</p>
                </div>
                <Badge variant="destructive">Error</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <span className="text-sm">Conversion: $2,000 → ? JPY</span>
                <FXBreakdownPopover data={errorFXData}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Info className="h-4 w-4" />
                    View Details
                  </Button>
                </FXBreakdownPopover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Real-time spot rate with source reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Transparent spread and bank fee breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Status badges for locked, pending, or error states</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Contextual tooltips explaining each line item</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Genie AI insights for volatility and timing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Smooth fade-in animation on popover open</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Payroll preparation and last-minute edits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Payout orchestration and status tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Transparent FX dashboard cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Contractor portal payout details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Admin approval workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Financial audit and compliance reviews</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Behavior States */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Badge variant="outline">Default</Badge>
                <span>Basic breakdown shown with current market rates</span>
              </div>
              <div className="flex gap-3">
                <Badge variant="secondary">Locked</Badge>
                <span>Approved/committed FX rate that won't change</span>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline">Pending</Badge>
                <span>Awaiting final rate confirmation from provider</span>
              </div>
              <div className="flex gap-3">
                <Badge variant="destructive">Error</Badge>
                <span>API/FX service unavailable, retry needed</span>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="border-primary">
                  Genie Advisory
                </Badge>
                <span>AI suggests FX timing or provider insights</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Component Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Header</h4>
              <p className="text-sm text-muted-foreground">
                Title "FX Breakdown" with timestamp and status badge
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Body (Breakdown Table)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Spot Rate - Market reference with tooltip</li>
                <li>• Spread - Provider markup percentage</li>
                <li>• Bank Fee - Transfer cost in currency</li>
                <li>• Total Rate Applied - Actual effective rate</li>
                <li>
                  • Converted Amount - Final visible result (highlighted)
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Footer (Optional)</h4>
              <p className="text-sm text-muted-foreground">
                Genie Insight with AI-powered advisory message
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FXBreakdownPopoverPattern;
