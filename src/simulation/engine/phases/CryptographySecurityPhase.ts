import { GameState, GameEvent, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite, assertProbability, assertInRange } from '@/simulation/utils/assertions';
import { getGDPProxy } from '@/simulation/utils/recoveryCalculations';

/**
 * Cryptography Security Phase (L-3, Dec 10, 2025)
 *
 * Models cryptographic security failures from quantum computing breakthroughs.
 * Tracks RSA/ECC vulnerability, crisis propagation, and economic/social cascades.
 *
 * Order: TBD (After quantum computing, before post-quantum transition)
 *
 * Research Foundation:
 * - Shor's threshold: 1,730 logical qubits for RSA-2048 (Chevignard et al. 2024)
 * - Execution time: 8-48 hours (detection-to-breaking window extremely short)
 * - Economic damage multiplier: 10-100x (use 50x median)
 * - Vulnerable assets: ~10x global GDP (banking, commerce, identity systems)
 * - Trust impact: Permanent loss, never fully recovers (weak evidence base)
 * - Research: research/quantum_computing_cascades_20251210.md (38 sources, Grade B+)
 *
 * Key Dynamics:
 * 1. Crisis triggers when Shor's algorithm becomes practical
 * 2. Crisis severity propagates over months (cascading failures)
 * 3. Economic shocks scale with crisis severity (50x multiplier)
 * 4. Social trust erodes permanently (digital infrastructure confidence)
 * 5. Breach probability increases with crisis severity
 *
 * Expected Impact:
 * - Economic shocks ($500B-$1.5T damage potential)
 * - Social trust collapse (permanent 20-50% loss)
 * - Technological debt accumulation (legacy crypto systems)
 * - Urgency for post-quantum cryptography deployment
 */
