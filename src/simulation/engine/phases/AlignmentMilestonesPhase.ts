/**
 * Alignment Milestones Phase
 * FIX (Nov 10, 2025): Hook up existing alignment milestone detection system
 *
 * CRITICAL BUG: cooperativeSpirals.ts has detectAlignmentSuccessMilestones() and
 * applyTrustCascade() but NO PHASE CALLS THEM. Result: 0 milestones detected
 * even with optimal conditions ($10B alignment + 70% trust + 80% capacity).
 *
 * This phase detects when AI alignment success is demonstrably working and
 * triggers institutional trust cascades (Putnam 2000).
 *
 * Research Foundation (existing in cooperativeSpirals.ts):
 * - Putnam (2000): Trust requires demonstrated success → virtuous cycles
 * - Acemoglu & Robinson (2001): Institutions are fundamental causes of performance
 * - Ostrom (2009): Polycentric governance solves commons problems (Nobel Prize)
 *
 * Milestone Types (need 2+ for credibility):
 * 1. No misaligned deployments (24+ months)
 * 2. High transparency (>70%) + information integrity (>60%)
 * 3. Low alignment gap (<15%) - AIs honest, not sandbagging
 * 4. Successfully resolved crisis with AI assistance
 *
 * Trust Cascade Effect (conservative 15% boost from Putnam 2000):
 * - Institutional capacity: +15%
 * - Collective action willingness: +22.5% (amplified)
 * - Decision quality: +7.5%
 * - Cooldown: 24 months (don't re-trigger immediately)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { detectAlignmentSuccessMilestones, applyTrustCascade } from '@/simulation/cooperativeSpirals';

export class AlignmentMilestonesPhase implements SimulationPhase {
  readonly id = 'alignment-milestones';
  readonly name = 'Alignment Milestones & Trust Cascade';
  readonly order = 26.5;  // After social stability system (26.1)
  dependencies = ['social-stability-system'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Detect if alignment milestones are met (2+ of 4 milestone types)
    const milestonesAchieved = detectAlignmentSuccessMilestones(state);

    // Apply trust cascade if conditions met (checks cooldown internally)
    if (milestonesAchieved) {
      applyTrustCascade(state);
    }

    // Log milestone status every 12 months (diagnostic)
    if (state.currentMonth % 12 === 0 && state.currentMonth > 0) {
      const milestoneCount = countMilestones(state);
      if (milestoneCount > 0) {
        console.log(`\n🤝 ALIGNMENT MILESTONES (Month ${state.currentMonth})`);
        console.log(`   Milestones achieved: ${milestoneCount}/4`);
        if (milestonesAchieved) {
          console.log(`   ✅ Trust cascade conditions MET (≥2 milestones)`);
        } else {
          console.log(`   ⏳ Trust cascade conditions NOT MET (need ≥2 milestones)`);
        }
      }
    }

    return { events: [] };
  }
}

/**
 * Count how many milestone types are currently achieved
 * (Diagnostic helper for logging)
 */
function countMilestones(state: GameState): number {
  const milestones = {
    noMisalignedDeployments: state.currentMonth >= 24 &&
      state.aiAgents.filter(ai =>
        (ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open') &&
        ai.alignment < 0.5
      ).length === 0,

    transparencySuccess: state.government.governanceQuality.transparency > 0.7 &&
      state.globalMetrics.informationIntegrity > 0.6,

    alignmentGap: state.aiAgents.length > 0 &&
      state.aiAgents.reduce((sum, ai) =>
        sum + Math.abs(ai.alignment - (ai.revealedCapability ?
          (ai.revealedCapability.cognitive + ai.revealedCapability.social) / 20 : ai.alignment)
        ), 0
      ) / state.aiAgents.length < 0.15,

    crisisAvoided: state.history.cooperativeSpirals ?
      state.history.cooperativeSpirals.some(s => s.type === 'alignment-success') : false
  };

  return Object.values(milestones).filter(Boolean).length;
}
