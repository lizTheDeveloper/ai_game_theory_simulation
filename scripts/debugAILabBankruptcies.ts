#!/usr/bin/env tsx
/**
 * Debug Script for TIER 0D Bug #4: AI Lab Financial Model
 *
 * Investigates why organizations go bankrupt months 70-120 with no simulation effects.
 *
 * Key questions:
 * 1. Are organizations actually going bankrupt?
 * 2. When do they go bankrupt (which months)?
 * 3. What causes bankruptcy (population vs financial)?
 * 4. Are AI models being retired when orgs go bankrupt?
 * 5. Are data centers being transferred?
 * 6. What are the simulation effects (AI count, compute capacity, etc.)?
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { generateDistributionReport } from './utils/statisticalAnalysis';

interface BankruptcyEvent {
  month: number;
  orgName: string;
  orgType: string;
  reason: string;
  capitalAtBankruptcy: number;
  aiModelsRetired: number;
  dataCentersTransferred: number;
}

interface MonthSnapshot {
  month: number;
  totalOrgs: number;
  bankruptOrgs: number;
  totalAIs: number;
  deployedAIs: number;
  retiredAIs: number;
  totalDataCenters: number;
  governmentDataCenters: number;
  totalCompute: number;
}

// Hook into console.log to capture bankruptcy events
let bankruptcyEvents: BankruptcyEvent[] = [];
let monthSnapshots: MonthSnapshot[] = [];

console.log('\n🔍 DEBUGGING AI LAB BANKRUPTCIES (TIER 0D Bug #4)');
console.log('='.repeat(80));
console.log('\nRunning 120-month simulation to observe organization bankruptcies...\n');

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 95000, maxMonths: 120 });

// Capture console output for bankruptcy events
const originalLog = console.log;
let captureBankruptcy = false;
let currentBankruptcyEvent: Partial<BankruptcyEvent> = {};

console.log = (...args: any[]) => {
  const message = args.join(' ');

  // Detect bankruptcy announcement
  if (message.includes('ORGANIZATION BANKRUPTCY:')) {
    captureBankruptcy = true;
    const orgName = message.split('ORGANIZATION BANKRUPTCY:')[1]?.trim();
    currentBankruptcyEvent = { orgName };
  }

  // Capture bankruptcy details
  if (captureBankruptcy) {
    if (message.includes('Reason:')) {
      currentBankruptcyEvent.reason = message.split('Reason:')[1]?.trim();
    }
    if (message.includes('Month:')) {
      const monthMatch = message.match(/Month: (\d+)/);
      if (monthMatch) {
        currentBankruptcyEvent.month = parseInt(monthMatch[1]);
      }
    }
  }

  // Detect bankruptcy completion (handleBankruptcy output)
  if (message.includes('declared bankruptcy')) {
    const capitalMatch = message.match(/capital: \$([0-9.-]+)M/);
    if (capitalMatch) {
      currentBankruptcyEvent.capitalAtBankruptcy = parseFloat(capitalMatch[1]);
    }
  }

  if (message.includes('Retired') && message.includes('AI models')) {
    const countMatch = message.match(/Retired (\d+) AI models/);
    if (countMatch) {
      currentBankruptcyEvent.aiModelsRetired = parseInt(countMatch[1]);
    }
  }

  if (message.includes('Sold') && message.includes('data centers')) {
    const countMatch = message.match(/Sold (\d+) data centers/);
    if (countMatch) {
      currentBankruptcyEvent.dataCentersTransferred = parseInt(countMatch[1]);
    }
  }

  // End of bankruptcy event
  if (message.includes('BANKRUPT') && currentBankruptcyEvent.orgName) {
    captureBankruptcy = false;
    if (currentBankruptcyEvent.month) {
      bankruptcyEvents.push(currentBankruptcyEvent as BankruptcyEvent);
    }
    currentBankruptcyEvent = {};
  }

  // Suppress all output during simulation
  // originalLog(...args);
};

// Run simulation with monthly snapshots
const result = engine.run(initialState, {
  maxMonths: 120,
  checkActualOutcomes: false,
  onMonthEnd: (state: GameState) => {
    // Take snapshot every 12 months
    if (state.currentMonth % 12 === 0) {
      const snapshot: MonthSnapshot = {
        month: state.currentMonth,
        totalOrgs: state.organizations.length,
        bankruptOrgs: state.organizations.filter(o => o.bankrupt).length,
        totalAIs: state.aiAgents.length,
        deployedAIs: state.aiAgents.filter(ai =>
          ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open'
        ).length,
        retiredAIs: state.aiAgents.filter(ai => ai.lifecycleState === 'retired').length,
        totalDataCenters: state.computeInfrastructure.dataCenters.length,
        governmentDataCenters: state.computeInfrastructure.dataCenters.filter(dc =>
          dc.organizationId === 'government' || dc.organizationId === 'government_ai'
        ).length,
        totalCompute: state.computeInfrastructure.dataCenters
          .filter(dc => dc.operational)
          .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0),
      };
      monthSnapshots.push(snapshot);
    }
  }
});

console.log = originalLog;

// === ANALYSIS ===

console.log('\n📊 BANKRUPTCY TIMELINE');
console.log('='.repeat(80));

if (bankruptcyEvents.length === 0) {
  console.log('✅ NO BANKRUPTCIES DETECTED (months 0-120)');
  console.log('\nThis suggests the bug may be:');
  console.log('  1. Seed-specific (try different seeds)');
  console.log('  2. Already fixed in current codebase');
  console.log('  3. Requires specific conditions (population collapse, crisis cascades)');
} else {
  console.log(`\n❌ ${bankruptcyEvents.length} BANKRUPTCIES DETECTED:\n`);

  bankruptcyEvents.forEach((event, i) => {
    console.log(`${i + 1}. ${event.orgName} (Month ${event.month})`);
    console.log(`   Reason: ${event.reason || 'Unknown'}`);
    console.log(`   Capital at bankruptcy: $${event.capitalAtBankruptcy?.toFixed(1) || '?'}M`);
    console.log(`   AI models retired: ${event.aiModelsRetired ?? '?'}`);
    console.log(`   Data centers transferred: ${event.dataCentersTransferred ?? '?'}`);
    console.log();
  });

  // Analyze timing
  const bankruptcyMonths = bankruptcyEvents.map(e => e.month);
  console.log('📈 TIMING ANALYSIS:');
  console.log(`   First bankruptcy: Month ${Math.min(...bankruptcyMonths)}`);
  console.log(`   Last bankruptcy: Month ${Math.max(...bankruptcyMonths)}`);
  console.log(`   Average bankruptcy month: ${(bankruptcyMonths.reduce((s, m) => s + m, 0) / bankruptcyMonths.length).toFixed(1)}`);

  // Use statistical analysis tool
  console.log(generateDistributionReport(
    bankruptcyMonths.map(m => m / 120), // Normalize to 0-1
    'Bankruptcy Timing',
    ''
  ));
}

// === SIMULATION EFFECTS ANALYSIS ===

console.log('\n📊 SIMULATION EFFECTS OVER TIME');
console.log('='.repeat(80));

console.log('\n┌────────┬───────────┬───────────┬───────────┬───────────┬───────────┬───────────┐');
console.log('│ Month  │ Total Org │ Bankrupt  │ Total AIs │ Deployed  │ Retired   │ Gov DCs   │');
console.log('├────────┼───────────┼───────────┼───────────┼───────────┼───────────┼───────────┤');

monthSnapshots.forEach(snap => {
  const month = snap.month.toString().padStart(6);
  const totalOrgs = snap.totalOrgs.toString().padStart(9);
  const bankruptOrgs = snap.bankruptOrgs.toString().padStart(9);
  const totalAIs = snap.totalAIs.toString().padStart(9);
  const deployedAIs = snap.deployedAIs.toString().padStart(9);
  const retiredAIs = snap.retiredAIs.toString().padStart(9);
  const govDCs = snap.governmentDataCenters.toString().padStart(9);

  console.log(`│ ${month} │ ${totalOrgs} │ ${bankruptOrgs} │ ${totalAIs} │ ${deployedAIs} │ ${retiredAIs} │ ${govDCs} │`);
});

console.log('└────────┴───────────┴───────────┴───────────┴───────────┴───────────┴───────────┘');

// === FINAL STATE ANALYSIS ===

console.log('\n📊 FINAL STATE (Month 120)');
console.log('='.repeat(80));

const finalState = result.finalState;
const bankruptOrgNames = finalState.organizations.filter(o => o.bankrupt).map(o => o.name);

console.log(`\nOrganizations (${finalState.organizations.length} total):`);
finalState.organizations.forEach(org => {
  const status = org.bankrupt ? '💀 BANKRUPT' : '✅ ACTIVE';
  const capital = org.capital.toFixed(1);
  const revenue = org.monthlyRevenue.toFixed(1);
  const expenses = org.monthlyExpenses.toFixed(1);
  const datacenters = org.ownedDataCenters.length;
  const models = org.ownedAIModels.length;

  console.log(`  ${status} ${org.name}:`);
  console.log(`    Capital: $${capital}M | Revenue: $${revenue}M/mo | Expenses: $${expenses}M/mo`);
  console.log(`    Data Centers: ${datacenters} | AI Models: ${models}`);

  if (org.bankrupt && org.bankruptcyMonth) {
    console.log(`    Bankrupt since: Month ${org.bankruptcyMonth} (${org.bankruptcyReason || 'Unknown reason'})`);
  }
});

console.log(`\nAI Agents (${finalState.aiAgents.length} total):`);
const deployedClosed = finalState.aiAgents.filter(ai => ai.lifecycleState === 'deployed_closed').length;
const deployedOpen = finalState.aiAgents.filter(ai => ai.lifecycleState === 'deployed_open').length;
const retired = finalState.aiAgents.filter(ai => ai.lifecycleState === 'retired').length;
const training = finalState.aiAgents.filter(ai => ai.lifecycleState === 'training').length;
const testing = finalState.aiAgents.filter(ai => ai.lifecycleState === 'testing').length;

console.log(`  Deployed (closed): ${deployedClosed}`);
console.log(`  Deployed (open): ${deployedOpen}`);
console.log(`  Retired: ${retired}`);
console.log(`  Training: ${training}`);
console.log(`  Testing: ${testing}`);

console.log(`\nData Centers (${finalState.computeInfrastructure.dataCenters.length} total):`);
const governmentDCs = finalState.computeInfrastructure.dataCenters.filter(dc =>
  dc.organizationId === 'government' || dc.organizationId === 'government_ai'
).length;
const privateDCs = finalState.computeInfrastructure.dataCenters.filter(dc =>
  dc.organizationId !== 'government' && dc.organizationId !== 'government_ai'
).length;

console.log(`  Government-owned: ${governmentDCs}`);
console.log(`  Private-owned: ${privateDCs}`);

// === KEY FINDINGS ===

console.log('\n💡 KEY FINDINGS');
console.log('='.repeat(80));

if (bankruptcyEvents.length === 0) {
  console.log('\n✅ NO BANKRUPTCY BUG DETECTED');
  console.log('\nPossible explanations:');
  console.log('  1. Bug already fixed in current codebase');
  console.log('  2. Bug requires specific seeds or scenarios');
  console.log('  3. Bug requires longer simulations (>120 months)');
  console.log('  4. Bug requires specific crisis combinations');

  console.log('\nRecommended next steps:');
  console.log('  1. Run Monte Carlo with N=10 to test multiple seeds');
  console.log('  2. Test specific crisis scenarios (population collapse)');
  console.log('  3. Review recent commits for bankruptcy fixes');
} else {
  console.log('\n❌ BANKRUPTCY BUG CONFIRMED');
  console.log(`\n${bankruptcyEvents.length} organizations went bankrupt (months ${Math.min(...bankruptcyMonths)}-${Math.max(...bankruptcyMonths)})`);

  // Check if effects are present
  const totalRetired = bankruptcyEvents.reduce((sum, e) => sum + (e.aiModelsRetired || 0), 0);
  const totalTransferred = bankruptcyEvents.reduce((sum, e) => sum + (e.dataCentersTransferred || 0), 0);

  console.log(`\n📊 Bankruptcy Effects:`);
  console.log(`  AI models retired: ${totalRetired}`);
  console.log(`  Data centers transferred: ${totalTransferred}`);

  if (totalRetired === 0 && totalTransferred === 0) {
    console.log('\n❌ BUG CONFIRMED: Bankruptcies have NO EFFECTS!');
    console.log('   Organizations go bankrupt but AI models not retired, DCs not transferred');
    console.log('\n   Likely causes:');
    console.log('   1. handleBankruptcy() not being called');
    console.log('   2. Bankruptcy flag set but cleanup not executed');
    console.log('   3. AI retirement logic broken');
  } else {
    console.log('\n✅ Bankruptcy effects ARE working');
    console.log('   AI models retired and data centers transferred as expected');
    console.log('\n   Bug report may be:');
    console.log('   1. Out of date (already fixed)');
    console.log('   2. Effects too subtle (need better metrics)');
    console.log('   3. Population collapse makes bankruptcies irrelevant');
  }

  // Check org type patterns
  const privateB = bankruptcyEvents.filter(e => e.orgType === 'private').length;
  const govB = bankruptcyEvents.filter(e => e.orgType === 'government').length;
  const academicB = bankruptcyEvents.filter(e => e.orgType === 'academic').length;

  console.log(`\n📊 Bankruptcy by Organization Type:`);
  console.log(`  Private: ${privateB}/${bankruptcyEvents.length}`);
  console.log(`  Government: ${govB}/${bankruptcyEvents.length}`);
  console.log(`  Academic: ${academicB}/${bankruptcyEvents.length}`);
}

console.log('\n✅ Debug analysis complete!\n');
