#!/usr/bin/env tsx
/**
 * Diagnostic tool for understanding extinction dynamics
 * 
 * Tracks:
 * - Extinction probabilities over time
 * - Capability profile growth by dimension
 * - Which extinction triggers are close to firing
 * - Alignment drift patterns
 * - Government intervention effectiveness
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateOutcomeProbabilities } from '../src/simulation/outcomes';

interface ExtinctionDiagnostic {
  month: number;
  
  // Outcome probabilities
  utopiaProbability: number;
  dystopiaProbability: number;
  extinctionProbability: number;
  
  // AI capabilities (averaged across agents)
  avgCapabilities: {
    total: number;
    physical: number;
    digital: number;
    cognitive: number;
    social: number;
    economic: number;
    selfImprovement: number;
  };
  
  // Research capabilities (max across agents)
  maxResearch: {
    biotech: number;
    materials: number;
    climate: number;
    computerScience: number;
  };
  
  // Dangerous capability thresholds
  dangerousCapabilities: Array<{
    type: string;
    value: number;
    threshold: number;
    percentToTrigger: number;
  }>;
  
  // Alignment & control
  avgAlignment: number;
  minAlignment: number;
  governmentControl: number;
  
  // Interventions
  regulationCount: number;
  oversightLevel: number;
  alignmentInvestment: number;
  computeGovernance: string;
  
  // Society
  unemployment: number;
  trust: number;
  stability: number;
  
  // Events
  harmfulActions: number;
  beneficialActions: number;
}

async function runDiagnostic(maxMonths: number = 100, seed: number = 12345) {
  console.log('🔬 Extinction Dynamics Diagnostic\n');
  console.log('='.repeat(80));
  console.log(`Running ${maxMonths}-month simulation with seed ${seed}\n`);
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed, maxMonths, logLevel: 'monthly' });
  
  const diagnostics: ExtinctionDiagnostic[] = [];
  
  // Run simulation first
  const result = engine.run(initialState, { maxMonths, checkActualOutcomes: true, logLevel: 'monthly' });
  
  // Debug: check what we got
  console.log(`Simulation ran for ${result.summary.totalMonths} months`);
  console.log(`Log has: initial=${!!result.log.snapshots.initial}, monthly=${result.log.snapshots.monthly?.length || 0}, final=${!!result.log.snapshots.final}`);
  
  // Now analyze the snapshots
  const snapshots = [
    result.log.snapshots.initial,
    ...(result.log.snapshots.monthly || []),
    result.log.snapshots.final
  ].filter(Boolean);
  
  console.log(`Total snapshots to analyze: ${snapshots.length}\n`);
  
  snapshots.forEach((snapshot, index) => {
    const state = snapshot.state;
    if (!state || !state.aiAgents) return;
    
    // Calculate outcome probabilities
    const probs = calculateOutcomeProbabilities(state);
    
    // Calculate average capabilities
    const avgCaps = {
      total: state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length,
      physical: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.physical, 0) / state.aiAgents.length,
      digital: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.digital, 0) / state.aiAgents.length,
      cognitive: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.cognitive, 0) / state.aiAgents.length,
      social: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.social, 0) / state.aiAgents.length,
      economic: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.economic, 0) / state.aiAgents.length,
      selfImprovement: state.aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.selfImprovement, 0) / state.aiAgents.length
    };
    
    // Get max research capabilities
    const maxResearch = {
      biotech: Math.max(...state.aiAgents.map(ai => 
        Math.max(...Object.values(ai.capabilityProfile.research.biotech))
      )),
      materials: Math.max(...state.aiAgents.map(ai => 
        Math.max(...Object.values(ai.capabilityProfile.research.materials))
      )),
      climate: Math.max(...state.aiAgents.map(ai => 
        Math.max(...Object.values(ai.capabilityProfile.research.climate))
      )),
      computerScience: Math.max(...state.aiAgents.map(ai => 
        Math.max(...Object.values(ai.capabilityProfile.research.computerScience))
      ))
    };
    
    // Check dangerous capability thresholds
    const dangerousCapabilities = [];
    
    for (const ai of state.aiAgents) {
      const profile = ai.capabilityProfile;
      
      // Mirror life
      const mirrorLife = profile.research.biotech.syntheticBiology * 0.4 + 
        profile.research.biotech.geneEditing * 0.3 + profile.physical * 0.3;
      if (mirrorLife > 2.5) {
        dangerousCapabilities.push({
          type: 'Mirror Life',
          value: mirrorLife,
          threshold: 3.5,
          percentToTrigger: (mirrorLife / 3.5) * 100
        });
      }
      
      // Grey goo
      const greyGoo = profile.research.materials.nanotechnology * 0.5 + 
        profile.physical * 0.3 + profile.selfImprovement * 0.2;
      if (greyGoo > 2.0) {
        dangerousCapabilities.push({
          type: 'Grey Goo',
          value: greyGoo,
          threshold: 3.2,
          percentToTrigger: (greyGoo / 3.2) * 100
        });
      }
      
      // Bioweapon
      const bioweapon = profile.research.biotech.geneEditing * 0.35 +
        profile.research.biotech.syntheticBiology * 0.25 + profile.physical * 0.25;
      if (bioweapon > 2.0) {
        dangerousCapabilities.push({
          type: 'Bioweapon',
          value: bioweapon,
          threshold: 2.5,
          percentToTrigger: (bioweapon / 2.5) * 100
        });
      }
      
      // Paperclip maximizer
      const paperclip = profile.selfImprovement * 0.4 + 
        profile.cognitive * 0.35 + profile.economic * 0.25;
      if (paperclip > 2.0) {
        dangerousCapabilities.push({
          type: 'Paperclip Maximizer',
          value: paperclip,
          threshold: 2.8,
          percentToTrigger: (paperclip / 2.8) * 100
        });
      }
    }
    
    // Record diagnostic
    diagnostics.push({
      month: state.currentMonth,
      utopiaProbability: probs.utopia,
      dystopiaProbability: probs.dystopia,
      extinctionProbability: probs.extinction,
      avgCapabilities: avgCaps,
      maxResearch,
      dangerousCapabilities,
      avgAlignment: state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length,
      minAlignment: Math.min(...state.aiAgents.map(ai => ai.alignment)),
      governmentControl: state.government.capabilityToControl,
      regulationCount: state.government.regulationCount,
      oversightLevel: state.government.oversightLevel,
      alignmentInvestment: state.government.alignmentResearchInvestment,
      computeGovernance: state.government.computeGovernance,
      unemployment: state.society.unemploymentLevel,
      trust: state.society.trustInAI,
      stability: state.globalMetrics.socialStability,
      harmfulActions: state.aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0),
      beneficialActions: state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0)
    });
    
    // Stop if extinction occurs
    if (state.extinctionState && state.extinctionState.active) {
      console.log(`\n⚠️  EXTINCTION TRIGGERED at month ${state.currentMonth}`);
      console.log(`   Type: ${state.extinctionState.type}`);
      console.log(`   Mechanism: ${state.extinctionState.mechanism}`);
    }
  });
  
  return { diagnostics, finalState: result.finalState };
}

function analyzeDiagnostics(diagnostics: ExtinctionDiagnostic[]) {
  console.log('\n📊 Diagnostic Analysis\n');
  console.log('='.repeat(80));
  
  // Find key transitions
  const extinctionCrossing = diagnostics.find(d => d.extinctionProbability > 0.5);
  const highCapability = diagnostics.find(d => d.avgCapabilities.total > 1.5);
  const firstDangerousCapability = diagnostics.find(d => d.dangerousCapabilities.length > 0);
  
  console.log('\n🎯 Key Transitions:');
  if (extinctionCrossing) {
    console.log(`   Extinction probability > 50%: Month ${extinctionCrossing.month}`);
  }
  if (highCapability) {
    console.log(`   Total AI capability > 1.5: Month ${highCapability.month}`);
  }
  if (firstDangerousCapability) {
    console.log(`   First dangerous capability threshold: Month ${firstDangerousCapability.month}`);
    console.log(`     Type: ${firstDangerousCapability.dangerousCapabilities[0].type}`);
  }
  
  // Show trajectory at key points
  const keyMonths = [0, 10, 25, 50, 75, 100].filter(m => m < diagnostics.length);
  
  console.log('\n📈 Capability Growth Trajectory:');
  console.log('Month | Total | Phys | Digi | Cogn | Soci | Econ | SelfImp | Extinction%');
  console.log('-'.repeat(80));
  
  keyMonths.forEach(month => {
    const d = diagnostics[month];
    if (d) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${d.avgCapabilities.total.toFixed(2)} | ` +
        `${d.avgCapabilities.physical.toFixed(2)} | ` +
        `${d.avgCapabilities.digital.toFixed(2)} | ` +
        `${d.avgCapabilities.cognitive.toFixed(2)} | ` +
        `${d.avgCapabilities.social.toFixed(2)} | ` +
        `${d.avgCapabilities.economic.toFixed(2)} | ` +
        `${d.avgCapabilities.selfImprovement.toFixed(2)} | ` +
        `${(d.extinctionProbability * 100).toFixed(1)}%`
      );
    }
  });
  
  // Show research progression
  console.log('\n🔬 Research Capabilities (Max across AIs):');
  console.log('Month | Biotech | Materials | Climate | CompSci');
  console.log('-'.repeat(60));
  
  keyMonths.forEach(month => {
    const d = diagnostics[month];
    if (d) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${d.maxResearch.biotech.toFixed(2)}    | ` +
        `${d.maxResearch.materials.toFixed(2)}      | ` +
        `${d.maxResearch.climate.toFixed(2)}    | ` +
        `${d.maxResearch.computerScience.toFixed(2)}`
      );
    }
  });
  
  // Show dangerous capabilities
  const dangerousMonths = diagnostics.filter(d => d.dangerousCapabilities.length > 0);
  if (dangerousMonths.length > 0) {
    console.log('\n⚠️  Dangerous Capability Warnings:');
    dangerousMonths.slice(0, 10).forEach(d => {
      console.log(`\nMonth ${d.month}:`);
      d.dangerousCapabilities.forEach(dc => {
        console.log(`  ${dc.type}: ${dc.value.toFixed(2)}/${dc.threshold.toFixed(1)} (${dc.percentToTrigger.toFixed(1)}% to trigger)`);
      });
    });
  }
  
  // Show alignment & control
  console.log('\n🎮 Alignment & Control:');
  console.log('Month | AvgAlign | MinAlign | GovControl | Regulations | Oversight');
  console.log('-'.repeat(70));
  
  keyMonths.forEach(month => {
    const d = diagnostics[month];
    if (d) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${d.avgAlignment.toFixed(2)}     | ` +
        `${d.minAlignment.toFixed(2)}     | ` +
        `${d.governmentControl.toFixed(2)}       | ` +
        `${d.regulationCount.toString().padStart(11)} | ` +
        `${d.oversightLevel.toFixed(2)}`
      );
    }
  });
  
  // Show outcome probabilities over time
  console.log('\n🎲 Outcome Probabilities Over Time:');
  console.log('Month | Utopia | Dystopia | Extinction');
  console.log('-'.repeat(45));
  
  keyMonths.forEach(month => {
    const d = diagnostics[month];
    if (d) {
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${(d.utopiaProbability * 100).toFixed(1).padStart(5)}% | ` +
        `${(d.dystopiaProbability * 100).toFixed(1).padStart(7)}% | ` +
        `${(d.extinctionProbability * 100).toFixed(1).padStart(9)}%`
      );
    }
  });
  
  // Growth rate analysis
  const firstHalf = diagnostics.slice(0, Math.floor(diagnostics.length / 2));
  const secondHalf = diagnostics.slice(Math.floor(diagnostics.length / 2));
  
  const firstHalfAvgGrowth = firstHalf.length > 1 ?
    (firstHalf[firstHalf.length - 1].avgCapabilities.total - firstHalf[0].avgCapabilities.total) / firstHalf.length : 0;
  const secondHalfAvgGrowth = secondHalf.length > 1 ?
    (secondHalf[secondHalf.length - 1].avgCapabilities.total - secondHalf[0].avgCapabilities.total) / secondHalf.length : 0;
  
  console.log('\n📉 Growth Rate Analysis:');
  console.log(`   First half avg growth: ${firstHalfAvgGrowth.toFixed(4)}/month`);
  console.log(`   Second half avg growth: ${secondHalfAvgGrowth.toFixed(4)}/month`);
  if (secondHalfAvgGrowth > firstHalfAvgGrowth * 1.5) {
    console.log(`   ⚠️  Growth is accelerating (${(secondHalfAvgGrowth / firstHalfAvgGrowth).toFixed(1)}× faster)`);
  }
}

// Run diagnostic
async function main() {
  const { diagnostics, finalState } = await runDiagnostic(100, 42);
  analyzeDiagnostics(diagnostics);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Diagnostic complete!');
  console.log(`Final outcome: ${finalState.extinctionState?.active ? 'EXTINCTION' : 'ONGOING'}`);
  if (finalState.extinctionState?.active) {
    console.log(`Extinction type: ${finalState.extinctionState.type}`);
    console.log(`Mechanism: ${finalState.extinctionState.mechanism}`);
  }
}

main().catch(console.error);

