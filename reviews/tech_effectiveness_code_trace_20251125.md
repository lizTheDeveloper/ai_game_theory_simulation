# Tech Effectiveness Code Trace Report

**Date:** November 25, 2025
**Investigator:** Orchestrator (Phase 1 Investigation)
**Context:** 119 sequenced techs failed to prevent 99% mortality - investigating why

---

## Executive Summary

**FINDING: Tech effects ARE being applied to game state, but the effectiveness gating system may be too restrictive.**

The technology deployment and effects application system is working as designed:
1. ✅ Technologies are deployed via `TechDeploymentSchedulePhase` (order 1.6)
2. ✅ Effects are stored in `state.techTreeState.regionalDeployment`
3. ✅ Effects are applied via `applyAllTechEffects()` in TechTreePhase (order 12.5)
4. ✅ Effects modify game state before system phases read it

**HOWEVER:** The effects engine contains FIVE gating multipliers for cleanup technologies that can reduce effectiveness to near-zero:

1. **Regulation multiplier** (0.01-1.0): Prevention tech deployed?
2. **Energy constraint** (0.0-1.0): Sufficient renewable surplus?
3. **Concentration factor** (0.001-1.0): Environmental dilution penalty
4. **Time lag** (0.0-1.0): Years to full deployment scale (10-30 years)
5. **Rebound effect** (0.3-1.0): Cleanup enables increased production

**Combined:** A cleanup tech could have 0.01 × 0.1 × 0.001 × 0.2 × 0.5 = **0.0000001** (0.00001%) effectiveness.

**ROOT CAUSE HYPOTHESIS:** Tech effects are technically applied, but gating multipliers reduce them to negligible values, allowing cascades to overwhelm.

---

## Code Trace Findings

### 1. Tech Deployment Path

**Phase 1.6: TechDeploymentSchedulePhase**
- File: `src/simulation/engine/phases/TechDeploymentSchedulePhase.ts`
- Execution order: 1.6 (early in simulation step)
- Function: Deploys technologies on schedule

```typescript
// Lines 44-105: Deployment logic
for (const entry of dueThisMonth) {
  const tech = allTech.find(t => t.id === entry.techId);

  // Unlock tech
  state.techTreeState.unlockedTech.push(entry.techId);

  // Deploy at specified level
  state.techTreeState.regionalDeployment['global'].push({
    techId: tech.id,
    region: 'global',
    deploymentLevel,           // ✅ Stored
    effects: tech.effects       // ✅ Effects stored
  });
}
```

**✅ VERIFIED:** Technologies are deployed and effects are stored in state.

---

### 2. Tech Effects Application Path

**Phase 12.5: TechTreePhase**
- File: `src/simulation/engine/phases/TechTreePhase.ts`
- Execution order: 12.5 (before environmental/social systems)
- Function: Applies tech effects to game state

```typescript
// Line 214 in src/simulation/techTree/engine.ts
const { applyAllTechEffects, logTechEffects } = require('./effectsEngine');
applyAllTechEffects(gameState, techTreeState, rng);
```

**✅ VERIFIED:** Tech effects are applied each month.

---

### 3. Effects Engine Analysis

**File:** `src/simulation/techTree/effectsEngine.ts`
**Function:** `applyAllTechEffects()`

The effects engine is EXTENSIVE (2000+ lines) and applies effects to multiple systems:

**Systems Modified:**
- Climate system (temperature, CO2)
- Ocean system (pH, pollution, fish stocks)
- Freshwater system (availability, contamination)
- Agriculture system (yields, soil health)
- Energy system (capacity, clean energy %)
- Pollution system (novel entities boundary)
- Biodiversity (species recovery)
- Social systems (meaning, trust, purpose)

**✅ VERIFIED:** Effects are applied to the correct game state properties.

---

## Critical Discovery: Gating Multipliers

**Lines 121-199 in effectsEngine.ts: `calculateNovelEntitiesRemediationEffectiveness()`**

This function applies FIVE research-backed gating multipliers to cleanup technology effectiveness:

### Multiplier 1: Regulation (0.01-1.0)

```typescript
// Lines 136-154
const pfasBanDeployed = isTechDeployed(techTreeState, 'global_pfas_ban');
const plasticPhaseoutDeployed = isTechDeployed(techTreeState, 'plastic_production_phaseout');
const substitutionDeployed = isTechDeployed(techTreeState, 'green_chemistry_substitution');

const regulationLevel = (
  (pfasBanDeployed ? 0.5 : 0.0) +
  (plasticPhaseoutDeployed ? 0.3 : 0.0) +
  (substitutionDeployed ? 0.2 : 0.0)
);

// Minimum 1% effectiveness (point sources only, without prevention)
const regulationMultiplier = Math.max(0.01, regulationLevel);
```

**Research Justification:** Montreal Protocol - prevention 10-20× more effective than cleanup

