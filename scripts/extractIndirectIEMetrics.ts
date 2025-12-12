#!/usr/bin/env tsx
/**
 * Extract INDIRECT Information Ecology effects from snapshots
 *
 * Since informationEcology state isn't in snapshots, we extract proxy metrics:
 * - informationIntegrity (QoL dimension affected by IE)
 * - socialStability (affected by coordination degradation)
 * - trustInAI (affected by epistemic shocks)
 *
 * Usage:
 *   npx tsx scripts/extractIndirectIEMetrics.ts <seed_start> <seed_end>
 */

import * as fs from 'fs';
import * as path from 'path';

interface IndirectMetrics {
  seed: number;
  mode: string;
  outcome: string;
  initial_informationIntegrity: number;
  final_informationIntegrity: number;
  delta_informationIntegrity: number;
  initial_socialStability: number;
  final_socialStability: number;
  delta_socialStability: number;
  initial_trustInAI: number;
  final_trustInAI: number;
  delta_trustInAI: number;
}

function extractFromFile(filePath: string): IndirectMetrics | null {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const initial = data.snapshots?.initial;
    const final = data.snapshots?.final;

    if (!initial || !final) {
      console.error(`⚠️  Missing snapshots in ${path.basename(filePath)}`);
      return null;
    }

    return {
      seed: data.seed,
      mode: data.scenarioMode,
      outcome: data.outcome,
      initial_informationIntegrity: initial.informationIntegrity,
      final_informationIntegrity: final.informationIntegrity,
      delta_informationIntegrity: final.informationIntegrity - initial.informationIntegrity,
      initial_socialStability: initial.socialStability,
      final_socialStability: final.socialStability,
      delta_socialStability: final.socialStability - initial.socialStability,
      initial_trustInAI: initial.trustInAI,
      final_trustInAI: final.trustInAI,
      delta_trustInAI: final.trustInAI - initial.trustInAI,
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
  if (Math.abs(mean) < 1e-10) return NaN;

  const variance = validValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validValues.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / Math.abs(mean)) * 100;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(`
Usage: npx tsx scripts/extractIndirectIEMetrics.ts <seed_start> <seed_end>
Example: npx tsx scripts/extractIndirectIEMetrics.ts 42000 42009
    `);
    process.exit(1);
  }

  const seedStart = parseInt(args[0], 10);
  const seedEnd = parseInt(args[1], 10);

  const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');
  const metrics: IndirectMetrics[] = [];

  for (let seed = seedStart; seed <= seedEnd; seed++) {
    for (const mode of ['historical', 'unprecedented']) {
      const fileName = `run_${seed}_${mode}_events.json`;
      const filePath = path.join(outputDir, fileName);

      if (fs.existsSync(filePath)) {
        const extracted = extractFromFile(filePath);
        if (extracted) {
          metrics.push(extracted);
        }
      }
    }
  }

  if (metrics.length === 0) {
    console.error(`\n❌ No metrics extracted`);
    process.exit(1);
  }

  console.log(`\n📊 INDIRECT INFORMATION ECOLOGY EFFECTS (${metrics.length} runs)\n`);
  console.log(`${'='.repeat(80)}\n`);

  // Group by seed for determinism check
  const bySeed = new Map<number, IndirectMetrics[]>();
  for (const m of metrics) {
    if (!bySeed.has(m.seed)) {
      bySeed.set(m.seed, []);
    }
    bySeed.get(m.seed)!.push(m);
  }

  // Calculate averages
  const avgFinalInfo = metrics.reduce((sum, m) => sum + m.final_informationIntegrity, 0) / metrics.length;
  const avgDeltaInfo = metrics.reduce((sum, m) => sum + m.delta_informationIntegrity, 0) / metrics.length;
  const avgFinalSocial = metrics.reduce((sum, m) => sum + m.final_socialStability, 0) / metrics.length;
  const avgDeltaSocial = metrics.reduce((sum, m) => sum + m.delta_socialStability, 0) / metrics.length;
  const avgFinalTrust = metrics.reduce((sum, m) => sum + m.final_trustInAI, 0) / metrics.length;
  const avgDeltaTrust = metrics.reduce((sum, m) => sum + m.delta_trustInAI, 0) / metrics.length;

  console.log(`AVERAGE TRAJECTORIES:\n`);
  console.log(`  Information Integrity:`);
  console.log(`    Final:  ${avgFinalInfo.toFixed(4)}`);
  console.log(`    Delta:  ${avgDeltaInfo >= 0 ? '+' : ''}${avgDeltaInfo.toFixed(4)} ${avgDeltaInfo > 0 ? '(improved)' : '(degraded)'}`);
  console.log(`\n  Social Stability:`);
  console.log(`    Final:  ${avgFinalSocial.toFixed(4)}`);
  console.log(`    Delta:  ${avgDeltaSocial >= 0 ? '+' : ''}${avgDeltaSocial.toFixed(4)} ${avgDeltaSocial > 0 ? '(improved)' : '(degraded)'}`);
  console.log(`\n  Trust in AI:`);
  console.log(`    Final:  ${avgFinalTrust.toFixed(4)}`);
  console.log(`    Delta:  ${avgDeltaTrust >= 0 ? '+' : ''}${avgDeltaTrust.toFixed(4)} ${avgDeltaTrust > 0 ? '(improved)' : '(degraded)'}`);

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  for (const m of metrics) {
    outcomes[m.outcome] = (outcomes[m.outcome] || 0) + 1;
  }

  console.log(`\n\nOUTCOME DISTRIBUTION:\n`);
  const sortedOutcomes = Object.entries(outcomes).sort((a, b) => b[1] - a[1]);
  for (const [outcome, count] of sortedOutcomes) {
    const pct = (count / metrics.length * 100).toFixed(1);
    console.log(`  ${outcome.padEnd(12)}: ${count.toString().padStart(3)} (${pct.padStart(5)}%)`);
  }

  // If this is determinism test (same seeds), calculate CV
  if (bySeed.size < metrics.length) {
    console.log(`\n\nDETERMINISM CHECK (${Array.from(bySeed.values())[0].length} repetitions per seed):\n`);

    let totalCV = 0;
    let cvCount = 0;

    for (const [seed, runs] of Array.from(bySeed.entries()).slice(0, 5)) {
      const finalInfoValues = runs.map(r => r.final_informationIntegrity);
      const finalSocialValues = runs.map(r => r.final_socialStability);
      const finalTrustValues = runs.map(r => r.final_trustInAI);

      const cvInfo = calculateCV(finalInfoValues);
      const cvSocial = calculateCV(finalSocialValues);
      const cvTrust = calculateCV(finalTrustValues);

      console.log(`  Seed ${seed}:`);
      console.log(`    Information Integrity CV: ${cvInfo.toFixed(4)}% ${cvInfo < 0.01 ? '✅' : cvInfo < 0.1 ? '⚠️ ' : '❌'}`);
      console.log(`    Social Stability CV:      ${cvSocial.toFixed(4)}% ${cvSocial < 0.01 ? '✅' : cvSocial < 0.1 ? '⚠️ ' : '❌'}`);
      console.log(`    Trust in AI CV:           ${cvTrust.toFixed(4)}% ${cvTrust < 0.01 ? '✅' : cvTrust < 0.1 ? '⚠️ ' : '❌'}`);

      if (!isNaN(cvInfo)) { totalCV += cvInfo; cvCount++; }
      if (!isNaN(cvSocial)) { totalCV += cvSocial; cvCount++; }
      if (!isNaN(cvTrust)) { totalCV += cvTrust; cvCount++; }
      console.log('');
    }

    if (cvCount > 0) {
      const avgCV = totalCV / cvCount;
      console.log(`\nAVERAGE CV: ${avgCV.toFixed(4)}%\n`);
      if (avgCV < 0.01) {
        console.log(`✅ DETERMINISM: PASS (CV < 0.01%)\n`);
      } else if (avgCV < 0.1) {
        console.log(`⚠️  DETERMINISM: CONDITIONAL PASS (CV < 0.1%)\n`);
      } else {
        console.log(`❌ DETERMINISM: FAIL (CV > 0.1%)\n`);
      }
    }
  }

  // Save
  const outputFile = path.join(outputDir, `ie_indirect_metrics_${seedStart}-${seedEnd}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log(`💾 Saved to: ${outputFile}\n`);
}

main();
