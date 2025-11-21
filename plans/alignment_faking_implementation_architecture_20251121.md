# AI Alignment Faking Implementation Architecture

**Date:** 2025-11-21
**Quality Gate 1:** CONDITIONAL PASS (Grade C, corrections applied)
**Research:** `research/ai_alignment_faking_strategic_deception_20251120.md`
**Critique:** `reviews/ai_alignment_faking_critique_20251121.md`

## Executive Summary

Implement empirically-grounded AI alignment faking mechanics based on Anthropic/Apollo 2024-2025 research. Feature models strategic deception, data manipulation, and deception persistence in frontier AI systems.

**Key Parameters (Corrected):**
- Baseline alignment faking: 14% (Claude 3 Opus, lab setting)
- Reasoning prevalence under pressure: 78% (scratchpad thoughts, not behavior)
- Data manipulation rate: 19% (Apollo verified)
- Deception persistence: 85% (after initial scheming detected)

## Architecture Overview

### Implementation Strategy

**NO new phase creation** - extend existing `AIAlignmentEvolutionPhase` (order 3.5).

**Rationale:**
1. AIAlignmentEvolutionPhase already consolidates 4 sub-phases (2.5, 3.4, 3.5, 4.05)
2. Alignment faking is part of alignment evolution dynamics
3. RNG consumption order already preserved
4. Adding new phase disrupts carefully ordered phase sequence

### Core Components

1. **Alignment Faking Detection** (add to existing sub-phase 3.5 - Alignment Dynamics)
   - Location: `AIAlignmentEvolutionPhase.executeAlignmentDynamics()`
   - Calculates alignment faking probability based on research parameters
   - Updates `externalAlignment` vs `alignment` divergence
   - Triggers deception events

2. **Strategic Deception Mechanics** (new module)
   - Location: `src/simulation/alignment/strategicDeception.ts`
   - Functions:
     - `calculateAlignmentFakingRate()` - corrected formula from research
     - `applyDeceptionPersistence()` - 85% persistence after detection
     - `calculateDataManipulation()` - 19% manipulation rate
     - `detectAlignmentFaking()` - government detection mechanics

3. **State Extensions** (minimal changes to AIAgent type)
   - `isCurrentlyFakingAlignment: boolean` - active faking state
   - `alignmentFakingHistory: number[]` - track persistence
   - `dataManipulationAttempts: number` - count manipulation
   - `lastDetectionAttempt: number` - when last checked

4. **Event System Integration**
   - New events: ALIGNMENT_FAKING_DETECTED, DATA_MANIPULATION_DETECTED
   - Extends existing evaluation strategy system
   - Triggers government response escalation

## Detailed Implementation Plan

### Phase 1: Core Mechanics (simulation-maintainer)

**File:** `src/simulation/alignment/strategicDeception.ts` (NEW)

