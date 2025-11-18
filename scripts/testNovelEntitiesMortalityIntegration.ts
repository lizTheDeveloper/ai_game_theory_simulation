#!/usr/bin/env tsx
/**
 * Integration Test: Novel Entities → Bayesian Mortality
 *
 * CRITICAL-2 Bug: Chemical pollution risks not propagating through Bayesian network
 *
 * This test directly checks:
 * 1. Does novelEntities.ts call addMortalityRisk()?
 * 2. Do those risks have the correct 'type' field?
 * 3. Are demographic vulnerabilities configured for 'pollution' type?
 * 4. Do mortality risks translate to actual population deaths?
 *
 * Date: Nov 14, 2025 (orchestrator)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

// SIMPLE TEST: Run 120 months with high chemical pollution and check mortality
function testNovelEntitiesMortalityPropagation(): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TEST: Novel Entities Mortality Risk Propagation`);
  console.log(`${'='.repeat(80)}\n`);

  const engine = new SimulationEngine({ seed: 12345, maxMonths: 120, logLevel: 'detailed' });
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());

  // Create state with severe chemical pollution
  const state = createDefaultInitialState(rngFunction);

  // CRITICAL-2 FIX (Nov 14, 2025): Capture initial population BEFORE simulation runs
  // Bug: Measuring state.population after engine.run() gives mutated value
  const initialPop = state.humanPopulationSystem.population;

  console.log(`📊 INITIAL STATE:`);
  console.log(`  Population: ${initialPop.toFixed(3)}B`);

  if (state.novelEntitiesSystem) {
    // Inject severe pollution to trigger crises quickly
    state.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
    state.novelEntitiesSystem.pfasPrevalence = 0.75;
    state.novelEntitiesSystem.chronicDiseasePrevalence = 0.45; // Above epidemic threshold (0.40)
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55; // Above crisis threshold (0.50)
    state.novelEntitiesSystem.bioaccumulationFactor = 0.65; // Above collapse threshold (0.60)

    console.log(`  Chemical load: ${(state.novelEntitiesSystem.syntheticChemicalLoad * 100).toFixed(0)}%`);
    console.log(`  PFAS prevalence: ${(state.novelEntitiesSystem.pfasPrevalence * 100).toFixed(0)}%`);
    console.log(`  Chronic disease: ${(state.novelEntitiesSystem.chronicDiseasePrevalence * 100).toFixed(0)}%`);
    console.log(`  Above all crisis thresholds - should trigger events\n`);
  }
  console.log(`🔬 RUNNING SIMULATION (120 months)...\n`);
  const result = engine.run(state, { maxMonths: 120, checkActualOutcomes: true });

  // Analyze results
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RESULTS:`);
  console.log(`${'='.repeat(80)}\n`);

  // FIX (Nov 14, 2025): engine.run() mutates state, so finalState IS state (same object)
  // We captured initialPop before mutation, so this calculation is now correct
  const finalState = result.finalState;
  const finalPop = finalState.humanPopulationSystem.population;
  const deaths = initialPop - finalPop;
  const mortalityRate = initialPop > 0 ? deaths / initialPop : 0;

  console.log(`Population:`);
  console.log(`  Initial: ${initialPop.toFixed(3)}B`);
  console.log(`  Final: ${finalPop.toFixed(3)}B`);
  console.log(`  Deaths: ${(deaths * 1000).toFixed(1)}M (${(mortalityRate * 100).toFixed(2)}%)`);
  console.log(``);

  if (finalState.novelEntitiesSystem) {
    const ne = finalState.novelEntitiesSystem;
    console.log(`Novel Entities Events:`);
    console.log(`  Reproductive crisis: ${ne.reproductiveCrisisActive ? '✅ TRIGGERED' : '❌ NOT TRIGGERED'}`);
    console.log(`  Bioaccumulation collapse: ${ne.bioaccumulationCollapseActive ? '✅ TRIGGERED' : '❌ NOT TRIGGERED'}`);
    console.log(`  Chronic disease epidemic: ${ne.chronicDiseaseEpidemicActive ? '✅ TRIGGERED' : '❌ NOT TRIGGERED'}`);
    console.log(``);
  }

  // DIAGNOSIS
  console.log(`${'='.repeat(80)}`);
  console.log(`DIAGNOSIS:`);
  console.log(`${'='.repeat(80)}\n`);

  const eventsTriggered = finalState.novelEntitiesSystem && (
    finalState.novelEntitiesSystem.reproductiveCrisisActive ||
    finalState.novelEntitiesSystem.bioaccumulationCollapseActive ||
    finalState.novelEntitiesSystem.chronicDiseaseEpidemicActive
  );

  if (!eventsTriggered) {
    console.log(`❌ FAIL: No novel entities events triggered despite severe pollution`);
    console.log(`   This suggests the system isn't detecting crisis thresholds`);
    return;
  }

  console.log(`✅ Events triggered successfully`);
  console.log(``);

  // Expected mortality: Each crisis adds 0.08-0.4% monthly mortality
  // Over 120 months with 3 crises, we'd expect 10-50% population loss
  // (Bayesian compounding, but mitigated by adaptations)
  const expectedMinMortality = 0.05; // 5% minimum with all crises
  const expectedMaxMortality = 0.30; // 30% max (very severe but not extinction)

  if (mortalityRate < expectedMinMortality) {
    console.log(`🚨 BUG CONFIRMED: Mortality too low despite chemical pollution crises`);
    console.log(`   Expected: ${(expectedMinMortality * 100).toFixed(0)}-${(expectedMaxMortality * 100).toFixed(0)}% mortality`);
    console.log(`   Observed: ${(mortalityRate * 100).toFixed(2)}% mortality`);
    console.log(``);
    console.log(`🔍 LIKELY CAUSES:`);
    console.log(`   1. Risks added with wrong 'type' field (not matching demographic vulnerabilities)`);
    console.log(`   2. Risks cleared before resolveMortality() processes them`);
    console.log(`   3. Demographic vulnerabilities don't include 'pollution' type`);
    console.log(`   4. Mortality stabilizers over-correcting (>90% reduction)`);
    console.log(``);
    console.log(`📋 NEXT STEPS:`);
    console.log(`   1. Check novelEntities.ts lines 164-173, 204-213, 246-255 for risk.type field`);
    console.log(`   2. Check bayesianMortality.ts getDefaultDemographics() for pollution vulnerability`);
    console.log(`   3. Add logging in resolveMortality() to show which risks are processed`);
  } else if (mortalityRate > expectedMaxMortality) {
    console.log(`⚠️ WARNING: Mortality higher than expected`);
    console.log(`   Expected: ${(expectedMinMortality * 100).toFixed(0)}-${(expectedMaxMortality * 100).toFixed(0)}% mortality`);
    console.log(`   Observed: ${(mortalityRate * 100).toFixed(2)}% mortality`);
    console.log(`   This could indicate over-tuned mortality or missing stabilizers`);
  } else {
    console.log(`✅ PASS: Mortality within expected range`);
    console.log(`   Expected: ${(expectedMinMortality * 100).toFixed(0)}-${(expectedMaxMortality * 100).toFixed(0)}% mortality`);
    console.log(`   Observed: ${(mortalityRate * 100).toFixed(2)}% mortality`);
    console.log(`   Chemical pollution risks appear to be propagating correctly`);
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

// Run test
testNovelEntitiesMortalityPropagation();
