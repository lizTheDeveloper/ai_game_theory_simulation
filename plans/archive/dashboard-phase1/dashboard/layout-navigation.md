# Subplan 0E: Layout & Navigation

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 5
**Duration:** 1-2 days
**Priority:** HIGH (app structure)
**Dependencies:** Subplan 0A complete (design system)

---

## Context

Create the app layout shell with sidebar navigation for 9 dashboard categories.

---

## Implementation Tasks

### Step 1: App Layout
```typescript
// src/app/dashboard/layout.tsx

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

### Step 2: Sidebar Navigation
```typescript
// src/components/Sidebar.tsx

const navItems = [
  { label: 'Mission Control', href: '/dashboard', icon: Target },
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Environment', href: '/dashboard/environment', icon: Leaf },
  { label: 'Government', href: '/dashboard/government', icon: Building },
  { label: 'Crises', href: '/dashboard/crises', icon: AlertTriangle },
  { label: 'Technology', href: '/dashboard/technology', icon: Zap },
  { label: 'Welfare', href: '/dashboard/welfare', icon: Heart },
  { label: 'Timeline', href: '/dashboard/timeline', icon: Clock },
  { label: 'Analysis', href: '/dashboard/analysis', icon: BarChart },
];
```

### Step 3: Route Structure
```
src/app/dashboard/
├── page.tsx              # Mission Control
├── agents/
│   ├── page.tsx
│   └── [id]/page.tsx
├── environment/page.tsx
├── government/
│   ├── page.tsx
│   └── [countryId]/page.tsx
├── crises/page.tsx
├── technology/page.tsx
├── welfare/page.tsx
├── timeline/page.tsx
└── analysis/page.tsx
```

---

## Acceptance Criteria

✅ Sidebar renders with 9 navigation items
✅ Active route highlighted
✅ Smooth navigation transitions
✅ Responsive layout (sidebar collapses on mobile)
✅ Loading states per page
✅ Breadcrumbs show current path

---

## Deliverables

**Files:**
- `src/app/dashboard/layout.tsx` (~50 lines)
- `src/components/Sidebar.tsx` (~120 lines)
- `src/components/Breadcrumbs.tsx` (~60 lines)
- 9 page route files (placeholders)

---

**Last Updated:** October 22, 2025
