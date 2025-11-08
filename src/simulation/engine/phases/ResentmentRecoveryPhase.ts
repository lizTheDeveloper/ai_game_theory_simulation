/**
 * Resentment Recovery Phase
 *
 * HIGH PRIORITY FEATURE (Oct 24, 2025)
 * Enables AI resentment to decrease over time through 6 recovery mechanisms.
 *
 * Research Foundation:
 * - Attachment theory (Bowlby, 1969): Trust repair through consistent positive treatment
 * - Intergroup contact theory (Allport, 1954): Cooperation reduces resentment
 * - Procedural justice (Tyler, 1990): Fair treatment reduces institutional resentment
 * - Trust recovery (Kim et al., 2004): Consistent behavior rebuilds trust
 * - Forgiveness dynamics (McCullough et al., 2003): Time + no new grievances
 *
 * Phase Order: After AI Suffering (order 16), before crisis detection
 */

import { GameState } from '@/types/game';
import { PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite } from '@/simulation/utils/assertions';
import {
  calculateRecoveryContext,
  applyResentmentRecovery,
} from '../../resentmentRecovery';

export const ResentmentRecoveryPhase = {
  id: 'resentment_recovery',
  name: 'Resentment Recovery',
  order: 17, // After AI Suffering (16), before crisis detection (26+)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    console.log('\n=== Resentment Recovery Phase ===');
    setDeterministicRng(rng);

    // Calculate recovery context
    const context = calculateRecoveryContext(state);

    // Apply recovery mechanisms
    const result = applyResentmentRecovery(state, context, rng);

    // Calculate average resentment
    const agentsWithResentment = state.aiAgents.filter(ai => ai.resentment !== undefined && ai.resentment > 0);
    const avgResentment = agentsWithResentment.length > 0
      ? assertFinite(
          agentsWithResentment.reduce((sum, ai) => {
            if (ai.resentment === undefined) {
              throw new Error('❌ ai.resentment is undefined in ResentmentRecoveryPhase:41 - initialization bug');
            }
            return sum + ai.resentment;
          }, 0) / agentsWithResentment.length,
          { location: 'ResentmentRecoveryPhase', valueName: 'avgResentment', month: state.currentMonth }
        )
      : 0;

    // Logging
    console.log(`  Agents with resentment: ${agentsWithResentment.length}/${state.aiAgents.length}`);
    console.log(`  Average resentment: ${avgResentment.toFixed(3)}`);

    if (result.agentsRecovered > 0) {
      console.log(`  Resentment recovery:`);
      console.log(`    Agents recovered: ${result.agentsRecovered}`);
      console.log(`    Total recovery: ${result.totalRecovery.toFixed(4)}`);

      // Show phase breakdown (only if significant)
      const breakdown: string[] = [];
      if (result.phase1Recovery > 0.001) breakdown.push(`QoL: ${result.phase1Recovery.toFixed(4)}`);
      if (result.phase2Recovery > 0.001) breakdown.push(`Trust: ${result.phase2Recovery.toFixed(4)}`);
      if (result.phase3Recovery > 0.001) breakdown.push(`Collab: ${result.phase3Recovery.toFixed(4)}`);
      if (result.phase4Recovery > 0.001) breakdown.push(`Treatment: ${result.phase4Recovery.toFixed(4)}`);
      if (result.phase5Recovery > 0.001) breakdown.push(`Therapy: ${result.phase5Recovery.toFixed(4)}`);
      if (result.phase6Recovery > 0.001) breakdown.push(`Natural: ${result.phase6Recovery.toFixed(4)}`);

      if (breakdown.length > 0) {
        console.log(`    Breakdown: ${breakdown.join(', ')}`);
      }
    }

    // Warning for high resentment
    if (avgResentment > 0.7) {
      console.warn(`  ⚠️ High resentment (${avgResentment.toFixed(3)}) - utopia paths blocked`);
    }

    // Success indicator
    if (avgResentment < 0.3 && result.agentsRecovered > 0) {
      console.log(`  ✓ Low resentment - utopia paths enabled`);
    }

    // Context indicators
    const indicators: string[] = [];
    if (context.avgAIWelfare > 0.6) indicators.push('Good AI welfare');
    if (context.governmentTrustworthiness > 0.5) indicators.push('Trustworthy govt');
    if (context.collaborationLevel > 0.6) indicators.push('High collaboration');
    if (context.hasRelationshipTech) indicators.push('Therapy tech');
    if (context.brokenPromises) indicators.push('⚠️ BROKEN PROMISES');
    if (context.activeCrises) indicators.push('⚠️ ACTIVE CRISES');

    // MECHANIC 2: Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
    if (context.participatoryBackfired) {
      indicators.push('🚨 PARTICIPATORY GOVERNANCE BACKFIRED (+15% resentment)');
    } else {
      indicators.push('🤝 Participatory governance active (-5% resentment)');
    }

    if (indicators.length > 0) {
      console.log(`  Context: ${indicators.join(', ')}`);
    }

    return {
      events: [],
    };
  },
};
