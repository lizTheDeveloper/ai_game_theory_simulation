/**
 * Citation Verifier Subprocess Spawner
 *
 * Launches citation-verifier agent in isolated process for async verification.
 *
 * Features:
 * - Spawn citation-verifier agent subprocess
 * - Communicate via stdin/stdout JSON-RPC
 * - Process lifecycle management (start/stop/restart)
 * - Health checking and auto-restart on crash
 *
 * Usage:
 * ```typescript
 * const spawner = new CitationVerifierSpawner({
 *   command: 'npx',
 *   args: ['tsx', 'scripts/citationVerifier.ts'],
 *   autoRestart: true
 * });
 *
 * await spawner.start();
 *
 * const result = await spawner.verify(claim, citation);
 *
 * await spawner.stop();
 * ```
 *
 * Task: 2.1.3 (Phase 1 Week 2)
 */

import { spawn, ChildProcess } from 'child_process';
import { assertDefined } from '@/simulation/utils/assertions';
import { Citation, VerificationResult } from '../mcp/citationClient';

/**
 * Subprocess state
 */
export type SubprocessState = 'stopped' | 'starting' | 'running' | 'crashed';

/**
 * JSON-RPC request
 */
interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params: unknown;
}

/**
 * JSON-RPC response
 */
interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Spawner configuration
 */
export interface CitationVerifierConfig {
  /**
   * Command to execute
   * Default: 'npx'
   */
  command?: string;

  /**
   * Command arguments
   * Default: ['tsx', 'scripts/citationVerifier.ts']
   */
  args?: string[];

  /**
   * Working directory
   * Default: process.cwd()
   */
  cwd?: string;

  /**
   * Environment variables
   * Default: process.env
   */
  env?: Record<string, string>;

  /**
   * Auto-restart on crash
   * Default: true
   */
  autoRestart?: boolean;

  /**
   * Max restart attempts
   * Default: 3
   */
  maxRestarts?: number;

  /**
   * Restart delay (ms)
   * Default: 5000 (5 seconds)
   */
  restartDelay?: number;

  /**
   * Request timeout (ms)
   * Default: 30000 (30 seconds)
   */
  requestTimeout?: number;

  /**
   * Enable logging
   * Default: false
   */
  enableLogging?: boolean;
}

/**
 * Spawner statistics
 */
export interface SpawnerStats {
  state: SubprocessState;
  uptime: number;
  requestCount: number;
  errorCount: number;
  restartCount: number;
}

/**
 * Citation Verifier Subprocess Spawner
 *
 * Manages citation-verifier agent subprocess.
 */
export class CitationVerifierSpawner {
  private config: Required<CitationVerifierConfig>;
  private process?: ChildProcess;
  private state: SubprocessState;
  private startTime?: number;
  private requestCount: number;
  private errorCount: number;
  private restartCount: number;
  private pendingRequests: Map<
    string | number,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >;
  private nextRequestId: number;
  private outputBuffer: string;

  constructor(config?: CitationVerifierConfig) {
    this.config = {
      command: config?.command ?? 'npx',
      args: config?.args ?? ['tsx', 'scripts/citationVerifier.ts'],
      cwd: config?.cwd ?? process.cwd(),
      env: config?.env ?? (process.env as Record<string, string>),
      autoRestart: config?.autoRestart ?? true,
      maxRestarts: config?.maxRestarts ?? 3,
      restartDelay: config?.restartDelay ?? 5000,
      requestTimeout: config?.requestTimeout ?? 30000,
      enableLogging: config?.enableLogging ?? false,
    };

    this.state = 'stopped';
    this.requestCount = 0;
    this.errorCount = 0;
    this.restartCount = 0;
    this.pendingRequests = new Map();
    this.nextRequestId = 1;
    this.outputBuffer = '';
  }

