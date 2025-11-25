/**
 * Spiral Threshold Diagnostic Script
 *
 * PURPOSE: Validate if spiral thresholds are achievable under current model dynamics
 *
 * CONTEXT (from roadmap):
 * - 0/160 Monte Carlo runs showed ANY spiral activations
 * - Claim: "need mortality < 50% to reach spiral windows (years 15-30)"
 * - Need to validate if this claim is correct and if thresholds are realistic
 *
 * QUESTIONS TO ANSWER:
 * 1. What are the EXACT thresholds for each spiral?
 * 2. When do spiral windows open (year 15-30)?
 * 3. What mortality levels occur at years 15-30 in typical runs?
 * 4. What are the blockers for each spiral (which conditions fail)?
 * 5. Are spiral thresholds testable under current model dynamics?
 *
 * APPROACH:
 * - Run single simulation to year 30 (360 months)
 * - Track spiral conditions every 12 months
 * - Show EXACTLY which thresholds are met/unmet
 * - Compare mortality trajectory vs. spiral requirements
 * - Provide clear recommendation: Are thresholds realistic?
 */

import { createDefaultInitialState } from '@/simulation/initialization';
import { simulateMonth } from '@/simulation/engine';
import { updateUpwardSpirals, canDeclareUtopia, logSpiralActivationDiagnostics } from '@/simulation/upwardSpirals';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

interface SpiralSnapshot {
  month: number;
  year: number;

  // Population/mortality tracking
  population: number;
  mortalityRate: number;
  cumulativeMortality: number;

  // Spiral activation status (6 spirals)
  abundance: boolean;
  cognitive: boolean;
  democratic: boolean;
  scientific: boolean;
  meaning: boolean;
  ecological: boolean;

  // Cascade status
  cascadeActive: boolean;
  activeCount: number;

  // Utopia eligibility
  utopiaEligible: boolean;
  utopiaReason: string;
}

