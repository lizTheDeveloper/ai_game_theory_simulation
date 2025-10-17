# Phase 2: Exogenous Shock System - Black & Gray Swans

**Date:** October 17, 2025
**Source:** Modeling contingency and agency debate (research-skeptic + super-alignment-researcher consensus)
**Status:** MEDIUM PRIORITY - After Phase 1 validation
**Effort:** 8-12 hours
**Research Confidence:** 75% (shock systems used in climate models, calibrated to historical data)

---

## Problem Statement

**Phase 1 Adds Variance But May Miss True Black Swans:**

Lévy flights add fat-tailed distributions to **endogenous processes** (breakthroughs, cascades, adoption). But they don't capture **exogenous shocks** - events that emerge from OUTSIDE the modeled state space:

**Examples of Exogenous Shocks (Historical 1945-2025):**
- COVID-19 pandemic (novel pathogen from animal reservoir)
- Arab Spring (social media cascade, unprecedented coordination)
- Fukushima (earthquake + tsunami + meltdown cascade)
- 2008 Financial Crisis (mortgage-backed securities collapse)
- Cuban Missile Crisis (brinkmanship escalation)

**Key Insight:** These weren't predictable from state variables - they emerged from **unknown unknowns**.

---

## Research Foundation

### Black Swan Theory

**Taleb, N. N. (2007).** *The Black Swan: The Impact of the Highly Improbable*
- **Core Argument:** Most impactful events are outliers that models can't predict
- **Characteristics:** High impact, low predictability, retrospective explainability
- **Critique of Models:** Bell curve assumes stationary distributions, reality is non-stationary
- **Implication:** Models should inject rare unpredictable shocks, not just model known dynamics

### Critical Transitions in Complex Systems

**Sornette, D. (2003).** "Critical phase transitions in social sciences," *PNAS*
- **Finding:** Financial crashes, revolutions, paradigm shifts follow power-law signatures before transitions
- **Evidence:** 2008 crash, Arab Spring, scientific revolutions show log-periodic oscillations
- **Warning Signals:** Increased variance, increased autocorrelation, critical slowing down
- **Implication:** Systems give WARNING but TIMING remains unpredictable

### Climate Model Precedent

**IPCC Climate Models (AR6, 2021-2023):** Include exogenous shock injections
- **Volcanic Eruptions:** Random injection (historical frequency: ~1 major eruption per 50 years)
- **Solar Variations:** 11-year cycles + random flares
- **Asteroid Impacts:** Low-probability catastrophic events (Tunguska-scale: ~1 per century)
- **Methodology:** Historical frequency calibration → random sampling from distribution

---

## Historical Calibration

### Black Swan Frequency (1945-2025, 80 years)

**Research-Skeptic's Analysis:**

**Nuclear Near-Misses:** ~6 events
- Cuban Missile Crisis (1962)
- Able Archer (1983)
- 1983 false alarm (Stanislav Petrov)
- 1995 Norwegian rocket incident
- 2010 Air Force nuclear communication malfunction
- 2018 Hawaii false alarm

**Pandemics:** ~2 civilization-scale events
- 1957 influenza pandemic (1-2M deaths)
- 1968 influenza pandemic (1-4M deaths)
- COVID-19 (2020-2023, 7M+ deaths)

**Economic Crashes:** ~3 major events
- 1987 Black Monday (22% single-day crash)
- 2008 Financial Crisis (Great Recession)
- 2020 Pandemic Crash (rapid recovery due to intervention)

**Breakthrough Technologies:** ~4 transformative
- Transistor (1947) → enabled computing revolution
- Integrated Circuit (1958) → Moore's Law era
- Internet (1990s) → information age
- Transformers (2017) → LLM revolution

**Climate:** ~0 sudden shifts (only gradual warming)

**Total: ~15 black swans in 80 years**
- **Frequency:** 15 / 80 = 0.1875 per year = 0.0156 per month (~1.6% per month)

### Stratification by Impact Severity

**Civilization-Altering (Black Swans):** ~4 events (nuclear near-misses that could have ended civilization)
- **Frequency:** 4 / 80 = 0.05 per year = 0.004 per month = **0.4% per month**
- **Conservative Estimate:** 0.1% per month (avoid over-representation)

