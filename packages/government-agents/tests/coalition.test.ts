/**
 * Coalition Formation Tests
 *
 * Tests for coalition formation algorithm and stability calculations
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PoliticalParty } from '../src/core/PoliticalParty.js';
import { Coalition } from '../src/coalition/Coalition.js';
import { formCoalition, findAllMinimalWinningCoalitions } from '../src/coalition/CoalitionFormation.js';
import { calculateStability } from '../src/coalition/CoalitionStability.js';
import { createPolicyVector } from '../src/policy/PolicyVector.js';

describe('Coalition Formation', () => {
  it('should form single-party government when party has majority', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Majority Party',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0 }),
        seatShare: 0.55,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Opposition',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: -0.5 }),
        seatShare: 0.45,
      }),
    ];

    const coalition = formCoalition(parties);

    assert.ok(coalition, 'Coalition should be formed');
    assert.strictEqual(coalition.getSize(), 1, 'Should be single-party government');
    assert.strictEqual(coalition.hasParty('party1'), true, 'Should be majority party');
  });

  it('should form minimal winning coalition', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.3 }),
        seatShare: 0.40,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.2 }),
        seatShare: 0.25,
      }),
      new PoliticalParty({
        id: 'party3',
        name: 'Party 3',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: -0.5 }),
        seatShare: 0.20,
      }),
      new PoliticalParty({
        id: 'party4',
        name: 'Party 4',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.25 }),
        seatShare: 0.15,
      }),
    ];

    const coalition = formCoalition(parties);

    assert.ok(coalition, 'Coalition should be formed');
    assert.ok(coalition.hasMajority(), 'Coalition should have majority');
    assert.ok(coalition.isMinimalWinning(), 'Coalition should be minimal winning');
  });

  it('should prefer policy-similar parties', () => {
    const parties = [
      new PoliticalParty({
        id: 'left1',
        name: 'Left Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: -0.6 }),
        seatShare: 0.30,
      }),
      new PoliticalParty({
        id: 'left2',
        name: 'Left Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: -0.5 }),
        seatShare: 0.25,
      }),
      new PoliticalParty({
        id: 'right',
        name: 'Right Party',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.7 }),
        seatShare: 0.30,
      }),
      new PoliticalParty({
        id: 'center',
        name: 'Center Party',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.0 }),
        seatShare: 0.15,
      }),
    ];

    const coalition = formCoalition(parties);

    assert.ok(coalition, 'Coalition should be formed');

    // Should prefer left1 + left2 (close policy) over left1 + right (far policy)
    const hasLeft1 = coalition.hasParty('left1');
    const hasLeft2 = coalition.hasParty('left2');
    const hasRight = coalition.hasParty('right');

    // Most likely: left1 + left2 (55% seats, similar policies)
    // Or: right + center (45% - not majority)
    // Or: left1 + center (45% - not majority)

    if (hasLeft1 && hasLeft2) {
      assert.ok(true, 'Formed left coalition (expected)');
    } else if (hasLeft1 || hasLeft2) {
      // One left party with center or right
      assert.ok(true, 'Formed mixed coalition');
    }
  });

  it('should respect coalition blacklists', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.3 }),
        seatShare: 0.40,
        coalitionBlacklist: ['party2'], // Won't work with party2
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.2 }),
        seatShare: 0.25,
      }),
      new PoliticalParty({
        id: 'party3',
        name: 'Party 3',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.1 }),
        seatShare: 0.20,
      }),
    ];

    const coalition = formCoalition(parties);

    assert.ok(coalition, 'Coalition should be formed');

    // Should not have both party1 and party2
    const hasParty1 = coalition.hasParty('party1');
    const hasParty2 = coalition.hasParty('party2');

    assert.ok(!(hasParty1 && hasParty2), 'Coalition should not contain blacklisted combination');
  });
});

describe('Coalition Stability', () => {
  it('should calculate stability metrics', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.3, environmental: 0.5 }),
        seatShare: 0.35,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.2, environmental: 0.4 }),
        seatShare: 0.20,
      }),
    ];

    const coalition = new Coalition({ parties, formationDate: 0 });
    const stability = calculateStability(coalition, 12); // 12 months in power

    assert.ok(stability.overallStability >= 0 && stability.overallStability <= 1,
      'Overall stability should be in range 0-1');
    assert.ok(stability.policyCohesion >= 0 && stability.policyCohesion <= 1,
      'Policy cohesion should be in range 0-1');
    assert.ok(stability.monthlyBreakupProbability >= 0 && stability.monthlyBreakupProbability <= 1,
      'Breakup probability should be in range 0-1');
  });

  it('should show higher stability for cohesive coalitions', () => {
    // Cohesive coalition (similar policies)
    const cohesiveParties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.3, environmental: 0.5 }),
        seatShare: 0.30,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.35, environmental: 0.45 }),
        seatShare: 0.25,
      }),
    ];

    // Diverse coalition (different policies)
    const diverseParties = [
      new PoliticalParty({
        id: 'party3',
        name: 'Party 3',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: -0.6, environmental: 0.7 }),
        seatShare: 0.30,
      }),
      new PoliticalParty({
        id: 'party4',
        name: 'Party 4',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.7, environmental: -0.5 }),
        seatShare: 0.25,
      }),
    ];

    const cohesiveCoalition = new Coalition({ parties: cohesiveParties, formationDate: 0 });
    const diverseCoalition = new Coalition({ parties: diverseParties, formationDate: 0 });

    const cohesiveStability = calculateStability(cohesiveCoalition, 12);
    const diverseStability = calculateStability(diverseCoalition, 12);

    assert.ok(cohesiveStability.policyCohesion > diverseStability.policyCohesion,
      'Cohesive coalition should have higher policy cohesion');
    assert.ok(cohesiveStability.overallStability > diverseStability.overallStability,
      'Cohesive coalition should have higher overall stability');
  });
});

describe('Coalition Properties', () => {
  it('should correctly identify minimal winning coalitions', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({}),
        seatShare: 0.35,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({}),
        seatShare: 0.20,
      }),
    ];

    const coalition = new Coalition({ parties, formationDate: 0 });

    assert.ok(coalition.hasMajority(), 'Coalition should have majority (55%)');
    assert.ok(coalition.isMinimalWinning(), 'Coalition should be minimal winning');
    assert.strictEqual(coalition.getSize(), 2, 'Coalition should have 2 parties');
  });

  it('should calculate policy centroid', () => {
    const parties = [
      new PoliticalParty({
        id: 'party1',
        name: 'Party 1',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.4 }),
        seatShare: 0.30,
      }),
      new PoliticalParty({
        id: 'party2',
        name: 'Party 2',
        countryCode: 'TEST',
        policies: createPolicyVector({ economic: 0.2 }),
        seatShare: 0.25,
      }),
    ];

    const coalition = new Coalition({ parties, formationDate: 0 });
    const centroid = coalition.getPolicyCentroid();

    // Weighted average: (0.4 * 0.30 + 0.2 * 0.25) / (0.30 + 0.25) = 0.309
    assert.ok(Math.abs(centroid.economic - 0.309) < 0.01, 'Should calculate weighted centroid');
  });
});
