import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertCircle, Sparkles, Lock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { personalInfoSchema } from "@/lib/validation-schemas";
import { z } from "zod";
import NationalitySelect from "@/components/shared/NationalitySelect";
import DateOfBirthPicker from "@/components/shared/DateOfBirthPicker";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { motion, AnimatePresence } from "framer-motion";

interface Step2Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep2Personal = ({ formData, onComplete, isProcessing, isLoadingFields }: Step2Props) => {
  // Check if we have persisted data (revisiting step)
  const hasPersistedData = formData && Object.keys(formData).length > 0 && formData.fullName;
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [data, setData] = useState({
    fullName: formData.fullName || formData.workerName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    nationality: formData.nationality || "",
    address: formData.address || ""
  });

  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(!hasPersistedData);

  // Simulate data retrieval - visual only, no audio - ONLY if no persisted data
  useEffect(() => {
    if (isLoading && !hasPersistedData) {
      // No auto TTS
      const timer = setTimeout(() => {
        const fieldsToAutoFill = new Set<string>();
        
        setData({
          fullName: "Maria Santos",
          email: "maria.santos@example.com",
          phone: "+63 912 345 6789",
          dateOfBirth: new Date(1995, 5, 15),
          nationality: "PH",
          address: "123 Main St, Manila"
        });
        
        // Track which fields were auto-filled
        fieldsToAutoFill.add('fullName');
        fieldsToAutoFill.add('email');
        fieldsToAutoFill.add('phone');
        fieldsToAutoFill.add('dateOfBirth');
        fieldsToAutoFill.add('nationality');
        fieldsToAutoFill.add('address');
        
        setAutoFilledFields(fieldsToAutoFill);
        setIsLoading(false);
        
        // Optional follow-up visual cue
        setTimeout(() => {
          // No auto TTS
        }, 500);
      }, 2500); // Total animation time: 6 fields * 0.15s = 0.9s + 0.4s fade + 0.2s buffer = ~1.5s

      return () => clearTimeout(timer);
    } else if (hasPersistedData) {
      // If we have persisted data, mark those fields as previously filled
      const persistedFields = new Set<string>();
      if (formData.fullName || formData.workerName) persistedFields.add('fullName');
      if (formData.email) persistedFields.add('email');
      if (formData.phone) persistedFields.add('phone');
      if (formData.dateOfBirth) persistedFields.add('dateOfBirth');
      if (formData.nationality) persistedFields.add('nationality');
      if (formData.address) persistedFields.add('address');
      setAutoFilledFields(persistedFields);
    }
  }, [isLoading, hasPersistedData, formData]);

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

  const handleDateChange = (date: Date | undefined) => {
    setData({ ...data, dateOfBirth: date });
    if (autoFilledFields.has('dateOfBirth')) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete('dateOfBirth');
        return newSet;
      });
    }
  };

  const handleNationalityChange = (value: string) => {
    setData({ ...data, nationality: value });
    if (autoFilledFields.has('nationality')) {
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete('nationality');
        return newSet;
      });
    }
  };

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
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6 p-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AudioWaveVisualizer isActive={true} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-2"
              >
                <h3 className="text-lg font-semibold">Retrieving your details</h3>
                <p className="text-sm text-muted-foreground">Please wait a moment</p>
              </motion.div>
            </div>
            
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    y: -6,
                    transition: {
                      duration: 0.4,
                      delay: index * 0.15,
                      ease: "easeOut"
                    }
                  }}
                  className="space-y-2"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
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
        {/* Read-only field: Full Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              Full Name *
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            {autoFilledFields.has('fullName') && (
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
            id="fullName"
            value={data.fullName}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email Address *</Label>
            {autoFilledFields.has('email') && (
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
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="phone">Phone Number *</Label>
            {autoFilledFields.has('phone') && (
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
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>

        {/* Read-only field: Date of Birth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              Date of Birth *
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            {autoFilledFields.has('dateOfBirth') && (
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
            value={data.dateOfBirth ? data.dateOfBirth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>

        {/* Read-only field: Nationality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              Nationality *
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            {autoFilledFields.has('nationality') && (
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
            value={data.nationality === 'PH' ? '🇵🇭 Filipino' : data.nationality}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>

        {/* Read-only field: Residential Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="address" className="flex items-center gap-2">
              Residential Address *
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            {autoFilledFields.has('address') && (
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
            id="address"
            value={data.address}
            disabled
            className="bg-muted/50 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Info banner about contract-linked fields */}
      <div className="bg-blue-500/10 border-l-4 border-blue-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>Kurt says:</strong> Some details like your name, date of birth, or nationality are linked to your contract.
              To update these, please contact your HR representative so your contract stays accurate.
            </p>
          </div>
        </div>
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
