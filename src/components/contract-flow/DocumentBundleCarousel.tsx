import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Handshake,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  ArrowRight,
} from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { useAgentState } from "@/hooks/useAgentState";

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
  hideButton?: boolean;
  onClose?: () => void;
}

export const DocumentBundleCarousel: React.FC<DocumentBundleCarouselProps> = ({
  candidate,
  onGenerateBundle,
  hideButton = false,
  onClose,
}) => {
  const employmentType = candidate.employmentType || "contractor";
  
  // Generate documents based on employment type
  const generateDocuments = (): Document[] => {
    if (employmentType === "employee") {
      return [
        {
          id: "employment-agreement",
          title: "Employment Agreement",
          icon: <FileText className="h-8 w-8 text-primary" />,
          description: "Main employment contract with salary, duties, and terms",
          required: true,
          selected: true,
        },
        {
          id: "country-compliance",
          title: "Country Compliance Attachments",
          icon: <ScrollText className="h-8 w-8 text-primary" />,
          description: `${candidate.countryCode}-specific compliance documents and mandatory clauses`,
          required: true,
          selected: true,
        },
        {
          id: "nda-policy",
          title: "NDA / Policy Docs",
          icon: <Handshake className="h-8 w-8 text-primary" />,
          description: "Non-disclosure agreement and company policy acknowledgment",
          required: false,
          selected: true,
        },
      ];
    } else {
      return [
        {
          id: "contractor-agreement",
          title: "Contractor Agreement",
          icon: <FileText className="h-8 w-8 text-primary" />,
          description: "Independent contractor agreement with scope and terms",
          required: true,
          selected: true,
        },
        {
          id: "nda",
          title: "Non-Disclosure Agreement",
          icon: <Handshake className="h-8 w-8 text-primary" />,
          description: "Confidentiality and proprietary information protection",
          required: false,
          selected: true,
        },
        {
          id: "data-privacy",
          title: `Data Privacy Addendum (${candidate.countryCode})`,
          icon: <ScrollText className="h-8 w-8 text-primary" />,
          description: "Country-specific data protection and privacy requirements",
          required: false,
          selected: candidate.countryCode === "PH",
        },
      ];
    }
  };
  
  const [documents, setDocuments] = useState<Document[]>(generateDocuments());
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOpen, addMessage, simulateResponse } = useAgentState();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    addMessage({ role: 'user', text: inputValue.trim() });
    setOpen(true);
    await simulateResponse(inputValue.trim());
    setInputValue('');
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <h1 className="text-4xl font-bold text-foreground">Contract Bundle</h1>
        <p className="text-base text-muted-foreground">
          Select documents to include in the signing package
        </p>
        
        {/* Chat Input - directly below subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-3xl mx-auto pt-4"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm px-5 py-3.5">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kurt anything..."
                disabled={isSubmitting}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isSubmitting}
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Carousel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Signing Bundle</h3>
          <Badge variant="secondary" className="text-xs">{selectedCount} documents</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[3rem] text-center">
            {currentIndex + 1} / {documents.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === documents.length - 1}
            className="h-8 w-8 p-0"
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
      {!hideButton && (
        <Button onClick={handleGenerate} className="w-full" size="lg">
          Generate Signing Pack
        </Button>
      )}
    </div>
  );
};
