/**
 * Flow 6 v2 - Payroll Tab
 * 
 * Cloned from Flow 7 Fronted Admin Payroll v1 with read-only Country Rules
 * for Company Admin context. No Fronted-only actions exposed.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  Building2, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Settings,
  Lock,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface PayrollCycleData {
  label: string;
  totalSalaryCost: number | null;
  frontedFees: number | null;
  totalPayrollCost: number | null;
  completedDate?: string;
  nextPayrollRun?: string;
  nextPayrollYear?: string;
  opensOn?: string;
  status: "completed" | "active" | "upcoming";
  hasData: boolean;
  employeesCount: number;
  contractorsCount: number;
  countries: string[];
  primaryCurrency: string;
}

const payrollCyclesV2: Record<"previous" | "current" | "next", PayrollCycleData> = {
  previous: {
    label: "October 2025",
    totalSalaryCost: 98500,
    frontedFees: 2955,
    totalPayrollCost: 101455,
    completedDate: "Oct 15, 2025",
    status: "completed",
    hasData: true,
    employeesCount: 2,
    contractorsCount: 1,
    countries: ["Philippines", "Singapore", "United Kingdom"],
    primaryCurrency: "USD"
  },
  current: {
    label: "November 2025",
    totalSalaryCost: 102300,
    frontedFees: 3069,
    totalPayrollCost: 105369,
    nextPayrollRun: "Nov 15",
    nextPayrollYear: "2025",
    status: "active",
    hasData: true,
    employeesCount: 2,
    contractorsCount: 1,
    countries: ["Philippines", "Singapore", "United Kingdom"],
    primaryCurrency: "USD"
  },
  next: {
    label: "December 2025",
    totalSalaryCost: null,
    frontedFees: null,
    totalPayrollCost: null,
    nextPayrollRun: "Dec 15",
    nextPayrollYear: "2025",
    opensOn: "Dec 12, 2025",
    status: "upcoming",
    hasData: false,
    employeesCount: 0,
    contractorsCount: 0,
    countries: [],
    primaryCurrency: "USD"
  }
};

export const F6v2_PayrollTab = () => {
  const [selectedCycle, setSelectedCycle] = useState<"previous" | "current" | "next">("current");
  const [countryRulesDrawerOpen, setCountryRulesDrawerOpen] = useState(false);
  const [selectedCountryForRules, setSelectedCountryForRules] = useState<string>("Philippines");

  const currentCycleData = payrollCyclesV2[selectedCycle];

  return (
    <>
      <div className="space-y-6">
        {/* Payroll Overview Section - Cloned from Flow 7 */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-4 flex-1">
                  {/* Title and Status */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Payroll Overview</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium px-2.5 py-0.5",
                        currentCycleData.status === "completed" && "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline",
                        currentCycleData.status === "active" && "bg-blue-500/20 text-blue-600 border-blue-500/40",
                        currentCycleData.status === "upcoming" && "bg-amber-500/20 text-amber-600 border-amber-500/40"
                      )}
                    >
                      {currentCycleData.status === "completed" ? "Completed" : currentCycleData.status === "active" ? "In Progress" : "Upcoming"}
                    </Badge>
                  </div>
                  
                  {/* Run Details Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Pay Period</p>
                      <p className="text-sm font-medium text-foreground">{currentCycleData.label}</p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Primary Currency</p>
                      <p className="text-sm font-medium text-foreground">{currentCycleData.primaryCurrency}</p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Countries</p>
                      <p className="text-sm font-medium text-foreground">
                        {currentCycleData.countries.length > 0 
                          ? currentCycleData.countries.join(", ") 
                          : "—"}
                      </p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Workers Included</p>
                      <p className="text-sm font-medium text-foreground">
                        {currentCycleData.hasData 
                          ? `${currentCycleData.employeesCount} Employees, ${currentCycleData.contractorsCount} Contractors`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedCycle} 
                    onValueChange={(value: "previous" | "current" | "next") => setSelectedCycle(value)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs rounded-full border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous">October 2025</SelectItem>
                      <SelectItem value="current">November 2025 (Current)</SelectItem>
                      <SelectItem value="next">December 2025</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCountryRulesDrawerOpen(true)} 
                    className="h-8 px-3 gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-xs">Country Rules</span>
                  </Button>
                </div>
              </div>

              {/* Historical/Future Payroll Banner */}
              {currentCycleData.status !== "active" && (
                <motion.div 
                  key={`banner-${selectedCycle}`} 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.2 }} 
                  className={cn(
                    "p-3 rounded-lg border mb-4 flex items-center gap-2",
                    currentCycleData.status === "completed" 
                      ? "bg-accent-green-fill/10 border-accent-green-outline/20" 
                      : "bg-blue-500/10 border-blue-500/20"
                  )}
                >
                  {currentCycleData.status === "completed" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-accent-green-text flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        You're viewing <span className="font-semibold">{currentCycleData.label}</span> payroll — this cycle has been completed.
                      </p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-foreground">
                        🕒 You're viewing an upcoming payroll cycle. Preparation opens automatically 3 days before payout.
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              {/* Stats Cards */}
              <motion.div 
                key={selectedCycle} 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
              >
                {/* Total Salary Cost */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Salary Cost</p>
                  </div>
                  {!currentCycleData.hasData ? (
                    <p className="text-2xl font-semibold text-muted-foreground">—</p>
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      ${currentCycleData.totalSalaryCost?.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentCycleData.hasData ? currentCycleData.label : "Pending"}
                  </p>
                </div>

                {/* Fronted Fees */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Fronted Fees (Est.)</p>
                  </div>
                  {!currentCycleData.hasData ? (
                    <p className="text-2xl font-semibold text-muted-foreground">—</p>
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      ${currentCycleData.frontedFees?.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentCycleData.hasData ? "Transaction + Service" : "Pending"}
                  </p>
                </div>

                {/* Total Payroll Cost */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Payroll Cost</p>
                  </div>
                  {!currentCycleData.hasData ? (
                    <p className="text-2xl font-semibold text-muted-foreground">—</p>
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      ${currentCycleData.totalPayrollCost?.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentCycleData.hasData ? "Salary + Fees" : "Pending"}
                  </p>
                </div>

                {/* Next Payroll Run or Completion Status */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      {currentCycleData.status === "completed" 
                        ? "Payroll Run" 
                        : currentCycleData.status === "upcoming" 
                          ? "Scheduled For" 
                          : "Next Payroll Run"}
                    </p>
                  </div>
                  {currentCycleData.status === "completed" ? (
                    <>
                      <p className="text-lg font-semibold text-foreground">
                        {currentCycleData.label}
                      </p>
                      <p className="text-xs text-accent-green-text mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold text-foreground">
                        {currentCycleData.nextPayrollRun}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentCycleData.nextPayrollYear} (or prior weekday)
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Empty State for Upcoming */}
              {currentCycleData.status === "upcoming" && !currentCycleData.hasData && (
                <motion.div 
                  key={`summary-${selectedCycle}`} 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3, delay: 0.1 }} 
                  className="p-6 rounded-lg bg-muted/20 border border-border text-center"
                >
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    Your December payroll hasn't started yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Data will appear once time or compensation details are submitted.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Read-only info note for Company Admin */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/40">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Payroll execution is managed by Fronted. You can view payroll status and country rules but cannot make changes.
          </p>
        </div>
      </div>

      {/* Read-Only Country Rules Drawer */}
      <Sheet open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Country Rules
            </SheetTitle>
            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-xs text-amber-600">Managed by Fronted (read-only)</p>
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Country Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Country</label>
              <Select 
                value={selectedCountryForRules} 
                onValueChange={setSelectedCountryForRules}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                  <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                  <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Pay & Proration Basics */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Pay & Proration Basics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Pay Cycle</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    Monthly
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Default Proration</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    Calendar Days
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">FTE Treatment</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    Pro-rated
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Core Statutory Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Core Statutory Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Minimum Leave Days</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    {selectedCountryForRules === "Philippines" ? "5 days" : 
                     selectedCountryForRules === "Singapore" ? "7 days" : "28 days"}
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Public Holidays</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    {selectedCountryForRules === "Philippines" ? "18 days" : 
                     selectedCountryForRules === "Singapore" ? "11 days" : "8 days"}
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Employer Contributions</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    {selectedCountryForRules === "Philippines" ? "SSS, PhilHealth, Pag-IBIG" : 
                     selectedCountryForRules === "Singapore" ? "CPF" : "NI, Pension"}
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <span className="text-xs text-muted-foreground">Employee Contributions</span>
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    {selectedCountryForRules === "Philippines" ? "SSS, PhilHealth, Pag-IBIG, WHT" : 
                     selectedCountryForRules === "Singapore" ? "CPF" : "NI, Income Tax"}
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Constraints & Notes */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Constraints & Notes</h4>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These settings are derived from the Country Ruleset managed by Fronted. 
                  They ensure compliance with local labor laws and statutory requirements. 
                  If you need changes, please contact your Fronted representative.
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default F6v2_PayrollTab;
