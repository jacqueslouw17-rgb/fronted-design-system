import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Plus, X, Info, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useCountrySettings } from "@/hooks/useCountrySettings";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// SSS Contribution Lookup Table (2025) - Column L from official SSS table
const sssContributionTable = [
  { rangeFrom: 0, rangeTo: 4250, employeeContribution: 180 },
  { rangeFrom: 4250, rangeTo: 4750, employeeContribution: 202.50 },
  { rangeFrom: 4750, rangeTo: 5250, employeeContribution: 225 },
  { rangeFrom: 5250, rangeTo: 5750, employeeContribution: 247.50 },
  { rangeFrom: 5750, rangeTo: 6250, employeeContribution: 270 },
  { rangeFrom: 6250, rangeTo: 6750, employeeContribution: 292.50 },
  { rangeFrom: 6750, rangeTo: 7250, employeeContribution: 315 },
  { rangeFrom: 7250, rangeTo: 7750, employeeContribution: 337.50 },
  { rangeFrom: 7750, rangeTo: 8250, employeeContribution: 360 },
  { rangeFrom: 8250, rangeTo: 8750, employeeContribution: 382.50 },
  { rangeFrom: 8750, rangeTo: 9250, employeeContribution: 405 },
  { rangeFrom: 9250, rangeTo: 9750, employeeContribution: 427.50 },
  { rangeFrom: 9750, rangeTo: 10250, employeeContribution: 450 },
  { rangeFrom: 10250, rangeTo: 10750, employeeContribution: 472.50 },
  { rangeFrom: 10750, rangeTo: 11250, employeeContribution: 495 },
  { rangeFrom: 11250, rangeTo: 11750, employeeContribution: 517.50 },
  { rangeFrom: 11750, rangeTo: 12250, employeeContribution: 540 },
  { rangeFrom: 12250, rangeTo: 12750, employeeContribution: 562.50 },
  { rangeFrom: 12750, rangeTo: 13250, employeeContribution: 585 },
  { rangeFrom: 13250, rangeTo: 13750, employeeContribution: 607.50 },
  { rangeFrom: 13750, rangeTo: 14250, employeeContribution: 630 },
  { rangeFrom: 14250, rangeTo: 14750, employeeContribution: 652.50 },
  { rangeFrom: 14750, rangeTo: 15250, employeeContribution: 675 },
  { rangeFrom: 15250, rangeTo: 15750, employeeContribution: 697.50 },
  { rangeFrom: 15750, rangeTo: 16250, employeeContribution: 720 },
  { rangeFrom: 16250, rangeTo: 16750, employeeContribution: 742.50 },
  { rangeFrom: 16750, rangeTo: 17250, employeeContribution: 765 },
  { rangeFrom: 17250, rangeTo: 17750, employeeContribution: 787.50 },
  { rangeFrom: 17750, rangeTo: 18250, employeeContribution: 810 },
  { rangeFrom: 18250, rangeTo: 18750, employeeContribution: 832.50 },
  { rangeFrom: 18750, rangeTo: 19250, employeeContribution: 855 },
  { rangeFrom: 19250, rangeTo: 19750, employeeContribution: 877.50 },
  { rangeFrom: 19750, rangeTo: 20250, employeeContribution: 900 },
  { rangeFrom: 20250, rangeTo: Infinity, employeeContribution: 900 },
];

// Lookup SSS contribution based on gross compensation
const lookupSSSContribution = (grossCompensation: number): number => {
  const bracket = sssContributionTable.find(
    (row) => grossCompensation >= row.rangeFrom && grossCompensation < row.rangeTo
  );
  return bracket ? bracket.employeeContribution : 900; // Default to max if not found
};

// Calculate PhilHealth contribution based on base salary
// If Base Salary <= Cap: PhilHealth = Base Salary × Percentage
// Else: PhilHealth = Fixed Deduction
const calculatePhilHealth = (baseSalary: number, percentage: number = 5, cap: number = 100000, fixedDeduction: number = 5000): number => {
  if (baseSalary <= cap) {
    return (baseSalary * percentage) / 100;
  }
  return fixedDeduction;
};

interface LineItem {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
  applyTo: "1st_half" | "2nd_half" | "both_halves" | "full_month";
  cap?: number;
  origin?: string;
}

