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

#### Threshold Lowering for Tipping Cascades
**Status:** ❌ FAILED - Grade D (CRITICAL Issues Found)
**Change:** (pending - needs change folder created)
**Commit:** cf49657
**Context:** Implements threshold lowering mechanism from mechanism audit gap
**Verification File:** `research/verification_cf49657_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Initial Grade:** C (super-alignment-researcher)
- **Final Grade:** D (research-skeptic downgrade)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**CRITICAL Issues Found:**
1. ❌ **AMOC → Amazon Sign Error:** Implementation claims AMOC collapse destabilizes Amazon, but 2023-2025 literature shows AMOC collapse **stabilizes** Amazon by increasing rainfall
2. ❌ **sqrt(progress) Scaling Backwards:** Front-loads effects when physics suggests acceleration over time (rate-induced tipping cascades)
3. ❌ **Missing Stabilizing Feedbacks:** Only destabilizing interactions modeled, creating catastrophization bias
4. ⚠️ **Quantitative Magnitudes Not Validated:** 0.10-0.30°C values are engineering estimates, not empirically derived
5. ⚠️ **0.5°C Cap Misattributed:** Not found in Wunderling et al. (2024)

**Blocking Issues (Must Fix Before Production):**
- Fix or remove AMOC → Amazon interaction (directional error)
- Add AMOC → Greenland stabilizing feedback (missing from model)
- Replace sqrt(progress) with linear or sigmoid scaling
- Document all magnitudes as "engineering estimates" not "research-backed"

**Next Steps:** Block implementation → Parameter revision → Re-verification required

---

#### AI Governance 2025 Proposals
**Status:** ✅ VERIFIED - Grade A (with implementation caveats)
**Change:** (pending - needs change folder created)
**Commit:** ff6ff02
**Context:** Global moratorium + US-China bilateral frameworks from arXiv 2025
**Verification File:** `research/verification_ff6ff02_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Factual Accuracy Grade:** A (all claims verified)
- **Policy Effectiveness:** CONDITIONAL (7 implementation challenges identified)
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

**✅ All Claims Verified:**
- Expert risk estimates: 10-25% (Amodei - Axios), 20% (Bengio - interview), 38% (Grace et al. 2024 survey N=2,778)
- Compute thresholds: 10²⁴ FLOP verified (below GPT-4 at 2.2×10²⁵)
- H100 specs: 990 TFLOP/s FP16 (conservative), ~$25-30k/unit
- Staged consolidation timeline verified
- Verification mechanisms documented

