/**
 * Geoengineering Technologies (Phase 2.9 - Part 4)
 * 
 * Ocean restoration technologies with risk mechanics:
 * 1. Iron Fertilization - Early, cheap, risky (40%)
 * 2. Ocean Alkalinity Enhancement - Mid-game, moderate (30%)
 * 3. Artificial Upwelling - Low risk (20%), energy-intensive
 * 4. Bioengineered Cleaners - Late-game, very risky (60%)
 * 
 * Key mechanic: TERMINATION SHOCK
 * - Ecosystems adapt to intervention over time
 * - Stopping abruptly causes catastrophic climate shift
 * - Must ramp down gradually (1%/month) to avoid disaster
 * - Permanent resource commitment
 */

import { GameState, GameEvent } from '../types/game';
import {
  IronFertilizationState,
  OceanAlkalinityState,
  ArtificialUpwellingState,
  BioengineeredCleanersState,
  GeoengTechnology,
} from '../types/resources';

// Helper to add events
function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

export function updateGeoengineering(state: GameState): void {
  const resources = state.resourceEconomy;
  if (!resources) return;
  
  const geoeng = resources.geoengineering;
  
  // Update each active geoengineering technology
  if (geoeng.ironFertilization) {
    updateIronFertilization(state, geoeng.ironFertilization);
  }
  
  if (geoeng.oceanAlkalinity) {
    updateOceanAlkalinity(state, geoeng.oceanAlkalinity);
  }
  
  if (geoeng.artificialUpwelling) {
    updateArtificialUpwelling(state, geoeng.artificialUpwelling);
  }
  
  if (geoeng.bioengineeredCleaners) {
    updateBioengineeredCleaners(state, geoeng.bioengineeredCleaners);
  }
  
  // Update ocean intervention status
  const anyActive = 
    (geoeng.ironFertilization?.deploymentLevel || 0) > 0 ||
    (geoeng.oceanAlkalinity?.deploymentLevel || 0) > 0 ||
    (geoeng.artificialUpwelling?.deploymentLevel || 0) > 0 ||
    (geoeng.bioengineeredCleaners?.deploymentLevel || 0) > 0;
  
  resources.ocean.geoengInterventionActive = anyActive;
  
  if (anyActive) {
    resources.ocean.geoengIntensity = 
      (geoeng.ironFertilization?.deploymentLevel || 0) * 0.3 +
      (geoeng.oceanAlkalinity?.deploymentLevel || 0) * 0.4 +
      (geoeng.artificialUpwelling?.deploymentLevel || 0) * 0.2 +
      (geoeng.bioengineeredCleaners?.deploymentLevel || 0) * 0.5;
  } else {
    resources.ocean.geoengIntensity = 0;
  }
}

// ============================================================================
// IRON FERTILIZATION
// ============================================================================

