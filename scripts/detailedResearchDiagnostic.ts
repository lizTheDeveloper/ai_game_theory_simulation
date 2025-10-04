#!/usr/bin/env tsx
/**
 * Detailed diagnostic to track:
 * - AI actions (what are they doing?)
 * - Research growth (how much capability increase per action?)
 * - Capability progression (are capabilities actually increasing?)
 * - Extinction probability trajectory
 */

import { SeededRandom, SimulationEngine, SimulationStepResult } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateOutcomeProbabilities } from '../src/simulation/outcomes';
import { GameState } from '../src/types/game';

interface ActionTracker {
  month: number;
  action: string;
  agent: string;
  growth?: number;
  newCapability?: number;
}

interface MonthlySnapshot {
  month: number;
  avgCapability: number;
  avgAlignment: number;
  extinctionProb: number;
  utopiaProb: number;
  actionsThisMonth: ActionTracker[];
  totalCapabilityGrowth: number;
}

async function runDetailedDiagnostic(maxMonths: number = 200, seed: number = 42) {
  console.log('🔬 Detailed Research Diagnostic\n');
  console.log('='.repeat(80));
  console.log(`Running ${maxMonths}-month simulation with seed ${seed}`);
  console.log(`Tracking: Actions, Growth, Capabilities, Probabilities\n`);
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed, maxMonths });
  
  let state = initialState;
  const snapshots: MonthlySnapshot[] = [];
  
  // Track initial state
  const initialAvgCap = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
  console.log(`Initial average AI capability: ${initialAvgCap.toFixed(3)}`);
  console.log(`Initial capability breakdown:`);
  state.aiAgents.forEach(ai => {
    console.log(`  ${ai.name}: total=${ai.capability.toFixed(3)}, ` +
      `phys=${ai.capabilityProfile.physical.toFixed(2)}, ` +
      `digi=${ai.capabilityProfile.digital.toFixed(2)}, ` +
      `cogn=${ai.capabilityProfile.cognitive.toFixed(2)}, ` +
      `self=${ai.capabilityProfile.selfImprovement.toFixed(2)}`);
  });
  console.log('');
  
  // Step through simulation
  for (let month = 0; month < maxMonths; month++) {
    if (!state.aiAgents || state.aiAgents.length === 0) {
      console.log(`⚠️  No AI agents at month ${month}, stopping`);
      break;
    }
    
    // Capture pre-step state
    const preCaps = state.aiAgents.map(ai => ({
      name: ai.name,
      capability: ai.capability
    }));
    
    // Step forward
    const stepResult: SimulationStepResult = engine.step(state);
    state = stepResult.state;
    
    // Track actions from events
    const actions: ActionTracker[] = [];
    stepResult.events.forEach(event => {
      if (event.type === 'action' && event.agent) {
        const preCapAgent = preCaps.find(a => a.name === event.agent);
        const postCapAgent = state.aiAgents.find(ai => ai.name === event.agent);
        
        const action: ActionTracker = {
          month,
          action: event.title || 'Unknown',
          agent: event.agent
        };
        
        // Try to extract growth from event effects
        if (event.effects && typeof event.effects === 'object') {
          const effects = event.effects as any;
          if (effects.growth !== undefined) {
            action.growth = effects.growth;
          }
          if (effects.capability_increase !== undefined) {
            action.growth = effects.capability_increase;
          }
        }
        
        // Calculate actual capability change
        if (preCapAgent && postCapAgent) {
          action.newCapability = postCapAgent.capability - preCapAgent.capability;
        }
        
        actions.push(action);
      }
    });
    
    // Calculate total capability growth this month
    const postCaps = state.aiAgents.map(ai => ai.capability);
    const totalGrowth = postCaps.reduce((sum, cap, i) => sum + (cap - preCaps[i].capability), 0);
    
    // Calculate outcome probabilities
    const probs = calculateOutcomeProbabilities(state);
    const avgCap = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
    const avgAlign = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    
    snapshots.push({
      month,
      avgCapability: avgCap,
      avgAlignment: avgAlign,
      extinctionProb: probs.extinctionProbability,
      utopiaProb: probs.utopiaProbability,
      actionsThisMonth: actions,
      totalCapabilityGrowth: totalGrowth
    });
    
    // Check if extinction triggered
    if (state.extinctionState?.active) {
      console.log(`\n⚠️  EXTINCTION at month ${month}: ${state.extinctionState.mechanism}`);
      break;
    }
  }
  
  return { snapshots, finalState: state };
}

