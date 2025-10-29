# Systematic Citation Verification Plan
## Research Integrity Recovery Workflow

**Date:** October 29, 2025
**Status:** IN PROGRESS
**Priority:** CRITICAL - BLOCKING
**Estimated Effort:** 20-40 hours

---

## Executive Summary

**The Crisis:**
- 965 "et al." citations across 87 research files (unverified)
- 23% fabrication rate in verified sample (5/22 citations fake)
- Expected ~220 fabrications across full research corpus
- Core simulation mechanics contaminated

**The Recovery:**
- Systematic 4-phase verification process
- Priority-based triage (CRITICAL mechanics first)
- Conservative defaults for unverifiable claims
- Monte Carlo sensitivity analysis

---

## Phase 1: Triage & Prioritize (2-4 hours)

### Step 1.1: Extract All Citations (1h)

**Create citation inventory:**
```bash
# Extract all "et al." citations from research files
grep -r "et al\." research/*.md > research/citation_inventory.txt

# Count by file
for f in research/*.md; do
  echo "$(grep -o 'et al\.' "$f" | wc -l | tr -d ' ') $f"
done | sort -rn > research/citation_counts_by_file.txt
```

**Output:** Complete list of all citations with file locations

### Step 1.2: Flag High-Risk Patterns (1h)

**Pattern-based risk scoring:**

**CRITICAL RISK (verify first):**
- Round number ranges: `grep -E "[0-9]00-[0-9]00" research/*.md`
- Pre-2015 AI claims: Papers dated 2000-2014 with "AI" in description
- Think tank/working papers: CSIS, Brookings, FHI, etc.
- Adjacent to known fabrications: Within ±5 lines of confirmed fakes

**HIGH RISK:**
- "et al." with 4+ authors (harder to verify author lists)
- Citation count claims (X,000+)
- 2024-2025 papers (too recent for high citation counts)

**MEDIUM RISK:**
- Conference papers (vs journal articles)
- arXiv preprints (may not have made it to publication)

**LOW RISK:**
- Classic papers (Bostrom 2014, Omohundro 2008, etc.)
- Papers with full author lists (easier to verify)
- Widely cited foundational work

### Step 1.3: Map Citations to Simulation Mechanics (30min)

**CRITICAL Mechanics (verify first):**
1. AI Infrastructure Resources (`src/simulation/aiInfrastructureResources.ts`)
   - Citations: Li et al. 2023, Patterson et al. 2022, Ren et al. 2024
   - Impact: Water/energy consumption scaling

2. Bayesian Mortality (`src/simulation/bayesianMortality.ts`)
   - Citations: Climate mortality research files
   - Impact: Death attribution, population dynamics

3. Environmental Systems (`src/simulation/environmental.ts`, `planetaryBoundaries.ts`)
   - Citations: Richardson et al. 2023, tipping point thresholds
   - Impact: Collapse triggers, recovery timescales

4. AI Capability Scaling (`src/simulation/agents/aiAgent.ts`)
   - Citations: Implementation effectiveness, breakthrough adoption
   - Impact: AI capability progression rates

**HIGH Mechanics:**
- Government response timing (policy adoption, comprehension lag)
- Breakthrough technology effectiveness
- Social cohesion dynamics

**MEDIUM/LOW Mechanics:**
- Quality of life frameworks
- Paradigm metrics
- Secondary systems

### Step 1.4: Create Verification Queue (30min)

**Priority ordering:**
```
1. CRITICAL mechanics + CRITICAL risk patterns (verify first)
2. CRITICAL mechanics + HIGH risk patterns
3. HIGH mechanics + CRITICAL risk patterns
4. HIGH mechanics + HIGH risk patterns
... (continue through matrix)
```

**Output:** Ordered list of ~50-100 highest-priority citations

---

## Phase 2: Core Mechanics Verification (8-12 hours)

### Step 2.1: Verify Top 50 Citations (6-8h)

**For each citation in priority queue:**

**A. Check if paper exists (5min per citation)**
- Google Scholar search: `"exact title" author`
- arXiv search (if arXiv ID provided)
- Publisher website (if DOI/journal provided)
- **If NOT FOUND:** Mark as FABRICATION

**B. Verify author list (3min per citation)**
- Check first author + last author match
- For "et al." citations, check at least 3 authors
- **If AUTHORS WRONG:** Mark as WRONG_AUTHORS

**C. Validate specific claim (7min per citation)**
- Find the specific number/claim in paper
- Verify it says what citation claims
- Check for context (is it qualified? conditional?)
- **If CLAIM WRONG:** Mark as MISATTRIBUTED

**D. Assess quality (2min per citation)**
- Peer-reviewed? Preprint? Blog post?
- Citation count (Google Scholar)
- Recency (is it outdated for fast-moving field?)

