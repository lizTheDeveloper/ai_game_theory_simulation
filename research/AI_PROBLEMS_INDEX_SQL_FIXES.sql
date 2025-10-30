-- AI Problems Index - Citation Fixes
-- Date: October 2025
-- Purpose: Replace 3 hallucinated citations with real research
--
-- ⚠️ REVIEW CAREFULLY BEFORE RUNNING ⚠️
-- These UPDATE statements will modify production data

-- =============================================================================
-- DATABASE SCHEMA NOTES (for reference)
-- =============================================================================
-- real_issues_sources table:
--   - id: serial primary key
--   - issue_id: varchar(255) FK to real_issues(id)
--   - title: varchar(255) - Citation display text (e.g., "Wei et al., 2022")
--   - url: text - Link to paper/source
--   - display_order: int - Sort order
--
-- Found 3 fake citations:
--   ID  | Issue ID                      | Current Title          | Current URL
--   ----+-------------------------------+------------------------+----------------------------------
--   13  | goal-misgeneralization        | Shah et al., 2023      | https://arxiv.org/abs/2308.10169
--   14  | emergent-capabilities         | Bensinger et al., 2023 | https://arxiv.org/abs/2309.00667
--   15  | superalignment-time-pressure  | Leike et al., 2023     | https://arxiv.org/abs/2307.04774
-- =============================================================================

-- =============================================================================
-- FIX #1: Goal Misgeneralization (EASY FIX - same authors, wrong arXiv number)
-- =============================================================================
-- CURRENT: "Shah et al., 2023" pointing to arXiv:2308.10169 (particle swarm optimization)
-- CORRECT: Shah et al., 2022 actually wrote arXiv:2210.01790 (goal misgeneralization)
--
-- This is likely a typo/hallucination - the authors ARE real, just wrong paper

UPDATE real_issues_sources
SET
    title = 'Shah et al., 2022',
    url = 'https://arxiv.org/abs/2210.01790'
WHERE id = 13;

-- Verification query (run after update):
-- SELECT * FROM real_issues_sources WHERE id = 13;


-- =============================================================================
-- FIX #2: Emergent Capabilities (FABRICATED AUTHORS)
-- =============================================================================
-- CURRENT: "Bensinger et al., 2023" (FAKE AUTHORS - does not exist)
-- CORRECT: Wei et al., 2022 - "Emergent Abilities of Large Language Models"
--
-- This was a complete hallucination of author names

UPDATE real_issues_sources
SET
    title = 'Wei et al., 2022',
    url = 'https://arxiv.org/abs/2206.07682'
WHERE id = 14;

-- Verification query (run after update):
-- SELECT * FROM real_issues_sources WHERE id = 14;


-- =============================================================================
-- FIX #3: Superalignment Time Pressure (CRITICAL - WRONG TOPIC ENTIRELY)
-- =============================================================================
-- CURRENT: "Leike et al., 2023" pointing to arXiv:2307.04774 (mathematical epidemiology!)
-- CORRECT: Burns et al., 2023 - "Weak-to-Strong Generalization" (Jan Leike IS an author!)
--
-- ALTERNATIVE: Could use OpenAI's official announcement instead
-- URL: https://openai.com/index/introducing-superalignment/
--
-- This issue is marked as "Critical" on the site, so using the technical paper

UPDATE real_issues_sources
SET
    title = 'Burns et al., 2023',
    url = 'https://arxiv.org/abs/2312.09390'
WHERE id = 15;

-- Verification query (run after update):
-- SELECT * FROM real_issues_sources WHERE id = 15;


-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these AFTER updates to confirm changes:

-- Check all 3 fixed citations:
SELECT
    s.id,
    i.id as issue_id,
    i.title as issue_title,
    i.status as severity,
    s.title as source_title,
    s.url
FROM real_issues_sources s
JOIN real_issues i ON s.issue_id = i.id
WHERE s.id IN (13, 14, 15)
ORDER BY s.id;

