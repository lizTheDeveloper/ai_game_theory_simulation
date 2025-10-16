/**
 * AI-Assisted Skills Aggregate Metrics Phase (TIER 4.6)
 *
 * Calculates population-level aggregate metrics for AI-assisted skill enhancement.
 * This tracks digital AI tool adoption (GitHub Copilot, ChatGPT, AI tutors), NOT BCIs.
 *
 * **TRL: 9** (Aggregating empirically validated segment-level data)
 *
 * **EXECUTION ORDER:** 17.0 (Systems updates - after UBI/Social Nets, before QoL)
 * **DEPENDENCIES:** Requires society.segments (updated in UnemploymentPhase at 30.0)
 * **SIDE EFFECTS:**
 * - Calculates aggregate enhancement metrics (Gini, productivity gap, distribution)
 * - Updates global barriers (economic, geographic, education decline over time)
 * - Provides metrics for QoL, social cohesion, cognitive spiral calculations
 *
 * **NOTE:** Individual segment skills are updated in UnemploymentPhase (order 30.0).
 * This phase only aggregates and provides high-level metrics.
 *
 * **Research Foundation:** All mechanics grounded in peer-reviewed research (TRL 8-9)
 * @see reviews/bionic-skills-hopeful-research-foundation-20251016.md
 * @see Removed sci-fi elements: BCI adoption, consciousness upload, species bifurcation
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '../../../types/game';
import { calculateAIAssistedSkillsAggregateMetrics } from '../../bionicSkills';

export class HumanEnhancementPhase implements SimulationPhase {
  readonly id = 'ai-assisted-skills-metrics';
  readonly name = 'AI-Assisted Skills Metrics';
  readonly order = 17.0; // After social systems (UBI, safety nets), before QoL calculation

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Calculate aggregate metrics if we have segments and metrics tracking
    if (state.society.segments && state.society.segments.length > 0) {
      // Get or initialize metrics
      if (!state.aiAssistedSkillsMetrics) {
        // Initialize if first time (backward compatibility)
        const { initializeAIAssistedSkillsMetrics } = require('../../bionicSkills');
        state.aiAssistedSkillsMetrics = initializeAIAssistedSkillsMetrics();
      }

      // Get average AI capability for phase detection
      const avgAICapability = state.aiAgents && state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
        : 0;

      // Calculate aggregate metrics from segment data
      // Pass AI capability and current month for phase transition tracking
      calculateAIAssistedSkillsAggregateMetrics(
        state.society.segments,
        state.aiAssistedSkillsMetrics,
        avgAICapability,
        state.currentMonth
      );
    }

    return { events: [] };
  }
}

