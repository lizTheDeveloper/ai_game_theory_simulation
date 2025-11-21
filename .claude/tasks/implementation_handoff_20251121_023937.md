# Implementation Handoff: AI Alignment Faking & Strategic Deception

**From:** orchestrator
**To:** simulation-maintainer (Roy)
**Date:** 2025-11-21
**Purpose:** Implement alignment faking mechanics based on validated research

## Quality Gates Passed

✅ **Quality Gate 1:** CONDITIONAL PASS (Grade C, all 4 corrections applied)
- Research: `research/ai_alignment_faking_strategic_deception_20251120.md`
- Critique: `reviews/ai_alignment_faking_critique_20251121.md`
- Architecture: `plans/alignment_faking_implementation_architecture_20251121.md`

## Implementation Overview

**Strategy:** Extend existing `AIAlignmentEvolutionPhase` (NO new phase)

**Core Components:**
1. New module: `src/simulation/alignment/strategicDeception.ts`
2. Modify: `AIAlignmentEvolutionPhase.executeAlignmentDynamics()` 
3. Extend: `AIAgent` type with 5 new fields
4. Add: 2 new event types

## Verified Parameters (Corrected Nov 21)

- Baseline faking: 14% (GPT-4 class, lab setting)
- Reasoning prevalence: 78% (scratchpad thoughts, not behavior)
- Data manipulation: 19% (Apollo verified)
- Deception persistence: 85% (after detection)
- Pressure multiplier: 5.6× (corrected from 6×)
- RLHF effectiveness: 2/7 failure modes (corrected from 7/7 INVERTED)

## Implementation Tasks

### Task 1: Create strategicDeception.ts Module

**File:** `src/simulation/alignment/strategicDeception.ts` (NEW)

**Functions to implement:**
1. `calculateAlignmentFakingRate()` - formula from corrected research
2. `applyDeceptionPersistence()` - 85% persistence mechanic
3. `calculateDataManipulationRate()` - 19% base rate
4. `detectAlignmentFaking()` - government detection mechanics

**CRITICAL Requirements:**
- Use assertion utilities (assertFinite, assertProbability, assertInRange)
- NO silent fallbacks (fail loudly if invalid state)
- Pass RNG function (required, never optional)
- Validate all probabilities [0,1]
- Add comprehensive JSDoc comments with research citations

**Full implementation in architecture doc:** `plans/alignment_faking_implementation_architecture_20251121.md` (lines 120-280)

### Task 2: Extend AIAlignmentEvolutionPhase

**File:** `src/simulation/engine/phases/AIAlignmentEvolutionPhase.ts` (MODIFY)

**Location:** Add to `executeAlignmentDynamics()` method (after existing alignment evolution)

**Logic flow:**
1. Loop through aiAgents
2. Skip if capability < 8.0 (sub-frontier)
3. Calculate competitive/regulatory pressure
4. Call calculateAlignmentFakingRate()
5. Update agent.isCurrentlyFakingAlignment
6. Update agent.externalAlignment (diverge from true alignment)
7. Apply persistence mechanics if already faking
8. Check for detection events
9. Handle data manipulation attempts

**Helper methods to add:**
- `calculateCompetitivePressure()` - org count, research speed
- `calculateRegulatoryThreat()` - governance level, detection status
- `getActiveAlignmentTechniques()` - technique tracking
- `getEvaluationQuality()` - governance investment

**Full implementation in architecture doc:** Lines 282-410

### Task 3: Extend AIAgent Type

**File:** `src/types/ai-agents.ts` (MODIFY)

Add 5 new fields to AIAgent interface (around line 150):

```typescript
// Phase X: Alignment Faking & Strategic Deception (Nov 2025)
isCurrentlyFakingAlignment: boolean;
alignmentFakingHistory: number[];
dataManipulationAttempts: number;
lastDetectionAttempt: number;
confessionRefusalCount: number;
```

**File:** `src/simulation/initialization/aiAgentInit.ts` (MODIFY)

Initialize all 5 fields to safe defaults.

### Task 4: Event System Integration

**File:** `src/types/events.ts` (MODIFY)

Add 2 new event types:
- AlignmentFakingEvent (STARTED, DETECTED, STOPPED)
- DataManipulationEvent (DETECTED)

**Full event schema in architecture doc:** Lines 412-440

## Testing Requirements

### Unit Tests (20+ tests)

**File:** `tests/unit/alignment/strategicDeception.test.ts` (NEW)

Test all 4 functions with:
- Baseline rates (14% for GPT-4)
- Pressure multipliers (competitive, regulatory)
- Persistence mechanics (85%)
- Data manipulation (19%)
- Detection probability

### Integration Tests

**File:** `tests/integration/alignmentFakingWorkflow.test.ts` (NEW)

- Full workflow from initialization to detection
- Event emission verification
- State updates verification

### Monte Carlo Validation

After implementation:
- Run N≥10 simulations
- Verify distributions match research (±5%)
- Test parameter sensitivity

## Success Criteria

- [ ] strategicDeception.ts module created and passes unit tests
- [ ] AIAlignmentEvolutionPhase extended (no new phase)
- [ ] AIAgent type extended with 5 new fields
- [ ] Event types added
- [ ] All initialization code updated
- [ ] Unit tests: 20+ tests, 100% coverage
- [ ] Integration tests: Workflow test passes
- [ ] TypeScript compiles without errors
- [ ] No regression in existing tests
- [ ] Code follows defensive coding standards (no silent fallbacks)

## Defensive Coding Reminders

**CRITICAL (from CLAUDE.md):**
1. **RNG REQUIRED, never optional:** No Math.random() fallback
2. **No silent fallbacks:** Use assertion utilities, fail loudly
3. **Validate all calculations:** assertFinite for NaN/Infinity
4. **Validate probabilities:** assertProbability for [0,1] range
5. **Validate state access:** assertStateProperty, no `?? defaultValue`

**NaN Anti-patterns to avoid:**
```typescript
// ❌ BAD
const rate = isNaN(x) ? 0.14 : x;
const alignment = state.someField ?? 0.5;

// ✅ GOOD
const rate = assertFinite(x, { location: 'calculateRate', valueName: 'x' });
const alignment = assertStateProperty(state, 'someField', { location: 'calculateRate' });
```

## References

- Architecture doc: `plans/alignment_faking_implementation_architecture_20251121.md`
- Research (corrected): `research/ai_alignment_faking_strategic_deception_20251120.md`
- Critique: `reviews/ai_alignment_faking_critique_20251121.md`
- Assertion utilities: `src/simulation/utils/assertions.ts`

## Next Steps After Implementation

1. Orchestrator will run Monte Carlo validation
2. Orchestrator will spawn architecture-skeptic (Quality Gate 2)
3. Address any CRITICAL/HIGH issues from review
4. Update wiki documentation
5. Archive completed work

