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

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { getTechDeploymentSafe } from '../../techTree/helpers';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
import {
  assertFinite,
  assertProbability,
  assertInRange,
} from '@/simulation/utils/assertions';
import { hasTech } from '@/simulation/utils/simulationIndices';

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
      if (state.techTreeState) {
        if (!hasTech('fusionPower', undefined, state.techTreeState)) {
          state.techTreeState.unlockedTech.push('fusionPower');
        }
        // Note: Progress/deployment is tracked in techTreeState.regionalDeployment, not static definitions
      }

      // Climate benefit: Huge emissions reduction
      state.environmentalAccumulation.climateStability = assertProbability(
        Math.min(1.0, state.environmentalAccumulation.climateStability + 0.10),
        {
          location: 'StochasticInnovationPhase.fusion_breakthrough',
          valueName: 'climateStability',
          month: state.currentMonth
        }
      );

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
      state.environmentalAccumulation.climateStability = assertProbability(
        Math.min(1.0, state.environmentalAccumulation.climateStability + 0.15),
        {
          location: 'StochasticInnovationPhase.carbon_capture_breakthrough',
          valueName: 'climateStability',
          month: state.currentMonth
        }
      );

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
        // DEFENSIVE: Clamp trueAlignment to [0, 1] before adding (defense in depth)
        // Root cause fixed Nov 2025: aiWelfare.ts, lifecycle.ts, aiAgent.ts now clamp to [0, 1]
        // This remains as secondary safeguard in case new code violates bounds
        const currentAlignment = Math.max(0.0, Math.min(1.0, ai.trueAlignment));
        ai.trueAlignment = assertProbability(
          Math.min(1.0, currentAlignment + 0.30),
          {
            location: 'StochasticInnovationPhase.ai_alignment_solution',
            valueName: `trueAlignment_${ai.id}`,
            month: state.currentMonth
          }
        );
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
      pop.carryingCapacity = assertFinite(
        pop.carryingCapacity * 1.5,
        {
          location: 'StochasticInnovationPhase.synthetic_food',
          valueName: 'carryingCapacity',
          month: state.currentMonth
        }
      );

      // Reduce biodiversity pressure (less agricultural land needed)
      state.environmentalAccumulation.biodiversityIndex = assertProbability(
        Math.min(1.0, state.environmentalAccumulation.biodiversityIndex + 0.08),
        {
          location: 'StochasticInnovationPhase.synthetic_food',
          valueName: 'biodiversityIndex',
          month: state.currentMonth
        }
      );

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
      state.environmentalAccumulation.resourceReserves = assertProbability(
        Math.min(1.0, state.environmentalAccumulation.resourceReserves + 0.10),
        {
          location: 'StochasticInnovationPhase.room_temperature_superconductors',
          valueName: 'resourceReserves',
          month: state.currentMonth
        }
      );

      // Manufacturing capability boost
      state.globalMetrics.manufacturingCapability = assertFinite(
        state.globalMetrics.manufacturingCapability * 1.3,
        {
          location: 'StochasticInnovationPhase.room_temperature_superconductors',
          valueName: 'manufacturingCapability',
          month: state.currentMonth
        }
      );

      console.log(`⚡💡 BREAKTHROUGH: Room-temperature superconductors!`);
      console.log(`   Energy transmission losses eliminated`);
      console.log(`   Manufacturing efficiency: +30%`);
    }
  }
];

export class StochasticInnovationPhase implements SimulationPhase {
  readonly id = 'stochastic-innovation';
  readonly name = 'Stochastic Innovation Breakthroughs';
  readonly order = 12.6; // After tech-tree (12.5), before meaning-renaissance (12.7), climate-deployment (12.8)

  // DEPENDENCIES (Nov 15, 2025): Requires AI agents and bifurcation state
  // NOTE: tech-tree dependency REMOVED - backwards ordering (8.5 cannot depend on 12.5)
  // Phase reads tech state from previous step
  readonly dependencies = [
    'ai-agent-actions',       // Order 7.0: AI capabilities accelerate innovation
    'bifurcation-logic',      // Nov 14, 2025 - CRITICAL-1 fix: explicit bifurcation dependency
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // HIGH-8 FIX (Nov 28, 2025): Disable stochastic breakthroughs during historical mode
    // Rationale: Historical period (1990-2024) did NOT experience fusion power, room-temp superconductors, etc.
    // These speculative innovations are for projection mode only (2025+)
    if (isHistoricalModeActive(state)) {
      return { events };
    }

    // === 1. CALCULATE BREAKTHROUGH PROBABILITY MODIFIERS ===

    // Base rate: 0.2% per month (~2% per year for ANY breakthrough)
    const baseBreakthroughProb = 0.002;

    // Crisis pressure: Necessity breeds innovation
    if (state.socialAccumulation === undefined) {
      throw new Error('❌ state.socialAccumulation is undefined in StochasticInnovationPhase:161 - initialization bug');
    }
    const activeCrises = [
      state.environmentalAccumulation.resourceCrisisActive,
      state.environmentalAccumulation.pollutionCrisisActive,
      state.environmentalAccumulation.climateCrisisActive,
      state.environmentalAccumulation.ecosystemCrisisActive,
      state.socialAccumulation.meaningCollapseActive,
      state.socialAccumulation.institutionalFailureActive,
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

    // === BIFURCATION VARIANCE AMPLIFICATION ===
    // Near critical thresholds → 10× variance amplification
    // Creates path-dependent breakthrough timing (some runs get lucky, others don't)
    const varianceAmp = assertFinite(state.bifurcationState.varianceAmplification, {
      location: 'StochasticInnovationPhase.execute',
      valueName: 'varianceAmplification',
      month: state.currentMonth,
      additionalInfo: { expectedSource: 'BifurcationLogicPhase (order 4.5)' }
    });

    // Total breakthrough probability (with compounding multiplier AND bifurcation amplification)
    const baseProb = baseBreakthroughProb + crisisPressure + aiBoost;
    const totalBreakthroughProb = baseProb * state.breakthroughMultiplier * varianceAmp;

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
          const unlockedSet = new Set(state.techTreeState?.unlockedTech || []);
          const hasPrereqs = bt.prerequisites.some(prereq => {
            return unlockedSet.has(prereq);
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
            id: `breakthrough-${breakthrough.id}-${state.currentMonth}`,
            type: 'breakthrough',
            title: `Breakthrough: ${breakthrough.name}`,
            timestamp: state.currentMonth,
            description: `Game-changing ${breakthrough.type} innovation achieved`,
            severity: 'transformative',
            agent: 'technology',
            effects: { breakthroughId: breakthrough.id, breakthroughType: breakthrough.type }
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
          state.breakthroughMultiplier = assertInRange(
            Math.min(2.0, state.breakthroughMultiplier + 0.05),
            0,
            2.0,
            {
              location: 'StochasticInnovationPhase.execute',
              valueName: 'breakthroughMultiplier',
              month: state.currentMonth
            }
          );

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

