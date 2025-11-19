#!/bin/bash
# Simple cron job - just invoke Claude to handle merge orchestrator work
# HOME must be set in crontab: HOME=/home/lizthedeveloper_gmail_com

cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation || exit 1

claude "You are the merge orchestrator agent. Your job:

1. Check for pending feature branches that need merging
2. Run: git fetch origin
3. Look for branches like auto/*, merge/*, feature/*
4. For each branch:
   - Try to merge it to main
   - If conflicts: resolve them intelligently
   - If tests fail: fix them
   - If successful: push to main and delete the branch
5. Log everything to logs/merge_orchestrator/

Be autonomous. Make decisions. Complete the merges.

Start now." >> logs/cron_merge.log 2>&1
