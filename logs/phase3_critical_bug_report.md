# Phase 3 Critical Bug Report: Scenario Priorities Ineffective

**Date:** 2025-11-18
**Severity:** BLOCKING
**Status:** Phase 3 implementation blocked pending fix

---

## Summary

Phase 3 policy package validation (N=1) reveals that scenario government priorities are **stored and logged correctly** but **NOT affecting outcomes**. All 5 policy packages converge to nearly identical metrics despite having radically different priorities.

---

## Evidence

### Scenario Priorities (Configured Correctly)

| Scenario | Research | Redistribution | Climate |
|----------|----------|----------------|---------|
| Green New Deal | 60% | 70% | 80% |
| Techno-Optimist | **90%** | 20% | 40% |
| Degrowth | 50% | 80% | **90%** |
| Authoritarian Climate | 70% | 50% | **90%** |
| Nordic Social Democracy | 60% | **80%** | 70% |

### Final Outcomes (All Identical)

| Scenario | Research Spending | Gini | Climate | Cohesion |
|----------|-------------------|------|---------|----------|
| Green New Deal | **$0.0B** | **0.400** | 66% | 50% |
| Techno-Optimist | **$0.0B** | **0.400** | 60% | 50% |
| Degrowth | **$0.0B** | **0.400** | 94% | 50% |
| Authoritarian Climate | **$0.0B** | **0.400** | 100% | 50% |
| Nordic Social Democracy | **$0.0B** | **0.400** | 56% | 50% |

**Divergence:**
- ✅ Climate stability varies (56% → 100%)
- ❌ Research spending: $0.0B for ALL (should vary: $0B → $50B+)
- ❌ Gini: 0.400 for ALL (should vary: 0.25 → 0.40)
- ❌ Social cohesion: 50% for ALL (should vary)

**Conclusion:** Scenario priorities are cosmetic (logged but not enforced).

---

## Root Cause Analysis

### What's Working

1. **Scenario config storage** ✅
   - `state.scenarioConfig` is set correctly by `applyScenario()`
   - Priorities are read by `governmentCore.ts` line 49

2. **Priority multipliers exist** ✅
   - Lines 661-714 in `governmentCore.ts`
   - 10-20x multipliers for targeted actions:
     - `allocate_research_budget` (research priority)
     - `adjust_redistribution_policy` (redistribution priority)
     - Environmental actions (climate priority)

3. **Actions exist** ✅
   - `allocate_research_budget` in `researchActions.ts`
   - `adjust_redistribution_policy` in `economicActions.ts`
   - Both exported via `migratedActions` (imported by governmentCore)

4. **Government takes actions** ✅
   - Logs show: "🏛️ CRISIS RESPONSE: 1-2 actions this month"

### What's NOT Working

**Scenario-targeted actions are NEVER selected despite 10-20x multipliers.**

**Why?**

1. **Base priorities too low:**
   - Crisis response actions have base priority ~50-100
   - `allocate_research_budget` base priority ~1-10
   - Even with 15x multiplier: 1 × 15 = 15 (still < 50)

2. **Crisis actions dominate:**
   - Early months trigger crisis responses (unemployment, AI threats)
   - These have NO scenario multipliers
   - They always win priority selection

3. **Multipliers apply to wrong action set:**
   - Multipliers boost alignment research (`invest_alignment_research`)
   - But NOT general research budget (`allocate_research_budget`)
   - Line 665-668: Only boosts `invest_alignment_research`
   - Line 669-672: DOES boost `allocate_research_budget` (14x multiplier)

4. **Action may not pass `canExecute`:**
   - `allocate_research_budget` requires GDP > $50T
   - Early game GDP ~$96T (should pass)
   - But other conditions might block it

---

## Evidence from Code

### Priority Multipliers (governmentCore.ts:661-714)

```typescript
// Scientific Research Priority
if (scenarioPriorities.scientificResearch !== undefined && scenarioPriorities.scientificResearch > 0) {
  if (action.id === 'invest_alignment_research') {
    priority *= (1 + scenarioPriorities.scientificResearch * 9); // Up to 10x
  }
  if (action.id === 'allocate_research_budget') {
    priority *= (1 + scenarioPriorities.scientificResearch * 14); // Up to 15x (stronger boost)
  }
}

// Redistribution Priority
if (scenarioPriorities.redistributionLevel !== undefined && scenarioPriorities.redistributionLevel > 0) {
  if (action.id === 'implement_generous_ubi' ||
      action.id === 'implement_means_tested_benefits' ||
      action.id === 'implement_job_guarantee') {
    priority *= (1 + scenarioPriorities.redistributionLevel * 14); // Up to 15x
  }
  if (action.id === 'adjust_redistribution_policy') {
    priority *= (1 + scenarioPriorities.redistributionLevel * 19); // Up to 20x (strongest)
  }
}
```

