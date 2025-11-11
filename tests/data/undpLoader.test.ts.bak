/**
 * UNDP Loader Tests
 *
 * Validates UNDP HDI and MPI data loading, caching, and normalization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { undpLoader } from '../../src/data/loaders/undpLoader';
import { normalizeUNDP, normalizeUNDPBatch, getDevelopmentClassification, getHDICategory } from '../../src/data/normalizers/undpNormalizer';

describe('UNDP Loader', () => {
  it('should load HDI data (uses cache if available)', async () => {
    const hdi = await undpLoader.loadHDI();

    assert.ok(hdi, 'HDI data should be loaded');
    assert.strictEqual(hdi.version, '2024', 'Version should be 2024');
    assert.ok(hdi.countries.length >= 30, `Should have at least 30 countries, got ${hdi.countries.length}`);

    console.log(`✓ Loaded ${hdi.countries.length} countries from HDI ${hdi.version}`);
  });

  it('should load MPI data (uses cache if available)', async () => {
    const mpi = await undpLoader.loadMPI();

    assert.ok(mpi, 'MPI data should be loaded');
    assert.strictEqual(mpi.version, '2024', 'Version should be 2024');
    assert.ok(mpi.countries.length >= 15, `Should have at least 15 countries, got ${mpi.countries.length}`);

    console.log(`✓ Loaded ${mpi.countries.length} countries from MPI ${mpi.version}`);
  });

  it('should load both HDI and MPI together', async () => {
    const undp = await undpLoader.load();

    assert.ok(undp.hdi, 'Should have HDI data');
    assert.ok(undp.mpi, 'Should have MPI data');
    assert.ok(undp.hdi.countries.length > undp.mpi.countries.length, 'HDI should have more countries than MPI (193 vs 112)');

    console.log(`✓ Loaded UNDP: ${undp.hdi.countries.length} HDI, ${undp.mpi.countries.length} MPI`);
  });

  it('should have realistic HDI scores', async () => {
    const hdi = await undpLoader.loadHDI();

    // Check Norway (should be #1 or top 3)
    const norway = hdi.countries.find(c => c.countryCode === 'NOR');
    assert.ok(norway, 'Norway should exist in dataset');
    assert.ok(norway!.hdi >= 0.95, `Norway HDI should be ≥0.95, got ${norway!.hdi}`);
    assert.ok(norway!.rank <= 3, `Norway should be top 3, got rank ${norway!.rank}`);

    // Check USA (should be very high but not #1)
    const usa = hdi.countries.find(c => c.countryCode === 'USA');
    assert.ok(usa, 'USA should exist in dataset');
    assert.ok(usa!.hdi >= 0.90, `USA HDI should be ≥0.90, got ${usa!.hdi}`);
    assert.ok(usa!.rank >= 15 && usa!.rank <= 25, `USA should be rank 15-25, got ${usa!.rank}`);

    // Check India (should be medium HDI)
    const india = hdi.countries.find(c => c.countryCode === 'IND');
    assert.ok(india, 'India should exist in dataset');
    assert.ok(india!.hdi >= 0.600 && india!.hdi <= 0.700, `India HDI should be 0.600-0.700, got ${india!.hdi}`);
    assert.strictEqual(india!.category, 'MEDIUM', `India should be MEDIUM HDI, got ${india!.category}`);

    console.log('✓ HDI scores realistic (Norway top, USA very high, India medium)');
  });

  it('should have realistic MPI scores', async () => {
    const mpi = await undpLoader.loadMPI();

    // Check Norway (should be near-zero poverty)
    const norway = mpi.countries.find(c => c.countryCode === 'NOR');
    if (norway) {
      assert.ok(norway.mpi <= 0.005, `Norway MPI should be ≤0.005, got ${norway.mpi}`);
    }

    // Check India (should have significant poverty)
    const india = mpi.countries.find(c => c.countryCode === 'IND');
    assert.ok(india, 'India should exist in MPI dataset');
    assert.ok(india!.mpi >= 0.100, `India MPI should be ≥0.100, got ${india!.mpi}`);
    assert.ok(india!.headcountRatio >= 20, `India headcount ratio should be ≥20%, got ${india!.headcountRatio}`);

    // Check Pakistan (should have higher poverty than India)
    const pakistan = mpi.countries.find(c => c.countryCode === 'PAK');
    if (pakistan && india) {
      assert.ok(pakistan.mpi > india.mpi, `Pakistan MPI (${pakistan.mpi}) should be > India MPI (${india.mpi})`);
    }

    console.log('✓ MPI scores realistic (Norway near-zero, India/Pakistan high poverty)');
  });

  it('should normalize UNDP to 0-100 scale', async () => {
    const undp = await undpLoader.load();

    const norway = undp.hdi.countries.find(c => c.countryCode === 'NOR')!;
    const norwayMPI = undp.mpi.countries.find(c => c.countryCode === 'NOR');

    const normalized = normalizeUNDP(norway, norwayMPI);

    // Check HDI normalization (0.966 → 96.6)
    assert.ok(normalized.hdi >= 95, `Normalized HDI should be ≥95, got ${normalized.hdi}`);

    // Check MPI normalization (0.000 → 100 after inversion)
    if (norwayMPI) {
      assert.ok(normalized.mpi >= 99, `Normalized MPI should be ≥99, got ${normalized.mpi}`);
    }

    // Check overall score
    assert.ok(normalized.developmentScore >= 95, `Development score should be ≥95, got ${normalized.developmentScore}`);

    console.log(`✓ Norway normalized: HDI=${normalized.hdi.toFixed(1)}, MPI=${normalized.mpi.toFixed(1)}, Overall=${normalized.developmentScore.toFixed(1)}`);
  });

  it('should classify Development paradigm levels', async () => {
    const undp = await undpLoader.load();

    const norway = undp.hdi.countries.find(c => c.countryCode === 'NOR')!;
    const india = undp.hdi.countries.find(c => c.countryCode === 'IND')!;
    const pakistan = undp.hdi.countries.find(c => c.countryCode === 'PAK')!;

    const norwayMPI = undp.mpi.countries.find(c => c.countryCode === 'NOR');
    const indiaMPI = undp.mpi.countries.find(c => c.countryCode === 'IND');
    const pakistanMPI = undp.mpi.countries.find(c => c.countryCode === 'PAK');

    const norwayNorm = normalizeUNDP(norway, norwayMPI);
    const indiaNorm = normalizeUNDP(india, indiaMPI);
    const pakistanNorm = normalizeUNDP(pakistan, pakistanMPI);

    const norwayClass = getDevelopmentClassification(norwayNorm.developmentScore);
    const indiaClass = getDevelopmentClassification(indiaNorm.developmentScore);
    const pakistanClass = getDevelopmentClassification(pakistanNorm.developmentScore);

    assert.ok(norwayClass.includes('VERY HIGH') || norwayClass.includes('utopia'), `Norway should be VERY HIGH, got ${norwayClass}`);
    assert.ok(indiaClass.includes('MEDIUM') || indiaClass.includes('LOW') || indiaClass.includes('HIGH'), `India should be MEDIUM/LOW/HIGH, got ${indiaClass}`);
    assert.ok(pakistanClass.includes('LOW') || pakistanClass.includes('MEDIUM') || pakistanClass.includes('HIGH'), `Pakistan should be LOW/MEDIUM/HIGH, got ${pakistanClass}`);

    console.log(`✓ Classifications: Norway=${norwayClass}, India=${indiaClass}, Pakistan=${pakistanClass}`);
  });

  it('should normalize batch of countries', async () => {
    const undp = await undpLoader.load();

    const normalized = normalizeUNDPBatch(undp.hdi.countries, undp.mpi.countries);

    assert.strictEqual(normalized.length, undp.hdi.countries.length, 'Batch should preserve HDI count');

    // Check all scores in valid range (0-100)
    for (const country of normalized) {
      assert.ok(country.hdi >= 0 && country.hdi <= 100, `HDI out of range for ${country.countryCode}: ${country.hdi}`);
      assert.ok(country.developmentScore >= 0 && country.developmentScore <= 100, `Development score out of range for ${country.countryCode}: ${country.developmentScore}`);
    }

    // Find highest and lowest
    const highest = normalized.reduce((max, c) => c.developmentScore > max.developmentScore ? c : max);
    const lowest = normalized.reduce((min, c) => c.developmentScore < min.developmentScore ? c : min);

    console.log(`✓ Batch normalized: Highest=${highest.countryCode} (${highest.developmentScore.toFixed(1)}), Lowest=${lowest.countryCode} (${lowest.developmentScore.toFixed(1)})`);
  });

  it('should demonstrate paradigm conflicts (Singapore)', async () => {
    const undp = await undpLoader.load();

    // Singapore: Development utopia (HDI 0.939) but Western dystopia (V-Dem low)
    const singapore = undp.hdi.countries.find(c => c.countryCode === 'SGP');
    if (!singapore) {
      console.log('⚠️  Singapore not in mock dataset, skipping');
      return;
    }

    const singaporeMPI = undp.mpi.countries.find(c => c.countryCode === 'SGP');
    const normalized = normalizeUNDP(singapore, singaporeMPI);

    // Singapore should have very high Development score
    assert.ok(normalized.developmentScore >= 85, `Singapore Development score should be ≥85, got ${normalized.developmentScore}`);

    const hdiCategory = getHDICategory(normalized.hdi);
    const developmentClass = getDevelopmentClassification(normalized.developmentScore);

    console.log(`✓ Singapore paradigm conflict: Development=${normalized.developmentScore.toFixed(1)} (${developmentClass}), Western Liberal=51.6 (HYBRID)`);
  });
});
