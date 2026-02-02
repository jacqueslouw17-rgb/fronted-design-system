import { AgentMessage, AgentAction, UIHighlight } from './CA4_AgentTypes';

interface AgentCallbacks {
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  setNavigating: (navigating: boolean, message?: string) => void;
  setHighlights: (highlights: UIHighlight[]) => void;
  setOpenWorkerId: (workerId?: string) => void;
  setDraftAdjustment: (draft?: { workerId: string; type: 'bonus' | 'overtime' | 'expenses'; amount?: number }) => void;
  executeAction: (action: AgentAction) => void;
}

// Simulated delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processAgentQuery = async (query: string, callbacks: AgentCallbacks) => {
  const lowerQuery = query.toLowerCase();

  // Demo 1: India employee tax question
  if (lowerQuery.includes('india') && (lowerQuery.includes('tax') || lowerQuery.includes('employee'))) {
    await handleIndiaTaxQuery(callbacks);
    return;
  }

  // Demo 2: UK vs India comparison
  if ((lowerQuery.includes('uk') || lowerQuery.includes('united kingdom')) && 
      lowerQuery.includes('india') && lowerQuery.includes('compar')) {
    await handleUKIndiaComparison(callbacks);
    return;
  }

  // Demo 3: Jonas bonus question
  if (lowerQuery.includes('jonas') && lowerQuery.includes('bonus')) {
    await handleJonasBonusQuery(callbacks);
    return;
  }

  // Generic fallback
  await handleGenericQuery(query, callbacks);
};

async function handleIndiaTaxQuery(callbacks: AgentCallbacks) {
  const { addMessage, setNavigating, setHighlights, setOpenWorkerId } = callbacks;

  // Step 1: Show navigation
  setNavigating(true, 'Locating India employee...');
  await delay(800);

  // Step 2: Highlight worker and navigate
  setHighlights([{ type: 'worker', id: 'sub-7', active: true }]);
  await delay(600);
  
  setNavigating(true, 'Opening Priya Sharma details...');
  await delay(500);
  setOpenWorkerId('8'); // Priya Sharma
  setNavigating(false);

  // Step 3: Add response
  await delay(300);
  addMessage({
    role: 'assistant',
    content: '',
    summary: `For Priya Sharma (India), the estimated employer tax contribution this pay period is **₹37,500** (25% of base). This includes:\n\n• **Income Tax (TDS):** ₹22,500\n• **PF Employer Contribution:** ₹12,000\n• **ESI Employer:** ₹3,000\n\nTotal employer cost is **₹187,500** including base salary of ₹150,000.`,
    context: {
      payPeriod: '15 Jan – 31 Jan 2026',
      worker: 'Priya Sharma',
      country: 'India',
      currency: 'INR',
    },
    assumptions: [
      'Estimate based on standard Indian tax slabs.',
      'Final amount depends on local compliance rules.',
    ],
    actions: [
      {
        id: 'action-1',
        label: 'View full breakdown',
        type: 'open_panel',
        payload: { workerId: '8', workerName: 'Priya Sharma' },
      },
      {
        id: 'action-2',
        label: 'Explain calculation',
        type: 'explain',
      },
    ],
  });

  // Clear highlights after a moment
  setTimeout(() => setHighlights([]), 3000);
}

async function handleUKIndiaComparison(callbacks: AgentCallbacks) {
  const { addMessage, setNavigating, setHighlights } = callbacks;

  // Step 1: Navigation
  setNavigating(true, 'Comparing UK and India employee costs...');
  await delay(1000);

  // Step 2: Highlight the Total Cost card
  setHighlights([{ type: 'card', id: 'total-cost', active: true }]);
  setNavigating(false);
  await delay(400);

  // Step 3: Add comparison response
  addMessage({
    role: 'assistant',
    content: '',
    summary: `**Average Total Cost Comparison**\n\n| Region | Base Salary | Employer Taxes | Total Cost |\n|--------|-------------|----------------|------------|\n| 🇬🇧 UK | £5,200/mo | £1,040 (20%) | **£6,240/mo** |\n| 🇮🇳 India | ₹150,000/mo | ₹37,500 (25%) | **₹187,500/mo** |\n\n**In USD terms:**\n• UK employee: ~$7,800/mo\n• India employee: ~$2,250/mo\n\nIndia employees cost approximately **71% less** in total employer cost.`,
    context: {
      payPeriod: 'January 2026',
      country: 'UK, India',
      currency: 'GBP, INR, USD',
    },
    assumptions: [
      'Using average exchange rates.',
      'Employer taxes vary by specific circumstances.',
    ],
    actions: [
      {
        id: 'action-1',
        label: 'Export comparison',
        type: 'export',
      },
      {
        id: 'action-2',
        label: 'View all workers',
        type: 'navigate',
        payload: { step: 'submissions' },
      },
    ],
  });

  setTimeout(() => setHighlights([]), 4000);
}

async function handleJonasBonusQuery(callbacks: AgentCallbacks) {
  const { addMessage, setNavigating, setHighlights, setOpenWorkerId, setDraftAdjustment } = callbacks;

  // Step 1: Navigation
  setNavigating(true, 'Finding Jonas Schmidt...');
  await delay(700);

  // Step 2: Highlight and open panel
  setHighlights([{ type: 'worker', id: 'sub-6', active: true }]);
  await delay(500);
  
  setNavigating(true, 'Opening bonus history...');
  await delay(600);
  setOpenWorkerId('7'); // Jonas Schmidt
  setNavigating(false);

  await delay(400);

  // Step 3: Add response with draft adjustment
  addMessage({
    role: 'assistant',
    content: '',
    summary: `**Jonas Schmidt** received a **€2,000 performance bonus** in December 2025 (Q4 bonus cycle).\n\n**Recommendation for this cycle:**\nBased on team performance targets and Jonas's contributions, I suggest a **€2,200 Q1 bonus** (+10% from last cycle).\n\nWould you like me to draft this adjustment?`,
    context: {
      payPeriod: '15 Jan – 31 Jan 2026',
      worker: 'Jonas Schmidt',
      country: 'Germany',
      currency: 'EUR',
    },
    assumptions: [
      'Previous bonus: December 2025 cycle.',
      'Recommendation based on standard 10% increase for consistent performers.',
    ],
    actions: [
      {
        id: 'action-1',
        label: 'Draft €2,200 bonus',
        type: 'draft_adjustment',
        payload: { 
          workerId: '7', 
          workerName: 'Jonas Schmidt',
          adjustmentType: 'bonus',
          amount: 2200,
        },
      },
      {
        id: 'action-2',
        label: 'View worker details',
        type: 'open_panel',
        payload: { workerId: '7', workerName: 'Jonas Schmidt' },
      },
    ],
  });

  setTimeout(() => setHighlights([]), 3000);
}

async function handleGenericQuery(query: string, callbacks: AgentCallbacks) {
  const { addMessage, setNavigating } = callbacks;

  setNavigating(true, 'Analyzing your question...');
  await delay(800);
  setNavigating(false);

  addMessage({
    role: 'assistant',
    content: '',
    summary: `I can help you with:\n\n• **Tax calculations** – Ask about specific employees or countries\n• **Cost comparisons** – Compare workers across regions\n• **Bonuses & adjustments** – Review history and draft new ones\n• **FX impact** – See currency effects on payroll\n\nTry asking about a specific worker or payroll topic!`,
    actions: [
      {
        id: 'action-1',
        label: 'View all submissions',
        type: 'navigate',
        payload: { step: 'submissions' },
      },
    ],
  });
}
