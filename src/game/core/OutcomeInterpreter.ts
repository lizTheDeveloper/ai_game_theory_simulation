/**
 * OutcomeInterpreter - Convert simulation outcomes to narrative
 *
 * Translates raw simulation state into player-meaningful metrics
 * and narrative descriptions.
 */

import type {
  GameStateSnapshot,
  GameLayerState,
  AggregateMetrics,
} from '../types';
import { INFLUENCE_BOUNDS } from '../types';

/**
 * Outcome classification mapping
 */
const OUTCOME_DESCRIPTIONS: Record<string, string> = {
  utopia: 'Flourishing humanity with abundant resources and wellbeing',
  nearUtopia: 'Near-optimal conditions with minor challenges remaining',
  prosperity: 'Widespread prosperity and stability',
  stable: 'Stable civilization with ongoing management of risks',
  struggling: 'Society struggling but surviving major challenges',
  decline: 'Civilizational decline with mounting problems',
  collapse: 'Societal collapse with severe hardship',
  extinction: 'Existential catastrophe resulting in human extinction',
  unknown: 'Outcome not yet determined',
};

/**
 * OutcomeInterpreter class
 */
export class OutcomeInterpreter {
  /**
   * Compute aggregate metrics from simulation state
   */
  computeAggregateMetrics(
    state: GameStateSnapshot,
    gameLayerState: GameLayerState
  ): AggregateMetrics {
    return {
      currentMonth: state.currentMonth ?? 0,
      outcomeClassification: this.classifyOutcome(state),
      overallQoL: this.computeOverallQoL(state),
      environmentalHealth: this.computeEnvironmentalHealth(state),
      socialStability: this.computeSocialStability(state),
      aiAlignmentStatus: this.computeAIAlignmentStatus(state),
      governanceEffectiveness: this.computeGovernanceEffectiveness(state),
      influenceRemaining: INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT - gameLayerState.totalInfluenceSpent,
      activeCrises: this.countActiveCrises(state),
      breachedBoundaries: this.countBreachedBoundaries(state),
    };
  }

  /**
   * Get narrative description for current outcome
   */
  getOutcomeNarrative(state: GameStateSnapshot): string {
    const classification = this.classifyOutcome(state);
    return OUTCOME_DESCRIPTIONS[classification] ?? OUTCOME_DESCRIPTIONS.unknown;
  }

  /**
   * Classify current outcome
   */
  private classifyOutcome(state: GameStateSnapshot): string {
    // Try to read from state's outcome classification
    const outcomeMetrics = (state as Record<string, unknown>).outcomeMetrics as Record<string, unknown> | undefined;

    if (outcomeMetrics?.outcomeClassification) {
      return String(outcomeMetrics.outcomeClassification);
    }

    // Fallback classification based on QoL and other metrics
    const qol = this.computeOverallQoL(state);
    const envHealth = this.computeEnvironmentalHealth(state);
    const socialStab = this.computeSocialStability(state);

    const composite = (qol + envHealth + socialStab) / 3;

    if (composite >= 0.9) return 'utopia';
    if (composite >= 0.8) return 'nearUtopia';
    if (composite >= 0.7) return 'prosperity';
    if (composite >= 0.5) return 'stable';
    if (composite >= 0.3) return 'struggling';
    if (composite >= 0.1) return 'decline';
    if (composite > 0) return 'collapse';
    return 'extinction';
  }

  /**
   * Compute overall quality of life (0-1)
   */
  private computeOverallQoL(state: GameStateSnapshot): number {
    const qol = (state as Record<string, unknown>).qualityOfLifeSystems as Record<string, unknown> | undefined;

    if (!qol) return 0.5;

    // Try to read dimensions
    const dimensions = qol.dimensions as Record<string, number> | undefined;

    if (dimensions) {
      const values = Object.values(dimensions).filter(v => typeof v === 'number');
      if (values.length > 0) {
        return values.reduce((a, b) => a + b, 0) / values.length;
      }
    }

    // Fallback to overall if available
    if (typeof qol.overall === 'number') {
      return qol.overall;
    }

    return 0.5;
  }

  /**
   * Compute environmental health (0-1)
   *
   * HIGH-2 FIX (Nov 29, 2025): Read from canonical source
   * BifurcationLogicPhase calculates environmentalHealth as geometric mean of 4 metrics
   * and writes to state.globalMetrics.environmentalHealth
   */
  private computeEnvironmentalHealth(state: GameStateSnapshot): number {
    const globalMetrics = (state as Record<string, unknown>).globalMetrics as Record<string, number> | undefined;

    // Read from canonical source (BifurcationLogicPhase output)
    if (globalMetrics && typeof globalMetrics.environmentalHealth === 'number') {
      return globalMetrics.environmentalHealth;
    }

    // Fallback for states without calculated environmentalHealth (e.g., pre-simulation)
    return 0.5;
  }

