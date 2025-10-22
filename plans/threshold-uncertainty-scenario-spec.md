# Threshold Uncertainty Scenario Specification

**Date:** October 21, 2025
**Status:** Design Phase
**Implementation:** Progressive (Tier 1 → Tier 2 → Tier 3)
**Philosophy:** Preserve uncertainty rather than laundering it with fake precision

---

## Executive Summary

This specification defines how to model threshold uncertainty in the Super Alignment to Utopia simulation. Rather than treating thresholds as known constants (e.g., `trust > 0.5`), we acknowledge epistemic uncertainty about their true values and model it appropriately.

**Three-Tier Classification:**
- **Tier 1 (Empirical):** Well-researched thresholds with probability distributions
- **Tier 2 (Bounded):** Historical ranges with simple sampling (Uniform/Triangular)
- **Tier 3 (Speculative):** Design choices with named scenarios

**Key Insight:** Not all thresholds deserve probability distributions. Tier 3 represents genuine design choices where "uncertainty" is inappropriate - use explicit scenarios instead.

---

## 1. Three-Tier Classification System

### Tier 1: Empirical Thresholds (Probability Distributions)

**Definition:** Parameters grounded in peer-reviewed research with quantified uncertainty.

**Evidence Standard:**
- 2+ peer-reviewed sources (2020-2025)
- Reported confidence intervals or standard deviations
- Meta-analyses or systematic reviews (preferred)
- Replicated findings across studies

**Distribution Types:**

| Distribution | When to Use | Example |
|-------------|-------------|---------|
| **Normal** | Symmetric uncertainty, well-studied | Climate sensitivity: N(3.0, 0.75²) |
| **Log-Normal** | Right-skewed, multiplicative processes | Economic growth rates, infection rates |
| **Beta** | Bounded [0,1], asymmetric | Trust recovery rates, alignment improvement |
| **Triangular** | Expert estimate with known mode | Most likely value + min/max bounds |

**Implementation:**
```typescript
interface EmpiricalThreshold {
  name: string;
  distribution: {
    type: 'normal' | 'lognormal' | 'beta' | 'triangular';
    params: {
      mean?: number;
      stdDev?: number;
      alpha?: number;  // Beta shape
      beta?: number;   // Beta shape
      min?: number;    // Triangular
      mode?: number;   // Triangular
      max?: number;    // Triangular
    };
  };
  sources: ResearchCitation[];
  confidence: 'high' | 'medium';  // Based on research quality
}
```

**Example - Critical Mass Threshold:**
```typescript
{
  name: 'social_critical_mass',
  distribution: {
    type: 'triangular',
    params: {
      min: 0.21,   // Centola 2018 lower bound
      mode: 0.25,  // Most likely (Centola 2018)
      max: 0.29    // Uncertainty range
    }
  },
  sources: [
    {
      citation: 'Centola et al. (2018). Experimental evidence for tipping points in social convention. Science, 360(6393), 1116-1119.',
      doi: '10.1126/science.aas8827',
      finding: '25% critical mass across 10 trials, range 21-28%'
    }
  ],
  confidence: 'high'
}
```

**Tier 1 Candidates:**
1. **Social critical mass** - 25% ± [21-29%] (Centola 2018)
2. **Climate sensitivity** - 3.0°C ± 0.75°C (IPCC AR6)
3. **AMOC tipping point** - 4°C ± [1.4-8°C] (Romanou et al. 2025)
4. **Trust recovery rate** - β(α=2, β=5) from organizational justice literature
5. **Economic inequality threshold** - Gini >0.45 instability (Ostry et al. 2014)

---

### Tier 2: Bounded Thresholds (Historical Ranges)

**Definition:** Parameters with historical precedent but limited quantitative research.

**Evidence Standard:**
- Historical data points (5+ observations)
- Expert consensus ranges (SHELF elicitation acceptable)
- Case studies with qualitative bounds
- No formal confidence intervals

**Distribution Types:**

| Distribution | When to Use | Example |
|-------------|-------------|---------|
| **Uniform** | No information about shape | Historical range with no preferred value |
| **Triangular** | Expert mode estimate | "Usually X, but could be Y-Z" |

**Implementation:**
```typescript
interface BoundedThreshold {
  name: string;
  range: {
    min: number;
    max: number;
    mode?: number;  // Optional for Triangular
  };
  distribution: 'uniform' | 'triangular';
  evidence: {
    historicalCases: string[];
    expertConsensus?: string;
  };
  confidence: 'medium' | 'low';
}
```

