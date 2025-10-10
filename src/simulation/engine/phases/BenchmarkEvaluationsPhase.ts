/**
 * Benchmark Evaluations Phase
 *
 * Runs monthly AI capability evaluations and assessments
 * Order: 22.0 (after dystopia progression)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class BenchmarkEvaluationsPhase implements SimulationPhase {
  readonly id = 'benchmark-evaluations';
  readonly name = 'Benchmark Evaluations';
  readonly order = 22.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const { performMonthlyEvaluations } = require('../../benchmark');
    const benchmarkResult = performMonthlyEvaluations(state, rng);

    return { events: benchmarkResult.events || [] };
  }
}
