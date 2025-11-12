/**
 * Phase 3 Scenario Analysis - Monte Carlo Batch Runner
 *
 * Created: November 11, 2025
 * Purpose: Run Monte Carlo N=10 for all 11 Phase 3 scenarios
 * Context: Testing governance priority, initial conditions, and tech deployment strategies
 *
 * Usage: npx tsx scripts/runPhase3Scenarios.ts [maxMonths]
 */

import { runScenario } from './scenarioRunner';
import { compareScenarios, generateMarkdownReport } from './compareScenarios';
import { ScenarioResult } from '../src/types/scenarios';
import * as fs from 'fs';

/** Phase 3 scenarios to test */
const PHASE3_SCENARIOS = {
  governancePriority: [
    'climate-first',
    'equality-first',
    'ai-alignment-first',
    'democratic-participation',
    'scientific-acceleration',
    'authoritarian-efficiency'
  ],
  initialConditions: [
    'high-trust-start',
    'low-inequality-start',
    'strong-institutions-start'
  ]
};

/** Monte Carlo configuration */
const MONTE_CARLO_N = 10;
const SEEDS = Array.from({ length: MONTE_CARLO_N }, (_, i) => i + 1);

/**
 * Aggregate Monte Carlo results
 */
function aggregateResults(results: ScenarioResult[]): {
  meanSpiralsActive: number;
  spiralActivationRate: { [spiral: string]: number };
  cascadeActivationRate: number;
  meanCascadeStrength: number;
  meanQoL: number;
  meanPopulation: number;
  meanTempDelta: number;
  outcomeDistribution: { [outcome: string]: number };
} {
  const n = results.length;

  // Spiral activation rates
  const spiralCounts: { [spiral: string]: number } = {};
  let totalSpiralsActive = 0;
  let cascadesActive = 0;
  let totalCascadeStrength = 0;
  let totalQoL = 0;
  let totalPopulation = 0;
  let totalTempDelta = 0;
  const outcomeCounts: { [outcome: string]: number } = {};

  for (const result of results) {
    // Count active spirals
    totalSpiralsActive += result.spiralActivation.activeUpwardSpirals.length;

    for (const spiral of result.spiralActivation.activeUpwardSpirals) {
      spiralCounts[spiral] = (spiralCounts[spiral] || 0) + 1;
    }

    // Cascade activation
    if (result.spiralActivation.cascadeActive) {
      cascadesActive++;
    }
    totalCascadeStrength += result.spiralActivation.cascadeStrength;

    // Aggregate metrics
    totalQoL += result.finalQoL.overallAvg;
    totalPopulation += result.finalPopulation;
    totalTempDelta += result.finalEnvironment.globalTempDelta;

    // Outcome distribution
    outcomeCounts[result.outcome] = (outcomeCounts[result.outcome] || 0) + 1;
  }

  // Convert counts to rates
  const spiralActivationRate: { [spiral: string]: number } = {};
  for (const spiral in spiralCounts) {
    spiralActivationRate[spiral] = spiralCounts[spiral] / n;
  }

  return {
    meanSpiralsActive: totalSpiralsActive / n,
    spiralActivationRate,
    cascadeActivationRate: cascadesActive / n,
    meanCascadeStrength: totalCascadeStrength / n,
    meanQoL: totalQoL / n,
    meanPopulation: totalPopulation / n,
    meanTempDelta: totalTempDelta / n,
    outcomeDistribution: Object.fromEntries(
      Object.entries(outcomeCounts).map(([outcome, count]) => [outcome, count / n])
    )
  };
}

/**
 * Run Monte Carlo for a single scenario
 */
