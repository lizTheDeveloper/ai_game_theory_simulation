/**
 * Unit tests for LSS (Local Surprise Signal) Monitor
 *
 * Coverage target: >90%
 * Test philosophy: Fail loudly, no silent fallbacks
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkParameterDrift,
  checkClaimDeviation,
  checkMemoryStaleness,
  checkVerificationSurprise,
  monitorLSS,
  logLSS,
  LSS_THRESHOLDS,
  ParameterWithProvenance,
  ClaimWithVerification,
  AgentMemory,
  VerificationResult,
  LSSContext,
} from '../../src/utils/lssMonitor';

describe('LSS Monitor', () => {
  const mockContext: LSSContext = {
    location: 'test',
    valueName: 'testParam',
  };

  describe('checkParameterDrift', () => {
    it('returns LSS=0 for PLACEHOLDER parameters (no citation yet)', () => {
      const param: ParameterWithProvenance = {
        value: 1.8,
        type: 'PLACEHOLDER',
      };

      const result = checkParameterDrift(param, mockContext);

      assert.strictEqual(result.lss, 0);
      assert.strictEqual(result.level, 'NONE');
      assert.ok(result.message.includes('PLACEHOLDER'));
    });

    it('returns LSS based on confidence for INFORMED parameters', () => {
      const param: ParameterWithProvenance = {
        value: 1.8,
        type: 'INFORMED',
        confidence: 0.6,
      };

      const result = checkParameterDrift(param, mockContext);

      // LSS = 1 - confidence = 1 - 0.6 = 0.4
      assert.ok(Math.abs(result.lss - 0.4) < 0.001);
      assert.strictEqual(result.level, 'WARNING'); // 0.4 is between 0.2 and 0.5
      assert.ok(result.message.includes('confidence 0.60'));
    });

    it('defaults to 0.5 confidence for INFORMED parameters without explicit confidence', () => {
      const param: ParameterWithProvenance = {
        value: 1.8,
        type: 'INFORMED',
      };

      const result = checkParameterDrift(param, mockContext);

      // LSS = 1 - 0.5 = 0.5
      assert.ok(Math.abs(result.lss - 0.5) < 0.001);
      assert.strictEqual(result.level, 'ALERT');
    });

    it('calculates drift ratio for VERIFIED parameters', () => {
      const param: ParameterWithProvenance = {
        value: 1.8,
        type: 'VERIFIED',
        citedValue: 2.0,
        doi: '10.1234/test',
      };

      const result = checkParameterDrift(param, mockContext);

      // Drift = |1.8 - 2.0| / 2.0 = 0.2 / 2.0 = 0.1 (10%)
      assert.ok(Math.abs(result.lss - 0.1) < 0.001);
      assert.strictEqual(result.level, 'NONE'); // 0.1 < 0.2 threshold
      assert.ok(result.message.includes('current=1.8'));
      assert.ok(result.message.includes('cited=2'));
      assert.ok(result.message.includes('drift=10.0%'));
    });

    it('triggers WARNING when drift > 0.2', () => {
      const param: ParameterWithProvenance = {
        value: 1.5,
        type: 'VERIFIED',
        citedValue: 2.0,
        doi: '10.1234/test',
      };

      const result = checkParameterDrift(param, mockContext);

      // Drift = |1.5 - 2.0| / 2.0 = 0.5 / 2.0 = 0.25 (25%)
      assert.ok(Math.abs(result.lss - 0.25) < 0.001);
      assert.strictEqual(result.level, 'WARNING'); // 0.25 > 0.2 threshold
    });

    it('triggers ALERT when drift > 0.5', () => {
      const param: ParameterWithProvenance = {
        value: 1.0,
        type: 'VERIFIED',
        citedValue: 2.0,
        doi: '10.1234/test',
      };

      const result = checkParameterDrift(param, mockContext);

      // Drift = |1.0 - 2.0| / 2.0 = 1.0 / 2.0 = 0.5
      assert.ok(Math.abs(result.lss - 0.5) < 0.001);
      assert.strictEqual(result.level, 'ALERT'); // 0.5 >= 0.5 threshold
    });

    it('throws error for VERIFIED parameter without citedValue', () => {
      const param: ParameterWithProvenance = {
        value: 1.8,
        type: 'VERIFIED',
        doi: '10.1234/test',
      };

      assert.throws(
        () => checkParameterDrift(param, mockContext),
        /VERIFIED parameter missing citedValue/
      );
    });

    it('handles negative values correctly', () => {
      const param: ParameterWithProvenance = {
        value: -1.8,
        type: 'VERIFIED',
        citedValue: -2.0,
        doi: '10.1234/test',
      };

      const result = checkParameterDrift(param, mockContext);

      // Drift = |-1.8 - (-2.0)| / |-2.0| = 0.2 / 2.0 = 0.1
      assert.ok(Math.abs(result.lss - 0.1) < 0.001);
      assert.strictEqual(result.level, 'NONE');
    });
  });

  describe('checkClaimDeviation', () => {
    it('returns LSS=1.0 for unverified claims (fabrication)', () => {
      const claim: ClaimWithVerification = {
        text: 'CO2 emissions increased by 500%',
        verified: false,
        confidence: 0,
      };

      const result = checkClaimDeviation(claim, mockContext);

      assert.strictEqual(result.lss, 1.0);
      assert.strictEqual(result.level, 'CRITICAL');
      assert.ok(result.message.includes('FABRICATION'));
    });

    it('returns low LSS for exact match (confidence >= 0.9)', () => {
      const claim: ClaimWithVerification = {
        text: 'CO2 emissions increased by 2.3%',
        verified: true,
        confidence: 0.95,
      };

      const result = checkClaimDeviation(claim, mockContext);

      // LSS = 1 - 0.95 = 0.05
      assert.ok(Math.abs(result.lss - 0.05) < 0.001);
      assert.strictEqual(result.level, 'NONE');
      assert.ok(result.message.includes('Exact match'));
    });

    it('returns LSS for paraphrase match (confidence 0.7-0.9)', () => {
      const claim: ClaimWithVerification = {
        text: 'CO2 emissions rose by approximately 2%',
        verified: true,
        confidence: 0.75,
      };

      const result = checkClaimDeviation(claim, mockContext);

      // LSS = 1 - 0.75 = 0.25
      assert.ok(Math.abs(result.lss - 0.25) < 0.001);
      assert.strictEqual(result.level, 'WARNING'); // 0.25 > 0.2 threshold
      assert.ok(result.message.includes('Paraphrase match'));
    });

    it('returns LSS=0.5 for weak match (confidence < 0.7)', () => {
      const claim: ClaimWithVerification = {
        text: 'Emissions increased somewhat',
        verified: true,
        confidence: 0.5,
      };

      const result = checkClaimDeviation(claim, mockContext);

      // LSS = 1 - 0.5 = 0.5
      assert.ok(Math.abs(result.lss - 0.5) < 0.001);
      assert.strictEqual(result.level, 'ALERT');
      assert.ok(result.message.includes('Weak match'));
    });
  });

  describe('checkMemoryStaleness', () => {
    it('returns LSS≈0 when memory just saved', () => {
      const memory: AgentMemory = {
        agentId: 'test-agent',
        lastSave: Date.now(),
        expectedInterval: 30 * 60 * 1000, // 30 minutes
      };

      const result = checkMemoryStaleness(memory, mockContext);

      assert.ok(result.lss < 0.01); // Nearly zero
      assert.strictEqual(result.level, 'NONE');
    });

    it('returns LSS≈1.0 when memory stale by exactly expected interval', () => {
      const memory: AgentMemory = {
        agentId: 'test-agent',
        lastSave: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        expectedInterval: 30 * 60 * 1000, // 30 minutes
      };

      const result = checkMemoryStaleness(memory, mockContext);

      assert.ok(Math.abs(result.lss - 1.0) < 0.01);
      assert.strictEqual(result.level, 'CRITICAL');
    });

    it('returns LSS≈0.5 when memory half-stale', () => {
      const memory: AgentMemory = {
        agentId: 'test-agent',
        lastSave: Date.now() - 15 * 60 * 1000, // 15 minutes ago
        expectedInterval: 30 * 60 * 1000, // 30 minutes
      };

      const result = checkMemoryStaleness(memory, mockContext);

      assert.ok(Math.abs(result.lss - 0.5) < 0.01);
      assert.strictEqual(result.level, 'ALERT');
    });

    it('includes agent ID in message', () => {
      const memory: AgentMemory = {
        agentId: 'sylvia',
        lastSave: Date.now() - 10 * 60 * 1000,
        expectedInterval: 30 * 60 * 1000,
      };

      const result = checkMemoryStaleness(memory, mockContext);

      assert.ok(result.message.includes('agent: sylvia'));
    });
  });

  describe('checkVerificationSurprise', () => {
    it('returns LSS=1.0 for failed verification', () => {
      const verificationResult: VerificationResult = {
        verified: false,
        confidence: 0,
      };

      const result = checkVerificationSurprise(verificationResult, mockContext);

      assert.strictEqual(result.lss, 1.0);
      assert.strictEqual(result.level, 'CRITICAL');
      assert.ok(result.message.includes('failed'));
    });

    it('returns LSS=0 for exact match (confidence >= 0.9)', () => {
      const verificationResult: VerificationResult = {
        verified: true,
        confidence: 0.95,
        match: 'exact',
      };

      const result = checkVerificationSurprise(verificationResult, mockContext);

      assert.strictEqual(result.lss, 0);
      assert.strictEqual(result.level, 'NONE');
      assert.ok(result.message.includes('Exact match'));
    });

    it('returns LSS=0.2 for paraphrase match (confidence 0.7-0.9)', () => {
      const verificationResult: VerificationResult = {
        verified: true,
        confidence: 0.8,
        match: 'paraphrase',
      };

      const result = checkVerificationSurprise(verificationResult, mockContext);

      assert.strictEqual(result.lss, 0.2);
      assert.strictEqual(result.level, 'WARNING');
      assert.ok(result.message.includes('Paraphrase match'));
    });

    it('returns LSS=0.5 for weak match (confidence < 0.7)', () => {
      const verificationResult: VerificationResult = {
        verified: true,
        confidence: 0.6,
      };

      const result = checkVerificationSurprise(verificationResult, mockContext);

      assert.strictEqual(result.lss, 0.5);
      assert.strictEqual(result.level, 'ALERT');
      assert.ok(result.message.includes('Weak match'));
    });
  });

  describe('LSS_THRESHOLDS', () => {
    it('defines correct threshold values', () => {
      assert.strictEqual(LSS_THRESHOLDS.WARNING, 0.2);
      assert.strictEqual(LSS_THRESHOLDS.ALERT, 0.5);
      assert.strictEqual(LSS_THRESHOLDS.CRITICAL, 1.0);
    });

    it('thresholds are ordered correctly', () => {
      assert.ok(LSS_THRESHOLDS.WARNING < LSS_THRESHOLDS.ALERT);
      assert.ok(LSS_THRESHOLDS.ALERT < LSS_THRESHOLDS.CRITICAL);
    });
  });

  describe('monitorLSS', () => {
    it('returns false for NONE level (no action)', () => {
      const result = monitorLSS({
        lss: 0.1,
        level: 'NONE',
        message: 'test',
        context: mockContext,
      });

      assert.strictEqual(result, false);
    });

    it('returns true for WARNING level', () => {
      const result = monitorLSS({
        lss: 0.3,
        level: 'WARNING',
        message: 'test warning',
        context: mockContext,
      });

      assert.strictEqual(result, true);
    });

    it('returns true for ALERT level', () => {
      const result = monitorLSS({
        lss: 0.6,
        level: 'ALERT',
        message: 'test alert',
        context: mockContext,
      });

      assert.strictEqual(result, true);
    });

    it('returns true for CRITICAL level', () => {
      const result = monitorLSS({
        lss: 1.0,
        level: 'CRITICAL',
        message: 'test critical',
        context: mockContext,
      });

      assert.strictEqual(result, true);
    });
  });
});
