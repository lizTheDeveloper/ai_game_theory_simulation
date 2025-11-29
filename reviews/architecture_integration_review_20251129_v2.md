# Architecture Integration Review - November 29, 2025 (v2)

**Review Type:** 30-day integration review
**Reviewer:** Architecture Skeptic
**Grade:** B+
**Session:** auto/worker-20251129_080001

---

## Executive Summary

System health is **GOOD** after significant recent work. The ocean acidification cascade (RD-2), technology bifurcation fix (M-3), and CRITICAL-1/2 hindcast validation fixes represent solid architectural progress. However, I identified **1 HIGH-priority** missing integration and **1 MEDIUM-priority** technical debt issue.

---

## CRITICAL Issues

**None found.**

---

## HIGH Issues

### HIGH-1: Ocean Acidification Not Connected to Food Security System

**File:** `src/simulation/engine/phases/OceanAcidificationCascadePhase.ts`
**Related:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`, `src/simulation/engine/phases/FamineSystemPhase.ts`

**Problem:** The new ocean acidification cascade phase (RD-2) calculates `coastalFisheriesYield` (0-1 scale representing fisheries productivity collapse) but this value is **never read by the food security or famine systems**.

**Evidence:**
```bash
# coastalFisheriesYield is SET in:
- src/simulation/oceanAcidification.ts:375  # ResourceWaterPhase path
- src/simulation/engine/phases/OceanAcidificationCascadePhase.ts:206  # Cascade path

# coastalFisheriesYield is USED for events/logging in:
- OceanAcidificationCascadePhase.ts:255  # Event description only

