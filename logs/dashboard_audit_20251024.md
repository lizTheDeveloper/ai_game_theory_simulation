# Dashboard Wiring Audit - October 24, 2025

**Purpose:** Systematic review of dashboard components to identify metrics/features that don't appear to be connected to live simulation data or aren't updating.

**Method:** Used Playwright MCP to navigate live dashboard at http://localhost:3333 and observe behavior

**Status:** CRITICAL BLOCKER FOUND - Simulation crashes on every step

---

## 🚨 CRITICAL BLOCKER - FIXED

### Simulation Crashes Every Step ✅ RESOLVED
**Location:** `src/simulation/engine/phases/EvolutionarySelectionPhase.ts:56`

**Error:**
```
❌ ERROR in phase "Evolutionary Selection" (evolutionary_selection):
TypeError: Cannot read properties of undefined (reading 'controlLevel')
    at Object.executeEvolutionarySelectionPhase
```

**Root Cause:**
- EvolutionarySelectionPhase tried to access `state.government.aiGovernance.controlLevel`
- `aiGovernance` object was never initialized in `src/simulation/initialization.ts`
- CollectiveActionsPhase also uses `state.government.aiGovernance` (found via grep)

**Fix Applied (Oct 24, 2025):**
1. Added `aiGovernance` object to government initialization:
   ```typescript
   aiGovernance: {
     controlLevel: 0.5,  // Baseline government control over AI systems
     oversightInvestment: 0,  // Investment in oversight/detection
   }
   ```
   Location: `src/simulation/initialization.ts:469-472`

2. Added optional chaining to EvolutionarySelectionPhase for safety:
   ```typescript
   const controlLevel = state.government.aiGovernance?.controlLevel || 0;
   const detectionCapability = (state.government.aiGovernance?.oversightInvestment || 0) / 100;
   ```

**Verification:**
- ✅ Simulation initializes successfully (QoL=0.65, population=8B, aiCount=20)
- ✅ Time advances without crashes (Day counter: 1 → 25)
- ✅ No console errors
- ❌ **NEW ISSUE: Dashboard metrics still show zeros** (separate wiring problem)

---

## 🔍 DASHBOARD WIRING ISSUE

### Metrics Not Updating Despite Simulation Running
**Observed:** Dashboard shows all zeros even though simulation is running successfully

**Evidence:**
- Simulation steps forward (Day: 1 → 25) ✅
- No console errors ✅
- But all metrics stuck at 0 or default values:
  - Quality of Life: 0.0 (should be ~0.65)
  - AI Capability: 0.00
  - Alignment Score: 0.00
  - AI Agents: 0 active (should be 20)
  - Organizations: 0 operational
  - All paradigm scores: 50.0 (defaults)

**Hypothesis:** Dashboard components are polling `/api/simulation/current` which returns stub data:
```json
{
  "message": "No simulation running. Click 'Configure & Start' to begin.",
  "data": { "currentMonth": 0, "aiAgents": [] }
}
```

**Expected Behavior:** Dashboards should use `useSimulationWorker()` hook to get live state from Web Worker

**Root Cause Identified:**
- `OverviewDashboard.tsx` uses `useSimulation()` hook (line 13)
- `useSimulation()` calls `/api/simulation/current` which returns stub data (line 24)
- Should use `useSimulationWorker()` hook instead, which provides `lastUpdate: StateDelta`

**StateDelta interface provides all needed metrics:**
- qualityOfLife, population, aiCount, avgAICapability
- dystopiaProgression, climateChange, socialCohesion
- planetaryBoundariesCrossed, institutionalTrust, etc.
- Location: `src/lib/simulationWorkerClient.ts:17-90`

**Fix Required:**
Replace `useSimulation()` → `useSimulationWorker()` in dashboard components:
```typescript
// OLD (broken):
const { currentState, loadCurrent, error } = useSimulation()

// NEW (working):
const { lastUpdate, initialized } = useSimulationWorker()
```

**Next Steps:**
1. Migrate OverviewDashboard.tsx to useSimulationWorker()
2. Check all other dashboard components (Paradigms, AIAgents, Crises, etc.)
3. Verify metrics update in real-time

---

## Issues Found

### 1. **AIAgentsDashboard.tsx - Duplicate Variable Names (BREAKING)**
**Location:** `src/components/dashboards/AIAgentsDashboard.tsx:524-531`

**Issue:** Sankey diagram code has duplicate `const` declarations causing compile errors:
- `training`, `testing`, `closed`, `open`, `retired`, `escaped`, `createFlow` all defined multiple times

**Impact:** Page won't load at all - 500 error

**Status:** CRITICAL - Blocks entire AI Agents page

---

### 2. **API Endpoint Returns Stub Data**
**Location:** `src/app/api/simulation/current/route.ts`

**Issue:** All dashboards call `/api/simulation/current` which now returns:
```typescript
{
  message: 'No simulation running. Click "Configure & Start" to begin.',
  data: {
    currentMonth: 0,
    aiAgents: [],
  }
}
```

**Impact:** Dashboards show empty/zero state until Web Worker is initialized

**Status:** BY DESIGN - User must click "Configure & Start" to initialize simulation

---

### 3. **Dashboards Using Old API Pattern**
**Files to check:**
- `src/components/dashboards/AIAgentsDashboard.tsx`
- `src/components/dashboards/ParadigmsDashboard.tsx`
- `src/components/dashboards/CrisesDashboard.tsx`
- `src/components/dashboards/EnvironmentDashboard.tsx`
- All other dashboard files

**Pattern:** Most dashboards fetch from `/api/simulation/current` on interval, but don't subscribe to Web Worker updates

**Expected:** Dashboards should use `useSimulationWorker()` hook from `SimulationWorkerContext` to get live updates

**Impact:** Dashboards may show stale/empty data even after simulation starts

---

## Dashboards to Audit

Will check each dashboard for:
1. ✅ Uses `useSimulationWorker()` hook (GOOD)
2. ❌ Polls `/api/simulation/current` (OLD PATTERN - may not work)
3. ❓ Has metrics that never change
4. ❓ Has placeholder/hardcoded values

### Dashboard Checklist

- [ ] `/dashboard` (Overview) - Need to check
- [ ] `/ai-agents` (AI Agents Dashboard) - BROKEN (compile error)
- [ ] `/paradigms` (Paradigms Dashboard) - Need to check
- [ ] `/crises` (Crises Dashboard) - Need to check
- [ ] `/environment` (Environment Dashboard) - Need to check
- [ ] `/tech-tree` (Tech Tree) - Need to check
- [ ] `/detection` (Detection) - Need to check
- [ ] `/regions` (Regions) - Need to check
- [ ] `/timeline` (Timeline) - Need to check
- [ ] `/realtime` (Real-Time) - Need to check

---

## Next Steps

1. Fix AIAgentsDashboard Sankey diagram duplicate variables (URGENT)
2. Audit each dashboard file to check data source pattern
3. Migrate dashboards from API polling to Web Worker hook
4. Document metrics that are computed but never change
