/**
 * Deterministic RNG Singleton
 *
 * CRITICAL: This solves the determinism problem without requiring massive refactoring.
 *
 * PROBLEM: 35+ simulation files use deterministicRandom() internally, making threading
 *          rng() through 200+ function signatures impractical.
 *
 * SOLUTION: Global RNG state that phases can seed before calling helper functions.
 *           This preserves determinism while avoiding massive API changes.
 *
 * USAGE IN PHASES:
 * ```typescript
 * import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
 *
 * execute(state: GameState, rng: RNGFunction): PhaseResult {
 *   // Seed the global RNG from phase's RNG
 *   setDeterministicRng(rng);
 *
 *   // Now all helper functions use deterministic RNG
 *   updateDefensiveAI(state); // Internally calls deterministicRandom()
 *
 *   return { events: [] };
 * }
 * ```
 *
 * USAGE IN HELPER FUNCTIONS:
 * ```typescript
 * import { deterministicRandom } from '@/simulation/utils/deterministicRng';
 *
 * export function someHelper(state: GameState) {
 *   // Replace deterministicRandom() with deterministicRandom()
 *   if (deterministicRandom() < 0.5) {
 *     // ...
 *   }
 * }
 * ```
 *
 * Roy says: "I know, I know - globals are bad. But this is a simulation, not a web server.
 *            We need determinism NOW, and threading rng through 200+ function calls
 *            is a month of work. This gets us there in a day."
 */

/**
 * Global RNG function - set by phases before calling helpers
 */
let currentRng: (() => number) | null = null;

/**
 * Set the global deterministic RNG
 *
 * MUST be called at the start of each phase execution
 *
 * @param rng - The RNG function from phase parameters
 */
export function setDeterministicRng(rng: () => number): void {
  currentRng = rng;
}

/**
 * Get deterministic random number
 *
 * Use this instead of deterministicRandom() in simulation code.
 *
 * @returns Random number in [0, 1)
 * @throws Error if called before setDeterministicRng()
 */
export function deterministicRandom(): number {
  if (currentRng === null) {
    throw new Error(
      '❌ deterministicRandom() called before setDeterministicRng()! ' +
      'Phase must call setDeterministicRng(rng) before using helpers.'
    );
  }
  return currentRng();
}

/**
 * Clear the global RNG (for testing/cleanup)
 *
 * Generally not needed - phases overwrite on each execution
 */
export function clearDeterministicRng(): void {
  currentRng = null;
}

/**
 * Check if deterministic RNG is currently set
 *
 * Useful for defensive checks in initialization code
 */
export function isDeterministicRngSet(): boolean {
  return currentRng !== null;
}
