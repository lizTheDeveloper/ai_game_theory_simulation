/**
 * Diagnostic: Novel Entities Mortality Risk Propagation
 *
 * Tests whether chemical pollution risks from novelEntities.ts properly
 * propagate through the Bayesian mortality system.
 *
 * Expected behavior:
 * - addMortalityRisk() should be called when crises trigger
 * - Risks should accumulate in pop.mortalityRisks[]
 * - resolveMortality() should apply these risks to population
 *
 * Bug hypothesis (CRITICAL-2 from architecture review):
 * - Risks are added but don't propagate through Bayesian network
 * - Chemical pollution has no real effect on mortality outcomes
 *
 * Date: Nov 14, 2025 (orchestrator investigation)
 */

import { SimulationEngine } from '../src/simulation/engine';
import { GameState } from '../src/types/game';
import { HumanPopulationSystem } from '../src/types/population';
import { MortalityRisk } from '../src/types/bayesianMortality';

interface DiagnosticResult {
  scenario: string;
  seed: number;
  months: number;
  initialPopulation: number;
  finalPopulation: number;
  totalDeaths: number;
  mortalityRate: number;
  novelEntitiesEvents: {
    reproductiveCrisis: boolean;
    bioaccumulationCollapse: boolean;
    chronicDiseaseEpidemic: boolean;
  };
  mortalityRisksAdded: number;
  pollutionRisksAdded: number;
  avgChemicalLoad: number;
  avgPFASPrevalence: number;
  avgChronicDiseasePrevalence: number;
}

/**
 * Run diagnostic with instrumentation
 */
