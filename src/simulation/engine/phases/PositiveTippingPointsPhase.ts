/**
 * PositiveTippingPointsPhase (20.5)
 *
 * Executes positive tipping point cascade dynamics:
 * - Technology adoption S-curves (solar PV, EVs, wind, heat pumps)
 * - Cascade detection and triggering (5-20% market share thresholds)
 * - Learning curve dynamics (Wright's Law: 2x production → 20-30% cost reduction)
 * - Cross-technology synergies (EV + grid batteries → shared learning)
 * - Environmental impact (emissions reduction)
 *
 * Research Foundation:
 * - OECD (2025): "Triggering positive tipping points for climate action" (TRL 6-8)
 * - Earth System Dynamics (2024): "Positive cross-system cascades" (TRL 6-7)
 * - Nature Sustainability (2023): "Tipping points in renewable energy" (TRL 8-9)
 *
 * Expected Impact: +5-15% humane utopia rate via accelerated clean tech adoption
 *
 * **EXECUTION ORDER:** 20.5 (After technology deployment, before crisis detection)
 * **DEPENDENCIES:** Requires resource economy, global metrics
 * **SIDE EFFECTS:**
 * - Modifies positive tipping points state
 * - Reduces CO2 emissions
 * - Boosts economic stage (cost savings)
 * - Returns cascade trigger events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';
import { updatePositiveTippingPoints } from '@/simulation/positiveTippingPoints';

export class PositiveTippingPointsPhase implements SimulationPhase {
  readonly id = 'positive-tipping-points';
  readonly name = 'Positive Tipping Point Cascades';
  readonly order = 20.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];

    // Track initial state for event logging
    const initialActiveCascades = state.positiveTippingPoints.activeCascades;
    const initialTriggeredCount = state.positiveTippingPoints.triggeredCascades.length;

    // Update positive tipping point dynamics
    updatePositiveTippingPoints(state, rng);

    // Log new cascade triggers
    const newTriggeredCount = state.positiveTippingPoints.triggeredCascades.length;
    if (newTriggeredCount > initialTriggeredCount) {
      const newCascades = state.positiveTippingPoints.triggeredCascades.slice(initialTriggeredCount);

      for (const cascade of newCascades) {
        events.push({
          type: 'positive-cascade-triggered',
          description: `Positive tipping cascade triggered: ${cascade.type} (${cascade.triggerReason})`,
          severity: 'info',
          timestamp: state.currentMonth,
          details: {
            technology: cascade.type,
            reason: cascade.triggerReason,
            marketShare: cascade.marketShareAtTrigger,
            cascadeStrength: (state.positiveTippingPoints.adoptionTracking as any)[
              cascade.type === 'solar-pv' ? 'solarPV' :
              cascade.type === 'electric-vehicles' ? 'electricVehicles' :
              cascade.type === 'wind-power' ? 'windPower' :
              cascade.type === 'heat-pumps' ? 'heatPumps' :
              'batteryStorage'
            ]?.cascadeStrength || 0,
            expectedDuration: cascade.expectedDuration,
            environmentalImpact: cascade.environmentalImpact,
          }
        });
      }
    }

    // Log significant milestones
    const ptp = state.positiveTippingPoints;

    // Check for high adoption thresholds
    if (ptp.adoptionTracking.solarPV.marketShare > 0.50 && state.currentMonth % 12 === 0) {
      events.push({
        type: 'positive-milestone',
        description: `Solar PV adoption exceeds 50% global electricity`,
        severity: 'info',
        timestamp: state.currentMonth,
        details: {
          technology: 'solar-pv',
          marketShare: ptp.adoptionTracking.solarPV.marketShare,
        }
      });
    }

    if (ptp.adoptionTracking.electricVehicles.marketShare > 0.50 && state.currentMonth % 12 === 0) {
      events.push({
        type: 'positive-milestone',
        description: `Electric vehicles exceed 50% global fleet`,
        severity: 'info',
        timestamp: state.currentMonth,
        details: {
          technology: 'electric-vehicles',
          marketShare: ptp.adoptionTracking.electricVehicles.marketShare,
        }
      });
    }

    // Log major emissions reduction milestones
    if (ptp.cumulativeEmissionsReduction > 10.0 && state.currentMonth % 24 === 0) {
      events.push({
        type: 'positive-milestone',
        description: `Positive cascades prevented ${ptp.cumulativeEmissionsReduction.toFixed(1)} Gt CO2`,
        severity: 'info',
        timestamp: state.currentMonth,
        details: {
          cumulativeEmissionsReduction: ptp.cumulativeEmissionsReduction,
          activeCascades: ptp.activeCascades,
        }
      });
    }

    return { events };
  }
}
