# Pull Request

## Description

<!-- Briefly describe the changes in this PR -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Research update (new citations, parameter changes)
- [ ] Refactoring (no functional changes)

## Four-Layer Validation Framework

**ALL features must pass all 4 layers before merge.** See [Four-Layer Validation Framework](../docs/wiki/README.md#-four-layer-validation-framework) for details.

### Layer 1 - Code Integrity

- [ ] All calculations use assertion utilities (no `?? fallback` or `|| 0` patterns)
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)
- [ ] RNG properly seeded (deterministic, not `Math.random()`)
- [ ] Division-by-zero protected
- [ ] No silent error hiding

**Validation by:** `simulation-maintainer` (Roy)

### Layer 2 - Research Integrity

- [ ] 2+ peer-reviewed citations per mechanic
- [ ] Parameters justified with empirical data (not "feels right")
- [ ] Research skeptic review passed (contradictions addressed)
- [ ] Citations added to Zotero library
- [ ] No fabricated citations (LLM hallucinations)

**Validation by:** `super-alignment-researcher` (Cynthia) + `research-skeptic` (Sylvia)

**Research files:**
<!-- Link to research files in /research/ directory -->

### Layer 3 - Statistical Validation

- [ ] Monte Carlo N≥10 runs completed
- [ ] Determinism CV < 0.01% verified (reproducible with same seed)
- [ ] Effectiveness metrics calculated and reasonable
- [ ] Distributions match expected statistical patterns (S-curves, log-normal, power-law)
- [ ] No zero-effectiveness interventions (unless intentional)

**Validation by:** `quantitative-validator` (Priya)

**Monte Carlo logs:**
<!-- Link to logs in /logs/ directory -->

### Layer 4 - Mechanism Validation

- [ ] Extended runs show realistic behavior (no unrealistic runaway effects)
- [ ] Failure modes documented and tested
- [ ] Success paths validated (not just absence of failure)
- [ ] Architecture review passed (no CRITICAL/HIGH issues)
- [ ] Interaction effects with other systems considered

**Validation by:** `architecture-skeptic` + domain specialists

**Architecture review:**
<!-- Link to review in /reviews/ directory -->

---

## Testing

### Unit Tests

- [ ] New tests added for new functionality
- [ ] All existing tests pass (`npm test`)
- [ ] Test coverage maintained or improved

### Integration Tests

- [ ] Cross-system interactions tested
- [ ] Edge cases covered (extreme values, boundary conditions)
- [ ] Regression tests for known bugs

### Manual Testing

<!-- Describe manual testing performed -->

---

## Documentation

- [ ] Wiki updated (`docs/wiki/README.md`)
- [ ] DevLog created (`devlogs/`)
- [ ] Code comments added for complex logic
- [ ] Research documentation updated (`research/`)
- [ ] MASTER_IMPLEMENTATION_ROADMAP.md updated (if applicable)

---

## Agent Review

**Which agent pairs reviewed this?**

- Code review:
- Research review:
- Statistical review:
- Architecture review:

---

## Checklist

- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
- [ ] I have verified this PR passes all 4 validation layers

---

## Breaking Changes

<!-- List any breaking changes and migration steps -->

## Related Issues

<!-- Link related GitHub issues -->
Closes #

---

**Note:** For complex features, consider using the `orchestrator` agent to coordinate the full validation workflow. See `docs/DEVELOPMENT_WORKFLOW.md` for details.
