/**
 * Ecological Loader Tests
 *
 * Validates ecological data loading, caching, and normalization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ecologicalLoader } from '../../src/data/loaders/ecologicalLoader';
import {
  normalizeEcological,
  normalizeEcologicalBatch,
  normalizePlanetaryBoundaries,
  normalizeFootprint,
  normalizeAirQuality,
  getEcologicalClassification
} from '../../src/data/normalizers/ecologicalNormalizer';

describe('Ecological Loader', () => {
  it('should load planetary boundaries (hard-coded)', async () => {
    const boundaries = await ecologicalLoader.loadBoundaries();

    assert.ok(boundaries, 'Boundaries should be loaded');
    assert.strictEqual(boundaries.year, 2023, 'Should be 2023 assessment');
    assert.strictEqual(boundaries.version, 'Richardson et al. 2023', 'Should cite Richardson et al.');

    // Check 9 boundaries exist
    assert.ok(boundaries.boundaries.climateChange, 'Climate change boundary should exist');
    assert.ok(boundaries.boundaries.biosphereIntegrity, 'Biosphere boundary should exist');
    assert.ok(boundaries.boundaries.landSystemChange, 'Land system boundary should exist');
    assert.ok(boundaries.boundaries.freshwaterUse, 'Freshwater boundary should exist');
    assert.ok(boundaries.boundaries.nitrogenFlow, 'Nitrogen boundary should exist');
    assert.ok(boundaries.boundaries.phosphorusFlow, 'Phosphorus boundary should exist');
    assert.ok(boundaries.boundaries.oceanAcidification, 'Ocean acidification boundary should exist');
    assert.ok(boundaries.boundaries.stratosphericOzone, 'Ozone boundary should exist');

    // Check climate change transgressed
    assert.strictEqual(boundaries.boundaries.climateChange.status, 'HIGH_RISK', 'Climate should be HIGH_RISK');
    assert.ok(boundaries.boundaries.climateChange.current > boundaries.boundaries.climateChange.safe,
      `Climate current (${boundaries.boundaries.climateChange.current}) should exceed safe (${boundaries.boundaries.climateChange.safe})`);

    console.log('✓ Loaded planetary boundaries: 6 of 9 transgressed (Richardson et al. 2023)');
  });

  it('should load ecological footprint (uses cache if available)', async () => {
    const footprint = await ecologicalLoader.loadFootprint();

    assert.ok(footprint, 'Footprint data should be loaded');
    assert.strictEqual(footprint.year, 2022, 'Should be 2022 data (2-year lag)');
    assert.ok(footprint.countries.length >= 20, `Should have at least 20 countries, got ${footprint.countries.length}`);

    console.log(`✓ Loaded ${footprint.countries.length} countries from Ecological Footprint 2022`);
  });

  it('should load air quality (uses cache if available)', async () => {
    const airQuality = await ecologicalLoader.loadAirQuality();

    assert.ok(airQuality, 'Air quality data should be loaded');
    assert.strictEqual(airQuality.version, 'WHO 2024', 'Should be WHO 2024');
    assert.ok(airQuality.countries.length >= 20, `Should have at least 20 countries, got ${airQuality.countries.length}`);

    console.log(`✓ Loaded ${airQuality.countries.length} countries from WHO Air Quality 2024`);
  });

  it('should load all ecological data together', async () => {
    const ecological = await ecologicalLoader.load();

    assert.ok(ecological.boundaries, 'Should have boundaries');
    assert.ok(ecological.footprint, 'Should have footprint');
    assert.ok(ecological.airQuality, 'Should have air quality');

    console.log(`✓ Loaded ecological data: 9 boundaries, ${ecological.footprint.countries.length} footprint, ${ecological.airQuality.countries.length} air quality`);
  });

  it('should have realistic footprint scores', async () => {
    const footprint = await ecologicalLoader.loadFootprint();

    // USA should have high footprint (unsustainable)
    const usa = footprint.countries.find(c => c.countryCode === 'USA');
    assert.ok(usa, 'USA should exist in dataset');
    assert.ok(usa!.totalFootprint >= 7, `USA footprint should be ≥7 gha, got ${usa!.totalFootprint}`);
    assert.ok(usa!.earthsRequired >= 4, `USA should require ≥4 Earths, got ${usa!.earthsRequired}`);

    // India should have low footprint (sustainable)
    const india = footprint.countries.find(c => c.countryCode === 'IND');
    assert.ok(india, 'India should exist in dataset');
    assert.ok(india!.totalFootprint <= 1.5, `India footprint should be ≤1.5 gha, got ${india!.totalFootprint}`);
    assert.ok(india!.earthsRequired < 1, `India should require <1 Earth, got ${india!.earthsRequired}`);

    // Norway should have high footprint despite good air quality
    const norway = footprint.countries.find(c => c.countryCode === 'NOR');
    assert.ok(norway, 'Norway should exist in dataset');
    assert.ok(norway!.totalFootprint >= 6, `Norway footprint should be ≥6 gha, got ${norway!.totalFootprint}`);

    console.log('✓ Footprint scores realistic (USA high, India low, Norway high)');
  });

  it('should have realistic air quality scores', async () => {
    const airQuality = await ecologicalLoader.loadAirQuality();

    // Norway should have excellent air quality
    const norway = airQuality.countries.find(c => c.countryCode === 'NOR');
    assert.ok(norway, 'Norway should exist in dataset');
    assert.ok(norway!.pm25 <= 10, `Norway PM2.5 should be ≤10, got ${norway!.pm25}`);

    // India should have poor air quality
    const india = airQuality.countries.find(c => c.countryCode === 'IND');
    assert.ok(india, 'India should exist in dataset');
    assert.ok(india!.pm25 >= 50, `India PM2.5 should be ≥50, got ${india!.pm25}`);

    // Bangladesh should have very poor air quality
    const bangladesh = airQuality.countries.find(c => c.countryCode === 'BGD');
    assert.ok(bangladesh, 'Bangladesh should exist in dataset');
    assert.ok(bangladesh!.pm25 >= 70, `Bangladesh PM2.5 should be ≥70, got ${bangladesh!.pm25}`);

    console.log('✓ Air quality realistic (Norway good, India/Bangladesh poor)');
  });

  it('should normalize planetary boundaries correctly', async () => {
    const boundaries = await ecologicalLoader.loadBoundaries();

    const score = normalizePlanetaryBoundaries(boundaries);

    // Should be low score (6 of 9 boundaries transgressed)
    assert.ok(score < 50, `Boundaries score should be <50 (dystopian), got ${score.toFixed(1)}`);
    assert.ok(score > 0, `Boundaries score should be >0, got ${score.toFixed(1)}`);

    console.log(`✓ Planetary boundaries normalized: ${score.toFixed(1)}/100 (6 of 9 transgressed)`);
  });

  it('should normalize footprint correctly (INVERTED)', async () => {
    const footprint = await ecologicalLoader.loadFootprint();

    const usa = footprint.countries.find(c => c.countryCode === 'USA')!;
    const india = footprint.countries.find(c => c.countryCode === 'IND')!;

    const usaScore = normalizeFootprint(usa);
    const indiaScore = normalizeFootprint(india);

    // USA: high footprint → low score
    assert.ok(usaScore < 30, `USA footprint score should be <30, got ${usaScore.toFixed(1)}`);

    // India: low footprint → high score
    assert.ok(indiaScore >= 80, `India footprint score should be ≥80, got ${indiaScore.toFixed(1)}`);

    console.log(`✓ Footprint normalized: USA=${usaScore.toFixed(1)} (8.1 gha), India=${indiaScore.toFixed(1)} (1.2 gha)`);
  });

  it('should normalize air quality correctly (INVERTED)', async () => {
    const airQuality = await ecologicalLoader.loadAirQuality();

    const norway = airQuality.countries.find(c => c.countryCode === 'NOR')!;
    const india = airQuality.countries.find(c => c.countryCode === 'IND')!;

    const norwayScore = normalizeAirQuality(norway);
    const indiaScore = normalizeAirQuality(india);

    // Norway: low PM2.5 → high score
    assert.ok(norwayScore >= 85, `Norway air quality score should be ≥85, got ${norwayScore.toFixed(1)}`);

    // India: high PM2.5 → low score
    assert.ok(indiaScore < 20, `India air quality score should be <20, got ${indiaScore.toFixed(1)}`);

    console.log(`✓ Air quality normalized: Norway=${norwayScore.toFixed(1)} (6 μg/m³), India=${indiaScore.toFixed(1)} (58 μg/m³)`);
  });

  it('should normalize ecological data for a country', async () => {
    const ecological = await ecologicalLoader.load();

    const norwayFootprint = ecological.footprint.countries.find(c => c.countryCode === 'NOR')!;
    const norwayAirQuality = ecological.airQuality.countries.find(c => c.countryCode === 'NOR')!;

    const normalized = normalizeEcological(ecological.boundaries, norwayFootprint, norwayAirQuality);

    // Norway should have low ecological score despite good air quality (high footprint)
    assert.ok(normalized.ecologicalScore < 60, `Norway ecological score should be <60, got ${normalized.ecologicalScore.toFixed(1)}`);
    assert.ok(normalized.airQualityScore >= 85, `Norway air quality should be ≥85, got ${normalized.airQualityScore.toFixed(1)}`);
    assert.ok(normalized.footprintScore < 40, `Norway footprint score should be <40, got ${normalized.footprintScore.toFixed(1)}`);

    // Check indicators
    assert.strictEqual(normalized.indicators.length, 3, 'Should have 3 indicators (boundaries + footprint + air quality)');

    console.log(`✓ Norway normalized: Boundaries=${normalized.boundariesScore.toFixed(1)}, Footprint=${normalized.footprintScore.toFixed(1)}, Air=${normalized.airQualityScore.toFixed(1)}, Overall=${normalized.ecologicalScore.toFixed(1)}`);
  });

  it('should classify Ecological paradigm levels', async () => {
    const ecological = await ecologicalLoader.load();

    const norwayFootprint = ecological.footprint.countries.find(c => c.countryCode === 'NOR')!;
    const norwayAirQuality = ecological.airQuality.countries.find(c => c.countryCode === 'NOR')!;
    const indiaFootprint = ecological.footprint.countries.find(c => c.countryCode === 'IND')!;
    const indiaAirQuality = ecological.airQuality.countries.find(c => c.countryCode === 'IND')!;

    const norwayNorm = normalizeEcological(ecological.boundaries, norwayFootprint, norwayAirQuality);
    const indiaNorm = normalizeEcological(ecological.boundaries, indiaFootprint, indiaAirQuality);

    const norwayClass = getEcologicalClassification(norwayNorm.ecologicalScore);
    const indiaClass = getEcologicalClassification(indiaNorm.ecologicalScore);

    assert.ok(norwayClass.includes('RISK') || norwayClass.includes('SUSTAINABLE') || norwayClass.includes('DYSTOPIA'), `Norway should be RISK/SUSTAINABLE/DYSTOPIA, got ${norwayClass}`);
    assert.ok(indiaClass.includes('RISK') || indiaClass.includes('DYSTOPIA'), `India should be RISK/DYSTOPIA (low footprint but terrible air quality), got ${indiaClass}`);

    console.log(`✓ Classifications: Norway=${norwayClass}, India=${indiaClass}`);
  });

  it('should normalize batch of countries', async () => {
    const ecological = await ecologicalLoader.load();

    const normalized = normalizeEcologicalBatch(
      ecological.boundaries,
      ecological.footprint.countries,
      ecological.airQuality.countries
    );

    // Should have all unique countries from both datasets
    const expectedCount = new Set([
      ...ecological.footprint.countries.map(f => f.countryCode),
      ...ecological.airQuality.countries.map(a => a.countryCode),
    ]).size;

    assert.strictEqual(normalized.length, expectedCount, `Should have ${expectedCount} countries`);

    // Check all scores in valid range (0-100)
    for (const country of normalized) {
      assert.ok(country.ecologicalScore >= 0 && country.ecologicalScore <= 100,
        `Ecological score out of range for ${country.countryCode}: ${country.ecologicalScore}`);
    }

    // Find highest and lowest
    const highest = normalized.reduce((max, c) => c.ecologicalScore > max.ecologicalScore ? c : max);
    const lowest = normalized.reduce((min, c) => c.ecologicalScore < min.ecologicalScore ? c : min);

    console.log(`✓ Batch normalized: Highest=${highest.countryCode} (${highest.ecologicalScore.toFixed(1)}), Lowest=${lowest.countryCode} (${lowest.ecologicalScore.toFixed(1)})`);
  });

  it('should demonstrate Norway paradox (Western/Development utopia, Ecological dystopia)', async () => {
    const ecological = await ecologicalLoader.load();

    const norwayFootprint = ecological.footprint.countries.find(c => c.countryCode === 'NOR')!;
    const norwayAirQuality = ecological.airQuality.countries.find(c => c.countryCode === 'NOR')!;

    const normalized = normalizeEcological(ecological.boundaries, norwayFootprint, norwayAirQuality);

    // Norway should have low ecological score (oil economy, high footprint)
    assert.ok(normalized.ecologicalScore < 70, `Norway ecological score should be <70, got ${normalized.ecologicalScore.toFixed(1)}`);

    const classification = getEcologicalClassification(normalized.ecologicalScore);

    console.log(`✓ Norway paradox: Ecological=${normalized.ecologicalScore.toFixed(1)} (${classification}), Western Liberal=93.0 (utopia), Development=98.3 (utopia)`);
    console.log(`  → Norway footprint: ${norwayFootprint.totalFootprint} gha (${norwayFootprint.earthsRequired} Earths), oil economy despite good air quality`);
  });
});
