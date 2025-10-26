#!/usr/bin/env tsx
/**
 * Nested Monte Carlo Simulation - Phase 1C: Epistemic vs Aleatory Uncertainty
 *
 * Two-loop structure separates:
 * - EPISTEMIC uncertainty (outer loop): Threshold parameter uncertainty
 * - ALEATORY uncertainty (inner loop): Stochastic simulation outcomes
 *
 * Architecture:
 * 1. Outer loop: Sample threshold distributions once per epistemic scenario
 * 2. Inner loop: Run N simulations with fixed thresholds (aleatory variation only)
 * 3. Analysis: Compare outcomes across different threshold configurations
 *
 * Example:
 *   Outer run 1: socialCriticalMass=0.24, trustRecovery=0.012, climateSensitivity=2.8
 *     Inner runs 1-10: Different AI agent configs, events, but same thresholds
 *   Outer run 2: socialCriticalMass=0.26, trustRecovery=0.018, climateSensitivity=3.2
 *     Inner runs 11-20: Different AI agent configs, events, but same thresholds
 *
 * This reveals:
 * - Which thresholds drive outcome variance (epistemic sensitivity)
 * - How much randomness matters given fixed thresholds (aleatory variance)
 *
 * Usage:
 *   npx tsx scripts/nestedMonteCarloSimulation.ts --outer-runs=5 --inner-runs=10
 *   (5 threshold scenarios × 10 simulations each = 50 total runs)
 *
 * Output: nestedMC_TIMESTAMP.json with threshold values + outcomes
 */

import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent, ScenarioMode } from '../src/types/game';
import { getScenarioDescription } from '../src/simulation/scenarioParameters';
import { sampleTier1Thresholds, Tier1Thresholds } from '../src/simulation/thresholds/tier1Config';
import { sampleTier2Thresholds, Tier2Thresholds } from '../src/simulation/thresholds/tier2Config';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

interface CLIArgs {
  outerRuns: number;  // Number of epistemic scenarios (threshold samples)
  innerRuns: number;  // Number of aleatory runs per scenario
  maxMonths: number;
  scenarioMode: ScenarioMode;
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const defaults = {
    outerRuns: 5,     // 5 threshold scenarios by default
    innerRuns: 10,    // 10 simulations per scenario
    maxMonths: 120,
    scenarioMode: 'historical' as ScenarioMode
  };

  let outerRuns = defaults.outerRuns;
  let innerRuns = defaults.innerRuns;
  let maxMonths = defaults.maxMonths;
  let scenarioMode = defaults.scenarioMode;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--outer-runs' && i + 1 < args.length) {
      outerRuns = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--inner-runs' && i + 1 < args.length) {
      innerRuns = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--max-months' && i + 1 < args.length) {
      maxMonths = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--scenario' && i + 1 < args.length) {
      scenarioMode = args[i + 1] as ScenarioMode;
      i++;
    }
  }

  return { outerRuns, innerRuns, maxMonths, scenarioMode };
}

// ============================================================================
// FILE LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');
const logFile = path.join(outputDir, `nestedMC_${timestamp}.log`);
const resultsFile = path.join(outputDir, `nestedMC_${timestamp}.json`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n', 'utf8');
}

function logError(message: string) {
  console.error(message);
  fs.appendFileSync(logFile, `ERROR: ${message}\n`, 'utf8');
}

// ============================================================================
// RESULT TYPES
// ============================================================================

interface InnerRunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  rawOutcome?: string;
  outcomeReason: string;
  months: number;
  finalQoL: number;
  avgAICapability: number;
  avgAlignment: number;

  // Multi-paradigm outcomes
  finalWestern: number;
  finalDevelopment: number;
  finalEcological: number;
  finalIndigenous: number;
  paradigmDivergence: number;
}

interface EpistemicScenario {
  epistemicId: number;
  thresholdSeed: number;
  thresholds: Tier1Thresholds;
  innerRuns: InnerRunResult[];

  // Aggregate statistics for this epistemic scenario
  outcomeDistribution: {
    utopia: number;
    dystopia: number;
    extinction: number;
    stalemate: number;
    none: number;
  };
  avgQoL: number;
  avgDuration: number;
  avgCapability: number;
  avgAlignment: number;
}

