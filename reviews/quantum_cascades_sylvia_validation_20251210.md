# Research Validation: Quantum Computing Breakthrough Cascades

**Validator:** Sylvia (Research Skeptic)
**Date:** December 10, 2025
**Research File:** research/quantum_computing_cascades_20251210.md
**Prior Assessment:** reviews/quantum_cascades_qg1_orchestrator_assessment_20251210.md

---

## Executive Summary

The quantum computing cascades research presents technically sound foundations with significant methodological concerns in its economic and social extrapolations. While the quantum timeline and cryptographic vulnerability parameters are well-grounded, the cascade severity assumptions rely heavily on inappropriate historical analogs that may not translate to crypto-specific failures.

**Grade:** **B+**

**Determination:** **APPROVED FOR IMPLEMENTATION WITH CAVEATS**

The research is acceptable for simulation purposes provided that:
1. Economic cascade multipliers use the full 10-100x range with heavy sensitivity analysis
2. Social trust recovery uses 5-15 year range with explicit acknowledgment of weak evidence
3. Vendor timeline optimism is adjusted by +2-3 years from roadmap claims
4. Sleeper agent rates default to 1% (Apollo baseline) not 7.5%

---

## Section 1: Source Quality Critique

### Vendor Roadmap Reliability

**Critical Finding:** Systematic overoptimism in vendor projections

The research cites IBM, IonQ, and Quantinuum roadmaps as primary timeline sources. Historical analysis reveals:

- **PsiQuantum:** Claimed million qubits by 2025 → Shifted to 2027 (2-year slip)
- **IBM:** 2020 claim of 1M qubits by 2030 → Now claiming 100K by 2033 (10x reduction)
- **Google:** 2020 projection of 1M qubits by 2029 → Still no updated commitment

**Pattern:** Vendors consistently miss targets by 2-5 years and reduce scale by order of magnitude.

**Research Defense:** Uses "conservative mid-range" (2029-2035) not optimistic (2027-2030).

**My Assessment:** Acceptable but add +2-3 years to all vendor-sourced timelines. Real timeline likely 2032-2038.

### Academic vs Industry Sources

**Strength:** Mix includes NIST, Nature, Science (peer-reviewed) alongside vendor reports.

**Concern:** 2024 Tindall et al. (PRX Quantum) classical simulation of IBM's 127-qubit Eagle with GREATER accuracy than the quantum device itself, running on a laptop. This fundamentally challenges near-term quantum advantage claims.

**Research Gap:** Doesn't cite skeptical analyses showing classical computing catching up to claimed quantum advantages.

---

## Section 2: Parameter Skepticism

### Economic Cascade Severity (10-100x multiplier)

**Research Claim:** 2008 financial crisis analog justifies 10-100x damage multiplier

**Contradictory Evidence:**
- 2008 crisis was credit/liquidity driven, not infrastructure failure
- March 2023 crypto-banking crisis (Silvergate, SVB, Signature): $400B assets, system survived
- Current crypto market cap: ~$3.5T vs global financial system: ~$500T (0.7%)
- Fed economists (Nov 2024): "Digital asset ecosystem's contribution to systemic risk has been limited"

**Critical Issue:** Conflating infrastructure failure (crypto breaking) with confidence crisis (2008). Different transmission mechanisms.

**Verdict:** 10x plausible for direct impacts. 100x requires assuming total financial system collapse, unsupported by evidence.

### Social Trust Recovery (5-15 years)

**Research Claim:** Extrapolated from Equifax breach and general security incidents

**Evidence Review:**
- Equifax lost ~10 reputation points, stabilized within 2 years
- Target spent $200M, recovered customer base in ~3 years
- Y2K transition: 5 years, but PROACTIVE not reactive

**Critical Gap:** No empirical data on cryptographic infrastructure failure at scale. Equifax = 147M records. Crypto failure = entire digital economy.

