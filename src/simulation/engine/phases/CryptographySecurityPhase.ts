/**
 * Cryptography Security Phase (L-3, Dec 10, 2025)
 *
 * Monitors cryptographic vulnerability from quantum computing advances.
 * Triggers cryptographic crisis when RSA/ECC is broken.
 * Propagates cascades through banking, commerce, identity, communications.
 *
 * Key Dynamics:
 * - Status tracking: secure → vulnerable → broken
 * - Detection window: <48 hours once threshold reached
 * - Cascade propagation: Banking → commerce → identity → communications
 * - Economic damage accumulation: $500B-$1.5T total impact
 * - Social trust erosion: -50% to -80% in digital systems
 *
 * Research: research/quantum_computing_cascades_20251210.md
 * Expected impact: Economic shocks, market confidence loss, trust degradation
 */

import type { GameState } from '../../../types/game';
import type { PhaseResult } from '../PhaseOrchestrator';
import type { CryptoStatus } from '../../../types/quantum-computing';
import { assertFinite } from '../../utils/assertions';

/**
 * Cryptography Security Assessment Phase
 *
 * Monitors cryptographic security and triggers crisis if quantum threshold reached.
 *
 * @param state - Current game state
 * @param rng - Random number generator (used for cascade severity variance)
 * @returns Phase result with updated cryptography security state
 */
