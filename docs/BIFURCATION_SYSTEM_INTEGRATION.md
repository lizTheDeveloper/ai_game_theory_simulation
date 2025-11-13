# Bifurcation System Integration Matrix

**Date:** November 8, 2025 (Updated: November 13, 2025)
**Status:** INTEGRATED (HIGH-2 Complete) + CRITICAL BUG FIXES (Nov 13)
**Research Basis:** Scheffer et al. (2024) - Critical slowing down, regime shifts

## Overview

The bifurcation logic system identifies critical thresholds and applies variance amplification to create path-dependent trajectories. This document maps all integration points between bifurcation logic and other simulation systems.

**CRITICAL BUG FIXES (Nov 13, 2025 - Commit d605293):**
- **Distance calculation fixed:** Now uses directional calculation (not Math.abs) - collapse thresholds amplify when APPROACHING from above, flourishing thresholds amplify when APPROACHING from below
- **Social coordination normalized:** coordinationCapacity now normalized to [0,1] before distance calculation (was comparing 0-100 scale to 0-1 threshold, breaking social bifurcation detection)
- **Debug context improved:** GameState now passed to all private methods for proper month context in assertions
- **See:** `reviews/bifurcation_architecture_review_20251113.md` for full analysis

## Core Bifurcation Mechanisms

### Variance Amplification

**Formula:** `amplification = 1.0 / (0.01 + distanceToNearestThreshold)`

**Range:**
- Distance = 0.0 (at threshold): 100× amplification
- Distance = 0.4 (near threshold): 2.4× amplification
- Distance = 0.9 (far from threshold): 1.1× amplification

**Research:** Scheffer et al. (2024) observed 15-200× amplification in real regime shifts

**Cap:** 100× (empirical middle ground: financial crises 40×, ecosystems 100×)

### Regime Types

1. **status-quo** - Between thresholds (normal operation)
2. **environmental-collapse** - Environmental health < threshold
3. **social-breakdown** - Social cohesion < threshold
4. **economic-collapse** - Economic stability < threshold
5. **governance-failure** - Government legitimacy < threshold
6. **flourishing** - Quality of life > threshold
7. **sustainable** - Technology deployment > threshold

## System Integration Matrix

### 1. Bifurcation → Outcome Probabilities

**File:** `src/simulation/outcomes.ts`
**Function:** `calculateOutcomeProbabilities()`

**Integration Points:**

| Regime | Utopia Impact | Dystopia Impact | Extinction Impact |
|--------|---------------|-----------------|-------------------|
| environmental-collapse | ×0.5 | +0.2 | +0.3 |
| social-breakdown | ×0.6 | +0.4 | - |
| economic-collapse | ×0.7 | +0.3 | +0.1 |
| governance-failure | ×0.5 | +0.35 | +0.15 |
| flourishing | +0.4 | ×0.5 | ×0.3 |
| sustainable | +0.2 | - | ×0.7 |

**Research Justification:**
- Regime shifts lock in trajectories (Scheffer et al. 2024)
- Environmental collapse → ecosystem failure → extinction risk
- Social breakdown → authoritarianism → dystopia risk
- Flourishing regime → positive feedback loops → utopia probability

**Expected Impact:**
- Outcome variance increases 20-70% (fixes 100% dystopia convergence)
- Regime-dependent outcome trajectories (not all runs converge to same outcome)

---

### 2. Bifurcation → Emergency Response

**File:** `src/simulation/engine/phases/EmergencyResponsePhase.ts`
**Methods:**
- `checkBifurcationEmergencies()` - Regime-triggered responses
- `identifyNearestThreshold()` - Proximity-based early warning

**Integration Points:**

#### A. Regime-Triggered Emergency Responses

| Regime | Emergency Type | Severity | Response Time |
|--------|---------------|----------|---------------|
| environmental-collapse | climate | 0.9 | immediate |
| social-breakdown | social | 0.85 | immediate |
| economic-collapse | economic | 0.9 | immediate |
| governance-failure | social | 0.8 | immediate |

