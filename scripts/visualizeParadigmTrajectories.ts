#!/usr/bin/env tsx
/**
 * Terminal-Friendly Paradigm Trajectory Visualizations
 *
 * Creates human + LLM readable charts for Multi-Paradigm DUI analysis:
 * 1. Line charts of paradigm scores over time (sparklines)
 * 2. Heatmap comparison of all 4 paradigms
 * 3. Divergence timeline
 * 4. Outcome classification summary
 *
 * Usage:
 *   npx tsx scripts/visualizeParadigmTrajectories.ts <run-event-file.json>
 *   npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_42000_unprecedented_events.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ASCII Chart Utilities
// ============================================================================

/**
 * Create sparkline (mini line chart) from data points
 * Uses Unicode block characters for smooth gradients
 */
function sparkline(values: number[], width: number = 60, min?: number, max?: number): string {
  if (values.length === 0) return '';

  const minVal = min ?? Math.min(...values);
  const maxVal = max ?? Math.max(...values);
  const range = maxVal - minVal || 1;

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  // Downsample if needed
  const step = Math.max(1, Math.floor(values.length / width));
  const sampledValues = [];
  for (let i = 0; i < values.length; i += step) {
    const chunk = values.slice(i, i + step);
    const avg = chunk.reduce((sum, v) => sum + v, 0) / chunk.length;
    sampledValues.push(avg);
  }

  return sampledValues.map(v => {
    const normalized = (v - minVal) / range;
    const index = Math.min(chars.length - 1, Math.floor(normalized * chars.length));
    return chars[index];
  }).join('');
}

/**
 * Create horizontal bar chart
 */
function horizontalBar(value: number, max: number = 100, width: number = 40, label?: string): string {
  const normalized = Math.max(0, Math.min(1, value / max));
  const filledWidth = Math.round(normalized * width);
  const bar = '█'.repeat(filledWidth) + '░'.repeat(width - filledWidth);

  const labelStr = label ? `${label.padEnd(20)} ` : '';
  const valueStr = `${value.toFixed(1).padStart(5)}`;

  return `${labelStr}${bar} ${valueStr}`;
}

/**
 * Create heatmap cell (colored based on value)
 */
function heatmapCell(value: number): string {
  // Dystopia (<30) = ░, Mixed (30-70) = ▒, Utopia (≥70) = █
  if (value < 30) return '░';
  if (value < 50) return '▒';
  if (value < 70) return '▓';
  return '█';
}

/**
 * Format large number with K/M/B suffix
 */
function formatNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

// ============================================================================
// Visualization Functions
// ============================================================================

/**
 * Visualize paradigm trajectories over time
 */
function visualizeTrajectories(trajectoryData: any[], runMetadata: any) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PARADIGM TRAJECTORIES (Month-by-Month)');
  console.log('='.repeat(80));

  console.log(`\n  Run: ${runMetadata.run}`);
  console.log(`  Seed: ${runMetadata.seed}`);
  console.log(`  Scenario: ${runMetadata.scenarioMode} - ${runMetadata.scenarioDescription}`);
  console.log(`  Duration: ${runMetadata.totalMonths} months`);
  console.log(`  Outcome: ${runMetadata.outcome.toUpperCase()}`);

  if (trajectoryData.length === 0) {
    console.log('\n  ⚠️  No trajectory data available');
    return;
  }

  // Extract time series for each paradigm
  const western = trajectoryData.map(t => t.western).filter(v => v != null);
  const development = trajectoryData.map(t => t.development).filter(v => v != null);
  const ecological = trajectoryData.map(t => t.ecological).filter(v => v != null);
  const indigenous = trajectoryData.map(t => t.indigenous).filter(v => v != null);

  const allValues = [...western, ...development, ...ecological, ...indigenous];
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);

  console.log(`\n  Global Range: ${globalMin.toFixed(1)} - ${globalMax.toFixed(1)}`);
  console.log(`  Chart Scale: 0-100 (Dystopia <30, Mixed 30-70, Utopia ≥80)\n`);

  // Western Liberal
  if (western.length > 0) {
    const spark = sparkline(western, 70, 0, 100);
    const initial = western[0];
    const final = western[western.length - 1];
    const change = final - initial;
    const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

    console.log(`  Western Liberal:  ${spark}`);
    console.log(`    ${initial.toFixed(1)} → ${final.toFixed(1)} (${changeStr}) | Democracy, Civil Liberties, Rule of Law\n`);
  }

  // Development
  if (development.length > 0) {
    const spark = sparkline(development, 70, 0, 100);
    const initial = development[0];
    const final = development[development.length - 1];
    const change = final - initial;
    const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

    console.log(`  Development:      ${spark}`);
    console.log(`    ${initial.toFixed(1)} → ${final.toFixed(1)} (${changeStr}) | QoL, Survival Tier, Life Expectancy\n`);
  }

  // Ecological
  if (ecological.length > 0) {
    const spark = sparkline(ecological, 70, 0, 100);
    const initial = ecological[0];
    const final = ecological[ecological.length - 1];
    const change = final - initial;
    const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

    console.log(`  Ecological:       ${spark}`);
    console.log(`    ${initial.toFixed(1)} → ${final.toFixed(1)} (${changeStr}) | Planetary Boundaries, Climate, Resources\n`);
  }

  // Indigenous
  if (indigenous.length > 0) {
    const spark = sparkline(indigenous, 70, 0, 100);
    const initial = indigenous[0];
    const final = indigenous[indigenous.length - 1];
    const change = final - initial;
    const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

    console.log(`  Indigenous:       ${spark}`);
    console.log(`    ${initial.toFixed(1)} → ${final.toFixed(1)} (${changeStr}) | Social Trust, Community Bonds, Meaning\n`);
  }
}