// Helper to hash string to number for seeding
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Create seeded RNG function
function createSeededRng(seed: string): () => number {
  let state = hashString(seed);
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function runSpiralThresholdDiagnostic() {
  console.log('='.repeat(80));
  console.log('SPIRAL THRESHOLD DIAGNOSTIC');
  console.log('='.repeat(80));
  console.log('');
  console.log('PURPOSE: Validate spiral activation thresholds vs. model mortality dynamics');
  console.log('CONTEXT: 0/160 runs showed spiral activations - investigating why');
  console.log('');

  // Initialize simulation
  const seed = 'spiral-threshold-diagnostic-2025-11-25';

  // Set seed for deterministic RNG
  const rng = createSeededRng(seed);
  setDeterministicRng(rng);

  console.log(`Configuration:`);
  console.log(`  Seed: ${seed}`);
  console.log(`  Start year: 2025 (default)`);
  console.log(`  Target: Year 30 (360 months)`);
  console.log('');

  const state = createDefaultInitialState(rng);
  const snapshots: SpiralSnapshot[] = [];

  const initialPopulation = state.humanPopulationSystem.population;

  // Run simulation for 30 years
  const targetMonths = 360; // 30 years

  console.log('='.repeat(80));
  console.log('SIMULATION PROGRESS');
  console.log('='.repeat(80));
  console.log('');

  for (let month = 0; month <= targetMonths; month++) {
    // Take snapshot every 12 months
    if (month % 12 === 0) {
      const year = Math.floor(month / 12);
      const currentPop = state.humanPopulationSystem.population;
      const cumulativeMortality = (initialPopulation - currentPop) / initialPopulation;

      // Calculate monthly mortality rate (from baseline mortality phase)
      const annualDeathRate = state.humanPopulationSystem.baselineDeathRate;
      const monthlyMortalityRate = annualDeathRate / 12;

      const spirals = state.upwardSpirals;
      const activeCount = [
        spirals.abundance.active,
        spirals.cognitive.active,
        spirals.democratic.active,
        spirals.scientific.active,
        spirals.meaning.active,
        spirals.ecological.active
      ].filter(Boolean).length;

      const utopiaCheck = canDeclareUtopia(state);

      const snapshot: SpiralSnapshot = {
        month,
        year,
        population: currentPop,
        mortalityRate: monthlyMortalityRate,
        cumulativeMortality,
        abundance: spirals.abundance.active,
        cognitive: spirals.cognitive.active,
        democratic: spirals.democratic.active,
        scientific: spirals.scientific.active,
        meaning: spirals.meaning.active,
        ecological: spirals.ecological.active,
        cascadeActive: spirals.cascadeActive,
        activeCount,
        utopiaEligible: utopiaCheck.can,
        utopiaReason: utopiaCheck.reason
      };

      snapshots.push(snapshot);

      console.log(`Year ${year} (Month ${month}):`);
      console.log(`  Population: ${(currentPop / 1e9).toFixed(2)}B (${(cumulativeMortality * 100).toFixed(1)}% cumulative mortality)`);
      console.log(`  Active spirals: ${activeCount}/6`);
      if (activeCount > 0) {
        const activeNames = [];
        if (spirals.abundance.active) activeNames.push('Abundance');
        if (spirals.cognitive.active) activeNames.push('Cognitive');
        if (spirals.democratic.active) activeNames.push('Democratic');
        if (spirals.scientific.active) activeNames.push('Scientific');
        if (spirals.meaning.active) activeNames.push('Meaning');
        if (spirals.ecological.active) activeNames.push('Ecological');
        console.log(`    ✅ ${activeNames.join(', ')}`);
      }
      console.log('');
    }

    // Simulate month
    try {
      simulateMonth(state, rng);
    } catch (error) {
      console.error(`\n❌ Simulation crashed at month ${month}:`);
      console.error(error);
      break;
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('DETAILED SPIRAL DIAGNOSTICS (Years 15-30)');
  console.log('='.repeat(80));
  console.log('');

  // Focus on years 15-30 (the claimed "spiral window")
  const spiralWindowSnapshots = snapshots.filter(s => s.year >= 15 && s.year <= 30);

  if (spiralWindowSnapshots.length === 0) {
    console.error('⚠️  WARNING: No snapshots in spiral window (years 15-30)');
    console.error('   Simulation may have crashed before reaching spiral window');
  } else {
    console.log('Spiral Window Analysis (Years 15-30):');
    console.log('');

    for (const snapshot of spiralWindowSnapshots) {
      console.log(`Year ${snapshot.year}:`);
      console.log(`  Population: ${(snapshot.population / 1e9).toFixed(2)}B`);
      console.log(`  Cumulative mortality: ${(snapshot.cumulativeMortality * 100).toFixed(1)}%`);
      console.log(`  Active spirals: ${snapshot.activeCount}/6`);

      if (snapshot.activeCount > 0) {
        const activeNames = [];
        if (snapshot.abundance) activeNames.push('Abundance');
        if (snapshot.cognitive) activeNames.push('Cognitive');
        if (snapshot.democratic) activeNames.push('Democratic');
        if (snapshot.scientific) activeNames.push('Scientific');
        if (snapshot.meaning) activeNames.push('Meaning');
        if (snapshot.ecological) activeNames.push('Ecological');
        console.log(`    ✅ ACTIVE: ${activeNames.join(', ')}`);
      } else {
        console.log(`    ❌ NO SPIRALS ACTIVE`);
      }

      console.log('');
    }
  }

  // Now run detailed diagnostics at Year 15 to show EXACTLY what's blocking spirals
  console.log('='.repeat(80));
  console.log('DETAILED THRESHOLD ANALYSIS (Year 15)');
  console.log('='.repeat(80));
  console.log('');

  // Find Year 15 snapshot
  const year15Snapshot = snapshots.find(s => s.year === 15);
  if (!year15Snapshot) {
    console.error('⚠️  WARNING: No Year 15 snapshot available');
  } else {
    console.log('Re-running spiral activation diagnostics for Year 15:');
    console.log('');

    // Re-initialize to Year 15 and run detailed diagnostics
    // Reset RNG for fresh run
    const year15Rng = createSeededRng(seed + '-year15');
    setDeterministicRng(year15Rng);

    const year15State = createDefaultInitialState(year15Rng);

    // Fast-forward to Year 15
    for (let month = 0; month < 180; month++) {
      try {
        simulateMonth(year15State, year15Rng);
      } catch (error) {
        console.error(`❌ Fast-forward failed at month ${month}:`, error);
        break;
      }
    }

    // Run detailed diagnostics
    logSpiralActivationDiagnostics(year15State, 180);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('MORTALITY vs. SPIRAL THRESHOLD ANALYSIS');
  console.log('='.repeat(80));
  console.log('');

  // Analyze mortality trajectory vs. spiral activation
  console.log('Mortality Trajectory:');
  console.log('');
  console.log('Year | Population (B) | Cumulative Mortality | Active Spirals | Cascade');
  console.log('-----|----------------|---------------------|----------------|--------');

  for (const snapshot of snapshots) {
    if (snapshot.year % 5 === 0) { // Every 5 years
      const pop = (snapshot.population / 1e9).toFixed(2);
      const mortality = (snapshot.cumulativeMortality * 100).toFixed(1) + '%';
      const spirals = `${snapshot.activeCount}/6`;
      const cascade = snapshot.cascadeActive ? 'YES' : 'NO';

      console.log(`${snapshot.year.toString().padStart(4)} | ${pop.padStart(14)} | ${mortality.padStart(19)} | ${spirals.padStart(14)} | ${cascade}`);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('KEY FINDINGS');
  console.log('='.repeat(80));
  console.log('');

  // Find first spiral activation (if any)
  const firstActivation = snapshots.find(s => s.activeCount > 0);

  if (firstActivation) {
    console.log(`✅ SPIRAL ACTIVATION DETECTED`);
    console.log(`   First activation: Year ${firstActivation.year} (Month ${firstActivation.month})`);
    console.log(`   Spirals active: ${firstActivation.activeCount}/6`);
    console.log(`   Cumulative mortality at activation: ${(firstActivation.cumulativeMortality * 100).toFixed(1)}%`);
  } else {
    console.log(`❌ NO SPIRAL ACTIVATIONS IN 30-YEAR RUN`);
    console.log(`   This confirms the roadmap observation: 0/160 runs showed activations`);
  }

  console.log('');

  // Analyze Year 15-30 window
  const spiralWindowMortality = spiralWindowSnapshots.map(s => s.cumulativeMortality);
  if (spiralWindowMortality.length > 0) {
    const avgMortality = spiralWindowMortality.reduce((sum, m) => sum + m, 0) / spiralWindowMortality.length;
    const maxMortality = Math.max(...spiralWindowMortality);
    const minMortality = Math.min(...spiralWindowMortality);

    console.log(`Spiral Window Mortality (Years 15-30):`);
    console.log(`   Average: ${(avgMortality * 100).toFixed(1)}%`);
    console.log(`   Min: ${(minMortality * 100).toFixed(1)}%`);
    console.log(`   Max: ${(maxMortality * 100).toFixed(1)}%`);
    console.log('');

    if (minMortality > 0.50) {
      console.log(`⚠️  CRITICAL FINDING: Minimum mortality (${(minMortality * 100).toFixed(1)}%) > 50% threshold`);
      console.log(`   Spiral window is UNREACHABLE under current model dynamics`);
    } else {
      console.log(`✅ Mortality < 50% in spiral window - threshold is theoretically reachable`);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(80));
  console.log('');

  if (!firstActivation && spiralWindowMortality.length > 0) {
    const avgMortality = spiralWindowMortality.reduce((sum, m) => sum + m, 0) / spiralWindowMortality.length;

    if (avgMortality > 0.50) {
      console.log('1. SPIRAL THRESHOLDS ARE UNTESTABLE');
      console.log('   - Mortality consistently > 50% in spiral window');
      console.log('   - Need to either:');
      console.log('     a) Reduce baseline mortality dynamics');
      console.log('     b) Lower spiral thresholds');
      console.log('     c) Enable aggressive tech deployment to reduce mortality');
      console.log('');
      console.log('2. IMMEDIATE ACTION REQUIRED');
      console.log('   - Cannot test spiral mechanics until thresholds are reachable');
      console.log('   - This blocks all spiral validation work');
      console.log('');
    } else {
      console.log('1. MORTALITY IS LOW ENOUGH - INVESTIGATE OTHER BLOCKERS');
      console.log('   - Mortality < 50% in spiral window');
      console.log('   - Spiral thresholds should be reachable');
      console.log('   - Check detailed diagnostics above for specific blockers');
      console.log('   - Likely issues:');
      console.log('     a) QoL metrics not reaching thresholds');
      console.log('     b) Environmental/social conditions failing');
      console.log('     c) Tech deployment/adoption too slow');
      console.log('');
    }
  }

  console.log('='.repeat(80));
  console.log('END OF DIAGNOSTIC');
  console.log('='.repeat(80));
}

// Run the diagnostic
runSpiralThresholdDiagnostic();