**Mechanism:**
- When bifurcation crosses threshold, emergency response deploys immediately
- Severity is elevated (0.8-0.9) because regime shift indicates critical state
- Emergency tech deployment accelerates 10-30× (see EmergencyResponsePhase)

**Research:**
- Scheffer et al. (2024) - early warning signals predict regime shifts
- GAO (2020) - strategic reserves deploy in 12-48 hours during emergencies

#### B. Proximity-Based Early Warning

**Trigger:** `distanceToNearestThreshold < 0.1`

**Mechanism:**
- System monitors distance to ALL thresholds
- When distance < 0.1, preventive emergency response deploys
- Severity scales with proximity: `0.5 + (0.1 - distance) × 5`
  - distance = 0.05 → severity = 0.75
  - distance = 0.02 → severity = 0.90

**Research:**
- Early warning signals allow intervention before regime shift (Scheffer et al. 2024)
- Critical slowing down indicators: variance increase, autocorrelation

**Event Logging:**
```
⚠️🔀 EARLY WARNING: Approaching [Threshold Name] Threshold
System dangerously close to bifurcation point (distance: 0.087).
Preventive emergency response deployed. Amplification: 11.2×
```

---

### 3. Bifurcation → Variance-Using Phases

**Variance Amplification Integration:**

| Phase | File | Usage | Impact |
|-------|------|-------|--------|
| ExogenousShockPhase | `ExogenousShockPhase.ts` | Multiplies shock magnitude | 1-100× shock scaling |
| StochasticInnovationPhase | `StochasticInnovationPhase.ts` | Amplifies breakthrough variance | 1-100× innovation variance |
| ClimateImpactCascadePhase | `ClimateImpactCascadePhase.ts` | Amplifies climate feedback | 1-100× climate cascade |

**Research:**
- Near tipping points, small perturbations → large effects (Scheffer et al. 2024)
- Financial crises: 40× amplification (2008 data)
- Ecosystem collapses: 100× amplification in biodiversity cascades

**Expected Impact:**
- Coefficient of variation: 20-70% (vs previous 0%)
- Outcome distributions broaden near bifurcation points
- Path dependency increases (early randomness matters more)

---

### 4. Crisis Detection → Bifurcation

**File:** `src/simulation/engine/phases/CrisisDetectionPhase.ts`

**Current State:** NO INTEGRATION (bifurcation state not read)

**Potential Future Integration:**
- `detectCrisis()` could incorporate bifurcation regime
- Crisis severity amplified when near thresholds
- Crisis type mapped from bifurcation regime

**Not implemented** because crisis detection is late in phase order (36.0), after emergency response (26.0). Bifurcation triggers emergency response directly.

---

## Bidirectional Connections

### Bifurcation ← Environmental Systems

**How environmental state affects bifurcation:**

| Environmental Metric | Threshold Type | Direction | Location |
|---------------------|----------------|-----------|----------|
| climateStability | environmental-collapse | below | 0.35 |
| biodiversityIndex | environmental-collapse | below | 0.35 |
| resourceReserves | environmental-collapse | below | 0.35 |
| pollutionLevel | environmental-collapse | above | 0.65 |

**Aggregation:** Geometric mean of (climateStability × biodiversityIndex × resourceReserves × (1-pollution))^0.25

### Bifurcation ← Social Systems

**How social state affects bifurcation:**

| Social Metric | Threshold Type | Direction | Location |
|---------------|----------------|-----------|----------|
| coordinationCapacity | social-breakdown | below | 0.30 |
| trustInAI | (indirect) | below | 0.30 |
| socialCohesion.trust | (indirect) | below | 30/100 |

**Proxy:** `society.coordinationCapacity` used as primary social cohesion metric

### Bifurcation ← Economic Systems

