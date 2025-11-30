#!/usr/bin/env npx tsx
/**
 * Monte Carlo Outcome Distribution Analysis
 *
 * Analyzes outcome distributions from Monte Carlo runs to understand:
 * - What differentiates utopia from dystopia runs
 * - Predictable patterns in outcome classification
 * - Parameter sensitivity for outcome optimization
 *
 * Usage: npx tsx scripts/analyzeOutcomeDistributions.ts [pattern]
 * Example: npx tsx scripts/analyzeOutcomeDistributions.ts "run_420*"
 */

import fs from 'fs';
import path from 'path';

interface RunData {
  seed: number;
  finalOutcome: string;
  mortality: number;
  techUnlocked: number;
  resentmentLevel: number;
  ecologicalScore: number | null;
  scenario: string;
  finalMonth: number;
  population: number;
}

interface OutcomeStats {
  outcomeDistribution: Record<string, number>;
  mortalityStats: {
    mean: number;
    median: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
  };
  techStats: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };
  resentmentStats: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };
}

function extractMetrics(data: any): RunData {
  const trajectory = data.paradigmTrajectory || [];
  const final = trajectory[trajectory.length - 1] || {};
  const events = data.events || [];

  // Extract mortality (percentage)
  const population = final.population || 0;
  const initialPopulation = trajectory[0]?.population || 8.15e9;
  const mortality = ((initialPopulation - population) / initialPopulation) * 100;

  // Extract tech count
  const techUnlocked = data.techUnlocked || 0;

  // Extract resentment
  const resentmentLevel = final.resentment || 0;

  // Extract ecological paradigm score
  const ecologicalScore = final.ecological || null;

  // Determine outcome classification
  const finalOutcome = classifyOutcome(mortality, ecologicalScore, resentmentLevel, techUnlocked);

  return {
    seed: data.seed || 0,
    finalOutcome,
    mortality,
    techUnlocked,
    resentmentLevel,
    ecologicalScore,
    scenario: data.scenario || 'UNKNOWN',
    finalMonth: data.finalMonth || 0,
    population,
  };
}

function classifyOutcome(
  mortality: number,
  ecological: number | null,
  resentment: number,
  techCount: number
): string {
  // Simplified 7-tier classification
  if (mortality < 30 && techCount > 50 && resentment < 0.5) return 'UTOPIA';
  if (mortality < 50 && techCount > 30) return 'MANAGED_TRANSITION';
  if (mortality < 70 && techCount > 20) return 'PYRRHIC_DYSTOPIA';
  if (mortality < 85) return 'ECOLOGICAL_COLLAPSE';
  if (mortality < 95) return 'CIVILIZATIONAL_COLLAPSE';
  if (mortality < 99) return 'NEAR_EXTINCTION';
  return 'EXTINCTION';
}

function calculateStatistics(runs: RunData[]): OutcomeStats {
  const outcomeDistribution: Record<string, number> = {};
  const mortalities = runs.map(r => r.mortality).sort((a, b) => a - b);
  const techCounts = runs.map(r => r.techUnlocked).sort((a, b) => a - b);
  const resentments = runs.map(r => r.resentmentLevel).sort((a, b) => a - b);

  // Outcome distribution
  for (const run of runs) {
    outcomeDistribution[run.finalOutcome] = (outcomeDistribution[run.finalOutcome] || 0) + 1;
  }

  // Mortality stats
  const mortalityMean = mortalities.reduce((a, b) => a + b, 0) / mortalities.length;
  const mortalityMedian = mortalities[Math.floor(mortalities.length / 2)];
  const q1Index = Math.floor(mortalities.length * 0.25);
  const q3Index = Math.floor(mortalities.length * 0.75);

  // Tech stats
  const techMean = techCounts.reduce((a, b) => a + b, 0) / techCounts.length;
  const techMedian = techCounts[Math.floor(techCounts.length / 2)];

  // Resentment stats
  const resentmentMean = resentments.reduce((a, b) => a + b, 0) / resentments.length;
  const resentmentMedian = resentments[Math.floor(resentments.length / 2)];

  return {
    outcomeDistribution,
    mortalityStats: {
      mean: mortalityMean,
      median: mortalityMedian,
      min: mortalities[0],
      max: mortalities[mortalities.length - 1],
      q1: mortalities[q1Index],
      q3: mortalities[q3Index],
    },
    techStats: {
      mean: techMean,
      median: techMedian,
      min: techCounts[0],
      max: techCounts[techCounts.length - 1],
    },
    resentmentStats: {
      mean: resentmentMean,
      median: resentmentMedian,
      min: resentments[0],
      max: resentments[resentments.length - 1],
    },
  };
}

