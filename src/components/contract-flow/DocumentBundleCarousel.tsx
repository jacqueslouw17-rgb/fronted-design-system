import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Handshake,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";

interface Document {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  required: boolean;
  selected: boolean;
}

interface DocumentBundleCarouselProps {
  candidate: Candidate;
  onGenerateBundle: (selectedDocs: string[]) => void;
}

export const DocumentBundleCarousel: React.FC<DocumentBundleCarouselProps> = ({
  candidate,
  onGenerateBundle,
}) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "employment-agreement",
      title: "Employment Agreement",
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: "Main employment contract with salary, duties, and terms",
      required: true,
      selected: true,
    },
    {
      id: "nda",
      title: "Non-Disclosure Agreement",
      icon: <Handshake className="h-8 w-8 text-primary" />,
      description: "Confidentiality and proprietary information protection",
      required: true,
      selected: true,
    },
    {
      id: "policy-acknowledgment",
      title: "Policy Acknowledgment",
      icon: <ScrollText className="h-8 w-8 text-primary" />,
      description: "Company policies, code of conduct, and workplace guidelines",
      required: false,
      selected: true,
    },
    {
      id: "contractor-addendum",
      title: "Contractor Addendum",
      icon: <Settings className="h-8 w-8 text-primary" />,
      description: "Additional terms for contractor-specific arrangements",
      required: false,
      selected: candidate.country === "Kosovo", // Auto-select for certain countries
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id && !doc.required
          ? { ...doc, selected: !doc.selected }
          : doc
      )
    );
  };

  const selectedCount = documents.filter((d) => d.selected).length;

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGenerate = () => {
    const selectedDocs = documents.filter((d) => d.selected).map((d) => d.id);
    onGenerateBundle(selectedDocs);
  };

  return (
    <div className="space-y-6">
      {/* Genie message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
      >
        <p className="text-sm text-foreground">
          There are multiple documents to sign for full compliance. I've grouped them for you.
        </p>
      </motion.div>

      {/* Carousel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Signing Bundle</h3>
          <Badge variant="secondary">{selectedCount} documents</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {documents.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === documents.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative h-[280px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Card className="h-full p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {documents[currentIndex].icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg text-foreground">
                        {documents[currentIndex].title}
                      </h4>
                      {documents[currentIndex].required ? (
                        <Badge variant="default" className="bg-primary/20 text-primary">
                          Required
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={documents[currentIndex].selected}
                            onCheckedChange={() =>
                              toggleDocument(documents[currentIndex].id)
                            }
                          />
                          <span className="text-xs text-muted-foreground">Include</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {documents[currentIndex].description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Document details:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Pages</span>
                        <span className="text-foreground font-medium">
                          {documents[currentIndex].id === "employment-agreement"
                            ? "8"
                            : documents[currentIndex].id === "nda"
                            ? "3"
                            : "2"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Signatures required</span>
                        <span className="text-foreground font-medium">2</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Localization</span>
                        <span className="text-foreground font-medium">
                          {candidate.countryCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Document indicators */}
      <div className="flex justify-center gap-2">
        {documents.map((doc, idx) => (
          <button
            key={doc.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "w-8 bg-primary"
                : doc.selected
                ? "w-2 bg-primary/30"
                : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Generate bundle button */}
      <Button onClick={handleGenerate} className="w-full" size="lg">
        Generate Signing Pack ({selectedCount} documents)
      </Button>
    </div>
  );
};
