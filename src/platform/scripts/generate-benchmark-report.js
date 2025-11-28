#!/usr/bin/env node
/**
 * MARCUS 3.0 - Benchmark Report Generator
 * Generates HTML report from benchmark results
 */

const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Usage: generate-benchmark-report.js <results.json> [comparison.json]');
  process.exit(1);
}

const resultsFile = process.argv[2];
const comparisonFile = process.argv[3];

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const comparison = comparisonFile ? JSON.parse(fs.readFileSync(comparisonFile, 'utf8')) : null;

// Handle missing sections gracefully
const accuracy = results.accuracy || {};
const performance = results.performance || {};
const scalability = results.scalability || { agents: [] };

// Helper to safely format percentages
const formatPercent = (val) => (typeof val === 'number' ? (val * 100).toFixed(1) : 'N/A');
const formatNumber = (val, suffix = '') => (typeof val === 'number' ? val + suffix : 'N/A');

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
      <div class="metric-value">${formatPercent(accuracy.overall)}%</div>
      <div class="metric-label">Accuracy</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${formatPercent(accuracy.f1_score)}%</div>
      <div class="metric-label">F1 Score</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${formatPercent(accuracy.consensus)}%</div>
      <div class="metric-label">Consensus</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${formatNumber(performance.latency_p95, 'ms')}</div>
      <div class="metric-label">p95 Latency</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${formatNumber(performance.throughput)}</div>
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
      <tr><td>Overall Accuracy</td><td>${formatPercent(accuracy.overall)}%</td></tr>
      <tr><td>F1 Score</td><td>${formatPercent(accuracy.f1_score)}%</td></tr>
      <tr><td>Precision</td><td>${formatPercent(accuracy.precision)}%</td></tr>
      <tr><td>Recall</td><td>${formatPercent(accuracy.recall)}%</td></tr>
      <tr><td>Consensus</td><td>${formatPercent(accuracy.consensus)}%</td></tr>
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
      <tr><td>p50 Latency</td><td>${formatNumber(performance.latency_p50, 'ms')}</td></tr>
      <tr><td>p95 Latency</td><td>${formatNumber(performance.latency_p95, 'ms')}</td></tr>
      <tr><td>p99 Latency</td><td>${formatNumber(performance.latency_p99, 'ms')}</td></tr>
      <tr><td>Throughput</td><td>${formatNumber(performance.throughput, ' citations/sec')}</td></tr>
      <tr><td>Memory Usage</td><td>${formatNumber(performance.memory_mb, ' MB')}</td></tr>
      <tr><td>CPU Usage</td><td>${formatNumber(performance.cpu_percent, '%')}</td></tr>
    </tbody>
  </table>

  ${comparison ? `
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
          <td>${r.metric}</td>
          <td>${r.baseline}</td>
          <td>${r.current}</td>
          <td>${r.change}</td>
          <td class="${r.status.includes('REGRESSION') ? 'status-regression' : r.status.includes('IMPROVEMENT') ? 'status-improvement' : 'status-ok'}">${r.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  ${scalability.agents && scalability.agents.length > 0 ? `
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
      ${scalability.agents.map(a => `
        <tr>
          <td>${a.count || 'N/A'}</td>
          <td>${a.throughput || 'N/A'}</td>
          <td>${a.latency_p95 || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; text-align: center;">
    <p>Generated by MARCUS 3.0 Benchmark Suite • ${new Date().toISOString()}</p>
  </footer>
</body>
</html>
`;

console.log(html);
