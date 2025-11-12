# Flow 4 - Candidate Onboarding
## Data Structure & Modelling Documentation

---

## Overview

Flow 4 is the comprehensive candidate-facing onboarding experience that occurs after the admin has generated the contract and sent it for signature. This flow guides candidates through reviewing their personal information, confirming work setup details, and understanding their employment agreement before proceeding to signature. It serves as the final verification step before contract execution.

---

## Core Data Models

### 1. CandidateOnboardingSession
Represents a single onboarding journey for a candidate.

```typescript
interface CandidateOnboardingSession {
  id: string;                           // Unique session ID
  candidateId: string;                  // Links to candidate record
  contractBundleId: string;             // Associated contract bundle
  status: OnboardingStatus;
  
  // Access Control
  accessToken: string;                  // Secure token for session
  expiresAt: Date;                      // Session expiration
  
  // Progress Tracking
  currentStep: number;                  // Current step index (1-6)
  completedSteps: number[];             // Array of completed step numbers
  stepsData: OnboardingStepsData;       // Data collected per step
  
  // Timestamps
  startedAt?: Date;                     // When candidate first accessed
  step1CompletedAt?: Date;              // Welcome step
  step2CompletedAt?: Date;              // Personal details confirmation
  step3CompletedAt?: Date;              // Compliance & tax
  step4CompletedAt?: Date;              // Banking & payroll
  step5CompletedAt?: Date;              // Work setup
  step6CompletedAt?: Date;              // Final review
  completedAt?: Date;                   // When onboarding finished
  
  // Redirect
  redirectToDashboard: boolean;         // Whether to show dashboard after
  dashboardUrl?: string;                // Candidate dashboard URL
  
  createdAt: Date;
  updatedAt: Date;
}

type OnboardingStatus = 
  | 'not_started'                       // Session created, not accessed
  | 'in_progress'                       // Candidate is going through steps
  | 'completed'                         // All steps finished
  | 'expired'                           // Session token expired
  | 'cancelled';                        // Admin cancelled session
```

---

### 2. OnboardingStepsData
Data structure for all onboarding steps.

