/**
 * Phase Dependency Validation Script
 *
 * Validates that all phase dependencies reference valid phases
 * and that the phase dependency graph is valid (no cycles, correct ordering)
 */

import { SimulationEngine } from '../src/simulation/engine';

console.log('🔍 PHASE DEPENDENCY VALIDATION');
console.log('='.repeat(80));

try {
  // Create engine (which registers all phases)
  const engine = new SimulationEngine({
    enableLogging: false,
    logPath: '/tmp/validation.log',
    enableDiagnostics: false
  });

  // Access the phase orchestrator
  const orchestrator = (engine as any).orchestrator;

  console.log(`\n📊 Phase Statistics:`);
  console.log(`   Total phases registered: ${orchestrator.getPhaseCount()}`);

  // Validate all dependencies
  console.log(`\n🔍 Validating phase dependency graph...`);
  orchestrator.validate();

  console.log(`\n✅ VALIDATION PASSED`);
  console.log(`   All phase dependencies reference valid phases`);
  console.log(`   No circular dependencies detected`);
  console.log(`   All order constraints satisfied`);

  // Print execution order for reference
  console.log(`\n📋 Phase Execution Order:`);
  const executionOrder = orchestrator.getExecutionOrder();
  executionOrder.slice(0, 10).forEach((phase: string) => {
    console.log(`   ${phase}`);
  });
  console.log(`   ... (${executionOrder.length - 10} more phases)`);

  process.exit(0);
} catch (error: any) {
  console.error(`\n❌ VALIDATION FAILED`);
  console.error(`\nError Details:`);
  console.error(error.message);
  process.exit(1);
}
