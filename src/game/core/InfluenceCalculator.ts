/**
 * InfluenceCalculator - Convert player actions to bounded probability shifts
 *
 * Enforces Sylvia's research validity constraints:
 * - Single action: <= 5% effect
 * - Per domain: <= 10% cumulative
 * - Total cumulative: <= 15%
 * - No choice > 20% outcome shift
 */

import type {
  GameLayerState,
  GameStateSnapshot,
  AdvocacyAction,
  AdvocacyActionId,
  PlayerDecision,
  QueueResult,
  InfluenceValidationResult,
  ValidationResult,
  InfluenceDomain,
} from '../types';
import { INFLUENCE_BOUNDS } from '../types';

/**
 * Action catalog - predefined advocacy actions
 *
 * NOTE: This is a minimal initial catalog. Full action definitions
 * will be developed with research backing.
 */
const ACTION_CATALOG: Map<AdvocacyActionId, AdvocacyAction> = new Map([
  ['advocate_ai_safety', {
    id: 'advocate_ai_safety',
    name: 'Advocate for AI Safety',
    description: 'Public campaign to increase AI safety awareness',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafetySupport',
    baseEffect: 0.02,
    duration: 6,
    cooldown: 3,
    prerequisites: [],
    maxCumulativeEffect: 0.08,
    domain: 'ai_policy',
    costs: { reputation: 10, politicalCapital: 5 },
    researchSources: ['AI safety public opinion research'],
  }],
  ['promote_climate_action', {
    id: 'promote_climate_action',
    name: 'Promote Climate Action',
    description: 'Campaign to increase climate action support',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.climateActionSupport',
    baseEffect: 0.02,
    duration: 6,
    cooldown: 3,
    prerequisites: [],
    maxCumulativeEffect: 0.08,
    domain: 'climate_action',
    costs: { reputation: 10, politicalCapital: 5 },
    researchSources: ['Climate action public support research'],
  }],
  ['build_international_coalition', {
    id: 'build_international_coalition',
    name: 'Build International Coalition',
    description: 'Diplomatic effort to increase international cooperation',
    mechanism: 'coordination_boost',
    targetMetric: 'government.internationalCooperation',
    baseEffect: 0.03,
    duration: 12,
    cooldown: 6,
    prerequisites: [],
    maxCumulativeEffect: 0.10,
    domain: 'international_cooperation',
    costs: { reputation: 15, politicalCapital: 20, funding: 1.0 },
    researchSources: ['International cooperation frameworks'],
  }],
  ['fund_alignment_research', {
    id: 'fund_alignment_research',
    name: 'Fund Alignment Research',
    description: 'Shift research funding toward AI alignment',
    mechanism: 'funding_weight',
    targetMetric: 'government.researchInvestments.aiSafety',
    baseEffect: 0.04,
    duration: 12,
    cooldown: 6,
    prerequisites: [],
    maxCumulativeEffect: 0.10,
    domain: 'research_direction',
    costs: { politicalCapital: 15, funding: 0.5 },
    researchSources: ['Research funding allocation studies'],
  }],
  ['strengthen_social_cohesion', {
    id: 'strengthen_social_cohesion',
    name: 'Strengthen Social Cohesion',
    description: 'Community programs to improve social bonds',
    mechanism: 'trust_delta',
    targetMetric: 'society.socialCohesion',
    baseEffect: 0.02,
    duration: 6,
    cooldown: 3,
    prerequisites: [],
    maxCumulativeEffect: 0.08,
    domain: 'social_cohesion',
    costs: { reputation: 5, funding: 0.2 },
    researchSources: ['Social cohesion research'],
  }],
]);

/**
 * InfluenceCalculator class
 */
export class InfluenceCalculator {
  private gameLayerState: GameLayerState;

  constructor(gameLayerState: GameLayerState) {
    this.gameLayerState = gameLayerState;
  }

