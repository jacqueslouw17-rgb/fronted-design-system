# Flow 3 - Candidate Data Collection
## Data Structure & Modelling Documentation

---

## Overview

Flow 3 is the candidate-facing form experience where contractors and employees submit required personal, compliance, banking, and emergency contact information after accepting an offer. This flow bridges the gap between ATS-provided data and complete contract-ready records, ensuring all necessary information is collected before contract generation.

---

## Core Data Models

### 1. CandidateFormSubmission
Represents a single form submission from a candidate.

```typescript
interface CandidateFormSubmission {
  id: string;                           // Unique submission ID
  candidateId: string;                  // Links to candidate record
  formToken: string;                    // Secure token for form access
  status: FormStatus;
  
  // Pre-filled from ATS (Read-only)
  atsData: ATSPrefilledData;
  
  // Candidate-filled Data
  candidateData: CandidateFilledData;
  
  // Metadata
  sentAt: Date;                         // When form link was sent
  openedAt?: Date;                      // When candidate first opened form
  startedAt?: Date;                     // When candidate started filling
  submittedAt?: Date;                   // When form was submitted
  expiresAt: Date;                      // Form expiration (typically 7 days)
  
  // Tracking
  attemptCount: number;                 // Number of save/submit attempts
  lastSavedAt?: Date;                   // Auto-save timestamp
  ipAddress?: string;                   // Submission IP
  userAgent?: string;                   // Browser info
  
  createdAt: Date;
  updatedAt: Date;
}

type FormStatus = 
  | 'pending'                           // Form sent, not yet opened
  | 'in_progress'                       // Candidate is filling form
  | 'submitted'                         // Successfully submitted
  | 'expired'                           // Token expired
  | 'revoked';                          // Admin cancelled form
```

---

### 2. ATSPrefilledData
Data provided by ATS integration that is read-only for candidates.

```typescript
interface ATSPrefilledData {
  // Identity (Read-only, greyed out)
  fullName: string;                     // Legal full name
  email: string;                        // Primary email
  
  // Employment Details (Read-only, greyed out)
  role: string;                         // Job title
  salary: number;                       // Compensation amount
  currency: string;                     // USD, EUR, GBP, etc.
  employmentType: 'contractor' | 'employee';
  startDate?: string;                   // ISO date string (can be null)
  
  // System Fields
  payFrequency: 'monthly';              // Always monthly (disabled field)
  location?: string;                    // General location from ATS
  
  // Metadata
  atsSource: string;                    // ATS system name
  atsRecordId: string;                  // External reference ID
  syncedAt: Date;                       // When data was synced
}
```

---

### 3. CandidateFilledData
Information candidates must provide to complete their profile.

```typescript
interface CandidateFilledData {
  // Identity & Compliance (Required)
  idType: IDType;                       // Government ID type
  idNumber: string;                     // ID document number
  taxResidence: string;                 // Country of tax residence
  city: string;                         // City of residence
  nationality: string;                  // Country of citizenship
  address: string;                      // Full residential address (multiline)
  dateOfBirth: Date;                    // DOB for compliance
  
  // Banking Information (Required)
  bankName: string;                     // Financial institution name
  accountNumber: string;                // Account number or IBAN
  swiftBic?: string;                    // SWIFT/BIC code (optional)
  
  // Emergency Contact (Optional)
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Consent & Acknowledgment
  dataPrivacyConsent: boolean;          // GDPR/privacy policy consent
  termsAccepted: boolean;               // Terms of service
  accuracyConfirmed: boolean;           // Confirms data accuracy
  consentTimestamp: Date;               // When consent was given
}

type IDType = 
  | 'passport'
  | 'national_id'
  | 'drivers_license'
  | 'residence_permit'
  | 'other';
```

---

### 4. FormValidation
Real-time validation rules and error tracking.

```typescript
interface FormValidation {
  submissionId: string;
  validationResults: ValidationResult[];
  isValid: boolean;
  lastValidatedAt: Date;
}

interface ValidationResult {
  field: string;
  rule: string;
  passed: boolean;
  errorMessage?: string;
  validatedAt: Date;
}

// Validation Rules
const validationRules = {
  // Identity
  idType: z.enum(['passport', 'national_id', 'drivers_license', 'residence_permit', 'other']),
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  
  // Location & Compliance
  taxResidence: z.string().min(2, "Tax residence country required"),
  city: z.string().min(2, "City is required"),
  nationality: z.string().min(2, "Nationality is required"),
  address: z.string().min(10, "Complete residential address required"),
  dateOfBirth: z.date()
    .max(new Date(), "Date cannot be in the future")
    .refine(date => {
      const age = calculateAge(date);
      return age >= 18;
    }, "Must be at least 18 years old"),
  
  // Banking
  bankName: z.string().min(2, "Bank name required"),
  accountNumber: z.string().min(4, "Valid account number required"),
  swiftBic: z.string().optional(),
  
  // Emergency Contact (all optional)
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  
  // Consent
  dataPrivacyConsent: z.boolean().refine(val => val === true, "Must accept privacy policy"),
  termsAccepted: z.boolean().refine(val => val === true, "Must accept terms"),
  accuracyConfirmed: z.boolean().refine(val => val === true, "Must confirm data accuracy"),
};
```

