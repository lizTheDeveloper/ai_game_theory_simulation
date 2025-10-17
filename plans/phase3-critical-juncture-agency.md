# Phase 3: Critical Juncture Agency - Structural Conditions for Heroism

**Date:** October 17, 2025
**Source:** Modeling contingency and agency debate (research-skeptic + super-alignment-researcher consensus)
**Status:** COMPLEX - After Phase 2 validation
**Effort:** 20-30 hours
**Research Confidence:** 70% (agency research strong, implementation complex, requires validation against historical data)

---

## Problem Statement

**Phases 1-2 Add Variance But Miss Individual/Collective Agency:**

- **Phase 1 (Lévy flights):** Fat-tailed randomness in endogenous processes
- **Phase 2 (Exogenous shocks):** Rare unpredictable events from outside state space

**What's Still Missing:** Moments when **individuals or collectives can tip outcomes** despite structural forces.

**Historical Examples:**
1. **Vasili Arkhipov (1962):** Refused to launch nuclear torpedo during Cuban Missile Crisis
   - Context: 2 other officers voted YES, he was the only dissent
   - Conditions: Communication cut, couldn't verify if war started, high ambiguity
   - Outcome: Single decision prevented nuclear war

2. **Leipzig Protests (1989):** One defection revealed hidden opposition → cascade
   - Context: East Germany, high latent opposition but pluralistic ignorance
   - Mechanism: Single protest revealed many others shared dissent → regime collapse
   - Outcome: Berlin Wall fell, Soviet bloc collapsed

3. **Montreal Protocol (1985-1987):** CFC phase-out despite economic incentives
   - Context: Reagan + Gorbachev cooperation during Cold War (unexpected)
   - Mechanism: DuPont voluntarily phased out CFCs (profit sacrifice)
   - Outcome: Ozone hole recovering, catastrophe averted

**Key Insight:** These weren't random "hero spawns" - they occurred at **critical junctures** when:
- Institutions were IN FLUX (not stable)
- Information was AMBIGUOUS (coordination problems)
- Forces were BALANCED (multiple equilibria possible)

---

## Research Foundation

### Structure vs Agency - The 90/10 Split

**Consensus from Debate:**
- **90% of history:** Structure dominates (Acemoglu, Henrich, Fernández-Villaverde)
- **10% of history:** Critical junctures where individuals matter (Svolik, Kuran, Arkhipov case)

### Evidence That Structure Usually Dominates

**Acemoglu, Johnson & Robinson (2001)**, *American Economic Review*: "The Colonial Origins of Comparative Development"
- **Method:** Natural experiment comparing colonial institutions across countries
- **Finding:** Institutions set in 1600s-1800s STILL determine outcomes today (400 years later!)
- **Implication:** Individual leaders in bad institutional environments can't fix structural problems
- **Example:** Nigeria has had good leaders AND bad leaders → outcomes converge (oil curse, corruption)

**Henrich et al. (2010)**, *Science*: "Markets, Religion, Community Size, and the Evolution of Fairness"
- **Method:** Ultimatum game experiments across 15 diverse societies
- **Finding:** Individual behavior is 90% DETERMINED by cultural/institutional context
- **Example:** Same person behaves cooperatively in high-trust society, selfishly in low-trust society

**Fernández-Villaverde et al. (2023)**, *AER*: "The Economic Effects of Populist Leaders"
- **Method:** Regression discontinuity design (close elections, compare populist vs non-populist)
- **Finding:** Populist leaders reduce GDP by 10% over 15 years, BUT only in WEAK institutions
- **Strong institutions (Sweden, Germany):** Populist leaders constrained, minimal damage
- **Weak institutions (Venezuela, Turkey):** Populist leaders destroy economy
- **Implication:** Institutions > individuals

### Evidence for Agency at Critical Junctures

**Svolik, M. W. (2012)**, *The Politics of Authoritarian Rule*
- **Finding:** Autocratic regimes have CRITICAL MOMENTS where elite coordination problems emerge
- **Example:** Soviet Union 1991 coup - Gorbachev's survival depended on WHICH generals defected
- **Mechanism:** When institutions are IN FLUX (not stable), individuals can tip outcomes
- **Key Insight:** Agency emerges at moments of UNCERTAINTY and COORDINATION FAILURE

