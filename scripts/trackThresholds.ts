/**
 * Phase 4: Threshold Achievement Tracker
 *
 * Checks if scenarios are hitting their intended targets.
 *
 * Usage:
 *   npx tsx scripts/trackThresholds.ts [log-file]
 *
 * Output:
 *   - Threshold achievement report to console
 */

import * as fs from 'fs';

interface ThresholdData {
  scenarioName: string;

  // Achieved metrics
  researchSpending: number; // $ billions
  gini: number;
  governanceQuality: number; // 0-1
  climateStability: number; // 0-1
  qol: number; // 0-1

  // Spiral activations
  scientificActivated: boolean;
  democraticActivated: boolean;
  ecologicalActivated: boolean;
  abundanceActivated: boolean;
}

/**
 * Scenario-specific thresholds
 */
const THRESHOLDS = {
  scientificAcceleration: {
    name: 'Scientific Acceleration',
    targets: [
      { metric: 'Research Spending', threshold: 50, unit: 'B/month', achieved: (d: ThresholdData) => d.researchSpending >= 50e9 },
      { metric: 'Scientific Spiral', threshold: 'Active', unit: '', achieved: (d: ThresholdData) => d.scientificActivated },
    ],
  },
  equalityFirst: {
    name: 'Equality First',
    targets: [
      { metric: 'Gini Coefficient', threshold: 0.30, unit: '', achieved: (d: ThresholdData) => d.gini <= 0.30 },
      { metric: 'Abundance Spiral', threshold: 'Active', unit: '', achieved: (d: ThresholdData) => d.abundanceActivated },
    ],
  },
  climateFirst: {
    name: 'Climate First',
    targets: [
      { metric: 'Climate Stability', threshold: 70, unit: '%', achieved: (d: ThresholdData) => d.climateStability >= 0.70 },
      { metric: 'Ecological Spiral', threshold: 'Active', unit: '', achieved: (d: ThresholdData) => d.ecologicalActivated },
    ],
  },
  democraticParticipation: {
    name: 'Democratic Participation',
    targets: [
      { metric: 'Governance Quality', threshold: 70, unit: '%', achieved: (d: ThresholdData) => d.governanceQuality >= 0.70 },
      { metric: 'Democratic Spiral', threshold: 'Active', unit: '', achieved: (d: ThresholdData) => d.democraticActivated },
    ],
  },
  aiAlignmentFirst: {
    name: 'AI Alignment First',
    targets: [
      { metric: 'AI Safety Research', threshold: 30, unit: 'B/month', achieved: (d: ThresholdData) => d.researchSpending >= 30e9 },
      { metric: 'QoL Maintained', threshold: 65, unit: '%', achieved: (d: ThresholdData) => d.qol >= 0.65 },
    ],
  },
};

/**
 * Parse log for threshold data
 */
function parseLogForThresholds(logPath: string): ThresholdData[] {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');

  const thresholdData: ThresholdData[] = [];

  let currentScenario: string | null = null;
  let metrics: Partial<ThresholdData> = {};
  let spirals: Record<string, boolean> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect scenario name
    const scenarioMatch = line.match(/📌 (.+)/);
    if (scenarioMatch) {
      // Save previous
      if (currentScenario && Object.keys(metrics).length > 0) {
        thresholdData.push({
          scenarioName: currentScenario,
          researchSpending: metrics.researchSpending || 0,
          gini: metrics.gini || 0.4,
          governanceQuality: metrics.governanceQuality || 0.5,
          climateStability: metrics.climateStability || 0.5,
          qol: metrics.qol || 0.5,
          scientificActivated: spirals.scientific || false,
          democraticActivated: spirals.democratic || false,
          ecologicalActivated: spirals.ecological || false,
          abundanceActivated: spirals.abundance || false,
        });
      }

      currentScenario = scenarioMatch[1].trim();
      metrics = {};
      spirals = {};
      continue;
    }

    // Extract metrics
    const qolMatch = line.match(/QoL:\s+([\d.]+)%/);
    if (qolMatch) {
      metrics.qol = parseFloat(qolMatch[1]) / 100;
    }

    const giniMatch = line.match(/Gini:\s+([\d.]+)/);
    if (giniMatch) {
      metrics.gini = parseFloat(giniMatch[1]);
    }

    const govMatch = line.match(/Governance quality:\s+([\d.]+)%/);
    if (govMatch) {
      metrics.governanceQuality = parseFloat(govMatch[1]) / 100;
    }

    const researchMatch = line.match(/Research spending:\s+\$([\d.]+)B/);
    if (researchMatch) {
      metrics.researchSpending = parseFloat(researchMatch[1]) * 1e9;
    }

    const climateMatch = line.match(/Climate stability:\s+([\d.]+)%/);
    if (climateMatch) {
      metrics.climateStability = parseFloat(climateMatch[1]) / 100;
    }

    // Extract spiral activations (format: "Scientific:  XX%")
    const spiralMatch = line.match(/(Scientific|Democratic|Ecological|Abundance):\s+(\d+)%/);
    if (spiralMatch) {
      const spiralName = spiralMatch[1].toLowerCase();
      const activationRate = parseInt(spiralMatch[2], 10);
      spirals[spiralName] = activationRate > 0; // Any activation counts
    }
  }

  // Save last scenario
  if (currentScenario && Object.keys(metrics).length > 0) {
    thresholdData.push({
      scenarioName: currentScenario,
      researchSpending: metrics.researchSpending || 0,
      gini: metrics.gini || 0.4,
      governanceQuality: metrics.governanceQuality || 0.5,
      climateStability: metrics.climateStability || 0.5,
      qol: metrics.qol || 0.5,
      scientificActivated: spirals.scientific || false,
      democraticActivated: spirals.democratic || false,
      ecologicalActivated: spirals.ecological || false,
      abundanceActivated: spirals.abundance || false,
    });
  }

  return thresholdData;
}

