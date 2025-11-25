/**
 * State Mappers - Transform GameStateSnapshot to UI display formats
 *
 * H-2 Implementation: Wire Game Layer React Components to GameStateSnapshot
 *
 * These utilities extract data from the complex GameStateSnapshot (900+ fields)
 * and transform it into the simpler formats expected by dashboard components.
 *
 * Design principles:
 * - Fail gracefully: If state is undefined, return sensible defaults
 * - Type safety: All inputs/outputs strictly typed
 * - Pure functions: No side effects, easy to test
 */

import type { GameStateSnapshot } from '@/game/types';
import type { Currency, Outcomes } from './CurrencyPanel';
import type { Event } from './EventStream';
import type { Decision } from './PendingDecisions';

// ============================================================================
// CURRENCY MAPPING
// ============================================================================

/**
 * Extract currency-like metrics from game state
 *
 * Maps complex simulation state to simple progress bars:
 * - Research: From tech tree progress and research investment
 * - Influence: From government effectiveness and international coordination
 * - Resources: From resource economy aggregate metrics
 * - AI Trust: From social cohesion and AI welfare metrics
 */
export function mapCurrencies(state: GameStateSnapshot | undefined): Currency[] {
  if (!state) {
    return getDefaultCurrencies();
  }

  // Research metric: Based on tech tree progress and deployed tech count
  const techTreeState = state.techTreeState;
  const unlockedTechCount = techTreeState?.unlockedTech?.length ?? 0;
  const totalPossibleTech = 71; // From architecture: 71 breakthrough technologies
  const researchProgress = Math.round((unlockedTechCount / totalPossibleTech) * 100);

  // Calculate research trend from recent unlocks
  const recentUnlocks = techTreeState?.unlockHistory?.filter(
    event => event.month > (state.currentMonth - 3)
  )?.length ?? 0;
  const researchTrend = recentUnlocks > 0 ? recentUnlocks * 3 : 0;

  // Influence metric: From government system and social cohesion
  const socialAccumulation = state.socialAccumulation;
  const institutionalLegitimacy = socialAccumulation?.institutionalLegitimacy ?? 0.5;
  const governmentSystem = state.governmentSystem;
  const internationalCoordination = governmentSystem?.internationalCoordination ?? 0.5;
  const influenceScore = Math.round(
    ((institutionalLegitimacy + internationalCoordination) / 2) * 100
  );

  // Influence trend: Based on recent policy activity
  const recentPolicies = governmentSystem?.activePolicies?.length ?? 0;
  const influenceTrend = recentPolicies > 5 ? 5 : recentPolicies > 2 ? 2 : -2;

  // Resources metric: From resource economy aggregate
  const resourceEconomy = state.resourceEconomy;
  const resourceSecurity = resourceEconomy?.totalResourceSecurity ?? 0.5;
  const energyIndependence = resourceEconomy?.energyIndependence ?? 0.5;
  const resourceScore = Math.round(
    ((resourceSecurity + energyIndependence) / 2) * 100
  );

  // Resource trend: Based on fossil dependence direction
  const fossilDependence = resourceEconomy?.fossilDependence ?? 0.5;
  const renewablePercentage = resourceEconomy?.energy?.renewablePercentage ?? 0;
  const resourceTrend = renewablePercentage > 50 ? 5 : renewablePercentage > 30 ? 2 : -3;

  // AI Trust metric: Composite of society trust and AI welfare
  const society = state.society;
  const aiTrust = society?.trustInAI ?? 0.5;
  const aiWelfare = state.aiWelfare;
  const aiWelfareScore = aiWelfare?.simpleScore ?? 0.5;
  const trustScore = Math.round(((aiTrust + aiWelfareScore) / 2) * 100);

  // Trust trend: Based on AI alignment status
  const avgAlignment = state.aiAgents?.reduce(
    (sum, agent) => sum + (agent.alignment ?? 0.5), 0
  ) / (state.aiAgents?.length || 1);
  const trustTrend = avgAlignment > 0.7 ? 8 : avgAlignment > 0.5 ? 3 : -5;

  return [
    {
      name: 'Research',
      value: researchProgress,
      max: 100,
      trend: researchTrend,
      trendDirection: researchTrend > 0 ? 'up' : researchTrend < 0 ? 'down' : 'neutral',
    },
    {
      name: 'Influence',
      value: influenceScore,
      max: 100,
      trend: influenceTrend,
      trendDirection: influenceTrend > 0 ? 'up' : influenceTrend < 0 ? 'down' : 'neutral',
    },
    {
      name: 'Resources',
      value: resourceScore,
      max: 100,
      trend: resourceTrend,
      trendDirection: resourceTrend > 0 ? 'up' : resourceTrend < 0 ? 'down' : 'neutral',
    },
    {
      name: 'AI Trust',
      value: trustScore,
      max: 100,
      trend: trustTrend,
      trendDirection: trustTrend > 0 ? 'up' : trustTrend < 0 ? 'down' : 'neutral',
    },
  ];
}

