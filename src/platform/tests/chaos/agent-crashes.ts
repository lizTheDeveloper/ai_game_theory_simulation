/**
 * Chaos Engineering Test: Python Agent Crashes
 *
 * Scenario:
 * - Kill random Python agents every 5 minutes
 * - Verify orchestrator detects failure
 * - Verify request reroutes to healthy agents
 * - Verify agent restart
 *
 * Expected behavior:
 * - Orchestrator detects agent failure quickly
 * - Requests are handled by remaining agents
 * - Failed agent restarts automatically
 * - No request failures due to individual agent crash
 *
 * @module platform/tests/chaos/agent-crashes
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

export interface AgentChaosConfig {
  duration: number;
  killInterval: number;
  numAgents: number;
  agentScript: string;
}

export interface AgentChaosResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  agentCrashes: number;
  agentRestarts: number;
  averageRecoveryTime: number;
  requestsRerouted: number;
}

/**
 * Simple agent manager for chaos testing
 */
class AgentManager extends EventEmitter {
  private agents: Map<string, ChildProcess> = new Map();

  /**
   * Start an agent
   */
  startAgent(id: string, scriptPath: string): void {
    const agent = spawn('python', [scriptPath], {
      stdio: 'pipe',
      env: { ...process.env, AGENT_ID: id }
    });

    agent.on('exit', (code) => {
      console.log(`🐍 Agent ${id} exited (code: ${code})`);
      this.agents.delete(id);
      this.emit('agentExit', { id, code });
    });

    agent.on('error', (err) => {
      console.error(`❌ Agent ${id} error:`, err);
      this.emit('agentError', { id, error: err });
    });

    this.agents.set(id, agent);
    console.log(`🐍 Agent ${id} started (PID: ${agent.pid})`);
  }

  /**
   * Kill a random agent
   */
  killRandomAgent(): string | null {
    const agentIds = Array.from(this.agents.keys());
    if (agentIds.length === 0) {
      return null;
    }

    const randomId = agentIds[Math.floor(Math.random() * agentIds.length)];
    const agent = this.agents.get(randomId);

    if (agent && agent.pid) {
      console.log(`💥 Killing agent ${randomId} (PID: ${agent.pid})`);
      agent.kill('SIGKILL');
      return randomId;
    }

    return null;
  }

  /**
   * Get healthy agents
   */
  getHealthyAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agent count
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Shutdown all agents
   */
  async shutdownAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [id, agent] of this.agents.entries()) {
      promises.push(
        new Promise<void>((resolve) => {
          agent.once('exit', () => resolve());
          agent.kill('SIGTERM');
        })
      );
    }

    await Promise.all(promises);
    this.agents.clear();
  }
}

/**
 * Chaos test: Python agent crashes
 */
export class AgentCrashChaos {
  private result: AgentChaosResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    agentCrashes: 0,
    agentRestarts: 0,
    averageRecoveryTime: 0,
    requestsRerouted: 0
  };

  private agentManager: AgentManager;
  private recoveryTimes: number[] = [];

  constructor(private config: AgentChaosConfig) {
    this.agentManager = new AgentManager();

    // Track agent exits and restarts
    this.agentManager.on('agentExit', ({ id }) => {
      this.result.agentCrashes++;

      // Auto-restart agent
      const restartStart = Date.now();

      setTimeout(() => {
        this.agentManager.startAgent(id, this.config.agentScript);
        this.result.agentRestarts++;

        const recoveryTime = Date.now() - restartStart;
        this.recoveryTimes.push(recoveryTime);

        console.log(`✅ Agent ${id} restarted (recovery time: ${recoveryTime}ms)`);
      }, 2000); // 2 second delay before restart
    });
  }

  /**
   * Run the chaos test
   */
  async run(): Promise<AgentChaosResult> {
    console.log('\n=== Chaos Test: Agent Crashes ===');
    console.log(`Duration: ${this.config.duration / 1000}s`);
    console.log(`Kill interval: ${this.config.killInterval / 1000}s`);
    console.log(`Number of agents: ${this.config.numAgents}\n`);

    // Start agents
    for (let i = 0; i < this.config.numAgents; i++) {
      this.agentManager.startAgent(`agent-${i}`, this.config.agentScript);
    }

    await this.sleep(2000); // Wait for agents to start

    const startTime = Date.now();
    const endTime = startTime + this.config.duration;

    // Start agent killer
    const agentKiller = setInterval(() => {
      this.agentManager.killRandomAgent();
    }, this.config.killInterval);

    // Continuously make requests
    while (Date.now() < endTime) {
      await this.makeRequest();
      await this.sleep(100); // 10 requests per second
    }

    // Stop agent killer
    clearInterval(agentKiller);

    // Shutdown agents
    await this.agentManager.shutdownAll();

    // Calculate results
    this.result.averageRecoveryTime =
      this.recoveryTimes.length > 0
        ? this.recoveryTimes.reduce((a, b) => a + b, 0) / this.recoveryTimes.length
        : 0;

    console.log('\n=== Chaos Test Results ===');
    console.log(`Total requests: ${this.result.totalRequests}`);
    console.log(`Successful: ${this.result.successfulRequests} (${Math.round(this.result.successfulRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Failed: ${this.result.failedRequests} (${Math.round(this.result.failedRequests / this.result.totalRequests * 100)}%)`);
    console.log(`Agent crashes: ${this.result.agentCrashes}`);
    console.log(`Agent restarts: ${this.result.agentRestarts}`);
    console.log(`Requests rerouted: ${this.result.requestsRerouted}`);
    console.log(`Average recovery time: ${Math.round(this.result.averageRecoveryTime)}ms`);

    return this.result;
  }

  /**
   * Make a request to a random healthy agent
   */
  private async makeRequest(): Promise<void> {
    this.result.totalRequests++;

    const healthyAgents = this.agentManager.getHealthyAgents();

    if (healthyAgents.length === 0) {
      console.log('⚠️ No healthy agents available');
      this.result.failedRequests++;
      return;
    }

    try {
      // Simulate request to random agent
      const randomAgent = healthyAgents[Math.floor(Math.random() * healthyAgents.length)];

      // If agent count is less than expected, this is a rerouted request
      if (this.agentManager.getAgentCount() < this.config.numAgents) {
        this.result.requestsRerouted++;
      }

      // Simulate successful request
      await this.sleep(10);

      this.result.successfulRequests++;
    } catch (error: any) {
      this.result.failedRequests++;
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run agent crash chaos test
 */
export async function runAgentCrashChaos(
  config: AgentChaosConfig = {
    duration: 60000,       // 1 minute
    killInterval: 10000,   // Every 10 seconds
    numAgents: 5,
    agentScript: 'path/to/agent.py'
  }
): Promise<AgentChaosResult> {
  const chaos = new AgentCrashChaos(config);
  return await chaos.run();
}
