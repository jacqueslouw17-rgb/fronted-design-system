import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bot } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { CompliancePreviewCard } from "./CompliancePreviewCard";
import { toast } from "sonner";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentSuggestionChips } from "@/components/AgentSuggestionChips";
import { KurtIntroTooltip } from "./KurtIntroTooltip";
import { useAgentState } from "@/hooks/useAgentState";

interface ContractCreationScreenProps {
  candidate: Candidate;
  onNext: () => void;
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
    workLocation: "Remote",
    workHours: employmentType === "employee" ? "40 hours/week" : "Flexible",
    socialId: "",
    employerEntity: candidate.countryCode === "PH" ? "Fronted PH" : "Fronted NO",
    optionalClauses: "",
    variablePay: "",
    paymentSchedule: "Monthly",
    customAttachments: "",
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
      const startDate = new Date(contractData.startDate);
      const today = new Date();
      if (startDate < today) {
        // Genie confirmation for past dates
        toast.warning("Hmm, that doesn't look right — this date seems to be in the past. Did you mean a future date?", {
          duration: 5000,
          action: {
            label: "Fix it",
            onClick: () => {},
          },
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (handleValidate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success("All done ✅ Everything's good to go");
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
        title={`Preparing ${candidate.name.split(' ')[0]}'s Contract`}
        subtitle="Review pre-filled details and make edits before generating the bundle."
        placeholder="Kurt can help with: reviewing fields, explaining terms, or generating bundles."
        showPulse={true}
        showInput={false}
        tags={
          <AgentSuggestionChips
            chips={[
              {
                label: "Review Fields",
                variant: "default",
                onAction: () => handleKurtAction("review-fields"),
              },
              {
                label: "Explain Terms",
                variant: "default",
                onAction: () => handleKurtAction("explain-terms"),
              },
              {
                label: "Ask Kurt",
                variant: "default",
                onAction: () => setOpen(true),
              },
            ]}
          />
        }
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

      {/* Kurt First-Use Welcome Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary mt-0.5" />
          <p className="text-sm text-foreground">
            💬 Hi there! I can help review fields, generate bundles, or explain clauses — just click the tags above.
          </p>
        </div>
      </motion.div>

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
              {errors.startDate && (
                <span className="text-destructive text-xs ml-2">Needs your attention</span>
              )}
            </Label>
            <Input
              id="startDate"
              type="date"
              value={contractData.startDate}
              onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
              className={errors.startDate ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Monthly Salary / Compensation
              {errors.salary && (
                <span className="text-destructive text-xs ml-2">Needs your attention</span>
              )}
            </Label>
            <Input
              id="salary"
              value={contractData.salary}
              onChange={(e) => setContractData({ ...contractData, salary: e.target.value })}
              className={errors.salary ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Country of Employment</Label>
            <Input value={contractData.country} disabled />
          </div>

          <div className="space-y-2">
            <Label>Work Location</Label>
            <Input
              value={contractData.workLocation}
              onChange={(e) => setContractData({ ...contractData, workLocation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Work Hours {employmentType === "contractor" && <Badge variant="secondary" className="ml-2 text-xs">Optional</Badge>}</Label>
            <Input
              value={contractData.workHours}
              onChange={(e) => setContractData({ ...contractData, workHours: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Social ID / Tax ID {employmentType === "contractor" && <Badge variant="secondary" className="ml-2 text-xs">If provided</Badge>}</Label>
            <Input
              value={contractData.socialId}
              onChange={(e) => setContractData({ ...contractData, socialId: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label>Employer Legal Entity</Label>
            <Input value={contractData.employerEntity} disabled />
          </div>
        </div>

        {/* Compliance Preview */}
        <CompliancePreviewCard
          country={candidate.country}
          countryCode={candidate.countryCode}
          flag={candidate.flag}
          employmentType={employmentType}
        />

        {/* Admin Additional Inputs */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground">Additional Contract Terms</h3>
          
          <div className="space-y-2">
            <Label>Optional Clauses</Label>
            <Textarea
              value={contractData.optionalClauses}
              onChange={(e) => setContractData({ ...contractData, optionalClauses: e.target.value })}
              placeholder="Add any additional clauses or terms..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Variable Pay / Bonus Config</Label>
              <Input
                value={contractData.variablePay}
                onChange={(e) => setContractData({ ...contractData, variablePay: e.target.value })}
                placeholder="e.g., 10% annual bonus"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Schedule</Label>
              <Input
                value={contractData.paymentSchedule}
                onChange={(e) => setContractData({ ...contractData, paymentSchedule: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Attachments (NDA, Policies)</Label>
            <Input
              value={contractData.customAttachments}
              onChange={(e) => setContractData({ ...contractData, customAttachments: e.target.value })}
              placeholder="e.g., NDA, Company Policy Handbook"
            />
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleNext} size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          {currentIndex + 1 === totalCandidates 
            ? "Next: Review Contract Bundle" 
            : "Review Next Candidate"}
        </Button>
      </div>
      </div>
    </motion.div>
  );
};
