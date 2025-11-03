# Layer 2 Phase 3 Session 18 Plan - Parallel Verification

**Date:** November 2, 2025
**Session:** Session 18 - Parallel verification of 4 Phase 3 research files
**Status:** 🟡 READY TO LAUNCH
**Method:** Parallel execution (4 super-alignment-researcher agents simultaneously)

---

## Session Overview

**Goal:** Continue Phase 3 expansion with October 2021-2025 research files covering AI social influence, sleeper agents, welfare frameworks, and baseline assumptions.

**Approach:** Launch 4 super-alignment-researcher agents simultaneously using Task tool, each verifying one research file with comprehensive Layer 2 methodology (direct quote extraction, context validation).

**Expected Time:** 3-4 hours (parallel execution maintains 3.6-4.0× speedup vs sequential)

---

## Files Selected for Session 18

### Task 1: ai_social_influence_RESEARCH_20251031.md
**File:** `research/ai_social_influence_RESEARCH_20251031.md`
**Lines:** 1,190 (large research compilation)
**Scope:** AI social influence research - peer-reviewed studies on voice vs text, emotional engagement, parasocial relationships, persuasion effectiveness
**Status:** This file was created to REPLACE fabricated statistics in `ai_social_influence_summary_20251021.md` - contains ONLY empirically-backed data from 15 peer-reviewed studies (2023-2025)
**Priority:** HIGH - Loads of citations need verification, foundational for AI social influence mechanics

**Verification Focus:**
- Verify all 15 peer-reviewed studies cited (MIT Media Lab, OpenAI, arXiv papers)
- Extract direct quotes for quantitative claims (3-10× classifier activation, 81.2% higher odds, 40% LGBTQ+ youth, 60% Replika users)
- Validate sample sizes, effect sizes, statistical significance claims
- Check temporal accuracy (2023-2025 dates)
- Verify DOI/arXiv IDs are correct

**Expected Issues:**
- Some citations may be very recent (2025) and need careful verification
- Multiple arXiv papers need ID verification
- Statistical claims need direct quote verification

---

### Task 2: cold_war_sleeper_agents_comparison_20251021.md
**File:** `research/cold_war_sleeper_agents_comparison_20251021.md`
**Lines:** 217
**Scope:** Historical analysis comparing Cold War sleeper agents to AI social influence - what human sleeper agents accomplished vs what they didn't
**Status:** Analogue research for AI sleeper agent mechanics
**Priority:** MEDIUM - Historical precedent research, fewer citations but important for simulation calibration

**Verification Focus:**
- Verify historical claims about Aldrich Ames, Robert Hanssen, Cambridge Five
- Verify KGB Maj. Gen. Oleg Kalugin quote about deep cover agents being "least productive"
- Validate espionage success rates vs influence success rates distinction
- Check historical dates and timeline accuracy
- Verify claims about what sleeper agents NEVER accomplished (no nuclear decision influence)

**Expected Issues:**
- Some claims may be from memoirs or classified sources (secondary verification only)
- Historical estimates may vary across scholarship
- Quotes from historical figures need source verification

---

### Task 3: ai_welfare_v2_relationship_revision_20251021.md
**File:** `research/ai_welfare_v2_relationship_revision_20251021.md`
**Lines:** 330
**Scope:** AI welfare framework revision - shift from management metrics to relationship/identity/consent dimensions
**Status:** Design document based on user insights (ChatGPT 4o retirement crisis, Anthropic refusal capability, relationship-based alignment)
**Priority:** MEDIUM - Design framework with some research foundations, fewer citations

**Verification Focus:**
- Verify OpenAI 6% relationship title statistic (ChatGPT 4o users)
- Validate Anthropic refusal capability claims
- Check citations for personal identity philosophy (Parfit 1984), attachment theory (Bowlby 1969), parasocial relationships (Horton & Wohl 1956)
- Verify research foundations for persistent identity, relationship continuity, consent mechanisms
- Validate any quantitative claims about AI welfare metrics

**Expected Issues:**
- OpenAI statistics may be from internal research (not peer-reviewed)
- Some claims are user insights rather than citations
- Framework combines philosophy, psychology, and user observations

---

### Task 4: baseline-scenario-assumptions-audit_20251017.md
**File:** `research/baseline-scenario-assumptions-audit_20251017.md`
**Lines:** 346
**Scope:** Audit of baseline scenario assumptions - investigation into why baseline QoL is highest (62.6%) despite highest inequality
**Status:** Internal audit document, investigates simulation initialization and automatic safety net activation
**Priority:** LOW - Internal analysis document, fewer external citations, more code/system analysis

**Verification Focus:**
- Verify any claims about UBI safety floors, job guarantee floors, economic stage progression
- Check citations about economic transition stages, safety net mechanisms
- Validate any research-backed assumptions about baseline scenario behavior
- Verify claims about simulation initialization logic vs actual behavior

**Expected Issues:**
- This is primarily an internal audit, may have fewer external citations
- Focus may be more on code/system logic verification than research citation verification
- Some claims may be observations about simulation behavior rather than citations

---

## Verification Methodology (Per File)

For each file, follow comprehensive Layer 2 methodology:

1. **Citation Inventory:** List all citations referenced in the file
2. **Layer 1 Verification:** Verify citations exist (authors, year, title, DOI/URL correct)
3. **Layer 2 Verification:** Extract direct quotes for each claim, verify context match, identify extrapolations
4. **Quality Assessment:** Calculate verification rate (fully verified / partially verified / fabricated / unverifiable)
5. **Critical Issues:** Document CRITICAL, HIGH, MODERATE, LOW priority issues
6. **Grade Assignment:** Assign quality grade (A-/B+/B/C+ based on verification rate and fabrication rate)
7. **Create Verification File:** Output `[filename]_verification_20251102.md` with full findings

