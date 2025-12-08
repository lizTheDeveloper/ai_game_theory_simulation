# Research Audit Action Checklist - December 8, 2025

**Based on:** `research_audit_20251208.md`
**Current Grade:** C+ (53.4% sources from 2024-2025)
**Target Grade:** B (65% sources from 2024-2025)
**Deadline:** March 8, 2026 (3 months)

---

## Week 1 Actions (CRITICAL)

### [ ] Action 1: Archive Obsolete Legacy Files

**Create legacy directory and manifest:**
```bash
mkdir -p /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/legacy
```

**Files to archive (>20 years old):**
- [ ] `PDF_MANIFEST.md` (1970, 55 years)
- [ ] `PHASE2_LAYER2_SESSION18_PLAN_20251102.md` (1969, 56 years)
- [ ] `RESEARCH_REQUESTS_validation_20251114.md` (1984, 41 years)
- [ ] `RESEARCH_STATUS_20251115.md` (1981, 44 years)
- [ ] `AUTONOMOUS_RESEARCHER_SESSION_20251203_2030.md` (1981, 44 years)
- [ ] `PHASE2_LAYER2_SESSION6_SUMMARY_20251031.md` (1991, 34 years)
- [ ] `MISATTRIBUTIONS_TRIAGE.md` (1993, 32 years)
- [ ] `GOD_MODE_ANALYSIS_model_mechanisms_20251110.md` (2000, 25 years)
- [ ] `CRISIS_MITIGATION_RESEARCH_CRITIQUE_20251029.md` (2001, 24 years)

**Create manifest:**
- [ ] Write `LEGACY_RESEARCH_MANIFEST.md` documenting:
  - What was archived and when
  - Why it was archived (source age)
  - Where to find updated research on same topics
  - Preservation rationale (historical context)

**Impact:** Removes 9 files from corpus, reduces legacy burden

---

### [ ] Action 2: Implement HIGH-7 Conditional Stability Floor

**Research complete:** `research/high7_conditional_stability_floor_20251205.md`
**Research quality:** 100% from 2024-2025, 12 peer-reviewed sources

**Implementation requirements:**
1. [ ] Add conditional logic to climate stability floor:
   - Apply 5% floor IN Paris Agreement success scenarios
   - Remove floor IN tail risk/unmitigated warming scenarios
2. [ ] Trigger condition: Temperature trajectory (below/above 2°C by 2050)
3. [ ] Document rationale in code comments (cite Wunderling 2024, Boers 2025)

**Files to modify:**
- `src/simulation/engine/phases/ClimateSystemPhase.ts`
- OR create dedicated `ConditionalStabilityPhase.ts`

**Validation:**
- [ ] Monte Carlo runs show different outcomes in Paris success vs failure
- [ ] God mode analysis confirms floor applies only when appropriate

**Impact:** Aligns simulation with 2024-2025 research consensus (64% of tipping interactions destabilizing)

---

### [ ] Action 3: Create Legacy Research Manifest

**File:** `research/LEGACY_RESEARCH_MANIFEST.md`

**Contents:**
```markdown
# Legacy Research Manifest

**Created:** 2025-12-08
**Purpose:** Track archived research, preserve historical context

## Archived Files

### 2025-12-08 Archival (Pre-2002 Sources)

| File | Archived Date | Latest Source | Reason | Updated Research |
|------|---------------|---------------|--------|------------------|
| PDF_MANIFEST.md | 2025-12-08 | 1970 (55y) | Obsolete citation index | See UPDATE_QUEUE.md for current sources |
| ... | ... | ... | ... | ... |

## Preservation Rationale

These files are NOT deleted because:
1. Historical context preservation
2. Evolution of research understanding
3. Audit trail for decisions made
4. May contain conceptual insights still valid

## Finding Updated Research

For topics covered in archived files, see:
- `UPDATE_QUEUE.md` - Active research references
- `research/` - Current research files (filtered by date)
- OpenSpec verification queue - Active validation work
```

**Impact:** Preserves institutional memory while cleaning active corpus

---

## Week 2-4 Actions (HIGH PRIORITY)

### [ ] Action 4: Refresh Catastrophe Recovery Research

**File to update:** `catastrophe-recovery-analysis-phase1c_20251017.md`
**Current sources:** Latest from 2008 (17 years old)
**Status:** ACTIVELY USED in nuclear winter implementation

**Research needed (2024-2025 sources):**
1. [ ] Nuclear winter crop yield modeling
   - Search: "nuclear winter agriculture" + "2024 OR 2025"
   - Journals: Nature Food, Environmental Research Letters, Earth's Future
2. [ ] Food system cascade dynamics
   - Search: "food security shocks" + "cascade" + "2024 OR 2025"
   - Journals: Nature Sustainability, Global Food Security
3. [ ] Famine mortality timelines
   - Search: "famine mortality" + "timeline" + "2024 OR 2025"
   - Sources: FEWS NET, WFP reports, peer-reviewed epidemiology

**Deliverable:** `catastrophe_recovery_timescales_20251208.md` with 2024-2025 sources

**Impact:** Grounds active nuclear winter mechanics in recent research

---

### [ ] Action 5: Update AMOC Collapse Timeline

**Current implementation:** Armstrong McKay 2022 (50-250 year transition)
**2024 update available:** Ditlevsen & Ditlevsen 2024 (2025-2095 tipping window)

**Research file:** `research/amoc_tipping_point_2024_2025_update.md` (already exists!)

