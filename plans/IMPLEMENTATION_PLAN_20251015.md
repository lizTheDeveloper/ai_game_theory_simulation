# Systematic Implementation Plan
## AI Game Theory Simulation - Critical Fixes and Improvements

**Date:** October 15, 2025
**Based on:** Architecture Review, Research Validation, Critical Research Review, Extinction Mechanics Audit
**Status:** 🔴 **CRITICAL ISSUES IDENTIFIED** - Implementation roadmap to restore credibility

---

## Executive Summary

This plan consolidates findings from 4 independent critical reviews:
1. **Architecture Review** (38K) - Found 5 bugs, 3 architectural issues, 4 parameter critiques
2. **Research Validation Review** (52K) - Compared results to peer-reviewed research across 7 subsystems
3. **Critical Research Review** (10K) - Identified AI capability growth off by 400x, alignment overconfidence
4. **Extinction Mechanics Audit** (devlog) - Documented false extinction bug, organizations never die

**Consensus Findings:**
- ✅ **Excellent:** Planetary boundaries framework, deceptive alignment mechanics, multi-dimensional modeling
- ❌ **Critical:** AI capability growth 100-400x too slow, environmental degradation 100-1000x too fast
- ❌ **Blocking:** Deterministic outcomes (100% of runs converge), zero recovery mechanics, false extinction reporting

**Outcome:** Current results **NOT CREDIBLE** for publication, but simulation framework is fundamentally sound.

**Timeline to Credibility:**
- **P0 Fixes (1 day):** Restore basic validity
- **P1 Fixes (1 week):** Achieve realism
- **P2 Improvements (2-4 weeks):** Full research-grade quality

---

## Priority 0: CRITICAL - Must Fix Before Any Further Analysis

**Goal:** Restore basic simulation validity
**Timeline:** 1 day (6-9 hours total)
**Outcome:** Results become directionally credible (but still need calibration)

### P0.1: Fix AI Capability Growth Rate (2-4 hours)
**Severity:** 🔴 CRITICAL - Invalidates all AI timeline conclusions

**Problem:**
- Current: 3%/month Moore's Law = 2.4x per decade
- Empirical: Epoch AI documents 100-1000x per decade (doubling every 6-10 months)
- Impact: AGI never reached in simulations, all transformative AI scenarios disabled

**Evidence:**
- Oct 15 log: Max AI capability 0.819 after 60 months (never reached 1.0)
- Oct 14 log: Max capability 1.300 after 240 months (barely above human-level after 20 years)
- Research: GPT-2 (2019) → GPT-4 (2023) = 1,000x parameters, 100,000x compute in 4 years

**Fix Required:**
```typescript
// File: /src/simulation/engine/phases/ComputeGrowthPhase.ts
// or /src/simulation/aiLifecycle.ts (capability growth logic)

// OLD (inferred):
const monthlyCapabilityGrowth = 1.03; // 3% per month

// NEW: Use Epoch AI's empirical doubling time
const monthlyComputeGrowth = Math.pow(2, 1/8); // Doubles every 8 months (conservative)
// = 1.0905 per month = 10x per year = 100x per decade

// OR: Add discrete capability jumps
if (majorBreakthroughCondition) {
  ai.capability *= 3.0; // GPT-N moment (sudden jump)
}

// OR: Implement recursive self-improvement
if (ai.capability > 2.0) {
  const recursiveFactor = Math.min(ai.capability * 0.05, 0.20); // Cap at 20%/month
  ai.capability *= (1 + recursiveFactor); // Exponential takeoff
}
```

**Test Criteria:**
- [ ] At least 20% of runs reach AI capability > 2.0 by Month 120 (10 years)
- [ ] At least 5% of runs reach AI capability > 5.0 by Month 240 (20 years)
- [ ] AGI-related catastrophic scenarios (takeover, escape) now trigger in some runs

**References:**
- Epoch AI (2024) "Compute Trends in Machine Learning"
- Villalobos et al. (2022) "Compute Trends Across Three Eras"
- CRITICAL_RESEARCH_REVIEW.md lines 21-34

---

### P0.2: Fix Organization Bankruptcy Paradox (1 hour)
**Severity:** 🔴 CRITICAL - Physically impossible economics

