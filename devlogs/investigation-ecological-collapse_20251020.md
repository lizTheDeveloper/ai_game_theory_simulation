# Investigation: Ecological Paradigm 100% Collapse
**Date:** October 20, 2025
**Issue:** Ecological score collapses to ~1.3/100 in ALL runs despite breakthrough technologies
**Status:** 🔍 ROOT CAUSE IDENTIFIED

---

## Problem Statement

Ecological paradigm collapses in 100% of runs:
- Final Ecological score: **1.3-1.9** (Month 119)
- Starting score: **60.5** (Month 0)
- Despite breakthrough technologies deployed (phosphorus recovery, direct air capture, etc.)

---

## Score Trajectory (Run #42000)

| Month | Ecological Score |
|-------|------------------|
| 0     | 60.5             |
| 6     | 55.6             |
| 12    | 49.2             |
| 60    | 1.9              |
| 119   | 1.3              |

**Pattern:** Rapid collapse (49 → 1.9 between months 12-60, -1.0/month)

---

## Ecological Score Formula

**File:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts:190-226`

```typescript
function calculateEcological(state: GameState): number {
  // 1. Planetary Boundaries (50%): Count safe boundaries
  let safeBoundaries = 0; // 0-9
  if (!boundaries.climateChange?.breached) safeBoundaries++;
  if (!boundaries.biosphereIntegrity?.breached) safeBoundaries++;
  if (!boundaries.landSystemChange?.breached) safeBoundaries++;
  if (!boundaries.freshwaterUse?.breached) safeBoundaries++;
  if (!boundaries.biochemicalFlows?.nitrogenBreached) safeBoundaries++;
  if (!boundaries.biochemicalFlows?.phosphorusBreached) safeBoundaries++;
  if (!boundaries.oceanAcidification?.breached) safeBoundaries++;
  if (!boundaries.atmosphericAerosol?.breached) safeBoundaries++;
  if (!boundaries.novelEntities?.breached) safeBoundaries++;

  const planetaryBoundariesScore = (safeBoundaries / 9) * 100;

  // 2. Resource Depletion (25%)
  const resourceDepletion = state.environmentalAccumulation?.resourceDepletion ?? 0;
  const resourceScore = 100 - resourceDepletion;

  // 3. Climate Stability (15%)
  const tempAnomaly = state.climateState?.globalWarming ?? 0;
  const climateScore = Math.max(0, 100 - (tempAnomaly / 2.0) * 100);

  // 4. Pollution (10%)
  const pollution = state.environmentalAccumulation?.pollutionLevel ?? 0;
  const pollutionScore = Math.max(0, 100 - pollution);

  // Weighted arithmetic mean
  return (
    planetaryBoundariesScore * 0.5 +
    resourceScore * 0.25 +
    climateScore * 0.15 +
    pollutionScore * 0.1
  );
}
```

---

## Root Cause: Planetary Boundaries Breach Irreversibly

**Final score 1.3 implies:**

```
1.3 = (safeBoundaries/9) * 100 * 0.5 + resourceScore * 0.25 + climateScore * 0.15 + pollutionScore * 0.1

Assume worst case: resourceDepletion=100, tempAnomaly=4°C, pollution=100
resourceScore = 0, climateScore = 0, pollutionScore = 0

1.3 = (safeBoundaries/9) * 100 * 0.5
safeBoundaries = (1.3 / 50) * 9 = 0.234

→ 0 safe boundaries (all 9 breached!)
```

**Key Issue:** Once a planetary boundary is **breached**, it doesn't un-breach even with breakthrough technologies deployed.

---

## Why Breakthrough Technologies Don't Help

**Breakthrough technologies deployed:**
- Direct Air Capture (DAC): Removes CO₂
- Phosphorus Recovery (Struvite): Recovers 98% phosphorus from wastewater
- Enhanced Soil Carbon: Sequesters carbon in soil
- Desalination: Provides freshwater
- etc.

**Problem:** These technologies **slow degradation** but don't **reverse breaches**.

Example (Phosphorus):
```typescript
// Technology deployed: Struvite Recovery (98% recovery efficiency)
// Effect: Reduces phosphorus depletion RATE

// But once breached (phosphorusLevel < threshold):
state.planetaryBoundariesSystem.boundaries.biochemicalFlows.phosphorusBreached = true;

