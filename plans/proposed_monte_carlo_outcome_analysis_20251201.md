# Proposed: Monte Carlo Outcome Distribution Analysis

**Date:** December 1, 2025
**Priority:** LOW
**Complexity:** 1 system (analysis only)
**Effort:** 2-3 hours

## Problem Statement

Recent Monte Carlo runs achieved first utopia (run 42007) and restored outcome diversity (22.4-90.6% mortality). However, we lack systematic analysis of:
- Outcome tier distribution across runs (utopia/flourishing/status quo/collapse/extinction)
- Parameter sensitivity (which inputs drive which outcomes?)
- Bifurcation patterns (when does technology adoption matter?)

## Current State

**Recent Achievements:**
- Technology bifurcation: 0% → 100% (fixed Nov 29)
- Outcome diversity: First utopia achieved
- Mortality range: Realistic variation restored

**Gap:**
- No systematic outcome classification
- Unknown parameter sensitivity
- Bifurcation thresholds not quantified

## Proposed Solution

### Phase 1: Outcome Classification Framework (1h)

Define 7-tier outcome classification:
1. **Utopia** (0-10% mortality)
2. **Flourishing** (10-30% mortality)
3. **Status Quo** (30-50% mortality)
4. **Decline** (50-70% mortality)
5. **Collapse** (70-90% mortality)
6. **Near-Extinction** (90-99% mortality)
7. **Extinction** (99-100% mortality)

Classify existing Monte Carlo outputs into tiers.

### Phase 2: Distribution Analysis (1h)

Analyze N≥50 recent runs:
- Count outcomes per tier
- Calculate mean/median mortality by tier
- Identify modal outcome (most common)
- Check for bimodality (two distinct outcome clusters)

### Phase 3: Bifurcation Threshold Analysis (0.5-1h)

For runs with technology deployment:
- Correlate adoption rate with outcome tier
- Identify critical bifurcation threshold
- Validate against current 0.60 threshold (±0.10 uncertainty)

## Research Needed

**Minimal** - this is analysis of existing data, not new parameter calibration.

Optional: Review resilience literature on outcome classification (flourishing vs collapse thresholds).

## Expected Impact

**Benefits:**
- Quantify outcome diversity (is 7-tier spread realistic?)
- Validate bifurcation threshold (0.60 ± 0.10)
- Identify parameter sensitivities for future sweeps
- Inform policy implications (which interventions matter most?)

**Risks:**
- Low - read-only analysis, no code changes
- May reveal unwanted outcome clustering (e.g., 80% collapse)

## Implementation Strategy

1. **Data Collection:**
   - Parse monteCarloOutputs/ directory
   - Extract final mortality, tier classification from each run
   - Save to CSV for analysis

2. **Analysis:**
   - Use simple Python/TypeScript script
   - Calculate distribution statistics
   - Visualize with histogram (optional)

3. **Report:**
   - Save findings to reviews/monte_carlo_outcome_analysis_20251201.md
   - Post summary to coordination channel
   - Update roadmap if anomalies found

## Success Metrics

- All N≥50 runs classified into outcome tiers
- Distribution statistics calculated (mean, std, mode)
- Bifurcation threshold validated or updated
- Anomalies identified (if any)

## Notes

- **Token efficiency:** Use bash/jq to parse JSON, avoid reading files in Claude
- **Scope:** Analysis only, no simulation changes
- **Follow-up:** If anomalies found, may spawn parameter sweep or calibration work
