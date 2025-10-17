#!/usr/bin/env tsx
/**
 * Debug script to trace orphan AI creation in real-time
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';

console.log('\n🔍 TRACING ORPHAN AI CREATION');
console.log('='.repeat(80));

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 96000, maxMonths: 120 });

// Track organization bankruptcy events
const bankruptcyEvents = new Map<string, number>(); // orgId -> month bankrupt

// Suppress most output
const originalLog = console.log;
let captureOrphanWarnings = true;

console.log = (...args: any[]) => {
  const message = args.join(' ');

  // Capture bankruptcy events
  if (message.includes('ORGANIZATION BANKRUPTCY:')) {
    const match = message.match(/ORGANIZATION BANKRUPTCY: (.+)/);
    if (match) {
      // Will be captured in next check
    }
  }

  if (message.includes('declared bankruptcy')) {
    const match = message.match(/💥 \[Run [^\]]+\] \[Month (\d+)\] (.+) declared/);
    if (match) {
      const month = parseInt(match[1]);
      const orgName = match[2];
      bankruptcyEvents.set(orgName, month);
      originalLog(`\n⚠️  [Month ${month}] ${orgName} went BANKRUPT`);
    }
  }

  // Capture government acquisitions
  if (message.includes('Government acquired')) {
    originalLog(`   ${message}`);
  }

  // Capture retirements
  if (message.includes('Retired') && message.includes('AI models')) {
    originalLog(`   ${message}`);
  }
};

const result = engine.run(initialState, {
  maxMonths: 120,
  checkActualOutcomes: false,
  onMonthEnd: (state: GameState) => {
    // Check for orphan AIs every 12 months
    if (state.currentMonth % 12 === 0) {
      const orphans: string[] = [];

      state.organizations.forEach(org => {
        if (org.bankrupt && org.ownedAIModels.length > 0) {
          const bankruptMonth = bankruptcyEvents.get(org.name) || '?';
          orphans.push(`${org.name} (bankrupt month ${bankruptMonth}, owns ${org.ownedAIModels.length} AIs)`);
        }
      });

      if (orphans.length > 0 && captureOrphanWarnings) {
        originalLog(`\n❌ [Month ${state.currentMonth}] ORPHAN AIs DETECTED:`);
        orphans.forEach(o => originalLog(`   - ${o}`));
      }
    }
  }
});

console.log = originalLog;

// Final analysis
console.log('\n\n📊 FINAL STATE ANALYSIS');
console.log('='.repeat(80));

result.finalState.organizations.forEach(org => {
  if (org.bankrupt) {
    const bankruptMonth = bankruptcyEvents.get(org.name) || '?';
    const aiCount = org.ownedAIModels.length;
    const status = aiCount > 0 ? '❌' : '✅';

    console.log(`${status} ${org.name}:`);
    console.log(`   Bankrupt: Month ${bankruptMonth}`);
    console.log(`   AI models owned: ${aiCount}`);

    if (aiCount > 0) {
      console.log(`   Orphan AI IDs: ${org.ownedAIModels.slice(0, 5).join(', ')}${aiCount > 5 ? '...' : ''}`);

      // Check if these AIs actually exist
      const existingAIs = org.ownedAIModels.filter(aiId =>
        result.finalState.aiAgents.some(ai => ai.id === aiId)
      );

      console.log(`   AIs that exist in aiAgents: ${existingAIs.length}/${aiCount}`);

      if (existingAIs.length > 0) {
        const sampleAI = result.finalState.aiAgents.find(ai => ai.id === existingAIs[0]);
        if (sampleAI) {
          console.log(`   Sample AI: ${sampleAI.id}, lifecycle: ${sampleAI.lifecycleState}, orgId: ${sampleAI.organizationId || 'undefined'}`);
        }
      }
    }
  }
});

// Count total orphans
const totalOrphans = result.finalState.organizations
  .filter(o => o.bankrupt)
  .reduce((sum, o) => sum + o.ownedAIModels.length, 0);

console.log(`\n📊 Total orphan AIs: ${totalOrphans}`);

if (totalOrphans > 0) {
  console.log('\n❌ BUG CONFIRMED: handleBankruptcy() not clearing ownedAIModels properly');
} else {
  console.log('\n✅ No orphan AIs detected - bug fixed!');
}

console.log('\n✅ Debug analysis complete!\n');
