import { useState } from "react";
import { motion } from "framer-motion";
import { X, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Resolve Payroll Issue</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {contractorName} • {contractorCountry}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? selectedFile.name : "Choose file"}
              </Button>
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !issueDescription.trim()}
              className="flex-1 gap-2"
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
          </div>
        </div>
      </motion.div>
    </>
  );
};
