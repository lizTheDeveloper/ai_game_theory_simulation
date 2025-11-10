#!/usr/bin/env npx tsx
/**
 * Performance Profiling Script
 *
 * Runs a simulation with performance timing enabled to identify
 * the slowest phases and potential O(n²) bottlenecks.
 */

import { createSeededRandom } from '../src/simulation/utils/deterministicRng';
import { initializeGame } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { promises as fs } from 'fs';
import * as path from 'path';

async function profilePerformance() {
  console.log('\n📊 PERFORMANCE PROFILING ANALYSIS');
  console.log('='.repeat(80));
  console.log('Running simulation to identify performance bottlenecks...\n');

  // Initialize with deterministic seed
  const seed = 42;

  // Create simulation engine
  const engine = new SimulationEngine({
    seed,
    runLabel: 'PERF-PROFILE'
  });

  // Get the orchestrator from the engine to enable timing
  // We need to access the private orchestrator field
  const orchestrator = (engine as any).orchestrator as PhaseOrchestrator;

  // Enable performance timing
  orchestrator.enablePerformanceTiming();

  console.log(`Total phases registered: ${orchestrator.getPhaseCount()}\n`);

  // Run simulation for 12 months to get meaningful data
  const monthsToRun = 12;
  console.log(`Running simulation for ${monthsToRun} months...\n`);

  const stepTimes: number[] = [];

  for (let month = 0; month < monthsToRun; month++) {
    const stepStart = performance.now();

    try {
      engine.step();
    } catch (error) {
      console.error(`\n❌ Error during month ${month + 1}:`, error);
      break;
    }

    const stepTime = performance.now() - stepStart;
    stepTimes.push(stepTime);

    // Progress indicator
    process.stdout.write(`\rMonth ${month + 1}/${monthsToRun} (${stepTime.toFixed(1)}ms)`);
  }

  console.log('\n');

  // Get and analyze timing data
  const timings = orchestrator.getPhaseTimings();

  // Convert to sorted array
  const sortedTimings = Array.from(timings.entries())
    .map(([name, data]) => ({
      phaseName: name,
      totalMs: data.totalMs,
      callCount: data.callCount,
      avgMs: data.totalMs / data.callCount
    }))
    .sort((a, b) => b.totalMs - a.totalMs);

  // Print detailed report
  orchestrator.printPhaseTimings();

  // Analysis sections
  console.log('\n' + '='.repeat(80));
  console.log('📊 PERFORMANCE ANALYSIS RESULTS');
  console.log('='.repeat(80));

  // 1. Step-level statistics
  const avgStepTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
  const maxStepTime = Math.max(...stepTimes);
  const minStepTime = Math.min(...stepTimes);

  console.log('\n📈 STEP EXECUTION STATISTICS:');
  console.log(`   Average step time: ${avgStepTime.toFixed(1)}ms`);
  console.log(`   Maximum step time: ${maxStepTime.toFixed(1)}ms`);
  console.log(`   Minimum step time: ${minStepTime.toFixed(1)}ms`);

  // 2. Identify critical hotspots (>50ms total)
  const criticalPhases = sortedTimings.filter(t => t.totalMs > 50);
  if (criticalPhases.length > 0) {
    console.log('\n🔴 CRITICAL PERFORMANCE ISSUES (>50ms total):');
    criticalPhases.forEach((phase, i) => {
      console.log(`   ${i + 1}. ${phase.phaseName}: ${phase.totalMs.toFixed(1)}ms total, ${phase.avgMs.toFixed(2)}ms/call`);
    });
  }

  // 3. High priority issues (10-50ms per call)
  const highPriorityPhases = sortedTimings.filter(t => t.avgMs >= 10 && t.avgMs < 50);
  if (highPriorityPhases.length > 0) {
    console.log('\n🟠 HIGH PRIORITY ISSUES (10-50ms per call):');
    highPriorityPhases.forEach((phase, i) => {
      console.log(`   ${i + 1}. ${phase.phaseName}: ${phase.avgMs.toFixed(2)}ms/call (${phase.callCount} calls)`);
    });
  }

  // 4. Check for O(n²) symptoms
  console.log('\n🔍 O(n²) PATTERN DETECTION:');

  // Look for phases with very high execution times relative to others
  const totalTime = sortedTimings.reduce((sum, t) => sum + t.totalMs, 0);
  const suspiciousPhases = sortedTimings.filter(t => {
    const percentOfTotal = (t.totalMs / totalTime) * 100;
    return percentOfTotal > 10; // More than 10% of total time
  });

  if (suspiciousPhases.length > 0) {
    console.log('   Phases consuming >10% of total execution time:');
    suspiciousPhases.forEach(phase => {
      const pct = (phase.totalMs / totalTime * 100).toFixed(1);
      console.log(`   - ${phase.phaseName}: ${pct}% of total`);
    });
  } else {
    console.log('   ✅ No single phase dominates execution time');
  }

  // 5. Recommendations
  console.log('\n💡 RECOMMENDATIONS:');

  if (criticalPhases.length > 0) {
    console.log('\n   CRITICAL (Immediate attention required):');
    criticalPhases.slice(0, 3).forEach(phase => {
      console.log(`   - Optimize ${phase.phaseName} (currently ${phase.totalMs.toFixed(1)}ms)`);

      // Specific recommendations based on phase name patterns
      if (phase.phaseName.includes('AI') && phase.phaseName.includes('org')) {
        console.log('     → Likely agent×organization nested loop. Consider caching or indexing.');
      }
      if (phase.phaseName.includes('bilateral') || phase.phaseName.includes('interaction')) {
        console.log('     → Likely nation×nation nested loop. Pre-compute interaction matrix.');
      }
      if (phase.phaseName.includes('technology') && phase.phaseName.includes('boundary')) {
        console.log('     → Likely tech×boundary nested check. Use early termination or indexing.');
      }
    });
  }

  if (highPriorityPhases.length > 0) {
    console.log('\n   HIGH (Should be addressed soon):');
    highPriorityPhases.slice(0, 3).forEach(phase => {
      console.log(`   - Review ${phase.phaseName} for optimization opportunities`);
    });
  }

  // 6. Save detailed report
  const reportPath = path.join(process.cwd(), 'logs', `performance_profile_${Date.now()}.json`);
  const report = {
    metadata: {
      seed,
      monthsSimulated: monthsToRun,
      totalPhases: orchestrator.getPhaseCount(),
      timestamp: new Date().toISOString()
    },
    stepStatistics: {
      avgStepTime,
      maxStepTime,
      minStepTime,
      allStepTimes: stepTimes
    },
    phaseTimings: sortedTimings,
    criticalIssues: criticalPhases.map(p => ({
      phase: p.phaseName,
      totalMs: p.totalMs,
      avgMs: p.avgMs,
      severity: 'CRITICAL'
    })),
    highPriorityIssues: highPriorityPhases.map(p => ({
      phase: p.phaseName,
      avgMs: p.avgMs,
      severity: 'HIGH'
    }))
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📁 Detailed report saved to: ${reportPath}`);
  console.log('\n' + '='.repeat(80));
}

// Run profiling
profilePerformance().catch(error => {
  console.error('\n❌ Fatal error during profiling:', error);
  process.exit(1);
});