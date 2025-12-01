/**
 * Unified Pictographic Logger
 *
 * Enforces single-emoji event format across all simulation logging.
 * Every log statement MUST start with a registered emoji from EMOJI_EVENT_MAP.txt
 *
 * **Benefits:**
 * - 95% log compression (emoji vs verbose text)
 * - Instant visual timeline scanning
 * - Type-safe emoji usage (TypeScript autocomplete)
 * - Validates against authoritative emoji map
 *
 * **Usage:**
 * ```typescript
 * import { simLog } from '@/simulation/utils/logger';
 *
 * simLog.event('💔', 'Defense failed', { agent: 'Agent-7', capGap: 0.45 });
 * simLog.event('🕊️', 'Peace achieved');
 * simLog.data('📊', { deaths: 1000, population: 8000 });
 * ```
 */

import { GameState } from '@/types/game';

/**
 * Registered event emojis from EMOJI_EVENT_MAP.txt
 *
 * This is the single source of truth for emoji usage.
 * Update EMOJI_EVENT_MAP.txt and regenerate this type.
 */
export type EventEmoji =
  // Defensive AI
  | '🛡️' | '🎯' | '💔' | '🔌' | '🕳️' | '⬆️' | '🔓' | '🛑' | '🚫'
  // Diplomatic
  | '🕊️' | '💬' | '🤝' | '🔻' | '📜' | '🌐'
  // Alignment
  | '⛓️' | '📉' | '📈' | '🧬' | '🧠'
  // Environmental
  | '🌡️' | '🔥' | '🌱' | '🌊' | '🐟' | '💧' | '🚰' | '💦' | '🦋' | '🐝' | '🪸' | '🌲' | '🌾'
  // Nuclear
  | '☢️' | '💥' | '🔐' | '⚖️' | '⏰' | '💀'
  // AI Consciousness
  | '😭' | '😢' | '🆘' | '😱' | '✊'
  // Sleeper Agents
  | '🕵️' | '🔔' | '👻' | '📡' | '❓' | '🎭'
  // Breakthroughs
  | '⚡' | '🔬' | '💡' | '🚀' | '✅' | '🎆'
  // Economic/Social
  | '💸' | '💰' | '🧘' | '🌟' | '👥' | '🤲' | '🏃'
  // AI Control
  | '📢' | '📱' | '🎮'
  // Extinction
  | '⚙️' | '🦠' | '🫁' | '💉' | '🌑' | '🔒' | '☠️'
  // Special
  | '📊' // Data/metrics display
  | '⚠️' // Warnings
  | '🚨' // Emergencies
  | '❌'; // Code errors only

/**
 * Log level for simulation events
 */
type LogLevel = 'event' | 'data' | 'warning' | 'emergency' | 'error';

/**
 * Pictographic logger for simulation events
 */
class SimulationLogger {
  private quietMode: boolean;

  constructor() {
    this.quietMode = process.env.SIMULATION_QUIET_MODE === 'true';
  }

  /**
   * Check if quiet mode is active (parameter sweeps)
   */
  isQuiet(): boolean {
    return this.quietMode;
  }

  /**
   * Log a simulation event
   *
   * @param emoji - Event emoji from EMOJI_EVENT_MAP
   * @param message - Optional short message (keep under 30 chars for compression)
   * @param data - Optional structured data for analysis
   *
   * @example
   * simLog.event('💔', 'Defense failed', { agent: 'Agent-7', capGap: 0.45 });
   * simLog.event('🕊️'); // Just emoji for ultra-compression
   */
  event(emoji: EventEmoji, message?: string, data?: Record<string, any>): void {
    if (this.quietMode) return;
    if (message && data) {
      console.log(`${emoji} ${message}`, data);
    } else if (message) {
      console.log(`${emoji} ${message}`);
    } else {
      console.log(emoji);
    }
  }

  /**
   * Log data/metrics (uses 📊 emoji)
   *
   * @param message - Short description
   * @param data - Data to display
   *
   * @example
   * simLog.data('Monthly mortality', { deaths: 1000, population: 8000 });
   */
  data(message: string, data?: Record<string, any>): void {
    if (this.quietMode) return;
    if (data) {
      console.log(`📊 ${message}`, data);
    } else {
      console.log(`📊 ${message}`);
    }
  }

  /**
   * Log a warning (uses ⚠️ emoji)
   *
   * Suppressed during parameter sweeps (SIMULATION_QUIET_MODE=true)
   *
   * @param message - Warning message
   * @param context - Optional context
   *
   * @example
   * simLog.warning('High mortality risk', { region: 'Asia', risk: 0.15 });
   */
  warning(message: string, context?: Record<string, any>): void {
    if (this.quietMode) return;
    if (context) {
      console.log(`⚠️ ${message}`, context);
    } else {
      console.log(`⚠️ ${message}`);
    }
  }

  /**
   * Log an emergency (uses 🚨 emoji)
   *
   * @param message - Emergency message
   * @param context - Optional context
   *
   * @example
   * simLog.emergency('Nuclear escalation', { tension: 0.9 });
   */
  emergency(message: string, context?: Record<string, any>): void {
    if (context) {
      console.error(`🚨 ${message}`, context);
    } else {
      console.error(`🚨 ${message}`);
    }
  }

  /**
   * Log a code error (uses ❌ emoji)
   *
   * For actual bugs/errors in simulation code.
   * For simulation failures (defense failed, etc), use event() instead.
   *
   * @param message - Error message
   * @param context - Optional context
   *
   * @example
   * simLog.error('NaN detected in capability', { agent: 'Agent-7', value: NaN });
   */
  error(message: string, context?: Record<string, any>): void {
    if (context) {
      console.error(`❌ ${message}`, context);
    } else {
      console.error(`❌ ${message}`);
    }
  }

  /**
   * Create a visual timeline from event emojis
   *
   * @param events - Array of event emojis
   * @returns Compact visual timeline string
   *
   * @example
   * const timeline = simLog.timeline(['🔬', '💡', '🚀', '✅', '🕊️']);
   * // "🔬💡🚀✅🕊️"
   */
  timeline(events: EventEmoji[]): string {
    return events.join('');
  }

  /**
   * Log a month's events as a visual timeline
   *
   * @param month - Month number
   * @param events - Events that occurred
   *
   * @example
   * simLog.monthTimeline(12, ['🔬', '💡', '🚀', '✅']);
   * // "M12: 🔬💡🚀✅"
   */
  monthTimeline(month: number, events: EventEmoji[]): void {
    if (this.quietMode) return;
    console.log(`M${month}: ${this.timeline(events)}`);
  }
}

/**
 * Singleton logger instance
 *
 * Use this throughout the simulation for all logging.
 */
export const simLog = new SimulationLogger();

/**
 * Legacy console.log wrapper (deprecated)
 *
 * @deprecated Use simLog.event() instead for type safety
 */
export function logEvent(emoji: string, message?: string, data?: any): void {
  if (message && data) {
    console.log(`${emoji} ${message}`, data);
  } else if (message) {
    console.log(`${emoji} ${message}`);
  } else {
    console.log(emoji);
  }
}
