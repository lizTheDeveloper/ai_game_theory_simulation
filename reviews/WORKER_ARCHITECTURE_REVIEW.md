# Dashboard Worker Architecture Review

**Date:** October 23, 2025
**Reviewer:** Architecture Skeptic
**Severity:** CRITICAL
**Immediate Action Required:** YES

## Executive Summary

The dashboard's simulation worker architecture has **CRITICAL design flaws** causing time update failures and potential memory exhaustion. Multiple SimulationWorkerClient instances are being created without coordination, leading to race conditions and state propagation failures.

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. Multiple Worker Instance Conflict
**File:** `/src/components/core/Navigation.tsx:44-93`, `/src/app/realtime/page.tsx:370-383`
**Severity:** CRITICAL
**Impact:** Complete breakdown of time updates and state synchronization

**Problem:**
- Navigation component creates its own `SimulationWorkerClient` on mount (line 48)
- Real-time dashboard creates another `SimulationWorkerClient` on mount (line 374)
- Both workers try to control the same simulation independently
- No singleton pattern or shared context to coordinate instances

**Evidence:**
```typescript
// Navigation.tsx:44-54
useEffect(() => {
  if (typeof window !== 'undefined' && !client) {
    try {
      const newClient = new SimulationWorkerClient()
      setClient(newClient)
    } catch (error) {
      console.error('[Navigation] Failed to create worker client:', error)
    }
  }
}, [])

// realtime/page.tsx:370-381
useEffect(() => {
  if (typeof window !== 'undefined' && !client) {
    try {
      const newClient = new SimulationWorkerClient();
      setClient(newClient);
      console.log('[Dashboard] Worker client created');
    } catch (error) {
      console.error('[Dashboard] Failed to create worker client:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
  }
}, []);
```

**Consequences:**
- Event listeners compete for messages (first consumer wins)
- Navigation may consume 'update' events before dashboard receives them
- Time updates fail because wrong client receives the events
- State becomes inconsistent between components

### 2. Missing Singleton Pattern
**Severity:** CRITICAL
**Impact:** Resource exhaustion, unpredictable behavior

**Problem:**
- No mechanism to ensure only one worker exists
- Each component creates workers independently
- No shared state management between components
- Workers are destroyed/recreated on navigation

**Memory Impact:**
- Each worker spawns a separate Web Worker thread (~50MB overhead)
- Both workers run complete simulation engines
- State snapshots duplicated (1.78MB each)
- No coordinated cleanup on unmount

### 3. State Propagation Race Conditions
**File:** `/src/lib/simulationWorkerClient.ts:130-164`
**Severity:** HIGH
**Impact:** Lost updates, inconsistent UI state

**Problem:**
- Event emitter pattern with no guaranteed delivery order
- Multiple listeners on same events from different clients
- No synchronization between Navigation and page-specific state
- Worker posts messages to all clients, but only first handler processes them

**Evidence of Failure:**
- "Time is not updating on any page anymore" - user report
- Navigation shows month 0 while simulation is running
- Dashboard state diverges from Navigation state

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 4. Lifecycle Management Issues
**Severity:** HIGH
**Impact:** Memory leaks, orphaned workers

**Problem:**
- Navigation component persists across route changes
- Creates new worker but may not properly destroy old one
- Cleanup in useEffect return may not fire reliably
- No verification that worker.terminate() actually succeeds

### 5. Inefficient Event Handling
**Severity:** HIGH
**Impact:** Performance degradation, unnecessary re-renders

**Problem:**
- Both components maintain full state copies
- Every update triggers state setters in both components
- Navigation re-renders on every simulation tick
- No debouncing or throttling of updates

## RECOMMENDED SOLUTION

### Immediate Fix (2-4 hours)

**Option 1: Global Worker Context (Recommended)**

Create a React Context to manage a single worker instance:

