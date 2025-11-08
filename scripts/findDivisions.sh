#!/bin/bash
for f in src/simulation/*.ts; do
  count=$(grep -o '/' "$f" | wc -l)
  echo "$count $(basename "$f")"
done | sort -rn
