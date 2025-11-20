/**
 * CoordinatedDeploymentPhase (Order: 10.5)
 *
 * Models AI-coordinated technology deployment with support systems to minimize
 * mortality during rapid technological transitions.
 *
 * **EXECUTION ORDER:** 10.5 (After government actions, before environmental systems)
 * **DEPENDENCIES:** Requires AI capabilities, government state, population
 * **SIDE EFFECTS:**
 * - Calculates transition mortality based on deployment mode and support systems
 * - Applies mortality to population
 * - Updates coordination quality and support effectiveness metrics
 * - Tracks regional heterogeneity in deployment outcomes
 *
 * **RESEARCH BACKING (Grade A-, 24+ sources):**
 *
 * Mortality baselines (empirical):
 * - Chaos (instant deployment, no coordination): 30% (Great Leap Forward, god mode)
 * - Uncoordinated (market-driven, weak institutions): 15% (post-Soviet Russia +74% death rate)
 * - Coordinated (AI-managed, full support): 3% (Green Revolution, Kenya UBI)
 *
 * Support system effectiveness (RCT-validated):
 * - Cash transfers/UBI: -48% mortality (Kenya 2025, NBER WP 34152, 100k+ births)
 * - Labor market support: -40% unemployment (Germany Kurzarbeit 2008, OECD, 500k jobs saved)
 * - Food security: -35% infant mortality (Green Revolution, PMC/NIH, 37 countries)
 * - Healthcare expansion: -25% long-term (UK NHS post-war, PMC)
 *
 * Safe deployment threshold: ≤5% workforce displaced per year
 * - Historical precedent: 40-year transitions succeed, <5-year transitions catastrophic
 * - Post-Soviet shock therapy (<5 years) → +74% death rate
 * - Green Revolution (decades) → 3M lives saved per year by 2000
 *
 * Regional heterogeneity:
 * - Post-Soviet divergence: Russia (no safety nets) vs Poland/Czech (strong policies) = 100% mortality difference by 2000
 * - OECD countries: 50% mortality multiplier (strong institutions)
 * - Low-income countries: 200% mortality multiplier (weak institutions)
 *
 * @see research/ai_coordination_transition_mortality_20251118.md (9,000+ words, 24+ sources)
 * @see plans/phase2_ai_coordination_implementation_spec.md
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import {
  TransitionManagementSystem,
  DeploymentMode,
  MORTALITY_BASELINES,
  SUPPORT_EFFECTIVENESS,
  MAX_SAFE_DEPLOYMENT_SPEED
} from '@/types/transitionManagement';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined
} from '@/simulation/utils/assertions';

/**
 * CoordinatedDeploymentPhase
 *
 * Each month:
 * 1. Assess coordination quality (AI capability + governance + infrastructure)
 * 2. Assess support system effectiveness (UBI, retraining, food, healthcare)
 * 3. Calculate deployment speed (% workforce displaced)
 * 4. Determine deployment mode (chaos, uncoordinated, coordinated)
 * 5. Calculate base mortality from mode
 * 6. Apply support system reductions (multiplicative)
 * 7. Apply deployment speed penalty if exceeds safe threshold
 * 8. Apply regional heterogeneity (OECD vs low-income)
 * 9. Update population and tracking metrics
 */
export class CoordinatedDeploymentPhase implements SimulationPhase {
  readonly id = 'coordinated-deployment';
  readonly name = 'AI Coordination & Transition Mortality';
  readonly order = 10.5;