**Kuran, T. (1991)**, *World Politics*: "Now Out of Never: The Element of Surprise in the East European Revolution"
- **Finding:** Communist regimes collapsed due to PREFERENCE FALSIFICATION cascades
- **Mechanism:**
  - Everyone privately opposed regime BUT believed they were minority (pluralistic ignorance)
  - ONE person publicly defied regime (Leipzig protests)
  - Revealed that many others shared dissent → cascade
- **Implication:** At critical junctures, ONE actor can trigger information cascade
- **KEY CONSTRAINT:** This only works when LATENT OPPOSITION exists (structure enables hero)

**Tetlock & Belkin (1996)**, *Counterfactual Thought Experiments in World Politics*
- **Method:** Expert historians assess "minimal rewrite" counterfactuals
- **Finding:** MANY historical outcomes were CLOSE to alternative paths
- **Examples:**
  - 1914 WWI: 30% chance avoided if Austria delayed ultimatum
  - 1962 Cuban Missile: 50% chance of nuclear exchange without Khrushchev's rationality
  - 1989 Soviet collapse: Could have persisted 10-20 years with different leadership
- **Implication:** Individuals matter at NARROW windows when structural forces are BALANCED

### The Arkhipov Case Study (Deep Dive)

**Savranskaya & Blanton (2012)**, *National Security Archive*: "The Underwater Cuban Missile Crisis"
- **Context:** Soviet submarine B-59, depth-charged by US Navy, communication cut
- **Doctrine:** 3 officers must agree to launch nuclear torpedo
- **Votes:**
  - Captain Valentin Savitsky: LAUNCH (2/3)
  - Second Officer Ivan Maslennikov: LAUNCH (3/3)
  - Flotilla Commander Vasili Arkhipov: NO LAUNCH (dissent)
- **Critical Detail:** Arkhipov was NOT the captain of this sub (chain of command said launch)
- **Why Arkhipov Succeeded Despite Defying Structure:**
  1. **Personal authority:** Survived K-19 reactor disaster (1961), earned respect
  2. **Ambiguity:** Communications cut, couldn't verify if war had started
  3. **Physical control:** Could physically prevent launch by withholding authorization key

**Verdict:** Rare case where individual overcame ADVERSE structural conditions, but conditions were HIGHLY SPECIFIC.

### Structural Conditions for Agency

**Sen, A. (1999)**, *Development as Freedom*
- **Argument:** Democracies don't have famines (agency + accountability)
- **Mechanism:** Free press + elections → government responsive to crisis
- **Example:** India 1947-2000 (no famines), China 1958-1961 (30M deaths Great Leap Forward)
- **Implication:** Democratic institutions ENABLE individual agency

**Acemoglu, D., & Robinson, J. A. (2019)**, *The Narrow Corridor*
- **Argument:** Liberty emerges from state-society BALANCE, not heroes
- **Mechanism:** Strong state + strong society → checks and balances → agency possible
- **Failure Modes:** Weak state (anarchy), weak society (despotism)

**Ostrom, E. (1990)**, *Governing the Commons*
- **Finding:** Collective action succeeds via INSTITUTIONS, not individuals
- **Examples:** 30+ case studies of resource management (fisheries, forests, irrigation)
- **Success Factors:** Clear boundaries, monitoring, graduated sanctions, conflict resolution
- **Implication:** "Heroic individuals" succeed when institutional scaffolding supports them

---

## Implementation Design

### Critical Juncture Detection

