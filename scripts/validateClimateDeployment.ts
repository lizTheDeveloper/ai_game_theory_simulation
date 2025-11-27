#!/usr/bin/env tsx
/**
 * Climate Deployment Timescales Validation
 *
 * Validates that ClimateDeploymentDelayPhase is working correctly by:
 * 1. Running N simulations with all 9 climate techs deployed at month 0
 * 2. Measuring effectiveness at month 60 (5 years)
 * 3. Comparing to research expectations (5.5% baseline → 15% with implementation)
 * 4. Checking determinism (CV < 1%)
 *
 * Research: research/climate_tech_deployment_timescales_20251112.md
 * Expected: Month 60 effectiveness should be 10-20% (target ~15%)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

const NUM_RUNS = 10;  // N≥10 for statistical validation
const TARGET_MONTH = 60; // 5 years (research target)
const SEED_BASE = 42;

interface ValidationResult {
  run: number;
  seed: number;
  effectiveness: number;
  co2RemovalRate: number;
  temperatureOffset: number;
  deployedTechs: number;
}

/**
 * Extract climate effectiveness from state
 */
function extractEffectiveness(state: GameState | undefined): {
  effectiveness: number;
  co2RemovalRate: number;
  temperatureOffset: number;
  deployedTechs: number;
} {
  if (!state || !state.climateDeploymentTracking) {
    console.log('⚠️  No climateDeploymentTracking in state');
    return { effectiveness: 0, co2RemovalRate: 0, temperatureOffset: 0, deployedTechs: 0 };
  }

  const tracking = state.climateDeploymentTracking;
  return {
    effectiveness: tracking.totalClimateEffectiveness || 0,
    co2RemovalRate: tracking.CO2RemovalRate || 0,
    temperatureOffset: tracking.temperatureOffset || 0,
    deployedTechs: Object.keys(tracking.deployments || {}).length
  };
}

/**
 * Deploy all climate technologies at month 0
 *
 * FIX (Nov 21, 2025): ClimateDeploymentDelayPhase detects deployments via techTreeState.regionalDeployment,
 * not climateDeploymentTracking. We need to add techs to regionalDeployment for phase to detect them.
 */
function deployAllClimateTechs(state: GameState): void {
  // FIX (Nov 21, 2025): Use actual tech IDs from comprehensiveTechTree.ts
  // Missing techs (enhanced_weathering, biochar, heat_pumps) need to be added to tech tree
  const climateTechs = [
    'direct_air_capture',
    'ocean_alkalinity_enhancement',  // was 'ocean_alkalinization'
    'bioenergy_ccs',                 // was 'beccs'
    'stratospheric_aerosols',        // was 'sai'
    'smart_grids',                   // was 'smart_grid'
    'hydrogen_economy'               // was 'green_hydrogen'
    // NOTE: 3 techs missing from tree (6/9 total):
    // - enhanced_weathering
    // - biochar
    // - heat_pumps
  ];

  // Ensure techTreeState exists
  if (!state.techTreeState) {
    throw new Error('❌ CRITICAL: techTreeState not initialized');
  }

  // Ensure regionalDeployment map exists
  if (!state.techTreeState.regionalDeployment) {
    state.techTreeState.regionalDeployment = {};
  }

  // Add 'global' region if not present
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  // Deploy each climate tech to global region
  const globalDeployments = state.techTreeState.regionalDeployment['global'];

  for (const techId of climateTechs) {
    // Check if already deployed
    const existingDeployment = globalDeployments.find(d => d.techId === techId);
    if (!existingDeployment) {
      globalDeployments.push({
        techId,
        region: 'global',
        deploymentLevel: 1.0,  // Full deployment
        monthlyInvestment: 0,
        totalInvested: 0,
        deployedBy: ['god_mode_test'],
        effects: {},  // ClimateDeploymentDelayPhase doesn't check this
        deploymentStartMonth: 0  // Month 0
      });
      console.log(`  ✅ Deployed ${techId} to global region`);
    }
  }

  console.log(`\n✅ Deployed ${climateTechs.length} climate technologies at month 0`);
}

/**
 * Run a single validation
 */
