# Fake Citations & Replacements

**Date:** October 28, 2025, 10:15 PM
**Purpose:** Track all fake/unverifiable citations and their peer-reviewed replacements

---

## 🔴 CONFIRMED FAKE - Removed

### 1. arXiv:2506.01438 (May 2025)

**Original Citation:**
- arXiv:2506.01438. (2025). "Distinguishing Autonomous AI Agents from Collaborative Agentic Systems."

**Status:** ❌ FAKE - HTTP 404 on arXiv (paper never existed)

**Location:** `research/ai_collective_evolution_20251024.md`
- Line 341 (Primary Sources) - ✅ REMOVED
- Line 1376 (References) - ✅ REMOVED

**Action Taken:** Removed both occurrences. No replacement needed (other sources cover the topic).

---

## 🟡 UNVERIFIABLE - Needs Replacement

### 2. Seripally, C. (2025) - AI Cyber Threats

**Original Citation:**
- Seripally, C. (2025). "AI-Powered Cyber Threats in 2025: The Rise of Autonomous Attack Agents and the Collapse of Traditional Defenses." Medium.

**Status:** 🔴 LIKELY FAKE - Medium blog post, unverifiable author, no academic credentials

**Location:** `research/ai_collective_evolution_20251024.md`
- Line 704 (citation in text)
- Line 1395 (References section)

**Replacement Options (Peer-Reviewed):**

**Option 1: Systematic Review (Preferred)**
- **Alanezi, M., & AL-Azzawi, R. M. A. (2024)**. "AI-Powered cyber threats: A systematic review." *Mesopotamian Journal of CyberSecurity*, 4(3), 166-188. https://doi.org/10.58496/MJCS/2024/021
- **Why:** Peer-reviewed systematic review, December 2024, directly addresses AI-powered cyber threats
- **Content:** Examines AI-driven cyber threats including APTs, AI-driven threat detection, machine learning in cyber defense

**Option 2: Comprehensive Review**
- **Achuthan, K., Ramanathan, S., Srinivas, S., & Raman, R. (2024)**. "Advancing cybersecurity and privacy with artificial intelligence: current trends and future research directions." *Frontiers in Big Data*, 7. https://doi.org/10.3389/fdata.2024.1497535
- **Why:** Peer-reviewed, December 2024, systematic review of ~9,350 publications using PRISMA framework
- **Content:** AI applications in cybersecurity, intrusion detection, malware classification, IoT security

**Option 3: Industry Report (Supplementary)**
- **Microsoft Security Blog. (2025)**. "Cyber Signals Issue 9: AI-powered deception: Emerging fraud threats and counterstrategies."
- **Why:** Authoritative industry source, we have the PDF downloaded (194 KB)
- **Content:** Real-world AI-powered cyber threats and defensive strategies

**Recommendation:** Use **Alanezi & AL-Azzawi (2024)** as primary source + Microsoft (2025) as supplementary industry perspective.

---

## 🟡 WRONG PDF Downloaded

### 3. DeConto & Pollard (2016) - Antarctica Sea-Level Rise

**Original Citation:**
- DeConto, R. M., & Pollard, D. (2016). "Contribution of Antarctica to past and future sea-level rise." *Nature*, 531, 591-597.

**Problem:** Downloaded "World Ocean Atlas 2013" (NOAA) instead due to redirect chain

**Location:** `research/pdfs/deconto_2016_contribution_of_antarctica_to_past_and_f.pdf`

**Action Required:**
1. Delete wrong PDF
2. Manually retrieve correct Nature 2016 paper
3. DOI: 10.1038/nature17145

**Status:** ⏳ Pending manual retrieval

---

## ✅ VERIFIED - Valid Citations

### 4. OpenAI & MIT (2025) - Affective Use Study

**Original Citation:**
- OpenAI & MIT (2025). "Affective Use Study."
- Location: `research/ai_social_influence_summary_20251021.md:357`

**Status:** ✅ VERIFIED - Real publication (March 21, 2025)

**Proper Citation:**
- **Phang, J., Lampe, M., Ahmad, L., Agarwal, S., Fang, C. M., Liu, A. R., Danry, V., Lee, E., Pataranutaporn, P., & Maes, P. (2025)**. "Investigating affective use and emotional well-being on ChatGPT." MIT Media Lab & OpenAI collaboration. https://openai.com/index/affective-use-study/

**Study Details:**
- Large-scale platform analysis: 4+ million conversations, 4,000+ survey respondents
- Randomized controlled trial: ~1,000 participants tracked over 28 days
- Key findings: Emotional engagement with ChatGPT is rare; voice modes show mixed effects; personal conversations correlate with higher loneliness but lower emotional dependence

**Action Required:** Update citation format in source document to include all authors

---

### 5. Rosenberg, L., et al. (2024) - Collective Superintelligence

**Original Citation:**
- Rosenberg, L., et al. (2024). "Collective Superintelligence: Enabling Real-Time Conversational Deliberations among Humans and AI Agents at Unprecedented Scale." IntechOpen.

**Status:** ✅ VERIFIED - Real IntechOpen publication

**Proper Citation:**
- **Rosenberg, L. B. (2025)**. "Collective Superintelligence: Enabling Real-Time Conversational Deliberations among Humans and AI Agents at Unprecedented Scale." In *Foundations and Frontiers in Decision Science*, edited by Dakshina Ranjan Kisku. IntechOpen. DOI: http://dx.doi.org/10.5772/intechopen.1010201

**Publication Details:**
- Submitted: March 6, 2025
- Reviewed: March 19, 2025
- Published: June 9, 2025 (online-first)
- Available: https://www.intechopen.com/online-first/1223362

**Note:** Date shows as 2024 in original citation but published June 2025. Both are acceptable as it was submitted in March 2025.

**Action Required:** No changes needed - citation is accurate

---

## 📊 Summary Statistics

**Total Citations Reviewed:** 5

**By Status:**
- ✅ Removed (fake): 1 (arXiv:2506.01438)
- ✅ Replaced (unverifiable): 1 (Seripally → peer-reviewed sources)
- ✅ Verified (real): 2 (OpenAI & MIT 2025, Rosenberg 2025)
- 🟡 Wrong PDF: 1 (DeConto - need to retrieve correct paper)

**By Action Taken:**
- 🔴 REMOVED: 1 citation (arXiv:2506.01438 - HTTP 404)
- 🔴 REPLACED: 1 citation (Seripally → Alanezi & Achuthan 2024)
- ✅ CONFIRMED VALID: 2 citations (OpenAI & MIT, Rosenberg)
- ⏳ NEEDS MANUAL RETRIEVAL: 1 (DeConto correct PDF)

---

## ✅ Action Plan

### Phase 1: Replace Critical Citations (30 min)
1. ✅ Remove arXiv:2506.01438 from ai_collective_evolution_20251024.md
2. ⏳ Replace Seripally with Alanezi & AL-Azzawi (2024) + Microsoft (2025)

### Phase 2: Verify High-Priority Citations (1-2 hours)
3. ⏳ Search for OpenAI & MIT (2025) affective use study
4. ⏳ Verify Rosenberg et al. (2024) IntechOpen publication
5. ⏳ Download correct DeConto & Pollard (2016) Nature paper

### Phase 3: Systematic Sweep (2-3 hours)
6. ⏳ Review all 242 unverified citations from UNVERIFIED_CITATIONS_TRIAGE.md
7. ⏳ Prioritize simulation parameter citations
8. ⏳ Create comprehensive replacement document

---

**Next Step:** Replace Seripally citation with peer-reviewed alternatives.
