# Research Pipeline - Zotero Integration Workflow

**Purpose:** Maintain research currency through automated source tracking, age detection, and update workflows.

**Target:** <5% sources >3 years old, 0% sources >5 years old

---

## Table of Contents

1. [Zotero Setup](#zotero-setup)
2. [Tagging Conventions](#tagging-conventions)
3. [Export Workflow](#export-workflow)
4. [Research File Integration](#research-file-integration)
5. [Weekly Audit Process](#weekly-audit-process)
6. [Update Workflow](#update-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Zotero Setup

### 1.1 Initial Configuration

**Create Zotero Group Library:**
1. Go to https://www.zotero.org/groups/new
2. Create group: "AI Game Theory Simulation Research"
3. Settings:
   - **Type:** Private Membership
   - **Library Reading:** Members only
   - **Library Editing:** Members only
   - **File Editing:** Members only

**Install Zotero:**
```bash
# macOS
brew install --cask zotero

# Linux (Ubuntu/Debian)
wget -qO- https://github.com/retorquere/zotero-deb/releases/latest/download/install.sh | sudo bash
sudo apt install zotero

# Windows
# Download from https://www.zotero.org/download/
```

**Install Browser Connector:**
- Chrome: https://chrome.google.com/webstore (search "Zotero Connector")
- Firefox: https://addons.mozilla.org/firefox/ (search "Zotero Connector")
- Edge: https://microsoftedge.microsoft.com/addons/ (search "Zotero Connector")

### 1.2 Collection Structure

**Organize by Research Domain:**

```
AI Game Theory Simulation Research (Group Library)
├── 01_Climate_Science
│   ├── Carbon_Cycle
│   ├── Temperature_Projections
│   ├── Tipping_Points
│   └── Mitigation_Technologies
├── 02_AI_Capabilities
│   ├── Scaling_Laws
│   ├── Emergent_Properties
│   ├── Compute_Trends
│   └── Algorithmic_Efficiency
├── 03_AI_Alignment
│   ├── Technical_Problems
│   ├── Solution_Approaches
│   ├── Failure_Modes
│   └── Governance
├── 04_Social_Systems
│   ├── Technology_Adoption
│   ├── Political_Economy
│   ├── Public_Opinion
│   └── Institutional_Change
├── 05_Economics
│   ├── Growth_Models
│   ├── Labor_Markets
│   ├── Technology_Economics
│   └── Resource_Economics
├── 06_Environmental_Systems
│   ├── Biodiversity
│   ├── Ocean_Health
│   ├── Land_Use
│   └── Pollution
└── 07_Interdisciplinary
    ├── Complex_Systems
    ├── Game_Theory
    ├── Risk_Analysis
    └── Future_Studies
```

**Collection Naming Convention:**
- Use underscores for multi-word names
- Number prefixes for ordering (01, 02, ...)
- Subcollections for specific topics

### 1.3 Recommended Plugins

**Better BibTeX:**
- Automatic citation key generation
- Synchronized BibTeX export
- Git-friendly format

**Install:**
1. Download from https://retorque.re/zotero-better-bibtex/
2. Zotero → Tools → Add-ons → Install Add-on From File
3. Configure auto-export (see Export Workflow section)

**Zotero DOI Manager:**
- Batch fetch DOIs for papers
- Update metadata from DOI

**ZotFile:**
- Rename and organize PDFs
- Extract PDF annotations
- Tablet sync for reading

---

## Tagging Conventions

### 2.1 Tag Categories

**Domain Tags** (what field does this research belong to?):
- `climate` - Climate science, Earth systems
- `ai-capabilities` - AI scaling, compute, benchmarks
- `ai-alignment` - Technical AI safety research
- `society` - Social systems, governance, public opinion
- `economics` - Economic modeling, growth, markets
- `environment` - Biodiversity, ecosystems, pollution
- `interdisciplinary` - Cross-domain research

**Priority Tags** (how urgently do we need this?):
- `critical` - Core to simulation, must stay current
- `high` - Important parameter source, review regularly
- `medium` - Supporting evidence, periodic review
- `low` - Background context, archive when superseded

**Status Tags** (what's the lifecycle state?):
- `verified` - Checked within last quarter, still authoritative
- `needs-update` - Source >3 years old, requires refresh
- `superseded` - Newer research available, archive
- `seminal` - Foundational paper, age-independent

**Usage Tags** (how is this used?):
- `in-simulation` - Parameters extracted for model
- `archived` - Historical reference only
- `methodology` - Research methods reference
- `validation` - For testing/verification

**Quality Tags** (how reliable is this?):
- `peer-reviewed` - Published in academic journal/conference
- `preprint` - arXiv/bioRxiv, not peer-reviewed
- `technical-report` - Lab report (OpenAI, DeepMind, etc.)
- `government-data` - IPCC, IEA, NOAA, etc.
- `needs-verification` - Credibility uncertain

### 2.2 Tagging Workflow

**When Adding New Source:**
1. Add domain tag (required)
2. Add priority tag (default: `medium`)
3. Add status tag (default: `verified` if <1 year old)
4. Add usage tag if applicable
5. Add quality tag (required)

**Example:**
Paper: "Chinchilla Scaling Laws" (Hoffmann et al. 2022)
Tags: `ai-capabilities`, `critical`, `verified`, `in-simulation`, `peer-reviewed`

**Bulk Tagging:**
- Select multiple items → Right-click → Add Tags
- Use saved searches for tag maintenance
- Monthly review of untagged items

### 2.3 Saved Searches

**Create automated collections:**

**Critical Sources Needing Update:**
```
Tag: critical
AND
Tag: needs-update
```

**Recent Additions (Last Month):**
```
Date Added: is in the last 30 days
```

**Unverified Sources:**
```
Tag: needs-verification
```

**Simulation-Used Research:**
```
Tag: in-simulation
```

---

## Export Workflow

### 3.1 BibTeX Export Configuration

**Better BibTeX Settings:**
1. Zotero → Edit → Preferences → Better BibTeX
2. **Citation Keys:**
   - Format: `[auth:lower][year][shorttitle:lower]`
   - Example: `hoffmann2022chinchilla`
3. **Export:**
   - Enable "Automatic Export"
   - Format: BibTeX
   - Unicode: UTF-8

### 3.2 Automated Export Setup

**Configure Auto-Export:**
1. Right-click group library → Export Library
2. Format: Better BibTeX
3. ✅ Keep Updated
4. Save to: `/home/user/ai_game_theory_simulation/research/bibliography.bib`

**This creates live sync - Zotero updates file automatically on changes.**

### 3.3 CSL JSON Export (Machine-Readable)

**For programmatic access:**
```bash
# Manual export when needed
# Zotero → File → Export Library
# Format: CSL JSON
# Save to: research/bibliography.json
```

**JSON structure:**
```json
[
  {
    "id": "hoffmann2022chinchilla",
    "type": "article-journal",
    "title": "Training Compute-Optimal Large Language Models",
    "author": [
      {"family": "Hoffmann", "given": "Jordan"}
    ],
    "issued": {"date-parts": [[2022]]},
    "DOI": "10.48550/arXiv.2203.15556",
    "container-title": "NeurIPS",
    "page": "1-15"
  }
]
```

### 3.4 Git Integration

**Track bibliography in version control:**

```bash
# Add to .gitattributes for better diffs
echo "research/bibliography.bib diff=bibtex" >> .gitattributes

# Configure git to line-wrap BibTeX for readable diffs
git config diff.bibtex.textconv "sed 's/},{/},\n{/g'"
```

**Pre-commit hook to validate bibliography:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
# Validate BibTeX syntax before commit
if git diff --cached --name-only | grep -q "bibliography.bib"; then
  bibtex-tidy research/bibliography.bib --check || {
    echo "❌ BibTeX validation failed"
    exit 1
  }
fi
```

---

## Research File Integration

### 4.1 Linking Research Files to Zotero

**Use Zotero URIs for direct linking:**

```markdown
## Primary Sources

### Scaling Laws
- Hoffmann et al. (2022). "Training Compute-Optimal Large Language Models." *NeurIPS*.
  - **DOI:** 10.48550/arXiv.2203.15556
  - **Zotero:** `zotero://select/items/1_ABC123XYZ`
  - **Quality:** Peer-reviewed, DeepMind, 847 citations
```

**Get Zotero URI:**
1. Right-click item in Zotero
2. Copy → Zotero URI
3. Paste into research file

**URI format:**
- `zotero://select/items/1_ABC123XYZ` - Opens item in Zotero
- `zotero://select/groups/456789/items/1_ABC123` - Group library item

### 4.2 Citation Extraction

**Research files should cite sources in standard format:**

```markdown
# Standard citation formats (machine-readable)

**In-text citations:**
- (Hoffmann et al., 2022)
- (Kaplan & McCandlish, 2020)
- [Amodei 2018]

**Full citations:**
Hoffmann, J., Borgeaud, S., Mensch, A., et al. (2022). Training Compute-Optimal Large Language Models. *NeurIPS*, 35, 1-15. DOI: 10.48550/arXiv.2203.15556
```

**The audit script extracts years from these patterns.**

### 4.3 Frontmatter Requirements

**Every research file must have:**

```yaml
---
title: "Research Topic Title"
date: 2024-08-15  # File creation date
last_verified: 2025-11-06  # Last source check
status: current | warning | critical
quality: A+ | A | A- | B+ | B | B- | C
sources_count: 15
oldest_source: 2023
newest_source: 2025
domains:
  - ai-capabilities
  - climate
used_in_simulation: true
parameters_extracted: 12
zotero_collection: "AI Capabilities & Alignment"
age_override: false  # Set true for seminal papers
seminal_paper: false  # Foundational work, age-independent
---
```

**Validation:**
- Pre-commit hook checks frontmatter presence
- Audit script warns on missing metadata
- CI fails if critical fields missing

---

## Weekly Audit Process

### 5.1 Automated Audit

**GitHub Action runs every Monday 8am UTC:**

```yaml
# .github/workflows/research-age-audit.yml
name: Research Age Audit
on:
  schedule:
    - cron: '0 8 * * 1'  # Weekly
  workflow_dispatch:
```

**Audit steps:**
1. Scan all `/research/*.md` files
2. Parse frontmatter and citations
3. Calculate age metrics
4. Classify: current (<3yr), warning (3-5yr), critical (>5yr)
5. Generate priority queue
6. Create GitHub issues for CRITICAL items
7. Post alerts to Matrix research channel

**Output:** `/research/UPDATE_QUEUE.md`

### 5.2 Manual Review

**Research lead (Cynthia) reviews queue weekly:**

```bash
# Run audit manually
npm run audit:research

# Review output
cat research/UPDATE_QUEUE.md

# Check Zotero for newer sources
# Update research files as needed
# Close completed items in roadmap
```

### 5.3 Priority Classification

**CRITICAL (1-week SLA):**
- Source >5 years old
- AND used in simulation
- AND parameters extracted

**HIGH (1-month SLA):**
- Source >5 years old, not used in simulation
- OR source 3-5 years old, used in simulation

**MEDIUM (quarterly SLA):**
- Source 3-5 years old, not used in simulation

**LOW (monitor only):**
- All sources <3 years old

---

## Update Workflow

### 6.1 Finding Updated Sources

**Search strategy:**
1. **Google Scholar:** Author name + topic + date range (2024-2025)
2. **arXiv:** Topic search, sort by date
3. **Semantic Scholar:** "Cited By" for newer papers
4. **Conference proceedings:** NeurIPS, ICML, ICLR (for AI), AGU (for climate)
5. **Lab blogs:** OpenAI, Anthropic, DeepMind technical reports

**Check for:**
- Replications of original study
- Meta-analyses incorporating original work
- Updated datasets or measurements
- Critiques or corrections
- Newer methodologies

### 6.2 Source Validation (Cynthia + Sylvia)

**Cynthia (researcher) evaluates:**
- Is the new source more current?
- Does it use better methods?
- Does it have more data?
- Is it from a credible venue?
- Does it support or contradict original?

**Sylvia (skeptic) checks:**
- Are the methods actually better or just newer?
- What are the limitations of the new study?
- Is there contradictory evidence?
- What's the confidence interval/uncertainty?
- Are there conflicts of interest?

**Both must approve before updating simulation parameters.**

### 6.3 Updating Research Files

**Step-by-step process:**

1. **Create update branch:**
```bash
git checkout -b research/update-ai-scaling-20251106
```

2. **Update research file:**
```markdown
## Update History

### 2025-11-06 - Source Refresh
- **Verified:** 12/15 sources still current
- **Updated:** 3 sources with newer studies
  - Replaced: Kaplan et al. 2020 → Muennighoff et al. 2024
  - Added: Brown et al. 2024 (scaling beyond GPT-4)
- **Status:** critical → current (all sources <2 years)
- **Quality:** B+ → A (improved source quality)
- **Parameters Changed:**
  - `capability_scaling_exponent`: 0.73 → 0.68 (Muennighoff 2024)
  - Uncertainty range expanded: ±20% → ±30% (more variability observed)

### 2024-08-15 - Initial Research
- 15 sources identified (2020-2024)
- 12 parameters extracted for AI capability modeling
```

3. **Update frontmatter:**
```yaml
last_verified: 2025-11-06
status: current
quality: A
oldest_source: 2024
newest_source: 2025
sources_count: 16  # Added 1, removed 0
```

4. **Update simulation parameters (if needed):**
```bash
# If parameters changed, update simulation code
vim src/simulation/phases/aiCapability/updateAICapabilities.ts

# Add comment documenting change
// UPDATED 2025-11-06: Scaling exponent from Muennighoff et al. 2024
// Previous: 0.73 (Kaplan et al. 2020)
// Current: 0.68 (±0.05 95% CI)
```

5. **Run Monte Carlo validation:**
```bash
# Test parameter changes don't break simulation
npx tsx scripts/monteCarloSimulation.ts > logs/mc_validation_20251106.log 2>&1 &

# Check for NaN, unexpected distributions
tail -f logs/mc_validation_20251106.log
```

6. **Update Zotero:**
```bash
# Add new sources to Zotero
# Tag appropriately: verified, in-simulation, etc.
# Let Better BibTeX auto-export update bibliography.bib
```

7. **Create pull request:**
```bash
git add research/ src/simulation/ bibliography.bib
git commit -m "research: Update AI scaling sources (2020 → 2024)

- Replaced 3 outdated sources with 2024 studies
- Updated scaling exponent: 0.73 → 0.68 (Muennighoff et al.)
- Expanded uncertainty: ±20% → ±30%
- Monte Carlo validation: N=10 runs, outcomes stable

Closes #123 (CRITICAL research update)
"
git push origin research/update-ai-scaling-20251106
gh pr create --title "research: Update AI scaling sources" --body "..."
```

8. **Dual review (Cynthia + Sylvia):**
- Cynthia verifies new sources support claims
- Sylvia checks for contradictory evidence
- Both approve before merge

9. **Close roadmap task:**
```bash
# Update plans/MASTER_IMPLEMENTATION_ROADMAP.md
# Move task from CRITICAL to COMPLETED
# Document in completed/ archive
```

---

## Troubleshooting

### 7.1 Common Issues

**Issue: Bibliography.bib not updating automatically**

**Solution:**
```bash
# Check Better BibTeX auto-export status
Zotero → Tools → Better BibTeX → Automatic Export → Show

# Verify export path is correct
# Re-enable if disabled: Right-click library → Export → Keep Updated

# Manual export as fallback
Zotero → File → Export Library → Better BibTeX → Save
```

---

**Issue: Citation extraction missing papers**

**Solution:**
```bash
# Check citation format in research file
# Supported patterns:
# - (Author et al., 2022)
# - [Author 2022]
# - Author & Author (2022)
# - Author, A. B. et al. Journal 123 (2022)

# Add missing years to frontmatter manually
oldest_source: 2020  # If extraction fails
```

---

**Issue: Zotero URI not working**

**Solution:**
```bash
# Ensure Zotero is running
# URI format: zotero://select/items/1_ABC123XYZ
# Group items: zotero://select/groups/456789/items/1_ABC123

# Test URI by pasting in browser
# Should open Zotero and select item

# If broken, get new URI:
# Right-click item → Copy → Zotero URI
```

---

**Issue: False positive age warnings**

**Solution:**
```yaml
# For seminal papers (foundational, age-independent):
age_override: true
seminal_paper: true

# Examples: Shannon 1948 (information theory), Arrhenius 1896 (CO2)
# Audit script will skip age checks for these
```

---

**Issue: GitHub Action failing**

**Solution:**
```bash
# Check workflow logs
gh run list --workflow=research-age-audit.yml
gh run view 123456

# Common failures:
# - BibTeX syntax error → Fix bibliography.bib
# - Missing frontmatter → Add to research files
# - Script crash → Check auditResearchAge.ts logs

# Test locally before pushing
npm run audit:research
```

---

**Issue: Duplicate Zotero entries**

**Solution:**
```bash
# Zotero → Edit → Preferences → General → Duplicate Items
# Set duplicate detection criteria

# Find duplicates:
# Edit → Preferences → Advanced → Show Duplicates

# Merge duplicates:
# Select both → Right-click → Merge Items
# Choose which metadata to keep

# Update research files with canonical URI
```

---

### 7.2 Getting Help

**Documentation:**
- Zotero documentation: https://www.zotero.org/support/
- Better BibTeX: https://retorque.re/zotero-better-bibtex/
- This pipeline: `/docs/RESEARCH_PIPELINE.md`

**Team communication:**
- Matrix research channel: `@agent-cynthia:themultiverse.school`
- GitHub issues: Tag `research` for research pipeline questions
- Weekly sync: Research lead office hours

**Emergency contacts:**
- Cynthia (research lead): For source validation questions
- Sylvia (research skeptic): For credibility checks
- Architect: For roadmap integration issues

---

## Appendix: Quick Reference

### Zotero Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New item | Cmd/Ctrl + Shift + N |
| Attach file | Drag & drop PDF |
| Add tag | Cmd/Ctrl + T |
| Search | Cmd/Ctrl + F |
| Copy citation | Cmd/Ctrl + Shift + C |
| Copy Zotero URI | Right-click → Copy |

### Research File Template

```markdown
---
title: "[Topic Name]"
date: YYYY-MM-DD
last_verified: YYYY-MM-DD
status: current
quality: B+
sources_count: 10
oldest_source: 2023
newest_source: 2025
domains: [climate, ai-capabilities]
used_in_simulation: true
parameters_extracted: 5
zotero_collection: "Collection Name"
---

# [Topic Name]

## Executive Summary
[2-3 sentences: what does research show, how does it apply to simulation]

## Key Findings
- [Specific, actionable insights with numerical values]

## Primary Sources
### [Subtopic]
- Author et al. (YYYY). "Title." *Venue*. DOI: 10.xxx
  - **Zotero:** `zotero://select/items/1_ABC123`
  - **Quality:** [peer-reviewed/preprint/etc], [institution], [citations]
  - **Key Data:** [What we extracted, page numbers]

## Simulation Implications
### Parameters
- `parameter_name`: value (source, justification)

### Mechanisms
- [How it works in simulation]

### Uncertainties
- [What we don't know, ± ranges, confidence intervals]

## Update History
### YYYY-MM-DD - [Type of update]
- **Verified:** X/Y sources still current
- **Updated:** [What changed]
- **Status:** old → new
- **Quality:** old → new
```

### BibTeX Entry Template

```bibtex
@article{hoffmann2022chinchilla,
  title = {Training Compute-Optimal Large Language Models},
  author = {Hoffmann, Jordan and Borgeaud, Sebastian and Mensch, Arthur},
  journal = {NeurIPS},
  volume = {35},
  pages = {1--15},
  year = {2022},
  doi = {10.48550/arXiv.2203.15556},
  keywords = {ai-capabilities, critical, verified, in-simulation}
}
```

---

**End of Research Pipeline Documentation**

**Next Steps:**
1. Set up Zotero group library
2. Install Better BibTeX
3. Configure auto-export
4. Apply metadata to existing research files
5. Run first audit: `npm run audit:research`