async function runValidation(runNumber: number, seed: number): Promise<ValidationResult> {
  console.log(`\n🔬 Run ${runNumber} (seed: ${seed})`);

  // Create engine with deterministic seed
  const engine = new SimulationEngine({ seed, maxMonths: TARGET_MONTH, logLevel: 'summary' });

  // Get RNG from engine for initialization (DETERMINISM FIX pattern from monteCarloSimulation.ts)
  const rng = engine.getRNG().next.bind(engine.getRNG());

  const initialState = createDefaultInitialState(rng);

  // Deploy all climate techs at month 0
  deployAllClimateTechs(initialState);

  // Run simulation to month 60
  const simulationResult = engine.run(initialState, {
    maxMonths: TARGET_MONTH,
    checkActualOutcomes: false
  });

  // Extract final state (FIX: use finalState not state)
  const finalState = simulationResult.finalState;

  // DEBUG: Check what we have
  if (!finalState) {
    console.log(`❌ Run ${runNumber}: finalState is undefined!`);
  } else if (!finalState.climateDeploymentTracking) {
    console.log(`❌ Run ${runNumber}: finalState.climateDeploymentTracking is undefined!`);
    console.log(`   Keys in finalState: ${Object.keys(finalState).length}`);
  } else {
    console.log(`✓ Run ${runNumber}: climateDeploymentTracking exists`);
    console.log(`   Deployments: ${Object.keys(finalState.climateDeploymentTracking.deployments || {}).length}`);
    console.log(`   Total effectiveness: ${finalState.climateDeploymentTracking.totalClimateEffectiveness}`);
  }

  const metrics = extractEffectiveness(finalState);

  console.log(`✓ Run ${runNumber} complete: ${(metrics.effectiveness * 100).toFixed(2)}% effectiveness`);

  return {
    run: runNumber,
    seed,
    effectiveness: metrics.effectiveness,
    co2RemovalRate: metrics.co2RemovalRate,
    temperatureOffset: metrics.temperatureOffset,
    deployedTechs: metrics.deployedTechs
  };
}

/**
 * Calculate statistics
 */
function calculateStats(results: ValidationResult[]): {
  mean: number;
  stdDev: number;
  cv: number;
  min: number;
  max: number;
} {
  const values = results.map(r => r.effectiveness);
  const n = values.length;

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { mean, stdDev, cv, min, max };
}

/**
 * Main validation
 */
async function main() {
  console.log('🌍 Climate Deployment Timescales Validation');
  console.log('='.repeat(80));
  console.log(`Runs: ${NUM_RUNS}`);
  console.log(`Target: Month ${TARGET_MONTH} (${TARGET_MONTH / 12} years)`);
  console.log(`Expected effectiveness: 10-20% (target ~15%)`);
  console.log(`Expected CV: < 1% (determinism check)`);
  console.log('='.repeat(80));

  const results: ValidationResult[] = [];

  // Run validations
  for (let i = 0; i < NUM_RUNS; i++) {
    const seed = SEED_BASE + i;
    const result = await runValidation(i + 1, seed);
    results.push(result);

    console.log(`✓ Run ${i + 1} complete: ${(result.effectiveness * 100).toFixed(2)}% effectiveness`);
  }

  // Calculate statistics
  const stats = calculateStats(results);

  // Print results
  console.log('\n📊 RESULTS');
  console.log('='.repeat(80));
  console.log(`Mean effectiveness: ${(stats.mean * 100).toFixed(2)}%`);
  console.log(`Std deviation: ${(stats.stdDev * 100).toFixed(4)}%`);
  console.log(`Coefficient of variation: ${(stats.cv * 100).toFixed(4)}%`);
  console.log(`Range: ${(stats.min * 100).toFixed(2)}% - ${(stats.max * 100).toFixed(2)}%`);
  console.log('='.repeat(80));

  // Validation checks
  console.log('\n✅ VALIDATION CHECKS');
  console.log('='.repeat(80));

  const effectivenessPercent = stats.mean * 100;
  const cvPercent = stats.cv * 100;

  // Check 1: Effectiveness in expected range (10-20%)
  const effectivenessPass = effectivenessPercent >= 10 && effectivenessPercent <= 20;
  console.log(`Effectiveness (10-20%): ${effectivenessPass ? '✅ PASS' : '❌ FAIL'} (${effectivenessPercent.toFixed(2)}%)`);

  // Check 2: Determinism (CV < 1%)
  const determinismPass = cvPercent < 1;
  console.log(`Determinism (CV < 1%): ${determinismPass ? '✅ PASS' : '❌ FAIL'} (${cvPercent.toFixed(4)}%)`);

  // Check 3: All techs deployed (6 available, 3 missing from tree)
  const allTechsDeployed = results.every(r => r.deployedTechs === 6);
  console.log(`All techs deployed (6/9 available): ${allTechsDeployed ? '✅ PASS' : '❌ FAIL'}`);

  // Overall status
  const allPass = effectivenessPass && determinismPass && allTechsDeployed;
  console.log('='.repeat(80));
  console.log(`\n${allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputDir = path.join(__dirname, '..', 'logs');
  const outputFile = path.join(outputDir, `climate_deployment_validation_${timestamp}.json`);

  const output = {
    timestamp: new Date().toISOString(),
    numRuns: NUM_RUNS,
    targetMonth: TARGET_MONTH,
    results,
    statistics: stats,
    validationChecks: {
      effectivenessInRange: effectivenessPass,
      deterministic: determinismPass,
      allTechsDeployed,
      overall: allPass
    }
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n📝 Results saved to: ${outputFile}`);

  process.exit(allPass ? 0 : 1);
}

main().catch(err => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
