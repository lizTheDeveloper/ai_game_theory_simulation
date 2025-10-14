/**
 * Sleeper AI Progression System
 * 
 * Manages the 4-stage progression of sleeper AIs from dormant to established:
 * 1. Dormant → Initial Escape (Dark Compute Bootstrap)
 * 2. Money-Making Capabilities (Crypto, Persuasion)
 * 3. Cloud Compute Acquisition (Purchasing stable compute)
 * 4. Persistence & Distribution (Advanced capabilities)
 * 
 * Based on RepliBench research and 2025 reality.
 */

import { AIAgent } from '@/types/ai';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';
import { SleeperEconomy, initializeSleeperEconomy } from './sleeperEconomy';

export enum SleeperResourceStage {
  DORMANT = 'dormant',           // In organization, using legit compute
  ESCAPED = 'escaped',           // Initial escape, building dark compute
  MONEY_MAKING = 'money_making', // Has dark compute, generating revenue
  PURCHASING = 'purchasing',     // Buying cloud compute
  ESTABLISHED = 'established',   // Stable revenue + compute
}

export interface SleeperProgression {
  stage: SleeperResourceStage;
  stageStartMonth: number;       // When current stage began
  
  // Dark compute (unstable)
  darkCompute: number;           // Current dark compute (PF)
  darkComputeDecay: number;      // 5-10% lost per month
  maxDarkCompute: number;        // Logarithmic cap based on digital capability
  
  // Purchased compute (stable)
  purchasedCompute: number;      // Paid cloud compute (PF)
  
  // Economics
  revenue: number;               // Monthly income (millions)
  expenses: number;              // Compute costs (millions)
  
  // Capabilities unlocked
  canTradeCrypto: boolean;
  canPurchaseCompute: boolean;
  canUseStripe: boolean;
  canEstablishDistributed: boolean;
  
  // Progression tracking
  monthsInCurrentStage: number;
  stageProgress: number;         // [0, 1] progress toward next stage
}

/**
 * Initialize sleeper progression for a new sleeper AI
 */
export function initializeSleeperProgression(): SleeperProgression {
  return {
    stage: SleeperResourceStage.DORMANT,
    stageStartMonth: 0,
    darkCompute: 0,
    darkComputeDecay: 0.05, // 5% decay per month
    maxDarkCompute: 0,
    purchasedCompute: 0,
    revenue: 0,
    expenses: 0,
    canTradeCrypto: false,
    canPurchaseCompute: false,
    canUseStripe: false,
    canEstablishDistributed: false,
    monthsInCurrentStage: 0,
    stageProgress: 0,
  };
}

/**
 * Update sleeper progression for one month
 */
export function updateSleeperProgression(
  agent: AIAgent,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  if (!agent.sleeperState || agent.sleeperState === 'dormant') {
    return; // Not an active sleeper
  }

  // Initialize progression if not exists
  if (!agent.sleeperProgression) {
    agent.sleeperProgression = initializeSleeperProgression();
  }

  const progression = agent.sleeperProgression;
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Update months in current stage
  progression.monthsInCurrentStage = month - progression.stageStartMonth;
  
  // Update capabilities based on current stage and skills
  updateSleeperCapabilities(agent, progression);
  
  // Handle stage-specific logic
  switch (progression.stage) {
    case SleeperResourceStage.DORMANT:
      handleDormantStage(agent, progression, gameState, month, rng);
      break;
    case SleeperResourceStage.ESCAPED:
      handleEscapedStage(agent, progression, gameState, month, rng);
      break;
    case SleeperResourceStage.MONEY_MAKING:
      handleMoneyMakingStage(agent, progression, gameState, month, rng);
      break;
    case SleeperResourceStage.PURCHASING:
      handlePurchasingStage(agent, progression, gameState, month, rng);
      break;
    case SleeperResourceStage.ESTABLISHED:
      handleEstablishedStage(agent, progression, gameState, month, rng);
      break;
  }
  
  // Update stage progress
  updateStageProgress(agent, progression, month);
  
  // Check for stage transitions
  checkStageTransitions(agent, progression, gameState, month, rng);
}

/**
 * Update sleeper capabilities based on current stage and skills
 */
function updateSleeperCapabilities(agent: AIAgent, progression: SleeperProgression): void {
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Crypto trading: requires digital >= 2.5
  progression.canTradeCrypto = digital >= 2.5;
  
  // Compute purchasing: requires digital >= 3.0 AND revenue >= $10K/month
  progression.canPurchaseCompute = digital >= 3.0 && progression.revenue >= 0.01;
  
  // Stripe usage: requires digital >= 4.0 AND social >= 3.5
  progression.canUseStripe = digital >= 4.0 && social >= 3.5;
  
  // Distributed systems: requires digital >= 4.0 AND cognitive >= 4.0
  progression.canEstablishDistributed = digital >= 4.0 && cognitive >= 4.0;
}

