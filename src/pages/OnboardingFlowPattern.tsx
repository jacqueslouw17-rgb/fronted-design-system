import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, PanelLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StepCard from "@/components/StepCard";
import ProgressBar from "@/components/ProgressBar";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { patternLayout } from "@/styles/pattern-layout";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechToText } from "@/hooks/useSpeechToText";

const OnboardingFlowPattern = () => {
  const { speak, stop, currentWordIndex } = useTextToSpeech({ lang: 'en-GB', voiceName: 'british', rate: 1.1 });
  const { isListening, transcript, startListening, stopListening, resetTranscript, error: sttError, isDetectingVoice } = useSpeechToText();
  
  const [isKurtVisible, setIsKurtVisible] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>("step1");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [kurtMessage, setKurtMessage] = useState("Click 'Speak' below to get started with your setup.");
  const [hasActivatedSpeech, setHasActivatedSpeech] = useState(false);

  const steps = [
    { id: "step1", title: "Welcome", status: "active" as const },
    { id: "step2", title: "Organization", status: "pending" as const },
    { id: "step3", title: "Localization", status: "pending" as const },
    { id: "step4", title: "Integrations", status: "pending" as const },
    { id: "step5", title: "Mini-Rules", status: "pending" as const },
    { id: "step6", title: "Pledge", status: "pending" as const },
    { id: "step7", title: "Finish", status: "pending" as const },
  ];

  const toggleKurt = () => {
    setIsKurtVisible(!isKurtVisible);
  };

  const handleStepClick = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleSpeakClick = () => {
    if (hasActivatedSpeech) return;
    
    setHasActivatedSpeech(true);
    const initialMessage = "Hi, I'm Kurt. I'll help you set up today. Let's get started!";
    setKurtMessage(initialMessage);
    setIsSpeaking(true);
    setExpandedStep("step1");
    
    stop();
    speak(initialMessage, () => {
      setIsSpeaking(false);
    });
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    stop();
    await startListening();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/design-system">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Design System
            </Button>
          </Link>
          <div className="flex items-start justify-between">
          <div>
            <h1 className={patternLayout.headerTitle}>Onboarding Flow Pattern</h1>
            <p className={patternLayout.headerDescription}>
              Voice-enabled conversational onboarding with collapsible AI agent, progress tracking, and dual-mode input
            </p>
          </div>
          </div>
        </div>

        {/* Pattern Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Collapsible AI agent (Kurt)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Voice detection with resting state</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Dual-mode input (voice/manual)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Step-by-step progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Smooth slide animations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Components Used</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">AudioWaveVisualizer</Badge>
              <Badge variant="secondary">StepCard</Badge>
              <Badge variant="secondary">ProgressBar</Badge>
              <Badge variant="secondary">VoiceToggle</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Use Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>• Admin onboarding setup</p>
              <p>• Multi-step form wizard</p>
              <p>• Configuration flows</p>
              <p>• Guided data collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Interactive demonstration of the onboarding flow pattern
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Main Demo Layout */}
            <div className="relative flex gap-6 min-h-[600px]">
              {/* Kurt Agent - Collapsible */}
              {isKurtVisible && (
                <section className="w-80 flex-shrink-0 transition-all duration-300 ease-in-out animate-fade-in">
                  <div className="sticky top-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">AI Assistant</h3>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5 rounded-2xl blur-xl" />
                      <Card className="relative border-2 border-primary/20 bg-card/95 backdrop-blur">
                        <CardContent className="p-6 space-y-6">
                          <div className="flex flex-col items-center text-center space-y-6">
                            <AudioWaveVisualizer
                              isActive={isSpeaking}
                              isListening={isListening}
                              isDetectingVoice={isDetectingVoice}
                            />

                            <p className="text-sm text-muted-foreground max-w-xs">
                              {kurtMessage}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-border/50 flex flex-col items-center gap-3">
                            {!hasActivatedSpeech ? (
                              <Button onClick={handleSpeakClick} className="w-full">
                                <Mic className="h-4 w-4 mr-2" />
                                Speak
                              </Button>
                            ) : isListening ? (
                              <div className="flex items-center gap-2 w-full">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                                  <Mic className="h-4 w-4 animate-pulse" />
                                  <span>Listening...</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={stopListening}
                                >
                                  Stop
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
              )}

              {/* Main Content Area */}
              <aside
                className={`flex-1 transition-all duration-300 ease-in-out ${
                  !isKurtVisible ? "max-w-2xl mx-auto" : ""
                }`}
              >
                {/* Progress Bar with Drawer Toggle */}
                <div className="flex items-center gap-2 mb-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={toggleKurt}
                        >
                          <PanelLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 text-foreground border-white/20">
                        <p className="text-xs">{isKurtVisible ? "Collapse Kurt" : "Expand Kurt"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex-1">
                    <ProgressBar currentStep={1} totalSteps={7} />
                  </div>
                </div>

                {/* Step Cards */}
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <StepCard
                      key={step.id}
                      stepNumber={idx + 1}
                      title={step.title}
                      status={step.status}
                      isExpanded={expandedStep === step.id}
                      onClick={() => handleStepClick(step.id)}
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Step content goes here. This is where the actual form fields,
                          inputs, and interactions for this step would appear.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm">Continue</Button>
                          <Button size="sm" variant="outline">
                            Skip
                          </Button>
                        </div>
                      </div>
                    </StepCard>
                  ))}
                </div>
              </aside>
            </div>
          </CardContent>
        </Card>

        {/* Behavior & Implementation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Behaviors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Collapsible AI Agent</h4>
                <p className="text-muted-foreground">
                  Click the drawer toggle to collapse/expand Kurt. When collapsed, the form centers automatically with smooth transitions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Voice Detection States</h4>
                <p className="text-muted-foreground">
                  Audio visualizer shows three states: resting (minimal movement), listening (medium), and detecting voice (full animation).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Auto-Collapse on Manual Mode</h4>
                <p className="text-muted-foreground">
                  When user selects "Manual Forms" in step 1, Kurt automatically collapses with slide animation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Implementation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">State Management</h4>
                <p className="text-muted-foreground mb-2">Key states to track:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li><code>isKurtVisible</code> - Controls drawer visibility</li>
                  <li><code>isListening</code> - Voice input active</li>
                  <li><code>isDetectingVoice</code> - Audio level threshold met</li>
                  <li><code>expandedStep</code> - Currently expanded step ID</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Audio Level Detection</h4>
                <p className="text-muted-foreground">
                  Use Web Audio API's AnalyserNode to monitor input levels. Update <code>isDetectingVoice</code> when amplitude exceeds threshold.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Code Example</CardTitle>
            <CardDescription>Core structure for the onboarding flow</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`// State management
const [isKurtVisible, setIsKurtVisible] = useState(true);
const [expandedStep, setExpandedStep] = useState<string | null>("step1");

// Layout structure
<div className="flex gap-6">
  {/* Collapsible Kurt Agent */}
  {isKurtVisible && (
    <section className="w-80 transition-all duration-300 animate-fade-in">
      <KurtAvatar />
      <AudioWaveVisualizer
        isActive={isSpeaking}
        isListening={isListening}
        isDetectingVoice={isDetectingVoice}
      />
    </section>
  )}

  {/* Main Form Area */}
  <aside className={\`flex-1 transition-all duration-300
    \${!isKurtVisible ? "max-w-2xl mx-auto" : ""}\`}>
    
    {/* Progress with Drawer Toggle */}
    <div className="flex items-center gap-4">
      <Button onClick={() => setIsKurtVisible(!isKurtVisible)}>
        <PanelLeft />
      </Button>
      <ProgressBar currentStep={1} totalSteps={7} />
    </div>

    {/* Step Cards */}
    {steps.map(step => (
      <StepCard
        isExpanded={expandedStep === step.id}
        onToggle={() => setExpandedStep(
          expandedStep === step.id ? null : step.id
        )}
      />
    ))}
  </aside>
</div>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlowPattern;
