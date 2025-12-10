/**
 * Shared – Secure Link Error (403)
 * 
 * Full-screen error state shown when a secure data collection link 
 * is invalid, expired, or cannot be accessed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, HelpCircle, CheckCircle2 } from 'lucide-react';
import secureLinkExpiredIllustration from '@/assets/secure-link-expired.png';

const SecureLinkError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.04] flex flex-col relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.08] via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/[0.05] rounded-full blur-3xl pointer-events-none" />
      
      {/* Header with logo */}
      <header className="p-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-primary-foreground font-bold text-base">F</span>
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">Fronted</span>
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
                src={secureLinkExpiredIllustration} 
                alt="Secure link expired" 
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
              This secure link can't be used anymore
            </motion.h1>

            {/* Body copy */}
            <motion.p 
              className="text-sm text-muted-foreground text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              For your security, this link is no longer active. It may have expired, 
              already been used, or been replaced by a newer link from your team.
            </motion.p>

            {/* Bulleted hints */}
            <motion.div 
              className="bg-muted/40 rounded-xl p-4 space-y-2.5 border border-border/40"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              {[
                "Your form might already be submitted.",
                "The link may have expired after a set time.",
                "You may have received a newer email with an updated link."
              ].map((hint, index) => (
                <p key={index} className="text-xs text-muted-foreground flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0 mt-0.5" />
                  <span>{hint}</span>
                </p>
              ))}
            </motion.div>

            {/* Contact section */}
            <motion.div 
              className="border-t border-border/60 pt-6 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Need a new link?</span>
              </div>
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                Contact your HR team or reply to the original email you received. 
                They can send you a fresh secure link.
              </p>
              <div className="flex justify-center pt-1">
                <a 
                  href="mailto:support@fronted.com?subject=Secure%20link%20expired"
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
              Your information is protected. Links are disabled when they're no longer safe to use.
            </motion.p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SecureLinkError;