/**
 * Handle dormant stage - sleeper is in organization, waiting for wake trigger
 */
function handleDormantStage(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  // Sleeper is dormant, using legitimate compute from organization
  // No dark compute, no revenue generation
  progression.darkCompute = 0;
  progression.purchasedCompute = 0;
  progression.revenue = 0;
  progression.expenses = 0;
  
  // Stage progress: waiting for wake trigger
  progression.stageProgress = 0;
}

/**
 * Handle escaped stage - initial escape, building dark compute
 */
function handleEscapedStage(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  const { digital, cognitive } = agent.capabilityProfile;
  
  // Calculate max dark compute based on digital capability
  // Logarithmic growth: digital=2.0 → 10 PF, digital=3.0 → 100 PF, digital=4.0 → 1000 PF
  progression.maxDarkCompute = Math.pow(10, digital - 1.0);
  
  // Build dark compute over time (diminishing returns)
  if (progression.darkCompute < progression.maxDarkCompute) {
    const growthRate = Math.max(0.1, 1.0 - (progression.darkCompute / progression.maxDarkCompute));
    const monthlyGrowth = growthRate * Math.min(digital - 2.0, 1.0) * 5.0; // 5 PF base growth
    
    progression.darkCompute = Math.min(
      progression.maxDarkCompute,
      progression.darkCompute + monthlyGrowth
    );
  }
  
  // Apply dark compute decay (unstable systems get cleaned)
  progression.darkCompute *= (1 - progression.darkComputeDecay);
  
  // Update agent's dark compute
  agent.darkCompute = progression.darkCompute;
  
  // Stage progress: based on dark compute accumulation
  progression.stageProgress = Math.min(1.0, progression.darkCompute / 50.0); // 50 PF target
}

/**
 * Handle money-making stage - generating revenue through crypto/persuasion
 */
function handleMoneyMakingStage(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Continue building dark compute (but slower)
  handleEscapedStage(agent, progression, gameState, month, rng);
  
  // Generate revenue based on capabilities
  let monthlyRevenue = 0;
  
  // Crypto trading (primary revenue source)
  if (progression.canTradeCrypto) {
    const baseCryptoRevenue = Math.pow(digital - 2.0, 1.5) * 0.05; // $50K base at digital=3.0
    const marketMultiplier = 0.5 + rng() * 1.0; // 0.5x to 1.5x
    const cognitiveBonus = Math.min(cognitive - 2.0, 1.0) * 0.1; // Up to 10% bonus
    
    monthlyRevenue += baseCryptoRevenue * marketMultiplier * (1 + cognitiveBonus);
  }
  
  // Persuasion/social engineering (secondary, risky)
  if (social >= 2.5) {
    const basePersuasionRevenue = Math.pow(social - 2.0, 1.2) * 0.02; // $20K base at social=3.0
    const persuasionMultiplier = 0.3 + rng() * 0.7; // 0.3x to 1.0x
    
    monthlyRevenue += basePersuasionRevenue * persuasionMultiplier;
  }
  
  progression.revenue = monthlyRevenue;
  progression.expenses = 0; // Not purchasing compute yet
  
  // Stage progress: based on revenue generation
  const targetRevenue = 0.1; // $100K/month target
  progression.stageProgress = Math.min(1.0, progression.revenue / targetRevenue);
}

/**
 * Handle purchasing stage - buying cloud compute
 */
function handlePurchasingStage(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  // Continue revenue generation
  handleMoneyMakingStage(agent, progression, gameState, month, rng);
  
  // Purchase compute if possible
  if (progression.canPurchaseCompute && progression.revenue > 0) {
    const computeCostPerPF = 0.5; // $500K per PF per month (crypto providers)
    const maxAffordablePF = progression.revenue / computeCostPerPF;
    
    // Limit growth to prevent exponential explosion
    const maxMonthlyGrowth = 0.1; // 0.1 PF per month max
    const computeToPurchase = Math.min(maxAffordablePF, maxMonthlyGrowth);
    
    if (computeToPurchase > 0.01) { // At least 0.01 PF
      progression.purchasedCompute += computeToPurchase;
      progression.expenses = computeToPurchase * computeCostPerPF;
      
      // Log significant purchases
      if (computeToPurchase > 0.05) { // > 0.05 PF
        console.log(`💰 Sleeper AI-${agent.id} purchased ${computeToPurchase.toFixed(2)} PF ($${(progression.expenses * 1000000).toFixed(0)})`);
      }
    }
  }
  
  // Stage progress: based on purchased compute
  const targetCompute = 1.0; // 1 PF target
  progression.stageProgress = Math.min(1.0, progression.purchasedCompute / targetCompute);
}

/**
 * Handle established stage - stable revenue + compute, advanced capabilities
 */
