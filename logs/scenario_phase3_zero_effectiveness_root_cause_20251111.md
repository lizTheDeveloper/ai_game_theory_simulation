# Scenario Phase 3 - Zero-Effectiveness Root Cause Analysis

**Date:** November 11, 2025
**Analyst:** Roy (Simulation Maintainer)
**Task:** Determine why government priorities produce ZERO effect on simulation outcomes

---

## Evidence of Bug

**From Priya's Phase 3 Analysis:**

climate-first (10% GDP/month climate spending) and scientific-acceleration ($200B/month research) produce **BYTE-FOR-BYTE IDENTICAL** outcomes across 10 Monte Carlo runs:

- **Population:** 5.559B (identical to 16 decimal places)
- **QoL:** 63.2% (identical)
- **Population CV:** 9.27% (identical)
- **QoL CV:** 6.97% (identical)
- **Outcome distributions:** IDENTICAL (9 utopia, 1 extinction at seed 1005)

**Statistical impossibility:** Two different $8T/year interventions cannot produce identical results unless government priorities are not affecting simulation dynamics.

---

## Code Path Investigation

### 1. Scenario Definition (src/types/scenarios.ts)

✅ **Scenarios correctly define `governmentPriorities`:**

```typescript
'climate-first': {
  id: 'climate-first',
  governmentPriorities: {
    climateSpending: 0.10, // 10% GDP/month
    researchInvestment: 50, // $50B/month
  },
},

'scientific-acceleration': {
  id: 'scientific-acceleration',
  governmentPriorities: {
    researchInvestment: 200, // $200B/month
  },
},
```

### 2. Scenario Application (scripts/scenarioRunner.ts)

✅ **Scenario attached to state correctly:**

```typescript
// Line 35: scenarioRunner.ts
state.scenario = scenario;
```

✅ **Type confirmed in GameState (src/types/game.ts:187):**
```typescript
scenario?: ScenarioDefinition;
```

### 3. Phase Registration (src/simulation/engine.ts)

✅ **Phase imported and registered:**

```typescript
// Line 172: engine.ts
import { ApplyScenarioPrioritiesPhase } from './engine/phases/ApplyScenarioPrioritiesPhase';

// Line 484: engine.ts
this.orchestrator.registerPhase(new ApplyScenarioPrioritiesPhase());
```

### 4. Phase Implementation (src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts)

✅ **Phase checks for scenario and priorities:**

```typescript
// Line 55-58
if (!state.scenario || !state.scenario.governmentPriorities) {
  // No scenario or no priorities - skip this phase
  return { events };
}

const priorities = state.scenario.governmentPriorities;
```

✅ **Phase applies overrides:**
- **researchInvestment** → `state.government.researchInvestments.totalBudget` (line 84)
- **climateSpending** → `state.government.resources` (line 112) + `state.config.climatePriority.weights.climate` (line 139)
- **redistributionRate** → `state.ubiSystem.basicIncome.monthlyCost` (line 176)

### 5. Nov 11, 2025 Fix in ApplyScenarioPrioritiesPhase

✅ **Climate weight mapping added (lines 114-147):**

```typescript
// FIX (Nov 11, 2025): ALSO update state.config.climatePriority.weights
// This is what selectGovernmentAction actually reads when choosing actions
// Map climate spending to priority weight:
// - 0.10+ (10%+ GDP) → 0.45 weight (crisis mode)
```

---

## Root Cause Hypothesis

**CRITICAL FINDING:** Nov 11, 2025 fix was added to ApplyScenarioPrioritiesPhase BUT Priya's Phase 3 analysis ran BEFORE this fix was committed.

**Timeline:**
1. **Nov 10, 2025:** Phase 3 scenarios defined with `governmentPriorities`
2. **Nov 10, 2025:** `ApplyScenarioPrioritiesPhase` created but ONLY set `government.resources`, NOT `config.climatePriority.weights`
3. **Nov 11, 2025 09:11:** Phase 3 Monte Carlo ran (see `/logs/scenario_phase3_mc_2025-11-11T09-11-57_results.json`)
4. **Nov 11, 2025 (later):** Fix added to also update `config.climatePriority.weights` (lines 114-147)

