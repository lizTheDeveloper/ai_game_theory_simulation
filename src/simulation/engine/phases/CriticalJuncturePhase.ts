/**
 * CONTINGENCY & AGENCY PHASE 3: CRITICAL JUNCTURE AGENCY
 *
 * Models the 10% of history where individual/collective agency can alter structural trajectories.
 * 90% of history is determined by structural forces, but at critical junctures, agency emerges.
 *
 * Research Foundation:
 * - Acemoglu & Robinson (2001): Critical junctures as moments of institutional fluidity
 * - Svolik (2012): Democratic breakdowns require both elite defection AND mass mobilization
 * - Kuran (1991): Preference falsification - hidden opposition can suddenly cascade
 * - Sen (1999): Agency as capability to shape outcomes (democracy enables agency)
 *
 * Historical Case Studies:
 * - Vasili Arkhipov (1962): Single vote prevented nuclear war during Cuban Missile Crisis
 * - Leipzig Protests (1989): One defection revealed hidden opposition → cascade → Berlin Wall fell
 * - Montreal Protocol (1987): International cooperation despite economic incentives
 *
 * Key Insight: Agency emerges at specific structural conditions:
 * 1. Institutional flux (institutions weakened but not destroyed)
 * 2. Information ambiguity (coordination problems, hidden preferences)
 * 3. Balanced forces (crisis exists but not overwhelming)
 *
 * Order in PhaseOrchestrator: 29 (after crisis detection, before extinction checks)
 */

import { GameState } from '../../../types/game';
import { SimulationPhase, PhaseResult, PhaseContext } from '../SimulationPhase';

/**
 * Count active crises in the simulation
 * Used to determine if forces are "balanced" (not zero crises, not overwhelming)
 */
function countActiveCrises(state: GameState): number {
  let count = 0;

  // Environmental accumulation crises
  if (state.environmentalAccumulation.resourceCrisisActive) count++;
  if (state.environmentalAccumulation.pollutionCrisisActive) count++;
  if (state.environmentalAccumulation.climateCrisisActive) count++;
  if (state.environmentalAccumulation.ecosystemCrisisActive) count++;

  // Social accumulation crises
  if (state.socialAccumulation.meaningCollapseActive) count++;
  if (state.socialAccumulation.institutionalFailureActive) count++;
  if (state.socialAccumulation.socialUnrestActive) count++;

  // Technological risk crises
  if (state.technologicalRisk.controlLossActive) count++;
  if (state.technologicalRisk.corporateDystopiaActive) count++;
  if (state.technologicalRisk.complacencyCrisisActive) count++;

  // Planetary boundaries crises
  if (state.planetaryBoundariesSystem?.biodiversityStatus === 'crisis') count++;
  if (state.planetaryBoundariesSystem?.nitrogenStatus === 'crisis') count++;
  if (state.planetaryBoundariesSystem?.landUseStatus === 'crisis') count++;

  // Specific system crises
  if (state.phosphorusSystem?.crisisActive) count++;
  if (state.freshwaterSystem?.dayZeroDroughtActive) count++;
  if (state.oceanAcidificationSystem?.marineCollapseActive) count++;
  if (state.novelEntitiesSystem?.toxificationActive) count++;

  // Mega-pandemic (exogenous shock)
  if (state.crises?.megaPandemic?.active) count++;

  // Nuclear tensions
  const nuclearTensions = state.madDeterrence?.globalTensionLevel || 0;
  if (nuclearTensions > 0.7) count++;

  return count;
}

/**
 * Detect if simulation is at a critical juncture
 *
 * Critical junctures require ALL THREE conditions:
 * 1. Institutional flux: Institutions weakened (but not destroyed)
 * 2. Information ambiguity: Coordination problems, hidden preferences
 * 3. Balanced forces: Crisis exists but not overwhelming
 *
 * Research:
 * - Acemoglu & Robinson (2001): "Windows of opportunity" when institutions in flux
 * - Svolik (2012): Democratic breakdowns need both elite defection AND mass mobilization
 * - Kuran (1991): Hidden opposition can suddenly cascade when one person defects
 */
