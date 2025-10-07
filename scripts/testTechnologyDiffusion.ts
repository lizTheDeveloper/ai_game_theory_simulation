#!/usr/bin/env tsx
/**
 * Test Technology Diffusion System
 * 
 * Run a simulation and observe:
 * - Capability breakthroughs being detected
 * - Frontier capabilities rising over time
 * - Capability floor diffusing toward frontier
 * - New AIs starting with higher capabilities
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';

console.log('\n🧪 TESTING TECHNOLOGY DIFFUSION SYSTEM');
console.log('='.repeat(80));

const NUM_RUNS = 3;
const MAX_MONTHS = 120;

console.log(`\n⚙️  Configuration: ${NUM_RUNS} runs × ${MAX_MONTHS} months\n`);

for (let run = 0; run < NUM_RUNS; run++) {
  const seed = 88000 + run;
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run + 1}/${NUM_RUNS} (seed: ${seed})`);
  console.log('='.repeat(80));
  
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'none' });
  const initialState = createDefaultInitialState();
  
  // Track initial state
  const initialFrontier = calculateTotalCapabilityFromProfile(initialState.ecosystem.frontierCapabilities);
  const initialFloor = calculateTotalCapabilityFromProfile(initialState.ecosystem.capabilityFloor);
  
  console.log(`\n📊 INITIAL STATE:`);
  console.log(`  Frontier Capability: ${initialFrontier.toFixed(3)}`);
  console.log(`  Capability Floor: ${initialFloor.toFixed(3)}`);
  
  const result = engine.run(initialState, { maxMonths: MAX_MONTHS, checkActualOutcomes: true });
  const finalState = result.finalState;
  
  // Track final state
  const finalFrontier = calculateTotalCapabilityFromProfile(finalState.ecosystem.frontierCapabilities);
  const finalFloor = calculateTotalCapabilityFromProfile(finalState.ecosystem.capabilityFloor);
  
  console.log(`\n📊 FINAL STATE (Month ${MAX_MONTHS}):`);
  console.log(`  Frontier Capability: ${finalFrontier.toFixed(3)} (+${(finalFrontier - initialFrontier).toFixed(3)})`);
  console.log(`  Capability Floor: ${finalFloor.toFixed(3)} (+${(finalFloor - initialFloor).toFixed(3)})`);
  console.log(`  Floor/Frontier Ratio: ${((finalFloor / finalFrontier) * 100).toFixed(1)}%`);
  
  // Analyze breakthroughs
  const breakthroughs = finalState.ecosystem.breakthroughs;
  console.log(`\n🔬 BREAKTHROUGHS:`);
  console.log(`  Total Breakthroughs: ${breakthroughs.length}`);
  
  if (breakthroughs.length > 0) {
    // Group by dimension
    const byDimension: Record<string, number> = {};
    breakthroughs.forEach(b => {
      const dim = b.dimension.split('.')[0];
      byDimension[dim] = (byDimension[dim] || 0) + 1;
    });
    
    console.log(`  By Dimension:`);
    for (const [dim, count] of Object.entries(byDimension).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${dim}: ${count}`);
    }
    
    // Show first 5 breakthroughs
    console.log(`\n  First 5 Breakthroughs:`);
    breakthroughs.slice(0, 5).forEach((b, idx) => {
      console.log(`    ${idx + 1}. Month ${b.month}: ${b.dimension} = ${b.value.toFixed(3)} (${b.aiId})`);
    });
    
    // Show last 5 breakthroughs
    if (breakthroughs.length > 5) {
      console.log(`\n  Last 5 Breakthroughs:`);
      breakthroughs.slice(-5).forEach((b, idx) => {
        console.log(`    ${idx + 1}. Month ${b.month}: ${b.dimension} = ${b.value.toFixed(3)} (${b.aiId})`);
      });
    }
  }
  
  // Analyze new AI capabilities over time
  const aisCreatedAtStart = finalState.aiAgents.filter(ai => ai.creationMonth === 0);
  const aisCreatedAtMonth60 = finalState.aiAgents.filter(ai => ai.creationMonth === 60);
  const aisCreatedAtMonth120 = finalState.aiAgents.filter(ai => ai.creationMonth === 119 || ai.creationMonth === 120);
  
  console.log(`\n📈 NEW AI CAPABILITIES OVER TIME:`);
  
  if (aisCreatedAtStart.length > 0) {
    const avgCapStart = aisCreatedAtStart.reduce((sum, ai) => 
      sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0
    ) / aisCreatedAtStart.length;
    console.log(`  Month 0 (${aisCreatedAtStart.length} AIs): ${avgCapStart.toFixed(3)} avg capability`);
  }
  
  if (aisCreatedAtMonth60.length > 0) {
    const avgCapMid = aisCreatedAtMonth60.reduce((sum, ai) => 
      sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0
    ) / aisCreatedAtMonth60.length;
    console.log(`  Month 60 (${aisCreatedAtMonth60.length} AIs): ${avgCapMid.toFixed(3)} avg capability`);
  }
  
  if (aisCreatedAtMonth120.length > 0) {
    const avgCapEnd = aisCreatedAtMonth120.reduce((sum, ai) => 
      sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0
    ) / aisCreatedAtMonth120.length;
    console.log(`  Month 120 (${aisCreatedAtMonth120.length} AIs): ${avgCapEnd.toFixed(3)} avg capability`);
  }
  
  // Check diffusion risk
  const { analyzeDiffusionRisk } = require('../src/simulation/technologyDiffusion');
  const risk = analyzeDiffusionRisk(finalState);
  
  console.log(`\n⚠️  DIFFUSION RISK ANALYSIS:`);
  console.log(`  Risk Level: ${risk.riskLevel.toUpperCase()}`);
  if (risk.reasons.length > 0) {
    console.log(`  Reasons:`);
    risk.reasons.forEach(r => console.log(`    - ${r}`));
  } else {
    console.log(`  No significant risks detected`);
  }
  
  // Outcome
  console.log(`\n🎯 OUTCOME: ${finalState.outcomeMetrics.activeAttractor}`);
}

console.log(`\n\n${'='.repeat(80)}`);
console.log('✅ Test complete!');
console.log('='.repeat(80) + '\n');

