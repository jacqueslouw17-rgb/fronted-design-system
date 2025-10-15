import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-md",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-md",
        outline: "text-foreground hover:bg-accent/50",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80 hover:shadow-md",
        gradient: "border-transparent bg-gradient-primary text-primary-foreground hover:opacity-90 hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
});
Badge.displayName = "Badge";

export { Badge, badgeVariants };