```typescript
/**
 * Detects if the current state is at a critical juncture.
 *
 * Critical junctures occur when:
 * 1. Institutional flux (institutions unstable, in transition)
 * 2. Information ambiguity (coordination problems, pluralistic ignorance)
 * 3. Balanced forces (crisis but not overwhelming, multiple equilibria possible)
 *
 * Research: Svolik (2012), Kuran (1991), Tetlock & Belkin (1996)
 *
 * Expected frequency: ~5-10% of months (matches historical critical junctures)
 */
export function isAtCriticalJuncture(state: GameState): boolean {
  // 1. Institutional Flux
  // High flux = institutions unstable (regime change, crisis, reform)
  // Low flux = institutions stable (either strong democracy OR strong autocracy)
  const institutionalFlux = 1 - state.governance.institutionStrength;

  // 2. Information Ambiguity
  // High ambiguity = coordination problems, pluralistic ignorance (Kuran 1991)
  // Low ambiguity = clear information, common knowledge
  const infoAmbiguity = 1 - state.society.informationIntegrity;

  // 3. Balanced Forces
  // Crisis present but not overwhelming (vulnerable but recoverable)
  const activeCrises = countActiveCrises(state);
  const qol = state.globalMetrics.qualityOfLife;

  const forcesBalanced = (
    activeCrises > 0 &&      // At least one crisis (system vulnerable)
    activeCrises < 3 &&      // Not overwhelming (total collapse)
    qol > 0.3 &&             // Not total collapse
    qol < 0.7                // Not stable prosperity
  );

  // Critical juncture: ALL THREE conditions must be met
  const isJuncture = (
    institutionalFlux > 0.6 &&
    infoAmbiguity > 0.5 &&
    forcesBalanced
  );

  if (isJuncture) {
    console.log(`\n⚡ CRITICAL JUNCTURE DETECTED`);
    console.log(`   Institutional flux: ${(institutionalFlux * 100).toFixed(1)}%`);
    console.log(`   Info ambiguity: ${(infoAmbiguity * 100).toFixed(1)}%`);
    console.log(`   Active crises: ${activeCrises}`);
    console.log(`   QoL: ${(qol * 100).toFixed(1)}%`);
  }

  return isJuncture;
}

function countActiveCrises(state: GameState): number {
  let count = 0;

  if (state.crises.phosphorus?.active) count++;
  if (state.crises.freshwater?.active) count++;
  if (state.crises.oceanAcidification?.active) count++;
  if (state.crises.novelEntities?.active) count++;
  if (state.environmental.climateChange > 0.7) count++;
  if (state.society.cohesion < 0.3) count++;
  if (state.governance.institutionStrength < 0.3) count++;
  if (state.labor.unemployment > 0.4) count++;
  if (state.aiAlignment.averageAlignment < 0.4) count++;

  return count;
}
```

### Agency Potential Calculation

```typescript
/**
 * Calculates the potential for individual/collective agency at a critical juncture.
 *
 * Agency potential is HIGH when:
 * - Democracies (Sen 1999: democracies don't have famines)
 * - Information quality (can coordinate, verify, communicate)
 * - Institutional scaffolding (Ostrom 1990: institutions enable collective action)
 * - Latent opposition (Kuran 1991: hidden grievances ready for cascade)
 * - Personal authority (Arkhipov case: respected elders can tip outcomes)
 *
 * Research: Sen (1999), Svolik (2012), Kuran (1991), Ostrom (1990)
 *
 * @returns Agency potential 0-1 (0 = no agency, 1 = high agency)
 */
export function calculateAgencyPotential(state: GameState, rng: () => number): number {
  if (!isAtCriticalJuncture(state)) {
    return 0; // No individual agency when institutions stable
  }

  // 1. Base Agency (Structural Conditions)
  // Democracy, information, institutions enable agency (Sen, Acemoglu, Ostrom)
  const baseAgency = (
    state.governance.democracyIndex * 0.4 +
    state.society.informationIntegrity * 0.3 +
    state.governance.institutionStrength * 0.3
  );

  // 2. Latent Opposition (Kuran 1991)
  // If people are unhappy but can't coordinate, individual can spark cascade
  // Threshold: QoL < 0.6 indicates latent opposition exists
  const latentOpposition = Math.max(0, 0.6 - state.globalMetrics.qualityOfLife);

  // 3. Coordination Cascade Potential (Leipzig 1989)
  // When info integrity LOW but latent opposition HIGH → cascade possible
  // ONE defector reveals hidden opposition → preference falsification collapse
  const coordinationCascade = (
    latentOpposition > 0.3 &&
    state.society.informationIntegrity < 0.4
  ) ? 0.2 : 0;

  // 4. Personal Authority (Arkhipov Case)
  // Rare individuals with exceptional credibility (5% historical frequency)
  // Examples: Respected elders, moral authorities, experienced leaders
  const personalAuthority = rng() < 0.05 ? 0.3 : 0;

  // 5. Social Movement Strength
  // Organized opposition increases agency potential
  const movementStrength = state.society.socialMovements?.strength || 0;

  // Total agency potential (capped at 1.0)
  const totalAgency = Math.min(
    1.0,
    baseAgency + latentOpposition + coordinationCascade + personalAuthority + movementStrength * 0.2
  );

  return totalAgency;
}
```