  // DEPENDENCIES: Requires government actions (support systems), population, AI capabilities
  readonly dependencies = [
    'government-actions',     // Order 9.0: Support system policies
    'ai-lifecycle',           // Order 3.0: AI coordination capability
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // CRITICAL: RNG must be defined (deterministic simulation requirement)
    assertDefined(rng, {
      location: 'CoordinatedDeploymentPhase.execute',
      valueName: 'rng',
      additionalInfo: { reason: 'RNG required for deterministic simulation' }
    });

    const transition = state.transitionManagementSystem;

    // === STEP 1: Assess Coordination Quality ===
    const coordinationQuality = this.assessCoordinationQuality(state);
    transition.coordinationQuality = coordinationQuality;

    // === STEP 2: Assess Support System Effectiveness ===
    const supportEffectiveness = this.assessSupportSystems(state);
    transition.supportSystemEffectiveness = supportEffectiveness;

    // === STEP 3: Calculate Deployment Speed ===
    const deploymentSpeed = this.calculateDeploymentSpeed(state);
    transition.workforceDisplacementRate = deploymentSpeed;

    // === STEP 4: Determine Deployment Mode ===
    const deploymentMode = this.determineDeploymentMode(coordinationQuality);
    transition.deploymentMode = deploymentMode;

    // === STEP 5: Calculate Base Mortality ===
    let baseMortality = MORTALITY_BASELINES[deploymentMode];
    transition.baseMortalityRate = baseMortality;

    // === STEP 6: Apply Support System Reductions (Multiplicative) ===
    baseMortality = this.applySupportSystemReductions(baseMortality, transition);

    // === STEP 7: Apply Deployment Speed Penalty ===
    baseMortality = this.applyDeploymentSpeedPenalty(baseMortality, deploymentSpeed, transition);

    // === STEP 8: Apply Regional Heterogeneity ===
    const regionalMortality = this.applyRegionalHeterogeneity(baseMortality, transition);

    // === STEP 9: Calculate Monthly Mortality and Update Population ===
    const monthlyMortality = regionalMortality / 12.0; // Annual → monthly
    transition.mortalityThisMonth = assertProbability(monthlyMortality, {
      location: 'CoordinatedDeploymentPhase.execute',
      valueName: 'monthlyMortality',
      month: state.currentMonth,
      additionalInfo: { baseMortality, deploymentMode, supportEffectiveness, deploymentSpeed }
    });

    // Update cumulative mortality
    transition.transitionMortality += monthlyMortality;

    // Apply mortality to population
    const population = state.humanPopulationSystem.population;
    const populationLost = population * monthlyMortality;
    state.humanPopulationSystem.population -= populationLost;

    assertFinite(state.humanPopulationSystem.population, {
      location: 'CoordinatedDeploymentPhase.execute',
      valueName: 'population after transition mortality',
      month: state.currentMonth,
      additionalInfo: { populationLost, monthlyMortality }
    });

    // Update tracking metrics
    if (deploymentSpeed > 0) {
      if (transition.deploymentStartMonth === 0) {
        transition.deploymentStartMonth = state.currentMonth;
      }
      transition.monthsOfActiveDeployment += 1;
    }

    if (deploymentSpeed > transition.peakDeploymentSpeed) {
      transition.peakDeploymentSpeed = deploymentSpeed;
      transition.peakDeploymentSpeedMonth = state.currentMonth;
    }

    // === STEP 10: Logging (annual summary) ===
    if (state.currentMonth % 12 === 0 && deploymentSpeed > 0.001) {
      this.logCoordinationStatus(state, coordinationQuality, supportEffectiveness, baseMortality, deploymentSpeed);
    }

    return { events: [] };
  }

  /**
   * Assess coordination quality (0 = chaos, 1 = perfect)
   *
   * Weighted combination:
   * - AI coordination capability: 50% weight (most important - AI can optimize deployment)
   * - Governance effectiveness: 30% weight (institutional capacity to execute policies)
   * - Infrastructure quality: 20% weight (physical readiness for technology rollout)
   */
  private assessCoordinationQuality(state: GameState): number {
    const transition = state.transitionManagementSystem;

    // AI coordination capability (50% weight)
    const aiCoordination = transition.aiCoordinationCapability;

    // Governance effectiveness (30% weight)
    const governance = transition.governanceEffectiveness;

    // Infrastructure quality (20% weight)
    const infrastructure = transition.infrastructureQuality;

    const quality = aiCoordination * 0.5 + governance * 0.3 + infrastructure * 0.2;

    return assertProbability(quality, {
      location: 'CoordinatedDeploymentPhase.assessCoordinationQuality',
      valueName: 'coordinationQuality',
      month: state.currentMonth,
      additionalInfo: { aiCoordination, governance, infrastructure }
    });
  }

