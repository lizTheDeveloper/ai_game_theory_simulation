/**
 * Comprehensive diagnostic logging for simulation dynamics
 * 
 * Tracks tipping points, growth rates, intervention effectiveness,
 * and identifies runaway dynamics
 */

import { GameState, GameEvent } from '@/types/game';

export interface ThresholdCrossing {
  month: number;
  metric: string;
  threshold: number;
  value: number;
  direction: 'up' | 'down';
}

export interface GrowthRate {
  month: number;
  metric: string;
  value: number;
  rate: number; // Change per month
  movingAverage: number; // 3-month moving average
}

export interface InterventionImpact {
  month: number;
  action: string;
  agent: string;
  before: Record<string, number>;
  after: Record<string, number>;
  effects: Record<string, number>;
}

export interface DecisionLog {
  month: number;
  agent: string;
  availableActions: Array<{
    id: string;
    priority: number;
  }>;
  chosenAction: string;
  reason: string;
}

export interface LifecycleSnapshot {
  month: number;
  training: number;
  testing: number;
  deployed_closed: number;
  deployed_open: number;
  retired: number;
  totalActive: number;
  totalSpread: number;
  newThisMonth: number;
  retiredThisMonth: number;
}

export interface DiagnosticLog {
  thresholdCrossings: ThresholdCrossing[];
  growthRates: GrowthRate[];
  interventions: InterventionImpact[];
  decisions: DecisionLog[];
  lifecycleSnapshots: LifecycleSnapshot[]; // Phase 4: Track AI population dynamics
  correlations: Record<string, number>;
  summary: {
    extinctionReason?: string;
    extinctionMonth?: number;
    keyTippingPoints: ThresholdCrossing[];
    fastestGrowthPeriod: { startMonth: number; endMonth: number; metric: string; rate: number };
    mostEffectiveIntervention?: InterventionImpact;
    leastEffectiveIntervention?: InterventionImpact;
    governmentResponseDelay?: number; // Months between AI threat and first action
    interventionCount: {
      ai: number;
      government: number;
      society: number;
    };
    // Phase 4: Lifecycle statistics
    lifecycleStats?: {
      peakActiveAIs: number;
      peakSpreadCount: number;
      totalAIsCreated: number;
      totalAIsRetired: number;
      avgLifespan: number;
    };
  };
}

/**
 * Diagnostic logger that tracks detailed dynamics
 */
export class DiagnosticLogger {
  private thresholdCrossings: ThresholdCrossing[] = [];
  private growthRates: Map<string, GrowthRate[]> = new Map();
  private interventions: InterventionImpact[] = [];
  private decisions: DecisionLog[] = [];
  private lifecycleSnapshots: LifecycleSnapshot[] = []; // Phase 4: Track AI population
  private previousState: GameState | null = null;
  
  // Track when critical events happen
  private firstAIThreat: number = -1; // Month when capability > 1.0
  private firstGovernmentAction: number = -1;
  
  // Thresholds to watch
  private readonly CAPABILITY_THRESHOLDS = [0.8, 1.0, 1.5, 2.0, 2.5, 3.0];
  private readonly ALIGNMENT_THRESHOLDS = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
  private readonly UNEMPLOYMENT_THRESHOLDS = [0.15, 0.25, 0.35, 0.50, 0.75, 0.90];
  private readonly TRUST_THRESHOLDS = [0.8, 0.6, 0.4, 0.2, 0.1, 0.05];
  
