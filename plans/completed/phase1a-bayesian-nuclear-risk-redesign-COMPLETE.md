# Phase 1A: Bayesian Nuclear Risk Redesign (REVISED)

**Date:** October 16, 2025
**Status:** DESIGN - Ready for Implementation
**Effort:** 6-10 hours (redesign + implementation + validation)
**Priority:** HIGH (part of TIER 1)
**Research Foundation:** AI-Nuclear War Pathways research + Skeptical analysis (both completed 2025-10-16)

---

## Executive Summary

**The Problem:** Current simulation has nuclear war in 40% of runs (base rate 400,000x too high vs. historical 0% in 80 years). Research shows AI manipulation → nuclear war is a **WEAK causal chain**, not strong.

**The Solution:** Redesign Phase 1A with **Bayesian framework** that:
1. Starts with realistic prior (historical base rate ~0.00001/month)
2. Updates beliefs based on evidence (AI manipulation, crises, MAD erosion)
3. Separates AI-driven **conflict** (plausible) from AI-driven **nuclear war** (rare)

**Key Insight from Research:** AI creates CONDITIONS that pressure humans to launch (information pollution, compressed timelines, false alarms) - NOT "AI launches nukes autonomously."

---

## Research Findings Summary

### Researcher Agent Findings (WEAK-TO-MODERATE)

**Pathways TO nuclear war (ranked by likelihood):**
1. **Information Warfare** (0.1-0.5% per crisis): AI deepfakes → nationalism → tensions → escalation
2. **False Alarms** (0.01-0.1%/year): AI-enhanced early warning → false positives → hard to verify
3. **LLM Escalation Bias** (0.01-0.05%): Stanford HAI 2024 - ALL 5 LLMs showed escalatory behavior in wargames
4. **Cybersecurity** (0.001-0.01%): AI-assisted attacks on nuclear C3
5. **Autonomous Weapons** (0.005-0.02%): Lower conflict threshold → conventional war → nuclear escalation

**Pathways AWAY (safeguards):**
1. International Agreements (Biden-Xi Nov 2024): -15% to -35% risk reduction
2. Technical Safeguards (PALs): -40% to -60% prevention (60+ year track record)
3. Detection Systems: -20% to -40% reduction in info warfare
4. AI-Assisted Diplomacy: -10% to -25% (experimental)

**Expected Annual Nuclear War Probability (AI-related):**
- 2025: 0.001-0.01%
- 2030: 0.01-0.1%
- 2035: 0.005-0.05% (if safeguards mature)
- 2040: 0.01-0.2% (scenario-dependent)

### Skeptic Agent Findings (WEAK + Fatal Issues)

**Three critical contradictions:**
1. **Base Rate Fallacy:** 40% simulation rate vs. 0% historical rate in 80 years = 400,000x too high
2. **Missing Mechanism:** Why would AI manipulation succeed where human manipulation has failed? 1983 Petrov incident was TECHNICAL FAILURE (stopped by humans), not manipulation
3. **Wrong Attribution:** 92.6% nuclear deaths likely driven by systemic collapse (resources, climate, social) with AI coincidental, not causal

**Verdict:** AI manipulation → nuclear war is CORRELATION (AI exists during crisis) not CAUSATION (AI causes crisis)

---

## Bayesian Framework Design

### Core Principle

Instead of fixed probabilities, use **Bayesian belief updating**:

```
P(nuclear war | evidence) = P(nuclear war) × P(evidence | nuclear war) / P(evidence)
```

**Prior belief:** Historical base rate (very low, ~0.00001/month)
**Evidence:** AI manipulation, crises, MAD erosion, bilateral tensions
**Updated belief:** Adjusted probability based on current simulation state

### Implementation Architecture

```typescript
interface BayesianNuclearRisk {
  // Prior (historical base rate)
  prior: number;              // 0.00001 per month (0.0001% per month, ~0.001% per year)

  // Evidence multipliers (how much each factor increases risk)
  evidenceMultipliers: {
    // AI-specific evidence
    aiInformationWarfare: number;     // 1.0-5.0x (AI deepfakes, social manipulation)
    aiFalseAlarms: number;            // 1.0-10.0x (AI-enhanced early warning errors)
    aiLLMEscalationBias: number;      // 1.0-3.0x (AI decision support recommends escalation)
    aiCyberThreats: number;           // 1.0-2.0x (AI hacking nuclear C3 systems)

    // Systemic evidence (NOT AI-specific)
    systemicCrises: number;           // 1.0-20.0x (resource wars, climate migration, economic collapse)
    madDeterrence: number;            // 0.1-1.0x (MAD strength REDUCES risk)
    bilateralTensions: number;        // 1.0-50.0x (flashpoint pairs at high risk)
    humanVetoPoints: number;          // 0.3-1.0x (multiple authorization steps REDUCE risk)
  };

  // Final posterior (updated belief)
  posterior: number;                   // prior × product(multipliers)

  // Attribution (what caused this probability?)
  attribution: {
    aiContribution: number;            // 0.0-1.0 (how much is AI vs. geopolitics?)
    systemicContribution: number;      // 0.0-1.0
  };
}
```