---

### 5. FormAccessToken
Secure token for candidate form access.

```typescript
interface FormAccessToken {
  id: string;
  submissionId: string;
  candidateId: string;
  token: string;                        // Secure random token (UUID)
  expiresAt: Date;                      // 7 days from creation
  usedAt?: Date;                        // When form was first accessed
  revokedAt?: Date;                     // If admin cancels
  revokedBy?: string;                   // Admin user ID
  
  // Security
  maxAttempts: number;                  // Rate limiting (default: 10)
  attemptCount: number;                 // Failed access attempts
  lastAttemptAt?: Date;
  ipWhitelist?: string[];               // Optional IP restrictions
  
  createdAt: Date;
}
```

---

### 6. FormNotification
Tracks all communications sent to candidates about the form.

```typescript
interface FormNotification {
  id: string;
  submissionId: string;
  candidateEmail: string;
  type: NotificationType;
  status: NotificationStatus;
  
  // Content
  subject: string;
  body: string;                         // Email HTML content
  formLink: string;                     // Unique form URL
  
  // Delivery Tracking
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;                      // Email opened timestamp
  clickedAt?: Date;                     // Form link clicked
  
  // Retry Logic
  retryCount: number;
  lastRetryAt?: Date;
  failureReason?: string;
  
  createdAt: Date;
}

type NotificationType = 
  | 'initial_invite'                    // First form invitation
  | 'reminder'                          // Follow-up reminder
  | 'final_reminder'                    // Last reminder before expiry
  | 'expiration_notice'                 // Form has expired
  | 'submission_confirmation'           // Thank you message
  | 'resend';                           // Admin manually resent

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

### Form State
```typescript
interface FormState {
  // Form Identity
  submissionId: string;
  candidateId: string;
  token: string;
  
  // Data
  atsData: ATSPrefilledData;
  formData: Partial<CandidateFilledData>;
  
  // UI State
  currentStep: number;                  // 0-based step index
  totalSteps: number;
  isSubmitting: boolean;
  isAutoSaving: boolean;
  lastAutoSave?: Date;
  
  // Validation
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  
  // Progress
  completionPercentage: number;
  fieldsCompleted: number;
  fieldsTotal: number;
}
```

### Admin View State (Read-only for Admin)
```typescript
interface AdminFormViewState {
  candidateId: string;
  
  // Pre-filled (Greyed, disabled)
  atsFields: ATSPrefilledData;
  
  // Awaiting Candidate (Greyed, disabled, placeholder text)
  candidateFields: {
    idType: null | string;
    idNumber: null | string;
    taxResidence: null | string;
    city: null | string;
    nationality: null | string;
    address: null | string;
    dateOfBirth: null | Date;
    bankName: null | string;
    accountNumber: null | string;
    swiftBic: null | string;
    emergencyContact: null | EmergencyContact;
  };
  
  // Form Status
  formStatus: FormStatus;
  sentAt?: Date;
  submittedAt?: Date;
  
  // Actions Available
  canResendForm: boolean;
  canCancelForm: boolean;
}
```

---

## User Flow & Experience

### Phase 1: Form Invitation (Admin Side)
1. Admin views candidate in "Offer Accepted" column
2. Admin opens side drawer → sees pre-filled ATS data
3. Admin clicks "Send Form" button
4. System generates secure token and form URL
5. Email sent to candidate with form link
6. Candidate card moves to "Collecting Data" column
7. Button changes to "Resend Form"

### Phase 2: Form Access (Candidate Side)
1. Candidate receives email with form link
2. Clicks link → token validated
3. If valid:
   - Form opens with pre-filled data visible (greyed)
   - Candidate sees sections they need to complete
4. If invalid/expired:
   - Error screen with contact instructions

### Phase 3: Form Completion (Candidate Side)
1. Candidate reviews pre-filled data (read-only)
2. Fills required fields:
   - Identity & Compliance section
   - Banking Information section
   - Emergency Contact section (optional)
3. Real-time validation on field blur
4. Auto-save every 30 seconds
5. Progress indicator shows completion %

### Phase 4: Form Submission (Candidate Side)
1. All required fields validated
2. Candidate checks consent boxes
3. Clicks "Submit" button
4. Loading state with validation
5. Success screen appears:
   - Full-page white background
   - Title: "Form Submitted Successfully!"
   - Subtitle: "Thanks, [First Name]! Your details have been sent to the admin for verification."
   - Confetti animation
   - Green checkmark icon
   - "Close" button
6. No auto-redirect (candidate doesn't have dashboard access yet)

### Phase 5: Post-Submission (Admin Side)
1. Admin receives notification of submission
2. Candidate card updates with completion timestamp
3. Admin can view submitted data in drawer
4. All fields now populated and visible
5. Admin reviews data before generating contract
6. Candidate moves to next pipeline stage

---

## Field Configuration

### Read-Only Fields (Pre-filled from ATS)
```typescript
const readOnlyFields = [
  'fullName',
  'email',
  'role',
  'salary',
  'currency',
  'employmentType',
  'startDate',
  'payFrequency'
];

