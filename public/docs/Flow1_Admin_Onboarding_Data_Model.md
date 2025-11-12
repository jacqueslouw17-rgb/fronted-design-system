# Flow 1 — Admin Onboarding
## Data Structure & Modelling Document

**Version:** 1.0  
**Status:** 🔒 Locked & Finalized  
**Last Updated:** 2025  

---

## Overview

Flow 1 represents the complete onboarding journey for system administrators. This document outlines all data structures, state management, user flows, and integration points required for the admin onboarding process.

---

## Flow Architecture

### Steps Overview
1. **Step 1: Introduction & Trust Building**
2. **Step 2: Organization Profile**
3. **Step 3: Localization Settings**
4. **Step 4: Integrations**
5. **Step 5: Mini-Rules Configuration**
6. **Step 6: Compliance Pledge**
7. **Step 7: Dashboard Launch**

---

## Data Models

### 1. Organization Profile

```typescript
interface OrganizationProfile {
  id: string;
  company_name: string;
  company_size: 'startup' | 'small' | 'medium' | 'enterprise';
  industry: string;
  headquarters_location: string;
  website?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Storage:** Supabase `organizations` table  
**RLS Policy:** Admin users only (user_id matches auth.uid())

---

### 2. Admin User Profile

```typescript
interface AdminProfile {
  id: string;
  user_id: string; // References auth.users
  full_name: string;
  email: string;
  role: 'primary_admin' | 'secondary_admin';
  organization_id: string; // FK to organizations
  onboarding_completed: boolean;
  onboarding_step: number; // Current step (1-7)
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Storage:** Supabase `admin_profiles` table  
**RLS Policy:** User can only access their own profile

---

### 3. Localization Settings

```typescript
interface LocalizationSettings {
  id: string;
  organization_id: string; // FK to organizations
  primary_currency: string; // ISO 4217 currency code
  supported_countries: string[]; // ISO 3166-1 alpha-2 country codes
  timezone: string; // IANA timezone
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  language: string; // ISO 639-1 language code
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Storage:** Supabase `localization_settings` table  
**Default Values:**
- Currency: USD
- Timezone: UTC
- Date Format: YYYY-MM-DD
- Language: en

---

### 4. Integration Configuration

```typescript
interface IntegrationConfig {
  id: string;
  organization_id: string; // FK to organizations
  integration_type: 'payroll' | 'ats' | 'accounting' | 'hr_system';
  provider_name: string; // e.g., 'Gusto', 'BambooHR', 'Greenhouse'
  is_enabled: boolean;
  api_credentials?: {
    api_key?: string;
    api_secret?: string;
    webhook_url?: string;
  };
  sync_status: 'active' | 'paused' | 'error';
  last_sync?: timestamp;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Storage:** Supabase `integrations` table  
**Secrets:** API credentials stored in Supabase Vault  
**Security:** Encrypted at rest, never exposed in frontend

---

### 5. Mini-Rules Configuration

```typescript
interface MiniRule {
  id: string;
  organization_id: string; // FK to organizations
  rule_type: 'approval_threshold' | 'auto_certification' | 'compliance_check' | 'notification';
  rule_name: string;
  description: string;
  is_enabled: boolean;
  conditions: {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  }[];
  actions: {
    action_type: 'notify' | 'approve' | 'escalate' | 'block';
    target?: string; // Email or user ID
    message?: string;
  }[];
  priority: number;
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Storage:** Supabase `mini_rules` table  
**Example Rules:**
- Auto-approve contracts under $50,000
- Require CFO approval for payroll batches over $100,000
- Block contracts without tax compliance verification
- Notify HR when candidate completes onboarding

---

### 6. Compliance Pledge

```typescript
interface CompliancePledge {
  id: string;
  organization_id: string; // FK to organizations
  admin_user_id: string; // FK to admin_profiles
  pledge_text: string;
  agreed_at: timestamp;
  ip_address: string;
  user_agent: string;
  signature_data?: {
    signed_by: string;
    signature_image?: string;
  };
  created_at: timestamp;
}
```

**Storage:** Supabase `compliance_pledges` table  
**Immutable:** Once created, cannot be modified (audit trail)

---

## State Management

### Onboarding State (Zustand)

```typescript
interface OnboardingState {
  // Current state
  currentStep: number;
  isCompleted: boolean;
  
  // Organization data
  organizationProfile: OrganizationProfile | null;
  localizationSettings: LocalizationSettings | null;
  
  // Integrations
  integrations: IntegrationConfig[];
  selectedIntegrations: string[];
  
  // Mini-rules
  miniRules: MiniRule[];
  