### Evidence Calculation

**1. AI Information Warfare Multiplier**
```typescript
const aiInfoWarfare = () => {
  // Check for dangerous AIs with high social + digital capability
  const dangerousAIs = state.aiAgents.filter(ai =>
    (ai.trueAlignment ?? ai.alignment) < 0.3 &&
    ai.capabilityProfile.social > 2.0 &&
    ai.capabilityProfile.digital > 2.0
  );

  if (dangerousAIs.length === 0) return 1.0; // No AI threat

  // Calculate manipulation capability (social × digital)
  const maxManipulation = Math.max(...dangerousAIs.map(ai =>
    ai.capabilityProfile.social * ai.capabilityProfile.digital
  ));

  // Multiplier: 1.0 (no threat) to 5.0 (extreme AI manipulation)
  // Research: Stanford HAI 2024 - AI shows escalatory bias
  return 1.0 + Math.min(4.0, maxManipulation / 3.0);
};
```

**2. AI False Alarms Multiplier**
```typescript
const aiFalseAlarms = () => {
  // Check AI integration in early warning systems
  const earlyWarningAI = state.madDeterrence.earlyWarningReliability;
  const aiIntegration = state.madDeterrence.aiErosionFactor;

  // AI integration DECREASES reliability (more false alarms)
  // Research: 1983 Petrov - false alarm nearly triggered launch
  const falseAlarmRate = 1.0 + (aiIntegration * 10.0) * (1 - earlyWarningReliability);

  // Multiplier: 1.0 (no AI, reliable) to 10.0 (high AI integration, unreliable)
  return Math.max(1.0, Math.min(10.0, falseAlarmRate));
};
```

**3. Systemic Crises Multiplier**
```typescript
const systemicCrises = () => {
  // Count active crises (resource wars, climate, economic collapse)
  const crises = [
    state.environmentalAccumulation.resourceCrisisActive,
    state.socialAccumulation.socialUnrestActive,
    state.globalMetrics.economicTransitionStage >= 2 && state.society.unemploymentLevel > 0.7,
    state.qualityOfLifeSystems?.basicNeeds?.foodSecurity < 0.6
  ].filter(Boolean).length;

  // Multiplier: 1.0 (no crises) to 20.0 (4 simultaneous crises)
  // Research: Historical wars during resource scarcity (WWII, Iraq, Syria)
  return 1.0 + (crises * 4.75); // 1x, 5.75x, 10.5x, 15.25x, 20x
};
```

**4. MAD Deterrence Multiplier (REDUCER)**
```typescript
const madDeterrenceMultiplier = () => {
  // Strong MAD REDUCES risk (multiplier < 1.0)
  const madStrength = state.madDeterrence.madStrength;

  // Multiplier: 0.1 (strong MAD, 90% reduction) to 1.0 (no MAD, no reduction)
  // Research: 80 years of MAD preventing nuclear war
  return Math.max(0.1, 1.0 - (madStrength * 0.9));
};
```

**5. Bilateral Tensions Multiplier**
```typescript
const bilateralTensionsMultiplier = () => {
  // Check for high-tension flashpoint pairs
  const highTensionPairs = state.bilateralTensions.filter(t =>
    t.tensionLevel > 0.8 || t.nuclearThreats
  );

  if (highTensionPairs.length === 0) return 1.0;

  // Multiplier: 1.0 (no flashpoints) to 50.0 (multiple flashpoints with nuclear threats)
  // Research: Cuban Missile Crisis, India-Pakistan Kargil War
  return 1.0 + (highTensionPairs.length * 16.0); // 1x, 17x, 33x, 49x
};
```

**6. Human Veto Points Multiplier (REDUCER)**
```typescript
const humanVetoPoints = () => {
  // Average veto points across nuclear powers
  const states = state.nuclearStates ?? [];
  const avgVetoPoints = states.reduce((sum, s) => sum + s.vetoPoints, 0) / states.length;

  // Multiplier: 0.3 (many veto points, 70% reduction) to 1.0 (few veto points, no reduction)
  // Research: Biden-Xi agreement - humans MUST authorize launch
  return Math.max(0.3, 1.0 - ((avgVetoPoints - 2) / 5) * 0.7);
};
```

