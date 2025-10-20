import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2, FileSignature } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step6Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
}

const Step6Pledge = ({ formData, onComplete, isProcessing: externalProcessing }: Step6Props) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (isAtBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleSign = () => {
    setSigning(true);

    // Simulate e-signature
    setTimeout(() => {
      setSigning(false);
      toast({
        title: "Transparency Pledge signed! 🎉",
        description: "Your commitment to transparent operations is recorded"
      });

      onComplete("transparency_pledge_esign", {
        pledgeSigned: true,
        signedAt: new Date().toISOString()
      });
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Transparency Pledge
          </h3>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-lg p-4">
        <ScrollArea className="h-80 rounded-md border border-border/50 p-4 bg-card" onScrollCapture={handleScroll}>
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold mb-2 text-sm">Our Promise</h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                At Fronted, we believe trust is built through transparency. This pledge
                represents our commitment to you as an administrator managing global
                contractor operations.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                No Hidden Fees
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                Every charge, exchange rate margin, and service fee is disclosed upfront.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Every Action is Transparent
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                Genie will explain what it's doing before it acts. All changes are logged.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Human Confirmation Required
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                Critical actions require your explicit approval. Genie prepares, you confirm.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Data Security & Privacy
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs">
                Your contractor data is encrypted. We never sell data to third parties.
              </p>
            </section>

            <section className="pt-4 border-t">
              <p className="text-muted-foreground leading-relaxed italic text-xs">
                By signing this pledge, you acknowledge that Fronted is designed around
                these principles.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {!scrolledToBottom && (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span>Scroll to review</span>
            </>
          )}
          {scrolledToBottom && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>Reviewed</span>
            </>
          )}
        </div>
      </div>

      <Button
        onClick={handleSign}
        size="lg"
        className="w-full"
        disabled={!scrolledToBottom || signing || externalProcessing}
      >
        {(signing || externalProcessing) ? (
          <>
            <FileSignature className="h-4 w-4 mr-2 animate-pulse" />
            {externalProcessing ? "Processing..." : "Signing..."}
          </>
        ) : (
          <>
            <FileSignature className="h-4 w-4 mr-2" />
            Sign Pledge
          </>
        )}
      </Button>
    </div>
  );
};

export default Step6Pledge;
