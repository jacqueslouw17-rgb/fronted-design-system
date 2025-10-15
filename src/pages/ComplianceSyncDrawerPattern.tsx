import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patternLayout } from "@/styles/pattern-layout";
import { ComplianceIcon } from "@/components/compliance/ComplianceIcon";
import { ComplianceDrawer } from "@/components/compliance/ComplianceDrawer";
import { useComplianceChanges } from "@/hooks/useComplianceChanges";

export default function ComplianceSyncDrawerPattern() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("NO");
  
  const { data, status } = useComplianceChanges(selectedCountry);

  const componentsList = [
    { name: "ComplianceIcon", description: "Status indicator with badge states" },
    { name: "ComplianceDrawer", description: "Main drawer with sync status and actions" },
    { name: "RuleBadge", description: "Editable policy chips" },
    { name: "RuleChangeChip", description: "Expandable change summaries" },
    { name: "SyncStatusDot", description: "Visual status indicator" },
    { name: "DiffViewer", description: "Side-by-side text comparison" },
    { name: "SourceLink", description: "Authority reference links" },
    { name: "AcknowledgeButton", description: "Confirm review action" }
  ];

  return (
    <div className={patternLayout.container}>
      <div className={patternLayout.wrapper}>
        <Link to="/dashboard">
          <Button variant="ghost" className={patternLayout.backButton}>
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Tabs defaultValue="patterns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={patternLayout.header}>
              <h1 className={patternLayout.headerTitle}>
                Pattern 41 – Compliance Sync Drawer
              </h1>
              <p className={patternLayout.headerDescription}>
                Real-time country rule status + quick actions, surfaced inside the Genie container
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">pattern</Badge>
                <Badge variant="outline">genie</Badge>
                <Badge variant="outline">compliance</Badge>
                <Badge variant="outline">drawer</Badge>
                <Badge variant="outline">policy</Badge>
              </div>
            </div>

            <TabsList>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="patterns" className={patternLayout.contentCard}>
            <div className={patternLayout.demoSection}>
              <h2 className={patternLayout.demoTitle}>Interactive Demo</h2>
              <p className={patternLayout.demoDescription}>
                Click the compliance icon to open the drawer. Try different countries to see varying states.
              </p>

              <div className="mt-6 space-y-4">
                {/* Demo launcher */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧞</span>
                    <div>
                      <p className="font-medium">Kurt - Compliance Assistant</p>
                      <p className="text-sm text-muted-foreground">
                        {status === "changed" 
                          ? "New rule changes detected. Review required."
                          : "All compliance rules up to date."}
                      </p>
                    </div>
                  </div>
                  
                  <ComplianceIcon
                    status={status}
                    count={data?.changes.length}
                    onClick={() => setDrawerOpen(true)}
                  />
                </div>

                {/* Country selector for demo */}
                <div className="flex gap-2">
                  {["NO", "PH", "SE", "US"].map((country) => (
                    <Button
                      key={country}
                      variant={selectedCountry === country ? "default" : "outline"}
                      onClick={() => setSelectedCountry(country)}
                      size="sm"
                    >
                      {country === "NO" && "🇳🇴 Norway"}
                      {country === "PH" && "🇵🇭 Philippines"}
                      {country === "SE" && "🇸🇪 Sweden"}
                      {country === "US" && "🇺🇸 United States"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3">Pattern Features</h3>
                <ul className={patternLayout.featuresList}>
                  <li className={patternLayout.featureItem}>
                    <span className={patternLayout.featureBullet}>•</span>
                    <span className={patternLayout.featureText}>
                      <span className={patternLayout.featureLabel}>Real-time Status:</span> Icon badge shows sync state (idle, changed, syncing, error)
                    </span>
                  </li>
                  <li className={patternLayout.featureItem}>
                    <span className={patternLayout.featureBullet}>•</span>
                    <span className={patternLayout.featureText}>
                      <span className={patternLayout.featureLabel}>Change Tracking:</span> Expandable chips show rule modifications with diff viewer
                    </span>
                  </li>
                  <li className={patternLayout.featureItem}>
                    <span className={patternLayout.featureBullet}>•</span>
                    <span className={patternLayout.featureText}>
                      <span className={patternLayout.featureLabel}>Quick Actions:</span> Apply to templates, re-run validation, open country module
                    </span>
                  </li>
                  <li className={patternLayout.featureItem}>
                    <span className={patternLayout.featureBullet}>•</span>
                    <span className={patternLayout.featureText}>
                      <span className={patternLayout.featureLabel}>Audit Integration:</span> Acknowledgments log to audit timeline automatically
                    </span>
                  </li>
                  <li className={patternLayout.featureItem}>
                    <span className={patternLayout.featureBullet}>•</span>
                    <span className={patternLayout.featureText}>
                      <span className={patternLayout.featureLabel}>Source Attribution:</span> Links to official authorities and references
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 border border-primary/40 bg-primary/5 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Integration Points</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Launches from Genie container header (Pattern 38)</li>
                  <li>• Connects to Policy Tag Chips pattern for rule badges</li>
                  <li>• Posts acknowledgments to Audit Trail Timeline (Pattern 9)</li>
                  <li>• Triggers Compliance Checklist (Pattern 14) validation</li>
                  <li>• Updates Contract Template Store with new clauses</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="components" className={patternLayout.contentCard}>
            <div className="space-y-6">
              <div>
                <h2 className={patternLayout.demoTitle}>Components</h2>
                <p className={patternLayout.demoDescription}>
                  Reusable components that make up the Compliance Sync Drawer pattern
                </p>
              </div>

              <div className="grid gap-4">
                {componentsList.map((component) => (
                  <div
                    key={component.name}
                    className="p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-mono text-sm font-semibold text-primary">
                          {component.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {component.description}
                        </p>
                      </div>
                      <Badge variant="outline">component</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold mb-2">Usage Example</h3>
                <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
{`import { ComplianceIcon } from "@/components/compliance/ComplianceIcon";
import { ComplianceDrawer } from "@/components/compliance/ComplianceDrawer";
import { useComplianceChanges } from "@/hooks/useComplianceChanges";

const { data, status } = useComplianceChanges("NO");

<ComplianceIcon 
  status={status}
  count={data?.changes.length}
  onClick={() => setOpen(true)} 
/>

<ComplianceDrawer
  open={open}
  onOpenChange={setOpen}
  country="NO"
  status={status}
  changes={data?.changes || []}
  activePolicies={data?.activePolicies || []}
  sources={data?.sources}
/>`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Drawer instance */}
        {data && (
          <ComplianceDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            country={selectedCountry}
            status={status}
            lastSync={data.lastSync}
            changes={data.changes}
            activePolicies={data.activePolicies}
            sources={data.sources}
          />
        )}
      </div>
    </div>
  );
}