interface RecurringAdjustment {
  id: string;
  name: string;
  amount: number;
}

interface OvertimeHolidayEntry {
  id: string;
  ruleId: string;
  workType: string;
  rateMultiplier: number;
  appliesTo: "Hourly" | "Daily";
  quantity: number; // hours or days
}

interface ContractorPayment {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  employmentType: "contractor" | "employee";
  amount?: number;
  baseSalary?: number;
  netPay?: number;
  lineItems?: LineItem[];
  startDate?: string;
  endDate?: string;
  nationalId?: string;
  taxEmployee?: number;
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  otherDeductions?: number;
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
  status?: string;
  estFees?: number;
  fxRate?: number;
  recvLocal?: number;
  eta?: string;
  allowOverride?: boolean;
  withholdingTaxRate?: number;
  recurringAdjustments?: RecurringAdjustment[];
  
  // PH Overtime & Holiday Pay (dynamic table)
  overtimeHolidayEntries?: OvertimeHolidayEntry[];
}

interface EmployeePayrollDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: ContractorPayment | null;
  onSave: (data: ContractorPayment) => void;
}

export default function EmployeePayrollDrawer({ 
  open, 
  onOpenChange, 
  employee,
  onSave 
}: EmployeePayrollDrawerProps) {
  const [formData, setFormData] = useState<ContractorPayment | null>(null);
  const [profileOpen, setProfileOpen] = useState(true);
  const [payrollDetailsOpen, setPayrollDetailsOpen] = useState(true);
  const [compensationOpen, setCompensationOpen] = useState(true);
  const [workConditionsOpen, setWorkConditionsOpen] = useState(false);
  const [recurringAdjustmentsOpen, setRecurringAdjustmentsOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(true);
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [universalDeductionsOpen, setUniversalDeductionsOpen] = useState(true);
  const [contributionsOpen, setContributionsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Predefined adjustment types
  const [adjustmentTypes, setAdjustmentTypes] = useState<string[]>([
    "Transportation Allowance",
    "Meal Allowance",
    "Housing Allowance",
    "Performance Bonus",
    "Overtime Pay",
    "Holiday Pay",
    "Night Differential",
    "Communication Allowance",
    "Uniform Allowance",
    "Medical Allowance",
    "13th Month Pay",
    "Commission",
    "Late Deduction",
    "Absence Deduction",
    "Loan Deduction",
  ]);
  const [showCustomAdjustmentDialog, setShowCustomAdjustmentDialog] = useState(false);
  const [customAdjustmentName, setCustomAdjustmentName] = useState("");
  const [pendingAdjustmentId, setPendingAdjustmentId] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        lineItems: employee.lineItems || [],
        recurringAdjustments: employee.recurringAdjustments || [],
        allowOverride: employee.allowOverride || false,
      });
    }
  }, [employee]);

  useEffect(() => {
    if (!formData) return;
    const isPH = formData.countryCode === "PH";
    const currentTotalAllowances = (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
    const currentGrossCompensation = (formData.baseSalary || 0) + currentTotalAllowances;

    let needsUpdate = false;
    const updates: Partial<ContractorPayment> = {};

    if (isPH && !formData.allowOverride) {
      const autoSSS = lookupSSSContribution(currentGrossCompensation);
      const autoPhilHealth = calculatePhilHealth(formData.baseSalary || 0);
      const autoPagIbig = 100; // Fixed monthly contribution

      if (formData.sssEmployee !== autoSSS) { updates.sssEmployee = autoSSS; needsUpdate = true; }
      if (formData.philHealthEmployee !== autoPhilHealth) { updates.philHealthEmployee = autoPhilHealth; needsUpdate = true; }
      if (formData.pagIbigEmployee !== autoPagIbig) { updates.pagIbigEmployee = autoPagIbig; needsUpdate = true; }
    }

    if (!formData.allowOverride && formData.withholdingTaxRate) {
      const autoWithholdingTax = (currentGrossCompensation * (formData.withholdingTaxRate || 0)) / 100;
      if (Math.abs((formData.withholdingTax || 0) - autoWithholdingTax) > 0.01) {
        updates.withholdingTax = autoWithholdingTax;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setFormData(prev => prev ? ({ ...prev, ...updates }) : null);
    }
  }, [formData?.baseSalary, formData?.lineItems?.length, formData?.allowOverride, formData?.withholdingTaxRate, formData?.countryCode]);

  if (!formData) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-lg font-semibold">Employee Payroll</SheetTitle>
                <p className="text-sm text-muted-foreground">Loading employee data…</p>
              </SheetHeader>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  const isPH = formData.countryCode === "PH";
  const isNO = formData.countryCode === "NO";

  // Country-specific rate formulas (from Country Settings)
  const { getSettings } = useCountrySettings();
  const countrySettings = getSettings(isPH ? "PH" : "NO");
  const daysPerMonth = countrySettings.daysPerMonth;
  const hoursPerDay = countrySettings.hoursPerDay;
  
  const dailyRate = (formData.baseSalary || 0) / daysPerMonth;
  const hourlyRate = dailyRate / hoursPerDay;
  const totalAllowances = (formData.lineItems || []).reduce((sum, item) => sum + item.amount, 0);
  
  // Available Overtime & Holiday Rules from Country Settings (PH)
  const availableOvertimeRules = [
    { id: "1", workType: "Overtime (Regular Day)", rateMultiplier: 125, appliesTo: "Hourly" as const },
    { id: "2", workType: "Rest Day / Holiday Work", rateMultiplier: 130, appliesTo: "Daily" as const },
    { id: "3", workType: "Special Non-Working Holiday", rateMultiplier: 130, appliesTo: "Daily" as const },
    { id: "4", workType: "Double Holiday", rateMultiplier: 200, appliesTo: "Daily" as const },
    { id: "5", workType: "Night Shift Differential", rateMultiplier: 110, appliesTo: "Hourly" as const },
  ];
  
  // Calculate overtime & holiday pay from dynamic entries
  const totalOvertimeHolidayPay = (formData.overtimeHolidayEntries || []).reduce((sum, entry) => {
    const baseRate = entry.appliesTo === "Hourly" ? hourlyRate : dailyRate;
    const amount = baseRate * entry.quantity * (entry.rateMultiplier / 100);
    return sum + amount;
  }, 0);
  
  const grossCompensation = (formData.baseSalary || 0) + totalAllowances + totalOvertimeHolidayPay;

  const totalDeductions = (formData.sssEmployee || 0) + 
                          (formData.philHealthEmployee || 0) + 
                          (formData.pagIbigEmployee || 0) + 
                          (formData.withholdingTax || 0) + 
                          (formData.otherDeductions || 0);
  const totalEmployerContributions = (((formData.baseSalary || 0) * (formData.holidayPay || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.employerTax || 0)) / 100) +
                                    (((formData.baseSalary || 0) * (formData.pension || 0)) / 100);
  const netPay = grossCompensation - totalDeductions;

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      name: "New Adjustment",
      amount: 0,
      taxable: true,
      applyTo: isPH ? "both_halves" : "full_month",
      origin: "Employee Override"
    };
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem]
    }) : null);
  };

  const handleRemoveLineItem = (id: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: (prev.lineItems || []).filter(item => item.id !== id)
    }) : null);
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      lineItems: (prev.lineItems || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }) : null);
  };

  const handleAddRecurringAdjustment = () => {
    const newAdjustment: RecurringAdjustment = {
      id: `recurring-${Date.now()}`,
      name: "",
      amount: 0,
    };
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: [...(prev.recurringAdjustments || []), newAdjustment]
    }) : null);
  };

  const handleRemoveRecurringAdjustment = (id: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: (prev.recurringAdjustments || []).filter(adj => adj.id !== id)
    }) : null);
  };

  const handleRecurringAdjustmentChange = (id: string, field: keyof RecurringAdjustment, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      recurringAdjustments: (prev.recurringAdjustments || []).map(adj =>
        adj.id === id ? { ...adj, [field]: value } : adj
      )
    }) : null);
  };

  const handleAdjustmentTypeSelect = (id: string, value: string, isRecurring: boolean = false) => {
    if (value === "__create_custom__") {
      setPendingAdjustmentId(id);
      setShowCustomAdjustmentDialog(true);
    } else {
      if (isRecurring) {
        handleRecurringAdjustmentChange(id, "name", value);
      } else {
        handleLineItemChange(id, "name", value);
      }
    }
  };

  const handleCreateCustomAdjustmentType = () => {
    if (!customAdjustmentName.trim()) {
      toast.error("Please enter an adjustment type name");
      return;
    }
    
    // Add to adjustment types list
    setAdjustmentTypes(prev => [...prev, customAdjustmentName.trim()]);
    
    // Apply to pending adjustment
    if (pendingAdjustmentId) {
      const isRecurring = pendingAdjustmentId.startsWith("recurring-");
      if (isRecurring) {
        handleRecurringAdjustmentChange(pendingAdjustmentId, "name", customAdjustmentName.trim());
      } else {
        handleLineItemChange(pendingAdjustmentId, "name", customAdjustmentName.trim());
      }
    }
    
    // Reset state
    setCustomAdjustmentName("");
    setPendingAdjustmentId(null);
    setShowCustomAdjustmentDialog(false);
    toast.success("Custom adjustment type created");
  };

  const handleSave = () => {
    if (formData) {
      onSave({...formData, netPay});
      toast.success("Employee payroll updated successfully");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-lg font-semibold">Employee Payroll</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Configure salary, benefits, deductions, and settings
              </p>
            </SheetHeader>

            {/* A. Employee Profile */}
            <Card className="border-border">
              <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold">Employee Profile</h3>
                      <Badge variant="secondary" className="text-xs">Read-Only</Badge>
                    </div>
                    {profileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="font-medium mt-1">{formData.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Employment Type</Label>
                        <p className="font-medium mt-1">EOR Employee</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <p className="font-medium mt-1">{formData.country}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Currency</Label>
                        <p className="font-medium mt-1">{formData.currency}</p>
                      </div>
                      {isNO && formData.nationalId && (
                        <div>
                          <Label className="text-xs text-muted-foreground">National ID</Label>
                          <p className="font-medium mt-1">{formData.nationalId}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">Withholding Tax Rate (%)</Label>
                        <Input
                          type="number"
                          value={formData.withholdingTaxRate || 0}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, withholdingTaxRate: Number(e.target.value) }) : null)}
                          className="mt-1 h-8"
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied to gross compensation
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* B. Payroll Details */}
            <Card className="border-border">
              <Collapsible open={payrollDetailsOpen} onOpenChange={setPayrollDetailsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Payroll Details</h3>
                    {payrollDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-8 mt-1",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.startDate ? new Date(formData.startDate) : undefined}
                              onSelect={(date) => setFormData(prev => prev ? ({ ...prev, startDate: date?.toISOString() }) : null)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-xs">End Date / Last Working Day</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-8 mt-1",
                                !formData.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {formData.endDate ? format(new Date(formData.endDate), "PPP") : "Optional"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.endDate ? new Date(formData.endDate) : undefined}
                              onSelect={(date) => setFormData(prev => prev ? ({ ...prev, endDate: date?.toISOString() }) : null)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* C. Compensation Defaults */}
            <Card className="border-border">
              <Collapsible open={compensationOpen} onOpenChange={setCompensationOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Compensation Defaults</h3>
                    {compensationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Base Monthly Salary</Label>
                        <Input
                          type="number"
                          value={formData.baseSalary}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, baseSalary: Number(e.target.value) }) : null)}
                          disabled={!formData.allowOverride}
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Daily Rate</Label>
                        <Input
                          type="number"
                          value={dailyRate.toFixed(2)}
                          disabled
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                        <Input
                          type="number"
                          value={hourlyRate.toFixed(2)}
                          disabled
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Adjustment Lines</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAddLineItem}
                          disabled={!formData.allowOverride}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Adjustment
                        </Button>
                      </div>

                      {(formData.lineItems || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No adjustments configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(formData.lineItems || []).map((item) => (
                            <Card key={item.id} className="p-3 bg-muted/50">
                              <div className="flex items-start gap-2">
                                <div className="flex-1 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Name</Label>
                                      <Select
                                        value={item.name || ""}
                                        onValueChange={(value) => handleAdjustmentTypeSelect(item.id, value, false)}
                                        disabled={!formData.allowOverride}
                                      >
                                        <SelectTrigger className="h-7 text-xs mt-1">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {adjustmentTypes.map((type) => (
                                            <SelectItem key={type} value={type} className="text-xs">
                                              {type}
                                            </SelectItem>
                                          ))}
                                          <SelectItem value="__create_custom__" className="text-xs font-medium text-primary">
                                            + Create custom adjustment type
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Amount</Label>
                                      <Input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handleLineItemChange(item.id, "amount", Number(e.target.value))}
                                        disabled={!formData.allowOverride}
                                        className="mt-1 h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label className="text-xs">Taxable</Label>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <Switch
                                          checked={item.taxable}
                                          onCheckedChange={(checked) => handleLineItemChange(item.id, "taxable", checked)}
                                          disabled={!formData.allowOverride}
                                          className="scale-75"
                                        />
                                        <span className="text-xs">{item.taxable ? "Yes" : "No"}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Apply to</Label>
                                      <Select
                                        value={item.applyTo || (isPH ? "both_halves" : "full_month")}
                                        onValueChange={(value) => handleLineItemChange(item.id, "applyTo", value)}
                                        disabled={!formData.allowOverride}
                                      >
                                        <SelectTrigger className="h-7 text-xs mt-1">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {isPH ? (
                                            <>
                                              <SelectItem value="1st_half" className="text-xs">1st Half only (PH)</SelectItem>
                                              <SelectItem value="2nd_half" className="text-xs">2nd Half only (PH)</SelectItem>
                                              <SelectItem value="both_halves" className="text-xs">Both Halves (PH)</SelectItem>
                                            </>
                                          ) : (
                                            <SelectItem value="full_month" className="text-xs">Full Month</SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                {item.origin && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {item.origin}
                                  </Badge>
                                )}
                                {formData.allowOverride && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveLineItem(item.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* B2. Overtime & Holiday Pay (PH Only) */}
            {isPH && (
              <Card className="border-border">
                <Collapsible open={workConditionsOpen} onOpenChange={setWorkConditionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Overtime & Holiday Pay</h3>
                        <Badge className="text-xs">Philippines Only</Badge>
                      </div>
                      {workConditionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Select work types from configured rules. Rates and calculations are automatically applied from Country Settings.
                        </p>
                      </div>

                      {/* Overtime & Holiday Pay Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium text-xs">Work Type</th>
                                <th className="text-left px-3 py-2 font-medium text-xs">Quantity</th>
                                <th className="text-right px-3 py-2 font-medium text-xs">Rate</th>
                                <th className="text-right px-3 py-2 font-medium text-xs">Amount</th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {(formData.overtimeHolidayEntries || []).map((entry) => {
                                const baseRate = entry.appliesTo === "Hourly" ? hourlyRate : dailyRate;
                                const amount = baseRate * entry.quantity * (entry.rateMultiplier / 100);
                                
                                return (
                                  <tr key={entry.id} className="border-t">
                                    <td className="px-3 py-2">
                                      <Select
                                        value={entry.ruleId}
                                        onValueChange={(value) => {
                                          const selectedRule = availableOvertimeRules.find(r => r.id === value);
                                          if (selectedRule) {
                                            setFormData(prev => prev ? ({
                                              ...prev,
                                              overtimeHolidayEntries: (prev.overtimeHolidayEntries || []).map(e =>
                                                e.id === entry.id ? {
                                                  ...e,
                                                  ruleId: selectedRule.id,
                                                  workType: selectedRule.workType,
                                                  rateMultiplier: selectedRule.rateMultiplier,
                                                  appliesTo: selectedRule.appliesTo
                                                } : e
                                              )
                                            }) : null);
                                          }
                                        }}
                                        disabled={!formData.allowOverride}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select work type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableOvertimeRules.map(rule => (
                                            <SelectItem key={rule.id} value={rule.id}>
                                              {rule.workType}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          step="0.5"
                                          value={entry.quantity}
                                          onChange={(e) => setFormData(prev => prev ? ({
                                            ...prev,
                                            overtimeHolidayEntries: (prev.overtimeHolidayEntries || []).map(item =>
                                              item.id === entry.id ? { ...item, quantity: Number(e.target.value) } : item
                                            )
                                          }) : null)}
                                          disabled={!formData.allowOverride}
                                          className="h-8 text-xs w-20"
                                          placeholder="0"
                                        />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                          {entry.appliesTo === "Hourly" ? "hrs" : "days"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                                      {entry.rateMultiplier}%
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-xs">
                                      {formData.currency} {amount.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setFormData(prev => prev ? ({
                                          ...prev,
                                          overtimeHolidayEntries: (prev.overtimeHolidayEntries || []).filter(e => e.id !== entry.id)
                                        }) : null)}
                                        disabled={!formData.allowOverride}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        {(formData.overtimeHolidayEntries || []).length === 0 && (
                          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                            No overtime or holiday pay entries yet
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEntry: OvertimeHolidayEntry = {
                            id: `ot-${Date.now()}`,
                            ruleId: availableOvertimeRules[0].id,
                            workType: availableOvertimeRules[0].workType,
                            rateMultiplier: availableOvertimeRules[0].rateMultiplier,
                            appliesTo: availableOvertimeRules[0].appliesTo,
                            quantity: 0
                          };
                          setFormData(prev => prev ? ({
                            ...prev,
                            overtimeHolidayEntries: [...(prev.overtimeHolidayEntries || []), newEntry]
                          }) : null);
                        }}
                        disabled={!formData.allowOverride}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Overtime / Holiday Entry
                      </Button>

                      {totalOvertimeHolidayPay > 0 && (
                        <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <span className="text-xs font-medium">Total Overtime & Holiday Pay:</span>
                          <span className="text-sm font-semibold text-green-600">
                            + {formData.currency} {totalOvertimeHolidayPay.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* C. Recurring Adjustment Lines */}
            <Card className="border-border">
              <Collapsible open={recurringAdjustmentsOpen} onOpenChange={setRecurringAdjustmentsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Recurring Adjustment Lines</h3>
                    {recurringAdjustmentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          These adjustments are automatically applied to each monthly pay run
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAddRecurringAdjustment}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Adjustment
                        </Button>
                      </div>

                      {(formData.recurringAdjustments || []).length === 0 ? (
                        <p className="text-xs text-muted-foreground">No recurring adjustments configured</p>
                      ) : (
                        <div className="space-y-2">
                          {(formData.recurringAdjustments || []).map((adjustment) => (
                            <Card key={adjustment.id} className="p-3 bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Name</Label>
                                    <Select
                                      value={adjustment.name || ""}
                                      onValueChange={(value) => handleAdjustmentTypeSelect(adjustment.id, value, true)}
                                    >
                                      <SelectTrigger className="h-7 text-xs mt-1">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {adjustmentTypes.map((type) => (
                                          <SelectItem key={type} value={type} className="text-xs">
                                            {type}
                                          </SelectItem>
                                        ))}
                                        <SelectItem value="__create_custom__" className="text-xs font-medium text-primary">
                                          + Create custom adjustment type
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Amount ({formData.currency})</Label>
                                    <Input
                                      type="number"
                                      value={adjustment.amount}
                                      onChange={(e) => handleRecurringAdjustmentChange(adjustment.id, "amount", Number(e.target.value))}
                                      className="mt-1 h-7 text-xs"
                                      placeholder="Positive or negative"
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveRecurringAdjustment(adjustment.id)}
                                  className="h-6 w-6 p-0 mt-4"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* D. Employee Overrides */}
            <Card className="border-border">
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold">Employee Overrides</h3>
                    {overridesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <Label className="text-sm">Override defaults for this employee?</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enable to allow custom values specific to this employee
                        </p>
                      </div>
                      <Switch
                        checked={formData.allowOverride}
                        onCheckedChange={(checked) => setFormData(prev => prev ? ({ ...prev, allowOverride: checked }) : null)}
                      />
                    </div>

                    {formData.allowOverride && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Overrides apply only to this employee and do not change the country or company defaults.
                        </p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>


            {/* E. Government Contributions (PH Only) */}
            {isPH && (
              <Card className="border-border">
                <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Government Contributions</h3>
                        <Badge className="text-xs">Philippines Only</Badge>
                      </div>
                      {deductionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs text-foreground">
                            Default government deduction values follow PH compliance. Overrides should only be used if the employee has a special arrangement.
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            💡 SSS contribution auto-applies based on Gross Compensation bracket (₱{grossCompensation.toLocaleString()}).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">SSS (Employee Share)</Label>
                          <Input
                            type="number"
                            value={formData.sssEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, sssEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-calculated from SSS table
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">PhilHealth (Employee Share)</Label>
                          <Input
                            type="number"
                            value={formData.philHealthEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, philHealthEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Auto-calculated: {(formData.baseSalary || 0) <= 100000 
                                ? `5% of base salary`
                                : `Fixed ₱5,000`
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs">Pag-IBIG (Fixed Monthly)</Label>
                          <Input
                            type="number"
                            value={formData.pagIbigEmployee}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, pagIbigEmployee: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                          {!formData.allowOverride && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Fixed contribution (₱100 per month)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* E2. Deductions (All Countries) */}
            <Card className="border-border">
              <Collapsible open={universalDeductionsOpen} onOpenChange={setUniversalDeductionsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Deductions</h3>
                      <Badge variant="secondary" className="text-xs">All Countries</Badge>
                    </div>
                    {universalDeductionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Withholding Tax (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.withholdingTaxRate || 0}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, withholdingTaxRate: Number(e.target.value) }) : null)}
                          className="mt-1 h-8"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied to gross compensation
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Withholding Tax (Amount)</Label>
                        <Input
                          type="number"
                          value={formData.withholdingTax || 0}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, withholdingTax: Number(e.target.value) }) : null)}
                          disabled={!formData.allowOverride && !!formData.withholdingTaxRate}
                          className="mt-1 h-8"
                        />
                        {!formData.allowOverride && formData.withholdingTaxRate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Auto: {formData.withholdingTaxRate}% of {formData.currency} {grossCompensation.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Other Deductions</Label>
                        <Input
                          type="number"
                          value={formData.otherDeductions || 0}
                          onChange={(e) => setFormData(prev => prev ? ({ ...prev, otherDeductions: Number(e.target.value) }) : null)}
                          disabled={!formData.allowOverride}
                          className="mt-1 h-8"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional manual deductions
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* F. Employer Contributions (NO Only) */}
            {isNO && (
              <Card className="border-border">
                <Collapsible open={contributionsOpen} onOpenChange={setContributionsOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Employer Contributions</h3>
                        <Badge className="text-xs">Norway Only</Badge>
                      </div>
                      {contributionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3">
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground">
                          Default contribution rates follow company-level Norway settings.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Holiday Pay %</Label>
                          <Input
                            type="number"
                            value={formData.holidayPay}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, holidayPay: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Employer Tax %</Label>
                          <Input
                            type="number"
                            value={formData.employerTax}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, employerTax: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Pension Contribution %</Label>
                          <Input
                            type="number"
                            value={formData.pension}
                            onChange={(e) => setFormData(prev => prev ? ({ ...prev, pension: Number(e.target.value) }) : null)}
                            disabled={!formData.allowOverride}
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}

            {/* G. Preview */}
            <Card className="border-border">
              <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Preview</h3>
                      <Badge variant="secondary" className="text-xs">Read-Only Summary</Badge>
                    </div>
                    {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Base Salary</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {(formData.baseSalary || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Allowances</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalAllowances.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Deductions</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalDeductions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Employer Contributions</Label>
                        <p className="font-semibold mt-1">
                          {formData.currency} {totalEmployerContributions.toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Net Pay (Monthly)</Label>
                      <p className="text-2xl font-bold text-primary mt-2">
                        {formData.currency} {netPay.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Pay Cycle: {isPH ? "Bi-monthly (1st & 2nd Half)" : "Monthly"}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <SheetFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </SheetFooter>
          </div>
        </ScrollArea>
      </SheetContent>

      {/* Custom Adjustment Type Dialog */}
      <Dialog open={showCustomAdjustmentDialog} onOpenChange={setShowCustomAdjustmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Custom Adjustment Type</DialogTitle>
            <DialogDescription>
              Add a new adjustment type to use across all employees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Adjustment Type Name</Label>
              <Input
                value={customAdjustmentName}
                onChange={(e) => setCustomAdjustmentName(e.target.value)}
                placeholder="e.g., Car Allowance"
                className="mt-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCustomAdjustmentType();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomAdjustmentDialog(false);
                setCustomAdjustmentName("");
                setPendingAdjustmentId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustomAdjustmentType}>
              Create Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
