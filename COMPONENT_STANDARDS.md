# Component Standardization Guide

## Overview
All flows (F1-F5) must use centralized, reusable components from the `src/components/shared/` directory. This ensures:
- Visual consistency across all flows
- Faster iteration when adding new countries/rules
- Clean API integration points for backend engineering
- Reduced code duplication

## Core Shared Components

### Input Components

#### StandardInput
**Location:** `src/components/shared/StandardInput.tsx`
**Use for:** All text, email, password, number, and textarea fields

```tsx
import StandardInput from "@/components/shared/StandardInput";

<StandardInput
  id="fullName"
  label="Full Name"
  value={data.fullName}
  onChange={(value) => setData({ ...data, fullName: value })}
  required
  placeholder="Enter your full name"
  error={errors.fullName}
  helpText="As shown on government ID"
  completed={isCompleted}
  locked={isLocked}
  lockMessage="This field is locked by admin"
/>
```

**Features:**
- ✅ Required asterisk indicator
- ✅ Completed checkmark
- ✅ Lock icon with tooltip
- ✅ Error state styling
- ✅ Help text support
- ✅ Textarea mode

---

#### PhoneInput
**Location:** `src/components/shared/PhoneInput.tsx`
**Use for:** All phone number fields

```tsx
import PhoneInput from "@/components/shared/PhoneInput";

<PhoneInput
  value={data.phoneNumber}
  onChange={(value) => setData({ ...data, phoneNumber: value })}
  countryCode={data.countryCode}
  onCountryCodeChange={(code) => setData({ ...data, countryCode: code })}
  required
  error={errors.phoneNumber}
  helpText="We'll use this for verification"
/>
```

**Features:**
- 🌍 Country code selector with flags
- 📱 Auto-formatting per country
- ✅ Validation support

---

#### CurrencyInput
**Location:** `src/components/shared/CurrencyInput.tsx`
**Use for:** All salary, payment, and currency fields

```tsx
import CurrencyInput from "@/components/shared/CurrencyInput";

<CurrencyInput
  value={data.salary}
  onChange={(value) => setData({ ...data, salary: value })}
  currency={data.currency}
  onCurrencyChange={(curr) => setData({ ...data, currency: curr })}
  label="Monthly Salary"
  required
  showCurrencySelect={true}
  helpText="Gross amount before deductions"
/>
```

**Features:**
- 💰 Auto-formatting with thousand separators
- 💱 Currency selector with symbols
- ✅ Decimal support

---

#### DateOfBirthPicker
**Location:** `src/components/shared/DateOfBirthPicker.tsx`
**Use for:** Date of birth fields

```tsx
import DateOfBirthPicker from "@/components/shared/DateOfBirthPicker";

<DateOfBirthPicker
  value={data.dateOfBirth}
  onChange={(date) => setData({ ...data, dateOfBirth: date })}
  required
  label="Date of Birth"
  placeholder="Pick a date"
/>
```

**Features:**
- 📅 Calendar popup with date restrictions
- ✅ Range validation (1900 - today)

---

#### NationalitySelect
**Location:** `src/components/shared/NationalitySelect.tsx`
**Use for:** Nationality/country selection

```tsx
import NationalitySelect from "@/components/shared/NationalitySelect";

<NationalitySelect
  value={data.nationality}
  onValueChange={(value) => setData({ ...data, nationality: value })}
  required
  placeholder="Select nationality"
/>
```

**Features:**
- 🌍 Country flags prefixed
- ✅ Searchable dropdown

---

#### MonthlyPayScheduleInput
**Location:** `src/components/shared/MonthlyPayScheduleInput.tsx`
**Use for:** Payroll day-of-month settings

```tsx
import MonthlyPayScheduleInput from "@/components/shared/MonthlyPayScheduleInput";

<MonthlyPayScheduleInput
  value={data.payoutDay}
  onChange={(value) => setData({ ...data, payoutDay: value })}
  required
  helpText="Day of the month for salary payment"
/>
```

**Features:**
- ✅ Day validation (1-31)
- ⚠️ Warning for days 29-31 (month-end edge cases)

---

### Display Components

#### PersonMiniCard
**Location:** `src/components/shared/PersonMiniCard.tsx`
**Use for:** Pipeline cards, candidate lists, contractor cards

```tsx
import PersonMiniCard from "@/components/shared/PersonMiniCard";

<PersonMiniCard
  name="John Doe"
  role="Frontend Developer"
  email="john@example.com"
  avatar="/avatars/john.jpg"
  countryFlag="🇳🇴"
  status="Active"
  statusVariant="primary"
  showCheckbox={true}
  isSelected={selectedIds.includes(id)}
  onSelect={(selected) => handleSelect(id, selected)}
  onClick={() => handleCardClick(id)}
/>
```

**Features:**
- 👤 Avatar with initials fallback
- 🌍 Country flag badge
- ☑️ Optional checkbox
- 🏷️ Status badge
- ✅ Hover effects

---

#### StandardChecklistItem
**Location:** `src/components/shared/StandardChecklistItem.tsx`
**Use for:** All checklist items in compliance, onboarding

