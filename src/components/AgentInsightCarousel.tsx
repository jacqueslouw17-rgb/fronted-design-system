import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export type TrendDirection = "up" | "down" | "stable";

export interface InsightCardData {
  id: string;
  title: string;
  metric: string;
  subtitle?: string;
  icon?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  progress?: {
    value: number;
    target?: number;
  };
  details?: {
    description: string;
    additionalMetrics?: Array<{ label: string; value: string }>;
    recommendation?: string;
  };
}

const TrendBadge = ({ direction, value }: { direction: TrendDirection; value: string }) => {
  const config = {
    up: {
      icon: TrendingUp,
      className: "bg-muted/50 text-foreground border-muted",
    },
    down: {
      icon: TrendingDown,
      className: "bg-muted/50 text-muted-foreground border-muted",
    },
    stable: {
      icon: Minus,
      className: "bg-muted/50 text-muted-foreground border-muted",
    },
  };

  const { icon: Icon, className } = config[direction];

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs font-normal", className)}>
      <Icon className="h-3 w-3" />
      {value}
    </Badge>
  );
};

const InsightCard = ({
  insight,
  onExpand,
}: {
  insight: InsightCardData;
  onExpand: () => void;
}) => {
  return (
    <Card className="flex-shrink-0 w-[260px] h-full p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {insight.icon && <span className="text-2xl">{insight.icon}</span>}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground line-clamp-2">
              {insight.title}
            </h4>
            <p className="text-2xl font-semibold mt-1">{insight.metric}</p>
          </div>

          {insight.subtitle && (
            <p className="text-xs text-muted-foreground">{insight.subtitle}</p>
          )}

          {/* Trend */}
          {insight.trend && (
            <TrendBadge direction={insight.trend.direction} value={insight.trend.value} />
          )}

          {/* Progress */}
          {insight.progress && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                {insight.progress.target && (
                  <span>
                    {insight.progress.value}% / {insight.progress.target}%
                  </span>
                )}
              </div>
              <Progress value={insight.progress.value} className="h-1.5" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

interface AgentInsightCarouselProps {
  insights: InsightCardData[];
  summary?: string;
  className?: string;
}

export const AgentInsightCarousel = ({
  insights,
  summary,
  className,
}: AgentInsightCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedInsight, setSelectedInsight] = useState<InsightCardData | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 280; // Card width + gap
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2"
            onScroll={checkScroll}
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {insights.map((insight) => (
              <div
                key={insight.id}
                style={{ scrollSnapAlign: "start" }}
                onClick={() => setSelectedInsight(insight)}
              >
                <InsightCard
                  insight={insight}
                  onExpand={() => setSelectedInsight(insight)}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-muted-foreground italic px-1">{summary}</p>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <SheetContent className="sm:max-w-lg">
          {selectedInsight && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  {selectedInsight.icon && (
                    <span className="text-3xl">{selectedInsight.icon}</span>
                  )}
                  <div className="flex-1">
                    <SheetTitle>{selectedInsight.title}</SheetTitle>
                    <SheetDescription className="text-2xl font-semibold text-foreground mt-1">
                      {selectedInsight.metric}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Trend */}
                {selectedInsight.trend && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Trend</h4>
                    <TrendBadge
                      direction={selectedInsight.trend.direction}
                      value={selectedInsight.trend.value}
                    />
                  </div>
                )}

                {/* Progress */}
                {selectedInsight.progress && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Progress</h4>
                    <div className="space-y-2">
                      <Progress value={selectedInsight.progress.value} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {selectedInsight.progress.value}%
                        {selectedInsight.progress.target &&
                          ` of ${selectedInsight.progress.target}% target`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details */}
                {selectedInsight.details && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Details</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedInsight.details.description}
                      </p>
                    </div>

                    {/* Additional Metrics */}
                    {selectedInsight.details.additionalMetrics && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Additional Metrics</h4>
                        <div className="space-y-2">
                          {selectedInsight.details.additionalMetrics.map((metric, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <span className="text-sm text-muted-foreground">
                                {metric.label}
                              </span>
                              <span className="text-sm font-semibold">{metric.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendation */}
                    {selectedInsight.details.recommendation && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                        <h4 className="text-sm font-medium mb-2">💡 Recommendation</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedInsight.details.recommendation}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AgentInsightCarousel;
