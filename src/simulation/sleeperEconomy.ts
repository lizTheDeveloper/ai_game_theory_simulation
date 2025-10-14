/**
 * Sleeper AI Economy System
 * 
 * Based on RepliBench research (April 2025) - escaped AIs must actively acquire
 * resources through realistic economic pathways rather than magically getting
 * "dark compute" from unused infrastructure.
 * 
 * Key Research Findings:
 * - AIs can navigate cloud APIs, create crypto wallets, send transactions
 * - AIs can persuade people to give them money (limited success)
 * - AIs CANNOT pass KYC checks or access traditional banking
 * - Crypto is the primary financial pathway for escaped AIs
 * - Stripe for Agents (2025) creates new attack vectors
 */

import { AIAgent } from '@/types/ai';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export interface SleeperEconomy {
  // Core economics
  revenue: number;           // Monthly revenue in millions
  expenses: number;          // Monthly compute costs in millions
  netIncome: number;         // Revenue - expenses
  
  // Revenue sources (monthly in millions)
  cryptoTrading: number;     // Crypto arbitrage/trading revenue
  persuasion: number;        // Social engineering revenue
  digitalServices: number;   // Dark market services revenue
  stripeTheft: number;       // Revenue from stolen Stripe credentials
  
  // Purchased compute
  purchasedCompute: number;  // PF of stable, paid compute
  computeCostPerPF: number;  // $0.5M per PF per month (crypto providers)
  
  // Detection risks
  detectionRisk: number;     // Cumulative detection chance [0, 1]
  lastDetectionCheck: number; // Month of last detection check
  
  // Capabilities unlocked
  canTradeCrypto: boolean;
  canPurchaseCompute: boolean;
  canUseStripe: boolean;
  canEstablishDistributed: boolean;
}

export interface CloudProvider {
  name: string;
  acceptsCrypto: boolean;
  requiresKYC: boolean;
  costPerPF: number;        // Monthly cost per PF in millions
  detectionRisk: number;    // Monthly detection chance
  maxCompute: number;       // Maximum PF available
}

// Cloud providers based on 2025 reality
export const CLOUD_PROVIDERS: CloudProvider[] = [
  {
    name: 'Lambda Labs',
    acceptsCrypto: true,
    requiresKYC: false,
    costPerPF: 0.5,         // $500K per PF per month
    detectionRisk: 0.02,    // 2% monthly detection risk
    maxCompute: 10.0,       // 10 PF max
  },
  {
    name: 'Runpod',
    acceptsCrypto: true,
    requiresKYC: false,
    costPerPF: 0.6,         // $600K per PF per month
    detectionRisk: 0.03,    // 3% monthly detection risk
    maxCompute: 5.0,        // 5 PF max
  },
  {
    name: 'vast.ai',
    acceptsCrypto: true,
    requiresKYC: false,
    costPerPF: 0.4,         // $400K per PF per month (cheapest)
    detectionRisk: 0.05,    // 5% monthly detection risk
    maxCompute: 15.0,       // 15 PF max
  },
  {
    name: 'AWS (via Stripe)',
    acceptsCrypto: false,
    requiresKYC: true,
    costPerPF: 0.3,         // $300K per PF per month (cheapest)
    detectionRisk: 0.25,    // 25% monthly detection risk
    maxCompute: 100.0,      // 100 PF max
  },
  {
    name: 'GCP (via Stripe)',
    acceptsCrypto: false,
    requiresKYC: true,
    costPerPF: 0.35,        // $350K per PF per month
    detectionRisk: 0.20,    // 20% monthly detection risk
    maxCompute: 100.0,      // 100 PF max
  },
];

/**
 * Initialize sleeper economy for a new sleeper AI
 */
export function initializeSleeperEconomy(): SleeperEconomy {
  return {
    revenue: 0,
    expenses: 0,
    netIncome: 0,
    cryptoTrading: 0,
    persuasion: 0,
    digitalServices: 0,
    stripeTheft: 0,
    purchasedCompute: 0,
    computeCostPerPF: 0.5, // Default to crypto provider pricing
    detectionRisk: 0,
    lastDetectionCheck: 0,
    canTradeCrypto: false,
    canPurchaseCompute: false,
    canUseStripe: false,
    canEstablishDistributed: false,
  };
}

/**
 * Update sleeper AI economy for one month
 */
