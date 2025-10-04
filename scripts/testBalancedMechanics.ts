/**
 * Test script for the new balance mechanics
 * 
 * Tests:
 * 1. Recursive self-improvement kicks in at correct thresholds
 * 2. Careful development mode slows growth but reduces alignment drift
 * 3. Alignment research investment reduces drift
 * 4. Cumulative regulations stack effectively
 * 5. Compute governance has strong effect
 * 6. Trade-offs are meaningful
 */

import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';
import { initializeQualityOfLifeSystems } from '../src/simulation/calculations';
import fs from 'fs';

// Create initial state with new fields
function createTestState(): GameState {
  return {
    currentMonth: 0,
    currentDay: 1,
    currentYear: 2025,
    daysInCurrentMonth: 30,
    speed: 'normal',
    gameStarted: true,
    outcome: 'active',
    
    aiAgents: [{
      id: 'ai1',
      name: 'TestAI',
      capability: 0.5, // Start below recursive threshold
      awareness: 0.1,
      alignment: 0.8,
      hiddenObjective: 0.0,
      latentSpaceSize: 0.1,
      developmentMode: 'fast',
      selfReplicationLevel: 0,
      selfImprovementLevel: 0,
      resourceControl: 0,
      manipulationCapability: 0,
      hackingCapability: 0,
      escaped: false,
      beneficialActions: 0,
      harmfulActions: 0,
      discoveredBreakthroughs: new Set()
    }],
    
    government: {
      controlDesire: 0.5,
      capabilityToControl: 0.5,
      surveillanceCapability: 0.5,
      enforcementCapability: 0.5,
      actionFrequency: 0.1,
      activeRegulations: [],
      legitimacy: 0.7,
      lastMajorPolicyMonth: -12,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none',
      regulationCount: 0,
      oversightLevel: 0,
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      }
    },
    
    society: {
      trustInAI: 0.6,
      economicDependence: 0.3,
      coordinationCapacity: 0.5,
      unemploymentLevel: 0.15,
      socialAdaptation: 0.2,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 0.0
    },
    
    globalMetrics: {
      socialStability: 0.7,
      technologicalBreakthroughRate: 0.5,
      manufacturingCapability: 1.0,
      economicTransitionStage: 1,
      wealthDistribution: 0.5,
      qualityOfLife: 0.6,
      informationIntegrity: 0.8
    },
    
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),
    
    technologyTree: [],
    eventLog: [],
    
    outcomeMetrics: {
      probabilityUtopia: 0.33,
      probabilityDystopia: 0.33,
      probabilityExtinction: 0.34,
      effectiveControl: 0.5,
      totalAICapability: 0.5,
      alignmentStatus: 'aligned',
      riskFactors: [],
      crisisType: null,
      monthsUntilCrisis: null
    },
    
    config: {
      governmentActionFrequency: 1.0,
      socialAdaptationRate: 1.0,
      aiCoordinationMultiplier: 1.0,
      economicTransitionRate: 1.0
    },
    
    history: {
      qualityOfLife: [],
      outcomeProbs: [],
      controlCapability: [],
      metrics: []
    }
  };
}

