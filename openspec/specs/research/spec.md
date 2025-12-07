# Research Standards Specification

**Created:** December 6, 2025
**Purpose:** Define research standards and citation verification requirements

**Parent Spec:** [Project](../project/spec.md)

---

## Purpose

Ensure all simulation mechanics are grounded in peer-reviewed research. This spec defines citation standards, verification workflows, and quality thresholds for research-backed parameter justification.

---

## Requirements

### Requirement: Peer-Reviewed Sources
All simulation mechanics SHALL be justified by peer-reviewed sources.

#### Scenario: Minimum Source Requirements
- WHEN implementing a new mechanic
- THEN it MUST have 2+ peer-reviewed sources
- AND sources MUST be from reputable journals or conferences
- AND 2024-2025 sources MUST be preferred (recency preference)
- AND arXiv preprints MAY be used if peer-reviewed alternatives unavailable

#### Scenario: Parameter Justification
- WHEN using a specific parameter value
- THEN it MUST be justified from research data
- AND mechanism description MUST explain how it works
- AND interaction map MUST show what it affects/is affected by
- AND expected timeline MUST be defined (early/mid/late game relevance)
- AND failure modes MUST be documented

### Requirement: Citation Verification
All research citations SHALL be verified before implementation.

#### Scenario: Two-Layer Verification
- WHEN a citation is made
- THEN Layer 1 MUST verify paper existence (DOI, correct journal, authors)
- AND Layer 2 MUST verify claim accuracy (does paper support specific parameter?)
- AND verification MUST be graded (A/B/C/D/F)

#### Scenario: Verification Grading
- WHEN verification is complete
- THEN Grade A MUST mean: Full support, directly stated in paper
- AND Grade B MUST mean: Partial support, extrapolation needed
- AND Grade C MUST mean: Weak support, tangential relevance
- AND Grade D MUST mean: Contradicts claim, cherry-picking detected
- AND Grade F MUST mean: Citation doesn't exist or completely fabricated

#### Scenario: Blocking Behavior
- WHEN verification returns Grade D or F
- THEN implementation MUST be blocked
- AND parameters MUST be adjusted or removed
- AND new research MUST be found

### Requirement: Research File Organization
Research findings SHALL be organized in `/research/` directory.

#### Scenario: Research Documentation
- WHEN research is completed
- THEN it MUST be saved to `research/[topic]_[date].md`
- AND it MUST include all citations with DOIs
- AND it MUST extract specific parameter values
- AND it MUST link to verification files (if verified)

#### Scenario: Verification Documentation
- WHEN citations are verified
- THEN verification MUST be saved to `research/verification_[commit]_[date].md`
- AND it MUST include layer 1 + layer 2 results
- AND it MUST assign grades (A/B/C/D/F)
- AND it MUST link back to the commit being verified

---

## Related Specifications

- [Project Roadmap](../project/spec.md) - Parent spec
- [Simulation Roadmap](../simulation/spec.md) - Implementation target
- [Research Verification Queue](./verification-queue.md) - Active verifications
- [Quality Gates](../quality-gates/spec.md) - Quality Gate 1 (research validation)

---

## Contributing

### Adding Research

1. Search academic databases (Google Scholar, Semantic Scholar, PubMed)
2. Prefer 2024-2025 sources
3. Extract specific parameter values
4. Document mechanisms and interactions
5. Save to `research/[topic]_YYYYMMDD.md`
6. Link from code comments

### Requesting Verification

1. Add item to [Research Verification Queue](./verification-queue.md)
2. Invoke super-alignment-researcher + research-skeptic agents
3. Wait for verification report
4. Address Grade D/F findings before implementation