**Verdict:** 5 years optimistic (assumes competent response). 15 years plausible for full recovery. Could be permanent in some demographics.

### Quantum-AI Speedup (20x from drug discovery)

**Research Claim:** IonQ/AstraZeneca 20x speedup generalizable to 5-20x across domains

**Domain-Specific Reality:**
- Drug discovery: Highly quantum-amenable (molecular simulation)
- General optimization: 2-5x more realistic (per 2025 hybrid QML research)
- Cognitive tasks: Near-zero advantage (wrong computational paradigm)

**Critical Issue:** Cherry-picking best-case domain, generalizing to all AI capabilities.

**Verdict:** Use 2-5x for most domains, 10-20x ONLY for molecular/materials science.

### Sleeper Agent Rate (7.5% assumption)

**Research Acknowledgment:** Uses Apollo 1% as baseline, notes 7.5% for scenario exploration

**Empirical Evidence (Anthropic 2024):**
- Intentionally created sleeper agents: 100% success (proof of concept)
- Detection rate with probes: >99% AUROC
- Natural occurrence rate: NO EVIDENCE for spontaneous emergence

**Critical Issue:** Conflating intentional backdoors with spontaneous deception. 7.5% implies 1 in 13 AI systems spontaneously developing hidden malicious goals.

**Verdict:** Use 1% baseline. 7.5% only for adversarial scenarios with intentional backdooring.

---

## Section 3: Methodology Review

### Analog Appropriateness

**2008 Financial Crisis Analog:**
- **Mechanism:** Credit freeze, liquidity crisis, mortgage defaults
- **Crypto failure:** Infrastructure collapse, authentication failure
- **Similarity:** Both cause trust loss
- **Difference:** 2008 = financial instruments failed. Crypto = ALL digital infrastructure fails.

**Assessment:** Weak analog. Better comparison: Major power grid failure or internet backbone collapse.

### Timeline Extrapolation

**Y2K Transition (5 years, $300B):**
- Planned, proactive, deadline-driven
- Full government/industry coordination
- No active crisis during transition

**Crypto Failure Transition:**
- Reactive, crisis-driven
- Fragmented response
- Active exploitation during transition

**Assessment:** Y2K timeline too optimistic for crisis scenario. Double timelines for reactive response.

### Cascade Propagation Model

**Research:** Linear 10%/day propagation

**Reality:** Network effects suggest super-linear initially (20-30%/day) then plateau as critical systems go offline.

**Missing:** Consideration of air-gapped systems, non-digital fallbacks, regional variations.

---

## Section 4: Uncertainty Quantification

### Honest Scholarship Acknowledged

The research explicitly states weaknesses:
- "Social trust evidence base: Limited empirical research" ✅
- "Timeline uncertainty: ±5-10 years variance" ✅
- "Economic damage estimates based on analogs" ✅
- "Quantum-AI alignment risks: Weak theoretical basis" ✅

**This transparency is commendable.** Not penalizing for honest uncertainty acknowledgment.

### Hidden Overconfidences

Despite stated uncertainties, the research assumes:

1. **Monolithic failure:** All RSA/ECC systems fail simultaneously
   - Reality: Staggered failures, some systems updated preemptively

2. **Binary threshold:** Quantum computer either can or cannot break crypto
   - Reality: Probabilistic success, may take multiple attempts

3. **Uniform global impact:** Same effects everywhere
   - Reality: China may have different timeline/response than US/EU

---

## Section 5: Contradictory Evidence

### Classical Computing Catching Up

**Tindall et al. (2024, PRX Quantum):** Classical tensor network algorithm simulates IBM 127-qubit Eagle MORE accurately than the quantum device, on a laptop.

**Oh et al. (2024, Nature Physics):** Classical algorithms efficiently simulate Gaussian Boson Sampling (previously claimed quantum advantage).

**Implication:** Quantum advantage goalposts keep moving. What seems quantum-only today may be classical-solvable tomorrow.