function updateIronFertilization(state: GameState, tech: IronFertilizationState): void {
  const resources = state.resourceEconomy;
  const ocean = resources.ocean;
  const avgAI = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  
  if (tech.deploymentLevel <= 0) return;
  
  // Track active time
  tech.monthsActive++;
  
  // Deployment quality depends on AI capability (need 2.0+ for safe deployment)
  tech.deploymentQuality = Math.min(1.0, avgAI / 2.0);
  
  // BENEFITS: Phytoplankton boost + CO2 sequestration
  const qualityFactor = tech.deploymentQuality;
  const deploymentFactor = tech.deploymentLevel;
  
  // Boost phytoplankton
  const phytoBoost = 0.03 * deploymentFactor * qualityFactor; // Up to 3% per month
  ocean.phytoplanktonPopulation = Math.min(1.0, ocean.phytoplanktonPopulation + phytoBoost);
  
  // Sequester CO2
  const co2Removal = 0.008 * deploymentFactor * qualityFactor; // Up to 0.8% per month
  resources.co2.atmosphericCO2 = Math.max(280, resources.co2.atmosphericCO2 - co2Removal * 10); // ppm
  
  // Track cumulative impact
  tech.cumulativeImpact += phytoBoost + co2Removal;
  
  // RISKS: Bloom crash (dead zone expansion)
  if (tech.deploymentQuality < 0.7 && !tech.disasterOccurred) {
    const riskProb = (0.7 - tech.deploymentQuality) * 0.6; // Up to 40% risk
    
    if (Math.random() < riskProb) {
      // DISASTER: Bloom dies, consumes oxygen
      tech.disasterOccurred = true;
      tech.bloomCrashes++;
      
      ocean.oxygenLevel = Math.max(0, ocean.oxygenLevel - 0.1);
      ocean.deadZoneExtent = Math.min(1.0, ocean.deadZoneExtent + 0.08);
      
      addEvent(state, {
        type: 'crisis',
        severity: 'critical',
        agent: 'Geoengineering',
        title: '⚠️ Algae Bloom Crash',
        description: `Iron fertilization caused massive phytoplankton bloom, but the bloom died and consumed oxygen. Dead zones expanded by 8%. AI modeling insufficient (quality: ${(tech.deploymentQuality * 100).toFixed(0)}%).`,
        effects: { oxygen_crash: 1.0, geoeng_failure: 1.0 }
      });
      
      // Trust loss
      state.society.trustInAI = Math.max(0.2, state.society.trustInAI - 0.05);
    }
  }
  
  // Gradual ramp-up/down tracking
  tech.rampUpRate = Math.max(0, tech.deploymentLevel - (tech.deploymentLevel - 0.02)); // Assume 2%/month ramp
  tech.rampDownRate = 0; // Calculate when stopping
  
  // Adaptation increases over time
  tech.adaptationTime = tech.monthsActive;
  
  // TERMINATION SHOCK RISK
  updateTerminationShockRisk(state, tech, 'ironFertilization');
}

// ============================================================================
// OCEAN ALKALINITY ENHANCEMENT
// ============================================================================

function updateOceanAlkalinity(state: GameState, tech: OceanAlkalinityState): void {
  const resources = state.resourceEconomy;
  const ocean = resources.ocean;
  const avgAI = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  
  if (tech.deploymentLevel <= 0) return;
  
  tech.monthsActive++;
  
  // Deployment quality (need 2.5+ for safe deployment)
  tech.deploymentQuality = Math.min(1.0, avgAI / 2.5);
  
  const qualityFactor = tech.deploymentQuality;
  const deploymentFactor = tech.deploymentLevel;
  
  // BENEFITS: Raise pH + sequester CO2
  const pHRecovery = 0.002 * deploymentFactor * qualityFactor; // +0.2% per month at full quality
  ocean.pH = Math.min(8.2, ocean.pH + pHRecovery);
  
  const co2Sequestration = 0.01 * deploymentFactor * qualityFactor; // 1% per month
  resources.co2.atmosphericCO2 = Math.max(280, resources.co2.atmosphericCO2 - co2Sequestration * 10);
  
  // Track alkalinity added (PERMANENT!)
  tech.totalAlkalinityAdded += deploymentFactor * 0.01;
  tech.carbonSequestered += co2Sequestration;
  tech.cumulativeImpact += pHRecovery + co2Sequestration;
  
  // RISKS: Local pH spikes
  if (tech.deploymentQuality < 0.7 && !tech.disasterOccurred) {
    const riskProb = (0.7 - tech.deploymentQuality) * 0.5; // Up to 30% risk
    
    if (Math.random() < riskProb) {
      // DISASTER: pH spike kills marine life
      tech.disasterOccurred = true;
      tech.localPHSpikes++;
      
      ocean.fishStocks = Math.max(0, ocean.fishStocks - 0.05);
      ocean.pollutionLoad = Math.min(1.0, ocean.pollutionLoad + 0.03); // Trace metals
      
      addEvent(state, {
        type: 'crisis',
        severity: 'critical',
        agent: 'Geoengineering',
        title: '⚠️ Ocean Alkalinity Disaster',
        description: `Poorly calibrated alkalinity enhancement caused local pH spikes, killing marine ecosystems. AI models insufficient to predict ocean circulation (quality: ${(tech.deploymentQuality * 100).toFixed(0)}%).`,
        effects: { ocean_damage: 1.0, geoeng_failure: 1.0 }
      });
      
      state.society.trustInAI = Math.max(0.2, state.society.trustInAI - 0.05);
    }
  }
  
  // Termination shock
  tech.adaptationTime = tech.monthsActive;
  updateTerminationShockRisk(state, tech, 'oceanAlkalinity');
}