  /**
   * Get an action by ID
   */
  getAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
    return ACTION_CATALOG.get(actionId);
  }

  /**
   * Get all available actions
   */
  getAllActions(): AdvocacyAction[] {
    return Array.from(ACTION_CATALOG.values());
  }

  /**
   * Process an advocacy action
   */
  processAdvocacyAction(
    actionId: AdvocacyActionId,
    state: GameStateSnapshot | null
  ): QueueResult {
    const action = this.getAction(actionId);

    if (!action) {
      return {
        success: false,
        rejectionReason: `Action '${actionId}' not found in catalog`,
      };
    }

    // Check cooldown
    const cooldownEnd = this.gameLayerState.activeCooldowns[actionId];
    const currentMonth = state?.currentMonth ?? 0;

    if (cooldownEnd !== undefined && currentMonth < cooldownEnd) {
      return {
        success: false,
        rejectionReason: `Action '${actionId}' is on cooldown until month ${cooldownEnd}`,
      };
    }

    // Validate influence bounds
    const validation = this.validateInfluence(action);

    if (!validation.valid) {
      return {
        success: false,
        rejectionReason: validation.reason,
        validation,
      };
    }

    // Check prerequisites
    const prereqResult = this.checkPrerequisites(action, state);
    if (!prereqResult.met) {
      return {
        success: false,
        rejectionReason: `Prerequisites not met: ${prereqResult.missing.join(', ')}`,
      };
    }

    // Create player decision
    const decision = this.createDecision(action, currentMonth);

    // Update influence tracking
    this.applyInfluence(action);

    // Set cooldown
    this.gameLayerState.activeCooldowns[actionId] = currentMonth + action.cooldown;

    return {
      success: true,
      queuedDecision: decision,
      validation,
    };
  }

  /**
   * Validate influence bounds for an action
   */
  validateInfluence(action: AdvocacyAction): InfluenceValidationResult {
    const domain = action.domain;
    const currentDomainInfluence = this.gameLayerState.influenceByDomain[domain] || 0;
    const currentTotalInfluence = this.gameLayerState.totalInfluenceSpent;

    // Check single action limit
    if (action.baseEffect > INFLUENCE_BOUNDS.MAX_SINGLE_ACTION_EFFECT) {
      return {
        valid: false,
        reason: `Action effect ${action.baseEffect.toFixed(3)} exceeds single action limit ${INFLUENCE_BOUNDS.MAX_SINGLE_ACTION_EFFECT}`,
      };
    }

    // Check domain limit
    const newDomainInfluence = currentDomainInfluence + action.baseEffect;
    const domainLimit = INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT[domain];

    if (newDomainInfluence > domainLimit) {
      return {
        valid: false,
        reason: `Domain '${domain}' would exceed limit (${newDomainInfluence.toFixed(3)} > ${domainLimit})`,
        currentInfluence: {
          total: currentTotalInfluence,
          byDomain: { ...this.gameLayerState.influenceByDomain },
        },
      };
    }

    // Check cumulative limit
    const newTotalInfluence = currentTotalInfluence + action.baseEffect;

    if (newTotalInfluence > INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT) {
      return {
        valid: false,
        reason: `Total influence would exceed limit (${newTotalInfluence.toFixed(3)} > ${INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT})`,
        currentInfluence: {
          total: currentTotalInfluence,
          byDomain: { ...this.gameLayerState.influenceByDomain },
        },
      };
    }

    // Check action's own cumulative limit
    const actionHistory = this.getActionHistory(action.id);
    const actionCumulativeEffect = actionHistory.reduce((sum, d) => sum + (d.data.delta ?? 0), 0);

    if (actionCumulativeEffect + action.baseEffect > action.maxCumulativeEffect) {
      return {
        valid: false,
        reason: `Action '${action.id}' would exceed its cumulative limit (${(actionCumulativeEffect + action.baseEffect).toFixed(3)} > ${action.maxCumulativeEffect})`,
      };
    }

    return {
      valid: true,
      currentInfluence: {
        total: currentTotalInfluence,
        byDomain: { ...this.gameLayerState.influenceByDomain },
      },
      remainingBudget: {
        total: INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT - newTotalInfluence,
        byDomain: Object.fromEntries(
          Object.entries(INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT).map(([d, limit]) => [
            d,
            limit - (this.gameLayerState.influenceByDomain[d as InfluenceDomain] || 0) -
              (d === domain ? action.baseEffect : 0),
          ])
        ) as Record<InfluenceDomain, number>,
      },
    };
  }

  /**
   * Validate overall influence bounds
   */
  validateBounds(): ValidationResult {
    const issues: { severity: 'error' | 'warning' | 'info'; code: string; message: string; path?: string }[] = [];

    // Check total influence
    if (this.gameLayerState.totalInfluenceSpent > INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT) {
      issues.push({
        severity: 'error',
        code: 'INFLUENCE_EXCEEDED',
        message: `Total influence ${this.gameLayerState.totalInfluenceSpent.toFixed(3)} exceeds limit ${INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT}`,
      });
    }

    // Check per-domain limits
    for (const [domain, spent] of Object.entries(this.gameLayerState.influenceByDomain)) {
      const limit = INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT[domain as InfluenceDomain];
      if (spent > limit) {
        issues.push({
          severity: 'error',
          code: 'DOMAIN_INFLUENCE_EXCEEDED',
          message: `Domain '${domain}' influence ${spent.toFixed(3)} exceeds limit ${limit}`,
          path: `influenceByDomain.${domain}`,
        });
      }
    }

    // Warnings for high influence usage
    const usageRatio = this.gameLayerState.totalInfluenceSpent / INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT;
    if (usageRatio > 0.9 && usageRatio <= 1.0) {
      issues.push({
        severity: 'warning',
        code: 'INFLUENCE_NEAR_LIMIT',
        message: `Influence usage at ${(usageRatio * 100).toFixed(1)}% - approaching limit`,
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
    };
  }

  /**
   * Create player decision from action
   */
  private createDecision(action: AdvocacyAction, currentMonth: number): PlayerDecision {
    switch (action.mechanism) {
      case 'sentiment_shift':
      case 'trust_delta':
        return {
          type: 'policy',
          data: {
            actionType: action.mechanism,
            metricPath: action.targetMetric,
            delta: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };

      case 'funding_weight':
        return {
          type: 'investment',
          data: {
            actionType: 'funding_weight',
            category: action.targetMetric,
            weight: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };

      case 'coordination_boost':
        return {
          type: 'policy',
          data: {
            actionType: 'coordination_boost',
            metricPath: action.targetMetric,
            delta: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };

      case 'policy_adoption':
        return {
          type: 'policy',
          data: {
            actionType: 'policy_adoption',
            metricPath: action.targetMetric,
            delta: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };

      case 'private_sector_weight':
        return {
          type: 'investment',
          data: {
            actionType: 'private_sector_weight',
            category: action.targetMetric,
            weight: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };

      default:
        // Fallback
        return {
          type: 'policy',
          data: {
            actionType: action.mechanism,
            metricPath: action.targetMetric,
            delta: action.baseEffect,
            duration: action.duration,
          },
          timestamp: currentMonth,
        };
    }
  }

  /**
   * Apply influence to tracking
   */
  private applyInfluence(action: AdvocacyAction): void {
    this.gameLayerState.totalInfluenceSpent += action.baseEffect;
    this.gameLayerState.influenceByDomain[action.domain] =
      (this.gameLayerState.influenceByDomain[action.domain] || 0) + action.baseEffect;
  }

  /**
   * Check action prerequisites
   */
  private checkPrerequisites(
    action: AdvocacyAction,
    state: GameStateSnapshot | null
  ): { met: boolean; missing: string[] } {
    if (!action.prerequisites || action.prerequisites.length === 0) {
      return { met: true, missing: [] };
    }

    if (!state) {
      return {
        met: false,
        missing: ['No simulation state available'],
      };
    }

    const missing: string[] = [];

    for (const prereq of action.prerequisites) {
      const value = this.getStatePath(state, prereq.path);

      if (value === undefined) {
        missing.push(prereq.description);
        continue;
      }

      let met = false;
      // Compare values - null is handled above via undefined check
      const numValue = value as number | string | boolean;
      switch (prereq.operator) {
        case 'gt': met = numValue > prereq.value; break;
        case 'gte': met = numValue >= prereq.value; break;
        case 'lt': met = numValue < prereq.value; break;
        case 'lte': met = numValue <= prereq.value; break;
        case 'eq': met = numValue === prereq.value; break;
      }

      if (!met) {
        missing.push(prereq.description);
      }
    }

    return { met: missing.length === 0, missing };
  }

  /**
   * Get value at state path
   */
  private getStatePath(state: GameStateSnapshot, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = state;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  /**
   * Get history of a specific action
   * Uses exact matching for actionType, or path segment matching for metricPath
   * (e.g., "ai_policy" matches "government.ai_policy" but not "climate_action")
   */
  private getActionHistory(actionId: string): PlayerDecision[] {
    return this.gameLayerState.decisionHistory.filter(
      d => d.data.actionType === actionId ||
           // Use path segment matching: match if path ends with actionId or contains it as a segment
           (d.data.metricPath && (
             d.data.metricPath === actionId ||
             d.data.metricPath.endsWith(`.${actionId}`) ||
             d.data.metricPath.startsWith(`${actionId}.`)
           ))
    );
  }
}
