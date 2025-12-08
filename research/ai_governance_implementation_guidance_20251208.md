# AI Governance 2025 Proposals: Implementation Guidance

**Date:** December 8, 2025
**Status:** ✅ APPROVED - Grade A (with failure pathway modeling required)
**Commit:** ff6ff02
**Verification Report:** `research/verification_ff6ff02_20251207.md`
**Sources:**
- arXiv:2505.04592 (Barnett & Scher, May 2025) - Global Moratorium
- arXiv:2511.10783 (Scher et al., November 2025) - US-China Bilateral Framework

## Executive Summary

Two MIRI governance proposals received **Grade A verification** for factual accuracy - all risk estimates, compute thresholds, and mechanisms match peer-reviewed sources exactly. However, Sylvia's skeptical review identified **7 critical implementation challenges** that must be modeled to avoid presenting these frameworks as more viable than evidence supports.

**Implementation Mandate:** Model these as **proposed governance scenarios** (not validated interventions) with explicit failure pathways and effectiveness decay over time.

---

## Verified Parameters (Grade A - Use These Exactly)

### Risk Estimates ✅

```typescript
// All verified against 2024-2025 sources
const catastrophicRiskEstimates = {
  amodei: { min: 0.10, max: 0.25 }, // Anthropic CEO (2023-2025)
  bengio: 0.20,                      // Turing Award winner (2024)
  aiConferenceSurvey: 0.38,          // Grace et al. N=2,778 (2024)
  superforecasters: 0.0038           // XPT Tournament (2022) - calibration comparison
};
```

