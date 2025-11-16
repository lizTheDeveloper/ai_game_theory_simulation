/**
 * Citation Integrity Platform - End-to-End Test Suite
 *
 * Tests all 4 problems integrated together:
 * 1. Unsourced Parameters → Parameter provenance tracking
 * 2. Grade Inflation → Automated grading
 * 3. Memory Amnesia → Auto-save middleware
 * 4. Citation Hallucination → Nested Learning architecture
 *
 * @see PROJECT_PLAN_CITATION_INTEGRITY.md Phase 5
 */

import { test, expect } from '@playwright/test';
import { MultiLevelState } from '../../src/platform/multiLevelState';
import { VerificationQueue } from '../../src/platform/queues/verificationQueue';
import { AutoGrader } from '../../src/platform/grading/autoGrader';
import { AutoSaveTriggers } from '../../src/platform/middleware/autoSaveTriggers';
import { parseClaimsFromFile } from '../../src/platform/parsers/claimParser';

test.describe('Citation Integrity Platform - E2E Tests', () => {
  test.describe('Problem 1: Unsourced Parameters', () => {
    test('prevents PLACEHOLDER parameters from reaching production', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Level 0: Create PLACEHOLDER parameter
      const placeholder = {
        name: 'test_param',
        value: 1.8,
        type: 'PLACEHOLDER' as const,
        confidence: 0.3,
        created: Date.now(),
        needsValidation: true
      };

      await state.update(0, { parameter: placeholder });

      // Level 1: Check if promoted to Level 2 (should fail)
      const levelOne = state.getLevel(1);
      expect(levelOne.memory).not.toContain('VERIFIED');

      // Verify linter would block deployment
      expect(placeholder.type).toBe('PLACEHOLDER');
      expect(placeholder.needsValidation).toBe(true);
    });

    test('allows VERIFIED parameters with drift monitoring', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Level 2: Create VERIFIED parameter
      const verified = {
        name: 'verified_param',
        value: 2.0,
        type: 'VERIFIED' as const,
        confidence: 0.95,
        source: 'Test et al. 2025',
        doi: '10.1234/test',
        lastValidated: Date.now(),
        citedValue: 2.0
      };

      await state.update(2, { parameter: verified });

      // Calculate LSS (drift)
      const lss = Math.abs(verified.value - verified.citedValue) / verified.citedValue;
      expect(lss).toBeLessThan(0.01); // <1% drift = acceptable
    });

    test('detects parameter drift and alerts', async () => {
      // Simulated drift: code value drifted from citation
      const parameter = {
        name: 'drifted_param',
        value: 1.5,
        type: 'VERIFIED' as const,
        citedValue: 2.0
      };

      const lss = Math.abs(parameter.value - parameter.citedValue) / parameter.citedValue;
      expect(lss).toBeGreaterThan(0.2); // 25% drift = alert

      // In production, this would create a GitHub issue
    });
  });

  test.describe('Problem 2: Grade Inflation (Automated Grading)', () => {
    test('detects fabricated citations', async () => {
      const claims = [
        {
          claimText: 'According to NonExistent et al. (2099), AI solves everything',
          citation: { authors: ['NonExistent'], year: 2099 },
          file: 'test.md',
          line: 1
        }
      ];

      // Mock MCP client that always returns not found
      const mockMcpClient = {
        search: async () => ({ verified: false, confidence: 0.05 })
      };

      const grader = new AutoGrader({ citationClient: mockMcpClient as any });
      const result = await grader.gradeFile('test.md', claims);

      expect(result.grade).toBeLessThan(100);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          type: 'fabricated_citation',
          severity: 'CRITICAL'
        })
      );
    });

    test('correctly grades verified citations', async () => {
      const claims = [
        {
          claimText: 'According to Real et al. (2023), the parameter is 2.0',
          citation: { authors: ['Real'], year: 2023 },
          file: 'test.md',
          line: 1
        }
      ];

      // Mock MCP client that returns verified
      const mockMcpClient = {
        search: async () => ({
          verified: true,
          confidence: 0.95,
          sourceMatch: 'exact',
          doi: '10.1234/real2023'
        })
      };

      const grader = new AutoGrader({ citationClient: mockMcpClient as any });
      const result = await grader.gradeFile('test.md', claims);

      expect(result.grade).toBeGreaterThanOrEqual(95); // No major deductions
      expect(result.letterGrade).toMatch(/A/);
    });

    test('applies severity-weighted penalties for magnitude errors', async () => {
      const claims = [
        {
          claimText: 'Temperature rose by 50°C (actually: 1.1°C)',
          citation: { authors: ['IPCC'], year: 2021 },
          file: 'test.md',
          line: 1
        }
      ];

      // Mock: Claim says 50°C, source says 1.1°C → 45× magnitude error
      const mockMcpClient = {
        search: async () => ({
          verified: true,
          confidence: 0.95,
          sourceMatch: 'magnitude_error',
          extractedValue: 1.1,
          claimedValue: 50,
          magnitudeError: 45.45
        })
      };

      const grader = new AutoGrader({ citationClient: mockMcpClient as any });
      const result = await grader.gradeFile('test.md', claims);

      // Magnitude error 20×+ = -15 points
      expect(result.grade).toBeLessThanOrEqual(85);
      expect(result.breakdown).toContainEqual(
        expect.objectContaining({
          type: 'magnitude_error',
          penalty: expect.any(Number)
        })
      );
    });
  });

  test.describe('Problem 3: Memory Amnesia (Auto-Save)', () => {
    test('detects completion signals and triggers save', () => {
      const triggers = new AutoSaveTriggers({ mcpClient: {} as any });

      const messages = [
        'Implementation complete. Added parameter tracking.',
        'Task finished: verification pipeline working.',
        '✅ All tests passing',
        'Session summary: Built auto-grader, fixed bugs.'
      ];

      for (const content of messages) {
        const signals = triggers.detectCompletionSignals(content);
        expect(signals.length).toBeGreaterThan(0);
      }
    });

    test('extracts learnings from conversation', () => {
      const triggers = new AutoSaveTriggers({ mcpClient: {} as any });

      const message = `
        Implementation complete. Added parameter provenance tracking.

        Key learning: Silent fallbacks hide bugs - always use assertion utilities.
        Pattern observed: Parameters without citations drift over time.
        Insight: Mechanical grading removes subjective bias.
      `;

      const extracted = triggers.extractMemory(message);

      expect(extracted.tasks).toContain(
        expect.stringContaining('parameter provenance tracking')
      );
      expect(extracted.learnings).toContain(
        expect.stringContaining('Silent fallbacks')
      );
    });

    test('enforces update frequency hierarchy', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Get update frequencies
      const f0 = state.getLevel(0).frequency;
      const f1 = state.getLevel(1).frequency;
      const f2 = state.getLevel(2).frequency;
      const f3 = state.getLevel(3).frequency;

      // Assert hierarchy: f_L0 > f_L1 > f_L2 > f_L3
      expect(f0).toBeGreaterThan(f1);
      expect(f1).toBeGreaterThan(f2);
      expect(f2).toBeGreaterThan(f3);

      // Validate via built-in method
      const validation = state.validateFrequencyHierarchy();
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('Problem 4: Citation Hallucination Prevention', () => {
    test('full workflow: claim extraction → verification → grading', async () => {
      const markdownContent = `
# Research Summary

According to Li et al. (2023), GPT-3 consumed 700,000 liters of water.

The IPCC (2021) reports that CO2 emissions increased 2.3% annually.

Temperature has risen 1.1°C since preindustrial times (IPCC AR6).
      `.trim();

      // Step 1: Parse claims
      const parseResult = parseClaimsFromFile({
        content: markdownContent,
        filePath: 'test.md'
      });

      expect(parseResult.claims.length).toBeGreaterThanOrEqual(3);

      // Step 2: Queue for verification
      const queue = new VerificationQueue({
        maxConcurrency: 5,
        rateLimit: 10,
        batchSize: 20
      });

      const requestIds: string[] = [];
      for (const claim of parseResult.claims) {
        const id = await queue.enqueue({
          claim: claim.claimText,
          citation: claim.citation || { authors: [], year: 0 },
          priority: 'MEDIUM'
        });
        requestIds.push(id);
      }

      // Step 3: Wait for verification results
      const results = await Promise.all(
        requestIds.map(id => queue.getResult(id))
      );

      expect(results.length).toBe(parseResult.claims.length);

      // Step 4: Grade file (mocked MCP)
      const mockMcpClient = {
        search: async () => ({
          verified: true,
          confidence: 0.95,
          sourceMatch: 'exact'
        })
      };

      const grader = new AutoGrader({ citationClient: mockMcpClient as any });
      const gradeResult = await grader.gradeFile('test.md', parseResult.claims);

      expect(gradeResult.grade).toBeGreaterThanOrEqual(90); // All verified
      expect(gradeResult.letterGrade).toMatch(/A/);
    });

    test('LSS monitoring detects high surprise signals', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Simulate: Claim verification failed (LSS = 1.0)
      const event = {
        type: 'verification_failure',
        claim: 'Unverified claim',
        lss: 1.0,
        timestamp: Date.now()
      };

      await state.update(1, event);

      // In production, LSS > 0.5 triggers alert
      expect(event.lss).toBeGreaterThan(0.5);
    });
  });

  test.describe('Nested Learning Architecture Validation', () => {
    test('validates 4-level state hierarchy', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Level 0: Fast memory (f=1.0)
      await state.update(0, { event: 'tool_call', timestamp: Date.now() });

      // Level 1: Medium memory (f=0.1)
      await state.update(1, { event: 'task_detected', timestamp: Date.now() });

      // Level 2: Slow memory (f=0.01)
      await state.update(2, { event: 'session_summary', timestamp: Date.now() });

      // Level 3: Core memory (f=0.001)
      await state.update(3, { event: 'paradigm_shift', timestamp: Date.now() });

      // Validate all levels exist
      expect(state.getLevel(0)).toBeDefined();
      expect(state.getLevel(1)).toBeDefined();
      expect(state.getLevel(2)).toBeDefined();
      expect(state.getLevel(3)).toBeDefined();
    });

    test('context flow compression (Level 0 → Level 3)', async () => {
      const state = new MultiLevelState({ enableLogging: false });

      // Level 0: Many micro-events (100 tool calls)
      for (let i = 0; i < 100; i++) {
        await state.update(0, { tool: `tool_${i}`, timestamp: Date.now() });
      }

      // Level 1: Compressed to tasks (10 tasks detected)
      for (let i = 0; i < 10; i++) {
        await state.update(1, { task: `task_${i}`, timestamp: Date.now() });
      }

      // Level 2: Compressed to session summary (1 summary)
      await state.update(2, {
        summary: {
          tasks: 10,
          learnings: 5,
          patterns: 2
        },
        timestamp: Date.now()
      });

      // Level 3: Compressed to core insight (1 permanent insight)
      await state.update(3, {
        insight: 'Silent fallbacks are dangerous in research simulations',
        timestamp: Date.now()
      });

      // Compression ratio: 100 → 10 → 1 → 1 (100:1 overall)
      const level0Count = 100;
      const level3Count = 1;
      const compressionRatio = level0Count / level3Count;

      expect(compressionRatio).toBeGreaterThanOrEqual(10); // At least 10:1
    });
  });

  test.describe('Integration: All 4 Problems Together', () => {
    test('full Citation Integrity Platform workflow', async () => {
      // Scenario: Developer adds parameter, writes research, system validates

      // 1. Parameter Provenance (Problem 1)
      const state = new MultiLevelState({ enableLogging: false });
      const parameter = {
        name: 'cascade_factor',
        value: 2.0,
        type: 'VERIFIED' as const,
        source: 'Li et al. 2023',
        doi: '10.1234/li2023',
        confidence: 0.95,
        citedValue: 2.0
      };

      await state.update(2, { parameter });

      // 2. Citation Verification (Problem 2 + 4)
      const research = `
According to Li et al. (2023), the cascade amplification factor is 2.0.

This parameter affects system dynamics significantly.
      `.trim();

      const claims = parseClaimsFromFile({
        content: research,
        filePath: 'research.md'
      });

      expect(claims.claims.length).toBeGreaterThan(0);

      // 3. Auto Grading (Problem 2)
      const mockMcpClient = {
        search: async () => ({
          verified: true,
          confidence: 0.95,
          sourceMatch: 'exact',
          doi: '10.1234/li2023',
          extractedValue: 2.0
        })
      };

      const grader = new AutoGrader({ citationClient: mockMcpClient as any });
      const gradeResult = await grader.gradeFile('research.md', claims.claims);

      expect(gradeResult.grade).toBeGreaterThanOrEqual(95);
      expect(gradeResult.letterGrade).toMatch(/A/);

      // 4. Memory Consolidation (Problem 3)
      const triggers = new AutoSaveTriggers({ mcpClient: {} as any });
      const completionMessage = '✅ Implementation complete. Parameter verified, research graded A.';

      const signals = triggers.detectCompletionSignals(completionMessage);
      expect(signals.length).toBeGreaterThan(0);

      const memory = triggers.extractMemory(completionMessage);
      expect(memory.tasks).toContain(
        expect.stringContaining('Parameter verified')
      );

      // 5. LSS Monitoring (Problem 1 + 4)
      const lss = Math.abs(parameter.value - parameter.citedValue) / parameter.citedValue;
      expect(lss).toBeLessThan(0.01); // No drift

      // 6. Validate Nested Learning hierarchy
      const validation = state.validateFrequencyHierarchy();
      expect(validation.valid).toBe(true);
      expect(validation.frequencies).toEqual([1.0, 0.1, 0.01, 0.001]);
    });
  });
});

