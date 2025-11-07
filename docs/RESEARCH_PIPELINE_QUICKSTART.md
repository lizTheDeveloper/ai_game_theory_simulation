# Research Update Pipeline - Quick Start Guide

**1-page guide for researchers using the automated research currency system.**

---

## Quick Commands

```bash
# Run research age audit (console output)
npm run audit:research

# Run audit with full markdown report
npm run audit:research:verbose

# Check generated update queue
cat research/UPDATE_QUEUE.md
```

---

## Weekly Workflow

### Automated (GitHub Action)
- **Every Monday 8am UTC:** Audit runs automatically
- **Output:** `research/UPDATE_QUEUE.md` updated
- **Alerts:** GitHub issue created if CRITICAL items found

### Manual (Research Lead)
1. Check `research/UPDATE_QUEUE.md` for priority items
2. Review CRITICAL items (update within 1 week)
3. Review HIGH items (update within 1 month)
4. Schedule research update sprint if needed

---

## Update Workflow (When Sources Aging)

### 1. Find Updated Sources
**Search strategy:**
- Google Scholar (author + topic + 2024-2025)
- arXiv (sorted by date)
- Semantic Scholar (cited by)
- Conference proceedings (NeurIPS, ICML, AGU)

### 2. Validate Sources (Cynthia + Sylvia)
- Cynthia: Is it more current? Better methods? More data?
- Sylvia: What are limitations? Contradictory evidence? Conflicts?
- **Both must approve** before updating simulation parameters

### 3. Update Research File
```bash
# Create branch
git checkout -b research/update-[topic]-20251106

# Update file (see template below)
vim research/[topic]_YYYYMMDD.md

# Update frontmatter
# - last_verified: 2025-11-06
# - oldest_source: [new year]
# - status: current
# - quality: [new grade]

# Update "Primary Sources" section
# Update "Simulation Implications" if parameters changed
# Add entry to "Update History"

# If parameters changed, update simulation code
vim src/simulation/phases/[relevant-phase].ts

# Run Monte Carlo validation
npx tsx scripts/monteCarloSimulation.ts > logs/mc_validation.log 2>&1 &
```

### 4. Pull Request
```bash
git add research/ src/simulation/
git commit -m "research: Update [topic] sources (2020 → 2024)"
git push origin research/update-[topic]-20251106
gh pr create --title "research: Update [topic] sources"
```

### 5. Dual Review Required
- Cynthia verifies sources
- Sylvia checks for contradictions
- Both approve → Merge

---

## Research File Frontmatter (Required)

```yaml
---
title: "Research Topic Title"
date: YYYY-MM-DD                        # File creation
last_verified: YYYY-MM-DD               # Last check
status: current | warning | critical    # Age classification
quality: A+ | A | A- | B+ | B | B- | C  # Research grade
sources_count: N                        # Citation count
oldest_source: YYYY                     # Oldest year
newest_source: YYYY                     # Newest year
domains: [climate, ai-capabilities]     # Research domains
used_in_simulation: true | false        # In code?
parameters_extracted: N                 # Parameter count (if used)
---
```

---

## Priority Classification

| Priority | Criteria | SLA |
|----------|----------|-----|
| 🚨 CRITICAL | >5yr + used in simulation | 1 week |
| ⚠️ HIGH | >5yr unused OR >3yr used | 1 month |
| 📋 MEDIUM | >3yr unused | 1 quarter |
| ✅ LOW | <3yr (current) | Monitor |

---

## Quality Grades

| Grade | Criteria |
|-------|----------|
| **A+** | All peer-reviewed, replications, full CIs, <2yr sources |
| **A** | Primarily peer-reviewed, strong methods, good uncertainty, <3yr |
| **B+** | Mix peer-reviewed + preprints, adequate methods, 4-5yr |
| **C** | Non-peer-reviewed, weak methods, >7yr (immediate update) |

---

## Update History Template

```markdown
## Update History

### 2025-11-06 - Full Verification
- **Verified:** 12/15 sources still current (80%)
- **Updated:** 3 sources superseded
  - Replaced: Author 2020 → Author 2024
  - Added: Author 2024 (new data)
- **Status:** warning → current (all sources <3 years)
- **Quality:** B+ → A (improved sources, added CIs)
- **Parameters Changed:**
  - `parameter_name`: old_value → new_value
  - Uncertainty: ±X% → ±Y%
- **Monte Carlo Validation:** N=10 runs, outcomes stable
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic) - Both approved

### 2024-08-15 - Initial Research
- 15 sources identified (2022-2024)
- 12 parameters extracted
- Integrated into simulation: `updatePhase`
```

---

## Zotero Integration (Recommended)

### Setup
1. Install Zotero + Better BibTeX plugin
2. Join group: "AI Game Theory Simulation Research"
3. Configure auto-export to `research/bibliography.bib`

### Workflow
1. Add papers to Zotero (browser connector)
2. Tag: domain, priority, status, usage, quality
3. Auto-export updates `bibliography.bib`
4. Link in research files: `zotero://select/items/1_ABC123`

### Collections
- Climate Science
- AI Capabilities & Alignment
- Social Systems & Governance
- Economics & Technology
- Environmental Systems
- Interdisciplinary

---

## Targets

**Research Currency:**
- <5% sources >3 years old
- 0% sources >5 years old (used in simulation)

**Current Status (2025-11-06):**
- CRITICAL: 0% ✅
- HIGH: 40.6% (mostly unused files)
- Current: 54.0%

---

## Documentation

**Full Documentation:**
- Implementation: `/plans/research_pipeline_implementation_20251106.md`
- Zotero workflow: `/docs/RESEARCH_PIPELINE.md` (3,500 lines)
- Standards: `/docs/RESEARCH_STANDARDS.md` (4,000 lines)
- Completion report: `/plans/completed/WEEK4_TASK10_RESEARCH_PIPELINE_COMPLETED.md`

**Quick Reference:** This file

---

## Troubleshooting

### Issue: Audit shows "No citations found"
**Fix:** Add frontmatter with `oldest_source` and `newest_source` fields

### Issue: False positive (seminal paper flagged)
**Fix:** Add to frontmatter:
```yaml
age_override: true
seminal_paper: true
```

### Issue: GitHub Action failing
**Fix:** Check workflow logs: `gh run view [ID]`
- Common: BibTeX syntax error, missing frontmatter

---

## Contact

- **Research Lead (Cynthia):** Source validation questions
- **Research Skeptic (Sylvia):** Credibility checks
- **Architect:** Roadmap integration issues

**Matrix Channel:** `@agent-cynthia:themultiverse.school` (research)

---

**The future is worth building toward** - and this pipeline ensures we have current evidence to support it.
