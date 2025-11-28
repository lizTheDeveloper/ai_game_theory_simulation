/**
 * SimulationObserver - Subscribe to simulation events
 *
 * Provides event subscription interface for the game layer.
 * Converts simulation events to game layer events.
 *
 * CRITICAL: Read-only observation only - never mutates simulation state.
 */

import type {
  GameStateSnapshot,
  SimulationEvent,
  GameLayerEvent,
  CrisisEvent,
  TechnologyEvent,
  OutcomeEvent,
  BoundaryEvent,
  JunctureEvent,
  GameLayerEventHandler,
  EventSubscription,
  AggregateMetrics,
} from '../types';

/**
 * Event filter function type
 */
type EventFilter<T extends GameLayerEvent> = (event: SimulationEvent) => T | null;

/**
 * SimulationObserver interface
 */
export interface ISimulationObserver {
  onCrisisDetected(handler: GameLayerEventHandler<CrisisEvent>): EventSubscription;
  onTechnologyUnlocked(handler: GameLayerEventHandler<TechnologyEvent>): EventSubscription;
  onOutcomeShift(handler: GameLayerEventHandler<OutcomeEvent>): EventSubscription;
  onPlanetaryBoundaryChange(handler: GameLayerEventHandler<BoundaryEvent>): EventSubscription;
  onCriticalJuncture(handler: GameLayerEventHandler<JunctureEvent>): EventSubscription;
  getAggregateMetrics(): AggregateMetrics;
}

/**
 * SimulationObserver class
 */
export class SimulationObserver implements ISimulationObserver {
  private crisisHandlers: Set<GameLayerEventHandler<CrisisEvent>> = new Set();
  private techHandlers: Set<GameLayerEventHandler<TechnologyEvent>> = new Set();
  private outcomeHandlers: Set<GameLayerEventHandler<OutcomeEvent>> = new Set();
  private boundaryHandlers: Set<GameLayerEventHandler<BoundaryEvent>> = new Set();
  private junctureHandlers: Set<GameLayerEventHandler<JunctureEvent>> = new Set();

  private currentState: GameStateSnapshot | null = null;
  private previousOutcome: string | null = null;
  private eventIdCounter: number = 0;

  /**
   * Update with new simulation state
   *
   * Called externally when simulation state changes.
   * Analyzes state and emits appropriate events.
   */
  updateState(state: GameStateSnapshot): void {
    const previousState = this.currentState;
    this.currentState = state;

    if (previousState) {
      this.detectChanges(previousState, state);
    }
  }

  /**
   * Process a simulation event
   *
   * Converts simulation events to game layer events
   */
  processEvent(event: SimulationEvent): void {
    // Convert to crisis event if applicable
    if (event.type === 'crisis' || event.type === 'catastrophe') {
      const crisisEvent = this.convertToCrisisEvent(event);
      if (crisisEvent) {
        this.emitCrisisEvent(crisisEvent);
      }
    }

    // Convert to technology event if applicable
    if (event.type === 'technology' || event.type === 'breakthrough') {
      const techEvent = this.convertToTechnologyEvent(event);
      if (techEvent) {
        this.emitTechnologyEvent(techEvent);
      }
    }
  }

  // === Subscription Methods ===

  onCrisisDetected(handler: GameLayerEventHandler<CrisisEvent>): EventSubscription {
    this.crisisHandlers.add(handler);
    return {
      unsubscribe: () => { this.crisisHandlers.delete(handler); }
    };
  }

  onTechnologyUnlocked(handler: GameLayerEventHandler<TechnologyEvent>): EventSubscription {
    this.techHandlers.add(handler);
    return {
      unsubscribe: () => { this.techHandlers.delete(handler); }
    };
  }

  onOutcomeShift(handler: GameLayerEventHandler<OutcomeEvent>): EventSubscription {
    this.outcomeHandlers.add(handler);
    return {
      unsubscribe: () => { this.outcomeHandlers.delete(handler); }
    };
  }

  onPlanetaryBoundaryChange(handler: GameLayerEventHandler<BoundaryEvent>): EventSubscription {
    this.boundaryHandlers.add(handler);
    return {
      unsubscribe: () => { this.boundaryHandlers.delete(handler); }
    };
  }

  onCriticalJuncture(handler: GameLayerEventHandler<JunctureEvent>): EventSubscription {
    this.junctureHandlers.add(handler);
    return {
      unsubscribe: () => { this.junctureHandlers.delete(handler); }
    };
  }

  // === Aggregate Metrics ===

  getAggregateMetrics(): AggregateMetrics {
    if (!this.currentState) {
      return {
        currentMonth: 0,
        outcomeClassification: 'unknown',
        overallQoL: 0,
        environmentalHealth: 0,
        coordinationLevel: 0.5,
        socialStability: 0,
        aiAlignmentStatus: 0,
        governanceEffectiveness: 0,
        influenceRemaining: 0.15,
        activeCrises: 0,
        breachedBoundaries: 0,
      };
    }

    // Delegate to OutcomeInterpreter logic (duplicated here to avoid circular dependency)
    return this.computeMetrics(this.currentState);
  }

