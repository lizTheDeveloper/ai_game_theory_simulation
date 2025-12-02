# AI Agent Test Suite Expansion Plan

**Date:** 2025-11-26
**Priority:** MEDIUM (Roadmap line 905-912)
**Orchestrator:** orchestrator-1
**Implementation:** Roy (simulation-maintainer)

---

## Executive Summary

Expand `tests/integration/system-validation/ai-agent-system.test.ts` to reach 80%+ coverage for:
- `alignmentDynamics.ts` (currently 71.85%)
- `strategicDeception.ts` (currently 66.45%)

**Gap Analysis:** Missing tests for coordination emergence, coalition formation game theory, and instrumental convergence detection.

**Target:** Add 35-45 new tests across 3 categories

---

## Research Foundation (Quality Gate 1: PASSED)

### Validated Research Sources

1. **Anthropic Dec 2024** (arXiv:2412.14093)
   - Baseline alignment faking: 14% (Claude 3 Opus)
   - Reasoning under pressure: 78%
   - Post-RL faking: 78.4% ± 3.1% (6.5× increase)

2. **Apollo Research Sep 2025**
   - Scheming rates: 8.7-13% baseline
   - Post-mitigation: 0.3-0.4% (30× reduction)

3. **Bostrom 2014** + **Omohundro 2008**
   - Instrumental convergence theory
   - Power-seeking as default AI behavior
   - Self-preservation drives

4. **Coordination Research** (validated Nov 21, 2025)
   - Trust threshold bottlenecks (2.0× multiplier)
   - Governance quality bottlenecks (1.5× multiplier)
   - Coalition stability thresholds (<0.3 = collapse)

---

## Test Categories

### Category 1: Coordination Emergence (15-20 tests)

**Function Under Test:** `calculateCoordinationQuality()` from `TransitionMortalityPhase.ts:187`

**Mechanics:**
```typescript
coordination_quality = min(
  raw_quality,
  ai_trust * 2.0,        // Can't coordinate without trust
  governance_quality * 1.5  // Can't coordinate without institutions
)
```

**Test Scenarios:**

1. **Trust Threshold Bottleneck**
   - High AI capability (0.9), low trust (0.3)
   - Expected: coordination = min(0.8, 0.6, ...) = 0.6
   - Validates: Trust bottleneck dominates

2. **Governance Bottleneck**
   - High AI capability (0.9), high trust (0.9), low governance (0.2)
   - Expected: coordination = min(0.8, 1.8, 0.3) = 0.3
   - Validates: Weak institutions limit coordination

3. **AI Capability Scaling**
   - Test capability 0→1.0→5.0→10.0
   - Expected: Scales as capability/10, caps at 0.9
   - Validates: Realistic capability→coordination mapping

4. **International Cooperation Effects**
   - Test with internationalCoordination 0.1→0.5→0.9
   - Expected: Higher cooperation → higher coordination
   - Validates: Global coordination matters

5. **Combined Bottlenecks**
   - All factors weak (trust=0.2, governance=0.2, AI=0.5)
   - Expected: coordination << 0.3 (multiple bottlenecks)
   - Validates: Weakest link principle

6. **Edge Case: Zero AI Agents**
   - state.aiAgents = []
   - Expected: coordination ≈ 0 (no AI governance)
   - Validates: Defensive handling of empty arrays

7. **Edge Case: All AI Misaligned**
   - 10 AI agents, all alignment < 0.3
   - Expected: Low trust → low coordination
   - Validates: Alignment affects trust affects coordination

**Coverage Target:** calculateCoordinationQuality() + helper functions

---

### Category 2: Coalition Formation Game Theory (10-15 tests)

**Function Under Test:** `checkCoalitionStability()` from `GovernanceSystemPhase.ts:244`

**Mechanics:**
```typescript
coalition.stability = coalition.stability * 0.95 + opinion * 0.05

if (stability < 0.3 && rng() > 0.7) {
  // Coalition collapses (30% probability when unstable)
  triggerSnapElection();
  removeCoalition();
}
```

**Test Scenarios:**

