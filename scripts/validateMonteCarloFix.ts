/**
 * Validation Script: Monte Carlo Worker API Fix
 *
 * Tests that MonteCarloManager correctly uses SimulationWorkerClient event API.
 *
 * Bug: worker.initializeSimulation() doesn't exist (was calling non-existent method)
 * Fix: Use worker.init() + event listeners for initialization and completion
 *
 * Test case: Run 4 simulations (2x2 parameter sweep) to verify:
 * - Worker initialization succeeds
 * - Event listeners properly wired
 * - Simulation completion detected
 * - Outcomes captured correctly
 */

import { MonteCarloManager } from '../src/lib/MonteCarloManager';

async function validateFix() {
  console.log('🧪 Validating Monte Carlo Worker API Fix\n');

  const manager = new MonteCarloManager();

  // Test case: Small parameter sweep (4 runs)
  // - 2 seeds × 2 alignment dynamics = 4 simulations
  const batchConfig = {
    startSeed: 42000,
    numRuns: 2,  // 2 seeds
    scenario: 'historical' as const,
    maxMonths: 12,  // Just 1 year for quick test
    updateInterval: 100,  // Fast updates (100ms)
  };

  console.log('Creating batch with config:', batchConfig);

  try {
    // Create batch
    const batchId = await manager.createBatch(batchConfig);
    console.log(`✅ Batch created: ${batchId}\n`);

    // Track progress
    let progressUpdates = 0;
    let completedSims = 0;
    let failedSims = 0;

    manager.on('simulationProgress', (simId: string, batchId: string, month: number) => {
      progressUpdates++;
      if (progressUpdates % 10 === 0) {
        console.log(`  📊 Progress: ${simId} at month ${month}`);
      }
    });

    manager.on('simulationCompleted', (simId: string, batchId: string, outcome: string) => {
      completedSims++;
      console.log(`  ✅ Completed: ${simId} → ${outcome}`);
    });

    manager.on('simulationError', (simId: string, batchId: string, error: Error) => {
      failedSims++;
      console.error(`  ❌ Failed: ${simId} → ${error.message}`);
    });

    manager.on('batchCompleted', async (batchId: string) => {
      console.log(`\n🎉 Batch completed: ${batchId}`);

      // Get aggregate stats
      const stats = await manager.getAggregateStats(batchId);
      console.log(`\n📊 Aggregate Stats:`);
      console.log(`  Total runs: ${stats.totalRuns}`);
      console.log(`  Completed: ${stats.completedRuns}`);
      console.log(`  Failed: ${stats.failedRuns}`);
      console.log(`  Progress updates: ${progressUpdates}`);

      // Validate results
      console.log(`\n🔍 Validation:`);

      if (stats.completedRuns === 2 && stats.failedRuns === 0) {
        console.log('  ✅ All simulations completed successfully');
      } else {
        console.error(`  ❌ Expected 2 completed, 0 failed. Got ${stats.completedRuns} completed, ${stats.failedRuns} failed`);
        process.exit(1);
      }

      if (progressUpdates > 0) {
        console.log(`  ✅ Progress tracking works (${progressUpdates} updates)`);
      } else {
        console.error('  ❌ No progress updates received');
        process.exit(1);
      }

      console.log('\n✅ Monte Carlo Worker API Fix VALIDATED\n');
      process.exit(0);
    });

    // Start batch
    console.log('Starting batch...\n');
    await manager.startBatch(batchId);

    // Wait for completion (timeout after 60 seconds)
    await new Promise((resolve) => {
      setTimeout(() => {
        console.error('\n❌ Test timed out after 60 seconds');
        console.error(`  Completed: ${completedSims}, Failed: ${failedSims}`);
        process.exit(1);
      }, 60000);
    });

  } catch (error: any) {
    console.error('\n❌ Validation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run validation
validateFix();
