import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
    homeAddress: formData.homeAddress || "",
    phoneNumber: formData.phoneNumber || "",
    phoneCountryCode: formData.phoneCountryCode || "+47",
    preferredLanguage: formData.preferredLanguage || "EN"
  });

  // Sync with formData when it changes
  useEffect(() => {
    setData({
      fullName: formData.fullName || "",
      email: formData.email || "",
      homeAddress: formData.homeAddress || "",
      phoneNumber: formData.phoneNumber || "",
      phoneCountryCode: formData.phoneCountryCode || "+47",
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
        </div>
      ) : (
        <div className="space-y-4">
          <StandardInput
            id="fullName"
            label="Full Name"
            value={data.fullName}
            onChange={(value) => setData({ ...data, fullName: value })}
            required
            placeholder="Enter your full name"
            helpText="As shown on your government ID"
          />

          <StandardInput
            id="email"
            label="Email"
            value={data.email}
            onChange={() => {}}
            type="email"
            required
            locked
            lockMessage="Email address is locked and cannot be changed"
          />

          <StandardInput
            id="homeAddress"
            label="Home Address"
            value={data.homeAddress}
            onChange={(value) => setData({ ...data, homeAddress: value })}
            required
            placeholder="Enter your full home address"
            helpText="Street address, city, postal code, country"
          />

          <PhoneInput
            value={data.phoneNumber}
            onChange={(value) => setData({ ...data, phoneNumber: value })}
            countryCode={data.phoneCountryCode}
            onCountryCodeChange={(code) => setData({ ...data, phoneCountryCode: code })}
            label="Phone Number"
            required
            helpText="We'll use this for important notifications"
          />
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
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep2PersonalDetails;
