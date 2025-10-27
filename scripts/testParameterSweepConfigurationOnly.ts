/**
 * Test parameter sweep configuration generation
 *
 * This tests the sweep configuration logic without actually running simulations.
 * Verifies that parameter combinations are generated correctly.
 */

import { MonteCarloManager } from '@/lib/MonteCarloManager';

async function main() {
  console.log('=== Parameter Sweep Configuration Test ===\n');

  const manager = new MonteCarloManager();

  // Create parameter sweep
  console.log('Creating parameter sweep with:');
  console.log('  Seeds: 42000-42002 (3 seeds)');
  console.log('  Threshold scenarios: baseline, utopia (2 scenarios)');
  console.log('  Fixed: historical scenario, 12 months\n');

  const batchId = await manager.createParameterSweep({
    seeds: { start: 42000, count: 3 },
    sweepParameters: {
      thresholdScenarios: ['baseline', 'utopia']
    },
    fixedParameters: {
      scenario: 'historical',
      maxMonths: 12,
      updateInterval: 100
    },
    name: 'Configuration Test Sweep'
  });

  console.log(`✅ Created batch: ${batchId}\n`);

  // Verify batch configuration
  const batch = manager.getBatch(batchId);
  if (!batch) {
    console.error('❌ Failed to retrieve batch configuration');
    process.exit(1);
  }

  console.log('📊 Batch Configuration:');
  console.log(`  Total simulations: ${batch.numRuns}`);
  console.log(`  Start seed: ${batch.startSeed}`);
  console.log(`  Scenario: ${batch.scenario}`);
  console.log(`  Max months: ${batch.maxMonths}`);
  console.log(`  Name: ${batch.name}\n`);

  // Verify sweep groups
  const sweepGroups = manager.getSweepResults(batchId);
  if (!sweepGroups) {
    console.error('❌ Failed to retrieve sweep groups');
    process.exit(1);
  }

  console.log('📊 Sweep Groups:');
  console.log(`  Total groups: ${sweepGroups.length}\n`);

  // Show each group
  sweepGroups.forEach((group, index) => {
    console.log(`  Group ${index + 1}: ${group.label}`);
    console.log(`    Runs: ${group.runs.length}`);
    console.log(`    Parameters:`);
    Object.entries(group.parameters).forEach(([key, value]) => {
      console.log(`      ${key}: ${JSON.stringify(value)}`);
    });
    console.log('');
  });

  // Verify expected groups exist
  const expectedGroups = [
    'thresholdScenario=baseline',
    'thresholdScenario=utopia'
  ];

  console.log('✅ Verification:');

  let allChecksPass = true;

  // Check total simulations (3 seeds × 2 scenarios = 6)
  if (batch.numRuns === 6) {
    console.log('  ✓ Total simulations: 6 (correct)');
  } else {
    console.log(`  ✗ Total simulations: ${batch.numRuns} (expected 6)`);
    allChecksPass = false;
  }

  // Check for expected sweep groups
  expectedGroups.forEach(groupLabel => {
    const group = sweepGroups.find(g => g.label.includes(groupLabel));
    if (group) {
      const expectedN = 3; // 3 seeds per scenario
      if (group.runs.length === expectedN) {
        console.log(`  ✓ ${groupLabel}: ${group.runs.length} runs (correct)`);
      } else {
        console.log(`  ✗ ${groupLabel}: ${group.runs.length} runs (expected ${expectedN})`);
        allChecksPass = false;
      }
    } else {
      console.log(`  ✗ ${groupLabel}: group not found`);
      allChecksPass = false;
    }
  });

  // Check run IDs are unique
  const progress = manager.getBatchProgress(batchId);
  if (progress) {
    const uniqueIds = new Set(
      sweepGroups.flatMap(g => g.runs.map(r => r.simulationId))
    );
    if (uniqueIds.size === batch.numRuns) {
      console.log(`  ✓ All simulation IDs unique (${uniqueIds.size})`);
    } else {
      console.log(`  ✗ Duplicate simulation IDs detected (${uniqueIds.size}/${batch.numRuns})`);
      allChecksPass = false;
    }
  }

  console.log('');

  if (allChecksPass) {
    console.log('✅ All checks passed!\n');
    console.log('=== Configuration Test Complete ===');
    console.log('Parameter sweep configuration is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run full integration test in browser (Web Workers available)');
    console.log('  2. Verify simulations execute correctly');
    console.log('  3. Verify results are grouped properly');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed\n');
    console.log('=== Configuration Test Failed ===');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Test failed with error:');
  console.error(error);
  process.exit(1);
});
