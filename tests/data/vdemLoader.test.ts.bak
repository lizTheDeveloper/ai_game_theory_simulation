/**
 * V-Dem Loader Tests
 *
 * Validates V-Dem data loading, caching, and normalization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { vdemLoader } from '../../src/data/loaders/vdemLoader';
import { normalizeVDem, normalizeVDemBatch, getWesternLiberalClassification } from '../../src/data/normalizers/vdemNormalizer';

describe('V-Dem Loader', () => {
  it('should load V-Dem data (uses cache if available)', async () => {
    const vdem = await vdemLoader.load();

    assert.ok(vdem, 'V-Dem data should be loaded');
    assert.strictEqual(vdem.version, '14.1', 'Version should be 14.1');
    assert.ok(vdem.countries.length >= 30, `Should have at least 30 countries, got ${vdem.countries.length}`);

    console.log(`✓ Loaded ${vdem.countries.length} countries from V-Dem ${vdem.version}`);
  });

  it('should have realistic V-Dem scores', async () => {
    const vdem = await vdemLoader.load();

    // Check Norway (should be high democracy)
    const norway = vdem.countries.find(c => c.countryCode === 'NOR');
    assert.ok(norway, 'Norway should exist in dataset');
    assert.ok(norway!.electoralDemocracy >= 0.85, `Norway electoral democracy should be ≥0.85, got ${norway!.electoralDemocracy}`);
    assert.ok(norway!.liberalComponent >= 0.85, `Norway liberal component should be ≥0.85, got ${norway!.liberalComponent}`);

    // Check China (should be low democracy)
    const china = vdem.countries.find(c => c.countryCode === 'CHN');
    assert.ok(china, 'China should exist in dataset');
    assert.ok(china!.electoralDemocracy <= 0.15, `China electoral democracy should be ≤0.15, got ${china!.electoralDemocracy}`);
    assert.ok(china!.liberalComponent <= 0.15, `China liberal component should be ≤0.15, got ${china!.liberalComponent}`);

    // Check USA (should be high but not perfect)
    const usa = vdem.countries.find(c => c.countryCode === 'USA');
    assert.ok(usa, 'USA should exist in dataset');
    assert.ok(usa!.electoralDemocracy >= 0.80, `USA electoral democracy should be ≥0.80, got ${usa!.electoralDemocracy}`);
    assert.ok(usa!.electoralDemocracy <= 0.95, `USA electoral democracy should be ≤0.95, got ${usa!.electoralDemocracy}`);

    console.log('✓ V-Dem scores realistic (Norway high, China low, USA medium-high)');
  });

  it('should normalize V-Dem to 0-100 scale', async () => {
    const vdem = await vdemLoader.load();
    const norway = vdem.countries.find(c => c.countryCode === 'NOR')!;

    const normalized = normalizeVDem(norway);

    // Check normalization (0-1 → 0-100)
    assert.ok(normalized.electoralDemocracy >= 85, `Normalized electoral democracy should be ≥85, got ${normalized.electoralDemocracy}`);
    assert.ok(normalized.liberalComponent >= 85, `Normalized liberal component should be ≥85, got ${normalized.liberalComponent}`);

    // Check overall score (geometric mean)
    assert.ok(normalized.westernLiberalScore >= 85, `Western Liberal score should be ≥85, got ${normalized.westernLiberalScore}`);

    // Check indicators array
    assert.strictEqual(normalized.indicators.length, 2, 'Should have 2 indicators (electoral + liberal)');
    assert.strictEqual(normalized.indicators[0].id, 'vdem_electoral_democracy', 'First indicator should be electoral democracy');
    assert.strictEqual(normalized.indicators[0].confidence, 'HIGH', 'V-Dem should have HIGH confidence');

    console.log(`✓ Norway normalized: Electoral=${normalized.electoralDemocracy.toFixed(1)}, Liberal=${normalized.liberalComponent.toFixed(1)}, Overall=${normalized.westernLiberalScore.toFixed(1)}`);
  });

  it('should classify Western Liberal paradigm levels', async () => {
    const vdem = await vdemLoader.load();

    const norway = vdem.countries.find(c => c.countryCode === 'NOR')!;
    const china = vdem.countries.find(c => c.countryCode === 'CHN')!;
    const india = vdem.countries.find(c => c.countryCode === 'IND')!;

    const norwayNorm = normalizeVDem(norway);
    const chinaNorm = normalizeVDem(china);
    const indiaNorm = normalizeVDem(india);

    const norwayClass = getWesternLiberalClassification(norwayNorm.westernLiberalScore);
    const chinaClass = getWesternLiberalClassification(chinaNorm.westernLiberalScore);
    const indiaClass = getWesternLiberalClassification(indiaNorm.westernLiberalScore);

    assert.ok(norwayClass.includes('LIBERAL DEMOCRACY') || norwayClass.includes('ELECTORAL DEMOCRACY'), `Norway should be democracy, got ${norwayClass}`);
    assert.ok(chinaClass.includes('AUTOCRACY'), `China should be autocracy, got ${chinaClass}`);
    assert.ok(indiaClass.includes('DEMOCRACY') || indiaClass.includes('HYBRID'), `India should be democracy/hybrid, got ${indiaClass}`);

    console.log(`✓ Classifications: Norway=${norwayClass}, China=${chinaClass}, India=${indiaClass}`);
  });

  it('should normalize batch of countries', async () => {
    const vdem = await vdemLoader.load();

    const normalized = normalizeVDemBatch(vdem.countries);

    assert.strictEqual(normalized.length, vdem.countries.length, 'Batch normalization should preserve count');

    // Check all scores in valid range (0-100)
    for (const country of normalized) {
      assert.ok(country.electoralDemocracy >= 0 && country.electoralDemocracy <= 100, `Electoral democracy out of range for ${country.countryCode}: ${country.electoralDemocracy}`);
      assert.ok(country.liberalComponent >= 0 && country.liberalComponent <= 100, `Liberal component out of range for ${country.countryCode}: ${country.liberalComponent}`);
      assert.ok(country.westernLiberalScore >= 0 && country.westernLiberalScore <= 100, `Overall score out of range for ${country.countryCode}: ${country.westernLiberalScore}`);
    }

    // Find highest and lowest
    const highest = normalized.reduce((max, c) => c.westernLiberalScore > max.westernLiberalScore ? c : max);
    const lowest = normalized.reduce((min, c) => c.westernLiberalScore < min.westernLiberalScore ? c : min);

    console.log(`✓ Batch normalized: Highest=${highest.countryCode} (${highest.westernLiberalScore.toFixed(1)}), Lowest=${lowest.countryCode} (${lowest.westernLiberalScore.toFixed(1)})`);
  });

  it('should demonstrate paradigm conflicts (Singapore)', async () => {
    const vdem = await vdemLoader.load();

    // Singapore: Development utopia (HDI 0.939) but Western dystopia (low V-Dem)
    const singapore = vdem.countries.find(c => c.countryCode === 'SGP');
    if (!singapore) {
      console.log('⚠️  Singapore not in mock dataset, skipping');
      return;
    }

    const normalized = normalizeVDem(singapore);

    // Singapore should have medium-low Western Liberal score (hybrid regime)
    assert.ok(normalized.westernLiberalScore >= 35 && normalized.westernLiberalScore <= 65, `Singapore should be hybrid regime (35-65), got ${normalized.westernLiberalScore}`);

    const classification = getWesternLiberalClassification(normalized.westernLiberalScore);

    console.log(`✓ Singapore paradigm conflict: Western Liberal=${normalized.westernLiberalScore.toFixed(1)} (${classification}), Development=HIGH (HDI 0.939)`);
  });
});