  // === Private Methods ===

  private generateEventId(): string {
    return `game_event_${++this.eventIdCounter}_${Date.now()}`;
  }

  private detectChanges(prev: GameStateSnapshot, curr: GameStateSnapshot): void {
    // Detect outcome changes
    const prevOutcome = this.getOutcomeClassification(prev);
    const currOutcome = this.getOutcomeClassification(curr);

    if (prevOutcome !== currOutcome) {
      this.emitOutcomeEvent({
        id: this.generateEventId(),
        month: curr.currentMonth ?? 0,
        type: 'outcome_shift',
        severity: currOutcome === 'extinction' ? 'critical' : 'warning',
        title: 'Trajectory Change Detected',
        description: `Outcome trajectory shifted from ${prevOutcome} to ${currOutcome}`,
        actionable: true,
        previousOutcome: prevOutcome,
        newOutcome: currOutcome,
        direction: this.compareOutcomes(prevOutcome, currOutcome),
        keyFactors: this.identifyKeyFactors(prev, curr),
      });
    }

    // Detect boundary changes
    this.detectBoundaryChanges(prev, curr);
  }

  private detectBoundaryChanges(prev: GameStateSnapshot, curr: GameStateSnapshot): void {
    const prevBoundaries = this.getBoundaryStatuses(prev);
    const currBoundaries = this.getBoundaryStatuses(curr);

    for (const [name, currStatus] of Object.entries(currBoundaries)) {
      const prevStatus = prevBoundaries[name];

      if (prevStatus && prevStatus !== currStatus) {
        this.emitBoundaryEvent({
          id: this.generateEventId(),
          month: curr.currentMonth ?? 0,
          type: 'boundary_change',
          severity: currStatus === 'critical' ? 'critical' : currStatus === 'danger' ? 'danger' : 'warning',
          title: `Planetary Boundary: ${name}`,
          description: `${name} status changed from ${prevStatus} to ${currStatus}`,
          actionable: currStatus !== 'safe',
          boundaryName: name,
          previousStatus: prevStatus as 'safe' | 'warning' | 'danger' | 'critical',
          newStatus: currStatus as 'safe' | 'warning' | 'danger' | 'critical',
          reversible: currStatus !== 'critical',
        });
      }
    }
  }

  private convertToCrisisEvent(event: SimulationEvent): CrisisEvent | null {
    return {
      id: this.generateEventId(),
      month: event.timestamp,
      type: 'crisis_detected',
      severity: this.mapSeverity(event.severity),
      title: event.title,
      description: event.description,
      actionable: true,
      domain: this.inferDomain(event),
      crisisSeverity: this.mapCrisisSeverity(event.severity),
      responseWindow: 6,
      projectedImpact: [],
    };
  }

  private convertToTechnologyEvent(event: SimulationEvent): TechnologyEvent | null {
    return {
      id: this.generateEventId(),
      month: event.timestamp,
      type: 'technology_unlocked',
      severity: 'success',
      title: event.title,
      description: event.description,
      actionable: false,
      techId: String(event.effects['technologyId'] ?? 'unknown'),
      techName: event.title,
      tier: Number(event.effects['tier'] ?? 0),
      category: String(event.effects['category'] ?? 'general'),
      effects: [],
    };
  }

  private mapSeverity(severity: string): 'info' | 'success' | 'warning' | 'danger' | 'critical' {
    switch (severity) {
      case 'existential':
      case 'critical': return 'critical';
      case 'destructive':
      case 'high': return 'danger';
      case 'warning':
      case 'medium': return 'warning';
      case 'positive':
      case 'constructive':
      case 'transformative': return 'success';
      default: return 'info';
    }
  }

  private mapCrisisSeverity(severity: string): 'minor' | 'moderate' | 'severe' | 'catastrophic' {
    switch (severity) {
      case 'existential': return 'catastrophic';
      case 'critical':
      case 'destructive': return 'severe';
      case 'high':
      case 'warning': return 'moderate';
      default: return 'minor';
    }
  }

  private inferDomain(event: SimulationEvent): 'environmental' | 'social' | 'technological' | 'political' | 'economic' {
    const type = event.type.toLowerCase();
    const title = event.title.toLowerCase();

    if (type.includes('environ') || title.includes('climate') || title.includes('ecological')) {
      return 'environmental';
    }
    if (type.includes('tech') || title.includes('ai') || title.includes('technology')) {
      return 'technological';
    }
    if (type.includes('government') || title.includes('policy') || title.includes('political')) {
      return 'political';
    }
    if (title.includes('economic') || title.includes('market') || title.includes('trade')) {
      return 'economic';
    }
    return 'social';
  }

