# Quality Gate 1 Verification: Quantum Computing Cascades Research

**Reviewer:** Sylvia (research-skeptic)
**Date:** December 10, 2025
**Document Reviewed:** `research/quantum_computing_cascades_20251210.md`
**Priority:** L-3 (LOW)

---

## Executive Summary

**GRADE: B-**

The research demonstrates solid technical grounding on quantum computing timelines and cryptographic vulnerability thresholds, with accurate citations to peer-reviewed sources. However, I found several concerns: one citation misattribution (error rate achievement), one source error ($7.1B cost attribution), cherry-picked optimistic timelines that exclude significant skeptic viewpoints, and weak evidence for social trust/economic cascade claims that rely heavily on extrapolation rather than empirical data.

**Verdict: CONDITIONAL PASS** - Proceed with implementation after addressing CRITICAL and HIGH issues below.

---

## Citation Verification

### Verified Accurate

| Claim | Source | Status | Notes |
|-------|--------|--------|-------|
| Gidney/Ekera 2019: 20M qubits, 8 hours for RSA-2048 | arXiv:1905.09749 | VERIFIED | Peer-reviewed in Quantum (2021) |
| Gidney 2025: <1M qubits | arXiv:2505.15917 | VERIFIED | Recent improvement |
| Chevignard 2024: 1,730 logical qubits | IACR 2024/222 | VERIFIED | Correct, but runtime caveat underemphasized |
| NIST PQC standards August 2024 | NIST official | VERIFIED | FIPS 203/204/205 published |
| IonQ roadmap: 1,600 (2028), 8,000 (2029), 80,000 (2030) | IonQ June 2025 | VERIFIED | From accelerated roadmap announcement |
| IBM Starling 2029: 200 logical qubits | IBM Quantum Blog | VERIFIED | Part of FTQC roadmap |
| Microsoft/Atom Computing: 28 logical qubits | IBM Press Release 2025 | VERIFIED | Correct milestone |

### Citation Errors Found

| Claim | Issue | Severity |
|-------|-------|----------|
| **$7.1B PQC transition cost attributed to NIST IR 8547** | This figure is from a White House OMB/ONCD report (July 2024), NOT NIST IR 8547. NIST IR 8547 provides migration guidance, not cost estimates. | **HIGH** |
| **QuEra 0.000015% error rate** | This achievement is attributed to Oxford scientists (reported by Live Science), not QuEra specifically. QuEra's 2025 achievements focused on algorithmic fault tolerance (100x overhead reduction), not this specific error rate. | **HIGH** |
| **IonQ/AstraZeneca 20x speedup dated as "2024"** | The announcement was June 2025, not 2024. The research file states "(2024)" but the demonstration was at ISC High Performance in Hamburg, June 2025. | **MEDIUM** |

---

## Contradictory Evidence & Alternative Perspectives

### CRITICAL: Timeline Skepticism Omitted

The research presents the 2028-2035 timeline as "consensus" but fails to address significant skeptic viewpoints:

**Contradictory Sources:**

1. **Jensen Huang (NVIDIA CEO, January 2025):** "Very useful quantum computers are likely 15-30 years away" - directly contradicts the 2028-2030 timeline for practical Shor's algorithm. This statement caused significant stock drops in quantum companies. ([IEEE Spectrum](https://spectrum.ieee.org/quantum-computing-skeptics))

2. **Scott Aaronson (UT Austin, 2024-2025):** "Skepticism was always warranted" regarding claims about quantum computing revolutionizing ML, optimization, and finance. Notes that most quantum advantage claims remain unproven in practice.

3. **Forrester Report (January 2025):** "Quantum computing advances but real-world impact remains elusive" - notes that despite billions in investment, total industry revenue reached only tens of millions in 2024.

4. **Most rigorous academic studies:** Suggest first commercial applications around 2035-2040, not 2028-2030.

**Assessment:** The research cherry-picks industry roadmaps (IBM, IonQ, Quantinuum) while ignoring systematic critiques. Industry roadmaps are marketing documents with optimism bias. The "realistic" scenario should incorporate skeptic timelines.

### HIGH: Chevignard Tradeoff Underemphasized

The research correctly cites 1,730 logical qubits but buries the critical caveat: Chevignard's approach requires "massive costs in time and repetitions... tens of trillions of operations for just one run" with ~40 runs needed on average.

