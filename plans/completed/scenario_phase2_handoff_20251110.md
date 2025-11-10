# Scenario Analysis Phase 2 - Implementation Handoff

**From:** Orchestrator
**To:** Feature Implementer (Moss) + Simulation Maintainer (Roy)
**Date:** November 10, 2025
**Priority:** HIGH

## Context

Phase 1 complete (commit a7349644):
- ✅ Scenario type definitions in `src/types/scenarios.ts`
- ✅ God mode diagnostics showing 1/6 spirals active
- ✅ 6 predefined scenarios ready to test

**Key Insight:** Technology alone insufficient - need to test governance/social conditions

## Implementation Tasks

### Task 2.1: Scenario Runner (Moss - Feature Implementer)

**File:** `scripts/scenarioRunner.ts`

**Pattern:** Reuse godModeTest.ts structure, add scenario application layer

**Core Functions:**
```typescript
// Apply scenario definition to game state
function applyScenario(state: GameState, scenario: ScenarioDefinition, rng: RNGFunction): void {
  // 1. Apply starting condition boosts (governance, safety, trust)
  // 2. Handle early start (negative month offsets)
  // 3. Apply QoL boosts
  // 4. Deploy technologies according to strategy (immediate/sequenced/adaptive/prioritized)
}

// Run complete scenario
function runScenario(scenarioId: string, seed: number, maxMonths: number = 360): ScenarioResult {
  // 1. Load scenario from SCENARIO_CATALOG
  // 2. Create initial state with RNG
  // 3. Apply scenario modifications
  // 4. Run simulation
  // 5. Collect spiral activation data
  // 6. Return ScenarioResult
}
```

**Tech Deployment Strategies:**
- `immediate`: Deploy all at month 0 (copy from godModeTest.ts)
- `sequenced`: Deploy in tier waves with configurable gaps
- `adaptive`: Deploy when thresholds met (governance > 0.7, safety > 0.6)
- `prioritized`: Deploy by category order (climate → energy → governance)

**Starting Condition Application:**
```typescript
if (scenario.startingConditions?.governanceQuality) {
  // Apply to all countries or specific ones
  // Boost V-Dem indicators (governance quality, institutional capacity)
}

if (scenario.startingConditions?.techDeploymentStartMonth) {
  // Offset deployment time (negative = early start)
  // Track in scenario metadata
}
```

**Output:**
- Log to `logs/scenario_[id]_seed[N]_YYYYMMDD.log`
- Save ScenarioResult JSON to `logs/scenario_results/`
- Print spiral activation summary

### Task 2.2: Government Override System (Roy - Simulation Maintainer)

**Files to Modify:**
1. `src/types/game.ts` - Add scenarioOverrides field
2. `src/simulation/government/executeGovernmentActions.ts` - Accept override parameter
3. `src/simulation/engine/phases/GovernmentActionsPhase.ts` - Pass overrides

**Implementation:**

**Step 1:** Add to GameState
```typescript
// src/types/game.ts
export interface GameState {
  // ... existing fields ...

  /**
   * Scenario overrides for testing (optional)
   * Applied in GovernmentActionsPhase before normal decision logic
   */
  scenarioOverrides?: {
    governmentPriorities?: GovernmentPriorityOverride[];
  };
}
```

**Step 2:** Modify government execution
```typescript
// src/simulation/government/executeGovernmentActions.ts
export function executeGovernmentActions(
  state: GameState,
  rng: RNGFunction
): { newState: GameState; events: Event[] } {

  // Check for scenario overrides FIRST
  if (state.scenarioOverrides?.governmentPriorities) {
    return applyGovernmentOverrides(state, rng);
  }

  // Normal government decision logic
  // ... existing code ...
}

function applyGovernmentOverrides(state: GameState, rng: RNGFunction) {
  const overrides = state.scenarioOverrides!.governmentPriorities!;

  for (const override of overrides) {
    const countries = override.scope === 'global'
      ? Object.keys(state.countries)
      : override.countries || [];

    for (const countryName of countries) {
      const country = state.countries[countryName];

      // Override priorities
      if (override.priorities.climateMitigation !== undefined) {
        // Maximize climate spending, minimize others
        // Adjust budget allocation to match priorities
      }

      // Override comprehension/trust if specified
      if (override.comprehensionOverride !== undefined) {
        // Force AI comprehension level (removes lag)
      }

      if (override.trustOverride !== undefined) {
        // Force trust level (removes trust dynamics)
      }
    }
  }

  return { newState: state, events: [] };
}
```

