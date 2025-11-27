#!/usr/bin/env tsx

/**
 * Performance Baseline Collection Script
 *
 * Collects performance metrics over a 7-day period to establish production baselines.
 * Metrics are queried from Prometheus and statistical baselines (mean, p50, p95, p99, stddev)
 * are calculated and stored for anomaly detection.
 *
 * Usage:
 *   npx tsx scripts/collect-baseline.ts --environment prod --duration 7d
 *   npx tsx scripts/collect-baseline.ts --help
 */

import * as fs from 'fs';
import * as path from 'path';

interface BaselineConfig {
  prometheusUrl: string;
  environment: string;
  duration: string; // e.g., '7d', '24h'
  samplingInterval: string; // e.g., '1m', '5m'
  outputPath: string;
}

interface MetricStats {
  metric: string;
  mean: number;
  median: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  stddev: number;
  min: number;
  max: number;
  samples: number;
}

interface BaselineData {
  collectionDate: string;
  environment: string;
  duration: string;
  metrics: {
    latency: MetricStats;
    throughput: MetricStats;
    accuracy: MetricStats;
    f1Score: MetricStats;
    consensus: MetricStats;
    dbQueryLatency: MetricStats;
    cacheHitRate: MetricStats;
    memoryUsage: MetricStats;
    cpuUtilization: MetricStats;
    errorRate: MetricStats;
  };
}

class BaselineCollector {
  private config: BaselineConfig;

  constructor(config: BaselineConfig) {
    this.config = config;
  }