### Final Posterior Calculation

```typescript
function calculateBayesianNuclearRisk(state: GameState): BayesianNuclearRisk {
  const prior = 0.00001; // Historical base rate (0.001% per year ÷ 12 months)

  // Calculate all multipliers
  const multipliers = {
    aiInformationWarfare: aiInfoWarfare(),
    aiFalseAlarms: aiFalseAlarms(),
    aiLLMEscalationBias: aiLLMEscalationBias(),
    aiCyberThreats: aiCyberThreats(),
    systemicCrises: systemicCrises(),
    madDeterrence: madDeterrenceMultiplier(),
    bilateralTensions: bilateralTensionsMultiplier(),
    humanVetoPoints: humanVetoPoints(),
  };

  // Multiply all multipliers together
  const totalMultiplier = Object.values(multipliers).reduce((product, m) => product * m, 1.0);

  // Posterior = prior × total multiplier
  const posterior = Math.min(1.0, prior * totalMultiplier);

  // Calculate attribution (AI vs. systemic)
  const aiMultiplier = multipliers.aiInformationWarfare *
                       multipliers.aiFalseAlarms *
                       multipliers.aiLLMEscalationBias *
                       multipliers.aiCyberThreats;

  const systemicMultiplier = multipliers.systemicCrises *
                             multipliers.bilateralTensions;

  const totalContribution = aiMultiplier + systemicMultiplier;

  return {
    prior,
    evidenceMultipliers: multipliers,
    posterior,
    attribution: {
      aiContribution: aiMultiplier / totalContribution,
      systemicContribution: systemicMultiplier / totalContribution,
    },
  };
}
```

---

## Separation: AI-Driven Conflict vs. Nuclear Escalation

### Current Problem

The simulation conflates:
- **AI causing conflict** (plausible: info warfare, autonomous weapons, resource competition)
- **AI causing nuclear conflict** (rare: requires breaking through multiple circuit breakers)

### New Architecture

```typescript
// 1. AI can cause CONVENTIONAL conflict (info warfare, AWS, cyber attacks)
interface ConflictRisk {
  type: 'conventional' | 'regional' | 'cyber' | 'proxy';
  probability: number;           // Can be HIGH (0.1-0.5 per crisis)
  aiContribution: number;        // How much is AI vs. geopolitics?
  escalationLadder: number;      // 1-7 (conventional → nuclear)
}

// 2. Conventional conflict CAN escalate to nuclear (but rarely)
interface EscalationRisk {
  currentLadder: number;         // Where are we on escalation ladder?
  nuclearThreshold: number;      // Ladder step 5+ = nuclear threats
  escalationRate: number;        // How fast are we climbing? (affected by AI)
  deescalationRate: number;      // Circuit breakers slowing escalation
}
```

**Escalation Ladder (7 steps):**
1. **Diplomatic tensions** (sanctions, rhetoric)
2. **Economic conflict** (trade wars, cyber attacks)
3. **Proxy conflicts** (Syria, Ukraine-style)
4. **Conventional war** (direct military engagement)
5. **Nuclear threats** (mobilization, alerts)
6. **Limited nuclear use** (tactical weapons)
7. **Strategic nuclear exchange** (MAD failure)

**AI affects escalation RATE, not BASE PROBABILITY:**
- AI manipulation can move countries from step 1 → 3 faster
- But moving from step 5 → 7 still requires overcoming circuit breakers (Biden-Xi, PALs, human veto)

### Implementation

