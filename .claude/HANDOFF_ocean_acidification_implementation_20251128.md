# Implementation Handoff: Ocean Acidification Cascades (RD-2)

**From:** Orchestrator
**To:** Roy (simulation-maintainer)
**Date:** November 28, 2025
**Priority:** TIER 2
**Status:** Quality Gate 1 PASSED - Ready for implementation

---

## Overview

Implement **OceanAcidificationCascadePhase** to model pH-driven cascades: coral stress → fisheries decline → food security crisis. Research complete, validated by Sylvia with corrections documented.

**Deliverables:**
1. New phase: `OceanAcidificationCascadePhase`
2. State extensions: `coralReefHealth`, `marineEcosystemFunction`, `coastalFisheriesYield`
3. Regional variation: SE Asia, Pacific Islands, Caribbean
4. Integration: Compound stress with warming, overfishing interactions
5. Unit tests + integration tests
6. Monte Carlo validation (N≥10)

**Timeline:** 4-6 hours implementation + 2 hours testing

---

## Research Summary

**Research document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ocean_acidification_cascades_20251128.md`
**Critique document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ocean_acidification_cascades_critique_20251128.md`

**Key Validated Findings:**
- ✅ Deep ocean acidification irreversible for centuries (IPCC AR6)
- ✅ pH decline: -0.002/year current, -0.08 to -0.37 units by 2100 (SSP scenarios)
- ✅ 1 billion people depend on coral reef ecosystems
- ✅ Aragonite saturation Ω < 3.0 triggers stress
- ✅ Compound stress: warming (primary) + acidification (amplifies)

**Sylvia's Critical Corrections:**
- ⚠️ Economic value: Use $100B/year (not $9.9T) - fisheries + coastal protection only
- ⚠️ pH 7.8 threshold: Probabilistic (±0.2), not deterministic
- ⚠️ Adaptation exists: Reefs transform (20-50 years), don't uniformly collapse
- ⚠️ Attribution: Model warming × acidification, not standalone pH collapse
- ⚠️ Regional variation: Some reefs adapt, others fail

---

## Implementation Parameters (Validated)

### pH Thresholds

| Threshold | pH Value | Aragonite (Ω) | Impact | Source | Certainty |
|-----------|----------|---------------|--------|--------|-----------|
| Pre-industrial | 8.1-8.2 | 4.0+ | Healthy baseline | IPCC AR6 | HIGH |
| Current (2025) | 7.9 | 3.5 | Moderate stress | IPCC AR6 | HIGH |
| Severe stress | 7.8 ± 0.2 | 2.5-3.0 | CCA collapse, bleaching | Fabricius 2015 | MEDIUM |
| Calcification ceases | 7.7 | 2.0 | Shellfish dissolution | Multiple | MEDIUM |
| Undersaturation | <7.5 | <1.0 | Skeleton dissolution | NOAA | HIGH |

**Implementation note:** Use probabilistic transition around pH 7.8, not cliff-edge collapse. Regional variation ±0.2 pH units.

### pH Decline Rates (IPCC AR6 SSP Scenarios)

| Scenario | pH by 2100 | Decline from 1995 | Rate (pH/year) |
|----------|------------|-------------------|----------------|
| SSP1-2.6 (strong mitigation) | 7.8 | -0.08 | -0.001 |
| SSP2-4.5 (moderate) | 7.7 | -0.17 | -0.002 |
| SSP3-7.0 (high emissions) | 6.6-6.7 | -0.27 | -0.003 |
| SSP5-8.5 (very high) | 6.5 | -0.37 | -0.004 |

**Current rate:** -0.002 pH/year (accelerating under business-as-usual)

### Population & Economic Impacts

| Parameter | Value | Source | Use in Model |
|-----------|-------|--------|-------------|
| Reef-dependent population | 1 billion | PMC 9827914 | `reefDependentPopulation` baseline |
| Coral Triangle population | 130 million | Multiple | Regional vulnerability |
| SE Asia fisheries decline | 65-86% by 2100 | ScienceDirect | Cascade magnitude |
| Pacific Islands decline | 58-92% by 2100 | ScienceDirect | Regional variation |
| Coastal protection value | $94B/year | Multiple | Economic impact |
| Fisheries value | $6.8B/year | Reef Resilience | Economic impact |
| **TOTAL economic** | **$100B/year** | **Sylvia's conservative estimate** | **Use this, not $9.9T** |

### Coral Calcification Response

- **Baseline calcification:** 100% at Ω = 4.0 (pre-industrial)
- **Decline rate:** -15% per unit Ω decrease (meta-analysis average)
- **Variability:** -66% to +25% (species-dependent)
- **Use:** Average -15% for aggregate reef health

