# Research File Standards

**Purpose:** Define metadata requirements, citation formats, quality grading, and update procedures for all research files.

**Enforcement:** Pre-commit hooks validate frontmatter, audit scripts check compliance, CI fails on missing required fields.

---

## Table of Contents

1. [Frontmatter Requirements](#frontmatter-requirements)
2. [Citation Formats](#citation-formats)
3. [Quality Grading System](#quality-grading-system)
4. [Update Log Format](#update-log-format)
5. [File Structure Template](#file-structure-template)
6. [Validation Rules](#validation-rules)
7. [Examples](#examples)

---

## Frontmatter Requirements

### Required Fields

Every research file MUST have frontmatter with these fields:

```yaml
---
title: "Research Topic Title"           # REQUIRED: Human-readable title
date: YYYY-MM-DD                        # REQUIRED: File creation date
last_verified: YYYY-MM-DD               # REQUIRED: Last source check
status: current | warning | critical    # REQUIRED: Age classification
quality: A+ | A | A- | B+ | B | B- | C  # REQUIRED: Research quality grade
sources_count: N                        # REQUIRED: Number of citations
oldest_source: YYYY                     # REQUIRED: Oldest citation year
newest_source: YYYY                     # REQUIRED: Newest citation year
domains: []                             # REQUIRED: Research domains (array)
used_in_simulation: true | false        # REQUIRED: In simulation code?
---
```

### Optional Fields

```yaml
---
parameters_extracted: N                 # Count of simulation parameters
zotero_collection: "Collection Name"    # Zotero library collection
age_override: false                     # Skip age warnings (for seminal papers)
seminal_paper: false                    # Foundational work, age-independent
doi: 10.xxx/xxx                         # Primary DOI if single-source
arxiv_id: 2203.15556                    # arXiv ID if preprint
related_files: []                       # Links to related research files
validation_status: verified | pending   # Dual-review status (Cynthia + Sylvia)
---
```

---

## Field Definitions

### `title` (string, required)
- Human-readable title of research topic
- Use sentence case
- Specific, not generic (e.g., "AI Capability Scaling Laws 2023-2025" not "AI Research")

### `date` (YYYY-MM-DD, required)
- File creation date
- ISO 8601 format
- Used to track file age (not source age)

### `last_verified` (YYYY-MM-DD, required)
- Date when sources were last checked
- Updated on every verification pass
- Triggers alerts if >6 months old

### `status` (enum, required)
- `current` - All sources <3 years old
- `warning` - Oldest source 3-5 years old
- `critical` - Oldest source >5 years old
- Auto-calculated by audit script, but can be manually set

### `quality` (enum, required)
- Research quality grade (see Quality Grading System below)
- Range: A+ (highest) to C (lowest)
- Based on source quality, parameter justification, uncertainty handling

### `sources_count` (number, required)
- Total number of citations in file
- Minimum: 2 (research standard)
- Count unique sources, not duplicate citations

### `oldest_source` (YYYY, required)
- Year of oldest citation
- Used for age classification
- If `age_override: true`, this is ignored

### `newest_source` (YYYY, required)
- Year of newest citation
- Shows research currency
- Used to calculate source recency

### `domains` (array, required)
- Research domains this file covers
- Allowed values:
  - `climate` - Climate science, Earth systems
  - `ai-capabilities` - AI scaling, compute, benchmarks
  - `ai-alignment` - Technical AI safety
  - `society` - Social systems, governance
  - `economics` - Economic modeling
  - `environment` - Biodiversity, ecosystems
  - `interdisciplinary` - Cross-domain research
- Can have multiple domains

### `used_in_simulation` (boolean, required)
- `true` - Parameters extracted for simulation code
- `false` - Background research, not used in code
- Affects priority calculation (used sources → higher priority)

### `parameters_extracted` (number, optional)
- Count of simulation parameters from this research
- Examples: growth rates, thresholds, scaling exponents
- Required if `used_in_simulation: true`

### `zotero_collection` (string, optional)
- Name of Zotero collection containing these sources
- Used for export/sync validation
- Example: `"AI Capabilities & Alignment"`

### `age_override` (boolean, optional)
- Set `true` to skip age warnings
- Use for seminal papers (Shannon 1948, Arrhenius 1896)
- Requires justification in file

### `seminal_paper` (boolean, optional)
- Foundational work, age-independent
- Examples: foundational theorems, historical data
- Implies `age_override: true`

---

## Citation Formats

### Supported Formats

Research files should use standard academic citation formats for machine-readable extraction:

**In-text citations:**
```markdown
- (Author et al., 2022)
- (Kaplan & McCandlish, 2020)
- [Amodei 2018]
- Author (2022)
```

**Full citations:**
```markdown
Hoffmann, J., Borgeaud, S., Mensch, A., et al. (2022). Training Compute-Optimal Large Language Models. *NeurIPS*, 35, 1-15. DOI: 10.48550/arXiv.2203.15556
```

### Required Citation Information

Each full citation MUST include:
- **Authors:** Last name + initials (e.g., "Hoffmann, J.")
- **Year:** Publication year in parentheses
- **Title:** Paper title in quotes or italics
- **Venue:** Journal/conference name (italicized)
- **DOI:** If available (preferred)
- **Zotero URI:** For direct linking to library item

**Template:**
```markdown
Author, A. B., Author, C. D., & Author, E. F. (YYYY). Title of paper. *Venue Name*, Volume(Issue), Pages. DOI: 10.xxx/xxx
- **Zotero:** `zotero://select/items/1_ABC123`
- **Quality:** [peer-reviewed/preprint/etc], [institution], [citation count]
- **Key Data:** [What we extracted, page numbers]
```

### Citation Quality Metadata

For each source, document:
- **Publication type:** Peer-reviewed / Preprint / Technical report / Government data
- **Institution:** Author affiliation (e.g., "OpenAI", "Stanford", "IPCC")
- **Citation count:** From Google Scholar (credibility indicator)
- **Relevance:** What specific data/parameters were extracted
- **Page numbers:** Where key data appears (for verification)

---

## Quality Grading System

### Grade Scale

**A+ (Exceptional, 95-100%)**
- All sources peer-reviewed in top-tier venues (Nature, Science, NeurIPS, etc.)
- Multiple independent replications
- Full uncertainty quantification (95% CIs, sensitivity analysis)
- Recent sources (most <2 years)
- Clear parameter extraction with page references
- Dual-reviewed (Cynthia + Sylvia)

**A (Excellent, 90-94%)**
- Primarily peer-reviewed sources
- Strong methodologies
- Good uncertainty quantification
- Sources <3 years old
- Clear parameter justification
- Single-reviewed, awaiting dual review

**A- (Very Good, 85-89%)**
- Mix of peer-reviewed + high-quality technical reports
- Solid methodologies
- Basic uncertainty quantification
- Some sources 3-4 years old
- Parameters justified but could be more detailed

**B+ (Good, 80-84%)**
- Mix of peer-reviewed + preprints
- Adequate methodologies
- Limited uncertainty quantification
- Some sources 4-5 years old
- Parameters extracted but justification brief

**B (Acceptable, 75-79%)**
- Some preprints or non-peer-reviewed sources
- Basic methodologies
- Minimal uncertainty quantification
- Sources 5-6 years old
- Parameters listed without detailed justification

**B- (Adequate, 70-74%)**
- Multiple preprints or technical reports
- Methodologies could be stronger
- No uncertainty quantification
- Sources >6 years old
- Parameters assumed or derived

**C (Needs Improvement, <70%)**
- Primarily non-peer-reviewed sources
- Weak methodologies
- No uncertainty information
- Sources >7 years old
- Parameters not clearly justified
- Requires immediate update

### Quality Assessment Criteria

**Source Quality (40%):**
- Peer-reviewed journals/conferences > Technical reports > Preprints > Blogs
- Replication studies add credibility
- High citation counts indicate impact
- Institutional reputation matters (OpenAI/DeepMind/IPCC > unknown sources)

**Methodology (30%):**
- Empirical data > Models > Expert opinion
- Large sample sizes > Small samples
- Controlled experiments > Observational studies
- Reproducible methods > Black-box

**Uncertainty Quantification (20%):**
- 95% confidence intervals provided
- Sensitivity analysis conducted
- Assumptions explicitly stated
- Limitations acknowledged

**Recency (10%):**
- <2 years: Full points
- 2-3 years: 80% points
- 3-5 years: 50% points
- >5 years: 0% points (unless seminal)

### Grade Calculation Example

**File:** `ai_scaling_laws_20240815.md`

**Scoring:**
- Source Quality: 38/40 (mostly peer-reviewed, 2 preprints)
- Methodology: 28/30 (strong empirical data, minor limitations)
- Uncertainty: 16/20 (CIs provided, some assumptions unclear)
- Recency: 10/10 (all sources <2 years)

**Total:** 92/100 = **A** grade

---

## Update Log Format

### Structure

Every research file MUST have an "Update History" section at the end:

```markdown
## Update History

### YYYY-MM-DD - [Type of Update]
- **Verified:** X/Y sources still current
- **Updated:** [Specific changes]
- **Status:** old → new
- **Quality:** old → new
- **Changes:** [Detailed description]
- **Parameters Changed:** [If simulation affected]
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic)

### YYYY-MM-DD - Initial Research
- [Original research details]
```

### Update Types

**Full Verification:**
- All sources checked for currency
- No changes needed or sources updated

**Partial Update:**
- Some sources replaced with newer studies
- Parameters may have changed

**Quality Improvement:**
- Better sources found for same findings
- Grade increased

**Correction:**
- Error found in original research
- Parameters corrected

**Superseded:**
- New research contradicts original
- Major parameter changes

### Template

```markdown
## Update History

### 2025-11-06 - Full Verification
- **Verified:** 12/15 sources still current (80%)
- **Updated:** 3 sources superseded
  - Replaced: Kaplan et al. 2020 → Muennighoff et al. 2024
  - Added: Brown et al. 2024 (new data on scaling beyond GPT-4)
  - Removed: Obsolete preprint (published version added)
- **Status:** warning → current (all sources <3 years)
- **Quality:** B+ → A (improved source quality, added CIs)
- **Changes:**
  - Scaling exponent updated: 0.73 ± 0.05 → 0.68 ± 0.07
  - Uncertainty range expanded due to observed variance
  - Added section on algorithmic efficiency improvements
- **Parameters Changed:**
  - `capability_scaling_exponent`: 0.73 → 0.68
  - `breakthrough_threshold_compute`: 1e24 → 1.2e24 FLOPs
- **Monte Carlo Validation:** N=10 runs, outcome distributions stable
- **Reviewers:** Cynthia (researcher), Sylvia (skeptic) - Both approved

### 2024-08-15 - Initial Research
- 15 sources identified from NeurIPS, ICML, OpenAI reports
- Focus: AI capability scaling laws, emergent properties
- Quality: B+ (initial assessment)
- Parameters extracted: 12
- Integrated into simulation phases: `updateAICapabilities`, `checkBreakthroughs`
- Reviewer: Cynthia (researcher)
```

---

## File Structure Template

### Complete Template

```markdown
---
title: "[Research Topic Title]"
date: YYYY-MM-DD
last_verified: YYYY-MM-DD
status: current
quality: B+
sources_count: 10
oldest_source: 2023
newest_source: 2025
domains:
  - climate
  - ai-capabilities
used_in_simulation: true
parameters_extracted: 5
zotero_collection: "Collection Name"
age_override: false
seminal_paper: false
doi: 10.xxx/xxx
validation_status: verified
---

# [Research Topic Title]

## Executive Summary

[2-3 sentences: What does the research show? How does it apply to the simulation?]

## Key Findings

- [Specific, actionable insights with numerical values]
- [Bullet points for scannability]
- [Focus on simulation-relevant findings]

## Primary Sources

### [Subtopic 1]

**[Author et al. (YYYY)]**

Author, A. B., Author, C. D., & Author, E. F. (YYYY). Title of paper. *Venue Name*, Volume(Issue), Pages. DOI: 10.xxx/xxx

- **Zotero:** `zotero://select/items/1_ABC123`
- **Quality:** Peer-reviewed, [Institution], [Citation count] citations
- **Key Data:** [Specific findings extracted] (p. X-Y)
- **Relevance:** [How this informs simulation parameters]
- **Uncertainty:** [Confidence intervals, limitations]

### [Subtopic 2]

[Additional sources following same format]

## Simulation Implications

### Parameters

**`parameter_name_1`**: value ± uncertainty
- **Source:** Author et al. (YYYY), Table 2, p. 15
- **Justification:** [Why this value, not others]
- **Range:** [Min-max based on literature]
- **Sensitivity:** [How sensitive is simulation to this value?]

**`parameter_name_2`**: value (derived)
- **Source:** Calculated from Author et al. (YYYY) + Author (YYYY)
- **Method:** [How we combined sources]
- **Uncertainty:** ±X% (propagated from source uncertainties)
- **Validation:** [How we validated this derivation]

### Mechanisms

- [How these findings are implemented in simulation]
- [Which phases use these parameters]
- [What interactions exist with other systems]

### Uncertainties

- [What the research doesn't tell us]
- [Where expert disagreement exists]
- [What assumptions we had to make]
- [Confidence intervals, probability ranges]

### Validation

- [Monte Carlo results: N runs, outcome distributions]
- [Parameter sensitivity tests]
- [Comparison with alternative sources]

## Recommended Follow-up

- [Additional research areas to explore]
- [Sources to check for updates]
- [Parameters needing better justification]

## Update History

### YYYY-MM-DD - [Update Type]
- [Update details following format above]

### YYYY-MM-DD - Initial Research
- [Initial research details]
```

---

## Validation Rules

### Pre-commit Hooks

**Check 1: Frontmatter Exists**
```bash
# Fail if no frontmatter
grep -q "^---$" research/*.md || exit 1
```

**Check 2: Required Fields Present**
```bash
# Check for required fields
REQUIRED_FIELDS=(
  "title:"
  "date:"
  "last_verified:"
  "status:"
  "quality:"
  "sources_count:"
  "oldest_source:"
  "newest_source:"
  "domains:"
  "used_in_simulation:"
)

for field in "${REQUIRED_FIELDS[@]}"; do
  grep -q "$field" research/*.md || {
    echo "❌ Missing required field: $field"
    exit 1
  }
done
```

**Check 3: Date Format Valid**
```bash
# Validate YYYY-MM-DD format
grep -E "date: [0-9]{4}-[0-9]{2}-[0-9]{2}" research/*.md || exit 1
```

**Check 4: Status Valid**
```bash
# Must be current/warning/critical
grep -E "status: (current|warning|critical)" research/*.md || exit 1
```

**Check 5: Quality Grade Valid**
```bash
# Must be A+, A, A-, B+, B, B-, or C
grep -E "quality: (A\+|A-?|B[+-]?|C)" research/*.md || exit 1
```

### CI Validation

**GitHub Actions check:**
```yaml
- name: Validate research files
  run: |
    npx tsx scripts/validateResearchFiles.ts
    # Fails on:
    # - Missing frontmatter
    # - Invalid field values
    # - Files not updated in >6 months
    # - Used-in-simulation files with quality <B
```

### Manual Review Checklist

Before merging research updates:

- [ ] Frontmatter complete and valid
- [ ] All sources cited in standard format
- [ ] DOIs or Zotero URIs provided
- [ ] Quality grade justified
- [ ] Parameters clearly linked to sources
- [ ] Uncertainty quantified
- [ ] Update history documented
- [ ] Dual review (Cynthia + Sylvia) completed
- [ ] Monte Carlo validation if parameters changed
- [ ] Related simulation code updated if needed

---

## Examples

### Example 1: High-Quality Research File (A Grade)

```markdown
---
title: "AI Capability Scaling Laws 2023-2025"
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
validation_status: verified
---

# AI Capability Scaling Laws 2023-2025

## Executive Summary

Research on AI scaling laws (2023-2025) demonstrates predictable capability growth with compute, following power-law relationships. Chinchilla scaling shows compute-optimal training requires balanced parameter and data scaling. This research informs simulation parameters for AI capability progression rates and breakthrough thresholds.

## Key Findings

- Chinchilla scaling: N_optimal ∝ C^0.50, D_optimal ∝ C^0.50 (Hoffmann et al. 2022)
- GPT-4 class models: ~1.8T parameters, ~2.5×10^25 FLOPs training compute
- Emergent capabilities: Threshold at 10^22-10^24 FLOPs (Wei et al. 2022)
- Algorithmic efficiency: 2.5× annual improvement 2020-2024 (Erdil & Besiroglu 2024)
- Scaling continues: No saturation observed through 2025 (Anthropic 2025)

## Primary Sources

### Scaling Laws

**Hoffmann et al. (2022) - Chinchilla Scaling**

Hoffmann, J., Borgeaud, S., Mensch, A., Buchatskaya, E., Cai, T., Rutherford, E., ... & Sifre, L. (2022). Training Compute-Optimal Large Language Models. *Advances in Neural Information Processing Systems*, 35, 30016-30030. DOI: 10.48550/arXiv.2203.15556

- **Zotero:** `zotero://select/items/1_CHINCHILLA2022`
- **Quality:** Peer-reviewed (NeurIPS 2022), DeepMind, 2,847 citations (Scholar)
- **Key Data:**
  - Optimal scaling: N ∝ C^0.50, D ∝ C^0.50 (Figure 3, p. 6)
  - Chinchilla (70B params, 1.4T tokens) outperforms Gopher (280B, 300B tokens)
  - Compute-optimal ratio: ~20 tokens per parameter
- **Relevance:** Informs AI capability growth rate, compute allocation
- **Uncertainty:** ±10% on exponents (95% CI), assumes continued architectural similarity

**Wei et al. (2022) - Emergent Abilities**

Wei, J., Tay, Y., Bommasani, R., Raffel, C., Zoph, B., Borgeaud, S., ... & Fedus, W. (2022). Emergent Abilities of Large Language Models. *Transactions on Machine Learning Research*. DOI: 10.48550/arXiv.2206.07682

- **Zotero:** `zotero://select/items/1_EMERGENT2022`
- **Quality:** Peer-reviewed (TMLR), Google/Stanford/Anthropic, 1,234 citations
- **Key Data:**
  - Emergent capabilities at 10^22-10^24 FLOPs (Table 1, p. 8)
  - Tasks: arithmetic, word unscrambling, logical reasoning
  - Sharp threshold behavior (not gradual improvement)
- **Relevance:** Breakthrough threshold parameters
- **Uncertainty:** Task-dependent thresholds (±0.5 orders of magnitude)

[... 13 more sources with full metadata ...]

## Simulation Implications

### Parameters

**`ai_capability_base_growth_rate`**: 0.15 ± 0.03 per month
- **Source:** Derived from Hoffmann et al. 2022 + Anthropic 2025 compute trends
- **Justification:** 2.5× annual algorithmic efficiency + 1.5× hardware scaling
  - Algorithmic: ln(2.5) / 12 = 0.076 per month
  - Hardware: ln(1.5) / 12 = 0.034 per month
  - Combined: 0.110 per month (base)
  - Adjusted for observed 2023-2025 trends: 0.15 (95% CI: 0.12-0.18)
- **Range:** [0.10, 0.20] for sensitivity testing
- **Sensitivity:** HIGH - directly affects AI capability progression timing

**`breakthrough_threshold_compute`**: 1.0×10^24 FLOPs
- **Source:** Wei et al. 2022, Table 1 (emergent capabilities)
- **Justification:** Median threshold across 15 emergent tasks
- **Range:** [5×10^23, 2×10^24] (95% CI)
- **Sensitivity:** MEDIUM - affects breakthrough timing but not trajectory

**`capability_scaling_exponent`**: 0.73 ± 0.05
- **Source:** Kaplan et al. 2020, updated by Muennighoff et al. 2024
- **Justification:** Power-law exponent for capability vs compute
  - Original (Kaplan 2020): 0.73
  - Revised (Muennighoff 2024): 0.68 (more recent data)
  - Using: 0.73 (conservative, higher = slower growth)
- **Uncertainty:** ±0.05 (95% CI from Muennighoff)
- **Sensitivity:** HIGH - affects long-term capability ceiling

### Mechanisms

**Implementation in simulation:**
- Phase: `updateAICapabilities` (src/simulation/phases/aiCapability/)
- Mechanism: Log-linear growth with compute
  ```typescript
  capability_growth = base_rate * log(compute_ratio) * scaling_exponent
  ```
- Breakthrough detection: When `compute_accumulated > breakthrough_threshold_compute`
- Emergent properties: Step function at threshold crossings

**Interactions:**
- Compute availability affects growth rate (hardware production phase)
- Alignment research modulates risk (alignment phases)
- Capability drives automation potential (labor market phases)

### Uncertainties

**Known Unknowns:**
- Post-2025 scaling trajectory (current trends may not continue)
- Architectural innovations not captured in power laws (±30% uncertainty)
- Emergent capability timing has ±6 month window (sharp thresholds are approximate)
- Algorithmic efficiency improvements may accelerate (2.5× → 5× annual)

**Assumptions:**
- Transformer architecture dominance continues
- No major compute bottlenecks (chip shortages, energy constraints)
- Scaling laws remain valid beyond current frontier
- Definition of "capability" remains consistent

**Confidence Levels:**
- Growth rate (0.15/month): 80% confidence (well-supported by trends)
- Breakthrough threshold (1e24 FLOPs): 70% confidence (task-dependent)
- Scaling exponent (0.73): 75% confidence (some variance in recent data)

### Validation

**Monte Carlo Results (N=10 runs):**
- Outcome distribution stable across parameter ranges
- Breakthrough timing: Year 3-5 (median: Year 4)
- No NaN or invalid states observed
- Sensitivity to `growth_rate`: HIGH (±20% changes timing by ±1 year)

**Parameter Sensitivity Tests:**
- Baseline: 0.15/month → Breakthrough Year 4
- Low: 0.12/month → Breakthrough Year 5
- High: 0.18/month → Breakthrough Year 3
- Conclusion: 1 year uncertainty window acceptable for scenario planning

**Cross-Validation:**
- Epoch AI compute trends: Consistent with 0.15/month
- OpenAI/Anthropic timelines: Support Year 3-5 breakthrough window
- Alternative sources (Sevilla et al. 2024): 0.14/month (agreement)

## Recommended Follow-up

**High Priority:**
- Monitor 2026 scaling trends (check if 0.15/month holds)
- Update Muennighoff exponent when full 2025 data available
- Track algorithmic efficiency claims (validate 2.5× annual)

**Medium Priority:**
- Investigate post-emergent-capability scaling (what happens after breakthrough?)
- Research compute-constrained scenarios (chip shortages, energy limits)
- Explore alternative scaling laws (mixture-of-experts, sparse models)

**Low Priority:**
- Historical replication studies (validate older scaling laws)
- Domain-specific scaling (coding, math, reasoning separately)

## Update History

### 2025-11-06 - Partial Update
- **Verified:** 12/15 sources still current (80%)
- **Updated:** 3 sources superseded with newer studies
  - Replaced: Kaplan et al. 2020 → Muennighoff et al. 2024 (updated exponent)
  - Added: Anthropic 2025 (2025 compute trends)
  - Added: Erdil & Besiroglu 2024 (algorithmic efficiency)
- **Status:** current → current (all sources 2022-2025, within threshold)
- **Quality:** B+ → A (added CIs, improved source quality)
- **Changes:**
  - Growth rate: 0.12 ± 0.05 → 0.15 ± 0.03 (2023-2025 trends faster than expected)
  - Uncertainty ranges tightened (more data available)
  - Added algorithmic efficiency component (previously missing)
  - Expanded validation section (Monte Carlo + sensitivity tests)
- **Parameters Changed:**
  - `ai_capability_base_growth_rate`: 0.12 → 0.15
  - Uncertainty: ±0.05 → ±0.03 (better constrained)
- **Monte Carlo Validation:** N=10 runs, outcomes stable, no NaN
- **Reviewers:**
  - Cynthia (researcher): Sources verified, parameters justified
  - Sylvia (skeptic): Checked for overconfidence, validated uncertainties
  - **Consensus:** Approved for merge

### 2024-08-15 - Initial Research
- 15 sources identified from NeurIPS, ICML, ICLR, OpenAI/DeepMind/Anthropic reports
- Focus: AI capability scaling laws (Kaplan, Hoffmann), emergent properties (Wei)
- Quality: B+ (initial assessment, good sources but limited uncertainty quantification)
- Parameters extracted: 12 (growth rates, thresholds, exponents)
- Integrated into simulation phases: `updateAICapabilities`, `checkBreakthroughs`
- Reviewer: Cynthia (researcher) - Initial review only, dual review pending
```

---

### Example 2: Seminal Paper (Age Override)

```markdown
---
title: "Shannon Information Theory - Foundational Concepts"
date: 2024-09-01
last_verified: 2025-11-06
status: current
quality: A+
sources_count: 3
oldest_source: 1948
newest_source: 2023
domains:
  - interdisciplinary
used_in_simulation: false
parameters_extracted: 0
age_override: true
seminal_paper: true
---

# Shannon Information Theory - Foundational Concepts

## Executive Summary

Shannon's 1948 foundational work on information theory provides mathematical framework for entropy, channel capacity, and information transmission. While not directly used in simulation parameters, these concepts underpin uncertainty quantification and decision theory throughout the model.

## Key Findings

- Entropy H(X) = -Σ p(x) log p(x) - measure of information content
- Channel capacity C = max I(X;Y) - maximum reliable transmission rate
- Source coding theorem - optimal compression bounds
- Noisy channel theorem - error correction fundamentals

## Primary Sources

**Shannon, C. E. (1948)**

Shannon, C. E. (1948). A Mathematical Theory of Communication. *Bell System Technical Journal*, 27(3), 379-423. DOI: 10.1002/j.1538-7305.1948.tb01338.x

- **Zotero:** `zotero://select/items/1_SHANNON1948`
- **Quality:** Seminal paper, Bell Labs, 47,000+ citations (most-cited paper in information theory)
- **Key Data:** Entropy definition (p. 10), channel capacity theorem (p. 30)
- **Relevance:** Conceptual foundation for uncertainty quantification
- **Note:** **SEMINAL PAPER** - Age-independent foundational work

[... Additional modern references on applications ...]

## Update History

### 2025-11-06 - Verification Pass
- **Verified:** Seminal paper status confirmed, no updates needed
- **Status:** current (age override active)
- **Quality:** A+ (maintained, foundational work)
- **Note:** Added modern applications references to show continued relevance

### 2024-09-01 - Initial Documentation
- Documented foundational concepts for reference
- Marked as seminal paper (age_override: true)
```

---

**End of Research Standards Documentation**

**Next Steps:**
1. Apply frontmatter to existing research files
2. Run validation: `npm run validate:research`
3. Fix any validation errors
4. Run first audit: `npm run audit:research`
