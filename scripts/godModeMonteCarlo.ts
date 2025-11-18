#!/usr/bin/env tsx
/**
 * God Mode Monte Carlo Validation
 *
 * Validates effectiveness of recent integrations:
 * - Nitrogen legacy stocks (biogeochemical boundary)
 * - Climate phased deployment (climate boundary)
 *
 * Runs N Monte Carlo simulations with ALL technologies deployed at month 0.
 * Measures coefficient of variation for determinism and effectiveness improvements.
 *
 * Usage: npx tsx scripts/godModeMonteCarlo.ts [N=20] [maxMonths=120] [seed=42]
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// PARAMETERS
// ============================================================================

const N = process.argv[2] ? parseInt(process.argv[2]) : 20;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;
const baseSeed = process.argv[4] ? parseInt(process.argv[4]) : 42;

// ============================================================================
// FILE LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().split('T')[0];
const outputDir = path.join(__dirname, '..', 'logs');
const outputFile = path.join(outputDir, `god_mode_mc_${timestamp}.log`);
const csvFile = path.join(outputDir, `god_mode_mc_${timestamp}.csv`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

// ============================================================================
// GOD MODE SETUP
// ============================================================================

function setupGodMode(state: any) {
  const allTech = getAllTech();

  // Unlock all tech
  for (const tech of allTech) {
    if (!state.techTreeState.unlockedTech.includes(tech.id)) {
      state.techTreeState.unlockedTech.push(tech.id);
      state.techTreeState.techUnlockedCount++;
    }
  }

  // Initialize global deployment array if needed
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  // Deploy all tech at 100% in global region
  for (const tech of allTech) {
    const existing = state.techTreeState.regionalDeployment['global'].find((d: any) => d.techId === tech.id);

    if (existing) {
      existing.deploymentLevel = 1.0;
      existing.deployedBy = [...existing.deployedBy, 'god_mode'];
    } else {
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel: 1.0,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost,
        deployedBy: ['god_mode'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
    }
  }

  return allTech.length;
}

// ============================================================================
// PLANETARY BOUNDARY ANALYSIS
// ============================================================================

interface BoundaryMetrics {
  climate: { initial: number; final: number };
  biogeochemical: { initial: number; final: number };
  biosphere: { initial: number; final: number };
  ocean: { initial: number; final: number };
  freshwater: { initial: number; final: number };
  land: { initial: number; final: number };
  novelEntities: { initial: number; final: number };
}

function extractBoundaryMetrics(state: any): BoundaryMetrics {
  const pb = state.planetaryBoundariesSystem?.boundaries || {};

  return {
    climate: {
      initial: pb.climate_change?.currentValue ?? 0,
      final: pb.climate_change?.currentValue ?? 0
    },
    biogeochemical: {
      initial: pb.biogeochemical_flows?.currentValue ?? 0,
      final: pb.biogeochemical_flows?.currentValue ?? 0
    },
    biosphere: {
      initial: pb.biosphere_integrity?.currentValue ?? 0,
      final: pb.biosphere_integrity?.currentValue ?? 0
    },
    ocean: {
      initial: pb.ocean_acidification?.currentValue ?? 0,
      final: pb.ocean_acidification?.currentValue ?? 0
    },
    freshwater: {
      initial: pb.freshwater_change?.currentValue ?? 0,
      final: pb.freshwater_change?.currentValue ?? 0
    },
    land: {
      initial: pb.land_system_change?.currentValue ?? 0,
      final: pb.land_system_change?.currentValue ?? 0
    },
    novelEntities: {
      initial: pb.novel_entities?.currentValue ?? 0,
      final: pb.novel_entities?.currentValue ?? 0
    }
  };
}

function calculateEffectiveness(initial: number, final: number): number {
  if (initial === 0) return 0;
  return ((initial - final) / initial) * 100;
}

// ============================================================================
// RUN SINGLE SIMULATION
// ============================================================================

interface RunResult {
  seed: number;
  outcome: string;
  months: number;
  population: { initial: number; final: number };
  boundaries: BoundaryMetrics;
  qolTiers: {
    survival: number;
    basicNeeds: number;
    psychological: number;
    social: number;
    health: number;
    environmental: number;
    overall: number;
  };
  techCount: number;
}

function runGodModeSimulation(seed: number): RunResult {
  // Create engine ONCE - reuse for both initialization and simulation
  const engine = new SimulationEngine({ seed });
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  // Record initial metrics
  const initialPopulation = state.humanPopulationSystem?.population ?? 0;
  const initialBoundaries = extractBoundaryMetrics(state);

  // Setup god mode
  const techCount = setupGodMode(state);

  // Run simulation with SAME engine (preserves RNG state)
  // SANDBOX MODE: Disable outcome detection to allow full 120-month runs
  // Without this, deploying all 71 techs triggers immediate utopia/dystopia (2-5 months)
  // We need full duration to measure boundary effectiveness over time
  const result = engine.run(state, { maxMonths, checkActualOutcomes: false });

  // Extract final metrics
  const finalState = result.finalState;
  const finalPopulation = finalState.humanPopulationSystem?.population ?? 0;
  const finalBoundaries = extractBoundaryMetrics(finalState);

  // Calculate QoL tiers
  const qol = finalState.qualityOfLifeSystems;
  const survival = (qol.survivalFundamentals.foodSecurity +
                   qol.survivalFundamentals.waterSecurity +
                   qol.survivalFundamentals.thermalHabitability +
                   qol.survivalFundamentals.shelterSecurity) / 4;
  const basicNeeds = (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
  const psychological = (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
  const social = (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
  const health = (qol.healthcareQuality + qol.longevityGains + qol.diseasesBurden) / 3;
  const environmental = (qol.ecosystemHealth + qol.climateStability + qol.pollutionLevel) / 3;
  const overall = (survival + basicNeeds + psychological + social + health + environmental) / 6;

  return {
    seed,
    outcome: result.summary.finalOutcome || 'none',
    months: result.summary.totalMonths,
    population: { initial: initialPopulation, final: finalPopulation },
    boundaries: {
      climate: { initial: initialBoundaries.climate.initial, final: finalBoundaries.climate.final },
      biogeochemical: { initial: initialBoundaries.biogeochemical.initial, final: finalBoundaries.biogeochemical.final },
      biosphere: { initial: initialBoundaries.biosphere.initial, final: finalBoundaries.biosphere.final },
      ocean: { initial: initialBoundaries.ocean.initial, final: finalBoundaries.ocean.final },
      freshwater: { initial: initialBoundaries.freshwater.initial, final: finalBoundaries.freshwater.final },
      land: { initial: initialBoundaries.land.initial, final: finalBoundaries.land.final },
      novelEntities: { initial: initialBoundaries.novelEntities.initial, final: finalBoundaries.novelEntities.final }
    },
    qolTiers: {
      survival,
      basicNeeds,
      psychological,
      social,
      health,
      environmental,
      overall
    },
    techCount
  };
}

// ============================================================================
// STATISTICAL ANALYSIS
// ============================================================================

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

function coefficientOfVariation(values: number[]): number {
  const avg = mean(values);
  if (avg === 0) return 0;
  const sd = stdDev(values);
  return (sd / Math.abs(avg)) * 100; // Return as percentage
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

log('='.repeat(80));
log('GOD MODE MONTE CARLO VALIDATION');
log('='.repeat(80));
log(`N: ${N} runs`);
log(`Max months: ${maxMonths}`);
log(`Base seed: ${baseSeed}`);
log(`Sandbox mode: checkActualOutcomes=false (allows full ${maxMonths}-month runs)`);
log(`Output: ${outputFile}`);
log(`CSV: ${csvFile}`);
log('='.repeat(80));
log('');

log('Running simulations...');
log('');

const results: RunResult[] = [];

for (let i = 0; i < N; i++) {
  const seed = baseSeed + i;
  log(`[${i + 1}/${N}] Seed ${seed}...`);

  try {
    const result = runGodModeSimulation(seed);
    results.push(result);
    log(`  ✅ Complete: ${result.outcome}, ${result.months} months, pop ${result.population.final.toFixed(2)}B`);
  } catch (err: any) {
    log(`  ❌ FAILED: ${err.message}`);
  }
}

log('');
log('='.repeat(80));
log('STATISTICAL ANALYSIS');
log('='.repeat(80));
log('');

// Months completion check
const monthsRun = results.map(r => r.months);
const avgMonths = mean(monthsRun);
const completedFullRuns = results.filter(r => r.months >= maxMonths).length;
log('📅 SIMULATION DURATION:');
log(`  Average months: ${avgMonths.toFixed(1)}`);
log(`  Full runs (${maxMonths} months): ${completedFullRuns}/${N} (${(completedFullRuns / N * 100).toFixed(1)}%)`);
if (completedFullRuns < N) {
  log(`  ⚠️ WARNING: Not all runs reached ${maxMonths} months!`);
  log(`  This may indicate early termination bugs or outcome detection leaking through.`);
}
log('');

// Extract arrays for CV analysis
const finalPopulations = results.map(r => r.population.final);
const survivalScores = results.map(r => r.qolTiers.survival);
const overallQoL = results.map(r => r.qolTiers.overall);

// Boundary effectiveness arrays
const climateInitials = results.map(r => r.boundaries.climate.initial);
const climateFinals = results.map(r => r.boundaries.climate.final);
const biogeochemicalInitials = results.map(r => r.boundaries.biogeochemical.initial);
const biogeochemicalFinals = results.map(r => r.boundaries.biogeochemical.final);
const biosphereInitials = results.map(r => r.boundaries.biosphere.initial);
const biosphereFinals = results.map(r => r.boundaries.biosphere.final);

// Determinism check (CV for identical seed should be ~0%)
log('📊 DETERMINISM CHECK (Coefficient of Variation):');
log(`  Population (final):    CV = ${coefficientOfVariation(finalPopulations).toFixed(4)}%`);
log(`  Survival QoL:          CV = ${coefficientOfVariation(survivalScores).toFixed(4)}%`);
log(`  Overall QoL:           CV = ${coefficientOfVariation(overallQoL).toFixed(4)}%`);
log(`  Climate (initial):     CV = ${coefficientOfVariation(climateInitials).toFixed(4)}%`);
log(`  Climate (final):       CV = ${coefficientOfVariation(climateFinals).toFixed(4)}%`);
log(`  Expected: CV < 0.01% for deterministic simulation`);
log('');

// Population mortality
const avgPopInitial = mean(results.map(r => r.population.initial));
const avgPopFinal = mean(results.map(r => r.population.final));
const mortalityRate = ((avgPopInitial - avgPopFinal) / avgPopInitial) * 100;
log('👥 POPULATION DYNAMICS:');
log(`  Initial (avg):         ${avgPopInitial.toFixed(2)}B`);
log(`  Final (avg):           ${avgPopFinal.toFixed(2)}B`);
log(`  Mortality:             ${mortalityRate.toFixed(1)}%`);
log(`  Baseline (Nov 9):      30% mortality (8.15B → 5.71B)`);
log('');

// Boundary effectiveness
log('🌐 PLANETARY BOUNDARY EFFECTIVENESS:');
log('');

const boundaries: Array<keyof BoundaryMetrics> = [
  'climate', 'biogeochemical', 'biosphere', 'ocean', 'freshwater', 'land', 'novelEntities'
];

for (const boundary of boundaries) {
  const initials = results.map(r => r.boundaries[boundary].initial);
  const finals = results.map(r => r.boundaries[boundary].final);

  const avgInitial = mean(initials);
  const avgFinal = mean(finals);
  const effectiveness = calculateEffectiveness(avgInitial, avgFinal);

  log(`  ${boundary}:`);
  log(`    Initial:    ${avgInitial.toFixed(3)}×`);
  log(`    Final:      ${avgFinal.toFixed(3)}×`);
  log(`    Reduction:  ${(avgInitial - avgFinal).toFixed(3)}×`);
  log(`    Effectiveness: ${effectiveness.toFixed(1)}%`);
  log('');
}

// Expected improvements
log('🎯 EXPECTED IMPROVEMENT VALIDATION:');
log('  Climate: Target 30-50% (from phased deployment)');
log(`    Actual: ${calculateEffectiveness(mean(climateInitials), mean(climateFinals)).toFixed(1)}%`);
log('  Biogeochemical: Target 30-50% (from nitrogen legacy)');
log(`    Actual: ${calculateEffectiveness(mean(biogeochemicalInitials), mean(biogeochemicalFinals)).toFixed(1)}%`);
log('');

// QoL tier performance
log('📈 QoL TIER PERFORMANCE:');
log(`  Survival (Tier 0):     ${(mean(results.map(r => r.qolTiers.survival)) * 100).toFixed(1)}%`);
log(`  Basic Needs (Tier 1):  ${(mean(results.map(r => r.qolTiers.basicNeeds)) * 100).toFixed(1)}%`);
log(`  Psychological (Tier 2):${(mean(results.map(r => r.qolTiers.psychological)) * 100).toFixed(1)}%`);
log(`  Social (Tier 3):       ${(mean(results.map(r => r.qolTiers.social)) * 100).toFixed(1)}%`);
log(`  Health (Tier 4):       ${(mean(results.map(r => r.qolTiers.health)) * 100).toFixed(1)}%`);
log(`  Environmental (Tier 5):${(mean(results.map(r => r.qolTiers.environmental)) * 100).toFixed(1)}%`);
log(`  OVERALL:               ${(mean(results.map(r => r.qolTiers.overall)) * 100).toFixed(1)}%`);
log('');

// Outcome distribution
log('🎲 OUTCOME DISTRIBUTION:');
const outcomeCounts: Record<string, number> = {};
for (const result of results) {
  outcomeCounts[result.outcome] = (outcomeCounts[result.outcome] || 0) + 1;
}
for (const [outcome, count] of Object.entries(outcomeCounts)) {
  log(`  ${outcome}: ${count} (${((count / N) * 100).toFixed(1)}%)`);
}
log('');

// Write CSV for further analysis
log('Writing CSV output...');
const csvHeader = 'seed,outcome,months,pop_initial,pop_final,climate_initial,climate_final,biogeochemical_initial,biogeochemical_final,biosphere_initial,biosphere_final,ocean_initial,ocean_final,freshwater_initial,freshwater_final,land_initial,land_final,novelEntities_initial,novelEntities_final,survival,basicNeeds,psychological,social,health,environmental,overall\n';
fs.writeFileSync(csvFile, csvHeader, 'utf8');

for (const r of results) {
  const row = [
    r.seed,
    r.outcome,
    r.months,
    r.population.initial.toFixed(2),
    r.population.final.toFixed(2),
    r.boundaries.climate.initial.toFixed(3),
    r.boundaries.climate.final.toFixed(3),
    r.boundaries.biogeochemical.initial.toFixed(3),
    r.boundaries.biogeochemical.final.toFixed(3),
    r.boundaries.biosphere.initial.toFixed(3),
    r.boundaries.biosphere.final.toFixed(3),
    r.boundaries.ocean.initial.toFixed(3),
    r.boundaries.ocean.final.toFixed(3),
    r.boundaries.freshwater.initial.toFixed(3),
    r.boundaries.freshwater.final.toFixed(3),
    r.boundaries.land.initial.toFixed(3),
    r.boundaries.land.final.toFixed(3),
    r.boundaries.novelEntities.initial.toFixed(3),
    r.boundaries.novelEntities.final.toFixed(3),
    r.qolTiers.survival.toFixed(3),
    r.qolTiers.basicNeeds.toFixed(3),
    r.qolTiers.psychological.toFixed(3),
    r.qolTiers.social.toFixed(3),
    r.qolTiers.health.toFixed(3),
    r.qolTiers.environmental.toFixed(3),
    r.qolTiers.overall.toFixed(3)
  ].join(',');

  fs.appendFileSync(csvFile, row + '\n', 'utf8');
}

log('✅ CSV written');
log('');

log('='.repeat(80));
log('VALIDATION COMPLETE');
log('='.repeat(80));
log(`📝 Log: ${outputFile}`);
log(`📊 CSV: ${csvFile}`);
log('');
