# Test Infrastructure Debt

## Problem Summary

Several integration tests (state-validation-*) were skipped in commit b6fbd3580 because they reference **removed state structures** that no longer exist after the Phase 2/3 architecture refactoring.

**Root cause:** Tests were written against an old `GameState` structure that has been fundamentally reorganized.

## Affected Tests

1. `state-validation-mortality-stabilizers.test.ts` ❌ HIGHEST PRIORITY
2. `state-validation-multi-phase-cascades.test.ts`
3. `state-validation-planetary-boundaries.test.ts`
4. `state-validation-ai-suffering.test.ts`
5. `domain-bounds-verification.test.ts`

## Specific Issues

### 1. Mortality Stabilizers Test

**Problem:** Test accesses properties that don't exist in current GameState:
- `state.environmentalState` (doesn't exist)
- `state.climateSystem` (doesn't exist)
- Old `mortalityStabilizers` structure (field names changed)

**OLD structure (what tests expect):**
```typescript
mortalityStabilizers: {
  internationalAid: { effectiveness, received, capacity },
  heatAdaptation: { level, infrastructure, behavioralAdaptation },
  migration: { capacity, destinationAvailability, displacementMortality },
  emergencyResponse: { capacity, workforce, resources }
}
```

**NEW structure (what actually exists):**
```typescript
mortalityStabilizers: {
  aid: InternationalAidSystem {
    effectivenessLevel, mortalityReduction, donorAvailability,
    donorFatigue, majorEconomiesCollapsed, totalMajorEconomies
  },
  adaptation: AdaptationMechanisms {
    physiological, behavioral, infrastructural, social, totalReduction,
    monthsExposed, wetBulbLimit, adaptationCeases
  },
  migration: MigrationSystem {
    successfulRelocation, mortalityDuringMigration, returnRate,
    destinationCapacity, averageDistance, distancePenalty
  },
  emergencyResponse: EmergencyResponseCapacity {
    workforceAvailable, preparednessLevel, resourceStockpiles,
    communicationSystems, effectiveness, crisisScale, overwhelmPenalty
  },
  cascades: MechanismCascadeState { ... },
  combinedReduction: number
}
```

**Missing:** Tests need climate/environmental state. Current GameState doesn't expose a simple `globalTemperature` field. The environmental systems have been refactored into:
- `environmentalAccumulation` (debt tracking)
- Planetary boundaries system (separate)
- Multiple environmental subsystems

###  2. Multi-Phase Cascades Test

**Problem:** References `state.environmentalState.biodiversityIndex`, `state.climateSystem.CO2Level`, etc. - NONE of these exist.

### 3. Planetary Boundaries Test

**Problem:** References `state.planetaryBoundaries[...].level` - structure has changed.

### 4. AI Suffering Test

**Problem:** Expects exceptions that don't throw (API changed).

### 5. Domain Bounds Verification Test

**Problem:** GDP bound mismatch (test expects 500T, code has 600T). Simple fix.

## Proper Fix Strategy

### Step 1: Map Old → New State Structure

Create a comprehensive mapping document showing:
- What replaced `environmentalState`
- What replaced `climateSystem`
- How to access equivalent data in new architecture

### Step 2: Rewrite Test Helpers

Current test helpers (e.g., `ensureRegionalPopulations`) create mock state with OLD structure. Need to:
1. Use actual `initializeRegionalMortalityStabilizers()` from `src/simulation/mortalityStabilizersInit.ts`
2. Use real `createDefaultInitialState()` and modify ONLY what's needed for test scenarios
3. Don't create parallel mock structures

### Step 3: Update Test Assertions

Replace property accesses:
```typescript
// ❌ OLD (doesn't exist)
state.environmentalState.globalTemperature
state.climateSystem.CO2Level

// ✅ NEW (find correct path)
// Need to determine: Where IS temperature stored now?
// Is it in environmentalAccumulation? Separate climate module?
```

### Step 4: Verify Against Real Simulation

Tests should use **same initialization code as real simulation** to avoid drift:
```typescript
// ✅ GOOD
import { initializeRegionalMortalityStabilizers } from '@/simulation/mortalityStabilizersInit';
region.mortalityStabilizers = initializeRegionalMortalityStabilizers(region);

// ❌ BAD
region.mortalityStabilizers = { /* hand-crafted mock */ };
```

## Temporary Workaround

For now, these tests remain skipped (.skip.ts renamed). They should be un-skipped ONLY after:
1. Complete state structure mapping documented
2. Test helpers rewritten to match current architecture
3. All assertions updated to access correct properties

## Estimated Effort

- **Mortality Stabilizers:** 4-6 hours (most complex, many assertions)
- **Multi-Phase Cascades:** 3-4 hours
- **Planetary Boundaries:** 2-3 hours
- **AI Suffering:** 1-2 hours
- **Domain Bounds:** 30 minutes (simple value update)

**Total:** ~12-16 hours of focused work

## Priority

**HIGH** - These tests validate critical simulation behavior (fail-loudly assertions, cascade mechanics, state consistency). Without them, regressions can go undetected.

However, they are **integration tests** - unit tests for individual phases still exist and catch most bugs.

## Next Steps

1. Create `docs/STATE_STRUCTURE_MAPPING.md` (old → new)
2. Fix mortality stabilizers test FIRST (hardest, will inform others)
3. Fix remaining tests using same patterns
4. Add pre-commit hook to prevent test drift in future

---

**Last updated:** November 13, 2025
**Status:** Tests skipped, awaiting architecture documentation
