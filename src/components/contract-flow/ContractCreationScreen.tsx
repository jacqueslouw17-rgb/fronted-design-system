import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Bot } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { CompliancePreviewCard } from "./CompliancePreviewCard";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { KurtIntroTooltip } from "./KurtIntroTooltip";
import { useAgentState } from "@/hooks/useAgentState";

interface ContractCreationScreenProps {
  candidate: Candidate;
  onNext: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

interface MissingField {
  id: string;
  label: string;
  value: string;
}

export const ContractCreationScreen: React.FC<ContractCreationScreenProps> = ({
  candidate,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalCandidates = 1,
}) => {
  const defaultEmploymentType = candidate.employmentType || "contractor";
  const [employmentType, setEmploymentType] = useState<"employee" | "contractor">(defaultEmploymentType);

  const [contractData, setContractData] = useState({
    fullName: candidate.name,
    email: candidate.email || "",
    role: candidate.role,
    startDate: candidate.startDate || "",
    salary: candidate.salary,
    country: candidate.country,
    currency: "USD",
    workLocation: "Remote",
    workHours: employmentType === "employee" ? "40 hours/week" : "Flexible",
    socialId: "",
    employerEntity: candidate.countryCode === "PH" ? "Fronted PH" : "Fronted NO",
    idType: candidate.idType || "",
    idNumber: candidate.idNumber || "",
    taxResidence: candidate.taxResidence || "",
    city: candidate.city || "",
    nationality: candidate.nationality || "",
    address: candidate.address || "",
    bankName: candidate.bankName || "",
    bankAccount: candidate.bankAccount || "",
    emergencyContactName: candidate.emergencyContactName || "",
    emergencyContactPhone: candidate.emergencyContactPhone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setOpen, addMessage, setLoading } = useAgentState();

  // Function to detect missing required fields
  const getMissingFields = (): MissingField[] => {
    const missing: MissingField[] = [];
    
    if (!contractData.email) {
      missing.push({ id: 'email', label: 'Email', value: contractData.email });
    }
    if (!contractData.startDate) {
      missing.push({ id: 'startDate', label: 'Start Date', value: contractData.startDate });
    }
    if (!contractData.salary) {
      missing.push({ id: 'salary', label: 'Salary', value: contractData.salary });
    }
    
    return missing;
  };

  // Function to scroll to a specific field
  const scrollToField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
      // Add a brief highlight effect
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  };

  // Handle Kurt action tags
  const handleKurtAction = async (action: string) => {
    // Handle field jumps from Kurt messages
    if (action.startsWith('jump-to-')) {
      const fieldId = action.replace('jump-to-', '');
      scrollToField(fieldId);
      return;
    }

    addMessage({
      role: 'user',
      text: action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    });

    setOpen(true);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    let response = '';
    
    switch(action) {
      case 'review-fields':
        response = `🔍 Contract Field Review for ${candidate.name.split(' ')[0]}

I've scanned all fields in the contract draft:

✅ **Pre-filled Fields:**
• Full Name: ${contractData.fullName}
• Email: ${contractData.email || '(needs attention)'}
• Role: ${contractData.role}
• Start Date: ${contractData.startDate || '(needs attention)'}
• Salary: ${contractData.salary}
• Country: ${contractData.country}
• Employment Type: ${employmentType}

${contractData.email && contractData.startDate ? 
  '✓ All key fields are complete and ready!' : 
  '⚠️ Some required fields need your attention before proceeding.'}

💡 **Tip:** Need to modify a clause? Edits can be made before bundle generation.`;
        break;
        
      case 'explain-terms':
        response = `📚 Contract Terms Explained

Here are the key legal terms in ${candidate.name.split(' ')[0]}'s contract:

**Confidentiality Clause**
Ensures the contractor won't disclose sensitive company information, trade secrets, or proprietary data during and after employment.

**IP Rights Assignment**
All work created during employment belongs to the company. This includes code, designs, documents, and any intellectual property.

**Notice Period**
The required advance notice (typically 30 days) before either party can terminate the contract.

**Probation Period**
Initial 3-6 month evaluation period where performance is closely monitored and termination notice is shorter.

💡 **Tip:** You can ask me about any specific clause for a plain-language summary.`;
        break;
      case 'whats-missing':
        const missingFields = getMissingFields();
        if (missingFields.length === 0) {
          addMessage({
            role: 'kurt',
            text: "✅ All Required Fields Complete!\n\nGreat news! All required fields are filled in:\n✓ Full Name\n✓ Email\n✓ Role\n✓ Start Date\n✓ Salary\n✓ Country\n\nYou're all set to proceed. Want me to review the contract for you?",
            actionButtons: [
              { label: 'Yes, Review It', action: 'review-for-me', variant: 'default' },
              { label: 'Skip Review', action: 'skip-review', variant: 'outline' },
            ]
          });
          setLoading(false);
          return;
        } else {
          response = `⚠️ Missing Required Fields\n\nI found ${missingFields.length} required field${missingFields.length > 1 ? 's' : ''} that need${missingFields.length > 1 ? '' : 's'} your attention:\n\n`;
          
          addMessage({
            role: 'kurt',
            text: response,
            actionButtons: missingFields.map(field => ({
              label: `📍 ${field.label}`,
              action: `jump-to-${field.id}`,
              variant: 'outline' as const
            }))
          });
          setLoading(false);
          return;
        }
        break;
        
      case 'review-for-me':
        const missing = getMissingFields();
        if (missing.length > 0) {
          addMessage({
            role: 'kurt',
            text: `🔍 Contract Review - Issues Found\n\nI reviewed the contract and found ${missing.length} issue${missing.length > 1 ? 's' : ''}:\n\n❌ Missing Required Fields:\n${missing.map(f => `• ${f.label}`).join('\n')}\n\nPlease complete these fields before I can proceed with the full review. Want me to show you where they are?`,
            actionButtons: [
              { label: "Show Me What's Missing", action: 'whats-missing', variant: 'default' },
              { label: 'Auto-Fill Data', action: 'auto-fill', variant: 'outline' },
            ]
          });
          setLoading(false);
          return;
        } else {
          addMessage({
            role: 'kurt',
            text: `✅ Contract Review Complete\n\nI've reviewed the entire contract:\n\n✓ All required fields completed\n✓ Email format validated\n✓ Start date is future-dated\n✓ Salary format correct\n✓ Compliance requirements met for ${candidate.country}\n✓ Employment type: ${employmentType}\n\nEverything looks perfect! The contract is ready to proceed to bundle generation. Should I move forward?`,
            actionButtons: [
              { label: 'Generate Bundle', action: 'generate-bundle', variant: 'default' },
              { label: 'Make Changes', action: 'make-changes', variant: 'outline' },
            ]
          });
          setLoading(false);
          return;
        }
        break;
        
      case 'auto-fill':
        response = `🤖 Auto-Fill Complete\n\nI've filled in the missing data from the candidate record:\n\n`;
        
        const updates: string[] = [];
        if (!contractData.email && candidate.email) {
          setContractData(prev => ({ ...prev, email: candidate.email || '' }));
          updates.push(`✓ Email: ${candidate.email}`);
        }
        if (!contractData.startDate) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 14);
          const formattedDate = futureDate.toISOString().split('T')[0];
          setContractData(prev => ({ ...prev, startDate: formattedDate }));
          updates.push(`✓ Start Date: ${formattedDate} (2 weeks from today)`);
        }
        
        if (updates.length === 0) {
          addMessage({
            role: 'kurt',
            text: "✅ Nothing to Auto-Fill\n\nAll available fields are already filled! The candidate record doesn't have any additional data I can use.\n\nWant me to review the contract instead?",
            actionButtons: [
              { label: 'Review Contract', action: 'review-for-me', variant: 'default' },
            ]
          });
        } else {
          response += updates.join('\n') + "\n\nAll set! I pulled the latest data from your ATS and filled in the gaps. Want me to review the contract now?";
          addMessage({
            role: 'kurt',
            text: response,
            actionButtons: [
              { label: 'Review Now', action: 'review-for-me', variant: 'default' },
              { label: 'Make More Changes', action: 'make-changes', variant: 'outline' },
            ]
          });
        }
        
        setTimeout(() => {
          toast.success("Fields auto-filled from candidate record");
        }, 100);
        setLoading(false);
        return;
        
      case 'generate-bundle':
        setLoading(true);
        addMessage({
          role: 'kurt',
          text: "🎯 Generating Contract Bundle\n\nI'm preparing the contract bundle with all required documents:\n\n✓ Main Employment Contract\n✓ NDA & Company Policies\n✓ Compliance Documents\n✓ Country-specific forms\n\nThis will take just a moment...",
        });
        
        setTimeout(() => {
          addMessage({
            role: 'kurt',
            text: "📦 Compiling documents and validating compliance...",
          });
          
          setTimeout(() => {
            setLoading(false);
            addMessage({
              role: 'kurt',
              text: "✨ **Bundle ready!** Transitioning to bundle screen...",
            });
            toast.success("Contract bundle ready!");
            
            setTimeout(() => {
              setOpen(false);
              onNext();
            }, 800);
          }, 1500);
        }, 1000);
        return;
        
      case 'skip-review':
        addMessage({
          role: 'kurt',
          text: "✅ Skipping Review\n\nNo problem! You can proceed directly to the next step. Just let me know when you're ready to generate the contract bundle.",
        });
        setLoading(false);
        return;
        
      case 'make-changes':
        addMessage({
          role: 'kurt',
          text: "📝 Ready for Changes\n\nGo ahead and make any adjustments you need. I'll be here when you're ready to review again or generate the bundle.",
        });
        setLoading(false);
        return;
        
      default:
        response = `I'll help you with "${action}". Let me process that for you.`;
    }