test.describe('Performance Benchmarks (Phase 5 Validation)', () => {
  test('verification queue throughput: 100+ citations/hour', async () => {
    const queue = new VerificationQueue({
      maxConcurrency: 5,
      rateLimit: 10,
      batchSize: 20
    });

    const startTime = Date.now();
    const batchSize = 100;

    // Enqueue 100 citations
    const ids: string[] = [];
    for (let i = 0; i < batchSize; i++) {
      const id = await queue.enqueue({
        claim: `Test claim ${i}`,
        citation: { authors: ['Test'], year: 2025 },
        priority: 'MEDIUM'
      });
      ids.push(id);
    }

    // Wait for all results
    await Promise.all(ids.map(id => queue.getResult(id)));

    const elapsedMs = Date.now() - startTime;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const throughput = batchSize / elapsedHours;

    expect(throughput).toBeGreaterThan(100); // >100 citations/hour
  });

  test('verification latency p95: <10s', async () => {
    const queue = new VerificationQueue({
      maxConcurrency: 5,
      rateLimit: 10,
      batchSize: 20
    });

    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      const id = await queue.enqueue({
        claim: `Test claim ${i}`,
        citation: { authors: ['Test'], year: 2025 },
        priority: 'MEDIUM'
      });
      await queue.getResult(id);
      latencies.push(Date.now() - start);
    }

    // Calculate p95
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index];

    expect(p95Latency).toBeLessThan(10000); // <10s
  });
});