  // Compliance
  pledgeAccepted: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  saveOrganizationProfile: (profile: OrganizationProfile) => Promise<void>;
  saveLocalizationSettings: (settings: LocalizationSettings) => Promise<void>;
  addIntegration: (integration: IntegrationConfig) => Promise<void>;
  addMiniRule: (rule: MiniRule) => Promise<void>;
  acceptPledge: (signature: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}
```

**Storage:** `src/stores/onboardingStore.ts`  
**Persistence:** Supabase (server-side), Zustand persist (client-side cache)

---

## User Flow

### Step-by-Step Journey

#### Step 1: Introduction & Trust Building
- **Purpose:** Welcome admin, introduce Kurt (AI assistant)
- **Data Collected:** None (informational only)
- **Components:** `Step1IntroTrust.tsx`
- **Exit Criteria:** User clicks "Let's Begin"

#### Step 2: Organization Profile
- **Purpose:** Capture company details
- **Data Collected:**
  - Company name (required)
  - Company size (required)
  - Industry (required)
  - Location (required)
  - Website (optional)
- **Validation:**
  - Company name: Min 2 characters
  - All required fields must be filled
- **Components:** `Step2OrgProfileSimplified.tsx`
- **DB Operations:** INSERT into `organizations` table

#### Step 3: Localization Settings
- **Purpose:** Configure regional and currency preferences
- **Data Collected:**
  - Primary currency
  - Supported countries (multi-select)
  - Timezone
  - Date format
  - Language
- **Components:** `Step3Localization.tsx`
- **DB Operations:** INSERT into `localization_settings` table

#### Step 4: Integrations
- **Purpose:** Connect external systems (ATS, payroll, accounting)
- **Data Collected:**
  - Selected integrations
  - API credentials (per integration)
  - Webhook URLs
- **Components:** `Step4Integrations.tsx`
- **DB Operations:** INSERT into `integrations` table
- **Security:** Credentials stored in Supabase Vault

#### Step 5: Mini-Rules Configuration
- **Purpose:** Set up automation rules and approval workflows
- **Data Collected:**
  - Rule type
  - Conditions
  - Actions
  - Priority
- **Components:** `Step5MiniRules.tsx`
- **DB Operations:** INSERT into `mini_rules` table
- **Default Rules:** Pre-configured templates available

#### Step 6: Compliance Pledge
- **Purpose:** Legal acknowledgment and compliance agreement
- **Data Collected:**
  - Pledge acceptance
  - Digital signature
  - Timestamp
  - IP address
- **Components:** `Step6Pledge.tsx`
- **DB Operations:** INSERT into `compliance_pledges` table
- **Immutable:** Audit trail record

#### Step 7: Dashboard Launch
- **Purpose:** Completion celebration and redirect to Dashboard v3
- **Data Collected:** None
- **Components:** `Step7Finish.tsx`
- **Actions:**
  - Mark `onboarding_completed = true`
  - Trigger confetti animation
  - Redirect to `/dashboard`

---

## Validation Rules

### Field-Level Validation

| Field | Type | Constraints | Error Message |
|-------|------|-------------|---------------|
| Company Name | string | Min 2, Max 100 chars | "Company name must be at least 2 characters" |
| Email | email | Valid email format | "Please enter a valid email address" |
| Currency | select | ISO 4217 code | "Please select a currency" |
| Country | multi-select | ISO 3166-1 alpha-2 | "Select at least one country" |
| API Key | string | Min 10 chars | "API key appears invalid" |

### Step-Level Validation

- **Step 2:** All required organization fields must be filled
- **Step 3:** At least one country must be selected
- **Step 4:** At least one integration recommended (optional)
- **Step 5:** At least one mini-rule recommended (optional)
- **Step 6:** Pledge must be explicitly accepted
- **Step 7:** All previous steps must be completed

---

## Integration Points

### 1. ATS Integration (Application Tracking System)
**Purpose:** Import candidate data for contract creation  
**Data Flow:** ATS → Webhook → Supabase → Flow 2 (Contract Creation)  
**Webhook Payload:**
```json
{
  "candidate_id": "string",
  "full_name": "string",
  "email": "string",
  "role": "string",
  "salary": number,
  "currency": "string",
  "employment_type": "employee | contractor",
  "start_date": "YYYY-MM-DD",
  "location": "string"
}
```

### 2. Payroll Integration
**Purpose:** Sync payroll batches and payment data  
**Data Flow:** Bidirectional  
**Supported Providers:** Gusto, ADP, Rippling, Deel

### 3. Accounting Integration
**Purpose:** Sync financial records and invoices  
**Data Flow:** Supabase → Accounting System  
**Supported Providers:** QuickBooks, Xero, NetSuite

---

## Security & Compliance

### Row-Level Security (RLS) Policies

```sql
-- Organizations: Admins can only access their own organization
CREATE POLICY "Admins access own organization"
ON organizations FOR ALL
USING (id IN (
  SELECT organization_id FROM admin_profiles
  WHERE user_id = auth.uid()
));

-- Admin Profiles: Users can only access their own profile
CREATE POLICY "Users access own profile"
ON admin_profiles FOR ALL
USING (user_id = auth.uid());

-- Integrations: Organization-scoped access
CREATE POLICY "Organization scoped integrations"
ON integrations FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM admin_profiles
  WHERE user_id = auth.uid()
));

-- Mini-Rules: Organization-scoped access
CREATE POLICY "Organization scoped rules"
ON mini_rules FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM admin_profiles
  WHERE user_id = auth.uid()
));

