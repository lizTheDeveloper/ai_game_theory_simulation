/**
 * Quick Test: LLM Request Queue
 *
 * Fast verification of semaphore and basic queue functionality
 */

import { LLMRequestQueue } from '../src/simulation/llm/queue';

async function quickTest() {
  console.log('\n🧪 Quick LLM Queue Test\n');
  console.log('='.repeat(80));

  // Test 1: Basic concurrency limiting
  console.log('\n📋 Test 1: Concurrency Limiting (max 2 concurrent, 5 requests)');
  console.log('-'.repeat(80));

  const queue = new LLMRequestQueue({
    maxConcurrent: 2,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: false,
    maxRetries: 0,
    retryDelayMs: 0
  });

  const startTime = Date.now();
  let activeCount = 0;
  let maxActive = 0;

  const promises = Array.from({ length: 5 }, (_, i) =>
    queue.enqueue(async () => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      console.log(`  Request ${i + 1} started (active: ${activeCount})`);
      await new Promise(resolve => setTimeout(resolve, 500));
      activeCount--;
      console.log(`  Request ${i + 1} completed`);
      return i;
    })
  );

  await Promise.all(promises);

  const elapsed = Date.now() - startTime;
  console.log(`\n  Max concurrent: ${maxActive}`);
  console.log(`  Total time: ${elapsed}ms`);
  console.log(`  Expected: ~1500ms (5 requests / 2 concurrent = 3 batches)`);
  console.log(`  ✅ ${maxActive === 2 ? 'PASS' : 'FAIL'} - Concurrency limit enforced`);
  console.log(`  ✅ ${elapsed >= 1400 && elapsed <= 1700 ? 'PASS' : 'FAIL'} - Timing correct`);

  // Test 2: Statistics
  console.log('\n📋 Test 2: Statistics Tracking');
  console.log('-'.repeat(80));

  const stats = queue.getStats();
  console.log(`  Total requests: ${stats.totalRequests}`);
  console.log(`  Successful: ${stats.successfulRequests}`);
  console.log(`  Failed: ${stats.failedRequests}`);
  console.log(`  Active: ${stats.activeRequests}`);
  console.log(`  Pending: ${stats.pendingRequests}`);
  console.log(`  ✅ ${stats.totalRequests === 5 ? 'PASS' : 'FAIL'} - Request count correct`);
  console.log(`  ✅ ${stats.successfulRequests === 5 ? 'PASS' : 'FAIL'} - All succeeded`);

  // Test 3: Retry logic
  console.log('\n📋 Test 3: Automatic Retries');
  console.log('-'.repeat(80));

  const retryQueue = new LLMRequestQueue({
    maxConcurrent: 1,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: true,
    maxRetries: 2,
    retryDelayMs: 200
  });

  let attempts = 0;
  const retryResult = await retryQueue.enqueue(async () => {
    attempts++;
    console.log(`  Attempt ${attempts}`);
    if (attempts < 2) {
      throw new Error('Simulated failure');
    }
    return 'Success!';
  });

  console.log(`  Result: ${retryResult}`);
  console.log(`  ✅ ${attempts === 2 ? 'PASS' : 'FAIL'} - Retried once, succeeded on 2nd attempt`);

  const retryStats = retryQueue.getStats();
  console.log(`  Retried requests: ${retryStats.retriedRequests}`);

  // Test 4: Error handling
  console.log('\n📋 Test 4: Error Handling (max retries exceeded)');
  console.log('-'.repeat(80));

  const errorQueue = new LLMRequestQueue({
    maxConcurrent: 1,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: true,
    maxRetries: 2,
    retryDelayMs: 100
  });

  let failAttempts = 0;
  try {
    await errorQueue.enqueue(async () => {
      failAttempts++;
      console.log(`  Attempt ${failAttempts}`);
      throw new Error('Always fails');
    });
    console.log(`  ❌ FAIL - Should have thrown error`);
  } catch (error) {
    console.log(`  Caught error after ${failAttempts} attempts`);
    console.log(`  ✅ ${failAttempts === 3 ? 'PASS' : 'FAIL'} - Failed after 3 attempts (1 + 2 retries)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests complete!\n');
}

quickTest().catch(console.error);