**Verification outcomes:**
- ✅ **VERIFIED:** Paper exists, authors correct, claim accurate
- ❌ **FABRICATION:** Paper doesn't exist
- ❌ **WRONG_AUTHORS:** Paper exists, wrong authors
- ❌ **MISATTRIBUTED:** Paper exists, claim wrong/misquoted
- ⚠️ **OUTDATED:** Paper real but data outdated for 2024-2025
- ⚠️ **LOW_QUALITY:** Preprint/blog/non-peer-reviewed

### Step 2.2: Find Replacements for Fabrications (2-4h)

**For each fabrication/wrong citation:**

**Strategy 1: Find the real paper**
- Search for the actual topic (ignore fake citation)
- Use Google Scholar: `[topic] [year range]`
- Filter: peer-reviewed, 2024-2025 preferred
- Validate: Read abstract, check if claim is supported

**Strategy 2: Use conservative estimate**
- Find multiple sources on topic
- Take most conservative value
- Document range of estimates
- Mark as `[CONSERVATIVE_ESTIMATE]` with sources

**Strategy 3: Flag for removal**
- If no credible source exists
- If claim is not critical to simulation
- Remove mechanic or use hardcoded conservative default

**Output:** Replacement citations with verified page numbers

---

## Phase 3: Systematic Corpus Audit (8-16 hours)

### Step 3.1: Batch Process by Pattern (4-8h)

**Round Number Batch:**
- Extract all "X00-Y00" citations
- Verify each (expect high fabrication rate)
- Replace or remove

**Pre-2015 AI Claims Batch:**
- Extract papers dated 2000-2014 with AI-specific claims
- Check for anachronisms (2009 paper "predicting" GPT?)
- Keep only legitimate foundational work (Bostrom, Yudkowsky, etc.)

**Think Tank/Working Paper Batch:**
- Extract CSIS, Brookings, FHI, etc. citations
- Verify authors were at institution at claimed date
- Check if publication exists in institution's archives
- High risk of phantom publications

### Step 3.2: Verify Remaining High-Risk Citations (3-6h)

**Citation count inflation:**
- Check all "X,000+" citation claims
- Use Google Scholar for actual counts
- Replace with accurate counts

**Recent papers (2024-2025):**
- Extra scrutiny for very recent work
- Check if actually published (vs submitted/preprint)
- Verify authors/institutions exist

### Step 3.3: Document Uncertainty (1-2h)

**For unverifiable claims:**
- Cannot find source → Mark `[UNVERIFIED - SOURCE NOT FOUND]`
- Claim not in paper → Mark `[UNVERIFIED - CLAIM NOT SUPPORTED]`
- Data outdated → Mark `[OUTDATED - YYYY data, need 2024-2025 update]`
- Low quality → Mark `[PREPRINT]` or `[BLOG POST]`

**Create uncertainty register:**
```markdown
# Unverified Claims Register

## High-Priority Unverified
- [Claim]: [Description]
- [Source]: [Citation that couldn't be verified]
- [Impact]: [Which simulation mechanic]
- [Action]: [Conservative default used / Flagged for removal]

...
```

---

## Phase 4: Parameter Re-grounding (2-8 hours)

### Step 4.1: Update Simulation Code (1-3h)

**For each contaminated mechanic:**

```typescript
// BEFORE (fabricated source)
const waterPerGPUHour = 500; // Ren et al. 2024 (FABRICATED)

// AFTER (verified source)
const waterPerGPUHour = 0.86; // Li et al. (2023) - scope 1 only
// Source: "Making AI Less 'Thirsty'" arXiv:2304.03271
// Note: 0.86 L/GPU-hr (direct water), 6.6 L/GPU-hr (scope 2 incl. electricity)
// Conservative choice: Using lower scope-1 estimate
```

**Add `[UNVERIFIED]` tags where needed:**
```typescript
// [UNVERIFIED - conservative estimate from literature range]
const governmentComprehensionLag = 24; // months (conservative)
// Multiple sources suggest 12-60 month range, using mid-low estimate
// Sources: [actual verifiable sources, or "no peer-reviewed source found"]
```

### Step 4.2: Run Monte Carlo Sensitivity Analysis (1-2h)

**Test impact of parameter changes:**

```bash
# Baseline with OLD (fabricated) parameters
npx tsx scripts/monteCarloSimulation.ts --runs=50 --tag=baseline_fabricated

# New run with VERIFIED parameters
npx tsx scripts/monteCarloSimulation.ts --runs=50 --tag=verified_params

# Compare outcomes
npx tsx scripts/compareMonteCarloRuns.ts baseline_fabricated verified_params
```

**Analyze:**
- How much did outcomes shift?
- Which parameters have high sensitivity?
- Are any outcomes now implausible?

### Step 4.3: Update Documentation (1-3h)

**Wiki updates:**
- Strike through fabricated citations
- Add verified replacements
- Add uncertainty flags
- Update parameter justifications

**Research file updates:**
- Mark files `[VERIFIED]` or `[PARTIALLY VERIFIED]`
- Add verification date
- List unverified claims still in file

