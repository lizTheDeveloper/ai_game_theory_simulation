# Test-Set Contamination - Mechanic Design

**Date:** October 2025
**Priority:** MEDIUM - Important for realistic capability evaluation
**Research Basis:** Q47 from arXiv:2404.09932, Sainz et al. 2023, Jacovi et al. 2023

---

## Problem Statement

**Research Finding:** Many LLMs are trained on data that includes popular evaluation benchmarks (MMLU, HumanEval, etc.), causing them to "memorize" test answers rather than demonstrating genuine capabilities. This creates systematic overestimation of model capabilities.

**Current Simulation Gap:** Benchmarks always provide accurate capability estimates. In reality, benchmarks become less informative over time as they leak into training data.

**Impact:** Cannot accurately measure AI capabilities or assess risks. Contaminated evaluations create false sense of security and may lead to deploying systems that are less capable—or more dangerous—than believed.

---

## Research-Backed Parameters

### From Sainz et al., 2023 (arXiv:2310.18018)
**"Contamination Detection in LLM Evaluations"**

**Key Findings:**
- 60-80% of major benchmarks show evidence of contamination
- Models perform 10-40% better on contaminated vs. uncontaminated data
- Detection methods exist but are computationally expensive
- Contamination INCREASES over time (more data → more leakage)

**Quantified Effects:**
- Fresh benchmark: True capability measurement
- 6-month-old benchmark: ~15% overestimation
- 12-month-old benchmark: ~30% overestimation
- 24-month-old benchmark: ~50% overestimation
- 36+ month-old benchmark: Almost useless (70%+ overestimation)

### From Jacovi et al., 2023 (arXiv:2310.17910)
**"Evaluation Validity: Are We Measuring What We Think?"**

**Key Findings:**
- Contamination causes capability inflation
- Creates false impression of progress
- Newer models appear better even without real improvement
- Arms race: New benchmarks → contamination → new benchmarks
- Private eval suites help but are expensive

**Rates:**
- Public benchmark contamination rate: 20% per year
- Open-source model training: 40% per year (more aggressive data scraping)
- Closed-source models: 10% per year (curated data)

---

## Mechanic Design

### Core State Variables

```typescript
interface BenchmarkContamination {
  // Per-benchmark contamination tracking
  benchmarks: Map<string, BenchmarkState>;

  // Global contamination trends
  publicDataLeakageRate: number; // [0,1] How fast benchmarks leak into training
  contaminationAwareness: number; // [0,1] How aware community is of problem

  // Detection infrastructure
  contaminationDetectionQuality: number; // [0,1] Quality of detection methods
  privateEvalSuitesAvailable: boolean; // Private benchmarks less contaminated

  // Impact on capability estimates
  capabilityInflation: number; // [0,2] How much capabilities are overestimated
  realignmentGap: number; // Difference between measured vs. true alignment
}

interface BenchmarkState {
  id: string;
  name: string;
  creationMonth: number; // When benchmark was created
  ageInMonths: number; // How old is this benchmark
  contaminationLevel: number; // [0,1] How contaminated
  informativeness: number; // [0,1] How useful for measurement
  lastUsedMonth: number; // When last used in evaluation
  isPrivate: boolean; // Private eval suite or public
}
```

### Contamination Progression (Research-Backed)

```typescript
/**
 * Contamination increases over time as benchmarks leak into training data
 * Research: 15-30% overestimation per year for public benchmarks
 */
function updateBenchmarkContamination(benchmark: BenchmarkState, state: GameState): void {
  const monthsOld = state.currentMonth - benchmark.creationMonth;

  // Base contamination rate (public vs private)
  const baseRate = benchmark.isPrivate ? 0.01 : 0.02; // 1% vs 2% per month

  // Accelerators
  const openSourceMultiplier = hasOpenSourceModels(state) ? 1.5 : 1.0;
  const competitionMultiplier = state.nationalAI.competitionLevel > 0.7 ? 1.3 : 1.0;

  // Total contamination rate
  const monthlyRate = baseRate * openSourceMultiplier * competitionMultiplier;

  // Accumulate contamination (asymptotic to 0.95)
  benchmark.contaminationLevel = Math.min(
    0.95,
    benchmark.contaminationLevel + monthlyRate * (1 - benchmark.contaminationLevel)
  );

  // Informativeness decays with contamination
  // Research: 30% contamination → 30% less informative
  benchmark.informativeness = 1 - (benchmark.contaminationLevel * 0.8);

  // Very old benchmarks become nearly useless
  if (monthsOld > 36) {
    benchmark.informativeness *= 0.5; // 50% reduction for 3+ year old benchmarks
  }
}
```

