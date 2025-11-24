#!/usr/bin/env tsx
/**
 * Hindcast Mortality Diagnostic Script (Nov 24, 2025)
 *
 * CRITICAL: Phase 1 of hindcast calibration
 *
 * Purpose: Identify exactly why the model predicts population collapse
 * when historical data shows population growth 1990-2024.
 *
 * Root Cause Analysis (from diagnostic plan):
 * - Climate mortality too aggressive: 8692.1% cumulative contribution
 * - Conflict mortality too high: 208.1% cumulative contribution
 * - Missing historical resilience mechanisms
 *
 * This script tracks:
 * 1. Per-month mortality breakdown by cause (climate, famine, disease, conflict)
 * 2. Correlation between temperature anomaly and mortality spikes
 * 3. Which phases/systems are contributing most to unrealistic deaths
 * 4. Specific parameter values at failure points
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { HISTORICAL_BASELINES, type RNGFunction } from '../src/types/config';
import { getMortalityRisks } from '../src/simulation/bayesianMortality';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const START_YEAR = 1990;
const END_YEAR = 2024;
const MAX_MONTHS = (END_YEAR - START_YEAR) * 12;  // 408 months
const SEED = 42;

// Historical population checkpoints (UN World Population Prospects)
const POPULATION_CHECKPOINTS: Record<number, number> = {
  1990: 5.33,
  1995: 5.74,
  2000: 6.14,
  2005: 6.54,
  2010: 6.96,
  2015: 7.38,
  2020: 7.79,
  2024: 8.12,
};

// ============================================================================
// LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs', 'hindcast');
const logFile = path.join(outputDir, `mortality_diagnostic_${timestamp}.log`);
const jsonFile = path.join(outputDir, `mortality_diagnostic_${timestamp}.json`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n', 'utf8');
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface MortalitySnapshot {
  month: number;
  year: number;
  population: number;
  populationChange: number;
  populationChangePercent: number;

  // Mortality risk breakdown
  mortalityRisksCount: number;
  totalBaseRisk: number;

  // By risk type (famine, disease, disaster, war, pollution, ecosystem, other)
  risksByType: Record<string, number>;

  // By proximate cause
  risksByProximate: Record<string, number>;

  // By root cause
  risksByRoot: Record<string, number>;

  // Top 5 individual risks
  topRisks: Array<{
    type: string;
    proximate: string;
    root: string;
    baseRisk: number;
    description?: string;
  }>;

  // Deaths
  deathsThisMonth: number;
  cumulativeDeaths: number;

  // Environmental state
  temperatureAnomaly: number;
  climateStability: number;
  foodSecurity: number;
  waterSecurity: number;
  biodiversityIndex: number;

  // Crisis state
  cascadeActive: boolean;
  activeCrises: string[];
  boundariesBreached: number;

  // Stabilizer effectiveness
  avgStabilizerReduction: number;
}

// ============================================================================
// MAIN DIAGNOSTIC
// ============================================================================

async function runMortalityDiagnostic() {
  log('='.repeat(80));
  log('HINDCAST MORTALITY DIAGNOSTIC - ROOT CAUSE ANALYSIS');
  log(`Date: ${new Date().toISOString()}`);
  log(`Start Year: ${START_YEAR}`);
  log(`End Year: ${END_YEAR}`);
  log(`Max Months: ${MAX_MONTHS}`);
  log(`Seed: ${SEED}`);
  log('='.repeat(80));
  log('');

  // Get historical overrides
  const historicalOverrides = HISTORICAL_BASELINES[START_YEAR];
  if (!historicalOverrides) {
    log(`ERROR: No historical baseline for ${START_YEAR}`);
    process.exit(1);
  }

  log(`Historical baseline for ${START_YEAR}:`);
  log(`  CO2: ${historicalOverrides.co2Ppm} ppm`);
  log(`  Temperature: ${historicalOverrides.temperatureAnomalyC}C`);
  log(`  Population: ${historicalOverrides.globalPopulationBillions}B`);
  log('');

  // Create simulation engine
  const engine = new SimulationEngine({ seed: SEED });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

  // Create state with historical overrides
  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined,
    undefined,
    undefined,
    undefined,
    historicalOverrides
  );

  log(`Initial state created:`);
  log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  log(`  Temperature: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)}C`);
  log(`  CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(1)} ppm`);
  log('');

  const snapshots: MortalitySnapshot[] = [];
  let previousPopulation = state.humanPopulationSystem.population;

  log('='.repeat(80));
  log('SIMULATION STARTING - Detailed mortality tracking');
  log('='.repeat(80));
  log('');

  // Run simulation
  for (let month = 0; month < MAX_MONTHS; month++) {
    // Capture mortality risks BEFORE step resolves them
    const pop = state.humanPopulationSystem as any;
    const risksBeforeStep = pop.mortalityRisks ? [...pop.mortalityRisks] : [];

    // Execute simulation step
    engine.step(state);

    // Calculate population change
    const currentPopulation = state.humanPopulationSystem.population;
    const populationChange = currentPopulation - previousPopulation;
    const populationChangePercent = (populationChange / previousPopulation) * 100;

    // Aggregate risks by type
    const risksByType: Record<string, number> = {};
    const risksByProximate: Record<string, number> = {};
    const risksByRoot: Record<string, number> = {};
    let totalBaseRisk = 0;

    for (const risk of risksBeforeStep) {
      const riskType = risk.type || 'unknown';
      const proximate = risk.proximate || 'unknown';
      const root = risk.root || 'unknown';

      risksByType[riskType] = (risksByType[riskType] || 0) + risk.baseRisk;
      risksByProximate[proximate] = (risksByProximate[proximate] || 0) + risk.baseRisk;
      risksByRoot[root] = (risksByRoot[root] || 0) + risk.baseRisk;
      totalBaseRisk += risk.baseRisk;
    }

    // Get top 5 risks
    const topRisks = risksBeforeStep
      .sort((a, b) => b.baseRisk - a.baseRisk)
      .slice(0, 5)
      .map(r => ({
        type: r.type || 'unknown',
        proximate: r.proximate || 'unknown',
        root: r.root || 'unknown',
        baseRisk: r.baseRisk,
        description: r.description,
      }));

    // Get environmental state
    const env = state.environmentalAccumulation;
    const pb = state.planetaryBoundariesSystem;
    const qol = state.qualityOfLifeSystems?.survivalFundamentals;

    // Get stabilizer effectiveness
    let avgStabilizerReduction = 0;
    let regionCount = 0;
    if (state.humanPopulationSystem.regionalPopulations) {
      for (const region of state.humanPopulationSystem.regionalPopulations) {
        if (region.mortalityStabilizers) {
          avgStabilizerReduction += region.mortalityStabilizers.combinedReduction;
          regionCount++;
        }
      }
      if (regionCount > 0) {
        avgStabilizerReduction /= regionCount;
      }
    }

    // Get active crises
    const activeCrises: string[] = [];
    if (env?.climateCrisisActive) activeCrises.push('climate');
    if (env?.resourceCrisisActive) activeCrises.push('resource');
    if (env?.pollutionCrisisActive) activeCrises.push('pollution');
    if (env?.ecosystemCrisisActive) activeCrises.push('ecosystem');
    if (pb?.cascadeActive) activeCrises.push('cascade');

    // Create snapshot
    const snapshot: MortalitySnapshot = {
      month,
      year: state.currentYear,
      population: currentPopulation,
      populationChange,
      populationChangePercent,

      mortalityRisksCount: risksBeforeStep.length,
      totalBaseRisk,
      risksByType,
      risksByProximate,
      risksByRoot,
      topRisks,

      deathsThisMonth: state.humanPopulationSystem.monthlyExcessDeaths || 0,
      cumulativeDeaths: state.humanPopulationSystem.cumulativeCrisisDeaths || 0,

      temperatureAnomaly: state.resourceEconomy.co2.temperatureAnomaly,
      climateStability: env?.climateStability || 0,
      foodSecurity: qol?.foodSecurity || 0,
      waterSecurity: qol?.waterSecurity || 0,
      biodiversityIndex: env?.biodiversityIndex || 0,

      cascadeActive: pb?.cascadeActive || false,
      activeCrises,
      boundariesBreached: pb?.boundariesBreached || 0,

      avgStabilizerReduction,
    };

    snapshots.push(snapshot);

    // Log every month in first year, then every 12 months
    const shouldLog = month < 12 || month % 12 === 0 || populationChangePercent < -1.0;

    if (shouldLog) {
      log(`\n--- Month ${month} (${state.currentYear}) ---`);
      log(`  Population: ${currentPopulation.toFixed(3)}B (${populationChangePercent >= 0 ? '+' : ''}${populationChangePercent.toFixed(2)}%)`);
      log(`  Deaths this month: ${(snapshot.deathsThisMonth).toFixed(2)}M`);
      log(`  Cumulative deaths: ${(snapshot.cumulativeDeaths).toFixed(2)}M`);
      log('');
      log(`  Mortality risks: ${risksBeforeStep.length}, Total base risk: ${(totalBaseRisk * 100).toFixed(4)}%`);
      log(`  Stabilizer reduction: ${(avgStabilizerReduction * 100).toFixed(1)}%`);
      log('');

      // Log risk breakdown
      if (Object.keys(risksByRoot).length > 0) {
        log(`  Risks by ROOT CAUSE:`);
        const sortedRoots = Object.entries(risksByRoot).sort((a, b) => b[1] - a[1]);
        for (const [root, risk] of sortedRoots) {
          const contribution = totalBaseRisk > 0 ? (risk / totalBaseRisk * 100) : 0;
          log(`    ${root}: ${(risk * 100).toFixed(4)}% (${contribution.toFixed(1)}% of total)`);
        }
      }

      if (Object.keys(risksByProximate).length > 0) {
        log(`  Risks by PROXIMATE CAUSE:`);
        const sortedProx = Object.entries(risksByProximate).sort((a, b) => b[1] - a[1]);
        for (const [prox, risk] of sortedProx) {
          log(`    ${prox}: ${(risk * 100).toFixed(4)}%`);
        }
      }

      log('');
      log(`  Environmental state:`);
      log(`    Temperature: ${snapshot.temperatureAnomaly.toFixed(2)}C`);
      log(`    Climate stability: ${(snapshot.climateStability * 100).toFixed(1)}%`);
      log(`    Food security: ${(snapshot.foodSecurity * 100).toFixed(1)}%`);
      log(`    Biodiversity: ${(snapshot.biodiversityIndex * 100).toFixed(1)}%`);
      log(`    Boundaries breached: ${snapshot.boundariesBreached}`);
      log(`    Active crises: ${activeCrises.length > 0 ? activeCrises.join(', ') : 'none'}`);

      // Check against historical checkpoints
      const checkpointYear = Math.floor((START_YEAR * 12 + month) / 12);
      const expectedPop = POPULATION_CHECKPOINTS[checkpointYear];
      if (expectedPop && month % 12 === 0) {
        const deviation = ((currentPopulation - expectedPop) / expectedPop * 100).toFixed(2);
        log('');
        log(`  CHECKPOINT ${checkpointYear}: Expected ${expectedPop}B, Got ${currentPopulation.toFixed(2)}B (${deviation}% deviation)`);
      }
    }

    // Alert on significant population drops
    if (populationChangePercent < -2.0) {
      log(`\n>>> ALERT: Major population drop at month ${month}: ${populationChangePercent.toFixed(2)}%`);
      if (topRisks.length > 0) {
        log(`    Top risk: ${topRisks[0].proximate} (${topRisks[0].root}) - ${(topRisks[0].baseRisk * 100).toFixed(4)}%`);
        if (topRisks[0].description) {
          log(`    Description: ${topRisks[0].description}`);
        }
      }
    }

    // Check for population collapse
    if (currentPopulation < 1.0) {
      log(`\n>>> CRITICAL: Population collapsed below 1B at month ${month}`);
      break;
    }

    previousPopulation = currentPopulation;
  }

  // ============================================================================
  // SUMMARY ANALYSIS
  // ============================================================================

  log('\n');
  log('='.repeat(80));
  log('DIAGNOSTIC SUMMARY');
  log('='.repeat(80));

  const finalPop = snapshots[snapshots.length - 1].population;
  const expectedFinalPop = POPULATION_CHECKPOINTS[2024] || 8.12;

  log(`\nFinal state:`);
  log(`  Population: ${finalPop.toFixed(3)}B (expected: ${expectedFinalPop}B)`);
  log(`  Deviation: ${((finalPop - expectedFinalPop) / expectedFinalPop * 100).toFixed(2)}%`);
  log(`  Total deaths: ${snapshots[snapshots.length - 1].cumulativeDeaths.toFixed(2)}M`);

  // Aggregate risk contributions across simulation
  const totalRiskContributions: Record<string, number> = {};
  const totalRootContributions: Record<string, number> = {};
  let grandTotalRisk = 0;

  for (const snapshot of snapshots) {
    for (const [root, risk] of Object.entries(snapshot.risksByRoot)) {
      totalRootContributions[root] = (totalRootContributions[root] || 0) + risk;
      grandTotalRisk += risk;
    }
    for (const [type, risk] of Object.entries(snapshot.risksByType)) {
      totalRiskContributions[type] = (totalRiskContributions[type] || 0) + risk;
    }
  }

  log(`\nCUMULATIVE MORTALITY RISK BREAKDOWN:`);
  log(`\nBy ROOT CAUSE (what ultimately caused the deaths):`);
  const sortedRoots = Object.entries(totalRootContributions).sort((a, b) => b[1] - a[1]);
  for (const [root, risk] of sortedRoots) {
    const contribution = grandTotalRisk > 0 ? (risk / grandTotalRisk * 100) : 0;
    log(`  ${root}: ${(risk * 100).toFixed(2)}% cumulative risk (${contribution.toFixed(1)}% contribution)`);
  }

  log(`\nBy TYPE (proximate cause category):`);
  const sortedTypes = Object.entries(totalRiskContributions).sort((a, b) => b[1] - a[1]);
  for (const [type, risk] of sortedTypes) {
    const contribution = grandTotalRisk > 0 ? (risk / grandTotalRisk * 100) : 0;
    log(`  ${type}: ${(risk * 100).toFixed(2)}% cumulative risk (${contribution.toFixed(1)}% contribution)`);
  }

  // Find months with highest mortality
  const sortedByDeaths = [...snapshots].sort((a, b) => b.deathsThisMonth - a.deathsThisMonth);
  log(`\nTOP 10 DEADLIEST MONTHS:`);
  for (let i = 0; i < Math.min(10, sortedByDeaths.length); i++) {
    const s = sortedByDeaths[i];
    log(`  Month ${s.month} (${s.year}): ${s.deathsThisMonth.toFixed(2)}M deaths, pop ${s.population.toFixed(3)}B`);
    const topRoot = Object.entries(s.risksByRoot).sort((a, b) => b[1] - a[1])[0];
    if (topRoot) {
      log(`    Primary cause: ${topRoot[0]} (${(topRoot[1] * 100).toFixed(4)}% base risk)`);
    }
  }

  // Temperature-mortality correlation
  log(`\nTEMPERATURE VS MORTALITY CORRELATION:`);
  const tempBuckets: Record<string, { deaths: number; count: number }> = {};
  for (const s of snapshots) {
    const tempBucket = `${Math.floor(s.temperatureAnomaly * 2) / 2}-${Math.floor(s.temperatureAnomaly * 2) / 2 + 0.5}C`;
    if (!tempBuckets[tempBucket]) tempBuckets[tempBucket] = { deaths: 0, count: 0 };
    tempBuckets[tempBucket].deaths += s.deathsThisMonth;
    tempBuckets[tempBucket].count++;
  }
  for (const [bucket, data] of Object.entries(tempBuckets).sort()) {
    const avgDeaths = data.deaths / data.count;
    log(`  ${bucket}: avg ${avgDeaths.toFixed(2)}M deaths/month (${data.count} months)`);
  }

  // Save JSON data
  const diagnosticData = {
    config: {
      startYear: START_YEAR,
      endYear: END_YEAR,
      maxMonths: MAX_MONTHS,
      seed: SEED,
    },
    finalState: {
      population: finalPop,
      expectedPopulation: expectedFinalPop,
      deviationPercent: ((finalPop - expectedFinalPop) / expectedFinalPop * 100),
      cumulativeDeaths: snapshots[snapshots.length - 1].cumulativeDeaths,
    },
    riskContributions: {
      byRootCause: totalRootContributions,
      byType: totalRiskContributions,
      grandTotal: grandTotalRisk,
    },
    snapshots,
  };

  fs.writeFileSync(jsonFile, JSON.stringify(diagnosticData, null, 2), 'utf8');

  log(`\n`);
  log(`Detailed log saved to: ${logFile}`);
  log(`JSON data saved to: ${jsonFile}`);
  log('='.repeat(80));

  // RECOMMENDATIONS
  log(`\n`);
  log('='.repeat(80));
  log('CALIBRATION RECOMMENDATIONS');
  log('='.repeat(80));

  log(`\n1. PRIMARY CAUSE ANALYSIS:`);
  if (sortedRoots.length > 0) {
    log(`   The ${sortedRoots[0][0]} root cause contributes ${((sortedRoots[0][1] / grandTotalRisk) * 100).toFixed(1)}% of total mortality risk.`);
    log(`   This is the primary target for calibration.`);
  }

  log(`\n2. HISTORICAL RESILIENCE:`);
  log(`   1990-2024 was a period of relative stability with population GROWTH.`);
  log(`   The model predicts COLLAPSE because:`);
  log(`   - Crisis mechanisms assume AI assistance is required for survival`);
  log(`   - Mortality thresholds are calibrated for future scenarios, not historical`);
  log(`   - Stabilizer effectiveness is too low for pre-AI era`);

  log(`\n3. RECOMMENDED PARAMETER CHANGES (Phase 2):`);
  log(`   - Increase mortality stabilizer baseline effectiveness for historical mode`);
  log(`   - Reduce climate mortality sensitivity at <2C warming`);
  log(`   - Add era-specific scaling factor (1990-2010: 0.3x mortality)`);
  log(`   - Implement population growth baseline (historical ~1.5%/year)`);

  log(`\n`);
  log('='.repeat(80));
}

// Run diagnostic
runMortalityDiagnostic().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
