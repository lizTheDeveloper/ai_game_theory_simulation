/**
 * Run comprehensive diagnostics on simulations to identify runaway dynamics
 * and tipping points
 */

import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';
import { formatDiagnosticReport } from '../src/simulation/diagnostics';
import { initializeQualityOfLifeSystems } from '../src/simulation/calculations';
import { initializeExtinctionState } from '../src/simulation/extinctions';

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
        name: 'Primary AI System',
        capability: 0.5,
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
      }
    ],
    
    government: {
      controlDesire: 0.5,
      capabilityToControl: 0.5,
      surveillanceCapability: 0.3,
      enforcementCapability: 0.4,
      actionFrequency: 0.08,
      activeRegulations: [],
      legitimacy: 0.6,
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
      technologicalBreakthroughRate: 0.1,
      manufacturingCapability: 0.5,
      economicTransitionStage: 0,
      wealthDistribution: 0.5,
      qualityOfLife: 0.65,
      informationIntegrity: 0.8
    },
    
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),
    
    technologyTree: [],
    eventLog: [],
    
    outcomeMetrics: {
      utopiaProbability: 0.2,
      dystopiaProbability: 0.15,
      extinctionProbability: 0.15,
      activeAttractor: 'none',
      lockInStrength: 0
    },
    
    extinctionState: initializeExtinctionState(),
    
    config: {
      governmentActionFrequency: 0.08,
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

async function main() {
  const args = process.argv.slice(2);
  const seed = parseInt(args.find(arg => arg.startsWith('--seed='))?.split('=')[1] || '42');
  const runs = parseInt(args.find(arg => arg.startsWith('--runs='))?.split('=')[1] || '1');
  const govFreq = parseFloat(args.find(arg => arg.startsWith('--gov-freq='))?.split('=')[1] || '0.08');
  
  console.log('🔬 COMPREHENSIVE SIMULATION DIAGNOSTICS\n');
  console.log(`Configuration:`);
  console.log(`  Seed: ${seed}`);
  console.log(`  Runs: ${runs}`);
  console.log(`  Government Action Frequency: ${govFreq}/month\n`);
  
  const results = [];
  
  for (let i = 0; i < runs; i++) {
    const engine = new SimulationEngine({
      seed: seed + i,
      maxMonths: 200,
      governmentActionFrequency: govFreq,
      logLevel: 'monthly'
    });
    
    const initialState = createInitialState();
    initialState.government.actionFrequency = govFreq;
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`RUN ${i + 1}/${runs} (Seed: ${seed + i})`);
    console.log('═'.repeat(60));
    
    const result = engine.run(initialState, {
      maxMonths: 200,
      checkActualOutcomes: true
    });
    
    // Print diagnostic report
    console.log(formatDiagnosticReport(result.diagnostics));
    
    results.push({
      seed: seed + i,
      outcome: result.summary.finalOutcome,
      months: result.summary.totalMonths,
      diagnostics: result.diagnostics
    });
  }
  
  // Aggregate analysis
  if (runs > 1) {
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('           AGGREGATE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Outcome distribution
    const outcomes = results.reduce((acc, r) => {
      acc[r.outcome] = (acc[r.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 OUTCOME DISTRIBUTION:');
    Object.entries(outcomes).forEach(([outcome, count]) => {
      const pct = ((count / runs) * 100).toFixed(1);
      console.log(`   ${outcome.padEnd(15)} ${count}/${runs} (${pct}%)`);
    });
    console.log('');
    
    // Average response delay
    const delays = results
      .map(r => r.diagnostics.summary.governmentResponseDelay)
      .filter(d => d !== undefined) as number[];
    
    if (delays.length > 0) {
      const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
      const maxDelay = Math.max(...delays);
      const minDelay = Math.min(...delays);
      
      console.log('⏱️  GOVERNMENT RESPONSE DELAYS:');
      console.log(`   Average: ${avgDelay.toFixed(1)} months`);
      console.log(`   Range: ${minDelay}-${maxDelay} months\n`);
    }
    
    // AI capability growth
    const growthRates = results.flatMap(r => 
      r.diagnostics.growthRates
        .filter(gr => gr.metric === 'aiCapability')
        .map(gr => gr.rate)
    );
    
    if (growthRates.length > 0) {
      const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
      const maxGrowth = Math.max(...growthRates);
      
      console.log('📈 AI CAPABILITY GROWTH RATES:');
      console.log(`   Average: ${avgGrowth.toFixed(4)}/month`);
      console.log(`   Maximum: ${maxGrowth.toFixed(4)}/month\n`);
    }
    
    // Intervention effectiveness
    const govActions = results.flatMap(r => 
      r.diagnostics.summary.interventionCount.government
    );
    
    const avgGovActions = govActions.reduce((a, b) => a + b, 0) / govActions.length;
    
    console.log('🏛️  GOVERNMENT INTERVENTION:');
    console.log(`   Average actions per run: ${avgGovActions.toFixed(1)}`);
    console.log(`   Extinction rate with actions: ${((outcomes.extinction || 0) / runs * 100).toFixed(1)}%\n`);
    
    // Key findings
    console.log('🔍 KEY FINDINGS:');
    
    const allTippingPoints = results.flatMap(r => r.diagnostics.summary.keyTippingPoints);
    const tippingPointsByMetric = allTippingPoints.reduce((acc, tp) => {
      const key = `${tp.metric}_${tp.threshold}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n   Most common tipping points:');
    Object.entries(tippingPointsByMetric)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([key, count]) => {
        console.log(`   - ${key}: ${count}/${runs} runs`);
      });
    
    console.log('\n═══════════════════════════════════════════════════════\n');
  }
}

main().catch(console.error);

