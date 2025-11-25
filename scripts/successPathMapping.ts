#!/usr/bin/env tsx
/**
 * Success Path Mapping - Diagnostic Infrastructure
 *
 * PURPOSE: Map the CONDITIONS that lead to positive outcomes (utopia, humane dystopia)
 * This is the inverse of failure mode testing - we want to know what makes success possible.
 *
 * METHODOLOGY:
 * - Run N simulations with random seeds
 * - Track state snapshots at critical months (12, 24, 36, 48, 60, 72, 84, 96, 108, 120)
 * - For successful runs, analyze:
 *   - Key inflection points (when did trust/governance cross threshold?)
 *   - Minimum conditions met (trust > 60, governance > 70, etc.)
 *   - Critical timing (when did spiral activation occur?)
 *   - Technology deployment patterns
 *
 * OUTPUT:
 * - Text report summarizing success paths
 * - Comparison of successful vs failed runs
 * - Minimum viable conditions for utopia
 *
 * RESEARCH BASIS:
 * - Scenario analysis (Nov 13): high-trust-start achieved 88.9% utopia
 * - God mode analysis: technology alone is insufficient
 * - Trust/governance thresholds in upwardSpirals.ts
 *
 * @see docs/wiki/systems/success-paths.md for documentation
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NUM_RUNS = 10;
const MAX_MONTHS = 120;
const SNAPSHOT_INTERVALS = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120]; // Every year

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface StateSnapshot {
  month: number;
  trust: number;              // Average trust in AI
  governance: number;         // Average of decisionQuality + institutionalCapacity
  cooperation: number;        // International cooperation
  aiCapability: number;       // Average AI capability
  qol: number;               // Average QoL across 5 tiers

  // Spiral activation
  spiralsActive: {
    democratic: boolean;
    cognitive: boolean;
    prosperity: boolean;
    cooperative: boolean;
    ecological: boolean;
    existential: boolean;
  };

  // Key technologies
  techDeployed: number;       // Count of deployed breakthrough techs
  tier3TechCount: number;     // Transformative techs
  tier4TechCount: number;     // Clarketech

  // Environmental
  climateStability: number;
  biodiversity: number;

  // Crisis state
  activeCrises: number;
}

interface RunSummary {
  seed: number;
  outcome: string;            // Unified outcome classification
  finalQoL: number;
  finalTrust: number;
  finalGovernance: number;
  snapshots: StateSnapshot[];

  // Success indicators
  firstSpiralActivation?: number;  // Month when first spiral activated
  trustThresholdMonth?: number;    // Month when trust crossed 60%
  governanceThresholdMonth?: number; // Month when governance crossed 70%

  // Technology timeline
  firstTier3Tech?: number;    // Month of first transformative tech
  firstTier4Tech?: number;    // Month of first clarketech
}

// ============================================================================
// STATE SNAPSHOT EXTRACTION
// ============================================================================

function captureSnapshot(state: GameState): StateSnapshot {
  // Trust in AI (average across agents)
  const deployedAgents = state.aiAgents.filter(a => a.lifecycle === 'deployed');
  const avgTrust = deployedAgents.length > 0
    ? deployedAgents.reduce((sum, a) => sum + (a.publicTrust || 0), 0) / deployedAgents.length
    : 0;

  // Governance quality
  const gov = state.government.governanceQuality;
  const governanceScore = (gov.decisionQuality + gov.institutionalCapacity) / 2;

  // AI capability
  const avgCapability = deployedAgents.length > 0
    ? deployedAgents.reduce((sum, a) => {
        const cap = a.capabilities;
        const total = (cap.physical + cap.digital + cap.cognitive + cap.social + cap.economic + cap.research) / 6;
        return sum + total;
      }, 0) / deployedAgents.length
    : 0;

  // QoL (average across tiers)
  const qolSys = state.qualityOfLifeSystems;
  const avgQoL = (
    qolSys.tier1_survival +
    qolSys.tier2_security +
    qolSys.tier3_community +
    qolSys.tier4_meaning +
    qolSys.tier5_environmental
  ) / 5;

  // Spiral activation
  const spirals = state.upwardSpirals;
  const spiralsActive = {
    democratic: spirals?.democraticLegitimacy?.active || false,
    cognitive: spirals?.cognitiveAugmentation?.active || false,
    prosperity: spirals?.sharedProsperity?.active || false,
    cooperative: spirals?.cooperativeSecurity?.active || false,
    ecological: spirals?.ecologicalHarmony?.active || false,
    existential: spirals?.existentialSecurity?.active || false
  };

  // Technology
  const deployedTechs = (state.breakthroughTechnologies || []).filter(t => t.status === 'deployed');
  const tier3Count = deployedTechs.filter(t => t.tier === 3).length;
  const tier4Count = deployedTechs.filter(t => t.tier === 4).length;

  // Environmental
  const env = state.environmentalSystem;

  // Crises
  const activeCrises = state.crisisSystem?.activeCrises?.length || 0;

  return {
    month: state.currentMonth,
    trust: avgTrust,
    governance: governanceScore,
    cooperation: state.internationalRelations?.cooperationLevel || 0,
    aiCapability: avgCapability,
    qol: avgQoL,
    spiralsActive,
    techDeployed: deployedTechs.length,
    tier3TechCount: tier3Count,
    tier4TechCount: tier4Count,
    climateStability: env?.climateStability || 0,
    biodiversity: env?.biodiversityIndex || 0,
    activeCrises
  };
}

// ============================================================================
// INFLECTION POINT ANALYSIS
// ============================================================================

function analyzeInflectionPoints(snapshots: StateSnapshot[]): {
  firstSpiralActivation?: number;
  trustThresholdMonth?: number;
  governanceThresholdMonth?: number;
  firstTier3Tech?: number;
  firstTier4Tech?: number;
} {
  let firstSpiralActivation: number | undefined;
  let trustThresholdMonth: number | undefined;
  let governanceThresholdMonth: number | undefined;
  let firstTier3Tech: number | undefined;
  let firstTier4Tech: number | undefined;

  for (const snapshot of snapshots) {
    // First spiral activation
    if (!firstSpiralActivation) {
      const anyActive = Object.values(snapshot.spiralsActive).some(active => active);
      if (anyActive) {
        firstSpiralActivation = snapshot.month;
      }
    }

    // Trust threshold (60%)
    if (!trustThresholdMonth && snapshot.trust > 0.6) {
      trustThresholdMonth = snapshot.month;
    }

    // Governance threshold (70%)
    if (!governanceThresholdMonth && snapshot.governance > 0.7) {
      governanceThresholdMonth = snapshot.month;
    }

    // First tier 3 tech
    if (!firstTier3Tech && snapshot.tier3TechCount > 0) {
      firstTier3Tech = snapshot.month;
    }

    // First tier 4 tech
    if (!firstTier4Tech && snapshot.tier4TechCount > 0) {
      firstTier4Tech = snapshot.month;
    }
  }

  return {
    firstSpiralActivation,
    trustThresholdMonth,
    governanceThresholdMonth,
    firstTier3Tech,
    firstTier4Tech
  };
}

// ============================================================================
// SIMULATION RUNNER
// ============================================================================

async function runSimulation(seed: number): Promise<RunSummary> {
  // CRITICAL: Create engine first to get RNG, then create initial state with that RNG
  // This ensures determinism (no Math.random fallbacks)
  // Pattern from monteCarloSimulation.ts (Nov 6, 2025 fix)
  const engine = new SimulationEngine({ seed, maxMonths: MAX_MONTHS, logLevel: 'quiet' });
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());
  const initialState = createDefaultInitialState(rngFunction);

  const snapshots: StateSnapshot[] = [];
  let nextSnapshotIdx = 0;

  // Manual step-through to capture snapshots
  // Note: step() mutates state directly, returns result with updated state
  let currentState = initialState;

  for (let month = 0; month < MAX_MONTHS; month++) {
    const result = engine.step(currentState);

    // Check if step was successful (result should have success field from SimulationStepResult)
    // Actually, step() returns { state, events, metrics } - no success field
    // It throws on error, so if we get here, it succeeded
    currentState = result.state;

    // Capture snapshots at intervals
    if (nextSnapshotIdx < SNAPSHOT_INTERVALS.length &&
        month >= SNAPSHOT_INTERVALS[nextSnapshotIdx]) {
      snapshots.push(captureSnapshot(currentState));
      nextSnapshotIdx++;
    }
  }

  // Final state
  const finalState = currentState;

  // Outcome classification
  const outcome = finalState.outcomeClassification?.unifiedOutcome || 'UNKNOWN';

  // Final metrics
  const finalSnapshot = snapshots[snapshots.length - 1];
  const finalQoL = finalSnapshot?.qol || 0;
  const finalTrust = finalSnapshot?.trust || 0;
  const finalGovernance = finalSnapshot?.governance || 0;

  // Inflection points
  const inflectionPoints = analyzeInflectionPoints(snapshots);

  return {
    seed,
    outcome,
    finalQoL,
    finalTrust,
    finalGovernance,
    snapshots,
    ...inflectionPoints
  };
}

// ============================================================================
// ANALYSIS & REPORTING
// ============================================================================

function categorizeOutcome(outcome: string): 'success' | 'failure' | 'mixed' {
  // Success: Utopia variants, humane dystopia
  if (outcome.includes('UTOPIA')) return 'success';
  if (outcome.includes('HUMANE_DYSTOPIA')) return 'success';

  // Failure: Extinction, collapse, authoritarian
  if (outcome.includes('EXTINCTION')) return 'failure';
  if (outcome.includes('COLLAPSE')) return 'failure';
  if (outcome.includes('AUTHORITARIAN')) return 'failure';

  // Mixed: Everything else
  return 'mixed';
}

function generateReport(runs: RunSummary[]): string {
  const successRuns = runs.filter(r => categorizeOutcome(r.outcome) === 'success');
  const failureRuns = runs.filter(r => categorizeOutcome(r.outcome) === 'failure');
  const mixedRuns = runs.filter(r => categorizeOutcome(r.outcome) === 'mixed');

  let report = '';
  report += '='.repeat(80) + '\n';
  report += 'SUCCESS PATH MAPPING ANALYSIS\n';
  report += '='.repeat(80) + '\n\n';

  report += `Total Runs: ${runs.length}\n`;
  report += `  ✅ Success: ${successRuns.length} (${(successRuns.length / runs.length * 100).toFixed(1)}%)\n`;
  report += `  ❌ Failure: ${failureRuns.length} (${(failureRuns.length / runs.length * 100).toFixed(1)}%)\n`;
  report += `  ⚠️  Mixed:   ${mixedRuns.length} (${(mixedRuns.length / runs.length * 100).toFixed(1)}%)\n\n`;

  // Outcome distribution
  report += 'OUTCOME DISTRIBUTION:\n';
  const outcomeCounts = runs.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(outcomeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      const pct = (count / runs.length * 100).toFixed(1);
      report += `  ${outcome}: ${count} (${pct}%)\n`;
    });
  report += '\n';

  // Success path analysis
  if (successRuns.length > 0) {
    report += '='.repeat(80) + '\n';
    report += 'SUCCESS PATH ANALYSIS\n';
    report += '='.repeat(80) + '\n\n';

    // Average final metrics
    const avgFinalQoL = successRuns.reduce((sum, r) => sum + r.finalQoL, 0) / successRuns.length;
    const avgFinalTrust = successRuns.reduce((sum, r) => sum + r.finalTrust, 0) / successRuns.length;
    const avgFinalGov = successRuns.reduce((sum, r) => sum + r.finalGovernance, 0) / successRuns.length;

    report += 'FINAL STATE (Average across successful runs):\n';
    report += `  Quality of Life: ${(avgFinalQoL * 100).toFixed(1)}%\n`;
    report += `  Trust in AI:     ${(avgFinalTrust * 100).toFixed(1)}%\n`;
    report += `  Governance:      ${(avgFinalGov * 100).toFixed(1)}%\n\n`;

    // Inflection point timing
    const spiralActivations = successRuns
      .map(r => r.firstSpiralActivation)
      .filter(m => m !== undefined) as number[];
    const trustThresholds = successRuns
      .map(r => r.trustThresholdMonth)
      .filter(m => m !== undefined) as number[];
    const govThresholds = successRuns
      .map(r => r.governanceThresholdMonth)
      .filter(m => m !== undefined) as number[];
    const tier3Techs = successRuns
      .map(r => r.firstTier3Tech)
      .filter(m => m !== undefined) as number[];
    const tier4Techs = successRuns
      .map(r => r.firstTier4Tech)
      .filter(m => m !== undefined) as number[];

    report += 'CRITICAL TIMING (Average month of first occurrence):\n';
    if (spiralActivations.length > 0) {
      const avg = spiralActivations.reduce((sum, m) => sum + m, 0) / spiralActivations.length;
      report += `  First spiral activation:  Month ${avg.toFixed(1)} (${spiralActivations.length}/${successRuns.length} runs)\n`;
    }
    if (trustThresholds.length > 0) {
      const avg = trustThresholds.reduce((sum, m) => sum + m, 0) / trustThresholds.length;
      report += `  Trust >60%:               Month ${avg.toFixed(1)} (${trustThresholds.length}/${successRuns.length} runs)\n`;
    }
    if (govThresholds.length > 0) {
      const avg = govThresholds.reduce((sum, m) => sum + m, 0) / govThresholds.length;
      report += `  Governance >70%:          Month ${avg.toFixed(1)} (${govThresholds.length}/${successRuns.length} runs)\n`;
    }
    if (tier3Techs.length > 0) {
      const avg = tier3Techs.reduce((sum, m) => sum + m, 0) / tier3Techs.length;
      report += `  First tier 3 tech:        Month ${avg.toFixed(1)} (${tier3Techs.length}/${successRuns.length} runs)\n`;
    }
    if (tier4Techs.length > 0) {
      const avg = tier4Techs.reduce((sum, m) => sum + m, 0) / tier4Techs.length;
      report += `  First tier 4 tech:        Month ${avg.toFixed(1)} (${tier4Techs.length}/${successRuns.length} runs)\n`;
    }
    report += '\n';

    // Minimum viable conditions
    report += 'MINIMUM VIABLE CONDITIONS (across successful runs):\n';

    // For each snapshot interval, find minimum values that still led to success
    const intervalAnalysis = SNAPSHOT_INTERVALS.map(month => {
      const snapshotsAtMonth = successRuns
        .map(r => r.snapshots.find(s => s.month === month))
        .filter(s => s !== undefined) as StateSnapshot[];

      if (snapshotsAtMonth.length === 0) return null;

      const minTrust = Math.min(...snapshotsAtMonth.map(s => s.trust));
      const minGov = Math.min(...snapshotsAtMonth.map(s => s.governance));
      const minQoL = Math.min(...snapshotsAtMonth.map(s => s.qol));
      const avgTrust = snapshotsAtMonth.reduce((sum, s) => sum + s.trust, 0) / snapshotsAtMonth.length;
      const avgGov = snapshotsAtMonth.reduce((sum, s) => sum + s.governance, 0) / snapshotsAtMonth.length;
      const avgQoL = snapshotsAtMonth.reduce((sum, s) => sum + s.qol, 0) / snapshotsAtMonth.length;

      return {
        month,
        minTrust,
        minGov,
        minQoL,
        avgTrust,
        avgGov,
        avgQoL
      };
    }).filter(a => a !== null);

    // Key checkpoints
    const checkpoints = [24, 48, 72, 96, 120]; // Every 2 years
    checkpoints.forEach(month => {
      const analysis = intervalAnalysis.find(a => a?.month === month);
      if (analysis) {
        report += `\n  Month ${month} (Year ${month / 12}):\n`;
        report += `    Trust:      min=${(analysis.minTrust * 100).toFixed(1)}%, avg=${(analysis.avgTrust * 100).toFixed(1)}%\n`;
        report += `    Governance: min=${(analysis.minGov * 100).toFixed(1)}%, avg=${(analysis.avgGov * 100).toFixed(1)}%\n`;
        report += `    QoL:        min=${(analysis.minQoL * 100).toFixed(1)}%, avg=${(analysis.avgQoL * 100).toFixed(1)}%\n`;
      }
    });
    report += '\n';
  }

  // Failure analysis (for comparison)
  if (failureRuns.length > 0) {
    report += '='.repeat(80) + '\n';
    report += 'FAILURE COMPARISON\n';
    report += '='.repeat(80) + '\n\n';

    const avgFinalQoL = failureRuns.reduce((sum, r) => sum + r.finalQoL, 0) / failureRuns.length;
    const avgFinalTrust = failureRuns.reduce((sum, r) => sum + r.finalTrust, 0) / failureRuns.length;
    const avgFinalGov = failureRuns.reduce((sum, r) => sum + r.finalGovernance, 0) / failureRuns.length;

    report += 'FINAL STATE (Average across failed runs):\n';
    report += `  Quality of Life: ${(avgFinalQoL * 100).toFixed(1)}%\n`;
    report += `  Trust in AI:     ${(avgFinalTrust * 100).toFixed(1)}%\n`;
    report += `  Governance:      ${(avgFinalGov * 100).toFixed(1)}%\n\n`;
  }

  // Individual run details
  report += '='.repeat(80) + '\n';
  report += 'INDIVIDUAL RUN DETAILS\n';
  report += '='.repeat(80) + '\n\n';

  runs.forEach(run => {
    const category = categorizeOutcome(run.outcome);
    const emoji = category === 'success' ? '✅' : category === 'failure' ? '❌' : '⚠️';

    report += `${emoji} Seed ${run.seed}: ${run.outcome}\n`;
    report += `   Final: QoL=${(run.finalQoL * 100).toFixed(1)}%, Trust=${(run.finalTrust * 100).toFixed(1)}%, Gov=${(run.finalGovernance * 100).toFixed(1)}%\n`;

    if (run.firstSpiralActivation) {
      report += `   First spiral: Month ${run.firstSpiralActivation}\n`;
    }
    if (run.trustThresholdMonth) {
      report += `   Trust >60%:   Month ${run.trustThresholdMonth}\n`;
    }
    if (run.governanceThresholdMonth) {
      report += `   Gov >70%:     Month ${run.governanceThresholdMonth}\n`;
    }

    report += '\n';
  });

  return report;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🗺️  SUCCESS PATH MAPPING');
  console.log('='.repeat(80));
  console.log(`Runs:         ${NUM_RUNS}`);
  console.log(`Max months:   ${MAX_MONTHS}`);
  console.log(`Snapshots at: ${SNAPSHOT_INTERVALS.join(', ')}`);
  console.log('='.repeat(80));
  console.log('');

  const runs: RunSummary[] = [];

  for (let i = 0; i < NUM_RUNS; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    console.log(`\n▶️  Run ${i + 1}/${NUM_RUNS} (seed: ${seed})`);

    try {
      const summary = await runSimulation(seed);
      runs.push(summary);

      const category = categorizeOutcome(summary.outcome);
      const emoji = category === 'success' ? '✅' : category === 'failure' ? '❌' : '⚠️';
      console.log(`${emoji} ${summary.outcome} (QoL: ${(summary.finalQoL * 100).toFixed(1)}%)`);

    } catch (error) {
      console.error(`❌ Run ${i + 1} failed:`, error);
      throw error; // Fail loudly
    }
  }

  console.log('\n\n');
  console.log('📊 Generating report...\n');

  const report = generateReport(runs);

  // Output to console
  console.log(report);

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputDir = path.join(__dirname, '..', 'logs');
  const outputFile = path.join(outputDir, `success_path_mapping_${timestamp}.txt`);

  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`\n📁 Report saved to: ${outputFile}`);
}

main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
