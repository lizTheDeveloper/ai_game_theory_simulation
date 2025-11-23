/**
 * Phase 4: Data Aggregation System
 *
 * Parses Phase 2/3 Monte Carlo logs and extracts structured data for analysis.
 *
 * Usage:
 *   npx tsx scripts/aggregateScenarioResults.ts [log-file]
 *
 * Output:
 *   - JSON: /logs/aggregated_results_YYYYMMDD.json
 *   - CSV: /logs/aggregated_results_YYYYMMDD.csv
 */

import * as fs from 'fs';
import * as path from 'path';

interface RunResult {
  scenarioName: string;
  seed: number;
  outcome: string;
  monthsSimulated: number;

  // Spiral activation
  spiralsActivated: string[];
  abundanceActivated: boolean;
  cognitiveActivated: boolean;
  democraticActivated: boolean;
  scientificActivated: boolean;
  meaningActivated: boolean;
  ecologicalActivated: boolean;
  cascadeTriggered: boolean;

  // Spiral timing (null if never activated)
  abundanceMonth: number | null;
  cognitiveMonth: number | null;
  democraticMonth: number | null;
  scientificMonth: number | null;
  meaningMonth: number | null;
  ecologicalMonth: number | null;

  // Final metrics
  qol: number;
  gini: number;
  temp: number;
  governanceQuality: number;
  researchSpending: number;
  climateStability: number;
  population?: number; // May not be in all logs
}

interface ScenarioSummary {
  scenarioName: string;
  description: string;
  nRuns: number;

  // Spiral activation rates (%)
  abundanceRate: number;
  cognitiveRate: number;
  democraticRate: number;
  scientificRate: number;
  meaningRate: number;
  ecologicalRate: number;
  cascadeRate: number;

  // Spiral timing (average when activated)
  abundanceAvgMonth: number | null;
  cognitiveAvgMonth: number | null;
  democraticAvgMonth: number | null;
  scientificAvgMonth: number | null;
  meaningAvgMonth: number | null;
  ecologicalAvgMonth: number | null;

  // Outcome distribution
  outcomes: Record<string, number>;

  // Averages
  avgSpirals: number;
  avgQoL: number;
  avgGini: number;
  avgTemp: number;
  avgGovernance: number;
  avgResearch: number;
  avgClimate: number;

  // Variance (for CV calculation)
  stdDevQoL: number;
  stdDevGini: number;

  // All individual runs
  runs: RunResult[];
}

/**
 * Parse Phase 2 log file and extract run results
 */
