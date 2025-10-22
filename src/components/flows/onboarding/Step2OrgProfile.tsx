import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building2, Mail, User, Globe, Calendar, Loader2, Plus, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import PayrollScenarioModal, { PayrollScenario } from "./PayrollScenarioModal";
import PayrollScenarioCard from "./PayrollScenarioCard";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const Step2OrgProfile = ({ formData, onComplete, isProcessing: externalProcessing, isLoadingFields = false }: Step2Props) => {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [data, setData] = useState({
    companyName: formData.companyName || "",
    legalEntityName: formData.legalEntityName || "",
    primaryContactName: formData.primaryContactName || "",
    primaryContactEmail: formData.primaryContactEmail || "",
    hqCountry: formData.hqCountry || "",
    payrollFrequency: formData.payrollFrequency || "monthly",
    payoutDay: formData.payoutDay || "25",
    dualApproval: formData.dualApproval ?? true
  });

  // Payroll scenarios state
  const [payrollScenarios, setPayrollScenarios] = useState<PayrollScenario[]>(formData.payrollScenarios || []);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<PayrollScenario | null>(null);

  // Watch for formData updates from Kurt and show loading state
  useEffect(() => {
    if (formData.companyName && formData.companyName !== data.companyName) {
      setIsLoadingData(true);
      setTimeout(() => {
        setData({
          companyName: formData.companyName || "",
          legalEntityName: formData.legalEntityName || "",
          primaryContactName: formData.primaryContactName || "",
          primaryContactEmail: formData.primaryContactEmail || "",
          hqCountry: formData.hqCountry || "",
          payrollFrequency: formData.payrollFrequency || "monthly",
          payoutDay: formData.payoutDay || "25",
          dualApproval: formData.dualApproval ?? true
        });
        setIsLoadingData(false);
      }, 600);
    }
  }, [formData.companyName, formData.primaryContactName, formData.primaryContactEmail, formData.hqCountry, formData.payrollFrequency, formData.payoutDay, formData.dualApproval, formData.legalEntityName, data.companyName]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!data.primaryContactName.trim()) newErrors.primaryContactName = "Contact name is required";
    if (!data.primaryContactEmail.trim()) {
      newErrors.primaryContactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.primaryContactEmail)) {
      newErrors.primaryContactEmail = "Invalid email format";
    }
    if (!data.hqCountry) newErrors.hqCountry = "HQ country is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Organization profile saved",
      description: "Your company information has been recorded"
    });

    onComplete("org_profile", { ...data, payrollScenarios });
  };

  const handleSaveScenario = (scenario: PayrollScenario) => {
    if (editingScenario) {
      setPayrollScenarios(prev => prev.map(s => s.id === scenario.id ? scenario : s));
      toast({
        title: "Configuration updated",
        description: "Payroll scenario has been updated"
      });
    } else {
      setPayrollScenarios(prev => [...prev, scenario]);
      toast({
        title: "Configuration added",
        description: "New payroll scenario created successfully"
      });
    }
    setEditingScenario(null);
  };

  const handleEditScenario = (scenario: PayrollScenario) => {
    setEditingScenario(scenario);
    setIsScenarioModalOpen(true);
  };

  const handleDeleteScenario = (id: string) => {
    setPayrollScenarios(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Configuration removed",
      description: "Payroll scenario has been deleted"
    });
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Company Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Company Information
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm">
              Company Name <span className="text-destructive">*</span>
            </Label>
            {isLoadingData || isLoadingFields ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Fronted Test Co"
                  className="text-sm"
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">{errors.companyName}</p>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalEntityName" className="text-sm">Legal Entity Name (Optional)</Label>
            {isLoadingData || isLoadingFields ? (
              <>
                <Skeleton className="h-9 w-full" />
                <p className="text-xs text-muted-foreground">
                  If different from company name, add it now or later
                </p>
              </>
            ) : (
              <>
                <Input
                  id="legalEntityName"
                  value={data.legalEntityName}
                  onChange={(e) => setData(prev => ({ ...prev, legalEntityName: e.target.value }))}
                  placeholder="Can be set later"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  If different from company name, add it now or later
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hqCountry" className="text-sm">
              HQ Country <span className="text-destructive">*</span>
            </Label>
            {isLoadingData || isLoadingFields ? (
              <>
                <Skeleton className="h-9 w-full" />
                <p className="text-xs text-muted-foreground">
                  Sets default currency and date formats
                </p>
              </>
            ) : (
              <>
                <Select value={data.hqCountry} onValueChange={(val) => setData(prev => ({ ...prev, hqCountry: val }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                    <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                    <SelectItem value="IN">🇮🇳 India</SelectItem>
                    <SelectItem value="XK">🇽🇰 Kosovo</SelectItem>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
                {errors.hqCountry && (
                  <p className="text-xs text-destructive">{errors.hqCountry}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sets default currency and date formats
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary Contact */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Primary Contact
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm">
              Name <span className="text-destructive">*</span>
            </Label>
            {isLoadingData || isLoadingFields ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <Input
                  id="contactName"
                  value={data.primaryContactName}
                  onChange={(e) => setData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                  placeholder="John Doe"
                  className="text-sm"
                />
                {errors.primaryContactName && (
                  <p className="text-xs text-destructive">{errors.primaryContactName}</p>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-sm">
              Email <span className="text-destructive">*</span>
            </Label>
            {isLoadingData || isLoadingFields ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.primaryContactEmail}
                  onChange={(e) => setData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                  placeholder="john@fronted.com"
                  className="text-sm"
                />
                {errors.primaryContactEmail && (
                  <p className="text-xs text-destructive">{errors.primaryContactEmail}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payroll Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Payroll Settings
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm">Payroll Frequency</Label>
            {isLoadingData || isLoadingFields ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={data.payrollFrequency}
                onValueChange={(val) => setData(prev => ({ ...prev, payrollFrequency: val }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-monthly">Bi-Monthly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutDay" className="text-sm">Preferred Payout Day</Label>
            {isLoadingData || isLoadingFields ? (
              <>
                <Skeleton className="h-9 w-full" />
                <p className="text-xs text-muted-foreground">
                  Day of the month (e.g., 25 = 25th of each month)
                </p>
              </>
            ) : (
              <>
                <Input
                  id="payoutDay"
                  type="number"
                  min="1"
                  max="31"
                  value={data.payoutDay}
                  onChange={(e) => setData(prev => ({ ...prev, payoutDay: e.target.value }))}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Day of the month (e.g., 25 = 25th of each month)
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="dualApproval" className="text-sm">Enable dual approval for payouts</Label>
              <p className="text-xs text-muted-foreground">
                Require two approvers for large payments
              </p>
            </div>
            {isLoadingData || isLoadingFields ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                id="dualApproval"
                checked={data.dualApproval}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, dualApproval: checked }))}
              />
            )}
          </div>
        </div>

        {/* Payroll Scenarios Section */}
        {!isLoadingFields && payrollScenarios.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10"
          >
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground flex-1">
              💡 Need different payroll setups per country or team? Add configurations below.
            </p>
          </motion.div>
        )}

        {!isLoadingFields && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingScenario(null);
              setIsScenarioModalOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Configuration
          </Button>
        )}

        {/* Scenario Cards */}
        {payrollScenarios.length > 0 && !isLoadingFields && (
          <div className="space-y-2 pt-2">
            <Label className="text-sm font-medium">Additional Configurations</Label>
            <AnimatePresence mode="popLayout">
              {payrollScenarios.map((scenario, index) => (
                <PayrollScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onEdit={handleEditScenario}
                  onDelete={handleDeleteScenario}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isLoadingFields ? (
        <Skeleton className="h-11 w-full" />
      ) : (
        <Button onClick={handleSave} size="lg" className="w-full" disabled={externalProcessing}>
          {externalProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      )}

      {/* Payroll Scenario Modal */}
      <PayrollScenarioModal
        open={isScenarioModalOpen}
        onOpenChange={setIsScenarioModalOpen}
        onSave={handleSaveScenario}
        editingScenario={editingScenario}
      />
    </div>
  );
};

export default Step2OrgProfile;
