import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, TrendingUp, FileSignature, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
  isProcessing?: boolean;
  isLoadingFields?: boolean;
}

type IntegrationStatus = "not_connected" | "connecting" | "connected";

const Step4Integrations = ({ formData, onComplete, isProcessing: externalProcessing, isLoadingFields = false }: Step4Props) => {
  const [slackStatus, setSlackStatus] = useState<IntegrationStatus>(
    formData.slackConnected ? "connected" : "not_connected"
  );
  const [fxStatus, setFxStatus] = useState<IntegrationStatus>(
    formData.fxConnected ? "connected" : "not_connected"
  );
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>(
    formData.googleSignConnected ? "connected" : "not_connected"
  );

  // Update status when formData changes (e.g., auto-connection from parent)
  useEffect(() => {
    if (formData.slackConnected) {
      setSlackStatus("connected");
    }
    if (formData.fxConnected) {
      setFxStatus("connected");
    }
    if (formData.googleSignConnected) {
      setGoogleStatus("connected");
    }
  }, [formData.slackConnected, formData.fxConnected, formData.googleSignConnected]);

  const handleConnect = (integration: "slack" | "fx" | "google") => {
    const statusMap = {
      slack: setSlackStatus,
      fx: setFxStatus,
      google: setGoogleStatus
    };

    const nameMap = {
      slack: "Slack",
      fx: "FX Provider",
      google: "Google e-Signature"
    };

    statusMap[integration]("connecting");

    // Simulate OAuth/connection
    setTimeout(() => {
      statusMap[integration]("connected");
      toast({
        title: `${nameMap[integration]} connected`,
        description: "Integration successful"
      });
    }, 1500);
  };

  const handleTestAlert = () => {
    toast({
      title: "Test alert sent",
      description: "Check #fronted-alerts in Slack"
    });
  };

  const handleContinue = () => {
    onComplete("integrations_connect", {
      slackConnected: slackStatus === "connected",
      fxConnected: fxStatus === "connected",
      googleSignConnected: googleStatus === "connected"
    });
  };

  const renderIntegrationCard = (
    icon: React.ReactNode,
    title: string,
    description: string,
    status: IntegrationStatus,
    onConnect: () => void,
    testAction?: () => void
  ) => (
    <div className="bg-card/40 border border-border/40 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {status === "connected" && (
          <Badge variant="default" className="bg-primary/10 text-primary border-0 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>
      {status === "not_connected" && (
        <Button onClick={onConnect} size="sm" className="w-full">
          Connect
        </Button>
      )}
      {status === "connecting" && (
        <Button disabled size="sm" className="w-full">
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          Connecting...
        </Button>
      )}
      {status === "connected" && testAction && (
        <Button variant="outline" onClick={testAction} size="sm" className="w-full">
          Test
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Integrations
          </h3>
        </div>
      </div>

      {isLoadingFields ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {renderIntegrationCard(
          <MessageSquare className="h-4 w-4 text-primary" />,
          "Slack",
          "Receive approval requests and alerts",
          slackStatus,
          () => handleConnect("slack"),
          handleTestAlert
        )}

        {renderIntegrationCard(
          <TrendingUp className="h-4 w-4 text-primary" />,
          "FX Provider",
          "Real-time exchange rates",
          fxStatus,
          () => handleConnect("fx")
        )}

        {renderIntegrationCard(
          <FileSignature className="h-4 w-4 text-primary" />,
          "Google e-Signature",
          "Digital document signing",
          googleStatus,
          () => handleConnect("google")
        )}
        </div>
      )}

      {isLoadingFields ? (
        <Skeleton className="h-11 w-full" />
      ) : (
        <Button
        onClick={handleContinue}
        size="lg"
        className="w-full"
        disabled={slackStatus !== "connected" || fxStatus !== "connected" || externalProcessing}
      >
        {externalProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Continue"
        )}
        </Button>
      )}
    </div>
  );
};

export default Step4Integrations;
