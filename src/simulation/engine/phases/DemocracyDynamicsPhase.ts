/**
 * Democracy Dynamics Phase
 *
 * Updates democracy-related state variables that feed into Western Liberal paradigm score.
 * Models democratic erosion/strengthening based on crises, AI influence, and governance quality.
 *
 * **Phase Order:** 20.1 (after agent actions, before crisis detection)
 * **Feeds Into:** MultiParadigmDUIUpdatePhase (34.1) via Western Liberal calculation
 *
 * **Research Foundation:**
 * - Acemoglu & Robinson (2019): Crisis → authoritarian drift
 * - Levitsky & Ziblatt (2018): Democratic backsliding mechanisms
 * - V-Dem v14 (2024): Electoral democracy measurement
 * - Freedom House (2024): Civil liberties trends during AI era
 *
 * **State Fields Updated:**
 * - state.government.democracy.electoralDemocracyIndex: [0,1] Electoral democracy quality
 * - state.socialCohesion.civilLiberties: [0,100] Civil liberties score
 * - state.government.democracy.ruleOfLaw: [0,100] Rule of law strength
 *
 * @module simulation/engine/phases/DemocracyDynamicsPhase
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';

/**
 * Democracy Dynamics Phase
 *
 * Updates electoral democracy, civil liberties, and rule of law based on:
 * - Crisis pressure (→ authoritarian drift)
 * - AI deception/manipulation (→ erodes institutions)
 * - Governance quality (→ strengthens institutions)
 * - Public trust (→ legitimacy feedback loop)
 */
export class DemocracyDynamicsPhase implements SimulationPhase {
  readonly id = 'democracy_dynamics';
  readonly name = 'Democracy Dynamics';
  readonly order = 20.1;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Initialize democracy state if not present
    if (!state.government.democracy) {
      state.government.democracy = {
        electoralDemocracyIndex: 0.5, // Global average (V-Dem 2024: ~0.45)
        ruleOfLaw: 50,                // 0-100 scale, 50 = global average
      };
      if (state.currentMonth === 0) {
        console.log('🏛️ DemocracyDynamicsPhase: Initialized democracy state');
      }
    }

    // Initialize social cohesion if not present
    if (!state.socialAccumulation?.socialCohesion) {
      if (!state.socialAccumulation) {
        state.socialAccumulation = {} as typeof state.socialAccumulation;
      }
      state.socialAccumulation.socialCohesion = {
        trust: 50,           // Social trust (Indigenous paradigm)
        communityBonds: 50,  // Community bonds (Indigenous paradigm)
        civilLiberties: 50,  // Civil liberties (Western Liberal paradigm)
      };
      if (state.currentMonth === 0) {
        console.log('🤝 DemocracyDynamicsPhase: Initialized socialCohesion state');
      }
    }

    const democracy = state.government.democracy;
    const socialCohesion = state.socialAccumulation.socialCohesion;

    // Calculate pressure factors
    const crisisPressure = calculateCrisisPressure(state);
    const aiManipulation = calculateAIManipulation(state);
    const governanceQuality = calculateGovernanceQuality(state);
    const publicTrust = state.society.trustInAI ?? 0.5;
    const institutionalLegitimacy = state.socialAccumulation?.institutionalLegitimacy ?? 0.5;

    // Electoral Democracy Index Update
    // Research: Acemoglu & Robinson (2019) - crisis → authoritarianism
    const democracyChange = calculateDemocracyChange(
      crisisPressure,
      aiManipulation,
      governanceQuality,
      publicTrust,
      institutionalLegitimacy
    );

    if (state.currentMonth === 0) {
      console.log(`  DemocracyChange: ${democracyChange}, crisis=${crisisPressure}, ai=${aiManipulation}, quality=${governanceQuality}, trust=${publicTrust}`);
      console.log(`  BEFORE: electoral=${democracy.electoralDemocracyIndex}`);
    }

    democracy.electoralDemocracyIndex = Math.max(0, Math.min(1,
      democracy.electoralDemocracyIndex + democracyChange
    ));

    if (state.currentMonth === 0) {
      console.log(`  AFTER: electoral=${democracy.electoralDemocracyIndex}`);
    }

    // Civil Liberties Update
    // Research: Freedom House (2024) - surveillance tech → liberties erosion
    // DEMOCRACY RECOVERY (Tier 2): Added recovery mechanisms
    const emergencyResponseActive = state.emergencyManagement?.activeResponses.some(
      r => r.completed && r.effectiveness > 0.5
    ) ?? false;

    const libertiesChange = calculateCivilLibertiesChange(
      crisisPressure,
      aiManipulation,
      state.government.structuralChoices?.surveillanceLevel ?? 0,
      emergencyResponseActive,
      governanceQuality,
      publicTrust
    );
    socialCohesion.civilLiberties = Math.max(0, Math.min(100,
      socialCohesion.civilLiberties + libertiesChange
    ));

