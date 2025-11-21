/**
 * MARCUS 3.0 Citation Agent Integration Layer
 *
 * TypeScript platform for orchestrating Python citation integrity agents.
 *
 * Components:
 * - PythonAgentWrapper: Process management and IPC
 * - AgentStateManager: PostgreSQL + Redis state synchronization with versioning
 * - CitationAgentOrchestrator: Multi-agent coordination and consensus
 * - MetricsCollector: Prometheus metrics integration
 *
 * Architecture Pattern:
 * TypeScript Platform → Python Agents → PostgreSQL/Redis
 *
 * KEY FIX (H2): Version-based conflict resolution for concurrent state updates
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-17
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Pool as PostgresPool, PoolClient, QueryResult } from 'pg';
import Redis from 'ioredis';
import { Counter, Histogram, Gauge, register as promRegister } from 'prom-client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { agentStatus as agentStatusMetric, agentRequestDuration, citationAnalysisCounter, citationAnalysisDuration } from '../monitoring/metricsEndpoint';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CitationDocument {
  text: string;
  claimedSource: string;
  actualSource?: string;
  metadata?: Record<string, any>;
}

export interface CitationAnalysisResult {
  integrityScore: number;
  behaviorUsed: string;
  confidence: number;
  detectedViolations: string[];
  metadata: Record<string, any>;
  agentId: string;
  agentReputation: number;
}

export interface AgentState {
  agentId: string;
  reputation: number;
  totalCitations: number;
  detectedViolations: number;
  currentBehavior: string;
  memoryState: Record<string, any>;
  explorationRate: number;
  timestamp: string;
  version: number;  // KEY: Version for optimistic locking
}

export interface AgentStatus {
  agentId: string;
  reputation: number;
  totalCitations: number;
  detectedViolations: number;
  violationRate: number;
  currentBehavior: string;
  explorationRate: number;
  memorySize: {
    immediate: number;
    shortterm: number;
    longtermStats: number;
    behaviorReputations: number;
  };
  isHealthy: boolean;
  timestamp: string;
}

export interface AggregatedAnalysis {
  meanIntegrity: number;
  consensus: number;
  numAgents: number;
  behaviorDistribution: Record<string, number>;
  recommendations: string[];
  individualResults: CitationAnalysisResult[];
  latencyMs: number;
  timestamp: string;
}

export interface PlatformConfig {
  // Agent configuration
  numAgents: number;
  agentScriptPath: string;
  agentTimeout: number;
  maxRestarts: number;

  // Database configuration
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    poolSize: number;
  };

  // Redis configuration
  redis: {
    host: string;
    port: number;
    db: number;
    ttl: number;
  };

  // Performance tuning
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    cacheTTL: number;
  };

  // Monitoring
  monitoring: {
    metricsPort: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    healthCheckInterval: number;
  };
}

// ============================================================================
// Python Agent Wrapper
// ============================================================================

export class PythonAgentWrapper extends EventEmitter {
  private process?: ChildProcess;
  private messageBuffer: string = '';
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
    retryCount: number;
    maxRetries: number;
    method: string;
    params: any;
  }> = new Map();
  private restartCount: number = 0;
  private isHealthy: boolean = false;
  private lastHealthCheck: Date | null = null;
  private requestQueue: Array<{ method: string; params: any; resolve: Function; reject: Function }> = [];

  constructor(
    public readonly agentId: string,
    private readonly scriptPath: string,
    private readonly maxRestarts: number = 3,
    private readonly timeout: number = 30000
  ) {
    super();
  }

  async start(): Promise<void> {
    if (this.process) {
      throw new Error(`Agent ${this.agentId} already started`);
    }

    // Verify script exists
    try {
      await fs.access(this.scriptPath);
    } catch (err) {
      throw new Error(`Agent script not found: ${this.scriptPath}`);
    }

    // Spawn Python process
    this.process = spawn('python3', [this.scriptPath, this.agentId], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        AGENT_ID: this.agentId
      }
    });

    if (!this.process.stdout || !this.process.stdin || !this.process.stderr) {
      throw new Error(`Failed to initialize stdio for agent ${this.agentId}`);
    }

    // Set up IPC
    this.setupIPC();
    this.setupHealthMonitor();

    this.emit('started', { agentId: this.agentId });
    console.log(`✅ Agent ${this.agentId} started (PID: ${this.process.pid})`);

    // Process queued requests
    this.processQueuedRequests();
  }

  /**
   * Process requests that were queued while agent was unavailable
   */
  private processQueuedRequests(): void {
    if (this.requestQueue.length === 0) {
      return;
    }

    console.log(`📬 Processing ${this.requestQueue.length} queued requests for agent ${this.agentId}`);

    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const { method, params, resolve, reject } of queue) {
      this.invokeInternal(method, params, 0, 3)
        .then(resolve)
        .catch(reject);
    }
  }

  private setupIPC(): void {
    if (!this.process || !this.process.stdout || !this.process.stderr) {
      throw new Error('Process not initialized');
    }

    // Handle stdout (JSON messages)
    this.process.stdout.on('data', (data: Buffer) => {
      this.messageBuffer += data.toString();
      this.processMessages();
    });

    // Handle stderr (logging)
    this.process.stderr.on('data', (data: Buffer) => {
      console.error(`[Agent ${this.agentId} stderr]:`, data.toString());
    });

    // Handle process exit
    this.process.on('exit', (code, signal) => {
      console.warn(`⚠️ Agent ${this.agentId} exited (code: ${code}, signal: ${signal})`);
      this.isHealthy = false;

      // Reject pending requests
      for (const [requestId, pending] of this.pendingRequests.entries()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(`Agent process exited (code: ${code})`));
      }
      this.pendingRequests.clear();

      // Attempt restart if not at limit
      if (this.restartCount < this.maxRestarts) {
        this.restartCount++;
        console.log(`🔄 Restarting agent ${this.agentId} (attempt ${this.restartCount}/${this.maxRestarts})`);
        this.process = undefined;
        this.start().catch(err => {
          console.error(`❌ Failed to restart agent ${this.agentId}:`, err);
          this.emit('error', err);
        });
      } else {
        this.emit('failed', { agentId: this.agentId, restarts: this.restartCount });
      }
    });

    // Handle process errors
    this.process.on('error', (err: Error) => {
      console.error(`❌ Agent ${this.agentId} process error:`, err);
      this.isHealthy = false;
      this.emit('error', err);
    });
  }

  private processMessages(): void {
    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message = JSON.parse(line);
        this.handleMessage(message);
      } catch (err) {
        console.error(`Failed to parse message from agent ${this.agentId}:`, line);
      }
    }
  }

  private handleMessage(message: any): void {
    const { type, requestId, data, error } = message;

    if (type === 'response') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(requestId);

        if (error) {
          // Check if we should retry
          if (pending.retryCount < pending.maxRetries && this.shouldRetryError(error)) {
            console.warn(`⚠️ Agent ${this.agentId} request ${requestId} failed, retrying (${pending.retryCount + 1}/${pending.maxRetries})...`);
            this.retryRequest(pending.method, pending.params, pending.resolve, pending.reject, pending.retryCount + 1, pending.maxRetries);
          } else {
            pending.reject(new Error(error));
          }
        } else {
          pending.resolve(data);
        }
      }
    } else if (type === 'event') {
      this.emit('agent_event', { agentId: this.agentId, ...data });
    } else if (type === 'health') {
      this.isHealthy = data.healthy;
      this.lastHealthCheck = new Date();
    } else if (type === 'ack') {
      // Acknowledgment received - request was received by agent
      console.log(`✅ Agent ${this.agentId} acknowledged request ${requestId}`);
    }
  }

  /**
   * Determine if an error is retryable
   */
  private shouldRetryError(error: string): boolean {
    const retryableErrors = [
      'timeout',
      'connection',
      'unavailable',
      'busy',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND'
    ];
    return retryableErrors.some(retryable => error.toLowerCase().includes(retryable.toLowerCase()));
  }

  async invoke(method: string, params: any, maxRetries: number = 3): Promise<any> {
    return this.invokeInternal(method, params, 0, maxRetries);
  }

  private async invokeInternal(method: string, params: any, retryCount: number, maxRetries: number): Promise<any> {
    // If agent is not healthy, queue request for later
    if (!this.process || !this.process.stdin) {
      if (retryCount < maxRetries) {
        console.warn(`⚠️ Agent ${this.agentId} not available, queueing request for retry...`);
        return new Promise((resolve, reject) => {
          this.requestQueue.push({ method, params, resolve, reject });
        });
      } else {
        throw new Error(`Agent ${this.agentId} not started after ${maxRetries} retries`);
      }
    }

    const requestId = `${this.agentId}_${Date.now()}_${Math.random()}`;

    return new Promise((resolve, reject) => {
      // Calculate timeout with exponential backoff for retries
      const backoffMultiplier = Math.pow(2, retryCount);
      const effectiveTimeout = this.timeout * backoffMultiplier;

      // Set timeout
      const timeoutHandle = setTimeout(() => {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          this.pendingRequests.delete(requestId);

          // Retry on timeout if retries available
          if (retryCount < maxRetries) {
            console.warn(`⚠️ Agent ${this.agentId} request ${requestId} timed out, retrying (${retryCount + 1}/${maxRetries})...`);
            this.retryRequest(method, params, resolve, reject, retryCount + 1, maxRetries);
          } else {
            reject(new Error(`Agent ${this.agentId} request timeout after ${maxRetries} retries (${effectiveTimeout}ms)`));
          }
        }
      }, effectiveTimeout);

      // Store pending request with retry metadata
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout: timeoutHandle,
        retryCount,
        maxRetries,
        method,
        params
      });

      // Send request
      const request = JSON.stringify({
        type: 'request',
        requestId,
        method,
        params
      }) + '\n';

      this.process!.stdin!.write(request, (err) => {
        if (err) {
          clearTimeout(timeoutHandle);
          const pending = this.pendingRequests.get(requestId);
          if (pending) {
            this.pendingRequests.delete(requestId);

            // Retry on write error if retries available
            if (retryCount < maxRetries) {
              console.warn(`⚠️ Agent ${this.agentId} stdin write failed, retrying (${retryCount + 1}/${maxRetries})...`);
              this.retryRequest(method, params, resolve, reject, retryCount + 1, maxRetries);
            } else {
              reject(new Error(`Failed to write to agent stdin after ${maxRetries} retries: ${err.message}`));
            }
          }
        }
      });
    });
  }

  /**
   * Retry a request with exponential backoff
   */
  private async retryRequest(
    method: string,
    params: any,
    resolve: Function,
    reject: Function,
    retryCount: number,
    maxRetries: number
  ): Promise<void> {
    // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
    const backoffDelay = 100 * Math.pow(2, retryCount - 1);

    setTimeout(async () => {
      try {
        const result = await this.invokeInternal(method, params, retryCount, maxRetries);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, backoffDelay);
  }

  async analyzeCitation(document: CitationDocument): Promise<CitationAnalysisResult> {
    return this.invoke('analyze_citation', { document });
  }

  async getStatus(): Promise<AgentStatus> {
    return this.invoke('get_status', {});
  }

  private setupHealthMonitor(): void {
    setInterval(async () => {
      try {
        const status = await this.getStatus();
        this.isHealthy = status.isHealthy;
      } catch (err) {
        console.error(`❌ Health check failed for agent ${this.agentId}:`, err);
        this.isHealthy = false;
      }
    }, 10000);
  }

  async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    // Clear pending requests
    for (const [requestId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Agent stopped'));
    }
    this.pendingRequests.clear();

    // Graceful shutdown
    this.process.kill('SIGTERM');

    // Force kill after 5s
    setTimeout(() => {
      if (this.process && !this.process.killed) {
        console.warn(`⚠️ Force killing agent ${this.agentId}`);
        this.process.kill('SIGKILL');
      }
    }, 5000);

    console.log(`🛑 Agent ${this.agentId} stopped`);
  }

  getHealthStatus(): boolean {
    return this.isHealthy;
  }
}

// ============================================================================
// Agent State Manager (with H2 fix: versioning)
// ============================================================================

export class AgentStateManager {
  private db: PostgresPool;
  private cache: Redis;

  constructor(
    dbConfig: PlatformConfig['database'],
    redisConfig: PlatformConfig['redis']
  ) {
    // PostgreSQL connection pool
    this.db = new PostgresPool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      max: dbConfig.poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Redis client
    this.cache = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
    });

    console.log('✅ AgentStateManager initialized');
  }

  /**
   * Save agent state with optimistic locking.
   *
   * KEY FIX (H2): Uses version field to detect concurrent updates.
   * If version mismatch detected, throws error instead of silently overwriting.
   *
   * @param state Agent state to save
   * @throws Error if version conflict detected
   */
  async saveState(state: AgentState): Promise<void> {
    const startTime = Date.now();

    // Generate new version
    const newVersion = Date.now();

    try {
      // Write-through cache pattern
      const cacheKey = `agent:${state.agentId}:state`;
      const stateWithVersion = { ...state, version: newVersion };

      await this.cache.setex(
        cacheKey,
        3600, // 1 hour TTL
        JSON.stringify(stateWithVersion)
      );

      // Persist to database with version check
      const result = await this.db.query<{ affected: number }>(`
        INSERT INTO agent_states (
          agent_id, reputation, total_citations, detected_violations,
          current_behavior, memory_state, exploration_rate, timestamp, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (agent_id) DO UPDATE SET
          reputation = EXCLUDED.reputation,
          total_citations = EXCLUDED.total_citations,
          detected_violations = EXCLUDED.detected_violations,
          current_behavior = EXCLUDED.current_behavior,
          memory_state = EXCLUDED.memory_state,
          exploration_rate = EXCLUDED.exploration_rate,
          timestamp = EXCLUDED.timestamp,
          version = EXCLUDED.version
        WHERE agent_states.version < EXCLUDED.version
        RETURNING version
      `, [
        state.agentId,
        state.reputation,
        state.totalCitations,
        state.detectedViolations,
        state.currentBehavior,
        JSON.stringify(state.memoryState),
        state.explorationRate,
        state.timestamp,
        newVersion
      ]);

      // Check if update succeeded (version conflict detection)
      if (result.rowCount === 0) {
        throw new Error(
          `❌ CRITICAL: Version conflict for agent ${state.agentId}. ` +
          `Concurrent update detected. Expected version ${state.version}, ` +
          `but database has newer version. State NOT saved.`
        );
      }

      const latency = Date.now() - startTime;
      console.log(`✅ Agent ${state.agentId} state saved (version: ${newVersion}, latency: ${latency}ms)`);

    } catch (err) {
      console.error(`❌ Failed to save state for agent ${state.agentId}:`, err);
      throw err;
    }
  }

  /**
   * Load agent state with cache-aside pattern.
   *
   * @param agentId Agent to load
   * @returns Agent state or null if not found
   */
  async loadState(agentId: string): Promise<AgentState | null> {
    try {
      // Try cache first
      const cacheKey = `agent:${agentId}:state`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        console.log(`📦 Agent ${agentId} state loaded from cache`);
        return JSON.parse(cached);
      }

      // Fall back to database
      const result = await this.db.query<AgentState>(`
        SELECT
          agent_id as "agentId",
          reputation,
          total_citations as "totalCitations",
          detected_violations as "detectedViolations",
          current_behavior as "currentBehavior",
          memory_state as "memoryState",
          exploration_rate as "explorationRate",
          timestamp,
          version
        FROM agent_states
        WHERE agent_id = $1
        ORDER BY timestamp DESC
        LIMIT 1
      `, [agentId]);

      if (result.rows.length === 0) {
        return null;
      }

      const state = result.rows[0];

      // Populate cache for next time
      await this.cache.setex(cacheKey, 3600, JSON.stringify(state));

      console.log(`💾 Agent ${agentId} state loaded from database (version: ${state.version})`);
      return state;

    } catch (err) {
      console.error(`❌ Failed to load state for agent ${agentId}:`, err);
      throw err;
    }
  }

  /**
   * Get current version for an agent (for optimistic locking).
   *
   * @param agentId Agent to query
   * @returns Current version number or 0 if not found
   */
  async getCurrentVersion(agentId: string): Promise<number> {
    try {
      const result = await this.db.query<{ version: number }>(`
        SELECT version FROM agent_states WHERE agent_id = $1
      `, [agentId]);

      return result.rows.length > 0 ? result.rows[0].version : 0;
    } catch (err) {
      console.error(`❌ Failed to get version for agent ${agentId}:`, err);
      throw err;
    }
  }

  /**
   * Save analysis result to database.
   *
   * @param analysis Aggregated analysis to persist
   */
  async saveAnalysis(analysis: AggregatedAnalysis): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO citation_analyses (
          source, mean_integrity, consensus, behavior_distribution,
          recommendations, num_agents, latency_ms, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'platform',  // Source identifier
        analysis.meanIntegrity,
        analysis.consensus,
        JSON.stringify(analysis.behaviorDistribution),
        JSON.stringify(analysis.recommendations),
        analysis.numAgents,
        analysis.latencyMs,
        analysis.timestamp
      ]);

      console.log(`✅ Analysis saved (${analysis.numAgents} agents, consensus: ${analysis.consensus.toFixed(2)})`);
    } catch (err) {
      console.error('❌ Failed to save analysis:', err);
      throw err;
    }
  }

  async cleanup(): Promise<void> {
    await this.db.end();
    await this.cache.quit();
    console.log('✅ AgentStateManager cleanup complete');
  }
}

