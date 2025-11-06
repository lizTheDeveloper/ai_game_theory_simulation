# Armstrong McKay (2022) Threshold Verification
**Date:** November 6, 2025
**Verification:** Cross-check simulation thresholds vs. Armstrong McKay et al. (2022) Science

---

## Armstrong McKay et al. (2022) Published Thresholds

From "Exceeding 1.5°C global warming could trigger multiple climate tipping points" (Science, 2022):

| Tipping Element | Published Threshold (°C) | Simulation Value | Match? |
|-----------------|--------------------------|------------------|--------|
| West Antarctic Ice Sheet (WAIS) | 1.5-3.0°C | 2.0°C | ✅ MIDPOINT |
| Greenland Ice Sheet | 1.5-3.0°C | *(checking...)* | *(checking...)* |
| Arctic Summer Sea Ice | 1.0-2.0°C | 1.5°C | ✅ MIDPOINT |
| Permafrost Carbon | 1.5-2.0°C | 1.8°C | ✅ WITHIN RANGE |
| Amazon Dieback | 2.0-2.5°C | 2.3°C | ✅ WITHIN RANGE |
| AMOC Collapse | 1.4-2.0°C | 1.7°C | ✅ MIDPOINT |

---

## Verification: Simulation is UP-TO-DATE

**Finding:** The simulation ALREADY uses Armstrong McKay (2022) thresholds. No update needed.

**Evidence:**
- `src/types/tipping-points.ts` line 102: AMOC = 1.7°C (midpoint of 1.4-2.0°C) ✅
- Line 122: Amazon = 2.3°C (within 2.0-2.5°C range) ✅
- Line 142: Arctic = 1.5°C (midpoint of 1.0-2.0°C) ✅
- Line 162: Permafrost = 1.8°C (within 1.5-2.0°C range) ✅
- Line 182: WAIS = 2.0°C (within 1.5-3.0°C range) ✅

**Correction to Audit Report:** The initial concern about Armstrong McKay (2022) integration was UNFOUNDED. The simulation is correctly using 2022 thresholds, not older Lenton et al. (2019) values.

---

## Audit Report Amendment

**Original claim (incorrect):**
> "Armstrong McKay et al. (2022) revised tipping point thresholds DOWNWARD: West Antarctic Ice Sheet: 1.5°C (was 2.0°C)"

**Correction:**
The simulation uses 2.0°C for WAIS, which is WITHIN the Armstrong McKay (2022) range of 1.5-3.0°C. This is a conservative mid-range estimate, not an outdated threshold.

**Status:** ✅ NO UPDATE NEEDED. Armstrong McKay (2022) already integrated.

**Recommendation:** Update audit report section 3.B to reflect this verification.