function compareOutcomes(runs: RunData[]): string {
  const utopiaRuns = runs.filter(r => r.finalOutcome === 'UTOPIA');
  const dystopiaRuns = runs.filter(r => r.finalOutcome !== 'UTOPIA');

  if (utopiaRuns.length === 0) {
    return 'No utopia runs found for comparison.';
  }

  const utopiaAvg = {
    mortality: utopiaRuns.reduce((a, r) => a + r.mortality, 0) / utopiaRuns.length,
    tech: utopiaRuns.reduce((a, r) => a + r.techUnlocked, 0) / utopiaRuns.length,
    resentment: utopiaRuns.reduce((a, r) => a + r.resentmentLevel, 0) / utopiaRuns.length,
  };

  const dystopiaAvg = {
    mortality: dystopiaRuns.reduce((a, r) => a + r.mortality, 0) / dystopiaRuns.length,
    tech: dystopiaRuns.reduce((a, r) => a + r.techUnlocked, 0) / dystopiaRuns.length,
    resentment: dystopiaRuns.reduce((a, r) => a + r.resentmentLevel, 0) / dystopiaRuns.length,
  };

  const diff = {
    mortality: utopiaAvg.mortality - dystopiaAvg.mortality,
    tech: utopiaAvg.tech - dystopiaAvg.tech,
    resentment: utopiaAvg.resentment - dystopiaAvg.resentment,
  };

  return `
Utopia Runs (${utopiaRuns.length}):
  Mortality: ${utopiaAvg.mortality.toFixed(1)}%
  Tech Unlocked: ${utopiaAvg.tech.toFixed(1)}
  Resentment: ${utopiaAvg.resentment.toFixed(3)}

Dystopia Runs (${dystopiaRuns.length}):
  Mortality: ${dystopiaAvg.mortality.toFixed(1)}%
  Tech Unlocked: ${dystopiaAvg.tech.toFixed(1)}
  Resentment: ${dystopiaAvg.resentment.toFixed(3)}

Differences (Utopia - Dystopia):
  Mortality: ${diff.mortality.toFixed(1)}pp
  Tech Unlocked: ${diff.tech > 0 ? '+' : ''}${diff.tech.toFixed(1)}
  Resentment: ${diff.resentment > 0 ? '+' : ''}${diff.resentment.toFixed(3)}

Key Insight: ${
    Math.abs(diff.tech) > 50
      ? 'Technology deployment is the primary differentiator.'
      : Math.abs(diff.resentment) > 0.3
      ? 'Resentment management is the primary differentiator.'
      : 'Multiple factors contribute equally.'
  }
`;
}

function crossTabulate(runs: RunData[]): string {
  const scenarioOutcomes: Record<string, Record<string, number>> = {};

  for (const run of runs) {
    if (!scenarioOutcomes[run.scenario]) {
      scenarioOutcomes[run.scenario] = {};
    }
    const outcome = run.finalOutcome;
    scenarioOutcomes[run.scenario][outcome] = (scenarioOutcomes[run.scenario][outcome] || 0) + 1;
  }

  let table = '\nScenario Sensitivity Analysis:\n\n';
  table += 'Scenario'.padEnd(20) + ' | ';
  const outcomes = Array.from(new Set(runs.map(r => r.finalOutcome))).sort();
  for (const outcome of outcomes) {
    table += outcome.padEnd(15) + ' | ';
  }
  table += 'Total\n';
  table += '-'.repeat(20 + outcomes.length * 17 + 10) + '\n';

  for (const [scenario, outcomeMap] of Object.entries(scenarioOutcomes)) {
    table += scenario.padEnd(20) + ' | ';
    let total = 0;
    for (const outcome of outcomes) {
      const count = outcomeMap[outcome] || 0;
      total += count;
      table += String(count).padEnd(15) + ' | ';
    }
    table += String(total).padEnd(5) + '\n';
  }

  return table;
}

