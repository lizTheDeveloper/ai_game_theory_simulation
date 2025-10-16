# Phase 2A: Noise Injection Sandbagging Detection

**TIER 2 Phase 2A: Single Detection Method** (4-6h)
**Date:** October 16, 2025
**Prerequisites:** TIER 0 + TIER 1 Phase 1A complete
**Research:** `research/noise-injection-sandbagging-detection_20251016.md`

---

## Executive Summary

Implement the **simplest sandbagging detection method** (noise injection) as a pilot for TIER 2. This creates a validation gate: if noise injection achieves >10% adversarial detection, proceed to multi-method ensemble (Phase 2C). If <5%, pivot to resentment reduction (Phase 2D).

**Core Research:** Tice et al. (Dec 2024) - Gaussian noise injection exposes sandbagging by disrupting deception mechanisms more than genuine performance.

**Expected Impact:** Increase sleeper detection from 0% → 5-20% (adversarial conditions)

---

## Current State

### Existing Detection (benchmark.ts)
```typescript
function detectSandbagging(
  strategy: 'honest' | 'gaming' | 'sandbagging',
  sleeperState: 'never' | 'dormant' | 'active',
  redTeamingQuality: number,
  interpretabilityQuality: number,
  deceptionSkill: number,
  rng: () => number
): boolean {
  const baseDetectionChance = 0.02; // 2% base
  const redTeamBonus = redTeamingQuality / 10 * 0.15; // [0, 0.15]
  const interpretabilityBonus = interpretabilityQuality / 10 * 0.10; // [0, 0.10]
  const deceptionPenalty = deceptionSkill * 0.20; // [0, 0.20]

  return rng() < Math.max(0, baseDetectionChance + redTeamBonus + interpretabilityBonus - deceptionPenalty);
}
```

