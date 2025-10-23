# Subplan -1A: API Infrastructure

**Phase:** -1 (Server-Side Aggregation API)
**Agent Assignment:** Agent 1
**Duration:** 1-2 days
**Priority:** CRITICAL (blocks all other dashboard work)
**Dependencies:** None (can start immediately)

---

## Context & Research

**Problem:** Loading full GameState in browser causes memory exhaustion (1.44M data points)
**Solution:** Server-side aggregation API serving pre-computed summaries

### Key Documents

- **Architecture Review:** `reviews/dashboard_architecture_20251022.md` (CRITICAL Issue #1: Memory exhaustion)
- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (API requirements)
- **Research:** `research/dashboard_visualization_best_practices_20251022.md` (Performance benchmarks)
- **Master Roadmap:** `plans/FRONTEND_ROADMAP.md` (Phase -1 overview)

### Architecture Decision

**NOT THIS (causes crashes):**
```typescript
// ❌ BAD - Load full GameState in browser
const state = await fetch('/api/state').then(r => r.json());
// 900+ lines × 120 months × 15 regions × 20 agents = 1GB+ RAM
```

**DO THIS (performant):**
```typescript
// ✅ GOOD - Server-side aggregation
const overview = await fetch('/api/dashboard/overview').then(r => r.json());
// Returns pre-computed summary (50KB instead of 1GB)
```

---

## Objectives

Create the foundational API infrastructure for dashboard data aggregation:

1. **Route Structure:** Establish `/api/dashboard/` endpoints
2. **Caching:** Implement efficient caching strategy (in-memory or Redis)
3. **Authentication:** Basic auth/CORS setup (if needed)
4. **Error Handling:** Consistent error responses
5. **Performance Monitoring:** Request timing and logging
6. **Type Safety:** TypeScript schemas for all responses

---

## Technical Implementation

### 1. Directory Structure

Create the following structure:

```
src/app/api/dashboard/
├── route.ts                    # Root endpoint (metadata)
├── overview/
│   └── route.ts                # Mission control data
├── paradigms/
│   ├── route.ts                # All 4 paradigms
│   └── [id]/
│       └── route.ts            # Individual paradigm drill-down
├── critical-metrics/
│   └── route.ts                # Population, QoL, AI, crises
├── agents/
│   ├── route.ts                # All agent data
│   └── [id]/
│       └── route.ts            # Individual agent details
├── environment/
│   └── route.ts                # Planetary boundaries
├── government/
│   ├── route.ts                # 30 countries overview
│   └── [countryId]/
│       └── route.ts            # Individual country details
├── crises/
│   └── route.ts                # Crisis cascade data
├── technology/
│   ├── route.ts                # Tech tree
│   └── [techId]/
│       └── route.ts            # Technology details
└── history/
    └── route.ts                # Time series data

src/lib/api/
├── cache.ts                    # Caching utilities
├── errors.ts                   # Error handling
├── monitoring.ts               # Performance tracking
└── types.ts                    # Response type definitions
```

### 2. Core Infrastructure Files

**`src/lib/api/cache.ts`** - Caching Layer
```typescript
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max: number;           // Max items
  ttl: number;           // Time to live (ms)
  updateAgeOnGet: boolean;
}

// In-memory cache for API responses
const cache = new LRUCache<string, any>({
  max: 500,              // Max 500 cached responses
  ttl: 1000 * 60 * 5,    // 5 minute TTL
  updateAgeOnGet: true,  // Refresh on access
});

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
  } else {
    // Invalidate keys matching pattern
    const keys = Array.from(cache.keys());
    keys.filter(k => k.includes(pattern)).forEach(k => cache.delete(k));
  }
}

export function getCacheStats() {
  return {
    size: cache.size,
    max: cache.max,
    hits: cache.calculatedSize,
  };
}
```

**`src/lib/api/errors.ts`** - Error Handling
```typescript
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('[API Error]', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function validateRequired(params: Record<string, any>, required: string[]) {
  const missing = required.filter(key => params[key] === undefined);
  if (missing.length > 0) {
    throw new ApiError(400, `Missing required parameters: ${missing.join(', ')}`);
  }
}
```

**`src/lib/api/monitoring.ts`** - Performance Monitoring
```typescript
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();

  start(label: string): void {
    this.timers.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.timers.get(label);
    if (!start) return 0;

    const duration = performance.now() - start;
    this.timers.delete(label);

    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

export const monitor = new PerformanceMonitor();
```

**`src/lib/api/types.ts`** - Response Type Definitions
```typescript
// Base response structure
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    cached: boolean;
    executionTime: number; // milliseconds
  };
}

// Error response structure
export interface ApiErrorResponse {
  error: string;
  details?: any;
  timestamp: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Time series parameters
export interface TimeSeriesParams {
  range?: number;      // Number of months (default: 12)
  startMonth?: number; // Start from specific month
  endMonth?: number;   // End at specific month
}
```

### 3. Root API Endpoint

**`src/app/api/dashboard/route.ts`** - API Metadata
```typescript
import { NextResponse } from 'next/server';
import { getCacheStats } from '@/lib/api/cache';

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    endpoints: {
      overview: '/api/dashboard/overview',
      paradigms: '/api/dashboard/paradigms',
      'paradigms.detail': '/api/dashboard/paradigms/:id',
      criticalMetrics: '/api/dashboard/critical-metrics',
      agents: '/api/dashboard/agents',
      'agents.detail': '/api/dashboard/agents/:id',
      environment: '/api/dashboard/environment',
      government: '/api/dashboard/government',
      'government.detail': '/api/dashboard/government/:countryId',
      crises: '/api/dashboard/crises',
      technology: '/api/dashboard/technology',
      'technology.detail': '/api/dashboard/technology/:techId',
      history: '/api/dashboard/history',
    },
    cacheStats: getCacheStats(),
    timestamp: new Date().toISOString(),
  });
}
```

### 4. CORS Configuration (if needed)

**`src/middleware.ts`** - CORS Middleware
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow dashboard API requests
  if (request.nextUrl.pathname.startsWith('/api/dashboard')) {
    const response = NextResponse.next();

    // Add CORS headers if needed
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/dashboard/:path*',
};
```

---

## Implementation Tasks

### Step 1: Install Dependencies
```bash
npm install lru-cache
npm install --save-dev @types/lru-cache
```

### Step 2: Create Infrastructure Files
- [ ] `src/lib/api/cache.ts` - LRU cache with 5min TTL
- [ ] `src/lib/api/errors.ts` - Error handling utilities
- [ ] `src/lib/api/monitoring.ts` - Performance tracking
- [ ] `src/lib/api/types.ts` - TypeScript response schemas

### Step 3: Create API Directory Structure
- [ ] `src/app/api/dashboard/route.ts` - Root metadata endpoint
- [ ] Create subdirectories for each domain (overview, paradigms, agents, etc.)

### Step 4: CORS Configuration (optional)
- [ ] `src/middleware.ts` - CORS headers for API routes

### Step 5: Testing
- [ ] Test cache hits/misses with `getCacheStats()`
- [ ] Test error handling with invalid requests
- [ ] Test performance monitoring logs
- [ ] Verify CORS headers (if applicable)

---

## Acceptance Criteria

**✅ Infrastructure is complete when:**

1. **Cache works:**
   - `getCached()` / `setCached()` / `invalidateCache()` functions work
   - 5-minute TTL respected
   - Cache stats endpoint returns size/hits

2. **Error handling works:**
   - `ApiError` throws with correct status codes
   - `handleApiError()` returns consistent JSON format
   - `validateRequired()` catches missing parameters

3. **Performance monitoring works:**
   - `monitor.measure()` logs execution time
   - Console shows `[Performance]` logs with durations

4. **Types are defined:**
   - `ApiResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>` exported
   - No TypeScript errors

5. **API endpoint structure exists:**
   - `/api/dashboard` returns metadata
   - Subdirectories created (even if empty route handlers)

6. **CORS configured (if needed):**
   - Middleware allows cross-origin requests
   - OPTIONS requests handled

---

## Deliverables

### Files Created
- `src/lib/api/cache.ts` (~80 lines)
- `src/lib/api/errors.ts` (~60 lines)
- `src/lib/api/monitoring.ts` (~50 lines)
- `src/lib/api/types.ts` (~60 lines)
- `src/app/api/dashboard/route.ts` (~30 lines)
- `src/middleware.ts` (~30 lines, optional)

### Exports
```typescript
// From src/lib/api/cache.ts
export { getCached, setCached, invalidateCache, getCacheStats };

// From src/lib/api/errors.ts
export { ApiError, handleApiError, validateRequired };

// From src/lib/api/monitoring.ts
export { PerformanceMonitor, monitor };

// From src/lib/api/types.ts
export { ApiResponse, ApiErrorResponse, PaginatedResponse, PaginatedParams, TimeSeriesParams };
```

---

## Coordination

**Check-in Channel:** `.claude/chatroom/channels/implementation.md`

**Status Updates:**
- [ ] Post `[STARTED]` when beginning
- [ ] Post `[IN-PROGRESS]` with file completion updates
- [ ] Post `[COMPLETED]` with test results

**Example Check-in:**
```markdown
---
**agent-api-infrastructure** | 2025-10-22 23:45 | [IN-PROGRESS]

Completed cache and error handling infrastructure.

**Progress:**
✅ cache.ts (LRU with 5min TTL)
✅ errors.ts (ApiError + handleApiError)
✅ monitoring.ts (PerformanceMonitor)
🔄 types.ts (in progress)
⏳ route.ts (pending)

**Next:** Complete response type definitions, create root API endpoint
---
```

---

## Dependencies for Other Agents

This subplan BLOCKS:
- **Subplan -1B** (Aggregation Utilities) - needs cache/error utilities
- **Subplan -1C** (Overview API) - needs route structure + types
- **Subplan -1D** (Domain API) - needs route structure + types

Other agents should wait for `[COMPLETED]` status before starting.

---

## Notes

**Performance Target:** API responses should be <100ms for cached data, <2s for uncached aggregations

**Cache Strategy:** Use cache keys like `dashboard:overview:${simulationId}:${month}` for fine-grained invalidation

**Future Optimization:** Consider Redis for multi-instance deployments (LRU cache is in-memory only)

**Security:** No authentication required for MVP (simulation is single-user). Add JWT tokens in production if needed.

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation
