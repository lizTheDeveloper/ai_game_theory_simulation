/**
 * Phase 2 Scenario Analysis - Batch Runner
 *
 * Runs Monte Carlo analysis (N=10) for Phase 2 Core Scenarios.
 * Tests governance conditions that enable spiral activation.
 *
 * Usage:
 *   npx tsx scripts/runPhase2Scenarios.ts [priority]
 *
 * Arguments:
 *   priority - "high", "medium", "all" (default: high)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';
import type { ScenarioDefinition } from '../src/simulation/scenarios/types';
import { logSpiralActivationDiagnostics } from '../src/simulation/upwardSpirals';

const priority = process.argv[2] || 'high';
const N_RUNS = 10;
const MAX_MONTHS = 60; // Run for 5 years

// Scenario groupings
const HIGH_PRIORITY = ['scientificAcceleration', 'equalityFirst', 'climateFirst'];
const MEDIUM_PRIORITY = [
  'democraticParticipation',
  'aiAlignmentFirst',
  'authoritarianEfficiency',
  'highTrustStart',
  'lowInequalityStart',
  'strongInstitutionsStart',
  'renewableEnergyFirst',
  'carbonRemovalFirst',
  'foundationsFirst',
  'adaptiveDeployment',
];

interface ScenarioResult {
  scenarioName: string;
  seed: number;
  outcome: string | undefined;
  monthsSimulated: number;
  spiralsActivated: string[];
  spiralMonths: Record<string, number>;
  cascadeTriggered: boolean;
  finalMetrics: {
    qol: number;
    gini: number;
    temp: number;
    governanceQuality: number;
    researchSpending: number;
    climateStability: number;
  };
  spiralActivationMonths: Record<string, number | null>;
}

/**
 * Run a single scenario instance
 */
function runScenarioInstance(
  scenarioKey: string,
  scenario: ScenarioDefinition,
  seed: number,
  maxMonths: number
): ScenarioResult {
  console.log(`\n  🎲 Run seed ${seed}...`);

  // Create engine FIRST to get deterministic RNG
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());

  // Create initial state with RNG
  const state = createDefaultInitialState(rng);

  // Apply scenario modifications
  applyScenario(state, scenario, rng);

  // Create engine for simulation
  const engine = new SimulationEngine(undefined as any, seed);

  // Track spiral activation timing
  const spiralActivationMonths: Record<string, number | null> = {
    abundance: null,
    cognitive: null,
    democratic: null,
    scientific: null,
    meaning: null,
    ecological: null,
  };

  // Run simulation with spiral monitoring
  let month = 0;
  while (month < maxMonths) {
    engine.step(state);
    month = state.currentMonth;

    // Track first activation month for each spiral
    for (const [key, spiral] of Object.entries(state.upwardSpirals)) {
      if (key === 'cascadeMonths') continue;
      const spiralState = spiral as any;
      if (spiralState.active && spiralActivationMonths[key] === null) {
        spiralActivationMonths[key] = month;
      }
    }

    // Check for early termination
    if (state.outcome) {
      break;
    }
  }

  // Collect spiral state
  const spiralsActivated: string[] = [];
  const spiralMonths: Record<string, number> = {};

  for (const [key, spiral] of Object.entries(state.upwardSpirals)) {
    if (key === 'cascadeMonths') continue;
    const spiralState = spiral as any;
    if (spiralState.active || spiralState.monthsActive > 0) {
      spiralsActivated.push(key);
      spiralMonths[key] = spiralState.monthsActive || 0;
    }
  }

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
  const governanceQuality = state.governmentAgent?.governanceQuality ?? 0.5;
  const researchSpending = state.governmentAgent?.researchSpending ?? 0;
  const climateStability = state.qualityOfLifeSystems.climateStability;

  console.log(`    Outcome: ${state.outcome || 'ONGOING'}, Spirals: ${spiralsActivated.length}/6, Cascade: ${cascadeTriggered ? 'YES' : 'NO'}`);

  return {
    scenarioName: scenarioKey,
    seed,
    outcome: state.outcome,
    monthsSimulated: month,
    spiralsActivated,
    spiralMonths,
    cascadeTriggered,
    finalMetrics: {
      qol: overallQoL,
      gini: finalGini,
      temp: finalTemp,
      governanceQuality,
      researchSpending,
      climateStability,
    },
    spiralActivationMonths,
  };
}

/**
 * Run Monte Carlo for a scenario
 */
