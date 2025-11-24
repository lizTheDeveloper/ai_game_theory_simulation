#!/usr/bin/env tsx
/**
 * Coordinated God Mode Monte Carlo Validation
 *
 * Runs N simulations comparing coordinated vs uncoordinated god mode.
 * Tests the hypothesis: AI-coordinated deployment reduces mortality.
 *
 * Usage:
 *   npx tsx scripts/coordinatedGodModeMonteCarlo.ts [N=10] [maxMonths=120] [baseSeed=42]
 *
 * Output:
 *   - Console summary with statistical comparison
 *   - CSV file: logs/coordinated_god_mode_mc_YYYY-MM-DD.csv
 *   - Log file: logs/coordinated_god_mode_mc_YYYY-MM-DD.log
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech, TechDefinition } from '../src/simulation/techTree/comprehensiveTechTree';
import type { GameState } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// PARAMETERS
// ============================================================================

const N = process.argv[2] ? parseInt(process.argv[2]) : 10;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;
const baseSeed = process.argv[4] ? parseInt(process.argv[4]) : 42;
const deploymentInterval = 3; // months between waves
const TECHS_PER_WAVE = 5;

// Deployment gates
const ECONOMIC_STRESS_THRESHOLD = 0.7;
const MORTALITY_SPIKE_THRESHOLD = 0.02;

// ============================================================================
// LOGGING
// ============================================================================

const timestamp = new Date().toISOString().split('T')[0];
const outputDir = path.join(__dirname, '..', 'logs');
const outputFile = path.join(outputDir, `coordinated_god_mode_mc_${timestamp}.log`);
const csvFile = path.join(outputDir, `coordinated_god_mode_mc_${timestamp}.csv`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

// ============================================================================
// TECH PRIORITIZATION (same as coordinatedGodMode.ts)
// ============================================================================

function prioritizeTechnologies(allTech: TechDefinition[]): TechDefinition[] {
  return [...allTech].sort((a, b) => {
    const statusPriority: Record<string, number> = { 'unlockable': 0, 'future': 1, 'deployed_2025': 2 };
    const aStatus = statusPriority[a.status] ?? 1;
    const bStatus = statusPriority[b.status] ?? 1;
    if (aStatus !== bStatus) return aStatus - bStatus;

    const aCapability = a.minAICapability ?? 0;
    const bCapability = b.minAICapability ?? 0;
    if (aCapability !== bCapability) return aCapability - bCapability;

    const categoryPriority: Record<string, number> = {
      'climate': 0, 'ocean': 1, 'agriculture': 2, 'freshwater': 3,
      'medical': 4, 'energy': 5, 'pollution': 6, 'social': 7, 'alignment': 8,
    };
    const aCategory = categoryPriority[a.category] ?? 5;
    const bCategory = categoryPriority[b.category] ?? 5;
    if (aCategory !== bCategory) return aCategory - bCategory;

    return a.id.localeCompare(b.id);
  });
}

// ============================================================================
// ECONOMIC STRESS CALCULATION
// ============================================================================

function calculateEconomicStress(state: GameState): number {
  const transition = state.transitionManagementSystem;
  const workforceDisplacement = transition?.workforceDisplacementRate || 0;
  const gdp = state.globalEconomicActivity || 0;
  const initialGDP = 105e12;
  let economicDecline = 0;
  if (gdp > 0 && initialGDP > 0) {
    const gdpRatio = gdp / initialGDP;
    economicDecline = Math.max(0, Math.min(1, 1 - gdpRatio));
  }
  const coordinationStress = transition?.coordinationFailureActive ? 0.3 : 0;
  return Math.min(1, workforceDisplacement * 2 + economicDecline * 0.5 + coordinationStress);
}

// ============================================================================
// RUN SINGLE COORDINATED SIMULATION
// ============================================================================

interface RunResult {
  seed: number;
  mode: 'coordinated' | 'uncoordinated';
  outcome: string;
  months: number;
  populationInitial: number;
  populationFinal: number;
  mortalityRate: number;
  techsDeployed: number;
  deploymentWaves: number;
  pausedMonths: number;
  coordinationFailures: number;
  overallQoL: number;
}

function runCoordinatedSimulation(seed: number): RunResult {
  const engine = new SimulationEngine(undefined as any, seed);
  const rng = engine.getRNG().next.bind(engine.getRNG());
  const state = createDefaultInitialState(rng);

  // Initialize high coordination
  if (state.transitionManagementSystem) {
    state.transitionManagementSystem.aiCoordinationCapability = 0.8;
    state.transitionManagementSystem.governanceEffectiveness = 0.7;
    state.transitionManagementSystem.supportSystems.ubiCoverage = 0.6;
    state.transitionManagementSystem.supportSystems.universalHealthcareCoverage = 0.7;
    state.transitionManagementSystem.supportSystems.foodSecurityIndex = 0.8;
  }

  const allTech = getAllTech();
  const prioritizedTech = prioritizeTechnologies(allTech);
  const initialPopulation = state.humanPopulationSystem.population;

  let techIndex = 0;
  let lastDeploymentMonth = 0;
  let totalDeployed = 0;
  let pausedMonths = 0;
  let waveNumber = 0;

  // Run simulation with paced deployment
  while (state.currentMonth < maxMonths && techIndex < prioritizedTech.length) {
    const economicStress = calculateEconomicStress(state);
    const monthlyMortality = state.transitionManagementSystem?.mortalityThisMonth || 0;
    const timeSinceLastDeploy = state.currentMonth - lastDeploymentMonth;

    if (timeSinceLastDeploy >= deploymentInterval && techIndex < prioritizedTech.length) {
      let canDeploy = true;
      if (economicStress > ECONOMIC_STRESS_THRESHOLD) canDeploy = false;
      if (monthlyMortality > MORTALITY_SPIKE_THRESHOLD) canDeploy = false;

      if (canDeploy) {
        waveNumber++;
        const waveEnd = Math.min(techIndex + TECHS_PER_WAVE, prioritizedTech.length);
        const waveTech = prioritizedTech.slice(techIndex, waveEnd);

        for (const tech of waveTech) {
          if (!state.techTreeState.unlockedTech.includes(tech.id)) {
            state.techTreeState.unlockedTech.push(tech.id);
            state.techTreeState.techUnlockedCount++;
          }
          if (!state.techTreeState.regionalDeployment['global']) {
            state.techTreeState.regionalDeployment['global'] = [];
          }
          const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);
          if (!existing) {
            state.techTreeState.regionalDeployment['global'].push({
              techId: tech.id,
              region: 'global',
              deploymentLevel: 1.0,
              monthlyInvestment: 0,
              totalInvested: tech.deploymentCost,
              deployedBy: [`coordinated_wave_${waveNumber}`],
              effects: tech.effects,
            });
            state.techTreeState.techDeployedCount++;
            totalDeployed++;
          }
          if (state.transitionManagementSystem) {
            state.transitionManagementSystem.recentDeploymentsCount += 1;
          }
        }
        techIndex = waveEnd;
        lastDeploymentMonth = state.currentMonth;
      } else {
        pausedMonths++;
      }
    }

    engine.step(state);
    if (state.outcome) break;
  }

  // Deploy remaining techs
  while (techIndex < prioritizedTech.length) {
    waveNumber++;
    const waveEnd = Math.min(techIndex + TECHS_PER_WAVE, prioritizedTech.length);
    const waveTech = prioritizedTech.slice(techIndex, waveEnd);
    for (const tech of waveTech) {
      if (!state.techTreeState.unlockedTech.includes(tech.id)) {
        state.techTreeState.unlockedTech.push(tech.id);
        state.techTreeState.techUnlockedCount++;
      }
      if (!state.techTreeState.regionalDeployment['global']) {
        state.techTreeState.regionalDeployment['global'] = [];
      }
      const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);
      if (!existing) {
        state.techTreeState.regionalDeployment['global'].push({
          techId: tech.id,
          region: 'global',
          deploymentLevel: 1.0,
          monthlyInvestment: 0,
          totalInvested: tech.deploymentCost,
          deployedBy: [`coordinated_wave_${waveNumber}`],
          effects: tech.effects,
        });
        state.techTreeState.techDeployedCount++;
        totalDeployed++;
      }
    }
    techIndex = waveEnd;
    for (let i = 0; i < 3 && state.currentMonth < maxMonths; i++) engine.step(state);
  }

  // Finish remaining months
  while (state.currentMonth < maxMonths && !state.outcome) {
    engine.step(state);
  }

  const finalPopulation = state.humanPopulationSystem.population;
  const mortalityRate = ((initialPopulation - finalPopulation) / initialPopulation) * 100;

  const qol = state.qualityOfLifeSystems;
  const survivalAvg = (qol.survivalFundamentals.foodSecurity + qol.survivalFundamentals.waterSecurity +
                       qol.survivalFundamentals.thermalHabitability + qol.survivalFundamentals.shelterSecurity) / 4;
  const tier1Avg = (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
  const tier2Avg = (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
  const tier3Avg = (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
  const tier4Avg = (qol.healthcareQuality + qol.longevityGains + qol.diseasesBurden) / 3;
  const tier5Avg = (qol.ecosystemHealth + qol.climateStability + qol.pollutionLevel) / 3;
  const overallQoL = (survivalAvg + tier1Avg + tier2Avg + tier3Avg + tier4Avg + tier5Avg) / 6;

  return {
    seed,
    mode: 'coordinated',
    outcome: state.outcome || 'ongoing',
    months: state.currentMonth,
    populationInitial: initialPopulation,
    populationFinal: finalPopulation,
    mortalityRate,
    techsDeployed: totalDeployed,
    deploymentWaves: waveNumber,
    pausedMonths,
    coordinationFailures: state.transitionManagementSystem?.coordinationFailures || 0,
    overallQoL: overallQoL * 100
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function coefficientOfVariation(values: number[]): number {
  const avg = mean(values);
  if (avg === 0) return 0;
  return (stdDev(values) / Math.abs(avg)) * 100;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

log('='.repeat(80));
log('COORDINATED GOD MODE - MONTE CARLO VALIDATION');
log('='.repeat(80));
log(`N: ${N} runs`);
log(`Max months: ${maxMonths}`);
log(`Base seed: ${baseSeed}`);
log(`Deployment interval: ${deploymentInterval} months`);
log(`Techs per wave: ${TECHS_PER_WAVE}`);
log(`Output: ${outputFile}`);
log(`CSV: ${csvFile}`);
log('='.repeat(80));
log('');

const results: RunResult[] = [];

for (let i = 0; i < N; i++) {
  const seed = baseSeed + i;
  log(`[${i + 1}/${N}] Seed ${seed}...`);

  try {
    const result = runCoordinatedSimulation(seed);
    results.push(result);
    log(`  Complete: ${result.outcome}, mortality ${result.mortalityRate.toFixed(1)}%, pop ${result.populationFinal.toFixed(2)}B`);
  } catch (err: any) {
    log(`  FAILED: ${err.message}`);
  }
}

log('');
log('='.repeat(80));
log('STATISTICAL ANALYSIS');
log('='.repeat(80));
log('');

const mortalities = results.map(r => r.mortalityRate);
const populations = results.map(r => r.populationFinal);
const qols = results.map(r => r.overallQoL);

log('COORDINATED GOD MODE RESULTS:');
log(`  Mean mortality:     ${mean(mortalities).toFixed(1)}%`);
log(`  SD mortality:       ${stdDev(mortalities).toFixed(1)}%`);
log(`  CV mortality:       ${coefficientOfVariation(mortalities).toFixed(2)}%`);
log(`  Min mortality:      ${Math.min(...mortalities).toFixed(1)}%`);
log(`  Max mortality:      ${Math.max(...mortalities).toFixed(1)}%`);
log('');
log(`  Mean final pop:     ${mean(populations).toFixed(2)}B`);
log(`  Mean overall QoL:   ${mean(qols).toFixed(1)}%`);
log('');

log('COMPARISON WITH BASELINE GOD MODE (from reviews/god_mode_paradox_analysis_20251123.md):');
log(`  Baseline (uncoordinated) mortality: 92.1% (N=20, CV=0.8%)`);
log(`  Coordinated mortality:              ${mean(mortalities).toFixed(1)}% (N=${N}, CV=${coefficientOfVariation(mortalities).toFixed(1)}%)`);
log(`  Improvement:                        ${(92.1 - mean(mortalities)).toFixed(1)} percentage points`);
log(`  Relative improvement:               ${((92.1 - mean(mortalities)) / 92.1 * 100).toFixed(1)}%`);
log('');

// Outcome distribution
const outcomeCounts: Record<string, number> = {};
for (const r of results) {
  outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
}
log('OUTCOME DISTRIBUTION:');
for (const [outcome, count] of Object.entries(outcomeCounts)) {
  log(`  ${outcome}: ${count} (${(count / N * 100).toFixed(1)}%)`);
}
log('');

// Write CSV
const csvHeader = 'seed,mode,outcome,months,pop_initial,pop_final,mortality_rate,techs_deployed,waves,paused_months,coordination_failures,overall_qol\n';
fs.writeFileSync(csvFile, csvHeader, 'utf8');

for (const r of results) {
  const row = [
    r.seed,
    r.mode,
    r.outcome,
    r.months,
    r.populationInitial.toFixed(2),
    r.populationFinal.toFixed(2),
    r.mortalityRate.toFixed(2),
    r.techsDeployed,
    r.deploymentWaves,
    r.pausedMonths,
    r.coordinationFailures,
    r.overallQoL.toFixed(2)
  ].join(',');
  fs.appendFileSync(csvFile, row + '\n', 'utf8');
}

log('CSV written successfully');
log('');
log('='.repeat(80));
log('VALIDATION COMPLETE');
log('='.repeat(80));
