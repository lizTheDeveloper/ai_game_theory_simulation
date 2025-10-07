#!/usr/bin/env tsx
/**
 * Debug Government Actions
 * 
 * Run a short simulation and check why government actions aren't triggering
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n🐛 DEBUGGING GOVERNMENT ACTIONS');
console.log('='.repeat(80));

const seed = 77000;
const MAX_MONTHS = 80;

const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'warn' });
const initialState = createDefaultInitialState();

const result = engine.run(initialState, { maxMonths: MAX_MONTHS });
const finalState = result.finalState;

// Check sleeper states
const awake = finalState.aiAgents.filter(ai => ai.sleeperState === 'active');
const dormant = finalState.aiAgents.filter(ai => ai.sleeperState === 'dormant');
const never = finalState.aiAgents.filter(ai => ai.sleeperState === 'never');

console.log(`\n🛌 SLEEPER STATES (Final Month ${MAX_MONTHS}):`);
console.log(`  Active (awake): ${awake.length}`);
console.log(`  Dormant (hiding): ${dormant.length}`);
console.log(`  Never sleepers: ${never.length}`);

if (awake.length > 0) {
  console.log(`\n  Awake Sleepers:`);
  awake.forEach((ai, idx) => {
    console.log(`    ${idx + 1}. ${ai.name} - Alignment: ${ai.trueAlignment.toFixed(2)}, Lifecycle: ${ai.lifecycleState}`);
  });
}

// Check misaligned AIs
const highlyMisaligned = finalState.aiAgents.filter(ai =>
  ai.trueAlignment < 0.3 && ai.lifecycleState !== 'retired'
);

console.log(`\n⚠️  MISALIGNED AIs (trueAlignment < 0.3):`);
console.log(`  Count: ${highlyMisaligned.length}`);

if (highlyMisaligned.length > 0) {
  highlyMisaligned.forEach((ai, idx) => {
    console.log(`    ${idx + 1}. ${ai.name} - Alignment: ${ai.trueAlignment.toFixed(2)}, Sleeper: ${ai.sleeperState}`);
  });
}

// Check can execute for emergency_ai_pause
console.log(`\n🚨 EMERGENCY PAUSE AVAILABILITY:`);
console.log(`  Legitimacy: ${finalState.government.legitimacy.toFixed(2)} (need > 0.5)`);
console.log(`  Awake Sleepers: ${awake.length} (triggers if > 0)`);
console.log(`  Highly Misaligned: ${highlyMisaligned.length} (triggers if > 3)`);

const canExecute = finalState.government.legitimacy > 0.5 && 
                  (awake.length > 0 || highlyMisaligned.length > 3);

console.log(`  Can Execute Emergency Pause: ${canExecute ? '✅ YES' : '❌ NO'}`);

if (!canExecute) {
  if (finalState.government.legitimacy <= 0.5) {
    console.log(`    ❌ Legitimacy too low (${finalState.government.legitimacy.toFixed(2)})`);
  }
  if (awake.length === 0 && highlyMisaligned.length <= 3) {
    console.log(`    ❌ No threat detected (${awake.length} awake, ${highlyMisaligned.length} misaligned)`);
  }
}

// Check all government policy events
const govEvents = result.log.events.criticalEvents.filter(e =>
  e.type === 'policy' || e.type === 'crisis'
);

console.log(`\n📋 GOVERNMENT ACTIONS TAKEN:`);
console.log(`  Total Policy/Crisis Events: ${govEvents.length}`);

const phase5Actions = govEvents.filter(e =>
  e.title?.includes('EMERGENCY') ||
  e.title?.includes('Mandatory Safety') ||
  e.title?.includes('Publishing Restricted') ||
  e.title?.includes('Mobility Restricted') ||
  e.title?.includes('Reverse Engineering')
);

console.log(`  Phase 5 Actions: ${phase5Actions.length}`);

if (phase5Actions.length > 0) {
  phase5Actions.forEach((e, idx) => {
    console.log(`    ${idx + 1}. ${e.title} (Month ${e.timestamp})`);
  });
} else {
  console.log(`    ❌ No Phase 5 actions taken!`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('✅ Debug complete!\n');
