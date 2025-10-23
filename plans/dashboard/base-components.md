# Subplan 0B: Base Components

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 2
**Duration:** 1-2 days
**Priority:** HIGH (foundation for all specialized components)
**Dependencies:** Subplan 0A complete (design system)

---

## Context

Create reusable base components that all dashboard visualizations will use.

### Key Documents
- **Design Spec:** `docs/design/dashboard-redesign-spec.md`
- **Design System:** Subplan 0A (`plans/dashboard/design-system-core.md`)

---

## Components to Implement

### 1. MetricCard
```typescript
// Display single metric with label, trend, sparkline
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  sparkline?: number[];
  status?: 'normal' | 'warning' | 'critical';
  onClick?: () => void;
}
```

### 2. Panel
```typescript
// Container with glow + header
interface PanelProps {
  title?: string;
  children: React.ReactNode;
  glowColor?: 'cyan' | 'green' | 'amber' | 'red';
  actions?: React.ReactNode;
}
```

### 3. StatusIndicator
```typescript
// Color-coded status dots
interface StatusIndicatorProps {
  status: 'good' | 'warning' | 'critical';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}
```

### 4. Button, Badge, Tooltip
Standard UI primitives with design system styling.

### 5. LoadingSpinner, ErrorBoundary
Utility components for async states.

---

## Implementation Tasks

- [ ] Create `src/components/ui/MetricCard.tsx`
- [ ] Create `src/components/ui/Panel.tsx`
- [ ] Create `src/components/ui/StatusIndicator.tsx`
- [ ] Create `src/components/ui/Button.tsx`
- [ ] Create `src/components/ui/Badge.tsx`
- [ ] Create `src/components/ui/Tooltip.tsx`
- [ ] Create `src/components/ui/LoadingSpinner.tsx`
- [ ] Create `src/components/ui/ErrorBoundary.tsx`
- [ ] Create `src/components/ui/index.ts` (re-exports)

---

## Acceptance Criteria

✅ All components render with design system styles
✅ Glow effects apply correctly
✅ Glass morphism backgrounds work
✅ Animations trigger (fade-in, slide-up)
✅ Accessibility: keyboard navigation, ARIA labels
✅ TypeScript: no errors, proper prop types

---

## Deliverables

**Files:** 9 component files (~800 lines total)
**Exports:** All components from `src/components/ui/index.ts`

---

**Last Updated:** October 22, 2025
