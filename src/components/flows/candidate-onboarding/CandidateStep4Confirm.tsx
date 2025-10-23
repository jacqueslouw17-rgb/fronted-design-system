import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const CandidateStep4Confirm = ({ 
  formData, 
  onComplete, 
  isProcessing = false, 
  isLoadingFields = false 
}: Step4Props) => {
  const [confirmed, setConfirmed] = useState(false);
  const firstName = formData.fullName?.split(' ')[0] || "there";

  const handleSubmit = () => {
    onComplete("confirm_submit", { confirmed: true, submittedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Thanks {firstName}! 🎉</h3>
                  <p className="text-muted-foreground">
                    We've received everything we need. Your contract will be generated shortly — we'll notify you when it's ready to sign.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="confirm" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              />
              <Label 
                htmlFor="confirm" 
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                I confirm that all the information I've provided is accurate and complete.
              </Label>
            </div>
          </div>
        </>
      )}

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
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateStep4Confirm;