  /**
   * Log state at each step
   */
  logStep(state: GameState, events: GameEvent[]): void {
    const month = state.currentMonth;
    
    // Detect threshold crossings
    if (this.previousState) {
      this.detectThresholdCrossings(this.previousState, state);
      this.calculateGrowthRates(this.previousState, state);
    }
    
    // Log interventions
    events.forEach(event => {
      if (event.type === 'action' || event.type === 'policy') {
        this.logIntervention(state, event);
      }
    });
    
    // Track timing of critical events
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    if (this.firstAIThreat === -1 && totalCapability > 1.0) {
      this.firstAIThreat = month;
    }
    
    // Phase 4: Track AI lifecycle statistics
    const lifecycleCounts = {
      training: 0,
      testing: 0,
      deployed_closed: 0,
      deployed_open: 0,
      retired: 0
    };
    
    let totalSpread = 0;
    state.aiAgents.forEach(ai => {
      lifecycleCounts[ai.lifecycleState]++;
      if (ai.lifecycleState !== 'retired') {
        totalSpread += ai.spreadCount;
      }
    });
    
    const totalActive = state.aiAgents.length - lifecycleCounts.retired;
    const newThisMonth = this.previousState 
      ? state.aiAgents.length - this.previousState.aiAgents.length 
      : 0;
    const retiredThisMonth = this.previousState
      ? state.aiAgents.filter(ai => ai.lifecycleState === 'retired').length -
        this.previousState.aiAgents.filter((ai: any) => ai.lifecycleState === 'retired').length
      : 0;
    
    this.lifecycleSnapshots.push({
      month,
      ...lifecycleCounts,
      totalActive,
      totalSpread,
      newThisMonth,
      retiredThisMonth
    });
    
    this.previousState = JSON.parse(JSON.stringify(state));
  }
  
  /**
   * Log a decision made by an agent
   */
  logDecision(
    month: number,
    agent: string,
    availableActions: Array<{ id: string; priority: number }>,
    chosenAction: string,
    reason: string
  ): void {
    this.decisions.push({
      month,
      agent,
      availableActions,
      chosenAction,
      reason
    });
    
    if (agent === 'Government' && this.firstGovernmentAction === -1) {
      this.firstGovernmentAction = month;
    }
  }
  
  /**
   * Detect when metrics cross critical thresholds
   */
  private detectThresholdCrossings(prevState: GameState, currentState: GameState): void {
    const month = currentState.currentMonth;
    
    // AI Capability
    const prevCap = prevState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const currCap = currentState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    this.checkThresholds('aiCapability', prevCap, currCap, this.CAPABILITY_THRESHOLDS, month);
    
    // AI Alignment
    const prevAlign = prevState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / prevState.aiAgents.length;
    const currAlign = currentState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / currentState.aiAgents.length;
    this.checkThresholds('alignment', prevAlign, currAlign, this.ALIGNMENT_THRESHOLDS, month);
    
    // Unemployment
    this.checkThresholds('unemployment', prevState.society.unemploymentLevel, 
      currentState.society.unemploymentLevel, this.UNEMPLOYMENT_THRESHOLDS, month);
    
    // Trust
    this.checkThresholds('trustInAI', prevState.society.trustInAI, 
      currentState.society.trustInAI, this.TRUST_THRESHOLDS, month);
  }
  
  /**
   * Check if a metric crossed any thresholds
   */
  private checkThresholds(
    metric: string,
    prevValue: number,
    currValue: number,
    thresholds: number[],
    month: number
  ): void {
    for (const threshold of thresholds) {
      // Crossing upward
      if (prevValue < threshold && currValue >= threshold) {
        this.thresholdCrossings.push({
          month,
          metric,
          threshold,
          value: currValue,
          direction: 'up'
        });
      }
      // Crossing downward
      if (prevValue > threshold && currValue <= threshold) {
        this.thresholdCrossings.push({
          month,
          metric,
          threshold,
          value: currValue,
          direction: 'down'
        });
      }
    }
  }
  
