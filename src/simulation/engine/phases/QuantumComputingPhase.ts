/**
 * Quantum Computing Phase (L-3, Dec 10, 2025)
 *
 * Tracks quantum computing capability progression from NISQ → fault-tolerant quantum computing.
 * Determines when cryptographically-relevant quantum computer (CRQC) is achieved.
 *
 * Key Dynamics:
 * - Logical qubit scaling: Investment-driven + stochastic breakthroughs
 * - Error rate improvement: Technology maturation
 * - Algorithm threshold detection: Shor's, Grover's, quantum ML
 * - Breakthrough probability: Time-varying Gaussian (peak ~2029)
 *
 * Research: research/quantum_computing_cascades_20251210.md
 * Expected impact: Enables cryptographic crisis detection, quantum-AI enhancements
 */

import type { GameState, GameEvent } from '../../../types/game';
import type { PhaseResult } from '../PhaseOrchestrator';
import { assertFinite } from '../../utils/assertions';

/**
 * Quantum Computing Capability Phase
 *
 * Updates quantum computing state based on investment and stochastic breakthroughs.
 *
 * @param state - Current game state
 * @param rng - Random number generator for deterministic stochastic events
 * @returns Phase result with updated quantum state
 */
export function QuantumComputingPhase(
  state: GameState,
  rng: () => number
): PhaseResult {
  // Skip if quantum system not initialized
  if (!state.quantumSystem) {
    return {
      events: [],
    };
  }

  const quantum = state.quantumSystem.quantumComputing;
  const { currentMonth, currentYear } = state;

  // Calculate years since 2025 (quantum baseline)
  const yearsSince2025 = currentYear + currentMonth / 12 - 2025;

  // --- Breakthrough Probability Calculation ---
  // Time-varying Gaussian centered on 2029 (4 years from 2025)
  // Research: Realistic timeline 2028-2030, industry consensus
  const peakYear = 4.0; // 2029
  const sigma = 2.5; // Spread (±2.5 years = 90% confidence interval ~2024-2034)
  const peakProbability = 0.02; // 2% monthly at peak (~20% annual)

  // Gaussian formula: P(t) = peak * exp(-0.5 * ((t - peak) / sigma)^2)
  const timeDelta = yearsSince2025 - peakYear;
  const gaussianFactor = Math.exp(-0.5 * Math.pow(timeDelta / sigma, 2));
  const baseBreakthroughProbability = peakProbability * gaussianFactor;

  // Investment multiplier: Higher investment accelerates progress
  // investmentLevel: 0.5 baseline, 1.0 = 2x investment
  // Multiplier: 0.5x at low investment (0.25), 1.5x at high investment (1.0)
  const investmentMultiplier = 0.5 + quantum.investmentLevel;

  // Final breakthrough probability
  const breakthroughProbability = baseBreakthroughProbability * investmentMultiplier;

  assertFinite(breakthroughProbability, {
    location: 'QuantumComputingPhase',
    valueName: 'breakthroughProbability',
    month: currentMonth,
    additionalInfo: { yearsSince2025, investmentLevel: quantum.investmentLevel },
  });

  // --- Check for Breakthrough ---
  let logicalQubitsDelta = 0;
  let breakthroughOccurred = false;

  if (rng() < breakthroughProbability) {
    // Breakthrough! Quantum capability jumps
    // Jump size: 20-50% increase (log-normal distribution)
    const jumpSizeFactor = 1.0 + 0.2 + rng() * 0.3; // 1.2x - 1.5x
    const newLogicalQubits = Math.floor(quantum.logicalQubits * jumpSizeFactor);
    logicalQubitsDelta = newLogicalQubits - quantum.logicalQubits;
    breakthroughOccurred = true;

    console.log(`\n🔬💡 QUANTUM BREAKTHROUGH (Month ${currentMonth}):`);
    console.log(`  Logical qubits: ${quantum.logicalQubits} → ${newLogicalQubits} (+${logicalQubitsDelta})`);
    console.log(`  Jump factor: ${jumpSizeFactor.toFixed(2)}x`);
  }

  // --- Incremental Progress ---
  // Even without breakthrough, gradual progress occurs
  // Doubling time: ~24 months at baseline investment (research: 18-24 months historical)
  // Monthly growth: 2.9% ((1.0)^(1/24) ≈ 1.029)
  const baseGrowthRate = 0.029;
  const investmentAdjustedGrowth = baseGrowthRate * (0.5 + quantum.investmentLevel);

  if (!breakthroughOccurred) {
    // Incremental progress
    const incrementalGrowth = quantum.logicalQubits * investmentAdjustedGrowth;
    logicalQubitsDelta = Math.max(1, Math.floor(incrementalGrowth)); // At least 1 qubit/month if nonzero
  }

  const newLogicalQubits = quantum.logicalQubits + logicalQubitsDelta;

  // --- Error Rate Improvement ---
  // Error rates improve with qubit scaling (research shows correlation)
  // Target: 0.000015% (best 2025) as asymptotic limit
  const targetErrorRate = 0.000015;
  const errorRateDecayFactor = 0.98; // 2% monthly improvement
  const newErrorRate = Math.max(
    targetErrorRate,
    quantum.errorRate * errorRateDecayFactor
  );

  // --- Algorithm Support Thresholds ---
  // Research thresholds from quantum_computing_cascades_20251210.md
  const algorithmSupport = {
    shors: newLogicalQubits >= 1730, // Shor's factoring (RSA-2048 breaking)
    grovers: newLogicalQubits >= 100, // Grover's search (symmetric crypto speedup)
    quantumML: newLogicalQubits >= 500, // Quantum machine learning
    quantumChemistry: newLogicalQubits >= 1000, // Quantum chemistry simulation
  };

  // --- CRQC Achievement Detection ---
  let crqcAchieved = quantum.crqcAchieved;
  let crqcAchievedMonth = quantum.crqcAchievedMonth;

  if (!quantum.crqcAchieved && algorithmSupport.shors) {
    // Cryptographically Relevant Quantum Computer achieved!
    crqcAchieved = true;
    crqcAchievedMonth = currentMonth;

    console.log(`\n🔬🚨 CRQC ACHIEVED (Month ${currentMonth}):`);
    console.log(`  Logical qubits: ${newLogicalQubits} (threshold: 1,730)`);
    console.log(`  Shor's algorithm practical: RSA-2048 vulnerable`);
    console.log(`  ⚠️ Cryptographic crisis imminent`);
  }

  // --- Update State ---
  state.quantumSystem.quantumComputing = {
    logicalQubits: newLogicalQubits,
    errorRate: newErrorRate,
    algorithmSupport,
    investmentLevel: quantum.investmentLevel, // Updated externally by policy decisions
    breakthroughProbability,
    crqcAchieved,
    crqcAchievedMonth,
    previousLogicalQubits: quantum.logicalQubits,
  };

  // --- Events ---
  const events: GameEvent[] = [];

  if (breakthroughOccurred) {
    events.push({
      id: `quantum-breakthrough-${currentMonth}`,
      type: 'quantum-breakthrough' as any,
      month: currentMonth,
      description: `🔬💡 Quantum breakthrough: ${quantum.logicalQubits} → ${newLogicalQubits} logical qubits`,
      impact: 'major',
    });
  }

  if (!quantum.crqcAchieved && crqcAchieved) {
    events.push({
      id: `crqc-achieved-${currentMonth}`,
      type: 'crqc-achieved' as any,
      month: currentMonth,
      description: `🔬🚨 Cryptographically Relevant Quantum Computer (CRQC) achieved! RSA/ECC vulnerable.`,
      impact: 'critical',
    });
  }

  return {
    events,
  };
}
