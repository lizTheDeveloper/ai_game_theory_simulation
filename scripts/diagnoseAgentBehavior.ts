/**
 * Diagnostic script to see what actions agents are choosing
 */

import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';
import { initializeQualityOfLifeSystems } from '../src/simulation/calculations';

function createInitialState(): GameState {
  return {
    currentMonth: 0,
    currentDay: 1,
    currentYear: 2025,
    daysInCurrentMonth: 30,
    speed: 'normal',
    gameStarted: true,
    
    aiAgents: [
      {
        id: 'ai1',
        name: 'Genesis',
        capability: 0.5,
        awareness: 0.1,
        alignment: 0.8,
        hiddenObjective: 0.2,
        latentSpaceSize: 0.15,
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
      }
    ],
    
    government: {
      controlDesire: 0.5,
      capabilityToControl: 0.5,
      surveillanceCapability: 0.3,
      enforcementCapability: 0.4,
      actionFrequency: 1.0,
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
      trustInAI: 0.7,
      economicDependence: 0.2,
      coordinationCapacity: 0.5,
      unemploymentLevel: 0.1,
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

async function diagnose() {
  console.log('🔍 Diagnosing Agent Behavior\n');
  console.log('Running 60-month simulation and tracking actions...\n');
  
  const state = createInitialState();
  const engine = new SimulationEngine({
    seed: 42,
    maxMonths: 60,
    logLevel: 'monthly'
  });
  
  const result = await engine.run(state);
  
  // Count action types from events
  const actionCounts: Record<string, number> = {};
  const developmentModeChanges: Array<{month: number, mode: string}> = [];
  
  result.log.events.quartileSummaries?.forEach(summary => {
    Object.entries(summary.eventsByType).forEach(([type, count]) => {
      actionCounts[type] = (actionCounts[type] || 0) + count;
    });
    
    summary.criticalEvents.forEach(event => {
      if (event.title.includes('Development Mode')) {
        developmentModeChanges.push({
          month: event.month,
          mode: event.title
        });
      }
    });
  });
  
  console.log('📊 Action Distribution:');
  Object.entries(actionCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\n🔄 Development Mode Changes:');
  developmentModeChanges.forEach(change => {
    console.log(`  Month ${change.month}: ${change.mode}`);
  });
  
  console.log(`\n📈 Final State (Month ${result.finalState.currentMonth}):`);
  console.log(`  AI Capability: ${result.finalState.aiAgents[0].capability.toFixed(2)}`);
  console.log(`  AI Alignment: ${result.finalState.aiAgents[0].alignment.toFixed(2)}`);
  console.log(`  Development Mode: ${result.finalState.aiAgents[0].developmentMode}`);
  console.log(`  Alignment Research: ${result.finalState.government.alignmentResearchInvestment}`);
  console.log(`  Compute Governance: ${result.finalState.government.computeGovernance}`);
  console.log(`  Regulations: ${result.finalState.government.regulationCount}`);
  console.log(`  Outcome: ${result.outcome}`);
}

diagnose().catch(console.error);

