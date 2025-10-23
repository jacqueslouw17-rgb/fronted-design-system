import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep2WorkPay = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step2Props) => {
  const isContractor = formData.employmentType === "contractor";
  const country = formData.country || "PH";
  
  const [data, setData] = useState({
    role: formData.role || "",
    employmentType: formData.employmentType || "contractor",
    startDate: formData.startDate || "",
    salary: formData.salary || "",
    currency: formData.currency || "PHP",
    frequency: formData.frequency || "monthly",
    workHours: formData.workHours || "",
    paidLeave: formData.paidLeave || false,
    flexibility: formData.flexibility || "",
  });

  useEffect(() => {
    setData({
      role: formData.role || "",
      employmentType: formData.employmentType || "contractor",
      startDate: formData.startDate || "",
      salary: formData.salary || "",
      currency: formData.currency || "PHP",
      frequency: formData.frequency || "monthly",
      workHours: formData.workHours || "",
      paidLeave: formData.paidLeave || false,
      flexibility: formData.flexibility || "",
    });
  }, [formData]);

  const handleContinue = () => {
    onComplete("work_pay", data);
  };

  const isValid = data.role && data.startDate && data.salary && data.currency;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Work & Pay Details</h3>
        <p className="text-sm text-muted-foreground">
          Your role and compensation information
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Prefilled and locked fields */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              Role / Title
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input
              id="role"
              value={data.role}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Provided by ATS</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType" className="flex items-center gap-2">
              Employment Type
              <Badge variant="outline" className="text-xs">
                {formData.employmentTypeSource === "ats" ? "From ATS" : "Suggested"}
              </Badge>
            </Label>
            <Select value={data.employmentType} onValueChange={(value) => setData({ ...data, employmentType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={data.startDate}
              onChange={(e) => setData({ ...data, startDate: e.target.value })}
            />
          </div>

          {/* Dynamic fields based on employment type */}
          {isContractor ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">{data.frequency === "daily" ? "Daily Rate" : "Monthly Rate"} *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={data.salary}
                    onChange={(e) => setData({ ...data, salary: e.target.value })}
                    placeholder="85000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={data.currency} onValueChange={(value) => setData({ ...data, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">🇵🇭 PHP</SelectItem>
                      <SelectItem value="NOK">🇳🇴 NOK</SelectItem>
                      <SelectItem value="EUR">🇽🇰 EUR</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Rate Frequency *</Label>
                <Select value={data.frequency} onValueChange={(value) => setData({ ...data, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="paidLeave">Paid Leave Eligibility</Label>
                  <p className="text-xs text-muted-foreground">Include paid time off benefits</p>
                </div>
                <Switch
                  id="paidLeave"
                  checked={data.paidLeave}
                  onCheckedChange={(checked) => setData({ ...data, paidLeave: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flexibility">Work Hours Flexibility (Optional)</Label>
                <Textarea
                  id="flexibility"
                  value={data.flexibility}
                  onChange={(e) => setData({ ...data, flexibility: e.target.value })}
                  placeholder="e.g., Flexible hours, Core hours 10am-3pm, etc."
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={data.salary}
                    onChange={(e) => setData({ ...data, salary: e.target.value })}
                    placeholder="85000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={data.currency} onValueChange={(value) => setData({ ...data, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHP">🇵🇭 PHP</SelectItem>
                      <SelectItem value="NOK">🇳🇴 NOK</SelectItem>
                      <SelectItem value="EUR">🇽🇰 EUR</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workHours">Work Hours per Week</Label>
                <Input
                  id="workHours"
                  type="number"
                  value={data.workHours}
                  onChange={(e) => setData({ ...data, workHours: e.target.value })}
                  placeholder="40"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        {isProcessing ? (
          <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleContinue} 
            disabled={!isValid}
            size="lg"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep2WorkPay;
