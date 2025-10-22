/**
 * Async Logging Queue
 *
 * Fixes critical performance bug: console.log blocks execution for 600-900ms
 * when called in hot paths during simulation.
 *
 * Solution: Buffer log messages and flush asynchronously.
 */

interface LogMessage {
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  simulationMonth?: number; // Optional: track simulation time
}

interface YearlyBatch {
  year: number; // Simulation year (month / 12)
  messages: LogMessage[];
  warnings: number;
  errors: number;
  info: number;
}

class AsyncLogger {
  private buffer: LogMessage[] = [];
  private maxBufferSize: number = 1000;
  private flushInterval: number = 5000; // 5 seconds
  private lastFlush: number = Date.now();
  private enabled: boolean = true;

  // Yearly batching configuration
  private batchByYear: boolean = false;
  private currentSimulationMonth: number = 0;
  private yearlyBatches: Map<number, YearlyBatch> = new Map();
  private batchInterval: number = 12; // Log every N simulation months (default: 12 = yearly)

  /**
   * Update current simulation month (call this each simulation step)
   */
  setSimulationMonth(month: number): void {
    const oldYear = Math.floor(this.currentSimulationMonth / this.batchInterval);
    const newYear = Math.floor(month / this.batchInterval);

    this.currentSimulationMonth = month;

    // If year changed and batching is enabled, flush previous year
    if (this.batchByYear && newYear > oldYear && oldYear > 0) {
      this.flushYearlySummary(oldYear);
    }
  }

  /**
   * Add message to buffer (non-blocking)
   */
  log(level: 'debug' | 'info' | 'warning' | 'error', message: string): void {
    if (!this.enabled) return;

    const logMessage: LogMessage = {
      timestamp: Date.now(),
      level,
      message,
      simulationMonth: this.currentSimulationMonth,
    };

    // If yearly batching is enabled, add to batch
    if (this.batchByYear) {
      this.addToYearlyBatch(logMessage);
      return; // Don't add to regular buffer
    }

    // Otherwise, use regular buffering
    this.buffer.push(logMessage);

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flushNow();
    }

    // Auto-flush if interval elapsed
    if (Date.now() - this.lastFlush > this.flushInterval) {
      this.flushNow();
    }
  }

  /**
   * Add message to yearly batch
   */
  private addToYearlyBatch(message: LogMessage): void {
    const year = Math.floor(this.currentSimulationMonth / this.batchInterval);

    if (!this.yearlyBatches.has(year)) {
      this.yearlyBatches.set(year, {
        year,
        messages: [],
        warnings: 0,
        errors: 0,
        info: 0,
      });
    }

    const batch = this.yearlyBatches.get(year)!;
    batch.messages.push(message);

    // Count by level
    if (message.level === 'warning') batch.warnings++;
    else if (message.level === 'error') batch.errors++;
    else if (message.level === 'info') batch.info++;
  }

  /**
   * Flush yearly summary to console
   */
  private flushYearlySummary(year: number): void {
    const batch = this.yearlyBatches.get(year);
    if (!batch || batch.messages.length === 0) return;

    // Output summary
    console.log(`\n╔═══════════════════════════════════════════════════════╗`);
    console.log(`║  Year ${year} Summary (Months ${year * this.batchInterval}-${(year + 1) * this.batchInterval - 1})`);
    console.log(`╚═══════════════════════════════════════════════════════╝`);
    console.log(`  Total events: ${batch.messages.length}`);
    console.log(`  Info: ${batch.info} | Warnings: ${batch.warnings} | Errors: ${batch.errors}`);

    // Show critical messages only (errors and warnings)
    const criticalMessages = batch.messages.filter(
      (m) => m.level === 'error' || m.level === 'warning'
    );

    if (criticalMessages.length > 0) {
      console.log(`\n  Critical Events:`);
      for (const msg of criticalMessages.slice(0, 10)) {
        // Limit to 10 most recent
        console.log(`    [${msg.level.toUpperCase()}] ${msg.message}`);
      }

      if (criticalMessages.length > 10) {
        console.log(`    ... and ${criticalMessages.length - 10} more`);
      }
    }

    console.log(''); // Empty line for spacing

    // Remove processed batch
    this.yearlyBatches.delete(year);
  }

  /**
   * Convenience methods
   */
  debug(message: string): void {
    this.log('debug', message);
  }

  info(message: string): void {
    this.log('info', message);
  }

  warning(message: string): void {
    this.log('warning', message);
  }

  error(message: string): void {
    this.log('error', message);
  }

  /**
   * Flush buffer to console (blocking, but called async)
   */
  flushNow(): void {
    if (this.buffer.length === 0) return;

    const messages = this.buffer.splice(0, this.buffer.length);
    this.lastFlush = Date.now();

    // Write all buffered messages at once
    for (const msg of messages) {
      const prefix = `[${msg.level.toUpperCase()}]`;
      console.log(`${prefix} ${msg.message}`);
    }
  }

  /**
   * Flush buffer asynchronously (non-blocking)
   */
  async flushAsync(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.flushNow();
        resolve();
      }, 0);
    });
  }

  /**
   * Get buffered messages without flushing
   */
  getBuffer(): LogMessage[] {
    return [...this.buffer];
  }

  /**
   * Clear buffer without logging
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Configure buffer size, flush interval, and yearly batching
   */
  configure(options: {
    maxBufferSize?: number;
    flushInterval?: number;
    batchByYear?: boolean;
    batchInterval?: number; // Simulation months per batch (default: 12)
  }): void {
    if (options.maxBufferSize !== undefined) {
      this.maxBufferSize = options.maxBufferSize;
    }
    if (options.flushInterval !== undefined) {
      this.flushInterval = options.flushInterval;
    }
    if (options.batchByYear !== undefined) {
      this.batchByYear = options.batchByYear;
    }
    if (options.batchInterval !== undefined) {
      this.batchInterval = options.batchInterval;
    }
  }

  /**
   * Flush all pending yearly batches (call at simulation end)
   */
  flushAllYearlySummaries(): void {
    const years = Array.from(this.yearlyBatches.keys()).sort((a, b) => a - b);
    for (const year of years) {
      this.flushYearlySummary(year);
    }
  }

  /**
   * Override global console methods to route through async logger
   * Call this to intercept ALL console.log/warn/error calls globally
   */
  interceptConsole(): void {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    // Store originals for restore
    (this as any)._originalConsole = {
      log: originalLog,
      warn: originalWarn,
      error: originalError,
    };

    // Override console.log -> logger.info
    console.log = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      this.info(message);
    };

    // Override console.warn -> logger.warning
    console.warn = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      this.warning(message);
    };

    // Override console.error -> logger.error
    console.error = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      this.error(message);
    };
  }

  /**
   * Restore original console methods
   */
  restoreConsole(): void {
    const original = (this as any)._originalConsole;
    if (original) {
      console.log = original.log;
      console.warn = original.warn;
      console.error = original.error;
    }
  }
}

