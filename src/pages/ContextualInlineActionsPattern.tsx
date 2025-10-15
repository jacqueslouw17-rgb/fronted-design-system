import React, { useState } from "react";
import { InlineEditContext } from "@/components/InlineEditContext";
import { SmartMenu } from "@/components/SmartMenu";
import { AIActionPopover } from "@/components/AIActionPopover";
import { DecisionBar } from "@/components/DecisionBar";
import { ChangeDiffCard } from "@/components/ChangeDiffCard";
import { AcknowledgePill } from "@/components/AcknowledgePill";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { toast } from "@/hooks/use-toast";

const ContextualInlineActionsPattern = () => {
  const [selectedText, setSelectedText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showDecisionBar, setShowDecisionBar] = useState(false);
  const [currentContent, setCurrentContent] = useState(
    "The contractor will receive a monthly payment of $1,000 for services rendered under this agreement."
  );
  const [originalContent, setOriginalContent] = useState(currentContent);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [acknowledgementStatus, setAcknowledgementStatus] = useState<"accepted" | "declined">("accepted");
  
  const { addAuditEntry } = useAuditTrail();

  const handleTextSelect = (text: string, range: { start: number; end: number }) => {
    if (text.trim()) {
      setSelectedText(text);
      const selection = window.getSelection();
      const rect = selection?.getRangeAt(0).getBoundingClientRect();
      
      if (rect) {
        setMenuPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 50,
        });
        setMenuVisible(true);
      }
    } else {
      setMenuVisible(false);
    }
  };

  const handleAction = (action: string) => {
    setMenuVisible(false);
    setAiLoading(true);
    setShowDecisionBar(false);

    // Simulate AI processing
    setTimeout(() => {
      let suggestion = "";
      switch (action) {
        case "simplify":
          suggestion = "The contractor gets $1,000 monthly for their work.";
          break;
        case "rewrite":
          suggestion = "Monthly compensation of $1,000 shall be provided to the contractor for services performed pursuant to this contract.";
          break;
        case "explain":
          suggestion = "This clause establishes a fixed monthly payment schedule of $1,000 to compensate the contractor for work done under the terms of this agreement.";
          break;
        case "translate":
          suggestion = "El contratista recibirá un pago mensual de $1,000 por los servicios prestados bajo este acuerdo.";
          break;
        case "enhance":
          suggestion = "The contractor shall receive a monthly payment of one thousand US dollars ($1,000.00) for professional services rendered in accordance with the terms and conditions of this agreement, payable on the first business day of each month.";
          break;
        default:
          suggestion = selectedText;
      }

      setOriginalContent(currentContent);
      setAiSuggestion(suggestion);
      setAiLoading(false);
      setShowDecisionBar(true);
    }, 1500);
  };

  const handleAccept = () => {
    setCurrentContent(aiSuggestion);
    setShowDecisionBar(false);
    setAcknowledgementStatus("accepted");
    setShowAcknowledgement(true);

    addAuditEntry({
      user: "Joe",
      action: "Accepted AI suggestion",
      before: originalContent,
      after: aiSuggestion,
    });

    toast({
      title: "Change Applied",
      description: "AI suggestion has been accepted.",
    });

    setTimeout(() => setShowAcknowledgement(false), 3000);
  };

  const handleDecline = () => {
    setShowDecisionBar(false);
    setAcknowledgementStatus("declined");
    setShowAcknowledgement(true);

    addAuditEntry({
      user: "Joe",
      action: "Declined AI suggestion",
      before: originalContent,
      after: originalContent,
    });

    toast({
      title: "Change Declined",
      description: "The original content has been preserved.",
    });

    setTimeout(() => setShowAcknowledgement(false), 3000);
  };

  const handleEdit = () => {
    toast({
      title: "Edit Mode",
      description: "Manual editing would be enabled here.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Pattern 43: Contextual Inline Actions</h1>
          <p className="text-lg text-muted-foreground">
            AI-assisted inline editing with contextual suggestions and decision flows
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Demo</h2>
          <p className="text-sm text-muted-foreground">
            Select any text below to see contextual AI actions appear. Try "Simplify" or "Rewrite" to see the inline editing flow.
          </p>

          <div className="relative">
            {showAcknowledgement && (
              <div className="mb-4">
                <AcknowledgePill
                  status={acknowledgementStatus}
                  user="Joe"
                  timestamp={new Date().toLocaleTimeString()}
                />
              </div>
            )}

            {showDecisionBar && (
              <DecisionBar
                visible={showDecisionBar}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onEdit={handleEdit}
                className="mb-4"
              />
            )}

            <InlineEditContext
              content={currentContent}
              role="legal"
              onSelect={handleTextSelect}
            >
              {menuVisible && (
                <SmartMenu
                  visible={menuVisible}
                  position={menuPosition}
                  onAction={handleAction}
                />
              )}
            </InlineEditContext>

            <AIActionPopover
              visible={aiLoading || (!!aiSuggestion && showDecisionBar)}
              loading={aiLoading}
              suggestion={aiSuggestion}
              confidence={0.92}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Diff Comparison</h2>
          <ChangeDiffCard
            before="The contractor will receive a monthly payment of $1,000 for services rendered."
            after="The contractor gets $1,000 monthly for their work."
            changeType="modification"
            showDiff={true}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Components</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">InlineEditContext</h3>
              <p className="text-sm text-muted-foreground">
                Wrapper for editable content with text selection detection
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">SmartMenu</h3>
              <p className="text-sm text-muted-foreground">
                Floating contextual menu with AI action options
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">AIActionPopover</h3>
              <p className="text-sm text-muted-foreground">
                Animated suggestion box with loading states
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">DecisionBar</h3>
              <p className="text-sm text-muted-foreground">
                Accept/Decline/Edit toolbar for AI changes
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">ChangeDiffCard</h3>
              <p className="text-sm text-muted-foreground">
                Before/after comparison with diff view toggle
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">AcknowledgePill</h3>
              <p className="text-sm text-muted-foreground">
                Confirmation badge that fades after acceptance
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Key Features</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Text selection triggers contextual AI menu</li>
            <li>Multiple AI actions: Rewrite, Simplify, Explain, Translate, Enhance</li>
            <li>Inline preview with confidence scoring</li>
            <li>Accept/Decline/Edit workflow</li>
            <li>Diff view for before/after comparison</li>
            <li>Audit trail integration for all decisions</li>
            <li>Keyboard shortcuts (⌘+K, ⌘+Enter, Esc)</li>
            <li>Smooth animations and transitions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContextualInlineActionsPattern;