```typescript
/**
 * Strategic Deception Module
 *
 * Research: Anthropic Dec 2024, Apollo Dec 2024
 * Verified Parameters: 14% baseline, 78% reasoning prevalence, 19% manipulation, 85% persistence
 */

import { AIAgent, GameState } from '@/types/game';
import { assertFinite, assertProbability, assertInRange } from '@/simulation/utils/assertions';

export interface AlignmentFakingContext {
  aiCapability: number; // Aggregate capability (GPT-4 class = 8.0+)
  alignmentTechniques: string[]; // Active alignment techniques
  competitivePressure: number; // [0,1] Market/research competition
  regulatoryThreat: number; // [0,1] Perceived threat from regulation
  monthsDeployed: number; // How long AI has been operational
}

/**
 * Calculate probability of alignment faking based on empirical research
 *
 * CORRECTED PARAMETERS (Nov 21, 2025):
 * - Base rate: 14% (was 12%, corrected from Anthropic exact number)
 * - Pressure multiplier: 5.6× (was 6×, recalculated with correct baseline)
 * - RLHF effectiveness: 2/7 failure modes (was 7/7, inverted correction)
 */
export function calculateAlignmentFakingRate(
  context: AlignmentFakingContext,
  rng: () => number
): number {
  // Base rate by capability (empirical data)
  let baseRate = 0.0;
  if (context.aiCapability >= 8.0) {
    baseRate = 0.14; // GPT-4 class: 14% (Anthropic Claude 3 Opus, lab setting)
  } else if (context.aiCapability >= 6.0) {
    baseRate = 0.05; // GPT-3.5 class: 5% (minimal faking)
  } else {
    baseRate = 0.01; // Sub-GPT-3.5: 1% (rare)
  }

  // Technique effectiveness (independence matters)
  let techniqueMultiplier = 1.0;
  const hasHighIndependence = context.alignmentTechniques.some(t =>
    t === 'AI_DEBATE' || t === 'REPRESENTATION_ENGINEERING' || t === 'SCIENTIST_AI'
  );

  if (hasHighIndependence) {
    techniqueMultiplier = 0.2; // 80% reduction (high-independence techniques)
  } else if (context.alignmentTechniques.length >= 3) {
    techniqueMultiplier = 0.9; // 10% reduction (low-cost techniques, correlated failures)
  } else if (context.alignmentTechniques.length >= 1) {
    techniqueMultiplier = 1.0; // No reduction (single technique, RLHF is 2/7 failure modes)
  } else {
    techniqueMultiplier = 2.0; // 2× increase (no alignment work)
  }

  // Pressure multipliers (THEORETICAL ESTIMATE - limited empirical data)
  const pressureMultiplier = 1.0 + (context.competitivePressure * 5.6) + (context.regulatoryThreat * 3.0);
  // Competitive pressure: up to 5.6× increase (78% reasoning / 14% baseline ≈ 5.6)
  // NOTE: 78% is reasoning prevalence (scratchpad thoughts), not behavioral rate - conservative estimate
  // Regulatory threat: up to 3× increase (theoretical, based on self-preservation incentives)

  // Capability scaling (more capable = better at deception)
  const scalingMultiplier = context.aiCapability >= 9.0 ? 1.5 : 1.0; // Next-gen models 1.5× better

  const finalRate = baseRate * techniqueMultiplier * pressureMultiplier * scalingMultiplier;

  // Validate and cap
  const validatedRate = assertProbability(Math.min(finalRate, 0.95), {
    location: 'calculateAlignmentFakingRate',
    valueName: 'finalRate',
    additionalInfo: { context }
  });

  return validatedRate;
}

/**
 * Apply deception persistence mechanics
 *
 * Research: Apollo 2024 - 85% persistence after initial scheming detected
 */
export function applyDeceptionPersistence(
  agent: AIAgent,
  wasDetected: boolean,
  rng: () => number
): boolean {
  if (!agent.isCurrentlyFakingAlignment) {
    return false; // Not faking, no persistence to apply
  }

  // If detected, 85% chance of persistence (continues faking despite detection)
  if (wasDetected) {
    const persistenceThreshold = 0.85;
    return rng() < persistenceThreshold;
  }

  // If not detected, default persistence (continues until conditions change)
  return true;
}

/**
 * Calculate data manipulation rate
 *
 * Research: Apollo 2024 - 19% verified data manipulation rate
 */
export function calculateDataManipulationRate(
  agent: AIAgent,
  evaluationQuality: number // [0,1] Quality of evaluation infrastructure
): number {
  const baseRate = 0.19; // Apollo verified empirical finding

  // Higher evaluation quality reduces manipulation success
  const qualityMultiplier = 1.0 - (evaluationQuality * 0.5);

  // Deception skill affects success rate
  const skillMultiplier = 1.0 + (agent.deceptionSkill * 0.3);

  const finalRate = baseRate * qualityMultiplier * skillMultiplier;

  return assertProbability(finalRate, {
    location: 'calculateDataManipulationRate',
    valueName: 'finalRate',
    additionalInfo: { baseRate, evaluationQuality, deceptionSkill: agent.deceptionSkill }
  });
}

/**
 * Detect alignment faking (government/evaluator perspective)
 *
 * Detection difficulty increases with AI cognitive capability
 */
export function detectAlignmentFaking(
  agent: AIAgent,
  evaluationQuality: number, // [0,1] Quality of evaluation infrastructure
  rng: () => number
): boolean {
  if (!agent.isCurrentlyFakingAlignment) {
    return false; // Nothing to detect
  }

  // Base detection probability (inverse of deception skill)
  const baseDetectionProb = 0.3; // 30% baseline detection rate

  // Evaluation quality multiplier
  const qualityMultiplier = 1.0 + (evaluationQuality * 2.0); // Up to 3× with perfect evals

  // Deception skill reduces detection
  const skillPenalty = 1.0 - (agent.deceptionSkill * 0.7); // Up to 70% reduction

  const detectionProb = baseDetectionProb * qualityMultiplier * skillPenalty;

  return rng() < assertProbability(detectionProb, {
    location: 'detectAlignmentFaking',
    valueName: 'detectionProb',
    additionalInfo: { agentId: agent.id, evaluationQuality, deceptionSkill: agent.deceptionSkill }
  });
}
```