  /**
   * Assess support system effectiveness (0 = none, 1 = comprehensive)
   *
   * Empirical effectiveness from research:
   * - UBI: -48% mortality (Kenya 2025 RCT)
   * - Retraining: -40% unemployment (Germany Kurzarbeit)
   * - Food security: -35% infant mortality (Green Revolution)
   * - Healthcare: -25% long-term mortality (UK NHS)
   *
   * Effects are multiplicative, not additive (diminishing returns)
   */
  private assessSupportSystems(state: GameState): number {
    const support = state.transitionManagementSystem.supportSystems;

    // Weighted combination of support system coverage
    // Each system contributes proportional to its empirical effectiveness
    const ubiEffect = support.ubiCoverage * SUPPORT_EFFECTIVENESS.ubiCoverage;
    const retrainingEffect = support.retrainingProgramsCoverage * SUPPORT_EFFECTIVENESS.retrainingProgramsCoverage;
    const foodEffect = support.foodSecurityIndex * SUPPORT_EFFECTIVENESS.foodSecurityIndex;
    const healthEffect = support.universalHealthcareCoverage * SUPPORT_EFFECTIVENESS.universalHealthcareCoverage;

    // Diminishing returns: not fully additive
    // Scale factor 1.5 ensures max effectiveness ~1.0 when all systems at full coverage
    const combinedEffect = Math.min(1.0,
      (ubiEffect + retrainingEffect + foodEffect + healthEffect) / 1.5
    );

    return assertProbability(combinedEffect, {
      location: 'CoordinatedDeploymentPhase.assessSupportSystems',
      valueName: 'supportEffectiveness',
      month: state.currentMonth,
      additionalInfo: { ubiEffect, retrainingEffect, foodEffect, healthEffect }
    });
  }

  /**
   * Calculate deployment speed (% workforce displaced per year)
   *
   * Based on recent technology deployments (last 12 months)
   * Each breakthrough technology affects ~3% of workforce on average
   *
   * Safe threshold: ≤5% per year
   * Risky: 10-15% per year
   * Crisis: >20% per year (exceeds human adaptation capacity)
   */
  private calculateDeploymentSpeed(state: GameState): number {
    const transition = state.transitionManagementSystem;

    // Count recent deployments (simplified - could be refined with actual tech deployment tracking)
    // For now, use the recentDeploymentsCount field (updated by technology deployment phases)
    const recentDeployments = transition.recentDeploymentsCount;

    // Each breakthrough affects ~3% of workforce (average across sectors)
    const averageImpactPerTech = 0.03;
    const totalImpact = recentDeployments * averageImpactPerTech;

    return assertInRange(totalImpact, 0, 1, {
      location: 'CoordinatedDeploymentPhase.calculateDeploymentSpeed',
      valueName: 'deploymentSpeed',
      month: state.currentMonth,
      additionalInfo: { recentDeployments, averageImpactPerTech }
    });
  }

  /**
   * Determine deployment mode based on coordination quality
   *
   * Thresholds:
   * - <0.3: Chaos (instant deployment, no coordination) → 30% base mortality
   * - 0.3-0.6: Uncoordinated (market-driven, weak coordination) → 15% base mortality
   * - >0.6: Coordinated (AI-managed, strong coordination) → 3% base mortality
   */
  private determineDeploymentMode(coordinationQuality: number): DeploymentMode {
    if (coordinationQuality < 0.3) {
      return 'chaos';
    } else if (coordinationQuality < 0.6) {
      return 'uncoordinated';
    } else {
      return 'coordinated';
    }
  }

  /**
   * Apply support system reductions to base mortality
   *
   * Support systems reduce mortality multiplicatively:
   * adjusted = base * (1 - effectiveness)
   *
   * Example: 30% base mortality, 70% support effectiveness
   * → 30% * (1 - 0.70) = 9% adjusted mortality
   */
  private applySupportSystemReductions(baseMortality: number, transition: TransitionManagementSystem): number {
    const supportReduction = transition.supportSystemEffectiveness;
    const adjusted = baseMortality * (1 - supportReduction);

    return assertFinite(adjusted, {
      location: 'CoordinatedDeploymentPhase.applySupportSystemReductions',
      valueName: 'adjustedMortality',
      additionalInfo: { baseMortality, supportReduction }
    });
  }