### Adaptation & Recovery

| Condition | Recovery Time | Outcome | Source |
|-----------|---------------|---------|--------|
| pH stabilizes at 7.9, low local stress | 20-50 years | Transformed reef, 60% biodiversity | UPenn, PNAS 2024 |
| pH stabilizes at 7.9, high local stress | No recovery | Algae-dominated, 20% biodiversity | Multiple |
| pH improves to 8.0, low local stress | 10-30 years | Near-baseline recovery | Kāne'ohe Bay case study |
| Deep ocean | Centuries-millennia | Irreversible | IPCC AR6 |

**Implementation note:** Add `regionalResilience` parameter (varies by overfishing + pollution).

---

## State Schema Extensions

Add to `src/types/game.ts`:

```typescript
interface OceanAcidificationState {
  // Core chemistry (from existing planetaryBoundaries)
  pH: number;                          // Current surface ocean pH (read from planetaryBoundaries.oceanAcidification.currentValue)
  aragoniteSaturation: number;         // Ωarag (calculate from pH)

  // Cascade tracking
  coralReefHealth: number;             // 0-100%, tracks bleaching/mortality
  coralCalcificationRate: number;      // Relative to baseline (100% = pre-industrial)
  corallineAlgaePresence: number;      // 0-100%, critical for coral recruitment
  marineEcosystemFunction: number;     // 0-100%, broader biodiversity metric

  // Fisheries impacts
  coastalFisheriesYield: number;       // Relative to baseline (1.0 = no impact)
  reefDependentPopulation: number;     // People at risk (starts ~1 billion)
  proteinGapMillionTonnes: number;     // Missing protein if fisheries collapse

  // Economic
  coastalProtectionLossPerYear: number; // $ lost per year if reefs degrade
  fisheriesLossPerYear: number;        // $ lost per year

  // Temporal dynamics
  surfaceRecoveryPossible: boolean;    // Can surface recover if emissions cut?
  deepOceanLag: number;                // Years of continued acidification even if CO2 drops
  irreversibleLoss: number;            // 0-100%, permanent damage (extinct species)

  // Regional vulnerability
  regionalImpact: {
    seAsia: { populationAtRisk: number; fisheriesDecline: number; economicLoss: number; resilience: number; };
    pacificIslands: { populationAtRisk: number; fisheriesDecline: number; economicLoss: number; resilience: number; };
    caribbean: { populationAtRisk: number; fisheriesDecline: number; economicLoss: number; resilience: number; };
    other: { populationAtRisk: number; fisheriesDecline: number; economicLoss: number; resilience: number; };
  };
}
```

**Integration:** Add `oceanAcidification: OceanAcidificationState` to `GameState` interface.

---

## Phase Implementation: OceanAcidificationCascadePhase

**File:** `src/simulation/phases/OceanAcidificationCascadePhase.ts`

**Execution order:** After climate phases, before food security calculations
**Frequency:** Monthly (every simulation step)

### Phase Logic (Pseudocode)