function runDiagnostic(scenario: 'baseline' | 'high_pollution', seed: number, months: number = 120): DiagnosticResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DIAGNOSTIC: ${scenario.toUpperCase()} (seed: ${seed}, months: ${months})`);
  console.log(`${'='.repeat(80)}\n`);

  const engine = new SimulationEngine({ seed, maxMonths: months, logLevel: 'detailed' });
  let state = engine.getState();

  // SCENARIO SETUP
  if (scenario === 'high_pollution') {
    console.log(`🧪 INJECTING HIGH POLLUTION SCENARIO...`);
    // Accelerate chemical accumulation
    if (state.novelEntitiesSystem) {
      state.novelEntitiesSystem.syntheticChemicalLoad = 0.70; // Already severe
      state.novelEntitiesSystem.microplasticConcentration = 0.65;
      state.novelEntitiesSystem.pfasPrevalence = 0.75;
      state.novelEntitiesSystem.endocrineDisruption = 0.60;
      state.novelEntitiesSystem.chronicDiseasePrevalence = 0.45; // Above epidemic threshold
      state.novelEntitiesSystem.reproductiveHealthDecline = 0.55; // Above crisis threshold
      state.novelEntitiesSystem.bioaccumulationFactor = 0.65; // Above collapse threshold
      state.novelEntitiesSystem.annualEmissions = 100000; // High emissions (max from Ling 2024)
      state.novelEntitiesSystem.accumulatedStock = 5000000; // 5M Mt accumulated
      console.log(`  Chemical load: ${(state.novelEntitiesSystem.syntheticChemicalLoad * 100).toFixed(0)}%`);
      console.log(`  PFAS prevalence: ${(state.novelEntitiesSystem.pfasPrevalence * 100).toFixed(0)}%`);
      console.log(`  Chronic disease: ${(state.novelEntitiesSystem.chronicDiseasePrevalence * 100).toFixed(0)}%`);
      console.log(`  Reproductive decline: ${(state.novelEntitiesSystem.reproductiveHealthDecline * 100).toFixed(0)}%`);
      console.log(`  Bioaccumulation: ${(state.novelEntitiesSystem.bioaccumulationFactor * 100).toFixed(0)}%`);
    }
  }

  const initialPopulation = state.humanPopulationSystem.population;
  let totalMortalityRisks = 0;
  let totalPollutionRisks = 0;
  let chemicalLoadSum = 0;
  let pfasSum = 0;
  let diseaseSum = 0;
  let monthCount = 0;

  // Track novel entities events
  const events = {
    reproductiveCrisis: false,
    bioaccumulationCollapse: false,
    chronicDiseaseEpidemic: false,
  };

  // INSTRUMENTATION: Track mortality risks added per month
  console.log(`\n📊 MONTHLY TRACKING:\n`);

  for (let month = 0; month < months; month++) {
    // Count risks BEFORE step
    const pop = state.humanPopulationSystem as HumanPopulationSystem & { mortalityRisks?: MortalityRisk[] };
    const risksBefore = pop.mortalityRisks?.length || 0;

    // Step simulation
    state = engine.step();

    // Count risks AFTER step (before resolution)
    const risksAfter = pop.mortalityRisks?.length || 0;
    const risksAdded = risksAfter - risksBefore;
    totalMortalityRisks += risksAdded;

    // Count pollution-specific risks
    const pollutionRisksAdded = (pop.mortalityRisks || [])
      .slice(risksBefore)
      .filter(r => r.type === 'pollution' || r.proximate === 'pollution')
      .length;
    totalPollutionRisks += pollutionRisksAdded;

    // Track novel entities state
    if (state.novelEntitiesSystem) {
      chemicalLoadSum += state.novelEntitiesSystem.syntheticChemicalLoad;
      pfasSum += state.novelEntitiesSystem.pfasPrevalence;
      diseaseSum += state.novelEntitiesSystem.chronicDiseasePrevalence;
      monthCount++;

      // Detect events
      if (state.novelEntitiesSystem.reproductiveCrisisActive) events.reproductiveCrisis = true;
      if (state.novelEntitiesSystem.bioaccumulationCollapseActive) events.bioaccumulationCollapse = true;
      if (state.novelEntitiesSystem.chronicDiseaseEpidemicActive) events.chronicDiseaseEpidemic = true;
    }

    // Log significant months
    if (risksAdded > 0 || pollutionRisksAdded > 0 || month % 12 === 0) {
      console.log(`  Month ${month.toString().padStart(3)}: ` +
        `Pop=${(state.humanPopulationSystem.population / 1e9).toFixed(3)}B, ` +
        `Risks=${risksAdded}, ` +
        `Pollution=${pollutionRisksAdded}, ` +
        `ChemLoad=${state.novelEntitiesSystem ? (state.novelEntitiesSystem.syntheticChemicalLoad * 100).toFixed(0) : 'N/A'}%`);
    }
  }

  const finalPopulation = state.humanPopulationSystem.population;
  const totalDeaths = initialPopulation - finalPopulation;
  const mortalityRate = totalDeaths / initialPopulation;

  const result: DiagnosticResult = {
    scenario,
    seed,
    months,
    initialPopulation,
    finalPopulation,
    totalDeaths,
    mortalityRate,
    novelEntitiesEvents: events,
    mortalityRisksAdded: totalMortalityRisks,
    pollutionRisksAdded: totalPollutionRisks,
    avgChemicalLoad: monthCount > 0 ? chemicalLoadSum / monthCount : 0,
    avgPFASPrevalence: monthCount > 0 ? pfasSum / monthCount : 0,
    avgChronicDiseasePrevalence: monthCount > 0 ? diseaseSum / monthCount : 0,
  };

  // SUMMARY
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SUMMARY: ${scenario.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Population: ${(initialPopulation / 1e9).toFixed(3)}B → ${(finalPopulation / 1e9).toFixed(3)}B`);
  console.log(`Deaths: ${(totalDeaths / 1e6).toFixed(1)}M (${(mortalityRate * 100).toFixed(2)}%)`);
  console.log(`\nNovel Entities Events:`);
  console.log(`  Reproductive crisis: ${events.reproductiveCrisis ? '✅ YES' : '❌ NO'}`);
  console.log(`  Bioaccumulation collapse: ${events.bioaccumulationCollapse ? '✅ YES' : '❌ NO'}`);
  console.log(`  Chronic disease epidemic: ${events.chronicDiseaseEpidemic ? '✅ YES' : '❌ NO'}`);
  console.log(`\nMortality Risks:`);
  console.log(`  Total risks added: ${totalMortalityRisks}`);
  console.log(`  Pollution risks added: ${totalPollutionRisks}`);
  console.log(`\nChemical Metrics (avg over ${monthCount} months):`);
  console.log(`  Chemical load: ${(result.avgChemicalLoad * 100).toFixed(1)}%`);
  console.log(`  PFAS prevalence: ${(result.avgPFASPrevalence * 100).toFixed(1)}%`);
  console.log(`  Chronic disease: ${(result.avgChronicDiseasePrevalence * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(80)}\n`);

  return result;
}

