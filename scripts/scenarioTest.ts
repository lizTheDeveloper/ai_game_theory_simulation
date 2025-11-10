/**
 * Scenario Test Runner
 *
 * Runs individual scenarios or Monte Carlo analysis across scenarios
 * to test how governance/technology strategies affect outcomes.
 *
 * Usage:
 *   npx tsx scripts/scenarioTest.ts [scenarioName] [seed] [maxMonths]
 *   npx tsx scripts/scenarioTest.ts climateFirst 42 120
 *   npx tsx scripts/scenarioTest.ts all 42 120  # Run all scenarios
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';
import type { ScenarioDefinition } from '../src/simulation/scenarios/types';
import { logSpiralActivationDiagnostics } from '../src/simulation/upwardSpirals';
import { logCooperativeSpiralDiagnostics } from '../src/simulation/cooperativeSpirals';
import { logPositiveTippingPointDiagnostics } from '../src/simulation/positiveTippingPoints';

// Parse command-line arguments
const scenarioName = process.argv[2] || 'climateFirst';
const seed = process.argv[3] ? parseInt(process.argv[3]) : 42;
const maxMonths = process.argv[4] ? parseInt(process.argv[4]) : 120;

// Show usage if --help
if (scenarioName === '--help' || scenarioName === '-h') {
  console.log(`
Scenario Test Runner - Test governance and technology scenarios

Usage:
  npx tsx scripts/scenarioTest.ts [scenarioName] [seed] [maxMonths]

Arguments:
  scenarioName  - Name of scenario to run (or "all" for Monte Carlo)
  seed          - Random seed (default: 42)
  maxMonths     - Maximum simulation months (default: 120)

Available scenarios:
  ${Object.keys(SCENARIOS).join(', ')}

Examples:
  npx tsx scripts/scenarioTest.ts climateFirst 42 120
  npx tsx scripts/scenarioTest.ts idealConditions 42 120
  npx tsx scripts/scenarioTest.ts all 42 120  # Run all scenarios
  `);
  process.exit(0);
}

/**
 * Run a single scenario test
 */
