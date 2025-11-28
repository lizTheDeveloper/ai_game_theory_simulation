/**
 * Novel Entities Crisis System (TIER 1.5)
 * 
 * Models synthetic chemical pollution - 5th planetary boundary breached 2022.
 * Research: Kate Raworth, Stockholm Resilience Centre
 * 
 * Key findings:
 * - Microplastics everywhere (blood, placenta, organs)
 * - PFAS in 99% of human blood ("forever chemicals")
 * - 50% sperm count decline in 50 years
 * - Endocrine disruption widespread
 * - Slow poisoning: 100-200 year timeline
 * - Bioaccumulation hits apex predators (including humans)
 */

import { GameState } from '@/types/game';
import { NovelEntitiesSystem } from '@/types/novelEntities';
import { RootCause } from '@/types/population';
import { assertStateProperty, assertFinite } from './utils/assertions';
import { addMortalityRisk } from './bayesianMortality';
import { asymptoteRecovery, legacyStockRelease } from './utils/irreversibility';
import { isTechDeployed } from './techTree/helpers';
import { isHistoricalModeActive } from './utils/historicalMode';

/**
 * Initialize novel entities system state (2025 baseline - ALREADY BREACHED)
 */
export function initializeNovelEntitiesSystem(): NovelEntitiesSystem {
  return {
    syntheticChemicalLoad: 0.40,         // Already significant (breached 2022)
    microplasticConcentration: 0.45,     // Widespread contamination
    pfasPrevalence: 0.50,                // In 99% of humans = 50% on 0-1 scale
    endocrineDisruption: 0.25,           // Early signs visible
    reproductiveHealthDecline: 0.25,     // 50% decline over 50 years = ~0.5%/year cumulative
    bioaccumulationFactor: 0.30,         // Concentrating up food chain
    chronicDiseasePrevalence: 0.20,      // Baseline cancer/autoimmune rates
    boundaryBreached: true,              // Breached 2022
    reproductiveCrisisActive: false,
    chronicDiseaseEpidemicActive: false,
    bioaccumulationCollapseActive: false,
    exposureMonths: 0,
    greenChemistryDeployment: 0.05,      // Minimal adoption
    circularEconomyDeployment: 0.10,     // Some programs
    chemicalBansDeployment: 0.15,        // Some chemicals banned (e.g., some pesticides)
    bioremediationDeployment: 0.0,       // Emerging technology

    // CRITICAL FIX (Nov 11, 2025): Stock vs flow tracking (Ling 2024)
    baselineAnnualEmissions: 60000,      // 60,000 Mt/year BASELINE (mid-range: 20,000-100,000 Mt/yr from Ling 2024)
    annualEmissions: 60000,              // 60,000 Mt/year (starts at baseline, modified by prevention tech)
    preventionMultiplier: 1.0,           // 1.0 = no prevention deployed yet (100% of baseline emissions)
    accumulatedStock: 1800000,           // 1.8M Mt (30 years × 60k/yr - decades of accumulation)
    atmosphericDistribution: true,       // PFAS in rainwater globally (Cousins 2022: all continents + Antarctica)
    naturalDecayHalfLife: 500,           // 500 years (PFAS "forever chemicals" persist centuries)

    // CRITICAL FIX (Nov 12, 2025): Energy trap constraints (Ling 2024, Fennell 2024, Cousins 2022)
    industrialContamination: 0.15,       // 15% - Industrial point sources (mg/L concentration, treatable)
    environmentalContamination: 0.35,    // 35% - Diffuse environmental (ng/L-pg/L, energy trap)
    atmosphericRedepositionRate: 0.01,   // 1% of legacy stock re-rains monthly (Cousins 2022)
    biologicalDegradationRate: 0.0001,   // 0.01% per month = 0.12% per year (slow but non-zero, 2024 research)
    atmosphericReservoirStock: 180000,   // 180,000 Mt in atmospheric reservoir (10% of total stock cycles)

    // CRITICAL FIX (Nov 18, 2025): Phase 3 - Irreversibility + Energy Trap + Rebound Effects
    // Research: Ling 2024, Cousins 2022, Kane 2020, UNEP 2024, Sorrell 2025
    //
    // CLARIFICATION (Nov 20, 2025): Thompson et al. PNAS Nexus (2024) provides conceptual
    // framework for (ir)reversibility but does NOT contradict 87.5% parameter.
    // - Thompson is semantic analysis (how terms are used), not quantitative meta-analysis
    // - Climate system reversibility (60-70% for precipitation) applies to DIFFERENT systems
    //   on DIFFERENT timescales (centuries), NOT persistent pollutants (PFAS, microplastics)
    // - See: research/irreversibility_reconciliation_20251120.md (Grade C, NO CONTRADICTION)

    // Irreversibility (HIGH UNCERTAINTY: 80-95% range, ±7.5%)
    irreversibleFraction: 0.875,         // 87.5% (midpoint of 80-95% research range)
                                         // Cousins et al. ES&T (2022): PFAS atmospheric half-life 50-100 years
                                         // Kane et al. Science (2020): Deep-sea microplastics, centuries persistence
                                         // Ling et al. ES&T (2024): Cleanup cost 0.2-66× GDP, economic impossibility
                                         // Thompson et al. PNAS Nexus (2024): Conceptual framework (timescale-dependent)
    reversibleStock: 1800000 * 0.125,    // 225,000 Mt (12.5% of accumulated stock)
    irreversibleStock: 1800000 * 0.875,  // 1,575,000 Mt (87.5% persists indefinitely)
    minimumAchievableLevel: 1800000 * 0.875, // Asymptotic floor = irreversible stock

    // Energy constraints (Ling 2024: 0.2-66× GDP energy requirement)
    renewableEnergySurplus: 0,           // TWh/year (calculated from energy system)
    cleanupEnergyRequirement: 50000,     // 50,000 TWh/year (gigatonne-scale PFAS cleanup)
                                         // Ling 2024: $20-7,000 trillion/year cost
                                         // Global energy ~180,000 TWh/year → 28% required

    // Rebound effects (HIGH UNCERTAINTY: 50-90% range)
    reboundFactor: 0.7,                  // 70% (midpoint of 0.5-0.9 research range)
                                         // UNEP 2024: Waste +81% despite circular economy tech
                                         // Sorrell 2025: AI efficiency → increased deployment
    reboundTimelagMonths: 240,           // 20 years (midpoint of 10-30 year estimate)
    monthsSinceCleanupDeployment: 0,     // No cleanup tech deployed yet
    cleanupInducedProduction: 0,         // Mt/year (calculated when cleanup active)
  };
}

