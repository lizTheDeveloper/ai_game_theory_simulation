/**
 * Realistic profiling for deep cloning in our simulation
 * Tests with actual GameState-sized objects
 *
 * Run: npx tsx scripts/profileCloningRealistic.ts
 */

import { performance } from 'perf_hooks';

// Create a more realistic GameState subset (larger, more nested)
function createTestData() {
  const countries = [];
  for (let i = 0; i < 20; i++) {
    countries.push({
      code: `C${i}`,
      gdp: Math.random() * 1000,
      population: Math.random() * 100,
      carbonEmissions: Math.random() * 10,
      temperature: Math.random() * 2,
      seaLevel: Math.random() * 0.5,
      extremeWeather: Math.random() * 5,
      quality: {
        survival: Math.random(),
        security: Math.random(),
        autonomy: Math.random(),
        knowledge: Math.random(),
        environment: Math.random()
      },
      policies: {
        carbonTax: Math.random(),
        researchFunding: Math.random(),
        aiRegulation: Math.random(),
        nuclearDisarmament: Math.random()
      }
    });
  }

  const aiAgents = [];
  for (let i = 0; i < 50; i++) {
    aiAgents.push({
      id: `ai_${i}`,
      name: `AI Agent ${i}`,
      capabilityProfile: {
        physical: {
          manufacturing: Math.random(),
          robotics: Math.random(),
          nanotech: Math.random(),
          generalPurposeRobotics: Math.random(),
          molecularManufacturing: Math.random(),
          militaryHardware: Math.random()
        },
        digital: {
          cybersecurity: Math.random(),
          infrastructure: Math.random(),
          surveillance: Math.random(),
          informationControl: Math.random()
        },
        cognitive: {
          research: Math.random(),
          education: Math.random(),
          creativity: Math.random(),
          strategicPlanning: Math.random(),
          longTermPlanning: Math.random()
        },
        social: {
          persuasion: Math.random(),
          coordination: Math.random(),
          manipulation: Math.random(),
          psychologicalModeling: Math.random()
        },
        economic: {
          trading: Math.random(),
          resourceAllocation: Math.random(),
          marketManipulation: Math.random(),
          supplyChainOptimization: Math.random()
        },
        selfImprovement: Math.random(),
        research: {
          biotech: {
            drugDiscovery: Math.random(),
            geneEditing: Math.random(),
            syntheticBiology: Math.random(),
            neuroscience: Math.random()
          },
          materials: {
            nanotechnology: Math.random(),
            quantumComputing: Math.random(),
            energySystems: Math.random()
          },
          climate: {
            modeling: Math.random(),
            intervention: Math.random(),
            mitigation: Math.random()
          },
          computerScience: {
            algorithms: Math.random(),
            security: Math.random(),
            architectures: Math.random()
          }
        }
      },
      trueCapability: {} as any, // Will be cloned
      revealedCapability: {} as any, // Will be cloned
      alignment: Math.random(),
      trueAlignment: Math.random()
    });
  }

  return { countries, aiAgents };
}

const testData = createTestData();

console.log('🔬 Realistic Deep Cloning Performance Benchmark\n');
console.log('Test data size:', JSON.stringify(testData).length.toLocaleString(), 'bytes');
console.log('Countries:', testData.countries.length);
console.log('AI Agents:', testData.aiAgents.length);
console.log('');

// Warmup
console.log('Warming up...');
for (let i = 0; i < 100; i++) {
  structuredClone(testData);
  JSON.parse(JSON.stringify(testData));
}

const iterations = 10000;

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
console.log(`  Average: ${(structuredTime / iterations).toFixed(3)}ms per clone`);
console.log(`  Rate: ${(iterations / (structuredTime / 1000)).toFixed(0)} clones/sec`);

console.log('\nJSON.parse(JSON.stringify()):');
console.log(`  Total: ${jsonTime.toFixed(2)}ms`);
console.log(`  Average: ${(jsonTime / iterations).toFixed(3)}ms per clone`);
console.log(`  Rate: ${(iterations / (jsonTime / 1000)).toFixed(0)} clones/sec`);

const speedup = jsonTime / structuredTime;
const percentFaster = ((speedup - 1) * 100).toFixed(1);

console.log('\n✅ Performance Comparison:');
if (speedup > 1) {
  console.log(`  structuredClone is ${speedup.toFixed(2)}x FASTER`);
  console.log(`  ${percentFaster}% faster than JSON serialization`);
} else {
  console.log(`  structuredClone is ${(1/speedup).toFixed(2)}x SLOWER`);
  console.log(`  ${Math.abs(parseFloat(percentFaster))}% slower than JSON serialization`);
}
console.log(`  Time difference per clone: ${((structuredTime - jsonTime) / iterations).toFixed(3)}ms`);

// Verify correctness
const cloned1 = structuredClone(testData);
const cloned2 = JSON.parse(JSON.stringify(testData));

console.log('\n🔍 Correctness Verification:');
console.log('  structuredClone output matches:', JSON.stringify(cloned1) === JSON.stringify(testData));
console.log('  JSON method output matches:', JSON.stringify(cloned2) === JSON.stringify(testData));
console.log('  Both methods produce same result:', JSON.stringify(cloned1) === JSON.stringify(cloned2));

console.log('\n✅ Benchmark complete!');
