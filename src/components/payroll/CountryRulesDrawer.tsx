import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCountrySettings } from "@/hooks/useCountrySettings";

type Country = "PH" | "NO";

interface TaxTableRow {
  id: string;
  rangeFrom: string;
  rangeTo: string;
  fixedTax: string;
  percentageOver: string;
  effectiveYear: string;
}

interface ContributionRule {
  employeeShare: string;
  employerShare: string;
  cap: string;
}

interface PhilHealthRule {
  percentage: string;
  cap: string;
  fixedDeduction: string;
}

interface NonTaxableBenefit {
  id: string;
  name: string;
  cap: string;
  exceedsTaxable: boolean;
}

interface LineItem {
  id: string;
  name: string;
  type: "Allowances" | "Bonus" | "Reimbursement" | "Deduction";
  taxable: boolean;
  cap: string;
  enabledFor: "PH" | "NO" | "All";
}

interface OvertimeHolidayRule {
  id: string;
  workType: string;
  description: string;
  rateMultiplier: string;
  appliesTo: "Hourly" | "Daily";
  notes: string;
}

interface SSSTableRow {
  id: string;
  rangeFrom: string;
  rangeTo: string;
  employeeContribution: string;
  employerContribution: string;
  effectiveYear: string;
}

interface CountryRulesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CountryRulesDrawer({ open, onOpenChange }: CountryRulesDrawerProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>("PH");
  const [allowEmployeeOverride, setAllowEmployeeOverride] = useState(false);
  
  // Country settings hook
  const { updateSettings, getSettings } = useCountrySettings();
  
  // PH Tax Table with year selector
  const [selectedTaxYear, setSelectedTaxYear] = useState("2025");
  const [taxTable, setTaxTable] = useState<TaxTableRow[]>([
    { id: "1", rangeFrom: "0", rangeTo: "20833", fixedTax: "0", percentageOver: "0", effectiveYear: "2025" },
    { id: "2", rangeFrom: "20833", rangeTo: "33332", fixedTax: "0", percentageOver: "15", effectiveYear: "2025" },
    { id: "3", rangeFrom: "33332", rangeTo: "66666", fixedTax: "1875", percentageOver: "20", effectiveYear: "2025" },
    { id: "4", rangeFrom: "66666", rangeTo: "166666", fixedTax: "8541.80", percentageOver: "25", effectiveYear: "2025" },
    { id: "5", rangeFrom: "166666", rangeTo: "666666", fixedTax: "33541.80", percentageOver: "30", effectiveYear: "2025" },
    { id: "6", rangeFrom: "666666", rangeTo: "999999999", fixedTax: "183541.80", percentageOver: "35", effectiveYear: "2025" },
  ]);

  // PH Contributions
  const [sssContribution, setSssContribution] = useState<ContributionRule>({
    employeeShare: "4.5",
    employerShare: "9.5",
    cap: "30000"
  });
  const [philHealthContribution, setPhilHealthContribution] = useState<PhilHealthRule>({
    percentage: "5",
    cap: "100000",
    fixedDeduction: "5000"
  });
  const [pagIbigFixedContribution, setPagIbigFixedContribution] = useState("100");

  // PH Non-Taxable Benefits
  const [nonTaxableBenefits, setNonTaxableBenefits] = useState<NonTaxableBenefit[]>([
    { id: "1", name: "De Minimis Benefits", cap: "10000", exceedsTaxable: true },
    { id: "2", name: "13th Month Pay", cap: "90000", exceedsTaxable: true },
  ]);

  // PH Bi-Monthly Logic
  const [biMonthlyFirstHalf, setBiMonthlyFirstHalf] = useState("50% Base + 50% Allowances (no deductions)");
  const [biMonthlySecondHalf, setBiMonthlySecondHalf] = useState("50% Base + 50% Allowances + all deductions");

  // PH Overtime & Holiday Pay Rules (Dynamic Table)
  const [overtimeHolidayRules, setOvertimeHolidayRules] = useState<OvertimeHolidayRule[]>([
    { 
      id: "1", 
      workType: "Overtime (Regular Day)", 
      description: "Work beyond 8 hours on regular working day", 
      rateMultiplier: "125", 
      appliesTo: "Hourly",
      notes: "First 2 hours: 125%, thereafter: 130%"
    },
    { 
      id: "2", 
      workType: "Rest Day / Holiday Work", 
      description: "Work performed on weekly rest day or regular holiday", 
      rateMultiplier: "130", 
      appliesTo: "Daily",
      notes: "If with overtime: additional +30% per hour"
    },
    { 
      id: "3", 
      workType: "Special Non-Working Holiday", 
      description: "Work on special non-working holiday", 
      rateMultiplier: "130", 
      appliesTo: "Daily",
      notes: "As per PH Labor Code"
    },
    { 
      id: "4", 
      workType: "Double Holiday", 
      description: "Regular holiday falling on rest day", 
      rateMultiplier: "200", 
      appliesTo: "Daily",
      notes: "Double holiday premium rate"
    },
    { 
      id: "5", 
      workType: "Night Shift Differential", 
      description: "Work between 10 PM and 6 AM", 
      rateMultiplier: "110", 
      appliesTo: "Hourly",
      notes: "Additional 10% of regular hourly rate"
    },
  ]);

  // Norway Defaults
  const [holidayPayPercent, setHolidayPayPercent] = useState("12");
  const [employerTaxPercent, setEmployerTaxPercent] = useState("14.1");
  const [pensionPercent, setPensionPercent] = useState("2");
  const [allowNorwayOverride, setAllowNorwayOverride] = useState(false);

  // Global Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", name: "Transportation Allowance", type: "Allowances", taxable: false, cap: "5000", enabledFor: "PH" },
    { id: "2", name: "Meal Allowance", type: "Allowances", taxable: false, cap: "3000", enabledFor: "PH" },
    { id: "3", name: "Performance Bonus", type: "Bonus", taxable: true, cap: "", enabledFor: "All" },
  ]);

  // Payout frequency
  const [payoutFrequency, setPayoutFrequency] = useState("bi-monthly");

  // Rate Formula Configuration - Initialize from stored settings
  const phSettings = getSettings("PH");
  const noSettings = getSettings("NO");
  const [hoursPerDay, setHoursPerDay] = useState(phSettings.hoursPerDay.toString());
  const [phDaysPerMonth, setPhDaysPerMonth] = useState(phSettings.daysPerMonth.toString());
  const [noDaysPerMonth, setNoDaysPerMonth] = useState(noSettings.daysPerMonth.toString());

  // PH SSS Contribution Table (2025)
  const [sssTable, setSssTable] = useState<SSSTableRow[]>([
    { id: "1", rangeFrom: "0", rangeTo: "4250", employeeContribution: "180", employerContribution: "380", effectiveYear: "2025" },
    { id: "2", rangeFrom: "4250", rangeTo: "4750", employeeContribution: "202.50", employerContribution: "427.50", effectiveYear: "2025" },
    { id: "3", rangeFrom: "4750", rangeTo: "5250", employeeContribution: "225", employerContribution: "475", effectiveYear: "2025" },
    { id: "4", rangeFrom: "5250", rangeTo: "5750", employeeContribution: "247.50", employerContribution: "522.50", effectiveYear: "2025" },
    { id: "5", rangeFrom: "5750", rangeTo: "6250", employeeContribution: "270", employerContribution: "570", effectiveYear: "2025" },
    { id: "6", rangeFrom: "6250", rangeTo: "6750", employeeContribution: "292.50", employerContribution: "617.50", effectiveYear: "2025" },
    { id: "7", rangeFrom: "6750", rangeTo: "7250", employeeContribution: "315", employerContribution: "665", effectiveYear: "2025" },
    { id: "8", rangeFrom: "7250", rangeTo: "7750", employeeContribution: "337.50", employerContribution: "712.50", effectiveYear: "2025" },
    { id: "9", rangeFrom: "7750", rangeTo: "8250", employeeContribution: "360", employerContribution: "760", effectiveYear: "2025" },
    { id: "10", rangeFrom: "8250", rangeTo: "8750", employeeContribution: "382.50", employerContribution: "807.50", effectiveYear: "2025" },
    { id: "11", rangeFrom: "8750", rangeTo: "9250", employeeContribution: "405", employerContribution: "855", effectiveYear: "2025" },
    { id: "12", rangeFrom: "9250", rangeTo: "9750", employeeContribution: "427.50", employerContribution: "902.50", effectiveYear: "2025" },
    { id: "13", rangeFrom: "9750", rangeTo: "10250", employeeContribution: "450", employerContribution: "950", effectiveYear: "2025" },
    { id: "14", rangeFrom: "10250", rangeTo: "10750", employeeContribution: "472.50", employerContribution: "997.50", effectiveYear: "2025" },
    { id: "15", rangeFrom: "10750", rangeTo: "11250", employeeContribution: "495", employerContribution: "1045", effectiveYear: "2025" },
    { id: "16", rangeFrom: "11250", rangeTo: "11750", employeeContribution: "517.50", employerContribution: "1092.50", effectiveYear: "2025" },
    { id: "17", rangeFrom: "11750", rangeTo: "12250", employeeContribution: "540", employerContribution: "1140", effectiveYear: "2025" },
    { id: "18", rangeFrom: "12250", rangeTo: "12750", employeeContribution: "562.50", employerContribution: "1187.50", effectiveYear: "2025" },
    { id: "19", rangeFrom: "12750", rangeTo: "13250", employeeContribution: "585", employerContribution: "1235", effectiveYear: "2025" },
    { id: "20", rangeFrom: "13250", rangeTo: "13750", employeeContribution: "607.50", employerContribution: "1282.50", effectiveYear: "2025" },
    { id: "21", rangeFrom: "13750", rangeTo: "14250", employeeContribution: "630", employerContribution: "1330", effectiveYear: "2025" },
    { id: "22", rangeFrom: "14250", rangeTo: "14750", employeeContribution: "652.50", employerContribution: "1377.50", effectiveYear: "2025" },
    { id: "23", rangeFrom: "14750", rangeTo: "15250", employeeContribution: "675", employerContribution: "1425", effectiveYear: "2025" },
    { id: "24", rangeFrom: "15250", rangeTo: "15750", employeeContribution: "697.50", employerContribution: "1472.50", effectiveYear: "2025" },
    { id: "25", rangeFrom: "15750", rangeTo: "16250", employeeContribution: "720", employerContribution: "1520", effectiveYear: "2025" },
    { id: "26", rangeFrom: "16250", rangeTo: "16750", employeeContribution: "742.50", employerContribution: "1567.50", effectiveYear: "2025" },
    { id: "27", rangeFrom: "16750", rangeTo: "17250", employeeContribution: "765", employerContribution: "1615", effectiveYear: "2025" },
    { id: "28", rangeFrom: "17250", rangeTo: "17750", employeeContribution: "787.50", employerContribution: "1662.50", effectiveYear: "2025" },
    { id: "29", rangeFrom: "17750", rangeTo: "18250", employeeContribution: "810", employerContribution: "1710", effectiveYear: "2025" },
    { id: "30", rangeFrom: "18250", rangeTo: "18750", employeeContribution: "832.50", employerContribution: "1757.50", effectiveYear: "2025" },
    { id: "31", rangeFrom: "18750", rangeTo: "19250", employeeContribution: "855", employerContribution: "1805", effectiveYear: "2025" },
    { id: "32", rangeFrom: "19250", rangeTo: "19750", employeeContribution: "877.50", employerContribution: "1852.50", effectiveYear: "2025" },
    { id: "33", rangeFrom: "19750", rangeTo: "20250", employeeContribution: "900", employerContribution: "1900", effectiveYear: "2025" },
    { id: "34", rangeFrom: "20250", rangeTo: "999999999", employeeContribution: "900", employerContribution: "1900", effectiveYear: "2025" },
  ]);

  const addTaxTableRow = () => {
    const newRow: TaxTableRow = {
      id: Date.now().toString(),
      rangeFrom: "",
      rangeTo: "",
      fixedTax: "",
      percentageOver: "",
      effectiveYear: selectedTaxYear,
    };
    setTaxTable([...taxTable, newRow]);
  };

  const handleTaxYearChange = (value: string) => {
    if (value === "add-new-year") {
      const currentYear = new Date().getFullYear();
      const newYear = (currentYear + 1).toString();
      
      // Check if year already exists
      const yearExists = taxTable.some(row => row.effectiveYear === newYear);
      if (yearExists) {
        toast.error(`Tax table for year ${newYear} already exists`);
        return;
      }
      
      // Create a starter row for the new year
      const starterRow: TaxTableRow = {
        id: Date.now().toString(),
        rangeFrom: "0",
        rangeTo: "",
        fixedTax: "0",
        percentageOver: "0",
        effectiveYear: newYear,
      };
      
      setTaxTable([...taxTable, starterRow]);
      setSelectedTaxYear(newYear);
      toast.success(`Created new tax year: ${newYear} - Add your tax brackets`);
    } else {
      setSelectedTaxYear(value);
    }
  };

  // Get unique years from tax table
  const availableYears = Array.from(new Set(taxTable.map(row => row.effectiveYear))).sort((a, b) => b.localeCompare(a));
  
  // Filter tax table by selected year
  const filteredTaxTable = taxTable.filter(row => row.effectiveYear === selectedTaxYear);

  const removeTaxTableRow = (id: string) => {
    setTaxTable(taxTable.filter(row => row.id !== id));
  };

  const updateTaxTableRow = (id: string, field: keyof TaxTableRow, value: string) => {
    setTaxTable(taxTable.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addNonTaxableBenefit = () => {
    const newBenefit: NonTaxableBenefit = {
      id: Date.now().toString(),
      name: "",
      cap: "",
      exceedsTaxable: true,
    };
    setNonTaxableBenefits([...nonTaxableBenefits, newBenefit]);
  };

  const removeNonTaxableBenefit = (id: string) => {
    setNonTaxableBenefits(nonTaxableBenefits.filter(benefit => benefit.id !== id));
  };

  const updateNonTaxableBenefit = (id: string, field: keyof NonTaxableBenefit, value: string | boolean) => {
    setNonTaxableBenefits(nonTaxableBenefits.map(benefit => 
      benefit.id === id ? { ...benefit, [field]: value } : benefit
    ));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: "",
      type: "Allowances",
      taxable: true,
      cap: "",
      enabledFor: "All",
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addSSSTableRow = () => {
    const newRow: SSSTableRow = {
      id: Date.now().toString(),
      rangeFrom: "",
      rangeTo: "",
      employeeContribution: "",
      employerContribution: "",
      effectiveYear: new Date().getFullYear().toString(),
    };
    setSssTable([...sssTable, newRow]);
  };

  const removeSSSTableRow = (id: string) => {
    setSssTable(sssTable.filter(row => row.id !== id));
  };

  const updateSSSTableRow = (id: string, field: keyof SSSTableRow, value: string) => {
    setSssTable(sssTable.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  // Overtime & Holiday Rules CRUD
  const addOvertimeHolidayRule = () => {
    const newRule: OvertimeHolidayRule = {
      id: `rule-${Date.now()}`,
      workType: "",
      description: "",
      rateMultiplier: "100",
      appliesTo: "Hourly",
      notes: ""
    };
    setOvertimeHolidayRules([...overtimeHolidayRules, newRule]);
  };

  const removeOvertimeHolidayRule = (id: string) => {
    setOvertimeHolidayRules(rules => rules.filter(rule => rule.id !== id));
  };

  const updateOvertimeHolidayRule = (id: string, field: keyof OvertimeHolidayRule, value: any) => {
    setOvertimeHolidayRules(rules =>
      rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule)
    );
  };

  const handleSaveCountryRules = () => {
    // Update country settings in the shared store
    updateSettings("PH", parseFloat(hoursPerDay), parseFloat(phDaysPerMonth));
    updateSettings("NO", parseFloat(hoursPerDay), parseFloat(noDaysPerMonth));
    
    const countryRules = {
      PH: {
        tax_table: taxTable,
        sss_contribution_table: sssTable,
        contributions: {
          sss: sssContribution,
          philHealth: philHealthContribution,
          pagIbig: { fixedMonthlyContribution: pagIbigFixedContribution },
        },
        non_taxable_caps: nonTaxableBenefits,
        overtime_holiday_rules: overtimeHolidayRules,
        bi_monthly_logic: {
          firstHalf: biMonthlyFirstHalf,
          secondHalf: biMonthlySecondHalf,
        },
        rate_formulas: {
          hoursPerDay: hoursPerDay,
          daysPerMonth: phDaysPerMonth,
        },
        line_items: lineItems.filter(item => item.enabledFor === "PH" || item.enabledFor === "All"),
        payout_frequency: "bi-monthly",
        allow_employee_override: allowEmployeeOverride,
      },
      NO: {
        employer_contributions: {
          holidayPay: holidayPayPercent,
          employerTax: employerTaxPercent,
          pension: pensionPercent,
        },
        rate_formulas: {
          hoursPerDay: hoursPerDay,
          daysPerMonth: noDaysPerMonth,
        },
        line_items: lineItems.filter(item => item.enabledFor === "NO" || item.enabledFor === "All"),
        payout_frequency: "monthly",
        allow_employee_override: allowNorwayOverride,
      },
    };

    console.log("Country Rules Saved:", countryRules);
    toast.success("Country rules saved successfully");
    onOpenChange(false);
  };

  const PreviewModal = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedCountry === "PH" ? "Philippines" : "Norway"} Computation Preview</DialogTitle>
          <DialogDescription>
            Example calculation using stored rules
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedCountry === "PH" ? (
            <>
              <div className="space-y-2">
                <h4 className="font-medium">Sample Employee (₱45,000 monthly)</h4>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Salary:</span>
                    <span className="font-medium">₱45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate (÷21.67):</span>
                    <span className="font-medium">₱2,076.87</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>SSS (Employee {sssContribution.employeeShare}%):</span>
                    <span className="font-medium">-₱2,025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PhilHealth ({philHealthContribution.percentage}%):</span>
                    <span className="font-medium">-₱900</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pag-IBIG (Fixed):</span>
                    <span className="font-medium">-₱{pagIbigFixedContribution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withholding Tax:</span>
                    <span className="font-medium">-₱4,541.80</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Net Pay:</span>
                    <span>₱36,633.20</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Bi-Monthly Split</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="font-medium mb-2">1st Half (15th)</div>
                    <div>{biMonthlyFirstHalf}</div>
                    <div className="mt-2 font-semibold">₱22,500</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="font-medium mb-2">2nd Half (30th)</div>
                    <div>{biMonthlySecondHalf}</div>
                    <div className="mt-2 font-semibold">₱14,133.20</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h4 className="font-medium">Sample Employee (NOK 500,000 annually)</h4>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Annual Salary:</span>
                    <span className="font-medium">NOK 500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Salary:</span>
                    <span className="font-medium">NOK 41,667</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Holiday Pay ({holidayPayPercent}%):</span>
                    <span className="font-medium">NOK 5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employer Tax ({employerTaxPercent}%):</span>
                    <span className="font-medium">NOK 5,875</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pension ({pensionPercent}%):</span>
                    <span className="font-medium">NOK 833</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Employer Cost:</span>
                    <span>NOK 53,375</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[75vw] sm:max-w-[75vw] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="text-2xl">Country Rules Configuration</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Configure country-specific payroll rules, tax tables, and defaults
              </p>
            </SheetHeader>

            {/* Country Selector */}
            <Card className="p-4">
              <Label className="text-base font-semibold mb-3 block">Select Country</Label>
              <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value as Country)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                  <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* General Compensation Defaults */}
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">General Compensation Defaults</h2>
              <div className="space-y-4">
                <div>
                  <Label>Base Monthly Salary</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set per employee. Not editable here.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Days Per Payroll Month (Divisor)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Used to calculate daily rate: Base Salary ÷ Days Per Month
                    </p>
                    <Input 
                      type="number"
                      step="0.01"
                      value={selectedCountry === "PH" ? phDaysPerMonth : noDaysPerMonth}
                      onChange={(e) => selectedCountry === "PH" 
                        ? setPhDaysPerMonth(e.target.value)
                        : setNoDaysPerMonth(e.target.value)
                      }
                      placeholder="e.g., 26 or 21.67"
                    />
                  </div>
                  <div>
                    <Label>Hours Per Regular Working Day</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Used to calculate hourly rate: Daily Rate ÷ Hours Per Day
                    </p>
                    <Input 
                      type="number"
                      step="0.5"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(e.target.value)}
                      placeholder="e.g., 8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Payout Frequency</Label>
                  <Select value={payoutFrequency} onValueChange={setPayoutFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bi-monthly">Bi-monthly (PH default)</SelectItem>
                      <SelectItem value="monthly">Monthly (NO default)</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-override"
                    checked={selectedCountry === "PH" ? allowEmployeeOverride : allowNorwayOverride}
                    onCheckedChange={(checked) => 
                      selectedCountry === "PH" 
                        ? setAllowEmployeeOverride(checked as boolean)
                        : setAllowNorwayOverride(checked as boolean)
                    }
                  />
                  <Label htmlFor="allow-override" className="font-normal cursor-pointer">
                    Allow overrides per employee
                  </Label>
                </div>
              </div>
            </Card>

            {/* Country-Specific Rules */}
            {selectedCountry === "PH" ? (
              <>
                {/* PH Tax Table */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Philippine Tax Table</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-normal">Year:</Label>
                        <Select value={selectedTaxYear} onValueChange={handleTaxYearChange}>
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.map(year => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                            <SelectItem value="add-new-year">
                              <span className="flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                Add New Year
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addTaxTableRow} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Range From (₱)</TableHead>
                          <TableHead>Range To (₱)</TableHead>
                          <TableHead>Fixed Tax (₱)</TableHead>
                          <TableHead>% Over</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTaxTable.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No tax brackets for {selectedTaxYear}. Click "Add Row" to create one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTaxTable.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <Input
                                value={row.rangeFrom}
                                onChange={(e) => updateTaxTableRow(row.id, "rangeFrom", e.target.value)}
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.rangeTo}
                                onChange={(e) => updateTaxTableRow(row.id, "rangeTo", e.target.value)}
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.fixedTax}
                                onChange={(e) => updateTaxTableRow(row.id, "fixedTax", e.target.value)}
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.percentageOver}
                                onChange={(e) => updateTaxTableRow(row.id, "percentageOver", e.target.value)}
                                className="w-[80px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTaxTableRow(row.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* Government Contributions */}
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Government Contributions</h2>
                  <div className="space-y-6">
                    {/* SSS */}
                    <div>
                      <h3 className="font-medium mb-3">SSS</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Employee %</Label>
                          <Input
                            value={sssContribution.employeeShare}
                            onChange={(e) => setSssContribution({...sssContribution, employeeShare: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Employer %</Label>
                          <Input
                            value={sssContribution.employerShare}
                            onChange={(e) => setSssContribution({...sssContribution, employerShare: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Cap (₱)</Label>
                          <Input
                            value={sssContribution.cap}
                            onChange={(e) => setSssContribution({...sssContribution, cap: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* PhilHealth */}
                    <div>
                      <h3 className="font-medium mb-3">PhilHealth</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Formula: If Base Salary ≤ Cap → PhilHealth = Base Salary × %, else → Fixed Deduction
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Percentage (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={philHealthContribution.percentage}
                            onChange={(e) => setPhilHealthContribution({...philHealthContribution, percentage: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Applied when under cap</p>
                        </div>
                        <div>
                          <Label>Cap Amount (₱)</Label>
                          <Input
                            type="number"
                            value={philHealthContribution.cap}
                            onChange={(e) => setPhilHealthContribution({...philHealthContribution, cap: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Salary threshold</p>
                        </div>
                        <div>
                          <Label>Fixed Deduction (₱)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={philHealthContribution.fixedDeduction}
                            onChange={(e) => setPhilHealthContribution({...philHealthContribution, fixedDeduction: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground mt-1">Applied when over cap</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-foreground">
                          <strong>Example:</strong> Salary ₱{Number(philHealthContribution.cap).toLocaleString()} or less → 
                          {' '}{philHealthContribution.percentage}% contribution. 
                          Over ₱{Number(philHealthContribution.cap).toLocaleString()} → 
                          {' '}₱{Number(philHealthContribution.fixedDeduction).toLocaleString()} fixed.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Pag-IBIG */}
                    <div>
                      <h3 className="font-medium mb-3">Pag-IBIG</h3>
                      <div className="space-y-2">
                        <div>
                          <Label>Fixed Monthly Contribution (₱)</Label>
                          <Input
                            type="number"
                            value={pagIbigFixedContribution}
                            onChange={(e) => setPagIbigFixedContribution(e.target.value)}
                            placeholder="100"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied as a fixed amount during each pay run
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* SSS Contribution Table */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">SSS Contribution Table</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Define contribution brackets based on Gross Compensation (Base + Allowances + Bonuses)
                      </p>
                    </div>
                    <Button onClick={addSSSTableRow} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bracket
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">Range From (₱)</TableHead>
                          <TableHead className="w-[140px]">Range To (₱)</TableHead>
                          <TableHead className="w-[150px]">Employee (₱)</TableHead>
                          <TableHead className="w-[150px]">Employer (₱)</TableHead>
                          <TableHead className="w-[120px]">Effective Year</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sssTable.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <Input
                                type="number"
                                value={row.rangeFrom}
                                onChange={(e) => updateSSSTableRow(row.id, "rangeFrom", e.target.value)}
                                placeholder="0"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={row.rangeTo}
                                onChange={(e) => updateSSSTableRow(row.id, "rangeTo", e.target.value)}
                                placeholder="4250"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={row.employeeContribution}
                                onChange={(e) => updateSSSTableRow(row.id, "employeeContribution", e.target.value)}
                                placeholder="180"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={row.employerContribution}
                                onChange={(e) => updateSSSTableRow(row.id, "employerContribution", e.target.value)}
                                placeholder="380"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                value={row.effectiveYear}
                                onChange={(e) => updateSSSTableRow(row.id, "effectiveYear", e.target.value)}
                                placeholder="2025"
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSSSTableRow(row.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 The system will automatically select the correct employee contribution based on where the employee's Gross Compensation falls in these brackets.
                  </p>
                </Card>

                {/* Non-Taxable Benefits */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Non-Taxable Benefits Rules</h2>
                    <Button onClick={addNonTaxableBenefit} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {nonTaxableBenefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Input
                          placeholder="Benefit name"
                          value={benefit.name}
                          onChange={(e) => updateNonTaxableBenefit(benefit.id, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Cap (₱)"
                          value={benefit.cap}
                          onChange={(e) => updateNonTaxableBenefit(benefit.id, "cap", e.target.value)}
                          className="w-[120px]"
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`taxable-${benefit.id}`}
                            checked={benefit.exceedsTaxable}
                            onCheckedChange={(checked) => updateNonTaxableBenefit(benefit.id, "exceedsTaxable", checked)}
                          />
                          <Label htmlFor={`taxable-${benefit.id}`} className="text-xs whitespace-nowrap cursor-pointer">
                            Excess taxable
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeNonTaxableBenefit(benefit.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Overtime & Holiday Pay Rate Rules */}
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Overtime & Holiday Pay Rate Rules</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure rate multipliers for different work types and conditions
                      </p>
                    </div>
                    <Button onClick={addOvertimeHolidayRule} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Type of Work / Condition</TableHead>
                          <TableHead className="w-[220px]">Description</TableHead>
                          <TableHead className="w-[120px]">Rate Multiplier (%)</TableHead>
                          <TableHead className="w-[100px]">Applies To</TableHead>
                          <TableHead className="w-[180px]">Notes / Formula</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overtimeHolidayRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>
                              <Input
                                value={rule.workType}
                                onChange={(e) => updateOvertimeHolidayRule(rule.id, "workType", e.target.value)}
                                placeholder="e.g., Overtime"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={rule.description}
                                onChange={(e) => updateOvertimeHolidayRule(rule.id, "description", e.target.value)}
                                placeholder="Brief description"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="1"
                                value={rule.rateMultiplier}
                                onChange={(e) => updateOvertimeHolidayRule(rule.id, "rateMultiplier", e.target.value)}
                                placeholder="125"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={rule.appliesTo}
                                onValueChange={(value) => updateOvertimeHolidayRule(rule.id, "appliesTo", value as "Hourly" | "Daily")}
                              >
                                <SelectTrigger className="w-[90px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hourly">Hourly</SelectItem>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={rule.notes}
                                onChange={(e) => updateOvertimeHolidayRule(rule.id, "notes", e.target.value)}
                                placeholder="Optional notes"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOvertimeHolidayRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    These rules are automatically referenced in all PH employee payroll calculations.
                  </p>
                </Card>

                {/* Bi-Monthly Logic */}
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Bi-Monthly Computation Logic</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>1st Half (15th)</Label>
                      <Input
                        value={biMonthlyFirstHalf}
                        onChange={(e) => setBiMonthlyFirstHalf(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>2nd Half (30th)</Label>
                      <Input
                        value={biMonthlySecondHalf}
                        onChange={(e) => setBiMonthlySecondHalf(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <>
                {/* Norway Employer Defaults */}
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Norway Employer Defaults</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Holiday Pay (%)</Label>
                        <Input
                          value={holidayPayPercent}
                          onChange={(e) => setHolidayPayPercent(e.target.value)}
                          placeholder="12"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Default: 12%</p>
                      </div>
                      <div>
                        <Label>Employer Tax (%)</Label>
                        <Input
                          value={employerTaxPercent}
                          onChange={(e) => setEmployerTaxPercent(e.target.value)}
                          placeholder="14.1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Default: 14.1%</p>
                      </div>
                      <div>
                        <Label>Pension (%)</Label>
                        <Input
                          value={pensionPercent}
                          onChange={(e) => setPensionPercent(e.target.value)}
                          placeholder="2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Default: 2%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4">
                      <Checkbox
                        id="norway-override"
                        checked={allowNorwayOverride}
                        onCheckedChange={(checked) => setAllowNorwayOverride(checked as boolean)}
                      />
                      <Label htmlFor="norway-override" className="font-normal cursor-pointer">
                        Allow employee-level override
                      </Label>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Global Line Items */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Compensation Line Items (Global)</h2>
                <Button onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Taxable</TableHead>
                      <TableHead>Cap</TableHead>
                      <TableHead>For</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                            placeholder="e.g., Transportation"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.type}
                            onValueChange={(value) => updateLineItem(item.id, "type", value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Allowances">Allowances</SelectItem>
                              <SelectItem value="Bonus">Bonus</SelectItem>
                              <SelectItem value="Reimbursement">Reimbursement</SelectItem>
                              <SelectItem value="Deduction">Deduction</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={item.taxable}
                            onCheckedChange={(checked) => updateLineItem(item.id, "taxable", checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.cap}
                            onChange={(e) => updateLineItem(item.id, "cap", e.target.value)}
                            disabled={item.taxable}
                            placeholder="Amount"
                            className="w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.enabledFor}
                            onValueChange={(value) => updateLineItem(item.id, "enabledFor", value)}
                          >
                            <SelectTrigger className="w-[90px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PH">PH</SelectItem>
                              <SelectItem value="NO">NO</SelectItem>
                              <SelectItem value="All">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Save & Preview */}
            <div className="flex justify-between items-center pb-6">
              <PreviewModal />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCountryRules}>
                  Save Country Rules
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
