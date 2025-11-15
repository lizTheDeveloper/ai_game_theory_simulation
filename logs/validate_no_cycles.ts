#!/usr/bin/env npx tsx
/**
 * Validate that NO circular dependencies exist in phase graph
 * Roy's paranoia check (Nov 15, 2025)
 */

import { initializeSimulation } from '../src/simulation/initialization.js';

console.log('🔍 Checking for circular dependencies in phase graph...\n');

try {
  const rng = () => Math.random(); // Simple RNG for validation
  const { orchestrator } = initializeSimulation({ rng });

  console.log('✅ Phase orchestrator initialized successfully');
  console.log(`   Registered phases: ${orchestrator.getPhaseCount()}\n`);

  console.log('📊 Execution order:');
  const order = orchestrator.getExecutionOrder();
  order.forEach((phase, i) => {
    console.log(`   ${String(i + 1).padStart(2)}. ${phase}`);
  });

  console.log('\n✅ NO CIRCULAR DEPENDENCIES DETECTED');
  console.log('   PhaseOrchestrator.validateDependencies() passed at initialization');

} catch (error: any) {
  if (error.message.includes('CIRCULAR DEPENDENCY')) {
    console.error('❌ CIRCULAR DEPENDENCY DETECTED:\n');
    console.error(error.message);
    process.exit(1);
  } else {
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(2);
  }
}
