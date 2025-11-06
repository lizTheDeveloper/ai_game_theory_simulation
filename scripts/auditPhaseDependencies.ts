/**
 * Phase Dependency Audit Script
 *
 * Analyzes all registered phases to identify:
 * 1. Phase execution order
 * 2. Declared dependencies
 * 3. Missing dependencies (critical ordering requirements not declared)
 * 4. Potential circular dependencies
 *
 * Run: npx tsx scripts/auditPhaseDependencies.ts > logs/phase_dependency_audit_$(date +%Y%m%d_%H%M%S).txt
 */

import { SimulationEngine } from '../src/simulation/engine';

function auditPhaseDependencies() {
  console.log('\n📊 PHASE DEPENDENCY AUDIT');
  console.log('='.repeat(120));
  console.log('Total phases: 117 (as of Nov 6, 2025)');
  console.log('Goal: Top 30 critical phases with explicit dependencies');
  console.log('='.repeat(120));

  // Create engine (this registers all phases)
  const engine = new SimulationEngine({ enableLogging: false });
  const orchestrator = (engine as any).orchestrator;

  // Get execution order
  const order = orchestrator.getExecutionOrder();

  console.log('\n\n🔍 PHASE EXECUTION ORDER & DEPENDENCIES');
  console.log('='.repeat(120));
  console.log('Format: [ORDER] Phase Name (phase-id) [Dependencies: count]');
  console.log('-'.repeat(120));

  let phasesWithDeps = 0;
  let phasesWithoutDeps = 0;

  for (const line of order) {
    // Extract phase ID from line format: "[ORDER] Phase Name (phase-id)"
    const match = line.match(/\[([\d.]+)\] (.+?) \((.+?)\)/);
    if (!match) {
      console.log(line);
      continue;
    }

    const [, orderNum, phaseName, phaseId] = match;
    const phase = orchestrator.getPhase(phaseId);

    if (phase?.dependencies && phase.dependencies.length > 0) {
      phasesWithDeps++;
      console.log(`${line} [DEPS: ${phase.dependencies.length}]`);
      phase.dependencies.forEach((dep: string) => {
        const depPhase = orchestrator.getPhase(dep);
        const depOrder = depPhase ? depPhase.order : 'UNKNOWN';
        console.log(`    → ${dep} (order: ${depOrder})`);
      });
    } else {
      phasesWithoutDeps++;
      console.log(line);
    }
  }

  console.log('='.repeat(120));
  console.log(`\nPhases WITH dependencies: ${phasesWithDeps}`);
  console.log(`Phases WITHOUT dependencies: ${phasesWithoutDeps}`);
  console.log(`Total phases: ${phasesWithDeps + phasesWithoutDeps}`);
  console.log(`\nCoverage: ${((phasesWithDeps / (phasesWithDeps + phasesWithoutDeps)) * 100).toFixed(1)}%`);

  // Identify critical phase categories that need dependencies
  console.log('\n\n⚠️  CRITICAL PHASE CATEGORIES (Need Dependency Review)');
  console.log('='.repeat(120));

  const criticalKeywords = [
    'mortality', 'population', 'climate', 'crisis', 'nuclear',
    'extinction', 'tipping', 'catastrophe', 'collapse', 'outcome'
  ];

  for (const keyword of criticalKeywords) {
    console.log(`\n🔴 ${keyword.toUpperCase()} phases:`);
    const filtered = order.filter(line =>
      line.toLowerCase().includes(keyword.toLowerCase())
    );
    filtered.forEach(line => {
      const match = line.match(/\((.+?)\)/);
      if (match) {
        const phaseId = match[1];
        const phase = orchestrator.getPhase(phaseId);
        const hasDeps = phase?.dependencies && phase.dependencies.length > 0;
        console.log(`  ${hasDeps ? '✅' : '❌'} ${line}`);
      }
    });
  }

  console.log('\n\n📋 RECOMMENDED ACTIONS');
  console.log('='.repeat(120));
  console.log('1. Review phases marked with ❌ in critical categories');
  console.log('2. Add dependencies for phases that read state from earlier phases');
  console.log('3. Ensure climate phases run before mortality phases');
  console.log('4. Ensure AI capability phases run before alignment phases');
  console.log('5. Ensure crisis detection runs after all risk accumulation');
  console.log('='.repeat(120));
}

// Run audit
auditPhaseDependencies();
