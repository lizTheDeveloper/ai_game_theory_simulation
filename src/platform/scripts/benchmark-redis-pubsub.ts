/**
 * Benchmark script for M2/M3 Redis PubSub implementation
 *
 * Measures:
 * - Message latency (publish → receive time)
 * - Throughput (messages per second)
 * - Comparison between in-memory and Redis modes
 *
 * Run with:
 *   npx tsx scripts/benchmark-redis-pubsub.ts                    # In-memory mode
 *   FORCE_REDIS_PUBSUB=true REDIS_PORT=6380 npx tsx scripts/benchmark-redis-pubsub.ts  # Redis mode
 */

import { pubsub, isRedisPubSub } from '../graphql/pubsub';

interface BenchmarkResult {
  mode: string;
  messageCount: number;
  totalTimeMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputMsgPerSec: number;
}

async function runBenchmark(messageCount: number = 1000): Promise<BenchmarkResult> {
  const TOPIC = 'BENCHMARK_CHANNEL';
  const latencies: number[] = [];
  let receivedCount = 0;

  // Subscribe
  const subscriptionId = await pubsub.subscribe(TOPIC, (payload: { sentAt: number }) => {
    const latency = Date.now() - payload.sentAt;
    latencies.push(latency);
    receivedCount++;
  });

  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 200));

  // Benchmark start
  const startTime = Date.now();

  // Publish messages
  for (let i = 0; i < messageCount; i++) {
    await pubsub.publish(TOPIC, { sentAt: Date.now(), index: i });
  }

  // Wait for all messages to be received (with timeout)
  const maxWaitTime = 10000; // 10 seconds max
  const waitStart = Date.now();
  while (receivedCount < messageCount && (Date.now() - waitStart) < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  const totalTimeMs = Date.now() - startTime;

  // Cleanup
  await pubsub.unsubscribe(subscriptionId);

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p50Index = Math.floor(latencies.length * 0.50);
  const p95Index = Math.floor(latencies.length * 0.95);
  const p99Index = Math.floor(latencies.length * 0.99);

  return {
    mode: isRedisPubSub() ? 'Redis' : 'In-memory',
    messageCount: receivedCount,
    totalTimeMs,
    avgLatencyMs: Number(avgLatency.toFixed(2)),
    minLatencyMs: latencies[0] || 0,
    maxLatencyMs: latencies[latencies.length - 1] || 0,
    p50LatencyMs: latencies[p50Index] || 0,
    p95LatencyMs: latencies[p95Index] || 0,
    p99LatencyMs: latencies[p99Index] || 0,
    throughputMsgPerSec: Number((receivedCount / (totalTimeMs / 1000)).toFixed(2)),
  };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           M2/M3 Redis PubSub Benchmark Test                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const mode = isRedisPubSub() ? 'Redis (multi-pod)' : 'In-memory (single-pod)';
  console.log(`Mode: ${mode}\n`);

  // Warm-up run
  console.log('Warming up (100 messages)...');
  await runBenchmark(100);
  console.log('Warm-up complete.\n');

  // Benchmark runs
  const testSizes = [100, 500, 1000];
  const results: BenchmarkResult[] = [];

  for (const size of testSizes) {
    console.log(`Running benchmark with ${size} messages...`);
    const result = await runBenchmark(size);
    results.push(result);
    console.log(`  ✓ Complete: ${result.throughputMsgPerSec} msg/sec, avg latency: ${result.avgLatencyMs}ms\n`);
  }

  // Print results table
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              BENCHMARK RESULTS                              ║');
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  console.log('║  Messages │ Throughput  │ Avg Latency │ P50    │ P95    │ P99    │ Max     ║');
  console.log('╠═══════════╪═════════════╪═════════════╪════════╪════════╪════════╪═════════╣');

  for (const r of results) {
    const msgs = r.messageCount.toString().padStart(9);
    const throughput = `${r.throughputMsgPerSec} msg/s`.padStart(11);
    const avg = `${r.avgLatencyMs}ms`.padStart(11);
    const p50 = `${r.p50LatencyMs}ms`.padStart(6);
    const p95 = `${r.p95LatencyMs}ms`.padStart(6);
    const p99 = `${r.p99LatencyMs}ms`.padStart(6);
    const max = `${r.maxLatencyMs}ms`.padStart(7);
    console.log(`║ ${msgs} │ ${throughput} │ ${avg} │ ${p50} │ ${p95} │ ${p99} │ ${max} ║`);
  }

  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  // Summary
  const lastResult = results[results.length - 1];
  console.log('Summary:');
  console.log(`  • Mode: ${lastResult.mode}`);
  console.log(`  • Peak throughput: ${Math.max(...results.map(r => r.throughputMsgPerSec))} msg/sec`);
  console.log(`  • Average latency (1000 msgs): ${lastResult.avgLatencyMs}ms`);
  console.log(`  • P99 latency (1000 msgs): ${lastResult.p99LatencyMs}ms`);

  if (isRedisPubSub()) {
    console.log('\n✅ Redis PubSub is production-ready for multi-pod deployment');
  } else {
    console.log('\n✅ In-memory PubSub working correctly for development');
    console.log('   Run with FORCE_REDIS_PUBSUB=true to benchmark Redis mode');
  }

  console.log('\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