**Problem:**
- Oct 15 log: "100% organizations bankrupt" BUT Oct 14 log: "Avg Capital: $122.8B"
- Organizations simultaneously bankrupt AND accumulating massive capital
- Violates conservation laws (can't make money while bankrupt)

**Evidence:**
```
ORGANIZATION SURVIVAL:
  Avg Survival Rate: 0.0%
  Avg Capital Accumulation: $122.8B
  ⚠️ CRITICAL: Impossible!
```

**Root Cause:**
- Bankruptcy mechanics added Oct 13, 2025
- Revenue calculation runs before bankruptcy check
- Bankrupt flag set, but revenue/capital still accumulating

**Fix Required:**
```typescript
// File: /src/simulation/organizationManagement.ts

// Around line 584: Revenue calculation
function calculateOrganizationRevenue(org: Organization, state: GameState): number {
  // ADD THIS CHECK FIRST:
  if (org.bankrupt) {
    org.monthlyRevenue = 0;
    org.capital = Math.max(0, org.capital - org.operationalCosts); // Costs drain capital
    return 0;
  }

  // Existing revenue calculation continues...
  let baseRevenue = org.baseRevenue;
  const cascadeSeverity = state.planetaryBoundariesSystem.cascadeSeverity || 0;
  baseRevenue *= (1 - cascadeSeverity * 0.40);
  // ...rest of logic
}

// In MonteCarloAnalysis aggregation:
// File: /src/simulation-runner/monteCarlo.ts
// Line ~400-420 (org survival metrics)
if (org.bankrupt) {
  org.capital = 0; // Zero out capital for bankrupt orgs in reports
  org.monthlyRevenue = 0;
}
```

**Test Criteria:**
- [ ] Bankrupt organizations show $0 capital in final reports
- [ ] Bankrupt organizations show $0 revenue
- [ ] If 100% bankruptcy, compute growth should halt (no new data centers)

**References:**
- architecture-review-20251015.md lines 44-84 (BUG #1)
- extinction-mechanics-audit-oct-12.md lines 63-108

---

### P0.3: Fix Deterministic Cascade Triggers (3-4 hours)
**Severity:** 🔴 CRITICAL - Invalidates Monte Carlo variance

**Problem:**
- Oct 14: ALL 10 runs reached IDENTICAL population (0.34B, exactly 95.7% decline)
- Cascade triggers deterministically at risk > 50%, no randomness
- Monte Carlo is meaningless if all seeds produce same outcome

**Evidence:**
```
Oct 14 (10 runs): 100% bottleneck, 95.7% avg decline (EXACT to 0.1%)
Oct 15 (2 runs): 100% inconclusive, 85.7% avg decline
```

Statistical impossibility with random seeds unless system is deterministic.

**Root Cause:**
```typescript
// File: /src/simulation/planetaryBoundaries.ts:454-456
if (system.tippingPointRisk > 0.5) {
  system.cascadeSeverity = Math.pow((system.tippingPointRisk - 0.5) / 0.5, 1.5);
  system.cascadeMultiplier = 1.0 + system.cascadeSeverity;
}
```

**Problem:** No stochasticity! Risk > 50% = guaranteed cascade.

**Fix Required:**
```typescript
// File: /src/simulation/planetaryBoundaries.ts

// OPTION 1: Stochastic trigger (recommended)
if (system.tippingPointRisk > 0.5) {
  // Risk determines PROBABILITY, not certainty
  const cascadeProbability = Math.pow((system.tippingPointRisk - 0.5) / 0.5, 2.0);
  const monthlyTriggerChance = cascadeProbability * 0.10; // 10% per month at max risk

  if (!system.cascadeActive && Math.random() < monthlyTriggerChance) {
    system.cascadeActive = true;
    system.cascadeStartMonth = state.currentMonth;
    console.log(`\n🌪️ TIPPING POINT CASCADE TRIGGERED (Risk: ${(system.tippingPointRisk * 100).toFixed(1)}%)`);
  }
}

// OPTION 2: Add uncertainty bounds to risk calculation
const riskVariance = (Math.random() - 0.5) * 0.3; // ±15% variance
system.tippingPointRisk += riskVariance;
system.tippingPointRisk = Math.max(0, Math.min(0.98, system.tippingPointRisk));

// OPTION 3: Increase initial condition variance
// File: /src/simulation/initialization.ts
// Add ±10% variance to starting planetary boundary values
planetaryBoundaries.climateStability *= (0.9 + Math.random() * 0.2); // ±10%
```

**Also Fix:** Increase variance in government actions, tech unlocks, policy success rates

**Test Criteria:**
- [ ] 100-run Monte Carlo shows outcome variance (not 100% same outcome)
- [ ] Population endpoints vary by >20% across runs (e.g., 0.3B to 3B range)
- [ ] Some runs avoid cascade entirely (e.g., 10-30% never trigger)

**References:**
- architecture-review-20251015.md lines 133-189 (BUG #3)
- research-validation-20251015.md lines 104-194

---

## Priority 1: HIGH - Fix This Week for Realism

**Goal:** Results match research consensus on timescales and mortality rates
**Timeline:** 1 week (20-25 hours total)
**Outcome:** Simulation becomes scientifically defensible

### P1.1: Debug Death Accounting (2-3 hours)
**Severity:** 🔴 HIGH - Cannot validate simulation realism

**Problem:**
- Population declines by 6-7B people
- Death tracking reports only 193M-732M deaths
- **97% of deaths unaccounted for**

**Evidence:**
```
Oct 15 Log:
  Population Decline: 6.86B (6,856M deaths)
  Deaths Tracked: 183M + 6M + 4M = 193M
  Missing: 6,663M (97%)

Oct 14 Log:
  Population Decline: 7.66B (7,660M deaths)
  Deaths Tracked: 668M + 7M + 57M = 732M
  Missing: 6,928M (90%)
```

**Hypothesis:**
- Cascade deaths ARE being tracked (`addAcuteCrisisDeaths` called with 'climate' category)
- Aggregation in Monte Carlo output is summing incorrectly
- OR: Environmental mortality calculation returns low rates compared to carrying capacity die-off

**Fix Required:**
```typescript
// File: /src/simulation/populationDynamics.ts
// Add logging to trace death flow:

function updatePopulation(state: GameState): void {
  const prevPop = state.humanPopulationSystem.population;

  // ... existing logic ...

  const deaths = prevPop - state.humanPopulationSystem.population;
  const trackedDeaths = Object.values(state.humanPopulationSystem.deathsByCategory).reduce((a, b) => a + b, 0);

  if (Math.abs(deaths - trackedDeaths) > 10) { // >10M discrepancy
    console.warn(`⚠️ Death accounting mismatch: ${deaths}M actual, ${trackedDeaths}M tracked`);
    console.warn(`   By category:`, state.humanPopulationSystem.deathsByCategory);
  }
}

// File: /src/simulation-runner/monteCarlo.ts
// Verify aggregation logic around line 400-450:

runs.forEach(run => {
  // Ensure we're reading finalState.humanPopulationSystem.deathsByCategory
  const deaths = run.finalState.humanPopulationSystem.deathsByCategory;
  console.log(`Run ${run.seed} deaths:`, deaths); // Debug output

  totalDeaths.natural += deaths.natural || 0;
  totalDeaths.crisis += (deaths.famine || 0) + (deaths.disease || 0) + ...
  // Make sure ALL categories are included
});
```

**Test Criteria:**
- [ ] Sum of death categories = total population decline (within 5% margin)
- [ ] Cascade deaths appear in breakdown (currently only 4M-57M shown)
- [ ] Environmental deaths (famine, disease, climate, ecosystem) all non-zero during collapse

**References:**
- architecture-review-20251015.md lines 86-130 (BUG #2)
- extinction-mechanics-audit-oct-12.md lines 236-255

---

### P1.2: Reduce Cascade Mortality Rate (1 hour)
**Severity:** 🔴 HIGH - Overstates collapse severity

**Problem:**
- Current: 2% monthly mortality = 62% dead in 4 years
- Black Death (worst historical): ~30-60% over 6 years = 5-10% annually
- Simulation is 3-6x more lethal than worst precedent

**Evidence:**
```typescript
// planetaryBoundaries.ts:580
let monthlyMortalityRate = 0.02 * system.cascadeSeverity; // 2% per month
```

**Comparison:**
| Event | Mortality | Timescale | Annual Rate |
|-------|-----------|-----------|-------------|
| Black Death | 30-60% | 6 years | 5-10% |
| WWII | 3-4% | 6 years | 0.5-0.7% |
| **Simulation** | **62%** | **4 years** | **15.5%** |

**Fix Required:**
```typescript
// File: /src/simulation/planetaryBoundaries.ts:580

// OLD:
let monthlyMortalityRate = 0.02 * system.cascadeSeverity; // 2% per month

// NEW: Reduce to match historical precedent
let monthlyMortalityRate = 0.005 * system.cascadeSeverity; // 0.5% per month
// = 6% annual = comparable to Black Death
// Still severe, but not 3-6x worse than historical worst-case

// OR: Add adaptation factor
const baseRate = 0.01; // 1% monthly (12% annual - still aggressive)
const adaptationFactor = 1 - (state.technologyLevel * 0.3); // Tech reduces impact 0-30%
const heterogeneityFactor = 0.5 + Math.random() * 0.5; // 50-100% of population exposed
monthlyMortalityRate = baseRate * cascadeSeverity * adaptationFactor * heterogeneityFactor;
```

**Test Criteria:**
- [ ] Final population in severe runs: 2B-4B (not 0.3B-1B)
- [ ] Mortality matches Black Death severity (30-60% over 6-10 years)
- [ ] Some runs show stabilization (not 100% irreversible decline)

**References:**
- architecture-review-20251015.md lines 587-646 (PARAM-2)
- research-validation-20251015.md lines 34-100

---

### P1.3: Reduce Cascading Failure Multiplier (30 minutes)
**Severity:** 🟡 MEDIUM-HIGH - Creates unrealistic doom loops

**Problem:**
- 6 active crises → 3.0x degradation multiplier
- Applied to all QoL metrics: 3% monthly decline = 31% annual
- No historical precedent for such compounding

**Current Code:**
```typescript
// environmental.ts:538-561
return 1.0 + (activeCrises - 2) * 0.5; // Each crisis adds 50%
// 6 crises = 1.0 + 4 * 0.5 = 3.0x
```

**Fix Required:**
```typescript
// File: /src/simulation/environmental.ts:560

// OLD:
return 1.0 + (activeCrises - 2) * 0.5;

// NEW: Reduce compounding
return 1.0 + (activeCrises - 2) * 0.2; // Each crisis adds 20% (not 50%)
// 6 crises = 1.0 + 4 * 0.2 = 1.8x (not 3.0x)

// OR: Add diminishing returns
return 1.0 + Math.pow(activeCrises - 2, 0.7) * 0.3;
// 6 crises = 1.0 + (4^0.7) * 0.3 = 1.0 + 2.64 * 0.3 = 1.79x
```

**Impact:** Reduces monthly degradation from 3% → 1.8% (still severe but not doom loop)

**Test Criteria:**
- [ ] QoL decline rate: <2% per month during cascade (not 3%)
- [ ] Some runs show QoL stabilizing above 0.3 (not falling to 0.1-0.2)
- [ ] Cascading failures severe but not irreversible

**References:**
- architecture-review-20251015.md lines 190-247 (BUG #4)

---

### P1.4: Fix False Extinction Detection (1 hour)
**Severity:** 🔴 HIGH - Reports show wrong outcomes

**Problem:**
- Code declares "extinction" when `severity = 1.0`
- Actual populations: 1.14B-4.5B (not extinct!)
- True extinction threshold: <10K people

**Evidence:**
```
Oct 15 log: "Extinction" declared, but 1.14B survivors (14% of baseline)
Extinction threshold in code: 10,000 people
Actual population: 1,140,000,000 people
```

**Current (broken) logic:**
```typescript
// engine.ts (inferred)
if (state.extinctionState.active && state.extinctionState.severity >= 1.0) {
  actualOutcome = 'extinction';
}
```

**Fix Required:**
```typescript
// File: /src/simulation/engine.ts (outcome determination)

// Use ACTUAL POPULATION, not severity metric
const population = state.humanPopulationSystem.population; // In billions

if (population < 0.00001) { // <10K people
  actualOutcome = 'true_extinction';
  console.log(`💀 TRUE EXTINCTION: ${(population * 1000000).toFixed(0)} people remain`);
} else if (population < 0.1) { // <100M people
  actualOutcome = 'genetic_bottleneck';
  console.log(`🧬 GENETIC BOTTLENECK: ${(population * 1000).toFixed(0)}M survivors`);
} else if (population < 2.0) { // <2B people
  actualOutcome = 'severe_decline';
  console.log(`📉 SEVERE DECLINE: ${population.toFixed(2)}B population (${((population / 8.0) * 100).toFixed(1)}% of baseline)`);
} else if (population < 6.0) { // <6B people
  actualOutcome = 'population_stress';
} else {
  // Population stable or growing
}

// Severity metric can INFORM outcome, but shouldn't DETERMINE it
```

**Test Criteria:**
- [ ] No runs report "extinction" with >100M survivors
- [ ] Outcome labels match actual population thresholds
- [ ] "Severe decline" vs "bottleneck" vs "extinction" clearly distinguished

**References:**
- extinction-mechanics-audit-oct-12.md lines 15-59
- research-validation-20251015.md lines 831-856

---

### P1.5: Add Basic Recovery Mechanics (4-6 hours)
**Severity:** 🟡 MEDIUM - Missing resilience biases toward doom

**Problem:**
- NO recovery mechanics in simulation
- Historical evidence: Humans recovered from EVERY catastrophe (Black Death, 1918 flu, WWII, even Toba bottleneck)
- Birth rates never spike post-crisis (missing "baby boom" effect)

**Fix Required:**
```typescript
// File: /src/simulation/populationDynamics.ts

function updateBirthRate(pop: PopulationSystem, state: GameState): void {
  // Existing modifiers...
  pop.adjustedBirthRate = pop.baselineBirthRate *
    meaningModifier *
    economicModifier *
    healthcareModifier *
    stabilityModifier *
    pressureModifier;

  // ADD: Post-crisis recovery spike
  if (state.recentCrisisEnded) { // Crisis ended in last 12 months
    const recoveryBoost = 1.3 + (state.postCrisisMonths / 60) * 0.5; // 30-80% boost
    pop.adjustedBirthRate *= Math.min(1.8, recoveryBoost); // Cap at 80% boost
    console.log(`👶 BABY BOOM: Birth rate boosted ${(recoveryBoost * 100 - 100).toFixed(0)}% (post-crisis recovery)`);
  }
}

// File: /src/simulation/environmental.ts
// Add carrying capacity regeneration

function updateCarryingCapacity(env: EnvironmentalSystem, state: GameState): void {
  // Existing degradation...

  // ADD: Regeneration when human pressure reduces
  const currentPressure = state.humanPopulationSystem.population / state.humanPopulationSystem.carryingCapacity;

  if (currentPressure < 0.5) { // Population below half of carrying capacity
    const regenerationRate = (0.5 - currentPressure) * 0.02; // Up to 1% monthly regen
    env.biodiversity += regenerationRate;
    env.resourceReserves += regenerationRate * 0.5;
    env.climateStability += regenerationRate * 0.3;

    console.log(`🌱 ECOSYSTEM REGENERATION: Population pressure reduced, nature recovering`);
  }
}
```

**Test Criteria:**
- [ ] At least 5-10% of runs show population recovery after bottleneck
- [ ] Birth rates spike 20-50% in 12 months following crisis resolution
- [ ] Carrying capacity improves when population drops below threshold

**References:**
- architecture-review-20251015.md lines 250-327 (BUG #5)
- research-validation-20251015.md lines 197-282

---

## Priority 2: MEDIUM - Improve Within 2-4 Weeks

**Goal:** Research-grade quality with empirical validation
**Timeline:** 2-4 weeks (40-60 hours total)
**Outcome:** Publication-ready simulation

### P2.1: Recalibrate Environmental Degradation Rates (4-6 hours)
**Severity:** 🔴 HIGH (but can defer after P0/P1) - 100-1000x too fast

**Problem:**
- Climate: 69% degradation in 60 months → 13x faster than IPCC worst-case
- Biodiversity: 99.4% collapse in 60 months → 200x faster than IPBES projections
- Resources: 84% depletion in 60 months → 34x faster than Global Footprint Network

**Current Rates:**
```typescript
// environmental.ts
biodiversityLossRate = economicStage * 0.0004; // 0.04% per month
// Still 10-20x faster than IPBES (1% per decade = 0.0083% per month)
```

**Fix Required:**
```typescript
// File: /src/simulation/environmental.ts

// BIODIVERSITY (lines 193-217):
// OLD:
let biodiversityLossRate = economicStage * 0.0004; // 0.04% per month

// NEW: Match IPBES (1% per decade)
let biodiversityLossRate = economicStage * 0.00008; // 0.008% per month = 1% per decade at Stage 1

// CLIMATE (lines 146-169):
// OLD:
climateImpact = economicStage * 0.003; // 0.3% per month

// NEW: Match IPCC SSP5-8.5 (+4.4°C by 2100 = 75 years)
climateImpact = economicStage * 0.0006; // 0.06% per month = 0.7% per year

// RESOURCES (lines 62-86):
// OLD:
resourceDepletionRate = economicStage * 0.008; // 0.8% per month

// NEW: Match Global Footprint Network (~0.5% per year worsening)
resourceDepletionRate = economicStage * 0.0004; // 0.04% per month = 0.5% per year
```

**Add Uncertainty Bounds:**
```typescript
// Add ±50% variance to all rates
const variance = 0.5 + Math.random(); // 0.5x to 1.5x
biodiversityLossRate *= variance;
```

**Test Criteria:**
- [ ] Climate degradation reaches "catastrophe" by 2100 (Month 900), not 2030 (Month 60)
- [ ] Biodiversity declines 10-20% by 2050 (Month 300), not 99% by 2030
- [ ] Resource depletion follows GFN overshoot trajectory (1.7x → 2.5x by 2100)

**References:**
- research-validation-20251015.md lines 557-641

---

### P2.2: Add Stochastic Innovation / Breakthroughs (4-6 hours)
**Severity:** 🟡 MEDIUM - Missing positive unknown unknowns

**Problem:**
- Technology tree follows predetermined paths
- Real innovation leaps prerequisites: CRISPR, Transformers, mRNA vaccines
- No "miracle" breakthroughs that could avert catastrophe

**Fix Required:**
```typescript
// File: Create /src/simulation/engine/phases/BreakthroughInnovationPhase.ts

export function executeBreakthroughInnovationPhase(state: GameState): void {
  // Higher probability during existential crisis (necessity breeds innovation)
  const crisisPressure = state.activeCrises.length * 0.01; // +1% per crisis
  const baseBreakthroughProb = 0.005; // 0.5% per month base
  const aiBoost = Math.min(state.maxAICapability * 0.01, 0.05); // AI helps, up to +5%

  const totalBreakthroughProb = baseBreakthroughProb + crisisPressure + aiBoost;

  if (Math.random() < totalBreakthroughProb) {
    // Random breakthrough bypasses tech tree
    const breakthroughType = selectRandomBreakthrough();

    switch (breakthroughType) {
      case 'fusion':
        // Unlimited clean energy
        state.technologies.fusionPower.unlocked = true;
        state.technologies.fusionPower.deploymentLevel = 0.1;
        console.log(`⚡ BREAKTHROUGH: Fusion power achieved! Climate impact reduced.`);
        break;

      case 'carbon_capture':
        // Gigatonne-scale carbon capture
        state.planetaryBoundariesSystem.carbonCaptureRate *= 10;
        console.log(`🌍 BREAKTHROUGH: Massive carbon capture breakthrough!`);
        break;

      case 'ai_alignment_solution':
        // Mechanistic interpretability breakthrough
        state.ais.forEach(ai => ai.trueAlignment += 0.3); // +30% alignment
        console.log(`🧠 BREAKTHROUGH: AI alignment problem solved!`);
        break;

      case 'synthetic_food':
        // Lab-grown food at scale
        state.humanPopulationSystem.carryingCapacity *= 1.5;
        console.log(`🍖 BREAKTHROUGH: Synthetic food solves scarcity!`);
        break;
    }
  }
}
```

**Test Criteria:**
- [ ] 5-15% of runs experience at least 1 breakthrough
- [ ] Breakthroughs can change trajectory (some doomed runs saved)
- [ ] Breakthroughs rare enough to not feel like deus ex machina

**References:**
- architecture-review-20251015.md lines 817-827
- CRITICAL_RESEARCH_REVIEW.md lines 130-139

---

### P2.3: Heterogeneous Population Segments (8-10 hours)
**Severity:** 🟡 MEDIUM - Missing social dynamics

**Problem:**
- Society modeled as monolithic (single trust/legitimacy values)
- Real populations: 30-40% variance in responses, polarization, elite/mass gaps

**Fix Required:**
```typescript
// File: /src/types/game.ts

interface Society {
  // OLD: Single values
  // trustInAI: number;
  // legitimacy: number;

  // NEW: Heterogeneous segments
  segments: SocietySegment[];
  aggregateTrustInAI: number; // Weighted average for backward compatibility
  aggregateLegitimacy: number;
}

interface SocietySegment {
  name: 'techno-optimists' | 'moderates' | 'skeptics' | 'elites';
  populationFraction: number; // 0-1, sum to 1.0
  trustInAI: number; // 0-1
  trustInGovernment: number;
  politicalPower: number; // Weighted influence (elites have >population fraction)
  geographic: string[]; // Regions (e.g., ['urban', 'coastal'])
  adaptability: number; // Ability to cope with crisis (0-1)
}

// Example initialization:
society.segments = [
  { name: 'techno-optimists', populationFraction: 0.15, trustInAI: 0.8, politicalPower: 0.25, ...  },
  { name: 'moderates', populationFraction: 0.50, trustInAI: 0.5, politicalPower: 0.50, ... },
  { name: 'skeptics', populationFraction: 0.30, trustInAI: 0.2, politicalPower: 0.20, ... },
  { name: 'elites', populationFraction: 0.05, trustInAI: 0.7, politicalPower: 0.40, ... }, // Disproportionate power
];
```

**Impact:** Policy decisions depend on weighted segments, not uniform population

**Test Criteria:**
- [ ] Government AI deployment succeeds if weighted-power-trust > 0.6 (not just average trust)
- [ ] Elite segment can insulate from crisis (higher survival rate)
- [ ] Some segments polarize (trust diverges over time)

**References:**
- architecture-review-20251015.md lines 387-445 (ARCH-2)
- CRITICAL_RESEARCH_REVIEW.md lines 98-112

---

### P2.4: Organization Geographic Diversification (3-4 hours)
**Severity:** 🟡 MEDIUM - Oversimplified economics

**Problem:**
- Organizations treated as single-country entities
- Real: Google operates in 170 countries, 50+ data centers globally
- 100% bankruptcy unrealistic (COVID-19: tech companies thrived)

**Fix Required:**
```typescript
// File: /src/simulation/organizationManagement.ts

interface Organization {
  // ADD:
  geographicPresence: {
    region: string;
    populationShare: number; // % of operations in this region
    dataCenters: number;
    workforce: number;
  }[];

  remoteWorkCapable: boolean; // Can shift to remote operations
  essentialDesignation: boolean; // Government will bail out
}

function calculateBankruptcyRisk(org: Organization, state: GameState): number {
  // OLD: Binary threshold
  // if (countryPop < 0.50 * countryPeakPop) return 1.0; // 100% bankruptcy

  // NEW: Weighted across geographic presence
  let weightedCollapse = 0;

  org.geographicPresence.forEach(presence => {
    const region = state.regions[presence.region];
    const popDecline = 1 - (region.currentPop / region.peakPop);
    weightedCollapse += popDecline * presence.populationShare;
  });

  // Sigmoid curve (not binary threshold)
  let bankruptcyRisk = 1 / (1 + Math.exp(-10 * (weightedCollapse - 0.6))); // 50% risk at 60% decline

  // Adjustments
  if (org.remoteWorkCapable) bankruptcyRisk *= 0.5; // 50% risk reduction
  if (org.essentialDesignation) bankruptcyRisk *= 0.3; // Government bailout

  return bankruptcyRisk;
}
```

**Test Criteria:**
- [ ] Distributed organizations (Google, Microsoft) survive longer than regional ones
- [ ] At least 10-30% of organizations survive severe collapse (not 0%)
- [ ] Government-designated "essential" AI companies get bailouts

**References:**
- research-validation-20251015.md lines 285-391

---

### P2.5: Empirical Validation Against Historical Data (6-8 hours)
**Severity:** 🟡 MEDIUM - Necessary for credibility

**Goal:** Prove simulation can reproduce known events

**Validation Scenarios:**

**1. COVID-19 Pandemic (2020-2023):**
```
Initialize: 2020 state (population 7.8B, AI capability 0.3)
Trigger: Pandemic event (2-5M deaths)
Expected Outcomes:
  - Tech company revenue: +20-40% (Google, Amazon, Microsoft)
  - Remote work adoption: 30-50%
  - Vaccine development: 12-18 months
  - Economic recovery: 2021-2022
  - Population impact: <0.1% mortality

Test: Does simulation match observed trajectory?
```

**2. 2008 Financial Crisis:**
```
Initialize: 2008 state
Trigger: Market crash (housing bubble)
Expected Outcomes:
  - 10-30% organizational bankruptcies (not 100%)
  - Government bailouts (TARP)
  - Recovery by 2010-2012
  - Tech sector resilient (Apple, Google survived)

Test: Does simulation match organizational survival rates?
```

**3. Black Death (1347-1353):**
```
Initialize: Medieval population/tech (adjust parameters to 1347 levels)
Trigger: Pandemic (30-60% mortality over 6 years)
Expected Outcomes:
  - Population: 75M → 45M → 78M by 1450
  - Recovery: 1% annual growth post-crisis
  - Economic changes: Wages increase, labor scarcity

Test: Does simulation show recovery (not extinction)?
```

**Success Criteria:**
- [ ] COVID-19: Matches mortality (<0.1%), tech growth (+20-40%), recovery timeline
- [ ] 2008 Crisis: Organizational survival 70-90%, recovery by 2012
- [ ] Black Death: 30-60% mortality, full recovery within 100 years

**References:**
- architecture-review-20251015.md lines 888-893
- research-validation-20251015.md lines 1115-1128

---

## Priority 3: LOW - Nice-to-Have Improvements

**Goal:** Cutting-edge research features
**Timeline:** 4-8 weeks (optional)
**Outcome:** State-of-the-art simulation

### P3.1: Variable Timesteps / Event-Driven Architecture (10-12 hours)
### P3.2: Unknown Unknown Event System (4-6 hours)
### P3.3: Alignment Model Specificity (2-3 hours)
### P3.4: Government Implementation Realism (3-4 hours)
### P3.5: Continuous Parameter Uncertainty (6-8 hours)

*(Detailed specs available in architecture-review-20251015.md and research-validation-20251015.md)*

---

## Testing & Validation Strategy

### After Each Priority Level:

**Post-P0 (1 day):**
```bash
# Run 100-run Monte Carlo to verify fixes
npm run monte-carlo -- --runs 100 --months 480

# Check for:
- [ ] Outcome variance (not 100% same outcome)
- [ ] AI capability reaches >2.0 in some runs
- [ ] Organizations show realistic survival/bankruptcy rates
- [ ] Death accounting sums correctly

# If ANY check fails, iterate on P0 fixes before proceeding
```

**Post-P1 (1 week):**
```bash
# Run 500-run Monte Carlo for statistical confidence
npm run monte-carlo -- --runs 500 --months 600

# Check for:
- [ ] Population decline rates match historical precedent (5-10% annual max)
- [ ] Environmental degradation aligns with IPCC/IPBES projections
- [ ] Some runs show recovery (5-15%)
- [ ] Mortality breakdown accounts for 90%+ of deaths

# Run historical validation
npm run validate:covid19
npm run validate:2008crisis
npm run validate:blackdeath
```

**Post-P2 (2-4 weeks):**
```bash
# Full sensitivity analysis
npm run sensitivity-analysis

# Expert review
- Share with AI safety researchers
- Share with Earth system scientists
- Share with economists
- Incorporate feedback

# Publication prep
- Generate outcome distribution charts
- Document all parameters with citations
- Write methods section
- Prepare supplementary materials
```

---

## Effort Summary

| Priority | Tasks | Total Effort | Outcome |
|----------|-------|--------------|---------|
| **P0 (CRITICAL)** | 3 fixes | 6-9 hours (1 day) | Basic validity restored |
| **P1 (HIGH)** | 5 fixes | 20-25 hours (1 week) | Research-grade realism |
| **P2 (MEDIUM)** | 5 improvements | 40-60 hours (2-4 weeks) | Publication-ready |
| **P3 (LOW)** | 5 enhancements | 40-50 hours (optional) | State-of-the-art |

**Total to Publication-Ready:** 66-94 hours = 2-3 weeks full-time or 4-8 weeks part-time

---

## Success Metrics

### Current State (Oct 15, 2025):
- ❌ AI capability: Never exceeds 1.0 (non-transformative)
- ❌ Outcome variance: 0% (all runs converge)
- ❌ Environmental rates: 100-1000x too fast
- ❌ Population collapse: 10-100x too fast
- ❌ Organizational survival: 100% bankruptcy (unrealistic)
- ❌ Recovery: 0% of runs show recovery

### Target State (Post P0+P1+P2):
- ✅ AI capability: 20% of runs exceed 2.0 by Year 10
- ✅ Outcome variance: 30-50% variance in population endpoints
- ✅ Environmental rates: Match IPCC/IPBES projections (±20%)
- ✅ Population collapse: Match historical precedent (5-10% annual max)
- ✅ Organizational survival: 20-50% survive severe collapse
- ✅ Recovery: 10-25% of runs show population recovery

### Publication Readiness Checklist:
- [ ] All P0 issues fixed and tested
- [ ] All P1 issues fixed and tested
- [ ] At least 3 of 5 P2 improvements completed
- [ ] Empirical validation: COVID-19, 2008 crisis, Black Death
- [ ] Expert review: AI safety, Earth systems, economics
- [ ] Sensitivity analysis: Parameter variance documented
- [ ] Methods section: All parameters cited with research
- [ ] Limitations section: Known uncertainties documented
- [ ] Code published: GitHub with reproducible results

---

## Risk Mitigation

**Risk: Fixes introduce new bugs**
- Mitigation: Regression test suite (run after each fix)
- Tests: Death accounting, population dynamics, outcome determination

**Risk: Parameter recalibration changes conclusions**
- Mitigation: Sensitivity analysis (test multiple parameterizations)
- Document: Which parameters drive outcomes most strongly

**Risk: Expert reviewers find additional issues**
- Mitigation: Incorporate feedback iteratively
- Plan for 2-3 rounds of expert review

**Risk: Historical validation fails**
- Mitigation: Calibrate parameters to match known events first
- Example: COVID-19 must show tech company resilience, not 100% bankruptcy

---

## Communication Plan

**Internal (Development Team):**
- Daily: P0/P1 fix progress updates
- Weekly: Monte Carlo test results
- Bi-weekly: Parameter recalibration decisions

**External (Stakeholders):**
- After P0: "Critical bugs fixed, results now directionally valid"
- After P1: "Simulation calibrated to research consensus"
- After P2: "Publication-ready, peer review sought"

**Publications:**
- Working paper: After P1 (with extensive limitations section)
- Peer-reviewed paper: After P2 + expert review
- Open-source release: GitHub with reproducible results

---

## References

This plan synthesizes findings from:

1. **architecture-review-20251015.md** (38KB, 1000 lines)
   - 5 bugs identified with code references
   - 3 architectural issues
   - 11 priority-ranked fixes

2. **research-validation-20251015.md** (52KB, 1200 lines)
   - 7 subsystem realism assessments
   - Comparison to 40+ peer-reviewed papers
   - Empirical validation strategy

3. **CRITICAL_RESEARCH_REVIEW.md** (10KB, 228 lines)
   - AI capability growth 400x discrepancy
   - Alignment overconfidence critique
   - Cascade oversimplification

4. **extinction-mechanics-audit-oct-12.md** (devlog, 370 lines)
   - False extinction detection bug
   - Organizations never die bug
   - Missing death accounting

**Consensus Across All Reviews:**
- Structure is sound, parameters need recalibration
- Excellent research integration, poor parameter tuning
- Missing recovery/resilience mechanisms
- Zero variance in outcomes (determinism bug)

---

**Next Steps:**
1. Review this plan with team
2. Prioritize P0.1-P0.3 for immediate work (1 day sprint)
3. Create GitHub issues for each task
4. Assign owners and timeline
5. Set up regression test suite

**Status:** 🟡 READY FOR IMPLEMENTATION

---

**Document History:**
- Oct 15, 2025: Initial plan created from 4 critical reviews
- Consolidated findings from 140KB of review documents
- Total analysis: ~200 hours of critical review work

**Maintainer:** Implementation team
**Review Cadence:** Update after each priority level completion
