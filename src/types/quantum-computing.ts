/**
 * Quantum Computing Breakthrough Cascades - Type Definitions
 *
 * Feature: L-3 (LOW Priority)
 * Created: December 10, 2025
 * Research: research/quantum_computing_cascades_20251210.md (38 sources, Grade B+)
 * Validation: reviews/quantum_cascades_critique_20251210.md (PASSED QG1)
 *
 * Models quantum computing progression from NISQ era to fault-tolerant quantum computing,
 * and resulting cascades through cryptography, economics, and social trust.
 */

/**
 * Quantum Advantage Levels
 *
 * Research-backed progression milestones:
 * - None: <100 logical qubits (current NISQ era, 2025 baseline: 28 logical qubits)
 * - Basic: 100-999 logical qubits (optimization, narrow simulations)
 * - Shors: 1,730+ logical qubits (RSA-2048 breaking capability via Shor's algorithm)
 * - General: 10,000+ logical qubits (broad quantum advantage across problem classes)
 *
 * Source: Chevignard et al. (2024), Gidney & Ekerå (2019), IBM/IonQ roadmaps
 */
export enum QuantumAdvantageLevel {
  None = 0,    // NISQ era
  Basic = 1,   // Limited optimization advantage
  Shors = 2,   // Cryptographically-Relevant Quantum Computer (CRQC)
  General = 3  // Broad quantum supremacy
}

/**
 * Quantum Algorithm Support
 *
 * Tracks which algorithm classes are practical at current capability level.
 * Each algorithm has specific qubit requirements and application domains.
 *
 * Research: IBM Quantum roadmap (2025), Quantinuum roadmap (2024)
 */
export interface QuantumAlgorithmSupport {
  /** Grover's algorithm (100+ logical qubits) - Database search, optimization */
  grovers: boolean;

  /** Shor's algorithm (1,730+ logical qubits) - RSA/ECC factoring */
  shors: boolean;

  /** Quantum chemistry (1,000+ logical qubits) - Molecular simulation */
  quantumChemistry: boolean;

  /** Quantum machine learning (500+ logical qubits) - QML algorithms */
  quantumML: boolean;

  /** General advantage (10,000+ logical qubits) - Broad problem classes */
  generalAdvantage: boolean;
}

/**
 * Quantum Computing State
 *
 * Hardware capabilities, algorithm support, investment tracking.
 *
 * Research parameters:
 * - Logical qubit doubling time: 18-24 months (current industry pace)
 * - Physical-to-logical ratio: 4:1 (Microsoft optimistic) to 1000:1 (conservative)
 * - Error rate target: 1e-7 (below threshold for error correction)
 *
 * Timeline (realistic): 2032-2045 for FTQC, vendor roadmaps 2028-2035 likely optimistic
 *
 * Sources: IBM roadmap, Microsoft/Atom Computing demos, Google Willow chip
 */
export interface QuantumComputingState {
  // Hardware capabilities
  /** Current physical qubits (2025 baseline: ~200, Google Willow chip) */
  physicalQubits: number;

  /** Error-corrected logical qubits (2025 baseline: 28, Microsoft/Atom Computing) */
  logicalQubits: number;

  /** Physical error rate per operation (2025: 0.000015% best, QuEra) */
  errorRate: number;

  /** Qubit coherence time in microseconds (affects gate depth) */
  coherenceTime: number;

  // Algorithm support (threshold-based)
  algorithmSupport: QuantumAlgorithmSupport;

  // Investment & progress
  /** Annual R&D investment ($B/year, 2024 baseline: $2B) */
  annualInvestment: number;

  /** Research progress factor (0-1, affects scaling speed) */
  researchProgress: number;

  // Breakthrough tracking
  /** Has any major breakthrough been achieved? */
  breakthroughAchieved: boolean;

  /** Month when first breakthrough occurred (Shor's threshold) */
  breakthroughMonth: number | null;

  /** Current quantum advantage level */
  quantumAdvantageLevel: QuantumAdvantageLevel;
}

/**
 * Cryptography Status
 *
 * Security state of major cryptographic algorithm classes.
 * RSA/ECC vulnerable to Shor's algorithm, symmetric (AES) quantum-resistant.
 */
export interface CryptoStatus {
  /** RSA-2048/4096 secure? (broken by Shor's at 1,730+ logical qubits) */
  rsa: boolean;

  /** Elliptic Curve Cryptography secure? (broken by Shor's, lower qubit requirement) */
  ecc: boolean;

