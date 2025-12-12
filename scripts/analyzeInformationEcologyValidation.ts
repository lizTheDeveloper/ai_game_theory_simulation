#!/usr/bin/env tsx
/**
 * Information Ecology Monte Carlo Validation Analysis
 *
 * Extracts and analyzes Information Ecology metrics from Monte Carlo runs:
 * 1. Determinism: CV < 0.01% for same-seed runs
 * 2. Distribution: Outcome patterns across different seeds
 * 3. Gap analysis: Coordination effectiveness reduction
 *
 * Usage:
 *   npx tsx scripts/analyzeInformationEcologyValidation.ts <log1> <log2> [<log3> ...]
 */

import * as fs from 'fs';
import * as path from 'path';

interface RunMetrics {
  seed: number;
  outcome: string;
  coordinationCapacity: number;
  misinformationPrevalence: number;
  institutionalTrustIndex: number;
  epistemicHealth: number;
  polarization: number;
  socialTrust: number;
  sharedReality: number;
  misinformationLoad: number;
  population: number;
}

interface ValidationResults {
  determinismCV: {
    coordinationCapacity: number;
    misinformationPrevalence: number;
    institutionalTrustIndex: number;
    epistemicHealth: number;
  };
  outcomeDistribution: Record<string, number>;
  averageMetrics: {
    coordinationCapacity: number;
    epistemicHealth: number;
    polarization: number;
  };
  runs: RunMetrics[];
}

/**
 * Extract run metrics from a Monte Carlo log file
 */
function extractMetricsFromLog(logPath: string): RunMetrics[] {
  const content = fs.readFileSync(logPath, 'utf-8');
  const runs: RunMetrics[] = [];

  // Extract seed range
  const seedMatch = content.match(/Seed Range: (\d+) - (\d+)/);
  if (!seedMatch) {
    console.error(`❌ Could not find seed range in ${logPath}`);
    return runs;
  }
  const seedStart = parseInt(seedMatch[1], 10);

  // Parse individual run results
  // Look for patterns like "Run 1/10 completed" and extract metrics
  const runPattern = /Run (\d+)\/\d+ completed/g;
  let match;
  let runIndex = 0;

  while ((match = runPattern.exec(content)) !== null) {
    const seed = seedStart + runIndex;

    // Extract metrics for this run (search forward from match position)
    const searchStart = match.index;
    const searchEnd = Math.min(searchStart + 10000, content.length);
    const runSection = content.slice(searchStart, searchEnd);

    // Try to extract final state metrics
    // This is a placeholder - actual extraction depends on log format
    const metrics: RunMetrics = {
      seed,
      outcome: extractOutcome(runSection),
      coordinationCapacity: extractMetric(runSection, 'Coordination Capacity'),
      misinformationPrevalence: extractMetric(runSection, 'Misinformation'),
      institutionalTrustIndex: extractMetric(runSection, 'Trust'),
      epistemicHealth: extractMetric(runSection, 'Epistemic Health'),
      polarization: extractMetric(runSection, 'Polarization'),
      socialTrust: extractMetric(runSection, 'Social Trust'),
      sharedReality: extractMetric(runSection, 'Shared Reality'),
      misinformationLoad: extractMetric(runSection, 'Misinformation Load'),
      population: extractMetric(runSection, 'Population'),
    };

    runs.push(metrics);
    runIndex++;
  }

  // If run-by-run extraction failed, try summary extraction
  if (runs.length === 0) {
    console.warn(`⚠️  Run-by-run extraction failed for ${logPath}, trying summary...`);
    return extractFromSummary(content, seedStart);
  }

  return runs;
}

/**
 * Extract outcome classification from run section
 */
