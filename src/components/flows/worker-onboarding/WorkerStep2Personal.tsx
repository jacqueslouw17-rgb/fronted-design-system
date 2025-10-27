import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { personalInfoSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import NationalitySelect from "@/components/shared/NationalitySelect";
import DateOfBirthPicker from "@/components/shared/DateOfBirthPicker";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { motion, AnimatePresence } from "framer-motion";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep2Personal = ({ formData, onComplete, isProcessing, isLoadingFields }: Step2Props) => {
  const [data, setData] = useState({
    fullName: formData.workerName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    nationality: formData.nationality || "",
    address: formData.address || ""
  });

  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { speak } = useTextToSpeech();

  // Simulate data retrieval with Kurt's voice
  useEffect(() => {
    if (isLoading) {
      speak("Retrieving your details...");
      
      const timer = setTimeout(() => {
        setData({
          fullName: "Maria Santos",
          email: "maria.santos@example.com",
          phone: "+63 912 345 6789",
          dateOfBirth: new Date(1995, 5, 15),
          nationality: "Philippines",
          address: "123 Main St, Manila"
        });
        setIsLoading(false);
        
        // Kurt speaks again after loading
        setTimeout(() => {
          speak("I've pre-filled your details. Please review and confirm they're correct.");
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, speak]);

  const handleContinue = () => {
    try {
      // Validate using Zod schema
      const dataToValidate = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : ""
      };
      personalInfoSchema.parse(dataToValidate);
      setValidationError("");
      onComplete("personal", dataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("Please fill in all required fields correctly");
      }
    }
  };

  const isValid = data.fullName && data.email && data.phone;

  if (isLoading || isLoadingFields) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <AudioWaveVisualizer isActive={true} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h3 className="text-lg font-semibold">Retrieving your details...</h3>
            <p className="text-sm text-muted-foreground">Please wait a moment</p>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6 p-6"
      >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Confirm Your Personal Information</h3>
        <p className="text-sm text-muted-foreground">
          Please review and correct any information below. These details were pre-filled from your contract.
        </p>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => setData({ ...data, fullName: e.target.value })}
            placeholder="Enter your full legal name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>

        <DateOfBirthPicker
          value={data.dateOfBirth}
          onChange={(date) => setData({ ...data, dateOfBirth: date })}
        />

        <NationalitySelect
          value={data.nationality}
          onValueChange={(value) => setData({ ...data, nationality: value })}
        />

        <div className="space-y-2">
          <Label htmlFor="address">Residential Address</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            placeholder="Street, City, Postal Code"
          />
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Kurt says:</strong> Make sure your legal name matches your government ID exactly for compliance purposes.
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
    </motion.div>
    </AnimatePresence>
  );
};

export default WorkerStep2Personal;
