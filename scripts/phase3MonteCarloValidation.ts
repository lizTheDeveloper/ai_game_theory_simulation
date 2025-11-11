/**
 * Phase 3 Monte Carlo Validation - Run N=10 for each of 13 scenarios
 *
 * Created: November 11, 2025
 * Purpose: Systematic validation of spiral activation patterns across scenarios
 * Context: Test which governance dimensions enable cooperative spiral activation
 *
 * Scenarios (13 total):
 * - Government Priority (6): climate-first, equality-first, ai-alignment-first,
 *                             democratic-participation, scientific-acceleration, authoritarian-efficiency
 * - Starting Conditions (3): high-trust-start, low-inequality-start, strong-institutions-start
 * - Tech Deployment (4): renewable-first, carbon-removal-first, foundations-first, adaptive-deployment
 *
 * Parameters:
 * - Seeds: 100-109 (deterministic reproducibility)
 * - Duration: 120 months (10 years)
 * - Output: logs/phase3_mc_[scenario]_seed[N].log
 *
 * Analysis:
 * - Spiral activation frequency (% of runs)
 * - Timing of first activation (month)
 * - Duration of activation (months active)
 * - Outcome distributions (7-tier classification)
 * - Coefficient of variation (CV) per scenario (determinism validation)
 */

import { runScenario } from './scenarioRunner';
import * as fs from 'fs';
import * as path from 'path';

// Scenario list (13 total)
const SCENARIOS = [
  // Government Priority Scenarios (6)
  'climate-first',
  'equality-first',
  'ai-alignment-first',
  'democratic-participation',
  'scientific-acceleration',
  'authoritarian-efficiency',

  // Starting Condition Scenarios (3)
  'high-trust-start',
  'low-inequality-start',
  'strong-institutions-start',

  // Technology Deployment Strategies (4)
  'renewable-first',
  'carbon-removal-first',
  'foundations-first',
  'adaptive-deployment',
];

// Monte Carlo parameters
const SEEDS = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]; // N=10
const MAX_MONTHS = 120; // 10 years

/**
 * Run Monte Carlo validation for all scenarios
 */
async function runMonteCarloValidation() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 PHASE 3 MONTE CARLO VALIDATION');
  console.log('='.repeat(100));
  console.log(`Total runs: ${SCENARIOS.length} scenarios × ${SEEDS.length} seeds = ${SCENARIOS.length * SEEDS.length} runs`);
  console.log(`Duration: ${MAX_MONTHS} months (${MAX_MONTHS / 12} years)`);
  console.log(`Seeds: ${SEEDS[0]}-${SEEDS[SEEDS.length - 1]}\n`);

  // Create output directory
  const outputDir = path.join(process.cwd(), 'logs', 'phase3_mc');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Store all results for analysis
  const allResults: any[] = [];

  // Run each scenario × seed combination
  let totalRuns = 0;
  let completedRuns = 0;
  const startTime = Date.now();

  for (const scenario of SCENARIOS) {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`🎭 SCENARIO: ${scenario}`);
    console.log('='.repeat(100));

    const scenarioResults: any[] = [];

    for (const seed of SEEDS) {
      totalRuns++;
      console.log(`\n  Run ${totalRuns}/${SCENARIOS.length * SEEDS.length}: ${scenario} (seed ${seed})`);

      try {
        // Run simulation
        const result = runScenario(scenario, seed, MAX_MONTHS);

        // Store result
        scenarioResults.push(result);
        allResults.push(result);

        // Save individual result to file
        const filename = path.join(outputDir, `${scenario}_seed${seed}.json`);
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));

        completedRuns++;
        console.log(`  ✅ Completed: ${scenario} seed ${seed}`);
        console.log(`     Outcome: ${result.outcome}`);
        console.log(`     Active spirals: ${result.spiralActivation.activeUpwardSpirals.length}`);
        console.log(`     Cascade active: ${result.spiralActivation.cascadeActive}`);

      } catch (error) {
        console.error(`  ❌ Error in ${scenario} seed ${seed}:`, error);
        // Continue with next run
      }
    }

    // Calculate scenario-level statistics
    const scenarioStats = calculateScenarioStats(scenario, scenarioResults);

    // Save scenario summary
    const summaryFilename = path.join(outputDir, `${scenario}_summary.json`);
    fs.writeFileSync(summaryFilename, JSON.stringify(scenarioStats, null, 2));

    // Print scenario summary
    printScenarioSummary(scenario, scenarioStats);
  }

  // Calculate aggregate statistics
  const elapsedTime = (Date.now() - startTime) / 1000; // seconds
  console.log('\n' + '='.repeat(100));
  console.log('📊 MONTE CARLO VALIDATION COMPLETE');
  console.log('='.repeat(100));
  console.log(`Total runs: ${totalRuns}`);
  console.log(`Completed: ${completedRuns}`);
  console.log(`Failed: ${totalRuns - completedRuns}`);
  console.log(`Elapsed time: ${(elapsedTime / 60).toFixed(1)} minutes`);
  console.log(`Average time per run: ${(elapsedTime / totalRuns).toFixed(1)} seconds`);

  // Generate comparative analysis
  console.log('\n' + '='.repeat(100));
  console.log('📊 COMPARATIVE ANALYSIS');
  console.log('='.repeat(100));

  const comparativeAnalysis = generateComparativeAnalysis(allResults);
  const analysisFilename = path.join(outputDir, 'comparative_analysis.json');
  fs.writeFileSync(analysisFilename, JSON.stringify(comparativeAnalysis, null, 2));

  printComparativeAnalysis(comparativeAnalysis);

  console.log(`\n💾 Results saved to: ${outputDir}/`);
  console.log(`   - Individual runs: ${scenario}_seed${SEEDS[0]}.json ... ${scenario}_seed${SEEDS[SEEDS.length - 1]}.json`);
  console.log(`   - Scenario summaries: ${scenario}_summary.json`);
  console.log(`   - Comparative analysis: comparative_analysis.json`);
}

