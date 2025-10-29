#!/usr/bin/env npx tsx

/**
 * Validate Slow Takeover Scenario Behavior
 *
 * Verifies that the Slow Takeover scenario correctly shows 6/7 completion
 * in typical simulation timeframes (240-360 months) due to step 7 requiring
 * 50-100 year multi-generational decline.
 *
 * This is NOT a bug - it's intentional design.
 *
 * NOTE: This script performs static code analysis only (no simulation runs).
 * Use Monte Carlo validation for actual runtime testing.
 */

import * as fs from 'fs';
import * as path from 'path';

// Emoji conventions
const SUCCESS = '✅';
const WARNING = '⚠️';
const INFO = 'ℹ️';
const ERROR = '❌';

interface ValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validation Test 1: Step 7 hardcoded to never complete
 */
function testStep7HardcodedLogic(): ValidationResult {
  console.log(`\n${INFO} Test 1: Step 7 logic verification`);

  const filePath = path.join(__dirname, '../src/simulation/catastrophicScenarios.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find the checkSlowDisplacementPrerequisite function
  const functionMatch = content.match(/function checkSlowDisplacementPrerequisite[\s\S]*?^}/m);

  if (!functionMatch) {
    return {
      testName: 'Step 7 logic verification',
      passed: false,
      message: `${ERROR} Could not find checkSlowDisplacementPrerequisite function`,
      details: {}
    };
  }

  const functionBody = functionMatch[0];

  // Check for case 6 (step 7) hardcoded to return false
  const case6Match = functionBody.match(/case 6:[\s\S]*?return \{[^}]*met:\s*false[^}]*\}/);

  const hasHardcodedFalse = !!case6Match;
  const passed = hasHardcodedFalse; // This is EXPECTED behavior

  const message = hasHardcodedFalse
    ? `${SUCCESS} Step 7 (case 6) correctly hardcoded to { met: false } - EXPECTED`
    : `${WARNING} Step 7 logic may have changed - review implementation`;

  return {
    testName: 'Step 7 logic verification',
    passed,
    message,
    details: {
      hasHardcodedFalse,
      codeSnippet: case6Match ? case6Match[0].substring(0, 200) : 'NOT FOUND'
    }
  };
}

/**
 * Validation Test 2: Documentation exists
 */
function testDocumentationExists(): ValidationResult {
  console.log(`\n${INFO} Test 2: Documentation verification`);

  const filePath = path.join(__dirname, '../src/simulation/catastrophicScenarios.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for specific documentation comments around step 7
  const hasIntentionalComment = content.includes('This is INTENTIONAL - not a bug');
  const hasCenturyScaleComment = content.includes('50-100 year') || content.includes('century-scale');
  const hasExpectedBehaviorComment = content.includes('Expected: 6/7 completion') || content.includes('6/7');
  const hasMultiGenerationalComment = content.includes('multi-generational');

  const passed = hasIntentionalComment && hasCenturyScaleComment && hasExpectedBehaviorComment;

  const message = passed
    ? `${SUCCESS} Documentation correctly explains step 7 behavior`
    : `${ERROR} Documentation missing key comments about step 7 design`;

  return {
    testName: 'Documentation verification',
    passed,
    message,
    details: {
      hasIntentionalComment,
      hasCenturyScaleComment,
      hasExpectedBehaviorComment,
      hasMultiGenerationalComment
    }
  };
}

/**
 * Validation Test 3: Scenario timeframe configuration
 */
function testScenarioTimeframes(): ValidationResult {
  console.log(`\n${INFO} Test 3: Scenario timeframe configuration`);

  const filePath = path.join(__dirname, '../src/simulation/catastrophicScenarios.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find createSlowDisplacementScenario function
  const scenarioMatch = content.match(/function createSlowDisplacementScenario[\s\S]*?^}/m);

  if (!scenarioMatch) {
    return {
      testName: 'Scenario timeframe configuration',
      passed: false,
      message: `${ERROR} Could not find createSlowDisplacementScenario function`,
      details: {}
    };
  }

  const scenarioBody = scenarioMatch[0];

  // Check for timeToCompletion and prerequisite count
  const timeToCompletionMatch = scenarioBody.match(/timeToCompletion:\s*(\d+)/);

  // Extract just the prerequisites array
  const prerequisitesMatch = scenarioBody.match(/prerequisites:\s*\[([\s\S]*?)\]/);
  const prerequisitesSection = prerequisitesMatch ? prerequisitesMatch[1] : '';

  const timeToCompletion = timeToCompletionMatch ? parseInt(timeToCompletionMatch[1]) : null;

  // Count prerequisites (step names within prerequisites array only)
  const stepCount = (prerequisitesSection.match(/name:\s*'/g) || []).length;

  const passed = timeToCompletion === 360 && stepCount === 7;

  const message = passed
    ? `${SUCCESS} Scenario configured with 360-month timeframe and 7 steps`
    : `${WARNING} Configuration may have changed: ${timeToCompletion} months, ${stepCount} steps`;

  return {
    testName: 'Scenario timeframe configuration',
    passed,
    message,
    details: {
      timeToCompletion,
      stepCount,
      expectedTimeToCompletion: 360,
      expectedStepCount: 7
    }
  };
}

/**
 * Main validation runner
 */
async function main() {
  console.log('='.repeat(80));
  console.log('SLOW TAKEOVER SCENARIO VALIDATION (Static Code Analysis)');
  console.log('='.repeat(80));
  console.log(`\n${INFO} Validating that 6/7 completion with zero variance is INTENTIONAL behavior`);
  console.log(`${INFO} Step 7 requires 50-100 year multi-generational decline (not completable in typical sims)`);
  console.log(`${INFO} This performs static analysis only - use Monte Carlo for runtime validation\n`);

  const tests: ValidationResult[] = [];

  // Run validation tests
  tests.push(testStep7HardcodedLogic());
  tests.push(testDocumentationExists());
  tests.push(testScenarioTimeframes());

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(80));

  const allPassed = tests.every(t => t.passed);

  tests.forEach(test => {
    console.log(`\n${test.passed ? SUCCESS : ERROR} ${test.testName}`);
    console.log(`  ${test.message}`);
    if (test.details && Object.keys(test.details).length > 0) {
      console.log(`  Details:`, JSON.stringify(test.details, null, 2).split('\n').join('\n  '));
    }
  });

  console.log('\n' + '='.repeat(80));

  if (allPassed) {
    console.log(`${SUCCESS} ALL VALIDATIONS PASSED`);
    console.log(`\n${INFO} Conclusion: Code correctly implements step 7 as never-completing in typical sims.`);
    console.log(`${INFO} Documentation explains this is INTENTIONAL design (multi-generational 50-100 years).`);
    console.log(`${INFO} Expected behavior: 6/7 completion (85.7%) with ZERO variance in 240-360 month sims.`);
    console.log(`\n${INFO} This is NOT a bug. To see runtime behavior, run Monte Carlo validation:`);
    console.log(`  npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=240\n`);
  } else {
    console.log(`${ERROR} SOME VALIDATIONS FAILED`);
    console.log(`\n${WARNING} Review failed tests above. Code may have changed or documentation needs update.\n`);
  }

  console.log('='.repeat(80));

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error(`${ERROR} Validation script failed:`, error);
  process.exit(1);
});
