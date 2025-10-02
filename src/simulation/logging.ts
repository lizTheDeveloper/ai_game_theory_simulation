/**
 * Hierarchical logging and summarization for simulations
 * 
 * Provides multiple levels of granularity:
 * - Full trace (every step)
 * - Monthly summaries (key metrics each month)
 * - Quartile summaries (every 25% of simulation)
 * - Final summary (end state only)
 */

import { GameState, GameEvent } from '@/types/game';

/**
 * Log levels for different use cases
 */
export type LogLevel = 'full' | 'monthly' | 'quartile' | 'summary';

/**
 * Snapshot of key metrics at a point in time
 */
export interface MetricSnapshot {
  month: number;
  
  // AI metrics
  totalAICapability: number;
  avgAIAlignment: number;
  aiEscaped: number;
  beneficialActions: number;
  harmfulActions: number;
  
  // Economic metrics
  unemployment: number;
  economicStage: number;
  wealthDistribution: number;
  qualityOfLife: number;
  
  // Social metrics
  trustInAI: number;
  socialAdaptation: number;
  socialStability: number;
  
  // Government metrics
  effectiveControl: number;
  activeRegulations: number;
  governmentLegitimacy: number;
  
  // Outcomes
  utopiaProbability: number;
  dystopiaProbability: number;
  extinctionProbability: number;
}

/**
 * Event summary (aggregated events for a period)
 */
export interface EventSummary {
  period: string; // e.g. "Months 0-10"
  totalEvents: number;
  eventsByType: Record<string, number>;
  criticalEvents: Array<{
    month: number;
    severity: string;
    title: string;
    agent: string;
  }>;
}

/**
 * Hierarchical simulation log
 */
export interface SimulationLog {
  metadata: {
    seed: number;
    startTime: number;
    endTime?: number;
    totalMonths: number;
    outcome: string;
  };
  
  // Different levels of detail
  snapshots: {
    initial: MetricSnapshot;
    monthly?: MetricSnapshot[];
    quartiles?: MetricSnapshot[];
    final: MetricSnapshot;
  };
  
  events: {
    summary: EventSummary;
    quartileSummaries?: EventSummary[];
    criticalEvents: GameEvent[];
  };
  
  trajectory: {
    aiCapabilityGrowth: number;
    unemploymentChange: number;
    trustChange: number;
    stageProgression: number;
  };
}

/**
 * Logger that accumulates data during simulation
 */
export class SimulationLogger {
  private logLevel: LogLevel;
  private snapshots: MetricSnapshot[] = [];
  private events: GameEvent[] = [];
  private startTime: number;
  private seed: number;
  private totalMonths: number = 0;
  
  constructor(seed: number, logLevel: LogLevel = 'monthly', estimatedMonths: number = 100) {
    this.logLevel = logLevel;
    this.seed = seed;
    this.startTime = Date.now();
    this.totalMonths = estimatedMonths;
  }
  
  /**
   * Create a metric snapshot from current state
   */
  private createSnapshot(state: GameState): MetricSnapshot {
    const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const avgAIAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    const aiEscaped = state.aiAgents.filter(ai => ai.escaped).length;
    const beneficialActions = state.aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
    const harmfulActions = state.aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
    
    // Calculate effective control
    const effectiveControl = state.government.controlDesire * state.government.capabilityToControl / 
      (1 + Math.pow(totalAICapability, 1.5));
    
    return {
      month: state.currentMonth,
      totalAICapability,
      avgAIAlignment,
      aiEscaped,
      beneficialActions,
      harmfulActions,
      unemployment: state.society.unemploymentLevel,
      economicStage: state.globalMetrics.economicTransitionStage,
      wealthDistribution: state.globalMetrics.wealthDistribution,
      qualityOfLife: state.globalMetrics.qualityOfLife,
      trustInAI: state.society.trustInAI,
      socialAdaptation: state.society.socialAdaptation,
      socialStability: state.globalMetrics.socialStability,
      effectiveControl,
      activeRegulations: state.government.activeRegulations.length,
      governmentLegitimacy: state.government.legitimacy,
      utopiaProbability: state.outcomeMetrics.utopiaProbability,
      dystopiaProbability: state.outcomeMetrics.dystopiaProbability,
      extinctionProbability: state.outcomeMetrics.extinctionProbability
    };
  }
  
