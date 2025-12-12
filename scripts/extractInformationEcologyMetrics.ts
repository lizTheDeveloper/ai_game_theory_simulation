#!/usr/bin/env tsx
/**
 * Extract Information Ecology metrics from Monte Carlo run JSON files
 *
 * Reads the event JSON files (run_SEED_MODE_events.json) and extracts:
 * - Final informationEcology state
 * - Coordination capacity trajectory
 * - Outcome classification
 *
 * Usage:
 *   npx tsx scripts/extractInformationEcologyMetrics.ts <seed_start> <seed_end>
 *   Example: npx tsx scripts/extractInformationEcologyMetrics.ts 42000 42009
 */

import * as fs from 'fs';
import * as path from 'path';

interface InformationEcologyMetrics {
  seed: number;
  mode: string;
  outcome: string;
  epistemicHealth: number;
  polarization: number;
  socialTrust: number;
  sharedReality: number;
  misinformationLoad: number;
  factCheckHalfLife: number;
  misinformationR0: number;
  coordinationCapacity?: number;  // From cooperative systems
  population: number;
}

function extractMetricsFromFile(filePath: string): InformationEcologyMetrics | null {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Extract from final snapshot
    const finalState = data.snapshots?.final;
    if (!finalState) {
      console.error(`⚠️  No final snapshot in ${path.basename(filePath)}`);
      return null;
    }

    // Extract Information Ecology state
    const ie = finalState.informationEcology;
    if (!ie) {
      console.error(`⚠️  No informationEcology in ${path.basename(filePath)}`);
      return null;
    }

    // Extract coordination capacity (if available from cooperative systems)
    const coordination = finalState.cooperativeSystems?.coordinationCapacity ??
                         finalState.globalMetrics?.coordinationCapacity;

    return {
      seed: data.seed,
      mode: data.scenarioMode,
      outcome: data.outcome,
      epistemicHealth: ie.epistemicHealth,
      polarization: ie.polarization,
      socialTrust: ie.socialTrust,
      sharedReality: ie.sharedReality,
      misinformationLoad: ie.misinformationLoad,
      factCheckHalfLife: ie.factCheckHalfLife,
      misinformationR0: ie.misinformationR0,
      coordinationCapacity: coordination,
      population: finalState.humanPopulationSystem?.population ?? 0,
    };
  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}: ${error}`);
    return null;
  }
}

function calculateCV(values: number[]): number {
  const validValues = values.filter(v => !isNaN(v) && isFinite(v));
  if (validValues.length < 2) return NaN;

  const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
  if (mean === 0) return NaN;

  const variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validValues.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / Math.abs(mean)) * 100; // As percentage
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`
Usage: npx tsx scripts/extractInformationEcologyMetrics.ts <seed_start> <seed_end>

