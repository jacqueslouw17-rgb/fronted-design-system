import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep2PersonalDetails = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step2Props) => {
  const [data, setData] = useState({
    fullName: formData.fullName || "",
    email: formData.email || "",
    homeAddress: formData.homeAddress || "",
    phoneNumber: formData.phoneNumber || "",
    preferredLanguage: formData.preferredLanguage || "EN"
  });

  // Sync with formData when it changes
  useEffect(() => {
    setData({
      fullName: formData.fullName || "",
      email: formData.email || "",
      homeAddress: formData.homeAddress || "",
      phoneNumber: formData.phoneNumber || "",
      preferredLanguage: formData.preferredLanguage || "EN"
    });
  }, [formData]);

  const handleContinue = () => {
    onComplete("personal_details", data);
  };

  const isValid = data.fullName && data.email && data.homeAddress && data.phoneNumber;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Personal Details</h3>
        <p className="text-sm text-muted-foreground">
          Please confirm your details and fill in any missing information.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              readOnly
              disabled
              className="bg-muted/50 text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeAddress">Home Address *</Label>
            <Input
              id="homeAddress"
              value={data.homeAddress}
              onChange={(e) => setData({ ...data, homeAddress: e.target.value })}
              placeholder="Enter your home address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language *</Label>
            <Select value={data.preferredLanguage} onValueChange={(value) => setData({ ...data, preferredLanguage: value })}>
              <SelectTrigger id="preferredLanguage">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English (EN only for pilot)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

export default CandidateStep2PersonalDetails;
