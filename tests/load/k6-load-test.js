/**
 * K6 Load Test for Citation Integrity Platform
 *
 * Usage:
 *   k6 run tests/load/k6-load-test.js
 *
 * Stages:
 *   1. Ramp up to 100 users over 2 minutes
 *   2. Stay at 100 users for 5 minutes
 *   3. Ramp up to 1000 users over 3 minutes
 *   4. Stay at 1000 users for 5 minutes
 *   5. Ramp down to 0 over 2 minutes
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestDuration = new Trend('request_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '3m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    // HTTP request duration should be < 500ms for 95% of requests
    'http_req_duration': ['p(95)<500'],
    // Error rate should be < 1%
    'errors': ['rate<0.01'],
    // 99% of requests should succeed
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const API_KEY = __ENV.API_KEY || 'test_api_key';

// Test data
const testParameters = [
  'ai_capability_growth_rate',
  'alignment_difficulty',
  'compute_cost_reduction_rate',
  'regulation_stringency',
];

const testClaims = [
  'AI capabilities are growing exponentially',
  'Alignment difficulty increases with model size',
  'Compute costs are decreasing by 40% per year',
];

/**
 * Setup function (runs once)
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);

  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Health check failed: ${healthRes.status}`);
  }

  return { startTime: Date.now() };
}

/**
 * Main test function (runs for each VU iteration)
 */
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  // Scenario: Mix of read/write operations
  const scenario = Math.random();

  if (scenario < 0.5) {
    // 50%: Get parameter provenance
    testGetParameterProvenance(headers);
  } else if (scenario < 0.75) {
    // 25%: Verify citation
    testVerifyCitation(headers);
  } else if (scenario < 0.9) {
    // 15%: Detect claims
    testDetectClaims(headers);
  } else {
    // 10%: Get LSS alerts
    testGetLSSAlerts(headers);
  }

  // Think time (random 1-5 seconds)
  sleep(Math.random() * 4 + 1);
}

function testGetParameterProvenance(headers) {
  const paramName = testParameters[Math.floor(Math.random() * testParameters.length)];
  const res = http.get(`${BASE_URL}/api/provenance/parameters/${paramName}`, { headers });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has provenance data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.parameter;
      } catch {
        return false;
      }
    },
  });

  recordMetrics(res, success);
}

function testVerifyCitation(headers) {
  const payload = JSON.stringify({
    citation: {
      title: 'Test Citation',
      authors: ['Author 1', 'Author 2'],
      year: 2024,
      doi: '10.1000/test.citation',
    },
  });

  const res = http.post(`${BASE_URL}/api/verification/citations`, payload, { headers });

  const success = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'has verification result': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && typeof body.verified === 'boolean';
      } catch {
        return false;
      }
    },
  });

  recordMetrics(res, success);
}

function testDetectClaims(headers) {
  const claim = testClaims[Math.floor(Math.random() * testClaims.length)];
  const payload = JSON.stringify({
    text: claim,
    context: 'Load test',
  });

  const res = http.post(`${BASE_URL}/api/claims/detect`, payload, { headers });

  const success = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  recordMetrics(res, success);
}

function testGetLSSAlerts(headers) {
  const res = http.get(`${BASE_URL}/api/lss/alerts?severity=WARNING`, { headers });

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
    'has alerts array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.alerts);
      } catch {
        return false;
      }
    },
  });

  recordMetrics(res, success);
}

function recordMetrics(res, success) {
  errorRate.add(!success);
  requestDuration.add(res.timings.duration);

  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

/**
 * Teardown function (runs once at end)
 */
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