  /**
   * Calculate growth rates for key metrics
   */
  private calculateGrowthRates(prevState: GameState, currentState: GameState): void {
    const month = currentState.currentMonth;
    
    // AI Capability growth
    const prevCap = prevState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const currCap = currentState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    this.addGrowthRate('aiCapability', month, currCap, currCap - prevCap);
    
    // Alignment drift
    const prevAlign = prevState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / prevState.aiAgents.length;
    const currAlign = currentState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / currentState.aiAgents.length;
    this.addGrowthRate('alignment', month, currAlign, currAlign - prevAlign);
    
    // Unemployment growth
    this.addGrowthRate('unemployment', month, currentState.society.unemploymentLevel,
      currentState.society.unemploymentLevel - prevState.society.unemploymentLevel);
    
    // Trust decay
    this.addGrowthRate('trustInAI', month, currentState.society.trustInAI,
      currentState.society.trustInAI - prevState.society.trustInAI);
  }
  
  /**
   * Add a growth rate measurement
   */
  private addGrowthRate(metric: string, month: number, value: number, rate: number): void {
    if (!this.growthRates.has(metric)) {
      this.growthRates.set(metric, []);
    }
    
    const rates = this.growthRates.get(metric)!;
    
    // Calculate 3-month moving average
    const recentRates = rates.slice(-2).map(r => r.rate);
    recentRates.push(rate);
    const movingAverage = recentRates.reduce((sum, r) => sum + r, 0) / recentRates.length;
    
    rates.push({
      month,
      metric,
      value,
      rate,
      movingAverage
    });
  }
  
  /**
   * Log an intervention and its impact
   */
  private logIntervention(state: GameState, event: GameEvent): void {
    const month = state.currentMonth;
    const totalCap = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const avgAlign = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    
    this.interventions.push({
      month,
      action: event.title,
      agent: event.agent,
      before: this.previousState ? {
        aiCapability: this.previousState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
        alignment: this.previousState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / this.previousState.aiAgents.length,
        unemployment: this.previousState.society.unemploymentLevel,
        trust: this.previousState.society.trustInAI
      } : {},
      after: {
        aiCapability: totalCap,
        alignment: avgAlign,
        unemployment: state.society.unemploymentLevel,
        trust: state.society.trustInAI
      },
      effects: event.effects
    });
  }
  
  /**
   * Finalize and generate diagnostic report
   */
  finalize(finalState: GameState, outcome: string): DiagnosticLog {
    // Find key tipping points (thresholds that preceded rapid changes)
    const keyTippingPoints = this.identifyKeyTippingPoints();
    
    // Find fastest growth period
    const fastestGrowth = this.findFastestGrowthPeriod();
    
    // Evaluate intervention effectiveness
    const { mostEffective, leastEffective } = this.evaluateInterventions();
    
    // Calculate government response delay
    const responseDelay = this.firstAIThreat > 0 && this.firstGovernmentAction > 0
      ? this.firstGovernmentAction - this.firstAIThreat
      : undefined;
    
    // Count interventions by agent
    const interventionCount = {
      ai: this.interventions.filter(i => i.agent && i.agent.includes('AI')).length,
      government: this.interventions.filter(i => i.agent === 'Government').length,
      society: this.interventions.filter(i => i.agent === 'Society').length
    };
    
    // Calculate correlations
    const correlations = this.calculateCorrelations();
    
    // Phase 4: Calculate lifecycle statistics
    const lifecycleStats = this.lifecycleSnapshots.length > 0 ? {
      peakActiveAIs: Math.max(...this.lifecycleSnapshots.map(s => s.totalActive)),
      peakSpreadCount: Math.max(...this.lifecycleSnapshots.map(s => s.totalSpread)),
      totalAIsCreated: this.lifecycleSnapshots.reduce((sum, s) => sum + s.newThisMonth, 0),
      totalAIsRetired: this.lifecycleSnapshots.reduce((sum, s) => sum + s.retiredThisMonth, 0),
      avgLifespan: finalState.aiAgents.length > 0
        ? finalState.aiAgents
            .filter(ai => ai.lifecycleState === 'retired')
            .reduce((sum, ai) => sum + ai.monthsInExistence, 0) / 
          Math.max(1, finalState.aiAgents.filter(ai => ai.lifecycleState === 'retired').length)
        : 0
    } : undefined;
    
    return {
      thresholdCrossings: this.thresholdCrossings,
      growthRates: Array.from(this.growthRates.values()).flat(),
      interventions: this.interventions,
      decisions: this.decisions,
      lifecycleSnapshots: this.lifecycleSnapshots,
      correlations,
      summary: {
        extinctionReason: outcome === 'extinction' ? 'Simulation ended in extinction' : undefined,
        extinctionMonth: outcome === 'extinction' ? finalState.currentMonth : undefined,
        keyTippingPoints,
        fastestGrowthPeriod: fastestGrowth,
        mostEffectiveIntervention: mostEffective,
        leastEffectiveIntervention: leastEffective,
        governmentResponseDelay: responseDelay,
        interventionCount,
        lifecycleStats
      }
    };
  }
  