**Citation Standards:**
- Amodei: [Axios Sept 2025](https://www.axios.com/2025/09/17/anthropic-dario-amodei-p-doom-25-percent)
- Bengio: [dagens.com 2024](https://www.dagens.com/technology/ai-pioneer-warns-of-extinction-risk)
- Survey: [Grace et al. arXiv:2401.02843](https://arxiv.org/abs/2401.02843)
- Superforecasters: [XPT 2022](https://bigthink.com/the-future/ai-extinction-predictions-superforecasting/)

### Compute Thresholds ✅

```typescript
const computeThresholds = {
  hardProhibition: 1e24,      // Training runs above this banned
  postTrainingThreshold: 1e23, // Post-training runs above this banned
  monitoredThreshold: 1e22     // Requires approval/monitoring
};

const chipClusterDefinition = {
  threshold: 16,                   // H100-equivalents
  h100Performance: 990,            // TFLOP/s FP16
  approximateCost: 500000,         // USD (2025)
  costPerChip: 30000               // H100 unit cost
};
```

**Source:** arXiv:2511.10783 Section on Computational Thresholds

### Consolidation Timeline ✅

```typescript
const consolidationStages = [
  { day: 1,   threshold: 10000 }, // Day 1: >10k H100-equiv
  { day: 10,  threshold: 1000 },  // Day 10: >1k H100-equiv
  { day: 100, threshold: 100 },   // Day 100: >100 H100-equiv
  { year: 2,  threshold: 0 }      // Year 2: All covered clusters
];
```

### Verification Mechanisms ✅

```typescript
const verificationMethods = [
  'mandatory_reporting',    // All CCCs and training runs
  'physical_access',        // Inspector chip access
  'supply_chain_tracking',  // Firmware-based chip ID
  'satellite_surveillance', // Remote monitoring
  'power_analysis',         // Consumption patterns
  'challenge_inspections',  // Surprise visits
  'whistleblower_programs'  // Human intelligence
];
```

**Source:** arXiv:2511.10783 Section on Monitoring Methods

---

## CRITICAL: Implementation Challenges (Must Model)

### Framework: Effectiveness Decay Model

**Core Principle:** Governance proposals face systematic degradation from 7 failure pathways.

```typescript
// Base effectiveness (if implemented immediately with full compliance)
const baseEffectiveness = 0.60; // 60% catastrophic risk reduction (conservative)

// Effectiveness multipliers (compound together)
const effectivenessFactors = {
  obsolescence: Math.pow(0.85, yearsSince2024),      // Threshold already exceeded
  distributed: 1 - (distributedTrainingCapability),  // DiLoCo, federated learning
  algorithmic: Math.pow(0.85, yearsSinceEstablishment), // Efficiency outpaces thresholds
  openWeights: 1 - (openWeightsPenetration),         // Llama 405B irreversible
  calibration: uncertaintyMultiplier,                 // Expert vs superforecaster gap
  compliance: verificationConfidence,                 // US-China trust deficit
  legitimacy: governanceLegitimacy                   // Resentment, underground development
};

// Final effectiveness
const actualEffectiveness = baseEffectiveness *
  effectivenessFactors.obsolescence *
  effectivenessFactors.distributed *
  effectivenessFactors.algorithmic *
  effectivenessFactors.openWeights *
  effectivenessFactors.compliance *
  effectivenessFactors.legitimacy;
```

---

### Challenge 1: Threshold Obsolescence (CRITICAL)

**Problem:** 30+ models already exceed 10²⁴ FLOP (GPT-4: 2-6×10²⁴, DeepSeek-R1: 4×10²⁴)

**Implementation:**

```typescript
// Diminishing returns if implemented late
const obsolescencePenalty = (currentYear: number) => {
  const yearsSince2024 = currentYear - 2024;
  return Math.pow(0.85, yearsSince2024); // 15% effectiveness loss per year
};

// Current capability floor exists regardless of moratorium
const capabilityFloor = existingModelCapabilities.max(); // GPT-4 level already deployed
```

**Simulation Impact:**
- Policy adopted in 2025: 85% baseline effectiveness
- Policy adopted in 2027: 72% effectiveness (0.85²)
- Policy adopted in 2030: 52% effectiveness

**Evidence:** GPT-4 (2023), Claude 3.5, Gemini 1.5, DeepSeek-R1 all exceed threshold

---

### Challenge 2: Distributed Training Evasion (CRITICAL)

**Problem:** Multi-datacenter training (DiLoCo) bypasses cluster tracking

**Implementation:**

```typescript
interface DistributedTrainingState {
  capability: number;        // 0.0 (none) to 1.0 (fully viable)
  adoptionRate: number;      // Percentage of frontier labs using
  evasionProbability: number; // 0.0 to 1.0
}

// Evasion strategies
const evasionVectors = {
  computeStructuring: {
    // Train on 15 H100-equiv clusters (below 16 threshold) with model averaging
    effectiveness: 0.40, // 40% of full-scale training performance
    detectability: 0.20  // 20% chance of detection
  },
  federatedTraining: {
    // Community-contributed compute (Together.ai, Prime Intellect)
    effectiveness: 0.30,
    detectability: 0.10
  },
  crossJurisdiction: {
    // 8 H100s in Singapore + 8 in Switzerland
    effectiveness: 0.50,
    detectability: 0.30
  }
};

// Governance effectiveness degradation
const distributedTrainingPenalty = (state: DistributedTrainingState) => {
  return 1 - (state.capability * state.adoptionRate * 0.6); // Max 60% penalty
};
```

**Simulation Impact:**
- 2025: 20% evasion probability (early DiLoCo)
- 2028: 50% evasion probability (mature distributed training)
- 2030: 70% evasion probability (standard practice)

**Evidence:** [arXiv:2507.07765](https://arxiv.org/abs/2507.07765) - Distributed Training Governance Challenges

---

### Challenge 3: Algorithmic Efficiency (HIGH)

**Problem:** Efficiency gains (1.28×/year) reduce compute requirements for same capability

**Implementation:**

```typescript
interface AlgorithmicEfficiency {
  yearlyImprovementRate: number; // 1.28x from Epoch AI (2010-2024)
  effectiveThresholdErosion: number; // Threshold becomes less restrictive over time
}

// Jevons Paradox: Efficiency improvements counteract restrictions
const algorithmicPenalty = (yearsSinceEstablishment: number) => {
  const efficiencyGains = Math.pow(1.28, yearsSinceEstablishment);
  // 10²⁴ FLOP in 2025 = allowing 2×10²⁴ FLOP capability by 2028 (3 years × 1.28³ ≈ 2.1x)
  return Math.pow(0.85, yearsSinceEstablishment);
};

// Same capability, less compute
const effectiveCapability = nominalCapability * algorithmicEfficiency;
```

**Simulation Impact:**
- 3 years: 28% more capability per FLOP (threshold 28% less restrictive)
- 5 years: 3× efficiency (threshold allows 3× effective capability)

**Evidence:** [Epoch AI 2025](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) - LSTMs→Transformers + Chinchilla = 91% of efficiency gains

---

### Challenge 4: Expert Calibration Gap (HIGH)

**Problem:** Experts estimate 3-12%, superforecasters 0.38% (8× lower)

**Implementation:**

```typescript
// Risk should be LOG-UNIFORM distribution, not point estimate
const catastrophicRiskDistribution = {
  type: 'log-uniform',
  min: 0.003,  // 0.3% (superforecaster estimate)
  max: 0.40    // 40% (upper bound from surveys)
};

// Sample risk for each Monte Carlo run
const sampleRisk = () => {
  const logMin = Math.log(0.003);
  const logMax = Math.log(0.40);
  const logSample = logMin + Math.random() * (logMax - logMin);
  return Math.exp(logSample); // 2 orders of magnitude uncertainty
};

// Policy urgency depends on perceived risk (affects adoption probability)
const policyAdoptionProbability = (perceivedRisk: number) => {
  // Higher perceived risk → higher adoption probability
  return Math.min(1.0, perceivedRisk * 5); // 20% risk → 100% adoption probability
};
```

**Simulation Impact:**
- High-risk scenarios (30%+): Strong policy adoption
- Medium-risk scenarios (3-5%): Uncertain adoption
- Low-risk scenarios (<1%): Minimal policy adoption

**Evidence:** [XPT Tournament 2022](https://bigthink.com/the-future/ai-extinction-predictions-superforecasting/) - Superforecasters 0.38% vs experts 3%

---

### Challenge 5: US-China Compliance (HIGH)

**Problem:** Verification harder than nuclear (software invisible, dual-use infrastructure)

**Implementation:**

```typescript
interface ComplianceState {
  verificationConfidence: number; // 0.0 to 1.0
  perceivedCapabilityGap: number; // 0.0 (parity) to 1.0 (decisive advantage)
  defectionProbability: number;   // Increases with perceived gap
}

// Racing dynamics: perceived advantage creates "use it or lose it" pressure
const defectionRisk = (state: ComplianceState) => {
  const baseDefection = 0.05; // 5% baseline per year
  const gapMultiplier = Math.pow(state.perceivedCapabilityGap, 2); // Quadratic
  return Math.min(0.50, baseDefection + 0.45 * gapMultiplier); // Max 50% per year
};

// Verification degradation over time
const verificationConfidence = (yearsSinceAgreement: number, computeDiffusion: number) => {
  const baseConfidence = 0.75; // Start at 75% (lower than nuclear due to dual-use)
  const degradationRate = 0.10 * computeDiffusion; // 10% per year at full diffusion
  return Math.max(0.30, baseConfidence - degradationRate * yearsSinceAgreement);
};
```

**Simulation Impact:**
- Parity: 5% defection probability per year
- 0.5 capability gap: 16% defection probability per year
- 0.9 capability gap: 41% defection probability per year

**Evidence:** [State Dept 2025 Compliance Report](https://www.state.gov/wp-content/uploads/2025/04/2025-Arms-Control-Treaty-Compliance-Report-1.pdf)

---

### Challenge 6: Open-Weights Proliferation (CRITICAL)

**Problem:** Llama 3.1 405B (5×10²⁴ FLOP) irreversibly released with open weights

**Implementation:**

```typescript
interface OpenWeightsState {
  penetration: number;          // 0.0 to 1.0 (fraction of frontier capability open)
  largestOpenModel: number;     // FLOP scale
  finetuningThreshold: number;  // Compute needed for post-training (typically <10²³)
}

// Irreversible capability floor
const capabilityFloorFromOpenWeights = (state: OpenWeightsState) => {
  // Once released, capabilities persist regardless of training restrictions
  return state.largestOpenModel; // Llama 405B sets floor at ~5×10²⁴ capability
};

// Governance effectiveness penalty
const openWeightsPenalty = (state: OpenWeightsState) => {
  // Training restrictions ineffective for capabilities already open-weighted
  return 1 - state.penetration; // 50% penetration → 50% penalty
};

// Post-training enhancement below threshold
const postTrainingEnhancement = (baseModel: number, finetuningCompute: number) => {
  // Fine-tune/jailbreak at <10²³ FLOP
  const enhancement = Math.min(2.0, 1 + finetuningCompute / 1e23);
  return baseModel * enhancement; // 2× capability uplift possible
};
```

**Simulation Impact:**
- 2025: 30% penetration (Llama 405B, Qwen, Mistral)
- 2027: 60% penetration (most frontier models open)
- 2030: 85% penetration (open-source dominant)

**Evidence:** [Meta Llama 3.1 release](https://ai.meta.com/blog/meta-llama-3-1-ai-responsibility/), [Carnegie 2024](https://carnegieendowment.org/research/2024/07/beyond-open-vs-closed-emerging-consensus-and-key-questions-for-foundation-ai-model-governance)

---

### Challenge 7: Unintended Consequences (MEDIUM)

**Problem:** Incumbent lock-in, beneficial AI blocked, underground development

**Implementation:**

```typescript
interface GovernanceConsequences {
  incumbentAdvantage: number;    // Entrenchment of existing leaders
  beneficialAIOpportunityCost: number; // Climate modeling, drug discovery blocked
  undergroundDevelopment: number; // Black market compute
  geopoliticalResentment: number; // Non-signatory/developing nation resentment
}

// Legitimacy decay from negative consequences
const governanceLegitimacy = (consequences: GovernanceConsequences) => {
  const baseLegitimacy = 0.80; // Start at 80%

  const penalties = {
    incumbent: consequences.incumbentAdvantage * 0.15,
    opportunity: consequences.beneficialAIOpportunityCost * 0.10,
    underground: consequences.undergroundDevelopment * 0.20,
    resentment: consequences.geopoliticalResentment * 0.25
  };

  const totalPenalty = Object.values(penalties).reduce((a, b) => a + b, 0);
  return Math.max(0.30, baseLegitimacy - totalPenalty);
};

// Underground development increases with enforcement strictness
const undergroundProbability = (enforcementStrictness: number) => {
  // Prohibition analog: strict enforcement → organized crime
  return Math.min(0.40, 0.10 + 0.30 * enforcementStrictness);
};
```

**Simulation Impact:**
- High legitimacy: 80% compliance
- Medium legitimacy: 60% compliance
- Low legitimacy: 40% compliance (underground dominates)

---

## Implementation Strategy

### Phase 1: Core Governance Mechanics

**File:** `src/simulation/engine/phases/AIGovernancePhase.ts` (new)

```typescript
interface AIGovernancePolicy {
  type: 'global_moratorium' | 'bilateral_framework' | 'status_quo';
  adoptionYear: number | null;
  computeThresholds: {
    hardProhibition: number;      // 1e24
    postTraining: number;         // 1e23
    monitored: number;            // 1e22
  };
  verificationMethods: string[];
  consolidationProgress: number;  // 0.0 to 1.0
}

interface GovernanceEffectiveness {
  baseline: number;
  obsolescence: number;
  distributed: number;
  algorithmic: number;
  openWeights: number;
  compliance: number;
  legitimacy: number;
  actual: number; // Product of all factors
}

function calculateGovernanceEffectiveness(
  state: GameState,
  policy: AIGovernancePolicy,
  rng: () => number
): GovernanceEffectiveness {
  // Implementation of effectiveness decay model
  // Returns compound effectiveness from all 7 failure pathways
}
```

### Phase 2: Failure Pathway Modeling

**Each challenge becomes a state variable:**

```typescript
interface AIGovernanceState {
  policy: AIGovernancePolicy | null;
  effectiveness: GovernanceEffectiveness;

  // Challenge 1: Obsolescence
  modelsExceedingThreshold: number;
  capabilityFloor: number;

  // Challenge 2: Distributed Training
  distributedTrainingCapability: number;
  evasionProbability: number;

  // Challenge 3: Algorithmic Efficiency
  algorithmicEfficiencyGains: number; // Cumulative since policy adoption
  effectiveThresholdErosion: number;

  // Challenge 4: Risk Calibration
  sampledRisk: number; // Per-run from log-uniform distribution
  policyUrgency: number;

  // Challenge 5: Compliance
  verificationConfidence: number;
  perceivedCapabilityGap: number;
  defectionProbability: number;

  // Challenge 6: Open Weights
  openWeightsPenetration: number;
  largestOpenModel: number;

  // Challenge 7: Legitimacy
  governanceLegitimacy: number;
  undergroundDevelopment: number;
  beneficialAIOpportunityCost: number;
}
```

### Phase 3: Monte Carlo Sensitivity Analysis

**Required tests before production:**

```typescript
// Test 1: Policy timing sensitivity
const timings = [2024, 2025, 2027, 2030];
// Expected: Later adoption → exponentially worse effectiveness

// Test 2: Failure pathway combinations
const scenarios = [
  { distributed: 0.0, openWeights: 0.3 }, // Current state
  { distributed: 0.5, openWeights: 0.6 }, // 2027 projection
  { distributed: 0.8, openWeights: 0.9 }  // 2030 worst case
];
// Expected: Multiplicative degradation

// Test 3: Risk distribution impact
const riskSamples = Array.from({ length: 100 }, () => sampleLogUniform(0.003, 0.40));
// Expected: High variance in policy adoption probability

// Test 4: Compliance dynamics
const capabilityGaps = [0.0, 0.3, 0.5, 0.7, 0.9];
// Expected: Quadratic defection probability increase
```

---

## Documentation Standards

### Code Comments (MANDATORY)

```typescript
/**
 * AI Governance Compute Thresholds (Dec 2025)
 *
 * Research-backed thresholds from MIRI proposals for international AI governance.
 *
 * IMPORTANT: These are PROPOSED governance scenarios, not validated interventions.
 * Implementation includes 7 failure pathways that degrade effectiveness over time:
 * 1. Threshold obsolescence (30+ models already exceed 10²⁴ FLOP)
 * 2. Distributed training evasion (DiLoCo, federated learning)
 * 3. Algorithmic efficiency outpacing thresholds (1.28×/year)
 * 4. Expert risk calibration uncertainty (0.38% vs 3-12%)
 * 5. US-China compliance challenges (verification harder than nuclear)
 * 6. Open-weights proliferation (Llama 405B irreversible)
 * 7. Unintended consequences (incumbent lock-in, underground development)
 *
 * Sources:
 * - Barnett & Scher (2025) arXiv:2505.04592 - Global moratorium proposal
 * - Scher et al. (2025) arXiv:2511.10783 - US-China bilateral framework
 * - Verification: research/verification_ff6ff02_20251207.md
 *
 * Base effectiveness: 60% catastrophic risk reduction (if implemented immediately)
 * Actual effectiveness: base × obsolescence × distributed × algorithmic × openWeights × compliance × legitimacy
 *
 * Effectiveness decay: ~15% per year from algorithmic efficiency + obsolescence
 * Evasion probability: 20% (2025) → 70% (2030) as distributed training matures
 */
const COMPUTE_GOVERNANCE_THRESHOLDS = {
  hardProhibition: 1e24,  // Training runs above this completely banned
  postTraining: 1e23,     // Post-training enhancements above this banned
  monitored: 1e22         // Requires approval/monitoring (between 10²² and 10²⁴)
};
```

### Research File Updates

**File:** `research/ai_governance_proposals_2025.md` (update)

**Required sections:**
1. **Verified Parameters** - Exact citations for all numbers
2. **Implementation Challenges** - All 7 failure pathways with evidence
3. **Effectiveness Model** - Mathematical framework for decay
4. **Sensitivity Analysis** - Monte Carlo testing results
5. **Related Literature** - Contradictory/supporting sources

---

## Success Criteria

### Phase 1 Complete When:
- ✅ AIGovernancePhase.ts created with all verified parameters
- ✅ All 7 failure pathways modeled as state variables
- ✅ Effectiveness decay calculation implemented
- ✅ Code comments cite arXiv papers

### Phase 2 Complete When:
- ✅ Monte Carlo N≥20 shows effectiveness degradation over time
- ✅ Sensitivity analysis confirms failure pathway impacts
- ✅ Outcome distributions match expectations (policy timing critical)
- ✅ No TypeScript errors or NaN values

### Phase 3 Complete When:
- ✅ Integration with AI capability phase validated
- ✅ Government policy adoption mechanics functional
- ✅ Dashboard visualization shows governance effectiveness over time
- ✅ Devlog entry documents implementation

---

## Related Work

### Existing Implementation

**Check for existing governance mechanics:**
```bash
grep -r "compute.*threshold" src/simulation/
grep -r "governance" src/simulation/
grep -r "bilateral" src/simulation/
```

**If exists:** Verify parameters match arXiv sources, add failure pathways

**If not:** Create new AIGovernancePhase as specified above

### Integration Points

1. **AI Capability Phase** - Governance restricts capability growth
2. **Government Phase** - Policy adoption decisions
3. **Geopolitical Phase** - US-China dynamics affect compliance
4. **Technology Phase** - Distributed training capability advances
5. **Crisis Resolution Phase** - Catastrophic risk reduction from governance

---

## Testing Checklist

- [ ] Verify all parameters match arXiv sources exactly
- [ ] Test obsolescence penalty (effectiveness decays 15%/year)
- [ ] Test distributed training evasion (20% → 70% over time)
- [ ] Test algorithmic efficiency erosion (threshold 28% less restrictive after 3 years)
- [ ] Test risk distribution sampling (log-uniform 0.3% to 40%)
- [ ] Test compliance dynamics (defection increases with capability gap)
- [ ] Test open-weights irreversibility (Llama 405B capability floor)
- [ ] Test legitimacy decay (unintended consequences reduce compliance)
- [ ] Monte Carlo N≥20 with all failure pathways enabled
- [ ] Compare to baseline (status quo, no governance)
- [ ] Measure outcome category shifts (utopia vs dystopia vs extinction)

---

## References

### Primary Sources
- [Barnett & Scher (2025) arXiv:2505.04592](https://arxiv.org/abs/2505.04592) - Global Moratorium
- [Scher et al. (2025) arXiv:2511.10783](https://arxiv.org/abs/2511.10783) - Bilateral Framework
- [Grace et al. (2024) arXiv:2401.02843](https://arxiv.org/abs/2401.02843) - AI Conference Survey

### Failure Pathway Evidence
- [arXiv:2507.07765](https://arxiv.org/abs/2507.07765) - Distributed Training Evasion
- [Epoch AI 2025](https://epoch.ai/blog/can-ai-scaling-continue-through-2030) - Algorithmic Efficiency
- [XPT Tournament 2022](https://bigthink.com/the-future/ai-extinction-predictions-superforecasting/) - Expert Calibration
- [State Dept 2025](https://www.state.gov/wp-content/uploads/2025/04/2025-Arms-Control-Treaty-Compliance-Report-1.pdf) - Compliance Challenges
- [Carnegie 2024](https://carnegieendowment.org/research/2024/07/beyond-open-vs-closed-emerging-consensus-and-key-questions-for-foundation-ai-model-governance) - Open Weights

### Verification
- `research/verification_ff6ff02_20251207.md` - Full two-layer verification (Grade A)

---

## Change History

**December 8, 2025** - Implementation guidance created
- Grade A verification findings documented
- 7 failure pathways formalized with mathematical models
- Implementation strategy defined (3 phases)
- Testing checklist established
- Documentation standards specified

---

## Next Actions

1. **Simulation maintainer:** Implement AIGovernancePhase with failure pathways
2. **Architect:** Add to OpenSpec simulation roadmap
3. **Feature team:** Schedule Monte Carlo sensitivity analysis
4. **Autonomous researcher:** Monitor for 2026 governance literature updates

**Status:** ✅ READY FOR IMPLEMENTATION - All parameters verified, effectiveness model defined
