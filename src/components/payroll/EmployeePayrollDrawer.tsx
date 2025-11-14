import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, MapPin, CreditCard, Settings } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface LineItem {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
  cap?: number;
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
}

interface EmployeePayrollData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  baseSalary: number;
  netPay: number;
  employmentType: "employee";
  startDate?: string;
  nationalId?: string;
  // Line items
  lineItems: LineItem[];
  // PH specific
  sssEmployee?: number;
  sssEmployer?: number;
  philHealthEmployee?: number;
  philHealthEmployer?: number;
  pagIbigEmployee?: number;
  pagIbigEmployer?: number;
  withholdingTax?: number;
  // NO specific
  holidayPay?: number;
  employerTax?: number;
  pension?: number;
  // Override settings
  allowOverride?: boolean;
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContractorPayment | null>(null);

  const handleOpenSettings = () => {
    onOpenChange(false);
    navigate("/employee-payroll-settings", { state: { employee: formData } });
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        lineItems: employee.lineItems || [],
        allowOverride: employee.allowOverride || false,
      });
    }
  }, [employee]);

  if (!formData) return null;

  const isPH = formData.countryCode === "PH";
  const isNO = formData.countryCode === "NO";

  const calculateDailyRate = () => {
    const divisor = isPH ? 21.67 : 21.7;
    return formData.baseSalary / divisor;
  };

  const calculateHourlyRate = () => {
    return calculateDailyRate() / 8;
  };

  const calculateTotalBenefits = () => {
    return formData.lineItems
      .filter(item => !item.taxable)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTaxableTotal = () => {
    return formData.baseSalary + formData.lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateNonTaxableTotal = () => {
    return formData.lineItems
      .filter(item => !item.taxable)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalDeductions = () => {
    let total = 0;
    if (isPH) {
      total += (formData.sssEmployee || 0) +
               (formData.philHealthEmployee || 0) +
               (formData.pagIbigEmployee || 0) +
               (formData.withholdingTax || 0);
    }
    return total;
  };

  const calculateNetPay = () => {
    const gross = calculateTaxableTotal() + calculateNonTaxableTotal();
    const deductions = calculateTotalDeductions();
    return gross - deductions;
  };

  const calculateFirstHalfPay = () => {
    const gross = calculateTaxableTotal() + calculateNonTaxableTotal();
    return gross * 0.5;
  };

  const calculateSecondHalfPay = () => {
    const gross = calculateTaxableTotal() + calculateNonTaxableTotal();
    const halfGross = gross * 0.5;
    const deductions = calculateTotalDeductions();
    return halfGross - deductions;
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
      taxable: true,
    };
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newItem],
    });
  };

  const removeLineItem = (id: string) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter(item => item.id !== id),
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleSave = () => {
    const updatedData = {
      ...formData,
      netPay: calculateNetPay(),
    };
    onSave(updatedData);
    toast.success("Employee payroll updated");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <SheetTitle className="text-xl">Employee Payroll Details</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure salary, benefits, and deductions
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleOpenSettings} className="shrink-0">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </SheetHeader>

            {/* Employee Overview */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Employee Overview</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{formData.country}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Currency</Label>
                    <p className="font-medium">{formData.currency}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Contract Type</Label>
                    <Badge variant="secondary" className="text-xs">EOR Employee</Badge>
                  </div>
                  {formData.startDate && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{formData.startDate}</span>
                      </div>
                    </div>
                  )}
                  {isNO && formData.nationalId && (
                    <div>
                      <Label className="text-xs text-muted-foreground">National ID</Label>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{formData.nationalId}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Salary & Compensation */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Salary & Compensation Breakdown</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Base Monthly Salary</Label>
                    <Input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                      disabled={!formData.allowOverride}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Daily Rate</Label>
                    <Input
                      value={calculateDailyRate().toFixed(2)}
                      disabled
                      className="mt-1 bg-muted/30"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hourly Rate</Label>
                    <Input
                      value={calculateHourlyRate().toFixed(2)}
                      disabled
                      className="mt-1 bg-muted/30"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Line Items</Label>
                    <Button onClick={addLineItem} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.lineItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateLineItem(item.id, "amount", Number(e.target.value))}
                          className="w-24"
                        />
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={item.taxable}
                            onCheckedChange={(checked) => updateLineItem(item.id, "taxable", checked)}
                          />
                          <Label className="text-xs whitespace-nowrap">Tax</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* PH Deductions */}
            {isPH && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Deductions (Philippines)</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Withholding Tax</Label>
                      <Input
                        type="number"
                        value={formData.withholdingTax || 0}
                        onChange={(e) => setFormData({ ...formData, withholdingTax: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">SSS (Employee)</Label>
                      <Input
                        type="number"
                        value={formData.sssEmployee || 0}
                        onChange={(e) => setFormData({ ...formData, sssEmployee: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">PhilHealth (Employee)</Label>
                      <Input
                        type="number"
                        value={formData.philHealthEmployee || 0}
                        onChange={(e) => setFormData({ ...formData, philHealthEmployee: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pag-IBIG (Employee)</Label>
                      <Input
                        type="number"
                        value={formData.pagIbigEmployee || 0}
                        onChange={(e) => setFormData({ ...formData, pagIbigEmployee: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Employer contributions (SSS: {formData.sssEmployer || 0}, PhilHealth: {formData.philHealthEmployer || 0}, Pag-IBIG: {formData.pagIbigEmployer || 0}) are tracked separately
                  </div>
                </div>
              </Card>
            )}

            {/* NO Employer Contributions */}
            {isNO && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Employer Contributions (Norway)</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Holiday Pay (%)</Label>
                      <Input
                        type="number"
                        value={formData.holidayPay || 12}
                        onChange={(e) => setFormData({ ...formData, holidayPay: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Employer Tax (%)</Label>
                      <Input
                        type="number"
                        value={formData.employerTax || 14.1}
                        onChange={(e) => setFormData({ ...formData, employerTax: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pension (%)</Label>
                      <Input
                        type="number"
                        value={formData.pension || 2}
                        onChange={(e) => setFormData({ ...formData, pension: Number(e.target.value) })}
                        disabled={!formData.allowOverride}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Net Pay Result */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-4">Net Pay Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gross Pay</span>
                  <span className="font-semibold">
                    {formData.currency} {(calculateTaxableTotal() + calculateNonTaxableTotal()).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Allowances</span>
                  <span className="font-medium text-green-600">
                    +{formData.currency} {calculateNonTaxableTotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Deductions</span>
                  <span className="font-medium text-destructive">
                    -{formData.currency} {calculateTotalDeductions().toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">Net Pay</span>
                  <span className="text-lg font-bold text-primary">
                    {formData.currency} {calculateNetPay().toLocaleString()}
                  </span>
                </div>

                {isPH && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="font-medium mb-2">Bi-Monthly Split:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background p-2 rounded">
                          <p className="text-xs text-muted-foreground">1st Half (15th)</p>
                          <p className="font-semibold text-sm">
                            {formData.currency} {calculateFirstHalfPay().toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">No deductions</p>
                        </div>
                        <div className="bg-background p-2 rounded">
                          <p className="text-xs text-muted-foreground">2nd Half (30th)</p>
                          <p className="font-semibold text-sm">
                            {formData.currency} {calculateSecondHalfPay().toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">All deductions</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isNO && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="font-medium mb-2">Pay Cycle: Monthly</p>
                      <p className="text-xs text-muted-foreground">
                        Full payment processed once per month
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <SheetFooter>
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
    </Sheet>
  );
}
