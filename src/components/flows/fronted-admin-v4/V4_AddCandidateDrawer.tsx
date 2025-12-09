/**
 * Flow 1 – Fronted Admin Dashboard v4 Only
 * Add Candidate Drawer
 * 
 * Opens from "+" icon in Offer Accepted column header
 * Supports both ATS candidates and manual entry
 * 
 * Matches UX patterns from:
 * - V4_ConfigureCandidateDetailsDrawer (candidate summary card, data source styling)
 * - V4_PayrollDetailsConfigDrawer (form field look & feel)
 */

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Sparkles, Database, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface V4_AddCandidateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (candidate: any) => void;
  hasATSConnected?: boolean;
}

// Mock ATS candidates for v4
const V4_ATS_CANDIDATES = [
  { 
    id: "ats-1", 
    name: "Maria Santos", 
    country: "Philippines",
    countryFlag: "🇵🇭",
    role: "Senior Developer",
    email: "maria.santos@email.com",
    employmentType: "contractor" as const,
    compensation: "$4,500/mo",
    hasATSData: true
  },
  { 
    id: "ats-2", 
    name: "John Smith", 
    country: "United States",
    countryFlag: "🇺🇸",
    role: "Product Manager",
    email: "john.smith@email.com",
    employmentType: "employee" as const,
    compensation: "$8,000/mo",
    hasATSData: true
  },
  { 
    id: "ats-3", 
    name: "Sarah Chen", 
    country: "Singapore",
    countryFlag: "🇸🇬",
    role: "UX Designer",
    email: "sarah.chen@email.com",
    employmentType: "contractor" as const,
    compensation: "$5,500/mo",
    hasATSData: true
  },
];

const COUNTRY_OPTIONS = [
  { value: "Philippines", flag: "🇵🇭" },
  { value: "Singapore", flag: "🇸🇬" },
  { value: "United States", flag: "🇺🇸" },
  { value: "Mexico", flag: "🇲🇽" },
  { value: "India", flag: "🇮🇳" },
  { value: "United Kingdom", flag: "🇬🇧" },
  { value: "Germany", flag: "🇩🇪" },
  { value: "Australia", flag: "🇦🇺" },
];

