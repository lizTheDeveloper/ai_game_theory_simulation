/**
 * Diagnostic: Famine Cascade Investigation
 *
 * Investigate why baseline simulation crashes at month 318 from famine cascades.
 * Track climate → food security → famine mortality path.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const SEED = 'famine_diagnostic_2025';
const TARGET_MONTH = 330;  // Go a bit past the crash point

const LINE = '='.repeat(80);

console.log(`\n${LINE}`);
console.log(`FAMINE CASCADE DIAGNOSTIC`);
console.log(`Seed: ${SEED}`);
console.log(`Target: Month ${TARGET_MONTH} (${(TARGET_MONTH / 12).toFixed(1)} years)`);
console.log(`${LINE}\n`);

const engine = new SimulationEngine({ seed: SEED, maxMonths: TARGET_MONTH + 10 });
const rngFunction = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rngFunction);

// Track key metrics
let lastReportMonth = -12;

const result = engine.run(state, {
  maxMonths: TARGET_MONTH,
  checkActualOutcomes: true,
  onMonthEnd: (state) => {
    const month = state.currentMonth;
    const currentPop = state.humanPopulationSystem.population;

    // Calculate global food security
    const totalRegionalPop = state.humanPopulationSystem.regionalPopulations?.reduce(
      (sum, r) => sum + r.population, 0
    ) || 0;
    const globalFood = totalRegionalPop > 0
      ? state.humanPopulationSystem.regionalPopulations!.reduce(
          (sum, r) => sum + (r.foodSecurity * r.population), 0
        ) / totalRegionalPop
      : 0;

    // Log every 12 months OR significant events
    if (month - lastReportMonth >= 12 || globalFood < 0.5 || currentPop < 0.5) {
      lastReportMonth = month;
      const year = Math.floor(month / 12);
      console.log(`\nMonth ${month} (Year ${year}):`);
      console.log(`  Population: ${currentPop.toFixed(3)}B`);
      console.log(`  Global Food Security: ${(globalFood * 100).toFixed(1)}%`);

      // Check for crisis activations
      const crises = [];
      if (state.environmentalAccumulation?.climateCrisisActive) crises.push('Climate crisis');
      if (state.planetaryBoundariesSystem?.cascadeActive) crises.push('PB cascade');
      if (state.nuclearWinterState?.active) crises.push(`Nuclear winter (${state.nuclearWinterState.monthsSinceWar}mo)`);
      if (crises.length > 0) {
        console.log(`  🚨 Active Crises: ${crises.join(', ')}`);
      }

      // Show regional food security breakdown if low
      if (globalFood < 0.8) {
        console.log(`\n  Regional Food Security:`);
        const regions = state.humanPopulationSystem.regionalPopulations || [];
        for (const region of regions) {
          const vulnScore = region.climateVulnerability * 0.5 + region.resourceVulnerability * 0.5;
          console.log(`    ${region.name}: ${(region.foodSecurity * 100).toFixed(1)}% (pop: ${region.population.toFixed(0)}M, vuln: ${vulnScore.toFixed(2)})`);
        }
      }

      // Show famine system state if active
      if (state.famineSystem && state.famineSystem.activeFamines.length > 0) {
        console.log(`\n  Active Famines: ${state.famineSystem.activeFamines.length}`);
        for (const famine of state.famineSystem.activeFamines) {
          console.log(`    - ${famine.affectedRegion}: ${famine.cause} (day ${famine.currentDay}/${famine.peakDeathDay})`);
        }
        console.log(`  Total famine deaths: ${state.famineSystem.totalDeaths.toFixed(1)}M`);
      }

      // Show mortality breakdown
      if (state.humanPopulationSystem.monthlyExcessDeaths > 0.1) {
        console.log(`\n  💀 Monthly Deaths: ${state.humanPopulationSystem.monthlyExcessDeaths.toFixed(1)}M`);
        console.log(`     Cumulative: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(0)}M`);
      }

      // Break if population crashes below 10M
      if (currentPop < 0.01) {
        console.log(`\n${LINE}`);
        console.log(`❌ POPULATION CRASH at month ${month} (${(month / 12).toFixed(1)} years)`);
        console.log(`   Final population: ${(currentPop * 1000).toFixed(1)}M`);
        console.log(`   Food security: ${(globalFood * 100).toFixed(1)}%`);
        console.log(`${LINE}`);
      }
    }
  }
});

console.log(`\n${LINE}`);
console.log(`DIAGNOSTIC COMPLETE`);
console.log(`Final outcome: ${result.outcome}`);
console.log(`${LINE}\n`);
