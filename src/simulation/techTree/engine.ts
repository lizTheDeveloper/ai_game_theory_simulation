/**
 * Technology Tree Engine
 * 
 * Manages tech unlocking, deployment, and effects.
 * Replaces scattered tech unlock logic across multiple files.
 */

import { GameState } from '@/types/game';
import { TechDefinition } from './comprehensiveTechTree';
import { getAllTech, getTechById } from './comprehensiveTechTree';

export interface TechUnlockEvent {
  techId: string;
  techName: string;
  month: number;
  reason: string;
  unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination';
}

export interface TechDeploymentAction {
  techId: string;
  deployedBy: string;  // AI ID or nation name
  investment: number;  // $M invested
  targetRegion: string;
  month: number;
}

export interface RegionalTechDeployment {
  techId: string;
  region: string;
  deploymentLevel: number;  // 0-1
  monthlyInvestment: number;
  totalInvested: number;
  deployedBy: string[];
  effects: Record<string, number>;
}

/**
 * Tech Tree State
 * Tracks which tech is unlocked and deployed where
 */
export interface TechTreeState {
  // Global tech status
  unlockedTech: Set<string>;
  researchProgress: Map<string, number>;  // techId -> progress (0-1)
  
  // Regional deployment
  regionalDeployment: Map<string, RegionalTechDeployment[]>;  // region -> deployments
  
  // Deployment actions queue
  pendingActions: TechDeploymentAction[];
  
  // Unlock history
  unlockHistory: TechUnlockEvent[];
  
  // Statistics
  totalInvestment: number;
  techUnlockedCount: number;
  techDeployedCount: number;
}

/**
 * Initialize tech tree state
 */
export function initializeTechTreeState(): TechTreeState {
  const state: TechTreeState = {
    unlockedTech: new Set(),
    researchProgress: new Map(),
    regionalDeployment: new Map(),
    pendingActions: [],
    unlockHistory: [],
    totalInvestment: 0,
    techUnlockedCount: 0,
    techDeployedCount: 0,
  };
  
  // Unlock all DEPLOYED_2025 tech
  const deployedTech = getAllTech().filter(t => t.status === 'deployed_2025');
  for (const tech of deployedTech) {
    state.unlockedTech.add(tech.id);
    state.techUnlockedCount++;
    
    // Initialize global deployment
    if (!state.regionalDeployment.has('global')) {
      state.regionalDeployment.set('global', []);
    }
    
    state.regionalDeployment.get('global')!.push({
      techId: tech.id,
      region: 'global',
      deploymentLevel: tech.deploymentLevel,
      monthlyInvestment: 0,
      totalInvested: tech.deploymentCost * tech.deploymentLevel,
      deployedBy: ['baseline_2025'],
      effects: tech.effects,
    });
  }
  
  return state;
}

/**
 * Ensure tech tree state has proper types after serialization
 * Sets and Maps become plain objects when serialized, need to reconstruct
 */
export function ensureTechTreeTypes(techTreeState: TechTreeState): void {
  if (!(techTreeState.unlockedTech instanceof Set)) {
    // Set serializes to object with numeric keys, need to convert to array first
    const unlocked = techTreeState.unlockedTech as any;
    if (Array.isArray(unlocked)) {
      techTreeState.unlockedTech = new Set(unlocked);
    } else if (unlocked && typeof unlocked === 'object') {
      // Object with numeric keys - get the values
      techTreeState.unlockedTech = new Set(Object.values(unlocked));
    } else {
      techTreeState.unlockedTech = new Set();
    }
  }
  if (!(techTreeState.researchProgress instanceof Map)) {
    techTreeState.researchProgress = new Map(Object.entries(techTreeState.researchProgress as any || {}));
  }
  if (!(techTreeState.regionalDeployment instanceof Map)) {
    const regional = techTreeState.regionalDeployment as any || {};
    techTreeState.regionalDeployment = new Map(Object.entries(regional));
  }
}

/**
 * Update tech tree each month
 * 
 * 1. Check for new tech unlocks
 * 2. Apply deployment actions
 * 3. Update research progress
 * 4. Calculate tech effects
 */
export function updateTechTree(
  gameState: GameState,
  techTreeState: TechTreeState
): TechUnlockEvent[] {
  const unlockEvents: TechUnlockEvent[] = [];
  
  // Ensure unlockedTech is a Set (can become plain object after serialization)
  ensureTechTreeTypes(techTreeState);
  
  // 1. Check for tech unlocks
  const lockedTech = getAllTech().filter(t => !techTreeState.unlockedTech.has(t.id));
  
  for (const tech of lockedTech) {
    const unlockCheck = checkUnlockConditions(tech, gameState, techTreeState);
    
    if (unlockCheck.canUnlock) {
      unlockTech(tech, gameState, techTreeState, unlockCheck.reason);
      
      const event: TechUnlockEvent = {
        techId: tech.id,
        techName: tech.name,
        month: gameState.currentMonth,
        reason: unlockCheck.reason,
        unlockedBy: unlockCheck.unlockedBy,
      };
      
      unlockEvents.push(event);
      techTreeState.unlockHistory.push(event);
      
      console.log(`\n🚀 TECH UNLOCKED: ${tech.name} (Month ${gameState.currentMonth})`);
      console.log(`   Category: ${tech.category}`);
      console.log(`   Reason: ${unlockCheck.reason}`);
    }
  }
  
  // 2. Apply deployment actions
  applyDeploymentActions(gameState, techTreeState);
  
  // 3. Update research progress for locked tech
  updateResearchProgress(gameState, techTreeState);
  
  // 4. Calculate and apply tech effects
  applyTechEffects(gameState, techTreeState);
  
  return unlockEvents;
}

