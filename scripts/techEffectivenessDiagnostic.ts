#!/usr/bin/env tsx
/**
 * Tech Effectiveness Diagnostic (Nov 25, 2025)
 *
 * INVESTIGATION: Why did 119 sequenced techs fail to prevent 99% mortality?
 *
 * Tracks month-by-month:
 * 1. Deployed tech count + IDs
 * 2. Aggregate tech effects (environmental restoration)
 * 3. Mortality rate (baseline + transition)
 * 4. Key cascade metrics (temperature, boundaries)
 * 5. Race condition timing (tech deployment vs. cascade onset)
 *
 * Usage:
 *   npx tsx scripts/techEffectivenessDiagnostic.ts [seed] [maxMonths]
 *
 * Output: CSV to logs/tech_effectiveness_diagnostic_<timestamp>.csv
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech, getTechById } from '../src/simulation/techTree/comprehensiveTechTree';
import type { GameState } from '../src/types/game';
import * as fs from 'fs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const seed = process.argv[2] ? parseInt(process.argv[2]) : 42;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;

console.log('\n' + '='.repeat(80));
console.log('TECH EFFECTIVENESS DIAGNOSTIC');
console.log('='.repeat(80));
console.log(`Seed: ${seed}`);
console.log(`Max months: ${maxMonths}`);
console.log('');

// ============================================================================
// DEPLOYMENT SCHEDULE (SEQUENCED MODE)
// ============================================================================

function setupSequencedDeployment(state: GameState, deploymentLevel: number = 0.95): void {
  // Match coordinatedGodMode.ts prioritization logic
  const allTech = getAllTech();

  // Prioritize: unlockable first, by capability, then category
  const sorted = [...allTech].sort((a, b) => {
    const statusPriority: Record<string, number> = {
      'unlockable': 0,
      'future': 1,
      'deployed_2025': 2
    };
    const aStatus = statusPriority[a.status] ?? 1;
    const bStatus = statusPriority[b.status] ?? 1;
    if (aStatus !== bStatus) return aStatus - bStatus;

    const aCapability = a.minAICapability ?? 0;
    const bCapability = b.minAICapability ?? 0;
    if (aCapability !== bCapability) return aCapability - bCapability;

    const categoryPriority: Record<string, number> = {
      'climate': 0,
      'agriculture': 1,
      'medical': 2,
      'ocean': 3,
      'freshwater': 4,
      'energy': 5,
      'pollution': 6,
      'social': 7,
      'alignment': 8
    };
    const aPriority = categoryPriority[a.category] ?? 10;
    const bPriority = categoryPriority[b.category] ?? 10;
    return aPriority - bPriority;
  });

  // Schedule deployment: 3-month intervals, 5 techs per wave
  const deploymentInterval = 3;
  const techsPerWave = 5;

  const scheduledDeployments: Array<{
    techId: string;
    deployMonth: number;
    deployed: boolean;
  }> = [];

  let currentMonth = 0;
  for (let i = 0; i < sorted.length; i += techsPerWave) {
    const wave = sorted.slice(i, i + techsPerWave);
    for (const tech of wave) {
      scheduledDeployments.push({
        techId: tech.id,
        deployMonth: currentMonth,
        deployed: false
      });
    }
    currentMonth += deploymentInterval;
  }

  state.techDeploymentSchedule = {
    mode: 'sequenced',
    scheduledDeployments,
    deploymentLevel
  };

  console.log(`📅 Scheduled ${scheduledDeployments.length} technologies for deployment`);
  console.log(`   ${techsPerWave} techs per wave, ${deploymentInterval} month intervals`);
  console.log(`   Last deployment at month ${currentMonth - deploymentInterval}`);
  console.log('');
}

// ============================================================================
// METRIC EXTRACTION
// ============================================================================

interface MonthlyMetrics {
  month: number;
  deployedTechCount: number;
  deployedTechIds: string;

  // Tech effects (aggregate)
  climateRestorationEffect: number;
  oceanRestorationEffect: number;
  agricultureEffect: number;
  pollutionCleanupEffect: number;

  // Mortality
  baselineMortality: number;
  transitionMortality: number;
  totalMortality: number;
  population: number;

  // Environmental cascade metrics
  temperatureDelta: number;
  co2Concentration: number;
  oceanAcidification: number;
  biodiversityLoss: number;
  nitrogenBoundary: number;
  phosphorusBoundary: number;

  // Crisis metrics
  activeCrises: number;
  crisisTypes: string;

  // Governance
  governmentEffectiveness: number;
  socialCohesion: number;
}

function extractMetrics(state: GameState): MonthlyMetrics {
  // Deployed tech count and IDs
  const deployedTechs = state.techTreeState.regionalDeployment['global'] ?? [];
  const deployedTechCount = deployedTechs.length;
  const deployedTechIds = deployedTechs.map(d => d.techId).join(';');

  // Aggregate tech effects
  let climateRestorationEffect = 0;
  let oceanRestorationEffect = 0;
  let agricultureEffect = 0;
  let pollutionCleanupEffect = 0;

  for (const deployment of deployedTechs) {
    const tech = getTechById(deployment.techId);
    if (!tech) continue;

    const level = deployment.deploymentLevel;

    // Climate effects
    if (tech.effects.temperatureReduction) {
      climateRestorationEffect += tech.effects.temperatureReduction * level;
    }
    if (tech.effects.co2RemovalGtPerYear) {
      climateRestorationEffect += tech.effects.co2RemovalGtPerYear * level;
    }

    // Ocean effects
    if (tech.effects.oceanPHRestore) {
      oceanRestorationEffect += tech.effects.oceanPHRestore * level;
    }

    // Agriculture effects
    if (tech.effects.foodProductionBoost) {
      agricultureEffect += tech.effects.foodProductionBoost * level;
    }

    // Pollution cleanup
    if (tech.effects.pollutionReduction) {
      pollutionCleanupEffect += tech.effects.pollutionReduction * level;
    }
  }

  // Mortality
  const baselineMortality = state.humanPopulationSystem?.baselineMortalityRate ?? 0;
  const transitionMortality = state.humanPopulationSystem?.transitionMortalityRate ?? 0;
  const totalMortality = baselineMortality + transitionMortality;
  const population = state.humanPopulationSystem?.population ?? 0;

  // Environmental metrics
  const temperatureDelta = state.environmentalState?.temperatureDelta ?? 0;
  const co2Concentration = state.environmentalState?.co2Concentration ?? 0;
  const oceanAcidification = state.planetaryBoundaries?.oceanAcidification?.current ?? 0;
  const biodiversityLoss = state.planetaryBoundaries?.biodiversityLoss?.current ?? 0;
  const nitrogenBoundary = state.planetaryBoundaries?.nitrogenCycle?.current ?? 0;
  const phosphorusBoundary = state.planetaryBoundaries?.phosphorusCycle?.current ?? 0;

  // Crisis metrics
  const crises = state.crises;
  const activeCrises = Array.isArray(crises) ? crises.length : 0;
  const crisisTypes = Array.isArray(crises) ? crises.map(c => c.type).join(';') : '';

  // Governance
  const governmentEffectiveness = state.government?.effectiveness ?? 0;
  const socialCohesion = state.socialCohesion?.overall ?? 0;

  return {
    month: state.currentMonth,
    deployedTechCount,
    deployedTechIds,
    climateRestorationEffect,
    oceanRestorationEffect,
    agricultureEffect,
    pollutionCleanupEffect,
    baselineMortality,
    transitionMortality,
    totalMortality,
    population,
    temperatureDelta,
    co2Concentration,
    oceanAcidification,
    biodiversityLoss,
    nitrogenBoundary,
    phosphorusBoundary,
    activeCrises,
    crisisTypes,
    governmentEffectiveness,
    socialCohesion
  };
}

// ============================================================================
// SIMULATION
// ============================================================================

async function runDiagnostic() {
  console.log('🔬 Initializing simulation...');

  // Create engine with seed first
  const engine = new SimulationEngine(undefined as any, seed);
  const rng = engine.getRNG().next.bind(engine.getRNG());

  // Create initial state with RNG
  const initialState = createDefaultInitialState(rng);

  // Enable sequenced deployment
  setupSequencedDeployment(initialState, 0.95);

  // Re-initialize engine with complete state
  engine['_state'] = initialState;

  const metrics: MonthlyMetrics[] = [];

  console.log('▶️  Running simulation...');
  console.log('');

  for (let month = 0; month <= maxMonths; month++) {
    // Extract metrics
    const monthMetrics = extractMetrics(initialState);
    metrics.push(monthMetrics);

    // Log progress every 12 months
    if (month % 12 === 0) {
      const year = month / 12;
      console.log(`📊 Year ${year}: ${monthMetrics.deployedTechCount} techs deployed, ` +
                  `${(monthMetrics.totalMortality * 100).toFixed(2)}% mortality, ` +
                  `${(monthMetrics.population / 1e9).toFixed(2)}B population`);
    }

    // Step simulation
    if (month < maxMonths) {
      engine.step(initialState);
    }
  }

  console.log('');
  console.log('✅ Simulation complete');
  console.log('');

  return metrics;
}

// ============================================================================
// CSV OUTPUT
// ============================================================================

function writeCSV(metrics: MonthlyMetrics[]): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/tech_effectiveness_diagnostic_${timestamp}.csv`;

  // CSV header
  const header = [
    'month',
    'deployed_tech_count',
    'deployed_tech_ids',
    'climate_restoration_effect',
    'ocean_restoration_effect',
    'agriculture_effect',
    'pollution_cleanup_effect',
    'baseline_mortality',
    'transition_mortality',
    'total_mortality',
    'population',
    'temperature_delta',
    'co2_concentration',
    'ocean_acidification',
    'biodiversity_loss',
    'nitrogen_boundary',
    'phosphorus_boundary',
    'active_crises',
    'crisis_types',
    'government_effectiveness',
    'social_cohesion'
  ].join(',');

  // CSV rows
  const rows = metrics.map(m => [
    m.month,
    m.deployedTechCount,
    `"${m.deployedTechIds}"`,
    m.climateRestorationEffect.toFixed(6),
    m.oceanRestorationEffect.toFixed(6),
    m.agricultureEffect.toFixed(6),
    m.pollutionCleanupEffect.toFixed(6),
    m.baselineMortality.toFixed(6),
    m.transitionMortality.toFixed(6),
    m.totalMortality.toFixed(6),
    m.population.toFixed(0),
    m.temperatureDelta.toFixed(6),
    m.co2Concentration.toFixed(2),
    m.oceanAcidification.toFixed(6),
    m.biodiversityLoss.toFixed(6),
    m.nitrogenBoundary.toFixed(6),
    m.phosphorusBoundary.toFixed(6),
    m.activeCrises,
    `"${m.crisisTypes}"`,
    m.governmentEffectiveness.toFixed(6),
    m.socialCohesion.toFixed(6)
  ].join(','));

  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(filename, csv);

  return filename;
}

// ============================================================================
// ANALYSIS
// ============================================================================

function analyzeMetrics(metrics: MonthlyMetrics[]): void {
  console.log('='.repeat(80));
  console.log('ANALYSIS');
  console.log('='.repeat(80));
  console.log('');

  // Final state
  const final = metrics[metrics.length - 1];
  console.log(`📊 FINAL STATE (Month ${final.month}):`);
  console.log(`   Deployed techs: ${final.deployedTechCount}`);
  console.log(`   Population: ${(final.population / 1e9).toFixed(2)}B (${((1 - final.population / 8e9) * 100).toFixed(1)}% mortality)`);
  console.log(`   Temperature delta: +${final.temperatureDelta.toFixed(2)}°C`);
  console.log(`   Active crises: ${final.activeCrises}`);
  console.log('');

  // Tech effect magnitudes
  const maxClimate = Math.max(...metrics.map(m => m.climateRestorationEffect));
  const maxOcean = Math.max(...metrics.map(m => m.oceanRestorationEffect));
  const maxAgriculture = Math.max(...metrics.map(m => m.agricultureEffect));
  const maxPollution = Math.max(...metrics.map(m => m.pollutionCleanupEffect));

  console.log('🔬 TECH EFFECT MAGNITUDES:');
  console.log(`   Climate restoration (max): ${maxClimate.toFixed(4)}`);
  console.log(`   Ocean restoration (max): ${maxOcean.toFixed(4)}`);
  console.log(`   Agriculture boost (max): ${maxAgriculture.toFixed(4)}`);
  console.log(`   Pollution cleanup (max): ${maxPollution.toFixed(4)}`);
  console.log('');

  // Race condition: when do cascades start vs when do techs deploy?
  const firstCrisis = metrics.find(m => m.activeCrises > 0);
  const firstTechDeployment = metrics.find(m => m.deployedTechCount > 0);
  const significantTechDeployment = metrics.find(m => m.deployedTechCount >= 20);

  console.log('⏱️  RACE CONDITION TIMING:');
  console.log(`   First crisis: Month ${firstCrisis?.month ?? 'never'}`);
  console.log(`   First tech deployment: Month ${firstTechDeployment?.month ?? 'never'}`);
  console.log(`   Significant deployment (20+ techs): Month ${significantTechDeployment?.month ?? 'never'}`);
  console.log('');

  // Mortality trajectory
  const mortalitySpike = metrics.find(m => m.totalMortality > 0.05); // 5% monthly mortality
  const catastrophicMortality = metrics.find(m => m.totalMortality > 0.10); // 10% monthly mortality

  console.log('☠️  MORTALITY TRAJECTORY:');
  console.log(`   First 5% monthly mortality: Month ${mortalitySpike?.month ?? 'never'}`);
  console.log(`   First 10% monthly mortality: Month ${catastrophicMortality?.month ?? 'never'}`);
  console.log('');

  // Environmental degradation
  const tempThreshold = metrics.find(m => m.temperatureDelta > 2.0); // 2°C warming
  const oceanThreshold = metrics.find(m => m.oceanAcidification > 0.7); // 70% boundary violation

  console.log('🌍 ENVIRONMENTAL THRESHOLDS:');
  console.log(`   First +2°C warming: Month ${tempThreshold?.month ?? 'never'}`);
  console.log(`   First 70% ocean acidification: Month ${oceanThreshold?.month ?? 'never'}`);
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================

(async () => {
  try {
    const metrics = await runDiagnostic();
    const csvPath = writeCSV(metrics);

    console.log(`💾 Wrote diagnostic CSV: ${csvPath}`);
    console.log('');

    analyzeMetrics(metrics);

    console.log('='.repeat(80));
    console.log('INVESTIGATION COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  }
})();