/**
 * Update novel entities system each month
 */
export function updateNovelEntitiesSystem(state: GameState): void {
  if (!state.novelEntitiesSystem) return;
  
  const ne = state.novelEntitiesSystem;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const manufacturingCap = state.globalMetrics.manufacturingCapability;
  
  ne.exposureMonths++;

  // === STOCK vs FLOW TRACKING (Nov 11, 2025: Architecture fix) ===
  // Update absolute megatonne stock alongside normalized [0,1] load
  // Research: Sörengård 2024 ($20-7T trillion/year cleanup cost at current emissions)
  if (ne.annualEmissions !== undefined && ne.accumulatedStock !== undefined && ne.naturalDecayHalfLife !== undefined) {
    const monthlyEmissions = ne.annualEmissions / 12;  // Convert annual → monthly (Mt/month)

    // Natural decay (C-F bonds: 500-year half-life for PFAS, Cousins 2022)
    // Half-life decay: N(t) = N₀ × e^(-λt) where λ = ln(2) / t_half
    // Monthly decay rate: λ_month = 0.693 / (half_life_years × 12)
    const monthlyDecayRate = 0.693 / (ne.naturalDecayHalfLife * 12);
    const monthlyDecay = ne.accumulatedStock * monthlyDecayRate;

    // === BIOLOGICAL DEGRADATION (Nov 12, 2025: Sylvia's requirement) ===
    // Pseudomonas, fungal degradation (2024 research) - Slow but non-zero pathway
    // Bypasses energy trap via enzymatic breakdown
    const biologicalDecay = ne.biologicalDegradationRate !== undefined
      ? ne.accumulatedStock * ne.biologicalDegradationRate
      : 0;

    // Net accumulation (emissions - natural decay - biological decay)
    // NOTE: This tracks absolute stock (Mt) independent of cleanup effectiveness
    // Cleanup effectiveness is applied via syntheticChemicalLoad [0,1] below
    ne.accumulatedStock += (monthlyEmissions - monthlyDecay - biologicalDecay);

    // === ATMOSPHERIC REDEPOSITION (Nov 12, 2025: Cousins 2022) ===
    // PFAS cycles through atmosphere - local cleanup is futile
    // Legacy contamination continuously re-deposits globally
    if (ne.atmosphericDistribution && ne.atmosphericReservoirStock !== undefined && ne.atmosphericRedepositionRate !== undefined) {
      const monthlyRedeposition = ne.atmosphericReservoirStock * ne.atmosphericRedepositionRate;

      // Redeposition adds to environmental contamination (NOT industrial point sources)
      // This makes cleanup effectiveness asymptotically approach zero
      ne.accumulatedStock += monthlyRedeposition;

      // Log redeposition events (only when significant)
      if (monthlyRedeposition > 1000) {  // > 1,000 Mt/month
        console.log(`🌍 Atmospheric PFAS redeposition: ${(monthlyRedeposition / 1000).toFixed(1)}k Mt re-rained globally`);
      }
    }

    // SATURATION CAP: Total synthetic chemical production bounded by industrial output
    // Research: Persson 2022 (>1 Mt/year novel entities), global plastics ~400M Mt cumulative (Geyer 2017)
    // Estimate: 2 billion Mt total synthetic chemicals as hard cap (all industrial production ever)
    const MAX_CHEMICAL_STOCK = 2_000_000_000;  // 2 billion Mt (research-backed ceiling)
    ne.accumulatedStock = Math.min(ne.accumulatedStock, MAX_CHEMICAL_STOCK);

    // ASSERTION: Catch unrealistic accumulation (>100M Mt = 5x current estimate)
    if (ne.accumulatedStock > 100_000_000) {
      console.log(`⚠️ Novel Entities stock exceeds 100M Mt: ${(ne.accumulatedStock / 1_000_000).toFixed(1)}M Mt (Month ${state.currentMonth})`);
      console.log(`   Annual emissions: ${ne.annualEmissions.toFixed(0)} Mt/year`);
      console.log(`   Approaching saturation cap (2B Mt)`);
    }

    // === PHASE 3: IRREVERSIBILITY + ENERGY TRAP + REBOUND EFFECTS (Nov 18, 2025) ===
    // Research: Ling 2024, Cousins 2022, Kane 2022, UNEP 2024, Sorrell 2025

    if (ne.irreversibleFraction !== undefined && ne.reversibleStock !== undefined && ne.irreversibleStock !== undefined) {
      // 1. UPDATE IRREVERSIBLE/REVERSIBLE SPLIT
      // Total stock splits into reversible (can be cleaned) and irreversible (permanent)
      // Irreversible fraction is CONSTANT (atmospheric distribution persists)
      const totalStock = ne.accumulatedStock;
      ne.irreversibleStock = totalStock * ne.irreversibleFraction;
      ne.reversibleStock = totalStock * (1.0 - ne.irreversibleFraction);
      ne.minimumAchievableLevel = ne.irreversibleStock; // Can NEVER go below this

      // 2. ENERGY-CONSTRAINED CLEANUP
      // Calculate renewable energy surplus (if energy system available)
      let renewableSurplus = 0; // TWh/year
      if (state.powerGenerationSystem) {
        const totalGen = state.powerGenerationSystem.totalElectricityGeneration || 0; // TWh/month
        const renewablePct = state.powerGenerationSystem.renewablePercentage || 0; // [0,1]
        const dataCenterDemand = state.powerGenerationSystem.dataCenterPower || 0; // TWh/month

        // Convert monthly to annual and calculate renewable surplus
        const annualRenewableGen = totalGen * renewablePct * 12; // TWh/year
        const annualDataCenterDemand = dataCenterDemand * 12; // TWh/year

        // Surplus = renewable generation - data center demand (simplified proxy)
        // In reality, total demand is much higher, but data centers are the marginal load
        renewableSurplus = Math.max(0, annualRenewableGen - annualDataCenterDemand);
      }
      ne.renewableEnergySurplus = renewableSurplus;

      // Energy gate: Cleanup effectiveness limited by available energy
      const energyRequired = ne.cleanupEnergyRequirement || 50000; // TWh/year default
      const energyAvailableFraction = energyRequired > 0 ? Math.min(1.0, renewableSurplus / energyRequired) : 0;

      // 3. CALCULATE CLEANUP EFFECTIVENESS (energy-gated)
      // Only reversible stock can be cleaned (irreversible persists forever)
      let cleanupEffectiveness = 0;
      if (ne.bioremediationDeployment > 0 || ne.greenChemistryDeployment > 0) {
        // Base cleanup rate from deployed technologies
        const baseCleanupRate = (ne.bioremediationDeployment * 0.005) + (ne.greenChemistryDeployment * 0.002);

        // Apply energy constraint (if insufficient energy, cleanup is ineffective)
        cleanupEffectiveness = baseCleanupRate * energyAvailableFraction;
      }

      // 4. REBOUND EFFECTS (Jevons Paradox)
      // Cleanup success → industries relax pollution controls → MORE production
      if (ne.reboundFactor !== undefined && ne.reboundTimelagMonths !== undefined && ne.monthsSinceCleanupDeployment !== undefined) {
        // Track time since cleanup deployment
        if (ne.bioremediationDeployment > 0.1) {
          ne.monthsSinceCleanupDeployment++;
        }

        // Rebound kicks in after time lag (10-30 years)
        if (ne.monthsSinceCleanupDeployment > ne.reboundTimelagMonths) {
          // Cleanup induces additional production (moral hazard)
          const cleanupAmount = cleanupEffectiveness * ne.reversibleStock; // Mt/month
          ne.cleanupInducedProduction = (cleanupAmount * 12) * ne.reboundFactor; // Mt/year

          // Add induced production to monthly emissions
          const monthlyInducedProduction = ne.cleanupInducedProduction / 12; // Mt/month
          ne.accumulatedStock += monthlyInducedProduction;

          // Log rebound effect (when significant)
          if (ne.cleanupInducedProduction > 1000 && state.currentMonth % 24 === 0) {
            console.log(`🔄 Rebound effect active: Cleanup inducing ${(ne.cleanupInducedProduction / 1000).toFixed(1)}k Mt/year NEW production`);
            console.log(`   ⚠️ HIGH UNCERTAINTY: Rebound factor ${(ne.reboundFactor * 100).toFixed(0)}% (range: 50-90%)`);
          }
        }
      }

      // 5. APPLY CLEANUP TO REVERSIBLE STOCK ONLY
      // Irreversible stock is UNTOUCHABLE (atmospheric distribution, covalent binding)
      const cleanupAmount = cleanupEffectiveness * ne.reversibleStock; // Mt/month
      ne.reversibleStock = Math.max(0, ne.reversibleStock - cleanupAmount);

      // Recalculate total stock (reversible + irreversible)
      ne.accumulatedStock = ne.reversibleStock + ne.irreversibleStock;

      // CRITICAL: Total stock can NEVER go below minimum achievable level
      if (ne.accumulatedStock < ne.minimumAchievableLevel) {
        ne.accumulatedStock = ne.minimumAchievableLevel;
        ne.reversibleStock = 0; // All reversible stock cleaned
      }

      // 6. LOG ENERGY TRAP STATUS (yearly)
      if (state.currentMonth % 12 === 0 && cleanupEffectiveness > 0.0001) {
        console.log(`\n=== Novel Entities Energy Trap Status ===`);
        console.log(`  ⚡ Renewable surplus: ${renewableSurplus.toFixed(0)} TWh/year`);
        console.log(`  ⚡ Cleanup requirement: ${energyRequired.toFixed(0)} TWh/year`);
        console.log(`  ⚡ Energy available: ${(energyAvailableFraction * 100).toFixed(1)}%`);
        console.log(`  🧹 Cleanup effectiveness: ${(cleanupEffectiveness * 100).toFixed(2)}%/month`);
        console.log(`  ♻️ Reversible stock: ${(ne.reversibleStock / 1000).toFixed(0)}k Mt`);
        console.log(`  ⚠️ Irreversible stock: ${(ne.irreversibleStock / 1000).toFixed(0)}k Mt (PERMANENT)`);
        console.log(`  📊 Minimum achievable: ${(ne.minimumAchievableLevel / 1000).toFixed(0)}k Mt (asymptotic floor)`);
        console.log(`  ⚠️ HIGH UNCERTAINTY: Irreversible fraction ${(ne.irreversibleFraction * 100).toFixed(0)}% (range: 80-95%)`);
      }
    }
  }

  // === HETEROGENEOUS CONTAMINATION (Nov 12, 2025: Sylvia's requirement) ===
  // Industrial point sources (mg/L) vs environmental diffuse (ng/L-pg/L)
  // Energy constraints apply differently to each

  if (ne.industrialContamination !== undefined && ne.environmentalContamination !== undefined) {
    // Industrial contamination: New production creates point sources
    let industrialAccumulationRate = (economicStage * 0.001) + (manufacturingCap * 0.0005);

    // Green chemistry + chemical bans reduce industrial sources
    industrialAccumulationRate *= (1.0 - ne.greenChemistryDeployment * 0.7);
    industrialAccumulationRate *= (1.0 - ne.chemicalBansDeployment * 0.5);

    // Industrial cleanup IS feasible (high concentration)
    const industrialCleanupRate = ne.bioremediationDeployment * 0.005; // 0.5%/month at full deployment

    ne.industrialContamination = Math.max(0, Math.min(1.0,
      ne.industrialContamination + industrialAccumulationRate - industrialCleanupRate
    ));

    // Environmental contamination: Dilution from industrial sources + atmospheric fallout
    let environmentalAccumulationRate = ne.industrialContamination * 0.0005; // Dilution from point sources

    // Atmospheric redeposition adds to environmental (Cousins 2022: futile to clean)
    if (ne.atmosphericRedepositionRate !== undefined) {
      environmentalAccumulationRate += ne.atmosphericRedepositionRate * 0.01; // 1% of redeposition rate
    }

    // Circular economy prevents NEW environmental contamination
    environmentalAccumulationRate *= (1.0 - ne.circularEconomyDeployment * 0.6);

    // Environmental cleanup faces energy trap (minimal effectiveness)
    const environmentalCleanupRate = ne.bioremediationDeployment * 0.0001; // 0.01%/month (100x worse than industrial)

    // Biological degradation applies to environmental (slow but non-zero)
    const biologicalCleanupRate = ne.biologicalDegradationRate !== undefined ? ne.biologicalDegradationRate : 0;

    ne.environmentalContamination = Math.max(0, Math.min(1.0,
      ne.environmentalContamination + environmentalAccumulationRate - environmentalCleanupRate - biologicalCleanupRate
    ));

    // Update aggregate syntheticChemicalLoad (weighted sum)
    ne.syntheticChemicalLoad = (ne.industrialContamination * 0.3) + (ne.environmentalContamination * 0.7);
  } else {
    // LEGACY PATH: Old accumulation logic (for backward compatibility)
    let chemicalAccumulationRate = (economicStage * 0.002) + (manufacturingCap * 0.001);

    // Green chemistry reduces new chemical load
    chemicalAccumulationRate *= (1.0 - ne.greenChemistryDeployment * 0.6);

    // Circular economy reduces need for new chemicals
    chemicalAccumulationRate *= (1.0 - ne.circularEconomyDeployment * 0.4);

    // Chemical bans remove worst offenders
    chemicalAccumulationRate *= (1.0 - ne.chemicalBansDeployment * 0.3);

    // Bioremediation breaks down existing chemicals (slow)
    const bioremediationRate = ne.bioremediationDeployment * 0.001; // -0.1%/month at full deployment

    ne.syntheticChemicalLoad = Math.max(0, Math.min(1.0,
      ne.syntheticChemicalLoad + chemicalAccumulationRate - bioremediationRate
    ));
  }
  
  // === IRREVERSIBILITY FRAMEWORK INTEGRATION (Nov 18, 2025) ===
  // Apply asymptotic recovery and legacy stock release mechanics
  // Research: Cousins 2022 (75-year half-life), Sörengård 2024 (energy trap)

  // Check fusion deployment (required for cleanup to be effective)
  const fusionDeployment = isTechDeployed(state, 'fusion_power');
  const hasFusion = fusionDeployment > 0.3;  // 30%+ deployment threshold

  // PREVENTION-FIRST PARADIGM (60-90% effective, no energy trap)
  // Research: Prevention avoids dilution problem entirely (Sörengård 2024)
  const preventionEffectiveness = ne.greenChemistryDeployment * 0.7 + ne.chemicalBansDeployment * 0.9;

  // CLEANUP EFFECTIVENESS (10-25% max, requires fusion)
  // Research: Dilution makes cleanup 6-9 orders of magnitude harder (Sörengård 2024)
  let cleanupEffectiveness = 0;
  if (hasFusion) {
    // Cleanup only works with abundant energy AND high concentrations
    const industrialCleanupEff = ne.bioremediationDeployment * 0.25;  // 25% max (industrial sites)
    const environmentalCleanupEff = ne.bioremediationDeployment * 0.01;  // 1% max (diffuse contamination)

    // Weighted by contamination type
    cleanupEffectiveness = (industrialCleanupEff * 0.3) + (environmentalCleanupEff * 0.7);

    console.log(`⚡ FUSION ENERGY: Novel entities cleanup active (${(cleanupEffectiveness * 100).toFixed(1)}% effectiveness)`);
  } else if (ne.bioremediationDeployment > 0.1) {
    console.log(`⚠️ ENERGY TRAP: Bioremediation blocked without fusion energy (deployment: ${(fusionDeployment * 100).toFixed(0)}%, need: 30%+)`);
  }

  // COMBINED EFFECTIVENESS (prevention + cleanup)
  const totalEffectiveness = Math.min(0.90, preventionEffectiveness + cleanupEffectiveness);

  // Apply asymptotic recovery to syntheticChemicalLoad
  // Uses 75-year half-life, 15% asymptotic floor
  const boundary = state.planetaryBoundariesSystem?.boundaries?.novel_entities;
  if (boundary && boundary.minimumAsymptoticValue !== undefined && boundary.recoveryHalfLife !== undefined) {
    const targetLoad = boundary.minimumAsymptoticValue;  // 0.15 (15% floor)
    const halfLife = boundary.recoveryHalfLife;  // 75 years

    // Apply recovery with effectiveness modifier
    const recoveryRate = totalEffectiveness * 0.01;  // Scale to monthly rate
    const currentLoadNormalized = ne.syntheticChemicalLoad;

    // Apply asymptotic recovery (exponential approach to 15% floor)
    ne.syntheticChemicalLoad = assertFinite(
      asymptoteRecovery(
        currentLoadNormalized * 100,  // Convert to 0-100 scale
        targetLoad * 100,  // Target 15
        halfLife,
        targetLoad,  // 0.15 minimum
        1/12  // Monthly timestep
      ) / 100,  // Convert back to 0-1 scale
      {
        location: 'updateNovelEntitiesSystem[asymptotic recovery]',
        valueName: 'syntheticChemicalLoad',
        month: state.currentMonth,
      }
    );

    // Apply legacy stock release (atmospheric redeposition continues)
    if (boundary.legacyStock !== undefined && ne.atmosphericReservoirStock !== undefined) {
      const { newStock, released } = legacyStockRelease(
        ne.atmosphericReservoirStock,
        50,  // 50-year atmospheric half-life (Cousins 2022)
        1/12  // Monthly timestep
      );

      ne.atmosphericReservoirStock = assertFinite(newStock, {
        location: 'updateNovelEntitiesSystem[legacy stock]',
        valueName: 'atmosphericReservoirStock',
        month: state.currentMonth,
      });

      // Released contamination re-enters environment (futile cleanup cycle)
      const recontaminationRate = released / 180000;  // Normalize to [0, 1]
      ne.environmentalContamination = Math.min(1.0, (ne.environmentalContamination || 0) + recontaminationRate * 0.001);

      // Log significant recontamination events
      if (released > 1000 && state.currentMonth % 12 === 0) {
        console.log(`🌍 LEGACY STOCK RELEASE: ${(released / 1000).toFixed(1)}k Mt PFAS re-entering environment (atmospheric cycling)`);
      }
    }
  }

  // === MICROPLASTICS ===
  // Persistent, everywhere, breaks down into smaller pieces but never disappears
  let microplasticRate = (economicStage * 0.0015) + (manufacturingCap * 0.0008);
  microplasticRate *= (1.0 - ne.circularEconomyDeployment * 0.5); // Reduce plastic use

  ne.microplasticConcentration = Math.min(1.0, ne.microplasticConcentration + microplasticRate);
  
  // === PFAS ("FOREVER CHEMICALS") ===
  // Never breaks down, accumulates indefinitely
  let pfasRate = (economicStage * 0.001); // Industrial use
  pfasRate *= (1.0 - ne.chemicalBansDeployment * 0.7); // Bans very effective for PFAS
  
  ne.pfasPrevalence = Math.min(1.0, ne.pfasPrevalence + pfasRate);
  
  // === ENDOCRINE DISRUPTION ===
  // Tracks overall chemical load + specific endocrine disruptors
  const avgChemicalExposure = (ne.syntheticChemicalLoad + ne.microplasticConcentration + ne.pfasPrevalence) / 3;
  ne.endocrineDisruption = avgChemicalExposure * 0.6; // 60% of chemical load causes disruption
  
  // === REPRODUCTIVE HEALTH DECLINE ===
  // Research: 50% sperm count decline over 50 years (600 months)
  // Natural rate: 0.083%/month (50% / 600 months)
  let reproductiveDeclineRate = ne.endocrineDisruption * 0.001; // Up to 0.1%/month
  
  // Bioaccumulation accelerates decline (hits reproductive systems)
  reproductiveDeclineRate *= (1.0 + ne.bioaccumulationFactor * 0.5);
  
  ne.reproductiveHealthDecline = Math.min(1.0, ne.reproductiveHealthDecline + reproductiveDeclineRate);
  
  // Reproductive crisis - TRIGGER (one-time announcement)
  if (ne.reproductiveHealthDecline > 0.50 && !ne.reproductiveCrisisActive) {
    ne.reproductiveCrisisActive = true;
    console.log(`🚨 REPRODUCTIVE CRISIS: Widespread fertility decline`);
    console.log(`   Reproductive health: ${((1.0 - ne.reproductiveHealthDecline) * 100).toFixed(0)}%`);
    console.log(`   Endocrine disruption: ${(ne.endocrineDisruption * 100).toFixed(0)}%`);
    console.log(`   PFAS prevalence: ${(ne.pfasPrevalence * 100).toFixed(0)}%`);

    // Health impact (one-time QoL hit when crisis announced)
    const currentHealth1 = assertStateProperty(
      state.qualityOfLifeSystems,
      'health',
      { location: 'updateNovelEntitiesSystem[reproductive crisis]', month: state.currentMonth }
    );
    state.qualityOfLifeSystems.health = Math.max(0.3, currentHealth1 - 0.08);
  }

  // Reproductive crisis - ONGOING MORTALITY (every month while active)
  if (ne.reproductiveCrisisActive) {
    // Population impact: Reproductive crisis causes despair, failed fertility treatments (0.05-0.1% casualties)
    // TRULY GLOBAL: PFAS in 99% of human blood = everyone exposed (100% of world)
    // 0.08% mortality rate from despair/failed fertility treatments
    const pop = state.humanPopulationSystem as any;
    console.log(`💀 Novel Entities: Adding reproductive crisis mortality risk (baseRisk=0.0008)`);
    addMortalityRisk(pop, {

      type: 'pollution',
      baseRisk: 0.0008,
      proximate: 'pollution',
      root: 'pollution',
      confidence: 'HIGH',
      description: 'Reproductive crisis - despair/failed treatments (global exposure)',
      month: state.currentMonth,
      exposedFraction: 1.00
    });
    console.log(`  Risks now: ${pop.mortalityRisks?.length || 0}`)
  }
  
  // === BIOACCUMULATION ===
  // Chemicals concentrate up food chain (apex predators hit hardest)
  // Interacts with biodiversity (more species = more bioaccumulation pathways)
  const biodiversity = assertStateProperty(
    state.environmentalAccumulation,
    'biodiversityIndex',
    { location: 'updateNovelEntitiesSystem[bioaccumulation]', month: state.currentMonth }
  );
  ne.bioaccumulationFactor = ne.syntheticChemicalLoad * (0.5 + biodiversity * 0.5);
  
  // Bioaccumulation collapse - TRIGGER (one-time announcement)
  if (ne.bioaccumulationFactor > 0.60 && !ne.bioaccumulationCollapseActive) {
    ne.bioaccumulationCollapseActive = true;
    console.log(`🚨 BIOACCUMULATION COLLAPSE: Apex predators poisoned`);
    console.log(`   Bioaccumulation factor: ${(ne.bioaccumulationFactor * 100).toFixed(0)}%`);
    console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);

    // Biodiversity impact (one-time top-down cascade when collapse announced)
    // HIGH-8 FIX (Nov 28, 2025): Guard during historical mode
    if (!isHistoricalModeActive(state) && state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.08 // -8% instant hit
      );
    }
  }

  // Bioaccumulation collapse - ONGOING MORTALITY (every month while active)
  if (ne.bioaccumulationCollapseActive) {
    // Population impact: Food chain collapse causes contaminated food deaths (0.1-0.2% casualties)
    // TRULY GLOBAL: Food chain is globally interconnected (100% of world affected)
    // 0.15% mortality rate from contaminated food poisoning
    const pop = state.humanPopulationSystem as any;
    console.log(`💀 Novel Entities: Adding bioaccumulation collapse mortality risk (baseRisk=0.0015)`);
    addMortalityRisk(pop, {

      type: 'pollution',
      baseRisk: 0.0015,
      proximate: 'pollution',
      root: 'pollution',
      confidence: 'HIGH',
      description: 'Bioaccumulation collapse - contaminated food chain (global)',
      month: state.currentMonth,
      exposedFraction: 1.00
    });
    console.log(`  Risks now: ${pop.mortalityRisks?.length || 0}`)
  }
  
  // === CHRONIC DISEASE EPIDEMIC ===
  // Cancer, autoimmune disorders, developmental abnormalities
  // Tracks cumulative exposure over time
  const exposureYears = ne.exposureMonths / 12;
  const cumulativeExposure = (ne.syntheticChemicalLoad * exposureYears) / 100; // Normalize
  
  ne.chronicDiseasePrevalence = 0.20 + (cumulativeExposure * 0.3) + (ne.endocrineDisruption * 0.2);
  ne.chronicDiseasePrevalence = Math.min(0.80, ne.chronicDiseasePrevalence);
  
  // Chronic disease epidemic - TRIGGER (one-time announcement)
  if (ne.chronicDiseasePrevalence > 0.40 && !ne.chronicDiseaseEpidemicActive) {
    ne.chronicDiseaseEpidemicActive = true;
    console.log(`🚨 CHRONIC DISEASE EPIDEMIC: Widespread health crisis`);
    console.log(`   Disease prevalence: ${(ne.chronicDiseasePrevalence * 100).toFixed(0)}%`);
    console.log(`   Exposure years: ${exposureYears.toFixed(0)}`);
    console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);

    // Health QoL impact (one-time hit when epidemic announced)
    const healthImpact = (ne.chronicDiseasePrevalence - 0.40) * 0.3; // Up to 12% impact
    const currentHealth2 = assertStateProperty(
      state.qualityOfLifeSystems,
      'health',
      { location: 'updateNovelEntitiesSystem[chronic disease epidemic]', month: state.currentMonth }
    );
    state.qualityOfLifeSystems.health = Math.max(0.2, currentHealth2 - healthImpact);
  }

  // Chronic disease epidemic - ONGOING MORTALITY (every month while active)
  if (ne.chronicDiseaseEpidemicActive) {
    // Population impact: Chronic disease epidemic causes cancer/autoimmune deaths (0.3-0.5% casualties)
    // TRULY GLOBAL: Chemical exposure is global (100% of world affected)
    // 0.4% mortality rate from cancer/autoimmune surge
    const pop = state.humanPopulationSystem as any;
    console.log(`💀 Novel Entities: Adding chronic disease epidemic mortality risk (baseRisk=0.004)`);
    addMortalityRisk(pop, {

      type: 'pollution',
      baseRisk: 0.004,
      proximate: 'pollution',
      root: 'pollution',
      confidence: 'HIGH',
      description: 'Chronic disease epidemic - cancer/autoimmune surge (global exposure)',
      month: state.currentMonth,
      exposedFraction: 1.00
    });
    console.log(`  Risks now: ${pop.mortalityRisks?.length || 0}`)
  }
  
  // === ONGOING HEALTH IMPACTS ===
  // Monthly degradation from chemical exposure
  if (ne.syntheticChemicalLoad > 0.50) {
    const monthlyHealthImpact = (ne.syntheticChemicalLoad - 0.50) * 0.0005; // Up to 0.025%/month
    const currentHealth3 = assertStateProperty(
      state.qualityOfLifeSystems,
      'health',
      { location: 'updateNovelEntitiesSystem[ongoing impacts]', month: state.currentMonth }
    );
    state.qualityOfLifeSystems.health = Math.max(0, currentHealth3 - monthlyHealthImpact);
  }

  // === EXTINCTION PATHWAY ===
  // Slow collapse: Reproductive failure + chronic disease = population decline
  // Timeline: 100-200 years (1200-2400 months)

  if (ne.reproductiveHealthDecline > 0.70 && ne.chronicDiseasePrevalence > 0.60) {
    const healthQoL = assertStateProperty(
      state.qualityOfLifeSystems,
      'health',
      { location: 'updateNovelEntitiesSystem[extinction pathway]', month: state.currentMonth }
    );

    // Check if detoxification technologies deployed
    const hasDetox = (ne.greenChemistryDeployment + ne.bioremediationDeployment + ne.chemicalBansDeployment) > 1.5;

    if (healthQoL < 0.25 && !hasDetox) {
      console.log(`☠️ NOVEL ENTITIES EXTINCTION: Slow poisoning collapse`);
      console.log(`   Health QoL: ${(healthQoL * 100).toFixed(0)}%`);
      console.log(`   Reproductive decline: ${(ne.reproductiveHealthDecline * 100).toFixed(0)}%`);
      console.log(`   Chronic disease: ${(ne.chronicDiseasePrevalence * 100).toFixed(0)}%`);
      console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);
      console.log(`   Gradual sterility + disease → population collapse`);
      
      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'environmental_collapse';
        state.extinctionState.extinctionMechanism = 'chemical_poisoning';
        state.extinctionState.monthsUntilExtinction = 120; // 10 years of slow decline
        state.extinctionState.description = 'Synthetic chemical pollution caused widespread reproductive failure and chronic disease. Slow population collapse over 10 years.';
      }
    }
  }
}

