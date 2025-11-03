import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface GenieInteractionBarProps {
  message: string;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

export const GenieInteractionBar: React.FC<GenieInteractionBarProps> = ({
  message,
  actions = [],
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4 max-w-3xl mx-auto"
    >
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <p className="text-sm text-foreground">{message}</p>
          
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={action.onClick}
                  className="gap-2"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Example Genie confirmation script component
interface GenieConfirmationProps {
  candidateName: string;
  onReview: () => void;
  onSendSignature: () => void;
  onSummarize: () => void;
}

export const GenieContractConfirmation: React.FC<GenieConfirmationProps> = ({
  candidateName,
  onReview,
  onSendSignature,
  onSummarize,
}) => {
  const [showOptions, setShowOptions] = useState(true);

  const handleReview = () => {
    setShowOptions(false);
    onReview();
    toast.info("Opening contract editor...");
  };

  const handleSendSignature = () => {
    setShowOptions(false);
    onSendSignature();
    toast.success("Preparing contract for signature...");
  };

  const handleSummarize = () => {
    onSummarize();
    toast.success("Summary sent to right panel ✅", {
      description: "Key terms are now highlighted in the contract view",
    });
  };

  return (
    <GenieInteractionBar
      message={`✅ Contract bundle drafted for ${candidateName} using compliance standards. Would you like to:`}
      actions={showOptions ? [
        {
          label: "1️⃣ Review and edit wording",
          onClick: handleReview,
        },
        {
          label: "2️⃣ Send for signature via Docusign",
          onClick: handleSendSignature,
          icon: <Sparkles className="h-4 w-4" />,
        },
        {
          label: "3️⃣ Summarize key terms",
          onClick: handleSummarize,
        },
      ] : []}
    />
  );
};