/**
 * Calculate statistics for a single scenario across all seeds
 */
function calculateScenarioStats(scenario: string, results: any[]): any {
  if (results.length === 0) return null;

  // Extract spiral activation data
  const spiralActivationCounts: Record<string, number> = {};
  let totalCascadeActive = 0;
  let totalCascadeStrength = 0;
  const outcomes: Record<string, number> = {};
  const populations: number[] = [];
  const qolScores: number[] = [];
  const tempDeltas: number[] = [];

  for (const result of results) {
    // Count spiral activations
    for (const spiral of result.spiralActivation.activeUpwardSpirals) {
      spiralActivationCounts[spiral] = (spiralActivationCounts[spiral] || 0) + 1;
    }

    // Cascade metrics
    if (result.spiralActivation.cascadeActive) totalCascadeActive++;
    totalCascadeStrength += result.spiralActivation.cascadeStrength;

    // Outcome distribution
    outcomes[result.outcome] = (outcomes[result.outcome] || 0) + 1;

    // Numeric metrics
    populations.push(result.finalPopulation);
    qolScores.push(result.finalQoL.overallAvg);
    tempDeltas.push(result.finalEnvironment.globalTempDelta);
  }

  const N = results.length;

  // Calculate coefficient of variation (CV) for determinism check
  const popCV = calculateCV(populations);
  const qolCV = calculateCV(qolScores);
  const tempCV = calculateCV(tempDeltas);

  return {
    scenario,
    runs: N,
    spiralActivation: {
      frequency: Object.entries(spiralActivationCounts).map(([spiral, count]) => ({
        spiral,
        activationRate: count / N,
        activatedInNRuns: count,
      })).sort((a, b) => b.activationRate - a.activationRate),
      cascadeActiveRate: totalCascadeActive / N,
      avgCascadeStrength: totalCascadeStrength / N,
    },
    outcomeDistribution: Object.entries(outcomes).map(([outcome, count]) => ({
      outcome,
      frequency: count / N,
      count,
    })).sort((a, b) => b.frequency - a.frequency),
    finalMetrics: {
      population: { mean: mean(populations), std: std(populations), cv: popCV },
      qol: { mean: mean(qolScores), std: std(qolScores), cv: qolCV },
      tempDelta: { mean: mean(tempDeltas), std: std(tempDeltas), cv: tempCV },
    },
    determinismValidation: {
      populationCV: popCV,
      qolCV: qolCV,
      tempCV: tempCV,
      isDeterministic: popCV < 0.10 && qolCV < 0.10 && tempCV < 0.10, // CV < 10% acceptable
    },
  };
}

/**
 * Generate comparative analysis across all scenarios
 */
