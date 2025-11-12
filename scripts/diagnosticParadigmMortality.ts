/**
 * Diagnostic: Paradigm Scoring During Extreme Mortality
 *
 * INVESTIGATION: GitHub Issue (Monte Carlo validation - paradigm scores during collapse)
 *
 * QUESTION: Why do Western Liberal paradigm scores stay at 58-77 during 92% mortality events?
 *
 * HYPOTHESIS:
 * - Paradigm scoring uses per-capita/structural metrics (democracy, civil liberties, rule of law)
 * - These metrics are NOT directly affected by absolute population mortality
 * - Result: "Elite utopia" scoring - surviving 8% maintain high scores
 *
 * This script tests the hypothesis by:
 * 1. Running simulation with forced extreme mortality (90%+ deaths)
 * 2. Logging paradigm components before and after mortality event
 * 3. Checking if democracy/civil liberties/rule of law drop proportionally
 *
 * @module scripts/diagnosticParadigmMortality
 */

import { createDefaultInitialState } from '@/simulation/initialization';
import type { GameState } from '@/types/game';
import { updateSimulation } from '@/simulation/engine';
import { SimulationEngine } from '@/simulation/engine';

/**
 * Log paradigm components and population
 */
function logParadigmState(state: GameState, label: string): void {
  const pop = state.humanPopulationSystem.population;
  const western = state.multiParadigmDUI.paradigmScores.western.value;
  const development = state.multiParadigmDUI.paradigmScores.development.value;
  const ecological = state.multiParadigmDUI.paradigmScores.ecological.value;
  const indigenous = state.multiParadigmDUI.diagnosticLenses.indigenous.value;

  console.log(`\n=== ${label} ===`);
  console.log(`  Month: ${state.currentMonth}`);
  console.log(`  Population: ${pop.toFixed(3)}B (${(pop * 1e9).toLocaleString()} people)`);
  console.log(`\n  Paradigm Scores:`);
  console.log(`    Western Liberal: ${western.toFixed(1)}/100`);
  console.log(`    Development: ${development.toFixed(1)}/100`);
  console.log(`    Ecological: ${ecological.toFixed(1)}/100`);
  console.log(`    Indigenous: ${indigenous.toFixed(1)}/100`);

  // Log Western components (if available)
  if (state.multiParadigmDUI.westernLiberalComponents && state.multiParadigmDUI.westernLiberalComponents.length > 0) {
    const latest = state.multiParadigmDUI.westernLiberalComponents[state.multiParadigmDUI.westernLiberalComponents.length - 1];
    console.log(`\n  Western Liberal Components:`);
    console.log(`    Electoral Democracy: ${latest.electoralDemocracy.toFixed(1)}/100`);
    console.log(`    Civil Liberties: ${latest.civilLiberties.toFixed(1)}/100`);
    console.log(`    Rule of Law: ${latest.ruleOfLaw.toFixed(1)}/100`);
    console.log(`    Economic Freedom: ${latest.economicFreedom.toFixed(1)}/100`);
    console.log(`    Privacy Freedom: ${latest.privacyFreedom.toFixed(1)}/100`);
  }

  // Log underlying structural metrics
  console.log(`\n  Underlying Structural Metrics:`);
  console.log(`    democracy (0-1): ${state.government.democracy.toFixed(3)}`);
  console.log(`    civilLiberties (0-100): ${state.socialAccumulation.socialCohesion.civilLiberties.toFixed(1)}`);
  console.log(`    institutionalLegitimacy (0-1): ${state.socialAccumulation.institutionalLegitimacy.toFixed(3)}`);
  console.log(`    socialCohesion.trust (0-100): ${state.socialAccumulation.socialCohesion.trust.toFixed(1)}`);
  console.log(`    socialCohesion.communityBonds (0-100): ${state.socialAccumulation.socialCohesion.communityBonds.toFixed(1)}`);

  // Log quality of life (Development paradigm driver)
  console.log(`\n  Quality of Life (Development driver):`);
  console.log(`    overall QoL (0-1): ${state.globalMetrics.qualityOfLife.toFixed(3)}`);
  console.log(`    foodSecurity (0-1): ${state.qualityOfLifeSystems.survivalFundamentals.foodSecurity.toFixed(3)}`);
  console.log(`    waterSecurity (0-1): ${state.qualityOfLifeSystems.survivalFundamentals.waterSecurity.toFixed(3)}`);
  console.log(`    healthcareQuality (0-1): ${state.qualityOfLifeSystems.healthcareQuality.toFixed(3)}`);
}

/**
 * Force extreme mortality event (simulate nuclear war, pandemic, etc.)
 */
