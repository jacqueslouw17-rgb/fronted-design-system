# Flow Locking System

## Overview

The Flow Locking system prevents structural, design, and logic changes to finalized flows. This ensures that flows ready for backend integration remain stable and consistent.

## Locked Flows

### Flow 1 — Admin Onboarding
- **Status**: 🔒 LOCKED
- **Locked Date**: 2025-01-13
- **Path**: `/flows/admin/onboarding`
- **Reason**: Finalized for backend integration
- **Files**:
  - `src/pages/flows/AdminOnboarding.tsx`
  - `src/components/flows/onboarding/Step*.tsx`

### Flow 5 — Candidate Dashboard
- **Status**: 🔒 LOCKED
- **Locked Date**: 2025-01-14
- **Path**: `/flows/candidate-dashboard`
- **Reason**: Finalized contract flow with signing sub-statuses and document management
- **Files**:
  - `src/pages/flows/CandidateDashboard.tsx`
  - `src/components/contract-flow/ContractPreviewDrawer.tsx`

### Flow 1.1 — Fronted Admin Dashboard v2
- **Status**: 🔒 LOCKED
- **Locked Date**: 2025-01-15
- **Path**: `/flows/contract-flow-multi-company`
- **Reason**: Finalized multi-company admin dashboard with pipeline, company switcher, and contractor management
- **Files**:
  - `src/pages/AdminContractingMultiCompany.tsx`
  - `src/components/contract-flow/PipelineView.tsx`
  - `src/components/contract-flow/AddCandidateDrawer.tsx`
  - `src/components/contract-flow/OnboardingFormDrawer.tsx`
  - `src/components/flows/onboarding/EmbeddedAdminOnboarding.tsx`
  - `src/components/flows/onboarding/Step2OrgProfileSimplified.tsx`
  - `src/components/flows/onboarding/Step7Finish.tsx`

## How It Works

### 1. Visual Indicators
Locked flows display:
- 🔒 Lock badge in the flow library (`/flows`)
- Lock icon next to the flow title
- "Locked" status tag

### 2. Code Protection
Each locked flow file contains a warning comment at the top:
```typescript
/**
 * ⚠️ LOCKED FLOW - DO NOT MODIFY ⚠️
 * 
 * Flow X — [Name]
 * Status: LOCKED (finalized for backend integration)
 * Locked Date: YYYY-MM-DD
 * ...
 */
```

### 3. Central Registry
The `src/config/flowRegistry.ts` file maintains metadata for all flows:
```typescript
export const FLOW_REGISTRY: Record<string, FlowMetadata> = {
  'f1-admin-onboarding': {
    id: 'f1-admin-onboarding',
    title: 'Flow 1 — Admin Onboarding',
    locked: true,
    lockedDate: '2025-01-13',
    // ...
  }
}
```

## Restrictions for Locked Flows

### ❌ DO NOT:
- Add or remove steps
- Change navigation or flow control logic
- Modify styling, layout, or component structure
- Update validation rules or business logic
- Apply batch updates or pattern-level edits
- Refactor or reorganize code

### ✅ ALLOWED:
- Bug fixes (after careful review)
- Security patches
- Critical accessibility improvements
- Documentation updates

## Unlocking a Flow

If a flow must be unlocked:

1. Update `src/config/flowRegistry.ts`:
   ```typescript
   'f1-admin-onboarding': {
     locked: false, // Change from true
     // ...
   }
   ```

2. Remove the warning comment from the flow file

3. Update `src/pages/Flows.tsx` to remove `locked: true`

4. Document the reason for unlocking in project notes

## For AI Assistants

When processing user requests:
1. Check if the request involves locked flows
2. Refer to `src/config/flowRegistry.ts` for locked status
3. Skip locked flows in batch operations
4. Warn users if they request changes to locked flows
5. Suggest creating new flows instead of modifying locked ones

## Testing

Before locking a flow, ensure:
- All functionality works correctly
- All user paths are tested
- Design is finalized and approved
- Backend integration points are documented
- No known bugs or issues remain