**Multipliers exist but are INSUFFICIENT to overcome crisis response priorities.**

### Action Execution (researchActions.ts:162-195)

```typescript
execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
  // Reads scenario priorities correctly
  const scenarioPriorities = state.scenarioConfig?.governmentPriorities;
  let allocationPercent = 0.015; // Default: 1.5% GDP

  if (scenarioPriorities?.scientificResearch !== undefined) {
    const priority = scenarioPriorities.scientificResearch;
    if (priority >= 0.8) {
      allocationPercent = 0.05; // 5% GDP
    } else if (priority >= 0.6) {
      allocationPercent = 0.03; // 3% GDP
    }
    // ...
  }

  // Calculate budget
  const annualBudget = gdp * 1000 * allocationPercent;
  const monthlyBudget = annualBudget / 12;

  // Set government research spending
  state.government.researchSpending = monthlyBudget;
}
```

**Action WOULD work if selected, but it's NEVER selected due to low priority.**

---

## Why Climate Diverges But Not Research/Redistribution

**Climate stability varies (56% → 100%)** because:
- Environmental actions (`deploy_environmental_tech`, `emergency_amazon_protection`) are crisis responses
- They trigger based on environmental thresholds (Amazon dieback, coral collapse)
- Scenario multipliers (line 690-697) boost these WHEN they're already triggered
- Crisis conditions vary by scenario → climate outcomes vary

**Research/Redistribution DON'T vary** because:
- `allocate_research_budget` is NOT a crisis response
- It's a proactive policy action with base priority ~1-5
- Even with 15x multiplier: 1 × 15 = 15
- Crisis actions have priority 50-100 → always win
- Action is NEVER selected → research spending stays $0B

---

## Proposed Fix

### Option 1: Increase Base Priorities (Conservative)

**Change:** Set higher base priority for scenario-targeted actions

```typescript
case 'allocate_research_budget':
  priority = 10; // Was: 1-5 (default action weight)
  break;

case 'adjust_redistribution_policy':
  priority = 10;
  break;
```

**With 15x multiplier:**
- 10 × 15 = 150 (now competes with crisis actions)

**Pros:** Minimal code change
**Cons:** Might still lose to crisis actions in emergencies

### Option 2: Priority Override (Aggressive)

**Change:** If scenario priorities exist, set MINIMUM priority floor

```typescript
// After applying scenario multipliers (line 714+)
if (scenarioPriorities) {
  // Ensure scenario-targeted actions get minimum priority
  if (scenarioPriorities.scientificResearch > 0.6 && action.id === 'allocate_research_budget') {
    priority = Math.max(priority, 75); // Guaranteed competitive priority
  }
  if (scenarioPriorities.redistributionLevel > 0.6 && action.id === 'adjust_redistribution_policy') {
    priority = Math.max(priority, 75);
  }
  // ... etc for other priorities
}
```

**Pros:** Guarantees scenario enforcement
**Cons:** Might override emergencies inappropriately

### Option 3: Separate Scenario Action Pool (Architectural)

**Change:** When scenario active, filter actions to scenario-relevant set FIRST

```typescript
if (scenarioPriorities) {
  // Extract scenario-relevant actions
  const scenarioActions = availableActions.filter(action => {
    if (scenarioPriorities.scientificResearch > 0.6 &&
        (action.id === 'allocate_research_budget' || action.id === 'invest_alignment_research')) {
      return true;
    }
    if (scenarioPriorities.redistributionLevel > 0.6 &&
        (action.id === 'adjust_redistribution_policy' || action.id.includes('ubi'))) {
      return true;
    }
    return false;
  });

  // Force selection from scenario pool with 70% probability
  if (scenarioActions.length > 0 && random() < 0.7) {
    availableActions = scenarioActions; // Restrict to scenario actions
  }
}
```

**Pros:** Ensures scenario priorities dominate without breaking emergency responses
**Cons:** More complex, requires RNG for probability

---

## Recommendation

**Use Option 2 (Priority Override with floor)**

