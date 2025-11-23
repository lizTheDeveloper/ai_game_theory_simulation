/**
 * Phase 4: Outcome Distribution Analyzer
 *
 * Compares outcome distributions across scenarios with determinism validation.
 *
 * Usage:
 *   npx tsx scripts/analyzeOutcomes.ts [log-file]
 *
 * Output:
 *   - Statistical summary to console
 *   - CSV to /logs/outcome_analysis_YYYYMMDD.csv
 */

import * as fs from 'fs';
import * as path from 'path';

interface OutcomeData {
  scenarioName: string;
  nRuns: number;

  // Outcome distribution (counts)
  utopiaCount: number;
  flourishingCount: number;
  mixedCount: number;
  stagnationCount: number;
  dystopiaCount: number;
  collapseCount: number;
  extinctionCount: number;
  ongoingCount: number;

  // Metrics
  avgQoL: number;
  avgGini: number;
  avgTemp: number;
  avgGovernance: number;
  avgResearch: number;
  avgClimate: number;

  // Variance (for CV calculation)
  stdDevQoL: number;
  stdDevGini: number;
  stdDevTemp: number;

  // Coefficient of Variation (determinism check)
  cvQoL: number;
  cvGini: number;
  cvTemp: number;
}

/**
 * Parse Phase 2 log for outcome and metric data
 */
function parseLogForOutcomes(logPath: string): OutcomeData[] {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const outcomeDataByScenario: OutcomeData[] = [];

  let currentScenario: string | null = null;
  let outcomes: Record<string, number> = {};
  let metrics: any = {};
  let nRuns = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect scenario name
    const scenarioMatch = line.match(/📌 (.+)/);
    if (scenarioMatch) {
      // Save previous scenario
      if (currentScenario && Object.keys(outcomes).length > 0) {
        outcomeDataByScenario.push(buildOutcomeData(currentScenario, outcomes, metrics, nRuns));
      }

      currentScenario = scenarioMatch[1].trim();
      outcomes = {};
      metrics = {};
      nRuns = 0;
      continue;
    }

    // Extract N from "Spiral Activation Rates (N=10)"
    const nMatch = line.match(/\(N=(\d+)\)/);
    if (nMatch) {
      nRuns = parseInt(nMatch[1], 10);
      continue;
    }

    // Extract averages
    const qolMatch = line.match(/QoL:\s+([\d.]+)%/);
    if (qolMatch) {
      metrics.avgQoL = parseFloat(qolMatch[1]) / 100;
      continue;
    }

    const giniMatch = line.match(/Gini:\s+([\d.]+)/);
    if (giniMatch) {
      metrics.avgGini = parseFloat(giniMatch[1]);
      continue;
    }

    const tempMatch = line.match(/Temp:\s+([\d.]+)°C/);
    if (tempMatch) {
      metrics.avgTemp = parseFloat(tempMatch[1]);
      continue;
    }

    const govMatch = line.match(/Governance quality:\s+([\d.]+)%/);
    if (govMatch) {
      metrics.avgGovernance = parseFloat(govMatch[1]) / 100;
      continue;
    }

    const researchMatch = line.match(/Research spending:\s+\$([\d.]+)B/);
    if (researchMatch) {
      metrics.avgResearch = parseFloat(researchMatch[1]) * 1e9;
      continue;
    }

    const climateMatch = line.match(/Climate stability:\s+([\d.]+)%/);
    if (climateMatch) {
      metrics.avgClimate = parseFloat(climateMatch[1]) / 100;
      continue;
    }

    // Extract outcome distribution (format: "OUTCOME: X/Y (Z%)")
    const outcomeMatch = line.match(/^\s+([A-Z_]+): (\d+)\/(\d+)/);
    if (outcomeMatch) {
      const outcomeName = outcomeMatch[1];
      const count = parseInt(outcomeMatch[2], 10);
      outcomes[outcomeName] = count;
      continue;
    }
  }

  // Save last scenario
  if (currentScenario && Object.keys(outcomes).length > 0) {
    outcomeDataByScenario.push(buildOutcomeData(currentScenario, outcomes, metrics, nRuns));
  }

  return outcomeDataByScenario;
}

/**
 * Build OutcomeData from parsed values
 */
