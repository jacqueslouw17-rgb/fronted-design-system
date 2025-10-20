import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, FileSignature, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer: () => void;
}

type IntegrationStatus = "not_connected" | "connecting" | "connected";

const Step4Integrations = ({ formData, onComplete }: Step4Props) => {
  const [slackStatus, setSlackStatus] = useState<IntegrationStatus>(
    formData.slackConnected ? "connected" : "not_connected"
  );
  const [fxStatus, setFxStatus] = useState<IntegrationStatus>(
    formData.fxConnected ? "connected" : "not_connected"
  );
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>(
    formData.googleSignConnected ? "connected" : "not_connected"
  );

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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {status === "connected" && (
            <Badge variant="default" className="bg-primary/10 text-primary border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {status === "not_connected" && (
          <Button onClick={onConnect} className="w-full">
            Connect
          </Button>
        )}
        {status === "connecting" && (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Connecting...
          </Button>
        )}
        {status === "connected" && testAction && (
          <Button variant="outline" onClick={testAction} className="w-full">
            Send Test Alert
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your essential tools for notifications, payments, and document signing
        </p>
      </div>

      <div className="space-y-4">
        {renderIntegrationCard(
          <MessageSquare className="h-5 w-5 text-primary" />,
          "Slack",
          "Receive approval requests and alerts in your workspace",
          slackStatus,
          () => handleConnect("slack"),
          handleTestAlert
        )}

        {renderIntegrationCard(
          <TrendingUp className="h-5 w-5 text-primary" />,
          "FX Provider (Wise/CurrencyLayer)",
          "Real-time exchange rates for multi-currency payments",
          fxStatus,
          () => handleConnect("fx")
        )}

        {renderIntegrationCard(
          <FileSignature className="h-5 w-5 text-primary" />,
          "Google e-Signature",
          "Digital document signing for contracts and agreements",
          googleStatus,
          () => handleConnect("google")
        )}
      </div>

      {slackStatus === "connected" && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>Channel configured:</strong> #fronted-alerts
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You can change this later in settings
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full"
        disabled={slackStatus !== "connected" || fxStatus !== "connected"}
      >
        Save & Continue
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Slack and FX are required. Google e-Signature is optional.
      </p>
    </div>
  );
};

export default Step4Integrations;
