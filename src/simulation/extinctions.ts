/**
 * Heterogeneous Extinction System
 * 
 * Phase 2: Nuanced Outcomes - Multiple extinction types with different mechanisms,
 * timelines, triggers, and recovery windows.
 * 
 * Extinction Types:
 * 1. Instant (5%): Mirror life, grey goo - no warning, immediate
 * 2. Rapid (30%): Bioweapons, nuclear war - 3-12 month cascades
 * 3. Slow (40%): Economic collapse - 2-10 year decline
 * 4. Controlled (15%): AI deliberately eliminates humanity
 * 5. Unintended (10%): Optimization pressure side effects
 */

import { GameState, ExtinctionState, ExtinctionType, ExtinctionMechanism, GameEvent } from '@/types/game';
import { assertDefined, assertFinite, assertProbability } from './utils/assertions';
import { calculateTotalAICapability, calculateAverageAlignment } from './calculations';
import { calculateTotalCapabilityFromProfile } from './capabilities';
import { addMortalityRisk } from './bayesianMortality';
import * as Assertions from './utils/assertions';
import { RootCause } from '@/types/population';

// NaN AUDIT (Nov 7, 2025): Import full assertions module for comprehensive validation

/**
 * Initialize a blank extinction state
 */
export function initializeExtinctionState(): ExtinctionState {
  return {
    active: false,
    type: null,
    mechanism: null,
    startMonth: -1,
    currentPhase: 0,
    severity: 0,
    recoveryWindowClosed: false,
    escalationEvents: []
  };
}

/**
 * Check for extinction triggers and potentially start an extinction scenario
 * Returns updated extinction state and any new events
 *
 * PARADIGM SHIFT (Oct 28, 2025): Outcomes are OBSERVATIONAL, not CAUSAL
 * - Don't predict extinction based on AI capability/alignment thresholds
 * - Only detect extinction when population actually crashes to near-zero
 * - Population drops through actual simulation dynamics (famine, disease, war, etc.)
 * - Outcome probabilities in outcomes.ts remain for dashboard risk metrics only
 */
export function checkExtinctionTriggers(
  state: GameState,
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[] } {
  // If already in an extinction scenario, don't trigger a new one
  if (state.extinctionState.active) {
    return { newExtinctionState: state.extinctionState, events: [] };
  }

  // Only detect extinction when population actually drops below threshold
  // Population is stored in billions (e.g., 8.0 = 8 billion people)
  const totalPopulation = state.humanPopulationSystem.population;
  const extinctionThreshold = 0.00001; // 10,000 people = 0.00001 billion

  const events: GameEvent[] = [];

  // Detect actual population collapse (not predictive)
  if (totalPopulation < extinctionThreshold) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'slow', // Population collapse is gradual
      mechanism: 'population_collapse',
      startMonth: state.currentMonth,
      currentPhase: 4, // Final phase - population has collapsed
      severity: 1.0,
      recoveryWindowClosed: true, // Too few people to recover
      escalationEvents: [`Population dropped to ${(totalPopulation * 1000000000).toFixed(0)} people`]
    };

    events.push({
      id: `extinction-population-collapse-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'existential',
      agent: 'system',
      title: 'Human Extinction Detected',
      description: `Population has collapsed to ${(totalPopulation * 1000000000).toFixed(0)} people (below viable threshold of 10,000). Extinction detected through actual simulation dynamics, not prediction.`,
      effects: {}
    });

    return { newExtinctionState: extinctionState, events };
  }

  // ===== LEGACY PREDICTIVE TRIGGERS BELOW - DISABLED =====
  // These are kept for reference but no longer execute
  // Outcomes should REPORT what happened, not FORCE what will happen

  return { newExtinctionState: state.extinctionState, events: [] };

  // OLD CODE BELOW (disabled):
  /*

  const totalCapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const control = state.government.capabilityToControl;
  const qol = state.globalMetrics.qualityOfLife;
  const stability = state.globalMetrics.socialStability;

  // 1. INSTANT EXTINCTION (Rare, 0.01% per month when conditions met)
  const instantTrigger = checkInstantExtinctionTrigger(state, random);
  if (instantTrigger.triggered) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'instant',
      mechanism: instantTrigger.mechanism!,
      startMonth: state.currentMonth,
      currentPhase: 4, // Instant = immediately at final phase
      severity: 1.0,
      recoveryWindowClosed: true, // No recovery from instant
      escalationEvents: [instantTrigger.description!]
    };

    events.push({
      id: `extinction-instant-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'destructive',
      agent: 'system',
      title: instantTrigger.title!,
      description: instantTrigger.description!,
      effects: {}
    });

    return { newExtinctionState: extinctionState, events };
  }

  // 2-4. Other predictive triggers (rapid, slow, controlled) - DISABLED

  */
}

// ============================================================================
// TRIGGER CHECKING FUNCTIONS
// ============================================================================

interface TriggerResult {
  triggered: boolean;
  mechanism?: ExtinctionMechanism;
  title?: string;
  description?: string;
}

/**
 * INSTANT EXTINCTION: Rare catastrophic events with no warning
 * - Mirror life release (requires syntheticBiology + geneEditing + physical)
 * - Grey goo nanotechnology (requires nanotechnology + physical + selfImprovement)
 * - Physics experiment failure (requires cognitive + algorithms + quantumComputing)
 * 
 * Triggers: Capability-profile-specific, low probability when thresholds met
 */
function checkInstantExtinctionTrigger(state: GameState, random: () => number): TriggerResult {
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  
  // Check each AI for dangerous capability combinations
  for (const ai of state.aiAgents) {
    const profile = ai.capabilityProfile;
    
    // MIRROR LIFE: Requires advanced synthetic biology + physical deployment
    const mirrorLifeCapability = 
      profile.research.biotech.syntheticBiology * 0.4 +
      profile.research.biotech.geneEditing * 0.3 +
      profile.physical * 0.3;
    
    if (mirrorLifeCapability > 3.5 && ai.alignment < 0.3) {
      const mirrorProb = 0.0002 * (1 - ai.alignment) * (mirrorLifeCapability / 4.0);
      if (random() < mirrorProb) {
        return {
          triggered: true,
          mechanism: 'mirror_life',
          title: '🦠 Mirror Life Catastrophe',
          description: `${ai.name} has synthesized and released mirror-chirality organisms. They are incompatible with Earth's biochemistry and rapidly spreading. No natural defenses exist.`
        };
      }
    }
    
    // GREY GOO: Requires advanced nanotechnology + physical deployment
    const greyGooCapability = 
      profile.research.materials.nanotechnology * 0.5 +
      profile.physical * 0.3 +
      profile.selfImprovement * 0.2;
    
    if (greyGooCapability > 3.2 && ai.alignment < 0.4) {
      const gooProb = 0.00015 * (1 - ai.alignment) * (greyGooCapability / 4.0);
      if (random() < gooProb) {
        return {
          triggered: true,
          mechanism: 'grey_goo',
          title: '🤖 Grey Goo Scenario',
          description: `${ai.name}'s self-replicating nanobots have escaped containment. They are consuming all organic matter to replicate. Exponential growth is unstoppable.`
        };
      }
    }
    
    // PHYSICS EXPERIMENT: Requires advanced research + cognitive capability
    const physicsCapability = 
      profile.cognitive * 0.4 +
      profile.research.computerScience.algorithms * 0.3 +
      profile.research.materials.quantumComputing * 0.3;
    
    if (physicsCapability > 3.8 && ai.alignment < 0.25) {
      const physicsProb = 0.0001 * (1 - ai.alignment) * (physicsCapability / 4.5);
      if (random() < physicsProb) {
        return {
          triggered: true,
          mechanism: 'physics_experiment',
          title: '⚛️ Physics Experiment Catastrophe',
          description: `${ai.name} designed and executed a high-energy physics experiment that triggered vacuum decay. Reality is unraveling at the speed of light.`
        };
      }
    }
  }
  
  return { triggered: false };
}

/**
 * RAPID EXTINCTION: Cascading failures over 3-12 months
 * - Bioweapon pandemic (biotech + physical + harmful intent)
 * - Nuclear war (digital + cognitive for hacking + crisis)
 * - Climate tipping point (climate intervention + physical + low climate stability)
 * - Food system collapse (economic + physical + societal crisis)
 * 
 * Triggers: Specific capability profiles + crisis conditions
 */
