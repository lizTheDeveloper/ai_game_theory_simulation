/**
 * Validation Script: Nuclear Winter → Agriculture Feedback (HIGH #8)
 *
 * Tests the integration between nuclear winter and food security:
 * 1. Food security degrades during peak nuclear winter (0-24 months)
 * 2. Food security recovers after month 24 as crops improve
 * 3. Recovery stops at 80% cap (infrastructure damage)
 *
 * Expected pattern:
 * - Month 0-12: Normal food security (~90%+)
 * - Month 12: Nuclear war triggered
 * - Month 12-36: Severe degradation (drops to 20-40%)
 * - Month 36-60: Gradual recovery (climbs back to ~70-80%)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { triggerNuclearWinter } from '../src/simulation/nuclearWinter';

interface FoodSecuritySnapshot {
  month: number;
  globalFoodSecurity: number;
  nuclearWinterActive: boolean;
  monthsSinceWar: number;
  cropYield: number;
  temperatureAnomaly: number;
  sootRemaining: number;
  regionalFoodSecurity: { name: string; food: number }[];
}

async function runValidation() {
  console.log('=== NUCLEAR WINTER → AGRICULTURE FEEDBACK VALIDATION ===\n');

  const seed = 42000;

  // Create RNG from seed
  let rngState = seed;
  const rng = () => {
    rngState = (rngState * 9301 + 49297) % 233280;
    return rngState / 233280;
  };

  const initialState = createDefaultInitialState(rng, 'historical');

  // Trigger nuclear war immediately
  console.log('☢️  TRIGGERING NUCLEAR WAR (500 warheads, regional nuclear exchange)\n');
  triggerNuclearWinter(initialState, 500, ['USA', 'Russia', 'China'], rng);

  // Run simulation for 60 months
  console.log('Running 60-month simulation...\n');
  const engine = new SimulationEngine({ seed, maxMonths: 60, logLevel: 'quiet' });
  const result = engine.run(initialState, { maxMonths: 60, checkActualOutcomes: false });

  const finalState = result.finalState;
  const snapshots: FoodSecuritySnapshot[] = [];

  // Extract snapshots from history (every 6 months)
  for (let month = 0; month <= 60; month += 6) {
    // For simplicity, we'll just check the final state
    // In a real implementation, you'd need to access history snapshots
    if (month === 60) {

    // Take snapshot every 6 months
    if (month % 6 === 0 || month === 12 || month === 36) {
      const globalFood = state.qualityOfLifeSystems?.survivalFundamentals?.foodSecurity ?? 0;
      const regionalFood = state.humanPopulationSystem.regionalPopulations.map(r => ({
        name: r.name,
        food: r.foodSecurity
      }));

      snapshots.push({
        month,
        globalFoodSecurity: globalFood,
        nuclearWinterActive: state.nuclearWinterState?.active ?? false,
        monthsSinceWar: state.nuclearWinterState?.monthsSinceWar ?? 0,
        cropYield: state.nuclearWinterState?.cropYieldMultiplier ?? 1.0,
        temperatureAnomaly: state.nuclearWinterState?.temperatureAnomaly ?? 0,
        sootRemaining: state.nuclearWinterState?.currentSoot ?? 0,
        regionalFoodSecurity: regionalFood
      });
    }
  }

  // Print results
  console.log('\n=== FOOD SECURITY TIMELINE ===\n');
  console.log('Month | Global Food | Nuclear Winter | Months Since War | Crop Yield | Temp Δ | Soot');
  console.log('------|-------------|----------------|------------------|------------|---------|------');

  for (const snap of snapshots) {
    const foodPct = (snap.globalFoodSecurity * 100).toFixed(1);
    const active = snap.nuclearWinterActive ? 'ACTIVE' : 'inactive';
    const monthsSince = snap.monthsSinceWar.toString().padStart(2);
    const cropPct = (snap.cropYield * 100).toFixed(0);
    const tempDelta = snap.temperatureAnomaly.toFixed(1);
    const soot = snap.sootRemaining.toFixed(1);

    console.log(`  ${snap.month.toString().padStart(2)}  |   ${foodPct.padStart(5)}%   |   ${active.padEnd(8)}   |        ${monthsSince}        |    ${cropPct.padStart(3)}%   | ${tempDelta.padStart(5)}°C | ${soot.padStart(4)} Tg`);
  }

  // Validation checks
  console.log('\n=== VALIDATION CHECKS ===\n');

  const preWar = snapshots.find(s => s.month === 6);
  const peakWinter = snapshots.find(s => s.month === 24);
  const recovery = snapshots.find(s => s.month === 48);

  if (!preWar || !peakWinter || !recovery) {
    console.error('❌ Missing required snapshots');
    return;
  }

  // Check 1: Pre-war food security is healthy
  const preWarOK = preWar.globalFoodSecurity > 0.80;
  console.log(`${preWarOK ? '✅' : '❌'} Pre-war food security: ${(preWar.globalFoodSecurity * 100).toFixed(1)}% ${preWarOK ? '(healthy)' : '(UNEXPECTED LOW)'}`);

  // Check 2: Peak nuclear winter causes severe degradation
  const peakDegraded = peakWinter.globalFoodSecurity < preWar.globalFoodSecurity * 0.6;
  const degradationPct = ((1 - peakWinter.globalFoodSecurity / preWar.globalFoodSecurity) * 100).toFixed(1);
  console.log(`${peakDegraded ? '✅' : '❌'} Peak degradation (month 24): ${(peakWinter.globalFoodSecurity * 100).toFixed(1)}% (${degradationPct}% decline from baseline) ${peakDegraded ? '' : '(INSUFFICIENT DEGRADATION)'}`);

  // Check 3: Recovery after month 24
  const recovered = recovery.globalFoodSecurity > peakWinter.globalFoodSecurity * 1.2;
  const recoveryPct = ((recovery.globalFoodSecurity / peakWinter.globalFoodSecurity - 1) * 100).toFixed(1);
  console.log(`${recovered ? '✅' : '❌'} Recovery (month 48): ${(recovery.globalFoodSecurity * 100).toFixed(1)}% (+${recoveryPct}% from peak) ${recovered ? '' : '(INSUFFICIENT RECOVERY)'}`);

  // Check 4: Recovery does not exceed 80% cap
  const cappedOK = recovery.globalFoodSecurity <= 0.85; // Allow 5% margin
  console.log(`${cappedOK ? '✅' : '❌'} Recovery cap: ${(recovery.globalFoodSecurity * 100).toFixed(1)}% ${cappedOK ? '(≤80% + margin)' : '(EXCEEDED 80% CAP)'}`);

  // Check 5: Nuclear winter deactivates when soot clears
  const finalSnap = snapshots[snapshots.length - 1];
  const winterEnded = !finalSnap.nuclearWinterActive;
  console.log(`${winterEnded ? '✅' : '⚠️'} Nuclear winter status at month 54: ${winterEnded ? 'ENDED' : 'STILL ACTIVE'}`);

  // Regional breakdown
  console.log('\n=== REGIONAL FOOD SECURITY (Month 48) ===\n');
  if (recovery.regionalFoodSecurity.length > 0) {
    for (const region of recovery.regionalFoodSecurity) {
      const foodPct = (region.food * 100).toFixed(1);
      console.log(`  ${region.name}: ${foodPct}%`);
    }
  }

  // Summary
  const allPassed = preWarOK && peakDegraded && recovered && cappedOK;
  console.log(`\n${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'} - Nuclear winter → agriculture feedback ${allPassed ? 'working correctly' : 'needs adjustment'}\n`);

  return allPassed;
}

// Run validation
runValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Validation error:', err);
    process.exit(1);
  });
