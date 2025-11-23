/**
 * Performance Configuration
 *
 * Controls performance-critical settings including logging levels
 * for different parts of the simulation.
 *
 * Created: Nov 20, 2025 - Performance regression fix
 */

export interface PerformanceConfig {
  /**
   * Enable debug logging for AI action selection
   * Setting to false removes ~40ms per step in AI Agent Actions phase
   * Default: false (was true for months 0-2, causing 7x slowdown)
   */
  aiActionDebugLogging: boolean;

  /**
   * Months to enable debug logging for determinism checks
   * Set to 0 to disable all debug logging
   * Default: 0 (was 3, causing performance issues)
   */
  deterministicDebugMonths: number;

  /**
   * Enable verbose initialization logging
   * Default: false (only show critical errors)
   */
  verboseInitialization: boolean;

  /**
   * Enable determinism checksum logging
   * Default: false (only enable for debugging determinism issues)
   */
  deterministicChecksums: boolean;

  /**
   * Enable technology progress debug logging
   * Default: false
   */
  techDebugLogging: boolean;

  /**
   * Enable LLM phase logging
   * Default: false (LLM integration is disabled by default anyway)
   */
  llmPhaseLogging: boolean;

  /**
   * Slow phase warning threshold in milliseconds
   * Phases taking longer than this will log a warning
   * Default: 5ms
   */
  slowPhaseThreshold: number;
}

/**
 * Default performance configuration for production runs
 * Minimizes logging overhead while maintaining error visibility
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  aiActionDebugLogging: false,
  deterministicDebugMonths: 0,
  verboseInitialization: false,
  deterministicChecksums: false,
  techDebugLogging: false,
  llmPhaseLogging: false,
  slowPhaseThreshold: 5
};

/**
 * Debug configuration for troubleshooting
 * Enables verbose logging at the cost of performance
 */
export const DEBUG_PERFORMANCE_CONFIG: PerformanceConfig = {
  aiActionDebugLogging: true,
  deterministicDebugMonths: 3,
  verboseInitialization: true,
  deterministicChecksums: true,
  techDebugLogging: true,
  llmPhaseLogging: true,
  slowPhaseThreshold: 3
};

/**
 * Get performance configuration based on environment
 */
export function getPerformanceConfig(): PerformanceConfig {
  // Check for environment variable to enable debug mode
  if (process.env.SIMULATION_DEBUG === 'true') {
    console.warn('⚠️ DEBUG MODE ENABLED - Performance will be degraded');
    return DEBUG_PERFORMANCE_CONFIG;
  }

  return DEFAULT_PERFORMANCE_CONFIG;
}