# coastalFisheriesYield is NOT READ by:
- FoodSecurityDegradationPhase.ts  # No mention
- FamineSystemPhase.ts  # No mention
- qualityOfLife/*.ts  # Not connected
```

**Impact:** The simulation models detailed ocean-to-fisheries collapse (415M population at risk per the phase), but this doesn't actually affect food security calculations or famine triggers. Ocean ecosystem collapse has no mechanical effect on hunger.

**Research Context:** FAO estimates 3.3B people rely on fish for >20% of animal protein. The phase correctly models this (`populationDependent: 415M`) but the signal doesn't propagate to food systems.

**Severity:** HIGH (missing system integration creates simulation gap)

**Recommendation:** FoodSecurityDegradationPhase should read `state.oceanAcidificationSystem.coastalFisheriesYield` as a food production modifier. Rough formula:
```typescript
// In FoodSecurityDegradationPhase
const fisheriesImpact = 1 - state.oceanAcidificationSystem.coastalFisheriesYield;
const oceanFoodSecurityPenalty = fisheriesImpact * 0.20;  // 20% of food from ocean
foodSecurity -= oceanFoodSecurityPenalty;
```

**Effort:** Small (1-2 hours)

---

## MEDIUM Issues

### MEDIUM-1: Unimplemented 'adaptive' Technology Strategy Still Documented

**File:** `src/simulation/scenarios/definitions.ts:296-315`
**Related:** `src/simulation/scenarios/apply.ts:219-223`

**Problem:** The `TECHNO_OPTIMIST` scenario defines `strategy: 'adaptive'` which is completely unimplemented - it just logs a message and returns without creating a deployment schedule. This was the root cause of the M-3 technology bifurcation failure (0 techs deployed across 10 Monte Carlo runs).

**Current State:** M-3 fix works around this by switching to `FOUNDATIONS_FIRST` scenario, but the unimplemented 'adaptive' strategy remains as a trap for future users.

**Evidence from M-3 investigation:**
```typescript
// src/simulation/scenarios/apply.ts:219-223
if (deployment.strategy === 'adaptive') {
  console.log(`     Technologies will be deployed adaptively by simulation`);
  console.log(`     (No immediate deployment - simulation decides)`);
  return;  // Does nothing
}
```

**Impact:** Any scenario using `strategy: 'adaptive'` silently deploys zero technologies.

**Recommendation:**
1. Add explicit warning in TECHNO_OPTIMIST definition noting 'adaptive' is unimplemented
2. OR: Implement 'adaptive' strategy (medium effort)
3. OR: Remove/deprecate TECHNO_OPTIMIST scenario until 'adaptive' is implemented

**Effort:** Small (documentation) or Medium (implementation)

---

### MEDIUM-2: Silent Fallbacks in Phase Code (Ongoing)

**Files:** Various phases in `src/simulation/engine/phases/`

**Problem:** 25+ `?? N` fallback patterns remain in phase code. Most are legitimate (config defaults, uncertainty parameters), but some mask potential state initialization bugs.

**Concerning patterns:**
```typescript
// GeopoliticalConflictPhase.ts:248-250 (agent capability defaults)
const digital = agent.capabilityProfile.digital ?? 0;
const social = agent.capabilityProfile.social ?? 0;
const cognitive = agent.capabilityProfile.cognitive ?? 0;

// TransitionMortalityPhase.ts:273
const retrainingLevel = state.policyInterventions?.retrainingLevel ?? 0;
```

**Status:** Previous review noted 76 patterns project-wide. Migration to assertions is incomplete.

**Impact:** Medium - masks bugs but doesn't cause incorrect results in well-initialized states.

**Recommendation:** Schedule comprehensive audit after current roadmap sprint. Not blocking.

---

## Observations (No Action Required)

### State Propagation - GOOD

The ocean acidification cascade phase correctly uses assertion utilities throughout:
- `assertFinite()` for all calculations (15 uses)
- `assertProbability()` for 0-1 values (8 uses)
- `assertInRange()` for bounded values (4 uses)

Example of proper defensive coding:
```typescript
ocean.compoundStressMultiplier = assertInRange(
  1.0 + (warmingContribution * acidificationContribution * 0.30),
  1.0, 1.5,
  { location: 'OceanAcidificationCascadePhase.calculateCompoundStress', ... }
);
```

### Phase Ordering - CORRECT

Ocean acidification cascade phase has proper ordering:
- Order: 21.8 (after planetary_boundaries 21.0, famine 21.6)
- Dependencies: `['planetary_boundaries']`

This is correct - calculates compound stress from climate boundary data before famine uses it.

### Technology Scenario Fix - VERIFIED

The M-3 fix is architecturally sound:
- Root cause correctly identified (unimplemented 'adaptive' strategy)
- Fix appropriately switches to implemented 'sequenced' strategy
- Math is correct (40 techs / 71 total = 56% tree → crosses 55-60% bifurcation threshold)

### Performance - ACCEPTABLE

No new O(n^2) patterns introduced. The regional coral health update iterates over 4 fixed regions (not agents), so complexity is O(1) per step.

---

## Test Status

Based on recent commits:
- Monte Carlo validation: HIGH-4 fix Grade B+ (Nov 29)
- CRITICAL-1/2: Resolved (Nov 29)
- Determinism: Not verified this session

---

## Recommendation

**Overall Grade: B+**

**Action Items:**

1. **HIGH-1** (Ocean-to-Food Integration): Should be addressed within 1-2 sessions. The ocean acidification system is mechanically complete but disconnected from food security. This is a straightforward wiring task.

2. **MEDIUM-1** (Unimplemented 'adaptive'): Document the limitation or implement. Not blocking but a known trap.

3. **MEDIUM-2** (Silent fallbacks): Continue incremental migration. Not blocking.

**Next Steps:**
- Feature implementer should add `coastalFisheriesYield` to FoodSecurityDegradationPhase inputs
- Consider adding to technical debt tracking for MEDIUM items

---

## Files Reviewed

Core integration points:
- `/src/simulation/engine/phases/OceanAcidificationCascadePhase.ts` - NEW (RD-2)
- `/src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`
- `/src/simulation/engine/phases/FamineSystemPhase.ts`
- `/src/simulation/engine/phases/BifurcationLogicPhase.ts`
- `/src/simulation/scenarios/definitions.ts`
- `/src/simulation/scenarios/apply.ts`
- `/src/simulation/engine/phases/index.ts`

Recent commit analysis:
- 23738ef0 (M-3 fix)
- c7800a26 (HIGH-4 validation)
- a00cc156 (ocean acidification merge)
- ec6333e8 (RD-2 registration)