function parseLogFile(logPath: string): Map<string, RunResult[]> {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const resultsByScenario = new Map<string, RunResult[]>();

  let currentScenario: string | null = null;
  let currentSeed: number | null = null;
  let collectingData = false;

  // Temporary storage for current run
  let spiralActivationRates: Record<string, number> = {};
  let spiralActivationTimings: Record<string, string> = {};
  let metrics: Partial<RunResult> = {};
  let outcome: string = 'ONGOING';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect scenario start
    const scenarioMatch = line.match(/📌 (.+)/);
    if (scenarioMatch) {
      currentScenario = scenarioMatch[1].trim();
      collectingData = true;
      continue;
    }

    // Detect seed (from earlier in log)
    const seedMatch = line.match(/🎲 Run seed (\d+)/);
    if (seedMatch) {
      currentSeed = parseInt(seedMatch[1], 10);
      continue;
    }

    // Extract outcome from "Outcome: X" lines
    const outcomeMatch = line.match(/Outcome: ([A-Z_]+)/);
    if (outcomeMatch) {
      outcome = outcomeMatch[1];
      continue;
    }

    // Extract spiral activation rates
    const spiralRateMatch = line.match(/(Abundance|Cognitive|Democratic|Scientific|Meaning|Ecological):\s+(\d+)% \(avg timing: (.+?) mo\)/);
    if (spiralRateMatch) {
      const spiralName = spiralRateMatch[1].toLowerCase();
      spiralActivationRates[spiralName] = parseInt(spiralRateMatch[2], 10);
      spiralActivationTimings[spiralName] = spiralRateMatch[3];
      continue;
    }

    // Extract metrics
    const qolMatch = line.match(/QoL:\s+([\d.]+)%/);
    if (qolMatch) {
      metrics.qol = parseFloat(qolMatch[1]) / 100;
      continue;
    }

    const giniMatch = line.match(/Gini:\s+([\d.]+)/);
    if (giniMatch) {
      metrics.gini = parseFloat(giniMatch[1]);
      continue;
    }

    const tempMatch = line.match(/Temp:\s+([\d.]+)°C/);
    if (tempMatch) {
      metrics.temp = parseFloat(tempMatch[1]);
      continue;
    }

    const govMatch = line.match(/Governance quality:\s+([\d.]+)%/);
    if (govMatch) {
      metrics.governanceQuality = parseFloat(govMatch[1]) / 100;
      continue;
    }

    const researchMatch = line.match(/Research spending:\s+\$([\d.]+)B/);
    if (researchMatch) {
      metrics.researchSpending = parseFloat(researchMatch[1]) * 1e9;
      continue;
    }

    const climateMatch = line.match(/Climate stability:\s+([\d.]+)%/);
    if (climateMatch) {
      metrics.climateStability = parseFloat(climateMatch[1]) / 100;
      continue;
    }

    // End of scenario section
    if (line.includes('────────────────────────────────────────────────────────────────────────────────') && collectingData) {
      collectingData = false;
    }
  }

  // Note: This parser is simplified. The actual Phase 2 logs have summary data per scenario,
  // not per-run data. We'll need to run the aggregation on the raw run outputs or
  // modify runPhase2Scenarios.ts to output JSON.

  console.log('⚠️  Log parser detected summary-level data only.');
  console.log('⚠️  For full per-run analysis, need JSON output from runPhase2Scenarios.ts');

  return resultsByScenario;
}

/**
 * Calculate scenario summary statistics
 */
function calculateSummary(runs: RunResult[]): Omit<ScenarioSummary, 'runs'> {
  const n = runs.length;

  // Spiral activation rates
  const spiralActivationCounts = {
    abundance: runs.filter(r => r.abundanceActivated).length,
    cognitive: runs.filter(r => r.cognitiveActivated).length,
    democratic: runs.filter(r => r.democraticActivated).length,
    scientific: runs.filter(r => r.scientificActivated).length,
    meaning: runs.filter(r => r.meaningActivated).length,
    ecological: runs.filter(r => r.ecologicalActivated).length,
    cascade: runs.filter(r => r.cascadeTriggered).length,
  };

  // Spiral timing averages (only for activated runs)
  const spiralTimings = {
    abundance: runs.filter(r => r.abundanceMonth !== null).map(r => r.abundanceMonth!),
    cognitive: runs.filter(r => r.cognitiveMonth !== null).map(r => r.cognitiveMonth!),
    democratic: runs.filter(r => r.democraticMonth !== null).map(r => r.democraticMonth!),
    scientific: runs.filter(r => r.scientificMonth !== null).map(r => r.scientificMonth!),
    meaning: runs.filter(r => r.meaningMonth !== null).map(r => r.meaningMonth!),
    ecological: runs.filter(r => r.ecologicalMonth !== null).map(r => r.ecologicalMonth!),
  };

  const avgTiming = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  for (const run of runs) {
    outcomes[run.outcome] = (outcomes[run.outcome] || 0) + 1;
  }

  // Averages
  const avgSpirals = runs.reduce((sum, r) => sum + r.spiralsActivated.length, 0) / n;
  const avgQoL = runs.reduce((sum, r) => sum + r.qol, 0) / n;
  const avgGini = runs.reduce((sum, r) => sum + r.gini, 0) / n;
  const avgTemp = runs.reduce((sum, r) => sum + r.temp, 0) / n;
  const avgGovernance = runs.reduce((sum, r) => sum + r.governanceQuality, 0) / n;
  const avgResearch = runs.reduce((sum, r) => sum + r.researchSpending, 0) / n;
  const avgClimate = runs.reduce((sum, r) => sum + r.climateStability, 0) / n;

  // Standard deviations
  const stdDevQoL = Math.sqrt(runs.reduce((sum, r) => sum + Math.pow(r.qol - avgQoL, 2), 0) / n);
  const stdDevGini = Math.sqrt(runs.reduce((sum, r) => sum + Math.pow(r.gini - avgGini, 2), 0) / n);

  return {
    scenarioName: runs[0]?.scenarioName || 'Unknown',
    description: '', // Will need to be filled from scenario definitions
    nRuns: n,

    abundanceRate: spiralActivationCounts.abundance / n,
    cognitiveRate: spiralActivationCounts.cognitive / n,
    democraticRate: spiralActivationCounts.democratic / n,
    scientificRate: spiralActivationCounts.scientific / n,
    meaningRate: spiralActivationCounts.meaning / n,
    ecologicalRate: spiralActivationCounts.ecological / n,
    cascadeRate: spiralActivationCounts.cascade / n,

    abundanceAvgMonth: avgTiming(spiralTimings.abundance),
    cognitiveAvgMonth: avgTiming(spiralTimings.cognitive),
    democraticAvgMonth: avgTiming(spiralTimings.democratic),
    scientificAvgMonth: avgTiming(spiralTimings.scientific),
    meaningAvgMonth: avgTiming(spiralTimings.meaning),
    ecologicalAvgMonth: avgTiming(spiralTimings.ecological),

    outcomes,

    avgSpirals,
    avgQoL,
    avgGini,
    avgTemp,
    avgGovernance,
    avgResearch,
    avgClimate,

    stdDevQoL,
    stdDevGini,
  };
}

