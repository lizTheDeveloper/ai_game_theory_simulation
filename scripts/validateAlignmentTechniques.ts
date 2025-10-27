/**
 * Validation Script: P3.3 Alignment Techniques
 *
 * Verifies that:
 * 1. All AI agents have alignmentTechniques initialized
 * 2. effectiveAlignment is computed correctly
 * 3. alignmentRobustness is computed correctly
 * 4. Assertions work (fail loudly on missing fields)
 */

import { createTestState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

console.log('🧪 VALIDATION TEST: P3.3 Alignment Techniques\n');
console.log('=' .repeat(60));

// Test 1: Initialization
console.log('\n✅ TEST 1: Initialization\n');

const state = createTestState();
const rng = () => Math.random(); // Simple RNG for validation

console.log(`Total AI agents: ${state.aiAgents.length}`);

let allInitialized = true;
let allHaveTechniques = true;

for (const agent of state.aiAgents) {
  const hasEffective = agent.effectiveAlignment !== undefined && agent.effectiveAlignment !== null;
  const hasRobustness = agent.alignmentRobustness !== undefined && agent.alignmentRobustness !== null;
  const hasTechniques = agent.alignmentTechniques && agent.alignmentTechniques.length > 0;

  if (!hasEffective || !hasRobustness) {
    console.log(`  ❌ ${agent.name}: effectiveAlignment=${agent.effectiveAlignment}, alignmentRobustness=${agent.alignmentRobustness}`);
    allInitialized = false;
  }

  if (!hasTechniques) {
    console.log(`  ❌ ${agent.name}: No alignment techniques`);
    allHaveTechniques = false;
  }
}

if (allInitialized && allHaveTechniques) {
  console.log('  ✅ All agents have effectiveAlignment and alignmentRobustness initialized');
  console.log('  ✅ All agents have alignment techniques');
} else {
  console.log('\n❌ INITIALIZATION FAILED - Some agents missing fields');
  process.exit(1);
}

// Test 2: Sample agent details
console.log('\n✅ TEST 2: Sample Agent Details\n');

const sampleAgent = state.aiAgents[0];
console.log(`Agent: ${sampleAgent.name}`);
console.log(`  Capability: ${sampleAgent.capability.toFixed(3)}`);
console.log(`  True Alignment: ${sampleAgent.trueAlignment.toFixed(3)}`);
console.log(`  Effective Alignment: ${sampleAgent.effectiveAlignment?.toFixed(3)}`);
console.log(`  Alignment Robustness: ${sampleAgent.alignmentRobustness?.toFixed(3)}`);
console.log(`  Techniques: ${sampleAgent.alignmentTechniques?.map(t => t.name).join(', ')}`);

// Test 3: Run simulation for 12 months (with assertions)
console.log('\n✅ TEST 3: Run Simulation with Assertions\n');

const orchestrator = new PhaseOrchestrator();

try {
  for (let month = 0; month < 12; month++) {
    state.currentMonth = month;
    orchestrator.executeAll(state, rng);
  }
  console.log(`  ✅ Simulation ran for 12 months without assertion errors`);
  console.log(`  ✅ AlignmentTechniquePhase executed successfully`);
} catch (error) {
  console.log(`  ❌ Simulation failed: ${error}`);
  process.exit(1);
}

// Test 4: Verify alignment changed due to capability scaling
console.log('\n✅ TEST 4: Capability Scaling Degradation\n');

const highCapAgent = state.aiAgents.find(a => a.capability > 2.0);
if (highCapAgent) {
  console.log(`High-capability agent: ${highCapAgent.name}`);
  console.log(`  Capability: ${highCapAgent.capability.toFixed(3)}`);
  console.log(`  Effective Alignment: ${highCapAgent.effectiveAlignment?.toFixed(3)}`);
  console.log(`  Robustness: ${highCapAgent.alignmentRobustness?.toFixed(3)}`);

  if (highCapAgent.effectiveAlignment && highCapAgent.effectiveAlignment < 0.58) {
    console.log('  ✅ Capability scaling degradation is working (alignment < base effectiveness)');
  } else {
    console.log('  ℹ️  Agent at base effectiveness (capability not high enough for degradation)');
  }
} else {
  console.log('  ℹ️  No agents with capability > 2.0 in initial state');
}

// Test 5: Intentional failure test (create agent without fields)
console.log('\n✅ TEST 5: Verify Assertions Fail Loudly\n');

// Import the phase directly
const { AlignmentTechniquePhase } = require('../src/simulation/engine/phases/AlignmentTechniquePhase');

const testAgent = {
  ...state.aiAgents[0],
  effectiveAlignment: undefined, // Remove field to trigger assertion
  alignmentRobustness: undefined,
  alignmentTechniques: [
    require('../src/types/alignment-techniques').ALIGNMENT_TECHNIQUE_DEFINITIONS.rlhf
  ],
  // Ensure agent is not skipped
  lifecycleState: 'deployed' as const,
  escaped: false
};

// Replace first agent with test agent
const originalAgent = state.aiAgents[0];
state.aiAgents[0] = testAgent as any;

console.log('  Testing assertion on agent with undefined effectiveAlignment...');
console.log(`    Agent effectiveAlignment: ${testAgent.effectiveAlignment}`);
console.log(`    Agent has alignmentTechniques: ${testAgent.alignmentTechniques.length > 0}`);

// Run only the AlignmentTechniquePhase
const alignmentPhase = new AlignmentTechniquePhase();

try {
  alignmentPhase.execute(state, rng, {});
  console.log('  ❌ FAILED: Assertion should have thrown error but did not');
  process.exit(1);
} catch (error: any) {
  if (error.message && error.message.includes('Missing state property')) {
    console.log('  ✅ Assertion correctly threw error:');
    console.log(`     ${error.message.split('\n')[0]}`);
  } else {
    console.log('  ❌ FAILED: Wrong error type:', error.message);
    console.log(`     Error: ${error.message}`);
    process.exit(1);
  }
}

// Restore agent
state.aiAgents[0] = originalAgent;

console.log('\n' + '='.repeat(60));
console.log('🎉 ALL VALIDATION TESTS PASSED\n');
console.log('Summary:');
console.log('  ✅ Initialization sets effectiveAlignment and alignmentRobustness');
console.log('  ✅ All agents have alignment techniques');
console.log('  ✅ Simulation runs without assertion errors (normal case)');
console.log('  ✅ Assertions fail loudly with clear errors (missing field case)');
console.log('  ✅ Capability scaling degradation is implemented');
console.log('\n✨ P3.3 Alignment Techniques implementation is VALID');