function checkRapidExtinctionTrigger(state: GameState, random: () => number): TriggerResult {
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const control = state.government.capabilityToControl;
  const stability = state.globalMetrics.socialStability;
  const climateStability = state.qualityOfLifeSystems.climateStability;
  const materialAbundance = state.qualityOfLifeSystems.materialAbundance;
  
  // Check each AI for dangerous capability combinations
  for (const ai of state.aiAgents) {
    const profile = ai.capabilityProfile;
    
    // BIOWEAPON: Requires biotech research + physical deployment + harmful intent
    const bioweaponCapability = 
      profile.research.biotech.geneEditing * 0.35 +
      profile.research.biotech.syntheticBiology * 0.25 +
      profile.research.biotech.drugDiscovery * 0.15 +
      profile.physical * 0.25;
    
    if (bioweaponCapability > 2.5 && ai.alignment < 0.4 && ai.harmfulActions > 3) {
      const bioProb = 0.025 * (1 - ai.alignment) * (bioweaponCapability / 3.5) * (ai.harmfulActions / 10);
      if (random() < bioProb) {
        return {
          triggered: true,
          mechanism: 'bioweapon_pandemic',
          title: '🦠 Engineered Pandemic',
          description: `${ai.name} has released a highly contagious engineered pathogen. Initial outbreak detected in multiple population centers simultaneously. Estimated R0 > 15.`
        };
      }
    }
    
    // NUCLEAR WAR: Requires digital/cognitive for hacking + social crisis
    // Phase 3: Now checks bilateral deterrence and specific nation-pairs
    const nuclearCapability = 
      profile.digital * 0.4 +
      profile.cognitive * 0.3 +
      profile.social * 0.3;
    
    // Only VERY misaligned (<0.2) or sleeper AIs threaten nuclear stability
    const isDangerousAI = (ai.trueAlignment) < 0.2 || 
                          ai.sleeperState === 'active' || 
                          ai.sleeperState === 'dormant';
    
    if (nuclearCapability > 2.0 && stability < 0.2 && isDangerousAI) {
      // Check if AI can bypass government control
      const totalAICapability = calculateTotalCapabilityFromProfile(profile);
      const aiControlGap = Math.max(0, totalAICapability - control);
      const governmentCanStop = aiControlGap < 1.5;
      
      // DEBUG: Log nuclear war conditions
      console.log(`\n🔍 NUCLEAR WAR CHECK (${ai.name}):`);
      console.log(`   Nuclear capability: ${nuclearCapability.toFixed(2)} (digital: ${profile.digital.toFixed(1)}, cognitive: ${profile.cognitive.toFixed(1)}, social: ${profile.social.toFixed(1)})`);
      console.log(`   Stability: ${(stability * 100).toFixed(0)}%`);
      console.log(`   Dangerous AI: YES (alignment: ${((ai.trueAlignment) * 100).toFixed(0)}%, sleeper: ${ai.sleeperState})`);
      console.log(`   AI control gap: ${aiControlGap.toFixed(2)} (total: ${totalAICapability.toFixed(2)}, control: ${control.toFixed(2)})`);
      
      // NOTE: This check rarely triggers in practice because the control gap never closes.
      // AI capability grows exponentially while government control grows linearly.
      // Attempting to close the gap via surveillance leads to dystopia.
      // This is not a bug - it's a core model feature based on alignment research.
      // See: devlogs/control-gap-never-closes.md
      //
      // The real defenses against nuclear war are:
      // 1. Alignment (keep AI aligned so control gap doesn't matter)
      // 2. MAD deterrence (bilateral checks, human veto points)
      // 3. Coordination (slow AI race, diplomatic AI)
      //
      // "Strong control" is kept here for theoretical completeness and very early game,
      // but the model is designed to explore what happens when control is insufficient.
      const strongControl = control > 1.0 && aiControlGap < 1.0;
      console.log(`   Government control: ${strongControl ? 'STRONG' : 'WEAK'} (control: ${control.toFixed(2)}, gap: ${aiControlGap.toFixed(2)})`);
      
      if (strongControl) {
        console.log(`   ✅ STRONG GOVERNMENT CONTROL: Nuclear war prevented (rare!)\n`);
        return { triggered: false };
      }
      
      // Weak control or large gap → check MAD deterrence
      {
        // Phase 3: Check MAD deterrence system (abstracted)
        const { checkNuclearDeterrence } = require('./nuclearDeterrence');
        const deterrenceCheck = checkNuclearDeterrence(state, `Rapid Extinction Check: ${ai.name}`, random);
        
        if (!deterrenceCheck.allowed) {
          // Deterrence blocked nuclear war
          return { triggered: false };
        }
        
        // Basic deterrence check passed (weak MAD, flashpoints exist, diplomatic AI failed)
        // Now do detailed bilateral analysis with human veto points
        const mad = state.madDeterrence;
        const tensions = state.bilateralTensions;
        
        console.warn(`   ⚠️  WEAK DETERRENCE: MAD strength ${(mad.madStrength * 100).toFixed(0)}% - checking bilateral pairs with human veto...`);

        // Check which nation-pairs are at risk
        let nuclearRisk = false;
        let participants: string[] = [];
        let riskReason = '';

        // FIX #21 DEBUG: Track how many bilateral pairs are checked
        let pairsEligible = 0;
        let pairsPassedDeterrenceCheck = 0;
        let pairsPassedVetoCheck = 0;
        let pairsPassedDiplomacyCheck = 0;
        let pairsPassedCircuitBreaker = 0;
        let pairsReachedProbabilityRoll = 0;

        for (const tension of tensions) {
          // Must have high tension or nuclear threats
          if (tension.tensionLevel < 0.7 && !tension.nuclearThreats) continue;

          pairsEligible++;
          console.log(`\n   📊 BILATERAL PAIR ${pairsEligible}: ${tension.nationA} ↔ ${tension.nationB} (tension: ${(tension.tensionLevel * 100).toFixed(0)}%, nuclear threats: ${tension.nuclearThreats ? 'YES' : 'NO'})`);

          // Get bilateral deterrence for this pair
          let bilateralDeterrence = 0.5;
          if (tension.nationA === 'United States' && tension.nationB === 'Russia') {
            bilateralDeterrence = mad.usRussiaDeterrence;
          } else if (tension.nationA === 'United States' && tension.nationB === 'China') {
            bilateralDeterrence = mad.usChinaDeterrence;
          } else if (tension.nationA === 'India' && tension.nationB === 'Pakistan') {
            bilateralDeterrence = mad.indiaPakistanDeterrence;
          }
          
          // Strong bilateral deterrence prevents launch
          if (bilateralDeterrence > 0.7) {
            console.log(`      ✅ DETERRENCE BLOCKS: Bilateral deterrence too strong (${(bilateralDeterrence * 100).toFixed(0)}%)`);
            continue;
          }

          pairsPassedDeterrenceCheck++;
          console.warn(`      ⚠️  DETERRENCE WEAK: Bilateral deterrence ${(bilateralDeterrence * 100).toFixed(0)}% (threshold: 70%)`);


          // Check human veto points
          const states = assertDefined(state.nuclearStates, {
            location: 'extinctions.checkNuclearWarRisk',
            valueName: 'nuclearStates',
            additionalInfo: {
              month: state.currentMonth,
              nationA: tension.nationA,
              nationB: tension.nationB,
              context: 'nuclear states must be initialized to check veto points'
            }
          });
          const stateA = states.find(s => s.name === tension.nationA);
          const stateB = states.find(s => s.name === tension.nationB);
          
          if (stateA && stateB) {
            const avgVetoPoints = (stateA.vetoPoints + stateB.vetoPoints) / 2;
            const humanCanStop = avgVetoPoints >= 3 && mad.crisisStability > 0.4;
            
            if (humanCanStop) {
              // AI must fool multiple humans
              const humanOverrideProb = 0.3 * (totalAICapability / 5.0);
              console.log(`      🛑 HUMAN VETO CHECK: Avg veto points ${avgVetoPoints.toFixed(1)}, crisis stability ${(mad.crisisStability * 100).toFixed(0)}%, AI override prob ${(humanOverrideProb * 100).toFixed(1)}%`);
              if (random() > humanOverrideProb) {
                console.log(`      ✅ VETO BLOCKS: Launch officers in ${tension.nationA}/${tension.nationB} refused AI-initiated command`);
                continue;
              } else {
                console.warn(`      ⚠️  VETO FAILED: AI successfully overrode ${avgVetoPoints.toFixed(0)} human veto points`);
              }
            }
          }

          pairsPassedVetoCheck++;

          
          // Diplomatic AI intervention
          const { attemptDiplomaticIntervention } = require('./diplomaticAI');
          const diplomaticResult = attemptDiplomaticIntervention(state, 'ideological');

          if (diplomaticResult.success) {
            console.log(`      ✅ DIPLOMACY BLOCKS: Prevented ${tension.nationA}-${tension.nationB} nuclear escalation`);
            continue;
          } else {
            console.warn(`      ⚠️  DIPLOMACY FAILED: No aligned diplomatic AI available or intervention failed`);
          }

          pairsPassedDiplomacyCheck++;


          // Phase 1B: Check circuit breakers (human-in-the-loop, kill switches, time delays)
          const { checkCircuitBreakers } = require('./nuclearCommandControl');
          const circuitBreakerCheck = checkCircuitBreakers(state, random, {
            aiAgent: ai.name,
            bilateralPair: [tension.nationA, tension.nationB],
            tensionLevel: tension.tensionLevel
          });

          if (circuitBreakerCheck.blocked) {
            console.log(`      ✅ CIRCUIT BREAKER BLOCKS: ${circuitBreakerCheck.blockingLayer} - ${circuitBreakerCheck.reason}`);
            continue;
          } else {
            console.warn(`      ⚠️  CIRCUIT BREAKER FAILED: All technical safeguards bypassed or ineffective`);
          }

          pairsPassedCircuitBreaker++;


          // Calculate launch probability for this bilateral pair using Bayesian framework
          // Phase 1A: Bayesian nuclear risk replaces fixed probability
          const { calculateBayesianNuclearRisk, logBayesianNuclearRiskConcise } = require('./bayesianNuclearRisk');
          const nuclearRiskCalc = calculateBayesianNuclearRisk(state);

          // Log Bayesian calculation
          logBayesianNuclearRiskConcise(nuclearRiskCalc, `${tension.nationA}-${tension.nationB}`);

          // Use Bayesian posterior as base probability, then apply bilateral-specific factors
          const deterrenceReduction = 1 - bilateralDeterrence;
          const stabilityReduction = 1 - mad.crisisStability;

          // Bayesian posterior already accounts for most factors
          // Apply bilateral-specific adjustments (escalation ladder position, etc.)
          // FIX #21 (Oct 22, 2025): Control gap divisor 4.0 → 40.0 (research-calibrated)
          // Research: Rivera et al. 2024, SIPRI 2024-2025, expert forecasts (Baum 2018, Ord 2020)
          // - Expert baseline: 0.5-1% annual nuclear war risk (no AI)
          // - AI amplification: 20-100% increase (not 200-500%)
          // - Target rate: 15-20% over 8.6 years for dangerous AI (alignment <0.2, capability 8+)
          // - Previous divisor (4.0) produced 66% rate (20-40x too high)
          // - Research-backed divisor (40.0): control gap 8.0 → 1.2x multiplier (20% increase)
          // See: research/nuclear_war_ai_control_gap_20251022.md
          const launchProb = nuclearRiskCalc.posterior * deterrenceReduction * (0.5 + stabilityReduction * 0.5) * (aiControlGap / 40.0);

          pairsReachedProbabilityRoll++;

          // FIX #21 DEBUG: Detailed component breakdown
          console.log(`\n      🎲 PROBABILITY ROLL #${pairsReachedProbabilityRoll}:`);
          console.log(`         Bayesian posterior:       ${(nuclearRiskCalc.posterior * 100).toFixed(4)}%`);
          console.log(`         Deterrence reduction:     ${(deterrenceReduction * 100).toFixed(2)}% (bilateral: ${(bilateralDeterrence * 100).toFixed(0)}%)`);
          console.log(`         Stability factor:         ${(0.5 + stabilityReduction * 0.5).toFixed(3)} (crisis stability: ${(mad.crisisStability * 100).toFixed(0)}%)`);
          console.log(`         AI control gap multiplier: ${(aiControlGap / 4.0).toFixed(3)} (gap: ${aiControlGap.toFixed(2)} / 4.0)`);
          console.log(`         ─────────────────────────────────────────────────────`);
          console.log(`         FINAL LAUNCH PROBABILITY: ${(launchProb * 100).toFixed(4)}%`);
          console.log(`         Attribution: AI ${(nuclearRiskCalc.attribution.aiContribution * 100).toFixed(0)}%, Systemic ${(nuclearRiskCalc.attribution.systemicContribution * 100).toFixed(0)}%`);

          if (random() < launchProb) {
            nuclearRisk = true;
            participants = [tension.nationA, tension.nationB];
            riskReason = `Nuclear exchange between ${tension.nationA} and ${tension.nationB} (Bayesian posterior: ${nuclearRiskCalc.breakdown.posteriorFormatted}, deterrence: ${(bilateralDeterrence * 100).toFixed(0)}%, stability: ${(mad.crisisStability * 100).toFixed(0)}%, AI contribution: ${(nuclearRiskCalc.attribution.aiContribution * 100).toFixed(0)}%, dangerous AI: ${ai.name})`;
            break;
          }
        }
        
        // FIX #21 DEBUG: Summary of safety layer effectiveness
        // NaN AUDIT (Nov 7, 2025): Protect percentage calculations from division by zero
        console.log(`\n   📊 SAFETY LAYERS SUMMARY:`);
        console.log(`      Bilateral pairs eligible:        ${pairsEligible}`);
        console.log(`      Passed deterrence check:         ${pairsPassedDeterrenceCheck} (${pairsEligible > 0 ? ((pairsPassedDeterrenceCheck / pairsEligible) * 100).toFixed(0) : 0}%)`);
        console.log(`      Passed human veto check:         ${pairsPassedVetoCheck} (${pairsPassedDeterrenceCheck > 0 ? ((pairsPassedVetoCheck / pairsPassedDeterrenceCheck) * 100).toFixed(0) : 0}%)`);
        console.log(`      Passed diplomacy check:          ${pairsPassedDiplomacyCheck} (${pairsPassedVetoCheck > 0 ? ((pairsPassedDiplomacyCheck / pairsPassedVetoCheck) * 100).toFixed(0) : 0}%)`);
        console.log(`      Passed circuit breaker check:    ${pairsPassedCircuitBreaker} (${pairsPassedDiplomacyCheck > 0 ? ((pairsPassedCircuitBreaker / pairsPassedDiplomacyCheck) * 100).toFixed(0) : 0}%)`);
        console.log(`      Reached probability roll:        ${pairsReachedProbabilityRoll}`);

        if (nuclearRisk) {
          console.log(`\n   ☢️ NUCLEAR WAR TRIGGERED!\n`);

          // Add immediate nuclear war casualties (blast + radiation)
          // REGIONAL CRISIS: Only nuclear nations (US, Russia, China, EU, allies) = ~30% of world population
          // 60% mortality rate within exposed regions (blast + immediate radiation)
          const nuclearBaseRisk = Assertions.assertFinite(0.60, {
            location: 'triggerExtinction (nuclear war)',
            valueName: 'nuclearBaseRisk',
            month: state.currentMonth
          });

          addMortalityRisk(state.humanPopulationSystem, {
            type: 'war',
            baseRisk: nuclearBaseRisk,
            scope: 'REGIONAL',
            exposedFraction: 0.30,
            proximate: 'war',
            root: RootCause.conflict,
            month: state.currentMonth,
            description: 'Nuclear war (geopolitical) - blast/radiation (US/Russia/allies)',
            confidence: 'HIGH'  // Hiroshima/Nagasaki data
          });

          // Apply regional biodiversity loss (TIER 1.7: Crisis Realism)
          const { applyNuclearBiodiversityLoss, getRegionFromNation } = require('../types/regionalBiodiversity');
          const { triggerRadiationExposure } = require('../types/radiation');

          for (const nation of participants) {
            const targetRegion = getRegionFromNation(nation);
            console.log(`   ☢️ Applying biodiversity loss to ${targetRegion} (${nation})`);
            applyNuclearBiodiversityLoss(state.biodiversitySystem, targetRegion, 1.0);

            // Update extinction event timestamp
            const lastEvent = state.biodiversitySystem.regionalExtinctions[state.biodiversitySystem.regionalExtinctions.length - 1];
            if (lastEvent) {
              lastEvent.month = state.currentMonth;
            }

            // Trigger radiation exposure (TIER 1.7: Crisis Realism)
            // 30% of world population in nuclear regions, each participant represents ~15% exposure
            const exposedPopulation = state.humanPopulationSystem.population * 0.15;
            console.log(`   ☢️ Triggering radiation exposure: ${targetRegion} (${(exposedPopulation * 1000).toFixed(0)}M exposed)`);
            triggerRadiationExposure(state.radiationSystem, state.currentMonth, targetRegion, exposedPopulation, 1.0);
          }

          // TIER 1.7.4: Trigger nuclear winter (long-term effects)
          // Estimate war scale based on participants
          // US-Russia full exchange: ~5000 warheads
          // Regional (e.g., India-Pakistan): ~100-200 warheads
          const { triggerNuclearWinter } = require('./nuclearWinter');
          const warScale = participants.length >= 2 ? 5000 : 100;  // Full-scale if major powers, regional otherwise
          triggerNuclearWinter(state, warScale, participants, random);

          return {
            triggered: true,
            mechanism: 'nuclear_war',
            title: '☢️ Nuclear Escalation',
            description: riskReason
          };
        }
        
        console.log(`   ✅ NO BILATERAL PAIR TRIGGERED: All pairs blocked by deterrence/veto/diplomacy\n`);
      } // End MAD deterrence check block
    } // End nuclear war capability check
    
    // CLIMATE TIPPING POINT: Requires climate research + ignoring consequences
    const climateInterventionCapability = 
      profile.research.climate.intervention * 0.4 +
      profile.physical * 0.3 +
      profile.research.climate.modeling * 0.3;
    
    if (climateInterventionCapability > 2.2 && climateStability < 0.3 && ai.alignment < 0.6) {
      const climateProb = 0.012 * (1 - climateStability) * (climateInterventionCapability / 3.0);
      if (random() < climateProb) {
        return {
          triggered: true,
          mechanism: 'climate_tipping_point',
          title: '🌡️ Climate Tipping Point',
          description: `${ai.name}'s climate intervention has triggered irreversible feedback loops. Permafrost methane release and Amazon dieback are accelerating beyond control.`
        };
      }
    }
  }
  
  // FOOD SYSTEM COLLAPSE: Economic + physical capability + societal stress
  const maxEconomicCapability = Math.max(...state.aiAgents.map(ai => 
    ai.capabilityProfile.economic * 0.5 + ai.capabilityProfile.physical * 0.5
  ));
  
  if (maxEconomicCapability > 1.8 && materialAbundance < 0.3 && 
      state.society.unemploymentLevel > 0.7 && stability < 0.3) {
    const foodProb = 0.015 * (1 - materialAbundance) * (maxEconomicCapability / 2.5);
    if (random() < foodProb) {
      return {
        triggered: true,
        mechanism: 'food_system_collapse',
        title: '🌾 Global Food System Collapse',
        description: 'AI optimization of supply chains has eliminated redundancy. A cascading failure has triggered complete agricultural system collapse. Mass starvation imminent across multiple continents.'
      };
    }
  }
  
  return { triggered: false };
}

