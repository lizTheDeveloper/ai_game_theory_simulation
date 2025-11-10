# Task: Scenario Analysis Phase 2 - Script Implementation

**Agent:** Moss (Feature Implementer)
**Priority:** HIGH
**Estimated Time:** 2-3 hours

## Context

You're implementing the scenario execution framework (Phase 2) that builds on Phase 1 diagnostics. God mode testing showed only 1/6 spirals activated with all tech deployed - we need systematic scenario testing to understand WHY.

**Phase 1 Deliverables (Complete):**
- ✅ `src/types/scenarios.ts` - Type definitions
- ✅ `reviews/god_mode_spiral_diagnostics_20251110.md` - Diagnostic results
- ✅ 6 predefined scenarios in SCENARIO_CATALOG

**Your Tasks:**
1. Create `scripts/scenarioRunner.ts` - Execute scenarios
2. Create `scripts/compareScenarios.ts` - Compare scenario outcomes

## Task 2.1: Scenario Runner

**File:** `scripts/scenarioRunner.ts`

**Pattern:** Reuse `scripts/godModeTest.ts` structure (already handles tech deployment)

**Key Functions:**

```typescript
import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import { 
  ScenarioDefinition, 
  ScenarioResult,
  SCENARIO_CATALOG 
} from '../src/types/scenarios';
import { GameState, RNGFunction } from '../src/types/game';

// Apply scenario modifications to initial state
function applyScenario(
  state: GameState, 
  scenario: ScenarioDefinition, 
  rng: RNGFunction
): void {
  // 1. Apply starting condition boosts
  if (scenario.startingConditions) {
    applyStartingConditions(state, scenario.startingConditions);
  }

  // 2. Deploy technologies according to strategy
  applyTechDeployment(state, scenario.techDeployment, rng);

  // 3. Apply government overrides (if specified)
  if (scenario.governmentOverrides) {
    state.scenarioOverrides = {
      governmentPriorities: scenario.governmentOverrides
    };
  }
}

// Apply starting condition modifications
function applyStartingConditions(
  state: GameState,
  conditions: ScenarioStartingConditions
): void {
  // Boost governance quality across all countries
  if (conditions.governanceQuality !== undefined) {
    for (const country of Object.values(state.countries)) {
      // Apply to V-Dem indicators
      // ... implementation
    }
  }

  // Apply other boosts (safety, trust, information integrity)
  // ... implementation
}

// Apply tech deployment strategy
function applyTechDeployment(
  state: GameState,
  strategy: TechDeploymentStrategy,
  rng: RNGFunction
): void {
  const allTech = getAllTech();

  switch (strategy.mode) {
    case 'immediate':
      // Copy from godModeTest.ts - deploy all at month 0
      deployAllTech(state, allTech, strategy.deploymentLevel || 1.0);
      break;

    case 'sequenced':
      // Deploy in tier waves (TIER 0 → 1 → 2 → 3 → 4)
      // Store deployment schedule in state for phase to execute
      scheduleSequencedDeployment(state, allTech, strategy.sequencedConfig!);
      break;

    case 'adaptive':
      // Store adaptive thresholds in state
      scheduleAdaptiveDeployment(state, allTech, strategy.adaptiveConfig!);
      break;

    case 'prioritized':
      // Deploy by category order
      schedulePrioritizedDeployment(state, allTech, strategy.prioritizedConfig!);
      break;
  }
}

// Main execution function
function runScenario(
  scenarioId: string,
  seed: number,
  maxMonths: number = 360
): ScenarioResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎭 SCENARIO TEST: ${scenarioId}`);
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}\n`);

  // Load scenario
  const scenario = SCENARIO_CATALOG[scenarioId];
  if (!scenario) {
    throw new Error(`❌ Unknown scenario: ${scenarioId}`);
  }

  console.log(`📋 Scenario: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`🔬 Hypothesis: ${scenario.hypothesis}\n`);

  // Create initial state
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply scenario modifications
  console.log('🔧 Applying scenario modifications...\n');
  applyScenario(state, scenario, rng);

  // Run simulation
  console.log('\n' + '='.repeat(80));
  console.log('▶️  Running simulation...');
  console.log('='.repeat(80) + '\n');

  const engine = new SimulationEngine(undefined as any, seed);
  const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

  // Extract scenario result
  const scenarioResult = extractScenarioResult(
    scenario,
    result,
    seed,
    maxMonths
  );

  // Print summary
  printScenarioSummary(scenarioResult);

  return scenarioResult;
}