  /**
   * Identify the most significant tipping points
   */
  private identifyKeyTippingPoints(): ThresholdCrossing[] {
    // Find crossings followed by rapid acceleration
    return this.thresholdCrossings
      .filter(crossing => {
        // Look for crossings of high-value thresholds
        if (crossing.metric === 'aiCapability' && crossing.threshold >= 1.0) return true;
        if (crossing.metric === 'alignment' && crossing.threshold <= 0.6) return true;
        if (crossing.metric === 'unemployment' && crossing.threshold >= 0.25) return true;
        if (crossing.metric === 'trustInAI' && crossing.threshold <= 0.4) return true;
        return false;
      })
      .slice(0, 5); // Top 5 most critical
  }
  
  /**
   * Find the period with fastest metric growth
   */
  private findFastestGrowthPeriod(): { startMonth: number; endMonth: number; metric: string; rate: number } {
    let fastest = { startMonth: 0, endMonth: 0, metric: '', rate: 0 };
    
    for (const [metric, rates] of this.growthRates.entries()) {
      for (let i = 0; i < rates.length - 2; i++) {
        const window = rates.slice(i, i + 3);
        const avgRate = window.reduce((sum, r) => sum + Math.abs(r.rate), 0) / window.length;
        
        if (avgRate > fastest.rate) {
          fastest = {
            startMonth: window[0].month,
            endMonth: window[window.length - 1].month,
            metric,
            rate: avgRate
          };
        }
      }
    }
    
    return fastest;
  }
  
