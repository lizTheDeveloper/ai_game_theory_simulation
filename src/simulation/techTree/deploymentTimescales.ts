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
import { addSimulationEvent } from '../utils/eventLogger';
import { assertStateProperty } from '@/simulation/utils/assertions';

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
  // Access nested object properties - governanceQuality is always initialized
  const govQuality = gameState.government.governanceQuality;
  const enforcement = assertStateProperty(govQuality, 'institutionalCapacity', {
    location: 'getGovernanceMultiplier',
    month: gameState.currentMonth
  });
  const structuralChoices = gameState.government.structuralChoices;
  const cooperation = structuralChoices.internationalCoordination ? 1.0 : 0.5;

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
  // Access nested path - these objects are always initialized
  const pbs = gameState.planetaryBoundariesSystem;
  const climateChange = pbs.boundaries['climate_change'];  // Note: snake_case key
  const globalWarming = assertStateProperty(climateChange, 'currentValue', {
    location: 'getClimateRecoveryMultiplier',
    month: gameState.currentMonth
  });

  if (globalWarming < 1.5) return 1.0;
  if (globalWarming < 2.0) return 0.95;
  if (globalWarming < 3.0) return 0.80;
  return 0.60;
}

/**
 * Calculate investment multiplier for technology deployment
 *
 * FIX #14 Phase 5: Investment-Deployment Linkage
 *
 * Research foundations:
 * - IEA ETP 2024: $3.5T/year needed for net-zero by 2050
 * - McKinsey 2024: Current global climate investment $1.4T/year (40% of required)
 * - Hainsch et al. (2022): Investment gap is primary deployment bottleneck
 *
 * Scaling:
 * - $0B/year baseline (no additional investment): 0.4× deployment rate (40% of full speed)
 * - $1.4T/year (current 2024 level): 0.7× deployment rate (baseline established)
 * - $3.5T/year (required for net-zero): 1.0× deployment rate (full speed)
 * - $7T/year (double required): 1.2× deployment rate (diminishing returns)
 *
 * Formula: min(1.2, 0.4 + 0.6 * (investment / $3.5T))
 */
export function getInvestmentMultiplier(gameState: GameState): number {
  // Climate investment comes from research investments (climate.mitigation + climate.intervention)
  const climateResearch = gameState.government?.researchInvestments;
  if (!climateResearch) return 0.7; // Default to current 2024 baseline

  // Climate research levels are [0-10]
  // Map to $T/year: 0 → $0B, 5 → $1.4T (baseline), 10 → $3.5T (full)
  // Access nested object - climate is always initialized
  const climate = climateResearch.climate;
  const climateMitigation = assertStateProperty(climate, 'mitigation', {
    location: 'getInvestmentMultiplier',
    month: gameState.currentMonth
  });
  const climateIntervention = assertStateProperty(climate, 'intervention', {
    location: 'getInvestmentMultiplier',
    month: gameState.currentMonth
  });

  // Average of mitigation + intervention
  const avgClimateInvestment = (climateMitigation + climateIntervention) / 2;

  // Convert [0-10] to [$0T, $3.5T]
  const investmentTrillion = (avgClimateInvestment / 10) * 3.5;

  // Apply formula: baseline 0.4× + scaling based on investment
  const scalingFactor = 0.4 + 0.6 * (investmentTrillion / 3.5);

  // Cap at 1.2× (diminishing returns beyond required investment)
  return Math.min(1.2, scalingFactor);
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
  const investmentMultiplier = getInvestmentMultiplier(gameState);

  // FIX (Nov 7, 2025): Sort regions for deterministic iteration (Issue #11)
  const sortedRegions = Object.keys(techTreeState.regionalDeployment).sort();
  for (const region of sortedRegions) {
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

      // HIGH #2 FIX (Oct 29, 2025): Check for emergency acceleration
      // During crises, emergency response can deploy tech 10-600x faster
      // Map lookup: default to 1.0 (no acceleration) if not in map
      const emergencyAcceleration = techTreeState.deploymentAcceleration[deployment.techId] !== undefined
        ? techTreeState.deploymentAcceleration[deployment.techId]
        : 1.0;

      // Apply multipliers (governance + climate feedbacks + investment + emergency)
      // FIX #14 Phase 5: Added investment multiplier
      const combinedMultiplier = governanceMultiplier * climateMultiplier * investmentMultiplier * emergencyAcceleration;
      const adjustedTimescale = timescale / combinedMultiplier;
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
        console.log(`   Gov: ${(governanceMultiplier * 100).toFixed(0)}%, Climate: ${(climateMultiplier * 100).toFixed(0)}%, Investment: ${(investmentMultiplier * 100).toFixed(0)}%, Emergency: ${(emergencyAcceleration).toFixed(1)}x`);
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
          console.log(`   Investment: ${(investmentMultiplier * 100).toFixed(0)}%`);
          console.log(`   Emergency acceleration: ${emergencyAcceleration.toFixed(1)}x`);

          if (milestone === 1.0) {
            const yearsToFull = monthsSinceStart / 12;
            console.log(`   ✅ FULL DEPLOYMENT: ${yearsToFull.toFixed(1)} years`);

            // Add completion event to timeline
            addSimulationEvent(gameState, {
              type: 'deployment',
              severity: 'positive',
              agent: deployment.deployedBy?.[0] || 'multi-agent',
              title: `✅ TECH DEPLOYED: ${tech?.name || deployment.techId}`,
              description: `Full deployment achieved in ${region} after ${yearsToFull.toFixed(1)} years (${monthsSinceStart} months). Technology is now operating at 100% effectiveness. Category: ${tech?.category || 'unknown'}. Governance multiplier: ${(governanceMultiplier * 100).toFixed(0)}%, Climate feedback: ${(climateMultiplier * 100).toFixed(0)}%, Investment: ${(investmentMultiplier * 100).toFixed(0)}%, Emergency acceleration: ${emergencyAcceleration.toFixed(1)}x.`,
              effects: {
                techId: deployment.techId,
                region,
                deploymentLevel: 1.0,
                monthsToFull: monthsSinceStart,
                governanceMultiplier,
                climateMultiplier,
                investmentMultiplier,
                emergencyAcceleration
              }
            });
          } else {
            // Add milestone event for 50% and 75% only (avoid spam)
            if (milestone >= 0.5) {
              addSimulationEvent(gameState, {
                type: 'deployment',
                severity: 'medium',
                agent: deployment.deployedBy?.[0] || 'multi-agent',
                title: `📊 DEPLOYMENT PROGRESS: ${tech?.name || deployment.techId} (${(milestone * 100).toFixed(0)}%)`,
                description: `Deployment reached ${(milestone * 100).toFixed(0)}% in ${region} after ${(monthsSinceStart / 12).toFixed(1)} years. Actual level: ${(deployment.deploymentLevel * 100).toFixed(1)}%. On track for full deployment.`,
                effects: {
                  techId: deployment.techId,
                  region,
                  milestone,
                  deploymentLevel: deployment.deploymentLevel,
                  monthsSinceStart
                }
              });
            }
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