function generateComparativeAnalysis(allResults: any[]): any {
  // Group results by scenario
  const resultsByScenario: Record<string, any[]> = {};
  for (const result of allResults) {
    if (!resultsByScenario[result.scenarioId]) {
      resultsByScenario[result.scenarioId] = [];
    }
    resultsByScenario[result.scenarioId].push(result);
  }

  // Calculate stats per scenario
  const scenarioStats = Object.entries(resultsByScenario).map(([scenario, results]) =>
    calculateScenarioStats(scenario, results)
  );

  // Rank scenarios by spiral activation rate
  const spiralRankings = scenarioStats
    .map(stats => ({
      scenario: stats.scenario,
      cascadeActiveRate: stats.spiralActivation.cascadeActiveRate,
      avgCascadeStrength: stats.spiralActivation.avgCascadeStrength,
      uniqueSpiralsActivated: stats.spiralActivation.frequency.filter((f: any) => f.activationRate > 0).length,
      avgQoL: stats.finalMetrics.qol.mean,
      avgPopulation: stats.finalMetrics.population.mean,
    }))
    .sort((a, b) => b.cascadeActiveRate - a.cascadeActiveRate);

  // Identify best spiral activators
  const topSpiralActivators = spiralRankings.slice(0, 5);

  // Identify zero-effectiveness scenarios
  const zeroEffectiveness = spiralRankings.filter(s => s.cascadeActiveRate === 0);

  return {
    totalScenarios: SCENARIOS.length,
    totalRuns: allResults.length,
    spiralRankings,
    topSpiralActivators,
    zeroEffectiveness,
    scenarioStats,
  };
}

/**
 * Print scenario summary
 */
function printScenarioSummary(scenario: string, stats: any): void {
  if (!stats) return;

  console.log(`\n  📊 Summary for ${scenario}:`);
  console.log(`     Runs: ${stats.runs}`);
  console.log(`     Cascade activation rate: ${(stats.spiralActivation.cascadeActiveRate * 100).toFixed(1)}%`);
  console.log(`     Avg cascade strength: ${stats.spiralActivation.avgCascadeStrength.toFixed(3)}`);
  console.log(`     Unique spirals activated: ${stats.spiralActivation.frequency.length}`);

  if (stats.spiralActivation.frequency.length > 0) {
    console.log(`     Top spirals:`);
    for (const spiralData of stats.spiralActivation.frequency.slice(0, 3)) {
      console.log(`       - ${spiralData.spiral}: ${(spiralData.activationRate * 100).toFixed(1)}% (${spiralData.activatedInNRuns}/${stats.runs} runs)`);
    }
  }

  console.log(`     Determinism CV: pop=${(stats.determinismValidation.populationCV * 100).toFixed(1)}%, qol=${(stats.determinismValidation.qolCV * 100).toFixed(1)}%, temp=${(stats.determinismValidation.tempCV * 100).toFixed(1)}%`);
  console.log(`     Deterministic: ${stats.determinismValidation.isDeterministic ? '✅ YES' : '❌ NO'}`);
}

/**
 * Print comparative analysis
 */
function printComparativeAnalysis(analysis: any): void {
  console.log(`\n📈 TOP SPIRAL ACTIVATORS (by cascade activation rate):`);
  for (let i = 0; i < Math.min(5, analysis.topSpiralActivators.length); i++) {
    const scenario = analysis.topSpiralActivators[i];
    console.log(`   ${i + 1}. ${scenario.scenario.padEnd(30)} - ${(scenario.cascadeActiveRate * 100).toFixed(1)}% cascade rate`);
    console.log(`      Unique spirals: ${scenario.uniqueSpiralsActivated}, Avg strength: ${scenario.avgCascadeStrength.toFixed(3)}`);
  }

  console.log(`\n❌ ZERO-EFFECTIVENESS SCENARIOS:`);
  if (analysis.zeroEffectiveness.length === 0) {
    console.log(`   None - all scenarios showed some spiral activation`);
  } else {
    for (const scenario of analysis.zeroEffectiveness) {
      console.log(`   - ${scenario.scenario}: 0% cascade activation`);
    }
  }
}

/**
 * Calculate coefficient of variation (CV = std / mean)
 */
function calculateCV(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  if (m === 0) return 0;
  return std(values) / Math.abs(m);
}

/**
 * Calculate mean of array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of array
 */
function std(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Entry point
if (require.main === module) {
  runMonteCarloValidation().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
