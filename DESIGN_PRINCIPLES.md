# Design System Principles

## Core Philosophy
**Subtle by default, vibrant on interaction.**

The interface should feel calm, minimal, and elegant at rest—revealing depth, color, and personality through purposeful interactions.

---

## Color Strategy

### Base Palette
- **Neutrals First**: Use muted grays for backgrounds, borders, and text by default
- **Brand Colors on Interaction**: Rich blue (#3b82f6), purple (#8b5cf6), emerald (#10b981)
- **Gradients for Emphasis**: Blue-to-purple gradient reserved for primary actions and progress indicators

### Color Application Rules
1. **Backgrounds**: Subtle muted tones (`bg-muted/50`, `bg-background`)
2. **Borders**: Very light, barely visible (`border-border`)
3. **Text**: High contrast for readability, muted for secondary info
4. **Badges/Tags**: Ultra-subtle with 10% opacity backgrounds
5. **Hover States**: Bring in brand colors, shadows, and transforms

---

## Button Hierarchy

### Primary Actions
- **Default**: Gradient (`bg-gradient-primary`) with slight lift on hover
- **Example**: "Start Conversation", "Save", "Submit"
- **Hover**: Opacity 90%, shadow-lg, translate-y-0.5

### Secondary Actions  
- **Default**: Outline style (`variant="outline"`) with neutral borders
- **Example**: "Next", "Continue", "Skip"
- **Hover**: Fill with darkest grey (`bg-foreground`), not pure black

### Tertiary Actions
- **Default**: Ghost style, barely visible
- **Example**: "Cancel", "Back", navigation
- **Hover**: Subtle background tint

### Anti-Pattern
❌ **Never use pure black (`#000000`)** - always use `foreground` token (darkest grey)

---

## Interactive States

### Hover Effects
1. **Cards**: Subtle lift (-translate-y-1), enhanced shadow, faint border glow
2. **Buttons**: Lift effect, gradient reveal, shadow increase
3. **Icons**: Scale (1.05), color shift to brand colors
4. **Badges**: Slight background darken, no dramatic color shift
5. **Links**: Underline with gradient, color shift
6. **Status-aware Items**: Use status-appropriate colors with subtle fills
   - Neutral/pending: `hover:bg-primary/5 hover:border-primary/40` (brand blue)
   - Success/verified: `hover:bg-success/5 hover:border-success/40` (green)
   - Error/breach: `hover:bg-destructive/5 hover:border-destructive/40` (red)
   - Warning/urgent: `hover:bg-amber-500/5 hover:border-amber-500/40` (amber)
   - ❌ Avoid generic `hover:bg-accent/50` - always choose status-appropriate colors

### Transition Timing
- **Fast**: 200ms for buttons, icons
- **Medium**: 300ms for cards
- **Slow**: 500ms for complex animations (progress bars)

### Easing
- Use `ease-out` for entering states
- Use `cubic-bezier(0.4, 0, 0.6, 1)` for smooth motion

---

## Component-Specific Guidelines

### Step Cards
- **Number Badge**: Subtle muted background, small text, low contrast
- **Status Badge**: Minimal (outline or light fill), descriptive not colorful
- **Border**: Barely visible at rest
- **Hover**: Border brightens, card lifts, content becomes clearer

### Progress Bars
- **Track**: Very light grey background
- **Indicator**: Gradient (blue-to-purple)
- **Height**: 4px (thin and elegant)

### Input Fields
- **Border**: Subtle grey, thin (1px)
- **Focus**: Ring with primary color, no harsh outlines
- **Background**: Slightly off-white/off-black

### Badges/Tags
- **Background**: 10% opacity of semantic color
- **Text**: Full opacity semantic color
- **Border**: Optional, very subtle
- **No Shadows**: Keep flat and minimal

---

## Typography

### Hierarchy
- **H1-H3**: Tight line-height (1.25), negative letter-spacing (-0.02em)
- **Body**: Normal spacing, 1.5 line-height
- **Small**: 13px for secondary info, 11px for micro-copy

### Weight
- **Semibold (600)**: Headings, buttons, emphasized
- **Medium (500)**: Subheadings
- **Regular (400)**: Body text

---

## Spacing

### System
- Use 4px base unit (2pt grid system)
- Consistent gaps: 4px, 8px, 12px, 16px, 24px, 32px

### Padding
- **Cards**: 16px (p-4)
- **Buttons**: 12px horizontal, 6px vertical
- **Containers**: 24px-32px (p-6 to p-8)

---

## Shadows

### Elevation Levels
1. **Subtle**: `0 1px 2px rgba(0,0,0,0.05)` - Barely noticeable
2. **Card**: `0 1px 3px rgba(0,0,0,0.1)` - Default card shadow
3. **Elevated**: `0 4px 6px rgba(0,0,0,0.1)` - Hover states
4. **Overlay**: `0 10px 15px rgba(0,0,0,0.1)` - Modals, dropdowns

### Usage
- Default: `shadow-card`
- Hover: `shadow-elevated`
- Never combine with heavy borders

---

## Animation Principles

### When to Animate
- ✅ Feedback (button clicks, form submissions)
- ✅ Transitions (page changes, state updates)
- ✅ Microinteractions (hover, focus)
- ❌ Don't animate static content
- ❌ Avoid animation overload

### Performance
- Prefer `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

---

## Accessibility

### Contrast
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text (18px+)
- Test with tools, never rely on visual judgment alone

### Focus States
- Always visible, never `outline: none` without replacement
- Use ring utilities (`focus-visible:ring-2`)

### Motion
- Respect `prefers-reduced-motion`
- Provide static alternatives

---

## Pattern Usage

### When to Use Gradients
- ✅ Primary CTAs
- ✅ Progress indicators
- ✅ Accent elements (sparingly)
- ❌ Not on large background areas
- ❌ Not on body text

### When to Use Color
- ✅ Hover states
- ✅ Active/selected states  
- ✅ Status indicators (success, error)
- ❌ Not by default on passive elements
- ❌ Avoid rainbow UIs (pick 2-3 brand colors max)

---

## Review Checklist

Before shipping any UI:
- [ ] Is color used purposefully, not decoratively?
- [ ] Are hover states consistent and delightful?
- [ ] Is the hierarchy clear (primary > secondary > tertiary)?
- [ ] Are borders subtle and minimal?
- [ ] Do shadows add depth without distraction?
- [ ] Is text readable in both light and dark modes?
- [ ] Are animations smooth and performant?
- [ ] Does it feel calm and confident?

---

**Remember**: We're building for professionals. The interface should feel powerful, trustworthy, and effortlessly elegant.