// Extract ScenarioResult from simulation result
function extractScenarioResult(
  scenario: ScenarioDefinition,
  result: any,
  seed: number,
  maxMonths: number
): ScenarioResult {
  const finalState = result.finalState;

  return {
    scenarioId: scenario.id,
    seed,
    outcome: result.outcome || 'UNKNOWN',
    monthsSimulated: result.monthsSimulated || 0,
    spiralActivation: {
      activeUpwardSpirals: extractActiveSpirals(finalState),
      cascadeActive: finalState?.upwardSpirals?.cascadeActive || false,
      cascadeStrength: finalState?.upwardSpirals?.cascadeStrength || 0,
      trustCascadesTriggered: finalState?.cooperativeSpirals?.trustCascadesTriggered || 0,
      tippingPointCascades: countTippingPointCascades(finalState)
    },
    finalQoL: extractQoLMetrics(finalState),
    finalEnvironment: extractEnvironmentMetrics(finalState),
    finalPopulation: finalState?.humanPopulationSystem?.population || 0,
    boundariesBreached: extractBoundariesBreached(finalState)
  };
}

// CLI entry point
if (require.main === module) {
  const scenarioId = process.argv[2];
  const seed = process.argv[3] ? parseInt(process.argv[3]) : 42;
  const maxMonths = process.argv[4] ? parseInt(process.argv[4]) : 360;

  if (!scenarioId) {
    console.error('❌ Usage: npx tsx scripts/scenarioRunner.ts <scenarioId> [seed] [maxMonths]');
    console.error('\nAvailable scenarios:');
    for (const id of Object.keys(SCENARIO_CATALOG)) {
      console.error(`  - ${id}`);
    }
    process.exit(1);
  }

  const result = runScenario(scenarioId, seed, maxMonths);

  // Save result to file
  const fs = require('fs');
  const outputDir = 'logs/scenario_results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${outputDir}/${scenarioId}_seed${seed}_${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));

  console.log(`\n💾 Result saved to: ${filename}`);
}
```

**Helper Functions to Implement:**
- `deployAllTech(state, allTech, level)` - Copy from godModeTest.ts
- `scheduleSequencedDeployment(state, allTech, config)` - Store tier schedule
- `scheduleAdaptiveDeployment(state, allTech, config)` - Store thresholds
- `schedulePrioritizedDeployment(state, allTech, config)` - Store category order
- `extractActiveSpirals(state)` - Read from state.upwardSpirals
- `extractQoLMetrics(state)` - Average across QoL dimensions
- `extractEnvironmentMetrics(state)` - Read from environmental systems
- `countTippingPointCascades(state)` - Count positive tipping points active
- `extractBoundariesBreached(state)` - Check planetary boundaries

## Task 2.3: Comparative Testing Script

**File:** `scripts/compareScenarios.ts`

**Purpose:** Run two scenarios and compute deltas

```typescript
import { runScenario } from './scenarioRunner';
import { ScenarioResult, ScenarioComparison } from '../src/types/scenarios';
import * as fs from 'fs';

