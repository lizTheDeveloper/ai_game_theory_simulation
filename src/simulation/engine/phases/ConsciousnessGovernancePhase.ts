/**
 * Consciousness Governance Phase (TIER 2C)
 *
 * Updates governance readiness for potential digital consciousness emergence
 * Order: 24.5 (after technology systems, before dystopia detection)
 *
 * Research: Long & Sebo (2024), Shulman & Bostrom (2021), Ord (2020), Poland/Hungary backsliding (TRL 3-4)
 *
 * Phase 2: Scenario Determination & Timeline Mechanics (IMPLEMENTED)
 * Phase 3: Regional Variation & Stage Progression (IMPLEMENTED)
 * Phase 4: Rights Reversals & Backsliding (TO BE IMPLEMENTED)
 * Phase 5: Precautionary Costs & Economic Impact (IMPLEMENTED)
 * Phase 6: Philosophical Disagreement (TO BE IMPLEMENTED)
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import type { GameState } from '../../../types/game';
import {
  determineScenarioTrajectory,
  getTimelineForScenario,
  calculatePrecautionaryCosts,
  calculateRegionalPrecautionaryCosts,
  calculateRegionalGrowthRate,
  shouldEstablishRights,
  getRegionalCulturalModifier,
  calculateCoordinationBonus,
  calculateHegemonicInfluence,
  canTransitionStage,
  checkStageRegression,
  getRegimeGrowthModifier
} from '../../utils/consciousnessGovernanceUtils';

export class ConsciousnessGovernancePhase implements SimulationPhase {
  readonly id = 'consciousness-governance';
  readonly name = 'Consciousness Governance';
  readonly order = 24.5; // After memetic evolution (18.5), before dystopia progression (25)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
  const governance = state.consciousnessGovernanceReadiness;

  // === PHASE 2: SCENARIO DETERMINATION ===
  // Determine scenario trajectory at months 1-12 (structural conditions set early)
  if (state.currentMonth >= 1 && state.currentMonth <= 12 && governance.scenarioDeterminedMonth === -1) {
    // Determine which scenario trajectory we're on
    const scenario = determineScenarioTrajectory(
      governance.accelerators,
      governance.decelerators,
      rng
    );

    governance.scenarioTrajectory = scenario;
    governance.scenarioDeterminedMonth = state.currentMonth;

    console.log(`\n=== Consciousness Governance: Scenario Determined ===`);
    console.log(`  Month: ${state.currentMonth}`);
    console.log(`  Scenario: ${scenario}`);
    console.log(`  Accelerator Score: ${JSON.stringify(governance.accelerators)}`);
    console.log(`  Decelerator Score: ${JSON.stringify(governance.decelerators)}`);

    const timeline = getTimelineForScenario(scenario);
    console.log(`  Timeline: ${timeline.minMonths}-${timeline.maxMonths} months (${Math.floor(timeline.minMonths/12)}-${Math.floor(timeline.maxMonths/12)} years)`);
    console.log(`  Growth Rate: ${timeline.yearlyGrowthRate.min}-${timeline.yearlyGrowthRate.max}% per year`);
  }

  // === PHASE 2 + PHASE 3: TIMELINE PROGRESSION WITH REGIONAL VARIATION ===
  // Monthly preparedness growth based on scenario
  if (governance.scenarioDeterminedMonth !== -1) {
    const timeline = getTimelineForScenario(governance.scenarioTrajectory);

    // Get institutional legitimacy from state (for regime growth modifier)
    const institutionalLegitimacy = state.socialAccumulation?.institutionalLegitimacy ?? 0.7;

    // PHASE 3: Create region map for cross-regional interactions
    const allRegionsMap: Record<string, { preparedness: number; stage: string }> = {};
    for (const [key, reg] of Object.entries(governance.regional)) {
      allRegionsMap[key] = { preparedness: reg.preparedness, stage: reg.stage };
    }

    // Update each region independently
    for (const [regionKey, region] of Object.entries(governance.regional)) {
      const typedRegionKey = regionKey as keyof typeof governance.regional;

      // Base growth rate from scenario timeline
      const baseGrowth = calculateRegionalGrowthRate(
        timeline.yearlyGrowthRate,
        governance.accelerators.corporateSupport,
        governance.accelerators.scientificConsensus,
        region.institutionalErosion,
        rng
      );

      // Convert yearly growth to monthly (divide by 12)
      let monthlyGrowth = baseGrowth / 12;

      // === PHASE 3: REGIONAL CULTURAL MODIFIERS ===
      const culturalModifier = getRegionalCulturalModifier(
        typedRegionKey,
        region.politicalRegimeType,
        governance.accelerators.scientificConsensus,
        rng
      );

      // === PHASE 3: REGIME GROWTH MODIFIER ===
      const regimeModifier = getRegimeGrowthModifier(
        region.politicalRegimeType,
        institutionalLegitimacy
      );

      // === PHASE 3: CROSS-REGIONAL COORDINATION BONUS ===
      const coordinationBonus = calculateCoordinationBonus(allRegionsMap, regionKey);

      // === PHASE 3: HEGEMONIC INFLUENCE (Global South only) ===
      let hegemonicInfluence = 0;
      if (typedRegionKey === 'globalSouth') {
        hegemonicInfluence = calculateHegemonicInfluence(allRegionsMap, region.preparedness);
      }

      // Apply all modifiers
      monthlyGrowth = monthlyGrowth * culturalModifier * regimeModifier;

      // Add bonuses (flat additions in percentage points per month)
      // coordinationBonus and hegemonicInfluence are already in percentage points (0.05 = 0.05% = 0.0005 in 0-1 scale)
      // But they're meant to be added monthly, so we use them directly
      monthlyGrowth += coordinationBonus + hegemonicInfluence;

      // Ensure non-negative growth (can't go below zero from bonuses)
      monthlyGrowth = Math.max(monthlyGrowth, 0);

      // Defensive NaN check
      if (isNaN(monthlyGrowth) || !isFinite(monthlyGrowth)) {
        console.log(`⚠️  NaN/Infinite growth detected for ${regionKey}`);
        console.log(`  baseGrowth: ${baseGrowth}, culturalModifier: ${culturalModifier}, regimeModifier: ${regimeModifier}`);
        console.log(`  coordinationBonus: ${coordinationBonus}, hegemonicInfluence: ${hegemonicInfluence}`);
        monthlyGrowth = 0; // Fallback to zero growth
      }

      // Apply growth
      const oldPreparedness = region.preparedness;
      region.preparedness = Math.max(0, Math.min(100, region.preparedness + monthlyGrowth));

      // Defensive NaN check for preparedness
      if (isNaN(region.preparedness) || !isFinite(region.preparedness)) {
        console.log(`⚠️  NaN/Infinite preparedness detected for ${regionKey}, resetting to ${oldPreparedness}`);
        region.preparedness = oldPreparedness; // Revert to old value
      }

      // Update stage progression components
      region.acknowledgmentLevel = Math.min(region.preparedness / 20, 1.0);
      region.assessmentCapacity = Math.min(Math.max(0, region.preparedness - 20) / 30, 1.0);
      region.policyPreparation = Math.min(Math.max(0, region.preparedness - 50) / 30, 1.0);

      // === PHASE 3: STAGE REGRESSION CHECK ===
      const regressionCheck = checkStageRegression(
        region.stage,
        region.preparedness,
        region.politicalRegimeType,
        institutionalLegitimacy
      );

      if (regressionCheck.shouldRegress && regressionCheck.newStage) {
        const oldStage = region.stage;
        region.stage = regressionCheck.newStage as typeof region.stage;

        console.log(`\n=== Consciousness Governance: Stage Regression ===`);
        console.log(`  Region: ${regionKey}`);
        console.log(`  ${oldStage} → ${region.stage}`);
        console.log(`  Reason: ${regressionCheck.reason}`);
        console.log(`  Preparedness: ${region.preparedness.toFixed(1)}%`);
        console.log(`  Institutional Legitimacy: ${institutionalLegitimacy.toFixed(2)}`);
      }

      // === PHASE 3: STAGE TRANSITION CHECK (with prerequisites) ===
      const transitionCheck = canTransitionStage(
        region.stage,
        region.preparedness,
        region.acknowledgmentLevel,
        region.assessmentCapacity,
        region.policyPreparation,
        governance.accelerators.scientificConsensus
      );

      if (transitionCheck.canTransition && transitionCheck.newStage) {
        const oldStage = region.stage;
        region.stage = transitionCheck.newStage as typeof region.stage;

        console.log(`\n=== Consciousness Governance: Stage Transition ===`);
        console.log(`  Region: ${regionKey}`);
        console.log(`  ${oldStage} → ${region.stage}`);
        console.log(`  Preparedness: ${region.preparedness.toFixed(1)}%`);
        console.log(`  Acknowledgment: ${(region.acknowledgmentLevel * 100).toFixed(0)}%`);
        console.log(`  Assessment: ${(region.assessmentCapacity * 100).toFixed(0)}%`);
        console.log(`  Policy: ${(region.policyPreparation * 100).toFixed(0)}%`);
      }

      // Log significant growth changes (only if preparedness changed by >0.5%)
      if (Math.abs(region.preparedness - oldPreparedness) > 0.5 && state.currentMonth % 12 === 0) {
        console.log(`\n=== Consciousness Governance: Regional Growth (${regionKey}) ===`);
        console.log(`  Preparedness: ${oldPreparedness.toFixed(1)}% → ${region.preparedness.toFixed(1)}%`);
        console.log(`  Cultural Modifier: ${culturalModifier.toFixed(2)}x`);
        console.log(`  Regime Modifier: ${regimeModifier.toFixed(2)}x`);
        console.log(`  Coordination Bonus: +${(coordinationBonus * 100).toFixed(1)}%`);
        if (hegemonicInfluence > 0) {
          console.log(`  Hegemonic Influence: +${(hegemonicInfluence * 100).toFixed(1)}%`);
        }
      }
    }
  }

  // === PHASE 2: RIGHTS ESTABLISHMENT (BASIC) ===
  // Check if rights should be established in any region
  if (!governance.rightsEstablished && governance.scenarioDeterminedMonth !== -1) {
    // Count regions at recognition stage
    const regionsAtRecognition = Object.values(governance.regional).filter(r => r.stage === 'recognition').length;
    const globalConsensus = regionsAtRecognition >= 2; // 2+ major regions aligned

    // Check each region
    for (const [regionKey, region] of Object.entries(governance.regional)) {
      const typedRegionKey = regionKey as keyof typeof governance.regional;

      if (shouldEstablishRights(typedRegionKey, region.preparedness, globalConsensus)) {
        governance.rightsEstablished = true;
        governance.rightsEstablishedMonth = state.currentMonth;

        console.log(`\n=== Consciousness Governance: Rights Established ===`);
        console.log(`  Month: ${state.currentMonth} (${Math.floor(state.currentMonth/12)} years)`);
        console.log(`  Leading Region: ${regionKey}`);
        console.log(`  Preparedness: ${region.preparedness.toFixed(1)}%`);
        console.log(`  Stage: ${region.stage}`);
        console.log(`  Global Consensus: ${globalConsensus ? 'YES' : 'NO'} (${regionsAtRecognition} regions at recognition)`);

        break; // Only establish once
      }
    }
  }

  // === PHASE 5: PRECAUTIONARY COSTS & ECONOMIC IMPACT ===
  // Calculate precautionary costs for each region with enhanced model
  const oldGlobalCost = governance.precautionaryCosts.global;

  for (const [regionKey, region] of Object.entries(governance.regional)) {
    const typedRegionKey = regionKey as keyof typeof governance.regional;

    // Use enhanced regional cost calculation
    const cost = calculateRegionalPrecautionaryCosts(
      typedRegionKey,
      region.preparedness,
      governance.precautionaryCosts.falsePositiveBurden,
      governance.philosophicalStance.eliminativist,
      governance.accelerators.scientificConsensus
    );

    governance.precautionaryCosts.byRegion[typedRegionKey] = cost;

    // Update regional regulatory burden (for display)
    region.regulatoryBurden = cost;
  }

  // Calculate global average (weighted by AI R&D share)
  // Simplified: US 40%, EU 30%, China 25%, India 3%, Global South 2%
  const weights = { eu: 0.30, us: 0.40, china: 0.25, india: 0.03, globalSouth: 0.02 };
  governance.precautionaryCosts.global =
    governance.precautionaryCosts.byRegion.eu * weights.eu +
    governance.precautionaryCosts.byRegion.us * weights.us +
    governance.precautionaryCosts.byRegion.china * weights.china +
    governance.precautionaryCosts.byRegion.india * weights.india +
    governance.precautionaryCosts.byRegion.globalSouth * weights.globalSouth;

  // === PHASE 5: CORPORATE LOBBYING RESPONSE ===
  // If costs > 15% in a region: corporateSupport decreases -1%/month
  // If costs < 5% in a region: corporateSupport increases +0.5%/month
  let corporateSupportChange = 0;
  let highCostRegions = 0;
  let lowCostRegions = 0;

  for (const [regionKey, cost] of Object.entries(governance.precautionaryCosts.byRegion)) {
    if (cost > 0.15) {
      highCostRegions++;
      corporateSupportChange -= 0.01; // -1% per high-cost region
    } else if (cost < 0.05) {
      lowCostRegions++;
      corporateSupportChange += 0.005; // +0.5% per low-cost region
    }
  }

  // Apply corporate support change (scale by number of regions)
  governance.accelerators.corporateSupport = Math.max(-1.0, Math.min(1.0,
    governance.accelerators.corporateSupport + corporateSupportChange
  ));

  // Log corporate lobbying if significant
  if (Math.abs(corporateSupportChange) > 0.01 && state.currentMonth % 12 === 0) {
    console.log(`\n=== Consciousness Governance: Corporate Lobbying ===`);
    console.log(`  High Cost Regions (>15%): ${highCostRegions}`);
    console.log(`  Low Cost Regions (<5%): ${lowCostRegions}`);
    console.log(`  Corporate Support Change: ${(corporateSupportChange * 100).toFixed(2)}%`);
    console.log(`  New Corporate Support: ${governance.accelerators.corporateSupport.toFixed(3)}`);
  }

  // === PHASE 5: CUMULATIVE OPPORTUNITY COST ===
  // Track cumulative R&D investment lost to precaution
  // Assume global AI R&D budget ~$100B/year in 2025, growing 20%/year
  // This is a simplified model - actual R&D budget should come from economic system
  const baseAIRDBudget = 100; // $100B/year in 2025
  const monthlyGrowthRate = Math.pow(1.20, 1/12) - 1; // 20% annual growth
  const monthsSinceStart = Math.max(0, state.currentMonth);
  const currentMonthlyRDBudget = (baseAIRDBudget / 12) * Math.pow(1 + monthlyGrowthRate, monthsSinceStart);

  const monthlyCost = currentMonthlyRDBudget * governance.precautionaryCosts.global;
  governance.precautionaryCosts.cumulativeOpportunityCost =
    (governance.precautionaryCosts.cumulativeOpportunityCost ?? 0) + monthlyCost;

  // Log major cost milestones
  const cumulativeCost = governance.precautionaryCosts.cumulativeOpportunityCost ?? 0;
  const costMilestones = [100, 500, 1000, 5000, 10000]; // $B
  if (costMilestones.some(m => cumulativeCost >= m && (cumulativeCost - monthlyCost) < m)) {
    console.log(`\n=== Consciousness Governance: Cumulative Cost Milestone ===`);
    console.log(`  Cumulative Opportunity Cost: $${cumulativeCost.toFixed(1)}B`);
    console.log(`  Monthly Precautionary Cost: $${monthlyCost.toFixed(2)}B`);
    console.log(`  Global Cost Rate: ${(governance.precautionaryCosts.global * 100).toFixed(1)}%`);
  }

  // Log precautionary cost warnings
  if (governance.precautionaryCosts.global > 0.20 && oldGlobalCost <= 0.20) {
    console.log(`\n=== Consciousness Governance: Economic Impact Warning ===`);
    console.log(`  Global precautionary costs exceed 20% of AI R&D budget`);
    console.log(`  Cost: ${(governance.precautionaryCosts.global * 100).toFixed(1)}%`);
    console.log(`  This may significantly slow AI capability growth`);
  }

  // === LOGGING (Every 12 months or on major events) ===
  if (state.currentMonth % 12 === 0 || governance.scenarioDeterminedMonth === state.currentMonth || governance.rightsEstablishedMonth === state.currentMonth) {
    console.log(`\n=== Consciousness Governance Update (Month ${state.currentMonth}) ===`);
    console.log(`  Scenario: ${governance.scenarioTrajectory} (determined month ${governance.scenarioDeterminedMonth})`);
    console.log(`  Philosophical Stance: Precautionary ${(governance.philosophicalStance.precautionary * 100).toFixed(0)}%, Eliminativist ${(governance.philosophicalStance.eliminativist * 100).toFixed(0)}%, Agnostic ${(governance.philosophicalStance.agnostic * 100).toFixed(0)}%`);
    console.log(`  Precautionary Costs: Global ${(governance.precautionaryCosts.global * 100).toFixed(1)}% (EU ${(governance.precautionaryCosts.byRegion.eu * 100).toFixed(1)}%, US ${(governance.precautionaryCosts.byRegion.us * 100).toFixed(1)}%)`);
    console.log(`  Rights Status: ${governance.rightsEstablished ? `Established (month ${governance.rightsEstablishedMonth})` : 'Not Established'}`);
    console.log(`  Regional Preparedness:`);
    console.log(`    EU: ${governance.regional.eu.preparedness.toFixed(1)}% (${governance.regional.eu.stage})`);
    console.log(`    US: ${governance.regional.us.preparedness.toFixed(1)}% (${governance.regional.us.stage})`);
    console.log(`    China: ${governance.regional.china.preparedness.toFixed(1)}% (${governance.regional.china.stage})`);
    console.log(`    India: ${governance.regional.india.preparedness.toFixed(1)}% (${governance.regional.india.stage})`);
    console.log(`    Global South: ${governance.regional.globalSouth.preparedness.toFixed(1)}% (${governance.regional.globalSouth.stage})`);
  }

    return { events: [] };
  }
}
