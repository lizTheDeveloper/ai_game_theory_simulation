# Scenario Analysis Framework - Phase 2 Implementation Plan

**Date:** November 10, 2025
**Priority:** HIGH
**Context:** Building on Phase 1 diagnostics (commit a7349644) - god mode found 1/6 spirals active

## Objectives

Build execution framework to test scenarios defined in Phase 1:
1. Scenario runner (apply scenario definitions to game state)
2. Government override system (control policy priorities)
3. Comparative analysis (delta computation between scenarios)
4. Monte Carlo validation (N≥3 per scenario)

## Phase 1 Deliverables (Already Complete)

✅ Scenario type definitions (`src/types/scenarios.ts`)
✅ God mode diagnostics (`reviews/god_mode_spiral_diagnostics_20251110.md`)
✅ 6 predefined scenarios in SCENARIO_CATALOG
✅ Key insight: Only 1/6 spirals activated with all tech deployed

## Phase 2 Implementation Tasks

### 2.1: Scenario Runner (`scripts/scenarioRunner.ts`)

**Purpose:** Execute ScenarioDefinition against simulation

**Core Functions:**
```typescript
function applyScenario(state: GameState, scenario: ScenarioDefinition, rng: RNGFunction): void
function runScenario(scenario: ScenarioDefinition, seed: number, maxMonths: number): ScenarioResult
```

**Tech Deployment Strategies:**
- `immediate`: Deploy all at month 0 (existing god mode)
- `sequenced`: Deploy by tier with configurable gaps
- `adaptive`: Deploy based on effectiveness thresholds
- `prioritized`: Deploy categories in priority order

**Starting Condition Modifications:**
- Apply governance/safety/trust boosts to state
- Support early start (negative month offsets)
- Apply QoL dimension boosts

**Implementation Notes:**
- Reuse godModeTest.ts pattern for tech deployment
- Maintain deterministic RNG (pass through consistently)
- Save results with full scenario metadata
- Log scenario application steps for debugging

### 2.2: Government Override System

**Files to Modify:**
- `src/simulation/government/executeGovernmentActions.ts` (add override parameter)
- `src/simulation/engine/phases/GovernmentActionsPhase.ts` (pass overrides)
- `src/types/game.ts` (add scenarioOverrides to GameState)

**Override Mechanism:**
```typescript
interface GameState {
  // ... existing fields ...
  scenarioOverrides?: {
    governmentPriorities?: GovernmentPriorityOverride[];
  };
}
```

**Override Application:**
- Check for scenario overrides before normal government decision logic
- Apply priority weights from GovernmentPriorityOverride
- Override comprehension/trust/institutional capacity if specified
- Preserve determinism (no new RNG calls in override path)

**Example Overrides:**
- "Climate First": Set climateMitigation = 1.0, others = 0.1
- "Equality First": Set inequalityReduction = 1.0, others = 0.2
- "AI Alignment First": Set aiSafety = 1.0, others = 0.2

### 2.3: Comparative Testing (`scripts/compareScenarios.ts`)

**Purpose:** Run multiple scenarios and generate delta analysis

**Core Functions:**
```typescript
function compareScenarios(baseline: ScenarioDefinition, test: ScenarioDefinition, seed: number): ScenarioComparison
function generateComparisonReport(comparison: ScenarioComparison): string
```

**Priority Comparisons:**
1. `no-tech` vs `god-mode` (establishes tech impact baseline)
2. `god-mode` vs `early-start-10yr` (tests time constant hypothesis)
3. `god-mode` vs `governance-first` (tests dependency hypothesis)
4. `god-mode` vs `sequenced-deployment` (tests absorption capacity)

**Delta Analysis:**
- Spiral activation changes (which spirals gained/lost)
- QoL improvements per dimension
- Environmental metric deltas
- Population changes
- Outcome class improvement (utopia → status quo → collapse → extinction)

**Output Format:**
- Markdown report saved to `reviews/scenario_comparison_[test]_vs_[baseline]_YYYYMMDD.md`
- JSON data saved to `logs/scenario_comparison_[timestamp].json`

### 2.4: Monte Carlo Validation

**Requirements:**
- Run each scenario N≥3 times with different seeds
- Verify determinism (same seed = identical results)
- Check coefficient of variation (CV) across runs
- Validate spiral activation patterns are consistent

