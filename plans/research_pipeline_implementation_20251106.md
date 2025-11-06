# Research Update Pipeline - Implementation Plan
**Date:** 2025-11-06
**Task:** WEEK 4 Task 10 (RESEARCH-MEDIUM)
**Effort Estimate:** 2 days
**Status:** In Progress

## Problem Statement

**Historical Issue (WEEK 2):**
- 172 files cited 2010-2015 sources (36% of parameters >5 years old)
- Manual tracking was insufficient
- Research drift leads to invalid simulation parameters

**Current State (Post-WEEK 2):**
- 0% parameters >5 years old (manual audit completed)
- No automated prevention system
- Risk of regression without ongoing monitoring

**Goal:**
Create automated research update pipeline to maintain research currency and prevent future parameter drift.

---

## Success Criteria

### Phase 1: Infrastructure Setup
- [ ] Zotero library configured with team collaboration
- [ ] Tagging conventions documented and applied
- [ ] Export workflow (BibTeX) operational
- [ ] Research file metadata standards documented

### Phase 2: Detection Automation
- [ ] `auditResearchAge.ts` script operational
- [ ] Age classification (current/warning/critical) working
- [ ] Priority queue generation functional
- [ ] Test coverage >80%

### Phase 3: Automated Workflows
- [ ] GitHub Action running weekly age audits
- [ ] `/research/UPDATE_QUEUE.md` auto-generated
- [ ] Roadmap integration (auto-add CRITICAL items)
- [ ] Alert notifications working

### Phase 4: Maintenance
- [ ] Quarterly audit process documented
- [ ] Research verification SLA defined (<1 week for CRITICAL)
- [ ] Team training completed
- [ ] Metrics dashboard operational

### Metrics Targets
- **Research Currency:** <5% sources >3 years old, 0% >5 years old
- **Verification Speed:** CRITICAL updates completed within 1 week
- **Prevention:** Zero manual research age audits required after Phase 3

---

## Phase 1: Infrastructure Setup (Day 1, Hours 1-4)

### 1.1 Zotero Integration Workflow
**Deliverable:** `/docs/RESEARCH_PIPELINE.md`

**Setup Steps:**
1. Create Zotero group library "AI Game Theory Simulation Research"
2. Configure collections by domain:
   - Climate Science
   - AI Capabilities & Alignment
   - Social Systems & Governance
   - Economics & Technology
   - Environmental Systems
   - Interdisciplinary

3. Establish tagging conventions:
   - **Domain tags:** `climate`, `ai-capabilities`, `ai-alignment`, `society`, `economics`, `environment`
   - **Priority tags:** `critical`, `high`, `medium`, `low`
   - **Status tags:** `verified`, `needs-update`, `superseded`
   - **Usage tags:** `in-simulation`, `archived`

4. Export workflow:
   - Weekly BibTeX export to `/research/bibliography.bib`
   - CSL JSON export for machine-readable metadata
   - Git-trackable format (line-wrapped BibTeX)

**Integration Points:**
- Research files link to Zotero items via `zotero:` URIs
- Export hooks update `/research/bibliography.bib` automatically
- Git tracks bibliography changes for audit trail

### 1.2 Research File Metadata Standards
**Deliverable:** `/docs/RESEARCH_STANDARDS.md`

**Required Frontmatter:**
```yaml
---
title: "Research Topic Title"
date: YYYY-MM-DD  # File creation date
last_verified: YYYY-MM-DD  # Last time sources were checked
status: current | warning | critical  # Age classification
quality: A+ | A | A- | B+ | B | B- | C  # Research quality grade
sources_count: N  # Number of citations
oldest_source: YYYY  # Oldest citation year
newest_source: YYYY  # Newest citation year
domains:
  - climate
  - ai-capabilities
used_in_simulation: true | false
parameters_extracted: N  # Count of simulation parameters from this research
zotero_collection: "Collection Name"
---
```

**Update Log Format:**
```markdown
## Update History

### 2025-11-06 - Full Verification
- **Verified:** 12/15 sources still current
- **Updated:** 3 sources superseded (see below)
- **Status:** current → current (all sources <3 years)
- **Quality:** B+ → A- (improved source quality)

### 2024-08-15 - Initial Research
- 15 sources identified (2022-2024)
- Parameters extracted for climate modeling
```