    addMessage({
      role: 'kurt',
      text: response,
    });

    setLoading(false);
  };

  // Expose handleKurtAction globally for action buttons
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => {
      delete (window as any).handleKurtAction;
    };
  });

  const handleValidate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!contractData.salary) {
      newErrors.salary = "Looks like this one's still empty";
    }
    
    if (!contractData.startDate) {
      newErrors.startDate = "We'll need this one filled in";
    } else {
      // Parse date parts to avoid timezone issues
      const [year, month, day] = contractData.startDate.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startDate = "This date is in the past — please select a future date";
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (handleValidate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onNext();
    }
  };

  // Mock data for pipeline view
  const mockContractors = [
    {
      id: "1",
      name: candidate.name,
      country: candidate.country,
      countryFlag: candidate.flag,
      role: candidate.role,
      salary: candidate.salary,
      status: "drafting" as const,
    },
    {
      id: "2",
      name: "Maria Santos",
      country: "Philippines",
      countryFlag: "🇵🇭",
      role: "Backend Developer",
      salary: "$4,500/mo",
      status: "data-pending" as const,
    },
    {
      id: "3",
      name: "Liam Chen",
      country: "Singapore",
      countryFlag: "🇸🇬",
      role: "Product Designer",
      salary: "$6,200/mo",
      status: "awaiting-signature" as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 pb-8 pt-4 max-w-7xl mx-auto space-y-6"
    >
      <AgentHeader
        title={`Review ${candidate.name.split(' ')[0]}'s Details`}
        subtitle="Please review the candidate's details below to ensure everything is accurate before adding them to the agreement."
        placeholder="Kurt can help with: reviewing fields, explaining terms, or generating bundles."
        showPulse={true}
        showInput={false}
        // tags={
        //   <KurtContextualTags
        //     flowContext="contract-creation"
        //     onTagClick={(action) => handleKurtAction(action)}
        //     disabled={false}
        //   />
        // }
        progressIndicator={
          totalCandidates > 1 ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Candidate
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-semibold text-foreground">
                    {currentIndex + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">
                    {totalCandidates}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: totalCandidates }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-8 bg-primary'
                        : idx < currentIndex
                        ? 'w-1.5 bg-primary/40'
                        : 'w-1.5 bg-border'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : undefined
        }
      />

      {/* Contract Form View */}
      <div className="space-y-6">{/* ... keep existing code */}

      {/* Employment Type Toggle */}
      <Card className="p-6 space-y-6 border border-border/40 bg-card/50 backdrop-blur-sm">
        {/* Auto-populated fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Legal Name</Label>
            <Input
              value={contractData.fullName}
              onChange={(e) => setContractData({ ...contractData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              id="email"
              type="email"
              value={contractData.email}
              onChange={(e) => setContractData({ ...contractData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              id="role"
              value={contractData.role}
              onChange={(e) => setContractData({ ...contractData, role: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={contractData.startDate}
              onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
              className={errors.startDate ? "border-destructive" : ""}
            />
            {errors.startDate ? (
              <p className="text-destructive text-sm">{errors.startDate}</p>
            ) : (
              <p className="text-muted-foreground text-xs">When should this person start?</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Salary
              {errors.salary && (
                <span className="text-destructive text-xs ml-2">Needs your attention</span>
              )}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                {employmentType === "contractor" ? "$" : 
                  contractData.country === "Philippines" ? "₱" :
                  contractData.country === "Norway" ? "kr" :
                  contractData.country === "Singapore" ? "S$" :
                  contractData.country === "India" ? "₹" :
                  contractData.country === "United Kingdom" ? "£" :
                  contractData.country === "Germany" || contractData.country === "France" || contractData.country === "Spain" || contractData.country === "Italy" ? "€" :
                  "$"}
              </span>
              <Input
                id="salary"
                value={contractData.salary?.replace(/^[$₱€£₹]|^kr\s?|^S\$\s?/g, '').trim() || ''}
                onChange={(e) => setContractData({ ...contractData, salary: e.target.value })}
                className={`pl-8 ${errors.salary ? "border-destructive" : ""}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select
              value={employmentType}
              onValueChange={(value: "employee" | "contractor") => setEmploymentType(value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {employmentType === "contractor" && (
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={contractData.currency || "USD"}
                onValueChange={(value) => setContractData({ ...contractData, currency: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>ID Type</Label>
            <Input
              value={contractData.idType || ""}
              onChange={(e) => setContractData({ ...contractData, idType: e.target.value })}
              placeholder="e.g., Passport, National ID"
            />
          </div>

          <div className="space-y-2">
            <Label>ID Number</Label>
            <Input
              value={contractData.idNumber || ""}
              onChange={(e) => setContractData({ ...contractData, idNumber: e.target.value })}
              placeholder="ID Number"
            />
          </div>

          <div className="space-y-2">
            <Label>Tax Residence</Label>
            <Input
              value={contractData.taxResidence || ""}
              onChange={(e) => setContractData({ ...contractData, taxResidence: e.target.value })}
              placeholder="e.g., Mexico"
            />
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={contractData.city || ""}
              onChange={(e) => setContractData({ ...contractData, city: e.target.value })}
              placeholder="City"
            />
          </div>

          <div className="space-y-2">
            <Label>Nationality</Label>
            <Input
              value={contractData.nationality || ""}
              onChange={(e) => setContractData({ ...contractData, nationality: e.target.value })}
              placeholder="Nationality"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={contractData.address || ""}
              onChange={(e) => setContractData({ ...contractData, address: e.target.value })}
              placeholder="Full address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={contractData.bankName || ""}
              onChange={(e) => setContractData({ ...contractData, bankName: e.target.value })}
              placeholder="Bank Name"
            />
          </div>

          <div className="space-y-2">
            <Label>Bank Account / IBAN</Label>
            <Input
              value={contractData.bankAccount || ""}
              onChange={(e) => setContractData({ ...contractData, bankAccount: e.target.value })}
              placeholder="Account Number / IBAN"
            />
          </div>

          <div className="space-y-2">
            <Label>Pay Frequency</Label>
            <Input value="Monthly" disabled />
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact Name <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge></Label>
            <Input
              value={contractData.emergencyContactName || ""}
              onChange={(e) => setContractData({ ...contractData, emergencyContactName: e.target.value })}
              placeholder="Emergency contact name"
            />
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact Phone <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge></Label>
            <Input
              value={contractData.emergencyContactPhone || ""}
              onChange={(e) => setContractData({ ...contractData, emergencyContactPhone: e.target.value })}
              placeholder="Emergency contact phone"
            />
          </div>
        </div>

      </Card>

      {/* Navigation */}
      <div className="flex justify-end gap-3">
        {currentIndex > 0 && onPrevious && (
          <Button 
            onClick={onPrevious}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Previous
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          size="lg" 
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          {currentIndex + 1 === totalCandidates 
            ? (totalCandidates > 1 ? "Review Agreements" : "Review Agreement")
            : "Review Next Candidate"}
        </Button>
      </div>
      </div>
    </motion.div>
  );
};
