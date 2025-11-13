#!/usr/bin/env npx tsx
/**
 * Performance Profiling Script (HIGH-1 Phase 1)
 *
 * Profiles simulation performance using PhaseOrchestrator's built-in instrumentation.
 * Runs full 360-month simulation with timing data collection.
 *
 * UPDATED: Nov 13, 2025 - Use built-in instrumentation instead of monkey-patching
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import * as fs from 'fs';

async function profileSimulation() {
  console.log('🔍 PERFORMANCE PROFILING STARTED (HIGH-1 Phase 1)');
  console.log('=================================================\n');

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const monthsArg = args.find(arg => arg.startsWith('--months='));
  const monthsToSimulate = monthsArg ? parseInt(monthsArg.split('=')[1]) : 360;

  // Create deterministic seed
  const seed = 42;

  // Simple RNG function for initialization (DETERMINISM: seeded)
  let rngSeed = seed;
  const rngFunction = () => {
    rngSeed = (rngSeed * 1664525 + 1013904223) % (2**32);
    return rngSeed / (2**32);
  };

  console.log(`Creating initial state (seed=${seed})...`);
  const initialState = createDefaultInitialState(rngFunction);

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

  console.log(`\nRunning simulation for ${monthsToSimulate} months...`);
  console.log('(Built-in PhaseOrchestrator instrumentation enabled)\n');
  const startTime = performance.now();

  // Create simulation engine WITH PROFILING ENABLED
  const engine = new SimulationEngine({ seed, maxMonths: monthsToSimulate, logLevel: 'summary' });

  // Enable performance timing on orchestrator (uses built-in instrumentation)
  engine.orchestrator.enablePerformanceTiming();
  engine.orchestrator.setSlowPhaseThreshold(10); // 10ms budget per phase

  // Run simulation for N months
  let currentState = initialState;
  for (let month = 0; month < monthsToSimulate; month++) {
    const result = engine.step(currentState);
    currentState = result.state;
  }

  const finalState = currentState;

  const totalTime = performance.now() - startTime;

  // GET TIMING DATA from PhaseOrchestrator's built-in instrumentation
  const phaseTimings = engine.orchestrator.getPhaseTimings();
  const stepTimings = engine.orchestrator.getStepTimings();

  // Analyze results
  console.log('\n================================');
  console.log('📊 PERFORMANCE ANALYSIS COMPLETE');
  console.log('================================\n');

  console.log(`Total simulation time: ${totalTime.toFixed(2)}ms (${(totalTime/1000).toFixed(2)}s)`);
  console.log(`Average per month: ${(totalTime/monthsToSimulate).toFixed(2)}ms`);
  console.log(`Simulated months per second: ${((monthsToSimulate*1000)/totalTime).toFixed(2)}`);

  // Print built-in timing report
  engine.orchestrator.printPhaseTimings();

  // Additional analysis: Identify phases exceeding 10ms budget
  const slowPhases: Array<{ name: string; avgMs: number; maxMs: number; p95Ms: number }> = [];

  for (const [name, data] of phaseTimings.entries()) {
    const avgMs = data.totalMs / data.callCount;
    const sorted = [...data.samples].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const p95Ms = sorted[Math.max(0, p95Index)];

    if (avgMs > 10 || p95Ms > 10 || data.maxMs > 10) {
      slowPhases.push({ name, avgMs, maxMs: data.maxMs, p95Ms });
    }
  }

  if (slowPhases.length > 0) {
    console.log('\n⚠️  PHASES EXCEEDING 10ms BUDGET:');
    console.log('================================');
    slowPhases.sort((a, b) => b.avgMs - a.avgMs);
    slowPhases.forEach(phase => {
      console.log(`\n  ${phase.name}`);
      console.log(`    Avg: ${phase.avgMs.toFixed(2)}ms`);
      console.log(`    P95: ${phase.p95Ms.toFixed(2)}ms`);
      console.log(`    Max: ${phase.maxMs.toFixed(2)}ms`);
    });
  } else {
    console.log('\n✅ All phases within 10ms budget');
  }

  // Step timing analysis
  if (stepTimings.length > 0) {
    const stepTotals = stepTimings.map(s => s.totalMs);
    const avgStep = stepTotals.reduce((a, b) => a + b, 0) / stepTotals.length;
    const maxStep = Math.max(...stepTotals);
    const minStep = Math.min(...stepTotals);

    console.log('\n📊 STEP TIMING SUMMARY:');
    console.log('======================');
    console.log(`  Avg: ${avgStep.toFixed(2)}ms`);
    console.log(`  Max: ${maxStep.toFixed(2)}ms (Month ${stepTimings.find(s => s.totalMs === maxStep)?.month})`);
    console.log(`  Min: ${minStep.toFixed(2)}ms (Month ${stepTimings.find(s => s.totalMs === minStep)?.month})`);

    // Performance assessment
    console.log('\n💡 PERFORMANCE ASSESSMENT:');
    console.log('=========================');

    if (avgStep > 500) {
      console.log('❌ CRITICAL: Average step >500ms makes Monte Carlo infeasible');
      console.log(`   Current: ~${((avgStep * 360 * 100) / 60000).toFixed(1)} minutes for N=100 Monte Carlo`);
      console.log('   Target: <100ms per step');
    } else if (avgStep > 200) {
      console.log('⚠️  WARNING: Average step >200ms will make Monte Carlo slow');
      console.log(`   Current: ~${((avgStep * 360 * 100) / 60000).toFixed(1)} minutes for N=100 Monte Carlo`);
      console.log('   Target: <100ms per step');
    } else if (avgStep > 50) {
      console.log('✅ Performance acceptable but could be improved');
      console.log(`   Current: ~${((avgStep * 360 * 100) / 60000).toFixed(1)} minutes for N=100 Monte Carlo`);
      console.log('   Target: <50ms per step (stretch goal)');
    } else {
      console.log('✅ Excellent performance');
      console.log(`   Current: ~${((avgStep * 360 * 100) / 60000).toFixed(1)} minutes for N=100 Monte Carlo`);
    }
  }

  // Save detailed reports (JSON + CSV)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const jsonPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/performance_profile_${timestamp}.json`;
  const csvPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/performance_profile_${timestamp}.csv`;

  // Export using built-in methods
  const jsonData = engine.orchestrator.exportPhaseTimingsJSON();
  const csvData = engine.orchestrator.exportPhaseTimingsCSV();

  fs.writeFileSync(jsonPath, jsonData);
  fs.writeFileSync(csvPath, csvData);

  console.log(`\n📁 Detailed reports saved:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   CSV: ${csvPath}`);
}

// Run profiling
profileSimulation().catch(console.error);