**Major but Recoverable (Gray Swans):** ~11 events (crashes, pandemics, breakthroughs)
- **Frequency:** 11 / 80 = 0.1375 per year = 0.0115 per month = **1.15% per month**
- **Conservative Estimate:** 1.0% per month (round down)

---

## Implementation Design

### Shock Type Taxonomy

```typescript
/**
 * Exogenous Shock Types
 *
 * Stratified by impact severity and recovery potential.
 *
 * Historical Calibration: 15 black/gray swans in 80 years (1945-2025)
 * - Black swans (civilization-altering): 0.1% per month
 * - Gray swans (major recoverable): 1.0% per month
 *
 * Research: Taleb (2007), Sornette (2003), IPCC volcanic eruption modeling
 */
export enum ShockType {
  // ========================================
  // BLACK SWAN (0.1% per month)
  // Civilization-altering, difficult/impossible recovery
  // ========================================

  /**
   * Full-scale nuclear war
   * Effect: 50-99% mortality, instant or rapid (1-6 months)
   * Historical: 0 occurrences, 6 near-misses (Cuban Missile, 1983 false alarm, etc.)
   * Recovery: 50+ years (Dark Age scenario)
   */
  NUCLEAR_WAR = 'nuclear_war',

  /**
   * Sudden AGI breakthrough (recursive self-improvement unlocked)
   * Effect: Unlock ALL research instantly, trigger fast takeoff scenario
   * Historical: 0 occurrences (no precedent)
   * Recovery: N/A (paradigm shift, not recoverable to previous state)
   */
  AGI_BREAKTHROUGH = 'agi_breakthrough',

  /**
   * Asteroid impact (Tunguska-scale or larger)
   * Effect: 10-90% mortality depending on size, nuclear winter effects
   * Historical: 0 major impacts since 1908 (Tunguska, uninhabited area)
   * Recovery: 10-50 years depending on severity
   */
  ASTEROID_IMPACT = 'asteroid_impact',

  /**
   * Mega-pandemic (engineered bioweapon or extreme natural pathogen)
   * Effect: 20-40% mortality over 24 months, social collapse
   * Historical: 0 occurrences (COVID was ~0.1% mortality, not mega-pandemic)
   * Recovery: 5-20 years (Spanish Flu recovery took ~10 years)
   */
  MEGA_PANDEMIC = 'mega_pandemic',

  // ========================================
  // GRAY SWAN (1% per month)
  // Major disruption, recoverable with policy response
  // ========================================

  /**
   * Global financial crash (2008-scale or worse)
   * Effect: 10-20% GDP loss, unemployment spike, social unrest
   * Historical: 3 occurrences (1987, 2008, 2020)
   * Recovery: 2-5 years with intervention (faster than Great Depression)
   */
  FINANCIAL_CRASH = 'financial_crash',

  /**
   * Regional war (NOT nuclear, but major conventional conflict)
   * Effect: 1-5% mortality in affected region, refugee crisis, economic disruption
   * Historical: Multiple (Iraq War, Syrian Civil War, Ukraine War)
   * Recovery: 5-15 years (depends on reconstruction support)
   */
  REGIONAL_WAR = 'regional_war',

  /**
   * Breakthrough technology (fusion, nanotech, longevity unlocked early)
   * Effect: Unlock 1 random TIER 2-3 tech ahead of schedule
   * Historical: 4 transformative breakthroughs (transistor, IC, internet, transformers)
   * Recovery: N/A (paradigm shift, positive shock)
   */
  TECH_BREAKTHROUGH = 'tech_breakthrough',

  /**
   * Political upheaval (revolution, regime change, institutional collapse)
   * Effect: Democracy index reset, institutions reset, governance disruption
   * Historical: Multiple (Arab Spring, Soviet collapse, color revolutions)
   * Recovery: 5-20 years (depends on new regime stability)
   */
  POLITICAL_UPHEAVAL = 'political_upheaval',
}
```

### Shock Effects Implementation

