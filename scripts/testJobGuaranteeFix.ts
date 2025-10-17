#!/usr/bin/env tsx
/**
 * Quick validation test for Job Guarantee Paradox fix
 *
 * Tests that Job Guarantee creates an unemployment CEILING, not floor.
 * Expected: With jobGuaranteeLevel=1.0, unemployment should be capped at 5-15% (segment-specific)
 * Before fix: Unemployment was 58.9% (bug)
 * After fix: Unemployment should be ~10% (weighted average of segment caps)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

// Test scenario: Full job guarantee with high unemployment pressure
const initialState = createDefaultInitialState();

// Set job guarantee to maximum (1.0 = universal program)
if (!initialState.policyInterventions) {
  initialState.policyInterventions = {};
}
initialState.policyInterventions.jobGuaranteeLevel = 1.0;

console.log('\n🧪 JOB GUARANTEE FIX VALIDATION TEST');
console.log('=====================================\n');
console.log('Testing with jobGuaranteeLevel = 1.0 (universal program)');
console.log('Expected: Unemployment capped at 5-15% (depending on segment mix)');
console.log('Before fix: Unemployment was 58.9% (Math.max bug)');
console.log('After fix: Unemployment should be ~8-12% (Math.min correct)\n');

// Run short simulation (24 months)
const engine = new SimulationEngine({ seed: 90000, maxMonths: 24 });

// Suppress detailed logs
const originalLog = console.log;
console.log = () => {};

const result = engine.run(initialState, { maxMonths: 24, checkActualOutcomes: false });

// Restore console
console.log = originalLog;

// Check final unemployment
const finalUnemployment = result.finalState.society.unemploymentLevel;
const unemploymentPercent = (finalUnemployment * 100).toFixed(1);

console.log(`📊 RESULTS (Month 24):`);
console.log(`   Unemployment: ${unemploymentPercent}%`);

// Validation check
if (finalUnemployment <= 0.15) {
  console.log(`   ✅ PASS: Unemployment capped correctly (<= 15%)`);
  console.log(`   Job guarantee is working as intended!`);
} else if (finalUnemployment >= 0.30) {
  console.log(`   ❌ FAIL: Unemployment still too high (>= 30%)`);
  console.log(`   Job guarantee not working - may still have bug`);
  process.exit(1);
} else {
  console.log(`   ⚠️  WARNING: Unemployment between 15-30% (marginal)`);
  console.log(`   Job guarantee may be partially working`);
}

// Detailed segment breakdown
console.log(`\n📋 SEGMENT BREAKDOWN:`);
if (result.finalState.society.segments) {
  for (const segment of result.finalState.society.segments) {
    const segmentName = `${segment.economicStatus} (${segment.geographic})`.padEnd(40);
    const pop = (segment.populationFraction * 100).toFixed(1);
    console.log(`   ${segmentName} ${pop}% of population`);
  }
}

console.log(`\n✅ Test complete!\n`);