function forceExtremeMortality(state: GameState, mortalityRate: number): void {
  const initialPop = state.humanPopulationSystem.population;
  const survivors = initialPop * (1 - mortalityRate);
  state.humanPopulationSystem.population = survivors;

  console.log(`\n🔥 FORCING EXTREME MORTALITY EVENT:`);
  console.log(`   Initial population: ${initialPop.toFixed(3)}B`);
  console.log(`   Mortality rate: ${(mortalityRate * 100).toFixed(1)}%`);
  console.log(`   Survivors: ${survivors.toFixed(3)}B`);
  console.log(`   Deaths: ${(initialPop - survivors).toFixed(3)}B`);
}

/**
 * Main diagnostic
 */
async function runDiagnostic(): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DIAGNOSTIC: Paradigm Scoring During Extreme Mortality`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nQUESTION: Why do Western Liberal scores stay high during 92% mortality?`);
  console.log(`\nHYPOTHESIS: Paradigm scoring uses per-capita metrics (democracy, civil liberties)`);
  console.log(`            These are NOT affected by absolute mortality count.`);
  console.log(`            Result: "Elite utopia" - surviving 8% maintain high institutional scores.`);

  // Create simulation engine (provides RNG)
  const seed = 'paradigm-mortality-diagnostic-001';
  const engine = new SimulationEngine({ seed, maxMonths: 120, logLevel: 'summary' });
  const seededRng = engine.getRNG();
  const rng = seededRng.next.bind(seededRng);
  const state = createDefaultInitialState(rng);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`PHASE 1: BASELINE (Initial State, Month 0)`);
  console.log(`${'='.repeat(80)}`);
  logParadigmState(state, 'Initial State (Before Simulation)');

  // Run simulation for 12 months to establish baseline
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PHASE 2: NORMAL OPERATION (12 months)`);
  console.log(`${'='.repeat(80)}`);

  for (let month = 1; month <= 12; month++) {
    updateSimulation(state, rng);
  }

  logParadigmState(state, 'After 12 Months Normal Operation');

  // Force extreme mortality (92% death rate)
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PHASE 3: EXTREME MORTALITY EVENT (92% mortality)`);
  console.log(`${'='.repeat(80)}`);

  forceExtremeMortality(state, 0.92);

  // Continue simulation for 1 month to trigger paradigm recalculation
  updateSimulation(state, rng);

  logParadigmState(state, 'Immediately After 92% Mortality');

  // Continue for another 11 months to see if scores drop over time
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PHASE 4: POST-MORTALITY TRAJECTORY (11 more months)`);
  console.log(`${'='.repeat(80)}`);

  for (let month = 1; month <= 11; month++) {
    updateSimulation(state, rng);
  }

  logParadigmState(state, 'After 11 Months Post-Mortality');

  // ANALYSIS
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYSIS`);
  console.log(`${'='.repeat(80)}`);

  const western = state.multiParadigmDUI.paradigmScores.western.value;
  const development = state.multiParadigmDUI.paradigmScores.development.value;

  console.log(`\nFINDINGS:`);
  if (western >= 50) {
    console.log(`  ✅ HYPOTHESIS CONFIRMED: Western Liberal score is ${western.toFixed(1)}/100 despite 92% mortality`);
    console.log(`     This suggests per-capita/structural metrics are NOT directly affected by mortality.`);
  } else {
    console.log(`  ❌ HYPOTHESIS REJECTED: Western Liberal score dropped to ${western.toFixed(1)}/100`);
    console.log(`     This suggests mortality DOES affect paradigm scoring (directly or indirectly).`);
  }

  if (development >= 50) {
    console.log(`  ⚠️ Development score is ${development.toFixed(1)}/100 - also seems unaffected by mortality`);
  } else {
    console.log(`  ✅ Development score dropped to ${development.toFixed(1)}/100 - mortality affects survival metrics`);
  }

  console.log(`\nRECOMMENDATIONS:`);
  if (western >= 50) {
    console.log(`  1. ADD MORTALITY WEIGHTING: Paradigm scores should account for absolute deaths, not just per-capita metrics`);
    console.log(`     - Research question: Does democracy/rule of law persist during mass mortality?`);
    console.log(`     - Historical precedent: Black Death (50% mortality) → social upheaval, authority collapse`);
    console.log(`  2. OR CLARIFY: Add explanatory logging to make "elite utopia" scoring explicit`);
    console.log(`     - If this is accurate representation of concentrated survival, document it`);
    console.log(`  3. DISTINGUISH: Per-capita vs absolute metrics (GDP/capita vs total GDP)`);
  } else {
    console.log(`  1. CURRENT BEHAVIOR IS CORRECT: Mortality does affect paradigm scores appropriately`);
    console.log(`  2. DOCUMENT: Add research justification for how mortality affects each paradigm`);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`DIAGNOSTIC COMPLETE`);
  console.log(`${'='.repeat(80)}`);
}

// Run diagnostic
runDiagnostic().catch((error) => {
  console.error(`❌ Diagnostic failed:`, error);
  process.exit(1);
});
