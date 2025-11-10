import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, Briefcase } from "lucide-react";

interface ContractPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateRole: string;
  salary: string;
  currency: string;
  startDate: string;
  noticePeriod: string;
  pto: string;
  country: string;
}

const ContractPreviewDrawer: React.FC<ContractPreviewDrawerProps> = ({
  open,
  onOpenChange,
  candidateName,
  candidateRole,
  salary,
  currency,
  startDate,
  noticePeriod,
  pto,
  country,
}) => {
  const contractSections = [
    { 
      heading: "EMPLOYMENT AGREEMENT", 
      text: "" 
    },
    { 
      heading: "", 
      text: `This Employment Agreement ("Agreement") is entered into between Fronted AS ("Company") and ${candidateName} ("Employee").` 
    },
    { 
      heading: "1. POSITION AND DUTIES", 
      text: `Employee will serve as ${candidateRole}, reporting to the Head of Engineering. Employee agrees to perform duties as assigned by the Company.` 
    },
    { 
      heading: "2. COMPENSATION", 
      text: `Employee will receive a salary of ${salary}, payable in ${currency} on a monthly basis.` 
    },
    { 
      heading: "3. START DATE", 
      text: `Employment will commence on ${startDate}.` 
    },
    { 
      heading: "4. NOTICE PERIOD", 
      text: `Either party may terminate this Agreement with ${noticePeriod} written notice.` 
    },
    { 
      heading: "5. PAID TIME OFF", 
      text: `Employee is entitled to ${pto} of paid time off annually.` 
    },
    { 
      heading: "6. GOVERNING LAW", 
      text: `This Agreement shall be governed by the laws of ${country}.` 
    },
    { 
      heading: "7. INTELLECTUAL PROPERTY", 
      text: `All work product, inventions, and intellectual property created during the course of employment shall be the sole property of the Company.` 
    },
    { 
      heading: "8. CONFIDENTIALITY", 
      text: `Employee agrees to maintain confidentiality of all proprietary information and trade secrets of the Company, both during and after employment.` 
    },
    { 
      heading: "9. BENEFITS", 
      text: `Employee shall be entitled to standard health coverage and a professional development budget as outlined in the Company's benefits package.` 
    },
    { 
      heading: "10. TERMINATION", 
      text: `This Agreement may be terminated by either party with ${noticePeriod} written notice, or immediately for cause as defined by applicable law.` 
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Employment Contract
              </SheetTitle>
              <SheetDescription>
                Contract preview for {candidateName}
              </SheetDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Draft
            </Badge>
          </div>

          {/* Key Details Card */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Position</p>
                <p className="font-medium text-foreground">{candidateRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Salary</p>
                <p className="font-medium text-foreground">{salary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium text-foreground">{startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Notice Period</p>
                <p className="font-medium text-foreground">{noticePeriod}</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-6">
            {contractSections.map((section, index) => (
              <div key={index} className="space-y-2">
                {section.heading && (
                  <h3 className={`font-semibold ${
                    index === 0 
                      ? "text-xl mb-6 text-muted-foreground" 
                      : "text-sm text-foreground"
                  }`}>
                    {section.heading}
                  </h3>
                )}
                {section.text && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.text}
                  </p>
                )}
              </div>
            ))}

            {/* Signature Section */}
            <div className="pt-8 space-y-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs font-medium text-foreground mb-3">Employer Signature</p>
                <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
                  <span className="text-sm italic text-muted-foreground">Company Representative</span>
                </div>
                <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs font-medium text-foreground mb-3">Employee Signature</p>
                <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
                  <span className="text-sm italic text-muted-foreground">{candidateName}</span>
                </div>
                <p className="text-xs text-muted-foreground">To be signed via: DocuSign</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ContractPreviewDrawer;
