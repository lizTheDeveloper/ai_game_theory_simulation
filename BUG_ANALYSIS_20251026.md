# Bug Analysis Report - October 26, 2025

**Analysis Method:** Root cause analysis (no defensive fallbacks)

## Summary

Found 6 bugs through systematic analysis:
- **2 TypeScript compilation errors** (blocking compilation)
- **2 TypeScript type mismatches** (blocking compilation)
- **1 logging inconsistency** (missing context)
- **1 misleading warning message** (confusing but harmless)

---

## Priority 1: TypeScript Compilation Blockers

### Bug #3: Function Signature Mismatch in `init()`
**Severity:** CRITICAL (blocks compilation)
**Location:** `src/lib/contexts/SimulationWorkerContext.tsx`

**Root Cause:**
- **Interface definition (line 42):** Declares 6 parameters
  ```typescript
  init: (seed, scenario, speed, alignmentConfig?, climatePriorityConfig?, thresholdOverrides?) => void
  ```
- **Implementation (line 155):** Actually accepts 7 parameters
  ```typescript
  const init = (seedValue, scenarioValue, speed, alignmentConfig?, climatePriorityConfig?, thresholdOverrides?, speculativeScenario?) => {...}
  ```
- **Call site (Navigation.tsx:74):** Passes 7 arguments
  ```typescript
  init(configSeed, configScenario, configSpeed, alignmentConfig, climatePriorityConfig, configThresholdOverrides, configSpeculativeScenario)
  ```

**Why It Happened:**
The implementation added a 7th parameter (`speculativeScenario`) but the interface definition wasn't updated to match. TypeScript catches this at compile time.

**Impact:**
- TypeScript compilation fails
- Type safety is broken for this function
- Prevents builds from succeeding

**Fix:**
Update the interface definition to include the 7th parameter:
```typescript
init: (seed: number, scenario: ScenarioMode, speed: number,
       alignmentConfig?: AlignmentDynamicsConfig,
       climatePriorityConfig?: ClimatePriorityConfig,
       thresholdOverrides?: ThresholdOverrides,
       speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia') => void
```

---

### Bug #6: Wrong Import Name
**Severity:** CRITICAL (blocks compilation)
**Location:** `src/simulation/thresholds/config.ts:14`

**Root Cause:**
```typescript
import type { AllThresholds, ScenarioName, SliderSettings } from './index';
```

The type is named `Thresholds` in `index.ts:22`, not `AllThresholds`:
```typescript
export type Thresholds = ResearchBackedThresholds & HistoricalThresholds;
```

**Why It Happened:**
The type was likely renamed from `AllThresholds` to `Thresholds` but this import wasn't updated.

**Impact:**
- TypeScript compilation fails
- Module can't be imported

**Fix:**
Change the import to use the correct name:
```typescript
import type { Thresholds, ScenarioName, SliderSettings } from './index';
```

---

## Priority 2: TypeScript Type Mismatches

### Bug #4: Missing Return Statement in useEffect
**Severity:** HIGH (blocks compilation with strict types)
**Location:** `src/components/dashboards/SimulationPersistenceManager.tsx:61`

**Root Cause:**
The useEffect hook has inconsistent return types:
```typescript
useEffect(() => {
  if (showAutoResume && autoResumeCountdown > 0) {
    const timer = setTimeout(() => {
      setAutoResumeCountdown(autoResumeCountdown - 1)
    }, 1000)
    return () => clearTimeout(timer)  // ✓ Returns cleanup function
  } else if (showAutoResume && autoResumeCountdown === 0 && selectedSimulation) {
    handleResumeSimulation(selectedSimulation.id)
    // ✗ No return statement - implicit undefined
  }
}, [showAutoResume, autoResumeCountdown, selectedSimulation])
```

**Why It Happened:**
The first branch returns a cleanup function, but the second branch doesn't return anything. TypeScript's `noImplicitReturns` flag catches this inconsistency.

