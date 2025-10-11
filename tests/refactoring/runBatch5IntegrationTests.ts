/**
 * Batch 5 Integration Tests
 *
 * Tests for the final 6 phases (extinction, diffusion, events, time):
 * - ExtinctionTriggersPhase (37.0)
 * - ExtinctionProgressPhase (38.0)
 * - TechnologyDiffusionPhase (39.0)
 * - CatastrophicScenariosPhase (40.0)
 * - EventCollectionPhase (98.0)
 * - TimeAdvancementPhase (99.0)
 *
 * These tests validate:
 * 1. All phases instantiate correctly with proper IDs and order
 * 2. Phases execute without errors on realistic game states
 * 3. Phases produce correct side effects (state mutations, events)
 * 4. Order numbers ensure correct execution sequence
 */

import {
  ExtinctionTriggersPhase,
  ExtinctionProgressPhase,
  TechnologyDiffusionPhase,
  CatastrophicScenariosPhase,
  EventCollectionPhase,
  TimeAdvancementPhase
} from '../../src/simulation/engine/phases';
import { createMockGameState, createMockGameStateWithAIs } from '../helpers/mockGameState';
import { SeededRandom } from '../../src/simulation/engine';
import { GameState } from '@/types/game';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Test 1: Verify all 6 phases instantiate correctly
 */
function testAllBatch5PhasesInstantiation(): TestResult {
  try {
    const phases = [
      { phase: new ExtinctionTriggersPhase(), expectedId: 'extinction-triggers', expectedOrder: 37.0 },
      { phase: new ExtinctionProgressPhase(), expectedId: 'extinction-progress', expectedOrder: 38.0 },
      { phase: new TechnologyDiffusionPhase(), expectedId: 'technology-diffusion', expectedOrder: 39.0 },
      { phase: new CatastrophicScenariosPhase(), expectedId: 'catastrophic-scenarios', expectedOrder: 40.0 },
      { phase: new EventCollectionPhase(), expectedId: 'event-collection', expectedOrder: 98.0 },
      { phase: new TimeAdvancementPhase(), expectedId: 'time-advancement', expectedOrder: 99.0 }
    ];

    for (const { phase, expectedId, expectedOrder } of phases) {
      if (phase.id !== expectedId) {
        throw new Error(`Expected id '${expectedId}' but got '${phase.id}'`);
      }
      if (phase.order !== expectedOrder) {
        throw new Error(`Phase ${expectedId}: Expected order ${expectedOrder} but got ${phase.order}`);
      }
    }

    return { name: 'All 6 Batch 5 phases - instantiation', passed: true };
  } catch (error) {
    return { name: 'All 6 Batch 5 phases - instantiation', passed: false, error: String(error) };
  }
}

/**
 * Test 2: ExtinctionTriggersPhase - no active extinction
 */
function testExtinctionTriggersPhase_NoActiveExtinction(): TestResult {
  try {
    const state = createMockGameState();
    state.extinctionState.active = false;

    const phase = new ExtinctionTriggersPhase();
    const rng = new SeededRandom(42000);

    const result = phase.execute(state, () => rng.next());

    // Should execute without error
    if (!result) {
      throw new Error('Phase did not return a result');
    }

    // Should return events array (may be empty or contain extinction trigger event)
    if (!Array.isArray(result.events)) {
      throw new Error('Expected events array');
    }

    return { name: 'ExtinctionTriggersPhase - no active extinction', passed: true };
  } catch (error) {
    return { name: 'ExtinctionTriggersPhase - no active extinction', passed: false, error: String(error) };
  }
}

/**
 * Test 3: ExtinctionTriggersPhase - already in extinction (skip check)
 */
function testExtinctionTriggersPhase_AlreadyActive(): TestResult {
  try {
    const state = createMockGameState();
    state.extinctionState.active = true;
    state.extinctionState.scenario = 'nuclear_war';

    const phase = new ExtinctionTriggersPhase();
    const rng = new SeededRandom(42000);

    const result = phase.execute(state, () => rng.next());

    // Should return empty events (skips check when already in extinction)
    if (result.events.length !== 0) {
      throw new Error('Expected no events when extinction already active');
    }

    return { name: 'ExtinctionTriggersPhase - already active (skip)', passed: true };
  } catch (error) {
    return { name: 'ExtinctionTriggersPhase - already active (skip)', passed: false, error: String(error) };
  }
}

/**
 * Test 4: ExtinctionProgressPhase - progresses active extinction
 */
