import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Step5Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

const WorkerStep5WorkSetup = ({ formData, onComplete, isProcessing, isLoadingFields }: Step5Props) => {
  const [data, setData] = useState({
    equipmentNeeds: formData.equipmentNeeds || "none",
    shippingAddress: formData.shippingAddress || "",
    slackDisplayName: formData.slackDisplayName || "",
    handbookAccepted: false
  });

  const handleContinue = () => {
    onComplete("work_setup", data);
  };

  const isValid = data.handbookAccepted && 
    (data.equipmentNeeds === "none" || data.shippingAddress);

  if (isLoadingFields) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Work Setup & Agreements</h3>
        <p className="text-sm text-muted-foreground">
          Let us know about your equipment needs and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Equipment Needs</Label>
          <RadioGroup
            value={data.equipmentNeeds}
            onValueChange={(value) => setData({ ...data, equipmentNeeds: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal">
                I have my own equipment
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="laptop" id="laptop" />
              <Label htmlFor="laptop" className="font-normal">
                I need a company laptop
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="accessories" id="accessories" />
              <Label htmlFor="accessories" className="font-normal">
                I need accessories (monitor, keyboard, etc.)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {data.equipmentNeeds !== "none" && (
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address *</Label>
            <Textarea
              id="shippingAddress"
              value={data.shippingAddress}
              onChange={(e) => setData({ ...data, shippingAddress: e.target.value })}
              placeholder="Full shipping address including postal code"
              rows={3}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="slackName">Slack Display Name (Optional)</Label>
          <Input
            id="slackName"
            value={data.slackDisplayName}
            onChange={(e) => setData({ ...data, slackDisplayName: e.target.value })}
            placeholder="How you'd like to appear on Slack"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use your full name
          </p>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm">Company Handbook</h4>
        <p className="text-sm text-muted-foreground">
          Please review our company handbook which covers policies, benefits, and code of conduct.
        </p>
        <Button variant="outline" size="sm" className="w-full">
          📄 View Company Handbook
        </Button>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="handbookAccept"
          checked={data.handbookAccepted}
          onCheckedChange={(checked) => 
            setData({ ...data, handbookAccepted: checked as boolean })
          }
        />
        <label
          htmlFor="handbookAccept"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and agree to follow the company handbook and policies
        </label>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          💡 <strong>Kurt says:</strong> Equipment orders typically ship within 3-5 business days. You'll receive tracking information via email.
        </p>
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
    </div>
  );
};

export default WorkerStep5WorkSetup;
