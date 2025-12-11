# HANDOFF: AI Scaling Paradigm Update - Implementation

**To:** Roy (simulation-maintainer)
**From:** Orchestrator
**Date:** December 11, 2025
**Priority:** MEDIUM

---

## Task

Implement three-axis AI scaling model based on completed and validated 2025 research.

**Implementation plan:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/ai-scaling-paradigm-update.md`

---

## Context

This feature updates the AI capability system to reflect 2025 reality: traditional pre-training shows diminishing returns, but test-time compute + efficiency gains provide alternative scaling paths.

**Research completed:** November 12, 2025
**Validation:** Grade A- (Quality Gate 1 PASSED)
**Research file:** `research/ai_scaling_laws_2025_update_20251112.md`
**Critique file:** `reviews/ai_scaling_laws_2025_critique_20251211.md`

---

## Key Changes

**Replace single capability scalar with three-component model:**

1. **Pre-training multiplier** - Traditional scaling with diminishing returns (1.0x → 0.5x by 2035)
2. **Test-time compute budget** - Per-inference allocation (1x cheap → 200x expensive)
3. **Efficiency multiplier** - Algorithmic improvements (1.0x → 5.0x by 2035, moderate scenario)

**Add cost modeling:** o3-level reasoning costs 200x more than o1-level ($1,000 vs $5 per task)

---

## Technical Design Summary

### Type Changes (`src/types/ai-agents.ts`)

```typescript
export interface AIScalingComponents {
  preTrainingMultiplier: number;  // [0.5-2.0] Diminishing returns
  testTimeComputeBudget: number;  // [1-200] Per-inference budget
  efficiencyMultiplier: number;   // [1.0-9.0] Algorithmic gains
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

  // NEW: Scaling model
  scalingModel: AIScalingComponents;
}

export interface AIInferenceCost {
  baseCostPerTask: number;
  testTimeMultiplier: number;
  totalCostPerTask: number;
  economicViable: boolean;
  deploymentScale: number;
}

export interface AIAgent {
  // ... existing fields ...
  inferenceCost: AIInferenceCost;  // NEW
}
```

### Capability Calculation Update

**Current (approximate):**
```typescript
agent.capability = weightedSum(capabilityProfile) / 7;
```

**NEW:**
```typescript
const baseCapability = weightedSum(capabilityProfile) / 7;
const { preTrainingMultiplier, testTimeComputeBudget, efficiencyMultiplier } =
  agent.capabilityProfile.scalingModel;

const testTimeEffectiveness = 1.0 + Math.log(testTimeComputeBudget) * 0.2 * (1 - problemDifficulty);

agent.capability = baseCapability * preTrainingMultiplier * efficiencyMultiplier * testTimeEffectiveness;
```

### Time Evolution

**Each month, update scaling components:**
- Pre-training: Sigmoid decay (1.0x → 0.5x over 10 years)
- Efficiency: Stochastic growth (2.5x per decade ± 15% variance)
- Test-time: Strategic choice based on problem difficulty + economics

---

## Implementation Phases

**Phase 1: Type System** (1-2 hours)
- Add interfaces to `src/types/ai-agents.ts`
- Verify `npx tsc --noEmit` passes

**Phase 2: Capability Calculation** (2-3 hours)
- Update `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts`
- Create `src/simulation/aiScalingStrategy.ts`
- Implement cost modeling
- Implement time evolution

**Phase 3: Integration & Testing** (1 hour)
- Run full simulation (200 months)
- Check logs for NaN/Infinity
- Verify capability growth patterns

**Phase 4: Monte Carlo Validation** (30 min)
- N=10 runs with different seeds
- Verify determinism
- Check outcome distributions

---

## Defensive Coding Requirements

**CRITICAL: No silent fallbacks. Fail loudly with assertions.**

```typescript
import { assertFinite, assertInRange, assertProbability } from '@/simulation/utils/assertions';

// Validate scaling components
const preTrainingMultiplier = assertInRange(
  calculatedValue,
  0.5,
  2.0,
  { location: 'updateScalingComponents', valueName: 'preTrainingMultiplier', month: state.currentMonth }
);

// Validate test-time budget (must be >= 1)
if (testTimeComputeBudget < 1) {
  throw new Error(`❌ CRITICAL: testTimeComputeBudget must be >= 1 (got ${testTimeComputeBudget})`);
}

// Validate efficiency multiplier
const efficiencyMultiplier = assertFinite(
  calculatedValue,
  { location: 'updateScalingComponents', valueName: 'efficiencyMultiplier', month: state.currentMonth }
);
```

**No `?? defaultValue` in calculations. No `isNaN(x) ? fallback : x` patterns.**

---

## Parameter Values (2025 Baseline)

### Pre-Training Multiplier
- 2025: 1.0x
- 2030: 0.7x
- 2035: 0.5x
- Shape: `0.5 + 0.5 / (1 + Math.exp(years - 7.5))`

### Test-Time Compute Budget
- Cheap (o1-level): 1x (~$5/task)
- Medium: 10x (~$50/task)
- Expensive (o3-level): 200x (~$1,000/task)

### Efficiency Multiplier
- 2025: 1.0x
- 2035 (moderate): 5.0x
- Growth: `Math.pow(2.5, years/10) * (1 ± 15% variance)`

---

## Files to Change

### Confirmed
1. `src/types/ai-agents.ts` - Add interfaces
2. `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` - Update calculation
3. `src/simulation/aiScalingStrategy.ts` - NEW file

### Check During Implementation
4. `src/simulation/engine.ts` - AI initialization
5. `src/simulation/research.ts` - May use AI capabilities
6. `src/simulation/techTree/engine.ts` - May depend on capabilities

---

## Validation Criteria

**Must pass before Quality Gate 2:**

- [ ] `npx tsc --noEmit` (zero errors)
- [ ] N=10 Monte Carlo deterministic (same seed = same results)
- [ ] AI capabilities increase over time (not flat)
- [ ] Efficiency multiplier accelerates growth
- [ ] Cost-capability correlation (higher budget = higher cost)
- [ ] No NaN/Infinity in logs
- [ ] All assertions pass (no fallbacks triggered)

---

## Success Criteria

**Implementation complete when:**
1. Three-axis scaling model working
2. Cost modeling integrated
3. Time evolution of scaling components functional
4. Monte Carlo validation passes (N≥10)
5. No NaN/Infinity in simulation
6. Ready for architecture review (Quality Gate 2)

---

## Timeline

**Estimated effort:** 4-6 hours (MEDIUM priority)

**Phases:**
- Type system: 1-2 hours
- Capability calculation: 2-3 hours
- Integration & testing: 1 hour
- Monte Carlo validation: 30 min

---

## Next Steps After Implementation

1. Post completion to implementation channel
2. Orchestrator spawns architecture-skeptic (Quality Gate 2)
3. Address any architectural concerns
4. Wiki documentation update
5. Plan archival

---

## Notes

**Research quality:** Grade A- (strong sources, quantitative parameters)

**Key insight:** Economic constraints matter - even if AI *can* solve problems at o3-level, cost may prohibit widespread deployment.

**Backward compatibility:** Maintain `agent.capability` field as weighted sum for existing code. New code should use `calculateEffectiveCapability()` for context-dependent capability.

**Emoji conventions:** Use 🤖💡 for AI capability breakthroughs, 🤖⚡ for efficiency gains, 🤖💰 for cost-related events.

---

**Handoff complete. Implementation plan ready. Awaiting your work, Roy.**
