/**
 * Frosted Header — scroll-activated translucent backdrop for fixed logo + close button.
 * Starts fully transparent; gains a frosted glass effect on scroll.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";

interface FrostedHeaderProps {
  onLogoClick: () => void;
  onCloseClick: () => void;
}

export const FrostedHeader = ({ onLogoClick, onCloseClick }: FrostedHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-background/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_hsl(var(--border)/0.15)]"
          : ""
      }`}
    >
      <img
        src={frontedLogo}
        alt="Fronted"
        className="h-5 sm:h-6 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onLogoClick}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onCloseClick}
        className="h-8 w-8 sm:h-10 sm:w-10"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </div>
  );
};
