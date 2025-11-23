#!/usr/bin/env tsx
/**
 * Three-Phase Coordination Parameter Sensitivity Analysis
 *
 * Quality Gate 1 validation identified HIGH UNCERTAINTY parameters:
 * 1. irreversibleFraction [0.80-0.95] ± 7.5% (Novel Entities)
 * 2. reboundFactor [0.5-0.9] ± 20% (Jevons Paradox)
 *
 * Research Context:
 * - research/verification_8da0700_20251120.md
 * - reviews/verification_8da0700_critique_20251121.md (Quality Gate 1: CONDITIONAL PASS)
 *
 * Sensitivity Analysis Design:
 * - Test matrix: 9 combinations (3 × 3)
 * - irreversibleFraction: {0.80, 0.875, 0.95}
 * - reboundFactor: {0.5, 0.7, 0.9}
 * - N=10 Monte Carlo runs per combination
 * - Duration: 240 months (20 years) to observe rebound effects
 *
 * Analysis Questions:
 * 1. Which parameter has larger effect on outcomes?
 * 2. Are there threshold effects (cliff edges)?
 * 3. Do parameters interact (non-additive effects)?
 * 4. Are outcomes robust across parameter ranges?
 * 5. Which parameter needs refinement most urgently?
 *
 * Expected Outcomes:
 * - Sensitivity heatmap showing outcome stability
 * - Recommendation on parameter refinement priority
 * - Confidence assessment for implementation
 * - Identification of implausible parameter combinations
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// PARAMETER RANGES (Quality Gate 1 High Uncertainty)
// ============================================================================

interface ParameterSet {
  name: string;
  irreversibleFraction: number;  // [0.80-0.95] Novel Entities parameter
  reboundFactor: number;          // [0.5-0.9] Jevons Paradox parameter
}

const PARAMETER_SETS: ParameterSet[] = [
  // Low irreversibility (0.80) - more optimistic cleanup potential
  { name: 'low_irrev_low_rebound', irreversibleFraction: 0.80, reboundFactor: 0.5 },
  { name: 'low_irrev_mid_rebound', irreversibleFraction: 0.80, reboundFactor: 0.7 },
  { name: 'low_irrev_high_rebound', irreversibleFraction: 0.80, reboundFactor: 0.9 },

  // Mid irreversibility (0.875) - current baseline
  { name: 'mid_irrev_low_rebound', irreversibleFraction: 0.875, reboundFactor: 0.5 },
  { name: 'mid_irrev_mid_rebound', irreversibleFraction: 0.875, reboundFactor: 0.7 },  // BASELINE
  { name: 'mid_irrev_high_rebound', irreversibleFraction: 0.875, reboundFactor: 0.9 },

  // High irreversibility (0.95) - most pessimistic
  { name: 'high_irrev_low_rebound', irreversibleFraction: 0.95, reboundFactor: 0.5 },
  { name: 'high_irrev_mid_rebound', irreversibleFraction: 0.95, reboundFactor: 0.7 },
  { name: 'high_irrev_high_rebound', irreversibleFraction: 0.95, reboundFactor: 0.9 },
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const RUNS_PER_PARAMETER_SET = 10;
const SIMULATION_DURATION_MONTHS = 240;  // 20 years (rebound takes 10-30 years)
const SEED_START = 70000;
const OUTPUT_DIR = path.join(__dirname, '..', 'logs', 'three_phase_sensitivity');

// ============================================================================
// OUTPUT SETUP
// ============================================================================

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const summaryFile = path.join(OUTPUT_DIR, `summary_${timestamp}.json`);

console.log(`\n=== Three-Phase Coordination Sensitivity Analysis ===`);
console.log(`Quality Gate 1: CONDITIONAL PASS - Sensitivity analysis REQUIRED`);
console.log(`Output directory: ${OUTPUT_DIR}`);
console.log(`Duration: ${SIMULATION_DURATION_MONTHS} months (${SIMULATION_DURATION_MONTHS / 12} years)`);
console.log(`Runs per parameter set: ${RUNS_PER_PARAMETER_SET}`);
console.log(`Total runs: ${PARAMETER_SETS.length * RUNS_PER_PARAMETER_SET}`);

// ============================================================================
// SIMULATION RESULT INTERFACE
// ============================================================================

interface SimulationResult {
  parameterSet: string;
  runIndex: number;
  seed: number;

  // Parameter values
  irreversibleFraction: number;
  reboundFactor: number;

  // Novel Entities metrics
  initialNovelEntitiesBoundary: number;
  finalNovelEntitiesBoundary: number;
  novelEntitiesReductionAbsolute: number;
  novelEntitiesEffectivenessPercent: number;

  // Biogeochemical Flows metrics
  initialBiogeochemicalBoundary: number;
  finalBiogeochemicalBoundary: number;
  biogeochemicalReductionAbsolute: number;
  biogeochemicalEffectivenessPercent: number;

  // Population
  initialPopulation: number;
  finalPopulation: number;
  populationChangePercent: number;

  // QoL
  finalQoLOverall: number;
  finalQoLHealth: number;
  finalQoLEnvironment: number;

  // Outcome
  outcome: string;
  extinctionTriggered: boolean;

  // Energy metrics
  finalRenewablePercentage: number;
  finalDataCenterPower: number;
}

// ============================================================================
// SIMULATION RUNNER
// ============================================================================

async function runSimulation(paramSet: ParameterSet, runIndex: number, seed: number): Promise<SimulationResult> {
  console.log(`\n=== Run ${runIndex + 1}/${RUNS_PER_PARAMETER_SET}: ${paramSet.name} (seed: ${seed}) ===`);

  // Create RNG function from seed
  function seededRNG(): number {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Create initial state
  const initialState = createDefaultInitialState(seededRNG);
  initialState.rngSeed = seed;

  // INJECT PARAMETERS: Modify Novel Entities system state
  if (initialState.novelEntitiesSystem) {
    initialState.novelEntitiesSystem.irreversibleFraction = paramSet.irreversibleFraction;
    initialState.novelEntitiesSystem.reboundFactor = paramSet.reboundFactor;

    // Recalculate irreversible/reversible stock split
    const totalStock = initialState.novelEntitiesSystem.accumulatedStock || 1800000;
    initialState.novelEntitiesSystem.irreversibleStock = totalStock * paramSet.irreversibleFraction;
    initialState.novelEntitiesSystem.reversibleStock = totalStock * (1.0 - paramSet.irreversibleFraction);
    initialState.novelEntitiesSystem.minimumAchievableLevel = initialState.novelEntitiesSystem.irreversibleStock;

    console.log(`  📊 Parameters: irreversible=${(paramSet.irreversibleFraction * 100).toFixed(1)}%, rebound=${(paramSet.reboundFactor * 100).toFixed(0)}%`);
    console.log(`  📊 Stock split: reversible=${(initialState.novelEntitiesSystem.reversibleStock / 1000).toFixed(0)}k Mt, irreversible=${(initialState.novelEntitiesSystem.irreversibleStock / 1000).toFixed(0)}k Mt`);
  }

  // Capture initial metrics
  const initialNovelEntities = initialState.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
  const initialBiogeochemical = initialState.planetaryBoundariesSystem?.boundaries.biogeochemical_flows?.currentValue || 0;
  const initialPopulation = initialState.humanPopulationSystem?.population || 0;

  // Create engine
  const engine = new SimulationEngine({ seed, maxMonths: SIMULATION_DURATION_MONTHS });

  // Run simulation with progress tracking
  let lastYear = -1;
  const observer = {
    onMonthComplete: (state: any) => {
      const currentYear = Math.floor(state.currentMonth / 12);
      if (currentYear !== lastYear) {
        lastYear = currentYear;
        const novelEntities = state.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
        const biogeochemical = state.planetaryBoundariesSystem?.boundaries.biogeochemical_flows?.currentValue || 0;
        const pop = state.humanPopulationSystem?.population || 0;
        console.log(`  Year ${currentYear}: NE=${(novelEntities * 100).toFixed(1)}%, BG=${(biogeochemical * 100).toFixed(1)}%, Pop=${(pop / 1e9).toFixed(2)}B`);
      }
    }
  };

  const runResult = engine.run(initialState, {
    maxMonths: SIMULATION_DURATION_MONTHS,
    checkActualOutcomes: false,
    observer
  });

  const finalState = runResult.finalState;

  // Extract final metrics
  const finalNovelEntities = finalState.planetaryBoundariesSystem?.boundaries.novel_entities?.currentValue || 0;
  const finalBiogeochemical = finalState.planetaryBoundariesSystem?.boundaries.biogeochemical_flows?.currentValue || 0;
  const finalPopulation = finalState.humanPopulationSystem?.population || 0;

  // Calculate effectiveness
  const novelEntitiesReduction = initialNovelEntities - finalNovelEntities;
  const novelEntitiesEffectiveness = initialNovelEntities > 0
    ? (novelEntitiesReduction / initialNovelEntities) * 100
    : 0;

  const biogeochemicalReduction = initialBiogeochemical - finalBiogeochemical;
  const biogeochemicalEffectiveness = initialBiogeochemical > 0
    ? (biogeochemicalReduction / initialBiogeochemical) * 100
    : 0;

  const populationChangePercent = initialPopulation > 0
    ? ((finalPopulation - initialPopulation) / initialPopulation) * 100
    : 0;

  // QoL metrics
  const qolSystems = finalState.qualityOfLifeSystems;
  const qolValues = Object.values(qolSystems).filter(v => typeof v === 'number') as number[];
  const finalQoLOverall = qolValues.length > 0
    ? qolValues.reduce((sum, val) => sum + val, 0) / qolValues.length
    : 0;

  const finalQoLHealth = qolSystems.health || 0;
  const finalQoLEnvironment = qolSystems.environmental_quality || 0;

  // Energy metrics
  const finalRenewablePercentage = finalState.powerGenerationSystem?.renewablePercentage || 0;
  const finalDataCenterPower = finalState.powerGenerationSystem?.dataCenterPower || 0;

  // Outcome
  const outcome = finalState.extinctionState?.extinctionTriggered
    ? `extinction_${finalState.extinctionState.extinctionType}`
    : 'survival';

  console.log(`  ✅ Complete: NE_eff=${novelEntitiesEffectiveness.toFixed(1)}%, BG_eff=${biogeochemicalEffectiveness.toFixed(1)}%, Pop=${(finalPopulation / 1e9).toFixed(2)}B (${populationChangePercent >= 0 ? '+' : ''}${populationChangePercent.toFixed(1)}%)`);

  return {
    parameterSet: paramSet.name,
    runIndex,
    seed,

    irreversibleFraction: paramSet.irreversibleFraction,
    reboundFactor: paramSet.reboundFactor,

    initialNovelEntitiesBoundary: initialNovelEntities,
    finalNovelEntitiesBoundary: finalNovelEntities,
    novelEntitiesReductionAbsolute: novelEntitiesReduction,
    novelEntitiesEffectivenessPercent: novelEntitiesEffectiveness,

    initialBiogeochemicalBoundary: initialBiogeochemical,
    finalBiogeochemicalBoundary: finalBiogeochemical,
    biogeochemicalReductionAbsolute: biogeochemicalReduction,
    biogeochemicalEffectivenessPercent: biogeochemicalEffectiveness,

    initialPopulation,
    finalPopulation,
    populationChangePercent,

    finalQoLOverall,
    finalQoLHealth,
    finalQoLEnvironment,

    outcome,
    extinctionTriggered: finalState.extinctionState?.extinctionTriggered || false,

    finalRenewablePercentage,
    finalDataCenterPower
  };
}

// ============================================================================
// STATISTICAL ANALYSIS
// ============================================================================

interface ParameterSetStats {
  parameterSet: string;
  parameters: ParameterSet;
  n: number;

  // Novel Entities effectiveness
  novelEntitiesEffectivenessMean: number;
  novelEntitiesEffectivenessStd: number;
  novelEntitiesEffectivenessCV: number;
  novelEntitiesEffectivenessMin: number;
  novelEntitiesEffectivenessMax: number;

  // Biogeochemical effectiveness
  biogeochemicalEffectivenessMean: number;
  biogeochemicalEffectivenessStd: number;
  biogeochemicalEffectivenessCV: number;

  // Population
  populationChangeMean: number;
  populationChangeStd: number;

  // QoL
  qolOverallMean: number;
  qolOverallStd: number;
  qolHealthMean: number;
  qolEnvironmentMean: number;

  // Outcomes
  survivalRate: number;
  extinctionRate: number;
  outcomeDistribution: Record<string, number>;
}

function calculateStats(results: SimulationResult[]): ParameterSetStats {
  const n = results.length;
  if (n === 0) throw new Error('No results to analyze');

  const paramSet = PARAMETER_SETS.find(p => p.name === results[0].parameterSet)!;

  // Helper: Calculate mean
  const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / n;

  // Helper: Calculate std
  const std = (values: number[], meanVal: number) =>
    Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - meanVal, 2), 0) / n);

  // Helper: Calculate CV
  const cv = (stdVal: number, meanVal: number) =>
    meanVal !== 0 ? (stdVal / Math.abs(meanVal)) * 100 : 0;

  // Novel Entities effectiveness
  const neEff = results.map(r => r.novelEntitiesEffectivenessPercent);
  const neEffMean = mean(neEff);
  const neEffStd = std(neEff, neEffMean);
  const neEffCV = cv(neEffStd, neEffMean);

  // Biogeochemical effectiveness
  const bgEff = results.map(r => r.biogeochemicalEffectivenessPercent);
  const bgEffMean = mean(bgEff);
  const bgEffStd = std(bgEff, bgEffMean);
  const bgEffCV = cv(bgEffStd, bgEffMean);

  // Population change
  const popChange = results.map(r => r.populationChangePercent);
  const popChangeMean = mean(popChange);
  const popChangeStd = std(popChange, popChangeMean);

  // QoL
  const qolOverall = results.map(r => r.finalQoLOverall);
  const qolOverallMean = mean(qolOverall);
  const qolOverallStd = std(qolOverall, qolOverallMean);

  const qolHealth = results.map(r => r.finalQoLHealth);
  const qolHealthMean = mean(qolHealth);

  const qolEnv = results.map(r => r.finalQoLEnvironment);
  const qolEnvMean = mean(qolEnv);

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

    novelEntitiesEffectivenessMean: neEffMean,
    novelEntitiesEffectivenessStd: neEffStd,
    novelEntitiesEffectivenessCV: neEffCV,
    novelEntitiesEffectivenessMin: Math.min(...neEff),
    novelEntitiesEffectivenessMax: Math.max(...neEff),

    biogeochemicalEffectivenessMean: bgEffMean,
    biogeochemicalEffectivenessStd: bgEffStd,
    biogeochemicalEffectivenessCV: bgEffCV,

    populationChangeMean: popChangeMean,
    populationChangeStd: popChangeStd,

    qolOverallMean,
    qolOverallStd,
    qolHealthMean,
    qolEnvironmentMean,

    survivalRate,
    extinctionRate,
    outcomeDistribution
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(`\n=== Parameter Matrix (9 combinations) ===`);
  console.log(`irreversibleFraction: {0.80, 0.875, 0.95}`);
  console.log(`reboundFactor: {0.5, 0.7, 0.9}`);
  console.log(`\nParameter sets:`);
  PARAMETER_SETS.forEach((p, i) => {
    const isBaseline = p.irreversibleFraction === 0.875 && p.reboundFactor === 0.7;
    const marker = isBaseline ? ' ← BASELINE' : '';
    console.log(`  ${i + 1}. ${p.name}: irrev=${(p.irreversibleFraction * 100).toFixed(1)}%, rebound=${(p.reboundFactor * 100).toFixed(0)}%${marker}`);
  });

  const allResults: SimulationResult[] = [];
  const allStats: ParameterSetStats[] = [];

  for (const paramSet of PARAMETER_SETS) {
    console.log(`\n\n========================================`);
    console.log(`=== PARAMETER SET: ${paramSet.name.toUpperCase()} ===`);
    console.log(`========================================`);
    console.log(`irreversibleFraction: ${(paramSet.irreversibleFraction * 100).toFixed(1)}%`);
    console.log(`reboundFactor: ${(paramSet.reboundFactor * 100).toFixed(0)}%`);

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
    console.log(`Novel Entities Effectiveness: ${stats.novelEntitiesEffectivenessMean.toFixed(2)}% ± ${stats.novelEntitiesEffectivenessStd.toFixed(2)}% (CV=${stats.novelEntitiesEffectivenessCV.toFixed(2)}%)`);
    console.log(`  Range: ${stats.novelEntitiesEffectivenessMin.toFixed(2)}% - ${stats.novelEntitiesEffectivenessMax.toFixed(2)}%`);
    console.log(`Biogeochemical Effectiveness: ${stats.biogeochemicalEffectivenessMean.toFixed(2)}% ± ${stats.biogeochemicalEffectivenessStd.toFixed(2)}% (CV=${stats.biogeochemicalEffectivenessCV.toFixed(2)}%)`);
    console.log(`Population Change: ${stats.populationChangeMean >= 0 ? '+' : ''}${stats.populationChangeMean.toFixed(2)}% ± ${stats.populationChangeStd.toFixed(2)}%`);
    console.log(`QoL Overall: ${(stats.qolOverallMean * 100).toFixed(1)}% ± ${(stats.qolOverallStd * 100).toFixed(1)}%`);
    console.log(`Survival Rate: ${(stats.survivalRate * 100).toFixed(1)}%`);
    console.log(`Outcome Distribution:`, stats.outcomeDistribution);

    const statsFile = path.join(OUTPUT_DIR, `${paramSet.name}_stats.json`);
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
  }

  // Save comprehensive summary
  const summary = {
    timestamp,
    configuration: {
      runsPerSet: RUNS_PER_PARAMETER_SET,
      durationMonths: SIMULATION_DURATION_MONTHS,
      seedStart: SEED_START
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

  // ============================================================================
  // COMPARATIVE ANALYSIS
  // ============================================================================

  console.log(`\n=== COMPARATIVE STATISTICS ===`);
  console.log(`\nNovel Entities Effectiveness by Parameter Combination:`);
  console.log(`                              Low Rebound  Mid Rebound  High Rebound`);
  console.log(`                              (0.5)        (0.7)        (0.9)`);

  // Group by irreversibleFraction
  const lowIrrev = allStats.filter(s => s.parameters.irreversibleFraction === 0.80);
  const midIrrev = allStats.filter(s => s.parameters.irreversibleFraction === 0.875);
  const highIrrev = allStats.filter(s => s.parameters.irreversibleFraction === 0.95);

  const formatRow = (label: string, stats: ParameterSetStats[]) => {
    const values = [0.5, 0.7, 0.9].map(rb => {
      const s = stats.find(st => st.parameters.reboundFactor === rb);
      return s ? `${s.novelEntitiesEffectivenessMean.toFixed(1)}%` : 'N/A';
    });
    return `${label.padEnd(30)} ${values[0].padStart(12)} ${values[1].padStart(12)} ${values[2].padStart(12)}`;
  };

  console.log(formatRow('Low Irreversibility (0.80)', lowIrrev));
  console.log(formatRow('Mid Irreversibility (0.875)', midIrrev));
  console.log(formatRow('High Irreversibility (0.95)', highIrrev));

  console.log(`\nPopulation Change (%) by Parameter Combination:`);
  console.log(`                              Low Rebound  Mid Rebound  High Rebound`);
  const formatPopRow = (label: string, stats: ParameterSetStats[]) => {
    const values = [0.5, 0.7, 0.9].map(rb => {
      const s = stats.find(st => st.parameters.reboundFactor === rb);
      if (!s) return 'N/A';
      const val = s.populationChangeMean;
      return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
    });
    return `${label.padEnd(30)} ${values[0].padStart(12)} ${values[1].padStart(12)} ${values[2].padStart(12)}`;
  };

  console.log(formatPopRow('Low Irreversibility (0.80)', lowIrrev));
  console.log(formatPopRow('Mid Irreversibility (0.875)', midIrrev));
  console.log(formatPopRow('High Irreversibility (0.95)', highIrrev));

  console.log(`\nSurvival Rate (%) by Parameter Combination:`);
  console.log(`                              Low Rebound  Mid Rebound  High Rebound`);
  const formatSurvRow = (label: string, stats: ParameterSetStats[]) => {
    const values = [0.5, 0.7, 0.9].map(rb => {
      const s = stats.find(st => st.parameters.reboundFactor === rb);
      return s ? `${(s.survivalRate * 100).toFixed(1)}%` : 'N/A';
    });
    return `${label.padEnd(30)} ${values[0].padStart(12)} ${values[1].padStart(12)} ${values[2].padStart(12)}`;
  };

  console.log(formatSurvRow('Low Irreversibility (0.80)', lowIrrev));
  console.log(formatSurvRow('Mid Irreversibility (0.875)', midIrrev));
  console.log(formatSurvRow('High Irreversibility (0.95)', highIrrev));

  // ============================================================================
  // SENSITIVITY ANALYSIS
  // ============================================================================

  console.log(`\n=== PARAMETER SENSITIVITY ANALYSIS ===`);

  // Calculate sensitivity to irreversibleFraction (holding reboundFactor constant at 0.7)
  const midReboundStats = allStats.filter(s => s.parameters.reboundFactor === 0.7);
  if (midReboundStats.length === 3) {
    const sorted = midReboundStats.sort((a, b) => a.parameters.irreversibleFraction - b.parameters.irreversibleFraction);
    const deltaIrrev = sorted[2].parameters.irreversibleFraction - sorted[0].parameters.irreversibleFraction;
    const deltaEff = sorted[2].novelEntitiesEffectivenessMean - sorted[0].novelEntitiesEffectivenessMean;
    const sensitivity = deltaEff / deltaIrrev;

    console.log(`\nIrreversible Fraction Sensitivity (holding rebound at 0.7):`);
    console.log(`  Range: ${(sorted[0].parameters.irreversibleFraction * 100).toFixed(1)}% → ${(sorted[2].parameters.irreversibleFraction * 100).toFixed(1)}%`);
    console.log(`  Effectiveness change: ${sorted[0].novelEntitiesEffectivenessMean.toFixed(2)}% → ${sorted[2].novelEntitiesEffectivenessMean.toFixed(2)}%`);
    console.log(`  Δ Effectiveness: ${deltaEff.toFixed(2)}%`);
    console.log(`  Sensitivity: ${sensitivity.toFixed(2)}% effectiveness per 1% irreversible fraction`);
  }

  // Calculate sensitivity to reboundFactor (holding irreversibleFraction constant at 0.875)
  const midIrrevStats = allStats.filter(s => s.parameters.irreversibleFraction === 0.875);
  if (midIrrevStats.length === 3) {
    const sorted = midIrrevStats.sort((a, b) => a.parameters.reboundFactor - b.parameters.reboundFactor);
    const deltaRebound = sorted[2].parameters.reboundFactor - sorted[0].parameters.reboundFactor;
    const deltaEff = sorted[2].novelEntitiesEffectivenessMean - sorted[0].novelEntitiesEffectivenessMean;
    const sensitivity = deltaEff / deltaRebound;

    console.log(`\nRebound Factor Sensitivity (holding irreversible at 0.875):`);
    console.log(`  Range: ${(sorted[0].parameters.reboundFactor * 100).toFixed(0)}% → ${(sorted[2].parameters.reboundFactor * 100).toFixed(0)}%`);
    console.log(`  Effectiveness change: ${sorted[0].novelEntitiesEffectivenessMean.toFixed(2)}% → ${sorted[2].novelEntitiesEffectivenessMean.toFixed(2)}%`);
    console.log(`  Δ Effectiveness: ${deltaEff.toFixed(2)}%`);
    console.log(`  Sensitivity: ${sensitivity.toFixed(2)}% effectiveness per 1% rebound factor`);
  }

  // Check for threshold effects (cliff edges)
  console.log(`\n=== THRESHOLD EFFECT DETECTION ===`);
  const extinctionThreshold = allStats.find(s => s.extinctionRate > 0.3);
  if (extinctionThreshold) {
    console.log(`⚠️ CLIFF EDGE DETECTED: ${extinctionThreshold.parameterSet}`);
    console.log(`  Extinction rate: ${(extinctionThreshold.extinctionRate * 100).toFixed(1)}%`);
    console.log(`  Parameters: irreversible=${(extinctionThreshold.parameters.irreversibleFraction * 100).toFixed(1)}%, rebound=${(extinctionThreshold.parameters.reboundFactor * 100).toFixed(0)}%`);
  } else {
    console.log(`✅ No cliff edges detected (all parameter combinations have <30% extinction rate)`);
  }

  // Check for interaction effects (non-additive)
  console.log(`\n=== INTERACTION EFFECTS ===`);
  const baseline = allStats.find(s => s.parameters.irreversibleFraction === 0.875 && s.parameters.reboundFactor === 0.7);
  const lowBoth = allStats.find(s => s.parameters.irreversibleFraction === 0.80 && s.parameters.reboundFactor === 0.5);
  const highBoth = allStats.find(s => s.parameters.irreversibleFraction === 0.95 && s.parameters.reboundFactor === 0.9);

  if (baseline && lowBoth && highBoth) {
    console.log(`Baseline (mid/mid): ${baseline.novelEntitiesEffectivenessMean.toFixed(2)}%`);
    console.log(`Best case (low/low): ${lowBoth.novelEntitiesEffectivenessMean.toFixed(2)}%`);
    console.log(`Worst case (high/high): ${highBoth.novelEntitiesEffectivenessMean.toFixed(2)}%`);
    console.log(`Range: ${(lowBoth.novelEntitiesEffectivenessMean - highBoth.novelEntitiesEffectivenessMean).toFixed(2)}% effectiveness span`);
  }

  console.log(`\n✅ Sensitivity analysis complete.`);
  console.log(`\nNext steps:`);
  console.log(`1. Review heatmap patterns (which parameter dominates?)`);
  console.log(`2. Check for implausible combinations (e.g., 0.95 + 0.9 = permanent decline?)`);
  console.log(`3. Determine if parameter ranges should be narrowed`);
  console.log(`4. Assess implementation readiness based on outcome stability`);
}

// Run with error handling
main().catch(err => {
  console.error(`\n❌ FATAL ERROR:`, err);
  process.exit(1);
});
