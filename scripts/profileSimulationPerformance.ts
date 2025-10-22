#!/usr/bin/env tsx

/**
 * Profile simulation performance for real-time mode feasibility analysis
 * Measures execution time per phase and memory consumption
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { performance } from 'perf_hooks';

// Helper to format memory in MB
function formatMemory(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// Helper to get current memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  };
}

async function profileSimulation() {
  console.log('=== SIMULATION PERFORMANCE PROFILING ===');
  console.log('Target: 1 second = 1 day (1000ms max per step)');
  console.log('AI turns: Every 7 days (7000ms between AI decisions)\n');

  // Create initial state
  console.log('Creating initial state...');
  const startInit = performance.now();
  const initialState = createDefaultInitialState();
  const initTime = performance.now() - startInit;
  console.log(`✓ Initial state created in ${initTime.toFixed(2)}ms\n`);

  // Memory baseline
  const memBaseline = getMemoryUsage();
  console.log('Memory baseline:');
  console.log(`  RSS: ${formatMemory(memBaseline.rss)}`);
  console.log(`  Heap Used: ${formatMemory(memBaseline.heapUsed)}`);
  console.log(`  Heap Total: ${formatMemory(memBaseline.heapTotal)}\n`);

  // Profile individual steps
  const stepTimes: number[] = [];
  const phaseTimes: Map<string, number[]> = new Map();
  const memorySnapshots: any[] = [];

  console.log('Profiling 100 simulation steps...\n');

  const engine = new SimulationEngine({ seed: 12345 });
  let state = initialState;

  // Hook into console.log to capture phase names
  const originalLog = console.log;
  let currentPhase: string | null = null;
  let phaseStartTime: number = 0;

  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('===') && message.includes('===')) {
      // End previous phase timing
      if (currentPhase && phaseStartTime > 0) {
        const duration = performance.now() - phaseStartTime;
        if (!phaseTimes.has(currentPhase)) {
          phaseTimes.set(currentPhase, []);
        }
        phaseTimes.get(currentPhase)!.push(duration);
      }

      // Start new phase timing
      const match = message.match(/=== (.+) ===/);
      if (match) {
        currentPhase = match[1];
        phaseStartTime = performance.now();
      }
    }
    // Suppress output during profiling
  };

  // Profile 100 steps
  for (let i = 0; i < 100; i++) {
    if (i % 10 === 0) {
      originalLog(`  Step ${i}...`);
    }

    const stepStart = performance.now();
    const result = engine.step(state);
    const stepTime = performance.now() - stepStart;

    stepTimes.push(stepTime);
    state = result.state;

    // Memory snapshot every 10 steps
    if (i % 10 === 0) {
      const mem = getMemoryUsage();
      memorySnapshots.push({
        step: i,
        heapUsed: mem.heapUsed,
        rss: mem.rss
      });
    }
  }

  // End last phase timing
  if (currentPhase && phaseStartTime > 0) {
    const duration = performance.now() - phaseStartTime;
    if (!phaseTimes.has(currentPhase)) {
      phaseTimes.set(currentPhase, []);
    }
    phaseTimes.get(currentPhase)!.push(duration);
  }

  // Restore console.log
  console.log = originalLog;

  // Calculate statistics
  const avgStepTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
  const minStepTime = Math.min(...stepTimes);
  const maxStepTime = Math.max(...stepTimes);
  const p95StepTime = stepTimes.sort((a, b) => a - b)[Math.floor(stepTimes.length * 0.95)];

  console.log('\n=== PERFORMANCE RESULTS ===\n');

  console.log('Step Execution Times:');
  console.log(`  Average: ${avgStepTime.toFixed(2)}ms ${avgStepTime < 1000 ? '✅' : '❌'}`);
  console.log(`  Min: ${minStepTime.toFixed(2)}ms`);
  console.log(`  Max: ${maxStepTime.toFixed(2)}ms`);
  console.log(`  P95: ${p95StepTime.toFixed(2)}ms\n`);

  // Real-time feasibility
  console.log('Real-Time Feasibility:');
  const feasible = avgStepTime < 1000;
  console.log(`  Target: <1000ms per step (1 day/second)`);
  console.log(`  Current: ${avgStepTime.toFixed(2)}ms`);
  console.log(`  Status: ${feasible ? '✅ FEASIBLE' : '❌ TOO SLOW'}`);
  console.log(`  Speed multiplier needed: ${(avgStepTime / 1000).toFixed(2)}x\n`);

  // Top 10 slowest phases
  console.log('Top 10 Slowest Phases:');
  const phaseAverages: Array<[string, number]> = [];
  for (const [phase, times] of phaseTimes.entries()) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    phaseAverages.push([phase, avg]);
  }
  phaseAverages.sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < Math.min(10, phaseAverages.length); i++) {
    const [phase, avg] = phaseAverages[i];
    const percentage = (avg / avgStepTime * 100).toFixed(1);
    console.log(`  ${i + 1}. ${phase}: ${avg.toFixed(2)}ms (${percentage}%)`);
  }

  // Memory analysis
  console.log('\nMemory Consumption:');
  const finalMem = getMemoryUsage();
  const heapGrowth = finalMem.heapUsed - memBaseline.heapUsed;
  const rssGrowth = finalMem.rss - memBaseline.rss;

  console.log(`  Initial heap: ${formatMemory(memBaseline.heapUsed)}`);
  console.log(`  Final heap: ${formatMemory(finalMem.heapUsed)}`);
  console.log(`  Heap growth: ${formatMemory(heapGrowth)} (${(heapGrowth / memBaseline.heapUsed * 100).toFixed(1)}%)`);
  console.log(`  RSS growth: ${formatMemory(rssGrowth)}`);
  console.log(`  Growth per step: ${formatMemory(heapGrowth / 100)}\n`);

  // Extrapolate to longer runs
  console.log('Extrapolated Performance:');
  const stepsPerMonth = 30;
  const monthTime = avgStepTime * stepsPerMonth;
  console.log(`  Time per month (30 steps): ${(monthTime / 1000).toFixed(2)}s`);
  console.log(`  Time for 120 months: ${(monthTime * 120 / 1000 / 60).toFixed(2)} minutes`);
  console.log(`  Memory after 1000 steps: ~${formatMemory(memBaseline.heapUsed + heapGrowth * 10)}`);
  console.log(`  Memory after 3600 steps (120 months): ~${formatMemory(memBaseline.heapUsed + heapGrowth * 36)}\n`);

  // Bottleneck analysis
  console.log('=== BOTTLENECK ANALYSIS ===\n');

  // Check for O(n²) patterns
  console.log('Potential O(n²) Operations:');
  const slowPhases = phaseAverages.filter(([_, time]) => time > 10);
  if (slowPhases.length > 0) {
    console.log('  Phases taking >10ms (likely have nested loops):');
    for (const [phase, time] of slowPhases) {
      console.log(`    - ${phase}: ${time.toFixed(2)}ms`);
    }
  } else {
    console.log('  None detected (all phases <10ms)');
  }

  // State size estimation
  const stateJson = JSON.stringify(state);
  const stateSize = new TextEncoder().encode(stateJson).length;
  console.log(`\nState Size: ${formatMemory(stateSize)}`);
  console.log(`  Serialization overhead: ${stateSize > 10 * 1024 * 1024 ? '❌ HEAVY' : '✅ Manageable'}`);

  // Final recommendation
  console.log('\n=== RECOMMENDATION ===\n');
  if (feasible) {
    console.log('✅ Real-time mode is FEASIBLE with current architecture');
    console.log('   Average step time is below 1000ms target');
    console.log('   Some optimization may still be beneficial for smoother experience');
  } else {
    const speedupNeeded = avgStepTime / 1000;
    console.log(`❌ Real-time mode requires ${speedupNeeded.toFixed(1)}x performance improvement`);
    console.log('   Consider:');
    console.log('   1. Optimizing slowest phases (see list above)');
    console.log('   2. Parallelizing independent phases');
    console.log('   3. Reducing state cloning frequency');
    console.log('   4. Using Web Workers for simulation thread');
  }

  process.exit(0);
}

profileSimulation().catch(console.error);