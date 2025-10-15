import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface AcknowledgeButtonProps {
  country: string;
  changeIds: string[];
  onAcknowledge?: (country: string, changeIds: string[]) => void;
  disabled?: boolean;
}

export const AcknowledgeButton = ({
  country,
  changeIds,
  onAcknowledge,
  disabled
}: AcknowledgeButtonProps) => {
  const handleAcknowledge = () => {
    onAcknowledge?.(country, changeIds);
    
    // Log to audit timeline (mock event)
    const event = {
      type: "ComplianceChangeAcknowledged",
      country,
      changeIds,
      timestamp: new Date().toISOString(),
      user: "Current User"
    };
    
    console.log("Genie Event:", event);
    
    toast({
      title: "Changes acknowledged",
      description: `${changeIds.length} rule updates in ${country} have been reviewed and logged.`,
    });
  };

  return (
    <Button
      onClick={handleAcknowledge}
      disabled={disabled || changeIds.length === 0}
      className="w-full"
    >
      <Check className="h-4 w-4" />
      Acknowledge {changeIds.length} {changeIds.length === 1 ? "change" : "changes"}
    </Button>
  );
};
