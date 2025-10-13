import { useState } from "react";
import { Info, TrendingUp, DollarSign, Shield, FileText, ArrowRight, Volume2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const NarratedInsightPattern = () => {
  const [narratedItem, setNarratedItem] = useState<string | null>(null);

  const handleNarrate = (item: string) => {
    setNarratedItem(item);
    // Simulate audio narration
    setTimeout(() => setNarratedItem(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Narrated Insight / Tooltip Bubble</h1>
          <p className="text-sm text-muted-foreground">
            Contextual, human-sounding micro-explanations at the point of uncertainty.
          </p>
        </div>

        {/* Simple Tooltips with IconInfo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Simple Tooltips</CardTitle>
            <CardDescription>Hover over info icons for quick explanations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">FX Rate: 1.28 USD/EUR</div>
                  <div className="text-xs text-muted-foreground">Updated 2 min ago</div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Includes Wise processing fee of 1.2%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Gross Pay: $4,800</div>
                  <div className="text-xs text-muted-foreground">Contractor A • Philippines</div>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Calculated using standard deduction for PH contractors.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* HoverCard - Rich Contextual Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">HoverCard Insights</CardTitle>
            <CardDescription>Hover over metrics for detailed, conversational explanations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-foreground/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-muted-foreground">Trust Index</div>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-semibold">94</div>
                    <div className="text-xs text-muted-foreground mt-1">↑ 5 pts this cycle</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Your trust score improved!</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Up 5 points since last pay cycle due to SLA compliance and on-time payments.
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs mt-2" size="sm">
                          Ask Genie › <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-foreground/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-muted-foreground">FX Savings</div>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-semibold">$284</div>
                    <div className="text-xs text-muted-foreground mt-1">This month</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">FX optimization working</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          You saved $284 this month by timing payments during favorable FX windows. Genie monitors rates 24/7.
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs mt-2" size="sm">
                          View strategy › <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="p-4 border rounded-lg cursor-pointer hover:border-foreground/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-muted-foreground">Compliance</div>
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-semibold">100%</div>
                    <div className="text-xs text-muted-foreground mt-1">All docs valid</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">You're fully compliant</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          All contractor documents are valid and up to date. Genie will notify you 30 days before any expiration.
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs mt-2" size="sm">
                          Review docs › <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>

        {/* Popover - Multi-line Explanations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popover Insights</CardTitle>
            <CardDescription>Click for expanded, multi-line explanations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Payroll Cutoff Window</div>
                  <div className="text-xs text-muted-foreground">12 hours remaining for edits</div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">About the cutoff window</h4>
                      <p className="text-xs text-muted-foreground">
                        You have 12 hours to make any changes to this pay cycle. After that, payments will be processed automatically.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Genie recommends reviewing all amounts and contractor details before the deadline.
                      </p>
                      <Button variant="link" className="h-auto p-0 text-xs" size="sm">
                        Learn more › <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Document Expiry Alert</div>
                  <div className="text-xs text-muted-foreground">Passport renewal required</div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Passport renewal reminder</h4>
                      <p className="text-xs text-muted-foreground">
                        For contractors in this country, passports must be renewed every 2 years to maintain compliance.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contractor B's passport expires in 45 days. Genie will send automatic reminders every week.
                      </p>
                      <Button variant="link" className="h-auto p-0 text-xs" size="sm">
                        View all docs › <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Narrated Mode (Future Feature) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Narrated Mode</CardTitle>
            <CardDescription>Future: Audio playback of explanations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Bank Fee Breakdown</div>
                    <div className="text-xs text-muted-foreground">Click to hear explanation</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Your bank adds a 1.2% spread on top of the mid-market rate.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleNarrate("bank-fee")}
                  >
                    <Volume2 className={`h-4 w-4 ${narratedItem === "bank-fee" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>
              {narratedItem === "bank-fee" && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  🎵 Playing narration: "Your bank adds a 1.2% spread on top of the mid-market rate..."
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interactive States Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">State Variations</CardTitle>
            <CardDescription>Different states for different contexts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Default</Badge>
                <span className="text-sm">Hover for basic info</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">This is a default tooltip with basic information.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Badge>Expanded</Badge>
                <span className="text-sm">Click for detailed explanation</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Info className="h-4 w-4 text-blue-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Expanded explanation</h4>
                    <p className="text-xs text-muted-foreground">
                      This popover provides a more detailed, multi-line explanation with context and actionable next steps.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Interactive</Badge>
                <span className="text-sm">With action CTA</span>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Info className="h-4 w-4 text-purple-600" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Interactive insight</h4>
                    <p className="text-xs text-muted-foreground">
                      This insight includes an action you can take right away.
                    </p>
                    <Button variant="link" className="h-auto p-0 text-xs" size="sm">
                      Ask Genie › <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NarratedInsightPattern;
