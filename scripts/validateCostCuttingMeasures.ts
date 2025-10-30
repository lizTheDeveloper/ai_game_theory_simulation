/**
 * Validation script: Corporate cost-cutting measures during financial distress
 *
 * Tests the enhanced handleFinancialDistress() implementation with:
 * - R&D budget cuts
 * - Executive compensation cuts
 * - Layoffs (10-15%, then 15-20%)
 * - Project cancellations
 * - Asset sales (data centers)
 *
 * Expected behavior:
 * - Progressive escalation over 5+ months
 * - Cost savings accumulate
 * - Runway extends with each measure
 * - Side effects: slower AI training, delayed breakthroughs
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { processOrganizationTurn, calculateTotalExpenses } from '../src/simulation/organizationManagement';
import { getCapabilityFloorForNewAI } from '../src/simulation/technologyDiffusion';
import type { Organization } from '../src/types/game';

console.log('=== COST-CUTTING MEASURES VALIDATION ===\n');

// Create a state with a financially distressed organization
const state = createDefaultInitialState();

// Find a private org to test
const testOrg = state.organizations.find(o => o.type === 'private');
if (!testOrg) {
  console.error('❌ No private org found in initial state');
  process.exit(1);
}

console.log(`Testing organization: ${testOrg.name}`);
console.log(`Initial capital: $${testOrg.capital.toFixed(1)}M`);
console.log(`Initial monthly revenue: $${testOrg.monthlyRevenue.toFixed(1)}M\n`);

// Force financial distress by draining capital
testOrg.capital = 50; // Very low capital
testOrg.monthlyRevenue = 30; // Low revenue (forces continued distress)

const expenses = calculateTotalExpenses(testOrg, state);
console.log(`Monthly expenses: $${expenses.total.toFixed(1)}M`);
console.log(`Monthly net income: $${(testOrg.monthlyRevenue - expenses.total).toFixed(1)}M`);
console.log(`Runway: ${(testOrg.capital / expenses.total).toFixed(1)} months\n`);

// Ensure org has projects to cancel and data centers to sell
testOrg.currentProjects = [
  {
    id: 'test_training_1',
    type: 'model_training',
    startMonth: state.currentYear * 12 + state.currentMonth - 2,
    completionMonth: state.currentYear * 12 + state.currentMonth + 100, // Far in future so it doesn't complete
    progress: 0.3,
    capitalInvested: 100,
    computeReserved: 50,
    expectedModelCapability: getCapabilityFloorForNewAI(state),
    canBeCanceled: true,
    cancellationPenalty: 0.7
  }
];

console.log(`Projects: ${testOrg.currentProjects.length} (1 training project 30% complete)`);
console.log(`Data centers: ${testOrg.ownedDataCenters.length}\n`);

console.log('--- SIMULATING 8 MONTHS OF DISTRESS ---\n');

// Run simulation for 8 months to see progressive measures
for (let month = 1; month <= 8; month++) {
  console.log(`\n=== MONTH ${month} ===`);

  const beforeCapital = testOrg.capital;
  const beforeWorkforce = testOrg.workforceMultiplier ?? 1.0;
  const beforeRD = testOrg.rdBudgetMultiplier ?? 1.0;
  const beforeProjects = testOrg.currentProjects.length;
  const beforeDCs = testOrg.ownedDataCenters.length;

  // Process org turn (includes handleFinancialDistress)
  processOrganizationTurn(testOrg, state, () => 0.5);

  // Check changes
  const afterCapital = testOrg.capital;
  const afterWorkforce = testOrg.workforceMultiplier ?? 1.0;
  const afterRD = testOrg.rdBudgetMultiplier ?? 1.0;
  const afterProjects = testOrg.currentProjects.length;
  const afterDCs = testOrg.ownedDataCenters.length;

  console.log(`\nChanges this month:`);
  console.log(`  Capital: $${beforeCapital.toFixed(1)}M → $${afterCapital.toFixed(1)}M (${(afterCapital - beforeCapital > 0 ? '+' : '')}${(afterCapital - beforeCapital).toFixed(1)}M)`);
  console.log(`  Workforce multiplier: ${beforeWorkforce.toFixed(2)}x → ${afterWorkforce.toFixed(2)}x (${((1 - afterWorkforce) * 100).toFixed(0)}% laid off)`);
  console.log(`  R&D budget multiplier: ${beforeRD.toFixed(2)}x → ${afterRD.toFixed(2)}x (${((1 - afterRD) * 100).toFixed(0)}% cut)`);
  console.log(`  Projects: ${beforeProjects} → ${afterProjects} (${beforeProjects - afterProjects} canceled)`);
  console.log(`  Data centers: ${beforeDCs} → ${afterDCs} (${beforeDCs - afterDCs} sold)`);

  if (testOrg.distressMeasuresTaken && testOrg.distressMeasuresTaken.length > 0) {
    console.log(`\n  Measures taken: ${testOrg.distressMeasuresTaken.join(', ')}`);
  }

  // Advance time
  state.currentMonth++;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear++;
  }

  // Check if bankrupt
  if (testOrg.bankrupt) {
    console.log('\n💥 ORGANIZATION BANKRUPT - Turnaround measures failed');
    break;
  }
}

console.log('\n\n=== FINAL STATE ===');
console.log(`Capital: $${testOrg.capital.toFixed(1)}M`);
console.log(`Workforce: ${((testOrg.workforceMultiplier ?? 1.0) * 100).toFixed(0)}% remaining (${((1 - (testOrg.workforceMultiplier ?? 1.0)) * 100).toFixed(0)}% laid off)`);
console.log(`R&D budget: ${((testOrg.rdBudgetMultiplier ?? 1.0) * 100).toFixed(0)}% remaining (${((1 - (testOrg.rdBudgetMultiplier ?? 1.0)) * 100).toFixed(0)}% cut)`);
console.log(`Projects: ${testOrg.currentProjects.length}`);
console.log(`Data centers: ${testOrg.ownedDataCenters.length}`);
console.log(`Bankrupt: ${testOrg.bankrupt ? 'YES' : 'NO'}`);

console.log('\n✅ Validation complete');

// Expected progression:
// Month 1: R&D cuts (25-40%), exec comp cuts
// Month 2: Project cancellations (if any exist)
// Month 3: Layoffs (10-15%)
// Month 4: Asset sales (1-2 data centers)
// Month 5: Deeper layoffs (15-20% more)

console.log('\n📋 Expected behavior:');
console.log('  ✓ Month 1: R&D cuts, exec comp cuts');
console.log('  ✓ Month 2: Project cancellations');
console.log('  ✓ Month 3: Initial layoffs (10-15%)');
console.log('  ✓ Month 4: Asset sales (data centers)');
console.log('  ✓ Month 5+: Deeper layoffs (15-20%)');
console.log('  ✓ Runway should extend with each measure');
console.log('  ✓ Side effects: workforce/R&D multipliers < 1.0');
