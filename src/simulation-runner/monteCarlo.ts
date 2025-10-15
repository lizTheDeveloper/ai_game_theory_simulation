/**
 * Monte Carlo simulation runner for the AI Alignment Game
 * 
 * Enables running thousands of simulations with varying parameters
 * to understand outcome distributions and parameter sensitivity.
 */

import { GameState } from '@/types/game';
import { SimulationEngine, SimulationRunResult, SimulationConfig } from '../simulation/engine';
import { SimulationLog, aggregateLogs } from '../simulation/logging';
/**
 * Configuration for Monte Carlo simulation
 */
export interface MonteCarloConfig {
  numRuns: number;
  maxMonths?: number;
  parallel?: boolean;
  
  // Parameter ranges to sweep
  parameters?: {
    governmentActionFrequency?: number[];
    socialAdaptationRate?: number[];
    initialAIAlignment?: number[];
    initialAICapability?: number[];
    initialUnemployment?: number[];
  };
  
  // Initial state variation (adds randomness to initial conditions)
  initialStateVariation?: {
    aiCapability?: { mean: number; stdDev: number };
    aiAlignment?: { mean: number; stdDev: number };
    unemployment?: { mean: number; stdDev: number };
    trustInAI?: { mean: number; stdDev: number };
  };
}

/**
 * Dystopia analysis results
 */
export interface DystopiaAnalysis {
  totalRunsWithDystopia: number;
  variantFrequency: Record<string, number>; // DystopiaVariant -> count
  severityDistribution: Record<string, number>; // DystopiaSeverity -> count
  entryReasons: Record<string, number>; // reason -> count (top 10)
  durationStats: {
    average: number;
    median: number;
    min: number;
    max: number;
  };
  outcomeCorrelation: {
    escaped: number; // runs that entered dystopia but ended in utopia/survived
    stayedIn: number; // runs that entered dystopia and ended in dystopia
    wentExtinct: number; // runs that entered dystopia and went extinct
  };
}

/**
 * Results from a Monte Carlo simulation run
 */
export interface MonteCarloResults {
  runs: SimulationRunResult[];
  config: MonteCarloConfig;
  
  // Aggregate statistics
  outcomeDistribution: {
    utopia: number;
    dystopia: number;
    extinction: number;
    inconclusive: number;
  };
  
  // Probability distributions across all runs
  probabilityDistributions: {
    byRun: Array<{
      runId: number;
      months: number;
      outcome: 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';
      probabilities: {
        utopia: number;
        dystopia: number;
        extinction: number;
      };
      extinctionType?: string | null;
      extinctionMechanism?: string | null;
    }>;
    sortedByUtopia: number[]; // Run IDs sorted by utopia probability (high to low)
    sortedByExtinction: number[]; // Run IDs sorted by extinction probability (low to high)
  };
  
  // Average metrics across all runs
  averageMetrics: {
    finalQualityOfLife: number;
    finalUnemployment: number;
    finalEconomicStage: number;
    finalTrust: number;
    monthsToOutcome: number;
  };
  
  // Parameter sensitivity analysis
  parameterSensitivity?: ParameterSensitivityResult[];
}

/**
 * Parameter sensitivity analysis result
 */
export interface ParameterSensitivityResult {
  parameterName: string;
  values: number[];
  utopiaRates: number[];
  dystopiaRates: number[];
  extinctionRates: number[];
  correlation: number; // Correlation with utopia probability
}

/**
 * Run Monte Carlo simulation
 */
