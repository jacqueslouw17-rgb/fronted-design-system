import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeft, Mic, Users, Lock, Shield, CheckCircle2, X } from "lucide-react";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [showCtaBlock, setShowCtaBlock] = useState(false);
  const [showPeopleDrawer, setShowPeopleDrawer] = useState(false);
  const [showIdleChip, setShowIdleChip] = useState(false);
  const [promptInput, setPromptInput] = useState("");

  // Auto-fade in CTA block after 1s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCtaBlock(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-idle chip after 3 seconds of no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIdleChip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartOnboarding = () => {
    navigate("/flows/candidate-onboarding-checklist");
  };

  const handleLater = () => {
    setShowCtaBlock(false);
  };

  const handleIdleYes = () => {
    setShowIdleChip(false);
    navigate("/flows/candidate-onboarding-checklist");
  };

  const handleIdleLater = () => {
    setShowIdleChip(false);
  };

  return (
    <main className="flex h-screen bg-background text-foreground relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => navigate('/flows')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Agent Panel - 60% width */}
      <section className="w-[60%] flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
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
            className="absolute w-[60rem] h-[40rem] rounded-full blur-[120px]"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.15))' }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-6 w-full max-w-2xl">
          {/* Audio Wave Visualizer */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center space-y-4"
          >
            <AudioWaveVisualizer isActive={isListening} />

            {/* Hero Section */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Hi Joe, what would you like to do next?
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Genie will guide you based on completed contract steps.
              </p>
            </div>
          </motion.div>

          {/* Success Banner */}
          <AnimatePresence>
            {showSuccessBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <Card className="border-accent/20 bg-accent/5">
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          ✨ Contracts complete. All signatures received.
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          You can now start onboarding.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 -mt-1"
                      onClick={() => setShowSuccessBanner(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

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

          {/* Voice Input Control */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 w-full"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setIsListening(!isListening)}
                className={
                  isListening
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-gradient-to-r from-primary to-secondary"
                }
              >
                <Mic className={`h-5 w-5 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
                <span>{isListening ? "Stop" : "Speak"}</span>
              </Button>
            </motion.div>
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Or type your question here..."
              className="flex-1"
            />
          </motion.div>
        </div>
      </section>

      {/* Right Panel - Dashboard Cards - 40% width */}
      <aside className="w-[40%] border-l border-border bg-card flex flex-col h-screen overflow-y-auto">
        <div className="px-6 py-8 space-y-4">
          <h2 className="text-2xl font-semibold">Dashboard</h2>

          {/* Card 1: People */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => setShowPeopleDrawer(true)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">People</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockWorkers.length} Certified Workers</div>
                <Button variant="outline" className="mt-3 w-full">
                  View People
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Payroll (Locked) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="opacity-60 cursor-not-allowed relative group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Payroll</CardTitle>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Unlocks after onboarding is started
                </div>
                <Button variant="outline" className="mt-3 w-full" disabled>
                  View Payroll
                </Button>
              </CardContent>
              {/* Hover Tooltip */}
              <div className="absolute inset-0 bg-card/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-sm text-center px-4">
                  Start onboarding to enable payroll
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Card 3: Compliance (Locked) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="opacity-60 cursor-not-allowed relative group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Compliance</CardTitle>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Unlocks after onboarding is started
                </div>
                <Button variant="outline" className="mt-3 w-full" disabled>
                  View Compliance
                </Button>
              </CardContent>
              {/* Hover Tooltip */}
              <div className="absolute inset-0 bg-card/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-sm text-center px-4">
                  Start onboarding to enable compliance
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </aside>

      {/* People List Drawer */}
      <Drawer open={showPeopleDrawer} onOpenChange={setShowPeopleDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Certified Workers</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 space-y-3">
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
          </div>
        </DrawerContent>
      </Drawer>

      {/* Auto-Idle Chip */}
      <AnimatePresence>
        {showIdleChip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <Card className="border-primary/20 bg-card shadow-overlay">
              <CardContent className="p-4 flex items-center gap-3">
                <p className="text-sm">
                  Shall I prepare onboarding for Maria & Oskar now?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleIdleYes}>
                    Yes
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleIdleLater}>
                    Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default DashboardAdmin;