  /** Symmetric encryption (AES-256) secure? (quantum-resistant, Grover's gives √N speedup only) */
  symmetric: boolean;
}

/**
 * Cryptography Security State
 *
 * Tracks cryptographic vulnerability, crisis propagation, and breach probability.
 *
 * Research parameters:
 * - Shor's threshold: 1,730 logical qubits for RSA-2048 (Chevignard 2024)
 * - Execution time: 8-48 hours for factorization (detection-to-breaking window)
 * - Economic damage multiplier: 10-100x (use 50x median)
 * - Vulnerable assets: ~10x global GDP (banking, commerce, identity systems)
 *
 * Sources: Chevignard et al. (2024), NIST PQC standards (2024)
 */
export interface CryptographySecurityState {
  // Current security state
  /** Security status of major crypto algorithms */
  cryptoStatus: CryptoStatus;

  // Post-quantum cryptography (PQC) transition
  /** Fraction of infrastructure migrated to PQC (0-1) */
  pqcDeployment: number;

  /** Annual PQC deployment investment ($B/year, baseline: $7.1B) */
  pqcInvestment: number;

  /** NIST PQC standards published? (true in 2024+ baseline) */
  pqcStandardsPublished: boolean;

  // Crisis state
  /** Is cryptographic crisis currently active? */
  cryptographicCrisisActive: boolean;

  /** Crisis severity (0-1, propagation extent through systems) */
  crisisSeverity: number;

  /** Months since crisis started (for tracking recovery timeline) */
  monthsSinceCrisisStart: number;

  // Vulnerability tracking
  /** Value of assets protected by broken cryptography ($T) */
  vulnerableAssets: number;

  /** Monthly probability of major security breach (0-1) */
  breachProbability: number;
}

/**
 * Post-Quantum Cryptography Transition State
 *
 * Tracks deployment progress, investment, and barriers to PQC adoption.
 *
 * Research parameters:
 * - Deployment timeline: 20-40 years for full transition (use 30 years baseline)
 * - NIST target: 2035 for government transition (likely optimistic)
 * - Investment baseline: $7.1B (NIST estimate)
 * - Crisis multiplier: 5x investment boost during active crisis
 *
 * Barriers: Hardware compatibility, training, testing, coordination
 *
 * Sources: NIST PQC transition guidance (2024), cybersecurity cost research
 */
export interface PostQuantumTransitionState {
  /** Deployment progress (0-1, fraction of infrastructure migrated) */
  deploymentProgress: number;

  /** Total investment required for full transition ($B) */
  investmentRequired: number;

  /** Cumulative investment spent to date ($B) */
  investmentSpent: number;

  /** Estimated years remaining to completion */
  yearsToCompletion: number;

  /** Deployment barrier severity (0-1, affects progress rate) */
  barrierSeverity: number;
}

/**
 * Quantum-AI Integration State
 *
 * Tracks quantum computing enhancements to AI capabilities.
 *
 * Research parameters:
 * - Drug discovery: 20x speedup demonstrated (2024, narrow task)
 * - General enhancement: 2-10x realistic range (skeptical: Das Sarma, Aaronson)
 * - Use median 5x over 5 years = ~1.01 monthly multiplier
 *
 * Application domains:
 * - Chemistry simulation (drug discovery, materials science)
 * - Physics simulation (quantum systems, high-energy physics)
 * - Optimization (portfolio, logistics, scheduling)
 * - Machine learning (kernel methods, sampling)
 *
 * CRITICAL CAVEAT: Narrow task demonstrations may not generalize to broad AI capabilities.
 *
 * Sources: Google Quantum AI (2024), skeptical commentary (Das Sarma, Aaronson)
 */
export interface QuantumAIIntegrationState {
  /** Is quantum-AI enhancement active? (requires Grover's algorithm) */
  active: boolean;

  /** Has quantum-AI advantage been demonstrated? (10x+ physical multiplier) */
  demonstratedAdvantage: boolean;

  /** Month when advantage was first demonstrated */
  advantageMonth: number | null;

  /** Capability multipliers by dimension (1.0 = no enhancement) */
  capabilityMultipliers: {
    /** Physical dimension (chemistry, materials, physics): 1.0 - 100.0x */
    physical: number;

    /** Research dimension (algorithms, optimization): 1.0 - 20.0x */
    research: number;

    /** Digital dimension (optimization, limited crypto): 1.0 - 5.0x */
    digital: number;

    /** Cognitive dimension (minimal quantum advantage): 1.0 - 3.0x */
    cognitive: number;
  };
}

