# Flow 2 - Admin Contracting
## Data Structure & Modelling Documentation

---

## Overview

Flow 2 enables administrators to manage the complete contract lifecycle for candidates - from initial data collection through contract generation, review, signature workflows, and final certification. This flow orchestrates multi-party document signing, compliance tracking, and candidate progression through a pipeline-based interface.

---

## Core Data Models

### 1. Candidate
Represents an individual contractor moving through the contracting process.

```typescript
interface Candidate {
  id: string;                           // Unique identifier
  fullName: string;                     // Legal full name
  email: string;                        // Primary contact email
  role: string;                         // Job title/role
  location: string;                     // Geographic location
  country: string;                      // Country of residence
  city?: string;                        // City of residence
  salary: number;                       // Compensation amount
  currency: string;                     // Currency code (USD, EUR, etc.)
  employmentType: 'contractor' | 'employee';
  startDate?: Date;                     // Contract start date
  payFrequency: 'monthly' | 'biweekly' | 'weekly';
  
  // Identity & Compliance
  idType?: string;                      // ID document type
  idNumber?: string;                    // ID document number
  taxResidence?: string;                // Tax residence country
  nationality?: string;                 // Nationality
  address?: string;                     // Residential address
  dateOfBirth?: Date;                   // Date of birth
  
  // Banking Information
  bankName?: string;                    // Bank institution name
  accountNumber?: string;               // Bank account/IBAN
  swiftBic?: string;                    // SWIFT/BIC code
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Status & Tracking
  status: CandidateStatus;              // Current pipeline status
  phase: ContractFlowPhase;             // Current workflow phase
  formSentAt?: Date;                    // When data collection form was sent
  formCompletedAt?: Date;               // When candidate completed form
  contractGeneratedAt?: Date;           // When contract was generated
  contractSentAt?: Date;                // When sent for signature
  candidateSignedAt?: Date;             // When candidate signed
  adminSignedAt?: Date;                 // When admin countersigned
  certifiedAt?: Date;                   // When fully certified
  onboardedAt?: Date;                   // When onboarding completed
  
  // Metadata
  source: 'ats' | 'manual';             // Origin of candidate data
  atsIntegrationId?: string;            // External ATS reference
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                    // Admin user ID
}

type CandidateStatus = 
  | 'offer_accepted'
  | 'collecting_data'
  | 'drafting_contract'
  | 'awaiting_signature'
  | 'tracking_progress'
  | 'certified'
  | 'onboarded';

type ContractFlowPhase =
  | 'prompt'
  | 'generating'
  | 'data-collection'
  | 'contract-creation'
  | 'bundle-creation'
  | 'drafting'
  | 'reviewing'
  | 'document-bundle-signature'
  | 'signing'
  | 'complete';
```

---

### 2. ContractDocument
Represents a single contract document within a bundle.

```typescript
interface ContractDocument {
  id: string;
  candidateId: string;
  type: DocumentType;
  title: string;
  content: string;                      // HTML or rich text content
  version: number;                      // Document version
  status: DocumentStatus;
  
  // Metadata
  generatedAt: Date;
  generatedBy: string;                  // Admin or system
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  // Clauses & Compliance
  keyClauses: ContractClause[];
  complianceRules: ComplianceRule[];
  
  createdAt: Date;
  updatedAt: Date;
}

type DocumentType =
  | 'employment_agreement'
  | 'contractor_agreement'
  | 'nda'
  | 'data_privacy_addendum'
  | 'country_compliance_doc'
  | 'policy_acknowledgment';

type DocumentStatus =
  | 'draft'
  | 'ready_for_review'
  | 'under_review'
  | 'approved'
  | 'sent_for_signature'
  | 'signed'
  | 'certified';

interface ContractClause {
  id: string;
  title: string;
  content: string;
  type: 'standard' | 'custom';
  required: boolean;
}

interface ComplianceRule {
  id: string;
  ruleId: string;                       // References mini_rules table
  country: string;
  requirement: string;
  status: 'compliant' | 'pending' | 'not_applicable';
}
```

---

### 3. DocumentBundle
Collection of all documents for a candidate's contract.

