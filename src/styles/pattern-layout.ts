// Reusable layout classes for pattern pages
// Use these className strings for consistency across all pattern pages

export const patternLayout = {
  // Main container
  container: "min-h-screen bg-background p-4 sm:p-6",
  
  // Inner wrapper
  wrapper: "max-w-7xl mx-auto space-y-4",
  
  // Back button
  backButton: "gap-2",
  
  // Header section
  header: "border-b border-border bg-card px-4 sm:px-6 py-4 rounded-lg shadow-card",
  headerTitle: "text-xl sm:text-2xl font-semibold text-foreground",
  headerDescription: "text-muted-foreground text-sm mt-1",
  
  // Content card
  contentCard: "border rounded-lg p-4 bg-card shadow-card",
  
  // Demo section
  demoSection: "space-y-3",
  demoTitle: "text-lg sm:text-xl font-semibold",
  demoDescription: "text-sm text-muted-foreground",
  
  // Features list
  featuresList: "space-y-2",
  featureItem: "flex items-start gap-2",
  featureBullet: "text-primary mt-0.5 flex-shrink-0",
  featureText: "text-sm",
  featureLabel: "font-medium text-foreground",
} as const;
