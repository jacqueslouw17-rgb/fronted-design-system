import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building2, Mail, User, Globe, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

const Step2OrgProfile = ({ formData, onComplete }: Step2Props) => {
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

    onComplete("org_profile", data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Organization Profile</h2>
        <p className="text-muted-foreground">
          Let's capture your company basics and primary contact information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Fronted Test Co"
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalEntityName">Legal Entity Name (Optional)</Label>
            <Input
              id="legalEntityName"
              value={data.legalEntityName}
              onChange={(e) => setData(prev => ({ ...prev, legalEntityName: e.target.value }))}
              placeholder="Can be set later"
            />
            <p className="text-xs text-muted-foreground">
              If different from company name, add it now or later
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hqCountry">
              HQ Country <span className="text-destructive">*</span>
            </Label>
            <Select value={data.hqCountry} onValueChange={(val) => setData(prev => ({ ...prev, hqCountry: val }))}>
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Primary Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactName"
              value={data.primaryContactName}
              onChange={(e) => setData(prev => ({ ...prev, primaryContactName: e.target.value }))}
              placeholder="John Doe"
            />
            {errors.primaryContactName && (
              <p className="text-xs text-destructive">{errors.primaryContactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={data.primaryContactEmail}
              onChange={(e) => setData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
              placeholder="john@fronted.com"
            />
            {errors.primaryContactEmail && (
              <p className="text-xs text-destructive">{errors.primaryContactEmail}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Payroll Frequency</Label>
            <Select
              value={data.payrollFrequency}
              onValueChange={(val) => setData(prev => ({ ...prev, payrollFrequency: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-monthly">Bi-Monthly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutDay">Preferred Payout Day</Label>
            <Input
              id="payoutDay"
              type="number"
              min="1"
              max="31"
              value={data.payoutDay}
              onChange={(e) => setData(prev => ({ ...prev, payoutDay: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Day of the month (e.g., 25 = 25th of each month)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dualApproval">Enable dual approval for payouts</Label>
              <p className="text-xs text-muted-foreground">
                Require two approvers for large payments
              </p>
            </div>
            <Switch
              id="dualApproval"
              checked={data.dualApproval}
              onCheckedChange={(checked) => setData(prev => ({ ...prev, dualApproval: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} size="lg" className="w-full">
        Save & Continue
      </Button>
    </div>
  );
};

export default Step2OrgProfile;