```typescript
export function OceanAcidificationCascadePhase(state: GameState, rng: () => number): void {
  // CRITICAL: RNG must be required, no fallback (determinism requirement)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for OceanAcidificationCascadePhase');
  }

  // 1. Read pH from existing planetary boundaries
  const pH = state.planetaryBoundaries.oceanAcidification.currentValue;

  // 2. Calculate aragonite saturation state from pH (simplified carbonate chemistry)
  const aragoniteSaturation = calculateAragoniteSaturation(pH, state.climate.globalTemperatureAnomaly);

  // 3. Update coralline algae presence (foundation species, steep transition at pH 7.8)
  const corallineAlgaePresence = calculateCorallineAlgaePresence(pH);

  // 4. Calculate coral calcification rate from aragonite saturation
  const calcificationRate = calculateCalcificationRate(aragoniteSaturation);

  // 5. Update coral reef health (COMPOUND STRESS: warming × acidification)
  const bleachingRisk = calculateBleachingRisk(state.climate.globalTemperatureAnomaly);
  const acidificationStress = 1 - (calcificationRate / 100);
  const compoundStress = bleachingRisk * (1 + 0.3 * acidificationStress);  // Acidification amplifies warming by 30%

  // 6. Apply regional variation (resilience varies by local stressors)
  updateRegionalCoralHealth(state, compoundStress, rng);

  // 7. Update fisheries yield (non-linear dependency on coral health)
  const globalCoralHealth = calculateGlobalCoralHealth(state.oceanAcidification.regionalImpact);
  state.oceanAcidification.coastalFisheriesYield = Math.pow(globalCoralHealth / 100, 1.5);

  // 8. Update food security (protein gap)
  const avgProteinPerCapita = 50; // kg/year from reef fisheries
  state.oceanAcidification.proteinGapMillionTonnes =
    (state.oceanAcidification.reefDependentPopulation * avgProteinPerCapita *
    (1 - state.oceanAcidification.coastalFisheriesYield)) / 1e6;

  // 9. Update economic impacts
  const baseCoastalProtection = 94e9;  // $94B/year
  const baseFisheries = 6.8e9;         // $6.8B/year
  state.oceanAcidification.coastalProtectionLossPerYear =
    baseCoastalProtection * (1 - globalCoralHealth / 100);
  state.oceanAcidification.fisheriesLossPerYear =
    baseFisheries * (1 - state.oceanAcidification.coastalFisheriesYield);

  // 10. Track irreversibility (severe degradation prevents recovery)
  if (globalCoralHealth < 20) {
    state.oceanAcidification.irreversibleLoss += 0.1;  // Increment monthly
    state.oceanAcidification.irreversibleLoss = Math.min(100, state.oceanAcidification.irreversibleLoss);
  }

  // 11. Update recovery potential (depends on pH trend)
  state.oceanAcidification.surfaceRecoveryPossible = (pH > 7.7);
  state.oceanAcidification.deepOceanLag = 200; // Years (constant for deep ocean)

  // 12. Logging
  if (state.currentMonth % 12 === 0) {  // Annual logging
    console.log(`\n🌊 Ocean Acidification Cascades (Year ${Math.floor(state.currentMonth / 12)})`);
    console.log(`  pH: ${pH.toFixed(2)} | Ω: ${aragoniteSaturation.toFixed(2)}`);
    console.log(`  Global coral health: ${globalCoralHealth.toFixed(1)}%`);
    console.log(`  Fisheries yield: ${(state.oceanAcidification.coastalFisheriesYield * 100).toFixed(1)}%`);
    console.log(`  Protein gap: ${state.oceanAcidification.proteinGapMillionTonnes.toFixed(1)}M tonnes`);
    console.log(`  Economic loss: $${((state.oceanAcidification.coastalProtectionLossPerYear +
      state.oceanAcidification.fisheriesLossPerYear) / 1e9).toFixed(1)}B/year`);

    if (pH < 7.8) {
      console.log(`  ⚠️ WARNING: pH < 7.8 - Severe stress threshold crossed`);
    }
    if (state.oceanAcidification.irreversibleLoss > 50) {
      console.log(`  ☢️ CRITICAL: >50% irreversible damage - recovery unlikely even with pH restoration`);
    }
  }
}
```

### Helper Functions