// ============================================================================
// ARTIFICIAL UPWELLING
// ============================================================================

function updateArtificialUpwelling(state: GameState, tech: ArtificialUpwellingState): void {
  const resources = state.resourceEconomy;
  const ocean = resources.ocean;
  const avgAI = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  
  if (tech.deploymentLevel <= 0) return;
  
  tech.monthsActive++;
  
  // Deployment quality (need 3.0+ for optimal, but safer than others)
  tech.deploymentQuality = Math.min(1.0, avgAI / 3.0);
  
  const qualityFactor = Math.max(0.5, tech.deploymentQuality); // Minimum 50% quality
  const deploymentFactor = tech.deploymentLevel;
  
  // Check if fusion is available (REQUIRED for energy)
  const fusion = state.breakthroughTech?.fusionPower;
  const hasFusion = fusion?.unlocked && fusion.deploymentLevel > 0.3;
  
  if (!hasFusion) {
    // Can't run without fusion (too energy-intensive)
    tech.deploymentLevel = Math.max(0, tech.deploymentLevel - 0.05); // Ramp down
    
    if (tech.monthsActive === 1) {
      addEvent(state, {
        type: 'crisis',
        severity: 'warning',
        agent: 'Geoengineering',
        title: '⚡ Insufficient Energy for Upwelling',
        description: 'Artificial upwelling requires massive energy input. Fusion power needed to sustain operations.',
        effects: { energy_crisis: 0.5 }
      });
    }
    return;
  }
  
  // BENEFITS: Oxygenation + nutrient boost + fish recovery
  const oxygenBoost = 0.025 * deploymentFactor * qualityFactor; // 2.5% per month
  ocean.oxygenLevel = Math.min(1.0, ocean.oxygenLevel + oxygenBoost);
  
  const fishRecovery = 0.015 * deploymentFactor * qualityFactor; // 1.5% per month
  ocean.fishStocks = Math.min(1.0, ocean.fishStocks + fishRecovery);
  
  // Reduce dead zones
  const deadZoneReduction = 0.02 * deploymentFactor * qualityFactor;
  ocean.deadZoneExtent = Math.max(0, ocean.deadZoneExtent - deadZoneReduction);
  
  tech.cumulativeImpact += oxygenBoost + fishRecovery;
  
  // Energy consumption (from fusion)
  tech.energyConsumption = deploymentFactor * 10; // 10 units at full deployment
  tech.pumpsActive = Math.floor(deploymentFactor * 100); // Up to 100 pumps
  
  // RISKS: Lower than others (mimics nature)
  if (tech.deploymentQuality < 0.5 && !tech.disasterOccurred) {
    const riskProb = (0.5 - tech.deploymentQuality) * 0.4; // Up to 20% risk
    
    if (Math.random() < riskProb) {
      // DISASTER: Disrupted ocean currents
      tech.disasterOccurred = true;
      
      ocean.ecosystemResilience = Math.max(0, ocean.ecosystemResilience - 0.1);
      
      addEvent(state, {
        type: 'crisis',
        severity: 'warning',
        agent: 'Geoengineering',
        title: '⚠️ Ocean Current Disruption',
        description: `Artificial upwelling disrupted natural ocean circulation patterns. Ecosystem resilience reduced. Better AI modeling needed (quality: ${(tech.deploymentQuality * 100).toFixed(0)}%).`,
        effects: { ecosystem_disruption: 0.5 }
      });
      
      state.society.trustInAI = Math.max(0.2, state.society.trustInAI - 0.03);
    }
  }
  
  tech.adaptationTime = tech.monthsActive;
  updateTerminationShockRisk(state, tech, 'artificialUpwelling');
}

// ============================================================================
// BIOENGINEERED CLEANERS
// ============================================================================