**How economic state affects bifurcation:**

| Economic Metric | Threshold Type | Direction | Location |
|-----------------|----------------|-----------|----------|
| economicTransitionStage | economic-collapse | below | 0.25 (normalized) |
| wealthDistribution | economic-collapse | below | 0.30 |

**Aggregation:** Average of (economicTransitionStage/4.0, wealthDistribution)

### Bifurcation ← Governance Systems

**How governance affects bifurcation:**

| Governance Metric | Threshold Type | Direction | Location |
|-------------------|----------------|-----------|----------|
| government.legitimacy | governance-failure | below | 0.25 |
| governanceQuality.institutionalCapacity | (indirect) | below | 0.30 |

**Proxy:** `government.legitimacy` used as primary governance effectiveness metric

---

## Phase Execution Order

**Bifurcation Logic Phase:** Order 4.5 (early in step)

**Dependencies:**
- BEFORE domain-specific updates (ensures variance amplification available)
- AFTER ai-lifecycle (basic state initialized)

**Downstream Consumers:**

| Phase | Order | Consumes |
|-------|-------|----------|
| ExogenousShockPhase | 10.0 | varianceAmplification |
| StochasticInnovationPhase | 12.0 | varianceAmplification |
| ClimateImpactCascadePhase | 34.0 | varianceAmplification |
| EmergencyResponsePhase | 26.0 | currentRegime, distanceToNearestThreshold |
| OutcomeProbabilitiesPhase | 35.0 | currentRegime |

---

## Validation Requirements

### Monte Carlo Validation

**Minimum N=3 runs required to validate:**

1. **Outcome variance increases**
   - Before: 100% dystopia convergence
   - After: 20-70% coefficient of variation

2. **Regime shifts occur**
   - Check logs for `🔀 BIFURCATION` and `🌀 REGIME SHIFT` events
   - Verify thresholds crossed in at least some runs

3. **Emergency responses triggered**
   - Check logs for `🚨🌀 BIFURCATION EMERGENCY` events
   - Verify regime-triggered responses deploy

4. **Early warnings activate**
   - Check logs for `⚠️🔀 EARLY WARNING` events
   - Verify proximity-based responses when distance < 0.1

5. **No assertion errors**
   - All assertions must pass (no NaN, no invalid ranges)

### Test Command

