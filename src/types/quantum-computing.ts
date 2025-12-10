/**
 * Quantum Computing State Types (L-3, Dec 10, 2025)
 *
 * Models quantum computing breakthrough cascades:
 * - Fault-tolerant quantum computing capability tracking
 * - Cryptographic security status (RSA/ECC vulnerability)
 * - Post-quantum cryptography (PQC) transition progress
 * - Economic and social impacts of crypto failures
 * - Quantum-AI capability enhancements
 *
 * Research: research/quantum_computing_cascades_20251210.md (31 sources, 90% 2024-2025)
 * Validation: reviews/quantum_cascades_critique_20251210.md (Grade B+, PASSED)
 *
 * Key Thresholds:
 * - 100-500 logical qubits: Basic quantum advantage (Grover's algorithm)
 * - 1,730-4,099 logical qubits: Shor's algorithm practical (RSA-2048 breaking)
 * - 10,000+ logical qubits: General quantum advantage
 *
 * Timeline (realistic scenario): 2028-2030 for cryptographic breaking capability
 */

/**
 * Algorithm Support Capabilities
 *
 * Tracks which quantum algorithm classes are practical at current capability level.
 */
export interface QuantumAlgorithmSupport {
  /** Shor's factoring algorithm (RSA/ECC breaking) - requires ~1,730-4,099 logical qubits */
  shors: boolean;

  /** Grover's search algorithm (symmetric crypto speedup 2x) - requires ~100-500 logical qubits */
  grovers: boolean;

  /** Quantum machine learning algorithms - requires ~500-5,000 logical qubits */
  quantumML: boolean;

  /** Quantum chemistry simulation - requires ~1,000-10,000 logical qubits */
  quantumChemistry: boolean;
}

/**
 * Quantum Computing Capability State
 *
 * Tracks progression from NISQ (Noisy Intermediate-Scale Quantum) to
 * fault-tolerant quantum computing (FTQC).
 */
export interface QuantumComputingState {
  /** Fault-tolerant logical qubits (current count) */
  logicalQubits: number;

  /** Physical error rate per operation (0.000015% best case → 0.1% NISQ) */
  errorRate: number;

  /** Which algorithm classes are practical at current capability */
  algorithmSupport: QuantumAlgorithmSupport;

  /** R&D investment level (0-1 scale, affects scaling rate) */
  investmentLevel: number;

  /** Monthly probability of capability breakthrough (time-varying, Gaussian centered ~2029) */
  breakthroughProbability: number;

  /** Has cryptographically-relevant quantum computer (CRQC) been achieved? */
  crqcAchieved: boolean;

  /** Month when CRQC was achieved (undefined if not yet) */
  crqcAchievedMonth?: number;

  /**
   * Historical logical qubit count for tracking progress
   * (enables acceleration/deceleration detection)
   */
  previousLogicalQubits: number;
}

/**
 * Cryptographic Algorithm Status
 *
 * Security status of major cryptographic algorithms.
 */
export type CryptoStatus = 'secure' | 'vulnerable' | 'broken';

/**
 * Cryptography Security State
 *
 * Tracks cryptographic vulnerability from quantum computing advances.
 */
export interface CryptographySecurityState {
  /** RSA-2048 security status (breaks at ~1,730-4,099 logical qubits) */
  rsaStatus: CryptoStatus;

  /** ECC-256 security status (breaks at ~2,000 logical qubits) */
  eccStatus: CryptoStatus;

  /** AES-256 symmetric security status (Grover's provides 2x speedup, effectively AES-128) */
  aesStatus: CryptoStatus;

  /** Post-quantum cryptography deployment progress (0-100%) */
  pqcDeployment: number;

  /** Is cryptography crisis currently active? */
  crisisActive: boolean;

  /** Month when crisis began (undefined if never occurred) */
  crisisStartMonth?: number;

  /** Cumulative economic damage from crypto failures (USD billions) */
  economicDamage: number;

  /** Social trust modifier in digital systems (0-1, 1=full trust) */
  trustModifier: number;

  /** Detection-to-breaking window remaining (months, undefined if not detected) */
  detectionWindow?: number;

  /**
   * Cascade propagation tracking
   * Measures how cryptographic failure has spread through systems:
   * - banking: Authentication/transaction systems
   * - commerce: E-commerce, payment processing
   * - identity: Digital identity, government services
   * - communications: Encrypted messaging, VPNs
   */
  cascadePropagation: {
    banking: number;        // 0-1 (1=fully compromised)
    commerce: number;       // 0-1
    identity: number;       // 0-1
    communications: number; // 0-1
  };
}

/**
 * Post-Quantum Cryptography Transition State
 *
 * Tracks migration from quantum-vulnerable (RSA/ECC) to
 * quantum-resistant (NIST PQC standards) cryptography.
 */
export interface PostQuantumTransitionState {
  /** Deployment mode: proactive (before crisis) vs reactive (during crisis) */
  mode: 'proactive' | 'reactive';

  /** Current deployment progress (0-100%) */
  deploymentProgress: number;

  /** Deployment rate (%/month) - proactive: 0.4-0.8%/month, reactive: 1.7-3.3%/month */
  deploymentRate: number;

