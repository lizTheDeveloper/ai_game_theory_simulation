# Task: Implement Irreversibility Framework (TIER 1 CRITICAL)

**Date:** 2025-11-17
**Agent:** simulation-maintainer (Roy)
**Priority:** TIER 1 CRITICAL
**Estimated Time:** 4-6 hours

---

## Context

**Problem:** Novel entities showing 0% effectiveness despite deploying 7 cleanup technologies.

**Root Cause (Research-Validated):**
1. Economic impossibility: $20-7,000T/year (18-6,400% of global GDP)
2. Dilution problem: Technologies work at mg/L (industrial) but environment is ng/L (6-9 orders of magnitude)
3. Planetary irreversibility: PFAS in Antarctic rainwater 14× above EPA limits

**Solution:** Model irreversibility mechanics with prevention-first paradigm and energy-gated cleanup.

**Research Foundation:**
- **Primary:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_zero_effectiveness_validation_20251113.md` (39KB, 15+ sources)
- **Implementation Plan:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/irreversibility_framework_implementation_20251116.md` (971 lines)
- **Critique:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_irreversibility_critique_20251116.md` (Grade B+, CONDITIONAL PASS ✅⚠️)

**Quality Gate 1 Status:** ✅ PASSED with mandatory corrections

---

## Mandatory Corrections from Critique

### CRITICAL-1: Energy Requirement Transparency
- Flag energy trap estimate as theoretical upper bound (4-40% of global energy)
- Add explicit assumptions in code comments
- Cite IEA baseline (2024: ~600 EJ/year)

### CRITICAL-2: Concentration Gap Precision
- Separate contamination types in comments:
  - Rainwater (pg/L): 9 orders of magnitude gap
  - Groundwater (ng/L - μg/L): 5-7 orders of magnitude
  - Surface water (ng/L): 6-9 orders of magnitude

### CRITICAL-3: Rebound Effect Uncertainty
- Use conservative range: 10-20% (not fixed 10%)
- Add uncertainty flag or make toggleable
- Document lack of empirical PFAS-specific data

---

## Implementation Scope

### Phase 1: Core Irreversibility Mechanics

#### 1.1 Add Irreversibility Properties to PlanetaryBoundary Interface

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`

**Changes:**
```typescript
export interface PlanetaryBoundary {
  name: string;
  value: number;
  threshold: number;
  transgressed: boolean;

  // NEW - Irreversibility mechanics
  irreversible: boolean;          // True for novel entities, extinctions
  recoveryHalfLife?: number;      // Years (novel entities: 50-100, extinctions: Infinity)
  minimumAsymptoticValue?: number; // 0.05-0.20 for novel entities (never reaches zero)
  legacyStock?: number;            // Accumulated contamination (metric tons)
}
```

**Initialization** (in `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/initialization.ts`):

```typescript
novelEntities: {
  name: 'Novel Entities',
  value: 50,
  threshold: 100,
  transgressed: false,
  irreversible: true,  // Atmospheric PFAS is permanent (Cousins 2022)
  recoveryHalfLife: 75,  // 50-100 year range (like Montreal Protocol)
  minimumAsymptoticValue: 0.15,  // Never reaches zero (15% floor from background)
  legacyStock: 46000  // metric tons (accumulated PFAAs) - Glüge 2020
},

biosphereIntegrity: {
  name: 'Biosphere Integrity',
  value: 75,
  threshold: 90,
  transgressed: true,
  irreversible: false,  // Species can recover, but extinctions are permanent
  recoveryHalfLife: 200,  // Century-scale ecosystem recovery
  minimumAsymptoticValue: 0.05,  // Extinction debt floor
  legacyStock: undefined  // Not applicable
}
```

#### 1.2 Create Asymptotic Recovery Utility

**New File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/irreversibility.ts`

```typescript
import { assertFinite, assertInRange } from './assertions';

