#!/usr/bin/env npx tsx
/**
 * Performance Profiling Script
 *
 * Identifies O(n²) bottlenecks and performance issues in the simulation.
 * Runs a short simulation with performance timing enabled.
 */

import { createSimulation, runSimulation } from '../src/simulation/engine';
import { createTestState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { registerAllPhases } from '../src/simulation/engine/phases';
import * as fs from 'fs';

// Monkey-patch performance tracking onto PhaseOrchestrator
const originalExecuteAll = PhaseOrchestrator.prototype.executeAll;
const phaseTimings = new Map<string, { totalMs: number; callCount: number; maxMs: number; minMs: number }>();

PhaseOrchestrator.prototype.executeAll = function(state: any, rng: any, context?: any) {
  const enableTiming = true;
  const startTime = performance.now();

  // Call original with timing wrapper
  const result = originalExecuteAll.call(this, state, rng, context);

  const elapsed = performance.now() - startTime;

  // Track overall step timing
  const stepKey = `TOTAL_STEP_${state.currentMonth}`;
  if (!phaseTimings.has(stepKey)) {
    phaseTimings.set(stepKey, { totalMs: 0, callCount: 0, maxMs: 0, minMs: Infinity });
  }
  const timing = phaseTimings.get(stepKey)!;
  timing.totalMs += elapsed;
  timing.callCount++;
  timing.maxMs = Math.max(timing.maxMs, elapsed);
  timing.minMs = Math.min(timing.minMs, elapsed);

  return result;
};

// Monkey-patch phase execution
const originalRegisterPhase = PhaseOrchestrator.prototype.registerPhase;
PhaseOrchestrator.prototype.registerPhase = function(phase: any) {
  const originalExecute = phase.execute;
  phase.execute = function(state: any, rng: any, context?: any) {
    const startTime = performance.now();
    const result = originalExecute.call(this, state, rng, context);
    const elapsed = performance.now() - startTime;

    // Track phase timing
    const phaseKey = phase.name || phase.id;
    if (!phaseTimings.has(phaseKey)) {
      phaseTimings.set(phaseKey, { totalMs: 0, callCount: 0, maxMs: 0, minMs: Infinity });
    }
    const timing = phaseTimings.get(phaseKey)!;
    timing.totalMs += elapsed;
    timing.callCount++;
    timing.maxMs = Math.max(timing.maxMs, elapsed);
    timing.minMs = Math.min(timing.minMs, elapsed);

    return result;
  };

  return originalRegisterPhase.call(this, phase);
};

async function profileSimulation() {
  console.log('🔍 PERFORMANCE PROFILING STARTED');
  console.log('================================\n');

  // Create initial state with deterministic seed
  const config = {
    seed: 42,
    runLabel: 'PERF_PROFILE',
    monthsToSimulate: 12, // Just 1 year for profiling
    skipLLMQueries: true,
    enableLogging: false
  };

  console.log('Creating initial state...');
  const initialState = createTestState({ config } as any);

  // Count entities to understand scale
  const entityCounts = {
    aiAgents: initialState.aiAgents.length,
    organizations: initialState.organizations.length,
    dataCenters: initialState.computeInfrastructure.dataCenters.length,
    countries: initialState.countryPopulations?.length || 0,
    technologies: Object.keys(initialState.technologies || {}).length
  };

  console.log('\nEntity counts:');
  console.log(`  AI Agents: ${entityCounts.aiAgents}`);
  console.log(`  Organizations: ${entityCounts.organizations}`);
  console.log(`  Data Centers: ${entityCounts.dataCenters}`);
  console.log(`  Countries: ${entityCounts.countries}`);
  console.log(`  Technologies: ${entityCounts.technologies}`);

  // Calculate theoretical O(n²) operations
  const potentialOn2 = {
    agentOrgInteractions: entityCounts.aiAgents * entityCounts.organizations,
    agentAgentInteractions: (entityCounts.aiAgents * (entityCounts.aiAgents - 1)) / 2,
    orgOrgInteractions: (entityCounts.organizations * (entityCounts.organizations - 1)) / 2
  };

  console.log('\nPotential O(n²) operations per step:');
  console.log(`  Agent-Org interactions: ${potentialOn2.agentOrgInteractions.toLocaleString()}`);
  console.log(`  Agent-Agent interactions: ${potentialOn2.agentAgentInteractions.toLocaleString()}`);
  console.log(`  Org-Org interactions: ${potentialOn2.orgOrgInteractions.toLocaleString()}`);

  console.log('\nRunning simulation for 12 months...\n');
  const startTime = performance.now();

  // Run simulation
  const simulation = createSimulation(initialState);
  const finalState = runSimulation(simulation, 12);

  const totalTime = performance.now() - startTime;

  // Analyze results
  console.log('\n================================');
  console.log('📊 PERFORMANCE ANALYSIS COMPLETE');
  console.log('================================\n');

  console.log(`Total simulation time: ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`);
  console.log(`Average per month: ${(totalTime/12).toFixed(2)}ms`);
  console.log(`Simulated months per second: ${(12000/totalTime).toFixed(2)}`);

  // Sort phases by total time
  const sortedPhases = Array.from(phaseTimings.entries())
    .filter(([key]) => !key.startsWith('TOTAL_STEP_'))
    .sort((a, b) => b[1].totalMs - a[1].totalMs)
    .slice(0, 20); // Top 20

  console.log('\n🔥 TOP 20 SLOWEST PHASES (by total time):');
  console.log('==========================================');

  let totalPhaseTime = 0;
  sortedPhases.forEach(([name, timing], index) => {
    const avgMs = timing.totalMs / timing.callCount;
    const percent = (timing.totalMs / totalTime) * 100;
    totalPhaseTime += timing.totalMs;

    console.log(`\n${index + 1}. ${name}`);
    console.log(`   Total: ${timing.totalMs.toFixed(2)}ms (${percent.toFixed(1)}% of runtime)`);
    console.log(`   Avg/call: ${avgMs.toFixed(2)}ms`);
    console.log(`   Max: ${timing.maxMs.toFixed(2)}ms, Min: ${timing.minMs.toFixed(2)}ms`);
    console.log(`   Calls: ${timing.callCount}`);

    // Flag potential O(n²) issues
    if (avgMs > 10) {
      console.log(`   ⚠️ WARNING: Average >10ms per call - potential O(n²) bottleneck`);
    }
    if (timing.maxMs > avgMs * 2) {
      console.log(`   ⚠️ WARNING: High variance (max ${(timing.maxMs/avgMs).toFixed(1)}x avg) - unstable performance`);
    }
  });

  // Analyze step timings
  const stepTimings = Array.from(phaseTimings.entries())
    .filter(([key]) => key.startsWith('TOTAL_STEP_'))
    .map(([key, timing]) => ({
      month: parseInt(key.replace('TOTAL_STEP_', '')),
      ...timing
    }))
    .sort((a, b) => b.totalMs - a.totalMs);

  console.log('\n🐌 SLOWEST INDIVIDUAL STEPS:');
  console.log('============================');

  stepTimings.slice(0, 5).forEach(step => {
    console.log(`  Month ${step.month}: ${step.totalMs.toFixed(2)}ms`);
  });

  // Performance recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('==================');

  const avgStepTime = totalTime / 12;
  if (avgStepTime > 500) {
    console.log('❌ CRITICAL: Average step time >500ms will make Monte Carlo infeasible');
    console.log('   Target: <100ms per step for N=100 Monte Carlo runs');
  } else if (avgStepTime > 200) {
    console.log('⚠️ WARNING: Average step time >200ms will make Monte Carlo slow');
    console.log('   Current: ~' + ((avgStepTime * 360 * 100) / 60000).toFixed(1) + ' minutes for N=100 Monte Carlo');
  } else {
    console.log('✅ Performance acceptable for Monte Carlo simulations');
    console.log('   Current: ~' + ((avgStepTime * 360 * 100) / 60000).toFixed(1) + ' minutes for N=100 Monte Carlo');
  }

  // Check for specific O(n²) patterns
  const suspectedOn2 = sortedPhases.filter(([name, timing]) => {
    const avgMs = timing.totalMs / timing.callCount;
    return avgMs > 5 && name.toLowerCase().includes('agent');
  });

  if (suspectedOn2.length > 0) {
    console.log('\n⚠️ SUSPECTED O(n²) BOTTLENECKS (agent-related phases >5ms):');
    suspectedOn2.forEach(([name]) => {
      console.log(`  - ${name}`);
    });
    console.log('\nRecommendation: Use indexing/caching to avoid nested loops');
  }

  // Save detailed report
  const report = {
    summary: {
      totalTimeMs: totalTime,
      monthsSimulated: 12,
      avgPerMonthMs: totalTime / 12,
      entityCounts,
      potentialOn2
    },
    phaseTimings: Object.fromEntries(
      Array.from(phaseTimings.entries())
        .filter(([key]) => !key.startsWith('TOTAL_STEP_'))
    ),
    stepTimings: stepTimings.map(s => ({
      month: s.month,
      timeMs: s.totalMs
    })),
    recommendations: []
  };

  const reportPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/performance_profile_${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Detailed report saved to: ${reportPath}`);
}

// Run profiling
profileSimulation().catch(console.error);