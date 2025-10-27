/**
 * Intent Router - Maps user utterances to concrete UI actions
 * 
 * Supports flows F1-F5:
 * - Admin Dashboard (metrics, pipeline)
 * - Contract Flow (draft, review, send signatures)
 * - Candidate Data Collection (forms, resend)
 * - Candidate Onboarding (start, progress, steps)
 * - Candidate Checklist (tasks, certificates)
 */

export type Intent =
  | 'open_pipeline'
  | 'open_metrics'
  | 'start_onboarding_for_candidate'
  | 'open_candidate_form'
  | 'draft_contract'
  | 'review_signatures'
  | 'send_for_signature'
  | 'view_certificate'
  | 'open_checklist'
  | 'complete_checklist_task'
  | 'go_to_step'
  | 'search_people'
  | 'show_status'
  | 'help';

export interface IntentMatch {
  intent: Intent;
  confidence: number;
  entities: Record<string, string>;
}

interface IntentPattern {
  intent: Intent;
  patterns: RegExp[];
  entityExtractors?: Array<(text: string) => Record<string, string>>;
}

/**
 * Entity extractors
 */
const extractPersonName = (text: string): Record<string, string> => {
  const names = ['maria', 'oskar', 'arta', 'santos', 'nilsen', 'krasniqi'];
  const found = names.find(name => text.toLowerCase().includes(name));
  
  if (found) {
    // Map first names to full names
    const nameMap: Record<string, string> = {
      'maria': 'Maria Santos',
      'santos': 'Maria Santos',
      'oskar': 'Oskar Nilsen',
      'nilsen': 'Oskar Nilsen',
      'arta': 'Arta Krasniqi',
      'krasniqi': 'Arta Krasniqi'
    };
    return { person: nameMap[found.toLowerCase()] || found };
  }
  
  return {};
};

const extractCountry = (text: string): Record<string, string> => {
  const countries: Record<string, string> = {
    'ph': 'Philippines',
    'philippines': 'Philippines',
    'no': 'Norway',
    'norway': 'Norway',
    'xk': 'Kosovo',
    'kosovo': 'Kosovo'
  };
  
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(countries)) {
    if (lower.includes(key)) {
      return { country: value };
    }
  }
  
  return {};
};

const extractStepNumber = (text: string): Record<string, string> => {
  const match = text.match(/step\s+(\d+)|(\d+)\s*(?:st|nd|rd|th)?\s+step/i);
  if (match) {
    return { step: match[1] || match[2] };
  }
  
  // Handle next/previous
  if (/next|continue|forward/i.test(text)) {
    return { step: 'next' };
  }
  if (/back|previous|prev/i.test(text)) {
    return { step: 'previous' };
  }
  
  return {};
};

const extractTaskName = (text: string): Record<string, string> => {
  const tasks = [
    'id upload',
    'id uploaded',
    'bank details',
    'tax forms',
    'certificate',
    'compliance'
  ];
  
  const found = tasks.find(task => text.toLowerCase().includes(task));
  if (found) {
    return { task: found };
  }
  
  return {};
};

/**
 * Intent patterns with synonyms and variations
 */
