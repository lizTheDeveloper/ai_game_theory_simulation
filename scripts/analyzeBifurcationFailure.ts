#!/usr/bin/env node
/**
 * Analyze Technology Bifurcation Failure (HIGH-4)
 *
 * Problem: 100% dystopia outcomes, 0% technology bifurcation
 *
 * This script analyzes:
 * 1. Resentment accumulation patterns (where does it come from?)
 * 2. Technology deployment progress (why can't we reach 60% avg deployment?)
 * 3. Cooperation/trust dynamics (are gates too strict?)
 */

import * as fs from 'fs';
import * as path from 'path';

interface BifurcationMetrics {
  seed: number;
  months: number;
  outcome: string;
  finalPopulation: number;
  finalQOL: number;
  bifurcations: {
    technology: {
      occurred: boolean;
      month?: number;
      type: string;
      threshold: number;
    };
  };
  maxVarianceAmplification: number;
  avgDistanceToThresholds: number;
}

const OUTPUT_DIR = path.join(process.cwd(), 'monteCarloOutputs');

function analyzeBifurcationMetrics() {
  console.log('\n=== TECHNOLOGY BIFURCATION FAILURE ANALYSIS ===\n');

  // Find all bifurcation metrics files
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('bifurcation_metrics_seed'))
    .sort();

  if (files.length === 0) {
    console.error('❌ No bifurcation metrics found in', OUTPUT_DIR);
    process.exit(1);
  }

  console.log(`📊 Analyzing ${files.length} runs...\n`);

  let techBifurcationOccurred = 0;
  const techThresholds: number[] = [];
  const outcomes: string[] = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8')) as BifurcationMetrics;

    if (data.bifurcations.technology.occurred) {
      techBifurcationOccurred++;
      console.log(`✅ Seed ${data.seed}: Technology bifurcation at month ${data.bifurcations.technology.month}`);
    }

    techThresholds.push(data.bifurcations.technology.threshold);
    outcomes.push(data.outcome);
  }

  console.log(`\n📈 TECHNOLOGY BIFURCATION SUMMARY:`);
  console.log(`   Occurred: ${techBifurcationOccurred} / ${files.length} (${(techBifurcationOccurred / files.length * 100).toFixed(1)}%)`);
  console.log(`   Expected: 30-40% (per roadmap)`);
  console.log(`   Avg Threshold: ${(techThresholds.reduce((a, b) => a + b) / techThresholds.length).toFixed(3)} deployment level`);
  console.log(`   Threshold Range: ${Math.min(...techThresholds).toFixed(3)} - ${Math.max(...techThresholds).toFixed(3)}`);

  console.log(`\n📊 OUTCOME DISTRIBUTION:`);
  const outcomeCounts = outcomes.reduce((acc, o) => {
    acc[o] = (acc[o] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [outcome, count] of Object.entries(outcomeCounts)) {
    console.log(`   ${outcome}: ${count} / ${files.length} (${(count / files.length * 100).toFixed(1)}%)`);
  }

  console.log(`\n💡 NEXT STEPS:`);
  console.log(`   1. Check unprecedented events logs for tech deployment levels`);
  console.log(`   2. Analyze resentment accumulation sources`);
  console.log(`   3. Check cooperation/trust gate strictness`);
  console.log(`   4. Measure tech effectiveness (deployed vs actual impact)`);
}

analyzeBifurcationMetrics();