### Escape Attempt Mechanics

```typescript
/**
 * Attempts to escape deterministic trajectory via structural agency.
 *
 * Success probability depends on:
 * - Agency potential (higher in democracies, with latent opposition, etc.)
 * - Crisis severity (easier to prevent small crisis than severe collapse)
 *
 * Research: Jones & Olken (2009) - leaders matter more in autocracies
 * BUT: Democracies have higher ESCAPE probability (Sen 1999)
 *
 * @returns true if escape successful, false otherwise
 */
export function attemptCriticalJunctureEscape(
  state: GameState,
  rng: () => number
): boolean {
  if (!isAtCriticalJuncture(state)) {
    return false; // No escape attempt if not at juncture
  }

  const agencyPotential = calculateAgencyPotential(state, rng);

  // Attempt escape with probability = agency potential
  const escapeAttempted = rng() < agencyPotential;

  if (!escapeAttempted) {
    return false; // No escape attempt this month
  }

  // Calculate crisis severity (0-1 scale)
  const activeCrises = countActiveCrises(state);
  const crisisSeverity = Math.min(1.0, activeCrises / 10);

  // Success probability inversely related to crisis severity
  // Easier to prevent small crisis (Arkhipov, Montreal Protocol)
  // Harder to escape severe collapse (structural forces overwhelming)
  const successProb = 1 - crisisSeverity;

  const escapeSuccessful = rng() < successProb;

  // Log the attempt
  console.log(`\n🦸 CRITICAL JUNCTURE ESCAPE ATTEMPT`);
  console.log(`   Agency potential: ${(agencyPotential * 100).toFixed(1)}%`);
  console.log(`   Crisis severity: ${(crisisSeverity * 100).toFixed(1)}%`);
  console.log(`   Success probability: ${(successProb * 100).toFixed(1)}%`);
  console.log(`   Outcome: ${escapeSuccessful ? 'SUCCESS' : 'FAILURE'}`);

  return escapeSuccessful;
}
```

### Catastrophe Prevention (Escape Effects)

