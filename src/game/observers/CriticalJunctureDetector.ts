/**
 * CriticalJunctureDetector - Detect intervention windows
 *
 * Identifies moments where player action can have outsized impact.
 * These are research-backed intervention windows based on:
 * - Tipping point proximity
 * - Policy windows
 * - Crisis inflection points
 * - Social movement momentum
 */

import type {
  GameStateSnapshot,
  JunctureEvent,
  GameLayerEventHandler,
  EventSubscription,
} from '../types';

/**
 * Juncture type classification
 */
export type JunctureType =
  | 'policy_window'      // Government receptive to policy change
  | 'tech_window'        // Technology adoption opportunity
  | 'social_window'      // Social movement gaining momentum
  | 'crisis_inflection'; // Crisis at decision point

/**
 * Juncture detection rule
 */
interface JunctureRule {
  id: string;
  type: JunctureType;
  name: string;
  description: string;
  condition: (state: GameStateSnapshot) => boolean;
  windowDuration: number;
  actions: string[];
}

/**
 * Active juncture tracking
 */
interface ActiveJuncture {
  rule: JunctureRule;
  detectedMonth: number;
  expiresMonth: number;
}

/**
 * CriticalJunctureDetector class
 */
export class CriticalJunctureDetector {
  private handlers: Set<GameLayerEventHandler<JunctureEvent>> = new Set();
  private activeJunctures: Map<string, ActiveJuncture> = new Map();
  private rules: JunctureRule[] = [];
  private eventIdCounter: number = 0;

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize detection rules
   */
  private initializeRules(): void {
    this.rules = [
      {
        id: 'climate_policy_window',
        type: 'policy_window',
        name: 'Climate Policy Window',
        description: 'Public concern high and government receptive to climate action',
        condition: (state) => {
          const society = (state as Record<string, unknown>).humanSociety as Record<string, unknown> | undefined;
          const government = (state as Record<string, unknown>).government as Record<string, unknown> | undefined;

          const climateAwareness = (society?.climateAwareness as number) ?? 0.5;
          const policyOpenness = (government?.policyOpenness as number) ?? 0.5;

          return climateAwareness > 0.7 && policyOpenness > 0.6;
        },
        windowDuration: 6,
        actions: ['promote_climate_action', 'build_international_coalition'],
      },
      {
        id: 'ai_safety_moment',
        type: 'tech_window',
        name: 'AI Safety Moment',
        description: 'AI development at critical juncture where safety investment matters',
        condition: (state) => {
          const aiAgents = (state as Record<string, unknown>).aiAgents as Array<Record<string, unknown>> | undefined;

          if (!aiAgents || aiAgents.length === 0) return false;

          // Check if any AI is approaching high capability
          const approachingThreshold = aiAgents.some(agent => {
            const capability = (agent.overallCapability as number) ?? 0;
            return capability > 0.6 && capability < 0.8;
          });

          return approachingThreshold;
        },
        windowDuration: 12,
        actions: ['advocate_ai_safety', 'fund_alignment_research'],
      },
      {
        id: 'social_cohesion_crisis',
        type: 'crisis_inflection',
        name: 'Social Cohesion Crisis',
        description: 'Social stability declining but recoverable with intervention',
        condition: (state) => {
          const society = (state as Record<string, unknown>).humanSociety as Record<string, unknown> | undefined;

          const cohesion = (society?.socialCohesion as number) ?? 0.5;
          const trust = (society?.trustInInstitutions as number) ?? 0.5;

          return cohesion < 0.4 && cohesion > 0.2 && trust > 0.3;
        },
        windowDuration: 6,
        actions: ['strengthen_social_cohesion'],
      },
      {
        id: 'international_cooperation_opportunity',
        type: 'policy_window',
        name: 'International Cooperation Opportunity',
        description: 'Global conditions favorable for international agreements',
        condition: (state) => {
          const government = (state as Record<string, unknown>).government as Record<string, unknown> | undefined;
          const globalMetrics = (state as Record<string, unknown>).globalMetrics as Record<string, unknown> | undefined;

          const cooperation = (government?.internationalCooperation as number) ?? 0.5;
          const conflictLevel = (globalMetrics?.conflictIntensity as number) ?? 0.5;

          return cooperation > 0.5 && conflictLevel < 0.4;
        },
        windowDuration: 12,
        actions: ['build_international_coalition'],
      },
      {
        id: 'tipping_point_proximity',
        type: 'crisis_inflection',
        name: 'Tipping Point Warning',
        description: 'Approaching planetary tipping point - intervention critical',
        condition: (state) => {
          const tippingPoints = (state as Record<string, unknown>).tippingPointSystem as Record<string, unknown> | undefined;
          const elements = tippingPoints?.elements as Record<string, Record<string, unknown>> | undefined;

          if (!elements) return false;

          // Check if any tipping point is approaching critical
          for (const element of Object.values(elements)) {
            const progress = (element.progressToTip as number) ?? 0;
            if (progress > 0.7 && progress < 0.9) {
              return true;
            }
          }

          return false;
        },
        windowDuration: 6,
        actions: ['promote_climate_action', 'build_international_coalition'],
      },
    ];
  }

