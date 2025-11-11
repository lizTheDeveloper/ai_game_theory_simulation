/**
 * Phase 3 Monte Carlo Results Analysis
 *
 * Created: November 11, 2025
 * Purpose: Comprehensive statistical analysis of 13-scenario × 10-seed Monte Carlo validation
 * Context: Identify which governance dimensions enable spiral activation
 *
 * Analysis Components:
 * 1. Spiral Activation Frequency Table
 * 2. Outcome Distribution Comparison
 * 3. Coefficient of Variation (CV) Validation
 * 4. Effectiveness Metrics per Governance Dimension
 * 5. Critical Threshold Identification
 * 6. Recommendations for Phase 4
 */

import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'logs', 'phase3_mc');
const SCENARIOS = [
  'climate-first',
  'equality-first',
  'ai-alignment-first',
  'democratic-participation',
  'scientific-acceleration',
  'authoritarian-efficiency',
  'high-trust-start',
  'low-inequality-start',
  'strong-institutions-start',
  'renewable-first',
  'carbon-removal-first',
  'foundations-first',
  'adaptive-deployment',
];

interface ScenarioResults {
  scenarioId: string;
  results: any[];
  stats: {
    N: number;
    spiralActivationRate: number;
    cascadeActivationRate: number;
    avgCascadeStrength: number;
    uniqueSpiralsActivated: string[];
    outcomeDistribution: Record<string, number>;
    avgPopulation: number;
    avgQoL: number;
    avgTempDelta: number;
    populationCV: number;
    qolCV: number;
    tempCV: number;
    isDeterministic: boolean;
  };
}

/**
 * Load all results from output directory
 */