function testExtinctionProgressPhase_ActiveExtinction(): TestResult {
  try {
    const state = createMockGameState();
    state.extinctionState.active = true;
    state.extinctionState.scenario = 'ai_takeover';
    state.extinctionState.severity = 0.3;

    const phase = new ExtinctionProgressPhase();
    const rng = new SeededRandom(42001);

    const result = phase.execute(state, () => rng.next());

    // Should execute without error
    if (!result) {
      throw new Error('Phase did not return a result');
    }

    // Should return events array (may contain progress/completion events)
    if (!Array.isArray(result.events)) {
      throw new Error('Expected events array');
    }

    return { name: 'ExtinctionProgressPhase - active extinction', passed: true };
  } catch (error) {
    return { name: 'ExtinctionProgressPhase - active extinction', passed: false, error: String(error) };
  }
}

/**
 * Test 5: ExtinctionProgressPhase - no active extinction (skip)
 */
function testExtinctionProgressPhase_NoActiveExtinction(): TestResult {
  try {
    const state = createMockGameState();
    state.extinctionState.active = false;

    const phase = new ExtinctionProgressPhase();
    const rng = new SeededRandom(42001);

    const result = phase.execute(state, () => rng.next());

    // Should return empty events (nothing to progress)
    if (result.events.length !== 0) {
      throw new Error('Expected no events when no active extinction');
    }

    return { name: 'ExtinctionProgressPhase - no active extinction (skip)', passed: true };
  } catch (error) {
    return { name: 'ExtinctionProgressPhase - no active extinction (skip)', passed: false, error: String(error) };
  }
}

/**
 * Test 6: TechnologyDiffusionPhase - executes without error
 */
function testTechnologyDiffusionPhase(): TestResult {
  try {
    const state = createMockGameState();

    const phase = new TechnologyDiffusionPhase();
    const rng = new SeededRandom(42002);

    const result = phase.execute(state, () => rng.next());

    // Should execute without error
    if (!result) {
      throw new Error('Phase did not return a result');
    }

    // Technology diffusion doesn't generate events (returns empty array)
    if (!Array.isArray(result.events)) {
      throw new Error('Expected events array');
    }

    return { name: 'TechnologyDiffusionPhase - execution', passed: true };
  } catch (error) {
    return { name: 'TechnologyDiffusionPhase - execution', passed: false, error: String(error) };
  }
}

/**
 * Test 7: CatastrophicScenariosPhase - executes without error
 */
function testCatastrophicScenariosPhase(): TestResult {
  try {
    const state = createMockGameState();
    // Ensure catastrophicScenarios exists
    if (!state.catastrophicScenarios) {
      state.catastrophicScenarios = {};
    }

    const phase = new CatastrophicScenariosPhase();
    const rng = new SeededRandom(42003);

    const result = phase.execute(state, () => rng.next());

    // Should execute without error
    if (!result) {
      throw new Error('Phase did not return a result');
    }

    // Should return events array (may contain prerequisite/activation events)
    if (!Array.isArray(result.events)) {
      throw new Error('Expected events array');
    }

    return { name: 'CatastrophicScenariosPhase - execution', passed: true };
  } catch (error) {
    return { name: 'CatastrophicScenariosPhase - execution', passed: false, error: String(error) };
  }
}

/**
 * Test 8: EventCollectionPhase - collects events from eventLog
 */
function testEventCollectionPhase_WithEvents(): TestResult {
  try {
    const state = createMockGameState();
    state.currentMonth = 10;

    // Add some events to eventLog
    state.eventLog = [
      { type: 'technology', month: 10, description: 'Test event 1', severity: 'medium' },
      { type: 'crisis', month: 10, description: 'Test event 2', severity: 'high' },
      { type: 'technology', month: 9, description: 'Old event', severity: 'low' } // Should not be collected
    ];

    const phase = new EventCollectionPhase();
    const rng = new SeededRandom(42004);

    const result = phase.execute(state, () => rng.next());

    // Should collect exactly 2 events (current month only)
    if (result.events.length !== 2) {
      throw new Error(`Expected 2 events but got ${result.events.length}`);
    }

    // Should only include current month's events
    for (const event of result.events) {
      if (event.month !== 10) {
        throw new Error(`Expected all events to have month 10, but found month ${event.month}`);
      }
    }

    return { name: 'EventCollectionPhase - with events', passed: true };
  } catch (error) {
    return { name: 'EventCollectionPhase - with events', passed: false, error: String(error) };
  }
}

