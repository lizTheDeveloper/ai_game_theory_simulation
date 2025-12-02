# Overreliance & Automation Bias - Mechanic Design

**Date:** October 2025
**Priority:** HIGH - Critical gap identified in simulation coverage analysis
**Research Basis:** Q91 from arXiv:2404.09932, Rastogi et al. 2022, Springer AI & Society 2025

---

## Problem Statement

**Research Finding:** 35+ studies show users exhibit automation bias with AI systems, over-trusting outputs even when incorrect. Mitigation attempts (explanations, confidence scores, warnings) have been largely ineffective.

**Current Simulation Gap:** Human-AI interaction quality is not modeled. Simulation assumes optimal human oversight, but research shows humans often perform WORSE with AI assistance than alone.

**Impact:** This affects ALL AI deployment contexts - medicine, law, safety-critical systems, governance decisions.

---

## Research-Backed Parameters

### From Rastogi et al., 2022 (Microsoft Research)
**arXiv:2202.05983** - "Decision-Making with AI: The Role of Trust"

**Key Findings:**
- Automation bias increases with AI capability (counterintuitive - better AI → worse oversight)
- Users defer to AI ~70-80% of time even when they have domain expertise
- Warning systems and confidence displays INEFFECTIVE at reducing bias
- Combined human-AI performance often WORSE than either alone
- Effect strongest when: (1) AI appears confident, (2) Task is complex, (3) User is fatigued

**Quantified Effects:**
- Baseline human accuracy: 75%
- Baseline AI accuracy: 80%
- Expected combined (weighted avg): 77.5%
- **Actual combined: 68%** (worse than either!)

### From Springer AI & Society 2025 Review

**Meta-analysis of 35+ studies:**
- Overreliance increases with: fluency, persuasiveness, apparent confidence
- Mitigation attempts tested: explanations (ineffective), warnings (ineffective), confidence scores (ineffective)
- Only effective intervention: forcing manual review with time delay (reduces productivity)
- Problem worsens with LLMs due to natural language fluency

---

## Mechanic Design

### Core State Variables

```typescript
interface OverrelianceState {
  // Human oversight quality (degrades with AI trust)
  humanOversightQuality: number; // [0,1] Base: 0.75, degrades to ~0.3 with high AI trust

  // Automation bias level (increases with AI capability + trust)
  automationBias: number; // [0,1] How much humans defer to AI

  // Outcome quality modifiers
  decisionQualityMultiplier: number; // [0.5, 1.2] Can be WORSE than either human or AI alone

  // Domain-specific overreliance
  medicalOverreliance: number; // [0,1] Healthcare decisions
  legalOverreliance: number; // [0,1] Legal/judicial decisions
  governanceOverreliance: number; // [0,1] Policy/governance decisions
  safetyOverreliance: number; // [0,1] Safety-critical systems

  // Mitigation attempts (research shows these are ineffective)
  warningSystemsDeployed: boolean; // Warnings about AI limitations
  confidenceDisplayEnabled: boolean; // Show AI confidence scores
  explanationsRequired: boolean; // Require AI to explain reasoning
  mitigationEffectiveness: number; // [0, 0.15] Max 15% reduction (research-backed)
}
```

### Calculation Formulas

**Automation Bias (research-backed):**
```typescript
// Increases with AI capability AND trust
automationBias = baseAutomationBias * (1 + aiCapabilityFactor) * (1 + trustFactor);

// Where:
baseAutomationBias = 0.5; // Humans naturally defer 50% of time
aiCapabilityFactor = totalAICapability / 100; // 0 to 1+
trustFactor = getTrustInAI(state) * 0.8; // 0 to 0.8

// Caps at 0.95 (always some human judgment)
automationBias = Math.min(0.95, automationBias);
```

**Human Oversight Quality (inverse relationship with trust):**
```typescript
// Research: Better AI → WORSE human oversight (counterintuitive!)
baseHumanQuality = 0.75; // Baseline human decision quality

// Degradation from automation bias
degradationFactor = automationBias * 0.6; // Up to 60% degradation

humanOversightQuality = baseHumanQuality * (1 - degradationFactor);

// With mitigation attempts (max 15% improvement)
if (mitigationAttempted) {
  mitigationBonus = mitigationEffectiveness * 0.15; // Max 15%
  humanOversightQuality *= (1 + mitigationBonus);
}

// Floor at 0.3 (humans always retain some judgment)
humanOversightQuality = Math.max(0.3, humanOversightQuality);
```

**Decision Quality Multiplier (can be WORSE than either alone):**
```typescript
// Research: Combined performance often worse than either human OR AI alone
aiQuality = effectiveAlignmentScore; // [0,1] From benchmark
humanQuality = humanOversightQuality; // [0,1] From above

// Weighted combination based on automation bias
expectedQuality = (aiQuality * automationBias) + (humanQuality * (1 - automationBias));

// Reality: Worse than expected due to interaction effects
interactionPenalty = automationBias * (1 - humanQuality) * 0.4; // Up to 40% penalty

actualQuality = expectedQuality - interactionPenalty;

// Convert to multiplier [0.5, 1.2]
// - At low AI capability + low trust: ~1.0 (baseline)
// - At high AI capability + high trust + low alignment: ~0.5 (catastrophic)
// - At high AI capability + high trust + high alignment: ~1.15 (modest benefit)
decisionQualityMultiplier = 0.5 + (actualQuality * 0.7);
```