```typescript
interface DocumentBundle {
  id: string;
  candidateId: string;
  name: string;                         // E.g., "Maria Lopez - Contract Bundle"
  documents: ContractDocument[];
  status: BundleStatus;
  
  // Signature Workflow
  signatureWorkflow: SignatureWorkflow;
  docusignEnvelopeId?: string;          // DocuSign integration ID
  
  // Tracking
  sentForSignatureAt?: Date;
  allSignedAt?: Date;
  certifiedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

type BundleStatus =
  | 'preparing'
  | 'ready_for_signature'
  | 'sent_for_signature'
  | 'partially_signed'
  | 'fully_signed'
  | 'certified';

interface SignatureWorkflow {
  id: string;
  bundleId: string;
  requiredSignatures: SignatureRequirement[];
  completedSignatures: Signature[];
  status: 'pending' | 'in_progress' | 'complete';
}

interface SignatureRequirement {
  id: string;
  documentId: string;
  signerType: 'candidate' | 'admin' | 'witness';
  signerEmail: string;
  signerName: string;
  order: number;                        // Signing sequence
  required: boolean;
}

interface Signature {
  id: string;
  requirementId: string;
  signerEmail: string;
  signerName: string;
  signedAt: Date;
  ipAddress?: string;
  location?: string;
  method: 'docusign' | 'manual' | 'electronic';
  certificateUrl?: string;
}
```

---

### 4. ContractReview
Tracks review comments and feedback on contracts.

```typescript
interface ContractReview {
  id: string;
  candidateId: string;
  documentId: string;
  reviewerId: string;                   // Admin user ID
  comments: ReviewComment[];
  status: 'pending' | 'in_progress' | 'complete';
  createdAt: Date;
  completedAt?: Date;
}

interface ReviewComment {
  id: string;
  reviewId: string;
  content: string;
  clauseId?: string;                    // Specific clause reference
  type: 'suggestion' | 'required_change' | 'question';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}
```

---

### 5. CertificationRecord
Final certification record for completed contracts.

```typescript
interface CertificationRecord {
  id: string;
  candidateId: string;
  bundleId: string;
  certificateNumber: string;            // Unique certificate ID
  certificateUrl: string;               // PDF download URL
  
  // Certification Details
  certifiedAt: Date;
  certifiedBy: string;                  // Admin user ID
  expiresAt?: Date;                     // If applicable
  
  // Verification
  verificationHash: string;             // For authenticity
  blockchainTxId?: string;              // If using blockchain
  
  // Audit Trail
  auditLog: AuditEntry[];
  
  createdAt: Date;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  details: Record<string, any>;
}
```

---

## State Management

### Pipeline State
```typescript
interface PipelineState {
  columns: {
    offerAccepted: Candidate[];
    collectingData: Candidate[];
    draftingContract: Candidate[];
    awaitingSignature: Candidate[];
    trackingProgress: Candidate[];
    certified: Candidate[];
  };
  selectedCandidateId?: string;
  drawerOpen: boolean;
  drawerContext: 'form' | 'contract' | 'signature' | null;
}
```

### Contract Flow State
```typescript
interface ContractFlowState {
  phase: ContractFlowPhase;
  selectedCandidates: string[];
  currentDraftIndex: number;
  reviewComments: Record<string, ReviewComment[]>;
  signedCandidates: string[];
  
  // Actions
  startPromptFlow: () => void;
  proceedToDrafting: () => void;
  moveToReview: () => void;
  sendForSigning: (candidateId: string) => void;
  signContract: (candidateId: string, type: 'candidate' | 'admin') => void;
  certifyContract: (candidateId: string) => void;
  resetFlow: () => void;
}
```

---

## User Flow & Transitions

### Phase 1: Data Collection
1. Admin receives candidate from ATS (or manually adds)
2. Candidate enters "Offer Accepted" column
3. Admin opens side drawer → views pre-filled data
4. Admin clicks "Send Form" → candidate receives data collection link
5. Candidate moves to "Collecting Data" column
6. Candidate completes form → admin receives notification
7. Form data syncs to candidate record

### Phase 2: Contract Generation
1. Candidate moves to "Drafting Contract" column
2. System generates contract bundle based on:
   - Candidate data
   - Employment type
   - Country-specific compliance rules
   - Organizational templates
3. Contract appears in review workspace

### Phase 3: Review & Approval
1. Admin reviews contract in "Contract Draft Workspace"
2. Can toggle between multiple document templates
3. Add review comments if needed
4. Approve contract → moves to "Ready for Signature"

### Phase 4: Signature Workflow
1. Admin sends bundle for signature
2. Candidate moves to "Awaiting Signature" column
3. Candidate receives DocuSign email
4. Candidate signs → admin receives notification
5. Admin countersigns
6. Candidate moves to "Tracking Progress" column

### Phase 5: Certification & Onboarding
1. System monitors candidate onboarding completion
2. After 5 seconds in "Tracking Progress", auto-moves to "Certified"
3. System generates certification record
4. Admin and candidate receive certified contract bundle
5. Process complete