// ============================================================================
// Metrics Collector
// ============================================================================

export class MetricsCollector {
  private accuracyGauge = new Gauge({
    name: 'citation_accuracy_total',
    help: 'Current citation analysis accuracy'
  });

  private latencyHistogram = new Histogram({
    name: 'citation_latency_ms',
    help: 'Citation analysis latency in milliseconds',
    buckets: [10, 25, 50, 75, 100, 250, 500, 1000, 2500, 5000]
  });

  private throughputGauge = new Gauge({
    name: 'citation_throughput',
    help: 'Citations processed per second'
  });

  private consensusGauge = new Gauge({
    name: 'citation_consensus',
    help: 'Agent consensus level (0-1)'
  });

  private agentFailuresCounter = new Counter({
    name: 'citation_agent_failures_total',
    help: 'Total number of agent failures',
    labelNames: ['agent_id']
  });

  recordLatency(ms: number): void {
    this.latencyHistogram.observe(ms);
  }

  recordAccuracy(accuracy: number): void {
    this.accuracyGauge.set(accuracy);
  }

  recordThroughput(cps: number): void {
    this.throughputGauge.set(cps);
  }

  recordConsensus(consensus: number): void {
    this.consensusGauge.set(consensus);
  }

  recordAgentFailure(agentId: string): void {
    this.agentFailuresCounter.inc({ agent_id: agentId });
  }

