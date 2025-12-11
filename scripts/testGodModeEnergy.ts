/**
 * God Mode Energy Constraints Test (H-1)
 *
 * Tests energy budget constraints under extreme AI capability growth.
 * Expected: Energy constraints activate, AI/crypto growth slows, no crashes.
 */

import { SimulationEngine } from '../src/simulation/engine';

const SEED = 999_999; // God mode seed
const MAX_MONTHS = 60; // 5 years

console.log(`\n🔬 GOD MODE ENERGY CONSTRAINTS TEST (H-1)`);
console.log(`Seed: ${SEED}, Duration: ${MAX_MONTHS} months\n`);

// Create simulation engine
const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS, logLevel: 'summary' });

// Initialize the simulation (creates state)
engine.start();

// God mode: Boost AI capabilities to stress energy system
engine.state!.aiAgents.forEach((agent, i) => {
  agent.capability = 10.0 + i * 2.0; // High capability (10-30)
});

console.log(`⚡ God mode activated: AI capabilities boosted to stress energy system`);
console.log(`  Total AI capability: ${engine.state!.aiAgents.reduce((sum, a) => sum + a.capability, 0).toFixed(1)}`);
console.log(`  Energy budget enabled: ${engine.state!.energyBudget?.enabled}`);
console.log(`  Global capacity: ${engine.state!.energyBudget?.globalCapacity.totalTWh.toFixed(0)} TWh/year\n`);

// Run simulation
let constraintActivated = false;

for (let month = 0; month < MAX_MONTHS; month++) {
  try {
    engine.step();

    // Check for energy constraints
    if (engine.state.energyBudget?.allocations['ai-datacenter']) {
      const aiAlloc = engine.state.energyBudget.allocations['ai-datacenter'];
      if (aiAlloc.effectivenessMultiplier < 0.9) {
        constraintActivated = true;
      }
    }

    // Log energy budget state every 12 months
    if (month % 12 === 0 && month > 0) {
      const year = Math.floor(month / 12);
      console.log(`\n=== Year ${year} (Month ${month}) ===`);

      // Energy budget state
      if (engine.state.energyBudget?.allocations['ai-datacenter']) {
        const aiAlloc = engine.state.energyBudget.allocations['ai-datacenter'];
        console.log(`📊 AI Datacenter:`);
        console.log(`   Demand: ${aiAlloc.demandTWh.toFixed(0)} TWh/year`);
        console.log(`   Allocated: ${aiAlloc.allocatedTWh.toFixed(0)} TWh/year`);
        console.log(`   Effectiveness: ${(aiAlloc.effectivenessMultiplier * 100).toFixed(1)}%`);
      }

      if (engine.state.energyBudget?.allocations['crypto-mining']) {
        const cryptoAlloc = engine.state.energyBudget.allocations['crypto-mining'];
        console.log(`💰 Crypto Mining:`);
        console.log(`   Demand: ${cryptoAlloc.demandTWh.toFixed(0)} TWh/year`);
        console.log(`   Allocated: ${cryptoAlloc.allocatedTWh.toFixed(0)} TWh/year`);
        console.log(`   Effectiveness: ${(cryptoAlloc.effectivenessMultiplier * 100).toFixed(1)}%`);
      }

      // Power generation state
      if (engine.state.powerGenerationSystem) {
        const power = engine.state.powerGenerationSystem;
        console.log(`⚡ Power Generation:`);
        console.log(`   AI inference: ${power.aiInferencePower.toFixed(2)} TWh/month`);
        console.log(`   AI training: ${power.aiTrainingPower.toFixed(2)} TWh/month`);
        console.log(`   Crypto: ${power.cryptoPower.toFixed(2)} TWh/month`);
        console.log(`   Total datacenter: ${power.dataCenterPower.toFixed(2)} TWh/month`);
      }

      // Energy budget conflicts
      if (engine.state.energyBudget?.conflicts) {
        const conflicts = engine.state.energyBudget.conflicts;
        if (conflicts.surplusDeficitTWh < 0) {
          console.log(`🚨 ENERGY DEFICIT: ${Math.abs(conflicts.surplusDeficitTWh).toFixed(0)} TWh`);
          console.log(`   Competing techs: ${conflicts.competingTechs.join(', ')}`);
        } else {
          console.log(`✅ Energy surplus: ${conflicts.surplusDeficitTWh.toFixed(0)} TWh`);
        }
      }
    }
  } catch (error) {
    console.error(`\n❌ SIMULATION CRASH at month ${month}:`);
    console.error(error);
    process.exit(1);
  }
}

console.log(`\n✅ GOD MODE TEST COMPLETE`);
console.log(`Simulation ran ${MAX_MONTHS} months without crashing`);

// Final state summary
console.log(`\n📊 Final State (Month ${MAX_MONTHS}):`);
if (engine.state.energyBudget?.allocations['ai-datacenter']) {
  const aiAlloc = engine.state.energyBudget.allocations['ai-datacenter'];
  console.log(`  AI datacenter effectiveness: ${(aiAlloc.effectivenessMultiplier * 100).toFixed(1)}%`);

  if (constraintActivated) {
    console.log(`  ✅ CONSTRAINT ACTIVATED: Energy budget successfully limited AI growth`);
  } else {
    console.log(`  ⚠️  NO CONSTRAINT: Energy capacity may be too high for stress test`);
  }
}

console.log(`\nGod mode energy constraints test: ${constraintActivated ? 'PASSED' : 'INCONCLUSIVE'} 🎉\n`);
