#!/usr/bin/env tsx
/**
 * Build-time Phase Orchestrator Validation
 *
 * CRITICAL-2 (Nov 15, 2025): Validates phase dependencies at build time.
 * Fails fast if circular dependencies or order violations are detected.
 *
 * Usage:
 *   npx tsx scripts/validatePhaseOrchestrator.ts
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { SimulationEngine } from '../src/simulation/engine';

console.log('🔍 PHASE ORCHESTRATOR BUILD-TIME VALIDATION\n');
console.log('='.repeat(80));

try {
  // Create engine (this registers all phases)
  console.log('📝 Initializing simulation engine...');
  const engine = new SimulationEngine();

  console.log(`✅ Engine initialized with ${engine.getPhaseOrchestrator().getPhaseCount()} phases\n`);

  // Get the orchestrator
  const orchestrator = engine.getPhaseOrchestrator();

  // Print execution order
  console.log('📋 EXECUTION ORDER:');
  console.log('-'.repeat(80));
  const executionOrder = orchestrator.getExecutionOrder();
  executionOrder.forEach((phase, idx) => {
    console.log(`  ${(idx + 1).toString().padStart(3)}. ${phase}`);
  });
  console.log('-'.repeat(80));
  console.log(`  Total: ${executionOrder.length} phases\n`);

  // The orchestrator automatically validates on first use (during sortPhases)
  // which was already called by getExecutionOrder() above.
  // If there were cycles, it would have thrown by now.

  console.log('✅ VALIDATION PASSED\n');
  console.log('='.repeat(80));
  console.log('All phase dependencies are valid:');
  console.log('  ✓ No circular dependencies detected');
  console.log('  ✓ All dependency order numbers are correct');
  console.log('  ✓ All referenced phases exist');
  console.log('='.repeat(80));

  process.exit(0);
} catch (error) {
  console.error('\n❌ VALIDATION FAILED\n');
  console.error('='.repeat(80));

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }

  console.error('='.repeat(80));
  console.error('\nFix the errors above before proceeding.\n');

  process.exit(1);
}