**⚠️ Implementation Challenges (Sylvia's Critique):**
1. **CRITICAL:** Threshold obsolescence (30+ models already exceed 10²⁴ FLOP)
2. **CRITICAL:** Distributed training evasion (DiLoCo multi-datacenter bypass)
3. **CRITICAL:** Open-weights proliferation (Llama 3.1 405B irreversibly released)
4. **HIGH:** Algorithmic efficiency (1.28x/year hardware + post-Chinchilla methods)
5. **HIGH:** Expert calibration gap (Superforecasters: 0.38% vs experts: 3-12% extinction)
6. **HIGH:** US-China compliance verification harder than nuclear
7. **MEDIUM:** Unintended consequences (incumbent lock-in, beneficial AI blocked)

**Simulation Implications:**
- Implement as **proposed governance scenarios** (not validated interventions)
- Model effectiveness decay: `base * 0.85^years * (1 - distributed) * (1 - open_weights)`
- Include 5 failure pathways: obsolescence, distributed bypass, algorithmic leap, open-weights, defection
- Use risk distributions (log-uniform 0.3%-40%) not point estimates

**Next Steps:** Implementation approved with failure pathway modeling → Add to government phase mechanics

---

### MEDIUM Priority

#### Nitrogen-Food Phase 3 Technologies
**Status:** ✅ VERIFIED - Grade B+ (citation cleanup needed)
**Change:** (pending - needs change folder created)
**Commit:** cd1e83a
**Context:** 6 new nitrogen reduction technologies added to tech tree
**Verification File:** `research/verification_cd1e83a_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** B+ (fundamentally sound, minor citation errors)
- **Reviewer:** Cynthia (super-alignment-researcher)

**✅ Verified Claims:**
- Nitroplast discovery (Coale et al. 2024 Science) - PERFECTLY cited
- Precision fermentation effectiveness (30-50%) - STRONG evidence from 2024-2025 sources
- Conservative parameter choices (using middle of ranges)
- Proper uncertainty labeling for speculative technologies

**⚠️ Citation Issues:**
- Zhang et al. 2020 "Frontiers in Plant Science" - NOT found in that journal
- Bai et al. 2024 - Unclear authorship (claim verified but source uncertain)
- Ke et al. 2021 - Paper NOT found
- Nitroplast timeline 10-20 years too optimistic (2040 in code, 2060s+ in literature)

**Next Steps:** Citation cleanup recommended but NOT blocking → Implementation approved

---

#### Carbon Capture Deployment Parameters
**Status:** ✅ VERIFIED - Grade B+ (critical energy error found)
**Change:** (pending - needs change folder created)
**Commit:** c52826e
**Context:** Comprehensive DAC research (625 lines, 12 sources, A+ quality)
**Research File:** `research/carbon_capture_deployment_timelines_2025.md`
**Verification File:** `research/verification_c52826e_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** B+ (accurate but contains 100× energy calculation error)
- **Reviewer:** Cynthia (super-alignment-researcher)

**✅ Verified Claims:**
- Mammoth nameplate capacity (36,000 tonnes/yr) - CONFIRMED by Climeworks
- Timeline projections (20-40 years) - SUPPORTED by IEA 2024
- Cost trajectory ($600-1,000 → $100-300) - VERIFIED by Climeworks Gen 3
- Implementation parameters (7yr activation, 30yr T_50) - RESEARCH-BACKED

**❌ CRITICAL ERROR:**
- **Energy requirements OFF BY 100×**
- Research claims: 4-10 TWh per 1 Gt/yr
- Peer-reviewed sources: **700-4,200 TWh per 1 Gt/yr** (MIT, Belfer, RMI)
- Impact: Simulation energy coupling needs immediate correction

**⚠️ Other Issues:**
- Mammoth operational status oversimplified (12/72 containers, <1% nameplate in year 1)
- Water requirements plausible but not verified in accessible sources

**Next Steps:** Fix energy calculation error → Add deployment risk variance → Implementation approved with corrections

---

#### AI Infrastructure Resources 2025 Update
**Status:** ✅ VERIFIED - Grade B+ (citation errors, claims accurate)
**Change:** (pending - needs change folder created)
**Commit:** dbf1438
**Context:** 2025 peer-reviewed sources for AI data center resource consumption
**Research File:** `research/ai-infrastructure-resources_20251019.md` (updated)
**Verification File:** `research/verification_dbf1438_20251207.md`

**Verification Complete (Dec 7, 2025):**
- **Grade:** B+ (high-quality research with accurate claims, minor citation errors)
- **Reviewer:** Cynthia (super-alignment-researcher)

**✅ Verified Claims:**
- Cornell/Nature Sustainability paper EXISTS (Xiao & You, 2025)
- Water: 731-1,125M m³/yr ✅
- Carbon: 24-44M tonnes CO₂/yr ✅
- IEA projections: 560B→1,200B liters ✅
- Geographic findings: windbelt optimal, Arizona 7.4% ✅
- Mitigation: 73% carbon, 86% water ✅
- 7-8× energy multiplier ✅

**⚠️ Citation Errors:**
- "Li et al." → Should be "Xiao & You"
- "MIT/Berkeley Lab" → MIT alone (Olivetti et al.)
- "183 TWh (2024)" → 176 TWh (2023) per Berkeley Lab

**Parameter Confidence:**
- Training water baseline (700K L): HIGH confidence
- Inference water (2-5M L/month): MEDIUM confidence
- Geographic multipliers (2.5×, 0.3×): Directionally correct, magnitudes estimated
- AI training multiplier (7.5×): HIGH confidence

**Next Steps:** Citation cleanup → Implementation approved with corrected author names

---

## Recently Resolved

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
