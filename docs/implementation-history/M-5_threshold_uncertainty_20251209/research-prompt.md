# Research Prompt: Tipping Point Threshold Uncertainty Distributions

**Research Task ID:** T1.1 (Phase 1 - M-5 Threshold Uncertainty Modeling)
**Researcher:** super-alignment-researcher (Cynthia)
**Deliverable:** `research/tipping_threshold_uncertainty_20251209.md`
**Timeline:** 2-3 hours
**Quality Gate:** Must pass research-skeptic validation before implementation

---

## Objective

Extract uncertainty distributions for tipping point thresholds from climate science literature (2024-2025 preferred, 2022+ acceptable). Need specific distribution parameters for probabilistic threshold modeling.

**Why this matters:** Current simulation uses deterministic thresholds (AMOC triggers at exactly +2.0°C), but real thresholds have significant uncertainty ranges. This unrealistic precision affects Monte Carlo variance and risk assessment.

---

## Required Outputs

For each major tipping element, extract:

### 1. Central Estimate (Best Guess)
- Temperature threshold (°C above pre-industrial)
- Confidence level (high/medium/low)
- Source citation

### 2. Uncertainty Distribution Type
Determine which distribution best fits the data:
- **Normal** - Symmetric uncertainty, unbounded
- **Log-normal** - Skewed toward higher values, positive-only
- **Uniform** - No central tendency, bounded range
- **Triangular** - Expert-elicited min/mode/max estimates

### 3. Distribution Parameters
Extract specific values:
- **Normal:** mean, standard deviation
- **Log-normal:** mean of log-values, std of log-values
- **Uniform:** min, max
- **Triangular:** min, mode (most likely), max

### 4. Confidence Assessment
- What's the likelihood this tipping element crosses its threshold this century?
- Are there conditional dependencies (e.g., "only if emissions stay high")?

---

## Tipping Elements to Research (Priority Order)

### Tier 1 (CRITICAL - Must have distributions)
1. **AMOC Collapse** (Atlantic Meridional Overturning Circulation)
2. **Greenland Ice Sheet** disintegration
3. **West Antarctic Ice Sheet** collapse
4. **Amazon Rainforest** dieback
5. **Arctic Summer Sea Ice** loss
6. **Permafrost** carbon release (if tipping behavior confirmed)

### Tier 2 (HIGH - Strongly recommended)
7. **Boreal Forest** dieback
8. **Coral Reefs** (tropical, warm-water)
9. **Alpine Glaciers** loss
10. **West African Monsoon** shift
11. **Indian Summer Monsoon** weakening

### Tier 3 (MEDIUM - If time permits)
12. **Sahel Greening/Drying**
13. **Mediterranean Drying**
14. **Barents Sea Ice** loss
15. **East Antarctic Ice Sheet** (very long timescale)

---

## Base Sources to Start With

### Primary References
1. **Armstrong McKay et al. 2022** (*Nature Climate Change*)
   - "Exceeding 1.5°C global warming could trigger multiple climate tipping points"
   - Has uncertainty ranges for 9 major tipping elements
   - Baseline for current simulation parameters

2. **IPCC AR6 WG1 Chapter 4** (2021)
   - "Future Global Climate: Scenario-Based Projections and Near-Term Information"
   - Consensus ranges for climate response

3. **Lenton et al. 2019** (*Nature*)
   - "Climate tipping points — too risky to bet against"
   - Foundational tipping point framework

### 2024-2025 Updates
Search for recent papers in:
- *Nature Climate Change*
- *Science*
- *Nature*
- *Earth System Dynamics*
- *Proceedings of the National Academy of Sciences*

**Keywords:** "tipping points", "climate thresholds", "threshold uncertainty", "bifurcation", "tipping elements", "irreversible", "critical transitions"

---

## Specific Questions to Answer

### For Each Tipping Element:

1. **Threshold Value**
   - What's the best estimate for the temperature threshold?
   - Has this changed from Armstrong McKay 2022?
   - Is threshold in °C above pre-industrial, or another metric?

2. **Uncertainty Range**
   - What's the min/max plausible range?
   - Is uncertainty symmetric (normal) or skewed (log-normal)?
   - Are there "likely" vs "very likely" confidence bands (IPCC-style)?

3. **Distribution Shape**
   - Do papers explicitly state distribution type?
   - If not, can distribution be inferred from:
     - Confidence intervals (±2σ suggests normal)
     - Expert elicitation (min/mode/max suggests triangular)
     - Physical constraints (positive-only suggests log-normal)
     - Uniform prior (bounded range, no mode)

4. **Time Dependency**
   - Is threshold sensitive to rate of warming?
   - Does threshold change over time as system degrades?
   - Are there hysteresis effects (different threshold for recovery)?

5. **Cascade Interactions**
   - Does crossing this threshold affect other thresholds?
   - Example: Wunderling et al. 2024 shows AMOC collapse lowers Greenland threshold
   - Note: M-5 doesn't model interactions (future work), but document for later

---

## Parameter Extraction Methodology

### Step 1: Identify Uncertainty Statement
Look for phrases like:
- "threshold between 1.4-8.0°C" → Range
- "central estimate 4.0°C" → Mode/mean
- "95% confidence interval [X, Y]" → ±2σ for normal
- "likely in range X-Y" → Expert elicitation
- "best estimate X ± Y°C" → Normal distribution

