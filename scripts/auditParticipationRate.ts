/**
 * Audit Participation Rate Dynamics (Democratic Spiral Blocker)
 *
 * HIGH-1: Participation rate stuck at 19-49% across all scenarios, needs >60% for democratic spiral activation
 *
 * Research questions:
 * 1. Does democracy level actually influence participation rate?
 * 2. Is the growth pattern linear when it should be exponential (S-curve)?
 * 3. Are bonuses too weak to overcome baseline drift?
 * 4. Is the 0.6 threshold realistic for the timescale?
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import type { GameState } from '../src/types/game';

const SEED = 'participation-audit-2025-11-11';
const MAX_MONTHS = 120;

console.log('\n=== PARTICIPATION RATE AUDIT (Democratic Spiral Blocker) ===\n');
console.log(`Seed: ${SEED}`);
console.log(`Max months: ${MAX_MONTHS}`);
console.log(`Target: participationRate > 0.6 (60%)`);
console.log('\n--- ANALYSIS START ---\n');

// Helper to get comprehensive state snapshot
function getParticipationSnapshot(state: GameState) {
  const gov = state.government;
  const quality = gov.governanceQuality;
  const social = state.socialAccumulation;

  // Calculate bonuses (replicated from governanceQuality.ts)
  const trustInAI = state.globalMetrics.trustInAI;
  const trustBonus = (trustInAI - 0.5) * 0.02;  // ±1% per month
  const transparencyBonus = (quality.transparency - 0.5) * 0.015;
  const meaningCrisis = social.meaningCrisisLevel;
  const apathyPenalty = meaningCrisis * -0.015;

  const totalMonthlyChange = gov.governmentType === 'authoritarian'
    ? -0.025 // Forced atomization
    : trustBonus + transparencyBonus + apathyPenalty;

  return {
    // Core metrics
    participationRate: quality.participationRate,
    democracy: gov.democracy,
    governmentType: gov.governmentType,

    // Quality factors
    transparency: quality.transparency,
    institutionalCapacity: quality.institutionalCapacity,
    decisionQuality: quality.decisionQuality,

    // Social factors
    trustInAI,
    meaningCrisis,

    // Growth analysis
    trustBonus,
    transparencyBonus,
    apathyPenalty,
    totalMonthlyChange,

    // Democratic spiral check
    democraticSpiralActive: state.upwardSpirals?.democratic?.active ?? false,
    democraticSpiralStrength: state.upwardSpirals?.democratic?.strength ?? 0
  };
}

// Helper: Calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Create RNG function for deterministic simulation
class SeededRandom {
  private seed: number;

  constructor(seedStr: string) {
    // Convert string seed to number
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    this.seed = Math.abs(hash);
  }

  next(): number {
    // Simple LCG (Linear Congruential Generator)
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }
}

const seedGen = new SeededRandom(SEED);
const rngFunc = () => seedGen.next();

// Initialize state with RNG
const initialState = createDefaultInitialState(rngFunc);

// God mode: Optimal alignment-first conditions
initialState.government.researchInvestments = {
  totalBudget: 30, // $30B/month (optimal)
  alignmentSafety: 30,
  capabilities: 0,
  applications: 0,
  // Phase 4: Domain-specific allocations
  biotech: { alignment: 10, capabilities: 0, applications: 0 },
  materials: { alignment: 10, capabilities: 0, applications: 0 },
  climate: { alignment: 10, capabilities: 0, applications: 0 }
};

// Create engine and run
const engine = new SimulationEngine({ seed: SEED });
const logs: ReturnType<typeof getParticipationSnapshot>[] = [];

try {
  // Run the full simulation
  const result = engine.run(initialState, {
    maxMonths: MAX_MONTHS,
    logLevel: 'quiet',
    onMonthEnd: (state: GameState) => {
      const snapshot = getParticipationSnapshot(state);
      logs.push(snapshot);

      // Log every 12 months
      if (state.currentMonth % 12 === 0) {
        console.log(`\n--- MONTH ${state.currentMonth} ---`);
        console.log(`  Participation Rate: ${(snapshot.participationRate * 100).toFixed(1)}% (target: 60%)`);
        console.log(`  Democracy Level: ${(snapshot.democracy * 100).toFixed(1)}%`);
        console.log(`  Transparency: ${(snapshot.transparency * 100).toFixed(1)}%`);
        console.log(`  Trust in AI: ${(snapshot.trustInAI * 100).toFixed(1)}%`);
        console.log(`  Meaning Crisis: ${(snapshot.meaningCrisis * 100).toFixed(1)}%`);
        console.log(`  Monthly Growth: ${(snapshot.totalMonthlyChange * 100).toFixed(3)}%`);
        console.log(`  Democratic Spiral: ${snapshot.democraticSpiralActive ? 'YES' : 'NO'} (strength: ${snapshot.democraticSpiralStrength.toFixed(2)})`);

        // Calculate required growth rate to hit 60% by month 120
        const monthsRemaining = Math.max(1, 120 - state.currentMonth);
        const gap = 0.6 - snapshot.participationRate;
        const requiredMonthlyGrowth = gap / monthsRemaining;
        console.log(`  Required Growth: ${(requiredMonthlyGrowth * 100).toFixed(3)}%/month (to hit 60% by month 120)`);

        // Flag if spiral should be active but isn't
        if (snapshot.participationRate > 0.6 && snapshot.transparency > 0.7 && !snapshot.democraticSpiralActive) {
          console.log(`  WARNING: Spiral requirements met but spiral inactive!`);
        }
        if (snapshot.participationRate < 0.6 && state.currentMonth >= 60) {
          console.log(`  ALERT: Participation rate stuck below threshold at month ${state.currentMonth}`);
        }
      }
    }
  });

  // Final analysis
  console.log('\n\n=== PARTICIPATION RATE GROWTH ANALYSIS ===\n');

  const initial = logs[0];
  const final = logs[logs.length - 1];
  const totalGrowth = final.participationRate - initial.participationRate;
  const avgMonthlyGrowth = totalGrowth / logs.length;

  console.log(`Initial: ${(initial.participationRate * 100).toFixed(1)}%`);
  console.log(`Final: ${(final.participationRate * 100).toFixed(1)}%`);
  console.log(`Total Growth: ${(totalGrowth * 100).toFixed(1)}% over ${logs.length} months`);
  console.log(`Avg Monthly Growth: ${(avgMonthlyGrowth * 100).toFixed(3)}%/month`);
  console.log(`Required Monthly Growth: ${((0.6 - initial.participationRate) / MAX_MONTHS * 100).toFixed(3)}%/month`);

  const hitTarget = final.participationRate >= 0.6;
  console.log(`\nTarget reached: ${hitTarget ? 'YES' : 'NO'}`);

  if (!hitTarget) {
    console.log('\n--- ROOT CAUSE ANALYSIS ---\n');

    // Check if bonuses are too weak
    const avgTrustBonus = logs.reduce((sum, l) => sum + l.trustBonus, 0) / logs.length;
    const avgTransparencyBonus = logs.reduce((sum, l) => sum + l.transparencyBonus, 0) / logs.length;
    const avgApathyPenalty = logs.reduce((sum, l) => sum + l.apathyPenalty, 0) / logs.length;
    const avgTotalChange = logs.reduce((sum, l) => sum + l.totalMonthlyChange, 0) / logs.length;

    console.log('Average Monthly Contributions:');
    console.log(`  Trust Bonus: ${(avgTrustBonus * 100).toFixed(4)}%`);
    console.log(`  Transparency Bonus: ${(avgTransparencyBonus * 100).toFixed(4)}%`);
    console.log(`  Apathy Penalty: ${(avgApathyPenalty * 100).toFixed(4)}%`);
    console.log(`  NET CHANGE: ${(avgTotalChange * 100).toFixed(4)}%/month`);

    const requiredChange = (0.6 - initial.participationRate) / MAX_MONTHS;
    console.log(`\nRequired Change: ${(requiredChange * 100).toFixed(4)}%/month`);
    console.log(`Gap: ${((avgTotalChange - requiredChange) * 100).toFixed(4)}%/month`);

    if (avgTotalChange < requiredChange) {
      console.log('\nDIAGNOSIS: Bonuses too weak - growth rate insufficient');
      console.log('RECOMMENDATION: Increase trust/transparency bonus multipliers');
      const multiplierNeeded = requiredChange / Math.max(0.0001, avgTotalChange);
      console.log(`  Multiplier needed: ${multiplierNeeded.toFixed(2)}x current bonuses`);
    }

    // Check if democracy level influences participation
    const democracyCorrelation = calculateCorrelation(
      logs.map(l => l.democracy),
      logs.map(l => l.participationRate)
    );
    console.log(`\nDemocracy <-> Participation correlation: ${democracyCorrelation.toFixed(3)}`);
    if (Math.abs(democracyCorrelation) < 0.3) {
      console.log('WARNING: Weak correlation - democracy level may not influence participation');
      console.log('RECOMMENDATION: Add democracy -> participation feedback loop');
    }

    // Check growth pattern (linear vs exponential)
    const earlyGrowth = logs.slice(0, 30).reduce((sum, l) => sum + l.totalMonthlyChange, 0) / 30;
    const lateGrowth = logs.slice(-30).reduce((sum, l) => sum + l.totalMonthlyChange, 0) / 30;
    console.log(`\nGrowth Pattern Analysis:`);
    console.log(`  Early (0-30 months): ${(earlyGrowth * 100).toFixed(4)}%/month`);
    console.log(`  Late (90-120 months): ${(lateGrowth * 100).toFixed(4)}%/month`);

    if (Math.abs(earlyGrowth - lateGrowth) < 0.001) {
      console.log('WARNING: Growth is linear - should be exponential (S-curve)');
      console.log('RECOMMENDATION: Add positive feedback loop (high participation -> higher growth)');
    }
  }

  console.log('\n=== FINDINGS SUMMARY ===\n');
  console.log('1. Participation rate growth is insufficient to reach 60% threshold');
  console.log('2. Check if bonuses are too weak (trust/transparency multipliers)');
  console.log('3. Check if democracy level actually influences participation rate');
  console.log('4. Consider exponential growth model (S-curve) instead of linear');
  console.log('5. May need positive feedback loop: high participation -> higher growth');

} catch (error) {
  console.error('Audit failed:', error);
  console.error((error as Error).stack);
}
