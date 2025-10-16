import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignatureFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  documentTitle: string;
  onSign: () => Promise<void>;
  className?: string;
}

export const SignatureFlow: React.FC<SignatureFlowProps> = ({
  open,
  onOpenChange,
  candidateName,
  documentTitle,
  onSign,
  className,
}) => {
  const [status, setStatus] = useState<"ready" | "signing" | "signed">("ready");

  const handleSign = async () => {
    setStatus("signing");
    try {
      await onSign();
      setStatus("signed");
      setTimeout(() => {
        onOpenChange(false);
        setStatus("ready");
      }, 2000);
    } catch (error) {
      console.error("Signature error:", error);
      setStatus("ready");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === "signed" ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Document Signed</span>
              </>
            ) : (
              <>
                <FileSignature className="h-5 w-5 text-primary" />
                <span>Sign Document</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {status === "ready" && (
              <>You are about to sign the document: <strong>{documentTitle}</strong></>
            )}
            {status === "signing" && "Processing your signature..."}
            {status === "signed" && "Your signature has been recorded successfully."}
          </DialogDescription>
        </DialogHeader>

        {status === "ready" && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-2">Signing as:</p>
              <p className="text-base font-semibold text-foreground">{candidateName}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>By signing, you confirm that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You have read and understood the document</li>
                <li>You agree to the terms and conditions</li>
                <li>Your signature is legally binding</li>
              </ul>
            </div>
          </div>
        )}

        {status === "signing" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {status === "signed" && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Signed at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {status === "ready" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSign} className="gap-2">
                <FileSignature className="h-4 w-4" />
                Sign Document
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
