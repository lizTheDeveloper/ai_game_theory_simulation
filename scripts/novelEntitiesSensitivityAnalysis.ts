#!/usr/bin/env tsx
/**
 * Novel Entities Parameter Sensitivity Analysis
 *
 * Monte Carlo validation with parameter sensitivity for Novel Entities implementation.
 *
 * Tests three parameter sets across N=30 runs:
 * - Baseline (current implementation): timeLag=20y, rebound=0.7, irreversible=0.90
 * - Optimistic: timeLag=10y, rebound=0.5, irreversible=0.80
 * - Pessimistic: timeLag=30y, rebound=0.9, irreversible=0.95
 *
 * Research context: research/novel_entities_zero_effectiveness_20251113.md
 * Design plan: plans/novel_entities_model_redesign_20251113.md
 * Quality Gate 2 requirement: Sensitivity analysis on derived parameters
 *
 * Output: logs/novel_entities_sensitivity/*.json
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// PARAMETER RANGES
// ============================================================================

interface ParameterSet {
  name: string;
  timeLagYears: number;      // 10-30 years (deployment scale-up time)
  reboundCoefficient: number; // 0.5-0.9 (fraction of cleanup offset by induced production)
  irreversibilityFloor: number; // 0.80-0.95 (fraction of contamination that's permanent)
}

const PARAMETER_SETS: ParameterSet[] = [
  {
    name: 'baseline',
    timeLagYears: 20,
    reboundCoefficient: 0.7,
    irreversibilityFloor: 0.90
  },
  {
    name: 'optimistic',
    timeLagYears: 10,
    reboundCoefficient: 0.5,
    irreversibilityFloor: 0.80
  },
  {
    name: 'pessimistic',
    timeLagYears: 30,
    reboundCoefficient: 0.9,
    irreversibilityFloor: 0.95
  }
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const RUNS_PER_PARAMETER_SET = 10;
const SIMULATION_DURATION_MONTHS = 120; // 10 years
const SEED_START = 50000;
const OUTPUT_DIR = path.join(__dirname, '..', 'logs', 'novel_entities_sensitivity');

// God mode configuration (all technologies unlocked immediately)
const GOD_MODE = true;

// ============================================================================
// OUTPUT SETUP
// ============================================================================

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const summaryFile = path.join(OUTPUT_DIR, `summary_${timestamp}.json`);

// ============================================================================
// PARAMETER INJECTION
// ============================================================================

/**
 * Modifies the effectsEngine.ts parameters dynamically for testing.
 *
 * WARNING: This is a HACK for sensitivity testing ONLY.
 * NOT for production use. The "proper" solution would be to make
 * these parameters part of GameState configuration, but that's a
 * larger architectural change. For sensitivity analysis, this works.
 */
function injectParameters(params: ParameterSet): void {
  const effectsEnginePath = path.join(__dirname, '..', 'src', 'simulation', 'techTree', 'effectsEngine.ts');
  let content = fs.readFileSync(effectsEnginePath, 'utf8');

  // Replace timeLagMonths (line 209)
  const timeLagMonths = params.timeLagYears * 12;
  content = content.replace(
    /const timeLagMonths = \d+;/,
    `const timeLagMonths = ${timeLagMonths}; // INJECTED: ${params.name} scenario`
  );

  // Replace reboundFactor (line 224)
  content = content.replace(
    /const reboundFactor = [\d.]+;/,
    `const reboundFactor = ${params.reboundCoefficient}; // INJECTED: ${params.name} scenario`
  );

  // Replace irreversibility multiplier (line 400)
  const reversibleFraction = 1.0 - params.irreversibilityFloor;
  content = content.replace(
    /scaledValue \*= [\d.]+;  \/\/ Max \d+% impact on irreversible contamination/,
    `scaledValue *= ${reversibleFraction};  // INJECTED: ${params.name} scenario - Max ${(reversibleFraction * 100).toFixed(0)}% impact on irreversible contamination`
  );

  fs.writeFileSync(effectsEnginePath, content, 'utf8');
  console.log(`✅ Injected parameters: ${params.name} (timeLag=${params.timeLagYears}y, rebound=${params.reboundCoefficient}, irreversible=${params.irreversibilityFloor})`);
}

