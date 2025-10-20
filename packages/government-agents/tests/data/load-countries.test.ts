/**
 * Tests for country data loader
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCountries,
  loadCountry,
  getCountryCodes,
  getCountryNames,
  getCountriesByType,
  getCountriesByGDP,
  getCountriesByStateCapacity
} from '../../src/data/loadCountries';
import { GovernmentType } from '../../src/core/GovernmentType';

describe('loadCountries', () => {
  it('should load all 30 countries', () => {
    const countries = loadCountries();
    assert.equal(countries.size, 30);
  });

  it('should load specific country data', () => {
    const germany = loadCountry('DEU');

    assert.ok(germany);
    assert.equal(germany.name, 'Germany');
    assert.equal(germany.type, 'parliamentary_democracy');
    assert.equal(germany.population, 83.2);
    assert.equal(germany.gdpPPP, 4800);
    assert.equal(germany.wgi.governmentEffectiveness, 1.6);
    assert.equal(germany.wgi.controlOfCorruption, 1.9);
    assert.equal(germany.wgi.regulatoryQuality, 1.7);
  });

  it('should return undefined for unknown country', () => {
    const unknown = loadCountry('XXX');
    assert.equal(unknown, undefined);
  });

  it('should get all country codes', () => {
    const codes = getCountryCodes();

    assert.ok(codes.includes('DEU'));
    assert.ok(codes.includes('USA'));
    assert.ok(codes.includes('CHN'));
    assert.ok(codes.includes('JPN'));
    assert.equal(codes.length, 30);
  });

  it('should get all country names', () => {
    const names = getCountryNames();

    assert.ok(names.includes('Germany'));
    assert.ok(names.includes('United States'));
    assert.ok(names.includes('China'));
    assert.ok(names.includes('Japan'));
    assert.equal(names.length, 30);
  });

  it('should filter countries by government type', () => {
    const democracies = getCountriesByType(GovernmentType.PARLIAMENTARY_DEMOCRACY);

    assert.ok(democracies.size > 0);
    assert.ok(democracies.has('DEU')); // Germany
    assert.ok(democracies.has('GBR')); // UK
    assert.ok(democracies.has('JPN')); // Japan

    // Should not include other types
    assert.ok(!democracies.has('USA')); // Presidential
    assert.ok(!democracies.has('CHN')); // Authoritarian
  });

  it('should sort countries by GDP descending', () => {
    const byGDP = getCountriesByGDP();

    // China should be #1 (largest GDP PPP)
    assert.equal(byGDP[0][0], 'CHN');
    assert.equal(byGDP[0][1].gdpPPP, 30300);

    // USA should be #2
    assert.equal(byGDP[1][0], 'USA');
    assert.equal(byGDP[1][1].gdpPPP, 23300);

    // Verify descending order
    for (let i = 0; i < byGDP.length - 1; i++) {
      assert.ok(byGDP[i][1].gdpPPP >= byGDP[i + 1][1].gdpPPP);
    }
  });

  it('should sort countries by state capacity descending', () => {
    const byCapacity = getCountriesByStateCapacity();

    // Singapore should be #1 (highest government effectiveness)
    assert.equal(byCapacity[0][0], 'SGP');
    assert.equal(byCapacity[0][1].wgi.governmentEffectiveness, 2.36);

    // Iran should be near bottom (negative government effectiveness)
    const iranIndex = byCapacity.findIndex(([code]) => code === 'IRN');
    assert.ok(iranIndex > 25); // Near bottom
    assert.ok(byCapacity[iranIndex][1].wgi.governmentEffectiveness < 0);

    // Verify descending order
    for (let i = 0; i < byCapacity.length - 1; i++) {
      assert.ok(
        byCapacity[i][1].wgi.governmentEffectiveness >=
        byCapacity[i + 1][1].wgi.governmentEffectiveness
      );
    }
  });

  it('should load diverse government types', () => {
    const countries = loadCountries();

    const types = new Set(Array.from(countries.values()).map(c => c.type));

    // Should have multiple government types
    assert.ok(types.has(GovernmentType.PARLIAMENTARY_DEMOCRACY));
    assert.ok(types.has(GovernmentType.PRESIDENTIAL_DEMOCRACY));
    assert.ok(types.has(GovernmentType.AUTHORITARIAN_TECHNOCRACY));
    assert.ok(types.has(GovernmentType.HYBRID_REGIME));
    assert.ok(types.has(GovernmentType.ABSOLUTE_MONARCHY));
  });

  it('should validate WGI metrics ranges', () => {
    const countries = loadCountries();

    for (const [code, data] of countries) {
      // WGI metrics should be in [-2.5, 2.5] range
      assert.ok(
        data.wgi.governmentEffectiveness >= -2.5 &&
        data.wgi.governmentEffectiveness <= 2.5,
        `${code} government effectiveness out of range: ${data.wgi.governmentEffectiveness}`
      );

      assert.ok(
        data.wgi.controlOfCorruption >= -2.5 &&
        data.wgi.controlOfCorruption <= 2.5,
        `${code} control of corruption out of range: ${data.wgi.controlOfCorruption}`
      );

      assert.ok(
        data.wgi.regulatoryQuality >= -2.5 &&
        data.wgi.regulatoryQuality <= 2.5,
        `${code} regulatory quality out of range: ${data.wgi.regulatoryQuality}`
      );
    }
  });

  it('should validate positive population and GDP', () => {
    const countries = loadCountries();

    for (const [code, data] of countries) {
      assert.ok(data.population > 0, `${code} has invalid population: ${data.population}`);
      assert.ok(data.gdpPPP > 0, `${code} has invalid GDP: ${data.gdpPPP}`);
    }
  });
});
