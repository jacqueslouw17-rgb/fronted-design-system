import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KurtContextualTags } from "./KurtContextualTags";
import { KurtRightPanel } from "./KurtRightPanel";
import { KurtBubble } from "./KurtBubble";

export type KurtState = "inactive" | "thinking" | "working" | "responding" | "idle";
export type FlowContext = "contract-creation" | "admin-onboarding" | "candidate-onboarding" | "checklist" | "payroll";

interface KurtCoilotProps {
  flowContext: FlowContext;
  onTagAction?: (action: string, data?: any) => void;
  className?: string;
}

export const KurtCoilot: React.FC<KurtCoilotProps> = ({
  flowContext,
  onTagAction,
  className,
}) => {
  const [state, setState] = useState<KurtState>("inactive");
  const [isCompact, setIsCompact] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [workingText, setWorkingText] = useState("");

  const handleActivate = () => {
    setIsCompact(false);
    setState("idle");
  };

  const handleMinimize = () => {
    setIsCompact(true);
    setState("inactive");
    setIsPanelOpen(false);
  };

  const handleTagClick = async (action: string) => {
    setState("thinking");
    setWorkingText(getThinkingText(flowContext, action));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setState("working");
    setWorkingText(getWorkingText(flowContext, action));
    
    // Execute action
    await onTagAction?.(action);
    
    // Show response
    setState("responding");
    setCurrentMessage(getResponseMessage(flowContext, action));
    setIsPanelOpen(true);
    
    // Reset to idle after response
    setTimeout(() => {
      setState("idle");
    }, 2000);
  };

  return (
    <>
      {/* Compact Floating Icon */}
      <AnimatePresence>
        {isCompact && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={cn("fixed bottom-6 right-6 z-50", className)}
                >
                  <Button
                    size="lg"
                    onClick={handleActivate}
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-6 w-6" />
                    </motion.div>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Ask Kurt for help anytime</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </AnimatePresence>

      {/* Active Kurt Interface */}
      <AnimatePresence>
        {!isCompact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn("fixed bottom-6 right-6 z-50 flex flex-col gap-3", className)}
          >
            {/* Kurt Bubble */}
            <KurtBubble
              state={state}
              message={currentMessage}
              workingText={workingText}
              onMinimize={handleMinimize}
            />

            {/* Contextual Tags */}
            {(state === "idle" || state === "responding") && (
              <KurtContextualTags
                flowContext={flowContext}
                onTagClick={handleTagClick}
                disabled={false}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel for Responses */}
      <KurtRightPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        content={currentMessage}
        flowContext={flowContext}
      />
    </>
  );
};

// Tone Matrix Implementation
function getThinkingText(context: FlowContext, action: string): string {
  const thinkingPhrases = {
    "contract-creation": {
      "quick-summary": "Analyzing contract structure...",
      "fix-clauses": "Checking clauses for inconsistencies...",
      "compare-drafts": "Comparing document versions...",
    },
    "admin-onboarding": {
      "pull-org-data": "Retrieving your details... please wait a moment ⏳",
    },
    "candidate-onboarding": {
      "retrieve-info": "Bringing your info in — hang tight.",
    },
  };

  return thinkingPhrases[context]?.[action] || "Thinking...";
}

function getWorkingText(context: FlowContext, action: string): string {
  const workingPhrases = {
    "contract-creation": {
      "quick-summary": "Sharpening my pencil ✏️ drafting the summary...",
      "fix-clauses": "Polishing clauses to make this watertight...",
      "compare-drafts": "Highlighting differences...",
    },
  };

  return workingPhrases[context]?.[action] || "Processing...";
}

function getResponseMessage(context: FlowContext, action: string): string {
  const responses = {
    "contract-creation": {
      "quick-summary": "Here's a quick contract summary — you can tweak clauses if needed.",
      "fix-clauses": "Done! Everything's up to date 🙌. I've made this watertight for you.",
      "compare-drafts": "Perfect! One less thing to worry about 🎯. Here are the key differences.",
    },
    "admin-onboarding": {
      "pull-org-data": "Welcome aboard! Let's pull your org data first.",
    },
  };

  return responses[context]?.[action] || "All set! Let me know if you need anything else.";
}