interface NestedMCResults {
  metadata: {
    timestamp: string;
    outerRuns: number;
    innerRuns: number;
    totalRuns: number;
    maxMonths: number;
    scenarioMode: ScenarioMode;
  };
  epistemicScenarios: EpistemicScenario[];

  // Cross-epistemic analysis
  thresholdSensitivity: {
    socialCriticalMass: { min: number; max: number; mean: number };
    trustRecoveryRate: { min: number; max: number; mean: number };
    climateSensitivity: { min: number; max: number; mean: number };
    governmentLegitimacyCrisisThreshold: { min: number; max: number; mean: number };
    automationJobLossThreshold: { min: number; max: number; mean: number };
  };

  // Overall outcome distribution (across all runs)
  overallOutcomes: {
    utopia: number;
    dystopia: number;
    extinction: number;
    stalemate: number;
    none: number;
  };
}

// ============================================================================
// MAIN NESTED MONTE CARLO LOOP
// ============================================================================

async function runNestedMonteCarlo(args: CLIArgs): Promise<NestedMCResults> {
  log(`\n${'='.repeat(80)}`);
  log(`NESTED MONTE CARLO SIMULATION - Phase 1C`);
  log(`${'='.repeat(80)}\n`);
  log(`Configuration:`);
  log(`  Outer runs (epistemic): ${args.outerRuns}`);
  log(`  Inner runs (aleatory): ${args.innerRuns}`);
  log(`  Total simulations: ${args.outerRuns * args.innerRuns}`);
  log(`  Max months: ${args.maxMonths}`);
  log(`  Scenario mode: ${args.scenarioMode}`);
  log(`\n${'='.repeat(80)}\n`);

  const epistemicScenarios: EpistemicScenario[] = [];
  const totalRuns = args.outerRuns * args.innerRuns;
  let completedRuns = 0;

  // OUTER LOOP: Sample threshold distributions (epistemic uncertainty)
  for (let epistemicIdx = 0; epistemicIdx < args.outerRuns; epistemicIdx++) {
    const thresholdSeed = 100000 + epistemicIdx * 1000; // Separate seed space for thresholds
    const thresholdRng = new SeededRandom(thresholdSeed);

    // Sample thresholds once for this epistemic scenario (Tier 1 + Tier 2)
    const tier1Thresholds = sampleTier1Thresholds(() => thresholdRng.next());
    const tier2Thresholds = sampleTier2Thresholds(() => thresholdRng.next());
    const thresholds = { ...tier1Thresholds, ...tier2Thresholds };

    log(`\n${'─'.repeat(80)}`);
    log(`EPISTEMIC SCENARIO ${epistemicIdx + 1}/${args.outerRuns}`);
    log(`${'─'.repeat(80)}`);
    log(`Threshold seed: ${thresholdSeed}`);
    log(`Sampled thresholds (Tier 1 - Empirical):`);
    log(`  Social critical mass: ${thresholds.socialCriticalMass.toFixed(4)}`);
    log(`  Trust recovery rate: ${thresholds.trustRecoveryRate.toFixed(5)}`);
    log(`  Climate sensitivity: ${thresholds.climateSensitivity.toFixed(3)}°C`);
    log(`  Gov legitimacy crisis (T1): ${thresholds.governmentLegitimacyCrisisThreshold.toFixed(3)}`);
    log(`  Automation job loss: ${thresholds.automationJobLossThreshold.toFixed(3)}`);
    log(`Sampled thresholds (Tier 2 - Historical Ranges):`);
    log(`  Surveillance dystopia: ${thresholds.surveillanceDystopiaThreshold.toFixed(3)}`);
    log(`  Automation displacement crisis: ${thresholds.automationDisplacementCrisisThreshold.toFixed(3)}`);
    log(`  AI recursive improvement: ${thresholds.aiRecursiveImprovementThreshold.toFixed(3)}`);
    log(`  Resentment revolt trigger: ${thresholds.resentmentRevoltTriggerThreshold.toFixed(3)}`);
    log(``);

    const innerRuns: InnerRunResult[] = [];

    // INNER LOOP: Run simulations with fixed thresholds (aleatory uncertainty)
    for (let innerIdx = 0; innerIdx < args.innerRuns; innerIdx++) {
      const seed = thresholdSeed + innerIdx + 1; // Separate seed for each inner run
      completedRuns++;

      try {
        log(`  Run ${completedRuns}/${totalRuns} (Epistemic ${epistemicIdx + 1}, Inner ${innerIdx + 1}/${args.innerRuns}) [seed: ${seed}]...`);

        // Create initial state with pre-sampled thresholds
        const state = createDefaultInitialState(
          args.scenarioMode,
          undefined, // alignmentDynamicsConfig
          undefined, // climatePriorityConfig
          thresholds // Pass pre-sampled thresholds
        );

        // Run simulation using engine.run() (not step-by-step)
        const engine = new SimulationEngine({ seed });
        const runResult = engine.run(state, {
          maxMonths: args.maxMonths,
          checkActualOutcomes: true
        });

        // Map engine's outcome to reporting categories
        let outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none' = 'none';
        const engineOutcome = runResult.summary.finalOutcome;

        if (engineOutcome === 'utopia') {
          outcome = 'utopia';
        } else if (engineOutcome === 'dystopia' || engineOutcome === 'control_dystopia') {
          outcome = 'dystopia';
        } else if (engineOutcome === 'extinction' || engineOutcome.includes('extinction')) {
          outcome = 'extinction';
        } else if (engineOutcome === 'stalemate') {
          outcome = 'stalemate';
        }

        const finalState = runResult.finalState;
        const months = runResult.summary.totalMonths;

        // Extract final metrics
        const livingAIs = finalState.agents.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
        const avgCapability = livingAIs.length > 0
          ? livingAIs.reduce((sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilities.revealed), 0) / livingAIs.length
          : 0;
        const avgAlignment = livingAIs.length > 0
          ? livingAIs.reduce((sum, ai) => sum + ai.alignment.external, 0) / livingAIs.length
          : 0.5;

        const result: InnerRunResult = {
          seed,
          outcome,
          rawOutcome: engineOutcome,
          outcomeReason: runResult.summary.finalOutcomeReason,
          months,
          finalQoL: finalState.globalMetrics.qualityOfLife,
          avgAICapability: avgCapability,
          avgAlignment: avgAlignment,
          finalWestern: finalState.multiParadigmDUI.western.score,
          finalDevelopment: finalState.multiParadigmDUI.development.score,
          finalEcological: finalState.multiParadigmDUI.ecological.score,
          finalIndigenous: finalState.multiParadigmDUI.indigenous.score,
          paradigmDivergence: finalState.multiParadigmDUI.divergence.currentDivergence
        };

        innerRuns.push(result);
        log(`    → ${outcome.toUpperCase()} (${months} months, QoL: ${result.finalQoL.toFixed(2)})`);

      } catch (error: any) {
        logError(`    Run ${completedRuns} crashed: ${error.message}`);
        logError(error.stack || '');
      }
    }

    // Aggregate statistics for this epistemic scenario
    const outcomeDistribution = {
      utopia: innerRuns.filter(r => r.outcome === 'utopia').length,
      dystopia: innerRuns.filter(r => r.outcome === 'dystopia').length,
      extinction: innerRuns.filter(r => r.outcome === 'extinction').length,
      stalemate: innerRuns.filter(r => r.outcome === 'stalemate').length,
      none: innerRuns.filter(r => r.outcome === 'none').length
    };

    const avgQoL = innerRuns.reduce((sum, r) => sum + r.finalQoL, 0) / innerRuns.length;
    const avgDuration = innerRuns.reduce((sum, r) => sum + r.months, 0) / innerRuns.length;
    const avgCapability = innerRuns.reduce((sum, r) => sum + r.avgAICapability, 0) / innerRuns.length;
    const avgAlignment = innerRuns.reduce((sum, r) => sum + r.avgAlignment, 0) / innerRuns.length;

    log(`\n  Epistemic scenario ${epistemicIdx + 1} summary:`);
    log(`    Outcomes: U=${outcomeDistribution.utopia} D=${outcomeDistribution.dystopia} E=${outcomeDistribution.extinction} S=${outcomeDistribution.stalemate} N=${outcomeDistribution.none}`);
    log(`    Avg QoL: ${avgQoL.toFixed(2)}, Avg duration: ${avgDuration.toFixed(1)} months`);
    log(`    Avg capability: ${avgCapability.toFixed(2)}, Avg alignment: ${avgAlignment.toFixed(3)}`);

    epistemicScenarios.push({
      epistemicId: epistemicIdx,
      thresholdSeed,
      thresholds,
      innerRuns,
      outcomeDistribution,
      avgQoL,
      avgDuration,
      avgCapability,
      avgAlignment
    });
  }

  // ============================================================================
  // CROSS-EPISTEMIC ANALYSIS
  // ============================================================================

  log(`\n${'='.repeat(80)}`);
  log(`CROSS-EPISTEMIC ANALYSIS`);
  log(`${'='.repeat(80)}\n`);

  // Threshold sensitivity (range of sampled values)
  const thresholdSensitivity = {
    socialCriticalMass: {
      min: Math.min(...epistemicScenarios.map(s => s.thresholds.socialCriticalMass)),
      max: Math.max(...epistemicScenarios.map(s => s.thresholds.socialCriticalMass)),
      mean: epistemicScenarios.reduce((sum, s) => sum + s.thresholds.socialCriticalMass, 0) / epistemicScenarios.length
    },
    trustRecoveryRate: {
      min: Math.min(...epistemicScenarios.map(s => s.thresholds.trustRecoveryRate)),
      max: Math.max(...epistemicScenarios.map(s => s.thresholds.trustRecoveryRate)),
      mean: epistemicScenarios.reduce((sum, s) => sum + s.thresholds.trustRecoveryRate, 0) / epistemicScenarios.length
    },
    climateSensitivity: {
      min: Math.min(...epistemicScenarios.map(s => s.thresholds.climateSensitivity)),
      max: Math.max(...epistemicScenarios.map(s => s.thresholds.climateSensitivity)),
      mean: epistemicScenarios.reduce((sum, s) => sum + s.thresholds.climateSensitivity, 0) / epistemicScenarios.length
    },
    governmentLegitimacyCrisisThreshold: {
      min: Math.min(...epistemicScenarios.map(s => s.thresholds.governmentLegitimacyCrisisThreshold)),
      max: Math.max(...epistemicScenarios.map(s => s.thresholds.governmentLegitimacyCrisisThreshold)),
      mean: epistemicScenarios.reduce((sum, s) => s.thresholds.governmentLegitimacyCrisisThreshold, 0) / epistemicScenarios.length
    },
    automationJobLossThreshold: {
      min: Math.min(...epistemicScenarios.map(s => s.thresholds.automationJobLossThreshold)),
      max: Math.max(...epistemicScenarios.map(s => s.thresholds.automationJobLossThreshold)),
      mean: epistemicScenarios.reduce((sum, s) => sum + s.thresholds.automationJobLossThreshold, 0) / epistemicScenarios.length
    }
  };

  log(`Threshold ranges sampled (epistemic uncertainty):`);
  log(`  Social critical mass: [${thresholdSensitivity.socialCriticalMass.min.toFixed(4)}, ${thresholdSensitivity.socialCriticalMass.max.toFixed(4)}] (μ=${thresholdSensitivity.socialCriticalMass.mean.toFixed(4)})`);
  log(`  Trust recovery rate: [${thresholdSensitivity.trustRecoveryRate.min.toFixed(5)}, ${thresholdSensitivity.trustRecoveryRate.max.toFixed(5)}] (μ=${thresholdSensitivity.trustRecoveryRate.mean.toFixed(5)})`);
  log(`  Climate sensitivity: [${thresholdSensitivity.climateSensitivity.min.toFixed(3)}, ${thresholdSensitivity.climateSensitivity.max.toFixed(3)}]°C (μ=${thresholdSensitivity.climateSensitivity.mean.toFixed(3)}°C)`);
  log(`  Gov legitimacy crisis: [${thresholdSensitivity.governmentLegitimacyCrisisThreshold.min.toFixed(3)}, ${thresholdSensitivity.governmentLegitimacyCrisisThreshold.max.toFixed(3)}] (μ=${thresholdSensitivity.governmentLegitimacyCrisisThreshold.mean.toFixed(3)})`);
  log(`  Automation job loss: [${thresholdSensitivity.automationJobLossThreshold.min.toFixed(3)}, ${thresholdSensitivity.automationJobLossThreshold.max.toFixed(3)}] (μ=${thresholdSensitivity.automationJobLossThreshold.mean.toFixed(3)})`);

  // Overall outcome distribution (across all inner runs)
  const allInnerRuns = epistemicScenarios.flatMap(s => s.innerRuns);
  const overallOutcomes = {
    utopia: allInnerRuns.filter(r => r.outcome === 'utopia').length,
    dystopia: allInnerRuns.filter(r => r.outcome === 'dystopia').length,
    extinction: allInnerRuns.filter(r => r.outcome === 'extinction').length,
    stalemate: allInnerRuns.filter(r => r.outcome === 'stalemate').length,
    none: allInnerRuns.filter(r => r.outcome === 'none').length
  };

  log(`\nOverall outcome distribution (${allInnerRuns.length} total runs):`);
  log(`  Utopia: ${overallOutcomes.utopia} (${(overallOutcomes.utopia / allInnerRuns.length * 100).toFixed(1)}%)`);
  log(`  Dystopia: ${overallOutcomes.dystopia} (${(overallOutcomes.dystopia / allInnerRuns.length * 100).toFixed(1)}%)`);
  log(`  Extinction: ${overallOutcomes.extinction} (${(overallOutcomes.extinction / allInnerRuns.length * 100).toFixed(1)}%)`);
  log(`  Stalemate: ${overallOutcomes.stalemate} (${(overallOutcomes.stalemate / allInnerRuns.length * 100).toFixed(1)}%)`);
  log(`  None: ${overallOutcomes.none} (${(overallOutcomes.none / allInnerRuns.length * 100).toFixed(1)}%)`);

  // Epistemic vs aleatory variance comparison
  log(`\nVariance decomposition:`);

  // Calculate between-epistemic variance (variance of means)
  const epistemicMeanQoLs = epistemicScenarios.map(s => s.avgQoL);
  const overallMeanQoL = epistemicMeanQoLs.reduce((sum, qol) => sum + qol, 0) / epistemicMeanQoLs.length;
  const betweenEpistemicVar = epistemicMeanQoLs.reduce((sum, qol) => sum + Math.pow(qol - overallMeanQoL, 2), 0) / epistemicMeanQoLs.length;

  // Calculate within-epistemic variance (mean of variances)
  const withinEpistemicVars = epistemicScenarios.map(scenario => {
    const runs = scenario.innerRuns;
    const mean = scenario.avgQoL;
    return runs.reduce((sum, r) => sum + Math.pow(r.finalQoL - mean, 2), 0) / runs.length;
  });
  const avgWithinEpistemicVar = withinEpistemicVars.reduce((sum, v) => sum + v, 0) / withinEpistemicVars.length;

  const totalVar = betweenEpistemicVar + avgWithinEpistemicVar;
  const epistemicPct = totalVar > 0 ? (betweenEpistemicVar / totalVar * 100) : 0;
  const aleatoryPct = totalVar > 0 ? (avgWithinEpistemicVar / totalVar * 100) : 0;

  log(`  Quality of Life variance:`);
  log(`    Epistemic (between threshold scenarios): ${epistemicPct.toFixed(1)}%`);
  log(`    Aleatory (within threshold scenarios): ${aleatoryPct.toFixed(1)}%`);
  log(`    Interpretation: ${epistemicPct > aleatoryPct ? 'Threshold uncertainty dominates' : 'Stochastic variation dominates'}`);

  return {
    metadata: {
      timestamp,
      outerRuns: args.outerRuns,
      innerRuns: args.innerRuns,
      totalRuns: totalRuns,
      maxMonths: args.maxMonths,
      scenarioMode: args.scenarioMode
    },
    epistemicScenarios,
    thresholdSensitivity,
    overallOutcomes
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = parseArgs();

  log(`Starting nested Monte Carlo simulation...`);
  log(`Output files:`);
  log(`  Log: ${logFile}`);
  log(`  Results: ${resultsFile}`);

  try {
    const results = await runNestedMonteCarlo(args);

    // Write results to JSON file
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2), 'utf8');

    log(`\n${'='.repeat(80)}`);
    log(`SIMULATION COMPLETE`);
    log(`${'='.repeat(80)}`);
    log(`\nResults saved to: ${resultsFile}`);
    log(`Log saved to: ${logFile}`);
    log(`\nNext steps:`);
    log(`  1. Analyze threshold sensitivity with analysis scripts`);
    log(`  2. Compare epistemic vs aleatory variance contributions`);
    log(`  3. Identify high-leverage thresholds for Phase 2 prioritization`);

  } catch (error: any) {
    logError(`Fatal error: ${error.message}`);
    logError(error.stack || '');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error: any) => {
  logError(`Unhandled rejection: ${error.message}`);
  logError(error.stack || '');
  process.exit(1);
});

main();