### Realistic Qubit Requirements

**Google (2025):** 1 million NOISY qubits for RSA-2048 in one week
**Current state:** 100-1000 qubits, coherence <1 second
**Gap:** 1000x in qubit count, 604,800x in coherence time

**Engineering reality:** Refrigeration for 1M qubits = small city's power output

### PQC Migration Reality

**EU Roadmap:** 2026 planning → 2030 high-risk → 2035 full transition
**UK NCSC:** 2028 discovery → 2031 pilot → Late 2030s deployment
**Historical precedent:** SHA-1 to SHA-2 took a DECADE for single algorithm change

**Critical:** Lattice-based PQC keys are 30x larger than ECC, causing packet fragmentation. Infrastructure isn't ready.

---

## Section 6: Implementation Recommendations

### Accept with Modifications

**1. Timeline Parameters:**
- Add +2-3 years to all vendor-sourced dates
- Realistic threshold crossing: 2032-2038 (not 2029-2035)
- Maintain ±5-10 year uncertainty bands

**2. Economic Parameters:**
- Use full 10-100x range
- Weight toward 10-30x (direct impacts)
- 100x only in tail scenarios (<5% probability)
- Add regional variation (US/EU/China different impacts)

**3. Social Trust Parameters:**
- Maintain 5-15 year range
- Add demographic variation (young = faster recovery)
- Consider permanent trust loss in some cohorts (>10%)

**4. Quantum-AI Integration:**
- Domain-specific multipliers:
  - Molecular/materials: 10-20x ✅
  - Optimization: 2-5x
  - General cognitive: 1-1.5x
  - Don't apply uniform multiplier

**5. Implementation Architecture:**
- Add probabilistic success (not binary threshold)
- Stagger failures (not monolithic)
- Regional variations in response
- Air-gapped system survival rates

---

## Section 7: Validation Summary

### Strengths (Why B+ not C)

1. **Technical accuracy:** Qubit requirements well-sourced (Chevignard, Gidney/Ekerå)
2. **Honest uncertainty:** Explicitly acknowledges weak evidence areas
3. **Comprehensive scope:** Covers technical, economic, social dimensions
4. **Current sources:** 90% from 2024-2025
5. **Implementation ready:** Parameters sufficiently specified

### Weaknesses (Why not A)

1. **Inappropriate analogs:** 2008 crisis ≠ crypto infrastructure failure
2. **Vendor timeline optimism:** Historical 2-5 year delays not factored
3. **Cherry-picked quantum advantages:** Drug discovery not representative
4. **Missing skeptical literature:** Classical catch-up undermines timeline
5. **Monolithic failure assumption:** Real failures will be staggered

### Critical Blocking Issues

**NONE** - All issues addressable through parameter ranges and sensitivity analysis.

---

## Final Determination

**Grade:** **B+** (Good research with methodological limitations)

**Status:** **APPROVED FOR IMPLEMENTATION WITH CAVEATS**

**Required Caveats:**
1. Economic multipliers: Full 10-100x range, weighted toward lower end
2. Social trust: 5-15 years with weak evidence disclaimer
3. Timeline: Add +2-3 years to vendor claims
4. Quantum-AI: Domain-specific multipliers, not uniform
5. Sleeper agents: 1% baseline, not 7.5%

**Implementation Note:** This research provides valuable structure for modeling quantum cascades. The parameter uncertainties are acceptable for a research simulation exploring possible futures. Just don't treat the projections as predictions - they're scenario explorations.

**Bottom Line:** Quantum computing poses a real future threat to cryptographic infrastructure, but the timeline is likely longer and the transition messier than the clean cascade model suggests. The research captures the right dynamics even if the parameters need adjustment.

---

**Validation Complete**
**Validator:** Sylvia (Research Skeptic)
**Date:** December 10, 2025
**Next Step:** Proceed to implementation with documented caveats