**Defensive Coding Requirements:**
- Use assertion utilities (assertFinite, assertInRange)
- No silent fallbacks - fail loudly if overrides malformed
- Preserve RNG determinism (no extra RNG calls in override path)
- Validate override values in [0, 1] range

**Example Override Scenarios:**
- "Climate First": climateMitigation = 1.0, others = 0.1
- "Equality First": inequalityReduction = 1.0, others = 0.2
- "AI Alignment First": aiSafety = 1.0, others = 0.2

### Task 2.3: Comparative Testing Script (Moss)

**File:** `scripts/compareScenarios.ts`

**Purpose:** Run baseline + test scenario, compute deltas

**Core Functions:**
```typescript
function compareScenarios(
  baselineId: string,
  testId: string,
  seed: number,
  maxMonths: number = 360
): ScenarioComparison {
  // 1. Run baseline scenario
  const baselineResult = runScenario(baselineId, seed, maxMonths);

  // 2. Run test scenario
  const testResult = runScenario(testId, seed, maxMonths);

  // 3. Compute deltas
  const deltas = computeDeltas(baselineResult, testResult);

  // 4. Validate hypothesis
  const hypothesisValidated = checkHypothesis(testResult, deltas);

  // 5. Generate findings
  const findings = generateFindings(baselineResult, testResult, deltas);

  return {
    baseline: baselineResult,
    test: testResult,
    deltas,
    hypothesisValidated,
    findings
  };
}
```

**Delta Computation:**
```typescript
function computeDeltas(baseline: ScenarioResult, test: ScenarioResult) {
  return {
    spiralDelta: {
      additionalSpiralsActive: test.spiralActivation.activeUpwardSpirals.filter(
        s => !baseline.spiralActivation.activeUpwardSpirals.includes(s)
      ),
      cascadeStrengthChange: test.spiralActivation.cascadeStrength - baseline.spiralActivation.cascadeStrength,
      trustCascadeChange: test.spiralActivation.trustCascadesTriggered - baseline.spiralActivation.trustCascadesTriggered
    },
    qolDelta: {
      survivalChange: test.finalQoL.survivalAvg - baseline.finalQoL.survivalAvg,
      // ... other dimensions
    },
    // ... environment, population
  };
}
```

**Output Format:**
- Markdown report: `reviews/scenario_comparison_[test]_vs_[baseline]_YYYYMMDD.md`
- JSON data: `logs/scenario_comparison_[timestamp].json`

**Priority Comparisons:**
1. `no-tech` vs `god-mode` (tech impact baseline)
2. `god-mode` vs `early-start-10yr` (time hypothesis)
3. `god-mode` vs `governance-first` (dependency hypothesis)
4. `god-mode` vs `sequenced-deployment` (absorption hypothesis)

## Quality Requirements

**Defensive Coding (Roy's domain):**
- Assertion utilities on all calculations
- No silent fallbacks (fail loudly)
- RNG determinism preserved
- NaN detection on all metrics

**Testing (Priya will validate):**
- Monte Carlo N≥3 per scenario
- Determinism check (same seed = same result)
- CV < 5% for outcome metrics

**Architecture (architecture-skeptic will review):**
- No state propagation issues
- Phase execution order preserved
- No performance bottlenecks

## Research Foundation

**Already Validated:**
- ✅ Governance parameters (V-Dem v14, WGI 2024) - see `research/verification_P0_government_baselines_20251031.md`
- ✅ Spiral mechanisms verified - see `research/GOD_MODE_ANALYSIS_model_mechanisms_20251110.md`
- ✅ Time constants discussed in god mode diagnostics

**No additional research needed** - proceed to implementation

## Handoff Sequence

1. **Moss:** Create scenarioRunner.ts (Task 2.1)
2. **Roy:** Add government override system (Task 2.2) - MUST use defensive coding
3. **Moss:** Create compareScenarios.ts (Task 2.3)
4. **Moss + Roy:** Run Monte Carlo validation N≥3
5. **Orchestrator:** Invoke architecture-skeptic for review
6. **Historian:** Update wiki documentation

## Success Criteria

- ✅ 4 scenarios execute without errors
- ✅ Government overrides modify decision-making
- ✅ Determinism validated (same seed = identical results)
- ✅ Delta analysis shows spiral activation patterns
- ✅ All quality gates passed

## Timeline

**Estimated:** 4-6 hours
- Implementation: 3-4 hours
- Testing: 1 hour
- Review: 1 hour

**Start:** Immediately
**Priority:** HIGH (blocking spiral activation understanding)

---

**Next Steps:**
1. Moss: Accept Task 2.1 + 2.3 (scripts)
2. Roy: Accept Task 2.2 (government override with defensive coding)
3. Coordinate in `.claude/coordination/` if blockers arise