-- Compliance Pledges: Immutable, read-only after creation
CREATE POLICY "Pledges are immutable"
ON compliance_pledges FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM admin_profiles
  WHERE user_id = auth.uid()
));
```

### Data Encryption
- **At Rest:** All Supabase data encrypted with AES-256
- **In Transit:** TLS 1.3 for all API communications
- **Secrets:** Stored in Supabase Vault, never exposed to frontend

### Audit Trail
- All onboarding actions logged in `audit_trail` table
- Includes: timestamp, user_id, action_type, affected_table, old_value, new_value

---

## Edge Cases & Error Handling

### Incomplete Onboarding
- **Scenario:** User closes browser mid-flow
- **Solution:** State persisted in Supabase, resume from last completed step

### Duplicate Organization
- **Scenario:** User tries to create organization with existing name
- **Solution:** Allow duplicates, use unique `id` as primary key

### Integration Failure
- **Scenario:** API credentials invalid or service unavailable
- **Solution:** Display error message, allow retry, save as "paused" status

### Mini-Rule Conflicts
- **Scenario:** Two rules with conflicting actions
- **Solution:** Execute highest priority rule first, log conflict

### Browser Compatibility
- **Scenario:** User on unsupported browser
- **Solution:** Display warning, allow continuation with degraded experience

---

## Testing & Validation

### Unit Tests
- Validation functions for each data model
- State management actions (Zustand)

### Integration Tests
- Complete flow from Step 1 → Step 7
- Database persistence and retrieval
- RLS policy enforcement

### E2E Tests
- Full user journey with real database
- Integration webhook simulation
- Multi-user scenarios

---

## Performance Considerations

### Data Loading
- Lazy load integration options (not all at once)
- Debounce API calls for real-time validation
- Cache organization data in Zustand

### Database Queries
- Index on `organization_id`, `user_id`
- Limit queries to necessary fields only
- Use prepared statements for repeated queries

### Frontend Optimization
- Code splitting per step
- Preload next step in background
- Optimize images and animations

---

## Migration & Rollback

### Data Migration
- If schema changes required, use Supabase migrations
- Backup existing data before migration
- Test migration on staging environment

### Rollback Plan
- Maintain previous migration version
- Rollback script available in `supabase/migrations/`
- Monitor error rates post-deployment

---

## Monitoring & Analytics

### Key Metrics
- Onboarding completion rate (target: >90%)
- Average time per step
- Drop-off points (which step users abandon)
- Integration adoption rate

### Error Tracking
- Log all API errors to monitoring service
- Track validation failures
- Monitor RLS policy violations

### User Feedback
- Collect feedback at Step 7 (optional)
- Track Kurt interaction quality
- NPS score post-onboarding

---

## Future Enhancements (Post-Lock)

_These are noted for future reference but NOT part of the locked flow:_

- Multi-factor authentication for admin accounts
- Bulk organization import (for enterprise clients)
- Custom branding (logo, colors) per organization
- Advanced mini-rules with AI-powered suggestions
- Integration marketplace with one-click connections

---

## Appendix

### Related Flows
- **Flow 2:** Admin Contracting (uses organization profile data)
- **Flow 3:** Candidate Data Collection (receives ATS webhook data)

### Component Dependencies
- Kurt AI Assistant (`KurtCoilot.tsx`)
- Progress Tracker (`OnboardingStepProgress.tsx`)
- Step Cards (`StepCard.tsx`)

### Database Schema Files
- `supabase/migrations/` (all migration files)
- `src/integrations/supabase/types.ts` (TypeScript types)

---

**Document Owner:** Admin Team  
**Review Cycle:** Quarterly (locked flows reviewed annually)  
**Contact:** dev@fronted.com  

---

_This document represents the finalized data structure and modelling for Flow 1 — Admin Onboarding. Any changes require formal approval and version increment._
