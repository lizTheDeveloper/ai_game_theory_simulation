/**
 * Phase 2 Scenario Analysis - Batch Runner with JSON Export
 *
 * Enhanced version of runPhase2Scenarios.ts that exports structured JSON
 * for detailed Phase 4 analysis.
 *
 * Usage:
 *   npx tsx scripts/runPhase2ScenariosWithJSON.ts [priority]
 *
 * Arguments:
 *   priority - "high", "medium", "all" (default: high)
 *
 * Output:
 *   - Console logs (same as original)
 *   - JSON: /logs/phase2_results_YYYYMMDD_HHMMSS.json
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIOS } from '../src/simulation/scenarios/definitions';
import { applyScenario } from '../src/simulation/scenarios/apply';
import type { ScenarioDefinition } from '../src/simulation/scenarios/types';
import * as fs from 'fs';
import * as path from 'path';

const priority = process.argv[2] || 'high';
const N_RUNS = 10;
const MAX_MONTHS = 60;

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
  scenarioKey: string;
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
    population: number;
    ecosystemHealth: number;
    socialCohesion: number;
  };
  spiralActivationMonths: Record<string, number | null>;
}

interface BatchResults {
  metadata: {
    timestamp: string;
    priority: string;
    nScenarios: number;
    nRunsPerScenario: number;
    maxMonths: number;
    totalRuns: number;
  };
  scenarios: {
    [scenarioKey: string]: {
      name: string;
      description: string;
      runs: ScenarioResult[];
      summary: {
        nRuns: number;
        avgSpirals: number;
        cascadeRate: number;
        spiralActivationRates: Record<string, number>;
        avgMetrics: {
          qol: number;
          gini: number;
          temp: number;
          governanceQuality: number;
          researchSpending: number;
          climateStability: number;
        };
        stdDevMetrics: {
          qol: number;
          gini: number;
          temp: number;
        };
        cvMetrics: {
          qol: number;
          gini: number;
          temp: number;
        };
        outcomeDistribution: Record<string, number>;
      };
    };
  };
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
  const population = state.humanPopulationSystem?.population ?? 8e9;
  const ecosystemHealth = state.qualityOfLifeSystems.ecosystemHealth;
  const socialCohesion = state.socialCohesion?.cohesion ?? 0.5;

  console.log(`    Outcome: ${state.outcome || 'ONGOING'}, Spirals: ${spiralsActivated.length}/6, Cascade: ${cascadeTriggered ? 'YES' : 'NO'}`);

  return {
    scenarioName: scenario.name,
    scenarioKey,
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
      population,
      ecosystemHealth,
      socialCohesion,
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
    const runSeed = 1000 + run * 1337;
    const result = runScenarioInstance(scenarioKey, scenario, runSeed, maxMonths);
    results.push(result);
  }

  return results;
}

/**
 * Calculate summary statistics for a scenario
 */
function calculateSummary(results: ScenarioResult[]): any {
  const n = results.length;

  // Spiral activation rates
  const spiralActivationRates: Record<string, number> = {};
  for (const spiralName of ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological']) {
    const activationCount = results.filter(r => r.spiralsActivated.includes(spiralName)).length;
    spiralActivationRates[spiralName] = activationCount / n;
  }

  const cascadeRate = results.filter(r => r.cascadeTriggered).length / n;
  const avgSpirals = results.reduce((sum, r) => sum + r.spiralsActivated.length, 0) / n;

  // Average metrics
  const avgQoL = results.reduce((sum, r) => sum + r.finalMetrics.qol, 0) / n;
  const avgGini = results.reduce((sum, r) => sum + r.finalMetrics.gini, 0) / n;
  const avgTemp = results.reduce((sum, r) => sum + r.finalMetrics.temp, 0) / n;
  const avgGov = results.reduce((sum, r) => sum + r.finalMetrics.governanceQuality, 0) / n;
  const avgResearch = results.reduce((sum, r) => sum + r.finalMetrics.researchSpending, 0) / n;
  const avgClimate = results.reduce((sum, r) => sum + r.finalMetrics.climateStability, 0) / n;

  // Standard deviations
  const stdDevQoL = Math.sqrt(results.reduce((sum, r) => sum + Math.pow(r.finalMetrics.qol - avgQoL, 2), 0) / n);
  const stdDevGini = Math.sqrt(results.reduce((sum, r) => sum + Math.pow(r.finalMetrics.gini - avgGini, 2), 0) / n);
  const stdDevTemp = Math.sqrt(results.reduce((sum, r) => sum + Math.pow(r.finalMetrics.temp - avgTemp, 2), 0) / n);

  // Coefficient of variation
  const cvQoL = avgQoL > 0 ? stdDevQoL / avgQoL : 0;
  const cvGini = avgGini > 0 ? stdDevGini / avgGini : 0;
  const cvTemp = avgTemp > 0 ? stdDevTemp / avgTemp : 0;

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  for (const result of results) {
    const outcome = result.outcome || 'ONGOING';
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
  }

  return {
    nRuns: n,
    avgSpirals,
    cascadeRate,
    spiralActivationRates,
    avgMetrics: {
      qol: avgQoL,
      gini: avgGini,
      temp: avgTemp,
      governanceQuality: avgGov,
      researchSpending: avgResearch,
      climateStability: avgClimate,
    },
    stdDevMetrics: {
      qol: stdDevQoL,
      gini: stdDevGini,
      temp: stdDevTemp,
    },
    cvMetrics: {
      qol: cvQoL,
      gini: cvGini,
      temp: cvTemp,
    },
    outcomeDistribution: outcomes,
  };
}

