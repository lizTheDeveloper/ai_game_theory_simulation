/**
 * MARCUS 3.0 - API Load Testing Script
 * Phase 3.3.1: Load Testing with k6
 *
 * Tests HTTP API performance under various load scenarios:
 * - Baseline: 10 RPS for 5 minutes
 * - Sustained: 50 RPS for 10 minutes
 * - Spike: 100 RPS for 2 minutes
 * - Stress: Gradually increase to breaking point
 *
 * Success Criteria:
 * - 99.9% success rate at 50 RPS
 * - P95 latency <2s at 50 RPS
 * - No crashes or memory leaks
 * - Graceful degradation at high load
 *
 * Installation:
 *   sudo snap install k6
 *
 * Usage:
 *   # Baseline test (10 RPS, 5 min)
 *   k6 run --stage 5m:10 tests/load/api-load-test.js
 *
 *   # Sustained test (50 RPS, 10 min)
 *   k6 run --stage 10m:50 tests/load/api-load-test.js
 *
 *   # Spike test (100 RPS, 2 min)
 *   k6 run --stage 2m:100 tests/load/api-load-test.js
 *
 *   # Stress test (gradual ramp)
 *   k6 run tests/load/api-load-test.js
 *
 *   # With custom scenario
 *   K6_SCENARIO=baseline k6 run tests/load/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.MARCUS_API_URL || 'http://localhost:3000';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@marcus.local';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || '';

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable required');
}

// ============================================================================
// Custom Metrics
// ============================================================================

const errorRate = new Rate('errors');
const authFailures = new Counter('auth_failures');
const citationAnalysisTime = new Trend('citation_analysis_duration');
const successfulAnalyses = new Counter('successful_analyses');

// ============================================================================
// Test Scenarios
// ============================================================================

const scenarios = {
  // Baseline: 10 RPS for 5 minutes
  baseline: {
    executor: 'constant-arrival-rate',
    rate: 10,
    timeUnit: '1s',
    duration: '5m',
    preAllocatedVUs: 20,
    maxVUs: 50,
  },

  // Sustained: 50 RPS for 10 minutes
  sustained: {
    executor: 'constant-arrival-rate',
    rate: 50,
    timeUnit: '1s',
    duration: '10m',
    preAllocatedVUs: 100,
    maxVUs: 200,
  },

  // Spike: Sudden traffic spike
  spike: {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 200,
    stages: [
      { duration: '30s', target: 10 },   // Baseline
      { duration: '10s', target: 100 },  // Spike up
      { duration: '2m', target: 100 },   // Hold spike
      { duration: '10s', target: 10 },   // Spike down
      { duration: '1m', target: 10 },    // Recovery
    ],
  },

  // Stress: Gradually increase to breaking point
  stress: {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 500,
    stages: [
      { duration: '2m', target: 10 },    // Warm-up
      { duration: '5m', target: 50 },    // Normal load
      { duration: '5m', target: 100 },   // High load
      { duration: '5m', target: 200 },   // Stress
      { duration: '5m', target: 300 },   // Breaking point
      { duration: '2m', target: 0 },     // Cool-down
    ],
  },
};

// Select scenario from environment or default to stress test
const selectedScenario = __ENV.K6_SCENARIO || 'stress';
export const options = {
  scenarios: {
    [selectedScenario]: scenarios[selectedScenario],
  },
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // P95 < 2s
    'http_req_failed': ['rate<0.01'],    // Error rate < 1%
    'errors': ['rate<0.01'],             // Custom error rate < 1%
  },
};

// ============================================================================
// Sample Citations for Testing
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
];

// ============================================================================
// Setup: Authenticate Once Per VU
// ============================================================================

export function setup() {
  console.log(`Starting load test: ${selectedScenario}`);
  console.log(`Target: ${BASE_URL}`);

  // Authenticate to get JWT token
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status !== 200) {
    console.error(`Authentication failed: ${loginRes.status}`);
    authFailures.add(1);
    return { token: null };
  }

  const token = loginRes.json('accessToken');
  console.log('Authentication successful');

  return { token };
}

// ============================================================================
// Main Test Function
// ============================================================================

export default function(data) {
  if (!data.token) {
    console.error('No auth token available, skipping iteration');
    errorRate.add(1);
    return;
  }

  // Select random citation
  const citation = SAMPLE_CITATIONS[Math.floor(Math.random() * SAMPLE_CITATIONS.length)];

  // Analyze citation
  const startTime = Date.now();
  const res = http.post(
    `${BASE_URL}/api/citations/analyze`,
    JSON.stringify(citation),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      tags: { name: 'CitationAnalysis' },
    }
  );
  const duration = Date.now() - startTime;

  // Record metrics
  citationAnalysisTime.add(duration);

  // Check response
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'has integrity score': (r) => r.json('integrity.score') !== undefined,
    'has analysis data': (r) => r.json('analysis.numAgents') > 0,
  });

  if (success) {
    successfulAnalyses.add(1);
  } else {
    errorRate.add(1);
    console.error(`Request failed: ${res.status} - ${res.body}`);
  }

  // Think time (simulate user behavior)
  sleep(Math.random() * 2); // 0-2 seconds between requests
}

// ============================================================================
// Teardown: Final Summary
// ============================================================================

export function teardown(data) {
  console.log('Load test complete');
  console.log(`Scenario: ${selectedScenario}`);
}

// ============================================================================
// Custom Summary
// ============================================================================

export function handleSummary(data) {
  const date = new Date().toISOString().split('T')[0];
  const scenario = selectedScenario;

  return {
    [`tests/load/load-test-results_${scenario}_${date}.json`]: JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  const metrics = data.metrics;

  let summary = '\n';
  summary += `${indent}Load Test Summary (${selectedScenario})\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;

  // Request metrics
  summary += `${indent}Requests:\n`;
  summary += `${indent}  Total: ${metrics.http_reqs?.values?.count || 0}\n`;
  summary += `${indent}  Failed: ${metrics.http_req_failed?.values?.passes || 0} (${((metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%)\n`;
  summary += `${indent}  Rate: ${(metrics.http_reqs?.values?.rate || 0).toFixed(2)} req/s\n\n`;

  // Response times
  summary += `${indent}Response Times:\n`;
  summary += `${indent}  Avg: ${(metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms\n`;
  summary += `${indent}  P50: ${(metrics.http_req_duration?.values?.p50 || 0).toFixed(2)}ms\n`;
  summary += `${indent}  P95: ${(metrics.http_req_duration?.values?.p95 || 0).toFixed(2)}ms\n`;
  summary += `${indent}  P99: ${(metrics.http_req_duration?.values?.p99 || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Max: ${(metrics.http_req_duration?.values?.max || 0).toFixed(2)}ms\n\n`;

  // Custom metrics
  summary += `${indent}Custom Metrics:\n`;
  summary += `${indent}  Successful Analyses: ${metrics.successful_analyses?.values?.count || 0}\n`;
  summary += `${indent}  Error Rate: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `${indent}  Auth Failures: ${metrics.auth_failures?.values?.count || 0}\n\n`;

  // Success criteria
  summary += `${indent}Success Criteria:\n`;
  const p95 = metrics.http_req_duration?.values?.p95 || 0;
  const errorRate = (metrics.http_req_failed?.values?.rate || 0) * 100;
  summary += `${indent}  P95 < 2000ms: ${p95 < 2000 ? '✅ PASS' : '❌ FAIL'} (${p95.toFixed(2)}ms)\n`;
  summary += `${indent}  Error Rate < 1%: ${errorRate < 1 ? '✅ PASS' : '❌ FAIL'} (${errorRate.toFixed(2)}%)\n\n`;

  return summary;
}