function getDefaultCurrencies(): Currency[] {
  return [
    { name: 'Research', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'Influence', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'Resources', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
    { name: 'AI Trust', value: 50, max: 100, trend: 0, trendDirection: 'neutral' },
  ];
}

// ============================================================================
// OUTCOME PROBABILITIES MAPPING
// ============================================================================

/**
 * Extract outcome probabilities from game state
 *
 * The simulation tracks OutcomeMetrics with utopia/dystopia/extinction probabilities.
 * We map these to the 5-category display (utopia, alignment, struggle, collapse, extinction).
 */
export function mapOutcomes(state: GameStateSnapshot | undefined): Outcomes {
  if (!state) {
    return getDefaultOutcomes();
  }

  const outcomeMetrics = state.outcomeMetrics;

  // Get raw probabilities
  const utopiaProb = outcomeMetrics?.utopiaProbability ?? 0.1;
  const dystopiaProb = outcomeMetrics?.dystopiaProbability ?? 0.3;
  const extinctionProb = outcomeMetrics?.extinctionProbability ?? 0.1;

  // Calculate remaining probability for middle states
  const remaining = Math.max(0, 1 - utopiaProb - dystopiaProb - extinctionProb);

  // Split remaining between "alignment" (positive middle) and "struggle" (negative middle)
  // Based on quality of life and accumulation state
  // Calculate QoL from tier metrics (no globalQoL field - use weighted average)
  const qolSystems = state.qualityOfLifeSystems;
  const qol = qolSystems ? (
    (qolSystems.materialAbundance + qolSystems.mentalHealth + qolSystems.physicalSafety +
     qolSystems.healthcareQuality + qolSystems.ecosystemHealth) / 5
  ) : 0.5;
  // Environmental debt from pollution and resource reserves
  const envAccum = state.environmentalAccumulation;
  const environmentalDebt = envAccum ? (envAccum.pollutionLevel + (1 - envAccum.resourceReserves)) / 2 : 0;
  const socialDebt = state.socialAccumulation?.meaningCrisisLevel ?? 0;

  // Higher QoL and lower debt = more "alignment", lower QoL = more "struggle"
  const healthScore = qol - (environmentalDebt * 0.3) - (socialDebt * 0.3);
  const alignmentRatio = Math.max(0, Math.min(1, (healthScore + 0.5) / 2));

  const alignmentProb = remaining * alignmentRatio;
  const struggleProb = remaining * (1 - alignmentRatio);

  // Collapse comes from dystopia spillover
  const collapseProb = dystopiaProb * 0.4;
  const adjustedDystopia = dystopiaProb * 0.6;

  // Normalize to sum to 1.0
  const total = utopiaProb + alignmentProb + struggleProb + collapseProb + extinctionProb;
  const normalize = (v: number) => total > 0 ? v / total : 0.2;

  // Calculate change from last month (simplified: based on outcome attractor direction)
  const activeAttractor = outcomeMetrics?.activeAttractor ?? 'none';
  const changeFromLastMonth =
    activeAttractor === 'utopia' ? 0.03 :
    activeAttractor === 'extinction' ? -0.05 :
    activeAttractor === 'dystopia' ? -0.02 :
    0;

  return {
    utopia: normalize(utopiaProb),
    alignment: normalize(alignmentProb),
    struggle: normalize(struggleProb),
    collapse: normalize(collapseProb),
    extinction: normalize(extinctionProb),
    changeFromLastMonth,
  };
}

function getDefaultOutcomes(): Outcomes {
  return {
    utopia: 0.15,
    alignment: 0.30,
    struggle: 0.30,
    collapse: 0.15,
    extinction: 0.10,
    changeFromLastMonth: 0,
  };
}

// ============================================================================
// EVENT STREAM MAPPING
// ============================================================================

/**
 * Extract recent events from game state
 *
 * Maps simulation GameEvent to display Event format with severity classification.
 * Shows most recent events first.
 */
export function mapEvents(state: GameStateSnapshot | undefined, limit: number = 10): Event[] {
  if (!state || !state.eventLog) {
    return getDefaultEvents();
  }

  // Get recent events, sorted by timestamp descending
  const recentEvents = [...state.eventLog]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return recentEvents.map((event, index) => ({
    id: event.id || `event-${state.currentMonth}-${index}`,
    text: formatEventText(event.title, event.description),
    severity: mapEventSeverity(event.severity, event.type),
  }));
}

/**
 * Map simulation event severity to display severity
 */
function mapEventSeverity(
  severity: string | undefined,
  type: string | undefined
): 'critical' | 'warning' | 'success' | 'info' {
  // Direct mappings
  if (severity === 'critical' || severity === 'existential') return 'critical';
  if (severity === 'warning' || severity === 'destructive' || severity === 'high') return 'warning';
  if (severity === 'positive' || severity === 'constructive' || severity === 'transformative') return 'success';

  // Type-based fallbacks
  if (type === 'crisis' || type === 'catastrophe') return 'critical';
  if (type === 'breakthrough' || type === 'positive-milestone' || type === 'positive-cascade-triggered') return 'success';
  if (type === 'sabotage') return 'warning';

  return 'info';
}

/**
 * Format event text for display
 */
function formatEventText(title: string | undefined, description: string | undefined): string {
  if (title && description) {
    // If description is short, combine them
    if (description.length < 50) {
      return `${title}: ${description}`;
    }
    return title;
  }
  return title || description || 'Unknown event';
}

function getDefaultEvents(): Event[] {
  return [
    { id: 'default-1', text: 'Simulation initializing...', severity: 'info' },
  ];
}

// ============================================================================
// NEXT MONTH PREVIEW
// ============================================================================

/**
 * Generate next month preview based on current state
 *
 * Looks at:
 * - Approaching crisis thresholds
 * - Pending technology unlocks
 * - Scheduled events
 * - Accumulation warning levels
 */
export function mapNextMonthPreview(state: GameStateSnapshot | undefined): string[] {
  if (!state) {
    return ['Waiting for simulation state...'];
  }

  const previews: string[] = [];

  // Check for approaching environmental crises
  const co2System = state.resourceEconomy?.co2;
  if (co2System) {
    if (co2System.temperatureAnomaly > 1.5 && co2System.temperatureAnomaly < 2.0) {
      previews.push('Climate tipping point threshold approaching');
    }
  }

  // Check for phosphorus/freshwater crises
  const phosphorus = state.phosphorusSystem;
  // Use reserves field (starts at 1.0, depletes toward 0)
  if (phosphorus?.reserves !== undefined && phosphorus.reserves < 0.3) {
    previews.push('Phosphorus depletion crisis may trigger');
  }

  const freshwater = state.freshwaterSystem;
  // Use waterStress field [0,1] - higher is more stressed
  if (freshwater?.waterStress !== undefined && freshwater.waterStress > 0.7) {
    previews.push('Freshwater crisis escalating');
  }

  // Check for pending technology breakthroughs
  const techProgress = state.techTreeState?.researchProgress ?? {};
  const nearComplete = Object.entries(techProgress).filter(
    ([_, progress]) => progress > 0.8 && progress < 1.0
  );
  if (nearComplete.length > 0) {
    previews.push(`${nearComplete.length} technology breakthrough(s) near completion`);
  }

  // Check for social cohesion warnings
  const socialAccum = state.socialAccumulation;
  if (socialAccum) {
    if (socialAccum.meaningCrisisLevel > 0.6) {
      previews.push('Meaning crisis deepening');
    }
    if (socialAccum.institutionalLegitimacy < 0.4) {
      previews.push('Institutional legitimacy declining');
    }
  }

  // Check for AI-related events
  const avgCapability = state.aiAgents?.reduce(
    (sum, agent) => sum + (agent.capability ?? 0), 0
  ) / (state.aiAgents?.length || 1);

  if (avgCapability > 1.5 && avgCapability < 2.0) {
    previews.push('AI capability milestone approaching');
  }

  // Check for nuclear tensions
  const nuclearTensions = state.bilateralTensions?.filter(
    t => t.tensionLevel > 0.7
  );
  if (nuclearTensions && nuclearTensions.length > 0) {
    previews.push('Elevated nuclear tensions detected');
  }

  // Default if nothing notable
  if (previews.length === 0) {
    previews.push('Normal operations expected');
  }

  return previews.slice(0, 4); // Limit to 4 items
}

// ============================================================================
// PENDING DECISIONS MAPPING
// ============================================================================

/**
 * Extract pending decisions from game state
 *
 * Decisions can come from:
 * - Critical junctures (from game layer events)
 * - Active crises requiring response
 * - Scheduled policy decisions
 * - Treaty negotiations
 */
export function mapPendingDecisions(state: GameStateSnapshot | undefined): Decision[] {
  if (!state) {
    return getDefaultDecisions();
  }

  const decisions: Decision[] = [];

  // Check for active catastrophic scenarios requiring response
  const catastrophicScenarios = state.catastrophicScenarios ?? [];
  catastrophicScenarios.forEach((scenario, index) => {
    // Scenarios use phase: 'dormant' | 'emerging' | 'critical' | 'irreversible'
    // and allPrerequisitesMet + activationDate for tracking
    const isActive = scenario.phase !== 'dormant' && scenario.activationDate !== null;
    if (isActive) {
      decisions.push({
        id: `crisis-${index}`,
        name: `${scenario.name} Response`,
        urgency: scenario.severity > 0.8 ? 'critical' :
                 scenario.severity > 0.5 ? 'important' : 'standard',
        daysRemaining: Math.max(1, Math.round((1 - scenario.severity) * 10)),
        impact: `Phase: ${scenario.phase}, ${scenario.monthsSinceActivation} months active`,
      });
    }
  });

  // Check for planetary boundary breaches
  const planetaryBoundaries = state.planetaryBoundariesSystem;
  // Use boundariesBreached count (number) not array
  if (planetaryBoundaries?.boundariesBreached && planetaryBoundaries.boundariesBreached > 0) {
    decisions.push({
      id: 'boundary-response',
      name: 'Planetary Boundary Crisis Response',
      urgency: planetaryBoundaries.boundariesBreached > 3 ? 'critical' : 'important',
      daysRemaining: 5,
      impact: `${planetaryBoundaries.boundariesBreached} boundaries breached`,
    });
  }

  // Check for AI alignment concerns
  const misalignedAgents = state.aiAgents?.filter(
    agent => (agent.alignment ?? 0.5) < 0.4
  );
  if (misalignedAgents && misalignedAgents.length > 0) {
    decisions.push({
      id: 'alignment-review',
      name: 'AI Alignment Assessment Protocol',
      urgency: misalignedAgents.some(a => (a.alignment ?? 0.5) < 0.2) ? 'critical' : 'important',
      daysRemaining: 3,
      impact: `${misalignedAgents.length} agent(s) showing alignment drift`,
    });
  }

  // Check for research priority decisions based on unlocked but undeployed tech
  const unlockedTech = state.techTreeState?.unlockedTech ?? [];
  const deployedTechMap = state.techTreeState?.deployedTechMap ?? {};
  const undeployedCount = unlockedTech.filter(
    techId => (deployedTechMap[techId] ?? 0) < 0.1
  ).length;

  if (undeployedCount > 5) {
    decisions.push({
      id: 'tech-deployment',
      name: 'Technology Deployment Priority',
      urgency: 'standard',
      daysRemaining: 10,
      impact: `${undeployedCount} technologies available for deployment`,
    });
  }

  // Return decisions or defaults if none
  return decisions.length > 0 ? decisions.slice(0, 5) : getDefaultDecisions();
}

function getDefaultDecisions(): Decision[] {
  return [
    {
      id: 'default-1',
      name: 'Awaiting simulation data',
      urgency: 'standard',
      daysRemaining: 30,
      impact: 'No active decisions',
    },
  ];
}

// ============================================================================
// HEADER DATA MAPPING
// ============================================================================

/**
 * Format current month for display
 */
export function formatCurrentMonth(state: GameStateSnapshot | undefined): string {
  if (!state) {
    return 'Month 0';
  }

  const month = state.currentMonth;
  const year = state.currentYear ?? 2025;

  // Map month number to name (simulation months are 0-indexed from Jan 2025)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthIndex = month % 12;
  const yearsElapsed = Math.floor(month / 12);
  const displayYear = year + yearsElapsed;

  return `${monthNames[monthIndex]} ${displayYear}`;
}

/**
 * Get elapsed months from state
 */
export function getElapsedMonths(state: GameStateSnapshot | undefined): number {
  return state?.currentMonth ?? 0;
}
