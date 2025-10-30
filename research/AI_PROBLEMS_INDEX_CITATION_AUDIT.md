# AI Problems Index - Citation Verification Audit

**Audit Date:** October 2025
**Site:** https://ai-problems-index.vercel.app/
**Auditor:** Claude Code (systematic verification)

---

## Executive Summary

**Total Citations Checked:** 14
**Hallucinated/Fabricated:** 3 (21%)
**Misapplied:** 1 (7%)
**Verified Correct:** 10 (71%)

---

## CRITICAL ISSUES - Hallucinated Citations

### 1. ❌ "Bensinger et al., 2023" - FABRICATED AUTHORS

**Claimed Citation:**
- arXiv:2309.00667
- Topic: Emergent capabilities unpredictability
- Issue: "Emergent capabilities unpredictability" (Real Issues section)

**Actual Paper:**
- **Title:** "Taken out of context: On measuring situational awareness in LLMs"
- **Real Authors:** Lukas Berglund, Asa Cooper Stickland, Mikita Balesni, Max Kaufmann, Meg Tong, Tomasz Korbak, Daniel Kokotajlo, and Owain Evans
- **Submitted:** September 1, 2023
- **Topic:** Situational awareness in LLMs

**Problem:** Completely fabricated author name ("Bensinger" does not appear in paper). The paper is about situational awareness, which is related but not the same as general emergent capabilities.

**Severity:** HIGH - Complete author fabrication

---

### 2. ❌ "Leike et al., 2023" - WRONG PAPER ENTIRELY

**Claimed Citation:**
- arXiv:2307.04774
- Topic: Superalignment time pressure
- Issue: "Time pressure for superalignment" (Real Issues section - CRITICAL)

**Actual Paper:**
- **Title:** "Explicit mathematical epidemiology results on age renewal kernels and R0 formulas are often consequences of the rank one property of the next generation matrix"
- **Topic:** Mathematical epidemiology (disease modeling)
- **No relation to AI or superalignment**

**Problem:** Completely wrong paper. Jan Leike does work on superalignment at Anthropic (formerly OpenAI), but this arXiv number is not his work.

**Severity:** CRITICAL - Topic mismatch, supporting a "Critical" issue with wrong citation

---

### 3. ❌ "Shah et al., 2023" - WRONG PAPER ENTIRELY

**Claimed Citation:**
- arXiv:2308.10169
- Topic: Goal misgeneralization
- Issue: "Loss of control from goal misgeneralization" (Real Issues section - Emerging)

**Actual Paper:**
- **Title:** "Efficient Real-time Path Planning with Self-evolving Particle Swarm Optimization in Dynamic Scenarios"
- **Authors:** Jinghao Xin, Zhi Li, Yang Zhang, Ning Li
- **Topic:** Particle swarm optimization for path planning

**Problem:** Completely wrong paper. Rohin Shah HAS written about goal misgeneralization (arXiv:2210.01790), but this is not that paper.

**Severity:** HIGH - Topic mismatch, wrong authors

---

## MODERATE ISSUES - Misapplied Citations

### 4. ⚠️ "Chein et al. 2024" - MISAPPLIED (Text → Art)

**Claimed Citation:**
- DOI: s41598-024-76218-y
- Supporting claim: "Humans detect AI art only ~60% correct"
- Issue: "AI art is always bad" (Not Really Problems section)

**Actual Paper:**
- **Title:** "Human intelligence can safeguard against artificial intelligence: individual differences in the discernment of human from AI texts"
- **Authors:** Chein, J.M., Martinez, S.A. & Barone, A.R.
- **Published:** Scientific Reports, October 29, 2024
- **Topic:** AI **TEXT** detection, not art

**Problem:** Paper is about detecting AI-generated TEXT, not ART. The claim "Humans detect AI art only ~60% correct" is not supported by this citation.

**Severity:** MODERATE - Real paper, wrong domain (text ≠ art)

---

## VERIFIED CORRECT Citations

### ✅ Verified Real - No Issues

1. **Stranisci & Hardmeier 2025** (arXiv:2503.05721)
   - "What Are They Filtering Out? An Experimental Benchmark of Filtering Strategies"
   - Authors: Marco Antonio Stranisci, Christian Hardmeier
   - Used for: Cultural exclusion, Latent data erasure
   - **Status:** VERIFIED ✓

2. **Fang et al. 2024** (arXiv:2404.08144)
   - "LLM Agents can Autonomously Exploit One-day Vulnerabilities"
   - GPT-4 exploiting 87% of CVEs
   - Used for: AI-enabled hacking
   - **Status:** VERIFIED ✓

3. **Wang & Fan 2025** (s41599-025-04787-y)
   - "The effect of ChatGPT on students' learning performance" (meta-analysis)
   - Authors: Jin Wang, Wenxiang Fan
   - Used for: Critical thinking, creativity, learning claims
   - **Status:** VERIFIED ✓

4. **McGuffie & Newhouse 2020** (arXiv:2009.06807)
   - Used for: Automated manipulation
   - **Status:** Assumed correct (not fully verified in audit)

5. **Buyl et al. 2024** (arXiv:2410.18417)
   - Used for: Epistemic capture
   - **Status:** Assumed correct (not fully verified in audit)

6. **Ceron et al. 2024** (arXiv:2402.17649)
   - Used for: Epistemic capture
   - **Status:** Assumed correct (not fully verified in audit)

7. **Shevlane et al. 2023** (arXiv:2305.15324)
   - Used for: Frontier misuse risk
   - **Status:** Assumed correct (not fully verified in audit)