/**
 * Export to CSV
 */
function exportToCSV(summaries: ScenarioSummary[], outputPath: string): void {
  const headers = [
    'Scenario',
    'N',
    'Abundance%',
    'Cognitive%',
    'Democratic%',
    'Scientific%',
    'Meaning%',
    'Ecological%',
    'Cascade%',
    'AvgSpirals',
    'AvgQoL',
    'AvgGini',
    'AvgTemp',
    'AvgGov',
    'AvgResearch',
    'AvgClimate',
    'StdDevQoL',
    'StdDevGini',
  ];

  const rows = summaries.map(s => [
    s.scenarioName,
    s.nRuns,
    (s.abundanceRate * 100).toFixed(0),
    (s.cognitiveRate * 100).toFixed(0),
    (s.democraticRate * 100).toFixed(0),
    (s.scientificRate * 100).toFixed(0),
    (s.meaningRate * 100).toFixed(0),
    (s.ecologicalRate * 100).toFixed(0),
    (s.cascadeRate * 100).toFixed(0),
    s.avgSpirals.toFixed(2),
    s.avgQoL.toFixed(3),
    s.avgGini.toFixed(3),
    s.avgTemp.toFixed(2),
    s.avgGovernance.toFixed(3),
    (s.avgResearch / 1e9).toFixed(1),
    s.avgClimate.toFixed(3),
    s.stdDevQoL.toFixed(4),
    s.stdDevGini.toFixed(4),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  fs.writeFileSync(outputPath, csv);

  console.log(`✅ Exported CSV: ${outputPath}`);
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/aggregateScenarioResults.ts <log-file>');
  console.error('\nNote: Current Phase 2 logs have summary data only.');
  console.error('To enable full per-run extraction, modify runPhase2Scenarios.ts to output JSON.');
  process.exit(1);
}

console.log('🔬 Aggregating scenario results...');
console.log(`   Log file: ${logFile}`);

const results = parseLogFile(logFile);

console.log(`\n📊 Found ${results.size} scenarios`);

console.log('\n⚠️  Current limitation: Phase 2 logs contain summary statistics, not per-run data.');
console.log('⚠️  For full analysis, need to modify runPhase2Scenarios.ts to export JSON.');
console.log('\n💡 Recommended approach:');
console.log('   1. Add JSON export to runPhase2Scenarios.ts');
console.log('   2. Re-run Phase 2 scenarios with JSON output');
console.log('   3. Run this aggregation script on JSON files');