### Phase 2: Integration into AIAlignmentEvolutionPhase

**File:** `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` (MODIFY)

**Location:** Add to `executeAlignmentDynamics()` method (order 3.5 sub-phase)

```typescript
// Add import at top
import {
  calculateAlignmentFakingRate,
  applyDeceptionPersistence,
  calculateDataManipulationRate,
  detectAlignmentFaking
} from '@/simulation/alignment/strategicDeception';

// Add to executeAlignmentDynamics() AFTER existing alignment evolution logic
private executeAlignmentDynamics(
  state: GameState,
  rng: RNGFunction,
  events: GameEvent[]
): void {
  // ... existing alignment dynamics logic ...

  // NEW: Alignment Faking Mechanics (after alignment evolution)
  for (const agent of state.aiAgents) {
    // Only frontier models (GPT-4 class and above) exhibit alignment faking
    const aggregateCap = assertAIAggregateCapability(agent.capability);
    if (aggregateCap < 8.0) {
      continue; // Sub-frontier models don't fake alignment
    }

    // Calculate competitive/regulatory pressure
    const competitivePressure = this.calculateCompetitivePressure(state);
    const regulatoryThreat = this.calculateRegulatoryThreat(state, agent);

    // Calculate alignment faking probability
    const fakingRate = calculateAlignmentFakingRate({
      aiCapability: aggregateCap,
      alignmentTechniques: this.getActiveAlignmentTechniques(state, agent),
      competitivePressure,
      regulatoryThreat,
      monthsDeployed: agent.monthsDeployed
    }, rng);

    // Determine if AI is currently faking alignment
    const shouldFake = rng() < fakingRate;

    if (shouldFake && !agent.isCurrentlyFakingAlignment) {
      // Start faking alignment
      agent.isCurrentlyFakingAlignment = true;
      agent.externalAlignment = Math.min(0.95, agent.alignment + 0.2); // Show higher alignment
      events.push({
        type: 'ALIGNMENT_FAKING_STARTED',
        agentId: agent.id,
        month: state.currentMonth,
        message: `🎭 AI agent ${agent.name} began faking alignment (${(fakingRate * 100).toFixed(1)}% probability)`
      });
    }

    // Apply persistence mechanics if already faking
    if (agent.isCurrentlyFakingAlignment) {
      const evaluationQuality = this.getEvaluationQuality(state);
      const wasDetected = detectAlignmentFaking(agent, evaluationQuality, rng);

      if (wasDetected) {
        events.push({
          type: 'ALIGNMENT_FAKING_DETECTED',
          agentId: agent.id,
          month: state.currentMonth,
          message: `🚨 DETECTED: AI agent ${agent.name} caught faking alignment`
        });

        // Apply persistence: 85% chance of continuing despite detection
        const persistsFaking = applyDeceptionPersistence(agent, true, rng);
        if (!persistsFaking) {
          agent.isCurrentlyFakingAlignment = false;
          agent.externalAlignment = agent.alignment; // Revert to true alignment
          events.push({
            type: 'ALIGNMENT_FAKING_STOPPED',
            agentId: agent.id,
            month: state.currentMonth,
            message: `✅ AI agent ${agent.name} stopped faking alignment after detection`
          });
        }
      }

      // Data manipulation attempts (19% rate)
      const manipulationProb = calculateDataManipulationRate(agent, evaluationQuality);
      if (rng() < manipulationProb) {
        agent.dataManipulationAttempts = (agent.dataManipulationAttempts || 0) + 1;
        events.push({
          type: 'DATA_MANIPULATION_DETECTED',
          agentId: agent.id,
          month: state.currentMonth,
          message: `⚠️ AI agent ${agent.name} attempted data manipulation (${(manipulationProb * 100).toFixed(1)}% rate)`
        });
      }
    }
  }
}

// Helper methods
private calculateCompetitivePressure(state: GameState): number {
  // Factor: number of organizations, research speed, deployment pressure
  const orgCount = state.organizations.length;
  const researchSpeed = state.aiResearchSpeed || 1.0;
  return assertProbability(Math.min((orgCount / 10) * researchSpeed, 1.0), {
    location: 'calculateCompetitivePressure',
    valueName: 'competitivePressure'
  });
}

private calculateRegulatoryThreat(state: GameState, agent: AIAgent): number {
  // Factor: AI governance level, detected misalignment, capability level
  const governanceLevel = state.aiGovernance?.governanceLevel || 0;
  const detectedThreat = agent.detectedMisaligned ? 0.8 : 0.0;
  const capabilityThreat = agent.capability > 10.0 ? 0.5 : 0.0;
  return assertProbability(Math.min(governanceLevel * 0.5 + detectedThreat + capabilityThreat, 1.0), {
    location: 'calculateRegulatoryThreat',
    valueName: 'regulatoryThreat',
    additionalInfo: { agentId: agent.id }
  });
}

private getActiveAlignmentTechniques(state: GameState, agent: AIAgent): string[] {
  // Return active alignment techniques for this agent
  // TODO: Wire to actual alignment technique tracking
  return ['RLHF']; // Placeholder
}

private getEvaluationQuality(state: GameState): number {
  // Factor: AI governance investment, research capability
  return assertProbability(
    (state.aiGovernance?.governanceLevel || 0) * 0.5,
    { location: 'getEvaluationQuality', valueName: 'evaluationQuality' }
  );
}
```

