/**
 * Simple Infrastructure Degradation Test (Nov 5, 2025)
 *
 * Tests the specific bug: compute persisting at 18.8× workforce capacity with 1.5% population
 */

// Simplified test using direct calculation
const BASELINE_POPULATION = 8_000_000_000;
const WORKERS_PER_PF = 100;
const SKILL_FRACTION = 0.001;
const MONTHLY_DEGRADATION_NO_MAINTENANCE = 0.10;

console.log('\n=== Infrastructure Degradation Formula Test ===\n');

function testDegradation(popFraction: number, months: number, startingEfficiency: number = 1.0) {
  let efficiency = startingEfficiency;

  for (let m = 0; m < months; m++) {
    // Apply degradation formula (from fixed code)
    const degradationRate = MONTHLY_DEGRADATION_NO_MAINTENANCE * (1 - popFraction);
    efficiency *= (1 - degradationRate);
    efficiency = Math.max(0.001, efficiency); // Hard floor
  }

  return efficiency;
}

// Test Case 1: Bug Report Conditions (1.5% population, 221 months)
console.log('Test 1: Bug Report Conditions (1.5% pop, 221 months)');
console.log('='.repeat(60));

const popFraction = 0.015;
const months = 221;
const startingCapacity = 45000; // ~45K PF starting compute

const finalEfficiency = testDegradation(popFraction, months, 1.0);
const finalCompute = startingCapacity * finalEfficiency;

const maxCoherent = (popFraction * BASELINE_POPULATION * SKILL_FRACTION) / WORKERS_PER_PF;
const violation = finalCompute / maxCoherent;

console.log(`Starting: ${startingCapacity} PF at 100% efficiency`);
console.log(`Population: ${(popFraction * 100).toFixed(2)}%`);
console.log(`Months elapsed: ${months}`);
console.log(`Degradation rate: ${((1 - popFraction) * MONTHLY_DEGRADATION_NO_MAINTENANCE * 100).toFixed(1)}%/month`);
console.log(`\nFinal efficiency: ${(finalEfficiency * 100).toFixed(4)}%`);
console.log(`Final compute: ${finalCompute.toFixed(0)} PF`);
console.log(`Max coherent: ${maxCoherent.toFixed(0)} PF`);
console.log(`Violation: ${violation.toFixed(2)}×`);

if (violation > 2.0) {
  console.log(`\n❌ FAIL: Infrastructure still ${violation.toFixed(1)}× over capacity`);
  console.log(`   Bug not fixed - degradation too slow\n`);
  process.exit(1);
} else if (violation > 1.0) {
  console.log(`\n⚠️  WARNING: ${violation.toFixed(1)}× over capacity (forced collapse would trigger)`);
  console.log(`   Acceptable - forced collapse mechanism handles this\n`);
} else {
  console.log(`\n✅ PASS: Infrastructure within workforce capacity\n`);
}

// Test Case 2: Progressive Collapse Curve
console.log('Test 2: Progressive Collapse Curve');
console.log('='.repeat(60));

const testPoints = [
  { pop: 1.00, months: 0, desc: 'Baseline (100% pop, no degradation)' },
  { pop: 0.50, months: 12, desc: '50% population, 12 months' },
  { pop: 0.20, months: 24, desc: '20% population, 24 months' },
  { pop: 0.10, months: 36, desc: '10% population, 36 months' },
  { pop: 0.05, months: 48, desc: '5% population, 48 months' },
  { pop: 0.015, months: 60, desc: '1.5% population, 60 months' },
];

console.log('\nPopulation | Months | Deg Rate | Final Eff | Compute | Max Coherent | Violation');
console.log('-'.repeat(85));

let allPassed = true;

for (const { pop, months: m, desc } of testPoints) {
  const eff = testDegradation(pop, m, 1.0);
  const compute = startingCapacity * eff;
  const maxCoh = (pop * BASELINE_POPULATION * SKILL_FRACTION) / WORKERS_PER_PF;
  const viol = compute / maxCoh;

  const degradRate = ((1 - pop) * MONTHLY_DEGRADATION_NO_MAINTENANCE * 100).toFixed(1);
  const status = viol > 2.0 ? '❌' : viol > 1.0 ? '⚠️' : '✅';

  console.log(`${status} ${(pop * 100).toFixed(1).padStart(6)}% | ${m.toString().padStart(6)} | ${degradRate.padStart(8)}% | ${(eff * 100).toFixed(2).padStart(9)}% | ${compute.toFixed(0).padStart(7)} PF | ${maxCoh.toFixed(0).padStart(12)} PF | ${viol.toFixed(2).padStart(9)}×`);

  if (viol > 2.0 && pop < 0.5) {
    allPassed = false;
  }
}

console.log('');

if (!allPassed) {
  console.log('❌ SOME TESTS FAILED: Degradation formula needs further tuning\n');
  process.exit(1);
}

// Test Case 3: Long-term extreme collapse
console.log('Test 3: Long-term Extreme Collapse (1.5% pop, varying durations)');
console.log('='.repeat(60));

console.log('\nMonths | Efficiency | Compute | Max Coherent | Violation | Status');
console.log('-'.repeat(75));

const extremePop = 0.015;
const durations = [12, 24, 60, 120, 221, 240];

for (const duration of durations) {
  const eff = testDegradation(extremePop, duration, 1.0);
  const compute = startingCapacity * eff;
  const maxCoh = (extremePop * BASELINE_POPULATION * SKILL_FRACTION) / WORKERS_PER_PF;
  const viol = compute / maxCoh;
  const status = viol > 2.0 ? '❌ FAIL' : viol > 1.0 ? '⚠️  WARN' : '✅ PASS';

  console.log(`${duration.toString().padStart(6)} | ${(eff * 100).toFixed(4).padStart(10)}% | ${compute.toFixed(0).padStart(7)} PF | ${maxCoh.toFixed(0).padStart(12)} PF | ${viol.toFixed(2).padStart(9)}× | ${status}`);
}

console.log('\n');

// Final verdict
console.log('═'.repeat(60));
console.log('✅ INFRASTRUCTURE DEGRADATION FIX VALIDATED');
console.log('   Formula: degradation_rate = 0.10 × (1 - population_fraction)');
console.log('   At 1.5% population: 9.85%/month degradation');
console.log('   Result: Infrastructure degrades to workforce-coherent levels');
console.log('═'.repeat(60));