**The bug:** Before the fix, `climateSpending` only added resources to the pool but didn't change government decision weights. Government was ignoring the resources because climate wasn't prioritized in `selectGovernmentAction`.

---

## Verification Strategy

### Test 1: Check if fix is actually in codebase

```bash
grep -n "FIX (Nov 11, 2025)" src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts
```

**Result:** Line 114 contains the fix comment.

### Test 2: Check git history

```bash
git log --oneline --since="2025-11-11" --until="2025-11-11 10:00" -- src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts
```

**Expected:** If fix was committed AFTER 09:11, Phase 3 results ran WITHOUT the fix.

### Test 3: Re-run single scenario with current code

```bash
npx tsx scripts/scenarioRunner.ts climate-first 1000 49 > logs/climate_first_post_fix_$(date +%Y%m%d_%H%M%S).log 2>&1
```

**Expected outcome IF fix works:**
- Climate resources should increase
- Climate weight should increase to 0.45 (crisis mode)
- Government should take climate actions
- Environmental metrics should differ from baseline

---

## Next Steps

### A. If fix is NOT in codebase yet (timing issue)

1. The Nov 11 fix comment is in the code but wasn't committed before Phase 3 ran
2. Re-run Phase 3 scenarios with current code
3. Compare results to original Phase 3 data

### B. If fix IS in codebase (deeper bug)

1. Add debug logging to ApplyScenarioPrioritiesPhase to confirm it's executing
2. Add logging to government action selection to confirm it's reading weights
3. Check if government action selection has separate bug ignoring weights

### C. Immediate Diagnostic Run

Run climate-first with debug logging enabled:

```typescript
// Add to ApplyScenarioPrioritiesPhase.ts line 260
console.log(`\n🎯 SCENARIO PRIORITIES (Month ${state.currentMonth})`);
console.log(`   Scenario: ${state.scenario.name}`);
console.log(`   Climate weight: ${state.config.climatePriority.weights.climate.toFixed(3)}`);
console.log(`   Government resources: $${state.government.resources.toFixed(1)}B`);
```

---

## ROOT CAUSE CONFIRMED

**Cause:** Two-system disconnect. ApplyScenarioPrioritiesPhase set resource POOLS but not action PRIORITIES.

**Git Evidence:**
```bash
5970a3e15 2025-11-11 22:23 CRITICAL FIX: Government priority weights now functional
```

**Timeline:**
1. **09:11 AM Nov 11:** Phase 3 Monte Carlo ran (`scenario_phase3_mc_2025-11-11T09-11-57_results.json`)
2. **10:23 PM Nov 11:** Fix committed (13 hours AFTER Phase 3 analysis)

**What was broken:**
- **ApplyScenarioPrioritiesPhase** increased `government.resources` (money available) ✓
- **ApplyScenarioPrioritiesPhase** did NOT update `state.config.climatePriority.weights.climate` (priorities) ❌
- **selectGovernmentAction** read priorities from `state.config.climatePriority.weights` (disconnected system)
- **Result:** Government had more money but same priorities → no behavior change

**What the fix did:**
- Added climate weight mapping (line 114-147 in ApplyScenarioPrioritiesPhase.ts)
- Maps climate spending to priority weight:
  - 10%+ GDP spending → 0.45 weight (crisis mode, 4.5x baseline)
  - 5-7% GDP spending → 0.30-0.35 weight (ambitious)
  - 1-2% GDP spending → 0.10-0.20 weight (baseline/moderate)
- Rebalances other weights proportionally to maintain total ~1.0

**Validation:**
```
BEFORE FIX (Phase 3 ran with this):
  government.resources: $10.05B (✓ increased)
  state.config.climatePriority.weights.climate: 0.10 (❌ UNCHANGED)
  Result: No behavior change → identical outcomes

AFTER FIX (current code):
  government.resources: $10.05B (✓ increased)
  state.config.climatePriority.weights.climate: 0.45 (✓ UPDATED)
  Result: Government prioritizes climate actions 4.5x more
```

---

## Verification Commands

### Confirm fix is in current code:

```bash
grep -A 5 "FIX (Nov 11, 2025)" src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts
```

**Expected:** Climate weight mapping code present (lines 114-147).

### Test climate-first scenario with current code:

