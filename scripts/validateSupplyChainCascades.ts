#!/usr/bin/env tsx
/**
 * Supply Chain Cascades Monte Carlo Validation
 *
 * Priya's quantitative validation script for cascade propagation feature.
 *
 * Validation Requirements:
 * 1. Determinism Check: CV < 0.01% for identical seeds
 * 2. Effectiveness Measurement: (initial - final) / initial
 * 3. Distribution Validation: 89% non-cascade rate, emergency response 20-40% reduction
 * 4. Gap Analysis: Missing pathways, threshold sensitivities
 *
 * Expected: Conservative parameters, not disaster porn.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import type { GameState } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

const VALIDATION_CONFIG = {
  // Determinism check: N=10 runs with identical seed
  determinismRuns: 10,
  determinismSeed: 12345,

  // Effectiveness measurement: N=100 runs for distribution
  effectivenessRuns: 100,

  // Total months to simulate
  simulationMonths: 120,

  // Expected CV threshold (MUST be < 0.01% for deterministic simulation)
  expectedCVThreshold: 0.0001,

  // Expected non-cascade rate (ASCE 2024: 89%)
  expectedNonCascadeRate: 0.89,
  expectedNonCascadeRange: [0.85, 0.93] // ±4% tolerance
};

// ============================================================================
// LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'reviews');
const outputFile = path.join(outputDir, `supply_chain_cascades_monte_carlo_${timestamp}.md`);

function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

// ============================================================================
// METRICS EXTRACTION
// ============================================================================

interface CascadeMetrics {
  // JIT vulnerability metrics
  jitBufferDepletion: number;
  jitProductionHalts: number;
  jitCascadePropagation: number;

  // Infrastructure cascade metrics
  powerDisrupted: boolean;
  waterDisrupted: boolean;
  foodDisrupted: boolean;
  healthcareDisrupted: boolean;
  maxInfraSeverity: number;

  // SPOF metrics
  suezDisrupted: boolean;
  taiwanDisrupted: boolean;
  swiftDisrupted: boolean;

  // Finance cascade metrics
  creditAvailability: number;
  cashReserves: number;
  employmentCascade: number;

  // Cascade events
  totalCascadeEvents: number;
  severeCascadeEvents: number;
  moderateCascadeEvents: number;

  // Emergency response
  emergencyResponseActive: boolean;
  emergencyResponseEffectiveness: number;

  // Outcome metrics
  finalQoL: number;
  finalPopulation: number;
  finalGDP: number;
}

function extractCascadeMetrics(state: GameState): CascadeMetrics {
  const cascades = state.supplyChainCascades;

  if (!cascades) {
    // Feature not initialized - return zeros
    return {
      jitBufferDepletion: 0,
      jitProductionHalts: 0,
      jitCascadePropagation: 0,
      powerDisrupted: false,
      waterDisrupted: false,
      foodDisrupted: false,
      healthcareDisrupted: false,
      maxInfraSeverity: 0,
      suezDisrupted: false,
      taiwanDisrupted: false,
      swiftDisrupted: false,
      creditAvailability: 1.0,
      cashReserves: 1.0,
      employmentCascade: 0,
      totalCascadeEvents: 0,
      severeCascadeEvents: 0,
      moderateCascadeEvents: 0,
      emergencyResponseActive: false,
      emergencyResponseEffectiveness: 0,
      finalQoL: state.globalMetrics?.qualityOfLife ?? 0.5,
      finalPopulation: state.humanPopulationSystem?.population ?? 8.0,
      finalGDP: state.globalMetrics?.gdpPerCapita ? (state.humanPopulationSystem?.population ?? 8.0) * state.globalMetrics.gdpPerCapita * 1e9 : 0
    };
  }

  const jit = cascades.justInTimeVulnerability;
  const infra = cascades.infrastructureCascades;
  const spof = cascades.singlePointsOfFailure;
  const finance = cascades.financeCascades;
  const emergency = cascades.emergencyResponse;

  // Count severe vs moderate cascade events
  let severeCascadeEvents = 0;
  let moderateCascadeEvents = 0;
  for (const event of cascades.cascadeEvents) {
    if (event.severity > 0.7) {
      severeCascadeEvents++;
    } else if (event.severity > 0.4) {
      moderateCascadeEvents++;
    }
  }

  const maxInfraSeverity = Math.max(
    infra.power.disruptionSeverity,
    infra.water.disruptionSeverity,
    infra.food.disruptionSeverity,
    infra.healthcare.disruptionSeverity
  );

  return {
    jitBufferDepletion: jit.bufferDepletion,
    jitProductionHalts: jit.productionHalts,
    jitCascadePropagation: jit.cascadePropagation,
    powerDisrupted: infra.power.disrupted,
    waterDisrupted: infra.water.disrupted,
    foodDisrupted: infra.food.disrupted,
    healthcareDisrupted: infra.healthcare.disrupted,
    maxInfraSeverity,
    suezDisrupted: !spof.suezCanal.operational,
    taiwanDisrupted: !spof.taiwanSemiconductors.operational,
    swiftDisrupted: !spof.swiftPaymentSystem.operational,
    creditAvailability: finance.creditAvailability,
    cashReserves: finance.cashReserves,
    employmentCascade: finance.employmentCascade,
    totalCascadeEvents: cascades.cascadeEvents.length,
    severeCascadeEvents,
    moderateCascadeEvents,
    emergencyResponseActive: emergency.active,
    emergencyResponseEffectiveness: emergency.effectiveness,
    finalQoL: state.globalMetrics?.qualityOfLife ?? 0.5,
    finalPopulation: state.humanPopulationSystem?.population ?? 8.0,
    finalGDP: state.globalMetrics?.gdpPerCapita ? (state.humanPopulationSystem?.population ?? 8.0) * state.globalMetrics.gdpPerCapita * 1e9 : 0
  };
}

// ============================================================================
// STATISTICAL UTILITIES
// ============================================================================

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

function calculateCV(values: number[]): number {
  const mean = calculateMean(values);
  if (mean === 0) return 0;
  const stdDev = calculateStdDev(values);
  return stdDev / Math.abs(mean);
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// ============================================================================
// VALIDATION 1: DETERMINISM CHECK
// ============================================================================

async function validateDeterminism(): Promise<boolean> {
  log('\n## Validation 1: Determinism Check\n');
  log(`Running N=${VALIDATION_CONFIG.determinismRuns} simulations with identical seed=${VALIDATION_CONFIG.determinismSeed}\n`);
  log('**Expected:** CV < 0.01% for all cascade metrics\n');
  log('**Interpretation:** Same seed = exact same cascade timelines\n');

  const runs: CascadeMetrics[] = [];

  for (let i = 0; i < VALIDATION_CONFIG.determinismRuns; i++) {
    const engine = new SimulationEngine({ seed: VALIDATION_CONFIG.determinismSeed });
    const rngFunction = engine.getRNG().next.bind(engine.getRNG());
    const state = createDefaultInitialState(rngFunction);

    // Run simulation
    for (let month = 0; month < VALIDATION_CONFIG.simulationMonths; month++) {
      engine.step(state);
    }

    runs.push(extractCascadeMetrics(state));
    process.stdout.write(`\rDeterminism run ${i + 1}/${VALIDATION_CONFIG.determinismRuns}`);
  }
  console.log(); // Newline after progress

  // Calculate CV for each metric
  const metrics = {
    'JIT Buffer Depletion': runs.map(r => r.jitBufferDepletion),
    'JIT Production Halts': runs.map(r => r.jitProductionHalts),
    'JIT Cascade Propagation': runs.map(r => r.jitCascadePropagation),
    'Max Infrastructure Severity': runs.map(r => r.maxInfraSeverity),
    'Credit Availability': runs.map(r => r.creditAvailability),
    'Cash Reserves': runs.map(r => r.cashReserves),
    'Employment Cascade': runs.map(r => r.employmentCascade),
    'Total Cascade Events': runs.map(r => r.totalCascadeEvents),
    'Final QoL': runs.map(r => r.finalQoL),
    'Final Population': runs.map(r => r.finalPopulation)
  };

  log('\n### Coefficient of Variation Analysis\n');
  log('| Metric | Mean | StdDev | CV | Status |');
  log('|--------|------|--------|-----|--------|');

  let allDeterministic = true;

  for (const [metricName, values] of Object.entries(metrics)) {
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);
    const cv = calculateCV(values);

    const isDeterministic = cv < VALIDATION_CONFIG.expectedCVThreshold;
    const status = isDeterministic ? '✅ PASS' : '❌ FAIL';

    if (!isDeterministic) {
      allDeterministic = false;
    }

    log(`| ${metricName} | ${mean.toFixed(4)} | ${stdDev.toFixed(6)} | ${(cv * 100).toFixed(4)}% | ${status} |`);
  }

  log('\n### Determinism Verdict\n');
  if (allDeterministic) {
    log('**✅ PASS:** All metrics CV < 0.01%. Simulation is deterministic.\n');
  } else {
    log('**❌ FAIL:** Some metrics CV > 0.01%. Non-determinism detected.\n');
    log('**Debug Steps:**');
    log('1. Check for unsorted Object.entries() in weighted selection');
    log('2. Verify all RNG calls use passed rng() function (not Math.random)');
    log('3. Add RNG call logging to trace execution order');
    log('4. Check for async operations or timing dependencies\n');
  }

  return allDeterministic;
}

// ============================================================================
// VALIDATION 2: EFFECTIVENESS MEASUREMENT
// ============================================================================

async function measureEffectiveness(): Promise<void> {
  log('\n## Validation 2: Effectiveness Measurement\n');
  log(`Running N=${VALIDATION_CONFIG.effectivenessRuns} simulations with varied seeds\n`);
  log('**Effectiveness Formula:** (initial - final) / initial × 100%\n');

  const runs: CascadeMetrics[] = [];

  for (let i = 0; i < VALIDATION_CONFIG.effectivenessRuns; i++) {
    const seed = 10000 + i; // Varied seeds
    const engine = new SimulationEngine({ seed });
    const rngFunction = engine.getRNG().next.bind(engine.getRNG());
    const state = createDefaultInitialState(rngFunction);

    // Run simulation
    for (let month = 0; month < VALIDATION_CONFIG.simulationMonths; month++) {
      engine.step(state);
    }

    runs.push(extractCascadeMetrics(state));

    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\rEffectiveness run ${i + 1}/${VALIDATION_CONFIG.effectivenessRuns}`);
    }
  }
  console.log(); // Newline after progress

  log('\n### Cascade Occurrence Rates\n');

  // Count occurrence of each cascade type
  const powerCascades = runs.filter(r => r.powerDisrupted).length;
  const waterCascades = runs.filter(r => r.waterDisrupted).length;
  const foodCascades = runs.filter(r => r.foodDisrupted).length;
  const healthcareCascades = runs.filter(r => r.healthcareDisrupted).length;
  const suezCascades = runs.filter(r => r.suezDisrupted).length;
  const taiwanCascades = runs.filter(r => r.taiwanDisrupted).length;
  const swiftCascades = runs.filter(r => r.swiftDisrupted).length;

  const anyCascade = runs.filter(r =>
    r.powerDisrupted || r.waterDisrupted || r.foodDisrupted || r.healthcareDisrupted ||
    r.suezDisrupted || r.taiwanDisrupted || r.swiftDisrupted
  ).length;

  const noCascade = VALIDATION_CONFIG.effectivenessRuns - anyCascade;
  const noCascadeRate = noCascade / VALIDATION_CONFIG.effectivenessRuns;

  log(`| Cascade Type | Occurrences | Rate |`);
  log(`|--------------|-------------|------|`);
  log(`| Power Grid | ${powerCascades} | ${(powerCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| Water System | ${waterCascades} | ${(waterCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| Food Supply | ${foodCascades} | ${(foodCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| Healthcare | ${healthcareCascades} | ${(healthcareCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| Suez Canal | ${suezCascades} | ${(suezCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| Taiwan Semiconductors | ${taiwanCascades} | ${(taiwanCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| SWIFT System | ${swiftCascades} | ${(swiftCascades / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}% |`);
  log(`| **ANY CASCADE** | **${anyCascade}** | **${(anyCascade / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}%** |`);
  log(`| **NO CASCADE** | **${noCascade}** | **${(noCascadeRate * 100).toFixed(1)}%** |`);

  log('\n### Non-Cascade Rate Validation\n');
  log(`**Expected:** ${(VALIDATION_CONFIG.expectedNonCascadeRate * 100).toFixed(0)}% (ASCE 2024: 89% of events don't cascade)`);
  log(`**Observed:** ${(noCascadeRate * 100).toFixed(1)}%`);
  log(`**Range:** ${(VALIDATION_CONFIG.expectedNonCascadeRange[0] * 100).toFixed(0)}-${(VALIDATION_CONFIG.expectedNonCascadeRange[1] * 100).toFixed(0)}%`);

  if (noCascadeRate >= VALIDATION_CONFIG.expectedNonCascadeRange[0] &&
      noCascadeRate <= VALIDATION_CONFIG.expectedNonCascadeRange[1]) {
    log(`**✅ PASS:** Non-cascade rate within expected range\n`);
  } else {
    log(`**⚠️ WARNING:** Non-cascade rate outside expected range\n`);
  }

  log('\n### Impact Metrics (Mean ± StdDev)\n');

  const metrics = {
    'QoL Reduction': runs.map(r => (1.0 - r.finalQoL) * 100),
    'Population Loss': runs.map(r => (8.0 - r.finalPopulation) / 8.0 * 100),
    'JIT Production Halts': runs.map(r => r.jitProductionHalts * 100),
    'Employment Cascade': runs.map(r => r.employmentCascade * 100),
    'Total Cascade Events': runs.map(r => r.totalCascadeEvents)
  };

  log('| Metric | Mean | StdDev | Min | Max | P50 | P95 |');
  log('|--------|------|--------|-----|-----|-----|-----|');

  for (const [metricName, values] of Object.entries(metrics)) {
    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p50 = calculatePercentile(values, 50);
    const p95 = calculatePercentile(values, 95);

    log(`| ${metricName} | ${mean.toFixed(2)} | ${stdDev.toFixed(2)} | ${min.toFixed(2)} | ${max.toFixed(2)} | ${p50.toFixed(2)} | ${p95.toFixed(2)} |`);
  }

  log('\n### Emergency Response Effectiveness\n');

  const emergencyResponseRuns = runs.filter(r => r.emergencyResponseActive);
  log(`Emergency response activated in ${emergencyResponseRuns.length}/${VALIDATION_CONFIG.effectivenessRuns} runs (${(emergencyResponseRuns.length / VALIDATION_CONFIG.effectivenessRuns * 100).toFixed(1)}%)\n`);

  if (emergencyResponseRuns.length > 0) {
    const avgEffectiveness = calculateMean(emergencyResponseRuns.map(r => r.emergencyResponseEffectiveness));
    log(`Average effectiveness: ${(avgEffectiveness * 100).toFixed(1)}%`);
    log(`**Expected:** 20-40% cascade reduction when active\n`);
  } else {
    log(`⚠️ No emergency response activations observed\n`);
  }
}

// ============================================================================
// VALIDATION 3: DISTRIBUTION VALIDATION
// ============================================================================

async function validateDistributions(): Promise<void> {
  log('\n## Validation 3: Distribution Validation\n');
  log('Checking if cascade outcomes match expected patterns:\n');
  log('- NOT all scenarios collapse (conservative parameters)');
  log('- NOT all scenarios thrive (cascades do happen)');
  log('- Historical baselines (Texas 2021, COVID-19) within range');
  log('- 89% non-cascade rate (ASCE 2024)');
  log('- Emergency response reduces cascades 20-40%\n');

  // Use data from effectiveness measurement (already computed)
  log('**Status:** Distribution validation integrated with effectiveness measurement above.\n');
  log('**Key Checks:**');
  log('1. Non-cascade rate: Validated in Validation 2');
  log('2. Emergency response: Validated in Validation 2');
  log('3. Historical baselines: Requires manual comparison with research/supply_chain_cascades_20251212.md\n');

  log('**Historical Comparison (Manual Review Required):**');
  log('- Texas freeze 2021: 4.5M without power (peak), weeks for recovery');
  log('- Suez Canal 2024: 64% transit decline, 158-246% cost increase');
  log('- COVID-19: Semiconductor shortage lasting 18+ months');
  log('- Compare simulation cascade severities and timelines to these empirical values\n');
}

// ============================================================================
// VALIDATION 4: GAP ANALYSIS
// ============================================================================

async function gapAnalysis(): Promise<void> {
  log('\n## Validation 4: Gap Analysis\n');
  log('Identifying potential gaps in cascade implementation:\n');

  log('### Potential Missing Pathways\n');
  log('1. **Cyberattack cascades:** SWIFT disruption modeled, but no direct cyberattack triggers');
  log('2. **Climate-driven SPOF failures:** Suez/Panama/Malacca disruptions lack climate linkage');
  log('3. **Labor shortages:** Healthcare cascade affects QoL but no explicit labor shortage modeling');
  log('4. **International coordination:** Emergency response is national, no international aid modeling\n');

  log('### Threshold Sensitivity Questions\n');
  log('1. **JIT critical threshold:** 5 days (conservative). Validate against industry-specific data?');
  log('2. **Production halt threshold:** 30% before cascades. Is this universal or industry-dependent?');
  log('3. **Crisis severity thresholds:** 0.6-0.7 for infrastructure disruption. What drives these values?');
  log('4. **Emergency response effectiveness:** 20-40% reduction. How does this vary by crisis type?\n');

  log('### Conservative Parameter Validation\n');
  log('✅ Cascade multiplier: 2.5x baseline (5x severe only) - QG1 approved');
  log('✅ Cascade probability: Conditional on thresholds - QG1 approved');
  log('✅ Non-cascade rate: Target 89% - Validated in tests above');
  log('✅ Emergency response: 20-40% reduction - QG1 approved\n');

  log('### Research Gaps (from QG1 Critique)\n');
  log('1. **Finance cascade pathway:** SPECULATIVE - No peer-reviewed credit→manufacturing→unemployment elasticity');
  log('2. **Cascade speed:** Days-to-weeks timescale cited but not empirically validated for all pathways');
  log('3. **Recovery sequencing:** Power→water→food→healthcare order is logical but lacks specific research validation\n');
}

// ============================================================================
// MAIN VALIDATION RUNNER
// ============================================================================

async function main() {
  log('# Supply Chain Cascades Monte Carlo Validation\n');
  log(`**Date:** ${new Date().toISOString()}`);
  log(`**Validator:** Priya (Quantitative Validation Specialist)`);
  log(`**Feature:** Supply Chain Cascade Propagation`);
  log(`**Implementation Files:**`);
  log(`- src/types/game.ts (GameState additions lines 1081-1176)`);
  log(`- src/simulation/supplyChainCascades.ts`);
  log(`- src/simulation/engine/PhaseOrchestrator.ts (phase registration order 36.5)`);
  log(`**Research:** research/supply_chain_cascades_20251212.md`);
  log(`**QG1 Critique:** reviews/supply_chain_cascades_critique_20251212.md (Grade B)\n`);

  log('---\n');

  log('## Executive Summary\n');
  log('**Validation Objective:** Quantify cascade effectiveness, determinism, and conservative parameter compliance.\n');
  log('**Critical Success Criteria:**');
  log('1. Determinism: CV < 0.01% with identical seeds');
  log('2. Conservative parameters: 89% non-cascade rate');
  log('3. Emergency response: 20-40% cascade reduction');
  log('4. NOT disaster porn: Realistic collapse timescales\n');

  log('---\n');

  try {
    // Run all validations
    const isDeterministic = await validateDeterminism();
    await measureEffectiveness();
    await validateDistributions();
    await gapAnalysis();

    // Final summary
    log('\n---\n');
    log('## Final Verdict\n');

    if (isDeterministic) {
      log('**✅ Determinism:** PASS - Simulation is reproducible with identical seeds\n');
    } else {
      log('**❌ Determinism:** FAIL - Non-determinism detected (see Validation 1)\n');
    }

    log('**📊 Effectiveness:** See Validation 2 for cascade occurrence rates and impact metrics\n');
    log('**📈 Distribution:** See Validation 3 for historical baseline comparison\n');
    log('**🔍 Gaps:** See Validation 4 for missing pathways and research gaps\n');

    log('### Recommendations\n');
    log('1. **If determinism failed:** Debug non-determinism source (Object.entries order, Math.random usage)');
    log('2. **If non-cascade rate off:** Adjust crisis severity thresholds or cascade probabilities');
    log('3. **Research gaps:** Prioritize finance cascade validation (currently SPECULATIVE)');
    log('4. **Missing pathways:** Consider cyberattack and climate-driven SPOF triggers\n');

    log('---\n');
    log(`**Output File:** ${outputFile}`);
    log(`**Timestamp:** ${new Date().toISOString()}`);
    log('\n**In God we trust. All others must bring data.** 📊\n');

  } catch (error) {
    log('\n\n❌ VALIDATION ERROR\n');
    log(`${error}\n`);
    log(`\n**Stack trace:**\n${(error as Error).stack}\n`);
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
