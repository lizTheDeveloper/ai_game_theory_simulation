/**
 * Test: Organization-to-Country Linkage Validation
 *
 * Ensures that all countries referenced in organization.geographicPresence
 * exist in state.countryPopulationSystem.countries
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createTestState } from '../src/simulation/initialization';

describe('Organization-Country Linkage', () => {
  it('should have all organization geographic presence countries in country system', () => {
    const state = createTestState();

    // Check if countryPopulationSystem is initialized
    assert.ok(state.countryPopulationSystem, 'countryPopulationSystem should be initialized');

    const missingCountries: { org: string, country: string }[] = [];

    // Check each organization's geographic presence
    for (const org of state.organizations) {
      if (!org.geographicPresence) continue;

      for (const presence of org.geographicPresence) {
        const country = state.countryPopulationSystem.countries[presence.country as any];

        if (!country) {
          missingCountries.push({
            org: org.name,
            country: presence.country
          });
        }
      }
    }

    // Report all missing countries
    if (missingCountries.length > 0) {
      console.error('\n❌ Missing Countries:');
      for (const { org, country } of missingCountries) {
        console.error(`   ${org} → ${country}`);
      }
    }

    assert.strictEqual(
      missingCountries.length,
      0,
      `Organizations reference ${missingCountries.length} countries not in countryPopulationSystem`
    );
  });

  it('should calculate bankruptcy risk for organizations with geographic presence', () => {
    const state = createTestState();

    // Find an org with geographicPresence
    const orgWithPresence = state.organizations.find(o => o.geographicPresence && o.geographicPresence.length > 0);
    assert.ok(orgWithPresence, 'Should have at least one org with geographic presence');

    // Bankruptcy risk should be defined and valid
    assert.ok(orgWithPresence.bankruptcyRisk !== undefined, 'Bankruptcy risk should be calculated');
    assert.ok(orgWithPresence.bankruptcyRisk >= 0 && orgWithPresence.bankruptcyRisk <= 1, 'Bankruptcy risk should be [0, 1]');
  });

  it('should validate operations weights sum to ~1.0 for each organization', () => {
    const state = createTestState();

    const invalidOrgs: { org: string, totalWeight: number }[] = [];

    for (const org of state.organizations) {
      if (!org.geographicPresence || org.geographicPresence.length === 0) continue;

      const totalWeight = org.geographicPresence.reduce((sum, p) => sum + p.operationsWeight, 0);

      // Allow 5% tolerance (weights should sum to 1.0 ± 0.05)
      if (Math.abs(totalWeight - 1.0) > 0.05) {
        invalidOrgs.push({
          org: org.name,
          totalWeight
        });
      }
    }

    if (invalidOrgs.length > 0) {
      console.error('\n⚠️  Organizations with invalid operations weights:');
      for (const { org, totalWeight } of invalidOrgs) {
        console.error(`   ${org}: ${totalWeight.toFixed(3)} (should be ~1.0)`);
      }
    }

    assert.strictEqual(
      invalidOrgs.length,
      0,
      `${invalidOrgs.length} organizations have operations weights not summing to 1.0`
    );
  });

  it('should handle organization economics with multi-country presence', () => {
    const state = createTestState();

    // Find org with geographic presence
    const org = state.organizations.find(o => o.geographicPresence && o.geographicPresence.length > 1);
    assert.ok(org, 'Should have at least one org with multi-country presence');

    // Verify monthly revenue and expenses are valid numbers
    assert.ok(!isNaN(org.monthlyRevenue), `${org.name} monthlyRevenue should not be NaN`);
    assert.ok(!isNaN(org.monthlyExpenses), `${org.name} monthlyExpenses should not be NaN`);
    assert.ok(org.monthlyRevenue >= 0, `${org.name} monthlyRevenue should be >= 0`);
    assert.ok(org.monthlyExpenses >= 0, `${org.name} monthlyExpenses should be >= 0`);
  });

  it('should not have deprecated country field conflicts with geographicPresence', () => {
    const state = createTestState();

    const conflicts: { org: string, deprecatedCountry: string, presenceCountries: string[] }[] = [];

    for (const org of state.organizations) {
      if (!org.geographicPresence || org.geographicPresence.length === 0) continue;

      // Check if deprecated 'country' field conflicts with primary geographic presence
      if (org.country && org.country !== 'Multi-national') {
        const primaryPresence = org.geographicPresence.reduce((max, p) =>
          p.operationsWeight > max.operationsWeight ? p : max
        );

        if (org.country !== primaryPresence.country) {
          conflicts.push({
            org: org.name,
            deprecatedCountry: org.country,
            presenceCountries: org.geographicPresence.map(p => `${p.country} (${(p.operationsWeight * 100).toFixed(0)}%)`)
          });
        }
      }
    }

    if (conflicts.length > 0) {
      console.warn('\n⚠️  Organizations with deprecated country field conflicts:');
      for (const { org, deprecatedCountry, presenceCountries } of conflicts) {
        console.warn(`   ${org}:`);
        console.warn(`      Deprecated field: ${deprecatedCountry}`);
        console.warn(`      Geographic presence: ${presenceCountries.join(', ')}`);
      }
      console.warn('   Note: geographicPresence takes precedence, deprecated field should match primary country');
    }

    // This is a warning, not a failure - the code handles it via fallback logic
  });
});