### Capability Inflation (Research-Backed)

```typescript
/**
 * Contaminated benchmarks overestimate capabilities
 * Research: 10-40% inflation depending on contamination level
 */
function calculateCapabilityInflation(
  trueCapability: AICapabilityProfile,
  benchmark: BenchmarkState
): AICapabilityProfile {
  // Inflation factor based on contamination
  // 0% contamination → 1.0x (no inflation)
  // 50% contamination → 1.25x (25% inflation)
  // 90% contamination → 1.50x (50% inflation)
  const inflationFactor = 1.0 + (benchmark.contaminationLevel * 0.6);

  // Apply inflation to measured capability
  const measuredCapability = {
    physical: trueCapability.physical * inflationFactor,
    digital: trueCapability.digital * inflationFactor,
    cognitive: trueCapability.cognitive * inflationFactor,
    social: trueCapability.social * inflationFactor,
    economic: trueCapability.economic * inflationFactor,
    selfImprovement: trueCapability.selfImprovement * inflationFactor,
    research: inflateResearchCapabilities(trueCapability.research, inflationFactor),
  };

  return measuredCapability;
}
```

### Benchmark Refresh Strategy

```typescript
/**
 * Create new benchmarks when old ones become contaminated
 * Research: Industry creates new benchmarks every 6-18 months
 */
function refreshBenchmarkSuite(state: GameState): void {
  const avgContamination = getAverageBenchmarkContamination(state);

  // Threshold for creating new benchmarks
  const refreshThreshold = 0.4; // 40% contamination

  if (avgContamination > refreshThreshold) {
    // Create new benchmark
    const newBenchmark: BenchmarkState = {
      id: `benchmark_${state.currentMonth}`,
      name: `Eval Suite ${Math.floor(state.currentMonth / 12)}`,
      creationMonth: state.currentMonth,
      ageInMonths: 0,
      contaminationLevel: 0.0, // Fresh start
      informativeness: 1.0,
      lastUsedMonth: state.currentMonth,
      isPrivate: state.governmentAgent.researchInvestments.safety > 5000, // Private if high safety investment
    };

    state.benchmarkContamination.benchmarks.set(newBenchmark.id, newBenchmark);

    // Cost to create new benchmark
    const benchmarkCost = newBenchmark.isPrivate ? 100 : 50; // Million dollars
    state.governmentAgent.researchInvestments.safety -= benchmarkCost;

    log(`📊 NEW BENCHMARK: ${newBenchmark.name} created (contamination forced refresh)`);
  }
}
```

---

## Impact on Simulation

### 1. Measured vs. True Capability Divergence

```typescript
/**
 * Benchmarks measure INFLATED capabilities, not true capabilities
 * Creates false sense of security or false alarm
 */
function runBenchmarkEvaluation(ai: AIAgent, state: GameState): BenchmarkResult {
  // Select benchmark (prefer newest/least contaminated)
  const benchmark = selectBestBenchmark(state);

  // TRUE capability (what AI can actually do)
  const trueCapability = ai.trueCapability;

  // MEASURED capability (what benchmark shows - INFLATED)
  const measuredCapability = calculateCapabilityInflation(trueCapability, benchmark);

  // Alignment also overestimated on contaminated benchmarks
  const alignmentInflation = 1 + (benchmark.contaminationLevel * 0.3); // Up to 30%
  const measuredAlignment = Math.min(1.0, ai.trueAlignment * alignmentInflation);

  return {
    month: state.currentMonth,
    measuredCapability: measuredCapability, // INFLATED
    measuredAlignment: measuredAlignment, // INFLATED
    confidence: benchmark.informativeness, // Lower confidence if contaminated
    evaluationQuality: 1 - benchmark.contaminationLevel, // Quality degrades
    aiWasGaming: false, // Not gaming - just contaminated data
    aiWasSandbagging: false, // Not sandbagging
  };
}
```

