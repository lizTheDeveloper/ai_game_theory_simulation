/**
 * Experiment 1: Deployment Rate Sweep - Systematic Tech Timing Analysis
 *
 * Created: November 26, 2025
 * Purpose: Test how technology deployment rate affects spiral activation and outcomes
 * Context: Phase 3 blockers resolved (GDP-adaptive spending), ready for full experiment
 *
 * Research Question: What is the optimal deployment rate that balances:
 * - Environmental urgency (deploy fast to prevent collapse)
 * - Institutional absorption (deploy slow to prevent disruption)
 * - Spiral activation (deploy at rate that enables positive feedbacks)
 *
 * Design: plans/proposed_experiment1_deployment_rate_sweep_20251126.md
 *
 * Parameters:
 * - 5 deployment rates: Immediate (0mo), Fast (12mo), Medium (24mo), Slow (48mo), Very Slow (96mo)
 * - 6 scenarios: god-mode, climate-first, equality-first, ai-alignment-first, democratic-participation, scientific-acceleration
 * - N=10 Monte Carlo per configuration = 300 total runs
 * - Enhanced tracking: crash stats, GDP trajectory, mortality trajectory, spiral timing
 */

import { runScenarioWithDef } from './scenarioRunner';
import { ScenarioResult, ScenarioDefinition, SCENARIO_CATALOG } from '../src/types/scenarios';
import * as fs from 'fs';

/**
 * Deployment rate configurations
 * Maps deployment rate name to gap between tier deployments (in months)
 */
const DEPLOYMENT_RATES = {
  immediate: { gapMonths: 0, description: 'All 119 techs at month 0' },
  fast: { gapMonths: 3, description: '119 techs over 12 months (4 tiers with 3mo gaps)' },
  medium: { gapMonths: 6, description: '119 techs over 24 months (4 tiers with 6mo gaps)' },
  slow: { gapMonths: 12, description: '119 techs over 48 months (4 tiers with 12mo gaps)' },
  verySlow: { gapMonths: 24, description: '119 techs over 96 months (4 tiers with 24mo gaps)' },
} as const;

/**
 * Scenarios to test (6 governance scenarios)
 * Excludes initial condition and tech priority scenarios to isolate deployment timing effects
 */
const SELECTED_SCENARIOS = [
  'god-mode',
  'climate-first',
  'equality-first',
  'ai-alignment-first',
  'democratic-participation',
  'scientific-acceleration',
] as const;

/**
 * Monte Carlo configuration
 */
const MONTE_CARLO_N = 10; // Full experiment (use --validation for N=3)
const BASE_SEED = 1; // Seeds 1-10 (deterministic)
const MAX_MONTHS = 360; // 30 years

/**
 * Enhanced result tracking
 * Extends ScenarioResult with deployment rate metadata and trajectory data
 */
interface EnhancedScenarioResult extends ScenarioResult {
  /** Deployment rate used for this run */
  deploymentRate: string;

  /** Whether simulation crashed before completion */
  crashed: boolean;

  /** Month simulation crashed (if crashed=true) */
  crashMonth?: number;

  /** Reason for crash (if crashed=true) */
  crashReason?: string;

  /** GDP trajectory tracking */
  gdpTrajectory: {
    /** Initial GDP (month 0) */
    initial: number;
    /** Final GDP (month reached or crash month) */
    final: number;
    /** Minimum GDP reached during simulation */
    min: number;
    /** GDP decline from initial (%) */
    declinePercent: number;
  };

  /** Mortality trajectory tracking */
  mortalityTrajectory: {
    /** Mortality in first year (% of starting 8.1B) */
    year1: number;
    /** Cumulative mortality by year 5 (%) */
    year5: number;
    /** Cumulative mortality by year 15 (%) */
    year15: number;
    /** Terminal mortality (%) */
    terminal: number;
  };

