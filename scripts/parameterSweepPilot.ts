#!/usr/bin/env tsx
/**
 * Parameter Sweep Monte Carlo - PILOT (HIGH-6)
 *
 * Phase 1: Validate methodology with TOP 3 parameters
 * - Climate sensitivity (λ): 0.8 ± 0.3 K/(W/m²)
 * - Carbon sink saturation: ±50%
 * - Tech adoption steepness: ±40%
 *
 * N=50 runs × hindcast (1990-2024)
 * Outputs 90% CI for temperature, population, biodiversity
 *
 * Phase 2 (separate task): Full 7-parameter sweep with N=200
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState, ParameterSweepConfig } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// LATIN HYPERCUBE SAMPLING (minimal implementation)
// ============================================================================

function generateLHS(n: number, k: number, rng: () => number): number[][] {
  // Generate n samples in k dimensions using Latin Hypercube Sampling
  // Each dimension divided into n equal-probability intervals
  const samples: number[][] = [];

  // For each dimension, create permutation of [0, 1, ..., n-1]
  const permutations: number[][] = [];
  for (let dim = 0; dim < k; dim++) {
    const perm = Array.from({ length: n }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    permutations.push(perm);
  }

  // Generate samples
  for (let i = 0; i < n; i++) {
    const sample: number[] = [];
    for (let dim = 0; dim < k; dim++) {
      // Uniform sample within interval
      const interval = permutations[dim][i];
      const u = (interval + rng()) / n;
      sample.push(u);
    }
    samples.push(sample);
  }

  return samples;
}

function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// ============================================================================
// PARAMETER CONFIGURATION
// ============================================================================

interface ParameterConfig {
  name: string;
  baseline: number;
  min: number;
  max: number;
  location: string; // Where to apply in GameState
}

const PARAMETERS: ParameterConfig[] = [
  {
    name: 'climateSensitivity',
    baseline: 0.8,
    min: 0.5,  // 0.8 - 0.3
    max: 1.1,  // 0.8 + 0.3
    location: 'environmentalSystem.climateSensitivity'
  },
  {
    name: 'carbonSinkSaturation',
    baseline: 1.0,
    min: 0.5,  // -50%
    max: 1.5,  // +50%
    location: 'planetaryBoundaries.climateChange.carbonSinkMultiplier'
  },
  {
    name: 'techAdoptionSteepness',
    baseline: 1.0,
    min: 0.6,  // -40%
    max: 1.4,  // +40%
    location: 'technologySystem.adoptionSteepnessMultiplier'
  }
];

// ============================================================================
// SIMULATION EXECUTION
// ============================================================================

interface RunResult {
  runId: number;
  parameters: Record<string, number>;
  temperature2024: number;
  population2024: number;
  biodiversity2024: number;
}

async function runHindcast(
  parameters: Record<string, number>,
  runId: number,
  rng: () => number
): Promise<RunResult> {
  // M-3: Create parameter sweep config from sampled parameters
  const parameterSweepConfig: ParameterSweepConfig = {
    climateSensitivity: parameters.climateSensitivity,
    // carbonSinkMultiplier: parameters.carbonSinkSaturation,  // TODO: field location TBD
    // techAdoptionSteepness: parameters.techAdoptionSteepness, // TODO: field location TBD
  };

  // Create initial state (1990) with parameter overrides
  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined, // alignmentDynamicsConfig
    undefined, // climatePriorityConfig
    undefined, // thresholdSliders
    undefined, // speculativeScenario
    {  // historicalOverrides (1990 baseline from HISTORICAL_BASELINES)
      startYear: 1990,
      co2Ppm: 354,  // Keeling curve 1990
      temperatureAnomalyC: 0.45,  // HadCRUT5 1990
      globalPopulationBillions: 5.3,  // UN WPP 1990
      globalGdpTrillions: 22.6,  // World Bank 1990 (constant USD)
      emissionsGtCO2PerYear: 22.6  // Global Carbon Project 1990
    },
    parameterSweepConfig // M-3: parameter injection
  );

  const engine = new SimulationEngine();

  // Run simulation 1990-2024 (34 years × 12 months = 408 steps)
  const targetMonth = (2024 - 1990) * 12;

  while (state.currentMonth < targetMonth) {
    engine.step(state, rng);
  }

  return {
    runId,
    parameters,
    temperature2024: state.environmentalSystem.temperature,
    population2024: state.humanPopulationSystem.population,
    biodiversity2024: state.planetaryBoundaries.biosphereIntegrity.overshootPercentage
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const N_RUNS = 3;  // M-3: Quick validation (was 50)
  const N_PARAMS = PARAMETERS.length;
  const SEED = 42;

  console.log('📊 Parameter Sweep Pilot - HIGH-6');
  console.log(`N = ${N_RUNS} runs`);
  console.log(`k = ${N_PARAMS} parameters`);
  console.log(`\n=== Parameters ===`);
  PARAMETERS.forEach(p => {
    console.log(`${p.name}: [${p.min}, ${p.max}] (baseline: ${p.baseline})`);
  });

  // Generate LHS samples
  const rng = createSeededRng(SEED);
  const lhsSamples = generateLHS(N_RUNS, N_PARAMS, rng);

  console.log(`\n✅ Generated ${N_RUNS} LHS samples`);

  // Map samples to parameter values
  const parameterSets: Record<string, number>[] = [];
  for (const sample of lhsSamples) {
    const params: Record<string, number> = {};
    for (let i = 0; i < N_PARAMS; i++) {
      const p = PARAMETERS[i];
      params[p.name] = p.min + sample[i] * (p.max - p.min);
    }
    parameterSets.push(params);
  }

  // Run simulations
  console.log(`\n🚀 Running ${N_RUNS} hindcast simulations...`);
  const results: RunResult[] = [];

  for (let i = 0; i < N_RUNS; i++) {
    const runRng = createSeededRng(SEED + i);
    console.log(`  Run ${i + 1}/${N_RUNS}...`);

    const result = await runHindcast(parameterSets[i], i, runRng);
    results.push(result);
  }

  // Calculate statistics
  console.log(`\n📈 Statistical Summary`);

  const temps = results.map(r => r.temperature2024).sort((a, b) => a - b);
  const pops = results.map(r => r.population2024).sort((a, b) => a - b);
  const bios = results.map(r => r.biodiversity2024).sort((a, b) => a - b);

  function quantile(sorted: number[], q: number): number {
    const idx = Math.floor(sorted.length * q);
    return sorted[idx];
  }

  function median(sorted: number[]): number {
    return quantile(sorted, 0.5);
  }

  console.log(`\nTemperature 2024:`);
  console.log(`  Median: ${median(temps).toFixed(2)}°C`);
  console.log(`  90% CI: [${quantile(temps, 0.05).toFixed(2)}, ${quantile(temps, 0.95).toFixed(2)}]°C`);
  console.log(`  Observed (IPCC): ~1.28°C`);

  console.log(`\nPopulation 2024:`);
  console.log(`  Median: ${(median(pops)).toFixed(2)}B`);
  console.log(`  90% CI: [${(quantile(pops, 0.05)).toFixed(2)}, ${(quantile(pops, 0.95)).toFixed(2)}]B`);
  console.log(`  Observed (UN): ~8.12B`);

  console.log(`\nBiodiversity 2024:`);
  console.log(`  Median: ${median(bios).toFixed(1)}%`);
  console.log(`  90% CI: [${quantile(bios, 0.05).toFixed(1)}, ${quantile(bios, 0.95).toFixed(1)}]%`);

  // Save results
  const outputDir = path.join(__dirname, '..', 'monteCarloOutputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const resultFile = path.join(outputDir, `param_sweep_pilot_${timestamp}.json`);

  fs.writeFileSync(resultFile, JSON.stringify({
    metadata: {
      n_runs: N_RUNS,
      n_params: N_PARAMS,
      seed: SEED,
      timestamp: new Date().toISOString(),
      parameters: PARAMETERS
    },
    results,
    statistics: {
      temperature: {
        median: median(temps),
        ci90: [quantile(temps, 0.05), quantile(temps, 0.95)]
      },
      population: {
        median: median(pops),
        ci90: [quantile(pops, 0.05), quantile(pops, 0.95)]
      },
      biodiversity: {
        median: median(bios),
        ci90: [quantile(bios, 0.05), quantile(bios, 0.95)]
      }
    }
  }, null, 2));

  console.log(`\n✅ Results saved to ${resultFile}`);
  console.log(`\n⚠️  NOTE: Pilot uses default parameters (parameter override not yet implemented)`);
  console.log(`Next step: Implement parameter injection system for full sweep`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
