import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, Loader2, FileCheck, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminComplianceSettingsProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AdminComplianceSettings = ({ 
  formData, 
  onComplete, 
  isProcessing 
}: AdminComplianceSettingsProps) => {
  const [data, setData] = useState({
    dataRetentionPolicy: formData.dataRetentionPolicy || "7-years",
    autoComplianceCheck: formData.autoComplianceCheck ?? true,
    documentExpiryReminder: formData.documentExpiryReminder || "30-days",
    laborLawUpdates: formData.laborLawUpdates ?? true,
    complianceReportFrequency: formData.complianceReportFrequency || "monthly"
  });

  const handleSave = () => {
    toast.success("Compliance settings updated successfully");
    onComplete("compliance-settings", data);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Data Retention */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Data & Document Management
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataRetention" className="text-sm">
              Default Data Retention Policy
            </Label>
            <Select
              value={data.dataRetentionPolicy}
              onValueChange={(val) => setData(prev => ({ ...prev, dataRetentionPolicy: val }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-years">3 Years</SelectItem>
                <SelectItem value="5-years">5 Years</SelectItem>
                <SelectItem value="7-years">7 Years (Recommended)</SelectItem>
                <SelectItem value="10-years">10 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Applies to contractor records and payment history
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryReminder" className="text-sm">
              Document Expiry Reminder
            </Label>
            <Select
              value={data.documentExpiryReminder}
              onValueChange={(val) => setData(prev => ({ ...prev, documentExpiryReminder: val }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-days">7 Days Before</SelectItem>
                <SelectItem value="14-days">14 Days Before</SelectItem>
                <SelectItem value="30-days">30 Days Before</SelectItem>
                <SelectItem value="60-days">60 Days Before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Notify contractors when documents are about to expire
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Automation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Compliance Automation
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="autoCheck" className="text-sm">
                Auto-run compliance checks
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically verify documents and requirements
              </p>
            </div>
            <Switch
              id="autoCheck"
              checked={data.autoComplianceCheck}
              onCheckedChange={(checked) => setData(prev => ({ ...prev, autoComplianceCheck: checked }))}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="laborUpdates" className="text-sm">
                Labor law update notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Get alerts when local regulations change
              </p>
            </div>
            <Switch
              id="laborUpdates"
              checked={data.laborLawUpdates}
              onCheckedChange={(checked) => setData(prev => ({ ...prev, laborLawUpdates: checked }))}
            />
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Compliance Reporting
          </h3>
        </div>
        
        <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportFrequency" className="text-sm">
              Report Frequency
            </Label>
            <Select
              value={data.complianceReportFrequency}
              onValueChange={(val) => setData(prev => ({ ...prev, complianceReportFrequency: val }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Receive compliance status reports via email
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSave} 
        size="lg" 
        className="w-full" 
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
};

export default AdminComplianceSettings;
