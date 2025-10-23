import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  // For demo, we'll use employment type and country from formData
  const employmentType = formData.employmentType || "contractor"; // contractor or employee
  const country = formData.country || "PH"; // PH, NO, XK
  
  const [data, setData] = useState({
    nationalIdFile: formData.nationalIdFile || null,
    tinNumber: formData.tinNumber || "",
    sssNumber: formData.sssNumber || "",
    philHealthNumber: formData.philHealthNumber || "",
    pagIbigNumber: formData.pagIbigNumber || "",
    personnummer: formData.personnummer || "",
    bankIBAN: formData.bankIBAN || "",
    idCardFile: formData.idCardFile || null,
    startDate: formData.startDate || "",
  });

  const [fileName, setFileName] = useState<string>("");
  const [dateWarning, setDateWarning] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        return;
      }
      setFileName(file.name);
      setData({ ...data, [fieldName]: file });
    }
  };

  const handleRemoveFile = (fieldName: string) => {
    setFileName("");
    setData({ ...data, [fieldName]: null });
  };

  const handleStartDateChange = (value: string) => {
    setData({ ...data, startDate: value });
    
    // Check for date validation issues
    const selectedDate = new Date(value);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - selectedDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays > 30) {
      setDateWarning("The start date appears to be more than 30 days in the past. Please verify this is correct.");
    } else {
      setDateWarning(null);
    }
  };

  const handleContinue = () => {
    onComplete("compliance_docs", data);
  };

  // Validate based on employment type and country
  const isValid = () => {
    if (!data.startDate) return false;
    
    if (employmentType === "contractor" && country === "PH") {
      return data.nationalIdFile && data.tinNumber;
    } else if (employmentType === "employee" && country === "PH") {
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
    if (employmentType === "contractor" && country === "PH") {
      return (
        <>
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
            <Label htmlFor="tinNumber">TIN Number *</Label>
            <Input
              id="tinNumber"
              value={data.tinNumber}
              onChange={(e) => setData({ ...data, tinNumber: e.target.value })}
              placeholder="000-000-000-000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankIBAN" className="text-muted-foreground">Bank Account (Optional)</Label>
            <Input
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => setData({ ...data, bankIBAN: e.target.value })}
              placeholder="Can be provided later"
            />
          </div>
        </>
      );
    }
    
    // Employee PH
    if (employmentType === "employee" && country === "PH") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="sssNumber">SSS Number *</Label>
            <Input
              id="sssNumber"
              value={data.sssNumber}
              onChange={(e) => setData({ ...data, sssNumber: e.target.value })}
              placeholder="00-0000000-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="philHealthNumber">PhilHealth Number *</Label>
            <Input
              id="philHealthNumber"
              value={data.philHealthNumber}
              onChange={(e) => setData({ ...data, philHealthNumber: e.target.value })}
              placeholder="00-000000000-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pagIbigNumber">Pag-IBIG Number *</Label>
            <Input
              id="pagIbigNumber"
              value={data.pagIbigNumber}
              onChange={(e) => setData({ ...data, pagIbigNumber: e.target.value })}
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
            <Label htmlFor="personnummer">ID Number (Personnummer) *</Label>
            <Input
              id="personnummer"
              value={data.personnummer}
              onChange={(e) => setData({ ...data, personnummer: e.target.value })}
              placeholder="00000000000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankIBAN">Bank IBAN *</Label>
            <Input
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => setData({ ...data, bankIBAN: e.target.value })}
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
            <Label htmlFor="bankIBAN">Bank IBAN *</Label>
            <Input
              id="bankIBAN"
              value={data.bankIBAN}
              onChange={(e) => setData({ ...data, bankIBAN: e.target.value })}
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
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Compliance Documents</h3>
        <p className="text-sm text-muted-foreground">
          Based on your employment type and location, we need the following information.
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
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={data.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>

          {dateWarning && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dateWarning}</AlertDescription>
            </Alert>
          )}

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
    </div>
  );
};

export default CandidateStep3Compliance;