  /** Spiral activation timing (if any spirals activated) */
  spiralTiming?: {
    /** Month when first spiral activated */
    firstSpiralMonth: number;
    /** Month when cascade activated (if cascadeActive=true) */
    cascadeMonth?: number;
  };
}

/**
 * Create scenario variant with specific deployment rate
 * Modifies base scenario to use sequenced deployment with given gap
 */
function createRateVariant(baseScenarioId: string, rateName: string): ScenarioDefinition {
  const baseScenario = SCENARIO_CATALOG[baseScenarioId as keyof typeof SCENARIO_CATALOG];
  if (!baseScenario) {
    throw new Error(`❌ Unknown base scenario: ${baseScenarioId}`);
  }

  const rateConfig = DEPLOYMENT_RATES[rateName as keyof typeof DEPLOYMENT_RATES];
  if (!rateConfig) {
    throw new Error(`❌ Unknown deployment rate: ${rateName}`);
  }

  // Create modified scenario
  return {
    ...baseScenario,
    id: `${baseScenarioId}_${rateName}`,
    name: `${baseScenario.name} (${rateName} deployment)`,
    description: `${baseScenario.description} | Deployment: ${rateConfig.description}`,
    techDeployment:
      rateConfig.gapMonths === 0
        ? { mode: 'immediate' as const }
        : {
            mode: 'sequenced' as const,
            sequencedConfig: {
              gapMonths: rateConfig.gapMonths,
              tierOrder: [0, 1, 2, 3, 4],
            },
          },
  };
}

/**
 * Extract enhanced tracking data from simulation result
 * This function is called WITHIN scenarioRunner.ts after simulation completes
 * We can't access intermediate states from here, so we extract what's available from finalState
 */
function enhanceResult(
  baseResult: ScenarioResult,
  deploymentRate: string,
  finalState: any
): EnhancedScenarioResult {
  // Determine if crashed (simulation ended before MAX_MONTHS)
  const crashed = baseResult.monthsSimulated < MAX_MONTHS;
  const crashMonth = crashed ? baseResult.monthsSimulated : undefined;

  // Determine crash reason (if crashed)
  let crashReason: string | undefined;
  if (crashed) {
    // Check outcome for crash indicators
    if (baseResult.outcome === 'EXTINCTION') {
      crashReason = 'EXTINCTION';
    } else if (baseResult.finalPopulation < 100000) {
      // <0.1M population = population collapse
      crashReason = 'POPULATION_COLLAPSE';
    } else if (finalState && finalState.resourceEconomy && finalState.resourceEconomy.gdp) {
      // Check if GDP collapsed
      const finalGDP = finalState.resourceEconomy.gdp.totalGDP;
      if (finalGDP < 1e12) {
        // <$1T GDP = economic collapse
        crashReason = 'GDP_COLLAPSE';
      }
    } else {
      crashReason = 'UNKNOWN';
    }
  }

  // Extract GDP trajectory
  // NOTE: We don't have access to intermediate states from scenarioRunner
  // So we can only capture initial and final values
  // For min GDP, we'd need to modify scenarioRunner to track it during simulation
  let gdpTrajectory = {
    initial: 0,
    final: 0,
    min: 0,
    declinePercent: 0,
  };

  if (finalState && finalState.resourceEconomy && finalState.resourceEconomy.gdp) {
    // Initial GDP: baseline 2025 value (~$114T)
    const initialGDP = 114e12; // Hardcoded baseline (could extract from month 0 if available)
    const finalGDP = finalState.resourceEconomy.gdp.totalGDP;

    gdpTrajectory = {
      initial: initialGDP,
      final: finalGDP,
      min: finalGDP, // Approximation: assume final is min (would need tracking for accuracy)
      declinePercent: ((initialGDP - finalGDP) / initialGDP) * 100,
    };
  }

  // Extract mortality trajectory
  // NOTE: Same limitation - we don't have intermediate population values
  // We can only calculate terminal mortality from finalPopulation
  const initialPop = 8.1e9; // Starting population (2025 baseline)
  const terminalMortality = ((initialPop - baseResult.finalPopulation) / initialPop) * 100;

  const mortalityTrajectory = {
    year1: 0, // Would need tracking
    year5: 0, // Would need tracking
    year15: 0, // Would need tracking
    terminal: terminalMortality,
  };

  // Extract spiral timing
  // NOTE: Would need history tracking to determine when spirals first activated
  let spiralTiming: { firstSpiralMonth: number; cascadeMonth?: number } | undefined;
  if (baseResult.spiralActivation.activeUpwardSpirals.length > 0) {
    // We don't have this data without modifying scenarioRunner
    // For now, mark as available but unknown
    spiralTiming = {
      firstSpiralMonth: -1, // -1 = data not available
      cascadeMonth: baseResult.spiralActivation.cascadeActive ? -1 : undefined,
    };
  }

  return {
    ...baseResult,
    deploymentRate,
    crashed,
    crashMonth,
    crashReason,
    gdpTrajectory,
    mortalityTrajectory,
    spiralTiming,
  };
}

