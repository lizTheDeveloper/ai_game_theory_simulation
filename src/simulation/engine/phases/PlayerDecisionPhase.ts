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

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { migratedActions } from '@/simulation/government/actions';
import { ActionResult } from '@/simulation/agents/types';
import { AI_ACTIONS } from '@/simulation/agents/aiAgent';

export class PlayerDecisionPhase implements SimulationPhase {
  readonly id = 'player-decision';
  readonly name = 'Player Decision Processing';
  readonly order = 8.51;

  // DEPENDENCIES (Nov 15, 2025): No dependencies - player decisions can be processed early
  readonly dependencies = [] as const;
  private rng: RNGFunction | null = null;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);
    this.rng = rng; // Store RNG for use in handler methods

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

          case 'ai_action':
            this.handleAIActionDecision(state, decision.data, events);
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

    // Handle government actions (new)
    if (data.actionType === 'government' && data.actionId) {
      // Find the action in the registry
      const action = migratedActions.find(a => a.id === data.actionId);
      if (action) {
        console.log(`    Executing Government Action: ${action.name}`);

        // Check if action can be executed
        if (action.canExecute(state)) {
          // Execute the action with deterministic RNG
          if (!this.rng) {
            throw new Error('RNG not initialized in PlayerDecisionPhase');
          }
          const result: ActionResult = action.execute(state, this.rng, 'player');

          // Add events from action execution
          if (result.events) {
            events.push(...result.events);
          }

          console.log(`    ✅ Action executed successfully: ${action.name}`);
          console.log(`    Effects:`, result.message || 'State updated');
        } else {
          console.log(`    ⚠️ Action cannot be executed: ${action.name} (requirements not met)`);
        }
      } else {
        console.warn(`    ⚠️ Government action not found: ${data.actionId}`);
      }
      return;
    }

    // Example: AI regulation control desire
    if (data.controlDesire !== undefined) {
      const oldValue = state.government.controlDesire;
      state.government.controlDesire = Math.max(0, Math.min(1, data.controlDesire));
      console.log(`    Control Desire: ${oldValue.toFixed(2)} → ${state.government.controlDesire.toFixed(2)}`);

      events.push({
        id: `policy-control-desire-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'government',
        severity: 'medium',
        agent: 'player',
        title: 'AI Regulation Policy Change',
        description: `Player adjusted AI regulation control desire to ${(state.government.controlDesire * 100).toFixed(0)}%`,
        effects: { controlDesire: state.government.controlDesire }
      });
    }

    // Example: Alignment research investment
    if (data.alignmentResearch !== undefined) {
      const oldValue = state.government.alignmentResearchInvestment;
      state.government.alignmentResearchInvestment = Math.max(0, Math.min(10, data.alignmentResearch));
      console.log(`    Alignment Research: ${oldValue.toFixed(2)} → ${state.government.alignmentResearchInvestment.toFixed(2)}`);

      events.push({
        id: `policy-alignment-research-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'government',
        severity: 'medium',
        agent: 'player',
        title: 'AI Safety Investment Change',
        description: `Player adjusted alignment research investment to ${state.government.alignmentResearchInvestment.toFixed(1)}`,
        effects: { alignmentResearchInvestment: state.government.alignmentResearchInvestment }
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
          timestamp: state.currentMonth,
          type: 'government',
          severity: 'medium',
          agent: 'player',
          title: 'Compute Governance Change',
          description: `Player changed compute governance from ${oldValue} to ${data.computeGovernance}`,
          effects: { computeGovernance: data.computeGovernance }
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
        const oldProgress = tech.progress;
        tech.progress = Math.max(0, Math.min(1, tech.progress + data.amount));
        console.log(`    Tech Investment [${tech.name}]: ${oldProgress.toFixed(2)} → ${tech.progress.toFixed(2)}`);

        events.push({
          id: `investment-tech-${data.techId}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'technology',
          severity: 'low',
          agent: 'player',
          title: `Technology Investment: ${tech.name}`,
          description: `Player invested in ${tech.name} research (+${(data.amount * 100).toFixed(0)}%)`,
          effects: { techId: data.techId, progress: tech.progress }
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
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'high',
        agent: 'player',
        title: `Emergency Response: ${data.crisis}`,
        description: `Player allocated emergency budget for ${data.crisis}`,
        effects: { crisis: data.crisis, budget: data.budget }
      });

      // If emergency management system exists, update it
      if (state.emergencyManagement) {
        // Placeholder: actual integration would go here
        console.log(`    ℹ️ Emergency management integration pending`);
      }
    }
  }

  /**
   * Handle AI action decisions (player-controlled AI actions)
   * Allows player to manually trigger AI agent actions for testing/experimentation
   */
  private handleAIActionDecision(state: GameState, data: any, events: GameEvent[]): void {
    console.log(`  AI Action Decision: ${JSON.stringify(data)}`);

    // Validate input data
    if (!data.agentId || !data.actionId) {
      console.warn(`    ⚠️ Missing required fields: agentId or actionId`);
      return;
    }

    // Find the AI agent
    const agent = state.aiAgents.find(ai => ai.id === data.agentId);
    if (!agent) {
      console.warn(`    ⚠️ AI agent not found: ${data.agentId}`);
      return;
    }

    // Find the action
    const action = AI_ACTIONS.find(a => a.id === data.actionId);
    if (!action) {
      console.warn(`    ⚠️ Unknown AI action: ${data.actionId}`);
      return;
    }

    // Check if the action can be executed
    if (!action.canExecute(state, data.agentId)) {
      console.log(`    ℹ️ Action ${action.name} cannot be executed for agent ${agent.name} in current state`);
      return;
    }

    // Execute the action with deterministic RNG
    if (!this.rng) {
      throw new Error('RNG not initialized in PlayerDecisionPhase');
    }

    console.log(`    Executing AI Action: ${action.name} for agent ${agent.name}`);
    const result: ActionResult = action.execute(state, this.rng, data.agentId);

    // Add events from action execution
    if (result.events) {
      events.push(...result.events);
    }

    // Log the result
    if (result.success) {
      console.log(`    ✅ AI action executed successfully: ${result.message || action.name}`);

      // Add a special event to track player-initiated AI actions
      events.push({
        id: `player-ai-action-${data.actionId}-${state.currentMonth}-${state.eventIdCounter++}`,
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: 'player',
        title: `Player-Initiated AI Action: ${action.name}`,
        description: `Player manually triggered ${action.name} for AI agent ${agent.name}`,
        effects: {
          agentId: data.agentId,
          agentName: agent.name,
          actionId: data.actionId,
          actionName: action.name
        }
      });
    } else {
      console.log(`    ❌ AI action failed: ${result.message || 'Unknown error'}`);
    }
  }
}