The 4,099-qubit Beauregard approach has better runtime characteristics. The research should note that qubit count reduction comes with significant practical tradeoffs.

### HIGH: Error Correction Challenges Understated

The research mentions error rates improving but fails to address:

1. **Real-time decoding bottleneck:** Riverlane's 2025 QEC Report identifies completing error-correction rounds within 1 microsecond as a "crucial foundation" - still unsolved at scale
2. **Talent shortage:** Only 1,800-2,200 QEC specialists globally; 50-66% of quantum roles unfilled
3. **10-year training pipeline:** QEC specialists require up to 10 years of specialized training

These constraints directly affect the 2028-2030 timeline assumptions.

### MEDIUM: Social Trust Evidence Base

The research acknowledges "MEDIUM-LOW" confidence for social trust dynamics, but I must emphasize: there is essentially NO empirical research on large-scale cryptographic infrastructure failure effects. The MDPI 2024 study cited examines general digitalization trust, not crypto-specific failure scenarios.

Extrapolating from Equifax (143M records) to global RSA/ECC failure (billions affected) is a 4-5 order of magnitude leap with no empirical basis.

---

## Parameter Justification Assessment

### Well-Justified (Strong Evidence)

| Parameter | Quality | Notes |
|-----------|---------|-------|
| Logical qubits for Shor's (1,730-4,099) | STRONG | Multiple peer-reviewed sources, convergent estimates |
| Physical-to-logical ratio (4:1 to 1000:1) | STRONG | Range appropriately wide |
| RSA/ECC prevalence (85-95%) | STRONG | Industry surveys support this |
| PQC transition timeline (10-20 years) | STRONG | NIST official guidance |

### Adequately Justified (Reasonable Extrapolation)

| Parameter | Quality | Notes |
|-----------|---------|-------|
| Economic damage ($1-3T) | ADEQUATE | Based on 2008 crisis analogs; reasonable but speculative |
| Market confidence shock (-30% to -70%) | ADEQUATE | Historical analogs exist |
| Quantum-AI multipliers (5-20x) | ADEQUATE | IonQ demo provides one data point; generalization uncertain |

### Weakly Justified (Speculation/Extrapolation)

| Parameter | Quality | Notes |
|-----------|---------|-------|
| **Digital trust degradation (-50% to -80%)** | WEAK | No empirical basis; extrapolated from unrelated security breaches |
| **Trust recovery timeline (5-15 years)** | WEAK | Equifax comparison invalid at infrastructure scale |
| **Cascade propagation rate (10%/day exponential)** | WEAK | No empirical data; appears arbitrary |
| **Breakthrough probability (5-15% annual 2025-2030)** | WEAK | Not derived from any systematic analysis |
| **Detection-to-breaking window (<48 hours)** | QUESTIONABLE | Assumes immediate public disclosure; covert capability could persist for months |

---

## Systematic Bias Assessment

### Optimism Bias (SIGNIFICANT)

The research relies heavily on company roadmaps (IBM, IonQ, Quantinuum) which have systematic optimism bias for investor/PR purposes. Academic and skeptic viewpoints are underrepresented.

**Evidence:**
- Jensen Huang's 15-30 year estimate not mentioned
- Forrester's skeptical 2025 report not mentioned
- Rigorous academic timeline (2035-2040) mentioned only in passing

**Recommendation:** Adjust "realistic" timeline from 2028-2030 to 2030-2035 for Shor's practicality.

### Selection Bias (MODERATE)

The 20x speedup from IonQ/AstraZeneca is one cherry-picked result. The research does not address:
- How many quantum experiments showed NO speedup
- Publication bias toward positive results
- Whether this generalizes beyond Suzuki-Miyaura reactions

### Missing Alternative Perspectives

1. **Quantum-resistant classical alternatives:** Some problems quantum computers target may be solved by classical improvements before quantum advantage arrives
2. **Post-quantum crypto migration already underway:** Many organizations transitioning proactively, reducing crisis severity
3. **Harvest-now-decrypt-later defenses:** Air-gapping, forward secrecy already deployed for sensitive data

---

## Issues Summary

### CRITICAL (Must Fix Before Implementation)

1. **Correct $7.1B source attribution** - This is from White House OMB/ONCD report, not NIST IR 8547
2. **Correct QuEra error rate attribution** - This is Oxford scientists' achievement, not QuEra

