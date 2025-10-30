# Citation Fix Summary - Quick Reference

**Date:** October 2025
**Status:** Ready for execution
**Files:**
- Detailed audit: `AI_PROBLEMS_INDEX_CITATION_AUDIT.md`
- Replacement research: `AI_PROBLEMS_INDEX_CITATION_REPLACEMENTS.md`
- SQL fixes: `AI_PROBLEMS_INDEX_SQL_FIXES.sql`

---

## What We Found

**3 Hallucinated Citations in Database:**

| ID | Issue | Fake Citation | Real Replacement |
|----|-------|---------------|------------------|
| 13 | Goal misgeneralization | Shah et al., 2023 (arXiv:2308.10169) | Shah et al., 2022 (arXiv:2210.01790) |
| 14 | Emergent capabilities | Bensinger et al., 2023 (arXiv:2309.00667) | Wei et al., 2022 (arXiv:2206.07682) |
| 15 | Superalignment | Leike et al., 2023 (arXiv:2307.04774) | Burns et al., 2023 (arXiv:2312.09390) |

---

## Quick SQL Fix (Copy & Paste)

```sql
-- Fix #1: Goal Misgeneralization (same authors, correct arXiv)
UPDATE real_issues_sources
SET title = 'Shah et al., 2022', url = 'https://arxiv.org/abs/2210.01790'
WHERE id = 13;

-- Fix #2: Emergent Capabilities (replace fabricated authors)
UPDATE real_issues_sources
SET title = 'Wei et al., 2022', url = 'https://arxiv.org/abs/2206.07682'
WHERE id = 14;

-- Fix #3: Superalignment (Jan Leike IS an author of this one!)
UPDATE real_issues_sources
SET title = 'Burns et al., 2023', url = 'https://arxiv.org/abs/2312.09390'
WHERE id = 15;

-- Verification:
SELECT s.id, i.title as issue, s.title as source, s.url
FROM real_issues_sources s
JOIN real_issues i ON s.issue_id = i.id
WHERE s.id IN (13, 14, 15);
```

---

## How to Run Safely

### Option 1: Transaction (Recommended)
```sql
BEGIN;

-- Run the 3 UPDATE statements here

-- Check results
SELECT * FROM real_issues_sources WHERE id IN (13, 14, 15);

-- If looks good:
COMMIT;

-- If problems:
ROLLBACK;
```

### Option 2: One at a time
Run each UPDATE individually, verify after each one.

---

## Expected Results

After running fixes, you should see:

```
id | issue                          | source             | url
---+--------------------------------+--------------------+----------------------------------
13 | Goal misgeneralization         | Shah et al., 2022  | https://arxiv.org/abs/2210.01790
14 | Emergent capabilities          | Wei et al., 2022   | https://arxiv.org/abs/2206.07682
15 | Time pressure for superalignment | Burns et al., 2023 | https://arxiv.org/abs/2312.09390
```

---

## Verification Checklist

Before running:
- [ ] Backup database or run in transaction
- [ ] Verify URLs work:
  - [ ] https://arxiv.org/abs/2210.01790 ✓
  - [ ] https://arxiv.org/abs/2206.07682 ✓
  - [ ] https://arxiv.org/abs/2312.09390 ✓

After running:
- [ ] Check verification query shows correct data
- [ ] Visit site to confirm citations display correctly
- [ ] Test all 3 arXiv links from the website

---

## What This Fixes

**Before:** 21% hallucination rate (3 out of 14 citations)
**After:** 0% hallucination rate
**Credibility:** Restored - all citations now verifiable
**Irony level:** Reduced (AI safety index no longer citing hallucinated AI papers)

---

## Missing Fix

**Chein et al. 2024** citation not found in `real_issues_sources` table.
- May be in a different table (`non_issues_sources`?)
- Issue: Paper is about TEXT detection, not art
- Fix: Either clarify or replace with real AI art studies

To find it:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE '%source%';

-- Then search for Chein in those tables
```

---

## Contact

Questions? See detailed documentation in:
- `AI_PROBLEMS_INDEX_SQL_FIXES.sql` - Full SQL with comments
- `AI_PROBLEMS_INDEX_CITATION_REPLACEMENTS.md` - All research papers
- `AI_PROBLEMS_INDEX_CITATION_AUDIT.md` - Complete audit report
