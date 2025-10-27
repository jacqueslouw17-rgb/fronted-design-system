import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Upload, FileText } from "lucide-react";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep3Compliance = ({ formData, onComplete, isProcessing, isLoadingFields }: Step3Props) => {
  const country = formData.country || "Philippines";
  const isContractor = formData.employmentType === "contractor";
  
  const [data, setData] = useState({
    tinNumber: formData.tinNumber || "",
    philHealthNumber: formData.philHealthNumber || "",
    nationalId: formData.nationalId || "",
    identityDocUploaded: false,
    taxDocUploaded: false
  });

  const handleContinue = () => {
    onComplete("compliance", data);
  };

  // Determine required fields based on country
  const getRequiredDocs = () => {
    if (country === "Philippines") {
      return [
        { id: "tin", label: "TIN (Tax Identification Number)", field: "tinNumber" },
        { id: "philhealth", label: "PhilHealth Number", field: "philHealthNumber" },
        { id: "nationalId", label: "National ID or Valid Government ID", field: "nationalId" }
      ];
    } else if (country === "Norway") {
      return [
        { id: "nationalId", label: "National ID or D-Number", field: "nationalId" },
        { id: "taxCard", label: "Tax Deduction Card (Skattekort)", field: "taxCard" }
      ];
    }
    return [
      { id: "nationalId", label: "National ID or Passport", field: "nationalId" }
    ];
  };

  const requiredDocs = getRequiredDocs();
  const isValid = data.identityDocUploaded || data.tinNumber; // Simplified validation

  if (isLoadingFields) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Compliance Requirements</h3>
        <p className="text-sm text-muted-foreground">
          Upload your local identity documents required for {country}.
          {isContractor && " As a contractor, some fields may differ from employees."}
        </p>
      </div>

      <div className="space-y-4">
        {requiredDocs.map((doc) => (
          <div key={doc.id} className="space-y-2">
            <Label htmlFor={doc.id}>{doc.label}</Label>
            <Input
              id={doc.id}
              value={data[doc.field as keyof typeof data] as string}
              onChange={(e) => setData({ ...data, [doc.field]: e.target.value })}
              placeholder={`Enter your ${doc.label.toLowerCase()}`}
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label>Upload Identity Document</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, or PNG (max 10MB)
            </p>
            <Input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setData({ ...data, identityDocUploaded: true });
                }
              }}
            />
          </div>
          {data.identityDocUploaded && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              Document uploaded successfully
            </div>
          )}
        </div>

        {!isContractor && country === "Philippines" && (
          <div className="space-y-2">
            <Label>Upload PhilHealth Card (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Click to upload PhilHealth card
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Kurt says:</strong> These documents are required for compliance in {country}. 
          All uploads are encrypted and stored securely.
        </p>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Saving..." : "Continue"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WorkerStep3Compliance;
