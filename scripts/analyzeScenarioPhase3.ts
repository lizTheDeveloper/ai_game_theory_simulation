#!/usr/bin/env tsx
/**
 * Scenario Phase 3 Quantitative Analysis
 *
 * Analyzes Monte Carlo results for 6 government priority scenarios:
 * 1. Determinism check (CV analysis)
 * 2. Spiral activation rates
 * 3. Effectiveness analysis vs baseline
 * 4. Gap analysis
 * 5. Outcome quality metrics
 */

import * as fs from 'fs';
import * as path from 'path';

interface SpiralActivation {
  activeUpwardSpirals: string[];
  cascadeActive: boolean;
  cascadeStrength: number;
  trustCascadesTriggered: number;
  tippingPointCascades: number;
}

interface QoLMetrics {
  survivalAvg: number;
  basicNeedsAvg: number;
  psychologicalAvg: number;
  socialAvg: number;
  healthAvg: number;
  environmentalAvg: number;
  overallAvg: number;
}

interface RunResult {
  scenarioId: string;
  seed: number;
  outcome: string;
  monthsSimulated: number;
  spiralActivation: SpiralActivation;
  finalQoL: QoLMetrics;
  finalEnvironment: {
    globalTempDelta: number;
    co2Concentration: number;
    extinctionRate: number;
  };
  finalPopulation: number;
  boundariesBreached: string[];
}

interface CVAnalysis {
  cascadeStrength: number;
  population: number;
  qol: number;
}

interface ScenarioStats {
  spiralActivationRate: Record<string, number>;
  cascadeActivationRate: number;
  avgCascadeStrength: number;
  avgTrustCascades: number;
  avgFinalPopulation: number;
  avgQoL: number;
  avgTempDelta: number;
  outcomeDistribution: Record<string, number>;
  coefficientOfVariation: CVAnalysis;
}

const GOD_MODE_BASELINE = {
  spiralActivationRate: 1/6, // 16.7% - god mode had 1/6 spirals active
  cascadeActive: false,
  avgPopulation: 5.5, // Approximate from god mode
  avgQoL: 0.60, // Approximate from god mode
};

function calculateCV(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : (stdDev / mean) * 100;
}