export function CryptographySecurityPhase(
  state: GameState,
  rng: () => number
): PhaseResult {
  // Skip if quantum system not initialized
  if (!state.quantumSystem) {
    return {
      stateChanges: {},
      events: [],
      errors: [],
    };
  }

  const quantum = state.quantumSystem.quantumComputing;
  const crypto = state.quantumSystem.cryptographySecurity;
  const { currentMonth } = state;

  // --- Determine Cryptographic Status ---
  let rsaStatus: CryptoStatus = 'secure';
  let eccStatus: CryptoStatus = 'secure';
  let aesStatus: CryptoStatus = 'secure';

  // RSA-2048: Breaks at 1,730-4,099 logical qubits (Shor's algorithm)
  if (quantum.logicalQubits >= 1730) {
    rsaStatus = 'broken';
  } else if (quantum.logicalQubits >= 1000) {
    rsaStatus = 'vulnerable'; // Warning zone
  }

  // ECC-256: Breaks at ~2,000 logical qubits
  if (quantum.logicalQubits >= 2000) {
    eccStatus = 'broken';
  } else if (quantum.logicalQubits >= 1200) {
    eccStatus = 'vulnerable';
  }

  // AES-256: Grover's algorithm provides 2x speedup (effectively AES-128)
  // Not considered "broken" but weakened
  if (quantum.logicalQubits >= 3000) {
    aesStatus = 'vulnerable'; // Weakened but not broken
  }

  // --- Crisis Detection ---
  let crisisActive = crypto.crisisActive;
  let crisisStartMonth = crypto.crisisStartMonth;
  let detectionWindow = crypto.detectionWindow;
  let newCrisisTriggered = false;

  if (!crypto.crisisActive && (rsaStatus === 'broken' || eccStatus === 'broken')) {
    // Cryptographic crisis begins!
    crisisActive = true;
    crisisStartMonth = currentMonth;
    detectionWindow = 1; // <48 hours = 0.0625 months, round up to 1 month for simulation
    newCrisisTriggered = true;

    console.log(`\n☢️🔐 CRYPTOGRAPHIC CRISIS TRIGGERED (Month ${currentMonth}):`);
    console.log(`  RSA-2048 status: ${rsaStatus}`);
    console.log(`  ECC-256 status: ${eccStatus}`);
    console.log(`  Logical qubits: ${quantum.logicalQubits}`);
    console.log(`  ⚠️ Detection-to-breaking window: ${detectionWindow} month(s)`);
    console.log(`  🚨 Banking, commerce, identity systems compromised`);
  }

  // --- Cascade Propagation ---
  let cascadePropagation = { ...crypto.cascadePropagation };

  if (crisisActive) {
    // Exponential cascade propagation: 10%/month research estimate
    // Different systems propagate at different rates based on exposure
    const baseRatePropagation = 0.10; // 10% per month

    // System-specific multipliers (prevalence of RSA/ECC):
    // Banking: 95% (highest exposure), Commerce: 90%, Identity: 85%, Communications: 90%
    const bankingRate = baseRatePropagation * 0.95;
    const commerceRate = baseRatePropagation * 0.90;
    const identityRate = baseRatePropagation * 0.85;
    const communicationsRate = baseRatePropagation * 0.90;

    // Apply propagation (additive, capped at 1.0)
    cascadePropagation = {
      banking: Math.min(1.0, crypto.cascadePropagation.banking + bankingRate),
      commerce: Math.min(1.0, crypto.cascadePropagation.commerce + commerceRate),
      identity: Math.min(1.0, crypto.cascadePropagation.identity + identityRate),
      communications: Math.min(1.0, crypto.cascadePropagation.communications + communicationsRate),
    };
  }

  // --- Economic Damage Calculation ---
  let economicDamage = crypto.economicDamage;

  if (crisisActive) {
    // Damage accumulates based on cascade severity and PQC deployment progress
    // Total impact: $500B-$1.5T (research estimate)
    // Spread over crisis duration (~12-36 months until PQC deployed)

    // Monthly damage: Proportional to cascade severity
    const avgCascadeSeverity =
      (cascadePropagation.banking +
        cascadePropagation.commerce +
        cascadePropagation.identity +
        cascadePropagation.communications) /
      4.0;

    // Base monthly damage: $500B / 24 months = ~$21B/month if 100% compromised
    // Actual damage: Scaled by cascade severity and (1 - PQC deployment)
    const pqcProtection = state.quantumSystem.pqcTransition.deploymentProgress / 100.0;
    const vulnerability = 1.0 - pqcProtection;

    const baseMonthlyDamage = 21.0; // $21B/month baseline
    const monthlyDamage =
      baseMonthlyDamage * avgCascadeSeverity * vulnerability * (0.8 + rng() * 0.4); // Variance: 0.8-1.2x

    economicDamage += monthlyDamage;

    assertFinite(monthlyDamage, {
      location: 'CryptographySecurityPhase',
      valueName: 'monthlyDamage',
      month: currentMonth,
      additionalInfo: { avgCascadeSeverity, vulnerability },
    });
  }

  // --- Social Trust Impact ---
  let trustModifier = crypto.trustModifier;

  if (crisisActive) {
    // Trust degradation: -50% to -80% (research estimate with HIGH uncertainty)
    // Sylvia's critique: Weak evidence, wide variance needed
    // Degradation rate: 5-10% per month during active crisis

    const trustDecayRate = 0.05 + rng() * 0.05; // 5-10% per month
    const pqcRecoveryBonus = state.quantumSystem.pqcTransition.deploymentProgress / 100.0 * 0.5;

    // Trust decays toward asymptote (0.2-0.5 = 50-80% loss)
    const targetTrust = 0.2 + rng() * 0.3; // Wide variance per critique
    const trustDecay = (trustModifier - targetTrust) * trustDecayRate * (1.0 - pqcRecoveryBonus);

    trustModifier = Math.max(targetTrust, trustModifier - trustDecay);

    assertFinite(trustModifier, {
      location: 'CryptographySecurityPhase',
      valueName: 'trustModifier',
      month: currentMonth,
      additionalInfo: { trustDecayRate, targetTrust },
    });
  } else {
    // Gradual trust recovery when no crisis (if previously degraded)
    if (trustModifier < 1.0) {
      const recoveryRate = 0.01; // 1% per month (slow recovery, 5-15 years to baseline)
      trustModifier = Math.min(1.0, trustModifier + recoveryRate);
    }
  }

  // --- Apply Economic Shocks to Global Metrics ---
  if (crisisActive) {
    // Market confidence shock: -30% to -70% (research estimate)
    const avgCascadeSeverity =
      (cascadePropagation.banking +
        cascadePropagation.commerce +
        cascadePropagation.identity +
        cascadePropagation.communications) /
      4.0;

    // Confidence shock proportional to cascade severity
    const confidenceShock = -0.30 - avgCascadeSeverity * 0.40; // -30% to -70%
    const currentConfidence = state.globalMetrics.marketConfidence ?? 0.7;

    // Apply shock (multiplicative, one-time when crisis starts)
    if (newCrisisTriggered) {
      state.globalMetrics.marketConfidence = Math.max(
        0.1,
        currentConfidence * (1.0 + confidenceShock)
      );

      console.log(`\n📉 MARKET CONFIDENCE SHOCK:`);
      console.log(
        `  Confidence: ${currentConfidence.toFixed(2)} → ${state.globalMetrics.marketConfidence.toFixed(2)} (${(confidenceShock * 100).toFixed(1)}%)`
      );
    }

    // GDP impact: -2% to -4% during crisis (research estimate)
    // Applied as productivity drag while crisis active
    const gdpDragFactor = 0.98 - avgCascadeSeverity * 0.02; // 0.96-0.98 (2-4% drag)

    if (state.globalMetrics.gdpPerCapita) {
      state.globalMetrics.gdpPerCapita *= gdpDragFactor;
    }
  }

  // --- Update State ---
  state.quantumSystem.cryptographySecurity = {
    rsaStatus,
    eccStatus,
    aesStatus,
    pqcDeployment: crypto.pqcDeployment, // Updated by PostQuantumTransitionPhase
    crisisActive,
    crisisStartMonth,
    economicDamage,
    trustModifier,
    detectionWindow,
    cascadePropagation,
  };

  // --- Events ---
  const events = [];

  if (newCrisisTriggered) {
    events.push({
      id: `crypto-crisis-${currentMonth}`,
      type: 'cryptographic-crisis' as any,
      month: currentMonth,
      description: `☢️🔐 CRYPTOGRAPHIC CRISIS: RSA/ECC broken. Banking, commerce, identity systems compromised.`,
      impact: 'catastrophic',
    });
  }

  // Milestone events for cascade propagation
  if (crisisActive && cascadePropagation.banking >= 0.5 && crypto.cascadePropagation.banking < 0.5) {
    events.push({
      id: `banking-cascade-${currentMonth}`,
      type: 'banking-cascade' as any,
      month: currentMonth,
      description: `🏦💥 Banking systems 50% compromised. Authentication failures widespread.`,
      impact: 'major',
    });
  }

  if (crisisActive && cascadePropagation.commerce >= 0.5 && crypto.cascadePropagation.commerce < 0.5) {
    events.push({
      id: `commerce-cascade-${currentMonth}`,
      type: 'commerce-cascade' as any,
      month: currentMonth,
      description: `🛒💥 E-commerce 50% disrupted. Payment processing failures.`,
      impact: 'major',
    });
  }

  return {
    stateChanges: {
      'quantumSystem.cryptographySecurity': state.quantumSystem.cryptographySecurity,
      'globalMetrics.marketConfidence': state.globalMetrics.marketConfidence,
      'globalMetrics.gdpPerCapita': state.globalMetrics.gdpPerCapita,
    },
    events,
    errors: [],
  };
}