**Validation Script:**
```bash
# Run scenario with 3 seeds
npx tsx scripts/scenarioRunner.ts governance-first 42 360 > logs/governance_first_seed42.log 2>&1
npx tsx scripts/scenarioRunner.ts governance-first 43 360 > logs/governance_first_seed43.log 2>&1
npx tsx scripts/scenarioRunner.ts governance-first 44 360 > logs/governance_first_seed44.log 2>&1

# Check determinism
npx tsx scripts/scenarioRunner.ts governance-first 42 360 > logs/governance_first_seed42_repeat.log 2>&1
diff logs/governance_first_seed42.log logs/governance_first_seed42_repeat.log
```

**Success Criteria:**
- Determinism: Identical seeds produce identical results
- Consistency: CV < 5% for outcome metrics across seeds
- Spiral activation: Similar patterns across seeds (not identical, but same general trends)

## Implementation Sequence

1. **Research Validation** (super-alignment-researcher + research-skeptic)
   - Verify scenario parameters are research-backed
   - Validate government override mechanisms match real policy processes
   - Check time constants for tech deployment rates

2. **Core Implementation** (feature-implementer)
   - Create scenarioRunner.ts (reuse godModeTest.ts patterns)
   - Add government override system (modify GovernmentActionsPhase)
   - Create compareScenarios.ts (delta computation)
   - Add unit tests for scenario application

3. **Testing & Validation** (priya + unit-test-writer)
   - Monte Carlo N≥3 for 4 priority scenarios
   - Determinism validation
   - CV analysis for outcome metrics

4. **Architecture Review** (architecture-skeptic)
   - Check state propagation in override system
   - Verify no performance bottlenecks
   - Validate phase execution order preserved

5. **Documentation** (wiki-documentation-updater)
   - Add scenario framework section to wiki
   - Document government override API
   - Create usage guide for scenario testing

## Quality Gates

**Gate 1: Research Validation**
- ❌ Parameters not research-backed → Add citations or adjust
- ✅ Research-skeptic approves → Proceed to implementation

**Gate 2: Architecture Review**
- ❌ State propagation issues / performance bottlenecks → Fix before merge
- ✅ Architecture-skeptic approves → Proceed to documentation

**Gate 3: Monte Carlo Validation**
- ❌ Determinism fails / CV > 5% → Debug before merge
- ✅ Priya validates → Ready for merge

## Expected Outcomes

**Immediate:**
- Working scenario execution framework
- Government override system operational
- 4 scenario comparisons complete (baseline, time, governance, sequenced)

**Analysis Insights:**
- Which conditions enable spiral activation?
- Is time or governance the bottleneck?
- Does absorption capacity matter?
- What's the minimum viable social foundation?

**Next Phase (Phase 3):**
- Comprehensive scenario matrix (16 combinations)
- Spiral sensitivity analysis
- Calibration of time constants
- Governance threshold identification

## File Deliverables

**New Files:**
- `scripts/scenarioRunner.ts` (300-400 lines)
- `scripts/compareScenarios.ts` (200-300 lines)
- `tests/scenario-framework.test.ts` (150-200 lines)

**Modified Files:**
- `src/simulation/government/executeGovernmentActions.ts` (add override parameter)
- `src/simulation/engine/phases/GovernmentActionsPhase.ts` (pass overrides)
- `src/types/game.ts` (add scenarioOverrides field)
- `docs/wiki/README.md` (add scenario framework section)

**Output Files:**
- `logs/scenario_[id]_seed[N]_YYYYMMDD.log` (per run)
- `reviews/scenario_comparison_[test]_vs_[baseline]_YYYYMMDD.md` (per comparison)
- `logs/monte_carlo_scenario_validation_YYYYMMDD.json` (aggregated stats)

## Success Metrics

- ✅ 4 scenarios execute without errors
- ✅ Government overrides modify decision-making as expected
- ✅ Determinism validated (same seed = identical results)
- ✅ CV < 5% across N≥3 runs per scenario
- ✅ Delta analysis identifies spiral activation conditions
- ✅ All quality gates passed

## Timeline

**Estimated:** 6-8 hours
- Research validation: 1 hour
- Implementation: 3-4 hours
- Testing: 1-2 hours
- Review: 1 hour
- Documentation: 1 hour

**Priority:** HIGH (blocking spiral activation understanding)
