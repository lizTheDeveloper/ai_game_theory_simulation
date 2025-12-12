/**
 * Validate Information Ecology determinism
 *
 * Runs multiple simulations with same seed and verifies:
 * 1. Identical epistemic health trajectories
 * 2. Identical coordination capacity trajectories
 * 3. CV < 0.01% for all metrics
 */

import { createTestState } from '../src/simulation/initialization';
import { updateInformationEcology, calculateCoordinationModifier } from '../src/simulation/informationEcology';
import seedrandom from 'seedrandom';

interface MetricSnapshot {
  month: number;
  epistemicHealth: number;
  coordinationModifier: number;
  misinformationLoad: number;
  socialTrust: number;
  polarization: number;
  sharedReality: number;
}

function runSimulation(seed: string, months: number): MetricSnapshot[] {
  const state = createTestState();
  const rng = seedrandom(seed);
  const snapshots: MetricSnapshot[] = [];

  for (let month = 0; month < months; month++) {
    // Update information ecology
    updateInformationEcology(state.informationEcology, state, rng, 30);

    // Calculate coordination modifier
    const coordMod = calculateCoordinationModifier(state.informationEcology, rng);

    // Snapshot
    snapshots.push({
      month,
      epistemicHealth: state.informationEcology.epistemicHealth,
      coordinationModifier: coordMod,
      misinformationLoad: state.informationEcology.misinformationLoad,
      socialTrust: state.informationEcology.socialTrust,
      polarization: state.informationEcology.polarization,
      sharedReality: state.informationEcology.sharedReality,
    });

    state.currentMonth++;
  }

  return snapshots;
}

function calculateCV(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return mean === 0 ? 0 : (stdDev / Math.abs(mean)) * 100;
}

async function main() {
  const SEED = 'info-ecology-determinism-test';
  const RUNS = 10;
  const MONTHS = 60;

  console.log(`\n=== Information Ecology Determinism Validation ===`);
  console.log(`Seed: ${SEED}`);
  console.log(`Runs: ${RUNS}`);
  console.log(`Months: ${MONTHS}\n`);

  // Run simulations
  const allRuns: MetricSnapshot[][] = [];
  for (let run = 0; run < RUNS; run++) {
    const snapshots = runSimulation(SEED, MONTHS);
    allRuns.push(snapshots);
    console.log(`✅ Run ${run + 1}/${RUNS} complete`);
  }

  // Validate determinism
  console.log(`\n=== Determinism Check ===`);
  let allDeterministic = true;

  for (let month = 0; month < MONTHS; month++) {
    const epistemicHealthValues = allRuns.map((run) => run[month].epistemicHealth);
    const coordinationValues = allRuns.map((run) => run[month].coordinationModifier);
    const misinfoValues = allRuns.map((run) => run[month].misinformationLoad);
    const trustValues = allRuns.map((run) => run[month].socialTrust);
    const polarizationValues = allRuns.map((run) => run[month].polarization);
    const realityValues = allRuns.map((run) => run[month].sharedReality);

    const cvEpistemic = calculateCV(epistemicHealthValues);
    const cvCoordination = calculateCV(coordinationValues);
    const cvMisinfo = calculateCV(misinfoValues);
    const cvTrust = calculateCV(trustValues);
    const cvPolarization = calculateCV(polarizationValues);
    const cvReality = calculateCV(realityValues);

    const maxCV = Math.max(cvEpistemic, cvCoordination, cvMisinfo, cvTrust, cvPolarization, cvReality);

    if (maxCV > 0.01) {
      console.log(`❌ Month ${month}: CV = ${maxCV.toFixed(4)}% (FAIL - exceeds 0.01%)`);
      console.log(`   Epistemic health CV: ${cvEpistemic.toFixed(6)}%`);
      console.log(`   Coordination CV: ${cvCoordination.toFixed(6)}%`);
      console.log(`   Misinformation CV: ${cvMisinfo.toFixed(6)}%`);
      console.log(`   Trust CV: ${cvTrust.toFixed(6)}%`);
      console.log(`   Polarization CV: ${cvPolarization.toFixed(6)}%`);
      console.log(`   Shared reality CV: ${cvReality.toFixed(6)}%`);
      allDeterministic = false;
    }
  }

  if (allDeterministic) {
    console.log(`✅ ALL MONTHS DETERMINISTIC (CV < 0.01% for all metrics)`);
  }

  // Sample trajectory
  console.log(`\n=== Sample Trajectory (Run 1) ===`);
  console.log(`Month | Epistemic | Coordination | Trust  | Reality | Misinfo | Polariz`);
  console.log(`------|-----------|--------------|--------|---------|---------|--------`);

  for (let month = 0; month < Math.min(12, MONTHS); month++) {
    const snap = allRuns[0][month];
    console.log(
      `${month.toString().padStart(5)} | ` +
        `${(snap.epistemicHealth * 100).toFixed(1).padStart(9)}% | ` +
        `${(snap.coordinationModifier * 100).toFixed(1).padStart(12)}% | ` +
        `${(snap.socialTrust * 100).toFixed(1).padStart(6)}% | ` +
        `${(snap.sharedReality * 100).toFixed(1).padStart(7)}% | ` +
        `${(snap.misinformationLoad * 100).toFixed(1).padStart(7)}% | ` +
        `${(snap.polarization * 100).toFixed(1).padStart(7)}%`
    );
  }

  // Final state comparison
  console.log(`\n=== Final State (Month ${MONTHS - 1}) ===`);
  console.log(`Run | Epistemic Health | Coordination Modifier`);
  console.log(`----|------------------|----------------------`);

  for (let run = 0; run < RUNS; run++) {
    const final = allRuns[run][MONTHS - 1];
    console.log(
      `${(run + 1).toString().padStart(3)} | ` +
        `${(final.epistemicHealth * 100).toFixed(4)}%        | ` +
        `${(final.coordinationModifier * 100).toFixed(4)}%`
    );
  }

  // Summary
  const finalEpistemicValues = allRuns.map((run) => run[MONTHS - 1].epistemicHealth);
  const finalCoordinationValues = allRuns.map((run) => run[MONTHS - 1].coordinationModifier);
  const cvFinalEpistemic = calculateCV(finalEpistemicValues);
  const cvFinalCoordination = calculateCV(finalCoordinationValues);

  console.log(`\n=== Summary ===`);
  console.log(`Final epistemic health CV: ${cvFinalEpistemic.toFixed(6)}%`);
  console.log(`Final coordination modifier CV: ${cvFinalCoordination.toFixed(6)}%`);

  if (allDeterministic) {
    console.log(`\n✅ VALIDATION PASSED: Information Ecology is deterministic`);
    process.exit(0);
  } else {
    console.log(`\n❌ VALIDATION FAILED: Non-deterministic behavior detected`);
    process.exit(1);
  }
}

main();
