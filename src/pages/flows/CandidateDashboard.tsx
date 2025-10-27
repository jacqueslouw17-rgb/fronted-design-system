import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, FileCheck, TrendingUp, ListChecks } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import ChecklistItemCard from "@/components/candidate/ChecklistItemCard";
import MetricTile from "@/components/candidate/MetricTile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Upload, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getChecklistForProfile, ChecklistRequirement } from "@/data/candidateChecklistData";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";
import { Input } from "@/components/ui/input";
import Topbar from "@/components/dashboard/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleLensProvider } from "@/contexts/RoleLensContext";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { AgentLayout } from "@/components/agent/AgentLayout";

const CandidateDashboard = () => {
  // Demo data - in production this would come from user session/database
  const [candidateProfile] = useState({
    name: "Maria Santos",
    country: "PH",
    type: "Contractor" as const
  });

  const [activeTab, setActiveTab] = useState("checklist");
  const [checklistData, setChecklistData] = useState<ChecklistRequirement[]>([]);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [ownChecklistOpen, setOwnChecklistOpen] = useState(false);
  
  // Own checklist items
  const [ownChecklistItems, setOwnChecklistItems] = useState([
    {
      id: "profile_photo",
      title: "Upload profile photo",
      description: "Add a photo for your Slack and company directory",
      icon: Upload,
      completed: true
    },
    {
      id: "laptop_confirm",
      title: "Confirm laptop receipt",
      description: "Let us know when your equipment arrives",
      icon: Upload,
      completed: true
    },
    {
      id: "hr_intro",
      title: "Schedule HR intro call",
      description: "Book a 30-minute onboarding call with HR",
      icon: Upload,
      completed: false
    },
    {
      id: "team_meet",
      title: "Meet your team",
      description: "Attend your first team standup",
      icon: Users,
      completed: false
    }
  ]);

  const toggleOwnChecklistItem = (id: string) => {
    setOwnChecklistItems(ownChecklistItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  useEffect(() => {
    // Load checklist data based on candidate profile
    const profile = getChecklistForProfile(candidateProfile.country, candidateProfile.type);
    if (profile) {
      setChecklistData(profile.requirements);
    }
  }, [candidateProfile]);

  // Calculate progress
  const totalItems = checklistData.length;
  const completedItems = checklistData.filter(item => item.status === 'verified').length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Check if all items are completed
  const allCompleted = totalItems > 0 && completedItems === totalItems;

  // Show confetti when all completed
  useEffect(() => {
    if (allCompleted && !showCompletionMessage) {
      setShowCompletionMessage(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [allCompleted, showCompletionMessage]);

  // Filter visible items (hide verified if all completed)
  const visibleItems = allCompleted 
    ? [] 
    : checklistData;

  return (
    <RoleLensProvider initialRole="contractor">
      <TooltipProvider>
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
          {/* Top Header */}
          <Topbar 
            userName={candidateProfile.name}
          />

          {/* Main Content Area - Full Width */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Dashboard Content */}
            <AgentLayout context="Candidate Dashboard">
              <main className="flex-1 overflow-y-auto bg-gradient-to-br from-primary/[0.02] via-background to-secondary/[0.02]">
                <div className="max-w-6xl mx-auto p-8 space-y-8">
                  {/* Agent Header */}
                  <AgentHeader
                    title={`Hi ${candidateProfile.name.split(' ')[0]}, I'm here if you need help! 👋`}
                    subtitle="Track your onboarding progress and access important information."
                    showPulse={true}
                    isActive={false}
                  />

                {/* Tabs with Toggle Switch Design */}
                <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                    <TabsTrigger value="checklist" className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Checklist
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Metrics
                    </TabsTrigger>
                  </TabsList>

                  {/* Checklist Tab */}
                  <TabsContent value="checklist" className="space-y-8">
                    {/* Setup Progress Section */}
                    {!allCompleted && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Your Setup Progress</h2>
                          <span className="text-sm font-medium">{progressPercentage}% Complete</span>
                        </div>
                        <ProgressBar currentStep={completedItems} totalSteps={totalItems} />
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {allCompleted ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="p-8 text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring" }}
                              className="inline-block mb-4"
                            >
                              <div className="p-4 rounded-full bg-green-500/20">
                                <FileCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
                              </div>
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-2">Excellent! You're fully set up.</h3>
                            <p className="text-muted-foreground">
                              You'll receive updates about pay, documents, and next steps right here.
                            </p>
                          </Card>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          {visibleItems.map((requirement, index) => (
                            <ChecklistItemCard
                              key={requirement.id}
                              requirement={requirement}
                              index={index}
                            />
                          ))}
                          
                          {/* Own Checklist Collapsible */}
                          <Collapsible
                            open={ownChecklistOpen}
                            onOpenChange={setOwnChecklistOpen}
                            className="border border-border rounded-lg overflow-hidden bg-card"
                          >
                            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-sm">Own Checklist</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {ownChecklistItems.filter(i => i.completed).length} of {ownChecklistItems.length} completed
                                  </p>
                                </div>
                              </div>
                              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${ownChecklistOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent className="border-t border-border">
                              <div className="p-4 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Complete these tasks over your first few weeks. Don't worry, you can access this checklist anytime from your dashboard.
                                </p>
                                
                                <div className="space-y-3">
                                  {ownChecklistItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <div
                                        key={item.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                      >
                                        <Checkbox
                                          id={item.id}
                                          checked={item.completed}
                                          onCheckedChange={() => toggleOwnChecklistItem(item.id)}
                                          className="mt-1"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <label
                                              htmlFor={item.id}
                                              className={`font-medium text-sm cursor-pointer ${
                                                item.completed ? "line-through text-muted-foreground" : ""
                                              }`}
                                            >
                                              {item.title}
                                            </label>
                                          </div>
                                          <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                  <p className="text-sm text-blue-600 dark:text-blue-400">
                                    💡 <strong>Kurt says:</strong> You can complete these tasks at your own pace. I'll remind you about pending items!
                                  </p>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Metrics Tab */}
                  <TabsContent value="metrics" className="space-y-6">
                    <h2 className="text-lg font-semibold">Your Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <MetricTile
                        icon={FileCheck}
                        label="Next Pay ETA"
                        value="Jan 31, 2025"
                        trend="15 days until payment"
                        status="success"
                        index={0}
                      />
                      <MetricTile
                        icon={FileCheck}
                        label="Contract Status"
                        value="Signed"
                        trend="All documents complete"
                        status="success"
                        index={1}
                      />
                      <MetricTile
                        icon={TrendingUp}
                        label="Compliance"
                        value={`${progressPercentage}%`}
                        trend={progressPercentage === 100 ? "All requirements met" : `${totalItems - completedItems} items remaining`}
                        status={progressPercentage === 100 ? 'success' : 'warning'}
                        index={2}
                      />
                      <MetricTile
                        icon={ListChecks}
                        label="Open Tasks"
                        value={`${totalItems - completedItems}`}
                        trend={totalItems - completedItems === 0 ? "Nothing to do" : "Action required"}
                        status={totalItems - completedItems === 0 ? 'success' : 'neutral'}
                        index={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                </div>
              </div>
            </main>
          </AgentLayout>
        </div>
        </div>
      </TooltipProvider>
    </RoleLensProvider>
  );
};

export default CandidateDashboard;
