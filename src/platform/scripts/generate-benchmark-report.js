#!/usr/bin/env node
/**
 * MARCUS 3.0 - Benchmark Report Generator
 * Generates HTML report from benchmark results
 * 
 * Updated: 2025-11-28 - Handle multiple input formats and missing fields
 */

const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Usage: generate-benchmark-report.js <results.json> [comparison.json]');
  process.exit(1);
}

const resultsFile = process.argv[2];
const comparisonFile = process.argv[3];

const rawResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const comparison = comparisonFile && fs.existsSync(comparisonFile) 
  ? JSON.parse(fs.readFileSync(comparisonFile, 'utf8')) 
  : null;

// Normalize results to expected format
// Handle both merged CI format and direct benchmark output
function normalizeResults(raw) {
  const results = {
    timestamp: raw.timestamp || new Date().toISOString(),
    commit: raw.commit || 'unknown',
    branch: raw.branch || 'unknown',
    accuracy: {
      overall: 0,
      f1_score: 0,
      precision: 0,
      recall: 0,
      consensus: 0
    },
    performance: {
      latency_p50: 0,
      latency_p95: 0,
      latency_p99: 0,
      throughput: 0,
      memory_mb: 0,
      cpu_percent: 0
    },
    scalability: {
      agents: []
    }
  };

  // Handle accuracy - could be from Python benchmarks or TypeScript metrics
  if (raw.accuracy) {
    // Python format: { overall, f1_score, precision, recall, consensus }
    // TypeScript format: { accuracy, f1Score, precision, recall }
    results.accuracy.overall = raw.accuracy.overall ?? raw.accuracy.accuracy ?? 0;
    results.accuracy.f1_score = raw.accuracy.f1_score ?? raw.accuracy.f1Score ?? 0;
    results.accuracy.precision = raw.accuracy.precision ?? 0;
    results.accuracy.recall = raw.accuracy.recall ?? 0;
    results.accuracy.consensus = raw.accuracy.consensus ?? 0;
  } else if (raw.metrics?.accuracy) {
    // Direct TypeScript benchmark output format
    const acc = raw.metrics.accuracy;
    results.accuracy.overall = acc.accuracy ?? 0;
    results.accuracy.f1_score = acc.f1Score ?? 0;
    results.accuracy.precision = acc.precision ?? 0;
    results.accuracy.recall = acc.recall ?? 0;
    results.accuracy.consensus = 0; // Not in TypeScript accuracy metrics
  }

  // Handle performance - could be from TypeScript benchmarks
  if (raw.performance) {
    // Merged format from CI: { latency_p50, latency_p95, throughput, ... }
    // TypeScript format: { p50LatencyMs, p95LatencyMs, throughputPerSec, ... }
    results.performance.latency_p50 = raw.performance.latency_p50 ?? raw.performance.p50LatencyMs ?? 0;
    results.performance.latency_p95 = raw.performance.latency_p95 ?? raw.performance.p95LatencyMs ?? 0;
    results.performance.latency_p99 = raw.performance.latency_p99 ?? raw.performance.p99LatencyMs ?? 0;
    results.performance.throughput = raw.performance.throughput ?? raw.performance.throughputPerSec ?? 0;
    results.performance.memory_mb = raw.performance.memory_mb ?? raw.performance.memoryUsageMb ?? 0;
    results.performance.cpu_percent = raw.performance.cpu_percent ?? 0;
  } else if (raw.metrics?.performance) {
    // Direct TypeScript benchmark output format
    const perf = raw.metrics.performance;
    results.performance.latency_p50 = perf.p50LatencyMs ?? 0;
    results.performance.latency_p95 = perf.p95LatencyMs ?? 0;
    results.performance.latency_p99 = perf.p99LatencyMs ?? 0;
    results.performance.throughput = perf.throughputPerSec ?? 0;
    results.performance.memory_mb = perf.memoryUsageMb ?? 0;
    results.performance.cpu_percent = 0;
  }

  // Handle scalability
  if (raw.scalability) {
    if (Array.isArray(raw.scalability)) {
      // TypeScript format: [{ numAgents, throughput, latencyP95, consensusLevel }]
      results.scalability.agents = raw.scalability.map(s => ({
        count: s.numAgents ?? s.count ?? 0,
        throughput: s.throughput ?? 0,
        latency_p95: s.latencyP95 ?? s.latency_p95 ?? 0
      }));
    } else if (raw.scalability.agents) {
      // Already in expected format
      results.scalability.agents = raw.scalability.agents;
    }
  }

  return results;
}

const results = normalizeResults(rawResults);

// Safe value formatter - handles undefined/null gracefully
function safePercent(value, decimals = 1) {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  return (value * 100).toFixed(decimals) + '%';
}

