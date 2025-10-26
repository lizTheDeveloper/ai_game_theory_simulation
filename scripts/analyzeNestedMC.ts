#!/usr/bin/env tsx
/**
 * Nested Monte Carlo Analysis Script - Phase 1C
 *
 * Analyzes results from nestedMonteCarloSimulation.ts to identify:
 * - Threshold sensitivity (which thresholds drive outcome variance)
 * - Epistemic vs aleatory variance decomposition
 * - Outcome distributions by threshold ranges
 * - High-leverage thresholds for Phase 2 prioritization
 *
 * Usage:
 *   npx tsx scripts/analyzeNestedMC.ts monteCarloOutputs/nestedMC_TIMESTAMP.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS (Match nestedMonteCarloSimulation.ts)
// ============================================================================

interface InnerRunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  rawOutcome?: string;
  outcomeReason: string;
  months: number;
  finalQoL: number;
  avgAICapability: number;
  avgAlignment: number;
  finalWestern: number;
  finalDevelopment: number;
  finalEcological: number;
  finalIndigenous: number;
  paradigmDivergence: number;
}

interface Tier1Thresholds {
  socialCriticalMass: number;
  trustRecoveryRate: number;
  climateSensitivity: number;
  governmentLegitimacyCrisisThreshold: number;
  automationJobLossThreshold: number;
}

interface EpistemicScenario {
  epistemicId: number;
  thresholdSeed: number;
  thresholds: Tier1Thresholds;
  innerRuns: InnerRunResult[];
  outcomeDistribution: {
    utopia: number;
    dystopia: number;
    extinction: number;
    stalemate: number;
    none: number;
  };
  avgQoL: number;
  avgDuration: number;
  avgCapability: number;
  avgAlignment: number;
}

interface NestedMCResults {
  metadata: {
    timestamp: string;
    outerRuns: number;
    innerRuns: number;
    totalRuns: number;
    maxMonths: number;
    scenarioMode: string;
  };
  epistemicScenarios: EpistemicScenario[];
  thresholdSensitivity: {
    [key: string]: { min: number; max: number; mean: number };
  };
  overallOutcomes: {
    utopia: number;
    dystopia: number;
    extinction: number;
    stalemate: number;
    none: number;
  };
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function analyzeThresholdOutcomeCorrelations(data: NestedMCResults) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`THRESHOLD-OUTCOME CORRELATION ANALYSIS`);
  console.log(`${'='.repeat(80)}\n`);

  const thresholdNames: (keyof Tier1Thresholds)[] = [
    'socialCriticalMass',
    'trustRecoveryRate',
    'climateSensitivity',
    'governmentLegitimacyCrisisThreshold',
    'automationJobLossThreshold'
  ];

  // For each threshold, check correlation with outcomes
  thresholdNames.forEach(thresholdName => {
    console.log(`\n${thresholdName}:`);

    // Collect threshold values and corresponding outcomes
    const scenarios = data.epistemicScenarios.map(s => ({
      thresholdValue: s.thresholds[thresholdName],
      utopiaRate: s.outcomeDistribution.utopia / s.innerRuns.length,
      dystopiaRate: s.outcomeDistribution.dystopia / s.innerRuns.length,
      extinctionRate: s.outcomeDistribution.extinction / s.innerRuns.length,
      avgQoL: s.avgQoL,
      avgDuration: s.avgDuration
    }));

    // Sort by threshold value
    scenarios.sort((a, b) => a.thresholdValue - b.thresholdValue);

    // Simple correlation check: do outcomes change with threshold?
    const lowThirdIdx = Math.floor(scenarios.length / 3);
    const highThirdIdx = Math.floor(scenarios.length * 2 / 3);

    const lowThird = scenarios.slice(0, lowThirdIdx);
    const highThird = scenarios.slice(highThirdIdx);

    const avgUtopiaLow = lowThird.reduce((sum, s) => sum + s.utopiaRate, 0) / lowThird.length;
    const avgUtopiaHigh = highThird.reduce((sum, s) => sum + s.utopiaRate, 0) / highThird.length;
    const utopiaChange = avgUtopiaHigh - avgUtopiaLow;

    const avgExtinctionLow = lowThird.reduce((sum, s) => sum + s.extinctionRate, 0) / lowThird.length;
    const avgExtinctionHigh = highThird.reduce((sum, s) => sum + s.extinctionRate, 0) / highThird.length;
    const extinctionChange = avgExtinctionHigh - avgExtinctionLow;

    const avgQoLLow = lowThird.reduce((sum, s) => sum + s.avgQoL, 0) / lowThird.length;
    const avgQoLHigh = highThird.reduce((sum, s) => sum + s.avgQoL, 0) / highThird.length;
    const qolChange = avgQoLHigh - avgQoLLow;

    console.log(`  Range: [${scenarios[0].thresholdValue.toFixed(4)}, ${scenarios[scenarios.length - 1].thresholdValue.toFixed(4)}]`);
    console.log(`  Low third avg: ${scenarios[0].thresholdValue.toFixed(4)}`);
    console.log(`  High third avg: ${scenarios[scenarios.length - 1].thresholdValue.toFixed(4)}`);
    console.log(`\n  Outcome changes (low → high threshold):`);
    console.log(`    Utopia rate: ${(avgUtopiaLow * 100).toFixed(1)}% → ${(avgUtopiaHigh * 100).toFixed(1)}% (${utopiaChange > 0 ? '+' : ''}${(utopiaChange * 100).toFixed(1)}%)`);
    console.log(`    Extinction rate: ${(avgExtinctionLow * 100).toFixed(1)}% → ${(avgExtinctionHigh * 100).toFixed(1)}% (${extinctionChange > 0 ? '+' : ''}${(extinctionChange * 100).toFixed(1)}%)`);
    console.log(`    Avg QoL: ${avgQoLLow.toFixed(2)} → ${avgQoLHigh.toFixed(2)} (${qolChange > 0 ? '+' : ''}${qolChange.toFixed(2)})`);

    // Sensitivity indicator
    const maxChange = Math.max(Math.abs(utopiaChange), Math.abs(extinctionChange), Math.abs(qolChange) / 10);
    if (maxChange > 0.15) {
      console.log(`  ⚠️  HIGH SENSITIVITY - This threshold significantly affects outcomes`);
    } else if (maxChange > 0.08) {
      console.log(`  ⚡ MODERATE SENSITIVITY - This threshold has measurable impact`);
    } else {
      console.log(`  ✓ LOW SENSITIVITY - Outcomes relatively stable across range`);
    }
  });
}

function analyzeVarianceDecomposition(data: NestedMCResults) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`VARIANCE DECOMPOSITION (Epistemic vs Aleatory)`);
  console.log(`${'='.repeat(80)}\n`);

  const metrics = ['finalQoL', 'avgAICapability', 'avgAlignment', 'paradigmDivergence'] as const;

  metrics.forEach(metric => {
    // Calculate between-epistemic variance (variance of means)
    const epistemicMeans = data.epistemicScenarios.map(s => {
      const innerValues = s.innerRuns.map(r => r[metric]);
      return innerValues.reduce((sum, v) => sum + v, 0) / innerValues.length;
    });
    const overallMean = epistemicMeans.reduce((sum, v) => sum + v, 0) / epistemicMeans.length;
    const betweenVar = epistemicMeans.reduce((sum, v) => sum + Math.pow(v - overallMean, 2), 0) / epistemicMeans.length;

    // Calculate within-epistemic variance (mean of variances)
    const withinVars = data.epistemicScenarios.map(scenario => {
      const innerValues = scenario.innerRuns.map(r => r[metric]);
      const mean = innerValues.reduce((sum, v) => sum + v, 0) / innerValues.length;
      return innerValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / innerValues.length;
    });
    const avgWithinVar = withinVars.reduce((sum, v) => sum + v, 0) / withinVars.length;

    const totalVar = betweenVar + avgWithinVar;
    const epistemicPct = totalVar > 0 ? (betweenVar / totalVar * 100) : 0;
    const aleatoryPct = totalVar > 0 ? (avgWithinVar / totalVar * 100) : 0;

    console.log(`\n${metric}:`);
    console.log(`  Total variance: ${totalVar.toFixed(6)}`);
    console.log(`  Between-epistemic (threshold uncertainty): ${epistemicPct.toFixed(1)}%`);
    console.log(`  Within-epistemic (stochastic variation): ${aleatoryPct.toFixed(1)}%`);

    if (epistemicPct > 60) {
      console.log(`  → Threshold uncertainty DOMINATES - reducing parameter uncertainty critical`);
    } else if (aleatoryPct > 60) {
      console.log(`  → Stochastic variation DOMINATES - outcome inherently unpredictable`);
    } else {
      console.log(`  → MIXED influence - both uncertainty sources matter`);
    }
  });
}

function analyzeOutcomesByThresholdRanges(data: NestedMCResults) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`OUTCOMES BY THRESHOLD RANGES`);
  console.log(`${'='.repeat(80)}\n`);

  const thresholdNames: (keyof Tier1Thresholds)[] = [
    'socialCriticalMass',
    'trustRecoveryRate',
    'climateSensitivity',
    'governmentLegitimacyCrisisThreshold',
    'automationJobLossThreshold'
  ];

  thresholdNames.forEach(thresholdName => {
    console.log(`\n${thresholdName}:`);

    // Sort scenarios by threshold value
    const sorted = [...data.epistemicScenarios].sort((a, b) =>
      a.thresholds[thresholdName] - b.thresholds[thresholdName]
    );

    // Divide into tertiles
    const tertileSize = Math.floor(sorted.length / 3);
    const low = sorted.slice(0, tertileSize);
    const mid = sorted.slice(tertileSize, tertileSize * 2);
    const high = sorted.slice(tertileSize * 2);

    const analyze = (scenarios: EpistemicScenario[], label: string) => {
      const totalRuns = scenarios.reduce((sum, s) => sum + s.innerRuns.length, 0);
      const utopias = scenarios.reduce((sum, s) => sum + s.outcomeDistribution.utopia, 0);
      const dystopias = scenarios.reduce((sum, s) => sum + s.outcomeDistribution.dystopia, 0);
      const extinctions = scenarios.reduce((sum, s) => sum + s.outcomeDistribution.extinction, 0);
      const avgQoL = scenarios.reduce((sum, s) => sum + s.avgQoL, 0) / scenarios.length;

      console.log(`  ${label}:`);
      console.log(`    Utopia: ${(utopias / totalRuns * 100).toFixed(1)}%`);
      console.log(`    Dystopia: ${(dystopias / totalRuns * 100).toFixed(1)}%`);
      console.log(`    Extinction: ${(extinctions / totalRuns * 100).toFixed(1)}%`);
      console.log(`    Avg QoL: ${avgQoL.toFixed(2)}`);
    };

    if (low.length > 0) analyze(low, `Low tertile [${low[0].thresholds[thresholdName].toFixed(4)}–${low[low.length-1].thresholds[thresholdName].toFixed(4)}]`);
    if (mid.length > 0) analyze(mid, `Mid tertile [${mid[0].thresholds[thresholdName].toFixed(4)}–${mid[mid.length-1].thresholds[thresholdName].toFixed(4)}]`);
    if (high.length > 0) analyze(high, `High tertile [${high[0].thresholds[thresholdName].toFixed(4)}–${high[high.length-1].thresholds[thresholdName].toFixed(4)}]`);
  });
}

function generatePrioritizationRecommendations(data: NestedMCResults) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PHASE 2 PRIORITIZATION RECOMMENDATIONS`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Based on this analysis, prioritize Phase 2 thresholds by:`);
  console.log(`\n1. HIGH SENSITIVITY thresholds (large outcome changes across range)`);
  console.log(`   → These thresholds drive significant variance in outcomes`);
  console.log(`   → Reducing uncertainty here has maximum impact`);

  console.log(`\n2. HIGH EPISTEMIC VARIANCE thresholds (between-scenario variance)`);
  console.log(`   → These thresholds show parameter uncertainty dominates stochastic variation`);
  console.log(`   → Better empirical estimates would reduce outcome uncertainty`);

  console.log(`\n3. CRITICAL INTERACTION thresholds (multiple metrics affected)`);
  console.log(`   → These thresholds affect both QoL and survival outcomes`);
  console.log(`   → Cross-system impacts make them high-leverage`);

  console.log(`\nNOTE: Run with more epistemic scenarios (--outer-runs=20+) for robust estimates.`);
  console.log(`Current run: ${data.metadata.outerRuns} epistemic × ${data.metadata.innerRuns} aleatory = ${data.metadata.totalRuns} total.`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`Usage: npx tsx scripts/analyzeNestedMC.ts <path-to-nestedMC-json>`);
    console.error(`Example: npx tsx scripts/analyzeNestedMC.ts monteCarloOutputs/nestedMC_2025-10-26T14-30-00.json`);
    process.exit(1);
  }

  const inputFile = args[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`\nLoading nested MC results from: ${inputFile}\n`);
  const data: NestedMCResults = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  console.log(`${'='.repeat(80)}`);
  console.log(`NESTED MONTE CARLO ANALYSIS`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nMetadata:`);
  console.log(`  Timestamp: ${data.metadata.timestamp}`);
  console.log(`  Epistemic scenarios: ${data.metadata.outerRuns}`);
  console.log(`  Aleatory runs per scenario: ${data.metadata.innerRuns}`);
  console.log(`  Total simulations: ${data.metadata.totalRuns}`);
  console.log(`  Max months: ${data.metadata.maxMonths}`);
  console.log(`  Scenario mode: ${data.metadata.scenarioMode}`);

  // Run all analyses
  analyzeThresholdOutcomeCorrelations(data);
  analyzeVarianceDecomposition(data);
  analyzeOutcomesByThresholdRanges(data);
  generatePrioritizationRecommendations(data);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`ANALYSIS COMPLETE`);
  console.log(`${'='.repeat(80)}\n`);
}

main();
