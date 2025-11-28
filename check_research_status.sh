#!/bin/bash
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation

grep -r "research/" src/simulation --include="*.ts" | grep -o "research/[a-z_0-9-]*\.md" | sort -u | while read file; do
  if [ -f "$file" ]; then
    last_verified=$(grep "last_verified:" "$file" 2>/dev/null | head -1)
    oldest=$(grep "oldest_source:" "$file" 2>/dev/null | head -1)
    if [ ! -z "$oldest" ]; then
      year=$(echo "$oldest" | grep -o "[0-9]\{4\}" | head -1)
      verified_year=$(echo "$last_verified" | grep -o "202[0-9]" | head -1)
      if [ -z "$verified_year" ] || [ "$verified_year" -lt "2025" ]; then
        echo "$file | oldest: $year | last_verified: $verified_year"
      fi
    fi
  fi
done