// Visual Treatment
const readOnlyStyle = {
  background: 'muted',
  cursor: 'not-allowed',
  opacity: 0.7,
  helperText: 'Prefilled from ATS'
};
```

### Candidate-Editable Fields
```typescript
const editableFields = [
  'idType',
  'idNumber',
  'taxResidence',
  'city',
  'nationality',
  'address',
  'dateOfBirth',
  'bankName',
  'accountNumber',
  'swiftBic',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelation'
];

// Visual Treatment
const editableStyle = {
  background: 'white',
  border: 'border',
  placeholder: 'To be filled by candidate',
  helperText: 'Required' | 'Optional'
};
```

### Admin View Treatment
```typescript
// When admin views form before candidate submits
const adminViewStyle = {
  allFieldsDisabled: true,
  atsFieldsGreyed: true,
  candidateFieldsPlaceholder: 'Awaiting candidate response',
  noEditAllowed: true
};
```

---

## Validation & Error Handling

### Client-Side Validation
```typescript
const validateField = (field: string, value: any): ValidationResult => {
  const rule = validationRules[field];
  const result = rule.safeParse(value);
  
  return {
    field,
    passed: result.success,
    errorMessage: result.success ? undefined : result.error.errors[0].message,
    validatedAt: new Date()
  };
};

// Real-time validation on blur
const handleFieldBlur = (field: string, value: any) => {
  const result = validateField(field, value);
  if (!result.passed) {
    setErrors(prev => ({ ...prev, [field]: result.errorMessage }));
  } else {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }
};
```

### Server-Side Validation
```typescript
const validateSubmission = async (data: CandidateFilledData): Promise<ValidationResult[]> => {
  const results: ValidationResult[] = [];
  
  // Required field checks
  for (const [field, rule] of Object.entries(validationRules)) {
    const result = validateField(field, data[field]);
    results.push(result);
  }
  
  // Cross-field validation
  if (data.swiftBic && !isValidSwift(data.swiftBic)) {
    results.push({
      field: 'swiftBic',
      passed: false,
      errorMessage: 'Invalid SWIFT/BIC format',
      validatedAt: new Date()
    });
  }
  
  // Country-specific rules
  const countryRules = await getCountryComplianceRules(data.taxResidence);
  for (const rule of countryRules) {
    const isCompliant = await validateComplianceRule(rule, data);
    if (!isCompliant) {
      results.push({
        field: 'taxResidence',
        passed: false,
        errorMessage: `${data.taxResidence} requires: ${rule.requirement}`,
        validatedAt: new Date()
      });
    }
  }
  
  return results;
};
```

### Common Error Scenarios
1. **Expired Token**: Show error page with contact admin option
2. **Invalid Token**: Show 404-style error
3. **Incomplete Data**: Highlight missing fields with red borders
4. **Network Failure**: Retry auto-save, show warning toast
5. **Duplicate Submission**: Prevent via debouncing and loading states

---

## Integration Points

### 1. ATS Webhook (Inbound)
Receives candidate data when offer is accepted.

```typescript
interface ATSWebhookPayload {
  event: 'offer_accepted';
  candidate: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    salary: number;
    currency: string;
    employment_type: 'contractor' | 'employee';
    start_date?: string;                // ISO date or null
    location?: string;
  };
  organization_id: string;
  timestamp: string;
}