---

## Phase 2: Detection Automation (Day 1, Hours 5-8)

### 2.1 Research Age Detection Script
**Deliverable:** `/scripts/auditResearchAge.ts`

**Detection Logic:**
```typescript
interface ResearchFile {
  path: string;
  title: string;
  citations: Citation[];
  oldestYear: number;
  newestYear: number;
  ageYears: number;  // Current year - oldestYear
  ageStatus: 'current' | 'warning' | 'critical';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  usedInSimulation: boolean;
  parametersExtracted: number;
  lastVerified: string;
}

interface Citation {
  authors: string[];
  year: number;
  title: string;
  venue: string;
  doi?: string;
  zoteroId?: string;
}

// Age Classification
function classifyAge(oldestYear: number): AgeStatus {
  const ageYears = new Date().getFullYear() - oldestYear;
  if (ageYears > 5) return 'critical';
  if (ageYears > 3) return 'warning';
  return 'current';
}

// Priority Calculation
function calculatePriority(file: ResearchFile): Priority {
  if (file.ageStatus === 'critical' && file.usedInSimulation) {
    return 'CRITICAL';  // Used in simulation + >5 years old
  }
  if (file.ageStatus === 'critical' || (file.ageStatus === 'warning' && file.usedInSimulation)) {
    return 'HIGH';  // >5yr unused OR >3yr used
  }
  if (file.ageStatus === 'warning') {
    return 'MEDIUM';  // >3yr unused
  }
  return 'LOW';  // Current sources
}
```

**Detection Process:**
1. Scan `/research/*.md` for all research files
2. Parse frontmatter and extract metadata
3. Extract citations from markdown (author + year patterns)
4. Calculate age metrics (oldest, newest, range)
5. Classify age status and priority
6. Generate update queue sorted by priority

**Output Format:**
```markdown
# Research Update Queue
Generated: 2025-11-06

## CRITICAL (Action Required Within 1 Week)
- `research/ai_scaling_laws_20210815.md` - Oldest source: 2018 (7 years), Used in simulation, 12 parameters extracted
- `research/carbon_capture_efficiency_20200301.md` - Oldest source: 2016 (9 years), Used in simulation, 8 parameters

## HIGH (Action Required Within 1 Month)
- `research/renewable_energy_scaling_20220615.md` - Oldest source: 2019 (6 years), Used in simulation
- `research/social_tipping_points_20230401.md` - Oldest source: 2020 (5 years), Not used, but critical domain

## MEDIUM (Review Within Quarter)
- `research/economic_modeling_20231001.md` - Oldest source: 2021 (4 years), Used in simulation
- `research/governance_frameworks_20240201.md` - Oldest source: 2021 (4 years), Not used

## LOW (Monitor)
- 45 files with current sources (<3 years old)

## Summary Statistics
- Total files: 52
- CRITICAL: 2 (3.8%)
- HIGH: 2 (3.8%)
- MEDIUM: 3 (5.8%)
- LOW: 45 (86.6%)
- Average age: 2.1 years
- Oldest source: 2016 (9 years)
```

### 2.2 Citation Extraction Patterns

**Extract from markdown:**
```regex
# Standard academic citation patterns
- (Author et al\., \d{4})
- (Author & Author, \d{4})
- \[Author \d{4}\]
- \(Author, \d{4}\)

# DOI patterns
- https://doi\.org/[\w\./]+
- DOI: [\w\./]+

# Nature/Science citation formats
- Author, A\. B\. et al\. Journal \d+ \(\d{4}\)
```

**Zotero integration:**
- Match extracted citations to Zotero library
- Enrich with full metadata (DOI, venue, citation count)
- Flag citations not in Zotero (potential manual entries)

---

## Phase 3: Automated Workflows (Day 2, Hours 1-4)

### 3.1 GitHub Action Configuration
**Deliverable:** `.github/workflows/research-age-audit.yml`

