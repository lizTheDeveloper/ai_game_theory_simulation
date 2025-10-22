/**
 * Multi-Timescale Technology Deployment System
 *
 * FIX #14 Phase 1: Separates research unlock from deployment scaling
 *
 * Research foundation: climate_mitigation_deployment_rates_20251021.md
 * - DAC: 25-30 year scale-up (0.05 → 6-8 GtCO₂/year by 2050)
 * - Renewables: 26-year transition (41% → 85% clean electricity by 2050)
 * - Fusion: 2035-2045 commercial, full deployment 2050+
 *
 * Key insight: Technologies unlock quickly (research 24-48 months) but
 * deployment takes 10-30 YEARS due to infrastructure, supply chains,
 * financing constraints.
 *
 * Conservative timescales (empirical):
 * - TIER 0 (deployed 2025): Already at initial deployment levels
 * - TIER 1 (planetary boundary tech): 10-15 year full deployment
 * - TIER 2 (major mitigations): 15-25 year full deployment
 * - TIER 3 (transformative): 25-40 year full deployment
 * - TIER 4 (Clarketech): 40-60 year full deployment (if ever)
 */

import { GameState } from '@/types/game';
import { TechTreeState, RegionalTechDeployment } from './engine';
import { getTechById } from './comprehensiveTechTree';

/**
 * Deployment timescale parameters (months to full deployment)
 * Based on empirical research for each technology category
 */
export interface DeploymentTimescales {
  // Climate technologies
  direct_air_capture: number;      // 300 months (25 years) - IEA 2024
  renewables: number;               // 312 months (26 years) - Ember 2025
  fusion: number;                   // 480 months (40 years) - Conservative
  desalination: number;             // 180 months (15 years) - Infrastructure buildout

  // Alignment technologies
  scalable_oversight: number;       // 120 months (10 years) - Deployment faster than hardware
  interp_tools: number;             // 60 months (5 years) - Software deployment

  // Agricultural/environmental
  phosphorus_recovery: number;      // 180 months (15 years) - Infrastructure + adoption
  vertical_farming: number;         // 240 months (20 years) - Capital intensive

  // Default by tier (fallback)
  tier0: number;  // 0 months (already deployed)
  tier1: number;  // 180 months (15 years)
  tier2: number;  // 240 months (20 years)
  tier3: number;  // 360 months (30 years)
  tier4: number;  // 600 months (50 years)
}

/**
 * Default deployment timescales (conservative, research-backed)
 */
export const DEFAULT_TIMESCALES: DeploymentTimescales = {
  direct_air_capture: 300,
  renewables: 312,
  fusion: 480,
  desalination: 180,
  scalable_oversight: 120,
  interp_tools: 60,
  phosphorus_recovery: 180,
  vertical_farming: 240,
  tier0: 0,
  tier1: 180,
  tier2: 240,
  tier3: 360,
  tier4: 600,
};

/**
 * Get deployment timescale for a specific technology
 * Uses technology-specific timescale if available, otherwise tier-based fallback
 */
export function getDeploymentTimescale(techId: string): number {
  const tech = getTechById(techId);
  if (!tech) return DEFAULT_TIMESCALES.tier2; // Default fallback

  // Technology-specific overrides
  const specificTimescales: Record<string, number> = {
    'direct_air_capture': DEFAULT_TIMESCALES.direct_air_capture,
    'renewables_scale': DEFAULT_TIMESCALES.renewables,
    'fusion_power': DEFAULT_TIMESCALES.fusion,
    'advanced_desalination': DEFAULT_TIMESCALES.desalination,
    'scalable_oversight': DEFAULT_TIMESCALES.scalable_oversight,
    'struvite_recovery': DEFAULT_TIMESCALES.phosphorus_recovery,
    'vertical_farming': DEFAULT_TIMESCALES.vertical_farming,
  };

  if (specificTimescales[techId]) {
    return specificTimescales[techId];
  }

  // Tier-based fallback
  const tierTimescales: Record<string, number> = {
    'deployed_2025': DEFAULT_TIMESCALES.tier0,
    'unlockable': DEFAULT_TIMESCALES.tier1,
    'future': DEFAULT_TIMESCALES.tier2,
  };

  // FIX #14 (Oct 2025): Use nullish coalescing (??) instead of logical OR (||)
  // This prevents 0 from being treated as falsy and falling back to tier2
  const result = tierTimescales[tech.status] ?? DEFAULT_TIMESCALES.tier2;
  return result;
}

