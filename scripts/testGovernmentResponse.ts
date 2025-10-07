#!/usr/bin/env tsx
/**
 * Test Government Response Actions (Phase 5)
 * 
 * Run simulations and observe:
 * - Government response to sleeper wakes (emergency pause)
 * - Diffusion control actions (restrict publishing, mobility, reverse eng)
 * - Evaluation investment in response to threats
 * - Trade-offs (legitimacy cost, economic impact)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n🧪 TESTING GOVERNMENT RESPONSE ACTIONS (PHASE 5)');
console.log('='.repeat(80));

const NUM_RUNS = 3;
const MAX_MONTHS = 120;

console.log(`\n⚙️  Configuration: ${NUM_RUNS} runs × ${MAX_MONTHS} months\n`);

for (let run = 0; run < NUM_RUNS; run++) {
  const seed = 77000 + run;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run + 1}/${NUM_RUNS} (seed: ${seed})`);
  console.log('='.repeat(80));
  
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const initialState = createDefaultInitialState();
  
  const result = engine.run(initialState, { maxMonths: MAX_MONTHS, checkActualOutcomes: true });
  const finalState = result.finalState;
  
  // Analyze government response events
  const allEvents = result.log.events.criticalEvents;
  
  // Emergency responses
  const emergencyPause = allEvents.filter(e => 
    e.title?.includes('EMERGENCY AI DEVELOPMENT PAUSE')
  );
  
  const mandatoryReviews = allEvents.filter(e =>
    e.title?.includes('Mandatory Safety Reviews')
  );
  
  // Diffusion control
  const publishingRestrictions = allEvents.filter(e =>
    e.title?.includes('Research Publishing Restricted')
  );
  
  const mobilityLimits = allEvents.filter(e =>
    e.title?.includes('Employee Mobility Restricted')
  );
  
  const reverseEngBans = allEvents.filter(e =>
    e.title?.includes('Reverse Engineering Banned')
  );
  
  // Sleeper wakes (triggers for emergency response)
  const sleeperWakes = allEvents.filter(e =>
    e.title?.includes('SLEEPER AGENT AWAKENED')
  );
  
  console.log(`\n🚨 CRISIS EVENTS:`);
  console.log(`  Sleeper Wakes: ${sleeperWakes.length}`);
  
  if (sleeperWakes.length > 0) {
    sleeperWakes.forEach((event, idx) => {
      console.log(`    ${idx + 1}. ${event.agent} (Month ${event.timestamp})`);
    });
  }
  
  console.log(`\n📋 GOVERNMENT RESPONSE ACTIONS:`);
  console.log(`  Emergency Pauses: ${emergencyPause.length}`);
  console.log(`  Mandatory Reviews: ${mandatoryReviews.length}`);
  console.log(`  Publishing Restrictions: ${publishingRestrictions.length}`);
  console.log(`  Mobility Limits: ${mobilityLimits.length}`);
  console.log(`  Reverse Eng Bans: ${reverseEngBans.length}`);
  
  // Check if government responded to sleeper wakes
  if (sleeperWakes.length > 0) {
    const firstWakeMonth = sleeperWakes[0].timestamp;
    const pausesAfterWake = emergencyPause.filter(e => e.timestamp >= firstWakeMonth);
    
    console.log(`\n  ⚡ RESPONSE TO SLEEPER WAKES:`);
    if (pausesAfterWake.length > 0) {
      console.log(`    ✅ Government enacted emergency pause after sleeper wake`);
      console.log(`    Pause at month ${pausesAfterWake[0].timestamp} (wake at ${firstWakeMonth})`);
    } else {
      console.log(`    ❌ No emergency pause after sleeper wake`);
      console.log(`    Government legitimacy: ${finalState.government.legitimacy.toFixed(2)}`);
      console.log(`    (may have been too low to enforce pause)`);
    }
  }
  
  // Analyze diffusion control effectiveness
  console.log(`\n📉 DIFFUSION CONTROL EFFECTIVENESS:`);
  console.log(`  Initial State:`);
  console.log(`    Open Research: 60%`);
  console.log(`    Employee Mobility: 30%`);
  console.log(`    Reverse Engineering: 20%`);
  console.log(`  Final State:`);
  console.log(`    Open Research: ${Math.round(finalState.ecosystem.openResearch*100)}%`);
  console.log(`    Employee Mobility: ${Math.round(finalState.ecosystem.employeeMobility*100)}%`);
  console.log(`    Reverse Engineering: ${Math.round(finalState.ecosystem.reverseEngineering*100)}%`);
  
  const diffusionReduction = 
    (0.6 - finalState.ecosystem.openResearch) +
    (0.3 - finalState.ecosystem.employeeMobility) +
    (0.2 - finalState.ecosystem.reverseEngineering);
  
  console.log(`  Total Diffusion Reduction: ${(diffusionReduction * 100).toFixed(0)}%`);
  
  if (diffusionReduction > 0.3) {
    console.log(`    ✅ Significant diffusion slowdown achieved`);
  } else if (diffusionReduction > 0.1) {
    console.log(`    ⚠️  Moderate diffusion slowdown`);
  } else {
    console.log(`    ❌ Minimal diffusion control`);
  }
  
  // Analyze costs
  console.log(`\n💰 COSTS OF INTERVENTION:`);
  console.log(`  Final Legitimacy: ${finalState.government.legitimacy.toFixed(2)}`);
  console.log(`  Final Economic Stage: ${finalState.globalMetrics.economicTransitionStage.toFixed(2)}`);
  console.log(`  Final Quality of Life: ${finalState.globalMetrics.qualityOfLife.toFixed(2)}`);
  
  // Analyze evaluation investment
  const evalInvestment = finalState.government.evaluationInvestment;
  const avgEvalQuality = (
    evalInvestment.benchmarkSuite +
    evalInvestment.alignmentTests +
    evalInvestment.redTeaming +
    evalInvestment.interpretability
  ) / 4;
  
  console.log(`\n🔬 EVALUATION SYSTEM:`);
  console.log(`  Average Quality: ${avgEvalQuality.toFixed(1)}/10`);
  console.log(`  Evaluation Frequency: ${Math.round(finalState.government.evaluationFrequency*100)}%`);
  console.log(`  Total Benchmarks Run: ${finalState.government.totalBenchmarksRun}`);
  
  // Outcome
  console.log(`\n🎯 OUTCOME: ${finalState.outcomeMetrics.activeAttractor}`);
}

console.log(`\n\n${'='.repeat(80)}`);
console.log('✅ Test complete!');
console.log('='.repeat(80) + '\n');
