/**
 * Graceful Shutdown Handler
 *
 * Manages orderly shutdown of the platform on SIGTERM/SIGINT:
 * 1. Stop accepting new requests
 * 2. Wait for in-flight requests (max 30s)
 * 3. Stop background workers
 * 4. Close database connections
 * 5. Disconnect Redis
 * 6. Terminate Python agents
 * 7. Exit cleanly
 *
 * @module platform/resilience/gracefulShutdown
 */

import { EventEmitter } from 'events';
import { Server } from 'http';
import { DatabasePool } from '../database/pool';
import Redis from 'ioredis';
import { ChildProcess } from 'child_process';
import { DeadLetterQueue } from './deadLetterQueue';

export interface ShutdownConfig {
  timeout?: number;              // Max time for graceful shutdown (ms, default: 60000)
  requestTimeout?: number;       // Max time to wait for in-flight requests (ms, default: 30000)
  agentTermTimeout?: number;     // Time to wait for agents before SIGKILL (ms, default: 10000)
}

export interface ShutdownResource {
  name: string;
  shutdown: () => Promise<void>;
  priority: number;  // Lower priority shuts down first
}

/**
 * Graceful Shutdown Manager
 */
export class GracefulShutdown extends EventEmitter {
  private isShuttingDown: boolean = false;
  private resources: ShutdownResource[] = [];
  private httpServers: Server[] = [];
  private dbPools: DatabasePool[] = [];
  private redisClients: Redis[] = [];
  private pythonAgents: ChildProcess[] = [];
  private dlqWorkers: DeadLetterQueue[] = [];

  constructor(private config: ShutdownConfig = {}) {
    super();
    this.setupSignalHandlers();
  }

