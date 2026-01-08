/**
 * ⚠️ LOCKED COMPONENT - Part of Flow 1.1 Fronted Admin Dashboard v2 ⚠️
 * 
 * This component is part of a LOCKED flow and should NOT be modified.
 * See: src/pages/AdminContractingMultiCompany.tsx
 * Flow: Flow 1.1 — Fronted Admin Dashboard v2
 * Locked Date: 2025-01-15
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Sparkles } from "lucide-react";
interface AddCandidateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (candidate: any) => void;
}

// Mock candidates from ATS
const ATS_CANDIDATES = [{
  id: "ats-1",
  name: "Maria Santos",
  country: "Philippines",
  countryFlag: "🇵🇭",
  role: "Senior Developer",
  email: "maria.santos@email.com",
  employmentType: "contractor" as const,
  hasATSData: true
}, {
  id: "ats-2",
  name: "John Smith",
  country: "Denmark",
  countryFlag: "🇩🇰",
  role: "Product Manager",
  email: "john.smith@email.com",
  employmentType: "employee" as const,
  hasATSData: true
}, {
  id: "ats-3",
  name: "Sarah Chen",
  country: "Sweden",
  countryFlag: "🇸🇪",
  role: "UX Designer",
  email: "sarah.chen@email.com",
  employmentType: "contractor" as const,
  hasATSData: true
}, {
  id: "manual",
  name: "",
  country: "",
  countryFlag: "",
  role: "",
  email: "",
  employmentType: "contractor" as const,
  hasATSData: false
}];
export const AddCandidateDrawer: React.FC<AddCandidateDrawerProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [selectedAtsId, setSelectedAtsId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    countryFlag: "",
    role: "",
    salary: "",
    startDate: "",
    employmentType: "contractor" as "contractor" | "employee"
  });
  const handleATSSelect = (value: string) => {
    setSelectedAtsId(value);
    if (value === "manual") {
      // Clear form for manual entry
      setFormData({
        name: "",
        email: "",
        country: "",
        countryFlag: "",
        role: "",
        salary: "",
        startDate: "",
        employmentType: "contractor"
      });
    } else {
      // Pre-fill from ATS
      const candidate = ATS_CANDIDATES.find(c => c.id === value);
      if (candidate && candidate.hasATSData) {
        setFormData({
          name: candidate.name,
          email: candidate.email,
          country: candidate.country,
          countryFlag: candidate.countryFlag,
          role: candidate.role,
          salary: "",
          startDate: "",
          employmentType: candidate.employmentType
        });
      }
    }
  };
  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.country || !formData.role || !formData.salary || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const newCandidate = {
      id: `candidate-${Date.now()}`,
      name: formData.name,
      country: formData.country,
      countryFlag: formData.countryFlag,
      role: formData.role,
      salary: formData.salary || "TBD",
      status: "offer-accepted" as const,
      formSent: false,
      dataReceived: false,
      employmentType: formData.employmentType,
      hasATSData: selectedAtsId !== "manual",
      // Track if from ATS or manual
      email: formData.email,
      startDate: formData.startDate
    };
    onSave(newCandidate);
    toast.success(`✅ ${formData.name} added to pipeline`);

    // Reset form
    setSelectedAtsId("");
    setFormData({
      name: "",
      email: "",
      country: "",
      countryFlag: "",
      role: "",
      salary: "",
      startDate: "",
      employmentType: "contractor"
    });
    onOpenChange(false);
  };
  const isATSSelected = selectedAtsId && selectedAtsId !== "manual";
  const isFormValid = formData.name && formData.email && formData.country && formData.role && formData.salary && formData.startDate;
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Add Candidate
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Candidate Selector */}
          <div className="space-y-2">
            <Label>Select Candidate</Label>
            <Select value={selectedAtsId} onValueChange={handleATSSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose from ATS or add manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Enter manually</span>
                  </div>
                </SelectItem>
                {ATS_CANDIDATES.filter(c => c.hasATSData).map(candidate => <SelectItem key={candidate.id} value={candidate.id}>
                    <div className="flex items-center gap-2">
                      <span>{candidate.countryFlag}</span>
                      <span>{candidate.name}</span>
                      {candidate.hasATSData && <Badge variant="secondary" className="text-xs ml-auto">
                          <Sparkles className="h-3 w-3 mr-1" />
                          ATS
                        </Badge>}
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {isATSSelected && <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Details pre-filled from your ATS
              </p>}
          </div>

          {/* Form Fields */}
          {selectedAtsId && <>
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="e.g., Maria Santos" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))} placeholder="email@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={value => {
                const countryFlags: Record<string, string> = {
                  "Norway": "🇳🇴",
                  "Philippines": "🇵🇭",
                  "India": "🇮🇳",
                  "Kosovo": "🇽🇰",
                  "Sweden": "🇸🇪",
                  "Denmark": "🇩🇰"
                };
                const contractorOnlyCountries = ["Kosovo", "India", "Philippines"];
                const isContractorOnly = contractorOnlyCountries.includes(value);
                setFormData(prev => ({
                  ...prev,
                  country: value,
                  countryFlag: countryFlags[value] || "",
                  // Auto-set to contractor for contractor-only countries
                  employmentType: isContractorOnly ? "contractor" : prev.employmentType
                }));
              }}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                      <SelectItem value="Philippines">🇵🇭 Philippines</SelectItem>
                      <SelectItem value="India">🇮🇳 India</SelectItem>
                      <SelectItem value="Kosovo">🇽🇰 Kosovo</SelectItem>
                      <SelectItem value="Sweden">🇸🇪 Sweden</SelectItem>
                      <SelectItem value="Denmark">🇩🇰 Denmark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select 
                    value={formData.employmentType} 
                    onValueChange={(value: "contractor" | "employee") => setFormData(prev => ({
                      ...prev,
                      employmentType: value
                    }))}
                    disabled={["Kosovo", "India", "Philippines"].includes(formData.country)}
                  >
                    <SelectTrigger id="employmentType" className={["Kosovo", "India", "Philippines"].includes(formData.country) ? "opacity-70" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  {["Kosovo", "India", "Philippines"].includes(formData.country) ? (
                    <p className="text-xs text-muted-foreground">
                      Contractor only in {formData.country}.
                    </p>
                  ) : isATSSelected ? (
                    <p className="text-xs text-muted-foreground">Prefilled from ATS</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input id="role" value={formData.role} onChange={e => setFormData(prev => ({
                ...prev,
                role: e.target.value
              }))} placeholder="e.g., Senior Developer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
                      {formData.employmentType === "contractor" ? "USD" : formData.country === "Philippines" ? "PHP" : formData.country === "Norway" ? "NOK" : formData.country === "India" ? "INR" : formData.country === "Kosovo" ? "EUR" : formData.country === "Sweden" ? "SEK" : formData.country === "Denmark" ? "DKK" : "USD"}
                    </span>
                    <Input id="salary" value={formData.salary} onChange={e => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData(prev => ({
                    ...prev,
                    salary: value
                  }));
                }} placeholder="5000" className="pl-12" />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter monthly amount (numbers only).</p>
                  {isATSSelected}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={e => setFormData(prev => ({
                ...prev,
                startDate: e.target.value
              }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={!isFormValid}>
                  Save Candidate
                </Button>
              </div>
            </>}
        </div>
      </SheetContent>
    </Sheet>;
};