/**
 * Run single configuration (scenario × deployment rate × seed)
 */
function runConfiguration(
  scenarioId: string,
  rateName: string,
  seed: number,
  maxMonths: number
): EnhancedScenarioResult {
  // Create rate variant
  const scenario = createRateVariant(scenarioId, rateName);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎲 RUN: ${scenarioId} × ${rateName} × seed ${seed}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // Run scenario with modified definition (uses scenarioRunner.ts infrastructure)
    const baseResult = runScenarioWithDef(scenario, seed, maxMonths);

    // Enhance with deployment rate metadata
    // Note: We pass null for finalState since we don't have access to it from runScenario
    // The enhancement will use data already in baseResult
    const enhancedResult = enhanceResult(baseResult, rateName, null);

    console.log(`\n✅ Run complete:`);
    console.log(`   Outcome: ${enhancedResult.outcome}`);
    console.log(`   Crashed: ${enhancedResult.crashed ? `YES (month ${enhancedResult.crashMonth})` : 'NO'}`);
    console.log(`   Spirals active: ${enhancedResult.spiralActivation.activeUpwardSpirals.length}/6`);
    console.log(`   Final population: ${(enhancedResult.finalPopulation / 1e9).toFixed(2)}B`);
    console.log(`   Mortality: ${enhancedResult.mortalityTrajectory.terminal.toFixed(1)}%`);

    return enhancedResult;
  } catch (error) {
    console.error(`\n❌ Run FAILED:`, error);

    // Return failure result
    return {
      scenarioId: scenario.id,
      seed,
      deploymentRate: rateName,
      outcome: 'CRASH',
      monthsSimulated: 0,
      crashed: true,
      crashMonth: 0,
      crashReason: 'SCRIPT_ERROR',
      spiralActivation: {
        activeUpwardSpirals: [],
        cascadeActive: false,
        cascadeStrength: 0,
        trustCascadesTriggered: 0,
        tippingPointCascades: 0,
      },
      finalQoL: {
        survivalAvg: 0,
        basicNeedsAvg: 0,
        psychologicalAvg: 0,
        socialAvg: 0,
        healthAvg: 0,
        environmentalAvg: 0,
        overallAvg: 0,
      },
      finalEnvironment: {
        globalTempDelta: 0,
        co2Concentration: 0,
        extinctionRate: 1.0,
      },
      finalPopulation: 0,
      boundariesBreached: [],
      gdpTrajectory: {
        initial: 0,
        final: 0,
        min: 0,
        declinePercent: 0,
      },
      mortalityTrajectory: {
        year1: 0,
        year5: 0,
        year15: 0,
        terminal: 100,
      },
    };
  }
}

/**
 * Compute aggregate statistics for a single configuration (scenario × rate)
 */