```typescript
interface OnboardingStepsData {
  step1: WelcomeStepData;
  step2: PersonalDetailsStepData;
  step3: ComplianceTaxStepData;
  step4: BankingPayrollStepData;
  step5: WorkSetupStepData;
  step6: FinalReviewStepData;
}

// Step 1: Welcome & Introduction
interface WelcomeStepData {
  viewed: boolean;
  viewedAt?: Date;
  videoWatched?: boolean;               // If intro video present
  acknowledgedTerms: boolean;           // Generic acknowledgment
}

// Step 2: Confirm Personal Information
interface PersonalDetailsStepData {
  // Read-only fields (auto-filled by Kurt/system)
  fullName: string;                     // From contract
  dateOfBirth: Date;                    // From form submission
  nationality: string;                  // From form submission
  residentialAddress: string;           // From form submission
  
  // Editable fields
  email: string;                        // Can be updated
  phoneNumber: string;                  // Can be updated
  
  // Helper note displayed
  kurtNote: string;                     // "Some details like name, DOB, nationality are linked to contract..."
  
  // Validation
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Timestamps
  confirmedAt?: Date;
}

// Step 3: Compliance & Tax Information
interface ComplianceTaxStepData {
  // Tax Residence (read-only)
  taxResidence: string;                 // From form submission
  
  // Tax ID Number (may be editable or collected here)
  taxIdNumber?: string;
  taxIdType?: string;                   // SSN, NIN, etc.
  
  // W-8BEN / W-9 Form (if US-related)
  taxFormRequired: boolean;
  taxFormType?: 'w8ben' | 'w9' | 'other';
  taxFormCompleted: boolean;
  taxFormUrl?: string;                  // Uploaded form URL
  
  // Compliance Acknowledgments
  complianceChecks: ComplianceCheck[];
  allChecksAcknowledged: boolean;
  
  // Timestamps
  completedAt?: Date;
}

interface ComplianceCheck {
  id: string;
  type: 'gdpr' | 'tax_declaration' | 'work_authorization' | 'confidentiality';
  title: string;
  description: string;
  required: boolean;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

// Step 4: Banking & Payroll Setup
interface BankingPayrollStepData {
  // Bank Details (pre-filled, can verify)
  bankName: string;
  accountNumber: string;                // May be masked for security
  swiftBic?: string;
  
  // Payroll Preferences
  paymentMethod: 'direct_deposit' | 'wire_transfer' | 'check';
  paymentCurrency: string;              // Preferred currency
  paymentSchedule: 'monthly' | 'biweekly' | 'weekly';
  
  // Direct Deposit Authorization
  directDepositAuthorized: boolean;
  authorizationSignedAt?: Date;
  
  // Additional Payroll Info
  emergencyAdvanceEnabled: boolean;     // Opt-in for emergency pay
  taxWithholdingElection?: number;      // Percentage
  
  // Timestamps
  completedAt?: Date;
}

// Step 5: Work Setup & Preferences
interface WorkSetupStepData {
  // Work Location
  workLocation: 'remote' | 'hybrid' | 'onsite';
  timezone: string;                     // IANA timezone
  preferredWorkingHours?: string;       // E.g., "9am-5pm EST"
  
  // Equipment & Tools
  equipmentNeeded: boolean;
  equipmentRequests?: EquipmentRequest[];
  
  // Software & Access
  softwareAccess: SoftwareAccessRequest[];
  
  // Communication Preferences
  preferredCommunication: 'email' | 'slack' | 'teams' | 'other';
  slackHandle?: string;
  teamsEmail?: string;
  
  // Availability
  startDateConfirmed: Date;
  availableForOrientation: boolean;
  
  // Timestamps
  completedAt?: Date;
}

interface EquipmentRequest {
  id: string;
  type: 'laptop' | 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'other';
  description?: string;
  approved?: boolean;
}

interface SoftwareAccessRequest {
  id: string;
  software: string;                     // E.g., "GitHub", "AWS", "Figma"
  accessLevel?: string;                 // E.g., "admin", "developer", "viewer"
  approved?: boolean;
}

// Step 6: Final Review & Confirmation
interface FinalReviewStepData {
  // Review Summary
  reviewedPersonalDetails: boolean;
  reviewedComplianceInfo: boolean;
  reviewedBankingInfo: boolean;
  reviewedWorkSetup: boolean;
  
  // Final Confirmations
  dataAccuracyConfirmed: boolean;
  readyToProceed: boolean;
  
  // Digital Signature Acknowledgment
  understandsNextSteps: boolean;        // Knows signature is next
  agreedToContract: boolean;            // Final agreement
  
  // Timestamps
  reviewedAt?: Date;
  confirmedAt?: Date;
}
```

---

### 3. CandidateProfile
Complete candidate profile built from all flows.

```typescript
interface CandidateProfile {
  id: string;
  
  // Identity (Flow 3 + Flow 4)
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  nationality: string;
  residentialAddress: string;
  
  // Employment (Flow 2 + Flow 4)
  role: string;
  employmentType: 'contractor' | 'employee';
  startDate: Date;
  salary: number;
  currency: string;
  payFrequency: string;
  
  // Compliance (Flow 3 + Flow 4)
  idType: string;
  idNumber: string;
  taxResidence: string;
  taxIdNumber?: string;
  taxIdType?: string;
  
  // Banking (Flow 3 + Flow 4)
  bankName: string;
  accountNumber: string;
  swiftBic?: string;
  paymentMethod: string;
  paymentCurrency: string;
  
  // Work Setup (Flow 4)
  workLocation: string;
  timezone: string;
  preferredWorkingHours?: string;
  preferredCommunication: string;
  
  // Status
  profileComplete: boolean;
  onboardingCompleted: boolean;
  contractSigned: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. ContractPreview
Contract details displayed during onboarding.

```typescript
interface ContractPreview {
  id: string;
  candidateId: string;
  bundleId: string;
  
  // Contract Metadata
  contractType: 'employment_agreement' | 'contractor_agreement';
  contractTitle: string;
  version: string;
  
