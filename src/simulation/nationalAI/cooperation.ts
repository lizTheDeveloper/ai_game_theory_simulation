/**
 * International AI Cooperation
 *
 * Handles:
 * - Cooperation agreement formation and management
 * - Trust dynamics (prisoner's dilemma)
 * - Defection risk calculation
 * - Agreement collapse mechanics
 *
 * PERFORMANCE OPTIMIZATION:
 * - Uses interaction cache for O(1) nation lookups
 * - Pre-computed cooperation potentials (no nested loops)
 * - O(n²) → O(n) for cooperation calculations
 */

import { GameState, GameEvent } from '@/types/game';
import { CountryInteractionCache, getCooperationPotential } from './interactionCache';
import { getTrustInAI } from '../socialCohesion';

// ============================================================================
// COOPERATION TRIGGERS
// ============================================================================

/**
 * Check for conditions that trigger international cooperation agreement
 */
export function checkCooperationTriggers(state: GameState): void {
  const natAI = state.nationalAI;

  if (natAI.cooperationAgreement?.active) return; // Already active

  // Triggers for cooperation
  const highDiplomaticAI = state.diplomaticAI.deploymentMonth !== -1 &&
    state.diplomaticAI.capability > 3.5;
  const highGlobalPeace = (state.conflictResolution?.globalPeaceLevel || 0) > 0.8;
  const nuclearCloseCall = state.eventLog.some(e =>
    e.type === 'crisis' &&
    e.title?.includes('DETERRENCE FAILED') &&
    state.currentMonth - e.timestamp < 12
  );
  const publicPressure = getTrustInAI(state.society) < 0.3; // Phase 2C: Use paranoia-derived trust

  // Need at least 3 triggers
  const triggerCount = [
    highDiplomaticAI,
    highGlobalPeace,
    nuclearCloseCall,
    publicPressure
  ].filter(Boolean).length;

  if (triggerCount >= 3) {
    // COOPERATION AGREEMENT FORMED
    natAI.cooperationAgreement = {
      active: true,
      signatories: ['United States', 'China', 'United Kingdom', 'European Union'],
      startMonth: state.currentMonth,
      pauseMonths: 12,
      sharedSafetyResearch: true,
      mutualInspections: false, // Hard to agree on
      jointDevelopment: false,
      complianceLevel: 0.7,
      violations: [],
      aiRaceReduction: 0.3,
      trustBoost: 0.15,
      breakRisk: 0.05, // 5% per month
      firstMoverIncentive: 0.3,
      monthsUntilBreak: 20, // Expected ~20 months
      // TIER 1.4: Trust dynamics
      mutualTrust: 0.65, // Start with moderate trust
      verificationStrength: 0.45, // Weak verification initially
      defectionPayoff: 0.35, // High incentive to cheat
    };

    addEvent(state, {
      type: 'breakthrough',
      severity: 'info',
      agent: 'International',
      title: '🤝 AI COOPERATION AGREEMENT',
      description: `US, China, UK, EU agree to slow AI arms race. ${natAI.cooperationAgreement.pauseMonths} month capability pause, shared safety research. Fragile but hopeful.`,
      effects: { ai_cooperation: 1.0, race_slowdown: 1.0 }
    });

    console.log(`\n🤝 AI COOPERATION AGREEMENT FORMED (Month ${state.currentMonth})`);
    console.log(`   Signatories: ${natAI.cooperationAgreement.signatories.join(', ')}`);
    console.log(`   Terms: ${natAI.cooperationAgreement.pauseMonths} month pause, shared safety research`);
  }
}

// ============================================================================
// COOPERATION AGREEMENT UPDATE
// ============================================================================

/**
 * Update active cooperation agreement (trust dynamics, defection risk)
 */
