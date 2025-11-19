/**
 * Novel Entities Remediation Effectiveness Calculator
 *
 * CRITICAL FIX (Nov 13, 2025): Prevention >> Cleanup (Ling 2024, Cousins 2022)
 *
 * Research findings:
 * - Ling et al. (2024): $20-7,000 trillion/year steady-state cleanup at current emissions
 * - Cousins et al. (2022): PFAS in ALL rainwater globally (atmospheric distribution)
 * - Dodds et al. (2024): Montreal Protocol 90-95% via production ban, 5-10% via bank destruction
 *
 * Key insight: Without production controls, planetary-scale cleanup is thermodynamically futile.
 * You refill contamination as fast as you clean it. Prevention must gate remediation effectiveness.
 *
 * @module novelEntitiesEffectiveness
 */

import { GameState } from '@/types/game';
import { assertFinite, assertProbability } from './assertions';

/**
 * Calculate gated effectiveness for Novel Entities remediation technologies
 *
 * MECHANISM: Regulation multiplier gates remediation effectiveness
 * - Without prevention tech: 1% effectiveness (point sources only - concentrated wastewater)
 * - With all prevention tech: 100% effectiveness (production controlled, cleanup works)
 * - Prevention:Remediation ratio = 10:1 to 20:1 (Montreal Protocol analog)
 *
 * RESEARCH BASIS:
 * - VERIFIED: Ling et al. 2024 ($20-7,000 trillion/year cleanup cost at current emissions)
 * - CALCULATED: Montreal Protocol 10:1 ratio (Dodds et al. 2024 - 90-95% ban vs 5-10% destruction)
 * - DERIVED ASSUMPTION: 30% rebound effect (moral hazard - theory suggests 20-80% range)
 * - DERIVED ASSUMPTION: 0.001 concentration multiplier for dilute streams (may be optimistic per Newell 2025)
 *
 * @param tech - Technology node being deployed
 * @param state - Current game state
 * @param rng - Deterministic RNG function (REQUIRED for reproducibility)
 * @returns Gated effectiveness [0, 1] - final effectiveness after all multipliers
 */
