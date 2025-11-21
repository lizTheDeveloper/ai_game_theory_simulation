/**
 * Phase 4: Trade-Off Analysis
 *
 * Identifies trade-offs and correlations between objectives.
 *
 * Usage:
 *   npx tsx scripts/analyzeTradeOffs.ts [log-file]
 *
 * Output:
 *   - Correlation analysis to console
 */

import * as fs from 'fs';

interface ScenarioMetrics {
  scenarioName: string;

  // Core metrics
  qol: number;
  gini: number;
  temp: number;
  governanceQuality: number;
  researchSpending: number;
  climateStability: number;

  // Outcomes
  spiralsActivated: number;
  cascadeRate: number;
}

/**
 * Parse log for metrics
 */
function parseLogForMetrics(logPath: string): ScenarioMetrics[] {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const metrics: ScenarioMetrics[] = [];

  let currentScenario: string | null = null;
  let data: Partial<ScenarioMetrics> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect scenario name
    const scenarioMatch = line.match(/📌 (.+)/);
    if (scenarioMatch) {
      // Save previous
      if (currentScenario && Object.keys(data).length > 0) {
        metrics.push({
          scenarioName: currentScenario,
          qol: data.qol || 0,
          gini: data.gini || 0.4,
          temp: data.temp || 1.5,
          governanceQuality: data.governanceQuality || 0.5,
          researchSpending: data.researchSpending || 0,
          climateStability: data.climateStability || 0.5,
          spiralsActivated: data.spiralsActivated || 0,
          cascadeRate: data.cascadeRate || 0,
        });
      }

      currentScenario = scenarioMatch[1].trim();
      data = {};
      continue;
    }

    // Extract metrics
    const qolMatch = line.match(/QoL:\s+([\d.]+)%/);
    if (qolMatch) data.qol = parseFloat(qolMatch[1]) / 100;

    const giniMatch = line.match(/Gini:\s+([\d.]+)/);
    if (giniMatch) data.gini = parseFloat(giniMatch[1]);

    const tempMatch = line.match(/Temp:\s+([\d.]+)°C/);
    if (tempMatch) data.temp = parseFloat(tempMatch[1]);

    const govMatch = line.match(/Governance quality:\s+([\d.]+)%/);
    if (govMatch) data.governanceQuality = parseFloat(govMatch[1]) / 100;

    const researchMatch = line.match(/Research spending:\s+\$([\d.]+)B/);
    if (researchMatch) data.researchSpending = parseFloat(researchMatch[1]) * 1e9;

    const climateMatch = line.match(/Climate stability:\s+([\d.]+)%/);
    if (climateMatch) data.climateStability = parseFloat(climateMatch[1]) / 100;

    const spiralsMatch = line.match(/Total spirals:\s+([\d.]+)\/6/);
    if (spiralsMatch) data.spiralsActivated = parseFloat(spiralsMatch[1]);

    const cascadeMatch = line.match(/Cascade rate:\s+([\d.]+)%/);
    if (cascadeMatch) data.cascadeRate = parseFloat(cascadeMatch[1]) / 100;
  }

  // Save last scenario
  if (currentScenario && Object.keys(data).length > 0) {
    metrics.push({
      scenarioName: currentScenario,
      qol: data.qol || 0,
      gini: data.gini || 0.4,
      temp: data.temp || 1.5,
      governanceQuality: data.governanceQuality || 0.5,
      researchSpending: data.researchSpending || 0,
      climateStability: data.climateStability || 0.5,
      spiralsActivated: data.spiralsActivated || 0,
      cascadeRate: data.cascadeRate || 0,
    });
  }

  return metrics;
}

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
  const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
  const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));

  if (denomX === 0 || denomY === 0) return 0;

  return numerator / (denomX * denomY);
}

/**
 * Analyze trade-offs
 */