/**
 * Test 9: EventCollectionPhase - empty eventLog
 */
function testEventCollectionPhase_NoEvents(): TestResult {
  try {
    const state = createMockGameState();
    state.eventLog = [];

    const phase = new EventCollectionPhase();
    const rng = new SeededRandom(42004);

    const result = phase.execute(state, () => rng.next());

    // Should return empty events array
    if (result.events.length !== 0) {
      throw new Error(`Expected 0 events but got ${result.events.length}`);
    }

    return { name: 'EventCollectionPhase - no events', passed: true };
  } catch (error) {
    return { name: 'EventCollectionPhase - no events', passed: false, error: String(error) };
  }
}

/**
 * Test 10: TimeAdvancementPhase - advances time correctly
 */
function testTimeAdvancementPhase(): TestResult {
  try {
    const state = createMockGameState();
    state.currentMonth = 23; // Month 23 = Year 1 (0-indexed)
    state.currentYear = 1;

    const phase = new TimeAdvancementPhase();
    const rng = new SeededRandom(42005);

    const result = phase.execute(state, () => rng.next());

    // Should advance month
    if (state.currentMonth !== 24) {
      throw new Error(`Expected currentMonth to be 24, got ${state.currentMonth}`);
    }

    // Should update year (24 months = year 2)
    if (state.currentYear !== 2) {
      throw new Error(`Expected currentYear to be 2, got ${state.currentYear}`);
    }

    // Should return empty events
    if (result.events.length !== 0) {
      throw new Error('Expected no events from time advancement');
    }

    return { name: 'TimeAdvancementPhase - time advancement', passed: true };
  } catch (error) {
    return { name: 'TimeAdvancementPhase - time advancement', passed: false, error: String(error) };
  }
}

/**
 * Test 11: Verify execution order is correct
 */
function testBatch5ExecutionOrder(): TestResult {
  try {
    const phases = [
      new ExtinctionTriggersPhase(),
      new ExtinctionProgressPhase(),
      new TechnologyDiffusionPhase(),
      new CatastrophicScenariosPhase(),
      new EventCollectionPhase(),
      new TimeAdvancementPhase()
    ];

    // Sort by order (simulating PhaseOrchestrator)
    const sorted = [...phases].sort((a, b) => a.order - b.order);

    // Verify extinction triggers comes before extinction progress
    if (sorted[0].id !== 'extinction-triggers') {
      throw new Error(`Expected extinction-triggers first, got ${sorted[0].id}`);
    }

    if (sorted[1].id !== 'extinction-progress') {
      throw new Error(`Expected extinction-progress second, got ${sorted[1].id}`);
    }

    if (sorted[2].id !== 'technology-diffusion') {
      throw new Error(`Expected technology-diffusion third, got ${sorted[2].id}`);
    }

    if (sorted[3].id !== 'catastrophic-scenarios') {
      throw new Error(`Expected catastrophic-scenarios fourth, got ${sorted[3].id}`);
    }

    // Event collection must be second-to-last
    if (sorted[4].id !== 'event-collection') {
      throw new Error(`Expected event-collection fifth, got ${sorted[4].id}`);
    }

    // Time advancement MUST be last
    if (sorted[5].id !== 'time-advancement') {
      throw new Error(`Expected time-advancement last, got ${sorted[5].id}`);
    }

    return { name: 'Batch 5 execution order', passed: true };
  } catch (error) {
    return { name: 'Batch 5 execution order', passed: false, error: String(error) };
  }
}

/**
 * Run all tests
 */
function runAllTests(): void {
  console.log('\n🧪 Running Batch 5 Integration Tests...\n');

  const tests = [
    testAllBatch5PhasesInstantiation,
    testExtinctionTriggersPhase_NoActiveExtinction,
    testExtinctionTriggersPhase_AlreadyActive,
    testExtinctionProgressPhase_ActiveExtinction,
    testExtinctionProgressPhase_NoActiveExtinction,
    testTechnologyDiffusionPhase,
    testCatastrophicScenariosPhase,
    testEventCollectionPhase_WithEvents,
    testEventCollectionPhase_NoEvents,
    testTimeAdvancementPhase,
    testBatch5ExecutionOrder
  ];

  const results = tests.map(test => test());

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('Results:');
  console.log('--------');
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${result.name}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }

  console.log(`\n📊 Summary: ${passed}/${tests.length} tests passed`);

  if (failed > 0) {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All Batch 5 integration tests passed!');
    process.exit(0);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
