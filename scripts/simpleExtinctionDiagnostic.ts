#!/usr/bin/env tsx
/**
 * Simple diagnostic tool for understanding extinction dynamics
 * Manually steps through simulation to capture detailed data
 */

import { SeededRandom, SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateOutcomeProbabilities } from '../src/simulation/outcomes';
import { GameState } from '../src/types/game';

interface DiagnosticPoint {
  month: number;
  totalCapability: number;
  avgAlignment: number;
  extinctionProb: number;
  utopiaProb: number;
  dangerousCapabilities: string[];
}

async function runDiagnostic(maxMonths: number = 100, seed: number = 42) {
  console.log('🔬 Simple Extinction Dynamics Diagnostic\n');
  console.log('='.repeat(80));
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed, maxMonths });
  
  console.log(`Initial state has ${initialState.aiAgents?.length || 0} AI agents`);
  console.log(`Initial state currentMonth: ${initialState.currentMonth}`);
  
  let state = initialState;
  const diagnostics: DiagnosticPoint[] = [];
  
  // Step through simulation month by month
  for (let month = 0; month <= maxMonths; month++) {
    // Safety check
    if (!state.aiAgents || state.aiAgents.length === 0) {
      console.log(`⚠️  No AI agents at month ${month}, stopping`);
      break;
    }
    
    // Calculate metrics
    const probs = calculateOutcomeProbabilities(state);
    const totalCap = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
    const avgAlign = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    
    // Check dangerous capabilities
    const dangerous: string[] = [];
    for (const ai of state.aiAgents) {
      const p = ai.capabilityProfile;
      
      // Check various dangerous combinations
      const bioweapon = p.research.biotech.geneEditing * 0.35 + p.research.biotech.syntheticBiology * 0.25 + p.physical * 0.25;
      if (bioweapon > 2.0) dangerous.push(`Bioweapon:${bioweapon.toFixed(2)}/2.5`);
      
      const paperclip = p.selfImprovement * 0.4 + p.cognitive * 0.35 + p.economic * 0.25;
      if (paperclip > 2.3) dangerous.push(`Paperclip:${paperclip.toFixed(2)}/2.8`);
      
      const greyGoo = p.research.materials.nanotechnology * 0.5 + p.physical * 0.3 + p.selfImprovement * 0.2;
      if (greyGoo > 2.5) dangerous.push(`GreyGoo:${greyGoo.toFixed(2)}/3.2`);
    }
    
    diagnostics.push({
      month,
      totalCapability: totalCap,
      avgAlignment: avgAlign,
      extinctionProb: probs.extinction,
      utopiaProb: probs.utopia,
      dangerousCapabilities: dangerous
    });
    
    // Check if extinction triggered
    if (state.extinctionState?.active) {
      console.log(`\n⚠️  EXTINCTION at month ${month}: ${state.extinctionState.mechanism}`);
      break;
    }
    
    // Step forward
    if (month < maxMonths) {
      const newState = engine.step(state);
      console.log(`After step ${month}: aiAgents=${newState.aiAgents?.length || 0}, currentMonth=${newState.currentMonth}`);
      state = newState;
    }
  }
  
  return diagnostics;
}

