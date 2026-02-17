/**
 * Flow 2 v2 - Success Step (F2v2_ namespaced)
 * 
 * Confirmation screen after successful submission.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Topbar from '@/components/dashboard/Topbar';
import { RoleLensProvider } from '@/contexts/RoleLensContext';
import { F2v2_Stepper, F2v2_STEPS } from '@/components/flows/candidate-data-v2/F2v2_Stepper';
import { useF2v2_FormStore, F2v2_Analytics } from '@/stores/F2v2_FormStore';

const F2v2_Success: React.FC = () => {
  const navigate = useNavigate();
  const { core, setCurrentStep, reset } = useF2v2_FormStore();

  useEffect(() => {
    setCurrentStep(4);
    F2v2_Analytics.track('viewed_success_step');
  }, [setCurrentStep]);

  const handleBackToFlows = () => {
    // Reset form for next use
    reset();
    navigate('/');
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
              <F2v2_Stepper currentStep={4} steps={F2v2_STEPS} />

              {/* Success Icon */}
              <div className="flex justify-center pt-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <CheckCircle className="h-10 w-10 text-primary" />
                </motion.div>
              </div>

              {/* Header with v2 staging tag */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">Submission Complete!</h1>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                    Version: v2 (staging)
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Thank you, {core.fullName || 'Candidate'}. Your information has been submitted successfully.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h3 className="font-semibold text-lg">What happens next?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Confirmation Email</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive an email confirmation at {core.email || 'your email address'} shortly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Review Process</p>
                      <p className="text-sm text-muted-foreground">
                        Our team will review your submission within 1-2 business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Onboarding Phase 2</p>
                      <p className="text-sm text-muted-foreground">
                        Once approved, you'll be invited to complete your bank details and final onboarding steps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Console log notice (staging only) */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-600">
                  <strong>Staging Notice:</strong> The submission payload has been logged to the browser console. 
                  In production, this would be sent to the backend API.
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button onClick={handleBackToFlows} size="lg" className="px-8">
                  Back to Flows
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </RoleLensProvider>
  );
};

export default F2v2_Success;
