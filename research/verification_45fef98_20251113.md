# Research Verification Spec: AI Governance International Coordination

**Commit:** 45fef98082b7c902646af603f7e319e10e403e50
**Date:** November 13, 2025
**Research File:** research/ai_governance_international_coordination_2023_2025.md
**Status:** VERIFICATION REQUIRED (both citation existence and claim accuracy)

---

## Overview

The research file documents international AI governance coordination from 2023-2025, providing parameters for modeling government cooperation in the simulation. **These parameters are NOT YET IMPLEMENTED in code** - this is pure research documentation.

The file contains specific quantitative claims that need **two-layer verification**:
1. **Citation existence:** Do the cited sources actually exist?
2. **Claim verification:** Do the sources support the specific claims made?

---

## Critical Claims Requiring Verification

### 1. Bletchley Declaration (November 2023)

**Location:** research/ai_governance_international_coordination_2023_2025.md:41-71

**Claims:**
- ✅ **Event existence:** UK AI Safety Summit occurred Nov 1-2, 2023 at Bletchley Park
- ✅ **Signatories:** 28 countries + European Union signed declaration
- ⚠️ **Specific commitments:** "Substantial risks from potential intentional misuse or unintended issues of control"
- ⚠️ **Participation list:** US, UK, China, EU, Japan, South Korea, Singapore, India, Brazil, Saudi Arabia, etc.

**Citation Status:**
- **Source:** UK Government official announcement (November 2023)
- **URL claimed:** https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration
- **Verification needed:**
  - Does URL exist and contain full declaration text?
  - Does declaration use exact quote about "intentional misuse"?
  - Are all 28 countries listed correctly?

**Confidence:** HIGH (major international event) but needs URL verification

---

### 2. Simulation Parameters (Most Critical)

**Location:** research/ai_governance_international_coordination_2023_2025.md:339-407

#### Cooperation Propensity

**Claims:**
- High-capacity democracies: **0.75**
- Tech-leading states: **0.70**
- Major emerging powers: **0.55**
- Authoritarian states: **0.35**
- Low-capacity states: **0.20**

**Status:** DERIVED FROM REASONING, needs peer-reviewed research backing

#### Enforcement Strength

**Claims:**
- Pre-crisis: **0.15** (voluntary)
- Post-minor-incident: **0.40**
- Post-catastrophic: **0.80**

**Status:** ANALOGICAL REASONING from Montreal Protocol, needs validation

#### Implementation Lag

**Claims:**
- Announcement → operational: **6 months**
- Commitment → compliance: **12 months**
- Treaty negotiation: **18-24 months**

**Status:** EMPIRICALLY GROUNDED but needs verification

#### Defection Risk

**Claims:**
- Voluntary regime: **0.35**
- Binding regime: **0.10**

**Status:** REASONING-BASED, needs research support

---

## Verification Steps

1. **WebSearch verification** of all government documents and summit outcomes
2. **Research-skeptic review** for contradictory evidence  
3. **Parameter derivation validation** (how were specific numbers calculated?)
4. **Historical analogy verification** (Montreal Protocol, climate governance)

---

## Implementation Status

**CRITICAL: Parameters NOT YET IMPLEMENTED in code.**

Before implementation:
1. Citations must be verified
2. Research-skeptic review (Quality Gate 1)
3. Parameter derivation must be explicit
4. Integration with governanceQuality.ts designed

---

**Created:** November 13, 2025
**Agent:** historian (wiki-documentation-updater)
**Purpose:** Research verification spec for orchestrator handoff
