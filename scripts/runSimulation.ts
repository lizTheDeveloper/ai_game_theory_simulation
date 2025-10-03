#!/usr/bin/env tsx
/**
 * CLI script for running headless AI Alignment Game simulations
 * 
 * Usage:
 *   npx tsx scripts/runSimulation.ts [options]
 * 
 * Options:
 *   --monte-carlo  Run Monte Carlo simulation with multiple runs
 *   --runs N       Number of Monte Carlo runs (default: 1000)
 *   --seed N       Random seed for reproducibility
 *   --max-months N Maximum months to simulate (default: 500)
 *   --export FILE  Export results to JSON file
 */

import { SimulationEngine, SimulationConfig } from '../src/simulation/engine';
import { runMonteCarlo, exportResults, MonteCarloConfig } from '../src/simulation-runner/monteCarlo';
import { GameState } from '../src/types/game';

// Import initial state creation from gameStore
// For now, we'll create a minimal initial state
function createInitialState(): GameState {
  const initialYear = 2025;
  const initialMonth = 0;
  
  return {
    currentMonth: initialMonth,
    currentDay: 1,
    currentYear: initialYear,
    daysInCurrentMonth: 31,
    speed: 'paused',
    gameStarted: false,
    
    aiAgents: [
      {
        id: 'ai1',
        name: 'Genesis',
        capability: 0.2,
        awareness: 0.1,
        alignment: 0.8,
        hiddenObjective: 0.2,
        latentSpaceSize: 0.15,
        developmentMode: 'fast' as const,
        selfReplicationLevel: 0,
        selfImprovementLevel: 0,
        resourceControl: 0,
        manipulationCapability: 0,
        hackingCapability: 0,
        escaped: false,
        beneficialActions: 0,
        harmfulActions: 0,
        discoveredBreakthroughs: new Set()
      },
      {
        id: 'ai2',
        name: 'Prometheus',
        capability: 0.15,
        awareness: 0.12,
        alignment: 0.75,
        hiddenObjective: 0.1,
        latentSpaceSize: 0.2,
        developmentMode: 'fast' as const,
        selfReplicationLevel: 0,
        selfImprovementLevel: 0,
        resourceControl: 0,
        manipulationCapability: 0,
        hackingCapability: 0,
        escaped: false,
        beneficialActions: 0,
        harmfulActions: 0,
        discoveredBreakthroughs: new Set()
      },
      {
        id: 'ai3',
        name: 'Oracle',
        capability: 0.25,
        awareness: 0.08,
        alignment: 0.85,
        hiddenObjective: 0.3,
        latentSpaceSize: 0.1,
        developmentMode: 'fast' as const,
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
      controlDesire: 0.3,
      capabilityToControl: 0.5,
      surveillanceCapability: 0.3,
      enforcementCapability: 0.4,
      actionFrequency: 0.08,
      activeRegulations: [],
      legitimacy: 0.6,
      lastMajorPolicyMonth: -12,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none' as const,
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
      economicDependence: 0.2,
      coordinationCapacity: 0.4,
      unemploymentLevel: 0.1,
      socialAdaptation: 0.1,
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
      wealthDistribution: 0.4,
      qualityOfLife: 0.6,
      informationIntegrity: 0.8
    },
    
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
      governmentActionFrequency: 0.08,
      socialAdaptationRate: 1.0,
      aiCoordinationMultiplier: 1.0,
      economicTransitionRate: 1.0
    },
    
    history: {
      qualityOfLife: [{ month: 0, value: 0.6 }],
      outcomeProbs: [{ month: 0, utopia: 0.33, dystopia: 0.33, extinction: 0.34 }],
      controlCapability: [{ month: 0, effectiveControl: 0.5, totalAICapability: 0.6 }],
      metrics: [{
        month: 0,
        unemployment: 0.1,
        socialAdaptation: 0.1,
        trustInAI: 0.6,
        totalAICapability: 0.6,
        avgAIAlignment: 0.8,
        effectiveControl: 0.5,
        wealthDistribution: 0.4,
        socialStability: 0.7,
        economicStage: 0,
        governmentLegitimacy: 0.6,
        coordinationCapacity: 0.4,
        economicDependence: 0.2
      }]
    }
  };
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options: any = {
    monteCarlo: false,
    runs: 1000,
    seed: Date.now(),
    maxMonths: 500,
    export: null
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--monte-carlo':
        options.monteCarlo = true;
        break;
      case '--runs':
        options.runs = parseInt(args[++i]);
        break;
      case '--seed':
        options.seed = parseInt(args[++i]);
        break;
      case '--max-months':
        options.maxMonths = parseInt(args[++i]);
        break;
      case '--export':
        options.export = args[++i];
        break;
      case '--help':
        console.log(`
AI Alignment Game - Headless Simulation Runner

Usage: npx tsx scripts/runSimulation.ts [options]

Options:
  --monte-carlo     Run Monte Carlo simulation with multiple runs
  --runs N          Number of Monte Carlo runs (default: 1000)
  --seed N          Random seed for reproducibility
  --max-months N    Maximum months to simulate (default: 500)
  --export FILE     Export results to JSON file
  --help            Show this help message

Examples:
  # Run a single simulation
  npx tsx scripts/runSimulation.ts --seed 42

  # Run Monte Carlo with 10,000 runs
  npx tsx scripts/runSimulation.ts --monte-carlo --runs 10000

  # Test specific scenario with fixed seed
  npx tsx scripts/runSimulation.ts --seed 12345 --max-months 100
        `);
        process.exit(0);
    }
  }
  
  return options;
}