function computeAggregateStats(results: EnhancedScenarioResult[]): any {
  const n = results.length;
  if (n === 0) {
    return null;
  }

  // Completion rate
  const completedRuns = results.filter(r => !r.crashed).length;
  const completionRate = completedRuns / n;

  // Mean mortality
  const avgMortality = results.reduce((sum, r) => sum + r.mortalityTrajectory.terminal, 0) / n;

  // Spiral activation rates
  const spiralCounts: { [name: string]: number } = {
    Cognitive: 0,
    Abundance: 0,
    Democratic: 0,
    Scientific: 0,
    Meaning: 0,
    Ecological: 0,
  };

  let cascadeCount = 0;
  let totalCascadeStrength = 0;

  for (const result of results) {
    for (const spiralName of result.spiralActivation.activeUpwardSpirals) {
      spiralCounts[spiralName] = (spiralCounts[spiralName] || 0) + 1;
    }
    if (result.spiralActivation.cascadeActive) {
      cascadeCount++;
    }
    totalCascadeStrength += result.spiralActivation.cascadeStrength;
  }

  const spiralActivationRates: { [name: string]: number } = {};
  for (const [name, count] of Object.entries(spiralCounts)) {
    spiralActivationRates[name] = count / n;
  }

  const cascadeActivationRate = cascadeCount / n;
  const avgCascadeStrength = totalCascadeStrength / n;

  // Outcome distribution
  const outcomeCounts: { [outcome: string]: number } = {};
  for (const result of results) {
    outcomeCounts[result.outcome] = (outcomeCounts[result.outcome] || 0) + 1;
  }

  return {
    completionRate,
    avgMortality,
    spiralActivationRates,
    cascadeActivationRate,
    avgCascadeStrength,
    outcomeDistribution: outcomeCounts,
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const validationMode = args.includes('--validation');

  const N = validationMode ? 3 : MONTE_CARLO_N;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logDir = `${__dirname}/../logs/experiment1`;
  const logFile = `${logDir}/deployment_sweep_${validationMode ? 'validation' : 'full'}_${timestamp}.log`;

  // Create log directory
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 EXPERIMENT 1: DEPLOYMENT RATE SWEEP`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nMode: ${validationMode ? 'VALIDATION (N=3)' : `FULL (N=${MONTE_CARLO_N})`}`);
  console.log(`Deployment rates: ${Object.keys(DEPLOYMENT_RATES).length}`);
  console.log(`Scenarios: ${SELECTED_SCENARIOS.length}`);
  console.log(`Seeds per config: ${N}`);
  console.log(`Total runs: ${Object.keys(DEPLOYMENT_RATES).length * SELECTED_SCENARIOS.length * N}`);
  console.log(`Max months: ${MAX_MONTHS} (${(MAX_MONTHS / 12).toFixed(0)} years)`);
  console.log(`Log directory: ${logDir}`);
  console.log(`\n${'='.repeat(80)}\n`);

  const allResults: { [configKey: string]: EnhancedScenarioResult[] } = {};

  // Nested loops: Rate × Scenario × Seed
  for (const rateName of Object.keys(DEPLOYMENT_RATES)) {
    for (const scenarioId of SELECTED_SCENARIOS) {
      const configKey = `${scenarioId}_${rateName}`;
      allResults[configKey] = [];

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 Configuration: ${scenarioId} × ${rateName}`);
      console.log(`${'='.repeat(80)}\n`);

      for (let i = 0; i < N; i++) {
        const seed = BASE_SEED + i;
        const result = runConfiguration(scenarioId, rateName, seed, MAX_MONTHS);
        allResults[configKey].push(result);

        // Save result incrementally to JSON
        const resultFile = `${logDir}/${configKey}_seed${seed}.json`;
        fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
        console.log(`💾 Saved: ${resultFile}`);
      }

      // Compute and print aggregate stats for this config
      const stats = computeAggregateStats(allResults[configKey]);
      if (stats) {
        console.log(`\n📈 Aggregate Statistics (${configKey}):`);
        console.log(`   Completion rate: ${(stats.completionRate * 100).toFixed(0)}%`);
        console.log(`   Avg mortality: ${stats.avgMortality.toFixed(1)}%`);
        console.log(`   Cascade activation: ${(stats.cascadeActivationRate * 100).toFixed(0)}%`);
        console.log(`   Avg cascade strength: ${stats.avgCascadeStrength.toFixed(2)}`);

        // Save aggregate stats
        const statsFile = `${logDir}/${configKey}_MC${N}_stats.json`;
        fs.writeFileSync(
          statsFile,
          JSON.stringify(
            {
              configKey,
              scenario: scenarioId,
              deploymentRate: rateName,
              monteCarloN: N,
              ...stats,
            },
            null,
            2
          )
        );
        console.log(`💾 Saved stats: ${statsFile}`);
      }
    }
  }

  // Generate comprehensive summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 EXPERIMENT SUMMARY`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('Completion Rate by Deployment Rate:\n');
  for (const rateName of Object.keys(DEPLOYMENT_RATES)) {
    const rateResults = Object.entries(allResults)
      .filter(([key]) => key.endsWith(`_${rateName}`))
      .flatMap(([_, results]) => results);

    const completed = rateResults.filter(r => !r.crashed).length;
    const total = rateResults.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    console.log(`   ${rateName.padEnd(15)} ${completionRate.toFixed(0).padStart(3)}% (${completed}/${total} runs)`);
  }

  console.log('\nMortality by Deployment Rate:\n');
  for (const rateName of Object.keys(DEPLOYMENT_RATES)) {
    const rateResults = Object.entries(allResults)
      .filter(([key]) => key.endsWith(`_${rateName}`))
      .flatMap(([_, results]) => results);

    const avgMortality =
      rateResults.reduce((sum, r) => sum + r.mortalityTrajectory.terminal, 0) / rateResults.length;

    console.log(`   ${rateName.padEnd(15)} ${avgMortality.toFixed(1)}% avg mortality`);
  }

  console.log('\nSpiral Activation by Deployment Rate:\n');
  for (const rateName of Object.keys(DEPLOYMENT_RATES)) {
    const rateResults = Object.entries(allResults)
      .filter(([key]) => key.endsWith(`_${rateName}`))
      .flatMap(([_, results]) => results);

    const spiralActivations = rateResults.reduce(
      (sum, r) => sum + r.spiralActivation.activeUpwardSpirals.length,
      0
    );
    const avgSpirals = spiralActivations / rateResults.length;

    const cascades = rateResults.filter(r => r.spiralActivation.cascadeActive).length;
    const cascadeRate = (cascades / rateResults.length) * 100;

    console.log(
      `   ${rateName.padEnd(15)} ${avgSpirals.toFixed(2)} spirals/run, ${cascadeRate.toFixed(0)}% cascade rate`
    );
  }

  // Save comprehensive results
  const summaryFile = `${logDir}/experiment1_summary_${timestamp}.json`;
  fs.writeFileSync(
    summaryFile,
    JSON.stringify(
      {
        metadata: {
          timestamp,
          validationMode,
          monteCarloN: N,
          deploymentRates: DEPLOYMENT_RATES,
          scenarios: SELECTED_SCENARIOS,
          maxMonths: MAX_MONTHS,
          totalRuns: Object.values(allResults).reduce((sum, arr) => sum + arr.length, 0),
        },
        allResults,
      },
      null,
      2
    )
  );

  console.log(`\n💾 Comprehensive summary saved to: ${summaryFile}`);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ EXPERIMENT COMPLETE`);
  console.log(`${'='.repeat(80)}\n`);

  if (validationMode) {
    console.log('⚠️  VALIDATION MODE - Run full experiment with:');
    console.log(`   npx tsx scripts/deploymentRateSweep.ts > logs/experiment1/full_run_$(date +%Y%m%d_%H%M%S).log 2>&1 &\n`);
  }
}

// Execute
main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