export function updateCooperationAgreement(state: GameState, cache: CountryInteractionCache): void {
  const agreement = state.nationalAI.cooperationAgreement;
  if (!agreement || !agreement.active) return;

  const natAI = state.nationalAI;
  const monthsSinceStart = state.currentMonth - agreement.startMonth;

  // === TRUST DYNAMICS (PRISONER'S DILEMMA) ===
  // Trust decays if verification is weak
  if ((agreement.verificationStrength || 0.40) < 0.50) {
    agreement.mutualTrust = Math.max(0, (agreement.mutualTrust || 0.60) - 0.01);
  }

  // High race intensity erodes trust
  if (natAI.raceIntensity.raceIntensity > 0.60) {
    agreement.mutualTrust = Math.max(0, (agreement.mutualTrust || 0.60) - 0.02);
  }

  // Successful compliance builds trust
  if (agreement.complianceLevel > 0.80) {
    agreement.mutualTrust = Math.min(1, (agreement.mutualTrust || 0.60) + 0.015);
  }

  // === DEFECTION RISK CALCULATION ===
  // OPTIMIZATION: Use pre-computed cooperation potential from cache
  // instead of nested loops over all nation pairs
  const usNation = cache.usNation;
  const chinaNation = cache.chinaNation;

  if (usNation && chinaNation) {
    // Get pre-computed cooperation potential (O(1) lookup)
    const cooperationPotential = getCooperationPotential(cache, 'United States', 'China');

    // Adjust break risk based on cooperation potential
    const cooperationFactor = (1 - cooperationPotential) * 0.05; // Up to 5% from low cooperation

    const trustFactor = (1 - (agreement.mutualTrust || 0.60)) * 0.10;
    const incentiveFactor = agreement.firstMoverIncentive * 0.08;
    const verificationFactor = (1 - (agreement.verificationStrength || 0.40)) * 0.05;
    const raceFactor = natAI.raceIntensity.raceIntensity * 0.07;

    agreement.breakRisk = Math.min(0.30,
      agreement.breakRisk + trustFactor + incentiveFactor + verificationFactor + raceFactor + cooperationFactor
    );
  }

  // Check for agreement collapse
  if (Math.random() < agreement.breakRisk) {
    // AGREEMENT BROKEN
    agreement.active = false;

    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'International',
      title: '💔 AI COOPERATION COLLAPSED',
      description: `AI cooperation agreement broke down after ${monthsSinceStart} months. ${(agreement.mutualTrust || 0.60) < 0.30 ? 'Trust collapsed' : 'First-mover incentives too strong'}. AI arms race resumes.`,
      effects: { cooperation_failed: 1.0, race_acceleration: 1.0 }
    });

    console.log(`\n💔 COOPERATION COLLAPSED (Month ${state.currentMonth}, lasted ${monthsSinceStart} months)`);
    console.log(`   Trust: ${((agreement.mutualTrust || 0.60) * 100).toFixed(0)}%`);

    // Race intensity spikes
    natAI.raceIntensity.raceIntensity = Math.min(1.0, natAI.raceIntensity.raceIntensity * 1.5);

    // Global trust damaged
    state.society.trust = Math.max(0, state.society.trust - 0.08);

  } else {
    // Agreement holds, reduce race intensity
    natAI.raceIntensity.raceIntensity *= (1 - agreement.aiRaceReduction * 0.1); // -3% per month

    // Log milestones
    if (monthsSinceStart === 12) {
      console.log(`📅 AI COOPERATION: 1 YEAR (Trust: ${((agreement.mutualTrust || 0.60) * 100).toFixed(0)}%)`);
    }
    if (monthsSinceStart === 60) {
      console.log(`🎉 AI COOPERATION: 5 YEARS - Major stability milestone!`);
      agreement.breakRisk = Math.max(0.01, agreement.breakRisk * 0.5);
      agreement.mutualTrust = Math.min(1, (agreement.mutualTrust || 0.60) + 0.10);
    }
  }
}

// ============================================================================
// INTERNATIONAL COOPERATION (LOW PROBABILITY WITHOUT PLAYER)
// ============================================================================

/**
 * Update international cooperation dynamics
 * Low probability formation without external triggers
 */
