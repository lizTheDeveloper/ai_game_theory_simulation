#!/usr/bin/env npx tsx
/**
 * Performance Profiling Script - Nov 20, 2025
 *
 * Profiles simulation performance to identify bottlenecks for 164% budget violation fix.
 * Target: Reduce 197ms average step time to <120ms
 *
 * Usage:
 *   npx tsx scripts/profilePerformance.ts [--runs=10] [--months=120]
 *   npx tsx scripts/profilePerformance.ts > logs/profile_$(date +%Y%m%d_%H%M%S).log 2>&1 &
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

async function profileSimulation() {
  console.log('🔍 PERFORMANCE PROFILING - Nov 20, 2025');
  console.log('Target: <120ms average step time (currently 197ms = 164% of budget)');
  console.log('='.repeat(100));

  const args = process.argv.slice(2);
  const monthsArg = args.find(arg => arg.startsWith('--months='));
  const runsArg = args.find(arg => arg.startsWith('--runs='));
  const monthsToSimulate = monthsArg ? parseInt(monthsArg.split('=')[1]) : 120;
  const numRuns = runsArg ? parseInt(runsArg.split('=')[1]) : 10;
  const baseSeed = 42;
  const outputDir = path.join(process.cwd(), 'logs', 'performance_profile_20251120');

  console.log(`\nConfiguration:`);
  console.log(`  Runs: ${numRuns}`);
  console.log(`  Months per run: ${monthsToSimulate}`);
  console.log(`  Base seed: ${baseSeed}`);
  console.log(`  Output: ${outputDir}`);
  console.log('='.repeat(100));

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allRunStats: Array<{
    run: number;
    seed: number;
    totalDurationMs: number;
    monthsSimulated: number;
    avgStepMs: number;
    maxStepMs: number;
    minStepMs: number;
    p95StepMs: number;
  }> = [];

  for (let runIdx = 0; runIdx < numRuns; runIdx++) {
    const seed = baseSeed + runIdx;
    console.log(`\n📊 Run ${runIdx + 1}/${numRuns} (seed: ${seed})`);
    console.log('-'.repeat(100));

    const engine = new SimulationEngine({
      seed,
      maxMonths: monthsToSimulate,
      logLevel: 'error',
      snapshotInterval: 1000,
      enableHistory: false
    });

    engine.orchestrator.enablePerformanceTiming();
    engine.orchestrator.setSlowPhaseThreshold(5);

    // Get RNG from engine (matches worker pattern)
    const seededRng = engine.getRNG();
    const rngFunction = () => seededRng.next();
    const state = createDefaultInitialState(rngFunction);
    const runStart = performance.now();
    const result = engine.run(state);
    const runDuration = performance.now() - runStart;

    console.log(`\n✅ Run ${runIdx + 1} complete:`);
    console.log(`  Duration: ${runDuration.toFixed(0)}ms (${(runDuration / 1000).toFixed(1)}s)`);
    console.log(`  Months: ${result.summary.totalMonths}`);
    console.log(`  Outcome: ${result.summary.finalOutcome}`);

    const stepTimings = engine.orchestrator.getStepTimings();
    if (stepTimings.length > 0) {
      const stepMs = stepTimings.map(s => s.totalMs);
      const avgStep = stepMs.reduce((a, b) => a + b, 0) / stepMs.length;
      const maxStep = Math.max(...stepMs);
      const minStep = Math.min(...stepMs);
      const p95Step = calculateP95(stepMs);

      console.log(`  Avg Step: ${avgStep.toFixed(2)}ms`);
      console.log(`  P95 Step: ${p95Step.toFixed(2)}ms`);
      console.log(`  Max Step: ${maxStep.toFixed(2)}ms`);
      console.log(`  Min Step: ${minStep.toFixed(2)}ms`);

      allRunStats.push({
        run: runIdx + 1,
        seed,
        totalDurationMs: runDuration,
        monthsSimulated: result.summary.totalMonths,
        avgStepMs: avgStep,
        maxStepMs: maxStep,
        minStepMs: minStep,
        p95StepMs: p95Step
      });

      const budget = 120;
      const violation = avgStep > budget;
      const pct = ((avgStep - budget) / budget * 100).toFixed(1);
      if (violation) {
        console.log(`  ⚠️  BUDGET VIOLATION: ${avgStep.toFixed(2)}ms vs ${budget}ms target (+${pct}%)`);
      } else {
        console.log(`  ✅ Within budget: ${avgStep.toFixed(2)}ms vs ${budget}ms target`);
      }
    }

    const phaseTimingsJSON = engine.orchestrator.exportPhaseTimingsJSON();
    const phaseTimingsCSV = engine.orchestrator.exportPhaseTimingsCSV();

    fs.writeFileSync(
      path.join(outputDir, `run_${runIdx + 1}_phase_timings.json`),
      phaseTimingsJSON
    );
    fs.writeFileSync(
      path.join(outputDir, `run_${runIdx + 1}_phase_timings.csv`),
      phaseTimingsCSV
    );
    fs.writeFileSync(
      path.join(outputDir, `run_${runIdx + 1}_step_timings.json`),
      JSON.stringify(stepTimings, null, 2)
    );

    console.log(`\n🔴 TOP 5 SLOWEST PHASES (Run ${runIdx + 1}):`);
    const phaseData = JSON.parse(phaseTimingsJSON);
    const sortedPhases = Object.entries(phaseData.phases as Record<string, any>)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 5);

    sortedPhases.forEach((phase, idx) => {
      console.log(`  ${idx + 1}. ${phase.name}: ${phase.avgMs.toFixed(2)}ms avg (${phase.totalMs.toFixed(0)}ms total)`);
    });
  }

  console.log('\n\n');
  console.log('='.repeat(100));
  console.log('📊 AGGREGATE PERFORMANCE ANALYSIS');
  console.log('='.repeat(100));

  const avgSteps = allRunStats.map(r => r.avgStepMs);
  const p95Steps = allRunStats.map(r => r.p95StepMs);
  const maxSteps = allRunStats.map(r => r.maxStepMs);

  const overallAvgStep = avgSteps.reduce((a, b) => a + b, 0) / avgSteps.length;
  const overallP95Step = p95Steps.reduce((a, b) => a + b, 0) / p95Steps.length;
  const overallMaxStep = Math.max(...maxSteps);

  console.log(`\nStep Timing Summary (${numRuns} runs):`);
  console.log(`  Mean Avg Step:   ${overallAvgStep.toFixed(2)}ms`);
  console.log(`  Mean P95 Step:   ${overallP95Step.toFixed(2)}ms`);
  console.log(`  Peak Step:       ${overallMaxStep.toFixed(2)}ms`);
  console.log(`  Target:          120ms`);
  console.log(`  Current Budget:  ${((overallAvgStep / 120) * 100).toFixed(1)}%`);

  const budgetViolation = overallAvgStep - 120;
  if (budgetViolation > 0) {
    console.log(`  ⚠️  VIOLATION:      +${budgetViolation.toFixed(2)}ms (+${((budgetViolation / 120) * 100).toFixed(1)}%)`);
  } else {
    console.log(`  ✅ WITHIN BUDGET:  ${budgetViolation.toFixed(2)}ms`);
  }

  console.log(`\n\n🔬 PHASE-LEVEL ANALYSIS (aggregated across ${numRuns} runs):`);
  console.log('-'.repeat(100));

  const aggregatedPhases = new Map<string, {
    totalMs: number[];
    avgMs: number[];
    maxMs: number[];
    callCounts: number[];
  }>();

  for (let i = 0; i < numRuns; i++) {
    const phaseDataPath = path.join(outputDir, `run_${i + 1}_phase_timings.json`);
    const phaseData = JSON.parse(fs.readFileSync(phaseDataPath, 'utf-8'));

    for (const [phaseName, data] of Object.entries(phaseData.phases as Record<string, any>)) {
      if (!aggregatedPhases.has(phaseName)) {
        aggregatedPhases.set(phaseName, {
          totalMs: [],
          avgMs: [],
          maxMs: [],
          callCounts: []
        });
      }

      const agg = aggregatedPhases.get(phaseName)!;
      agg.totalMs.push(data.totalMs);
      agg.avgMs.push(data.avgMs);
      agg.maxMs.push(data.maxMs);
      agg.callCounts.push(data.callCount);
    }
  }

  const phaseStats = Array.from(aggregatedPhases.entries()).map(([name, data]) => {
    const meanAvg = data.avgMs.reduce((a, b) => a + b, 0) / data.avgMs.length;
    const meanTotal = data.totalMs.reduce((a, b) => a + b, 0) / data.totalMs.length;
    const meanMax = data.maxMs.reduce((a, b) => a + b, 0) / data.maxMs.length;
    const meanCalls = data.callCounts.reduce((a, b) => a + b, 0) / data.callCounts.length;

    const stdDev = Math.sqrt(
      data.avgMs.reduce((sum, x) => sum + Math.pow(x - meanAvg, 2), 0) / data.avgMs.length
    );
    const cv = (stdDev / meanAvg) * 100;

    return {
      name,
      meanAvgMs: meanAvg,
      meanTotalMs: meanTotal,
      meanMaxMs: meanMax,
      meanCalls: meanCalls,
      cv: cv
    };
  }).sort((a, b) => b.meanTotalMs - a.meanTotalMs);

  console.log('\nTOP 20 SLOWEST PHASES (by mean total time across runs):');
  console.log(
    'Phase Name'.padEnd(40) +
    'Mean Avg'.padStart(12) +
    'Mean Max'.padStart(12) +
    'Mean Total'.padStart(14) +
    'CV%'.padStart(8)
  );
  console.log('-'.repeat(100));

  phaseStats.slice(0, 20).forEach((phase, idx) => {
    console.log(
      `${idx + 1}. ${phase.name}`.padEnd(40) +
      `${phase.meanAvgMs.toFixed(2)}ms`.padStart(12) +
      `${phase.meanMaxMs.toFixed(2)}ms`.padStart(12) +
      `${phase.meanTotalMs.toFixed(1)}ms`.padStart(14) +
      `${phase.cv.toFixed(1)}%`.padStart(8)
    );
  });

  console.log('\n\n⚠️  PHASES WITH HIGH VARIANCE (CV > 50%):');
  const highVariancePhases = phaseStats.filter(p => p.cv > 50).slice(0, 10);
  if (highVariancePhases.length > 0) {
    highVariancePhases.forEach(phase => {
      console.log(`  - ${phase.name}: CV=${phase.cv.toFixed(1)}% (avg=${phase.meanAvgMs.toFixed(2)}ms)`);
    });
  } else {
    console.log('  None found (all phases have CV < 50%)');
  }

  const totalPhaseTime = phaseStats.reduce((sum, p) => sum + p.meanTotalMs, 0);
  const totalStepTime = overallAvgStep * monthsToSimulate;
  const orchestrationOverhead = totalStepTime - totalPhaseTime;
  const overheadPct = (orchestrationOverhead / totalStepTime) * 100;

  console.log('\n\n🔍 ORCHESTRATION OVERHEAD ANALYSIS:');
  console.log(`  Total Phase Time:       ${totalPhaseTime.toFixed(1)}ms`);
  console.log(`  Total Step Time:        ${totalStepTime.toFixed(1)}ms`);
  console.log(`  Orchestration Overhead: ${orchestrationOverhead.toFixed(1)}ms (${overheadPct.toFixed(1)}%)`);
  console.log(`  Per-Phase Overhead:     ${(orchestrationOverhead / 87).toFixed(2)}ms`);

  const report = {
    config: {
      runs: numRuns,
      maxMonths: monthsToSimulate,
      baseSeed,
      outputDir
    },
    timestamp: new Date().toISOString(),
    budgetTarget: 120,
    overallStats: {
      meanAvgStep: overallAvgStep,
      meanP95Step: overallP95Step,
      peakStep: overallMaxStep,
      budgetUsage: (overallAvgStep / 120) * 100,
      budgetViolation: budgetViolation > 0
    },
    orchestrationOverhead: {
      totalPhaseTimeMs: totalPhaseTime,
      totalStepTimeMs: totalStepTime,
      overheadMs: orchestrationOverhead,
      overheadPct: overheadPct,
      perPhaseOverheadMs: orchestrationOverhead / 87
    },
    top20Phases: phaseStats.slice(0, 20),
    highVariancePhases: highVariancePhases,
    runs: allRunStats
  };

  fs.writeFileSync(
    path.join(outputDir, 'aggregate_report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n✅ Profile complete. Data saved to: ${outputDir}/`);
  console.log('='.repeat(100));
}

function calculateP95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, index)];
}

profileSimulation().catch(err => {
  console.error('\n❌ FATAL ERROR:', err);
  process.exit(1);
});