  private getOutcomeClassification(state: GameStateSnapshot): string {
    const outcomeMetrics = (state as Record<string, unknown>).outcomeMetrics as Record<string, unknown> | undefined;
    return String(outcomeMetrics?.outcomeClassification ?? 'unknown');
  }

  private compareOutcomes(prev: string, curr: string): 'improving' | 'worsening' {
    const order = ['extinction', 'collapse', 'decline', 'struggling', 'stable', 'prosperity', 'nearUtopia', 'utopia'];
    const prevIdx = order.indexOf(prev);
    const currIdx = order.indexOf(curr);
    return currIdx > prevIdx ? 'improving' : 'worsening';
  }

  private identifyKeyFactors(_prev: GameStateSnapshot, _curr: GameStateSnapshot): string[] {
    // Simplified - would analyze actual state differences
    return ['Multiple factors contributed to this change'];
  }

  private getBoundaryStatuses(state: GameStateSnapshot): Record<string, string> {
    const tippingPoints = (state as Record<string, unknown>).tippingPointSystem as Record<string, unknown> | undefined;
    const elements = tippingPoints?.elements as Record<string, Record<string, unknown>> | undefined;

    if (!elements) return {};

    const statuses: Record<string, string> = {};
    for (const [name, element] of Object.entries(elements)) {
      statuses[name] = String(element.status ?? 'unknown');
    }
    return statuses;
  }

  private computeMetrics(state: GameStateSnapshot): AggregateMetrics {
    // Extract real values from GameStateSnapshot
    // Each uses optional chaining with sensible fallbacks for undefined states

    // Quality of Life from globalMetrics
    const overallQoL = (state as Record<string, unknown>).globalMetrics
      ? ((state as Record<string, unknown>).globalMetrics as Record<string, number>).qualityOfLife ?? 0.5
      : 0.5;

    // Environmental health from climate stability or environmental accumulation
    const envAccum = (state as Record<string, unknown>).environmentalAccumulation as Record<string, number> | undefined;
    const environmentalHealth = envAccum?.climateStability ?? 0.5;

    // International coordination level from globalMetrics
    const globalMetrics = (state as Record<string, unknown>).globalMetrics as Record<string, number> | undefined;
    const coordinationLevel = globalMetrics?.coordinationLevel ?? 0.5;

    // Social stability from society system
    const society = (state as Record<string, unknown>).society as Record<string, number> | undefined;
    const socialStability = society?.trust ?? society?.stability ?? 0.5;

    // AI alignment status from average AI agent alignment
    const aiAgents = (state as Record<string, unknown>).aiAgents as Array<Record<string, number>> | undefined;
    const aiAlignmentStatus = aiAgents && aiAgents.length > 0
      ? aiAgents.reduce((sum, agent) => sum + (agent.alignment ?? 0.5), 0) / aiAgents.length
      : 0.5;

    // Governance effectiveness from government system
    const govSystem = (state as Record<string, unknown>).governmentSystem as Record<string, number> | undefined;
    const governanceEffectiveness = govSystem?.internationalCoordination ?? govSystem?.governanceScore ?? 0.5;

    // Count active crises from event log or crisis state
    const eventLog = (state as Record<string, unknown>).eventLog as Array<Record<string, unknown>> | undefined;
    const activeCrises = eventLog
      ? eventLog.filter(e => e.type === 'crisis' && e.resolved !== true).length
      : 0;

    // Count breached planetary boundaries from tipping point system
    const tippingPoints = (state as Record<string, unknown>).tippingPointSystem as Record<string, unknown> | undefined;
    const elements = tippingPoints?.elements as Record<string, Record<string, string>> | undefined;
    const breachedBoundaries = elements
      ? Object.values(elements).filter(el => el.status === 'breached' || el.status === 'collapsed').length
      : 0;

    return {
      currentMonth: state.currentMonth ?? 0,
      outcomeClassification: this.getOutcomeClassification(state),
      overallQoL,
      environmentalHealth,
      coordinationLevel,
      socialStability,
      aiAlignmentStatus,
      governanceEffectiveness,
      influenceRemaining: 0.15, // Player influence is managed separately
      activeCrises,
      breachedBoundaries,
    };
  }

  // === Event Emission ===

  private emitCrisisEvent(event: CrisisEvent): void {
    for (const handler of this.crisisHandlers) {
      try { handler(event); } catch (e) { console.error('Crisis handler error:', e); }
    }
  }

  private emitTechnologyEvent(event: TechnologyEvent): void {
    for (const handler of this.techHandlers) {
      try { handler(event); } catch (e) { console.error('Tech handler error:', e); }
    }
  }

  private emitOutcomeEvent(event: OutcomeEvent): void {
    for (const handler of this.outcomeHandlers) {
      try { handler(event); } catch (e) { console.error('Outcome handler error:', e); }
    }
  }

  private emitBoundaryEvent(event: BoundaryEvent): void {
    for (const handler of this.boundaryHandlers) {
      try { handler(event); } catch (e) { console.error('Boundary handler error:', e); }
    }
  }
}
