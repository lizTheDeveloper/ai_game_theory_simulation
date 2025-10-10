/**
 * Standalone Phase 4 Test Runner
 *
 * Validates phase implementations work correctly without needing Jest.
 */

import { PhaseOrchestrator } from '../../src/simulation/engine/PhaseOrchestrator';
import {
  UnemploymentPhase,
  EconomicTransitionPhase,
  ParanoiaPhase,
  SocialStabilityPhase,
  QualityOfLifePhase,
  OutcomeProbabilitiesPhase,
  CrisisDetectionPhase,
  GovernanceQualityPhase,
  UpwardSpiralsPhase,
  MeaningRenaissancePhase,
  ConflictResolutionPhase,
  DiplomaticAIPhase,
  NationalAIPhase,
  MADDeterrencePhase,
  ResourceEconomyPhase,
  ResourceTechnologyPhase,
  GeoengineringPhase,
  DefensiveAIPhase,
  DystopiaProgressionPhase,
  BenchmarkEvaluationsPhase,
  CrisisPointsPhase
} from '../../src/simulation/engine/phases';
import { SimulationEngine } from '../../src/simulation/engine';
import { createDefaultInitialState } from '../../src/simulation/initialization';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Test: Phase Orchestrator Registration
 */
function testPhaseRegistration(): TestResult {
  try {
    const orchestrator = new PhaseOrchestrator();

    // Register phases out of order
    orchestrator.registerPhase(new ParanoiaPhase());
    orchestrator.registerPhase(new UnemploymentPhase());
    orchestrator.registerPhase(new GovernanceQualityPhase());

    const executionOrder = orchestrator.getExecutionOrder();

    // Should be sorted: Governance (10.0), Unemployment (30.0), Paranoia (32.0)
    if (executionOrder.length !== 3) {
      throw new Error(`Expected 3 phases, got ${executionOrder.length}`);
    }

    if (!executionOrder[0].includes('governance-quality')) {
      throw new Error(`Expected governance-quality first, got ${executionOrder[0]}`);
    }

    if (!executionOrder[1].includes('unemployment')) {
      throw new Error(`Expected unemployment second, got ${executionOrder[1]}`);
    }

    if (!executionOrder[2].includes('paranoia')) {
      throw new Error(`Expected paranoia third, got ${executionOrder[2]}`);
    }

    return { name: 'Phase Registration & Sorting', passed: true };
  } catch (error) {
    return { name: 'Phase Registration & Sorting', passed: false, error: String(error) };
  }
}

/**
 * Test: All 21 Phases Registered
 */
function testAllPhasesRegistered(): TestResult {
  try {
    const orchestrator = new PhaseOrchestrator();

    // Register all 21 phases
    orchestrator.registerPhase(new GovernanceQualityPhase());
    orchestrator.registerPhase(new UpwardSpiralsPhase());
    orchestrator.registerPhase(new MeaningRenaissancePhase());
    orchestrator.registerPhase(new ConflictResolutionPhase());
    orchestrator.registerPhase(new DiplomaticAIPhase());
    orchestrator.registerPhase(new NationalAIPhase());
    orchestrator.registerPhase(new MADDeterrencePhase());
    orchestrator.registerPhase(new ResourceEconomyPhase());
    orchestrator.registerPhase(new ResourceTechnologyPhase());
    orchestrator.registerPhase(new GeoengineringPhase());
    orchestrator.registerPhase(new DefensiveAIPhase());
    orchestrator.registerPhase(new DystopiaProgressionPhase());
    orchestrator.registerPhase(new BenchmarkEvaluationsPhase());
    orchestrator.registerPhase(new CrisisPointsPhase());
    orchestrator.registerPhase(new UnemploymentPhase());
    orchestrator.registerPhase(new EconomicTransitionPhase());
    orchestrator.registerPhase(new ParanoiaPhase());
    orchestrator.registerPhase(new SocialStabilityPhase());
    orchestrator.registerPhase(new QualityOfLifePhase());
    orchestrator.registerPhase(new OutcomeProbabilitiesPhase());
    orchestrator.registerPhase(new CrisisDetectionPhase());

    const executionOrder = orchestrator.getExecutionOrder();

    if (executionOrder.length !== 21) {
      throw new Error(`Expected 21 phases, got ${executionOrder.length}`);
    }

    // First should be governance-quality (10.0)
    if (!executionOrder[0].includes('governance-quality')) {
      throw new Error(`Expected governance-quality first, got ${executionOrder[0]}`);
    }

    // Last should be crisis-detection (36.0)
    const lastPhase = executionOrder[executionOrder.length - 1];
    if (!lastPhase.includes('crisis-detection')) {
      throw new Error(`Expected crisis-detection last, got ${lastPhase}`);
    }

    return { name: 'All 21 Phases Registered', passed: true };
  } catch (error) {
    return { name: 'All 21 Phases Registered', passed: false, error: String(error) };
  }
}

