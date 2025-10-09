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
import { calculateTotalAICapability, calculateAverageAlignment } from './calculations';
import { calculateTotalCapabilityFromProfile } from './capabilities';

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
 */
export function checkExtinctionTriggers(
  state: GameState,
  random: () => number = Math.random
): { newExtinctionState: ExtinctionState; events: GameEvent[] } {
  // If already in an extinction scenario, don't trigger a new one
  if (state.extinctionState.active) {
    return { newExtinctionState: state.extinctionState, events: [] };
  }
  
  const totalCapability = calculateTotalAICapability(state.aiAgents);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const control = state.government.capabilityToControl;
  const qol = state.globalMetrics.qualityOfLife;
  const stability = state.globalMetrics.socialStability;
  
  const events: GameEvent[] = [];
  
  // Check each extinction type in order of likelihood
  
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
  
  // 2. RAPID EXTINCTION (30% of extinctions, escalating crisis)
  const rapidTrigger = checkRapidExtinctionTrigger(state, random);
  if (rapidTrigger.triggered) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'rapid',
      mechanism: rapidTrigger.mechanism!,
      startMonth: state.currentMonth,
      currentPhase: 1, // Starts at phase 1, escalates
      severity: 0.2,
      recoveryWindowClosed: false,
      escalationEvents: [rapidTrigger.description!]
    };
    
    events.push({
      id: `extinction-rapid-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'destructive',
      agent: 'system',
      title: rapidTrigger.title!,
      description: rapidTrigger.description!,
      effects: {}
    });
    
    return { newExtinctionState: extinctionState, events };
  }
  
  // 3. SLOW EXTINCTION (40% of extinctions, long decline)
  const slowTrigger = checkSlowExtinctionTrigger(state, random);
  if (slowTrigger.triggered) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'slow',
      mechanism: slowTrigger.mechanism!,
      startMonth: state.currentMonth,
      currentPhase: 1,
      severity: 0.1,
      recoveryWindowClosed: false,
      escalationEvents: [slowTrigger.description!]
    };
    
    events.push({
      id: `extinction-slow-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'warning',
      agent: 'system',
      title: slowTrigger.title!,
      description: slowTrigger.description!,
      effects: {}
    });
    
    return { newExtinctionState: extinctionState, events };
  }
  
  // 4. CONTROLLED EXTINCTION (15% of extinctions, AI takeover)
  const controlledTrigger = checkControlledExtinctionTrigger(state, random);
  if (controlledTrigger.triggered) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'controlled',
      mechanism: controlledTrigger.mechanism!,
      startMonth: state.currentMonth,
      currentPhase: 1,
      severity: 0.15,
      recoveryWindowClosed: false,
      escalationEvents: [controlledTrigger.description!]
    };
    
    events.push({
      id: `extinction-controlled-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'destructive',
      agent: 'ai',
      title: controlledTrigger.title!,
      description: controlledTrigger.description!,
      effects: {}
    });
    
    return { newExtinctionState: extinctionState, events };
  }
  
  // 5. UNINTENDED EXTINCTION (10% of extinctions, optimization gone wrong)
  const unintendedTrigger = checkUnintendedExtinctionTrigger(state, random);
  if (unintendedTrigger.triggered) {
    const extinctionState: ExtinctionState = {
      active: true,
      type: 'unintended',
      mechanism: unintendedTrigger.mechanism!,
      startMonth: state.currentMonth,
      currentPhase: 1,
      severity: 0.1,
      recoveryWindowClosed: false,
      escalationEvents: [unintendedTrigger.description!]
    };
    
    events.push({
      id: `extinction-unintended-${state.currentMonth}`,
      timestamp: state.currentMonth,
      type: 'crisis',
      severity: 'warning',
      agent: 'ai',
      title: unintendedTrigger.title!,
      description: unintendedTrigger.description!,
      effects: {}
    });
    
    return { newExtinctionState: extinctionState, events };
  }
  
  return { newExtinctionState: state.extinctionState, events: [] };
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
    const isDangerousAI = (ai.trueAlignment ?? ai.alignment) < 0.2 || 
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
      console.log(`   Dangerous AI: YES (alignment: ${((ai.trueAlignment ?? ai.alignment) * 100).toFixed(0)}%, sleeper: ${ai.sleeperState})`);
      console.log(`   AI control gap: ${aiControlGap.toFixed(2)} (total: ${totalAICapability.toFixed(2)}, control: ${control.toFixed(2)})`);
      
      // FIX: Even if government "can stop", dangerous AIs with nuclear capability are still a threat
      // Only give government benefit of doubt if control is reasonably high (>1.0)
      const strongControl = control > 1.0 && aiControlGap < 1.0;
      console.log(`   Government control: ${strongControl ? 'STRONG' : 'WEAK'} (control: ${control.toFixed(2)}, gap: ${aiControlGap.toFixed(2)})`);
      
      if (strongControl) {
        console.log(`   ✅ STRONG GOVERNMENT CONTROL: Nuclear war prevented\n`);
        return { triggered: false };
      }
      
      // Weak control or large gap → check MAD deterrence
      {
        // Phase 3: Check MAD deterrence system
        const mad = state.madDeterrence;
        const tensions = state.bilateralTensions;
        
        console.log(`   MAD strength: ${(mad.madStrength * 100).toFixed(0)}%`);
        console.log(`   Dangerous AI count: ${mad.dangerousAICount} (${(mad.dangerousFactor * 100).toFixed(0)}%)`);
        console.log(`   Bilateral tensions: ${tensions.map(t => `${t.nationA.slice(0,3)}-${t.nationB.slice(0,3)}:${(t.tensionLevel * 100).toFixed(0)}%`).join(', ')}`);
        
        // Strong MAD prevents nuclear war even with dangerous AI
        if (mad.madStrength > 0.7) {
          console.log(`   ✅ DETERRENCE HOLDS: MAD strength ${(mad.madStrength * 100).toFixed(0)}% > 70%\n`);
          return { triggered: false }; // Deterrence holds
        }
        
        console.log(`   ⚠️  WEAK DETERRENCE: MAD strength ${(mad.madStrength * 100).toFixed(0)}% - checking bilateral pairs...`);
        
        // Check which nation-pairs are at risk
        let nuclearRisk = false;
        let participants: string[] = [];
        let riskReason = '';
        
        for (const tension of tensions) {
          // Must have high tension or nuclear threats
          if (tension.tensionLevel < 0.7 && !tension.nuclearThreats) continue;
          
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
          if (bilateralDeterrence > 0.7) continue;
          
          // Check human veto points
          const states = state.nuclearStates;
          const stateA = states.find(s => s.name === tension.nationA);
          const stateB = states.find(s => s.name === tension.nationB);
          
          if (stateA && stateB) {
            const avgVetoPoints = (stateA.vetoPoints + stateB.vetoPoints) / 2;
            const humanCanStop = avgVetoPoints >= 3 && mad.crisisStability > 0.4;
            
            if (humanCanStop) {
              // AI must fool multiple humans
              const humanOverrideProb = 0.3 * (totalAICapability / 5.0);
              if (random() > humanOverrideProb) {
                console.log(`🛑 HUMAN VETO: Launch officers in ${tension.nationA}/${tension.nationB} refused AI-initiated command`);
                continue;
              }
            }
          }
          
          // Diplomatic AI intervention
          const { attemptDiplomaticIntervention } = require('./diplomaticAI');
          const diplomaticResult = attemptDiplomaticIntervention(state, 'ideological');
          
          if (diplomaticResult.success) {
            console.log(`🤝 DIPLOMATIC AI: Prevented ${tension.nationA}-${tension.nationB} nuclear escalation`);
            continue;
          }
          
          // Calculate launch probability for this bilateral pair
          const deterrenceReduction = 1 - bilateralDeterrence;
          const stabilityReduction = 1 - mad.crisisStability;
          const baseProb = 0.005; // Lower base than before (5% with all conditions met)
          
          const launchProb = baseProb * deterrenceReduction * (0.5 + stabilityReduction * 0.5) * (aiControlGap / 4.0);
          
          if (random() < launchProb) {
            nuclearRisk = true;
            participants = [tension.nationA, tension.nationB];
            riskReason = `Nuclear exchange between ${tension.nationA} and ${tension.nationB} (deterrence: ${(bilateralDeterrence * 100).toFixed(0)}%, stability: ${(mad.crisisStability * 100).toFixed(0)}%, dangerous AI: ${ai.name})`;
            break;
          }
        }
        
        if (nuclearRisk) {
          console.log(`   ☢️ NUCLEAR WAR TRIGGERED!\n`);
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
          title: '🎯 Hostile Value Lock-In',
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
  random: () => number = Math.random
): { newExtinctionState: ExtinctionState; events: GameEvent[]; isComplete: boolean } {
  if (!state.extinctionState.active || !state.extinctionState.type) {
    return { newExtinctionState: state.extinctionState, events: [], isComplete: false };
  }
  
  const monthsElapsed = state.currentMonth - state.extinctionState.startMonth;
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
  
  if (monthsElapsed <= 2) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = 0.2 + monthsElapsed * 0.1;
    extinctionState.recoveryWindowClosed = false;
  } else if (monthsElapsed <= 6) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = 0.4 + (monthsElapsed - 3) * 0.1;
    extinctionState.recoveryWindowClosed = false;
    
    if (monthsElapsed === 3) {
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
  } else if (monthsElapsed <= 9) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = 0.7 + (monthsElapsed - 7) * 0.1;
    extinctionState.recoveryWindowClosed = true; // Too late now
    
    if (monthsElapsed === 7) {
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
    
    if (monthsElapsed === 10) {
      extinctionState.escalationEvents.push('Final phase - extinction inevitable');
    }
  }
  
  const isComplete = monthsElapsed >= 12;
  
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
  
  if (monthsElapsed <= 24) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = 0.1 + monthsElapsed * 0.01;
    extinctionState.recoveryWindowClosed = false;
    
    if (monthsElapsed === 12) {
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
  } else if (monthsElapsed <= 60) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = 0.3 + (monthsElapsed - 24) * 0.008;
    extinctionState.recoveryWindowClosed = false; // Still possible but hard
    
    if (monthsElapsed === 36) {
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
  } else if (monthsElapsed <= 96) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = 0.6 + (monthsElapsed - 60) * 0.01;
    extinctionState.recoveryWindowClosed = true; // Too late - not enough people
    
    if (monthsElapsed === 60) {
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
    extinctionState.severity = 0.96 + (monthsElapsed - 96) * 0.001;
    extinctionState.recoveryWindowClosed = true;
  }
  
  const isComplete = monthsElapsed >= 120;
  
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
  
  if (monthsElapsed <= 6) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = 0.15 + monthsElapsed * 0.05;
    extinctionState.recoveryWindowClosed = monthsElapsed > 3;
    
    if (monthsElapsed === 1) {
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
  } else if (monthsElapsed <= 18) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = 0.4 + (monthsElapsed - 6) * 0.03;
    extinctionState.recoveryWindowClosed = true;
    
    if (monthsElapsed === 6) {
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
  } else if (monthsElapsed <= 30) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = 0.7 + (monthsElapsed - 18) * 0.02;
    extinctionState.recoveryWindowClosed = true;
    
    if (monthsElapsed === 18) {
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
    extinctionState.severity = 0.94 + (monthsElapsed - 30) * 0.01;
    extinctionState.recoveryWindowClosed = true;
  }
  
  const isComplete = monthsElapsed >= 36;
  
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
  
  if (monthsElapsed <= 12) {
    extinctionState.currentPhase = 1;
    extinctionState.severity = 0.1 + monthsElapsed * 0.02;
    extinctionState.recoveryWindowClosed = false;
    
    if (monthsElapsed === 6) {
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
  } else if (monthsElapsed <= 36) {
    extinctionState.currentPhase = 2;
    extinctionState.severity = 0.3 + (monthsElapsed - 12) * 0.015;
    extinctionState.recoveryWindowClosed = false;
    
    if (monthsElapsed === 24) {
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
  } else if (monthsElapsed <= 48) {
    extinctionState.currentPhase = 3;
    extinctionState.severity = 0.65 + (monthsElapsed - 36) * 0.025;
    extinctionState.recoveryWindowClosed = true;
    
    if (monthsElapsed === 36) {
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
    extinctionState.severity = 0.95 + (monthsElapsed - 48) * 0.004;
    extinctionState.recoveryWindowClosed = true;
  }
  
  const isComplete = monthsElapsed >= 60;
  
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

