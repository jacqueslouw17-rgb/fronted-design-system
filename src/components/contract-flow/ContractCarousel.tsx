import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractPage {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ContractCarouselProps {
  pages: ContractPage[];
  className?: string;
}

export const ContractCarousel: React.FC<ContractCarouselProps> = ({ pages, className }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Page content */}
      <div className="relative min-h-[400px] overflow-hidden rounded-lg border border-border bg-card">
        <AnimatePresence mode="wait" custom={currentPage}>
          <motion.div
            key={currentPage}
            custom={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {pages[currentPage].title}
            </h3>
            {pages[currentPage].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={currentPage === 0}
          className="transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Pagination dots */}
        <div className="flex items-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentPage
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {currentPage + 1}/{pages.length}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="transition-all duration-200"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
