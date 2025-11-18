#!/bin/bash
count=0
for branch in $(git branch -r | grep -E "(auto/worker|auto/researcher)" | head -50); do
  commits=$(git log --oneline HEAD.."$branch" 2>/dev/null | wc -l)
  if [ "$commits" -gt 0 ]; then
    ((count++))
    echo "$branch: $commits commits"
  fi
done
echo ""
echo "Total branches with unique commits: $count"