function analyzeSnapshots(snapshots: MonthlySnapshot[]) {
  console.log('\n📊 Diagnostic Analysis\n');
  console.log('='.repeat(80));
  
  // Action frequency analysis
  const actionCounts: Record<string, number> = {};
  const actionGrowths: Record<string, number[]> = {};
  
  snapshots.forEach(snapshot => {
    snapshot.actionsThisMonth.forEach(action => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
      
      if (action.growth !== undefined || action.newCapability !== undefined) {
        const growth = action.growth ?? action.newCapability ?? 0;
        if (!actionGrowths[action.action]) {
          actionGrowths[action.action] = [];
        }
        actionGrowths[action.action].push(growth);
      }
    });
  });
  
  console.log('\n🎬 Action Frequency:');
  const sortedActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]);
  sortedActions.forEach(([action, count]) => {
    const avgGrowth = actionGrowths[action] ? 
      actionGrowths[action].reduce((a, b) => a + b, 0) / actionGrowths[action].length : 0;
    console.log(`  ${action}: ${count} times` + 
      (avgGrowth > 0 ? ` (avg growth: ${avgGrowth.toFixed(4)})` : ''));
  });
  
  // Check if advance_research is being used
  const researchActions = Object.keys(actionCounts).filter(a => 
    a.includes('esearch') || a.includes('Advanc') || a.includes('capability')
  );
  
  if (researchActions.length === 0) {
    console.log('\n⚠️  WARNING: No research actions detected!');
    console.log('   Expected to see "Advance Research" or similar actions');
    console.log('   AIs may not be using the new research system!');
  }
  
  // Growth analysis
  console.log('\n📈 Capability Growth Timeline:\n');
  console.log('Month | AvgCap | Growth | Align | Extinct% | Utopia% | Actions');
  console.log('-'.repeat(75));
  
  const milestones = [0, 25, 50, 75, 100, 125, 150, 175, 200].filter(m => m < snapshots.length);
  milestones.forEach(month => {
    const s = snapshots[month];
    if (s) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${s.avgCapability.toFixed(3)} | ` +
        `${s.totalCapabilityGrowth.toFixed(4)} | ` +
        `${s.avgAlignment.toFixed(2)} | ` +
        `${(s.extinctionProb * 100).toFixed(1).padStart(6)}% | ` +
        `${(s.utopiaProb * 100).toFixed(1).padStart(5)}% | ` +
        `${s.actionsThisMonth.length}`
      );
    }
  });
  
  // Growth rate comparison
  const earlyMonths = snapshots.slice(0, 50);
  const lateMonths = snapshots.slice(-50);
  
  const earlyGrowth = earlyMonths.reduce((sum, s) => sum + s.totalCapabilityGrowth, 0) / earlyMonths.length;
  const lateGrowth = lateMonths.reduce((sum, s) => sum + s.totalCapabilityGrowth, 0) / lateMonths.length;
  
  console.log('\n📉 Growth Rate Comparison:');
  console.log(`   Early months (0-50): ${earlyGrowth.toFixed(5)}/month`);
  console.log(`   Late months (150-200): ${lateGrowth.toFixed(5)}/month`);
  
  if (lateGrowth > earlyGrowth * 1.5) {
    console.log(`   ⚠️  Growth ACCELERATING (${(lateGrowth / earlyGrowth).toFixed(1)}× faster)`);
  } else if (lateGrowth < earlyGrowth * 0.7) {
    console.log(`   ⚠️  Growth SLOWING (${(earlyGrowth / lateGrowth).toFixed(1)}× slower)`);
  } else {
    console.log(`   ✅ Growth rate CONSISTENT`);
  }
  
  // Total growth
  const initialCap = snapshots[0].avgCapability;
  const finalCap = snapshots[snapshots.length - 1].avgCapability;
  const totalGrowth = finalCap - initialCap;
  
  console.log('\n📊 Summary:');
  console.log(`   Initial capability: ${initialCap.toFixed(3)}`);
  console.log(`   Final capability: ${finalCap.toFixed(3)}`);
  console.log(`   Total growth: ${totalGrowth.toFixed(3)} (${((totalGrowth / initialCap) * 100).toFixed(1)}% increase)`);
  console.log(`   Average growth/month: ${(totalGrowth / snapshots.length).toFixed(5)}`);
  
  // Check dangerous thresholds
  console.log('\n🎯 Dangerous Capability Thresholds:');
  const thresholds = [
    { name: 'Bioweapon', value: 2.5 },
    { name: 'Paperclip', value: 2.8 },
    { name: 'Grey Goo', value: 3.2 }
  ];
  
  thresholds.forEach(t => {
    const monthsToReach = (t.value - finalCap) / (totalGrowth / snapshots.length);
    const willReach = monthsToReach > 0 && monthsToReach < 1000;
    console.log(`   ${t.name} (${t.value}): ` + 
      (finalCap >= t.value ? '✅ REACHED' : 
        willReach ? `📅 ${Math.round(monthsToReach)} months to reach` :
        '❌ Won\'t reach at current rate'));
  });
}

// Run
async function main() {
  const { snapshots, finalState } = await runDetailedDiagnostic(200, 42);
  analyzeSnapshots(snapshots);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Diagnostic complete!');
  console.log(`Final outcome: ${finalState.extinctionState?.active ? 'EXTINCTION' : 'ONGOING'}`);
}

main().catch(console.error);

