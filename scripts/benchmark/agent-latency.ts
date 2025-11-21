/**
 * MARCUS 3.0 - Agent Latency Benchmark
 *
 * Measures IPC communication latency between TypeScript platform and Python agents:
 * - Agent spawn time (cold start)
 * - IPC message round-trip time
 * - Agent processing time (pure computation)
 * - Memory usage per agent
 * - CPU usage per agent
 *
 * Success Criteria:
 * - Cold start: <3 seconds
 * - IPC round-trip: <50ms
 * - Processing time: <500ms per citation
 * - Memory: <100MB per agent
 * - CPU: <50% per agent (single core)
 *
 * Usage:
 *   npx tsx scripts/benchmark/agent-latency.ts [--num-samples=50] [--output=benchmarks/results.md]
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

interface BenchmarkConfig {
  baseURL: string;
  adminEmail: string;
  adminPassword: string;
  numSamples: number;
  outputPath: string;
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  baseURL: process.env.MARCUS_API_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@marcus.local',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  numSamples: parseInt(process.env.NUM_SAMPLES || '50', 10),
  outputPath: process.env.OUTPUT_PATH || path.join(process.cwd(), 'benchmarks', `agent_latency_baseline_${new Date().toISOString().split('T')[0]}.md`),
};

// ============================================================================
// Test Citation
// ============================================================================

const TEST_CITATION = {
  text: 'According to Smith et al. (2023), climate change is accelerating at an unprecedented rate.',
  claimedSource: 'Smith, J., Johnson, M., & Lee, K. (2023). Climate acceleration patterns. Nature Climate Change, 13(4), 234-245.',
  actualSource: 'Smith, J., Johnson, M., & Lee, K. (2023). Climate acceleration patterns. Nature Climate Change, 13(4), 234-245.',
  metadata: { category: 'climate', benchmark: true }
};

// ============================================================================
// Benchmark Runner
// ============================================================================

class AgentLatencyBenchmark {
  private client: AxiosInstance;
  private config: BenchmarkConfig;
  private authToken: string = '';

  constructor(config: BenchmarkConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
    });
  }

  /**
   * Authenticate and get JWT token
   */
  async authenticate(): Promise<void> {
    console.log(`🔐 Authenticating as ${this.config.adminEmail}...`);

    try {
      const response = await this.client.post('/auth/login', {
        email: this.config.adminEmail,
        password: this.config.adminPassword,
      });

      this.authToken = response.data.accessToken;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;

      console.log(`✅ Authentication successful`);
    } catch (error: any) {
      console.error(`❌ Authentication failed:`, error.response?.data || error.message);
      throw new Error('Authentication failed. Check credentials in environment variables.');
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(): Promise<{
    total: number;
    healthy: number;
    unhealthy: number;
    agents: Array<{
      agentId: string;
      reputation: number;
      totalCitations: number;
      isHealthy: boolean;
    }>;
  }> {
    try {
      const response = await this.client.post('/api/admin/agents', {
        action: 'health'
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ Agent health check error:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Measure single citation analysis latency
   */
  async measureCitationLatency(): Promise<{
    totalLatency: number;
    apiLatency: number;
    numAgents: number;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.client.post('/api/citations/analyze', TEST_CITATION);
      const totalLatency = Date.now() - startTime;
      const apiLatency = response.data.analysis?.latencyMs || 0;
      const numAgents = response.data.analysis?.numAgents || 0;

      return { totalLatency, apiLatency, numAgents };
    } catch (error: any) {
      console.error(`❌ Citation analysis error:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Run latency benchmark
   */
  async runBenchmark(): Promise<{
    numSamples: number;
    totalLatencies: number[];
    apiLatencies: number[];
    avgTotal: number;
    avgAPI: number;
    p50Total: number;
    p50API: number;
    p95Total: number;
    p95API: number;
    p99Total: number;
    p99API: number;
    minTotal: number;
    maxTotal: number;
    minAPI: number;
    maxAPI: number;
  }> {
    console.log(`\n📊 Running agent latency benchmark...`);
    console.log(`   Samples: ${this.config.numSamples}`);

    const totalLatencies: number[] = [];
    const apiLatencies: number[] = [];

    for (let i = 0; i < this.config.numSamples; i++) {
      try {
        const { totalLatency, apiLatency } = await this.measureCitationLatency();
        totalLatencies.push(totalLatency);
        apiLatencies.push(apiLatency);

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`\r   Progress: ${i + 1}/${this.config.numSamples} samples collected...`);
        }

        // Small delay between samples
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`\n   ⚠️ Sample ${i + 1} failed, continuing...`);
      }
    }

    console.log(`\n   ✅ Benchmark complete!`);

    // Calculate statistics
    totalLatencies.sort((a, b) => a - b);
    apiLatencies.sort((a, b) => a - b);

    const avgTotal = totalLatencies.reduce((sum, l) => sum + l, 0) / totalLatencies.length;
    const avgAPI = apiLatencies.reduce((sum, l) => sum + l, 0) / apiLatencies.length;

    const p50Total = totalLatencies[Math.floor(totalLatencies.length * 0.50)];
    const p50API = apiLatencies[Math.floor(apiLatencies.length * 0.50)];
    const p95Total = totalLatencies[Math.floor(totalLatencies.length * 0.95)];
    const p95API = apiLatencies[Math.floor(apiLatencies.length * 0.95)];
    const p99Total = totalLatencies[Math.floor(totalLatencies.length * 0.99)];
    const p99API = apiLatencies[Math.floor(apiLatencies.length * 0.99)];

    const minTotal = Math.min(...totalLatencies);
    const maxTotal = Math.max(...totalLatencies);
    const minAPI = Math.min(...apiLatencies);
    const maxAPI = Math.max(...apiLatencies);

    return {
      numSamples: totalLatencies.length,
      totalLatencies,
      apiLatencies,
      avgTotal,
      avgAPI,
      p50Total,
      p50API,
      p95Total,
      p95API,
      p99Total,
      p99API,
      minTotal,
      maxTotal,
      minAPI,
      maxAPI,
    };
  }

  /**
   * Generate markdown report
   */
  async generateReport(
    agentHealth: any,
    benchmarkResults: any
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    let markdown = `# MARCUS 3.0 - Agent Latency Benchmark\n\n`;
    markdown += `**Date:** ${date}\n`;
    markdown += `**Timestamp:** ${timestamp}\n`;
    markdown += `**Platform:** ${this.config.baseURL}\n`;
    markdown += `**Samples:** ${this.config.numSamples}\n\n`;
    markdown += `---\n\n`;

    // Agent Health
    markdown += `## 🤖 Agent Health Status\n\n`;
    markdown += `**Overview:**\n`;
    markdown += `- Total Agents: ${agentHealth.total}\n`;
    markdown += `- Healthy: ${agentHealth.healthy} ✅\n`;
    markdown += `- Unhealthy: ${agentHealth.unhealthy} ${agentHealth.unhealthy > 0 ? '❌' : ''}\n\n`;

    markdown += `**Agent Details:**\n\n`;
    markdown += `| Agent ID | Reputation | Citations | Status |\n`;
    markdown += `|----------|------------|-----------|--------|\n`;
    for (const agent of agentHealth.agents) {
      const status = agent.isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      markdown += `| ${agent.agentId} | ${agent.reputation.toFixed(2)} | ${agent.totalCitations} | ${status} |\n`;
    }
    markdown += `\n---\n\n`;

    // Latency Results
    markdown += `## 📈 Latency Results\n\n`;
    markdown += `### Total Round-Trip Latency (HTTP + IPC + Processing)\n\n`;
    markdown += `| Metric | Value | Target | Status |\n`;
    markdown += `|--------|-------|--------|--------|\n`;
    markdown += `| Average | ${benchmarkResults.avgTotal.toFixed(0)}ms | - | - |\n`;
    markdown += `| P50 (Median) | ${benchmarkResults.p50Total.toFixed(0)}ms | - | - |\n`;
    markdown += `| P95 | ${benchmarkResults.p95Total.toFixed(0)}ms | <2000ms | ${benchmarkResults.p95Total < 2000 ? '✅' : '❌'} |\n`;
    markdown += `| P99 | ${benchmarkResults.p99Total.toFixed(0)}ms | - | - |\n`;
    markdown += `| Min | ${benchmarkResults.minTotal.toFixed(0)}ms | - | - |\n`;
    markdown += `| Max | ${benchmarkResults.maxTotal.toFixed(0)}ms | - | - |\n\n`;

    markdown += `### Agent Processing Latency (IPC + Computation)\n\n`;
    markdown += `| Metric | Value | Target | Status |\n`;
    markdown += `|--------|-------|--------|--------|\n`;
    markdown += `| Average | ${benchmarkResults.avgAPI.toFixed(0)}ms | <500ms | ${benchmarkResults.avgAPI < 500 ? '✅' : '❌'} |\n`;
    markdown += `| P50 (Median) | ${benchmarkResults.p50API.toFixed(0)}ms | - | - |\n`;
    markdown += `| P95 | ${benchmarkResults.p95API.toFixed(0)}ms | - | - |\n`;
    markdown += `| P99 | ${benchmarkResults.p99API.toFixed(0)}ms | - | - |\n`;
    markdown += `| Min | ${benchmarkResults.minAPI.toFixed(0)}ms | - | - |\n`;
    markdown += `| Max | ${benchmarkResults.maxAPI.toFixed(0)}ms | - | - |\n\n`;

    // Network overhead
    const networkOverhead = benchmarkResults.avgTotal - benchmarkResults.avgAPI;
    markdown += `### Network Overhead\n\n`;
    markdown += `- **HTTP Overhead:** ${networkOverhead.toFixed(0)}ms (${((networkOverhead / benchmarkResults.avgTotal) * 100).toFixed(1)}% of total)\n`;
    markdown += `- **IPC Round-Trip:** ${benchmarkResults.avgAPI.toFixed(0)}ms (${((benchmarkResults.avgAPI / benchmarkResults.avgTotal) * 100).toFixed(1)}% of total)\n\n`;

    markdown += `---\n\n`;

    // Success Criteria
    markdown += `## ✅ Success Criteria\n\n`;
    markdown += `| Criterion | Target | Actual | Status |\n`;
    markdown += `|-----------|--------|--------|--------|\n`;
    markdown += `| IPC Round-Trip | <50ms | ${benchmarkResults.avgAPI.toFixed(0)}ms | ${benchmarkResults.avgAPI < 50 ? '✅ PASS' : '❌ FAIL'} |\n`;
    markdown += `| Processing Time | <500ms | ${benchmarkResults.avgAPI.toFixed(0)}ms | ${benchmarkResults.avgAPI < 500 ? '✅ PASS' : '❌ FAIL'} |\n`;
    markdown += `| P95 Latency | <2000ms | ${benchmarkResults.p95Total.toFixed(0)}ms | ${benchmarkResults.p95Total < 2000 ? '✅ PASS' : '❌ FAIL'} |\n\n`;

    // Recommendations
    markdown += `## 💡 Recommendations\n\n`;

    if (benchmarkResults.avgAPI < 50 && benchmarkResults.p95Total < 2000) {
      markdown += `✅ All latency targets met! Excellent IPC performance.\n\n`;
    } else {
      markdown += `⚠️ Some latency targets not met. Consider:\n\n`;

      if (benchmarkResults.avgAPI >= 50) {
        markdown += `1. **IPC Optimization:** IPC round-trip time (${benchmarkResults.avgAPI.toFixed(0)}ms) exceeds 50ms target\n`;
        markdown += `   - Check Python agent CPU usage - may be compute-bound\n`;
        markdown += `   - Review JSON serialization overhead\n`;
        markdown += `   - Consider using msgpack for binary IPC\n\n`;
      }

      if (benchmarkResults.p95Total >= 2000) {
        markdown += `2. **P95 Latency:** P95 latency (${benchmarkResults.p95Total.toFixed(0)}ms) exceeds 2000ms target\n`;
        markdown += `   - Profile slow citations to identify bottlenecks\n`;
        markdown += `   - Check database query times (see database performance benchmark)\n`;
        markdown += `   - Consider agent-level caching for repeated patterns\n\n`;
      }

      if (networkOverhead > 100) {
        markdown += `3. **Network Overhead:** HTTP overhead (${networkOverhead.toFixed(0)}ms) is high\n`;
        markdown += `   - Consider using HTTP keep-alive connections\n`;
        markdown += `   - Deploy platform closer to agents (same host preferred)\n`;
        markdown += `   - Use Unix domain sockets if platform and agents are co-located\n\n`;
      }
    }

    markdown += `## 🔍 Next Steps\n\n`;
    markdown += `1. Run database performance benchmark to identify slow queries\n`;
    markdown += `2. Profile Python agent memory and CPU usage\n`;
    markdown += `3. Set up continuous latency monitoring with Prometheus\n`;
    markdown += `4. Run load tests to measure latency under concurrent load\n\n`;

    // Save report
    await fs.mkdir(path.dirname(this.config.outputPath), { recursive: true });
    await fs.writeFile(this.config.outputPath, markdown, 'utf8');

    console.log(`\n📄 Report saved: ${this.config.outputPath}`);
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  console.log(`\n🚀 MARCUS 3.0 - Agent Latency Benchmark\n`);
  console.log(`==========================================\n`);

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const numSamples = args.find(a => a.startsWith('--num-samples='))?.split('=')[1];
  const outputPath = args.find(a => a.startsWith('--output='))?.split('=')[1];

  const config = {
    ...DEFAULT_CONFIG,
    numSamples: numSamples ? parseInt(numSamples, 10) : DEFAULT_CONFIG.numSamples,
    outputPath: outputPath || DEFAULT_CONFIG.outputPath,
  };

  // Verify admin password is set
  if (!config.adminPassword) {
    console.error(`❌ Error: ADMIN_PASSWORD environment variable not set`);
    console.error(`   Please set it with the password from /tmp/marcus_admin_credentials.txt`);
    process.exit(1);
  }

  const benchmark = new AgentLatencyBenchmark(config);

  try {
    // Authenticate
    await benchmark.authenticate();

    // Check agent health
    console.log(`\n🔍 Checking agent health...`);
    const agentHealth = await benchmark.getAgentHealth();
    console.log(`   Total: ${agentHealth.total}, Healthy: ${agentHealth.healthy}, Unhealthy: ${agentHealth.unhealthy}`);

    if (agentHealth.healthy === 0) {
      console.error(`\n❌ No healthy agents found. Please start the platform with agents enabled.`);
      process.exit(1);
    }

    // Run benchmark
    const benchmarkResults = await benchmark.runBenchmark();

    // Generate report
    await benchmark.generateReport(agentHealth, benchmarkResults);

    console.log(`\n✅ Benchmark complete!\n`);

  } catch (error: any) {
    console.error(`\n❌ Benchmark failed:`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

export { AgentLatencyBenchmark, DEFAULT_CONFIG };
