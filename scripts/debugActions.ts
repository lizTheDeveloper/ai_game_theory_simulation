#!/usr/bin/env tsx
/**
 * Debug AI action selection
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

async function debugActions() {
  console.log('🐛 Debugging AI Action Selection\n');
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed: 123, maxMonths: 3 });
  
  // Track all AI actions
  const actionCounts: Record<string, number> = {};
  const actionsByAgent: Record<string, Record<string, number>> = {};
  
  const result = engine.run(initialState, { maxMonths: 3 });

  // Count actions from events
  // Phase 2D: Use log.events.criticalEvents instead of snapshot.events (removed property)
  const allEvents = result.log.events.criticalEvents || [];
  
  allEvents.forEach(event => {
    if (event.agent && event.type === 'action') {
      const actionName = event.title || 'Unknown';
      actionCounts[actionName] = (actionCounts[actionName] || 0) + 1;
      
      if (!actionsByAgent[event.agent]) {
        actionsByAgent[event.agent] = {};
      }
      actionsByAgent[event.agent][actionName] = (actionsByAgent[event.agent][actionName] || 0) + 1;
    }
  });
  
  console.log('📊 Action Counts (Total):');
  Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([action, count]) => {
      console.log(`  ${action}: ${count}`);
    });
  
  console.log('\n📊 Actions by Agent:');
  Object.entries(actionsByAgent).forEach(([agent, actions]) => {
    console.log(`\n${agent}:`);
    Object.entries(actions)
      .sort((a, b) => b[1] - a[1])
      .forEach(([action, count]) => {
        console.log(`  ${action}: ${count}`);
      });
  });
  
  console.log('\n\n📋 Available AI Actions:');
  const { AI_ACTIONS } = await import('../src/simulation/agents/aiAgent');
  AI_ACTIONS.forEach(action => {
    console.log(`  - ${action.id}: ${action.name}`);
  });
}

debugActions().catch(console.error);

