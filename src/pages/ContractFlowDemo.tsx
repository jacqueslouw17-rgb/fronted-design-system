import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { CandidateConfirmationScreen } from "@/components/contract-flow/CandidateConfirmationScreen";
import CandidateDashboard from "./contract-flow/CandidateDashboard";
import { toast } from "sonner";

const ContractFlowDemo = () => {
  const [showCandidates, setShowCandidates] = useState(false);

  const mockCandidates = [
    {
      id: "1",
      name: "Maria Santos",
      role: "Senior Backend Engineer",
      country: "Philippines",
      countryCode: "PH",
      flag: "🇵🇭",
      salary: "$85,000/year",
      startDate: "2025-11-15",
      status: "Shortlisted" as const,
      noticePeriod: "30 days",
      pto: "20 days",
      currency: "USD",
      signingPortal: "DocuSign",
    },
    {
      id: "2",
      name: "Lars Bjørnson",
      role: "Product Designer",
      country: "Norway",
      countryCode: "NO",
      flag: "🇳🇴",
      salary: "kr 650,000/year",
      startDate: "2025-11-20",
      status: "Shortlisted" as const,
      noticePeriod: "30 days",
      pto: "25 days",
      currency: "NOK",
      signingPortal: "DocuSign",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      toast("🎉 New hire detected", {
        description: "Genie is preparing onboarding for your candidates...",
        duration: 3000,
      });

      setTimeout(() => {
        setShowCandidates(true);
      }, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to="/flows">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flows
          </Button>
        </Link>

        {!showCandidates ? (
          <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-8">
            <AudioWaveVisualizer isActive={true} />
            
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-3xl font-bold">
                Hi Joe! Ready to onboard your new hires?
              </h2>
              <p className="text-lg text-muted-foreground">
                I'll help you generate contracts for your candidates who've accepted their offers.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tell me what you'd like to do..."
                  className="w-full px-6 py-4 pr-12 text-lg rounded-full border-2 border-primary/20 focus:border-primary focus:outline-none bg-background"
                  readOnly
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <CandidateConfirmationScreen 
                candidates={mockCandidates}
                onProceed={() => toast("Proceeding to contract generation...")}
              />
            </TabsContent>
            
            <TabsContent value="candidates">
              <CandidateDashboard />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ContractFlowDemo;