  /**
   * Query Prometheus for metric data
   */
  private async queryPrometheus(query: string): Promise<number[]> {
    const url = `${this.config.prometheusUrl}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${this.getStartTime()}&end=${this.getEndTime()}&step=${this.config.samplingInterval}`;

    console.log(`📊 Querying: ${query.substring(0, 80)}...`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Prometheus query failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data?.result?.[0]?.values) {
        console.warn(`⚠️  No data for query: ${query}`);
        return [];
      }

      // Extract values from time series
      const values = data.data.result[0].values.map((v: [number, string]) => parseFloat(v[1]));
      return values.filter((v: number) => !isNaN(v) && isFinite(v));
    } catch (error) {
      console.error(`❌ Error querying Prometheus: ${error}`);
      return [];
    }
  }

  /**
   * Calculate statistical metrics from sample data
   */
  private calculateStats(metricName: string, values: number[]): MetricStats {
    if (values.length === 0) {
      console.warn(`⚠️  No samples for ${metricName}, using zero baseline`);
      return {
        metric: metricName,
        mean: 0,
        median: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        stddev: 0,
        min: 0,
        max: 0,
        samples: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;

    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const median = this.percentile(sorted, 50);
    const p50 = median;
    const p90 = this.percentile(sorted, 90);
    const p95 = this.percentile(sorted, 95);
    const p99 = this.percentile(sorted, 99);

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[n - 1];

    return {
      metric: metricName,
      mean,
      median,
      p50,
      p90,
      p95,
      p99,
      stddev,
      min,
      max,
      samples: n,
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Get start time for query range
   */
  private getStartTime(): string {
    const now = Date.now();
    const durationMs = this.parseDuration(this.config.duration);
    return Math.floor((now - durationMs) / 1000).toString();
  }

  /**
   * Get end time for query range
   */
  private getEndTime(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  /**
   * Collect all baseline metrics
   */
  async collect(): Promise<BaselineData> {
    console.log(`\n🎯 Collecting baseline metrics for ${this.config.environment} over ${this.config.duration}...\n`);

    const env = this.config.environment;

    // Collect metrics in parallel
    const [
      latencyValues,
      throughputValues,
      accuracyValues,
      f1ScoreValues,
      consensusValues,
      dbQueryLatencyValues,
      cacheHitRateValues,
      memoryUsageValues,
      cpuUtilizationValues,
      errorRateValues,
    ] = await Promise.all([
      this.queryPrometheus(`histogram_quantile(0.95, rate(citation_latency_ms_bucket{environment="${env}"}[5m]))`),
      this.queryPrometheus(`rate(citation_analyses_total{environment="${env}"}[5m])`),
      this.queryPrometheus(`citation_accuracy_total{environment="${env}"}`),
      this.queryPrometheus(`citation_f1_score{environment="${env}"}`),
      this.queryPrometheus(`avg(citation_consensus{environment="${env}"})`),
      this.queryPrometheus(`histogram_quantile(0.95, rate(db_query_duration_ms_bucket{environment="${env}"}[5m]))`),
      this.queryPrometheus(`redis_cache_hit_rate{environment="${env}"}`),
      this.queryPrometheus(`sum(agent_memory_rss_bytes{environment="${env}"})`),
      this.queryPrometheus(`sum(rate(agent_cpu_seconds_total{environment="${env}"}[5m])) * 100`),
      this.queryPrometheus(`rate(http_requests_total{environment="${env}", status=~"5.."}[5m]) / rate(http_requests_total{environment="${env}"}[5m])`),
    ]);

    console.log('\n📈 Calculating statistical baselines...\n');

    const baseline: BaselineData = {
      collectionDate: new Date().toISOString(),
      environment: env,
      duration: this.config.duration,
      metrics: {
        latency: this.calculateStats('citation_latency_p95_ms', latencyValues),
        throughput: this.calculateStats('citation_throughput_per_sec', throughputValues),
        accuracy: this.calculateStats('citation_accuracy', accuracyValues),
        f1Score: this.calculateStats('citation_f1_score', f1ScoreValues),
        consensus: this.calculateStats('citation_consensus', consensusValues),
        dbQueryLatency: this.calculateStats('db_query_latency_p95_ms', dbQueryLatencyValues),
        cacheHitRate: this.calculateStats('redis_cache_hit_rate', cacheHitRateValues),
        memoryUsage: this.calculateStats('agent_memory_usage_bytes', memoryUsageValues),
        cpuUtilization: this.calculateStats('agent_cpu_utilization_percent', cpuUtilizationValues),
        errorRate: this.calculateStats('http_error_rate', errorRateValues),
      },
    };

    return baseline;
  }

  /**
   * Save baseline to file
   */
  save(baseline: BaselineData): void {
    const outputFile = path.resolve(this.config.outputPath);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(baseline, null, 2));
    console.log(`\n✅ Baseline saved to: ${outputFile}\n`);
  }

  /**
   * Print baseline summary
   */
  printSummary(baseline: BaselineData): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  BASELINE SUMMARY - ${baseline.environment.toUpperCase()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Collection Date: ${baseline.collectionDate}`);
    console.log(`  Duration: ${baseline.duration}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const printMetric = (name: string, stats: MetricStats, unit: string = '') => {
      console.log(`📊 ${name}:`);
      console.log(`   Mean:   ${stats.mean.toFixed(2)}${unit} (σ=${stats.stddev.toFixed(2)})`);
      console.log(`   p50:    ${stats.p50.toFixed(2)}${unit}`);
      console.log(`   p95:    ${stats.p95.toFixed(2)}${unit}`);
      console.log(`   p99:    ${stats.p99.toFixed(2)}${unit}`);
      console.log(`   Range:  [${stats.min.toFixed(2)}, ${stats.max.toFixed(2)}]${unit}`);
      console.log(`   Samples: ${stats.samples}\n`);
    };

    printMetric('Citation Latency', baseline.metrics.latency, 'ms');
    printMetric('Throughput', baseline.metrics.throughput, '/sec');
    printMetric('Accuracy', baseline.metrics.accuracy, '');
    printMetric('F1 Score', baseline.metrics.f1Score, '');
    printMetric('Consensus', baseline.metrics.consensus, '');
    printMetric('DB Query Latency', baseline.metrics.dbQueryLatency, 'ms');
    printMetric('Cache Hit Rate', baseline.metrics.cacheHitRate, '');
    printMetric('Memory Usage', baseline.metrics.memoryUsage, ' bytes');
    printMetric('CPU Utilization', baseline.metrics.cpuUtilization, '%');
    printMetric('Error Rate', baseline.metrics.errorRate, '');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npx tsx scripts/collect-baseline.ts [options]

Options:
  --environment <env>    Environment to collect from (default: prod)
  --duration <duration>  Collection duration (default: 7d)
  --interval <interval>  Sampling interval (default: 1m)
  --prometheus <url>     Prometheus URL (default: http://localhost:9090)
  --output <path>        Output file path (default: baselines/production-baseline.json)
  --help, -h             Show this help message

Examples:
  npx tsx scripts/collect-baseline.ts --environment prod --duration 7d
  npx tsx scripts/collect-baseline.ts --environment staging --duration 24h --interval 5m
    `);
    process.exit(0);
  }

  const getArg = (flag: string, defaultValue: string): string => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
  };

  const config: BaselineConfig = {
    prometheusUrl: getArg('--prometheus', 'http://localhost:9090'),
    environment: getArg('--environment', 'prod'),
    duration: getArg('--duration', '7d'),
    samplingInterval: getArg('--interval', '1m'),
    outputPath: getArg('--output', 'baselines/production-baseline.json'),
  };

  console.log('🚀 MARCUS Performance Baseline Collector\n');
  console.log(`Configuration:`);
  console.log(`  Prometheus: ${config.prometheusUrl}`);
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Duration: ${config.duration}`);
  console.log(`  Interval: ${config.samplingInterval}`);
  console.log(`  Output: ${config.outputPath}\n`);

  const collector = new BaselineCollector(config);

  try {
    const baseline = await collector.collect();
    collector.printSummary(baseline);
    collector.save(baseline);

    console.log('✨ Baseline collection complete!\n');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Baseline collection failed: ${error}\n`);
    process.exit(1);
  }
}

main();
