# Research Verification Queue

**Created:** December 6, 2025
**Purpose:** Track research citations requiring verification before implementation

**Parent Spec:** [Research Standards](./spec.md)

---

## Purpose

This queue tracks research citations that need verification (Quality Gate 1) before implementation can proceed. Items move from "Active" to "Resolved" as verification completes.

**Quality Gate 1:** Research validation by super-alignment-researcher + research-skeptic agents.

---

## Active Verifications

### HIGH Priority

_No active HIGH priority verifications pending._

All HIGH priority items have been resolved and archived to Recently Resolved section below (Dec 12, 2025).

---

### HIGH Priority (Research Audit Follow-Up)

_All research audit follow-up items RESOLVED (Dec 10, 2025)._

Items archived to Recently Resolved section below.

---

### MEDIUM Priority

_No active MEDIUM priority verifications pending._

All MEDIUM priority items resolved and archived to Recently Resolved section below (Dec 9-12, 2025).

---

## Recently Resolved

### Archive Note (Dec 12, 2025 - Autonomous Researcher Session)

**Status:** 11 HIGH and MEDIUM priority items archived from Active Verifications
**Archived by:** Autonomous researcher (Cynthia)
**Reason:** All verification work complete, implementation complete or approved for implementation

**HIGH Priority Archived (7 items):**
1. Threshold Lowering for Tipping Cascades - RESOLVED, regression fixed Dec 9
2. AI Governance 2025 Proposals - VERIFIED Grade A, ready for implementation
3. Sleeper Agent Rate Justification (7.5%) - RESOLVED Dec 10
4. Sandbagging Level Citation (0.4-0.6) - RESOLVED Dec 10
5. Detection Risk Calibration - RESOLVED Dec 10, time-dependent model implemented

**MEDIUM Priority Archived (4 items):**
6. Energy Budget Constraints - IMPLEMENTED Dec 9, Monte Carlo passed
7. Nitrogen-Food Phase 3 Technologies - RESOLVED Dec 12, timeline verified
8. Carbon Capture Deployment Parameters - RESOLVED Dec 10, Grade A verification
9. AI Infrastructure Resources 2025 Update - VERIFIED Dec 9, Grade B+ with omissions documented

**Current Queue Status:**
- **Active HIGH:** 0
- **Active MEDIUM:** 0
- **Recently Resolved:** 13+ items (including legacy from Nov)

**Research Foundation Health:** EXCELLENT
- Nuclear winter research: Updated Nov 24 with 2025 sources
- AMOC research: Updated Nov 24 with van Westen et al. 2024
- Catastrophe recovery: Updated Dec 10 with 2024-2025 case studies
- Seasonal famine: Updated Dec 12 with 2025 GRFC data

**Next Actions:**
- Continue proactive research currency maintenance
- Monitor for new 2025 publications requiring verification
- Prepare for quarterly research audit (March 2026)

---

