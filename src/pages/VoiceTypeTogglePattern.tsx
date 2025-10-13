import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import VoiceTypeToggle from "@/components/dashboard/VoiceTypeToggle";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const VoiceTypeTogglePattern = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<"voice" | "text">("text");
  const [inputValue, setInputValue] = useState("");
  const { isListening, transcript, error, startListening, stopListening, resetTranscript, isSupported } = useSpeechToText();
  const { toast } = useToast();

  const handleToggleMode = () => {
    if (inputMode === "text") {
      if (!isSupported) {
        toast({
          title: "Voice not supported",
          description: "Your browser doesn't support speech recognition.",
          variant: "destructive",
        });
        return;
      }
      setInputMode("voice");
      startListening();
      toast({
        title: "Voice input active",
        description: "Say something like 'Draft my new contract for Maria.'",
      });
    } else {
      setInputMode("text");
      stopListening();
      resetTranscript();
      toast({
        title: "Switched to text mode",
        description: "Type your message precisely.",
      });
    }
  };

  // Update input value when transcript changes
  useState(() => {
    if (transcript && inputMode === "voice") {
      setInputValue(transcript);
    }
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>
        
        {/* Header */}
        <div>
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold">Voice / Type Toggle (Genie Interaction)</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Switch effortlessly between typing and speaking to interact with Genie
          </p>
        </div>

        {/* Pattern Description */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern Overview</CardTitle>
            <CardDescription>
              This toggle enables users to switch between voice and text input modes, adapting to their context, 
              comfort level, and multitasking needs. Users can talk when hands-free or type when precision matters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Real-time speech-to-text transcription</li>
                <li>Visual feedback with status indicators and animations</li>
                <li>Error handling for microphone permissions</li>
                <li>Seamless mode switching with toast notifications</li>
                <li>Accessible tooltips explaining each mode</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Try switching between voice and text input modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Mode Display */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Current Mode:</span>
              <Badge variant={inputMode === "voice" ? "default" : "secondary"}>
                {inputMode === "voice" ? "🎙 Voice" : "⌨️ Text"}
              </Badge>
              {isListening && (
                <Badge variant="outline" className="animate-pulse">
                  Listening...
                </Badge>
              )}
            </div>

            {/* Input Demo */}
            <div className="flex gap-2">
              <Input
                placeholder={inputMode === "voice" ? "Listening..." : "Type your message..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={inputMode === "voice" && isListening}
                className={inputMode === "voice" && isListening ? "bg-muted" : ""}
              />
              <VoiceTypeToggle
                mode={inputMode}
                isListening={isListening}
                error={error}
                onToggle={handleToggleMode}
              />
            </div>

            {/* Transcript Preview */}
            {transcript && inputMode === "voice" && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Live Transcript:</p>
                <p className="text-sm text-muted-foreground">{transcript}</p>
              </div>
            )}

            {/* Status Messages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Interaction States:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-xs font-medium">Idle</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Neither mode active</p>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium">Listening</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Mic active, transcribing</p>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-xs font-medium">Typing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Text input active</p>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-xs font-medium">Error</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Permission denied</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Example Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border-l-4 border-primary bg-muted/50 rounded-r">
              <p className="text-sm font-medium mb-1">Onboarding</p>
              <p className="text-xs text-muted-foreground">
                User says "My name is David," Genie auto-fills the name field
              </p>
            </div>
            <div className="p-3 border-l-4 border-primary bg-muted/50 rounded-r">
              <p className="text-sm font-medium mb-1">Support Query</p>
              <p className="text-xs text-muted-foreground">
                HR asks via voice, "Show me all open payroll tickets" while multitasking
              </p>
            </div>
            <div className="p-3 border-l-4 border-primary bg-muted/50 rounded-r">
              <p className="text-sm font-medium mb-1">Payroll Precision</p>
              <p className="text-xs text-muted-foreground">
                CFO types "Recalculate FX for Norway batch" for structured accuracy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceTypeTogglePattern;
