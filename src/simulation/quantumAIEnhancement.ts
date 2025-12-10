/**
 * Quantum-AI Enhancement Integration (L-3, Dec 10, 2025)
 *
 * Applies quantum computing capability multipliers to AI capabilities.
 * Heterogeneous effects based on quantum-amenability of different AI domains.
 *
 * Key Principles:
 * - Not all AI benefits equally from quantum computing
 * - Physical/chemistry: High quantum advantage (+10-100x molecular simulation)
 * - Research/optimization: Medium-high advantage (+5-20x algorithms)
 * - Digital: Medium advantage (+2-5x optimization, limited crypto)
 * - Cognitive/language: Low advantage (+1-3x, minimal quantum benefit)
 *
 * Research: research/quantum_computing_cascades_20251210.md
 * Validation: IonQ 20x speedup (drug discovery), hybrid quantum-classical workflows
 */

import type { GameState } from '../types/game';
import { assertFinite } from './utils/assertions';

/**
 * Calculate Quantum-AI Capability Multipliers
 *
 * Determines capability enhancement factors based on quantum computing progress.
 * Multipliers activate once quantum advantage is demonstrated (100+ logical qubits for Grover's).
 *
 * @param state - Current game state
 * @returns Updated quantum-AI integration state with capability multipliers
 */
export function calculateQuantumAIMultipliers(state: GameState): void {
  if (!state.quantumSystem) {
    return; // Quantum system not initialized
  }

  const quantum = state.quantumSystem.quantumComputing;
  const quantumAI = state.quantumSystem.quantumAI;

  // --- Activation Threshold ---
  // Quantum-AI advantage requires practical quantum algorithms
  // Minimum: Grover's algorithm (100+ logical qubits)
  // Optimal: Quantum chemistry (1,000+ logical qubits)
  const active = quantum.algorithmSupport.grovers;

  if (!active) {
    // No quantum advantage yet
    quantumAI.active = false;
    quantumAI.capabilityMultipliers = {
      physical: 1.0,
      research: 1.0,
      digital: 1.0,
      cognitive: 1.0,
    };
    return;
  }

  // --- Calculate Capability Multipliers ---
  // Scaling based on logical qubit count and algorithm support

  // Physical dimension (molecular simulation, materials science):
  // - Requires quantum chemistry algorithms (1,000+ qubits)
  // - Scales from 1x (no advantage) to 100x (10,000+ qubits, general advantage)
  // - Research evidence: IonQ 20x speedup in drug discovery (2024)
  let physicalMultiplier = 1.0;

  if (quantum.algorithmSupport.quantumChemistry) {
    // Logarithmic scaling: 1,000 qubits → 10x, 10,000 qubits → 100x
    const qubitFactor = Math.log10(quantum.logicalQubits / 1000.0);
    physicalMultiplier = 10.0 * Math.pow(10, qubitFactor); // 10^(1 + log10(qubits/1000))
    physicalMultiplier = Math.min(100.0, physicalMultiplier); // Cap at 100x
  } else if (quantum.algorithmSupport.grovers) {
    // Minimal advantage without quantum chemistry algorithms
    physicalMultiplier = 1.5; // 50% improvement from general optimization
  }

  // Research dimension (quantum algorithms, optimization):
  // - Requires Grover's (100+ qubits) or quantum ML (500+ qubits)
  // - Scales from 1x to 20x
  let researchMultiplier = 1.0;

  if (quantum.algorithmSupport.quantumML) {
    // Quantum ML provides optimization speedups
    const qubitFactor = Math.log10(quantum.logicalQubits / 500.0);
    researchMultiplier = 5.0 * Math.pow(4, qubitFactor); // 5 * 4^log10(qubits/500)
    researchMultiplier = Math.min(20.0, researchMultiplier); // Cap at 20x
  } else if (quantum.algorithmSupport.grovers) {
    // Grover's provides 2x speedup for search problems
    researchMultiplier = 2.0;
  }

  // Digital dimension (optimization, limited cryptanalysis):
  // - Requires Grover's (100+ qubits)
  // - Scales from 1x to 5x (limited quantum advantage for general digital tasks)
  let digitalMultiplier = 1.0;

  if (quantum.algorithmSupport.shors) {
    // Shor's algorithm provides cryptanalysis capability (but not general digital advantage)
    digitalMultiplier = 3.0; // 3x from optimization + cryptanalysis
  } else if (quantum.algorithmSupport.grovers) {
    // Grover's provides optimization speedups
    digitalMultiplier = 2.0; // 2x from search/optimization
  }

  // Cognitive dimension (language processing, reasoning):
  // - Minimal quantum advantage (no known quantum algorithms for general cognition)
  // - Scales from 1x to 3x (indirect benefits from better optimization)
  let cognitiveMultiplier = 1.0;

  if (quantum.algorithmSupport.quantumML) {
    // Quantum ML may provide marginal benefits to neural architecture search
    cognitiveMultiplier = 1.5; // 50% improvement (highly uncertain)
  } else if (quantum.algorithmSupport.grovers) {
    // Minimal benefit
    cognitiveMultiplier = 1.1; // 10% improvement from hyperparameter optimization
  }

  // --- Validation: Ensure multipliers are finite ---
  assertFinite(physicalMultiplier, {
    location: 'calculateQuantumAIMultipliers',
    valueName: 'physicalMultiplier',
    month: state.currentMonth,
    additionalInfo: { logicalQubits: quantum.logicalQubits },
  });

  assertFinite(researchMultiplier, {
    location: 'calculateQuantumAIMultipliers',
    valueName: 'researchMultiplier',
    month: state.currentMonth,
    additionalInfo: { logicalQubits: quantum.logicalQubits },
  });

  // --- Update State ---
  quantumAI.active = true;
  quantumAI.capabilityMultipliers = {
    physical: physicalMultiplier,
    research: researchMultiplier,
    digital: digitalMultiplier,
    cognitive: cognitiveMultiplier,
  };

  // --- Demonstrated Advantage Detection ---
  if (!quantumAI.demonstratedAdvantage && physicalMultiplier >= 10.0) {
    // First demonstration of quantum-AI advantage
    quantumAI.demonstratedAdvantage = true;
    quantumAI.advantageMonth = state.currentMonth;

    console.log(`\n🔬🤖 QUANTUM-AI ADVANTAGE DEMONSTRATED (Month ${state.currentMonth}):`);
    console.log(`  Physical capability multiplier: ${physicalMultiplier.toFixed(1)}x`);
    console.log(`  Research capability multiplier: ${researchMultiplier.toFixed(1)}x`);
    console.log(`  Logical qubits: ${quantum.logicalQubits}`);
    console.log(`  💡 AI research accelerated by quantum computing`);
  }
}