function runMonteCarloScenario(
  scenarioId: string,
  maxMonths: number
): { results: ScenarioResult[]; aggregate: ReturnType<typeof aggregateResults> } {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🎲 MONTE CARLO: ${scenarioId} (N=${MONTE_CARLO_N})`);
  console.log('='.repeat(100));

  const results: ScenarioResult[] = [];

  for (let i = 0; i < MONTE_CARLO_N; i++) {
    const seed = SEEDS[i];
    console.log(`\n[${i + 1}/${MONTE_CARLO_N}] Running seed ${seed}...`);

    try {
      const result = runScenario(scenarioId, seed, maxMonths);
      results.push(result);

      // Brief summary
      console.log(`  ✅ Complete: ${result.outcome}, ${result.spiralActivation.activeUpwardSpirals.length} spirals active`);
    } catch (error) {
      console.error(`  ❌ Error on seed ${seed}:`, error);
      throw error;
    }
  }

  const aggregate = aggregateResults(results);

  // Print aggregate summary
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📊 AGGREGATE RESULTS: ${scenarioId}`);
  console.log('='.repeat(100));
  console.log(`Mean spirals active: ${aggregate.meanSpiralsActive.toFixed(2)}`);
  console.log(`Cascade activation rate: ${(aggregate.cascadeActivationRate * 100).toFixed(1)}%`);
  console.log(`Mean QoL: ${(aggregate.meanQoL * 100).toFixed(1)}%`);
  console.log(`\nSpiral activation rates:`);
  for (const [spiral, rate] of Object.entries(aggregate.spiralActivationRate).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${spiral}: ${(rate * 100).toFixed(1)}%`);
  }
  console.log(`\nOutcome distribution:`);
  for (const [outcome, rate] of Object.entries(aggregate.outcomeDistribution).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${outcome}: ${(rate * 100).toFixed(1)}%`);
  }

  return { results, aggregate };
}

/**
 * Generate Phase 3 comprehensive report
 */
function generatePhase3Report(
  allResults: Map<string, { results: ScenarioResult[]; aggregate: ReturnType<typeof aggregateResults> }>,
  baselineResults: { results: ScenarioResult[]; aggregate: ReturnType<typeof aggregateResults> }
): string {
  const timestamp = new Date().toISOString().slice(0, 10);

  let report = `# Scenario Analysis Framework Phase 3 - Results

**Date:** ${timestamp}
**Monte Carlo:** N=${MONTE_CARLO_N}
**Objective:** Test governance priority, initial conditions, and tech deployment strategies to identify spiral activation enablers

## Executive Summary

**Baseline (god-mode):**
- Mean spirals active: ${baselineResults.aggregate.meanSpiralsActive.toFixed(2)}
- Cascade activation rate: ${(baselineResults.aggregate.cascadeActivationRate * 100).toFixed(1)}%
- Mean QoL: ${(baselineResults.aggregate.meanQoL * 100).toFixed(1)}%

**Key Findings:**
`;

  // Find scenarios with highest spiral activation
  const scenariosBySpirals = Array.from(allResults.entries())
    .filter(([id]) => id !== 'god-mode')
    .sort((a, b) => b[1].aggregate.meanSpiralsActive - a[1].aggregate.meanSpiralsActive);

  report += `\n### Highest Spiral Activation\n`;
  for (let i = 0; i < Math.min(5, scenariosBySpirals.length); i++) {
    const [id, data] = scenariosBySpirals[i];
    const delta = data.aggregate.meanSpiralsActive - baselineResults.aggregate.meanSpiralsActive;
    report += `${i + 1}. **${id}**: ${data.aggregate.meanSpiralsActive.toFixed(2)} spirals (Δ${delta >= 0 ? '+' : ''}${delta.toFixed(2)})\n`;
  }

  // Find scenarios with highest cascade activation
  const scenariosByCascade = Array.from(allResults.entries())
    .filter(([id]) => id !== 'god-mode')
    .sort((a, b) => b[1].aggregate.cascadeActivationRate - a[1].aggregate.cascadeActivationRate);

  report += `\n### Highest Cascade Activation\n`;
  for (let i = 0; i < Math.min(5, scenariosByCascade.length); i++) {
    const [id, data] = scenariosByCascade[i];
    const delta = (data.aggregate.cascadeActivationRate - baselineResults.aggregate.cascadeActivationRate) * 100;
    report += `${i + 1}. **${id}**: ${(data.aggregate.cascadeActivationRate * 100).toFixed(1)}% (Δ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp)\n`;
  }

  // Category analysis
  report += `\n## Category Analysis\n`;

  for (const [category, scenarios] of Object.entries(PHASE3_SCENARIOS)) {
    report += `\n### ${category}\n\n`;
    report += `| Scenario | Mean Spirals | Cascade Rate | Mean QoL | Top Spirals |\n`;
    report += `|----------|--------------|--------------|----------|-------------|\n`;

    for (const scenarioId of scenarios) {
      const data = allResults.get(scenarioId);
      if (!data) continue;

      const topSpirals = Object.entries(data.aggregate.spiralActivationRate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([spiral]) => spiral)
        .join(', ');

      report += `| ${scenarioId} | ${data.aggregate.meanSpiralsActive.toFixed(2)} | ${(data.aggregate.cascadeActivationRate * 100).toFixed(1)}% | ${(data.aggregate.meanQoL * 100).toFixed(1)}% | ${topSpirals || 'None'} |\n`;
    }
  }

  // Detailed results for each scenario
  report += `\n## Detailed Results\n`;

  for (const [scenarioId, data] of allResults.entries()) {
    if (scenarioId === 'god-mode') continue;

    report += `\n### ${scenarioId}\n\n`;
    report += `**Spiral Activation Rates:**\n`;
    for (const [spiral, rate] of Object.entries(data.aggregate.spiralActivationRate).sort((a, b) => b[1] - a[1])) {
      report += `- ${spiral}: ${(rate * 100).toFixed(1)}%\n`;
    }

    report += `\n**Outcome Distribution:**\n`;
    for (const [outcome, rate] of Object.entries(data.aggregate.outcomeDistribution).sort((a, b) => b[1] - a[1])) {
      report += `- ${outcome}: ${(rate * 100).toFixed(1)}%\n`;
    }

    report += `\n**Key Metrics:**\n`;
    report += `- Mean QoL: ${(data.aggregate.meanQoL * 100).toFixed(1)}%\n`;
    report += `- Mean population: ${(data.aggregate.meanPopulation / 1e9).toFixed(2)}B\n`;
    report += `- Mean temp delta: ${data.aggregate.meanTempDelta >= 0 ? '+' : ''}${data.aggregate.meanTempDelta.toFixed(2)}°C\n`;
    report += `\n---\n`;
  }

  return report;
}

