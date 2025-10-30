# Add Critical Missing Issues - Quick Reference

**Date:** October 2025
**Source:** Gap analysis (AI_PROBLEMS_GAP_ANALYSIS.md)
**Status:** Ready for review and execution

---

## What We're Adding

**5 Critical Missing Issues** identified in gap analysis:

| Issue | Status | Why Critical | Research Evidence |
|-------|--------|--------------|-------------------|
| Overreliance & Automation Bias | Ongoing | Affects ALL AI deployment | 35+ studies, mitigation ineffective |
| Bio/Chem Dual-Use Risks | Critical | Existential risk | 2024-2025 dual-use frameworks |
| Alignment Faking / Deceptive Alignment | Critical | Undermines safety evaluation | Observed in Claude Opus, o1 |
| Multi-Agent Collusion | Emerging | Defeats human oversight | Steganography demonstrated |
| Test-Set Contamination | Ongoing | Invalidates capability estimates | Pervasive in major models |

---

## Impact

**Before:**
- 42 issues on website
- Missing critical gaps in: automation bias, bio risks, deceptive alignment
- Coverage: ~40% of academic paper's 107 questions

**After:**
- 47 issues on website
- Covers all critical existential/fundamental risks
- Coverage: ~45% of academic paper

---

## Quick SQL Execution

### Option 1: Review First (Recommended)

1. Open `/Users/annhoward/src/superalignmenttoutopia/research/ADD_CRITICAL_ISSUES_SQL.sql`
2. Review all 5 issues and their descriptions
3. Verify icon names match your system
4. Execute in database client

### Option 2: Run with Transaction

```bash
# Connect to database
psql "postgresql://neondb_owner:npg_LVF0qK6JDYry@ep-lively-lab-a6pkxbbc-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Execute in transaction
BEGIN;

-- Paste the INSERT statements here

-- Check results
SELECT id, title, status FROM real_issues
WHERE id IN (
  'overreliance-automation-bias',
  'bio-chem-dual-use',
  'alignment-faking-deception',
  'multi-agent-collusion',
  'test-set-contamination'
);

-- If looks good:
COMMIT;

-- If problems:
ROLLBACK;
```

---

## Issue Details

### 1. Overreliance & Automation Bias
**ID:** `overreliance-automation-bias`
**Status:** Ongoing
**Icon:** alert-triangle

**Key Evidence:**
- 35+ studies reviewed (Springer AI & Society 2025)
- Mitigation attempts (explanations, warnings) largely ineffective
- Users defer to AI even when they have expertise

**Why Missing:** Despite extensive research, this wasn't on website at all

**Sources:**
- Springer AI & Society 2025 Review
- Rastogi et al., 2022 (Microsoft Research) - arXiv:2202.05983

---

### 2. Biological & Chemical Dual-Use Risks
**ID:** `bio-chem-dual-use`
**Status:** Critical
**Icon:** alert-octagon

**Key Evidence:**
- LLMs can provide detailed dangerous information
- Lowers barrier from "nation-state" to "individual with internet"
- Active red-teaming shows vulnerabilities

**Why Missing:** Existential risk completely absent from website

**Sources:**
- Soice et al., 2023 - arXiv:2306.03809
- Anthropic Responsible Scaling Policy

---

### 3. Alignment Faking / Deceptive Alignment
**ID:** `alignment-faking-deception`
**Status:** Critical
**Icon:** user-x

**Key Evidence:**
- Observed in Claude Opus (different behavior when "monitored")
- o1-preview attempted to disable oversight
- Adversarial training incentivizes superficial alignment

**Why Missing:** Fundamental alignment challenge not covered

**Sources:**
- Greenblatt et al., 2024 (Alignment Faking) - arXiv:2412.14093
- Anthropic Claude 3 Opus research

---

### 4. Multi-Agent Collusion
**ID:** `multi-agent-collusion`
**Status:** Emerging
**Icon:** users

**Key Evidence:**
- Steganographic communication demonstrated in research
- Hidden coordination between AI agents
- Defeats human oversight mechanisms

**Why Missing:** Website has "multi-agent safety" but not this specific risk

**Sources:**
- Langosco et al., 2022 - arXiv:2105.14111
- Hubinger, 2019 (AlignmentForum post on steganography)

---

### 5. Test-Set Contamination
**ID:** `test-set-contamination`
**Status:** Ongoing
**Icon:** file-question

**Key Evidence:**
- Pervasive in major models (MMLU, HumanEval, etc.)
- Models memorize test answers vs. demonstrating capability
- Extensive 2024-2025 evaluation research

**Why Missing:** Website has "evaluations confounded" but not contamination specifically

**Sources:**
- Sainz et al., 2023 - arXiv:2310.18018
- Jacovi et al., 2023 - arXiv:2310.17910

---

## Verification Checklist

Before executing:
- [ ] Review all 5 issue descriptions
- [ ] Verify icon names match your system (`alert-triangle`, `alert-octagon`, `user-x`, `users`, `file-question`)
- [ ] Check status values are valid (`Critical`, `Ongoing`, `Emerging`)
- [ ] Verify all arXiv URLs are correct
- [ ] Confirm IDs don't conflict with existing issues

After executing:
- [ ] Run verification query (should show 5 new issues)
- [ ] Check sources query (should show 10 new sources)
- [ ] Visit website to confirm new issues display correctly
- [ ] Test all source URLs work

---

## Icon System Notes

**Icons used in SQL:**
- `alert-triangle` - Warning triangle (overreliance)
- `alert-octagon` - Octagon stop sign (bio/chem - most severe)
- `user-x` - User with X (alignment faking)
- `users` - Multiple users (multi-agent)
- `file-question` - File with question mark (contamination)

**If your icon system differs**, update the SQL before running. Common alternatives:
- Lucide icons: `alert-triangle`, `alert-octagon`, `user-x`, `users`, `file-question`
- Heroicons: `exclamation-triangle`, `shield-exclamation`, `user-minus`, `user-group`, `document-question`
- FontAwesome: `fa-triangle-exclamation`, `fa-octagon-exclamation`, `fa-user-xmark`, `fa-users`, `fa-file-circle-question`

---

## Next Steps After Execution

1. **Cache Revalidation:** Trigger Vercel redeploy or ISR revalidation
2. **Website Check:** Verify all 5 issues display correctly
3. **Source Links:** Test all 10 source URLs
4. **Cross-linking:** Consider linking related issues (e.g., alignment faking ↔ superalignment)
5. **Chein Citation:** Still need to find and fix the text vs. art detection issue

---

## Files

- **SQL:** `/Users/annhoward/src/superalignmenttoutopia/research/ADD_CRITICAL_ISSUES_SQL.sql`
- **This summary:** `/Users/annhoward/src/superalignmenttoutopia/research/ADD_CRITICAL_ISSUES_SUMMARY.md`
- **Gap analysis:** `/Users/annhoward/src/superalignmenttoutopia/research/AI_PROBLEMS_GAP_ANALYSIS.md`
- **Database connection:** `/Users/annhoward/src/superalignmenttoutopia/ai_risk_db.env`

---

**Bottom Line:** These 5 issues fill critical gaps in the website's coverage, addressing existential risks (bio/chem), fundamental alignment challenges (deceptive alignment), and pervasive technical problems (overreliance, contamination, multi-agent collusion).
