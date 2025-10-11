/**
 * Simulation Performance Profiler
 *
 * Instruments the simulation to measure:
 * - Time per phase
 * - Orchestrator overhead
 * - require() overhead
 * - Overall step() time
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

interface PhaseProfile {
  id: string;
  name: string;
  order: number;
  totalTime: number;
  callCount: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

interface ProfilingResults {
  totalSimulationTime: number;
  totalSteps: number;
  avgStepTime: number;
  phases: PhaseProfile[];
  orchestratorOverhead: number;
  requireOverhead: number;
}

/**
 * Monkey-patch to measure phase execution time
 */
function instrumentPhaseOrchestrator() {
  const PhaseOrchestrator = require('../src/simulation/engine/PhaseOrchestrator').PhaseOrchestrator;
  const originalExecuteAll = PhaseOrchestrator.prototype.executeAll;

  const phaseTimings = new Map<string, { times: number[], name: string, order: number }>();
  let orchestratorOverhead = 0;
  let requireTime = 0;

  PhaseOrchestrator.prototype.executeAll = function(state: any, rng: any, context?: any) {
    const orchestratorStart = performance.now();

    // Ensure phases are sorted (measure this overhead)
    if (!this.sorted) {
      const sortStart = performance.now();
      this.sortPhases();
      orchestratorOverhead += performance.now() - sortStart;
    }

    // Create context if not provided (measure this overhead)
    const ctxStart = performance.now();
    const ctx = context || {
      month: state.currentMonth,
      data: new Map()
    };
    orchestratorOverhead += performance.now() - ctxStart;

    const allEvents: any[] = [];

    for (const phase of this.phases) {
      const phaseStart = performance.now();

      try {
        const result = phase.execute(state, rng, ctx);

        const phaseTime = performance.now() - phaseStart;

        // Track timing
        if (!phaseTimings.has(phase.id)) {
          phaseTimings.set(phase.id, { times: [], name: phase.name, order: phase.order });
        }
        phaseTimings.get(phase.id)!.times.push(phaseTime);

        // Collect events
        if (result.events && result.events.length > 0) {
          allEvents.push(...result.events);
        }

        // Handle state replacement
        if (result.newState) {
          Object.assign(state, result.newState);
        }

        // Store metadata in context
        if (result.metadata) {
          ctx.data.set(phase.id, result.metadata);
        }
      } catch (error) {
        console.error(`\n❌ ERROR in phase "${phase.name}" (${phase.id}):`, error);
      }
    }

    const totalOrchTime = performance.now() - orchestratorStart;
    const actualPhaseTime = Array.from(phaseTimings.values())
      .reduce((sum, p) => sum + p.times[p.times.length - 1], 0);
    orchestratorOverhead += totalOrchTime - actualPhaseTime;

    return allEvents;
  };

  return { phaseTimings, getOverhead: () => orchestratorOverhead, getRequireTime: () => requireTime };
}

/**
 * Measure require() overhead by instrumenting Module
 */
function instrumentRequire() {
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  let totalRequireTime = 0;
  let requireCount = 0;
  const requireCache = new Map<string, number>();

  Module.prototype.require = function(id: string) {
    const start = performance.now();
    const result = originalRequire.apply(this, arguments);
    const elapsed = performance.now() - start;

    totalRequireTime += elapsed;
    requireCount++;
    requireCache.set(id, (requireCache.get(id) || 0) + elapsed);

    return result;
  };

  return {
    getTotalTime: () => totalRequireTime,
    getCount: () => requireCount,
    getCache: () => requireCache
  };
}

/**
 * Run profiled simulation
 */