function safeNumber(value, decimals = 1, suffix = '') {
  if (value === undefined || value === null || isNaN(value)) return 'N/A';
  return value.toFixed(decimals) + suffix;
}

function safeValue(value, suffix = '') {
  if (value === undefined || value === null) return 'N/A';
  return value + suffix;
}

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MARCUS 3.0 Benchmark Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; margin-top: 30px; }
    .meta {
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .meta p { margin: 5px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #3498db;
      color: white;
      font-weight: 600;
    }
    tr:hover { background: #f8f9fa; }
    .metric-card {
      display: inline-block;
      background: white;
      padding: 20px;
      margin: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 200px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #3498db;
    }
    .metric-label {
      color: #7f8c8d;
      margin-top: 5px;
    }
    .status-ok { color: #27ae60; }
    .status-regression { color: #e74c3c; }
    .status-improvement { color: #2ecc71; }
    .na { color: #95a5a6; font-style: italic; }
  </style>
</head>
<body>
  <h1>🚀 MARCUS 3.0 Benchmark Report</h1>

  <div class="meta">
    <p><strong>Timestamp:</strong> ${results.timestamp}</p>
    <p><strong>Commit:</strong> ${results.commit}</p>
    <p><strong>Branch:</strong> ${results.branch}</p>
  </div>

  <h2>📊 Key Metrics</h2>
  <div>
    <div class="metric-card">
      <div class="metric-value">${safePercent(results.accuracy.overall)}</div>
      <div class="metric-label">Accuracy</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${safePercent(results.accuracy.f1_score)}</div>
      <div class="metric-label">F1 Score</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${safePercent(results.accuracy.consensus)}</div>
      <div class="metric-label">Consensus</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${safeNumber(results.performance.latency_p95, 1, 'ms')}</div>
      <div class="metric-label">p95 Latency</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${safeNumber(results.performance.throughput, 1)}</div>
      <div class="metric-label">Throughput (cit/s)</div>
    </div>
  </div>

  <h2>🎯 Accuracy Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Overall Accuracy</td><td>${safePercent(results.accuracy.overall, 2)}</td></tr>
      <tr><td>F1 Score</td><td>${safePercent(results.accuracy.f1_score, 2)}</td></tr>
      <tr><td>Precision</td><td>${safePercent(results.accuracy.precision, 2)}</td></tr>
      <tr><td>Recall</td><td>${safePercent(results.accuracy.recall, 2)}</td></tr>
      <tr><td>Consensus</td><td>${safePercent(results.accuracy.consensus, 2)}</td></tr>
    </tbody>
  </table>

  <h2>⚡ Performance Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>p50 Latency</td><td>${safeNumber(results.performance.latency_p50, 1, 'ms')}</td></tr>
      <tr><td>p95 Latency</td><td>${safeNumber(results.performance.latency_p95, 1, 'ms')}</td></tr>
      <tr><td>p99 Latency</td><td>${safeNumber(results.performance.latency_p99, 1, 'ms')}</td></tr>
      <tr><td>Throughput</td><td>${safeNumber(results.performance.throughput, 1, ' citations/sec')}</td></tr>
      <tr><td>Memory Usage</td><td>${safeNumber(results.performance.memory_mb, 1, ' MB')}</td></tr>
      <tr><td>CPU Usage</td><td>${safeNumber(results.performance.cpu_percent, 1, '%')}</td></tr>
    </tbody>
  </table>

  ${comparison && comparison.report ? `
  <h2>📈 Comparison to Baseline</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Baseline</th>
        <th>Current</th>
        <th>Change</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${comparison.report.map(r => `
        <tr>
          <td>${r.metric || 'unknown'}</td>
          <td>${r.baseline || 'N/A'}</td>
          <td>${r.current || 'N/A'}</td>
          <td>${r.change || 'N/A'}</td>
          <td class="${(r.status || '').includes('REGRESSION') ? 'status-regression' : (r.status || '').includes('IMPROVEMENT') ? 'status-improvement' : 'status-ok'}">${r.status || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${results.scalability.agents.length > 0 ? `
  <h2>📈 Scalability</h2>
  <table>
    <thead>
      <tr>
        <th>Agents</th>
        <th>Throughput (cit/s)</th>
        <th>p95 Latency (ms)</th>
      </tr>
    </thead>
    <tbody>
      ${results.scalability.agents.map(a => `
        <tr>
          <td>${safeValue(a.count)}</td>
          <td>${safeNumber(a.throughput, 1)}</td>
          <td>${safeNumber(a.latency_p95, 1)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : `
  <h2>📈 Scalability</h2>
  <p class="na">No scalability data available</p>
  `}

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; text-align: center;">
    <p>Generated by MARCUS 3.0 Benchmark Suite • ${new Date().toISOString()}</p>
  </footer>
</body>
</html>
`;

console.log(html);
