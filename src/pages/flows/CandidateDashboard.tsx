import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import CandidateChecklistTab from "@/components/flows/candidate-onboarding/CandidateChecklistTab";
import CandidateMetricsTab from "@/components/flows/candidate-onboarding/CandidateMetricsTab";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [isGenieOpen, setIsGenieOpen] = useState(false);
  const [genieMessage, setGenieMessage] = useState("");
  
  // Mock candidate data - in real app, this would come from auth/context
  const candidateName = "Maria";
  const candidateCountry = "PH"; // Philippines
  const candidateType = "Contractor";

  const handleAskGenie = () => {
    setIsGenieOpen(true);
  };

  const handleSendToGenie = () => {
    // In real app, this would send to AI
    console.log("Sending to Genie:", genieMessage);
    setGenieMessage("");
    setIsGenieOpen(false);
  };

  return (
    <main className="flex h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/flows')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Static background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
        <div className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
             style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }} />
        <div className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
             style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }} />
      </div>

      {/* Main Content */}
      <div 
        className="flex-shrink-0 flex flex-col h-screen overflow-y-auto px-6 py-8 space-y-6 relative z-10 mx-auto"
        style={{ 
          width: '100%',
          maxWidth: '900px'
        }}
      >
        {/* Genie Banner */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-foreground/80">
              Hi {candidateName}, I'm here if you need help
            </p>
          </div>
          <Button
            onClick={handleAskGenie}
            size="sm"
            variant="outline"
          >
            Ask Genie
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklist" className="mt-6">
            <CandidateChecklistTab 
              country={candidateCountry}
              type={candidateType}
            />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <CandidateMetricsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Genie Chat Modal */}
      <Dialog open={isGenieOpen} onOpenChange={setIsGenieOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ask Genie
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              I'm here to help with any questions about your onboarding, documents, or pay.
            </p>
            <Textarea
              placeholder="Type your question here..."
              value={genieMessage}
              onChange={(e) => setGenieMessage(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsGenieOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendToGenie} disabled={!genieMessage.trim()}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CandidateDashboard;