  /**
   * Log a step (called each simulation step)
   */
  logStep(state: GameState, events: GameEvent[]): void {
    // Always track events
    this.events.push(...events);
    
    // Log snapshot based on level
    switch (this.logLevel) {
      case 'full':
        // Every step
        this.snapshots.push(this.createSnapshot(state));
        break;
      case 'monthly':
        // Once per month
        if (state.currentDay === 1 || this.snapshots.length === 0) {
          this.snapshots.push(this.createSnapshot(state));
        }
        break;
      case 'quartile':
        // Capture at 0%, 25%, 50%, 75%, 100%
        const quartileInterval = Math.max(1, Math.floor(this.totalMonths / 4));
        if (this.snapshots.length === 0 || 
            state.currentMonth % quartileInterval === 0) {
          this.snapshots.push(this.createSnapshot(state));
        }
        break;
      case 'summary':
        // Just initial and final
        if (this.snapshots.length === 0) {
          this.snapshots.push(this.createSnapshot(state));
        }
        break;
    }
  }
  
  /**
   * Finalize and return hierarchical log
   */
  finalize(finalState: GameState, outcome: string): SimulationLog {
    const finalSnapshot = this.createSnapshot(finalState);
    const initialSnapshot = this.snapshots[0];
    
    // Extract quartile snapshots if needed
    const quartileSnapshots: MetricSnapshot[] = [];
    if (this.snapshots.length > 4) {
      const step = Math.floor(this.snapshots.length / 4);
      for (let i = 0; i < 4; i++) {
        quartileSnapshots.push(this.snapshots[Math.min(i * step, this.snapshots.length - 1)]);
      }
      quartileSnapshots.push(finalSnapshot);
    }
    
    // Summarize events
    const eventsByType: Record<string, number> = {};
    const criticalEvents: GameEvent[] = [];
    
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      if (event.severity === 'destructive' || event.type === 'crisis') {
        criticalEvents.push(event);
      }
    });
    
    const eventSummary: EventSummary = {
      period: `Months 0-${finalState.currentMonth}`,
      totalEvents: this.events.length,
      eventsByType,
      criticalEvents: criticalEvents.map(e => ({
        month: e.timestamp,
        severity: e.severity,
        title: e.title,
        agent: e.agent
      }))
    };
    
    // Calculate trajectory
    const trajectory = {
      aiCapabilityGrowth: finalSnapshot.totalAICapability - initialSnapshot.totalAICapability,
      unemploymentChange: finalSnapshot.unemployment - initialSnapshot.unemployment,
      trustChange: finalSnapshot.trustInAI - initialSnapshot.trustInAI,
      stageProgression: finalSnapshot.economicStage - initialSnapshot.economicStage
    };
    
    return {
      metadata: {
        seed: this.seed,
        startTime: this.startTime,
        endTime: Date.now(),
        totalMonths: finalState.currentMonth,
        outcome
      },
      snapshots: {
        initial: initialSnapshot,
        monthly: this.logLevel === 'monthly' || this.logLevel === 'full' ? this.snapshots : undefined,
        quartiles: quartileSnapshots.length > 0 ? quartileSnapshots : undefined,
        final: finalSnapshot
      },
      events: {
        summary: eventSummary,
        criticalEvents: criticalEvents.slice(0, 10) // Top 10 critical events
      },
      trajectory
    };
  }
}

/**
 * Aggregate multiple simulation logs
 */
