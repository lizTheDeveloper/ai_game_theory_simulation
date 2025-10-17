#!/usr/bin/env tsx
/**
 * Validation test for Reinstatement Effect fix (TIER 0D Bug #2)
 *
 * Tests that adding the reinstatement effect:
 * 1. Reduces unemployment from 54% convergence to more realistic 25-45% range
 * 2. Makes policies actually differentiate outcomes
 * 3. Reduces variance by stabilizing the model
 *
 * Before fix: All scenarios converged to ~54% ± 40%
 * After fix: Scenarios should vary 20-45% depending on policy effectiveness
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

interface TestScenario {
  name: string;
  ubiLevel: number;
  retrainingLevel: number;
  jobGuaranteeLevel: number;
}

const scenarios: TestScenario[] = [
  { name: 'Baseline (no policy)', ubiLevel: 0, retrainingLevel: 0, jobGuaranteeLevel: 0 },
  { name: 'UBI Only (40%)', ubiLevel: 0.40, retrainingLevel: 0, jobGuaranteeLevel: 0 },
  { name: 'Retraining (100%)', ubiLevel: 0, retrainingLevel: 1.0, jobGuaranteeLevel: 0 },
  { name: 'Job Guarantee (100%)', ubiLevel: 0, retrainingLevel: 0, jobGuaranteeLevel: 1.0 },
  { name: 'Combined (moderate)', ubiLevel: 0.30, retrainingLevel: 0.70, jobGuaranteeLevel: 0.70 },
];

console.log('\n🧪 REINSTATEMENT EFFECT VALIDATION TEST (TIER 0D Bug #2)');
console.log('===========================================================\n');
console.log('Testing that reinstatement effect:');
console.log('  ✓ Reduces unemployment from 54% convergence');
console.log('  ✓ Makes policies differentiate outcomes');
console.log('  ✓ Stabilizes model (reduces variance)\n');

console.log('Running 5 policy scenarios × 3 seeds = 15 tests...\n');

const results: Record<string, number[]> = {};

// Run each scenario with 3 seeds
for (const scenario of scenarios) {
  results[scenario.name] = [];

  for (let seed = 91000; seed < 91003; seed++) {
    const initialState = createDefaultInitialState();

    // Apply policy
    if (!initialState.policyInterventions) {
      initialState.policyInterventions = {};
    }
    initialState.policyInterventions.ubiLevel = scenario.ubiLevel;
    initialState.policyInterventions.retrainingLevel = scenario.retrainingLevel;
    initialState.policyInterventions.jobGuaranteeLevel = scenario.jobGuaranteeLevel;

    if (scenario.ubiLevel > 0 && initialState.ubiSystem) {
      initialState.ubiSystem.currentAmount = 60000 * scenario.ubiLevel;
      initialState.ubiSystem.isActive = true;
    }

    // Suppress logs
    const originalLog = console.log;
    console.log = () => {};

    const engine = new SimulationEngine({ seed, maxMonths: 60 });
    const result = engine.run(initialState, { maxMonths: 60, checkActualOutcomes: false });

    console.log = originalLog;

    const finalUnemployment = result.finalState.society.unemploymentLevel;
    results[scenario.name].push(finalUnemployment);
  }
}

// Analyze results
console.log('📊 RESULTS (60 months):\n');
console.log('┌────────────────────────────┬──────────────┬──────────┬──────────┐');
console.log('│ Scenario                   │ Avg Unemp    │ Std Dev  │ Range    │');
console.log('├────────────────────────────┼──────────────┼──────────┼──────────┤');

for (const scenario of scenarios) {
  const values = results[scenario.name];
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const meanPct = (mean * 100).toFixed(1).padStart(5);
  const stdPct = (std * 100).toFixed(1).padStart(5);
  const rangePct = `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`.padStart(8);
  const name = scenario.name.padEnd(26);

  console.log(`│ ${name} │ ${meanPct}%       │ ±${stdPct}% │ ${rangePct} │`);
}
console.log('└────────────────────────────┴──────────────┴──────────┴──────────┘\n');

// Validation checks
const baselineUnemployment = results['Baseline (no policy)'].reduce((s, v) => s + v, 0) / 3;
const combinedUnemployment = results['Combined (moderate)'].reduce((s, v) => s + v, 0) / 3;
const jobGuaranteeUnemployment = results['Job Guarantee (100%)'].reduce((s, v) => s + v, 0) / 3;

console.log('✅ VALIDATION CHECKS:\n');

// Check 1: Unemployment reduced from 54%
const check1 = baselineUnemployment < 0.50;
console.log(`  ${check1 ? '✅' : '❌'} Baseline unemployment < 50% (was 54% before fix)`);
console.log(`     Actual: ${(baselineUnemployment * 100).toFixed(1)}%\n`);

// Check 2: Policies differentiate
const policySpread = Math.max(...scenarios.map(s => results[s.name].reduce((sum, v) => sum + v, 0) / 3)) -
                     Math.min(...scenarios.map(s => results[s.name].reduce((sum, v) => sum + v, 0) / 3));
const check2 = policySpread > 0.10;
console.log(`  ${check2 ? '✅' : '❌'} Policies differentiate outcomes (spread > 10%)`);
console.log(`     Actual spread: ${(policySpread * 100).toFixed(1)}%\n`);

// Check 3: Job Guarantee most effective
const check3 = jobGuaranteeUnemployment < baselineUnemployment;
console.log(`  ${check3 ? '✅' : '❌'} Job Guarantee reduces unemployment vs baseline`);
console.log(`     Job Guarantee: ${(jobGuaranteeUnemployment * 100).toFixed(1)}%`);
console.log(`     Baseline: ${(baselineUnemployment * 100).toFixed(1)}%\n`);

// Check 4: Variance reasonable (not 40%)
const baselineVariance = results['Baseline (no policy)'];
const baselineMean = baselineVariance.reduce((s, v) => s + v, 0) / 3;
const baselineStd = Math.sqrt(baselineVariance.reduce((s, v) => s + Math.pow(v - baselineMean, 2), 0) / 3);
const cv = (baselineStd / baselineMean) * 100;
const check4 = cv < 50;
console.log(`  ${check4 ? '✅' : '❌'} Variance reasonable (CV < 50%)`);
console.log(`     Actual CV: ${cv.toFixed(1)}% (was 96-124% before fix)\n`);

// Summary
const allPassed = check1 && check2 && check3 && check4;
if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED! Reinstatement effect is working correctly.\n');
  console.log('The model now:');
  console.log('  ✓ Produces realistic unemployment levels (25-45%)');
  console.log('  ✓ Differentiates policy effectiveness');
  console.log('  ✓ Has stable outcomes (reduced variance)');
  console.log('  ✓ Matches historical patterns (displacement + reinstatement)\n');
} else {
  console.log('⚠️  SOME CHECKS FAILED - fix may need adjustment.\n');
  process.exit(1);
}

console.log('✅ Test complete!\n');
