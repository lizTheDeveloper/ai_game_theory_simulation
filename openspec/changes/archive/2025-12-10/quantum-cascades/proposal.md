# Change Proposal: Quantum Computing Breakthrough Cascades

**Created:** December 10, 2025
**Priority:** LOW (L-3)
**Complexity:** HIGH (8+ subsystem integration)
**Estimated effort:** 8-12 hours

---

## Problem Statement

The simulation currently lacks modeling of quantum computing breakthrough impacts on cryptographic security, economic systems, and social trust. Quantum advantage represents a step-change in computational capabilities with profound cascading effects:

1. **Cryptography crisis:** RSA/ECC breaking → digital infrastructure failure
2. **Economic disruption:** Banking, commerce, identity systems vulnerable
3. **Social trust collapse:** Loss of digital security fundamentals
4. **AI capability enhancement:** Quantum-accelerated AI research
5. **Technological debt:** Legacy crypto systems requiring replacement

Without this modeling, the simulation underestimates risks from quantum breakthroughs and misses key pathway dynamics in post-alignment futures.

---

## Solution Overview

Implement quantum computing breakthrough cascades with:

1. **Quantum capability tracking** (logical qubits, error rates, algorithm support)
2. **Cryptography crisis mechanics** (detection, breaking probability, cascade propagation)
3. **Economic shock modeling** (market crashes, banking disruption, commerce failure)
4. **PQC transition system** (deployment barriers, investment requirements, timeline)
5. **AI enhancement effects** (quantum-accelerated research, capability jumps)
6. **Social trust impacts** (digital infrastructure confidence, adoption resistance)

**Core principle:** Research-backed timelines and mechanisms, not speculative fiction.

---

## Research Questions

### 1. Quantum Advantage Timelines
- When does NISQ → fault-tolerant transition occur? (logical qubit thresholds, error rates)
- What algorithm classes become practical at each capability level?
- How do investment/research efforts affect scaling laws?

**Required sources:** 2024-2025 peer-reviewed quantum computing roadmaps, NIST PQC standards