  getMetrics(): string {
    return promRegister.metrics();
  }
}

// ============================================================================
// Citation Agent Orchestrator
// ============================================================================

export class CitationAgentOrchestrator {
  private agents: Map<string, PythonAgentWrapper> = new Map();
  private stateManager: AgentStateManager;
  private metricsCollector: MetricsCollector;
  private isRunning: boolean = false;

  constructor(
    private config: PlatformConfig,
    stateManager: AgentStateManager,
    metricsCollector: MetricsCollector
  ) {
    this.stateManager = stateManager;
    this.metricsCollector = metricsCollector;
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing orchestrator with ${this.config.numAgents} agents...`);

    // Spawn agents
    for (let i = 0; i < this.config.numAgents; i++) {
      const agentId = `agent_${String(i).padStart(3, '0')}`;
      const agent = new PythonAgentWrapper(
        agentId,
        this.config.agentScriptPath,
        this.config.maxRestarts,
        this.config.agentTimeout
      );

      // Set up event handlers
      agent.on('error', (err) => {
        console.error(`❌ Agent ${agentId} error:`, err);
        this.metricsCollector.recordAgentFailure(agentId);
      });

      agent.on('failed', () => {
        console.error(`❌ Agent ${agentId} failed permanently`);
        this.agents.delete(agentId);
      });

      await agent.start();
      this.agents.set(agentId, agent);
    }

    this.isRunning = true;
    console.log(`✅ Orchestrator initialized with ${this.agents.size} agents`);
  }

  /**
   * Analyze document using multi-agent consensus.
   *
   * Distributes work to all healthy agents and aggregates results.
   *
   * @param document Document to analyze
   * @returns Aggregated analysis with consensus metrics
   */
  async analyzeDocument(document: CitationDocument): Promise<AggregatedAnalysis> {
    if (!this.isRunning) {
      throw new Error('Orchestrator not initialized');
    }

    const startTime = Date.now();

    // Distribute to all agents (with error handling)
    const agentPromises = Array.from(this.agents.values()).map(agent =>
      agent.analyzeCitation(document).catch(err => {
        console.error(`Agent ${agent.agentId} failed:`, err);
        this.metricsCollector.recordAgentFailure(agent.agentId);
        return null;
      })
    );

    // Wait for all agents (with timeout)
    const results = await Promise.race([
      Promise.all(agentPromises),
      this.timeout(this.config.performance.requestTimeout)
    ]) as (CitationAnalysisResult | null)[];

    // Filter failed agents
    const validResults = results.filter(r => r !== null) as CitationAnalysisResult[];

    if (validResults.length === 0) {
      throw new Error('❌ CRITICAL: No agents available - platform unhealthy');
    }

    if (validResults.length < this.agents.size * 0.5) {
      console.warn(`⚠️ Less than 50% of agents responded (${validResults.length}/${this.agents.size})`);
    }

    // Calculate consensus
    const consensus = this.calculateConsensus(validResults);
    const aggregated = this.aggregateResults(validResults, consensus);

    // Add metadata
    const latency = Date.now() - startTime;
    aggregated.latencyMs = latency;
    aggregated.timestamp = new Date().toISOString();

    // Track metrics
    this.metricsCollector.recordLatency(latency);
    this.metricsCollector.recordConsensus(consensus);

    // Update Prometheus metrics for citation analysis
    for (const result of validResults) {
      citationAnalysisCounter.inc({
        agent_id: result.agentId || 'unknown',
        result: 'success'
      });
      citationAnalysisDuration.observe({
        agent_id: result.agentId || 'unknown'
      }, latency / 1000); // Convert to seconds
    }

    // Persist results
    await this.stateManager.saveAnalysis(aggregated);

    return aggregated;
  }

  /**
   * Calculate consensus using variance of integrity scores.
   *
   * High consensus = low variance (agents agree)
   * Low consensus = high variance (agents disagree)
   *
   * @param results Individual agent results
   * @returns Consensus score in [0, 1]
   */
  private calculateConsensus(results: CitationAnalysisResult[]): number {
    if (results.length === 0) {
      return 0;
    }

    const scores = results.map(r => r.integrityScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // High consensus = low standard deviation
    // Map stdDev to [0, 1] range (assume max stdDev ~ 0.5)
    const consensus = Math.max(0, 1 - (stdDev / 0.5));

    return consensus;
  }

  /**
   * Aggregate individual results using reputation weighting.
   *
   * @param results Individual agent results
   * @param consensus Consensus score
   * @returns Aggregated analysis
   */
  private aggregateResults(
    results: CitationAnalysisResult[],
    consensus: number
  ): AggregatedAnalysis {
    // Weighted average by agent reputation
    const totalReputation = results.reduce((sum, r) => sum + r.agentReputation, 0);

    if (totalReputation === 0) {
      throw new Error('❌ CRITICAL: Total agent reputation is zero');
    }

    const weightedIntegrity = results.reduce(
      (sum, r) => sum + (r.integrityScore * r.agentReputation),
      0
    ) / totalReputation;

    // Behavior distribution
    const behaviorCounts: Record<string, number> = {};
    for (const result of results) {
      behaviorCounts[result.behaviorUsed] = (behaviorCounts[result.behaviorUsed] || 0) + 1;
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, consensus);

    return {
      meanIntegrity: weightedIntegrity,
      consensus,
      numAgents: results.length,
      behaviorDistribution: behaviorCounts,
      recommendations,
      individualResults: results,
      latencyMs: 0,  // Set by caller
      timestamp: ''   // Set by caller
    };
  }

  /**
   * Generate recommendations based on analysis.
   *
   * @param results Individual results
   * @param consensus Consensus level
   * @returns Array of recommendation strings
   */
  private generateRecommendations(
    results: CitationAnalysisResult[],
    consensus: number
  ): string[] {
    const recommendations: string[] = [];

    // Check consensus
    if (consensus < 0.5) {
      recommendations.push('⚠️ Low consensus - agents disagree on integrity assessment');
    }

    // Check integrity
    const meanIntegrity = results.reduce((sum, r) => sum + r.integrityScore, 0) / results.length;
    if (meanIntegrity < 0.5) {
      recommendations.push('🚨 Low integrity score - citation may be fabricated or inaccurate');
    }

    // Check violations
    const totalViolations = results.reduce((sum, r) => sum + r.detectedViolations.length, 0);
    if (totalViolations > results.length) {
      recommendations.push(`❌ Multiple violations detected (${totalViolations} across ${results.length} agents)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Citation appears valid - high integrity and consensus');
    }