  /**
   * Start subprocess
   *
   * @returns True if started successfully
   */
  public async start(): Promise<boolean> {
    if (this.state === 'running') {
      if (this.config.enableLogging) {
        console.warn('⚠️ CitationVerifierSpawner: Already running');
      }
      return true;
    }

    this.state = 'starting';

    try {
      // Spawn subprocess
      this.process = spawn(this.config.command, this.config.args, {
        cwd: this.config.cwd,
        env: this.config.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (!this.process.stdout || !this.process.stdin || !this.process.stderr) {
        throw new Error('Failed to create subprocess stdio streams');
      }

      // Set up event handlers
      this.setupEventHandlers();

      // Wait for ready signal
      await this.waitForReady();

      this.state = 'running';
      this.startTime = Date.now();

      if (this.config.enableLogging) {
        console.log('✅ CitationVerifierSpawner: Started');
      }

      return true;
    } catch (error) {
      this.state = 'crashed';
      this.errorCount++;

      if (this.config.enableLogging) {
        console.error(
          `❌ CitationVerifierSpawner: Start failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      // Auto-restart if enabled
      if (
        this.config.autoRestart &&
        this.restartCount < this.config.maxRestarts
      ) {
        this.scheduleRestart();
      }

      return false;
    }
  }

  /**
   * Stop subprocess
   */
  public async stop(): Promise<void> {
    if (this.state === 'stopped') {
      return;
    }

    // Reject all pending requests
    for (const [id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timeout);
      req.reject(new Error('Subprocess stopped'));
      this.pendingRequests.delete(id);
    }

    // Kill process
    if (this.process) {
      this.process.kill('SIGTERM');

      // Wait for graceful shutdown
      await this.sleep(1000);

      // Force kill if still running
      if (this.process.exitCode === null) {
        this.process.kill('SIGKILL');
      }

      this.process = undefined;
    }

    this.state = 'stopped';
    this.startTime = undefined;

    if (this.config.enableLogging) {
      console.log('⏹️  CitationVerifierSpawner: Stopped');
    }
  }

  /**
   * Verify citation using subprocess
   *
   * @param claim - Claim text
   * @param citation - Citation metadata
   * @returns Verification result
   */
  public async verify(
    claim: string,
    citation: Citation
  ): Promise<VerificationResult> {
    assertDefined(claim, {
      location: 'CitationVerifierSpawner.verify',
      valueName: 'claim',
    });

    assertDefined(citation, {
      location: 'CitationVerifierSpawner.verify',
      valueName: 'citation',
    });

    if (this.state !== 'running') {
      throw new Error('Subprocess not running');
    }

    this.requestCount++;

    try {
      // Send JSON-RPC request
      const result = await this.sendRequest('verify', { claim, citation });

      return result as VerificationResult;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Send JSON-RPC request to subprocess
   *
   * @param method - RPC method
   * @param params - RPC params
   * @returns Response result
   */
  private async sendRequest(
    method: string,
    params: unknown
  ): Promise<unknown> {
    if (!this.process || !this.process.stdin) {
      throw new Error('Subprocess not available');
    }

    const id = this.nextRequestId++;

    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    // Create promise for response
    const responsePromise = new Promise((resolve, reject) => {
      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout (${this.config.requestTimeout}ms)`));
      }, this.config.requestTimeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });
    });

    // Send request
    const requestStr = JSON.stringify(request) + '\n';
    this.process.stdin.write(requestStr);

    if (this.config.enableLogging) {
      console.log(`📤 CitationVerifierSpawner: Sent request ${id}`);
    }

    return responsePromise;
  }

  /**
   * Set up subprocess event handlers
   */
  private setupEventHandlers(): void {
    if (!this.process) {
      return;
    }

    // Handle stdout (responses)
    if (this.process.stdout) {
      this.process.stdout.on('data', (data: Buffer) => {
        this.handleOutput(data.toString());
      });
    }

    // Handle stderr (logs)
    if (this.process.stderr) {
      this.process.stderr.on('data', (data: Buffer) => {
        if (this.config.enableLogging) {
          console.error(`[subprocess stderr] ${data.toString()}`);
        }
      });
    }

    // Handle process exit
    this.process.on('exit', (code, signal) => {
      if (this.config.enableLogging) {
        console.warn(
          `⚠️ CitationVerifierSpawner: Process exited (code=${code}, signal=${signal})`
        );
      }

      this.state = 'crashed';

      // Auto-restart if enabled
      if (
        this.config.autoRestart &&
        this.restartCount < this.config.maxRestarts
      ) {
        this.scheduleRestart();
      }
    });

    // Handle process errors
    this.process.on('error', (error) => {
      this.errorCount++;

      if (this.config.enableLogging) {
        console.error(
          `❌ CitationVerifierSpawner: Process error: ${error.message}`
        );
      }

      this.state = 'crashed';
    });
  }

  /**
   * Handle subprocess output
   *
   * @param data - Output data
   */
  private handleOutput(data: string): void {
    this.outputBuffer += data;

    // Process complete lines
    const lines = this.outputBuffer.split('\n');
    this.outputBuffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      try {
        const response: JSONRPCResponse = JSON.parse(line);

        if (this.config.enableLogging) {
          console.log(`📥 CitationVerifierSpawner: Received response ${response.id}`);
        }

        // Find pending request
        const pending = this.pendingRequests.get(response.id);
        if (!pending) {
          if (this.config.enableLogging) {
            console.warn(
              `⚠️ CitationVerifierSpawner: Unknown response ID ${response.id}`
            );
          }
          continue;
        }

        // Clear timeout
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(response.id);

        // Resolve/reject based on response
        if (response.error) {
          pending.reject(
            new Error(response.error.message || 'RPC error')
          );
        } else {
          pending.resolve(response.result);
        }
      } catch (error) {
        if (this.config.enableLogging) {
          console.error(
            `❌ CitationVerifierSpawner: Failed to parse response: ${line}`
          );
        }
      }
    }
  }

  /**
   * Wait for subprocess ready signal
   */
  private async waitForReady(): Promise<void> {
    // TODO: Implement proper ready detection
    // For now, just wait a bit
    await this.sleep(1000);
  }

  /**
   * Schedule subprocess restart
   */
  private scheduleRestart(): void {
    this.restartCount++;

    if (this.config.enableLogging) {
      console.log(
        `🔄 CitationVerifierSpawner: Scheduling restart (${this.restartCount}/${this.config.maxRestarts}) in ${this.config.restartDelay}ms`
      );
    }

    setTimeout(() => {
      this.start();
    }, this.config.restartDelay);
  }

  /**
   * Get spawner statistics
   *
   * @returns Stats object
   */
  public getStats(): SpawnerStats {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;

    return {
      state: this.state,
      uptime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      restartCount: this.restartCount,
    };
  }

  /**
   * Get subprocess state
   *
   * @returns Current state
   */
  public getState(): SubprocessState {
    return this.state;
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create citation verifier spawner
 *
 * @param config - Spawner configuration
 * @returns CitationVerifierSpawner instance
 */
export function createCitationVerifierSpawner(
  config?: CitationVerifierConfig
): CitationVerifierSpawner {
  return new CitationVerifierSpawner(config);
}