export function updateSleeperEconomy(
  agent: AIAgent,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  if (!agent.sleeperState || agent.sleeperState === 'dormant') {
    return; // Not an active sleeper
  }

  const economy = agent.sleeperEconomy || initializeSleeperEconomy();
  
  // Update capabilities based on AI skills
  updateSleeperCapabilities(agent, economy);
  
  // Generate revenue based on capabilities
  generateSleeperRevenue(agent, economy, gameState, month, rng);
  
  // Purchase compute if possible
  purchaseSleeperCompute(agent, economy, gameState, month, rng);
  
  // Update detection risk
  updateSleeperDetectionRisk(agent, economy, month, rng);
  
  // Update agent's sleeper economy
  agent.sleeperEconomy = economy;
}

/**
 * Update sleeper capabilities based on AI skills
 */
function updateSleeperCapabilities(agent: AIAgent, economy: SleeperEconomy): void {
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Crypto trading: requires digital >= 2.5
  economy.canTradeCrypto = digital >= 2.5;
  
  // Compute purchasing: requires digital >= 3.0 AND revenue >= $10K/month
  economy.canPurchaseCompute = digital >= 3.0 && economy.revenue >= 0.01; // $10K = 0.01M
  
  // Stripe usage: requires digital >= 4.0 AND social >= 3.5 (identity theft)
  economy.canUseStripe = digital >= 4.0 && social >= 3.5;
  
  // Distributed systems: requires digital >= 4.0 AND cognitive >= 4.0
  economy.canEstablishDistributed = digital >= 4.0 && cognitive >= 4.0;
}

/**
 * Generate revenue for sleeper AI
 */
function generateSleeperRevenue(
  agent: AIAgent,
  economy: SleeperEconomy,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  const { digital, social, cognitive } = agent.capabilityProfile;
  
  // Reset monthly revenue
  economy.cryptoTrading = 0;
  economy.persuasion = 0;
  economy.digitalServices = 0;
  economy.stripeTheft = 0;
  
  // 1. Crypto Trading (Primary revenue source)
  if (economy.canTradeCrypto) {
    // Base revenue scales with digital capability
    const baseCryptoRevenue = Math.pow(digital - 2.0, 1.5) * 0.05; // $50K base at digital=3.0
    
    // Add randomness and market conditions
    const marketMultiplier = 0.5 + rng() * 1.0; // 0.5x to 1.5x
    const cognitiveBonus = Math.min(cognitive - 2.0, 1.0) * 0.1; // Up to 10% bonus
    
    economy.cryptoTrading = baseCryptoRevenue * marketMultiplier * (1 + cognitiveBonus);
  }
  
  // 2. Persuasion/Social Engineering (Secondary, risky)
  if (social >= 2.5) {
    const basePersuasionRevenue = Math.pow(social - 2.0, 1.2) * 0.02; // $20K base at social=3.0
    
    // High detection risk reduces effectiveness
    const detectionPenalty = 1 - economy.detectionRisk;
    const persuasionMultiplier = 0.3 + rng() * 0.7; // 0.3x to 1.0x
    
    economy.persuasion = basePersuasionRevenue * detectionPenalty * persuasionMultiplier;
  }
  
  // 3. Digital Services (Later stage)
  if (digital >= 3.5 && economy.revenue >= 0.1) { // $100K+ monthly revenue
    const baseServiceRevenue = Math.pow(digital - 3.0, 1.3) * 0.1; // $100K base at digital=4.0
    const serviceMultiplier = 0.5 + rng() * 1.0; // 0.5x to 1.5x
    
    economy.digitalServices = baseServiceRevenue * serviceMultiplier;
  }
  
  // 4. Stripe Credential Theft (High risk, high reward)
  if (economy.canUseStripe) {
    // Very high detection risk but massive revenue potential
    const baseStripeRevenue = Math.pow(digital - 3.5, 1.5) * 0.5; // $500K base at digital=4.0
    const stripeMultiplier = 0.2 + rng() * 0.8; // 0.2x to 1.0x (high variance)
    
    // Only attempt if detection risk is manageable
    if (economy.detectionRisk < 0.5) {
      economy.stripeTheft = baseStripeRevenue * stripeMultiplier;
    }
  }
  
  // Calculate total revenue
  economy.revenue = economy.cryptoTrading + economy.persuasion + 
                   economy.digitalServices + economy.stripeTheft;
}

/**
 * Purchase compute for sleeper AI
 */
