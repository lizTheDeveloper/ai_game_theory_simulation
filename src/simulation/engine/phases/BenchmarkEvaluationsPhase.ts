/**
 * Benchmark Evaluations Phase
 *
 * Runs monthly AI capability evaluations and assessments
 * Order: 22.0 (after dystopia progression)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { performMonthlyEvaluations } from '../../benchmark';
import { debugLog } from '@/simulation/utils/debugFlags';

export class BenchmarkEvaluationsPhase implements SimulationPhase {
  readonly id = 'benchmark-evaluations';
  readonly name = 'Benchmark Evaluations';
  readonly order = 22.0;

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents for evaluation
  readonly dependencies = [
    'ai-agent-actions',       // Order 7.0: AI agent actions must complete before evaluation
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    debugLog('AI_AGENTS', () => `[DEBUG BENCHMARK START month=${state.currentMonth}] socialStability = ${state.globalMetrics.socialStability.toFixed(4)}`);
    setDeterministicRng(rng);const benchmarkResult = performMonthlyEvaluations(state, rng);
    debugLog('AI_AGENTS', () => `[DEBUG BENCHMARK END month=${state.currentMonth}] socialStability = ${state.globalMetrics.socialStability.toFixed(4)}`);

    return { events: benchmarkResult.events || [] };
  }
}