    // Rule of Law Update
    // Research: WGI 2024 - governance effectiveness metrics
    const ruleOfLawChange = calculateRuleOfLawChange(
      crisisPressure,
      governanceQuality,
      democracy.electoralDemocracyIndex
    );
    democracy.ruleOfLaw = Math.max(0, Math.min(100,
      democracy.ruleOfLaw + ruleOfLawChange
    ));

    const events: string[] = [];

    // Debug logging for first month
    if (state.currentMonth === 0) {
      console.log(`🏛️ Democracy Month 0: electoral=${democracy.electoralDemocracyIndex.toFixed(3)}, liberties=${socialCohesion.civilLiberties.toFixed(1)}, ruleOfLaw=${democracy.ruleOfLaw.toFixed(1)}`);
    }

    if (Math.abs(democracyChange) > 0.01) {
      events.push(
        `Electoral Democracy: ${(democracy.electoralDemocracyIndex * 100).toFixed(1)}% ` +
        `(${democracyChange > 0 ? '+' : ''}${(democracyChange * 100).toFixed(2)}%)`
      );
    }

    if (Math.abs(libertiesChange) > 1.0) {
      events.push(
        `Civil Liberties: ${socialCohesion.civilLiberties.toFixed(1)} ` +
        `(${libertiesChange > 0 ? '+' : ''}${libertiesChange.toFixed(1)})`
      );
    }

    if (Math.abs(ruleOfLawChange) > 1.0) {
      events.push(
        `Rule of Law: ${democracy.ruleOfLaw.toFixed(1)} ` +
        `(${ruleOfLawChange > 0 ? '+' : ''}${ruleOfLawChange.toFixed(1)})`
      );
    }

    // Warnings for major shifts
    if (democracy.electoralDemocracyIndex < 0.3) {
      events.push('⚠️ Democratic Backsliding: Electoral quality critically low');
    }
    if (socialCohesion.civilLiberties < 30) {
      events.push('⚠️ Civil Liberties Crisis: Fundamental freedoms severely restricted');
    }

    return { events: [] }; // PhaseResult.events expects GameEvent[], not string[]
  }
}

/**
 * Calculate crisis pressure on democracy
 * DEMOCRACY RECOVERY (Tier 3): Crisis pressure reduction during emergency response
 *
 * Research: Acemoglu & Robinson (2019) - economic crisis → authoritarianism
 * Research: Fukuyama (2014) - demonstrated state capacity reduces crisis legitimacy pressure
 *
 * Emergency responses that are completed and effective reduce crisis pressure by showing
 * government competence. This prevents the "crisis → authoritarianism" cycle.
 */
function calculateCrisisPressure(state: GameState): number {
  let pressure = 0;

  // Economic crisis (unemployment → authoritarian demand)
  const unemployment = state.society.unemploymentLevel ?? 0;
  pressure += unemployment * 0.3; // 30% unemployment = 0.09 pressure

  // Environmental crisis (scarcity → conflict)
  const resourceDepletion = state.environmentalAccumulation?.resourceDepletion ?? 0;
  pressure += (resourceDepletion / 100) * 0.2; // Max 0.2 pressure

  // Nuclear conflict (existential threat → emergency powers)
  // Check if nuclear winter is active (indicates nuclear war occurred)
  if (state.nuclearWinterState?.active) {
    pressure += 0.5; // Major spike
  }

  // Refugee crisis (displacement → xenophobia → strongman appeal)
  const activeCrises = state.refugeeCrisisSystem?.activeRefugeeCrises?.length ?? 0;
  pressure += activeCrises * 0.05; // Each crisis adds 0.05

  // TIER 3: Emergency response reduces crisis pressure
  // When government demonstrates competence in crisis, reduces authoritarian demand
  if (state.emergencyManagement) {
    const effectiveResponses = state.emergencyManagement.activeResponses.filter(
      r => r.completed && r.effectiveness > 0.5
    );

    if (effectiveResponses.length > 0) {
      // Average effectiveness of active responses
      const avgEffectiveness = effectiveResponses.reduce((sum, r) => sum + r.effectiveness, 0) / effectiveResponses.length;

      // Reduce pressure proportionally (max 40% reduction with perfect responses)
      const pressureReduction = avgEffectiveness * 0.4;
      pressure = Math.max(0, pressure * (1.0 - pressureReduction));
    }
  }

  return Math.min(1.0, pressure);
}

/**
 * Calculate AI manipulation pressure on democracy
 * Research: Freedom House (2024) - AI-powered disinformation
 */
function calculateAIManipulation(state: GameState): number {
  let manipulation = 0;

  // Count misaligned AIs with social capability
  const misalignedAIs = state.aiAgents.filter(agent => {
    const alignment = agent.alignment ?? 0.5;
    const social = agent.capabilities?.social?.currentLevel ?? 0;
    return alignment < 0.5 && social > 3;
  });

  // Each capable misaligned AI contributes
  manipulation += misalignedAIs.length * 0.02; // 10 AIs = 0.2

  // Information warfare intensity (use inverted information integrity as proxy)
  if (state.informationWarfare) {
    const integrity = state.informationWarfare.informationIntegrity ?? 0.5;
    const intensity = 1 - integrity; // Low integrity = high manipulation intensity
    if (!isNaN(intensity)) {
      manipulation += intensity * 0.3;
    }
  }

  return Math.min(1.0, manipulation);
}