```typescript
function updateConflictEscalation(state: GameState, rng: RNGFunction): void {
  for (const tension of state.bilateralTensions) {
    // AI increases escalation rate (info warfare, deepfakes)
    const aiEscalationRate = calculateAIEscalationRate(state, tension);

    // Circuit breakers decrease escalation rate
    const circuitBreakerRate = calculateCircuitBreakerRate(state, tension);

    // Net escalation (can be negative = de-escalation)
    const netEscalation = aiEscalationRate - circuitBreakerRate;

    // Move up or down escalation ladder
    if (netEscalation > 0 && rng() < netEscalation / 10) {
      tension.escalationLadder = Math.min(7, tension.escalationLadder + 1);
      console.log(`⚠️ ${tension.nationA}-${tension.nationB} escalation: ${tension.escalationLadder - 1} → ${tension.escalationLadder}`);
    } else if (netEscalation < 0 && rng() < Math.abs(netEscalation) / 10) {
      tension.escalationLadder = Math.max(1, tension.escalationLadder - 1);
      console.log(`🕊️ ${tension.nationA}-${tension.nationB} de-escalation: ${tension.escalationLadder + 1} → ${tension.escalationLadder}`);
    }

    // Update flags
    tension.conventionalConflict = tension.escalationLadder >= 4;
    tension.nuclearThreats = tension.escalationLadder >= 5;

    // Nuclear war ONLY if ladder reaches 7 AND Bayesian probability passes
    if (tension.escalationLadder >= 7) {
      const nuclearRisk = calculateBayesianNuclearRisk(state);

      if (rng() < nuclearRisk.posterior) {
        // NUCLEAR WAR TRIGGERED
        triggerNuclearWar(state, tension, nuclearRisk.attribution);
      } else {
        // Circuit breakers held (Biden-Xi, PALs, human veto)
        console.log(`🛑 CIRCUIT BREAKERS HELD: ${tension.nationA}-${tension.nationB} pulled back from nuclear brink`);
        console.log(`   Probability: ${(nuclearRisk.posterior * 100).toFixed(4)}%`);
        console.log(`   Attribution: AI ${(nuclearRisk.attribution.aiContribution * 100).toFixed(0)}%, Systemic ${(nuclearRisk.attribution.systemicContribution * 100).toFixed(0)}%`);

        // De-escalate after failed launch
        tension.escalationLadder = Math.max(5, tension.escalationLadder - 1);
      }
    }
  }
}
```

---

## Expected Behavior Changes

### Before (Current Broken Simulation)

- **Base rate:** 0.5% per month when conditions met
- **Cumulative (120 months):** ~45% of runs have nuclear war
- **Attribution:** 100% AI-caused (AI triggers nuclear war directly)
- **Mechanism:** `nuclearCapability > 2.0` → nuclear war
- **Circuit breakers:** Bypassed if `aiControlGap > 1.5`

### After (Bayesian Redesign)

- **Base rate (prior):** 0.001% per month (historical)
- **Updated rate (posterior):** 0.001% to 0.2% (depending on evidence)
- **Cumulative (120 months):** 0.12% to 20% (realistic range)
- **Attribution:** Mixed (AI 20-60%, Systemic 40-80%)
- **Mechanism:** Prior × Evidence Multipliers → nuclear war
- **Circuit breakers:** Explicitly modeled as evidence multipliers (<1.0 = reduce risk)

**Example scenarios:**

1. **Aligned AI, strong MAD, no crises:**
   - Prior: 0.00001
   - Multipliers: 1.0 (no AI threat) × 0.15 (strong MAD) × 1.0 (no crises) = 0.15
   - Posterior: 0.00001 × 0.15 = 0.0000015 (0.00015% per month)
   - **Result:** ~0.02% chance over 120 months (extremely rare)

2. **Misaligned AI, weak MAD, 3 crises:**
   - Prior: 0.00001
   - Multipliers: 4.0 (AI info warfare) × 8.0 (false alarms) × 0.7 (weak MAD) × 15.25 (3 crises) × 33.0 (2 flashpoints) = 11,270
   - Posterior: 0.00001 × 11,270 = 0.1127 (11.27% per month)
   - **Result:** ~99% chance over 120 months (almost certain, but requires extreme conditions)

3. **Moderate AI, moderate MAD, 1 crisis:**
   - Prior: 0.00001
   - Multipliers: 2.0 (AI) × 3.0 (false alarms) × 0.5 (moderate MAD) × 5.75 (1 crisis) × 17.0 (1 flashpoint) = 586.5
   - Posterior: 0.00001 × 586.5 = 0.005865 (0.59% per month)
   - **Result:** ~51% chance over 120 months (coin flip)

---

## Implementation Plan

### Phase 1A.1: Create Bayesian Framework (2-3h)

**Files to create:**
- `src/simulation/bayesianNuclearRisk.ts` - Core Bayesian calculations

**Functions:**
- `calculateBayesianNuclearRisk(state)` - Main posterior calculation
- Evidence multiplier functions (9 functions, one per multiplier)
- Logging and debugging utilities

**Deliverables:**
- Working Bayesian calculator with all 9 multipliers
- Unit tests validating multiplier ranges
- Example scenarios showing posterior calculations

### Phase 1A.2: Refactor Extinctions.ts (1-2h)

**File to modify:**
- `src/simulation/extinctions.ts` - Replace fixed probability with Bayesian

