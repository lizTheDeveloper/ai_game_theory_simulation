/**
 * Hindcasting Validation Script (Nov 23, 2025)
 *
 * CRITICAL Priority: Validates model against historical data 1990-2024
 *
 * Research Foundation:
 * - Sylvia's mandate: "If the model cannot hindcast known history, forecasts are suspect"
 * - Tests core mechanisms against 34 years of empirical data
 *
 * Historical Baseline (1990):
 * - Temperature Anomaly: 0.45C (NASA GISS)
 * - CO2: 354.4 ppm (NOAA Mauna Loa)
 * - Population: 5.32 billion (UN DESA)
 * - GDP: $22.6 trillion (World Bank, 2015 USD)
 * - Biodiversity: ~0.75 (WWF LPI baseline estimate)
 *
 * Validation Targets (2024):
 * - Temperature Anomaly: 1.28C (NASA GISS)
 * - CO2: 424.6 ppm (NOAA Mauna Loa)
 * - Population: 8.12 billion (UN DESA)
 * - QoL (HDI): 0.74 (UNDP HDR 2024)
 * - Biodiversity: ~0.49 (WWF LPI 2024)
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// HISTORICAL DATA (Research-Backed)
// ============================================================================

const HISTORICAL_1990 = {
  temperatureAnomaly: 0.45,     // NASA GISS (C above 1850-1900 baseline)
  co2Concentration: 354.4,     // NOAA Mauna Loa (ppm)
  population: 5.32,            // UN DESA (billions)
  gdpTrillion: 22.6,           // World Bank (2015 USD)
  aiCapabilityLevel: 0.0,      // No meaningful AI in 1990
  biodiversityIndex: 0.75,     // WWF LPI (1970=1.0, declining)
  socialCohesion: 0.65,        // Post-Cold War optimism
  trustInGovernment: 0.55,     // Moderate (end of Cold War)
  unemploymentRate: 0.06,      // ~6% global average
};

const ACTUAL_2024 = {
  temperatureAnomaly: 1.28,    // NASA GISS 2024
  co2Concentration: 424.6,     // NOAA 2024
  population: 8.12,            // UN DESA 2024
  gdpTrillion: 110,            // World Bank 2024 (2015 USD)
  aiCapabilityHigh: true,      // GPT-4, Claude 3, etc. exist
  biodiversityIndex: 0.49,     // WWF LPI 2024 (69% decline since 1970)
  socialCohesion: 0.45,        // Declining (polarization)
  qualityOfLife: 0.74,         // UNDP HDI 2024
  unemploymentRate: 0.049,     // ILO 2024
};

// ============================================================================
// HINDCAST CONFIGURATION
// ============================================================================

interface HindcastConfig {
  startYear: number;
  endYear: number;
  totalMonths: number;
  numRuns: number;
  baseSeed: number;
  outputDir: string;
}

const CONFIG: HindcastConfig = {
  startYear: 1990,
  endYear: 2024,
  totalMonths: (2024 - 1990) * 12, // 408 months
  numRuns: 10,
  baseSeed: 19900101,
  outputDir: 'logs/hindcast_validation',
};

// ============================================================================
// HELPER: Create RNG from seed
// ============================================================================

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ============================================================================
// HELPER: Extract metrics for comparison
// ============================================================================

interface HindcastMetrics {
  simulatedTemperatureProxy: number;
  actualTemperature: number;
  temperatureDeviation: number;
  simulatedPopulation: number;
  actualPopulation: number;
  populationDeviation: number;
  simulatedQoL: number;
  actualQoL: number;
  qolDeviation: number;
  simulatedSocialCohesion: number;
  actualSocialCohesion: number;
  socialDeviation: number;
  hasSignificantAI: boolean;
  aiCapabilityLevel: number;
  simulatedBiodiversity: number;
  actualBiodiversity: number;
  biodiversityDeviation: number;
  overallDeviationScore: number;
}

function extractMetrics(state: any): HindcastMetrics {
  // HIGH-6 FIX (Nov 27, 2025): Read temperature from authoritative source
  // Previously read from planetaryBoundariesSystem.boundaries.climate_change.currentValue,
  // which drifted due to deforestation feedback increments (1.14°C → 2.10°C).
  // Now read from resourceEconomy.co2.temperatureAnomaly (actual CO2-driven temperature).
  const simTemp = state.resourceEconomy?.co2?.temperatureAnomaly || 0;
  const simPop = state.humanPopulationSystem?.population || 0;
  const simQoL = state.globalMetrics?.qualityOfLife || 0;
  const simSocial = state.globalMetrics?.socialStability || 0;
  const simBio = state.environmentalAccumulation?.biodiversityIndex || 0;
  const aiCount = state.aiAgents?.length || 0;
  const avgAICap = aiCount > 0
    ? state.aiAgents.reduce((sum: number, a: any) => sum + (a.capability || 0), 0) / aiCount
    : 0;

  // Calculate deviations (|predicted - actual| / actual)
  const tempDev = ACTUAL_2024.temperatureAnomaly > 0
    ? Math.abs(simTemp - ACTUAL_2024.temperatureAnomaly) / ACTUAL_2024.temperatureAnomaly
    : 1;
  const popDev = Math.abs(simPop - ACTUAL_2024.population) / ACTUAL_2024.population;
  const qolDev = Math.abs(simQoL - ACTUAL_2024.qualityOfLife) / ACTUAL_2024.qualityOfLife;
  const socialDev = Math.abs(simSocial - ACTUAL_2024.socialCohesion) / ACTUAL_2024.socialCohesion;
  const bioDev = Math.abs(simBio - ACTUAL_2024.biodiversityIndex) / ACTUAL_2024.biodiversityIndex;

  // Overall weighted deviation (population and climate most important)
  const overallDev = (tempDev * 0.25 + popDev * 0.25 + qolDev * 0.2 + socialDev * 0.15 + bioDev * 0.15);

  return {
    simulatedTemperatureProxy: simTemp,
    actualTemperature: ACTUAL_2024.temperatureAnomaly,
    temperatureDeviation: tempDev,
    simulatedPopulation: simPop,
    actualPopulation: ACTUAL_2024.population,
    populationDeviation: popDev,
    simulatedQoL: simQoL,
    actualQoL: ACTUAL_2024.qualityOfLife,
    qolDeviation: qolDev,
    simulatedSocialCohesion: simSocial,
    actualSocialCohesion: ACTUAL_2024.socialCohesion,
    socialDeviation: socialDev,
    hasSignificantAI: aiCount > 5,
    aiCapabilityLevel: avgAICap,
    simulatedBiodiversity: simBio,
    actualBiodiversity: ACTUAL_2024.biodiversityIndex,
    biodiversityDeviation: bioDev,
    overallDeviationScore: overallDev,
  };
}

// ============================================================================
// MAIN: Run Hindcast Validation
// ============================================================================

interface RunResult {
  runNumber: number;
  seed: number;
  months: number;
  outcome: string;
  outcomeReason: string;
  finalYear: number;
  finalMonth: number;
  metrics: HindcastMetrics;
  errors: string[];
  warnings: string[];
}

async function runHindcast(): Promise<void> {
  console.log('\n================================================================================');
  console.log('HINDCASTING VALIDATION (Post-Fix Run)');
  console.log('================================================================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Configuration:`);
  console.log(`  Start Year: ${CONFIG.startYear}`);
  console.log(`  End Year: ${CONFIG.endYear}`);
  console.log(`  Total Months: ${CONFIG.totalMonths}`);
  console.log(`  Monte Carlo Runs: ${CONFIG.numRuns}`);
  console.log(`  Base Seed: ${CONFIG.baseSeed}`);

  // Ensure output directory exists
  const outputDir = path.resolve(CONFIG.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n================================================================================`);
  console.log('HISTORICAL BASELINE (1990)');
  console.log('================================================================================');
  console.log(`Temperature Anomaly: ${HISTORICAL_1990.temperatureAnomaly} C`);
  console.log(`CO2 Concentration: ${HISTORICAL_1990.co2Concentration} ppm`);
  console.log(`Population: ${HISTORICAL_1990.population} billion`);
  console.log(`GDP: $${HISTORICAL_1990.gdpTrillion} trillion`);
  console.log(`Biodiversity Index: ${HISTORICAL_1990.biodiversityIndex}`);

  console.log(`\n================================================================================`);
  console.log('VALIDATION TARGETS (2024 ACTUAL)');
  console.log('================================================================================');
  console.log(`Temperature Anomaly: ${ACTUAL_2024.temperatureAnomaly} C`);
  console.log(`CO2 Concentration: ${ACTUAL_2024.co2Concentration} ppm`);
  console.log(`Population: ${ACTUAL_2024.population} billion`);
  console.log(`QoL (HDI): ${ACTUAL_2024.qualityOfLife}`);
  console.log(`Biodiversity Index: ${ACTUAL_2024.biodiversityIndex}`);

  console.log(`\n================================================================================`);
  console.log('RUNNING SIMULATIONS');
  console.log('================================================================================\n');

  const results: RunResult[] = [];

  for (let i = 0; i < CONFIG.numRuns; i++) {
    const seed = CONFIG.baseSeed + i + 1;

    console.log(`--- Run ${i + 1} (seed: ${seed}) ---`);

    const runResult: RunResult = {
      runNumber: i + 1,
      seed,
      months: 0,
      outcome: 'unknown',
      outcomeReason: '',
      finalYear: CONFIG.startYear,
      finalMonth: 0,
      metrics: {} as HindcastMetrics,
      errors: [],
      warnings: [],
    };

    try {
      // HIGH-9 FIX (Nov 28, 2025): Use engine's RNG for initialization
      // ROOT CAUSE: hindcast script created TWO RNGs with same seed but different LCG parameters:
      //   1. createSeededRng(seed) - LCG multiplier 1103515245
      //   2. SimulationEngine SeededRandom - LCG multiplier 1664525
      // Different multipliers produce different sequences → non-determinism (CV=6.7%)
      // FIX: Create engine first, extract its RNG, use for initialization
      const engine = new SimulationEngine({ seed, maxMonths: CONFIG.totalMonths });
      const engineRng = (engine as any).rng.next.bind((engine as any).rng);

      // Set global RNG for deterministicRandom() calls in initialization
      setDeterministicRng(engineRng);

      // Create historical state using engine's RNG for determinism
      // This applies all research-backed calibrations:
      // - Regional population scaling (7.4B → 5.3B for 1990)
      // - FAO-verified food security by region
      // - config.startYear for year tracking
      // - Historical temperature in BOTH fields
      const state = initializeHistoricalSimulation(CONFIG.startYear, engineRng);

      console.log(`  Initial state: Year ${state.currentYear}, Population: ${state.humanPopulationSystem?.population?.toFixed(2)}B`);
      console.log(`  Initial climate: ${state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue?.toFixed(2)}C`);

      // Run simulation for 408 months using same engine (and same RNG)
      const result = engine.run(state, { maxMonths: CONFIG.totalMonths });
      const finalState = result.finalState;

      runResult.months = CONFIG.totalMonths;
      runResult.finalYear = finalState.currentYear || CONFIG.endYear;
      runResult.finalMonth = finalState.currentMonth || 0;
      runResult.metrics = extractMetrics(finalState);

      // Classify outcome
      const qol = finalState.globalMetrics?.qualityOfLife || 0;
      if (qol >= 0.85) {
        runResult.outcome = 'utopia';
      } else if (qol >= 0.65) {
        runResult.outcome = 'stalemate';
      } else if (qol >= 0.40) {
        runResult.outcome = 'decline';
      } else if (finalState.extinctionState?.isExtinct) {
        runResult.outcome = 'extinction';
      } else {
        runResult.outcome = 'collapse';
      }
      runResult.outcomeReason = `QoL-based classification: ${qol.toFixed(3)}`;

      console.log(`  Final state: Year ${runResult.finalYear}, Pop=${runResult.metrics.simulatedPopulation.toFixed(2)}B, QoL=${runResult.metrics.simulatedQoL.toFixed(3)}`);
      console.log(`  Run ${i + 1} complete: outcome=${runResult.outcome}, deviation=${runResult.metrics.overallDeviationScore.toFixed(3)}`);

    } catch (error: any) {
      runResult.outcome = 'error';
      runResult.outcomeReason = error.message || String(error);
      runResult.errors.push(error.message || String(error));
      console.log(`  ERROR: ${error.message}`);
      console.log(`  Run ${i + 1} complete: outcome=error, deviation=1.000`);
    }

    results.push(runResult);
    console.log('');
  }

  // ============================================================================
  // AGGREGATE RESULTS
  // ============================================================================

  const successfulRuns = results.filter(r => r.outcome !== 'error');
  const outcomeDistribution: Record<string, number> = {};
  results.forEach(r => {
    outcomeDistribution[r.outcome] = (outcomeDistribution[r.outcome] || 0) + 1;
  });

  // Calculate aggregate metrics (only from successful runs)
  const avgMetrics = successfulRuns.length > 0 ? {
    avgPopulationDeviation: successfulRuns.reduce((s, r) => s + r.metrics.populationDeviation, 0) / successfulRuns.length,
    avgTemperatureDeviation: successfulRuns.reduce((s, r) => s + r.metrics.temperatureDeviation, 0) / successfulRuns.length,
    avgQoLDeviation: successfulRuns.reduce((s, r) => s + r.metrics.qolDeviation, 0) / successfulRuns.length,
    avgSocialDeviation: successfulRuns.reduce((s, r) => s + r.metrics.socialDeviation, 0) / successfulRuns.length,
    avgBiodiversityDeviation: successfulRuns.reduce((s, r) => s + r.metrics.biodiversityDeviation, 0) / successfulRuns.length,
    avgOverallDeviation: successfulRuns.reduce((s, r) => s + r.metrics.overallDeviationScore, 0) / successfulRuns.length,
  } : null;

  // Find best and worst runs
  const sortedByDeviation = [...successfulRuns].sort((a, b) => a.metrics.overallDeviationScore - b.metrics.overallDeviationScore);
  const bestRun = sortedByDeviation[0];
  const worstRun = sortedByDeviation[sortedByDeviation.length - 1];

  // Calculate CV of deviations
  const deviations = successfulRuns.map(r => r.metrics.overallDeviationScore);
  const mean = deviations.reduce((s, d) => s + d, 0) / deviations.length;
  const variance = deviations.reduce((s, d) => s + Math.pow(d - mean, 2), 0) / deviations.length;
  const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0;

  console.log('================================================================================');
  console.log('AGGREGATE RESULTS');
  console.log('================================================================================');
  console.log(`Total Runs: ${CONFIG.numRuns}`);
  console.log(`Successful Runs: ${successfulRuns.length}`);
  console.log(`\nOutcome Distribution:`);
  Object.entries(outcomeDistribution).forEach(([outcome, count]) => {
    console.log(`  ${outcome}: ${count} (${((count / CONFIG.numRuns) * 100).toFixed(1)}%)`);
  });

  if (avgMetrics) {
    console.log(`\nDeviation from Historical (lower is better):`);
    console.log(`  Population:   ${(avgMetrics.avgPopulationDeviation * 100).toFixed(1)}%`);
    console.log(`  Temperature:  ${(avgMetrics.avgTemperatureDeviation * 100).toFixed(1)}%`);
    console.log(`  QoL:          ${(avgMetrics.avgQoLDeviation * 100).toFixed(1)}%`);
    console.log(`  Social:       ${(avgMetrics.avgSocialDeviation * 100).toFixed(1)}%`);
    console.log(`  Biodiversity: ${(avgMetrics.avgBiodiversityDeviation * 100).toFixed(1)}%`);
    console.log(`  OVERALL:      ${(avgMetrics.avgOverallDeviation * 100).toFixed(1)}%`);
    console.log(`\nCoefficient of Variation: ${cv.toFixed(1)}%`);
    if (bestRun) {
      console.log(`Best Run: #${bestRun.runNumber} (${(bestRun.metrics.overallDeviationScore * 100).toFixed(1)}% deviation)`);
    }
    if (worstRun) {
      console.log(`Worst Run: #${worstRun.runNumber} (${(worstRun.metrics.overallDeviationScore * 100).toFixed(1)}% deviation)`);
    }
  }

  // ============================================================================
  // KEY FINDINGS
  // ============================================================================

  console.log('\n================================================================================');
  console.log('KEY FINDINGS');
  console.log('================================================================================');

  const findings: string[] = [];

  if (successfulRuns.length === 0) {
    findings.push('CRITICAL: All runs failed - model cannot complete hindcast');
  } else if (successfulRuns.length < CONFIG.numRuns / 2) {
    findings.push(`WARNING: Only ${successfulRuns.length}/${CONFIG.numRuns} runs completed successfully`);
  }

  if (avgMetrics) {
    if (avgMetrics.avgOverallDeviation < 0.20) {
      findings.push('EXCELLENT: Model hindcasts within 20% of historical values');
    } else if (avgMetrics.avgOverallDeviation < 0.30) {
      findings.push('GOOD: Model hindcasts within 30% of historical values');
    } else if (avgMetrics.avgOverallDeviation < 0.50) {
      findings.push('MODERATE: Model hindcasts within 50% of historical values');
    } else {
      findings.push('POOR: Model deviates >50% from historical values');
    }

    // Specific findings
    if (avgMetrics.avgPopulationDeviation < 0.10) {
      findings.push('Population dynamics well-calibrated (<10% deviation)');
    }
    if (avgMetrics.avgTemperatureDeviation > 0.30) {
      findings.push('Climate system may need recalibration (>30% deviation)');
    }
    if (avgMetrics.avgBiodiversityDeviation > 0.30) {
      findings.push('Biodiversity decline rate may need adjustment (>30% deviation)');
    }
  }

  findings.forEach((f, i) => console.log(`${i + 1}. ${f}`));

  // ============================================================================
  // SAVE RESULTS
  // ============================================================================

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(outputDir, `hindcast_postfix_${timestamp}.json`);
  const logFile = path.join(outputDir, `hindcast_postfix_${timestamp}.log`);

  const fullResults = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    historical1990: HISTORICAL_1990,
    actual2024: ACTUAL_2024,
    runs: results,
    aggregate: avgMetrics ? {
      totalRuns: CONFIG.numRuns,
      successfulRuns: successfulRuns.length,
      outcomeDistribution,
      ...avgMetrics,
      bestRun: bestRun ? { runNumber: bestRun.runNumber, deviation: bestRun.metrics.overallDeviationScore } : null,
      worstRun: worstRun ? { runNumber: worstRun.runNumber, deviation: worstRun.metrics.overallDeviationScore } : null,
      deviationCV: cv,
      findings,
    } : null,
  };

  fs.writeFileSync(resultsFile, JSON.stringify(fullResults, null, 2));
  console.log(`\nResults saved to: ${resultsFile}`);

  // ============================================================================
  // VALIDATION VERDICT
  // ============================================================================

  console.log('\n================================================================================');
  console.log('VALIDATION VERDICT');
  console.log('================================================================================');

  if (successfulRuns.length === 0) {
    console.log('VERDICT: FAILED - Model cannot complete 1990-2024 hindcast');
    console.log('ACTION: Debug simulation errors before trusting forecasts');
  } else if (avgMetrics && avgMetrics.avgOverallDeviation < 0.25) {
    console.log('VERDICT: PASSED - Model hindcasts within acceptable tolerance');
    console.log('ACTION: Proceed with forecasting (with documented limitations)');
  } else if (avgMetrics && avgMetrics.avgOverallDeviation < 0.40) {
    console.log('VERDICT: CONDITIONAL PASS - Model requires calibration');
    console.log('ACTION: Review specific systems with high deviation');
  } else {
    console.log('VERDICT: FAILED - Model deviates significantly from historical data');
    console.log('ACTION: Major recalibration needed before forecasting');
  }

  console.log('\n================================================================================\n');
}

// Run the hindcast validation
runHindcast().catch(console.error);
