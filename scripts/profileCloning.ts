/**
 * Profiling script for deep cloning performance
 * Compares structuredClone vs JSON.parse(JSON.stringify())
 *
 * Run: npx tsx scripts/profileCloning.ts
 */

import { performance } from 'perf_hooks';

// Test data: typical AICapabilityProfile structure
const testData = {
  physical: {
    manufacturing: 0.5,
    robotics: 0.3,
    nanotech: 0.1,
    generalPurposeRobotics: 0.4,
    molecularManufacturing: 0.05,
    militaryHardware: 0.35
  },
  digital: {
    cybersecurity: 0.6,
    infrastructure: 0.4,
    surveillance: 0.5,
    informationControl: 0.45
  },
  cognitive: {
    research: 0.7,
    education: 0.5,
    creativity: 0.3,
    strategicPlanning: 0.6,
    longTermPlanning: 0.55
  },
  social: {
    persuasion: 0.4,
    coordination: 0.6,
    manipulation: 0.35,
    psychologicalModeling: 0.5
  },
  economic: {
    trading: 0.5,
    resourceAllocation: 0.4,
    marketManipulation: 0.3,
    supplyChainOptimization: 0.45
  },
  selfImprovement: 0.4,
  research: {
    biotech: {
      drugDiscovery: 0.5,
      geneEditing: 0.3,
      syntheticBiology: 0.2,
      neuroscience: 0.4
    },
    materials: {
      nanotechnology: 0.25,
      quantumComputing: 0.15,
      energySystems: 0.35
    },
    climate: {
      modeling: 0.6,
      intervention: 0.3,
      mitigation: 0.4
    },
    computerScience: {
      algorithms: 0.7,
      security: 0.6,
      architectures: 0.5
    }
  }
};

console.log('🔬 Deep Cloning Performance Benchmark\n');
console.log('Test data size:', JSON.stringify(testData).length, 'bytes\n');

// Warmup (ensure JIT compilation)
console.log('Warming up...');
for (let i = 0; i < 1000; i++) {
  structuredClone(testData);
  JSON.parse(JSON.stringify(testData));
}

const iterations = 100000;

// Benchmark structuredClone
console.log(`\nBenchmarking structuredClone (${iterations} iterations)...`);
const structuredStart = performance.now();
for (let i = 0; i < iterations; i++) {
  structuredClone(testData);
}
const structuredEnd = performance.now();
const structuredTime = structuredEnd - structuredStart;

// Benchmark JSON.parse(JSON.stringify())
console.log(`Benchmarking JSON.parse(JSON.stringify()) (${iterations} iterations)...`);
const jsonStart = performance.now();
for (let i = 0; i < iterations; i++) {
  JSON.parse(JSON.stringify(testData));
}
const jsonEnd = performance.now();
const jsonTime = jsonEnd - jsonStart;

// Results
console.log('\n📊 Results:\n');
console.log('structuredClone:');
console.log(`  Total: ${structuredTime.toFixed(2)}ms`);
console.log(`  Average: ${((structuredTime / iterations) * 1000).toFixed(2)}μs per clone`);
console.log(`  Rate: ${(iterations / (structuredTime / 1000)).toFixed(0)} clones/sec`);

console.log('\nJSON.parse(JSON.stringify()):');
console.log(`  Total: ${jsonTime.toFixed(2)}ms`);
console.log(`  Average: ${((jsonTime / iterations) * 1000).toFixed(2)}μs per clone`);
console.log(`  Rate: ${(iterations / (jsonTime / 1000)).toFixed(0)} clones/sec`);

const speedup = jsonTime / structuredTime;
const percentFaster = ((speedup - 1) * 100).toFixed(1);

console.log('\n✅ Performance Improvement:');
console.log(`  structuredClone is ${speedup.toFixed(2)}x faster`);
console.log(`  ${percentFaster}% faster than JSON serialization`);
console.log(`  Time saved per clone: ${((jsonTime - structuredTime) / iterations * 1000).toFixed(2)}μs`);

// Estimate simulation impact
const clonesPerSimulation = 15000; // 5 clones/AI/month × 50 AIs × 60 months
const timeSavedMs = ((jsonTime - structuredTime) / iterations) * clonesPerSimulation;
console.log('\n🎮 Estimated Simulation Impact:');
console.log(`  Clones per simulation: ~${clonesPerSimulation.toLocaleString()}`);
console.log(`  Time saved per simulation: ${timeSavedMs.toFixed(1)}ms`);
console.log(`  Time saved per 100 runs: ${(timeSavedMs * 100 / 1000).toFixed(1)}s`);

// Verify correctness
const original = testData;
const cloned1 = structuredClone(original);
const cloned2 = JSON.parse(JSON.stringify(original));

console.log('\n🔍 Correctness Verification:');
console.log('  structuredClone output matches:', JSON.stringify(cloned1) === JSON.stringify(original));
console.log('  JSON method output matches:', JSON.stringify(cloned2) === JSON.stringify(original));
console.log('  Both methods produce same result:', JSON.stringify(cloned1) === JSON.stringify(cloned2));

console.log('\n✅ Benchmark complete!');