function loadAllResults(): Map<string, any[]> {
  const resultsByScenario = new Map<string, any[]>();

  if (!fs.existsSync(OUTPUT_DIR)) {
    throw new Error(`Output directory not found: ${OUTPUT_DIR}`);
  }

  const files = fs.readdirSync(OUTPUT_DIR);
  const resultFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('_summary.json'));

  console.log(`Loading ${resultFiles.length} result files...`);

  for (const file of resultFiles) {
    try {
      const filePath = path.join(OUTPUT_DIR, file);
      const result = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const scenarioId = result.scenarioId;
      if (!resultsByScenario.has(scenarioId)) {
        resultsByScenario.set(scenarioId, []);
      }
      resultsByScenario.get(scenarioId)!.push(result);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return resultsByScenario;
}

/**
 * Calculate comprehensive statistics for a scenario
 */
function calculateScenarioStats(scenarioId: string, results: any[]): ScenarioResults['stats'] {
  const N = results.length;

  // Spiral activation analysis
  const spiralCounts: Record<string, number> = {};
  let cascadeActiveCount = 0;
  let totalCascadeStrength = 0;

  // Outcome distribution
  const outcomeDistribution: Record<string, number> = {};

  // Numeric metrics
  const populations: number[] = [];
  const qolScores: number[] = [];
  const tempDeltas: number[] = [];

  for (const result of results) {
    // Spiral activations
    if (result.spiralActivation?.activeUpwardSpirals) {
      for (const spiral of result.spiralActivation.activeUpwardSpirals) {
        spiralCounts[spiral] = (spiralCounts[spiral] || 0) + 1;
      }
    }

    // Cascade metrics
    if (result.spiralActivation?.cascadeActive) {
      cascadeActiveCount++;
    }
    totalCascadeStrength += result.spiralActivation?.cascadeStrength || 0;

    // Outcomes
    outcomeDistribution[result.outcome] = (outcomeDistribution[result.outcome] || 0) + 1;

    // Numeric metrics
    populations.push(result.finalPopulation || 0);
    qolScores.push(result.finalQoL?.overallAvg || 0);
    tempDeltas.push(result.finalEnvironment?.globalTempDelta || 0);
  }

  // Calculate statistics
  const uniqueSpiralsActivated = Object.keys(spiralCounts);
  const spiralActivationRate = uniqueSpiralsActivated.length > 0
    ? Object.values(spiralCounts).reduce((sum, count) => sum + count, 0) / (N * uniqueSpiralsActivated.length)
    : 0;

  return {
    N,
    spiralActivationRate,
    cascadeActivationRate: cascadeActiveCount / N,
    avgCascadeStrength: totalCascadeStrength / N,
    uniqueSpiralsActivated,
    outcomeDistribution,
    avgPopulation: mean(populations),
    avgQoL: mean(qolScores),
    avgTempDelta: mean(tempDeltas),
    populationCV: calculateCV(populations),
    qolCV: calculateCV(qolScores),
    tempCV: calculateCV(tempDeltas),
    isDeterministic: calculateCV(populations) < 0.10 && calculateCV(qolScores) < 0.10 && calculateCV(tempDeltas) < 0.10,
  };
}

/**
 * Generate spiral activation frequency table
 */
function generateSpiralActivationTable(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 SPIRAL ACTIVATION FREQUENCY TABLE');
  console.log('='.repeat(100));

  // Collect all unique spirals
  const allSpirals = new Set<string>();
  for (const scenario of scenarioStats) {
    for (const spiral of scenario.stats.uniqueSpiralsActivated) {
      allSpirals.add(spiral);
    }
  }

  // Print header
  console.log(`\n${'Scenario'.padEnd(35)} | ${'Cascade Rate'.padEnd(15)} | ${'Unique Spirals'.padEnd(15)} | Top Spirals`);
  console.log('-'.repeat(100));

  // Print each scenario
  for (const scenario of scenarioStats) {
    const cascadeRate = (scenario.stats.cascadeActivationRate * 100).toFixed(1) + '%';
    const uniqueCount = scenario.stats.uniqueSpiralsActivated.length.toString();
    const topSpirals = scenario.stats.uniqueSpiralsActivated.slice(0, 3).join(', ');

    console.log(`${scenario.scenarioId.padEnd(35)} | ${cascadeRate.padEnd(15)} | ${uniqueCount.padEnd(15)} | ${topSpirals}`);
  }

  console.log('\n');
}

/**
 * Generate outcome distribution comparison
 */
function generateOutcomeDistribution(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 OUTCOME DISTRIBUTION COMPARISON');
  console.log('='.repeat(100));

  // Collect all unique outcomes
  const allOutcomes = new Set<string>();
  for (const scenario of scenarioStats) {
    for (const outcome of Object.keys(scenario.stats.outcomeDistribution)) {
      allOutcomes.add(outcome);
    }
  }

  console.log(`\nOutcomes found: ${Array.from(allOutcomes).join(', ')}`);

  // Print header
  console.log(`\n${'Scenario'.padEnd(35)} | ${'Dominant Outcome'.padEnd(25)} | ${'Frequency'.padEnd(10)}`);
  console.log('-'.repeat(80));

  // Print each scenario
  for (const scenario of scenarioStats) {
    const sortedOutcomes = Object.entries(scenario.stats.outcomeDistribution)
      .sort(([, a], [, b]) => b - a);

    if (sortedOutcomes.length > 0) {
      const [dominantOutcome, count] = sortedOutcomes[0];
      const frequency = ((count / scenario.stats.N) * 100).toFixed(1) + '%';
      console.log(`${scenario.scenarioId.padEnd(35)} | ${dominantOutcome.padEnd(25)} | ${frequency.padEnd(10)}`);
    }
  }

  console.log('\n');
}

/**
 * Generate determinism validation report
 */
function generateDeterminismValidation(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 DETERMINISM VALIDATION (CV < 10% expected)');
  console.log('='.repeat(100));

  console.log(`\n${'Scenario'.padEnd(35)} | ${'Pop CV'.padEnd(10)} | ${'QoL CV'.padEnd(10)} | ${'Temp CV'.padEnd(10)} | ${'Status'.padEnd(15)}`);
  console.log('-'.repeat(90));

  for (const scenario of scenarioStats) {
    const popCV = (scenario.stats.populationCV * 100).toFixed(1) + '%';
    const qolCV = (scenario.stats.qolCV * 100).toFixed(1) + '%';
    const tempCV = (scenario.stats.tempCV * 100).toFixed(1) + '%';
    const status = scenario.stats.isDeterministic ? '✅ Deterministic' : '❌ Non-deterministic';

    console.log(`${scenario.scenarioId.padEnd(35)} | ${popCV.padEnd(10)} | ${qolCV.padEnd(10)} | ${tempCV.padEnd(10)} | ${status.padEnd(15)}`);
  }

  console.log('\n');
}

/**
 * Generate effectiveness metrics by governance dimension
 */
function generateEffectivenessMetrics(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 EFFECTIVENESS METRICS BY GOVERNANCE DIMENSION');
  console.log('='.repeat(100));

  // Group scenarios by type
  const governmentPriority = scenarioStats.filter(s =>
    ['climate-first', 'equality-first', 'ai-alignment-first', 'democratic-participation', 'scientific-acceleration', 'authoritarian-efficiency'].includes(s.scenarioId)
  );
  const startingConditions = scenarioStats.filter(s =>
    ['high-trust-start', 'low-inequality-start', 'strong-institutions-start'].includes(s.scenarioId)
  );
  const techDeployment = scenarioStats.filter(s =>
    ['renewable-first', 'carbon-removal-first', 'foundations-first', 'adaptive-deployment'].includes(s.scenarioId)
  );

  // Government Priority scenarios
  console.log(`\n📋 Government Priority Scenarios:`);
  console.log(`${'Scenario'.padEnd(35)} | ${'Cascade Rate'.padEnd(15)} | ${'Avg Cascade Strength'.padEnd(20)}`);
  console.log('-'.repeat(75));
  for (const scenario of governmentPriority) {
    const cascadeRate = (scenario.stats.cascadeActivationRate * 100).toFixed(1) + '%';
    const cascadeStrength = scenario.stats.avgCascadeStrength.toFixed(3);
    console.log(`${scenario.scenarioId.padEnd(35)} | ${cascadeRate.padEnd(15)} | ${cascadeStrength.padEnd(20)}`);
  }

  // Starting Conditions scenarios
  console.log(`\n📋 Starting Condition Scenarios:`);
  console.log(`${'Scenario'.padEnd(35)} | ${'Cascade Rate'.padEnd(15)} | ${'Avg Cascade Strength'.padEnd(20)}`);
  console.log('-'.repeat(75));
  for (const scenario of startingConditions) {
    const cascadeRate = (scenario.stats.cascadeActivationRate * 100).toFixed(1) + '%';
    const cascadeStrength = scenario.stats.avgCascadeStrength.toFixed(3);
    console.log(`${scenario.scenarioId.padEnd(35)} | ${cascadeRate.padEnd(15)} | ${cascadeStrength.padEnd(20)}`);
  }

  // Tech Deployment scenarios
  console.log(`\n📋 Technology Deployment Scenarios:`);
  console.log(`${'Scenario'.padEnd(35)} | ${'Cascade Rate'.padEnd(15)} | ${'Avg Cascade Strength'.padEnd(20)}`);
  console.log('-'.repeat(75));
  for (const scenario of techDeployment) {
    const cascadeRate = (scenario.stats.cascadeActivationRate * 100).toFixed(1) + '%';
    const cascadeStrength = scenario.stats.avgCascadeStrength.toFixed(3);
    console.log(`${scenario.scenarioId.padEnd(35)} | ${cascadeRate.padEnd(15)} | ${cascadeStrength.padEnd(20)}`);
  }

  console.log('\n');
}

/**
 * Generate critical threshold identification
 */
function generateCriticalThresholds(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 CRITICAL THRESHOLD IDENTIFICATION');
  console.log('='.repeat(100));

  // Identify scenarios with highest cascade activation
  const topActivators = scenarioStats
    .sort((a, b) => b.stats.cascadeActivationRate - a.stats.cascadeActivationRate)
    .slice(0, 5);

  console.log(`\n🏆 TOP 5 SPIRAL ACTIVATORS:`);
  for (let i = 0; i < topActivators.length; i++) {
    const scenario = topActivators[i];
    console.log(`   ${i + 1}. ${scenario.scenarioId}`);
    console.log(`      Cascade rate: ${(scenario.stats.cascadeActivationRate * 100).toFixed(1)}%`);
    console.log(`      Cascade strength: ${scenario.stats.avgCascadeStrength.toFixed(3)}`);
    console.log(`      Unique spirals: ${scenario.stats.uniqueSpiralsActivated.length}`);
    console.log(`      Top spirals: ${scenario.stats.uniqueSpiralsActivated.slice(0, 3).join(', ')}`);
  }

  // Identify zero-effectiveness scenarios
  const zeroEffectiveness = scenarioStats.filter(s => s.stats.cascadeActivationRate === 0);

  console.log(`\n❌ ZERO-EFFECTIVENESS SCENARIOS:`);
  if (zeroEffectiveness.length === 0) {
    console.log(`   None - all scenarios showed some spiral activation`);
  } else {
    for (const scenario of zeroEffectiveness) {
      console.log(`   - ${scenario.scenarioId}: 0% cascade activation`);
    }
  }

  console.log('\n');
}

/**
 * Generate recommendations for Phase 4
 */
function generateRecommendations(scenarioStats: ScenarioResults[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('📊 RECOMMENDATIONS FOR PHASE 4 COMPARATIVE ANALYSIS');
  console.log('='.repeat(100));

  // Identify best single governance dimension
  const governmentPriority = scenarioStats.filter(s =>
    ['climate-first', 'equality-first', 'ai-alignment-first', 'democratic-participation', 'scientific-acceleration', 'authoritarian-efficiency'].includes(s.scenarioId)
  ).sort((a, b) => b.stats.cascadeActivationRate - a.stats.cascadeActivationRate);

  const bestGovernance = governmentPriority[0];

  console.log(`\n✅ KEY FINDINGS:`);
  console.log(`   1. Best single governance dimension: ${bestGovernance.scenarioId} (${(bestGovernance.stats.cascadeActivationRate * 100).toFixed(1)}% cascade rate)`);

  // Check if trust matters
  const highTrust = scenarioStats.find(s => s.scenarioId === 'high-trust-start');
  if (highTrust && highTrust.stats.cascadeActivationRate > 0) {
    console.log(`   2. High trust enables spirals: ${(highTrust.stats.cascadeActivationRate * 100).toFixed(1)}% cascade rate`);
  } else {
    console.log(`   2. High trust alone insufficient for spiral activation`);
  }

  // Check if inequality blocks cooperation
  const lowInequality = scenarioStats.find(s => s.scenarioId === 'low-inequality-start');
  if (lowInequality && lowInequality.stats.cascadeActivationRate > 0) {
    console.log(`   3. Low inequality enables spirals: ${(lowInequality.stats.cascadeActivationRate * 100).toFixed(1)}% cascade rate`);
  } else {
    console.log(`   3. Low inequality alone insufficient for spiral activation`);
  }

  // Technology deployment sequencing
  const techDeployment = scenarioStats.filter(s =>
    ['renewable-first', 'carbon-removal-first', 'foundations-first', 'adaptive-deployment'].includes(s.scenarioId)
  ).sort((a, b) => b.stats.cascadeActivationRate - a.stats.cascadeActivationRate);

  const bestTechSequence = techDeployment[0];
  console.log(`   4. Best tech deployment sequence: ${bestTechSequence.scenarioId} (${(bestTechSequence.stats.cascadeActivationRate * 100).toFixed(1)}% cascade rate)`);

  console.log(`\n✅ PHASE 4 RECOMMENDATIONS:`);
  console.log(`   1. Test combined scenarios: ${bestGovernance.scenarioId} + ${bestTechSequence.scenarioId}`);
  console.log(`   2. Vary parameter ranges to find critical thresholds (e.g., Gini <0.30? Trust >0.45?)`);
  console.log(`   3. Test multi-dimensional governance (combine climate + equality + institutions)`);
  console.log(`   4. Validate against historical cases (Nordic countries, post-war Japan, etc.)`);

  console.log('\n');
}

/**
 * Utility: Calculate mean
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Utility: Calculate standard deviation
 */
function std(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Utility: Calculate coefficient of variation
 */
function calculateCV(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  if (m === 0) return 0;
  return std(values) / Math.abs(m);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 PHASE 3 MONTE CARLO RESULTS ANALYSIS');
  console.log('='.repeat(100));

  // Load all results
  const resultsByScenario = loadAllResults();

  console.log(`\nLoaded results for ${resultsByScenario.size} scenarios`);
  console.log(`Total runs: ${Array.from(resultsByScenario.values()).reduce((sum, results) => sum + results.length, 0)}`);

  // Calculate statistics for each scenario
  const scenarioStats: ScenarioResults[] = [];
  for (const [scenarioId, results] of resultsByScenario) {
    const stats = calculateScenarioStats(scenarioId, results);
    scenarioStats.push({ scenarioId, results, stats });
  }

  // Generate analysis reports
  generateSpiralActivationTable(scenarioStats);
  generateOutcomeDistribution(scenarioStats);
  generateDeterminismValidation(scenarioStats);
  generateEffectivenessMetrics(scenarioStats);
  generateCriticalThresholds(scenarioStats);
  generateRecommendations(scenarioStats);

  // Save detailed analysis to file
  const analysisReport = {
    generatedAt: new Date().toISOString(),
    totalScenarios: scenarioStats.length,
    totalRuns: Array.from(resultsByScenario.values()).reduce((sum, results) => sum + results.length, 0),
    scenarioStats: scenarioStats.map(s => ({
      scenarioId: s.scenarioId,
      stats: s.stats,
    })),
  };

  const reportPath = path.join(OUTPUT_DIR, 'phase3_analysis_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));

  console.log(`\n💾 Detailed analysis saved to: ${reportPath}`);
  console.log('\n' + '='.repeat(100));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(100) + '\n');
}

// Entry point
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
