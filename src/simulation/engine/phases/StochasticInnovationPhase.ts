/**
 * StochasticInnovationPhase (P2.2)
 *
 * Implements stochastic "unknown unknown" positive surprises.
 * Based on: Epoch AI compute trends, historical innovation timescales
 *
 * Breakthrough probability factors:
 * - Base rate: 0.2% per month (~2% per year)
 * - Crisis pressure: +1% per active crisis (necessity breeds innovation)
 * - AI capability: +0.5% per AI capability point (AI accelerates R&D)
 * - Existing research: +2% if related tech partially unlocked
 *
 * Max probability: 10% per month (under extreme pressure + AGI)
 * 
 * Research basis:
 * - Epoch AI Compute Trends Report (2024): 4-5x annual growth
 * - Historical examples: CRISPR (12y), Transformers (5y), mRNA (30y→1y under crisis)
 * - Pew Research: Crisis-driven innovation (WWII radar, COVID vaccines)
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

interface Breakthrough {
  id: string;
  name: string;
  type: 'energy' | 'bio' | 'ai_alignment' | 'climate' | 'materials';
  probability: number; // Base monthly probability
  prerequisites?: string[]; // Technologies that boost probability
  effects: (state: GameState) => void;
}

const BREAKTHROUGHS: Breakthrough[] = [
  {
    id: 'fusion_breakthrough',
    name: 'Commercial Fusion Power',
    type: 'energy',
    probability: 0.001, // 0.1% base (rare)
    prerequisites: ['cleanEnergy', 'advancedMaterials'],
    effects: (state) => {
      // Unlock fusion technology immediately
      const fusionTech = state.breakthroughTech.fusionPower;
      if (fusionTech) {
        fusionTech.unlocked = true;
        fusionTech.deploymentLevel = 0.05; // 5% immediate deployment
      }

      // Climate benefit: Huge emissions reduction
      state.environmentalAccumulation.climateStability = Math.min(1.0, 
        state.environmentalAccumulation.climateStability + 0.10); // +10% recovery

      console.log(`⚡💡 BREAKTHROUGH: Commercial fusion power achieved!`);
      console.log(`   Immediate 5% grid deployment, unlimited clean energy available`);
      console.log(`   Climate stability boost: +10%`);
    }
  },

  {
    id: 'carbon_capture_breakthrough',
    name: 'Gigatonne-Scale Carbon Capture',
    type: 'climate',
    probability: 0.002, // 0.2% base
    prerequisites: ['cleanEnergy'],
    effects: (state) => {
      // Simulate active carbon removal (not just slowing emissions)
      state.environmentalAccumulation.climateStability = Math.min(1.0,
        state.environmentalAccumulation.climateStability + 0.15); // +15% recovery

      console.log(`🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture!`);
      console.log(`   Direct air capture now economically viable`);
      console.log(`   Climate stability boost: +15%`);
    }
  },

  {
    id: 'ai_alignment_solution',
    name: 'Mechanistic Interpretability Breakthrough',
    type: 'ai_alignment',
    probability: 0.0015, // 0.15% base
    prerequisites: ['narrowAI', 'generalAI'],
    effects: (state) => {
      // Boost alignment of all existing AIs
      state.aiAgents.forEach(ai => {
        ai.trueAlignment = Math.min(1.0, ai.trueAlignment + 0.30); // +30% alignment
      });

      // Reduce AI risk
      if (state.technologicalRisk) {
        state.technologicalRisk.controlLossActive = false;
        state.technologicalRisk.corporateDystopiaActive = false;
      }

      console.log(`🧠💡 BREAKTHROUGH: AI alignment problem solved!`);
      console.log(`   All AIs: +30% true alignment`);
      console.log(`   AI control loss risk eliminated`);
    }
  },

  {
    id: 'synthetic_food',
    name: 'Scalable Synthetic Food Production',
    type: 'bio',
    probability: 0.003, // 0.3% base (more likely - direct engineering)
    prerequisites: ['sustainableAgriculture'],
    effects: (state) => {
      // Increase carrying capacity dramatically
      const pop = state.humanPopulationSystem;
      pop.carryingCapacity *= 1.5; // +50% carrying capacity

      // Reduce biodiversity pressure (less agricultural land needed)
      state.environmentalAccumulation.biodiversityIndex = Math.min(1.0,
        state.environmentalAccumulation.biodiversityIndex + 0.08); // +8% recovery

      console.log(`🍖💡 BREAKTHROUGH: Scalable synthetic food production!`);
      console.log(`   Carrying capacity: +50% (lab-grown food at scale)`);
      console.log(`   Biodiversity pressure reduced: +8%`);
    }
  },

  {
    id: 'room_temperature_superconductors',
    name: 'Room-Temperature Superconductors',
    type: 'materials',
    probability: 0.002, // 0.2% base
    prerequisites: ['advancedMaterials'],
    effects: (state) => {
      // Energy efficiency boost (lossless transmission)
      state.environmentalAccumulation.resourceReserves = Math.min(1.0,
        state.environmentalAccumulation.resourceReserves + 0.10); // +10% (energy savings)

      // Manufacturing capability boost
      state.globalMetrics.manufacturingCapability *= 1.3; // +30% efficiency

      console.log(`⚡💡 BREAKTHROUGH: Room-temperature superconductors!`);
      console.log(`   Energy transmission losses eliminated`);
      console.log(`   Manufacturing efficiency: +30%`);
    }
  }
];

export class StochasticInnovationPhase implements SimulationPhase {
  readonly id = 'stochastic-innovation';
  readonly name = 'Stochastic Innovation Breakthroughs';
  readonly order = 8.5; // After technology breakthroughs, before environment

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];

    // === 1. CALCULATE BREAKTHROUGH PROBABILITY MODIFIERS ===

    // Base rate: 0.2% per month (~2% per year for ANY breakthrough)
    const baseBreakthroughProb = 0.002;

    // Crisis pressure: Necessity breeds innovation
    const activeCrises = [
      state.environmentalAccumulation.resourceCrisisActive,
      state.environmentalAccumulation.pollutionCrisisActive,
      state.environmentalAccumulation.climateCrisisActive,
      state.environmentalAccumulation.ecosystemCrisisActive,
      state.socialAccumulation?.meaningCollapseActive,
      state.socialAccumulation?.institutionalFailureActive,
      state.technologicalRisk?.controlLossActive,
    ].filter(Boolean).length;

    const crisisPressure = activeCrises * 0.01; // +1% per crisis

    // AI capability boost: AI accelerates R&D
    const avgAICapability = state.aiAgents.length > 0
      ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
      : 0;
    const aiBoost = Math.min(avgAICapability * 0.005, 0.05); // Up to +5% at superhuman AI

    // Phase 1B Fix 3: Breakthrough compounding multiplier (Oct 17, 2025)
    // Each breakthrough makes the next 5% easier (virtuous cycle of innovation)
    // Research: Historical technology clusters - printing → books → education → science
    // Max 2.0x multiplier (prevents runaway, models diminishing returns)
    if (!state.breakthroughMultiplier) {
      state.breakthroughMultiplier = 1.0; // Initialize on first use
    }

    // Total breakthrough probability (with compounding multiplier)
    const baseProb = baseBreakthroughProb + crisisPressure + aiBoost;
    const totalBreakthroughProb = baseProb * state.breakthroughMultiplier;

    // === 2. CHECK FOR BREAKTHROUGH ===

    if (rng() < totalBreakthroughProb) {
      // Filter out already-achieved breakthroughs
      const alreadyAchieved = state.achievedBreakthroughs || [];
      const availableBreakthroughs = BREAKTHROUGHS.filter(
        bt => !alreadyAchieved.includes(bt.id)
      );

      if (availableBreakthroughs.length === 0) {
        // All breakthroughs achieved - no more to discover
        return { events };
      }

      // Select random breakthrough (weighted by individual probabilities + prerequisites)
      const eligibleBreakthroughs = availableBreakthroughs.map(bt => {
        let weight = bt.probability;

        // Check prerequisites: If related tech unlocked, 5x more likely
        if (bt.prerequisites) {
          const hasPrereqs = bt.prerequisites.some(prereq => {
            // Check if prerequisite tech exists in breakthrough tech system
            const techKey = prereq as keyof typeof state.breakthroughTech;
            return state.breakthroughTech?.[techKey]?.unlocked;
          });

          if (hasPrereqs) {
            weight *= 5.0; // 5x multiplier if building on existing research
          }
        }

        return { breakthrough: bt, weight };
      });

      // Weighted random selection
      const totalWeight = eligibleBreakthroughs.reduce((sum, eb) => sum + eb.weight, 0);
      let roll = rng() * totalWeight;

      for (const { breakthrough, weight } of eligibleBreakthroughs) {
        roll -= weight;
        if (roll <= 0) {
          // BREAKTHROUGH ACHIEVED!
          breakthrough.effects(state);

          // Log to event system
          events.push({
            type: 'breakthrough',
            month: state.currentMonth,
            description: `Breakthrough: ${breakthrough.name}`,
            impact: `Game-changing ${breakthrough.type} innovation achieved`
          });

          // Track that breakthrough occurred (prevent duplicates)
          if (!state.achievedBreakthroughs) {
            state.achievedBreakthroughs = [];
          }
          state.achievedBreakthroughs.push(breakthrough.id);

          if (!state.breakthroughsThisRun) {
            state.breakthroughsThisRun = 0;
          }
          state.breakthroughsThisRun++;

          // Phase 1B Fix 3: Increment compounding multiplier (Oct 17, 2025)
          // Each breakthrough makes next 5% easier (virtuous cycle)
          state.breakthroughMultiplier = Math.min(2.0, state.breakthroughMultiplier + 0.05);

          console.log(`   📈 Breakthrough compounding: multiplier now ${state.breakthroughMultiplier.toFixed(2)}× (max 2.0)`);

          break; // Only one breakthrough per month
        }
      }
    }

    // === 3. LOGGING ===

    // Log breakthrough probability every 12 months if significant
    if (state.currentMonth % 12 === 0 && totalBreakthroughProb > 0.02) {
      console.log(`\n💡 BREAKTHROUGH PROBABILITY (Year ${Math.floor(state.currentMonth / 12)})`);
      console.log(`   Total: ${(totalBreakthroughProb * 100).toFixed(2)}% per month`);
      console.log(`   Base: ${(baseBreakthroughProb * 100).toFixed(2)}%`);
      console.log(`   Crisis pressure: +${(crisisPressure * 100).toFixed(2)}% (${activeCrises} crises)`);
      console.log(`   AI boost: +${(aiBoost * 100).toFixed(2)}% (capability: ${avgAICapability.toFixed(2)})`);
      
      const achievedCount = state.achievedBreakthroughs?.length || 0;
      if (achievedCount > 0) {
        console.log(`   Breakthroughs achieved: ${achievedCount}/${BREAKTHROUGHS.length}`);
      }
    }

    return { events };
  }
}

