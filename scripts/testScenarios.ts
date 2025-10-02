#!/usr/bin/env tsx
/**
 * Test multiple scenarios to understand AI alignment dynamics
 */

import { runMonteCarlo } from '../src/simulation-runner/monteCarlo';
import { createInitialState } from './runSimulation';

console.log('AI Alignment Scenario Analysis');
console.log('==============================\n');

async function runScenario(name: string, stateModifier: (state: any) => void, configOverrides: any = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SCENARIO: ${name}`);
  console.log('='.repeat(60));
  
  const state = createInitialState();
  stateModifier(state);
  
  const config = {
    numRuns: 100,
    maxMonths: 60,
    ...configOverrides
  };
  
  const results = await runMonteCarlo(state, config);
  
  console.log('\nOutcome Distribution:');
  console.log(`  Utopia:     ${(results.outcomeDistribution.utopia * 100).toFixed(1)}%`);
  console.log(`  Dystopia:   ${(results.outcomeDistribution.dystopia * 100).toFixed(1)}%`);
  console.log(`  Extinction: ${(results.outcomeDistribution.extinction * 100).toFixed(1)}%`);
  
  console.log('\nKey Metrics:');
  console.log(`  Avg Final AI Capability: ${results.averageMetrics.finalQualityOfLife / 20}`);
  console.log(`  Avg Final Unemployment:  ${(results.averageMetrics.finalUnemployment * 100).toFixed(1)}%`);
  console.log(`  Avg Final Trust:         ${(results.averageMetrics.finalTrust * 100).toFixed(1)}%`);
  console.log(`  Avg Economic Stage:      ${results.averageMetrics.finalEconomicStage.toFixed(2)}`);
  
  return results;
}

async function main() {
  // Scenario 1: BASELINE (current settings)
  await runScenario(
    '1. BASELINE (Current Settings)',
    (state) => {
      // No modifications
    }
  );
  
  // Scenario 2: FAST GOVERNMENT RESPONSE
  await runScenario(
    '2. FAST GOVERNMENT (10x faster response)',
    (state) => {},
    {
      parameters: {
        governmentActionFrequency: [1.0] // Monthly instead of yearly
      }
    }
  );
  
  // Scenario 3: HIGH INITIAL ALIGNMENT
  await runScenario(
    '3. HIGH ALIGNMENT (AI starts well-aligned)',
    (state) => {
      state.aiAgents.forEach((ai: any) => {
        ai.alignment = 0.95; // Very high initial alignment
        ai.hiddenObjective = 0.5; // Pro-human
      });
    }
  );
  
  // Scenario 4: SLOW AI GROWTH
  await runScenario(
    '4. SLOW AI GROWTH (Capability capped at 1.0)',
    (state) => {
      state.aiAgents.forEach((ai: any) => {
        ai.capability = 0.1; // Start lower
      });
      // Note: Would need to modify action to cap growth
    }
  );
  
  // Scenario 5: EARLY UBI
  await runScenario(
    '5. EARLY UBI (Pre-emptive economic policy)',
    (state) => {
      state.government.activeRegulations.push('Universal Basic Income Program');
      state.globalMetrics.wealthDistribution = 0.7;
      state.globalMetrics.economicTransitionStage = 1.5;
    }
  );
  
  // Scenario 6: COORDINATED SOCIETY
  await runScenario(
    '6. COORDINATED SOCIETY (High initial coordination)',
    (state) => {
      state.society.coordinationCapacity = 0.8;
      state.society.socialAdaptation = 0.3; // Higher starting point
    }
  );
  
  // Scenario 7: SLOW ADAPTATION
  await runScenario(
    '7. SLOW ADAPTATION (Society adapts very slowly)',
    (state) => {},
    {
      parameters: {
        socialAdaptationRate: [0.2] // 5x slower
      }
    }
  );
  
  // Scenario 8: BALANCED APPROACH
  await runScenario(
    '8. BALANCED (Moderate government + high alignment)',
    (state) => {
      state.aiAgents.forEach((ai: any) => {
        ai.alignment = 0.85;
        ai.hiddenObjective = 0.3;
      });
    },
    {
      parameters: {
        governmentActionFrequency: [0.5], // Moderate
        socialAdaptationRate: [1.5] // Faster
      }
    }
  );
  
  console.log('\n\n' + '='.repeat(60));
  console.log('ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log('\nSee devlog/scenario-analysis-[date].md for detailed analysis');
}

main().catch(console.error);

