import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Lock, Info, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractorPayment {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  employmentType: "contractor" | "employee";
  baseSalary?: number;
  netPay?: number;
  role?: string;
  ftePercent?: number;
  compensationType?: "Monthly" | "Daily" | "Hourly" | "Project-Based";
  
  // Deductions for payroll preview
  taxEmployee?: number;
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  employerTax?: number;
  pension?: number;
  holidayPay?: number;
}

interface WorkerRulesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: ContractorPayment | null;
}

export default function WorkerRulesDrawer({ 
  open, 
  onOpenChange, 
  worker 
}: WorkerRulesDrawerProps) {
  const [countryRulesOpen, setCountryRulesOpen] = useState(true);
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);
  const [workerSettingsOpen, setWorkerSettingsOpen] = useState(false);
  const [earningsExpanded, setEarningsExpanded] = useState(false);
  const [deductionsExpanded, setDeductionsExpanded] = useState(false);
  const [contributionsExpanded, setContributionsExpanded] = useState(false);

  if (!worker) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-lg font-semibold">Worker Details</SheetTitle>
                <p className="text-sm text-muted-foreground">Loading worker data…</p>
              </SheetHeader>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  const isPH = worker.countryCode === "PH";
  const isNO = worker.countryCode === "NO";
  const isEmployee = worker.employmentType === "employee";

  // Calculate payroll components
  const baseSalary = worker.baseSalary || 0;
  const totalAllowances = 0; // Could be calculated from line items if needed
  const overtimeHolidayPay = 0; // Could be calculated if data available
  const grossEarnings = baseSalary + totalAllowances + overtimeHolidayPay;
  
  const employeeDeductions = (worker.taxEmployee || 0) + 
                            (worker.sssEmployee || 0) + 
                            (worker.philHealthEmployee || 0) + 
                            (worker.pagIbigEmployee || 0) + 
                            (worker.withholdingTax || 0);
  
  const employerContributions = (worker.sssEmployer || 0) + 
                               (worker.philHealthEmployer || 0) + 
                               (worker.pagIbigEmployer || 0) +
                               (baseSalary * (worker.employerTax || 0) / 100) +
                               (baseSalary * (worker.pension || 0) / 100) +
                               (baseSalary * (worker.holidayPay || 0) / 100);
  
  const netPay = grossEarnings - employeeDeductions;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg font-semibold">{worker.name}</SheetTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isEmployee ? "default" : "secondary"} className="text-xs">
                  {isEmployee ? "Employee" : "Contractor"}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{worker.role || "N/A"}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{worker.country}</span>
                {worker.ftePercent && worker.ftePercent < 100 && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{worker.ftePercent}% FTE</span>
                  </>
                )}
              </div>
            </SheetHeader>

            {/* 1. Country Rules (Read-Only) - Expanded by default */}
            <Card className="border-border">
              <Collapsible open={countryRulesOpen} onOpenChange={setCountryRulesOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Country rules (read-only)</h3>
                    </div>
                    {countryRulesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                      <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Based on Country Ruleset – managed by Fronted
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Pay & Proration Basics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Pay Cycle</p>
                          <p className="text-sm font-medium">
                            {isPH ? "Semi-monthly" : isNO ? "Monthly" : "Monthly"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Proration Method</p>
                          <p className="text-sm font-medium">
                            {isPH ? "Calendar days" : "Working days"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">FTE Treatment</p>
                          <p className="text-sm font-medium">
                            {worker.ftePercent && worker.ftePercent < 100 ? `${worker.ftePercent}% of standard` : "Full-time"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Core Statutory Items</h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Minimum Annual Leave</p>
                          <p className="text-sm font-medium">
                            {isPH ? "5 days (service incentive leave)" : isNO ? "25 days" : "20 days"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Public Holidays</p>
                          <p className="text-sm font-medium">
                            {isPH ? "12-15 national/local holidays" : isNO ? "10-11 official holidays" : "Varies by country"}
                          </p>
                        </div>
                        {isPH && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Statutory Contributions</p>
                            <div className="space-y-1 mt-1">
                              <p className="text-xs">
                                <span className="font-medium">Employee:</span> SSS, PhilHealth, Pag-IBIG, Income Tax
                              </p>
                              <p className="text-xs">
                                <span className="font-medium">Employer:</span> SSS, PhilHealth, Pag-IBIG, 13th Month Pay
                              </p>
                            </div>
                          </div>
                        )}
                        {isNO && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Statutory Contributions</p>
                            <div className="space-y-1 mt-1">
                              <p className="text-xs">
                                <span className="font-medium">Employee:</span> National Insurance, Income Tax
                              </p>
                              <p className="text-xs">
                                <span className="font-medium">Employer:</span> Social Security, Pension
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Constraints & Notes</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        These settings are derived from the official {worker.country} Country Ruleset maintained by Fronted.
                        They cannot be modified at worker or company level.
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 2. Company Settings (This Client) - Collapsed by default */}
            <Card className="border-border">
              <Collapsible open={companySettingsOpen} onOpenChange={setCompanySettingsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold">Company settings (this client)</h3>
                    </div>
                    {companySettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                      <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Company-level defaults that apply to this worker unless overridden
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Leave Policy</h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Company Annual Leave</p>
                          <p className="text-sm font-medium">
                            {isPH ? "10 days (above statutory 5)" : isNO ? "30 days (above statutory 25)" : "25 days"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Sick Leave</p>
                          <p className="text-sm font-medium">
                            {isPH ? "Included in service incentive leave" : "Unlimited (trust-based)"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isPH && isEmployee && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-foreground">Employer Contributions</h4>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">13th Month Pay</p>
                              <p className="text-sm font-medium">8.33% (statutory)</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">SSS Employer Share</p>
                              <p className="text-sm font-medium">As per SSS table (dynamic)</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Allowances Enabled</h4>
                      <div className="flex flex-wrap gap-2">
                        {isPH ? (
                          <>
                            <Badge variant="outline" className="text-xs">Transportation</Badge>
                            <Badge variant="outline" className="text-xs">Meal</Badge>
                            <Badge variant="outline" className="text-xs">Communication</Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant="outline" className="text-xs">Commute</Badge>
                            <Badge variant="outline" className="text-xs">Equipment</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* 3. Worker-Specific Settings - Collapsed by default */}
            <Card className="border-border">
              <Collapsible open={workerSettingsOpen} onOpenChange={setWorkerSettingsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold">Worker-specific settings</h3>
                    </div>
                    {workerSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                      <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Individual configurations that affect this worker's payroll
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Employment Configuration</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">FTE %</p>
                          <p className="text-sm font-medium">{worker.ftePercent || 100}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Compensation Type</p>
                          <p className="text-sm font-medium">{worker.compensationType || "Monthly"}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Individual Allowances</h4>
                      <div className="space-y-2">
                        {totalAllowances > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Active Allowances</p>
                            <p className="text-sm font-medium">{worker.currency} {totalAllowances.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No individual allowances configured</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Wage Garnishments</h4>
                      <p className="text-xs text-muted-foreground">None active</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-foreground">Leave Entitlement Override</h4>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Annual Leave</p>
                        <p className="text-sm font-medium">Using company default</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Payroll Preview Area */}
            <Card className="border-border bg-muted/20">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Payroll Preview</h3>
                  <Badge variant="outline" className="text-xs">Current Run</Badge>
                </div>

                <Separator />

                {/* Gross Earnings */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    onClick={() => setEarningsExpanded(!earningsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Gross Earnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{worker.currency} {grossEarnings.toFixed(2)}</span>
                      {earningsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </Button>
                  
                  {earningsExpanded && (
                    <div className="ml-6 space-y-1 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Base Salary</span>
                        <span className="font-medium">{worker.currency} {baseSalary.toFixed(2)}</span>
                      </div>
                      {totalAllowances > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Allowances</span>
                          <span className="font-medium">{worker.currency} {totalAllowances.toFixed(2)}</span>
                        </div>
                      )}
                      {overtimeHolidayPay > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Overtime/Holiday Pay</span>
                          <span className="font-medium">{worker.currency} {overtimeHolidayPay.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Employee Deductions */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    onClick={() => setDeductionsExpanded(!deductionsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Employee Deductions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-red-600">-{worker.currency} {employeeDeductions.toFixed(2)}</span>
                      {deductionsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </Button>
                  
                  {deductionsExpanded && (
                    <div className="ml-6 space-y-1 py-2">
                      {isPH && (
                        <>
                          {worker.sssEmployee && worker.sssEmployee > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">SSS Employee</span>
                              <span className="font-medium">{worker.currency} {worker.sssEmployee.toFixed(2)}</span>
                            </div>
                          )}
                          {worker.philHealthEmployee && worker.philHealthEmployee > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">PhilHealth</span>
                              <span className="font-medium">{worker.currency} {worker.philHealthEmployee.toFixed(2)}</span>
                            </div>
                          )}
                          {worker.pagIbigEmployee && worker.pagIbigEmployee > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Pag-IBIG</span>
                              <span className="font-medium">{worker.currency} {worker.pagIbigEmployee.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                      {worker.withholdingTax && worker.withholdingTax > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Withholding Tax</span>
                          <span className="font-medium">{worker.currency} {worker.withholdingTax.toFixed(2)}</span>
                        </div>
                      )}
                      {worker.taxEmployee && worker.taxEmployee > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Income Tax</span>
                          <span className="font-medium">{worker.currency} {worker.taxEmployee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Employer Contributions */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    onClick={() => setContributionsExpanded(!contributionsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Employer Contributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-600">{worker.currency} {employerContributions.toFixed(2)}</span>
                      {contributionsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </Button>
                  
                  {contributionsExpanded && (
                    <div className="ml-6 space-y-1 py-2">
                      {isPH && (
                        <>
                          {worker.sssEmployer && worker.sssEmployer > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">SSS Employer</span>
                              <span className="font-medium">{worker.currency} {worker.sssEmployer.toFixed(2)}</span>
                            </div>
                          )}
                          {worker.philHealthEmployer && worker.philHealthEmployer > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">PhilHealth Employer</span>
                              <span className="font-medium">{worker.currency} {worker.philHealthEmployer.toFixed(2)}</span>
                            </div>
                          )}
                          {worker.pagIbigEmployer && worker.pagIbigEmployer > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Pag-IBIG Employer</span>
                              <span className="font-medium">{worker.currency} {worker.pagIbigEmployer.toFixed(2)}</span>
                            </div>
                          )}
                          {worker.holidayPay && worker.holidayPay > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">13th Month Pay (accrual)</span>
                              <span className="font-medium">{worker.currency} {(baseSalary * worker.holidayPay / 100).toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                      {worker.pension && worker.pension > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Pension</span>
                          <span className="font-medium">{worker.currency} {(baseSalary * worker.pension / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator className="bg-border" />

                {/* Net Pay */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-sm font-semibold text-foreground">Net Pay (to worker)</span>
                  <span className="text-base font-bold text-primary">{worker.currency} {netPay.toFixed(2)}</span>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 mt-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    This preview is read-only and reflects the current payroll run. To edit worker settings, use the dedicated worker management screens.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