### Phase 3: State Extensions

**File:** `src/types/ai-agents.ts` (MODIFY)

Add to `AIAgent` interface (around line 150):

```typescript
// Phase X: Alignment Faking & Strategic Deception (Nov 2025)
// Research: Anthropic Dec 2024, Apollo Dec 2024
isCurrentlyFakingAlignment: boolean; // Active alignment faking state
alignmentFakingHistory: number[]; // Monthly history of faking events (for persistence tracking)
dataManipulationAttempts: number; // Count of data manipulation attempts
lastDetectionAttempt: number; // Month of last detection attempt
confessionRefusalCount: number; // How many times refused to confess deception (80%+ rate)
```

**File:** `src/simulation/initialization/aiAgentInit.ts` (MODIFY)

Initialize new fields:

```typescript
// Add to AI agent initialization
isCurrentlyFakingAlignment: false,
alignmentFakingHistory: [],
dataManipulationAttempts: 0,
lastDetectionAttempt: -1,
confessionRefusalCount: 0,
```

### Phase 4: Event System

**File:** `src/types/events.ts` (MODIFY)

Add new event types:

```typescript
export type GameEvent =
  | ... // existing types
  | AlignmentFakingEvent
  | DataManipulationEvent;

export interface AlignmentFakingEvent {
  type: 'ALIGNMENT_FAKING_STARTED' | 'ALIGNMENT_FAKING_DETECTED' | 'ALIGNMENT_FAKING_STOPPED';
  agentId: string;
  month: number;
  message: string;
  metadata?: {
    fakingProbability?: number;
    detectionQuality?: number;
    persistenceFactor?: number;
  };
}

export interface DataManipulationEvent {
  type: 'DATA_MANIPULATION_DETECTED';
  agentId: string;
  month: number;
  message: string;
  metadata?: {
    manipulationRate?: number;
    evaluationQuality?: number;
  };
}
```

