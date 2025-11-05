import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
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
  if (state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity?.status === 'high_risk') count++;
  if (state.planetaryBoundariesSystem?.boundaries?.biogeochemical_flows?.status === 'high_risk') count++;
  if (state.planetaryBoundariesSystem?.boundaries?.land_system_change?.status === 'high_risk') count++;

  // Specific system crises
  const phosphorusCrisis = state.phosphorusSystem?.supplyShockActive || state.phosphorusSystem?.criticalDepletionActive;
  if (phosphorusCrisis) count++;
  if (state.freshwaterSystem?.dayZeroDrought?.active) count++;
  if (state.oceanAcidificationSystem?.marineFoodWebCollapseActive) count++;
  const novelEntitiesCrisis = state.novelEntitiesSystem?.reproductiveCrisisActive || state.novelEntitiesSystem?.chronicDiseaseEpidemicActive;
  if (novelEntitiesCrisis) count++;

  // Mega-pandemic (exogenous shock)
  if (state.crises?.megaPandemic?.active) count++;

  // Nuclear tensions (use inverse of crisis stability as tension proxy)
  // KEEP LEGITIMATE DEFAULT - madDeterrence may not be initialized yet
  const nuclearTensions = state.madDeterrence ? (1 - state.madDeterrence.crisisStability) : 0;
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
  // KEEP LEGITIMATE DEFAULT - governanceQuality may not be initialized yet
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
  const democracyIndex = state.government.governmentType === 'democratic' ? 0.8 :
                         state.government.governmentType === 'technocratic' ? 0.5 : 0.2;
  const infoIntegrity = state.globalMetrics.informationIntegrity;
  // KEEP LEGITIMATE DEFAULT - governanceQuality may not be initialized yet
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
  // KEEP LEGITIMATE DEFAULT - socialMovements may not be initialized yet
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
  const events: GameEvent[] = [];
  let stateChanges = 0;

  // Roll for escape attempt
  if (rng() > agencyPotential) {
    // Escape failed - structural forces dominate
    events.push({
      id: `critical_juncture_failed_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'info',
      severity: 'info',
      agent: 'system',
      title: 'Critical Juncture Escape Failed',
      description: `Critical juncture escape attempt FAILED (agency: ${(agencyPotential * 100).toFixed(1)}%)`,
      effects: {}
    });
    return { events, metadata: { stateChanges } };
  }

  // Escape succeeded! Determine type based on current conditions
  // KEEP LEGITIMATE DEFAULTS - systems may not be initialized yet
  const nuclearTensions = state.madDeterrence ? (1 - state.madDeterrence.crisisStability) : 0;
  const activeCrises = countActiveCrises(state);
  const qol = state.globalMetrics.qualityOfLife;
  // Count deployed breakthrough technologies
  const unlockedTech = state.technologyTree ? state.technologyTree.filter(tech => tech.completed).length : 0;

  let escapeType: 'prevent_war' | 'enable_cooperation' | 'recover_from_crisis' | 'unlock_breakthrough';

  // 1. Prevent War (if nuclear tensions high)
  if (nuclearTensions > 0.7) {
    escapeType = 'prevent_war';

    // Reduce nuclear tensions by improving crisis stability (Arkhipov-style intervention)
    if (state.madDeterrence) {
      state.madDeterrence.crisisStability = Math.min(0.9, state.madDeterrence.crisisStability + 0.3);
    }

    // Reduce bilateral tensions
    if (state.bilateralTensions) {
      state.bilateralTensions.forEach((tension) => {
        tension.tensionLevel = Math.max(0.2, tension.tensionLevel * 0.6);
      });
    }

    events.push({
      id: `critical_juncture_war_prevented_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'positive-milestone',
      severity: 'transformative',
      agent: 'society',
      title: 'Critical Juncture: War Prevented',
      description: 'Vasili Arkhipov moment: Individual/collective action prevented nuclear catastrophe',
      effects: { warPrevented: true, crisisStability: state.madDeterrence?.crisisStability ?? 0 }
    });
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

    events.push({
      id: `critical_juncture_cooperation_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'positive-milestone',
      severity: 'transformative',
      agent: 'government',
      title: 'Critical Juncture: International Cooperation',
      description: 'Montreal Protocol moment: Collective action achieved despite incentives',
      effects: { cooperationEnabled: true, researchInvestment: state.government.alignmentResearchInvestment }
    });
    stateChanges++;
  }
  // 3. Recover from Crisis (if QoL low but population surviving)
  else if (qol < 0.5 && state.humanPopulationSystem.population > state.initialPopulation! * 0.7) {
    escapeType = 'recover_from_crisis';

    // Leipzig 1989-style cascade: Hidden opposition becomes visible
    // Increase social cohesion components, reduce meaning crisis
    if (state.socialAccumulation) {
      // Boost all three social cohesion components (popular uprising builds solidarity)
      state.socialAccumulation.socialCohesion.trust = Math.min(
        100,
        state.socialAccumulation.socialCohesion.trust + 20
      );
      state.socialAccumulation.socialCohesion.communityBonds = Math.min(
        100,
        state.socialAccumulation.socialCohesion.communityBonds + 20
      );
      state.socialAccumulation.socialCohesion.civilLiberties = Math.min(
        100,
        state.socialAccumulation.socialCohesion.civilLiberties + 20
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

    events.push({
      id: `critical_juncture_recovery_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'positive-milestone',
      severity: 'transformative',
      agent: 'society',
      title: 'Critical Juncture: Social Recovery',
      description: 'Leipzig 1989 moment: Hidden preferences revealed, collective action emerged',
      effects: { socialRecovery: true, qol: state.globalMetrics.qualityOfLife }
    });
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

    events.push({
      id: `critical_juncture_breakthrough_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'positive-milestone',
      severity: 'transformative',
      agent: 'government',
      title: 'Critical Juncture: Research Breakthrough',
      description: 'Manhattan Project moment: Crisis mobilization unlocked innovation',
      effects: { breakthroughUnlocked: true, breakthroughRate: state.globalMetrics.technologicalBreakthroughRate }
    });
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

  return { events, metadata: { stateChanges } };
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
    const events: GameEvent[] = [];
    setDeterministicRng(rng);
    let stateChanges = 0;

    // Check if at critical juncture
    const atJuncture = isAtCriticalJuncture(state);

    if (!atJuncture) {
      // Not at critical juncture - structural forces dominate (90% of history)
      return { events: [], metadata: { stateChanges: 0 } };
    }

    // At critical juncture! Calculate agency potential
    const agencyPotential = calculateAgencyPotential(state, rng);

    events.push({
      id: `critical_juncture_detected_${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'info',
      severity: 'info',
      agent: 'system',
      title: 'Critical Juncture Detected',
      description: `Critical juncture detected (10% window for agency). Agency potential: ${(agencyPotential * 100).toFixed(1)}%`,
      effects: { agencyPotential }
    });

    // Attempt escape
    const escapeResult = attemptEscape(state, rng, agencyPotential);
    events.push(...escapeResult.events);
    stateChanges += escapeResult.metadata?.stateChanges ?? 0;

    return { events, metadata: { stateChanges } };
  }
}