function runScenario(
  scenario: ScenarioDefinition,
  seed: number,
  maxMonths: number
): {
  outcome: string | undefined;
  monthsSimulated: number;
  spiralsActivated: number;
  cascadeTriggered: boolean;
  finalQoL: number;
  finalGini: number;
  finalTemp: number;
} {
  console.log('\n' + '='.repeat(80));
  console.log(`🎮 SCENARIO TEST: ${scenario.name}`);
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}`);

  // Create engine FIRST to get deterministic RNG
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());

  // Create initial state with RNG
  const state = createDefaultInitialState(rng);

  // Apply scenario modifications
  applyScenario(state, scenario, rng);

  // Create engine for simulation
  const engine = new SimulationEngine(undefined as any, seed);

  console.log('\n' + '='.repeat(80));
  console.log('▶️  Running simulation...');
  console.log('='.repeat(80) + '\n');

  // Run simulation with periodic diagnostics (only log at end to reduce noise)
  let month = 0;
  while (month < maxMonths) {
    engine.step(state);
    month = state.currentMonth;

    // Check for early termination
    if (state.outcome) {
      console.log(`\n🚨 Simulation ended early at month ${month}: ${state.outcome}`);
      break;
    }
  }

  // Log final diagnostics
  console.log('\n' + '='.repeat(80));
  console.log(`📊 FINAL STATE DIAGNOSTICS (Month ${month})`);
  console.log('='.repeat(80));

  logSpiralActivationDiagnostics(state, month);
  logCooperativeSpiralDiagnostics(state);
  logPositiveTippingPointDiagnostics(state);

  // Calculate summary metrics
  const spiralsActivated = [
    state.upwardSpirals.abundance,
    state.upwardSpirals.cognitive,
    state.upwardSpirals.democratic,
    state.upwardSpirals.scientific,
    state.upwardSpirals.meaning,
    state.upwardSpirals.ecological
  ].filter(s => s.active || s.monthsActive > 0).length;

  const cascadeTriggered = state.upwardSpirals.cascadeMonths > 0;

  // Calculate aggregate QoL
  const qol = state.qualityOfLifeSystems;
  const survivalAvg = (qol.survivalFundamentals.foodSecurity + qol.survivalFundamentals.waterSecurity +
                       qol.survivalFundamentals.thermalHabitability + qol.survivalFundamentals.shelterSecurity) / 4;
  const tier1Avg = (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
  const tier2Avg = (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
  const tier3Avg = (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
  const tier4Avg = (qol.healthcareQuality + qol.longevityGains + (1 - qol.diseasesBurden)) / 3;
  const tier5Avg = (qol.ecosystemHealth + qol.climateStability + (1 - qol.pollutionLevel)) / 3;
  const overallQoL = (survivalAvg + tier1Avg + tier2Avg + tier3Avg + tier4Avg + tier5Avg) / 6;

  const finalGini = state.inequality?.gini ?? 0.4;
  const finalTemp = state.climate?.globalTempDelta ?? 1.5;

  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY METRICS');
  console.log('='.repeat(80));
  console.log(`  Outcome: ${state.outcome || 'ONGOING'}`);
  console.log(`  Months simulated: ${month}`);
  console.log(`  Spirals activated: ${spiralsActivated}/6`);
  console.log(`  Virtuous cascade: ${cascadeTriggered ? 'YES' : 'NO'}`);
  console.log(`  Overall QoL: ${(overallQoL * 100).toFixed(1)}%`);
  console.log(`  Final Gini: ${finalGini.toFixed(3)}`);
  console.log(`  Final temp: ${finalTemp.toFixed(2)}°C`);

  return {
    outcome: state.outcome,
    monthsSimulated: month,
    spiralsActivated,
    cascadeTriggered,
    finalQoL: overallQoL,
    finalGini,
    finalTemp,
  };
}

/**
 * Run Monte Carlo analysis across all scenarios
 */
function runMonteCarloScenarios(
  baseRunsPerScenario: number,
  maxMonths: number
): void {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 MONTE CARLO SCENARIO ANALYSIS');
  console.log('='.repeat(80));
  console.log(`Scenarios: ${Object.keys(SCENARIOS).length}`);
  console.log(`Runs per scenario: ${baseRunsPerScenario}`);
  console.log(`Max months: ${maxMonths}\n`);

  const results: Record<string, any[]> = {};

  // Run each scenario N times
  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running scenario: ${scenario.name} (${baseRunsPerScenario} runs)`);
    console.log('='.repeat(80));

    results[key] = [];

    for (let run = 0; run < baseRunsPerScenario; run++) {
      const runSeed = seed + run * 1000; // Different seed per run
      console.log(`\n--- Run ${run + 1}/${baseRunsPerScenario} (seed ${runSeed}) ---`);

      const result = runScenario(scenario, runSeed, maxMonths);
      results[key].push(result);
    }
  }

  // Aggregate results
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 MONTE CARLO RESULTS SUMMARY');
  console.log('='.repeat(80));

  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    const runs = results[key];
    const avgSpirals = runs.reduce((sum, r) => sum + r.spiralsActivated, 0) / runs.length;
    const cascadeRate = runs.filter(r => r.cascadeTriggered).length / runs.length;
    const avgQoL = runs.reduce((sum, r) => sum + r.finalQoL, 0) / runs.length;
    const avgGini = runs.reduce((sum, r) => sum + r.finalGini, 0) / runs.length;
    const avgTemp = runs.reduce((sum, r) => sum + r.finalTemp, 0) / runs.length;

    console.log(`\n${scenario.name}:`);
    console.log(`  Avg spirals: ${avgSpirals.toFixed(2)}/6`);
    console.log(`  Cascade rate: ${(cascadeRate * 100).toFixed(0)}%`);
    console.log(`  Avg QoL: ${(avgQoL * 100).toFixed(1)}%`);
    console.log(`  Avg Gini: ${avgGini.toFixed(3)}`);
    console.log(`  Avg temp: ${avgTemp.toFixed(2)}°C`);
  }

  console.log('\n✅ Monte Carlo analysis complete\n');
}

// Main execution
if (scenarioName === 'all') {
  // Run Monte Carlo across all scenarios
  runMonteCarloScenarios(3, maxMonths); // 3 runs per scenario (reduce from spec's 10 for speed)
} else {
  // Run single scenario
  const scenario = (SCENARIOS as any)[scenarioName];

  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioName}`);
    console.error(`Available scenarios: ${Object.keys(SCENARIOS).join(', ')}`);
    process.exit(1);
  }

  runScenario(scenario, seed, maxMonths);
}

console.log('\n✅ Scenario test complete\n');