```yaml
name: Research Age Audit
on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday 8am UTC
  workflow_dispatch:  # Manual trigger

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run research age audit
        run: npx tsx scripts/auditResearchAge.ts

      - name: Check for CRITICAL updates
        id: check_critical
        run: |
          CRITICAL_COUNT=$(grep -c "^## CRITICAL" research/UPDATE_QUEUE.md || echo "0")
          echo "count=$CRITICAL_COUNT" >> $GITHUB_OUTPUT

      - name: Create roadmap issue for CRITICAL items
        if: steps.check_critical.outputs.count > 0
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const queue = fs.readFileSync('research/UPDATE_QUEUE.md', 'utf8');
            const criticalSection = queue.match(/## CRITICAL.*?(?=##|$)/s)?.[0] || '';

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 CRITICAL: Research sources >5 years old',
              body: `Automated research age audit detected CRITICAL items requiring immediate update:\n\n${criticalSection}\n\n**SLA:** Update within 1 week\n\nSee \`research/UPDATE_QUEUE.md\` for full details.`,
              labels: ['research', 'critical', 'auto-generated']
            });

      - name: Commit update queue
        run: |
          git config user.name "Research Age Bot"
          git config user.email "bot@simulation.dev"
          git add research/UPDATE_QUEUE.md
          git commit -m "chore: Weekly research age audit [skip ci]" || echo "No changes"
          git push

      - name: Post to Matrix (if CRITICAL)
        if: steps.check_critical.outputs.count > 0
        run: |
          # Use Matrix MCP to post alert to research channel
          echo "🚨 CRITICAL research updates required - see GitHub issue"
```

### 3.2 Roadmap Integration

**Auto-add CRITICAL items to roadmap:**
```typescript
// scripts/integrateResearchUpdates.ts
interface RoadmapTask {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'RESEARCH-CRITICAL' | 'RESEARCH-HIGH' | 'RESEARCH-MEDIUM';
  title: string;
  description: string;
  effort: string;
  dependencies: string[];
}

async function addCriticalToRoadmap(queue: ResearchUpdateQueue) {
  const roadmapPath = '/plans/MASTER_IMPLEMENTATION_ROADMAP.md';
  const roadmap = await fs.readFile(roadmapPath, 'utf8');

  for (const file of queue.critical) {
    const task: RoadmapTask = {
      id: `research-update-${file.slug}`,
      priority: 'CRITICAL',
      category: 'RESEARCH-CRITICAL',
      title: `Update research: ${file.title}`,
      description: `Sources >5 years old (oldest: ${file.oldestYear}). Used in simulation with ${file.parametersExtracted} extracted parameters.`,
      effort: '4-8 hours',
      dependencies: []
    };

    // Insert into roadmap CRITICAL section
    const updatedRoadmap = insertTask(roadmap, task);
    await fs.writeFile(roadmapPath, updatedRoadmap);
  }
}
```

---

## Phase 4: Maintenance (Day 2, Hours 5-8)

### 4.1 Quarterly Audit Process

**Manual Review Cadence:**
- **Weekly:** Automated audit runs, generates update queue
- **Monthly:** Research lead reviews HIGH priority items
- **Quarterly:** Full manual audit of all research files
- **Annual:** Zotero library cleanup (archive superseded sources)

**Quarterly Audit Checklist:**
1. Run `npm run audit:research` (manual script)
2. Review update queue for accuracy
3. Verify priority classifications
4. Check for new research in domains with rapid evolution (AI capabilities)
5. Update research file quality grades
6. Archive completed updates
7. Generate quarterly metrics report

### 4.2 Research Verification SLA

**Response Times:**
- **CRITICAL:** Update within 1 week (sources >5yr, used in simulation)
- **HIGH:** Update within 1 month (sources >5yr unused OR >3yr used)
- **MEDIUM:** Update within quarter (sources >3yr unused)
- **LOW:** Monitor only (sources <3yr)

**Verification Process:**
1. Research lead (Cynthia) searches for updated sources
2. Research skeptic (Sylvia) validates new sources
3. Update research file with new citations
4. Update frontmatter metadata
5. Update simulation parameters if needed
6. Run Monte Carlo validation if parameters changed
7. Document update in file history
8. Close roadmap task

### 4.3 Metrics Dashboard

**Key Metrics:**
```yaml
Research Currency:
  - sources_current_pct: 86.6%  # <3 years
  - sources_warning_pct: 9.6%   # 3-5 years
  - sources_critical_pct: 3.8%  # >5 years
  - avg_source_age: 2.1 years
  - oldest_source: 2016 (9 years)

