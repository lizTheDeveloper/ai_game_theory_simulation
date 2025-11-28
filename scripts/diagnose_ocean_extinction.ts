#!/usr/bin/env npx tsx
/**
 * Diagnose ocean acidification causing population extinction at month 398
 * Architecture review for Quality Gate 2
 */

import { initializeGameState } from '../src/simulation/initialization';
import { runSimulationStep } from '../src/simulation/step';
import { createSeededRng } from '../src/simulation/utils/deterministicRng';

console.log('🔍 Ocean Acidification Population Extinction Analysis');
console.log('=' .repeat(80));

// Initialize state with seed for reproducibility
const rng = createSeededRng(42);
const state = initializeGameState(rng);

// Track key metrics
const metrics: Array<{
  month: number;
  population: number;
  pH: number;
  coralHealth: number;
  fishYield: number;
  fishImpact: number;
  materialAbundance: number;
  monthlyDeaths: number;
}> = [];

// Run simulation until extinction or 500 months
for (let month = 0; month < 500; month++) {
  // Get initial metrics
  const prevPop = state.humanPopulationSystem.population;

  // Run step
  runSimulationStep(state, rng);

  // Calculate monthly deaths
  const monthlyDeaths = (prevPop - state.humanPopulationSystem.population) * 1000; // Convert to millions

  // Record metrics
  const oa = state.oceanAcidificationSystem;
  if (oa) {
    metrics.push({
      month: state.currentMonth,
      population: state.humanPopulationSystem.population,
      pH: oa.pH,
      coralHealth: oa.coralReefHealth,
      fishYield: oa.coastalFisheriesYield,
      fishImpact: oa.fishDependentImpact,
      materialAbundance: state.qualityOfLifeSystems.materialAbundance,
      monthlyDeaths
    });
  }

  // Log significant events
  if (month % 50 === 0 || (oa && oa.cascadeActive && month % 10 === 0)) {
    console.log(`Month ${month}: Pop ${state.humanPopulationSystem.population.toFixed(3)}B, pH ${oa?.pH.toFixed(2)}, Coral ${oa?.coralReefHealth.toFixed(0)}%`);
  }

  // Check for extinction conditions
  if (state.humanPopulationSystem.population < 0.001) {
    console.log(`\n❌ EXTINCTION at month ${month}`);
    console.log(`   Final population: ${(state.humanPopulationSystem.population * 1e9).toFixed(0)} people`);
    break;
  }

  // Check for ocean cascade events
  if (oa) {
    if (oa.cascadeActive && month === state.currentMonth) {
      console.log(`\n🌊 CASCADE ACTIVATED at month ${month}`);
    }
    if (oa.coralExtinctionActive && !metrics.some(m => m.coralHealth < 30)) {
      console.log(`\n🪸 CORAL COLLAPSE at month ${month}`);
    }
    if (oa.marineFoodWebCollapseActive && !metrics.some(m => m.coralHealth < 30)) {
      console.log(`\n🐟 MARINE COLLAPSE at month ${month}`);
    }
  }
}

// Analyze critical periods
console.log('\n📊 Critical Period Analysis');
console.log('=' .repeat(80));

// Find when population starts declining rapidly
let rapidDeclineMonth = -1;
for (let i = 1; i < metrics.length; i++) {
  if (metrics[i].monthlyDeaths > 50) { // > 50M deaths/month
    rapidDeclineMonth = metrics[i].month;
    console.log(`\n⚠️ Rapid decline starts at month ${rapidDeclineMonth}`);
    console.log(`   Deaths: ${metrics[i].monthlyDeaths.toFixed(1)}M/month`);
    console.log(`   pH: ${metrics[i].pH.toFixed(3)}`);
    console.log(`   Coral: ${metrics[i].coralHealth.toFixed(1)}%`);
    console.log(`   Fish yield: ${(metrics[i].fishYield * 100).toFixed(1)}%`);
    console.log(`   Fish impact: ${(metrics[i].fishImpact * 100).toFixed(1)}%`);
    console.log(`   Material abundance: ${(metrics[i].materialAbundance * 100).toFixed(1)}%`);
    break;
  }
}

// Find cascade activation point
const cascadeMonth = metrics.find(m => m.pH < 7.9)?.month ?? -1;
if (cascadeMonth > 0) {
  console.log(`\n🌊 Ocean cascade activated at month ${cascadeMonth}`);
  const cascadeMetrics = metrics[cascadeMonth];
  console.log(`   pH crossed 7.9 threshold: ${cascadeMetrics.pH.toFixed(3)}`);
  console.log(`   Coral health: ${cascadeMetrics.coralHealth.toFixed(1)}%`);
  console.log(`   Population: ${cascadeMetrics.population.toFixed(3)}B`);
}

// Analyze final state before extinction
const finalMetrics = metrics[metrics.length - 1];
console.log('\n💀 Final State Analysis');
console.log('=' .repeat(80));
console.log(`Month: ${finalMetrics.month}`);
console.log(`Population: ${finalMetrics.population.toFixed(6)}B (${(finalMetrics.population * 1e9).toFixed(0)} people)`);
console.log(`pH: ${finalMetrics.pH.toFixed(3)}`);
console.log(`Coral health: ${finalMetrics.coralHealth.toFixed(1)}%`);
console.log(`Fish yield: ${(finalMetrics.fishYield * 100).toFixed(2)}%`);
console.log(`Fish-dependent impact: ${(finalMetrics.fishImpact * 100).toFixed(1)}%`);
console.log(`Material abundance: ${(finalMetrics.materialAbundance * 100).toFixed(2)}%`);
console.log(`Monthly deaths: ${finalMetrics.monthlyDeaths.toFixed(1)}M`);

// Death attribution
console.log('\n📊 Death Attribution');
const deathsByCat = state.humanPopulationSystem.deathsByCategory;
const totalDeaths = Object.values(deathsByCat).reduce((sum, d) => sum + d, 0);
for (const [category, deaths] of Object.entries(deathsByCat)) {
  if (deaths > 0) {
    console.log(`  ${category}: ${deaths.toFixed(0)}M (${((deaths/totalDeaths) * 100).toFixed(1)}%)`);
  }
}

// Calculate rate of pH decline
const avgPHDecline = (7.9 - finalMetrics.pH) / finalMetrics.month;
console.log(`\n📉 Average pH decline: ${(avgPHDecline * 12).toFixed(4)}/year`);
console.log(`   Implies SSP scenario: ${avgPHDecline > 0.0003 ? 'SSP5-8.5 (worst case)' : avgPHDecline > 0.0002 ? 'SSP3-7.0' : 'SSP2-4.5'}`);

// Check compound effects
console.log('\n🔄 Compound Effects Check');
console.log(`Climate stability: ${state.environmentalAccumulation.climateStability.toFixed(3)}`);
console.log(`Biodiversity: ${state.environmentalAccumulation.biodiversityIndex.toFixed(3)}`);
console.log(`Pollution: ${state.environmentalAccumulation.pollutionLevel.toFixed(3)}`);
console.log(`Ocean CO2 absorption: ${state.oceanAcidificationSystem?.co2AbsorptionCapacity.toFixed(3)}`);

console.log('\n✅ Analysis complete');