---

## Validation Rules

### Data Collection Form
```typescript
const dataCollectionValidation = {
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  idType: z.string().min(1, "ID type required"),
  idNumber: z.string().min(1, "ID number required"),
  taxResidence: z.string().min(1, "Tax residence required"),
  city: z.string().min(1, "City required"),
  nationality: z.string().min(1, "Nationality required"),
  address: z.string().min(5, "Complete address required"),
  bankName: z.string().min(1, "Bank name required"),
  accountNumber: z.string().min(1, "Account number required"),
  // Emergency contact optional
};
```

### Contract Generation
```typescript
const contractGenerationValidation = {
  candidateDataComplete: boolean;       // All required fields filled
  complianceRulesChecked: boolean;      // Country rules validated
  templateAvailable: boolean;           // Contract template exists
  adminApprovalRequired: boolean;       // If custom clauses added
};
```

---

## Integration Points

### 1. ATS Integration (Inbound)
```typescript
interface ATSWebhookPayload {
  candidate_id: string;
  full_name: string;
  email: string;
  role: string;
  salary: number;
  currency: string;
  employment_type: 'contractor' | 'employee';
  start_date?: string;
  location: string;
  status: 'offer_accepted';
}
```

### 2. DocuSign Integration (Signature)
```typescript
interface DocuSignEnvelope {
  envelopeId: string;
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed';
  documents: DocuSignDocument[];
  recipients: DocuSignRecipient[];
}

interface DocuSignWebhook {
  event: 'envelope-sent' | 'envelope-delivered' | 'recipient-signed' | 'envelope-completed';
  envelopeId: string;
  timestamp: string;
  data: any;
}
```

### 3. Payroll System Integration (Outbound)
```typescript
interface PayrollOnboardingPayload {
  candidateId: string;
  fullName: string;
  email: string;
  startDate: Date;
  salary: number;
  currency: string;
  payFrequency: string;
  bankDetails: BankDetails;
  taxInformation: TaxInformation;
  contractCertified: boolean;
  certificationUrl: string;
}
```

---

## Security & Compliance

### Access Control
- **Admins**: Full access to all candidate data and contracts
- **HR Users**: View-only access to contracts
- **CFO Users**: Access to financial data only
- **Candidates**: Access only to their own data and contracts

### Data Protection
- All personal data encrypted at rest
- PII fields encrypted in database
- Audit logs for all data access
- GDPR-compliant data retention policies

### Document Security
- Contracts watermarked with unique IDs
- Signature verification via DocuSign
- Certificate generation with cryptographic hash
- Immutable audit trail for all contract changes

---

## Database Schema

### Tables Required
1. `candidates` - Core candidate information
2. `contract_documents` - Individual contract documents
3. `document_bundles` - Contract bundle groupings
4. `signature_workflows` - Signature process tracking
5. `signatures` - Individual signature records
6. `contract_reviews` - Review comments and feedback
7. `certification_records` - Final certification data
8. `audit_logs` - Comprehensive audit trail

### Relationships
- Candidate 1:N ContractDocuments
- Candidate 1:1 DocumentBundle
- DocumentBundle 1:1 SignatureWorkflow
- SignatureWorkflow 1:N Signatures
- Candidate 1:N ContractReviews
- Candidate 1:1 CertificationRecord

---

## Error Handling

### Common Scenarios
1. **Incomplete Candidate Data**: Block contract generation, prompt admin
2. **DocuSign API Failure**: Queue for retry, notify admin
3. **Signature Timeout**: Send reminder, escalate after 7 days
4. **Compliance Rule Changes**: Flag affected contracts, require re-review
5. **Duplicate Submission**: Prevent duplicate candidates via email check

---

## Performance Considerations

### Optimization Strategies
1. Lazy load contract documents (load on-demand)
2. Cache candidate list with SWR
3. Debounce search/filter operations
4. Paginate large candidate lists
5. Background job for contract generation
6. Real-time updates via WebSocket for signature events

---

## Future Enhancements

1. **Bulk Operations**: Send multiple contracts at once
2. **Template Customization**: Allow admins to edit contract templates
3. **E-Signature Alternatives**: Support other providers (Adobe Sign, etc.)
4. **Advanced Analytics**: Contract velocity, bottleneck detection
5. **AI-Assisted Review**: Auto-detect compliance issues
6. **Mobile Signature**: Native mobile app for signing
7. **Blockchain Certification**: Immutable contract records

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-14  
**Flow Status**: 🔒 Locked - Production Ready