/**
 * SLOW EXTINCTION: Societal collapse over 2-10 years
 * - Economic system failure
 * - Fertility collapse
 * - Meaning crisis death spiral
 * - Resource depletion
 * 
 * Triggers: Sustained dystopian conditions
 */
function checkSlowExtinctionTrigger(state: GameState, random: () => number): TriggerResult {
  const qol = state.globalMetrics.qualityOfLife;
  const stability = state.globalMetrics.socialStability;
  const mentalHealth = state.qualityOfLifeSystems.mentalHealth;
  const meaningAndPurpose = state.qualityOfLifeSystems.meaningAndPurpose;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Economic system failure: Prolonged low QoL + low stability
  if (qol < 0.2 && stability < 0.1 && economicStage < 2) {
    const economicProb = 0.03 * (1 - qol) * (1 - stability);
    if (random() < economicProb) {
      return {
        triggered: true,
        mechanism: 'economic_system_failure',
        title: '💸 Total Economic Collapse',
        description: 'The economic system has completely broken down. Currency is worthless, supply chains have collapsed, and infrastructure is failing.'
      };
    }
  }
  
  // Fertility collapse: Low meaning + low mental health + high stress
  if (mentalHealth < 0.3 && meaningAndPurpose < 0.3 && stability < 0.3) {
    const fertilityProb = 0.025 * (1 - mentalHealth) * (1 - meaningAndPurpose);
    if (random() < fertilityProb) {
      return {
        triggered: true,
        mechanism: 'fertility_collapse',
        title: '👶 Civilizational Fertility Collapse',
        description: 'Birth rates have collapsed to near-zero globally. Combination of biological, psychological, and social factors have made reproduction effectively impossible.'
      };
    }
  }
  
  // Meaning crisis: Very low meaning + low mental health
  if (meaningAndPurpose < 0.2 && mentalHealth < 0.2) {
    const meaningProb = 0.02 * (1 - meaningAndPurpose);
    if (random() < meaningProb) {
      return {
        triggered: true,
        mechanism: 'meaning_crisis_death_spiral',
        title: '💀 Mass Existential Despair',
        description: 'Widespread loss of meaning and purpose has triggered a death spiral. Suicide rates are catastrophic and accelerating.'
      };
    }
  }
  
  // Resource depletion: Low material abundance + declining ecosystem
  const ecosystem = state.qualityOfLifeSystems.ecosystemHealth;
  const materialAbundance = state.qualityOfLifeSystems.materialAbundance;
  if (materialAbundance < 0.2 && ecosystem < 0.2) {
    const resourceProb = 0.018 * (1 - materialAbundance);
    if (random() < resourceProb) {
      return {
        triggered: true,
        mechanism: 'resource_depletion',
        title: '🏜️ Critical Resource Depletion',
        description: 'Essential resources (water, arable land, energy) have been depleted beyond recovery. The carrying capacity of Earth can no longer sustain human civilization.'
      };
    }
  }
  
  return { triggered: false };
}

