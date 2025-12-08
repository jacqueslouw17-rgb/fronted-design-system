/**
 * Flow 6 v2 - Payroll Tab (Company Admin Self-Run)
 * 
 * Full payroll workbench cloned from Flow 7 v1, adapted for Company Admin.
 * Includes: Review & Compute workbench, Batch Review sub-views.
 * No Fronted-only actions (proxy approve).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Building2, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Settings,
  Lock,
  Info,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  Edit2,
  Users,
  AlertTriangle,
  Calculator,
  FileText,
  MoreVertical,
  Unlock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Types
interface WorkerV2 {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  employmentType: "employee" | "contractor";
  baseSalary: number;
  netPay: number;
  status: "Active" | "Snoozed";
  role?: string;
  lineItems: LineItemV2[];
  overrides: OverrideV2[];
}

interface LineItemV2 {
  id: string;
  label: string;
  amount: number;
  type: "earnings" | "deduction" | "contribution";
  editable: boolean;
  locked?: boolean;
}

interface OverrideV2 {
  id: string;
  field: string;
  oldValue: number;
  newValue: number;
  reason: string;
  appliedAt: string;
  appliedBy: string;
  bulkApplied?: boolean;
}

interface CountryRuleV2 {
  id: string;
  label: string;
  value: string;
  clientEditable: boolean;
  category: "pay" | "contributions" | "constraints";
}

// Mock data
const mockWorkersV2: WorkerV2[] = [
  {
    id: "w1",
    name: "Maria Santos",
    country: "Philippines",
    countryCode: "PH",
    currency: "PHP",
    employmentType: "employee",
    baseSalary: 85000,
    netPay: 72500,
    status: "Active",
    role: "Senior Backend Engineer",
    lineItems: [
      { id: "l1", label: "Base Salary", amount: 85000, type: "earnings", editable: false },
      { id: "l2", label: "SSS (Employee)", amount: 1350, type: "deduction", editable: false, locked: true },
      { id: "l3", label: "PhilHealth", amount: 425, type: "deduction", editable: false, locked: true },
      { id: "l4", label: "Pag-IBIG", amount: 100, type: "deduction", editable: false, locked: true },
      { id: "l5", label: "Withholding Tax", amount: 10625, type: "deduction", editable: true },
    ],
    overrides: []
  },
  {
    id: "w2",
    name: "John Chen",
    country: "Singapore",
    countryCode: "SG",
    currency: "SGD",
    employmentType: "employee",
    baseSalary: 6500,
    netPay: 5850,
    status: "Active",
    role: "Product Designer",
    lineItems: [
      { id: "l1", label: "Base Salary", amount: 6500, type: "earnings", editable: false },
      { id: "l2", label: "CPF (Employee)", amount: 650, type: "deduction", editable: false, locked: true },
    ],
    overrides: []
  },
  {
    id: "w3",
    name: "Sarah Williams",
    country: "United Kingdom",
    countryCode: "GB",
    currency: "GBP",
    employmentType: "contractor",
    baseSalary: 4800,
    netPay: 4800,
    status: "Active",
    role: "Frontend Developer",
    lineItems: [
      { id: "l1", label: "Monthly Retainer", amount: 4800, type: "earnings", editable: false },
    ],
    overrides: []
  }
];

const countryRulesConfigV2: Record<string, CountryRuleV2[]> = {
  PH: [
    { id: "r1", label: "Pay Cycle", value: "Bi-monthly (1st-15th, 16th-End)", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Calendar days (21.67 days/month)", clientEditable: true, category: "pay" },
    { id: "r3", label: "SSS Employer Rate", value: "9.5%", clientEditable: false, category: "contributions" },
    { id: "r4", label: "PhilHealth Rate", value: "5% (split)", clientEditable: false, category: "contributions" },
    { id: "r5", label: "Pag-IBIG", value: "₱100 fixed", clientEditable: false, category: "contributions" },
    { id: "r6", label: "13th Month Pay", value: "Mandatory (December)", clientEditable: false, category: "constraints" },
    { id: "r7", label: "Overtime Rate", value: "125% first 2hrs, 130% after", clientEditable: true, category: "constraints" },
  ],
  SG: [
    { id: "r1", label: "Pay Cycle", value: "Monthly (end of month)", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Working days", clientEditable: true, category: "pay" },
    { id: "r3", label: "CPF Employer Rate", value: "17%", clientEditable: false, category: "contributions" },
    { id: "r4", label: "CPF Employee Rate", value: "20%", clientEditable: false, category: "contributions" },
  ],
  GB: [
    { id: "r1", label: "Pay Cycle", value: "Monthly", clientEditable: false, category: "pay" },
    { id: "r2", label: "Proration Method", value: "Working days", clientEditable: true, category: "pay" },
    { id: "r3", label: "National Insurance", value: "13.8% employer", clientEditable: false, category: "contributions" },
  ]
};

export const F6v2_PayrollTab = () => {
  // Sub-nav state
  const [payrollSubView, setPayrollSubView] = useState<"compute" | "batch">("compute");
  
  // Cycle selection
  const [selectedCycle, setSelectedCycle] = useState<"previous" | "current" | "next">("current");
  
  // Workers state
  const [workers, setWorkers] = useState<WorkerV2[]>(mockWorkersV2);
  const [selectedWorker, setSelectedWorker] = useState<WorkerV2 | null>(null);
  const [workerDrawerOpen, setWorkerDrawerOpen] = useState(false);
  const [expandedWorkers, setExpandedWorkers] = useState<string[]>([]);
  
  // Country Rules drawer
  const [countryRulesDrawerOpen, setCountryRulesDrawerOpen] = useState(false);
  const [selectedCountryForRules, setSelectedCountryForRules] = useState<string>("PH");
  const [ruleOverrides, setRuleOverrides] = useState<Record<string, Record<string, string>>>({});
  const [pendingRuleChanges, setPendingRuleChanges] = useState<Record<string, string>>({});
  const [ruleChangeWarningOpen, setRuleChangeWarningOpen] = useState(false);
  
  // Override modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState<LineItemV2 | null>(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [bulkApplyOverride, setBulkApplyOverride] = useState(false);
  
  // Batch state
  const [batchCreated, setBatchCreated] = useState(false);
  const [batchApproved, setBatchApproved] = useState(false);
  
  // Compute state
  const [isComputing, setIsComputing] = useState(false);
  const [lastComputed, setLastComputed] = useState<Date | null>(null);

  const cycleData = {
    previous: { label: "October 2025", status: "completed" as const },
    current: { label: "November 2025", status: "active" as const },
    next: { label: "December 2025", status: "upcoming" as const }
  };

  const currentCycle = cycleData[selectedCycle];

  // Handlers
  const handleComputeRun = () => {
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
      setLastComputed(new Date());
      toast.success("Payroll computed successfully");
    }, 2000);
  };

  const handleSendToBatch = () => {
    setBatchCreated(true);
    setPayrollSubView("batch");
    toast.success("Batch created. Review and approve to execute.");
  };

  const handleApproveBatch = () => {
    setBatchApproved(true);
    toast.success("Batch approved! Ready for execution.");
  };

  const handleOpenWorkerDrawer = (worker: WorkerV2) => {
    setSelectedWorker(worker);
    setWorkerDrawerOpen(true);
  };

  const handleOpenOverrideModal = (worker: WorkerV2, lineItem: LineItemV2) => {
    setSelectedWorker(worker);
    setSelectedLineItem(lineItem);
    setOverrideValue(lineItem.amount.toString());
    setOverrideReason("");
    setBulkApplyOverride(false);
    setOverrideModalOpen(true);
  };

  const handleApplyOverride = () => {
    if (!selectedWorker || !selectedLineItem || !overrideReason.trim()) {
      toast.error("Please provide a reason for the override");
      return;
    }

    const newValue = parseFloat(overrideValue);
    const override: OverrideV2 = {
      id: `ovr-${Date.now()}`,
      field: selectedLineItem.label,
      oldValue: selectedLineItem.amount,
      newValue,
      reason: overrideReason,
      appliedAt: new Date().toISOString(),
      appliedBy: "Company Admin",
      bulkApplied: bulkApplyOverride
    };

    if (bulkApplyOverride) {
      // Apply to all workers in same country/currency
      setWorkers(prev => prev.map(w => {
        if (w.countryCode === selectedWorker.countryCode && w.currency === selectedWorker.currency) {
          return {
            ...w,
            lineItems: w.lineItems.map(li => 
              li.label === selectedLineItem.label ? { ...li, amount: newValue } : li
            ),
            overrides: [...w.overrides, { ...override, id: `ovr-${Date.now()}-${w.id}` }]
          };
        }
        return w;
      }));
      toast.success(`Override applied to all ${selectedWorker.country}/${selectedWorker.currency} workers`);
    } else {
      setWorkers(prev => prev.map(w => {
        if (w.id === selectedWorker.id) {
          return {
            ...w,
            lineItems: w.lineItems.map(li => 
              li.id === selectedLineItem.id ? { ...li, amount: newValue } : li
            ),
            overrides: [...w.overrides, override]
          };
        }
        return w;
      }));
      toast.success(`Override applied to ${selectedWorker.name}`);
    }

    setOverrideModalOpen(false);
    setOverrideReason("");
    setOverrideValue("");
  };

  const handleBulkApplyFromMenu = (worker: WorkerV2, lineItem: LineItemV2) => {
    setSelectedWorker(worker);
    setSelectedLineItem(lineItem);
    setBulkApplyOverride(true);
    setOverrideValue(lineItem.amount.toString());
    setOverrideReason("");
    setOverrideModalOpen(true);
  };

  const handleSaveRuleOverride = () => {
    if (Object.keys(pendingRuleChanges).length === 0) return;
    
    setRuleOverrides(prev => ({
      ...prev,
      [selectedCountryForRules]: {
        ...prev[selectedCountryForRules],
        ...pendingRuleChanges
      }
    }));
    
    setPendingRuleChanges({});
    setRuleChangeWarningOpen(false);
    setCountryRulesDrawerOpen(false);
    
    // Trigger recompute
    handleComputeRun();
    toast.success("Rule overrides saved. Recomputing payroll...");
  };

  const toggleWorkerExpand = (workerId: string) => {
    setExpandedWorkers(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const employeeCount = workers.filter(w => w.employmentType === "employee" && w.status === "Active").length;
  const contractorCount = workers.filter(w => w.employmentType === "contractor" && w.status === "Active").length;
  const totalPayroll = workers.filter(w => w.status === "Active").reduce((sum, w) => sum + w.netPay, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Payroll Overview Card */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/20 bg-card/30 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">Payroll Overview</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs font-medium px-2.5 py-0.5",
                        currentCycle.status === "completed" && "bg-accent-green-fill/20 text-accent-green-text border-accent-green-outline",
                        currentCycle.status === "active" && "bg-blue-500/20 text-blue-600 border-blue-500/40",
                        currentCycle.status === "upcoming" && "bg-amber-500/20 text-amber-600 border-amber-500/40"
                      )}
                    >
                      {currentCycle.status === "completed" ? "Completed" : currentCycle.status === "active" ? "In Progress" : "Upcoming"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Pay Period</p>
                      <p className="text-sm font-medium text-foreground">{currentCycle.label}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Workers Included</p>
                      <p className="text-sm font-medium text-foreground">
                        {employeeCount} Employees, {contractorCount} Contractors
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedCycle} 
                    onValueChange={(value: "previous" | "current" | "next") => setSelectedCycle(value)}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs rounded-full border-border/50 bg-background/50">
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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Active Workers</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{employeeCount + contractorCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Payroll</p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    ${totalPayroll.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Last Computed</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {lastComputed ? lastComputed.toLocaleTimeString() : "Not yet computed"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub-nav Pills */}
        <div className="flex items-center gap-2">
          <Button
            variant={payrollSubView === "compute" ? "default" : "outline"}
            size="sm"
            onClick={() => setPayrollSubView("compute")}
            className="rounded-full px-4"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Review & Compute
          </Button>
          <Button
            variant={payrollSubView === "batch" ? "default" : "outline"}
            size="sm"
            onClick={() => setPayrollSubView("batch")}
            className="rounded-full px-4"
          >
            <FileText className="h-4 w-4 mr-2" />
            Batch Review
            {batchCreated && !batchApproved && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">1</Badge>
            )}
          </Button>
        </div>

        {/* Review & Compute View */}
        {payrollSubView === "compute" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Action Bar */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleComputeRun} 
                      disabled={isComputing}
                      className="gap-2"
                    >
                      <RefreshCw className={cn("h-4 w-4", isComputing && "animate-spin")} />
                      {isComputing ? "Computing..." : lastComputed ? "Recompute" : "Compute Run"}
                    </Button>
                    {lastComputed && (
                      <span className="text-xs text-muted-foreground">
                        Last computed: {lastComputed.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <Button 
                    onClick={handleSendToBatch}
                    disabled={!lastComputed}
                    variant="outline"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send to Batch
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Worker List */}
            <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead className="w-[250px]">Worker</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Base</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.filter(w => w.status === "Active").map(worker => (
                      <Collapsible key={worker.id} open={expandedWorkers.includes(worker.id)}>
                        <TableRow className="border-border/20 hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {worker.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{worker.name}</p>
                                <p className="text-xs text-muted-foreground">{worker.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{worker.country}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              worker.employmentType === "employee" 
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            )}>
                              {worker.employmentType === "employee" ? "Employee" : "Contractor"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {worker.currency} {worker.baseSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {worker.currency} {worker.netPay.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleWorkerExpand(worker.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  {expandedWorkers.includes(worker.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenWorkerDrawer(worker)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {worker.lineItems.filter(li => li.editable).map(li => (
                                    <DropdownMenuItem 
                                      key={li.id}
                                      onClick={() => handleBulkApplyFromMenu(worker, li)}
                                    >
                                      <Users className="h-4 w-4 mr-2" />
                                      Bulk Apply {li.label} to {worker.country}/{worker.currency}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/20 border-border/10">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 space-y-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Line Item Breakdown
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                                  {worker.lineItems.map(item => (
                                    <div 
                                      key={item.id} 
                                      className={cn(
                                        "flex items-center justify-between p-2 rounded-md",
                                        item.type === "earnings" ? "bg-accent-green-fill/10" : "bg-muted/30"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {item.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                                        <span className="text-xs text-foreground">{item.label}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "text-xs font-medium",
                                          item.type === "deduction" ? "text-destructive" : "text-foreground"
                                        )}>
                                          {item.type === "deduction" ? "-" : ""}{worker.currency} {item.amount.toLocaleString()}
                                        </span>
                                        {item.editable && !item.locked && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleOpenOverrideModal(worker, item)}
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {worker.overrides.length > 0 && (
                                  <div className="mt-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-xs font-medium text-amber-600 mb-2">Override Audit</p>
                                    {worker.overrides.map(ovr => (
                                      <p key={ovr.id} className="text-xs text-muted-foreground">
                                        {ovr.field}: {worker.currency} {ovr.oldValue.toLocaleString()} → {worker.currency} {ovr.newValue.toLocaleString()} 
                                        {ovr.bulkApplied && " (bulk)"} — "{ovr.reason}" by {ovr.appliedBy}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Batch Review View */}
        {payrollSubView === "batch" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {!batchCreated ? (
              <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Batch Created</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Compute your payroll run first, then send it to batch for review and approval.
                  </p>
                  <Button onClick={() => setPayrollSubView("compute")}>
                    Go to Review & Compute
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/20 bg-card/30 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Batch #{currentCycle.label.replace(' ', '-')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {employeeCount + contractorCount} workers • ${totalPayroll.toLocaleString()} total
                      </p>
                    </div>
                    <Badge variant={batchApproved ? "default" : "secondary"} className={cn(
                      batchApproved && "bg-accent-green-fill text-accent-green-text"
                    )}>
                      {batchApproved ? "Approved" : "Pending Approval"}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Batch Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-600">Employees</p>
                      </div>
                      <p className="text-xl font-semibold text-foreground">{employeeCount}</p>
                      <p className="text-xs text-muted-foreground">Post to payroll system</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <p className="text-xs font-medium text-purple-600">Contractors</p>
                      </div>
                      <p className="text-xl font-semibold text-foreground">{contractorCount}</p>
                      <p className="text-xs text-muted-foreground">Pay via payout system</p>
                    </div>
                  </div>

                  {/* Approval Action */}
                  {!batchApproved && (
                    <div className="flex items-center justify-end gap-3">
                      <Button variant="outline" onClick={() => setPayrollSubView("compute")}>
                        Back to Review
                      </Button>
                      <Button onClick={handleApproveBatch} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve Batch
                      </Button>
                    </div>
                  )}

                  {batchApproved && (
                    <div className="p-4 rounded-lg bg-accent-green-fill/10 border border-accent-green-outline/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Batch Approved</p>
                          <p className="text-xs text-muted-foreground">
                            Ready for execution. Payments will be processed on the scheduled date.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      {/* Country Rules Drawer (with editable/read-only support) */}
      <Sheet open={countryRulesDrawerOpen} onOpenChange={setCountryRulesDrawerOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Country Rules
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Some rules can be overridden for this run only. Locked rules are managed by Fronted.
            </p>
          </SheetHeader>

          <div className="space-y-6">
            <Select 
              value={selectedCountryForRules} 
              onValueChange={setSelectedCountryForRules}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>

            <Separator />

            {/* Rules by Category */}
            {["pay", "contributions", "constraints"].map(category => {
              const rules = countryRulesConfigV2[selectedCountryForRules]?.filter(r => r.category === category) || [];
              if (rules.length === 0) return null;
              
              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground capitalize">
                    {category === "pay" ? "Pay & Proration" : category === "contributions" ? "Statutory Contributions" : "Constraints & Notes"}
                  </h4>
                  <div className="space-y-2">
                    {rules.map(rule => {
                      const overrideValue = ruleOverrides[selectedCountryForRules]?.[rule.id] || pendingRuleChanges[rule.id];
                      const displayValue = overrideValue || rule.value;
                      
                      return (
                        <div 
                          key={rule.id} 
                          className={cn(
                            "p-3 rounded-md border",
                            rule.clientEditable 
                              ? "bg-background border-border" 
                              : "bg-muted/30 border-border/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {!rule.clientEditable && <Lock className="h-3 w-3 text-muted-foreground" />}
                                {rule.clientEditable && <Unlock className="h-3 w-3 text-primary" />}
                                <span className="text-xs font-medium text-foreground">{rule.label}</span>
                              </div>
                              {rule.clientEditable ? (
                                <Input
                                  value={pendingRuleChanges[rule.id] ?? displayValue}
                                  onChange={(e) => setPendingRuleChanges(prev => ({
                                    ...prev,
                                    [rule.id]: e.target.value
                                  }))}
                                  className="h-8 text-xs mt-1"
                                />
                              ) : (
                                <p className="text-xs text-muted-foreground">{displayValue}</p>
                              )}
                            </div>
                          </div>
                          {overrideValue && (
                            <Badge variant="outline" className="mt-2 text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                              Overridden for this run
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {Object.keys(pendingRuleChanges).length > 0 && (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-600">This affects calculations in this run only.</p>
                    <p className="text-xs text-muted-foreground">Baseline rules remain unchanged.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setPendingRuleChanges({});
              setCountryRulesDrawerOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRuleOverride}
              disabled={Object.keys(pendingRuleChanges).length === 0}
            >
              Save & Recompute
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Override Modal */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override {selectedLineItem?.label}</DialogTitle>
            <DialogDescription>
              Apply an override for {selectedWorker?.name}. A reason is required for audit purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Value ({selectedWorker?.currency})</Label>
              <Input
                type="number"
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Reason (required)</Label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why this override is needed..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulkApply"
                checked={bulkApplyOverride}
                onCheckedChange={(checked) => setBulkApplyOverride(checked as boolean)}
              />
              <Label htmlFor="bulkApply" className="text-sm font-normal">
                Also apply to all workers in {selectedWorker?.country}/{selectedWorker?.currency}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyOverride} disabled={!overrideReason.trim()}>
              Apply Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Worker Detail Drawer */}
      <Sheet open={workerDrawerOpen} onOpenChange={setWorkerDrawerOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>{selectedWorker?.name}</SheetTitle>
            <p className="text-xs text-muted-foreground">
              {selectedWorker?.role} • {selectedWorker?.country}
            </p>
          </SheetHeader>

          {selectedWorker && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="text-sm font-medium text-foreground capitalize">{selectedWorker.employmentType}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/30">
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="text-sm font-medium text-foreground">{selectedWorker.currency}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Payroll Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded-md bg-accent-green-fill/10">
                    <span className="text-sm">Base Salary</span>
                    <span className="text-sm font-medium">{selectedWorker.currency} {selectedWorker.baseSalary.toLocaleString()}</span>
                  </div>
                  {selectedWorker.lineItems.filter(li => li.type === "deduction").map(li => (
                    <div key={li.id} className="flex justify-between p-2 rounded-md bg-muted/30">
                      <span className="text-sm flex items-center gap-1">
                        {li.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                        {li.label}
                      </span>
                      <span className="text-sm font-medium text-destructive">
                        -{selectedWorker.currency} {li.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between p-2 rounded-md bg-primary/10">
                    <span className="text-sm font-semibold">Net Pay</span>
                    <span className="text-sm font-semibold">{selectedWorker.currency} {selectedWorker.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedWorker.overrides.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Override History</h4>
                    <div className="space-y-2">
                      {selectedWorker.overrides.map(ovr => (
                        <div key={ovr.id} className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs font-medium text-amber-600">{ovr.field}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedWorker.currency} {ovr.oldValue.toLocaleString()} → {selectedWorker.currency} {ovr.newValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">"{ovr.reason}"</p>
                          <p className="text-xs text-muted-foreground">by {ovr.appliedBy} {ovr.bulkApplied && "(bulk applied)"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