function buildOutcomeData(
  scenarioName: string,
  outcomes: Record<string, number>,
  metrics: any,
  nRuns: number
): OutcomeData {
  // Note: We don't have per-run variance in summary logs
  // These would need to be calculated from full per-run data
  // For now, we'll compute placeholders
  const stdDevQoL = 0; // TODO: Needs per-run data
  const stdDevGini = 0;
  const stdDevTemp = 0;

  return {
    scenarioName,
    nRuns,

    utopiaCount: outcomes['UTOPIA'] || 0,
    flourishingCount: outcomes['FLOURISHING'] || 0,
    mixedCount: outcomes['MIXED'] || 0,
    stagnationCount: outcomes['STAGNATION'] || 0,
    dystopiaCount: outcomes['DYSTOPIA'] || 0,
    collapseCount: outcomes['COLLAPSE'] || 0,
    extinctionCount: outcomes['EXTINCTION'] || 0,
    ongoingCount: outcomes['ONGOING'] || 0,

    avgQoL: metrics.avgQoL || 0,
    avgGini: metrics.avgGini || 0,
    avgTemp: metrics.avgTemp || 0,
    avgGovernance: metrics.avgGovernance || 0,
    avgResearch: metrics.avgResearch || 0,
    avgClimate: metrics.avgClimate || 0,

    stdDevQoL,
    stdDevGini,
    stdDevTemp,

    cvQoL: stdDevQoL > 0 ? stdDevQoL / metrics.avgQoL : 0,
    cvGini: stdDevGini > 0 ? stdDevGini / metrics.avgGini : 0,
    cvTemp: stdDevTemp > 0 ? stdDevTemp / metrics.avgTemp : 0,
  };
}

/**
 * Generate summary statistics table
 */