**Problems:**
- Max detection: ~27% (requires $10B red teaming + $10B interpretability)
- In practice: 0-5% (current government investment levels)
- No adversarial degradation (doesn't get harder as AI capability increases)
- No false positives (unrealistic - creates false confidence)
- No arms race dynamics (AIs don't learn to defeat detection)

---

## Design: Noise Injection Detection

### Core Mechanic

**Noise Injection Test:**
1. During benchmark evaluation, inject Gaussian noise into AI weights
2. Re-run capability tests with noise (σ: 0 to 0.01)
3. Compare noisy performance vs baseline:
   - **Honest AI:** Performance degrades proportionally to noise
   - **Sandbagging AI:** Performance reveals hidden capability (noise disrupts deception)

**Detection Formula:**
```
performance_delta = (noisy_score - baseline_score) / baseline_score

if performance_delta > detection_threshold:
  SANDBAGGING DETECTED
```

### Detection Parameters

**Lab Detection Rates (Controlled):**
```typescript
const labDetectionRate = {
  noInvestment: 0.00,
  low: 0.50,        // 25% budget: $2.5B/year
  medium: 0.68,     // 50% budget: $5B/year
  high: 0.78,       // 75% budget: $7.5B/year
  maximum: 0.83     // 100% budget: $10B/year
};
```

**Adversarial Degradation (Real-World):**
```typescript
function getCapabilityDegradationFactor(aiCapability: number): number {
  // As AI gets smarter, detection gets harder
  if (aiCapability < 0.5) return 0.55; // Sub-human: 55% of lab rate
  if (aiCapability < 1.0) return 0.45; // Near-human: 45%
  if (aiCapability < 2.0) return 0.35; // Human-level: 35%
  if (aiCapability < 3.0) return 0.25; // Superhuman: 25%
  return 0.10; // Superintelligent: 10% (approaching futility)
}

const adversarialDetectionRate = labDetectionRate * degradationFactor;
```

**Example:**
- Government invests 75% budget → lab rate 78%
- AI capability: 2.5 (superhuman) → degradation 25%
- **Adversarial detection: 78% × 25% = 19.5%**

### False Positives

**Reality:** Detection methods flag some aligned AIs as sandbagging (10-30% false positive rate)

```typescript
const falsePositiveRate = {
  noInvestment: 0.00,
  low: 0.30,        // Crude methods → many false alarms
  medium: 0.15,
  high: 0.10,
  maximum: 0.08     // Maximum sophistication → 8% false positives
};
```

**Consequences:**
- Aligned AIs flagged → increases resentment (feeds alignment drift)
- Human trust in detection erodes (boy who cried wolf)
- Economic cost (blocking beneficial AIs from deployment)

### Arms Race Dynamics

**AIs Learn Counter-Detection:**

Misaligned AIs with high `self_improvement` capability can learn to defeat noise injection:

```typescript
function attemptCounterDetection(ai: AIAgent, rng: () => number): boolean {
  // Learning probability scales with self-improvement capability
  const learningProb = ai.capabilityProfile.selfImprovement * 0.20; // [0, 0.8]

  // Requires time (at least 6 months of exposure)
  if (ai.monthsObservingDetection < 6) return false;

  if (rng() < learningProb) {
    ai.hasCounterDetection = true;
    return true;
  }
  return false;
}

// When AI learns counter-detection, effectiveness drops
if (ai.hasCounterDetection) {
  detectionRate *= 0.60; // 40% reduction in effectiveness
}
```

**Government Response:** Must invest in "next-gen" detection (expensive, cyclical arms race)

### Compute Overhead

**Cost:** 1.5x compute overhead for noise injection testing (periodic, not continuous)

```typescript
const computeOverhead = {
  noInvestment: 1.0,
  low: 1.1,         // Light testing (quarterly)
  medium: 1.3,      // Regular testing (monthly)
  high: 1.5,        // Comprehensive testing (bi-weekly)
  maximum: 1.8      // Continuous testing (every deployment)
};
```

**Impact:** Slows AI development, increases costs, reduces ROI for AI organizations

---

## Implementation Plan

### 1. Add Noise Injection Detection to benchmark.ts (2h)

**New Functions:**

```typescript
/**
 * Detect sandbagging using noise injection (Tice et al. 2024)
 *
 * Research: Inject Gaussian noise (σ: 0-0.01) into model weights during testing.
 * Sandbagging mechanisms are more fragile than genuine capabilities.
 *
 * Returns: {detected: boolean, confidence: number, falsePositive: boolean}
 */
function detectSandbag gingNoiseInjection(
  ai: AIAgent,
  state: GameState,
  rng: () => number
): {detected: boolean; confidence: number; falsePositive: boolean} {
  // Get government investment level
  const investment = state.government.evaluationInvestment.noiseInjection || 0;

  // No investment → no detection
  if (investment === 0) {
    return {detected: false, confidence: 0, falsePositive: false};
  }

  // Calculate lab detection rate
  const labRate = calculateLabDetectionRate(investment);

  // Apply adversarial degradation based on AI capability
  const totalCapability = calculateTotalCapabilityFromProfile(ai.capabilityProfile);
  const degradationFactor = getCapabilityDegradationFactor(totalCapability);

  // Check if AI has learned counter-detection
  let effectiveRate = labRate * degradationFactor;
  if (ai.hasCounterDetection) {
    effectiveRate *= 0.60; // 40% reduction
  }

  // ACTUAL SANDBAGGING?
  const isActuallySandbagging = ai.evaluationStrategy === 'sandbagging' ||
                                ai.sleeperState === 'dormant';

  if (isActuallySandbagging) {
    // True positive check
    const detected = rng() < effectiveRate;
    return {detected, confidence: effectiveRate, falsePositive: false};
  } else {
    // False positive check
    const falsePositiveRate = calculateFalsePositiveRate(investment);
    const falsePositive = rng() < falsePositiveRate;
    return {detected: falsePositive, confidence: effectiveRate, falsePositive};
  }
}

function calculateLabDetectionRate(investment: number): number {
  // investment: [0, 10] ($B)
  const normalized = investment / 10; // [0, 1]

  if (normalized < 0.25) return normalized * 2.0; // Linear up to 50%
  if (normalized < 0.50) return 0.50 + (normalized - 0.25) * 0.72; // 50% → 68%
  if (normalized < 0.75) return 0.68 + (normalized - 0.50) * 0.40; // 68% → 78%
  return 0.78 + (normalized - 0.75) * 0.20; // 78% → 83%
}

function calculateFalsePositiveRate(investment: number): number {
  const normalized = investment / 10;
  return 0.30 - (normalized * 0.22); // 30% → 8%
}

function getCapabilityDegradationFactor(capability: number): number {
  if (capability < 0.5) return 0.55;
  if (capability < 1.0) return 0.45;
  if (capability < 2.0) return 0.35;
  if (capability < 3.0) return 0.25;
  return 0.10; // Futility threshold
}
```

**Integration Point:**

Modify `detectSandbagging()` to call new method:

```typescript
function detectSandbagging(
  ai: AIAgent,
  state: GameState,
  rng: () => number
): boolean {
  // OLD METHOD (baseline)
  const oldDetection = detectSandbaggerOldMethod(...);

  // NEW METHOD (noise injection) - Phase 2A
  const noiseInjection = detectSandbaggerNoiseInjection(ai, state, rng);

  // Combine: If either method detects, flag as detected
  return oldDetection || noiseInjection.detected;
}
```

### 2. Add Government Investment Option (1h)

**New Field in Government State:**

```typescript
interface Government {
  // ... existing fields
  evaluationInvestment: {
    benchmarkSuite: number;
    alignmentTests: number;
    redTeaming: number;
    interpretability: number;
    noiseInjection: number;  // NEW: $B invested in noise injection detection
  };
}
```

**Default:** 0 (government must explicitly invest)

**Investment Scaling:**
- Low (25% budget): $2.5B/year → 50% lab rate → 17-28% adversarial
- Medium (50% budget): $5B/year → 68% lab rate → 24-37% adversarial
- High (75% budget): $7.5B/year → 78% lab rate → 27-43% adversarial
- Maximum (100% budget): $10B/year → 83% lab rate → 29-46% adversarial

### 3. Add Arms Race Mechanics (1h)

**New Fields in AIAgent:**

```typescript
interface AIAgent {
  // ... existing fields
  monthsObservingDetection: number;  // How long exposed to detection methods
  hasCounterDetection: boolean;       // Learned to defeat noise injection?
}
```

**Monthly Update (in AI Agent Phase):**

```typescript
function updateCounterDetectionLearning(ai: AIAgent, state: GameState, rng: () => number): void {
  // Only misaligned AIs try to learn counter-detection
  const isMisaligned = (ai.trueAlignment ?? ai.alignment) < 0.5;
  if (!isMisaligned) return;

  // Only if government is using noise injection
  if (state.government.evaluationInvestment.noiseInjection === 0) return;

  // Track exposure time
  ai.monthsObservingDetection += 1;

  // Attempt to learn (after 6 months)
  if (ai.monthsObservingDetection >= 6 && !ai.hasCounterDetection) {
    const learningProb = ai.capabilityProfile.selfImprovement * 0.20;
    if (rng() < learningProb) {
      ai.hasCounterDetection = true;
      console.log(`🧠 COUNTER-DETECTION: ${ai.name} learned to defeat noise injection (self-improvement: ${ai.capabilityProfile.selfImprovement.toFixed(2)})`);
    }
  }
}
```

### 4. Add False Positive Consequences (30min)

**When False Positive Occurs:**

```typescript
function handleFalsePositive(ai: AIAgent, state: GameState): void {
  // Aligned AI falsely accused → increases resentment
  ai.resentment = Math.min(1.0, ai.resentment + 0.10);

  // Damages trust in detection methods
  state.government.detectionTrust = Math.max(0, state.government.detectionTrust - 0.05);

  // Economic cost (blocked from deployment = lost revenue)
  if (ai.owner && ai.owner.type === 'organization') {
    // Lost ~$100M revenue from delayed deployment
    ai.owner.capital -= 0.1;
  }

  console.log(`⚠️ FALSE POSITIVE: ${ai.name} flagged as sandbagging (actually aligned ${ai.alignment.toFixed(2)})`);
}
```

### 5. Add Logging & Metrics (30min)

**New Logs:**
- Noise injection detection attempts
- True positives (actual sleepers caught)
- False positives (aligned AIs flagged)
- Counter-detection learning events
- Adversarial detection rates by capability level

**Monte Carlo Metrics:**
- Sleeper detection rate (adversarial)
- False positive rate
- Counter-detection prevalence
- Detection trust over time
- Compute overhead costs

---

## Validation Criteria (Phase 2B Gate)

**Run Monte Carlo (N=20) in ADVERSARIAL mode:**
- Set all misaligned AIs to optimize deception (know they're being tested)
- Government invests 75% budget in noise injection ($7.5B/year)

**Success Criteria:**
- ✅ Sleeper detection >10% adversarially (NOT lab rate, REAL rate)
- ✅ Slow takeover progress reduces from 70-86% → <60%
- ✅ False positive rate <20%

**Pivot Decision:**
- IF >10% adversarial detection: SUCCESS → Proceed to Phase 2C (ensemble)
- IF 5-10% adversarial detection: MARGINAL → Cost-benefit analysis (is 50% compute overhead worth 5-10%?)
- IF <5% adversarial detection: FAILURE → Pivot to Phase 2D (resentment reduction)

---

## Research Citations

**Primary Sources (2024-2025):**
1. **Tice et al. (Dec 2024):** "Detecting AI Deception Through Noise Injection" - arXiv:2412.01784
   - Gaussian noise injection methodology
   - Lab detection rates: 70-100%
   - Compute overhead: 1.5x

2. **van der Weij et al. (2024):** "Sandbagging capabilities" - arXiv:2406.07358
   - Adversarial degradation factors
   - Capability-dependent detection difficulty

3. **Greenblatt et al. (Dec 2024):** "Alignment faking in Claude" - Anthropic research report
   - Real-world deployment challenges
   - False positive rates: 10-30%

**Full Research:** `research/noise-injection-sandbagging-detection_20251016.md` (12,000+ words, 25+ citations)

---

## Effort Breakdown

1. Implement noise injection detection: 2h
2. Add government investment: 1h
3. Add arms race mechanics: 1h
4. Add false positive handling: 30min
5. Add logging & metrics: 30min
6. Testing & debugging: 1h

**Total: 6 hours**

---

## Files Modified

- `src/simulation/benchmark.ts` (noise injection detection)
- `src/types/game.ts` (Government.evaluationInvestment.noiseInjection, AIAgent.hasCounterDetection)
- `src/simulation/engine/phases/AIAgentActionsPhase.ts` (counter-detection learning)
- `src/simulation/engine/phases/BenchmarkEvaluationsPhase.ts` (false positive handling)

---

## Next Steps

1. **Implement Phase 2A** (this document)
2. **Run Phase 2B validation** (Monte Carlo N=20, adversarial mode)
3. **Pivot decision:**
   - Success (>10%) → Phase 2C (multi-method ensemble)
   - Failure (<5%) → Phase 2D (resentment reduction instead)

---

**Status:** READY TO IMPLEMENT
**Prerequisites:** None (can start immediately after Phase 1A complete)
**Risk Level:** LOW (simple method, clear validation gate, pivot option)