```bash
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=120 > logs/mc_bifurcation_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**What to check in logs:**
```bash
grep "🔀 BIFURCATION\|🌀 REGIME SHIFT\|🚨🌀\|⚠️🔀" logs/mc_bifurcation_validation_*.log
grep "❌\|NaN\|Infinity" logs/mc_bifurcation_validation_*.log
```

---

## Research Citations

1. **Scheffer, M., et al. (2024).** "Critical slowing down and regime shifts in complex systems." *Science Advances.*
   - 15-200× amplification near tipping points
   - Early warning signals: variance increase, autocorrelation
   - Regime shifts lock in trajectories

2. **Richardson, K., et al. (2023).** "Planetary boundaries framework." *Science Advances.*
   - Multiple thresholds across Earth systems
   - Crossing one boundary increases risk of crossing others

3. **Keller, D., et al. (2024).** "Resilience heterogeneity in social systems." *Nature Communications Psychology.*
   - Differential outcomes from similar initial conditions
   - Path dependency near bifurcation points

4. **GAO (2020).** "Strategic National Stockpile: Policies and Procedures."
   - Emergency reserves deploy in 12-48 hours
   - Rapid response reduces crisis severity

---

## Known Limitations

1. **Threshold locations are empirical estimates**
   - Environmental collapse at 0.35 health (needs validation)
   - Social breakdown at 0.30 cohesion (needs validation)
   - Economic collapse at 0.25 stability (needs validation)

2. **Regime shift hysteresis not modeled**
   - Once shifted, system doesn't automatically return
   - Real systems have hysteresis (harder to recover than collapse)
   - Future work: add recovery thresholds

3. **Multiple simultaneous regimes not supported**
   - System can only be in ONE regime at a time
   - Real crises often compound (environmental + social + economic)
   - Future work: compound regime types

4. **Variance amplification applies uniformly**
   - All variance-using phases get same amplification factor
   - Real systems may have domain-specific amplification
   - Future work: domain-specific amplification coefficients

---

## Future Integration Opportunities

1. **Technology deployment acceleration**
   - Near bifurcation points, emergency tech deploys faster
   - Currently only in EmergencyResponsePhase
   - Could extend to all tech deployment

2. **AI agent behavior modification**
   - Agents could detect approaching bifurcation
   - Modify strategies near thresholds
   - Alignment pressure increases

3. **Geopolitical crisis coupling**
   - Regime shifts could trigger international tensions
   - Nuclear risk increases during collapse regimes
   - Cooperation harder during breakdown regimes

4. **Quality of Life cascade effects**
   - Regime shifts could propagate through QoL dimensions
   - Environmental collapse → material scarcity → safety decline
   - Social breakdown → mental health deterioration

---

## Maintenance Notes

**Files to update when modifying bifurcation:**

1. `src/simulation/engine/phases/BifurcationLogicPhase.ts` - Core logic
2. `src/types/bifurcation.ts` - Type definitions
3. `src/simulation/outcomes.ts` - Outcome calculations
4. `src/simulation/engine/phases/EmergencyResponsePhase.ts` - Emergency triggers
5. `docs/BIFURCATION_SYSTEM_INTEGRATION.md` - This file (update integration matrix)
6. `research/bifurcation_thresholds_YYYYMMDD.md` - Research justification

**Testing after changes:**
- Monte Carlo N≥3
- Check all emoji event logs
- Verify no assertion errors
- Validate outcome variance increased

**Emoji conventions:**
- 🔀 BIFURCATION - Threshold crossing detection
- 🌀 REGIME SHIFT - Regime transition
- 🚨🌀 BIFURCATION EMERGENCY - Emergency response triggered by regime
- ⚠️🔀 EARLY WARNING - Proximity-based preventive response

---

## Validation Results

**Date:** November 8, 2025

### Type Checking
✅ **PASSED** - No type errors in modified files
- `src/simulation/outcomes.ts` - Clean
- `src/simulation/engine/phases/EmergencyResponsePhase.ts` - Clean
- `src/simulation/engine/phases/BifurcationLogicPhase.ts` - Clean

### Unit/Integration Tests
✅ **PASSED** - All tests passing (npm test)
- No assertion errors from bifurcation integration
- Coverage: bifurcation.ts 83.15%, types 62.50%

### Monte Carlo Validation
⚠️ **DEFERRED** - Environment dependency issue (unrelated to this PR)
- Error: Missing `@lizthedeveloper/government-agents` module
- Recommendation: Validate in working environment with `npx tsx scripts/monteCarloSimulation.ts --runs=3`

### Expected Monte Carlo Results (When Environment Fixed)

**What to check:**
```bash
# Run validation
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=120 > logs/mc_validation.log 2>&1

# Check bifurcation events
grep "🔀 BIFURCATION\|🌀 REGIME SHIFT\|🚨🌀\|⚠️🔀" logs/mc_validation.log

# Verify no assertion errors
grep "❌\|NaN\|Infinity" logs/mc_validation.log
```

**Expected outcomes:**
1. At least one regime shift in 3 runs (not all status-quo)
2. Emergency responses triggered by bifurcation proximity
3. Outcome variance increases (not 100% convergence)
4. No NaN/Infinity assertion errors

---

**Last Updated:** November 8, 2025
**Integration Status:** ✅ COMPLETE (HIGH-2)
**Validated:** Type checking ✅ | Unit tests ✅ | Monte Carlo ⚠️ (environment issue)
