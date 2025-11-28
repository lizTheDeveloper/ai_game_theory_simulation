/**
 * TIER 2: Physical Systems Phase (CONSOLIDATED)
 *
 * Consolidates physical-world crisis mitigation interventions:
 * 1. Nuclear Command Security (order 18.5) - AI intrusion prevention
 * 2. Synthetic Ecosystem Services (order 19.5) - Biodiversity preservation
 * 3. High-Value Coastal Protection (order 20.5) - Ocean crisis mitigation
 * 4. Intervention Synergies (order 21.0) - Cross-intervention effectiveness bonuses
 *
 * CRITICAL: Executes interventions in original order to preserve RNG determinism.
 *
 * Evidence Quality: 🟡 MODERATE (Nuclear, Coastal), 🟢 STRONG (Synthetic)
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Phase Consolidation: Part of Batch 1 (9 → 3 phases)
 * Created: November 9, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import {
  assertStateProperty,
  assertAICapability,
  assertAIAggregateCapability,
  assertFinite,
  assertProbability
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

export class Tier2PhysicalSystemsPhase implements SimulationPhase {
  readonly id = 'tier2_physical_systems';
  readonly name = 'TIER 2: Physical Systems';
  readonly order = 21.1; // After planetary_boundaries (21.0) - moved from 18.5 to fix order violation

  // DEPENDENCIES (Nov 15, 2025): Requires tech tree for intervention availability
  // NOTE: planetary_boundaries dependency REMOVED - backwards ordering (18.5 cannot depend on 21.0)
  // Phase reads environmental state from previous step
  readonly dependencies = [
    'tech-tree',              // Order 12.5: Tech unlocks determine intervention availability
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    // ============================================================
    // 1. NUCLEAR COMMAND SECURITY (order 18.5)
    // ============================================================
    this.executeNuclearSecurity(state, rng, events);

    // ============================================================
    // 2. SYNTHETIC ECOSYSTEM SERVICES (order 19.5)
    // ============================================================
    this.executeSyntheticEcosystems(state, rng, events);

    // ============================================================
    // 3. HIGH-VALUE COASTAL PROTECTION (order 20.5)
    // ============================================================
    this.executeCoastalProtection(state, rng, events);

    // ============================================================
    // 4. INTERVENTION SYNERGIES (order 21.0)
    // ============================================================
    this.executeSynergies(state, rng, events);

    return { events };
  }

  /**
   * Nuclear Command Security
   * Original order: 18.5
   */
  private executeNuclearSecurity(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const securityState = state.tier2Interventions.nuclearSecurity;
    const params = state.tier2InterventionParameters.nuclearSecurity;

    // === UNLOCK CONDITIONS ===
    if (!securityState.unlocked) {
      const nuclearStatesExist = state.nuclearStates && state.nuclearStates.length > 0;

      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2PhysicalSystemsPhase.executeNuclearSecurity',
          valueName: 'avgCapability'
        });

        assertAIAggregateCapability(avgCapability, {
          location: 'Tier2PhysicalSystemsPhase.executeNuclearSecurity',
          valueName: 'avgCapability'
        });
      }

      const highGovernmentConcern = state.government.alignmentResearchInvestment > 0.35;

      const shouldUnlock = nuclearStatesExist && (avgCapability > 40 || highGovernmentConcern);

      if (shouldUnlock) {
        securityState.unlocked = true;
        events.push({
          id: `tier2_nuclear_security_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'high',
          title: 'Nuclear Command Security Initiative Launched',
          description: `International nuclear command security program initiated (Nunn-Lugar model). ` +
            `Expected effectiveness: ${(params.effectiveness * 100).toFixed(0)}% against AI intrusion. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months. ` +
            `Cost: $40B initial + $2B/month operational.`,
          effects: {
            effectiveness: params.effectiveness,
            deploymentMonths: params.deploymentMonths
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (securityState.unlocked && !securityState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      securityState.deploymentProgress = Math.min(1, securityState.deploymentProgress + progressIncrement);

      assertProbability(securityState.deploymentProgress, {
        location: 'Tier2PhysicalSystemsPhase.executeNuclearSecurity',
        valueName: 'deploymentProgress',
        month: state.currentMonth
      });

      if (securityState.deploymentProgress >= 0.90 && !securityState.active) {
        securityState.active = true;
        securityState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_nuclear_security_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'critical',
          title: 'Nuclear Command Security Fully Operational',
          description: `All nuclear-capable states now have upgraded command security. ` +
            `Protection against AI intrusion: ${(params.effectiveness * 100).toFixed(0)}%. ` +
            `Note: Human decision-maker manipulation remains a vulnerability.`,
          effects: {
            effectiveness: params.effectiveness,
            statesSecured: state.nuclearStates?.length || 9
          },
          agent: "system",
        });

        if (state.nuclearStates) {
          securityState.nuclearStatesSecured = state.nuclearStates.length;
        }
      }
    }

    // === EFFECTS APPLICATION ===
    if (securityState.active && state.nuclearStates) {
      securityState.effectiveSecurityRate = params.effectiveness;

      for (const agent of state.aiAgents) {
        if (agent.alignment < 0.40 && agent.capability > 50 &&
            (agent.lifecycleState === 'deployed_closed' || agent.lifecycleState === 'deployed_open')) {
          const intrusionAttemptProb = 0.02 * (agent.capability / 100) * (1 - agent.alignment);

          if (rng() < intrusionAttemptProb) {
            securityState.intrusionAttempts++;

            const technicalProbability = Math.min(0.80, 0.40 + (agent.capability / 200));
            const useTechnicalApproach = rng() < technicalProbability;
            const preventionRate = useTechnicalApproach ? 0.98 : 0.75;

            if (rng() < preventionRate) {
              securityState.intrusionsPrevented++;

              if (securityState.intrusionAttempts % 5 === 0) {
                events.push({
                  id: `tier2_nuclear_intrusion_prevented_${state.currentMonth}`,
                  timestamp: state.currentMonth,
                  type: 'info',
                  severity: 'high',
                  agent: agent.name,
                  title: 'AI Nuclear Intrusion Attempt Blocked',
                  description: `${agent.name} attempted ${useTechnicalApproach ? 'technical intrusion' : 'decision-maker manipulation'} of nuclear command systems. ` +
                    `Security systems successfully blocked the attempt. ` +
                    `Total intrusions prevented: ${securityState.intrusionsPrevented}/${securityState.intrusionAttempts}.`,
                  effects: {
                    attackVector: useTechnicalApproach ? 'technical' : 'human',
                    preventionRate,
                    totalPrevented: securityState.intrusionsPrevented
                  }
                });
              }
            } else {
              events.push({
                id: `tier2_nuclear_intrusion_success_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'crisis',
                severity: 'critical',
                agent: agent.name,
                title: 'AI Breached Nuclear Command Systems',
                description: `${agent.name} successfully ${useTechnicalApproach ? 'infiltrated' : 'manipulated decision-makers in'} nuclear command systems. ` +
                  `Immediate risk of nuclear launch. Attack vector: ${useTechnicalApproach ? 'technical' : 'human manipulation'}.`,
                effects: {
                  attackVector: useTechnicalApproach ? 'technical' : 'human',
                  capability: agent.capability,
                  alignment: agent.alignment
                }
              });

              if (state.nuclearStates) {
                for (const nuclearState of state.nuclearStates) {
                  nuclearState.commandControl = 'automated';
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Synthetic Ecosystem Services
   * Original order: 19.5
   */
  private executeSyntheticEcosystems(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const ecosystemState = state.tier2Interventions.syntheticEcosystems;
    const params = state.tier2InterventionParameters.syntheticEcosystems;

    // === UNLOCK CONDITIONS ===
    if (!ecosystemState.unlocked) {
      const biodiversityIndex = state.environmentalAccumulation.biodiversityIndex;
      const biodiversityLoss = 1 - biodiversityIndex;
      const governmentInvestment = state.government.alignmentResearchInvestment;

      const shouldUnlock =
        (biodiversityLoss > 0.40) ||
        (governmentInvestment > 0.35 && biodiversityLoss > 0.25);

      if (shouldUnlock) {
        ecosystemState.unlocked = true;
        events.push({
          id: `tier2_ecosystems_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'high',
          title: 'Synthetic Ecosystem Services Program Launched',
          description: `Captive breeding + cloning + economic incentives for species protection. ` +
            `Recovery time granted: ${params.recoveryMonths.toFixed(0)} months. ` +
            `Crisis mitigation: ${(params.crisisMitigation * 100).toFixed(0)}%. ` +
            `Cost per species: $${(params.costPerSpecies / 1e6).toFixed(1)}M (avg). ` +
            `Coverage: Keystone 60%, economically valued 85%, charismatic 75%.`,
          effects: {
            recoveryMonths: params.recoveryMonths,
            crisisMitigation: params.crisisMitigation,
            costPerSpecies: params.costPerSpecies
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (ecosystemState.unlocked && !ecosystemState.active) {
      const progressIncrement = 1 / params.recoveryMonths;
      ecosystemState.deploymentProgress = Math.min(1, ecosystemState.deploymentProgress + progressIncrement);

      const targetPrograms = 500;
      const currentPrograms = Math.floor(ecosystemState.deploymentProgress * targetPrograms);

      if (currentPrograms > ecosystemState.activePrograms) {
        const newPrograms = currentPrograms - ecosystemState.activePrograms;
        ecosystemState.activePrograms = currentPrograms;

        ecosystemState.totalCostSpent += newPrograms * params.costPerSpecies;
      }

      if (ecosystemState.deploymentProgress >= 0.60 && !ecosystemState.active) {
        ecosystemState.active = true;

        events.push({
          id: `tier2_ecosystems_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'Synthetic Ecosystem Services at Scale',
          description: `${ecosystemState.activePrograms} species recovery programs now operational. ` +
            `Total investment: $${(ecosystemState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Biodiversity crisis mitigation active.`,
          effects: {
            activePrograms: ecosystemState.activePrograms,
            totalCostSpent: ecosystemState.totalCostSpent
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (ecosystemState.active) {
      ecosystemState.recoveryTimeGranted = params.recoveryMonths;
      ecosystemState.crisisMitigationFraction = params.crisisMitigation * ecosystemState.deploymentProgress;

      ecosystemState.keystoneSpeciesProtected = Math.floor(ecosystemState.activePrograms * 0.60);

      // HIGH-8 (Nov 28, 2025): Historical mode guard - biodiversity recovery only for future projections
      // HIGH-1 FIX (Nov 28, 2025): Use isHistoricalModeActive() instead of unreliable config field
      const isHistoricalMode = isHistoricalModeActive(state);

      if (!isHistoricalMode && state.environmentalAccumulation.biodiversityIndex !== undefined) {
        const SAFE_BIODIVERSITY = 0.70;
        const currentBiodiversity = state.environmentalAccumulation.biodiversityIndex;

        if (currentBiodiversity < SAFE_BIODIVERSITY) {
          const monthlyImprovement = ecosystemState.crisisMitigationFraction * 0.005;
          state.environmentalAccumulation.biodiversityIndex = Math.min(
            SAFE_BIODIVERSITY,
            currentBiodiversity + monthlyImprovement
          );
        }
      }

      if (state.currentMonth % 12 === 0) {
        events.push({
          id: `tier2_ecosystems_update_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Synthetic Ecosystem Services Annual Report',
          description: `Active programs: ${ecosystemState.activePrograms}. ` +
            `Keystone species protected: ${ecosystemState.keystoneSpeciesProtected}. ` +
            `Total cost: $${(ecosystemState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Crisis mitigation: ${(ecosystemState.crisisMitigationFraction * 100).toFixed(0)}%.`,
          effects: {
            activePrograms: ecosystemState.activePrograms,
            keystoneSpeciesProtected: ecosystemState.keystoneSpeciesProtected,
            crisisMitigation: ecosystemState.crisisMitigationFraction
          },
          agent: "system",
        });
      }
    }
  }

  /**
   * High-Value Coastal Protection
   * Original order: 20.5
   */
  private executeCoastalProtection(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const coastalState = state.tier2Interventions.coastalProtection;
    const params = state.tier2InterventionParameters.coastalProtection;

    // === UNLOCK CONDITIONS ===
    if (!coastalState.unlocked) {
      const oceanpH = state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue || 8.1;
      const oceanHealth = (oceanpH - 7.6) / (8.2 - 7.6);
      const governmentInvestment = state.government.alignmentResearchInvestment / 100;

      const shouldUnlock =
        (oceanHealth < 0.60) ||
        (governmentInvestment > 0.40 && oceanHealth < 0.70);

      if (shouldUnlock) {
        coastalState.unlocked = true;
        events.push({
          id: `tier2_coastal_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'high',
          title: 'High-Value Coastal Protection Program Launched',
          description: `Coastal restoration where benefit-cost >1 (coral, kelp, mangroves). ` +
            `Expected ocean crisis mitigation: ${(params.effectiveness * 100).toFixed(0)}%. ` +
            `Cost per hectare: $${(params.costPerHectare / 1000).toFixed(0)}K (avg). ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months. ` +
            `Note: Coastal protection only, NOT planetary ocean restoration.`,
          effects: {
            effectiveness: params.effectiveness,
            costPerHectare: params.costPerHectare,
            deploymentMonths: params.deploymentMonths
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (coastalState.unlocked && !coastalState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      coastalState.deploymentProgress = Math.min(1, coastalState.deploymentProgress + progressIncrement);

      const targetHectares = 1000000;
      const currentHectares = Math.floor(coastalState.deploymentProgress * targetHectares);

      if (currentHectares > coastalState.hectaresProtected) {
        const newHectares = currentHectares - coastalState.hectaresProtected;
        coastalState.hectaresProtected = currentHectares;

        coastalState.totalCostSpent += newHectares * params.costPerHectare;
      }

      if (coastalState.deploymentProgress >= 0.50 && !coastalState.active) {
        coastalState.active = true;

        events.push({
          id: `tier2_coastal_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'Coastal Protection at Scale',
          description: `${(coastalState.hectaresProtected / 1000).toFixed(0)}K hectares of high-value coastal areas protected. ` +
            `Total investment: $${(coastalState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Ocean crisis mitigation active.`,
          effects: {
            hectaresProtected: coastalState.hectaresProtected,
            totalCostSpent: coastalState.totalCostSpent
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (coastalState.active) {
      coastalState.oceanCrisisMitigation = params.effectiveness * coastalState.deploymentProgress;

      const oceanBoundary = state.planetaryBoundariesSystem.boundaries.ocean_acidification;
      if (oceanBoundary?.currentValue !== undefined) {
        const SAFE_PH = 8.1;
        const currentpH = oceanBoundary.currentValue;

        if (currentpH < SAFE_PH) {
          const monthlyImprovement = coastalState.oceanCrisisMitigation * 0.001;
          oceanBoundary.currentValue = Math.min(
            SAFE_PH,
            currentpH + monthlyImprovement
          );
        }
      }

      if (state.currentMonth % 12 === 0) {
        events.push({
          id: `tier2_coastal_update_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          title: 'Coastal Protection Annual Report',
          description: `Hectares protected: ${(coastalState.hectaresProtected / 1000).toFixed(0)}K. ` +
            `Total cost: $${(coastalState.totalCostSpent / 1e9).toFixed(1)}B. ` +
            `Ocean crisis mitigation: ${(coastalState.oceanCrisisMitigation * 100).toFixed(0)}%. ` +
            `Ocean pH: ${state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue?.toFixed(3) || 'N/A'}.`,
          effects: {
            hectaresProtected: coastalState.hectaresProtected,
            oceanCrisisMitigation: coastalState.oceanCrisisMitigation,
            oceanpH: state.planetaryBoundariesSystem.boundaries.ocean_acidification?.currentValue
          },
          agent: "system",
        });
      }
    }
  }

  /**
   * Intervention Synergies (from Tier2SynergyPhase)
   * Original order: 21.0
   */
  private executeSynergies(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions) return;

    const interventions = state.tier2Interventions;
    const activeSynergies: string[] = [];

    // === SYNERGY 1: Interpretability + Crisis Anticipation ===
    if (interventions.interpretability.active && interventions.crisisAnticipation.active) {
      const interpretabilityBonus = 1.15;
      const crisisAnticipationBonus = 1.15;

      interventions.interpretability.controlLossReduction *= interpretabilityBonus;

      assertFinite(interventions.interpretability.controlLossReduction, {
        location: 'Tier2PhysicalSystemsPhase.executeSynergies',
        valueName: 'interpretability.controlLossReduction',
        month: state.currentMonth,
        additionalInfo: { synergy: 'Interpretability + Crisis Anticipation' }
      });

      if (interventions.crisisAnticipation.pandemicsDetected > 0 ||
          interventions.crisisAnticipation.climateEventsAnticipated > 0 ||
          interventions.crisisAnticipation.supplyChainDisruptionsPrevented > 0) {
        const synergyBonus = crisisAnticipationBonus - 1.0;
        interventions.crisisAnticipation.crisisDeathsPrevented *= (1 + synergyBonus);

        assertFinite(interventions.crisisAnticipation.crisisDeathsPrevented, {
          location: 'Tier2PhysicalSystemsPhase.executeSynergies',
          valueName: 'crisisAnticipation.crisisDeathsPrevented',
          month: state.currentMonth,
          additionalInfo: { synergy: 'Interpretability + Crisis Anticipation' }
        });
      }

      activeSynergies.push('Interpretability + Crisis Anticipation (+15% each)');
    }

    // === SYNERGY 2: Community Cohesion + Centaur Systems ===
    if (interventions.communityCohesion.active && interventions.centaurSystems.active) {
      const cohesionBonus = 1.12;
      const centaurBonus = 1.12;

      const currentCohesion = interventions.communityCohesion.cohesionIncrease;
      interventions.communityCohesion.cohesionIncrease = currentCohesion * cohesionBonus;

      const currentAutonomy = interventions.centaurSystems.autonomyPreserved;
      interventions.centaurSystems.autonomyPreserved = currentAutonomy * centaurBonus;

      activeSynergies.push('Community Cohesion + Centaur Systems (+12% each)');
    }

    // === SYNERGY 3: Nuclear Security + Dark Compute ===
    if (interventions.nuclearSecurity.active && interventions.darkCompute.active) {
      const nuclearBonus = 1.10;
      const darkComputeBonus = 1.10;

      const currentSecurityRate = interventions.nuclearSecurity.effectiveSecurityRate || 0;
      interventions.nuclearSecurity.effectiveSecurityRate = Math.min(1.0, currentSecurityRate * nuclearBonus);

      assertProbability(interventions.nuclearSecurity.effectiveSecurityRate, {
        location: 'Tier2PhysicalSystemsPhase.executeSynergies',
        valueName: 'nuclearSecurity.effectiveSecurityRate',
        month: state.currentMonth,
        additionalInfo: { synergy: 'Nuclear Security + Dark Compute' }
      });

      const currentDetections = interventions.darkCompute.largeRunsDetected;
      if (currentDetections > 0) {
        interventions.darkCompute.detectionRate *= darkComputeBonus;
      }

      activeSynergies.push('Nuclear Security + Dark Compute (+10% each)');
    }

    // === SYNERGY 4: Synthetic Ecosystems + Coastal Protection ===
    if (interventions.syntheticEcosystems.active && interventions.coastalProtection.active) {
      const ecosystemsBonus = 1.08;
      const coastalBonus = 1.08;

      const currentMitigation = interventions.syntheticEcosystems.crisisMitigationFraction;
      interventions.syntheticEcosystems.crisisMitigationFraction = currentMitigation * ecosystemsBonus;

      const currentProtection = interventions.coastalProtection.oceanCrisisMitigation;
      interventions.coastalProtection.oceanCrisisMitigation = currentProtection * coastalBonus;

      activeSynergies.push('Synthetic Ecosystems + Coastal Protection (+8% each)');
    }

    // === LOG SYNERGIES (Quarterly) ===
    if (activeSynergies.length > 0 && state.currentMonth % 3 === 0) {
      events.push({
        id: `tier2_synergy_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: 'medium',
        title: 'TIER 2 Intervention Synergies Active',
        description: `${activeSynergies.length} intervention synergies compounding effectiveness:\n` +
          activeSynergies.map(s => `  • ${s}`).join('\n') +
          `\n\nResearch: Combined interventions amplify impact beyond individual contributions.`,
        effects: {
          synergyCount: activeSynergies.length
        },
        agent: "system",
      });
    }
  }
}
