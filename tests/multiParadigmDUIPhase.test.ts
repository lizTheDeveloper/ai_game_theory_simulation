/**
 * Multi-Paradigm DUI Update Phase Tests
 *
 * Validates that the Multi-Paradigm DUI Update Phase correctly calculates
 * paradigm scores from simulation state.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MultiParadigmDUIUpdatePhase } from '../src/simulation/engine/phases/MultiParadigmDUIUpdatePhase';
import { createDefaultInitialState } from '../src/simulation/initialization';

describe('Multi-Paradigm DUI Update Phase', () => {
  it('should calculate Development score correctly from QoL systems', () => {
    const phase = new MultiParadigmDUIUpdatePhase();
    const state = createDefaultInitialState(() => 0.5, 'historical');

    // Initial state has:
    // - globalMetrics.qualityOfLife: 0.65 (should convert to 65/100)
    // - survivalFundamentals: reasonable values
    // - healthcareQuality: 0.5 (should convert to 50/100)

    const result = phase.execute(state, () => 0.5);

    // Development score should be reasonable (not 14.5 like before the fix!)
    assert.ok(state.multiParadigmDUI.paradigmScores.development.value >= 50,
      `Development score should be ≥50, got ${state.multiParadigmDUI.paradigmScores.development.value.toFixed(1)}`);
    assert.ok(state.multiParadigmDUI.paradigmScores.development.value <= 100,
      `Development score should be ≤100, got ${state.multiParadigmDUI.paradigmScores.development.value.toFixed(1)}`);

    console.log(`✓ Development score calculated correctly: ${state.multiParadigmDUI.paradigmScores.development.value.toFixed(1)}`);
  });

  it('should calculate all paradigm scores in valid range', () => {
    const phase = new MultiParadigmDUIUpdatePhase();
    const state = createDefaultInitialState(() => 0.5, 'historical');

    const result = phase.execute(state, () => 0.5);

    // All scores should be 0-100
    assert.ok(state.multiParadigmDUI.paradigmScores.western.value >= 0 && state.multiParadigmDUI.paradigmScores.western.value <= 100,
      `Western score out of range: ${state.multiParadigmDUI.paradigmScores.western.value}`);
    assert.ok(state.multiParadigmDUI.paradigmScores.development.value >= 0 && state.multiParadigmDUI.paradigmScores.development.value <= 100,
      `Development score out of range: ${state.multiParadigmDUI.paradigmScores.development.value}`);
    assert.ok(state.multiParadigmDUI.paradigmScores.ecological.value >= 0 && state.multiParadigmDUI.paradigmScores.ecological.value <= 100,
      `Ecological score out of range: ${state.multiParadigmDUI.paradigmScores.ecological.value}`);
    assert.ok(state.multiParadigmDUI.diagnosticLenses.indigenous.value >= 0 && state.multiParadigmDUI.diagnosticLenses.indigenous.value <= 100,
      `Indigenous score out of range: ${state.multiParadigmDUI.diagnosticLenses.indigenous.value}`);

    console.log(`✓ All paradigm scores valid: W=${state.multiParadigmDUI.paradigmScores.western.value.toFixed(1)}, D=${state.multiParadigmDUI.paradigmScores.development.value.toFixed(1)}, E=${state.multiParadigmDUI.paradigmScores.ecological.value.toFixed(1)}, I=${state.multiParadigmDUI.diagnosticLenses.indigenous.value.toFixed(1)}`);
  });

  it('should update history correctly', () => {
    const phase = new MultiParadigmDUIUpdatePhase();
    const state = createDefaultInitialState(() => 0.5, 'historical');

    // Run phase twice to build history
    phase.execute(state, () => 0.5);
    state.currentMonth++;
    phase.execute(state, () => 0.5);

    // History should have 2 entries
    assert.strictEqual(state.multiParadigmDUI.history.length, 2,
      `History should have 2 entries, got ${state.multiParadigmDUI.history.length}`);

    // Entries should have correct months
    assert.strictEqual(state.multiParadigmDUI.history[0].month, 0, 'First entry should be month 0');
    assert.strictEqual(state.multiParadigmDUI.history[1].month, 1, 'Second entry should be month 1');

    console.log('✓ History tracking works correctly');
  });

  it('should calculate divergence metrics', () => {
    const phase = new MultiParadigmDUIUpdatePhase();
    const state = createDefaultInitialState(() => 0.5, 'historical');

    const result = phase.execute(state, () => 0.5);

    // Divergence should be calculated
    assert.ok(state.multiParadigmDUI.divergence.overall >= 0,
      `Overall divergence should be ≥0, got ${state.multiParadigmDUI.divergence.overall}`);
    assert.ok(state.multiParadigmDUI.divergence.maxRange >= 0,
      `Max range should be ≥0, got ${state.multiParadigmDUI.divergence.maxRange}`);

    console.log(`✓ Divergence calculated: overall=${state.multiParadigmDUI.divergence.overall.toFixed(1)}, maxRange=${state.multiParadigmDUI.divergence.maxRange.toFixed(1)}`);
  });

  it('should classify outcome correctly', () => {
    const phase = new MultiParadigmDUIUpdatePhase();
    const state = createDefaultInitialState(() => 0.5, 'historical');

    const result = phase.execute(state, () => 0.5);

    // Outcome should be classified
    assert.ok(state.multiParadigmDUI.outcome.label, 'Outcome label should exist');
    assert.ok(state.multiParadigmDUI.outcome.utopiasCount >= 0 && state.multiParadigmDUI.outcome.utopiasCount <= 4,
      'Utopias count should be 0-4');
    assert.ok(state.multiParadigmDUI.outcome.dystopiasCount >= 0 && state.multiParadigmDUI.outcome.dystopiasCount <= 4,
      'Dystopias count should be 0-4');

    console.log(`✓ Outcome classified: ${state.multiParadigmDUI.outcome.label} (utopias: ${state.multiParadigmDUI.outcome.utopiasCount}, dystopias: ${state.multiParadigmDUI.outcome.dystopiasCount})`);
  });

});