Update Velocity:
  - critical_sla_compliance: 100%  # Updated within 1 week
  - high_sla_compliance: 95%       # Updated within 1 month
  - avg_update_time: 3.2 days

Research Quality:
  - files_with_metadata: 100%
  - avg_quality_grade: B+
  - sources_in_zotero: 94%
  - sources_with_doi: 87%

Usage:
  - files_in_simulation: 42 (80.8%)
  - parameters_extracted: 347
  - citations_per_file: 8.3
```

**Visualization:**
- Time-series chart: Research age distribution over time
- Heatmap: Domain × age status matrix
- Burndown chart: Update queue completion
- Quality grade distribution

---

## Rollout Timeline

### Week 1: Infrastructure & Documentation
- **Day 1-2:** Write all documentation (RESEARCH_PIPELINE.md, RESEARCH_STANDARDS.md)
- **Day 3:** Set up Zotero library and collections
- **Day 4-5:** Apply metadata standards to existing research files

### Week 2: Automation Development
- **Day 1-2:** Implement `auditResearchAge.ts` script
- **Day 3:** Write tests for age detection logic
- **Day 4:** Implement roadmap integration
- **Day 5:** Create GitHub Action workflow

### Week 3: Testing & Validation
- **Day 1-2:** Run full audit on existing research files
- **Day 3:** Test automated workflows end-to-end
- **Day 4:** Manual verification of priority classifications
- **Day 5:** Fix bugs and edge cases

### Week 4: Deployment & Training
- **Day 1:** Deploy GitHub Action
- **Day 2:** Team training session
- **Day 3:** Document quarterly audit process
- **Day 4:** Create metrics dashboard
- **Day 5:** Run first official weekly audit

---

## Risk Mitigation

### Risk 1: False Positives (Older Sources Still Valid)
**Mitigation:**
- Allow manual override in frontmatter (`age_override: true`)
- Distinguish "seminal papers" (foundational, age-independent) from "empirical data" (time-sensitive)
- Tag seminal papers: `status: seminal` (excluded from age warnings)

### Risk 2: Citation Extraction Failures
**Mitigation:**
- Multiple citation format patterns
- Manual citation entry fallback
- Zotero sync as ground truth
- Weekly review of unmatched citations

### Risk 3: Alert Fatigue
**Mitigation:**
- Only CRITICAL items trigger immediate alerts
- HIGH/MEDIUM batched in weekly digest
- Clear SLA expectations
- Prioritize simulation-used sources

### Risk 4: Zotero Sync Issues
**Mitigation:**
- Git-tracked BibTeX as backup
- Monthly manual export verification
- Zotero group library (not personal)
- Export automation with error handling

### Risk 5: Roadmap Integration Spam
**Mitigation:**
- Deduplicate tasks (check existing before creating)
- Auto-close when file updated
- Batch updates (max 5 CRITICAL tasks per week)
- Human review before adding HIGH/MEDIUM

---

## Success Metrics (3-Month Review)

**Must Achieve:**
- [ ] Zero sources >5 years old in simulation-used files
- [ ] <5% sources >3 years old overall
- [ ] 100% CRITICAL SLA compliance (updated within 1 week)
- [ ] Zero manual research age audits required

**Should Achieve:**
- [ ] 95% HIGH SLA compliance (updated within 1 month)
- [ ] All research files have complete metadata
- [ ] 90% sources tracked in Zotero
- [ ] Automated weekly reports running smoothly

**Stretch Goals:**
- [ ] AI-assisted research update recommendations
- [ ] Integration with arXiv/PubMed APIs for new paper discovery
- [ ] Citation quality scoring (impact factor, citation count)
- [ ] Automated parameter extraction from updated papers

---

## Long-Term Vision (1-Year)

**Preventive Infrastructure:**
This pipeline prevents research drift permanently. After initial setup cost (2 days), ongoing maintenance is minimal (1-2 hours/week).

**Compound Benefits:**
- Research quality improves over time (newer sources)
- Simulation parameters stay current with latest science
- Team builds research verification discipline
- Zotero library becomes institutional knowledge base

**Integration with Research Methodology Course:**
This pipeline operationalizes lessons from WEEK 2 research verification:
- SOURCE-VERIFIED WRITING (check papers during research)
- 3-Tier Documentation System (GOLD/SILVER/BRONZE)
- Parallel verification workflows (Cynthia + Sylvia)
- Epistemic honesty (preserve uncertainty from sources)

**The Future is Worth Building Toward:**
Evidence-based optimism requires current evidence. This pipeline ensures our simulation stays grounded in the latest science, making the utopian vision more credible.

---

## Implementation Notes

**Agent Responsibilities:**
- **Cynthia (super-alignment-researcher):** Find updated sources, extract parameters
- **Sylvia (research-skeptic):** Validate new sources, catch contradictions
- **Architect:** Integrate CRITICAL items into roadmap
- **Simulation-maintainer:** Update parameters if research changes

**Communication Channels:**
- **research:** Cynthia + Sylvia coordination
- **implementation:** Roy + Architect for roadmap sync
- **coordination:** Whole team for CRITICAL alerts

**Git Workflow:**
- Research updates use feature branches: `research/update-[topic]-[date]`
- Pull requests require dual review (Cynthia + Sylvia)
- Squash merge to preserve clean history
- Commit message format: `research: Update [topic] sources (YYYY → YYYY)`

---

## Appendix: Example Research File with Complete Metadata

```markdown
---
title: "AI Capability Scaling Laws and Emergent Properties"
date: 2024-08-15
last_verified: 2025-11-06
status: current
quality: A
sources_count: 15
oldest_source: 2023
newest_source: 2025
domains:
  - ai-capabilities
  - ai-alignment