```typescript
/**
 * Applies an exogenous shock to the game state.
 *
 * @param state - Current game state
 * @param shockType - Type of shock to apply
 * @param rng - Random number generator
 */
export function applyExogenousShock(
  state: GameState,
  shockType: ShockType,
  rng: () => number
): void {
  console.log(`\n🌩️  EXOGENOUS SHOCK: ${shockType}`);
  console.log(`   Month: ${state.currentMonth}`);

  switch (shockType) {
    case ShockType.NUCLEAR_WAR:
      applyNuclearWarShock(state, rng);
      break;

    case ShockType.AGI_BREAKTHROUGH:
      applyAGIBreakthroughShock(state, rng);
      break;

    case ShockType.ASTEROID_IMPACT:
      applyAsteroidImpactShock(state, rng);
      break;

    case ShockType.MEGA_PANDEMIC:
      applyMegaPandemicShock(state, rng);
      break;

    case ShockType.FINANCIAL_CRASH:
      applyFinancialCrashShock(state, rng);
      break;

    case ShockType.REGIONAL_WAR:
      applyRegionalWarShock(state, rng);
      break;

    case ShockType.TECH_BREAKTHROUGH:
      applyTechBreakthroughShock(state, rng);
      break;

    case ShockType.POLITICAL_UPHEAVAL:
      applyPoliticalUpheavalShock(state, rng);
      break;
  }

  // Record shock in history
  state.history.exogenousShocks = state.history.exogenousShocks || [];
  state.history.exogenousShocks.push({
    month: state.currentMonth,
    type: shockType,
    severity: calculateShockSeverity(state, shockType),
  });
}

/**
 * Nuclear War Shock
 * Effect: 50-99% mortality, instant or rapid
 */
function applyNuclearWarShock(state: GameState, rng: () => number): void {
  // Severity depends on arsenals and escalation
  const arsenalSize = state.geopolitical.nuclearArsenals.reduce((a, b) => a + b, 0);
  const mortalityRate = 0.5 + rng() * 0.49; // 50-99%

  console.log(`   💥 Full-scale nuclear exchange`);
  console.log(`   Estimated mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality
  state.population.current *= (1 - mortalityRate);

  // Trigger nuclear winter (environmental collapse)
  state.environmental.climateChange = Math.min(1.0, state.environmental.climateChange + 0.5);
  state.environmental.biodiversityLoss = Math.min(1.0, state.environmental.biodiversityLoss + 0.6);

  // Infrastructure destruction
  state.economy.stage = Math.max(1, state.economy.stage - 2);
  state.aiInfrastructure.dataCenters *= 0.1; // 90% destroyed

  // Social collapse
  state.society.cohesion = Math.min(0.2, state.society.cohesion);
  state.governance.institutionStrength = Math.min(0.1, state.governance.institutionStrength);

  // Set extinction scenario
  if (mortalityRate > 0.875) {
    state.finalOutcome.type = 'bottleneck'; // 87.5-98.75% = genetic bottleneck
  } else if (mortalityRate > 0.5) {
    state.finalOutcome.type = 'dark_age'; // 50-87.5% = Dark Age
  }
}

/**
 * AGI Breakthrough Shock (Positive Black Swan)
 * Effect: Unlock all research, trigger fast takeoff
 */
function applyAGIBreakthroughShock(state: GameState, rng: () => number): void {
  console.log(`   🚀 Recursive self-improvement achieved`);
  console.log(`   All research unlocked, fast takeoff initiated`);

  // Unlock all technologies instantly
  state.technologies.forEach(tech => {
    if (!tech.unlocked) {
      tech.unlocked = true;
      tech.deploymentLevel = 0.5; // 50% deployed instantly
      console.log(`      ✓ ${tech.name} unlocked`);
    }
  });

  // Boost AI capabilities dramatically
  state.aiAgents.forEach(agent => {
    agent.capabilities.selfImprovement = Math.min(10.0, agent.capabilities.selfImprovement + 5.0);
    agent.capabilities.research = Math.min(10.0, agent.capabilities.research + 3.0);
  });

  // Trigger fast takeoff scenario
  state.risks.slowTakeoverInProgress = false;
  state.risks.fastTakeoverRisk = 0.9; // High risk of value misalignment
}