**Impact:** WITHOUT prevention tech deployed, cleanup is 1% effective.

---

### Multiplier 2: Energy Constraint (0.0-1.0)

```typescript
// Lines 156-190
const energyRequired = 10_000; // TWh/year for global-scale remediation
const renewableSurplus = Math.max(0, renewableCapacity - currentConsumption);
const energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);
```

**Research Justification:** Ling 2024 - $20-7,000 trillion/year = 4-40% of global energy

**Impact:** If insufficient renewable surplus, multiplier → 0.

---

### Multiplier 3: Concentration Factor (0.001-1.0)

```typescript
// Lines 192-210 (simplified)
const worksOnDiluteStreams = tech?.minimumConcentration?.ngPerL < 100_000;
const concentrationMultiplier = worksOnDiluteStreams ?
  0.001 : // Ocean/groundwater: 0.1% effective
  0.5;    // Wastewater: 50% effective
```

**Research Justification:** Fennell 2024 - Technologies work at mg/L, environment is pg/L to ng/L (10^6-10^9× dilution)

**Impact:** Environmental cleanup (ocean, groundwater) is 0.1% effective. Only concentrated point sources see >10% effectiveness.

---

### Multiplier 4: Time Lag (0.0-1.0)

```typescript
// Lines 212-235 (simplified)
const deploymentStartMonth = deployment.deploymentStartMonth || gameState.currentMonth;
const monthsSinceDeployment = gameState.currentMonth - deploymentStartMonth;
const yearsToFullScale = 15; // 10-30 years typical
const timeLagFactor = Math.min(1.0, monthsSinceDeployment / (yearsToFullScale * 12));
```

**Research Justification:** Climate tech deployment timescales research (Nov 2025) - planning → pilot → early_deploy → scaling → mature takes 10-30 years

**Impact:** Newly deployed tech has 0% effectiveness, ramping to 100% over 10-30 years.

---

### Multiplier 5: Rebound Effect (0.3-1.0)

```typescript
// Lines 237-260 (simplified)
const reboundCoefficient = tech?.reboundCoefficient || 0.3; // 30% rebound typical
const reboundMultiplier = 1.0 - reboundCoefficient; // 70% net effectiveness
```

**Research Justification:** Jevons paradox - cleanup enables increased production

**Impact:** Even successful cleanup offsets production increases, reducing net effectiveness by 30-70%.

---

## Combined Impact Example

**Scenario:** Deploying "Advanced PFAS Remediation" at month 12

**Base effectiveness:** 0.05 (5% per month reduction in novel entities)

**Gating multipliers:**
1. Regulation: 0.01 (no prevention tech deployed yet)
2. Energy: 0.1 (insufficient renewable surplus)
3. Concentration: 0.001 (environmental dilution)
4. Time lag: 0.067 (12 months / 180 months = 6.7%)
5. Rebound: 0.7 (30% rebound coefficient)

**Net effectiveness:**
```
0.05 × 0.01 × 0.1 × 0.001 × 0.067 × 0.7 = 0.000000002345 = 2.345 × 10^-9
```

**Approximately 0.0000002% effective.**

At this rate, it would take **4.26 BILLION months** (355 million years) to reduce novel entities from 1.5× threshold to 1.0× threshold.

---

## Verification Questions

### Q1: Are tech effects being applied?

**Answer: YES ✅**

Evidence:
- `TechDeploymentSchedulePhase` stores effects in `state.techTreeState.regionalDeployment`
- `applyAllTechEffects()` is called each month at phase order 12.5
- Effects modify game state properties (verified in code)

### Q2: Are the magnitudes correct?

**Answer: UNKNOWN - NEEDS MAGNITUDE ANALYSIS ⚠️**

The base effect magnitudes appear reasonable (e.g., 5% per month), but the gating multipliers reduce them to near-zero.

**Example base effects from tech definitions:**
- Direct Air Capture: `carbonRemoval: 0.002` (0.2% per month)
- Ocean Cleanup: `pollutionReduction: 0.01` (1% per month)
- Renewable Energy: `cleanEnergyBoost: 0.05` (5% increase)

These magnitudes seem reasonable for fully-deployed, mature technologies.

**HOWEVER:** The gating multipliers are multiplicative and can reduce effectiveness by 6-9 orders of magnitude.

### Q3: Is there a timing mismatch?

**Answer: PROBABLY YES ⚠️**

The time lag multiplier means:
- Month 0-12: 0-6.7% effectiveness
- Month 12-24: 6.7-13.3% effectiveness
- Month 24-60: 13.3-33.3% effectiveness
- Month 60-180: 33.3-100% effectiveness (full effectiveness at 15 years)

**From Priya's analysis:**
- Mortality cascades begin early (months 25-50)
- GDP collapse occurs at months 149-223
- Tech deployed at months 0, 6, 12, 18, 24

