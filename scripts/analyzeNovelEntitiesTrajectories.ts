#!/usr/bin/env npx tsx
/**
 * Detailed trajectory analysis for Novel Entities boundary
 * Identifies divergence points and failure modes
 */

import * as fs from 'fs';

interface TrajectoryPoint {
  month: number;
  value: number;
  production: number;
  cleanupNet: number;
}

function extractTrajectory(logContent: string, runNumber: number): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];
  const lines = logContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Only process lines for this run
    if (!line.includes(`[Run   ${runNumber}/`)) continue;

    const monthMatch = line.match(/🌍 Novel Entities Boundary Update \(Month (\d+)\):/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      let value = 0;
      let production = 0;
      let cleanupNet = 0;

      // Parse next lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j];
        if (!nextLine.includes(`[Run   ${runNumber}/`)) break;

        const prodMatch = nextLine.match(/Production:\s+\+?([-\d.]+)%/);
        if (prodMatch) production = parseFloat(prodMatch[1]);

        const cleanupMatch = nextLine.match(/Cleanup \(net\):\s+([-\d.]+)%/);
        if (cleanupMatch) cleanupNet = parseFloat(cleanupMatch[1]);

        const changeMatch = nextLine.match(/Net Change:\s+[\d.]+\s+→\s+([\d.]+)/);
        if (changeMatch) {
          value = parseFloat(changeMatch[1]);
        }
      }

      if (value > 0) {
        trajectory.push({ month, value, production, cleanupNet });
      }
    }
  }

  return trajectory;
}

function main() {
  const logPath = '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_parameter_verification_20251119_200644.log';
  const logContent = fs.readFileSync(logPath, 'utf-8');

  console.log(`\n🔍 DETAILED TRAJECTORY ANALYSIS`);
  console.log(`================================================================================\n`);

  // Analyze runs 4 and 5 (the outliers)
  for (const run of [4, 5]) {
    const trajectory = extractTrajectory(logContent, run);

    console.log(`\n📈 RUN ${run} TRAJECTORY:`);
    console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

    if (trajectory.length === 0) {
      console.log(`  ❌ No data found for run ${run}\n`);
      continue;
    }

    const initial = trajectory[0].value;
    const final = trajectory[trajectory.length - 1].value;
    const peak = Math.max(...trajectory.map(t => t.value));
    const peakMonth = trajectory.find(t => t.value === peak)?.month || 0;

    console.log(`  Initial (Month 0): ${initial.toFixed(4)}`);
    console.log(`  Peak: ${peak.toFixed(4)} (Month ${peakMonth})`);
    console.log(`  Final (Month ${trajectory.length - 1}): ${final.toFixed(4)}`);
    console.log(`  Net Change: ${(final - initial >= 0 ? '+' : '')}${(final - initial).toFixed(4)} (${((final - initial) / initial * 100).toFixed(2)}%)\n`);

    // Find when it started diverging (value > initial)
    const divergePoint = trajectory.find(t => t.value > initial);
    if (divergePoint) {
      console.log(`  ⚠️  DIVERGENCE DETECTED at Month ${divergePoint.month}`);
      console.log(`      Value: ${divergePoint.value.toFixed(4)} (above initial ${initial.toFixed(4)})\n`);
    }

    // Check if it hit the cap (2.0)
    const capHit = trajectory.find(t => t.value >= 1.999);
    if (capHit) {
      console.log(`  🔴 BOUNDARY CAP HIT at Month ${capHit.month}`);
      console.log(`      Value: ${capHit.value.toFixed(4)} (cap = 2.0)\n`);
    }

    // Sample key months
    console.log(`  Sample Trajectory (every 24 months):`);
    console.log(`  ┌────────┬────────────┬──────────────┬─────────────┐`);
    console.log(`  │ Month  │   Value    │  Production  │   Cleanup   │`);
    console.log(`  ├────────┼────────────┼──────────────┼─────────────┤`);

    for (let m = 0; m < trajectory.length; m += 24) {
      const t = trajectory[m];
      console.log(`  │ ${t.month.toString().padStart(6)} │ ${t.value.toFixed(4).padStart(10)} │ +${t.production.toFixed(4)}%   │ ${t.cleanupNet.toFixed(4)}%  │`);
    }

    // Add final month if not already shown
    const lastShown = Math.floor((trajectory.length - 1) / 24) * 24;
    if (lastShown !== trajectory.length - 1) {
      const t = trajectory[trajectory.length - 1];
      console.log(`  │ ${t.month.toString().padStart(6)} │ ${t.value.toFixed(4).padStart(10)} │ +${t.production.toFixed(4)}%   │ ${t.cleanupNet.toFixed(4)}%  │`);
    }

    console.log(`  └────────┴────────────┴──────────────┴─────────────┘\n`);

    // Calculate average rates
    const avgProduction = trajectory.reduce((sum, t) => sum + t.production, 0) / trajectory.length;
    const avgCleanup = trajectory.reduce((sum, t) => sum + t.cleanupNet, 0) / trajectory.length;

    console.log(`  Average Production: +${avgProduction.toFixed(4)}%/month`);
    console.log(`  Average Cleanup: ${avgCleanup.toFixed(4)}%/month`);
    console.log(`  Net Rate: ${(avgProduction + avgCleanup).toFixed(4)}%/month\n`);
  }

  // Compare with successful run (1)
  console.log(`\n📊 COMPARISON WITH SUCCESSFUL RUN (Run 1):`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  const run1Trajectory = extractTrajectory(logContent, 1);
  if (run1Trajectory.length > 0) {
    const initial = run1Trajectory[0].value;
    const final = run1Trajectory[run1Trajectory.length - 1].value;
    const avgProduction = run1Trajectory.reduce((sum, t) => sum + t.production, 0) / run1Trajectory.length;
    const avgCleanup = run1Trajectory.reduce((sum, t) => sum + t.cleanupNet, 0) / run1Trajectory.length;

    console.log(`  Initial: ${initial.toFixed(4)}`);
    console.log(`  Final: ${final.toFixed(4)}`);
    console.log(`  Reduction: ${(initial - final).toFixed(4)} (${((initial - final) / initial * 100).toFixed(2)}%)`);
    console.log(`  Average Production: +${avgProduction.toFixed(4)}%/month`);
    console.log(`  Average Cleanup: ${avgCleanup.toFixed(4)}%/month\n`);
  }

  console.log(`\n🔎 ROOT CAUSE ANALYSIS:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  console.log(`  Runs 4-5 show INCREASING boundary values (negative effectiveness)`);
  console.log(`  This indicates:`);
  console.log(`    1. Production > (Cleanup + Natural Decay)`);
  console.log(`    2. Either cleanup techs not deploying`);
  console.log(`    3. Or cleanup energy-gated to near-zero effectiveness\n`);

  console.log(`  Key observations:`);
  console.log(`    - All runs start at ~1.499 (identical initial conditions)`);
  console.log(`    - Runs 4-5 diverge upward (hit 2.0 cap)`);
  console.log(`    - Other runs show 2.98-9.97% reduction`);
  console.log(`    - Average cleanup net effect ≈ 0% across all runs\n`);

  console.log(`  Hypothesis: Cleanup technologies NOT DEPLOYING or NOT EFFECTIVE`);
  console.log(`              Prevention technologies also ineffective (only ~10% max reduction)\n`);
}

main();
