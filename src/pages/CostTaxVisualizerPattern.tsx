import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { patternLayout } from "@/styles/pattern-layout";
import { CostBreakdownCard } from "@/components/cost/CostBreakdownCard";
import { Badge } from "@/components/ui/badge";

const CostTaxVisualizerPattern = () => {
  return (
    <div className={patternLayout.container}>
      <div className={patternLayout.wrapper}>
        <Link to="/">
          <Button variant="ghost" className={patternLayout.backButton}>
            <ArrowLeft className="h-4 w-4" />
            Back to Patterns
          </Button>
        </Link>

        <div className={patternLayout.header}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h1 className={patternLayout.headerTitle}>
                Cost & Tax Logic Visualizer
              </h1>
              <p className={patternLayout.headerDescription}>
                Transparent breakdown of Gross → Employer Tax → Fee → Total. Toggle fee model and simulate what-ifs.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">Finance</Badge>
                <Badge variant="outline">Transparency</Badge>
                <Badge variant="outline">Country Blocks</Badge>
                <Badge variant="outline">FX</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className={patternLayout.contentCard}>
          <div className={patternLayout.demoSection}>
            <h2 className={patternLayout.demoTitle}>Interactive Demo</h2>
            <p className={patternLayout.demoDescription}>
              Adjust jurisdiction, rates, and fee model to see real-time cost calculations.
            </p>
          </div>

          <div className="mt-6 max-w-2xl">
            <CostBreakdownCard />
          </div>
        </div>

        <div className={patternLayout.contentCard}>
          <div className={patternLayout.demoSection}>
            <h2 className={patternLayout.demoTitle}>Components Used</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge>CostBreakdownCard</Badge>
              <Badge>FXBadge</Badge>
              <Badge>FeeToggleSwitch</Badge>
              <Badge>TooltipExplain</Badge>
              <Badge>ComparisonChart</Badge>
            </div>
          </div>
        </div>

        <div className={patternLayout.contentCard}>
          <div className={patternLayout.demoSection}>
            <h2 className={patternLayout.demoTitle}>Features</h2>
            <ul className={patternLayout.featuresList}>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Dynamic Calculations:</span>{" "}
                  Real-time computation of employer tax, fees, and totals
                </span>
              </li>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Fee Model Toggle:</span>{" "}
                  Switch between GROSS and TOTAL_COST fee calculation models
                </span>
              </li>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>FX Support:</span>{" "}
                  Optional FX spot and spread visualization
                </span>
              </li>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Policy Persistence:</span>{" "}
                  Save default fee model and rate as company policy
                </span>
              </li>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Audit Trail:</span>{" "}
                  Automatic logging of all cost parameter changes
                </span>
              </li>
              <li className={patternLayout.featureItem}>
                <span className={patternLayout.featureBullet}>•</span>
                <span className={patternLayout.featureText}>
                  <span className={patternLayout.featureLabel}>Comparison View:</span>{" "}
                  Educational competitor pricing comparison
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={patternLayout.contentCard}>
          <div className={patternLayout.demoSection}>
            <h2 className={patternLayout.demoTitle}>Used in Flows</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">F3</Badge>
              <Badge variant="secondary">F4</Badge>
              <Badge variant="secondary">F11</Badge>
              <Badge variant="secondary">F13</Badge>
            </div>
          </div>
        </div>

        <div className={patternLayout.contentCard}>
          <div className={patternLayout.demoSection}>
            <h2 className={patternLayout.demoTitle}>Related Patterns</h2>
            <div className="mt-3">
              <Link to="/patterns/fx-breakdown-popover">
                <Badge variant="outline" className="hover:bg-primary/5 cursor-pointer">
                  Pattern 19: FX Breakdown Popover
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostTaxVisualizerPattern;
