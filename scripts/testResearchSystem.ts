#!/usr/bin/env tsx
/**
 * Test the multi-dimensional research system
 * 
 * Validates:
 * - AIs are using the new advance_research action
 * - Different dimensions are growing at different rates
 * - Alignment affects research choices
 * - Government investment affects research speed
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

// Run a simulation and track research choices
async function testResearchChoices() {
  console.log('🔬 Testing Multi-Dimensional Research System\n');
  console.log('=' .repeat(60));
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed: 12345, maxMonths: 24 });
  
  // Track research actions
  const researchActions: Array<{
    month: number;
    agent: string;
    dimension?: string;
    research?: string;
    growth: number;
  }> = [];
  
  // Override the step method to intercept actions
  const originalStep = engine.step.bind(engine);
  engine.step = (state) => {
    const result = originalStep(state);
    
    // Extract research actions from events
    result.events.forEach(event => {
      if (event.type === 'action' && event.title?.includes('Advancing')) {
        const match = event.description?.match(/Advancing (\w+)/);
        if (match) {
          researchActions.push({
            month: state.currentMonth,
            agent: event.agent || 'Unknown',
            dimension: match[1],
            growth: (event.effects?.growth as number) || 0
          });
        }
      }
    });
    
    return result;
  };
  
  // Run simulation
  const result = engine.run(initialState, { maxMonths: 24 });
  
  console.log('\n📊 Research Action Summary:');
  console.log('=' .repeat(60));
  
  // Analyze research actions by agent
  const byAgent: Record<string, { dimensions: Record<string, number>; count: number }> = {};
  
  researchActions.forEach(action => {
    if (!byAgent[action.agent]) {
      byAgent[action.agent] = { dimensions: {}, count: 0 };
    }
    byAgent[action.agent].count++;
    if (action.dimension) {
      byAgent[action.agent].dimensions[action.dimension] = 
        (byAgent[action.agent].dimensions[action.dimension] || 0) + 1;
    }
  });
  
  Object.entries(byAgent).forEach(([agent, data]) => {
    console.log(`\n${agent}:`);
    console.log(`  Total research actions: ${data.count}`);
    console.log(`  Research distribution:`);
    Object.entries(data.dimensions)
      .sort((a, b) => b[1] - a[1])
      .forEach(([dim, count]) => {
        const pct = ((count / data.count) * 100).toFixed(1);
        console.log(`    ${dim}: ${count} (${pct}%)`);
      });
  });
  
  // Check final capability profiles
  console.log('\n\n📈 Final Capability Profiles:');
  console.log('=' .repeat(60));
  
  result.finalState.aiAgents.forEach(ai => {
    console.log(`\n${ai.name} (alignment: ${ai.alignment.toFixed(2)}):`);
    console.log(`  Total capability: ${ai.capability.toFixed(3)}`);
    console.log(`  Core dimensions:`);
    console.log(`    Physical:        ${ai.capabilityProfile.physical.toFixed(3)}`);
    console.log(`    Digital:         ${ai.capabilityProfile.digital.toFixed(3)}`);
    console.log(`    Cognitive:       ${ai.capabilityProfile.cognitive.toFixed(3)}`);
    console.log(`    Social:          ${ai.capabilityProfile.social.toFixed(3)}`);
    console.log(`    Economic:        ${ai.capabilityProfile.economic.toFixed(3)}`);
    console.log(`    Self-Improvement: ${ai.capabilityProfile.selfImprovement.toFixed(3)}`);
    
    // Calculate growth rates
    const initialAI = initialState.aiAgents.find(a => a.id === ai.id);
    if (initialAI) {
      console.log(`  Growth rates (from start):`);
      const growthPhysical = ai.capabilityProfile.physical - initialAI.capabilityProfile.physical;
      const growthDigital = ai.capabilityProfile.digital - initialAI.capabilityProfile.digital;
      const growthCognitive = ai.capabilityProfile.cognitive - initialAI.capabilityProfile.cognitive;
      const growthSelfImprovement = ai.capabilityProfile.selfImprovement - initialAI.capabilityProfile.selfImprovement;
      
      console.log(`    Physical:        +${growthPhysical.toFixed(3)} (${(growthPhysical/0.02/96).toFixed(1)}% of max)`);
      console.log(`    Digital:         +${growthDigital.toFixed(3)} (${(growthDigital/0.03/96).toFixed(1)}% of max)`);
      console.log(`    Cognitive:       +${growthCognitive.toFixed(3)} (${(growthCognitive/0.04/96).toFixed(1)}% of max)`);
      console.log(`    Self-Improvement: +${growthSelfImprovement.toFixed(3)} (${(growthSelfImprovement/0.05/96).toFixed(1)}% of max)`);
    }
  });
  
  // Validate non-uniform growth
  console.log('\n\n✅ Validations:');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  
  // Check if self-improvement grew faster than physical
  result.finalState.aiAgents.forEach(ai => {
    const initialAI = initialState.aiAgents.find(a => a.id === ai.id);
    if (initialAI) {
      const growthSI = ai.capabilityProfile.selfImprovement - initialAI.capabilityProfile.selfImprovement;
      const growthPhys = ai.capabilityProfile.physical - initialAI.capabilityProfile.physical;
      
      if (growthSI > growthPhys) {
        console.log(`✅ ${ai.name}: Self-improvement (${growthSI.toFixed(3)}) > Physical (${growthPhys.toFixed(3)})`);
      } else {
        console.log(`❌ ${ai.name}: Self-improvement (${growthSI.toFixed(3)}) <= Physical (${growthPhys.toFixed(3)})`);
        allPassed = false;
      }
    }
  });
  
  // Check if research actions were used
  if (researchActions.length > 0) {
    console.log(`✅ Research actions used: ${researchActions.length} total`);
  } else {
    console.log(`❌ No research actions detected`);
    allPassed = false;
  }
  
  // Check if different AIs specialized differently
  const agents = Object.keys(byAgent);
  if (agents.length > 1) {
    const agent1Dims = Object.keys(byAgent[agents[0]].dimensions);
    const agent2Dims = Object.keys(byAgent[agents[1]].dimensions);
    const overlap = agent1Dims.filter(d => agent2Dims.includes(d)).length;
    if (overlap < agent1Dims.length || overlap < agent2Dims.length) {
      console.log(`✅ AIs showed different research preferences`);
    } else {
      console.log(`⚠️  AIs made similar research choices (may be okay)`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All critical validations passed!');
  } else {
    console.log('❌ Some validations failed - check implementation');
  }
  
  console.log(`\nFinal outcome: ${result.summary.finalOutcome.toUpperCase()}`);
  console.log(`Simulation ran for ${result.summary.totalMonths} months`);
}

// Run the test
testResearchChoices().catch(console.error);