/**
 * Apply Quantum-AI Enhancements to AI Agent Capabilities
 *
 * Modifies AI agent capabilities based on quantum computing progress.
 * Called from AI capability calculation phases.
 *
 * @param baseCapability - Base AI capability value (before quantum enhancement)
 * @param dimension - AI capability dimension ('physical', 'research', 'digital', 'cognitive', etc.)
 * @param state - Current game state
 * @returns Enhanced capability value
 */
export function applyQuantumEnhancement(
  baseCapability: number,
  dimension: string,
  state: GameState
): number {
  if (!state.quantumSystem?.quantumAI.active) {
    return baseCapability; // No quantum enhancement yet
  }

  const multipliers = state.quantumSystem.quantumAI.capabilityMultipliers;

  // Map dimension to quantum multiplier
  let multiplier = 1.0;

  switch (dimension.toLowerCase()) {
    case 'physical':
    case 'physicalcapability':
      multiplier = multipliers.physical;
      break;

    case 'research':
    case 'researchcapability':
      multiplier = multipliers.research;
      break;

    case 'digital':
    case 'digitalcapability':
      multiplier = multipliers.digital;
      break;

    case 'cognitive':
    case 'cognitivecapability':
      multiplier = multipliers.cognitive;
      break;

    // Other dimensions: No quantum advantage
    case 'social':
    case 'economic':
    case 'cultural':
    default:
      multiplier = 1.0;
      break;
  }

  const enhancedCapability = baseCapability * multiplier;

  assertFinite(enhancedCapability, {
    location: 'applyQuantumEnhancement',
    valueName: 'enhancedCapability',
    month: state.currentMonth,
    additionalInfo: { baseCapability, dimension, multiplier },
  });

  return enhancedCapability;
}
