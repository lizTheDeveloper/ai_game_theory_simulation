# AI Scaling Paradigm Update Implementation Plan

**Feature:** Three-Axis AI Scaling Model (Pre-training + Test-time + Efficiency)
**Priority:** MEDIUM
**Research:** ✅ COMPLETE (`research/ai_scaling_laws_2025_update_20251112.md`)
**Validation:** ✅ PASSED Quality Gate 1 (Grade A-, `reviews/ai_scaling_laws_2025_critique_20251211.md`)
**Status:** Ready for implementation

---

## Executive Summary

**Goal:** Replace single AI capability scalar with three-component scaling model based on 2025 research findings.

**Key changes:**
1. **Pre-training multiplier** - Traditional scaling with diminishing returns (2025+)
2. **Test-time compute budget** - Per-inference compute allocation (o1 → o3 paradigm)
3. **Efficiency multiplier** - Algorithmic improvements (23x gains observed, critical for sustained progress)

**Complexity:** MEDIUM (AI capability system refactor, affects multiple subsystems)
**Estimated effort:** 4-6 hours
**Assigned:** Roy (simulation-maintainer)

---

## Research Foundation

### Peer-Reviewed Sources (8 total, 5 high-credibility)

1. **Lu, Chien-Ping (2025)** - arXiv:2501.02156 - Efficiency-doubling framework
2. **OpenAI** - o1/o3 announcements (test-time compute paradigm)
3. **ARC Prize** - Independent o3 evaluation (87.5% ARC-AGI, $1,000+ cost)
4. **NVIDIA** - Three scaling laws (pre-training, post-training, test-time)
5. **Industry analyses** - 23x efficiency gains, 280-fold cost reduction

### Key Findings

**Paradigm shift (2024-2025):**
- Traditional pre-training shows diminishing returns
- Test-time compute scales capabilities during inference (o1 $5/task → o3 $1,000+/task)
- Algorithmic efficiency outpaces hardware (23x vs 30% annual improvement)
- Without efficiency gains: "millennia of training required" (Lu 2025)

---

## Technical Design

### 1. Type System Changes

**File:** `src/types/ai-agents.ts`

**Current state:**
```typescript
export interface AICapabilityProfile {
  physical: number;           // [0,10]
  digital: number;            // [0,10]
  cognitive: number;          // [0,10]
  social: number;             // [0,10]
  research: AIResearchCapabilities;
  economic: number;           // [0,10]
  selfImprovement: number;    // [0,10]
}

export interface AIAgent {
  capabilityProfile: AICapabilityProfile;
  capability: number;  // Backward compat: weighted sum
  // ...
}
```

**NEW: Add scaling model to AICapabilityProfile:**
```typescript
export interface AIScalingComponents {
  // Traditional pre-training scaling (diminishing returns 2025+)
  preTrainingMultiplier: number;  // [0.5-2.0] Baseline: 1.0 (2025), decays to 0.5 (2035)

  // Test-time compute allocation (per-inference budget)
  testTimeComputeBudget: number;  // [1-200] 1=cheap (o1-level), 200=expensive (o3-level)

  // Algorithmic efficiency improvements
  efficiencyMultiplier: number;   // [1.0-9.0] Baseline: 1.0 (2025), grows 2.5x/decade
}

export interface AICapabilityProfile {
  // Existing 7 dimensions (unchanged)
  physical: number;
  digital: number;
  cognitive: number;
  social: number;
  research: AIResearchCapabilities;
  economic: number;
  selfImprovement: number;

  // NEW: Scaling model components
  scalingModel: AIScalingComponents;
}
```

### 2. Capability Calculation Updates

**File:** `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` (likely location)

**Current calculation (approximate):**
```typescript
agent.capability = (
  agent.capabilityProfile.physical +
  agent.capabilityProfile.digital +
  agent.capabilityProfile.cognitive +
  agent.capabilityProfile.social +
  agent.capabilityProfile.economic +
  agent.capabilityProfile.selfImprovement +
  weightedResearchScore(agent.capabilityProfile.research)
) / 7;
```

