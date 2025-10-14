import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  SmartRecap, 
  RecapCard, 
  RecapDetailDrawer,
  useSmartRecap,
  type RecapSession,
  type NextStep 
} from '@/components/GenieSmartRecap';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Users, 
  DollarSign,
  Shield,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const GenieSmartRecapPattern = () => {
  const { sessions, addSession, clearSessions } = useSmartRecap();
  const { toast } = useToast();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Sample data generators
  const generateOnboardingRecap = (): RecapSession => ({
    id: `recap-${Date.now()}`,
    title: 'Onboarding Session',
    context: 'Contractor onboarding for PH team',
    startTime: new Date(Date.now() - 1800000), // 30 mins ago
    endTime: new Date(),
    summary: 'Successfully onboarded 3 new contractors with all required documentation and policy assignments completed.',
    actions: [
      {
        id: '1',
        actor: { name: 'Ioana', initials: 'IO', avatar: undefined },
        action: 'Started onboarding session',
        timestamp: new Date(Date.now() - 1800000),
        status: 'success'
      },
      {
        id: '2',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Generated contracts for Alex Chen',
        timestamp: new Date(Date.now() - 1500000),
        status: 'success',
        metadata: { entity: 'Alex Chen', details: 'Contract type: Full-time Philippines' }
      },
      {
        id: '3',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Generated contracts for Mina Santos',
        timestamp: new Date(Date.now() - 1200000),
        status: 'success',
        metadata: { entity: 'Mina Santos', details: 'Contract type: Part-time Philippines' }
      },
      {
        id: '4',
        actor: { name: 'Ioana', initials: 'IO', avatar: undefined },
        action: 'Approved all contractor policies',
        timestamp: new Date(Date.now() - 900000),
        status: 'success'
      },
      {
        id: '5',
        actor: { name: 'System', initials: 'SYS', avatar: undefined },
        action: 'Sent welcome emails to contractors',
        timestamp: new Date(Date.now() - 600000),
        status: 'success'
      }
    ],
    nextSteps: [
      {
        id: 'ns1',
        label: 'Invite Next Batch',
        description: 'Onboard 5 more contractors',
        icon: <Users className="h-4 w-4" />,
        context: 'onboarding',
        priority: 'high'
      },
      {
        id: 'ns2',
        label: 'Set Team Policies',
        description: 'Configure PH team settings',
        icon: <Shield className="h-4 w-4" />,
        context: 'compliance',
        priority: 'medium'
      },
      {
        id: 'ns3',
        label: 'Review Documents',
        description: 'Check uploaded IDs and tax forms',
        icon: <FileText className="h-4 w-4" />,
        context: 'compliance',
        priority: 'low'
      }
    ]
  });

  const generatePayrollRecap = (): RecapSession => ({
    id: `recap-${Date.now()}`,
    title: 'Payroll Processing',
    context: 'September 2025 - Philippines Team',
    startTime: new Date(Date.now() - 3600000), // 1 hour ago
    endTime: new Date(),
    summary: 'Payroll for 24 contractors processed successfully. Total: ₱1,248,500 with FX rate locked at ₱58.23/USD.',
    actions: [
      {
        id: '1',
        actor: { name: 'Howard', initials: 'HW', avatar: undefined },
        action: 'Initiated payroll run for September',
        timestamp: new Date(Date.now() - 3600000),
        status: 'success'
      },
      {
        id: '2',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Calculated total payouts',
        timestamp: new Date(Date.now() - 3300000),
        status: 'success',
        metadata: { details: '24 contractors • ₱1,248,500 total' }
      },
      {
        id: '3',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'FX rate locked',
        timestamp: new Date(Date.now() - 3000000),
        status: 'success',
        metadata: { details: 'Rate: ₱58.23/USD (valid 15 min)' }
      },
      {
        id: '4',
        actor: { name: 'Ioana', initials: 'IO', avatar: undefined },
        action: 'Approved payroll batch',
        timestamp: new Date(Date.now() - 2400000),
        status: 'success'
      },
      {
        id: '5',
        actor: { name: 'System', initials: 'SYS', avatar: undefined },
        action: 'Payment sent via Wise',
        timestamp: new Date(Date.now() - 1800000),
        status: 'success'
      },
      {
        id: '6',
        actor: { name: 'System', initials: 'SYS', avatar: undefined },
        action: 'Payslips generated and distributed',
        timestamp: new Date(Date.now() - 600000),
        status: 'success'
      }
    ],
    nextSteps: [
      {
        id: 'ns1',
        label: 'Review FX Breakdown',
        description: 'View detailed exchange rate analysis',
        icon: <DollarSign className="h-4 w-4" />,
        context: 'payroll',
        priority: 'medium'
      },
      {
        id: 'ns2',
        label: 'Generate October Payroll',
        description: "Start next month's payroll cycle",
        icon: <RefreshCw className="h-4 w-4" />,
        context: 'payroll',
        priority: 'high'
      },
      {
        id: 'ns3',
        label: 'Export Audit Report',
        description: 'Download payroll records for finance',
        icon: <FileText className="h-4 w-4" />,
        context: 'payroll',
        priority: 'low'
      }
    ]
  });

  const generateContractRecap = (): RecapSession => ({
    id: `recap-${Date.now()}`,
    title: 'Contract Management',
    context: 'Multiple contractor contracts',
    startTime: new Date(Date.now() - 2700000), // 45 mins ago
    endTime: new Date(),
    summary: '2 contracts signed successfully, 1 pending CFO approval.',
    actions: [
      {
        id: '1',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Generated contract for Alex Chen',
        timestamp: new Date(Date.now() - 2700000),
        status: 'success'
      },
      {
        id: '2',
        actor: { name: 'Alex Chen', initials: 'AC', avatar: undefined },
        action: 'Contract signed via DocuSign',
        timestamp: new Date(Date.now() - 2100000),
        status: 'success',
        metadata: { details: 'E-signature received' }
      },
      {
        id: '3',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Generated contract for Maria Lopez',
        timestamp: new Date(Date.now() - 1800000),
        status: 'success'
      },
      {
        id: '4',
        actor: { name: 'Maria Lopez', initials: 'ML', avatar: undefined },
        action: 'Contract signed via DocuSign',
        timestamp: new Date(Date.now() - 1200000),
        status: 'success'
      },
      {
        id: '5',
        actor: { name: 'Genie AI', initials: 'GA', avatar: undefined },
        action: 'Sent contract to CFO for approval',
        timestamp: new Date(Date.now() - 900000),
        status: 'pending',
        metadata: { entity: 'Senior Developer Role', details: "Awaiting Ioana's signature" }
      }
    ],
    nextSteps: [
      {
        id: 'ns1',
        label: 'Notify CFO',
        description: 'Send reminder for pending contract',
        icon: <Users className="h-4 w-4" />,
        context: 'contract',
        priority: 'high'
      },
      {
        id: 'ns2',
        label: 'Upload Contract Addendum',
        description: 'Add supplementary terms document',
        icon: <FileText className="h-4 w-4" />,
        context: 'contract',
        priority: 'medium'
      }
    ]
  });

  const handleGenerateRecap = (type: 'onboarding' | 'payroll' | 'contract') => {
    let recap: RecapSession;
    
    switch (type) {
      case 'onboarding':
        recap = generateOnboardingRecap();
        break;
      case 'payroll':
        recap = generatePayrollRecap();
        break;
      case 'contract':
        recap = generateContractRecap();
        break;
    }

    setActiveDemo(type);
    addSession(recap);

    toast({
      title: "Recap Generated",
      description: `${recap.title} recap has been created.`,
    });
  };

  const handleNextStepAction = (step: NextStep) => {
    toast({
      title: "Action Triggered",
      description: `Starting: ${step.label}`,
      duration: 3000,
    });
  };

  const handleClearRecaps = () => {
    clearSessions();
    setActiveDemo(null);
    toast({
      title: "Recaps Cleared",
      description: "All recap sessions have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Genie Smart Recap</h1>
              <p className="text-muted-foreground">Pattern 28 — Session summaries with contextual next steps</p>
            </div>
          </div>

        {/* Description Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Purpose
            </CardTitle>
            <CardDescription>
              Provides concise, contextual recaps at natural stopping points with auto-generated next-step suggestions.
              Reinforces understanding, reduces uncertainty, and maintains task continuity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Key Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Automatic recap generation on flow completion, context switch, or timeout</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Action timeline with actor attribution and status tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Contextual next-step suggestions based on completed actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Multi-user collaboration tracking (who did what)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Integration with Timeline (P25) and Memory Thread (P23)</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Pattern References</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">P23 - Context Memory</Badge>
                <Badge variant="outline">P25 - Timeline</Badge>
                <Badge variant="outline">P26 - Smart Progress</Badge>
                <Badge variant="outline">P27 - Context Pivot</Badge>
                <Badge variant="outline">P16 - Notifications</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Controls */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Live Demo Controls</CardTitle>
            <CardDescription>
              Generate sample recap sessions to see how Genie summarizes actions and suggests next steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => handleGenerateRecap('onboarding')}
                variant={activeDemo === 'onboarding' ? 'default' : 'outline'}
                className="h-auto py-4 flex-col gap-2"
              >
                <Users className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Onboarding Session</div>
                <div className="text-xs opacity-80">3 contractors onboarded</div>
              </div>
              </Button>

              <Button
                onClick={() => handleGenerateRecap('payroll')}
                variant={activeDemo === 'payroll' ? 'default' : 'outline'}
                className="h-auto py-4 flex-col gap-2"
              >
                <DollarSign className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">Payroll Processing</div>
                  <div className="text-xs opacity-80">September 2025 complete</div>
                </div>
              </Button>

              <Button
                onClick={() => handleGenerateRecap('contract')}
                variant={activeDemo === 'contract' ? 'default' : 'outline'}
                className="h-auto py-4 flex-col gap-2"
              >
                <FileText className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">Contract Management</div>
                  <div className="text-xs opacity-80">2 signed, 1 pending</div>
                </div>
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClearRecaps}
                variant="outline"
                size="sm"
                disabled={sessions.length === 0}
              >
                Clear All Recaps
              </Button>
              <div className="flex-1" />
              <Badge variant="secondary">
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} stored
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recap Display */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Active Recaps</CardTitle>
            <CardDescription>
              Smart summaries of completed workflows with suggested actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SmartRecap 
              sessions={sessions}
              onNextStepAction={handleNextStepAction}
              maxDisplay={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Use Cases Across Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">F1 - Onboarding</h4>
                  <p className="text-sm text-muted-foreground">
                    &quot;You onboarded 3 contractors: Alex, Mina, Theo&quot; → Next: Invite next batch / Set policies
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">F2 - Contract Drafting</h4>
                  <p className="text-sm text-muted-foreground">
                    &quot;2 contracts signed, 1 pending approval&quot; → Next: Notify CFO / Upload addendum
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">F3 - Payroll Prep</h4>
                  <p className="text-sm text-muted-foreground">
                    &quot;September payroll sent successfully&quot; → Next: Review FX rates / View audit log
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">F6 - Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    &quot;All documents verified. Compliance checklist complete&quot; → Next: Generate certificate
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Notes */}
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
              <span>RecapCard collapses/expands within Genie chat panel</span>
            </p>
            <p className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Automatic triggers on flow completion, context switch, or session timeout</span>
            </p>
            <p className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
              <span>NextStepChip re-triggers Genie intents via message templates</span>
            </p>
            <p className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Recaps persist in localStorage and integrate with Timeline (P25)</span>
            </p>
            <p className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Framer Motion animations for smooth reveal and collapse transitions</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieSmartRecapPattern;