**DevLog entry:**
```markdown
# Citation Verification Sprint - Oct 29, 2025

## What We Fixed
- Verified 965 citations across 87 research files
- Found ~220 fabrications (23% rate)
- Replaced critical mechanics parameters
- Added conservative defaults for unverified claims

## Parameter Changes
- AI water consumption: 500 L/GPU-hr → 0.86 L/GPU-hr (Li et al. 2023)
- AI energy consumption: 300-400 kWh/run → Model-specific MWh (Patterson et al. 2022)
- [etc.]

## Impact on Simulation
- Outcome distribution shifted: [describe changes]
- High sensitivity to: [parameters]
- Low sensitivity to: [parameters]

## Remaining Uncertainty
- [List of unverified claims with conservative defaults]
```

---

## Conservative Defaults Strategy

### When to Use Conservative Defaults

**Use conservative defaults when:**
1. No credible peer-reviewed source exists
2. Source exists but data is outdated (pre-2022 for fast-moving topics)
3. Claim is in source but qualified/conditional
4. Multiple contradictory sources exist

### How to Choose Conservative Value

**For positive effects (breakthroughs, interventions):**
- Use LOWER bound of literature range
- Assume slower adoption, lower effectiveness
- Err on side of pessimism

**For negative effects (risks, damages):**
- Use UPPER bound of literature range
- Assume faster onset, higher severity
- Err on side of caution

**For uncertainty ranges:**
- Use ±50% variance in Monte Carlo
- Document range in code comments
- Flag for sensitivity analysis

### Documentation Template

```typescript
// [CONSERVATIVE_ESTIMATE - no peer-reviewed 2024-2025 source found]
const parameterName = value; // [units]
// Literature range: [low]-[high] from [sources]
// Using [low/high] bound (conservative for [positive/negative] effect)
// ±50% variance in Monte Carlo runs
// FLAGGED: Need 2024-2025 peer-reviewed validation
```

---

## Tooling & Automation

### Citation Extraction Script

```typescript
// scripts/extractCitations.ts
// Parses all research/*.md files
// Extracts citations in standardized format
// Outputs JSON with file locations, line numbers
```

### Risk Scoring Script

```typescript
// scripts/scoreCitationRisk.ts
// Takes citation inventory JSON
// Scores by patterns (round numbers, dates, etc.)
// Outputs priority verification queue
```

### Verification Progress Tracker

```typescript
// scripts/trackVerificationProgress.ts
// Reads verification outcomes
// Tracks: verified, fabricated, pending
// Generates progress report
```

---

## Success Criteria

**Phase 1 Complete:**
- ✅ All 965 citations extracted and inventoried
- ✅ Risk scores assigned
- ✅ Priority queue created (ordered by mechanics × risk)

**Phase 2 Complete:**
- ✅ Top 50-100 citations verified
- ✅ All CRITICAL mechanics have verified or conservative sources
- ✅ Fabrications documented and replaced

**Phase 3 Complete:**
- ✅ All high-risk patterns processed
- ✅ Uncertainty register created
- ✅ Research corpus marked [VERIFIED] or [UNVERIFIED]

**Phase 4 Complete:**
- ✅ Simulation code updated with verified parameters
- ✅ Monte Carlo sensitivity analysis complete
- ✅ Documentation updated (wiki, devlogs, research files)

**Overall Success:**
- ✅ No CRITICAL mechanics rely on fabricated citations
- ✅ All unverified claims have conservative defaults
- ✅ Uncertainty is documented and quantified
- ✅ Verification protocol established for future work

---

## Timeline

**Aggressive (20h):**
- Phase 1: 2h
- Phase 2: 6h (spot-check top 30 only)
- Phase 3: 8h (pattern-based batch processing)
- Phase 4: 4h

**Thorough (40h):**
- Phase 1: 4h (deep triage, detailed risk scoring)
- Phase 2: 12h (verify top 100, find quality replacements)
- Phase 3: 16h (systematic corpus audit, all patterns)
- Phase 4: 8h (comprehensive sensitivity analysis, full docs update)

**Recommended:** Start with Phase 1 + Phase 2 aggressive (8h), assess impact, decide on Phase 3 scope.

---

## Risk Mitigation

**Risk: Too many fabrications to fix in reasonable time**
- Mitigation: Conservative defaults for non-critical mechanics
- Accept: Some uncertainty in simulation, document explicitly

**Risk: Can't find replacement sources for critical mechanics**
- Mitigation: Use literature meta-analyses for ranges
- Accept: Wider uncertainty bounds, ±50% Monte Carlo variance

**Risk: Parameter changes invalidate previous results**
- Mitigation: Re-run Monte Carlo baselines, document changes
- Accept: Previous runs may not be comparable

**Risk: Verification fatigue, incomplete coverage**
- Mitigation: Automate pattern detection, batch processing
- Accept: Focus on CRITICAL mechanics, flag rest for future

---

**Last Updated:** October 29, 2025
**Owner:** Research Team (Cynthia + Sylvia)
**Status:** Phase 1 ready to begin