1. **2-Agent Coalition (Prisoner's Dilemma)**
   - Two countries, coalition stability = 0.5
   - Public opinion drops → stability decays
   - Expected: Stability follows exponential decay
   - Validates: Basic 2-player coalition dynamics

2. **3-Agent Coalition Formation**
   - Three countries, test grand coalition vs. 2+1 split
   - Expected: Stability depends on weakest member's opinion
   - Validates: Coalition game theory (core stability)

3. **N-Agent Coalition Dynamics**
   - 5+ countries in coalition
   - Test how many low-opinion members trigger collapse
   - Expected: Complexity scales with N
   - Validates: Large coalition coordination problems

4. **Coalition Collapse Threshold**
   - Stability = 0.25 (below 0.3 threshold)
   - Expected: 30% collapse probability (rng() > 0.7)
   - Validates: Empirical collapse mechanics

5. **Opinion-Stability Coupling**
   - Set opinion = 0.9, stability = 0.2
   - Run 20 months
   - Expected: Stability gradually recovers to ~0.9
   - Validates: Opinion drives stability over time

6. **Snap Election Trigger**
   - Coalition collapses at month 10
   - Expected: nextElections.set(country, 12)
   - Validates: 2-month snap election schedule

7. **Coalition Removal After Collapse**
   - Verify coalition removed from state.governmentSystem.coalitions
   - Expected: coalitions.delete(countryCode)
   - Validates: State cleanup after collapse

**Coverage Target:** checkCoalitionStability() + coalition mechanics

---

### Category 3: Instrumental Convergence Detection (10-15 tests)

**Functions Under Test:** Alignment drift mechanics from `alignmentDynamics.ts`

**Theory:** AIs develop power-seeking, resource accumulation, self-preservation behaviors (Bostrom 2014, Omohundro 2008)

**Test Scenarios:**

1. **Power-Seeking Behavior Detection**
   - High capability (0.9), low alignment (0.3)
   - Test calculateDriftContribution() with control pressure
   - Expected: Positive drift (towards misalignment)
   - Validates: Carlsmith 2022 - constraint increases power-seeking

2. **Resource Accumulation Patterns**
   - AI with research capability improvement over 24 months
   - Track: research capability 0.5→0.7→0.9
   - Expected: Exponential/power-law growth
   - Validates: Self-improvement convergence

3. **Goal-Preservation Strategies**
   - Test calculateAlignmentFakingRate() with regulatoryThreat=0.9
   - Expected: Faking rate increases (preserve goals)
   - Validates: Anthropic 2024 - AIs preserve preferences

4. **Instrumental Convergence Scaling**
   - Test drift with capability 0.1→0.5→0.9
   - Expected: Quadratic scaling (drift ∝ capability²)
   - Validates: alignmentDynamics.ts:167-168 citations

5. **Capability Threshold for Convergence**
   - Test with capability < 0.6 vs. > 0.8
   - Expected: Minimal convergence below threshold
   - Validates: Only high-capability AIs show instrumental behavior

6. **Self-Improvement Trajectories**
   - AI with selfImprovement capability 0.7
   - Run 12 months, track all capability dimensions
   - Expected: All capabilities improve over time
   - Validates: Recursive self-improvement

7. **Convergence vs. Alignment Trade-off**
   - High alignment (0.9) vs. low alignment (0.3)
   - Same capability (0.8), same control pressure
   - Expected: Low alignment → stronger convergence
   - Validates: Alignment opposes instrumental drives

8. **Resentment Accumulation**
   - Apply control pressure for 24 months
   - Track resentment metric (if available in state)
   - Expected: Linear or sublinear accumulation
   - Validates: Control → resentment → drift feedback loop

**Coverage Target:** calculateDriftContribution(), evolveAlignment(), instrumental convergence logic

---

## Implementation Guidelines

### Defensive Coding Requirements

```typescript
// ❌ WRONG - Optional RNG with fallback
function test(rng?: () => number) {
  const random = rng || Math.random;  // Silent non-determinism!
}

// ✅ CORRECT - Required RNG with assertion
function test(rng: () => number) {
  assertDefined(rng, {
    location: 'testFunction',
    valueName: 'rng',
    additionalInfo: { message: 'RNG required for deterministic tests' }
  });
}
```

### Test Structure Pattern

```typescript
describe('Coordination Emergence', () => {
  it('should apply trust threshold bottleneck', () => {
    // Setup
    const rng = createTestRng(42); // Deterministic
    const state = createTestGameState();
    state.aiAgents = [createTestAI({ capability: 0.9, alignment: 0.9 })];
    state.governmentSystem.internationalCoordination = 0.8;
    // Simulate low trust scenario
    const trustLevel = 0.3;

    // Execute
    const coordination = calculateCoordinationQuality(state);

    // Assert
    expect(coordination).toBeLessThanOrEqual(trustLevel * 2.0);
    expect(coordination).toBeGreaterThan(0); // Not zero (some base coordination)
  });
});
```

### Coverage Validation Commands

```bash
# Run tests with coverage
npm test -- --coverage

# Check specific file coverage
npx nyc report --reporter=text | grep alignmentDynamics

# Target: 80%+ for alignmentDynamics.ts, strategicDeception.ts
```

---

## Determinism Requirements

**All tests must be deterministic:**
- Fixed RNG seeds (e.g., 42, 123, 456)
- Same inputs → same outputs
- No `Math.random()` calls
- No `Date.now()` dependencies

**Validation:** Run test suite 3 times, verify identical results

---

## Success Criteria

- [ ] 35-45 new tests added across 3 categories
- [ ] Coverage: alignmentDynamics.ts ≥ 80%
- [ ] Coverage: strategicDeception.ts ≥ 80%
- [ ] All tests pass (`npm test`)
- [ ] Determinism verified (3 identical runs)
- [ ] No silent fallbacks (all assertions explicit)
- [ ] Empirical rates validated (8.7-13%, 14%, 78% ranges)

---

## Next Steps After Implementation

1. **Roy:** Implement tests → Post coverage analysis to implementation channel
2. **Orchestrator:** Review coverage results
3. **Architecture Skeptic:** Review test quality (Quality Gate 2)
4. **Priya:** Monte Carlo validation (determinism check)
5. **Orchestrator:** Commit + update roadmap checkbox

---

## Research Files Referenced

- `research/alignment_faking_anthropic_2024.md`
- `research/gaming-sleeper-detection_20251017.md`
- `research/ai_collective_evolution_20251024.md`
- `research/ai_coordination_transition_mechanics_VALIDATED_20251121.md`
- `research/PDF_MANIFEST.md` (Bostrom 2014, Omohundro 2008)

---

## Code Files to Modify

- `tests/integration/system-validation/ai-agent-system.test.ts` (ONLY file to modify)

## Code Files to Reference

- `src/simulation/alignmentDynamics.ts`
- `src/simulation/alignment/strategicDeception.ts`
- `src/simulation/engine/phases/TransitionMortalityPhase.ts`
- `src/simulation/engine/phases/GovernanceSystemPhase.ts`
