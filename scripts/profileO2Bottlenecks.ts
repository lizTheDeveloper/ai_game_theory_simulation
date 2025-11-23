#!/usr/bin/env npx tsx

/**
 * Script to profile and identify O(n²) performance bottlenecks
 * in the simulation engine, focusing on hot paths.
 */

import { createGameState } from '../src/simulation/initialization';
import { stepSimulation } from '../src/simulation/engine';
import { seededRandom } from '../src/simulation/random/seededRandom';

// Helper to measure function execution time
function profileFunction(name: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  return duration;
}

async function main() {
  console.log('\n=== O(n²) Performance Profiling ===\n');

  // Create a state with realistic agent/org counts
  const state = createGameState({
    seed: 12345,
    numAgents: 50,  // 50 agents
    numOrganizations: 200,  // 200 organizations - realistic simulation size
  });

  const rng = seededRandom(12345);

  // Warm up JIT
  console.log('Warming up...');
  for (let i = 0; i < 3; i++) {
    stepSimulation(state, rng);
  }

  // Profile 10 steps
  console.log('\nProfiling simulation steps...\n');

  const stepTimes: number[] = [];
  const phaseTimings: Record<string, number[]> = {};

  for (let step = 0; step < 10; step++) {
    const stepStart = performance.now();

    // Monkey-patch phase execution to measure individual phases
    const originalExecute = state.phaseOrchestrator?.executePhases;
    if (originalExecute && state.phaseOrchestrator) {
      state.phaseOrchestrator.executePhases = function(...args: any[]) {
        const phases = this.phases;
        phases.forEach((phase: any) => {
          const phaseTime = profileFunction(phase.name, () => {
            phase.execute(state, rng);
          });

          if (!phaseTimings[phase.name]) {
            phaseTimings[phase.name] = [];
          }
          phaseTimings[phase.name].push(phaseTime);
        });

        return { events: [] };
      };
    }

    stepSimulation(state, rng);

    const stepTime = performance.now() - stepStart;
    stepTimes.push(stepTime);

    console.log(`Step ${step + 1}: ${stepTime.toFixed(2)}ms`);
  }

  // Analysis
  console.log('\n=== Performance Analysis ===\n');

  // Calculate averages and identify bottlenecks
  const phaseAverages: Array<{ name: string; avg: number; total: number }> = [];

  for (const [phaseName, times] of Object.entries(phaseTimings)) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const total = times.reduce((a, b) => a + b, 0);
    phaseAverages.push({ name: phaseName, avg, total });
  }

  // Sort by average time
  phaseAverages.sort((a, b) => b.avg - a.avg);

  console.log('Top 10 Slowest Phases (by average time per step):');
  console.log('------------------------------------------------');

  phaseAverages.slice(0, 10).forEach((phase, i) => {
    console.log(`${i + 1}. ${phase.name}: ${phase.avg.toFixed(2)}ms avg, ${phase.total.toFixed(2)}ms total`);
  });

  const avgStepTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
  console.log(`\nAverage step time: ${avgStepTime.toFixed(2)}ms`);

  // Check for phases exceeding 10ms budget
  console.log('\n=== Phases Exceeding 10ms Budget ===');
  const violators = phaseAverages.filter(p => p.avg > 10);
  if (violators.length > 0) {
    violators.forEach(phase => {
      console.log(`❌ ${phase.name}: ${phase.avg.toFixed(2)}ms (${(phase.avg / 10).toFixed(1)}x over budget)`);
    });
  } else {
    console.log('✅ All phases within 10ms budget');
  }

  // Agent × Organization interaction analysis
  console.log('\n=== Agent × Organization Interaction Analysis ===');
  console.log(`Agents: ${state.aiAgents.length}`);
  console.log(`Organizations: ${state.organizations.length}`);
  console.log(`Potential O(n²) operations: ${state.aiAgents.length * state.organizations.length}`);

  // Look for specific O(n²) patterns
  console.log('\n=== Known O(n²) Patterns ===');

  // Check datacenter ownership lookups
  const dcCount = state.computeInfrastructure.dataCenters.length;
  console.log(`\n1. Datacenter ownership lookups:`);
  console.log(`   Datacenters: ${dcCount}`);
  console.log(`   Organizations: ${state.organizations.length}`);
  console.log(`   Potential O(n²) if using .find() + .includes(): ${dcCount * state.organizations.length} ops`);

  // Check collective membership
  const collectiveCount = state.aiCollectives?.length || 0;
  console.log(`\n2. AI Collective membership:`);
  console.log(`   Collectives: ${collectiveCount}`);
  console.log(`   Agents: ${state.aiAgents.length}`);
  console.log(`   Potential O(n²) if searching agents per collective: ${collectiveCount * state.aiAgents.length} ops`);

  // Check tech tree lookups
  const techCount = state.techTreeState?.unlockedTech?.length || 0;
  console.log(`\n3. Tech tree unlock checks:`);
  console.log(`   Unlocked tech: ${techCount}`);
  console.log(`   If checking .includes() in loops: O(n²) potential`);
}

main().catch(console.error);