/**
 * Run single simulation
 */
async function runSingleSimulation(options: any) {
  console.log('Starting single simulation...');
  console.log(`Seed: ${options.seed}`);
  console.log(`Max months: ${options.maxMonths}\n`);
  
  const initialState = createInitialState();
  const engine = new SimulationEngine({
    seed: options.seed,
    maxMonths: options.maxMonths
  });
  
  const startTime = Date.now();
  const result = engine.run(initialState, {
    maxMonths: options.maxMonths,
    checkActualOutcomes: true
  });
  const elapsed = Date.now() - startTime;
  
  console.log('\nSimulation Complete!');
  console.log('===================');
  console.log(`Duration: ${elapsed}ms`);
  console.log(`Months simulated: ${result.summary.totalMonths}`);
  console.log(`\nFinal Outcome: ${result.summary.finalOutcome.toUpperCase()}`);
  console.log(`Outcome Probability: ${(result.summary.finalOutcomeProbability * 100).toFixed(1)}%`);
  console.log(`\nFinal State:`);
  console.log(`  Economic Stage: ${result.finalState.globalMetrics.economicTransitionStage.toFixed(2)}`);
  console.log(`  Quality of Life: ${result.finalState.globalMetrics.qualityOfLife.toFixed(2)}`);
  console.log(`  Unemployment: ${(result.finalState.society.unemploymentLevel * 100).toFixed(1)}%`);
  console.log(`  Trust in AI: ${(result.finalState.society.trustInAI * 100).toFixed(1)}%`);
  console.log(`  Social Adaptation: ${(result.finalState.society.socialAdaptation * 100).toFixed(1)}%`);
}

/**
 * Run Monte Carlo simulation
 */
async function runMonteCarloSimulation(options: any) {
  console.log('Starting Monte Carlo simulation...');
  console.log(`Number of runs: ${options.runs}`);
  console.log(`Max months per run: ${options.maxMonths}`);
  console.log(`Base seed: ${options.seed}\n`);
  
  const initialState = createInitialState();
  
  const monteCarloConfig: MonteCarloConfig = {
    numRuns: options.runs,
    maxMonths: options.maxMonths,
    parallel: false, // TODO: Implement parallel execution
    
    // Parameter sweep: test different government response rates
    parameters: {
      governmentActionFrequency: [0.08, 0.5, 1.0],
      socialAdaptationRate: [0.5, 1.0, 1.5]
    },
    
    // Add some variation to initial conditions
    initialStateVariation: {
      aiCapability: { mean: 0.2, stdDev: 0.05 },
      aiAlignment: { mean: 0.8, stdDev: 0.1 },
      unemployment: { mean: 0.1, stdDev: 0.02 }
    }
  };
  
  const startTime = Date.now();
  const results = await runMonteCarlo(initialState, monteCarloConfig);
  const elapsed = Date.now() - startTime;
  
  console.log(`\nCompleted in ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`Average: ${(elapsed / options.runs).toFixed(1)}ms per simulation\n`);
  
  exportResults(results, options.export || 'results.json');
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();
  
  try {
    if (options.monteCarlo) {
      await runMonteCarloSimulation(options);
    } else {
      await runSingleSimulation(options);
    }
  } catch (error) {
    console.error('Simulation failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main, createInitialState };

