#!/usr/bin/env tsx
/**
 * Crash Analysis Script
 * Analyzes the 25 crashed Monte Carlo runs to identify error patterns
 */

import fs from 'fs';
import path from 'path';

interface CrashInfo {
  seed: number;
  run: number;
  totalMonths: number;
  outcome: string;
  hasParadigmTrajectory: boolean;
  paradigmLength: number;
  lastValidMonth: number | null;
  criticalEvents: number;
  totalEvents: number;
  lastEvents: Array<{ month: number; type: string; description: string }>;
}

function analyzeCrashes(outputDir: string, logFile: string): void {
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('run_420') && f.endsWith('_unprecedented_events.json'))
    .sort();

  console.log(`\n=== Crash Analysis (N=${files.length}) ===\n`);

  const crashes: CrashInfo[] = [];
  const logContent = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf-8') : '';

  // Identify crashed runs
  files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const hasCrashed = !data.paradigmTrajectory || data.paradigmTrajectory.length === 0;

    if (hasCrashed) {
      const lastValidMonth = data.paradigmTrajectory && data.paradigmTrajectory.length > 0
        ? data.paradigmTrajectory[data.paradigmTrajectory.length - 1]?.month || null
        : null;

      // Extract last few critical events
      const criticalEvents = data.events?.criticalEvents || data.criticalEvents || [];
      const lastEvents = Array.isArray(criticalEvents)
        ? criticalEvents.slice(-5).map((e: any) => ({
            month: e.month || 0,
            type: e.type || e.title || 'unknown',
            description: e.description || e.title || 'unknown'
          }))
        : [];

      crashes.push({
        seed: data.seed,
        run: data.run,
        totalMonths: data.totalMonths,
        outcome: data.outcome,
        hasParadigmTrajectory: !!data.paradigmTrajectory,
        paradigmLength: data.paradigmTrajectory?.length || 0,
        lastValidMonth,
        criticalEvents: criticalEvents.length,
        totalEvents: data.events?.summary?.totalEvents || 0,
        lastEvents
      });
    }
  });

  console.log(`## Crash Summary`);
  console.log(`  Total crashes: ${crashes.length}/${files.length} (${((crashes.length / files.length) * 100).toFixed(1)}%)`);

  if (crashes.length === 0) {
    console.log('  No crashes found!');
    return;
  }

  // Categorize crashes
  const nullTrajectory = crashes.filter(c => !c.hasParadigmTrajectory).length;
  const emptyTrajectory = crashes.filter(c => c.hasParadigmTrajectory && c.paradigmLength === 0).length;

  console.log(`\n## Crash Categories`);
  console.log(`  Null paradigmTrajectory: ${nullTrajectory}`);
  console.log(`  Empty paradigmTrajectory: ${emptyTrajectory}`);

  // Month distribution
  const validMonths = crashes.filter(c => c.lastValidMonth !== null);
  if (validMonths.length > 0) {
    const months = validMonths.map(c => c.lastValidMonth!);
    const avgMonth = months.reduce((a, b) => a + b, 0) / months.length;
    console.log(`\n## Crash Timing`);
    console.log(`  Average last valid month: ${avgMonth.toFixed(1)}`);
    console.log(`  Range: ${Math.min(...months)} - ${Math.max(...months)}`);
  }

  // Event analysis
  console.log(`\n## Event Analysis`);
  const eventTypes: Record<string, number> = {};
  crashes.forEach(crash => {
    crash.lastEvents.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });
  });

  const sortedEvents = Object.entries(eventTypes).sort((a, b) => b[1] - a[1]);
  console.log(`  Event types before crash (last 5 events per run):`);
  sortedEvents.slice(0, 10).forEach(([type, count]) => {
    console.log(`    ${type}: ${count}`);
  });

  // Search log for errors
  console.log(`\n## Log Analysis`);
  const crashedSeeds = crashes.map(c => c.seed);
  const errorPatterns = [
    /TypeError:/g,
    /ReferenceError:/g,
    /RangeError:/g,
    /Cannot read propert/g,
    /undefined/g,
    /NaN/g,
    /is not a function/g
  ];

  const errorCounts: Record<string, number> = {};
  errorPatterns.forEach(pattern => {
    const matches = logContent.match(pattern);
    if (matches) {
      errorCounts[pattern.source] = matches.length;
    }
  });

  if (Object.keys(errorCounts).length > 0) {
    console.log(`  Error patterns in log:`);
    Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
      console.log(`    ${pattern}: ${count} occurrences`);
    });
  } else {
    console.log(`  No explicit error patterns found in log file`);
  }

  // Detailed crash list
  console.log(`\n## Detailed Crash List (first 10)`);
  crashes.slice(0, 10).forEach(crash => {
    console.log(`\n  Seed ${crash.seed} (run ${crash.run}):`);
    console.log(`    Total months: ${crash.totalMonths}`);
    console.log(`    Last valid month: ${crash.lastValidMonth || 'unknown'}`);
    console.log(`    Paradigm trajectory: ${crash.hasParadigmTrajectory ? `${crash.paradigmLength} snapshots` : 'null'}`);
    console.log(`    Events: ${crash.totalEvents} total, ${crash.criticalEvents} critical`);
    if (crash.lastEvents.length > 0) {
      console.log(`    Last events:`);
      crash.lastEvents.forEach(e => {
        console.log(`      Month ${e.month}: ${e.type} - ${e.description.substring(0, 80)}`);
      });
    }
  });

  if (crashes.length > 10) {
    console.log(`\n  ... and ${crashes.length - 10} more crashes`);
  }

  // Extract log sections for crashed runs
  console.log(`\n## Extracting Log Sections for Crashed Runs`);
  crashedSeeds.slice(0, 5).forEach(seed => {
    const pattern = `Run ${seed % 100}/${100}`;
    const idx = logContent.indexOf(pattern);
    if (idx !== -1) {
      const section = logContent.substring(idx, idx + 2000);
      const errorMatch = section.match(/(Error|Exception|TypeError|ReferenceError)[^\n]*/);
      if (errorMatch) {
        console.log(`\n  Seed ${seed}: ${errorMatch[0]}`);
      }
    }
  });

  console.log('\n');
}

// Run analysis
const outputDir = path.join(process.cwd(), 'monteCarloOutputs');
const logFile = path.join(process.cwd(), 'logs/deep_validation_20251025_113607.log');

analyzeCrashes(outputDir, logFile);