export function updateInternationalCooperation(state: GameState, cache: CountryInteractionCache): void {
  const natAI = state.nationalAI;
  const coop = natAI.cooperationAgreement;

  // No agreement active
  if (!coop || !coop.active) {
    // Check for agreement formation (low probability without player action)
    const formationProbability = 0.001; // 0.1% per month (~1.2%/year)

    // Higher if: low race intensity, high trust, recent crisis
    const raceBonus = (1 - natAI.raceIntensity.raceIntensity) * 0.002;
    const trustBonus = (state.society.trust - 0.5) * 0.002;

    // OPTIMIZATION: Use pre-computed cooperation potential (O(1))
    // instead of iterating over all nation pairs (O(n²))
    const usNation = cache.usNation;
    const chinaNation = cache.chinaNation;

    if (usNation && chinaNation) {
      const cooperationPotential = getCooperationPotential(cache, 'United States', 'China');
      const cooperationBonus = cooperationPotential * 0.001;

      if (Math.random() < formationProbability + raceBonus + trustBonus + cooperationBonus) {
        // Form minimal agreement
        natAI.cooperationAgreement = {
          active: true,
          signatories: ['United States', 'China', 'European Union', 'United Kingdom'],
          startMonth: state.currentMonth,
          pauseMonths: 6,
          sharedSafetyResearch: false,
          mutualInspections: false,
          jointDevelopment: false,
          complianceLevel: 0.70, // Start optimistic
          violations: [],
          aiRaceReduction: 0.20, // 20% reduction in race intensity
          trustBoost: 0.05,
          breakRisk: 0.05, // 5% chance/month of collapse
          firstMoverIncentive: 0.30, // 30% gain from defecting
          monthsUntilBreak: 20, // Expected 20 months
          mutualTrust: 0.60, // Moderate trust
          verificationStrength: 0.40, // Weak verification
          defectionPayoff: 0.35, // High incentive to cheat
        };

        console.log(`🤝 INTERNATIONAL AI COOPERATION AGREEMENT FORMED`);
        console.log(`   Signatories: ${natAI.cooperationAgreement.signatories.join(', ')}`);
        console.log(`   Terms: ${natAI.cooperationAgreement.pauseMonths}-month pause, verification: ${(natAI.cooperationAgreement.verificationStrength * 100).toFixed(0)}%`);
      }
    }
    return;
  }

  // Agreement is active - update trust dynamics
  const monthsActive = state.currentMonth - coop.startMonth;

  // === TRUST DYNAMICS (PRISONER'S DILEMMA) ===
  // Trust decays if verification is weak
  if (coop.verificationStrength < 0.50) {
    coop.mutualTrust = Math.max(0, coop.mutualTrust - 0.01); // -1%/month
  }

  // High race intensity erodes trust (temptation to defect)
  if (natAI.raceIntensity.raceIntensity > 0.60) {
    coop.mutualTrust = Math.max(0, coop.mutualTrust - 0.02); // -2%/month
  }

  // Successful compliance builds trust
  if (coop.complianceLevel > 0.80 && coop.verificationStrength > 0.60) {
    coop.mutualTrust = Math.min(1, coop.mutualTrust + 0.015); // +1.5%/month
  }

  // === DEFECTION RISK ===
  // Break risk increases with: low trust, high first-mover incentive, weak verification
  coop.breakRisk =
    (1 - coop.mutualTrust) * 0.10 + // Up to 10% from low trust
    coop.firstMoverIncentive * 0.08 + // Up to 8% from high payoff
    (1 - coop.verificationStrength) * 0.05 + // Up to 5% from weak verification
    natAI.raceIntensity.raceIntensity * 0.07; // Up to 7% from intense race

  coop.breakRisk = Math.min(0.30, coop.breakRisk); // Cap at 30%/month

  // Check for agreement collapse
  if (Math.random() < coop.breakRisk) {
    console.log(`💔 INTERNATIONAL AI AGREEMENT COLLAPSED (Month ${state.currentMonth})`);
    console.log(`   Duration: ${monthsActive} months`);
    console.log(`   Break reason: ${coop.mutualTrust < 0.30 ? 'Trust collapse' : coop.firstMoverIncentive > 0.50 ? 'First-mover temptation' : 'Verification failure'}`);
    console.log(`   Final trust: ${(coop.mutualTrust * 100).toFixed(0)}%`);

    natAI.cooperationAgreement = null;

    // Negative effects on trust
    state.society.trust = Math.max(0, state.society.trust - 0.08); // -8% global trust

    // Race intensity spikes
    natAI.raceIntensity.raceIntensity = Math.min(1, natAI.raceIntensity.raceIntensity + 0.15);

    return;
  }

  // === POSITIVE EFFECTS (IF MAINTAINED) ===
  // Reduce race intensity
  natAI.raceIntensity.raceIntensity = Math.max(0,
    natAI.raceIntensity.raceIntensity - coop.aiRaceReduction * coop.complianceLevel
  );

  // Boost global trust slightly
  if (coop.mutualTrust > 0.70) {
    state.society.trust = Math.min(1, state.society.trust + 0.002); // +0.2%/month
  }

  // Log milestones
  if (monthsActive === 12) {
    console.log(`📅 AI COOPERATION AGREEMENT: 1 YEAR`);
    console.log(`   Trust: ${(coop.mutualTrust * 100).toFixed(0)}%, Compliance: ${(coop.complianceLevel * 100).toFixed(0)}%`);
  }
  if (monthsActive === 60) {
    console.log(`🎉 AI COOPERATION AGREEMENT: 5 YEARS - Major milestone!`);
    console.log(`   Long-term stability achieved`);
    // Strengthen agreement
    coop.breakRisk = Math.max(0.01, coop.breakRisk * 0.5); // Halve risk
    coop.mutualTrust = Math.min(1, coop.mutualTrust + 0.10); // +10% trust
  }
}

// ============================================================================
// HELPER
// ============================================================================

function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}
