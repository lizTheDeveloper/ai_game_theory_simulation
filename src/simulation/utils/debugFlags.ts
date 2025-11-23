/**
 * Debug Flags System
 *
 * Centralized control for verbose logging in simulation hot paths.
 *
 * Performance Impact (Nov 20, 2025):
 * - 2,431 console.log statements found across simulation
 * - Step execution degraded from ~104ms to ~750ms (7x regression)
 * - Root cause: Excessive logging with string interpolation in hot paths
 *
 * Solution: Conditional logging based on environment variables
 * - Production: All debug logs disabled (fastest)
 * - Development: Enable specific subsystems as needed
 * - Testing: Enable critical logs only (extinctions, assertions)
 */

/**
 * Debug flags - set via environment variables
 *
 * Usage:
 *   DEBUG_SIMULATION=true npm run dev
 *   DEBUG_POPULATION=true DEBUG_PLANETARY=true npx tsx scripts/monteCarloSimulation.ts
 */
export const DEBUG_FLAGS = {
  /** Master switch - disables ALL debug logging if false */
  ENABLED: process.env.DEBUG_SIMULATION === 'true',

  /** Engine-level debug (loop iterations, step timing) */
  ENGINE: process.env.DEBUG_ENGINE === 'true',

  /** Population dynamics (births, deaths, carrying capacity) */
  POPULATION: process.env.DEBUG_POPULATION === 'true',

  /** Planetary boundaries (recovery, degradation) */
  PLANETARY: process.env.DEBUG_PLANETARY === 'true',

  /** AI agent actions and capabilities */
  AI_AGENTS: process.env.DEBUG_AI_AGENTS === 'true',

  /** Crisis detection and cascades */
  CRISES: process.env.DEBUG_CRISES === 'true',

  /** Technology deployment and effects */
  TECH: process.env.DEBUG_TECH === 'true',

  /** Mortality stabilizers (aid, adaptation, migration) */
  MORTALITY: process.env.DEBUG_MORTALITY === 'true',

  /** Nuclear command & control, radiation */
  NUCLEAR: process.env.DEBUG_NUCLEAR === 'true',

  /** Upward spirals and positive tipping points */
  SPIRALS: process.env.DEBUG_SPIRALS === 'true',

  /** Organization management and coordination */
  ORGS: process.env.DEBUG_ORGS === 'true',

  /** LLM-based AI alignment updates */
  LLM: process.env.DEBUG_LLM === 'true',

  /**
   * CRITICAL events (extinctions, end-game outcomes)
   * These are ALWAYS logged regardless of master switch
   */
  CRITICAL: true,
};

/**
 * Conditional log wrapper
 * Only logs if master switch AND specific flag are enabled
 *
 * @param flag Debug flag to check
 * @param message Log message (function to avoid eager evaluation)
 */
export function debugLog(flag: keyof typeof DEBUG_FLAGS, message: () => string): void {
  // Always log CRITICAL events
  if (flag === 'CRITICAL') {
    console.log(message());
    return;
  }

  // Check master switch first (fastest path)
  if (!DEBUG_FLAGS.ENABLED) return;

  // Check specific flag
  if (DEBUG_FLAGS[flag]) {
    console.log(message());
  }
}

/**
 * Batch logger - collects messages and logs once
 * Useful for loop-heavy operations (agents, regions, etc.)
 */
export class BatchLogger {
  private messages: string[] = [];
  private flag: keyof typeof DEBUG_FLAGS;

  constructor(flag: keyof typeof DEBUG_FLAGS) {
    this.flag = flag;
  }

  add(message: string): void {
    // Only collect if logging is enabled (avoid memory waste)
    if (this.flag === 'CRITICAL' || (DEBUG_FLAGS.ENABLED && DEBUG_FLAGS[this.flag])) {
      this.messages.push(message);
    }
  }

  flush(header?: string): void {
    if (this.messages.length === 0) return;

    if (header) {
      console.log(header);
    }

    for (const msg of this.messages) {
      console.log(msg);
    }

    this.messages = [];
  }

  clear(): void {
    this.messages = [];
  }
}
