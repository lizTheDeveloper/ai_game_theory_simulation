# Monte Carlo Outcome Distribution Analysis

**Created:** December 1, 2025
**Priority:** LOW
**Effort:** 2-3 hours

---

## Rationale

Recent Monte Carlo runs achieved first utopia (run 42007) and restored outcome diversity (22.4-90.6% mortality). However, we lack systematic analysis of outcome tier distribution, parameter sensitivity, and bifurcation patterns.

**Gap:** No systematic classification of outcomes across runs, unknown sensitivities, bifurcation thresholds not quantified.

---

## Scope

Analyze N≥50 Monte Carlo runs to classify outcomes into 7 tiers and validate bifurcation thresholds:

**7-tier classification:**
1. Utopia (0-10% mortality)
2. Flourishing (10-30%)
3. Status Quo (30-50%)
4. Decline (50-70%)
5. Collapse (70-90%)
6. Near-Extinction (90-99%)
7. Extinction (99-100%)

**Analyses:**
- Distribution statistics (mean, std, mode)
- Bifurcation threshold validation (0.60 ± 0.10)
- Parameter sensitivity identification

---

## Success Criteria

1. All N≥50 runs classified into outcome tiers
2. Distribution statistics calculated
3. Bifurcation threshold validated or updated
4. Report saved to `reviews/monte_carlo_outcome_analysis_YYYYMMDD.md`
5. Anomalies identified (if any)

---

## Sources

- Analysis of existing data in `monteCarloOutputs/`
- Technology bifurcation investigation (Nov 29, 2025)
