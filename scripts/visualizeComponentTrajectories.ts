#!/usr/bin/env tsx
/**
 * Visualize Western Liberal Component Trajectories
 *
 * Shows 20-year trends for democracy components across multiple runs.
 * Identifies divergence patterns, recovery attempts, and failure modes.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outputDir = 'monteCarloOutputs';

console.log(`\n📈 COMPONENT TRAJECTORY VISUALIZATION - 20-Year Trends\n`);
console.log(`================================================================================\n`);

// Get all JSON files from latest runs
const files = readdirSync(outputDir)
  .filter(f => f.startsWith('run_') && f.endsWith('.json'))
  .sort()
  .reverse();

// Extract unique run numbers
const runNumbers = new Set<number>();
for (const file of files) {
  const match = file.match(/run_(\d+)_/);
  if (match) {
    runNumbers.add(parseInt(match[1]));
  }
}

const uniqueRuns = Array.from(runNumbers).sort().reverse();
console.log(`Found ${uniqueRuns.length} runs. Loading component data...\n`);

type ComponentSnapshot = {
  month: number;
  electoral: number;
  civil: number;
  rule: number;
  economic: number;
  geometric: number;
};

type RunTrajectory = {
  run: number;
  outcome: string;
  trajectory: ComponentSnapshot[];
  recovery?: {
    occurred: boolean;
    peakMonth: number;
    components: string[];
  };
};

const trajectories: RunTrajectory[] = [];

for (const runNum of uniqueRuns) {
  const runFile = files.find(f => f.match(new RegExp(`run_${runNum}_.*\\.json$`)) && !f.includes('snapshot'));
  if (!runFile) continue;

  try {
    const data = JSON.parse(readFileSync(join(outputDir, runFile), 'utf-8'));

    if (!data.westernLiberalComponents || data.westernLiberalComponents.length === 0) {
      continue; // Old run without components
    }

    const components = data.westernLiberalComponents;

    // Calculate geometric mean for each snapshot
    const trajectory: ComponentSnapshot[] = components.map((c: any) => {
      const MIN_FLOOR = 0.1;
      const indicators = [c.electoralDemocracy, c.civilLiberties, c.ruleOfLaw, c.economicFreedom];
      const product = indicators.reduce((acc: number, val: number) => {
        const floored = Math.max(val ?? 50, MIN_FLOOR);
        return acc * (floored / 100);
      }, 1);
      const geometric = Math.pow(product, 1 / indicators.length) * 100;

      return {
        month: c.month,
        electoral: c.electoralDemocracy,
        civil: c.civilLiberties,
        rule: c.ruleOfLaw,
        economic: c.economicFreedom,
        geometric,
      };
    });

    // Detect recovery attempts (any component increases by >10 points after initial decline)
    let recovery: RunTrajectory['recovery'] = { occurred: false, peakMonth: 0, components: [] };

    for (let i = 60; i < trajectory.length - 12; i++) { // Start checking after month 60
      const current = trajectory[i];
      const future = trajectory[Math.min(i + 12, trajectory.length - 1)];
      const past = trajectory[Math.max(0, i - 12)];

      // Check each component for recovery (increase after prior decline)
      const electoralRecovered = current.electoral < past.electoral - 5 && future.electoral > current.electoral + 10;
      const civilRecovered = current.civil < past.civil - 5 && future.civil > current.civil + 10;
      const ruleRecovered = current.rule < past.rule - 5 && future.rule > current.rule + 10;

      if (electoralRecovered || civilRecovered || ruleRecovered) {
        recovery = {
          occurred: true,
          peakMonth: i,
          components: [
            electoralRecovered ? 'Electoral' : '',
            civilRecovered ? 'Civil' : '',
            ruleRecovered ? 'Rule' : '',
          ].filter(c => c !== ''),
        };
        break; // Only track first recovery attempt
      }
    }

    trajectories.push({
      run: runNum,
      outcome: data.outcome ?? 'unknown',
      trajectory,
      recovery,
    });

  } catch (e) {
    // Skip problematic files
  }
}

if (trajectories.length === 0) {
  console.log(`⚠️  No runs with component data found.\n`);
  console.log(`Run a new validation after implementing component tracking to populate data.\n`);
  process.exit(0);
}

console.log(`Loaded ${trajectories.length} runs with component trajectories.\n`);

// Sort by outcome (utopia first, then dystopia)
trajectories.sort((a, b) => {
  if (a.outcome.includes('utopia') && !b.outcome.includes('utopia')) return -1;
  if (!a.outcome.includes('utopia') && b.outcome.includes('utopia')) return 1;
  return b.trajectory[b.trajectory.length - 1].geometric - a.trajectory[a.trajectory.length - 1].geometric;
});

console.log(`=== TRAJECTORY SPARKLINES (Sample: Every 12 months) ===\n`);

// Show sparklines for top 5 runs (best outcomes)
const sampleRuns = trajectories.slice(0, Math.min(5, trajectories.length));

for (const t of sampleRuns) {
  console.log(`Run ${t.run} [${t.outcome}]${t.recovery?.occurred ? ' 🔄 Recovery attempt' : ''}:`);

  // Sample every 12 months
  const samples = t.trajectory.filter(s => s.month % 12 === 0);

  // Electoral Democracy sparkline
  const electoralSparkline = samples.map(s => {
    if (s.electoral >= 70) return '█';
    if (s.electoral >= 50) return '▓';
    if (s.electoral >= 30) return '▒';
    if (s.electoral >= 10) return '░';
    return '·';
  }).join('');

  console.log(`  Electoral:  ${electoralSparkline} (${samples[0].electoral.toFixed(0)} → ${samples[samples.length - 1].electoral.toFixed(0)})`);

  // Civil Liberties sparkline
  const civilSparkline = samples.map(s => {
    if (s.civil >= 70) return '█';
    if (s.civil >= 50) return '▓';
    if (s.civil >= 30) return '▒';
    if (s.civil >= 10) return '░';
    return '·';
  }).join('');

  console.log(`  Civil Lib:  ${civilSparkline} (${samples[0].civil.toFixed(0)} → ${samples[samples.length - 1].civil.toFixed(0)})`);

  // Rule of Law sparkline
  const ruleSparkline = samples.map(s => {
    if (s.rule >= 70) return '█';
    if (s.rule >= 50) return '▓';
    if (s.rule >= 30) return '▒';
    if (s.rule >= 10) return '░';
    return '·';
  }).join('');

  console.log(`  Rule Law:   ${ruleSparkline} (${samples[0].rule.toFixed(0)} → ${samples[samples.length - 1].rule.toFixed(0)})`);

  // Geometric mean sparkline
  const geoSparkline = samples.map(s => {
    if (s.geometric >= 70) return '█';
    if (s.geometric >= 50) return '▓';
    if (s.geometric >= 30) return '▒';
    if (s.geometric >= 10) return '░';
    return '·';
  }).join('');

  console.log(`  Geometric:  ${geoSparkline} (${samples[0].geometric.toFixed(0)} → ${samples[samples.length - 1].geometric.toFixed(0)})`);

  if (t.recovery?.occurred) {
    console.log(`  Recovery at Month ${t.recovery.peakMonth}: ${t.recovery.components.join(', ')}`);
  }

  console.log(``);
}

console.log(`=== RECOVERY ANALYSIS ===\n`);

const recoveryRuns = trajectories.filter(t => t.recovery?.occurred);
console.log(`Runs with recovery attempts: ${recoveryRuns.length}/${trajectories.length} (${(recoveryRuns.length / trajectories.length * 100).toFixed(0)}%)`);

if (recoveryRuns.length > 0) {
  const avgRecoveryMonth = recoveryRuns.reduce((sum, t) => sum + (t.recovery?.peakMonth ?? 0), 0) / recoveryRuns.length;
  console.log(`Average recovery timing: Month ${avgRecoveryMonth.toFixed(0)} (~${(avgRecoveryMonth / 12).toFixed(1)} years)`);

  // Count which components recovered
  const componentRecoveryCounts: Record<string, number> = {};
  for (const r of recoveryRuns) {
    for (const comp of r.recovery?.components ?? []) {
      componentRecoveryCounts[comp] = (componentRecoveryCounts[comp] || 0) + 1;
    }
  }

  console.log(`\nComponents that recovered:`);
  for (const [comp, count] of Object.entries(componentRecoveryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${comp}: ${count}/${recoveryRuns.length} (${(count / recoveryRuns.length * 100).toFixed(0)}%)`);
  }
}

console.log(`\n=== LONG-TERM TRENDS (240 months) ===\n`);

// Calculate average trajectories across all runs
const maxMonths = Math.max(...trajectories.map(t => t.trajectory[t.trajectory.length - 1].month));
const monthlyAverages: Record<number, { electoral: number; civil: number; rule: number; geometric: number; count: number }> = {};

for (const t of trajectories) {
  for (const snap of t.trajectory) {
    if (!monthlyAverages[snap.month]) {
      monthlyAverages[snap.month] = { electoral: 0, civil: 0, rule: 0, geometric: 0, count: 0 };
    }
    monthlyAverages[snap.month].electoral += snap.electoral;
    monthlyAverages[snap.month].civil += snap.civil;
    monthlyAverages[snap.month].rule += snap.rule;
    monthlyAverages[snap.month].geometric += snap.geometric;
    monthlyAverages[snap.month].count += 1;
  }
}

// Sample every 24 months for 20-year view
const yearSamples = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240].filter(m => monthlyAverages[m]);

console.log(`Average Scores (All Runs):\n`);
console.log(`Month | Electoral | Civil Lib | Rule Law | Geometric`);
console.log(`------|-----------|-----------|----------|----------`);

for (const month of yearSamples) {
  const avg = monthlyAverages[month];
  if (!avg || avg.count === 0) continue;

  const year = (month / 12).toFixed(0).padStart(2);
  const electoral = (avg.electoral / avg.count).toFixed(1).padStart(5);
  const civil = (avg.civil / avg.count).toFixed(1).padStart(5);
  const rule = (avg.rule / avg.count).toFixed(1).padStart(5);
  const geometric = (avg.geometric / avg.count).toFixed(1).padStart(5);

  console.log(`${month.toString().padStart(5)} | ${electoral}     | ${civil}     | ${rule}    | ${geometric}`);
}

console.log(`\n=== DIVERGENCE ANALYSIS ===\n`);

// Find runs where components diverge significantly (one recovers, others don't)
const divergentRuns = trajectories.filter(t => {
  const final = t.trajectory[t.trajectory.length - 1];
  const range = Math.max(final.electoral, final.civil, final.rule) - Math.min(final.electoral, final.civil, final.rule);
  return range > 30; // At least 30-point spread between highest and lowest component
});

console.log(`Runs with significant component divergence (>30 point spread): ${divergentRuns.length}/${trajectories.length} (${(divergentRuns.length / trajectories.length * 100).toFixed(0)}%)`);

if (divergentRuns.length > 0) {
  console.log(`\nExamples of divergence (showing final values):\n`);
  for (const t of divergentRuns.slice(0, 3)) {
    const final = t.trajectory[t.trajectory.length - 1];
    console.log(`Run ${t.run}:`);
    console.log(`  Electoral: ${final.electoral.toFixed(1)}, Civil: ${final.civil.toFixed(1)}, Rule: ${final.rule.toFixed(1)}`);
    console.log(`  Range: ${(Math.max(final.electoral, final.civil, final.rule) - Math.min(final.electoral, final.civil, final.rule)).toFixed(1)} points`);
  }
}

console.log(`\n💡 INSIGHTS:\n`);
console.log(`- Component tracking reveals nuance hidden by geometric mean compression`);
console.log(`- Recovery attempts: ${(recoveryRuns.length / trajectories.length * 100).toFixed(0)}% of runs show at least one component recovering`);
console.log(`- Divergence: ${(divergentRuns.length / trajectories.length * 100).toFixed(0)}% of runs have components that move independently`);
console.log(`- This data enables mechanistic discovery of what actually drives outcomes`);

console.log(`\n================================================================================\n`);