function generateReport(stats: OutcomeStats, comparison: string, scenarioTable: string): string {
  return `# Monte Carlo Outcome Distribution Analysis

**Date:** ${new Date().toISOString().split('T')[0]}
**Analyst:** Autonomous Worker (Script)

---

## Executive Summary

**Key Findings:**
- ${Object.keys(stats.outcomeDistribution).length} unique outcomes observed
- Mortality range: ${stats.mortalityStats.min.toFixed(1)}% - ${stats.mortalityStats.max.toFixed(1)}%
- Technology deployment: ${stats.techStats.min} - ${stats.techStats.max} techs unlocked
- Resentment range: ${stats.resentmentStats.min.toFixed(3)} - ${stats.resentmentStats.max.toFixed(3)}

---

## Outcome Distribution

${Object.entries(stats.outcomeDistribution)
  .sort((a, b) => b[1] - a[1])
  .map(([outcome, count]) => `- **${outcome}**: ${count}`)
  .join('\n')}

---

## Mortality Statistics

- **Mean:** ${stats.mortalityStats.mean.toFixed(1)}%
- **Median:** ${stats.mortalityStats.median.toFixed(1)}%
- **Range:** ${stats.mortalityStats.min.toFixed(1)}% - ${stats.mortalityStats.max.toFixed(1)}%
- **Q1/Q3:** ${stats.mortalityStats.q1.toFixed(1)}% / ${stats.mortalityStats.q3.toFixed(1)}%

---

## Technology Deployment

- **Mean:** ${stats.techStats.mean.toFixed(1)} techs
- **Median:** ${stats.techStats.median.toFixed(1)} techs
- **Range:** ${stats.techStats.min} - ${stats.techStats.max} techs

---

## Resentment Dynamics

- **Mean:** ${stats.resentmentStats.mean.toFixed(3)}
- **Median:** ${stats.resentmentStats.median.toFixed(3)}
- **Range:** ${stats.resentmentStats.min.toFixed(3)} - ${stats.resentmentStats.max.toFixed(3)}

---

## Factor Analysis (Utopia vs Dystopia)

${comparison}

---

${scenarioTable}

---

## Recommendations

1. **Technology Deployment Timing:** ${
    stats.techStats.max > stats.techStats.mean * 2
      ? 'Critical differentiator - focus on early/rapid deployment strategies'
      : 'Moderate impact - other factors equally important'
  }

2. **Resentment Management:** ${
    stats.resentmentStats.max > 0.7
      ? 'High resentment observed in worst cases - implement mitigation strategies'
      : 'Resentment well-controlled across runs'
  }

3. **Further Analysis Needed:**
   - N=100 validation for robust statistics
   - Time series divergence point identification
   - Parameter sensitivity testing (tech deployment rate, resentment accumulation)

---

*Generated by analyzeOutcomeDistributions.ts*
`;
}

async function main() {
  const pattern = process.argv[2] || 'run_*_unprecedented_events.json';
  const outputDir = 'monteCarloOutputs';

  console.log(`\n=== Monte Carlo Outcome Distribution Analysis ===\n`);
  console.log(`Pattern: ${pattern}`);
  console.log(`Directory: ${outputDir}\n`);

  // Read all matching files
  const allFiles = fs.readdirSync(outputDir);
  const files = allFiles.filter(f => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(f);
    }
    return f === pattern;
  });

  if (files.length === 0) {
    console.error(`❌ No files found matching pattern: ${pattern}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} Monte Carlo output files\n`);

  // Parse and extract metrics
  const runs: RunData[] = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
      runs.push(extractMetrics(data));
    } catch (error) {
      console.error(`⚠️ Error reading ${file}:`, error);
    }
  }

  if (runs.length === 0) {
    console.error('❌ No valid run data extracted');
    process.exit(1);
  }

  console.log(`Analyzed ${runs.length} runs\n`);

  // Calculate statistics
  const stats = calculateStatistics(runs);

  // Print summary
  console.log('=== Outcome Distribution ===');
  for (const [outcome, count] of Object.entries(stats.outcomeDistribution).sort(
    (a, b) => b[1] - a[1]
  )) {
    const percentage = ((count / runs.length) * 100).toFixed(1);
    console.log(`${outcome.padEnd(25)}: ${count} (${percentage}%)`);
  }

  console.log('\n=== Mortality Statistics ===');
  console.log(`Mean:   ${stats.mortalityStats.mean.toFixed(1)}%`);
  console.log(`Median: ${stats.mortalityStats.median.toFixed(1)}%`);
  console.log(`Range:  ${stats.mortalityStats.min.toFixed(1)}% - ${stats.mortalityStats.max.toFixed(1)}%`);
  console.log(`Q1/Q3:  ${stats.mortalityStats.q1.toFixed(1)}% / ${stats.mortalityStats.q3.toFixed(1)}%`);

  console.log('\n=== Technology Deployment ===');
  console.log(`Mean:   ${stats.techStats.mean.toFixed(1)} techs`);
  console.log(`Median: ${stats.techStats.median.toFixed(1)} techs`);
  console.log(`Range:  ${stats.techStats.min} - ${stats.techStats.max} techs`);

  console.log('\n=== Factor Analysis ===');
  const comparison = compareOutcomes(runs);
  console.log(comparison);

  console.log('=== Scenario Sensitivity ===');
  const scenarioTable = crossTabulate(runs);
  console.log(scenarioTable);

  // Generate report
  const report = generateReport(stats, comparison, scenarioTable);
  const reportPath = `reviews/monte_carlo_outcome_analysis_${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(reportPath, report);

  console.log(`\n✅ Report saved to: ${reportPath}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
