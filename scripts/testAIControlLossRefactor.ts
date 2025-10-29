/**
 * Test script for AI Control Loss refactoring (Oct 28, 2025)
 *
 * Validates:
 * 1. Control loss no longer applies direct mortality
 * 2. Western Liberal paradigm score is impacted by control loss
 * 3. aiControlGap metric is calculated correctly
 * 4. Other paradigms are not affected by control loss
 */

import { createTestState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import type { RNGFunction } from '../src/types/game';

// Create a deterministic RNG for testing
function createSeededRNG(seed: number): RNGFunction {
  let state = seed;
  return function rng() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function testAIControlLossRefactor() {
  console.log('\n=== AI Control Loss Refactor Test ===\n');

  const rng = createSeededRNG(42);
  const state = createTestState();
  const engine = new SimulationEngine(state, rng);

  // Store initial state
  const initialPopulation = state.humanPopulationSystem.total;
  const initialWesternScore = state.multiParadigmDUI.paradigmScores.western.value;
  const initialDevelopmentScore = state.multiParadigmDUI.paradigmScores.development.value;

  console.log(`Initial state (Month 0):`);
  console.log(`  Population: ${(initialPopulation / 1e9).toFixed(2)}B`);
  console.log(`  Western Liberal: ${initialWesternScore.toFixed(1)}`);
  console.log(`  Development: ${initialDevelopmentScore.toFixed(1)}`);
  console.log(`  Control Loss Active: ${state.technologicalRisk.controlLossActive}`);
  console.log(`  AI Control Gap: ${(state.technologicalRisk.aiControlGap || 0).toFixed(3)}`);

  // Force control loss by setting high misalignment risk
  state.technologicalRisk.misalignmentRisk = 0.75;
  state.technologicalRisk.safetyDebt = 0.65;

  console.log(`\nForcing control loss conditions...`);
  console.log(`  Misalignment Risk: ${(state.technologicalRisk.misalignmentRisk * 100).toFixed(0)}%`);
  console.log(`  Safety Debt: ${(state.technologicalRisk.safetyDebt * 100).toFixed(0)}%`);

  // Run simulation for 3 months to trigger control loss
  for (let i = 0; i < 3; i++) {
    engine.step();
  }

  const afterControlLoss = state.technologicalRisk.controlLossActive;
  const afterPopulation = state.humanPopulationSystem.total;
  const afterWesternScore = state.multiParadigmDUI.paradigmScores.western.value;
  const afterDevelopmentScore = state.multiParadigmDUI.paradigmScores.development.value;
  const aiControlGap = state.technologicalRisk.aiControlGap || 0;

  console.log(`\nAfter control loss (Month 3):`);
  console.log(`  Control Loss Active: ${afterControlLoss}`);
  console.log(`  AI Control Gap: ${aiControlGap.toFixed(3)}`);
  console.log(`  Population: ${(afterPopulation / 1e9).toFixed(2)}B`);
  console.log(`  Population change: ${((afterPopulation - initialPopulation) / 1e9).toFixed(3)}B`);
  console.log(`  Western Liberal: ${afterWesternScore.toFixed(1)} (Δ ${(afterWesternScore - initialWesternScore).toFixed(1)})`);
  console.log(`  Development: ${afterDevelopmentScore.toFixed(1)} (Δ ${(afterDevelopmentScore - initialDevelopmentScore).toFixed(1)})`);

  // Check component breakdown if available
  if (state.multiParadigmDUI.westernLiberalComponents && state.multiParadigmDUI.westernLiberalComponents.length > 0) {
    const latestComponents = state.multiParadigmDUI.westernLiberalComponents[state.multiParadigmDUI.westernLiberalComponents.length - 1];
    console.log(`\nWestern Liberal component breakdown:`);
    console.log(`  Electoral Democracy: ${latestComponents.electoralDemocracy.toFixed(1)}`);
    console.log(`  Civil Liberties: ${latestComponents.civilLiberties.toFixed(1)}`);
    console.log(`  Rule of Law: ${latestComponents.ruleOfLaw.toFixed(1)}`);
    console.log(`  Economic Freedom: ${latestComponents.economicFreedom.toFixed(1)}`);
    console.log(`  Privacy Freedom: ${latestComponents.privacyFreedom.toFixed(1)}`);
  }

  // Validation checks
  console.log(`\n=== VALIDATION RESULTS ===`);

  // Check 1: Control loss should be active
  const check1 = afterControlLoss;
  console.log(`✓ Check 1: Control loss triggered: ${check1 ? '✅ PASS' : '❌ FAIL'}`);

  // Check 2: Population should NOT have immediate mass mortality from control loss
  // (Small changes from normal mortality are OK, but no 1.2% hit)
  const populationChange = (initialPopulation - afterPopulation) / initialPopulation;
  const check2 = populationChange < 0.02; // Less than 2% change over 3 months
  console.log(`✓ Check 2: No direct control loss mortality: ${check2 ? '✅ PASS' : '❌ FAIL'} (${(populationChange * 100).toFixed(2)}% change)`);

  // Check 3: Western Liberal score should drop (democracy + rule of law penalties)
  const westernDrop = initialWesternScore - afterWesternScore;
  const check3 = westernDrop > 5; // Should drop by at least 5 points
  console.log(`✓ Check 3: Western Liberal paradigm impacted: ${check3 ? '✅ PASS' : '❌ FAIL'} (${westernDrop.toFixed(1)} point drop)`);

  // Check 4: aiControlGap metric should be calculated
  const check4 = aiControlGap > 0;
  console.log(`✓ Check 4: aiControlGap metric calculated: ${check4 ? '✅ PASS' : '❌ FAIL'} (${aiControlGap.toFixed(3)})`);

  // Check 5: Development paradigm should NOT be significantly affected by control loss alone
  // (May change slightly due to QoL impacts, but not the -15/-20 penalties)
  const developmentChange = Math.abs(afterDevelopmentScore - initialDevelopmentScore);
  const check5 = developmentChange < 10; // Less than 10 point change
  console.log(`✓ Check 5: Development paradigm not directly penalized: ${check5 ? '✅ PASS' : '❌ FAIL'} (${developmentChange.toFixed(1)} point change)`);

  const allPassed = check1 && check2 && check3 && check4 && check5;
  console.log(`\n${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

try {
  testAIControlLossRefactor();
} catch (error) {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
}