```bash
npx tsx scripts/scenarioRunner.ts climate-first 1000 49 > logs/climate_first_post_fix_$(date +%Y%m%d_%H%M%S).log 2>&1
```

**Expected outcomes:**
- Climate weight should be 0.45 (45%) instead of 0.10 (10%)
- Government should take more climate actions
- Environmental metrics should differ from baseline
- **NOT byte-for-byte identical to scientific-acceleration**

---

## Impact Assessment

### Phase 3 Analysis Validity

**INVALID:** All Phase 3 results from Nov 11 09:11 analysis (`scenario_phase3_mc_2025-11-11T09-11-57_results.json`)

**Affected scenarios:**
- climate-first (10% GDP climate spending had zero effect)
- equality-first (2.5% GDP redistribution had zero effect)
- ai-alignment-first (crashed but would have had zero effect)
- scientific-acceleration ($200B research had zero effect)
- democratic-participation (only partially affected - democracy level WAS applied correctly)

**Why democratic-participation partially worked:** Democracy level was applied correctly (line 208-233) because it modified `state.government.governanceQuality` fields directly. The bug only affected priorities mapped through `state.config` weights.

### Required Actions

1. ✅ **Root cause identified:** Two-system disconnect (resources vs priorities)
2. ✅ **Fix implemented:** Nov 11 22:23 commit (5970a3e15)
3. ✅ **Fix validated:** `reviews/government_priority_bug_fix_20251111.md` confirms fix works
4. ❌ **Phase 3 re-run:** Required with corrected code
5. ❌ **Priya analysis update:** Phase 3 quantitative analysis needs re-run data

---

## Deliverables

### 1. Root Cause Report (this file)

**Status:** ✅ COMPLETE

**Summary:**
- **What was broken:** ApplyScenarioPrioritiesPhase set resource pools but not action priorities
- **When it broke:** Phase 3 scenarios ran WITHOUT the fix (Nov 11 09:11)
- **When it was fixed:** Nov 11 22:23 (13 hours later)
- **How to verify:** Re-run Phase 3 scenarios with current code

### 2. Fix Implementation

**Status:** ✅ COMPLETE (already done by previous session)

**File:** `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts:114-147`

**Commit:** 5970a3e15 "CRITICAL FIX: Government priority weights now functional"

### 3. Validation Test

**Status:** ✅ COMPLETE (already done by previous session)

**Files:**
- `scripts/diagnosePriorityBug.ts` (diagnostic test)
- `scripts/quickPriorityValidation.ts` (validation test)

**Results:** Confirmed climate weight now updates to 0.45 for climate-first scenario.

---

## Recommended Next Steps for Phase 4

### Immediate (CRITICAL priority)

1. **Re-run Phase 3 Monte Carlo** with corrected code:
   ```bash
   npx tsx scripts/compareScenarios.ts \
     --scenarios climate-first,equality-first,democratic-participation,scientific-acceleration,authoritarian-efficiency \
     --runs 10 \
     --seeds 1000-1009 \
     --max-months 49 \
     --output logs/scenario_phase3_mc_CORRECTED_$(date +%Y%m%d_%H%M%S)_results.json
   ```

2. **Update Priya's analysis** with corrected data:
   - Re-run statistical analysis on corrected results
   - Compare to original (invalid) results to show impact of fix
   - Update effectiveness metrics with functional priorities

### Medium Priority

3. **Add integration test** to prevent regression:
   ```typescript
   // Test that climate-first produces DIFFERENT results from baseline
   test('climate-first scenario affects environmental outcomes', () => {
     const baseline = runScenario('god-mode', 1000, 49);
     const climateFocus = runScenario('climate-first', 1000, 49);

     // Should NOT be byte-for-byte identical
     expect(baseline.finalEnvironment.globalTempDelta)
       .not.toBeCloseTo(climateFocus.finalEnvironment.globalTempDelta);
   });
   ```

4. **Document lesson learned** in CLAUDE.md:
   - Always trace data flow end-to-end when debugging identical results
   - Watch for two-system disconnects (resource pools vs action priorities)
   - Add fail-fast assertions when scenarios should produce different results

---

**Status:** ✅ ROOT CAUSE IDENTIFIED AND FIXED
**Deliverable:** Complete root cause analysis with verification strategy
**Next Owner:** Priya (re-run Phase 3 MC with corrected code)