/**
 * Check if novel entities technologies should unlock
 *
 * NOTE: Tech unlocking now handled by TechTreePhase
 * This function is deprecated but kept for backward compatibility
 */
export function checkNovelEntitiesTechUnlocks(state: GameState): void {
  if (!state.novelEntitiesSystem) return;
  return; // Early return - tech tree handles all unlocking now

  /* const ne = state.novelEntitiesSystem;
  const tech: any = state.techTreeState; // Cast to any for legacy code compatibility
  const economicStage = state.globalMetrics.economicTransitionStage;
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const totalResearch = state.government.researchInvestments.physical +
    state.government.researchInvestments.digital +
    state.government.researchInvestments.cognitive +
    state.government.researchInvestments.social;
  
  // === 1. GREEN CHEMISTRY ===
  // Non-toxic alternatives to hazardous chemicals
  if (!tech.greenChemistry?.unlocked) {
    if (avgAICapability > 2.0 && totalResearch > 100) {
      tech.greenChemistry = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Green Chemistry`);
      console.log(`   Non-toxic alternatives to hazardous chemicals`);
      console.log(`   AI-designed molecules with desired properties`);
    }
  }
  
  // === 2. ADVANCED BIOREMEDIATION ===
  // Engineered microbes break down synthetic chemicals
  if (!tech.advancedBioremediation?.unlocked) {
    const biotech = state.aiAgents[0]?.researchCapabilities?.biotech?.syntheticBiology || 0;
    if (biotech > 2.5 && totalResearch > 150 && ne.syntheticChemicalLoad > 0.50) {
      tech.advancedBioremediation = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Advanced Bioremediation`);
      console.log(`   Engineered microbes break down PFAS, microplastics`);
      console.log(`   Can remediate contaminated sites`);
    }
  }
  
  // === 3. CIRCULAR ECONOMY SYSTEMS ===
  // Eliminate need for new chemical production
  if (!tech.circularEconomySystems?.unlocked) {
    if (avgAICapability > 2.5 && economicStage >= 3.0) {
      tech.circularEconomySystems = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Full Circular Economy`);
      console.log(`   Zero-waste manufacturing, closed-loop systems`);
      console.log(`   Eliminates new chemical pollution`);
    }
  }
  
  // === 4. CHEMICAL SAFETY REGULATIONS ===
  // Policy: Ban worst offenders, require safety testing
  if (!tech.chemicalSafetyRegulations?.unlocked) {
    if (state.government.legitimacy > 0.60 && ne.chronicDiseaseEpidemicActive) {
      tech.chemicalSafetyRegulations = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 POLICY: Comprehensive Chemical Safety Regulations`);
      console.log(`   Ban PFAS, restrict endocrine disruptors`);
      console.log(`   Require safety testing before release`);
    }
  }
  
  // === AUTO-DEPLOYMENT ===
  
  if (tech.greenChemistry?.unlocked) {
    // Industry adopts green chemistry (economic + regulatory pressure)
    const adoptionRate = 0.010; // 1%/month
    ne.greenChemistryDeployment = Math.min(1.0, ne.greenChemistryDeployment + adoptionRate);
  }
  
  if (tech.advancedBioremediation?.unlocked && ne.syntheticChemicalLoad > 0.60) {
    // Deploy bioremediation where contamination is worst
    const adoptionRate = 0.008; // 0.8%/month
    ne.bioremediationDeployment = Math.min(1.0, ne.bioremediationDeployment + adoptionRate);
  }
  
  if (tech.circularEconomySystems?.unlocked) {
    // Systemic transformation (slow)
    const adoptionRate = 0.006; // 0.6%/month
    ne.circularEconomyDeployment = Math.min(1.0, ne.circularEconomyDeployment + adoptionRate);
  }
  
  if (tech.chemicalSafetyRegulations?.unlocked) {
    // Policy implementation
    const adoptionRate = 0.012; // 1.2%/month
    ne.chemicalBansDeployment = Math.min(1.0, ne.chemicalBansDeployment + adoptionRate);
  } */
}