/**
 * Quantum System State (Top-Level)
 *
 * Aggregates all quantum computing subsystems for GameState integration.
 */
export interface QuantumSystemState {
  /** Quantum computing hardware and capabilities */
  quantumComputing: QuantumComputingState;

  /** Cryptography security and crisis state */
  cryptography: CryptographySecurityState;

  /** Post-quantum cryptography transition */
  pqcTransition: PostQuantumTransitionState;

  /** Quantum-AI integration effects */
  quantumAI: QuantumAIIntegrationState;
}

/**
 * Quantum Breakthrough Event
 *
 * Logged when major capability thresholds are crossed.
 */
export interface QuantumBreakthroughEvent {
  /** Month when breakthrough occurred */
  month: number;

  /** Logical qubits at breakthrough */
  logicalQubits: number;

  /** Advantage level achieved */
  advantageLevel: QuantumAdvantageLevel;

  /** Algorithm capabilities unlocked */
  algorithmsUnlocked: string[];
}

/**
 * Cryptographic Crisis Event
 *
 * Logged when cryptographic security fails.
 */
export interface CryptographicCrisisEvent {
  /** Month when crisis started */
  startMonth: number;

  /** Which algorithms were broken */
  algorithmsBroken: ('RSA' | 'ECC')[];

  /** Value of vulnerable assets ($T) */
  vulnerableAssets: number;

  /** Economic damage multiplier (10-100x baseline) */
  economicDamageMultiplier: number;

  /** Social trust impact (permanent loss) */
  trustImpact: number;
}

/**
 * Initialize Quantum System State
 *
 * Creates baseline state for 2025:
 * - 28 logical qubits (Microsoft/Atom Computing)
 * - 200 physical qubits (Google Willow)
 * - NIST PQC standards published (August 2024)
 * - No active crisis
 */
export function createInitialQuantumState(): QuantumSystemState {
  return {
    quantumComputing: {
      // 2025 baseline: Microsoft/Atom 28 logical qubits, Google Willow 200 physical
      physicalQubits: 200,
      logicalQubits: 28,
      errorRate: 0.0001, // 0.01% (conservative, best is 0.000015%)
      coherenceTime: 100, // 100 microseconds (typical)

      algorithmSupport: {
        grovers: false,           // Requires 100+ logical qubits
        shors: false,             // Requires 1,730+ logical qubits
        quantumChemistry: false,  // Requires 1,000+ logical qubits
        quantumML: false,         // Requires 500+ logical qubits
        generalAdvantage: false   // Requires 10,000+ logical qubits
      },

      annualInvestment: 2.0, // $2B baseline (2024)
      researchProgress: 0.5, // Mid-range progress factor

      breakthroughAchieved: false,
      breakthroughMonth: null,
      quantumAdvantageLevel: QuantumAdvantageLevel.None
    },

    cryptography: {
      cryptoStatus: {
        rsa: true,       // Secure until Shor's algorithm practical
        ecc: true,       // Secure until Shor's algorithm practical
        symmetric: true  // Quantum-resistant (AES-256 safe)
      },

      // PQC transition (NIST standards published Aug 2024)
      pqcDeployment: 0.05, // 5% early adoption
      pqcInvestment: 1.0,  // $1B/year pre-crisis baseline
      pqcStandardsPublished: true, // NIST Aug 2024

      // No active crisis at start
      cryptographicCrisisActive: false,
      crisisSeverity: 0.0,
      monthsSinceCrisisStart: 0,

      vulnerableAssets: 0, // Calculated when crisis starts
      breachProbability: 0.0
    },

    pqcTransition: {
      deploymentProgress: 0.05, // 5% (matches pqcDeployment)
      investmentRequired: 7.1,  // $7.1B total (NIST estimate)
      investmentSpent: 0.35,    // 5% of $7.1B
      yearsToCompletion: 30,    // 30 years baseline (2025 → 2055)
      barrierSeverity: 0.7      // High barriers (hardware, training, testing)
    },

    quantumAI: {
      active: false,                // Requires Grover's algorithm
      demonstratedAdvantage: false, // Requires 10x+ physical multiplier
      advantageMonth: null,         // Not yet demonstrated
      capabilityMultipliers: {
        physical: 1.0,    // Chemistry, materials, physics
        research: 1.0,    // Algorithms, optimization
        digital: 1.0,     // Optimization, limited crypto
        cognitive: 1.0    // Minimal quantum advantage
      }
    }
  };
}
