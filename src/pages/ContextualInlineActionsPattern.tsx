import React, { useState } from "react";
import { InlineEditContext } from "@/components/InlineEditContext";
import { InlineToolbar } from "@/components/InlineToolbar";
import { AIPromptInput } from "@/components/AIPromptInput";
import { AIProcessingState } from "@/components/AIProcessingState";
import { ChangeDiffCard } from "@/components/ChangeDiffCard";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { toast } from "@/hooks/use-toast";

const ContextualInlineActionsPattern = () => {
  const [selectedText, setSelectedText] = useState("");
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [promptVisible, setPromptVisible] = useState(false);
  const [processingVisible, setProcessingVisible] = useState(false);
  const [processingState, setProcessingState] = useState<"thinking" | "editing">("thinking");
  const [currentContent, setCurrentContent] = useState(
    `<ul>
      <li><strong>Foundations</strong> - principles, patterns and flow</li>
      <li><strong>Build list of components we'll need:</strong> <a href="#">notion.so/MVP-Components-link</a></li>
      <li>What library has all we need? ShadeCN? UntitledUI?</li>
      <li>AI tool – Lovable, Vercel, databutton, rocket etc. – what is the decision?</li>
      <li>Build out component library</li>
      <li>Build out patterns that uses components</li>
      <li>Map patterns and components to modules</li>
    </ul>`
  );
  const [originalContent, setOriginalContent] = useState(currentContent);
  
  const { addAuditEntry } = useAuditTrail();

  const handleTextSelect = (text: string, position: { x: number; y: number }) => {
    if (text.trim()) {
      setSelectedText(text);
      setToolbarPosition(position);
      setToolbarVisible(true);
      setPromptVisible(false);
    } else {
      setToolbarVisible(false);
      setPromptVisible(false);
    }
  };

  const handleAskAI = () => {
    setToolbarVisible(false);
    setPromptVisible(true);
  };

  const handleQuickAction = (action: string) => {
    if (action === "improve") {
      handlePromptSubmit("Improve writing");
    }
  };

  const handlePromptSubmit = (prompt: string) => {
    setPromptVisible(false);
    setProcessingVisible(true);
    setProcessingState("thinking");

    // Simulate AI processing
    setTimeout(() => {
      setProcessingState("editing");
      
      setTimeout(() => {
        let newContent = currentContent;
        
        // Simulate different transformations based on prompt
        if (prompt.toLowerCase().includes("checkbox")) {
          newContent = currentContent.replace(/<ul>/g, '<ul class="checklist">').replace(/<li>/g, '<li><input type="checkbox" /> ');
        } else if (prompt.toLowerCase().includes("improve") || prompt.toLowerCase().includes("writing")) {
          newContent = currentContent.replace(/What library/g, "Which library");
        } else if (prompt.toLowerCase().includes("shorter")) {
          newContent = `<ul>
            <li><strong>Foundations</strong> - core principles</li>
            <li><strong>Components list</strong></li>
            <li>Library selection</li>
            <li>Build & map patterns</li>
          </ul>`;
        }

        setOriginalContent(currentContent);
        setCurrentContent(newContent);
        setProcessingVisible(false);

        addAuditEntry({
          user: "Joe",
          action: `AI applied: ${prompt}`,
          before: currentContent,
          after: newContent,
        });

        toast({
          title: "Changes applied",
          description: `Kurt ${prompt.toLowerCase()}`,
        });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Pattern 43: Contextual Inline Actions</h1>
          <p className="text-lg text-muted-foreground">
            Notion AI-style inline editing with custom prompts and auto-applying changes
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Interactive Demo</h2>
          <p className="text-sm text-muted-foreground">
            Select any text below to see the inline toolbar. Click "Ask AI" to type a custom prompt like "Change list to checkboxes" or "Make it shorter".
          </p>

          <div className="relative">
            <InlineEditContext
              content={currentContent}
              onSelect={handleTextSelect}
            >
              <InlineToolbar
                visible={toolbarVisible}
                position={toolbarPosition}
                onAskAI={handleAskAI}
                onQuickAction={handleQuickAction}
              />
              
              <AIPromptInput
                visible={promptVisible}
                position={toolbarPosition}
                onSubmit={handlePromptSubmit}
                onClose={() => setPromptVisible(false)}
                suggestions={["Improve writing", "Change list to checkboxes", "Make it shorter", "Fix grammar"]}
              />
              
              <AIProcessingState
                visible={processingVisible}
                position={toolbarPosition}
                state={processingState}
              />
            </InlineEditContext>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Before/After Comparison</h2>
          <ChangeDiffCard
            before={originalContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
            after={currentContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
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
                Detects text selection and manages editable content
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">InlineToolbar</h3>
              <p className="text-sm text-muted-foreground">
                Appears on text selection with "Ask AI" and quick actions
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">AIPromptInput</h3>
              <p className="text-sm text-muted-foreground">
                Custom prompt input with suggestions and send button
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">AIProcessingState</h3>
              <p className="text-sm text-muted-foreground">
                Shows "Thinking..." or "Editing..." with animated dots
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border p-4">
              <h3 className="font-semibold">ChangeDiffCard</h3>
              <p className="text-sm text-muted-foreground">
                Before/after comparison with diff view toggle
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Key Features</h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>Text selection triggers minimal inline toolbar</li>
            <li>Custom AI prompts via text input field</li>
            <li>Quick action buttons for common tasks</li>
            <li>"Thinking..." → "Editing..." state progression</li>
            <li>Changes auto-apply with smooth animations</li>
            <li>Works in dashboard and document contexts</li>
            <li>Audit trail integration for all AI actions</li>
            <li>Keyboard shortcuts support</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Usage Flow</h2>
          <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
            <li>User selects text anywhere in the content</li>
            <li>Inline toolbar appears with "Ask AI" button</li>
            <li>Click "Ask AI" to open custom prompt input</li>
            <li>Type request (e.g., "Change list to checkboxes")</li>
            <li>AI shows "Thinking..." then "Editing..." states</li>
            <li>Changes auto-apply with smooth animation</li>
            <li>Result logged to audit trail</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ContextualInlineActionsPattern;
