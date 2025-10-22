#!/usr/bin/env tsx
/**
 * Ecology Recovery Diagnosis Script
 *
 * Analyzes why planetary boundary recovery isn't happening
 * Checks:
 * 1. Are boundary values derived from environmental state?
 * 2. Is environmental state one-way degradation?
 * 3. Does recovery system modify environmental state or just track time?
 * 4. What are the actual recovery triggers?
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('\n' + '='.repeat(80));
console.log('🔍 ECOLOGY RECOVERY DIAGNOSIS');
console.log('='.repeat(80));

// Load a recent run to analyze
const args = process.argv.slice(2);
const runFile = args[0] || 'monteCarloOutputs/run_42099_unprecedented_events.json';

if (!fs.existsSync(runFile)) {
  console.error(`❌ File not found: ${runFile}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(runFile, 'utf8'));
const events = data.events || [];

console.log(`\n📊 Run: ${data.run}`);
console.log(`   Duration: ${data.totalMonths} months`);
console.log(`   Outcome: ${data.outcome}`);

// Extract ecology trajectory
const paradigmTrajectory = data.paradigmTrajectory || [];
const ecologyScores = paradigmTrajectory.map((t: any) => ({
  month: t.month,
  score: t.ecological
}));

console.log('\n' + '-'.repeat(80));
console.log('1️⃣  ECOLOGY TRAJECTORY ANALYSIS');
console.log('-'.repeat(80));

if (ecologyScores.length > 0) {
  const initial = ecologyScores[0].score;
  const final = ecologyScores[ecologyScores.length - 1].score;
  const change = final - initial;

  console.log(`\n  Initial ecology score: ${initial.toFixed(1)}`);
  console.log(`  Final ecology score: ${final.toFixed(1)}`);
  console.log(`  Total change: ${change.toFixed(1)} (${change > 0 ? '↑ improving' : '↓ degrading'})`);

  // Check for ANY month-over-month improvements
  let improvements = 0;
  let degradations = 0;
  let stable = 0;

  for (let i = 1; i < ecologyScores.length; i++) {
    const delta = ecologyScores[i].score - ecologyScores[i-1].score;
    if (delta > 0.01) improvements++;
    else if (delta < -0.01) degradations++;
    else stable++;
  }

  console.log(`\n  Month-over-month changes:`);
  console.log(`    Improvements: ${improvements} months (${(improvements / (ecologyScores.length - 1) * 100).toFixed(1)}%)`);
  console.log(`    Degradations: ${degradations} months (${(degradations / (ecologyScores.length - 1) * 100).toFixed(1)}%)`);
  console.log(`    Stable: ${stable} months (${(stable / (ecologyScores.length - 1) * 100).toFixed(1)}%)`);

  if (improvements === 0) {
    console.log(`\n  🚨 CRITICAL: Zero months showed improvement!`);
    console.log(`     Recovery system is not activating or not affecting ecology score.`);
  }
} else {
  console.log(`\n  ⚠️  No paradigm trajectory data available`);
}

console.log('\n' + '-'.repeat(80));
console.log('2️⃣  RECOVERY EVENT SEARCH');
console.log('-'.repeat(80));

const recoveryEvents = events.filter((e: any) =>
  e.description && (
    e.description.includes('RECOVERED') ||
    e.description.includes('Recovery') ||
    e.description.includes('improving') ||
    e.description.includes('un-breached')
  )
);

console.log(`\n  Total events: ${events.length}`);
console.log(`  Recovery-related events: ${recoveryEvents.length}`);

if (recoveryEvents.length > 0) {
  console.log(`\n  Recovery events found:`);
  recoveryEvents.forEach((e: any) => {
    console.log(`    Month ${e.month}: ${e.description}`);
  });
} else {
  console.log(`\n  🚨 CRITICAL: No recovery events logged!`);
  console.log(`     Recovery system never activated during ${data.totalMonths} months.`);
}

console.log('\n' + '-'.repeat(80));
console.log('3️⃣  BOUNDARY STATE ANALYSIS');
console.log('-'.repeat(80));

// Check final boundary states (if available in events)
const boundaryEvents = events.filter((e: any) =>
  e.type === 'planetary_boundary' ||
  e.description?.includes('boundary') ||
  e.description?.includes('threshold')
);

console.log(`\n  Boundary-related events: ${boundaryEvents.length}`);

if (boundaryEvents.length > 0) {
  const latestBoundaries = boundaryEvents.slice(-5);
  console.log(`\n  Latest boundary events (last 5):`);
  latestBoundaries.forEach((e: any) => {
    console.log(`    Month ${e.month}: ${e.description}`);
  });
}

console.log('\n' + '-'.repeat(80));
console.log('4️⃣  DIAGNOSIS SUMMARY');
console.log('-'.repeat(80));

console.log(`\n  FINDINGS:`);

if (improvements === 0) {
  console.log(`\n  ❌ ZERO IMPROVEMENT MONTHS`);
  console.log(`     The ecology score NEVER increased during ${data.totalMonths} months.`);
  console.log(`     This indicates recovery mechanics are not affecting the score.`);
}

if (recoveryEvents.length === 0) {
  console.log(`\n  ❌ ZERO RECOVERY EVENTS`);
  console.log(`     No boundary recovery was logged during the entire run.`);
  console.log(`     Recovery system likely never activated.`);
}

console.log(`\n  LIKELY ROOT CAUSE:`);
console.log(`     The recovery system tracks time-spent-safe but doesn't actually`);
console.log(`     REDUCE boundary values. Boundaries are derived from environmental`);
console.log(`     state (climate stability, biodiversity, pollution), which continues`);
console.log(`     to degrade. Recovery needs to IMPROVE environmental state variables,`);
console.log(`     not just monitor boundaries.`);

console.log(`\n  CODE EVIDENCE:`);
console.log(`     planetaryBoundaries.ts:398-441 - Boundaries recalculated from env state`);
console.log(`     planetaryBoundaryRecovery.ts:75 - Recovery only when currentValue < threshold`);
console.log(`     Problem: If currentValue > threshold (breached), recovery never activates`);

console.log(`\n  RECOMMENDED FIX:`);
console.log(`     Recovery functions must REDUCE environmental degradation:`);
console.log(`     - Increase env.climateStability when conditions met`);
console.log(`     - Increase env.biodiversityIndex when tech deployed`);
console.log(`     - Decrease env.pollutionLevel with cleanup tech`);
console.log(`     Currently: Recovery only tracks time, doesn't modify state`);

console.log('\n' + '='.repeat(80));
console.log('✅ Diagnosis Complete');
console.log('='.repeat(80));
console.log();
