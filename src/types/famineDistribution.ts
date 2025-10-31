/**
 * Famine Distribution Mechanisms Types
 *
 * Sen's Entitlement Theory: "Famines are due to an inability of a person to exchange
 * their entitlements rather than to food unavailability." (Sen 1981)
 *
 * Transforms famine from production-only → distribution-based model.
 *
 * Research:
 * - Sen (1981): Poverty and Famines (Nobel Prize-winning work)
 * - Eshetu et al. (2024): Regional food insecurity heterogeneity (Nature Scientific Reports)
 * - Gaza 2023-24, Ukraine 2022-23, Bengal 1943 case studies
 *
 * CRITICAL: Creates regional heterogeneity. Same 40% global food shock →
 * 5-100% regional famine risk based on vulnerability factors.
 *
 * @see /research/famine_distribution_mechanisms_20251030.md
 * @see /reviews/famine_distribution_mechanisms_validation_20251030.md
 */

/**
 * Sen's Four Entitlement Types
 *
 * Famine occurs when people cannot ACCESS food, not when food doesn't EXIST.
 *
 * Historical validation: Bengal 1943
 * - Production: Down only 5%
 * - Deaths: 3 million
 * - Cause: 400% price spike, wages stagnant, purchasing power collapsed
 * - Rice was EXPORTED during the famine
 */
export interface Entitlements {
  // Production-based: Food grown directly by population
  productionBased: number;  // 0-1 (subsistence farmers)

  // Trade-based: Ability to purchase food with income
  tradeBased: number;       // 0-1 (market access + purchasing power)

  // Labor-based: Employment income to buy food
  laborBased: number;       // 0-1 (jobs + wages)

  // Transfer-based: Safety nets, aid, family support
  transferBased: number;    // 0-1 (government/NGO/family transfers)
}

/**
 * Distribution Networks
 *
 * Even 100% food production → 0% access if distribution fails.
 *
 * Case study: Gaza 2023-24
 * - Food availability: 38% (production + potential imports)
 * - Distribution effectiveness: 6% (blockade + infrastructure destroyed)
 * - Final access: 2.3%
 * - Result: Catastrophic famine (50% population IPC Phase 5)
 */
export interface DistributionNetworks {
  // Transport: Roads, ports, logistics functional
  transport: number;        // 0-1

  // Markets: Markets operating, prices stable
  markets: number;          // 0-1

  // Aid access: Humanitarian access permitted
  aidAccess: number;        // 0-1

  // Trade borders: Borders open, exports flowing
  tradeBorders: number;     // 0-1

  // Overall effectiveness (weighted average)
  effectiveness: number;    // 0-1
}

/**
 * Regional Vulnerability Factors
 *
 * Creates heterogeneity: Same global crisis → different regional outcomes.
 *
 * Research: 2022-23 Ukraine crisis
 * - Egypt (80% wheat imports from Russia/Ukraine): Severe crisis
 * - India (self-sufficient): Minimal impact
 * - USA/Brazil (exporters): Benefited from high prices
 */
export interface FamineVulnerabilityFactors {
  // Import dependence: % food imported (0-1)
  // High import dependence = vulnerable to trade disruption
  importDependence: number;

  // Conflict intensity: Active war destroys distribution (0-1)
  // ALL 5 recent famines (2011-2024) in conflict zones
  conflictIntensity: number;

  // Infrastructure quality: Transport, storage, markets (0-1)
  // Landlocked regions: 30% higher food prices
  infrastructureQuality: number;

  // Governance: State capacity for safety nets, coordination (0-1)
  governance: number;

  // Economic capacity: Can import food, provide safety net (0-1)
  economicCapacity: number;

  // Climate exposure: Drought/flood vulnerability (0-1)
  climateExposure: number;

  // Regional famine multiplier (calculated from above factors)
  // Range: 0.05-1.0 (5% to 100% famine risk for same global shock)
  famineMultiplier: number;
}

/**
 * Integrated Famine Risk Model
 *
 * Combines: Production + Entitlements + Distribution + Vulnerability
 *
 * Example: Three regions, 40% global food shock
 * - Sudan-like (high vulnerability): 100% catastrophic famine
 * - Egypt-like (medium vulnerability): 70% severe crisis
 * - Brazil-like (low vulnerability): 60% stressed (NOT famine)
 *
 * Heterogeneity achieved: 60-100% range vs current 100% homogeneous
 */
export interface RegionalFamineState {
  // Step 1: Food availability (production + imports)
  localProduction: number;      // 0-1
  importCapacity: number;        // 0-1 (reduced if global crisis)
  foodAvailability: number;      // Combined

  // Step 2: Distribution effectiveness
  distributionNetworks: DistributionNetworks;
  accessibleFood: number;        // availability × distribution

  // Step 3: Entitlements (can people access available food?)
  entitlements: Entitlements;
  foodSecurity: number;          // min(accessible, entitlements)

  // Step 4: Vulnerability multipliers
  vulnerability: FamineVulnerabilityFactors;

  // FINAL: Famine risk (0-1 range)
  famineRisk: number;            // (1 - foodSecurity) × vulnerability

  // Primary cause attribution
  primaryCause: 'production' | 'distribution' | 'entitlement' | 'conflict';
}

/**
 * Policy Interventions: Distribution Network Repair
 *
 * Ceasefire is game-changer (10× improvement).
 *
 * Research: Gaza blockade removal would transform catastrophic famine → crisis
 */
export interface DistributionIntervention {
  ceaseFire: boolean;              // Stops conflict → restores access
  infrastructureRepair: number;    // 0-1 (rebuild roads, ports, storage)
  marketSupport: number;           // 0-1 (price controls, currency stabilization)
  humanitarianCorridor: boolean;   // Negotiated aid access
}
