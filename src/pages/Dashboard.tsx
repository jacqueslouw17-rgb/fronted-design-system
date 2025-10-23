import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  X, 
  Mic, 
  Users, 
  DollarSign, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Download, 
  MessageSquare, 
  ExternalLink 
} from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import confetti from "canvas-confetti";
import NavSidebar from "@/components/dashboard/NavSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DashboardProps {
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    role: string;
  };
}

// Metric Widget Component with hover toolbar
const MetricWidget = ({ title, value, trend, icon: Icon, onAskGenie, onExport, onDetails }: any) => {
  const [showToolbar, setShowToolbar] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
      className="relative"
    >
      <Card className="hover:shadow-lg transition-all h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-accent' : trend.startsWith('-') ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {trend} from last month
          </p>
        </CardContent>
      </Card>

      {/* Hover Micro-Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 flex gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg z-10"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onAskGenie}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onExport}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7"
              onClick={onDetails}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Dashboard = ({ 
  userData = {
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
    country: "United States",
    role: "admin"
  }
}: DashboardProps) => {
  // Check URL params for contract completion state
  const searchParams = new URLSearchParams(window.location.search);
  const contractsCompleted = searchParams.get('contracts_completed') === 'true';
  
  const [showCompletionToast, setShowCompletionToast] = useState(contractsCompleted);
  const [isListening, setIsListening] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isGenieOpen, setIsGenieOpen] = useState(true);
  const { isListening: sttListening, transcript, startListening, stopListening } = useSpeechToText();

  // Confetti celebration on contract completion
  useEffect(() => {
    if (contractsCompleted) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [contractsCompleted]);

  // Sync transcript with input
  useEffect(() => {
    if (transcript) {
      setPromptInput(transcript);
    }
  }, [transcript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const widgets = [
    {
      title: "Total Contractors",
      value: "24",
      trend: "+12%",
      icon: Users,
    },
    {
      title: "Monthly Payroll",
      value: "$145,000",
      trend: "+8%",
      icon: DollarSign,
    },
    {
      title: "Compliance Score",
      value: "98%",
      trend: "+2%",
      icon: FileCheck,
    },
    {
      title: "Active Contracts",
      value: "18",
      trend: "+4",
      icon: TrendingUp,
    },
    {
      title: "Pending Actions",
      value: "3",
      trend: "-2",
      icon: AlertCircle,
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      trend: "-0.5h",
      icon: Clock,
    },
  ];

  const handleAskGenie = (widgetTitle: string) => {
    setPromptInput(`Tell me more about ${widgetTitle}`);
    setIsGenieOpen(true);
  };

  const handleExport = (widgetTitle: string) => {
    console.log(`Export ${widgetTitle} data`);
    // Implement export logic
  };

  const handleDetails = (widgetTitle: string) => {
    console.log(`View ${widgetTitle} details`);
    // Implement detail view logic
  };

  const handleStartOnboarding = () => {
    setShowCompletionToast(false);
    window.location.href = "/candidate-onboarding/1";
  };

  return (
    <RoleLensProvider initialRole="admin">
      <TooltipProvider>
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
          {/* Left Navigation Sidebar */}
          <NavSidebar 
            onGenieToggle={() => setIsGenieOpen(!isGenieOpen)} 
            isGenieOpen={isGenieOpen}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <Topbar userName={`${userData.firstName} ${userData.lastName}`} />

            {/* Dashboard Content */}
            <main className="flex-1 flex overflow-hidden">
              {/* Left Panel - Dashboard Metrics */}
              <section className={`${isGenieOpen ? 'w-[60%]' : 'w-full'} flex flex-col p-8 overflow-y-auto transition-all`}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {userData.firstName}! Here's your organization overview.
              </p>
            </div>

            {/* State B: Contract Completion Toast */}
            <AnimatePresence>
              {showCompletionToast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            ✨ Contracts signed. You can now start onboarding
                          </p>
                          <Button
                            onClick={handleStartOnboarding}
                            className="mt-3 bg-gradient-primary"
                            size="sm"
                          >
                            Start Onboarding Now
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowCompletionToast(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metric Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget, idx) => (
                <MetricWidget
                  key={idx}
                  {...widget}
                  onAskGenie={() => handleAskGenie(widget.title)}
                  onExport={() => handleExport(widget.title)}
                  onDetails={() => handleDetails(widget.title)}
                />
              ))}
            </div>

            {/* State A: Quick Action for empty state */}
            {widgets[0].value === "0" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">No contractors yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started by inviting your first contractor to the platform
                    </p>
                    <Button className="bg-gradient-primary">
                      Invite First Contractor
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Right Panel - Genie Assistant */}
        {isGenieOpen && (
          <aside className="w-[40%] border-l border-border bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Stunning gradient background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-[40rem] h-[30rem] rounded-full blur-[120px]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.15))' }}
            />
          </motion.div>

          {/* Genie Content */}
          <div className="relative z-10 flex flex-col items-center space-y-6 w-full max-w-lg">
            {/* Audio Wave Visualizer */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center space-y-4"
            >
              <AudioWaveVisualizer isActive={isListening} />

              {/* Greeting */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Hi {userData.firstName}, what would you like to know?
                </h2>
                <p className="text-sm text-muted-foreground">
                  I'm here to help you manage your workforce
                </p>
              </div>
            </motion.div>

            {/* Input Area */}
            <div className="w-full space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <Input
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full"
                />
                <Button className="w-full bg-gradient-primary" disabled={!promptInput.trim()}>
                  Ask Genie
                </Button>
              </motion.div>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center">Quick suggestions</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setPromptInput("Show me pending approvals")}
                >
                  Pending approvals
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setPromptInput("What's my compliance status?")}
                >
                  Compliance status
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setPromptInput("Run October payroll")}
                >
                  Run payroll
                </Badge>
              </div>
            </div>
          </div>
        </aside>
        )}
      </main>
    </div>
  </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default Dashboard;
