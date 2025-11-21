/**
 * MARCUS 3.0 - Jest Test Setup
 *
 * This file runs before all tests to configure the test environment.
 *
 * Key responsibilities:
 * - Load test environment variables from .env.test
 * - Clear Prometheus metric registry (prevent duplicate registration errors)
 * - Set test timeouts
 * - Configure global test utilities
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { register } from 'prom-client';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Override NODE_ENV to test
process.env.NODE_ENV = 'test';

// Clear Prometheus registry before each test file
// This prevents "metric already registered" errors
beforeEach(() => {
  register.clear();
});

// Global test timeout
jest.setTimeout(60000); // 60 seconds for agent tests

// Log test environment configuration (for debugging)
if (process.env.DEBUG_TESTS === 'true') {
  console.log('🧪 Test Environment Configuration:');
  console.log(`  Database: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`  Redis: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
  console.log(`  Agents: ${process.env.ENABLE_AGENTS === 'true' ? 'enabled' : 'disabled'} (${process.env.NUM_AGENTS} agents)`);
}