Example: npx tsx scripts/extractInformationEcologyMetrics.ts 42000 42009
    `);
    process.exit(1);
  }

  const seedStart = parseInt(args[0], 10);
  const seedEnd = parseInt(args[1], 10);

  if (isNaN(seedStart) || isNaN(seedEnd) || seedEnd < seedStart) {
    console.error(`❌ Invalid seed range: ${args[0]} - ${args[1]}`);
    process.exit(1);
  }

  console.log(`📊 EXTRACTING INFORMATION ECOLOGY METRICS\n`);
  console.log(`Seed range: ${seedStart} - ${seedEnd} (${seedEnd - seedStart + 1} runs)\n`);

  const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');
  const metrics: InformationEcologyMetrics[] = [];

  // Try both historical and unprecedented modes
  for (let seed = seedStart; seed <= seedEnd; seed++) {
    for (const mode of ['historical', 'unprecedented']) {
      const fileName = `run_${seed}_${mode}_events.json`;
      const filePath = path.join(outputDir, fileName);

      if (fs.existsSync(filePath)) {
        const extracted = extractMetricsFromFile(filePath);
        if (extracted) {
          metrics.push(extracted);
          console.log(`  ✅ Extracted: ${fileName}`);
        }
      }
    }
  }

  if (metrics.length === 0) {
    console.error(`\n❌ No metrics extracted. Check that Monte Carlo run files exist in ${outputDir}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`INFORMATION ECOLOGY METRICS SUMMARY (${metrics.length} runs)\n`);

  // Group by seed to check determinism
  const bySeed = new Map<number, InformationEcologyMetrics[]>();
  for (const m of metrics) {
    if (!bySeed.has(m.seed)) {
      bySeed.set(m.seed, []);
    }
    bySeed.get(m.seed)!.push(m);
  }

  // Calculate averages
  const avgEpistemicHealth = metrics.reduce((sum, m) => sum + m.epistemicHealth, 0) / metrics.length;
  const avgPolarization = metrics.reduce((sum, m) => sum + m.polarization, 0) / metrics.length;
  const avgSocialTrust = metrics.reduce((sum, m) => sum + m.socialTrust, 0) / metrics.length;
  const avgSharedReality = metrics.reduce((sum, m) => sum + m.sharedReality, 0) / metrics.length;
  const avgMisinformationLoad = metrics.reduce((sum, m) => sum + m.misinformationLoad, 0) / metrics.length;
  const avgFactCheckHalfLife = metrics.reduce((sum, m) => sum + m.factCheckHalfLife, 0) / metrics.length;
  const avgMisinformationR0 = metrics.reduce((sum, m) => sum + m.misinformationR0, 0) / metrics.length;

  const coordinationMetrics = metrics.filter(m => m.coordinationCapacity !== undefined);
  const avgCoordination = coordinationMetrics.length > 0
    ? coordinationMetrics.reduce((sum, m) => sum + m.coordinationCapacity!, 0) / coordinationMetrics.length
    : NaN;

  console.log(`AVERAGE FINAL VALUES:\n`);
  console.log(`  Epistemic Health:         ${avgEpistemicHealth.toFixed(4)}`);
  console.log(`  Polarization:             ${avgPolarization.toFixed(4)}`);
  console.log(`  Social Trust:             ${avgSocialTrust.toFixed(4)}`);
  console.log(`  Shared Reality:           ${avgSharedReality.toFixed(4)}`);
  console.log(`  Misinformation Load:      ${avgMisinformationLoad.toFixed(4)}`);
  console.log(`  Fact-check Half-life:     ${avgFactCheckHalfLife.toFixed(2)} days`);
  console.log(`  Misinformation R₀:        ${avgMisinformationR0.toFixed(4)}`);
  if (!isNaN(avgCoordination)) {
    console.log(`  Coordination Capacity:    ${avgCoordination.toFixed(4)}`);
  }

  // Distribution ranges
  console.log(`\nRANGES:\n`);
  console.log(`  Epistemic Health:         [${Math.min(...metrics.map(m => m.epistemicHealth)).toFixed(4)}, ${Math.max(...metrics.map(m => m.epistemicHealth)).toFixed(4)}]`);
  console.log(`  Polarization:             [${Math.min(...metrics.map(m => m.polarization)).toFixed(4)}, ${Math.max(...metrics.map(m => m.polarization)).toFixed(4)}]`);
  console.log(`  Misinformation Load:      [${Math.min(...metrics.map(m => m.misinformationLoad)).toFixed(4)}, ${Math.max(...metrics.map(m => m.misinformationLoad)).toFixed(4)}]`);

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  for (const m of metrics) {
    outcomes[m.outcome] = (outcomes[m.outcome] || 0) + 1;
  }

  console.log(`\nOUTCOME DISTRIBUTION:\n`);
  const sortedOutcomes = Object.entries(outcomes).sort((a, b) => b[1] - a[1]);
  for (const [outcome, count] of sortedOutcomes) {
    const pct = (count / metrics.length * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / metrics.length * 30));
    console.log(`  ${outcome.padEnd(12)}: ${count.toString().padStart(3)} (${pct.padStart(5)}%) ${bar}`);
  }

  // Correlation: polarization vs coordination
  if (!isNaN(avgCoordination)) {
    const validPairs = metrics
      .filter(m => m.coordinationCapacity !== undefined)
      .map(m => ({ pol: m.polarization, coord: m.coordinationCapacity! }));

    if (validPairs.length > 1) {
      const avgPol = validPairs.reduce((sum, p) => sum + p.pol, 0) / validPairs.length;
      const avgCoord2 = validPairs.reduce((sum, p) => sum + p.coord, 0) / validPairs.length;

      const covariance = validPairs.reduce((sum, p) =>
        sum + (p.pol - avgPol) * (p.coord - avgCoord2), 0) / validPairs.length;

      const stdPol = Math.sqrt(validPairs.reduce((sum, p) =>
        sum + Math.pow(p.pol - avgPol, 2), 0) / validPairs.length);
      const stdCoord = Math.sqrt(validPairs.reduce((sum, p) =>
        sum + Math.pow(p.coord - avgCoord2, 2), 0) / validPairs.length);

      const correlation = covariance / (stdPol * stdCoord);

      console.log(`\nCORRELATION:\n`);
      console.log(`  Polarization ↔ Coordination: ${correlation.toFixed(4)}`);
      console.log(`  ${correlation < -0.3 ? '✅ Negative correlation (expected)' : '⚠️  Weak or positive correlation'}`);
    }
  }

  // Check for parameter sampling (validate RNG usage)
  console.log(`\nPARAMETER SAMPLING VALIDATION:\n`);
  const factCheckCV = calculateCV(metrics.map(m => m.factCheckHalfLife));
  const r0CV = calculateCV(metrics.map(m => m.misinformationR0));

  console.log(`  Fact-check Half-life CV:  ${factCheckCV.toFixed(2)}%`);
  console.log(`  Misinformation R₀ CV:     ${r0CV.toFixed(2)}%`);

  if (factCheckCV > 10 && r0CV > 5) {
    console.log(`  ✅ Parameters are being sampled (not hardcoded)`);
  } else {
    console.log(`  ⚠️  Low variance - parameters may be hardcoded`);
  }

  // Save to JSON
  const outputFile = path.join(outputDir, `ie_metrics_${seedStart}-${seedEnd}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log(`\n💾 Metrics saved to: ${outputFile}\n`);
}

main();