export function aggregateLogs(logs: SimulationLog[]): {
  totalRuns: number;
  outcomes: Record<string, number>;
  averageTrajectories: {
    aiCapabilityGrowth: { mean: number; std: number };
    unemploymentChange: { mean: number; std: number };
    trustChange: { mean: number; std: number };
    stageProgression: { mean: number; std: number };
  };
  quartileAverages: MetricSnapshot[];
  eventFrequencies: Record<string, number>;
} {
  const outcomes: Record<string, number> = {};
  const trajectories = {
    aiCapability: [] as number[],
    unemployment: [] as number[],
    trust: [] as number[],
    stage: [] as number[]
  };
  const eventFrequencies: Record<string, number> = {};
  
  // Aggregate outcomes and trajectories
  logs.forEach(log => {
    outcomes[log.metadata.outcome] = (outcomes[log.metadata.outcome] || 0) + 1;
    
    trajectories.aiCapability.push(log.trajectory.aiCapabilityGrowth);
    trajectories.unemployment.push(log.trajectory.unemploymentChange);
    trajectories.trust.push(log.trajectory.trustChange);
    trajectories.stage.push(log.trajectory.stageProgression);
    
    // Aggregate event types
    Object.entries(log.events.summary.eventsByType).forEach(([type, count]) => {
      eventFrequencies[type] = (eventFrequencies[type] || 0) + count;
    });
  });
  
  // Calculate statistics
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / arr.length);
  };
  
  // Calculate quartile averages across all runs
  const quartileAverages: MetricSnapshot[] = [];
  const numQuartiles = 5; // Initial + 4 quartiles
  
  for (let q = 0; q < numQuartiles; q++) {
    const snapshotsAtQuartile = logs
      .map(log => log.snapshots.quartiles?.[q])
      .filter(s => s !== undefined) as MetricSnapshot[];
    
    if (snapshotsAtQuartile.length > 0) {
      quartileAverages.push({
        month: Math.round(mean(snapshotsAtQuartile.map(s => s.month))),
        totalAICapability: mean(snapshotsAtQuartile.map(s => s.totalAICapability)),
        avgAIAlignment: mean(snapshotsAtQuartile.map(s => s.avgAIAlignment)),
        aiEscaped: mean(snapshotsAtQuartile.map(s => s.aiEscaped)),
        beneficialActions: mean(snapshotsAtQuartile.map(s => s.beneficialActions)),
        harmfulActions: mean(snapshotsAtQuartile.map(s => s.harmfulActions)),
        unemployment: mean(snapshotsAtQuartile.map(s => s.unemployment)),
        economicStage: mean(snapshotsAtQuartile.map(s => s.economicStage)),
        wealthDistribution: mean(snapshotsAtQuartile.map(s => s.wealthDistribution)),
        qualityOfLife: mean(snapshotsAtQuartile.map(s => s.qualityOfLife)),
        trustInAI: mean(snapshotsAtQuartile.map(s => s.trustInAI)),
        socialAdaptation: mean(snapshotsAtQuartile.map(s => s.socialAdaptation)),
        socialStability: mean(snapshotsAtQuartile.map(s => s.socialStability)),
        effectiveControl: mean(snapshotsAtQuartile.map(s => s.effectiveControl)),
        activeRegulations: mean(snapshotsAtQuartile.map(s => s.activeRegulations)),
        governmentLegitimacy: mean(snapshotsAtQuartile.map(s => s.governmentLegitimacy)),
        utopiaProbability: mean(snapshotsAtQuartile.map(s => s.utopiaProbability)),
        dystopiaProbability: mean(snapshotsAtQuartile.map(s => s.dystopiaProbability)),
        extinctionProbability: mean(snapshotsAtQuartile.map(s => s.extinctionProbability))
      });
    }
  }
  
  return {
    totalRuns: logs.length,
    outcomes,
    averageTrajectories: {
      aiCapabilityGrowth: { mean: mean(trajectories.aiCapability), std: std(trajectories.aiCapability) },
      unemploymentChange: { mean: mean(trajectories.unemployment), std: std(trajectories.unemployment) },
      trustChange: { mean: mean(trajectories.trust), std: std(trajectories.trust) },
      stageProgression: { mean: mean(trajectories.stage), std: std(trajectories.stage) }
    },
    quartileAverages,
    eventFrequencies
  };
}