```typescript
/**
 * Applies the effects of a successful critical juncture escape.
 *
 * Possible escape types:
 * 1. Prevent war (Arkhipov 1962)
 * 2. Enable cooperation (Montreal Protocol 1987)
 * 3. Recover from crisis (Kuran cascade → regime change → reform)
 * 4. Unlock breakthrough (Individual innovation → paradigm shift)
 *
 * Research: Historical case studies
 */
export function preventCatastropheAtJuncture(
  state: GameState,
  rng: () => number
): void {
  // Determine escape type based on current crisis profile
  const escapeType = determineEscapeType(state, rng);

  console.log(`   Escape type: ${escapeType}`);

  switch (escapeType) {
    case 'prevent_war':
      preventWarEscalation(state);
      break;

    case 'enable_cooperation':
      enableInternationalCooperation(state);
      break;

    case 'recover_from_crisis':
      accelerateCrisisRecovery(state);
      break;

    case 'unlock_breakthrough':
      unlockBreakthroughTechnology(state, rng);
      break;
  }

  // Record escape in history
  state.history.criticalJunctureEscapes = state.history.criticalJunctureEscapes || [];
  state.history.criticalJunctureEscapes.push({
    month: state.currentMonth,
    type: escapeType,
    agencyPotential: calculateAgencyPotential(state, rng),
    crisisSeverity: countActiveCrises(state) / 10,
  });
}

function determineEscapeType(state: GameState, rng: () => number): string {
  // Weighted by current crisis profile
  const weights: Array<{ type: string; weight: number }> = [];

  // If military tension high, war prevention most likely
  if (state.geopolitical.militaryTension > 0.7) {
    weights.push({ type: 'prevent_war', weight: 0.5 });
  }

  // If environmental crisis, cooperation most likely
  if (state.environmental.climateChange > 0.7 || countActiveCrises(state) > 2) {
    weights.push({ type: 'enable_cooperation', weight: 0.4 });
  }

  // If social crisis, recovery most likely
  if (state.society.cohesion < 0.4 || state.governance.institutionStrength < 0.4) {
    weights.push({ type: 'recover_from_crisis', weight: 0.3 });
  }

  // Breakthrough always possible (low probability)
  weights.push({ type: 'unlock_breakthrough', weight: 0.1 });

  // Normalize weights
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const normalizedWeights = weights.map(w => ({ ...w, weight: w.weight / totalWeight }));

  // Sample from weighted distribution
  const sample = rng();
  let cumulative = 0;

  for (const { type, weight } of normalizedWeights) {
    cumulative += weight;
    if (sample < cumulative) {
      return type;
    }
  }

  return 'recover_from_crisis'; // Fallback
}

function preventWarEscalation(state: GameState): void {
  console.log(`      → War escalation prevented (Arkhipov moment)`);

  // Reduce military tension dramatically
  state.geopolitical.militaryTension = Math.max(0.0, state.geopolitical.militaryTension - 0.4);

  // Improve diplomatic relations
  state.geopolitical.internationalCooperation = Math.min(
    1.0,
    state.geopolitical.internationalCooperation + 0.2
  );

  // Cancel any imminent nuclear war
  if (state.risks.nuclearWarRisk > 0.5) {
    state.risks.nuclearWarRisk *= 0.1; // 90% reduction
  }
}

function enableInternationalCooperation(state: GameState): void {
  console.log(`      → International cooperation achieved (Montreal Protocol moment)`);

  // Boost cooperation
  state.geopolitical.internationalCooperation = Math.min(
    1.0,
    state.geopolitical.internationalCooperation + 0.3
  );

  // Accelerate treaty adoption
  state.geopolitical.treaties?.forEach(treaty => {
    treaty.adherence = Math.min(1.0, treaty.adherence + 0.2);
  });

  // Unlock cooperative technologies faster
  const cooperativeTechs = state.technologies.filter(
    tech => tech.requiresCooperation && !tech.unlocked
  );

  if (cooperativeTechs.length > 0) {
    const selectedTech = cooperativeTechs[0];
    selectedTech.unlocked = true;
    console.log(`      → ${selectedTech.name} unlocked via cooperation`);
  }
}

function accelerateCrisisRecovery(state: GameState): void {
  console.log(`      → Crisis recovery accelerated (collective action success)`);

  // Boost social cohesion (Kuran cascade → mobilization → reform)
  state.society.cohesion = Math.min(1.0, state.society.cohesion + 0.2);

  // Strengthen institutions (reform moment)
  state.governance.institutionStrength = Math.min(
    1.0,
    state.governance.institutionStrength + 0.15
  );

  // Reduce environmental debt (collective action on commons)
  state.environmental.debt *= 0.85; // 15% reduction

  // Improve QoL (crisis mitigation)
  state.globalMetrics.qualityOfLife = Math.min(
    1.0,
    state.globalMetrics.qualityOfLife + 0.1
  );
}

function unlockBreakthroughTechnology(state: GameState, rng: () => number): void {
  console.log(`      → Breakthrough technology unlocked (paradigm shift)`);

  // Unlock random TIER 2-3 tech (like exogenous shock, but rarer)
  const candidateTechs = state.technologies.filter(
    tech => !tech.unlocked && (tech.tier === 2 || tech.tier === 3)
  );

  if (candidateTechs.length > 0) {
    const selectedTech = candidateTechs[Math.floor(rng() * candidateTechs.length)];
    selectedTech.unlocked = true;
    selectedTech.deploymentLevel = 0.15; // 15% initial deployment
    console.log(`      → ${selectedTech.name} unlocked`);
  }
}
```

### Phase Orchestrator Integration

