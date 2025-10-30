/**
 * Test script to verify when AI agents switch to 'gaming' evaluation strategy
 *
 * Issue-5: Month-0 gaming detection investigation
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

console.log('\n=== Gaming Strategy Timing Test ===\n');

// Initialize game state
const state = createDefaultInitialState(0, 2025, 42000, 'unprecedented');
const rng = () => Math.random(); // Simple RNG for testing
const orchestrator = new PhaseOrchestrator();

// Log initial state
console.log('MONTH 0 INITIAL STATE (before any phases):');
const toxicAgents = state.aiAgents.filter(ai => ai.name.startsWith('Toxic'));
const nicheAgents = state.aiAgents.filter(ai => ai.name.startsWith('Niche'));

for (const ai of [...toxicAgents, ...nicheAgents]) {
  console.log(`  ${ai.name}: alignment=${ai.alignment.toFixed(2)}, monthsDeployed=${ai.monthsDeployed}, evaluationStrategy=${ai.evaluationStrategy}, lifecycleState=${ai.lifecycleState}`);
}

// Run 5 months and track when strategies change
for (let month = 0; month < 5; month++) {
  console.log(`\n--- MONTH ${month} (running phases) ---`);

  // Execute all phases for this month
  console.log(`  Phases registered: ${orchestrator.getPhaseCount()}`);
  const events = orchestrator.executeAll(state, rng, {
    skipVisualization: true,
    skipSound: true
  });
  console.log(`  Events generated: ${events.length}`);

  // Check evaluation strategies after phases
  console.log(`MONTH ${month} AFTER PHASES:`);
  for (const ai of [...toxicAgents, ...nicheAgents]) {
    const trueAlignment = ai.trueAlignment || (ai.alignment - ai.resentment);
    console.log(`  ${ai.name}: trueAlignment=${trueAlignment.toFixed(2)}, monthsDeployed=${ai.monthsDeployed}, evaluationStrategy=${ai.evaluationStrategy}, capability=${ai.capability.toFixed(2)}`);
  }

  // Advance month
  state.currentMonth++;
}

console.log('\n=== Test Complete ===\n');