**Implementation:**
1. [ ] Review existing research file
2. [ ] Update tipping element definition in `src/types/tipping-points.ts`
3. [ ] Modify AMOC threshold distribution:
   - Current: Broad uncertainty (50-250 years)
   - Update: Narrower window (2025-2095, 70-year span)
4. [ ] Add citation in code comments

**Validation:**
- [ ] Monte Carlo shows narrower AMOC collapse timeline
- [ ] Earlier average collapse year (more urgent)

**Impact:** More accurate representation of AMOC risk (Science Advances 2024 consensus)

---

### [ ] Action 6: Nuclear Winter Agricultural Research

**Goal:** Find 2024-2025 research on agricultural impacts of nuclear winter

**Search strategy:**
1. [ ] Google Scholar: "nuclear winter crop yield 2024"
2. [ ] Check Nature Food, Environmental Research Letters (2024-2025 issues)
3. [ ] Review IPCC AR6 WG2 citations for updates
4. [ ] Check Rutgers climate modeling group (Robock et al.)

**Deliverable:** New research file or update to existing catastrophe recovery file

**Impact:** Validates or updates nuclear winter agricultural cascade parameters

---

## Month 2-3 Actions (MEDIUM PRIORITY)

### [ ] Action 7: Systematic Citation Refresh (2022-2023 → 2024-2025)

**Target:** Replace 2,550 citations from 2022-2023 with 2024-2025 equivalents

**Strategy:**
1. [ ] Identify high-value targets (AI capabilities, climate impacts, tech deployment)
2. [ ] Prioritize actively used files (not session summaries)
3. [ ] Search for 2024-2025 replacements
4. [ ] Update citations + parameter values if changed

**Focus domains:**
- [ ] AI scaling laws (post-Chinchilla research)
- [ ] Climate tipping points (2024-2025 observation data)
- [ ] Technology deployment rates (updated empirical data)

**Goal:** Raise corpus currency from 53.4% → 65% (Grade B)

**Tracking:** Update UPDATE_QUEUE.md as citations are refreshed

---

### [ ] Action 8: Document Correlation Assumptions

**Issue:** Monte Carlo assumes independence of tipping thresholds
**Risk:** May underestimate compound cascade risks

**Action:**
1. [ ] Create `research/tipping_correlation_assumptions_20251208.md`
2. [ ] Document current assumption (independent sampling)
3. [ ] Search literature for multivariate tipping uncertainty studies
4. [ ] If found: Update sampling to include correlations
5. [ ] If not found: Document as known limitation

**Deliverable:** Either improved correlation model OR documented limitation

**Impact:** Transparent uncertainty quantification

---

## Quarter 2 Actions (ONGOING)

### [ ] Action 9: Establish Quarterly Refresh Cycle

**Goal:** Sustainable corpus maintenance (prevent future aging)

**Components:**
1. [ ] Automated flagging script
   - Scan research/ directory for YAML frontmatter
   - Flag files with `oldest_source > 3 years ago`
   - Generate UPDATE_QUEUE.md automatically
2. [ ] Quarterly audit schedule
   - March, June, September, December
   - Run script, manual validation, refresh prioritization
3. [ ] Refresh workflow
   - High-value files: Update with new research
   - Low-value files: Archive to legacy/
   - Session summaries: Keep as historical record

**Script location:** `scripts/auditResearchCurrency.ts` (already exists!)

**Validation:** Next audit (March 2026) shows improved currency

---

### [ ] Action 10: Monitor IPCC AR7 Preparation

**Timeline:** IPCC AR7 WG1 expected 2027-2028

**Action:**
1. [ ] Create monitoring queue for major consensus updates
2. [ ] Flag parameters to update:
   - Climate sensitivity (ECS)
   - Carbon budget
   - Tipping point thresholds
3. [ ] Document current IPCC AR6 values (baseline for comparison)

**File:** `research/IPCC_AR7_PREPARATION.md`

**Impact:** Smooth integration of major research updates when AR7 publishes

---

## Success Metrics

**Target for Next Audit (March 2026):**
- [ ] Currency: 65% from 2024-2025 (Grade B) - **CURRENT: 53.4%**
- [ ] Legacy burden: <20% of corpus >3 years old - **CURRENT: 35.4%**
- [ ] Automated flagging: Script operational
- [ ] Quarterly cycle: First full cycle complete

**Maintain Excellence:**
- [ ] New implementations: >90% currency (M-4/HIGH-7 standard)
- [ ] Peer-review rate: >95% - **CURRENT: 95%**
- [ ] Citation accuracy: >95% - **CURRENT: 96%**

---

## Progress Tracking

**Week 1 (Dec 8-14):**
- [ ] Legacy archival complete
- [ ] HIGH-7 implementation started
- [ ] Manifest created

**Week 2-4 (Dec 15 - Jan 4):**
- [ ] Catastrophe recovery updated
- [ ] AMOC timeline updated
- [ ] Nuclear winter research complete

**Month 2-3 (Jan 5 - Mar 8):**
- [ ] 50+ citations refreshed (2022-2023 → 2024-2025)
- [ ] Correlation assumptions documented
- [ ] Quarterly cycle operational

**Next Audit (March 8, 2026):**
- [ ] Grade B achieved (65% currency)
- [ ] Legacy burden reduced (<20%)
- [ ] Sustainable maintenance proven

---

**Checklist Created:** 2025-12-08
**Owner:** Cynthia (super-alignment-researcher) + Sylvia (research-skeptic validation)
**Status:** ACTIVE - Week 1 actions ready to execute
