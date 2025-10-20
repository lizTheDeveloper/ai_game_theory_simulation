/**
 * Tests for PolicyVector module
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPolicyVector,
  calculatePolicyDistance,
  calculatePolicyCentroid,
  calculateWeightedPolicyCentroid,
  type PolicyVector
} from '../../src/policy/PolicyVector';

describe('PolicyVector', () => {
  it('should create policy vector with defaults', () => {
    const vector = createPolicyVector({});

    assert.equal(vector.economic, 0);
    assert.equal(vector.environmental, 0);
    assert.equal(vector.technology, 0);
    assert.equal(vector.social, 0);
    assert.equal(vector.civilLiberties, 0);
    assert.equal(vector.international, 0);
  });

  it('should clamp values to [-1, 1] range', () => {
    const vector = createPolicyVector({
      economic: 2.0,
      environmental: -2.0,
      technology: 0.5
    });

    assert.equal(vector.economic, 1.0);
    assert.equal(vector.environmental, -1.0);
    assert.equal(vector.technology, 0.5);
  });

  it('should calculate distance between two policy vectors', () => {
    const greenParty: PolicyVector = createPolicyVector({
      economic: -0.4,
      environmental: 0.8,
      technology: -0.2,
      social: 0.7,
      civilLiberties: 0.5,
      international: 0.6
    });

    const conservativeParty: PolicyVector = createPolicyVector({
      economic: 0.5,
      environmental: -0.3,
      technology: 0.3,
      social: -0.4,
      civilLiberties: -0.2,
      international: -0.1
    });

    const distance = calculatePolicyDistance(greenParty, conservativeParty);

    // These parties are quite far apart in policy space
    assert.ok(distance > 1.5);
    assert.ok(distance < 3.0);
  });

  it('should calculate zero distance for identical vectors', () => {
    const party1: PolicyVector = createPolicyVector({
      economic: 0.5,
      environmental: 0.3
    });

    const party2: PolicyVector = createPolicyVector({
      economic: 0.5,
      environmental: 0.3
    });

    const distance = calculatePolicyDistance(party1, party2);
    assert.equal(distance, 0);
  });

  it('should calculate centroid of multiple policy vectors', () => {
    const party1: PolicyVector = createPolicyVector({
      economic: -0.5,
      environmental: 0.5
    });

    const party2: PolicyVector = createPolicyVector({
      economic: 0.5,
      environmental: 0.5
    });

    const centroid = calculatePolicyCentroid([party1, party2]);

    // Centroid should be at midpoint
    assert.equal(centroid.economic, 0);
    assert.equal(centroid.environmental, 0.5);
  });

  it('should return zero vector for empty array', () => {
    const centroid = calculatePolicyCentroid([]);

    assert.equal(centroid.economic, 0);
    assert.equal(centroid.environmental, 0);
  });

  it('should calculate weighted centroid with seat shares', () => {
    const spd: PolicyVector = createPolicyVector({
      economic: -0.3,
      environmental: 0.6
    });

    const greens: PolicyVector = createPolicyVector({
      economic: -0.5,
      environmental: 0.9
    });

    const fdp: PolicyVector = createPolicyVector({
      economic: 0.6,
      environmental: 0.2
    });

    // German traffic light coalition seat shares (approximate)
    const weights = [0.40, 0.15, 0.10]; // SPD 40%, Greens 15%, FDP 10%

    const coalitionPolicy = calculateWeightedPolicyCentroid(
      [spd, greens, fdp],
      weights
    );

    // Coalition should be left of center economically (SPD dominant)
    assert.ok(coalitionPolicy.economic < 0);

    // Coalition should be pro-environment (all parties support)
    assert.ok(coalitionPolicy.environmental > 0.4);
  });

  it('should return zero vector for mismatched arrays', () => {
    const party1: PolicyVector = createPolicyVector({ economic: 0.5 });
    const centroid = calculateWeightedPolicyCentroid([party1], []);

    assert.equal(centroid.economic, 0);
  });

  it('should correctly represent real-world party positions', () => {
    // Example: German CDU/CSU (Christian Democrats)
    const cdu: PolicyVector = createPolicyVector({
      economic: 0.2,         // Center-right market orientation
      environmental: 0.1,    // Moderate climate policy
      technology: 0.0,       // Cautious on AI regulation
      social: -0.1,          // Conservative on social issues
      civilLiberties: 0.0,   // Balanced approach
      international: 0.5     // Pro-EU
    });

    // All values should be in valid range
    assert.ok(cdu.economic >= -1 && cdu.economic <= 1);
    assert.ok(cdu.environmental >= -1 && cdu.environmental <= 1);
    assert.ok(cdu.technology >= -1 && cdu.technology <= 1);
    assert.ok(cdu.social >= -1 && cdu.social <= 1);
    assert.ok(cdu.civilLiberties >= -1 && cdu.civilLiberties <= 1);
    assert.ok(cdu.international >= -1 && cdu.international <= 1);
  });
});