function analyzeScenario(scenarioId: string, runs: RunResult[]): {
  stats: ScenarioStats;
  analysis: string[];
} {
  const analysis: string[] = [];

  // 1. DETERMINISM CHECK
  const cascadeStrengths = runs.map(r => r.spiralActivation.cascadeStrength);
  const populations = runs.map(r => r.finalPopulation);
  const qols = runs.map(r => r.finalQoL.overallAvg);

  const cvCascade = calculateCV(cascadeStrengths);
  const cvPopulation = calculateCV(populations);
  const cvQoL = calculateCV(qols);

  if (cvCascade > 0.01) {
    analysis.push(`⚠️ CASCADE STRENGTH CV = ${cvCascade.toFixed(4)}% (expected <0.01% for deterministic)`);
  } else {
    analysis.push(`✅ CASCADE STRENGTH CV = ${cvCascade.toFixed(6)}% (deterministic)`);
  }

  if (cvPopulation > 1) {
    analysis.push(`⚠️ POPULATION CV = ${cvPopulation.toFixed(2)}% (high variance, stochastic effects)`);
  } else {
    analysis.push(`✅ POPULATION CV = ${cvPopulation.toFixed(2)}% (acceptable variance)`);
  }

  if (cvQoL > 1) {
    analysis.push(`⚠️ QOL CV = ${cvQoL.toFixed(2)}% (high variance)`);
  } else {
    analysis.push(`✅ QOL CV = ${cvQoL.toFixed(2)}% (acceptable variance)`);
  }

  // 2. SPIRAL ACTIVATION ANALYSIS
  const spiralCounts: Record<string, number> = {
    'Cognitive': 0,
    'Abundance': 0,
    'Democratic': 0,
    'Scientific': 0,
    'Meaning': 0,
    'Ecological': 0,
  };

  runs.forEach(run => {
    run.spiralActivation.activeUpwardSpirals.forEach(spiral => {
      spiralCounts[spiral] = (spiralCounts[spiral] || 0) + 1;
    });
  });

  const spiralActivationRate: Record<string, number> = {};
  Object.keys(spiralCounts).forEach(spiral => {
    spiralActivationRate[spiral] = spiralCounts[spiral] / runs.length;
  });

  // Total unique spirals activated across any run
  const totalSpiralsActivated = Object.values(spiralCounts).filter(count => count > 0).length;
  const maxActivationRate = Math.max(...Object.values(spiralActivationRate));
  const topSpiral = Object.entries(spiralActivationRate).find(([_, rate]) => rate === maxActivationRate)?.[0];

  if (totalSpiralsActivated === 0) {
    analysis.push(`❌ ZERO SPIRALS ACTIVATED (same as baseline)`);
  } else if (maxActivationRate < GOD_MODE_BASELINE.spiralActivationRate) {
    analysis.push(`⚠️ SPIRAL ACTIVATION BELOW BASELINE: ${topSpiral} at ${(maxActivationRate * 100).toFixed(1)}% vs 16.7% baseline`);
  } else if (maxActivationRate > 0.5) {
    analysis.push(`✅ SPIRAL ACTIVATION SUCCESS: ${topSpiral} at ${(maxActivationRate * 100).toFixed(1)}% (>50%)`);
  } else {
    analysis.push(`⚠️ WEAK SPIRAL ACTIVATION: ${topSpiral} at ${(maxActivationRate * 100).toFixed(1)}% (<50%)`);
  }

  // 3. CASCADE ANALYSIS
  const cascadeActiveCount = runs.filter(r => r.spiralActivation.cascadeActive).length;
  const cascadeActivationRate = cascadeActiveCount / runs.length;

  if (cascadeActivationRate > 0) {
    analysis.push(`✅ CASCADE TRIGGERED in ${(cascadeActivationRate * 100).toFixed(1)}% of runs`);
  } else {
    analysis.push(`❌ ZERO CASCADE ACTIVATION (need 3+ spirals sustained 12+ months)`);
  }

  // 4. TRUST CASCADE ANALYSIS
  const avgTrustCascades = runs.reduce((sum, r) => sum + r.spiralActivation.trustCascadesTriggered, 0) / runs.length;
  if (avgTrustCascades > 0) {
    analysis.push(`✅ TRUST CASCADES: ${avgTrustCascades.toFixed(2)} per run`);
  } else {
    analysis.push(`❌ ZERO TRUST CASCADES (expected in short runs - requires 24+ months alignment)`);
  }

  // 5. OUTCOME ANALYSIS
  const outcomeDistribution: Record<string, number> = {};
  runs.forEach(run => {
    outcomeDistribution[run.outcome] = (outcomeDistribution[run.outcome] || 0) + 1;
  });

  const utopiaRate = (outcomeDistribution['utopia'] || 0) / runs.length;
  const extinctionRate = (outcomeDistribution['extinction'] || 0) / runs.length;

  if (utopiaRate > 0.8) {
    analysis.push(`✅ UTOPIA OUTCOME: ${(utopiaRate * 100).toFixed(0)}% of runs`);
  } else if (extinctionRate > 0.2) {
    analysis.push(`⚠️ HIGH EXTINCTION RATE: ${(extinctionRate * 100).toFixed(0)}% of runs`);
  }

  // 6. POPULATION EFFECTIVENESS
  const avgPopulation = populations.reduce((a, b) => a + b, 0) / populations.length;
  const populationEffectiveness = ((avgPopulation - GOD_MODE_BASELINE.avgPopulation) / GOD_MODE_BASELINE.avgPopulation) * 100;

  if (Math.abs(populationEffectiveness) < 1) {
    analysis.push(`⚠️ POPULATION EFFECTIVENESS: ${populationEffectiveness.toFixed(2)}% (zero-effectiveness scenario)`);
  } else if (populationEffectiveness > 0) {
    analysis.push(`✅ POPULATION IMPROVEMENT: +${populationEffectiveness.toFixed(2)}% vs baseline`);
  } else {
    analysis.push(`❌ POPULATION DECLINE: ${populationEffectiveness.toFixed(2)}% vs baseline`);
  }

  // 7. QOL EFFECTIVENESS
  const avgQoL = qols.reduce((a, b) => a + b, 0) / qols.length;
  const qolEffectiveness = ((avgQoL - GOD_MODE_BASELINE.avgQoL) / GOD_MODE_BASELINE.avgQoL) * 100;

  if (Math.abs(qolEffectiveness) < 1) {
    analysis.push(`⚠️ QOL EFFECTIVENESS: ${qolEffectiveness.toFixed(2)}% (zero-effectiveness scenario)`);
  } else if (qolEffectiveness > 0) {
    analysis.push(`✅ QOL IMPROVEMENT: +${qolEffectiveness.toFixed(2)}% vs baseline`);
  }

  return {
    stats: {
      spiralActivationRate,
      cascadeActivationRate,
      avgCascadeStrength: cascadeStrengths.reduce((a, b) => a + b, 0) / cascadeStrengths.length,
      avgTrustCascades,
      avgFinalPopulation: avgPopulation,
      avgQoL,
      avgTempDelta: runs.reduce((sum, r) => sum + r.finalEnvironment.globalTempDelta, 0) / runs.length,
      outcomeDistribution,
      coefficientOfVariation: {
        cascadeStrength: cvCascade,
        population: cvPopulation,
        qol: cvQoL,
      },
    },
    analysis,
  };
}

