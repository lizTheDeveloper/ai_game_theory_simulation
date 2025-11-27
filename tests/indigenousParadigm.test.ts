/**
 * Indigenous/Communitarian Paradigm Tests
 *
 * Validates 3-tier data strategy:
 * - DIRECT (Bhutan GNH)
 * - PROXY (WVS countries)
 * - DERIVED (simulation-only)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateIndigenousParadigm, generateIndigenousAdvocacyReport, getIndigenousDataQuality } from '../src/simulation/indigenousParadigm';
import type { BhutanGNHData, WVSProxyData } from '../src/simulation/indigenousParadigm';
import type { GameState } from '../src/types/game';

// Create minimal mock state for testing
function createMockState(): GameState {
  return {
    socialAccumulation: {
      socialCohesion: {
        trust: 70,           // [0, 100] Social trust
        communityBonds: 70,  // [0, 100] Community bonds
        civilLiberties: 75,  // [0, 100] Civil liberties
      },
      meaningCrisisLevel: 0.20,
      institutionalLegitimacy: 0.75,
    },
    society: {
      unemploymentLevel: 0.06,
    },
    globalMetrics: {
      wealthDistribution: 0.75,
      qualityOfLife: 0.72,
    },
  } as GameState; // Type assertion to avoid needing full state
}

describe('Indigenous Paradigm - 3-Tier Data Strategy', () => {
  it('Tier 1: Bhutan with direct GNH data (HIGH confidence)', () => {
    const state = createMockState();

    const bhutanGNH: BhutanGNHData = {
      index: 0.781, // Bhutan GNH 2022
      happinessRate: 0.91, // 91% "happy"
      domains: {
        psychologicalWellbeing: 0.75,
        health: 0.80,
        education: 0.72,
        timeUse: 0.68,
        culturalDiversity: 0.88,
        goodGovernance: 0.65,
        communityVitality: 0.82,
        ecologicalDiversity: 0.90,
        livingStandards: 0.72,
      },
      year: 2022,
    };

    const result = calculateIndigenousParadigm(state, 'BTN', undefined, bhutanGNH);

    // Verify HIGH confidence
    assert.strictEqual(result.confidence, 'HIGH', 'Bhutan should have HIGH confidence');

    // Verify 100% data availability
    assert.strictEqual(result.dataAvailability, 1.0, 'Bhutan should have 100% data availability');

    // Verify score conversion (0.781 → 78.1)
    assert.ok(Math.abs(result.value - 78.1) < 0.1, `Expected ~78.1, got ${result.value}`);

    // Verify doesn't drive simulation
    assert.strictEqual(result.drivesSimulation, false, 'Should be reporting-only');

    // Verify derivation breakdown
    assert.strictEqual(result.derivation.fromSimulation, 0.0, 'Bhutan should use 0% simulation');
    assert.strictEqual(result.derivation.fromProxies, 0.0, 'Bhutan should use 0% proxies');
    assert.strictEqual(result.derivation.estimated, 0.0, 'Bhutan should use 0% estimation');

    console.log('✓ Bhutan GNH test passed: score =', result.value.toFixed(1));
  });

  it('Tier 2: Country with WVS proxy data (MEDIUM confidence)', () => {
    const state = createMockState();

    // Norway-like WVS data (high trust Nordic country)
    const norwayWVS: WVSProxyData = {
      countryCode: 'NOR',
      socialTrust: 74, // Norway ~74% social trust (WVS Wave 7)
      communityImportance: 68,
      civicParticipation: 62,
      year: 2020,
    };

    const result = calculateIndigenousParadigm(state, 'NOR', norwayWVS);

    // Verify MEDIUM confidence
    assert.strictEqual(result.confidence, 'MEDIUM', 'WVS countries should have MEDIUM confidence');

    // Verify 60% data availability (WVS proxies)
    assert.strictEqual(result.dataAvailability, 0.6, 'WVS countries should have 60% data availability');

    // Verify doesn't drive simulation
    assert.strictEqual(result.drivesSimulation, false, 'Should be reporting-only');

    // Verify derivation breakdown (60% proxy, 40% simulation)
    assert.strictEqual(result.derivation.fromSimulation, 0.4, 'Should use 40% simulation');
    assert.strictEqual(result.derivation.fromProxies, 0.6, 'Should use 60% WVS proxies');
    assert.strictEqual(result.derivation.estimated, 0.0, 'Should use 0% estimation');

    // Verify score is reasonable (high trust → high score)
    assert.ok(result.value > 60, `Expected score >60 for high-trust country, got ${result.value}`);

    console.log('✓ Norway WVS proxy test passed: score =', result.value.toFixed(1));
  });

  it('Tier 3: Country with no data (LOW confidence, derived)', () => {
    const state = createMockState();

    // Set baseline social conditions
    state.socialAccumulation.socialCohesion = 0.65;
    state.socialAccumulation.meaningCrisisLevel = 0.25;
    state.socialAccumulation.institutionalLegitimacy = 0.70;
    state.society.unemploymentLevel = 0.08;
    state.globalMetrics.wealthDistribution = 0.72;

    const result = calculateIndigenousParadigm(state, 'XYZ'); // Fictional country

    // Verify LOW confidence
    assert.strictEqual(result.confidence, 'LOW', 'Derived scores should have LOW confidence');

    // Verify 0% data availability
    assert.strictEqual(result.dataAvailability, 0.0, 'Derived scores should have 0% data availability');

    // Verify doesn't drive simulation
    assert.strictEqual(result.drivesSimulation, false, 'Should be reporting-only');

    // Verify derivation breakdown (75% simulation, 25% estimated)
    assert.strictEqual(result.derivation.fromSimulation, 0.75, 'Should use 75% simulation');
    assert.strictEqual(result.derivation.fromProxies, 0.0, 'Should use 0% proxies');
    assert.strictEqual(result.derivation.estimated, 0.25, 'Should use 25% estimation');

    // Verify has 5 indicators
    assert.strictEqual(result.indicators.length, 5, 'Should have 5 derived indicators');

    console.log('✓ Derived score test passed: score =', result.value.toFixed(1));
  });

  it('Data quality assessment', () => {
    // Bhutan
    const bhutanQuality = getIndigenousDataQuality('BTN');
    assert.strictEqual(bhutanQuality.hasGNH, true, 'Bhutan should have GNH');
    assert.strictEqual(bhutanQuality.confidence, 'HIGH', 'Bhutan should have HIGH confidence');

    // USA (has WVS)
    const usaQuality = getIndigenousDataQuality('USA');
    assert.strictEqual(usaQuality.hasGNH, false, 'USA should not have GNH');
    assert.strictEqual(usaQuality.hasWVS, true, 'USA should have WVS');
    assert.strictEqual(usaQuality.confidence, 'MEDIUM', 'USA should have MEDIUM confidence');

    // Random country without data
    const randomQuality = getIndigenousDataQuality('ZZZ');
    assert.strictEqual(randomQuality.hasGNH, false, 'Random country should not have GNH');
    assert.strictEqual(randomQuality.hasWVS, false, 'Random country should not have WVS');
    assert.strictEqual(randomQuality.confidence, 'LOW', 'Random country should have LOW confidence');

    console.log('✓ Data quality assessment test passed');
  });

  it('Advocacy report generation', () => {
    const report = generateIndigenousAdvocacyReport();

    // Verify key content
    assert.ok(report.includes('0.5% coverage'), 'Should mention 0.5% coverage');
    assert.ok(report.includes('gap in our values'), 'Should include advocacy message');
    assert.ok(report.includes('Bhutan'), 'Should mention Bhutan');
    assert.ok(report.includes('World Values Survey'), 'Should mention WVS');
    assert.ok(report.includes('GDP'), 'Should compare to GDP');

    console.log('✓ Advocacy report generation test passed');
  });

  it('Geometric mean handles low values correctly', () => {
    const state = createMockState();

    // Simulate dystopian social conditions
    state.socialAccumulation.socialCohesion.trust = 15;  // Very low (0-100 scale)
    state.socialAccumulation.socialCohesion.communityBonds = 15;  // Very low
    state.socialAccumulation.socialCohesion.civilLiberties = 10;  // Very low
    state.socialAccumulation.meaningCrisisLevel = 0.80; // Very high crisis
    state.socialAccumulation.institutionalLegitimacy = 0.20; // Very low
    state.society.unemploymentLevel = 0.35;
    state.globalMetrics.wealthDistribution = 0.30;

    const result = calculateIndigenousParadigm(state);

    // Geometric mean should pull score down significantly
    assert.ok(result.value < 30, `Expected dystopian score <30, got ${result.value}`);

    // Should still be above min-floor (0.1)
    assert.ok(result.value >= 0.1, `Score should be ≥0.1, got ${result.value}`);

    console.log('✓ Geometric mean low-value test passed: score =', result.value.toFixed(1));
  });
});
