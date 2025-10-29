import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Step3Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep3Compliance = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step3Props) => {
  const isContractor = formData.employmentType === "contractor";
  const country = formData.country || "PH"; // PH, NO, XK
  const { speak } = useTextToSpeech();
  
  const [isAutoFilling, setIsAutoFilling] = useState(true);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [data, setData] = useState({
    fullName: "",
    email: "",
    address: "",
    nationalIdFile: null,
    tinNumber: "",
    sssNumber: "",
    philHealthNumber: "",
    pagIbigNumber: "",
    personnummer: "",
    bankIBAN: "",
    idCardFile: null,
  });

  const [fileName, setFileName] = useState<string>("");

  // Auto-fill data from earlier steps with Kurt's voice
  useEffect(() => {
    if (isAutoFilling) {
      speak("Retrieving your details... Please wait a moment.");
      
      const timer = setTimeout(() => {
        // Simulate data retrieval and auto-fill from formData
        const fieldsToAutoFill = new Set<string>();
        const autoFilledData: any = {};

        if (formData.fullName) {
          autoFilledData.fullName = formData.fullName;
          fieldsToAutoFill.add('fullName');
        }
        if (formData.email) {
          autoFilledData.email = formData.email;
          fieldsToAutoFill.add('email');
        }
        if (formData.address) {
          autoFilledData.address = formData.address;
          fieldsToAutoFill.add('address');
        }
        if (formData.tinNumber) {
          autoFilledData.tinNumber = formData.tinNumber;
          fieldsToAutoFill.add('tinNumber');
        }
        if (formData.nationalIdFile) {
          autoFilledData.nationalIdFile = formData.nationalIdFile;
          fieldsToAutoFill.add('nationalIdFile');
        }
        if (formData.sssNumber) {
          autoFilledData.sssNumber = formData.sssNumber;
          fieldsToAutoFill.add('sssNumber');
        }
        if (formData.philHealthNumber) {
          autoFilledData.philHealthNumber = formData.philHealthNumber;
          fieldsToAutoFill.add('philHealthNumber');
        }
        if (formData.pagIbigNumber) {
          autoFilledData.pagIbigNumber = formData.pagIbigNumber;
          fieldsToAutoFill.add('pagIbigNumber');
        }
        if (formData.personnummer) {
          autoFilledData.personnummer = formData.personnummer;
          fieldsToAutoFill.add('personnummer');
        }
        if (formData.bankIBAN) {
          autoFilledData.bankIBAN = formData.bankIBAN;
          fieldsToAutoFill.add('bankIBAN');
        }
        if (formData.idCardFile) {
          autoFilledData.idCardFile = formData.idCardFile;
          fieldsToAutoFill.add('idCardFile');
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
  }, [isAutoFilling, formData, speak]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        return;
      }
      setFileName(file.name);
      setData({ ...data, [fieldName]: file });
      // Remove auto-fill indicator when user uploads their own file
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

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

  const handleRemoveFile = (fieldName: string) => {
    setFileName("");
    setData({ ...data, [fieldName]: null });
  };

  const handleContinue = () => {
    onComplete("compliance_docs", data);
  };

  // Validate based on employment type and country
  const isValid = () => {
    if (isContractor && country === "PH") {
      return data.nationalIdFile && data.tinNumber;
    } else if (!isContractor && country === "PH") {
      return data.sssNumber && data.philHealthNumber && data.pagIbigNumber;
    } else if (country === "NO") {
      return data.personnummer && data.bankIBAN;
    } else if (country === "XK") {
      return data.idCardFile && data.bankIBAN;
    }
    return false;
  };

  const renderFields = () => {
    // Contractor PH
    if (isContractor && country === "PH") {
      return (
        <>
          {/* Auto-filled Personal Info */}
          {(data.fullName || data.email || data.address) && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullName">Full Name</Label>
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
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email Address</Label>
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
                  value={data.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address">Address</Label>
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
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your address"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Upload National ID (JPG, PNG, or PDF) *</Label>
            {data.nationalIdFile ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile('nationalIdFile')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, 'nationalIdFile')}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tinNumber">TIN Number *</Label>
              {autoFilledFields.has('tinNumber') && (
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
              id="tinNumber"
              value={data.tinNumber}
              onChange={(e) => handleInputChange('tinNumber', e.target.value)}
              placeholder="000-000-000-000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankIBAN" className="text-muted-foreground">Bank Account (Optional)</Label>
            <Input
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => handleInputChange('bankIBAN', e.target.value)}
              placeholder="Can be provided later"
            />
          </div>
        </>
      );
    }
    
    // Employee PH
    if (!isContractor && country === "PH") {
      return (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sssNumber">SSS Number *</Label>
              {autoFilledFields.has('sssNumber') && (
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
              id="sssNumber"
              value={data.sssNumber}
              onChange={(e) => handleInputChange('sssNumber', e.target.value)}
              placeholder="00-0000000-0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="philHealthNumber">PhilHealth Number *</Label>
              {autoFilledFields.has('philHealthNumber') && (
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
              id="philHealthNumber"
              value={data.philHealthNumber}
              onChange={(e) => handleInputChange('philHealthNumber', e.target.value)}
              placeholder="00-000000000-0"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pagIbigNumber">Pag-IBIG Number *</Label>
              {autoFilledFields.has('pagIbigNumber') && (
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
              id="pagIbigNumber"
              value={data.pagIbigNumber}
              onChange={(e) => handleInputChange('pagIbigNumber', e.target.value)}
              placeholder="0000-0000-0000"
            />
          </div>
        </>
      );
    }
    
    // Norway
    if (country === "NO") {
      return (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="personnummer">ID Number (Personnummer) *</Label>
              {autoFilledFields.has('personnummer') && (
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
              id="personnummer"
              value={data.personnummer}
              onChange={(e) => handleInputChange('personnummer', e.target.value)}
              placeholder="00000000000"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bankIBAN">Bank IBAN *</Label>
              {autoFilledFields.has('bankIBAN') && (
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
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => handleInputChange('bankIBAN', e.target.value)}
              placeholder="NO00 0000 0000 000"
            />
          </div>
        </>
      );
    }
    
    // Kosovo
    if (country === "XK") {
      return (
        <>
          <div className="space-y-2">
            <Label>Upload ID Card (JPG, PNG, or PDF) *</Label>
            {data.idCardFile ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile('idCardFile')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileUpload(e, 'idCardFile')}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bankIBAN">Bank IBAN *</Label>
              {autoFilledFields.has('bankIBAN') && (
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
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => handleInputChange('bankIBAN', e.target.value)}
              placeholder="XK00 0000 0000 0000 0000"
            />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {isAutoFilling ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
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
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Compliance Requirements</h3>
            <p className="text-sm text-muted-foreground">
              Required documents for legal compliance in {country === "PH" ? "Philippines" : country === "NO" ? "Norway" : "Kosovo"}
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
              {renderFields()}
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
                disabled={!isValid()}
                size="lg"
              >
                Continue
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateStep3Compliance;