/**
 * Create heatmap showing paradigm state at key intervals
 */
function visualizeHeatmap(trajectoryData: any[]) {
  console.log('\n' + '='.repeat(80));
  console.log('🔥 PARADIGM HEATMAP (Quarterly Snapshots)');
  console.log('='.repeat(80));

  if (trajectoryData.length === 0) {
    console.log('\n  ⚠️  No trajectory data available');
    return;
  }

  // Sample at quartiles
  const numQuartiles = 8;
  const step = Math.max(1, Math.floor(trajectoryData.length / numQuartiles));
  const samples = [];

  for (let i = 0; i < trajectoryData.length; i += step) {
    samples.push(trajectoryData[i]);
  }
  if (samples[samples.length - 1] !== trajectoryData[trajectoryData.length - 1]) {
    samples.push(trajectoryData[trajectoryData.length - 1]);
  }

  console.log('\n  Legend: ░ Dystopia (<30) | ▒ Struggling (30-50) | ▓ Mixed (50-70) | █ Utopia (≥70)\n');
  console.log('  Month      Western  Develop  Ecologi  Indigen  Divergence');
  console.log('  ' + '-'.repeat(70));

  samples.forEach(t => {
    const monthStr = `${t.month}`.padStart(5);
    const western = heatmapCell(t.western ?? 50);
    const development = heatmapCell(t.development ?? 50);
    const ecological = heatmapCell(t.ecological ?? 50);
    const indigenous = heatmapCell(t.indigenous ?? 50);

    // Calculate divergence for this snapshot
    const values = [t.western, t.development, t.ecological, t.indigenous].filter(v => v != null);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const divergence = Math.sqrt(variance);

    const divBar = horizontalBar(divergence, 50, 15);

    console.log(`  ${monthStr}      ${western.repeat(4)}     ${development.repeat(4)}     ${ecological.repeat(4)}     ${indigenous.repeat(4)}     ${divBar}`);
  });

  console.log();
}

/**
 * Show final paradigm comparison
 */
