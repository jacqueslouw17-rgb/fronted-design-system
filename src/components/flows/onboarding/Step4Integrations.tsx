import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Step4Props {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  onOpenDrawer?: (drawerId: string) => void;
  externalProcessing?: boolean;
  isLoadingFields?: boolean;
  isProcessing?: boolean;
}

type IntegrationStatus = "not_connected" | "connecting" | "connected";

const Step4Integrations = ({ formData, onComplete, onOpenDrawer, externalProcessing = false, isLoadingFields = false }: Step4Props) => {
  const [slackStatus, setSlackStatus] = useState<IntegrationStatus>("not_connected");
  const [fxStatus, setFxStatus] = useState<IntegrationStatus>("not_connected");
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>("not_connected");

  // Pre-populate statuses if already connected
  useEffect(() => {
    if (formData.slackConnected) setSlackStatus("connected");
    if (formData.fxConnected) setFxStatus("connected");
    if (formData.googleSignConnected) setGoogleStatus("connected");
  }, [formData]);

  const handleConnect = async (integration: "slack" | "fx" | "google") => {
    const setters = {
      slack: setSlackStatus,
      fx: setFxStatus,
      google: setGoogleStatus
    };

    const names = {
      slack: "Slack",
      fx: "FX Provider",
      google: "Google e-Signature"
    };

    setters[integration]("connecting");

    // Simulate connection
    setTimeout(() => {
      setters[integration]("connected");
      toast({
        title: "✅ Connected",
        description: `${names[integration]} successfully connected.`
      });
    }, 2000);
  };

  const handleTestAlert = () => {
    toast({
      title: "🔔 Test Alert",
      description: "A test notification was sent to #payroll-alerts."
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
    title: string,
    description: string,
    icon: JSX.Element,
    status: IntegrationStatus,
    onConnect: () => void,
    onTest?: () => void
  ) => (
    <Card className="border border-border/40 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {status === "connected" && (
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
          {status === "not_connected" && (
            <Badge variant="outline" className="text-muted-foreground">
              <Circle className="w-3 h-3 mr-1" />
              Not Connected
            </Badge>
          )}
          {status === "connecting" && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Connecting
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          {status === "not_connected" && (
            <Button onClick={onConnect} size="sm" className="flex-1">
              Connect
            </Button>
          )}
          {status === "connected" && onTest && (
            <Button onClick={onTest} size="sm" variant="outline" className="flex-1">
              Test
            </Button>
          )}
          {status === "connecting" && (
            <Button disabled size="sm" className="flex-1">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {isLoadingFields ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          {renderIntegrationCard(
            "Slack Integration",
            "Get payroll alerts and approvals in Slack",
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>,
            slackStatus,
            () => handleConnect("slack"),
            slackStatus === "connected" ? handleTestAlert : undefined
          )}

          {renderIntegrationCard(
            "FX Provider",
            "Connect Wise or similar for real-time FX rates",
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>,
            fxStatus,
            () => handleConnect("fx")
          )}

          {renderIntegrationCard(
            "Google e-Signature",
            "Enable document signing with Google",
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>,
            googleStatus,
            () => handleConnect("google")
          )}
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue} 
          disabled={slackStatus !== "connected" || externalProcessing}
          size="lg"
        >
          {externalProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step4Integrations;
