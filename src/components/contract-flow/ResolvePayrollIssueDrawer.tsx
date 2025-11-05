import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface ResolvePayrollIssueDrawerProps {
  open: boolean;
  onClose: () => void;
  contractorName: string;
  contractorCountry: string;
}

export const ResolvePayrollIssueDrawer: React.FC<ResolvePayrollIssueDrawerProps> = ({
  open,
  onClose,
  contractorName,
  contractorCountry,
}) => {
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!issueDescription.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success("Issue logged", {
      description: "Genie will review and respond shortly",
    });
    
    setIsSubmitting(false);
    setIssueDescription("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Resolve Payroll Issue</SheetTitle>
          <SheetDescription>
            {contractorName} • {contractorCountry}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Issue Description */}
          <div className="space-y-2">
            <Label htmlFor="issue-description">Describe the issue</Label>
            <Textarea
              id="issue-description"
              placeholder="Provide details about the payroll issue..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Attach supporting documents (optional)</Label>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="gap-2 flex-1"
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? (
                  <span className="truncate">{selectedFile.name}</span>
                ) : (
                  "Choose file"
                )}
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !issueDescription.trim()}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to Genie
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
