/**
 * V4-specific Bundle Creation Page
 * 
 * This is a v4 version of the bundle creation/review contracts flow.
 * Navigates back to Flow 1 - Fronted Admin Dashboard v4 (Tracker tab) on close.
 * 
 * Only used by Flow 1 v4 to prevent navigation leakage into v3.
 */

import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, ArrowLeft, Send, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { toast } from "sonner";
import frontedLogo from "@/assets/fronted-logo.png";

interface V4_BundleCandidate {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  countryFlag: string;
  salary: string;
  employmentType: "employee" | "contractor";
  status: "ready" | "pending" | "sent";
}

// Mock bundle candidates based on v4 data
const MOCK_BUNDLE_CANDIDATES: V4_BundleCandidate[] = [
  {
    id: "c1-2",
    name: "Liam Chen",
    email: "liam.chen@email.com",
    role: "Frontend Developer",
    country: "Singapore",
    countryFlag: "🇸🇬",
    salary: "SGD 7,500/mo",
    employmentType: "contractor",
    status: "ready"
  },
  {
    id: "c2-1",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    role: "Backend Developer",
    country: "Egypt",
    countryFlag: "🇪🇬",
    salary: "EGP 45,000/mo",
    employmentType: "contractor",
    status: "ready"
  },
  {
    id: "c5-2",
    name: "Pierre Dubois",
    email: "pierre.dubois@email.com",
    role: "Data Analyst",
    country: "France",
    countryFlag: "🇫🇷",
    salary: "EUR 4,900/mo",
    employmentType: "contractor",
    status: "ready"
  }
];

const V4_BundleCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idsParam = searchParams.get("ids");
  const companyParam = searchParams.get("company");
  const [isSending, setIsSending] = useState(false);

  // Filter candidates based on IDs param
  const candidates = useMemo(() => {
    if (!idsParam) return MOCK_BUNDLE_CANDIDATES;
    const ids = idsParam.split(",").map(s => s.trim());
    const filtered = MOCK_BUNDLE_CANDIDATES.filter(c => ids.includes(c.id));
    return filtered.length > 0 ? filtered : MOCK_BUNDLE_CANDIDATES;
  }, [idsParam]);

  // V4-specific: Navigate back to v4 dashboard (Tracker tab)
  const handleClose = () => {
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4?company=${companyParam}`);
    } else {
      navigate("/flows/fronted-admin-dashboard-v4");
    }
  };

  // V4-specific: Go back to contract drafting
  const handlePrevious = () => {
    const idsStr = candidates.map(c => c.id).join(',');
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4/contract-creation?ids=${idsStr}&company=${companyParam}`);
    } else {
      navigate(`/flows/fronted-admin-dashboard-v4/contract-creation?ids=${idsStr}`);
    }
  };

  // V4-specific: Send contracts and return to v4 tracker
  const handleSendForSignature = () => {
    setIsSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Contracts sent to ${candidates.length} candidates`, {
        description: "They will receive an email to review and sign."
      });
      
      // Navigate back to v4 tracker
      if (companyParam) {
        navigate(`/flows/fronted-admin-dashboard-v4?company=${companyParam}&contractsSent=true`);
      } else {
        navigate("/flows/fronted-admin-dashboard-v4?contractsSent=true");
      }
    }, 1500);
  };

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex w-full bg-background">
        <AgentLayout context="Contract Bundle">
          <div className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] relative">
            {/* Static background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-secondary/[0.02] to-accent/[0.03]" />
              <div
                className="absolute -top-20 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-10"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05))' }}
              />
              <div
                className="absolute -bottom-24 -right-28 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-8"
                style={{ background: 'linear-gradient(225deg, hsl(var(--accent) / 0.06), hsl(var(--primary) / 0.04))' }}
              />
            </div>
            
            <div className="relative z-10">
              {/* Logo and Close Button - navigates back to v4 */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <img 
                  src={frontedLogo} 
                  alt="Fronted" 
                  className="h-7 sm:h-8 w-auto cursor-pointer"
                  onClick={handleClose}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClose}
                  aria-label="Close and return to pipeline"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Main Content */}
              <div className="max-w-3xl mx-auto px-6 pb-12">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Review Contracts
                  </h1>
                  <p className="text-muted-foreground">
                    Review and send contracts to {candidates.length} candidates
                  </p>
                </div>

                {/* Candidates List */}
                <div className="space-y-4 mb-8">
                  {candidates.map((candidate) => (
                    <Card key={candidate.id} className="border border-border/50 bg-card/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-primary/10">
                              <AvatarFallback className="text-sm">
                                {candidate.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{candidate.name}</span>
                                <span className="text-base">{candidate.countryFlag}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{candidate.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{candidate.salary}</p>
                              <p className="text-xs text-muted-foreground">{candidate.country}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {candidate.employmentType === "employee" ? "EOR" : "COR"}
                            </Badge>
                            <CheckCircle2 className="h-5 w-5 text-accent-green-text" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <Card className="mb-8 border border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          {candidates.length} contract{candidates.length > 1 ? "s" : ""} ready to send
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Candidates will receive an email to review and sign their contracts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleSendForSignature}
                    disabled={isSending}
                    className="gap-2 bg-gradient-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? "Sending..." : "Send for Signature"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AgentLayout>
      </div>
    </RoleLensProvider>
  );
};

export default V4_BundleCreation;
