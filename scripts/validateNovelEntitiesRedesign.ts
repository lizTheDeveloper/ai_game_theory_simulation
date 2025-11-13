/**
 * Novel Entities Model Redesign Monte Carlo Validation
 *
 * Implementation: Commit 5c9e77323
 * Research: research/novel_entities_zero_effectiveness_20251113.md (16 sources)
 * Validation: Sylvia Grade B+ (defensible with noted uncertainties)
 *
 * VALIDATION REQUIREMENTS:
 *
 * Test 1: Baseline (No Prevention Tech) - N≥10
 * - Expected: 0-2% effectiveness (matches god mode finding)
 * - Validates: Without prevention, remediation alone is ineffective
 *
 * Test 2: Regulated (All Prevention Tech) - N≥10
 * - Expected: 5-50% effectiveness over decades
 * - Validates: Prevention + remediation works better
 *
 * Test 3: Sensitivity Analysis - N≥10 (if time permits)
 * - irreversibleFraction: [0.70, 0.90, 0.95]
 * - reboundFactor: [0.5, 0.7, 0.9]
 * - Expected: Results vary but maintain ordering (prevention > remediation alone)
 *
 * SUCCESS CRITERIA:
 * 1. Baseline matches god mode (0-2% effectiveness)
 * 2. Prevention improves effectiveness significantly (5-50%)
 * 3. No NaN/Infinity errors
 * 4. Determinism validated (CV < 0.01% for same seed)
 * 5. Sensitivity tests show parameter robustness
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { createRNG } from '../src/simulation/utils/rng';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  testName: string;
  scenario: string;
  seed: number;
  duration: number; // months
  initialNovelEntities: number;
  finalNovelEntities: number;
  peakNovelEntities: number;
  reduction: number; // initial - final
  effectiveness: number; // (initial - final) / initial * 100%
  preventionTechsDeployed: string[];
  remediationTechsDeployed: string[];
  errors: string[];
}

const OUTPUT_DIR = path.join(__dirname, '..', 'logs', 'novel_entities_validation');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const logFile = path.join(OUTPUT_DIR, `validation_${timestamp}.log`);

function log(message: string) {
  const line = `${new Date().toISOString()} ${message}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

/**
 * Deploy a technology globally at a specific month
 * Simulates tech becoming available and being deployed immediately
 */
function deployTechGlobally(state: GameState, techId: string, month: number) {
  // Initialize techTreeState if not exists
  if (!state.techTreeState) {
    state.techTreeState = {
      unlockedTechs: [],
      regionalDeployment: {},
      globallyDeployedTechs: [],
      techEffectsApplied: {}
    };
  }

  // Add to unlocked techs
  if (!state.techTreeState.unlockedTechs.includes(techId)) {
    state.techTreeState.unlockedTechs.push(techId);
  }

  // Add to globally deployed techs
  if (!state.techTreeState.globallyDeployedTechs) {
    state.techTreeState.globallyDeployedTechs = [];
  }
  if (!state.techTreeState.globallyDeployedTechs.includes(techId)) {
    state.techTreeState.globallyDeployedTechs.push(techId);
  }

  // Deploy in all major regions at 100% deployment level
  const regions = ['North America', 'Europe', 'East Asia', 'South Asia', 'Africa', 'Latin America'];

  if (!state.techTreeState.regionalDeployment) {
    state.techTreeState.regionalDeployment = {};
  }

  for (const region of regions) {
    if (!state.techTreeState.regionalDeployment[region]) {
      state.techTreeState.regionalDeployment[region] = [];
    }

    // Check if already deployed in this region
    const existingIdx = state.techTreeState.regionalDeployment[region].findIndex(
      d => d.techId === techId
    );

    if (existingIdx >= 0) {
      // Update existing deployment
      state.techTreeState.regionalDeployment[region][existingIdx].deploymentLevel = 1.0;
      state.techTreeState.regionalDeployment[region][existingIdx].deployedAt = month;
    } else {
      // Add new deployment
      state.techTreeState.regionalDeployment[region].push({
        techId,
        deploymentLevel: 1.0,
        deployedAt: month
      });
    }
  }

  log(`  ✅ Deployed ${techId} globally at month ${month}`);
}

/**
 * Run a single validation scenario
 */