async function profileSimulation(steps: number = 100, seed: number = 42000) {
  console.log(`\n🔍 PROFILING SIMULATION (${steps} steps, seed ${seed})`);
  console.log('================================================================================\n');

  // Instrument code
  const phaseInstrumentation = instrumentPhaseOrchestrator();
  const requireInstrumentation = instrumentRequire();

  // Create engine and initial state
  const engine = new SimulationEngine({ seed, maxMonths: steps });
  const initialState = createDefaultInitialState();

  // Run simulation with profiling
  const simStart = performance.now();
  const stepTimes: number[] = [];

  let state = initialState;
  for (let i = 0; i < steps; i++) {
    const stepStart = performance.now();
    const result = engine.step(state);
    const stepTime = performance.now() - stepStart;
    stepTimes.push(stepTime);
    state = result.state;

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\rProgress: ${i + 1}/${steps} steps (${((i + 1) / steps * 100).toFixed(0)}%)`);
    }
  }

  const totalTime = performance.now() - simStart;
  console.log(`\n\n✅ Profiling complete!\n`);

  // Analyze results
  const phaseProfiles: PhaseProfile[] = [];
  for (const [id, data] of phaseInstrumentation.phaseTimings.entries()) {
    const times = data.times;
    phaseProfiles.push({
      id,
      name: data.name,
      order: data.order,
      totalTime: times.reduce((a, b) => a + b, 0),
      callCount: times.length,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times)
    });
  }

  // Sort by total time (descending)
  phaseProfiles.sort((a, b) => b.totalTime - a.totalTime);

  const results: ProfilingResults = {
    totalSimulationTime: totalTime,
    totalSteps: steps,
    avgStepTime: stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length,
    phases: phaseProfiles,
    orchestratorOverhead: phaseInstrumentation.getOverhead(),
    requireOverhead: requireInstrumentation.getTotalTime()
  };

  // Print results
  printResults(results, requireInstrumentation);
}

/**
 * Print profiling results
 */
function printResults(results: ProfilingResults, requireInst: any) {
  console.log('📊 PERFORMANCE SUMMARY');
  console.log('================================================================================');
  console.log(`Total time:           ${results.totalSimulationTime.toFixed(2)} ms`);
  console.log(`Total steps:          ${results.totalSteps}`);
  console.log(`Avg step time:        ${results.avgStepTime.toFixed(2)} ms`);
  console.log(`Steps per second:     ${(1000 / results.avgStepTime).toFixed(2)}`);
  console.log('');

  console.log('⚙️  OVERHEAD BREAKDOWN');
  console.log('================================================================================');
  const totalPhaseTime = results.phases.reduce((sum, p) => sum + p.totalTime, 0);
  console.log(`Phase execution:      ${totalPhaseTime.toFixed(2)} ms (${(totalPhaseTime / results.totalSimulationTime * 100).toFixed(1)}%)`);
  console.log(`Orchestrator:         ${results.orchestratorOverhead.toFixed(2)} ms (${(results.orchestratorOverhead / results.totalSimulationTime * 100).toFixed(1)}%)`);
  console.log(`require() calls:      ${results.requireOverhead.toFixed(2)} ms (${(results.requireOverhead / results.totalSimulationTime * 100).toFixed(1)}%)`);
  console.log(`  └─ Total calls:     ${requireInst.getCount()}`);
  console.log(`  └─ Avg per call:    ${(results.requireOverhead / requireInst.getCount()).toFixed(3)} ms`);
  const otherOverhead = results.totalSimulationTime - totalPhaseTime - results.orchestratorOverhead - results.requireOverhead;
  console.log(`Other overhead:       ${otherOverhead.toFixed(2)} ms (${(otherOverhead / results.totalSimulationTime * 100).toFixed(1)}%)`);
  console.log('');

  console.log('🔥 TOP 10 SLOWEST PHASES');
  console.log('================================================================================');
  console.log('Rank | Phase Name                     | Total (ms) | Avg (ms) | % Time | Calls');
  console.log('-----|--------------------------------|------------|----------|--------|-------');

  results.phases.slice(0, 10).forEach((phase, idx) => {
    const pct = (phase.totalTime / totalPhaseTime * 100).toFixed(1);
    console.log(
      `${(idx + 1).toString().padStart(4)} | ` +
      `${phase.name.padEnd(30).substring(0, 30)} | ` +
      `${phase.totalTime.toFixed(2).padStart(10)} | ` +
      `${phase.avgTime.toFixed(3).padStart(8)} | ` +
      `${pct.padStart(5)}% | ` +
      `${phase.callCount.toString().padStart(5)}`
    );
  });
  console.log('');

  console.log('📈 PHASE PERFORMANCE BY ORDER');
  console.log('================================================================================');
  const sortedByOrder = [...results.phases].sort((a, b) => a.order - b.order);

  sortedByOrder.forEach(phase => {
    const bar = '█'.repeat(Math.ceil(phase.totalTime / totalPhaseTime * 50));
    const pct = (phase.totalTime / totalPhaseTime * 100).toFixed(1);
    console.log(`[${phase.order.toString().padStart(5, ' ')}] ${phase.name.padEnd(30)} ${bar} ${pct}%`);
  });
  console.log('');

  console.log('💾 TOP REQUIRE() CALLS');
  console.log('================================================================================');
  const requireCache = Array.from(requireInst.getCache().entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  requireCache.forEach(([module, time], idx) => {
    const shortName = module.split('/').pop() || module;
    console.log(`${(idx + 1).toString().padStart(2)}. ${shortName.padEnd(40)} ${time.toFixed(3)} ms`);
  });
  console.log('');

  console.log('🎯 RECOMMENDATIONS');
  console.log('================================================================================');

  // Analyze and provide recommendations
  const slowestPhase = results.phases[0];
  const requirePct = results.requireOverhead / results.totalSimulationTime * 100;
  const orchestratorPct = results.orchestratorOverhead / results.totalSimulationTime * 100;

  if (requirePct > 10) {
    console.log(`⚠️  HIGH REQUIRE() OVERHEAD (${requirePct.toFixed(1)}%)`);
    console.log('   - Cache require() results in phase constructors');
    console.log('   - Pre-import modules at engine initialization');
  }

  if (orchestratorPct > 5) {
    console.log(`⚠️  HIGH ORCHESTRATOR OVERHEAD (${orchestratorPct.toFixed(1)}%)`);
    console.log('   - Consider inlining critical phases');
    console.log('   - Reduce context management overhead');
  }

  if (slowestPhase.totalTime / totalPhaseTime > 0.2) {
    console.log(`⚠️  SINGLE PHASE DOMINATES (${slowestPhase.name}: ${(slowestPhase.totalTime / totalPhaseTime * 100).toFixed(1)}%)`);
    console.log(`   - Profile ${slowestPhase.name} internally`);
    console.log('   - Consider optimizing hot paths in this phase');
  }

  console.log('');
}

// Run profiling
const steps = parseInt(process.argv[2] || '100');
const seed = parseInt(process.argv[3] || '42000');

profileSimulation(steps, seed).catch(err => {
  console.error('Profiling failed:', err);
  process.exit(1);
});
