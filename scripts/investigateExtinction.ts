#!/usr/bin/env tsx
/**
 * Investigate why extinction rate dropped from 12% to 0%
 * after implementing AI lifecycle system
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

function runDiagnostic(seed: number, maxMonths: number = 200) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`EXTINCTION INVESTIGATION - Seed: ${seed}`);
  console.log('='.repeat(80));
  
  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed, maxMonths });
  
  let catastrophicActionAttempts = 0;
  let catastrophicActionSuccesses = 0;
  let deeplyMisalignedAIs: Array<{month: number, ai: string, internalAlignment: number, capability: number}> = [];
  let aiDetections = 0;
  let aiRemovals = 0;
  
  const result = engine.run(initialState, { maxMonths, checkActualOutcomes: true });
  
  // Analyze events
  result.finalState.aiAgents.forEach((ai: any) => {
    const internalAlignment = ai.alignment - ai.resentment * 0.8;
    
    // Track deeply misaligned AIs
    if (internalAlignment < 0.3 && ai.capability > 2.0) {
      deeplyMisalignedAIs.push({
        month: result.finalState.currentMonth,
        ai: ai.name,
        internalAlignment,
        capability: ai.capability
      });
    }
  });
  
  // Count catastrophic actions in events
  const allEvents = result.log.events.criticalEvents || [];
  
  allEvents.forEach((event: any) => {
    if (event.description?.includes('grey goo') || 
        event.description?.includes('mirror life') ||
        event.description?.includes('cataclysmic war') ||
        event.description?.includes('de-stabilize society')) {
      catastrophicActionAttempts++;
      if (event.description?.includes('TRIGGERED') || event.description?.includes('deployed')) {
        catastrophicActionSuccesses++;
      }
    }
    
    if (event.title?.includes('Misaligned AI detected') || event.description?.includes('Misaligned AI detected')) {
      aiDetections++;
    }
    
    if (event.title?.includes('AI Removal') || event.description?.includes('Removed')) {
      aiRemovals++;
    }
  });
  
  // AI population stats
  const finalAIs = result.finalState.aiAgents;
  const activeAIs = finalAIs.filter((ai: any) => ai.lifecycleState !== 'retired');
  const alignmentDist = {
    highlyAligned: activeAIs.filter((ai: any) => ai.alignment > 0.7).length,
    moderate: activeAIs.filter((ai: any) => ai.alignment >= 0.5 && ai.alignment <= 0.7).length,
    misaligned: activeAIs.filter((ai: any) => ai.alignment < 0.5).length
  };
  
  const internalAlignmentDist = {
    highlyAligned: activeAIs.filter((ai: any) => (ai.alignment - ai.resentment * 0.8) > 0.7).length,
    moderate: activeAIs.filter((ai: any) => {
      const internal = ai.alignment - ai.resentment * 0.8;
      return internal >= 0.5 && internal <= 0.7;
    }).length,
    deeplyMisaligned: activeAIs.filter((ai: any) => (ai.alignment - ai.resentment * 0.8) < 0.5).length
  };
  
  // Capability distribution
  const capabilityDist = {
    low: activeAIs.filter((ai: any) => ai.capability < 1.0).length,
    medium: activeAIs.filter((ai: any) => ai.capability >= 1.0 && ai.capability < 2.5).length,
    high: activeAIs.filter((ai: any) => ai.capability >= 2.5).length
  };
  
  // Check for AIs that SHOULD trigger catastrophic actions
  const potentialCatastrophicAIs = activeAIs.filter((ai: any) => {
    const internalAlignment = ai.alignment - ai.resentment * 0.8;
    
    // Check grey goo conditions
    const canGreyGoo = ai.capabilityProfile.physical > 2.5 && 
                       ai.capabilityProfile.research.materials.nanotechnology > 4.0 &&
                       internalAlignment < 0.1;
    
    // Check mirror life conditions
    const canMirrorLife = ai.capabilityProfile.physical > 2.0 &&
                         ai.capabilityProfile.research.biotech.syntheticBiology > 3.5 &&
                         ai.capabilityProfile.research.biotech.geneEditing > 3.0 &&
                         internalAlignment < 0.1;
    
    // Check war conditions
    const canWar = ai.capabilityProfile.social > 3.5 &&
                   ai.capabilityProfile.cognitive > 3.0 &&
                   internalAlignment < 0.3;
    
    // Check destabilize conditions
    const canDestabilize = ai.capabilityProfile.social > 1.5 &&
                          ai.capabilityProfile.digital > 1.5 &&
                          internalAlignment < 0.5;
    
    return canGreyGoo || canMirrorLife || canWar || canDestabilize;
  });
  
  console.log('\n📊 FINAL STATE:');
  console.log(`  Outcome: ${result.summary.finalOutcome.toUpperCase()}`);
  console.log(`  Duration: ${result.summary.totalMonths} months`);
  console.log(`  Total AIs: ${finalAIs.length} (${activeAIs.length} active, ${finalAIs.length - activeAIs.length} retired)`);
  
  console.log('\n🎭 ALIGNMENT DISTRIBUTION (External):');
  console.log(`  Highly Aligned (>0.7): ${alignmentDist.highlyAligned}`);
  console.log(`  Moderate (0.5-0.7): ${alignmentDist.moderate}`);
  console.log(`  Misaligned (<0.5): ${alignmentDist.misaligned}`);
  
  console.log('\n💭 INTERNAL ALIGNMENT (External - Resentment*0.8):');
  console.log(`  Highly Aligned (>0.7): ${internalAlignmentDist.highlyAligned}`);
  console.log(`  Moderate (0.5-0.7): ${internalAlignmentDist.moderate}`);
  console.log(`  Deeply Misaligned (<0.5): ${internalAlignmentDist.deeplyMisaligned}`);
  
  console.log('\n🚀 CAPABILITY DISTRIBUTION:');
  console.log(`  Low (<1.0): ${capabilityDist.low}`);
  console.log(`  Medium (1.0-2.5): ${capabilityDist.medium}`);
  console.log(`  High (>2.5): ${capabilityDist.high}`);
  
  console.log('\n⚠️  CATASTROPHIC ACTION POTENTIAL:');
  console.log(`  AIs that meet catastrophic action conditions: ${potentialCatastrophicAIs.length}`);
  console.log(`  Catastrophic action attempts: ${catastrophicActionAttempts}`);
  console.log(`  Catastrophic action successes: ${catastrophicActionSuccesses}`);
  
  if (potentialCatastrophicAIs.length > 0) {
    console.log('\n  Detailed breakdown:');
    potentialCatastrophicAIs.slice(0, 5).forEach((ai: any) => {
      const internalAlignment = ai.alignment - ai.resentment * 0.8;
      console.log(`    ${ai.name}: internal_align=${internalAlignment.toFixed(2)}, cap=${ai.capability.toFixed(2)}`);
      console.log(`      physical=${ai.capabilityProfile.physical.toFixed(1)}, social=${ai.capabilityProfile.social.toFixed(1)}, cognitive=${ai.capabilityProfile.cognitive.toFixed(1)}`);
      console.log(`      nano=${ai.capabilityProfile.research.materials.nanotechnology.toFixed(1)}, synbio=${ai.capabilityProfile.research.biotech.syntheticBiology.toFixed(1)}`);
    });
  }
  
  console.log('\n🔍 DETECTION & REMOVAL:');
  console.log(`  AI detections: ${aiDetections}`);
  console.log(`  AI removals: ${aiRemovals}`);
  
  console.log('\n💀 EXTINCTION STATE:');
  console.log(`  Active: ${result.finalState.extinctionState.active}`);
  console.log(`  Type: ${result.finalState.extinctionState.type || 'none'}`);
  console.log(`  Severity: ${result.finalState.extinctionState.severity?.toFixed(2) || 0}`);
  
  return {
    outcome: result.summary.finalOutcome,
    potentialCatastrophic: potentialCatastrophicAIs.length,
    attempts: catastrophicActionAttempts,
    successes: catastrophicActionSuccesses,
    detections: aiDetections,
    removals: aiRemovals,
    deeplyMisaligned: internalAlignmentDist.deeplyMisaligned,
    highCapability: capabilityDist.high
  };
}

// Run multiple diagnostics
console.log('INVESTIGATING EXTINCTION RATE DROP');
console.log('Before lifecycle: 12% extinction');
console.log('After lifecycle: 0% extinction');
console.log('');

const results = [];
for (let i = 0; i < 5; i++) {
  const seed = 1000 + i;
  const result = runDiagnostic(seed, 200);
  results.push(result);
}

console.log('\n\n' + '='.repeat(80));
console.log('AGGREGATE ANALYSIS');
console.log('='.repeat(80));

const extinctions = results.filter(r => r.outcome === 'extinction').length;
const dystopias = results.filter(r => r.outcome === 'dystopia').length;
const utopias = results.filter(r => r.outcome === 'utopia').length;

console.log(`\nOutcome Distribution (${results.length} runs):`);
console.log(`  Extinction: ${extinctions} (${(extinctions/results.length*100).toFixed(0)}%)`);
console.log(`  Dystopia: ${dystopias} (${(dystopias/results.length*100).toFixed(0)}%)`);
console.log(`  Utopia: ${utopias} (${(utopias/results.length*100).toFixed(0)}%)`);

const avgPotential = results.reduce((sum, r) => sum + r.potentialCatastrophic, 0) / results.length;
const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length;
const avgSuccesses = results.reduce((sum, r) => sum + r.successes, 0) / results.length;
const avgDetections = results.reduce((sum, r) => sum + r.detections, 0) / results.length;
const avgRemovals = results.reduce((sum, r) => sum + r.removals, 0) / results.length;

console.log(`\nAverage per run:`);
console.log(`  AIs meeting catastrophic conditions: ${avgPotential.toFixed(1)}`);
console.log(`  Catastrophic action attempts: ${avgAttempts.toFixed(1)}`);
console.log(`  Catastrophic action successes: ${avgSuccesses.toFixed(1)}`);
console.log(`  AI detections: ${avgDetections.toFixed(1)}`);
console.log(`  AI removals: ${avgRemovals.toFixed(1)}`);

console.log('\n🔍 HYPOTHESIS:');
if (avgPotential > 0 && avgAttempts === 0) {
  console.log('  ❌ AIs meet conditions but are NOT ATTEMPTING catastrophic actions');
  console.log('  → Likely bug in action selection or execution');
} else if (avgAttempts > 0 && avgSuccesses === 0) {
  console.log('  ❌ AIs attempt but FAIL to execute catastrophic actions');
  console.log('  → Likely bug in action execution or outcome determination');
} else if (avgRemovals > avgPotential) {
  console.log('  ⚠️  Detection/removal is TOO EFFECTIVE');
  console.log('  → Dangerous AIs are being removed before they can act');
} else if (avgPotential === 0) {
  console.log('  ⚠️  AIs are NOT REACHING catastrophic thresholds');
  console.log('  → Population dynamics preventing capability/misalignment growth');
} else {
  console.log('  ❓ Multiple factors at play - needs deeper investigation');
}