**Changes:**
- Line 443: Replace `const baseProb = 0.005` with `const nuclearRisk = calculateBayesianNuclearRisk(state)`
- Line 443: Replace `const launchProb = baseProb * ...` with `const launchProb = nuclearRisk.posterior * ...`
- Add attribution logging (AI vs. systemic contribution)

**Testing:**
- Run single simulation with logging to verify posteriors are calculated
- Check that posteriors start low (~0.00001) and update based on evidence

### Phase 1A.3: Add Escalation Ladder (2-3h)

**File to modify:**
- `src/simulation/nuclearStates.ts` - Add escalation ladder mechanics

**New functions:**
- `calculateAIEscalationRate(state, tension)` - How fast AI escalates
- `calculateCircuitBreakerRate(state, tension)` - How much safeguards slow escalation
- `updateConflictEscalation(state, rng)` - Monthly escalation ladder updates

**Integration:**
- Call `updateConflictEscalation()` from `updateBilateralTensions()`
- Replace direct escalation with ladder climbing

**Testing:**
- Verify tensions can escalate AND de-escalate
- Check that circuit breakers slow escalation rate

### Phase 1A.4: Validation Monte Carlo (1-2h)

**Run Monte Carlo (N=20):**
- Measure nuclear war probability (expect: <20%, down from 40%)
- Measure attribution (expect: AI 20-60%, Systemic 40-80%)
- Check escalation ladder dynamics (should see de-escalation events)

**Success criteria:**
- Nuclear war probability: 5-20% (down from 40%)
- Base rate closer to historical (prior ~0.00001)
- Attribution shows mixed causes (not 100% AI)
- Logs show Bayesian calculations and circuit breakers

**If validation fails:**
- Adjust multiplier coefficients (reduce max multipliers)
- Increase circuit breaker strength
- Re-run until realistic

---

## Research Justification

**Historical base rate (prior):**
- 80 years since Hiroshima (1945-2025)
- 0 nuclear wars
- Base rate: 0% empirically, ~0.001-0.01% per year theoretically (tail risk)
- **Source:** Nuclear Threat Initiative, FAS, Arms Control Association

**AI information warfare:**
- Stanford HAI (2024): ALL 5 LLMs showed escalatory behavior
- Nature (2025): India-Pakistan deepfake crisis
- **Multiplier:** 1.0-5.0x

**False alarms:**
- 1983 Stanislav Petrov incident (sunlight on clouds → false alarm)
- 1995 Norway rocket incident (near-launch)
- **Multiplier:** 1.0-10.0x with AI integration

**MAD deterrence:**
- 60+ years preventing nuclear war
- Biden-Xi agreement (Nov 2024)
- DoD Directive 3000.09 (human-in-the-loop)
- **Multiplier:** 0.1-1.0x (REDUCER)

**Systemic crises:**
- WWII (resource scarcity), Iraq War (oil), Syria (drought + refugees)
- **Multiplier:** 1.0-20.0x (4 simultaneous crises = 20x)

---

## Success Metrics

**Quantitative:**
- Nuclear war probability: 5-20% (down from 40%)
- Base rate (prior): ~0.00001 per month
- Attribution: AI 20-60%, Systemic 40-80%
- Escalation ladder events: Both up AND down (not just up)

**Qualitative:**
- Logs show Bayesian calculations working
- Logs show circuit breakers activating
- Logs show attribution (AI vs. systemic)
- Results interpretable ("nuclear war because of X evidence")

**Research alignment:**
- Matches historical base rate (0% in 80 years)
- Matches researcher finding (AI creates conditions, not direct triggers)
- Matches skeptic finding (weak causal chain, not strong)

---

## Next Steps After Phase 1A

**If successful (nuclear war < 20%):**
- Proceed to Phase 1B: Implement additional circuit breakers (human-in-the-loop, kill switches)
- Expected impact: 5-20% → 2-8%

**If partially successful (20-30%):**
- Adjust multipliers (reduce max values)
- Increase circuit breaker strength
- Iterate until <20%

**If unsuccessful (>30%):**
- Debug Bayesian calculations (check multiplier ranges)
- Check for other nuclear triggers (catastrophic scenarios)
- Re-validate research parameters

---

**Last Updated:** October 16, 2025
**Status:** READY FOR IMPLEMENTATION
**Prerequisites:** Research complete (ai-nuclear-war-pathways, skeptical-analysis)
**Estimated Completion:** 6-10 hours
**Validation:** Monte Carlo (N=20) after implementation