### 2. Cryptographic Vulnerability
- Which algorithms break at which quantum capability thresholds? (RSA-2048, ECC-256, etc.)
- What is the detection-to-breaking timeline? (Shor's algorithm execution time)
- How do cryptographic failures propagate through systems?

**Required sources:** Post-quantum cryptography research, NIST vulnerability assessments

### 3. Economic Impact
- What is the economic value at risk from crypto failure? (banking, commerce, identity)
- How severe are market disruptions from cryptographic insecurity?
- What are PQC deployment costs and timescales?

**Required sources:** Economic impact studies, cybersecurity cost research

### 4. Social & Technological Effects
- How does crypto failure affect social trust in digital infrastructure?
- What are the barriers to PQC adoption? (compatibility, hardware requirements)
- How long does transition take under various scenarios? (crash program vs gradual)

**Required sources:** Technology adoption studies, infrastructure transition timelines

### 5. AI Integration
- How does quantum computing enhance AI capabilities? (optimization, simulation)
- What capability jumps occur with quantum advantage? (physical/digital/research dimensions)
- Does quantum-AI create new alignment risks?

**Required sources:** Quantum ML research, AI capability forecasting

---

## Implementation Phases

### Phase 1: Research & Validation (Quality Gate 1)
**Owner:** super-alignment-researcher (Cynthia) → research-skeptic (Sylvia)

**Deliverables:**
- `research/quantum_computing_cascades_20251210.md` (8+ peer-reviewed sources)
- Parameter values justified from research data
- Mechanism descriptions with interaction maps
- Validation by research-skeptic (Grade B+ or higher required)

**Estimated time:** 2-3 hours

### Phase 2: Data Modeling & State Design
**Owner:** feature-implementer (Moss)

**Deliverables:**
- `GameState` interface extensions (quantum capabilities, crypto status, PQC progress)
- Type definitions for quantum thresholds, algorithm classes, vulnerability states
- Integration points with existing systems (AI capabilities, economics, social trust)

**Estimated time:** 1-2 hours

### Phase 3: Implementation
**Owner:** feature-implementer (Moss)

**Deliverables:**
- `QuantumComputingPhase.ts` - Capability tracking, breakthrough detection
- `CryptographySecurityPhase.ts` - Vulnerability assessment, crisis detection
- `PostQuantumTransitionPhase.ts` - PQC deployment, investment effects
- Integration updates: AI capabilities (quantum enhancement), economics (shock propagation), social systems (trust impacts)

**Estimated time:** 3-4 hours

### Phase 4: Testing
**Owner:** unit-test-writer + integration-test-writer

**Deliverables:**
- Unit tests for quantum thresholds, crypto breaking mechanics
- Integration tests for cascade propagation (crypto → economy → trust)
- Monte Carlo validation (N≥10, deterministic, outcome distribution checks)

**Estimated time:** 1-2 hours

### Phase 5: Architecture Review (Quality Gate 2)
**Owner:** architecture-skeptic

**Deliverables:**
- Performance analysis (no O(n²) loops, deep cloning)
- State propagation validation (no circular dependencies)
- Complexity assessment (maintainability, testability)
- Grade B+ or higher required to proceed

**Estimated time:** 30 minutes

### Phase 6: Documentation & Archival
**Owner:** wiki-documentation-updater + architect

**Deliverables:**
- Wiki updates (`docs/wiki/README.md` - quantum computing section)
- DevLog entry with implementation notes
- Plan archival to `plans/completed/`
- OpenSpec delta merge to `openspec/specs/simulation/spec.md`

**Estimated time:** 30 minutes

---

## Integration Requirements

### System Dependencies

**Direct integrations:**
1. **AI Capabilities** - Quantum enhancement to research dimension, physical optimization
2. **Economic Systems** - Market crashes from crypto failure, PQC investment costs
3. **Social Trust** - Digital infrastructure confidence, technology adoption resistance
4. **Technological Debt** - Legacy crypto systems accumulating risk
5. **Research Infrastructure** - Quantum computing R&D investment effects

**Indirect effects:**
6. **Government Policy** - Crash PQC deployment programs, regulation
7. **International Cooperation** - Shared quantum research, PQC standards adoption
8. **Existential Risk** - Quantum-AI alignment risks, capability explosion scenarios

### State Interface Changes

**New state fields (to be added in Phase 2):**
```typescript
interface GameState {
  quantumComputing: {
    logicalQubits: number;           // Fault-tolerant logical qubits
    errorRate: number;                // Physical error rate (10^-3 → 10^-15)
    algorithmSupport: {               // Which algorithms are practical
      shors: boolean;                 // Factoring (RSA breaking)
      grovers: boolean;               // Search (symmetric crypto)
      quantumML: boolean;             // AI enhancement
    };
    investmentLevel: number;          // R&D funding (affects scaling)
    breakthroughProbability: number;  // Chance of capability jump
  };

  cryptographySecurity: {
    rsaStatus: 'secure' | 'vulnerable' | 'broken';
    eccStatus: 'secure' | 'vulnerable' | 'broken';
    pqcDeployment: number;            // 0-100% PQC adoption
    crisisActive: boolean;            // Cryptography crisis detected
    economicDamage: number;           // Cumulative losses from crypto failure
    trustModifier: number;            // Social trust in digital systems
  };

  // Integration touchpoints (existing fields)
  aiCapabilities: {
    researchCapability: number;       // +quantum enhancement
    physicalCapability: number;       // +quantum optimization
  };

  economicSystems: {
    shockSeverity: number;            // +crypto crisis impact
    marketConfidence: number;         // +crypto security perception
  };

  socialSystems: {
    digitalTrust: number;             // +crypto security effects
    technologyAdoption: number;       // +PQC transition resistance
  };

  technologicalDebt: {
    legacyCrypto: number;             // Accumulated vulnerability
  };
}
```

### Phase Execution Order

**Proposed phase positions:**
- `QuantumComputingPhase` - Order ~20 (after AI infrastructure, before social impacts)
- `CryptographySecurityPhase` - Order ~21 (immediately after quantum updates)
- `PostQuantumTransitionPhase` - Order ~22 (PQC deployment efforts)

**Rationale:** Quantum capabilities → Crypto status → PQC response (causal sequence)

---

## Success Criteria

Feature is complete when:

✅ Research validated (Grade B+ or higher, 8+ peer-reviewed sources)
✅ Implementation complete (3 new phases, state extensions, integrations)
✅ Tests passing (unit + integration + Monte Carlo N≥10)
✅ Architecture reviewed (Grade B+ or higher, no CRITICAL/HIGH issues)
✅ Documentation updated (wiki, devlog, plan archived)
✅ Monte Carlo shows realistic distributions (cryptography crises occur in plausible scenarios)

---

## Risk Assessment

**Research risks:**
- Quantum timeline uncertainty (wide range of expert forecasts)
- Economic impact data sparsity (few empirical studies of crypto failures)
- Mitigation: Use conservative estimates, document uncertainty ranges

**Implementation risks:**
- Cascade complexity (8+ system interactions)
- State propagation loops (quantum → AI → research → quantum)
- Mitigation: Phased implementation, careful dependency mapping

**Integration risks:**
- Performance overhead (checking crypto status every step)
- Balance disruption (quantum breakthroughs too severe/rare)
- Mitigation: Architecture review (Quality Gate 2), Monte Carlo validation

---

## Notes

**Priority rationale:** LOW (L-3) because:
- All HIGH/MEDIUM work complete (per Session 65 status)
- Quantum breakthroughs are late-game events (not early crisis modeling)
- System is production-ready without this feature (nice-to-have enrichment)

**Research standards:** 2024-2025 sources strongly preferred (quantum field moving rapidly)

**Token efficiency:** This is a LOW priority feature in normal productivity mode - full thoroughness expected, no shortcuts.
