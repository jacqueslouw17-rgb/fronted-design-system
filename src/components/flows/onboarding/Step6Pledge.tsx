import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, CheckCircle2, FileSignature } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step6Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

const Step6Pledge = ({ formData, onComplete }: Step6Props) => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transparency Pledge</h2>
        <p className="text-muted-foreground">
          Our commitment to building trust through full visibility
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Fronted Transparency Pledge</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 rounded-md border p-4" onScrollCapture={handleScroll}>
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold mb-2">Our Promise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  At Fronted, we believe trust is built through transparency. This pledge
                  represents our commitment to you as an administrator managing global
                  contractor operations.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  No Hidden Fees
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every charge, exchange rate margin, and service fee is disclosed upfront.
                  You'll never discover unexpected costs after the fact. Our FX breakdown
                  shows source rates, our margin, and the exact calculation.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Every Action is Transparent
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Genie will explain what it's doing before it acts. All changes—whether
                  contract amendments, payroll adjustments, or policy updates—are logged
                  in the audit trail with full context and timestamps.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Human Confirmation Required
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Critical actions like payroll execution, contract termination, and bulk
                  policy changes require your explicit approval. Genie prepares, you
                  confirm. No autonomous decisions on financial or legal matters.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Data Security & Privacy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your contractor data is encrypted at rest and in transit. We never sell
                  data to third parties. You control data retention and can export or
                  delete information at any time.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Accountability
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  If something goes wrong, we take responsibility. Our support team
                  responds within 24 hours, and our audit trail ensures we can trace and
                  explain every action taken in your account.
                </p>
              </section>

              <section className="pt-4 border-t">
                <p className="text-muted-foreground leading-relaxed italic">
                  By signing this pledge, you acknowledge that Fronted is designed around
                  these principles, and that you can reference this commitment in any
                  approval summary or compliance review.
                </p>
              </section>

              <section className="text-xs text-muted-foreground">
                <p>Effective Date: {new Date().toLocaleDateString()}</p>
                <p className="mt-2">
                  This pledge is stored in your account artifacts and accessible anytime.
                </p>
              </section>
            </div>
          </ScrollArea>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            {!scrolledToBottom && (
              <>
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>Please scroll to the bottom to review the full pledge</span>
              </>
            )}
            {scrolledToBottom && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>You've reviewed the complete pledge</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSign}
        size="lg"
        className="w-full"
        disabled={!scrolledToBottom || signing}
      >
        {signing ? (
          <>
            <FileSignature className="h-4 w-4 mr-2 animate-pulse" />
            Signing...
          </>
        ) : (
          <>
            <FileSignature className="h-4 w-4 mr-2" />
            Sign Pledge
          </>
        )}
      </Button>

      {!scrolledToBottom && (
        <p className="text-xs text-center text-muted-foreground">
          Scroll through the entire document to enable signing
        </p>
      )}
    </div>
  );
};

export default Step6Pledge;
