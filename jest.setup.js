// Jest setup file
// Runs before each test suite

// Extend Jest matchers with @testing-library/jest-dom
require('@testing-library/jest-dom');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce noise during tests

// Mock console methods to reduce test output noise (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   // Keep error for debugging test failures
// };

// Global test timeout
jest.setTimeout(10000);