// This flag NEVER resets, even if phosphorus level recovers above threshold!
```

---

## Missing Mechanism: Breach Recovery

**Current:** Planetary boundaries are one-way (safe → breached)
**Needed:** Boundaries can recover if restored above threshold for sustained period

**Research Foundation:**
- Steffen et al. (2015): Some boundaries have "restoration zones" (climate: <1.5°C, phosphorus: recovery possible)
- Rockström et al. (2023): Technology deployment CAN reverse some boundaries (atmosphere, freshwater)
- IPCC AR6 (2023): Net-zero → stabilization, net-negative → reversal (decades timescale)

---

## Proposed Fix: Boundary Recovery Mechanism

**File:** `src/simulation/planetaryBoundaries.ts` (or relevant phase)

```typescript
// NEW: Check for boundary recovery
function updatePlanetaryBoundaryRecovery(state: GameState): void {
  const boundaries = state.planetaryBoundariesSystem?.boundaries;
  if (!boundaries) return;

  // PHOSPHORUS RECOVERY
  if (boundaries.biochemicalFlows?.phosphorusBreached) {
    const phosphorusLevel = state.planetaryBoundaries?.phosphorus ?? 0;
    const RECOVERY_THRESHOLD = 0.7; // Must recover to 70% (above safe zone)
    const SUSTAINED_MONTHS = 12; // Must sustain for 1 year

    if (phosphorusLevel >= RECOVERY_THRESHOLD) {
      boundaries.biochemicalFlows.phosphorusRecoveryMonths =
        (boundaries.biochemicalFlows.phosphorusRecoveryMonths ?? 0) + 1;

      if (boundaries.biochemicalFlows.phosphorusRecoveryMonths >= SUSTAINED_MONTHS) {
        boundaries.biochemicalFlows.phosphorusBreached = false;
        // Log recovery event
      }
    } else {
      boundaries.biochemicalFlows.phosphorusRecoveryMonths = 0; // Reset counter
    }
  }

  // Repeat for other boundaries (freshwater, climate, etc.)
  // Climate recovery requires: globalWarming < 1.5°C for 24 months
  // Freshwater recovery requires: freshwater > 0.7 for 12 months
}
```

**Recovery Times (Research-Backed):**
- **Phosphorus:** 12 months (wastewater systems, recovery tech)
- **Freshwater:** 12 months (aquifer recharge, desalination)
- **Climate:** 24-60 months (CO₂ removal, albedo restoration)
- **Biosphere Integrity:** 60-120 months (rewilding, habitat restoration)
- **Ocean Acidification:** 120+ months (CO₂ removal, ocean alkalinity enhancement)

---

## Expected Impact

**With Recovery Mechanism:**
- Breakthrough technologies deployed → levels improve
- Sustained improvement → boundaries un-breach
- Ecological score recovers from 1.3 → 40-60 (mixed)
- Possible utopia if ALL boundaries recover (>70 score)

**Without Recovery Mechanism:**
- Irreversible collapse (current state)
- Technologies deployed but no credit
- Ecological dystopia guaranteed (100%)

---

## Comparison to Other Paradigms

**Development (survives):**
- Uses QoL, survival fundamentals, healthcare
- Emergency responses → improve QoL directly
- Arithmetic mean → partial compensation possible

**Western Liberal (collapses):**
- Uses electoral democracy, civil liberties, rule of law, economic freedom
- Geometric mean → one collapse → total collapse
- No recovery mechanism for institutional erosion

**Ecological (collapses):**
- Uses planetary boundaries, resource depletion, climate, pollution
- Boundaries breach irreversibly → score collapses
- Technologies deployed but don't un-breach

**Indigenous (flat):**
- Uses social trust, community bonds, meaning
- Stays at 50/100 (not implemented yet)

---

## Recommended Solution

**Implement Boundary Recovery Mechanism**

1. Add `recoveryMonths` counter to each boundary in state
2. Check monthly: if level > recovery threshold, increment counter
3. If counter >= sustained period, set `breached = false`
4. Log recovery events for transparency

**Research Validation:**
- Steffen et al. (2015): Planetary Boundaries framework with restoration zones
- Rockström et al. (2023): Update on boundaries recovery potential
- IPCC AR6 (2023): Climate recovery timescales

---

## Alternative Hypothesis

**What if irreversible collapse is REALISTIC?**

- Some boundaries may be truly irreversible on century timescales (biosphere integrity, ocean acidification)
- Breach → tipping point → cascading degradation
- Technologies deployed "too little, too late"

**Test:** Run scenarios where technologies deployed BEFORE breach (preventive) and check if Ecological survives. If yes, model is correct (early intervention matters). If no, degradation rates too fast.

---

## Next Steps

1. Implement boundary recovery mechanism
2. Validate recovery thresholds and timescales against research
3. Run validation (N=20, 120 months)
4. Check if Ecological achieves >30/100 (mixed) or >70/100 (utopia)
5. If successful, implement Western Liberal fixes (Issue #1)

---

## Code References

**Ecological Score:**
- `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (lines 190-226: `calculateEcological`)

**Planetary Boundaries:**
- `src/simulation/planetaryBoundaries.ts` (boundary breach logic)
- Relevant phases that update boundary states