export function executeCryptographySecurityPhase(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): PhaseResult {
  const events: GameEvent[] = [];

  // Initialize quantum system check
  if (!state.quantumSystem) {
    return { events, monthlyReport: {} };
  }

  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation (CryptographySecurityPhase)');
  }

  const quantum = state.quantumSystem.quantumComputing;
  const crypto = state.quantumSystem.cryptography;

  // --- 1. Check if cryptography has been broken ---
  const shorsCapable = quantum.algorithmSupport.shors;

  if (shorsCapable && crypto.cryptoStatus.rsa) {
    // CRISIS TRIGGER: RSA/ECC broken by quantum computers
    crypto.cryptoStatus.rsa = false;
    crypto.cryptoStatus.ecc = false;
    // Note: Symmetric (AES-256) remains secure (quantum-resistant)

    crypto.cryptographicCrisisActive = true;
    crypto.monthsSinceCrisisStart = 0;
    crypto.crisisSeverity = 0.1; // Initial severity (10% - detection phase)

    // Calculate vulnerable assets (~10x global GDP)
    const globalGDP = getGDPProxy(state); // Returns realistic GDP in $T
    crypto.vulnerableAssets = globalGDP * 10; // Banking, commerce, identity = 10x GDP

    assertFinite(crypto.vulnerableAssets, {
      location: 'CryptographySecurityPhase',
      valueName: 'vulnerableAssets',
      month: state.currentMonth,
      additionalInfo: { globalGDP }
    });

    console.log(`\n☢️💥 CRYPTOGRAPHIC CRISIS TRIGGERED (Month ${state.currentMonth}):`);
    console.log(`  🚨 RSA-2048 and ECC broken by Shor's algorithm`);
    console.log(`  Logical qubits: ${Math.floor(quantum.logicalQubits)}`);
    console.log(`  Vulnerable assets: $${crypto.vulnerableAssets.toFixed(1)}T`);
    console.log(`  ⚠️ Banking, commerce, and identity systems compromised`);
    console.log(`  ⚠️ Digital signatures no longer trustworthy`);
    console.log(`  ⚠️ Encrypted communications vulnerable`);
    console.log(`  → Economic shocks incoming`);
    console.log(`  → Social trust will erode`);
    console.log(`  → Post-quantum cryptography deployment urgent`);

    events.push({
      id: state.eventIdCounter++,
      type: 'crisis',
      month: state.currentMonth,
      title: '🚨 Cryptographic Crisis: RSA/ECC Broken',
      description: `Quantum computers have broken RSA-2048 and elliptic curve cryptography. $${crypto.vulnerableAssets.toFixed(1)}T in assets protected by broken encryption. Banking, commerce, identity systems at risk. Immediate post-quantum cryptography deployment required.`,
      severity: 'critical'
    });
  }

  // --- 2. Propagate cryptographic crisis ---
  if (crypto.cryptographicCrisisActive) {
    crypto.monthsSinceCrisisStart++;

    // Crisis severity grows over time (cascading failures through interconnected systems)
    // Research: Cybersecurity cascades follow S-curve pattern (slow → rapid → plateau)
    const maxSeverity = 0.8; // Never reaches 1.0 (some systems are airgapped/isolated)
    const severityGrowthRate = 0.1; // 10% per month toward max

    crypto.crisisSeverity = Math.min(
      maxSeverity,
      crypto.crisisSeverity + severityGrowthRate * (maxSeverity - crypto.crisisSeverity)
    );

    assertProbability(crypto.crisisSeverity, {
      location: 'CryptographySecurityPhase',
      valueName: 'crisisSeverity',
      month: state.currentMonth
    });

    // --- 3. Economic damage from crisis ---
    // Research: Economic damage multiplier 10-100x (use 50x median)
    // Damage scales with crisis severity (cascading failures)
    const economicDamageMultiplier = 50; // Median estimate
    const monthlyDamageFraction = 0.01; // 1% of vulnerable assets per month at full crisis

    const monthlyDamage =
      crypto.vulnerableAssets *
      economicDamageMultiplier *
      crypto.crisisSeverity *
      monthlyDamageFraction;

    assertFinite(monthlyDamage, {
      location: 'CryptographySecurityPhase',
      valueName: 'monthlyDamage',
      month: state.currentMonth,
      additionalInfo: { crisisSeverity: crypto.crisisSeverity, vulnerableAssets: crypto.vulnerableAssets }
    });

    // Apply economic shock (reduce GDP per capita)
    const population = state.humanPopulationSystem?.population ?? 8.0; // Fallback to 8B if undefined
    const perCapitaDamage = (monthlyDamage * 1e12) / (population * 1e9); // Convert $T to $ and B to persons

    state.economics.gdpPerCapita = Math.max(
      1000, // Floor: $1k per capita (survival minimum)
      state.economics.gdpPerCapita - perCapitaDamage
    );

    assertInRange(state.economics.gdpPerCapita, 1000, 200000, {
      location: 'CryptographySecurityPhase',
      valueName: 'gdpPerCapita',
      month: state.currentMonth,
      additionalInfo: { monthlyDamage, perCapitaDamage }
    });

    // --- 4. Social trust impact (permanent loss) ---
    // Research: Trust loss from crypto failures is permanent (weak evidence base)
    // Historical analogs (Equifax, Y2K) suggest incomplete recovery
    const trustLossRate = 0.05; // 5% max loss per month
    const monthlyTrustLoss = trustLossRate * crypto.crisisSeverity;

    // Apply to social systems trust
    if (!state.socialSystems.digitalInfrastructureTrust) {
      state.socialSystems.digitalInfrastructureTrust = 0.8; // Initialize if missing
    }

    state.socialSystems.digitalInfrastructureTrust = Math.max(
      0.2, // Floor: 20% (some baseline trust remains)
      state.socialSystems.digitalInfrastructureTrust - monthlyTrustLoss
    );

    assertInRange(state.socialSystems.digitalInfrastructureTrust, 0.2, 1.0, {
      location: 'CryptographySecurityPhase',
      valueName: 'digitalInfrastructureTrust',
      month: state.currentMonth
    });

    // Track cumulative trust loss (for outcome metrics)
    if (!state.socialSystems.cryptoBreakTrustLoss) {
      state.socialSystems.cryptoBreakTrustLoss = 0;
    }
    state.socialSystems.cryptoBreakTrustLoss += monthlyTrustLoss;

    // --- 5. Breach probability increases with crisis ---
    // Monthly probability of major security breach
    const baseBreachProbability = 0.1; // 10% monthly at full crisis
    crypto.breachProbability = baseBreachProbability * crypto.crisisSeverity;

    assertProbability(crypto.breachProbability, {
      location: 'CryptographySecurityPhase',
      valueName: 'breachProbability',
      month: state.currentMonth
    });

    // Roll for breach
    if (rng() < crypto.breachProbability) {
      const breachDamage = crypto.vulnerableAssets * 0.02; // 2% of vulnerable assets

      console.log(`\n💥 MAJOR SECURITY BREACH (Month ${state.currentMonth}):`);
      console.log(`  🚨 Cryptographic infrastructure compromised`);
      console.log(`  Economic damage: $${breachDamage.toFixed(1)}T`);
      console.log(`  → Immediate GDP per capita loss: 2%`);

      // Additional shock from breach
      state.economics.gdpPerCapita *= 0.98; // 2% immediate loss

      events.push({
<<<<<<< Updated upstream
        id: state.eventIdCounter++,
        type: 'disaster',
=======
        id: `crypto-breach-${state.currentMonth}`,
        type: 'crisis',
>>>>>>> Stashed changes
        month: state.currentMonth,
        title: '💥 Major Cryptographic Breach',
        description: `Major security breach due to broken cryptography. $${breachDamage.toFixed(1)}T in economic damage. Digital infrastructure trust further eroded.`,
        severity: 'major'
      });

      // Additional trust loss from breach
      state.socialSystems.digitalInfrastructureTrust *= 0.95; // 5% additional loss
    }

    // --- 6. Progress reporting ---
    if (crypto.monthsSinceCrisisStart % 6 === 0) {
      // Report every 6 months
      console.log(`\n☢️ Cryptographic Crisis Update (Month ${state.currentMonth}):`);
      console.log(`  Duration: ${crypto.monthsSinceCrisisStart} months`);
      console.log(`  Severity: ${(crypto.crisisSeverity * 100).toFixed(0)}%`);
      console.log(`  Economic damage: $${monthlyDamage.toFixed(2)}T/month`);
      console.log(`  Digital trust: ${(state.socialSystems.digitalInfrastructureTrust * 100).toFixed(0)}%`);
      console.log(`  Breach probability: ${(crypto.breachProbability * 100).toFixed(0)}%/month`);

      if (state.quantumSystem.pqcTransition.deploymentProgress < 0.5) {
        console.log(`  ⚠️ PQC deployment only ${(state.quantumSystem.pqcTransition.deploymentProgress * 100).toFixed(0)}% complete`);
      }
    }
  }

  // --- 7. Generate monthly report ---
  const monthlyReport: Record<string, number> = {};

  if (crypto.cryptographicCrisisActive) {
    monthlyReport['Crypto Crisis: Severity (%)'] = crypto.crisisSeverity * 100;
    monthlyReport['Crypto Crisis: Months Active'] = crypto.monthsSinceCrisisStart;
    monthlyReport['Digital Trust (%)'] = (state.socialSystems.digitalInfrastructureTrust ?? 0.8) * 100;
  }

  return { events, monthlyReport };
}