/**
 * Generate threshold report
 */
function generateThresholdReport(data: ThresholdData[]): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('## Threshold Achievement Report');
  lines.push('');
  lines.push('**Target vs Achieved for each scenario**');
  lines.push('');

  for (const d of data) {
    // Find matching threshold definition
    const scenarioKey = Object.keys(THRESHOLDS).find(
      key => THRESHOLDS[key as keyof typeof THRESHOLDS].name === d.scenarioName
    );

    if (!scenarioKey) {
      // No specific thresholds defined for this scenario
      continue;
    }

    const thresholds = THRESHOLDS[scenarioKey as keyof typeof THRESHOLDS];
    lines.push(`### ${thresholds.name}`);
    lines.push('');

    for (const target of thresholds.targets) {
      const achieved = target.achieved(d);
      const status = achieved ? '✅' : '❌';

      // Get actual value for comparison
      let actualValue = '';
      if (target.metric === 'Research Spending') {
        actualValue = `$${(d.researchSpending / 1e9).toFixed(1)}B`;
      } else if (target.metric === 'Gini Coefficient') {
        actualValue = d.gini.toFixed(3);
      } else if (target.metric === 'Governance Quality') {
        actualValue = `${(d.governanceQuality * 100).toFixed(1)}%`;
      } else if (target.metric === 'Climate Stability') {
        actualValue = `${(d.climateStability * 100).toFixed(1)}%`;
      } else if (target.metric.includes('Spiral')) {
        actualValue = achieved ? 'Active' : 'Inactive';
      }

      lines.push(`- ${status} **${target.metric}**: Target ${target.threshold}${target.unit} → Achieved ${actualValue}`);
    }

    lines.push('');
  }

  return lines;
}

/**
 * Generate summary statistics
 */
function generateSummaryStats(data: ThresholdData[]): string[] {
  const lines: string[] = [];

  // Count how many scenarios hit their targets
  let totalTargets = 0;
  let totalAchieved = 0;

  for (const d of data) {
    const scenarioKey = Object.keys(THRESHOLDS).find(
      key => THRESHOLDS[key as keyof typeof THRESHOLDS].name === d.scenarioName
    );

    if (!scenarioKey) continue;

    const thresholds = THRESHOLDS[scenarioKey as keyof typeof THRESHOLDS];
    for (const target of thresholds.targets) {
      totalTargets++;
      if (target.achieved(d)) {
        totalAchieved++;
      }
    }
  }

  lines.push('## Summary');
  lines.push('');
  lines.push(`**Overall threshold achievement: ${totalAchieved}/${totalTargets} (${((totalAchieved / totalTargets) * 100).toFixed(0)}%)**`);
  lines.push('');

  if (totalAchieved === 0) {
    lines.push('⚠️  **CRITICAL**: No scenarios achieved ANY of their intended targets!');
    lines.push('');
    lines.push('**Possible causes:**');
    lines.push('- Scenario configurations not being applied correctly');
    lines.push('- Thresholds set too high for 60-month window');
    lines.push('- Government priority system not functioning as expected');
    lines.push('- Spiral activation requirements too strict');
    lines.push('');
  } else if (totalAchieved < totalTargets / 2) {
    lines.push('⚠️  **WARNING**: Less than 50% of targets achieved.');
    lines.push('');
    lines.push('**Recommendations:**');
    lines.push('- Review scenario application logic in applyScenario()');
    lines.push('- Check government spending allocation in simulation');
    lines.push('- Verify spiral activation thresholds are calibrated correctly');
    lines.push('');
  }

  return lines;
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/trackThresholds.ts <log-file>');
  console.error('\nExample:');
  console.error('   npx tsx scripts/trackThresholds.ts logs/phase2_validation_post_fix_20251118_090346.log');
  process.exit(1);
}

if (!fs.existsSync(logFile)) {
  console.error(`❌ File not found: ${logFile}`);
  process.exit(1);
}

console.log('🔬 Tracking Threshold Achievement...');
console.log(`   Log file: ${logFile}\n`);

const data = parseLogForThresholds(logFile);

if (data.length === 0) {
  console.error('❌ No threshold data found in log file');
  process.exit(1);
}

console.log(`📊 Found ${data.length} scenarios\n`);

const report = generateThresholdReport(data);
report.forEach(line => console.log(line));

const summary = generateSummaryStats(data);
summary.forEach(line => console.log(line));
