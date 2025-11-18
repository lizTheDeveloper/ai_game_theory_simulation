/**
 * Single Simulation Run with Detailed Timing
 *
 * Runs one 240-month simulation with performance profiling
 */

import { createDefaultInitialState } from '../src/simulation/initialization.js';
import { SimulationEngine } from '../src/simulation/engine.js';

async function runTimedSimulation() {
  console.log('🎲 Single Simulation Run - Performance Test');
  console.log('============================================\n');

  const seed = Date.now();
  const maxMonths = 240;

  console.log(`📊 Configuration:`);
  console.log(`   Seed: ${seed}`);
  console.log(`   Duration: ${maxMonths} months (20 years)`);
  console.log(`   Government System: ACTIVE`);
  console.log('');

  // Track timing for different phases
  const timings = {
    initialization: 0,
    simulation: 0,
    total: 0
  };

  // Initialization
  console.log('⏱️  Initializing game state...');
  const initStart = performance.now();
  const engine = new SimulationEngine({ seed, maxMonths, logLevel: 'none' });
  // FIX (Nov 16, 2025): Pass RNG to initialization (CRITICAL-3 regression prevention)
  // RNG is REQUIRED parameter - simulation must be deterministic
  // Use engine's RNG instance to ensure determinism (same sequence for init + simulation)
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());
  const initialState = createDefaultInitialState(rngFunction, 'historical'); // Use historical scenario mode
  timings.initialization = performance.now() - initStart;
  console.log(`   ✓ Initialized in ${timings.initialization.toFixed(2)}ms\n`);

  // Simulation
  console.log('🔄 Running simulation...');
  const simStart = performance.now();

  const runResult = engine.run(initialState, {
    maxMonths,
    checkActualOutcomes: true
  });

  timings.simulation = performance.now() - simStart;
  const state = runResult.finalState;
  timings.total = performance.now() - initStart;

  console.log('\n✅ Simulation complete\n');

  // Performance analysis
  console.log('📈 Performance Analysis:');
  console.log('========================\n');

  console.log('⏱️  Total Time:');
  console.log(`   Initialization: ${timings.initialization.toFixed(2)}ms`);
  console.log(`   Simulation: ${(timings.simulation / 1000).toFixed(2)}s`);
  console.log(`   Total: ${(timings.total / 1000).toFixed(2)}s\n`);

  // Calculate per-month averages
  const actualMonths = state.currentMonth ?? runResult.summary?.totalMonths ?? 0;
  console.log('📊 Per-Month Statistics:');
  if (actualMonths > 0) {
    const avgMonth = timings.simulation / actualMonths;
    console.log(`   Months simulated: ${actualMonths}`);
    console.log(`   Average: ${avgMonth.toFixed(2)}ms/month`);
    console.log(`   Throughput: ${(1000 / avgMonth).toFixed(1)} months/second\n`);
  } else {
    console.log(`   ⚠️ No months completed (state.currentMonth=${state.currentMonth}, summary.totalMonths=${runResult.summary?.totalMonths})\n`);
  }

  // Extrapolation for N=100
  console.log('🔮 Extrapolation for N=100 Validation:');
  const estimatedN100Time = (timings.total / 1000) * 100;
  const hours = Math.floor(estimatedN100Time / 3600);
  const minutes = Math.floor((estimatedN100Time % 3600) / 60);
  console.log(`   Estimated time: ${hours}h ${minutes}m`);
  console.log(`   Per simulation: ${(timings.total / 1000).toFixed(2)}s`);

  // Note: Node.js doesn't have navigator, use os.cpus() instead
  const os = await import('os');
  const cores = os.cpus().length;
  console.log(`   Parallelization potential: ${Math.ceil(100 / cores)}x batches (${cores} cores)\n`);

  // Final outcome
  console.log('🎯 Final Outcome:');
  console.log(`   Month: ${state.currentMonth ?? runResult.summary.totalMonths}`);
  const outcomeType = state.extinctionState?.extinct ? 'EXTINCTION' :
                     (state.outcomeMetrics?.activeAttractor || runResult.summary.finalOutcome || 'IN_PROGRESS');
  console.log(`   Outcome: ${outcomeType}`);
  console.log(`   Outcome Reason: ${runResult.summary.finalOutcomeReason || 'N/A'}`);

  // Extinction details
  if (state.extinctionState?.extinct) {
    console.log(`\n🔍 Extinction Details:`);
    console.log(`   Type: ${state.extinctionState.extinctionType || 'unknown'}`);
    console.log(`   Speed: ${state.extinctionState.extinctionSpeed || 'unknown'}`);
    console.log(`   Cause: ${state.extinctionState.cause || 'unknown'}`);
    console.log(`   Month triggered: ${state.extinctionState.monthTriggered || 'unknown'}`);

    // Death attribution
    if (state.humanPopulationSystem?.deathsByCategory) {
      console.log(`\n   Top proximate causes:`);
      const proximate = state.humanPopulationSystem.deathsByCategory;
      const topCauses = Object.entries(proximate)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3);
      topCauses.forEach(([cause, deaths]) => {
        console.log(`     ${cause}: ${(deaths as number / 1000).toFixed(1)}B deaths`);
      });
    }
  }

  if (state.aiAgents && state.aiAgents.length > 0) {
    const avgCapability = state.aiAgents.reduce((sum, ai) => sum + (ai.capabilities?.cognitive ?? 0), 0) / state.aiAgents.length;
    console.log(`\n   AI Capability (avg): ${avgCapability.toFixed(2)}`);
  }

  if (state.humanPopulationSystem) {
    const initialPop = 8.0; // Assumed initial population
    const finalPop = state.humanPopulationSystem.population;
    const mortality = ((initialPop - finalPop) / initialPop) * 100;
    console.log(`   Population: ${finalPop.toFixed(2)}B (${mortality.toFixed(1)}% mortality)`);
  }

  if (state.globalMetrics) {
    console.log(`   QoL: ${state.globalMetrics.qualityOfLife?.toFixed(2) ?? 'N/A'}`);
  }

  if (state.society) {
    console.log(`   Trust: ${state.society.trust?.toFixed(2) ?? 'N/A'}`);
  }
  console.log('');

  console.log('💾 Summary:');
  console.log(`   Total runtime: ${(timings.total / 1000).toFixed(2)}s`);
  if (actualMonths > 0) {
    const avgMonth = timings.simulation / actualMonths;
    console.log(`   Average speed: ${avgMonth.toFixed(2)}ms/month`);
    console.log(`   Performance: ${((actualMonths / (timings.total / 1000))).toFixed(0)} months/second`);
  }
  console.log('');
}

// Run the test
runTimedSimulation().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