/**
 * Restore original parameters (baseline)
 */
function restoreOriginalParameters(): void {
  const baselineParams = PARAMETER_SETS.find(p => p.name === 'baseline')!;
  injectParameters(baselineParams);
  console.log(`✅ Restored baseline parameters`);
}

// ============================================================================
// SIMULATION RUNNER
// ============================================================================

interface SimulationResult {
  parameterSet: string;
  runIndex: number;
  seed: number;
  duration: number;
  finalMonth: number;

  // Novel Entities metrics
  initialNovelEntitiesBoundary: number;
  finalNovelEntitiesBoundary: number;
  reductionAbsolute: number;
  effectivenessPercent: number;

  // Deployment tracking
  techsDeployed: number;
  remediationTechsDeployed: number;
  preventionTechsDeployed: number;

  // Population
  initialPopulation: number;
  finalPopulation: number;
  populationChange: number;

  // QoL
  finalQoLOverall: number;

  // Outcome
  outcome: string;
  extinctionTriggered: boolean;
}

async function runSimulation(paramSet: ParameterSet, runIndex: number, seed: number): Promise<SimulationResult> {
  console.log(`\n=== Starting Run ${runIndex + 1}/10 for ${paramSet.name} (seed: ${seed}) ===`);

  // Create RNG function from seed
  function seededRNG(): number {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Create initial state with RNG
  const initialState = createDefaultInitialState(seededRNG);
  initialState.rngSeed = seed;

  // GOD MODE: Unlock all technologies immediately
  if (GOD_MODE) {
    // Implementation note: The actual god mode implementation depends on
    // the tech tree structure. For now, we'll let the simulation run naturally
    // but with aggressive auto-deployment settings.
    // A proper god mode would require modifying the tech tree state directly.
    console.log(`⚠️  God mode requested but not yet implemented in this script`);
    console.log(`    Simulation will run with natural tech progression`);
  }

  const initialNovelEntities = initialState.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
  const initialPopulation = initialState.humanPopulationSystem?.population || 0;

  // Create engine and run
  const engine = new SimulationEngine({ seed, maxMonths: SIMULATION_DURATION_MONTHS });

  // Run simulation with observer for progress tracking
  let lastYear = -1;
  const observer = {
    onMonthComplete: (state: any) => {
      const currentYear = Math.floor(state.currentMonth / 12);
      if (currentYear !== lastYear) {
        lastYear = currentYear;
        const novelEntities = state.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
        console.log(`  Year ${currentYear}: Novel Entities = ${(novelEntities * 100).toFixed(1)}%`);
      }
    }
  };

  const runResult = engine.run(initialState, {
    maxMonths: SIMULATION_DURATION_MONTHS,
    checkActualOutcomes: false,
    observer
  });

  const finalState = runResult.finalState;

  // Calculate metrics
  const finalNovelEntities = finalState.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
  const finalPopulation = finalState.humanPopulationSystem?.population || 0;

  const reductionAbsolute = initialNovelEntities - finalNovelEntities;
  const effectivenessPercent = initialNovelEntities > 0
    ? (reductionAbsolute / initialNovelEntities) * 100
    : 0;

  // Count deployed technologies
  const techTreeState = finalState.techTreeState;
  const techsDeployed = techTreeState?.unlockedTech?.length || 0;

  // Count remediation vs prevention techs (simplified - would need tech tree metadata)
  const remediationTechsDeployed = 0; // TODO: Parse tech metadata
  const preventionTechsDeployed = 0; // TODO: Parse tech metadata

  // QoL
  const qolSystems = finalState.qualityOfLifeSystems;
  const finalQoLOverall = qolSystems
    ? Object.values(qolSystems).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) / Object.keys(qolSystems).length
    : 0;

  // Outcome
  const outcome = finalState.extinctionState?.extinctionTriggered
    ? `extinction_${finalState.extinctionState.extinctionType}`
    : 'survival';

  const result: SimulationResult = {
    parameterSet: paramSet.name,
    runIndex,
    seed,
    duration: SIMULATION_DURATION_MONTHS,
    finalMonth: finalState.currentMonth,

    initialNovelEntitiesBoundary: initialNovelEntities,
    finalNovelEntitiesBoundary: finalNovelEntities,
    reductionAbsolute,
    effectivenessPercent,

    techsDeployed,
    remediationTechsDeployed,
    preventionTechsDeployed,

    initialPopulation,
    finalPopulation,
    populationChange: finalPopulation - initialPopulation,

    finalQoLOverall,

    outcome,
    extinctionTriggered: finalState.extinctionState?.extinctionTriggered || false
  };

  console.log(`✅ Completed: Effectiveness = ${effectivenessPercent.toFixed(2)}%, Population = ${(finalPopulation / 1e9).toFixed(2)}B`);

  return result;
}