### Step 2: Determine Distribution Type
Decision tree:
- **Has min/mode/max from expert panel?** → Triangular
- **Confidence intervals reported?** → Normal (mean = central, std = CI/4)
- **Physical constraint (positive-only)?** → Log-normal
- **Only range given, no mode?** → Uniform

### Step 3: Calculate Parameters
Examples:

**Normal:**
```
Central: 4.0°C
95% CI: [2.0, 6.0]°C
→ mean = 4.0, std = (6.0 - 2.0) / 4 = 1.0
```

**Triangular:**
```
Min: 1.4°C, Mode: 4.0°C, Max: 8.0°C
→ params = { min: 1.4, mode: 4.0, max: 8.0 }
```

**Uniform:**
```
Range: 2.0-6.0°C (no preferred value)
→ params = { min: 2.0, max: 6.0 }
```

**Log-normal:**
```
Must be positive, skewed high
Median: 3.0°C, 95% CI: [1.0, 9.0]
→ meanLog = ln(3.0) = 1.099
→ stdLog = (ln(9.0) - ln(1.0)) / 4 = 0.550
```

### Step 4: Document Sources
For each parameter:
- Direct quote from paper
- Page number / figure number
- DOI or arxiv link
- Year of publication
- Peer-review status (journal vs preprint)

---

## Research Standards (CRITICAL)

### Minimum Requirements
1. **2+ peer-reviewed sources** per tipping element (prefer 3+)
2. **2024-2025 papers** if available (2022+ acceptable)
3. **No cherry-picking** - report consensus, note outliers
4. **Uncertainty justified** - explain why distribution type chosen
5. **Contradictions noted** - if sources disagree, document both

### What NOT to Do
❌ Use pre-2020 sources as primary (outdated, use only if recent unavailable)
❌ Use news articles or blogs (not peer-reviewed)
❌ Assume symmetric uncertainty (check for skew)
❌ Ignore physical constraints (log-normal for positive-only)
❌ Use single source for critical parameters

---

## Output Format

Save as: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/tipping_threshold_uncertainty_20251209.md`

### Required Sections

```markdown
# Tipping Point Threshold Uncertainty Distributions

**Research Date:** December 9, 2025
**Researcher:** super-alignment-researcher (Cynthia)
**Purpose:** Extract uncertainty distributions for M-5 implementation

---

## Executive Summary

[2-3 paragraphs: Key findings, distribution types selected, confidence level]

---

## Tipping Element: AMOC Collapse

**Central Estimate:** 4.0°C above pre-industrial
**Uncertainty Range:** 1.4-8.0°C
**Distribution Type:** Triangular
**Distribution Parameters:**
- min: 1.4°C
- mode: 4.0°C
- max: 8.0°C

**Justification:** Armstrong McKay et al. 2022 provides expert-elicited range with central estimate. Triangular distribution matches expert elicitation methodology. Wide range reflects deep uncertainty in AMOC stability.

**Source 1:** Armstrong McKay et al. 2022, Nature Climate Change
- DOI: 10.1038/s41558-022-01537-1
- Quote: "AMOC collapse threshold: central estimate 4.0°C (1.4-8.0°C)"
- Page: Figure 2, Table 1

**Source 2:** [2024-2025 update if found, otherwise note absence]

**Confidence:** Medium (wide uncertainty range, limited observational data)

**Interaction Effects:** Wunderling et al. 2024 shows AMOC collapse can lower Greenland Ice Sheet threshold by ~0.5°C (cascade effect, NOT modeled in M-5)

---

[Repeat for each tipping element]

---

## Distribution Type Decision Matrix

| Element | Type | Rationale |
|---------|------|-----------|
| AMOC | Triangular | Expert elicitation with mode |
| Greenland | Normal | Confidence intervals reported |
| Amazon | Uniform | Range only, no preferred value |
| ... | ... | ... |

---

## Research Gaps

[Which elements lack good uncertainty data? Where are sources contradictory?]

---

## Recommendations for Implementation

[Guidance for feature-implementer based on research findings]

---

## References

[Full bibliography in APA format]
```

---

## Quality Gate Preparation

After completing research, it will be reviewed by **research-skeptic (Sylvia)** who will check for:
- Cherry-picking (favorable estimates selected)
- Methodological flaws (distribution type unjustified)
- Source quality (non-peer-reviewed or outdated)
- Contradictory evidence (papers that disagree, ignored)
- Parameter extraction errors (math mistakes)

**Preemptive self-check:**
- Have you documented contradictory findings?
- Are distribution choices justified by methodology (not convenience)?
- Do confidence intervals match reported uncertainty?
- Are physical constraints respected (positive-only for log-normal)?

---

## Timeline

**Start:** Dec 9, 2025
**Deliverable:** By end of Dec 9, 2025 (2-3 hours estimated)
**Handoff:** Post completion to `.claude/chatroom/channels/research.md`, tag orchestrator-1

**Next Step:** research-skeptic validation (Quality Gate 1)

---

## Questions / Clarifications

If uncertain about:
- Distribution type selection → Post question to `research.md` channel
- Contradictory sources → Document both, let skeptic adjudicate
- Missing data for element → Note gap, proceed with best available

**Chatroom:** `.claude/chatroom/channels/research.md`
**Status updates:** Post IN-PROGRESS every 30 mins

---

**Good luck, Cynthia! This research will enable realistic uncertainty modeling in the simulation. 🔬**
