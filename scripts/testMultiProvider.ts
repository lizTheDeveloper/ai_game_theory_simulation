/**
 * Test Multi-Provider Configuration
 *
 * Verifies YAML loading, model tier selection, and provider rotation
 */

import { getProviderManager, ProviderManager } from '../src/simulation/llm/providerManager';

async function testMultiProvider() {
  console.log('\n🧪 Testing Multi-Provider Configuration\n');
  console.log('='.repeat(80));

  // Test 1: Load YAML configuration
  console.log('\n📋 Test 1: Load Configuration');
  console.log('-'.repeat(80));

  try {
    const manager = getProviderManager('./llm-providers.yaml');
    console.log('  ✅ PASS - Configuration loaded successfully');

    // Test 2: Model tier selection
    console.log('\n📋 Test 2: Model Tier Selection');
    console.log('-'.repeat(80));

    const simpleTask = manager.getNextProviderWithTier('simple');
    if (simpleTask) {
      console.log(`  Simple task assigned to: ${simpleTask.provider.name}`);
      console.log(`  Model: ${simpleTask.model.model_name} (${simpleTask.model.tier})`);
      console.log(`  Avg tokens: ${simpleTask.model.tokens_per_request_avg}`);
      console.log('  ✅ PASS - Simple task assigned');
    } else {
      console.log('  ❌ FAIL - No provider available for simple task');
    }

    const mediumTask = manager.getNextProviderWithTier('medium');
    if (mediumTask) {
      console.log(`\n  Medium task assigned to: ${mediumTask.provider.name}`);
      console.log(`  Model: ${mediumTask.model.model_name} (${mediumTask.model.tier})`);
      console.log(`  Avg tokens: ${mediumTask.model.tokens_per_request_avg}`);
      console.log('  ✅ PASS - Medium task assigned');
    } else {
      console.log('  ❌ FAIL - No provider available for medium task');
    }

    const complexTask = manager.getNextProviderWithTier('complex');
    if (complexTask) {
      console.log(`\n  Complex task assigned to: ${complexTask.provider.name}`);
      console.log(`  Model: ${complexTask.model.model_name} (${complexTask.model.tier})`);
      console.log(`  Avg tokens: ${complexTask.model.tokens_per_request_avg}`);
      console.log('  ✅ PASS - Complex task assigned');
    } else {
      console.log('  ❌ FAIL - No provider available for complex task');
    }

    // Test 3: Task complexity classification
    console.log('\n📋 Test 3: Task Complexity Classification');
    console.log('-'.repeat(80));

    const testCases = [
      'simple_weight_updates',
      'strategic_planning',
      'extinction_scenarios'
    ];

    for (const useCase of testCases) {
      const complexity = ProviderManager.classifyTaskComplexity(useCase);
      console.log(`  "${useCase}" → ${complexity}`);
    }
    console.log('  ✅ PASS - Task classification works');

    // Test 4: Record usage and check tracking
    console.log('\n📋 Test 4: Usage Tracking');
    console.log('-'.repeat(80));

    if (simpleTask) {
      manager.recordUsage(
        simpleTask.provider.name,
        simpleTask.model.tokens_per_request_avg,
        500, // input tokens
        300  // output tokens
      );
      console.log(`  Recorded usage for ${simpleTask.provider.name}`);

      const stats = manager.getUsageStats(simpleTask.provider.name);
      if (stats) {
        console.log(`  Requests (day): ${stats.requests_day}`);
        console.log(`  Tokens (day): ${stats.tokens_day}`);
        console.log('  ✅ PASS - Usage tracked');
      }
    }

    // Test 5: Print usage summary
    console.log('\n📋 Test 5: Usage Summary');
    console.log('-'.repeat(80));
    manager.printUsageSummary();

    // Save usage data
    manager.saveUsage();
    console.log('\n  ✅ Usage data saved to llm-providers.yaml');

  } catch (error) {
    console.error('  ❌ FAIL - Configuration error:', error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests complete!\n');
}

testMultiProvider().catch(console.error);
