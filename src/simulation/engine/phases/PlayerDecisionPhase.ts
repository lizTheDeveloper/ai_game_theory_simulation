/**
 * PlayerDecisionPhase (8.5)
 *
 * Processes player decisions from the UI and applies them to simulation state.
 * Decisions are queued by simulationWorker and processed here in order.
 *
 * **EXECUTION ORDER:** 8.5 (After AI agents, before environmental updates)
 * **DEPENDENCIES:** None
 * **SIDE EFFECTS:**
 * - Modifies government policy state
 * - Modifies technology investment
 * - Modifies emergency response state
 * - Clears player decision queue after processing
 *
 * Decision Types:
 * - policy: Government policy changes (AI regulation, safety investment, international cooperation)
 * - investment: Technology research/deployment funding
 * - emergency: Emergency response actions during crises
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class PlayerDecisionPhase implements SimulationPhase {
  readonly id = 'player-decision';
  readonly name = 'Player Decision Processing';
  readonly order = 8.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];

    // Initialize queue if not present
    if (!state.playerDecisions) {
      state.playerDecisions = [];
    }

    // Process all queued decisions
    if (state.playerDecisions.length === 0) {
      return { events: [] };
    }

    console.log(`\n=== Player Decision Processing ===`);
    console.log(`  Processing ${state.playerDecisions.length} player decisions`);

    for (const decision of state.playerDecisions) {
      try {
        switch (decision.type) {
          case 'policy':
            this.handlePolicyDecision(state, decision.data, events);
            break;

          case 'investment':
            this.handleInvestmentDecision(state, decision.data, events);
            break;

          case 'emergency':
            this.handleEmergencyDecision(state, decision.data, events);
            break;

          default:
            console.warn(`  ⚠️ Unknown decision type: ${decision.type}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing decision:`, error);
      }
    }

    // Clear queue after processing
    state.playerDecisions = [];

    return { events };
  }

  /**
   * Handle policy decisions (AI regulation, safety investment, cooperation)
   */
  private handlePolicyDecision(state: GameState, data: any, events: GameEvent[]): void {
    console.log(`  Policy Decision: ${JSON.stringify(data)}`);

    // Example: AI regulation control desire
    if (data.controlDesire !== undefined) {
      const oldValue = state.government.controlDesire;
      state.government.controlDesire = Math.max(0, Math.min(1, data.controlDesire));
      console.log(`    Control Desire: ${oldValue.toFixed(2)} → ${state.government.controlDesire.toFixed(2)}`);

      events.push({
        id: `policy-control-desire-${state.currentMonth}`,
        month: state.currentMonth,
        type: 'government',
        severity: 'medium',
        title: 'AI Regulation Policy Change',
        description: `Player adjusted AI regulation control desire to ${(state.government.controlDesire * 100).toFixed(0)}%`,
        agentInvolved: 'player'
      });
    }

    // Example: Alignment research investment
    if (data.alignmentResearch !== undefined) {
      const oldValue = state.government.alignmentResearchInvestment;
      state.government.alignmentResearchInvestment = Math.max(0, Math.min(10, data.alignmentResearch));
      console.log(`    Alignment Research: ${oldValue.toFixed(2)} → ${state.government.alignmentResearchInvestment.toFixed(2)}`);

      events.push({
        id: `policy-alignment-research-${state.currentMonth}`,
        month: state.currentMonth,
        type: 'government',
        severity: 'medium',
        title: 'AI Safety Investment Change',
        description: `Player adjusted alignment research investment to ${state.government.alignmentResearchInvestment.toFixed(1)}`,
        agentInvolved: 'player'
      });
    }

    // Example: Compute governance
    if (data.computeGovernance !== undefined) {
      const oldValue = state.government.computeGovernance;
      const validLevels: Array<'none' | 'monitoring' | 'limits' | 'strict'> = ['none', 'monitoring', 'limits', 'strict'];
      if (validLevels.includes(data.computeGovernance)) {
        state.government.computeGovernance = data.computeGovernance;
        console.log(`    Compute Governance: ${oldValue} → ${state.government.computeGovernance}`);

        events.push({
          id: `policy-compute-governance-${state.currentMonth}`,
          month: state.currentMonth,
          type: 'government',
          severity: 'medium',
          title: 'Compute Governance Change',
          description: `Player changed compute governance from ${oldValue} to ${data.computeGovernance}`,
          agentInvolved: 'player'
        });
      }
    }
  }

  /**
   * Handle investment decisions (technology research/deployment funding)
   */
  private handleInvestmentDecision(state: GameState, data: any, events: GameEvent[]): void {
    console.log(`  Investment Decision: ${JSON.stringify(data)}`);

    // Example: Technology research investment
    if (data.techId && data.amount !== undefined) {
      const tech = state.technologyTree.find(t => t.id === data.techId);
      if (tech) {
        const oldProgress = tech.researchProgress;
        tech.researchProgress = Math.max(0, Math.min(1, tech.researchProgress + data.amount));
        console.log(`    Tech Investment [${tech.name}]: ${oldProgress.toFixed(2)} → ${tech.researchProgress.toFixed(2)}`);

        events.push({
          id: `investment-tech-${data.techId}-${state.currentMonth}`,
          month: state.currentMonth,
          type: 'technology',
          severity: 'low',
          title: `Technology Investment: ${tech.name}`,
          description: `Player invested in ${tech.name} research (+${(data.amount * 100).toFixed(0)}%)`,
          agentInvolved: 'player'
        });
      } else {
        console.warn(`    ⚠️ Technology not found: ${data.techId}`);
      }
    }
  }

  /**
   * Handle emergency decisions (crisis response actions)
   */
  private handleEmergencyDecision(state: GameState, data: any, events: GameEvent[]): void {
    console.log(`  Emergency Decision: ${JSON.stringify(data)}`);

    // Example: Emergency budget allocation
    if (data.crisis && data.budget !== undefined) {
      // This would integrate with emergency management system
      // For now, just log and create event
      console.log(`    Emergency Budget for ${data.crisis}: ${data.budget}`);

      events.push({
        id: `emergency-${data.crisis}-${state.currentMonth}`,
        month: state.currentMonth,
        type: 'crisis',
        severity: 'high',
        title: `Emergency Response: ${data.crisis}`,
        description: `Player allocated emergency budget for ${data.crisis}`,
        agentInvolved: 'player'
      });

      // If emergency management system exists, update it
      if (state.emergencyManagement) {
        // Placeholder: actual integration would go here
        console.log(`    ℹ️ Emergency management integration pending`);
      }
    }
  }
}