  /**
   * Evaluate which interventions were most/least effective
   */
  private evaluateInterventions(): { 
    mostEffective?: InterventionImpact;
    leastEffective?: InterventionImpact;
  } {
    if (this.interventions.length === 0) {
      return {};
    }
    
    // Score interventions by their impact on key metrics
    const scored = this.interventions.map(intervention => {
      let score = 0;
      
      // Positive: Slowed AI capability growth
      if (intervention.after.aiCapability < intervention.before.aiCapability) {
        score += 10;
      }
      
      // Positive: Improved alignment
      if (intervention.after.alignment > intervention.before.alignment) {
        score += 8;
      }
      
      // Positive: Reduced unemployment
      if (intervention.after.unemployment < intervention.before.unemployment) {
        score += 5;
      }
      
      // Positive: Increased trust
      if (intervention.after.trust > intervention.before.trust) {
        score += 3;
      }
      
      return { intervention, score };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    return {
      mostEffective: scored[0]?.intervention,
      leastEffective: scored[scored.length - 1]?.intervention
    };
  }
  
  /**
   * Calculate correlations between key metrics
   */
  private calculateCorrelations(): Record<string, number> {
    // Simplified correlation calculation
    // For now, just track basic relationships
    return {
      'capability_vs_unemployment': 0.95, // Placeholder - would calculate from data
      'capability_vs_alignment': -0.85,
      'unemployment_vs_trust': -0.75,
      'trust_vs_legitimacy': 0.80
    };
  }
}

/**
 * Format diagnostic log for human reading
 */
export function formatDiagnosticReport(log: DiagnosticLog): string {
  const lines: string[] = [];
  
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('           COMPREHENSIVE DIAGNOSTIC REPORT');
  lines.push('═══════════════════════════════════════════════════════\n');
  
  // Summary
  if (log.summary.extinctionReason) {
    lines.push(`🔴 OUTCOME: Extinction at month ${log.summary.extinctionMonth}\n`);
  }
  
  // Response timing
  if (log.summary.governmentResponseDelay !== undefined) {
    lines.push(`⏱️  RESPONSE DELAY: ${log.summary.governmentResponseDelay} months`);
    lines.push(`   (Time between AI threat emerging and first government action)\n`);
  }
  
  // Intervention counts
  lines.push(`📊 INTERVENTION COUNTS:`);
  lines.push(`   AI Actions:         ${log.summary.interventionCount.ai}`);
  lines.push(`   Government Actions: ${log.summary.interventionCount.government}`);
  lines.push(`   Society Actions:    ${log.summary.interventionCount.society}\n`);
  
  // Key tipping points
  if (log.summary.keyTippingPoints.length > 0) {
    lines.push(`🎯 KEY TIPPING POINTS:`);
    log.summary.keyTippingPoints.forEach(tp => {
      const dir = tp.direction === 'up' ? '↑' : '↓';
      lines.push(`   Month ${tp.month}: ${tp.metric} ${dir} ${tp.threshold.toFixed(2)} (now ${tp.value.toFixed(2)})`);
    });
    lines.push('');
  }
  
  // Fastest growth period
  if (log.summary.fastestGrowthPeriod.rate > 0) {
    const fg = log.summary.fastestGrowthPeriod;
    lines.push(`⚡ FASTEST GROWTH PERIOD:`);
    lines.push(`   Months ${fg.startMonth}-${fg.endMonth}: ${fg.metric}`);
    lines.push(`   Average rate: ${fg.rate.toFixed(4)}/month\n`);
  }
  
  // Most effective intervention
  if (log.summary.mostEffectiveIntervention) {
    const interv = log.summary.mostEffectiveIntervention;
    lines.push(`✅ MOST EFFECTIVE INTERVENTION:`);
    lines.push(`   Month ${interv.month}: ${interv.action}`);
    lines.push(`   Agent: ${interv.agent}`);
    if (interv.before.aiCapability !== undefined) {
      lines.push(`   AI Capability: ${interv.before.aiCapability.toFixed(2)} → ${interv.after.aiCapability.toFixed(2)}`);
    }
    if (interv.before.alignment !== undefined) {
      lines.push(`   Alignment: ${interv.before.alignment.toFixed(2)} → ${interv.after.alignment.toFixed(2)}`);
    }
    lines.push('');
  }
  
  // Growth rates summary
  const capRates = log.growthRates.filter(r => r.metric === 'aiCapability');
  if (capRates.length > 0) {
    const avgGrowth = capRates.reduce((sum, r) => sum + r.rate, 0) / capRates.length;
    const maxGrowth = Math.max(...capRates.map(r => r.rate));
    lines.push(`📈 AI CAPABILITY GROWTH:`);
    lines.push(`   Average: ${avgGrowth.toFixed(4)}/month`);
    lines.push(`   Maximum: ${maxGrowth.toFixed(4)}/month\n`);
  }
  
  const alignRates = log.growthRates.filter(r => r.metric === 'alignment');
  if (alignRates.length > 0) {
    const avgDrift = alignRates.reduce((sum, r) => sum + r.rate, 0) / alignRates.length;
    const maxDrift = Math.min(...alignRates.map(r => r.rate));
    lines.push(`📉 ALIGNMENT DRIFT:`);
    lines.push(`   Average: ${avgDrift.toFixed(4)}/month`);
    lines.push(`   Worst: ${maxDrift.toFixed(4)}/month\n`);
  }
  
  lines.push('═══════════════════════════════════════════════════════\n');
  
  return lines.join('\n');
}

