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
 * **RELATIONSHIP TO TransitionMortalityPhase:**
 * This phase SUPERSEDES the older TransitionMortalityPhase (deprecated Nov 21, 2025).
 * Both phases modeled transition mortality, but this implementation uses:
 * - Newer validated research (Grade B+, Nov 21, 2025)
 * - CRITICAL corrections (time-based pace factor, bottleneck constraints)
 * - Evidence-weighted support systems (retraining removed due to weak evidence)
 * - Power-law scaling (subadditive, not linear)
 *
 * TransitionMortalityPhase is now disabled to prevent double-counting deaths.
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
  GovernanceStage,
  AdopterCategory,
  MORTALITY_BASELINES,
  SUPPORT_EFFECTIVENESS,
  MAX_SAFE_DEPLOYMENT_SPEED
} from '@/types/transitionManagement';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertDefined,
  assertStateProperty
} from '@/simulation/utils/assertions';

/**
 * CoordinatedDeploymentPhase
 *
 * Each month:
 * 1. Assess coordination quality (AI capability + governance + infrastructure)
 * 2. Assess support system effectiveness (UBI, retraining, food, healthcare)
 * 3. Calculate deployment speed (% workforce displaced)
 * 4. Calculate base mortality risk (power-law scaling with techs deployed)
 * 5. Apply coordination stress (deployment volume, trust, capability stakes)
 * 6. Calculate mortality multiplier (stressed coordination, support, pace, governance)
 * 7. Apply regional heterogeneity (OECD vs low-income)
 * 8. Update population and tracking metrics
 *
 * CRITICAL-1 FIX (Nov 26, 2025): Removed fabricated discrete failure probability
 * - REMOVED: 10% probability of coordination failure with 2-5x mortality spike
 * - PROBLEM: Probability was FABRICATED (Hammond et al. 2025 provides qualitative taxonomy only)
 * - REPLACED: Continuous coordination stress model (deployment volume, trust, stakes)
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

    // === STEP 0: Update 3-Stage Governance Model (Nov 24, 2025) ===
    // Research: ai_coordination_transition_management_20251121.md
    // Stages: inactive -> recognition (0-6mo) -> decision (6-18mo) -> implementation (18-36mo)
    this.updateGovernanceStage(state);

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

    // === STEP 6: Calculate Governance Stage Modifier (Nov 24, 2025) ===
    // Research: ai_coordination_transition_management_20251121.md
    // 32-37% mortality reduction when fully in implementation phase
    const governanceStageModifier = this.calculateGovernanceStageModifier(state);

    // === STEP 6b: Apply Continuous Coordination Stress (CRITICAL-1: Nov 26 fabrication fix) ===
    // PREVIOUS APPROACH (REMOVED): Discrete 10% failure probability with 2-5x mortality spikes
    // PROBLEM: The "10%" probability was FABRICATED - Hammond et al. 2025 provides qualitative
    //          taxonomy only (miscoordination, conflict, collusion), NO numerical probabilities.
    //
    // NEW APPROACH: Continuous coordination degradation under stress
    // - High deployment volume → coordination quality degrades
    // - Low trust → coordination quality degrades
    // - High stakes (capability) → coordination quality degrades
    // - Degraded coordination → higher mortality (via existing multiplier formula)
    //
    // Research: Hammond et al. 2025 (arXiv:2502.14143) - qualitative framework ONLY
    // No empirical baseline for failure probabilities exists in literature.

    // Calculate coordination stress factors
    const deploymentStress = Math.min(1.0, transition.recentDeploymentsCount / 10.0); // 0-1, saturates at 10 deployments
    const trustStress = (1.0 - (transition.aiCoordinationCapability * 0.7)); // Proxy for trust (0-1)
    const capabilityStress = state.aiAgents.length > 0
      ? Math.min(1.0, state.aiAgents.reduce((max, a) => Math.max(max, a.capabilityProfile?.cognitive || 0), 0) / 10.0)
      : 0.0; // High capability = high stakes

    // Combined stress (weighted average)
    const coordinationStress = assertFinite(
      deploymentStress * 0.5 + trustStress * 0.3 + capabilityStress * 0.2,
      {
        location: 'CoordinatedDeploymentPhase.execute (coordination stress)',
        valueName: 'coordinationStress',
        month: state.currentMonth,
        additionalInfo: { deploymentStress, trustStress, capabilityStress }
      }
    );

    // Degrade coordination quality based on stress
    // Original coordinationQuality from assessCoordinationQuality()
    // Apply stress penalty: quality *= (1 - stress * 0.5)
    // Example: stress=0.8 → quality reduced by 40%
    const stressedCoordinationQuality = assertProbability(
      coordinationQuality * (1.0 - coordinationStress * 0.5),
      {
        location: 'CoordinatedDeploymentPhase.execute (stressed coordination)',
        valueName: 'stressedCoordinationQuality',
        month: state.currentMonth,
        additionalInfo: {
          originalQuality: coordinationQuality,
          coordinationStress,
          stressPenalty: coordinationStress * 0.5
        }
      }
    );

    // === STEP 6c: Calculate Mortality Multiplier (Nov 21 validated, Nov 24 governance added, Nov 26 stress added) ===
    // multiplier = (2.0 - stressedCoordination) * (1.5 - support) * pace_factor * governance_stage_modifier
    // Uses stressed coordination quality (not raw) to account for coordination failures
    const mortalityMultiplier = assertFinite(
      (2.0 - stressedCoordinationQuality) *
      (1.5 - supportEffectiveness) *
      paceFactor *
      governanceStageModifier,
      {
        location: 'CoordinatedDeploymentPhase.execute (mortality multiplier)',
        valueName: 'mortalityMultiplier',
        month: state.currentMonth,
        additionalInfo: {
          stressedCoordinationQuality,
          supportEffectiveness,
          paceFactor,
          governanceStageModifier
        }
      }
    );

    // === STEP 7: Calculate Mortality Fraction (exponential saturation) ===
    // mortality_fraction = 1 - exp(-base * multiplier)
    // Prevents >100% mortality while allowing high base*multiplier values
    let mortalityFraction = 1.0 - Math.exp(-baseRisk * mortalityMultiplier);

    // === STEP 7A: Decay Deployment Counter (Nov 21 Conservative Parameters) ===
    // HIGH-1 FIX (Nov 21, 2025): Decay deployment counter monthly to track "recent" deployments
    // 50% decay per month means deployments become "stale" after ~2 months
    // This prevents accumulating old deployments indefinitely
    if (state.currentMonth % 1 === 0) { // Every month
      const decayRate = 0.50; // 50% monthly decay (exponential)
      const oldCount = transition.recentDeploymentsCount;
      transition.recentDeploymentsCount = Math.max(0, oldCount * (1 - decayRate));

      if (Math.abs(oldCount - transition.recentDeploymentsCount) > 0.5 && oldCount > 1) {
        console.log(`\n📊 DEPLOYMENT COUNTER DECAY (Month ${state.currentMonth})`);
        console.log(`   Recent deployments: ${oldCount.toFixed(1)} → ${transition.recentDeploymentsCount.toFixed(1)}`);
        console.log(`   Decay rate: ${(decayRate * 100).toFixed(0)}% per month`);
      }
    }

    // === STEP 7B: Apply Rebound Effects (Nov 21 Conservative Parameters) ===
    // Jevons paradox: Efficiency gains → consumption increase → environmental degradation
    // Decay rate: 5-10% per year (central: 7.5%)
    // Research: Finkelstein et al. (2025) - Great Recession mortality/pollution link

    // Update rebound effectiveness annually (decay over time)
    if (state.currentMonth % 12 === 0 && transition.monthsOfActiveDeployment > 0) {
      // Annual decay: effectiveness *= (1 - decay_rate)
      // Decay rate: 0.075 = 7.5% per year
      const annualDecay = transition.reboundDecayRate; // 0.075 (7.5% per year)
      const oldEffectiveness = transition.reboundEffectiveness;

      transition.reboundEffectiveness = assertFinite(
        Math.max(0.1, oldEffectiveness * (1 - annualDecay)), // Floor at 10% effectiveness
        {
          location: 'CoordinatedDeploymentPhase.execute (rebound decay)',
          valueName: 'reboundEffectiveness after annual decay',
          month: state.currentMonth,
          additionalInfo: {
            oldEffectiveness,
            annualDecay,
            yearsActive: Math.floor(transition.monthsOfActiveDeployment / 12)
          }
        }
      );

      if (oldEffectiveness !== transition.reboundEffectiveness) {
        console.log(`\n⚠️📉 REBOUND EFFECT: Technology effectiveness decaying (Jevons paradox)`);
        console.log(`  Effectiveness: ${(oldEffectiveness * 100).toFixed(1)}% → ${(transition.reboundEffectiveness * 100).toFixed(1)}%`);
        console.log(`  Mechanism: Efficiency → consumption → environmental degradation → mortality`);
      }
    }

    // Apply rebound effectiveness multiplier
    // Lower effectiveness = higher mortality (inverse relationship)
    // Example: 80% effectiveness → 1.25x mortality (1 / 0.8)
    const reboundMultiplier = 1.0 / Math.max(0.1, transition.reboundEffectiveness);
    mortalityFraction = assertFinite(
      mortalityFraction * reboundMultiplier,
      {
        location: 'CoordinatedDeploymentPhase.execute (rebound effect)',
        valueName: 'mortalityFraction after rebound effect',
        month: state.currentMonth,
        additionalInfo: {
          reboundEffectiveness: transition.reboundEffectiveness,
          reboundMultiplier
        }
      }
    );

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

    // === STEP 10: Apply mortality to population ===
    // CRITICAL FIX (Nov 21, 2025): Apply deaths to regional populations FIRST
    // to prevent race condition with HumanPopulationPhase aggregation.
    //
    // Previously: Modified global population directly → HumanPopulationPhase
    // aggregation from regions overwrote the changes, causing silent data loss.
    //
    // Now: Apply deaths proportionally to regions, then global value will be
    // correct when HumanPopulationPhase aggregates.

    // Validate we have regional populations (should always exist after initialization)
    const regions = state.humanPopulationSystem.regionalPopulations;
    if (!regions || regions.length === 0) {
      throw new Error(
        `❌ CRITICAL: regionalPopulations missing at month ${state.currentMonth}\n` +
        `  Regional populations required to apply transition deaths.\n` +
        `  This indicates initialization.ts failed to create regional populations.`
      );
    }

    // CRITICAL: Use regional sum as source of truth (NOT global value)
    // If a previous phase modified regions without updating global, using global
    // would cause wrong death distribution fractions.
    const regionalSumMillions = regions.reduce((sum, r) => sum + r.population, 0);
    const population = regionalSumMillions / 1000; // Convert millions → billions
    const populationLost = population * monthlyMortality;

    // Track global population before modification for assertion
    const globalPopulationBefore = state.humanPopulationSystem.population;

    // Apply deaths proportionally to each region (same pattern as BayesianMortalityResolution)
    for (const region of regions) {
      const regionFraction = region.population / regionalSumMillions; // Fraction of REGIONAL sum
      const regionalDeaths = (populationLost * 1000) * regionFraction; // Convert billions → millions for regional scale

      region.population = assertFinite(
        Math.max(0, region.population - regionalDeaths),
        {
          location: 'CoordinatedDeploymentPhase.execute (regional mortality)',
          valueName: `${region.name} population after transition deaths`,
          month: state.currentMonth,
          additionalInfo: {
            regionalDeaths,
            populationBefore: region.population,
            regionFraction
          }
        }
      );

      // Track at regional level for debugging
      region.monthlyExcessDeaths = (region.monthlyExcessDeaths || 0) + regionalDeaths;
      region.cumulativeCrisisDeaths = (region.cumulativeCrisisDeaths || 0) + regionalDeaths;
    }

    // Update global population (will be re-aggregated by HumanPopulationPhase, but set correctly now)
    state.humanPopulationSystem.population = assertFinite(
      Math.max(0, population - populationLost),
      {
        location: 'CoordinatedDeploymentPhase.execute',
        valueName: 'population after transition mortality',
        month: state.currentMonth,
        additionalInfo: {
          populationLost,
          monthlyMortality,
          populationBefore: globalPopulationBefore
        }
      }
    );

    // ASSERTION: Verify regional sum matches global value (detect desync immediately)
    // NOTE: Regional populations are in MILLIONS, global is in BILLIONS
    // Recalculate regional sum AFTER applying deaths
    const regionalSumMillionsAfter = regions.reduce((sum, r) => sum + r.population, 0);
    const regionalSumBillions = regionalSumMillionsAfter / 1000;
    const globalValue = state.humanPopulationSystem.population;
    const discrepancy = Math.abs(regionalSumBillions - globalValue);

    // Allow tiny floating-point errors but catch real desyncs
    if (discrepancy > 0.001) {
      throw new Error(
        `❌ RACE CONDITION DETECTED: Regional/global population desync after transition deaths\n` +
        `  Month: ${state.currentMonth}\n` +
        `  Global value: ${globalValue.toFixed(6)}B\n` +
        `  Regional sum: ${regionalSumBillions.toFixed(6)}B (${regionalSumMillions.toFixed(2)}M)\n` +
        `  Discrepancy: ${discrepancy.toFixed(6)}B\n` +
        `  This indicates transition deaths were applied incorrectly.`
      );
    }

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
    const coordinationBase = Math.min(
      coordinationRaw,
      aiTrust * 2.0,        // Can't coordinate beyond 2x trust level
      governance * 1.5      // Can't coordinate beyond 1.5x governance capacity
    );

    // Apply epistemic health modifier from Information Ecology (Dec 12, 2025)
    // Degraded information environment reduces coordination capacity
    //
    // CRITICAL DESIGN: Multiplicative decay is INTENTIONAL
    // - Epistemic collapse (misinformation) × Crisis shock → Catastrophic coordination failure
    // - Historical evidence: COVID-19 (misinformation + pandemic = coordination breakdown)
    // - Recovery mechanism: Aligned AI can restore coordination via trusted channels
    // - Death spirals are realistic when information environment degrades under stress
    const epistemicModifier = assertStateProperty(
      state.society,
      'coordinationCapacity',
      {
        location: 'CoordinatedDeploymentPhase.assessCoordinationQuality',
        month: state.currentMonth
      }
    );
    const coordinationQuality = assertFinite(
      coordinationBase * epistemicModifier,
      {
        location: 'CoordinatedDeploymentPhase.assessCoordinationQuality',
        valueName: 'coordinationQuality after epistemic modifier',
        month: state.currentMonth,
        additionalInfo: {
          coordinationBase,
          epistemicModifier,
          epistemicHealth: state.informationEcology?.epistemicHealth,
          note: 'Multiplicative decay is intentional - epistemic collapse + crisis = catastrophic failure'
        }
      }
    );

    assertProbability(coordinationQuality, {
      location: 'CoordinatedDeploymentPhase.assessCoordinationQuality',
      valueName: 'coordinationQuality (final)',
      month: state.currentMonth,
      additionalInfo: {
        coordinationRaw,
        coordinationBase,
        epistemicModifier,
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
   * INTEGRATION FIX (Nov 24 2025): Read from actual dynamic game state, not static values
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

    // === READ FROM DYNAMIC GAME STATE (Nov 24, 2025 Integration Fix) ===
    // Previously used static transitionManagementSystem.supportSystems values
    // Now reads from actual dynamic systems that change during simulation

    // UBI Coverage: Read from actual UBI system (updated by UBI phase and tech effects)
    const ubiCoverage = assertFinite(
      state.ubiSystem?.basicIncome?.coverage ?? support.ubiCoverage,
      {
        location: 'CoordinatedDeploymentPhase.assessSupportSystems',
        valueName: 'ubiCoverage',
        month: state.currentMonth,
        additionalInfo: { source: state.ubiSystem ? 'ubiSystem.basicIncome.coverage' : 'fallback' }
      }
    );

    // Healthcare Coverage: Read from social safety nets (updated by government actions)
    const healthcareCoverage = assertFinite(
      state.socialSafetyNets?.universalServices?.healthcare ?? support.universalHealthcareCoverage,
      {
        location: 'CoordinatedDeploymentPhase.assessSupportSystems',
        valueName: 'healthcareCoverage',
        month: state.currentMonth,
        additionalInfo: { source: state.socialSafetyNets ? 'socialSafetyNets.universalServices.healthcare' : 'fallback' }
      }
    );

    // Food Security: Read from coordinatedDeployment or famine system urbanFoodAccess
    // Priority: coordinatedDeployment.supportSystems.foodSecurity > famineSystem.urbanFoodAccess > fallback
    const foodSecurityIndex = assertFinite(
      state.coordinatedDeployment?.supportSystems?.foodSecurity ??
      state.famineSystem?.urbanFoodAccess ??
      support.foodSecurityIndex,
      {
        location: 'CoordinatedDeploymentPhase.assessSupportSystems',
        valueName: 'foodSecurityIndex',
        month: state.currentMonth,
        additionalInfo: {
          source: state.coordinatedDeployment?.supportSystems?.foodSecurity !== undefined
            ? 'coordinatedDeployment.supportSystems.foodSecurity'
            : state.famineSystem?.urbanFoodAccess !== undefined
              ? 'famineSystem.urbanFoodAccess'
              : 'fallback'
        }
      }
    );

    // Sync back to tracking (for logging and debugging)
    support.ubiCoverage = ubiCoverage;
    support.universalHealthcareCoverage = healthcareCoverage;
    support.foodSecurityIndex = foodSecurityIndex;

    // Evidence-weighted combination (Nov 21 validated research)
    const ubiEffect = ubiCoverage * 0.5;        // Strong evidence: Kenya RCT
    const healthEffect = healthcareCoverage * 0.35;  // Strong evidence: Kenya mechanism
    const foodEffect = foodSecurityIndex * 0.15;     // Strong negative evidence: Great Leap famine
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
        ubiCoverage,
        healthcareCoverage,
        foodSecurityIndex,
        ubiEffect,
        healthEffect,
        foodEffect,
        retrainingEffect,
        note: 'Nov 24 fix: Now reads from dynamic game state (UBI, socialSafetyNets, famineSystem)'
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

  // DEPRECATED METHOD REMOVED (Nov 21, 2025)
  // Old determineDeploymentMode() used discrete thresholds (chaos/uncoordinated/coordinated).
  // Nov 21 validated research uses continuous formula instead.
  // See git history if you need to restore: commit before removal.

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

  // DEPRECATED METHOD REMOVED (Nov 21, 2025)
  // Old applyDeploymentSpeedPenalty() used workforce displacement % threshold.
  // Nov 21 validated research shows TIME is the critical variable (pace factor).
  // See git history if you need to restore: commit before removal.

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

    // Recalculate coordination stress for logging (same logic as execute())
    const deploymentStress = Math.min(1.0, transition.recentDeploymentsCount / 10.0);
    const trustStress = (1.0 - (transition.aiCoordinationCapability * 0.7));
    const capabilityStress = state.aiAgents.length > 0
      ? Math.min(1.0, state.aiAgents.reduce((max, a) => Math.max(max, a.capabilityProfile?.cognitive || 0), 0) / 10.0)
      : 0.0;
    const coordinationStress = deploymentStress * 0.5 + trustStress * 0.3 + capabilityStress * 0.2;
    const stressedCoordination = coordination * (1.0 - coordinationStress * 0.5);

    // Calculate governance stage modifier
    const governanceStageModifier = this.calculateGovernanceStageModifier(state);

    // Calculate multiplier and fraction (using stressed coordination)
    const multiplier = (2.0 - stressedCoordination) * (1.5 - support) * paceFactor * governanceStageModifier;
    const mortalityFraction = 1.0 - Math.exp(-baseRisk * multiplier);
    const annualMortality = mortalityFraction;

    console.log(`\n=== 🤝 Coordinated Deployment Phase (Year ${Math.floor(state.currentMonth / 12)}) ===`);
    console.log(`  Coordination Quality (raw): ${(coordination * 100).toFixed(1)}% (bottleneck-constrained)`);
    console.log(`  Coordination Stress: ${(coordinationStress * 100).toFixed(1)}% (deployment volume, trust, stakes)`);
    console.log(`  Coordination Quality (stressed): ${(stressedCoordination * 100).toFixed(1)}%`);
    console.log(`  🛡️ Support System Effectiveness: ${(support * 100).toFixed(1)}% (evidence-weighted, no retraining)`);
    console.log(`  Base Risk: ${(baseRisk * 100).toFixed(3)}% (power-law: ${transition.recentDeploymentsCount} techs^0.8)`);
    console.log(`  ⏱️ Pace Factor: ${paceFactor.toFixed(2)}x (${actualDuration} months vs ${referenceDuration} month reference)`);
    console.log(`  Governance Stage Modifier: ${governanceStageModifier.toFixed(2)}x`);
    console.log(`  Mortality Multiplier: ${multiplier.toFixed(2)}x`);
    console.log(`  ⚠️ Projected Annual Mortality: ${(annualMortality * 100).toFixed(2)}%`);
    console.log(`  Deployment Speed: ${(speed * 100).toFixed(1)}%/year (threshold: ${(transition.maxSafeDeploymentSpeed * 100).toFixed(1)}%/year)`);

    // Coordination quality warnings (based on STRESSED coordination)
    if (stressedCoordination < 0.3) {
      console.log(`  🚨 CHAOS: stressed coordination < 30% - catastrophic mortality risk`);
    } else if (stressedCoordination < 0.6) {
      console.log(`  ⚠️ WEAK COORDINATION: 30-60% stressed quality - elevated mortality risk`);
    } else {
      console.log(`  ✅ STRONG COORDINATION: >60% stressed quality - mortality minimized`);
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

  // ============================================================================
  // 3-STAGE GOVERNANCE MODEL METHODS (Nov 24, 2025)
  // Research: ai_coordination_transition_management_20251121.md
  // ============================================================================

  /**
   * Update 3-Stage Governance Model
   * Transitions: inactive -> recognition (0-6mo) -> decision (6-18mo) -> implementation (18-36mo)
   */
  private updateGovernanceStage(state: GameState): void {
    const transition = state.transitionManagementSystem;
    const month = state.currentMonth;

    switch (transition.governanceStage) {
      case 'inactive':
        if (this.isCrisisDetected(state)) {
          transition.governanceStage = 'recognition';
          transition.stageEnteredMonth = month;
          transition.crisisRecognizedMonth = month;
          console.log(`\n🚨🔍 GOVERNANCE STAGE: Recognition initiated (Month ${month})`);
        }
        break;

      case 'recognition':
        const recognitionDuration = month - transition.crisisRecognizedMonth;
        if (recognitionDuration >= transition.stageTiming.recognitionDuration &&
            transition.coordinationQuality > 0.3) {
          transition.governanceStage = 'decision';
          transition.stageEnteredMonth = month;
          transition.decisionMadeMonth = month;
          console.log(`\n🏛️📋 GOVERNANCE STAGE: Decision phase started (Month ${month})`);
        }
        break;

      case 'decision':
        const decisionDuration = month - transition.decisionMadeMonth;
        // Research: Implementation should begin 18-36 months after crisis recognition
        // Threshold reduced from 0.4 to 0.3 to match realistic support growth rates
        // Fallback: After 24 months in decision phase, force transition (delayed implementation)
        const supportThresholdMet = transition.supportSystemEffectiveness >= 0.3;
        const maxDecisionDurationExceeded = decisionDuration >= 24; // 2 years max in decision phase

        if (decisionDuration >= transition.stageTiming.decisionDuration &&
            (supportThresholdMet || maxDecisionDurationExceeded)) {
          transition.governanceStage = 'implementation';
          transition.stageEnteredMonth = month;
          transition.implementationStartedMonth = month;
          if (maxDecisionDurationExceeded && !supportThresholdMet) {
            console.log(`\n🚀📦 GOVERNANCE STAGE: Implementation phase started (Month ${month}) [DELAYED - support only ${(transition.supportSystemEffectiveness * 100).toFixed(1)}%]`);
          } else {
            console.log(`\n🚀📦 GOVERNANCE STAGE: Implementation phase started (Month ${month})`);
          }
        }
        break;

      case 'implementation':
        this.updateAdoptionCurve(state);
        break;
    }
  }

  /**
   * Detect if crisis threshold is met for governance activation
   */
  private isCrisisDetected(state: GameState): boolean {
    // Crisis trigger: High AI capability
    const avgCapability = state.aiAgents.length > 0
      ? state.aiAgents.reduce((sum, a) => sum + (a.capabilityProfile?.cognitive || 0), 0) / state.aiAgents.length
      : 0;
    if (avgCapability > 6) return true;

    // Crisis trigger: Multiple misaligned AI agents
    const misalignedCount = state.aiAgents.filter(a => a.alignment < 0.7).length;
    if (misalignedCount > 3) return true;

    // Crisis trigger: Environmental degradation (high pollution level)
    if (state.environmentalAccumulation && state.environmentalAccumulation.pollutionLevel > 0.5) return true;

    // Crisis trigger: High transition mortality
    if (state.transitionManagementSystem.mortalityThisMonth > 0.01) return true;

    // Crisis trigger: Rapid tech deployment
    if (state.transitionManagementSystem.recentDeploymentsCount > 5) return true;

    return false;
  }

  /**
   * Update S-Curve Adoption (Rogers Diffusion Model)
   * Research: Rogers (1962) Diffusion of Innovations
   */
  private updateAdoptionCurve(state: GameState): void {
    const transition = state.transitionManagementSystem;
    const monthsInImplementation = state.currentMonth - transition.implementationStartedMonth;

    // Logistic S-curve parameters
    const k = 0.15;  // Growth rate
    const tMid = 18; // Midpoint (months)

    // S-curve formula: adoption = 1 / (1 + e^(-k*(t - tMid)))
    const adoptionLevel = 1 / (1 + Math.exp(-k * (monthsInImplementation - tMid)));
    transition.adoptionCurve.adoptionLevel = adoptionLevel;

    // Velocity is derivative of logistic: k * adoption * (1 - adoption)
    const velocity = k * adoptionLevel * (1 - adoptionLevel);
    transition.adoptionCurve.adoptionVelocity = velocity;

    // Update adopter category based on Rogers model
    const prevCategory = transition.adoptionCurve.currentCategory;
    let newCategory: AdopterCategory;

    if (adoptionLevel < 0.025) {
      newCategory = 'innovators';      // 0-2.5%
    } else if (adoptionLevel < 0.16) {
      newCategory = 'earlyAdopters';   // 2.5-16%
    } else if (adoptionLevel < 0.50) {
      newCategory = 'earlyMajority';   // 16-50%
    } else if (adoptionLevel < 0.84) {
      newCategory = 'lateMajority';    // 50-84%
    } else {
      newCategory = 'laggards';        // 84-100%
    }

    if (newCategory !== prevCategory) {
      transition.adoptionCurve.currentCategory = newCategory;
      console.log(`\n📈 S-CURVE ADOPTION: ${prevCategory} -> ${newCategory} (${(adoptionLevel * 100).toFixed(1)}%)`);
    }
  }

  /**
   * Calculate governance stage modifier for mortality
   * Research: 32-37% excess mortality reduction when fully in implementation phase
   */
  private calculateGovernanceStageModifier(state: GameState): number {
    const transition = state.transitionManagementSystem;

    let modifier: number;
    switch (transition.governanceStage) {
      case 'inactive':
      case 'recognition':
        // No coordinated response yet - elevated mortality
        modifier = 1.5;
        break;
      case 'decision':
        // Partial coordination - moderate mortality
        modifier = 1.2;
        break;
      case 'implementation':
        // Full coordination - 32-37% reduction at full adoption
        const reductionFactor = 0.35 * transition.adoptionCurve.adoptionLevel;
        modifier = 1.0 - reductionFactor;
        break;
      default:
        modifier = 1.0;
    }

    return assertFinite(modifier, {
      location: 'CoordinatedDeploymentPhase.calculateGovernanceStageModifier',
      valueName: 'governanceStageModifier',
      month: state.currentMonth,
      additionalInfo: {
        governanceStage: transition.governanceStage,
        adoptionLevel: transition.adoptionCurve?.adoptionLevel || 0
      }
    });
  }
}
