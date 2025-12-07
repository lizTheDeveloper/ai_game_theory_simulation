# Subplan 0C: State Management Setup

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 3
**Duration:** 1-2 days
**Priority:** CRITICAL (architecture decision)
**Dependencies:** Phase -1 complete (API endpoints exist)

---

## Context

**CRITICAL ARCHITECTURE CHANGE:** Use Jotai (atomic stores) + React Query, NOT single Zustand store.

### Why NOT Zustand

**From Architecture Review (CRITICAL Issue #2):**
> "Single Zustand store with full GameState causes re-render cascades across 40+ components. Every state update triggers ALL visualizations to re-render, freezing the UI."

### Why Jotai + React Query

- **Atomic stores:** Each component subscribes only to data it needs
- **Server state:** React Query handles caching, refetching, stale data
- **Performance:** No global re-render cascades
- **Type-safe:** Full TypeScript support

---

## Implementation Tasks

### Step 1: Install Dependencies
```bash
npm install jotai react-query
npm install --save-dev @tanstack/react-query-devtools
```

### Step 2: Create Query Client
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

### Step 3: Create Data Hooks
```typescript
// src/hooks/useOverviewData.ts
import { useQuery } from '@tanstack/react-query';

export function useOverviewData() {
  return useQuery(['dashboard', 'overview'], async () => {
    const res = await fetch('/api/dashboard/overview');
    if (!res.ok) throw new Error('Failed to fetch overview');
    return res.json();
  });
}

// Similar hooks for:
// - useParadigmData()
// - useAgentData()
// - useEnvironmentData()
// - useCriticalMetrics()
```

### Step 4: Wrap App with Providers
```typescript
// src/app/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

## Acceptance Criteria

✅ Jotai + React Query installed
✅ Query client configured (5min stale time)
✅ Data hooks created for all domains
✅ App wrapped with QueryClientProvider
✅ No Zustand store created
✅ Devtools available in development

---

## Deliverables

**Files:**
- `src/lib/queryClient.ts` (~30 lines)
- `src/hooks/useOverviewData.ts` (~20 lines each × 5 hooks)
- Modified: `src/app/layout.tsx`

---

**Last Updated:** October 22, 2025
