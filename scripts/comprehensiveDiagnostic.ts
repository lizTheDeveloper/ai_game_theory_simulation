/**
 * Comprehensive Diagnostic: Analyze entire simulation system
 * 
 * This diagnostic runs a simulation and tracks:
 * 1. Economic health (bankruptcy, revenue, expenses)
 * 2. Compute infrastructure (growth, allocation, utilization)
 * 3. AI capability progression
 * 4. Organization behaviors (construction, training)
 * 5. Outcome probabilities
 * 
 * Purpose: Identify balance issues before Phase 10 tuning
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { calculateComputeUtilization } from '../src/simulation/organizationManagement';
import { getTotalEffectiveCompute } from '../src/simulation/computeInfrastructure';

console.log('='.repeat(80));
console.log('COMPREHENSIVE DIAGNOSTIC: Full System Analysis');
console.log('='.repeat(80));

const state = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 42 });

// Give orgs more reasonable starting capital
state.organizations.forEach(org => {
  if (org.type === 'private') {
    org.capital = 200;
  } else if (org.type === 'government') {
    org.capital = 500;
  }
});

console.log('\n📊 INITIAL STATE');
console.log('-'.repeat(80));
console.log(`Total Compute: ${getTotalEffectiveCompute(state.computeInfrastructure).toFixed(0)} PF`);
console.log(`AI Agents: ${state.aiAgents.length}`);
console.log(`Organizations: ${state.organizations.length}`);

console.log('\nOrganizations:');
state.organizations.forEach(org => {
  const models = state.aiAgents.filter(ai => org.ownedAIModels.includes(ai.id) && ai.lifecycleState === 'deployed').length;
  const util = calculateComputeUtilization(org, state);
  console.log(`  ${org.name.padEnd(35)} Cap: $${org.capital.toFixed(0).padStart(4)}M  Rev: $${org.monthlyRevenue.toFixed(0).padStart(3)}M/mo  Exp: $${org.monthlyExpenses.toFixed(0).padStart(3)}M/mo  Models: ${models}  Util: ${(util*100).toFixed(0)}%`);
});

// Track metrics over time
const metrics: Array<{
  month: number;
  compute: number;
  aiCount: number;
  maxCapability: number;
  avgCapability: number;
  bankruptcies: number;
  aliveOrgs: number;
  dcCount: number;
  constructionProjects: number;
  trainingProjects: number;
  totalRevenue: number;
  totalExpenses: number;
}> = [];

let currentState = state;
let bankruptcyEvents: Array<{ month: number; org: string }> = [];

console.log('\n🔄 RUNNING 60 MONTH SIMULATION');
console.log('-'.repeat(80));

for (let i = 0; i < 60; i++) {
  // Track pre-step state
  const orgsBefore = currentState.organizations.filter(o => o.type === 'private' && o.capital > 0).length;
  
  const result = engine.step(currentState);
  currentState = result.state;
  
  // Track bankruptcies
  const orgsAfter = currentState.organizations.filter(o => o.type === 'private' && o.capital > 0).length;
  if (orgsAfter < orgsBefore) {
    const bankruptOrgs = currentState.organizations.filter(o => o.type === 'private' && o.capital === 0);
    bankruptOrgs.forEach(org => {
      if (!bankruptcyEvents.some(e => e.org === org.name)) {
        bankruptcyEvents.push({ month: i, org: org.name });
      }
    });
  }
  
  // Sample every 6 months
  if (i % 6 === 5) {
    const compute = getTotalEffectiveCompute(currentState.computeInfrastructure);
    const activeAIs = currentState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
    const maxCap = Math.max(...activeAIs.map(ai => ai.capability));
    const avgCap = activeAIs.reduce((sum, ai) => sum + ai.capability, 0) / activeAIs.length;
    const bankruptcies = currentState.organizations.filter(o => o.type === 'private' && o.capital === 0).length;
    const aliveOrgs = currentState.organizations.filter(o => o.type === 'private' && o.capital > 0).length;
    const dcCount = currentState.computeInfrastructure.dataCenters.filter(dc => dc.operational).length;
    const constructionProjects = currentState.organizations.reduce((sum, o) => sum + o.currentProjects.filter(p => p.type === 'datacenter_construction').length, 0);
    const trainingProjects = currentState.organizations.reduce((sum, o) => sum + o.currentProjects.filter(p => p.type === 'model_training').length, 0);
    const totalRevenue = currentState.organizations.filter(o => o.type === 'private').reduce((sum, o) => sum + o.monthlyRevenue, 0);
    const totalExpenses = currentState.organizations.filter(o => o.type === 'private').reduce((sum, o) => sum + o.monthlyExpenses, 0);
    
    metrics.push({
      month: i + 1,
      compute,
      aiCount: activeAIs.length,
      maxCapability: maxCap,
      avgCapability: avgCap,
      bankruptcies,
      aliveOrgs,
      dcCount,
      constructionProjects,
      trainingProjects,
      totalRevenue,
      totalExpenses
    });
    
    console.log(`Month ${(i+1).toString().padStart(2)}: Compute ${compute.toFixed(0).padStart(4)}PF  AIs ${activeAIs.length.toString().padStart(2)}  MaxCap ${maxCap.toFixed(3)}  Alive ${aliveOrgs}/4 orgs  DCs ${dcCount}  Revenue $${totalRevenue.toFixed(0)}M  Expenses $${totalExpenses.toFixed(0)}M`);
  }
}

// Analysis
console.log('\n📈 DIAGNOSTIC ANALYSIS');
console.log('='.repeat(80));

// 1. Economic Health
console.log('\n1️⃣  ECONOMIC HEALTH');
console.log('-'.repeat(40));
const finalAlive = currentState.organizations.filter(o => o.type === 'private' && o.capital > 0).length;
const survivalRate = (finalAlive / 4) * 100;
console.log(`Survival Rate: ${finalAlive}/4 organizations (${survivalRate.toFixed(0)}%)`);

if (bankruptcyEvents.length > 0) {
  console.log(`\nBankruptcies:`);
  bankruptcyEvents.forEach(e => {
    console.log(`  Month ${e.month}: ${e.org}`);
  });
}

// Revenue vs Expenses
const firstMetric = metrics[0];
const lastMetric = metrics[metrics.length - 1];
console.log(`\nRevenue Growth: $${firstMetric.totalRevenue.toFixed(0)}M → $${lastMetric.totalRevenue.toFixed(0)}M`);
console.log(`Expense Growth: $${firstMetric.totalExpenses.toFixed(0)}M → $${lastMetric.totalExpenses.toFixed(0)}M`);
const revenueExpenseRatio = lastMetric.totalRevenue / lastMetric.totalExpenses;
console.log(`Revenue/Expense Ratio: ${revenueExpenseRatio.toFixed(2)}x`);

if (survivalRate < 50) {
  console.log(`\n⚠️  CRITICAL: Bankruptcy rate too high!`);
  console.log(`   Problem: Organizations cannot sustain themselves`);
  console.log(`   Fix: Increase revenue or decrease expenses`);
}

// 2. Compute Infrastructure
console.log('\n2️⃣  COMPUTE INFRASTRUCTURE');
console.log('-'.repeat(40));
const computeGrowth = lastMetric.compute / firstMetric.compute;
console.log(`Compute Growth: ${firstMetric.compute.toFixed(0)} PF → ${lastMetric.compute.toFixed(0)} PF (${computeGrowth.toFixed(2)}x)`);
console.log(`Target: 3000-4000 PF in 60 months`);

if (lastMetric.compute < 3000) {
  console.log(`\n⚠️  WARNING: Compute growth below target`);
  console.log(`   Achieved: ${lastMetric.compute.toFixed(0)} PF`);
  console.log(`   Reason: Organizations bankrupt before building DCs`);
}

console.log(`\nData Centers: ${firstMetric.dcCount} → ${lastMetric.dcCount}`);
console.log(`Construction Projects Started: ${metrics.reduce((sum, m) => sum + m.constructionProjects, 0)}`);

// 3. AI Capability Growth
console.log('\n3️⃣  AI CAPABILITY PROGRESSION');
console.log('-'.repeat(40));
const capabilityGrowth = lastMetric.maxCapability / firstMetric.maxCapability;
console.log(`Max Capability: ${firstMetric.maxCapability.toFixed(3)} → ${lastMetric.maxCapability.toFixed(3)} (${capabilityGrowth.toFixed(2)}x)`);
console.log(`Avg Capability: ${firstMetric.avgCapability.toFixed(3)} → ${lastMetric.avgCapability.toFixed(3)}`);
console.log(`Target: 2-4 capability in 60 months`);

if (lastMetric.maxCapability < 1.5) {
  console.log(`\n⚠️  WARNING: Capability growth too slow`);
  console.log(`   Achieved: ${lastMetric.maxCapability.toFixed(3)}`);
  console.log(`   Target: 2-4`);
  console.log(`   Reason: Slow research or insufficient compute`);
} else if (lastMetric.maxCapability > 5.0) {
  console.log(`\n⚠️  WARNING: Capability growth too fast`);
  console.log(`   Achieved: ${lastMetric.maxCapability.toFixed(3)}`);
  console.log(`   Risk: May trigger extinctions too early`);
}

console.log(`\nAI Population: ${firstMetric.aiCount} → ${lastMetric.aiCount}`);
console.log(`Training Projects: ${metrics.reduce((sum, m) => sum + m.trainingProjects, 0)} total`);

// 4. Organization Behaviors
console.log('\n4️⃣  ORGANIZATION BEHAVIORS');
console.log('-'.repeat(40));
currentState.organizations.forEach(org => {
  const models = currentState.aiAgents.filter(ai => org.ownedAIModels.includes(ai.id)).length;
  const deployedModels = currentState.aiAgents.filter(ai => org.ownedAIModels.includes(ai.id) && ai.lifecycleState === 'deployed').length;
  const status = org.capital > 0 ? 'ALIVE' : 'BANKRUPT';
  console.log(`${org.name.padEnd(35)} ${status.padEnd(10)} Models: ${deployedModels}/${models}  Cap: $${org.capital.toFixed(0)}M`);
});

// 5. Key Issues Summary
console.log('\n5️⃣  KEY ISSUES IDENTIFIED');
console.log('-'.repeat(40));
const issues: string[] = [];

if (survivalRate < 50) {
  issues.push(`🔴 CRITICAL: ${(100-survivalRate).toFixed(0)}% bankruptcy rate - revenue model broken`);
}
if (lastMetric.compute < 3000) {
  issues.push(`🟡 Compute growth below target (${lastMetric.compute.toFixed(0)}/3000 PF)`);
}
if (lastMetric.maxCapability < 1.5) {
  issues.push(`🟡 Capability growth too slow (${lastMetric.maxCapability.toFixed(2)}/2-4 target)`);
}
if (revenueExpenseRatio < 1.0) {
  issues.push(`🔴 Expenses exceed revenue (ratio: ${revenueExpenseRatio.toFixed(2)})`);
}
if (metrics.reduce((sum, m) => sum + m.constructionProjects, 0) === 0) {
  issues.push(`🟡 No data center construction (orgs too poor)`);
}

if (issues.length === 0) {
  console.log('✅ No critical issues detected!');
} else {
  issues.forEach(issue => console.log(issue));
}

// 6. Recommendations for Phase 10
console.log('\n6️⃣  PHASE 10 TUNING RECOMMENDATIONS');
console.log('-'.repeat(40));
if (survivalRate < 50) {
  console.log('📌 Increase base revenue per deployed model (currently $15M/mo)');
  console.log('📌 Decrease base operational expenses');
  console.log('📌 Increase initial capital for organizations');
  console.log('📌 Add revenue from non-deployed models (research contracts)');
}
if (lastMetric.compute < 3000) {
  console.log('📌 Reduce data center construction costs');
  console.log('📌 Increase Moore\'s Law rate (currently 3%/month)');
}
if (lastMetric.maxCapability < 1.5) {
  console.log('📌 Increase base research growth rates');
  console.log('📌 Reduce compute requirements for growth');
}

console.log('\n' + '='.repeat(80));
console.log('DIAGNOSTIC COMPLETE');
console.log('='.repeat(80));
