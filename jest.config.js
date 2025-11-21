/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Exclude Node.js test runner files (use npm run test:backend for these)
  // These tests use: import { describe, test } from 'node:test'
  // Run with: npx tsx --test <file> or npm run test:backend
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/platform/tests/', // Node.js test runner (TAP format)
    '<rootDir>/tests/integration/', // Node.js test runner
    '<rootDir>/tests/data/', // Node.js test runner
    '<rootDir>/tests/thresholds/', // Node.js test runner
    '<rootDir>/tests/performance/', // Node.js test runner
    '<rootDir>/tests/indigenousParadigm.test.ts', // Node.js test runner
    '<rootDir>/tests/multiParadigmDUIPhase.test.ts', // Node.js test runner
    '<rootDir>/tests/tier2-phase2a-noise-injection-validation.test.ts', // Node.js test runner
    '<rootDir>/tests/organization-country-linkage.test.ts', // Node.js test runner
    '<rootDir>/src/simulation/engine/__tests__/PhaseOrchestrator.cycle-detection.test.ts', // Node.js test runner
  ],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  collectCoverageFrom: [
    'src/platform/**/*.ts',
    'src/simulation/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testTimeout: 30000,
  verbose: false,  // Only show failed tests and summary
  bail: false,
  maxWorkers: '50%',
  silent: false,   // Allow console.log in tests (for debugging)
};
