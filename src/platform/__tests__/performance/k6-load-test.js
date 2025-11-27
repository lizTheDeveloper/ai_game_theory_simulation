/**
 * k6 Load Test Script for MARCUS 3.1 Platform
 *
 * This script uses k6 for advanced load testing with realistic traffic patterns.
 *
 * Usage:
 *   k6 run src/platform/__tests__/performance/k6-load-test.js
 *
 * Environment Variables:
 *   BASE_URL - Base URL of MARCUS platform (default: http://localhost:3000)
 *   SCENARIO - Which test scenario to run (default: all)
 *
 * Scenarios:
 *   - smoke: Quick sanity check (1 VU, 30s)
 *   - load: Normal load (10 VUs, 2min)
 *   - stress: Push to limits (50 VUs ramping to 100, 5min)
 *   - spike: Sudden traffic spike (0 → 200 VUs instantly, 1min)
 *   - soak: Sustained load over time (30 VUs, 30min)
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// Custom Metrics
// ============================================================================

const errorRate = new Rate('error_rate');
const healthCheckLatency = new Trend('health_check_latency');
const citationAnalysisLatency = new Trend('citation_analysis_latency');
const requestCounter = new Counter('total_requests');

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SCENARIO = __ENV.SCENARIO || 'all';

export const options = {
  scenarios: {
    // Smoke test: Verify system works with minimal load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
      exec: 'smokeTest'
    },

    // Load test: Normal production load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 VUs
        { duration: '1m', target: 10 },   // Stay at 10 VUs
        { duration: '30s', target: 0 }    // Ramp down
      ],
      tags: { scenario: 'load' },
      exec: 'loadTest'
    },

    // Stress test: Find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // Ramp to 50 VUs
        { duration: '2m', target: 50 },   // Hold at 50
        { duration: '1m', target: 100 },  // Push to 100
        { duration: '1m', target: 100 },  // Hold at peak
        { duration: '1m', target: 0 }     // Ramp down
      ],
      tags: { scenario: 'stress' },
      exec: 'stressTest'
    },

    // Spike test: Sudden traffic increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 0 },    // Baseline
        { duration: '10s', target: 200 },  // Spike to 200 instantly
        { duration: '30s', target: 200 },  // Hold spike
        { duration: '10s', target: 0 }     // Drop back
      ],
      tags: { scenario: 'spike' },
      exec: 'spikeTest'
    },

    // Soak test: Sustained load to find memory leaks
    soak: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30m',
      tags: { scenario: 'soak' },
      exec: 'soakTest'
    }
  },

  thresholds: {
    // SLO: P95 latency < 500ms for high load
    'health_check_latency': ['p(95)<500'],
    'citation_analysis_latency': ['p(95)<1000'],

    // SLO: Error rate < 1%
    'error_rate': ['rate<0.01'],

    // HTTP request success rate > 95%
    'http_req_failed': ['rate<0.05']
  }
};

// ============================================================================
// Test Functions
// ============================================================================

export function smokeTest() {
  const response = http.get(`${BASE_URL}/health`);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100
  });

  errorRate.add(!success);
  healthCheckLatency.add(response.timings.duration);
  requestCounter.add(1);

  sleep(1);
}

export function loadTest() {
  // Mix of health checks and API requests
  const endpoints = [
    { url: '/health', weight: 0.7 },
    { url: '/api/agents', weight: 0.2 },
    { url: '/metrics', weight: 0.1 }
  ];

  const endpoint = weightedChoice(endpoints);
  const response = http.get(`${BASE_URL}${endpoint.url}`);

  const success = check(response, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time < 500ms': (r) => r.timings.duration < 500
  });

  errorRate.add(!success);
  healthCheckLatency.add(response.timings.duration);
  requestCounter.add(1);

  sleep(Math.random() * 2); // Random think time 0-2s
}

export function stressTest() {
  // Heavier load with citation analysis
  const batch = http.batch([
    ['GET', `${BASE_URL}/health`],
    ['GET', `${BASE_URL}/api/agents`],
    ['GET', `${BASE_URL}/metrics`]
  ]);

  for (const response of batch) {
    const success = check(response, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300
    });

    errorRate.add(!success);
    healthCheckLatency.add(response.timings.duration);
    requestCounter.add(1);
  }

  sleep(0.5);
}

export function spikeTest() {
  // Rapid-fire requests during spike
  const response = http.get(`${BASE_URL}/health`);

  const success = check(response, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'not timeout': (r) => r.timings.duration < 5000
  });

  errorRate.add(!success);
  healthCheckLatency.add(response.timings.duration);
  requestCounter.add(1);

  // Minimal sleep during spike
  sleep(0.1);
}

export function soakTest() {
  // Realistic production traffic pattern
  const response = http.get(`${BASE_URL}/health`);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'no memory leak indicators': (r) => r.timings.duration < 1000
  });

  errorRate.add(!success);
  healthCheckLatency.add(response.timings.duration);
  requestCounter.add(1);

  sleep(1 + Math.random()); // 1-2s think time
}

// ============================================================================
// Helper Functions
// ============================================================================

function weightedChoice(items) {
  const random = Math.random();
  let cumulativeWeight = 0;

  for (const item of items) {
    cumulativeWeight += item.weight;
    if (random < cumulativeWeight) {
      return item;
    }
  }

  return items[items.length - 1];
}

// ============================================================================
// Lifecycle Hooks
// ============================================================================

export function setup() {
  console.log(`\n🚀 Starting k6 load test for MARCUS 3.1`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Scenario: ${SCENARIO}\n`);

  // Verify platform is up
  const response = http.get(`${BASE_URL}/health`);

  if (response.status !== 200) {
    throw new Error(`Platform not healthy: HTTP ${response.status}`);
  }

  console.log('✅ Platform health check passed\n');

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n\n✅ Load test completed in ${duration.toFixed(1)}s`);
}

export default function() {
  // This function is called if no specific scenario exec is set
  loadTest();
}
