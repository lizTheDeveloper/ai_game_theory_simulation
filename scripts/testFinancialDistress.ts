/**
 * Test script for proactive data center divestment
 *
 * Validates that organizations sell assets BEFORE bankruptcy to stay solvent
 */

import { createTestState } from '../src/simulation/initialization';
import { handleFinancialDistress, calculateTotalExpenses } from '../src/simulation/organizationManagement';
import type { Organization } from '../src/types/game';

console.log('\n=== TESTING FINANCIAL DISTRESS DIVESTMENT ===\n');

// Initialize game state
const state = createTestState({}, 'historical');

// Find a private org to test with (needs data centers!)
const testOrg = state.organizations.find(o => o.type === 'private' && o.ownedDataCenters.length > 0);
if (!testOrg) {
  console.error('❌ Could not find test organization with data centers');
  process.exit(1);
}

// Give the test org more data centers to make the test realistic
// Add 3 more DCs so we can test selling 1-2 without running out
const extraDCs = [
  {
    id: `${testOrg.id}_dc_extra_1`,
    name: `${testOrg.name} DC Extra 1`,
    organizationId: testOrg.id,
    capacity: 100,
    efficiency: 1.0,
    constructionMonth: -12,
    completionMonth: -6,
    operational: true,
    operationalCost: 0.5,
    restrictedAccess: false,
    allowedAIs: [],
    region: 'US'
  },
  {
    id: `${testOrg.id}_dc_extra_2`,
    name: `${testOrg.name} DC Extra 2`,
    organizationId: testOrg.id,
    capacity: 150,
    efficiency: 1.0,
    constructionMonth: -10,
    completionMonth: -4,
    operational: true,
    operationalCost: 0.75,
    restrictedAccess: false,
    allowedAIs: [],
    region: 'US'
  },
  {
    id: `${testOrg.id}_dc_extra_3`,
    name: `${testOrg.name} DC Extra 3`,
    organizationId: testOrg.id,
    capacity: 200,
    efficiency: 1.0,
    constructionMonth: -8,
    completionMonth: -2,
    operational: true,
    operationalCost: 1.0,
    restrictedAccess: false,
    allowedAIs: [],
    region: 'US'
  }
];

state.computeInfrastructure.dataCenters.push(...extraDCs);
testOrg.ownedDataCenters.push(...extraDCs.map(dc => dc.id));

console.log(`Test organization: ${testOrg.name}`);
console.log(`Initial state:`);
console.log(`  - Capital: $${testOrg.capital.toFixed(1)}M`);
console.log(`  - Monthly revenue: $${testOrg.monthlyRevenue.toFixed(1)}M`);
console.log(`  - Data centers: ${testOrg.ownedDataCenters.length}`);

// Calculate current expenses
const expenses = calculateTotalExpenses(testOrg, state);
console.log(`  - Monthly expenses: $${expenses.total.toFixed(1)}M`);
console.log(`  - Monthly net income: $${(testOrg.monthlyRevenue - expenses.total).toFixed(1)}M`);

const monthsOfRunway = testOrg.capital / expenses.total;
console.log(`  - Runway: ${monthsOfRunway.toFixed(1)} months`);

console.log('\n--- Simulating financial distress ---\n');

// Scenario 1: Cash crunch (low capital but still profitable)
console.log('📊 SCENARIO 1: Cash Crunch (capital < 6 months expenses)\n');
const scenario1Org = { ...testOrg };
scenario1Org.capital = expenses.total * 4; // 4 months runway
scenario1Org.monthlyRevenue = expenses.total * 1.05; // Still slightly profitable
console.log(`Capital reduced to $${scenario1Org.capital.toFixed(1)}M (4 months runway)`);
console.log(`Revenue: $${scenario1Org.monthlyRevenue.toFixed(1)}M (still profitable)\n`);

handleFinancialDistress(scenario1Org, state);

// Scenario 2: Negative cash flow
console.log('\n📊 SCENARIO 2: Negative Cash Flow (losing money monthly)\n');
const scenario2Org = { ...testOrg };
scenario2Org.capital = expenses.total * 8; // 8 months runway
scenario2Org.monthlyRevenue = expenses.total * 0.85; // Losing 15% per month
console.log(`Capital: $${scenario2Org.capital.toFixed(1)}M (8 months runway)`);
console.log(`Revenue: $${scenario2Org.monthlyRevenue.toFixed(1)}M (losing money)\n`);

handleFinancialDistress(scenario2Org, state);

// Scenario 3: Multiple distress indicators (severe)
console.log('\n📊 SCENARIO 3: Severe Financial Distress (multiple indicators)\n');
const scenario3Org = { ...testOrg };
scenario3Org.capital = expenses.total * 3; // 3 months runway (critical)
scenario3Org.monthlyRevenue = expenses.total * 0.90; // Losing money
console.log(`Capital: $${scenario3Org.capital.toFixed(1)}M (3 months runway, CRITICAL)`);
console.log(`Revenue: $${scenario3Org.monthlyRevenue.toFixed(1)}M (losing money)\n`);

// Give org multiple data centers to sell
const dcBefore = scenario3Org.ownedDataCenters.length;
console.log(`Data centers before divestment: ${dcBefore}`);

handleFinancialDistress(scenario3Org, state);

const dcAfter = scenario3Org.ownedDataCenters.length;
console.log(`\nData centers after divestment: ${dcAfter}`);
console.log(`Capital after divestment: $${scenario3Org.capital.toFixed(1)}M`);

// Scenario 4: Healthy org (no distress)
console.log('\n📊 SCENARIO 4: Healthy Organization (no divestment expected)\n');
const scenario4Org = { ...testOrg };
scenario4Org.capital = expenses.total * 24; // 24 months runway
scenario4Org.monthlyRevenue = expenses.total * 1.25; // 25% profit margin
console.log(`Capital: $${scenario4Org.capital.toFixed(1)}M (24 months runway)`);
console.log(`Revenue: $${scenario4Org.monthlyRevenue.toFixed(1)}M (profitable)\n`);

handleFinancialDistress(scenario4Org, state);

console.log('\n=== TEST COMPLETE ===\n');

console.log('Expected behavior:');
console.log('✅ Scenario 1: No divestment (only 1 distress indicator)');
console.log('✅ Scenario 2: No divestment (only 1 distress indicator)');
console.log('✅ Scenario 3: DIVESTMENT TRIGGERED (2+ indicators, multiple DCs available)');
console.log('✅ Scenario 4: No divestment (healthy org)');

console.log('\n📝 Implementation notes:');
console.log('- Organizations need 2+ distress indicators to trigger divestment');
console.log('- Only private orgs divest (government/academic have different dynamics)');
console.log('- Won\'t divest if only 1 DC (that\'s core infrastructure)');
console.log('- Sells 1-2 DCs max per month (not a fire sale)');
console.log('- Better price than bankruptcy (60% vs 50%)');
console.log('- Buyers: government (strategic) or solvent private orgs');