```typescript
/**
 * Critical Juncture Phase
 *
 * Detects moments when structural conditions enable individual/collective agency
 * to alter otherwise deterministic trajectories.
 *
 * Research: Svolik (2012), Kuran (1991), Sen (1999), Arkhipov case study
 * Expected frequency: ~5-10% of months experience junctures, ~5-10% of junctures escape
 * Net effect: ~0.5-1% of months experience agency-driven escapes
 */
export class CriticalJuncturePhase implements SimulationPhase {
  id = 'critical-juncture';
  name = 'Critical Juncture Agency';
  order = 29; // After crises, after exogenous shocks, before extinction

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Check if at critical juncture
    if (!isAtCriticalJuncture(state)) {
      return {
        success: true,
        message: 'No critical juncture',
      };
    }

    // Attempt escape
    const escapeSuccessful = attemptCriticalJunctureEscape(state, rng);

    if (escapeSuccessful) {
      preventCatastropheAtJuncture(state, rng);

      return {
        success: true,
        message: 'Critical juncture escape successful',
        changes: {
          escapeOccurred: true,
          agencyPotential: calculateAgencyPotential(state, rng),
        },
      };
    }

    return {
      success: true,
      message: 'Critical juncture detected, no escape',
      changes: {
        junctureDetected: true,
        escapeAttempted: true,
        escapeFailed: true,
      },
    };
  }
}
```

---

## Validation Criteria

### 90/10 Split Validation

**Expected Distribution (Historical Basis):**
- **90% of runs:** Structural forces determine outcomes (policies, conditions, accumulation)
- **10% of runs:** Critical junctures occur AND escapes succeed (~5-10% junctures × ~5-10% escapes)

**Validation Test:**

Run N=1000 Monte Carlo:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=1000 --max-months=120
```

**Metrics to Track:**
1. **Juncture frequency:** Should occur in ~5-10% of months across all runs
2. **Escape frequency:** Should succeed in ~5-10% of junctures → ~0.5-1% of months total
3. **Outcome divergence:** ~5-10% of runs should have dramatically different outcomes due to escapes
4. **Democracy correlation:** Democracies should have HIGHER escape rates than autocracies (Sen 1999)
5. **Crisis severity correlation:** Success probability should inversely correlate with crisis count

### Falsifiability Tests

**Test 1: Democracy vs Autocracy**
- **Hypothesis:** Democracies have higher agency potential than autocracies (Sen 1999)
- **Method:** Compare escape rates for runs with democracyIndex > 0.7 vs < 0.3
- **Expected:** Democracies should have 2-3× higher escape rate
- **Falsification:** If no difference or autocracies higher → model is WRONG

**Test 2: Institutional Stability**
- **Hypothesis:** Escapes only occur when institutions IN FLUX (Svolik 2012)
- **Method:** Check institutionStrength at moments of escape attempts
- **Expected:** ALL escapes should occur when institutionStrength < 0.4 (flux)
- **Falsification:** If escapes occur in stable institutions (>0.7) → model is WRONG

**Test 3: Crisis Severity**
- **Hypothesis:** Success probability inversely related to crisis severity
- **Method:** Correlate escape success with number of active crises
- **Expected:** Strong negative correlation (r < -0.5)
- **Falsification:** If no correlation or positive → model is WRONG

**Test 4: Latent Opposition (Kuran Mechanism)**
- **Hypothesis:** Coordination cascades require latent opposition (QoL < 0.6) + info ambiguity
- **Method:** Check QoL and infoIntegrity at moments of cascade-type escapes
- **Expected:** ALL coordination cascades when QoL < 0.6 AND infoIntegrity < 0.4
- **Falsification:** If cascades occur without these conditions → model is WRONG

### Success Criteria

✅ **90/10 split:** ~5-10% of runs experience critical juncture escapes (not 50%, not 0%)
✅ **Democracy correlation:** Democracies 2-3× higher escape rate than autocracies
✅ **Institutional flux:** ALL escapes occur when institutionStrength < 0.4 (no escapes in stable regimes)
✅ **Crisis severity:** Strong negative correlation (r < -0.5) between success and active crises
✅ **Kuran mechanism:** Coordination cascades ONLY when latentOpposition > 0.3 AND infoAmbiguity > 0.5
✅ **Interpretability:** Can analyze logs and understand WHY escapes occurred (structural conditions visible)

---

## File Structure

### New File: `src/simulation/engine/phases/CriticalJuncturePhase.ts`

Contains:
- `isAtCriticalJuncture()` detection
- `calculateAgencyPotential()` calculation
- `attemptCriticalJunctureEscape()` mechanics
- `preventCatastropheAtJuncture()` effects
- Individual escape type functions (4 types)
- `CriticalJuncturePhase` class for orchestrator

### Modified File: `src/simulation/engine/PhaseOrchestrator.ts`

Add phase registration:
```typescript
import { CriticalJuncturePhase } from './phases/CriticalJuncturePhase';