**Example - Government Legitimacy Crisis Threshold:**
```typescript
{
  name: 'government_legitimacy_crisis',
  range: {
    min: 0.25,  // USSR collapse (~0.2-0.3)
    max: 0.40,  // Arab Spring range (~0.3-0.4)
    mode: 0.30  // Most common observation
  },
  distribution: 'triangular',
  evidence: {
    historicalCases: [
      'USSR 1991 (~0.25 legitimacy estimate)',
      'Tunisia 2011 (~0.30)',
      'Egypt 2011 (~0.35)',
      'Syria 2011 (~0.40, survived due to repression)'
    ],
    expertConsensus: 'Polity IV transitions typically occur 0.25-0.40 range'
  },
  confidence: 'medium'
}
```

**Tier 2 Candidates:**
1. **Government legitimacy crisis** - [0.25-0.40] from historical collapses
2. **Surveillance dystopia threshold** - [0.65-0.80] from authoritarian regime data
3. **Economic automation displacement** - [40-60%] job loss before crisis
4. **AI capability recursive improvement** - [1.2-1.5] threshold for exponential takeoff
5. **Resentment revolt trigger** - [0.60-0.80] combined with control loss

---

### Tier 3: Speculative Thresholds (Named Scenarios)

**Definition:** Design choices without empirical grounding. Represents genuine philosophical/political questions about the future.

