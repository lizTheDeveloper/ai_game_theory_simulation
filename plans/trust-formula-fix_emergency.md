# EMERGENCY: Trust Formula Research Correction

**Date:** October 19, 2025
**Priority:** CRITICAL - Blocks all validation
**Issue:** Fix #2 trust formula contradicts 2024 research on explainability

---

## Problem Statement

### Current Formula (WRONG)
```typescript
trust = alignment * 0.40 +
        benefits * 0.20 +
        explainability * 0.20 +  // ❌ CONTRADICTS RESEARCH
        safety * 0.20
```

### Research Contradictions

**Scientific Reports (2024):**
> "Interpretability does not significantly improve trust, while outcome feedback has a more reliable and positive impact"

**McKinsey (2024):**
- 40% identify explainability as a **risk**, not benefit
- Performance and reliability matter more than explanations

**CHI (2024):**
- Explainability's effect is context-dependent and often negative in high-stakes domains

### Core Issue

**We're confusing "explainability" with "performance transparency":**
- **Explainability:** Why AI made decision X (can reduce trust when reveals concerning logic)
- **Performance:** How well AI actually works (builds trust through results)

---

## Evidence-Based Correction

### Research-Backed Trust Model

**University of Melbourne + KPMG (2025, N=48K):**
- 46% trust AI globally
- Trust drivers: **Tangible benefits** > **Track record** > **Reliability**

**Edelman Trust Barometer (2024):**
- High-trust companies: 2.6x more likely successful AI adoption
- Trust built through: **Demonstrated value** + **Consistency** + **Transparency of outcomes**

**DORA (2024):**
- Developer productivity correlates with **trust in results**, not understanding of internals
- +49% output quality perception from feedback loops
- +52% privacy understanding from outcome transparency

### Corrected Formula

```typescript
// RESEARCH-BACKED TRUST MODEL (Oct 19, 2025)
trust = alignment_perception * 0.25 +    // Observable behavior, not true alignment
        performance * 0.35 +              // How well AI actually works (MOST IMPORTANT)
        demonstrated_benefits * 0.25 +    // Tangible QoL improvements
        safety_record * 0.15;             // Track record of no incidents

// REMOVED: explainability (contradicts research)
// ADDED: performance (empirically most important factor)
```

### Component Definitions

**1. Alignment Perception (25%)**
- NOT true alignment (unobservable)
- Observable behavior: Does AI seem aligned with human values?
- Calculated from: Detected misalignments, public incidents, behavior anomalies

**2. Performance (35%)**  ← **NEW, MOST IMPORTANT**
- How well AI works in practice
- Measured by: Task completion rate, error frequency, reliability
- Research: McKinsey (2024) - performance matters more than explanations

**3. Demonstrated Benefits (25%)**
- Tangible QoL improvements
- People see actual value in daily life
- Already implemented correctly

**4. Safety Record (15%)**
- Track record of no major incidents
- Already implemented correctly

---

## Implementation Plan

### Phase 1: Fix Trust Calculation (2 hours)

**File:** `src/simulation/socialCohesion.ts`

**Changes:**
1. Remove explainability component (20%)
2. Add performance component (35%)
3. Rename "alignment quality" → "alignment perception"
4. Add performance tracking to GameState

**Code:**
```typescript
export function calculateComprehensiveTrustInAI(state: GameState): number {
  // 1. ALIGNMENT PERCEPTION (25% weight)
  // Observable behavior, not true alignment
  const alignmentPerception = calculateAlignmentPerception(state);

  // 2. PERFORMANCE (35% weight) - MOST IMPORTANT
  // How well AI actually works
  const performance = calculateAIPerformance(state);

  // 3. DEMONSTRATED BENEFITS (25% weight)
  const qol = state.globalMetrics.qualityOfLife;
  const demonstratedBenefits = qol > 0.5 ? 0.25 : qol * 0.5;

  // 4. SAFETY RECORD (15% weight)
  const safetyRecord = calculateSafetyRecord(state);

  // Base trust from positive factors
  const baseTrust = alignmentPerception + performance + demonstratedBenefits + safetyRecord;

  // Capability fear (penalty only on rapid changes)
  const capabilityFear = calculateCapabilityFear(state);

  return Math.max(0, Math.min(1, baseTrust - capabilityFear));
}

function calculateAlignmentPerception(state: GameState): number {
  // Observable alignment behavior (not true alignment)
  const totalAIs = state.aiAgents.length;
  if (totalAIs === 0) return 0.2; // Moderate default

  // Public perception based on detected issues
  const detectedMisalignments = state.aiAgents.filter(ai =>
    ai.alignment < 0.5 && ai.revealed === true  // Only if detected
  ).length;

  const perceptionRate = 1 - (detectedMisalignments / totalAIs);

  // Scale to 0-0.25 (25% of total trust)
  return perceptionRate * 0.25;
}

function calculateAIPerformance(state: GameState): number {
  // Research: Performance = task completion * reliability
  // Proxy: QoL improvement + low error rate

  const qol = state.globalMetrics.qualityOfLife;
  const qolTrend = qol - (state.globalMetrics.previousQoL || 0.5);

  // Performance baseline from QoL (is AI making life better?)
  const performanceFromResults = qol * 0.5;

  // Reliability bonus (no major failures)
  const recentFailures = (state.significantEvents || []).filter(
    event => event.type === 'AIFailure' &&
             state.currentMonth - (event.month || 0) < 12
  ).length;

  const reliabilityBonus = Math.max(0, 0.15 - (recentFailures * 0.03));

  // Performance = results + reliability, capped at 35%
  return Math.min(0.35, performanceFromResults + reliabilityBonus);
}
```