function analyzeTradeOffs(data: ScenarioMetrics[]): string[] {
  const lines: string[] = [];

  if (data.length < 3) {
    lines.push('⚠️  Insufficient data for correlation analysis (need N≥3 scenarios)');
    return lines;
  }

  // Extract arrays for correlation
  const qolArr = data.map(d => d.qol);
  const giniArr = data.map(d => d.gini);
  const tempArr = data.map(d => d.temp);
  const govArr = data.map(d => d.governanceQuality);
  const researchArr = data.map(d => d.researchSpending);
  const climateArr = data.map(d => d.climateStability);
  const spiralsArr = data.map(d => d.spiralsActivated);

  lines.push('');
  lines.push('## Trade-Off Analysis');
  lines.push('');
  lines.push('**Pearson correlations between objectives**');
  lines.push('');

  // Key trade-offs to examine
  const correlations = [
    { x: 'Climate Stability', y: 'Inequality (Gini)', r: pearsonCorrelation(climateArr, giniArr) },
    { x: 'Research Spending', y: 'Inequality (Gini)', r: pearsonCorrelation(researchArr, giniArr) },
    { x: 'Governance Quality', y: 'QoL', r: pearsonCorrelation(govArr, qolArr) },
    { x: 'Climate Stability', y: 'QoL', r: pearsonCorrelation(climateArr, qolArr) },
    { x: 'Temperature Rise', y: 'QoL', r: pearsonCorrelation(tempArr, qolArr) },
    { x: 'Inequality (Gini)', y: 'QoL', r: pearsonCorrelation(giniArr, qolArr) },
    { x: 'Research Spending', y: 'Spirals Activated', r: pearsonCorrelation(researchArr, spiralsArr) },
    { x: 'Governance Quality', y: 'Spirals Activated', r: pearsonCorrelation(govArr, spiralsArr) },
  ];

  // Sort by absolute correlation strength
  correlations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  for (const corr of correlations) {
    const strength = Math.abs(corr.r);
    let interpretation = '';

    if (strength < 0.3) interpretation = '(weak)';
    else if (strength < 0.6) interpretation = '(moderate)';
    else interpretation = '(strong)';

    const direction = corr.r > 0 ? 'positive' : 'negative';

    lines.push(`- **${corr.x} vs ${corr.y}**: r = ${corr.r.toFixed(3)} ${interpretation}`);
    if (strength > 0.3) {
      lines.push(`  → ${direction} correlation - ${corr.r > 0 ? 'both increase together' : 'one increases as other decreases'}`);
    }
  }

  lines.push('');
  lines.push('### Key Findings');
  lines.push('');

  // Interpret strongest correlations
  const strongCorrelations = correlations.filter(c => Math.abs(c.r) > 0.6);
  if (strongCorrelations.length === 0) {
    lines.push('⚠️  No strong correlations detected (r > 0.6)');
    lines.push('');
    lines.push('**Possible explanations:**');
    lines.push('- Scenarios are not diverging in behavior (all producing similar outcomes)');
    lines.push('- Sample size too small (N<10 scenarios)');
    lines.push('- Metrics have insufficient variance across scenarios');
    lines.push('');
  } else {
    for (const corr of strongCorrelations) {
      if (corr.r > 0.6) {
        lines.push(`✅ **Strong synergy**: ${corr.x} and ${corr.y} improve together (r=${corr.r.toFixed(3)})`);
        lines.push('   → Policy win-win: prioritizing one benefits the other');
      } else if (corr.r < -0.6) {
        lines.push(`⚠️  **Strong trade-off**: ${corr.x} vs ${corr.y} are in tension (r=${corr.r.toFixed(3)})`);
        lines.push('   → Policy dilemma: improving one may harm the other');
      }
    }
    lines.push('');
  }

  // Check for lack of variance (all values identical)
  const hasVariance = (arr: number[]) => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return max - min > 0.01; // Allow for small floating point differences
  };

  const variances = {
    QoL: hasVariance(qolArr),
    Gini: hasVariance(giniArr),
    Temp: hasVariance(tempArr),
    Governance: hasVariance(govArr),
    Research: hasVariance(researchArr),
    Climate: hasVariance(climateArr),
  };

  const noVariance = Object.entries(variances).filter(([k, v]) => !v).map(([k]) => k);
  if (noVariance.length > 0) {
    lines.push('⚠️  **WARNING**: These metrics show NO variance across scenarios:');
    noVariance.forEach(metric => lines.push(`   - ${metric}`));
    lines.push('');
    lines.push('**This suggests scenarios are not actually diverging in behavior!**');
    lines.push('Likely causes:');
    lines.push('- Scenario configurations not being applied');
    lines.push('- Government priorities not affecting spending');
    lines.push('- Simulation too short for policies to have effect');
    lines.push('');
  }

  return lines;
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/analyzeTradeOffs.ts <log-file>');
  console.error('\nExample:');
  console.error('   npx tsx scripts/analyzeTradeOffs.ts logs/phase2_validation_post_fix_20251118_090346.log');
  process.exit(1);
}

if (!fs.existsSync(logFile)) {
  console.error(`❌ File not found: ${logFile}`);
  process.exit(1);
}

console.log('🔬 Analyzing Trade-Offs and Correlations...');
console.log(`   Log file: ${logFile}\n`);

const data = parseLogForMetrics(logFile);

if (data.length === 0) {
  console.error('❌ No metric data found in log file');
  process.exit(1);
}

console.log(`📊 Found ${data.length} scenarios\n`);

const analysis = analyzeTradeOffs(data);
analysis.forEach(line => console.log(line));
