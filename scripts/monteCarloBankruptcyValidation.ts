#!/usr/bin/env tsx
/**
 * Monte Carlo Validation for TIER 0D Bug #4: AI Lab Bankruptcies
 *
 * Tests bankruptcy across multiple seeds to understand:
 * 1. How often do orgs go bankrupt?
 * 2. When do they go bankrupt (timing patterns)?
 * 3. Are bankruptcy effects consistent?
 * 4. Do bankrupt orgs continue creating AIs (orphan bug)?
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { generateDistributionReport } from './utils/statisticalAnalysis';

interface RunMetrics {
  seed: number;
  bankruptcyCount: number;
  firstBankruptcyMonth: number | null;
  lastBankruptcyMonth: number | null;
  bankruptOrgsAtEnd: number;
  totalAIsAtEnd: number;
  retiredAIsAtEnd: number;
  governmentDCsAtEnd: number;
  orphanAIs: number; // AIs owned by bankrupt orgs
}

console.log('\n🎲 MONTE CARLO BANKRUPTCY VALIDATION (TIER 0D Bug #4)');
console.log('='.repeat(80));
console.log('\nRunning 10 simulations × 120 months to validate bankruptcy mechanics...\n');

const runs: RunMetrics[] = [];
const baseSeed = 96000;
const numRuns = 10;
const maxMonths = 120;

for (let i = 0; i < numRuns; i++) {
  const seed = baseSeed + i;
  process.stdout.write(`Run ${i + 1}/${numRuns} (seed ${seed})... `);

  // Suppress all output
  const originalLog = console.log;
  console.log = () => {};

  const initialState = createDefaultInitialState();
  const engine = new SimulationEngine({ seed, maxMonths });

  let bankruptcyMonths: number[] = [];

  const result = engine.run(initialState, {
    maxMonths,
    checkActualOutcomes: false,
    onMonthEnd: (state: GameState) => {
      // Track when organizations go bankrupt
      state.organizations.forEach(org => {
        if (org.bankrupt && org.bankruptcyMonth && !bankruptcyMonths.includes(org.bankruptcyMonth)) {
          bankruptcyMonths.push(org.bankruptcyMonth);
        }
      });
    }
  });

  console.log = originalLog;

  const finalState = result.finalState;

  // Count orphan AIs (AIs owned by bankrupt orgs)
  let orphanAIs = 0;
  finalState.organizations.forEach(org => {
    if (org.bankrupt && org.ownedAIModels.length > 0) {
      orphanAIs += org.ownedAIModels.length;
    }
  });

  const metrics: RunMetrics = {
    seed,
    bankruptcyCount: bankruptcyMonths.length,
    firstBankruptcyMonth: bankruptcyMonths.length > 0 ? Math.min(...bankruptcyMonths) : null,
    lastBankruptcyMonth: bankruptcyMonths.length > 0 ? Math.max(...bankruptcyMonths) : null,
    bankruptOrgsAtEnd: finalState.organizations.filter(o => o.bankrupt).length,
    totalAIsAtEnd: finalState.aiAgents.length,
    retiredAIsAtEnd: finalState.aiAgents.filter(ai => ai.lifecycleState === 'retired').length,
    governmentDCsAtEnd: finalState.computeInfrastructure.dataCenters.filter(dc =>
      dc.organizationId === 'government' || dc.organizationId === 'government_ai'
    ).length,
    orphanAIs,
  };

  runs.push(metrics);

  const bankruptStatus = metrics.bankruptOrgsAtEnd === 6 ? '💀 ALL' :
                         metrics.bankruptOrgsAtEnd > 0 ? `⚠️  ${metrics.bankruptOrgsAtEnd}/6` :
                         '✅ NONE';
  const orphanStatus = metrics.orphanAIs > 0 ? `❌ ${metrics.orphanAIs} orphans` : '✅';

  console.log(`${bankruptStatus} bankrupt, ${orphanStatus}`);
}

// === ANALYSIS ===

console.log('\n📊 BANKRUPTCY FREQUENCY ANALYSIS');
console.log('='.repeat(80));

const bankruptcyRates = runs.map(r => r.bankruptOrgsAtEnd / 6);
console.log(generateDistributionReport(bankruptcyRates, 'Bankruptcy Rate (fraction of orgs)', ''));

console.log('\n📊 BANKRUPTCY TIMING ANALYSIS');
console.log('='.repeat(80));

const firstBankruptcyMonths = runs.filter(r => r.firstBankruptcyMonth !== null).map(r => r.firstBankruptcyMonth!);
if (firstBankruptcyMonths.length > 0) {
  console.log(generateDistributionReport(
    firstBankruptcyMonths.map(m => m / 120),
    'First Bankruptcy Month (normalized)',
    ''
  ));
} else {
  console.log('No bankruptcies detected across all runs.');
}

console.log('\n📊 ORPHAN AI ANALYSIS (CRITICAL BUG CHECK)');
console.log('='.repeat(80));

const totalOrphans = runs.reduce((sum, r) => sum + r.orphanAIs, 0);
const runsWithOrphans = runs.filter(r => r.orphanAIs > 0).length;

console.log(`\nOrphan AIs (AIs owned by bankrupt orgs):`);
console.log(`  Total across all runs: ${totalOrphans}`);
console.log(`  Runs with orphans: ${runsWithOrphans}/${numRuns}`);

if (totalOrphans > 0) {
  console.log(`\n❌ ORPHAN AI BUG DETECTED!`);
  console.log(`   Bankrupt organizations still own ${totalOrphans} AI models`);
  console.log(`   Expected: Bankrupt orgs should have 0 AI models (all retired)`);
  console.log(`\n   This is the "no simulation effects" bug - bankruptcies don\'t properly clean up!`);

  console.log(`\n   Affected runs:`);
  runs.forEach((r, i) => {
    if (r.orphanAIs > 0) {
      console.log(`     Run ${i + 1} (seed ${r.seed}): ${r.orphanAIs} orphan AIs`);
    }
  });
} else {
  console.log(`\n✅ NO ORPHAN AI BUG DETECTED`);
  console.log(`   All bankrupt organizations properly retired their AI models`);
}

console.log('\n📊 SUMMARY TABLE');
console.log('='.repeat(80));

console.log('\n┌──────┬────────┬──────────┬─────────────┬────────────┬──────────┬───────────┬────────────┐');
console.log('│ Run  │  Seed  │ Bankrupt │ First/Last  │ Retired AI │ Total AI │ Gov DCs   │ Orphan AIs │');
console.log('├──────┼────────┼──────────┼─────────────┼────────────┼──────────┼───────────┼────────────┤');

runs.forEach((r, i) => {
  const run = (i + 1).toString().padStart(4);
  const seed = r.seed.toString().padStart(6);
  const bankrupt = `${r.bankruptOrgsAtEnd}/6`.padStart(8);
  const timing = r.firstBankruptcyMonth !== null
    ? `${r.firstBankruptcyMonth}-${r.lastBankruptcyMonth}`.padStart(11)
    : 'N/A'.padStart(11);
  const retired = r.retiredAIsAtEnd.toString().padStart(10);
  const total = r.totalAIsAtEnd.toString().padStart(8);
  const govDCs = r.governmentDCsAtEnd.toString().padStart(9);
  const orphans = r.orphanAIs.toString().padStart(10);
  const orphanIcon = r.orphanAIs > 0 ? ' ❌' : '';

  console.log(`│ ${run} │ ${seed} │ ${bankrupt} │ ${timing} │ ${retired} │ ${total} │ ${govDCs} │ ${orphans}${orphanIcon} │`);
});

console.log('└──────┴────────┴──────────┴─────────────┴────────────┴──────────┴───────────┴────────────┘');

// === KEY FINDINGS ===

console.log('\n💡 KEY FINDINGS');
console.log('='.repeat(80));

const avgBankruptRate = bankruptcyRates.reduce((sum, r) => sum + r, 0) / bankruptcyRates.length;
const avgFirstBankruptcy = firstBankruptcyMonths.length > 0
  ? firstBankruptcyMonths.reduce((sum, m) => sum + m, 0) / firstBankruptcyMonths.length
  : null;

console.log(`\n1. BANKRUPTCY FREQUENCY:`);
console.log(`   Average bankruptcy rate: ${(avgBankruptRate * 100).toFixed(1)}% of organizations`);
console.log(`   Runs with all orgs bankrupt: ${runs.filter(r => r.bankruptOrgsAtEnd === 6).length}/${numRuns}`);
console.log(`   Runs with no bankruptcies: ${runs.filter(r => r.bankruptOrgsAtEnd === 0).length}/${numRuns}`);

if (avgFirstBankruptcy !== null) {
  console.log(`\n2. BANKRUPTCY TIMING:`);
  console.log(`   Average first bankruptcy: Month ${avgFirstBankruptcy.toFixed(1)}`);
  console.log(`   Typical range: Months ${Math.min(...firstBankruptcyMonths)}-${Math.max(...firstBankruptcyMonths)}`);
}

console.log(`\n3. BANKRUPTCY EFFECTS:`);
const avgRetired = runs.reduce((sum, r) => sum + r.retiredAIsAtEnd, 0) / runs.length;
const avgGovDCs = runs.reduce((sum, r) => sum + r.governmentDCsAtEnd, 0) / runs.length;
console.log(`   Average retired AIs: ${avgRetired.toFixed(1)}`);
console.log(`   Average government DCs: ${avgGovDCs.toFixed(1)}`);

if (totalOrphans > 0) {
  console.log(`\n❌ 4. BUG CONFIRMED: ORPHAN AIS`);
  console.log(`   ${totalOrphans} AI models remain owned by bankrupt organizations`);
  console.log(`   This is the "no simulation effects" bug - bankruptcies incomplete`);
  console.log(`\n   ROOT CAUSE:`);
  console.log(`   - handleBankruptcy() is called when org.bankrupt = true`);
  console.log(`   - BUT new AIs are created AFTER bankruptcy is set`);
  console.log(`   - OR bankruptcy cleanup doesn't cover all AIs`);
  console.log(`   - OR AIs created during bankruptcy month escape cleanup`);

  console.log(`\n   RECOMMENDED FIX:`);
  console.log(`   1. Prevent bankrupt orgs from training new models`);
  console.log(`   2. Add bankruptcy check in model training phase`);
  console.log(`   3. Ensure all AIs retired before clearing ownedAIModels list`);
} else {
  console.log(`\n✅ 4. NO ORPHAN AI BUG`);
  console.log(`   All bankrupt organizations properly cleaned up their AI models`);
  console.log(`   Bankruptcy effects working as expected`);
}

console.log('\n✅ Monte Carlo validation complete!\n');