  /**
   * Compute social stability (0-1)
   */
  private computeSocialStability(state: GameStateSnapshot): number {
    const society = (state as Record<string, unknown>).humanSociety as Record<string, unknown> | undefined;

    if (!society) return 0.5;

    let score = 0.5;

    // Social cohesion
    if (typeof society.socialCohesion === 'number') {
      score = society.socialCohesion as number;
    }

    // Trust factor
    const trustInInstitutions = society.trustInInstitutions as number | undefined;
    if (typeof trustInInstitutions === 'number') {
      score = (score + trustInInstitutions) / 2;
    }

    // Inequality penalty (Gini)
    const economicInequality = society.economicInequality as number | undefined;
    if (typeof economicInequality === 'number' && economicInequality > 0.4) {
      score -= (economicInequality - 0.4) * 0.5;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Compute AI alignment status (0-1)
   */
  private computeAIAlignmentStatus(state: GameStateSnapshot): number {
    const aiAgents = (state as Record<string, unknown>).aiAgents as Array<Record<string, unknown>> | undefined;

    if (!aiAgents || aiAgents.length === 0) return 0.5;

    // Average alignment across all AI agents
    let totalAlignment = 0;
    let count = 0;

    for (const agent of aiAgents) {
      if (typeof agent.alignmentScore === 'number') {
        totalAlignment += agent.alignmentScore as number;
        count++;
      }
    }

    if (count === 0) return 0.5;
    return totalAlignment / count;
  }

  /**
   * Compute governance effectiveness (0-1)
   */
  private computeGovernanceEffectiveness(state: GameStateSnapshot): number {
    const government = (state as Record<string, unknown>).government as Record<string, unknown> | undefined;

    if (!government) return 0.5;

    let score = 0.5;

    // Direct governance quality
    if (typeof government.governanceQuality === 'number') {
      score = government.governanceQuality as number;
    }

    // Democracy level
    if (typeof government.democracyLevel === 'number') {
      score = (score + (government.democracyLevel as number)) / 2;
    }

    // Institutional capacity
    if (typeof government.institutionalCapacity === 'number') {
      score = (score + (government.institutionalCapacity as number)) / 2;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Count active crises
   */
  private countActiveCrises(state: GameStateSnapshot): number {
    // Check for crisis indicators in events or state
    const events = (state as Record<string, unknown>).events as Array<Record<string, unknown>> | undefined;

    if (!events) return 0;

    // Count recent crisis events (last 12 months)
    const currentMonth = state.currentMonth ?? 0;
    const recentCrises = events.filter(e => {
      const timestamp = e.timestamp as number | undefined;
      const type = e.type as string | undefined;
      return (
        type === 'crisis' &&
        typeof timestamp === 'number' &&
        timestamp >= currentMonth - 12
      );
    });

    return recentCrises.length;
  }

  /**
   * Count breached planetary boundaries
   */
  private countBreachedBoundaries(state: GameStateSnapshot): number {
    const tippingPoints = (state as Record<string, unknown>).tippingPointSystem as Record<string, unknown> | undefined;

    if (!tippingPoints) return 0;

    const elements = tippingPoints.elements as Record<string, Record<string, unknown>> | undefined;

    if (!elements) return 0;

    let breached = 0;

    for (const element of Object.values(elements)) {
      const status = element.status as string | undefined;
      if (status === 'tipped' || status === 'critical') {
        breached++;
      }
    }

    return breached;
  }

  /**
   * Get trajectory description
   */
  getTrajectoryDescription(state: GameStateSnapshot): {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
    factors: string[];
  } {
    // Simple trajectory analysis based on current state
    const qol = this.computeOverallQoL(state);
    const env = this.computeEnvironmentalHealth(state);
    const social = this.computeSocialStability(state);

    const composite = (qol + env + social) / 3;
    const factors: string[] = [];

    // Analyze each dimension
    if (qol > 0.7) factors.push('Strong quality of life');
    else if (qol < 0.4) factors.push('Quality of life concerns');

    if (env > 0.7) factors.push('Healthy environment');
    else if (env < 0.4) factors.push('Environmental degradation');

    if (social > 0.7) factors.push('Social cohesion');
    else if (social < 0.4) factors.push('Social instability');

    // Determine direction
    let direction: 'improving' | 'stable' | 'declining';
    if (composite > 0.6) direction = 'improving';
    else if (composite < 0.4) direction = 'declining';
    else direction = 'stable';

    return {
      direction,
      confidence: 0.7, // Static confidence for now
      factors,
    };
  }
}
