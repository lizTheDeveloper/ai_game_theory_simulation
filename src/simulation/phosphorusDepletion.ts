/**
 * Phosphorus Depletion Crisis System (TIER 1.1)
 * 
 * Models phosphate rock depletion, the #1 agricultural bottleneck after water.
 * Research: 32 peer-reviewed sources (2024-2025)
 * 
 * Key findings:
 * - Morocco controls 70% of global reserves (geopolitical weapon)
 * - Peak phosphorus ~2070, but supply shocks can happen anytime
 * - Only 20% of mined P reaches humans (massive inefficiency)
 * - Historical crises: 2007-2008 (China 135% tariff), 2022-2024 (Ukraine war)
 * - Solutions: Struvite recovery (98.3%), soil optimization, circular economy
 */

import { GameState } from '@/types/game';
import { PhosphorusSystem, PhosphorusSupplyShock } from '@/types/phosphorus';

/**
 * Initialize phosphorus system state (2025 baseline)
 */
export function initializePhosphorusSystem(): PhosphorusSystem {
  return {
    reserves: 1.0,                    // Full reserves at 2025 baseline
    geopoliticalTension: 0.30,        // Moderate baseline tension (Morocco dominance)
    priceIndex: 1.0,                  // Baseline 2025 pricing
    useEfficiency: 0.20,              // Research: Only 20% reaches humans
    recoveryRate: 0.05,               // Minimal recovery in 2025 (some EU programs)
    pollutionLevel: 0.25,             // Eutrophication already occurring
    supplyShockActive: false,
    supplyShockDuration: 0,
    criticalDepletionActive: false,
    peakPhosphorusReached: false,
    struviteDeployment: 0.0,
    soilOptimizationDeployment: 0.0,
    efficientCropsDeployment: 0.0,
    circularSystemsDeployment: 0.0,
  };
}

/**
 * Update phosphorus system each month
 */