/**
 * Main execution
 */
async function main() {
  const maxMonths = process.argv[2] ? parseInt(process.argv[2]) : 360;

  console.log('🚀 Phase 3 Scenario Analysis - Monte Carlo Batch Runner');
  console.log(`📊 Monte Carlo N=${MONTE_CARLO_N}, Max months=${maxMonths}`);
  console.log(`🎯 Total scenarios: ${Object.values(PHASE3_SCENARIOS).flat().length + 1} (9 test + 1 baseline)\n`);

  // Create output directory
  const outputDir = 'logs/phase3_results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Store all results
  const allResults = new Map<string, { results: ScenarioResult[]; aggregate: ReturnType<typeof aggregateResults> }>();

  // Run baseline (god-mode) first
  console.log('\n' + '='.repeat(100));
  console.log('📊 BASELINE: god-mode');
  console.log('='.repeat(100));
  const baselineResults = runMonteCarloScenario('god-mode', maxMonths);
  allResults.set('god-mode', baselineResults);

  // Save baseline results
  const baselineFile = `${outputDir}/baseline_god-mode_MC${MONTE_CARLO_N}.json`;
  fs.writeFileSync(baselineFile, JSON.stringify(baselineResults, null, 2));
  console.log(`💾 Baseline saved to: ${baselineFile}`);

  // Run all Phase 3 scenarios
  for (const [category, scenarios] of Object.entries(PHASE3_SCENARIOS)) {
    console.log(`\n\n${'='.repeat(100)}`);
    console.log(`🏷️  CATEGORY: ${category}`);
    console.log('='.repeat(100));

    for (const scenarioId of scenarios) {
      const scenarioResults = runMonteCarloScenario(scenarioId, maxMonths);
      allResults.set(scenarioId, scenarioResults);

      // Save individual scenario results
      const scenarioFile = `${outputDir}/${scenarioId}_MC${MONTE_CARLO_N}.json`;
      fs.writeFileSync(scenarioFile, JSON.stringify(scenarioResults, null, 2));
      console.log(`💾 Saved to: ${scenarioFile}`);
    }
  }

  // Generate comprehensive report
  console.log('\n\n' + '='.repeat(100));
  console.log('📝 Generating Phase 3 Report');
  console.log('='.repeat(100));

  const report = generatePhase3Report(allResults, baselineResults);
  const reportPath = `reviews/scenario_phase3_results_${new Date().toISOString().slice(0, 10)}.md`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n✅ Phase 3 Analysis Complete!`);
  console.log(`📊 Report saved to: ${reportPath}`);
  console.log(`💾 Individual results in: ${outputDir}/`);
  console.log(`\n${'='.repeat(100)}\n`);
}

// Run main
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runMonteCarloScenario, aggregateResults };
