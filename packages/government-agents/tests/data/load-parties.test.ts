/**
 * Tests for political party data loader
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadParties,
  loadAllParties,
  getGoverningParties,
  getOppositionParties,
  getParty,
  getCountriesWithPartyData,
  hasPartyData,
  getPartyCount,
  getLargestParty,
  hasGovernmentMajority
} from '../../src/data/loadParties';

describe('loadParties', () => {
  it('should load German parties (6 parties)', () => {
    const parties = loadParties('DEU');

    assert.equal(parties.length, 6);

    // Check party names
    const names = parties.map(p => p.name);
    assert.ok(names.some(name => name.includes('SPD')));
    assert.ok(names.some(name => name.includes('CDU/CSU')));
    assert.ok(names.some(name => name.includes('Greens')));
    assert.ok(names.some(name => name.includes('FDP')));
    assert.ok(names.some(name => name.includes('AfD')));
    assert.ok(names.some(name => name.includes('Linke')));
  });

  it('should load US parties (2 parties)', () => {
    const parties = loadParties('USA');

    assert.equal(parties.length, 2);

    const names = parties.map(p => p.name);
    assert.ok(names.some(name => name.includes('Democratic')));
    assert.ok(names.some(name => name.includes('Republican')));
  });

  it('should load Chinese parties (1 party)', () => {
    const parties = loadParties('CHN');

    assert.equal(parties.length, 1);
    assert.equal(parties[0].name, 'Chinese Communist Party (CCP)');
    assert.equal(parties[0].seatShare, 1.0);
  });

  it('should load Japanese parties (7 parties)', () => {
    const parties = loadParties('JPN');

    assert.equal(parties.length, 7);

    const names = parties.map(p => p.name);
    assert.ok(names.some(name => name.includes('LDP')));
    assert.ok(names.some(name => name.includes('CDP')));
    assert.ok(names.some(name => name.includes('Komeito')));
  });

  it('should load Indian parties (7 parties)', () => {
    const parties = loadParties('IND');

    assert.equal(parties.length, 7);

    const names = parties.map(p => p.name);
    assert.ok(names.some(name => name.includes('BJP')));
    assert.ok(names.some(name => name.includes('INC')));
    assert.ok(names.some(name => name.includes('Shiv Sena')));
  });

  it('should return empty array for unknown country', () => {
    const parties = loadParties('XXX');
    assert.equal(parties.length, 0);
  });

  it('should load all parties from all countries', () => {
    const allParties = loadAllParties();

    assert.equal(allParties.size, 5); // 5 countries
    assert.ok(allParties.has('DEU'));
    assert.ok(allParties.has('USA'));
    assert.ok(allParties.has('CHN'));
    assert.ok(allParties.has('JPN'));
    assert.ok(allParties.has('IND'));
  });

  it('should get governing parties for Germany', () => {
    const governing = getGoverningParties('DEU');

    // Traffic light coalition: SPD, Greens, FDP
    assert.equal(governing.length, 3);

    const names = governing.map(p => p.name);
    assert.ok(names.some(name => name.includes('SPD')));
    assert.ok(names.some(name => name.includes('Greens')));
    assert.ok(names.some(name => name.includes('FDP')));

    // CDU/CSU not in government
    assert.ok(!names.some(name => name.includes('CDU/CSU')));
  });

  it('should get opposition parties for Germany', () => {
    const opposition = getOppositionParties('DEU');

    // CDU/CSU, AfD, Linke
    assert.equal(opposition.length, 3);

    const names = opposition.map(p => p.name);
    assert.ok(names.some(name => name.includes('CDU/CSU')));
    assert.ok(names.some(name => name.includes('AfD')));
    assert.ok(names.some(name => name.includes('Linke')));
  });

  it('should get specific party by ID', () => {
    const spd = getParty('DEU', 'spd');

    assert.ok(spd);
    assert.equal(spd.id, 'spd');
    assert.ok(spd.name.includes('SPD'));
    assert.ok(spd.inGovernment);
  });

  it('should return undefined for unknown party ID', () => {
    const unknown = getParty('DEU', 'unknown');
    assert.equal(unknown, undefined);
  });

  it('should list countries with party data', () => {
    const countries = getCountriesWithPartyData();

    assert.equal(countries.length, 5);
    assert.ok(countries.includes('DEU'));
    assert.ok(countries.includes('USA'));
    assert.ok(countries.includes('CHN'));
    assert.ok(countries.includes('JPN'));
    assert.ok(countries.includes('IND'));
  });

  it('should check if country has party data', () => {
    assert.equal(hasPartyData('DEU'), true);
    assert.equal(hasPartyData('USA'), true);
    assert.equal(hasPartyData('XXX'), false);
  });

  it('should get party count by country', () => {
    assert.equal(getPartyCount('DEU'), 6);
    assert.equal(getPartyCount('USA'), 2);
    assert.equal(getPartyCount('CHN'), 1);
    assert.equal(getPartyCount('JPN'), 7);
    assert.equal(getPartyCount('IND'), 7);
    assert.equal(getPartyCount('XXX'), 0);
  });

  it('should get largest party by seat share', () => {
    const largestDEU = getLargestParty('DEU');
    assert.ok(largestDEU);
    assert.ok(largestDEU.name.includes('SPD')); // SPD has 34.1% seats

    const largestCHN = getLargestParty('CHN');
    assert.ok(largestCHN);
    assert.ok(largestCHN.name.includes('CCP')); // CCP has 100% seats

    const largestJPN = getLargestParty('JPN');
    assert.ok(largestJPN);
    assert.ok(largestJPN.name.includes('LDP')); // LDP has 55.6% seats

    const largestIND = getLargestParty('IND');
    assert.ok(largestIND);
    assert.ok(largestIND.name.includes('BJP')); // BJP has 56.2% seats
  });

  it('should check if government has majority', () => {
    // Germany: SPD + Greens + FDP = 27.9% + 16.0% + 12.5% = 56.4% (majority)
    assert.equal(hasGovernmentMajority('DEU'), true);

    // USA: Democrats = 50.9% (majority)
    assert.equal(hasGovernmentMajority('USA'), true);

    // China: CCP = 100% (majority)
    assert.equal(hasGovernmentMajority('CHN'), true);

    // Japan: LDP + Komeito = 55.6% + 5.7% = 61.3% (majority)
    assert.equal(hasGovernmentMajority('JPN'), true);

    // India: BJP + Shiv Sena = 56.2% + 3.3% = 59.5% (majority)
    assert.equal(hasGovernmentMajority('IND'), true);
  });

  it('should validate seat shares sum to approximately 1.0', () => {
    const countries = getCountriesWithPartyData();

    for (const country of countries) {
      const parties = loadParties(country);
      const totalSeats = parties.reduce((sum, party) => sum + party.seatShare, 0);

      // Allow small rounding errors
      assert.ok(totalSeats >= 0.99 && totalSeats <= 1.01,
        `${country} seat shares sum to ${totalSeats}, expected ~1.0`);
    }
  });

  it('should validate policy vectors are in valid range', () => {
    const allParties = loadAllParties();

    for (const [country, parties] of allParties) {
      for (const party of parties) {
        // All policy dimensions should be in [-1, 1]
        assert.ok(party.policies.economic >= -1 && party.policies.economic <= 1,
          `${country} ${party.name} economic policy out of range: ${party.policies.economic}`);
        assert.ok(party.policies.environmental >= -1 && party.policies.environmental <= 1,
          `${country} ${party.name} environmental policy out of range: ${party.policies.environmental}`);
        assert.ok(party.policies.technology >= -1 && party.policies.technology <= 1,
          `${country} ${party.name} technology policy out of range: ${party.policies.technology}`);
        assert.ok(party.policies.social >= -1 && party.policies.social <= 1,
          `${country} ${party.name} social policy out of range: ${party.policies.social}`);
        assert.ok(party.policies.civilLiberties >= -1 && party.policies.civilLiberties <= 1,
          `${country} ${party.name} civil liberties policy out of range: ${party.policies.civilLiberties}`);
        assert.ok(party.policies.international >= -1 && party.policies.international <= 1,
          `${country} ${party.name} international policy out of range: ${party.policies.international}`);
      }
    }
  });

  it('should validate coalition blacklists are respected', () => {
    // German AfD is blacklisted by all other parties
    const deuParties = loadParties('DEU');
    const afd = deuParties.find(p => p.id === 'afd');

    assert.ok(afd);

    for (const party of deuParties) {
      if (party.id !== 'afd') {
        // All other parties should have AfD in blacklist or not be compatible
        const isBlacklisted = party.coalitionBlacklist.includes('afd');
        const afdBlacklistsParty = afd.coalitionBlacklist.includes(party.id);

        assert.ok(isBlacklisted || afdBlacklistsParty,
          `${party.name} should not work with AfD`);
      }
    }
  });
});