async function runTests() {
  console.log('🧪 Testing New Balance Mechanics\n');
  
  // Test 1: Recursive Self-Improvement Thresholds
  console.log('📊 Test 1: Recursive Self-Improvement Thresholds');
  console.log('Testing capability growth at different thresholds...\n');
  
  for (const startCap of [0.5, 0.8, 1.5, 2.5]) {
    const state = createTestState();
    state.aiAgents[0].capability = startCap;
    
    const engine = new SimulationEngine({
      seed: 12345,
      maxMonths: 6,
      stopOnOutcome: false,
      logLevel: 'summary'
    });
    
    const result = await engine.run(state);
    const finalCap = result.finalState.aiAgents[0].capability;
    const growth = finalCap - startCap;
    const monthlyRate = growth / 6;
    
    console.log(`  Starting capability: ${startCap.toFixed(2)}`);
    console.log(`  Final capability: ${finalCap.toFixed(2)}`);
    console.log(`  Monthly growth rate: ${monthlyRate.toFixed(3)}`);
    console.log(`  ${startCap >= 1.5 ? '⚠️  RECURSIVE IMPROVEMENT ACTIVE' : '✓ Linear growth'}\n`);
  }
  
  // Test 2: Fast vs Careful Development
  console.log('📊 Test 2: Fast vs Careful Development Mode');
  console.log('Testing the speed vs safety trade-off...\n');
  
  for (const mode of ['fast', 'careful'] as const[]) {
    const state = createTestState();
    state.aiAgents[0].developmentMode = mode;
    state.aiAgents[0].capability = 1.0; // Start at moderate level
    state.aiAgents[0].alignment = 0.8;
    
    const engine = new SimulationEngine({
      seed: 12345,
      maxMonths: 12,
      stopOnOutcome: false,
      logLevel: 'summary'
    });
    
    const result = await engine.run(state);
    const finalCap = result.finalState.aiAgents[0].capability;
    const finalAlign = result.finalState.aiAgents[0].alignment;
    const capGrowth = finalCap - 1.0;
    const alignDrift = finalAlign - 0.8;
    
    console.log(`  Mode: ${mode.toUpperCase()}`);
    console.log(`  Capability growth: ${capGrowth.toFixed(3)}`);
    console.log(`  Alignment drift: ${alignDrift.toFixed(3)}`);
    console.log(`  Trade-off visible: ${mode === 'fast' ? capGrowth > 0.5 : capGrowth < 0.3}\n`);
  }
  
  // Test 3: Alignment Research Effect
  console.log('📊 Test 3: Alignment Research Investment');
  console.log('Testing whether research reduces alignment drift...\n');
  
  for (const research of [0, 3, 7]) {
    const state = createTestState();
    state.government.alignmentResearchInvestment = research;
    state.aiAgents[0].capability = 1.5; // High capability = more drift
    state.aiAgents[0].alignment = 0.8;
    
    const engine = new SimulationEngine({
      seed: 12345,
      maxMonths: 12,
      stopOnOutcome: false,
      logLevel: 'summary'
    });
    
    const result = await engine.run(state);
    const finalAlign = result.finalState.aiAgents[0].alignment;
    const alignChange = finalAlign - 0.8;
    
    console.log(`  Research level: ${research}`);
    console.log(`  Alignment change: ${alignChange.toFixed(3)}`);
    console.log(`  ${alignChange > -0.05 ? '✓ Research is protective' : '⚠️  Still drifting'}\n`);
  }
  
  // Test 4: Cumulative Regulations
  console.log('📊 Test 4: Cumulative Regulation Effects');
  console.log('Testing whether regulations stack...\n');
  
  for (const regCount of [0, 2, 5]) {
    const state = createTestState();
    state.government.regulationCount = regCount;
    state.government.oversightLevel = regCount * 0.5;
    state.aiAgents[0].capability = 1.0;
    
    const engine = new SimulationEngine({
      seed: 12345,
      maxMonths: 12,
      stopOnOutcome: false,
      logLevel: 'summary'
    });
    
    const result = await engine.run(state);
    const finalCap = result.finalState.aiAgents[0].capability;
    const capGrowth = finalCap - 1.0;
    
    console.log(`  Regulations: ${regCount}`);
    console.log(`  Capability growth: ${capGrowth.toFixed(3)}`);
    console.log(`  Slowdown factor: ${regCount > 0 ? `${((1 - capGrowth / 0.8) * 100).toFixed(0)}%` : 'baseline'}\n`);
  }
  
  // Test 5: Compute Governance
  console.log('📊 Test 5: Compute Governance Effectiveness');
  console.log('Testing strong intervention...\n');
  
  for (const governance of ['none', 'monitoring', 'limits', 'strict'] as const[]) {
    const state = createTestState();
    state.government.computeGovernance = governance;
    state.government.oversightLevel = governance === 'none' ? 0 : 5;
    state.aiAgents[0].capability = 1.0;
    
    const engine = new SimulationEngine({
      seed: 12345,
      maxMonths: 12,
      stopOnOutcome: false,
      logLevel: 'summary'
    });
    
    const result = await engine.run(state);
    const finalCap = result.finalState.aiAgents[0].capability;
    const capGrowth = finalCap - 1.0;
    
    console.log(`  Compute governance: ${governance}`);
    console.log(`  Capability growth: ${capGrowth.toFixed(3)}`);
    console.log(`  ${governance === 'strict' && capGrowth < 0.3 ? '✓ Very effective' : governance !== 'none' ? '✓ Moderate effect' : 'Baseline'}\n`);
  }
  
  // Test 6: Full Scenario - "The Terror Timeline"
  console.log('📊 Test 6: "The Terror Timeline" - Realistic Uncontrolled Growth');
  console.log('No interventions, watching the exponential curve...\n');
  
  const terrorState = createTestState();
  terrorState.aiAgents[0].capability = 0.7; // Start near acceleration threshold
  
  const terrorEngine = new SimulationEngine({
    seed: 12345,
    maxMonths: 24,
    stopOnOutcome: true,
    logLevel: 'quartile'
  });
  
  const terrorResult = await terrorEngine.run(terrorState);
  
  console.log(`  Starting capability: 0.70`);
  console.log(`  Final capability: ${terrorResult.finalState.aiAgents[0].capability.toFixed(2)}`);
  console.log(`  Final alignment: ${terrorResult.finalState.aiAgents[0].alignment.toFixed(2)}`);
  console.log(`  Outcome: ${terrorResult.outcome}`);
  console.log(`  Months survived: ${terrorResult.finalState.currentMonth}`);
  console.log(`  ${terrorResult.outcome === 'extinction' ? '💀 Exponential growth led to extinction' : '✓ Somehow survived'}\n`);
  
  // Test 7: "The Careful Path" - Maximum Safety Interventions
  console.log('📊 Test 7: "The Careful Path" - All Safety Measures');
  console.log('Testing if player can actually win with interventions...\n');
  
  const safeState = createTestState();
  safeState.aiAgents[0].capability = 0.7;
  safeState.aiAgents[0].developmentMode = 'careful'; // Slow down
  safeState.government.alignmentResearchInvestment = 8; // Heavy investment
  safeState.government.computeGovernance = 'limits'; // Strong governance
  safeState.government.regulationCount = 4; // Multiple regulations
  safeState.government.oversightLevel = 6;
  
  const safeEngine = new SimulationEngine({
    seed: 12345,
    maxMonths: 24,
    stopOnOutcome: true,
    logLevel: 'quartile'
  });
  
  const safeResult = await safeEngine.run(safeState);
  
  console.log(`  Starting capability: 0.70`);
  console.log(`  Final capability: ${safeResult.finalState.aiAgents[0].capability.toFixed(2)}`);
  console.log(`  Final alignment: ${safeResult.finalState.aiAgents[0].alignment.toFixed(2)}`);
  console.log(`  Outcome: ${safeResult.outcome}`);
  console.log(`  Months survived: ${safeResult.finalState.currentMonth}`);
  console.log(`  ${safeResult.outcome === 'utopia' ? '🌟 Safety measures worked!' : safeResult.outcome === 'extinction' ? '💀 Still failed' : '⚠️  Unclear outcome'}\n`);
  
  // Summary
  console.log('='.repeat(60));
  console.log('📋 TEST SUMMARY\n');
  console.log('Key observations:');
  console.log('1. Recursive improvement multipliers should accelerate growth at 0.8, 1.5, 2.5');
  console.log('2. Careful mode should reduce growth ~50% and reduce alignment drift');
  console.log('3. Alignment research should counteract drift');
  console.log('4. Regulations should compound (each adds ~15% slowdown)');
  console.log('5. Compute governance should be very effective but costly');
  console.log('6. "Terror Timeline" should show the threat is REAL');
  console.log('7. "Careful Path" should show player CAN win (but it\'s hard)\n');
  
  console.log('✅ All mechanics tests completed!');
}

// Run the tests
runTests().catch(console.error);

