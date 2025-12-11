# Research Archive Cleanup: Implementation Tasks

**Feature:** Legacy Source Archival + Citation Refresh
**Priority:** MEDIUM
**Effort:** 2-3 hours

---

## Phase 1: Archive Legacy Files (60 minutes)

### 1.1 Prepare Archive Directory
- [ ] Create `/research/legacy/` directory
- [ ] Create `/research/legacy/README.md` with archival policy
- [ ] Document why files are archived (>5 years old, superseded by newer research)

### 1.2 Identify Files for Archival
- [ ] Use `research/UPDATE_QUEUE.md` to find 178 HIGH priority files
- [ ] Filter for sources >5 years old (2020 or earlier)
- [ ] Create list of files to archive with metadata

### 1.3 Execute Archival
- [ ] Move files to `/research/legacy/` preserving directory structure
- [ ] Update any references in active code/docs to point to archived location
- [ ] Create `archival_manifest.md` listing all moved files with dates/reasons

### 1.4 Verify Clean Separation
- [ ] Check no active simulation code references archived files
- [ ] Verify wiki/docs updated to reference current sources
- [ ] Run grep to find any stale references

---

## Phase 2: Refresh AI Safety Citations (45 minutes)

### 2.1 Identify Outdated AI Safety Sources
- [ ] Find files using 1995-2018 AI safety sources
- [ ] List specific parameters affected (sandbagging, alignment faking, sleeper agents)
- [ ] Document what's missing (RLHF, Constitutional AI, scaling laws post-GPT-4)

### 2.2 Search for 2024-2025 Sources
- [ ] RLHF research (Anthropic, OpenAI, DeepMind 2024)
- [ ] Constitutional AI updates (Anthropic 2024)
- [ ] Alignment faking evidence (recent papers)
- [ ] Sleeper agent capabilities (2024 studies)
- [ ] Post-quantum AI safety (if applicable)

### 2.3 Update Verification Files
- [ ] Create new verification files with 2024-2025 sources
- [ ] Update simulation parameters if research suggests changes
- [ ] Document what changed and why
- [ ] Run tests to verify no regressions

---

## Phase 3: Refresh Economic Recovery Citations (30 minutes)

### 3.1 Identify Outdated Economic Sources
- [ ] Find files using 1989-2009 economic recovery sources
- [ ] List parameters affected (GDP recovery, unemployment, infrastructure rebuild)
- [ ] Document pre-COVID vs post-COVID context

### 3.2 Search for Post-COVID Sources
- [ ] World Bank post-disaster recovery studies (2022-2024)
- [ ] IMF pandemic recovery research (2021-2024)
- [ ] OECD economic resilience studies (2023-2024)
- [ ] Post-pandemic supply chain research (2022-2024)

### 3.3 Update Parameters
- [ ] Create verification file with new sources
- [ ] Update simulation parameters if research differs
- [ ] Document structural changes (e.g., remote work impact on recovery)
- [ ] Run tests to verify behavior

---

## Phase 4: Add Missing Citations (30 minutes)

### 4.1 Environmental Degradation Rate
**Location:** `environmental.ts:334`
- [ ] Research peer-reviewed sources for degradation rates
- [ ] Create verification file
- [ ] Add JSDoc comment with citation
- [ ] Update wiki if needed

### 4.2 Unemployment Recovery Rate
**Location:** `calculations.ts:529`
- [ ] Research OECD/ILO unemployment recovery data
- [ ] Create verification file
- [ ] Add JSDoc comment with citation
- [ ] Update wiki if needed

### 4.3 Nuclear Winter Mortality
**Location:** `nuclearWinter.ts:473`
- [ ] Check Xia et al. (2022) for mortality estimates
- [ ] Search for newer studies (2023-2024)
- [ ] Create verification file
- [ ] Add JSDoc comment with citation

### 4.4 Other Parameters
- [ ] Identify 2 more parameters lacking citations (grep for hardcoded values without comments)
- [ ] Research sources for each
- [ ] Create verification files
- [ ] Add citations

---

## Phase 5: Quality Gate 1 - Research Validation (15 minutes)

### 5.1 Submit for Review
- [ ] Request super-alignment-researcher + research-skeptic review
- [ ] Provide list of new sources added
- [ ] Document parameter changes (if any)

### 5.2 Address Feedback
- [ ] Fix any Grade D/F issues (blocking)
- [ ] Consider Grade C issues
- [ ] Update citations based on feedback

---

## Phase 6: Documentation (15 minutes)

### 6.1 Update Research Audit
- [ ] Re-run currency audit script
- [ ] Verify improvement from 53.4% → 65%+
- [ ] Document new Grade (B or B+)
- [ ] Update `/research/UPDATE_QUEUE.md`

### 6.2 Wiki Updates
- [ ] Update `docs/wiki/README.md` with new citations
- [ ] Document archival policy in wiki
- [ ] Add notes on currency improvement

---

## Phase 7: Validation (15 minutes)

### 7.1 Run Tests
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Type checking passes

### 7.2 Monte Carlo Check
- [ ] Run N=3 simulations (quick check)
- [ ] Verify deterministic behavior
- [ ] Check for any assertion failures

---

## Definition of Done

- [ ] 178 legacy files archived to `/research/legacy/` with manifest
- [ ] AI safety citations refreshed with 2024-2025 sources
- [ ] Economic recovery parameters updated with post-COVID research
- [ ] 3-5 simulation parameters have explicit research citations
- [ ] Research currency increased from 53.4% → 65%+ (Grade B)
- [ ] Quality Gate 1 passed (Grade B or higher)
- [ ] All tests passing
- [ ] Documentation updated (wiki + audit)

---

## Estimated Timeline

- **Total:** 2.5-3 hours
- **Phase 1 (Archival):** 60 min
- **Phase 2 (AI Safety):** 45 min
- **Phase 3 (Economics):** 30 min
- **Phase 4 (Missing Citations):** 30 min
- **Phase 5 (Quality Gate):** 15 min
- **Phase 6 (Documentation):** 15 min
- **Phase 7 (Validation):** 15 min

---

## Dependencies

None - This is self-contained research maintenance.

---

## Success Metrics

**Primary:**
- Research currency: 53.4% → 65%+ (Grade C → B)

**Secondary:**
- 178 files archived (namespace cleanup)
- 10+ new 2024-2025 sources added
- 3-5 previously uncited parameters now cited
- Quality Gate 1 Grade B or higher

---

## Rollback Plan

If issues arise:
1. Files in `/research/legacy/` can be restored
2. Old parameter values preserved in git history
3. Investigation needed before retry
