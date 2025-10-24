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
    status: "trigger-onboarding" as const,
  },
  {
    id: "2",
    name: "Oskar Nielsen",
    country: "Norway",
    countryFlag: "🇳🇴",
    role: "Product Designer",
    salary: "$5,800/mo",
    status: "trigger-onboarding" as const,
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
            <Topbar 
              userName="Joe User" 
              onPeopleClick={() => setShowPeopleDrawer(true)}
            />

            {/* Dashboard Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
              {/* Main Dashboard Area - Single Column Centered */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8 space-y-8">
                  {/* Kurt Agent - Centered at Top */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <AudioWaveVisualizer isActive={false} isListening={true} />
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-bold text-foreground">Hi Joe, what would you like to know?</h1>
                      <p className="text-muted-foreground">I'm here to help you manage your workforce</p>
                    </div>
                  </motion.div>

                  {/* People Pipeline Tracking - Full Width */}
                  <div className="space-y-4">
                    <Tabs defaultValue="pipeline" className="w-full">
                      <TabsList className="grid w-64 mx-auto grid-cols-2 mb-6">
                        <TabsTrigger value="list">Metrics</TabsTrigger>
                        <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
                      </TabsList>

                      <TabsContent value="list" className="space-y-6">
                        {/* Metric Widgets Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
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
                      </TabsContent>

                      <TabsContent value="pipeline">
                        <PipelineView contractors={mockContractors} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
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
                  <TabsTrigger value="list">Metrics</TabsTrigger>
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
