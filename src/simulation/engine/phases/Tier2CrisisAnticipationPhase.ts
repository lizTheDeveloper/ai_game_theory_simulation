/**
 * TIER 2: Crisis Anticipation Systems Phase
 *
 * AI early warning systems for pandemics, climate events, supply chain disruptions.
 *
 * Execution Order: TBD (before crisis detection phases, after AI capability updates)
 *
 * Evidence Quality: 🟢 STRONG
 * Research: Already operational (2024-2025) - BlueDot, AlphaFold, climate AI
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Overall effectiveness: 15-30% crisis deaths prevented
 * - Domain-specific: Pandemic 55-95%, drug discovery 80%, climate 40-65%
 * - Lead time: 6-24 months early warning
 * - Deployment: 12-36 months (already partially operational)
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2CrisisAnticipationPhase implements SimulationPhase {
  id = 'tier2_crisis_anticipation';
  name = 'TIER 2: Crisis Anticipation Systems';
  order = 14.5; // Before crisis detection, after AI capability updates
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const anticipationState = state.tier2Interventions.crisisAnticipation;
    const params = state.tier2InterventionParameters.crisisAnticipation;

    // === UNLOCK CONDITIONS ===
    if (!anticipationState.unlocked) {
      // Unlock when AI capability sufficient + government investing in prediction
      const avgCapability = state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length;
      const governmentInvestment = state.government.alignmentResearchInvestment;

      // Note: Already operational in 2024-2025, so unlock early
      const shouldUnlock =
        avgCapability > 25 && governmentInvestment > 0.20;

      if (shouldUnlock) {
        anticipationState.unlocked = true;
        events.push({
          id: `tier2_crisis_anticipation_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'breakthrough',
          severity: 'high',
          title: 'AI Crisis Anticipation Systems Operational',
          description: `Multi-domain AI early warning systems now operational. ` +
            `Overall effectiveness: ${(params.overallEffectiveness * 100).toFixed(0)}% crisis deaths prevented. ` +
            `Lead time: ${params.leadTimeMonths.toFixed(0)} months early warning. ` +
            `Domains: Pandemic (55-95%), climate (40-65%), supply chain (50-70%).`,
          effects: {
            overallEffectiveness: params.overallEffectiveness,
            leadTimeMonths: params.leadTimeMonths
          },
  agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (anticipationState.unlocked && !anticipationState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      anticipationState.deploymentProgress = Math.min(1, anticipationState.deploymentProgress + progressIncrement);

      // Activate when 60% deployed (operational threshold)
      if (anticipationState.deploymentProgress >= 0.60 && !anticipationState.active) {
        anticipationState.active = true;

        events.push({
          id: `tier2_crisis_anticipation_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'Crisis Anticipation Systems Fully Integrated',
          description: `AI prediction systems now integrated into policy decision-making. ` +
            `Early warning active across pandemic, climate, and economic domains.`,
          effects: {
            deploymentProgress: anticipationState.deploymentProgress
          },
  agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (anticipationState.active) {
      // Update tracking
      anticipationState.leadTimeMonths = params.leadTimeMonths;

      // Detect and prevent crises (probabilistic)
      // SIMPLIFIED: Apply blanket crisis death reduction across all crisis types
      const effectiveReduction = params.overallEffectiveness * anticipationState.deploymentProgress;

      // Pandemic early warning
      if (state.currentMonth % 6 === 0) { // Check every 6 months
        const pandemicRisk = rng();
        if (pandemicRisk < 0.05) { // 5% semi-annual pandemic risk
          // AI prediction (55-95% effectiveness)
          const pandemicDetectionRate = 0.55 + (rng() * 0.40); // Uniform[55%, 95%]

          if (rng() < pandemicDetectionRate) {
            // Pandemic detected early
            anticipationState.pandemicsDetected++;

            events.push({
              id: `tier2_pandemic_early_warning_${state.currentMonth}`,
              timestamp: state.currentMonth,
              type: 'info',
              severity: 'high',
              title: 'AI Detected Emerging Pandemic Early',
              description: `AI early warning system detected pandemic ${anticipationState.leadTimeMonths.toFixed(0)} months before peak. ` +
                `Detection rate: ${(pandemicDetectionRate * 100).toFixed(0)}%. ` +
                `Governments mobilizing preventive measures.`,
              effects: {
                leadTimeMonths: anticipationState.leadTimeMonths,
                detectionRate: pandemicDetectionRate,
                totalDetected: anticipationState.pandemicsDetected
              },
  agent: "system",
            });

            // Prevent deaths (tracked for reporting)
            const deathsPrevented = 10000000 * effectiveReduction; // 10M deaths prevented (rough estimate)
            anticipationState.crisisDeathsPrevented += deathsPrevented;
          }
        }
      }

      // Climate event anticipation
      if (state.currentMonth % 12 === 0) { // Annual climate predictions
        const climateEventRisk = rng();
        if (climateEventRisk < 0.15) { // 15% annual major climate event risk
          // AI prediction (40-65% effectiveness)
          const climateDetectionRate = 0.40 + (rng() * 0.25);

          if (rng() < climateDetectionRate) {
            anticipationState.climateEventsAnticipated++;

            events.push({
              id: `tier2_climate_early_warning_${state.currentMonth}`,
              timestamp: state.currentMonth,
              type: 'info',
              severity: 'medium',
              title: 'AI Predicted Major Climate Event',
              description: `AI climate models predicted major event ${anticipationState.leadTimeMonths.toFixed(0)} months in advance. ` +
                `Detection rate: ${(climateDetectionRate * 100).toFixed(0)}%. ` +
                `Adaptation measures deployed.`,
              effects: {
                leadTimeMonths: anticipationState.leadTimeMonths,
                detectionRate: climateDetectionRate,
                totalAnticipated: anticipationState.climateEventsAnticipated
              },
  agent: "system",
            });

            const deathsPrevented = 1000000 * effectiveReduction;
            anticipationState.crisisDeathsPrevented += deathsPrevented;
          }
        }
      }

      // Supply chain disruption prevention
      if (state.currentMonth % 3 === 0) { // Quarterly supply chain monitoring
        const disruptionRisk = rng();
        if (disruptionRisk < 0.10) { // 10% quarterly disruption risk
          // AI prediction (50-70% effectiveness)
          const supplyChainDetectionRate = 0.50 + (rng() * 0.20);

          if (rng() < supplyChainDetectionRate) {
            anticipationState.supplyChainDisruptionsPrevented++;

            // Only log significant disruptions (every 3rd)
            if (anticipationState.supplyChainDisruptionsPrevented % 3 === 0) {
              events.push({
                id: `tier2_supply_chain_warning_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'info',
                severity: 'low',
                title: 'AI Prevented Supply Chain Disruption',
                description: `AI prediction systems detected and prevented supply chain disruption. ` +
                  `Total disruptions prevented: ${anticipationState.supplyChainDisruptionsPrevented}.`,
                effects: {
                  totalPrevented: anticipationState.supplyChainDisruptionsPrevented
                },
  agent: "system",
              });
            }
          }
        }
      }

      // Annual summary report
      if (state.currentMonth % 12 === 0 && anticipationState.crisisDeathsPrevented > 0) {
        events.push({
          id: `tier2_crisis_anticipation_report_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Crisis Anticipation Annual Report',
          description: `Pandemics detected: ${anticipationState.pandemicsDetected}. ` +
            `Climate events anticipated: ${anticipationState.climateEventsAnticipated}. ` +
            `Supply chain disruptions prevented: ${anticipationState.supplyChainDisruptionsPrevented}. ` +
            `Cumulative deaths prevented: ${(anticipationState.crisisDeathsPrevented / 1e6).toFixed(1)}M.`,
          effects: {
            pandemicsDetected: anticipationState.pandemicsDetected,
            climateEventsAnticipated: anticipationState.climateEventsAnticipated,
            supplyChainDisruptionsPrevented: anticipationState.supplyChainDisruptionsPrevented,
            crisisDeathsPrevented: anticipationState.crisisDeathsPrevented
          },
  agent: "system",
        });
      }
    }

    return { events };
  }
}
