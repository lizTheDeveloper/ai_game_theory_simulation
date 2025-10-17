/**
 * National AI Regulation
 *
 * Handles:
 * - Regulatory arbitrage dynamics
 * - Company migration between jurisdictions
 * - Safety erosion from regulatory race-to-bottom
 * - Harmonization effects from cooperation
 */

import { GameState } from '@/types/game';
import { CountryInteractionCache } from './interactionCache';

// ============================================================================
// REGULATORY ARBITRAGE
// ============================================================================

/**
 * Update regulatory arbitrage dynamics
 * Companies migrate to lax jurisdictions, safety standards erode
 */
export function updateRegulatoryArbitrage(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const arb = natAI.regulatoryArbitrage;

  // === UPDATE REGULATORY SPREAD ===
  // Find strictest and laxest jurisdictions
  let strictest = 0;
  let laxest = 1;

  for (const nation of natAI.nations) {
    if (nation.regulationLevel > strictest) strictest = nation.regulationLevel;
    if (nation.regulationLevel < laxest) laxest = nation.regulationLevel;
  }

  arb.strictestRegulation = strictest;
  arb.laxestRegulation = laxest;
  arb.regulatorySpread = strictest - laxest;

  // === RACE TO BOTTOM PRESSURE ===
  // Pressure increases with: high spread, high race intensity, low coordination
  arb.raceToBottomIntensity = Math.min(1,
    arb.regulatorySpread * 0.60 +  // 60% weight on spread
    natAI.raceIntensity.raceIntensity * 0.30 + // 30% weight on race
    (1 - arb.harmonizationLevel) * 0.10 // 10% weight on lack of coordination
  );

  // === SAFETY EROSION ===
  // High pressure erodes safety standards over time
  if (arb.raceToBottomIntensity > 0.50) {
    arb.safetyErosion = Math.min(0.50,
      arb.safetyErosion + arb.raceToBottomIntensity * 0.005 // Up to 0.5%/month
    );
  } else {
    // Slowly recover if pressure is low
    arb.safetyErosion = Math.max(0, arb.safetyErosion - 0.002); // -0.2%/month
  }

  // === COMPANY MIGRATION ===
  // Companies migrate to lax jurisdictions when spread is high
  const migrationProbability = arb.regulatorySpread * arb.raceToBottomIntensity * 0.02; // Up to 2%/month

  if (Math.random() < migrationProbability && arb.regulatorySpread > 0.30) {
    // Find strictest jurisdiction
    const strictestNation = natAI.nations.find(n => n.regulationLevel === strictest);
    // Find laxest jurisdiction
    const laxestNation = natAI.nations.find(n => n.regulationLevel === laxest);

    if (strictestNation && laxestNation && strictestNation.nation !== laxestNation.nation) {
      arb.companiesMigrated.push({
        from: strictestNation.nation,
        to: laxestNation.nation,
        month: state.currentMonth,
        reason: 'regulation',
      });

      console.log(`🏢 REGULATORY ARBITRAGE: Company migrated ${strictestNation.nation} → ${laxestNation.nation}`);
      console.log(`   Reason: Regulatory burden (spread: ${(arb.regulatorySpread * 100).toFixed(0)} points)`);

      // Effects: boost lax jurisdiction, weaken strict one
      laxestNation.investmentLevel += 5; // +$5B investment
      strictestNation.investmentLevel = Math.max(10, strictestNation.investmentLevel - 3); // -$3B

      // Erosion accelerates
      arb.safetyErosion = Math.min(0.60, arb.safetyErosion + 0.05);
    }
  }

  // === HARMONIZATION (COORDINATION EFFECT) ===
  // If cooperation agreement is active with strong terms, harmonization increases
  const coop = natAI.cooperationAgreement;
  if (coop && coop.active && coop.complianceLevel > 0.70) {
    arb.harmonizationLevel = Math.min(0.80,
      arb.harmonizationLevel + 0.01 // +1%/month
    );

    // Harmonization reduces spread (nations converge)
    const convergenceRate = arb.harmonizationLevel * 0.01;
    for (const nation of natAI.nations) {
      const meanRegulation = (strictest + laxest) / 2;
      if (nation.regulationLevel < meanRegulation) {
        nation.regulationLevel = Math.min(1, nation.regulationLevel + convergenceRate);
      } else if (nation.regulationLevel > meanRegulation) {
        nation.regulationLevel = Math.max(0, nation.regulationLevel - convergenceRate);
      }
    }
  } else {
    // Without coordination, harmonization decays
    arb.harmonizationLevel = Math.max(0.10, arb.harmonizationLevel - 0.005); // -0.5%/month
  }

  // === APPLY SAFETY EROSION ===
  // Reduces effective safety investment globally
  const erosionFactor = 1 - arb.safetyErosion;
  for (const nation of natAI.nations) {
    // Safety investment is less effective due to corner-cutting
    nation.safetyInvestment = Math.max(0, nation.safetyInvestment * erosionFactor);
  }

  // Log warnings
  if (arb.safetyErosion > 0.30 && state.currentMonth % 12 === 0) {
    console.log(`⚠️ REGULATORY RACE TO BOTTOM`);
    console.log(`   Safety erosion: ${(arb.safetyErosion * 100).toFixed(0)}%`);
    console.log(`   Regulatory spread: ${(arb.regulatorySpread * 100).toFixed(0)} points`);
    console.log(`   Harmonization: ${(arb.harmonizationLevel * 100).toFixed(0)}%`);
    console.log(`   Migrations: ${arb.companiesMigrated.length} total`);
  }
}
