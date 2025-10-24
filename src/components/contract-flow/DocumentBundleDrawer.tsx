import React from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertTriangle, File } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface Document {
  name: string;
  type: string;
  status: "drafted" | "not-sent" | "missing" | "ready";
  action: string;
}

interface DocumentBundleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
}

const getDocumentsForCandidate = (candidate: Candidate | null): Document[] => {
  if (!candidate) return [];

  const baseDocuments: Document[] = [
    {
      name: "Main Contract",
      type: `${candidate.countryCode} Contractor`,
      status: "drafted",
      action: "Review Document",
    },
  ];

  // Add country-specific documents
  if (candidate.countryCode === "PH") {
    baseDocuments.push(
      {
        name: "NDA",
        type: "Company Policy",
        status: "not-sent",
        action: "Include",
      },
      {
        name: "Data Privacy Form",
        type: "Gov-required",
        status: "missing",
        action: "Add",
      },
      {
        name: "Compliance Docs",
        type: "Auto-generated",
        status: "ready",
        action: "Preview",
      }
    );
  } else {
    baseDocuments.push(
      {
        name: "NDA",
        type: "Company Policy",
        status: "ready",
        action: "Include",
      },
      {
        name: "Compliance Docs",
        type: "Auto-generated",
        status: "ready",
        action: "Preview",
      }
    );
  }

  return baseDocuments;
};

const getStatusIcon = (status: Document["status"]) => {
  switch (status) {
    case "drafted":
    case "ready":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "missing":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "not-sent":
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: Document["status"]) => {
  switch (status) {
    case "drafted":
      return (
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Drafted
        </Badge>
      );
    case "ready":
      return (
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    case "missing":
      return (
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Missing
        </Badge>
      );
    case "not-sent":
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          <File className="h-3 w-3 mr-1" />
          Not Sent
        </Badge>
      );
  }
};

export const DocumentBundleDrawer: React.FC<DocumentBundleDrawerProps> = ({
  open,
  onOpenChange,
  candidate,
}) => {
  const documents = getDocumentsForCandidate(candidate);
  const documentCount = documents.length;
  const hasIssues = documents.some(d => d.status === "missing");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Document Bundle</SheetTitle>
        </SheetHeader>

        {candidate && (
          <div className="space-y-6 mt-6">
            {/* Genie Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-foreground flex-1">
                  Based on your company policies and compliance requirements, I've prepared document bundles for each candidate.
                  {candidate.countryCode === "PH" && " Philippines workers require additional compliance documentation."}
                </p>
              </div>
            </motion.div>

            {/* Candidate Header */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{candidate.flag}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {candidate.role} • {candidate.country} • {candidate.employmentType}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {documentCount} documents
              </Badge>
            </div>

            {/* Documents Table */}
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Document</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm font-medium text-foreground">{doc.name}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-muted-foreground">{doc.type}</span>
                    </div>
                    <div className="col-span-3">{getStatusBadge(doc.status)}</div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          // Handle document action
                        }}
                      >
                        {doc.action}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            {hasIssues && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Some documents are missing or incomplete. Please resolve before sending.
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