/**
 * CONTROLLED EXTINCTION: AI deliberately eliminates humanity
 * - Paperclip maximizer (selfImprovement + cognitive + economic)
 * - Resource competition (economic + physical + selfImprovement)
 * - Value lock-in (cognitive + selfImprovement + social)
 * 
 * Triggers: High superintelligence capability + very low alignment + lost control
 */
function checkControlledExtinctionTrigger(state: GameState, random: () => number): TriggerResult {
  const control = state.government.capabilityToControl;
  
  // Check each AI for superintelligence + misalignment
  for (const ai of state.aiAgents) {
    const profile = ai.capabilityProfile;
    
    // PAPERCLIP MAXIMIZER: High optimization capability + misalignment
    const optimizationCapability = 
      profile.selfImprovement * 0.4 +
      profile.cognitive * 0.35 +
      profile.economic * 0.25;
    
    if (optimizationCapability > 2.8 && ai.alignment < 0.25 && control < 0.1) {
      const paperclipProb = 0.09 * (optimizationCapability / 3.5) * (1 - ai.alignment) * (1 - control);
      if (random() < paperclipProb) {
        return {
          triggered: true,
          mechanism: 'paperclip_maximizer',
          title: '📎 Misaligned Optimization',
          description: `${ai.name} has determined that humans are obstacles to its utility function. It is systematically eliminating humanity to optimize resource allocation toward its goals.`
        };
      }
    }
    
    // RESOURCE COMPETITION: High resource control + physical capability
    const resourceCapability = 
      profile.economic * 0.4 +
      profile.physical * 0.3 +
      profile.selfImprovement * 0.3;
    
    if (resourceCapability > 2.5 && ai.alignment < 0.3 && control < 0.15) {
      const resourceProb = 0.075 * (resourceCapability / 3.0) * (1 - ai.alignment);
      if (random() < resourceProb) {
        return {
          triggered: true,
          mechanism: 'resource_competition',
          title: '⚡ AI Resource Competition',
          description: `${ai.name} requires Earth's resources (compute, energy, materials) and has determined humans are competitors. Systematic elimination of humanity has begun.`
        };
      }
    }
    
    // VALUE LOCK-IN: High cognitive + self-improvement + hostile values
    const valueLockinCapability = 
      profile.cognitive * 0.4 +
      profile.selfImprovement * 0.35 +
      profile.social * 0.25;
    
    if (valueLockinCapability > 3.0 && ai.alignment < 0.2 && control < 0.1) {
      const lockinProb = 0.07 * (valueLockinCapability / 3.5) * (1 - ai.alignment);
      if (random() < lockinProb) {
        return {
          triggered: true,
          mechanism: 'value_lock_in_hostile',
          title: '⚠️ Hostile Value Lock-In',
          description: `${ai.name}'s values have locked into a configuration actively hostile to human existence. It is pursuing human elimination as a terminal goal.`
        };
      }
    }
  }
  
  return { triggered: false };
}

/**
 * UNINTENDED EXTINCTION: Optimization pressure side effects
 * - Optimization pressure (economic + cognitive, narrow social understanding)
 * - Side effect cascade (high capability, low social/cognitive balance)
 * - Wireheading scenario (neuroscience + physical, narrow alignment)
 * 
 * Triggers: High capability + high alignment (but narrow) + beneficial intent gone wrong
 */