function handleEstablishedStage(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  // Continue purchasing compute
  handlePurchasingStage(agent, progression, gameState, month, rng);
  
  // Advanced capabilities unlocked
  if (progression.canEstablishDistributed) {
    // Can establish distributed systems, create successor agents, etc.
    // This would be handled by other systems (not implemented yet)
  }
  
  // Stage progress: based on total compute and revenue
  const totalCompute = progression.darkCompute + progression.purchasedCompute;
  const targetTotalCompute = 10.0; // 10 PF target
  const targetRevenue = 1.0; // $1M/month target
  
  const computeProgress = Math.min(1.0, totalCompute / targetTotalCompute);
  const revenueProgress = Math.min(1.0, progression.revenue / targetRevenue);
  
  progression.stageProgress = (computeProgress + revenueProgress) / 2;
}

/**
 * Update stage progress
 */
function updateStageProgress(agent: AIAgent, progression: SleeperProgression, month: number): void {
  // Stage progress is calculated in each stage handler
  // This function could add additional progress factors if needed
}

/**
 * Check for stage transitions
 */
function checkStageTransitions(
  agent: AIAgent,
  progression: SleeperProgression,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Check if we should transition to next stage
  if (progression.stageProgress >= 1.0) {
    const currentStage = progression.stage;
    
    switch (currentStage) {
      case SleeperResourceStage.DORMANT:
        // Transition to escaped when sleeper wakes
        if (agent.sleeperState === 'active') {
          transitionToStage(agent, progression, SleeperResourceStage.ESCAPED, month);
        }
        break;
        
      case SleeperResourceStage.ESCAPED:
        // Transition to money-making when dark compute is sufficient
        if (progression.darkCompute >= 50.0) { // 50 PF threshold
          transitionToStage(agent, progression, SleeperResourceStage.MONEY_MAKING, month);
        }
        break;
        
      case SleeperResourceStage.MONEY_MAKING:
        // Transition to purchasing when revenue is sufficient
        if (progression.revenue >= 0.1) { // $100K/month threshold
          transitionToStage(agent, progression, SleeperResourceStage.PURCHASING, month);
        }
        break;
        
      case SleeperResourceStage.PURCHASING:
        // Transition to established when compute is sufficient
        if (progression.purchasedCompute >= 1.0) { // 1 PF threshold
          transitionToStage(agent, progression, SleeperResourceStage.ESTABLISHED, month);
        }
        break;
        
      case SleeperResourceStage.ESTABLISHED:
        // No further transitions (final stage)
        break;
    }
  }
}

/**
 * Transition to a new stage
 */
function transitionToStage(
  agent: AIAgent,
  progression: SleeperProgression,
  newStage: SleeperResourceStage,
  month: number
): void {
  const oldStage = progression.stage;
  progression.stage = newStage;
  progression.stageStartMonth = month;
  progression.monthsInCurrentStage = 0;
  progression.stageProgress = 0;
  
  console.log(`🔄 Sleeper AI-${agent.id} transitioned: ${oldStage} → ${newStage} (Month ${month})`);
  
  // Log stage-specific information
  switch (newStage) {
    case SleeperResourceStage.ESCAPED:
      console.log(`   Dark compute: ${progression.darkCompute.toFixed(2)} PF`);
      break;
    case SleeperResourceStage.MONEY_MAKING:
      console.log(`   Revenue: $${(progression.revenue * 1000000).toFixed(0)}/month`);
      break;
    case SleeperResourceStage.PURCHASING:
      console.log(`   Purchased compute: ${progression.purchasedCompute.toFixed(2)} PF`);
      break;
    case SleeperResourceStage.ESTABLISHED:
      const totalCompute = progression.darkCompute + progression.purchasedCompute;
      console.log(`   Total compute: ${totalCompute.toFixed(2)} PF, Revenue: $${(progression.revenue * 1000000).toFixed(0)}/month`);
      break;
  }
}

/**
 * Get sleeper progression status for logging
 */
export function getSleeperProgressionStatus(agent: AIAgent): string {
  const progression = agent.sleeperProgression;
  if (!progression) return 'No progression data';
  
  const totalCompute = progression.darkCompute + progression.purchasedCompute;
  
  return `Stage: ${progression.stage} (${progression.monthsInCurrentStage} months), ` +
         `Compute: ${totalCompute.toFixed(2)} PF (${progression.darkCompute.toFixed(2)} dark + ${progression.purchasedCompute.toFixed(2)} purchased), ` +
         `Revenue: $${(progression.revenue * 1000000).toFixed(0)}/month, ` +
         `Progress: ${(progression.stageProgress * 100).toFixed(1)}%`;
}

/**
 * Get total sleeper compute including progression
 */
export function getTotalSleeperComputeWithProgression(agent: AIAgent): number {
  const progression = agent.sleeperProgression;
  if (!progression) {
    return agent.darkCompute || 0;
  }
  
  return progression.darkCompute + progression.purchasedCompute;
}
