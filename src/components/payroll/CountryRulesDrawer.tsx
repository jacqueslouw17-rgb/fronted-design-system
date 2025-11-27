import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Info, Lock } from "lucide-react";

type Country = "PH" | "NO";

interface CountryRulesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CountryRulesDrawer({ open, onOpenChange }: CountryRulesDrawerProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>("PH");

  const countryRules = {
    PH: {
      name: "Philippines",
      code: "PH",
      payCycle: "Bi-monthly (1st-15th, 16th-End)",
      prorationMethod: "Calendar days (21.67 days/month standard)",
      fteHandling: "FTE% scales salary and leave accrual proportionally. Part-time employees receive prorated statutory benefits.",
      minStatutoryLeave: "5 days service incentive leave per year (after 1 year of service)",
      publicHolidays: "13+ regular holidays per year. Public holidays are counted separately and not deducted from annual leave. Premium rates apply for work on holidays.",
      employerContributions: [
        "Social Security System (SSS): 9.5% employer, 4.5% employee (capped at ₱30,000 monthly salary)",
        "PhilHealth: 5% of monthly salary (50/50 split), capped at ₱100,000",
        "Pag-IBIG: ₱100 fixed monthly contribution (both employer and employee)",
      ],
      employeeDeductions: [
        "Income Tax: Progressive withholding tax based on BIR tax table (0%-35%)",
        "SSS: 4.5% of monthly basic salary",
        "PhilHealth: 2.5% of monthly salary (up to cap)",
        "Pag-IBIG: ₱100 fixed monthly",
      ],
      constraints: [
        "13th month pay is mandatory, paid in December (tax-free up to ₱90,000)",
        "Overtime rate: 125% for first 2 hours, 130% thereafter",
        "Night differential: +10% for work between 10 PM - 6 AM",
        "Holiday premium rates apply: Regular holiday 200%, Special holiday 130%",
        "De minimis benefits cap: ₱10,000 per year (non-taxable)",
      ]
    },
    NO: {
      name: "Norway",
      code: "NO",
      payCycle: "Monthly (end of month)",
      prorationMethod: "Working days (21.7 days/month standard)",
      fteHandling: "FTE% scales salary, vacation days, and pension contributions proportionally. Norway requires explicit part-time employment agreements.",
      minStatutoryLeave: "25 working days per year (5 weeks)",
      publicHolidays: "10+ public holidays per year. Public holidays are in addition to annual leave and are paid days off.",
      employerContributions: [
        "Employer Social Security Tax: 14.1% of gross salary",
        "Mandatory Occupational Pension (OTP): Minimum 2% of salary between 1G-12G (G = Base Amount ~₭111,000)",
        "Holiday Pay: 12% of gross salary (10.2% for employees >60 years)",
      ],
      employeeDeductions: [
        "Income Tax: Progressive withholding tax (typically 0%-22% municipal + 0-17.4% bracket tax)",
        "Pension Contribution: Minimum 2% of salary (employee share)",
        "National Insurance: Included in tax withholding",
      ],
      constraints: [
        "Working Time Act: Max 40 hours/week, 9 hours/day (averaged over periods)",
        "Overtime premium: +40% for first 2 hours, +50% thereafter (standard minimum)",
        "No statutory 13th month pay requirement",
        "Termination notice: 1-6 months depending on tenure",
        "Severance pay may apply based on employment contract and tenure",
      ]
    }
  };

  const currentRules = countryRules[selectedCountry];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg font-semibold">Country Payroll Rules</SheetTitle>
            <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-border/50 gap-1.5">
              <Lock className="h-3 w-3" />
              Read-Only
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on Country Ruleset – managed by Fronted, read-only.
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Country Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Country</label>
              <Select value={selectedCountry} onValueChange={(value: Country) => setSelectedCountry(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                  <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Pay & Proration Basics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Pay & Proration Basics</h3>
              </div>
              
              <Card className="p-4 bg-muted/30 border-border/50 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pay Cycle / Payroll Frequency</p>
                  <p className="text-sm text-foreground">{currentRules.payCycle}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Default Proration Method</p>
                  <p className="text-sm text-foreground">{currentRules.prorationMethod}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">FTE Handling</p>
                  <p className="text-sm text-foreground leading-relaxed">{currentRules.fteHandling}</p>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Core Statutory Items */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Core Statutory Items</h3>
              </div>
              
              <Card className="p-4 bg-muted/30 border-border/50 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Minimum Statutory Leave Days</p>
                  <p className="text-sm text-foreground">{currentRules.minStatutoryLeave}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Public Holidays</p>
                  <p className="text-sm text-foreground leading-relaxed">{currentRules.publicHolidays}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Statutory Contributions</p>
                  
                  <div className="space-y-3 mt-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5">Employer Contributions:</p>
                      <ul className="space-y-1 ml-4">
                        {currentRules.employerContributions.map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground list-disc leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1.5">Employee Deductions:</p>
                      <ul className="space-y-1 ml-4">
                        {currentRules.employeeDeductions.map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground list-disc leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Separator />

            {/* Constraints & Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Constraints & Notes</h3>
              </div>
              
              <Card className="p-4 bg-amber-500/5 border-amber-500/20 space-y-2">
                <ul className="space-y-2 ml-4">
                  {currentRules.constraints.map((constraint, idx) => (
                    <li key={idx} className="text-xs text-foreground list-disc leading-relaxed">{constraint}</li>
                  ))}
                </ul>
                
                <Separator className="my-3" />
                
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/30 border border-border/50">
                  <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">These settings are derived from the Country Ruleset (backend).</p>
                    <p className="text-xs text-muted-foreground">
                      They cannot be edited in the UI. Rules are maintained by Fronted's compliance team and updated automatically when regulations change.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
