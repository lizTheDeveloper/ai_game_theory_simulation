/**
 * TIER 2: Synthetic Ecosystem Services Phase
 *
 * Deploys captive breeding + cloning + economic incentives to prevent species extinction.
 *
 * Execution Order: TBD (after environmental crisis detection, before biodiversity collapse)
 *
 * Evidence Quality: 🟢 STRONG
 * Research: Black-footed ferret 18→500 (20 years), cloning breakthrough (2020-2025), vicuña economic incentives
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Recovery time granted: 36-120 months (buy time for ecosystem recovery)
 * - Crisis mitigation: 25-50% (fraction of biodiversity crisis prevented)
 * - Cost per species: Log-Normal μ=17.4, σ=0.8 bounded [$10M, $100M]
 * - Coverage: Keystone 60%, economically valued 85%, charismatic 75%
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';

export class Tier2SyntheticEcosystemsPhase implements SimulationPhase {
  id = 'tier2_synthetic_ecosystems';
  name = 'TIER 2: Synthetic Ecosystem Services';
  order = 19.5; // After environmental updates, before biodiversity crisis

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const ecosystemState = state.tier2Interventions.syntheticEcosystems;
    const params = state.tier2InterventionParameters.syntheticEcosystems;

    // === UNLOCK CONDITIONS ===
    if (!ecosystemState.unlocked) {
      // Unlock when biodiversity crisis emerging + government/society responding
      const biodiversityIndex = state.environmentalAccumulation.biodiversityIndex;
      const biodiversityLoss = 1 - biodiversityIndex; // Convert index to loss
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
      // S-curve deployment over recovery time
      const progressIncrement = 1 / params.recoveryMonths;
      ecosystemState.deploymentProgress = Math.min(1, ecosystemState.deploymentProgress + progressIncrement);

      // Launch programs as deployment progresses
      const targetPrograms = 500; // Target 500 species programs globally
      const currentPrograms = Math.floor(ecosystemState.deploymentProgress * targetPrograms);

      if (currentPrograms > ecosystemState.activePrograms) {
        const newPrograms = currentPrograms - ecosystemState.activePrograms;
        ecosystemState.activePrograms = currentPrograms;

        // Accumulate cost (simplified: average cost per species)
        ecosystemState.totalCostSpent += newPrograms * params.costPerSpecies;
      }

      // Activate when 60% deployed (critical mass reached)
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
      // Update tracking
      ecosystemState.recoveryTimeGranted = params.recoveryMonths;
      ecosystemState.crisisMitigationFraction = params.crisisMitigation * ecosystemState.deploymentProgress;

      // Count keystone species protected (proxy: program count × keystone coverage)
      ecosystemState.keystoneSpeciesProtected = Math.floor(ecosystemState.activePrograms * 0.60);

      // Apply biodiversity crisis mitigation (improve biodiversity index)
      // (Architecture Review M5 - Oct 27, 2025): Only improve if below safe threshold
      if (state.environmentalAccumulation.biodiversityIndex !== undefined) {
        const SAFE_BIODIVERSITY = 0.70; // Research-backed safe planetary boundary
        const currentBiodiversity = state.environmentalAccumulation.biodiversityIndex;

        // Only apply improvement if below safe threshold
        if (currentBiodiversity < SAFE_BIODIVERSITY) {
          const monthlyImprovement = ecosystemState.crisisMitigationFraction * 0.005; // 0.5% monthly at full deployment
          state.environmentalAccumulation.biodiversityIndex = Math.min(
            SAFE_BIODIVERSITY, // Cap at safe level (not overshooting)
            currentBiodiversity + monthlyImprovement
          );
        }
      }

      // Log annual updates
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

    return { events };
  }
}