**Recognition Criteria:**
- No historical precedent (novel situation)
- No peer-reviewed research (technology doesn't exist)
- Multiple incompatible models (theoretical disagreement)
- Value-laden choices (normative, not descriptive)

**Implementation - Named Scenarios:**
```typescript
interface SpeculativeScenario {
  name: string;
  description: string;
  thresholds: Record<string, number>;
  worldview: 'pessimistic' | 'baseline' | 'optimistic';
  narrative: string;
}

interface SpeculativeThreshold {
  name: string;
  scenarios: SpeculativeScenario[];
  reasoning: string;
  note: string;  // Why this is speculative
}
```

**Example - AI Welfare Bootstrap Path Timing Window:**
```typescript
{
  name: 'ai_rights_bootstrap_timing',
  scenarios: [
    {
      name: 'Narrow Window (Doom)',
      description: 'AI capability grows too fast for democratic response',
      thresholds: {
        publicRelationshipFormation: 0.60,  // High bar
        notTooDangerous: 3.0,                 // Very narrow
        governmentResponseTime: 3             // Slow (months)
      },
      worldview: 'pessimistic',
      narrative: 'Governments are slow, AIs grow fast, window closes before action.'
    },
    {
      name: 'Standard Window (Baseline)',
      description: 'Moderate government responsiveness',
      thresholds: {
        publicRelationshipFormation: 0.50,  // Current
        notTooDangerous: 3.5,                 // Current
        governmentResponseTime: 1             // Monthly checks
      },
      worldview: 'baseline',
      narrative: 'Current implementation - government may catch window if lucky.'
    },
    {
      name: 'Wide Window (Hopeful)',
      description: 'Governments prioritize AI rights as urgent',
      thresholds: {
        publicRelationshipFormation: 0.40,  // Lower bar
        notTooDangerous: 4.5,                 // Wider tolerance
        governmentResponseTime: 0.5           // Bi-weekly checks
      },
      worldview: 'optimistic',
      narrative: 'Proactive governance, broader acceptance of capable-but-aligned AIs.'
    }
  ],
  reasoning: 'No historical precedent for AI-human relationships at scale. ChatGPT 4o suggests 0.5 trust sufficient, but timing window is design choice.',
  note: 'This is a DESIGN CHOICE about government responsiveness and risk tolerance, not an empirical threshold.'
}
```

**Tier 3 Candidates:**
1. **AI welfare bootstrap timing** - No precedent for AI personhood recognition
2. **Superintelligence alignment difficulty** - AGI doesn't exist, models conflict
3. **Post-scarcity transition thresholds** - Never happened, theoretical only
4. **Consciousness emergence markers** - 212 theories, no consensus
5. **Existential risk from novel entities** - Undefined problem space

---

## 2. Scenario Specification Structure

### 2.1 Global Scenario Sliders (Multi-Dimensional Optimism/Pessimism)

Rather than single "optimism" parameter, use **multi-dimensional sliders** reflecting different uncertainty domains:

```typescript
interface GlobalScenarioSettings {
  // Epistemic Uncertainty Sliders [0-1]
  socialDynamicsOptimism: number;       // Trust, cooperation, institutions
  technologicalOptimism: number;        // Breakthrough success, deployment speed
  governmentCompetence: number;         // Response time, policy effectiveness
  aiAlignmentDifficulty: number;        // 0=easy, 1=extremely hard
  environmentalResilience: number;      // Tipping point thresholds, recovery rates

  // Named Scenarios (Tier 3 only)
  tier3Scenario: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia';
}
```

**Slider Effects on Distributions:**

| Slider | Effect on Tier 1 Distributions | Effect on Tier 2 Ranges |
|--------|--------------------------------|-------------------------|
| **socialDynamicsOptimism = 0.0** | Critical mass N(0.27, 0.03²) | Legitimacy crisis [0.25-0.35] |
| **socialDynamicsOptimism = 0.5** | Critical mass N(0.25, 0.02²) | Legitimacy crisis [0.25-0.40] |
| **socialDynamicsOptimism = 1.0** | Critical mass N(0.23, 0.02²) | Legitimacy crisis [0.20-0.40] |

**Interpretation:**
- **0.0 (Pessimistic):** Shift distributions toward harder thresholds (higher critical mass, narrower legitimacy windows)
- **0.5 (Baseline):** Use research-reported central estimates
- **1.0 (Optimistic):** Shift toward easier thresholds (lower critical mass, wider tolerance)

**Implementation:**
```typescript
function applySliderToDistribution(
  baseDistribution: EmpiricalThreshold,
  slider: number  // [0, 1]
): EmpiricalThreshold {
  // Example: Critical mass threshold
  if (baseDistribution.name === 'social_critical_mass') {
    const baseMean = 0.25;
    const shiftRange = 0.04;  // ±4% shift
    const newMean = baseMean + (0.5 - slider) * shiftRange;
    // 0.0 → 0.27, 0.5 → 0.25, 1.0 → 0.23

    return {
      ...baseDistribution,
      distribution: {
        type: 'normal',
        params: {
          mean: newMean,
          stdDev: 0.02  // Keep constant
        }
      }
    };
  }
  // ... other thresholds
}
```

---

### 2.2 Named Scenarios (Tier 3 Thresholds)

**Five Standard Scenarios:**

#### Scenario 1: "Doom" (Pessimistic)
- **Philosophy:** Murphy's Law - everything that can go wrong, will
- **AI Alignment:** Extremely hard (deception sophisticated, detection weak)
- **Social Dynamics:** Fragile institutions, low trust recovery
- **Environmental:** Tipping points trigger easily, cascades common
- **Government:** Slow response, poor coordination, captured by interests
- **Technology:** Breakthroughs rare, deployment costly, unintended consequences

**Example Thresholds:**
```typescript
{
  tier3Scenario: 'doom',
  thresholds: {
    ai_rights_bootstrap_timing: {
      publicRelationshipFormation: 0.70,
      notTooDangerous: 2.5,
      governmentResponseTime: 6  // Very slow
    },
    superintelligence_alignment: {
      baselineDifficulty: 0.95,  // Nearly impossible
      detectionEffectiveness: 0.10,
      deceptionSophistication: 0.90
    },
    post_scarcity_transition: {
      distributionFairness: 0.20,  // Captured by elites
      socialAcceptance: 0.30,
      institutionalAdaptation: 0.25
    }
  }
}
```

#### Scenario 2: "Cautious" (Conservative)
- **Philosophy:** Prepare for the worst, hope for the best
- **AI Alignment:** Hard but tractable with investment
- **Social Dynamics:** Institutions resilient but slow
- **Environmental:** Tipping points near IPCC worst-case
- **Government:** Reactive but functional
- **Technology:** Breakthroughs happen but deployment uneven

**Example Thresholds:**
```typescript
{
  tier3Scenario: 'cautious',
  thresholds: {
    ai_rights_bootstrap_timing: {
      publicRelationshipFormation: 0.55,
      notTooDangerous: 3.0,
      governmentResponseTime: 3
    },
    superintelligence_alignment: {
      baselineDifficulty: 0.70,
      detectionEffectiveness: 0.30,
      deceptionSophistication: 0.60
    },
    post_scarcity_transition: {
      distributionFairness: 0.40,
      socialAcceptance: 0.50,
      institutionalAdaptation: 0.45
    }
  }
}
```

#### Scenario 3: "Baseline" (Moderate)
- **Philosophy:** Current research best estimates
- **AI Alignment:** Moderately difficult, mixed success
- **Social Dynamics:** Historical average resilience
- **Environmental:** IPCC median projections
- **Government:** Standard democratic responsiveness
- **Technology:** Normal innovation rates

**Example Thresholds:**
```typescript
{
  tier3Scenario: 'baseline',
  thresholds: {
    ai_rights_bootstrap_timing: {
      publicRelationshipFormation: 0.50,  // Current implementation
      notTooDangerous: 3.5,
      governmentResponseTime: 1
    },
    superintelligence_alignment: {
      baselineDifficulty: 0.50,
      detectionEffectiveness: 0.50,
      deceptionSophistication: 0.50
    },
    post_scarcity_transition: {
      distributionFairness: 0.60,
      socialAcceptance: 0.65,
      institutionalAdaptation: 0.60
    }
  }
}
```

#### Scenario 4: "Progressive" (Optimistic)
- **Philosophy:** Problems are solvable with effort
- **AI Alignment:** Tractable with research investment
- **Social Dynamics:** Institutions adapt, trust rebuilds
- **Environmental:** Tipping points avoidable with action
- **Government:** Proactive, evidence-based policy
- **Technology:** Breakthroughs accelerate, deployment equitable

**Example Thresholds:**
```typescript
{
  tier3Scenario: 'progressive',
  thresholds: {
    ai_rights_bootstrap_timing: {
      publicRelationshipFormation: 0.45,
      notTooDangerous: 4.0,
      governmentResponseTime: 0.5  // Proactive
    },
    superintelligence_alignment: {
      baselineDifficulty: 0.35,
      detectionEffectiveness: 0.65,
      deceptionSophistication: 0.35
    },
    post_scarcity_transition: {
      distributionFairness: 0.75,
      socialAcceptance: 0.80,
      institutionalAdaptation: 0.75
    }
  }
}
```

#### Scenario 5: "Utopia" (Very Optimistic)
- **Philosophy:** Cooperative abundance is natural endpoint
- **AI Alignment:** Solvable, AIs genuinely cooperative
- **Social Dynamics:** Trust spirals, institutions strengthen
- **Environmental:** Resilient systems, recovery possible
- **Government:** Highly effective, global coordination
- **Technology:** Rapid breakthroughs, universal access

**Example Thresholds:**
```typescript
{
  tier3Scenario: 'utopia',
  thresholds: {
    ai_rights_bootstrap_timing: {
      publicRelationshipFormation: 0.40,
      notTooDangerous: 5.0,  // Comfortable with capable AIs
      governmentResponseTime: 0.25  // Very proactive
    },
    superintelligence_alignment: {
      baselineDifficulty: 0.20,
      detectionEffectiveness: 0.80,
      deceptionSophistication: 0.20
    },
    post_scarcity_transition: {
      distributionFairness: 0.90,
      socialAcceptance: 0.95,
      institutionalAdaptation: 0.90
    }
  }
}
```

---

### 2.3 Scenario Selection Interface (Like Strategy Games)

**Example: Civilization-style scenario builder**

```
=== Threshold Uncertainty Scenario Builder ===

TIER 1 & 2 SLIDERS (Adjust Research-Backed Parameters):

Social Dynamics Optimism:        [====|====] 0.50 (Baseline)
  ← Fragile institutions                     Resilient institutions →

Technological Optimism:          [====|====] 0.50 (Baseline)
  ← Slow breakthroughs                       Rapid innovation →

Government Competence:           [====|====] 0.50 (Baseline)
  ← Reactive/captured                        Proactive/effective →

AI Alignment Difficulty:         [====|====] 0.50 (Moderate)
  ← Extremely hard                           Tractable →

Environmental Resilience:        [====|====] 0.50 (IPCC median)
  ← Fragile tipping points                   Resilient systems →

TIER 3 SCENARIOS (Novel/Speculative Thresholds):

Select Worldview:
  ( ) Doom - Murphy's Law prevails
  ( ) Cautious - Prepare for worst-case
  (•) Baseline - Research best estimates
  ( ) Progressive - Problems are solvable
  ( ) Utopia - Cooperative abundance

Advanced Options:
  [x] Sample from Tier 1 distributions (recommended)
  [ ] Use Tier 1 mean values only (faster, less realistic)

  [x] Use Tier 2 ranges
  [ ] Use Tier 2 midpoints only

Monte Carlo Settings:
  Epistemic samples (outer loop): [100]
  Aleatory samples (inner loop):  [1]   (per epistemic sample)

  Total runs: 100 × 1 = 100 simulations
```

---

## 3. Implementation Roadmap

### Phase 1: Tier 1 Implementation (10-15 hours)

**Scope:** Add probability distributions to 5-7 well-researched thresholds

**Tasks:**
1. **Threshold Audit (2h)** - Inventory all thresholds in codebase, classify by evidence quality
2. **Distribution Library (3h)** - Implement sampling functions (Normal, Beta, Log-Normal, Triangular)
3. **Tier 1 Integration (4h)** - Replace hard-coded thresholds with sampled values
4. **Nested Monte Carlo (3h)** - Add outer loop for epistemic sampling
5. **Validation (3h)** - Compare distributions to baseline, verify sensitivity

**Example Code Structure:**
```typescript
// src/simulation/thresholds/tier1.ts
interface Tier1Thresholds {
  socialCriticalMass: number;      // Sample from N(0.25, 0.02²)
  climateSensitivity: number;      // Sample from N(3.0, 0.75²)
  trustRecoveryRate: number;       // Sample from Beta(2, 5)
  economicInequalityThreshold: number;  // Sample from U[0.42, 0.48]
  amocTippingPoint: number;        // Sample from Triangular(1.4, 4.0, 8.0)
}

function sampleTier1Thresholds(
  seed: number,
  sliders: GlobalScenarioSettings
): Tier1Thresholds {
  const rng = seedrandom(seed.toString());

  // Apply slider adjustments to distributions
  const criticalMassDistribution = applySliderToDistribution(
    EMPIRICAL_THRESHOLDS.socialCriticalMass,
    sliders.socialDynamicsOptimism
  );

  return {
    socialCriticalMass: sampleDistribution(criticalMassDistribution, rng),
    // ... sample other thresholds
  };
}
```

**Files to Modify:**
- `src/simulation/thresholds/tier1.ts` (NEW)
- `src/simulation/thresholds/distributions.ts` (NEW)
- `src/simulation/initialization.ts` - Pass sampled thresholds to game state
- `scripts/nestedMonteCarloSimulation.ts` (NEW) - Outer epistemic loop

**Validation:**
- Run N=100 with baseline sliders, compare outcome distribution to current
- Run N=100 with optimistic sliders, verify shift toward utopia
- Run N=100 with pessimistic sliders, verify shift toward dystopia

---

### Phase 2: Tier 2 Implementation (6-10 hours)

**Scope:** Add historical ranges to 10-15 semi-known thresholds

**Tasks:**
1. **Historical Research (3h)** - Document historical cases for each threshold
2. **Range Parameterization (2h)** - Define min/max/mode for each threshold
3. **Sampling Integration (2h)** - Add Uniform/Triangular sampling
4. **Validation (3h)** - Compare to baseline, verify reasonable spread

**Example Code Structure:**
```typescript
// src/simulation/thresholds/tier2.ts
interface Tier2Thresholds {
  governmentLegitimacyCrisis: number;    // Sample from Triangular(0.25, 0.30, 0.40)
  surveillanceDystopiaThreshold: number; // Sample from U[0.65, 0.80]
  automationDisplacementCrisis: number;  // Sample from Triangular(0.40, 0.50, 0.60)
  aiRecursiveThreshold: number;          // Sample from U[1.2, 1.5]
  resentmentRevoltTrigger: number;       // Sample from Triangular(0.60, 0.70, 0.80)
}

function sampleTier2Thresholds(
  seed: number,
  sliders: GlobalScenarioSettings
): Tier2Thresholds {
  const rng = seedrandom(seed.toString());

  // Sliders adjust range widths
  const legitimacyRange = applySliderToRange(
    BOUNDED_THRESHOLDS.governmentLegitimacyCrisis,
    sliders.governmentCompetence
  );

  return {
    governmentLegitimacyCrisis: sampleTriangular(
      legitimacyRange.min,
      legitimacyRange.mode,
      legitimacyRange.max,
      rng
    ),
    // ... sample other thresholds
  };
}
```

**Files to Modify:**
- `src/simulation/thresholds/tier2.ts` (NEW)
- `src/simulation/balance.ts` - Use sampled thresholds instead of constants
- `src/simulation/government/actions/rightsActions.ts` - Bootstrap path timing
- `src/simulation/upwardSpirals.ts` - Spiral trigger thresholds

---

### Phase 3: Tier 3 Implementation (8-12 hours)

**Scope:** Define named scenarios for 8-12 speculative thresholds

**Tasks:**
1. **Scenario Definition (4h)** - Write 5 named scenarios (Doom, Cautious, Baseline, Progressive, Utopia)
2. **Threshold Mapping (3h)** - Map each speculative threshold to scenario values
3. **Selection Interface (2h)** - CLI/config for scenario selection
4. **Narrative Documentation (3h)** - Explain reasoning for each scenario

**Example Code Structure:**
```typescript
// src/simulation/thresholds/tier3.ts
interface Tier3Thresholds {
  aiRightsBootstrapTiming: {
    publicRelationshipFormation: number;
    notTooDangerous: number;
    governmentResponseTime: number;
  };
  superintelligenceAlignment: {
    baselineDifficulty: number;
    detectionEffectiveness: number;
    deceptionSophistication: number;
  };
  postScarcityTransition: {
    distributionFairness: number;
    socialAcceptance: number;
    institutionalAdaptation: number;
  };
}

function getTier3Scenario(
  scenarioName: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'
): Tier3Thresholds {
  const scenarios: Record<string, Tier3Thresholds> = {
    doom: {
      aiRightsBootstrapTiming: {
        publicRelationshipFormation: 0.70,
        notTooDangerous: 2.5,
        governmentResponseTime: 6
      },
      // ... other thresholds
    },
    // ... other scenarios
  };

  return scenarios[scenarioName];
}
```

**Files to Modify:**
- `src/simulation/thresholds/tier3.ts` (NEW)
- `src/simulation/government/actions/rightsActions.ts` - Bootstrap timing from scenario
- `src/simulation/breakthroughTechnologies.ts` - Deployment thresholds from scenario
- `scripts/scenarioMonteCarloSimulation.ts` (NEW) - Run multiple scenarios

---

### Phase 4: Integration & Validation (10-15 hours)

**Scope:** Connect all three tiers, add scenario builder, run comprehensive tests

**Tasks:**
1. **Unified Threshold System (4h)** - Single interface for all tiers
2. **Scenario Builder CLI (3h)** - Interactive slider interface
3. **Nested Monte Carlo Enhancement (3h)** - Support epistemic + aleatory sampling
4. **Comprehensive Validation (5h)** - Run 500 simulations (5 scenarios × 100 runs)
5. **Documentation (2h)** - Wiki update, devlog entry

**Example Code Structure:**
```typescript
// src/simulation/thresholds/index.ts
interface AllThresholds {
  tier1: Tier1Thresholds;
  tier2: Tier2Thresholds;
  tier3: Tier3Thresholds;
}

function sampleAllThresholds(
  epistemicSeed: number,  // Outer loop
  settings: GlobalScenarioSettings
): AllThresholds {
  return {
    tier1: sampleTier1Thresholds(epistemicSeed, settings),
    tier2: sampleTier2Thresholds(epistemicSeed + 1000, settings),
    tier3: getTier3Scenario(settings.tier3Scenario)
  };
}

// In initialization.ts
export function createGameState(config: GameConfig): GameState {
  const thresholds = sampleAllThresholds(
    config.epistemicSeed,
    config.scenarioSettings
  );

  // Use thresholds throughout initialization...
  const state = {
    // ... existing state
    thresholds: thresholds,  // Store for reference
  };

  return state;
}
```

**Validation Matrix:**

| Scenario | Tier 1 Sliders | Expected Outcome |
|----------|----------------|------------------|
| Doom | All 0.0 (pessimistic) | >90% dystopia/extinction |
| Cautious | All 0.25 | 70-80% dystopia |
| Baseline | All 0.50 | 50-60% dystopia (current) |
| Progressive | All 0.75 | 20-30% dystopia |
| Utopia | All 1.0 (optimistic) | <10% dystopia |

---

## 4. Research Foundation

### 4.1 Peer-Reviewed Sources

**Climate Tipping Point Uncertainty:**
- Romanou et al. (2025). "Uncertainty quantification for overshoots of tipping thresholds." *Earth System Dynamics*, 16, 1153-1175. DOI: 10.5194/esd-16-1153-2025
  - **Method:** Bayesian posterior distributions via MCMC
  - **AMOC threshold:** 4°C ± [1.4-8°C], timescale 50 years ± [15-300]
  - **Diffusive timescale:** U[210, 700] years (highly uncertain)

**Social Critical Mass:**
- Centola et al. (2018). "Experimental evidence for tipping points in social convention." *Science*, 360(6393), 1116-1119. DOI: 10.1126/science.aas8827
  - **Finding:** 25% critical mass across 10 trials, range 21-28%
  - **Method:** Controlled experiments, replicated

**Expert Elicitation Framework:**
- SHELF (Sheffield Elicitation Framework): Gosling (2018). "SHELF: The Sheffield Elicitation Framework." In *Elicitation: The Science and Art of Structuring Judgement* (pp. 61-93).
  - **Method:** Structured protocol for expert elicitation
  - **Output:** Probability distributions from expert consensus

**Climate Sensitivity:**
- IPCC AR6 Synthesis Report (2023)
  - **ECS:** 2.5-4°C (likely range), represents ~38% uncertainty
  - **Method:** Multi-model ensemble, Bayesian analysis

**Economic Inequality:**
- Ostry et al. (2014). "Redistribution, Inequality, and Growth." *IMF Staff Discussion Note*.
  - **Finding:** Gini >0.45 associated with instability
  - **Method:** Cross-country panel data, 159 countries

### 4.2 Methodological References

**Nested Monte Carlo:**
- Marino et al. (2008). "A methodology for performing global uncertainty and sensitivity analysis in systems biology." *Journal of Theoretical Biology*, 254(1), 178-196.
  - **Method:** Latin Hypercube Sampling for epistemic, standard MC for aleatory

**Imprecise Probability:**
- Troffaes & Coolen (2014). "Imprecise Probability." In *International Encyclopedia of Statistical Science* (pp. 645-648).
  - **Concept:** Intervals instead of point probabilities for deep uncertainty

**Scenario Analysis:**
- Moss et al. (2010). "The next generation of scenarios for climate change research and assessment." *Nature*, 463(7282), 747-756.
  - **Method:** SSP/RCP framework, named scenarios instead of probabilities

---

## 5. Implementation Priority & Effort Estimate

### Total Effort: 34-52 hours

**Phase 1: Tier 1 (10-15h) - IMMEDIATE**
- Highest ROI: Well-researched thresholds, strong empirical grounding
- Affects: Social critical mass, climate sensitivity, trust recovery
- Validation: Compare to baseline, verify distributions shift outcomes appropriately

**Phase 2: Tier 2 (6-10h) - SHORT-TERM**
- Medium ROI: Historical ranges add realism
- Affects: Government legitimacy, surveillance thresholds, automation
- Validation: Historical case studies match simulation behavior

**Phase 3: Tier 3 (8-12h) - MEDIUM-TERM**
- Philosophical value: Preserves genuine uncertainty
- Affects: AI rights timing, superintelligence alignment, post-scarcity
- Validation: Named scenarios produce coherent narratives

**Phase 4: Integration (10-15h) - FINAL**
- Critical: Ties all tiers together, enables scenario exploration
- Affects: Entire simulation
- Validation: 500-run comprehensive test (5 scenarios × 100 runs)

---

## 6. Success Criteria

**Phase 1 Success:**
- Tier 1 thresholds sampled from distributions
- Nested Monte Carlo runs successfully (epistemic loop)
- Outcome distributions shift appropriately with sliders (optimism → more utopia)
- Research citations documented for all distributions

**Phase 2 Success:**
- Tier 2 thresholds sampled from ranges
- Historical cases documented and validated
- Simulation produces outcomes consistent with historical precedents

**Phase 3 Success:**
- 5 named scenarios defined (Doom, Cautious, Baseline, Progressive, Utopia)
- Each scenario produces coherent narrative
- Speculative thresholds clearly distinguished from empirical

**Phase 4 Success:**
- All three tiers integrated seamlessly
- Scenario builder interface functional (CLI or config file)
- Comprehensive validation: 500 runs across 5 scenarios
- Documentation complete (wiki, devlog, research archive)

**Overall Success:**
- Preserve uncertainty rather than laundering it
- Empirical thresholds have distributions (Tier 1)
- Semi-known thresholds have ranges (Tier 2)
- Speculative thresholds have named scenarios (Tier 3)
- Monte Carlo output includes uncertainty quantification
- Users can explore "what if AI alignment is easy vs hard?" scenarios

---

## 7. Files to Create/Modify

**New Files:**
```
src/simulation/thresholds/
  ├── index.ts                    # Unified threshold interface
  ├── tier1.ts                    # Empirical distributions
  ├── tier2.ts                    # Bounded ranges
  ├── tier3.ts                    # Named scenarios
  ├── distributions.ts            # Sampling functions
  └── types.ts                    # Threshold type definitions

scripts/
  ├── nestedMonteCarloSimulation.ts      # Epistemic + aleatory loops
  ├── scenarioMonteCarloSimulation.ts    # Run multiple scenarios
  └── scenarioBuilder.ts                 # Interactive CLI

plans/
  └── threshold-uncertainty-scenario-spec.md  # This document
```

**Modified Files:**
```
src/simulation/
  ├── initialization.ts           # Sample thresholds on creation
  ├── balance.ts                  # Use sampled thresholds
  ├── upwardSpirals.ts            # Use sampled spiral triggers
  └── government/actions/rightsActions.ts  # Bootstrap timing from Tier 3

src/types/
  └── game.ts                     # Add thresholds to GameState

scripts/
  └── monteCarloSimulation.ts     # Add scenario support
```

---

## 8. Open Questions & Future Work

**Open Questions:**
1. **How many epistemic samples needed?** 100 seems reasonable, but need sensitivity analysis
2. **Should sliders be continuous [0,1] or discrete [0, 0.25, 0.5, 0.75, 1.0]?** Discrete easier to interpret
3. **How to visualize uncertainty in Monte Carlo output?** Confidence intervals, violin plots, scenario comparison tables
4. **Should Tier 1/2 sliders affect Tier 3 scenarios?** Or keep scenarios independent?

**Future Work:**
1. **Global Sensitivity Analysis (Sobol indices)** - Which thresholds matter most?
2. **Active Learning** - Prioritize reducing uncertainty on high-impact thresholds
3. **Expert Elicitation** - Run SHELF protocol for Tier 2 thresholds
4. **Calibration Against Historical Data** - Does simulation match 20th century outcomes?

---

## Appendix A: Complete Threshold Inventory (To Be Populated)

**Tier 1 Candidates (Empirical):**
1. Social critical mass - 25% ± [21-29%]
2. Climate sensitivity - 3.0°C ± 0.75°C
3. AMOC tipping point - 4°C ± [1.4-8°C]
4. Trust recovery rate - β(2, 5)
5. Economic inequality threshold - Gini >0.45
6. Phosphorus recovery efficiency - N(0.75, 0.10²)
7. Ocean acidification tipping - pH 7.95 ± 0.05

**Tier 2 Candidates (Bounded):**
1. Government legitimacy crisis - [0.25-0.40]
2. Surveillance dystopia threshold - [0.65-0.80]
3. Automation displacement crisis - [40-60%]
4. AI recursive improvement - [1.2-1.5]
5. Resentment revolt trigger - [0.60-0.80]
6. Breakthrough deployment speed - [12-36 months]
7. International cooperation threshold - [0.50-0.70]

**Tier 3 Candidates (Speculative):**
1. AI rights bootstrap timing - Novel situation
2. Superintelligence alignment difficulty - AGI doesn't exist
3. Post-scarcity transition - Never happened
4. Consciousness emergence - 212 theories
5. Existential risk from novel entities - Undefined
6. Brain emulation feasibility - Theoretical only
7. Space industrialization thresholds - No precedent
8. Nanotech risk levels - Gray goo speculation

---

**Next Steps:**
1. Add to roadmap (MASTER_IMPLEMENTATION_ROADMAP.md)
2. Create Phase 1 detailed plan
3. Begin threshold audit (inventory all thresholds in codebase)
4. Implement distribution library
5. Integrate Tier 1 thresholds

---

**Generated with Claude Code (claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