/**
 * Check if a technology meets unlock conditions
 */
export function checkUnlockConditions(
  tech: TechDefinition,
  gameState: GameState,
  techTreeState: TechTreeState
): {
  canUnlock: boolean;
  reason: string;
  unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination';
  blockers: string[];
} {
  const blockers: string[] = [];
  
  // Already unlocked?
  if (techTreeState.unlockedTech.has(tech.id)) {
    return { canUnlock: false, reason: 'Already unlocked', unlockedBy: 'combination', blockers };
  }
  
  // 1. Check prerequisites
  for (const prereqId of tech.prerequisites) {
    if (!techTreeState.unlockedTech.has(prereqId)) {
      const prereqTech = getTechById(prereqId);
      blockers.push(`Prerequisite not unlocked: ${prereqTech?.name || prereqId}`);
    }
  }
  
  // 2. Check AI capability
  if (tech.minAICapability) {
    const avgCapability = getAverageAICapability(gameState);
    if (avgCapability < tech.minAICapability) {
      blockers.push(`AI capability ${avgCapability.toFixed(2)} < ${tech.minAICapability}`);
    }
  }
  
  // 3. Check economic stage
  if (tech.minEconomicStage) {
    const economicStage = gameState.globalMetrics?.economicTransitionStage || 0;
    if (economicStage < tech.minEconomicStage) {
      blockers.push(`Economic stage ${economicStage.toFixed(1)} < ${tech.minEconomicStage}`);
    }
  }
  
  // 4. Check minimum month (research takes time)
  if (tech.minMonth && gameState.currentMonth < tech.minMonth) {
    blockers.push(`Too early: month ${gameState.currentMonth} < ${tech.minMonth}`);
  }
  
  // 5. Check research progress
  const progress = techTreeState.researchProgress.get(tech.id) || 0;
  if (progress < 1.0) {
    blockers.push(`Research incomplete: ${(progress * 100).toFixed(0)}% complete`);
  }
  
  // Determine unlock trigger type
  let unlockedBy: 'capability' | 'crisis' | 'time' | 'research' | 'combination' = 'combination';
  if (tech.minAICapability && !tech.minEconomicStage && !tech.minMonth) {
    unlockedBy = 'capability';
  } else if (tech.minMonth && !tech.minAICapability) {
    unlockedBy = 'time';
  } else if (progress >= 1.0 && blockers.length === 0) {
    unlockedBy = 'research';
  }
  
  if (blockers.length > 0) {
    return {
      canUnlock: false,
      reason: blockers[0],
      unlockedBy,
      blockers,
    };
  }
  
  return {
    canUnlock: true,
    reason: generateUnlockReason(tech, gameState),
    unlockedBy,
    blockers: [],
  };
}

/**
 * Unlock a technology
 */
function unlockTech(
  tech: TechDefinition,
  gameState: GameState,
  techTreeState: TechTreeState,
  reason: string
): void {
  techTreeState.unlockedTech.add(tech.id);
  techTreeState.techUnlockedCount++;
  
  // Initialize at 0% deployment in all regions
  // Deployment happens through actions
  
  // Add to event log
  gameState.eventLog.push({
    month: gameState.currentMonth,
    type: 'breakthrough',
    severity: 'constructive',
    agent: 'Research Community',
    title: `${tech.name} Breakthrough`,
    description: `${tech.description}. Research complete, ready for deployment.`,
    effects: { tech: tech.id, category: tech.category },
  });
}

/**
 * Apply pending deployment actions
 */
function applyDeploymentActions(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  for (const action of techTreeState.pendingActions) {
    const tech = getTechById(action.techId);
    if (!tech) continue;
    
    // Get or create regional deployment
    if (!techTreeState.regionalDeployment.has(action.targetRegion)) {
      techTreeState.regionalDeployment.set(action.targetRegion, []);
    }
    
    const regional = techTreeState.regionalDeployment.get(action.targetRegion)!;
    let deployment = regional.find(d => d.techId === action.techId);
    
    if (!deployment) {
      deployment = {
        techId: action.techId,
        region: action.targetRegion,
        deploymentLevel: 0,
        monthlyInvestment: 0,
        totalInvested: 0,
        deployedBy: [],
        effects: tech.effects,
      };
      regional.push(deployment);
    }
    
    // Apply investment
    deployment.monthlyInvestment += action.investment;
    deployment.totalInvested += action.investment;
    techTreeState.totalInvestment += action.investment;
    
    // Track deployer
    if (!deployment.deployedBy.includes(action.deployedBy)) {
      deployment.deployedBy.push(action.deployedBy);
    }
    
    // Calculate deployment progress
    // $1B investment = +X% deployment (based on tech cost)
    const deploymentIncrease = action.investment / tech.deploymentCost;
    deployment.deploymentLevel = Math.min(1.0, deployment.deploymentLevel + deploymentIncrease);
    
    if (deployment.deploymentLevel >= 1.0 && !techTreeState.unlockedTech.has(`${tech.id}_deployed`)) {
      techTreeState.techDeployedCount++;
      techTreeState.unlockedTech.add(`${tech.id}_deployed`);
      
      console.log(`✅ TECH FULLY DEPLOYED: ${tech.name} in ${action.targetRegion}`);
    }
  }
  
  // Clear actions
  techTreeState.pendingActions = [];
}

