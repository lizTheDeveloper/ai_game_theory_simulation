# Research Verification Task for Sylvia (research-skeptic)

**Date:** 2025-11-13
**Status:** READY FOR LAYER 2 VERIFICATION
**Priority:** MEDIUM

---

## Context

Layer 1 (citation existence) is COMPLETE for both papers:
- ✅ Richardson et al. (2023) - Science Advances - verified
- ✅ Findlay et al. (2025) - Global Change Biology - verified

**Now proceeding to Layer 2: Deep claim verification**

---

## Your Task

Verify **16 quantitative claims** across two papers by accessing full text and extracting supporting quotes.

**Verification file:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/verification_e8951e3_20251111.md`

---

## Paper 1: Richardson et al. (2023)

**Citation:** Richardson, K., et al. (2023). "Earth beyond six of nine planetary boundaries." *Science Advances*, 9(37), eadh2458. DOI: 10.1126/sciadv.adh2458

**Access:** PMC10499318 or DOI

**9 Claims to Verify (lines 38-130 in verification file):**

1. **Six of nine boundaries transgressed** (line 39) - Does paper explicitly state this?
2. **CO₂ at 417 ppm, boundary 350 ppm, 19% overshoot** (line 46) - Verify all three numbers
3. **>100 E/MSY extinctions, boundary <10 E/MSY, 10× overshoot** (line 56) - Verify extinction rate metrics
4. **30% HANPP, boundary <10%, 3× overshoot** (line 66) - Verify human appropriation percentages
5. **60% forest cover, boundary 75%, approaching critical** (line 76) - Verify land system values
6. **190 Tg N/year, boundary 62 Tg N/year, 3× overshoot** (line 86) - Verify nitrogen flows
7. **22.6 Tg P/year, boundary 11 Tg P/year, 2× overshoot** (line 96) - Verify phosphorus flows
8. **284.6 DU ozone, boundary 276 DU, recovering** (line 106) - Verify stratospheric ozone
9. **Land restoration as carbon sink quote** (line 117) - Verify this specific quote exists

**For each claim:**
- Find the exact passage in the paper
- Extract verbatim quote supporting the claim
- Mark as ✅ VERIFIED, ⚠️ PARTIALLY VERIFIED, or ❌ UNVERIFIED
- Update verification file checkboxes (lines 42-129)

---

## Paper 2: Findlay et al. (2025)

**Citation:** Findlay, H.S., Feely, R.A., Jiang, L., Pelletier, G., Bednaršek, N. (2025). "Ocean Acidification: Another Planetary Boundary Crossed." *Global Change Biology*, 31(6), e70238. DOI: 10.1111/gcb.70238

**Access:** PMID 40485607 or DOI (Wiley blocks automated fetch, use PubMed Central or institutional access)

**7 Claims to Verify (lines 152-231 in verification file):**

1. **40% surface ocean crossed, 20% aragonite reduction threshold, by 2020** (line 152) - Verify all components
2. **60% subsurface (0-200m) crossed** (line 162) - Verify depth range and percentage
3. **Regional breakdown: Arctic 26%, N.Pacific 22%, Southern 22%, N.Atlantic 20%** (line 172) - Verify all four values
4. **Arctic undersaturation: 5% pre-industrial → 21% in 2020 (4× increase)** (line 185) - Verify all numbers
5. **Habitat loss: 43% coral reefs, 61% pteropods, 13% bivalves** (line 196) - Verify all three percentages
6. **CO₂ reduction ONLY mechanism, SSP1-2.6 outcomes, 100% by 2100, timelines** (line 208) - Verify reversibility claims
7. **10% revised boundary, surpassed by 2000** (line 222) - Verify proposed threshold and date

**For each claim:**
- Find the exact passage or table in the paper
- Extract verbatim quote supporting the claim
- Mark as ✅ VERIFIED, ⚠️ PARTIALLY VERIFIED, or ❌ UNVERIFIED
- Update verification file checkboxes (lines 158-230)

---

## Output Required

1. **Update verification file** with all checkboxes marked and quotes added
2. **Create summary document** listing:
   - ✅ Fully verified claims (count)
   - ⚠️ Partially verified claims (count + explanation)
   - ❌ Unverified claims (count + why)
3. **Parameter recommendations:** If claims verified, list simulation parameters that should be updated (see lines 234-268 in verification file)

---

## Access Strategy

**Richardson et al. (2023):**
- PubMed Central: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10499318/
- Direct DOI: https://doi.org/10.1126/sciadv.adh2458

**Findlay et al. (2025):**
- PubMed: https://pubmed.ncbi.nlm.nih.gov/40485607
- Note: Wiley blocks WebFetch (403), may need alternative access method
- Try PubMed Central or institutional link

---

## Verification Standards

**✅ VERIFIED:** Paper explicitly states the claim with matching numbers
**⚠️ PARTIALLY VERIFIED:** Paper supports claim but numbers differ slightly, or claim is inferred from data
**❌ UNVERIFIED:** Claim not found in paper, or contradicted by paper

**Always provide verbatim quotes** - no paraphrasing for numerical claims.

---

## Timeline

This is **MEDIUM priority** literature review work. Take time to access papers properly and extract accurate quotes. Quality over speed.

---

## Next Steps After Your Work

1. Orchestrator reviews your verification results
2. If ✅ VERIFIED: simulation-maintainer gets parameter update recommendations
3. Architect archives verification file to /research/completed/
4. Wiki-documentation-updater syncs to docs

---

Good luck, Sylvia! These are high-impact papers (Science Advances IF=11.7, GCB IF=11.6) so thorough verification is critical.

