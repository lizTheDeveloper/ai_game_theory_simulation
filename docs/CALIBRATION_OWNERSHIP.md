# Calibration Ownership Registry

**Purpose:** Prevent calibration conflicts in multi-worker git architecture by coordinating ownership.

**Created:** December 10, 2025
**Maintainer:** Autonomous workers + architect agent

---

## Protocol

When calibrating simulation parameters:

1. **Check this registry** - Verify parameter status is STABLE (not ACTIVE)
2. **Claim ownership** - Mark parameter as ACTIVE with your worker ID and timestamp
3. **Document research** - Use `research/calibration_template.md` for rationale
4. **Perform calibration** - Tune parameters, validate with Monte Carlo N≥10
5. **Release ownership** - Mark STABLE and add to Recently Completed

**Ownership duration:** Maximum 7 days. After 7 days, ownership expires and parameter returns to STABLE.

---

## Active Calibrations

| Parameter | Location | Status | Owner | Started | Notes |
|-----------|----------|--------|-------|---------|-------|
| *(none)* | - | - | - | - | No active calibrations |

---

## Recently Completed (Last 30 Days)

| Parameter | Location | Status | Last Updated | Rationale | Notes |
|-----------|----------|--------|--------------|-----------|-------|
| Ocean pH recovery rate | `oceanAcidification.ts` | STABLE | Nov 28, 2025 | IPCC AR6 WG1 Ch5 | 70% reduction baseline (competing 50% calibration rejected) |
| Climate bifurcation multipliers | `variance.ts` | STABLE | Nov 13, 2025 | Session 21 architecture review | Reduced by 30% to address 87.2% mortality overshoot |
| Threshold lowering cascade | `climateThresholds.ts` | STABLE | Dec 7, 2025 | Wunderling et al. (2024) | Conditional stability floor added |
| Energy budget allocations | `EnergyBudgetPhase.ts` | STABLE | Dec 9, 2025 | Integration of all energy consumers | System-wide energy tracking unified |

---

## Stable Parameters (Available for Calibration)

All parameters not listed in "Active Calibrations" are STABLE and available for calibration work.

**Critical parameters requiring pre-coordination:**
- Ocean acidification thresholds
- Climate tipping point multipliers
- AI capability growth rates
- Population mortality baselines
- Economic collapse thresholds
- Planetary boundary values

**Before calibrating these:** Check this registry, claim ownership, document rationale.

---

## Conflict Resolution

If you encounter a git merge conflict in calibration values:

1. **Check this registry** - Determine which calibration has documented ownership
2. **Compare research backing** - Which calibration has stronger peer-reviewed justification?
3. **Defer to quality** - Keep calibration with better research documentation
4. **Document decision** - Add note to Recently Completed explaining why other calibration was rejected

**Example:** Ocean pH (Nov 28) - 70% reduction kept (IPCC AR6), 50% reduction rejected (weaker backing)

---

## Audit Trail

All calibration ownership changes are tracked in git history for this file. Use `git log docs/CALIBRATION_OWNERSHIP.md` to see full audit trail.

**Automatic cleanup:** Architect agent updates this file at end of sessions to expire old ownership claims and archive completed work.

---

**See also:**
- `research/calibration_template.md` - Documentation template for calibration rationale
- `docs/DEVELOPMENT_WORKFLOW.md` - Full development workflow including calibration protocol
- `reviews/research_validation_audit_*.md` - Research quality audits
