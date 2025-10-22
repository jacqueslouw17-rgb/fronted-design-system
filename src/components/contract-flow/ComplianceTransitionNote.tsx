import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock } from "lucide-react";

interface ComplianceTransitionNoteProps {
  candidateName: string;
}

export const ComplianceTransitionNote: React.FC<ComplianceTransitionNoteProps> = ({
  candidateName,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/10 p-6">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="absolute -bottom-1 -right-1"
              >
                <Lock className="h-4 w-4 text-success" />
              </motion.div>
            </div>
          </motion.div>
          
          <div className="flex-1 space-y-2">
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="font-medium text-foreground"
            >
              Data Transition Complete
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              {candidateName} has transitioned from <span className="font-medium">Candidate</span> → <span className="font-medium text-success">Employee</span>.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-xs text-muted-foreground"
            >
              Personal data is now securely stored under Employee Records with restricted visibility for HR and Payroll.
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-4 h-1 bg-gradient-to-r from-primary/20 via-success/20 to-transparent rounded-full"
        />
      </div>
    </motion.div>
  );
};