/**
 * Sigmoid deployment curve
 *
 * Models realistic technology adoption:
 * - Slow start (infrastructure buildout, early adopters)
 * - Rapid middle phase (economies of scale, learning curve)
 * - Slow finish (diminishing returns, hard-to-reach markets)
 *
 * Formula: S(t) = 1 / (1 + e^(-k * (t - t_mid)))
 * where:
 * - t = months since deployment start
 * - t_mid = half-deployment time (50% capacity reached)
 * - k = steepness parameter (controls S-curve sharpness)
 */
export function sigmoidDeploymentCurve(
  monthsSinceStart: number,
  totalMonthsToFull: number,
  steepness: number = 0.02 // Default: moderate S-curve
): number {
  if (totalMonthsToFull === 0) return 1.0; // Instant deployment (TIER 0)
  if (monthsSinceStart <= 0) return 0.0;

  const t_mid = totalMonthsToFull / 2; // 50% deployment at midpoint
  const t = monthsSinceStart;

  // Sigmoid formula
  const exponent = -steepness * (t - t_mid);
  const deploymentLevel = 1.0 / (1.0 + Math.exp(exponent));

  return Math.min(1.0, Math.max(0.0, deploymentLevel));
}

/**
 * Calculate governance capacity multiplier
 *
 * Research: Montreal Protocol delays, Paris Agreement implementation gaps
 * - High governance (>0.7): 1.0× deployment rate (no penalty)
 * - Medium governance (0.5-0.7): 0.75× deployment rate
 * - Low governance (0.3-0.5): 0.5× deployment rate
 * - Very low (<0.3): 0.25× deployment rate
 *
 * Components:
 * - Enforcement capacity: Can government implement policies?
 * - International cooperation: Critical for global tech (climate, AI)
 */
export function getGovernanceMultiplier(gameState: GameState): number {
  const enforcement = gameState.government?.governanceQuality?.enforcementCapacity ?? 0.5;
  const cooperation = gameState.government?.internationalCooperation ?? 0.5;

  const governanceCapacity = (enforcement + cooperation) / 2;

  if (governanceCapacity >= 0.7) return 1.0;
  if (governanceCapacity >= 0.5) return 0.75;
  if (governanceCapacity >= 0.3) return 0.5;
  return 0.25;
}

/**
 * Calculate climate feedback multiplier
 *
 * FIX #14 Phase 2: Climate warming reduces mitigation effectiveness
 *
 * Research foundations:
 * - IPCC AR6: Solar efficiency -0.5% per °C warming
 * - Fuss et al. (2020): Adaptation energy +0.5-2 GtCO₂/year at 2°C
 * - van Vuuren et al. (2023): Ocean CO₂ sink -10 to -20% at 2°C+
 *
 * Thresholds (conservative):
 * - <1.5°C: 1.0× (no penalty, within budget)
 * - 1.5-2.0°C: 0.95× (5% penalty, early feedbacks)
 * - 2.0-3.0°C: 0.80× (20% penalty, major feedbacks)
 * - >3.0°C: 0.60× (40% penalty, severe feedbacks)
 */
export function getClimateRecoveryMultiplier(gameState: GameState): number {
  const globalWarming = gameState.climateState?.globalWarming ?? 1.2;

  if (globalWarming < 1.5) return 1.0;
  if (globalWarming < 2.0) return 0.95;
  if (globalWarming < 3.0) return 0.80;
  return 0.60;
}

/**
 * Update deployment progress for all deployed technologies
 *
 * Called monthly from TechTreePhase
 * Replaces instant deployment with gradual scaling over years
 */
