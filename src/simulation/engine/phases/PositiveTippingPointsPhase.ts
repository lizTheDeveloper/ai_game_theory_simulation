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

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { updatePositiveTippingPoints } from '@/simulation/positiveTippingPoints';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions'; // Module uses assertions

export class PositiveTippingPointsPhase implements SimulationPhase {
  readonly id = 'positive-tipping-points';
  readonly name = 'Positive Tipping Point Cascades';
  readonly order = 20.5;

  // DEPENDENCIES (Nov 6, 2025): Must run after tech tree
  readonly dependencies = [
    'tech-tree',  // Order 12.5: Technology breakthroughs enable cascades
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Track initial state for event logging
    const initialActiveCascades = state.positiveTippingPoints.activeTechCascades;
    const initialTriggeredCount = state.positiveTippingPoints.triggeredCascades.length;

    // Update positive tipping point dynamics
    updatePositiveTippingPoints(state, rng);

    // Log new cascade triggers
    const newTriggeredCount = state.positiveTippingPoints.triggeredCascades.length;
    if (newTriggeredCount > initialTriggeredCount) {
      const newCascades = state.positiveTippingPoints.triggeredCascades.slice(initialTriggeredCount);

      for (const cascade of newCascades) {
        events.push({
          id: `positive-cascade-${cascade.type}-${state.currentMonth}`,
          type: 'positive-cascade-triggered',
          title: 'Positive Tipping Cascade Triggered',
          description: `Positive tipping cascade triggered: ${cascade.type} (${cascade.triggerReason})`,
          severity: 'info',
          timestamp: state.currentMonth,
          agent: 'technology',
          effects: {
            technology: cascade.type,
            reason: cascade.triggerReason,
            marketShare: cascade.marketShareAtTrigger,
            cascadeStrength: (() => {
              const tracking = (state.positiveTippingPoints.adoptionTracking as any)[
                cascade.type === 'solar-pv' ? 'solarPV' :
                cascade.type === 'electric-vehicles' ? 'electricVehicles' :
                cascade.type === 'wind-power' ? 'windPower' :
                cascade.type === 'heat-pumps' ? 'heatPumps' :
                'batteryStorage'
              ];
              if (tracking === undefined || tracking.cascadeStrength === undefined) {
                throw new Error('❌ adoptionTracking cascadeStrength is undefined in PositiveTippingPointsPhase:67 - initialization bug');
              }
              return tracking.cascadeStrength;
            })(),
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
        id: `solar-pv-milestone-${state.currentMonth}`,
        type: 'positive-milestone',
        title: 'Solar PV Adoption Milestone',
        description: `Solar PV adoption exceeds 50% global electricity`,
        severity: 'info',
        timestamp: state.currentMonth,
        agent: 'technology',
        effects: {
          technology: 'solar-pv',
          marketShare: ptp.adoptionTracking.solarPV.marketShare,
        }
      });
    }

    if (ptp.adoptionTracking.electricVehicles.marketShare > 0.50 && state.currentMonth % 12 === 0) {
      events.push({
        id: `ev-milestone-${state.currentMonth}`,
        type: 'positive-milestone',
        title: 'Electric Vehicle Adoption Milestone',
        description: `Electric vehicles exceed 50% global fleet`,
        severity: 'info',
        timestamp: state.currentMonth,
        agent: 'technology',
        effects: {
          technology: 'electric-vehicles',
          marketShare: ptp.adoptionTracking.electricVehicles.marketShare,
        }
      });
    }

    // Log major emissions reduction milestones
    if (ptp.cumulativeEmissionsReduction > 10.0 && state.currentMonth % 24 === 0) {
      events.push({
        id: `emissions-reduction-${state.currentMonth}`,
        type: 'positive-milestone',
        title: 'Emissions Reduction Milestone',
        description: `Positive cascades prevented ${ptp.cumulativeEmissionsReduction.toFixed(1)} Gt CO2`,
        severity: 'info',
        timestamp: state.currentMonth,
        agent: 'environmental',
        effects: {
          cumulativeEmissionsReduction: ptp.cumulativeEmissionsReduction,
          activeCascades: ptp.activeTechCascades,
        }
      });
    }

    return { events };
  }
}