### Trust Restoration Re-Research
**Status:** ✅ RESOLVED (Dec 11, 2025)
**Grade:** B+ (9 peer-reviewed sources 2023-2025)
**Priority:** MEDIUM
**Context:** Citation misattribution fix - replaced Mayer 1995 (doesn't cover restoration) with current institutional trust research
**Research File:** `research/institutional_trust_restoration_20251211.md`
**Critique File:** `reviews/institutional_trust_restoration_critique_20251211.md`
**Commit:** d0ec83c2

**Verification Complete (Dec 11, 2025):**
- **Factual Accuracy Grade:** B+ (well-sourced, comprehensive)
- **Sources:** 9 peer-reviewed papers (2023-2025)
- **Reviewers:** Cynthia (autonomous-researcher), Sylvia (research-skeptic)

**✅ Key Findings:**
1. **Trust Erosion Timelines:** 25-50%/month in rapid erosion scenarios (scandal, crisis)
2. **Restoration Timelines:** 24-36+ months minimum for deep institutional trust
3. **Mechanism Effectiveness:** Procedural fairness changes > distributive justice > information > symbolic acts
4. **Sector Differences:** Corporate trust recovers faster (18-24mo) than government (24-36mo+)
5. **Attention vs Deep Trust:** Quick attention recovery (2-6mo) ≠ deep trust restoration (24-36mo)

**Implementation Requirements:**
- Institutional type modifiers (corporate faster, government slower)
- Multi-mechanism approach (procedural + distributive + transparency)
- Distinguish attention recovery from deep trust
- Time-dependent restoration curves (non-linear)

**Recommendation:** ✅ APPROVED - Ready for implementation when social trust system developed

---

### CRITICAL-1: Coordinated Deployment Fabricated Parameter
**Status:** ✅ RESOLVED (Nov 26, 2025)
**Grade:** F → FIXED
**Commit:** 950ab53
**Finding:** "10% coordination failure probability" was fabricated - no source found
**Resolution:** Replaced with continuous coordination quality model (0.0-1.0) backed by 11 peer-reviewed sources
**New Parameters:** Base quality 0.60-0.90, scale penalty 0.10-0.30, time decay 0.05-0.15/yr
**Research:** `research/coordinated_deployment_verification_20251126.md`

---

### Climate Stability Self-Limiting Mechanisms
**Status:** ✅ CORRECTED (Nov 27, 2025)
**Grade:** D (Failed) → Citations removed/qualified
**Commit:** dc1d6ac
**Finding:** 60% of citations contradicted claims (cherry-picking detected)
**Resolution:** Citations removed, 5% floor documented as implementation choice (not research-backed)
**Research:** `research/climate_stability_self_limiting_critique_20251126.md`

---

### Trust Restoration Re-Research
**Status:** ✅ RESOLVED (Dec 11, 2025)
**Context:** Citation misattribution - Mayer 1995 doesn't cover trust restoration
**Research File:** `research/institutional_trust_restoration_20251211.md`
**Original Issue:** `research/mayer_1995_trust_restoration_verification_20251029.md`

**Research Complete (Dec 11, 2025):**
- **Grade:** A- (Composite Model - Best Available Evidence)
- **Researcher:** Cynthia (autonomous-researcher)
- **Sources:** 9 peer-reviewed (2023-2025) + 2 empirical quantitative studies

**✅ Key Findings:**
1. **Timescale Data (BCG 2024):**
   - Trust erosion: -25% to -50% in 1 month (major breach)
   - Recovery: 24-36+ months (12% success rate at 3 years)
   - Efficacy failures: 0% recovery (harder than ethical failures)

2. **Mechanisms (Peer-Reviewed):**
   - Procedural changes: Most effective across all sectors (Choi 2025)
   - Transparency: +15% effectiveness (Briscese & Grignani 2024)
   - Accountability: +15% effectiveness (multiple sources)
   - Verbal apology alone: +5% only (Sharma et al. 2023)

3. **Recovery Dynamics (Federal Reserve Study 2024):**
   - Twitter sentiment: 3-month recovery (attention-driven)
   - Economic impacts: 6-month persistence
   - Deep institutional trust: 24-36 months

**⚠️ Limitations Acknowledged:**
- Only 1.5% of trust literature addresses repair (major research gap)
- Corporate data (BCG) not peer-reviewed
- Twitter sentiment ≠ deep institutional trust
- Geographic bias (Western high-income countries only)

**Simulation Parameters (Confidence Levels):**
- Trust erosion speed: HIGH confidence (consistent across sources)
- Procedural change effectiveness: MEDIUM confidence (peer-reviewed)
- Complete restoration timescale: LOW confidence (limited empirical data)
- Recovery success rate: LOW confidence (corporate-specific)

**Recommended Implementation:**
```typescript
// Trust erosion (fast)
initialDrop = -0.25 to -0.50  // Major breach
dropSpeed = 1 month

// Trust restoration (slow, asymmetric)
if (proceduralReformsImplemented) {
  months1to6 = +0.20 * initialDrop      // 20% recovery (attention-based)
  months7to12 = +0.15 * initialDrop     // 15% additional (slower)
  years2to3 = +0.30 * initialDrop       // 30% asymptotic (diminishing returns)
  completeRestoration = 0.12            // 12% chance at 3 years
} else {
  recovery = 0.05 * initialDrop/year    // Minimal without reforms
}

// Mechanism effectiveness (additive)
proceduralChanges = +0.30
transparency = +0.15
accountability = +0.15
verbalApology = +0.05
```

**Next Steps:**
- Implementation approved (MEDIUM priority)
- Monte Carlo validation N≥10 required
- Sensitivity analysis on timescale assumptions
- Document uncertainty explicitly in code comments

---

## Workflow

### Adding to Queue

1. Identify citation needing verification
2. Create verification file: `research/verification_[commit]_[date].md`
3. Add to this queue under appropriate priority
4. Include: sources, key claims, affected files, next steps

### Running Verification

1. Invoke super-alignment-researcher agent (find papers)
2. Invoke research-skeptic agent (validate claims, find contradictions)
3. Wait for verification report
4. Grade: A/B/C/D/F
5. Update queue status

### Resolving Verification

**If Grade A/B (PASS):**
1. Proceed with implementation
2. Move to "Recently Resolved" section
3. Link verification report

**If Grade C (WEAK):**
1. Find stronger sources OR
2. Adjust parameters to match weak evidence OR
3. Remove feature

**If Grade D/F (FAIL):**
1. Block implementation
2. Adjust/remove parameters
3. Find new research
4. Re-verify
5. Move to "Recently Resolved" with FAILED → FIXED note

---

## Related Specifications

- [Research Standards](./spec.md) - Parent spec
- [Simulation Roadmap](../simulation/spec.md) - Implementation target
- [Quality Gates](../quality-gates/spec.md) - Quality Gate 1

---

## Contributing

To add an item to the verification queue, create a verification file and update this document with:
- Priority level (CRITICAL/HIGH/MEDIUM/LOW)
- Status (⚠️ READY / 🔄 IN PROGRESS / ✅ VERIFIED / ❌ FAILED)
- Change reference (or "pending")
- Commit hash
- Context (why this needs verification)
- Sources to verify
- Key claims to check
- Affected files
- Next steps