### Phase 2: Add Performance Tracking (1 hour)

**File:** `src/types/game.ts`

**Changes:**
```typescript
interface GlobalMetrics {
  // ... existing fields

  // FIX: Performance tracking for trust model
  aiPerformanceMetrics?: {
    taskCompletionRate: number;     // [0,1] How often AI succeeds
    errorFrequency: number;          // Errors per month
    reliabilityScore: number;        // [0,1] Consistency over time
  };
}
```

### Phase 3: Update Trust Recovery (1 hour)

**File:** `src/simulation/socialCohesion.ts` (updateTrustRecovery function)

**Changes:**
- Remove explainability recovery factor
- Add performance improvement recovery factor

```typescript
// OLD: Explainability recovery (+1%/month)
if ((state.aiTransparency?.level || 0) > 0.7) {
  trustChange += TRUST_RECOVERY_FROM_EXPLAINABILITY;
}

// NEW: Performance improvement recovery (+2%/month)
const performanceImproving = calculatePerformanceTrend(state) > 0;
if (performanceImproving) {
  trustChange += 0.02;  // AI getting better → trust grows
}
```

---

## Water Consumption Fix (Separate Issue)

### Current Model (WRONG)
```typescript
const WATER_PER_CAPABILITY_POINT = 50;  // Million liters/month
// Problem: Off by 100-1000x according to research-skeptic
```

### Research-Based Correction

**Google Data Centers (2024):**
- Hyperscale: 2.1M liters/day for entire facility
- Medium (15MW): 25.5M liters/year

**GPT-3 Inference:**
- 519ml per 100-word prompt
- ~500K liters/year for continuous operation

### Corrected Model

```typescript
// Training: One-time cost per capability increase
const WATER_TRAINING_PER_CAPABILITY = 10;  // Million liters (one-time)

// Inference: Ongoing operational cost
const WATER_INFERENCE_BASE = 2;  // Million liters/month for all AI ops
const WATER_INFERENCE_SCALING = 0.5;  // Million liters/month per capability point

// Efficiency gains (logarithmic, not linear)
function calculateWaterConsumption(totalCapability: number): number {
  const inferenceWater = WATER_INFERENCE_BASE +
                        (WATER_INFERENCE_SCALING * Math.log2(totalCapability + 1));

  // Training spikes handled separately
  return inferenceWater;
}
```

**Reduction:** 50M → 2-5M liters/month (10-25x less, closer to research)

---

## Workflow Adaptation Fix (Separate Issue)

### Current Model (WEAK)
- 21% baseline (valid)
- 40% threshold (arbitrary)
- Linear growth (wrong)

### Research-Based Correction

**Key Insight:** Bimodal distribution, not uniform
- Jobs either <10% automated OR >50% automated
- Rarely in between (Autor 2024)

**McKinsey (2024):**
- 120M workers need retraining in 3 years
- 88% of AI pilots fail to scale
- Resistance is major barrier

### Corrected Model

```typescript
interface WorkflowAdaptation {
  adoptionRate: number;        // [0,1] % orgs that adopted AI
  integrationDepth: number;    // [0,1] How deeply integrated
  resistanceLevel: number;     // [0,1] Active opposition
  trainingCapacity: number;    // [0,1] Ability to retrain workers
}

// Growth model: S-curve with resistance
function updateWorkflowAdaptation(state: GameState) {
  const current = state.society.workflowAdaptation || 0.21;

  // S-curve: slow start, rapid middle, slow end
  const growthPotential = current * (1 - current) * 4;  // Logistic

  // Resistance force (unemployment → resistance)
  const resistance = state.society.unemploymentLevel * 0.5;

  // Net growth
  const monthlyGrowth = (growthPotential - resistance) * 0.02;  // 2% base

  state.society.workflowAdaptation = Math.max(0, Math.min(1,
    current + monthlyGrowth
  ));
}
```

---

## Decision Point

### Option A: Fix Now (Recommended)
**Pros:**
- Validates all future work against correct model
- Prevents compounding errors
- Research integrity maintained

**Cons:**
- Delays Fix #9 by 4-6 hours
- Need to re-validate Fixes #2, #7

### Option B: Continue with Fix #9, Fix Later
**Pros:**
- Maintains momentum
- Can batch corrections

**Cons:**
- Risk of building on flawed foundation
- May need to redo Fix #9 work

---

## Recommendation: FIX NOW

**Rationale:**
1. Trust is central to utopia pathways - getting it wrong breaks everything
2. Water consumption affects crisis cascades - 100x error is unacceptable
3. Research integrity is the project's core value
4. 4-6 hours now saves days of rework later

**Sequence:**
1. Fix trust formula (2h)
2. Fix water consumption (1h)
3. Quick Monte Carlo test (0.5h)
4. THEN proceed to Fix #9 with solid foundation

---

**Estimated Total Time:** 4-6 hours
**Confidence:** HIGH (based on peer-reviewed 2024 research)
**Risk of Not Fixing:** Model produces results through parameter tuning, not real dynamics