function main() {
  const resultsPath = process.argv[2] || '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/scenario_phase3_mc_2025-11-11T09-11-57_results.json';

  console.log('=== SCENARIO PHASE 3 QUANTITATIVE ANALYSIS ===\n');
  console.log(`Reading results from: ${resultsPath}\n`);

  const rawData = fs.readFileSync(resultsPath, 'utf-8');
  const data = JSON.parse(rawData);

  const scenarios = data.metadata.scenarios;
  const aggregatedStats: Record<string, any> = {};
  const criticalIssues: string[] = [];

  scenarios.forEach((scenarioId: string) => {
    const runs: RunResult[] = data.results[scenarioId];

    console.log(`\n## ${scenarioId.toUpperCase()}`);
    console.log(`Runs: N=${runs.length}\n`);

    if (runs.length === 0) {
      console.log(`❌ CRITICAL: ZERO RUNS COMPLETED (scenario crashed or empty)\n`);
      criticalIssues.push(`${scenarioId}: ZERO RUNS COMPLETED`);
      return;
    }

    const { stats, analysis } = analyzeScenario(scenarioId, runs);
    aggregatedStats[scenarioId] = stats;

    analysis.forEach(line => console.log(`  ${line}`));

    // Check for CRITICAL issues
    if (stats.coefficientOfVariation.cascadeStrength > 1) {
      criticalIssues.push(`${scenarioId}: High CV cascade strength = ${stats.coefficientOfVariation.cascadeStrength.toFixed(2)}%`);
    }

    const maxSpiralRate = Math.max(...Object.values(stats.spiralActivationRate));
    if (maxSpiralRate === 0) {
      criticalIssues.push(`${scenarioId}: ZERO spiral activation (government priority ineffective)`);
    }
  });

  // COMPARATIVE ANALYSIS
  console.log('\n\n=== COMPARATIVE ANALYSIS ===\n');

  // Rank by spiral activation
  const spiralRankings = scenarios
    .filter((s: string) => data.results[s].length > 0)
    .map((s: string) => {
      const stats = aggregatedStats[s];
      const maxRate = Math.max(...Object.values(stats.spiralActivationRate));
      const topSpiral = Object.entries(stats.spiralActivationRate as Record<string, number>)
        .find(([_, rate]) => rate === maxRate)?.[0];
      return { scenario: s, maxRate, topSpiral };
    })
    .sort((a, b) => b.maxRate - a.maxRate);

  console.log('## SPIRAL ACTIVATION RANKINGS\n');
  spiralRankings.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.scenario}: ${item.topSpiral} at ${(item.maxRate * 100).toFixed(1)}%`);
  });

  // Population rankings
  const popRankings = scenarios
    .filter((s: string) => data.results[s].length > 0)
    .map((s: string) => ({
      scenario: s,
      avgPop: aggregatedStats[s].avgFinalPopulation,
    }))
    .sort((a, b) => b.avgPop - a.avgPop);

  console.log('\n## POPULATION RANKINGS (billions)\n');
  popRankings.forEach((item, idx) => {
    const delta = ((item.avgPop - GOD_MODE_BASELINE.avgPopulation) / GOD_MODE_BASELINE.avgPopulation) * 100;
    console.log(`${idx + 1}. ${item.scenario}: ${item.avgPop.toFixed(3)}B (${delta > 0 ? '+' : ''}${delta.toFixed(1)}%)`);
  });

  // QoL rankings
  const qolRankings = scenarios
    .filter((s: string) => data.results[s].length > 0)
    .map((s: string) => ({
      scenario: s,
      avgQoL: aggregatedStats[s].avgQoL,
    }))
    .sort((a, b) => b.avgQoL - a.avgQoL);

  console.log('\n## QOL RANKINGS\n');
  qolRankings.forEach((item, idx) => {
    const delta = ((item.avgQoL - GOD_MODE_BASELINE.avgQoL) / GOD_MODE_BASELINE.avgQoL) * 100;
    console.log(`${idx + 1}. ${item.scenario}: ${(item.avgQoL * 100).toFixed(1)}% (${delta > 0 ? '+' : ''}${delta.toFixed(1)}%)`);
  });

  // CRITICAL ISSUES SUMMARY
  if (criticalIssues.length > 0) {
    console.log('\n\n=== CRITICAL ISSUES ===\n');
    criticalIssues.forEach(issue => console.log(`  ❌ ${issue}`));
  } else {
    console.log('\n\n=== NO CRITICAL ISSUES DETECTED ===');
  }

  // Save aggregated stats
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const statsPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/scenario_phase3_aggregated_stats_${timestamp}.json`;

  fs.writeFileSync(statsPath, JSON.stringify({
    metadata: data.metadata,
    aggregatedStats,
    rankings: {
      spiralActivation: spiralRankings,
      population: popRankings,
      qol: qolRankings,
    },
    criticalIssues,
  }, null, 2));

  console.log(`\n\nAggregated stats saved to: ${statsPath}`);
}

main();