export function isAtCriticalJuncture(state: GameState): boolean {
  // 1. Institutional Flux (institutions unstable)
  // institutionStrength from governance quality (1.0 = strong, 0.0 = collapsed)
  const institutionStrength = state.government.governanceQuality?.institutionalCapacity || 0.5;
  const institutionalFlux = 1 - institutionStrength;

  // Threshold: >0.6 means institutions very weak but not destroyed
  // (Too strong = no flux, too weak = no capacity for change)
  const hasInstitutionalFlux = institutionalFlux > 0.6 && institutionStrength > 0.2;

  // 2. Information Ambiguity (coordination problems)
  // informationIntegrity from information warfare system (1.0 = truth, 0.0 = noise)
  const infoIntegrity = state.globalMetrics.informationIntegrity;

  // Threshold: <0.5 means high ambiguity (people can't coordinate, hidden preferences)
  const hasInformationAmbiguity = infoIntegrity < 0.5;

  // 3. Balanced Forces (crisis but recoverable)
  const activeCrises = countActiveCrises(state);
  const qol = state.globalMetrics.qualityOfLife;

  // Crisis exists (activeCrises > 0) but not overwhelming (< 3 crises, QoL not collapsed)
  // QoL range: 0.3-0.7 (not total collapse, not prosperity)
  const hasBalancedForces = activeCrises > 0 && activeCrises < 3 && qol > 0.3 && qol < 0.7;

  // All three conditions required
  const isJuncture = hasInstitutionalFlux && hasInformationAmbiguity && hasBalancedForces;

  return isJuncture;
}

/**
 * Calculate agency potential - probability that escape attempt succeeds
 *
 * Agency potential is HIGHER in:
 * - Democratic systems (Sen 1999: agency as capability)
 * - With latent opposition (Kuran 1991: preference falsification)
 * - With personal authority (Arkhipov case: single vote can matter)
 * - With coordination cascades (Leipzig 1989: one defection triggers cascade)
 * - With organized social movements (collective action)
 *
 * Returns: [0, 1] probability of successful escape
 */
export function calculateAgencyPotential(state: GameState, rng: () => number): number {
  // Not at critical juncture? No agency potential
  if (!isAtCriticalJuncture(state)) {
    return 0;
  }

  // Base agency from democratic institutions (Sen 1999)
  const democracyIndex = state.governance?.democracyIndex || 0.5;
  const infoIntegrity = state.globalMetrics.informationIntegrity;
  const institutionStrength = state.government.governanceQuality?.institutionalCapacity || 0.5;

  const baseAgency =
    democracyIndex * 0.4 + infoIntegrity * 0.3 + institutionStrength * 0.3;

  // Latent opposition (Kuran 1991 mechanism)
  // Higher when QoL is low (people are suffering but hiding dissent)
  const qol = state.globalMetrics.qualityOfLife;
  const latentOpposition = Math.max(0, 0.6 - qol);

  // Coordination cascade potential (Leipzig 1989)
  // Requires both latent opposition AND information ambiguity (hidden preferences)
  const coordinationCascade =
    latentOpposition > 0.3 && state.globalMetrics.informationIntegrity < 0.4
      ? 0.2
      : 0;

  // Personal authority (Arkhipov case: 5% probability)
  // Single individual in right place at right time
  const personalAuthority = rng() < 0.05 ? 0.3 : 0;

  // Social movement strength (organized opposition)
  const movementStrength = state.society.socialMovements?.strength || 0;

  // Total agency potential (capped at 1.0)
  const agencyPotential = Math.min(
    1.0,
    baseAgency +
      latentOpposition +
      coordinationCascade +
      personalAuthority +
      movementStrength * 0.2
  );

  return agencyPotential;
}

/**
 * Attempt to escape structural trajectory at critical juncture
 *
 * Four types of escapes:
 * 1. Prevent War: Avoid nuclear war or regional conflict
 * 2. Enable Cooperation: Achieve international coordination on climate/AI
 * 3. Recover from Crisis: Accelerate recovery from economic/social crisis
 * 4. Unlock Breakthrough: Trigger research breakthrough under adverse conditions
 *
 * Escape success probability = agencyPotential (calculated above)
 */