**Impact:**
- TypeScript compilation fails with strict settings
- Code logic is actually fine (the second branch doesn't need cleanup), but type consistency is violated

**Fix:**
Either:
1. Split into two separate useEffects (cleaner)
2. Explicitly return `undefined` in the second branch
3. Add an empty return statement

**Recommended fix:**
```typescript
// First useEffect: countdown timer
useEffect(() => {
  if (showAutoResume && autoResumeCountdown > 0) {
    const timer = setTimeout(() => {
      setAutoResumeCountdown(autoResumeCountdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }
}, [showAutoResume, autoResumeCountdown])

// Second useEffect: auto-resume action
useEffect(() => {
  if (showAutoResume && autoResumeCountdown === 0 && selectedSimulation) {
    handleResumeSimulation(selectedSimulation.id)
  }
}, [showAutoResume, autoResumeCountdown, selectedSimulation])
```

---

### Bug #5: Invalid ScenarioMode Values
**Severity:** HIGH (blocks compilation)
**Location:** `src/components/dashboards/SimulationPersistenceManager.tsx:214-220`

**Root Cause:**
ScenarioMode is defined as:
```typescript
// src/types/config.ts:10
export type ScenarioMode = 'historical' | 'unprecedented';
```

But the code tries to use additional values:
```typescript
const names: Record<ScenarioMode, string> = {
  historical: 'Historical Events',
  optimistic: 'Optimistic',        // ✗ Not in ScenarioMode
  pessimistic: 'Pessimistic',      // ✗ Not in ScenarioMode
  'utopia-sprint': 'Utopia Sprint', // ✗ Not in ScenarioMode
  'controlled-risks': 'Controlled Risks' // ✗ Not in ScenarioMode
}
```

**Why It Happened:**
Either:
1. The ScenarioMode type definition is outdated and missing these values
2. This code is using the wrong type (maybe should be a different enum)
3. These scenario modes were removed but this code wasn't updated

**Impact:**
- TypeScript compilation fails
- Type safety is broken for scenario modes

**Fix Options:**
1. **If these modes should exist:** Update ScenarioMode type definition
   ```typescript
   export type ScenarioMode = 'historical' | 'unprecedented' | 'optimistic' | 'pessimistic' | 'utopia-sprint' | 'controlled-risks';
   ```

2. **If these modes are obsolete:** Remove them from the Record
   ```typescript
   const names: Partial<Record<ScenarioMode, string>> = {
     historical: 'Historical Events',
     unprecedented: 'Unprecedented Events'
   }
   ```

**Investigation Needed:**
Check git history to determine if these scenario modes were intentionally removed or if the type definition is incomplete.

---

## Priority 3: Non-Critical Issues

### Bug #1: Missing Month Prefix in Refugee Crisis Logging
**Severity:** LOW (cosmetic logging issue)
**Location:** `src/simulation/refugeeCrises.ts:499`

**Root Cause:**
The console.log statement doesn't include the month prefix:
```typescript
// Line 499 (WRONG)
console.log(`🚨 NEW REFUGEE CRISIS: ${crisis.cause.toUpperCase()}`);

// Other files use this pattern (CORRECT)
console.log(`\n🚨 EMERGENCY RESPONSE DEPLOYED (Month ${state.currentMonth})`);
```

The function `checkRefugeeCrisisTriggers(state: GameState)` has access to `state.currentMonth` but doesn't use it.

**Why It Happened:**
Inconsistent logging pattern - most other simulation logs include the month, but this one was missed.

**Impact:**
- Log output shows "Month undefined" instead of actual month number
- Makes debugging harder (can't correlate refugee crises with simulation timeline)
- No functional impact on simulation logic

**Fix:**
```typescript
console.log(`🚨 NEW REFUGEE CRISIS (Month ${state.currentMonth}): ${crisis.cause.toUpperCase()}`);
```

---

### Bug #2: Misleading Warning Message
**Severity:** TRIVIAL (confusing but harmless)
**Location:** `src/simulation/techTree/engine.ts:340`

**Root Cause:**
The warning message says:
```typescript
console.log(`   This WIPES all existing deployments in this region!`);
```

But the code only creates a new array when the region **doesn't exist yet**:
```typescript
const regionExisted = action.targetRegion in techTreeState.regionalDeployment;
if (!regionExisted) {  // Only runs if region is NEW
  console.log(`\n🚨 CREATING NEW REGIONAL ARRAY for ${action.targetRegion} (Month ${_gameState.currentMonth})`);
  console.log(`   This WIPES all existing deployments in this region!`);  // MISLEADING
  techTreeState.regionalDeployment[action.targetRegion] = [];
}
```

**Why It Happened:**
The warning was written assuming this code might overwrite existing data, but the conditional guard (`!regionExisted`) prevents that.

**Impact:**
- Logs look alarming but no actual data is lost
- May cause unnecessary debugging concern
- No functional impact

**Fix:**
Change warning to be accurate:
```typescript
console.log(`   Creating new regional deployment array (no previous deployments)`);
```

Or simply remove the warning since it's expected behavior for new regions.

---

## Testing Methodology

**How These Bugs Were Found:**

1. **Ran test simulation** (`npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=60`)
2. **Examined log files** for error patterns:
   - Searched for "Month undefined", "NaN", "Error", "Exception"
   - Found Bug #1 (missing month prefix)
   - Found Bug #2 (misleading warning)

3. **Ran TypeScript compiler** (`npx tsc --noEmit`)
   - Found Bugs #3, #4, #5, #6 (compilation errors)

4. **Root cause analysis** for each bug:
   - Read source code at error locations
   - Traced data flow and function signatures
   - Identified WHY the bug occurred (not just WHAT the symptom is)

**No defensive fallbacks used** - all bugs traced to root cause.

---

## Recommended Fix Priority

1. **Fix Bugs #3 and #6 first** - They block TypeScript compilation
2. **Fix Bugs #4 and #5 next** - They block strict compilation and type safety
3. **Fix Bug #1** - Improves debugging experience
4. **Fix Bug #2 last** - Purely cosmetic, no functional impact

---

## Additional Notes

### What Was NOT Found:
- No NaN generation bugs (previous NaN issues appear to be resolved)
- No assertion failures in recent test runs
- No memory crashes or segfaults
- No undefined access errors at runtime

### Recent Work:
Based on git status, there's been recent work on:
- Alignment dynamics (`alignment-dynamics.md`, `AlignmentTechniquePhase.ts`)
- Regional aggregation (`regional-aggregation-refactor.md`)
- Threshold uncertainty UI (`threshold-uncertainty-ui-plan.md`)
- Dashboard architecture (`DASHBOARD_AUDIT_OCT26_2025.md`)

These recent changes may have introduced Bugs #3-#5 if they involved changing function signatures or types.