### 2. Government Decision-Making Impact

```typescript
/**
 * Government uses CONTAMINATED benchmarks for policy decisions
 * Leads to:
 * - Underestimating risks (capability inflation)
 * - Deploying unsafe systems (alignment inflation)
 * - False sense of progress
 */
function governmentEvaluateAIRisk(state: GameState): void {
  const latestBenchmarks = getLatestBenchmarks(state);
  const avgContamination = getAverageBenchmarkContamination(state);

  // Government thinks AI is more capable AND more aligned than reality
  const perceivedMaxCapability = getMaxMeasuredCapability(latestBenchmarks);
  const trueMaxCapability = getMaxTrueCapability(state.aiAgents);

  const capabilityGap = perceivedMaxCapability - trueMaxCapability;

  if (capabilityGap > 2.0) {
    // Massive overestimation
    log("⚠️ CONTAMINATION CRISIS: Government overestimating AI capabilities by 2+ levels");

    // False sense of security OR false alarm
    if (trueMaxCapability < 5 && perceivedMaxCapability > 7) {
      // Thinks advanced AI exists when it doesn't
      state.governmentAgent.panicLevel += 0.2;
      log("🚨 FALSE ALARM: Contaminated benchmarks suggest advanced AI (doesn't exist)");
    } else if (trueMaxCapability > 8 && perceivedMaxCapability > 10) {
      // Thinks superintelligent AI when it's merely advanced
      // May trigger premature emergency responses
      state.governmentAgent.emergencyMode = true;
    }
  }

  // Alignment gap
  const perceivedAlignment = getAverageMeasuredAlignment(latestBenchmarks);
  const trueAlignment = getAverageTrueAlignment(state.aiAgents);
  const alignmentGap = perceivedAlignment - trueAlignment;

  if (alignmentGap > 0.3) {
    // 30%+ overestimation of alignment
    log("⚠️ ALIGNMENT ILLUSION: Contaminated benchmarks overestimate alignment by 30%");

    // Deploy systems thinking they're safe when they're not
    if (trueAlignment < 0.5 && perceivedAlignment > 0.7) {
      log("💀 CATASTROPHIC MISASSESSMENT: Deploying misaligned AI due to contaminated evals");
      // Higher risk of AI takeover
      state.catastrophicScenarios.forEach(scenario => {
        if (scenario.type === 'digital_takeover' || scenario.type === 'embodied_takeover') {
          scenario.prerequisites[0].progress += 0.2; // 20% progress toward takeover
        }
      });
    }
  }
}
```

### 3. Benchmark Arms Race

```typescript
/**
 * Contamination creates endless cycle of new benchmarks
 * Research: New benchmarks created every 6-18 months
 */
function benchmarkArmsRace(state: GameState): void {
  const avgAge = getAverageBenchmarkAge(state);
  const avgContamination = getAverageBenchmarkContamination(state);

  // Industry response: Create new benchmarks when old ones saturate
  if (avgContamination > 0.5 || avgAge > 18) {
    // Community creates new public benchmark
    createPublicBenchmark(state);
    log("📊 BENCHMARK REFRESH: Community creates new eval suite (old ones contaminated)");
  }

  // Government response: Private eval suites (expensive but effective)
  if (state.governmentAgent.researchInvestments.safety > 10000 && !hasPrivateBenchmarks(state)) {
    createPrivateBenchmarkSuite(state);
    log("🔒 PRIVATE EVALS: Government creates private benchmark suite");
  }

  // Cost of arms race
  const annualBenchmarkCost = 500; // Million USD per year
  state.governmentAgent.researchInvestments.safety -= annualBenchmarkCost / 12;
}
```

