import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Send, Eye, CheckCircle2 } from "lucide-react";
import type { OnboardingCandidate, OnboardingStatus } from "@/hooks/useCandidateOnboarding";

interface CandidateOnboardingCardProps {
  candidate: OnboardingCandidate;
  onConfigure: () => void;
  onSendForm: () => void;
  isValidating?: boolean;
}

const statusConfig: Record<OnboardingStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  not_sent: {
    label: "Not Sent",
    variant: "secondary",
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  awaiting_info: {
    label: "Awaiting Info",
    variant: "default",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  validating: {
    label: "Validating...",
    variant: "outline",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  ready_for_contract: {
    label: "Ready for Contract",
    variant: "default",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  drafting: {
    label: "Contract Generation in Progress",
    variant: "outline",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  awaiting_signature: {
    label: "Awaiting Signature",
    variant: "secondary",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  signed: {
    label: "Signed & Ready for Onboarding",
    variant: "default",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
};

export const CandidateOnboardingCard: React.FC<CandidateOnboardingCardProps> = ({
  candidate,
  onConfigure,
  onSendForm,
  isValidating = false,
}) => {
  const statusInfo = statusConfig[candidate.status];
  const canSendForm = candidate.status === "not_sent";
  const canResendForm = candidate.status === "awaiting_info";
  const isComplete = candidate.status === "ready_for_contract";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isValidating ? [1, 1.02, 1] : 1,
      }}
      transition={{ 
        duration: 0.3,
        scale: {
          repeat: isValidating ? Infinity : 0,
          duration: 1.5,
        }
      }}
      className={isComplete ? "animate-[glow_0.5s_ease-out]" : ""}
    >
      <Card className={`transition-all duration-300 ${isComplete ? "border-green-500/30 shadow-lg shadow-green-500/10" : ""}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{candidate.flag}</span>
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  {candidate.name}
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country:</span>
              <span className="font-medium">{candidate.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salary:</span>
              <span className="font-medium">{candidate.salary}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{candidate.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-xs">{candidate.email}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigure}
              className="flex-1 gap-2"
            >
              {candidate.status === "not_sent" ? (
                <>
                  <Settings className="h-4 w-4" />
                  Configure
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  View Form
                </>
              )}
            </Button>
            {(canSendForm || canResendForm) && (
              <Button
                size="sm"
                onClick={onSendForm}
                className="flex-1 gap-2"
                variant={canResendForm ? "outline" : "default"}
              >
                <Send className="h-4 w-4" />
                {canResendForm ? "Resend Form" : "Send Form"}
              </Button>
            )}
          </div>

          {isValidating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span>Genie is validating compliance data...</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