**Rationale:**
1. Scenarios are for TESTING specific policy configurations
2. We WANT to force divergent behavior (that's the point of Phase 3)
3. If Green New Deal prioritizes research 90%, government MUST allocate research spending
4. Option 1 too weak (multipliers already failed)
5. Option 3 too complex for quick fix

**Implementation:**

```typescript
// governmentCore.ts line 714+ (after scenario multipliers)
if (scenarioPriorities) {
  const SCENARIO_PRIORITY_FLOOR = 80; // Competitive with crisis actions

  // Research Priority Floor
  if (scenarioPriorities.scientificResearch >= 0.6) {
    if (action.id === 'allocate_research_budget' || action.id === 'invest_alignment_research') {
      priority = Math.max(priority, SCENARIO_PRIORITY_FLOOR * scenarioPriorities.scientificResearch);
    }
  }

  // Redistribution Priority Floor
  if (scenarioPriorities.redistributionLevel >= 0.6) {
    if (action.id === 'adjust_redistribution_policy' ||
        action.id === 'implement_generous_ubi' ||
        action.id === 'implement_means_tested_benefits') {
      priority = Math.max(priority, SCENARIO_PRIORITY_FLOOR * scenarioPriorities.redistributionLevel);
    }
  }

  // Climate Priority Floor
  if (scenarioPriorities.climateSpending >= 0.6) {
    if (action.id === 'deploy_environmental_tech' ||
        action.id === 'emergency_amazon_protection' ||
        action.id === 'fund_coral_restoration' ||
        action.id === 'ban_harmful_pesticides') {
      priority = Math.max(priority, SCENARIO_PRIORITY_FLOOR * scenarioPriorities.climateSpending);
    }
  }

  // Democratic Participation Priority Floor
  if (scenarioPriorities.democraticParticipation >= 0.6) {
    if (action.id === 'invest_governance_capacity' ||
        action.id === 'implement_liquid_democracy') {
      priority = Math.max(priority, SCENARIO_PRIORITY_FLOOR * scenarioPriorities.democraticParticipation);
    }
  }

  // AI Alignment Priority Floor
  if (scenarioPriorities.alignmentResearch >= 0.6) {
    if (action.id === 'invest_alignment_research' ||
        action.id === 'implement_compute_governance' ||
        action.id === 'mandatory_safety_reviews') {
      priority = Math.max(priority, SCENARIO_PRIORITY_FLOOR * scenarioPriorities.alignmentResearch);
    }
  }
}
```

**Effect:**
- Techno-Optimist (research 90%): `allocate_research_budget` priority = max(current, 80 × 0.9) = 72 minimum
- Green New Deal (redistribution 70%): `adjust_redistribution_policy` priority = max(current, 80 × 0.7) = 56 minimum
- These now COMPETE with crisis actions (priority 50-100)

---

## Testing Plan

1. **Apply fix** (add priority floors to governmentCore.ts)
2. **Re-run quick validation** (N=1, 5 scenarios)
3. **Check for divergence:**
   - Techno-Optimist: Research spending > $0B
   - Green New Deal: Gini < 0.40
   - Degrowth: Climate > 80%, Research < $10B
   - Nordic: Gini ~0.30, Research ~$20B
4. **Run Phase 3 Monte Carlo** (N=10, 5 scenarios)
5. **Validate distributions** (confirm scenarios produce distinct outcome patterns)

---

## Impact

**Blocks:**
- Phase 3 policy package testing
- Phase 4-5 combo scenario testing
- Research paper (can't validate policy recommendations with broken scenarios)

**Unblocks after fix:**
- Realistic policy comparison (Green New Deal vs e/acc vs degrowth)
- Actionable insights for real-world policy-making
- Validation of governance pathway → outcome mapping

---

## Related Issues

- Commit dc84b5a (Nov 10, 2025) - "fix: Enforce scenario government priorities" - INCOMPLETE
  - Added scenario config storage ✅
  - Added priority multipliers ✅
  - But multipliers INSUFFICIENT ❌

- Phase 2 Bug Discovery (Nov 10, 2025) - Same issue
  - Scenarios converged to baseline
  - Fix attempted but only partial

**This is the SECOND iteration of this bug.** The fix must be AGGRESSIVE (priority floors, not just multipliers).

---

## Files Involved

- `/home/user/ai_game_theory_simulation/src/simulation/government/core/governmentCore.ts` - Priority selection logic (NEEDS FIX)
- `/home/user/ai_game_theory_simulation/src/simulation/government/actions/researchActions.ts` - `allocate_research_budget` action
- `/home/user/ai_game_theory_simulation/src/simulation/government/actions/economicActions.ts` - `adjust_redistribution_policy` action
- `/home/user/ai_game_theory_simulation/src/simulation/scenarios/definitions.ts` - Phase 3 policy packages (IMPLEMENTED ✅)
- `/home/user/ai_game_theory_simulation/scripts/quickPhase3Validation.ts` - Validation script (IMPLEMENTED ✅)