export async function runMonteCarlo(
  initialState: GameState,
  config: MonteCarloConfig
): Promise<MonteCarloResults> {
  console.log(`Starting Monte Carlo simulation with ${config.numRuns} runs...`);
  
  const runs: SimulationRunResult[] = [];
  
  // Generate parameter combinations
  const parameterCombinations = generateParameterCombinations(config);
  
  // Run simulations
  for (let i = 0; i < config.numRuns; i++) {
    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${config.numRuns} (${((i / config.numRuns) * 100).toFixed(1)}%)`);
    }
    
    // Select parameter combination
    const params = parameterCombinations[i % parameterCombinations.length];
    
    // Create varied initial state
    const variedState = varyInitialState(initialState, config.initialStateVariation);
    
    // Run simulation
    const engine = new SimulationEngine({
      seed: i, // Use run index as seed for reproducibility
      maxMonths: config.maxMonths,
      ...params
    });
    
    const result = engine.run(variedState, {
      maxMonths: config.maxMonths,
      outcomeThreshold: 0.85
    });
    
    runs.push(result);
  }
  
  console.log('Simulation complete. Analyzing results...');
  
  // Analyze results
  return analyzeMonteCarloResults(runs, config);
}

/**
 * Generate all parameter combinations to test
 */
function generateParameterCombinations(config: MonteCarloConfig): SimulationConfig[] {
  const combinations: SimulationConfig[] = [];
  
  if (!config.parameters) {
    // No parameter sweep - use defaults
    return [{}];
  }
  
  const {
    governmentActionFrequency = [0.08],
    socialAdaptationRate = [1.0],
    initialAIAlignment = [0.7],
    initialAICapability = [0.2]
  } = config.parameters;
  
  // Generate Cartesian product of all parameter values
  for (const govFreq of governmentActionFrequency) {
    for (const adaptRate of socialAdaptationRate) {
      combinations.push({
        governmentActionFrequency: govFreq,
        socialAdaptationRate: adaptRate
      });
    }
  }
  
  return combinations.length > 0 ? combinations : [{}];
}

/**
 * Add variation to initial state based on configuration
 */
function varyInitialState(
  baseState: GameState,
  variation?: MonteCarloConfig['initialStateVariation']
): GameState {
  if (!variation) return baseState;
  
  const variedState = JSON.parse(JSON.stringify(baseState)); // Deep clone
  
  // Vary AI agent properties
  if (variation.aiCapability || variation.aiAlignment) {
    variedState.aiAgents = variedState.aiAgents.map((ai: unknown) => {
      const agent = ai as { capability: number; alignment: number };
      return {
        ...agent,
        capability: variation.aiCapability 
          ? gaussianRandom(variation.aiCapability.mean, variation.aiCapability.stdDev)
          : agent.capability,
        alignment: variation.aiAlignment
          ? Math.max(0, Math.min(1, gaussianRandom(variation.aiAlignment.mean, variation.aiAlignment.stdDev)))
          : agent.alignment
      };
    });
  }
  
  // Vary society properties
  if (variation.unemployment) {
    variedState.society.unemploymentLevel = Math.max(0, Math.min(1,
      gaussianRandom(variation.unemployment.mean, variation.unemployment.stdDev)
    ));
  }
  
  if (variation.trustInAI) {
    variedState.society.trustInAI = Math.max(0, Math.min(1,
      gaussianRandom(variation.trustInAI.mean, variation.trustInAI.stdDev)
    ));
  }
  
  return variedState;
}

/**
 * Box-Muller transform for Gaussian random numbers
 */
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Analyze Monte Carlo results and compute statistics
 */
function analyzeMonteCarloResults(
  runs: SimulationRunResult[],
  config: MonteCarloConfig
): MonteCarloResults {
  // Count outcomes
  const outcomeCounts = {
    utopia: 0,
    dystopia: 0,
    extinction: 0,
    inconclusive: 0
  };
  
  let totalQoL = 0;
  let totalUnemployment = 0;
  let totalEconomicStage = 0;
  let totalTrust = 0;
  let totalMonths = 0;
  
  // Build probability distributions for each run
  const probabilityByRun = runs.map((run, runId) => {
    // Get final outcome metrics (probabilities)
    const finalMetrics = run.finalState.outcomeMetrics;
    const extinctionState = run.finalState.extinctionState;
    
    return {
      runId,
      months: run.summary.totalMonths,
      outcome: run.summary.finalOutcome,
      probabilities: {
        utopia: finalMetrics.utopiaProbability,
        dystopia: finalMetrics.dystopiaProbability,
        extinction: finalMetrics.extinctionProbability
      },
      extinctionType: extinctionState.active ? extinctionState.type : null,
      extinctionMechanism: extinctionState.active ? extinctionState.mechanism : null
    };
  });
  
  // Sort by utopia probability (high to low)
  const sortedByUtopia = [...probabilityByRun]
    .sort((a, b) => b.probabilities.utopia - a.probabilities.utopia)
    .map(r => r.runId);
  
  // Sort by extinction probability (low to high - best worlds first)
  const sortedByExtinction = [...probabilityByRun]
    .sort((a, b) => a.probabilities.extinction - b.probabilities.extinction)
    .map(r => r.runId);
  
  runs.forEach(run => {
    outcomeCounts[run.summary.finalOutcome]++;
    totalQoL += run.finalState.globalMetrics.qualityOfLife;
    totalUnemployment += run.finalState.society.unemploymentLevel;
    totalEconomicStage += run.finalState.globalMetrics.economicTransitionStage;
    totalTrust += run.finalState.society.trustInAI;
    totalMonths += run.summary.totalMonths;
  });
  
  const numRuns = runs.length;
  
  return {
    runs,
    config,
    outcomeDistribution: {
      utopia: outcomeCounts.utopia / numRuns,
      dystopia: outcomeCounts.dystopia / numRuns,
      extinction: outcomeCounts.extinction / numRuns,
      inconclusive: outcomeCounts.inconclusive / numRuns
    },
    probabilityDistributions: {
      byRun: probabilityByRun,
      sortedByUtopia,
      sortedByExtinction
    },
    averageMetrics: {
      finalQualityOfLife: totalQoL / numRuns,
      finalUnemployment: totalUnemployment / numRuns,
      finalEconomicStage: totalEconomicStage / numRuns,
      finalTrust: totalTrust / numRuns,
      monthsToOutcome: totalMonths / numRuns
    }
  };
}

/**
 * Export results with hierarchical summarization
 */
export function exportResults(results: MonteCarloResults, filename: string): void {
  // Collect logs from all runs
  const logs: SimulationLog[] = results.runs.map(run => run.log);
  
  // Aggregate logs hierarchically
  const aggregated = aggregateLogs(logs);
  
  // Create hierarchical summary
  const summary = {
    config: results.config,
    totalRuns: results.runs.length,
    
    // High-level outcomes
    outcomeDistribution: results.outcomeDistribution,
    averageMetrics: results.averageMetrics,
    
    // Trajectory analysis
    trajectories: aggregated.averageTrajectories,
    
    // Quartile progression (averaged across all runs)
    quartileProgression: aggregated.quartileAverages.map((snapshot, i) => ({
      quartile: i === 0 ? 'initial' : `Q${i}`,
      month: snapshot.month,
      aiCapability: snapshot.totalAICapability.toFixed(2),
      unemployment: (snapshot.unemployment * 100).toFixed(1) + '%',
      trust: (snapshot.trustInAI * 100).toFixed(1) + '%',
      economicStage: snapshot.economicStage.toFixed(2),
      utopiaProb: (snapshot.utopiaProbability * 100).toFixed(1) + '%',
      extinctionProb: (snapshot.extinctionProbability * 100).toFixed(1) + '%'
    })),
    
    // Event analysis
    eventAnalysis: {
      totalEvents: Object.values(aggregated.eventFrequencies).reduce((a, b) => a + b, 0),
      byType: aggregated.eventFrequencies,
      criticalEventsPerRun: logs.reduce((sum, log) => sum + log.events.criticalEvents.length, 0) / logs.length
    },
    
    // Individual run summaries (not full history)
    runSummaries: results.runs.map((run, i) => ({
      runId: i,
      seed: run.log.metadata.seed,
      outcome: run.summary.finalOutcome,
      months: run.summary.totalMonths,
      trajectory: run.log.trajectory,
      criticalEventCount: run.log.events.criticalEvents.length
    }))
  };
  
  try {
    const json = JSON.stringify(summary, null, 2);
    console.log(`\n📊 Hierarchical Summary:`);
    console.log(`  Size: ${(json.length / 1024).toFixed(2)} KB`);
    console.log(`  Runs: ${results.runs.length}`);
    console.log(`  Quartile snapshots: ${aggregated.quartileAverages.length}`);
    console.log(`  Total events tracked: ${Object.values(aggregated.eventFrequencies).reduce((a, b) => a + b, 0)}`);
  } catch (e) {
    console.log(`\n⚠️  Summary too large (${results.runs.length} runs)`);
  }
  
  // Display outcome distribution
  console.log('\n📈 Monte Carlo Results Summary:');
  console.log('================================');
  console.log(`Total Runs: ${results.runs.length}`);
  console.log(`\nOutcome Distribution:`);
  console.log(`  Utopia:       ${(results.outcomeDistribution.utopia * 100).toFixed(1)}%`);
  console.log(`  Dystopia:     ${(results.outcomeDistribution.dystopia * 100).toFixed(1)}%`);
  console.log(`  Extinction:   ${(results.outcomeDistribution.extinction * 100).toFixed(1)}%`);
  console.log(`  Inconclusive: ${(results.outcomeDistribution.inconclusive * 100).toFixed(1)}%`);
  
  // Display best and worst worlds by probability
  console.log('\n🌍 Worlds by Outcome Probability:');
  console.log('===================================');
  
  // Top 10 best worlds (highest utopia probability)
  console.log('\n✨ Top 10 Most Utopian Worlds:');
  results.probabilityDistributions.sortedByUtopia.slice(0, 10).forEach((runId, rank) => {
    const run = results.probabilityDistributions.byRun[runId];
    console.log(`  ${(rank + 1).toString().padStart(2)}. Run ${runId.toString().padStart(3)}: ` +
      `Utopia=${(run.probabilities.utopia * 100).toFixed(1)}% ` +
      `Dystopia=${(run.probabilities.dystopia * 100).toFixed(1)}% ` +
      `Extinction=${(run.probabilities.extinction * 100).toFixed(1)}% ` +
      `[${run.outcome}, ${run.months}mo]`);
  });
  
  // Top 10 worst worlds (highest extinction probability)
  console.log('\n☠️  Top 10 Most Doomed Worlds:');
  results.probabilityDistributions.sortedByExtinction.slice(-10).reverse().forEach((runId, rank) => {
    const run = results.probabilityDistributions.byRun[runId];
    let extinctionInfo = '';
    if (run.extinctionType) {
      extinctionInfo = ` [${run.extinctionType}: ${run.extinctionMechanism}]`;
    }
    console.log(`  ${(rank + 1).toString().padStart(2)}. Run ${runId.toString().padStart(3)}: ` +
      `Extinction=${(run.probabilities.extinction * 100).toFixed(1)}% ` +
      `Utopia=${(run.probabilities.utopia * 100).toFixed(1)}% ` +
      `Dystopia=${(run.probabilities.dystopia * 100).toFixed(1)}% ` +
      `[${run.outcome}, ${run.months}mo]${extinctionInfo}`);
  });
  
  // Extinction type breakdown
  const extinctionTypes: Record<string, number> = {};
  results.probabilityDistributions.byRun.forEach(run => {
    if (run.extinctionType) {
      const key = `${run.extinctionType}:${run.extinctionMechanism}`;
      extinctionTypes[key] = (extinctionTypes[key] || 0) + 1;
    }
  });
  
  if (Object.keys(extinctionTypes).length > 0) {
    console.log('\n💀 Active Extinction Scenarios:');
    Object.entries(extinctionTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, count]) => {
        const [type, mechanism] = key.split(':');
        console.log(`  ${type.padEnd(12)} ${mechanism.padEnd(30)} ${count} runs`);
      });
  }
  
  // Display quartile progression
  console.log('\n📉 Average Trajectory (Quartiles):');
  console.log('==================================');
  aggregated.quartileAverages.forEach((snapshot, i) => {
    const label = i === 0 ? 'Initial' : i === aggregated.quartileAverages.length - 1 ? 'Final  ' : `Q${i}     `;
    console.log(`${label} (Month ${snapshot.month.toString().padStart(3)}): ` +
      `AI=${snapshot.totalAICapability.toFixed(2)} ` +
      `Unemp=${(snapshot.unemployment * 100).toFixed(0)}% ` +
      `Trust=${(snapshot.trustInAI * 100).toFixed(0)}% ` +
      `Stage=${snapshot.economicStage.toFixed(1)} ` +
      `Ext=${(snapshot.extinctionProbability * 100).toFixed(0)}%`
    );
  });
  
  // Display average trajectories with std dev
  console.log('\n📊 Average Changes (± std dev):');
  console.log('================================');
  console.log(`AI Capability: ${aggregated.averageTrajectories.aiCapabilityGrowth.mean >= 0 ? '+' : ''}${aggregated.averageTrajectories.aiCapabilityGrowth.mean.toFixed(2)} ± ${aggregated.averageTrajectories.aiCapabilityGrowth.std.toFixed(2)}`);
  console.log(`Unemployment:  ${aggregated.averageTrajectories.unemploymentChange.mean >= 0 ? '+' : ''}${(aggregated.averageTrajectories.unemploymentChange.mean * 100).toFixed(1)}% ± ${(aggregated.averageTrajectories.unemploymentChange.std * 100).toFixed(1)}%`);
  console.log(`Trust:         ${aggregated.averageTrajectories.trustChange.mean >= 0 ? '+' : ''}${(aggregated.averageTrajectories.trustChange.mean * 100).toFixed(1)}% ± ${(aggregated.averageTrajectories.trustChange.std * 100).toFixed(1)}%`);
  console.log(`Economic Stage: ${aggregated.averageTrajectories.stageProgression.mean >= 0 ? '+' : ''}${aggregated.averageTrajectories.stageProgression.mean.toFixed(2)} ± ${aggregated.averageTrajectories.stageProgression.std.toFixed(2)}`);
  
  // Display event analysis
  console.log('\n🎭 Event Analysis:');
  console.log('==================');
  const sortedEvents = Object.entries(aggregated.eventFrequencies).sort((a, b) => b[1] - a[1]);
  sortedEvents.slice(0, 5).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(15)}: ${count} events`);
  });
  console.log(`  Critical events: ${(logs.reduce((sum, log) => sum + log.events.criticalEvents.length, 0) / logs.length).toFixed(1)} per run`);
}

