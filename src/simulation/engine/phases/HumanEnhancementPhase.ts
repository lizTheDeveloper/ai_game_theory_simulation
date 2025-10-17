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
import { calculateAIAssistedSkillsAggregateMetrics, calculateProductivityMultiplierFromAIAssistedSkills, updateLaborCapitalDistribution, checkCompetenceCrisis, checkWageInequality, applyPolicyInterventions } from '../../aiAssistedSkills';

export class HumanEnhancementPhase implements SimulationPhase {
  readonly id = 'ai-assisted-skills-metrics';
  readonly name = 'AI-Assisted Skills Metrics';
  readonly order = 17.0; // After social systems (UBI, safety nets), before QoL calculation

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: Array<{ type: string; severity: string; description: string; month: number }> = [];

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

      // Phase 3: Check for competence crisis (AI dependency)
      const competenceEvent = checkCompetenceCrisis(state.society.segments, state.currentMonth);
      if (competenceEvent) {
        events.push(competenceEvent);
        console.log(`\n⚠️  ${competenceEvent.type} [Month ${state.currentMonth}]`);
        console.log(`  ${competenceEvent.description}`);
      }

      // Phase 4: Update labor-capital distribution based on AI-driven productivity gains
      if (state.laborCapitalDistribution) {
        const productivityMultiplier = calculateProductivityMultiplierFromAIAssistedSkills(state);
        const ubiLevel = state.ubiSystem?.currentAmount || 0;

        // Phase 6: Apply policy interventions if configured
        if (state.policyInterventions && (
          (state.policyInterventions.retrainingLevel && state.policyInterventions.retrainingLevel > 0) ||
          (state.policyInterventions.teachingSupportLevel && state.policyInterventions.teachingSupportLevel > 0) ||
          (state.policyInterventions.jobGuaranteeLevel && state.policyInterventions.jobGuaranteeLevel > 0)
        )) {
          applyPolicyInterventions(
            state.laborCapitalDistribution,
            productivityMultiplier,
            {
              ubiLevel,
              retrainingLevel: state.policyInterventions.retrainingLevel,
              teachingSupportLevel: state.policyInterventions.teachingSupportLevel,
              jobGuaranteeLevel: state.policyInterventions.jobGuaranteeLevel,
            }
          );
        } else {
          // No policy interventions, use baseline distribution
          updateLaborCapitalDistribution(
            state.laborCapitalDistribution,
            productivityMultiplier,
            ubiLevel
          );
        }

        // Check for wage inequality crisis
        const wageEvent = checkWageInequality(state.laborCapitalDistribution, state.currentMonth);
        if (wageEvent) {
          events.push(wageEvent);
          console.log(`\n⚠️  ${wageEvent.type} [Month ${state.currentMonth}]`);
          console.log(`  ${wageEvent.description}`);
        }

        // Log productivity-wage decoupling when gap becomes significant
        if (state.laborCapitalDistribution.productivityWageGap > 0.20) {
          console.log(`\n⚠️  Productivity-Wage Gap: ${(state.laborCapitalDistribution.productivityWageGap * 100).toFixed(1)}%`);
          console.log(`  Productivity Growth: +${(state.laborCapitalDistribution.productivityGrowth * 100).toFixed(1)}%`);
          console.log(`  Wage Growth: +${(state.laborCapitalDistribution.wageGrowth * 100).toFixed(1)}%`);
          console.log(`  Gains to Capital: ${(state.laborCapitalDistribution.gainsToCapital * 100).toFixed(0)}%`);
          console.log(`  Labor Share: ${(state.laborCapitalDistribution.laborShare * 100).toFixed(1)}%`);
        }
      }
    }

    return { events };
  }
}