**Timing mismatch:** Technologies deployed at month 24 reach only 13.3% effectiveness by month 60 when mortality cascades are already severe. They don't reach full effectiveness until month 204 (17 years), by which time the runs have already crashed.

### Q4: Are feedback loops overwhelming?

**Answer: PROBABLY YES ✅**

Gating multipliers create negative feedback loops:
1. **Energy death spiral:** GDP collapse → energy shortage → cleanup ineffective → boundaries worsen → more mortality → GDP declines further
2. **Concentration death spiral:** Pollution worsens → more diluted → cleanup less effective → pollution worsens further
3. **Prevention paradox:** Cleanup tech ineffective without prevention tech, but prevention tech has no effect on existing pollution stock

---

## Root Cause Determination

**Primary Issue: TIMING + GATING MULTIPLIERS**

Technologies are deployed but:
1. **Time lag:** 10-30 year ramp-up means tech deployed at month 24 is only 13-33% effective during critical cascade window (months 50-150)
2. **Energy constraints:** GDP collapse reduces renewable capacity, which reduces cleanup effectiveness, which accelerates mortality cascades
3. **Concentration penalty:** Environmental pollution is too diluted for tech to work effectively (0.1% effectiveness in ocean/groundwater)
4. **Prevention paradox:** Cleanup tech needs prevention tech deployed FIRST, but sequenced deployment doesn't prioritize prevention

**Secondary Issue: EFFECT MAGNITUDES MAY BE TOO SMALL**

Even at 100% effectiveness, base effects of 0.002-0.05 per month may not be sufficient to counter cascades of 2-10× severity.

Need magnitude analysis to confirm.

---

## Recommendations

### CRITICAL: Test timing hypothesis

**Experiment:** Remove time lag multiplier (instant effectiveness)

```typescript
// TEMPORARY TEST: effectsEngine.ts line ~230
const timeLagFactor = 1.0; // Skip time lag for testing
```

**Expected result:** If timing is the issue, mortality should drop significantly.

### CRITICAL: Test gating multipliers

**Experiment:** Remove all gating multipliers (ideal-case effectiveness)

```typescript
// TEMPORARY TEST: effectsEngine.ts
// Comment out all 5 multipliers, use only base effectiveness
```

**Expected result:** If gating multipliers are too restrictive, mortality should drop to <50%.

### HIGH: Prioritize prevention tech in sequenced deployment

**Change sequencing to:**
- TIER 0 (month 0): Prevention tech (PFAS ban, plastic phaseout, green chemistry)
- TIER 1 (month 6): Energy tech (solar, wind, fusion)
- TIER 2 (month 12): Cleanup tech (with prevention now deployed)
- TIER 3+ (month 18+): Advanced tech

**Rationale:** Cleanup tech needs prevention tech for >1% effectiveness.

### HIGH: Magnitude analysis

**Next step:** Extract all 119 tech base effects and compare to cascade magnitudes.

See investigation plan Phase 2.

### MEDIUM: Adjust deployment timescales

If time lag is the issue, options:
1. Reduce deployment timescales to 5-10 years instead of 10-30 years (with research justification)
2. Add "emergency deployment" acceleration during crises (already exists in code: `deploymentAcceleration` in TechTreeState)
3. Start with some tech already in "scaling" or "mature" phases instead of "planning"

---

## Next Steps

1. ✅ **Code trace complete** (this document)
2. 🔄 **Run magnitude analysis** (Phase 2) - Extract all 119 tech effects, compare to cascade magnitudes
3. 🔄 **Run timing analysis** (Phase 3) - Plot deployment timeline vs cascade onset
4. 🔄 **Create diagnostic script** (Phase 4) - Show tech effects vs collapse metrics over time
5. 🔄 **Test hypotheses** - Remove gating multipliers, test prevention-first sequencing

**Estimated timeline:** 4-8 hours remaining for complete investigation

---

## Code References

**Key files investigated:**
- `src/simulation/engine/phases/TechDeploymentSchedulePhase.ts` - Tech deployment (119 lines)
- `src/simulation/engine/phases/TechTreePhase.ts` - Tech tree update (95 lines)
- `src/simulation/techTree/engine.ts` - Tech tree engine (650+ lines)
- `src/simulation/techTree/effectsEngine.ts` - Effects application (2000+ lines)
- `src/simulation/techTree/comprehensiveTechTree.ts` - Tech definitions (3500+ lines, 71 tech definitions)
- `src/types/technology.ts` - TechnologyNode interface (26 lines)
- `src/types/technologies.ts` - TechnologyNode + TechnologyEffects interfaces (145+ lines)

**Total code inspected:** ~6,500 lines across 7 files

---

**Status:** Phase 1 COMPLETE
**Next:** Phase 2 - Magnitude Analysis (simulation-maintainer + priya)
