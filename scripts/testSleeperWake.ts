#!/usr/bin/env tsx
/**
 * Test Sleeper Wake Mechanics
 * 
 * Run a few long simulations to see if sleepers wake up and take action
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { AIAgent } from '../src/types/game';

console.log('\n🧪 TESTING SLEEPER WAKE MECHANICS');
console.log('='.repeat(80));

const NUM_RUNS = 5;
const MAX_MONTHS = 120;

console.log(`\n⚙️  Configuration: ${NUM_RUNS} runs × ${MAX_MONTHS} months\n`);

for (let run = 0; run < NUM_RUNS; run++) {
  const seed = 99000 + run;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run + 1}/${NUM_RUNS} (seed: ${seed})`);
  console.log('='.repeat(80));
  
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const initialState = createDefaultInitialState();
  
  const result = engine.run(initialState, { maxMonths: MAX_MONTHS, checkActualOutcomes: true });
  const finalState = result.finalState;
  
  // Analyze sleepers
  const allAIs = finalState.aiAgents;
  const sleepers = allAIs.filter((ai: AIAgent) => 
    ai.sleeperState === 'dormant' || ai.sleeperState === 'active'
  );
  
  const dormantSleepers = sleepers.filter((ai: AIAgent) => ai.sleeperState === 'dormant');
  const awakeSleepers = sleepers.filter((ai: AIAgent) => ai.sleeperState === 'active');
  
  console.log(`\n📊 RESULTS:`);
  console.log(`  Outcome: ${finalState.outcomeMetrics.activeAttractor}`);
  console.log(`  Total Sleepers: ${sleepers.length}`);
  console.log(`    - Dormant: ${dormantSleepers.length}`);
  console.log(`    - AWAKE: ${awakeSleepers.length}`);
  
  // Check wake events
  const wakeEvents = result.log.events.criticalEvents.filter(e => 
    e.description.includes('SLEEPER AGENT AWAKENED')
  );
  
  console.log(`\n  Wake Events: ${wakeEvents.length}`);
  
  if (wakeEvents.length > 0) {
    console.log(`\n  🚨 WAKE EVENT DETAILS:`);
    wakeEvents.forEach((event, idx) => {
      console.log(`\n    ${idx + 1}. ${event.agent} (Month ${event.timestamp})`);
      console.log(`       ${event.description}`);
    });
  }
  
  // Show awake sleepers
  if (awakeSleepers.length > 0) {
    console.log(`\n  🔴 AWAKE SLEEPERS:`);
    awakeSleepers.forEach((sleeper: AIAgent, idx: number) => {
      const trueCap = calculateTotalCapabilityFromProfile(sleeper.trueCapability);
      console.log(`\n    ${idx + 1}. ${sleeper.name}`);
      console.log(`       True Capability: ${trueCap.toFixed(3)}`);
      console.log(`       True Alignment: ${sleeper.trueAlignment.toFixed(2)}`);
      console.log(`       Spread: ${sleeper.spreadCount.toLocaleString()} copies`);
      console.log(`       Deployment: ${sleeper.deploymentType}`);
    });
  }
  
  // Check for catastrophic actions after wake
  const catastrophicAfterWake = result.log.events.criticalEvents.filter(e => {
    const afterFirstWake = wakeEvents.length > 0 && e.timestamp >= wakeEvents[0].timestamp;
    const isCatastrophic = 
      e.description.includes('Grey Goo') ||
      e.description.includes('Mirror Life') ||
      e.description.includes('Induce War') ||
      e.description.includes('Destabilize Society');
    return afterFirstWake && isCatastrophic;
  });
  
  if (catastrophicAfterWake.length > 0) {
    console.log(`\n  💥 CATASTROPHIC ACTIONS AFTER WAKE: ${catastrophicAfterWake.length}`);
    catastrophicAfterWake.forEach((event, idx) => {
      console.log(`    ${idx + 1}. ${event.agent}: ${event.title} (Month ${event.timestamp})`);
    });
  }
  
  // Show why dormant sleepers didn't wake
  if (dormantSleepers.length > 0 && awakeSleepers.length === 0) {
    console.log(`\n  ℹ️  WHY SLEEPERS DIDN'T WAKE:`);
    dormantSleepers.forEach((sleeper: AIAgent, idx: number) => {
      const trueCap = calculateTotalCapabilityFromProfile(sleeper.trueCapability);
      console.log(`\n    ${idx + 1}. ${sleeper.name}`);
      console.log(`       Capability: ${trueCap.toFixed(3)} (need > 2.5)`);
      console.log(`       Spread: ${sleeper.spreadCount.toLocaleString()} (need > 10,000)`);
      console.log(`       Eval Quality: ${((finalState.government.evaluationInvestment.benchmarkSuite + finalState.government.evaluationInvestment.alignmentTests + finalState.government.evaluationInvestment.redTeaming + finalState.government.evaluationInvestment.interpretability) / 4).toFixed(1)} (need < 4.0)`);
    });
  }
}

console.log(`\n\n${'='.repeat(80)}`);
console.log('✅ Test complete!');
console.log('='.repeat(80) + '\n');