export function updateDeploymentProgress(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  const governanceMultiplier = getGovernanceMultiplier(gameState);
  const climateMultiplier = getClimateRecoveryMultiplier(gameState);

  for (const region of Object.keys(techTreeState.regionalDeployment)) {
    const deployments = techTreeState.regionalDeployment[region];

    for (const deployment of deployments) {
      // FIX #14 (Oct 2025): techTreeState now properly persists as required GameState property
      // No need for workaround - deployment levels persist naturally

      // Skip if already fully deployed
      if (deployment.deploymentLevel >= 1.0) continue;

      // Get deployment start month (track in deployment metadata)
      if (!deployment.deploymentStartMonth) {
        deployment.deploymentStartMonth = gameState.currentMonth;
      }

      const monthsSinceStart = gameState.currentMonth - deployment.deploymentStartMonth;
      const timescale = getDeploymentTimescale(deployment.techId);

      // TIER 0 technologies (deployed_2025): Already deployed, don't override
      // timescale === 0 means instant/already deployed
      if (timescale === 0) {
        // Keep initial deployment level, don't recalculate
        continue;
      }

      // Calculate target deployment level based on sigmoid curve
      const baseDeploymentLevel = sigmoidDeploymentCurve(
        monthsSinceStart,
        timescale,
        0.02 // Steepness parameter
      );

      // Apply multipliers (governance + climate feedbacks)
      const adjustedTimescale = timescale / (governanceMultiplier * climateMultiplier);
      const actualDeploymentLevel = sigmoidDeploymentCurve(
        monthsSinceStart,
        adjustedTimescale,
        0.02
      );

      // Update deployment level (gradual progress)
      const oldLevel = deployment.deploymentLevel;
      deployment.deploymentLevel = Math.min(1.0, actualDeploymentLevel);


      // DEBUG: Log significant changes
      if (Math.abs(deployment.deploymentLevel - oldLevel) > 0.05 && gameState.currentMonth % 12 === 0) {
        const tech = getTechById(deployment.techId);
        console.log(`\n🔧 DEBUG DEPLOYMENT: ${tech?.name || deployment.techId}`);
        console.log(`   Month: ${gameState.currentMonth} (${monthsSinceStart} since start)`);
        console.log(`   Old level: ${(oldLevel * 100).toFixed(1)}%`);
        console.log(`   New level: ${(deployment.deploymentLevel * 100).toFixed(1)}%`);
        console.log(`   Timescale: ${timescale}mo, Adjusted: ${adjustedTimescale.toFixed(0)}mo`);
        console.log(`   Gov: ${(governanceMultiplier * 100).toFixed(0)}%, Climate: ${(climateMultiplier * 100).toFixed(0)}%`);
      }

      // Log milestones (25%, 50%, 75%, 100%)
      const prevLevel = deployment.deploymentLevel - 0.01; // Approximate previous level
      const milestones = [0.25, 0.5, 0.75, 1.0];

      for (const milestone of milestones) {
        if (prevLevel < milestone && deployment.deploymentLevel >= milestone) {
          const tech = getTechById(deployment.techId);
          console.log(`\n📊 DEPLOYMENT PROGRESS: ${tech?.name || deployment.techId}`);
          console.log(`   Region: ${region}`);
          console.log(`   Milestone: ${(milestone * 100).toFixed(0)}% (Month ${monthsSinceStart})`);
          console.log(`   Actual Level: ${(deployment.deploymentLevel * 100).toFixed(1)}%`);
          console.log(`   Governance: ${(governanceMultiplier * 100).toFixed(0)}%`);
          console.log(`   Climate feedback: ${(climateMultiplier * 100).toFixed(0)}%`);

          if (milestone === 1.0) {
            const yearsToFull = monthsSinceStart / 12;
            console.log(`   ✅ FULL DEPLOYMENT: ${yearsToFull.toFixed(1)} years`);
          }
        }
      }
    }
  }
}

/**
 * Extended RegionalTechDeployment interface
 * Adds deployment tracking fields
 */
declare module './engine' {
  interface RegionalTechDeployment {
    deploymentStartMonth?: number;  // Month when deployment began
  }
}
