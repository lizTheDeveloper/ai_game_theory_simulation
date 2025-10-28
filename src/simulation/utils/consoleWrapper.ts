/**
 * Console Prefix Wrapper Utility
 *
 * Created: October 28, 2025
 * Purpose: Enable parallel Monte Carlo simulation with distinguishable logs
 *
 * Problem: When running simulations in parallel, console logs interleave
 * and become unreadable - impossible to tell which run is logging what.
 *
 * Solution: Prefix all console output with run number: [Run XXX/YYY]
 *
 * Usage:
 * ```typescript
 * const runPrefix = `[Run ${String(i + 1).padStart(3, ' ')}/${NUM_RUNS}] `;
 * const restoreConsole = wrapConsoleWithPrefix(runPrefix);
 *
 * try {
 *   // All console.log/warn/error calls now prefixed
 *   console.log('Starting simulation'); // → "[Run   1/100] Starting simulation"
 * } finally {
 *   restoreConsole(); // Always restore even if error
 * }
 * ```
 */

/**
 * Wrap console methods to add prefix to all output
 *
 * @param prefix - String to prepend to all console output (e.g., "[Run   1/100] ")
 * @returns Cleanup function that restores original console methods
 */
export function wrapConsoleWithPrefix(prefix: string): () => void {
  // Save original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Replace with prefixed versions
  console.log = (...args: unknown[]) => originalLog(`${prefix}`, ...args);
  console.warn = (...args: unknown[]) => originalWarn(`${prefix}`, ...args);
  console.error = (...args: unknown[]) => originalError(`${prefix}`, ...args);

  // Return cleanup function
  return () => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  };
}

/**
 * Log Buffer - Captures console output to memory instead of printing
 *
 * Usage:
 * ```typescript
 * const buffer = new LogBuffer("[Run 1/100] ");
 * buffer.install(); // Start capturing
 * console.log("test"); // Goes to buffer, not console
 * buffer.restore(); // Stop capturing
 * buffer.flush(); // Print all captured logs
 * ```
 */
export class LogBuffer {
  private logs: Array<{ type: 'log' | 'warn' | 'error'; args: unknown[] }> = [];
  private prefix: string;
  private originalLog?: typeof console.log;
  private originalWarn?: typeof console.warn;
  private originalError?: typeof console.error;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Install buffer - redirect console to memory
   */
  install(): void {
    // Save original console methods
    this.originalLog = console.log;
    this.originalWarn = console.warn;
    this.originalError = console.error;

    // Replace with buffering versions
    console.log = (...args: unknown[]) => {
      this.logs.push({ type: 'log', args });
    };
    console.warn = (...args: unknown[]) => {
      this.logs.push({ type: 'warn', args });
    };
    console.error = (...args: unknown[]) => {
      this.logs.push({ type: 'error', args });
    };
  }

  /**
   * Restore original console methods
   */
  restore(): void {
    if (this.originalLog) console.log = this.originalLog;
    if (this.originalWarn) console.warn = this.originalWarn;
    if (this.originalError) console.error = this.originalError;
  }

  /**
   * Print all buffered logs with prefix
   * Handles EPIPE errors gracefully (stream closed before flush)
   */
  flush(): void {
    const originalLog = this.originalLog || console.log;
    const originalWarn = this.originalWarn || console.warn;
    const originalError = this.originalError || console.error;

    for (const entry of this.logs) {
      try {
        switch (entry.type) {
          case 'log':
            originalLog(`${this.prefix}`, ...entry.args);
            break;
          case 'warn':
            originalWarn(`${this.prefix}`, ...entry.args);
            break;
          case 'error':
            originalError(`${this.prefix}`, ...entry.args);
            break;
        }
      } catch (err) {
        // Only catch Node.js system errors (have .code property)
        const nodeError = err as NodeJS.ErrnoException;

        if (nodeError.code === 'EPIPE') {
          // EPIPE = Broken pipe (expected when piping to head/tail that close early)
          // Write to stderr so we know it happened, but don't crash
          try {
            process.stderr.write(`\n[LogBuffer] Stream closed early (EPIPE) - ${this.logs.length - this.logs.indexOf(entry)} logs remaining\n`);
          } catch {
            // If stderr also has EPIPE, nothing we can do - silently stop
          }
          return; // Stop flushing remaining logs
        }

        // Re-throw ALL other errors - don't mask bugs!
        // This includes:
        // - Other write errors (ENOSPC, EROFS, EACCES, etc.)
        // - Formatting errors during stringification
        // - Any unexpected errors in console methods
        throw err;
      }
    }
  }

  /**
   * Get number of buffered log entries
   */
  get size(): number {
    return this.logs.length;
  }

  /**
   * Clear buffer without printing
   */
  clear(): void {
    this.logs = [];
  }
}
