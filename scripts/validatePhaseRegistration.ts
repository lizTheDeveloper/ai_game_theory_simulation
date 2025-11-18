/**
 * Phase Registration Validation Script
 *
 * Validates that all phases with dependencies are properly registered
 * and that their dependencies exist.
 */

import { SimulationEngine } from '../src/simulation/engine';

async function validatePhaseRegistration() {
  console.log('=== Phase Registration Validation ===\n');

  try {
    // Create engine to register all phases
    const engine = new SimulationEngine({ enableLogging: false });

    // Get all phases from orchestrator
    const executionOrder = engine['orchestrator'].getExecutionOrder();
    const phaseCount = engine['orchestrator'].getPhaseCount();

    console.log(`Total phases registered: ${phaseCount}\n`);

    // Extract phase information
    const phases: { id: string; order: number; dependencies?: readonly string[] }[] = [];
    for (let i = 0; i < phaseCount; i++) {
      const phase = engine['orchestrator']['phases'][i];
      phases.push({
        id: phase.id,
        order: phase.order,
        dependencies: phase.dependencies
      });
    }

    // Build lookup map
    const phaseMap = new Map(phases.map(p => [p.id, p]));

    // Validate dependencies
    let hasErrors = false;
    let dependencyCount = 0;
    const phasesWithDependencies: string[] = [];

    for (const phase of phases) {
      if (phase.dependencies && phase.dependencies.length > 0) {
        phasesWithDependencies.push(phase.id);
        dependencyCount += phase.dependencies.length;

        for (const depId of phase.dependencies) {
          const depPhase = phaseMap.get(depId);

          if (!depPhase) {
            console.error(`❌ ERROR: Phase '${phase.id}' depends on '${depId}' but that phase is NOT registered!\n`);
            hasErrors = true;
          } else if (depPhase.order >= phase.order) {
            console.error(`❌ ERROR: Phase '${phase.id}' (order ${phase.order}) depends on '${depId}' (order ${depPhase.order})\n`);
            console.error(`   Dependencies must have LOWER order numbers.\n`);
            hasErrors = true;
          }
        }
      }
    }

    console.log(`\n📊 Phase Dependency Coverage:`);
    console.log(`   Phases with dependencies: ${phasesWithDependencies.length} / ${phaseCount} (${((phasesWithDependencies.length / phaseCount) * 100).toFixed(1)}%)`);
    console.log(`   Total dependency declarations: ${dependencyCount}\n`);

    if (phasesWithDependencies.length > 0) {
      console.log(`Phases with dependencies:`);
      for (const id of phasesWithDependencies.sort()) {
        const phase = phaseMap.get(id)!;
        console.log(`   ${id} (order ${phase.order}): ${phase.dependencies!.join(', ')}`);
      }
      console.log('');
    }

    if (hasErrors) {
      console.log('❌ VALIDATION FAILED: Fix the errors above.\n');
      process.exit(1);
    } else {
      console.log('✅ All phase dependencies are valid.\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ FATAL ERROR during validation:');
    console.error(error);
    console.error('\nThis indicates a configuration error in phase registration.\n');
    process.exit(1);
  }
}

validatePhaseRegistration().catch(console.error);