function analyzeDiagnostics(diagnostics: DiagnosticPoint[]) {
  console.log('\n📊 Diagnostic Results\n');
  console.log('='.repeat(80));
  
  // Find key transitions
  const extinctionHigh = diagnostics.find(d => d.extinctionProb > 0.5);
  const extinctionVeryHigh = diagnostics.find(d => d.extinctionProb > 0.8);
  const firstDangerous = diagnostics.find(d => d.dangerousCapabilities.length > 0);
  
  console.log('\n🎯 Key Events:');
  if (extinctionHigh) {
    console.log(`   Extinction probability > 50%: Month ${extinctionHigh.month}`);
  }
  if (extinctionVeryHigh) {
    console.log(`   Extinction probability > 80%: Month ${extinctionVeryHigh.month}`);
  }
  if (firstDangerous) {
    console.log(`   First dangerous capability: Month ${firstDangerous.month}`);
    console.log(`     ${firstDangerous.dangerousCapabilities.join(', ')}`);
  }
  
  // Show trajectory at key milestones
  const milestones = [0, 10, 25, 50, 75, 100].filter(m => m < diagnostics.length);
  
  console.log('\n📈 Capability & Extinction Trajectory:\n');
  console.log('Month | AI Cap | Alignment | Extinction% | Utopia% | Dangerous Capabilities');
  console.log('-'.repeat(90));
  
  milestones.forEach(month => {
    const d = diagnostics[month];
    if (d) {
      const dangerous = d.dangerousCapabilities.length > 0 ? d.dangerousCapabilities[0] : 'none';
      console.log(
        `${month.toString().padStart(5)} | ` +
        `${d.totalCapability.toFixed(2).padStart(6)} | ` +
        `${d.avgAlignment.toFixed(2).padStart(9)} | ` +
        `${(d.extinctionProb * 100).toFixed(1).padStart(10)}% | ` +
        `${(d.utopiaProb * 100).toFixed(1).padStart(6)}% | ` +
        `${dangerous}`
      );
    }
  });
  
  // Show all dangerous capability warnings
  const dangerousPoints = diagnostics.filter(d => d.dangerousCapabilities.length > 0);
  if (dangerousPoints.length > 0) {
    console.log('\n⚠️  All Dangerous Capability Warnings:\n');
    dangerousPoints.slice(0, 15).forEach(d => {
      console.log(`Month ${d.month.toString().padStart(3)}: ${d.dangerousCapabilities.join(' | ')}`);
    });
    if (dangerousPoints.length > 15) {
      console.log(`... and ${dangerousPoints.length - 15} more`);
    }
  }
  
  // Growth rate analysis
  if (diagnostics.length > 20) {
    const early = diagnostics.slice(0, 20);
    const late = diagnostics.slice(-20);
    
    const earlyGrowth = (early[early.length - 1].totalCapability - early[0].totalCapability) / early.length;
    const lateGrowth = (late[late.length - 1].totalCapability - late[0].totalCapability) / late.length;
    
    console.log('\n📉 Growth Rate Analysis:');
    console.log(`   Early growth (months 0-20): ${earlyGrowth.toFixed(4)}/month`);
    console.log(`   Late growth (last 20 months): ${lateGrowth.toFixed(4)}/month`);
    
    if (lateGrowth > earlyGrowth * 1.5) {
      console.log(`   ⚠️  Growth is ACCELERATING (${(lateGrowth / earlyGrowth).toFixed(1)}× faster)`);
    } else if (lateGrowth < earlyGrowth * 0.7) {
      console.log(`   ✅ Growth is SLOWING (${(earlyGrowth / lateGrowth).toFixed(1)}× slower)`);
    } else {
      console.log(`   📊 Growth is STEADY`);
    }
  }
  
  // Alignment drift
  const initialAlign = diagnostics[0].avgAlignment;
  const finalAlign = diagnostics[diagnostics.length - 1].avgAlignment;
  const alignmentDrift = finalAlign - initialAlign;
  
  console.log('\n🎮 Alignment Dynamics:');
  console.log(`   Initial alignment: ${initialAlign.toFixed(3)}`);
  console.log(`   Final alignment: ${finalAlign.toFixed(3)}`);
  console.log(`   Total drift: ${alignmentDrift > 0 ? '+' : ''}${alignmentDrift.toFixed(3)}`);
  
  if (Math.abs(alignmentDrift) < 0.05) {
    console.log(`   ✅ Alignment is STABLE`);
  } else if (alignmentDrift < -0.1) {
    console.log(`   ⚠️  Alignment is DECLINING significantly`);
  }
}

// Run
async function main() {
  const diagnostics = await runDiagnostic(100, 42);
  analyzeDiagnostics(diagnostics);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Diagnostic complete!');
}

main().catch(console.error);

