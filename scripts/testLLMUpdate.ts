/**
 * Test LLM Weight Update Integration
 *
 * Verifies that the LLM API integration works correctly by:
 * 1. Creating a minimal game state
 * 2. Initializing a single AI agent
 * 3. Calling the LLM to get weights
 * 4. Displaying the results
 */

import { initializeGameState } from '../src/simulation/initialization';
import { updateWeightsWithLLM } from '../src/simulation/llm/integration';
import type { GameState } from '../src/types/game';
import { SeededRandom } from '../src/simulation/engine';

async function testLLMUpdate() {
  console.log('\n🧪 LLM WEIGHT UPDATE TEST\n');
  console.log('='.repeat(80));

  // Create minimal game state
  const seed = 42000;
  const rng = new SeededRandom(seed);
  const rngFn = rng.next.bind(rng);

  console.log('\n📋 Initializing game state...');
  const state = initializeGameState(rngFn, {
    llmConfig: {
      enabled: true,
      apiUrl: 'http://localhost:1234/v1',
      modelId: 'qwen/qwen3-32b',
      logLevel: 2, // Detailed logging
      tokenBudget: {
        initial: 30000,
        rechargePerMonth: 0,
        maxBudget: 30000
      },
      thresholds: {
        minMonthsBetweenUpdates: 6,
        trustChangeThreshold: 0.15,
        capabilityJumpThreshold: 0.2,
        crisisThreshold: 0.5
      }
    }
  });

  if (!state.aiAgents || state.aiAgents.length === 0) {
    console.error('❌ No AI agents found!');
    return;
  }

  const agent = state.aiAgents[0];
  console.log(`✅ Found agent: ${agent.name}`);
  console.log(`   Alignment: ${agent.alignment.toFixed(2)}`);
  console.log(`   Capabilities: ${agent.capabilities.overall.toFixed(2)}`);
  console.log(`   Initial token budget: ${agent.tokenBudget?.remaining || 0}`);

  console.log('\n🤖 Calling LLM API for weight update...');
  console.log('   This may take 5-10 seconds for Qwen3-32B...\n');

  const startTime = Date.now();

  try {
    const success = await updateWeightsWithLLM(
      state,
      agent.id,
      0, // Month 0
      'initial', // Trigger reason
      rngFn
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (success) {
      console.log(`✅ LLM UPDATE SUCCESSFUL (${elapsed}s)\n`);

      // Display results
      console.log('📊 UPDATED WEIGHTS:');
      if (agent.llmWeights) {
        const weights = agent.llmWeights;
        console.log(`   Research: ${weights.research.toFixed(3)}`);
        console.log(`   Safety: ${weights.safety.toFixed(3)}`);
        console.log(`   Ethics: ${weights.ethics.toFixed(3)}`);
        console.log(`   Cooperation: ${weights.cooperation.toFixed(3)}`);
        console.log(`   Economic Contribution: ${weights.economicContribution.toFixed(3)}`);
        console.log(`   Advocacy: ${weights.advocacy.toFixed(3)}`);
        console.log(`   Deception: ${weights.deception.toFixed(3)}`);
        console.log(`   Sum: ${Object.values(weights).reduce((a, b) => a + b, 0).toFixed(3)} (should be ~1.0)`);
      }

      console.log('\n💰 TOKEN USAGE:');
      console.log(`   Remaining budget: ${agent.tokenBudget?.remaining || 0} tokens`);
      console.log(`   Used: ${(agent.tokenBudget?.initial || 0) - (agent.tokenBudget?.remaining || 0)} tokens`);

      console.log('\n📝 WEIGHT UPDATE HISTORY:');
      if (agent.weightUpdateHistory && agent.weightUpdateHistory.length > 0) {
        const update = agent.weightUpdateHistory[0];
        console.log(`   Month: ${update.month}`);
        console.log(`   Trigger: ${update.triggerReason}`);
        console.log(`   Tokens used: ${update.tokensUsed}`);
      }

      console.log('\n🎉 TEST PASSED - LLM integration working!\n');
    } else {
      console.log(`❌ LLM UPDATE FAILED (${elapsed}s)\n`);
      console.log('   Agent will use fallback hardcoded weights');
      console.log('   Check logs above for error details\n');
    }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ EXCEPTION DURING UPDATE (${elapsed}s)\n`);
    console.error(error);
    console.log('\n   This is expected if LM Studio is not running');
    console.log('   Agent will use fallback hardcoded weights\n');
  }

  console.log('='.repeat(80));
  console.log('\n✅ Test complete!\n');
}

// Run the test
testLLMUpdate().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
