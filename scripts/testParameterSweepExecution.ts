import { MonteCarloManager } from '@/lib/MonteCarloManager';

async function main() {
  console.log('=== Monte Carlo Parameter Sweep Integration Test ===\n');

  const manager = new MonteCarloManager();

  // Setup event listeners
  manager.on('batchStarted', (batchId) => {
    console.log(`✅ Batch started: ${batchId}`);
  });

  manager.on('simulationStarted', (simId) => {
    console.log(`  ▶️  Simulation started: ${simId}`);
  });

  manager.on('simulationProgress', (simId, month) => {
    // Throttle output (only log every 3 months)
    if (month % 3 === 0) {
      console.log(`  📊 ${simId}: Month ${month}`);
    }
  });

  manager.on('simulationCompleted', (simId, result) => {
    console.log(`  ✅ ${simId} complete: ${result.summary.finalOutcome}`);
  });

  manager.on('batchProgress', (progress) => {
    console.log(`\n📈 Progress: ${progress.completedRuns}/${progress.totalRuns} (${Math.round(progress.completedRuns / progress.totalRuns * 100)}%)`);
    console.log(`   Workers: ${progress.activeSimulations} running, ${progress.queuedSimulations} queued`);
  });

  manager.on('batchCompleted', (batchId, results) => {
    console.log(`\n✅ Batch ${batchId} COMPLETE!`);
    console.log(`   Total simulations: ${results.length}`);

    // Show outcome distribution
    const outcomes = results.reduce((acc, r) => {
      const outcome = r.summary.finalOutcome;
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 Outcome Distribution:');
    Object.entries(outcomes).forEach(([outcome, count]) => {
      console.log(`   ${outcome}: ${count}/${results.length} (${Math.round(count/results.length*100)}%)`);
    });

    // Show sweep groups
    const sweepGroups = manager.getSweepResults(batchId);
    if (sweepGroups) {
      console.log('\n📊 Sweep Group Results:');
      sweepGroups.forEach(group => {
        console.log(`\n   ${group.label}:`);
        console.log(`     Runs: ${group.runs.length}`);
        console.log(`     Parameters: ${JSON.stringify(group.parameters, null, 2).replace(/\n/g, '\n     ')}`);
        const groupOutcomes = group.runs.reduce((acc, r) => {
          const outcome = r.summary.finalOutcome;
          acc[outcome] = (acc[outcome] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`     Outcomes: ${JSON.stringify(groupOutcomes)}`);
      });
    }
  });

  manager.on('error', (error) => {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.simulationId) {
      console.error(`   Simulation: ${error.simulationId}`);
    }
  });

  // Create and start parameter sweep
  console.log('Creating parameter sweep...');
  const batchId = await manager.createParameterSweep({
    seeds: { start: 42000, count: 3 },
    sweepParameters: {
      thresholdScenarios: ['baseline', 'utopia']
    },
    fixedParameters: {
      scenario: 'historical',
      maxMonths: 12,
      updateInterval: 100  // Fast updates for testing
    },
    name: 'Integration Test Sweep'
  });

  console.log(`Created batch: ${batchId}`);

  // Show configuration summary
  const batch = manager.getBatch(batchId);
  if (batch) {
    console.log(`Total simulations: ${batch.numRuns}`);
    console.log(`Scenario: ${batch.scenario}`);
    console.log(`Max months: ${batch.maxMonths}\n`);
  }

  // Start execution
  console.log('Starting parameter sweep execution...\n');
  await manager.startParameterSweep(batchId);

  console.log('\n=== Test Complete ===');
  console.log(`Test completed successfully at ${new Date().toISOString()}`);
}

main().catch((error) => {
  console.error('\n❌ Test failed with error:');
  console.error(error);
  process.exit(1);
});
