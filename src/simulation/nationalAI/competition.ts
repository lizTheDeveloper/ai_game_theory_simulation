/**
 * National AI Competition & Race Dynamics
 *
 * Handles:
 * - AI race intensity calculations
 * - First-mover advantages
 * - Race effects on safety
 */

import { GameState } from '@/types/game';
import { CountryInteractionCache } from './interactionCache';

// ============================================================================
// RACE INTENSITY CALCULATION
// ============================================================================

/**
 * Calculate AI race intensity based on capability gaps, geopolitical tension, military AI
 */
export function calculateRaceIntensity(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const raceFactors = natAI.raceIntensity;

  const usNation = cache.usNation;
  const chinaNation = cache.chinaNation;

  if (!usNation || !chinaNation) return;

  // === CAPABILITY GAP (KEY DRIVER) ===
  raceFactors.capabilityGap = Math.abs(
    usNation.effectiveCapability - chinaNation.effectiveCapability
  );
  raceFactors.usLeading = usNation.effectiveCapability > chinaNation.effectiveCapability;
  raceFactors.chinaLeading = chinaNation.effectiveCapability > usNation.effectiveCapability;

  // Contribution: Gap drives racing (both leader wanting to maintain and follower wanting to catch up)
  raceFactors.gapContribution = Math.min(0.4, raceFactors.capabilityGap * 0.5);

  // === GEOPOLITICAL TENSION ===
  const usChinaTension = state.bilateralTensions.find(t =>
    (t.nationA === 'United States' && t.nationB === 'China') ||
    (t.nationA === 'China' && t.nationB === 'United States')
  );

  raceFactors.bilateralTension = usChinaTension?.tensionLevel || 0.5;
  raceFactors.nuclearFlashpoints = state.bilateralTensions.filter(t =>
    t.nuclearThreats
  ).length;

  // Contribution: High tension amplifies racing
  raceFactors.tensionContribution = Math.min(0.4,
    raceFactors.bilateralTension * 0.3 +
    raceFactors.nuclearFlashpoints * 0.1
  );

  // === MILITARY AI ===
  raceFactors.militaryAIDeployed = usNation.militaryAI > 2.0 || chinaNation.militaryAI > 2.0;
  raceFactors.autonomousWeapons = state.madDeterrence.autonomousWeapons;

  // Contribution: Military AI escalates race
  raceFactors.militaryContribution =
    (raceFactors.militaryAIDeployed ? 0.2 : 0) +
    (raceFactors.autonomousWeapons ? 0.1 : 0);

  // === TOTAL RACE INTENSITY ===
  raceFactors.raceIntensity = Math.min(1.0,
    raceFactors.gapContribution +
    raceFactors.tensionContribution +
    raceFactors.militaryContribution
  );

  // Log periodically
  if (state.currentMonth % 12 === 0) {
    console.log(`\n🏁 AI RACE INTENSITY: ${(raceFactors.raceIntensity * 100).toFixed(0)}%`);
    console.log(`   Capability Gap: US ${usNation.effectiveCapability.toFixed(2)} vs China ${chinaNation.effectiveCapability.toFixed(2)} (gap: ${raceFactors.capabilityGap.toFixed(2)})`);
    console.log(`   Gap Contribution: ${(raceFactors.gapContribution * 100).toFixed(0)}%`);
    console.log(`   Tension Contribution: ${(raceFactors.tensionContribution * 100).toFixed(0)}%`);
    console.log(`   Military Contribution: ${(raceFactors.militaryContribution * 100).toFixed(0)}%`);
  }
}

// ============================================================================
// FIRST-MOVER ADVANTAGE
// ============================================================================

/**
 * Update first-mover advantages for the leading nation
 */