export const V4_AddCandidateDrawer: React.FC<V4_AddCandidateDrawerProps> = ({
  open,
  onOpenChange,
  onSave,
  hasATSConnected = true,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    countryFlag: "",
    role: "",
    compensation: "",
    startDate: "",
    employmentType: "contractor" as "contractor" | "employee",
  });

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedSource("");
      setFormData({
        name: "",
        email: "",
        country: "",
        countryFlag: "",
        role: "",
        compensation: "",
        startDate: "",
        employmentType: "contractor",
      });
    }
  }, [open]);

  const handleSourceSelect = (value: string) => {
    setSelectedSource(value);
    
    if (value === "manual") {
      // Clear form for manual entry
      setFormData({
        name: "",
        email: "",
        country: "",
        countryFlag: "",
        role: "",
        compensation: "",
        startDate: "",
        employmentType: "contractor",
      });
    } else {
      // Pre-fill from ATS candidate
      const candidate = V4_ATS_CANDIDATES.find(c => c.id === value);
      if (candidate) {
        setFormData({
          name: candidate.name,
          email: candidate.email,
          country: candidate.country,
          countryFlag: candidate.countryFlag,
          role: candidate.role,
          compensation: candidate.compensation || "",
          startDate: "",
          employmentType: candidate.employmentType,
        });
      }
    }
  };

  const handleCountryChange = (value: string) => {
    const country = COUNTRY_OPTIONS.find(c => c.value === value);
    setFormData(prev => ({
      ...prev,
      country: value,
      countryFlag: country?.flag || "",
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.country || !formData.role || !formData.compensation || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newCandidate = {
      id: `v4-candidate-${Date.now()}`,
      name: formData.name,
      country: formData.country,
      countryFlag: formData.countryFlag,
      role: formData.role,
      salary: formData.compensation,
      status: "offer-accepted" as const,
      formSent: false,
      dataReceived: false,
      employmentType: formData.employmentType,
      hasATSData: selectedSource !== "manual",
      email: formData.email,
      startDate: formData.startDate,
    };

    onSave(newCandidate);
    toast.success(`${formData.name} added to pipeline`);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isATSSelected = selectedSource && selectedSource !== "manual";
  const isManualSelected = selectedSource === "manual";
  const hasSelectedSource = selectedSource !== "";

  const isFormValid = formData.name && formData.email && formData.country && formData.role && formData.compensation && formData.startDate;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get compensation label based on employment type
  const getCompensationLabel = () => {
    return formData.employmentType === "employee" ? "Salary" : "Rate";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Add Candidate
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Create a new candidate in this pipeline.
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Select Candidate (Data Source Selector) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select candidate</Label>
            <Select value={selectedSource} onValueChange={handleSourceSelect}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose from ATS or add manually" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {hasATSConnected && V4_ATS_CANDIDATES.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    <div className="flex items-center gap-2">
                      <span>{candidate.countryFlag}</span>
                      <span>{candidate.name}</span>
                      <span className="text-muted-foreground text-xs">· {candidate.role}</span>
                      <Badge variant="secondary" className="text-xs ml-2 bg-primary/10 text-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        ATS
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Enter manually</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Source Indicator */}
          {hasSelectedSource && (
            <Card className={cn(
              "border",
              isATSSelected 
                ? "border-primary/30 bg-primary/5" 
                : "border-border bg-muted/30"
            )}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  {isATSSelected ? (
                    <>
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Database className="h-3 w-3 mr-1" />
                        From ATS
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Details are pre-filled from your ATS. You can still adjust them here.
                      </span>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        Entered manually
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Enter candidate details directly in Fronted.
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidate Summary Card (live updates) */}
          {hasSelectedSource && formData.name && (
            <Card className="border border-border/60 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-base">{formData.name || "Candidate Name"}</p>
                      {formData.countryFlag && (
                        <span className="text-lg">{formData.countryFlag}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{formData.role || "Role"}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {formData.country && (
                        <span className="text-xs text-muted-foreground">{formData.country}</span>
                      )}
                      {formData.compensation && (
                        <span className="text-xs font-medium">
                          {getCompensationLabel()}: {formData.compensation}
                        </span>
                      )}
                      {formData.employmentType && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {formData.employmentType === "employee" ? "Employee (EOR)" : "Contractor (COR)"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Fields */}
          {hasSelectedSource && (
            <>
              <Separator />

              {/* Section: Identity & Role */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Identity & Role</h3>
                </div>

                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="v4-name" className="text-sm">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="v4-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Maria Santos"
                      className="bg-background"
                    />
                    {isATSSelected && formData.name && (
                      <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="v4-email" className="text-sm">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="v4-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="bg-background"
                    />
                    {isATSSelected && formData.email && (
                      <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="v4-country" className="text-sm">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.country} onValueChange={handleCountryChange}>
                      <SelectTrigger id="v4-country" className="bg-background">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {COUNTRY_OPTIONS.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            <span>{country.flag} {country.value}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isATSSelected && formData.country && (
                      <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="v4-role" className="text-sm">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="v4-role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g., Senior Developer"
                      className="bg-background"
                    />
                    {isATSSelected && formData.role && (
                      <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section: Engagement & Compensation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Engagement & Compensation</h3>
                </div>

                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="v4-employmentType" className="text-sm">
                      Employment type <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.employmentType} 
                      onValueChange={(value: "contractor" | "employee") => 
                        setFormData(prev => ({ ...prev, employmentType: value }))
                      }
                    >
                      <SelectTrigger id="v4-employmentType" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="employee">Employee (EOR)</SelectItem>
                        <SelectItem value="contractor">Contractor (COR)</SelectItem>
                      </SelectContent>
                    </Select>
                    {isATSSelected && formData.employmentType && (
                      <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="v4-compensation" className="text-sm">
                      Compensation <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="v4-compensation"
                      value={formData.compensation}
                      onChange={(e) => setFormData(prev => ({ ...prev, compensation: e.target.value }))}
                      placeholder="e.g., $5,000/mo"
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.employmentType === "employee" 
                        ? "Monthly salary amount" 
                        : "Monthly rate or consultancy fee"
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="v4-startDate" className="text-sm">
                      Start date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="v4-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {hasSelectedSource && (
          <SheetFooter className="pt-6 border-t mt-6">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSave}
                disabled={!isFormValid}
              >
                Save candidate
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default V4_AddCandidateDrawer;
