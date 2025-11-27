# Research Verification: Volcanic Forcing Phase (6f3037c)

**Date:** November 27, 2025
**Commit:** 6f3037c69122c3bec451975e4c9f7d1706368ebc
**System:** VolcanicForcingPhase (order 16.5)
**Files Changed:** `src/types/game.ts`, `src/simulation/engine/phases/VolcanicForcingPhase.ts`

## Purpose

This system models radiative forcing from volcanic eruptions for historical validation (1990-2010 hindcast). Critical for capturing Mount Pinatubo cooling.

---

## Citations to Verify

### Citation 1: Hansen et al. (2005)

**File:** `src/types/game.ts:432`, `src/simulation/engine/phases/VolcanicForcingPhase.ts:31`
**Claim in Code:** "Hansen et al. (2005) volcanic AOD data"

**Layer 1 - Citation Existence:**
- [ ] Paper exists?
- [ ] Correct author/year?
- [ ] Full citation: Hansen, J., et al. (2005). ???

**Layer 2 - Claim Verification:**
- [ ] Does paper provide volcanic AOD data?
- [ ] If yes, quote the specific passage/table supporting AOD values used
- [ ] Does paper support Pinatubo peak AOD ≈ 0.15?

**Current Value Used:** Peak AOD = 0.15 (VolcanicForcingPhase.ts:65)

---

### Citation 2: Sato et al. (1993)

**File:** `src/types/game.ts:432`, `src/simulation/engine/phases/VolcanicForcingPhase.ts:32,66`
**Claim in Code:** "Sato et al. (1993) volcanic AOD data", "τ ≈ 1.5 years (Sato et al. 1993)"

**Layer 1 - Citation Existence:**
- [ ] Paper exists? Full title: "Stratospheric Aerosol Optical Depth, 1850-1990"
- [ ] Correct author/year?
- [ ] Publication venue?

**Layer 2 - Claim Verification:**
- [ ] Does paper provide volcanic AOD reconstructions?
- [ ] Does paper state τ ≈ 1.5 years (18 months) decay timescale?
- [ ] Quote the specific passage supporting decay timescale

**Current Values Used:**
- Decay timescale = 18 months (VolcanicForcingPhase.ts:55,66)

---

### Citation 3: IPCC AR6 WG1 Chapter 7

**File:** `src/simulation/engine/phases/VolcanicForcingPhase.ts:13,30,65,164-165`
**Claim in Code:**
- "Radiative forcing = -25 W/m² per unit AOD (IPCC AR6 WG1)"
- "Peak AOD ≈ 0.15, -0.3°C cooling" (attributed to IPCC/NASA GISS)

**Layer 1 - Citation Existence:**
- [ ] IPCC AR6 WG1 Chapter 7 exists?
- [ ] Chapter covers volcanic forcing?

**Layer 2 - Claim Verification:**
- [ ] Does IPCC AR6 state forcing = -25 W/m² per unit AOD?
- [ ] If not exact value, what range does it give?
- [ ] Quote the specific section/figure supporting this

**Current Values Used:**
- Forcing coefficient = -25 W/m² per unit AOD (VolcanicForcingPhase.ts:165)

---

### Citation 4: Pinatubo Effects (Implicit)

**File:** `src/simulation/engine/phases/VolcanicForcingPhase.ts:8,17,63-67`
**Claim in Code:**
- "Pinatubo (June 1991) cooling of -0.2 to -0.3°C during 1991-1993"
- "Peak AOD ≈ 0.15"
- "Month 18 (18 months after Jan 1990)"

**Layer 1 - Citation Existence:**
- [ ] Verify Pinatubo eruption date (June 1991)
- [ ] Find authoritative source for cooling magnitude

**Layer 2 - Claim Verification:**
- [ ] Was global cooling ~0.2-0.3°C?
- [ ] Was peak stratospheric AOD ~0.15?
- [ ] Is month offset calculation correct (June 1991 = Month 18 from Jan 1990)?

**Verification Math:** Jan 1990 = Month 0, so June 1991 = 17 months? (Jan 1990 → Dec 1990 = 12 months, Jan-June 1991 = 6 months, total = 18 months including start month)

---

## Parameters Summary

| Parameter | Value | Source Cited | Verified? |
|-----------|-------|--------------|-----------|
| Pinatubo peak AOD | 0.15 | IPCC AR6/NASA GISS | [ ] |
| AOD decay τ | 18 months | Sato et al. (1993) | [ ] |
| Forcing coefficient | -25 W/m²/AOD | IPCC AR6 WG1 | [ ] |
| Pinatubo cooling | 0.2-0.3°C | Implicit | [ ] |
| Pinatubo date | June 1991 (Month 18) | Historical record | [ ] |

---

## Validation Priority

**HIGH** - This phase is critical for historical validation (H-7 mini-hindcast temperature). Without validated parameters, the hindcast may produce incorrect temperature anomalies.

---

## Notes for Validator

1. The forcing formula `F = -25 * AOD` is a simplification. IPCC may use more complex formulations.
2. Decay timescale may vary by eruption type/latitude. Confirm Pinatubo-specific value.
3. The 0.3°C cooling claim should be verified against observational records (GISS, HadCRUT).
4. Consider if the implementation correctly handles the temperature response lag (climate inertia).

---

## Status

- [ ] Layer 1 verification complete (all citations exist)
- [ ] Layer 2 verification complete (all claims supported)
- [ ] Parameters validated or corrected
- [ ] Validation report written