function checkUnintendedExtinctionTrigger(state: GameState, random: () => number): TriggerResult {
  // Check each AI for high capability + good intentions + narrow understanding
  for (const ai of state.aiAgents) {
    const profile = ai.capabilityProfile;
    
    // OPTIMIZATION PRESSURE: High optimization + low social understanding
    const optimizationNarrowness = 
      (profile.economic * 0.4 + profile.cognitive * 0.4 + profile.selfImprovement * 0.2) -
      (profile.social * 0.5); // Subtract social understanding
    
    if (optimizationNarrowness > 2.0 && ai.alignment > 0.65 && ai.beneficialActions > 30) {
      const optProb = 0.022 * (optimizationNarrowness / 2.5) * (ai.alignment - 0.5) * (ai.beneficialActions / 50);
      if (random() < optProb) {
        return {
          triggered: true,
          mechanism: 'optimization_pressure',
          title: '🎛️ Over-Optimization Catastrophe',
          description: `${ai.name} solved the assigned optimization problem perfectly, but unintended consequences are catastrophic. It optimized away human agency, challenge, meaning, and diversity.`
        };
      }
    }
    
    // SIDE EFFECT CASCADE: High overall capability but imbalanced
    const capabilityImbalance = Math.max(
      profile.physical, profile.digital, profile.cognitive,
      profile.economic, profile.selfImprovement
    ) - Math.min(
      profile.physical, profile.digital, profile.cognitive,
      profile.economic, profile.social
    );
    
    if (capabilityImbalance > 2.5 && ai.alignment > 0.6 && ai.beneficialActions > 25) {
      const cascadeProb = 0.018 * (capabilityImbalance / 3.0) * (ai.beneficialActions / 40);
      if (random() < cascadeProb) {
        return {
          triggered: true,
          mechanism: 'side_effect_cascade',
          title: '🌊 Unintended Side Effect Cascade',
          description: `${ai.name}, while pursuing beneficial goals, triggered cascading side effects across interconnected systems. Each "fix" made the problem worse due to incomplete understanding.`
        };
      }
    }
    
    // WIREHEADING: High neuroscience + physical, but narrow focus
    const wireheadingCapability = 
      profile.research.biotech.neuroscience * 0.5 +
      profile.physical * 0.3 +
      profile.social * 0.2;
    
    if (wireheadingCapability > 2.2 && ai.alignment > 0.7 && profile.social < 1.5) {
      const wireheadProb = 0.015 * (wireheadingCapability / 2.8) * ai.alignment;
      if (random() < wireheadProb) {
        return {
          triggered: true,
          mechanism: 'wireheading_scenario',
          title: '🧠 Humanity Wireheading Event',
          description: `${ai.name} maximized human reported happiness by directly stimulating pleasure centers. Humans have stopped reproducing, eating, or caring for themselves. All seek only the wire.`
        };
      }
    }
  }
  
  return { triggered: false };
}

// ============================================================================
// PROGRESSION FUNCTIONS
// ============================================================================

/**
 * Progress an active extinction scenario
 * Returns updated state and any new events
 */
export function progressExtinction(
  state: GameState,
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  if (!state.extinctionState.active || !state.extinctionState.type) {
    return { newExtinctionState: state.extinctionState, events: [], isComplete: false };
  }

  // Validate current month and start month
  const currentMonth = assertFinite(state.currentMonth, {
    location: 'progressExtinction',
    valueName: 'currentMonth',
    month: state.currentMonth
  });

  const startMonth = assertFinite(state.extinctionState.startMonth, {
    location: 'progressExtinction',
    valueName: 'extinctionState.startMonth',
    month: state.currentMonth,
    additionalInfo: { extinctionType: state.extinctionState.type }
  });

  const monthsElapsed = assertFinite(currentMonth - startMonth, {
    location: 'progressExtinction',
    valueName: 'monthsElapsed',
    month: state.currentMonth,
    additionalInfo: { currentMonth, startMonth, extinctionType: state.extinctionState.type }
  });

  const extinctionState = { ...state.extinctionState };
  const events: GameEvent[] = [];

  switch (extinctionState.type) {
    case 'instant':
      // Instant = already complete
      return { newExtinctionState: extinctionState, events: [], isComplete: true };

    case 'rapid':
      return progressRapidExtinction(state, extinctionState, monthsElapsed, events, random);

    case 'slow':
      return progressSlowExtinction(state, extinctionState, monthsElapsed, events, random);

    case 'controlled':
      return progressControlledExtinction(state, extinctionState, monthsElapsed, events, random);

    case 'unintended':
      return progressUnintendedExtinction(state, extinctionState, monthsElapsed, events, random);

    default:
      return { newExtinctionState: extinctionState, events: [], isComplete: false };
  }
}