/**
 * Test: Phase Order Numbers
 */
function testPhaseOrderNumbers(): TestResult {
  try {
    const phases = [
      { phase: new GovernanceQualityPhase(), expected: 10.0 },
      { phase: new UpwardSpiralsPhase(), expected: 11.0 },
      { phase: new MeaningRenaissancePhase(), expected: 12.0 },
      { phase: new ConflictResolutionPhase(), expected: 13.0 },
      { phase: new DiplomaticAIPhase(), expected: 14.0 },
      { phase: new NationalAIPhase(), expected: 15.0 },
      { phase: new MADDeterrencePhase(), expected: 16.0 },
      { phase: new ResourceEconomyPhase(), expected: 17.0 },
      { phase: new ResourceTechnologyPhase(), expected: 18.0 },
      { phase: new GeoengineringPhase(), expected: 19.0 },
      { phase: new DefensiveAIPhase(), expected: 20.0 },
      { phase: new DystopiaProgressionPhase(), expected: 21.0 },
      { phase: new BenchmarkEvaluationsPhase(), expected: 22.0 },
      { phase: new CrisisPointsPhase(), expected: 23.0 },
      { phase: new UnemploymentPhase(), expected: 30.0 },
      { phase: new EconomicTransitionPhase(), expected: 31.0 },
      { phase: new ParanoiaPhase(), expected: 32.0 },
      { phase: new SocialStabilityPhase(), expected: 33.0 },
      { phase: new QualityOfLifePhase(), expected: 34.0 },
      { phase: new OutcomeProbabilitiesPhase(), expected: 35.0 },
      { phase: new CrisisDetectionPhase(), expected: 36.0 }
    ];

    for (const { phase, expected } of phases) {
      if (phase.order !== expected) {
        throw new Error(`${phase.id} has order ${phase.order}, expected ${expected}`);
      }
    }

    return { name: 'Phase Order Numbers', passed: true };
  } catch (error) {
    return { name: 'Phase Order Numbers', passed: false, error: String(error) };
  }
}

/**
 * Test: Engine Integration
 */
function testEngineIntegration(): TestResult {
  try {
    const engine = new SimulationEngine({ seed: 42000 });

    // Engine should have orchestrator with 21 phases registered
    const state = createDefaultInitialState();

    // Run one step - should not throw
    const result = engine.step(state);

    if (!result.state) {
      throw new Error('Step did not return state');
    }

    if (!Array.isArray(result.events)) {
      throw new Error('Step did not return events array');
    }

    if (!result.metrics) {
      throw new Error('Step did not return metrics');
    }

    return { name: 'Engine Integration', passed: true };
  } catch (error) {
    return { name: 'Engine Integration', passed: false, error: String(error) };
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n🧪 PHASE 4: PHASE IMPLEMENTATION TESTS\n');
  console.log('='.repeat(80));

  const tests: TestResult[] = [
    testPhaseRegistration(),
    testAllPhasesRegistered(),
    testPhaseOrderNumbers(),
    testEngineIntegration()
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
    console.log(`\n🎉 ALL PHASE 4 TESTS PASSED!\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ SOME TESTS FAILED\n`);
    process.exit(1);
  }
}

main();
