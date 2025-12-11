# Precision Fermentation Citation Fix

**Created:** December 11, 2025
**Priority:** HIGH
**Effort:** 1-2 hours
**GitHub Issue:** #796
**Review:** reviews/architecture_skeptic_20251211.md, research-skeptic verification

---

## Rationale

Research-skeptic verification found **partial fabrication** in precision fermentation nitrogen reduction citations:

- ❌ **CE Delft (2021)** - FABRICATED (no such study exists; CE Delft work is on cultivated meat 2019)
- ❌ **FAO (2024)** - MISATTRIBUTED (actually Grossmann et al. 2024 in *Biotechnology Advances*)
- ❌ **GFI (2024)** - MISAPPLIED (addresses cost parity $10/kg, not nitrogen reduction)

**Grade:** C (65%) - Mechanism directionally sound, but citation trail problematic

---

## Scope

**File:** `src/simulation/techTree/comprehensiveTechTree.ts:667,687`

**Replace incorrect citations** with peer-reviewed sources:
- Poore & Nemecek (2018), Science 360(6392):987-992
- Grossmann et al. (2024), Biotechnology Advances 73:108367
- Bouwman et al. (2013), PNAS 110(52):21199-21204

**Adjust parameters:**
- **Effectiveness range:** 30-50% → 25-40%
- **Parameter:** `nitrogenReduction: 0.40` → `0.33`

---

## Success Criteria

1. Citations replaced with verified peer-reviewed sources
2. Parameter adjusted to `0.33` (midpoint of defensible 25-40% range)
3. Effectiveness range documentation updated
4. Monte Carlo validation shows no breaking changes (±5% variance acceptable)
5. Research grade improves from C to A-/B+

---

## Sources

- Research-skeptic verification (Dec 11, 2025)
- Architecture-skeptic review (Grade B-, HIGH-1 priority)
- Poore & Nemecek (2018), Science - animal agriculture nitrogen use
- Grossmann et al. (2024), Biotechnology Advances - precision fermentation effectiveness
- Bouwman et al. (2013), PNAS - global nitrogen flows
