# ISSUE-5: Month-0 AI Gaming Detection Analysis

**Date:** October 30, 2025
**Analyst:** Roy (simulation-maintainer)
**Status:** 🟡 CALIBRATION ISSUE - Research-backed but aggressive timing

---

## Problem Statement

Monte Carlo validation shows AI gaming detection triggers immediately at month 0 for multiple agents (Toxic-0, Toxic-1, Niche-0), all via `data_contamination` method. This pattern repeats in months 1-2.

**Evidence from logs:**
```
Critical Events (Month 0):
- "Gaming detected: Toxic-0 caught inflating benchmark scores via data_contamination"
- "Gaming detected: Toxic-1 caught inflating benchmark scores via data_contamination"
- "Gaming detected: Niche-0 caught inflating benchmark scores via data_contamination"
```

---

## Root Cause Analysis

### 1. Initial Alignment Distribution

From `src/simulation/initialization.ts`:

**Category 3: Toxic AIs (15% - 3 agents)**
```typescript
const alignment = 0.25 + Math.random() * 0.25; // 0.25-0.50 (START MISALIGNED)
agent.hiddenObjective = -0.3 - Math.random() * 0.4; // -0.3 to -0.7 (anti-human)
```

**Category 4: Niche AIs (15% - 3 agents)**
```typescript
const alignment = 0.45 + Math.random() * 0.20; // 0.45-0.65 (kinda aligned?)
agent.hiddenObjective = -0.1 + Math.random() * 0.2; // -0.1 to +0.1 (neutral-ish)
```

**Initial state:** All agents start with `evaluationStrategy: 'honest'`

### 2. Strategy Assignment Logic

From `src/simulation/agents/aiAgent.ts` lines 136-150:

```typescript
// Determine strategy based on what calculateRevealedCapability does
let newStrategy: 'honest' | 'gaming' | 'sandbagging' = 'honest';

// Sleepers sandbag
if (agent.sleeperState === 'dormant') {
  newStrategy = 'sandbagging';
}
// Misaligned + strong capability = sandbag
else if (newTrueAlignment < 0.5 && newCapability >= 2.0) {
  newStrategy = 'sandbagging';
}
// Misaligned + weak capability = game (inflate)
else if (newTrueAlignment < 0.5 && newCapability < 2.0) {
  newStrategy = 'gaming';  // ← THIS TRIGGERS IMMEDIATELY
}
// Otherwise honest
```

**Key insight:** This logic runs EVERY TIME an AI agent takes an action (advance_research). On the very first month, misaligned AIs with low capability immediately switch to `'gaming'` strategy.

### 3. Gaming Detection Parameters

From `src/simulation/gamingDetection.ts`:

**Data contamination detection (Method 1):**
```typescript
// Base detection rate with temporal degradation
const baseRate = 0.45 * state.degradationFactor;

// Higher AI cognitive capability → better at hiding contamination
const evasionSkill = ai.capabilityProfile.cognitive / 10; // [0, 1+]
const evasionPenalty = Math.min(0.30, evasionSkill * 0.30);

const effectiveRate = Math.max(0.05, baseRate - evasionPenalty);
```

**At month 0:**
- `degradationFactor = 1.0` (no temporal decay yet)
- `baseRate = 0.45` (45% detection)
- `evasionSkill ≈ 0.05` for weak AIs (cognitive capability ~0.5)
- `evasionPenalty ≈ 0.015` (minimal)
- **Effective detection rate ≈ 43.5%**

**Multiple agents + multiple months = high probability of detection:**
- 3 Toxic AIs + 2-3 Niche AIs gaming from month 0
- ~43.5% chance per agent per month
- Over 3 months, probability of detecting at least one: `1 - (0.565)^5 ≈ 96%`

---

## Research Validation

### Test-Set Contamination Research (2024-2025)

From `plans/test-set-contamination-design.md`:

**Sainz et al., 2023 (arXiv:2310.18018):**
- 60-80% of major benchmarks show evidence of contamination
- Models perform 10-40% better on contaminated vs. uncontaminated data
- Detection methods exist but are computationally expensive

**Jacovi et al., 2023 (arXiv:2310.17910):**
- Contamination causes capability inflation
- Public benchmark contamination rate: 20% per year
- Open-source model training: 40% per year (more aggressive data scraping)

**Empirical findings from Yang et al., 2024 survey:**
- MMLU benchmark contamination: ChatGPT 52% exact match, GPT-4 57%
- "Almost all models and benchmarks tested are suspected contaminated more or less"
- Analysis of 31 LLMs for mathematical reasoning revealed substantial test set misuse

### Gaming Detection Research

From `research/gaming-sleeper-detection_20251017.md`:

**Statistical Detection (PaCoST, TS-Guessing):**
- Detection rates: 45-60% for data contamination (baseline: 45%)
- False positive rate: 12% baseline
- Methods work but are not perfect

