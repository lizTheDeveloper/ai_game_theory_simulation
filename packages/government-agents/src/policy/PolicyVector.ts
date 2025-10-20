/**
 * Multi-Dimensional Policy Space
 *
 * Based on Manifesto Project Database (Lehmann et al. 2024)
 * 6-dimensional policy positioning for parties and governments
 *
 * @module policy/PolicyVector
 */

/**
 * Policy dimension value (-1 to +1)
 */
export type PolicyDimensionValue = number;

/**
 * 6-Dimensional Policy Vector
 *
 * All dimensions normalized to -1 to +1 scale for comparability
 */
export interface PolicyVector {
  /**
   * Economic Policy
   * -1 = Heavy regulation, state control, wealth redistribution
   *  0 = Mixed economy
   * +1 = Free market, deregulation, low taxes
   *
   * Examples:
   * - Socialist parties: -0.8 to -0.6
   * - Social democrats: -0.4 to -0.2
   * - Christian democrats: -0.1 to +0.2
   * - Libertarians: +0.6 to +0.8
   */
  economic: PolicyDimensionValue;

  /**
   * Environmental Policy
   * -1 = Economic growth priority, weak environmental regulation
   *  0 = Balanced approach
   * +1 = Climate action priority, strong environmental protection
   *
   * Examples:
   * - Green parties: +0.7 to +0.9
   * - Social democrats: +0.3 to +0.5
   * - Conservative parties: -0.2 to +0.1
   * - Nationalist parties: -0.5 to -0.3
   */
  environmental: PolicyDimensionValue;

  /**
   * Technology Policy
   * -1 = Precautionary principle, heavy regulation
   *  0 = Balanced innovation and safety
   * +1 = Accelerationist, light-touch regulation
   *
   * Examples:
   * - Tech-friendly liberals: +0.5 to +0.7
   * - Pragmatic centrists: -0.1 to +0.2
   * - Traditional conservatives: -0.3 to -0.1
   * - Cautious greens: -0.4 to -0.2
   */
  technology: PolicyDimensionValue;

  /**
   * Social Policy
   * -1 = Traditional values, restricted rights
   *  0 = Moderate
   * +1 = Progressive, expanded rights
   *
   * Examples:
   * - Progressive parties: +0.6 to +0.9
   * - Centrist liberals: +0.2 to +0.4
   * - Conservatives: -0.3 to +0.1
   * - Religious conservatives: -0.7 to -0.4
   */
  social: PolicyDimensionValue;

  /**
   * Civil Liberties
   * -1 = Security priority, surveillance, control
   *  0 = Balanced
   * +1 = Privacy priority, individual freedoms
   *
   * Examples:
   * - Libertarians: +0.7 to +0.9
   * - Civil rights liberals: +0.4 to +0.6
   * - Mainstream parties: -0.1 to +0.2
   * - Authoritarian parties: -0.6 to -0.3
   */
  civilLiberties: PolicyDimensionValue;

  /**
   * International Relations
   * -1 = National sovereignty, protectionism
   *  0 = Pragmatic engagement
   * +1 = Multilateralism, international cooperation
   *
   * Examples:
   * - Pro-EU parties: +0.5 to +0.8
   * - Pragmatic centrists: +0.1 to +0.3
   * - Soft eurosceptics: -0.2 to 0
   * - Nationalists: -0.7 to -0.4
   */
  international: PolicyDimensionValue;
}

/**
 * Create a policy vector with validation
 */
export function createPolicyVector(partial: Partial<PolicyVector>): PolicyVector {
  const vector: PolicyVector = {
    economic: clamp(partial.economic ?? 0, -1, 1),
    environmental: clamp(partial.environmental ?? 0, -1, 1),
    technology: clamp(partial.technology ?? 0, -1, 1),
    social: clamp(partial.social ?? 0, -1, 1),
    civilLiberties: clamp(partial.civilLiberties ?? 0, -1, 1),
    international: clamp(partial.international ?? 0, -1, 1),
  };

  return vector;
}

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate Euclidean distance between two policy vectors
 * Used for coalition formation (parties closer in policy space form coalitions)
 *
 * Research: Laver (2020) - Spatial model of politics
 */
export function calculatePolicyDistance(v1: PolicyVector, v2: PolicyVector): number {
  const economicDist = (v1.economic - v2.economic) ** 2;
  const environmentalDist = (v1.environmental - v2.environmental) ** 2;
  const technologyDist = (v1.technology - v2.technology) ** 2;
  const socialDist = (v1.social - v2.social) ** 2;
  const civilLibertiesDist = (v1.civilLiberties - v2.civilLiberties) ** 2;
  const internationalDist = (v1.international - v2.international) ** 2;

  return Math.sqrt(
    economicDist +
    environmentalDist +
    technologyDist +
    socialDist +
    civilLibertiesDist +
    internationalDist
  );
}

/**
 * Calculate centroid (average) of multiple policy vectors
 * Used to find coalition policy position
 */
export function calculatePolicyCentroid(vectors: PolicyVector[]): PolicyVector {
  if (vectors.length === 0) {
    return createPolicyVector({});
  }

  const sum = vectors.reduce((acc, v) => ({
    economic: acc.economic + v.economic,
    environmental: acc.environmental + v.environmental,
    technology: acc.technology + v.technology,
    social: acc.social + v.social,
    civilLiberties: acc.civilLiberties + v.civilLiberties,
    international: acc.international + v.international,
  }), {
    economic: 0,
    environmental: 0,
    technology: 0,
    social: 0,
    civilLiberties: 0,
    international: 0,
  });

  const count = vectors.length;
  return {
    economic: sum.economic / count,
    environmental: sum.environmental / count,
    technology: sum.technology / count,
    social: sum.social / count,
    civilLiberties: sum.civilLiberties / count,
    international: sum.international / count,
  };
}

/**
 * Weighted centroid (for coalition with different seat shares)
 */
export function calculateWeightedPolicyCentroid(
  vectors: PolicyVector[],
  weights: number[]
): PolicyVector {
  if (vectors.length === 0 || vectors.length !== weights.length) {
    return createPolicyVector({});
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const weightedSum = vectors.reduce((acc, v, i) => ({
    economic: acc.economic + v.economic * weights[i]!,
    environmental: acc.environmental + v.environmental * weights[i]!,
    technology: acc.technology + v.technology * weights[i]!,
    social: acc.social + v.social * weights[i]!,
    civilLiberties: acc.civilLiberties + v.civilLiberties * weights[i]!,
    international: acc.international + v.international * weights[i]!,
  }), {
    economic: 0,
    environmental: 0,
    technology: 0,
    social: 0,
    civilLiberties: 0,
    international: 0,
  });

  return {
    economic: weightedSum.economic / totalWeight,
    environmental: weightedSum.environmental / totalWeight,
    technology: weightedSum.technology / totalWeight,
    social: weightedSum.social / totalWeight,
    civilLiberties: weightedSum.civilLiberties / totalWeight,
    international: weightedSum.international / totalWeight,
  };
}
