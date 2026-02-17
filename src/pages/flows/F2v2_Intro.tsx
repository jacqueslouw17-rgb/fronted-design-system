/**
 * Flow 2 v2 - Intro Step (F2v2_ namespaced)
 * 
 * Entry point for the candidate data collection v2 flow.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Shield, FileText, Wallet, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Topbar from '@/components/dashboard/Topbar';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { F2v2_Stepper, F2v2_STEPS } from '@/components/flows/candidate-data-v2/F2v2_Stepper';
import { useF2v2_FormStore, F2v2_Analytics } from '@/stores/F2v2_FormStore';

const F2v2_Intro: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentStep, setCoreData } = useF2v2_FormStore();

  useEffect(() => {
    setCurrentStep(0);
    F2v2_Analytics.track('entered_intro_step');
    
    // Pre-fill mock data (simulating ATS data)
    setCoreData({
      fullName: 'Sofia Rodriguez',
      email: 'sofia.rodriguez@email.com',
      role: 'Marketing Manager',
    });
  }, [setCurrentStep, setCoreData]);

  const handleGetStarted = () => {
    navigate('/candidate-data-collection-v2/core');
  };

  return (
    <RoleLensProvider initialRole="admin">
      <div className="flex flex-col h-screen bg-background">
        <Topbar
          userName="Candidate"
          profileSettingsUrl="/admin/profile-settings"
          dashboardUrl="/"
        />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06]">
          <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-16 sm:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stepper */}
              <F2v2_Stepper currentStep={0} steps={F2v2_STEPS} />

              {/* Header with v2 staging tag */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Welcome to Your Onboarding</h1>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Version: v2 (staging)
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Let's collect the information needed to set up your employment.
                </p>
              </div>

              {/* Kurt Message Block */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Kurt is here to help</p>
                    <p className="text-sm text-muted-foreground">
                      I'll guide you through each step. Your information is secure and GDPR compliant.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* What we'll collect */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-lg font-semibold">What we'll collect</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Personal Information</p>
                      <p className="text-sm text-muted-foreground">Your identity, contact details, and tax residence</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Payroll Configuration</p>
                      <p className="text-sm text-muted-foreground">How you'll be compensated (bank details come later)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Review & Submit</p>
                      <p className="text-sm text-muted-foreground">Confirm everything looks correct before submission</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR Compliant • Data encrypted in transit and at rest</span>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button onClick={handleGetStarted} size="lg" className="px-8">
                  Get Started
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default F2v2_Intro;