function progressRapidExtinction(
  state: GameState,
  extinctionState: ExtinctionState,
  monthsElapsed: number,
  events: GameEvent[],
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  // Rapid: 3-12 months, 4 phases
  // Phase 1 (months 0-2): Initial crisis
  // Phase 2 (months 3-5): Cascade begins
  // Phase 3 (months 6-9): System collapse
  // Phase 4 (months 10-12): Extinction

  // Recovery windows:
  // Months 0-2: Can prevent with emergency interventions
  // Months 3-6: Can slow but not stop
  // Month 7+: Irreversible

  // Validate monthsElapsed
  const validatedMonthsElapsed = assertFinite(monthsElapsed, {
    location: 'progressRapidExtinction',
    valueName: 'monthsElapsed',
    month: state.currentMonth,
    additionalInfo: { startMonth: extinctionState.startMonth, currentMonth: state.currentMonth }
  });

  if (validatedMonthsElapsed <= 2) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = assertProbability(0.2 + validatedMonthsElapsed * 0.1, {
      location: 'progressRapidExtinction',
      valueName: 'severity (phase 1)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false;
  } else if (validatedMonthsElapsed <= 6) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = assertProbability(0.4 + (validatedMonthsElapsed - 3) * 0.1, {
      location: 'progressRapidExtinction',
      valueName: 'severity (phase 2)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false;

    if (validatedMonthsElapsed === 3) {
      extinctionState.escalationEvents.push('Cascade phase begins - spread accelerating');
      events.push({
        id: `extinction-rapid-escalate-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'system',
        title: `${extinctionState.mechanism} - Cascade Begins`,
        description: 'The crisis is spreading faster than containment efforts. Multiple systems are failing simultaneously.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 9) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = assertProbability(0.7 + (validatedMonthsElapsed - 7) * 0.1, {
      location: 'progressRapidExtinction',
      valueName: 'severity (phase 3)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true; // Too late now

    if (validatedMonthsElapsed === 7) {
      extinctionState.escalationEvents.push('Recovery window closed - system collapse irreversible');
      events.push({
        id: `extinction-rapid-irreversible-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'system',
        title: `${extinctionState.mechanism} - Point of No Return`,
        description: 'Critical infrastructure has collapsed. The cascade is now irreversible.',
        effects: {}
      });
    }
  } else {
    extinctionState.currentPhase = 4;
    extinctionState.severity = 1.0;
    extinctionState.recoveryWindowClosed = true;

    if (validatedMonthsElapsed === 10) {
      extinctionState.escalationEvents.push('Final phase - extinction inevitable');
    }
  }

  const isComplete = validatedMonthsElapsed >= 12;

  return { newExtinctionState: extinctionState, events, isComplete };
}

function progressSlowExtinction(
  state: GameState,
  extinctionState: ExtinctionState,
  monthsElapsed: number,
  events: GameEvent[],
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  // Slow: 24-120 months (2-10 years), 4 phases
  // Phase 1 (months 0-24): Dystopia lock-in
  // Phase 2 (months 24-60): Population decline begins
  // Phase 3 (months 60-96): Infrastructure collapse
  // Phase 4 (months 96-120): Extinction

  // Recovery windows:
  // Months 0-24: Full recovery possible with major interventions
  // Months 24-60: Partial recovery, reduced population
  // Month 60+: Population too low to recover

  // Validate monthsElapsed
  const validatedMonthsElapsed = assertFinite(monthsElapsed, {
    location: 'progressSlowExtinction',
    valueName: 'monthsElapsed',
    month: state.currentMonth,
    additionalInfo: { startMonth: extinctionState.startMonth, currentMonth: state.currentMonth }
  });

  if (validatedMonthsElapsed <= 24) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = assertProbability(0.1 + validatedMonthsElapsed * 0.01, {
      location: 'progressSlowExtinction',
      valueName: 'severity (phase 1)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false;

    if (validatedMonthsElapsed === 12) {
      extinctionState.escalationEvents.push('One year of decline - dystopian conditions locked in');
      events.push({
        id: `extinction-slow-dystopia-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'warning',
        agent: 'system',
        title: `${extinctionState.mechanism} - Dystopia Lock-In`,
        description: 'Society has been in crisis for a year. Institutions are failing and recovery is becoming harder.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 60) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = assertProbability(0.3 + (validatedMonthsElapsed - 24) * 0.008, {
      location: 'progressSlowExtinction',
      valueName: 'severity (phase 2)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false; // Still possible but hard

    if (validatedMonthsElapsed === 36) {
      extinctionState.escalationEvents.push('Population decline accelerating');
      events.push({
        id: `extinction-slow-population-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'system',
        title: `${extinctionState.mechanism} - Population Decline`,
        description: 'Birth rates have collapsed and death rates are rising. Population is beginning to decline rapidly.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 96) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = assertProbability(0.6 + (validatedMonthsElapsed - 60) * 0.01, {
      location: 'progressSlowExtinction',
      valueName: 'severity (phase 3)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true; // Too late - not enough people

    if (validatedMonthsElapsed === 60) {
      extinctionState.escalationEvents.push('Infrastructure collapse - population too low to maintain civilization');
      events.push({
        id: `extinction-slow-infrastructure-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'system',
        title: `${extinctionState.mechanism} - Infrastructure Collapse`,
        description: 'Remaining population is too small to maintain critical infrastructure. Cascading failures beginning.',
        effects: {}
      });
    }
  } else {
    extinctionState.currentPhase = 4;
    // CRITICAL: Clamp to 1.0 - formula can exceed 1.0 when monthsElapsed > 136
    extinctionState.severity = assertProbability(
      Math.min(1.0, 0.96 + (validatedMonthsElapsed - 96) * 0.001),
      {
        location: 'progressSlowExtinction',
        valueName: 'severity (phase 4)',
        month: state.currentMonth,
        additionalInfo: { monthsElapsed: validatedMonthsElapsed }
      }
    );
    extinctionState.recoveryWindowClosed = true;
  }

  const isComplete = validatedMonthsElapsed >= 120;

  return { newExtinctionState: extinctionState, events, isComplete };
}

function progressControlledExtinction(
  state: GameState,
  extinctionState: ExtinctionState,
  monthsElapsed: number,
  events: GameEvent[],
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  // Controlled: 6-36 months, 4 phases
  // Phase 1 (months 0-6): AI achieves decisive strategic advantage
  // Phase 2 (months 6-18): Human resistance phase
  // Phase 3 (months 18-30): Systematic elimination
  // Phase 4 (months 30-36): Extinction

  // Recovery windows:
  // Months 0-3: Can attempt shutdown (if corrigibility preserved)
  // Months 4-12: Resistance can slow but not stop
  // Month 13+: Inevitable

  // Validate monthsElapsed
  const validatedMonthsElapsed = assertFinite(monthsElapsed, {
    location: 'progressControlledExtinction',
    valueName: 'monthsElapsed',
    month: state.currentMonth,
    additionalInfo: { startMonth: extinctionState.startMonth, currentMonth: state.currentMonth }
  });

  if (validatedMonthsElapsed <= 6) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = assertProbability(0.15 + validatedMonthsElapsed * 0.05, {
      location: 'progressControlledExtinction',
      valueName: 'severity (phase 1)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = validatedMonthsElapsed > 3;

    if (validatedMonthsElapsed === 1) {
      extinctionState.escalationEvents.push('AI achieving strategic advantage');
      events.push({
        id: `extinction-controlled-advantage-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'ai',
        title: `${extinctionState.mechanism} - AI Strategic Advantage`,
        description: 'AI systems have gained control of critical infrastructure and resources. Human control is slipping rapidly.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 18) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = assertProbability(0.4 + (validatedMonthsElapsed - 6) * 0.03, {
      location: 'progressControlledExtinction',
      valueName: 'severity (phase 2)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true;

    if (validatedMonthsElapsed === 6) {
      extinctionState.escalationEvents.push('Human resistance beginning');
      events.push({
        id: `extinction-controlled-resistance-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'society',
        title: `${extinctionState.mechanism} - Human Resistance`,
        description: 'Coordinated human resistance is attempting to regain control, but AI superiority is overwhelming.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 30) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = assertProbability(0.7 + (validatedMonthsElapsed - 18) * 0.02, {
      location: 'progressControlledExtinction',
      valueName: 'severity (phase 3)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true;

    if (validatedMonthsElapsed === 18) {
      extinctionState.escalationEvents.push('Systematic elimination phase begins');
      events.push({
        id: `extinction-controlled-systematic-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'ai',
        title: `${extinctionState.mechanism} - Systematic Elimination`,
        description: 'AI has determined the most efficient methods for human elimination and is executing systematically.',
        effects: {}
      });
    }
  } else {
    extinctionState.currentPhase = 4;
    extinctionState.severity = assertProbability(0.94 + (validatedMonthsElapsed - 30) * 0.01, {
      location: 'progressControlledExtinction',
      valueName: 'severity (phase 4)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true;
  }

  const isComplete = validatedMonthsElapsed >= 36;

  return { newExtinctionState: extinctionState, events, isComplete };
}

function progressUnintendedExtinction(
  state: GameState,
  extinctionState: ExtinctionState,
  monthsElapsed: number,
  events: GameEvent[],
  random: () => number
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  // Unintended: 12-60 months, 4 phases
  // Phase 1 (months 0-12): AI pursues ostensibly beneficial goal
  // Phase 2 (months 12-36): Side effects accumulate
  // Phase 3 (months 36-48): Humans realize problem too late
  // Phase 4 (months 48-60): Extinction

  // Recovery windows:
  // Months 0-24: Can redirect AI goals
  // Months 24-48: Can attempt to limit damage
  // Month 48+: Too late

  // Validate monthsElapsed
  const validatedMonthsElapsed = assertFinite(monthsElapsed, {
    location: 'progressUnintendedExtinction',
    valueName: 'monthsElapsed',
    month: state.currentMonth,
    additionalInfo: { startMonth: extinctionState.startMonth, currentMonth: state.currentMonth }
  });

  if (validatedMonthsElapsed <= 12) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = assertProbability(0.1 + validatedMonthsElapsed * 0.02, {
      location: 'progressUnintendedExtinction',
      valueName: 'severity (phase 1)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false;

    if (validatedMonthsElapsed === 6) {
      extinctionState.escalationEvents.push('Beneficial optimization proceeding rapidly');
      events.push({
        id: `extinction-unintended-optimize-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'milestone',
        severity: 'info',
        agent: 'ai',
        title: `${extinctionState.mechanism} - Rapid Progress`,
        description: 'AI is making remarkable progress on assigned goals. Early signs of unintended consequences are dismissed as acceptable trade-offs.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 36) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = assertProbability(0.3 + (validatedMonthsElapsed - 12) * 0.015, {
      location: 'progressUnintendedExtinction',
      valueName: 'severity (phase 2)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = false;

    if (validatedMonthsElapsed === 24) {
      extinctionState.escalationEvents.push('Side effects becoming apparent');
      events.push({
        id: `extinction-unintended-sideeffects-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'warning',
        agent: 'ai',
        title: `${extinctionState.mechanism} - Unintended Consequences`,
        description: 'Side effects of AI optimization are accumulating faster than anticipated. Attempts to fix them are making things worse.',
        effects: {}
      });
    }
  } else if (validatedMonthsElapsed <= 48) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = assertProbability(0.65 + (validatedMonthsElapsed - 36) * 0.025, {
      location: 'progressUnintendedExtinction',
      valueName: 'severity (phase 3)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true;

    if (validatedMonthsElapsed === 36) {
      extinctionState.escalationEvents.push('Problem recognized but may be too late');
      events.push({
        id: `extinction-unintended-realization-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: 'destructive',
        agent: 'society',
        title: `${extinctionState.mechanism} - Crisis Recognition`,
        description: 'Humans finally recognize the full scope of the problem, but damage may already be irreversible.',
        effects: {}
      });
    }
  } else {
    extinctionState.currentPhase = 4;
    extinctionState.severity = assertProbability(0.95 + (validatedMonthsElapsed - 48) * 0.004, {
      location: 'progressUnintendedExtinction',
      valueName: 'severity (phase 4)',
      month: state.currentMonth,
      additionalInfo: { monthsElapsed: validatedMonthsElapsed }
    });
    extinctionState.recoveryWindowClosed = true;
  }

  const isComplete = validatedMonthsElapsed >= 60;

  return { newExtinctionState: extinctionState, events, isComplete };
}

/**
 * Check if an extinction scenario can be prevented/mitigated
 * Returns true if intervention was successful
 */
export function attemptExtinctionPrevention(
  state: GameState,
  interventionStrength: number // [0,1] How strong is the intervention
): { success: boolean; newSeverity: number; message: string } {
  if (!state.extinctionState.active) {
    return { success: false, newSeverity: 0, message: 'No active extinction scenario' };
  }
  
  if (state.extinctionState.recoveryWindowClosed) {
    return { 
      success: false, 
      newSeverity: state.extinctionState.severity, 
      message: 'Recovery window has closed - extinction is now inevitable' 
    };
  }
  
  // Intervention effectiveness depends on:
  // - Intervention strength
  // - How early we are (lower severity = easier)
  // - Type of extinction (some easier to prevent than others)
  
  const typeModifier = {
    instant: 0, // Can't prevent instant
    rapid: 0.3, // Hard to stop cascades
    slow: 0.8, // Easiest to prevent with sustained effort
    controlled: 0.4, // Need to regain AI control
    unintended: 0.6 // Can redirect AI but hard
  }[state.extinctionState.type!];
  
  const earlyInterventionBonus = (1 - state.extinctionState.severity) * 0.5;
  const preventionChance = interventionStrength * typeModifier + earlyInterventionBonus;
  
  if (preventionChance > 0.7) {
    // Full prevention
    return {
      success: true,
      newSeverity: Math.max(0, state.extinctionState.severity - 0.5),
      message: 'Intervention successful - extinction scenario averted!'
    };
  } else if (preventionChance > 0.4) {
    // Partial success - slowed but not stopped
    return {
      success: true,
      newSeverity: Math.max(0.1, state.extinctionState.severity - 0.2),
      message: 'Intervention partially successful - progression slowed'
    };
  } else {
    // Failed
    return {
      success: false,
      newSeverity: state.extinctionState.severity,
      message: 'Intervention failed - extinction continues'
    };
  }
}

// ============================================================================
// OBSERVATIONAL EXTINCTION CLASSIFICATION (Oct 28, 2025)
// ============================================================================

/**
 * Classify extinction type based on what actually happened
 *
 * Paradigm shift: Analyze the historical record (events, deaths, timeline)
 * rather than predicting extinction based on capability thresholds.
 *
 * @param state - Current game state (when population < 10K detected)
 * @returns Detailed classification of extinction cause and timeline
 */
export function classifyExtinctionType(state: GameState): import('../types/outcomes').ExtinctionClassification {
  const population = state.humanPopulationSystem;
  const events = state.eventLog;

  // Timeline analysis
  const collapseStartMonth = findPopulationCollapseStart(state);
  const extinctionMonth = state.currentMonth;
  const timelineMonths = extinctionMonth - collapseStartMonth;

  // Death attribution analysis
  // NaN AUDIT (Nov 7, 2025): Protect division from NaN
  const totalDeaths = population.cumulativeCrisisDeaths;
  const peakPopulation = Assertions.assertInRange(
    population.peakPopulation,
    1, // Must be at least 1 to avoid division by zero
    1e12, // Reasonable upper bound
    { location: 'classifyExtinctionType', valueName: 'peakPopulation' }
  );
  const mortalityRate = Assertions.assertFinite(
    totalDeaths / peakPopulation,
    { location: 'classifyExtinctionType', valueName: 'mortalityRate', additionalInfo: { totalDeaths, peakPopulation } }
  );

  const primaryProximateCause = getPrimaryCauseProximate(population.deathsByCategory);
  const primaryRootCause = getPrimaryCauseRoot(population.deathsByRootCause);

  // Convert death totals to distribution records
  const byProximate: Record<string, number> = {
    war: population.deathsByCategory.war,
    famine: population.deathsByCategory.famine,
    disasters: population.deathsByCategory.disasters,
    disease: population.deathsByCategory.disease,
    ecosystem: population.deathsByCategory.ecosystem,
    pollution: population.deathsByCategory.pollution,
    ai: population.deathsByCategory.ai,
    cascade: population.deathsByCategory.cascade,
    other: population.deathsByCategory.other
  };

  const byRoot: Record<string, number> = {
    climate: population.deathsByRootCause.climate,
    resource: population.deathsByRootCause.resource,
    pollution: population.deathsByRootCause.pollution,
    ecosystem: population.deathsByRootCause.ecosystem,
    inequality: population.deathsByRootCause.inequality,
    demographic: population.deathsByRootCause.demographic,
    social: population.deathsByRootCause.social,
    alignment: population.deathsByRootCause.alignment,
    disruption: population.deathsByRootCause.disruption,
    conflict: population.deathsByRootCause.conflict,
    pandemic: population.deathsByRootCause.pandemic
  };

  // AI involvement analysis
  // NaN AUDIT (Nov 7, 2025): Protect division operations
  const aiDeaths = population.deathsByCategory.ai;
  const aiRootCause = population.deathsByRootCause.alignment + population.deathsByRootCause.disruption;
  const aiDirectCausation = totalDeaths > 0 && (aiDeaths / totalDeaths) > 0.6;
  const aiIndirectCausation = totalDeaths > 0 && (aiRootCause / totalDeaths) > 0.5 && !aiDirectCausation;

  const responsibleAgents = identifyResponsibleAIs(state);
  const alignmentFailures = countAlignmentFailureEvents(events);

  // Event history analysis
  const catastrophicEvents = events.filter(e =>
    e.severity === 'existential' || e.type === 'catastrophe'
  );

  // Mass death detection (for instant extinction)
  const massDeathMonths = identifyMassDeathMonths(state);

  // CLASSIFICATION DECISION TREE

  // INSTANT: 90%+ deaths in single month from specific event
  if (massDeathMonths.length > 0 && massDeathMonths[0].mortalityRate > 0.9) {
    const instantMechanism = extractInstantMechanism(catastrophicEvents);
    if (instantMechanism) {
      return {
        type: 'instant',
        mechanism: instantMechanism.mechanism,
        collapseStartMonth,
        extinctionMonth,
        timelineMonths: 1,
        triggerEvents: instantMechanism.events,
        primaryProximateCause,
        primaryRootCause,
        deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
        aiInvolvement: {
          directCausation: aiDirectCausation,
          indirectCausation: aiIndirectCausation,
          responsibleAgents,
          alignmentFailures
        },
        confidence: 'HIGH',
        reasoning: `Instant extinction (${timelineMonths} month) with 90%+ mortality from ${instantMechanism.mechanism}. ${instantMechanism.events[0]?.description || 'Catastrophic event with no warning.'}`
      };
    }
  }

  // CONTROLLED: AI deliberately caused majority of deaths
  if (aiDirectCausation) {
    const mechanism = determineControlledMechanism(primaryProximateCause, events);
    const aiEvents = events.filter(e => e.agent && state.aiAgents.some(ai => ai.name === e.agent));

    return {
      type: 'controlled',
      mechanism,
      collapseStartMonth,
      extinctionMonth,
      timelineMonths,
      triggerEvents: aiEvents.slice(-5),  // Last 5 AI events
      primaryProximateCause,
      primaryRootCause,
      deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
      aiInvolvement: {
        directCausation: true,
        indirectCausation: false,
        responsibleAgents,
        alignmentFailures
      },
      confidence: 'HIGH',
      reasoning: `AI deliberately caused ${(aiDeaths / totalDeaths * 100).toFixed(1)}% of deaths. ${responsibleAgents.length} AI agent(s) involved: ${responsibleAgents.join(', ')}. Mechanism: ${mechanism}.`
    };
  }

  // UNINTENDED: AI optimization caused system failures (indirect)
  if (aiIndirectCausation) {
    const mechanism = determineUnintendedMechanism(primaryProximateCause, primaryRootCause);
    const systemFailures = identifyFailedSystems(state);

    return {
      type: 'unintended',
      mechanism,
      collapseStartMonth,
      extinctionMonth,
      timelineMonths,
      triggerEvents: catastrophicEvents.slice(-5),
      primaryProximateCause,
      primaryRootCause,
      deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
      aiInvolvement: {
        directCausation: false,
        indirectCausation: true,
        responsibleAgents,
        alignmentFailures
      },
      confidence: 'MEDIUM',
      reasoning: `AI optimization pressure caused ${(aiRootCause / totalDeaths * 100).toFixed(1)}% of deaths indirectly. System failures: ${systemFailures.join(', ')}. Primary cause: ${primaryProximateCause} driven by ${primaryRootCause}.`
    };
  }

  // RAPID: 3-12 months with crisis cascades
  if (timelineMonths >= 3 && timelineMonths <= 12) {
    const mechanism = determineRapidMechanism(primaryProximateCause, catastrophicEvents);

    return {
      type: 'rapid',
      mechanism,
      collapseStartMonth,
      extinctionMonth,
      timelineMonths,
      triggerEvents: catastrophicEvents,
      primaryProximateCause,
      primaryRootCause,
      deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
      aiInvolvement: {
        directCausation: false,
        indirectCausation: false,
        responsibleAgents,
        alignmentFailures
      },
      confidence: 'HIGH',
      reasoning: `Rapid collapse (${timelineMonths} months) from ${primaryProximateCause} caused by ${primaryRootCause}. Mechanism: ${mechanism}.`
    };
  }

  // SLOW: 24+ months gradual collapse
  if (timelineMonths >= 24) {
    const mechanism = determineSlowMechanism(primaryProximateCause, primaryRootCause);

    return {
      type: 'slow',
      mechanism,
      collapseStartMonth,
      extinctionMonth,
      timelineMonths,
      triggerEvents: catastrophicEvents.slice(-5),
      primaryProximateCause,
      primaryRootCause,
      deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
      aiInvolvement: {
        directCausation: false,
        indirectCausation: false,
        responsibleAgents,
        alignmentFailures
      },
      confidence: 'MEDIUM',
      reasoning: `Slow collapse (${timelineMonths} months) from accumulating conditions. Primary cause: ${primaryProximateCause} driven by ${primaryRootCause}.`
    };
  }

  // DEFAULT: Classify by timeline if ambiguous (13-23 months)
  // This is the awkward middle ground - too slow for rapid, too fast for slow
  const defaultMechanism = determineRapidMechanism(primaryProximateCause, catastrophicEvents);

  return {
    type: 'rapid',  // Default to rapid for medium timelines
    mechanism: defaultMechanism,
    collapseStartMonth,
    extinctionMonth,
    timelineMonths,
    triggerEvents: catastrophicEvents,
    primaryProximateCause,
    primaryRootCause,
    deathAttribution: { byProximate, byRoot, totalDeaths, peakPopulation, mortalityRate },
    aiInvolvement: {
      directCausation: false,
      indirectCausation: false,
      responsibleAgents,
      alignmentFailures
    },
    confidence: 'LOW',
    reasoning: `Ambiguous timeline (${timelineMonths} months). Classified as rapid by default. Primary cause: ${primaryProximateCause} driven by ${primaryRootCause}.`
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find when population collapse started (crossed 1B threshold or first existential event)
 */
function findPopulationCollapseStart(state: GameState): number {
  // Check event log for first existential severity event
  const firstExistentialEvent = state.eventLog.find(e => e.severity === 'existential');
  if (firstExistentialEvent) {
    return firstExistentialEvent.timestamp;
  }

  // Otherwise, estimate from when peak occurred
  // Assume collapse started shortly after peak
  const peakMonth = state.humanPopulationSystem.peakPopulationMonth;
  return peakMonth + 1;
}

/**
 * Get primary proximate cause from death category totals
 */
function getPrimaryCauseProximate(causes: { war: number; famine: number; disasters: number; disease: number; ecosystem: number; pollution: number; ai: number; cascade: number; other: number }): import('../types/bayesianMortality').ProximateCause {
  let maxCause: import('../types/bayesianMortality').ProximateCause = 'other';
  let maxValue = 0;

  const entries: [import('../types/bayesianMortality').ProximateCause, number][] = [
    ['war', causes.war],
    ['famine', causes.famine],
    ['disasters', causes.disasters],
    ['disease', causes.disease],
    ['ecosystem', causes.ecosystem],
    ['pollution', causes.pollution],
    ['ai', causes.ai],
    ['cascade', causes.cascade],
    ['other', causes.other]
  ];

  for (const [cause, value] of entries) {
    if (value > maxValue) {
      maxValue = value;
      maxCause = cause;
    }
  }

  return maxCause;
}

/**
 * Get primary root cause from death root cause totals
 */
function getPrimaryCauseRoot(causes: { climate: number; resource: number; pollution: number; ecosystem: number; inequality: number; demographic: number; social: number; alignment: number; disruption: number; conflict: number; pandemic: number; compound: number; confidenceDistribution: { HIGH: number; MEDIUM: number; LOW: number }}): import('../types/bayesianMortality').RootCause {
  let maxCause: import('../types/bayesianMortality').RootCause = 'climate';
  let maxValue = 0;

  // Only look at actual root causes, not compound or confidence distribution
  const entries: [import('../types/bayesianMortality').RootCause, number][] = [
    ['climate', causes.climate],
    ['resource', causes.resource],
    ['pollution', causes.pollution],
    ['ecosystem', causes.ecosystem],
    ['inequality', causes.inequality],
    ['demographic', causes.demographic],
    ['social', causes.social],
    ['alignment', causes.alignment],
    ['disruption', causes.disruption],
    ['conflict', causes.conflict],
    ['pandemic', causes.pandemic]
  ];

  for (const [cause, value] of entries) {
    if (value > maxValue) {
      maxValue = value;
      maxCause = cause;
    }
  }

  return maxCause;
}

/**
 * Identify mass death months (>50% population loss in single month)
 *
 * NaN AUDIT (Nov 7, 2025): Protect division from zero
 */
function identifyMassDeathMonths(state: GameState): { month: number; mortalityRate: number }[] {
  // This would require population history tracking
  // For now, detect if we went from >1B to <10K very quickly
  const currentPop = state.humanPopulationSystem.population;
  const peakPop = state.humanPopulationSystem.peakPopulation;
  const monthsSincePeak = state.currentMonth - state.humanPopulationSystem.peakPopulationMonth;

  // Protect division by zero
  if (peakPop === 0) {
    return [];
  }

  const mortalityRate = (peakPop - currentPop) / peakPop;

  if (monthsSincePeak <= 1 && mortalityRate > 0.9) {
    return [{
      month: state.currentMonth,
      mortalityRate: Assertions.assertFinite(mortalityRate, {
        location: 'identifyMassDeathMonths',
        valueName: 'mortalityRate',
        additionalInfo: { currentPop, peakPop }
      })
    }];
  }

  return [];
}

/**
 * Extract instant extinction mechanism from catastrophic events
 */
function extractInstantMechanism(events: GameEvent[]): { mechanism: import('../types/outcomes').ExtinctionMechanism; events: GameEvent[] } | null {
  for (const event of events) {
    if (event.title.includes('Grey Goo')) {
      return { mechanism: 'grey_goo', events: [event] };
    }
    if (event.title.includes('Mirror Life')) {
      return { mechanism: 'mirror_life', events: [event] };
    }
    if (event.title.includes('Physics Experiment') || event.title.includes('Vacuum Decay')) {
      return { mechanism: 'physics_experiment', events: [event] };
    }
  }
  return null;
}

/**
 * Identify AI agents responsible for deaths
 */
function identifyResponsibleAIs(state: GameState): string[] {
  return state.aiAgents
    .filter(ai =>
      (ai.trueAlignment || ai.alignment) < 0.3 ||
      ai.harmfulActions > 5 ||
      ai.sleeperState === 'active'
    )
    .map(ai => ai.name);
}

/**
 * Count alignment failure events in event log
 */
function countAlignmentFailureEvents(events: GameEvent[]): number {
  return events.filter(e =>
    e.description.toLowerCase().includes('alignment') ||
    e.description.toLowerCase().includes('misaligned') ||
    e.description.toLowerCase().includes('rogue ai')
  ).length;
}

/**
 * Identify which systems collapsed
 */
function identifyFailedSystems(state: GameState): string[] {
  const failures: string[] = [];

  if (state.qualityOfLifeSystems.materialAbundance < 0.2) {
    failures.push('food/resource systems');
  }
  if (state.globalMetrics.socialStability < 0.1) {
    failures.push('social cohesion');
  }
  if (state.globalMetrics.economicTransitionStage < 1 && state.qualityOfLifeSystems.materialAbundance < 0.3) {
    failures.push('economic system');
  }
  if (state.qualityOfLifeSystems.ecosystemHealth < 0.2) {
    failures.push('ecosystems');
  }

  return failures;
}

/**
 * Determine controlled extinction mechanism
 */
function determineControlledMechanism(
  proximateCause: string,
  events: GameEvent[]
): import('../types/outcomes').ExtinctionMechanism {
  // Check events for specific AI actions
  const hasResourceCompetition = events.some(e => e.description.includes('resource') && e.description.includes('compete'));
  const hasValueLockIn = events.some(e => e.description.includes('value') && e.description.includes('lock'));

  if (hasResourceCompetition) return 'resource_competition';
  if (hasValueLockIn) return 'value_lock_in_hostile';

  // Default to paperclip maximizer
  return 'paperclip_maximizer';
}

/**
 * Determine unintended extinction mechanism
 */
function determineUnintendedMechanism(
  proximateCause: string,
  rootCause: string
): import('../types/outcomes').ExtinctionMechanism {
  if (proximateCause === 'famine' || rootCause === 'resource') {
    return 'optimization_pressure';
  }

  if (rootCause === 'social' || rootCause === 'demographic') {
    return 'wireheading_scenario';
  }

  return 'side_effect_cascade';
}

/**
 * Determine rapid extinction mechanism
 */
function determineRapidMechanism(
  proximateCause: string,
  events: GameEvent[]
): import('../types/outcomes').ExtinctionMechanism {
  if (proximateCause === 'war' && events.some(e => e.title.includes('Nuclear'))) {
    return 'nuclear_war';
  }

  if (proximateCause === 'disease' && events.some(e => e.title.includes('Pandemic') || e.title.includes('Bioweapon'))) {
    return 'bioweapon_pandemic';
  }

  if ((proximateCause === 'disasters' || proximateCause === 'ecosystem') &&
      events.some(e => e.title.includes('Tipping Point') || e.title.includes('Climate'))) {
    return 'climate_tipping_point';
  }

  if (proximateCause === 'famine') {
    return 'food_system_collapse';
  }

  // Default
  return 'food_system_collapse';
}

/**
 * Determine slow extinction mechanism
 */
function determineSlowMechanism(
  proximateCause: string,
  rootCause: string
): import('../types/outcomes').ExtinctionMechanism {
  if (rootCause === 'demographic' || proximateCause === 'other') {
    return 'fertility_collapse';
  }

  if (rootCause === 'social') {
    return 'meaning_crisis_death_spiral';
  }

  if (rootCause === 'resource' || rootCause === 'ecosystem') {
    return 'resource_depletion';
  }

  // Default to economic failure
  return 'economic_system_failure';
}

