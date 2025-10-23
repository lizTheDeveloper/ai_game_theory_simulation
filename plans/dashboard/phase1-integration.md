# Subplan 1F: Mission Control Integration

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 6 (Integration Agent)
**Duration:** 1-2 days
**Priority:** CRITICAL (wires everything together)
**Dependencies:** Subplans 1A-1E complete (all components built)

---

## Context

Wire together the 5 Mission Control components into the actual dashboard page. The other 5 agents built standalone components - this agent assembles them into the working dashboard.

---

## Tasks

### 1. Create Main Dashboard Page

**`src/app/dashboard/page.tsx`**
```typescript
'use client';

import { ParadigmCards } from '@/components/dashboard/ParadigmCards';
import { CriticalMetricsRow } from '@/components/dashboard/CriticalMetricsRow';
import { AgentDistributionSection } from '@/components/dashboard/AgentDistributionSection';
import { ActiveCrisesPanel } from '@/components/dashboard/ActiveCrisesPanel';
import { SystemHealthGrid } from '@/components/dashboard/SystemHealthGrid';
import { ParadigmDrillDown } from '@/components/dashboard/ParadigmDrillDown';
import { useState } from 'react';

export default function MissionControlPage() {
  const [selectedParadigm, setSelectedParadigm] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Critical Metrics Row - Top */}
      <CriticalMetricsRow />

      {/* Paradigm Cards - Click for Drill-Down */}
      <ParadigmCards onSelectParadigm={setSelectedParadigm} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        <AgentDistributionSection />
        <ActiveCrisesPanel />
      </div>

      {/* System Health Grid - Bottom */}
      <SystemHealthGrid />

      {/* Drill-Down Side Panel (Overlay) */}
      <ParadigmDrillDown
        paradigmId={selectedParadigm}
        onClose={() => setSelectedParadigm(null)}
      />
    </div>
  );
}
```

### 2. Add Loading States

**Entire page loading:**
```typescript
export default function MissionControlPage() {
  const { data: overview, isLoading: overviewLoading } = useOverviewData();
  const { data: paradigms, isLoading: paradigmsLoading } = useParadigmData();

  if (overviewLoading || paradigmsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ... components ... */}
    </div>
  );
}
```

### 3. Add Error Boundary

**Wrap entire dashboard:**
```typescript
// src/app/dashboard/layout.tsx

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
```

### 4. Wire Up Navigation

**Ensure sidebar links work:**
```typescript
// src/components/Sidebar.tsx

const navItems = [
  { label: 'Mission Control', href: '/dashboard', icon: Target },
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  // ... rest
];

// Active state highlighting
const pathname = usePathname();
const isActive = pathname === item.href;
```

### 5. Responsive Layout Adjustments

**Mobile breakpoints:**
```typescript
// Adjust grid on mobile
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <AgentDistributionSection />
  <ActiveCrisesPanel />
</div>
```

---

## Integration Checklist

- [ ] All 5 components imported and rendered in `page.tsx`
- [ ] Paradigm drill-down state managed (selectedParadigm)
- [ ] Loading states show spinner while data fetches
- [ ] Error boundary catches component failures
- [ ] Navigation links work (click System Health → navigate to detail)
- [ ] Responsive layout (stacks on mobile)
- [ ] Page title and metadata set
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All components receive correct props

---

## Acceptance Criteria

✅ Dashboard page loads without errors
✅ All 5 sections render with data
✅ Paradigm drill-down opens/closes correctly
✅ Click navigation items → navigate to other dashboards
✅ Loading spinner shows during data fetch
✅ Error boundary catches crashes
✅ Responsive on mobile (stacks vertically)
✅ No layout shift or jank

---

## Deliverables

**Files:**
- `src/app/dashboard/page.tsx` (~80 lines)
- Modified: `src/app/dashboard/layout.tsx` (error boundary)
- Modified: `src/components/Sidebar.tsx` (active state)

---

**Last Updated:** October 22, 2025
