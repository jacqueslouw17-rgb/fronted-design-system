/**
 * Shared – Secure Link Error (403)
 * 
 * Full-screen error state shown when a secure data collection link 
 * is invalid, expired, or cannot be accessed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldX, Mail, HelpCircle } from 'lucide-react';

const SecureLinkError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-accent/[0.06] flex flex-col">
      {/* Header with logo */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-foreground">Fronted</span>
        </div>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Error Card */}
          <div className="bg-card rounded-2xl border border-border shadow-lg p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <ShieldX className="w-8 h-8 text-destructive" />
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-center text-foreground">
              This secure link can't be used anymore
            </h1>

            {/* Body copy */}
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              For your security, this link is no longer active. It may have expired, 
              already been used, or been replaced by a newer link from your team.
            </p>

            {/* Bulleted hints */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">•</span>
                Your form might already be submitted.
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">•</span>
                The link may have expired after a set time.
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground/60 mt-0.5">•</span>
                You may have received a newer email with an updated link.
              </p>
            </div>

            {/* Contact section (instead of button) */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                <span>Need a new link?</span>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Contact your HR team or reply to the original email you received. 
                They can send you a fresh secure link.
              </p>
              <div className="flex justify-center">
                <a 
                  href="mailto:support@fronted.com?subject=Secure%20link%20expired"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@fronted.com
                </a>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[11px] text-muted-foreground/70 text-center pt-2 border-t border-border/50">
              Your information is protected. Links are disabled when they're no longer safe to use.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SecureLinkError;