export function calculateNovelEntitiesRemediationEffectiveness(
  tech: any,
  state: GameState,
  rng: () => number
): number {
  // ========================================================================
  // CRITICAL-3 FIX (Nov 7, 2025): Fail-loudly RNG validation
  // Silent Math.random fallbacks break Monte Carlo reproducibility
  // ========================================================================
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for deterministic simulation (calculateNovelEntitiesRemediationEffectiveness)`
    );
  }

  // Base effectiveness from tech definition
  const baseEffectiveness = tech.effects?.pollutionReduction || 0.0;

  // ========================================================================
  // 1. REGULATION GATING (CRITICAL)
  // Without production controls, cleanup is futile (refills as fast as you clean)
  // ========================================================================

  // Check which prevention technologies are deployed
  // RESEARCH: Montreal Protocol analog - prevention 10-20× more effective than cleanup
  // CALCULATED: Dodds et al. 2024 (production ban 90-95%, bank destruction 5-10%)
  const pfasBanDeployed = checkTechDeployed(state, 'global_pfas_ban');
  const plasticPhaseoutDeployed = checkTechDeployed(state, 'plastic_production_phaseout');
  const substitutionDeployed = checkTechDeployed(state, 'green_chemistry_substitution');

  // Weight prevention techs by their emission reduction impact
  // PFAS ban (99% reduction) = 50% weight (dominant)
  // Plastic phaseout (80% reduction) = 30% weight
  // Chemical substitution (70% reduction) = 20% weight
  const regulationLevel = (
    (pfasBanDeployed ? 0.5 : 0.0) +        // 50% weight (PFAS is worst offender)
    (plasticPhaseoutDeployed ? 0.3 : 0.0) + // 30% weight (plastic is pervasive)
    (substitutionDeployed ? 0.2 : 0.0)      // 20% weight (chemical substitution)
  );

  // Minimum 1% effectiveness = point sources only (concentrated wastewater, industrial sites)
  // RESEARCH: Ling et al. 2024 - $20-7,000 trillion/year for steady-state planetary cleanup
  // Point source cleanup is feasible (mg/L concentrations), but ambient cleanup (ng/L) is not
  const regulationMultiplier = Math.max(0.01, regulationLevel);

  // ========================================================================
  // 2. ENERGY CONSTRAINT (OPTIONAL - graceful degradation if energy data unavailable)
  // Thermodynamic trap: Cleanup requires massive energy
  // ========================================================================

  // RESEARCH: Li et al. 2024 (5-7 kWh/m³ electrochemical treatment)
  // RESEARCH: Ling et al. 2024 (thermal destruction 850-1200°C, energy-intensive)
  let energyMultiplier = 1.0;

  // NOTE: Energy constraint is OPTIONAL - only apply if power generation data available
  // This gracefully degrades if energy system not fully modeled yet
  if (tech.energyRequirement && state.powerGenerationSystem) {
    const totalGen = state.powerGenerationSystem.totalElectricityGeneration || 0; // TWh/year
    const renewablePct = state.powerGenerationSystem.renewablePercentage || 0; // [0,1]
    const renewableSurplus = totalGen * renewablePct; // TWh/year

    const energyRequired = tech.energyRequirement.totalTWhPerYear ||
                         tech.energyRequirement.annualTWhRequired || 0; // TWh/year

    if (energyRequired > 0 && renewableSurplus > 0) {
      energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);
    }
  }
  // If energy data not available, skip constraint (don't break simulation)

  // ========================================================================
  // 3. CONCENTRATION FACTOR (CRITICAL)
  // Lab scale (mg/L) vs environmental scale (pg/L to ng/L = 10^6-10^9× dilution)
  // ========================================================================

  // RESEARCH: Li et al. 2024 (12-47× cost scaling for dilute streams)
  // RESEARCH: Newell et al. 2025 ("sub-nanogram per litre cost-effectiveness hinders up-scalability")
  // DERIVED ASSUMPTION: 0.1% effectiveness for dilute streams (CONSERVATIVE - may be optimistic)
  const worksOnDiluteStreams = tech.techType === 'cleanup' && !tech.minimumConcentration;
  const concentrationMultiplier = worksOnDiluteStreams ? 0.001 : 1.0;
  // 0.1% effectiveness = environmental/ocean cleanup (ultra-dilute)
  // 100% effectiveness = point source cleanup (concentrated streams)

  // ========================================================================
  // 4. TIME LAG (CRITICAL - DIFFERENTIATED)
  // Prevention (10-20yr) vs Remediation (30-50yr)
  // ========================================================================

  // VALIDATION REQUIREMENT (Sylvia Grade B+): Differentiate time lags
  // Prevention tech (bans): 10-20 years (Montreal Protocol did 12 years)
  // Remediation tech (infrastructure): 30-50 years (massive scale-up)
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);

  // Default 30 years for remediation if not specified
  // (Prevention tech uses deploymentMonthsRequired from tech definition)
  const timeLagMonths = tech.timeLag || tech.deploymentMonthsRequired || (30 * 12);
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / timeLagMonths);

  // ========================================================================
  // 5. REBOUND EFFECTS (Jevons Paradox)
  // Cleanup success → increased production (moral hazard)
  // ========================================================================

  // RESEARCH: UNEP 2024 (waste +81% despite tech - circular economy rebound)
  // RESEARCH: Sorrell et al. 2025 (AI hardware efficiency → increased deployment)
  // DERIVED ASSUMPTION: 30% offset (CONSERVATIVE - theory suggests 20-80% range)
  //
  // If cleanup works well, industries may relax pollution controls ("we can just clean it up")
  // This is a moral hazard that offsets remediation effectiveness
  const triggersRebound = tech.techType === 'cleanup' && regulationLevel < 0.8;
  const reboundFactor = triggersRebound ? 0.7 : 1.0; // 30% offset by induced production

  // ========================================================================
  // FINAL EFFECTIVENESS CALCULATION
  // ========================================================================

  const finalEffectiveness = baseEffectiveness *
    regulationMultiplier *
    energyMultiplier *
    concentrationMultiplier *
    timeLagFactor *
    reboundFactor;

  // Assertions (fail-loudly, no silent fallbacks)
  return assertProbability(finalEffectiveness, {
    location: 'calculateNovelEntitiesRemediationEffectiveness',
    valueName: 'finalEffectiveness',
    month: state.currentMonth,
    additionalInfo: {
      techId: tech.id,
      baseEffectiveness,
      regulationMultiplier,
      energyMultiplier,
      concentrationMultiplier,
      timeLagFactor,
      reboundFactor,
      // Debug info for troubleshooting
      preventionTech: {
        pfasBan: pfasBanDeployed,
        plasticPhaseout: plasticPhaseoutDeployed,
        substitution: substitutionDeployed
      }
    }
  });
}

/**
 * Check if a technology is deployed in the game state
 *
 * @param state - Current game state
 * @param techId - Technology ID to check
 * @returns true if tech is unlocked and deployed (deploymentLevel > 0.5)
 */
function checkTechDeployed(state: GameState, techId: string): boolean {
  // Tech tree system stores deployments in regionalDeployment
  // Check if tech is deployed in ANY region with significant deployment level
  if (!state.techTreeState?.regionalDeployment) {
    return false;
  }

  // Iterate through all regions
  for (const region in state.techTreeState.regionalDeployment) {
    const deployments = state.techTreeState.regionalDeployment[region];
    if (!deployments) continue;

    // Check if tech is deployed in this region
    for (const deployment of deployments) {
      if (deployment.techId === techId && (deployment.deploymentLevel || 0) > 0.5) {
        // Consider tech "deployed" if deploymentLevel > 50% in ANY region
        // (Prevention tech like PFAS bans need global coordination, but even regional is progress)
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate prevention tech effectiveness on emission flow
 *
 * This is simpler than remediation - prevention works once production is controlled.
 * No concentration/energy constraints apply to bans (they're regulatory, not technical).
 *
 * @param tech - Prevention technology node
 * @param state - Current game state
 * @param rng - Deterministic RNG function
 * @returns Effectiveness [0, 1] - only gated by time lag
 */
export function calculateNovelEntitiesPreventionEffectiveness(
  tech: any,
  state: GameState,
  rng: () => number
): number {
  // RNG validation (consistency with remediation function)
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for deterministic simulation (calculateNovelEntitiesPreventionEffectiveness)`
    );
  }

  const baseEmissionReduction = tech.effects?.novelEntitiesEmissionReduction || 0.0;

  // Prevention only gated by time lag (regulatory implementation time)
  // No energy/concentration constraints (it's a ban, not a technical process)
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);
  const timeLagMonths = tech.deploymentMonthsRequired || (15 * 12); // Default 15 years
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / timeLagMonths);

  const finalEmissionReduction = baseEmissionReduction * timeLagFactor;

  return assertProbability(finalEmissionReduction, {
    location: 'calculateNovelEntitiesPreventionEffectiveness',
    valueName: 'finalEmissionReduction',
    month: state.currentMonth,
    additionalInfo: {
      techId: tech.id,
      baseEmissionReduction,
      timeLagFactor,
      monthsSinceDeployment,
      timeLagMonths
    }
  });
}