### HIGH (Should Address)

1. **Add Jensen Huang/skeptic timeline perspective** - Include 15-30 year estimate as alternative scenario
2. **Emphasize Chevignard runtime tradeoffs** - 1,730 qubits requires tens of trillions of operations
3. **Note QEC talent shortage and bottlenecks** - Affects timeline feasibility
4. **Correct IonQ/AstraZeneca date** - June 2025, not 2024

### MEDIUM (Recommended)

1. **Acknowledge social trust extrapolation weakness** - Note explicitly this is speculation
2. **Add confidence intervals to breakthrough probabilities** - Current numbers appear arbitrary
3. **Include proactive PQC migration as mitigating factor** - Many orgs already transitioning

### LOW (Optional)

1. **Add more peer-reviewed sources for economic impacts** - Current reliance on industry reports
2. **Include failed quantum speedup attempts** - Balance the 20x success story

---

## Confidence Assessment

| Section | Grade | Confidence |
|---------|-------|------------|
| Quantum timeline mechanics | B+ | HIGH (after corrections) |
| Cryptographic vulnerability thresholds | A- | HIGH |
| Economic impact estimates | B- | MEDIUM |
| PQC transition parameters | A | HIGH |
| Social trust dynamics | C+ | LOW |
| Quantum-AI enhancement | B | MEDIUM |
| Cascade propagation mechanics | C | LOW |

**Overall Evidence Quality:** MEDIUM

---

## Recommendations for Implementation

If proceeding despite B- grade (conditional pass):

1. **Widen timeline uncertainty:** Use pessimistic scenario as baseline, not "realistic"
2. **Reduce social trust parameter confidence:** Mark as "SPECULATIVE" in code comments
3. **Add stochastic variance:** Breakthrough timing should have wider distributions
4. **Flag cascade propagation as hypothesis:** Not empirically validated

**Monte Carlo implications:** Expect high variance in outcomes. Trust-related cascades should be treated as exploratory modeling, not predictive.

---

## Final Verdict

**GRADE: B-**

**Status: CONDITIONAL PASS**

The research provides adequate foundation for LOW priority implementation, with the following conditions:

1. **MUST** correct citation errors (QuEra, NIST IR 8547, IonQ date)
2. **SHOULD** add skeptic perspectives on timeline (Jensen Huang, academic estimates)
3. **SHOULD** acknowledge weak evidence base for social trust/cascade parameters in implementation

The quantum computing timeline and cryptographic threshold research is solid. The economic and social cascade modeling is speculative and should be treated as exploratory rather than predictive.

---

## Sources Consulted for Verification

- [arXiv:1905.09749 - Gidney/Ekera 2019](https://arxiv.org/abs/1905.09749)
- [arXiv:2505.15917 - Gidney 2025 update](https://arxiv.org/abs/2505.15917)
- [IACR 2024/222 - Chevignard et al.](https://eprint.iacr.org/2024/222)
- [IEEE Spectrum - Quantum Computing's Hard, Cold Reality Check](https://spectrum.ieee.org/quantum-computing-skeptics)
- [Riverlane QEC Report 2025](https://www.riverlane.com/quantum-error-correction-report-2025)
- [White House PQC Report July 2024](https://bidenwhitehouse.archives.gov/wp-content/uploads/2024/07/REF_PQC-Report_FINAL_Send.pdf)
- [IonQ Accelerated Roadmap June 2025](https://ionq.com/blog/ionqs-accelerated-roadmap-turning-quantum-ambition-into-reality)
- [Live Science - Oxford 0.000015% error rate](https://www.livescience.com/technology/computing/scientists-hit-quantum-computer-error-rate-of-0-000015-percent-a-world-record-achievement-that-could-lead-to-smaller-and-faster-machines)
- [The Quantum Insider - IonQ/AstraZeneca June 2025](https://thequantuminsider.com/2025/06/09/ionq-speeds-quantum-accelerated-drug-development-application-in-partnership-with-astrazeneca-aws-and-nvidia/)

---

**Reviewer Signature:** Sylvia (research-skeptic)
**Quality Gate 1:** CONDITIONAL PASS (B-)
**Required Grade:** B+ or higher
**Action:** Implementation may proceed after HIGH priority corrections applied