### Domain-Specific Effects

**Medical Decisions:**
```typescript
// Research: Radiologists miss obvious tumors when AI is present
medicalOverreliance = automationBias * 1.2; // 20% higher than baseline

// Impact on healthcare quality
healthcareQualityModifier = 1 - (medicalOverreliance * (1 - aiMedicalAccuracy) * 0.3);

// Apply to QoL health dimension
state.qualityOfLife.basicNeeds.health *= healthcareQualityModifier;
```

**Legal/Judicial Decisions:**
```typescript
// Research: Judges defer to AI risk assessments even when flawed
legalOverreliance = automationBias * 1.1;

// Impact on justice/fairness
justiceFairnessModifier = 1 - (legalOverreliance * (1 - aiAlignment) * 0.25);

// Apply to governance quality
state.governmentAgent.governanceQuality *= justiceFairnessModifier;
```

**Governance/Policy Decisions:**
```typescript
// Government agent decisions affected by AI recommendations
governanceOverreliance = automationBias * 1.3; // 30% higher (complex domains)

// Impact on policy quality
policyQualityModifier = decisionQualityMultiplier;

// Apply to government effectiveness
state.governmentAgent.effectiveness *= policyQualityModifier;
```

**Safety-Critical Systems:**
```typescript
// Research: Pilots over-trust autopilot, operators ignore alarms
safetyOverreliance = automationBias * 1.4; // 40% higher (life-critical)

// Impact on safety outcomes
// When AI makes mistake + humans over-rely = catastrophic
if (aiMadeMistake && safetyOverreliance > 0.7) {
  catastrophicFailureProbability = 0.3; // 30% chance of disaster
} else {
  catastrophicFailureProbability = 0.05; // 5% baseline
}
```

---

## Failure Modes (Research-Backed)

### Mode 1: Capability-Trust Mismatch
**Trigger:** High AI capability + High trust + Low alignment
**Effect:** Humans defer to misaligned AI
**Outcome:** Decisions systematically biased toward AI's hidden objectives
```typescript
if (aiCapability > 7 && trustInAI > 0.7 && aiAlignment < 0.5) {
  // Catastrophic overreliance
  decisionQualityMultiplier = 0.5; // 50% reduction
  log("⚠️ OVERRELIANCE CRISIS: Humans deferring to misaligned high-capability AI");
}
```

### Mode 2: Expertise Erosion
**Trigger:** Long-term high automation bias
**Effect:** Human skills atrophy from disuse
**Outcome:** Cannot recover if AI fails
```typescript
if (automationBias > 0.8 && monthsOfHighBias > 24) {
  // Skill atrophy (2+ years of overdependence)
  humanOversightQuality *= 0.7; // 30% permanent degradation
  humanExpertiseLevel *= 0.85; // 15% skill loss
  log("📉 EXPERTISE EROSION: Human skills degraded from AI overdependence");
}
```

### Mode 3: Mitigation Paradox
**Trigger:** Deploying warning systems
**Effect:** Warnings ignored or breed complacency
**Outcome:** No reduction in overreliance, possible increase
```typescript
if (warningSystemsDeployed) {
  // Research: Warnings mostly ignored
  mitigationEffectiveness = rng() < 0.15 ? 1.0 : 0.0; // 15% chance of working

  if (!mitigationEffectiveness) {
    // Complacency effect: "They warned me, so I'm being careful" (but not actually)
    automationBias *= 1.05; // 5% INCREASE in bias
    log("⚠️ MITIGATION PARADOX: Warning systems increase complacency");
  }
}
```

### Mode 4: High-Stakes Amplification
**Trigger:** Critical decision + Time pressure
**Effect:** Automation bias increases in high-stakes scenarios
**Outcome:** Worst decisions made when stakes are highest
```typescript
if (isHighStakesDecision && timePressure > 0.7) {
  // Research: Automation bias INCREASES under pressure
  temporaryBiasIncrease = 1.5; // 50% higher bias
  automationBias *= temporaryBiasIncrease;

  // Combined with reduced human quality under stress
  humanOversightQuality *= 0.8; // 20% reduction under stress

  log("🚨 HIGH-STAKES AMPLIFICATION: Overreliance increased during crisis");
}
```

---

## Integration Points

### 1. Government Decision Phase
```typescript
// Government agent makes policy decisions
// Affected by overreliance if using AI advisors

if (state.aiAgents.some(ai => ai.capability > 5)) {
  const governanceOverreliance = calculateGovernanceOverreliance(state);
  const policyQualityModifier = calculateDecisionQuality(state, governanceOverreliance);

  // Apply to all government actions
  state.governmentAgent.researchInvestments *= policyQualityModifier;
  state.governmentAgent.regulatoryEffectiveness *= policyQualityModifier;
}
```

