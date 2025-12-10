# Research Audit Quick Reference

**Date:** December 10, 2025
**Full Report:** `reviews/RESEARCH_SOURCE_VALIDATION_AUDIT_20251210.md`

---

## 🚨 CRITICAL ISSUES (Immediate Action Required)

### 1. Threshold Lowering Regression
- **Status:** BLOCKS PRODUCTION
- **Issue:** Research-backed fixes (Dec 8, commit b6771427) were REVERTED
- **Impact:** AMOC → Amazon interaction has wrong sign (destabilizing instead of stabilizing)
- **Action:** Restore Dec 8 corrections, investigate reversion
- **Owner:** Simulation Maintainer

### 2. Baseline Mortality Citations
- **Status:** BLOCKING CORRECTIONS PENDING (flagged Nov 24)
- **Issue:** "IHME GBD 2024" citation fabricated (doesn't exist)
- **Impact:** Academic integrity, but parameters ARE supported by other sources
- **Action:** Fix citations, verify CDR value corrections applied
- **Owner:** Research team

### 3. Threshold Magnitude Sourcing
- **Status:** NEEDS RE-SOURCING
- **Issue:** Wunderling et al. (2024) doesn't contain claimed magnitudes (0.2-0.4°C, 0.1-0.2°C)
- **Action:** Either find supporting papers OR document as modeling assumptions with ±50-100% uncertainty
- **Owner:** Climate researcher

---

## ✅ EXCELLENT RECENT WORK (No Action Needed)

### 1. AI Capability Parameters (Dec 10, 2025)
- Detection rate reconciliation: **Grade A**
- 99% AUROC vs 17.5% ensemble explained
- Conservative assumptions justified

### 2. Energy Systems (Dec 9-10, 2025)
- DAC energy corrected (400-800 TWh/Gt): **Grade A**
- Global electricity capacity: **Grade A** (IEA 2024)
- AI datacenter projections: **Grade B** (skeptic validated)

### 3. AMOC Timeline (Dec 10, 2025)
- 2024-2025 sources: **Grade A**
- Van Westen et al. Science Advances, JGR Oceans

---

## 📊 Overall Statistics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total files | 590 | - | - |
| Current (<3yr) | 383 (64.9%) | >95% | ⚠️ BELOW |
| Warning (3-5yr) | 26 (4.4%) | <5% | ✅ GOOD |
| Critical (>5yr) | 181 (30.7%) | 0% | 🚨 EXCEEDS |

**Trend:** ✅ IMPROVING (research quality up significantly vs Oct-Nov 2025)

---

## 🎯 Action Items by Priority

### CRITICAL (This Week)
1. Restore threshold lowering fixes
2. Verify baseline mortality corrections applied
3. Re-source threshold magnitudes

### HIGH (This Month)
1. Economic parameter audit
2. Triage 181 high-priority files (foundational vs empirical)
3. Parameter citation cross-check (top 50)

### MEDIUM (Next Month)
1. Update 26 warning-priority files
2. Create contradictory evidence database
3. Document annual review process

---

## 📈 Research Quality Grades

### By Domain

| Domain | Grade | Notes |
|--------|-------|-------|
| AI Capabilities | A | Excellent Dec 2025 updates |
| Energy Systems | A | Major DAC correction applied |
| Climate Tipping | D | Regression + magnitude sourcing issues |
| Mortality Baseline | D | Fabricated citation + systematic errors |
| Economic | C | Needs dedicated audit |
| AMOC Timeline | A | Current 2024-2025 sources |

### Overall: B- (Good with notable issues requiring correction)

---

## 🔍 Contradictory Evidence Found

1. **AMOC → Amazon:** Code assumes destabilizing, research shows stabilizing (2023-2025)
2. **DAC Energy:** Previous 4-10 TWh/Gt, corrected to 400-800 TWh/Gt
3. **Detection Rates:** Reconciled - 99% lab vs 17.5% field measure different contexts

**No other major contradictions** in recent 2024-2025 literature

---

## 💡 Process Improvements Recommended

1. **Pre-implementation verification:**
   - Layer 1: Citation exists
   - Layer 2: Citation contains value
   - Layer 3: Value within uncertainty

2. **Code review for research parameters:**
   - Flag threshold/rate/multiplier changes
   - Require research file reference
   - Prevent validated parameter regression

3. **Monte Carlo sensitivity:**
   - ±50% parameter variation
   - N≥10 runs
   - Verify outcome distributions

---

**Next Audit:** January 10, 2026
**Prepared by:** Cynthia (Autonomous Researcher)