  /** Cumulative investment in PQC transition (USD billions) */
  cumulativeInvestment: number;

  /** Monthly investment level (USD billions/month) */
  monthlyInvestment: number;

  /** Crypto agility score (0-1, ability to rapidly upgrade crypto systems) */
  cryptoAgility: number;

  /**
   * Sectoral deployment progress (different sectors migrate at different rates)
   * Priority: defense > finance > government > healthcare > commerce > consumer
   */
  sectoralProgress: {
    defense: number;      // 0-100%
    finance: number;      // 0-100%
    government: number;   // 0-100%
    healthcare: number;   // 0-100%
    commerce: number;     // 0-100%
    consumer: number;     // 0-100%
  };

  /** Legacy crypto debt (% of systems still using vulnerable crypto) */
  legacyCryptoDebt: number;

  /** Estimated months to complete transition (depends on rate and agility) */
  estimatedCompletionMonths: number;
}

/**
 * Quantum-AI Integration State
 *
 * Tracks quantum computing enhancements to AI capabilities.
 * Heterogeneous effects: chemistry/physics (+10-20x), optimization (+5-10x),
 * general ML (+1-3x), social science (+0x).
 */
export interface QuantumAIIntegrationState {
  /** Is quantum-AI integration active? (requires quantum advantage + AI infrastructure) */
  active: boolean;

  /**
   * Capability multipliers by AI dimension
   * Applied heterogeneously based on quantum-amenability:
   * - Physical: High (molecular simulation, materials science)
   * - Research: Medium-High (optimization, quantum chemistry)
   * - Digital: Medium (cryptanalysis, optimization problems)
   * - Cognitive: Low (minimal quantum advantage for language/reasoning)
   */
  capabilityMultipliers: {
    physical: number;      // 1.0-100x (molecular simulation)
    research: number;      // 1.0-20x (quantum algorithms, optimization)
    digital: number;       // 1.0-5x (optimization, limited crypto)
    cognitive: number;     // 1.0-3x (minimal quantum advantage)
  };

  /** Has quantum-AI achieved demonstrated advantage? (e.g., IonQ 20x drug discovery) */
  demonstratedAdvantage: boolean;

  /** Month when quantum-AI advantage was first demonstrated */
  advantageMonth?: number;
}

/**
 * Comprehensive Quantum Computing State
 *
 * Top-level state object combining all quantum-related subsystems.
 */
export interface QuantumSystemState {
  /** Quantum computing capability tracking */
  quantumComputing: QuantumComputingState;

  /** Cryptographic security status */
  cryptographySecurity: CryptographySecurityState;

  /** Post-quantum cryptography transition */
  pqcTransition: PostQuantumTransitionState;

  /** Quantum-AI integration effects */
  quantumAI: QuantumAIIntegrationState;
}

/**
 * Factory function: Initialize quantum system state
 *
 * @param currentMonth - Current simulation month (affects breakthrough probability)
 * @returns Initialized quantum system state
 */
export function createInitialQuantumState(currentMonth: number): QuantumSystemState {
  return {
    quantumComputing: {
      logicalQubits: 28,  // 2025 baseline (Microsoft/IBM actual)
      errorRate: 0.0001,  // 0.01% (realistic 2025)
      algorithmSupport: {
        shors: false,
        grovers: false,
        quantumML: false,
        quantumChemistry: false,
      },
      investmentLevel: 0.5,  // Moderate baseline investment
      breakthroughProbability: 0.0,  // Calculated dynamically based on time
      crqcAchieved: false,
      previousLogicalQubits: 28,
    },

    cryptographySecurity: {
      rsaStatus: 'secure',
      eccStatus: 'secure',
      aesStatus: 'secure',
      pqcDeployment: 5.0,  // 5% baseline (NIST standards published Aug 2024)
      crisisActive: false,
      economicDamage: 0,
      trustModifier: 1.0,  // Full trust initially
      cascadePropagation: {
        banking: 0,
        commerce: 0,
        identity: 0,
        communications: 0,
      },
    },

    pqcTransition: {
      mode: 'proactive',
      deploymentProgress: 5.0,  // Match pqcDeployment baseline
      deploymentRate: 0.5,  // 0.5%/month proactive (NIST 2035 target = 10 years)
      cumulativeInvestment: 0,
      monthlyInvestment: 0.5,  // $500M/month baseline
      cryptoAgility: 0.3,  // Low baseline (legacy systems prevalent)
      sectoralProgress: {
        defense: 10.0,  // Defense leads
        finance: 7.0,   // Finance second priority
        government: 5.0,
        healthcare: 3.0,
        commerce: 2.0,
        consumer: 1.0,  // Consumer lags
      },
      legacyCryptoDebt: 90.0,  // 90% systems still using RSA/ECC
      estimatedCompletionMonths: 200,  // ~17 years at current rate
    },

    quantumAI: {
      active: false,  // Not yet active (requires quantum advantage)
      capabilityMultipliers: {
        physical: 1.0,
        research: 1.0,
        digital: 1.0,
        cognitive: 1.0,
      },
      demonstratedAdvantage: false,
    },
  };
}