export function updatePhosphorusSystem(state: GameState): void {
  if (!state.phosphorusSystem) return;
  
  const p = state.phosphorusSystem;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const population = 8.0; // Billion people (approximate)
  const tensions = state.globalMetrics.geopoliticalTensions || 0.3;
  
  // === RESERVE DEPLETION ===
  // Base depletion rate: Economic activity drives mining
  let depletionRate = economicStage * 0.0015; // 0.15%/month at Stage 1, 0.6%/month at Stage 4
  
  // Agricultural demand (93% of use)
  const foodProductionMultiplier = 1.0 + (economicStage * 0.2); // Increases with development
  depletionRate *= foodProductionMultiplier;
  
  // Efficiency reduces mining needs
  // Research: 20% → 60% efficiency = 67% less mining needed
  const efficiencyReduction = 1.0 - (p.useEfficiency - 0.20) * 1.25;
  depletionRate *= Math.max(0.33, efficiencyReduction);
  
  // Recovery offsets mining needs
  depletionRate *= (1.0 - p.recoveryRate * 0.5); // 100% recovery = 50% less mining
  
  // Apply depletion
  p.reserves = Math.max(0, p.reserves - depletionRate);
  
  // === PEAK PHOSPHORUS DETECTION ===
  // Research: Peak around 2070 (45 years from 2025)
  // In simulation: ~540 months (45 years)
  if (!p.peakPhosphorusReached && state.currentMonth > 480) {
    p.peakPhosphorusReached = true;
    console.log(`⚠️ PEAK PHOSPHORUS: Decline phase begins (Month ${state.currentMonth})`);
    console.log(`   Reserves: ${(p.reserves * 100).toFixed(0)}%`);
  }
  
  // === GEOPOLITICAL TENSION ===
  // Morocco controls 70% - weaponization risk
  // Tension increases with resource scarcity
  const scarcityTension = (1.0 - p.reserves) * 0.5; // Up to +50% tension
  const globalTension = tensions * 0.5; // Global geopolitics affect P access
  p.geopoliticalTension = Math.min(1.0, 0.30 + scarcityTension + globalTension);
  
  // === SUPPLY SHOCKS ===
  // Historical: 2007-2008, 2022-2024 (fertilizer + transport crises)
  if (!p.supplyShockActive) {
    // Chance of supply shock increases with tension
    const shockProbability = p.geopoliticalTension * 0.15; // Up to 15%/month at max tension
    
    if (Math.random() < shockProbability) {
      // Trigger supply shock
      const shockTypes: PhosphorusSupplyShock['cause'][] = [
        'geopolitical_weapon',
        'transport_crisis',
        'production_failure',
        'market_speculation'
      ];
      const cause = shockTypes[Math.floor(Math.random() * shockTypes.length)];
      
      p.supplyShockActive = true;
      p.supplyShockDuration = 6 + Math.floor(Math.random() * 12); // 6-18 months
      p.priceIndex *= 2.0 + Math.random() * 3.0; // 2-5x price spike
      
      console.log(`🚨 PHOSPHORUS SUPPLY SHOCK (${cause})`);
      console.log(`   Price: ${p.priceIndex.toFixed(1)}x baseline`);
      console.log(`   Duration: ${p.supplyShockDuration} months`);
      console.log(`   Geopolitical tension: ${(p.geopoliticalTension * 100).toFixed(0)}%`);
      
      // Immediate QoL impact
      state.qualityOfLifeSystems.materialAbundance = Math.max(0.1, state.qualityOfLifeSystems.materialAbundance - 0.05);
      state.society.trust -= 0.03;
      state.globalMetrics.economicGrowthRate -= 0.02;
    }
  } else {
    // Decrement shock duration
    p.supplyShockDuration--;
    if (p.supplyShockDuration <= 0) {
      p.supplyShockActive = false;
      p.priceIndex = Math.max(1.0, p.priceIndex * 0.6); // Gradual price recovery
      console.log(`✅ PHOSPHORUS SUPPLY SHOCK ENDED`);
      console.log(`   Price: ${p.priceIndex.toFixed(1)}x baseline`);
    }
  }
  
  // === PRICE DYNAMICS ===
  if (!p.supplyShockActive) {
    // Gradual price increase as reserves decline
    const scarcityPriceMultiplier = 1.0 + (1.0 - p.reserves) * 2.0; // Up to 3x at depletion
    const targetPrice = scarcityPriceMultiplier;
    
    // Gradual price adjustment (not instant)
    p.priceIndex += (targetPrice - p.priceIndex) * 0.05; // 5% adjustment/month
    p.priceIndex = Math.max(1.0, Math.min(10.0, p.priceIndex));
  }
  
  // === EFFICIENCY IMPROVEMENTS ===
  // Technologies improve use efficiency from 20% baseline
  let totalEfficiency = 0.20; // Baseline
  
  // Struvite recovery: +10% efficiency (captures wastewater P)
  totalEfficiency += p.struviteDeployment * 0.10;
  
  // Soil optimization: +15% efficiency (unlocks legacy soil P)
  totalEfficiency += p.soilOptimizationDeployment * 0.15;
  
  // Efficient crops: +10% efficiency (better P uptake)
  totalEfficiency += p.efficientCropsDeployment * 0.10;
  
  // Circular systems: +5% efficiency (integrated improvements)
  totalEfficiency += p.circularSystemsDeployment * 0.05;
  
  p.useEfficiency = Math.min(0.60, totalEfficiency); // Cap at 60%
  
  // Recovery rate from circular economy
  p.recoveryRate = (p.struviteDeployment * 0.40) + (p.circularSystemsDeployment * 0.30);
  
  // === ENVIRONMENTAL POLLUTION ===
  // Inefficiency = pollution (excess P runoff → eutrophication)
  const inefficiencyPollution = (1.0 - p.useEfficiency) * 0.02; // Up to 2%/month
  const productionVolume = economicStage * 0.01; // More production = more pollution
  
  p.pollutionLevel = Math.max(0, Math.min(1.0, 
    p.pollutionLevel + inefficiencyPollution + productionVolume - p.recoveryRate * 0.02
  ));
  
  // Feedback to environmental system
  if (state.environmentalAccumulation) {
    // Phosphorus pollution contributes to overall pollution
    const pContribution = p.pollutionLevel * 0.15; // 15% of total pollution from P
    state.environmentalAccumulation.pollutionLevel = Math.max(
      state.environmentalAccumulation.pollutionLevel,
      pContribution
    );
    
    // Eutrophication damages biodiversity (freshwater dead zones)
    if (p.pollutionLevel > 0.50) {
      const biodiversityDamage = (p.pollutionLevel - 0.50) * 0.002; // Up to 0.1%/month
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - biodiversityDamage
      );
    }
  }
  
  // === FOOD SYSTEM IMPACT ===
  // High prices or low reserves damage food QoL
  let foodImpact = 0;
  
  if (p.priceIndex > 2.0) {
    // Price crisis: Unaffordable fertilizer
    foodImpact = (p.priceIndex - 2.0) * 0.01; // Up to -8%/month at 10x price
  }
  
  if (p.reserves < 0.50) {
    // Scarcity crisis: Physical shortage
    foodImpact += (0.50 - p.reserves) * 0.015; // Up to -0.75%/month
  }
  
  if (foodImpact > 0) {
    state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSystems.materialAbundance - foodImpact);
  }
  
  // === CRITICAL DEPLETION ===
  if (p.reserves < 0.30 && !p.criticalDepletionActive) {
    p.criticalDepletionActive = true;
    console.log(`🚨 CRITICAL PHOSPHORUS DEPLETION`);
    console.log(`   Reserves: ${(p.reserves * 100).toFixed(0)}%`);
    console.log(`   Price: ${p.priceIndex.toFixed(1)}x baseline`);
    console.log(`   Material Abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(0)}%`);
  }
  
  // === EXTINCTION PATHWAY ===
  // Slow collapse: Reserves depleted + no recovery = famine
  if (p.reserves < 0.15 && p.recoveryRate < 0.30) {
    const materialAbundance = state.qualityOfLifeSystems.materialAbundance;
    
    if (materialAbundance < 0.20) {
      console.log(`☠️ PHOSPHORUS DEPLETION EXTINCTION: Global agriculture collapse`);
      console.log(`   Material Abundance: ${(materialAbundance * 100).toFixed(0)}%`);
      console.log(`   P reserves: ${(p.reserves * 100).toFixed(0)}%`);
      console.log(`   Recovery rate: ${(p.recoveryRate * 100).toFixed(0)}%`);
      console.log(`   Circular economy failed to close the loop`);
      
      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'resource_depletion';
        state.extinctionState.extinctionMechanism = 'phosphorus_famine';
        state.extinctionState.monthsUntilExtinction = 24; // 2 years of slow collapse
        state.extinctionState.description = 'Phosphate rock reserves depleted. Agricultural collapse. Global famine over 24 months.';
      }
    }
  }
}

