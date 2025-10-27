/**
 * Parameter Sweep Test Script
 *
 * Tests the parameter sweep functionality of MonteCarloManager.
 * Generates cartesian products and validates grouping logic.
 *
 * Usage:
 *   npx tsx scripts/testParameterSweep.ts
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

async function testParameterSweep() {
  console.log('\n=== Parameter Sweep Test ===\n');

  const manager = new MonteCarloManager();

  // Test 1: Simple threshold scenario sweep
  console.log('Test 1: Threshold Scenario Sweep (10 seeds × 3 scenarios = 30 simulations)');
  const config1: ParameterSweepConfig = {
    seeds: { start: 42000, count: 10 },
    sweepParameters: {
      thresholdScenarios: ['doom', 'baseline', 'utopia']
    },
    fixedParameters: {
      scenario: 'historical',
      maxMonths: 120
    },
    name: 'Threshold Sensitivity Test'
  };

  try {
    const batchId1 = await manager.createParameterSweep(config1);
    console.log(`✅ Created sweep batch: ${batchId1}`);
    console.log(`   Expected: 30 simulations`);

    // Check batch progress
    const progress1 = manager.getBatchProgress(batchId1);
    if (progress1) {
      console.log(`   Actual: ${progress1.totalRuns} simulations`);
      console.log(`   Sweep groups: ${progress1.sweepGroups?.length || 0} groups`);

      if (progress1.sweepGroups) {
        for (const group of progress1.sweepGroups) {
          if (group.parameterName === 'thresholdScenario') {
            console.log(`   - ${group.parameterValue}: ${group.simulationIds.length} simulations`);
          }
        }
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Multi-parameter sweep
  console.log('Test 2: Multi-Parameter Sweep (5 seeds × 2 scenarios × 2 months = 20 simulations)');
  const config2: ParameterSweepConfig = {
    seeds: { start: 43000, count: 5 },
    sweepParameters: {
      scenarioModes: ['historical', 'unprecedented'],
      maxMonths: [60, 120]
    },
    fixedParameters: {
      speculativeScenario: 'baseline'
    },
    name: 'Multi-Parameter Test'
  };

  try {
    const batchId2 = await manager.createParameterSweep(config2);
    console.log(`✅ Created sweep batch: ${batchId2}`);
    console.log(`   Expected: 20 simulations`);

    const progress2 = manager.getBatchProgress(batchId2);
    if (progress2) {
      console.log(`   Actual: ${progress2.totalRuns} simulations`);
      console.log(`   Sweep groups: ${progress2.sweepGroups?.length || 0} groups`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Validation (too many combinations)
  console.log('Test 3: Validation Test (should reject > 1000 simulations)');
  const config3: ParameterSweepConfig = {
    seeds: { start: 44000, count: 100 },
    sweepParameters: {
      thresholdScenarios: ['doom', 'cautious', 'baseline', 'progressive', 'utopia'],
      scenarioModes: ['historical', 'unprecedented'],
      maxMonths: [60, 120, 360]
    },
    fixedParameters: {}
  };

  try {
    await manager.createParameterSweep(config3);
    console.error('❌ Test 3 failed: Should have rejected 3000 simulations');
  } catch (error) {
    if (error instanceof Error && error.message.includes('1000')) {
      console.log(`✅ Correctly rejected: ${error.message}`);
    } else {
      console.error('❌ Test 3 failed with unexpected error:', error);
    }
  }
  console.log();

  // Test 4: Edge case (single parameter value)
  console.log('Test 4: Edge Case (10 seeds × 1 scenario = 10 simulations)');
  const config4: ParameterSweepConfig = {
    seeds: { start: 45000, count: 10 },
    sweepParameters: {
      thresholdScenarios: ['baseline']
    },
    fixedParameters: {
      scenario: 'historical',
      maxMonths: 120
    },
    name: 'Single Value Sweep'
  };

  try {
    const batchId4 = await manager.createParameterSweep(config4);
    console.log(`✅ Created sweep batch: ${batchId4}`);
    console.log(`   Expected: 10 simulations`);

    const progress4 = manager.getBatchProgress(batchId4);
    if (progress4) {
      console.log(`   Actual: ${progress4.totalRuns} simulations`);
    }
    console.log();
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  // Test 5: Validation (no sweep parameters)
  console.log('Test 5: Validation Test (should reject if no sweep parameters)');
  const config5: ParameterSweepConfig = {
    seeds: { start: 46000, count: 10 },
    sweepParameters: {},
    fixedParameters: {
      scenario: 'historical',
      maxMonths: 120
    }
  };

  try {
    await manager.createParameterSweep(config5);
    console.error('❌ Test 5 failed: Should have rejected empty sweep parameters');
  } catch (error) {
    if (error instanceof Error && error.message.includes('At least one sweep parameter')) {
      console.log(`✅ Correctly rejected: ${error.message}`);
    } else {
      console.error('❌ Test 5 failed with unexpected error:', error);
    }
  }
  console.log();

  // Cleanup
  manager.destroy();

  console.log('=== All Tests Complete ===\n');
}

// Run tests
testParameterSweep().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