export function attemptEscape(
  state: GameState,
  rng: () => number,
  agencyPotential: number
): PhaseResult {
  const events: string[] = [];
  let stateChanges = 0;

  // Roll for escape attempt
  if (rng() > agencyPotential) {
    // Escape failed - structural forces dominate
    events.push(`  ⚠️  Critical juncture escape attempt FAILED (agency: ${(agencyPotential * 100).toFixed(1)}%)`);
    return { events, stateChanges };
  }

  // Escape succeeded! Determine type based on current conditions
  const nuclearTensions = state.madDeterrence?.globalTensionLevel || 0;
  const activeCrises = countActiveCrises(state);
  const qol = state.globalMetrics.qualityOfLife;
  const unlockedTech = state.breakthroughTech?.unlocked?.length || 0;

  let escapeType: 'prevent_war' | 'enable_cooperation' | 'recover_from_crisis' | 'unlock_breakthrough';

  // 1. Prevent War (if nuclear tensions high)
  if (nuclearTensions > 0.7) {
    escapeType = 'prevent_war';

    // Reduce nuclear tensions (Arkhipov-style intervention)
    if (state.madDeterrence) {
      state.madDeterrence.globalTensionLevel = Math.max(0.3, state.madDeterrence.globalTensionLevel * 0.6);
    }

    // Reduce bilateral tensions
    if (state.bilateralTensions) {
      state.bilateralTensions.forEach((tension) => {
        tension.tensionLevel = Math.max(0.2, tension.tensionLevel * 0.6);
      });
    }

    events.push(`  ✅ CRITICAL JUNCTURE ESCAPE: War prevented by individual/collective action`);
    events.push(`     Vasili Arkhipov moment: Single decision prevented nuclear catastrophe`);
    stateChanges++;
  }
  // 2. Enable Cooperation (if multiple crises but QoL not collapsed)
  else if (activeCrises >= 2 && qol > 0.4) {
    escapeType = 'enable_cooperation';

    // Montreal Protocol-style international cooperation
    // Boost research investment, improve institutional capacity
    state.government.alignmentResearchInvestment = Math.min(
      10,
      state.government.alignmentResearchInvestment + 2
    );

    if (state.government.governanceQuality) {
      state.government.governanceQuality.institutionalCapacity = Math.min(
        1.0,
        state.government.governanceQuality.institutionalCapacity + 0.2
      );
    }

    // Improve information integrity (truth wins out)
    state.globalMetrics.informationIntegrity = Math.min(
      1.0,
      state.globalMetrics.informationIntegrity + 0.15
    );

    events.push(`  ✅ CRITICAL JUNCTURE ESCAPE: International cooperation achieved`);
    events.push(`     Montreal Protocol moment: Collective action despite incentives`);
    stateChanges++;
  }
  // 3. Recover from Crisis (if QoL low but population surviving)
  else if (qol < 0.5 && state.humanPopulationSystem.population > state.initialPopulation! * 0.7) {
    escapeType = 'recover_from_crisis';

    // Leipzig 1989-style cascade: Hidden opposition becomes visible
    // Increase social cohesion, reduce meaning crisis
    if (state.socialAccumulation) {
      state.socialAccumulation.socialCohesion = Math.min(
        1.0,
        state.socialAccumulation.socialCohesion + 0.2
      );
      state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state.socialAccumulation.meaningCrisisLevel - 0.15
      );
    }

    // Improve QoL through renewed social solidarity
    state.globalMetrics.qualityOfLife = Math.min(
      2.0,
      state.globalMetrics.qualityOfLife + 0.3
    );

    events.push(`  ✅ CRITICAL JUNCTURE ESCAPE: Social recovery cascade`);
    events.push(`     Leipzig 1989 moment: Hidden preferences revealed, collective action emerged`);
    stateChanges++;
  }
  // 4. Unlock Breakthrough (if research stalled but institutions functional)
  else {
    escapeType = 'unlock_breakthrough';

    // Trigger research breakthrough under adverse conditions
    // Boost breakthrough multiplier (positive compounding)
    if (state.breakthroughMultiplier !== undefined) {
      state.breakthroughMultiplier = Math.min(2.0, state.breakthroughMultiplier + 0.3);
    }

    // Increase technological breakthrough rate
    state.globalMetrics.technologicalBreakthroughRate = Math.min(
      10,
      state.globalMetrics.technologicalBreakthroughRate + 1.5
    );

    events.push(`  ✅ CRITICAL JUNCTURE ESCAPE: Research breakthrough under duress`);
    events.push(`     Manhattan Project moment: Crisis mobilization unlocked innovation`);
    stateChanges++;
  }

  // Record escape in history
  if (!state.history.criticalJunctureEscapes) {
    state.history.criticalJunctureEscapes = [];
  }

  state.history.criticalJunctureEscapes.push({
    month: state.currentMonth,
    type: escapeType,
    agencyPotential,
    crisisSeverity: activeCrises / 10, // Normalize to [0, 1]
  });

  return { events, stateChanges };
}

/**
 * Critical Juncture Phase
 *
 * Executes once per month after crisis detection (order 29).
 * Detects critical junctures and attempts agency-based escapes.
 */
export class CriticalJuncturePhase implements SimulationPhase {
  id = 'critical_juncture_phase';
  name = 'Critical Juncture Agency';
  order = 29;

  execute(state: GameState, rng: () => number, context: PhaseContext): PhaseResult {
    const events: string[] = [];
    let stateChanges = 0;

    // Check if at critical juncture
    const atJuncture = isAtCriticalJuncture(state);

    if (!atJuncture) {
      // Not at critical juncture - structural forces dominate (90% of history)
      return { events: [], stateChanges: 0 };
    }

    // At critical juncture! Calculate agency potential
    const agencyPotential = calculateAgencyPotential(state, rng);

    events.push(`\n=== Critical Juncture Agency ===`);
    events.push(`  Critical juncture detected (10% window for agency)`);
    events.push(`  Agency potential: ${(agencyPotential * 100).toFixed(1)}%`);

    // Attempt escape
    const escapeResult = attemptEscape(state, rng, agencyPotential);
    events.push(...escapeResult.events);
    stateChanges += escapeResult.stateChanges;

    return { events, stateChanges };
  }
}