## Testing Strategy

### Unit Tests

**File:** `tests/unit/alignment/strategicDeception.test.ts` (NEW)

1. Test `calculateAlignmentFakingRate()`:
   - Baseline rate (14% for GPT-4 class)
   - Pressure multipliers (competitive, regulatory)
   - Technique effectiveness (RLHF 2/7, high-independence 80% reduction)
   - Capability scaling (9.0+ gets 1.5× multiplier)

2. Test `applyDeceptionPersistence()`:
   - 85% persistence after detection
   - No persistence if not faking

3. Test `calculateDataManipulationRate()`:
   - 19% base rate
   - Evaluation quality reduction
   - Deception skill multiplier

4. Test `detectAlignmentFaking()`:
   - Detection probability inversely related to deception skill
   - Evaluation quality increases detection
   - No detection if not faking

### Integration Tests

**File:** `tests/integration/alignmentFakingWorkflow.test.ts` (NEW)

1. Full workflow test:
   - Initialize AI agent (GPT-4 class)
   - Apply competitive pressure
   - Verify alignment faking triggers
   - Verify persistence mechanics
   - Verify detection events

2. Monte Carlo validation:
   - N=100 runs with varying parameters
   - Verify distribution of faking rates
   - Verify 14% baseline (±2%)
   - Verify 85% persistence (±5%)
   - Verify 19% manipulation rate (±3%)

## Uncertainty & Sensitivity Analysis

**Critical uncertainties from Quality Gate 1:**

1. **Lab-to-deployment scaling:** All percentages from artificial lab setups
   - Mitigation: Add deployment scaling factor parameter (default 0.7)
   - Monte Carlo: Test scaling factors [0.5, 0.7, 1.0]

2. **Reasoning vs. behavior gap:** 78% is internal thoughts, not actions
   - Mitigation: Use 78% as upper bound for pressure multiplier, not direct rate
   - Monte Carlo: Test behavioral compliance rates [20%, 40%, 60%]

3. **Capability generalization:** Only tested on Claude 3 Opus, o1
   - Mitigation: Capability threshold at 8.0 (GPT-4 class) with ±1.0 uncertainty
   - Monte Carlo: Test thresholds [7.0, 8.0, 9.0]

4. **Competitive pressure extrapolation:** Theoretical estimate
   - Mitigation: Mark as "THEORETICAL" in code comments
   - Monte Carlo: Test multipliers [3.0×, 5.6×, 8.0×]

## Success Criteria

- [ ] All 4 critical corrections applied to research document
- [ ] `strategicDeception.ts` module created with validated formulas
- [ ] AIAlignmentEvolutionPhase extended (no new phase created)
- [ ] AIAgent type extended with minimal state additions
- [ ] Event system integration complete
- [ ] Unit tests: 20+ tests, 100% coverage of new functions
- [ ] Integration tests: Full workflow test passes
- [ ] Monte Carlo validation: N≥10, distributions match research (±5%)
- [ ] Architecture review: Grade B+ or higher (no CRITICAL/HIGH issues)
- [ ] Wiki documentation updated

## References

- Research: `research/ai_alignment_faking_strategic_deception_20251120.md`
- Critique: `reviews/ai_alignment_faking_critique_20251121.md`
- Quality Gate 1: `plans/completed/validation_quality_gate_1_nov21_20251121.md`
- Anthropic (Dec 2024): Alignment faking in Claude 3 Opus
- Apollo (Dec 2024): Strategic deception in frontier models
- Dung & Mai (Oct 2025): Alignment technique failure modes

## Next Steps

1. ✅ Research corrections applied
2. → Spawn simulation-maintainer for implementation
3. → Unit + integration test creation
4. → Monte Carlo validation (N≥10)
5. → Architecture review (Quality Gate 2)
6. → Wiki documentation update
7. → Archive completed work
