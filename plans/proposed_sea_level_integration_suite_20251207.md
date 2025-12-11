# Sea Level Rise Integration Suite

**Date:** December 7, 2025
**Status:** PROPOSED
**Priority:** MEDIUM
**Estimated Effort:** 4-6 hours total (3 distinct integrations)

## Problem Statement

Session 58 architecture review (Grade B+) identified that M-4 (Abrupt Sea Level Rise) tracks coastal impacts but doesn't propagate them to downstream systems:

1. **Refugee System Gap:** `coastalPopulationDisplaced` tracked but not fed to RefugeeCrisisPhase
2. **Food Security Gap:** `agriculturalLandLost` tracked but not affecting food production
3. **Economic System Gap:** `coastalInfrastructureDamage` tracked but not affecting GDP

**Current behavior:** Sea level impacts are visible in statistics but don't trigger crises, social strain, or quality of life degradation.

**Source:** `reviews/architecture_integration_review_session58_20251206.md` (M-2, M-3)

## Proposed Solution

### Integration 1: Coastal Displacement → Refugee Crisis
**File:** `src/simulation/engine/phases/RefugeeCrisisPhase.ts`

Add sea level displacement as input to refugee crisis calculations:

```typescript
// Read from marineIceSheetState
const coastalDisplacement = state.marineIceSheetState?.coastalPopulationDisplaced ?? 0;

// Add to active refugee population
state.refugeeCrisis.activeRefugees += coastalDisplacement * deltaFactor;
```

**Research needed:** Refugee absorption capacity, integration timelines for climate migrants

**Estimated effort:** 1-2 hours

---

### Integration 2: Agricultural Land Loss → Food Security
**File:** `src/simulation/engine/phases/FoodSecurityPhase.ts` (or equivalent)

Apply coastal agricultural land loss to food production capacity:

```typescript
const landLoss = state.marineIceSheetState?.agriculturalLandLost ?? 0;

// Reduce food production proportional to land loss
const foodProductionMultiplier = 1 - (landLoss / totalAgriculturalLand);
```

**Research needed:** Coastal vs inland agricultural productivity, crop type distribution

**Estimated effort:** 2 hours

---

### Integration 3: Infrastructure Damage → Economic Impact
**File:** `src/simulation/engine/phases/EconomicPhase.ts` (or GDP calculation)

Apply infrastructure damage to GDP:

```typescript
const damage = state.marineIceSheetState?.coastalInfrastructureDamage ?? 0;

// GDP reduction from destroyed infrastructure
state.resourceEconomy.gdpPerCapita *= (1 - damage * INFRASTRUCTURE_GDP_COEFFICIENT);
```

**Research needed:** Infrastructure value as % of GDP, rebuild timelines

**Estimated effort:** 1-2 hours

---

## Research Requirements

1. **Peer-reviewed sources (2024-2025)** for:
   - Climate refugee absorption dynamics
   - Coastal agricultural land productivity vs inland
   - Infrastructure damage economic multipliers
   - Recovery timelines for each impact type

2. **Parameter justification:**
   - Refugee integration rate (people/year)
   - Food production per hectare (coastal vs inland)
   - GDP coefficient for infrastructure damage
   - Duration of economic impacts

3. **Interaction mapping:**
   - How do these integrations affect other systems?
   - Feedback loops between displacement, food, and economy?
   - Cascading effects on quality of life?

## Expected Benefits

**Realism:** Sea level rise becomes a true crisis driver (not just a statistic)

**Outcome diversity:** Scenarios with major sea level rise trigger refugee/food/economic crises

**System coherence:** M-4 outputs now propagate through the simulation properly

## Failure Modes

**Overcounting:** If displacement already factored into demographics elsewhere, could double-count impacts

**Calibration:** May need to adjust thresholds if impacts prove too severe in Monte Carlo

**Timing:** Infrastructure/land recovery could be unrealistically fast or slow without proper research

## Testing Strategy

1. **Unit tests:** Each integration (refugee, food, economic) tested in isolation
2. **Integration test:** Run scenario with intentional ice sheet collapse, verify cascades
3. **Monte Carlo validation:** N=10 runs, check outcome distributions don't skew unrealistically
4. **Comparative analysis:** Before/after integration - do sea level scenarios now matter?

## Timeline

**When does this matter?**
- Mid-to-late game (temperature > 1.5°C, ice sheets triggered)
- High-carbon scenarios without aggressive mitigation
- Scenarios testing sea level rise adaptation technologies

**Priority justification:**
- MEDIUM priority - functional gap but not blocking production
- Enhances simulation realism for climate scenarios
- Relatively small effort (4-6 hours) for significant impact

## Related Work

- **M-4 Archive:** `plans/completed/m4_abrupt_sea_level_rise_20251205.md`
- **Architecture Review:** `reviews/architecture_integration_review_session58_20251206.md`
- **Dual Ice Sheet State (M-1):** Documentation-only issue, no action needed

## Implementation Notes

Follow orchestrator workflow:
1. Research phase: Find 2+ peer-reviewed sources per integration
2. Validation phase: Research-skeptic review
3. Implementation phase: Simulation-maintainer (defensive coding, assertions)
4. Testing phase: Unit + integration + Monte Carlo
5. Review phase: Architecture-skeptic (Quality Gate 2)

**Total estimated tokens:** ~40-60k (medium complexity, 3 parallel sub-features)