function generateSummaryTable(data: OutcomeData[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('## Outcome Distribution by Scenario');
  lines.push('');
  lines.push('| Scenario | N | Utopia% | Flourish% | Mixed% | Stagnate% | Dystopia% | Collapse% | Extinct% | Ongoing% |');
  lines.push('|----------|---|---------|-----------|--------|-----------|-----------|-----------|----------|----------|');

  for (const d of data) {
    const utopiaRate = (d.utopiaCount / d.nRuns) * 100;
    const flourishRate = (d.flourishingCount / d.nRuns) * 100;
    const mixedRate = (d.mixedCount / d.nRuns) * 100;
    const stagnateRate = (d.stagnationCount / d.nRuns) * 100;
    const dystopiaRate = (d.dystopiaCount / d.nRuns) * 100;
    const collapseRate = (d.collapseCount / d.nRuns) * 100;
    const extinctRate = (d.extinctionCount / d.nRuns) * 100;
    const ongoingRate = (d.ongoingCount / d.nRuns) * 100;

    lines.push(
      `| ${d.scenarioName.slice(0, 20).padEnd(20)} | ${d.nRuns} | ` +
      `${utopiaRate.toFixed(0)}% | ${flourishRate.toFixed(0)}% | ${mixedRate.toFixed(0)}% | ` +
      `${stagnateRate.toFixed(0)}% | ${dystopiaRate.toFixed(0)}% | ${collapseRate.toFixed(0)}% | ` +
      `${extinctRate.toFixed(0)}% | ${ongoingRate.toFixed(0)}% |`
    );
  }

  lines.push('');
  lines.push('## Metrics by Scenario');
  lines.push('');
  lines.push('| Scenario | QoL | Gini | Temp | Gov | Research | Climate |');
  lines.push('|----------|-----|------|------|-----|----------|---------|');

  for (const d of data) {
    lines.push(
      `| ${d.scenarioName.slice(0, 20).padEnd(20)} | ` +
      `${(d.avgQoL * 100).toFixed(1)}% | ` +
      `${d.avgGini.toFixed(3)} | ` +
      `${d.avgTemp.toFixed(2)}°C | ` +
      `${(d.avgGovernance * 100).toFixed(1)}% | ` +
      `$${(d.avgResearch / 1e9).toFixed(1)}B | ` +
      `${(d.avgClimate * 100).toFixed(1)}% |`
    );
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Analyze key patterns
 */
function analyzePatterns(data: OutcomeData[]): string[] {
  const insights: string[] = [];

  // Best outcomes
  const utopiaRates = data.map(d => ({
    name: d.scenarioName,
    rate: d.utopiaCount / d.nRuns,
  })).sort((a, b) => b.rate - a.rate);

  insights.push('🏆 Best Utopia Rates:');
  utopiaRates.slice(0, 3).forEach((s, i) => {
    insights.push(`   ${i + 1}. ${s.name}: ${(s.rate * 100).toFixed(0)}%`);
  });

  // Worst outcomes (highest dystopia/collapse/extinction)
  const badOutcomeRates = data.map(d => ({
    name: d.scenarioName,
    rate: (d.dystopiaCount + d.collapseCount + d.extinctionCount) / d.nRuns,
  })).sort((a, b) => b.rate - a.rate);

  if (badOutcomeRates[0].rate > 0) {
    insights.push('\n⚠️  Highest Bad Outcome Rates (Dystopia+Collapse+Extinction):');
    badOutcomeRates.slice(0, 3).forEach((s, i) => {
      insights.push(`   ${i + 1}. ${s.name}: ${(s.rate * 100).toFixed(0)}%`);
    });
  }

  // Best QoL
  const qolRanking = data.map(d => ({
    name: d.scenarioName,
    qol: d.avgQoL,
  })).sort((a, b) => b.qol - a.qol);

  insights.push('\n📊 Highest Quality of Life:');
  qolRanking.slice(0, 3).forEach((s, i) => {
    insights.push(`   ${i + 1}. ${s.name}: ${(s.qol * 100).toFixed(1)}%`);
  });

  // Best equality (lowest Gini)
  const giniRanking = data.map(d => ({
    name: d.scenarioName,
    gini: d.avgGini,
  })).sort((a, b) => a.gini - b.gini);

  insights.push('\n📈 Lowest Inequality (Gini):');
  giniRanking.slice(0, 3).forEach((s, i) => {
    insights.push(`   ${i + 1}. ${s.name}: ${s.gini.toFixed(3)}`);
  });

  // Climate outcomes
  const tempRanking = data.map(d => ({
    name: d.scenarioName,
    temp: d.avgTemp,
  })).sort((a, b) => a.temp - b.temp);

  insights.push('\n🌡️  Lowest Temperature Rise:');
  tempRanking.slice(0, 3).forEach((s, i) => {
    insights.push(`   ${i + 1}. ${s.name}: ${s.temp.toFixed(2)}°C`);
  });

  // Check if any scenarios are ONLY producing ONGOING (no outcomes yet)
  const ongoingOnly = data.filter(d => d.ongoingCount === d.nRuns);
  if (ongoingOnly.length > 0) {
    insights.push('\n⏳ Scenarios with ALL runs ONGOING (no outcome reached):');
    ongoingOnly.forEach(s => {
      insights.push(`   - ${s.name}`);
    });
    insights.push('   ⚠️  May need longer simulation time (>60 months)');
  }

  return insights;
}

/**
 * Generate CSV
 */
function generateCSV(data: OutcomeData[]): string {
  const headers = [
    'Scenario',
    'N',
    'Utopia%',
    'Flourish%',
    'Mixed%',
    'Stagnate%',
    'Dystopia%',
    'Collapse%',
    'Extinct%',
    'Ongoing%',
    'AvgQoL',
    'AvgGini',
    'AvgTemp',
    'AvgGov',
    'AvgResearch',
    'AvgClimate',
  ];

  const rows = data.map(d => [
    d.scenarioName,
    d.nRuns,
    ((d.utopiaCount / d.nRuns) * 100).toFixed(0),
    ((d.flourishingCount / d.nRuns) * 100).toFixed(0),
    ((d.mixedCount / d.nRuns) * 100).toFixed(0),
    ((d.stagnationCount / d.nRuns) * 100).toFixed(0),
    ((d.dystopiaCount / d.nRuns) * 100).toFixed(0),
    ((d.collapseCount / d.nRuns) * 100).toFixed(0),
    ((d.extinctionCount / d.nRuns) * 100).toFixed(0),
    ((d.ongoingCount / d.nRuns) * 100).toFixed(0),
    d.avgQoL.toFixed(3),
    d.avgGini.toFixed(3),
    d.avgTemp.toFixed(2),
    d.avgGovernance.toFixed(3),
    (d.avgResearch / 1e9).toFixed(1),
    d.avgClimate.toFixed(3),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/analyzeOutcomes.ts <log-file>');
  console.error('\nExample:');
  console.error('   npx tsx scripts/analyzeOutcomes.ts logs/phase2_validation_post_fix_20251118_090346.log');
  process.exit(1);
}

if (!fs.existsSync(logFile)) {
  console.error(`❌ File not found: ${logFile}`);
  process.exit(1);
}

console.log('🔬 Analyzing Outcome Distributions...');
console.log(`   Log file: ${logFile}\n`);

const data = parseLogForOutcomes(logFile);

if (data.length === 0) {
  console.error('❌ No outcome data found in log file');
  console.error('   Expected format: Phase 2 scenario analysis logs from runPhase2Scenarios.ts');
  process.exit(1);
}

console.log(`📊 Found ${data.length} scenarios\n`);

// Generate outputs
const summaryTable = generateSummaryTable(data);
console.log(summaryTable);

// Analyze patterns
const insights = analyzePatterns(data);
console.log('## Key Insights\n');
insights.forEach(insight => console.log(insight));

// Save CSV
const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const csvPath = path.join('/home/user/ai_game_theory_simulation/logs', `outcome_analysis_${timestamp}.csv`);
fs.writeFileSync(csvPath, generateCSV(data));

console.log(`\n✅ CSV saved to: ${csvPath}`);

// Determinism warning
console.log('\n⚠️  Note: Per-run variance (CV) calculation requires full per-run data.');
console.log('⚠️  Current logs have summary statistics only.');
console.log('💡 To enable CV analysis, modify runPhase2Scenarios.ts to export JSON per-run data.\n');
