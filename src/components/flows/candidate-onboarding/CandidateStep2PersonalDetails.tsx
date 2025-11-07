import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StandardInput from "@/components/shared/StandardInput";
import PhoneInput from "@/components/shared/PhoneInput";
interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
  buttonText?: string;
}
const CandidateStep2PersonalDetails = ({
  formData,
  onComplete,
  isProcessing = false,
  isLoadingFields = false,
  buttonText = "Continue"
}: Step2Props) => {
  const [data, setData] = useState({
    fullName: formData.fullName || "",
    email: formData.email || "",
    role: formData.role || "",
    salary: formData.salary || "",
    employmentType: formData.employmentType || "",
    idType: formData.idType || "",
    idNumber: formData.idNumber || "",
    taxResidence: formData.taxResidence || "",
    nationality: formData.nationality || undefined,
    address: formData.address || "",
    bankName: formData.bankName || "",
    accountNumber: formData.accountNumber || "",
    emergencyContactName: formData.emergencyContactName || "",
    emergencyContactPhone: formData.emergencyContactPhone || ""
  });

  // Sync with formData when it changes
  useEffect(() => {
    setData({
      fullName: formData.fullName || "",
      email: formData.email || "",
      role: formData.role || "",
      salary: formData.salary || "",
      employmentType: formData.employmentType || "",
      idType: formData.idType || "",
      idNumber: formData.idNumber || "",
      taxResidence: formData.taxResidence || "",
      nationality: formData.nationality || undefined,
      address: formData.address || "",
      bankName: formData.bankName || "",
      accountNumber: formData.accountNumber || "",
      emergencyContactName: formData.emergencyContactName || "",
      emergencyContactPhone: formData.emergencyContactPhone || ""
    });
  }, [formData]);
  const handleContinue = () => {
    onComplete("personal_details", data);
  };
  const isValid = data.fullName && data.email && data.idType && data.idNumber && data.taxResidence && data.nationality && data.address && data.bankName && data.accountNumber;
  return <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Missing Details</h3>
        <p className="text-sm text-muted-foreground">
          Please confirm your details and fill in any missing information.
        </p>
      </div>

      {isLoadingFields ? <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div> : <div className="space-y-6">
          {/* Prefilled fields */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={data.fullName} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={data.email} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={data.role} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Salary</Label>
            <Input value={data.salary} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Input value={data.employmentType} disabled className="bg-muted/50" />
            <p className="text-xs text-muted-foreground">Confirmed by admin</p>
          </div>

          {/* Divider */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-4">
              Required Fields <Badge variant="secondary" className="ml-2 text-xs">To be filled by you</Badge>
            </p>
          </div>

          {/* Required fields */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              ID Type & Number
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Select value={data.idType} onValueChange={value => setData({
          ...data,
          idType: value
        })}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national-id">National ID</SelectItem>
                <SelectItem value="drivers-license">Driver's License</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="ID Number" value={data.idNumber} onChange={e => setData({
          ...data,
          idNumber: e.target.value
        })} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Tax Residence
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input placeholder="e.g., Mexico" value={data.taxResidence} onChange={e => setData({
          ...data,
          taxResidence: e.target.value
        })} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Nationality</Label>
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </div>
            <Select value={data.nationality} onValueChange={value => setData({
          ...data,
          nationality: value
        })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your nationality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norwegian</SelectItem>
                <SelectItem value="PH">🇵🇭 Filipino</SelectItem>
                <SelectItem value="IN">🇮🇳 Indian</SelectItem>
                <SelectItem value="US">🇺🇸 American</SelectItem>
                <SelectItem value="GB">🇬🇧 British</SelectItem>
                <SelectItem value="SE">🇸🇪 Swedish</SelectItem>
                <SelectItem value="DK">🇩🇰 Danish</SelectItem>
                <SelectItem value="FI">🇫🇮 Finnish</SelectItem>
                <SelectItem value="DE">🇩🇪 German</SelectItem>
                <SelectItem value="FR">🇫🇷 French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Address
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Textarea placeholder="Full residential address" value={data.address} onChange={e => setData({
          ...data,
          address: e.target.value
        })} rows={3} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Bank Details
              <Badge variant="secondary" className="text-xs">Required</Badge>
            </Label>
            <Input placeholder="Bank Name" value={data.bankName} onChange={e => setData({
          ...data,
          bankName: e.target.value
        })} className="mb-2" />
            <Input placeholder="Account Number / IBAN" value={data.accountNumber} onChange={e => setData({
          ...data,
          accountNumber: e.target.value
        })} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Emergency Contact
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input placeholder="Name" value={data.emergencyContactName} onChange={e => setData({
          ...data,
          emergencyContactName: e.target.value
        })} className="mb-2" />
            <Input placeholder="Phone" value={data.emergencyContactPhone} onChange={e => setData({
          ...data,
          emergencyContactPhone: e.target.value
        })} />
          </div>
        </div>}

      <div className="flex justify-end pt-2">
        {isProcessing ? <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          </Button> : <Button onClick={handleContinue} disabled={!isValid} size="lg">
            {buttonText}
          </Button>}
      </div>
    </div>;
};
export default CandidateStep2PersonalDetails;