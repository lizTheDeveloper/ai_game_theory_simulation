/**
 * Debug Month 49 Termination Bug
 *
 * Run a single scenario to month 60 with verbose logging
 * to identify what causes termination at month 49
 */

import { runScenario } from './scenarioRunner';

console.log('\n='.repeat(80));
console.log('DEBUG: Month 49 Termination Bug');
console.log('='.repeat(80));

// Test 1: Run to month 50 (should complete)
console.log('\n[TEST 1] Running climate-first to month 50...');
const result1 = runScenario('climate-first', 1000, 50);
console.log(`Result: ${result1.monthsSimulated} months (expected 50)`);

// Test 2: Run to month 60 (should complete)
console.log('\n[TEST 2] Running climate-first to month 60...');
const result2 = runScenario('climate-first', 1001, 60);
console.log(`Result: ${result2.monthsSimulated} months (expected 60)`);

// Test 3: Run to month 100 (will it work?)
console.log('\n[TEST 3] Running climate-first to month 100...');
const result3 = runScenario('climate-first', 1002, 100);
console.log(`Result: ${result3.monthsSimulated} months (expected 100)`);

console.log('\n='.repeat(80));
console.log('SUMMARY:');
console.log(`Test 1 (maxMonths=50):  ${result1.monthsSimulated} months`);
console.log(`Test 2 (maxMonths=60):  ${result2.monthsSimulated} months`);
console.log(`Test 3 (maxMonths=100): ${result3.monthsSimulated} months`);
console.log('='.repeat(80));

process.exit(0);

// OLD CODE BELOW (not executed)
try {
  const result = runScenario('climate-first', 1000, 50);

  console.log('\n='.repeat(80));
  console.log('RESULT:');
  console.log('='.repeat(80));
  console.log(`Outcome: ${result.outcome}`);
  console.log(`Months simulated: ${result.monthsSimulated}`);
  console.log(`Population: ${result.finalPopulation}B`);
  console.log(`QoL: ${(result.finalQoL.overallAvg * 100).toFixed(1)}%`);
  console.log('='.repeat(80));

  if (result.monthsSimulated < 50) {
    console.error(`\n❌ EARLY TERMINATION DETECTED`);
    console.error(`   Expected: 50 months`);
    console.error(`   Actual: ${result.monthsSimulated} months`);
    console.error(`   Outcome: ${result.outcome}`);
  } else {
    console.log(`\n✅ Simulation completed full duration`);
  }

} catch (error) {
  console.error('\n❌ SIMULATION CRASHED:');
  console.error(error);
  process.exit(1);
}