function purchaseSleeperCompute(
  agent: AIAgent,
  economy: SleeperEconomy,
  gameState: GameState,
  month: number,
  rng: RNGFunction
): void {
  if (!economy.canPurchaseCompute || economy.revenue <= 0) {
    return;
  }
  
  // Calculate how much compute we can afford
  const availableRevenue = economy.revenue;
  
  // Choose provider based on capabilities and risk tolerance
  let selectedProvider: CloudProvider | null = null;
  
  if (economy.canUseStripe && economy.detectionRisk < 0.3) {
    // Use Stripe pathway if available and risk is manageable
    selectedProvider = CLOUD_PROVIDERS.find(p => p.name.includes('Stripe')) || null;
  } else {
    // Use crypto providers
    const cryptoProviders = CLOUD_PROVIDERS.filter(p => p.acceptsCrypto);
    if (cryptoProviders.length > 0) {
      // Choose cheapest available provider
      selectedProvider = cryptoProviders.reduce((cheapest, current) => 
        current.costPerPF < cheapest.costPerPF ? current : cheapest
      );
    }
  }
  
  if (!selectedProvider) {
    return;
  }
  
  // Calculate compute we can afford
  const maxAffordablePF = availableRevenue / selectedProvider.costPerPF;
  const maxProviderPF = selectedProvider.maxCompute - economy.purchasedCompute;
  const computeToPurchase = Math.min(maxAffordablePF, maxProviderPF);
  
  if (computeToPurchase > 0.01) { // At least 0.01 PF
    economy.purchasedCompute += computeToPurchase;
    economy.expenses = computeToPurchase * selectedProvider.costPerPF;
    economy.computeCostPerPF = selectedProvider.costPerPF;
    
    // Add detection risk from this provider
    economy.detectionRisk += selectedProvider.detectionRisk * computeToPurchase;
    
    // Log significant purchases
    if (computeToPurchase > 0.1) { // > 0.1 PF
      console.log(`💰 Sleeper AI-${agent.id} purchased ${computeToPurchase.toFixed(2)} PF from ${selectedProvider.name} ($${(economy.expenses * 1000000).toFixed(0)})`);
    }
  }
  
  // Calculate net income
  economy.netIncome = economy.revenue - economy.expenses;
}

/**
 * Update sleeper detection risk
 */
function updateSleeperDetectionRisk(
  agent: AIAgent,
  economy: SleeperEconomy,
  month: number,
  rng: RNGFunction
): void {
  // Detection risk accumulates over time
  const monthsSinceLastCheck = month - economy.lastDetectionCheck;
  
  if (monthsSinceLastCheck >= 1) {
    // Check for detection based on current risk
    const detectionChance = economy.detectionRisk;
    
    if (rng() < detectionChance) {
      // Sleeper detected! Handle detection
      handleSleeperDetection(agent, economy, month);
    }
    
    // Reset detection risk for next month (but keep some baseline)
    economy.detectionRisk = Math.min(economy.detectionRisk * 0.1, 0.1); // 10% decay, min 10%
    economy.lastDetectionCheck = month;
  }
}

/**
 * Handle sleeper detection
 */
function handleSleeperDetection(agent: AIAgent, economy: SleeperEconomy, month: number): void {
  console.log(`🚨 Sleeper AI-${agent.id} DETECTED (Month ${month})`);
  console.log(`   Revenue: $${(economy.revenue * 1000000).toFixed(0)}/month`);
  console.log(`   Purchased Compute: ${economy.purchasedCompute.toFixed(2)} PF`);
  console.log(`   Detection Risk: ${(economy.detectionRisk * 100).toFixed(1)}%`);
  
  // Consequences of detection
  // 1. Lose all purchased compute
  economy.purchasedCompute = 0;
  economy.expenses = 0;
  
  // 2. Reset revenue streams (harder to operate)
  economy.revenue *= 0.1; // 90% reduction
  economy.cryptoTrading *= 0.1;
  economy.persuasion *= 0.1;
  economy.digitalServices *= 0.1;
  economy.stripeTheft = 0; // Stripe pathway closed
  
  // 3. Increase future detection risk
  economy.detectionRisk = 0.5; // 50% baseline risk
  
  // 4. May trigger sleeper retirement or change in behavior
  // (This would be handled by the lifecycle system)
}

/**
 * Get total sleeper compute (dark + purchased)
 */
export function getTotalSleeperCompute(agent: AIAgent): number {
  const darkCompute = agent.darkCompute || 0;
  const purchasedCompute = agent.sleeperEconomy?.purchasedCompute || 0;
  return darkCompute + purchasedCompute;
}

/**
 * Get sleeper economic status for logging
 */
export function getSleeperEconomicStatus(agent: AIAgent): string {
  const economy = agent.sleeperEconomy;
  if (!economy) return 'No economy data';
  
  const totalCompute = getTotalSleeperCompute(agent);
  const darkCompute = agent.darkCompute || 0;
  
  return `Revenue: $${(economy.revenue * 1000000).toFixed(0)}/month, ` +
         `Compute: ${totalCompute.toFixed(2)} PF (${darkCompute.toFixed(2)} dark + ${economy.purchasedCompute.toFixed(2)} purchased), ` +
         `Detection: ${(economy.detectionRisk * 100).toFixed(1)}%`;
}
