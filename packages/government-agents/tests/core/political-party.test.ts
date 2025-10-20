/**
 * Tests for PoliticalParty module
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PoliticalParty } from '../../src/core/PoliticalParty';
import { createPolicyVector } from '../../src/policy/PolicyVector';

describe('PoliticalParty', () => {
  it('should create a political party with required fields', () => {
    const party = new PoliticalParty({
      id: 'spd',
      name: 'Social Democratic Party',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: -0.3, environmental: 0.5 }),
      seatShare: 0.40
    });

    assert.equal(party.id, 'spd');
    assert.equal(party.name, 'Social Democratic Party');
    assert.equal(party.countryCode, 'DEU');
    assert.equal(party.seatShare, 0.40);
    assert.equal(party.voteShare, 0.40); // Default to seatShare
    assert.equal(party.inGovernment, false); // Default
    assert.equal(party.year, 2024); // Default
  });

  it('should use custom voteShare if provided', () => {
    const party = new PoliticalParty({
      id: 'fdp',
      name: 'Free Democratic Party',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: 0.6 }),
      seatShare: 0.10,
      voteShare: 0.12 // FDP got 12% votes but 10% seats
    });

    assert.equal(party.seatShare, 0.10);
    assert.equal(party.voteShare, 0.12);
  });

  it('should check coalition compatibility using blacklist', () => {
    const spd = new PoliticalParty({
      id: 'spd',
      name: 'SPD',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: -0.3 }),
      seatShare: 0.40,
      coalitionBlacklist: ['afd'] // SPD won't work with AfD
    });

    assert.equal(spd.isCompatibleWith('greens'), true);
    assert.equal(spd.isCompatibleWith('cdu'), true);
    assert.equal(spd.isCompatibleWith('afd'), false);
  });

  it('should calculate coalition preference scores', () => {
    const greens = new PoliticalParty({
      id: 'greens',
      name: 'Alliance 90/The Greens',
      countryCode: 'DEU',
      policies: createPolicyVector({ environmental: 0.8 }),
      seatShare: 0.15,
      coalitionPreferences: ['spd'], // Prefer SPD
      coalitionBlacklist: ['afd']    // Won't work with AfD
    });

    // Preferred partner
    assert.equal(greens.getCoalitionPreferenceScore('spd'), 1.0);

    // Neutral partner
    assert.equal(greens.getCoalitionPreferenceScore('fdp'), 0.5);

    // Blacklisted partner
    assert.equal(greens.getCoalitionPreferenceScore('afd'), 0.0);
  });

  it('should format toString representation', () => {
    const party = new PoliticalParty({
      id: 'cdu',
      name: 'Christian Democratic Union',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: 0.2 }),
      seatShare: 0.30
    });

    const str = party.toString();
    assert.ok(str.includes('Christian Democratic Union'));
    assert.ok(str.includes('DEU'));
    assert.ok(str.includes('30.0%'));
  });

  it('should track government participation', () => {
    const party = new PoliticalParty({
      id: 'spd',
      name: 'SPD',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: -0.3 }),
      seatShare: 0.40,
      inGovernment: true
    });

    assert.equal(party.inGovernment, true);

    // Can update government status
    party.inGovernment = false;
    assert.equal(party.inGovernment, false);
  });

  it('should model real coalition formation logic', () => {
    // German 2021 election parties
    const spd = new PoliticalParty({
      id: 'spd',
      name: 'SPD',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: -0.3, environmental: 0.5 }),
      seatShare: 0.40,
      coalitionPreferences: ['greens', 'fdp'],
      coalitionBlacklist: ['afd', 'linke']
    });

    const greens = new PoliticalParty({
      id: 'greens',
      name: 'Greens',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: -0.5, environmental: 0.9 }),
      seatShare: 0.15,
      coalitionPreferences: ['spd'],
      coalitionBlacklist: ['afd']
    });

    const fdp = new PoliticalParty({
      id: 'fdp',
      name: 'FDP',
      countryCode: 'DEU',
      policies: createPolicyVector({ economic: 0.6, environmental: 0.2 }),
      seatShare: 0.10,
      coalitionBlacklist: ['linke', 'afd']
    });

    // Traffic light coalition (SPD + Greens + FDP) should be compatible
    assert.ok(spd.isCompatibleWith('greens'));
    assert.ok(spd.isCompatibleWith('fdp'));
    assert.ok(greens.isCompatibleWith('spd'));
    assert.ok(greens.isCompatibleWith('fdp'));
    assert.ok(fdp.isCompatibleWith('spd'));
    assert.ok(fdp.isCompatibleWith('greens'));

    // Coalition has majority
    const totalSeats = spd.seatShare + greens.seatShare + fdp.seatShare;
    assert.ok(totalSeats > 0.5);
  });
});
