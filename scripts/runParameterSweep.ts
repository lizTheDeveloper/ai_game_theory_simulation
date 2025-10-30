#!/usr/bin/env tsx
/**
 * Parameter Sweep Runner - Monte Carlo Validation
 *
 * Runs comprehensive parameter sweep across scenario modes and threshold configurations
 * to validate outcome diversity and simulation behavior.
 *
 * Configuration:
 * - 4 scenario modes × 3 threshold scenarios = 12 configurations
 * - N=100 runs per configuration = 1,200 total simulations
 * - Estimated runtime: 3-6 hours (10-18 seconds per run)
 *
 * Usage:
 *   npx tsx scripts/runParameterSweep.ts
 */

// Mock browser APIs for Node.js environment
(global as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);
(global as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
(global as any).Worker = class MockWorker {
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
};

import { MonteCarloManager, type ParameterSweepConfig } from '../src/lib/MonteCarloManager';

async function runParameterSweep() {
  console.log('\n=== Monte Carlo Parameter Sweep ===\n');
  console.log('Configuration:');
  console.log('  • 2 scenario modes (historical, unprecedented)');
  console.log('  • 5 threshold scenarios (doom, cautious, baseline, progressive, utopia)');
  console.log('  • N=100 seeds per configuration');
  console.log('  • Total: 1,000 simulations (~3-5 hours)\n');

  const manager = new MonteCarloManager();

  // Parameter sweep configuration
  const config: ParameterSweepConfig = {
    seeds: {
      start: 50000,      // Start after previous validation runs (42000-42099)
      count: 100         // N=100 per configuration
    },

    sweepParameters: {
      // 2 scenario modes (different initial conditions & growth rates)
      scenarioModes: ['historical', 'unprecedented'],

      // 5 threshold scenarios (different AI alignment, breakthrough thresholds, crisis severity)
      thresholdScenarios: ['doom', 'cautious', 'baseline', 'progressive', 'utopia']
    },

    fixedParameters: {
      maxMonths: 360,    // 30-year simulation
      scenario: undefined // Will be overridden by scenarioModes sweep
    },

    name: 'Validation Sweep - Oct 30, 2025'
  };

  console.log('Starting parameter sweep...\n');
  console.log(`Total configurations: ${(config.sweepParameters.scenarioModes?.length || 1) * (config.sweepParameters.thresholdScenarios?.length || 1)}`);
  console.log(`Total simulations: ${config.seeds.count * (config.sweepParameters.scenarioModes?.length || 1) * (config.sweepParameters.thresholdScenarios?.length || 1)}`);
  console.log('');

  try {
    const batchId = await manager.createParameterSweep(config);
    console.log(`✅ Created sweep batch: ${batchId}`);

    // Monitor progress
    const checkProgress = () => {
      const progress = manager.getBatchProgress(batchId);
      if (!progress) {
        console.log('❌ Batch not found');
        return;
      }

      const pct = ((progress.completedRuns / progress.totalRuns) * 100).toFixed(1);
      console.log(`\n📊 Progress: ${progress.completedRuns}/${progress.totalRuns} (${pct}%)`);
      console.log(`   Running: ${progress.runningRuns}, Pending: ${progress.pendingRuns}`);

      if (progress.sweepGroups) {
        console.log(`\n   Sweep Groups (${progress.sweepGroups.length}):`);
        for (const group of progress.sweepGroups.slice(0, 12)) {
          const groupCompleted = group.simulationIds.filter(id => {
            const sim = manager['simulations'].get(id);
            return sim?.status === 'completed';
          }).length;
          const groupPct = ((groupCompleted / group.simulationIds.length) * 100).toFixed(0);
          console.log(`     ${group.parameterName}=${group.parameterValue}: ${groupCompleted}/${group.simulationIds.length} (${groupPct}%)`);
        }
      }

      if (progress.completedRuns < progress.totalRuns) {
        setTimeout(checkProgress, 30000); // Check every 30 seconds
      } else {
        console.log('\n✅ Parameter sweep complete!');
        console.log('\n📄 Results saved to monteCarloOutputs/');
      }
    };

    // Start monitoring
    setTimeout(checkProgress, 5000);

  } catch (error) {
    console.error('❌ Parameter sweep failed:', error);
    process.exit(1);
  }
}

// Run the sweep
runParameterSweep().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