export function updateFirstMoverAdvantage(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const fma = natAI.firstMoverAdvantage;

  // Determine current leader
  const leader = cache.globalLeader;
  if (!leader) return;

  const leaderNation = cache.nationMap.get(leader);
  if (!leaderNation) return;

  // === ECONOMIC DOMINANCE ===
  // Leader captures increasing share of AI market
  const capabilityLead = leaderNation.gap; // How far ahead

  // Market share scales with capability lead
  fma.marketShareCapture = Math.min(0.85, 0.50 + capabilityLead * 0.35);

  // Economic bonus scales with market share
  fma.leaderEconomicBonus = fma.marketShareCapture * 0.25; // Up to 25% GDP boost

  // Apply economic bonus to leader's growth
  if (leaderNation.nation === 'United States') {
    state.globalMetrics.economicGrowthRate = Math.max(0,
      state.globalMetrics.economicGrowthRate + fma.leaderEconomicBonus * 0.01
    );
  }

  // === STANDARD-SETTING POWER ===
  fma.standardSetter = leader;

  // Standard adoption increases with lead duration and strength
  const leadStrength = Math.min(1, capabilityLead * 2);
  fma.standardAdoption = Math.min(0.95, 0.60 + leadStrength * 0.35);

  // === NETWORK EFFECTS ===
  // Stronger as more users adopt
  fma.networkEffectStrength = Math.min(0.90, fma.standardAdoption * 0.85);
  fma.switchingCosts = Math.min(0.80, fma.networkEffectStrength * 0.70);

  // === STRATEGIC ADVANTAGES ===
  // Data advantage from market dominance
  fma.dataAdvantage = Math.min(0.85, fma.marketShareCapture * 0.95);

  // Talent attraction from ecosystem strength
  fma.talentAttraction = Math.min(0.90,
    fma.networkEffectStrength * 0.70 +
    fma.standardAdoption * 0.30
  );

  // === APPLY ADVANTAGES TO LEADER ===
  // Talent attraction boosts R&D productivity
  leaderNation.talentPool = Math.min(1, leaderNation.talentPool * (1 + fma.talentAttraction * 0.15));

  // Data advantage boosts capability growth
  // (Applied in capability development phase)

  // === LOCK-IN EFFECTS ON COMPETITORS ===
  // High switching costs slow competitor adoption
  for (const nation of natAI.nations) {
    if (nation.nation !== leader && fma.switchingCosts > 0.60) {
      // Reduce their effective capability slightly (adoption friction)
      nation.effectiveCapability = Math.max(0,
        nation.effectiveCapability - fma.switchingCosts * 0.05
      );
    }
  }

  // Log major shifts
  if (state.currentMonth % 24 === 0 && fma.marketShareCapture > 0.70) {
    console.log(`🏆 FIRST-MOVER ADVANTAGE: ${leader}`);
    console.log(`   Market share: ${(fma.marketShareCapture * 100).toFixed(0)}%`);
    console.log(`   Standard adoption: ${(fma.standardAdoption * 100).toFixed(0)}%`);
    console.log(`   Network effects: ${(fma.networkEffectStrength * 100).toFixed(0)}%`);
  }
}

// ============================================================================
// RACE EFFECTS ON SAFETY
// ============================================================================

/**
 * Apply race intensity effects on safety investment
 * Research: Racing creates "pressure to cut corners" (Bostrom 2014, Armstrong et al. 2016)
 */
export function applyRaceEffectsOnSafety(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const raceIntensity = natAI.raceIntensity.raceIntensity;

  // High race intensity erodes safety investment
  const safetyErosionRate = raceIntensity * 0.02; // Up to 2%/month at max race

  for (const nation of natAI.nations) {
    // Leading nations feel pressure to maintain lead
    // Lagging nations feel pressure to catch up
    // Both cut safety to go faster

    const isLeading = nation.nation === cache.globalLeader;
    const isLagging = nation.gap > 0.30;

    let nationSpecificErosion = safetyErosionRate;

    if (isLeading && raceIntensity > 0.60) {
      nationSpecificErosion *= 1.3; // 30% more pressure on leader
    }
    if (isLagging && raceIntensity > 0.60) {
      nationSpecificErosion *= 1.5; // 50% more pressure on laggard
    }

    // Apply erosion
    nation.safetyInvestment = Math.max(0,
      nation.safetyInvestment - nation.safetyInvestment * nationSpecificErosion
    );

    // Reduce deployment thresholds (deploy faster with less testing)
    nation.deploymentThreshold = Math.max(0.50,
      nation.deploymentThreshold - raceIntensity * 0.005
    );
  }

  // Global effects
  if (raceIntensity > 0.70) {
    // High race pressure reduces alignment research globally
    state.government.alignmentResearchInvestment = Math.max(0,
      state.government.alignmentResearchInvestment - state.government.alignmentResearchInvestment * 0.01
    );
  }
}

// ============================================================================
// INTEGRATION WITH MAD
// ============================================================================

/**
 * Apply national AI race intensity to MAD deterrence
 * (Called from MAD systems to get accurate race intensity)
 */
export function applyNationalAIToMAD(state: GameState): void {
  const natAI = state.nationalAI;
  const mad = state.madDeterrence;

  // Use national AI race intensity instead of simple heuristic
  const aiRaceIntensity = natAI.raceIntensity.raceIntensity;

  // Update MAD bilateral deterrence with accurate race intensity
  // (This replaces the simple calculation in nuclearStates.ts)

  // NOTE: Treaty decay and renegotiation is now handled in nuclearStates.ts
  // with gradual decay mechanics. This used to have instant collapse logic
  // but it was causing duplicate treaty collapse messages and conflicts.
}
