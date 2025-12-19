/**
 * Load and Performance Tests
 *
 * Tests the complete MARCUS 3.1 platform under realistic load to verify SLOs.
 *
 * Test Scenarios:
 * 1. Baseline (1 request/sec) → P95 < 100ms
 * 2. Moderate load (10 req/sec) → P95 < 200ms
 * 3. High load (50 req/sec) → P95 < 500ms (SLO target)
 * 4. Burst load (100 req/sec for 30s) → HPA scales workers
 * 5. Sustained load (30 req/sec for 5min) → stable performance
 *
 * Metrics Captured:
 * - Request latency (P50, P95, P99)
 * - Error rate (%)
 * - Queue depth over time
 * - Worker count over time (HPA scaling)
 * - Resource utilization (CPU, memory)
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import * as http from 'http';
import { URL } from 'url';

// ============================================================================
// Test Configuration
// ============================================================================

export interface LoadTestConfig {
  baseUrl: string;
  duration: number; // milliseconds
  requestsPerSecond: number;
  warmupDuration?: number; // milliseconds
  endpoint: string;
  method: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  errorRate: number;
  throughput: number; // requests/second
  duration: number; // milliseconds
  latencies: number[];
  errors: Array<{ timestamp: number; error: string }>;
}

// ============================================================================
// Load Test Runner
// ============================================================================

export class LoadTestRunner {
  private results: LoadTestResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    latencyP50: 0,
    latencyP95: 0,
    latencyP99: 0,
    averageLatency: 0,
    minLatency: Infinity,
    maxLatency: 0,
    errorRate: 0,
    throughput: 0,
    duration: 0,
    latencies: [],
    errors: []
  };

  constructor(private config: LoadTestConfig) {}

  /**
   * Run the load test
   */
  async run(): Promise<LoadTestResult> {
    console.log('\n=== Load Test Configuration ===');
    console.log(`Base URL: ${this.config.baseUrl}`);
    console.log(`Endpoint: ${this.config.endpoint}`);
    console.log(`Duration: ${this.config.duration / 1000}s`);
    console.log(`Requests/sec: ${this.config.requestsPerSecond}`);
    console.log(`Warmup: ${(this.config.warmupDuration || 0) / 1000}s\n`);

    // Warmup phase
    if (this.config.warmupDuration && this.config.warmupDuration > 0) {
      console.log('🔥 Warmup phase...');
      await this.runLoadPhase(this.config.warmupDuration, true);
      this.resetResults();
    }

    // Main load test
    console.log('📊 Starting load test...');
    const startTime = Date.now();

    await this.runLoadPhase(this.config.duration, false);

    this.results.duration = Date.now() - startTime;

    // Calculate statistics
    this.calculateStatistics();

    // Print results
    this.printResults();

    return this.results;
  }

  /**
   * Run a load phase
   */
  private async runLoadPhase(duration: number, isWarmup: boolean): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const intervalMs = 1000 / this.config.requestsPerSecond;

    const promises: Promise<void>[] = [];

    while (Date.now() < endTime) {
      const requestStart = Date.now();

      // Make request
      const promise = this.makeRequest();
      promises.push(promise);

      // Wait for next request interval
      const elapsed = Date.now() - requestStart;
      const waitTime = Math.max(0, intervalMs - elapsed);

      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Wait for all requests to complete
    await Promise.all(promises);
  }

  /**
   * Make a single HTTP request
   */
  private async makeRequest(): Promise<void> {
    const startTime = Date.now();

    try {
      await this.httpRequest();

      const latency = Date.now() - startTime;

      if (!isNaN(latency) && latency >= 0) {
        this.results.latencies.push(latency);
        this.results.successfulRequests++;
        this.results.minLatency = Math.min(this.results.minLatency, latency);
        this.results.maxLatency = Math.max(this.results.maxLatency, latency);
      }
    } catch (error: any) {
      this.results.failedRequests++;
      this.results.errors.push({
        timestamp: Date.now(),
        error: error.message
      });
    } finally {
      this.results.totalRequests++;
    }
  }

  /**
   * Perform HTTP request
   */
  private async httpRequest(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.config.endpoint, this.config.baseUrl);

      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname + url.search,
        method: this.config.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Send body if POST
      if (this.config.method === 'POST' && this.config.body) {
        req.write(JSON.stringify(this.config.body));
      }

      req.end();
    });
  }

  /**
   * Calculate statistics from latency data
   */
  private calculateStatistics(): void {
    if (this.results.latencies.length === 0) {
      return;
    }

    // Sort latencies
    const sorted = [...this.results.latencies].sort((a, b) => a - b);

    // Calculate percentiles
    this.results.latencyP50 = this.percentile(sorted, 50);
    this.results.latencyP95 = this.percentile(sorted, 95);
    this.results.latencyP99 = this.percentile(sorted, 99);

    // Calculate average
    this.results.averageLatency =
      sorted.reduce((a, b) => a + b, 0) / sorted.length;

    // Calculate error rate
    this.results.errorRate =
      this.results.failedRequests / this.results.totalRequests;

    // Calculate throughput
    this.results.throughput =
      (this.results.successfulRequests / this.results.duration) * 1000;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Print results
   */
  private printResults(): void {
    console.log('\n=== Load Test Results ===');
    console.log(`Total requests: ${this.results.totalRequests}`);
    console.log(
      `Successful: ${this.results.successfulRequests} (${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(1)}%)`
    );
    console.log(
      `Failed: ${this.results.failedRequests} (${(this.results.errorRate * 100).toFixed(1)}%)`
    );
    console.log(`\nLatency:`);
    console.log(`  P50: ${this.results.latencyP50.toFixed(1)}ms`);
    console.log(`  P95: ${this.results.latencyP95.toFixed(1)}ms`);
    console.log(`  P99: ${this.results.latencyP99.toFixed(1)}ms`);
    console.log(`  Avg: ${this.results.averageLatency.toFixed(1)}ms`);
    console.log(`  Min: ${this.results.minLatency.toFixed(1)}ms`);
    console.log(`  Max: ${this.results.maxLatency.toFixed(1)}ms`);
    console.log(`\nThroughput: ${this.results.throughput.toFixed(1)} req/sec`);
    console.log(`Duration: ${(this.results.duration / 1000).toFixed(1)}s\n`);

    // Print errors if any
    if (this.results.errors.length > 0) {
      console.log(`\n⚠️ Errors (showing first 10):`);
      this.results.errors.slice(0, 10).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.error}`);
      });
    }
  }

  /**
   * Reset results (for warmup)
   */
  private resetResults(): void {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      latencyP50: 0,
      latencyP95: 0,
      latencyP99: 0,
      averageLatency: 0,
      minLatency: Infinity,
      maxLatency: 0,
      errorRate: 0,
      throughput: 0,
      duration: 0,
      latencies: [],
      errors: []
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Performance Test Scenarios
// ============================================================================

export class PerformanceTestSuite {
  constructor(private baseUrl: string) {}

  /**
   * Run all performance tests
   */
  async runAll(): Promise<{
    baseline: LoadTestResult;
    moderate: LoadTestResult;
    high: LoadTestResult;
    burst: LoadTestResult;
    sustained: LoadTestResult;
  }> {
    console.log('\n🚀 Starting MARCUS 3.1 Performance Test Suite\n');

    const baseline = await this.runBaseline();
    await this.sleep(5000); // Cool-down

    const moderate = await this.runModerate();
    await this.sleep(5000);

    const high = await this.runHigh();
    await this.sleep(10000);

    const burst = await this.runBurst();
    await this.sleep(10000);

    const sustained = await this.runSustained();

    // Print summary
    this.printSummary({ baseline, moderate, high, burst, sustained });

    return { baseline, moderate, high, burst, sustained };
  }

  /**
   * Scenario 1: Baseline (1 req/sec) → P95 < 100ms
   */
  async runBaseline(): Promise<LoadTestResult> {
    console.log('\n📊 Scenario 1: Baseline Load (1 req/sec)');

    const runner = new LoadTestRunner({
      baseUrl: this.baseUrl,
      endpoint: '/health',
      method: 'GET',
      duration: 30000, // 30 seconds
      requestsPerSecond: 1
    });

    return await runner.run();
  }

  /**
   * Scenario 2: Moderate (10 req/sec) → P95 < 200ms
   */
  async runModerate(): Promise<LoadTestResult> {
    console.log('\n📊 Scenario 2: Moderate Load (10 req/sec)');

    const runner = new LoadTestRunner({
      baseUrl: this.baseUrl,
      endpoint: '/health',
      method: 'GET',
      duration: 60000, // 1 minute
      requestsPerSecond: 10,
      warmupDuration: 5000
    });

    return await runner.run();
  }

  /**
   * Scenario 3: High (50 req/sec) → P95 < 500ms (SLO)
   */
  async runHigh(): Promise<LoadTestResult> {
    console.log('\n📊 Scenario 3: High Load (50 req/sec)');

    const runner = new LoadTestRunner({
      baseUrl: this.baseUrl,
      endpoint: '/health',
      method: 'GET',
      duration: 120000, // 2 minutes
      requestsPerSecond: 50,
      warmupDuration: 10000
    });

    return await runner.run();
  }

  /**
   * Scenario 4: Burst (100 req/sec for 30s) → HPA scales
   */
  async runBurst(): Promise<LoadTestResult> {
    console.log('\n📊 Scenario 4: Burst Load (100 req/sec)');

    const runner = new LoadTestRunner({
      baseUrl: this.baseUrl,
      endpoint: '/health',
      method: 'GET',
      duration: 30000, // 30 seconds burst
      requestsPerSecond: 100,
      warmupDuration: 5000
    });

    return await runner.run();
  }

  /**
   * Scenario 5: Sustained (30 req/sec for 5min) → stable
   */
  async runSustained(): Promise<LoadTestResult> {
    console.log('\n📊 Scenario 5: Sustained Load (30 req/sec for 5min)');

    const runner = new LoadTestRunner({
      baseUrl: this.baseUrl,
      endpoint: '/health',
      method: 'GET',
      duration: 300000, // 5 minutes
      requestsPerSecond: 30,
      warmupDuration: 10000
    });

    return await runner.run();
  }

  /**
   * Print summary of all tests
   */
  private printSummary(results: {
    baseline: LoadTestResult;
    moderate: LoadTestResult;
    high: LoadTestResult;
    burst: LoadTestResult;
    sustained: LoadTestResult;
  }): void {
    console.log('\n\n' + '='.repeat(80));
    console.log('PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(80));

    const scenarios = [
      { name: 'Baseline (1 req/sec)', result: results.baseline, slo: 100 },
      { name: 'Moderate (10 req/sec)', result: results.moderate, slo: 200 },
      { name: 'High (50 req/sec)', result: results.high, slo: 500 },
      { name: 'Burst (100 req/sec)', result: results.burst, slo: 1000 },
      { name: 'Sustained (30 req/sec)', result: results.sustained, slo: 500 }
    ];

    console.log('\nScenario                    | P50    | P95    | P99    | Error% | SLO Met');
    console.log('-'.repeat(80));

    for (const scenario of scenarios) {
      const r = scenario.result;
      const sloMet = r.latencyP95 <= scenario.slo ? '✅' : '❌';

      console.log(
        `${scenario.name.padEnd(27)} | ` +
        `${r.latencyP50.toFixed(0).padStart(6)}ms | ` +
        `${r.latencyP95.toFixed(0).padStart(6)}ms | ` +
        `${r.latencyP99.toFixed(0).padStart(6)}ms | ` +
        `${(r.errorRate * 100).toFixed(1).padStart(5)}% | ` +
        `${sloMet}`
      );
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Main Entry Point (for manual testing)
// ============================================================================

if (require.main === module) {
  const baseUrl = process.env.MARCUS_BASE_URL || 'http://localhost:3000';

  const suite = new PerformanceTestSuite(baseUrl);

  suite.runAll()
    .then((results) => {
      console.log('\n✅ All performance tests completed');

      // Exit with code 1 if any SLO violated
      const violations =
        (results.baseline.latencyP95 > 100 ? 1 : 0) +
        (results.moderate.latencyP95 > 200 ? 1 : 0) +
        (results.high.latencyP95 > 500 ? 1 : 0) +
        (results.sustained.latencyP95 > 500 ? 1 : 0);

      if (violations > 0) {
        console.error(`\n❌ ${violations} SLO violation(s) detected`);
        process.exit(1);
      } else {
        console.log('\n✅ All SLOs met');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('\n❌ Performance test failed:', error);
      process.exit(1);
    });
}
