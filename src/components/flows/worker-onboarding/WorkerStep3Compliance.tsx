import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Upload, FileText, Sparkles } from "lucide-react";
import { complianceDocSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep3Compliance = ({ formData, onComplete, isProcessing, isLoadingFields }: Step3Props) => {
  const country = formData.country || "Philippines";
  const isContractor = formData.employmentType === "contractor";
  const { speak } = useTextToSpeech();
  
  const [isAutoFilling, setIsAutoFilling] = useState(true);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [data, setData] = useState({
    tinNumber: "",
    philHealthNumber: "",
    nationalId: "",
    identityDocUploaded: false,
    taxDocUploaded: false
  });

  // Auto-fill data from earlier steps with Kurt's voice
  useEffect(() => {
    if (isAutoFilling) {
      speak("Retrieving your details... Please wait a moment.");
      
      const timer = setTimeout(() => {
        // Simulate data retrieval and auto-fill with mock data
        const fieldsToAutoFill = new Set<string>();
        const autoFilledData: any = {};

        // Auto-fill TIN if not already present
        if (formData.tinNumber) {
          autoFilledData.tinNumber = formData.tinNumber;
          fieldsToAutoFill.add('tinNumber');
        } else {
          // Provide mock data to show Kurt fetched it
          autoFilledData.tinNumber = "123-456-789-000";
          fieldsToAutoFill.add('tinNumber');
        }

        // Auto-fill PhilHealth if not already present
        if (formData.philHealthNumber) {
          autoFilledData.philHealthNumber = formData.philHealthNumber;
          fieldsToAutoFill.add('philHealthNumber');
        } else if (country === "Philippines" && !isContractor) {
          autoFilledData.philHealthNumber = "12-345678901-2";
          fieldsToAutoFill.add('philHealthNumber');
        }

        // Auto-fill National ID if not already present
        if (formData.nationalId) {
          autoFilledData.nationalId = formData.nationalId;
          fieldsToAutoFill.add('nationalId');
        } else {
          autoFilledData.nationalId = "1234-5678-9012-3456";
          fieldsToAutoFill.add('nationalId');
        }

        setData(prev => ({ ...prev, ...autoFilledData }));
        setAutoFilledFields(fieldsToAutoFill);
        setIsAutoFilling(false);

        // Kurt speaks after loading
        setTimeout(() => {
          speak("I've pre-filled your details from earlier. Please review and confirm everything looks correct.");
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAutoFilling, formData, speak, country, isContractor]);

  const handleInputChange = (fieldName: string, value: string) => {
    setData({ ...data, [fieldName]: value });
    // Remove auto-fill indicator when user edits the field
    if (autoFilledFields.has(fieldName)) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  const handleContinue = () => {
    try {
      // Validate compliance document data
      complianceDocSchema.parse({
        tinNumber: data.tinNumber,
        philHealthNumber: data.philHealthNumber,
        nationalId: data.nationalId,
        taxCard: data.nationalId // Using nationalId for taxCard validation as well
      });
      onComplete("compliance", data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Please check your compliance information");
      }
    }
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

  if (isAutoFilling) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 p-6">
        <AudioWaveVisualizer isActive={true} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h3 className="text-lg font-semibold">Retrieving your details...</h3>
          <p className="text-sm text-muted-foreground">Please wait a moment</p>
        </motion.div>
        
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between">
              <Label htmlFor={doc.id}>{doc.label}</Label>
              {autoFilledFields.has(doc.field) && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-filled by Kurt
                </motion.span>
              )}
            </div>
            <Input
              id={doc.id}
              value={data[doc.field as keyof typeof data] as string}
              onChange={(e) => handleInputChange(doc.field, e.target.value)}
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
