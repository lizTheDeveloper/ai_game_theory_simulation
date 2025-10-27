import { createDefaultInitialState } from '../src/simulation/initialization';

const state = createDefaultInitialState();

const counts = {
  deployed_closed: 0,
  deployed_open: 0,
  testing: 0,
  training: 0,
  retired: 0,
  escaped: 0
};

for (const agent of state.aiAgents) {
  counts[agent.lifecycleState]++;
}

console.log('\n🔬 LIFECYCLE DISTRIBUTION TEST');
console.log('================================');
console.log(`Total agents: ${state.aiAgents.length}`);
console.log('\nCounts:');
console.log(`  deployed_closed: ${counts.deployed_closed} (${(counts.deployed_closed/state.aiAgents.length*100).toFixed(1)}%)`);
console.log(`  deployed_open:   ${counts.deployed_open} (${(counts.deployed_open/state.aiAgents.length*100).toFixed(1)}%)`);
console.log(`  testing:         ${counts.testing} (${(counts.testing/state.aiAgents.length*100).toFixed(1)}%)`);
console.log(`  training:        ${counts.training} (${(counts.training/state.aiAgents.length*100).toFixed(1)}%)`);
console.log(`  retired:         ${counts.retired} (${(counts.retired/state.aiAgents.length*100).toFixed(1)}%)`);
console.log(`  escaped:         ${counts.escaped} (${(counts.escaped/state.aiAgents.length*100).toFixed(1)}%)`);
console.log('\nExpected distribution (frontier AI 2025):');
console.log('  deployed_closed: 50%');
console.log('  deployed_open:   30%');
console.log('  testing:         15%');
console.log('  training:        5%');
console.log('\n✅ Test complete\n');