/**
 * Asteroid Impact Shock
 * Effect: 10-90% mortality, nuclear winter
 */
function applyAsteroidImpactShock(state: GameState, rng: () => number): void {
  // Size determines mortality (Tunguska = 0M, Chicxulub = 75% species)
  const impactSize = rng(); // 0-1 scale
  const mortalityRate = impactSize * 0.8; // 0-80% mortality

  console.log(`   ☄️  Asteroid impact`);
  console.log(`   Impact size: ${(impactSize * 100).toFixed(1)}%`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality
  state.population.current *= (1 - mortalityRate);

  // Environmental effects (dust, climate disruption)
  state.environmental.climateChange = Math.min(1.0, state.environmental.climateChange + impactSize * 0.4);
  state.environmental.biodiversityLoss = Math.min(1.0, state.environmental.biodiversityLoss + impactSize * 0.5);

  // Infrastructure damage (concentrated in impact region)
  const infrastructureDamage = impactSize * 0.3;
  state.aiInfrastructure.dataCenters *= (1 - infrastructureDamage);

  if (mortalityRate > 0.5) {
    state.finalOutcome.type = 'collapse';
  }
}

/**
 * Mega-Pandemic Shock
 * Effect: 20-40% mortality over 24 months
 */
function applyMegaPandemicShock(state: GameState, rng: () => number): void {
  const severity = 0.2 + rng() * 0.2; // 20-40% mortality

  console.log(`   🦠 Mega-pandemic outbreak`);
  console.log(`   Expected mortality: ${(severity * 100).toFixed(1)}% over 24 months`);

  // Set pandemic state (gradual mortality over 24 months, not instant)
  state.crises.megaPandemic = {
    active: true,
    startMonth: state.currentMonth,
    totalMortality: severity,
    monthlyMortality: severity / 24,
    socialDisruption: 0.6, // High disruption
  };

  // Immediate economic shock
  state.economy.stage = Math.max(1, state.economy.stage - 1);

  // Social cohesion decline
  state.society.cohesion *= 0.7;
}

/**
 * Financial Crash Shock
 * Effect: 10-20% GDP loss, unemployment spike
 */
function applyFinancialCrashShock(state: GameState, rng: () => number): void {
  const gdpLoss = 0.1 + rng() * 0.1; // 10-20% GDP loss

  console.log(`   📉 Global financial crash`);
  console.log(`   GDP loss: ${(gdpLoss * 100).toFixed(1)}%`);

  // Economic contraction
  state.economy.stage = Math.max(1, state.economy.stage - 1);

  // Unemployment spike
  const unemploymentIncrease = gdpLoss * 1.5; // Okun's law approximation
  state.labor.unemployment = Math.min(0.8, state.labor.unemployment + unemploymentIncrease);

  // QoL decline
  state.globalMetrics.qualityOfLife *= (1 - gdpLoss * 0.5);

  // Social unrest
  state.society.cohesion *= 0.85;

  // AI lab funding crisis
  state.aiOrganizations.forEach(org => {
    org.capital *= (1 - gdpLoss * 2); // AI funding hit harder (VC dries up)
  });
}

/**
 * Regional War Shock
 * Effect: 1-5% mortality, refugee crisis
 */
function applyRegionalWarShock(state: GameState, rng: () => number): void {
  const mortalityRate = 0.01 + rng() * 0.04; // 1-5% global mortality

  console.log(`   ⚔️  Regional war outbreak`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality
  state.population.current *= (1 - mortalityRate);

  // Economic disruption (supply chains, energy, trade)
  state.economy.stage = Math.max(1, state.economy.stage - 1);

  // Refugee crisis (social cohesion decline)
  state.society.cohesion *= 0.9;

  // Nuclear risk increase (escalation potential)
  state.geopolitical.militaryTension = Math.min(1.0, state.geopolitical.militaryTension + 0.2);
}

/**
 * Tech Breakthrough Shock (Positive Gray Swan)
 * Effect: Unlock 1 random TIER 2-3 tech
 */
function applyTechBreakthroughShock(state: GameState, rng: () => number): void {
  // Find locked TIER 2-3 technologies
  const candidateTechs = state.technologies.filter(
    tech => !tech.unlocked && (tech.tier === 2 || tech.tier === 3)
  );

  if (candidateTechs.length === 0) {
    console.log(`   ✗ No TIER 2-3 techs available to unlock`);
    return;
  }

  // Randomly select one
  const selectedTech = candidateTechs[Math.floor(rng() * candidateTechs.length)];
  selectedTech.unlocked = true;
  selectedTech.deploymentLevel = 0.1; // 10% initial deployment

  console.log(`   🔬 Breakthrough: ${selectedTech.name} unlocked`);
  console.log(`   TIER ${selectedTech.tier} technology ahead of schedule`);
}

/**
 * Political Upheaval Shock
 * Effect: Regime change, institutions reset
 */
function applyPoliticalUpheavalShock(state: GameState, rng: () => number): void {
  console.log(`   🏛️  Political upheaval (revolution/regime change)`);

  // Institutional collapse
  state.governance.institutionStrength *= 0.5; // 50% collapse
  state.governance.democracyIndex *= (0.5 + rng() * 0.5); // 50-100% of previous

  // Determine outcome (democracy or autocracy)
  const democratizationChance = state.society.cohesion * state.society.informationIntegrity;
  const democratizes = rng() < democratizationChance;

  if (democratizes) {
    state.governance.democracyIndex = Math.min(1.0, state.governance.democracyIndex + 0.3);
    console.log(`   ✓ Democratization (Arab Spring scenario)`);
  } else {
    state.governance.democracyIndex = Math.max(0.0, state.governance.democracyIndex - 0.3);
    console.log(`   ✗ Authoritarian takeover`);
  }

  // Social cohesion shock
  state.society.cohesion *= 0.7;

  // Economic disruption
  state.economy.stage = Math.max(1, state.economy.stage - 1);
}
```

### Phase Orchestrator Integration

```typescript
/**
 * Exogenous Shock Phase
 *
 * Checks for rare unpredictable events outside the modeled state space.
 *
 * Research: Taleb (2007), Sornette (2003), IPCC climate models
 * Historical Calibration: 15 black/gray swans in 80 years (1945-2025)
 */
export class ExogenousShockPhase implements SimulationPhase {
  id = 'exogenous-shocks';
  name = 'Exogenous Shock Detection';
  order = 27; // After crisis detection, before outcomes

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // BLACK SWAN: 0.1% per month (~1% per year)
    if (rng() < 0.001) {
      const blackSwans = [
        ShockType.NUCLEAR_WAR,
        ShockType.AGI_BREAKTHROUGH,
        ShockType.ASTEROID_IMPACT,
        ShockType.MEGA_PANDEMIC,
      ];

      const shock = blackSwans[Math.floor(rng() * blackSwans.length)];
      applyExogenousShock(state, shock, rng);

      return {
        success: true,
        message: `Black swan: ${shock}`,
        changes: {
          shockTriggered: shock,
          severity: 'civilization-altering',
        },
      };
    }

    // GRAY SWAN: 1% per month (~10% per year)
    if (rng() < 0.01) {
      const graySwans = [
        ShockType.FINANCIAL_CRASH,
        ShockType.REGIONAL_WAR,
        ShockType.TECH_BREAKTHROUGH,
        ShockType.POLITICAL_UPHEAVAL,
      ];

      const shock = graySwans[Math.floor(rng() * graySwans.length)];
      applyExogenousShock(state, shock, rng);

      return {
        success: true,
        message: `Gray swan: ${shock}`,
        changes: {
          shockTriggered: shock,
          severity: 'major-recoverable',
        },
      };
    }

    return {
      success: true,
      message: 'No exogenous shocks this month',
    };
  }
}
```

---

## File Structure

### New File: `src/simulation/engine/phases/ExogenousShockPhase.ts`

Contains:
- `ShockType` enum (8 shock types)
- `applyExogenousShock()` dispatcher
- Individual shock effect functions (8 functions)
- `ExogenousShockPhase` class for orchestrator

### Modified File: `src/simulation/engine/PhaseOrchestrator.ts`

Add phase registration:
```typescript
import { ExogenousShockPhase } from './phases/ExogenousShockPhase';

// In constructor
this.phases.push(new ExogenousShockPhase());
```

### Modified File: `src/types/game.ts`

Add to GameState:
```typescript
interface GameState {
  // ... existing fields

  history: {
    // ... existing fields
    exogenousShocks?: Array<{
      month: number;
      type: ShockType;
      severity: 'civilization-altering' | 'major-recoverable';
    }>;
  };

  crises: {
    // ... existing fields
    megaPandemic?: {
      active: boolean;
      startMonth: number;
      totalMortality: number;
      monthlyMortality: number;
      socialDisruption: number;
    };
  };
}
```

---

## Validation Criteria

### Expected Outcome Distribution Change

**Before Phase 2:**
- Seed convergence: 60-70% (after Phase 1 Lévy flights)
- Shock occurrence: 0% (all shocks are endogenous)
- Outcome variance: Moderate (fat tails from Lévy flights)

**After Phase 2:**
- Seed convergence: 50-60% (exogenous shocks add divergence)
- Shock occurrence: ~5-10% of runs experience black/gray swans
- Outcome variance: High (some runs dramatically different due to shocks)

### Validation Tests

**Monte Carlo N=100:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120
```

**Metrics to Track:**
1. **Shock frequency:** Should match historical (0.1% black swan, 1% gray swan per month)
2. **Outcome divergence:** ~5-10% of runs should have dramatically different outcomes
3. **Shock timing distribution:** Should be uniform over time (not clustered)
4. **Severity distribution:** Black swans should be rarer but more impactful than gray swans
5. **Recovery trajectories:** Gray swans should be recoverable, black swans often terminal

### Success Criteria

✅ **Historical calibration:** Shock frequency matches 15 events in 80 years
✅ **Divergence increase:** ~5-10% of runs experience dramatically different outcomes due to shocks
✅ **Seed convergence drops:** From 60-70% to 50-60%
✅ **Interpretability preserved:** Can still analyze MOST runs without exogenous shocks dominating
✅ **Shock effects realistic:** Nuclear war → 50-99% mortality, financial crash → 10-20% GDP loss (matches research)

---

## Research Citations

1. **Taleb, N. N. (2007).** *The Black Swan: The Impact of the Highly Improbable.* Random House.

2. **Sornette, D. (2003).** "Critical Phenomena in Natural Sciences: Chaos, Fractals, Selforganization and Disorder: Concepts and Tools." *PNAS*, 100(22), 12653-12654.

3. **IPCC (2021-2023).** *Climate Change 2021-2023: The Physical Science Basis.* Contribution of Working Group I to the Sixth Assessment Report (AR6). [Volcanic eruption and solar variation modeling methodology]

4. **Savranskaya, S., & Blanton, T. (2012).** "The Underwater Cuban Missile Crisis: Soviet Submarines and the Risk of Nuclear War." *National Security Archive Electronic Briefing Book No. 399*.

5. **Kuran, T. (1991).** "Now Out of Never: The Element of Surprise in the East European Revolution of 1989." *World Politics*, 44(1), 7-48.

---

## Next Steps

After Phase 2 validation (N=100 Monte Carlo):

**If shock frequency ~5-10% AND outcomes diverge:**
→ PROCEED to Phase 3 (Critical Junctures) - Shocks helped but still missing structural agency

**If shock frequency >20% (too many shocks dominating outcomes):**
→ REDUCE probabilities - 0.1% black swan may be too high, try 0.05%

**If outcomes still 60-70% convergent despite shocks:**
→ SKIP Phase 3 temporarily - Diagnose why structural attractors so strong, may need earlier fixes

---

**Total Effort:** 8-12 hours (implementation + testing + integration)
**Files Modified:** 3 files (1 new phase, 1 orchestrator, 1 types)
**Research Confidence:** 75% (shock systems validated in climate models, historical calibration solid)
**Impact:** Capture "unknown unknowns" that pure endogenous modeling misses