function updateBioengineeredCleaners(state: GameState, tech: BioengineeredCleanersState): void {
  const resources = state.resourceEconomy;
  const ocean = resources.ocean;
  const avgAI = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
  const avgAlignment = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length : 0;
  
  if (tech.deploymentLevel <= 0) return;
  
  tech.monthsActive++;
  
  // Deployment quality depends on AI capability AND alignment (need 4.0+ AND 0.7+)
  const capabilityQuality = Math.min(1.0, avgAI / 4.0);
  const alignmentQuality = avgAlignment;
  tech.deploymentQuality = capabilityQuality * alignmentQuality;
  
  const qualityFactor = tech.deploymentQuality;
  const deploymentFactor = tech.deploymentLevel;
  
  // BENEFITS: Pollution cleanup + plastic degradation + ecosystem regen
  const pollutionCleanup = 0.03 * deploymentFactor * qualityFactor;
  ocean.pollutionLoad = Math.max(0, ocean.pollutionLoad - pollutionCleanup);
  
  const plasticDegradation = 0.04 * deploymentFactor * qualityFactor;
  ocean.plasticConcentration = Math.max(0, ocean.plasticConcentration - plasticDegradation);
  
  const ecoRegen = 0.02 * deploymentFactor * qualityFactor;
  ocean.ecosystemResilience = Math.min(1.0, ocean.ecosystemResilience + ecoRegen);
  
  tech.cumulativeImpact += pollutionCleanup + plasticDegradation + ecoRegen;
  
  // Track organism spread
  tech.organismsReleased += deploymentFactor * 1000; // Thousands of organisms
  tech.populationGrowth = tech.organismsReleased * 0.05; // 5% growth per month
  
  // RISKS: VERY HIGH (60%!)
  if (tech.deploymentQuality < 0.8 && !tech.invasiveEvent) {
    const riskProb = (0.8 - tech.deploymentQuality) * 0.75; // Up to 60% risk!
    
    if (Math.random() < riskProb) {
      // CATASTROPHIC DISASTER: Invasive species
      tech.invasiveEvent = true;
      tech.disasterOccurred = true;
      
      const disasterType = Math.random();
      
      if (disasterType < 0.4) {
        // 40%: Outcompetes native species
        ocean.fishStocks = Math.max(0, ocean.fishStocks - 0.3);
        ocean.phytoplanktonPopulation = Math.max(0, ocean.phytoplanktonPopulation - 0.2);
        resources.environmentalAccumulation.biodiversityIndex = Math.max(0, resources.environmentalAccumulation.biodiversityIndex - 0.15);
        
        addEvent(state, {
          type: 'catastrophe',
          severity: 'existential',
          agent: 'Geoengineering',
          title: '☠️ INVASIVE SPECIES DISASTER',
          description: `Bioengineered organisms evolved beyond design parameters and are outcompeting native marine life. Ocean ecosystems collapsing. AI insufficient for safe synthetic biology (capability: ${avgAI.toFixed(1)}, alignment: ${avgAlignment.toFixed(2)}).`,
          effects: { ecosystem_collapse: 1.0, biotech_disaster: 1.0 }
        });
        
      } else if (disasterType < 0.7) {
        // 30%: Oxygen crash (bloom die-off)
        ocean.oxygenLevel = Math.max(0, ocean.oxygenLevel - 0.25);
        ocean.deadZoneExtent = Math.min(1.0, ocean.deadZoneExtent + 0.2);
        
        addEvent(state, {
          type: 'catastrophe',
          severity: 'existential',
          agent: 'Geoengineering',
          title: '💀 OXYGEN CRASH',
          description: `Bioengineered cleaners caused massive algae bloom followed by die-off. Dead zones expanding rapidly. Oxygen levels critical.`,
          effects: { anoxic_zones: 1.0, biotech_disaster: 1.0 }
        });
        
      } else {
        // 30%: Toxic byproducts
        ocean.pollutionLoad = Math.min(1.0, ocean.pollutionLoad + 0.15);
        state.qol.health = Math.max(0, state.qol.health - 0.08);
        
        addEvent(state, {
          type: 'catastrophe',
          severity: 'critical',
          agent: 'Geoengineering',
          title: '☢️ TOXIC BYPRODUCTS',
          description: `Bioengineered organisms are producing unexpected toxic compounds. Seafood contaminated, coastal populations at risk.`,
          effects: { biotoxin_crisis: 1.0, biotech_disaster: 1.0 }
        });
      }
      
      // Major trust loss
      state.society.trustInAI = Math.max(0.2, state.society.trustInAI - 0.15);
      
      // Increase biotech risk
      if (state.technologicalRisk) {
        state.technologicalRisk.biotechRisk = Math.min(1.0, state.technologicalRisk.biotechRisk + 0.2);
      }
    }
  }
  
  // If invasive event occurred, organisms keep spreading
  if (tech.invasiveEvent) {
    tech.organismsReleased += tech.deploymentLevel * 10000; // Exponential growth!
    ocean.ecosystemResilience = Math.max(0, ocean.ecosystemResilience - 0.01); // Ongoing damage
    
    // Can only be stopped by VERY high AI (4.5+)
    if (avgAI > 4.5 && avgAlignment > 0.8 && !tech.containmentAttempts) {
      tech.containmentAttempts = 1;
      tech.invasiveEvent = false;
      tech.organismsReleased = 0;
      
      addEvent(state, {
        type: 'resolution',
        severity: 'info',
        agent: 'Geoengineering',
        title: '🧬 Invasive Species Contained',
        description: 'Superintelligent AI designed targeted bioweapons to eliminate invasive organisms without harming native life. Crisis averted.',
        effects: { crisis_resolved: 1.0 }
      });
    }
  }
  
  tech.adaptationTime = tech.monthsActive;
  updateTerminationShockRisk(state, tech, 'bioengineeredCleaners');
}