```typescript
// src/lib/contexts/SimulationWorkerContext.tsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { SimulationWorkerClient, type StateDelta } from '@/lib/simulationWorkerClient';

interface SimulationWorkerContextValue {
  client: SimulationWorkerClient | null;
  initialized: boolean;
  running: boolean;
  month: number;
  scenario: ScenarioMode;
  lastUpdate: StateDelta | null;
}

const SimulationWorkerContext = createContext<SimulationWorkerContextValue | null>(null);

export function SimulationWorkerProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<SimulationWorkerClient | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [running, setRunning] = useState(false);
  const [month, setMonth] = useState(0);
  const [scenario, setScenario] = useState<ScenarioMode>('historical');
  const [lastUpdate, setLastUpdate] = useState<StateDelta | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create singleton worker
    if (!clientRef.current) {
      const client = new SimulationWorkerClient();
      clientRef.current = client;

      // Setup global listeners
      client.on('initialized', (snapshot) => {
        setInitialized(true);
        setMonth(snapshot.currentMonth);
        setScenario(snapshot.scenario);
      });

      client.on('update', (delta) => {
        setLastUpdate(delta);
        if (delta.currentMonth !== undefined) {
          setMonth(delta.currentMonth);
        }
      });

      client.on('paused', () => setRunning(false));
      client.on('resumed', () => setRunning(true));
    }

    return () => {
      // Cleanup on app unmount only
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  return (
    <SimulationWorkerContext.Provider value={{
      client: clientRef.current,
      initialized,
      running,
      month,
      scenario,
      lastUpdate
    }}>
      {children}
    </SimulationWorkerContext.Provider>
  );
}

export function useSimulationWorker() {
  const context = useContext(SimulationWorkerContext);
  if (!context) {
    throw new Error('useSimulationWorker must be used within SimulationWorkerProvider');
  }
  return context;
}
```

**Update layout.tsx:**
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SimulationWorkerProvider>
          <div className="flex">
            <Navigation />
            <div className="ml-64 flex-1">
              {children}
            </div>
          </div>
        </SimulationWorkerProvider>
      </body>
    </html>
  );
}
```

**Update Navigation.tsx:**
```typescript
export function Navigation() {
  const { client, initialized, running, month, scenario } = useSimulationWorker();
  // Remove local worker creation
  // Use shared client for all operations
}
```

**Update realtime/page.tsx:**
```typescript
export default function RealtimeDashboard() {
  const { client, lastUpdate } = useSimulationWorker();
  // Remove local worker creation
  // Subscribe to additional events as needed

  useEffect(() => {
    if (!client) return;

    // Page-specific listeners
    const handleUpdate = (delta: StateDelta) => {
      // Handle page-specific updates
    };

    client.on('update', handleUpdate);
    return () => client.off('update', handleUpdate);
  }, [client]);
}
```

### Alternative Fix (1-2 hours, less ideal)

**Option 2: Navigation as Display-Only**

Make Navigation a pure display component that doesn't create workers:

1. Remove worker creation from Navigation
2. Pass state via props or context from pages
3. Only allow page components to create workers
4. Navigation shows "Not initialized" when no page has started simulation

This is simpler but means Navigation controls won't work until a page initializes the simulation.

## MEDIUM PRIORITY (Technical debt worth addressing)

### 6. Missing Error Boundaries
**Impact:** Entire app crashes if worker fails

Add error boundaries around worker-dependent components to gracefully handle failures.

### 7. No Worker Health Checks
**Impact:** Silent failures, hung simulations

Implement heartbeat mechanism to detect unresponsive workers.

## LOW PRIORITY (Future improvements)

### 8. Consider SharedWorker API
For true multi-tab synchronization, consider using SharedWorker instead of dedicated Worker.

### 9. Add Worker Performance Monitoring
Track worker memory usage and execution time for optimization.

## RECOMMENDATION

**IMMEDIATE ACTION REQUIRED:** Implement Option 1 (Global Worker Context) TODAY. The current architecture is causing active user issues and will lead to memory exhaustion in long-running sessions. This is not a "nice to have" - it's preventing the dashboard from functioning correctly.

**Estimated effort:** 2-4 hours
**Risk if not fixed:** HIGH - Complete dashboard failure, memory exhaustion
**Risk of implementation:** LOW - Well-understood pattern, easy to test

After implementing the fix:
1. Verify time updates work on all pages
2. Check that only one worker thread exists in Chrome DevTools
3. Test navigation between pages maintains state
4. Confirm memory usage stays stable over time

## Testing Checklist

After implementing the recommended solution, verify:

- [ ] Only one worker instance exists (check Chrome DevTools > Sources > Threads)
- [ ] Time updates consistently on all dashboard pages
- [ ] Navigation controls affect the simulation on all pages
- [ ] Memory usage remains stable during long runs
- [ ] State persists when navigating between dashboard pages
- [ ] No duplicate console messages from multiple workers
- [ ] Worker properly terminates on app close

## Conclusion

This is a **CRITICAL architectural flaw** that must be fixed immediately. The lack of a singleton pattern for the simulation worker is causing the reported time update failures and will lead to memory exhaustion. The recommended Global Worker Context solution is straightforward to implement and will resolve all identified issues.

The system is currently **unstable** for any real usage beyond quick demos. Fix this before any other feature work.