    return recommendations;
  }

  private timeout<T>(ms: number, message: string = 'Operation timeout'): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  async getAgentCount(): Promise<number> {
    return this.agents.size;
  }

  async getHealthyAgentCount(): Promise<number> {
    let healthyCount = 0;
    for (const agent of this.agents.values()) {
      if (agent.getHealthStatus()) {
        healthyCount++;
      }
    }
    return healthyCount;
  }

  async setNumAgents(numAgents: number): Promise<void> {
    console.log(`🔧 Adjusting agent count from ${this.agents.size} to ${numAgents}...`);

    const currentCount = this.agents.size;

    if (numAgents > currentCount) {
      // Add agents
      for (let i = currentCount; i < numAgents; i++) {
        const agentId = `agent_${String(i).padStart(3, '0')}`;
        const agent = new PythonAgentWrapper(
          agentId,
          this.config.agentScriptPath,
          this.config.maxRestarts,
          this.config.agentTimeout
        );

        await agent.start();
        this.agents.set(agentId, agent);
      }
    } else if (numAgents < currentCount) {
      // Remove agents
      const agentIds = Array.from(this.agents.keys());
      for (let i = numAgents; i < currentCount; i++) {
        const agentId = agentIds[i];
        const agent = this.agents.get(agentId);
        if (agent) {
          await agent.stop();
          this.agents.delete(agentId);
        }
      }
    }

    console.log(`✅ Agent count adjusted to ${this.agents.size}`);
  }

  /**
   * Alias for analyzeDocument() - maintains API compatibility with server.
   *
   * @param document Document to analyze
   * @returns Aggregated analysis with consensus metrics
   */
  async analyzeCitation(document: CitationDocument): Promise<AggregatedAnalysis> {
    return this.analyzeDocument(document);
  }

  /**
   * Get status of all agents.
   *
   * @returns Array of agent statuses with health and reputation metrics
   */
  async getAgentStatuses(): Promise<AgentStatus[]> {
    const statuses: AgentStatus[] = [];

    for (const agent of this.agents.values()) {
      try {
        const status = await agent.getStatus();
        statuses.push(status);

        // Update Prometheus agent status metric (1 = healthy, 0 = unhealthy)
        agentStatusMetric.set({ agent_id: agent.agentId }, status.isHealthy ? 1 : 0);
      } catch (err) {
        console.error(`Failed to get status for agent ${agent.agentId}:`, err);

        // Update Prometheus agent status metric (0 = unhealthy/failed)
        agentStatusMetric.set({ agent_id: agent.agentId }, 0);

        // Include unhealthy status even if query fails
        statuses.push({
          agentId: agent.agentId,
          reputation: 0,
          totalCitations: 0,
          detectedViolations: 0,
          violationRate: 0,
          currentBehavior: 'unknown',
          explorationRate: 0,
          memorySize: {
            immediate: 0,
            shortterm: 0,
            longtermStats: 0,
            behaviorReputations: 0
          },
          isHealthy: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    return statuses;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down orchestrator...');

    this.isRunning = false;

    // Stop all agents
    const stopPromises = Array.from(this.agents.values()).map(agent => agent.stop());
    await Promise.all(stopPromises);

    this.agents.clear();

    console.log('✅ Orchestrator shutdown complete');
  }
}

// ============================================================================
// Main Platform Class
// ============================================================================

export class CitationIntegrityPlatform {
  private orchestrator?: CitationAgentOrchestrator;
  private stateManager?: AgentStateManager;
  private metricsCollector: MetricsCollector;

  constructor(private config: PlatformConfig) {
    this.metricsCollector = new MetricsCollector();
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Citation Integrity Platform...');

    // Initialize state manager
    this.stateManager = new AgentStateManager(
      this.config.database,
      this.config.redis
    );

    // Initialize orchestrator
    this.orchestrator = new CitationAgentOrchestrator(
      this.config,
      this.stateManager,
      this.metricsCollector
    );

    await this.orchestrator.initialize();

    console.log('✅ Platform started successfully');
  }

  async analyzeDocument(document: CitationDocument): Promise<AggregatedAnalysis> {
    if (!this.orchestrator) {
      throw new Error('Platform not started');
    }

    return this.orchestrator.analyzeDocument(document);
  }

  async getMetrics(): Promise<string> {
    return this.metricsCollector.getMetrics();
  }

  async getHealth(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    agents: { total: number; healthy: number };
    timestamp: string;
  }> {
    if (!this.orchestrator) {
      return {
        status: 'error',
        agents: { total: 0, healthy: 0 },
        timestamp: new Date().toISOString()
      };
    }

    const total = await this.orchestrator.getAgentCount();
    const healthy = await this.orchestrator.getHealthyAgentCount();

    const status = healthy === 0 ? 'error' : (healthy < total * 0.5 ? 'degraded' : 'ok');

    return {
      status,
      agents: { total, healthy },
      timestamp: new Date().toISOString()
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down platform...');

    if (this.orchestrator) {
      await this.orchestrator.shutdown();
    }

    if (this.stateManager) {
      await this.stateManager.cleanup();
    }

    console.log('✅ Platform shutdown complete');
  }
}

// ============================================================================
// Example Usage
// ============================================================================

async function main() {
  const config: PlatformConfig = {
    numAgents: 5,
    agentScriptPath: path.join(__dirname, '../agents/citation_integrity_agent.py'),
    agentTimeout: 30000,
    maxRestarts: 3,

    database: {
      host: 'localhost',
      port: 5432,
      database: 'citations',
      user: 'postgres',
      password: 'password',
      poolSize: 10
    },

    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
      ttl: 3600
    },

    performance: {
      maxConcurrentRequests: 100,
      requestTimeout: 5000,
      cacheTTL: 3600
    },

    monitoring: {
      metricsPort: 9090,
      logLevel: 'info',
      healthCheckInterval: 10000
    }
  };

  const platform = new CitationIntegrityPlatform(config);

  try {
    await platform.start();

    const document: CitationDocument = {
      text: 'According to Smith et al. (2024), AI alignment is critical.',
      claimedSource: 'Smith et al. 2024'
    };

    const result = await platform.analyzeDocument(document);

    console.log('\nAnalysis Result:');
    console.log(`Mean Integrity: ${result.meanIntegrity.toFixed(2)}`);
    console.log(`Consensus: ${result.consensus.toFixed(2)}`);
    console.log(`Agents: ${result.numAgents}`);
    console.log(`Latency: ${result.latencyMs}ms`);
    console.log('Recommendations:', result.recommendations);

    await platform.shutdown();
  } catch (err) {
    console.error('Platform error:', err);
    await platform.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
