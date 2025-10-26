/**
 * Event Logging Utility
 *
 * Shared helper for adding events to the simulation timeline.
 * Automatically generates unique IDs and timestamps.
 *
 * Usage:
 * ```typescript
 * import { addSimulationEvent } from '@/simulation/utils/eventLogger';
 *
 * addSimulationEvent(state, {
 *   type: 'crisis',
 *   severity: 'critical',
 *   agent: 'Sleeper-1',
 *   title: 'Sleeper Agent Awakened',
 *   description: 'Sleeper-1 revealed true capability...',
 *   effects: { sleeperAwakened: 1, revealedCapability: 2.8 }
 * });
 * ```
 */

import { GameState, GameEvent } from '@/types/game';

/**
 * Add an event to the simulation timeline
 *
 * Automatically generates:
 * - Unique ID: `{type}_{month}_{random}`
 * - Timestamp: `state.currentMonth`
 *
 * @param state - Game state (eventLog will be modified)
 * @param event - Event details (id and timestamp auto-generated)
 *
 * @example
 * addSimulationEvent(state, {
 *   type: 'crisis',
 *   severity: 'critical',
 *   agent: 'environmental',
 *   title: '🚨 NEW REFUGEE CRISIS: WAR',
 *   description: 'Refugee crisis triggered in Conflict Zones...',
 *   effects: { potentialDisplaced: 150.5, cause: 'war' }
 * });
 */
export function addSimulationEvent(
  state: GameState,
  event: Omit<GameEvent, 'id' | 'timestamp'>
): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}