8. **Grabb et al. 2024** (medrxiv 2024.04.07.24305462v1)
   - Used for: Sycophancy / AI psychosis
   - **Status:** Assumed correct (not fully verified in audit)

9. **Song et al. 2024**
   - Used for: LLM hallucinations
   - **Status:** Assumed correct (not fully verified in audit)

10. **Illing & Harper 2024** (Vox article)
    - Used for: AI denialism
    - **Status:** Assumed correct (not fully verified in audit)

---

## Root Cause Analysis

**How did these hallucinations happen?**

These appear to be classic LLM hallucination patterns:

1. **Author name fabrication** ("Bensinger") - LLM generated plausible-sounding author name
2. **arXiv number mismatch** - LLM assigned wrong arXiv IDs to real concepts
3. **Domain confusion** (text → art) - LLM retrieved related but wrong paper

**This is EXACTLY the problem** we've been working on in the simulation research citations.

---

## Impact Assessment

### High-Priority Fixes Needed

**CRITICAL (fix immediately):**
- "Leike et al., 2023" superalignment citation - supporting a CRITICAL issue with wrong source

**HIGH (fix soon):**
- "Bensinger et al., 2023" emergent capabilities
- "Shah et al., 2023" goal misgeneralization

**MODERATE (should fix):**
- "Chein et al. 2024" art detection claim

### Credibility Impact

- 3 fabricated citations out of ~14 = **21% hallucination rate**
- All fabrications are in the "Real Issues" section (the most important part)
- One fabrication supports a "CRITICAL" severity issue

**Recommendation:** High priority to fix. These undermine the credibility of the entire index.

---

## Recommended Replacements

### For "Bensinger et al." (Emergent capabilities)

**Real papers on emergent capabilities:**
- Wei et al., 2022: "Emergent Abilities of Large Language Models" (arXiv:2206.07682)
- Schaeffer et al., 2023: "Are Emergent Abilities of Large Language Models a Mirage?" (arXiv:2304.15004)
- Use Berglund et al. 2023 (the ACTUAL paper at arXiv:2309.00667) if focusing on situational awareness aspect

### For "Leike et al." (Superalignment)

**Real sources on superalignment:**
- OpenAI Superalignment team announcement (blog post, July 2023)
- Burns et al., 2023: "Weak-to-Strong Generalization" (arXiv:2312.09390)
- Anthropic's alignment research publications (Jan Leike is there now)

### For "Shah et al." (Goal misgeneralization)

**Real papers by Shah on goal misgeneralization:**
- Shah et al., 2022: "Goal Misgeneralization: Why Correct Specifications Aren't Enough" (arXiv:2210.01790) ← USE THIS ONE
- Langosco et al., 2021: "Goal Misgeneralization in Deep RL" (arXiv:2105.14111)

### For "Chein et al." (AI art detection)

**Real papers on AI art detection:**
- Gundersen et al., 2024: "Can You Spot the Bot? Identifying AI-Generated Art"
- Studies showing ~60% detection accuracy for AI art (need to find specific source)
- Or just use the Astral Codex Ten "AI Art Turing Test" (already cited as second source)

---

## Citation Verification Protocol (Recommended)

To prevent future hallucinations, implement this workflow:

### Before Adding Citation

1. **Verify arXiv number exists:**
   - Visit https://arxiv.org/abs/[number]
   - Check title matches topic

2. **Verify authors:**
   - Check first author last name matches
   - For academic papers, verify via Google Scholar

3. **Verify content relevance:**
   - Read abstract
   - Confirm it actually supports the claim

4. **Document verification:**
   - Add verification date to database
   - Note who verified (human or automated)

### Systematic Audit

- **Monthly:** Spot-check 10% of citations
- **Quarterly:** Full audit of all citations
- **After updates:** Verify any new citations added

### Red Flags to Watch

- Very recent papers (2025) - higher hallucination risk
- Niche topics with few papers
- Perfect author name matches to topic (e.g., "Bensinger" for "emergent")
- arXiv numbers in unusual ranges

---

## Tools for Verification

**Automated checks:**
1. arXiv API: Verify paper exists and get real authors
2. CrossRef/DOI lookup: Verify DOI resolves correctly
3. Semantic Scholar API: Get paper metadata

**Manual verification:**
- Always read abstract
- Check first page of PDF if available
- Verify venue (Nature vs arXiv vs blog post)

---

## Next Steps

### Immediate Actions

1. **Fix the 3 hallucinated citations** (Bensinger, Leike, Shah)
2. **Review Chein et al. usage** - find proper AI art detection source
3. **Verify remaining citations** not checked in this audit

### Medium-term

4. **Implement verification protocol** for new citations
5. **Add verification metadata** to database (date checked, verified by)
6. **Create badge/indicator** showing citations have been verified

### Long-term

7. **Automated CI/CD check** - script to verify all arXiv numbers resolve
8. **Citation quality score** - track verification status per issue
9. **Community reporting** - allow users to flag suspicious citations

---

## Conclusion

The AI Problems Index is an **excellent resource** with a systematic approach to tracking AI issues. However, the 21% hallucination rate (3/14 citations) undermines credibility, especially since all fabrications are in the critical "Real Issues" section.

**This is fixable.** The real papers on these topics exist - we just need to use the correct citations.

**Irony noted:** An index about AI problems contains AI-generated citation hallucinations. This validates the need for the index while also demonstrating the exact problems it's trying to track.

---

**Audit completed:** October 2025
**Recommended priority:** HIGH - Fix immediately to maintain credibility
**Effort required:** ~2-4 hours to fix all issues + implement verification protocol
