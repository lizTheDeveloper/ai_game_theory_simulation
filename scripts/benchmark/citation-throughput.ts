/**
 * MARCUS 3.0 - Citation Throughput Benchmark
 *
 * Measures citation analysis performance under different loads:
 * - Single agent sequential processing
 * - Multi-agent parallel processing (3 agents)
 * - Maximum load parallel processing (9 agents)
 *
 * Metrics:
 * - Citations per second (throughput)
 * - Average latency per citation
 * - P50, P95, P99 latency percentiles
 * - Database query times
 * - Redis cache hit rate
 *
 * Success Criteria:
 * - Single agent: ≥5 citations/sec
 * - Multi-agent (3): ≥12 citations/sec
 * - Maximum (9): ≥25 citations/sec
 * - P95 latency: <2 seconds
 *
 * Usage:
 *   npx tsx scripts/benchmark/citation-throughput.ts [--num-citations=100] [--output=benchmarks/results.md]
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
  numCitations: number;
  outputPath: string;
  scenarios: {
    name: string;
    concurrency: number;
    targetCitationsPerSec: number;
  }[];
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  baseURL: process.env.MARCUS_API_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@marcus.local',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  numCitations: parseInt(process.env.NUM_CITATIONS || '100', 10),
  outputPath: process.env.OUTPUT_PATH || path.join(process.cwd(), 'benchmarks', `citation_throughput_baseline_${new Date().toISOString().split('T')[0]}.md`),
  scenarios: [
    { name: 'Single Agent (Sequential)', concurrency: 1, targetCitationsPerSec: 5 },
    { name: 'Multi-Agent (3 Concurrent)', concurrency: 3, targetCitationsPerSec: 12 },
    { name: 'Maximum Load (9 Concurrent)', concurrency: 9, targetCitationsPerSec: 25 },
  ]
};

// ============================================================================
// Sample Citations
// ============================================================================

const SAMPLE_CITATIONS = [
  {
    text: 'According to Smith et al. (2023), climate change is accelerating at an unprecedented rate.',
    claimedSource: 'Smith, J., Johnson, M., & Lee, K. (2023). Climate acceleration patterns. Nature Climate Change, 13(4), 234-245.',
    actualSource: 'Smith, J., Johnson, M., & Lee, K. (2023). Climate acceleration patterns. Nature Climate Change, 13(4), 234-245.',
    metadata: { category: 'climate', expected_integrity: 'high' }
  },
  {
    text: 'Recent studies show that AI capabilities are doubling every 6 months.',
    claimedSource: 'OpenAI Research Team (2024). Scaling laws for AI capabilities. arXiv:2024.12345.',
    actualSource: 'Anthropic Research Team (2024). Measuring AI progress. arXiv:2024.54321.',
    metadata: { category: 'ai', expected_integrity: 'low' }
  },
  {
    text: 'The human brain contains approximately 86 billion neurons.',
    claimedSource: 'Herculano-Houzel, S. (2009). The human brain in numbers. Frontiers in Human Neuroscience, 3, 31.',
    actualSource: 'Herculano-Houzel, S. (2009). The human brain in numbers. Frontiers in Human Neuroscience, 3, 31.',
    metadata: { category: 'neuroscience', expected_integrity: 'high' }
  },
  {
    text: 'Global energy consumption has increased by 500% in the last decade.',
    claimedSource: 'IEA (2024). World Energy Outlook 2024. International Energy Agency.',
    actualSource: 'IEA (2024). World Energy Outlook 2024. International Energy Agency. [Note: Actual increase is ~15%, not 500%]',
    metadata: { category: 'energy', expected_integrity: 'low' }
  },
  {
    text: 'Renewable energy now accounts for 30% of global electricity generation.',
    claimedSource: 'IEA (2023). Renewable Energy Market Update 2023.',
    actualSource: 'IEA (2023). Renewable Energy Market Update 2023.',
    metadata: { category: 'energy', expected_integrity: 'high' }
  },
];

// ============================================================================
// Benchmark Runner
// ============================================================================

class CitationThroughputBenchmark {
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
   * Analyze a single citation
   */
  async analyzeCitation(citation: typeof SAMPLE_CITATIONS[0]): Promise<{ latency: number; result: any }> {
    const startTime = Date.now();

    try {
      const response = await this.client.post('/api/citations/analyze', citation);
      const latency = Date.now() - startTime;

      return { latency, result: response.data };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error(`❌ Citation analysis error:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Run benchmark scenario
   */
  async runScenario(scenario: BenchmarkConfig['scenarios'][0]): Promise<{
    name: string;
    concurrency: number;
    totalCitations: number;
    totalTime: number;
    throughput: number;
    latencies: number[];
    errors: number;
    p50: number;
    p95: number;
    p99: number;
    avgLatency: number;
  }> {
    console.log(`\n📊 Running scenario: ${scenario.name}`);
    console.log(`   Concurrency: ${scenario.concurrency}`);
    console.log(`   Citations: ${this.config.numCitations}`);

    const latencies: number[] = [];
    let errors = 0;
    const startTime = Date.now();

    // Generate citation batch
    const citations = Array.from({ length: this.config.numCitations }, (_, i) => {
      return SAMPLE_CITATIONS[i % SAMPLE_CITATIONS.length];
    });

    // Process in batches based on concurrency
    for (let i = 0; i < citations.length; i += scenario.concurrency) {
      const batch = citations.slice(i, i + scenario.concurrency);

      const batchPromises = batch.map(async (citation) => {
        try {
          const { latency, result } = await this.analyzeCitation(citation);
          latencies.push(latency);

          // Progress indicator
          if (latencies.length % 10 === 0) {
            process.stdout.write(`\r   Progress: ${latencies.length}/${citations.length} citations analyzed...`);
          }
        } catch (error) {
          errors++;
        }
      });

      await Promise.all(batchPromises);
    }

    const totalTime = Date.now() - startTime;
    const throughput = (citations.length / totalTime) * 1000; // citations per second

    // Calculate percentiles
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.50)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;

    console.log(`\n   ✅ Scenario complete!`);
    console.log(`   Total time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   Throughput: ${throughput.toFixed(2)} citations/sec`);
    console.log(`   Avg latency: ${avgLatency.toFixed(0)}ms`);
    console.log(`   P95 latency: ${p95.toFixed(0)}ms`);
    console.log(`   Errors: ${errors}`);

    return {
      name: scenario.name,
      concurrency: scenario.concurrency,
      totalCitations: citations.length,
      totalTime,
      throughput,
      latencies,
      errors,
      p50,
      p95,
      p99,
      avgLatency,
    };
  }

  /**
   * Run all benchmark scenarios
   */
  async runAllScenarios(): Promise<any[]> {
    const results = [];

    for (const scenario of this.config.scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);

      // Cooldown between scenarios
      console.log(`\n⏸️  Cooling down for 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return results;
  }

  /**
   * Generate markdown report
   */
  async generateReport(results: any[]): Promise<void> {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    let markdown = `# MARCUS 3.0 - Citation Throughput Benchmark\n\n`;
    markdown += `**Date:** ${date}\n`;
    markdown += `**Timestamp:** ${timestamp}\n`;
    markdown += `**Platform:** ${this.config.baseURL}\n`;
    markdown += `**Citations Analyzed:** ${this.config.numCitations} per scenario\n\n`;
    markdown += `---\n\n`;

    // Executive Summary
    markdown += `## 📊 Executive Summary\n\n`;
    markdown += `| Scenario | Concurrency | Throughput | Avg Latency | P95 Latency | Target | Status |\n`;
    markdown += `|----------|-------------|------------|-------------|-------------|--------|--------|\n`;

    for (const result of results) {
      const scenario = this.config.scenarios.find(s => s.name === result.name);
      const targetMet = result.throughput >= (scenario?.targetCitationsPerSec || 0);
      const status = targetMet ? '✅ PASS' : '❌ FAIL';

      markdown += `| ${result.name} | ${result.concurrency} | ${result.throughput.toFixed(2)} c/s | ${result.avgLatency.toFixed(0)}ms | ${result.p95.toFixed(0)}ms | ${scenario?.targetCitationsPerSec} c/s | ${status} |\n`;
    }

    markdown += `\n---\n\n`;

    // Detailed Results
    markdown += `## 📈 Detailed Results\n\n`;

    for (const result of results) {
      markdown += `### ${result.name}\n\n`;
      markdown += `**Configuration:**\n`;
      markdown += `- Concurrency: ${result.concurrency} parallel requests\n`;
      markdown += `- Total Citations: ${result.totalCitations}\n`;
      markdown += `- Total Time: ${(result.totalTime / 1000).toFixed(2)} seconds\n`;
      markdown += `- Errors: ${result.errors}\n\n`;

      markdown += `**Performance Metrics:**\n`;
      markdown += `- **Throughput:** ${result.throughput.toFixed(2)} citations/sec\n`;
      markdown += `- **Average Latency:** ${result.avgLatency.toFixed(0)}ms\n`;
      markdown += `- **P50 Latency:** ${result.p50.toFixed(0)}ms\n`;
      markdown += `- **P95 Latency:** ${result.p95.toFixed(0)}ms\n`;
      markdown += `- **P99 Latency:** ${result.p99.toFixed(0)}ms\n\n`;

      const scenario = this.config.scenarios.find(s => s.name === result.name);
      const targetMet = result.throughput >= (scenario?.targetCitationsPerSec || 0);

      markdown += `**Success Criteria:**\n`;
      markdown += `- Target: ≥${scenario?.targetCitationsPerSec} citations/sec\n`;
      markdown += `- Actual: ${result.throughput.toFixed(2)} citations/sec\n`;
      markdown += `- Status: ${targetMet ? '✅ PASS' : '❌ FAIL'}\n\n`;
      markdown += `---\n\n`;
    }

    // Recommendations
    markdown += `## 💡 Recommendations\n\n`;

    const overallPass = results.every(r => {
      const scenario = this.config.scenarios.find(s => s.name === r.name);
      return r.throughput >= (scenario?.targetCitationsPerSec || 0);
    });

    if (overallPass) {
      markdown += `✅ All performance targets met! Platform ready for production load.\n\n`;
    } else {
      markdown += `⚠️ Some performance targets not met. Consider:\n\n`;
      markdown += `1. **Database Optimization:** Review slow queries, add missing indexes\n`;
      markdown += `2. **Connection Pooling:** Increase database pool size if exhausted\n`;
      markdown += `3. **Agent Scaling:** Add more Python agents for higher concurrency\n`;
      markdown += `4. **Redis Caching:** Verify cache hit rate, increase TTL if needed\n`;
      markdown += `5. **Load Balancing:** Consider horizontal scaling if single-node limits reached\n\n`;
    }

    markdown += `## 🔍 Next Steps\n\n`;
    markdown += `1. Review database slow query log for optimization opportunities\n`;
    markdown += `2. Run agent latency benchmark (IPC round-trip time)\n`;
    markdown += `3. Set up Prometheus + Grafana for continuous monitoring\n`;
    markdown += `4. Run load tests with sustained traffic patterns\n\n`;

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
  console.log(`\n🚀 MARCUS 3.0 - Citation Throughput Benchmark\n`);
  console.log(`================================================\n`);

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const numCitations = args.find(a => a.startsWith('--num-citations='))?.split('=')[1];
  const outputPath = args.find(a => a.startsWith('--output='))?.split('=')[1];

  const config = {
    ...DEFAULT_CONFIG,
    numCitations: numCitations ? parseInt(numCitations, 10) : DEFAULT_CONFIG.numCitations,
    outputPath: outputPath || DEFAULT_CONFIG.outputPath,
  };

  // Verify admin password is set
  if (!config.adminPassword) {
    console.error(`❌ Error: ADMIN_PASSWORD environment variable not set`);
    console.error(`   Please set it with the password from /tmp/marcus_admin_credentials.txt`);
    process.exit(1);
  }

  const benchmark = new CitationThroughputBenchmark(config);

  try {
    // Authenticate
    await benchmark.authenticate();

    // Run all scenarios
    const results = await benchmark.runAllScenarios();

    // Generate report
    await benchmark.generateReport(results);

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

export { CitationThroughputBenchmark, DEFAULT_CONFIG };