function extractOutcome(section: string): string {
  // Look for outcome patterns like "🌟 UTOPIA" or "☠️ EXTINCTION"
  const patterns = [
    { regex: /🌟.*UTOPIA/i, label: 'UTOPIA' },
    { regex: /⚡.*SINGULARITY/i, label: 'SINGULARITY' },
    { regex: /🤖.*TRANSITION/i, label: 'TRANSITION' },
    { regex: /⚖️.*MANAGED/i, label: 'MANAGED' },
    { regex: /⏳.*STALEMATE/i, label: 'STALEMATE' },
    { regex: /🌪️.*DYSTOPIA/i, label: 'DYSTOPIA' },
    { regex: /☠️.*EXTINCTION/i, label: 'EXTINCTION' },
  ];

  for (const { regex, label } of patterns) {
    if (regex.test(section)) {
      return label;
    }
  }

  return 'UNKNOWN';
}

/**
 * Extract numeric metric from section
 */
function extractMetric(section: string, metricName: string): number {
  // Try various formats
  const patterns = [
    new RegExp(`${metricName}\\s*[:=]?\\s*([\\d.]+)`, 'i'),
    new RegExp(`${metricName.replace(/\s+/g, '')}\\s*[:=]?\\s*([\\d.]+)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = section.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  return NaN;
}

/**
 * Extract metrics from summary section
 */
function extractFromSummary(content: string, seedStart: number): RunMetrics[] {
  // This is a fallback - extract from final summary statistics
  // Look for outcome distribution and average metrics

  const runs: RunMetrics[] = [];

  // Try to extract number of runs
  const runsMatch = content.match(/Runs: (\d+)/);
  if (!runsMatch) return runs;

  const numRuns = parseInt(runsMatch[1], 10);

  // Extract outcome distribution
  const outcomePattern = /(UTOPIA|SINGULARITY|TRANSITION|MANAGED|STALEMATE|DYSTOPIA|EXTINCTION): (\d+) runs/gi;
  const outcomes: Record<string, number> = {};
  let match;

  while ((match = outcomePattern.exec(content)) !== null) {
    outcomes[match[1].toUpperCase()] = parseInt(match[2], 10);
  }

  // Create synthetic runs based on distribution
  let runIndex = 0;
  for (const [outcome, count] of Object.entries(outcomes)) {
    for (let i = 0; i < count; i++) {
      runs.push({
        seed: seedStart + runIndex,
        outcome,
        coordinationCapacity: NaN, // Not available in summary
        misinformationPrevalence: NaN,
        institutionalTrustIndex: NaN,
        epistemicHealth: NaN,
        polarization: NaN,
        socialTrust: NaN,
        sharedReality: NaN,
        misinformationLoad: NaN,
        population: NaN,
      });
      runIndex++;
    }
  }

  return runs;
}

/**
 * Calculate coefficient of variation (CV)
 */
function calculateCV(values: number[]): number {
  const validValues = values.filter(v => !isNaN(v) && isFinite(v));
  if (validValues.length < 2) return NaN;

  const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  if (mean === 0) return NaN;

  const variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validValues.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / mean) * 100; // As percentage
}

/**
 * Main analysis
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`
Usage: npx tsx scripts/analyzeInformationEcologyValidation.ts <log1> <log2> [<log3> ...]

For determinism test: Provide 2+ logs with same seed range
For distribution test: Provide logs with different seed ranges
    `);
    process.exit(1);
  }

  console.log(`📊 INFORMATION ECOLOGY VALIDATION ANALYSIS\n`);
  console.log(`Analyzing ${args.length} log files...\n`);

  // Extract metrics from all logs
  const allRuns: RunMetrics[][] = [];

  for (const logPath of args) {
    if (!fs.existsSync(logPath)) {
      console.error(`❌ File not found: ${logPath}`);
      continue;
    }

    console.log(`  Extracting: ${path.basename(logPath)}`);
    const runs = extractMetricsFromLog(logPath);
    console.log(`    Found ${runs.length} runs\n`);
    allRuns.push(runs);
  }

  if (allRuns.length < 2) {
    console.error(`❌ Need at least 2 valid log files`);
    process.exit(1);
  }

  // Check if same seeds (determinism test) or different seeds (distribution test)
  const firstSeeds = allRuns[0].map(r => r.seed).sort((a, b) => a - b);
  const isDeterminismTest = allRuns.every(runs => {
    const seeds = runs.map(r => r.seed).sort((a, b) => a - b);
    return JSON.stringify(seeds) === JSON.stringify(firstSeeds);
  });

  console.log(`\n${'='.repeat(80)}\n`);

  if (isDeterminismTest) {
    console.log(`DETERMINISM TEST (Same seeds across runs)\n`);
    analyzeDeterminism(allRuns);
  } else {
    console.log(`DISTRIBUTION TEST (Different seeds)\n`);
    analyzeDistribution(allRuns);
  }
}

/**
 * Analyze determinism (CV for same-seed runs)
 */
function analyzeDeterminism(allRuns: RunMetrics[][]) {
  const numRuns = allRuns[0].length;
  const numRepeats = allRuns.length;

  console.log(`  Runs per log: ${numRuns}`);
  console.log(`  Repetitions: ${numRepeats}`);
  console.log(`  Expected CV: < 0.01% (deterministic)\n`);

  // For each seed, collect values across repeats
  for (let i = 0; i < numRuns; i++) {
    const seed = allRuns[0][i].seed;

    const coordinationValues = allRuns.map(runs => runs[i].coordinationCapacity);
    const epistemicHealthValues = allRuns.map(runs => runs[i].epistemicHealth);
    const polarizationValues = allRuns.map(runs => runs[i].polarization);
    const outcomeValues = allRuns.map(runs => runs[i].outcome);

    const coordinationCV = calculateCV(coordinationValues);
    const epistemicHealthCV = calculateCV(epistemicHealthValues);
    const polarizationCV = calculateCV(polarizationValues);
    const outcomesIdentical = new Set(outcomeValues).size === 1;

    console.log(`  Seed ${seed}:`);

    if (isNaN(coordinationCV)) {
      console.log(`    ⚠️  Coordination Capacity: No data available`);
    } else {
      const status = coordinationCV < 0.01 ? '✅' : coordinationCV < 0.1 ? '⚠️ ' : '❌';
      console.log(`    ${status} Coordination Capacity CV: ${coordinationCV.toFixed(4)}%`);
    }

    if (isNaN(epistemicHealthCV)) {
      console.log(`    ⚠️  Epistemic Health: No data available`);
    } else {
      const status = epistemicHealthCV < 0.01 ? '✅' : epistemicHealthCV < 0.1 ? '⚠️ ' : '❌';
      console.log(`    ${status} Epistemic Health CV: ${epistemicHealthCV.toFixed(4)}%`);
    }

    if (isNaN(polarizationCV)) {
      console.log(`    ⚠️  Polarization: No data available`);
    } else {
      const status = polarizationCV < 0.01 ? '✅' : polarizationCV < 0.1 ? '⚠️ ' : '❌';
      console.log(`    ${status} Polarization CV: ${polarizationCV.toFixed(4)}%`);
    }

    const outcomeStatus = outcomesIdentical ? '✅' : '❌';
    console.log(`    ${outcomeStatus} Outcomes identical: ${outcomesIdentical} (${outcomeValues.join(', ')})\n`);
  }

  // Overall determinism verdict
  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`DETERMINISM VERDICT:\n`);

  // Calculate aggregate CV across all runs
  const allCoordination = allRuns.flatMap((runs, repeatIdx) =>
    runs.map((run, runIdx) => ({ seed: run.seed, value: run.coordinationCapacity, repeatIdx }))
  );

  const seedGroups = new Map<number, number[]>();
  for (const { seed, value } of allCoordination) {
    if (!seedGroups.has(seed)) seedGroups.set(seed, []);
    seedGroups.get(seed)!.push(value);
  }

  const cvs = Array.from(seedGroups.values()).map(calculateCV).filter(cv => !isNaN(cv));
  const avgCV = cvs.length > 0 ? cvs.reduce((sum, cv) => sum + cv, 0) / cvs.length : NaN;

  if (isNaN(avgCV)) {
    console.log(`  ⚠️  INCOMPLETE DATA - Cannot calculate aggregate CV`);
    console.log(`  Run-by-run metric extraction may have failed.`);
    console.log(`  Check log format and extraction patterns.`);
  } else if (avgCV < 0.01) {
    console.log(`  ✅ PASS - Average CV: ${avgCV.toFixed(4)}% < 0.01%`);
    console.log(`  Simulation is deterministic.`);
  } else if (avgCV < 0.1) {
    console.log(`  ⚠️  CONDITIONAL PASS - Average CV: ${avgCV.toFixed(4)}%`);
    console.log(`  Nearly deterministic, but exceeds strict threshold.`);
  } else {
    console.log(`  ❌ FAIL - Average CV: ${avgCV.toFixed(4)}% > 0.1%`);
    console.log(`  Non-deterministic behavior detected.`);
    console.log(`  Investigate RNG usage, Object.entries() ordering, async operations.`);
  }
}

/**
 * Analyze outcome distribution
 */
function analyzeDistribution(allRuns: RunMetrics[][]) {
  const allRunsFlat = allRuns.flat();
  const totalRuns = allRunsFlat.length;

  console.log(`  Total runs: ${totalRuns}\n`);

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  for (const run of allRunsFlat) {
    outcomes[run.outcome] = (outcomes[run.outcome] || 0) + 1;
  }

  console.log(`OUTCOME DISTRIBUTION:\n`);
  const sortedOutcomes = Object.entries(outcomes).sort((a, b) => b[1] - a[1]);
  for (const [outcome, count] of sortedOutcomes) {
    const pct = (count / totalRuns * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / totalRuns * 40));
    console.log(`  ${outcome.padEnd(12)}: ${count.toString().padStart(3)} runs (${pct.padStart(5)}%) ${bar}`);
  }

  // Average metrics
  const validCoordination = allRunsFlat.filter(r => !isNaN(r.coordinationCapacity));
  const validEpistemic = allRunsFlat.filter(r => !isNaN(r.epistemicHealth));
  const validPolarization = allRunsFlat.filter(r => !isNaN(r.polarization));

  if (validCoordination.length > 0) {
    const avgCoordination = validCoordination.reduce((sum, r) => sum + r.coordinationCapacity, 0) / validCoordination.length;
    const minCoordination = Math.min(...validCoordination.map(r => r.coordinationCapacity));
    const maxCoordination = Math.max(...validCoordination.map(r => r.coordinationCapacity));

    console.log(`\nCOORDINATION CAPACITY:\n`);
    console.log(`  Average: ${avgCoordination.toFixed(3)}`);
    console.log(`  Range: [${minCoordination.toFixed(3)}, ${maxCoordination.toFixed(3)}]`);
  }

  if (validEpistemic.length > 0) {
    const avgEpistemic = validEpistemic.reduce((sum, r) => sum + r.epistemicHealth, 0) / validEpistemic.length;
    const minEpistemic = Math.min(...validEpistemic.map(r => r.epistemicHealth));
    const maxEpistemic = Math.max(...validEpistemic.map(r => r.epistemicHealth));

    console.log(`\nEPISTEMIC HEALTH:\n`);
    console.log(`  Average: ${avgEpistemic.toFixed(3)}`);
    console.log(`  Range: [${minEpistemic.toFixed(3)}, ${maxEpistemic.toFixed(3)}]`);
  }

  if (validPolarization.length > 0) {
    const avgPolarization = validPolarization.reduce((sum, r) => sum + r.polarization, 0) / validPolarization.length;
    const minPolarization = Math.min(...validPolarization.map(r => r.polarization));
    const maxPolarization = Math.max(...validPolarization.map(r => r.polarization));

    console.log(`\nPOLARIZATION:\n`);
    console.log(`  Average: ${avgPolarization.toFixed(3)}`);
    console.log(`  Range: [${minPolarization.toFixed(3)}, ${maxPolarization.toFixed(3)}]`);
  }
}

main();
