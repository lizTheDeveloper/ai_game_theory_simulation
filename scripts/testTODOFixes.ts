/**
 * Test script to verify TODO fixes in multiParadigmAggregator.ts
 *
 * Tests:
 * 1. hasGovernmentData flag is set correctly for 30 countries
 * 2. Indigenous derivation percentages are calculated from WVS coverage
 */

import { aggregateParadigms } from '../src/data/aggregators/multiParadigmAggregator';

async function testTODOFixes() {
  console.log('\n=== Testing TODO Fixes ===\n');

  // Run aggregator
  const aggregated = await aggregateParadigms();

  // Test 1: hasGovernmentData flag
  console.log('Test 1: hasGovernmentData flag');
  console.log('-------------------------------');

  const governmentSystemCountries = new Set([
    'USA', 'CHN', 'IND', 'DEU', 'GBR', 'FRA', 'JPN', 'ITA', 'BRA', 'CAN',
    'RUS', 'KOR', 'AUS', 'MEX', 'IDN', 'TUR', 'NLD', 'SAU', 'CHE', 'POL',
    'SWE', 'ARG', 'NOR', 'SGP', 'ISR', 'ZAF', 'ARE', 'EGY', 'IRN', 'TWN'
  ]);

  const countriesWithGovData = aggregated.countries.filter(c => c.dataQuality.hasGovernmentData);
  const expectedCount = 30;

  console.log(`Countries with government data: ${countriesWithGovData.length}`);
  console.log(`Expected: ${expectedCount}`);

  // Check each country
  let correctFlags = 0;
  for (const country of aggregated.countries) {
    const shouldHaveData = governmentSystemCountries.has(country.countryCode);
    const hasData = country.dataQuality.hasGovernmentData;

    if (shouldHaveData === hasData) {
      correctFlags++;
    } else {
      console.log(`  ⚠️  Mismatch: ${country.countryCode} - expected ${shouldHaveData}, got ${hasData}`);
    }
  }

  console.log(`Correct flags: ${correctFlags}/${aggregated.countries.length}`);
  console.log(`✅ Test 1: ${correctFlags === aggregated.countries.length ? 'PASS' : 'FAIL'}\n`);

  // Test 2: Indigenous derivation percentages
  console.log('Test 2: Indigenous derivation percentages');
  console.log('------------------------------------------');

  const indigenous = aggregated.global.diagnosticLenses.indigenous;
  console.log(`Indigenous score: ${indigenous.value.toFixed(1)}`);
  console.log(`Data availability: ${(indigenous.dataAvailability * 100).toFixed(1)}%`);
  console.log(`Derivation:`);
  console.log(`  - From simulation: ${indigenous.derivation.fromSimulation.toFixed(1)}%`);
  console.log(`  - From proxies: ${indigenous.derivation.fromProxies.toFixed(1)}%`);
  console.log(`  - Estimated: ${indigenous.derivation.estimated.toFixed(1)}%`);

  const totalPercentage = indigenous.derivation.fromSimulation + indigenous.derivation.fromProxies + indigenous.derivation.estimated;
  const isValid = Math.abs(totalPercentage - 100) < 0.1;

  console.log(`Total: ${totalPercentage.toFixed(1)}%`);
  console.log(`✅ Test 2: ${isValid ? 'PASS' : 'FAIL'}\n`);

  // Summary
  console.log('=== Summary ===');
  console.log(`Total countries: ${aggregated.countries.length}`);
  console.log(`Countries with government data: ${countriesWithGovData.length}`);
  console.log(`WVS data coverage: ${aggregated.coverage.wvsCountries} countries`);
  console.log('\nSample countries with government data:');
  countriesWithGovData.slice(0, 10).forEach(c => {
    console.log(`  - ${c.countryCode}: ${c.countryName} (WVS: ${c.dataQuality.hasWVSData ? 'YES' : 'NO'})`);
  });

  console.log('\n=== Tests Complete ===\n');
}

testTODOFixes().catch(console.error);