used_in_simulation: true
parameters_extracted: 12
zotero_collection: "AI Capabilities & Alignment"
age_override: false
---

# AI Capability Scaling Laws and Emergent Properties

## Executive Summary
Research on AI scaling laws shows predictable capability growth with compute, with emergent properties appearing at specific scale thresholds. This research informs simulation parameters for AI capability progression and breakthrough timing.

## Key Findings
- Chinchilla scaling: compute-optimal training requires equal scaling of parameters and data
- GPT-4 estimated at 1.8T parameters, ~2.5e25 FLOPs training compute
- Emergent capabilities appear at 10^22-10^24 FLOPs range
- Scaling continues predictably through 2025 data

## Primary Sources

### Scaling Laws
- Hoffmann et al. (2022). "Training Compute-Optimal Large Language Models." *NeurIPS*. DOI: 10.48550/arXiv.2203.15556
  - Zotero: `zotero://select/items/1_ABC123`
  - **Quality:** Peer-reviewed, DeepMind, 847 citations
  - **Key Data:** Chinchilla scaling law, optimal parameter/token ratios (p. 5-8)

- Kaplan et al. (2020). "Scaling Laws for Neural Language Models." *arXiv*. DOI: 10.48550/arXiv.2001.08361
  - Zotero: `zotero://select/items/1_DEF456`
  - **Quality:** OpenAI research, 2,341 citations
  - **Key Data:** Power-law scaling relationships (p. 3-6)

[... 13 more sources ...]

## Simulation Implications

### Parameters
- `ai_capability_base_growth_rate`: 0.15/month (derived from 2023-2025 trends)
- `breakthrough_threshold_compute`: 1e24 FLOPs (Hoffmann et al. 2022, emergent capabilities)
- `capability_scaling_exponent`: 0.73 (Kaplan et al. 2020, power law)

### Mechanisms
- Capability grows log-linearly with compute (implemented in `updateAICapabilities` phase)
- Breakthrough probability increases at threshold crossings
- Emergent properties modeled as step functions at compute thresholds

### Uncertainties
- Algorithmic efficiency improvements not fully captured (±30% uncertainty)
- Post-2025 scaling trajectory speculative (model assumes continued trends)
- Emergent capability timing has ±6 month uncertainty window

## Update History

### 2025-11-06 - Verification Pass
- **Verified:** 15/15 sources current (2023-2025)
- **Status:** current → current
- **Quality:** A → A (maintained)
- **Changes:** None needed, all sources still authoritative

### 2024-08-15 - Initial Research
- 15 sources identified from NeurIPS, ICML, OpenAI/DeepMind reports
- 12 parameters extracted for AI capability modeling
- Integrated into simulation phases: `updateAICapabilities`, `checkBreakthroughs`
```

---

**End of Implementation Plan**