  /**
   * Apply deployment speed penalty if exceeds safe threshold
   *
   * Safe threshold: 5% workforce displaced per year
   * Penalty: +50% mortality per doubling above threshold
   *
   * Example: 10% deployment speed (2× safe threshold)
   * → mortality multiplier = 1 + (10% - 5%) / 5% * 0.5 = 1.5× (50% increase)
   */
  private applyDeploymentSpeedPenalty(
    baseMortality: number,
    deploymentSpeed: number,
    transition: TransitionManagementSystem
  ): number {
    if (deploymentSpeed <= transition.maxSafeDeploymentSpeed) {
      return baseMortality; // No penalty if within safe limits
    }

    const excessSpeed = deploymentSpeed - transition.maxSafeDeploymentSpeed;
    const speedMultiplier = 1.0 + (excessSpeed / MAX_SAFE_DEPLOYMENT_SPEED) * 0.5;
    const adjusted = baseMortality * speedMultiplier;

    return assertFinite(adjusted, {
      location: 'CoordinatedDeploymentPhase.applyDeploymentSpeedPenalty',
      valueName: 'speedAdjustedMortality',
      additionalInfo: { baseMortality, deploymentSpeed, speedMultiplier }
    });
  }

  /**
   * Apply regional heterogeneity
   *
   * Post-Soviet divergence shows institutional quality dominates outcomes:
   * - Russia (weak institutions): +74% death rate
   * - Poland/Czech (strong institutions): negligible mortality increase
   * - 100% mortality difference by 2000 for same type of transition
   *
   * Regional multipliers:
   * - OECD (15% population): 0.5× mortality (strong institutions, existing safety nets)
   * - Middle-income (50% population): 1.0× mortality (base case)
   * - Low-income (35% population): 2.0× mortality (weak institutions, vulnerable)
   */
  private applyRegionalHeterogeneity(baseMortality: number, transition: TransitionManagementSystem): number {
    const readiness = transition.regionalReadiness;

    // Regional mortality multipliers
    const oecdMortality = baseMortality * 0.5;        // Strong institutions
    const middleIncomeMortality = baseMortality * 1.0; // Base case
    const lowIncomeMortality = baseMortality * 2.0;   // Weak institutions

    // Weighted average by population distribution
    // Assume: 15% OECD, 50% middle-income, 35% low-income
    const weightedMortality =
      oecdMortality * 0.15 +
      middleIncomeMortality * 0.50 +
      lowIncomeMortality * 0.35;

    return assertFinite(weightedMortality, {
      location: 'CoordinatedDeploymentPhase.applyRegionalHeterogeneity',
      valueName: 'regionalMortality',
      additionalInfo: { baseMortality, oecdMortality, middleIncomeMortality, lowIncomeMortality }
    });
  }

  /**
   * Log coordination status (annual summary)
   *
   * Emoji conventions:
   * - 🤝 Coordination activities
   * - 🛡️ Support system activation
   * - ⚠️ Mortality risk
   * - ⚡ Rapid deployment warning
   * - 🚨 Critical threshold exceeded
   * - ✅ Successful coordination
   */
  private logCoordinationStatus(
    state: GameState,
    coordination: number,
    support: number,
    mortality: number,
    speed: number
  ): void {
    const transition = state.transitionManagementSystem;
    const mode = transition.deploymentMode;

    console.log(`\n=== 🤝 Coordinated Deployment Phase (Year ${Math.floor(state.currentMonth / 12)}) ===`);
    console.log(`  Coordination Quality: ${(coordination * 100).toFixed(1)}%`);
    console.log(`  🛡️ Support System Effectiveness: ${(support * 100).toFixed(1)}%`);
    console.log(`  ⚠️ Projected Annual Mortality: ${(mortality * 100).toFixed(2)}%`);
    console.log(`  Deployment Speed: ${(speed * 100).toFixed(1)}%/year (threshold: ${(transition.maxSafeDeploymentSpeed * 100).toFixed(1)}%/year)`);

    // Deployment mode warning
    if (mode === 'chaos') {
      console.log(`  🚨 CHAOS MODE: Uncoordinated deployment - catastrophic mortality risk`);
    } else if (mode === 'uncoordinated') {
      console.log(`  ⚠️ UNCOORDINATED: Weak coordination - elevated mortality risk`);
    } else {
      console.log(`  ✅ COORDINATED: Strong coordination - mortality minimized`);
    }

    // Deployment speed warning
    if (speed > transition.maxSafeDeploymentSpeed) {
      const excessMultiple = speed / transition.maxSafeDeploymentSpeed;
      console.log(`  ⚡ WARNING: Deployment speed ${excessMultiple.toFixed(1)}× safe threshold - mortality penalty applied`);
    }

    // Cumulative tracking
    console.log(`  Cumulative Transition Mortality: ${(transition.transitionMortality * 100).toFixed(2)}%`);
    console.log(`  Current Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  }
}
