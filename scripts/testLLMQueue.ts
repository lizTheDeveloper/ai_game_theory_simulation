/**
 * Test LLM Request Queue
 *
 * Verifies semaphore and rate limiting functionality
 */

import { LLMRequestQueue } from '../src/simulation/llm/queue';

async function testQueue() {
  console.log('\n🧪 Testing LLM Request Queue\n');
  console.log('='.repeat(80));

  // Test 1: Basic queue with concurrency limit
  console.log('\n📋 Test 1: Concurrency Limiting (max 2 concurrent)');
  console.log('-'.repeat(80));

  const queue1 = new LLMRequestQueue({
    maxConcurrent: 2,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: false,
    maxRetries: 0,
    retryDelayMs: 0
  });

  const startTime = Date.now();
  const results: string[] = [];

  // Enqueue 5 requests, each takes 1 second
  const promises = Array.from({ length: 5 }, (_, i) =>
    queue1.enqueue(async () => {
      const reqStart = Date.now();
      results.push(`Request ${i + 1} started at ${reqStart - startTime}ms`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const reqEnd = Date.now();
      results.push(`Request ${i + 1} completed at ${reqEnd - startTime}ms`);
      return `Result ${i + 1}`;
    })
  );

  await Promise.all(promises);

  results.forEach(r => console.log(`  ${r}`));

  const elapsed = Date.now() - startTime;
  console.log(`\n  Total time: ${elapsed}ms`);
  console.log(`  Expected: ~3000ms (5 requests / 2 concurrent = 3 batches)`);
  console.log(`  ✅ ${elapsed >= 2900 && elapsed <= 3200 ? 'PASS' : 'FAIL'}`);

  // Test 2: Rate limiting (requests per minute)
  console.log('\n📋 Test 2: Rate Limiting (max 3 requests/minute)');
  console.log('-'.repeat(80));

  const queue2 = new LLMRequestQueue({
    maxConcurrent: 10, // High concurrency
    maxRequestsPerMinute: 3, // But rate limited to 3/min
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: false,
    maxRetries: 0,
    retryDelayMs: 0
  });

  const rateStart = Date.now();
  const rateResults: number[] = [];

  // Enqueue 5 requests (instant execution)
  const ratePromises = Array.from({ length: 5 }, (_, i) =>
    queue2.enqueue(async () => {
      const timestamp = Date.now() - rateStart;
      rateResults.push(timestamp);
      console.log(`  Request ${i + 1} executed at ${timestamp}ms`);
      return i;
    })
  );

  await Promise.all(ratePromises);

  const rateElapsed = Date.now() - rateStart;
  console.log(`\n  Total time: ${rateElapsed}ms`);
  console.log(`  First 3 should execute immediately, then wait for next minute window`);
  console.log(`  ✅ ${rateResults[2] < 100 ? 'PASS' : 'FAIL'} - First 3 immediate`);
  console.log(`  ✅ ${rateResults[3] > 60000 ? 'PASS' : 'FAIL'} - Next 2 after 60s`);

  // Test 3: Retry logic
  console.log('\n📋 Test 3: Automatic Retries');
  console.log('-'.repeat(80));

  const queue3 = new LLMRequestQueue({
    maxConcurrent: 1,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: true,
    maxRetries: 3,
    retryDelayMs: 500
  });

  let attemptCount = 0;

  try {
    await queue3.enqueue(async () => {
      attemptCount++;
      console.log(`  Attempt ${attemptCount}`);
      if (attemptCount < 3) {
        throw new Error('Simulated failure');
      }
      return 'Success on 3rd try!';
    });
    console.log(`  ✅ PASS - Succeeded after ${attemptCount} attempts`);
  } catch (error) {
    console.log(`  ❌ FAIL - Failed after ${attemptCount} attempts`);
  }

  // Test 4: Statistics
  console.log('\n📋 Test 4: Statistics Tracking');
  console.log('-'.repeat(80));

  const stats1 = queue1.getStats();
  console.log('  Queue 1 stats:', JSON.stringify(stats1, null, 2));

  const stats2 = queue2.getStats();
  console.log('  Queue 2 stats:', JSON.stringify(stats2, null, 2));

  // Test 5: Queue clearing
  console.log('\n📋 Test 5: Queue Clearing');
  console.log('-'.repeat(80));

  const queue5 = new LLMRequestQueue({
    maxConcurrent: 1,
    maxRequestsPerMinute: 0,
    maxRequestsPerHour: 0,
    maxRequestsPerDay: 0,
    retryOnFailure: false,
    maxRetries: 0,
    retryDelayMs: 0
  });

  // Enqueue 10 slow requests
  const clearPromises = Array.from({ length: 10 }, (_, i) =>
    queue5.enqueue(async () => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds each
      return i;
    }).catch(() => `Cancelled ${i}`)
  );

  // Wait a bit then clear
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('  Clearing queue...');
  queue5.clear();

  const clearResults = await Promise.all(clearPromises);
  const cancelled = clearResults.filter(r => typeof r === 'string' && r.startsWith('Cancelled')).length;

  console.log(`  ✅ ${cancelled === 9 ? 'PASS' : 'FAIL'} - Cleared ${cancelled}/9 pending requests`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests complete!\n');
}

testQueue().catch(console.error);
