/**
 * Benchmark Evaluations Phase
 *
 * Runs monthly AI capability evaluations and assessments
 * Order: 22.0 (after dystopia progression)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext} from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class BenchmarkEvaluationsPhase implements SimulationPhase {
  readonly id = 'benchmark-evaluations';
  readonly name = 'Benchmark Evaluations';
  readonly order = 22.0;
  dependencies = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    console.log(`[DEBUG BENCHMARK START month=${state.currentMonth}] socialStability = ${state.globalMetrics.socialStability.toFixed(4)}`);
    setDeterministicRng(rng);
    const { performMonthlyEvaluations } = require('../../benchmark');
    const benchmarkResult = performMonthlyEvaluations(state, rng);
    console.log(`[DEBUG BENCHMARK END month=${state.currentMonth}] socialStability = ${state.globalMetrics.socialStability.toFixed(4)}`);

    return { events: benchmarkResult.events || [] };
  }
}