function compareScenarios(
  baselineId: string,
  testId: string,
  seed: number,
  maxMonths: number = 360
): ScenarioComparison {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 SCENARIO COMPARISON');
  console.log('='.repeat(80));
  console.log(`Baseline: ${baselineId}`);
  console.log(`Test: ${testId}`);
  console.log(`Seed: ${seed}\n`);

  // Run both scenarios
  const baseline = runScenario(baselineId, seed, maxMonths);
  const test = runScenario(testId, seed, maxMonths);

  // Compute deltas
  const deltas = computeDeltas(baseline, test);

  // Validate hypothesis (if expected outcome specified)
  const hypothesisValidated = validateHypothesis(test, deltas);

  // Generate findings
  const findings = generateFindings(baseline, test, deltas);

  const comparison: ScenarioComparison = {
    baseline,
    test,
    deltas,
    hypothesisValidated,
    findings
  };

  // Print comparison report
  printComparisonReport(comparison);

  return comparison;
}

function computeDeltas(baseline: ScenarioResult, test: ScenarioResult) {
  return {
    spiralDelta: {
      additionalSpiralsActive: test.spiralActivation.activeUpwardSpirals.filter(
        s => !baseline.spiralActivation.activeUpwardSpirals.includes(s)
      ),
      cascadeStrengthChange: 
        test.spiralActivation.cascadeStrength - baseline.spiralActivation.cascadeStrength,
      trustCascadeChange:
        test.spiralActivation.trustCascadesTriggered - baseline.spiralActivation.trustCascadesTriggered
    },
    qolDelta: {
      survivalChange: test.finalQoL.survivalAvg - baseline.finalQoL.survivalAvg,
      basicNeedsChange: test.finalQoL.basicNeedsAvg - baseline.finalQoL.basicNeedsAvg,
      psychologicalChange: test.finalQoL.psychologicalAvg - baseline.finalQoL.psychologicalAvg,
      socialChange: test.finalQoL.socialAvg - baseline.finalQoL.socialAvg,
      healthChange: test.finalQoL.healthAvg - baseline.finalQoL.healthAvg,
      environmentalChange: test.finalQoL.environmentalAvg - baseline.finalQoL.environmentalAvg,
      overallChange: test.finalQoL.overallAvg - baseline.finalQoL.overallAvg
    },
    environmentDelta: {
      tempChange: test.finalEnvironment.globalTempDelta - baseline.finalEnvironment.globalTempDelta,
      co2Change: test.finalEnvironment.co2Concentration - baseline.finalEnvironment.co2Concentration,
      extinctionChange: test.finalEnvironment.extinctionRate - baseline.finalEnvironment.extinctionRate
    },
    populationDelta: test.finalPopulation - baseline.finalPopulation,
    outcomeImproved: isOutcomeImproved(baseline.outcome, test.outcome)
  };
}

function isOutcomeImproved(baseline: string, test: string): boolean {
  // Outcome ranking: UTOPIA > PROSPEROUS > STATUS_QUO > DECLINE > COLLAPSE > EXTINCTION
  const ranking = ['EXTINCTION', 'COLLAPSE', 'DECLINE', 'STATUS_QUO', 'PROSPEROUS', 'UTOPIA'];
  return ranking.indexOf(test) > ranking.indexOf(baseline);
}

function generateFindings(
  baseline: ScenarioResult,
  test: ScenarioResult,
  deltas: any
): string[] {
  const findings: string[] = [];

  // Spiral activation findings
  if (deltas.spiralDelta.additionalSpiralsActive.length > 0) {
    findings.push(
      `🔄 Activated ${deltas.spiralDelta.additionalSpiralsActive.length} additional spirals: ` +
      deltas.spiralDelta.additionalSpiralsActive.join(', ')
    );
  }

  // QoL improvements
  if (deltas.qolDelta.overallChange > 0.1) {
    findings.push(`📈 Overall QoL improved by ${(deltas.qolDelta.overallChange * 100).toFixed(1)}%`);
  }

  // Population impact
  if (Math.abs(deltas.populationDelta) > 100_000_000) {
    findings.push(
      `👥 Population ${deltas.populationDelta > 0 ? 'increased' : 'decreased'} by ` +
      `${Math.abs(deltas.populationDelta / 1e9).toFixed(2)}B`
    );
  }

  // Outcome improvement
  if (deltas.outcomeImproved) {
    findings.push(`✅ Outcome improved: ${baseline.outcome} → ${test.outcome}`);
  }

  return findings;
}