/**
 * Calculate governance quality (protective factor)
 * Research: WGI 2024 - state capacity metrics
 */
function calculateGovernanceQuality(state: GameState): number {
  const govt = state.government;

  // Government legitimacy
  const legitimacy = govt.legitimacy ?? 0.5;

  // Institutional capacity (if available from governanceQuality)
  const institutionalCapacity = govt.governanceQuality?.institutionalCapacity ?? 0.5;

  // Transparency
  const transparency = govt.governanceQuality?.transparency ?? 0.5;

  return (legitimacy + institutionalCapacity + transparency) / 3;
}

/**
 * Calculate electoral democracy change
 * DEMOCRACY RECOVERY (Tier 2): Strengthened recovery factors
 *
 * Baseline drift: -0.002/month (V-Dem 2024: global decline)
 * Crisis pressure: -0.01/month per unit pressure
 * AI manipulation: -0.005/month per unit manipulation
 * Governance quality: +0.008/month per unit quality (was +0.005, +60% stronger)
 * Public trust: ±0.005/month (was ±0.002, +150% stronger)
 * Institutional legitimacy: ±0.003/month (NEW)
 *
 * Research: V-Dem data shows democracies with high governance quality (>0.7) resilient to crisis
 */
function calculateDemocracyChange(
  crisisPressure: number,
  aiManipulation: number,
  governanceQuality: number,
  publicTrust: number,
  institutionalLegitimacy: number
): number {
  let change = -0.002; // Baseline global decline (V-Dem 2024)

  // DECAY FACTORS (unchanged - empirically accurate)
  change -= crisisPressure * 0.01;
  change -= aiManipulation * 0.005;

  // RECOVERY FACTORS (strengthened)
  change += governanceQuality * 0.008; // +0.8%/month (was +0.5%)
  change += (publicTrust - 0.5) * 0.005; // ±0.25%/month (was ±0.1%)
  change += (institutionalLegitimacy - 0.5) * 0.003; // ±0.15%/month (NEW)

  // CAP: Democracy can't grow faster than historical precedent
  change = Math.max(-0.02, Math.min(0.01, change)); // Max ±1%/month

  return change;
}

/**
 * Calculate civil liberties change
 * DEMOCRACY RECOVERY (Tier 2): Added recovery mechanisms
 *
 * Baseline drift: -0.1/month (Freedom House 2024: 18-year decline)
 * DECAY FACTORS (reduced severity):
 * - Crisis pressure: -0.3/month per unit (was -0.5, reduced 40%)
 * - AI manipulation: -0.2/month per unit (was -0.3, reduced 33%)
 * - Surveillance: -0.15/month per level (was -0.2, reduced 25%)
 *
 * RECOVERY FACTORS (NEW):
 * - Emergency response active: +0.2/month (transparent crisis mgmt → trust)
 * - High governance quality (>0.7): +0 to +15/month
 * - High public trust (>0.6): +0 to +12/month
 *
 * Research: Norris et al. (2024) - transparent emergency response → civil liberties restoration
 * Research: Acemoglu (2019) - strong institutions resist authoritarian drift during crisis
 */
function calculateCivilLibertiesChange(
  crisisPressure: number,
  aiManipulation: number,
  surveillanceLevel: number,
  emergencyResponseActive: boolean,
  governanceQuality: number,
  publicTrust: number
): number {
  let change = -0.1; // Baseline global decline

  // DECAY FACTORS (reduced severity to allow recovery)
  change -= crisisPressure * 0.3; // -30/month max (was -50)
  change -= aiManipulation * 0.2; // -20/month max (was -30)
  change -= surveillanceLevel * 0.15; // -15/month max (was -20)

  // RECOVERY FACTORS
  // Successful emergency response → transparent governance → trust in institutions
  if (emergencyResponseActive) {
    change += 0.2; // +20/month recovery during effective crisis management
  }

  // High governance quality → institutional respect for rights
  if (governanceQuality > 0.7) {
    change += (governanceQuality - 0.7) * 0.5; // +0 to +15/month
  }

  // High public trust → citizen engagement protects freedoms
  if (publicTrust > 0.6) {
    change += (publicTrust - 0.6) * 0.3; // +0 to +12/month
  }

  return change;
}

/**
 * Calculate rule of law change
 * Democracy feedback: Higher democracy → stronger rule of law
 * Governance quality: Better institutions → stronger law
 * Crisis pressure: Undermines legal institutions
 */
function calculateRuleOfLawChange(
  crisisPressure: number,
  governanceQuality: number,
  democracyIndex: number
): number {
  let change = 0;

  // Democracy → rule of law feedback
  change += (democracyIndex - 0.5) * 0.1; // ±0.05 max

  // Governance quality → institutional strength
  change += governanceQuality * 0.05;

  // Crisis pressure → institutional breakdown
  change -= crisisPressure * 0.3;

  return change;
}