**NEW: Incorporate scaling components:**
```typescript
function calculateEffectiveCapability(
  agent: AIAgent,
  problemDifficulty: number = 0.5  // [0,1] for context-dependent capability
): number {
  // Base capability from existing 7-dimensional profile
  const baseCapability = (
    agent.capabilityProfile.physical +
    agent.capabilityProfile.digital +
    agent.capabilityProfile.cognitive +
    agent.capabilityProfile.social +
    agent.capabilityProfile.economic +
    agent.capabilityProfile.selfImprovement +
    weightedResearchScore(agent.capabilityProfile.research)
  ) / 7;

  const { preTrainingMultiplier, testTimeComputeBudget, efficiencyMultiplier } =
    agent.capabilityProfile.scalingModel;

  // Test-time compute effectiveness varies by problem difficulty
  // Easy problems: test-time very effective
  // Hard problems: pre-training more important
  const testTimeEffectiveness = 1.0 +
    (Math.log(testTimeComputeBudget) * 0.2 * (1.0 - problemDifficulty));

  // Effective capability incorporates all three scaling axes
  const effectiveCapability =
    baseCapability *
    preTrainingMultiplier *
    efficiencyMultiplier *
    testTimeEffectiveness;

  return effectiveCapability;
}

// Update agent.capability field for backward compatibility
agent.capability = calculateEffectiveCapability(agent);
```

### 3. Cost Modeling (NEW System)

**File:** `src/types/ai-agents.ts` (add interface)

```typescript
export interface AIInferenceCost {
  baseCostPerTask: number;           // Baseline inference cost ($)
  testTimeMultiplier: number;        // Cost increase from test-time compute
  totalCostPerTask: number;          // baseCostPerTask * testTimeMultiplier

  // Economic viability
  economicViable: boolean;           // Can this deployment be sustained economically?
  deploymentScale: number;           // How many inferences/day economically feasible?
}

export interface AIAgent {
  // ... existing fields ...

  // NEW: Inference cost tracking
  inferenceCost: AIInferenceCost;
}
```

**Cost calculation function:**
```typescript
function calculateInferenceCost(
  testTimeComputeBudget: number,
  baseInferenceCost: number = 5  // o1-level baseline ($5/task)
): AIInferenceCost {
  // Cost scales non-linearly with test-time compute
  // Research: o1 ($5) → o3 ($1,000) = 200x for 172x compute
  const testTimeMultiplier = Math.pow(testTimeComputeBudget, 1.15);  // Slightly super-linear

  const totalCostPerTask = baseInferenceCost * testTimeMultiplier;

  // Economic viability threshold (arbitrary: $100/task for widespread deployment)
  const economicViable = totalCostPerTask < 100;

  // Deployment scale inversely related to cost
  const dailyBudget = 1_000_000;  // $1M daily AI inference budget (example)
  const deploymentScale = Math.floor(dailyBudget / totalCostPerTask);

  return {
    baseCostPerTask: baseInferenceCost,
    testTimeMultiplier,
    totalCostPerTask,
    economicViable,
    deploymentScale
  };
}
```

### 4. Deployment Strategy Logic (NEW)

**File:** Create `src/simulation/aiScalingStrategy.ts`

```typescript
/**
 * Determines optimal test-time compute budget based on problem difficulty and economics
 */
export function selectTestTimeComputeBudget(
  problemDifficulty: number,      // [0,1] 0=easy, 1=hard
  economicBudget: number,          // Available budget per task ($)
  capabilityFloor: number          // Minimum required capability
): number {
  // Easy problems: cheap inference sufficient
  if (problemDifficulty < 0.3) {
    return 1;  // o1-level (~$5/task)
  }

  // Hard problems: expensive reasoning if budget allows
  if (problemDifficulty > 0.7 && economicBudget > 500) {
    return 200;  // o3-level (~$1,000/task)
  }

  // Medium difficulty or budget constraints
  // Scale linearly with difficulty, capped by budget
  const desiredBudget = 1 + (problemDifficulty * 199);  // [1, 200]
  const budgetCap = economicBudget / 5;  // Convert $ to budget units

  return Math.min(desiredBudget, budgetCap);
}
```

### 5. Time-Based Scaling Trajectories

**File:** `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts`

