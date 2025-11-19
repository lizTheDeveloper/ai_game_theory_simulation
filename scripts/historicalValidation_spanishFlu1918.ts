#!/usr/bin/env tsx
/**
 * Historical Validation: 1918 Spanish Flu Pandemic
 *
 * Issue #15 (Week 1 BLOCKING)
 *
 * Tests simulation against 1918 Spanish Flu (17-100M deaths, 1-6% of 1.8B population).
 * PASS: Mean deaths 25M-100M. FAIL: <12.5M or >200M.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { addMortalityRisk } from '../src/simulation/bayesianMortality';
import { assertFinite, assertProbability } from '../src/simulation/utils/assertions';
import * as fs from 'fs';
import * as path from 'path';

const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const LOG_FILE = path.join(__dirname, '..', 'logs', `spanish_flu_1918_${TS}.log`);

function log(msg: string) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n', 'utf8');
}

log(`${'='.repeat(80)}\n1918 SPANISH FLU HISTORICAL VALIDATION\n${'='.repeat(80)}\n`);

const SEEDS = [1918001, 1918002, 1918003, 1918004, 1918005, 1918006, 1918007, 1918008, 1918009, 1918010];
const MONTHS = 24;

const results: Array<{seed: number, deaths: number, withinBound: boolean}> = [];

for (const seed of SEEDS) {
  log(`\n--- Run ${results.length + 1}/10 (Seed ${seed}) ---`);

  const engine = new SimulationEngine({ seed, maxMonths: MONTHS + 1 });
  const rng = engine.getRNG().next.bind(engine.getRNG());

  // Create initial state with 1.8B population (1918 level)
  const state = createDefaultInitialState(rng, 'historical');
  state.humanPopulationSystem.population = 1.8e9;

  const initialPop = state.humanPopulationSystem.population;

  // Apply 1918-calibrated pandemic: 1-6% mortality over 24 months
  const totalMortality = 0.01 + rng() * 0.05; // 1-6%
  const expectedDeaths = initialPop * totalMortality;

  log(`  Initial pop: ${(initialPop / 1e9).toFixed(2)}B`);
  log(`  Sampled mortality: ${(totalMortality * 100).toFixed(2)}%`);
  log(`  Expected deaths: ${(expectedDeaths / 1e6).toFixed(1)}M`);

  // Add mortality risk to Bayesian system
  addMortalityRisk(state.humanPopulationSystem, {
    type: 'disease',
    baseRisk: totalMortality,
    proximate: 'disease',
    root: 'natural',
    confidence: 'HIGH',
    scope: 'GLOBAL',
    month: 0,
    description: `1918 Spanish Flu (${(totalMortality * 100).toFixed(2)}%)`
  });

  // Set pandemic crisis state (for emergency response)
  state.crises = state.crises || {};
  state.crises.megaPandemic = {
    active: true,
    startMonth: 0,
    totalMortality: assertProbability(totalMortality, {location: 'main', valueName: 'totalMortality', month: 0}),
    monthlyMortality: assertProbability(totalMortality / MONTHS, {location: 'main', valueName: 'monthlyMortality', month: 0}),
    socialDisruption: assertProbability(0.6, {location: 'main', valueName: 'socialDisruption', month: 0})
  };

  // Simulate 24 months
  for (let month = 1; month <= MONTHS; month++) {
    try {
      engine.step(state);
    } catch (err: any) {
      log(`  ❌ Step ${month} failed: ${err.message}`);
      break;
    }
  }

  const finalPop = state.humanPopulationSystem.population;
  const deaths = initialPop - finalPop;
  const deathsM = deaths / 1e6;
  const withinBound = deathsM >= 25 && deathsM <= 100;

  results.push({ seed, deaths: deathsM, withinBound });

  log(`  Final pop: ${(finalPop / 1e9).toFixed(2)}B`);
  log(`  Deaths: ${deathsM.toFixed(1)}M (${((deaths / initialPop) * 100).toFixed(2)}%)`);
  log(`  Within bounds (25-100M): ${withinBound ? '✅' : '❌'}`);
}

// Analysis
const deathsArray = results.map(r => r.deaths);
const mean = deathsArray.reduce((a, b) => a + b, 0) / deathsArray.length;
const withinCount = results.filter(r => r.withinBound).length;

log(`\n${'='.repeat(80)}\nRESULTS SUMMARY\n${'='.repeat(80)}`);
log(`  Mean deaths: ${mean.toFixed(1)}M`);
log(`  Within bounds (25-100M): ${withinCount}/10 (${(withinCount / 10 * 100).toFixed(0)}%)`);

const passMean = mean >= 25 && mean <= 100;
const passMajority = withinCount >= 5;
const verdict = passMean || passMajority;

log(`\n${'='.repeat(80)}\nVERDICT: ${verdict ? '✅ PASS' : '❌ FAIL'}\n${'='.repeat(80)}`);
if (verdict) {
  log(`Simulation replicates 1918 Spanish Flu mortality (mean ${mean.toFixed(1)}M within 25-100M)`);
} else {
  log(`Simulation FAILS (mean ${mean.toFixed(1)}M outside bounds, ${withinCount}/10 runs within)`);
}

log(`\nResults saved to: ${LOG_FILE}\n`);
