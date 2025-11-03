import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, User, FileText, CreditCard, Phone } from "lucide-react";

interface Step6Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep6Review = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step6Props) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    onComplete("review_submit", { confirmed, submittedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting. You can expand each section to verify details.
        </p>
      </div>

      {isLoadingFields ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="welcome" className="border rounded-lg bg-card/30 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Welcome & Consent</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm pt-1 pb-3 px-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs">GDPR Consent Accepted</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="personal" className="border rounded-lg bg-card/30 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Personal & Identity</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm pt-1 pb-3 px-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{formData.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="font-medium">{formData.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">National ID:</span>
                  <span className="font-medium">{formData.nationalId}</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs">ID Document Uploaded</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tax" className="border rounded-lg bg-card/30 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Tax Residency</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm pt-1 pb-3 px-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Country:</span>
                  <span className="font-medium">{formData.taxCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Number:</span>
                  <span className="font-medium">{formData.taxNumber}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="bank" className="border rounded-lg bg-card/30 px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <CreditCard className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">Bank Details</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm pt-1 pb-3 px-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Holder:</span>
                  <span className="font-medium">{formData.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN:</span>
                  <span className="font-medium">{formData.iban}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">{formData.currency}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {formData.emergencyName && (
            <AccordionItem value="emergency" className="border rounded-lg bg-card/30 px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Emergency Contact</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm pt-1 pb-3 px-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.emergencyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{formData.emergencyPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Relationship:</span>
                    <span className="font-medium">{formData.emergencyRelationship}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-2">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="confirm" className="text-sm font-normal cursor-pointer">
            I confirm that all the information provided above is accurate and complete to the best of my knowledge.
          </Label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        {isProcessing ? (
          <Button disabled size="lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Submitting...
            </div>
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={!confirmed}
            size="lg"
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit & Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep6Review;