-- Expected results after fixes:
--  id | issue_id                      | issue_title                                 | severity | source_title       | url
-- ----+-------------------------------+---------------------------------------------+----------+--------------------+----------------------------------
--  13 | goal-misgeneralization        | Loss of control from goal misgeneralization | Emerging | Shah et al., 2022  | https://arxiv.org/abs/2210.01790
--  14 | emergent-capabilities         | Emergent capabilities unpredictability      | Ongoing  | Wei et al., 2022   | https://arxiv.org/abs/2206.07682
--  15 | superalignment-time-pressure  | Time pressure for superalignment            | Critical | Burns et al., 2023 | https://arxiv.org/abs/2312.09390


-- =============================================================================
-- ALTERNATIVE OPTIONS
-- =============================================================================

-- ALTERNATIVE FOR #3 (Superalignment):
-- If you prefer to cite the official OpenAI announcement instead:
/*
UPDATE real_issues_sources
SET
    title = 'OpenAI Superalignment Announcement',
    url = 'https://openai.com/index/introducing-superalignment/'
WHERE id = 15;
*/

-- ADDITIONAL OPTION FOR #3 (Superalignment):
-- Add BOTH sources (official announcement + technical paper):
/*
-- First update existing source to Burns paper:
UPDATE real_issues_sources
SET title = 'Burns et al., 2023', url = 'https://arxiv.org/abs/2312.09390'
WHERE id = 15;

-- Then insert OpenAI announcement as additional source:
INSERT INTO real_issues_sources (issue_id, title, url, display_order)
VALUES (
    'superalignment-time-pressure',
    'OpenAI Superalignment Announcement',
    'https://openai.com/index/introducing-superalignment/',
    2
);
*/


-- =============================================================================
-- NOTES FOR MISSING FIX: AI Art Detection (Chein et al. 2024)
-- =============================================================================
-- The Chein et al. 2024 citation (s41598-024-76218-y) was not found in real_issues_sources.
-- It may be in a different table (non_issues_sources or similar).
--
-- Issue: Paper is about AI TEXT detection, not art
-- Fix needed: Either clarify it's about text OR replace with actual AI art studies
--
-- Suggested replacements:
-- - Ha et al., 2024: 59% accuracy for general public detecting AI art
-- - Visual Turing Test studies showing 60-62% accuracy
-- - Keep Astral Codex Ten source (it's legitimate)
--
-- To find and fix Chein citation, run:
-- SELECT * FROM information_schema.tables WHERE table_name LIKE '%source%';
-- Then search those tables for Chein or the DOI


-- =============================================================================
-- SAFETY CHECKS BEFORE RUNNING
-- =============================================================================
-- ✓ Backup database or use a transaction
-- ✓ Verify all arXiv URLs actually work:
--   - https://arxiv.org/abs/2210.01790 (Shah)
--   - https://arxiv.org/abs/2206.07682 (Wei)
--   - https://arxiv.org/abs/2312.09390 (Burns)
-- ✓ Review verification queries above
-- ✓ Consider running in a transaction first:

/*
BEGIN;
-- Run the 3 UPDATE statements here
-- Check results with verification query
-- If looks good: COMMIT;
-- If problems: ROLLBACK;
*/


-- =============================================================================
-- EXECUTION PLAN
-- =============================================================================
-- Option A: Run all 3 updates at once (fast, but less safe)
--   Just run the 3 UPDATE statements

-- Option B: Run one at a time with verification (recommended)
--   1. Run UPDATE for Shah (ID 13)
--   2. Run verification query
--   3. If good, run UPDATE for Wei (ID 14)
--   4. Run verification query
--   5. If good, run UPDATE for Burns (ID 15)
--   6. Run final verification query

-- Option C: Use transaction (safest)
--   1. BEGIN;
--   2. Run all 3 UPDATEs
--   3. Run verification query
--   4. If results look correct: COMMIT;
--   5. If anything wrong: ROLLBACK;
