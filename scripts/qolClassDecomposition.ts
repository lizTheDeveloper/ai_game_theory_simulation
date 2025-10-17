#!/usr/bin/env tsx
/**
 * QoL Class Decomposition Script
 *
 * Calculates Quality of Life separately for each socioeconomic segment
 * to detect "Elysium" patterns (elite utopia + mass suffering)
 *
 * Tests whether aggregate QoL (62.6% in baseline) masks class disparities.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { calculateQualityOfLife } from '../src/simulation/qualityOfLife';

interface SegmentQoL {
  segmentName: string;
  economicStatus: string;
  populationFraction: number;
  qol: number;
  materialAbundance: number;
  mentalHealth: number;
  meaningAndPurpose: number;
  unemployment: number;
}

/**
 * Calculate QoL for a specific segment based on their economic status
 * and crisis vulnerabilities
 */
function calculateSegmentQoL(state: GameState, segmentIndex: number): SegmentQoL {
  const segment = state.society.segments[segmentIndex];

  // Get segment skills (if available)
  const skills = (segment as any).skills;
  const unemploymentLevel = state.society.unemploymentLevel || 0;

  // Material abundance affected by economic status and unemployment
  const statusMultipliers: Record<string, number> = {
    'elite': 1.3,       // 30% above average (insulated from unemployment)
    'middle': 1.0,      // Average
    'working': 0.8,     // 20% below average
    'precariat': 0.5,   // 50% below average (severe vulnerability)
  };

  const baseAbundance = state.qualityOfLifeSystems.materialAbundance || 0.7;
  const statusMultiplier = statusMultipliers[segment.economicStatus] || 1.0;

  // Unemployment impact varies by segment
  // Elite: minimal impact (wealth buffer)
  // Precariat: severe impact (no safety net)
  const unemploymentImpact: Record<string, number> = {
    'elite': 0.1,       // 10% of unemployment affects elite
    'middle': 0.5,      // 50% impact
    'working': 0.8,     // 80% impact
    'precariat': 1.2,   // 120% impact (compounds with lack of resources)
  };

  const unemploymentPenalty = unemploymentLevel * (unemploymentImpact[segment.economicStatus] || 0.5);
  const materialAbundance = Math.max(0, Math.min(1, baseAbundance * statusMultiplier * (1 - unemploymentPenalty)));

  // Mental health affected by crisis vulnerability and social status
  const baseMentalHealth = state.qualityOfLifeSystems.mentalHealth || 0.65;
  const crisisImpact = segment.crisisVulnerability * 0.3; // Higher vulnerability = worse mental health
  const mentalHealth = Math.max(0, Math.min(1, baseMentalHealth * (1 - crisisImpact)));

  // Meaning and purpose (affected by unemployment + skills + economic status)
  const baseMeaning = state.qualityOfLifeSystems.meaningAndPurpose || 0.6;

  // Elite: less affected by unemployment (can afford hobbies, education, purpose)
  // Precariat: severely affected (survival mode, no time/resources for meaning)
  const meaningImpact: Record<string, number> = {
    'elite': 0.2,       // 20% of unemployment affects meaning
    'middle': 0.6,      // 60% impact
    'working': 0.9,     // 90% impact
    'precariat': 1.5,   // 150% impact (unemployment + poverty = despair)
  };

  const unemploymentMeaningPenalty = unemploymentLevel * (meaningImpact[segment.economicStatus] || 0.6);
  const meaningAndPurpose = Math.max(0, Math.min(1, baseMeaning * (1 - unemploymentMeaningPenalty)));

  // Calculate aggregate QoL for segment (simplified 3-factor model)
  // Weight: Material 40%, Mental Health 30%, Meaning 30%
  const segmentQoL = (
    materialAbundance * 0.4 +
    mentalHealth * 0.3 +
    meaningAndPurpose * 0.3
  );

  return {
    segmentName: segment.name,
    economicStatus: segment.economicStatus,
    populationFraction: segment.populationFraction,
    qol: segmentQoL,
    materialAbundance,
    mentalHealth,
    meaningAndPurpose,
    unemployment: unemploymentLevel,
  };
}