/**
 * Global logger instance
 *
 * Basic usage:
 *   logger.info('Simulation started');
 *   logger.warning('Crisis detected');
 *   logger.error('Critical failure');
 *
 * For critical messages that must be logged immediately:
 *   logger.error('CRITICAL');
 *   await logger.flushAsync(); // or logger.flushNow() if blocking is OK
 *
 * Yearly batching mode (for long simulations):
 *   logger.configure({ batchByYear: true, batchInterval: 12 }); // 12 months = yearly
 *
 *   // Call each simulation step (PhaseOrchestrator does this automatically):
 *   logger.setSimulationMonth(state.currentMonth);
 *
 *   // Call at simulation end:
 *   logger.flushAllYearlySummaries();
 *
 * Global console interception (routes ALL console.log/warn/error through logger):
 *   logger.interceptConsole();
 *   // ... simulation runs (all console output goes through logger)
 *   logger.restoreConsole();
 *   // ... summary output (direct console.log, not batched)
 *
 * Yearly batching outputs summaries like:
 *   ╔═══════════════════════════════════════════════════════╗
 *   ║  Year 5 Summary (Months 60-71)
 *   ╚═══════════════════════════════════════════════════════╝
 *     Total events: 847
 *     Info: 632 | Warnings: 215 | Errors: 0
 *
 *     Critical Events:
 *       [WARNING] Climate threshold exceeded
 *       [WARNING] Social cohesion declining
 *       ... and 213 more
 */
export const logger = new AsyncLogger();

/**
 * Structured logging for early warning system
 * Groups related messages to reduce console.log calls
 */
export function logEarlyWarnings(warnings: {
  count: number;
  detectionQuality: number;
  details: Array<{
    level: string;
    boundary: string;
    currentLevel: number;
    monthsUntilCritical: number;
    inGoldenHour: boolean;
    autocorrelation: number;
    variance: number;
  }>;
}): void {
  if (warnings.count === 0) return;

  // Build complete message as single string
  const lines: string[] = [];
  lines.push(`\n⚠️  === EARLY WARNING SYSTEM - ${warnings.count} CRITICAL ALERTS ===`);
  lines.push(`   Detection quality: ${(warnings.detectionQuality * 100).toFixed(0)}%`);

  for (const warning of warnings.details) {
    lines.push(`   ${warning.level.toUpperCase()}: ${warning.boundary}`);
    lines.push(`      Level: ${warning.currentLevel.toFixed(2)} (threshold: 1.0)`);
    lines.push(`      Time to critical: ~${warning.monthsUntilCritical} months`);
    lines.push(`      ${warning.inGoldenHour ? '✅ GOLDEN HOUR - Intervention effective' : '⚠️  LATE - Intervention less effective'}`);
    lines.push(`      Critical slowing down: autocorr=${(warning.autocorrelation * 100).toFixed(0)}% variance=${(warning.variance * 100).toFixed(0)}%`);
  }
  lines.push('');

  // Single log call instead of 10+
  logger.warning(lines.join('\n'));
}

/**
 * Auto-flush on process exit (for Node.js)
 */
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    logger.flushNow();
  });
}