  // Key Terms (Displayed prominently)
  keyTerms: ContractKeyTerm[];
  
  // Full Contract
  fullContractUrl: string;              // PDF download
  htmlContent: string;                  // For inline display
  
  // Documents in Bundle
  documents: ContractDocument[];
  
  // Status
  readyForSignature: boolean;
  sentForSignatureAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ContractKeyTerm {
  id: string;
  category: 'compensation' | 'duration' | 'termination' | 'confidentiality' | 'other';
  label: string;                        // E.g., "Salary"
  value: string;                        // E.g., "$85,000 USD/year"
  highlighted: boolean;                 // Show prominently
}

interface ContractDocument {
  id: string;
  title: string;
  type: string;
  required: boolean;
  url: string;                          // Download URL
  pageCount: number;
}
```

---

### 5. OnboardingNotification
Tracks notifications sent to candidates during onboarding.

```typescript
interface OnboardingNotification {
  id: string;
  sessionId: string;
  candidateEmail: string;
  type: NotificationType;
  status: NotificationStatus;
  
  // Content
  subject: string;
  body: string;
  ctaLink?: string;                     // Call-to-action link
  ctaText?: string;                     // Button text
  
  // Delivery
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  
  createdAt: Date;
}

type NotificationType = 
  | 'onboarding_invitation'             // Start onboarding
  | 'onboarding_reminder'               // Incomplete onboarding
  | 'step_incomplete_reminder'          // Specific step reminder
  | 'onboarding_completed'              // Confirmation
  | 'contract_ready_for_signature'      // Next step notification
  | 'session_expiring_soon';            // Expiration warning

type NotificationStatus = 
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'failed'
  | 'bounced';
```

---

## State Management

### Onboarding Flow State
```typescript
interface OnboardingFlowState {
  // Session
  sessionId: string;
  candidateId: string;
  status: OnboardingStatus;
  
  // Progress
  currentStep: number;                  // 1-6
  completedSteps: number[];
  canProceed: boolean;                  // Can go to next step
  