/**
 * Run baseline scenario and calculate QoL by segment
 */
function runQoLDecomposition(seed: number, maxMonths: number): void {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔬 QoL CLASS DECOMPOSITION ANALYSIS`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Scenario: Baseline (no policy interventions)`);
  console.log(`Seed: ${seed}`);
  console.log(`Duration: ${maxMonths} months (${(maxMonths / 12).toFixed(1)} years)`);

  // Create baseline state
  const initialState = createDefaultInitialState();

  // Run simulation (suppress output)
  const originalLog = console.log;
  console.log = () => {};

  const engine = new SimulationEngine({ seed, maxMonths });
  const result = engine.run(initialState, { maxMonths, checkActualOutcomes: false });

  console.log = originalLog;

  // Calculate aggregate QoL
  const aggregateQoL = calculateQualityOfLife(result.finalState.qualityOfLifeSystems);
  const finalUnemployment = result.finalState.society.unemploymentLevel || 0;

  console.log(`\n📊 AGGREGATE METRICS (Month ${result.finalState.currentMonth}):`);
  console.log(`  Overall QoL: ${(aggregateQoL * 100).toFixed(1)}%`);
  console.log(`  Unemployment: ${(finalUnemployment * 100).toFixed(1)}%`);

  // Calculate QoL for each segment
  console.log(`\n\n🔍 QOL BY SOCIOECONOMIC SEGMENT:\n`);

  console.log('┌────────────────────────────┬──────┬──────┬─────────┬──────────┬─────────┐');
  console.log('│ Segment                    │ Pop% │ QoL  │ Material│ Mental   │ Meaning │');
  console.log('├────────────────────────────┼──────┼──────┼─────────┼──────────┼─────────┤');

  const segmentQoLs: SegmentQoL[] = [];

  for (let i = 0; i < result.finalState.society.segments.length; i++) {
    const segmentQoL = calculateSegmentQoL(result.finalState, i);
    segmentQoLs.push(segmentQoL);

    const name = segmentQoL.segmentName.padEnd(26);
    const pop = `${(segmentQoL.populationFraction * 100).toFixed(0)}%`.padStart(4);
    const qol = `${(segmentQoL.qol * 100).toFixed(1)}%`.padStart(4);
    const material = `${(segmentQoL.materialAbundance * 100).toFixed(1)}%`.padStart(7);
    const mental = `${(segmentQoL.mentalHealth * 100).toFixed(1)}%`.padStart(8);
    const meaning = `${(segmentQoL.meaningAndPurpose * 100).toFixed(1)}%`.padStart(7);

    console.log(`│ ${name} │ ${pop} │ ${qol} │ ${material} │ ${mental} │ ${meaning} │`);
  }

  console.log('└────────────────────────────┴──────┴──────┴─────────┴──────────┴─────────┘');

  // Calculate weighted average (should match aggregate)
  const weightedQoL = segmentQoLs.reduce((sum, s) => sum + s.qol * s.populationFraction, 0);
  console.log(`\nWeighted Average QoL: ${(weightedQoL * 100).toFixed(1)}% (should match aggregate ${(aggregateQoL * 100).toFixed(1)}%)`);

  // Calculate disparity metrics
  const qolValues = segmentQoLs.map(s => s.qol);
  const maxQoL = Math.max(...qolValues);
  const minQoL = Math.min(...qolValues);
  const qolRange = maxQoL - minQoL;
  const qolRatio = maxQoL / Math.max(0.01, minQoL);

  console.log(`\n📈 DISPARITY METRICS:`);
  console.log(`  Highest QoL: ${(maxQoL * 100).toFixed(1)}% (${segmentQoLs.find(s => s.qol === maxQoL)?.segmentName})`);
  console.log(`  Lowest QoL: ${(minQoL * 100).toFixed(1)}% (${segmentQoLs.find(s => s.qol === minQoL)?.segmentName})`);
  console.log(`  Range: ${(qolRange * 100).toFixed(1)} percentage points`);
  console.log(`  Ratio: ${qolRatio.toFixed(2)}x (highest / lowest)`);

  // Detect "Elysium" pattern
  console.log(`\n\n🔬 ELYSIUM PATTERN ANALYSIS:\n`);

  // Elysium criteria:
  // 1. Elite QoL > 80% while Precariat QoL < 40%
  // 2. Aggregate QoL > 60% (hides disparity)
  // 3. Large disparity (ratio > 2.0x)

  const eliteQoL = segmentQoLs.find(s => s.economicStatus === 'elite')?.qol || 0;
  const precariatQoL = segmentQoLs.find(s => s.economicStatus === 'precariat')?.qol || 0;

  const isElysium = eliteQoL > 0.80 && precariatQoL < 0.40 && aggregateQoL > 0.60 && qolRatio > 2.0;

  if (isElysium) {
    console.log(`❌ ELYSIUM PATTERN DETECTED`);
    console.log(`   Elite prosperity (${(eliteQoL * 100).toFixed(1)}%) masks precariat suffering (${(precariatQoL * 100).toFixed(1)}%)`);
    console.log(`   Aggregate QoL (${(aggregateQoL * 100).toFixed(1)}%) hides ${qolRatio.toFixed(1)}x inequality`);
    console.log(`   Interpretation: This is a "two-tier society" where the wealthy thrive while the poor struggle`);
  } else if (qolRatio > 1.5) {
    console.log(`⚠️  MODERATE INEQUALITY DETECTED`);
    console.log(`   QoL disparity: ${qolRatio.toFixed(1)}x (highest / lowest)`);
    console.log(`   Elite: ${(eliteQoL * 100).toFixed(1)}%, Precariat: ${(precariatQoL * 100).toFixed(1)}%`);
    console.log(`   Interpretation: Inequality exists but not extreme "Elysium" scenario`);
  } else {
    console.log(`✅ BROAD-BASED PROSPERITY`);
    console.log(`   QoL disparity: ${qolRatio.toFixed(1)}x (relatively equal)`);
    console.log(`   Aggregate QoL (${(aggregateQoL * 100).toFixed(1)}%) reflects genuine widespread well-being`);
  }

  // Population-weighted poverty analysis
  const poorSegments = segmentQoLs.filter(s => s.qol < 0.50);
  const povertyPopulation = poorSegments.reduce((sum, s) => sum + s.populationFraction, 0);

  console.log(`\n📊 POVERTY ANALYSIS:`);
  console.log(`  Segments below 50% QoL: ${poorSegments.length}/${segmentQoLs.length}`);
  console.log(`  Population in poverty (<50% QoL): ${(povertyPopulation * 100).toFixed(1)}%`);

  if (povertyPopulation > 0) {
    console.log(`  Affected segments:`);
    poorSegments.forEach(s => {
      console.log(`    - ${s.segmentName}: ${(s.qol * 100).toFixed(1)}% QoL (${(s.populationFraction * 100).toFixed(0)}% of population)`);
    });
  } else {
    console.log(`  ✅ No segments below 50% QoL threshold`);
  }
}

// Main execution
async function main() {
  const seed = 80000;
  const maxMonths = 120; // 10 years

  runQoLDecomposition(seed, maxMonths);

  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`✅ QoL class decomposition complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review segment-level QoL to identify disparities`);
  console.log(`  2. Test whether baseline's "high QoL" is genuine or masking inequality`);
  console.log(`  3. Compare to UBI/intervention scenarios to see if they reduce disparity`);
  console.log(`  4. Document findings in: research/qol-class-decomposition_20251017.md`);
}

main().catch(console.error);