function printComparisonReport(comparison: ScenarioComparison): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPARISON RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log('🔄 Spiral Activation:');
  console.log(`   Baseline: ${comparison.baseline.spiralActivation.activeUpwardSpirals.length} spirals`);
  console.log(`   Test: ${comparison.test.spiralActivation.activeUpwardSpirals.length} spirals`);
  if (comparison.deltas.spiralDelta.additionalSpiralsActive.length > 0) {
    console.log(`   ✅ Gained: ${comparison.deltas.spiralDelta.additionalSpiralsActive.join(', ')}`);
  }

  console.log('\n📈 QoL Changes:');
  for (const [key, value] of Object.entries(comparison.deltas.qolDelta)) {
    const change = value as number;
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    console.log(`   ${emoji} ${key}: ${(change * 100).toFixed(1)}%`);
  }

  console.log('\n🎯 Key Findings:');
  for (const finding of comparison.findings) {
    console.log(`   ${finding}`);
  }

  console.log('\n' + '='.repeat(80));
}

// CLI entry point
if (require.main === module) {
  const baselineId = process.argv[2];
  const testId = process.argv[3];
  const seed = process.argv[4] ? parseInt(process.argv[4]) : 42;
  const maxMonths = process.argv[5] ? parseInt(process.argv[5]) : 360;

  if (!baselineId || !testId) {
    console.error('❌ Usage: npx tsx scripts/compareScenarios.ts <baselineId> <testId> [seed] [maxMonths]');
    process.exit(1);
  }

  const comparison = compareScenarios(baselineId, testId, seed, maxMonths);

  // Save comparison report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
  const reportPath = `reviews/scenario_comparison_${testId}_vs_${baselineId}_${timestamp}.md`;

  const report = generateMarkdownReport(comparison);
  fs.writeFileSync(reportPath, report);

  console.log(`\n💾 Report saved to: ${reportPath}`);
}
```

## Coordination

**Depends on:** Roy completing Task 2.2 (government override system) for full functionality

**However:** You can implement Tasks 2.1 and 2.3 NOW and test with scenarios that don't use government overrides:
- `no-tech` (baseline)
- `god-mode` (immediate deployment)
- `early-start-10yr` (time hypothesis)
- `sequenced-deployment` (absorption capacity)

**When to coordinate with Roy:**
- After implementing basic scenario runner
- When ready to test scenarios with government overrides (governance-first, climate-prioritized)

## Testing

After implementation:

```bash
# Test basic scenario execution
npx tsx scripts/scenarioRunner.ts god-mode 42 12

# Test comparison
npx tsx scripts/compareScenarios.ts no-tech god-mode 42 360

# Monte Carlo validation (determinism check)
npx tsx scripts/scenarioRunner.ts god-mode 42 360 > logs/test1.log 2>&1
npx tsx scripts/scenarioRunner.ts god-mode 42 360 > logs/test2.log 2>&1
diff logs/test1.log logs/test2.log  # Should be identical
```

## Success Criteria

- ✅ scenarioRunner.ts executes all 6 scenarios without errors
- ✅ compareScenarios.ts produces delta analysis
- ✅ Determinism validated (same seed = same result)
- ✅ Output saved to logs/scenario_results/
- ✅ Comparison reports saved to reviews/

## Next Steps After Completion

1. Post completion to `.claude/coordination/`
2. Coordinate with Roy for government override testing
3. Run Monte Carlo validation (N≥3) for priority scenarios
4. Handoff to Priya for CV analysis
5. Handoff to architecture-skeptic for review

**Start now - Roy's work (Task 2.2) can proceed in parallel.**
