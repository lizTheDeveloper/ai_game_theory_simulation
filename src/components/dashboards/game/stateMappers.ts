/**
 * State Mappers - H-2 Game State to UI Mapping (Nov 25, 2025)
 *
 * Pure utility functions that transform complex GameStateSnapshot (900+ fields)
 * into simpler formats expected by dashboard components.
 *
 * Follows game layer module boundaries:
 * - Read-only access to GameStateSnapshot
 * - No imports from src/simulation/ (only types)
 * - Graceful fallbacks when state is undefined
 */

import type { GameStateSnapshot } from '@/game/types';

// ============================================================================
// Currency Panel Types & Mappers
// ============================================================================

export interface CurrencyDisplay {
  name: string;
  value: number;
  max: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

/**
 * Maps GameState to currency display format
 *
 * @param state - Current game state (may be undefined)
 * @returns Array of currency displays for dashboard
 */
export function mapCurrencies(state?: GameStateSnapshot): CurrencyDisplay[] {
  if (!state) {
    return getDefaultCurrencies();
  }

  // Research: Based on unlocked tech count / total tech
  const unlockedCount = state.techTreeState?.unlockedTech?.length ?? 0;
  const totalTech = 71; // Total techs in comprehensiveTechTree.ts
  const researchProgress = Math.round((unlockedCount / totalTech) * 100);

  // Influence: From institutional legitimacy + international coordination
  const legitimacy = state.governmentSystem?.institutionalLegitimacy ?? 0.5;
  const coordination = state.governmentSystem?.internationalCoordination?.level ?? 0.3;
  const influenceValue = Math.round(((legitimacy + coordination) / 2) * 100);

  // Resources: From resource economy aggregate
  const resourceEcon = state.resourceEconomy ?? {};
  const gdp = resourceEcon.globalGDPPerCapita ?? 15000;
  const resourceValue = Math.min(100, Math.round((gdp / 20000) * 100));

  // AI Trust: From society trustInAI + AI welfare
  const societyTrust = state.society?.trustInAI ?? 0.5;
  const aiWelfare = state.aiWelfare?.simpleScore ?? 0.5;
  const aiTrustValue = Math.round(((societyTrust + aiWelfare) / 2) * 100);

  return [
    {
      name: 'Research',
      value: researchProgress,
      max: 100,
      trend: unlockedCount > 0 ? 5 : 0,
      trendDirection: unlockedCount > 10 ? 'up' : 'neutral',
    },
    {
      name: 'Influence',
      value: influenceValue,
      max: 100,
      trend: legitimacy > 0.6 ? 3 : -2,
      trendDirection: legitimacy > 0.6 ? 'up' : legitimacy < 0.4 ? 'down' : 'neutral',
    },
    {
      name: 'Resources',
      value: resourceValue,
      max: 100,
      trend: gdp > 15000 ? 2 : -1,
      trendDirection: gdp > 15000 ? 'up' : gdp < 12000 ? 'down' : 'neutral',
    },
    {
      name: 'AI Trust',
      value: aiTrustValue,
      max: 100,
      trend: societyTrust > 0.5 ? 4 : -3,
      trendDirection: societyTrust > 0.6 ? 'up' : societyTrust < 0.4 ? 'down' : 'neutral',
    },
  ];
}

function getDefaultCurrencies(): CurrencyDisplay[] {
  return [
    { name: 'Research', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'Influence', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'Resources', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'AI Trust', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
  ];
}

// ============================================================================
// Outcome Probabilities Mapper
// ============================================================================

export interface OutcomeDisplay {
  utopia: number;
  alignment: number;
  struggle: number;
  collapse: number;
  extinction: number;
  changeFromLastMonth: number;
}

/**
 * Maps outcome probabilities to display format
 *
 * @param state - Current game state (may be undefined)
 * @returns Outcome probabilities for dashboard
 */
export function mapOutcomes(state?: GameStateSnapshot): OutcomeDisplay {
  if (!state || !state.outcomeMetrics) {
    return getDefaultOutcomes();
  }

  const metrics = state.outcomeMetrics;

  // Direct mappings from outcomeMetrics
  const utopia = metrics.utopiaIndex ?? 0.1;
  const extinction = metrics.extinctionRisk ?? 0.05;

  // Calculate intermediate states from QoL and environmental factors
  const qolScore = metrics.globalQoLScore ?? 0.5;
  const envDebt = state.environmentalAccumulation?.pollutionAccumulation ?? 0;

  // Distribute remaining probability based on state indicators
  const remaining = Math.max(0, 1 - utopia - extinction);
  const alignment = remaining * (qolScore > 0.6 ? 0.4 : 0.2);
  const collapse = remaining * (envDebt > 50 ? 0.4 : 0.2);
  const struggle = remaining - alignment - collapse;

  return {
    utopia: Math.max(0, Math.min(1, utopia)),
    alignment: Math.max(0, Math.min(1, alignment)),
    struggle: Math.max(0, Math.min(1, struggle)),
    collapse: Math.max(0, Math.min(1, collapse)),
    extinction: Math.max(0, Math.min(1, extinction)),
    changeFromLastMonth: 0.02, // TODO: Track actual changes
  };
}

function getDefaultOutcomes(): OutcomeDisplay {
  return {
    utopia: 0.1,
    alignment: 0.25,
    struggle: 0.35,
    collapse: 0.2,
    extinction: 0.1,
    changeFromLastMonth: 0,
  };
}

// ============================================================================
// Event Stream Mapper
// ============================================================================

export interface EventDisplay {
  id: string;
  text: string;
  severity: 'success' | 'info' | 'warning' | 'critical';
}

/**
 * Maps recent events to display format
 *
 * @param state - Current game state (may be undefined)
 * @param limit - Maximum events to return (default 10)
 * @returns Array of events for dashboard
 */
export function mapEvents(state?: GameStateSnapshot, limit = 10): EventDisplay[] {
  if (!state || !state.eventLog || state.eventLog.length === 0) {
    return getDefaultEvents();
  }

  // Get most recent events
  const recentEvents = state.eventLog.slice(-limit).reverse();

  return recentEvents.map((event, index) => {
    // Determine severity from event description/type
    const text = event.description ?? 'Event at month ' + event.month;
    const severity = classifyEventSeverity(text);

    return {
      id: 'event-' + event.month + '-' + index,
      text,
      severity,
    };
  });
}

function classifyEventSeverity(text: string): EventDisplay['severity'] {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('breakthrough') || lowerText.includes('success') || lowerText.includes('improvement')) {
    return 'success';
  }
  if (lowerText.includes('crisis') || lowerText.includes('collapse') || lowerText.includes('extinction') || lowerText.includes('critical')) {
    return 'critical';
  }
  if (lowerText.includes('warning') || lowerText.includes('decline') || lowerText.includes('risk')) {
    return 'warning';
  }
  return 'info';
}

function getDefaultEvents(): EventDisplay[] {
  return [
    { id: 'default-1', text: 'Simulation initialized', severity: 'info' },
  ];
}

// ============================================================================
// Next Month Preview Mapper
// ============================================================================

/**
 * Generates preview of upcoming events/concerns
 *
 * @param state - Current game state (may be undefined)
 * @returns Array of preview strings
 */
export function mapNextMonthPreview(state?: GameStateSnapshot): string[] {
  if (!state) {
    return ['Awaiting simulation data...'];
  }

  const previews: string[] = [];

  // Check climate thresholds
  const tempAnomaly = state.resourceEconomy?.temperatureAnomaly ?? 0;
  if (tempAnomaly > 1.5) {
    previews.push('Climate threshold approaching critical level');
  }

  // Check resource crises
  const phosphorus = state.phosphorusSystem?.reserves ?? 100;
  if (phosphorus < 50) {
    previews.push('Phosphorus crisis may trigger');
  }

  // Check social cohesion
  const cohesion = state.society?.cohesion ?? 0.5;
  if (cohesion < 0.4) {
    previews.push('Social cohesion declining - instability risk');
  }

  // Check AI capabilities
  const avgCapability = state.aiAgents?.length
    ? state.aiAgents.reduce((sum, a) => sum + (a.capabilities?.overall ?? 0), 0) / state.aiAgents.length
    : 0;
  if (avgCapability > 7) {
    previews.push('AI capability milestone expected');
  }

  // Check planetary boundaries
  const breachedCount = state.planetaryBoundaries?.boundariesBreached ?? 0;
  if (breachedCount >= 6) {
    previews.push('Multiple planetary boundaries at risk');
  }

  // Default if nothing notable
  if (previews.length === 0) {
    previews.push('No critical events anticipated');
  }

  return previews.slice(0, 3); // Limit to 3 previews
}

// ============================================================================
// Pending Decisions Mapper
// ============================================================================

export interface DecisionDisplay {
  id: string;
  name: string;
  urgency: 'critical' | 'important' | 'standard';
  daysRemaining: number;
  impact: string;
}

/**
 * Maps pending decisions from game state
 *
 * @param state - Current game state (may be undefined)
 * @returns Array of pending decisions for dashboard
 */
export function mapPendingDecisions(state?: GameStateSnapshot): DecisionDisplay[] {
  if (!state) {
    return getDefaultDecisions();
  }

  const decisions: DecisionDisplay[] = [];

  // Check for catastrophic scenarios requiring action
  if (state.crisisState?.activePhases) {
    for (const phase of state.crisisState.activePhases) {
      decisions.push({
        id: 'crisis-' + phase,
        name: formatCrisisName(phase),
        urgency: 'critical',
        daysRemaining: 3,
        impact: 'Immediate action required to prevent escalation',
      });
    }
  }

  // Check planetary boundaries needing attention
  const breached = state.planetaryBoundaries?.boundariesBreached ?? 0;
  if (breached >= 3) {
    decisions.push({
      id: 'boundaries-action',
      name: 'Planetary Boundaries Response',
      urgency: breached >= 6 ? 'critical' : 'important',
      daysRemaining: 10,
      impact: breached + ' boundaries breached - coordinated response needed',
    });
  }

  // Check AI alignment concerns
  const misalignedAgents = state.aiAgents?.filter(a => (a.trueAlignment ?? 1) < 0.5) ?? [];
  if (misalignedAgents.length > 0) {
    decisions.push({
      id: 'ai-alignment-review',
      name: 'AI Alignment Assessment Required',
      urgency: misalignedAgents.length >= 3 ? 'critical' : 'important',
      daysRemaining: 7,
      impact: misalignedAgents.length + ' AI agents require evaluation',
    });
  }

  // Check undeployed technologies
  const undeployed = state.techTreeState?.unlockedTech?.filter(
    id => !state.techTreeState?.deployedTech?.includes(id)
  ) ?? [];
  if (undeployed.length > 5) {
    decisions.push({
      id: 'tech-deployment',
      name: 'Technology Deployment Review',
      urgency: 'standard',
      daysRemaining: 15,
      impact: undeployed.length + ' technologies ready for deployment',
    });
  }

  return decisions.length > 0 ? decisions.slice(0, 5) : getDefaultDecisions();
}

function formatCrisisName(phase: string): string {
  return phase
    .replace(/_/g, ' ')
    .replace(/phase$/i, '')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + ' Response';
}

function getDefaultDecisions(): DecisionDisplay[] {
  return [
    {
      id: 'default-1',
      name: 'Initial Assessment',
      urgency: 'standard',
      daysRemaining: 30,
      impact: 'Review current simulation parameters',
    },
  ];
}

// ============================================================================
// Header Info Mappers
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats current month for display (e.g., "March 2025")
 *
 * @param state - Current game state (may be undefined)
 * @param startYear - Simulation start year (default 2025)
 * @returns Formatted month string
 */
export function formatCurrentMonth(state?: GameStateSnapshot, startYear = 2025): string {
  if (!state) {
    return 'Month 0';
  }

  const currentMonth = state.currentMonth ?? 0;
  const year = startYear + Math.floor(currentMonth / 12);
  const monthIndex = currentMonth % 12;

  return MONTH_NAMES[monthIndex] + ' ' + year;
}

/**
 * Gets elapsed months count
 *
 * @param state - Current game state (may be undefined)
 * @returns Number of elapsed months
 */
export function getElapsedMonths(state?: GameStateSnapshot): number {
  return state?.currentMonth ?? 0;
}
