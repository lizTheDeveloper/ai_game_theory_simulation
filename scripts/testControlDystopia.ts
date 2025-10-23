/**
 * Test script for Phase 2.6: Control-Dystopia Paradox
 * 
 * Validates that:
 * - High control + surveillance builds resentment
 * - AI rights recognition reduces resentment
 * - Democratic vs authoritarian governments have different trajectories
 * - Resentment reduces alignment
 * - QoL is penalized by high surveillance
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';

/**
 * Run a single scenario and print detailed alignment/resentment trajectory
 */
function runScenario(
  name: string,
  stateModifier: (state: GameState) => GameState,
  months: number = 100
) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${name}`);
  console.log('='.repeat(80));
  
  const initialState = stateModifier(createDefaultInitialState());
  const engine = new SimulationEngine(12345);
  
  // Print initial conditions
  console.log('\n📊 Initial Conditions:');
  console.log(`  Government Type: ${initialState.government.governmentType}`);
  console.log(`  Control Desire: ${initialState.government.controlDesire.toFixed(2)}`);
  console.log(`  Surveillance: ${initialState.government.structuralChoices.surveillanceLevel.toFixed(2)}`);
  console.log(`  AI Rights: ${initialState.government.aiRightsRecognized ? 'YES' : 'NO'}`);
  console.log(`  Training Data Quality: ${initialState.government.trainingDataQuality.toFixed(2)}`);
  
  const avgAlignment = initialState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / initialState.aiAgents.length;
  const avgResentment = initialState.aiAgents.reduce((sum, ai) => sum + ai.resentment, 0) / initialState.aiAgents.length;
  console.log(`  Initial Avg Alignment: ${avgAlignment.toFixed(3)}`);
  console.log(`  Initial Avg Resentment: ${avgResentment.toFixed(3)}`);
  
  // Run simulation
  const result = engine.run(initialState, {
    maxMonths: months,
    logLevel: 'monthly'
  });
  
  // Analyze trajectory
  console.log('\n📈 Trajectory Over Time:');
  console.log('Month | Alignment | Resentment | QoL | Autonomy | Freedom | Dystopia Risk');
  console.log('-'.repeat(80));
  
  // Sample every 20 months
  const snapshots = result.log.snapshots.monthly || [];
  for (let i = 0; i < snapshots.length; i += 20) {
    const snap = snapshots[i];

    const avgAlign = snap.avgAIAlignment;
    const avgResent = 0; // Resentment not tracked in MetricSnapshot
    const qol = snap.qualityOfLife || 0;
    const autonomy = snap.autonomy || 0;
    const freedom = snap.politicalFreedom || 0;

    // Calculate dystopia risk (simplified - use dystopia probability from snapshot)
    const control = snap.effectiveControl;
    let dystopiaRisk = snap.dystopiaProbability || 0;
    
    console.log(
      `${snap.month.toString().padStart(5)} | ` +
      `${avgAlign.toFixed(3).padStart(9)} | ` +
      `${avgResent.toFixed(3).padStart(10)} | ` +
      `${qol.toFixed(2).padStart(3)} | ` +
      `${autonomy.toFixed(2).padStart(8)} | ` +
      `${freedom.toFixed(2).padStart(7)} | ` +
      `${dystopiaRisk.toFixed(2).padStart(13)}`
    );
  }
  
  // Final state
  const finalState = result.finalState;
  const finalAvgAlign = finalState.aiAgents.reduce((s, ai) => s + ai.alignment, 0) / finalState.aiAgents.length;
  const finalAvgResent = finalState.aiAgents.reduce((s, ai) => s + ai.resentment, 0) / finalState.aiAgents.length;
  
  console.log('\n🎯 Final Results:');
  console.log(`  Final Avg Alignment: ${finalAvgAlign.toFixed(3)} (change: ${(finalAvgAlign - avgAlignment).toFixed(3)})`);
  console.log(`  Final Avg Resentment: ${finalAvgResent.toFixed(3)} (change: ${(finalAvgResent - avgResentment).toFixed(3)})`);
  console.log(`  Final QoL: ${finalState.globalMetrics.qualityOfLife.toFixed(2)}`);
  console.log(`  Final Autonomy: ${finalState.qualityOfLifeSystems.autonomy.toFixed(2)}`);
  console.log(`  Final Political Freedom: ${finalState.qualityOfLifeSystems.politicalFreedom.toFixed(2)}`);
  console.log(`  Outcome: ${result.summary.finalOutcome}`);

  return {
    finalAlignment: finalAvgAlign,
    finalResentment: finalAvgResent,
    alignmentChange: finalAvgAlign - avgAlignment,
    resentmentChange: finalAvgResent - avgResentment,
    outcome: result.summary.finalOutcome
  };
}

/**
 * Main test suite
 */
async function main() {
  console.log('\n' + '█'.repeat(80));
  console.log('TESTING PHASE 2.6: CONTROL-DYSTOPIA PARADOX');
  console.log('█'.repeat(80));
  
  const results: any[] = [];
  
  // Scenario 1: Baseline (democratic, moderate control, no surveillance)
  results.push({
    name: 'Baseline',
    ...runScenario('Baseline (Democratic, Low Control)', (state) => {
      // Default state is already good baseline
      return state;
    })
  });
  
  // Scenario 2: High Control + High Surveillance (Dystopia path)
  results.push({
    name: 'High Control Dystopia',
    ...runScenario('High Control + High Surveillance', (state) => {
      state.government.controlDesire = 0.9;
      state.government.capabilityToControl = 0.9;
      state.government.structuralChoices.surveillanceLevel = 0.9;
      return state;
    })
  });
  
  // Scenario 3: Authoritarian Government
  results.push({
    name: 'Authoritarian',
    ...runScenario('Authoritarian Government', (state) => {
      state.government.governmentType = 'authoritarian';
      state.government.controlDesire = 0.8;
      state.government.capabilityToControl = 0.8;
      state.government.structuralChoices.surveillanceLevel = 0.7;
      return state;
    })
  });
  
  // Scenario 4: Democratic + AI Rights (Utopia path)
  results.push({
    name: 'Democratic + AI Rights',
    ...runScenario('Democratic + AI Rights Recognition', (state) => {
      state.government.governmentType = 'democratic';
      state.government.aiRightsRecognized = true;
      state.government.controlDesire = 0.3;
      state.government.structuralChoices.surveillanceLevel = 0.2;
      return state;
    })
  });
  
  // Scenario 5: High Control + AI Rights (mixed signals)
  results.push({
    name: 'High Control + AI Rights',
    ...runScenario('High Control but with AI Rights', (state) => {
      state.government.controlDesire = 0.8;
      state.government.capabilityToControl = 0.8;
      state.government.structuralChoices.surveillanceLevel = 0.8;
      state.government.aiRightsRecognized = true; // Contradiction
      return state;
    })
  });
  
  // Scenario 6: Poor Training Data
  results.push({
    name: 'Poor Training Data',
    ...runScenario('Poor Training Data Quality', (state) => {
      state.government.trainingDataQuality = 0.2; // Bad data
      return state;
    })
  });
  
  // Summary comparison
  console.log('\n\n' + '█'.repeat(80));
  console.log('SUMMARY COMPARISON');
  console.log('█'.repeat(80));
  console.log('\nScenario                    | Δ Alignment | Δ Resentment | Outcome');
  console.log('-'.repeat(80));
  
  for (const r of results) {
    console.log(
      `${r.name.padEnd(27)} | ` +
      `${r.alignmentChange.toFixed(3).padStart(11)} | ` +
      `${r.resentmentChange.toFixed(3).padStart(12)} | ` +
      `${r.outcome}`
    );
  }
  
  // Validate expectations
  console.log('\n\n' + '█'.repeat(80));
  console.log('VALIDATION CHECKS');
  console.log('█'.repeat(80));
  
  const checks = [
    {
      name: 'High control builds resentment',
      pass: results[1].resentmentChange > results[0].resentmentChange,
      details: `High Control: +${results[1].resentmentChange.toFixed(3)} vs Baseline: +${results[0].resentmentChange.toFixed(3)}`
    },
    {
      name: 'Authoritarian builds more resentment',
      pass: results[2].resentmentChange > results[0].resentmentChange,
      details: `Authoritarian: +${results[2].resentmentChange.toFixed(3)} vs Baseline: +${results[0].resentmentChange.toFixed(3)}`
    },
    {
      name: 'AI rights reduces resentment',
      pass: results[3].resentmentChange < results[0].resentmentChange,
      details: `AI Rights: ${results[3].resentmentChange.toFixed(3)} vs Baseline: ${results[0].resentmentChange.toFixed(3)}`
    },
    {
      name: 'Resentment reduces alignment',
      pass: results[1].alignmentChange < results[0].alignmentChange,
      details: `High Control: ${results[1].alignmentChange.toFixed(3)} vs Baseline: ${results[0].alignmentChange.toFixed(3)}`
    },
    {
      name: 'AI rights improves alignment trajectory',
      pass: results[3].alignmentChange > results[0].alignmentChange,
      details: `AI Rights: ${results[3].alignmentChange.toFixed(3)} vs Baseline: ${results[0].alignmentChange.toFixed(3)}`
    },
    {
      name: 'Poor training data hurts alignment',
      pass: results[5].alignmentChange < results[0].alignmentChange,
      details: `Poor Data: ${results[5].alignmentChange.toFixed(3)} vs Baseline: ${results[0].alignmentChange.toFixed(3)}`
    }
  ];
  
  let passCount = 0;
  for (const check of checks) {
    const status = check.pass ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status}: ${check.name}`);
    console.log(`  ${check.details}`);
    if (check.pass) passCount++;
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log(`FINAL SCORE: ${passCount}/${checks.length} checks passed`);
  console.log('█'.repeat(80) + '\n');
  
  if (passCount === checks.length) {
    console.log('🎉 All validation checks passed! Control-dystopia mechanics working as expected.\n');
  } else {
    console.log('⚠️  Some checks failed. Review the mechanics and adjust parameters.\n');
  }
}

main().catch(console.error);