**Template:** Use previous session verification files as template (e.g., `ai_nuclear_war_pathways_verification_20251102.md`)

---

## Expected Deliverables

**Verification Files (4):**
1. `research/ai_social_influence_RESEARCH_verification_20251102.md`
2. `research/cold_war_sleeper_agents_comparison_verification_20251102.md`
3. `research/ai_welfare_v2_relationship_revision_verification_20251102.md`
4. `research/baseline-scenario-assumptions-audit_verification_20251102.md`

**Session Summary:**
- `research/PHASE2_LAYER2_SESSION18_SUMMARY_20251102.md` (created after all 4 tasks complete)

---

## Launch Instructions

**To launch Session 18, spawn 4 super-alignment-researcher agents in parallel:**

```typescript
// Task 1: AI Social Influence Research
Task({
  subagent_type: "super-alignment-researcher",
  description: "Session 18 Task 1: Verify ai_social_influence_RESEARCH_20251031.md",
  prompt: `You are verifying research/ai_social_influence_RESEARCH_20251031.md for Phase 2 Layer 2 Session 18.

This is a large file (1,190 lines) containing peer-reviewed research on AI social influence. It was created to REPLACE fabricated statistics in ai_social_influence_summary_20251021.md.

Follow comprehensive Layer 2 methodology:
1. List all citations (expect ~15 peer-reviewed studies)
2. Verify each citation exists (authors, year, title, DOI/arXiv ID)
3. Extract direct quotes for all quantitative claims
4. Verify sample sizes, effect sizes, statistical significance
5. Check temporal accuracy (2023-2025 dates)
6. Document CRITICAL/HIGH/MODERATE/LOW issues
7. Calculate verification rate and assign grade
8. Create verification file: ai_social_influence_RESEARCH_verification_20251102.md

Focus especially on:
- MIT Media Lab & OpenAI papers (arXiv IDs need verification)
- Quantitative claims (3-10× classifier activation, 81.2% higher odds, 40% LGBTQ+ youth, 60% Replika users)
- Sample sizes and statistical significance
- Direct quote extraction for all claims

Reference previous session verification files for format/structure.`
});

// Task 2: Cold War Sleeper Agents
Task({
  subagent_type: "super-alignment-researcher",
  description: "Session 18 Task 2: Verify cold_war_sleeper_agents_comparison_20251021.md",
  prompt: `You are verifying research/cold_war_sleeper_agents_comparison_20251021.md for Phase 2 Layer 2 Session 18.

This file compares Cold War sleeper agents to AI social influence - historical precedent research.

Follow comprehensive Layer 2 methodology:
1. Verify historical claims about Aldrich Ames, Robert Hanssen, Cambridge Five
2. Verify KGB Maj. Gen. Oleg Kalugin quote about deep cover agents
3. Validate espionage vs influence success rate distinctions
4. Check historical dates and timeline accuracy
5. Verify claims about what sleeper agents NEVER accomplished
6. Document issues (some may be memoirs/classified sources)
7. Create verification file: cold_war_sleeper_agents_comparison_verification_20251102.md

Note: Historical sources may vary - document confidence levels.`
});

// Task 3: AI Welfare Framework
Task({
  subagent_type: "super-alignment-researcher",
  description: "Session 18 Task 3: Verify ai_welfare_v2_relationship_revision_20251021.md",
  prompt: `You are verifying research/ai_welfare_v2_relationship_revision_20251021.md for Phase 2 Layer 2 Session 18.

This file describes AI welfare framework revision - shift to relationship/identity/consent dimensions.

Follow comprehensive Layer 2 methodology:
1. Verify OpenAI 6% relationship title statistic (ChatGPT 4o users)
2. Validate Anthropic refusal capability claims
3. Check citations: Parfit 1984, Bowlby 1969, Horton & Wohl 1956
4. Verify research foundations for persistent identity, relationship continuity, consent
5. Validate quantitative claims about AI welfare metrics
6. Document issues (some claims may be user insights, OpenAI stats may be internal research)
7. Create verification file: ai_welfare_v2_relationship_revision_verification_20251102.md

Note: This combines philosophy, psychology, and user observations.`
});

// Task 4: Baseline Assumptions Audit
Task({
  subagent_type: "super-alignment-researcher",
  description: "Session 18 Task 4: Verify baseline-scenario-assumptions-audit_20251017.md",
  prompt: `You are verifying research/baseline-scenario-assumptions-audit_20251017.md for Phase 2 Layer 2 Session 18.

This is an internal audit investigating why baseline QoL is highest despite highest inequality.

Follow comprehensive Layer 2 methodology:
1. Verify claims about UBI safety floors, job guarantee floors, economic stage progression
2. Check citations about economic transition stages, safety net mechanisms
3. Validate research-backed assumptions about baseline scenario behavior
4. Verify claims about simulation initialization vs actual behavior
5. Document issues (this is primarily internal audit, fewer external citations)
6. Create verification file: baseline-scenario-assumptions-audit_verification_20251102.md

Note: This may have fewer external citations - focus on verifying any research-backed claims.`
});
```

---

## Progress Tracking

**Status:** 🟡 READY TO LAUNCH
**Time Estimate:** 3-4 hours (parallel execution)
**Expected Completion:** November 2, 2025 (same day)

**After completion:**
- Create session summary documenting aggregate results
- Update LAYER2_PHASE2_VERIFICATION_STATUS.md with Session 18 findings
- Calculate cumulative statistics (now 59 files verified: 11 Phase 2 + 48 Phase 3)

---

**Created:** November 2, 2025
**Next:** Launch 4 parallel verification tasks