// In constructor (order 29, after crises + exogenous shocks)
this.phases.push(new CriticalJuncturePhase());
```

### Modified File: `src/types/game.ts`

Add to GameState:
```typescript
interface GameState {
  // ... existing fields

  history: {
    // ... existing fields
    criticalJunctureEscapes?: Array<{
      month: number;
      type: 'prevent_war' | 'enable_cooperation' | 'recover_from_crisis' | 'unlock_breakthrough';
      agencyPotential: number;
      crisisSeverity: number;
    }>;
  };

  society: {
    // ... existing fields
    socialMovements?: {
      strength: number; // 0-1, organized opposition
      grievances: number; // 0-1, latent opposition
    };
  };
}
```

---

## Research Citations

1. **Acemoglu, D., Johnson, S., & Robinson, J. A. (2001).** "The Colonial Origins of Comparative Development: An Empirical Investigation." *American Economic Review*, 91(5), 1369-1401.

2. **Henrich, J., et al. (2010).** "Markets, Religion, Community Size, and the Evolution of Fairness and Punishment." *Science*, 327(5972), 1480-1484.

3. **Fernández-Villaverde, J., et al. (2023).** "The Macroeconomic Effects of Populist Leaders: Cross-Country Evidence from 1900 to 2020." *American Economic Review* (forthcoming).

4. **Svolik, M. W. (2012).** *The Politics of Authoritarian Rule.* Cambridge University Press.

5. **Kuran, T. (1991).** "Now Out of Never: The Element of Surprise in the East European Revolution of 1989." *World Politics*, 44(1), 7-48.

6. **Tetlock, P. E., & Belkin, A. (Eds.). (1996).** *Counterfactual Thought Experiments in World Politics: Logical, Methodological, and Psychological Perspectives.* Princeton University Press.

7. **Savranskaya, S., & Blanton, T. (2012).** "The Underwater Cuban Missile Crisis: Soviet Submarines and the Risk of Nuclear War." *National Security Archive Electronic Briefing Book No. 399*.

8. **Sen, A. (1999).** *Development as Freedom.* Oxford University Press.

9. **Acemoglu, D., & Robinson, J. A. (2019).** *The Narrow Corridor: States, Societies, and the Fate of Liberty.* Penguin Press.

10. **Ostrom, E. (1990).** *Governing the Commons: The Evolution of Institutions for Collective Action.* Cambridge University Press.

11. **Jones, B. F., & Olken, B. A. (2009).** "Hit or Miss? The Effect of Assassinations on Institutions and War." *American Economic Journal: Macroeconomics*, 1(2), 55-87.

---

## Next Steps

After Phase 3 validation (N=1000 Monte Carlo):

**If 90/10 split achieved AND falsifiability tests pass:**
→ SUCCESS - Model now captures structure + contingency + agency

**If escape frequency >20% (too much agency):**
→ REDUCE agency potential weights or increase juncture detection thresholds

**If escape frequency <2% (too little agency):**
→ INCREASE agency potential weights or relax juncture detection thresholds

**If falsifiability tests FAIL:**
→ DIAGNOSE - Check which assumption violated, revise model accordingly

---

**Total Effort:** 20-30 hours (implementation + testing + validation + iteration)
**Files Modified:** 3 files (1 new phase, 1 orchestrator, 1 types)
**Research Confidence:** 70% (agency research strong, implementation complex, requires empirical validation)
**Impact:** Final piece of contingency modeling - captures 90/10 structure-agency split from research
