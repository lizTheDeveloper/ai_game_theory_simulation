#!/usr/bin/env node
/**
 * Check Tech Unlock vs Deployment Gap (HIGH-4 Diagnostic)
 *
 * Bug hypothesis: Bifurcation phase uses unlockedTech.length / TOTAL_TECH_COUNT
 * but should use deployed tech count / TOTAL_TECH_COUNT
 */

import { runSimulationStep } from '../src/simulation/engine';
import { initializeGameState } from '../src/simulation/initialization';
import { TOTAL_TECH_COUNT } from '../src/simulation/techTree/comprehensiveTechTree';
import seedrandom from 'seedrandom';

const state = initializeGameState(42000);
const rng = seedrandom('42000');

console.log('\n=== TECH DEPLOYMENT vs UNLOCK DIAGNOSTIC ===\n');
console.log('Hypothesis: Bifurcation uses UNLOCK metric, should use DEPLOYMENT metric\n');

for (let month = 0; month < 240; month++) {
  runSimulationStep(state, rng);

  if (month % 24 === 0 || month === 239) {
    const unlocked = state.techTreeState.unlockedTech.length;
    const deployed = Object.keys(state.techTreeState.deployedTechMap).filter(
      id => state.techTreeState.deployedTechMap[id] > 0
    ).length;

    const avgUnlock = unlocked / TOTAL_TECH_COUNT;
    const avgDeploy = deployed / TOTAL_TECH_COUNT;

    console.log(`Month ${month} (Year ${(month / 12).toFixed(1)}):`);
    console.log(`  Unlocked: ${unlocked}/${TOTAL_TECH_COUNT} (${(avgUnlock * 100).toFixed(1)}%)`);
    console.log(`  Deployed: ${deployed}/${TOTAL_TECH_COUNT} (${(avgDeploy * 100).toFixed(1)}%)`);
    console.log(`  Gap: ${unlocked - deployed} techs unlocked but not deployed`);

    if (avgUnlock >= 0.60) {
      console.log(`  ✅ UNLOCK metric reaches bifurcation threshold (60%)`);
    }
    if (avgDeploy >= 0.60) {
      console.log(`  ✅ DEPLOY metric reaches bifurcation threshold (60%)`);
    }
    if (avgUnlock < 0.60 && avgDeploy < 0.60) {
      console.log(`  ❌ Neither metric reaches bifurcation threshold (60%)`);
    }
    if (avgUnlock >= 0.60 && avgDeploy < 0.60) {
      console.log(`  ⚠️  BUG: Unlock metric crosses threshold, but deployment does not!`);
    }
    console.log('');
  }
}

console.log('\n💡 DIAGNOSIS:');
console.log('   If gap is large, bifurcation logic is wrong.');
console.log('   Unlocking tech ≠ deploying tech.');
console.log('   Threshold comment says "deployment progress" but code uses unlocks.\n');
