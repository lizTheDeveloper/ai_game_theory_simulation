/**
 * Quantum Computing System Types (L-3, Dec 10, 2025)
 *
 * Type definitions for quantum computing cascades.
 * Research foundation: research/quantum_computing_cascades_20251210.md (Grade B+, 38 sources)
 */

/**
 * Quantum advantage level progression
 * - None: NISQ era, no practical advantage
 * - Basic: Grover's algorithm (100+ qubits), database search
 * - Shors: Shor's algorithm (1,730+ qubits), RSA breaking - CRITICAL THRESHOLD
 * - General: General quantum advantage (10,000+ qubits), broad supremacy
 */
export enum QuantumAdvantageLevel {
  None = 0,
  Basic = 1,
  Shors = 2,
  General = 3
}

/**
 * Algorithm capability flags
 */
export interface AlgorithmSupport {
  grovers: boolean;           // Database search, optimization (100+ qubits)
  quantumML: boolean;          // Quantum machine learning (500+ qubits)
  quantumChemistry: boolean;   // Molecular simulation (1,000+ qubits)
  shors: boolean;              // RSA breaking (1,730+ qubits) - CRITICAL
  generalAdvantage: boolean;   // General advantage (10,000+ qubits)
}

/**
 * Quantum computing state
 */
export interface QuantumComputingState {
  logicalQubits: number;              // Current logical qubit count
  errorRate: number;                  // Physical error rate (1e-7 threshold)
  annualInvestment: number;           // Annual R&D investment ($B)
  researchProgress: number;           // 0-1 scale (toward 10,000 qubits)
  algorithmSupport: AlgorithmSupport; // Which algorithms are practical
  quantumAdvantageLevel: QuantumAdvantageLevel; // Current advantage level
  breakthroughAchieved: boolean;      // Has Shor's threshold been crossed?
  breakthroughMonth: number;          // Month of Shor's breakthrough
}

/**
 * Cryptography security state
 */
export interface CryptographyState {
  cryptoStatus: {
    rsa: boolean;      // Is RSA secure? (broken at Shor's threshold)
    ecc: boolean;      // Is ECC secure? (broken at Shor's threshold)
    symmetric: boolean; // Is AES-256 secure? (quantum-resistant)
  };
  cryptographicCrisisActive: boolean; // Is there an active crypto crisis?
  monthsSinceCrisisStart: number;     // Crisis duration
  crisisSeverity: number;             // 0-1 scale (cascading failures)
  vulnerableAssets: number;           // Assets protected by broken crypto ($T)
  breachProbability: number;          // Monthly probability of major breach
  pqcInvestment: number;              // Annual PQC investment ($B)
}

/**
 * Post-quantum cryptography transition state
 */
export interface PQCTransitionState {
  standardsPublished: boolean;  // Have PQC standards been published?
  deploymentProgress: number;   // 0-1 scale (fraction of systems migrated)
  investmentSpent: number;      // Total cumulative investment ($B)
  yearsToCompletion: number;    // Estimated years remaining
  barrierSeverity: number;      // 0-1 scale (deployment difficulty)
}

/**
 * Complete quantum system state
 */
export interface QuantumSystemState {
  quantumComputing: QuantumComputingState;
  cryptography: CryptographyState;
  pqcTransition: PQCTransitionState;
}
