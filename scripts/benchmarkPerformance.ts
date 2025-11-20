/**
 * Performance Benchmark Script
 *
 * Measures actual simulation step execution time without console.log overhead.
 * Used to verify the console.log performance bug fix.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { logger } from '../src/simulation/utils/asyncLogger';

// Disable logging for performance testing
logger.setEnabled(false);

// Also suppress console.log and console.warn globally
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
let consoleLogSuppressed = false;

function suppressConsoleLogs() {
  consoleLogSuppressed = true;
  console.log = () => {}; // noop
  console.warn = () => {}; // noop
  console.error = () => {}; // noop
}

function restoreConsoleLogs() {
  consoleLogSuppressed = false;
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}

async function benchmarkSimulation(steps: number = 100) {
  console.log('\n🔍 Performance Benchmark Starting...\n');
  console.log(`Configuration:`);
  console.log(`  Steps: ${steps}`);
  console.log(`  Logging: ${logger ? 'Async Logger' : 'Direct console.log'}`);
  console.log(`  Console suppression: ${consoleLogSuppressed ? 'ON' : 'OFF'}\n`);

  // Create engine and initial state
  const engine = new SimulationEngine({ seed: 123456 });

  // Get RNG from engine (matches worker pattern - Nov 20, 2025 fix)
  const seededRng = engine.getRNG();
  const rngFunction = () => seededRng.next();
  let state = createDefaultInitialState(rngFunction);

  // Warm-up run (with console suppressed)
  console.log('Warming up...');
  suppressConsoleLogs();
  engine.step(state);
  restoreConsoleLogs();

  // Benchmark runs
  console.log(`\nBenchmarking ${steps} steps...`);

  // Suppress console for actual benchmark
  suppressConsoleLogs();

  const stepTimes: number[] = [];
  const memorySnapshots: number[] = [];

  // Reset state for actual benchmark
  state = createDefaultInitialState(rngFunction);

  for (let i = 0; i < steps; i++) {
    const startTime = performance.now();
    const startMem = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    // Step mutates state in place
    engine.step(state);

    const endTime = performance.now();
    const endMem = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    const stepTime = endTime - startTime;
    stepTimes.push(stepTime);
    memorySnapshots.push(endMem);
  }

  // Restore console.log for results reporting
  restoreConsoleLogs();

  // Report progress
  console.log(`  Completed ${steps} steps\n`);

  // Calculate statistics
  const avgTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
  const minTime = Math.min(...stepTimes);
  const maxTime = Math.max(...stepTimes);
  const sortedTimes = [...stepTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

  const initialMem = memorySnapshots[0];
  const finalMem = memorySnapshots[memorySnapshots.length - 1];
  const memGrowth = finalMem - initialMem;
  const memGrowthPerStep = memGrowth / steps;

  // Print results
  console.log('\n📊 Performance Results:\n');
  console.log('Execution Time:');
  console.log(`  Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min:     ${minTime.toFixed(2)}ms`);
  console.log(`  Max:     ${maxTime.toFixed(2)}ms`);
  console.log(`  P50:     ${p50.toFixed(2)}ms`);
  console.log(`  P95:     ${p95.toFixed(2)}ms`);
  console.log(`  P99:     ${p99.toFixed(2)}ms`);

  console.log('\nMemory Usage:');
  console.log(`  Initial:  ${initialMem.toFixed(2)} MB`);
  console.log(`  Final:    ${finalMem.toFixed(2)} MB`);
  console.log(`  Growth:   ${memGrowth.toFixed(2)} MB`);
  console.log(`  Per Step: ${memGrowthPerStep.toFixed(2)} MB`);

  console.log('\nReal-Time Feasibility:');
  const target = 1000; // 1 second per day
  const passRate = (stepTimes.filter(t => t < target).length / stepTimes.length) * 100;
  console.log(`  Target:   <${target}ms per step`);
  console.log(`  Pass Rate: ${passRate.toFixed(1)}% of steps under target`);
  console.log(`  Status:   ${avgTime < target ? '✅ FEASIBLE' : '❌ TOO SLOW'}`);
  console.log(`  Headroom: ${avgTime < target ? `${((target - avgTime) / target * 100).toFixed(1)}%` : 'NONE'}`);

  // Identify slow steps
  const slowSteps = stepTimes
    .map((time, idx) => ({ step: idx, time }))
    .filter(s => s.time > target)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  if (slowSteps.length > 0) {
    console.log('\n⚠️  Slowest Steps (exceeding 1000ms):');
    for (const s of slowSteps) {
      console.log(`  Step ${s.step}: ${s.time.toFixed(2)}ms`);
    }
  }

  console.log('\n✅ Benchmark Complete\n');

  return {
    avgTime,
    minTime,
    maxTime,
    p50,
    p95,
    p99,
    passRate,
    memGrowth,
    memGrowthPerStep,
  };
}

// Run benchmark
const main = async () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Simulation Performance Benchmark                    ║');
  console.log('║   Console.log Bug Fix Verification                    ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  // Get steps from command line (support both bare number and --steps=N)
  const args = process.argv.slice(2);
  const stepsArg = args.find(arg => arg.startsWith('--steps='));
  const steps = stepsArg
    ? parseInt(stepsArg.split('=')[1])
    : (args[0] ? parseInt(args[0]) : 100);

  // Don't suppress here - let benchmarkSimulation handle it
  try {
    await benchmarkSimulation(steps);
  } finally {
    // Ensure logs are restored
    restoreConsoleLogs();
  }
};

main().catch(console.error);