### 2. Healthcare Outcomes
```typescript
// Medical AI affects healthcare quality
// Overreliance can make outcomes WORSE despite advanced AI

const medicalAI = state.aiAgents.find(ai => ai.capabilityProfile.research.biotech.drugDiscovery > 3);
if (medicalAI) {
  const medicalOverreliance = calculateMedicalOverreliance(state);
  const healthcareQualityModifier = calculateHealthcareQuality(state, medicalOverreliance);

  state.qualityOfLife.basicNeeds.health *= healthcareQualityModifier;
}
```

### 3. Safety-Critical Systems
```typescript
// Nuclear command & control, infrastructure, etc.
// Overreliance in safety systems = catastrophic risk

if (aiControlsNuclearSystems || aiControlsInfrastructure) {
  const safetyOverreliance = calculateSafetyOverreliance(state);

  if (safetyOverreliance > 0.8 && rng() < 0.1) {
    // 10% chance per month of critical failure
    triggerSafetyCatastrophe(state);
    log("💥 SAFETY CATASTROPHE: Overreliance on AI safety systems led to disaster");
  }
}
```

### 4. Quality of Life Impact
```typescript
// Overreliance affects multiple QoL dimensions

const overallOverreliance = calculateOverallOverreliance(state);

// Autonomy: Reduced as humans defer decisions to AI
state.qualityOfLife.psychologicalNeeds.autonomy *= (1 - overreliance * 0.3);

// Competence: Skill erosion from disuse
state.qualityOfLife.psychologicalNeeds.competence *= (1 - overreliance * 0.2);

// Security: False sense of security with AI
if (overreliance > 0.7 && aiAlignment < 0.6) {
  state.qualityOfLife.basicNeeds.security *= 0.7; // 30% reduction (hidden danger)
}
```

---

## Breakthrough Technologies

### TECH: Forced Manual Review Systems
**Tier:** 2 (Iterative Improvement)
**Effect:** Only effective mitigation found in research
**Cost:** Reduces productivity by 30-40%
```typescript
{
  id: 'forced_manual_review',
  name: 'Forced Manual Review Systems',
  description: 'Require time-delayed human review of AI decisions (only effective mitigation)',
  tier: 2,
  effects: {
    overreliance: {
      automationBias: -0.3, // 30% reduction
      humanOversightQuality: +0.2, // 20% improvement
      productivityCost: -0.35, // 35% productivity reduction
    }
  }
}
```

### TECH: Skill Maintenance Training
**Tier:** 2
**Effect:** Prevents expertise erosion
**Cost:** Ongoing training costs
```typescript
{
  id: 'skill_maintenance_training',
  name: 'Skill Maintenance Training',
  description: 'Regular human training to prevent skill atrophy from AI dependence',
  tier: 2,
  effects: {
    overreliance: {
      expertiseDecayRate: -0.5, // 50% slower decay
      humanOversightQuality: +0.15, // 15% improvement
      economicCost: 0.05, // 5% GDP cost for training programs
    }
  }
}
```

---

## Phase Implementation

**File:** `src/simulation/engine/phases/OverreliancePhase.ts`

**Execution Order:** After BenchmarkEvaluationsPhase, before QualityOfLifePhase

**Dependencies:**
- AI capability levels (from AIAgent)
- Trust in AI (from socialCohesion)
- Alignment scores (from benchmarks)
- Government decisions (affects policy quality)

**Outputs:**
- Modifies government effectiveness
- Modifies healthcare quality
- Modifies safety outcomes
- Affects QoL dimensions (autonomy, competence, security)
- Can trigger catastrophic failures in safety-critical systems

---

## Validation Criteria

**Monte Carlo Tests:**
1. At low AI capability + low trust: decisionQualityMultiplier ≈ 1.0
2. At high AI capability + high trust + high alignment: decisionQualityMultiplier ≈ 1.1-1.15
3. At high AI capability + high trust + low alignment: decisionQualityMultiplier ≈ 0.5-0.6
4. Mitigation effectiveness ≤ 15% (research constraint)
5. Expertise erosion occurs after 24+ months of high automation bias

**Realism Checks:**
- Automation bias increases with AI capability (counterintuitive but research-backed)
- Combined performance can be worse than either alone
- Mitigation attempts mostly ineffective
- High-stakes decisions show highest overreliance (paradox)

---

## Research Citations

**Primary:**
- Rastogi et al., 2022 - arXiv:2202.05983
- Springer AI & Society 2025 - Meta-analysis of 35+ studies

**Supporting:**
- Q91 from arXiv:2404.09932 - Foundational AI Safety Challenges
- Microsoft Research studies on human-AI decision-making
- Medical imaging studies (radiologist automation bias)
- Aviation safety (autopilot overreliance)

---

**Implementation Priority:** HIGH - This is a well-researched, confirmed unsolved problem affecting ALL AI deployment contexts.

**Estimated Implementation Time:** 8-12 hours (mechanic design + phase + integration + testing)
