# Defensive Fallback Migration Plan

**Date:** November 20, 2025
**Orchestrator:** orchestrator-1
**Implementing Agent:** simulation-maintainer (to be spawned)
**Priority:** CRITICAL (Architecture split-brain condition)

---

## Executive Summary

**Current State:** Split-brain error handling with 44 defensive fallback violations remaining in src/simulation/

**Problem:** Inconsistent fail-silent vs fail-loud behavior creates unpredictable debugging and masks research simulation bugs.

**Solution:** Complete migration to assertion utilities for all calculation paths while preserving intentional initialization fallbacks.

**Effort:** ~1 day (systematic migration by category)

---

## Violation Categories (44 Total)

### Category A: Configuration Defaults (ACCEPTABLE - Keep as-is)
**Count:** 4 instances
**Files:** `src/simulation/engine.ts` lines 487-490
**Pattern:** `config.property ?? defaultValue`
**Action:** NO CHANGE REQUIRED - These are legitimate config defaults

```typescript
// ACCEPTABLE PATTERN - Initialization context
socialAdaptationRate: config.socialAdaptationRate ?? 1.0,
aiCoordinationMultiplier: config.aiCoordinationMultiplier ?? 1.0,
```

---

### Category B: Map Accumulation Patterns (ACCEPTABLE - Document as intentional)
**Count:** 2 instances
**Files:** `src/simulation/techTree/effectsEngine.ts` lines 468, 476
**Pattern:** `map.get(key) ?? 0`
**Action:** ADD INLINE DOCUMENTATION explaining this is valid accumulation pattern

```typescript
// CURRENT (with comment explaining pattern):
// Note: Map.get() returns undefined for new keys - fallback is valid here
globalEffects.set(effectName, (globalEffects.get(effectName) ?? 0) + scaledValue);
```

**Rationale:** Maps don't have keys until first set - this is accumulation, not masking bugs

---

### Category C: CRITICAL - State Access in Calculations (MUST FIX)
**Count:** 20 instances
**Priority:** HIGH
**Impact:** Silent bugs in research calculations

**Files and Fixes:**

#### 1. IrreversibilityTrackingPhase.ts (4 instances - lines 105, 212, 320, 671)
```typescript
// WRONG:
const tempAnomaly = state.resourceEconomy?.co2?.temperatureAnomaly ?? 0;

// RIGHT:
const tempAnomaly = assertStateProperty(
  assertStateProperty(state.resourceEconomy, 'co2', context),
  'temperatureAnomaly',
  context
);
```

#### 2. TransitionMortalityPhase.ts (5 instances - lines 137, 145, 192, 511, 517)
```typescript
// WRONG:
const intlCooperation = state.governmentSystem?.internationalCoordination ?? 0.5;

// RIGHT:
const intlCooperation = assertStateProperty(
  state.governmentSystem,
  'internationalCoordination',
  { location: 'calculateTransitionMortality', month: state.currentMonth }
);
```

#### 3. organizationManagement.ts (3 instances - lines 458, 885, 886)
```typescript
// WRONG:
const workforceMultiplier = org.workforceMultiplier ?? 1.0;

// RIGHT:
const workforceMultiplier = assertStateProperty(
  org,
  'workforceMultiplier',
  { location: 'calculateOrgEffectiveness', month: state.currentMonth }
);
```

#### 4. techTree/effectsEngine.ts (1 instance - line 914)
```typescript
// WRONG:
const currentReduction = gameState.globalMetrics.nitrogenReductionTotal ?? 0;

// RIGHT:
const currentReduction = assertStateProperty(
  gameState.globalMetrics,
  'nitrogenReductionTotal',
  { location: 'applyNitrogenReduction', month: gameState.currentMonth }
);
```

#### 5. ResourceSoilPhase.ts (1 instance - line 59)
```typescript
// WRONG:
const phosphorusPollution = state.phosphorusSystem?.pollutionLevel ?? 0.25;

// RIGHT:
const phosphorusPollution = assertStateProperty(
  state.phosphorusSystem,
  'pollutionLevel',
  { location: 'ResourceSoilPhase', month: state.currentMonth }
);
```

#### 6. PlanetaryBoundariesPhase.ts (1 instance - line 63)
```typescript
// WRONG:
const phosphorusReserves = state.phosphorusSystem?.reserves ?? 1.0;

// RIGHT:
const phosphorusReserves = assertStateProperty(
  state.phosphorusSystem,
  'reserves',
  { location: 'PlanetaryBoundariesPhase', month: state.currentMonth }
);
```

