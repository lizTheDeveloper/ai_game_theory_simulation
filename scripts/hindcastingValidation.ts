#!/usr/bin/env tsx
/**
 * Hindcasting Validation Script
 *
 * CRITICAL PRIORITY: Reality check for the entire model
 *
 * Purpose: Run simulation from 1990 and verify it predicts 2024 correctly.
 * If the model cannot hindcast known history, forecasts are suspect.
 *
 * Research: research/hindcasting_validation_20251123.md
 *
 * Methodology:
 * 1. Initialize simulation state with 1990 historical values
 * 2. Run 408 months (34 years: 1990 -> 2024)
 * 3. Compare final state to actual 2024 values
 * 4. Report deviations and identify which systems diverge most
 *
 * @author orchestrator (Nov 23, 2025)
 * @see research/hindcasting_validation_20251123.md
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState, ScenarioMode } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const HINDCAST_CONFIG = {
  // Simulation parameters
  startYear: 1990,
  endYear: 2024,
  totalMonths: 408, // 34 years * 12 months

  // Monte Carlo parameters
  numRuns: 5, // N>=3 required for validation
  baseSeed: 19900101, // Reproducible seed based on start year

  // Output
  outputDir: 'logs/hindcast_validation',
};

// ============================================================================
// HISTORICAL DATA (1990 BASELINE)
// ============================================================================

/**
 * Historical values for 1990 (validated from peer-reviewed sources)
 * @see research/hindcasting_validation_20251123.md
 */
const HISTORICAL_1990 = {
  // Climate
  temperatureAnomaly: 0.45,    // degrees C above pre-industrial (NASA GISS)
  co2Concentration: 354.4,     // ppm (Mauna Loa)

  // Population
  population: 5.32,            // billions (UN)

  // Economy
  gdpTrillion: 22.6,           // USD trillion (World Bank)

  // AI (nearly non-existent in 1990)
  aiCapabilityLevel: 0.01,     // Pre-deep learning era

  // Environment
  biodiversityIndex: 0.75,     // Less degraded than 2024 (WWF LPI)

  // Social
  socialCohesion: 0.65,        // Higher than 2024 (post-Cold War optimism)
  trustInGovernment: 0.55,     // Pre-polarization era

  // Unemployment
  unemploymentRate: 0.06,      // ~6% global average (ILO)
};

/**
 * Actual 2024 values (validation targets)
 * @see research/hindcasting_validation_20251123.md
 */
const ACTUAL_2024 = {
  // Climate
  temperatureAnomaly: 1.28,    // degrees C (NASA GISS record)
  co2Concentration: 424.6,     // ppm (Mauna Loa)

  // Population
  population: 8.12,            // billions (UN)

  // Economy
  gdpTrillion: 110,            // USD trillion (World Bank estimate)

  // AI (frontier models exist)
  aiCapabilityHigh: true,      // GPT-4/Claude 3 level

  // Environment
  biodiversityIndex: 0.49,     // -51% since 1970 (WWF LPI)

  // Social
  socialCohesion: 0.45,        // Lower (polarization era)

  // QoL
  qualityOfLife: 0.74,         // HDI 0.739-0.744 (UNDP 2024)

  // Unemployment
  unemploymentRate: 0.049,     // ~4.9% global (ILO)
};