```typescript
function calculateAragoniteSaturation(pH: number, tempAnomaly: number): number {
  // Simplified carbonate chemistry: Ω ≈ 4.0 at pH 8.1, Ω ≈ 3.0 at pH 7.9
  // Temperature increases reduce Ω slightly
  const baseOmega = 4.0 + (pH - 8.1) * 10;  // ~10 units per 0.1 pH
  const tempPenalty = tempAnomaly * 0.1;    // -0.1 Ω per 1°C warming
  return Math.max(0, baseOmega - tempPenalty);
}

function calculateCorallineAlgaePresence(pH: number): number {
  // Steep transition at pH 7.8 (Fabricius et al. 2015)
  // 98% presence above 7.8, 20% below 7.8
  // Use sigmoid for smooth transition
  if (pH >= 7.9) return 98;
  if (pH <= 7.7) return 20;

  const midpoint = 7.8;
  const steepness = 20;  // Controls transition sharpness
  return 20 + (78 / (1 + Math.exp(-steepness * (pH - midpoint))));
}

function calculateCalcificationRate(aragoniteSaturation: number): number {
  // Baseline: 100% at Ω = 4.0 (pre-industrial)
  // Decline: -15% per unit Ω below 3.0 (meta-analysis average)
  const baseline = 100;
  const stressThreshold = 3.0;
  const declineRate = 15;  // % per unit Ω

  if (aragoniteSaturation >= stressThreshold) {
    return baseline;
  }

  const decline = declineRate * (stressThreshold - aragoniteSaturation);
  return Math.max(0, baseline - decline);
}

function calculateBleachingRisk(tempAnomaly: number): number {
  // Temperature-driven bleaching (existing climate model integration)
  // Threshold: +1-2°C above normal triggers bleaching
  if (tempAnomaly < 1.0) return 0;
  if (tempAnomaly >= 2.0) return 1.0;

  return (tempAnomaly - 1.0);  // Linear ramp 1°C → 2°C
}

function updateRegionalCoralHealth(
  state: GameState,
  compoundStress: number,
  rng: () => number
): void {
  // Regional resilience varies by local stressors (overfishing, pollution)
  const regions = ['seAsia', 'pacificIslands', 'caribbean', 'other'] as const;

  for (const region of regions) {
    const resilience = state.oceanAcidification.regionalImpact[region].resilience;
    const localStress = compoundStress * (1 - resilience * 0.5);  // Resilience reduces stress by up to 50%

    // Apply stress with stochastic variation
    const monthlyDamage = localStress * (0.8 + 0.4 * rng());  // ±20% variation
    const currentHealth = state.oceanAcidification.regionalImpact[region].coralHealth ?? 100;
    const newHealth = Math.max(0, currentHealth - monthlyDamage);

    // Adaptation pathway: if health < 50% but resilience high, transform to adapted reef
    if (newHealth < 50 && resilience > 0.6) {
      // Transformed reef: reduced biodiversity but persistent
      state.oceanAcidification.regionalImpact[region].coralHealth = Math.max(newHealth, 40);
    } else if (newHealth < 50 && resilience <= 0.6) {
      // Collapse to algae-dominated state
      state.oceanAcidification.regionalImpact[region].coralHealth = newHealth;
    } else {
      state.oceanAcidification.regionalImpact[region].coralHealth = newHealth;
    }

    // Update regional fisheries decline
    const healthFraction = (state.oceanAcidification.regionalImpact[region].coralHealth ?? 100) / 100;
    state.oceanAcidification.regionalImpact[region].fisheriesDecline =
      (1 - Math.pow(healthFraction, 1.5)) * 100;  // Non-linear dependency
  }
}

function calculateGlobalCoralHealth(regionalImpact: any): number {
  // Population-weighted average of regional coral health
  const seAsiaWeight = 0.4;
  const pacificWeight = 0.3;
  const caribbeanWeight = 0.2;
  const otherWeight = 0.1;

  return (
    (regionalImpact.seAsia.coralHealth ?? 100) * seAsiaWeight +
    (regionalImpact.pacificIslands.coralHealth ?? 100) * pacificWeight +
    (regionalImpact.caribbean.coralHealth ?? 100) * caribbeanWeight +
    (regionalImpact.other.coralHealth ?? 100) * otherWeight
  );
}
```

---

## Integration Points

### 1. Climate System (Compound Stress)

**Read from:**
- `state.climate.globalTemperatureAnomaly` - For bleaching risk calculation
- `state.planetaryBoundaries.oceanAcidification.currentValue` - For pH

**Interaction:**
- Warming is primary driver of bleaching
- Acidification amplifies warming damage by 30%
- Model as multiplicative, not additive

### 2. Food Security System

**Write to:**
- `state.oceanAcidification.proteinGapMillionTonnes` - Fish protein deficit
- Should be read by food security calculations

**Interaction:**
- Reef fisheries collapse → protein gap → malnutrition
- Regional variation: SE Asia + Pacific Islands most affected

### 3. Economic Impact

**Write to:**
- `state.oceanAcidification.coastalProtectionLossPerYear` - Infrastructure damage
- `state.oceanAcidification.fisheriesLossPerYear` - Economic loss

**Note:** Use conservative $100B/year total, not $9.9T

### 4. Overfishing (Future Integration)

**Read from:**
- `state.fishingQuotas` (if exists) - Local stressor modifier

**Interaction:**
- Overfishing + acidification = multiplicative damage
- Managed fisheries = higher resilience (can adapt)

---

## Testing Requirements

### Unit Tests

**File:** `tests/simulation/OceanAcidificationCascadePhase.test.ts`

**Test cases:**
1. **Aragonite calculation:** pH 7.9 → Ω ≈ 3.0, pH 7.8 → Ω ≈ 2.0
2. **Coralline algae transition:** pH 7.9 → 98%, pH 7.7 → 20%
3. **Calcification decline:** Ω 3.0 → 100%, Ω 2.0 → 85%
4. **Compound stress:** warming alone ≠ acidification alone < warming + acidification
5. **Regional variation:** High resilience → transformed reef (40% health floor), low resilience → collapse (<20%)
6. **Determinism:** Same RNG seed → identical outcomes (Monte Carlo requirement)
7. **NaN prevention:** No `?? fallback` patterns, use assertion utilities

### Integration Tests