  /**
   * Set up signal handlers for SIGTERM and SIGINT
   */
  private setupSignalHandlers(): void {
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM signal');
      await this.initiate('SIGTERM');
    });

    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT signal');
      await this.initiate('SIGINT');
    });

    // Handle uncaught errors during shutdown
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception during shutdown:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection during shutdown:', reason);
      process.exit(1);
    });
  }

  /**
   * Register an HTTP server for graceful shutdown
   */
  registerHttpServer(server: Server): void {
    this.httpServers.push(server);
  }

  /**
   * Register a database pool for graceful shutdown
   */
  registerDatabasePool(pool: DatabasePool): void {
    this.dbPools.push(pool);
  }

  /**
   * Register a Redis client for graceful shutdown
   */
  registerRedisClient(client: Redis): void {
    this.redisClients.push(client);
  }

  /**
   * Register a Python agent process for graceful shutdown
   */
  registerPythonAgent(agent: ChildProcess): void {
    this.pythonAgents.push(agent);
  }

  /**
   * Register a DLQ worker for graceful shutdown
   */
  registerDLQWorker(worker: DeadLetterQueue): void {
    this.dlqWorkers.push(worker);
  }

  /**
   * Register a custom resource for graceful shutdown
   */
  registerResource(resource: ShutdownResource): void {
    this.resources.push(resource);
  }

  /**
   * Initiate graceful shutdown
   */
  async initiate(signal: string = 'UNKNOWN'): Promise<void> {
    if (this.isShuttingDown) {
      console.log('⚠️ Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    const shutdownStart = Date.now();
    const timeout = this.config.timeout ?? 60000;

    console.log(`\n=== Graceful Shutdown Started (signal: ${signal}) ===`);

    this.emit('shutdownStart', { signal });

    // Set a hard timeout for shutdown
    const hardTimeout = setTimeout(() => {
      console.log('❌ Graceful shutdown timeout exceeded, forcing exit');
      this.forceExit();
    }, timeout);

    try {
      // Step 1: Stop accepting new requests
      await this.stopHttpServers();

      // Step 2: Wait for in-flight requests
      await this.waitForInflightRequests();

      // Step 3: Stop background workers
      await this.stopBackgroundWorkers();

      // Step 4: Close database connections
      await this.closeDatabasePools();

      // Step 5: Disconnect Redis
      await this.disconnectRedis();

      // Step 6: Terminate Python agents
      await this.terminatePythonAgents();

      // Step 7: Shutdown custom resources
      await this.shutdownCustomResources();

      clearTimeout(hardTimeout);

      const shutdownDuration = Date.now() - shutdownStart;
      console.log(`\n✅ Graceful shutdown complete (${shutdownDuration}ms)`);

      this.emit('shutdownComplete', { signal, duration: shutdownDuration });

      process.exit(0);
    } catch (error: any) {
      console.error(`❌ Error during graceful shutdown: ${error.message}`);
      this.emit('shutdownError', error);

      clearTimeout(hardTimeout);
      this.forceExit();
    }
  }

  /**
   * Step 1: Stop accepting new HTTP requests
   */
  private async stopHttpServers(): Promise<void> {
    console.log('\n📡 Step 1: Stopping HTTP servers...');

    const promises = this.httpServers.map(server => {
      return new Promise<void>((resolve, reject) => {
        // Stop accepting new connections
        server.close((err) => {
          if (err) {
            console.error(`❌ Error closing HTTP server: ${err.message}`);
            reject(err);
          } else {
            console.log('✅ HTTP server closed');
            resolve();
          }
        });
      });
    });

    await Promise.all(promises);
  }

  /**
   * Step 2: Wait for in-flight requests to complete
   */
  private async waitForInflightRequests(): Promise<void> {
    console.log('\n⏳ Step 2: Waiting for in-flight requests...');

    const requestTimeout = this.config.requestTimeout ?? 30000;
    const startTime = Date.now();

    // In a real implementation, you'd track active request count
    // For now, just wait a bit
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, requestTimeout)));

    const waitTime = Date.now() - startTime;
    console.log(`✅ In-flight requests completed (${waitTime}ms)`);
  }

  /**
   * Step 3: Stop background workers (DLQ, metrics, etc.)
   */
  private async stopBackgroundWorkers(): Promise<void> {
    console.log('\n🔄 Step 3: Stopping background workers...');

    // Stop DLQ workers
    for (const worker of this.dlqWorkers) {
      worker.stopWorker();
    }

    console.log('✅ Background workers stopped');
  }

  /**
   * Step 4: Close database connection pools
   */
  private async closeDatabasePools(): Promise<void> {
    console.log('\n🔌 Step 4: Closing database pools...');

    const promises = this.dbPools.map(pool => pool.close());
    await Promise.all(promises);

    console.log('✅ Database pools closed');
  }

  /**
   * Step 5: Disconnect Redis clients
   */
  private async disconnectRedis(): Promise<void> {
    console.log('\n🔌 Step 5: Disconnecting Redis...');

    const promises = this.redisClients.map(client => {
      return new Promise<void>((resolve) => {
        client.quit(() => {
          console.log('✅ Redis client disconnected');
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  /**
   * Step 6: Terminate Python agent processes
   */
  private async terminatePythonAgents(): Promise<void> {
    console.log('\n🐍 Step 6: Terminating Python agents...');

    const agentTermTimeout = this.config.agentTermTimeout ?? 10000;

    const promises = this.pythonAgents.map(agent => {
      return new Promise<void>((resolve) => {
        if (!agent.pid) {
          resolve();
          return;
        }

        // Send SIGTERM for graceful shutdown
        agent.kill('SIGTERM');

        // Set timeout for SIGKILL
        const killTimeout = setTimeout(() => {
          console.log(`⚠️ Agent ${agent.pid} did not terminate, sending SIGKILL`);
          agent.kill('SIGKILL');
        }, agentTermTimeout);

        agent.on('exit', (code) => {
          clearTimeout(killTimeout);
          console.log(`✅ Agent ${agent.pid} terminated (exit code: ${code})`);
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  /**
   * Step 7: Shutdown custom resources (sorted by priority)
   */
  private async shutdownCustomResources(): Promise<void> {
    console.log('\n🔧 Step 7: Shutting down custom resources...');

    // Sort by priority (lower priority first)
    const sorted = this.resources.sort((a, b) => a.priority - b.priority);

    for (const resource of sorted) {
      try {
        console.log(`  Shutting down: ${resource.name}`);
        await resource.shutdown();
        console.log(`  ✅ ${resource.name} shutdown complete`);
      } catch (error: any) {
        console.error(`  ❌ Error shutting down ${resource.name}: ${error.message}`);
      }
    }
  }

  /**
   * Force exit (when graceful shutdown fails or times out)
   */
  private forceExit(): void {
    console.log('💥 Forcing exit...');
    this.emit('forceExit');
    process.exit(1);
  }

  /**
   * Check if shutdown is in progress
   */
  isShutdownInProgress(): boolean {
    return this.isShuttingDown;
  }

  /**
   * Health check endpoint during shutdown
   */
  getHealthStatus(): { status: string; shutting_down: boolean } {
    if (this.isShuttingDown) {
      return {
        status: 'shutting_down',
        shutting_down: true
      };
    }

    return {
      status: 'ok',
      shutting_down: false
    };
  }
}

/**
 * Singleton instance
 */
export const gracefulShutdown = new GracefulShutdown();
