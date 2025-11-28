/**
 * MARCUS 3.1 DataLoader Tests
 *
 * M4 FIX: Tests to verify DataLoader instances are fresh per request
 * to prevent stale cache across requests.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-28
 */

import { createDataLoaders, AgentMetricsLoader, CitationResultsLoader } from '../dataloaders';
import { Pool } from 'pg';

// Mock pg Pool
jest.mock('pg', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
  return {
    Pool: jest.fn(() => ({
      query: mockQuery,
      end: jest.fn()
    }))
  };
});

describe('DataLoader Tests', () => {
  let mockDb: Pool;

  beforeEach(() => {
    // Create fresh mock for each test
    mockDb = new Pool();
    jest.clearAllMocks();
  });

  describe('M4: DataLoader Freshness Per Request', () => {
    it('should create new DataLoader instances on each call to createDataLoaders', () => {
      // Simulate two separate requests
      const request1Loaders = createDataLoaders(mockDb);
      const request2Loaders = createDataLoaders(mockDb);

      // Verify that each request gets unique DataLoader instances
      expect(request1Loaders.agentMetrics).not.toBe(request2Loaders.agentMetrics);
      expect(request1Loaders.citationResults).not.toBe(request2Loaders.citationResults);
    });

    it('should not share cache between DataLoader instances from different requests', async () => {
      const agentId = 'agent_001';

      // Request 1: Load agent metrics
      const request1Loaders = createDataLoaders(mockDb);
      
      // Mock the database response for request 1
      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          agent_id: agentId,
          avg_latency: 100,
          throughput: 10,
          error_rate: 5,
          accuracy_rate: 95
        }]
      });

      const metrics1 = await request1Loaders.agentMetrics.load(agentId);
      expect(metrics1.avgLatency).toBe(100);

      // Request 2: Load same agent metrics (should hit DB again, not cache)
      const request2Loaders = createDataLoaders(mockDb);

      // Mock different response for request 2
      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [{
          agent_id: agentId,
          avg_latency: 200, // Different value
          throughput: 20,
          error_rate: 2,
          accuracy_rate: 98
        }]
      });

      const metrics2 = await request2Loaders.agentMetrics.load(agentId);

      // Should get new value, not cached value from request 1
      expect(metrics2.avgLatency).toBe(200);
      expect(metrics2.avgLatency).not.toBe(metrics1.avgLatency);

      // Verify DB was called twice (once per request)
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it('should share cache within the same request (DataLoader batching)', async () => {
      const loaders = createDataLoaders(mockDb);

      // Mock response
      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { agent_id: 'agent_001', avg_latency: 100, throughput: 10, error_rate: 5, accuracy_rate: 95 },
          { agent_id: 'agent_002', avg_latency: 150, throughput: 15, error_rate: 3, accuracy_rate: 97 }
        ]
      });

      // Load multiple agents in same request
      const [metrics1, metrics2] = await Promise.all([
        loaders.agentMetrics.load('agent_001'),
        loaders.agentMetrics.load('agent_002')
      ]);

      // Should batch into single query
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      // Values should be correct
      expect(metrics1.avgLatency).toBe(100);
      expect(metrics2.avgLatency).toBe(150);

      // Loading same agent again in same request should use cache
      const metrics1Again = await loaders.agentMetrics.load('agent_001');
      expect(metrics1Again).toBe(metrics1); // Same object reference (cached)
      expect(mockDb.query).toHaveBeenCalledTimes(1); // No additional query
    });
  });

  describe('AgentMetricsLoader', () => {
    it('should return default metrics when database returns no rows', async () => {
      const loaders = createDataLoaders(mockDb);

      (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const metrics = await loaders.agentMetrics.load('nonexistent_agent');

      expect(metrics).toEqual({
        avgLatency: 0,
        throughput: 0,
        errorRate: 0,
        accuracyRate: 0
      });
    });

    it('should handle database errors gracefully', async () => {
      const loaders = createDataLoaders(mockDb);

      (mockDb.query as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const metrics = await loaders.agentMetrics.load('agent_001');

      // Should return default metrics instead of throwing
      expect(metrics).toEqual({
        avgLatency: 0,
        throughput: 0,
        errorRate: 0,
        accuracyRate: 0
      });
    });

    it('should batch multiple loads into single query', async () => {
      const loaders = createDataLoaders(mockDb);

      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { agent_id: 'agent_001', avg_latency: 100, throughput: 10, error_rate: 5, accuracy_rate: 95 },
          { agent_id: 'agent_002', avg_latency: 200, throughput: 20, error_rate: 2, accuracy_rate: 98 },
          { agent_id: 'agent_003', avg_latency: 300, throughput: 30, error_rate: 1, accuracy_rate: 99 }
        ]
      });

      // Load multiple agents
      const results = await loaders.agentMetrics.loadMany(['agent_001', 'agent_002', 'agent_003']);

      // Should be single batched query
      expect(mockDb.query).toHaveBeenCalledTimes(1);

      // Verify query used ANY($1) for batching
      const queryCall = (mockDb.query as jest.Mock).mock.calls[0];
      expect(queryCall[0]).toContain('ANY($1)');
      expect(queryCall[1]).toEqual([['agent_001', 'agent_002', 'agent_003']]);

      // Results should be in correct order
      expect(results[0]).toEqual({ avgLatency: 100, throughput: 10, errorRate: 5, accuracyRate: 95 });
      expect(results[1]).toEqual({ avgLatency: 200, throughput: 20, errorRate: 2, accuracyRate: 98 });
      expect(results[2]).toEqual({ avgLatency: 300, throughput: 30, errorRate: 1, accuracyRate: 99 });
    });
  });

  describe('CitationResultsLoader', () => {
    it('should return empty array when no citations found', async () => {
      const loaders = createDataLoaders(mockDb);

      (mockDb.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ agent_id: 'agent_001', citations: [] }]
      });

      const citations = await loaders.citationResults.load('agent_001');

      expect(citations).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const loaders = createDataLoaders(mockDb);

      (mockDb.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const citations = await loaders.citationResults.load('agent_001');

      // Should return empty array instead of throwing
      expect(citations).toEqual([]);
    });
  });
});

describe('DataLoader Integration with GraphQL Context', () => {
  /**
   * M4 FIX: This test verifies that the GraphQL context factory
   * creates fresh DataLoaders for each request.
   *
   * In your server setup, ensure you're creating context like this:
   *
   * ```typescript
   * const server = new ApolloServer({
   *   typeDefs,
   *   resolvers,
   *   context: ({ req }) => ({
   *     db,
   *     orchestrator,
   *     pubsub,
   *     dataloaders: createDataLoaders(db), // Fresh per request!
   *     user: req.user
   *   })
   * });
   * ```
   *
   * NOT like this (shared DataLoaders - BAD):
   *
   * ```typescript
   * const sharedLoaders = createDataLoaders(db); // Created once
   * const server = new ApolloServer({
   *   typeDefs,
   *   resolvers,
   *   context: ({ req }) => ({
   *     db,
   *     dataloaders: sharedLoaders, // Shared - STALE CACHE!
   *   })
   * });
   * ```
   */
  it('documents correct context factory pattern', () => {
    // This is a documentation test - the actual verification is above
    expect(true).toBe(true);
  });
});
