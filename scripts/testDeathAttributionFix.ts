#!/usr/bin/env tsx
/**
 * Quick test to verify death attribution mismatch fix (Bug #1)
 *
 * Runs a short simulation and checks that:
 * - Proximate deaths ≈ Root deaths (within 10%)
 * - Both are in millions (not billions vs millions)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🧪 Testing Death Attribution Fix (Bug #1)\n');
console.log('='.repeat(60));

// Create a simple simulation
const state = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 123 });

// Run for 24 months
const maxMonths = 24;
console.log(`Running simulation for ${maxMonths} months...\n`);

let currentState = state;
for (let i = 0; i < maxMonths; i++) {
  const result = engine.step(currentState);
  currentState = result.state;

  if ((i + 1) % 6 === 0) {
    console.log(`  Month ${i + 1}/${maxMonths}...`);
  }
}

// Get final state
const finalState = currentState;
const pop = finalState.humanPopulationSystem;

// Calculate totals
const totalProximate = Object.values(pop.deathsByCategory).reduce((sum, v) => sum + v, 0);

// For root causes, sum only the cause fields (not compound or confidence)
const totalRoot =
  pop.deathsByRootCause.climate +
  pop.deathsByRootCause.resource +
  pop.deathsByRootCause.pollution +
  pop.deathsByRootCause.ecosystem +
  pop.deathsByRootCause.inequality +
  pop.deathsByRootCause.demographic +
  pop.deathsByRootCause.social +
  pop.deathsByRootCause.alignment +
  pop.deathsByRootCause.disruption +
  pop.deathsByRootCause.conflict +
  pop.deathsByRootCause.pandemic;

console.log('\n' + '='.repeat(60));
console.log('📊 RESULTS:\n');

console.log(`Proximate Causes (deathsByCategory):`);
console.log(`  War:       ${pop.deathsByCategory.war.toFixed(1)}M`);
console.log(`  Famine:    ${pop.deathsByCategory.famine.toFixed(1)}M`);
console.log(`  Disease:   ${pop.deathsByCategory.disease.toFixed(1)}M`);
console.log(`  Disasters: ${pop.deathsByCategory.disasters.toFixed(1)}M`);
console.log(`  Ecosystem: ${pop.deathsByCategory.ecosystem.toFixed(1)}M`);
console.log(`  Pollution: ${pop.deathsByCategory.pollution.toFixed(1)}M`);
console.log(`  AI:        ${pop.deathsByCategory.ai.toFixed(1)}M`);
console.log(`  Cascade:   ${pop.deathsByCategory.cascade.toFixed(1)}M`);
console.log(`  Other:     ${pop.deathsByCategory.other.toFixed(1)}M`);
console.log(`  TOTAL:     ${totalProximate.toFixed(1)}M\n`);

console.log(`Root Causes (deathsByRootCause):`);
console.log(`  Climate:     ${pop.deathsByRootCause.climate.toFixed(1)}M`);
console.log(`  Resource:    ${pop.deathsByRootCause.resource.toFixed(1)}M`);
console.log(`  Pollution:   ${pop.deathsByRootCause.pollution.toFixed(1)}M`);
console.log(`  Ecosystem:   ${pop.deathsByRootCause.ecosystem.toFixed(1)}M`);
console.log(`  Inequality:  ${pop.deathsByRootCause.inequality.toFixed(1)}M`);
console.log(`  Demographic: ${pop.deathsByRootCause.demographic.toFixed(1)}M`);
console.log(`  Social:      ${pop.deathsByRootCause.social.toFixed(1)}M`);
console.log(`  Alignment:   ${pop.deathsByRootCause.alignment.toFixed(1)}M`);
console.log(`  Disruption:  ${pop.deathsByRootCause.disruption.toFixed(1)}M`);
console.log(`  Conflict:    ${pop.deathsByRootCause.conflict.toFixed(1)}M`);
console.log(`  Pandemic:    ${pop.deathsByRootCause.pandemic.toFixed(1)}M`);
console.log(`  Compound:    ${pop.deathsByRootCause.compound.toFixed(1)}M`);
console.log(`  TOTAL:       ${totalRoot.toFixed(1)}M\n`);

// Validation
const difference = Math.abs(totalProximate - totalRoot);
const percentDiff = totalProximate > 0 ? (difference / totalProximate) * 100 : 0;

console.log('='.repeat(60));
console.log('✅ VALIDATION:\n');

console.log(`Proximate total: ${totalProximate.toFixed(1)}M`);
console.log(`Root total:      ${totalRoot.toFixed(1)}M`);
console.log(`Difference:      ${difference.toFixed(1)}M (${percentDiff.toFixed(1)}%)\n`);

if (percentDiff <= 10) {
  console.log('✅ PASS: Proximate ≈ Root deaths (within 10%)');
  console.log('✅ Bug #1 (Death Attribution Mismatch) is FIXED!\n');
} else {
  console.log('❌ FAIL: Proximate ≠ Root deaths (>10% difference)');
  console.log(`❌ Expected <10% difference, got ${percentDiff.toFixed(1)}%\n`);
  process.exit(1);
}

// Check units are reasonable (millions, not billions)
if (totalProximate > 1000000) {
  console.log(`❌ WARNING: Proximate deaths (${totalProximate.toFixed(0)}M) seems too large - might still be in wrong units`);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🎉 All checks passed!\n');