```tsx
import StandardChecklistItem from "@/components/shared/StandardChecklistItem";

<StandardChecklistItem
  id="verify-id"
  title="Upload Government ID"
  description="Passport or national ID card"
  checked={data.idUploaded}
  onCheckedChange={(checked) => handleCheckChange("idUploaded", checked)}
  status="pending"
/>
```

**Features:**
- ☑️ Checkbox with label
- 🏷️ Status badge (pending, in-progress, completed, overdue)
- ✅ Strikethrough on completion
- 🎨 Status-based styling

---

#### StandardProgress
**Location:** `src/components/shared/StandardProgress.tsx`
**Use for:** All progress bars in flows

```tsx
import StandardProgress from "@/components/shared/StandardProgress";

<StandardProgress
  currentStep={3}
  totalSteps={6}
  variant="default"
  showLabel={true}
/>
```

**Features:**
- 📊 Visual progress bar with percentage
- 🏷️ Step counter label
- 🎨 Variant support (default, secondary, accent)

---

## Pattern Requirements

### Form Field Standards

**All form fields must:**
1. ✅ Show required asterisk (`*`) when `required={true}`
2. ✅ Display validation errors below field
3. ✅ Show help text when provided
4. ✅ Support disabled state
5. ✅ Show completed checkmark when validated
6. ✅ Support locked state with tooltip

### Validation Pattern

```tsx
// Use validation schemas (Zod)
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required")
});

// Validate before save
const validate = () => {
  try {
    schema.parse(data);
    setErrors({});
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors = {};
      error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    return false;
  }
};
```

### Cross-Flow Data Sync

**CRITICAL:** Updates in one place must auto-update everywhere:

| Field Changed | Must Update In |
|---------------|----------------|
| Legal Name | All contracts, documents, dashboard |
| Bank Details | Payroll module, payment settings |
| Tax Residency | Compliance status, checklist |
| Start Date | Contract draft, onboarding timeline |

**Implementation:**
- Use global state management (Zustand/Context)
- Subscribe to updates via state observers
- NO manual copying of data between components

---

## Genie (Kurt) Standardization

### Kurt Placement
**Position:** Always top-center of the flow
**Component:** Use `KurtAvatar` with message bubble

### Kurt Message Pattern
```tsx
import KurtAvatar from "@/components/KurtAvatar";

<div className="flex justify-center mb-6">
  <div className="flex items-start gap-3 max-w-xl">
    <KurtAvatar size="md" />
    <div className="bg-card border border-border/40 rounded-lg p-3 shadow-sm">
      <p className="text-sm text-foreground/80">
        {kurtMessage}
      </p>
    </div>
  </div>
</div>
```

### Kurt Behavior Components

1. **Typing Animation** - `LoadingDots`
2. **Toast-style Assist** - Use `toast` from `@/hooks/use-toast`
3. **Inline Validation** - Show inline with field errors

---

## Migration Checklist

When updating an existing flow to use standardized components:

### Step 1: Identify Components
- [ ] List all input fields
- [ ] List all cards/displays
- [ ] List all progress indicators
- [ ] List all checklists

### Step 2: Replace with Shared
- [ ] Replace text inputs with `StandardInput`
- [ ] Replace phone inputs with `PhoneInput`
- [ ] Replace currency fields with `CurrencyInput`
- [ ] Replace date pickers with `DateOfBirthPicker`
- [ ] Replace nationality selects with `NationalitySelect`
- [ ] Replace progress bars with `StandardProgress`
- [ ] Replace checklist items with `StandardChecklistItem`

### Step 3: Update Styling
- [ ] Remove custom input classes
- [ ] Remove custom validation UI
- [ ] Remove custom error displays
- [ ] Use standardized spacing

### Step 4: Test
- [ ] Verify all fields work correctly
- [ ] Check validation displays properly
- [ ] Test required field indicators
- [ ] Verify help text appears
- [ ] Test error states
- [ ] Test locked/disabled states

---

## Design System Tokens

**All components use semantic tokens from:**
- `src/index.css` - Color palette, gradients, shadows
- `tailwind.config.ts` - Animation, spacing, breakpoints

**DO NOT use direct colors like:**
- ❌ `text-white`, `bg-white`, `text-black`, `bg-black`

**Always use semantic tokens:**
- ✅ `text-foreground`, `bg-background`
- ✅ `text-primary`, `bg-primary`
- ✅ `text-muted-foreground`, `bg-muted`
- ✅ `border-border`, `shadow-card`

---

## Component Registry

All components are registered in `src/data/componentsRegistry.ts` and linked to their patterns.

**To add a new shared component:**
1. Create in `src/components/shared/`
2. Add entry to `componentsRegistry`
3. Link to relevant patterns
4. Update this guide

---

## Success Metrics

✅ **Visual Consistency:** All flows look unified
✅ **Code Reuse:** No duplicated input components
✅ **Fast Iteration:** New country rules = update one place
✅ **Clean Architecture:** Backend APIs have clear integration points
✅ **Strong Foundation:** Ready for scale without refactoring