  // Data
  stepsData: OnboardingStepsData;
  contractPreview: ContractPreview;
  profile: CandidateProfile;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  
  // Actions
  goToStep: (step: number) => void;
  saveStepData: (step: number, data: any) => Promise<void>;
  completeStep: (step: number) => Promise<void>;
  finishOnboarding: () => Promise<void>;
}
```

### Step Navigation Rules
```typescript
const navigationRules = {
  step1: {
    canSkip: false,                     // Must view welcome
    nextEnabled: true,                  // Always can proceed
    prevEnabled: false,                 // First step
  },
  step2: {
    canSkip: false,
    nextEnabled: (data) => {
      // Email and phone must be valid
      return data.emailVerified && data.phoneVerified;
    },
    prevEnabled: true,
  },
  step3: {
    canSkip: false,
    nextEnabled: (data) => {
      // All required compliance checks acknowledged
      return data.allChecksAcknowledged;
    },
    prevEnabled: true,
  },
  step4: {
    canSkip: false,
    nextEnabled: (data) => {
      // Bank details confirmed, direct deposit authorized
      return data.directDepositAuthorized;
    },
    prevEnabled: true,
  },
  step5: {
    canSkip: false,
    nextEnabled: (data) => {
      // Start date confirmed, basic work setup complete
      return data.startDateConfirmed && data.workLocation;
    },
    prevEnabled: true,
  },
  step6: {
    canSkip: false,
    nextEnabled: (data) => {
      // All confirmations checked
      return (
        data.dataAccuracyConfirmed &&
        data.readyToProceed &&
        data.agreedToContract
      );
    },
    prevEnabled: true,
  },
};
```

---

## User Flow & Experience

### Phase 1: Onboarding Invitation
1. Admin generates contract in Flow 2
2. System creates `CandidateOnboardingSession`
3. Secure token generated, email sent to candidate
4. Email contains onboarding link and what to expect

### Phase 2: Step 1 - Welcome
1. Candidate clicks link, session validated
2. Welcome screen appears with:
   - Company branding
   - Candidate's name and role
   - Brief overview of onboarding steps
   - Estimated time to complete
3. Candidate clicks "Get Started"

### Phase 3: Step 2 - Personal Details
1. Pre-filled fields displayed (greyed, read-only):
   - Full Name
   - Date of Birth
   - Nationality
   - Residential Address
2. Editable fields:
   - Email Address (with validation)
   - Phone Number (with validation)
3. Blue info banner: "💡 Kurt says: Some details like name, DOB, nationality are linked to contract..."
4. Candidate confirms or updates email/phone
5. Click "Continue" → validates and saves

### Phase 4: Step 3 - Compliance & Tax
1. Tax residence displayed (read-only)
2. Tax ID collection (if applicable)
3. Compliance acknowledgments:
   - Data privacy (GDPR)
   - Tax declaration
   - Work authorization
   - Confidentiality agreement
4. Each item has checkbox and explanation
5. All required items must be checked
6. Click "Continue" → saves acknowledgments

### Phase 5: Step 4 - Banking & Payroll
1. Bank details displayed (pre-filled from Flow 3)
2. Payroll preferences:
   - Payment method selection
   - Currency preference (if multi-currency)
   - Payment schedule (if options available)
3. Direct deposit authorization checkbox
4. Optional: Tax withholding election
5. Click "Continue" → saves payroll setup

### Phase 6: Step 5 - Work Setup
1. Work location selection (remote/hybrid/onsite)
2. Timezone selection
3. Equipment needs (optional):
   - Checkbox: "I need equipment"
   - List of equipment types
4. Software access requests (optional):
   - List common tools
   - Add custom requests
5. Communication preferences:
   - Preferred channel
   - Handle/username
6. Start date confirmation
7. Click "Continue" → saves work setup

### Phase 7: Step 6 - Final Review
1. Summary of all collected data:
   - Personal details
   - Compliance acknowledgments
   - Banking setup
   - Work preferences
2. Final confirmations:
   - "I confirm all information is accurate"
   - "I'm ready to proceed to contract signature"
   - "I understand the next step is to sign my employment agreement"
3. Preview of contract key terms
4. Click "Finish & Launch" → completes onboarding

### Phase 8: Post-Onboarding
1. Onboarding marked as complete
2. Candidate redirected directly to dashboard (no intermediate screens)
3. Dashboard loads with confetti animation
4. Contract progress section shows "1/5 steps complete"
5. Candidate sees next action: "Review Contract"

---

## Validation Rules

### Step 2: Personal Details
```typescript
const step2Validation = z.object({
  email: z.string().email("Valid email required"),
  phoneNumber: z.string()
    .min(10, "Valid phone number required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format"),
});
```

### Step 3: Compliance & Tax
```typescript
const step3Validation = z.object({
  taxIdNumber: z.string().optional(),
  complianceChecks: z.array(z.object({
    acknowledged: z.boolean(),
  })).refine(
    checks => checks.every(c => c.acknowledged || !c.required),
    "All required compliance items must be acknowledged"
  ),
});
```

### Step 4: Banking & Payroll
```typescript
const step4Validation = z.object({
  paymentMethod: z.enum(['direct_deposit', 'wire_transfer', 'check']),
  paymentCurrency: z.string().min(3),
  directDepositAuthorized: z.boolean().refine(
    val => val === true,
    "Direct deposit authorization required"
  ),
});
```

### Step 5: Work Setup
```typescript
const step5Validation = z.object({
  workLocation: z.enum(['remote', 'hybrid', 'onsite']),
  timezone: z.string().min(1, "Timezone required"),
  startDateConfirmed: z.date(),
  preferredCommunication: z.enum(['email', 'slack', 'teams', 'other']),
});
```

### Step 6: Final Review
```typescript
const step6Validation = z.object({
  dataAccuracyConfirmed: z.boolean().refine(val => val === true),
  readyToProceed: z.boolean().refine(val => val === true),
  agreedToContract: z.boolean().refine(val => val === true),
});
```

---

## Integration Points

### 1. Contract Service (Flow 2 Integration)
Fetches contract details for preview.

```typescript
interface FetchContractRequest {
  candidateId: string;
  bundleId: string;
}

interface FetchContractResponse {
  contract: ContractPreview;
  readyForSignature: boolean;
}

const fetchContractForOnboarding = async (
  candidateId: string
): Promise<ContractPreview> => {
  const response = await fetch(`/api/contracts/${candidateId}/preview`);
  return response.json();
};
```

### 2. Profile Service (Updates Candidate Profile)
Saves onboarding data to candidate profile.

```typescript
const updateCandidateProfile = async (
  candidateId: string,
  updates: Partial<CandidateProfile>
): Promise<void> => {
  await fetch(`/api/candidates/${candidateId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};
```

### 3. Dashboard Redirect (Flow 5 Integration)
Redirects to candidate dashboard after completion.

```typescript
const completeOnboardingAndRedirect = async (
  sessionId: string
): Promise<void> => {
  // Mark onboarding complete
  await markOnboardingComplete(sessionId);
  
  // Redirect to dashboard with confetti
  window.location.href = '/candidate/dashboard?celebrate=true';
};
```

### 4. Signature Service (Next Step After Onboarding)
Prepares for contract signature phase.

```typescript
const prepareForSignature = async (
  candidateId: string,
  bundleId: string
): Promise<SignatureWorkflow> => {
  const response = await fetch('/api/signatures/prepare', {
    method: 'POST',
    body: JSON.stringify({ candidateId, bundleId }),
  });
  return response.json();
};
```

---

## Security & Privacy

### Access Control
- Token-based authentication (magic link)
- One session per candidate
- Tokens expire after 7 days
- Session can be revoked by admin

### Data Protection
- All data encrypted in transit (HTTPS)
- PII encrypted at rest
- Auto-save with encryption
- Audit log of all data changes

### Read-Only Fields
Fields marked as "auto-filled by Kurt" or "linked to contract":
- Cannot be edited by candidate
- Displayed with muted styling
- Clear visual indicator (grey background)
- Helper text explains why read-only

---

## Database Schema

### Tables Required
1. `candidate_onboarding_sessions` - Main session records
2. `onboarding_steps_data` - JSON storage for step data
3. `onboarding_notifications` - Email/notification tracking
4. `onboarding_audit_logs` - Activity tracking
5. `candidate_profiles` - Consolidated profile data

### Relationships
- OnboardingSession 1:1 CandidateProfile
- OnboardingSession 1:1 ContractPreview
- OnboardingSession 1:N OnboardingNotification
- OnboardingSession 1:N OnboardingAuditLog

---

## Performance Considerations

### Optimization Strategies
1. Auto-save every 30 seconds (debounced)
2. Lazy load contract preview (only when needed)
3. Progressive form rendering
4. Optimistic UI updates
5. Cache profile data with SWR
6. Background validation
7. Pre-fetch next step data

---

## Analytics & Tracking

### Key Metrics
```typescript
interface OnboardingAnalytics {
  // Completion Metrics
  invitationsSent: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  completionRate: number;
  
  // Time Metrics
  avgTimeToStart: number;               // Hours from invite to first access
  avgTimeToComplete: number;            // Minutes from start to finish
  avgTimePerStep: Record<number, number>;
  
  // Abandonment
  abandonmentRate: number;
  abandonmentByStep: Record<number, number>;
  
  // Errors
  validationErrors: Record<string, number>;
  technicalErrors: number;
}
```

---

## Future Enhancements

1. **Multi-language Support**: Translate onboarding based on location
2. **Video Tutorials**: Embed help videos per step
3. **Live Chat Support**: In-app support during onboarding
4. **Mobile Optimization**: Native mobile app experience
5. **Conditional Steps**: Dynamic step flow based on employment type
6. **Document Upload**: Allow candidates to upload certificates, IDs
7. **E-Signature Preview**: Preview signature flow before committing
8. **AI Assistant**: Kurt-powered help throughout onboarding
9. **Progress Save & Resume**: Return later functionality
10. **Accessibility Improvements**: WCAG 2.1 AA compliance

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-14  
**Flow Status**: 🔒 Locked - Production Ready
