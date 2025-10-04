#!/usr/bin/env tsx
/**
 * Debug: Why aren't AI capabilities growing?
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 42, maxMonths: 50 });

console.log('\n🔍 DEBUGGING AI CAPABILITY GROWTH');
console.log('==================================\n');

console.log('Initial AIs:');
initialState.aiAgents.slice(0, 5).forEach(ai => {
  console.log(`  ${ai.name}: cap=${ai.capability.toFixed(3)}, align=${ai.alignment.toFixed(2)}`);
});

const result = engine.run(initialState, { maxMonths: 50, checkActualOutcomes: false });

console.log('\nAfter 50 months:');
const finalAIs = result.finalState.aiAgents.filter((ai: any) => ai.lifecycleState !== 'retired');
finalAIs.slice(0, 10).forEach((ai: any) => {
  console.log(`  ${ai.name}: cap=${ai.capability.toFixed(3)}, align=${ai.alignment.toFixed(2)}, age=${ai.monthsInExistence}mo`);
});

console.log(`\nTotal active AIs: ${finalAIs.length}`);
console.log('Capability distribution:');
console.log(`  < 0.1: ${finalAIs.filter((ai: any) => ai.capability < 0.1).length}`);
console.log(`  0.1-0.5: ${finalAIs.filter((ai: any) => ai.capability >= 0.1 && ai.capability < 0.5).length}`);
console.log(`  0.5-1.0: ${finalAIs.filter((ai: any) => ai.capability >= 0.5 && ai.capability < 1.0).length}`);
console.log(`  1.0-2.0: ${finalAIs.filter((ai: any) => ai.capability >= 1.0 && ai.capability < 2.0).length}`);
console.log(`  > 2.0: ${finalAIs.filter((ai: any) => ai.capability >= 2.0).length}`);

// Check if advance_research action is happening
const researchEvents = result.log.events.criticalEvents.filter((e: any) => 
  e.description?.includes('research') || e.title?.includes('Research')
);
console.log(`\nResearch events: ${researchEvents.length}`);

// Check action distribution
const actionCounts: Record<string, number> = {};
result.log.events.criticalEvents.forEach((e: any) => {
  const match = e.description?.match(/AI \w+ chose: (\w+)/);
  if (match) {
    actionCounts[match[1]] = (actionCounts[match[1]] || 0) + 1;
  }
});

console.log('\nAI action distribution (from critical events):');
Object.entries(actionCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([action, count]) => {
    console.log(`  ${action}: ${count}`);
  });

// Check the AI action rate
console.log(`\nAI action frequency: ${initialState.aiAgents[0]?.actionFrequency || 'unknown'}`);
console.log(`Total AI actions expected: ~${50 * finalAIs.length * (initialState.aiAgents[0]?.actionFrequency || 0)}`);

