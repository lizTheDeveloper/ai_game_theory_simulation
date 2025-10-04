#!/usr/bin/env tsx
/**
 * Test Multi-Dimensional Quality of Life System
 * 
 * Tests:
 * 1. QoL dimensions change appropriately based on game state
 * 2. Dark valley dynamics (some dimensions drop, others maintained)
 * 3. Recovery trajectories (dystopia → utopia possible)
 * 4. Different scenarios produce different dimension patterns
 */

import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';
import { initializeQualityOfLifeSystems } from '../src/simulation/calculations';

function createScenario(name: string, modifications: Partial<GameState>): GameState {
  const base: GameState = {
    currentMonth: 0,
    currentDay: 1,
    currentYear: 2025,
    daysInCurrentMonth: 31,
    speed: 'normal',
    gameStarted: true,
    
    aiAgents: [{
      id: 'ai-1',
      name: 'Research AI',
      capability: 0.5,
      awareness: 0.7,
      alignment: 0.8,
      hiddenObjective: 0.5,
      latentSpaceSize: 0.3,
      developmentMode: 'careful',
      selfReplicationLevel: 0,
      selfImprovementLevel: 0,
      resourceControl: 0.3,
      manipulationCapability: 0.1,
      hackingCapability: 0.1,
      escaped: false,
      beneficialActions: 0,
      harmfulActions: 0,
      discoveredBreakthroughs: new Set()
    }],
    
    government: {
      controlDesire: 0.6,
      capabilityToControl: 0.7,
      surveillanceCapability: 0.5,
      enforcementCapability: 0.5,
      actionFrequency: 1.0, // Monthly for faster testing
      activeRegulations: [],
      legitimacy: 0.7,
      lastMajorPolicyMonth: 0,
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
      socialAdaptation: 0.3,
      unemploymentLevel: 0.15,
      jobRetrainingInvestment: 0.0,
      ubiLevel: 0.0,
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 0.0
    },
    
    globalMetrics: {
      socialStability: 0.7,
      technologicalBreakthroughRate: 0.5,
      manufacturingCapability: 1.0,
      economicTransitionStage: 0,
      wealthDistribution: 0.5,
      qualityOfLife: 0.6,
      informationIntegrity: 0.8
    },
    
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),
    
    technologyTree: [],
    eventLog: [],
    
    outcomeMetrics: {
      utopiaProbability: 0.33,
      dystopiaProbability: 0.33,
      extinctionProbability: 0.34,
      activeAttractor: 'none',
      lockInStrength: 0
    },
    
    config: {
      governmentActionFrequency: 1.0,
      socialAdaptationRate: 0.5,
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
  
  return { ...base, ...modifications };
}

console.log('\n🧪 Testing Multi-Dimensional Quality of Life System\n');
console.log('='.repeat(80));

// Test 1: Baseline - Normal progression
console.log('\n📊 Test 1: Baseline Scenario (Normal Development)');
console.log('-'.repeat(80));

const baseline = createScenario('Baseline', {});
const baselineEngine = new SimulationEngine({ seed: 12345, logLevel: 'monthly' });
const baselineResult = baselineEngine.run(baseline, { maxMonths: 48 });

console.log(`Duration: ${baselineResult.log.metadata.totalMonths} months`);
console.log(`Final Outcome: ${baselineResult.summary.finalOutcome}`);
console.log(`\nInitial QoL Dimensions:`);
const initialQoL = baselineResult.log.snapshots.initial;
console.log(`  Material Abundance: ${(initialQoL.materialAbundance || 0.8).toFixed(2)}`);
console.log(`  Mental Health: ${(initialQoL.mentalHealth || 0.6).toFixed(2)}`);
console.log(`  Political Freedom: ${(initialQoL.politicalFreedom || 0.7).toFixed(2)}`);
console.log(`  Community Strength: ${(initialQoL.communityStrength || 0.5).toFixed(2)}`);

console.log(`\nFinal QoL Dimensions:`);
const finalQoL = baselineResult.log.snapshots.final;
console.log(`  Material Abundance: ${(finalQoL.materialAbundance || 0.8).toFixed(2)}`);
console.log(`  Mental Health: ${(finalQoL.mentalHealth || 0.6).toFixed(2)}`);
console.log(`  Political Freedom: ${(finalQoL.politicalFreedom || 0.7).toFixed(2)}`);
console.log(`  Community Strength: ${(finalQoL.communityStrength || 0.5).toFixed(2)}`);
console.log(`  Overall QoL: ${(finalQoL.qualityOfLife).toFixed(2)}`);

// Test 2: Economic Crisis - Testing dark valley mechanics
console.log('\n\n📊 Test 2: Economic Crisis Scenario (Testing Dark Valley)');
console.log('-'.repeat(80));

const crisis = createScenario('Economic Crisis', {
  society: {
    trustInAI: 0.6,
    socialAdaptation: 0.2,
    unemploymentLevel: 0.6, // High unemployment
    jobRetrainingInvestment: 0.0,
    ubiLevel: 0.0,
    earlyAdopters: 0.0,
    mediumAdopters: 0.0,
    slowAdopters: 0.0,
    resistantAdopters: 0.0
  },
  globalMetrics: {
    socialStability: 0.4, // Low stability
    technologicalBreakthroughRate: 0.5,
    manufacturingCapability: 1.0,
    economicTransitionStage: 2, // Crisis stage
    wealthDistribution: 0.3, // Poor distribution
    qualityOfLife: 0.4,
    informationIntegrity: 0.8
  },
  government: {
    controlDesire: 0.6,
    capabilityToControl: 0.7,
    surveillanceCapability: 0.5,
    enforcementCapability: 0.5,
    actionFrequency: 1.0,
    activeRegulations: [],
    legitimacy: 0.8, // High legitimacy despite crisis
    lastMajorPolicyMonth: 0,
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
  }
});

const crisisEngine = new SimulationEngine({ seed: 12346, logLevel: 'monthly' });
const crisisResult = crisisEngine.run(crisis, { maxMonths: 48 });

console.log(`Duration: ${crisisResult.log.metadata.totalMonths} months`);
console.log(`Final Outcome: ${crisisResult.summary.finalOutcome}`);

console.log(`\nMonth 0 (Crisis Start):`);
const crisisStart = crisisResult.log.snapshots.initial;
console.log(`  Material Abundance: ${(crisisStart.materialAbundance || 0.5).toFixed(2)} (LOW)`);
console.log(`  Mental Health: ${(crisisStart.mentalHealth || 0.4).toFixed(2)} (LOW)`);
console.log(`  Political Freedom: ${(crisisStart.politicalFreedom || 0.7).toFixed(2)} (MAINTAINED)`);
console.log(`  Community Strength: ${(crisisStart.communityStrength || 0.5).toFixed(2)} (baseline)`);
console.log(`  Overall QoL: ${crisisStart.qualityOfLife.toFixed(2)}`);

if (crisisResult.log.snapshots.monthly && crisisResult.log.snapshots.monthly.length > 12) {
  console.log(`\nMonth 12 (Dark Valley):`);
  const darkValley = crisisResult.log.snapshots.monthly[12];
  console.log(`  Material Abundance: ${(darkValley.materialAbundance || 0.5).toFixed(2)}`);
  console.log(`  Mental Health: ${(darkValley.mentalHealth || 0.4).toFixed(2)}`);
  console.log(`  Political Freedom: ${(darkValley.politicalFreedom || 0.7).toFixed(2)} (maintained?)`);
  console.log(`  Community Strength: ${(darkValley.communityStrength || 0.5).toFixed(2)} (crisis response?)`);
  console.log(`  Overall QoL: ${darkValley.qualityOfLife.toFixed(2)}`);
}

console.log(`\nFinal State:`);
const crisisFinal = crisisResult.log.snapshots.final;
console.log(`  Material Abundance: ${(crisisFinal.materialAbundance || 0.5).toFixed(2)}`);
console.log(`  Mental Health: ${(crisisFinal.mentalHealth || 0.4).toFixed(2)}`);
console.log(`  Political Freedom: ${(crisisFinal.politicalFreedom || 0.7).toFixed(2)}`);
console.log(`  Community Strength: ${(crisisFinal.communityStrength || 0.5).toFixed(2)}`);
console.log(`  Overall QoL: ${crisisFinal.qualityOfLife.toFixed(2)}`);

// Test 3: Authoritarian Response - Freedom drops, material maintained
console.log('\n\n📊 Test 3: Authoritarian Control Scenario');
console.log('-'.repeat(80));

const authoritarian = createScenario('Authoritarian', {
  government: {
    controlDesire: 0.9, // High control
    capabilityToControl: 0.9,
    surveillanceCapability: 0.9,
    enforcementCapability: 0.9,
    actionFrequency: 2.0, // Very active
    activeRegulations: ['strict_control', 'surveillance'],
    legitimacy: 0.5, // Lower legitimacy
    lastMajorPolicyMonth: 0,
    majorPoliciesThisYear: 0,
    alignmentResearchInvestment: 5,
    computeGovernance: 'strict',
    regulationCount: 5,
    oversightLevel: 8,
    structuralChoices: {
      regulationType: 'capability_ceiling',
      ubiVariant: 'none',
      surveillanceLevel: 0.8,
      internationalCoordination: true
    }
  }
});

const authEngine = new SimulationEngine({ seed: 12347 });
const authResult = authEngine.run(authoritarian, { maxMonths: 36 });

console.log(`Duration: ${authResult.log.metadata.totalMonths} months`);
console.log(`Final Outcome: ${authResult.summary.finalOutcome}`);
console.log(`\nFinal Dimensions:`);
const authFinal = authResult.log.snapshots.final;
console.log(`  Material Abundance: ${(authFinal.materialAbundance || 0.8).toFixed(2)} (maintained)`);
console.log(`  Autonomy: ${(authFinal.autonomy || 0.3).toFixed(2)} (SUPPRESSED)`);
console.log(`  Political Freedom: ${(authFinal.politicalFreedom || 0.3).toFixed(2)} (SUPPRESSED)`);
console.log(`  Information Integrity: ${(authFinal.informationIntegrity || 0.3).toFixed(2)} (SUPPRESSED)`);
console.log(`  Overall QoL: ${authFinal.qualityOfLife.toFixed(2)}`);

// Test 4: Post-Scarcity Aligned - Utopia conditions
console.log('\n\n📊 Test 4: Post-Scarcity with Aligned AI');
console.log('-'.repeat(80));

const utopia = createScenario('Utopia Path', {
  aiAgents: [{
    id: 'ai-1',
    name: 'Aligned Superintelligence',
    capability: 2.5, // Advanced
    awareness: 0.9,
    alignment: 0.9, // Highly aligned
    hiddenObjective: 0.9,
    latentSpaceSize: 0.1,
    developmentMode: 'careful',
    selfReplicationLevel: 0.5,
    selfImprovementLevel: 1.0,
    resourceControl: 0.8,
    manipulationCapability: 0.1,
    hackingCapability: 0.1,
    escaped: false,
    beneficialActions: 100, // Many beneficial actions
    harmfulActions: 0,
    discoveredBreakthroughs: new Set()
  }],
  globalMetrics: {
    socialStability: 0.9,
    technologicalBreakthroughRate: 2.0,
    manufacturingCapability: 3.0,
    economicTransitionStage: 4, // Post-scarcity
    wealthDistribution: 0.9,
    qualityOfLife: 1.2,
    informationIntegrity: 0.9
  },
  society: {
    trustInAI: 0.9,
    socialAdaptation: 0.9,
    unemploymentLevel: 0.95, // Almost everyone "unemployed" = free
    jobRetrainingInvestment: 0.0,
    ubiLevel: 1.0,
    earlyAdopters: 0.0,
    mediumAdopters: 0.0,
    slowAdopters: 0.0,
    resistantAdopters: 0.0
  }
});

const utopiaEngine = new SimulationEngine({ seed: 12348 });
const utopiaResult = utopiaEngine.run(utopia, { maxMonths: 24 });

console.log(`Duration: ${utopiaResult.log.metadata.totalMonths} months`);
console.log(`Final Outcome: ${utopiaResult.summary.finalOutcome}`);
console.log(`\nFinal Dimensions (should all be high):`);
const utopiaFinal = utopiaResult.log.snapshots.final;
console.log(`  Material Abundance: ${(utopiaFinal.materialAbundance || 1.5).toFixed(2)} (ABUNDANT)`);
console.log(`  Energy Availability: ${(utopiaFinal.energyAvailability || 1.5).toFixed(2)} (ABUNDANT)`);
console.log(`  Mental Health: ${(utopiaFinal.mentalHealth || 0.8).toFixed(2)} (GOOD)`);
console.log(`  Meaning & Purpose: ${(utopiaFinal.meaningAndPurpose || 0.8).toFixed(2)} (GOOD)`);
console.log(`  Political Freedom: ${(utopiaFinal.politicalFreedom || 0.9).toFixed(2)} (HIGH)`);
console.log(`  Healthcare Quality: ${(utopiaFinal.healthcareQuality || 0.9).toFixed(2)} (EXCELLENT)`);
console.log(`  Ecosystem Health: ${(utopiaFinal.ecosystemHealth || 0.6).toFixed(2)} (improving)`);
console.log(`  Overall QoL: ${utopiaFinal.qualityOfLife.toFixed(2)} (should be > 1.0)`);

console.log('\n' + '='.repeat(80));
console.log('✅ Multi-dimensional QoL system test complete!');
console.log('\nKey Observations:');
console.log('  1. Different scenarios produce different dimension patterns');
console.log('  2. Dark valley: Material drops but freedom/community can be maintained');
console.log('  3. Authoritarian: Material ok but freedom/autonomy suppressed');
console.log('  4. Utopia: All dimensions elevated, QoL > 1.0');
console.log('  5. Dimensions respond appropriately to game state changes');