  /**
   * Subscribe to juncture events
   */
  onCriticalJuncture(handler: GameLayerEventHandler<JunctureEvent>): EventSubscription {
    this.handlers.add(handler);
    return {
      unsubscribe: () => { this.handlers.delete(handler); }
    };
  }

  /**
   * Analyze state for critical junctures
   */
  analyzeState(state: GameStateSnapshot): void {
    const currentMonth = state.currentMonth ?? 0;

    // Check for expired junctures
    for (const [id, juncture] of this.activeJunctures.entries()) {
      if (currentMonth >= juncture.expiresMonth) {
        this.activeJunctures.delete(id);
      }
    }

    // Check rules for new junctures
    for (const rule of this.rules) {
      // Skip if already active
      if (this.activeJunctures.has(rule.id)) {
        continue;
      }

      // Check condition
      if (rule.condition(state)) {
        const juncture: ActiveJuncture = {
          rule,
          detectedMonth: currentMonth,
          expiresMonth: currentMonth + rule.windowDuration,
        };

        this.activeJunctures.set(rule.id, juncture);
        this.emitJunctureEvent(juncture, currentMonth);
      }
    }
  }

  /**
   * Get currently active junctures
   */
  getActiveJunctures(): Array<{
    id: string;
    type: JunctureType;
    name: string;
    description: string;
    monthsRemaining: number;
    actions: string[];
  }> {
    const result: Array<{
      id: string;
      type: JunctureType;
      name: string;
      description: string;
      monthsRemaining: number;
      actions: string[];
    }> = [];

    for (const juncture of this.activeJunctures.values()) {
      const currentMonth = juncture.detectedMonth; // Would need state to be accurate
      result.push({
        id: juncture.rule.id,
        type: juncture.rule.type,
        name: juncture.rule.name,
        description: juncture.rule.description,
        monthsRemaining: juncture.expiresMonth - currentMonth,
        actions: juncture.rule.actions,
      });
    }

    return result;
  }

  /**
   * Check if a specific juncture is active
   */
  isJunctureActive(id: string): boolean {
    return this.activeJunctures.has(id);
  }

  /**
   * Get time remaining for a juncture
   */
  getTimeRemaining(id: string, currentMonth: number): number | null {
    const juncture = this.activeJunctures.get(id);
    if (!juncture) return null;
    return Math.max(0, juncture.expiresMonth - currentMonth);
  }

  /**
   * Emit juncture event
   */
  private emitJunctureEvent(juncture: ActiveJuncture, currentMonth: number): void {
    const event: JunctureEvent = {
      id: `juncture_${++this.eventIdCounter}_${Date.now()}`,
      month: currentMonth,
      type: 'critical_juncture',
      severity: 'warning',
      title: juncture.rule.name,
      description: juncture.rule.description,
      actionable: true,
      suggestedActions: juncture.rule.actions,
      junctureType: juncture.rule.type,
      windowDuration: juncture.rule.windowDuration,
      potentialImpact: {
        optimistic: 'Timely action could significantly improve trajectory',
        pessimistic: 'Missing this window may limit future options',
      },
      availableActions: juncture.rule.actions,
    };

    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (e) {
        console.error('Juncture handler error:', e);
      }
    }
  }
}