// Handler creates CandidateFormSubmission record
const handleATSWebhook = async (payload: ATSWebhookPayload) => {
  const submission = await createFormSubmission({
    candidateId: payload.candidate.id,
    atsData: {
      fullName: payload.candidate.full_name,
      email: payload.candidate.email,
      role: payload.candidate.role,
      salary: payload.candidate.salary,
      currency: payload.candidate.currency,
      employmentType: payload.candidate.employment_type,
      startDate: payload.candidate.start_date,
      payFrequency: 'monthly',
      location: payload.candidate.location,
      atsSource: 'greenhouse',
      atsRecordId: payload.candidate.id,
      syncedAt: new Date()
    },
    status: 'pending'
  });
  
  return submission;
};
```

### 2. Email Service (Outbound)
Sends form invitations and notifications.

```typescript
interface FormEmailPayload {
  to: string;
  subject: string;
  templateId: string;
  variables: {
    candidateName: string;
    formLink: string;
    companyName: string;
    expirationDate: string;
    role: string;
  };
}

// Send form invitation
const sendFormInvitation = async (submission: CandidateFormSubmission) => {
  const token = await generateAccessToken(submission.id);
  const formLink = `${APP_URL}/candidate/form/${token.token}`;
  
  await emailService.send({
    to: submission.atsData.email,
    subject: 'Complete Your Onboarding Information',
    templateId: 'candidate-form-invitation',
    variables: {
      candidateName: submission.atsData.fullName.split(' ')[0],
      formLink,
      companyName: 'Acme Corp',
      expirationDate: format(token.expiresAt, 'MMMM d, yyyy'),
      role: submission.atsData.role
    }
  });
};
```

### 3. Admin Dashboard (Real-time Updates)
Updates admin view when candidate submits form.

```typescript
// WebSocket event
interface FormSubmittedEvent {
  type: 'form_submitted';
  submissionId: string;
  candidateId: string;
  submittedAt: string;
  completionPercentage: number;
}

// Admin receives real-time notification
supabase
  .channel('form-submissions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'candidate_form_submissions',
    filter: `status=eq.submitted`
  }, (payload) => {
    // Update UI, show notification
    toast.success(`${payload.new.candidate_name} completed their form!`);
    // Refresh pipeline view
    refreshPipeline();
  })
  .subscribe();
```

---

## Security & Privacy

### Data Protection
- All form data encrypted in transit (HTTPS)
- PII encrypted at rest in database
- Form tokens are cryptographically secure (UUID v4)
- Tokens expire after 7 days
- Rate limiting on form access (max 10 attempts per token)

### Access Control
- No authentication required (magic link via email)
- Token-based access only
- One-time use tokens (can be regenerated if needed)
- Admin can revoke tokens at any time
- IP logging for audit trail

### GDPR Compliance
- Explicit consent checkboxes required
- Right to be forgotten (admin can delete submissions)
- Data retention policies enforced
- Audit log of all data access
- Privacy policy link prominently displayed

---

## Database Schema

### Tables Required
1. `candidate_form_submissions` - Main form records
2. `form_access_tokens` - Secure access tokens
3. `form_notifications` - Email tracking
4. `form_validations` - Validation results
5. `form_audit_logs` - Activity tracking

### Relationships
- CandidateFormSubmission 1:1 FormAccessToken
- CandidateFormSubmission 1:N FormNotification
- CandidateFormSubmission 1:N FormValidation
- CandidateFormSubmission 1:N FormAuditLog

---

## Performance Considerations

### Optimization Strategies
1. Auto-save debounced to 30 seconds
2. Client-side validation before server validation
3. Lazy load form sections as user scrolls
4. Progressive form rendering
5. Optimistic UI updates on save
6. Cache validation results for 5 minutes
7. Background token expiration cleanup job

---

## Analytics & Tracking

### Key Metrics
```typescript
interface FormAnalytics {
  // Completion Metrics
  invitationsSent: number;
  formsStarted: number;
  formsCompleted: number;
  completionRate: number;
  
  // Time Metrics
  avgTimeToStart: number;               // Minutes from send to first open
  avgTimeToComplete: number;            // Minutes from start to submit
  
  // Field Metrics
  fieldCompletionRates: Record<string, number>;
  mostSkippedFields: string[];
  
  // Abandonment
  abandonmentRate: number;
  abandonmentPoints: string[];          // Where users drop off
  
  // Errors
  mostCommonErrors: Record<string, number>;
  validationFailures: number;
}
```

---

## Future Enhancements

1. **Multi-language Support**: Translate form based on candidate location
2. **Progressive Disclosure**: Show fields dynamically based on previous answers
3. **Document Upload**: Allow candidates to upload ID scans, proof of address
4. **Mobile Optimization**: Native mobile experience
5. **Autofill Integration**: Browser autofill for banking details
6. **Smart Validation**: AI-powered address validation
7. **Video KYC**: Optional video verification for high-value contracts
8. **Partial Submission**: Allow candidates to submit incomplete forms with admin approval

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-14  
**Flow Status**: 🔒 Locked - Production Ready
