#!/bin/bash
for b in $(git branch -r | grep 'claude/'); do
  c=$(git log --oneline HEAD.."$b" 2>/dev/null | wc -l)
  [ "$c" -gt 0 ] && echo "$b: $c commits"
done
