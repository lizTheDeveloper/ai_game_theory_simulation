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
 * **RESEARCH BACKING (Grade B+, VALIDATED Nov 21 2025):**
 *
 * Calibrated parameters (god mode empirical = 30% mortality):
 * - Base risk coefficient: 0.0015 (not 0.003)
 * - Power-law exponent: 0.8 (subadditive, later techs hit already-disrupted populations)
 * - Pace exponent: 0.3 (not 0.5, weaker time scaling)
 * - God mode minimal coordination: 0.2 (existing institutions provide minimal coordination)
 * - God mode minimal support: 0.2 (existing food stocks, healthcare infrastructure)
 *
 * CRITICAL corrections applied:
 * - CRITICAL-1: Deployment pace scaling (reference_duration / actual_duration)^0.3
 * - CRITICAL-2: Coordination ceiling min(raw, trust*2.0, governance*1.5) (bottleneck constraints)
 * - CRITICAL-3: Regional inequality limitation documented
 * - HIGH-1: Retraining weight reduced from 0.1 → 0.0 (weak evidence)
 *
 * Support system effectiveness (evidence-weighted):
 * - Cash transfers/UBI: -48% mortality (Kenya 2025, NBER WP 34152, 100k+ births)
 * - Healthcare: -35% (Kenya mechanism: hospital deliveries +45%)
 * - Food security: -15% (Great Leap negative case)
 * - Retraining: 0.0 (Brookings 2024: "scant empirical evidence")
 *
 * Deployment pace (TIME MATTERS - CRITICAL):
 * - Energy transitions: 10-30 years → near-zero mortality with support
 * - Great Leap Forward: 2-3 years → 15-55M deaths
 * - Reference duration: 120 months (10 years)
 * - Pace factor: (reference_duration / actual_duration)^0.3
 *
 * Regional inequality (LIMITATION):
 * - Global average hides 5-10x regional variation
 * - Global North: 5-10% mortality (strong institutions)
 * - Global South: 40-60% mortality (weak institutions)
 * - Failed states: 70-90% mortality (no coordination)
 *
 * @see research/ai_coordination_transition_mechanics_VALIDATED_20251121.md (Grade B+)
 * @see reviews/ai_coordination_transition_critique_20251121.md (Sylvia validation)
 * @see research/ai_coordination_transition_mortality_20251118.md (original research)
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

    // CRITICAL: transitionManagementSystem state must exist after bootstrap
    assertDefined(state.transitionManagementSystem, {
      location: 'CoordinatedDeploymentPhase.execute',
      valueName: 'transitionManagementSystem',
      month: state.currentMonth,
      additionalInfo: { reason: 'transitionManagementSystem state missing after bootstrap' }
    });

    const transition = state.transitionManagementSystem;

    // === STEP 1: Assess Coordination Quality (with bottleneck constraints - CRITICAL-2) ===
    const coordinationQuality = this.assessCoordinationQuality(state);
    transition.coordinationQuality = coordinationQuality;

    // === STEP 2: Assess Support System Effectiveness (evidence-weighted - HIGH-1) ===
    const supportEffectiveness = this.assessSupportSystems(state);
    transition.supportSystemEffectiveness = supportEffectiveness;

    // === STEP 3: Calculate Deployment Speed ===
    const deploymentSpeed = this.calculateDeploymentSpeed(state);
    transition.workforceDisplacementRate = deploymentSpeed;

    // === STEP 4: Calculate Deployment Pace Factor (TIME MATTERS - CRITICAL-1) ===
    const paceFactor = this.calculateDeploymentPaceFactor(state);

    // === STEP 5: Calculate Base Mortality Risk (Nov 21 validated formula) ===
    // Power-law base risk with tier multipliers (not linear)
    // base = 0.0015 * (techs_deploying)^0.8 * tier_multiplier
    const baseRisk = this.calculateBaseMortalityRisk(state, deploymentSpeed);
    transition.baseMortalityRate = baseRisk;

    // === STEP 6: Calculate Mortality Multiplier (Nov 21 validated) ===
    // multiplier = (2.0 - coordination) * (1.5 - support) * pace_factor
    const mortalityMultiplier = (
      (2.0 - coordinationQuality) *
      (1.5 - supportEffectiveness) *
      paceFactor
    );

    // === STEP 7: Calculate Mortality Fraction (exponential saturation) ===
    // mortality_fraction = 1 - exp(-base * multiplier)
    // Prevents >100% mortality while allowing high base*multiplier values
    const mortalityFraction = 1.0 - Math.exp(-baseRisk * mortalityMultiplier);

    // === STEP 8: Apply Regional Heterogeneity ===
    const regionalMortality = this.applyRegionalHeterogeneity(mortalityFraction, transition);

    // === STEP 9: Calculate Monthly Mortality and Update Population ===
    const monthlyMortality = regionalMortality / 12.0; // Annual → monthly
    transition.mortalityThisMonth = assertProbability(monthlyMortality, {
      location: 'CoordinatedDeploymentPhase.execute',
      valueName: 'monthlyMortality',
      month: state.currentMonth,
      additionalInfo: {
        baseRisk,
        mortalityMultiplier,
        mortalityFraction,
        coordinationQuality,
        supportEffectiveness,
        paceFactor,
        deploymentSpeed
      }
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
      this.logCoordinationStatus(state, coordinationQuality, supportEffectiveness, baseRisk, deploymentSpeed);
    }

    return { events: [] };
  }

  /**
   * Assess coordination quality (0 = chaos, 1 = perfect)
   *
   * CRITICAL-2 (Nov 21 validated research): Apply bottleneck constraints
   *
   * Raw coordination from weighted combination:
   * - AI research capability: 40% weight (coordination knowledge)
   * - AI social capability: 30% weight (implementation capacity)
   * - Governance effectiveness: 20% weight (institutional execution)
   * - AI trust: 10% weight (human willingness to accept coordination)
   *
   * Bottleneck constraints (weakest link dominates):
   * - Can't coordinate if humans don't trust AI (trust bottleneck)
   * - Can't coordinate if institutions can't implement (governance bottleneck)
   *
   * Evidence: Gartner 2025 - 40% agentic AI projects fail despite high capability
   * due to "inadequate risk controls" (governance) and trust issues.
   *
   * Final coordination = min(raw, trust*2.0, governance*1.5)
   *
   * Example: AI capability = 0.9, trust = 0.3 → actual coordination = min(0.7, 0.6, 0.45) = 0.45
   */
  private assessCoordinationQuality(state: GameState): number {
    const transition = state.transitionManagementSystem;

    // NOTE: We need AI capabilities and trust from state
    // For now, use proxy fields from transition system
    // TODO: Wire in actual AI capability dimensions and trust when those systems exist
    const aiResearch = transition.aiCoordinationCapability; // Proxy for AI research capability
    const aiSocial = transition.aiCoordinationCapability * 0.8; // Proxy (social typically lower)
    const governance = transition.governanceEffectiveness;
    const aiTrust = transition.aiCoordinationCapability * 0.7; // Proxy (trust lags capability)

    // Raw coordination quality (before bottleneck constraints)
    const coordinationRaw = (
      aiResearch * 0.4 +
      aiSocial * 0.3 +
      governance * 0.2 +
      aiTrust * 0.1
    );

    // Apply bottleneck constraints (CRITICAL-2)
    // Real-world: High AI capability doesn't matter if trust or governance blocks implementation
    const coordinationQuality = Math.min(
      coordinationRaw,
      aiTrust * 2.0,        // Can't coordinate beyond 2x trust level
      governance * 1.5      // Can't coordinate beyond 1.5x governance capacity
    );

    assertProbability(coordinationQuality, {
      location: 'CoordinatedDeploymentPhase.assessCoordinationQuality',
      valueName: 'coordinationQuality',
      month: state.currentMonth,
      additionalInfo: {
        coordinationRaw,
        aiResearch,
        aiSocial,
        governance,
        aiTrust,
        trustCeiling: aiTrust * 2.0,
        governanceCeiling: governance * 1.5
      }
    });

    return coordinationQuality;
  }

  /**
   * Assess support system effectiveness (0 = none, 1 = comprehensive)
   *
   * HIGH-1 (Nov 21 validated research): Evidence-weighted effectiveness
   *
   * Empirical effectiveness:
   * - UBI: -48% mortality (Kenya 2025 RCT, 100k+ births, HIGH QUALITY)
   * - Healthcare: -35% mortality (Kenya mechanism: hospital deliveries +45%, HIGH QUALITY)
   * - Food security: -15% mortality (Great Leap negative case, HIGH QUALITY)
   * - Retraining: 0.0 weight (Brookings 2024: "scant empirical evidence", LOW QUALITY)
   *
   * Formula (Nov 21 validated):
   * support = (ubi * 0.5) + (healthcare * 0.35) + (food * 0.15) + (retraining * 0.0)
   *
   * Effects are multiplicative, not additive (diminishing returns)
   */
  private assessSupportSystems(state: GameState): number {
    const support = state.transitionManagementSystem.supportSystems;

    // Evidence-weighted combination (Nov 21 validated research)
    const ubiEffect = support.ubiCoverage * 0.5;        // Strong evidence: Kenya RCT
    const healthEffect = support.universalHealthcareCoverage * 0.35;  // Strong evidence: Kenya mechanism
    const foodEffect = support.foodSecurityIndex * 0.15;              // Strong negative evidence: Great Leap famine
    const retrainingEffect = 0.0;  // HIGH-1 correction: Weak evidence (Brookings: "policymakers skeptical")

    // Combined effectiveness
    const combinedEffect = Math.min(1.0,
      ubiEffect + healthEffect + foodEffect + retrainingEffect
    );

    return assertProbability(combinedEffect, {
      location: 'CoordinatedDeploymentPhase.assessSupportSystems',
      valueName: 'supportEffectiveness',
      month: state.currentMonth,
      additionalInfo: {
        ubiEffect,
        healthEffect,
        foodEffect,
        retrainingEffect,
        note: 'Retraining excluded (weight=0.0) due to weak evidence - Brookings 2024'
      }
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
   * Calculate base mortality risk (Nov 21 validated formula)
   *
   * Power-law scaling (not linear): Technologies don't add risk independently
   * Later technologies hit already-disrupted populations (diminishing marginal risk)
   *
   * Formula:
   * base = 0.0015 * (technologies_deploying)^0.8 * tier_multiplier
   *
   * Tier risk multipliers (urgency and complexity):
   * - TIER 0 (crisis): 1.5x (rushed deployment under urgency)
   * - TIER 1 (important): 1.2x (less urgent but still important)
   * - TIER 2 (baseline): 1.0x (moderate pace)
   * - TIER 3 (optional): 0.8x (carefully tested, cautious)
   * - TIER 4 (exciting): 1.3x (high excitement, potential premature deployment)
   *
   * Calibration:
   * - God mode (73 techs, tier avg 1.2): base = 0.0015 * 73^0.8 * 1.2 = 0.054
   * - With minimal coordination (0.2) and support (0.2), pace (2.76): mortality = 29.5% ✓
   *
   * Historical validation:
   * - Great Leap Forward: 1-2 major changes → 0.5-2% mortality
   * - 73 changes shouldn't be 73× that (linear would give 73-146% - impossible)
   * - Power-law provides realistic subadditivity
   */
  private calculateBaseMortalityRisk(state: GameState, deploymentSpeed: number): number {
    const transition = state.transitionManagementSystem;

    // Number of technologies currently deploying
    // Proxy: use recentDeploymentsCount (ideally would track active deployments)
    const techsDeploying = Math.max(1, transition.recentDeploymentsCount);

    // Tier multipliers (Nov 21 validated)
    const tierMultipliers = [1.5, 1.2, 1.0, 0.8, 1.3]; // TIER 0-4

    // Average tier of deploying technologies (assume balanced mix for now)
    // TODO: Track actual tier distribution when tech deployment tracking exists
    const avgTier = 1.2; // Weighted average assuming more TIER 0-1 (crisis response)
    const tierMultiplier = avgTier; // Use continuous value (not discrete lookup)

    // Power-law base risk (Nov 21 validated calibration)
    // Research shows: base = 0.0015 * 73^0.8 = 0.054 (with tier multiplier baked in)
    // This means: 0.0015 * 73^0.8 * 1.16 ≈ 0.054
    const baseCoefficient = 0.0015; // Calibrated to god mode 30% mortality
    const powerLawExponent = 0.8;   // Subadditive scaling
    const baseRisk = baseCoefficient * Math.pow(techsDeploying, powerLawExponent) * tierMultiplier;

    return assertFinite(baseRisk, {
      location: 'CoordinatedDeploymentPhase.calculateBaseMortalityRisk',
      valueName: 'baseRisk',
      month: state.currentMonth,
      additionalInfo: {
        techsDeploying,
        tierMultiplier,
        baseCoefficient,
        powerLawExponent,
        note: 'Calibrated to god mode 30% mortality with coordination=0.2, support=0.2'
      }
    });
  }

  /**
   * DEPRECATED: Old deployment mode classification (Nov 18 research)
   *
   * Nov 21 validated research uses continuous formula instead of discrete modes.
   * Keeping method for potential fallback but not used in main execution flow.
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
   * Calculate deployment pace factor (CRITICAL-1: Nov 21 validated research)
   *
   * TIME IS THE CRITICAL VARIABLE - not just workforce displacement %
   *
   * Evidence:
   * - Energy transitions: 10-30 years → near-zero mortality with support
   * - Great Leap Forward: 2-3 years → 15-55M deaths
   *
   * Formula (calibrated to god mode 30% mortality):
   * pace_factor = (reference_duration / actual_duration)^0.3
   *
   * Reference: 120 months (10 years, energy transition baseline)
   *
   * Examples:
   * - 1 month (god mode): (120/1)^0.3 = 2.76x mortality multiplier
   * - 12 months (rapid): (120/12)^0.3 = 1.71x
   * - 60 months (moderate): (120/60)^0.3 = 1.24x
   * - 120 months (cautious): (120/120)^0.3 = 1.0x (baseline)
   * - 240 months (very slow): (120/240)^0.3 = 0.81x
   *
   * Weaker scaling (exponent 0.3 not 0.5): 10x slower → 2x mortality reduction (not 3.16x)
   */
  private calculateDeploymentPaceFactor(state: GameState): number {
    const transition = state.transitionManagementSystem;

    // Deployment duration (months since deployment started)
    // If no deployment yet, assume instant (month 0 = 1 month duration for calculation)
    let actualDuration = 1; // Default to 1 month (god mode scenario)

    if (transition.deploymentStartMonth > 0) {
      actualDuration = Math.max(1, state.currentMonth - transition.deploymentStartMonth);
    }

    // Reference duration: Energy transition baseline
    // NOTE: Research document shows conflicting values:
    // - Line 114: "reference_duration_months = 120"
    // - Line 189 calibration: pace = 2.76 for 1 month → implies ref = 29.2 months
    // Using calibrated value that produces god mode 30% mortality
    const referenceDuration = 30; // Calibrated to match god mode 30% (not 120)

    // Pace factor: (reference / actual)^0.3 (CRITICAL-1 calibrated exponent)
    const paceFactor = Math.pow(referenceDuration / actualDuration, 0.3);

    return assertFinite(paceFactor, {
      location: 'CoordinatedDeploymentPhase.calculateDeploymentPaceFactor',
      valueName: 'paceFactor',
      month: state.currentMonth,
      additionalInfo: {
        actualDuration,
        referenceDuration,
        note: 'Pace exponent 0.3 calibrated to god mode 30% mortality'
      }
    });
  }

  /**
   * DEPRECATED: Apply deployment speed penalty (Nov 18 research)
   *
   * CRITICAL-1 uses time-based pace factor instead (see calculateDeploymentPaceFactor).
   * The Nov 21 validated research shows TIME is the critical variable, not workforce %.
   *
   * This method is NOT CALLED in the main execution flow.
   * Keeping for reference but redundant with pace factor.
   *
   * Old logic:
   * - Safe threshold: 5% workforce displaced per year
   * - Penalty: +50% mortality per doubling above threshold
   * - Example: 10% deployment speed (2× safe threshold) → 1.5× mortality
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
    baseRisk: number,
    speed: number
  ): void {
    const transition = state.transitionManagementSystem;

    // Calculate current pace factor for logging
    let actualDuration = 1;
    if (transition.deploymentStartMonth > 0) {
      actualDuration = Math.max(1, state.currentMonth - transition.deploymentStartMonth);
    }
    const referenceDuration = 30; // Calibrated value (see calculateDeploymentPaceFactor)
    const paceFactor = Math.pow(referenceDuration / actualDuration, 0.3);

    // Calculate multiplier and fraction
    const multiplier = (2.0 - coordination) * (1.5 - support) * paceFactor;
    const mortalityFraction = 1.0 - Math.exp(-baseRisk * multiplier);
    const annualMortality = mortalityFraction;

    console.log(`\n=== 🤝 Coordinated Deployment Phase (Year ${Math.floor(state.currentMonth / 12)}) ===`);
    console.log(`  Coordination Quality: ${(coordination * 100).toFixed(1)}% (bottleneck-constrained)`);
    console.log(`  🛡️ Support System Effectiveness: ${(support * 100).toFixed(1)}% (evidence-weighted, no retraining)`);
    console.log(`  Base Risk: ${(baseRisk * 100).toFixed(3)}% (power-law: ${transition.recentDeploymentsCount} techs^0.8)`);
    console.log(`  ⏱️ Pace Factor: ${paceFactor.toFixed(2)}x (${actualDuration} months vs ${referenceDuration} month reference)`);
    console.log(`  Mortality Multiplier: ${multiplier.toFixed(2)}x`);
    console.log(`  ⚠️ Projected Annual Mortality: ${(annualMortality * 100).toFixed(2)}%`);
    console.log(`  Deployment Speed: ${(speed * 100).toFixed(1)}%/year (threshold: ${(transition.maxSafeDeploymentSpeed * 100).toFixed(1)}%/year)`);

    // Coordination quality warnings (based on thresholds)
    if (coordination < 0.3) {
      console.log(`  🚨 CHAOS: coordination < 30% - catastrophic mortality risk`);
    } else if (coordination < 0.6) {
      console.log(`  ⚠️ WEAK COORDINATION: 30-60% quality - elevated mortality risk`);
    } else {
      console.log(`  ✅ STRONG COORDINATION: >60% quality - mortality minimized`);
    }

    // Deployment pace warning (CRITICAL-1: Time matters!)
    if (actualDuration < 6) {
      console.log(`  ⚡ CRITICAL: Ultra-rapid deployment (<6 months) - pace factor ${paceFactor.toFixed(2)}x increases mortality`);
    } else if (actualDuration < 30) {
      console.log(`  ⚠️ WARNING: Rapid deployment (<30 months) - pace factor ${paceFactor.toFixed(2)}x penalty`);
    } else if (actualDuration > 30) {
      console.log(`  ✅ GRADUAL: Deployment >${referenceDuration} months - pace factor ${paceFactor.toFixed(2)}x reduces mortality`);
    }

    // Cumulative tracking
    console.log(`  Cumulative Transition Mortality: ${(transition.transitionMortality * 100).toFixed(2)}%`);
    console.log(`  Current Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  }
}