/**
 * Check if phosphorus breakthrough technologies should unlock
 */
export function checkPhosphorusTechUnlocks(state: GameState): void {
  if (!state.phosphorusSystem || !state.breakthroughTech) return;
  
  const p = state.phosphorusSystem;
  const tech = state.breakthroughTech;
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const totalResearch = state.government.researchInvestments.physical +
    state.government.researchInvestments.digital +
    state.government.researchInvestments.cognitive +
    state.government.researchInvestments.social;
  
  // === 1. STRUVITE RECOVERY ===
  // Already operational in 2025! Just needs deployment investment
  if (!tech.struviteRecovery?.unlocked) {
    if (avgAICapability > 1.5 || totalResearch > 50) {
      tech.struviteRecovery = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Struvite Recovery (Phosphorus from Wastewater)`);
      console.log(`   98.3% recovery efficiency (pilot-scale operational)`);
      console.log(`   Cost: $100B for global deployment`);
    }
  }
  
  // === 2. SOIL OPTIMIZATION ===
  // Nature 2025: Dynamic optimization of legacy soil P
  if (!tech.soilOptimization?.unlocked) {
    if (avgAICapability > 2.0 && totalResearch > 100) {
      tech.soilOptimization = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Dynamic Soil P Optimization`);
      console.log(`   Unlocks 6.6 Tg P/year legacy soil reserves`);
      console.log(`   Reduces mining demand 30-50%`);
    }
  }
  
  // === 3. P-EFFICIENT CULTIVARS ===
  // Biotech: Enhanced mycorrhizal partnerships
  if (!tech.efficientCrops?.unlocked) {
    const biotech = state.aiAgents[0]?.researchCapabilities?.biotech?.geneEditing || 0;
    if (biotech > 2.0 && totalResearch > 150) {
      tech.efficientCrops = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: P-Efficient Cultivars`);
      console.log(`   Mycorrhizal partnerships improve P uptake`);
      console.log(`   Deeper root systems access subsoil P`);
    }
  }
  
  // === 4. CIRCULAR FOOD SYSTEMS ===
  // Integrated: Combines all P recovery pathways
  if (!tech.circularFoodSystems?.unlocked) {
    const hasStruvite = tech.struviteRecovery?.deploymentLevel || 0 > 0.5;
    const hasSoil = tech.soilOptimization?.deploymentLevel || 0 > 0.5;
    const hasCrops = tech.efficientCrops?.deploymentLevel || 0 > 0.3;
    
    if (hasStruvite && hasSoil && hasCrops && avgAICapability > 3.0) {
      tech.circularFoodSystems = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Circular Food Systems`);
      console.log(`   Integrated phosphorus recovery: 20% → 60% efficiency`);
      console.log(`   Food waste → struvite → crops → food (closed loop)`);
    }
  }
  
  // === AUTO-DEPLOYMENT (if unlocked) ===
  // Simulate government/market adoption of profitable technologies
  if (tech.struviteRecovery?.unlocked && p.priceIndex > 1.5) {
    // High prices motivate recovery adoption
    const adoptionRate = 0.02; // 2%/month
    p.struviteDeployment = Math.min(1.0, p.struviteDeployment + adoptionRate);
  }
  
  if (tech.soilOptimization?.unlocked && p.reserves < 0.70) {
    // Scarcity motivates soil optimization
    const adoptionRate = 0.015; // 1.5%/month
    p.soilOptimizationDeployment = Math.min(1.0, p.soilOptimizationDeployment + adoptionRate);
  }
  
  if (tech.efficientCrops?.unlocked) {
    // Farmers adopt better crops gradually
    const adoptionRate = 0.01; // 1%/month (seed stock turnover)
    p.efficientCropsDeployment = Math.min(1.0, p.efficientCropsDeployment + adoptionRate);
  }
  
  if (tech.circularFoodSystems?.unlocked) {
    // Systemic change is slowest
    const adoptionRate = 0.008; // 0.8%/month
    p.circularSystemsDeployment = Math.min(1.0, p.circularSystemsDeployment + adoptionRate);
  }
}