#### 7. CriticalJuncturePhase.ts (1 instance - line 532)
```typescript
// WRONG:
stateChanges += escapeResult.metadata?.stateChanges ?? 0;

// RIGHT:
stateChanges += assertStateProperty(
  escapeResult.metadata,
  'stateChanges',
  { location: 'CriticalJuncturePhase_escapeResult', month: state.currentMonth }
);
```

#### 8. consciousnessGovernanceUtils.ts (4 instances - lines 437, 468-470)
```typescript
// WRONG:
const targetPreparedness = allRegions[targetRegion]?.preparedness ?? 0;

// RIGHT:
const targetRegionData = assertDefined(
  allRegions[targetRegion],
  { location: 'consciousnessGovernanceUtils', valueName: `region_${targetRegion}` }
);
const targetPreparedness = assertStateProperty(
  targetRegionData,
  'preparedness',
  { location: 'consciousnessGovernanceUtils', region: targetRegion }
);
```

---

### Category D: UI Display / Logging (LOW PRIORITY)
**Count:** 7 instances
**Action:** DEFER or accept as valid UI fallbacks

**Files:**
- `updateNovelEntitiesBoundary.ts` lines 181, 183 (console.log display)
- `stateValidation.ts` lines 239-242 (validation summary display)
- `utils/assertions.ts` line 548 (internal tolerance parameter)

**Rationale:** Logging/display code doesn't affect simulation calculations - fallbacks acceptable here per CLAUDE.md

---

### Category E: External/API Boundaries (LOW PRIORITY)
**Count:** 5 instances
**Action:** Document as intentional or assess if should be stricter

**Files:**
- `llm/client.ts` line 443 (API token estimation)
- `scenarios/apply.ts` line 248 (scenario deployment level)
- `qualityOfLife/mortality.ts` line 281 (scenario parameter)
- `techTree/engine.ts` line 275 (research progress tracking)
- `behavioralDetection.ts` line 162 (detection value handling)

---

### Category F: Documented Initialization (ACCEPTABLE)
**Count:** 2 instances
**Action:** Keep with clear documentation

**Files:**
- `techTree/effectsEngine.ts` line 2084 (coral bleaching risk initialization - explicitly documented)
- `updateNovelEntitiesBoundary.ts` line 73 (tech effects chain with fallback)

---

## Implementation Phases

### Phase 1: CRITICAL State Access (Day 1, Morning - 3 hours)
**Target:** Category C - 20 violations
**Files:** IrreversibilityTrackingPhase, TransitionMortalityPhase, organizationManagement, consciousnessGovernanceUtils, ResourceSoilPhase, PlanetaryBoundariesPhase, CriticalJuncturePhase, techTree/effectsEngine

**Steps:**
1. Migrate IrreversibilityTrackingPhase.ts (4 violations)
2. Run `npx tsc --noEmit` after each file
3. Migrate TransitionMortalityPhase.ts (5 violations)
4. Run type check
5. Migrate organizationManagement.ts (3 violations)
6. Run type check
7. Migrate remaining files (8 violations)
8. Run `npm test`

### Phase 2: Documentation & Validation (Day 1, Afternoon - 2 hours)
1. Add inline documentation for Category B (map accumulation patterns)
2. Document Category D/E/F as intentional patterns
3. Run Monte Carlo validation (N=10)
4. Update CLAUDE.md with pattern examples

---

## Success Criteria

1. ✅ Zero defensive fallbacks in calculation paths (Category C complete)
2. ✅ All map accumulation patterns documented (Category B)
3. ✅ Type checker passes (`npx tsc --noEmit`)
4. ✅ Test suite passes (`npm test`)
5. ✅ Monte Carlo validation succeeds (N=10, CV < 0.01% for determinism)
6. ✅ Documentation updated with clear boundary guidance

---

## Risk Mitigation

1. **Incremental commits:** One category/file at a time for easy revert
2. **Continuous validation:** Type check after each file
3. **Test after phase:** Full test suite after Phase 1
4. **Monte Carlo checkpoint:** Validate determinism before documentation phase

---

## Handoff to simulation-maintainer

**Context provided:**
- This plan document (detailed file/line numbers)
- Architecture review: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/defensive_fallback_architecture_review_20251116.md`
- Assertion utilities: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts`

**Expected deliverables:**
1. PR with Category C migrations
2. Inline documentation for Categories B, D, E, F
3. Test results (unit + Monte Carlo)
4. Updated CLAUDE.md section on defensive patterns

---

**Filed by:** Orchestrator
**Status:** READY FOR IMPLEMENTATION
**Assigned to:** simulation-maintainer (to be spawned)