function runMonteCarloForScenario(
  scenarioKey: string,
  scenario: ScenarioDefinition,
  nRuns: number,
  maxMonths: number
): ScenarioResult[] {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔬 ${scenario.name} - Monte Carlo (N=${nRuns})`);
  console.log('='.repeat(80));

  const results: ScenarioResult[] = [];

  for (let run = 0; run < nRuns; run++) {
    const runSeed = 1000 + run * 1337; // Different seed per run
    const result = runScenarioInstance(scenarioKey, scenario, runSeed, maxMonths);
    results.push(result);
  }

  return results;
}

/**
 * Generate summary analysis
 */
function generateSummary(allResults: Record<string, ScenarioResult[]>): void {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PHASE 2 SCENARIO ANALYSIS - SUMMARY');
  console.log('='.repeat(80));

  for (const [scenarioKey, results] of Object.entries(allResults)) {
    const scenario = (SCENARIOS as any)[scenarioKey];

    // Calculate averages
    const avgSpirals = results.reduce((sum, r) => sum + r.spiralsActivated.length, 0) / results.length;
    const cascadeRate = results.filter(r => r.cascadeTriggered).length / results.length;
    const avgQoL = results.reduce((sum, r) => sum + r.finalMetrics.qol, 0) / results.length;
    const avgGini = results.reduce((sum, r) => sum + r.finalMetrics.gini, 0) / results.length;
    const avgTemp = results.reduce((sum, r) => sum + r.finalMetrics.temp, 0) / results.length;
    const avgGov = results.reduce((sum, r) => sum + r.finalMetrics.governanceQuality, 0) / results.length;
    const avgResearch = results.reduce((sum, r) => sum + r.finalMetrics.researchSpending, 0) / results.length;
    const avgClimate = results.reduce((sum, r) => sum + r.finalMetrics.climateStability, 0) / results.length;

    // Spiral activation rates
    const spiralActivationRates: Record<string, number> = {};
    const spiralActivationTimings: Record<string, number[]> = {};

    for (const spiralName of ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological']) {
      const activationCount = results.filter(r => r.spiralsActivated.includes(spiralName)).length;
      spiralActivationRates[spiralName] = activationCount / results.length;

      // Collect activation timings (non-null only)
      spiralActivationTimings[spiralName] = results
        .map(r => r.spiralActivationMonths[spiralName])
        .filter(m => m !== null) as number[];
    }

    // Outcome distribution
    const outcomes: Record<string, number> = {};
    for (const result of results) {
      const outcome = result.outcome || 'ONGOING';
      outcomes[outcome] = (outcomes[outcome] || 0) + 1;
    }

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📌 ${scenario.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`  Description: ${scenario.description}`);
    console.log(`\n  🎯 Spiral Activation Rates (N=${results.length}):`);
    console.log(`    Abundance:   ${(spiralActivationRates.abundance * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.abundance.length > 0 ? (spiralActivationTimings.abundance.reduce((a,b) => a+b, 0) / spiralActivationTimings.abundance.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`    Cognitive:   ${(spiralActivationRates.cognitive * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.cognitive.length > 0 ? (spiralActivationTimings.cognitive.reduce((a,b) => a+b, 0) / spiralActivationTimings.cognitive.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`    Democratic:  ${(spiralActivationRates.democratic * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.democratic.length > 0 ? (spiralActivationTimings.democratic.reduce((a,b) => a+b, 0) / spiralActivationTimings.democratic.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`    Scientific:  ${(spiralActivationRates.scientific * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.scientific.length > 0 ? (spiralActivationTimings.scientific.reduce((a,b) => a+b, 0) / spiralActivationTimings.scientific.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`    Meaning:     ${(spiralActivationRates.meaning * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.meaning.length > 0 ? (spiralActivationTimings.meaning.reduce((a,b) => a+b, 0) / spiralActivationTimings.meaning.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`    Ecological:  ${(spiralActivationRates.ecological * 100).toFixed(0)}% (avg timing: ${spiralActivationTimings.ecological.length > 0 ? (spiralActivationTimings.ecological.reduce((a,b) => a+b, 0) / spiralActivationTimings.ecological.length).toFixed(0) : 'N/A'} mo)`);
    console.log(`\n  📊 Averages:`);
    console.log(`    Total spirals:       ${avgSpirals.toFixed(2)}/6`);
    console.log(`    Cascade rate:        ${(cascadeRate * 100).toFixed(0)}%`);
    console.log(`    QoL:                 ${(avgQoL * 100).toFixed(1)}%`);
    console.log(`    Gini:                ${avgGini.toFixed(3)}`);
    console.log(`    Temp:                ${avgTemp.toFixed(2)}°C`);
    console.log(`    Governance quality:  ${(avgGov * 100).toFixed(1)}%`);
    console.log(`    Research spending:   $${(avgResearch / 1e9).toFixed(1)}B`);
    console.log(`    Climate stability:   ${(avgClimate * 100).toFixed(1)}%`);
    console.log(`\n  🎲 Outcome Distribution:`);
    for (const [outcome, count] of Object.entries(outcomes).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${outcome}: ${count}/${results.length} (${((count / results.length) * 100).toFixed(0)}%)`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Phase 2 Scenario Analysis Complete');
  console.log('='.repeat(80) + '\n');
}

// Main execution
const scenariosToRun = (() => {
  switch (priority) {
    case 'high':
      return HIGH_PRIORITY;
    case 'medium':
      return MEDIUM_PRIORITY;
    case 'all':
      return [...HIGH_PRIORITY, ...MEDIUM_PRIORITY];
    default:
      console.error(`❌ Unknown priority: ${priority}`);
      console.error(`Available: high, medium, all`);
      process.exit(1);
  }
})();

console.log('\n' + '='.repeat(80));
console.log('🚀 PHASE 2 SCENARIO ANALYSIS - BATCH RUNNER');
console.log('='.repeat(80));
console.log(`Priority level: ${priority}`);
console.log(`Scenarios to run: ${scenariosToRun.length}`);
console.log(`Runs per scenario: ${N_RUNS}`);
console.log(`Max months: ${MAX_MONTHS}`);
console.log(`Total runs: ${scenariosToRun.length * N_RUNS}`);
console.log('='.repeat(80));

const allResults: Record<string, ScenarioResult[]> = {};

for (const scenarioKey of scenariosToRun) {
  const scenario = (SCENARIOS as any)[scenarioKey];
  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioKey}`);
    continue;
  }

  allResults[scenarioKey] = runMonteCarloForScenario(scenarioKey, scenario, N_RUNS, MAX_MONTHS);
}

// Generate summary
generateSummary(allResults);

console.log('\n✅ All scenarios complete. Results logged above.\n');
