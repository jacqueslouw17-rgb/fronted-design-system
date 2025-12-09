/**
 * V4-specific Contract Flow Page
 * 
 * This is a v4 clone of the COMPLETE contract flow from v3.
 * Includes ALL phases: contract-creation, bundle-creation, drafting, reviewing
 * Navigates back to Flow 1 - Fronted Admin Dashboard v4 (Tracker tab) on close.
 * 
 * Only used by Flow 1 v4 to prevent navigation leakage into v3.
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

// Contract flow components (reused from v3)
import { ContractCreationScreen } from "@/components/contract-flow/ContractCreationScreen";
import { DocumentBundleCarousel } from "@/components/contract-flow/DocumentBundleCarousel";
import { ContractDraftWorkspace } from "@/components/contract-flow/ContractDraftWorkspace";
import { ContractReviewBoard } from "@/components/contract-flow/ContractReviewBoard";

import { Candidate } from "@/hooks/useContractFlow";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentLayout } from "@/components/agent/AgentLayout";
import { AgentHeader } from "@/components/agent/AgentHeader";
import frontedLogo from "@/assets/fronted-logo.png";

// V4-specific flow phases
type V4ContractPhase = 
  | "contract-creation"   // Step 1: Fill contract details per candidate
  | "bundle-creation"     // Step 2: Review document bundle, generate signing pack
  | "drafting"            // Step 3: Review actual contract documents
  | "reviewing";          // Step 4: Final review before send for signature

// V4-specific company contractors data - must match IDs from FrontedAdminDashboardV4.tsx V4_COMPANY_CONTRACTORS
const V4_MOCK_CANDIDATES: Candidate[] = [
  // Company 1 - TechCorp Global
  { id: "c1-1", name: "Maria Santos", email: "maria.santos@email.com", role: "Senior Developer", country: "Philippines", countryCode: "PH", flag: "🇵🇭", currency: "PHP", startDate: "2025-02-01", salary: "PHP 120,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c1-2", name: "Liam Chen", email: "liam.chen@email.com", role: "Frontend Developer", country: "Singapore", countryCode: "SG", flag: "🇸🇬", currency: "SGD", startDate: "2025-02-01", salary: "SGD 7,500/mo", noticePeriod: "30 days", pto: "14 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c1-8", name: "David Kim", email: "david.kim@email.com", role: "Mobile Developer", country: "South Korea", countryCode: "KR", flag: "🇰🇷", currency: "KRW", startDate: "2025-02-01", salary: "KRW 5,200,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c1-9", name: "Elena Volkov", email: "elena.volkov@email.com", role: "Full Stack Developer", country: "Ukraine", countryCode: "UA", flag: "🇺🇦", currency: "USD", startDate: "2025-02-01", salary: "USD 4,500/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c1-10", name: "Fatima Al-Rashid", email: "fatima.alrashid@email.com", role: "Solutions Architect", country: "UAE", countryCode: "AE", flag: "🇦🇪", currency: "AED", startDate: "2025-02-01", salary: "AED 28,000/mo", noticePeriod: "30 days", pto: "22 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c1-3", name: "Sofia Rodriguez", email: "sofia.rodriguez@email.com", role: "Marketing Manager", country: "Mexico", countryCode: "MX", flag: "🇲🇽", currency: "MXN", startDate: "2025-02-01", salary: "MXN 45,000/mo", noticePeriod: "15 days", pto: "12 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c1-11", name: "Kenji Yamamoto", email: "kenji.yamamoto@email.com", role: "Security Engineer", country: "Japan", countryCode: "JP", flag: "🇯🇵", currency: "JPY", startDate: "2025-02-01", salary: "JPY 720,000/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  
  // Company 2 - InnovateLabs Inc.
  { id: "c2-1", name: "Ahmed Hassan", email: "ahmed.hassan@email.com", role: "Backend Developer", country: "Egypt", countryCode: "EG", flag: "🇪🇬", currency: "EGP", startDate: "2025-02-01", salary: "EGP 45,000/mo", noticePeriod: "30 days", pto: "21 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c2-2", name: "Yuki Tanaka", email: "yuki.tanaka@email.com", role: "UX Designer", country: "Japan", countryCode: "JP", flag: "🇯🇵", currency: "JPY", startDate: "2025-02-01", salary: "JPY 650,000/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c2-3", name: "Miguel Fernandez", email: "miguel.fernandez@email.com", role: "UI Designer", country: "Spain", countryCode: "ES", flag: "🇪🇸", currency: "EUR", startDate: "2025-02-01", salary: "EUR 4,200/mo", noticePeriod: "30 days", pto: "22 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c2-4", name: "Priya Sharma", email: "priya.sharma@email.com", role: "Product Designer", country: "India", countryCode: "IN", flag: "🇮🇳", currency: "INR", startDate: "2025-02-01", salary: "INR 180,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c2-5", name: "Natasha Ivanova", email: "natasha.ivanova@email.com", role: "Data Scientist", country: "Russia", countryCode: "RU", flag: "🇷🇺", currency: "USD", startDate: "2025-02-01", salary: "USD 6,000/mo", noticePeriod: "30 days", pto: "28 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c2-6", name: "Thomas Andersen", email: "thomas.andersen@email.com", role: "Cloud Architect", country: "Norway", countryCode: "NO", flag: "🇳🇴", currency: "NOK", startDate: "2025-02-01", salary: "NOK 75,000/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  
  // Company 3 - Startup Ventures
  { id: "c3-2", name: "Aisha Mohammed", email: "aisha.mohammed@email.com", role: "Growth Hacker", country: "Nigeria", countryCode: "NG", flag: "🇳🇬", currency: "NGN", startDate: "2025-02-01", salary: "NGN 850,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c3-3", name: "Hans Weber", email: "hans.weber@email.com", role: "Systems Analyst", country: "Austria", countryCode: "AT", flag: "🇦🇹", currency: "EUR", startDate: "2025-02-01", salary: "EUR 5,100/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c3-4", name: "Sophie Martin", email: "sophie.martin@email.com", role: "ML Engineer", country: "France", countryCode: "FR", flag: "🇫🇷", currency: "EUR", startDate: "2025-02-01", salary: "EUR 6,500/mo", noticePeriod: "60 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c3-5", name: "Leo van der Berg", email: "leo.vanderberg@email.com", role: "Platform Engineer", country: "Netherlands", countryCode: "NL", flag: "🇳🇱", currency: "EUR", startDate: "2025-02-01", salary: "EUR 5,900/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  
  // Company 4 - Digital Dynamics Ltd.
  { id: "c4-1", name: "Sarah O'Connor", email: "sarah.oconnor@email.com", role: "Content Strategist", country: "Ireland", countryCode: "IE", flag: "🇮🇪", currency: "EUR", startDate: "2025-02-01", salary: "EUR 4,800/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c4-2", name: "Dmitri Petrov", email: "dmitri.petrov@email.com", role: "QA Lead", country: "Poland", countryCode: "PL", flag: "🇵🇱", currency: "PLN", startDate: "2025-02-01", salary: "PLN 22,000/mo", noticePeriod: "30 days", pto: "26 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c4-3", name: "Ana Pereira", email: "ana.pereira@email.com", role: "Frontend Developer", country: "Portugal", countryCode: "PT", flag: "🇵🇹", currency: "EUR", startDate: "2025-02-01", salary: "EUR 4,100/mo", noticePeriod: "30 days", pto: "22 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c4-4", name: "Javier Gonzalez", email: "javier.gonzalez@email.com", role: "Backend Developer", country: "Argentina", countryCode: "AR", flag: "🇦🇷", currency: "USD", startDate: "2025-02-01", salary: "USD 4,200/mo", noticePeriod: "30 days", pto: "14 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  
  // Company 5 - CloudScale Solutions
  { id: "c5-1", name: "Emma Johnson", email: "emma.johnson@email.com", role: "Product Manager", country: "United Kingdom", countryCode: "GB", flag: "🇬🇧", currency: "GBP", startDate: "2025-02-01", salary: "GBP 5,800/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c5-2", name: "Pierre Dubois", email: "pierre.dubois@email.com", role: "Data Analyst", country: "France", countryCode: "FR", flag: "🇫🇷", currency: "EUR", startDate: "2025-02-01", salary: "EUR 4,900/mo", noticePeriod: "60 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c5-3", name: "Alexander Novak", email: "alexander.novak@email.com", role: "Game Developer", country: "Czech Republic", countryCode: "CZ", flag: "🇨🇿", currency: "CZK", startDate: "2025-02-01", salary: "CZK 85,000/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c5-4", name: "Mei Lin", email: "mei.lin@email.com", role: "AI Researcher", country: "China", countryCode: "CN", flag: "🇨🇳", currency: "CNY", startDate: "2025-02-01", salary: "CNY 45,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  
  // Company 6 - NextGen Enterprises
  { id: "c6-1", name: "Zara Ahmed", email: "zara.ahmed@email.com", role: "Mobile Developer", country: "Pakistan", countryCode: "PK", flag: "🇵🇰", currency: "PKR", startDate: "2025-02-01", salary: "PKR 450,000/mo", noticePeriod: "30 days", pto: "14 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c6-2", name: "Nikolai Volkov", email: "nikolai.volkov@email.com", role: "Blockchain Developer", country: "Belarus", countryCode: "BY", flag: "🇧🇾", currency: "USD", startDate: "2025-02-01", salary: "USD 4,800/mo", noticePeriod: "30 days", pto: "24 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c6-3", name: "Ingrid Nilsen", email: "ingrid.nilsen@email.com", role: "Product Owner", country: "Denmark", countryCode: "DK", flag: "🇩🇰", currency: "DKK", startDate: "2025-02-01", salary: "DKK 55,000/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  
  // Company 7 - Quantum Systems Co.
  { id: "c7-1", name: "Amara Diallo", email: "amara.diallo@email.com", role: "Community Manager", country: "Senegal", countryCode: "SN", flag: "🇸🇳", currency: "XOF", startDate: "2025-02-01", salary: "XOF 1,200,000/mo", noticePeriod: "30 days", pto: "18 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c7-2", name: "Elias Christodoulou", email: "elias.christodoulou@email.com", role: "Network Engineer", country: "Greece", countryCode: "GR", flag: "🇬🇷", currency: "EUR", startDate: "2025-02-01", salary: "EUR 3,800/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c7-3", name: "Valentina Rossi", email: "valentina.rossi@email.com", role: "UX Researcher", country: "Italy", countryCode: "IT", flag: "🇮🇹", currency: "EUR", startDate: "2025-02-01", salary: "EUR 4,500/mo", noticePeriod: "30 days", pto: "22 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  
  // Company 8 - FutureWorks International
  { id: "c8-1", name: "Kwame Asante", email: "kwame.asante@email.com", role: "Software Engineer", country: "Ghana", countryCode: "GH", flag: "🇬🇭", currency: "GHS", startDate: "2025-02-01", salary: "GHS 15,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c8-2", name: "Luisa Herrera", email: "luisa.herrera@email.com", role: "Business Analyst", country: "Chile", countryCode: "CL", flag: "🇨🇱", currency: "CLP", startDate: "2025-02-01", salary: "CLP 2,800,000/mo", noticePeriod: "30 days", pto: "15 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c8-3", name: "Jan Kowalczyk", email: "jan.kowalczyk@email.com", role: "Android Developer", country: "Poland", countryCode: "PL", flag: "🇵🇱", currency: "PLN", startDate: "2025-02-01", salary: "PLN 20,000/mo", noticePeriod: "30 days", pto: "26 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c8-4", name: "Freya Magnusson", email: "freya.magnusson@email.com", role: "Technical Lead", country: "Iceland", countryCode: "IS", flag: "🇮🇸", currency: "ISK", startDate: "2025-02-01", salary: "ISK 950,000/mo", noticePeriod: "30 days", pto: "24 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  
  // Company 9 - Apex Technologies
  { id: "c9-1", name: "Andrei Popescu", email: "andrei.popescu@email.com", role: "Backend Developer", country: "Romania", countryCode: "RO", flag: "🇷🇴", currency: "RON", startDate: "2025-02-01", salary: "RON 18,000/mo", noticePeriod: "30 days", pto: "21 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c9-2", name: "Jasmine Patel", email: "jasmine.patel@email.com", role: "HR Specialist", country: "Singapore", countryCode: "SG", flag: "🇸🇬", currency: "SGD", startDate: "2025-02-01", salary: "SGD 6,500/mo", noticePeriod: "30 days", pto: "14 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c9-3", name: "Erik Johansson", email: "erik.johansson@email.com", role: "Infrastructure Engineer", country: "Sweden", countryCode: "SE", flag: "🇸🇪", currency: "SEK", startDate: "2025-02-01", salary: "SEK 62,000/mo", noticePeriod: "30 days", pto: "25 days", signingPortal: "DocuSign", employmentType: "employee", status: "Hired" },
  { id: "c9-4", name: "Marta Kowalska", email: "marta.kowalska@email.com", role: "Data Analyst", country: "Poland", countryCode: "PL", flag: "🇵🇱", currency: "PLN", startDate: "2025-02-01", salary: "PLN 16,000/mo", noticePeriod: "30 days", pto: "26 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  
  // Company 10 - Horizon Group
  { id: "c10-1", name: "Hassan Malik", email: "hassan.malik@email.com", role: "DevOps Engineer", country: "Malaysia", countryCode: "MY", flag: "🇲🇾", currency: "MYR", startDate: "2025-02-01", salary: "MYR 12,000/mo", noticePeriod: "30 days", pto: "14 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c10-2", name: "Alicia Fernandez", email: "alicia.fernandez@email.com", role: "UX Designer", country: "Mexico", countryCode: "MX", flag: "🇲🇽", currency: "MXN", startDate: "2025-02-01", salary: "MXN 42,000/mo", noticePeriod: "15 days", pto: "12 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
  { id: "c10-3", name: "Peter Nagy", email: "peter.nagy@email.com", role: "Security Engineer", country: "Hungary", countryCode: "HU", flag: "🇭🇺", currency: "HUF", startDate: "2025-02-01", salary: "HUF 1,200,000/mo", noticePeriod: "30 days", pto: "20 days", signingPortal: "DocuSign", employmentType: "contractor", status: "Hired" },
];

const V4_ContractFlow: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  
  const idsParam = searchParams.get("ids");
  const companyParam = searchParams.get("company");
  const phaseParam = searchParams.get("phase") as V4ContractPhase | null;

  // Phase management
  const [phase, setPhase] = useState<V4ContractPhase>(phaseParam || "contract-creation");
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);

  // Get candidates from v4 mock data based on IDs
  const selectedCandidates: Candidate[] = useMemo(() => {
    if (!idsParam) return V4_MOCK_CANDIDATES.filter(c => c.status === "Hired").slice(0, 2);
    const ids = idsParam.split(",").map((s) => s.trim());
    const list = V4_MOCK_CANDIDATES.filter((c) => ids.includes(c.id));
    return list.length > 0 ? list : V4_MOCK_CANDIDATES.filter(c => c.status === "Hired").slice(0, 2);
  }, [idsParam]);

  const currentCandidate = selectedCandidates[currentDraftIndex] ?? selectedCandidates[0];

  useEffect(() => {
    if (currentCandidate) {
      document.title = `Contract Flow – ${currentCandidate.name}`;
    } else {
      document.title = "Contract Flow";
    }
  }, [currentCandidate, phase]);

  // V4-specific: Navigate back to v4 dashboard (Tracker tab)
  const handleClose = useCallback(() => {
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4?company=${companyParam}`);
    } else {
      navigate("/flows/fronted-admin-dashboard-v4");
    }
  }, [navigate, companyParam]);

  // Phase navigation handlers
  const proceedToBundle = useCallback(() => {
    if (currentDraftIndex < selectedCandidates.length - 1) {
      setCurrentDraftIndex(prev => prev + 1);
    } else {
      setPhase("bundle-creation");
      setCurrentDraftIndex(0);
    }
  }, [currentDraftIndex, selectedCandidates.length]);

  const proceedToDrafting = useCallback(() => {
    setPhase("drafting");
    setCurrentDraftIndex(0);
  }, []);

  const proceedToReviewing = useCallback(() => {
    setPhase("reviewing");
  }, []);

  const goBackToBundleCreation = useCallback(() => {
    setPhase("bundle-creation");
  }, []);

  const goBackToDrafting = useCallback(() => {
    setPhase("drafting");
    setCurrentDraftIndex(selectedCandidates.length - 1);
  }, [selectedCandidates.length]);

  const goBackToContractCreation = useCallback(() => {
    setPhase("contract-creation");
    setCurrentDraftIndex(selectedCandidates.length - 1);
  }, [selectedCandidates.length]);

  const handleNextDraft = useCallback(() => {
    if (currentDraftIndex < selectedCandidates.length - 1) {
      setCurrentDraftIndex(prev => prev + 1);
    } else {
      proceedToReviewing();
    }
  }, [currentDraftIndex, selectedCandidates.length, proceedToReviewing]);

  const handlePreviousDraft = useCallback(() => {
    if (currentDraftIndex > 0) {
      setCurrentDraftIndex(prev => prev - 1);
    }
  }, [currentDraftIndex]);

  const handleSendForSignature = useCallback(() => {
    toastHook({ 
      title: "Contracts sent for signature", 
      description: "Candidates moved to awaiting signature column" 
    });
    
    // Navigate back to v4 tracker with status update
    if (companyParam) {
      navigate(`/flows/fronted-admin-dashboard-v4?company=${companyParam}&contractsSent=true`);
    } else {
      navigate("/flows/fronted-admin-dashboard-v4?contractsSent=true");
    }
  }, [navigate, companyParam, toastHook]);

  if (!currentCandidate && selectedCandidates.length === 0) return null;

  return (
    <RoleLensProvider initialRole="admin">
      <div className="min-h-screen flex w-full bg-background">
        <AgentLayout context="Contract Flow">
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
              <AnimatePresence mode="wait">
                {/* Phase 1: Contract Creation (per candidate) */}
                {phase === "contract-creation" && (
                  <motion.div 
                    key={`contract-creation-${currentDraftIndex}`} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    {/* Header with logo and close */}
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

                    <ContractCreationScreen
                      candidate={currentCandidate}
                      currentIndex={currentDraftIndex}
                      totalCandidates={selectedCandidates.length}
                      onPrevious={() => {
                        if (currentDraftIndex > 0) {
                          setCurrentDraftIndex((i) => i - 1);
                        }
                      }}
                      onNext={proceedToBundle}
                    />
                  </motion.div>
                )}

                {/* Phase 2: Bundle Creation (document carousel) */}
                {phase === "bundle-creation" && (
                  <motion.div 
                    key="bundle-creation" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col min-h-full"
                  >
                    <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={goBackToContractCreation}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label="Close and return to pipeline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="w-full max-w-4xl space-y-8">
                        <div className="mb-8">
                          <AgentHeader
                            title="Contract Bundle"
                            subtitle="Review the contract bundle each candidate will receive before sending for signature."
                            showPulse={true}
                            showInput={false}
                          />
                        </div>

                        {selectedCandidates.map((candidate) => (
                          <div key={candidate.id} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <span className="text-4xl">{candidate.flag}</span>
                              <div>
                                <h2 className="text-xl font-semibold text-foreground">{candidate.name}</h2>
                                <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.country}</p>
                              </div>
                            </div>
                            <DocumentBundleCarousel
                              candidate={candidate}
                              onGenerateBundle={(docs) => {}}
                              hideButton={true}
                              onClose={handleClose}
                            />
                          </div>
                        ))}

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="pt-4"
                        >
                          <Button 
                            onClick={() => {
                              toast.success("Signing packs generated for all candidates");
                              proceedToDrafting();
                            }}
                            size="lg"
                            className="w-full"
                          >
                            <FileCheck className="mr-2 h-5 w-5" />
                            Generate Signing Packs
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Phase 3: Drafting (document workspace) */}
                {phase === "drafting" && (
                  <motion.div 
                    key="drafting" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col min-h-full"
                  >
                    <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={goBackToBundleCreation}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label="Close and return to pipeline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 flex flex-col items-center p-8">
                      <div className="w-full max-w-7xl space-y-8">
                        <ContractDraftWorkspace
                          candidate={selectedCandidates[currentDraftIndex]} 
                          index={currentDraftIndex} 
                          total={selectedCandidates.length} 
                          onNext={handleNextDraft}
                          onPrevious={handlePreviousDraft}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Phase 4: Reviewing (final review before send) */}
                {phase === "reviewing" && (
                  <motion.div 
                    key="reviewing" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col min-h-screen"
                  >
                    {/* Header row with back and close buttons */}
                    <div className="max-w-7xl mx-auto w-full px-6 pt-4 pb-2 flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={goBackToDrafting}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        aria-label="Close and return to pipeline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Centered content area */}
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className={`w-full ${selectedCandidates.length === 1 ? 'max-w-lg' : 'max-w-4xl'}`}>
                        <ContractReviewBoard 
                          candidates={selectedCandidates} 
                          onStartSigning={handleSendForSignature}
                          onBack={goBackToDrafting}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AgentLayout>
      </div>
    </RoleLensProvider>
  );
};

export default V4_ContractFlow;