/**
 * Asymptotic recovery for irreversible planetary boundaries
 *
 * Models exponential decay toward minimum floor (not zero).
 * Used for novel entities, biosphere integrity with extinction debt.
 *
 * @param currentValue - Current boundary value (0-100)
 * @param targetValue - Desired recovery target
 * @param halfLife - Years to 50% recovery toward minimum floor
 * @param minimumAsymptoticValue - Floor value (never reaches zero)
 * @param deltaYears - Time step (default 1 month = 1/12 year)
 * @returns New boundary value after recovery step
 *
 * Research: Cousins et al. 2022 - PFAS atmospheric half-life 50-100 years
 */
export function asymptoteRecovery(
  currentValue: number,
  targetValue: number,
  halfLife: number,
  minimumAsymptoticValue: number,
  deltaYears: number = 1/12
): number {
  assertFinite(currentValue, {
    location: 'asymptoteRecovery',
    valueName: 'currentValue',
    additionalInfo: { targetValue, halfLife, minimumAsymptoticValue }
  });

  assertFinite(targetValue, {
    location: 'asymptoteRecovery',
    valueName: 'targetValue'
  });

  assertFinite(halfLife, {
    location: 'asymptoteRecovery',
    valueName: 'halfLife'
  });

  if (halfLife <= 0) {
    throw new Error('❌ CRITICAL: halfLife must be positive (years)');
  }

  assertInRange(minimumAsymptoticValue, 0, 1, {
    location: 'asymptoteRecovery',
    valueName: 'minimumAsymptoticValue'
  });

  // Decay constant from half-life: λ = ln(2) / t_half
  const decayConstant = Math.log(2) / halfLife;

  // Distance from floor
  const distanceFromFloor = Math.max(0, currentValue - minimumAsymptoticValue);

  // Exponential decay toward floor
  const newDistance = distanceFromFloor * Math.exp(-decayConstant * deltaYears);

  const newValue = minimumAsymptoticValue + newDistance;

  assertFinite(newValue, {
    location: 'asymptoteRecovery',
    valueName: 'newValue (computed)',
    additionalInfo: { currentValue, newDistance, minimumAsymptoticValue }
  });

  return newValue;
}

/**
 * Calculate legacy stock release rate
 *
 * Models slow release of accumulated contamination (PFAS banks, persistent pollution)
 *
 * @param legacyStock - Total accumulated stock (metric tons)
 * @param releaseHalfLife - Years to 50% depletion
 * @param deltaYears - Time step (default 1 month)
 * @returns Amount released this timestep (metric tons)
 */
export function legacyStockRelease(
  legacyStock: number,
  releaseHalfLife: number,
  deltaYears: number = 1/12
): number {
  assertFinite(legacyStock, {
    location: 'legacyStockRelease',
    valueName: 'legacyStock'
  });

  if (legacyStock <= 0) return 0;

  const decayConstant = Math.log(2) / releaseHalfLife;
  const released = legacyStock * (1 - Math.exp(-decayConstant * deltaYears));

  assertFinite(released, {
    location: 'legacyStockRelease',
    valueName: 'released',
    additionalInfo: { legacyStock, releaseHalfLife }
  });

  return released;
}
```

#### 1.3 Update Novel Entities Phase with Prevention-First Logic

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/novelEntities.ts`

**Key Changes:**

1. **Add prevention technologies** (3 new techs):
   - PFAS Production Ban (global ban similar to Montreal Protocol)
   - Alternative Chemistry Development (non-fluorinated substitutes)
   - Supply Chain Traceability (prevent contamination spread)

2. **Prevention effectiveness** (from Montreal Protocol):
   - 98% reduction in new contamination
   - 10-20 year implementation timeline
   - Climate co-benefits (fluorinated compounds are also GHGs)

3. **Energy-gated cleanup**:
   - Requires fusion-scale renewable energy (>100 EJ/year renewable capacity)
   - Limited to 5-15% effectiveness (concentration gap constraint)
   - Rebound effect: 10-20% production increase when cleanup deployed (CRITICAL-3 correction)

4. **Asymptotic recovery**:
   - Use `asymptoteRecovery()` function
   - 75-year half-life (50-100 year range from Montreal Protocol)
   - 15% minimum floor (background contamination)

