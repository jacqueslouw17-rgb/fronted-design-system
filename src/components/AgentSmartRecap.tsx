import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  FileText,
  Users,
  DollarSign,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
export type RecapAction = {
  id: string;
  actor: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  metadata?: {
    entity?: string;
    details?: string;
  };
};

export type NextStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  context: 'payroll' | 'contract' | 'compliance' | 'support' | 'onboarding';
  priority: 'high' | 'medium' | 'low';
};

export type RecapSession = {
  id: string;
  title: string;
  context: string;
  startTime: Date;
  endTime?: Date;
  actions: RecapAction[];
  nextSteps: NextStep[];
  summary?: string;
};

// Hook for managing recaps
export const useSmartRecap = () => {
  const [sessions, setSessions] = useState<RecapSession[]>(() => {
    const stored = localStorage.getItem('genie-recaps');
    return stored ? JSON.parse(stored) : [];
  });

  const addSession = (session: RecapSession) => {
    const updated = [session, ...sessions].slice(0, 10); // Keep last 10
    setSessions(updated);
    localStorage.setItem('genie-recaps', JSON.stringify(updated));
  };

  const updateSession = (id: string, updates: Partial<RecapSession>) => {
    const updated = sessions.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setSessions(updated);
    localStorage.setItem('genie-recaps', JSON.stringify(updated));
  };

  const clearSessions = () => {
    setSessions([]);
    localStorage.removeItem('genie-recaps');
  };

  return {
    sessions,
    addSession,
    updateSession,
    clearSessions
  };
};

// Status Badge Component
const StatusBadge: React.FC<{ status: RecapAction['status'] }> = ({ status }) => {
  const config = {
    success: { icon: CheckCircle2, variant: 'default' as const, label: 'Complete' },
    pending: { icon: Clock, variant: 'secondary' as const, label: 'Pending' },
    failed: { icon: XCircle, variant: 'destructive' as const, label: 'Failed' }
  };

  const { icon: Icon, variant, label } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Info Bubble Component
const InfoBubble: React.FC<{ content: string }> = ({ content }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs bg-popover border rounded-md shadow-lg"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Summary List Component
const SummaryList: React.FC<{ actions: RecapAction[] }> = ({ actions }) => {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-3">
          <Avatar className="h-8 w-8 border">
            {action.actor.avatar ? (
              <AvatarImage src={action.actor.avatar} alt={action.actor.name} />
            ) : null}
            <AvatarFallback className="text-xs">{action.actor.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{action.action}</p>
                {action.metadata?.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.metadata.details}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {action.actor.name} • {action.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <StatusBadge status={action.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Next Step Chip Component
const NextStepChip: React.FC<{ 
  step: NextStep; 
  onAction: (step: NextStep) => void 
}> = ({ step, onAction }) => {
  const priorityStyles = {
    high: 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10',
    medium: 'border-primary/50 bg-primary/5 hover:bg-primary/10',
    low: 'border-muted-foreground/30 bg-muted/50 hover:bg-muted'
  };

  return (
    <button
      onClick={() => onAction(step)}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        "hover:shadow-sm active:scale-95",
        priorityStyles[step.priority]
      )}
    >
      <div className="text-foreground">{step.icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{step.label}</p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
};

// Recap Card Component
export const RecapCard: React.FC<{
  session: RecapSession;
  onNextStepAction?: (step: NextStep) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ session, onNextStepAction, collapsible = true, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { toast } = useToast();

  const handleNextStepClick = (step: NextStep) => {
    toast({
      title: "Action Started",
      description: `Launching: ${step.label}`,
    });
    onNextStepAction?.(step);
  };

  const successCount = session.actions.filter(a => a.status === 'success').length;
  const pendingCount = session.actions.filter(a => a.status === 'pending').length;
  const failedCount = session.actions.filter(a => a.status === 'failed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {session.title}
                <InfoBubble content={session.context} />
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {session.startTime.toLocaleString()}
              </p>
            </div>
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {successCount > 0 && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {successCount}
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {pendingCount}
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {failedCount}
              </Badge>
            )}
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4">
                {session.summary && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {session.summary}
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-3">Actions Completed</h4>
                  <SummaryList actions={session.actions} />
                </div>

                {session.nextSteps.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Suggested Next Steps</h4>
                      <div className="space-y-2">
                        {session.nextSteps.map((step) => (
                          <NextStepChip 
                            key={step.id} 
                            step={step} 
                            onAction={handleNextStepClick}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// Recap Detail Drawer Component
export const RecapDetailDrawer: React.FC<{
  session: RecapSession;
  onNextStepAction?: (step: NextStep) => void;
}> = ({ session, onNextStepAction }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          View Full Summary
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{session.title}</SheetTitle>
          <SheetDescription>
            Session from {session.startTime.toLocaleString()}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-4">
            {session.summary && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{session.summary}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3">Timeline</h4>
              <SummaryList actions={session.actions} />
            </div>

            {session.nextSteps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">What's Next?</h4>
                <div className="space-y-2">
                  {session.nextSteps.map((step) => (
                    <NextStepChip 
                      key={step.id} 
                      step={step} 
                      onAction={onNextStepAction || (() => {})}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// Main Smart Recap Container
export const SmartRecap: React.FC<{
  sessions: RecapSession[];
  onNextStepAction?: (step: NextStep) => void;
  maxDisplay?: number;
}> = ({ sessions, onNextStepAction, maxDisplay = 3 }) => {
  const displaySessions = sessions.slice(0, maxDisplay);

  if (displaySessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground text-center">
            No recap sessions yet.<br />
            Complete a flow to see your first recap.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displaySessions.map((session) => (
        <RecapCard 
          key={session.id} 
          session={session}
          onNextStepAction={onNextStepAction}
        />
      ))}
      {sessions.length > maxDisplay && (
        <p className="text-xs text-muted-foreground text-center">
          +{sessions.length - maxDisplay} more sessions
        </p>
      )}
    </div>
  );
};

export default SmartRecap;