/**
 * Generate summary console output (same as original)
 */
function generateConsoleSummary(batchResults: BatchResults): void {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PHASE 2 SCENARIO ANALYSIS - SUMMARY');
  console.log('='.repeat(80));

  for (const [scenarioKey, scenarioData] of Object.entries(batchResults.scenarios)) {
    const s = scenarioData.summary;

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📌 ${scenarioData.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`  Description: ${scenarioData.description}`);
    console.log(`\n  🎯 Spiral Activation Rates (N=${s.nRuns}):`);
    console.log(`    Abundance:   ${(s.spiralActivationRates.abundance * 100).toFixed(0)}%`);
    console.log(`    Cognitive:   ${(s.spiralActivationRates.cognitive * 100).toFixed(0)}%`);
    console.log(`    Democratic:  ${(s.spiralActivationRates.democratic * 100).toFixed(0)}%`);
    console.log(`    Scientific:  ${(s.spiralActivationRates.scientific * 100).toFixed(0)}%`);
    console.log(`    Meaning:     ${(s.spiralActivationRates.meaning * 100).toFixed(0)}%`);
    console.log(`    Ecological:  ${(s.spiralActivationRates.ecological * 100).toFixed(0)}%`);
    console.log(`\n  📊 Averages:`);
    console.log(`    Total spirals:       ${s.avgSpirals.toFixed(2)}/6`);
    console.log(`    Cascade rate:        ${(s.cascadeRate * 100).toFixed(0)}%`);
    console.log(`    QoL:                 ${(s.avgMetrics.qol * 100).toFixed(1)}%`);
    console.log(`    Gini:                ${s.avgMetrics.gini.toFixed(3)}`);
    console.log(`    Temp:                ${s.avgMetrics.temp.toFixed(2)}°C`);
    console.log(`    Governance quality:  ${(s.avgMetrics.governanceQuality * 100).toFixed(1)}%`);
    console.log(`    Research spending:   $${(s.avgMetrics.researchSpending / 1e9).toFixed(1)}B`);
    console.log(`    Climate stability:   ${(s.avgMetrics.climateStability * 100).toFixed(1)}%`);
    console.log(`\n  📈 Variance (CV for determinism check):`);
    console.log(`    QoL CV:    ${(s.cvMetrics.qol * 100).toFixed(2)}%`);
    console.log(`    Gini CV:   ${(s.cvMetrics.gini * 100).toFixed(2)}%`);
    console.log(`    Temp CV:   ${(s.cvMetrics.temp * 100).toFixed(2)}%`);
    console.log(`\n  🎲 Outcome Distribution:`);
    for (const [outcome, count] of Object.entries(s.outcomeDistribution).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${outcome}: ${count}/${s.nRuns} (${((count / s.nRuns) * 100).toFixed(0)}%)`);
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
console.log('🚀 PHASE 2 SCENARIO ANALYSIS - BATCH RUNNER (JSON Export Enabled)');
console.log('='.repeat(80));
console.log(`Priority level: ${priority}`);
console.log(`Scenarios to run: ${scenariosToRun.length}`);
console.log(`Runs per scenario: ${N_RUNS}`);
console.log(`Max months: ${MAX_MONTHS}`);
console.log(`Total runs: ${scenariosToRun.length * N_RUNS}`);
console.log('='.repeat(80));

const batchResults: BatchResults = {
  metadata: {
    timestamp: new Date().toISOString(),
    priority,
    nScenarios: scenariosToRun.length,
    nRunsPerScenario: N_RUNS,
    maxMonths: MAX_MONTHS,
    totalRuns: scenariosToRun.length * N_RUNS,
  },
  scenarios: {},
};

for (const scenarioKey of scenariosToRun) {
  const scenario = (SCENARIOS as any)[scenarioKey];
  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioKey}`);
    continue;
  }

  const runs = runMonteCarloForScenario(scenarioKey, scenario, N_RUNS, MAX_MONTHS);
  const summary = calculateSummary(runs);

  batchResults.scenarios[scenarioKey] = {
    name: scenario.name,
    description: scenario.description,
    runs,
    summary,
  };
}

// Generate console summary
generateConsoleSummary(batchResults);

// Export JSON
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const jsonPath = path.join('/home/user/ai_game_theory_simulation/logs', `phase2_results_${timestamp}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(batchResults, null, 2));

console.log(`\n✅ JSON results exported to: ${jsonPath}`);
console.log(`   Use this file for detailed Phase 4 analysis:\n`);
console.log(`   - Per-run variance analysis`);
console.log(`   - Coefficient of variation (CV) for determinism checks`);
console.log(`   - Detailed spiral activation timing`);
console.log(`   - Complete outcome distributions\n`);