/**
 * Compare scenarios
 */
function compareScenarios(baseline: DiagnosticResult, highPollution: DiagnosticResult): void {
  console.log(`\n${'#'.repeat(80)}`);
  console.log(`COMPARISON: BASELINE vs HIGH POLLUTION`);
  console.log(`${'#'.repeat(80)}\n`);

  console.log(`Population Loss:`);
  console.log(`  Baseline: ${(baseline.mortalityRate * 100).toFixed(2)}%`);
  console.log(`  High Pollution: ${(highPollution.mortalityRate * 100).toFixed(2)}%`);
  console.log(`  Difference: ${((highPollution.mortalityRate - baseline.mortalityRate) * 100).toFixed(2)}pp`);
  console.log(``);

  console.log(`Mortality Risks Added:`);
  console.log(`  Baseline: ${baseline.mortalityRisksAdded} total, ${baseline.pollutionRisksAdded} pollution`);
  console.log(`  High Pollution: ${highPollution.mortalityRisksAdded} total, ${highPollution.pollutionRisksAdded} pollution`);
  console.log(`  Difference: ${highPollution.pollutionRisksAdded - baseline.pollutionRisksAdded} pollution risks`);
  console.log(``);

  console.log(`Novel Entities Events:`);
  console.log(`  Baseline: ${Object.values(baseline.novelEntitiesEvents).filter(Boolean).length} triggered`);
  console.log(`  High Pollution: ${Object.values(highPollution.novelEntitiesEvents).filter(Boolean).length} triggered`);
  console.log(``);

  // DIAGNOSIS
  console.log(`${'='.repeat(80)}`);
  console.log(`DIAGNOSIS:`);
  console.log(`${'='.repeat(80)}\n`);

  if (highPollution.pollutionRisksAdded > baseline.pollutionRisksAdded) {
    console.log(`✅ Novel entities system IS adding mortality risks`);
    console.log(`   (${highPollution.pollutionRisksAdded} pollution risks in high pollution scenario)`);
  } else {
    console.log(`❌ Novel entities system NOT adding mortality risks`);
    console.log(`   (No pollution risks added despite severe contamination)`);
  }
  console.log(``);

  const mortalityDelta = (highPollution.mortalityRate - baseline.mortalityRate) * 100;
  if (Math.abs(mortalityDelta) < 0.5) {
    console.log(`🚨 BUG CONFIRMED: Minimal mortality difference despite severe pollution`);
    console.log(`   Expected: 5-15pp increase in mortality (reproductive crisis + disease epidemic)`);
    console.log(`   Observed: ${mortalityDelta.toFixed(2)}pp increase`);
    console.log(``);
    console.log(`🔍 HYPOTHESIS: Risks added but not propagating through Bayesian network`);
    console.log(`   - Check if risks have correct 'type' field for demographic vulnerabilities`);
    console.log(`   - Check if risks are being cleared before resolveMortality()`);
    console.log(`   - Check if demographic vulnerabilities include 'pollution' type`);
  } else {
    console.log(`✅ System appears to be working: ${mortalityDelta.toFixed(2)}pp mortality increase`);
  }

  console.log(`\n${'#'.repeat(80)}\n`);
}

// RUN DIAGNOSTICS
const SEED = 12345;
const MONTHS = 120; // 10 years

const baseline = runDiagnostic('baseline', SEED, MONTHS);
const highPollution = runDiagnostic('high_pollution', SEED + 1, MONTHS); // Different seed to avoid identical RNG

compareScenarios(baseline, highPollution);