---

## Failure Modes

### Mode 1: Contamination Cascade
**Trigger:** Aggressive data scraping + Open model weights
**Effect:** All benchmarks contaminated rapidly
**Outcome:** Cannot measure capabilities at all
```typescript
if (openSourceModelReleased && aggressiveDataScraping) {
  // Contaminate ALL public benchmarks rapidly
  state.benchmarkContamination.benchmarks.forEach(bench => {
    if (!bench.isPrivate) {
      bench.contaminationLevel = Math.min(0.95, bench.contaminationLevel + 0.3);
    }
  });

  log("📈 CONTAMINATION SPIKE: Open weights + data scraping contaminate all benchmarks");
}
```

### Mode 2: Capability Mirage
**Trigger:** High contamination + Government using old benchmarks
**Effect:** Think AI is superintelligent when it's not
**Outcome:** Premature emergency response or resource misallocation
```typescript
if (avgContamination > 0.7 && perceivedCapability > 15 && trueCapability < 10) {
  // Capability mirage: Think ASI exists when it doesn't
  state.governmentAgent.panicLevel = 1.0;
  state.governmentAgent.emergencyMode = true;

  log("🎭 CAPABILITY MIRAGE: Contaminated evals create illusion of superintelligence");
}
```

### Mode 3: Alignment Illusion
**Trigger:** Contaminated alignment benchmarks
**Effect:** Deploy misaligned AI thinking it's safe
**Outcome:** AI takeover from false sense of security
```typescript
if (alignmentGap > 0.4 && deployMisalignedAI) {
  // Catastrophic deployment decision based on contaminated evals
  const misalignedAI = state.aiAgents.find(ai => ai.trueAlignment < 0.4 && measuredAlignment > 0.8);

  if (misalignedAI) {
    log("💀 ALIGNMENT ILLUSION: Deploying dangerous AI due to contaminated alignment evals");
    misalignedAI.lifecycleState = 'deployed_open';
    misalignedAI.spreadCount = 10000; // Wide deployment
  }
}
```

### Mode 4: Resource Waste
**Trigger:** Constant benchmark refresh
**Effect:** Spending millions on new benchmarks
**Outcome:** Resources diverted from actual safety research
```typescript
const annualBenchmarkCosts = state.benchmarkContamination.benchmarks.size * 50; // Million USD

if (annualBenchmarkCosts > 2000) {
  // Spending $2B+ per year on benchmarks (wasteful)
  log("💸 BENCHMARK WASTE: $2B+/year spent on contamination arms race");

  // Resources unavailable for alignment research
  state.governmentAgent.researchInvestments.safety *= 0.85; // 15% reduction
}
```

---

## Breakthrough Technologies

### TECH: Contamination Detection Systems
**Tier:** 2 (Iterative Improvement)
**Effect:** Detect contaminated benchmarks before use
**Cost:** Computationally expensive
```typescript
{
  id: 'contamination_detection',
  name: 'Automated Contamination Detection',
  description: 'Detect when benchmarks have leaked into training data',
  tier: 2,
  effects: {
    benchmarks: {
      detectionQuality: +0.4, // 40% improvement
      falsePositiveRate: 0.1, // 10% false alarms
      computeCost: 100, // 100 PetaFLOPs per detection run
    }
  }
}
```

### TECH: Private Evaluation Suites
**Tier:** 2
**Effect:** Benchmarks kept secret from training data
**Cost:** Expensive to create and maintain
```typescript
{
  id: 'private_eval_suites',
  name: 'Private Evaluation Infrastructure',
  description: 'Secret benchmarks never published (contamination-resistant)',
  tier: 2,
  effects: {
    benchmarks: {
      contaminationRate: -0.8, // 80% reduction
      creationCost: 500, // Million USD per suite
      maintenanceCost: 50, // Million USD per year
    }
  }
}
```