// ============================================================================
// STATISTICAL ANALYSIS
// ============================================================================

interface ParameterSetStats {
  parameterSet: string;
  parameters: ParameterSet;
  n: number;

  // Novel Entities effectiveness
  effectivenessMean: number;
  effectivenessStd: number;
  effectivenessCV: number;
  effectivenessMin: number;
  effectivenessMax: number;

  // Boundary reduction
  boundaryReductionMean: number;
  boundaryReductionStd: number;

  // Population
  populationChangeMean: number;
  populationChangeStd: number;

  // Outcomes
  survivalRate: number;
  extinctionRate: number;
  outcomeDistribution: Record<string, number>;
}

function calculateStats(results: SimulationResult[]): ParameterSetStats {
  const n = results.length;
  if (n === 0) throw new Error('No results to analyze');

  const paramSet = PARAMETER_SETS.find(p => p.name === results[0].parameterSet)!;

  // Effectiveness metrics
  const effectivenesses = results.map(r => r.effectivenessPercent);
  const effectivenessMean = effectivenesses.reduce((sum, v) => sum + v, 0) / n;
  const effectivenessVariance = effectivenesses.reduce((sum, v) => sum + Math.pow(v - effectivenessMean, 2), 0) / n;
  const effectivenessStd = Math.sqrt(effectivenessVariance);
  const effectivenessCV = effectivenessMean !== 0 ? (effectivenessStd / effectivenessMean) * 100 : 0;

  // Boundary reduction
  const reductions = results.map(r => r.reductionAbsolute);
  const boundaryReductionMean = reductions.reduce((sum, v) => sum + v, 0) / n;
  const boundaryReductionVariance = reductions.reduce((sum, v) => sum + Math.pow(v - boundaryReductionMean, 2), 0) / n;
  const boundaryReductionStd = Math.sqrt(boundaryReductionVariance);

  // Population
  const popChanges = results.map(r => r.populationChange);
  const populationChangeMean = popChanges.reduce((sum, v) => sum + v, 0) / n;
  const populationChangeVariance = popChanges.reduce((sum, v) => sum + Math.pow(v - populationChangeMean, 2), 0) / n;
  const populationChangeStd = Math.sqrt(populationChangeVariance);

  // Outcomes
  const survivalRate = results.filter(r => !r.extinctionTriggered).length / n;
  const extinctionRate = results.filter(r => r.extinctionTriggered).length / n;

  const outcomeDistribution: Record<string, number> = {};
  results.forEach(r => {
    outcomeDistribution[r.outcome] = (outcomeDistribution[r.outcome] || 0) + 1;
  });

  return {
    parameterSet: paramSet.name,
    parameters: paramSet,
    n,

    effectivenessMean,
    effectivenessStd,
    effectivenessCV,
    effectivenessMin: Math.min(...effectivenesses),
    effectivenessMax: Math.max(...effectivenesses),

    boundaryReductionMean,
    boundaryReductionStd,

    populationChangeMean,
    populationChangeStd,

    survivalRate,
    extinctionRate,
    outcomeDistribution
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(`\n=== Novel Entities Parameter Sensitivity Analysis ===`);
  console.log(`Duration: ${SIMULATION_DURATION_MONTHS} months (${SIMULATION_DURATION_MONTHS / 12} years)`);
  console.log(`Runs per parameter set: ${RUNS_PER_PARAMETER_SET}`);
  console.log(`Total runs: ${PARAMETER_SETS.length * RUNS_PER_PARAMETER_SET}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`\nParameter sets:`);
  PARAMETER_SETS.forEach(p => {
    console.log(`  ${p.name}: timeLag=${p.timeLagYears}y, rebound=${p.reboundCoefficient}, irreversible=${p.irreversibilityFloor}`);
  });

  const allResults: SimulationResult[] = [];
  const allStats: ParameterSetStats[] = [];

  for (const paramSet of PARAMETER_SETS) {
    console.log(`\n\n========================================`);
    console.log(`=== PARAMETER SET: ${paramSet.name.toUpperCase()} ===`);
    console.log(`========================================`);

    // Inject parameters
    injectParameters(paramSet);

    const setResults: SimulationResult[] = [];

    for (let i = 0; i < RUNS_PER_PARAMETER_SET; i++) {
      const seed = SEED_START + (PARAMETER_SETS.indexOf(paramSet) * RUNS_PER_PARAMETER_SET) + i;
      const result = await runSimulation(paramSet, i, seed);
      setResults.push(result);
      allResults.push(result);

      // Save individual result
      const resultFile = path.join(OUTPUT_DIR, `${paramSet.name}_run${i + 1}_seed${seed}.json`);
      fs.writeFileSync(resultFile, JSON.stringify(result, null, 2), 'utf8');
    }

    // Calculate and save statistics
    const stats = calculateStats(setResults);
    allStats.push(stats);

    console.log(`\n=== ${paramSet.name.toUpperCase()} STATISTICS ===`);
    console.log(`Effectiveness: ${stats.effectivenessMean.toFixed(2)}% ± ${stats.effectivenessStd.toFixed(2)}% (CV=${stats.effectivenessCV.toFixed(2)}%)`);
    console.log(`Range: ${stats.effectivenessMin.toFixed(2)}% - ${stats.effectivenessMax.toFixed(2)}%`);
    console.log(`Boundary reduction: ${(stats.boundaryReductionMean * 100).toFixed(2)}% ± ${(stats.boundaryReductionStd * 100).toFixed(2)}%`);
    console.log(`Population change: ${(stats.populationChangeMean / 1e9).toFixed(3)}B ± ${(stats.populationChangeStd / 1e9).toFixed(3)}B`);
    console.log(`Survival rate: ${(stats.survivalRate * 100).toFixed(1)}%`);
    console.log(`Outcome distribution:`, stats.outcomeDistribution);

    const statsFile = path.join(OUTPUT_DIR, `${paramSet.name}_stats.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
  }

  // Restore original parameters
  restoreOriginalParameters();

  // Save comprehensive summary
  const summary = {
    timestamp,
    configuration: {
      runsPerSet: RUNS_PER_PARAMETER_SET,
      durationMonths: SIMULATION_DURATION_MONTHS,
      seedStart: SEED_START,
      godMode: GOD_MODE
    },
    parameterSets: PARAMETER_SETS,
    statistics: allStats,
    allResults
  };

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

  console.log(`\n\n========================================`);
  console.log(`=== ANALYSIS COMPLETE ===`);
  console.log(`========================================`);
  console.log(`Total runs: ${allResults.length}`);
  console.log(`Summary saved: ${summaryFile}`);
  console.log(`Individual results: ${OUTPUT_DIR}`);

  console.log(`\n=== COMPARATIVE STATISTICS ===`);
  allStats.forEach(stats => {
    console.log(`\n${stats.parameterSet.toUpperCase()}:`);
    console.log(`  Effectiveness: ${stats.effectivenessMean.toFixed(2)}% (CV=${stats.effectivenessCV.toFixed(2)}%)`);
    console.log(`  Survival: ${(stats.survivalRate * 100).toFixed(1)}%`);
  });

  console.log(`\n✅ Sensitivity analysis complete. Parameters restored to baseline.`);
}

// Run with error handling
main().catch(err => {
  console.error(`\n❌ FATAL ERROR:`, err);
  // Restore baseline parameters even on error
  try {
    restoreOriginalParameters();
    console.log(`✅ Baseline parameters restored after error`);
  } catch (restoreErr) {
    console.error(`❌ Failed to restore baseline parameters:`, restoreErr);
  }
  process.exit(1);
});