/**
 * Update research progress for locked tech
 * Research investment accelerates unlock timeline
 */
function updateResearchProgress(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  const lockedTech = getAllTech().filter(t => !techTreeState.unlockedTech.has(t.id));
  
  for (const tech of lockedTech) {
    // Get current progress
    let progress = techTreeState.researchProgress.get(tech.id) || 0;
    
    // Calculate progress this month
    // Base: 1 / researchMonthsRequired per month
    const baseProgress = 1.0 / tech.researchMonthsRequired;
    
    // Modifiers:
    const aiCapability = getAverageAICapability(gameState);
    const aiBonus = Math.min(2.0, 1.0 + (aiCapability / 5.0)); // 1.0x to 2.0x
    
    // Research investment bonus (government + private)
    const totalResearch = getTotalResearchInvestment(gameState);
    const researchBonus = 1.0 + Math.min(1.0, totalResearch / 1000); // Up to 2x at $1T/month
    
    // Energy constraints
    const energyMultiplier = getEnergyMultiplier(gameState);
    
    // Combined progress
    const progressThisMonth = baseProgress * aiBonus * researchBonus * energyMultiplier;
    
    progress = Math.min(1.0, progress + progressThisMonth);
    techTreeState.researchProgress.set(tech.id, progress);
  }
}

/**
 * Apply tech effects to game state
 * Effects scale with deployment level
 */
function applyTechEffects(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  // Aggregate effects across all regions
  const globalEffects: Map<string, number> = new Map();
  
  for (const [region, deployments] of techTreeState.regionalDeployment) {
    for (const deployment of deployments) {
      for (const [effect, value] of Object.entries(deployment.effects)) {
        const scaledValue = value * deployment.deploymentLevel;
        globalEffects.set(effect, (globalEffects.get(effect) || 0) + scaledValue);
      }
    }
  }
  
  // Apply global effects to game state
  // This is where tech actually impacts the simulation
  
  for (const [effect, value] of globalEffects) {
    applyEffectToGameState(effect, value, gameState);
  }
}

/**
 * Apply a specific effect to game state
 */
function applyEffectToGameState(
  effect: string,
  value: number,
  gameState: GameState
): void {
  // Map effect names to game state properties
  switch (effect) {
    case 'cleanEnergyPercentage':
      // Handled in energy system
      break;
    case 'fossilDependenceReduction':
      // Handled in resource economy
      break;
    case 'phosphorusRecovery':
      if (gameState.phosphorusSystem) {
        gameState.phosphorusSystem.recoveryRate += value;
      }
      break;
    case 'sleeperDetectionBonus':
      if (gameState.defensiveAI) {
        gameState.defensiveAI.threatDetection.detectSleepers += value;
      }
      break;
    // Add more effect mappings as needed
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAverageAICapability(gameState: GameState): number {
  if (gameState.aiAgents.length === 0) return 0;
  
  const { calculateTotalCapabilityFromProfile } = require('../capabilities');
  const totalCapability = gameState.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile), 0);
  
  return totalCapability / gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired').length;
}

function getTotalResearchInvestment(gameState: GameState): number {
  const gov = Object.values(gameState.government.researchInvestments)
    .reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      if (typeof val === 'object') {
        return sum + Object.values(val).reduce((s: number, v) => s + (v as number), 0);
      }
      return sum;
    }, 0);
  
  // Add private research
  const privateResearch = gameState.organizations
    .filter(org => org.type === 'private')
    .reduce((sum, org) => sum + org.monthlyRevenue * 0.1, 0);
  
  return gov + privateResearch;
}

function getEnergyMultiplier(gameState: GameState): number {
  if (!gameState.powerGeneration) return 1.0;
  
  const { severity, growthPenalty } = gameState.powerGeneration.constraints;
  return Math.max(0, 1.0 - severity * growthPenalty);
}

function generateUnlockReason(tech: TechDefinition, gameState: GameState): string {
  const avgCapability = getAverageAICapability(gameState);
  const economicStage = gameState.globalMetrics?.economicTransitionStage || 0;
  
  return `Prerequisites met. AI capability: ${avgCapability.toFixed(2)}, Economic stage: ${economicStage.toFixed(1)}, Research: 100%`;
}

