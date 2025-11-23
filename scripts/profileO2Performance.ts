#!/usr/bin/env npx tsx

/**
 * Script to profile and identify O(n²) performance bottlenecks
 * in the simulation engine, focusing on hot paths.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { stepSimulation, SeededRandom } from '../src/simulation/engine';
import { mulberry32 } from '../src/simulation/utils/math';

interface PhaseProfile {
  name: string;
  times: number[];
  avgTime: number;
  maxTime: number;
  totalTime: number;
}

async function main() {
  console.log('\n=== O(n²) Performance Bottleneck Analysis ===\n');

  // Create a state with realistic agent/org counts
  const rngFn = mulberry32(12345);
  const state = createDefaultInitialState(rngFn, 'historical');

  // Add more agents and organizations for O(n²) analysis
  // Default state has fewer, we need to stress test
  while (state.aiAgents.length < 50) {
    state.aiAgents.push({
      ...state.aiAgents[0],
      id: `agent_${state.aiAgents.length}`,
      name: `Test Agent ${state.aiAgents.length}`
    });
  }

  while (state.organizations.length < 200) {
    state.organizations.push({
      ...state.organizations[0],
      id: `org_${state.organizations.length}`,
      name: `Test Org ${state.organizations.length}`
    });
  }

  const rng = new SeededRandom(12345);

  // Warm up JIT compiler
  console.log('Warming up JIT compiler...');
  for (let i = 0; i < 3; i++) {
    stepSimulation(state, rng);
  }

  // Profile 10 simulation steps
  console.log('\nProfiling 10 simulation steps...\n');

  const stepTimes: number[] = [];
  const phaseProfiles = new Map<string, PhaseProfile>();

  for (let step = 0; step < 10; step++) {
    const stepStart = performance.now();

    // Hook into phase execution to measure timings
    const orchestrator = (state as any).phaseOrchestrator;
    if (orchestrator && orchestrator.phases) {
      const originalExecute = orchestrator.executePhases.bind(orchestrator);

      orchestrator.executePhases = function(state: any, rngFn: any, context?: any) {
        const result = { events: [] as any[] };

        for (const phase of this.phases) {
          const phaseStart = performance.now();
          const phaseResult = phase.execute(state, rngFn, context);
          const phaseTime = performance.now() - phaseStart;

          if (!phaseProfiles.has(phase.name)) {
            phaseProfiles.set(phase.name, {
              name: phase.name,
              times: [],
              avgTime: 0,
              maxTime: 0,
              totalTime: 0
            });
          }

          const profile = phaseProfiles.get(phase.name)!;
          profile.times.push(phaseTime);
          profile.totalTime += phaseTime;
          profile.maxTime = Math.max(profile.maxTime, phaseTime);

          if (phaseResult?.events) {
            result.events.push(...phaseResult.events);
          }
        }

        return result;
      };
    }

    stepSimulation(state, rng);

    const stepTime = performance.now() - stepStart;
    stepTimes.push(stepTime);

    console.log(`Step ${step + 1}: ${stepTime.toFixed(2)}ms`);
  }

  // Calculate averages
  for (const profile of phaseProfiles.values()) {
    profile.avgTime = profile.totalTime / profile.times.length;
  }

  console.log('\n=== Performance Analysis ===\n');

  // Sort by average time
  const sortedProfiles = Array.from(phaseProfiles.values())
    .sort((a, b) => b.avgTime - a.avgTime);

  console.log('Top 10 Slowest Phases (avg ms per step):');
  console.log('═'.repeat(60));

  sortedProfiles.slice(0, 10).forEach((phase, i) => {
    const overBudget = phase.avgTime > 10 ? ' ⚠️ OVER BUDGET' : '';
    console.log(
      `${(i + 1).toString().padStart(2)}. ${phase.name.padEnd(35)} ${phase.avgTime.toFixed(2).padStart(8)}ms${overBudget}`
    );
  });

  const avgStepTime = stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length;
  console.log(`\nAverage step time: ${avgStepTime.toFixed(2)}ms`);
  console.log(`Total phases: ${phaseProfiles.size}`);

  // Identify phases exceeding 10ms budget
  console.log('\n=== Phases Exceeding 10ms Budget ===');
  const violators = sortedProfiles.filter(p => p.avgTime > 10);
  if (violators.length > 0) {
    console.log('═'.repeat(60));
    violators.forEach(phase => {
      const factor = (phase.avgTime / 10).toFixed(1);
      console.log(`❌ ${phase.name}: ${phase.avgTime.toFixed(2)}ms (${factor}x over budget)`);
    });
  } else {
    console.log('✅ All phases within 10ms budget');
  }

  // Analyze O(n²) complexity indicators
  console.log('\n=== O(n²) Complexity Analysis ===');
  console.log('═'.repeat(60));

  const agentCount = state.aiAgents.length;
  const orgCount = state.organizations.length;
  const dcCount = state.computeInfrastructure.dataCenters.length;
  const collectiveCount = state.aiCollectives?.length || 0;
  const techCount = state.techTreeState?.unlockedTech?.length || 0;

  console.log(`State dimensions:`);
  console.log(`  Agents: ${agentCount}`);
  console.log(`  Organizations: ${orgCount}`);
  console.log(`  Data Centers: ${dcCount}`);
  console.log(`  AI Collectives: ${collectiveCount}`);
  console.log(`  Unlocked Tech: ${techCount}`);

  console.log(`\nPotential O(n²) operations:`);
  console.log(`  Agent × Organization: ${agentCount * orgCount} potential ops`);
  console.log(`  Agent × Agent: ${agentCount * agentCount} potential ops`);
  console.log(`  DC × Organization ownership: ${dcCount * orgCount} potential ops`);
  console.log(`  Collective × Agent membership: ${collectiveCount * agentCount} potential ops`);

  // Identify specific known O(n²) patterns
  console.log('\n=== Known O(n²) Patterns to Check ===');
  console.log('═'.repeat(60));

  console.log('\n1. DATACENTER OWNERSHIP LOOKUPS');
  console.log('   Pattern: dataCenters.filter(dc => orgs.find(o => o.ownedDCs.includes(dc.id)))');
  console.log('   Files: agents/governmentAgent.ts (lines 1497, 1508, 1522)');
  console.log('   Impact: ' + (dcCount * orgCount) + ' ops per lookup');
  console.log('   Fix: Build ownership index Map<dcId, orgId> once per step');

  console.log('\n2. COLLECTIVE MEMBERSHIP');
  console.log('   Pattern: agents.find(a => a.id === agentId) inside collective loops');
  console.log('   Files: collectiveFormation.ts (line 196)');
  console.log('   Impact: ' + (collectiveCount * agentCount) + ' ops per update');
  console.log('   Fix: Build agent index Map<agentId, agent> once per step');

  console.log('\n3. TECH UNLOCK CHECKS');
  console.log('   Pattern: unlockedTech.includes(techId) in loops');
  console.log('   Files: techTree/engine.ts, nitrogenFoodCoupling.ts');
  console.log('   Impact: O(n) per check, O(n²) if in loop');
  console.log('   Fix: Use Set<techId> instead of array');

  console.log('\n4. ORGANIZATION COMPETITION CHECK');
  console.log('   Pattern: orgs.filter().some(o => o.projects.some())');
  console.log('   Files: organizationManagement.ts (line 109)');
  console.log('   Impact: ' + (orgCount * orgCount) + ' ops in worst case');
  console.log('   Fix: Track competitors building DCs in separate index');

  console.log('\n5. AGENT-ORGANIZATION COMPUTE UTILIZATION');
  console.log('   Note: Already optimized in organizationManagement.ts (lines 44-64)');
  console.log('   Uses Set for O(1) lookups instead of array.includes()');

  // Summary recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('═'.repeat(60));

  const criticalBottlenecks = violators.filter(p => p.avgTime > 50);
  const highBottlenecks = violators.filter(p => p.avgTime > 20 && p.avgTime <= 50);
  const mediumBottlenecks = violators.filter(p => p.avgTime > 10 && p.avgTime <= 20);

  if (criticalBottlenecks.length > 0) {
    console.log('\nCRITICAL (>50ms): Immediate optimization required');
    criticalBottlenecks.forEach(p => console.log(`  - ${p.name}: ${p.avgTime.toFixed(2)}ms`));
  }

  if (highBottlenecks.length > 0) {
    console.log('\nHIGH (20-50ms): Should optimize soon');
    highBottlenecks.forEach(p => console.log(`  - ${p.name}: ${p.avgTime.toFixed(2)}ms`));
  }

  if (mediumBottlenecks.length > 0) {
    console.log('\nMEDIUM (10-20ms): Monitor and optimize if worsens');
    mediumBottlenecks.forEach(p => console.log(`  - ${p.name}: ${p.avgTime.toFixed(2)}ms`));
  }

  console.log('\nOptimization priority:');
  console.log('1. Build lookup indices at step start (Maps/Sets)');
  console.log('2. Replace array.includes() with Set.has()');
  console.log('3. Cache expensive computations within steps');
  console.log('4. Consider lazy evaluation for rarely-used calculations');
}

main().catch(console.error);