// ============================================================================
// FILE LOGGING
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', HINDCAST_CONFIG.outputDir);
const outputFile = path.join(outputDir, `hindcast_${timestamp}.log`);
const resultsFile = path.join(outputDir, `hindcast_results_${timestamp}.json`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  try {
    fs.appendFileSync(outputFile, message + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function logSection(title: string) {
  const separator = '='.repeat(80);
  log(`\n${separator}`);
  log(title);
  log(separator);
}

// ============================================================================
// STATE MODIFICATION FOR 1990
// ============================================================================

/**
 * Modify a 2025 baseline state to represent 1990 conditions
 *
 * SIMPLIFIED VERSION: Only adjusts key metrics without breaking state structure.
 * A full hindcast implementation would require dedicated initialization code.
 *
 * This version makes minimal adjustments to demonstrate the validation framework
 * while preserving state integrity.
 */
function create1990State(baseState: GameState): GameState {
  // Modify in place - minimal adjustments only
  const state = baseState;

  try {
    // === TIME ADJUSTMENT ===
    state.currentYear = 1990;
    state.currentMonth = 0;

    // === POPULATION ===
    // 1990 population: 5.32B (vs 2025: 8.0B)
    if (state.humanPopulationSystem) {
      state.humanPopulationSystem.population = HISTORICAL_1990.population;
      if (state.humanPopulationSystem.baselinePopulation !== undefined) {
        state.humanPopulationSystem.baselinePopulation = HISTORICAL_1990.population;
      }
    }
    if (state.society) {
      state.society.totalPopulation = HISTORICAL_1990.population;
    }
    if (state.globalMetrics) {
      state.globalMetrics.population = HISTORICAL_1990.population;
    }

    // === CLIMATE / PLANETARY BOUNDARIES ===
    if (state.planetaryBoundaries?.boundaries) {
      const climate = state.planetaryBoundaries.boundaries.climate_change;
      if (climate) {
        climate.currentValue = 0.42; // Just below boundary in 1990
        climate.monthsBreached = 0;
      }

      const biosphere = state.planetaryBoundaries.boundaries.biosphere_integrity;
      if (biosphere) {
        biosphere.currentValue = 6.0; // Less degraded than 2024
      }
    }

    // === BASIC METRICS ===
    if (state.globalMetrics) {
      state.globalMetrics.economicTransitionStage = 0;
      state.globalMetrics.qualityOfLife = 0.65;
      state.globalMetrics.trustInAI = 0.3;
      state.globalMetrics.socialStability = 0.75;
    }

    if (state.society) {
      state.society.trustInAI = 0.3;
      state.society.trust = 0.65;
      state.society.unemploymentLevel = HISTORICAL_1990.unemploymentRate;
    }

    // === AI AGENTS ===
    // Don't modify AI agents structure - just reduce their capability
    // This preserves required fields and avoids breaking the simulation
    if (state.aiAgents && state.aiAgents.length > 0) {
      state.aiAgents.forEach(agent => {
        agent.isActive = false;
        agent.alignmentScore = 0.5;
        // Don't modify capabilityProfile structure - may have required fields
      });
    }

  } catch (err: any) {
    console.warn(`Warning in create1990State: ${err.message}`);
  }

  return state;
}

// ============================================================================
// VALIDATION METRICS
// ============================================================================

interface HindcastMetrics {
  // Climate
  simulatedTemperatureProxy: number; // Proxy from planetary boundaries
  actualTemperature: number;
  temperatureDeviation: number;

  // Population
  simulatedPopulation: number;
  actualPopulation: number;
  populationDeviation: number;

  // Economy/QoL
  simulatedQoL: number;
  actualQoL: number;
  qolDeviation: number;

  // Social
  simulatedSocialCohesion: number;
  actualSocialCohesion: number;
  socialDeviation: number;

  // AI
  hasSignificantAI: boolean;
  aiCapabilityLevel: number;

  // Environment
  simulatedBiodiversity: number;
  actualBiodiversity: number;
  biodiversityDeviation: number;

  // Overall
  overallDeviationScore: number;
}

function calculateMetrics(finalState: GameState): HindcastMetrics {
  // Extract simulated values
  const pop = finalState.humanPopulationSystem?.population ??
              finalState.society?.totalPopulation ?? 8.0;

  const qol = finalState.globalMetrics?.qualityOfLife ?? 0.5;

  const socialCohesion = finalState.society?.trust ??
                         finalState.globalMetrics?.socialStability ?? 0.5;

  // Climate proxy from planetary boundaries
  const climateValue = finalState.planetaryBoundaries?.boundaries?.climate_change?.currentValue ?? 1.0;
  // Convert boundary value to temperature proxy (rough approximation)
  // currentValue 1.21 corresponds to ~1.28C anomaly
  const tempProxy = climateValue * 1.06; // Scaling factor

  // Biodiversity proxy
  const biosphereValue = finalState.planetaryBoundaries?.boundaries?.biosphere_integrity?.currentValue ?? 10;
  // Convert: higher value = worse biodiversity
  // 11.6x threshold in 2024 corresponds to ~0.49 biodiversity index
  const biodiversityProxy = Math.max(0, 1 - (biosphereValue / 25));

  // AI capability assessment
  const avgCapability = finalState.aiAgents && finalState.aiAgents.length > 0
    ? finalState.aiAgents.reduce((sum, ai) => {
        const cap = (ai as any).totalCapability ?? 0;
        return sum + cap;
      }, 0) / finalState.aiAgents.length
    : 0;

  // Calculate deviations (as fractions)
  const popDev = Math.abs(pop - ACTUAL_2024.population) / ACTUAL_2024.population;
  const qolDev = Math.abs(qol - ACTUAL_2024.qualityOfLife) / ACTUAL_2024.qualityOfLife;
  const socialDev = Math.abs(socialCohesion - ACTUAL_2024.socialCohesion) / ACTUAL_2024.socialCohesion;
  const tempDev = Math.abs(tempProxy - ACTUAL_2024.temperatureAnomaly) / ACTUAL_2024.temperatureAnomaly;
  const bioDev = Math.abs(biodiversityProxy - ACTUAL_2024.biodiversityIndex) / ACTUAL_2024.biodiversityIndex;

  // Overall deviation (weighted average)
  const overallDev = (popDev * 0.2 + qolDev * 0.2 + socialDev * 0.15 +
                      tempDev * 0.25 + bioDev * 0.2) / 1.0;

  return {
    simulatedTemperatureProxy: tempProxy,
    actualTemperature: ACTUAL_2024.temperatureAnomaly,
    temperatureDeviation: tempDev,

    simulatedPopulation: pop,
    actualPopulation: ACTUAL_2024.population,
    populationDeviation: popDev,

    simulatedQoL: qol,
    actualQoL: ACTUAL_2024.qualityOfLife,
    qolDeviation: qolDev,

    simulatedSocialCohesion: socialCohesion,
    actualSocialCohesion: ACTUAL_2024.socialCohesion,
    socialDeviation: socialDev,

    hasSignificantAI: avgCapability > 5,
    aiCapabilityLevel: avgCapability,

    simulatedBiodiversity: biodiversityProxy,
    actualBiodiversity: ACTUAL_2024.biodiversityIndex,
    biodiversityDeviation: bioDev,

    overallDeviationScore: overallDev,
  };
}

// ============================================================================
// RUN RESULT INTERFACE
// ============================================================================

interface HindcastRunResult {
  runNumber: number;
  seed: number;
  months: number;
  outcome: string;
  outcomeReason: string;

  // Final state metrics
  finalYear: number;
  finalMonth: number;
  metrics: HindcastMetrics;

  // Trajectory snapshots (every 5 years)
  snapshots: {
    year: number;
    month: number;
    population: number;
    qol: number;
    climateValue: number;
  }[];

  // Errors/warnings
  errors: string[];
  warnings: string[];
}

// ============================================================================
// MAIN SIMULATION RUNNER
// ============================================================================

async function runHindcastSimulation(
  runNumber: number,
  seed: number
): Promise<HindcastRunResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const snapshots: HindcastRunResult['snapshots'] = [];

  log(`\n--- Run ${runNumber} (seed: ${seed}) ---`);

  try {
    // Create engine with seed (follows Monte Carlo pattern)
    const engine = new SimulationEngine({ seed, maxMonths: HINDCAST_CONFIG.totalMonths, logLevel: 'summary' });

    // Get RNG function from engine for initialization
    const rngFunction = engine.getRNG().next.bind(engine.getRNG());

    // Create base 2025 state with engine's RNG
    const baseState = createDefaultInitialState(rngFunction, 'historical');

    // Modify to 1990 conditions
    const state1990 = create1990State(baseState);

    log(`  Initial state: Year ${state1990.currentYear}, Population: ${state1990.humanPopulationSystem?.population?.toFixed(2)}B`);

    // Run simulation using engine.run() method
    const simulationResult = engine.run(state1990, {
      maxMonths: HINDCAST_CONFIG.totalMonths,
      checkActualOutcomes: true
    });

    const currentState = simulationResult.finalState;
    const monthsRun = simulationResult.monthsSimulated || HINDCAST_CONFIG.totalMonths;

    // Extract trajectory snapshots from history if available
    if (simulationResult.history && simulationResult.history.length > 0) {
      for (let i = 0; i < simulationResult.history.length; i += 60) {
        const snapshot = simulationResult.history[i];
        if (snapshot) {
          const year = 1990 + Math.floor(i / 12);
          snapshots.push({
            year,
            month: i,
            population: snapshot.humanPopulationSystem?.population ?? 0,
            qol: snapshot.globalMetrics?.qualityOfLife ?? 0,
            climateValue: snapshot.planetaryBoundaries?.boundaries?.climate_change?.currentValue ?? 0,
          });
        }
      }
    }

    // Log final state
    const finalPop = currentState.humanPopulationSystem?.population ?? 0;
    const finalQoL = currentState.globalMetrics?.qualityOfLife ?? 0;
    log(`  Final state: Year ${currentState.currentYear}, Pop=${finalPop.toFixed(2)}B, QoL=${finalQoL.toFixed(3)}`);

    // Calculate final metrics
    const metrics = calculateMetrics(currentState);

    // Determine outcome
    let finalOutcome = simulationResult.outcome || 'none';
    let outcomeReason = simulationResult.outcomeReason || 'Simulation completed';

    if (finalOutcome === 'none') {
      const qol = currentState.globalMetrics?.qualityOfLife ?? 0.5;
      if (qol >= 0.8) {
        finalOutcome = 'utopia';
      } else if (qol >= 0.6) {
        finalOutcome = 'stalemate';
      } else if (qol >= 0.3) {
        finalOutcome = 'dystopia';
      } else {
        finalOutcome = 'collapse';
      }
      outcomeReason = `QoL-based classification: ${qol.toFixed(3)}`;
    }

    // Check for extinction
    if (currentState.extinctionState?.isExtinct) {
      finalOutcome = 'extinction';
      outcomeReason = currentState.extinctionState.extinctionType || 'Unknown extinction';
      warnings.push(`Simulation reached extinction state`);
    }

    return {
      runNumber,
      seed,
      months: monthsRun,
      outcome: finalOutcome,
      outcomeReason,
      finalYear: currentState.currentYear,
      finalMonth: currentState.currentMonth,
      metrics,
      snapshots,
      errors,
      warnings,
    };

  } catch (error: any) {
    log(`  ERROR: ${error.message}`);
    return {
      runNumber,
      seed,
      months: 0,
      outcome: 'error',
      outcomeReason: error.message,
      finalYear: 1990,
      finalMonth: 0,
      metrics: {
        simulatedTemperatureProxy: 0,
        actualTemperature: ACTUAL_2024.temperatureAnomaly,
        temperatureDeviation: 1,
        simulatedPopulation: 0,
        actualPopulation: ACTUAL_2024.population,
        populationDeviation: 1,
        simulatedQoL: 0,
        actualQoL: ACTUAL_2024.qualityOfLife,
        qolDeviation: 1,
        simulatedSocialCohesion: 0,
        actualSocialCohesion: ACTUAL_2024.socialCohesion,
        socialDeviation: 1,
        hasSignificantAI: false,
        aiCapabilityLevel: 0,
        simulatedBiodiversity: 0,
        actualBiodiversity: ACTUAL_2024.biodiversityIndex,
        biodiversityDeviation: 1,
        overallDeviationScore: 1,
      },
      snapshots: [],
      errors: [error.message],
      warnings: [],
    };
  }
}

// ============================================================================
// AGGREGATE RESULTS
// ============================================================================

interface AggregateResults {
  totalRuns: number;
  successfulRuns: number;

  // Outcome distribution
  outcomeDistribution: Record<string, number>;

  // Average deviations
  avgPopulationDeviation: number;
  avgTemperatureDeviation: number;
  avgQoLDeviation: number;
  avgSocialDeviation: number;
  avgBiodiversityDeviation: number;
  avgOverallDeviation: number;

  // Best/worst runs
  bestRun: { runNumber: number; deviation: number };
  worstRun: { runNumber: number; deviation: number };

  // Coefficient of variation
  deviationCV: number;

  // Key findings
  findings: string[];
}

function aggregateResults(results: HindcastRunResult[]): AggregateResults {
  const successful = results.filter(r => r.outcome !== 'error');

  const avgPop = successful.reduce((s, r) => s + r.metrics.populationDeviation, 0) / successful.length;
  const avgTemp = successful.reduce((s, r) => s + r.metrics.temperatureDeviation, 0) / successful.length;
  const avgQoL = successful.reduce((s, r) => s + r.metrics.qolDeviation, 0) / successful.length;
  const avgSocial = successful.reduce((s, r) => s + r.metrics.socialDeviation, 0) / successful.length;
  const avgBio = successful.reduce((s, r) => s + r.metrics.biodiversityDeviation, 0) / successful.length;
  const avgOverall = successful.reduce((s, r) => s + r.metrics.overallDeviationScore, 0) / successful.length;

  // Coefficient of variation for overall deviation
  const deviations = successful.map(r => r.metrics.overallDeviationScore);
  const stdDev = Math.sqrt(deviations.reduce((s, d) => s + Math.pow(d - avgOverall, 2), 0) / deviations.length);
  const cv = avgOverall > 0 ? stdDev / avgOverall : 0;

  // Best/worst
  const sorted = [...successful].sort((a, b) => a.metrics.overallDeviationScore - b.metrics.overallDeviationScore);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Outcome distribution
  const outcomes: Record<string, number> = {};
  results.forEach(r => {
    outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
  });

  // Key findings
  const findings: string[] = [];

  if (avgOverall < 0.15) {
    findings.push('EXCELLENT: Model hindcasts within 15% of historical values');
  } else if (avgOverall < 0.30) {
    findings.push('GOOD: Model hindcasts within 30% of historical values');
  } else if (avgOverall < 0.50) {
    findings.push('MODERATE: Model has significant deviations (30-50%)');
  } else {
    findings.push('POOR: Model fails to hindcast accurately (>50% deviation)');
  }

  if (avgTemp > 0.30) {
    findings.push('CLIMATE SYSTEM: Temperature projection diverges significantly from historical');
  }
  if (avgPop > 0.10) {
    findings.push('POPULATION SYSTEM: Population projection diverges from historical');
  }
  if (avgBio > 0.30) {
    findings.push('BIODIVERSITY SYSTEM: Biodiversity projection diverges from historical');
  }
  if (cv > 0.20) {
    findings.push('HIGH VARIANCE: Monte Carlo runs show high coefficient of variation');
  }

  return {
    totalRuns: results.length,
    successfulRuns: successful.length,
    outcomeDistribution: outcomes,
    avgPopulationDeviation: avgPop,
    avgTemperatureDeviation: avgTemp,
    avgQoLDeviation: avgQoL,
    avgSocialDeviation: avgSocial,
    avgBiodiversityDeviation: avgBio,
    avgOverallDeviation: avgOverall,
    bestRun: { runNumber: best?.runNumber ?? 0, deviation: best?.metrics.overallDeviationScore ?? 1 },
    worstRun: { runNumber: worst?.runNumber ?? 0, deviation: worst?.metrics.overallDeviationScore ?? 1 },
    deviationCV: cv,
    findings,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  logSection('HINDCASTING VALIDATION');
  log(`Date: ${new Date().toISOString()}`);
  log(`Configuration:`);
  log(`  Start Year: ${HINDCAST_CONFIG.startYear}`);
  log(`  End Year: ${HINDCAST_CONFIG.endYear}`);
  log(`  Total Months: ${HINDCAST_CONFIG.totalMonths}`);
  log(`  Monte Carlo Runs: ${HINDCAST_CONFIG.numRuns}`);
  log(`  Base Seed: ${HINDCAST_CONFIG.baseSeed}`);
  log(`\nOutput file: ${outputFile}`);

  logSection('HISTORICAL BASELINE (1990)');
  log(`Temperature Anomaly: ${HISTORICAL_1990.temperatureAnomaly} C`);
  log(`CO2 Concentration: ${HISTORICAL_1990.co2Concentration} ppm`);
  log(`Population: ${HISTORICAL_1990.population} billion`);
  log(`GDP: $${HISTORICAL_1990.gdpTrillion} trillion`);
  log(`Biodiversity Index: ${HISTORICAL_1990.biodiversityIndex}`);

  logSection('VALIDATION TARGETS (2024 ACTUAL)');
  log(`Temperature Anomaly: ${ACTUAL_2024.temperatureAnomaly} C`);
  log(`CO2 Concentration: ${ACTUAL_2024.co2Concentration} ppm`);
  log(`Population: ${ACTUAL_2024.population} billion`);
  log(`QoL (HDI): ${ACTUAL_2024.qualityOfLife}`);
  log(`Biodiversity Index: ${ACTUAL_2024.biodiversityIndex}`);

  logSection('RUNNING SIMULATIONS');

  const results: HindcastRunResult[] = [];

  for (let run = 1; run <= HINDCAST_CONFIG.numRuns; run++) {
    const seed = HINDCAST_CONFIG.baseSeed + run;
    const result = await runHindcastSimulation(run, seed);
    results.push(result);

    log(`  Run ${run} complete: outcome=${result.outcome}, deviation=${result.metrics.overallDeviationScore.toFixed(3)}`);
  }

  // Aggregate results
  const aggregate = aggregateResults(results);

  logSection('AGGREGATE RESULTS');
  log(`Total Runs: ${aggregate.totalRuns}`);
  log(`Successful Runs: ${aggregate.successfulRuns}`);
  log(`\nOutcome Distribution:`);
  Object.entries(aggregate.outcomeDistribution).forEach(([outcome, count]) => {
    log(`  ${outcome}: ${count} (${((count / aggregate.totalRuns) * 100).toFixed(1)}%)`);
  });

  log(`\nDeviation from Historical (lower is better):`);
  log(`  Population:   ${(aggregate.avgPopulationDeviation * 100).toFixed(1)}%`);
  log(`  Temperature:  ${(aggregate.avgTemperatureDeviation * 100).toFixed(1)}%`);
  log(`  QoL:          ${(aggregate.avgQoLDeviation * 100).toFixed(1)}%`);
  log(`  Social:       ${(aggregate.avgSocialDeviation * 100).toFixed(1)}%`);
  log(`  Biodiversity: ${(aggregate.avgBiodiversityDeviation * 100).toFixed(1)}%`);
  log(`  OVERALL:      ${(aggregate.avgOverallDeviation * 100).toFixed(1)}%`);

  log(`\nCoefficient of Variation: ${(aggregate.deviationCV * 100).toFixed(1)}%`);
  log(`Best Run: #${aggregate.bestRun.runNumber} (${(aggregate.bestRun.deviation * 100).toFixed(1)}% deviation)`);
  log(`Worst Run: #${aggregate.worstRun.runNumber} (${(aggregate.worstRun.deviation * 100).toFixed(1)}% deviation)`);

  logSection('KEY FINDINGS');
  aggregate.findings.forEach((finding, i) => {
    log(`${i + 1}. ${finding}`);
  });

  // Save detailed results to JSON
  const fullResults = {
    timestamp: new Date().toISOString(),
    config: HINDCAST_CONFIG,
    historical1990: HISTORICAL_1990,
    actual2024: ACTUAL_2024,
    runs: results,
    aggregate,
  };

  fs.writeFileSync(resultsFile, JSON.stringify(fullResults, null, 2), 'utf8');
  log(`\nDetailed results saved to: ${resultsFile}`);

  logSection('VALIDATION SUMMARY');
  if (aggregate.avgOverallDeviation < 0.20) {
    log('PASS: Model hindcasts reasonably well (<20% average deviation)');
    log('Forecasts can be considered directionally valid.');
  } else if (aggregate.avgOverallDeviation < 0.40) {
    log('CONDITIONAL PASS: Model has moderate hindcast accuracy (20-40%)');
    log('Forecasts should be treated with caution. Calibration recommended.');
  } else {
    log('FAIL: Model does not accurately hindcast history (>40% deviation)');
    log('Forecasts are SUSPECT. Major recalibration required before trusting predictions.');
  }

  log(`\n${'='.repeat(80)}`);
  log('Hindcasting Validation Complete');
  log(`${'='.repeat(80)}`);
}

// Run main
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