**Implementation Pattern:**
```typescript
// Prevention-first check
const preventionDeployed = hasPreventionTechs(state);
const cleanupDeployed = hasCleanupTechs(state);

let effectiveness = 0;

if (preventionDeployed) {
  // Montreal Protocol precedent: 98% reduction
  effectiveness += 0.40;  // 40% improvement from prevention
}

if (cleanupDeployed && hasFusionEnergy(state)) {
  // Energy-gated cleanup (CRITICAL-1 correction: theoretical upper bound)
  // Limited by concentration gap (5-7 orders of magnitude for groundwater)
  effectiveness += 0.15;  // 15% max from cleanup

  // Rebound effect (CRITICAL-3 correction: 10-20% range, not fixed)
  const reboundFactor = 0.10 + rng() * 0.10;  // 10-20% rebound
  effectiveness *= (1 - reboundFactor);
}

// Apply asymptotic recovery
const boundary = state.planetaryBoundaries.novelEntities;
if (boundary.irreversible) {
  const newValue = asymptoteRecovery(
    boundary.value,
    boundary.value - effectiveness,
    boundary.recoveryHalfLife!,
    boundary.minimumAsymptoticValue!
  );

  boundary.value = newValue;
} else {
  // Standard linear recovery for non-irreversible systems
  boundary.value = Math.max(0, boundary.value - effectiveness);
}
```

### Phase 2: Biosphere Integration

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/biosphere.ts`

Add extinction debt mechanics (similar pattern to novel entities):
- 200-year recovery half-life (century-scale ecosystem recovery)
- 5% minimum floor (committed extinctions)
- Rewilding/restoration effectiveness: 10-25%

### Phase 3: Testing & Validation

#### 3.1 Determinism Tests
```bash
npx tsx scripts/verifyDeterminism.ts > logs/determinism_irreversibility_$(date +%Y%m%d_%H%M%S).log 2>&1
```
**Pass Criteria:** CV < 0.01% across N=10 runs

#### 3.2 Monte Carlo Validation
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_irreversibility_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```
**Pass Criteria:**
- Novel entities effectiveness > 0% (currently 0%)
- Expected range: 20-40% with prevention + fusion
- No NaN values in irreversibility calculations
- Outcome distribution realistic (no extinction bias)

---

## Success Criteria

1. ✅ Type safety maintained (npx tsc --noEmit)
2. ✅ No NaN values (assertion utilities in place)
3. ✅ Deterministic (CV < 0.01% across N≥10 runs)
4. ✅ Novel entities effectiveness > 0% in god mode tests
5. ✅ Prevention technologies more effective than cleanup (Montreal Protocol precedent)
6. ✅ Energy constraint properly modeled (fusion-gated cleanup)
7. ✅ Multi-century recovery timescales (50-100 years for PFAS)
8. ✅ All CRITICAL corrections from critique addressed

---

## Files to Modify

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts` - Add irreversibility properties to PlanetaryBoundary
2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/irreversibility.ts` - NEW FILE - Asymptotic recovery utilities
3. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/initialization.ts` - Initialize irreversibility properties
4. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/novelEntities.ts` - Prevention-first + energy-gated cleanup
5. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/biosphere.ts` - Extinction debt mechanics

---

## Next Steps After Implementation

1. **Monte Carlo Validation** (Priya) - N≥10 runs, check effectiveness and distributions
2. **Architecture Review** (Quality Gate 2) - architecture-skeptic review
3. **Code Quality Review** - senior-dev-reviewer
4. **Documentation** - wiki-documentation-updater
5. **Archival** - architect moves plan to completed/

---

## Research References (Key Papers)

- Cousins et al. 2022 - PFAS atmospheric persistence (50-100 year half-life)
- Glüge et al. 2020 - Global PFAS contamination (46,000 metric tons PFAAs)
- Persson et al. 2022 - Novel entities planetary boundary transgression
- Sun et al. 2016 - PFAS removal costs ($30-7,000 per ton)
- IEA 2024 - Global energy baseline (~600 EJ/year)

See full citations in research file.

---

**Roy, this is your mission. Fix the 0% effectiveness bug. Add irreversibility mechanics. Make the simulation show multi-century recovery timescales. And for the love of all that is holy, USE ASSERTION UTILITIES. 🛠️**