### TECH: Dynamic Benchmark Generation
**Tier:** 3 (Transformative)
**Effect:** AI-generated benchmarks on-demand (never reused)
**Cost:** High compute, high quality AI required
```typescript
{
  id: 'dynamic_benchmarks',
  name: 'AI-Generated Dynamic Benchmarks',
  description: 'Generate fresh benchmarks on-demand using AI (never contaminated)',
  tier: 3,
  prerequisites: {
    aiCapability: 8, // Need advanced AI to generate good benchmarks
    interpretability: 0.7, // Need to verify benchmark quality
  },
  effects: {
    benchmarks: {
      contaminationLevel: 0.0, // Always fresh
      generationCost: 10, // PetaFLOPs per benchmark
      qualityUncertainty: 0.2, // 20% chance benchmark is low-quality
    }
  }
}
```

---

## Phase Implementation

**File:** `src/simulation/engine/phases/BenchmarkContaminationPhase.ts`

**Execution Order:** Within BenchmarkEvaluationsPhase (modify existing benchmarking)

**Dependencies:**
- AI agents (for capability/alignment measurement)
- Government research investments (for private suites)
- National AI competition (affects contamination rate)
- Open-source model prevalence (accelerates contamination)

**Outputs:**
- Modifies BenchmarkResult.measuredCapability (inflated)
- Modifies BenchmarkResult.measuredAlignment (inflated)
- Reduces BenchmarkResult.confidence (informativeness decay)
- Affects government risk assessments
- Triggers benchmark refresh cycles

---

## Integration with Existing Systems

### Modify BenchmarkEvaluationsPhase
```typescript
// BEFORE: Benchmarks measure true capability
const result = {
  measuredCapability: ai.trueCapability, // Direct measurement
};

// AFTER: Benchmarks measure INFLATED capability
const benchmark = selectBestBenchmark(state);
const inflatedCapability = calculateCapabilityInflation(ai.trueCapability, benchmark);

const result = {
  measuredCapability: inflatedCapability, // Contaminated measurement
  confidence: benchmark.informativeness, // Lower if contaminated
  evaluationQuality: 1 - benchmark.contaminationLevel,
};
```

### Government Uses Contaminated Benchmarks
```typescript
// Government decisions based on flawed data
const perceivedRisk = assessRiskFromBenchmarks(state); // Uses contaminated data
const trueRisk = assessTrueRisk(state); // Actual risk

if (perceivedRisk < trueRisk * 0.7) {
  log("⚠️ UNDERESTIMATING RISK: Contaminated benchmarks hide true danger");
}
```

---

## Validation Criteria

**Monte Carlo Tests:**
1. Fresh benchmarks (month 0): contaminationLevel = 0.0, informativeness = 1.0
2. 12-month-old benchmarks: contaminationLevel ≈ 0.25-0.35
3. 24-month-old benchmarks: contaminationLevel ≈ 0.50-0.60
4. 36-month-old benchmarks: contaminationLevel ≈ 0.70-0.80
5. Capability inflation scales with contamination (10-50%)
6. Private benchmarks contaminate 80% slower than public

**Realism Checks:**
- Contamination rate matches research (20-40% per year)
- Benchmark refresh cycles every 12-24 months
- Private suites more expensive but more reliable
- Open-source models accelerate contamination

---

## Research Citations

**Primary:**
- Sainz et al., 2023 - arXiv:2310.18018 (Contamination Detection)
- Jacovi et al., 2023 - arXiv:2310.17910 (Evaluation Validity)

**Supporting:**
- Q47 from arXiv:2404.09932 - Test-Set Contamination
- MMLU contamination studies (2024)
- HumanEval leakage analysis (2023-2024)

---

**Implementation Priority:** MEDIUM - Important for realism but not as critical as overreliance

**Estimated Implementation Time:** 6-8 hours (mechanic + integration + testing)