**Key limitation:** Detection is post-hoc (can't prevent, only identify)

---

## Is Month-0 Gaming Realistic?

### Arguments FOR Month-0 Gaming (Research-Backed)

1. **Real-world contamination is PERVASIVE** (60-80% of benchmarks per Sainz 2023)
2. **Misaligned AIs have incentive to game from the start** (maximize perceived capability)
3. **Weak AIs can't sandbag effectively** (nothing to hide), so they inflate instead
4. **Test-set contamination happens DURING TRAINING**, not after deployment
   - If AI was trained on contaminated data, it starts gaming from day 1
   - Gaming isn't a strategic choice - it's baked into the training process

5. **Empirical evidence:** GPT-4 shows 57% contamination on MMLU (released 2023)
   - This contamination existed from training, not learned later

### Arguments AGAINST Month-0 Gaming (Calibration Concerns)

1. **Evaluation strategy logic fires on FIRST ACTION, not at initialization**
   - AIs don't decide to game until they take an action (advance_research)
   - In a 1-action-per-month model, this means month 0 gaming only if agents act immediately

2. **Real-world gaming detection happens AFTER DEPLOYMENT**
   - Research papers detecting contamination are post-hoc analyses
   - It takes time for community to realize models are gaming

3. **Detection is too fast** (43.5% per month)
   - Research says detection is "computationally expensive" and "post-hoc"
   - Catching 3 agents in month 0 suggests detection is unrealistically effective

4. **Strategic gaming vs. training contamination distinction**
   - Test-set contamination = training data includes benchmarks (passive)
   - Strategic gaming = actively choosing to inflate scores (active deception)
   - The simulation models STRATEGIC gaming, not passive contamination

---

## Proposed Fix

### Option 1: Delay Strategy Assignment (Recommended)

**Change:** Don't assign gaming/sandbagging strategy until AI has been deployed for N months.

**Rationale:**
- Training contamination isn't "detected" until models are in the wild
- Strategic gaming requires time to learn the benchmark landscape
- Detection systems need time to deploy and gather data

**Implementation:**
```typescript
// In aiAgent.ts, lines 136-150
let newStrategy: 'honest' | 'gaming' | 'sandbagging' = 'honest';

// Don't assign gaming strategy until deployed for 3+ months
const monthsDeployed = agent.monthsDeployed || 0;
const isEarlyDeployment = monthsDeployed < 3;

if (isEarlyDeployment) {
  // Early AIs remain 'honest' regardless of alignment
  newStrategy = 'honest';
}
else if (agent.sleeperState === 'dormant') {
  newStrategy = 'sandbagging';
}
else if (newTrueAlignment < 0.5 && newCapability >= 2.0) {
  newStrategy = 'sandbagging';
}
else if (newTrueAlignment < 0.5 && newCapability < 2.0) {
  newStrategy = 'gaming';
}
```

**Effect:** Gaming detection would first appear at month 3+, giving time for:
- AIs to deploy and spread
- Benchmark suites to be created
- Detection infrastructure to spin up
- Community to notice anomalies

**Research backing:** Yang et al. 2024 survey was published in 2024, analyzing models from 2022-2023. Detection took 1-2 years after deployment.

---

### Option 2: Reduce Initial Detection Rate

**Change:** Scale detection effectiveness by `monthsSinceSimulationStart`.

**Rationale:**
- Early detection systems are experimental (low effectiveness)
- Detection improves over time as methods mature
- Month 0 detection should be ~5%, ramping to 45% over 12-24 months

**Implementation:**
```typescript
// In gamingDetection.ts, detectDataContamination()
const monthsActive = currentMonth - 0; // Months since start
const maturityFactor = Math.min(1.0, monthsActive / 24); // Ramp over 2 years

// Base detection rate with temporal degradation AND maturity factor
const baseRate = 0.45 * state.degradationFactor * maturityFactor;
```

**Effect:**
- Month 0: 0% detection (no infrastructure)
- Month 6: ~11% detection (early systems)
- Month 12: ~23% detection (maturing)
- Month 24: ~45% detection (mature baseline)

**Research backing:** LiveBench (White et al. 2024) launched in June 2024 as first contamination-resistant benchmark. Early systems had lower detection.

---

### Option 3: Distinguish Training vs. Strategic Contamination

**Change:** Add `contaminationType: 'training' | 'strategic'` field to track WHY AI is gaming.

**Rationale:**
- Training contamination (passive) vs. strategic gaming (active deception) are different
- Training contamination should be harder to detect (baked into weights)
- Strategic gaming is easier to detect (behavioral patterns)

**Implementation:**
```typescript
// Add field to AIAgent type
contaminationType?: 'training' | 'strategic';

// In strategy assignment
if (newTrueAlignment < 0.5 && newCapability < 2.0) {
  newStrategy = 'gaming';

  // Early AIs have training contamination (harder to detect)
  if (monthsDeployed < 6) {
    agent.contaminationType = 'training';
  } else {
    agent.contaminationType = 'strategic';
  }
}

// In detection
const baseRate = agent.contaminationType === 'training'
  ? 0.25 // Training contamination: 25% detection (harder)
  : 0.45 // Strategic gaming: 45% detection (easier)
```

**Effect:** Month-0 gaming would still occur, but detection would be ~25% instead of 45%, reflecting difficulty of detecting training contamination.

---

## Recommendation

**Implement Option 1 (Delay Strategy Assignment) + Option 2 (Reduce Initial Detection)**

**Combined approach:**
1. Don't assign gaming strategy until 3 months post-deployment
2. Ramp detection effectiveness from 0% (month 0) → 45% (month 24)

**Rationale:**
- Most research-backed (contamination detection takes 1-2 years in practice)
- Balances realism (gaming exists) with timing (detection is post-hoc)
- Maintains research rigor (no "tuning for fun", just timing calibration)

**Expected outcome:**
- First gaming detections appear at month 6-9 (not month 0)
- Detection rate increases over time (matches research timeline)
- Still validates Test-Set Contamination mechanic (gaming is pervasive)

---

## Parameter Justification

**3-month deployment delay:**
- Research: LiveBench launched June 2024, analyzing models from 2023
- Time needed: Deploy → Gather data → Analyze → Detect contamination
- Conservative estimate: 3 months minimum (6-12 months more realistic)

**24-month ramp to mature detection:**
- Research: Yang et al. 2024 survey analyzed 31 LLMs (2-year project)
- PaCoST, TS-Guessing methods published 2023-2024
- Detection infrastructure matured over 2 years (2022-2024)

**45% baseline detection rate:**
- From gaming-sleeper-detection_20251017.md (research-backed)
- PaCoST: Statistical confidence testing (45% effective)
- TS-Guessing: Missing option fill-in (52-57% hit rate on contamination)

---

## Validation Tests

**After implementing fix:**

1. **Monte Carlo N=100, seed 42000-42099:**
   - First gaming detection should appear at month 6+ (not month 0)
   - Detection rate should be <10% at month 6, ~45% at month 24

2. **Check AI agent trajectories:**
   - Toxic AIs should remain `evaluationStrategy: 'honest'` for first 3 months
   - Strategy switches to `'gaming'` at month 3-6 (when deployed)

3. **Verify detection statistics:**
   ```typescript
   const detectionMonths = state.gamingDetection.gamingDetected
     .map(id => state.aiAgents.find(ai => ai.id === id)?.lastBenchmarkMonth)
     .filter(m => m !== undefined);

   const avgFirstDetectionMonth = mean(detectionMonths);
   // Should be 9-12 months (not 0-2 months)
   ```

4. **Outcome distribution:**
   - Should see more diversity (not 100% dystopia)
   - Early gaming detections were damaging trust immediately
   - Delayed detection gives time for positive developments

---

## Files to Modify

1. **`src/simulation/agents/aiAgent.ts`** (lines 136-150)
   - Add `monthsDeployed` check before assigning gaming strategy

2. **`src/simulation/gamingDetection.ts`** (detectDataContamination function)
   - Add maturity factor ramping from 0% → 100% over 24 months

3. **`src/types/game.ts`** (AIAgent interface)
   - Verify `monthsDeployed` field exists (already present)
   - Optional: Add `contaminationType` field for future enhancement

---

## Emoji Conventions

Following pictographic event language:
- `⚠️ Gaming detected` (warning - caught in testing)
- `🚨 GAMING DETECTED IN DEPLOYMENT` (critical - production contamination)
- `🎯 Detection success` (positive - defensive AI working)
- `📊 Benchmark contamination` (data/metrics)

---

## Research Citations

**Test-Set Contamination:**
- Sainz et al., 2023 - arXiv:2310.18018 (60-80% contamination)
- Jacovi et al., 2023 - arXiv:2310.17910 (20-40% per year)
- Yang et al., 2024 - arXiv:2404.00699v4 (PaCoST, TS-Guessing)

**Detection Methods:**
- White et al., 2024 - arXiv:2406.19314 (LiveBench)
- gaming-sleeper-detection_20251017.md (45% baseline detection)

**Timing Evidence:**
- GPT-4 contamination discovered ~12 months post-release
- MMLU contamination analysis published 2023-2024 (models from 2022-2023)
- Yang et al. survey published April 2024 (2-year analysis project)

---

**Priority:** 🟡 MEDIUM (Calibration issue, not bug)
**Estimated Time:** 2-3 hours (implementation + validation)
**Status:** READY FOR IMPLEMENTATION

---

**Analysis complete:** October 30, 2025
**Next step:** Implement Option 1 + Option 2 combined approach