**Test scenarios:**
1. **SSP1-2.6 (strong mitigation):** pH stabilizes at 7.8 by 2100, coral health ~60%, fisheries -30%
2. **SSP5-8.5 (no mitigation):** pH drops to 6.5 by 2100, coral health <10%, fisheries -80%
3. **Regional differentiation:** SE Asia (low resilience) collapses faster than Red Sea (high resilience)
4. **Compound stress validation:** Warming + acidification causes faster collapse than either alone

### Monte Carlo Validation

**After implementation, Priya will run:**
- N = 10 simulations with different RNG seeds
- Validate determinism: CV < 0.01% for all metrics
- Check outcome distributions: SSP scenarios produce expected pH ranges
- Verify cascade timing: Coral loss tracks temperature + pH trajectories

**Expected outcomes:**
- SSP1-2.6: 60-80% coral survival by 2100
- SSP2-4.5: 30-50% coral survival
- SSP5-8.5: <20% coral survival

---

## Success Criteria

- ✅ Phase executes without errors
- ✅ All unit tests pass
- ✅ Integration tests show realistic SSP scenario outcomes
- ✅ Monte Carlo: 0% crash rate, CV < 0.01% (determinism)
- ✅ Logging shows clear cascade progression
- ✅ No NaN values (use assertion utilities)
- ✅ Regional variation visible (SE Asia ≠ Pacific Islands ≠ Caribbean)
- ✅ Compound stress: warming + acidification > warming alone

---

## Critical Implementation Notes

### 1. Defensive Coding (NO SILENT FALLBACKS)

**❌ BAD:**
```typescript
const pH = state.planetaryBoundaries.oceanAcidification?.currentValue ?? 8.1;
```

**✅ GOOD:**
```typescript
import { assertStateProperty } from '@/simulation/utils/assertions';

const pH = assertStateProperty(
  state.planetaryBoundaries.oceanAcidification,
  'currentValue',
  { location: 'OceanAcidificationCascadePhase', month: state.currentMonth }
);
```

### 2. RNG Requirement (NO FALLBACK TO Math.random)

**❌ BAD:**
```typescript
function phase(state: GameState, rng?: () => number) {
  const random = rng || Math.random;  // BREAKS DETERMINISM!
}
```

**✅ GOOD:**
```typescript
function phase(state: GameState, rng: () => number) {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
  const random = rng;
}
```

### 3. Emoji Conventions

**Register in `docs/EMOJI_EVENT_MAP.txt` BEFORE committing:**
```
🌊 | Ocean acidification events
⚠️ | Warning (pH < 7.8 threshold)
☢️ | Critical irreversible damage
```

### 4. Logging Pattern

**Monthly updates (if needed), annual summaries:**
```typescript
if (state.currentMonth % 12 === 0) {
  console.log(`\n🌊 Ocean Acidification (Year ${Math.floor(state.currentMonth / 12)})`);
  // Annual summary
}
```

**Event-driven alerts:**
```typescript
if (pH < 7.8 && !alertFired) {
  console.log(`⚠️ THRESHOLD CROSSED: Ocean pH < 7.8 - Severe coral stress`);
  alertFired = true;
}
```

---

## File Checklist

- [ ] `src/types/game.ts` - Add `OceanAcidificationState` interface
- [ ] `src/simulation/phases/OceanAcidificationCascadePhase.ts` - New phase
- [ ] `src/simulation/engine/PhaseOrchestrator.ts` - Add phase to execution order
- [ ] `tests/simulation/OceanAcidificationCascadePhase.test.ts` - Unit tests
- [ ] `tests/integration/oceanAcidification.test.ts` - Integration tests
- [ ] `docs/EMOJI_EVENT_MAP.txt` - Register 🌊 emoji
- [ ] `src/simulation/initialization/initializeGameState.ts` - Initialize ocean acidification state

---

## Next Steps After Implementation

1. **Roy completes implementation** → Unit tests pass
2. **Integration tests** → SSP scenarios produce realistic outcomes
3. **Hand off to Priya** → Monte Carlo validation (N≥10)
4. **Architecture review** → Spawn architecture-skeptic for performance/integration review
5. **Documentation** → Spawn wiki-documentation-updater
6. **Archival** → Spawn architect to update roadmap

**Blocking issues:** NONE - ready to implement

**Questions/clarifications:** Post to `implementation` chatroom channel

---

**Orchestrator's note:** Roy, this is a well-validated feature. Sylvia's critique ensures we're not over-pessimistic (reefs can adapt) but also not over-optimistic (alkalinization isn't a magic bullet). The key is compound stress modeling - acidification AMPLIFIES warming damage, it's not a standalone collapse driver. Regional variation matters - Great Barrier Reef will fail, Red Sea might persist. Model transformation, not apocalypse.

**Status:** READY FOR IMPLEMENTATION ✅