function visualizeFinalComparison(trajectoryData: any[], runMetadata: any) {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 FINAL PARADIGM COMPARISON');
  console.log('='.repeat(80));

  if (trajectoryData.length === 0) {
    console.log('\n  ⚠️  No trajectory data available');
    return;
  }

  const final = trajectoryData[trajectoryData.length - 1];

  console.log('\n  Final Scores (0-100):');
  console.log('  ' + '-'.repeat(70));

  const paradigms = [
    { name: 'Western Liberal', value: final.western ?? 50, desc: 'Democracy, liberties, rule of law' },
    { name: 'Development', value: final.development ?? 50, desc: 'QoL, survival, life expectancy' },
    { name: 'Ecological', value: final.ecological ?? 50, desc: 'Planetary boundaries, climate' },
    { name: 'Indigenous', value: final.indigenous ?? 50, desc: 'Social trust, community, meaning' }
  ];

  // Sort by score
  paradigms.sort((a, b) => b.value - a.value);

  paradigms.forEach(p => {
    const bar = horizontalBar(p.value, 100, 40, p.name);
    const classification = p.value >= 80 ? '🌟 UTOPIA' :
                          p.value >= 70 ? '✅ Thriving' :
                          p.value >= 50 ? '🟡 Mixed' :
                          p.value >= 30 ? '⚠️  Struggling' :
                          '💀 DYSTOPIA';

    console.log(`  ${bar}  ${classification}`);
    console.log(`    ${p.desc}\n`);
  });

  // Calculate divergence
  const values = paradigms.map(p => p.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const divergence = Math.sqrt(variance);
  const maxRange = Math.max(...values) - Math.min(...values);

  console.log(`  Paradigm Divergence: ${divergence.toFixed(1)} points (std dev)`);
  console.log(`  Max Range: ${maxRange.toFixed(1)} points (${Math.min(...values).toFixed(1)} - ${Math.max(...values).toFixed(1)})`);

  // Contested outcome?
  const utopias = paradigms.filter(p => p.value >= 80).length;
  const dystopias = paradigms.filter(p => p.value <= 30).length;

  if (utopias > 0 && dystopias > 0) {
    console.log('\n  🚨 CONTESTED OUTCOME: Simultaneous utopias and dystopias!');
    console.log(`     ${utopias} paradigm(s) in utopia, ${dystopias} in dystopia`);
    console.log('     (Singapore/Norway pattern detected)');
  } else if (divergence > 30) {
    console.log('\n  ⚠️  HIGH DIVERGENCE: Paradigms strongly disagree');
  }

  console.log();
}

/**
 * Show divergence evolution over time
 */
function visualizeDivergenceTimeline(trajectoryData: any[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📈 DIVERGENCE TIMELINE');
  console.log('='.repeat(80));

  if (trajectoryData.length === 0) {
    console.log('\n  ⚠️  No trajectory data available');
    return;
  }

  // Calculate divergence at each timestep
  const divergenceTimeline = trajectoryData.map(t => {
    const values = [t.western, t.development, t.ecological, t.indigenous].filter(v => v != null);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  });

  console.log('\n  Divergence Over Time (higher = more disagreement between paradigms):\n');

  const spark = sparkline(divergenceTimeline, 70, 0, 50);
  const initial = divergenceTimeline[0];
  const final = divergenceTimeline[divergenceTimeline.length - 1];
  const peak = Math.max(...divergenceTimeline);
  const peakMonth = divergenceTimeline.indexOf(peak);

  console.log(`  ${spark}`);
  console.log(`  ${initial.toFixed(1)} → ${final.toFixed(1)} (peak: ${peak.toFixed(1)} at month ${trajectoryData[peakMonth].month})\n`);

  // Trend analysis
  const firstHalf = divergenceTimeline.slice(0, Math.floor(divergenceTimeline.length / 2));
  const secondHalf = divergenceTimeline.slice(Math.floor(divergenceTimeline.length / 2));

  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  const trend = secondAvg - firstAvg;

  if (trend > 2) {
    console.log('  📊 TREND: DIVERGING - Paradigms moving apart over time');
  } else if (trend < -2) {
    console.log('  📊 TREND: CONVERGING - Paradigms moving together over time');
  } else {
    console.log('  📊 TREND: STABLE - Paradigm relationships unchanged');
  }

  console.log();
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npx tsx scripts/visualizeParadigmTrajectories.ts <run-event-file.json>');
  console.error('Example: npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_42000_unprecedented_events.json');
  process.exit(1);
}

const eventFile = args[0];

if (!fs.existsSync(eventFile)) {
  console.error(`Error: File not found: ${eventFile}`);
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(eventFile, 'utf8'));

  const trajectoryData = data.paradigmTrajectory || [];
  const runMetadata = {
    run: data.run,
    seed: data.seed,
    scenarioMode: data.scenarioMode,
    scenarioDescription: data.scenarioDescription,
    totalMonths: data.totalMonths,
    outcome: data.outcome,
    outcomeReason: data.outcomeReason
  };

  // Generate all visualizations
  visualizeTrajectories(trajectoryData, runMetadata);
  visualizeHeatmap(trajectoryData);
  visualizeDivergenceTimeline(trajectoryData);
  visualizeFinalComparison(trajectoryData, runMetadata);

  console.log('\n' + '='.repeat(80));
  console.log('✅ Visualization Complete');
  console.log('='.repeat(80));
  console.log();

} catch (error) {
  console.error('Error reading/parsing file:', error);
  process.exit(1);
}