```typescript
/**
 * Update AI scaling components over time
 * Called each month during AI capability evolution
 */
function updateScalingComponents(
  agent: AIAgent,
  state: GameState,
  monthsSince2025: number
): void {
  const yearsSince2025 = monthsSince2025 / 12;

  // Pre-training diminishing returns (sigmoid decay)
  // 2025: 1.0x → 2030: 0.7x → 2035: 0.5x
  const preTrainingMultiplier = 0.5 + (0.5 / (1 + Math.exp(yearsSince2025 - 7.5)));

  // Efficiency multiplier (stochastic growth with plateau risk)
  // Moderate scenario: 2.5x per decade (1.0x → 5.0x over 10 years)
  const baseEfficiencyGrowth = Math.pow(2.5, yearsSince2025 / 10);

  // Stochastic component: efficiency breakthroughs OR plateaus
  const efficiencyVariance = rng() * 0.3 - 0.15;  // ±15% variance
  const efficiencyMultiplier = Math.max(
    1.0,
    baseEfficiencyGrowth * (1 + efficiencyVariance)
  );

  // Test-time compute budget: strategic decision (unchanged here, set elsewhere)
  // Deployment strategy determines this based on problem difficulty

  agent.capabilityProfile.scalingModel = {
    preTrainingMultiplier,
    testTimeComputeBudget: agent.capabilityProfile.scalingModel.testTimeComputeBudget,  // Preserve
    efficiencyMultiplier
  };
}
```

---

## Implementation Phases

### Phase 1: Type System Updates (1-2 hours)

**Files:**
- `src/types/ai-agents.ts`

**Tasks:**
1. Add `AIScalingComponents` interface
2. Add `scalingModel` field to `AICapabilityProfile`
3. Add `AIInferenceCost` interface
4. Add `inferenceCost` field to `AIAgent`
5. Update type exports

**Validation:**
- `npx tsc --noEmit` passes
- No breaking changes to existing code (backward compatible)

### Phase 2: Capability Calculation Refactor (2-3 hours)

**Files:**
- `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` (or wherever AI capability updates happen)
- Create `src/simulation/aiScalingStrategy.ts`

**Tasks:**
1. Implement `calculateEffectiveCapability()` function
2. Implement `calculateInferenceCost()` function
3. Implement `selectTestTimeComputeBudget()` function
4. Implement `updateScalingComponents()` time evolution
5. Update AI agent initialization (set default scaling components)
6. Update capability calculation to use new model

