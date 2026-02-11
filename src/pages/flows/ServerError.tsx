/**
 * Shared – Server Error (500)
 * 
 * Full-screen error state shown when the platform hits an unexpected 
 * server error. Reusable pattern for any page.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, HelpCircle, CheckCircle2, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import serverErrorIllustration from '@/assets/server-error-500.png';
import frontedLogo from '@/assets/fronted-logo.png';
import { Button } from '@/components/ui/button';

const MAX_RETRIES = 2;

const ServerError: React.FC = () => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const exhausted = retryCount >= MAX_RETRIES;

  const handleTryAgain = () => {
    if (exhausted || isRetrying) return;
    setIsRetrying(true);
    setTimeout(() => {
      const next = retryCount + 1;
      setRetryCount(next);
      setIsRetrying(false);
      // In production this would reload or retry the failed request
      // window.location.reload();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.04] flex flex-col relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.08] via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/[0.05] rounded-full blur-3xl pointer-events-none" />
      
      {/* Header with logo */}
      <header className="p-6 relative z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/?tab=flows")} 
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" 
            aria-label="Back to flows"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </button>
          <img 
            src={frontedLogo} 
            alt="Fronted" 
            className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/?tab=flows")}
          />
        </div>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Error Card */}
          <div className="bg-card/95 backdrop-blur-sm rounded-3xl border border-border/60 shadow-xl shadow-black/[0.04] p-8 space-y-6">
            {/* Illustration */}
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <img 
                src={serverErrorIllustration} 
                alt="Server error" 
                className="w-28 h-28 object-contain"
              />
            </motion.div>

            {/* Title */}
            <motion.h1 
              className="text-xl font-semibold text-center text-foreground leading-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Something went wrong
            </motion.h1>

            {/* Body copy */}
            <motion.p 
              className="text-sm text-muted-foreground text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              We hit an unexpected issue on our side. Please try again in a moment.
            </motion.p>

            {/* Bulleted hints */}
            <motion.div 
              className="bg-muted/40 rounded-xl p-4 space-y-2.5 border border-border/40"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              {[
                "This may be a temporary outage.",
                "The service may be updating or restarting.",
                "If it keeps happening, contact support."
              ].map((hint, index) => (
                <p key={index} className="text-xs text-muted-foreground flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                  <span>{hint}</span>
                </p>
              ))}
            </motion.div>

            {/* Actions */}
            <AnimatePresence mode="wait">
              {!exhausted ? (
                <motion.div 
                  key="retry"
                  className="space-y-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <Button 
                    onClick={handleTryAgain} 
                    className="w-full"
                    size="lg"
                    disabled={isRetrying}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying…' : `Try again${retryCount > 0 ? ` (${MAX_RETRIES - retryCount} left)` : ''}`}
                  </Button>
                  {retryCount > 0 && (
                    <p className="text-[11px] text-muted-foreground/60 text-center">
                      Attempt {retryCount} of {MAX_RETRIES} failed
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="exhausted"
                  className="bg-destructive/[0.06] border border-destructive/20 rounded-xl p-5 space-y-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span>Still not working</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground leading-relaxed">
                    We weren't able to recover automatically. Please reach out to support 
                    so we can look into this for you.
                  </p>
                  <div className="flex justify-center">
                    <a 
                      href="mailto:support@fronted.com?subject=Persistent%20server%20error%20(500)"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg hover:bg-primary/5"
                    >
                      <Mail className="w-4 h-4" />
                      Contact support
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contact section */}
            <motion.div 
              className="border-t border-border/60 pt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Need help?</span>
              </div>
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                Contact support and include what you were doing when this happened.
              </p>
              <div className="flex justify-center pt-1">
                <a 
                  href="mailto:support@fronted.com?subject=Server%20error%20(500)"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-lg hover:bg-primary/5"
                >
                  <Mail className="w-4 h-4" />
                  support@fronted.com
                </a>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p 
              className="text-[11px] text-muted-foreground/60 text-center pt-3 border-t border-border/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              We're monitoring errors and working to restore service.
            </motion.p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ServerError;