async function runValidationScenario(
  testName: string,
  scenario: string,
  seed: number,
  duration: number,
  deployPreventionTech: boolean
): Promise<ValidationResult> {
  log(`\n${'='.repeat(80)}`);
  log(`TEST: ${testName} | Scenario: ${scenario} | Seed: ${seed} | Duration: ${duration}mo`);
  log(`${'='.repeat(80)}`);

  const rng = createRNG(seed);
  const state = createDefaultInitialState(rng);
  const engine = new SimulationEngine(state);

  // Record initial Novel Entities value
  const initialNovelEntities = state.planetaryBoundaries.novelEntities.currentValue;
  log(`Initial Novel Entities: ${initialNovelEntities.toFixed(4)}× (1.0 = safe boundary)`);

  // Deploy prevention technologies if scenario requires
  const preventionTechsDeployed: string[] = [];
  if (deployPreventionTech) {
    const preventionTechs = [
      'global_pfas_ban',
      'plastic_production_phaseout',
      'green_chemistry_substitution'
    ];

    for (const techId of preventionTechs) {
      deployTechGlobally(state, techId, 0);
      preventionTechsDeployed.push(techId);
    }

    log(`Prevention tech deployed: ${preventionTechs.join(', ')}`);
  } else {
    log(`Prevention tech: NONE (baseline test)`);
  }

  // Track Novel Entities throughout simulation
  const errors: string[] = [];
  let peakNovelEntities = initialNovelEntities;

  try {
    log(`\nRunning simulation for ${duration} months...`);

    const startTime = Date.now();
    for (let month = 0; month < duration; month++) {
      engine.simulateMonth();

      const currentNE = state.planetaryBoundaries.novelEntities.currentValue;

      // Check for NaN/Infinity
      if (!isFinite(currentNE)) {
        const error = `❌ NaN/Infinity detected at month ${month}: ${currentNE}`;
        log(error);
        errors.push(error);
        break;
      }

      // Track peak
      if (currentNE > peakNovelEntities) {
        peakNovelEntities = currentNE;
      }

      // Log every 12 months
      if (month % 12 === 0) {
        log(`  Month ${month}: Novel Entities = ${currentNE.toFixed(4)}×`);
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    log(`\nSimulation completed in ${elapsed.toFixed(1)}s`);

  } catch (error: any) {
    const errorMsg = `❌ Simulation crashed: ${error.message}`;
    log(errorMsg);
    errors.push(errorMsg);
  }

  const finalNovelEntities = state.planetaryBoundaries.novelEntities.currentValue;
  const reduction = initialNovelEntities - finalNovelEntities;
  const effectiveness = (reduction / initialNovelEntities) * 100;

  log(`\n${'─'.repeat(80)}`);
  log(`RESULTS:`);
  log(`  Initial:       ${initialNovelEntities.toFixed(4)}×`);
  log(`  Final:         ${finalNovelEntities.toFixed(4)}×`);
  log(`  Peak:          ${peakNovelEntities.toFixed(4)}×`);
  log(`  Reduction:     ${reduction.toFixed(4)}× (${effectiveness.toFixed(2)}%)`);
  log(`  Effectiveness: ${effectiveness.toFixed(2)}%`);
  log(`${'─'.repeat(80)}`);

  // Check for remediation techs deployed (auto-deployed by god mode or tech tree)
  const remediationTechsDeployed: string[] = [];
  if (state.techTreeState?.unlockedTechs) {
    // Common remediation tech patterns
    const remediationPatterns = ['cleanup', 'remediation', 'filter', 'capture', 'treatment'];
    for (const techId of state.techTreeState.unlockedTechs) {
      if (remediationPatterns.some(pattern => techId.toLowerCase().includes(pattern))) {
        remediationTechsDeployed.push(techId);
      }
    }
  }

  return {
    testName,
    scenario,
    seed,
    duration,
    initialNovelEntities,
    finalNovelEntities,
    peakNovelEntities,
    reduction,
    effectiveness,
    preventionTechsDeployed,
    remediationTechsDeployed,
    errors
  };
}

/**
 * Calculate coefficient of variation for determinism check
 */
function calculateCV(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  if (mean === 0) return 0;

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / Math.abs(mean)) * 100; // CV as percentage
}

/**
 * Calculate statistical summary
 */
function calculateStats(values: number[]) {
  if (values.length === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, cv: 0 };

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

  return { mean, stdDev, min, max, cv };
}

/**
 * Main validation runner
 */
async function main() {
  log(`\n${'#'.repeat(80)}`);
  log(`# Novel Entities Model Redesign - Monte Carlo Validation`);
  log(`# Implementation: Commit 5c9e77323`);
  log(`# Date: ${new Date().toISOString()}`);
  log(`${'#'.repeat(80)}\n`);

  const allResults: ValidationResult[] = [];

  // ============================================================================
  // TEST 1: BASELINE (No Prevention Tech) - N=10
  // Expected: 0-2% effectiveness (matches god mode finding)
  // ============================================================================
  log(`\n${'█'.repeat(80)}`);
  log(`█ TEST 1: BASELINE (No Prevention Tech) - N=10`);
  log(`█ Expected: 0-2% effectiveness (remediation alone is ineffective)`);
  log(`${'█'.repeat(80)}\n`);

  const test1Seeds = Array.from({ length: 10 }, (_, i) => 50000 + i);
  const test1Duration = 240; // 20 years

  for (const seed of test1Seeds) {
    const result = await runValidationScenario(
      'Test 1: Baseline',
      'no_prevention',
      seed,
      test1Duration,
      false // no prevention tech
    );
    allResults.push(result);
  }

  // ============================================================================
  // TEST 2: REGULATED (All Prevention Tech) - N=10
  // Expected: 5-50% effectiveness over decades
  // ============================================================================
  log(`\n${'█'.repeat(80)}`);
  log(`█ TEST 2: REGULATED (All Prevention Tech) - N=10`);
  log(`█ Expected: 5-50% effectiveness (prevention + remediation works)`);
  log(`${'█'.repeat(80)}\n`);

  const test2Seeds = Array.from({ length: 10 }, (_, i) => 50010 + i);
  const test2Duration = 480; // 40 years (longer for time lags)

  for (const seed of test2Seeds) {
    const result = await runValidationScenario(
      'Test 2: Regulated',
      'all_prevention',
      seed,
      test2Duration,
      true // deploy all prevention tech
    );
    allResults.push(result);
  }

  // ============================================================================
  // STATISTICAL ANALYSIS
  // ============================================================================
  log(`\n${'█'.repeat(80)}`);
  log(`█ STATISTICAL ANALYSIS`);
  log(`${'█'.repeat(80)}\n`);

  // Test 1 statistics
  const test1Results = allResults.filter(r => r.testName === 'Test 1: Baseline');
  const test1Effectiveness = test1Results.map(r => r.effectiveness);
  const test1Stats = calculateStats(test1Effectiveness);

  log(`\nTEST 1: BASELINE (No Prevention Tech)`);
  log(`  N = ${test1Results.length}`);
  log(`  Effectiveness: ${test1Stats.mean.toFixed(2)}% ± ${test1Stats.stdDev.toFixed(2)}%`);
  log(`  Range: [${test1Stats.min.toFixed(2)}%, ${test1Stats.max.toFixed(2)}%]`);
  log(`  CV: ${test1Stats.cv.toFixed(3)}%`);
  log(`  Expected: 0-2% effectiveness`);
  log(`  Status: ${test1Stats.mean <= 2.0 ? '✅ PASS' : '❌ FAIL (effectiveness too high)'}`);

  // Test 2 statistics
  const test2Results = allResults.filter(r => r.testName === 'Test 2: Regulated');
  const test2Effectiveness = test2Results.map(r => r.effectiveness);
  const test2Stats = calculateStats(test2Effectiveness);

  log(`\nTEST 2: REGULATED (All Prevention Tech)`);
  log(`  N = ${test2Results.length}`);
  log(`  Effectiveness: ${test2Stats.mean.toFixed(2)}% ± ${test2Stats.stdDev.toFixed(2)}%`);
  log(`  Range: [${test2Stats.min.toFixed(2)}%, ${test2Stats.max.toFixed(2)}%]`);
  log(`  CV: ${test2Stats.cv.toFixed(3)}%`);
  log(`  Expected: 5-50% effectiveness`);
  log(`  Status: ${test2Stats.mean >= 5.0 && test2Stats.mean <= 50.0 ? '✅ PASS' : '⚠️ OUT OF RANGE'}`);

  // Determinism check (run same seed twice)
  log(`\n${'─'.repeat(80)}`);
  log(`DETERMINISM CHECK (same seed = same result)`);
  log(`${'─'.repeat(80)}`);

  const detSeed = 50000;
  const detResult1 = await runValidationScenario('Determinism Check 1', 'no_prevention', detSeed, 120, false);
  const detResult2 = await runValidationScenario('Determinism Check 2', 'no_prevention', detSeed, 120, false);

  const detDiff = Math.abs(detResult1.effectiveness - detResult2.effectiveness);
  const detCV = calculateCV([detResult1.effectiveness, detResult2.effectiveness]);

  log(`\nRun 1: ${detResult1.effectiveness.toFixed(6)}%`);
  log(`Run 2: ${detResult2.effectiveness.toFixed(6)}%`);
  log(`Difference: ${detDiff.toFixed(8)}%`);
  log(`CV: ${detCV.toFixed(4)}%`);
  log(`Expected: CV < 0.01%`);
  log(`Status: ${detCV < 0.01 ? '✅ DETERMINISTIC' : '❌ NON-DETERMINISTIC'}`);

  // Comparison: Prevention vs Baseline
  log(`\n${'─'.repeat(80)}`);
  log(`PREVENTION EFFECTIVENESS COMPARISON`);
  log(`${'─'.repeat(80)}`);

  const improvementPct = ((test2Stats.mean - test1Stats.mean) / test1Stats.mean) * 100;
  log(`\nBaseline (no prevention):    ${test1Stats.mean.toFixed(2)}%`);
  log(`Regulated (all prevention):  ${test2Stats.mean.toFixed(2)}%`);
  log(`Improvement:                 ${improvementPct.toFixed(1)}× better`);
  log(`Status: ${test2Stats.mean > test1Stats.mean ? '✅ Prevention works better' : '❌ No improvement'}`);

  // Error summary
  const errorCount = allResults.filter(r => r.errors.length > 0).length;
  log(`\n${'─'.repeat(80)}`);
  log(`ERROR SUMMARY`);
  log(`${'─'.repeat(80)}`);
  log(`\nRuns with errors: ${errorCount} / ${allResults.length}`);
  log(`Status: ${errorCount === 0 ? '✅ No errors' : `⚠️ ${errorCount} runs had errors`}`);

  if (errorCount > 0) {
    const errorsWithDetails = allResults.filter(r => r.errors.length > 0);
    for (const result of errorsWithDetails) {
      log(`\n  Seed ${result.seed}:`);
      for (const error of result.errors) {
        log(`    ${error}`);
      }
    }
  }

  // ============================================================================
  // SAVE RESULTS TO JSON
  // ============================================================================
  const jsonFile = path.join(OUTPUT_DIR, `validation_${timestamp}.json`);
  const summaryData = {
    timestamp: new Date().toISOString(),
    implementation: 'Commit 5c9e77323',
    test1: {
      name: 'Baseline (No Prevention Tech)',
      n: test1Results.length,
      duration: test1Duration,
      effectiveness: test1Stats,
      results: test1Results
    },
    test2: {
      name: 'Regulated (All Prevention Tech)',
      n: test2Results.length,
      duration: test2Duration,
      effectiveness: test2Stats,
      results: test2Results
    },
    determinism: {
      seed: detSeed,
      run1: detResult1.effectiveness,
      run2: detResult2.effectiveness,
      cv: detCV,
      pass: detCV < 0.01
    },
    comparison: {
      baselineEffectiveness: test1Stats.mean,
      regulatedEffectiveness: test2Stats.mean,
      improvementFactor: improvementPct,
      preventionWorksBetter: test2Stats.mean > test1Stats.mean
    },
    errors: {
      count: errorCount,
      total: allResults.length
    }
  };

  fs.writeFileSync(jsonFile, JSON.stringify(summaryData, null, 2));
  log(`\n✅ Results saved to ${jsonFile}`);

  // ============================================================================
  // VALIDATION REPORT
  // ============================================================================
  log(`\n${'█'.repeat(80)}`);
  log(`█ VALIDATION REPORT`);
  log(`${'█'.repeat(80)}\n`);

  let passCount = 0;
  let totalChecks = 0;

  // Check 1: Baseline effectiveness 0-2%
  totalChecks++;
  const check1Pass = test1Stats.mean <= 2.0;
  log(`${check1Pass ? '✅' : '❌'} Check 1: Baseline effectiveness ≤ 2%`);
  log(`   Actual: ${test1Stats.mean.toFixed(2)}% (${check1Pass ? 'PASS' : 'FAIL'})`);
  if (check1Pass) passCount++;

  // Check 2: Prevention improves effectiveness
  totalChecks++;
  const check2Pass = test2Stats.mean > test1Stats.mean;
  log(`${check2Pass ? '✅' : '❌'} Check 2: Prevention improves effectiveness`);
  log(`   Baseline: ${test1Stats.mean.toFixed(2)}%, Regulated: ${test2Stats.mean.toFixed(2)}% (${check2Pass ? 'PASS' : 'FAIL'})`);
  if (check2Pass) passCount++;

  // Check 3: No NaN/Infinity errors
  totalChecks++;
  const check3Pass = errorCount === 0;
  log(`${check3Pass ? '✅' : '❌'} Check 3: No NaN/Infinity errors`);
  log(`   Errors: ${errorCount} / ${allResults.length} (${check3Pass ? 'PASS' : 'FAIL'})`);
  if (check3Pass) passCount++;

  // Check 4: Determinism (CV < 0.01%)
  totalChecks++;
  const check4Pass = detCV < 0.01;
  log(`${check4Pass ? '✅' : '❌'} Check 4: Determinism (CV < 0.01%)`);
  log(`   CV: ${detCV.toFixed(4)}% (${check4Pass ? 'PASS' : 'FAIL'})`);
  if (check4Pass) passCount++;

  log(`\n${'─'.repeat(80)}`);
  log(`OVERALL: ${passCount} / ${totalChecks} checks passed`);
  log(`Status: ${passCount === totalChecks ? '✅ ALL CHECKS PASSED' : `⚠️ ${totalChecks - passCount} checks failed`}`);
  log(`${'─'.repeat(80)}\n`);

  log(`\n✅ Validation complete. Log file: ${logFile}`);
  log(`✅ Results file: ${jsonFile}\n`);
}

// Run validation
main().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