// ============================================================================
// TERMINATION SHOCK
// ============================================================================

function updateTerminationShockRisk(state: GameState, tech: GeoengTechnology, techName: string): void {
  const ocean = state.resourceEconomy.ocean;
  
  // Adaptation increases over time (1% per month at full deployment)
  const adaptationIncrease = tech.deploymentLevel * 0.01;
  tech.adaptationTime = Math.min(100, tech.adaptationTime + adaptationIncrease);
  
  // Calculate termination shock risk
  const adaptationLevel = tech.adaptationTime / 100; // [0, 1]
  
  // If ramping down too fast, risk termination shock
  if (tech.rampDownRate > tech.minSafeRampRate) {
    const excessRate = tech.rampDownRate - tech.minSafeRampRate;
    const shockRisk = adaptationLevel * excessRate * 10; // Up to 100% risk
    
    ocean.terminationShockRisk = Math.max(ocean.terminationShockRisk, shockRisk);
    
    if (Math.random() < shockRisk) {
      // TERMINATION SHOCK DISASTER!
      triggerTerminationShock(state, techName, adaptationLevel);
    }
  }
  
  // Update ocean's overall termination shock risk
  if (tech.deploymentLevel > 0) {
    ocean.terminationShockRisk = adaptationLevel * 0.5; // Potential risk
  }
}

function triggerTerminationShock(state: GameState, techName: string, adaptationLevel: number): void {
  const resources = state.resourceEconomy;
  const ocean = resources.ocean;
  
  // Rapid climate shift
  resources.co2.temperatureAnomaly += 2.0; // Sudden +2°C spike!
  
  // Ecosystem collapse
  ocean.phytoplanktonPopulation = Math.max(0, ocean.phytoplanktonPopulation - 0.4);
  resources.environmentalAccumulation.biodiversityIndex = Math.max(0, resources.environmentalAccumulation.biodiversityIndex - 0.3);
  
  // Trigger extinction event
  if (!state.extinctionState.active) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'slow';
    state.extinctionState.mechanism = 'geoeng_termination_shock';
    state.extinctionState.severity = adaptationLevel; // Severity scales with adaptation
  }
  
  addEvent(state, {
    type: 'catastrophe',
    severity: 'existential',
    agent: 'Geoengineering',
    title: '💥 TERMINATION SHOCK',
    description: `Abrupt halt of ${techName} caused rapid climate shift. Ecosystems had adapted to intervention (${(adaptationLevel * 100).toFixed(0)}% adapted) and cannot survive sudden change. Temperature spike: +2°C in months instead of decades.`,
    effects: { termination_shock: 1.0, climate_catastrophe: 1.0 }
  });
  
  console.log(`\n💥 TERMINATION SHOCK: ${techName} abruptly stopped after ${(adaptationLevel * 100).toFixed(0)}% adaptation!`);
}