const intentPatterns: IntentPattern[] = [
  // Dashboard - Pipeline
  {
    intent: 'open_pipeline',
    patterns: [
      /show\s+pipeline/i,
      /open\s+pipeline/i,
      /pipeline\s+view/i,
      /view\s+pipeline/i,
      /see\s+pipeline/i
    ]
  },
  
  // Dashboard - Metrics
  {
    intent: 'open_metrics',
    patterns: [
      /show\s+metrics/i,
      /open\s+metrics/i,
      /kpi/i,
      /dashboard/i,
      /stats/i,
      /statistics/i
    ]
  },
  
  // Contract - Draft
  {
    intent: 'draft_contract',
    patterns: [
      /draft\s+contract/i,
      /create\s+contract/i,
      /prepare\s+contract/i,
      /generate\s+contract/i,
      /start\s+contract/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Contract - Review
  {
    intent: 'review_signatures',
    patterns: [
      /review\s+signature/i,
      /check\s+signature/i,
      /signature\s+status/i,
      /who\s+signed/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Contract - Send
  {
    intent: 'send_for_signature',
    patterns: [
      /send\s+for\s+signature/i,
      /send\s+contract/i,
      /send\s+pack/i,
      /send\s+all/i,
      /send\s+document/i
    ]
  },
  
  // Candidate - Form
  {
    intent: 'open_candidate_form',
    patterns: [
      /open.*form/i,
      /resend\s+form/i,
      /candidate\s+form/i,
      /data\s+collection/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Candidate - Onboarding
  {
    intent: 'start_onboarding_for_candidate',
    patterns: [
      /start\s+onboarding/i,
      /trigger\s+onboarding/i,
      /begin\s+onboarding/i,
      /onboard/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Checklist - Open
  {
    intent: 'open_checklist',
    patterns: [
      /open\s+checklist/i,
      /show\s+checklist/i,
      /view\s+checklist/i,
      /checklist/i,
      /tasks/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Checklist - Complete Task
  {
    intent: 'complete_checklist_task',
    patterns: [
      /mark.*done/i,
      /complete.*task/i,
      /finish.*task/i,
      /check.*off/i,
      /mark.*complete/i
    ],
    entityExtractors: [extractPersonName, extractTaskName]
  },
  
  // Certificate
  {
    intent: 'view_certificate',
    patterns: [
      /show\s+certificate/i,
      /view\s+certificate/i,
      /certificate/i,
      /coc/i,
      /compliance\s+cert/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Steps/Navigation
  {
    intent: 'go_to_step',
    patterns: [
      /go\s+to\s+step/i,
      /step\s+\d+/i,
      /next\s+step/i,
      /previous\s+step/i,
      /back\s+step/i
    ],
    entityExtractors: [extractStepNumber]
  },
  
  // Search
  {
    intent: 'search_people',
    patterns: [
      /find\s+(maria|oskar|arta)/i,
      /search\s+for/i,
      /where\s+is/i,
      /locate/i
    ],
    entityExtractors: [extractPersonName]
  },
  
  // Status
  {
    intent: 'show_status',
    patterns: [
      /status/i,
      /what.*happening/i,
      /current\s+state/i,
      /where\s+are\s+we/i
    ]
  },
  
  // Help
  {
    intent: 'help',
    patterns: [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /assist/i,
      /how\s+do\s+i/i
    ]
  }
];

/**
 * Match user utterance to intent
 */
export function matchIntent(utterance: string): IntentMatch {
  const normalized = utterance.trim().toLowerCase();
  
  // Try to match patterns
  for (const pattern of intentPatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(normalized)) {
        // Extract entities
        let entities: Record<string, string> = {};
        
        if (pattern.entityExtractors) {
          for (const extractor of pattern.entityExtractors) {
            entities = { ...entities, ...extractor(normalized) };
          }
        }
        
        return {
          intent: pattern.intent,
          confidence: 0.85, // High confidence for pattern match
          entities
        };
      }
    }
  }
  
  // No match - default to help
  return {
    intent: 'help',
    confidence: 0.3,
    entities: {}
  };
}

/**
 * Get human-readable intent description
 */
export function getIntentDescription(match: IntentMatch): string {
  const descriptions: Record<Intent, string> = {
    open_pipeline: 'Opening pipeline view',
    open_metrics: 'Showing metrics dashboard',
    start_onboarding_for_candidate: 'Starting onboarding',
    open_candidate_form: 'Opening candidate form',
    draft_contract: 'Drafting contract',
    review_signatures: 'Reviewing signatures',
    send_for_signature: 'Sending for signature',
    view_certificate: 'Viewing certificate',
    open_checklist: 'Opening checklist',
    complete_checklist_task: 'Completing task',
    go_to_step: 'Navigating to step',
    search_people: 'Searching for person',
    show_status: 'Showing current status',
    help: 'Getting help'
  };
  
  let desc = descriptions[match.intent];
  
  // Add entity context
  if (match.entities.person) {
    desc += ` for ${match.entities.person}`;
  }
  if (match.entities.step) {
    desc += ` ${match.entities.step}`;
  }
  if (match.entities.task) {
    desc += `: ${match.entities.task}`;
  }
  
  return desc;
}
