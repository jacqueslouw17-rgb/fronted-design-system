import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2, 
  X,
  Download,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import NavSidebar from "@/components/dashboard/NavSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { PipelineView } from "@/components/contract-flow/PipelineView";

interface Worker {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  role: string;
  status: "certified";
  avatarUrl?: string;
}

const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    role: "Software Engineer",
    status: "certified",
  },
  {
    id: "2",
    name: "Oskar Nielsen",
    country: "Norway",
    countryFlag: "🇳🇴",
    role: "Product Designer",
    status: "certified",
  },
];

// Mock contractors for pipeline view
const mockContractors = [
  {
    id: "1",
    name: "Maria Santos",
    country: "Philippines",
    countryFlag: "🇵🇭",
    role: "Software Engineer",
    salary: "$4,200/mo",
    status: "certified" as const,
  },
  {
    id: "2",
    name: "Oskar Nielsen",
    country: "Norway",
    countryFlag: "🇳🇴",
    role: "Product Designer",
    salary: "$5,800/mo",
    status: "certified" as const,
  },
  {
    id: "3",
    name: "Arta Krasniqi",
    country: "Kosovo",
    countryFlag: "🇽🇰",
    role: "Full Stack Developer",
    salary: "$3,900/mo",
    status: "certified" as const,
  },
];

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

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [showCtaBlock, setShowCtaBlock] = useState(false);
  const [showPeopleDrawer, setShowPeopleDrawer] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [isGenieOpen, setIsGenieOpen] = useState(true);
  const { isListening: sttListening, transcript, startListening, stopListening } = useSpeechToText();

  // Sync transcript with input
  useEffect(() => {
    if (transcript) {
      setPromptInput(transcript);
    }
  }, [transcript]);

  // Auto-fade in CTA block after 1s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCtaBlock(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartOnboarding = () => {
    navigate("/flows/candidate-onboarding-checklist");
  };

  const handleLater = () => {
    setShowCtaBlock(false);
  };

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
      value: mockWorkers.length.toString(),
      trend: "+100%",
      icon: Users,
    },
    {
      title: "Monthly Payroll",
      value: "Pending",
      trend: "Starts after onboarding",
      icon: DollarSign,
    },
    {
      title: "Compliance Score",
      value: "100%",
      trend: "All certified",
      icon: FileCheck,
    },
    {
      title: "Active Contracts",
      value: mockWorkers.length.toString(),
      trend: "+100%",
      icon: TrendingUp,
    },
    {
      title: "Pending Actions",
      value: "1",
      trend: "Start onboarding",
      icon: AlertCircle,
    },
    {
      title: "Avg Response Time",
      value: "N/A",
      trend: "No data yet",
      icon: Clock,
    },
  ];

  const handleAskGenie = (widgetTitle: string) => {
    setPromptInput(`Tell me more about ${widgetTitle}`);
    setIsGenieOpen(true);
  };

  const handleExport = (widgetTitle: string) => {
    console.log(`Export ${widgetTitle} data`);
  };

  const handleDetails = (widgetTitle: string) => {
    console.log(`View ${widgetTitle} details`);
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
            <Topbar userName="Joe User" />

            {/* Dashboard Content */}
            <main className="flex-1 flex overflow-hidden">
              {/* Left Panel - Dashboard Metrics */}
              <section className={`${isGenieOpen ? 'w-[60%]' : 'w-full'} flex flex-col p-8 overflow-y-auto transition-all`}>
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                      Welcome back, Joe! Here's your organization overview.
                    </p>
                  </div>

                  {/* Success Toast */}
                  <AnimatePresence>
                    {showSuccessBanner && (
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
                              onClick={() => setShowSuccessBanner(false)}
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
                          Hi Joe, what would you like to know?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          I'm here to help you manage your workforce
                        </p>
                      </div>
                    </motion.div>

                    {/* Smart CTA Block */}
                    <AnimatePresence>
                      {showCtaBlock && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          <Card className="border-primary/20 bg-card">
                            <CardContent className="p-4">
                              <p className="text-sm text-foreground mb-3">
                                Would you like me to start their onboarding checklist?
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleStartOnboarding}
                                  className="bg-gradient-primary"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Yes, Start Onboarding
                                </Button>
                                <Button variant="secondary" onClick={handleLater}>
                                  Later
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Input Area */}
                    <div className="w-full space-y-3">
                      <Input
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full"
                      />
                      <Button className="w-full bg-gradient-primary" disabled={!promptInput.trim()}>
                        Ask Genie
                      </Button>
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

        {/* People Drawer with Tabs */}
        <Drawer open={showPeopleDrawer} onOpenChange={setShowPeopleDrawer}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>People</DrawerTitle>
            </DrawerHeader>
            <div className="px-6 pb-6">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="space-y-3 mt-4">
                  {mockWorkers.map((worker) => (
                    <Card key={worker.id} className="hover:shadow-card transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={worker.avatarUrl} />
                            <AvatarFallback>
                              {worker.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{worker.name}</p>
                              <span className="text-lg">{worker.countryFlag}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{worker.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Contract
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="pipeline" className="mt-4">
                  <PipelineView contractors={mockContractors} />
                </TabsContent>
              </Tabs>
            </div>
          </DrawerContent>
        </Drawer>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default DashboardAdmin;
