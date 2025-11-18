/**
 * Test script to verify PhaseOrchestrator memory leak fix (Nov 13, 2025)
 *
 * Validates that:
 * 1. Phase samples array is capped at MAX_PHASE_SAMPLES (1000)
 * 2. Step timings array is capped at MAX_STEP_TIMINGS (1200)
 * 3. Performance tracking still works correctly (min/max/p95)
 */

import { PhaseOrchestrator, SimulationPhase, RNGFunction } from '../src/simulation/engine/PhaseOrchestrator';
import { GameState } from '@/types/game';
import { createTestState } from '../src/simulation/initialization';

// Mock phase for testing
const mockPhase: SimulationPhase = {
  id: 'test-phase',
  name: 'Test Phase',
  order: 1,
  execute: (state: GameState, rng: RNGFunction) => {
    // Simulate some work
    const start = performance.now();
    while (performance.now() - start < 1) {} // Burn 1ms
    return { events: [] };
  }
};

async function testMemoryLeakFix() {
  console.log('Testing PhaseOrchestrator memory leak fix...\n');

  const orchestrator = new PhaseOrchestrator();
  orchestrator.registerPhase(mockPhase);
  orchestrator.enablePerformanceTiming();

  // Create initial state
  const state = createTestState();
  const rng = () => Math.random();

  console.log('Running 2000 simulation steps (exceeds sliding window limits)...');
  const startTime = performance.now();

  for (let i = 0; i < 2000; i++) {
    state.currentMonth = i;
    orchestrator.executeAll(state, rng);

    // Log progress every 500 steps
    if ((i + 1) % 500 === 0) {
      const elapsed = performance.now() - startTime;
      console.log(`  Step ${i + 1}/2000 (${elapsed.toFixed(0)}ms elapsed)`);
    }
  }

  const totalTime = performance.now() - startTime;
  console.log(`\nCompleted 2000 steps in ${totalTime.toFixed(0)}ms\n`);

  // Verify sliding windows worked
  console.log('=== MEMORY LEAK VERIFICATION ===\n');

  const timings = orchestrator.getPhaseTimings();
  const phaseData = timings.get('Test Phase');

  if (!phaseData) {
    throw new Error('No timing data found for Test Phase');
  }

  console.log(`Phase samples count: ${phaseData.samples.length}`);
  console.log(`  Expected: <= 1000 (MAX_PHASE_SAMPLES)`);
  console.log(`  Status: ${phaseData.samples.length <= 1000 ? '✅ PASS' : '❌ FAIL'}`);

  const stepTimings = orchestrator.getStepTimings();
  console.log(`\nStep timings count: ${stepTimings.length}`);
  console.log(`  Expected: <= 1200 (MAX_STEP_TIMINGS)`);
  console.log(`  Status: ${stepTimings.length <= 1200 ? '✅ PASS' : '❌ FAIL'}`);

  // Verify statistics are still correct
  console.log(`\n=== STATISTICS VERIFICATION ===\n`);
  console.log(`Call count: ${phaseData.callCount}`);
  console.log(`  Expected: 2000`);
  console.log(`  Status: ${phaseData.callCount === 2000 ? '✅ PASS' : '❌ FAIL'}`);

  console.log(`\nMin: ${phaseData.minMs.toFixed(2)}ms`);
  console.log(`Max: ${phaseData.maxMs.toFixed(2)}ms`);
  console.log(`Avg: ${(phaseData.totalMs / phaseData.callCount).toFixed(2)}ms`);

  // Calculate p95 from samples
  const sorted = [...phaseData.samples].sort((a, b) => a - b);
  const p95Index = Math.ceil(sorted.length * 0.95) - 1;
  const p95 = sorted[Math.max(0, p95Index)];
  console.log(`P95: ${p95.toFixed(2)}ms`);

  console.log(`\nStatistics look reasonable: ${
    phaseData.minMs > 0 && phaseData.maxMs > phaseData.minMs && p95 > 0
      ? '✅ PASS'
      : '❌ FAIL'
  }`);

  // Memory estimate
  const samplesMemory = phaseData.samples.length * 8; // 8 bytes per number
  const stepTimingsMemory = stepTimings.length * 16; // ~16 bytes per entry (month + totalMs)
  const totalMemory = samplesMemory + stepTimingsMemory;

  console.log(`\n=== MEMORY USAGE ESTIMATE ===\n`);
  console.log(`Phase samples: ${(samplesMemory / 1024).toFixed(2)} KB`);
  console.log(`Step timings: ${(stepTimingsMemory / 1024).toFixed(2)} KB`);
  console.log(`Total: ${(totalMemory / 1024).toFixed(2)} KB`);
  console.log(`\nWithout fix (2000 steps): ${((2000 * 8 + 2000 * 16) / 1024).toFixed(2)} KB`);
  console.log(`With fix (capped): ${(totalMemory / 1024).toFixed(2)} KB`);

  // Overall verdict
  const allPassed =
    phaseData.samples.length <= 1000 &&
    stepTimings.length <= 1200 &&
    phaseData.callCount === 2000 &&
    phaseData.minMs > 0 &&
    phaseData.maxMs > phaseData.minMs;

  console.log(`\n${'='.repeat(50)}`);
  console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  console.log(`${'='.repeat(50)}\n`);

  process.exit(allPassed ? 0 : 1);
}

testMemoryLeakFix().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});
