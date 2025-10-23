import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractDocument {
  id: string;
  title: string;
  type: "agreement" | "nda" | "policy";
  date: string;
  status: "signed" | "pending";
}

interface CarouselPage {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ContractCarouselProps {
  candidateName?: string;
  documents?: ContractDocument[];
  pages?: CarouselPage[];
}

export const ContractCarousel: React.FC<ContractCarouselProps> = ({
  candidateName,
  documents,
  pages,
}) => {
  // Support both document and page-based modes
  const items = documents || pages || [];
  if (items.length === 0) return null;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Render pages mode if pages provided
  if (pages) {
    const currentPage = pages[currentIndex];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={handlePrev} disabled={pages.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{currentPage.title}</span>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={pages.length <= 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentPage.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {currentPage.content}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2">
          {pages.map((_, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={cn("h-2 rounded-full transition-all duration-300", index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30")} />
          ))}
        </div>
      </div>
    );
  }

  const currentDoc = documents![currentIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contract Documents</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={items.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={items.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDoc.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {currentDoc.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {candidateName} • {currentDoc.date}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-[8.5/11] bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Document Preview
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Page Dots */}
      <div className="flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to document ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
