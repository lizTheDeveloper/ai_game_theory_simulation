/**
 * WVS Loader Tests
 *
 * Validates WVS data loading, caching, and normalization for Indigenous paradigm.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { wvsLoader } from '../../src/data/loaders/wvsLoader';
import {
  normalizeWVS,
  normalizeWVSBatch,
  getIndigenousClassification
} from '../../src/data/normalizers/wvsNormalizer';

describe('WVS Loader', () => {
  it('should load WVS Wave 7 data (uses cache if available)', async () => {
    const wvs = await wvsLoader.load();

    assert.ok(wvs, 'WVS data should be loaded');
    assert.strictEqual(wvs.wave, 7, 'Should be Wave 7');
    assert.strictEqual(wvs.waveYears, '2017-2022', 'Should cover 2017-2022');
    assert.ok(wvs.countries.length >= 20, `Should have at least 20 countries, got ${wvs.countries.length}`);

    console.log(`✓ Loaded ${wvs.countries.length} countries from WVS Wave 7 (${wvs.waveYears})`);
  });

  it('should have realistic WVS scores', async () => {
    const wvs = await wvsLoader.load();

    // Nordic countries: high social trust, medium community, high civic participation
    const norway = wvs.countries.find(c => c.countryCode === 'NOR');
    assert.ok(norway, 'Norway should exist in dataset');
    assert.ok(norway!.socialTrust >= 60, `Norway social trust should be ≥60%, got ${norway!.socialTrust}`);
    assert.ok(norway!.civicParticipation >= 60, `Norway civic participation should be ≥60%, got ${norway!.civicParticipation}`);

    // Latin America: very low social trust, high community importance
    const brazil = wvs.countries.find(c => c.countryCode === 'BRA');
    assert.ok(brazil, 'Brazil should exist in dataset');
    assert.ok(brazil!.socialTrust <= 15, `Brazil social trust should be ≤15%, got ${brazil!.socialTrust}`);
    assert.ok(brazil!.communityImportance >= 60, `Brazil community importance should be ≥60%, got ${brazil!.communityImportance}`);

    // Southeast Asia: low trust, very high community importance
    const indonesia = wvs.countries.find(c => c.countryCode === 'IDN');
    assert.ok(indonesia, 'Indonesia should exist in dataset');
    assert.ok(indonesia!.communityImportance >= 80, `Indonesia community importance should be ≥80%, got ${indonesia!.communityImportance}`);

    console.log('✓ WVS scores realistic (Norway high trust/participation, Brazil low trust, Indonesia high community)');
  });

  it('should normalize WVS data correctly', async () => {
    const wvs = await wvsLoader.load();

    const norway = wvs.countries.find(c => c.countryCode === 'NOR')!;
    const brazil = wvs.countries.find(c => c.countryCode === 'BRA')!;

    const norwayNorm = normalizeWVS(norway);
    const brazilNorm = normalizeWVS(brazil);

    // Norway: high trust + high participation → high Indigenous score
    assert.ok(norwayNorm.indigenousScore >= 50, `Norway Indigenous score should be ≥50, got ${norwayNorm.indigenousScore.toFixed(1)}`);

    // Brazil: very low trust drags down score despite high community
    assert.ok(brazilNorm.indigenousScore < 40, `Brazil Indigenous score should be <40 (low trust drags down), got ${brazilNorm.indigenousScore.toFixed(1)}`);

    // Check indicators structure
    assert.strictEqual(norwayNorm.indicators.length, 3, 'Should have 3 indicators (trust + community + participation)');
    assert.strictEqual(norwayNorm.indicators[0]?.id, 'social_trust', 'First indicator should be social_trust');
    assert.strictEqual(norwayNorm.indicators[1]?.id, 'community_importance', 'Second indicator should be community_importance');
    assert.strictEqual(norwayNorm.indicators[2]?.id, 'civic_participation', 'Third indicator should be civic_participation');

    console.log(`✓ WVS normalized: Norway=${norwayNorm.indigenousScore.toFixed(1)}, Brazil=${brazilNorm.indigenousScore.toFixed(1)}`);
  });

  it('should classify Indigenous paradigm levels', async () => {
    const wvs = await wvsLoader.load();

    const norway = wvs.countries.find(c => c.countryCode === 'NOR')!;
    const brazil = wvs.countries.find(c => c.countryCode === 'BRA')!;

    const norwayNorm = normalizeWVS(norway);
    const brazilNorm = normalizeWVS(brazil);

    const norwayClass = getIndigenousClassification(norwayNorm.indigenousScore);
    const brazilClass = getIndigenousClassification(brazilNorm.indigenousScore);

    // Norway should be COMMUNITARIAN or HYBRID (high participation but medium community importance)
    assert.ok(norwayClass.includes('COMMUNITARIAN') || norwayClass.includes('HYBRID'), `Norway should be COMMUNITARIAN/HYBRID, got ${norwayClass}`);

    // Brazil should be HYBRID or INDIVIDUALIST (low trust counteracts high community)
    assert.ok(brazilClass.includes('HYBRID') || brazilClass.includes('INDIVIDUALIST') || brazilClass.includes('FRAGMENTED'), `Brazil should be HYBRID/INDIVIDUALIST/FRAGMENTED, got ${brazilClass}`);

    console.log(`✓ Classifications: Norway=${norwayClass}, Brazil=${brazilClass}`);
  });

  it('should normalize batch of countries', async () => {
    const wvs = await wvsLoader.load();

    const normalized = normalizeWVSBatch(wvs.countries);

    assert.strictEqual(normalized.length, wvs.countries.length, `Should have ${wvs.countries.length} normalized countries`);

    // Check all scores in valid range (0-100)
    for (const country of normalized) {
      assert.ok(country.indigenousScore >= 0 && country.indigenousScore <= 100,
        `Indigenous score out of range for ${country.countryCode}: ${country.indigenousScore}`);
    }

    // Find highest and lowest
    const highest = normalized.reduce((max, c) => c.indigenousScore > max.indigenousScore ? c : max);
    const lowest = normalized.reduce((min, c) => c.indigenousScore < min.indigenousScore ? c : min);

    console.log(`✓ Batch normalized: Highest=${highest.countryCode} (${highest.indigenousScore.toFixed(1)}), Lowest=${lowest.countryCode} (${lowest.indigenousScore.toFixed(1)})`);
  });

  it('should demonstrate trust-vs-community tension', async () => {
    const wvs = await wvsLoader.load();

    // Find countries with high community importance
    const highCommunity = wvs.countries
      .filter(c => c.communityImportance >= 80)
      .map(c => ({ ...c, norm: normalizeWVS(c) }));

    assert.ok(highCommunity.length >= 3, `Should have at least 3 high-community countries, got ${highCommunity.length}`);

    // Some should have low trust (collectivist but low trust)
    const lowTrustHighCommunity = highCommunity.filter(c => c.socialTrust <= 25);
    assert.ok(lowTrustHighCommunity.length >= 1, `Should have at least 1 low-trust high-community country`);

    if (lowTrustHighCommunity.length > 0) {
      const example = lowTrustHighCommunity[0];
      console.log(`✓ Trust-community tension: ${example?.countryCode} has ${example?.communityImportance}% community importance but ${example?.socialTrust}% social trust`);
      console.log(`  → Indigenous score: ${example?.norm.indigenousScore.toFixed(1)} (${getIndigenousClassification(example?.norm.indigenousScore ?? 0)})`);
    }
  });

  it('should demonstrate Nordic civic participation advantage', async () => {
    const wvs = await wvsLoader.load();

    // Find Nordic countries
    const nordic = wvs.countries
      .filter(c => ['NOR', 'SWE', 'NLD'].includes(c.countryCode))
      .map(c => ({ ...c, norm: normalizeWVS(c) }));

    assert.ok(nordic.length >= 2, `Should have at least 2 Nordic countries, got ${nordic.length}`);

    for (const country of nordic) {
      // Nordic countries should have high civic participation (>60%)
      assert.ok(country.civicParticipation >= 55, `${country.countryCode} civic participation should be ≥55%, got ${country.civicParticipation}`);
    }

    console.log(`✓ Nordic civic participation: ${nordic.map(c => `${c.countryCode}=${c.civicParticipation}%`).join(', ')}`);
  });

  it('should demonstrate Asia high-community pattern', async () => {
    const wvs = await wvsLoader.load();

    // Find Asian countries with very high community importance
    const asiaHighCommunity = wvs.countries
      .filter(c => ['IDN', 'PHL', 'VNM', 'THA', 'IND', 'PAK', 'BGD'].includes(c.countryCode))
      .filter(c => c.communityImportance >= 75)
      .map(c => ({ ...c, norm: normalizeWVS(c) }));

    assert.ok(asiaHighCommunity.length >= 3, `Should have at least 3 Asian high-community countries, got ${asiaHighCommunity.length}`);

    console.log(`✓ Asia high-community pattern: ${asiaHighCommunity.map(c => `${c.countryCode}=${c.communityImportance}%`).join(', ')}`);
  });
});
