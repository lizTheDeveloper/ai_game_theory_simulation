import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
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

import { calculateAIAssistedSkillsAggregateMetrics, calculateProductivityMultiplierFromAIAssistedSkills, updateLaborCapitalDistribution, checkCompetenceCrisis, checkWageInequality, applyPolicyInterventions } from '../../aiAssistedSkills';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertStateProperty,
  assertFinite,
  assertNonEmpty,
  assertInRange,
  assertDefined
} from '@/simulation/utils/assertions';
import { initializeAIAssistedSkillsMetrics } from '../../aiAssistedSkills/aggregateMetrics';

export class HumanEnhancementPhase implements SimulationPhase {
  readonly id = 'ai-assisted-skills-metrics';
  readonly name = 'AI-Assisted Skills Metrics';
  readonly order = 17.01; // Human enhancement effects - second (after social systems, before QoL)
<<<<<<< HEAD
  readonly dependencies = ['society-actions']; // Reads society.segments (fixed typo: society-agent-actions → society-actions)
=======
  readonly dependencies = ['society-actions']; // Reads society.segments (correct ID: society-actions not society-agent-actions)
>>>>>>> origin/auto/worker-20251115_013002

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Calculate aggregate metrics if we have segments and metrics tracking
    if (state.society.segments && state.society.segments.length > 0) {
      // Get or initialize metrics
      if (!state.aiAssistedSkillsMetrics) {
        // Initialize if first time (backward compatibility)state.aiAssistedSkillsMetrics = initializeAIAssistedSkillsMetrics();
      }

      // Get average AI capability for phase detection
      const avgAICapability = state.aiAgents && state.aiAgents.length > 0
        ? assertFinite(
            state.aiAgents.reduce((sum, ai) => {
              const capability = assertFinite(ai.capability, {
                location: 'HumanEnhancementPhase.execute',
                valueName: `aiAgent[${ai.id}].capability`,
                month: state.currentMonth,
                additionalInfo: { agentId: ai.id, expectedSource: 'AILifecyclePhase or initialization' }
              });
              return sum + capability;
            }, 0) / state.aiAgents.length,
            {
              location: 'HumanEnhancementPhase.execute',
              valueName: 'avgAICapability',
              month: state.currentMonth,
              additionalInfo: { agentCount: state.aiAgents.length }
            }
          )
        : 0;

      // Calculate aggregate metrics from segment data
      // Pass AI capability and current month for phase transition tracking
      if (state.aiAssistedSkillsMetrics) {
        calculateAIAssistedSkillsAggregateMetrics(
          state.society.segments,
          state.aiAssistedSkillsMetrics,
          avgAICapability,
          state.currentMonth
        );
      }

      // Phase 3: Check for competence crisis (AI dependency)
      const competenceEvent = checkCompetenceCrisis(state.society.segments, state.currentMonth);
      if (competenceEvent) {
        events.push({
          id: `competence_crisis_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: competenceEvent.severity as any,
          agent: 'society',
          title: competenceEvent.type,
          description: competenceEvent.description,
          effects: {}
        });
        console.warn(`\n⚠️  ${competenceEvent.type} [Month ${state.currentMonth}]`);
        console.log(`  ${competenceEvent.description}`);
      }

      // Phase 4: Update labor-capital distribution based on AI-driven productivity gains
      if (state.laborCapitalDistribution) {
        const productivityMultiplier = assertFinite(
          calculateProductivityMultiplierFromAIAssistedSkills(state),
          {
            location: 'HumanEnhancementPhase.execute',
            valueName: 'productivityMultiplier',
            month: state.currentMonth,
            additionalInfo: { expectedSource: 'aiAssistedSkills.ts calculation' }
          }
        );

        // UBI level from UBIPhase (order 15.3)
        // MUST exist - validate state property first, then check finite
        const ubiAmount = assertStateProperty(
          state,
          'ubiSystem.basicIncome.amount',
          {
            location: 'HumanEnhancementPhase.execute',
            month: state.currentMonth,
            expectedSource: 'UBIPhase (order 15.3)'
          }
        );
        const ubiLevel = assertFinite(
          ubiAmount,
          {
            location: 'HumanEnhancementPhase.execute',
            valueName: 'ubiLevel',
            month: state.currentMonth,
            additionalInfo: { expectedSource: 'UBIPhase (order 15.3)' }
          }
        );

        // Phase 6: Apply policy interventions if configured
        if (state.policyInterventions === undefined) {
          throw new Error('❌ state.policyInterventions is undefined in HumanEnhancementPhase:84 - initialization bug');
        }
        if (
          (state.policyInterventions.retrainingLevel !== undefined && state.policyInterventions.retrainingLevel > 0) ||
          (state.policyInterventions.teachingSupportLevel !== undefined && state.policyInterventions.teachingSupportLevel > 0) ||
          (state.policyInterventions.jobGuaranteeLevel !== undefined && state.policyInterventions.jobGuaranteeLevel > 0)
        ) {
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
          events.push({
            id: `wage_inequality_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: wageEvent.severity as any,
            agent: 'society',
            title: wageEvent.type,
            description: wageEvent.description,
            effects: {}
          });
          console.warn(`\n⚠️  ${wageEvent.type} [Month ${state.currentMonth}]`);
          console.log(`  ${wageEvent.description}`);
        }

        // Log productivity-wage decoupling when gap becomes significant
        const productivityWageGap = assertInRange(
          state.laborCapitalDistribution.productivityWageGap,
          -1, 1, // Allow negative gaps (wages outpacing productivity is possible but rare)
          {
            location: 'HumanEnhancementPhase.execute',
            valueName: 'productivityWageGap',
            month: state.currentMonth
          }
        );

        if (productivityWageGap > 0.20) {
          const laborShare = assertInRange(
            state.laborCapitalDistribution.laborShare,
            0, 1,
            {
              location: 'HumanEnhancementPhase.execute',
              valueName: 'laborShare',
              month: state.currentMonth
            }
          );

          console.warn(`\n⚠️  Productivity-Wage Gap: ${(productivityWageGap * 100).toFixed(1)}%`);
          console.log(`  Productivity Growth: +${(state.laborCapitalDistribution.productivityGrowth * 100).toFixed(1)}%`);
          console.log(`  Wage Growth: +${(state.laborCapitalDistribution.wageGrowth * 100).toFixed(1)}%`);
          console.log(`  Gains to Capital: ${(state.laborCapitalDistribution.gainsToCapital * 100).toFixed(0)}%`);
          console.log(`  Labor Share: ${(laborShare * 100).toFixed(1)}%`);
        }
      }
    }

    return { events };
  }
}

