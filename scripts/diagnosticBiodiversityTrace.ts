#!/usr/bin/env npx tsx
/**
 * Diagnostic: Biodiversity Trace (HIGH-8 Regression Investigation)
 *
 * Traces biodiversity value changes across ALL phases during hindcast.
 * Goal: Identify which phases are modifying biodiversity during historical mode.
 *
 * Usage: npx tsx scripts/diagnosticBiodiversityTrace.ts
 */

import { createInitialGameState } from '../src/simulation/initialization';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import type { GameState } from '../src/types/game';

async function traceBiodiversity() {
  console.log('=== BIODIVERSITY TRACE (HIGH-8 REGRESSION INVESTIGATION) ===\n');

  // Run 3 different seeds to check variance
  const seeds = [19900102, 19900103, 19900104];
  const results: Array<{ seed: number; bio1990: number; bio2024: number; error: number }> = [];

  for (const seed of seeds) {
    console.log(`\n--- SEED: ${seed} ---`);

    // Create simulation engine
    const engine = new SimulationEngine({ seed });
    const rng = engine.getRNG().next.bind(engine.getRNG());

    // Initialize historical state (1990)
    const state = await createHistoricalInitialState({
      year: 1990,
      rng,
      includeAIAgents: false,
      scenarioMode: 'historical'
    });

    // Verify config
    console.log(`Config: scenarioMode=${state.config.scenarioMode}, historicalModeEndYear=${state.config.historicalModeEndYear}`);
    console.log(`Year: ${state.currentYear}, Month: ${state.currentMonth}`);

    const bio1990 = state.environmentalAccumulation.biodiversityIndex;
    console.log(`Biodiversity 1990: ${(bio1990 * 100).toFixed(2)}%`);

    // Run simulation to 2024
    const TARGET_MONTH = (2024 - 1990) * 12; // 408 months

    let lastBio = bio1990;
    let changesDetected = 0;

    for (let month = 1; month <= TARGET_MONTH; month++) {
      // Execute phases
      engine.step(state);

      const currentBio = state.environmentalAccumulation.biodiversityIndex;

      // Log every 12 months for first year
      if (month <= 12) {
        const year = Math.floor(state.currentMonth / 12) + 1990;
        console.log(`  Month ${month} (Year ${year}, scenarioMode=${state.config.scenarioMode}, currentYear=${state.currentYear}): Bio ${(currentBio * 100).toFixed(2)}%`);
      }

      // Detect changes >0.1%
      if (Math.abs(currentBio - lastBio) > 0.001 && changesDetected < 20) {
        const year = Math.floor(state.currentMonth / 12) + 1990;
        const delta = ((currentBio - lastBio) * 100).toFixed(3);
        console.log(`  Month ${month} (Year ${year}): ${(lastBio * 100).toFixed(2)}% → ${(currentBio * 100).toFixed(2)}% (Δ ${delta}%)`);
        changesDetected++;

        // If too many changes, stop detailed logging (but continue simulation)
        if (changesDetected === 20) {
          console.log(`  ... (stopping detailed change logging, continuing simulation)`);
        }
      }

      lastBio = currentBio;
    }

    const bio2024 = state.environmentalAccumulation.biodiversityIndex;
    const target = 0.49; // 49% (WWF LPI 2024)
    const error = Math.abs(bio2024 - target) / target * 100;

    console.log(`\nBiodiversity 2024: ${(bio2024 * 100).toFixed(2)}% (target: 49.00%)`);
    console.log(`Error: ${error.toFixed(2)}%`);

    results.push({ seed, bio1990, bio2024, error });
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log('\nSeed | Bio1990 | Bio2024 | Target | Error');
  console.log('-----|---------|---------|--------|-------');
  for (const r of results) {
    console.log(
      `${r.seed} | ${(r.bio1990 * 100).toFixed(2)}% | ${(r.bio2024 * 100).toFixed(2)}% | 49.00% | ${r.error.toFixed(2)}%`
    );
  }

  const avgError = results.reduce((sum, r) => sum + r.error, 0) / results.length;
  console.log(`\nAverage Error: ${avgError.toFixed(2)}%`);

  if (avgError > 10) {
    console.log(`\n❌ FAIL: Average error ${avgError.toFixed(2)}% exceeds 10% threshold`);
    process.exit(1);
  } else {
    console.log(`\n✅ PASS: Average error ${avgError.toFixed(2)}% within 10% threshold`);
  }
}

traceBiodiversity().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