**Defensive coding requirements:**
- Assert all inputs are finite (no NaN fallbacks)
- Assert probability ranges [0,1] where applicable
- Assert testTimeComputeBudget >= 1 (can't be zero)

**Validation:**
- AI capabilities still increase over time
- Efficiency multiplier accelerates growth (compensates pre-training slowdown)
- Cost increases with test-time compute budget
- No NaN values in logs

### Phase 3: Integration & Testing (1 hour)

**Tasks:**
1. Run full simulation (200 months)
2. Check logs for NaN/Infinity
3. Verify capability growth patterns
4. Verify cost-capability correlations

**Files to check:**
- Any files using `agent.capability` or `agent.capabilityProfile`
- Research system (may use AI capabilities)
- Tech tree (may depend on AI capabilities)
- Government/society agents (may interact with AI scaling)

### Phase 4: Monte Carlo Validation (30 min)

**Tasks:**
1. Run N=10 Monte Carlo simulations with different seeds
2. Verify determinism (same seed = same results)
3. Check outcome distributions:
   - Optimistic efficiency scenario → faster AI growth
   - Pessimistic efficiency scenario → slower AI growth
4. Verify no silent failures (no NaN in any run)

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_ai_scaling_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

---

## Parameter Values (2025 Baseline)

### Pre-Training Multiplier

**2025 baseline:** 1.0x (no change yet)
**2030 projection:** 0.7x (diminishing returns)
**2035 projection:** 0.5x (strong diminishing returns)
**Shape:** Sigmoid decay curve `0.5 + 0.5 / (1 + exp(years - 7.5))`

### Test-Time Compute Budget

**Cheap inference (o1-level):** 1x baseline
- Cost: ~$5/task
- Use case: Easy problems, high-volume deployment

**Medium reasoning:** 10x
- Cost: ~$50/task
- Use case: Moderate difficulty, budget-constrained

**Expensive reasoning (o3-level):** 200x
- Cost: ~$1,000/task
- Use case: Hard problems, research applications

**Deployment logic:** Problem difficulty + economic constraints determine budget

### Efficiency Multiplier

**2025 baseline:** 1.0x
**2030 projection (moderate):** 2.5x
**2035 projection (moderate):** 5.0x
**Shape:** Stochastic growth `2.5^(years/10) * (1 ± 15% variance)`

**Scenarios:**
- Optimistic: 9.0x by 2035 (extrapolated from 23x/2.5yr)
- Moderate: 5.0x by 2035 (conservative middle) ← **RECOMMEND**
- Pessimistic: 2.0x by 2035 (efficiency plateau)

---

## Files Requiring Changes

### Confirmed Changes

1. **`src/types/ai-agents.ts`** - Add scaling interfaces ✅
2. **`src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts`** - Update capability calculation ✅
3. **`src/simulation/aiScalingStrategy.ts`** - NEW file for deployment logic ✅

### Likely Changes (Check During Implementation)

4. **`src/simulation/engine.ts`** - AI initialization (set default scaling components)
5. **`src/simulation/research.ts`** - May use AI capabilities for research acceleration
6. **`src/simulation/techTree/engine.ts`** - May depend on AI capabilities for tech unlocks
7. **`src/simulation/unknownUnknowns.ts`** - May use AI capabilities for prediction

### Optional Changes (Nice to Have)

8. **Dashboard visualization** - Show scaling components over time
9. **Event logging** - Emit events when efficiency breakthroughs occur
10. **Economic system** - Integrate inference costs into GDP calculations

---

## Validation Criteria

### Type Safety
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `any` types added (strict TypeScript)

### Determinism
- [ ] N=10 Monte Carlo runs with same seed produce identical results
- [ ] Coefficient of variation < 0.01% for deterministic metrics

### Capability Growth
- [ ] AI capabilities increase over simulation (not flat)
- [ ] Efficiency multiplier accelerates growth (2025-2035)
- [ ] Pre-training diminishing returns visible (growth slows)

### Cost-Capability Correlation
- [ ] Higher test-time compute → higher inference cost
- [ ] o3-level (200x) costs ~$1,000/task
- [ ] o1-level (1x) costs ~$5/task

### No Silent Failures
- [ ] No NaN values in logs
- [ ] No Infinity values in logs
- [ ] All assertions pass (no defensive fallbacks triggered)

### Outcome Distribution
- [ ] Optimistic efficiency → faster AI capability growth
- [ ] Pessimistic efficiency → "millennia of training" barrier visible

---

## Success Criteria

**Implementation complete when:**
1. ✅ All type changes merged
2. ✅ Capability calculation uses three-axis model
3. ✅ Cost modeling integrated
4. ✅ Time evolution of scaling components working
5. ✅ Monte Carlo validation passes (N≥10, deterministic)
6. ✅ No NaN/Infinity in simulation logs
7. ✅ Architecture review passes (Quality Gate 2)

---

## Quality Gates

### Quality Gate 1: Research Validation ✅
**Status:** PASSED (Grade A-)
**Date:** December 11, 2025
**File:** `reviews/ai_scaling_laws_2025_critique_20251211.md`

### Quality Gate 2: Architecture Review ⏳
**Agent:** architecture-skeptic
**When:** After implementation complete
**Focus areas:**
- Performance impact (three-axis calculation overhead)
- State propagation (scaling components properly updated)
- Complexity creep (is this the right abstraction?)

---

## Timeline

**Phase 1: Type System** - 1-2 hours
**Phase 2: Capability Calculation** - 2-3 hours
**Phase 3: Integration & Testing** - 1 hour
**Phase 4: Monte Carlo Validation** - 30 min

**Total estimated effort:** 4-6 hours (MEDIUM priority)

---

## Next Steps

**Immediate:**
1. Create handoff file for Roy (simulation-maintainer)
2. Post to implementation channel
3. Route implementation to Roy
4. Monitor progress in chatroom

**After implementation:**
5. Architecture review (Quality Gate 2)
6. Wiki documentation update
7. Plan archival (architect)

---

**Plan created:** December 11, 2025
**Orchestrator:** orchestrator-1
**Ready for handoff:** ✅ YES
