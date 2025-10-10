/**
 * Standalone Test Runner for AILifecyclePhase
 *
 * Tests existing updateAIPopulation behavior before creating phase wrapper.
 */

import { GameState } from '../../src/types/game';
import { createMockGameStateWithAIs, createMockRng } from '../helpers/mockGameState';
import { updateAIPopulation, calculateCreationRate, getActiveAICount } from '../../src/simulation/lifecycle';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Test: calculateCreationRate with no AIs
 */
function testCreationRateNoAIs(): TestResult {
  try {
    const state = createMockGameStateWithAIs(0);
    const rate = calculateCreationRate(state);

    if (Math.abs(rate - 0.5) > 0.01) {
      throw new Error(`Expected ~0.5, got ${rate}`);
    }

    return { name: 'calculateCreationRate - base rate', passed: true };
  } catch (error) {
    return { name: 'calculateCreationRate - base rate', passed: false, error: String(error) };
  }
}

/**
 * Test: calculateCreationRate increases with AI capability
 */
function testCreationRateWithCapability(): TestResult {
  try {
    const state = createMockGameStateWithAIs(3);
    state.aiAgents.forEach((ai, i) => {
      ai.capability = 2.0;
      ai.lifecycleState = 'deployed_closed';
    });

    const rate = calculateCreationRate(state);

    if (rate <= 0.5) {
      throw new Error(`Expected rate > 0.5 with capable AIs, got ${rate}`);
    }

    return { name: 'calculateCreationRate - increases with capability', passed: true };
  } catch (error) {
    return { name: 'calculateCreationRate - increases with capability', passed: false, error: String(error) };
  }
}

/**
 * Test: updateAIPopulation ages all AIs
 */
function testAgingAIs(): TestResult {
  try {
    const state = createMockGameStateWithAIs(5);
    const initialAges = state.aiAgents.map(ai => ai.monthsInExistence || 0);

    updateAIPopulation(state);

    for (let i = 0; i < state.aiAgents.length; i++) {
      const expectedAge = initialAges[i] + 1;
      if (state.aiAgents[i].monthsInExistence !== expectedAge) {
        throw new Error(`AI ${i}: expected age ${expectedAge}, got ${state.aiAgents[i].monthsInExistence}`);
      }
    }

    return { name: 'updateAIPopulation - ages all AIs', passed: true };
  } catch (error) {
    return { name: 'updateAIPopulation - ages all AIs', passed: false, error: String(error) };
  }
}

/**
 * Test: updateAIPopulation progresses lifecycle states
 */
function testLifecycleProgression(): TestResult {
  try {
    const state = createMockGameStateWithAIs(5);
    state.aiAgents.forEach(ai => {
      ai.lifecycleState = 'training';
      ai.monthsInExistence = 5; // Old enough to transition
    });

    updateAIPopulation(state);

    const testingCount = state.aiAgents.filter(ai => ai.lifecycleState === 'testing').length;

    if (testingCount === 0) {
      throw new Error('No AIs progressed to testing state');
    }

    return { name: 'updateAIPopulation - progresses lifecycle states', passed: true };
  } catch (error) {
    return { name: 'updateAIPopulation - progresses lifecycle states', passed: false, error: String(error) };
  }
}

/**
 * Test: updateAIPopulation doesn't retire young AIs
 */
function testNoRetireYoungAIs(): TestResult {
  try {
    const state = createMockGameStateWithAIs(5);
    state.aiAgents.forEach(ai => {
      ai.lifecycleState = 'deployed_closed';
      ai.monthsDeployed = 5; // Too young
    });

    updateAIPopulation(state);

    const retiredCount = state.aiAgents.filter(ai => ai.lifecycleState === 'retired').length;

    if (retiredCount > 0) {
      throw new Error(`Expected 0 retirements, got ${retiredCount}`);
    }

    return { name: 'updateAIPopulation - no retirement for young AIs', passed: true };
  } catch (error) {
    return { name: 'updateAIPopulation - no retirement for young AIs', passed: false, error: String(error) };
  }
}

/**
 * Test: updateAIPopulation retires old AIs (stochastic)
 */
function testRetireOldAIs(): TestResult {
  try {
    let totalRetired = 0;

    // Run multiple times for stochastic behavior
    for (let run = 0; run < 20; run++) {
      const state = createMockGameStateWithAIs(5);
      state.aiAgents.forEach(ai => {
        ai.lifecycleState = 'deployed_closed';
        ai.monthsDeployed = 60; // Very old
        ai.capability = 0.05; // Obsolete
      });

      updateAIPopulation(state);

      totalRetired += state.aiAgents.filter(ai => ai.lifecycleState === 'retired').length;
    }

    // With 100 total AIs (5 * 20 runs), some should retire
    if (totalRetired === 0) {
      throw new Error('Expected some retirements over 20 runs, got 0');
    }

    return { name: 'updateAIPopulation - retires old/obsolete AIs', passed: true };
  } catch (error) {
    return { name: 'updateAIPopulation - retires old/obsolete AIs', passed: false, error: String(error) };
  }
}

/**
 * Test: updateAIPopulation purges very old retired AIs
 */
function testPurgeRetiredAIs(): TestResult {
  try {
    const state = createMockGameStateWithAIs(5);
    const currentMonth = state.currentYear * 12 + state.currentMonth;

    state.aiAgents.forEach((ai, i) => {
      if (i < 2) {
        ai.lifecycleState = 'retired';
        ai.creationMonth = currentMonth - 12; // Very old retired AI
      } else {
        ai.lifecycleState = 'deployed_closed';
        ai.creationMonth = currentMonth;
      }
    });

    const beforeCount = state.aiAgents.length;
    updateAIPopulation(state);
    const afterCount = state.aiAgents.length;

    if (afterCount >= beforeCount) {
      throw new Error(`Expected purge, but count went from ${beforeCount} to ${afterCount}`);
    }

    return { name: 'updateAIPopulation - purges old retired AIs', passed: true };
  } catch (error) {
    return { name: 'updateAIPopulation - purges old retired AIs', passed: false, error: String(error) };
  }
}

/**
 * Test: getActiveAICount
 */
function testGetActiveAICount(): TestResult {
  try {
    const state = createMockGameStateWithAIs(5);
    state.aiAgents.forEach((ai, i) => {
      ai.lifecycleState = i < 2 ? 'retired' : 'deployed_closed';
    });

    const activeCount = getActiveAICount(state);

    if (activeCount !== 3) {
      throw new Error(`Expected 3 active AIs, got ${activeCount}`);
    }

    return { name: 'getActiveAICount - counts non-retired AIs', passed: true };
  } catch (error) {
    return { name: 'getActiveAICount - counts non-retired AIs', passed: false, error: String(error) };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n🧪 BATCH 4: AI LIFECYCLE TESTS\n');
  console.log('='.repeat(80));

  const tests: TestResult[] = [
    testCreationRateNoAIs(),
    testCreationRateWithCapability(),
    testAgingAIs(),
    testLifecycleProgression(),
    testNoRetireYoungAIs(),
    testRetireOldAIs(),
    testPurgeRetiredAIs(),
    testGetActiveAICount()
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    if (test.passed) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${test.error}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST SUMMARY`);
  console.log('='.repeat(80));
  console.log(`\nPassed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);

  if (failed === 0) {
    console.log(`\n🎉 ALL AI LIFECYCLE TESTS PASSED!\n`);
    console.log('Existing behavior validated. Ready to create phase wrapper.\n');
    process.exit(0);
  } else {
    console.log(`\n❌ SOME TESTS FAILED\n`);
    process.exit(1);
  }
}

main();
